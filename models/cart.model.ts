// models/cart.model.ts - Updated with is_stackable support
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
  type: number;
  is_stackable: boolean;  // New field
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
export const _findCart = async (userId: string, client: PoolClient = pool): Promise<Cart | null> => {
  const { rows } = await client.query(
    'SELECT * FROM cart WHERE user_id = $1',
    [userId]
  );
  return rows[0] || null;
};

export const _createCart = async (userId: string, client: PoolClient = pool): Promise<Cart> => {
  const { rows } = await client.query(
    'INSERT INTO cart (user_id) VALUES ($1) RETURNING *',
    [userId]
  );
  return rows[0];
};

export const _getOrCreateCart = async (userId: string, client: PoolClient = pool): Promise<Cart> => {
  return (await _findCart(userId, client)) || (await _createCart(userId, client));
};

export const addItem = async (userId: string, productId: number, client: PoolClient = pool): Promise<CartWithProducts> => {
  const cart = await _getOrCreateCart(userId, client);

  // Get product details including is_stackable and stock
  const productCheck = await client.query(
    'SELECT stock, is_stackable, type, name FROM products WHERE product_id = $1',
    [productId]
  );
  
  if (!productCheck.rowCount) {
    throw new Error('Product not found');
  }
  
  const { stock, is_stackable, type, name } = productCheck.rows[0];

  // Check if item already exists in cart
  const existingItem = await client.query(
    'SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
    [cart.id, productId]
  );

  const currentQuantity = existingItem.rows[0]?.quantity || 0;

  // If product is not stackable and already in cart, don't allow adding more
  if (!is_stackable && currentQuantity > 0) {
    throw new Error(`Product "${name}" can only be purchased once. It's already in your cart.`);
  }

  // Calculate new quantity
  const newQuantity = currentQuantity + 1;

  // Check stock availability
  if (newQuantity > stock) {
    if (type === 13) { // Class products
      throw new Error(`Not enough slots available for class "${name}". Available: ${stock}, Requested: ${newQuantity}`);
    } else {
      throw new Error(`Not enough stock for product "${name}". Available: ${stock}, Requested: ${newQuantity}`);
    }
  }

  // Add or update cart item
  const upsertSQL = `
    INSERT INTO cart_items (cart_id, product_id, quantity)
    VALUES ($1, $2, 1)
    ON CONFLICT (cart_id, product_id)
    DO UPDATE SET quantity = cart_items.quantity + 1,
                  updated_at = NOW()
    RETURNING quantity
  `;
  
  await client.query(upsertSQL, [cart.id, productId]);

  // Update cart timestamp
  await client.query('UPDATE cart SET updated_at = NOW() WHERE id = $1', [cart.id]);
  
  return getCartWithProducts(userId, client);
};

export const decreaseItem = async (userId: string, productId: number, client: PoolClient = pool): Promise<CartWithProducts> => {
  const cart = await _findCart(userId, client);
  if (!cart) return { cart: null, products: [], totalItems: 0, totalQty: 0 };

  const { rows } = await client.query(
    'SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
    [cart.id, productId]
  );
  
  if (!rows.length) return getCartWithProducts(userId, client); // nothing to do

  if (rows[0].quantity > 1) {
    await client.query(
      'UPDATE cart_items SET quantity = quantity - 1, updated_at = NOW() WHERE cart_id = $1 AND product_id = $2',
      [cart.id, productId]
    );
  } else {
    await client.query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cart.id, productId]
    );
  }

  await client.query('UPDATE cart SET updated_at = NOW() WHERE id = $1', [cart.id]);
  return getCartWithProducts(userId, client);
};

export const removeItem = async (userId: string, productId: number, client: PoolClient = pool): Promise<CartWithProducts> => {
  const cart = await _findCart(userId, client);
  if (!cart) return { cart: null, products: [], totalItems: 0, totalQty: 0 };

  await client.query(
    'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
    [cart.id, productId]
  );
  await client.query('UPDATE cart SET updated_at = NOW() WHERE id = $1', [cart.id]);
  return getCartWithProducts(userId, client);
};

export const clearCart = async (userId: string, client: PoolClient = pool): Promise<CartWithProducts> => {
  const cart = await _findCart(userId, client);
  if (!cart) return { cart: null, products: [], totalItems: 0, totalQty: 0 };

  await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
  await client.query('UPDATE cart SET updated_at = NOW() WHERE id = $1', [cart.id]);
  return getCartWithProducts(userId, client);
};

export const getCartWithProducts = async (userId: string, client: PoolClient = pool): Promise<CartWithProducts> => {
  const cart = await _findCart(userId, client);
  if (!cart)
    return { cart: null, products: [], totalItems: 0, totalQty: 0 };

  const sql = `
    SELECT
      ci.product_id,
      ci.quantity,
      p.*,
      COALESCE(price_sub.price, 0) as current_price
    FROM cart_items ci
    JOIN products p ON p.product_id = ci.product_id
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
  const { rows } = await client.query(sql, [cart.id]);

  const totalQty = rows.reduce((s: number, r: any) => s + r.quantity, 0);
  return { cart, products: rows, totalItems: rows.length, totalQty };
};

export const getSelectedItems = async (userId: string, ids: number[], client: PoolClient = pool): Promise<CartWithSelectedProducts> => {
  const cart = await _findCart(userId, client);
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
           COALESCE(ap.price, 0) AS current_price
      FROM cart_items ci
      JOIN products      p  ON p.product_id = ci.product_id
      LEFT JOIN active_price  ap ON ap.product_id = p.product_id
     WHERE ci.cart_id = $1
       AND ci.product_id = ANY($2::int[])
     ORDER BY ci.updated_at DESC`;
  const { rows } = await client.query(sql, [cart.id, ids]);
  return { cart, products: rows };
};