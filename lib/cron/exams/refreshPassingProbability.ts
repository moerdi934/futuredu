/**
 * Cron job to refresh materialized view mv_passing_probability
 * Should be run after exam completion or when target changes
 */

import pool from '../../db';

export async function refreshPassingProbability() {
  const startTime = Date.now();
  console.log('[CRON refreshPassingProbability] Starting refresh...');

  try {
    // Refresh materialized view
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_passing_probability');
    
    const duration = Date.now() - startTime;
    console.log(`[CRON refreshPassingProbability] ✓ Completed in ${duration}ms`);
    
    return { success: true, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[CRON refreshPassingProbability] ✗ Failed after ${duration}ms:`, error);
    
    return { success: false, error: error.message, duration };
  }
}

// Run if called directly
if (require.main === module) {
  refreshPassingProbability()
    .then(result => {
      console.log('Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}
