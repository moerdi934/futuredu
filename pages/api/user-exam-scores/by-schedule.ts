// pages/api/user-exam-scores/by-schedule.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import pool from '../../../lib/db';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, authenticateJWT);
    
    const userId = req.user!.id;

    // Query untuk get completed exam schedules
    // Hanya return schedule yang TIDAK ada active session (semua session sudah submitted)
    const query = `
      WITH active_sessions AS (
        SELECT DISTINCT exam_schedule_id
        FROM "tExamSession"
        WHERE user_id = $1 AND is_submitted = false
      ),
      latest_sessions AS (
        SELECT DISTINCT ON (ts.exam_schedule_id, ts.exam_id)
          ts.exam_schedule_id,
          ts.exam_id,
          ts.user_id,
          ts.is_submitted,
          ts.last_save
        FROM "tExamSession" ts
        WHERE ts.user_id = $1 AND ts.is_submitted = true
        ORDER BY ts.exam_schedule_id, ts.exam_id, ts.last_save DESC
      ),
      schedule_completion AS (
        SELECT 
          ls.exam_schedule_id,
          es.exam_id_list,
          COUNT(DISTINCT ls.exam_id) as completed_exams,
          CARDINALITY(es.exam_id_list) as total_exams
        FROM latest_sessions ls
        JOIN exam_schedule es ON es.id = ls.exam_schedule_id
        WHERE NOT EXISTS (
          SELECT 1 FROM active_sessions acts 
          WHERE acts.exam_schedule_id = ls.exam_schedule_id
        )
        GROUP BY ls.exam_schedule_id, es.exam_id_list
      ),
      completed_schedules AS (
        SELECT exam_schedule_id
        FROM schedule_completion
        WHERE completed_exams = total_exams
      ),
      latest_scores AS (
        SELECT DISTINCT ON (ues.exam_id)
          ues.exam_schedule_id,
          ues.exam_id,
          ues.score,
          ues.weighted_score,
          ues.total_correct,
          ues.total_questions,
          ues.completion_time
        FROM user_exam_scores ues
        JOIN completed_schedules cs ON cs.exam_schedule_id = ues.exam_schedule_id
        WHERE ues.user_id = $1
        ORDER BY ues.exam_id, ues.completion_time DESC
      ),
      aggregated_scores AS (
        SELECT 
          ls.exam_schedule_id,
          es.is_need_weighted_score,
          SUM(CASE 
            WHEN COALESCE(es.is_need_weighted_score, false) = true 
            THEN COALESCE(ls.weighted_score, 0)
            ELSE ls.score
          END) as total_score,
          AVG(CASE 
            WHEN COALESCE(es.is_need_weighted_score, false) = true 
            THEN COALESCE(ls.weighted_score, 0)
            ELSE ls.score
          END) as average_score,
          SUM(ls.total_correct) as total_correct,
          SUM(ls.total_questions) as total_questions,
          MAX(ls.completion_time) as completion_time
        FROM latest_scores ls
        JOIN exam_schedule es ON es.id = ls.exam_schedule_id
        GROUP BY ls.exam_schedule_id, es.is_need_weighted_score
      )
      SELECT 
        agg.exam_schedule_id,
        agg.total_score,
        agg.average_score,
        agg.total_correct,
        agg.total_questions,
        agg.completion_time,
        true as has_completed
      FROM aggregated_scores agg
      ORDER BY agg.completion_time DESC
    `;

    const result = await pool.query(query, [userId]);

    // Convert string numbers to actual numbers
    const formattedRows = result.rows.map(row => ({
      exam_schedule_id: row.exam_schedule_id,
      total_score: parseFloat(row.total_score) || 0,
      average_score: parseFloat(row.average_score) || 0,
      total_correct: parseInt(row.total_correct) || 0,
      total_questions: parseInt(row.total_questions) || 0,
      completion_time: row.completion_time,
      has_completed: row.has_completed
    }));

    return res.status(200).json(formattedRows);
  } catch (error) {
    console.error('Error fetching user scores by schedule:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}