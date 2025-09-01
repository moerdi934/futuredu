// models/examSchedule.model.ts
import pool from '../lib/db';

// Types
export interface ExamScheduleFilters {
  page?: number;
  limit?: number;
  search?: string;
  schedule_name?: string;
  exam_type?: string;
  series?: string;
  group_product?: string;
  isfree?: string;
  is_valid?: string;
  start_time?: string;
  end_time?: string;
  schedule_creator?: string[];
  exam_creator?: string[];
  sortKey?: string;
  sortOrder?: string;
  userId?: string;
}

export interface ExamScheduleResult {
  data: any[];
  total: number;
  totalPages: number;
}

export interface ExamSchedule {
  id: number;
  name: string;
  description: string;
  exam_id_list: number[];
  start_time: Date;
  end_time: Date;
  isfree: boolean;
  is_valid: boolean;
  created_by: string;
  type: number;
  is_auto_move: boolean;
  is_need_order_exam: boolean;
  is_need_weighted_score: boolean;
  create_date?: Date;
  update_date?: Date;
  updated_by?: string;
}

export interface SearchExamSchedule {
  id: number;
  schedule_name: string;
}

export interface ExamScheduleByType {
  id: number;
  name: string;
  exam_type: string;
}

export interface AccessCheck {
  accessGranted: boolean;
}

