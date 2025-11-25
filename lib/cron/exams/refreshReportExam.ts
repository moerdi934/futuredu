// lib/cron/refreshReportExam.ts
import cron from 'node-cron';
import pool from '../db';

export const scheduleReportExamRefresh = () => {
  cron.schedule('0 */3 * * *', async () => {
    try {
      const startTime = Date.now();
      
      await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_subjectperformance');
      await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_weeklyprogressdata');
      await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_recentexamresult');
      await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_progressdetail');
      await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_topicdata');
      await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_userglobaldata');
      await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_competitiveanalysis');
      
      const duration = Date.now() - startTime;
      console.log(`Report exam views refreshed in ${duration}ms`);
    } catch (error) {
      console.error('Error refreshing report exam views:', error);
    }
  });
};

export const manualRefreshReportExam = async (): Promise<void> => {
  try {
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_subjectperformance');
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_weeklyprogressdata');
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_recentexamresult');
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_progressdetail');
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_topicdata');
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_userglobaldata');
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_competitiveanalysis');
  } catch (error) {
    console.error('Error in manual refresh:', error);
    throw error;
  }
};