// models/products.model.ts - Updated with Coin System Support
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
  is_stackable: boolean;
  coin_price?: number; // NEW: Price in coins
  coin_type?: 'class' | 'course' | 'tryout'; // NEW: Type of coin required
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

// NEW: Coin reward interface
export interface ProductCoinReward {
  product_id: number;
  coin_type: 'class' | 'course' | 'tryout';
  amount: number;
}

export interface ProductWithPrice extends Product {
  price?: number;
  is_promo?: boolean;
  no_promo_price?: number;
  promo_description?: string;
  coin_rewards?: ProductCoinReward[]; // NEW: Coin rewards this product gives
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
  coin_rewards: ProductCoinReward[]; // NEW: Coin rewards this product gives
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
  is_stackable?: boolean;
  coin_price?: number; // NEW
  coin_type?: 'class' | 'course' | 'tryout'; // NEW
  coin_rewards?: ProductCoinReward[]; // NEW: For coin topup products
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

// NEW: Coin rewards join
const coinRewardsJoin = `
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'coin_type', pc.coin_type,
            'amount', pc.amount
          )
        ) FILTER (WHERE pc.coin_type IS NOT NULL),
        '[]'::json
      ) as coin_rewards
    FROM product_coin pc
    WHERE pc.product_id = p.product_id
  ) pcr ON TRUE
`;

const ProductModel = {
  // Get all products + price + coin info
  getProducts: async (): Promise<ProductWithPrice[]> => {
    const sql = `
      SELECT
        p.*,
        ph.price,
        ph.is_promo,
        ph.no_promo_price,
        ph.promo_description,
        pcr.coin_rewards
      FROM products p
      ${basePriceJoin}
      ${coinRewardsJoin}
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

    // 5. NEW: Coin rewards
    const { rows: coinRewardRows } = await pool.query(`
      SELECT coin_type, amount
      FROM product_coin
      WHERE product_id = $1
      ORDER BY coin_type
    `, [id]);

    return {
      ...product,
      price_history: priceRows,
      courses: courseRows,
      exams: examRows,
      coin_rewards: coinRewardRows
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

  // NEW: Set product coin rewards
  setProductCoinRewards: async (product_id: string | number, coinRewards: ProductCoinReward[], client: PoolClient): Promise<void> => {
    // Delete existing coin rewards
    await client.query('DELETE FROM product_coin WHERE product_id = $1', [product_id]);
    
    // Insert new coin rewards
    for (const reward of coinRewards) {
      await client.query(`
        INSERT INTO product_coin (product_id, coin_type, amount)
        VALUES ($1, $2, $3)
      `, [product_id, reward.coin_type, reward.amount]);
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
        ph.promo_description,
        pcr.coin_rewards
      FROM products p
      LEFT JOIN exam_schedule es ON es.id = p.exam_schedule_id
      ${basePriceJoin}
      ${coinRewardsJoin}
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
        ph.promo_description,
        pcr.coin_rewards
      FROM products p
      ${basePriceJoin}
      ${coinRewardsJoin}
      WHERE p.type = 14  -- Paket products
        AND p.classtype = $1
      ORDER BY p.product_id
    `;
    const { rows } = await pool.query(sql, [classtype]);
    return rows;
  },

  // NEW: Get coin topup products
  getCoinTopupProducts: async (): Promise<ProductWithPrice[]> => {
    const sql = `
      SELECT
        p.*,
        ph.price,
        ph.is_promo,
        ph.no_promo_price,
        ph.promo_description,
        pcr.coin_rewards
      FROM products p
      ${basePriceJoin}
      ${coinRewardsJoin}
      WHERE p.type = 15  -- Coin topup products
      ORDER BY p.product_id
    `;
    const { rows } = await pool.query(sql);
    return rows;
  },

  // NEW: Get products that can be bought with coins
  getProductsBuyableWithCoins: async (coinType?: 'class' | 'course' | 'tryout'): Promise<ProductWithPrice[]> => {
    let sql = `
      SELECT
        p.*,
        ph.price,
        ph.is_promo,
        ph.no_promo_price,
        ph.promo_description,
        pcr.coin_rewards
      FROM products p
      ${basePriceJoin}
      ${coinRewardsJoin}
      WHERE p.coin_price IS NOT NULL
        AND p.coin_type IS NOT NULL
    `;
    
    const params: any[] = [];
    
    if (coinType) {
      sql += ` AND p.coin_type = $1`;
      params.push(coinType);
    }
    
    sql += ` ORDER BY p.product_id`;
    
    const { rows } = await pool.query(sql, params);
    return rows;
  },

  // Create a new product with coin support
  createProduct: async (productData: CreateProductInput): Promise<Product> => {
    const {
      name,
      description,
      stock,
      type,
      exam_schedule_id,
      features,
      classtype,
      is_stackable = true,
      coin_price,
      coin_type,
      coin_rewards = []
    } = productData;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert the product
      const sql = `
        INSERT INTO products
          (name, description, stock, type, exam_schedule_id, features, classtype, is_stackable, coin_price, coin_type, updated_at)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
        RETURNING *
      `;
      const params = [
        name,
        description,
        stock,
        type,
        exam_schedule_id,
        features,
        classtype,
        is_stackable,
        coin_price || null,
        coin_type || null
      ];
      const { rows } = await client.query(sql, params);
      const product = rows[0];
      
      // Insert coin rewards if provided
      if (coin_rewards.length > 0) {
        await ProductModel.setProductCoinRewards(product.product_id, coin_rewards, client);
      }
      
      await client.query('COMMIT');
      return product;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Helper: Update product stackability
  updateProductStackability: async (product_id: string | number, is_stackable: boolean, client: PoolClient = pool): Promise<boolean> => {
    try {
      const { rowCount } = await client.query(
        `UPDATE products 
         SET is_stackable = $1, updated_at = NOW() 
         WHERE product_id = $2`,
        [is_stackable, product_id]
      );
      return rowCount === 1;
    } catch (error) {
      console.error('Error updating product stackability:', error);
      throw new Error('Failed to update product stackability');
    }
  },

  // NEW: Update product coin settings
  updateProductCoinSettings: async (
    product_id: string | number, 
    coin_price: number | null, 
    coin_type: 'class' | 'course' | 'tryout' | null, 
    client: PoolClient = pool
  ): Promise<boolean> => {
    try {
      const { rowCount } = await client.query(
        `UPDATE products 
         SET coin_price = $1, coin_type = $2, updated_at = NOW() 
         WHERE product_id = $3`,
        [coin_price, coin_type, product_id]
      );
      return rowCount === 1;
    } catch (error) {
      console.error('Error updating product coin settings:', error);
      throw new Error('Failed to update product coin settings');
    }
  },

  // Helper: Get product type info for validation
  getProductTypeInfo: async (product_id: string | number, client: PoolClient = pool): Promise<{
    type: number;
    is_stackable: boolean;
    stock: number;
    name: string;
    coin_price?: number;
    coin_type?: string;
  } | null> => {
    try {
      const { rows } = await client.query(
        `SELECT type, is_stackable, stock, name, coin_price, coin_type
         FROM products 
         WHERE product_id = $1`,
        [product_id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error getting product type info:', error);
      throw new Error('Failed to get product info');
    }
  },

  // NEW: Get coin balance requirements for cart items
  getCoinRequirementsForCart: async (productIds: number[], client: PoolClient = pool): Promise<{
    class_coins: number;
    course_coins: number;
    tryout_coins: number;
  }> => {
    try {
      const { rows } = await client.query(`
        SELECT 
          coin_type,
          COALESCE(SUM(coin_price), 0) as total_required
        FROM products
        WHERE product_id = ANY($1::int[])
          AND coin_price IS NOT NULL
          AND coin_type IS NOT NULL
        GROUP BY coin_type
      `, [productIds]);
      
      const requirements = {
        class_coins: 0,
        course_coins: 0,
        tryout_coins: 0
      };
      
      rows.forEach(row => {
        const key = `${row.coin_type}_coins` as keyof typeof requirements;
        requirements[key] = parseFloat(row.total_required);
      });
      
      return requirements;
    } catch (error) {
      console.error('Error getting coin requirements:', error);
      throw new Error('Failed to get coin requirements');
    }
  },

  // NEW: Validate if user can purchase with coins
  validateCoinPurchase: async (
    userId: number,
    productId: number,
    client: PoolClient = pool
  ): Promise<{
    can_purchase: boolean;
    required_coins: number;
    user_balance: number;
    coin_type: string;
    error_message?: string;
  }> => {
    try {
      // Get product coin requirements
      const product = await ProductModel.getProductTypeInfo(productId, client);
      
      if (!product) {
        return {
          can_purchase: false,
          required_coins: 0,
          user_balance: 0,
          coin_type: '',
          error_message: 'Product not found'
        };
      }
      
      if (!product.coin_price || !product.coin_type) {
        return {
          can_purchase: false,
          required_coins: 0,
          user_balance: 0,
          coin_type: '',
          error_message: 'Product cannot be purchased with coins'
        };
      }
      
      // Get user coin balance
      const { rows: balanceRows } = await client.query(`
        SELECT COALESCE(SUM(remaining), 0) as total_balance
        FROM user_coin
        WHERE user_id = $1 
          AND coin_type = $2 
          AND remaining > 0 
          AND expiry_date > NOW()
      `, [userId, product.coin_type]);
      
      const userBalance = parseFloat(balanceRows[0]?.total_balance || '0');
      const requiredCoins = product.coin_price;
      
      return {
        can_purchase: userBalance >= requiredCoins,
        required_coins: requiredCoins,
        user_balance: userBalance,
        coin_type: product.coin_type,
        error_message: userBalance < requiredCoins ? 
          `Insufficient ${product.coin_type} coins. You have ${userBalance}, need ${requiredCoins}` : 
          undefined
      };
      
    } catch (error) {
      console.error('Error validating coin purchase:', error);
      return {
        can_purchase: false,
        required_coins: 0,
        user_balance: 0,
        coin_type: '',
        error_message: 'Failed to validate coin purchase'
      };
    }
  }
};

export default ProductModel;