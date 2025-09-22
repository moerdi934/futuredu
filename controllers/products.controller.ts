// controllers/products.controller.ts - Updated with is_stackable support
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../lib/db';
import ProductModel, { ProductPrice } from '../models/products.model';
import { PoolClient } from 'pg';

// Types for request bodies (updated with is_stackable)
export interface UpdateProductRequest {
  name: string;
  description: string;
  stock: number;
  type: number;
  features: string[];
  classtype: string;
  is_stackable?: boolean;  // New field
  course_ids?: number[];
  exam_schedule_ids?: number[];
  prices?: ProductPrice[];
}

export interface UpdateProductPricesRequest {
  prices: ProductPrice[];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  type: number;
  exam_schedule_id?: number;
  features: string[];
  classtype: string;
  is_stackable?: boolean;  // New field
}

// Helper functions for entitlements (unchanged)
async function grantCourseEntitlementForProduct(product_id: string | number, course_id: number, client: PoolClient): Promise<void> {
  const { rows: users } = await client.query(`
    SELECT soh.user_id
      FROM sales_order_header soh
      JOIN sales_order_item soi ON soh.order_id = soi.order_id
     WHERE soi.product_id = $1
       AND soh.payment_status = 'success'
  `, [product_id]);
  
  for (const { user_id } of users) {
    await client.query(`
      INSERT INTO course_entitlements (user_id, course_id, granted_at, expires_at)
      VALUES ($1, $2, NOW(), NULL)
      ON CONFLICT (user_id, course_id) DO UPDATE SET expires_at = NULL, granted_at = NOW()
    `, [user_id, course_id]);
  }
}

async function grantExamEntitlementForProduct(product_id: string | number, exam_schedule_id: number, client: PoolClient): Promise<void> {
  const { rows: users } = await client.query(`
    SELECT soh.user_id
      FROM sales_order_header soh
      JOIN sales_order_item soi ON soh.order_id = soi.order_id
     WHERE soi.product_id = $1
       AND soh.payment_status = 'success'
  `, [product_id]);
  
  for (const { user_id } of users) {
    await client.query(`
      INSERT INTO exam_schedule_entitlements (user_id, exam_schedule_id, granted_at, expires_at)
      VALUES ($1, $2, NOW(), NULL)
      ON CONFLICT (user_id, exam_schedule_id) DO UPDATE SET expires_at = NULL, granted_at = NOW()
    `, [user_id, exam_schedule_id]);
  }
}

async function revokeCourseEntitlementForProduct(product_id: string | number, course_id: number, client: PoolClient): Promise<void> {
  const { rows: users } = await client.query(`
    SELECT soh.user_id
      FROM sales_order_header soh
      JOIN sales_order_item soi ON soh.order_id = soi.order_id
     WHERE soi.product_id = $1
       AND soh.payment_status = 'success'
  `, [product_id]);
  
  for (const { user_id } of users) {
    const { rows: others } = await client.query(`
      SELECT 1
        FROM sales_order_item soi2
        JOIN sales_order_header soh2 ON soi2.order_id = soh2.order_id
        JOIN product_courses pc2 ON soi2.product_id = pc2.product_id
       WHERE soi2.product_id != $1 AND pc2.course_id = $2 AND soh2.user_id = $3
         AND soh2.payment_status = 'success'
    `, [product_id, course_id, user_id]);
    
    if (others.length === 0) {
      await client.query(`
        DELETE FROM course_entitlements
         WHERE user_id = $1 AND course_id = $2
      `, [user_id, course_id]);
    }
  }
}

async function revokeExamEntitlementForProduct(product_id: string | number, exam_schedule_id: number, client: PoolClient): Promise<void> {
  const { rows: users } = await client.query(`
    SELECT soh.user_id
      FROM sales_order_header soh
      JOIN sales_order_item soi ON soh.order_id = soi.order_id
     WHERE soi.product_id = $1
       AND soh.payment_status = 'success'
  `, [product_id]);
  
  for (const { user_id } of users) {
    const { rows: others } = await client.query(`
      SELECT 1
        FROM sales_order_item soi2
        JOIN sales_order_header soh2 ON soi2.order_id = soh2.order_id
        JOIN product_exam_schedules pes2 ON soi2.product_id = pes2.product_id
       WHERE soi2.product_id != $1 AND pes2.exam_schedule_id = $2 AND soh2.user_id = $3
         AND soh2.payment_status = 'success'
    `, [product_id, exam_schedule_id, user_id]);
    
    if (others.length === 0) {
      await client.query(`
        DELETE FROM exam_schedule_entitlements
         WHERE user_id = $1 AND exam_schedule_id = $2
      `, [user_id, exam_schedule_id]);
    }
  }
}

