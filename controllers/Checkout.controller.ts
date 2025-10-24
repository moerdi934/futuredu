// controllers/Checkout.controller.ts - Updated with Coin Rewards Support
import { NextApiRequest, NextApiResponse } from 'next';
import { PoolClient } from 'pg';
import axios from 'axios';
import pool from '../lib/db';
import SalesOrder, { ItemData } from '../models/salesOrder.model';
import Invoice from '../models/invoice.model';
import UserCoinModel from '../models/UserCoin.model'; // NEW
import CoinController from './Coin.controller'; // NEW
import { AuthenticatedRequest } from '../lib/middleware/auth';
import PQueue from 'p-queue';

const checkoutQueue = new PQueue({
  concurrency: 1,
  timeout: 30000,
  throwOnTimeout: true
});

// Import Cart model functions directly
import * as Cart from '../models/cart.model';

// Types (keeping existing interfaces)
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

// Create a server-safe axios instance
const serverAxios = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

class CheckoutController {
  /* ────────────────────────────────────────────────────────────────────── */
  /* 0. Ping – dibutuhkan Midtrans dashboard                                */
  /* ────────────────────────────────────────────────────────────────────── */
  static pingMidtrans(req: NextApiRequest, res: NextApiResponse): NextApiResponse {
    return res.status(200).send('OK');
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 1. POST /checkout/process - Enhanced with Queue, Class and Coin Support */
  /* ────────────────────────────────────────────────────────────────────── */
  static async processCheckout(req: CheckoutRequest, res: NextApiResponse<CheckoutResponse>) {
    return checkoutQueue.add(async () => {
      return await CheckoutController._processCheckoutInternal(req, res);
    });
  }

  private static async _processCheckoutInternal(req: CheckoutRequest, res: NextApiResponse<CheckoutResponse>) {
    const client: PoolClient = await pool.connect();

    const t0 = process.hrtime.bigint();
    let last = t0;
    const lap = (label: string) => {
      const now = process.hrtime.bigint();
      const msSinceStart = Number(now - t0) / 1e6;
      const msLap = Number(now - last) / 1e6;
      last = now;
      console.log(
        `[LATENCY] ${label.padEnd(15)} | +${msLap.toFixed(2).padStart(7)} ms | `
        + `Σ ${msSinceStart.toFixed(2).padStart(8)} ms`
      );
    };

    try {
      /* 1-a. Validasi keranjang ▸────────────────────────────────────────── */
      const userId = req.user!.id;
      console.log('Processing checkout for user:', userId);
      
      const { selectedProductIds = [], promoData = {} } = req.body;
      
      if (!selectedProductIds || !Array.isArray(selectedProductIds) || selectedProductIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No products selected for checkout' 
        });
      }

      // Get selected items from cart with proper client parameter
      const { cart, products } = await Cart.getSelectedItems(userId, selectedProductIds, client);
      
      if (!cart || !products || products.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No valid items found in cart' 
        });
      }

      lap('load-cart');

      /* 1-b. Validate and get detailed product info (including classes and coins) ▸── */
      const productDetails = await CheckoutController.getProductDetails(selectedProductIds, client);
      
      if (productDetails.length !== products.length) {
        throw new Error('Some products are no longer available');
      }

      // Check for class-specific validations
      for (const product of productDetails) {
        if (product.type === 13) { // Class product
          // Check if class has started
          if (product.class_real_start_datetime) {
            throw new Error(`Class "${product.name}" has already started and cannot be purchased`);
          }
          
          // Check if user is already enrolled
          if (product.class_student_list && product.class_student_list.includes(parseInt(userId))) {
            throw new Error(`You are already enrolled in class "${product.name}"`);
          }
        }
      }

      lap('validate-products');

      /* 1-c. Mulai transaksi DB ▸────────────────────────────────────────── */
      await client.query('BEGIN');

      const orderNumber = await SalesOrder.generateOrderNumber('000', client);
      lap('gen-orderNo');

      // Set checkout expiry to 30 minutes
      const expiredAt = new Date(Date.now() + 30 * 60 * 1000);
      const orderId = await SalesOrder.createHeader(
        { orderNumber, userId, expiredAt }, 
        client
      );
      lap('insert-header');

      /* 1-d. Siapkan array item dengan validasi stok real-time ▸─────────── */
      const taxPct = 0.11;
      const promo1 = Number(promoData.amount || 0);
      
      const itemsData: ItemData[] = [];
      const stockUpdates: { productId: number; quantity: number }[] = [];

      for (const item of products) {
        const productDetail = productDetails.find(p => p.product_id === item.product_id);
        if (!productDetail) {
          throw new Error(`Product ${item.product_id} not found`);
        }

        const itemPrice = Number(item.current_price) || 0;
        const quantity = Number(item.quantity) || 1;
        
        // Real-time stock check with row locking
        const stockCheckResult = await client.query(`
          SELECT product_id, stock, type, is_stackable
          FROM products
          WHERE product_id = $1
          FOR UPDATE
        `, [item.product_id]);

        if (stockCheckResult.rows.length === 0) {
          throw new Error(`Product ${item.product_id} no longer exists`);
        }

        const currentStock = stockCheckResult.rows[0].stock;
        const productType = stockCheckResult.rows[0].type;
        const isStackable = stockCheckResult.rows[0].is_stackable;

        // Check stackable constraint
        if (!isStackable && quantity > 1) {
          throw new Error(`Product "${productDetail.name}" can only be purchased once. Please adjust quantity to 1.`);
        }

        if (currentStock < quantity) {
          if (productType === 13) { // Class products
            throw new Error(`Not enough slots available for class "${productDetail.name}". Available: ${currentStock}, Requested: ${quantity}`);
          } else if (productType === 15) { // Coin topup products
            throw new Error(`Not enough coin packages available for "${productDetail.name}". Available: ${currentStock}, Requested: ${quantity}`);
          } else {
            throw new Error(`Not enough stock for product "${productDetail.name}". Available: ${currentStock}, Requested: ${quantity}`);
          }
        }

        const totalPrice = itemPrice * quantity;
        const tax = totalPrice * taxPct;
        const totalAmount = Math.max(0, totalPrice - promo1 + tax);
        
        itemsData.push({
          product_id: item.product_id,
          quantity: quantity,
          item_price: itemPrice,
          total_price: totalPrice,
          tax: tax,
          total_amount: totalAmount
        });

        stockUpdates.push({
          productId: item.product_id,
          quantity: quantity
        });
      }

      if (itemsData.length === 0) {
        throw new Error('No valid items to process');
      }

      lap('prep-items');

      const orderItems = await SalesOrder.bulkInsertItems(orderId, itemsData, client);
      lap('insert-items');

      /* 1-e. Update stock immediately (reserved during checkout) ▸─────────── */
      for (const update of stockUpdates) {
        const stockUpdateResult = await client.query(`
          UPDATE products 
          SET stock = stock - $1,
              updated_at = NOW()
          WHERE product_id = $2 AND stock >= $1
          RETURNING stock
        `, [update.quantity, update.productId]);

        if (stockUpdateResult.rowCount === 0) {
          throw new Error(`Failed to reserve stock for product ${update.productId}`);
        }
      }
      lap('update-stock');

      /* 1-f. Bersihkan keranjang ▸───────────────────────────────────────── */
      await client.query(`
        DELETE FROM cart_items
        WHERE cart_id = $1
          AND product_id = ANY($2::int[])
      `, [cart.id, selectedProductIds]);

      await client.query(`
        UPDATE cart
        SET updated_at = NOW()
        WHERE id = $1
      `, [cart.id]);
      lap('clear-cart');

      /* 1-g. Midtrans Snap ▸─────────────────────────────────────────────── */
      const grossAmount = itemsData.reduce((sum, item) => sum + item.total_amount, 0);
      
      if (grossAmount <= 0) {
        throw new Error('Invalid total amount');
      }

      const { snapToken, midtransUrl } = await CheckoutController.createMidtransTransaction(
        orderNumber, 
        grossAmount, 
        userId
      );
      lap('midtrans');

      /* 1-h. Simpan token/url ▸──────────────────────────────────────────── */
      await client.query(`
        UPDATE sales_order_header
        SET midtrans_token = $1,
            midtrans_url = $2,
            updated_at = NOW()
        WHERE order_id = $3
      `, [snapToken, midtransUrl, orderId]);
      lap('save-token');

      await client.query('COMMIT');
      lap('commit');

      return res.json({
        success: true,
        message: 'Checkout processed successfully. You have 30 minutes to complete payment.',
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
      console.error('Checkout error:', err);
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Rollback error:', rollbackErr);
      }
      
      return res.status(500).json({ 
        success: false, 
        message: err.message || 'Checkout failed' 
      });
    } finally {
      client.release();
      lap('done');
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* Helper: Get detailed product information including class and coin data  */
  /* ────────────────────────────────────────────────────────────────────── */
  private static async getProductDetails(productIds: number[], client: PoolClient) {
    const query = `
      SELECT 
        p.product_id,
        p.name,
        p.type,
        p.stock,
        p.is_stackable,
        -- Class specific data
        c.id as class_id,
        c.name as class_name,
        c.student_list as class_student_list,
        c.real_start_datetime as class_real_start_datetime,
        pc.max_students,
        -- NEW: Coin rewards data
        pcoin.coin_type as coin_reward_type,
        pcoin.amount as coin_reward_amount
      FROM products p
      LEFT JOIN product_classes pc ON p.product_id = pc.product_id
      LEFT JOIN classes c ON pc.class_id = c.id
      LEFT JOIN product_coin pcoin ON p.product_id = pcoin.product_id
      WHERE p.product_id = ANY($1::int[])
    `;
    
    const result = await client.query(query, [productIds]);
    return result.rows;
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 2. Membuat transaksi Midtrans Snap (Server-Safe) - Updated expiry      */
  /* ────────────────────────────────────────────────────────────────────── */
  static async createMidtransTransaction(
    orderNumber: string, 
    grossAmount: number, 
    userId: string
  ): Promise<{ snapToken: string; midtransUrl: string }> {
    try {
      const serverKey = process.env.MIDTRANS_SERVER_KEY;
      if (!serverKey) {
        throw new Error('MIDTRANS_SERVER_KEY not configured');
      }

      const params: MidtransTransactionParams = {
        transaction_details: {
          order_id: orderNumber,
          gross_amount: Math.round(grossAmount)
        },
        credit_card: { 
          secure: true 
        },
        customer_details: {
          user_id: userId,
          email: `${userId}@example.com`,
          phone: '08111222333'
        },
        expiry: {
          start_time: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' +0000',
          unit: 'minute',
          duration: 30
        },
        callbacks: { 
          finish: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' 
        }
      };

      console.log('Creating Midtrans transaction with params:', {
        order_id: params.transaction_details.order_id,
        gross_amount: params.transaction_details.gross_amount,
        user_id: params.customer_details.user_id
      });

      const response = await serverAxios.post(
        'https://app.sandbox.midtrans.com/snap/v1/transactions',
        params,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${Buffer.from(serverKey).toString('base64')}`
          },
          timeout: 30000
        }
      );

      const data: MidtransResponse = response.data;
      
      if (!data.token || !data.redirect_url) {
        throw new Error('Invalid response from Midtrans');
      }

      console.log('Midtrans transaction created successfully:', {
        token: data.token.substring(0, 20) + '...',
        redirect_url: data.redirect_url
      });

      return { 
        snapToken: data.token, 
        midtransUrl: data.redirect_url 
      };
    } catch (error: any) {
      console.error('Midtrans transaction error:', error);
      if (error.response) {
        console.error('Midtrans error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      throw new Error(`Failed to create payment transaction: ${error.message}`);
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 3. Callback Midtrans - Enhanced with Coin Rewards                     */
  /* ────────────────────────────────────────────────────────────────────── */
  static async handleMidtransCallback(
    req: NextApiRequest, 
    res: NextApiResponse
  ) {
    const client: PoolClient = await pool.connect();
    
    try {
      const notification: MidtransNotification = req.body;
      console.log('Midtrans notification received:', notification);

      if (!notification.order_id || !notification.transaction_status) {
        throw new Error('Invalid notification data');
      }

      const transactionStatus = notification.transaction_status;
      const fraudStatus = notification.fraud_status;
      
      let paymentStatus: string;
      
      if (transactionStatus === 'capture') {
        paymentStatus = fraudStatus === 'challenge' ? 'challenge' : 'success';
      } else if (transactionStatus === 'settlement') {
        paymentStatus = 'success';
      } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
        paymentStatus = 'failed';
      } else {
        paymentStatus = 'pending';
      }

      await client.query('BEGIN');

      const orderUpdate = await client.query(
        `UPDATE sales_order_header
         SET payment_status = $1, updated_at = NOW()
         WHERE order_number = $2
         RETURNING order_id, user_id`,
        [paymentStatus, notification.order_id]
      );

      if (!orderUpdate.rows.length) {
        throw new Error(`Order not found: ${notification.order_id}`);
      }

      const { order_id: orderId, user_id: userId } = orderUpdate.rows[0];

      if (paymentStatus === 'failed') {
        await CheckoutController.restoreStock(notification.order_id, client);
      }

      if (paymentStatus === 'success') {
        const invoiceExists = await Invoice.existsForOrder(orderId, client);
        
        if (!invoiceExists) {
          const invoiceNumber = await Invoice.generateInvoiceNumber('000', client);
          
          const invoice = await Invoice.create({
            orderId,
            invoiceNumber,
            midtrans_transaction_id: notification.transaction_id,
            transaction_time: notification.transaction_time,
            settlement_time: notification.settlement_time,
            payment_type: notification.payment_type,
            issuer: notification.issuer,
            amount: Number(notification.gross_amount),
            fraud_status: notification.fraud_status,
            currency: notification.currency,
            acquirer: notification.acquirer
          }, client);

          // Grant regular entitlements
          await CheckoutController.grantEntitlements(orderId, userId, client);
          
          // NEW: Grant coin rewards for coin topup products
          await CheckoutController.grantCoinRewards(orderId, userId, invoice.invoice_id!, client);
        }
      }

      await client.query('COMMIT');
      
      return res.json({ 
        success: true, 
        message: 'Notification processed successfully' 
      });

    } catch (error: any) {
      console.error('Callback processing error:', error);
      
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Rollback error:', rollbackErr);
      }
      
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Callback processing failed' 
      });
    } finally {
      client.release();
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* Helper: Grant entitlements for successful payment                     */
  /* ────────────────────────────────────────────────────────────────────── */
  static async grantEntitlements(orderId: number, userId: string, client: PoolClient) {
    try {
      const orderItems = await client.query(`
        SELECT 
          soi.product_id, 
          soi.quantity,
          p.type,
          pc.class_id,
          co.course_id
        FROM sales_order_item soi
        JOIN products p ON soi.product_id = p.product_id
        LEFT JOIN product_courses co ON p.product_id = co.product_id
        LEFT JOIN product_classes pc ON p.product_id = pc.product_id
        WHERE soi.order_id = $1
      `, [orderId]);

      if (orderItems.rows.length === 0) {
        return;
      }

      for (const item of orderItems.rows) {
        if (item.type === 12) { // Course product
          if (item.course_id) {
            await client.query(
              `INSERT INTO course_entitlements
               (user_id, course_id, granted_at, expires_at)
               VALUES ($1, $2, NOW(), NULL)
               ON CONFLICT (user_id, course_id)
               DO UPDATE SET
                 granted_at = EXCLUDED.granted_at,
                 expires_at = NULL`,
              [userId, item.course_id]
            );
          }
        } else if (item.type === 13) { // Class product
          if (item.class_id) {
            await client.query(
              `UPDATE classes
               SET student_list = array_append(student_list, $1::int),
                   edit_date = NOW()
               WHERE id = $2 
                 AND NOT ($1::int = ANY(student_list))`,
              [userId, item.class_id]
            );
            
            console.log(`User ${userId} enrolled in class ${item.class_id}`);
          }
        }
        // Note: Type 15 (Coin topup products) are handled in grantCoinRewards
      }

      // Handle exam schedule entitlements for all relevant product types
      const exams = await client.query(
        `SELECT DISTINCT exam_schedule_id
         FROM product_exam_schedules
         WHERE product_id = ANY(
           SELECT product_id FROM sales_order_item WHERE order_id = $1
         )`,
        [orderId]
      );

      for (const exam of exams.rows) {
        await client.query(
          `INSERT INTO exam_schedule_entitlements
           (user_id, exam_schedule_id, granted_at, expires_at)
           VALUES ($1, $2, NOW(), NULL)
           ON CONFLICT (user_id, exam_schedule_id)
           DO UPDATE SET
             granted_at = EXCLUDED.granted_at,
             expires_at = NULL`,
          [userId, exam.exam_schedule_id]
        );
      }

    } catch (error) {
      console.error('Error granting entitlements:', error);
      throw error;
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* NEW: Grant coin rewards for coin topup products                       */
  /* ────────────────────────────────────────────────────────────────────── */
  static async grantCoinRewards(orderId: number, userId: string, invoiceId: number, client: PoolClient) {
    try {
      // Get purchased products with coin rewards
      const coinProducts = await client.query(`
        SELECT 
          soi.product_id,
          soi.quantity,
          p.type,
          pc.coin_type,
          pc.amount as coin_amount
        FROM sales_order_item soi
        JOIN products p ON soi.product_id = p.product_id
        JOIN product_coin pc ON p.product_id = pc.product_id
        WHERE soi.order_id = $1
          AND p.type = 15  -- Coin topup products
      `, [orderId]);

      console.log(`Found ${coinProducts.rows.length} coin reward products for order ${orderId}`);

      for (const coinProduct of coinProducts.rows) {
        const totalCoins = parseFloat(coinProduct.coin_amount) * coinProduct.quantity;
        
        console.log(`Granting ${totalCoins} ${coinProduct.coin_type} coins to user ${userId}`);
        
        await UserCoinModel.addCoins({
          user_id: parseInt(userId),
          coin_type: coinProduct.coin_type,
          amount: totalCoins,
          source: 'purchase',
          reference_id: invoiceId
        }, client);
      }

    } catch (error) {
      console.error('Error granting coin rewards:', error);
      throw error;
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* Helper: Restore stock for failed payments                             */
  /* ────────────────────────────────────────────────────────────────────── */
  static async restoreStock(orderNumber: string, client: PoolClient = pool) {
    try {
      const items = await SalesOrder.getItemsByOrderNumber(orderNumber, client);
      
      for (const item of items) {
        await client.query(
          `UPDATE products
           SET stock = stock + $1,
               updated_at = NOW()
           WHERE product_id = $2`,
          [item.quantity, item.product_id]
        );
      }
    } catch (error) {
      console.error('Error restoring stock:', error);
      throw error;
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

      if (!orderNumber || typeof orderNumber !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'Order number is required' 
        });
      }

      const summary = await SalesOrder.getOrderSummary(orderNumber);
      
      if (!summary) {
        return res.status(404).json({ 
          success: false, 
          message: 'Order not found' 
        });
      }

      if (summary.user_id !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied' 
        });
      }

      return res.json({ 
        success: true, 
        data: summary 
      });

    } catch (error: any) {
      console.error('Get order status error:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get order status' 
      });
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 5. GET /checkout/all-transactions                                     */
  /* ────────────────────────────────────────────────────────────────────── */
  static async getAllTransactions(
    req: AuthenticatedRequest, 
    res: NextApiResponse
  ) {
    try {
      const userId = req.user!.id;
      const transactions = await SalesOrder.getAllByUserId(userId);
      
      return res.json({ 
        success: true, 
        data: transactions 
      });
    } catch (error: any) {
      console.error('Get all transactions error:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get transactions' 
      });
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 6. GET /checkout/orders                                               */
  /* ────────────────────────────────────────────────────────────────────── */
  static async getUserOrders(
    req: AuthenticatedRequest, 
    res: NextApiResponse<UserOrdersResponse>
  ) {
    try {
      const userId = req.user!.id;
      const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || '10', 10)));
      const offset = (page - 1) * limit;

      const orders = await SalesOrder.findByUserId(userId, limit, offset);

      return res.json({
        success: true,
        data: {
          orders,
          pagination: { 
            page, 
            limit, 
            total: orders.length 
          }
        }
      });

    } catch (error: any) {
      console.error('Get user orders error:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to get user orders' 
      });
    }
  }
}

export default CheckoutController;