// Get exam schedules with comprehensive filters, sorting, and pagination
export const getExamSchedules = async (filters: ExamScheduleFilters): Promise<ExamScheduleResult> => {
  const {
    page = 1,
    limit = 50,
    search = '',
    schedule_name = '',
    exam_type,
    isfree,
    is_valid,
    start_time,
    end_time,
    schedule_creator = [],
    exam_creator = [],
    sortKey = 'es.id',
    sortOrder = 'asc',
    userId,
  } = filters;

  const offset = (page - 1) * limit;

  // Define allowed sort keys to prevent SQL injection
  const allowedSortKeys = [
    'es.id',
    'schedule_name',
    'exam_id',
    'exam_name',
    'exam_duration',
    'exam_type',
    'isfree',
    'is_valid',
    'start_time',
    'end_time',
    'question_qty',
    'schedule_creator',
    'exam_creator',
  ];

  const validatedSortKey = allowedSortKeys.includes(sortKey) ? sortKey : 'es.id';
  const validatedSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  // Common FROM and JOIN clauses using v_dashboard_userdata
  const baseFromClause = `
    FROM exam_schedule es
    JOIN LATERAL unnest(es.exam_id_list) AS u(exam_id) ON true
    JOIN exams ex ON ex.id = u.exam_id
    LEFT JOIN v_dashboard_userdata us ON us.userid = es.created_by
    LEFT JOIN v_dashboard_userdata us2 ON us2.userid = ex.create_user_id
  `;

  // Base SELECT clause
  const baseSelectClause = `
    SELECT 
      es.id,
      es.name AS schedule_name,
      es.description,
      es.exam_id_list::TEXT exam_id,
      (
        SELECT
        string_agg(ex2.name, '.') AS exam_name
        FROM exam_schedule es2
        JOIN LATERAL unnest(es2.exam_id_list) AS u(exam_id) ON true
        JOIN exams ex2 ON ex2.id = u.exam_id
        WHERE es2.id = es.id
        GROUP BY es2.id
      ) AS exam_name,
      (
        SELECT
        SUM(ex2.duration)
        FROM exam_schedule es2
        JOIN LATERAL unnest(es2.exam_id_list) AS u(exam_id) ON true
        JOIN exams ex2 ON ex2.id = u.exam_id
        WHERE es2.id = es.id
        GROUP BY es2.id
      ) AS exam_duration,
      COALESCE(es.exam_type, 'Unknown') as exam_type,
      es.isfree,
      es.is_valid,
      es.start_time,
      es.end_time,
      COALESCE(us.name, 'admin') AS schedule_creator,
      COALESCE(us2.name, 'admin') AS exam_creator,
      (
        SELECT
        SUM(array_length(ex2.question_id_list, 1))
        FROM exam_schedule es2
        JOIN LATERAL unnest(es2.exam_id_list) AS u(exam_id) ON true
        JOIN exams ex2 ON ex2.id = u.exam_id
        WHERE es2.id = es.id
        GROUP BY es2.id
      ) AS question_qty
  `;

  // Base GROUP BY clause
  const baseGroupByClause = `
    GROUP BY es.id, es.name, es.description, es.exam_type, es.isfree, es.is_valid, es.start_time, es.end_time, us.name, us2.name
  `;

  // Initialize WHERE clauses
  let whereClauses: string[] = [];
  let values: any[] = [];
  let valueIndex = 1;
  let filterParamsCount = 0;

  // Global search - searches across multiple fields
  if (search && search.trim()) {
    whereClauses.push(`(
      es.name ILIKE $${valueIndex} OR 
      es.id::TEXT ILIKE $${valueIndex} OR
      es.description ILIKE $${valueIndex} OR
      es.exam_type ILIKE $${valueIndex} OR
      us.name ILIKE $${valueIndex} OR
      us2.name ILIKE $${valueIndex}
    )`);
    values.push(`%${search.trim()}%`);
    valueIndex++;
    filterParamsCount++;
  }

  // Schedule name filter (separate from global search)
  if (schedule_name && schedule_name.trim()) {
    whereClauses.push(`es.name ILIKE $${valueIndex}`);
    values.push(`%${schedule_name.trim()}%`);
    valueIndex++;
    filterParamsCount++;
  }

  // Exam type filter
  if (exam_type && exam_type !== 'All') {
    whereClauses.push(`es.exam_type = $${valueIndex}`);
    values.push(exam_type);
    valueIndex++;
    filterParamsCount++;
  }

  // Free status filter
  if (isfree && isfree !== 'All') {
    whereClauses.push(`es.isfree = $${valueIndex}`);
    values.push(isfree === 'true');
    valueIndex++;
    filterParamsCount++;
  }

  // Valid status filter
  if (is_valid && is_valid !== 'All') {
    whereClauses.push(`es.is_valid = $${valueIndex}`);
    values.push(is_valid === 'true');
    valueIndex++;
    filterParamsCount++;
  }

  // Date range filters
  if (start_time) {
    whereClauses.push(`es.start_time >= $${valueIndex}`);
    values.push(start_time);
    valueIndex++;
    filterParamsCount++;
  }

  if (end_time) {
    whereClauses.push(`es.end_time <= $${valueIndex}`);
    values.push(end_time);
    valueIndex++;
    filterParamsCount++;
  }

  // Schedule creators filter (multiple values)
  if (schedule_creator && schedule_creator.length > 0) {
    const creatorPlaceholders = schedule_creator.map(() => `$${valueIndex++}`).join(',');
    whereClauses.push(`us.userid IN (${creatorPlaceholders})`);
    values.push(...schedule_creator);
    filterParamsCount += schedule_creator.length;
  }

  // Exam creators filter (multiple values)
  if (exam_creator && exam_creator.length > 0) {
    const creatorPlaceholders = exam_creator.map(() => `$${valueIndex++}`).join(',');
    whereClauses.push(`us2.userid IN (${creatorPlaceholders})`);
    values.push(...exam_creator);
    filterParamsCount += exam_creator.length;
  }

  // User filter (for filtering by user-created schedules/exams)
  if (userId) {
    whereClauses.push(`(us.userid = $${valueIndex} OR us2.userid = $${valueIndex})`);
    values.push(userId);
    valueIndex++;
    filterParamsCount++;
  }

  // Construct WHERE clause
  let whereClause = '';
  if (whereClauses.length > 0) {
    whereClause = ' WHERE ' + whereClauses.join(' AND ');
  }

  // Construct the main query
  const mainQuery = `
    ${baseSelectClause}
    ${baseFromClause}
    ${whereClause}
    ${baseGroupByClause}
    ORDER BY ${validatedSortKey} ${validatedSortOrder}
    LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
  `;
  values.push(limit, offset);

  // Construct the count query using a subquery
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM (
      SELECT es.id
      ${baseFromClause}
      ${whereClause}
      ${baseGroupByClause}
    ) AS sub
  `;

  try {
    console.log('Executing main query:', mainQuery);
    console.log('Query values:', values);

    const [dataResult, countResult] = await Promise.all([
      pool.query(mainQuery, values),
      pool.query(countQuery, values.slice(0, filterParamsCount)),
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      total,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching exam schedules:', error);
    throw error;
  }
};


// Search exam schedules (simple search for autocomplete)
export const searchExamSchedules = async (search: string, limit: number, userId?: string): Promise<SearchExamSchedule[]> => {
  try {
    let query = `
      SELECT id, name AS schedule_name
      FROM exam_schedule
    `;
    
    let whereClauses: string[] = [];
    let values: any[] = [];
    let valueIndex = 1;
    
    if (search) {
      whereClauses.push(`(name ILIKE $${valueIndex} OR id::TEXT ILIKE $${valueIndex})`);
      values.push(`%${search}%`);
      valueIndex++;
    }

    if (userId) {
      whereClauses.push(`created_by = $${valueIndex}`);
      values.push(userId);
      valueIndex++;
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += `
      ORDER BY id ASC
      LIMIT $${valueIndex}
    `;
    values.push(limit);

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error searching exam schedules:', error);
    throw error;
  }
};

export const searchExamScheduleByExamType = async (search: string = '', examType: string = ''): Promise<ExamScheduleByType[]> => {
  try {
    let query = `
      SELECT es.id, es.name AS name, pt.description as exam_type
      FROM exam_schedule es
      LEFT JOIN product_type pt ON pt.id = es."type"
      WHERE 1=1
    `;
    
    const values: any[] = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND es.name ILIKE $${paramCount}`;
      values.push(`%${search}%`);
      paramCount++;
    }
    
    if (examType) {
      query += ` AND pt.description = $${paramCount}`;
      values.push(examType);
      paramCount++;
    }
    
    query += ' ORDER BY es.name ASC LIMIT 10';
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    throw new Error(`Error getting exam schedules: ${error.message}`);
  }
};

