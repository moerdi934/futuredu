// pages/api/exam-schedules/student.ts - Optimized Student Endpoint
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import pool from '../../../lib/db';

export interface StudentExamSchedule {
  id: number;
  schedule_name: string;
  description?: string;
  exam_type: string;
  isfree: boolean;
  start_time: string;
  end_time: string;
  create_date: string;
  exam_name?: string;
  exam_duration?: number;
  question_qty?: number;
  has_completed: boolean;
  total_score?: number;
  average_score?: number;
  total_correct?: number;
  total_questions?: number;
  completion_time?: string;
  access_type: 'free' | 'entitled' | 'no_access';
}

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    await runMiddleware(req, res, authenticateJWT);
    
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Only allow students to access this endpoint
    if (userRole !== 'student') {
      return res.status(403).json({ 
        message: 'Access denied. This endpoint is for students only.' 
      });
    }

    // Parse query parameters for filtering
    const {
      page = '1',
      limit = '50',
      search = '',
      schedule_name = '',
      exam_type = '',
      start_time = '',
      end_time = ''
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const offset = (pageNum - 1) * limitNum;

    // Build filter conditions
    const filterConditions: string[] = [];
    const filterValues: any[] = [userId]; // userId is always the first parameter

    let paramIndex = 2; // Start from 2 since userId is $1

    // Global search
    if (search && (search as string).trim()) {
      filterConditions.push(`(
        asch.name ILIKE $${paramIndex} OR 
        asch.description ILIKE $${paramIndex} OR
        asch.exam_type ILIKE $${paramIndex}
      )`);
      filterValues.push(`%${(search as string).trim()}%`);
      paramIndex++;
    }

    // Schedule name filter
    if (schedule_name && (schedule_name as string).trim()) {
      filterConditions.push(`asch.name ILIKE $${paramIndex}`);
      filterValues.push(`%${(schedule_name as string).trim()}%`);
      paramIndex++;
    }

    // Exam type filter
    if (exam_type && (exam_type as string) !== '' && (exam_type as string) !== 'all') {
      filterConditions.push(`asch.exam_type = $${paramIndex}`);
      filterValues.push(exam_type as string);
      paramIndex++;
    }

    // Start time filter
    if (start_time && (start_time as string).trim()) {
      filterConditions.push(`asch.start_time >= $${paramIndex}`);
      filterValues.push(start_time as string);
      paramIndex++;
    }

    // End time filter
    if (end_time && (end_time as string).trim()) {
      filterConditions.push(`asch.end_time <= $${paramIndex}`);
      filterValues.push(end_time as string);
      paramIndex++;
    }

    const whereClause = filterConditions.length > 0 
      ? `AND ${filterConditions.join(' AND ')}`
      : '';

    // Single optimized query for students
    const query = `
      WITH user_entitlements AS (
        SELECT DISTINCT exam_schedule_id
        FROM exam_schedule_entitlements 
        WHERE user_id = $1 
          AND (expires_at IS NULL OR expires_at > NOW())
      ),
      accessible_schedules AS (
        SELECT es.*
        FROM exam_schedule es
        WHERE es.is_valid = true 
          AND es.approval_status = 'approved'
          AND (es.is_deleted IS NULL OR es.is_deleted = false)
          AND NOT (es.description ILIKE 'AUTOCREATE%')
          AND (
            es.isfree = true 
            OR EXISTS (SELECT 1 FROM user_entitlements ue WHERE ue.exam_schedule_id = es.id)
          )
      ),
      user_completion_status AS (
        -- Get completion status for user
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
        )
        SELECT 
          ls.exam_schedule_id,
          es.is_need_weighted_score,
          SUM(CASE 
            WHEN COALESCE(es.is_need_weighted_score, false) = true 
            THEN ls.score--COALESCE(ls.weighted_score, 0)
            ELSE ls.score
          END) as total_score,
          AVG(CASE 
            WHEN COALESCE(es.is_need_weighted_score, false) = true 
            THEN COALESCE(ls.weighted_score, 0)
            ELSE ls.score
          END) as average_score,
          SUM(ls.total_correct) as total_correct,
          SUM(ls.total_questions) as total_questions,
          MAX(ls.completion_time) as completion_time,
          true as has_completed
        FROM latest_scores ls
        JOIN exam_schedule es ON es.id = ls.exam_schedule_id
        GROUP BY ls.exam_schedule_id, es.is_need_weighted_score
      )
      SELECT 
        asch.id,
        asch.name as schedule_name,
        asch.description,
        COALESCE(asch.exam_type, 'Unknown') as exam_type,
        asch.isfree,
        asch.start_time,
        asch.end_time,
        asch.create_date,
        -- Exam details
        (SELECT string_agg(ex.name, '.') 
         FROM unnest(asch.exam_id_list) as exam_id 
         JOIN exams ex ON ex.id = exam_id
        ) as exam_name,
        (SELECT SUM(ex.duration)
         FROM unnest(asch.exam_id_list) as exam_id 
         JOIN exams ex ON ex.id = exam_id
        ) as exam_duration,
        (SELECT SUM(array_length(ex.question_id_list, 1))
         FROM unnest(asch.exam_id_list) as exam_id 
         JOIN exams ex ON ex.id = exam_id
        ) as question_qty,
        -- Completion status
        COALESCE(ucs.has_completed, false) as has_completed,
        ucs.total_score,
        ucs.average_score,
        ucs.total_correct,
        ucs.total_questions,
        ucs.completion_time,
        -- Access info
        CASE 
          WHEN asch.isfree THEN 'free'
          WHEN EXISTS (SELECT 1 FROM user_entitlements ue WHERE ue.exam_schedule_id = asch.id) THEN 'entitled'
          ELSE 'no_access'
        END as access_type
      FROM accessible_schedules asch
      LEFT JOIN user_completion_status ucs ON ucs.exam_schedule_id = asch.id
      WHERE 1=1 ${whereClause}
      ORDER BY 
        asch.isfree DESC,
        asch.exam_type ASC,
        asch.create_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Count query for pagination
    const countQuery = `
      WITH user_entitlements AS (
        SELECT DISTINCT exam_schedule_id
        FROM exam_schedule_entitlements 
        WHERE user_id = $1 
          AND (expires_at IS NULL OR expires_at > NOW())
      ),
      accessible_schedules AS (
        SELECT es.*
        FROM exam_schedule es
        WHERE es.is_valid = true 
          AND es.approval_status = 'approved'
          AND (es.is_deleted IS NULL OR es.is_deleted = false)
          AND NOT (es.description ILIKE 'AUTOCREATE%')
          AND (
            es.isfree = true 
            OR EXISTS (SELECT 1 FROM user_entitlements ue WHERE ue.exam_schedule_id = es.id)
          )
      )
      SELECT COUNT(*) as total
      FROM accessible_schedules asch
      WHERE 1=1 ${whereClause}
    `;

    // Prepare query parameters
    const queryParams = [...filterValues, limitNum, offset];
    const countParams = filterValues; // Count query doesn't need limit/offset

    console.log('Student Query:', query);
    console.log('Query Parameters:', queryParams);

    // Execute both queries
    const [dataResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limitNum);

    // Format the results
    const schedules: StudentExamSchedule[] = dataResult.rows.map(row => ({
      id: row.id,
      schedule_name: row.schedule_name,
      description: row.description,
      exam_type: row.exam_type,
      isfree: row.isfree,
      start_time: row.start_time,
      end_time: row.end_time,
      create_date: row.create_date,
      exam_name: row.exam_name,
      exam_duration: row.exam_duration,
      question_qty: row.question_qty,
      has_completed: row.has_completed,
      total_score: row.total_score ? parseFloat(row.total_score) : null,
      average_score: row.average_score ? parseFloat(row.average_score) : null,
      total_correct: row.total_correct ? parseInt(row.total_correct) : null,
      total_questions: row.total_questions ? parseInt(row.total_questions) : null,
      completion_time: row.completion_time,
      access_type: row.access_type
    }));

    // Add cache control headers
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');

    return res.status(200).json({
      success: true,
      data: schedules,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecords: total,
        pageSize: limitNum
      },
      message: 'Student exam schedules retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching student exam schedules:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}