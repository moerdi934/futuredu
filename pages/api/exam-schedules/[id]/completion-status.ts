// pages/api/exam-schedules/[id]/completion-status.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../../lib/middleware/auth';
import pool from '../../../../lib/db';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    const userId = req.user!.id;
    const { id: examScheduleId } = req.query;

    // Check if all exams in the schedule are submitted
    const query = `
      WITH exam_list AS (
        SELECT 
          es.id as exam_schedule_id,
          es.name as schedule_name,
          unnest(es.exam_id_list) as exam_id
        FROM exam_schedule es
        WHERE es.id = $1
      ),
      session_status AS (
        SELECT 
          el.exam_schedule_id,
          el.schedule_name,
          el.exam_id,
          ts.is_submitted,
          ts.last_save,
          ROW_NUMBER() OVER (PARTITION BY el.exam_id ORDER BY ts.last_save DESC) as rn
        FROM exam_list el
        LEFT JOIN "tExamSession" ts 
          ON ts.exam_id::int = el.exam_id 
          AND ts.exam_schedule_id = el.exam_schedule_id
          AND ts.user_id = $2
      ),
      completion_check AS (
        SELECT 
          exam_schedule_id,
          schedule_name,
          COUNT(*) as total_exams,
          COUNT(CASE WHEN is_submitted = true THEN 1 END) as submitted_exams
        FROM session_status
        WHERE rn = 1 OR rn IS NULL
        GROUP BY exam_schedule_id, schedule_name
      )
      SELECT 
        cc.exam_schedule_id,
        cc.schedule_name,
        cc.total_exams,
        cc.submitted_exams,
        CASE WHEN cc.submitted_exams = cc.total_exams AND cc.total_exams > 0 
          THEN true 
          ELSE false 
        END as is_completed
      FROM completion_check cc
    `;

    const result = await pool.query(query, [examScheduleId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Exam schedule not found',
        is_completed: false
      });
    }

    const data = result.rows[0];

    return res.status(200).json({
      exam_schedule_id: data.exam_schedule_id,
      schedule_name: data.schedule_name,
      total_exams: data.total_exams,
      submitted_exams: data.submitted_exams,
      is_completed: data.is_completed,
      message: data.is_completed 
        ? `Anda telah menyelesaikan semua ${data.total_exams} ujian dalam try out ini. Skor Anda: ${data.submitted_exams}/${data.total_exams} ujian selesai.`
        : `Anda telah menyelesaikan ${data.submitted_exams} dari ${data.total_exams} ujian.`
    });
  } catch (error) {
    console.error('Error checking completion status:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      is_completed: false
    });
  }
}