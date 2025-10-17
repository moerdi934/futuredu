// pages/api/exam-schedules/[id]/scores.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../../lib/middleware/auth';
import pool from '../../../../lib/db';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, authenticateJWT);
    
    const userId = req.user!.id;
    const { id: examScheduleId } = req.query;

    // Get exam schedule details including is_need_weighted_score
    const scheduleQuery = `
      SELECT id, name, exam_id_list, is_need_weighted_score
      FROM exam_schedule
      WHERE id = $1
    `;
    const scheduleResult = await pool.query(scheduleQuery, [examScheduleId]);
    
    if (scheduleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Exam schedule not found' });
    }

    const schedule = scheduleResult.rows[0];
    const isWeighted = schedule.is_need_weighted_score || false;

    // Query to get latest scores for each exam in the schedule
    const scoresQuery = `
      WITH latest_scores AS (
        SELECT DISTINCT ON (ues.exam_id)
          ues.exam_id,
          ues.score,
          ues.weighted_score,
          ues.total_correct,
          ues.total_questions,
          ues.completion_time,
          e.name as exam_name
        FROM user_exam_scores ues
        JOIN exams e ON e.id = ues.exam_id
        WHERE ues.user_id = $1
          AND ues.exam_schedule_id = $2
          AND ues.exam_id = ANY($3::int[])
        ORDER BY ues.exam_id, ues.completion_time DESC
      )
      SELECT 
        exam_name,
        CASE 
          WHEN $4 = true THEN score--COALESCE(weighted_score, 0)
          ELSE score
        END as score,
        total_correct,
        total_questions,
        completion_time
      FROM latest_scores
      ORDER BY exam_id
    `;

    const scoresResult = await pool.query(scoresQuery, [
      userId,
      examScheduleId,
      schedule.exam_id_list,
      isWeighted
    ]);

    if (scoresResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'No scores found for this exam schedule',
        total_score: 0,
        average_score: 0,
        total_correct: 0,
        total_questions: 0,
        exam_scores: [],
        is_need_weighted_score: isWeighted
      });
    }

    // Calculate totals
    const examScores = scoresResult.rows.map(row => ({
      exam_name: row.exam_name,
      score: parseInt(row.score) || 0,
      total_correct: parseInt(row.total_correct) || 0,
      total_questions: parseInt(row.total_questions) || 0,
      completion_time: row.completion_time
    }));

    const totalScore = examScores.reduce((sum, exam) => sum + exam.score, 0);
    const totalCorrect = examScores.reduce((sum, exam) => sum + exam.total_correct, 0);
    const totalQuestions = examScores.reduce((sum, exam) => sum + exam.total_questions, 0);
    const averageScore = examScores.length > 0 ? totalScore / examScores.length : 0;

    return res.status(200).json({
      total_score: totalScore,
      average_score: parseFloat(averageScore.toFixed(2)),
      total_correct: totalCorrect,
      total_questions: totalQuestions,
      exam_scores: examScores,
      is_need_weighted_score: isWeighted
    });

  } catch (error) {
    console.error('Error fetching exam scores:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}