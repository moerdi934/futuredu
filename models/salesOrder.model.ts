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
   * Generate unique order number
   * Format: ORDFE-{branchCode}-{YYMM}{XXXX}
   * - branchCode : 3 digit, default '000'
   * - YYMM       : year-month (2 digit + 2 digit)
   * - XXXX       : running number reset per (branchCode, YYMM)
   */
  static async generateOrderNumber(branch: string = '000', client: PoolClient = pool): Promise<string> {
    try {
      const branchCode = String(branch).replace(/\D/g, '').padStart(3, '0');
      const yymm = dayjs().format('YYMM');
      const seqName = `sales_order_seq_${branchCode}_${yymm}`;
      
      await client.query(`CREATE SEQUENCE IF NOT EXISTS ${seqName}`);
      
      const { rows } = await client.query(`SELECT nextval('${seqName}') AS n`);
      const runNumber = String(rows[0].n).padStart(4, '0');
      
      return `ORDFE-${branchCode}-${yymm}${runNumber}`;
    } catch (error) {
      console.error('Error generating order number:', error);
      throw new Error('Failed to generate order number');
    }
  }

  /* ------------- create header ------------- */
  static async createHeader(
    { orderNumber, userId, expiredAt }: CreateHeaderParams, 
    client: PoolClient = pool
  ): Promise<number> {
    try {
      const { rows } = await client.query(
        `INSERT INTO sales_order_header
           (order_number, user_id, expired_at, status, payment_status)
         VALUES ($1, $2, $3, 'pending', 'pending')
         RETURNING order_id`,
        [orderNumber, userId, expiredAt]
      );
      
      if (!rows.length) {
        throw new Error('Failed to create order header');
      }
      
      return rows[0].order_id;
    } catch (error) {
      console.error('Error creating order header:', error);
      throw new Error('Failed to create order header');
    }
  }

  /* ------------- bulk insert items ------------- */
  static async bulkInsertItems(
    orderId: number, 
    items: ItemData[], 
    client: PoolClient = pool
  ): Promise<SalesOrderItem[]> {
    try {
      if (!items || items.length === 0) {
        throw new Error('No items to insert');
      }

      // Validate items data
      for (const item of items) {
        if (!item.product_id || item.quantity <= 0 || item.item_price < 0) {
          throw new Error('Invalid item data');
        }
      }

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
        col('product_id'), 
        col('quantity'),
        col('item_price'), 
        col('total_price'),
        col('tax'), 
        col('total_amount')
      ];
      
      const { rows } = await client.query(text, params);
      
      if (rows.length !== items.length) {
        throw new Error('Failed to insert all items');
      }
      
      return rows;
    } catch (error) {
      console.error('Error inserting order items:', error);
      throw new Error('Failed to insert order items');
    }
  }

  /* ------------- update payment status ------------- */
  static async updatePaymentStatus(
    orderNumber: string, 
    status: string, 
    client: PoolClient = pool
  ): Promise<{ order_id: number } | null> {
    try {
      if (!orderNumber || !status) {
        throw new Error('Order number and status are required');
      }

      const { rows } = await client.query(
        `UPDATE sales_order_header
            SET payment_status = $1, updated_at = NOW()
          WHERE order_number = $2
        RETURNING order_id`,
        [status, orderNumber]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

  /* ------------- fetch summary ------------- */
  static async getOrderSummary(
    orderNumber: string, 
    client: PoolClient = pool
  ): Promise<OrderSummary | null> {
    try {
      if (!orderNumber) {
        throw new Error('Order number is required');
      }

      const { rows } = await client.query(`
        SELECT h.order_id,
               h.order_number,
               h.user_id,
               h.status,
               h.payment_status,
               h.midtrans_token,
               h.midtrans_url,
               h.expired_at,
               h.created_at,
               h.updated_at,
               COUNT(i.*)::int                 AS total_items,
               SUM(i.quantity)::int            AS total_qty,
               SUM(i.total_amount)::numeric    AS grand_total,
               COALESCE(
                 JSON_AGG(
                   JSON_BUILD_OBJECT(
                     'product_id', i.product_id,
                     'quantity',   i.quantity,
                     'item_price', i.item_price,
                     'total_price',i.total_price,
                     'tax',        i.tax,
                     'total_amount',i.total_amount
                   )
                 ) FILTER (WHERE i.product_id IS NOT NULL),
                 '[]'::json
               ) AS items
          FROM sales_order_header h
          LEFT JOIN sales_order_item i USING(order_id)
         WHERE h.order_number = $1
         GROUP BY h.order_id, h.order_number, h.user_id, h.status, 
                  h.payment_status, h.midtrans_token, h.midtrans_url, 
                  h.expired_at, h.created_at, h.updated_at`, 
        [orderNumber]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error getting order summary:', error);
      throw new Error('Failed to get order summary');
    }
  }

  /* ------------ restore stock (used in callback) -------- */
  static async getItemsByOrderNumber(
    orderNumber: string, 
    client: PoolClient = pool
  ): Promise<OrderItem[]> {
    try {
      if (!orderNumber) {
        throw new Error('Order number is required');
      }

      const { rows } = await client.query(`
        SELECT i.product_id, i.quantity
          FROM sales_order_item i
          JOIN sales_order_header h USING(order_id)
         WHERE h.order_number = $1`, 
        [orderNumber]
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting order items:', error);
      throw new Error('Failed to get order items');
    }
  }

  static async getAllByUserId(
    userId: string, 
    client: PoolClient = pool
  ): Promise<UserTransaction[]> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

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
          AND (
            payment_status = 'success'
            OR expired_at > NOW()
          )
        ORDER BY created_at DESC
      `, [userId]);
      
      return rows;
    } catch (error) {
      console.error('Error getting all transactions:', error);
      throw new Error('Failed to get transactions');
    }
  }

  static async findByUserId(
    userId: string,
    limit: number = 10,
    offset: number = 0,
    client: PoolClient = pool
  ): Promise<UserTransaction[]> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Validate limit and offset
      const validLimit = Math.min(100, Math.max(1, limit));
      const validOffset = Math.max(0, offset);

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
      `, [userId, validLimit, validOffset]);
      
      return rows;
    } catch (error) {
      console.error('Error finding orders by user ID:', error);
      throw new Error('Failed to find user orders');
    }
  }

  /* ------------- Additional helper methods ------------- */
  static async findByOrderNumber(
    orderNumber: string,
    client: PoolClient = pool
  ): Promise<SalesOrderHeader | null> {
    try {
      if (!orderNumber) {
        throw new Error('Order number is required');
      }

      const { rows } = await client.query(
        `SELECT * FROM sales_order_header WHERE order_number = $1`,
        [orderNumber]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding order by number:', error);
      throw new Error('Failed to find order');
    }
  }

  static async updateMidtransData(
    orderNumber: string,
    midtransToken: string,
    midtransUrl: string,
    client: PoolClient = pool
  ): Promise<boolean> {
    try {
      if (!orderNumber || !midtransToken || !midtransUrl) {
        throw new Error('Order number, token, and URL are required');
      }

      const { rowCount } = await client.query(
        `UPDATE sales_order_header
         SET midtrans_token = $1,
             midtrans_url = $2,
             updated_at = NOW()
         WHERE order_number = $3`,
        [midtransToken, midtransUrl, orderNumber]
      );
      
      return rowCount === 1;
    } catch (error) {
      console.error('Error updating Midtrans data:', error);
      throw new Error('Failed to update Midtrans data');
    }
  }

  static async deleteOrder(
    orderNumber: string,
    client: PoolClient = pool
  ): Promise<boolean> {
    try {
      if (!orderNumber) {
        throw new Error('Order number is required');
      }

      await client.query('BEGIN');

      // Delete order items first
      await client.query(
        `DELETE FROM sales_order_item 
         WHERE order_id IN (
           SELECT order_id FROM sales_order_header 
           WHERE order_number = $1
         )`,
        [orderNumber]
      );

      // Delete order header
      const { rowCount } = await client.query(
        `DELETE FROM sales_order_header WHERE order_number = $1`,
        [orderNumber]
      );

      await client.query('COMMIT');
      
      return rowCount === 1;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting order:', error);
      throw new Error('Failed to delete order');
    }
  }
}

export default SalesOrder;