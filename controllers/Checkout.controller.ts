// controllers/Checkout.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PoolClient } from 'pg';
import axios from 'axios';
import pool from '../lib/db';
import SalesOrder, { ItemData } from '../models/salesOrder.model';
import Invoice from '../models/invoice.model';
import { AuthenticatedRequest } from '../lib/middleware/auth';

// Import Cart model (assumed to exist)
import * as Cart from '../models/cart.model';

// Types
export interface CheckoutRequest extends AuthenticatedRequest {
  body: {
    selectedProductIds: number[];
    promoData: {
      amount?: number;
    };
  };
}

export interface MidtransNotification {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  transaction_id: string;
  transaction_time: string;
  settlement_time?: string;
  payment_type: string;
  issuer?: string;
  gross_amount: string;
  currency: string;
  acquirer?: string;
}

export interface MidtransTransactionParams {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  credit_card: {
    secure: boolean;
  };
  customer_details: {
    user_id: string;
    email: string;
    phone: string;
  };
  expiry: {
    start_time: string;
    unit: string;
    duration: number;
  };
  callbacks: {
    finish: string;
  };
}

export interface MidtransResponse {
  token: string;
  redirect_url: string;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  data?: {
    orderNumber: string;
    snapToken: string;
    redirectUrl: string;
    orderId: number;
    items: any[];
    expiredAt: Date;
  };
}

