// models/products.model.ts
import pool from '../lib/db';
import { PoolClient } from 'pg';

// Types
export interface Product {
  product_id: number;
  name: string;
  description: string;
  stock: number;
  type: number;
  exam_schedule_id?: number;
  features: string[];
  classtype: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductPrice {
  id?: number;
  product_id: number;
  price: number;
  effective_start: string;
  effective_end?: string;
  description?: string;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
}

export interface ProductWithPrice extends Product {
  price?: number;
  is_promo?: boolean;
  no_promo_price?: number;
  promo_description?: string;
}

export interface ProductDetail extends Product {
  price_history: ProductPrice[];
  courses: Array<{
    course_id: number;
    title: string;
  }>;
  exams: Array<{
    exam_schedule_id: number;
    name: string;
  }>;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  type: number;
  exam_schedule_id?: number;
  features: string[];
  classtype: string;
}

const basePriceJoin = `
  LEFT JOIN LATERAL (
    SELECT
      pph.price,
      pph.is_promo,
      pph.no_promo_price,
      pph.promo_description
    FROM product_price_hist pph
    WHERE pph.product_id = p.product_id
      AND (
        -- 1) future adjustment/promo (effective_start > now)
        pph.effective_start > NOW()
        OR
        -- 2) current price (started ≤ now and not yet ended)
        (
          pph.effective_start <= NOW()
          AND (pph.effective_end IS NULL OR pph.effective_end > NOW())
        )
      )
    ORDER BY
      (pph.effective_start > NOW()) DESC,  -- prioritaskan future
      pph.effective_start DESC              -- ambil yang terbesar
    LIMIT 1
  ) ph ON TRUE
`;

const ProductModel = {
  // Get all products + price
  getProducts: async (): Promise<ProductWithPrice[]> => {
    const sql = `
      SELECT
        p.*,
        ph.price,
        ph.is_promo,
        ph.no_promo_price,
        ph.promo_description
      FROM products p
      ${basePriceJoin}
      ORDER BY p.product_id
    `;
    const { rows } = await pool.query(sql);
    return rows;
  },

  getProductDetail: async (id: string | number): Promise<ProductDetail | null> => {
    // 1. Produk utama
    const { rows: productRows } = await pool.query(`
      SELECT *
      FROM products
      WHERE product_id = $1
      LIMIT 1
    `, [id]);
    if (!productRows.length) return null;
    const product = productRows[0];

    // 2. Price history
    const { rows: priceRows } = await pool.query(`
      SELECT *
      FROM product_price_hist
      WHERE product_id = $1
      ORDER BY effective_start DESC, id DESC
    `, [id]);

    // 3. Courses
    const { rows: courseRows } = await pool.query(`
      SELECT pc.course_id, c.title
      FROM product_courses pc
      LEFT JOIN courses c ON c.id = pc.course_id
      WHERE pc.product_id = $1
      ORDER BY pc.course_id
    `, [id]);

    // 4. Exams
    const { rows: examRows } = await pool.query(`
      SELECT pes.exam_schedule_id, es.name
      FROM product_exam_schedules pes
      LEFT JOIN exam_schedule es ON es.id = pes.exam_schedule_id
      WHERE pes.product_id = $1
      ORDER BY pes.exam_schedule_id
    `, [id]);

    return {
      ...product,
      price_history: priceRows,
      courses: courseRows,
      exams: examRows
    };
  },

  // Set product prices
  setProductPrices: async (product_id: string | number, prices: ProductPrice[], client: PoolClient): Promise<void> => {
    await client.query('DELETE FROM product_price_hist WHERE product_id = $1', [product_id]);
    for (const p of prices) {
      await client.query(`
        INSERT INTO product_price_hist
          (product_id, price, effective_start, effective_end, description, is_promo, no_promo_price, promo_description)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        product_id, p.price, p.effective_start, p.effective_end,
        p.description || null, p.is_promo || false, p.no_promo_price || null, p.promo_description || null
      ]);
    }
  },

  // Get products linked to a specific try-out
  getProductsFromTryOut: async (exam_schedule_id: string | number): Promise<ProductWithPrice[]> => {
    const sql = `
      SELECT
        p.*,
        ph.price,
        ph.is_promo,
        ph.no_promo_price,
        ph.promo_description
      FROM products p
      LEFT JOIN exam_schedule es ON es.id = p.exam_schedule_id
      ${basePriceJoin}
      WHERE es.id = $1
      ORDER BY p.product_id
    `;
    const { rows } = await pool.query(sql, [exam_schedule_id]);
    return rows;
  },

  // Get paket products by classtype
  getProductsPaket: async (classtype: string): Promise<ProductWithPrice[]> => {
    const sql = `
      SELECT
        p.*,
        ph.price,
        ph.is_promo,
        ph.no_promo_price,
        ph.promo_description
      FROM products p
      ${basePriceJoin}
      WHERE p.type = 10
        AND p.classtype = $1
      ORDER BY p.product_id
    `;
    const { rows } = await pool.query(sql, [classtype]);
    return rows;
  },

  // Create a new product
  createProduct: async (productData: CreateProductInput): Promise<Product> => {
    const {
      name,
      description,
      stock,
      type,
      exam_schedule_id,
      features,
      classtype
    } = productData;

    const sql = `
      INSERT INTO products
        (name, description, stock, type, exam_schedule_id, features, classtype, updated_at)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,NOW())
      RETURNING *
    `;
    const params = [
      name,
      description,
      stock,
      type,
      exam_schedule_id,
      features,
      classtype
    ];
    const { rows } = await pool.query(sql, params);
    return rows[0];
  }
};

export default ProductModel;