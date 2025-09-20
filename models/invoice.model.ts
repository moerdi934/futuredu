// models/Invoice.model.ts
import { PoolClient } from 'pg';
import pool from '../lib/db';
import dayjs from 'dayjs';

// Types
export interface InvoiceData {
  invoice_id?: number;
  invoice_number: string;
  order_id: number;
  midtrans_transaction_id?: string;
  transaction_time?: string;
  settlement_time?: string;
  payment_type?: string;
  issuer?: string;
  amount: number;
  fraud_status?: string;
  currency?: string;
  acquirer?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateInvoiceParams {
  orderId: number;
  invoiceNumber: string;
  midtrans_transaction_id?: string;
  transaction_time?: string;
  settlement_time?: string;
  payment_type?: string;
  issuer?: string;
  amount: number;
  fraud_status?: string;
  currency?: string;
  acquirer?: string;
}

class Invoice {
  static async generateInvoiceNumber(
    branch: string = '000', 
    client: PoolClient = pool
  ): Promise<string> {
    try {
      const branchCode = String(branch).replace(/\D/g, '').padStart(3, '0');
      const yymm = dayjs().format('YYMM');
      const seqName = `invoice_seq_${branchCode}_${yymm}`;
      
      await client.query(`CREATE SEQUENCE IF NOT EXISTS ${seqName}`);
      const { rows } = await client.query(`SELECT nextval('${seqName}') AS n`);
      const run = String(rows[0].n).padStart(4, '0');
      
      return `INVFE-${branchCode}-${yymm}${run}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      throw new Error('Failed to generate invoice number');
    }
  }

  static async existsForOrder(
    orderId: number, 
    client: PoolClient = pool
  ): Promise<boolean> {
    try {
      const { rows } = await client.query(
        `SELECT 1 FROM sales_order_invoice WHERE order_id = $1`,
        [orderId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking invoice existence:', error);
      throw new Error('Failed to check invoice existence');
    }
  }

  static async create(
    {
      orderId,
      invoiceNumber,
      midtrans_transaction_id,
      transaction_time,
      settlement_time,
      payment_type,
      issuer,
      amount,
      fraud_status,
      currency,
      acquirer
    }: CreateInvoiceParams,
    client: PoolClient = pool
  ): Promise<InvoiceData> {
    try {
      const text = `
        INSERT INTO sales_order_invoice (
          invoice_number,
          order_id,
          midtrans_transaction_id,
          transaction_time,
          settlement_time,
          payment_type,
          issuer,
          amount,
          fraud_status,
          currency,
          acquirer
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *
      `;
      const params = [
        invoiceNumber,
        orderId,
        midtrans_transaction_id,
        transaction_time,
        settlement_time,
        payment_type,
        issuer,
        amount,
        fraud_status,
        currency,
        acquirer
      ];
      
      const { rows } = await client.query(text, params);
      return rows[0];
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }

  static async findByOrderId(
    orderId: number,
    client: PoolClient = pool
  ): Promise<InvoiceData | null> {
    try {
      const { rows } = await client.query(
        `SELECT * FROM sales_order_invoice WHERE order_id = $1`,
        [orderId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding invoice by order ID:', error);
      throw new Error('Failed to find invoice');
    }
  }

  static async findByInvoiceNumber(
    invoiceNumber: string,
    client: PoolClient = pool
  ): Promise<InvoiceData | null> {
    try {
      const { rows } = await client.query(
        `SELECT * FROM sales_order_invoice WHERE invoice_number = $1`,
        [invoiceNumber]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding invoice by number:', error);
      throw new Error('Failed to find invoice');
    }
  }
}

export default Invoice;