// Get all valid exam schedules (is_valid = true)
export const getValidExamSchedules = async (): Promise<ExamSchedule[]> => {
  try {
    const result = await pool.query('SELECT * FROM exam_schedule WHERE is_valid = TRUE');
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get a specific exam schedule by ID
export const getExamScheduleById = async (id: string): Promise<any> => {
  try {
    const query = `
      SELECT 
        es.*,
        us1.name as created_by_name,
        us2.name as updated_by_name
      FROM exam_schedule es
      LEFT JOIN v_dashboard_userdata us1 ON us1.userid = es.created_by
      LEFT JOIN v_dashboard_userdata us2 ON us2.userid = es.updated_by
      WHERE es.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get exam schedules by exam type
export const getExamSchedulesByType = async (exam_type: string): Promise<ExamSchedule[]> => {
  try {
    const result = await pool.query(`
      SELECT es.* 
      FROM exam_schedule es
      LEFT JOIN product_type pt ON pt.id = es."type"
      WHERE pt.description = $1
    `, [exam_type]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Create a new exam schedule
export const createExamSchedule = async (
  name: string,
  description: string,
  exam_id_list: number[],
  start_time: Date,
  end_time: Date,
  isfree: boolean,
  is_valid: boolean,
  created_by: string,
  exam_type: number,
  is_auto_move: boolean,
  is_need_order_exam: boolean,
  is_need_weighted_score: boolean
): Promise<ExamSchedule> => {
  try {
    const result = await pool.query(
      `INSERT INTO exam_schedule (name, description, exam_id_list, start_time, end_time, isfree, is_valid, created_by, type, is_auto_move, is_need_order_exam, is_need_weighted_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [name, description, exam_id_list, start_time, end_time, isfree, is_valid, created_by, exam_type, is_auto_move, is_need_order_exam, is_need_weighted_score]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update an existing exam schedule by ID
export const updateExamSchedule = async (
  id: string,
  name: string,
  description: string,
  exam_id_list: number[],
  start_time: Date,
  end_time: Date,
  is_valid: boolean,
  updated_by: string,
  exam_type: string
): Promise<ExamSchedule> => {
  try {
    const result = await pool.query( 
      `UPDATE exam_schedule 
       SET name = $1, description = $2, exam_id_list = $3, start_time = $4, end_time = $5, is_valid = $6, updated_by = $7, update_date = NOW()
       WHERE id = $8 RETURNING *`,
      [name, description, exam_id_list, start_time, end_time, is_valid, updated_by, id]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Delete an exam schedule by ID
export const deleteExamSchedule = async (id: string): Promise<ExamSchedule> => {
  try {
    const result = await pool.query('DELETE FROM exam_schedule WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const getExamScheduleTypes = async (search: string): Promise<{exam_type: string}[]> => {
  try {
    const query = `
      SELECT DISTINCT pt.description as exam_type 
      FROM exam_schedule es
      LEFT JOIN product_type pt ON pt.id = es."type"
      WHERE pt.description IS NOT NULL AND pt.description ILIKE $1
      ORDER BY pt.description
    `;
    const result = await pool.query(query, [`%${search}%`]);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const checkAccess = async (userId: string, examScheduleId: string): Promise<AccessCheck> => {
  const { rows } = await pool.query(
    `SELECT
       es.id,
       es.isfree,
       ent.granted_at,
       ent.expires_at
     FROM exam_schedule es
     LEFT JOIN exam_schedule_entitlements ent
       ON ent.exam_schedule_id = es.id
       AND ent.user_id = $1
     WHERE es.id = $2`,
    [userId, examScheduleId]
  );

  if (rows.length === 0) {
    throw new Error('Exam schedule not found');
  }

  const { isfree, granted_at, expires_at } = rows[0];

  if (isfree) {
    return { accessGranted: true };
  }

  const now = new Date();
  if (granted_at && (!expires_at || expires_at > now)) {
    return { accessGranted: true };
  }

  return { accessGranted: false };
};

// New functions for form dropdown options
export const getExamTypes = async (search: string): Promise<{exam_type: string}[]> => {
  try {
    const query = `
      SELECT DISTINCT pt.description as exam_type 
      FROM product_type pt
      WHERE pt.description IS NOT NULL AND pt.description ILIKE $1
      ORDER BY pt.description
      LIMIT 20
    `;
    const result = await pool.query(query, [`%${search}%`]);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getSeries = async (search: string): Promise<{series: string}[]> => {
  try {
    const query = `
      SELECT DISTINCT pt.series 
      FROM product_type pt
      WHERE pt.series IS NOT NULL AND pt.series ILIKE $1
      ORDER BY pt.series
      LIMIT 20
    `;
    const result = await pool.query(query, [`%${search}%`]);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getScheduleCreators = async (search: string): Promise<{id: string, name: string}[]> => {
  try {
    const query = `
      SELECT DISTINCT us.userid as id, us.name as name
      FROM exam_schedule es
      JOIN v_dashboard_userdata us ON us.userid = es.created_by
      WHERE us.name IS NOT NULL AND us.name ILIKE $1
      ORDER BY us.name
      LIMIT 20
    `;
    const result = await pool.query(query, [`%${search}%`]);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getExamCreators = async (search: string): Promise<{id: string, name: string}[]> => {
  try {
    const query = `
      SELECT DISTINCT us.userid as id, us.name as name
      FROM exams ex
      JOIN v_dashboard_userdata us ON us.userid = ex.create_user_id
      WHERE us.name IS NOT NULL AND us.name ILIKE $1
      ORDER BY us.name
      LIMIT 20
    `;
    const result = await pool.query(query, [`%${search}%`]);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};