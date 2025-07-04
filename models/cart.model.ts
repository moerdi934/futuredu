// models/cart.model.ts
import pool from '../lib/db';
import { PoolClient } from 'pg';

// Types
export interface Cart {
  id: number;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  product_id: number;
  quantity: number;
  updated_at: Date;
}

export interface Product {
  product_id: number;
  name: string;
  description?: string;
  stock: number;
  created_at: Date;
  updated_at: Date;
  [key: string]: any;
}

export interface CartWithProducts {
  cart: Cart | null;
  products: Array<CartItem & Product & { current_price: number }>;
  totalItems: number;
  totalQty: number;
}

export interface CartWithSelectedProducts {
  cart: Cart | null;
  products: Array<CartItem & Product & { current_price: number }>;
}

// Cart Model Functions
export const _findCart = async (userId: string): Promise<Cart | null> => {
  const { rows } = await pool.query(
    'SELECT * FROM cart WHERE user_id = $1',
    [userId]
  );
  return rows[0] || null;
};

export const _createCart = async (userId: string): Promise<Cart> => {
  const { rows } = await pool.query(
    'INSERT INTO cart (user_id) VALUES ($1) RETURNING *',
    [userId]
  );
  return rows[0];
};

export const _getOrCreateCart = async (userId: string): Promise<Cart> => {
  return (await _findCart(userId)) || (await _createCart(userId));
};

export const addItem = async (userId: string, productId: number): Promise<CartWithProducts> => {
  const cart = await _getOrCreateCart(userId);

  // Validasi stok
  const stockCheck = await pool.query(
    'SELECT stock FROM products WHERE product_id = $1',
    [productId]
  );
  if (!stockCheck.rowCount) throw new Error('Product not found');
  const stock = stockCheck.rows[0].stock;

  /* Upsert: kalau qty existing +1 > stock → error */
  const upsertSQL = `
    INSERT INTO cart_items (cart_id, product_id, quantity)
    VALUES ($1, $2, 1)
    ON CONFLICT (cart_id, product_id)
    DO UPDATE SET quantity = cart_items.quantity + 1,
                  updated_at = NOW()
    RETURNING quantity
  `;
  const { rows } = await pool.query(upsertSQL, [cart.id, productId]);
  if (rows[0].quantity > stock) {
    // rollback qty ++ satu langkah
    await pool.query(
      'UPDATE cart_items SET quantity = quantity - 1 WHERE cart_id = $1 AND product_id = $2',
      [cart.id, productId]
    );
    throw new Error('Quantity exceeds available stock');
  }

  await pool.query('UPDATE cart SET updated_at = NOW() WHERE id = $1', [
    cart.id,
  ]);
  return getCartWithProducts(userId);
};

export const decreaseItem = async (userId: string, productId: number): Promise<CartWithProducts> => {
  const cart = await _findCart(userId);
  if (!cart) return { cart: null, products: [], totalItems: 0, totalQty: 0 };

  const { rows } = await pool.query(
    'SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
    [cart.id, productId]
  );
  if (!rows.length) return getCartWithProducts(userId); // nothing to do

  if (rows[0].quantity > 1) {
    await pool.query(
      'UPDATE cart_items SET quantity = quantity - 1, updated_at = NOW() WHERE cart_id = $1 AND product_id = $2',
      [cart.id, productId]
    );
  } else {
    await pool.query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cart.id, productId]
    );
  }

  await pool.query('UPDATE cart SET updated_at = NOW() WHERE id = $1', [
    cart.id,
  ]);
  return getCartWithProducts(userId);
};

export const removeItem = async (userId: string, productId: number): Promise<CartWithProducts> => {
  const cart = await _findCart(userId);
  if (!cart) return { cart: null, products: [], totalItems: 0, totalQty: 0 };

  await pool.query(
    'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
    [cart.id, productId]
  );
  await pool.query('UPDATE cart SET updated_at = NOW() WHERE id = $1', [
    cart.id,
  ]);
  return getCartWithProducts(userId);
};

export const clearCart = async (userId: string): Promise<CartWithProducts> => {
  const cart = await _findCart(userId);
  if (!cart) return { cart: null, products: [], totalItems: 0, totalQty: 0 };

  await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
  await pool.query('UPDATE cart SET updated_at = NOW() WHERE id = $1', [
    cart.id,
  ]);
  return getCartWithProducts(userId);
};

export const getCartWithProducts = async (userId: string): Promise<CartWithProducts> => {
  const cart = await _findCart(userId);
  if (!cart)
    return { cart: null, products: [], totalItems: 0, totalQty: 0 };

  const sql = `
    SELECT
      ci.product_id,
      ci.quantity,
      p.*,
      price_sub.price as current_price
    FROM cart_items ci
    JOIN products p          ON p.product_id = ci.product_id
    LEFT JOIN LATERAL (
      SELECT price
      FROM   product_price_hist pph
      WHERE  pph.product_id = p.product_id
        AND  pph.effective_start <= NOW()
        AND (pph.effective_end IS NULL OR pph.effective_end > NOW())
      ORDER BY pph.effective_start DESC
      LIMIT 1
    ) price_sub ON TRUE
    WHERE ci.cart_id = $1
    ORDER BY ci.updated_at DESC
  `;
  const { rows } = await pool.query(sql, [cart.id]);

  const totalQty = rows.reduce((s: number, r: any) => s + r.quantity, 0);
  return { cart, products: rows, totalItems: rows.length, totalQty };
};

export const getSelectedItems = async (userId: string, ids: number[]): Promise<CartWithSelectedProducts> => {
  const cart = await _findCart(userId);
  if (!cart) return { cart: null, products: [] };

  const sql = `
    WITH active_price AS (
      SELECT DISTINCT ON (product_id)
             product_id, price
      FROM   product_price_hist
      WHERE  effective_start <= NOW()
        AND  (effective_end IS NULL OR effective_end > NOW())
      ORDER  BY product_id, effective_start DESC
    )
    SELECT ci.product_id,
           ci.quantity,
           p.*,
           ap.price AS current_price
      FROM cart_items ci
      JOIN products      p  ON p.product_id = ci.product_id
      JOIN active_price  ap ON ap.product_id = p.product_id
     WHERE ci.cart_id = $1
       AND ci.product_id = ANY($2::int[])
     ORDER BY ci.updated_at DESC`;
  const { rows } = await pool.query(sql, [cart.id, ids]);
  return { cart, products: rows };
};