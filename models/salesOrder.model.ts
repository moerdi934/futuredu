// models/SalesOrder.model.ts
import { Pool, PoolClient } from 'pg';
import pool from '../lib/db';
import dayjs from 'dayjs';

// Types
export interface SalesOrderHeader {
  order_id?: number;
  order_number: string;
  user_id: string;
  status?: string;
  payment_status?: string;
  midtrans_token?: string;
  midtrans_url?: string;
  expired_at: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface SalesOrderItem {
  item_id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
  item_price: number;
  total_price: number;
  tax: number;
  total_amount: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateHeaderParams {
  orderNumber: string;
  userId: string;
  expiredAt: Date;
}

export interface ItemData {
  product_id: number;
  quantity: number;
  item_price: number;
  total_price: number;
  tax: number;
  total_amount: number;
}

export interface OrderSummary extends SalesOrderHeader {
  total_items: number;
  total_qty: number;
  grand_total: number;
  items: ItemData[];
}

export interface OrderItem {
  product_id: number;
  quantity: number;
}

export interface UserTransaction {
  order_number: string;
  payment_status: string;
  expired_at: Date;
  created_at: Date;
  midtrans_token?: string;
  midtrans_url?: string;
}

class SalesOrder {
  /* ------------- helper ------------- */
  /**
   * Buat nomor order unik
   * Format: ORDFE-{branchCode}-{YYMM}{XXXX}
   * - branchCode : 3 digit, default '000'
   * - YYMM       : tahun-bulan (2 digit + 2 digit)
   * - XXXX       : running number reset per (branchCode, YYMM)
   */
  static async generateOrderNumber(branch: string = '000', client: PoolClient = pool): Promise<string> {
    const branchCode = String(branch).replace(/\D/g, '').padStart(3, '0');
    const yymm = dayjs().format('YYMM');
    const seq = `sales_order_seq_${branchCode}_${yymm}`;
    await client.query(`CREATE SEQUENCE IF NOT EXISTS ${seq}`);
    
    // Ambil nilai sequence, lalu kembalikan orderNo
    const { rows } = await client.query(`SELECT nextval('${seq}') AS n`);
    const run = rows[0].n;
    return `ORDFE-${branchCode}-${yymm}${String(run).padStart(4, '0')}`;
  }

  /* ------------- create header ------------- */
  static async createHeader(
    { orderNumber, userId, expiredAt }: CreateHeaderParams, 
    client: PoolClient = pool
  ): Promise<number> {
    const { rows } = await client.query(
      `INSERT INTO sales_order_header
         (order_number,user_id,expired_at)
       VALUES ($1,$2,$3)
       RETURNING order_id`,
      [orderNumber, userId, expiredAt]
    );
    return rows[0].order_id;
  }

  /* ------------- bulk insert items ------------- */
  static async bulkInsertItems(
    orderId: number, 
    items: ItemData[], 
    client: PoolClient = pool
  ): Promise<SalesOrderItem[]> {
    const col = (k: keyof ItemData) => items.map(i => i[k]);
    const text = `
      INSERT INTO sales_order_item (
        order_id, product_id, quantity,
        item_price, total_price, tax, total_amount
      )
      SELECT * FROM UNNEST (
        $1::bigint[], $2::int[], $3::int[],
        $4::numeric[], $5::numeric[], $6::numeric[], $7::numeric[]
      )
      RETURNING *`;
    const params = [
      Array(items.length).fill(orderId),
      col('product_id'), col('quantity'),
      col('item_price'), col('total_price'),
      col('tax'), col('total_amount')
    ];
    const { rows } = await client.query(text, params);
    return rows;
  }

  /* ------------- update payment status ------------- */
  static async updatePaymentStatus(
    orderNumber: string, 
    status: string, 
    client: PoolClient = pool
  ): Promise<{ order_id: number }> {
    const { rows } = await client.query(
      `UPDATE sales_order_header
          SET payment_status=$1, updated_at=NOW()
        WHERE order_number=$2
      RETURNING order_id`,
      [status, orderNumber]
    );
    return rows[0];
  }

  /* ------------- fetch summary ------------- */
  static async getOrderSummary(
    orderNumber: string, 
    client: PoolClient = pool
  ): Promise<OrderSummary | null> {
    const { rows } = await client.query(`
      SELECT h.order_number,
             h.user_id,
             h.status,
             h.payment_status,
             h.midtrans_token,
             h.midtrans_url,
             h.expired_at,
             h.created_at,
             COUNT(i.*)                 AS total_items,
             SUM(i.quantity)            AS total_qty,
             SUM(i.total_amount)        AS grand_total,
             JSON_AGG(
               JSON_BUILD_OBJECT(
                 'product_id', i.product_id,
                 'quantity',   i.quantity,
                 'item_price', i.item_price,
                 'total_price',i.total_price,
                 'tax',        i.tax,
                 'total_amount',i.total_amount
               )
             ) AS items
        FROM sales_order_header h
        JOIN sales_order_item   i USING(order_id)
       WHERE h.order_number = $1
       GROUP BY h.order_id`, [orderNumber]);
    return rows[0] || null;
  }

  /* ------------ restore stock (dipakai callback) -------- */
  static async getItemsByOrderNumber(
    orderNumber: string, 
    client: PoolClient = pool
  ): Promise<OrderItem[]> {
    const { rows } = await client.query(`
      SELECT i.product_id, i.quantity
        FROM sales_order_item i
        JOIN sales_order_header h USING(order_id)
       WHERE h.order_number = $1`, [orderNumber]);
    return rows;
  }

  static async getAllByUserId(
    userId: string, 
    client: PoolClient = pool
  ): Promise<UserTransaction[]> {
    const { rows } = await client.query(`
      SELECT
        order_number,
        payment_status,
        expired_at,
        created_at,
        midtrans_token,
        midtrans_url
      FROM sales_order_header
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);
    return rows;
  }

  static async findByUserId(
    userId: string,
    limit: number,
    offset: number,
    client: PoolClient = pool
  ): Promise<UserTransaction[]> {
    const { rows } = await client.query(`
      SELECT
        order_number,
        payment_status,
        expired_at,
        created_at,
        midtrans_token,
        midtrans_url
      FROM sales_order_header
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);
    return rows;
  }
}

export default SalesOrder;