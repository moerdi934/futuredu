// lib/cron/coinCleanup.ts - Cron job for cleaning up expired coins
import { CronJob } from 'cron';
import UserCoinModel from '../../models/UserCoin.model';
import pool from '../db';

class CoinCleanupService {
  private static instance: CoinCleanupService;
  private cleanupJob: CronJob | null = null;
  private isRunning = false;

  static getInstance(): CoinCleanupService {
    if (!CoinCleanupService.instance) {
      CoinCleanupService.instance = new CoinCleanupService();
    }
    return CoinCleanupService.instance;
  }

  /**
   * Initialize and start the cleanup cron job
   * Runs daily at 2:00 AM
   */
  public initializeCleanup(): void {
    if (this.cleanupJob) {
      console.log('Coin cleanup job already initialized');
      return;
    }

    // Run daily at 2:00 AM
    this.cleanupJob = new CronJob(
      '0 2 * * *', // Cron pattern: minute hour day month dayOfWeek
      this.performCleanup.bind(this),
      null, // onComplete
      false, // start immediately
      'Asia/Jakarta' // timezone
    );

    console.log('Coin cleanup cron job initialized');
    this.start();
  }

  /**
   * Start the cron job
   */
  public start(): void {
    if (this.cleanupJob && !this.cleanupJob.running) {
      this.cleanupJob.start();
      console.log('Coin cleanup cron job started');
    }
  }

  /**
   * Stop the cron job
   */
  public stop(): void {
    if (this.cleanupJob && this.cleanupJob.running) {
      this.cleanupJob.stop();
      console.log('Coin cleanup cron job stopped');
    }
  }