export interface OrderStatusResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface UserOrdersResponse {
  success: boolean;
  message?: string;
  data?: {
    orders: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

class CheckoutController {
  /* ────────────────────────────────────────────────────────────────────── */
  /* 0. Ping – dibutuhkan Midtrans dashboard                                */
  /* ────────────────────────────────────────────────────────────────────── */
  static pingMidtrans(req: NextApiRequest, res: NextApiResponse): NextApiResponse {
    return res.status(200).send('OK');               // Midtrans expects HTTP-200
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 1. POST /checkout/process                                              */
  /* ────────────────────────────────────────────────────────────────────── */
  static async processCheckout(req: CheckoutRequest, res: NextApiResponse<CheckoutResponse>) {
    const client: PoolClient = await pool.connect();

    // ─── helper untuk stempel waktu ───────────────────────────────────────
    const t0 = process.hrtime.bigint();      // titik awal
    let last = t0;                          // penanda segmen sebelumnya
    const lap = (label: string) => {
      const now = process.hrtime.bigint();
      const msSinceStart = Number(now - t0) / 1e6;   // total   sejak awal
      const msLap = Number(now - last) / 1e6;   // durasi  segmen ini
      last = now;
      console.log(
        `[LATENCY] ${label.padEnd(15)} | +${msLap.toFixed(2).padStart(7)} ms | `
        + `Σ ${msSinceStart.toFixed(2).padStart(8)} ms`
      );
    };

    try {
      /* 1-a. Validasi keranjang ▸────────────────────────────────────────── */
      const userId = req.user!.id;
      console.log(userId);
      const { selectedProductIds = [], promoData = {} } = req.body;
      if (!selectedProductIds.length)
        return res.status(400).json({ success: false, message: 'No products selected' });
      const { cart, products } = await Cart.getSelectedItems(userId, selectedProductIds);
      lap('load-cart');                                    // ←─ LOG #1

      /* 1-b. Mulai transaksi DB ▸────────────────────────────────────────── */
      await client.query('BEGIN');

      const orderNumber = await SalesOrder.generateOrderNumber('000', client);
      lap('gen-orderNo');                                  // ←─ LOG #2

      const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1_000);
      const orderId = await SalesOrder.createHeader(
        { orderNumber, userId, expiredAt }, client);
      lap('insert-header');                                // ←─ LOG #3

      /* 1-d. Siapkan array item */
      const taxPct = 0.11;
      const promo1 = Number(promoData.amount || 0);
      const itemsData: ItemData[] = products
        .filter((p: any) => selectedProductIds.includes(p.product_id))
        .map((it: any) => {
          const itemPrice = Number(it.current_price);
          const totalPrice = itemPrice * it.quantity;
          const tax = totalPrice * taxPct;
          const totalAmount = totalPrice - promo1 + tax;
          return {
            product_id: it.product_id,
            quantity: it.quantity,
            item_price: itemPrice,
            total_price: totalPrice,
            tax,
            total_amount: totalAmount
          };
        });
      lap('prep-items');                                   // ←─ LOG #4

      const orderItems = await SalesOrder.bulkInsertItems(orderId, itemsData, client);
      lap('insert-items');                                 // ←─ LOG #5

      /* 1-e. Kurangi stok – dengan lock baris (SELECT … FOR UPDATE) */
      const ids = itemsData.map(i => i.product_id);
      const qtys = itemsData.map(i => i.quantity);

      // lock semua produk yang mau dikurangi stoknya
      await client.query(`
        SELECT product_id, stock
          FROM products
         WHERE product_id = ANY($1::int[])
         FOR UPDATE
      `, [ids]);
      lap('lock-stock');

      // lalu update stok dan cek rowCount
      const upd = await client.query(`
        UPDATE products AS p
           SET stock = p.stock - sub.qty,
               updated_at = NOW()
          FROM (
            SELECT UNNEST($1::int[]) AS product_id,
                   UNNEST($2::int[]) AS qty
          ) sub
         WHERE p.product_id = sub.product_id
           AND p.stock >= sub.qty
      `, [ids, qtys]);

      if (upd.rowCount !== ids.length) {
        throw new Error('Stock tidak mencukupi untuk beberapa item');
      }
      lap('update-stock');                                // ←─ LOG #6

      /* 1-f. Bersihkan keranjang ▸───────────────────────────────────────── */
      await client.query(`
        WITH del AS (
          DELETE FROM cart_items
           WHERE cart_id   = $1
             AND product_id = ANY($2::int[])
           RETURNING 1        -- optional; hanya agar CTE tidak kosong
        )
        UPDATE cart
           SET updated_at = NOW()
         WHERE id = $1
      `, [cart.id, selectedProductIds]);
      lap('clear-cart');                                  // ←─ LOG #7

      /* 1-g. Midtrans Snap ▸─────────────────────────────────────────────── */
      const grossAmount = itemsData.reduce((s, r) => s + r.total_amount, 0);
      const { snapToken, midtransUrl } =
        await CheckoutController.createMidtransTransaction(orderNumber, grossAmount, userId);
      lap('midtrans');                                     // ←─ LOG #8

      /* 1-h. Simpan token/url ▸──────────────────────────────────────────── */
      await client.query(`
        UPDATE sales_order_header
           SET midtrans_token = $1,
               midtrans_url   = $2,
               updated_at     = NOW()
         WHERE order_id = $3`, [snapToken, midtransUrl, orderId]);
      lap('save-token');                                   // ←─ LOG #9

      await client.query('COMMIT');
      lap('commit');                                       // ←─ LOG #10

      return res.json({
        success: true,
        message: 'Checkout OK',
        data: {
          orderNumber,
          snapToken,
          redirectUrl: midtransUrl,
          orderId,
          items: orderItems,
          expiredAt
        }
      });

    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('Checkout error:', err);
      return res.status(500).json({ success: false, message: err.message });
    } finally {
      client.release();
      lap('done');        // ←─ LOG total hingga finally
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 2. Membuat transaksi Midtrans Snap                                    */
  /* ────────────────────────────────────────────────────────────────────── */
  static async createMidtransTransaction(
    orderNumber: string, 
    grossAmount: number, 
    userId: string
  ): Promise<{ snapToken: string; midtransUrl: string }> {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) throw new Error('MIDTRANS_SERVER_KEY not set');

    const params: MidtransTransactionParams = {
      transaction_details: {
        order_id: orderNumber,
        gross_amount: Math.round(grossAmount)
      },
      credit_card: { secure: true },
      customer_details: {
        user_id: userId,
        email: `${userId}@example.com`,
        phone: '08111222333'
      },
      expiry: {
        start_time: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' +0000',
        unit: 'minute',
        duration: 1440
      },
      callbacks: { finish: '' }
    };

    const { data }: { data: MidtransResponse } = await axios.post(
      'https://app.sandbox.midtrans.com/snap/v1/transactions',
      params,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(serverKey).toString('base64')}`
        }
      }
    );
    return { snapToken: data.token, midtransUrl: data.redirect_url };
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 3. Callback Midtrans                                                  */
  /* ────────────────────────────────────────────────────────────────────── */
  static async handleMidtransCallback(
    req: NextApiRequest, 
    res: NextApiResponse
  ) {
    const client: PoolClient = await pool.connect();
    try {
      const n: MidtransNotification = req.body;
      console.log('Midtrans notif:', n);

      // 1. Tentukan payment_status
      const state = n.transaction_status;
      const payStatus =
        state === 'capture'
          ? (n.fraud_status === 'challenge' ? 'challenge' : 'success')
          : state === 'settlement' ? 'success'
            : ['cancel', 'deny', 'expire'].includes(state) ? 'failed'
              : 'pending';

      await client.query('BEGIN');

      // 2. Update header → ambil order_id
      const upd = await client.query(
        `UPDATE sales_order_header
            SET payment_status = $1, updated_at = NOW()
          WHERE order_number = $2
        RETURNING order_id, user_id`,
        [payStatus, n.order_id]
      );
      if (!upd.rows.length) throw new Error('Order not found');
      const { order_id: orderId, user_id: userId } = upd.rows[0];

      // 3. Jika gagal → restore stock
      if (payStatus === 'failed') {
        await CheckoutController.restoreStock(n.order_id);
      }

      // 4. Jika sukses → invoice + entitlements permanen
      if (payStatus === 'success') {
        // A. Buat invoice jika belum ada
        const already = await Invoice.existsForOrder(orderId, client);
        if (!already) {
          const invoiceNumber = await Invoice.generateInvoiceNumber('000', client);
          await Invoice.create({
            orderId,
            invoiceNumber,
            midtrans_transaction_id: n.transaction_id,
            transaction_time: n.transaction_time,
            settlement_time: n.settlement_time,
            payment_type: n.payment_type,
            issuer: n.issuer,
            amount: Number(n.gross_amount),
            fraud_status: n.fraud_status,
            currency: n.currency,
            acquirer: n.acquirer
          }, client);

          // B. Ambil product_id dari order items
          const items = await client.query(
            `SELECT product_id
               FROM sales_order_item
              WHERE order_id = $1`,
            [orderId]
          );
          const productIds = items.rows.map((r: any) => r.product_id);

          if (productIds.length) {
            // 1) Course entitlements (permanen)
            const courses = await client.query(
              `SELECT DISTINCT course_id
                 FROM product_courses
                WHERE product_id = ANY($1::int[])`,
              [productIds]
            );
            for (const { course_id } of courses.rows) {
              await client.query(
                `INSERT INTO course_entitlements
                   (user_id, course_id, granted_at, expires_at)
                 VALUES ($1, $2, NOW(), NULL)
                 ON CONFLICT (user_id, course_id)
                 DO UPDATE
                   SET granted_at = EXCLUDED.granted_at,
                       expires_at = NULL`,
                [userId, course_id]
              );
            }

            // 2) Exam schedule entitlements (permanen)
            const exams = await client.query(
              `SELECT DISTINCT exam_schedule_id
                 FROM product_exam_schedules
                WHERE product_id = ANY($1::int[])`,
              [productIds]
            );
            for (const { exam_schedule_id } of exams.rows) {
              await client.query(
                `INSERT INTO exam_schedule_entitlements
                   (user_id, exam_schedule_id, granted_at, expires_at)
                 VALUES ($1, $2, NOW(), NULL)
                 ON CONFLICT (user_id, exam_schedule_id)
                 DO UPDATE
                   SET granted_at = EXCLUDED.granted_at,
                       expires_at = NULL`,
                [userId, exam_schedule_id]
              );
            }
          }
        }
      }

      await client.query('COMMIT');
      return res.json({ success: true, message: 'Callback processed' });
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('Callback error:', err);
      return res.status(500).json({ success: false, message: err.message });
    } finally {
      client.release();
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* Helper: kembalikan stok bila gagal                                    */
  /* ────────────────────────────────────────────────────────────────────── */
  static async restoreStock(orderNumber: string) {
    const items = await SalesOrder.getItemsByOrderNumber(orderNumber);
    for (const it of items) {
      await pool.query(
        `UPDATE products
            SET stock = stock + $1,
                updated_at = NOW()
          WHERE product_id = $2`,
        [it.quantity, it.product_id]
      );
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 4. GET /checkout/order/:orderNumber                                   */
  /* ────────────────────────────────────────────────────────────────────── */
  static async getOrderStatus(
    req: AuthenticatedRequest, 
    res: NextApiResponse<OrderStatusResponse>
  ) {
    try {
      const { orderNumber } = req.query;
      const userId = req.user!.id;

      const summary = await SalesOrder.getOrderSummary(orderNumber as string);
      if (!summary)
        return res.status(404).json({ success: false, message: 'Order not found' });
      if (summary.user_id !== userId)
        return res.status(403).json({ success: false, message: 'Forbidden' });

      return res.json({ success: true, data: summary });

    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getAllTransactions(
    req: AuthenticatedRequest, 
    res: NextApiResponse
  ) {
    try {
      const userId = req.user!.id;
      const transactions = await SalesOrder.getAllByUserId(userId);
      return res.json({ success: true, data: transactions });
    } catch (err: any) {
      console.error('getAllTransactions error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  
  /* ────────────────────────────────────────────────────────────────────── */
  /* 5. GET /checkout/orders                                               */
  /* ────────────────────────────────────────────────────────────────────── */
  static async getUserOrders(
    req: AuthenticatedRequest, 
    res: NextApiResponse<UserOrdersResponse>
  ) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);

      const orders = await SalesOrder.findByUserId(
        userId, limit, (page - 1) * limit);

      return res.json({
        success: true,
        data: {
          orders,
          pagination: { page, limit, total: orders.length }
        }
      });

    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

}



export default CheckoutController;

