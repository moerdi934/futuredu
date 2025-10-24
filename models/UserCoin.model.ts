// models/UserCoin.model.ts
import { Pool, PoolClient } from 'pg';
import pool from '../lib/db';

// Types
export interface UserCoin {
  id: number;
  user_id: number;
  coin_type: 'class' | 'course' | 'tryout';
  amount: number;
  remaining: number;
  purchase_date: Date;
  expiry_date: Date;
  source?: string;
  reference_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserCoinMutation {
  id: number;
  user_id: number;
  coin_type: 'class' | 'course' | 'tryout';
  mutation_type: 'credit' | 'debit';
  amount: number;
  user_coin_id?: number;
  description?: string;
  reference_id?: number;
  reference_type?: string;
  balance_before: number;
  balance_after: number;
  created_at: Date;
}

export interface CoinBalance {
  coin_type: 'class' | 'course' | 'tryout';
  total_balance: number;
  expiring_soon: number; // coins expiring in 30 days
}

export interface CoinUsageRequest {
  user_id: number;
  coin_type: 'class' | 'course' | 'tryout';
  amount: number;
  description: string;
  reference_id?: number;
  reference_type?: string;
}

export interface CoinTopupRequest {
  user_id: number;
  coin_type: 'class' | 'course' | 'tryout';
  amount: number;
  source?: string;
  reference_id?: number;
}

class UserCoinModel {
  /* ────────────────────────────────────────────────────────────────────── */
  /* 1. Get User Coin Balances                                             */
  /* ────────────────────────────────────────────────────────────────────── */
  static async getUserCoinBalances(
    userId: number,
    client: PoolClient = pool
  ): Promise<CoinBalance[]> {
    try {
      const query = `
        SELECT 
          coin_type,
          COALESCE(SUM(remaining), 0) as total_balance,
          COALESCE(SUM(CASE 
            WHEN expiry_date <= NOW() + INTERVAL '30 days' AND remaining > 0 
            THEN remaining 
            ELSE 0 
          END), 0) as expiring_soon
        FROM user_coin
        WHERE user_id = $1 
          AND remaining > 0 
          AND expiry_date > NOW()
        GROUP BY coin_type
        ORDER BY coin_type
      `;
      
      const { rows } = await client.query(query, [userId]);
      
      // Ensure all coin types are represented
      const coinTypes: ('class' | 'course' | 'tryout')[] = ['class', 'course', 'tryout'];
      const balances: CoinBalance[] = coinTypes.map(type => {
        const existing = rows.find(r => r.coin_type === type);
        return {
          coin_type: type,
          total_balance: existing ? parseFloat(existing.total_balance) : 0,
          expiring_soon: existing ? parseFloat(existing.expiring_soon) : 0
        };
      });
      
      return balances;
    } catch (error) {
      console.error('Error getting user coin balances:', error);
      throw new Error('Failed to get coin balances');
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 2. Check if user has sufficient coins                                 */
  /* ────────────────────────────────────────────────────────────────────── */
  static async hasSufficientCoins(
    userId: number,
    coinType: 'class' | 'course' | 'tryout',
    requiredAmount: number,
    client: PoolClient = pool
  ): Promise<boolean> {
    try {
      const query = `
        SELECT COALESCE(SUM(remaining), 0) as total_balance
        FROM user_coin
        WHERE user_id = $1 
          AND coin_type = $2 
          AND remaining > 0 
          AND expiry_date > NOW()
      `;
      
      const { rows } = await client.query(query, [userId, coinType]);
      const totalBalance = parseFloat(rows[0]?.total_balance || '0');
      
      return totalBalance >= requiredAmount;
    } catch (error) {
      console.error('Error checking coin balance:', error);
      throw new Error('Failed to check coin balance');
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 3. Add coins to user account (topup)                                  */
  /* ────────────────────────────────────────────────────────────────────── */
  static async addCoins(
    request: CoinTopupRequest,
    client: PoolClient = pool
  ): Promise<UserCoin> {
    try {
      const { user_id, coin_type, amount, source = 'purchase', reference_id } = request;
      
      // Calculate expiry date (1 year from now)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      // Insert new coin record
      const insertQuery = `
        INSERT INTO user_coin (
          user_id, coin_type, amount, remaining, 
          purchase_date, expiry_date, source, reference_id
        )
        VALUES ($1, $2, $3, $3, NOW(), $4, $5, $6)
        RETURNING *
      `;
      
      const { rows } = await client.query(insertQuery, [
        user_id, coin_type, amount, expiryDate, source, reference_id
      ]);
      
      const newCoin = rows[0];
      
      // Log the credit mutation
      await this.logCoinMutation({
        user_id,
        coin_type,
        mutation_type: 'credit',
        amount,
        user_coin_id: newCoin.id,
        description: `Coin topup from ${source}`,
        reference_id,
        reference_type: 'topup',
        balance_before: 0,
        balance_after: amount
      }, client);
      
      return newCoin;
    } catch (error) {
      console.error('Error adding coins:', error);
      throw new Error('Failed to add coins');
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 4. Use coins with FIFO logic                                          */
  /* ────────────────────────────────────────────────────────────────────── */
  static async useCoins(
    request: CoinUsageRequest,
    client: PoolClient = pool
  ): Promise<{ success: boolean; coins_used: UserCoin[] }> {
    try {
      const { user_id, coin_type, amount, description, reference_id, reference_type } = request;
      
      // First check if user has sufficient coins
      const hasSufficient = await this.hasSufficientCoins(user_id, coin_type, amount, client);
      if (!hasSufficient) {
        throw new Error(`Insufficient ${coin_type} coins. Required: ${amount}`);
      }
      
      // Get available coins in FIFO order (oldest first)
      const availableCoinsQuery = `
        SELECT *
        FROM user_coin
        WHERE user_id = $1 
          AND coin_type = $2 
          AND remaining > 0 
          AND expiry_date > NOW()
        ORDER BY purchase_date ASC, id ASC
        FOR UPDATE
      `;
      
      const { rows: availableCoins } = await client.query(availableCoinsQuery, [user_id, coin_type]);
      
      let remainingToUse = amount;
      const coinsUsed: UserCoin[] = [];
      
      // Use coins in FIFO order
      for (const coin of availableCoins) {
        if (remainingToUse <= 0) break;
        
        const amountToUse = Math.min(remainingToUse, coin.remaining);
        const newRemaining = coin.remaining - amountToUse;
        
        // Update the coin record
        await client.query(
          `UPDATE user_coin 
           SET remaining = $1, updated_at = NOW() 
           WHERE id = $2`,
          [newRemaining, coin.id]
        );
        
        // Log the debit mutation
        await this.logCoinMutation({
          user_id,
          coin_type,
          mutation_type: 'debit',
          amount: amountToUse,
          user_coin_id: coin.id,
          description,
          reference_id,
          reference_type,
          balance_before: coin.remaining,
          balance_after: newRemaining
        }, client);
        
        coinsUsed.push({
          ...coin,
          remaining: newRemaining
        });
        
        remainingToUse -= amountToUse;
      }
      
      if (remainingToUse > 0) {
        throw new Error('Insufficient coins after FIFO processing');
      }
      
      return { success: true, coins_used: coinsUsed };
    } catch (error) {
      console.error('Error using coins:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to use coins');
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 5. Log coin mutation                                                   */
  /* ────────────────────────────────────────────────────────────────────── */
  static async logCoinMutation(
    mutation: Omit<UserCoinMutation, 'id' | 'created_at'>,
    client: PoolClient = pool
  ): Promise<UserCoinMutation> {
    try {
      const query = `
        INSERT INTO user_coin_mutation (
          user_id, coin_type, mutation_type, amount, user_coin_id,
          description, reference_id, reference_type, balance_before, balance_after
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      
      const { rows } = await client.query(query, [
        mutation.user_id,
        mutation.coin_type,
        mutation.mutation_type,
        mutation.amount,
        mutation.user_coin_id,
        mutation.description,
        mutation.reference_id,
        mutation.reference_type,
        mutation.balance_before,
        mutation.balance_after
      ]);
      
      return rows[0];
    } catch (error) {
      console.error('Error logging coin mutation:', error);
      throw new Error('Failed to log coin mutation');
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 6. Get user coin history                                               */
  /* ────────────────────────────────────────────────────────────────────── */
  static async getUserCoinHistory(
    userId: number,
    coinType?: 'class' | 'course' | 'tryout',
    limit: number = 50,
    offset: number = 0,
    client: PoolClient = pool
  ): Promise<UserCoinMutation[]> {
    try {
      let query = `
        SELECT *
        FROM user_coin_mutation
        WHERE user_id = $1
      `;
      
      const params: any[] = [userId];
      
      if (coinType) {
        query += ` AND coin_type = $2`;
        params.push(coinType);
      }
      
      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const { rows } = await client.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error getting coin history:', error);
      throw new Error('Failed to get coin history');
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 7. Clean up expired coins                                              */
  /* ────────────────────────────────────────────────────────────────────── */
  static async cleanupExpiredCoins(client: PoolClient = pool): Promise<number> {
    try {
      // Get expired coins that still have remaining balance
      const expiredCoinsQuery = `
        SELECT id, user_id, coin_type, remaining
        FROM user_coin
        WHERE expiry_date < NOW() AND remaining > 0
      `;
      
      const { rows: expiredCoins } = await client.query(expiredCoinsQuery);
      
      if (expiredCoins.length === 0) {
        return 0;
      }
      
      // Log mutations for expired coins
      for (const coin of expiredCoins) {
        await this.logCoinMutation({
          user_id: coin.user_id,
          coin_type: coin.coin_type,
          mutation_type: 'debit',
          amount: coin.remaining,
          user_coin_id: coin.id,
          description: 'Coin expired',
          reference_type: 'expiry',
          balance_before: coin.remaining,
          balance_after: 0
        }, client);
      }
      
      // Set remaining to 0 for expired coins
      const { rowCount } = await client.query(`
        UPDATE user_coin 
        SET remaining = 0, updated_at = NOW()
        WHERE expiry_date < NOW() AND remaining > 0
      `);
      
      return rowCount || 0;
    } catch (error) {
      console.error('Error cleaning up expired coins:', error);
      throw new Error('Failed to cleanup expired coins');
    }
  }

  /* ────────────────────────────────────────────────────────────────────── */
  /* 8. Get coin summary for user                                           */
  /* ────────────────────────────────────────────────────────────────────── */
  static async getCoinSummary(
    userId: number,
    client: PoolClient = pool
  ): Promise<{
    balances: CoinBalance[];
    total_spent_this_month: number;
    total_earned_this_month: number;
  }> {
    try {
      const balances = await this.getUserCoinBalances(userId, client);
      
      // Get spending/earning stats for current month
      const statsQuery = `
        SELECT 
          mutation_type,
          COALESCE(SUM(amount), 0) as total_amount
        FROM user_coin_mutation
        WHERE user_id = $1 
          AND created_at >= DATE_TRUNC('month', NOW())
        GROUP BY mutation_type
      `;
      
      const { rows: stats } = await client.query(statsQuery, [userId]);
      
      const spentThisMonth = parseFloat(stats.find(s => s.mutation_type === 'debit')?.total_amount || '0');
      const earnedThisMonth = parseFloat(stats.find(s => s.mutation_type === 'credit')?.total_amount || '0');
      
      return {
        balances,
        total_spent_this_month: spentThisMonth,
        total_earned_this_month: earnedThisMonth
      };
    } catch (error) {
      console.error('Error getting coin summary:', error);
      throw new Error('Failed to get coin summary');
    }
  }
}

export default UserCoinModel;