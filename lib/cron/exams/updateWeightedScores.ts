// lib/cron/updateWeightedScores.ts
import cron from 'node-cron';
import pool from '../db';

/**
 * Update weighted scores using IRT 3PL for all eligible exam schedules
 */
export const updateWeightedScoresIRT = async (): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM update_weighted_scores_irt_3pl()');
    
    // Silent execution - no logging
    // If you want minimal logging, uncomment below:
    // console.log(`Weighted scores updated for ${result.rows.length} exam schedules`);
  } catch (error) {
    // Silent error handling - no logging
    // If you want error logging, uncomment below:
    // console.error('Error updating weighted scores:', error);
  }
};

/**
 * Schedule weighted score updates every Monday at 00:00
 */
export const scheduleWeightedScoreUpdates = () => {
  // Cron expression: "0 0 * * 1" = Every Monday at 00:00
  // Minute Hour Day Month DayOfWeek
  cron.schedule('0 0 * * 1', async () => {
    await updateWeightedScoresIRT();
  }, {
    timezone: "Asia/Jakarta" // Adjust to your timezone
  });

  // Optional: Log that cron is scheduled (comment out for complete silence)
  // console.log('Weighted score update cron job scheduled (Every Monday at 00:00)');
};

/**
 * Manual trigger for weighted score updates (for admin use)
 */
export const manualUpdateWeightedScores = async (): Promise<{
  success: boolean;
  schedules_updated: number;
  total_users_updated: number;
  results: any[];
  error?: string;
}> => {
  try {
    const result = await pool.query('SELECT * FROM update_weighted_scores_irt_3pl()');
    
    const totalUsers = result.rows.reduce((sum, row) => sum + row.users_updated, 0);
    
    return {
      success: true,
      schedules_updated: result.rows.length,
      total_users_updated: totalUsers,
      results: result.rows
    };
  } catch (error: any) {
    return {
      success: false,
      schedules_updated: 0,
      total_users_updated: 0,
      results: [],
      error: error.message
    };
  }
};

/**
 * Update weighted scores for a single exam schedule
 */
export const updateWeightedScoresSingle = async (
  examScheduleId: number
): Promise<{
  success: boolean;
  users_updated: number;
  execution_time_ms: number;
  message: string;
}> => {
  try {
    const result = await pool.query(
      'SELECT * FROM update_weighted_scores_irt_3pl_single($1)',
      [examScheduleId]
    );
    
    if (result.rows.length === 0) {
      return {
        success: false,
        users_updated: 0,
        execution_time_ms: 0,
        message: 'No result returned'
      };
    }
    
    const row = result.rows[0];
    return {
      success: row.success,
      users_updated: row.users_updated,
      execution_time_ms: row.execution_time_ms,
      message: row.message
    };
  } catch (error: any) {
    return {
      success: false,
      users_updated: 0,
      execution_time_ms: 0,
      message: error.message
    };
  }
};