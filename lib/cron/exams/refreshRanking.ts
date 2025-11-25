// lib/cron/refreshRankings.ts
import cron from 'node-cron';
import pool from '../db';

export const scheduleRankingRefresh = () => {
  // Refresh every 3 hours
  cron.schedule('0 */3 * * *', async () => {
    console.log('Starting materialized view refresh...');
    
    try {
      const startTime = Date.now();
      
      // Refresh exam schedule rankings
      await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_exam_schedule_rankings');
      console.log('✓ Refreshed mv_exam_schedule_rankings');
      
      // Refresh user exam schedule summary
      await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_exam_schedule_summary');
      console.log('✓ Refreshed mv_user_exam_schedule_summary');
      
      const duration = Date.now() - startTime;
      console.log(`Materialized views refreshed successfully in ${duration}ms`);
      
    } catch (error) {
      console.error('Error refreshing materialized views:', error);
    }
  });

  console.log('Ranking refresh cron job scheduled (every 3 hours)');
};

// Optional: Manual refresh function for admin use
export const manualRefreshRankings = async (): Promise<void> => {
  try {
    console.log('Manual refresh started...');
    
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_exam_schedule_rankings');
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_exam_schedule_summary');
    
    console.log('Manual refresh completed successfully');
  } catch (error) {
    console.error('Error in manual refresh:', error);
    throw error;
  }
};