  /**
   * Perform the actual cleanup of expired coins
   */
  private async performCleanup(): Promise<void> {
    if (this.isRunning) {
      console.log('Coin cleanup already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('Starting coin cleanup process...');

      // Clean up expired coins
      const cleanedCount = await UserCoinModel.cleanupExpiredCoins();

      // Log cleanup statistics
      await this.logCleanupStats(cleanedCount, startTime);

      console.log(`Coin cleanup completed successfully. Cleaned ${cleanedCount} expired coin records.`);

    } catch (error) {
      console.error('Error during coin cleanup:', error);
      
      // Log the error to database
      await this.logCleanupError(error);
      
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Log cleanup statistics to database
   */
  private async logCleanupStats(cleanedCount: number, startTime: number): Promise<void> {
    try {
      const endTime = Date.now();
      const duration = endTime - startTime;

      await pool.query(`
        INSERT INTO coin_cleanup_logs (
          cleanup_date, 
          cleaned_count, 
          duration_ms, 
          status,
          details
        ) VALUES (NOW(), $1, $2, 'success', $3)
      `, [
        cleanedCount,
        duration,
        JSON.stringify({
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
          cleaned_records: cleanedCount
        })
      ]);

    } catch (error) {
      console.error('Error logging cleanup stats:', error);
    }
  }

  /**
   * Log cleanup errors to database
   */
  private async logCleanupError(error: any): Promise<void> {
    try {
      await pool.query(`
        INSERT INTO coin_cleanup_logs (
          cleanup_date, 
          cleaned_count, 
          duration_ms, 
          status,
          error_message,
          details
        ) VALUES (NOW(), 0, 0, 'error', $1, $2)
      `, [
        error.message || 'Unknown error',
        JSON.stringify({
          error: error.toString(),
          stack: error.stack
        })
      ]);

    } catch (logError) {
      console.error('Error logging cleanup error:', logError);
    }
  }

  /**
   * Get cleanup history
   */
  public async getCleanupHistory(limit: number = 30): Promise<any[]> {
    try {
      const { rows } = await pool.query(`
        SELECT 
          cleanup_date,
          cleaned_count,
          duration_ms,
          status,
          error_message,
          details
        FROM coin_cleanup_logs
        ORDER BY cleanup_date DESC
        LIMIT $1
      `, [limit]);

      return rows;
    } catch (error) {
      console.error('Error fetching cleanup history:', error);
      return [];
    }
  }

  /**
   * Manual cleanup trigger (for admin use)
   */
  public async triggerManualCleanup(): Promise<{ success: boolean; message: string; cleanedCount?: number }> {
    if (this.isRunning) {
      return {
        success: false,
        message: 'Cleanup is already running'
      };
    }

    try {
      await this.performCleanup();
      
      // Get the latest cleanup result
      const history = await this.getCleanupHistory(1);
      const latestCleanup = history[0];
      
      return {
        success: true,
        message: 'Manual cleanup completed successfully',
        cleanedCount: latestCleanup?.cleaned_count || 0
      };
    } catch (error) {
      return {
        success: false,
        message: `Manual cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check if cleanup is currently running
   */
  public isCleanupRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get next scheduled cleanup time
   */
  public getNextCleanupTime(): Date | null {
    if (this.cleanupJob) {
      return this.cleanupJob.nextDate().toDate();
    }
    return null;
  }

  /**
   * Get coin statistics for monitoring
   */
  public async getCoinStatistics(): Promise<any> {
    try {
      const { rows } = await pool.query(`
        SELECT 
          coin_type,
          COUNT(*) as total_records,
          SUM(amount) as total_amount,
          SUM(remaining) as total_remaining,
          COUNT(*) FILTER (WHERE remaining > 0) as active_records,
          COUNT(*) FILTER (WHERE expiry_date < NOW() AND remaining > 0) as expired_active,
          COUNT(*) FILTER (WHERE expiry_date <= NOW() + INTERVAL '30 days' AND remaining > 0) as expiring_soon
        FROM user_coin
        GROUP BY coin_type
        ORDER BY coin_type
      `);

      return {
        by_coin_type: rows,
        summary: await this.getOverallCoinSummary()
      };
    } catch (error) {
      console.error('Error getting coin statistics:', error);
      return { by_coin_type: [], summary: {} };
    }
  }

  /**
   * Get overall coin summary
   */
  private async getOverallCoinSummary(): Promise<any> {
    try {
      const { rows } = await pool.query(`
        SELECT 
          COUNT(*) as total_coin_records,
          COUNT(DISTINCT user_id) as total_users_with_coins,
          SUM(amount) as total_coins_issued,
          SUM(remaining) as total_coins_remaining,
          COUNT(*) FILTER (WHERE remaining > 0) as active_records,
          COUNT(*) FILTER (WHERE expiry_date < NOW() AND remaining > 0) as expired_records_to_clean
        FROM user_coin
      `);

      return rows[0] || {};
    } catch (error) {
      console.error('Error getting coin summary:', error);
      return {};
    }
  }
}

export default CoinCleanupService;

// pages/api/admin/coins/cleanup-status.ts - Admin endpoint for cleanup monitoring
import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateToken, requireAdmin } from '../../../../lib/middleware/auth';
import CoinCleanupService from '../../../../lib/cron/coinCleanup';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await authenticateToken(req, res, async () => {
      await requireAdmin(req, res, async () => {
        const cleanupService = CoinCleanupService.getInstance();
        
        const [history, statistics] = await Promise.all([
          cleanupService.getCleanupHistory(10),
          cleanupService.getCoinStatistics()
        ]);

        const status = {
          is_running: cleanupService.isCleanupRunning(),
          next_cleanup: cleanupService.getNextCleanupTime(),
          recent_history: history,
          coin_statistics: statistics
        };

        res.json({ success: true, data: status });
      });
    });
  } catch (error) {
    console.error('Cleanup status API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// pages/api/admin/coins/manual-cleanup.ts - Admin endpoint for manual cleanup
import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateToken, requireAdmin } from '../../../../lib/middleware/auth';
import CoinCleanupService from '../../../../lib/cron/coinCleanup';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await authenticateToken(req, res, async () => {
      await requireAdmin(req, res, async () => {
        const cleanupService = CoinCleanupService.getInstance();
        const result = await cleanupService.triggerManualCleanup();
        
        res.json({
          success: result.success,
          message: result.message,
          data: {
            cleaned_count: result.cleanedCount
          }
        });
      });
    });
  } catch (error) {
    console.error('Manual cleanup API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Create the cleanup logs table (add this to your database schema)
/*
CREATE TABLE coin_cleanup_logs (
    id SERIAL PRIMARY KEY,
    cleanup_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cleaned_count INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'running')),
    error_message TEXT NULL,
    details JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coin_cleanup_logs_date ON coin_cleanup_logs(cleanup_date DESC);
CREATE INDEX idx_coin_cleanup_logs_status ON coin_cleanup_logs(status);
*/

// Initialize the cleanup service in your main application
// Add this to your server startup code (e.g., in pages/api/init.ts or server.js)
/*
import CoinCleanupService from '../lib/cron/coinCleanup';

// Initialize the coin cleanup service
const coinCleanupService = CoinCleanupService.getInstance();
coinCleanupService.initializeCleanup();

console.log('Coin cleanup service initialized');
*/