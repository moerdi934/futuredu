// controllers/Coin.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PoolClient } from 'pg';
import pool from '../lib/db';
import UserCoinModel, { CoinUsageRequest } from '../models/UserCoin.model';
import { AuthenticatedRequest } from '../lib/middleware/auth';

// Types
export interface CoinPurchaseRequest extends AuthenticatedRequest {
  body: {
    productId: number;
    coinType: 'class' | 'course' | 'tryout';
  };
}

export interface CoinBalanceResponse {
  success: boolean;
  data?: {
    balances: Array<{
      coin_type: string;
      total_balance: number;
      expiring_soon: number;
    }>;
    summary: {
      total_spent_this_month: number;
      total_earned_this_month: number;
    };
  };
  message?: string;
}

export interface CoinPurchaseResponse {
  success: boolean;
  message: string;
  data?: {
    entitlements_granted: string[];
    coins_used: number;
    remaining_balance: number;
  };
}

export interface CoinHistoryResponse {
  success: boolean;
  data?: {
    transactions: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
  message?: string;
}

class CoinController {
  /* ────────────────────────────────────────────────────────────────────── */
  /* 1. GET /api/coins/balance - Get user coin balances                    */
  /* ────────────────────────────────────────────────────────────────────── */
  static async getCoinBalances(
    req: AuthenticatedRequest,
    res: NextApiResponse<CoinBalanceResponse>
  ) {
    try {
      const userId = parseInt(req.user!.id);
      
      const summary = await UserCoinModel.getCoinSummary(userId);
      
      return res.json({
        success: true,
        data: {
          balances: summary.balances,
          summary: {
            total_spent_this_month: summary.total_spent_this_month,
            total_earned_this_month: summary.total_earned_this_month
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting coin balances:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get coin balances'
      });
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 2. POST /api/coins/purchase - Purchase with coins                     */
  /* ────────────────────────────────────────────────────────────────────── */
  static async purchaseWithCoins(
    req: CoinPurchaseRequest,
    res: NextApiResponse<CoinPurchaseResponse>
  ) {
    const client: PoolClient = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const userId = parseInt(req.user!.id);
      const { productId, coinType } = req.body;
      
      if (!productId || !coinType) {
        return res.status(400).json({
          success: false,
          message: 'Product ID and coin type are required'
        });
      }
      
      // Get product details including coin price
      const productQuery = `
        SELECT 
          p.product_id,
          p.name,
          p.type,
          p.coin_price,
          p.coin_type,
          -- Course details
          pc.course_id,
          c.title as course_title,
          -- Class details
          pcl.class_id,
          cl.name as class_name,
          cl.student_list,
          cl.real_start_datetime,
          -- Exam details
          pes.exam_schedule_id,
          es.name as exam_name
        FROM products p
        LEFT JOIN product_courses pc ON p.product_id = pc.product_id
        LEFT JOIN courses c ON pc.course_id = c.id
        LEFT JOIN product_classes pcl ON p.product_id = pcl.product_id
        LEFT JOIN classes cl ON pcl.class_id = cl.id
        LEFT JOIN product_exam_schedules pes ON p.product_id = pes.product_id
        LEFT JOIN exam_schedule es ON pes.exam_schedule_id = es.id
        WHERE p.product_id = $1 AND p.coin_price IS NOT NULL AND p.coin_type = $2
      `;
      
      const { rows: productRows } = await client.query(productQuery, [productId, coinType]);
      
      if (!productRows.length) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or cannot be purchased with coins'
        });
      }
      
      const product = productRows[0];
      const coinPrice = parseFloat(product.coin_price);
      
      // Check if user has sufficient coins
      const hasSufficient = await UserCoinModel.hasSufficientCoins(
        userId, 
        coinType, 
        coinPrice, 
        client
      );
      
      if (!hasSufficient) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${coinType} coins. Required: ${coinPrice}`
        });
      }
      
      // Additional validations based on product type
      if (product.type === 13 && product.class_id) { // Class
        // Check if class has started
        if (product.real_start_datetime && new Date(product.real_start_datetime) < new Date()) {
          throw new Error('Class has already started and cannot be purchased');
        }
        
        // Check if user is already enrolled
        if (product.student_list && product.student_list.includes(userId)) {
          throw new Error('You are already enrolled in this class');
        }
      }
      
      // Use coins
      const usageRequest: CoinUsageRequest = {
        user_id: userId,
        coin_type: coinType,
        amount: coinPrice,
        description: `Purchase: ${product.name}`,
        reference_id: productId,
        reference_type: `${coinType}_purchase`
      };
      
      await UserCoinModel.useCoins(usageRequest, client);
      
      // Grant entitlements based on product type
      const entitlementsGranted: string[] = [];
      
      if (product.type === 12 && product.course_id) { // Course
        await client.query(
          `INSERT INTO course_entitlements (user_id, course_id, granted_at, expires_at)
           VALUES ($1, $2, NOW(), NULL)
           ON CONFLICT (user_id, course_id)
           DO UPDATE SET granted_at = NOW(), expires_at = NULL`,
          [userId, product.course_id]
        );
        entitlementsGranted.push(`Course: ${product.course_title}`);
      }
      
      if (product.type === 13 && product.class_id) { // Class
        await client.query(
          `UPDATE classes
           SET student_list = array_append(student_list, $1::int),
               edit_date = NOW()
           WHERE id = $2 AND NOT ($1::int = ANY(student_list))`,
          [userId, product.class_id]
        );
        entitlementsGranted.push(`Class: ${product.class_name}`);
      }
      
      // Handle exam schedule entitlements for all relevant products
      if (product.exam_schedule_id) {
        await client.query(
          `INSERT INTO exam_schedule_entitlements (user_id, exam_schedule_id, granted_at, expires_at)
           VALUES ($1, $2, NOW(), NULL)
           ON CONFLICT (user_id, exam_schedule_id)
           DO UPDATE SET granted_at = NOW(), expires_at = NULL`,
          [userId, product.exam_schedule_id]
        );
        entitlementsGranted.push(`Exam: ${product.exam_name}`);
      }
      
      // Get remaining balance
      const balances = await UserCoinModel.getUserCoinBalances(userId, client);
      const remainingBalance = balances.find(b => b.coin_type === coinType)?.total_balance || 0;
      
      await client.query('COMMIT');
      
      return res.json({
        success: true,
        message: 'Purchase completed successfully with coins',
        data: {
          entitlements_granted: entitlementsGranted,
          coins_used: coinPrice,
          remaining_balance: remainingBalance
        }
      });
      
    } catch (error: any) {
      console.error('Error purchasing with coins:', error);
      
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Purchase failed'
      });
    } finally {
      client.release();
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 3. GET /api/coins/history - Get coin transaction history              */
  /* ────────────────────────────────────────────────────────────────────── */
  static async getCoinHistory(
    req: AuthenticatedRequest,
    res: NextApiResponse<CoinHistoryResponse>
  ) {
    try {
      const userId = parseInt(req.user!.id);
      const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || '20', 10)));
      const coinType = req.query.coin_type as 'class' | 'course' | 'tryout' | undefined;
      const offset = (page - 1) * limit;
      
      const transactions = await UserCoinModel.getUserCoinHistory(
        userId,
        coinType,
        limit,
        offset
      );
      
      return res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page,
            limit,
            total: transactions.length
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting coin history:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get coin history'
      });
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 4. POST /api/coins/cleanup - Clean up expired coins (admin)           */
  /* ────────────────────────────────────────────────────────────────────── */
  static async cleanupExpiredCoins(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
      const cleanedCount = await UserCoinModel.cleanupExpiredCoins();
      
      return res.json({
        success: true,
        message: `Cleaned up ${cleanedCount} expired coin records`,
        data: { cleaned_count: cleanedCount }
      });
    } catch (error: any) {
      console.error('Error cleaning up expired coins:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to cleanup expired coins'
      });
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 5. Helper: Grant coins from product purchase                          */
  /* ────────────────────────────────────────────────────────────────────── */
  static async grantCoinsFromProduct(
    userId: number,
    productId: number,
    invoiceId: number,
    client: PoolClient = pool
  ): Promise<void> {
    try {
      // Get coin rewards for this product
      const coinRewardsQuery = `
        SELECT coin_type, amount
        FROM product_coin
        WHERE product_id = $1
      `;
      
      const { rows: coinRewards } = await client.query(coinRewardsQuery, [productId]);
      
      for (const reward of coinRewards) {
        await UserCoinModel.addCoins({
          user_id: userId,
          coin_type: reward.coin_type,
          amount: parseFloat(reward.amount),
          source: 'purchase',
          reference_id: invoiceId
        }, client);
      }
    } catch (error) {
      console.error('Error granting coins from product:', error);
      throw new Error('Failed to grant coins');
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 6. GET /api/coins/products - Get products that can be bought with coins */
  /* ────────────────────────────────────────────────────────────────────── */
  static async getCoinsProducts(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
      const coinType = req.query.coin_type as string;
      const productType = req.query.product_type as string;
      
      let query = `
        SELECT 
          p.product_id,
          p.name,
          p.description,
          p.type,
          p.coin_price,
          p.coin_type,
          p.stock
        FROM products p
        WHERE p.coin_price IS NOT NULL
      `;
      
      const params: any[] = [];
      
      if (coinType) {
        query += ` AND p.coin_type = $${params.length + 1}`;
        params.push(coinType);
      }
      
      if (productType) {
        query += ` AND p.type = $${params.length + 1}`;
        params.push(parseInt(productType));
      }
      
      query += ` ORDER BY p.product_id`;
      
      const { rows } = await pool.query(query, params);
      
      return res.json({
        success: true,
        data: rows
      });
    } catch (error: any) {
      console.error('Error getting coins products:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get coins products'
      });
    }
  }
}

export default CoinController;