const ProductController = {
  updateProductAndAssignments: async (req: NextApiRequest, res: NextApiResponse) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // --- Ambil data dari body (updated to include is_stackable)
      const {
        name, 
        description, 
        stock, 
        type, 
        features, 
        classtype,
        is_stackable = true,  // Default to true if not provided
        course_ids = [], 
        exam_schedule_ids = [],
        prices = []
      }: UpdateProductRequest = req.body;
      
      const { id } = req.query;

      // --- 1. Update produk utama (including is_stackable)
      await client.query(`
        UPDATE products SET name=$1, description=$2, stock=$3, type=$4,
          features=$5, classtype=$6, is_stackable=$7, updated_at=NOW()
        WHERE product_id=$8
      `, [name, description, stock, type, features, classtype, is_stackable, id]);

      // --- Handle special logic for non-stackable products
      if (!is_stackable) {
        // If product becomes non-stackable, remove excess quantities from all carts
        await client.query(`
          UPDATE cart_items 
          SET quantity = 1 
          WHERE product_id = $1 AND quantity > 1
        `, [id]);
        
        console.log(`Product ${id} set to non-stackable. Cart quantities adjusted to maximum 1.`);
      }

      // --- 2. Sync course
      const { rows: oldCourses } = await client.query(
        'SELECT course_id FROM product_courses WHERE product_id=$1', [id]);
      const oldCourseIds = oldCourses.map(r => r.course_id);
      const addedCourses = course_ids.filter(cid => !oldCourseIds.includes(cid));
      const removedCourses = oldCourseIds.filter(cid => !course_ids.includes(cid));
      
      // Insert new
      for (const cid of addedCourses) {
        await client.query(
          'INSERT INTO product_courses (product_id, course_id) VALUES ($1, $2)', [id, cid]);
        await grantCourseEntitlementForProduct(id as string, cid, client);
      }
      
      // Remove deleted
      for (const cid of removedCourses) {
        await client.query(
          'DELETE FROM product_courses WHERE product_id=$1 AND course_id=$2', [id, cid]);
        await revokeCourseEntitlementForProduct(id as string, cid, client);
      }

      // --- 3. Sync exam
      const { rows: oldExams } = await client.query(
        'SELECT exam_schedule_id FROM product_exam_schedules WHERE product_id=$1', [id]);
      const oldExamIds = oldExams.map(r => r.exam_schedule_id);
      const addedExams = exam_schedule_ids.filter(eid => !oldExamIds.includes(eid));
      const removedExams = oldExamIds.filter(eid => !exam_schedule_ids.includes(eid));
      
      // Insert new
      for (const eid of addedExams) {
        await client.query(
          'INSERT INTO product_exam_schedules (product_id, exam_schedule_id) VALUES ($1, $2)', [id, eid]);
        await grantExamEntitlementForProduct(id as string, eid, client);
      }
      
      // Remove deleted
      for (const eid of removedExams) {
        await client.query(
          'DELETE FROM product_exam_schedules WHERE product_id=$1 AND exam_schedule_id=$2', [id, eid]);
        await revokeExamEntitlementForProduct(id as string, eid, client);
      }

      // --- 4. Update harga (product_price_hist)
      await client.query('DELETE FROM product_price_hist WHERE product_id = $1', [id]);
      for (const p of prices) {
        await client.query(`
          INSERT INTO product_price_hist
          (product_id, price, effective_start, effective_end, description, is_promo, no_promo_price, promo_description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          id, p.price, p.effective_start, p.effective_end, p.description || null,
          p.is_promo || false, p.no_promo_price || null, p.promo_description || null
        ]);
      }

      await client.query('COMMIT');
      res.json({ success: true });
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    } finally {
      client.release();
    }
  },

  updateProductPrices: async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    const { prices = [] }: UpdateProductPricesRequest = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await ProductModel.setProductPrices(id as string, prices, client);
      await client.query('COMMIT');
      res.json({ success: true, message: 'Product prices updated' });
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('Error updating product prices:', err);
      res.status(500).json({ success: false, message: 'Failed to update product prices' });
    } finally {
      client.release();
    }
  },

  getProductDetail: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { id } = req.query;
      const detail = await ProductModel.getProductDetail(id as string);
      if (!detail) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.json({ success: true, data: detail });
    } catch (err: any) {
      console.error('Error fetching product detail:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch product detail' });
    }
  },

  getProducts: async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const products = await ProductModel.getProducts();
      return res.json({ success: true, data: products });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
  },

  getProductsFromTryOut: async (req: NextApiRequest, res: NextApiResponse) => {
    const { exam_schedule_id } = req.query;
    try {
      const products = await ProductModel.getProductsFromTryOut(exam_schedule_id as string);
      return res.json({ success: true, data: products });
    } catch (error: any) {
      console.error('Error fetching try-out products:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch try-out products' });
    }
  },

  getProductsPaket: async (req: NextApiRequest, res: NextApiResponse) => {
    const { classtype } = req.query;
    try {
      const products = await ProductModel.getProductsPaket(classtype as string);
      return res.json({ success: true, data: products });
    } catch (error: any) {
      console.error('Error fetching paket products:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch paket products' });
    }
  },

  createProduct: async (req: NextApiRequest, res: NextApiResponse) => {
    const { 
      name, 
      description, 
      price, 
      stock, 
      type, 
      exam_schedule_id, 
      features, 
      classtype,
      is_stackable = true  // Default to true for new products
    }: CreateProductRequest = req.body;
    
    try {
      const newProduct = await ProductModel.createProduct({
        name, description, price, stock, type, exam_schedule_id, features, classtype, is_stackable
      });
      return res.json({ success: true, data: newProduct });
    } catch (error: any) {
      console.error('Error creating product:', error);
      return res.status(500).json({ success: false, message: 'Failed to create product' });
    }
  },

  // New endpoint: Update only product stackability
  updateProductStackability: async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    const { is_stackable }: { is_stackable: boolean } = req.body;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const success = await ProductModel.updateProductStackability(id as string, is_stackable, client);
      
      if (!success) {
        throw new Error('Product not found or update failed');
      }

      // If setting to non-stackable, adjust cart quantities
      if (!is_stackable) {
        await client.query(`
          UPDATE cart_items 
          SET quantity = 1 
          WHERE product_id = $1 AND quantity > 1
        `, [id]);
        
        console.log(`Product ${id} set to non-stackable. Cart quantities adjusted.`);
      }
      
      await client.query('COMMIT');
      res.json({ 
        success: true, 
        message: `Product stackability updated to ${is_stackable ? 'stackable' : 'non-stackable'}` 
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('Error updating product stackability:', err);
      res.status(500).json({ success: false, message: err.message });
    } finally {
      client.release();
    }
  }
};

export default ProductController;