// models/examSchedule.model.ts
import pool from '../lib/db';

// Types
export interface ExamScheduleFilters {
  page?: number;
  limit?: number;
  search?: string;
  exam_type?: string;
  series?: string;
  group_product?: string;
  isfree?: string;
  is_valid?: string;
  start_time?: string;
  end_time?: string;
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

// Get exam schedules with filters, sorting, and pagination
export const getExamSchedules = async (filters: ExamScheduleFilters): Promise<ExamScheduleResult> => {
  const {
    page = 1,
    limit = 50,
    search = '',
    exam_type,
    series,
    group_product,
    isfree,
    is_valid,
    start_time,
    end_time,
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
    'series',
    'group_product',
    'isfree',
    'is_valid',
    'start_time',
    'end_time',
    'question_qty',
    'schedule_creator',
    'exam_creator',
  ];

  // Validate sortKey
  const validatedSortKey = allowedSortKeys.includes(sortKey) ? sortKey : 'es.id';

  // Validate sortOrder
  const validatedSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  // Common FROM and JOIN clauses
  const baseFromClause = `
    FROM exam_schedule es
    left join product_type pt on pt.id = es."type" 
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
        where es2.id = es.id
        GROUP BY es2.id
      ) AS exam_name,
      (
        SELECT
        SUM(ex2.duration)
        FROM exam_schedule es2
        JOIN LATERAL unnest(es2.exam_id_list) AS u(exam_id) ON true
        JOIN exams ex2 ON ex2.id = u.exam_id
        where es2.id = es.id
        GROUP BY es2.id
      ) AS exam_duration,
      pt.description exam_type,
      pt.series series,
      pt.group_product group_product,
      es.isfree,
      es.is_valid,
      es.start_time,
      es.end_time,
      coalesce(us.name, 'admin') AS schedule_creator,
      coalesce(us2.name, 'admin') AS exam_creator,
      (
        SELECT
        SUM(array_length(ex2.question_id_list, 1))
        FROM exam_schedule es2
        JOIN LATERAL unnest(es2.exam_id_list) AS u(exam_id) ON true
        JOIN exams ex2 ON ex2.id = u.exam_id
        where es2.id = es.id
        GROUP BY es2.id
      ) AS question_qty
  `;

  // Base GROUP BY clause
  const baseGroupByClause = `
    GROUP BY es.id, es.name, es.description, es.exam_type, es.isfree, es.is_valid, es.start_time, es.end_time, us.name, us2.name, pt.description, pt.series, pt.group_product 
  `;

  // Initialize WHERE clauses
  let whereClauses: string[] = [];
  let values: any[] = [];
  let valueIndex = 1;
  let filterParamsCount = 0;

  if (search) {
    whereClauses.push(`(es.name ILIKE $${valueIndex} OR es.id::TEXT ILIKE $${valueIndex})`);
    values.push(`%${search}%`);
    valueIndex++;
    filterParamsCount++;
  }

  if (exam_type && exam_type !== 'All') {
    whereClauses.push(`pt.description = $${valueIndex}`);
    values.push(exam_type);
    valueIndex++;
    filterParamsCount++;
  }

  if (series && series !== 'All') {
    whereClauses.push(`pt.series = $${valueIndex}`);
    values.push(series);
    valueIndex++;
    filterParamsCount++;
  }

  if (group_product && group_product !== 'All') {
    whereClauses.push(`pt.group_product = $${valueIndex}`);
    values.push(group_product);
    valueIndex++;
    filterParamsCount++;
  }

  if (isfree && isfree !== 'All') {
    whereClauses.push(`es.isfree = $${valueIndex}`);
    values.push(isfree === 'true');
    valueIndex++;
    filterParamsCount++;
  }

  if (is_valid && is_valid !== 'All') {
    whereClauses.push(`es.is_valid = $${valueIndex}`);
    values.push(is_valid === 'true');
    valueIndex++;
    filterParamsCount++;
  }

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

  if (userId) {
    whereClauses.push(`(us.id = $${valueIndex} OR us2.id = $${valueIndex})`);
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

export const getExamSchedulesById = async (filters: ExamScheduleFilters): Promise<ExamScheduleResult> => {
  const {
    page = 1,
    limit = 50,
    search = '',
    exam_type,
    isfree,
    is_valid,
    start_time,
    end_time,
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

  // Validate sortKey
  const validatedSortKey = allowedSortKeys.includes(sortKey) ? sortKey : 'es.id';

  // Validate sortOrder
  const validatedSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  // Common FROM and JOIN clauses
  const baseFromClause = `
    FROM exam_schedule es
    JOIN LATERAL unnest(es.exam_id_list) AS u(exam_id) ON true
    JOIN exams ex ON ex.id = u.exam_id
    LEFT JOIN questions q ON q.exam_id = ex.id
    LEFT JOIN users us ON us.id = es.created_by 
    LEFT JOIN users us2 ON us2.id = ex.create_user_id 
  `;

  // Base SELECT clause
  const baseSelectClause = `
    SELECT 
      es.id,
      es.name AS schedule_name,
      es.description,
      u.exam_id,
      ex.name AS exam_name,
      ex.duration AS exam_duration,
      es.exam_type,
      es.isfree,
      es.is_valid,
      es.start_time,
      es.end_time,
      coalesce(us.username,'admin') AS schedule_creator,
      coalesce(us2.username,'admin') AS exam_creator,
      COUNT(q.id) AS question_qty
  `;

  // Base GROUP BY clause
  const baseGroupByClause = `
    GROUP BY es.id, u.exam_id, ex.name, ex.duration, us.username, us2.username
  `;

  // Initialize WHERE clauses
  let whereClauses: string[] = [];
  let values: any[] = [];
  let valueIndex = 1;
  let filterParamsCount = 0;

  if (search) {
    whereClauses.push(`(es.name ILIKE $${valueIndex} OR es.id::TEXT ILIKE $${valueIndex})`);
    values.push(`%${search}%`);
    valueIndex++;
    filterParamsCount++;
  }

  if (exam_type && exam_type !== 'All') {
    whereClauses.push(`es.exam_type = $${valueIndex}`);
    values.push(exam_type);
    valueIndex++;
    filterParamsCount++;
  }

  if (isfree && isfree !== 'All') {
    whereClauses.push(`es.isfree = $${valueIndex}`);
    values.push(isfree === 'true');
    valueIndex++;
    filterParamsCount++;
  }

  if (is_valid && is_valid !== 'All') {
    whereClauses.push(`es.is_valid = $${valueIndex}`);
    values.push(is_valid === 'true');
    valueIndex++;
    filterParamsCount++;
  }

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

  // Apply userId filter if provided
  if (userId) {
    whereClauses.push(`(us.id = $${valueIndex} OR us2.id = $${valueIndex})`);
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

  // Execute both queries in parallel
  try {
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

export const searchExamSchedules = async (search: string, limit: number, userId?: string): Promise<SearchExamSchedule[]> => {
  try {
    // Start constructing the query
    let query = `
      SELECT id, name AS schedule_name
      FROM exam_schedule
    `;
    
    // Initialize WHERE clauses and values
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

    // Append WHERE clauses if any
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Append ORDER BY and LIMIT
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
      SELECT id, name AS name, exam_type
      FROM exam_schedule
      WHERE 1=1
    `;
    
    const values: any[] = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND name ILIKE $${paramCount}`;
      values.push(`%${search}%`);
      paramCount++;
    }
    
    if (examType) {
      query += ` AND exam_type = $${paramCount}`;
      values.push(examType);
      paramCount++;
    }
    
    query += ' ORDER BY name ASC LIMIT 10';
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
export const getExamScheduleById = async (id: string): Promise<ExamSchedule> => {
  try {
    const result = await pool.query('SELECT * FROM exam_schedule WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get exam schedules by exam type
export const getExamSchedulesByType = async (exam_type: string): Promise<ExamSchedule[]> => {
  try {
    const result = await pool.query('SELECT * FROM exam_schedule WHERE exam_type = $1', [exam_type]);
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
      `INSERT INTO exam_schedule (name, description, exam_id_list, start_time, end_time,isfree, is_valid, created_by, type, is_auto_move, is_need_order_exam, is_need_weighted_score)
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
       SET name = $1, description = $2, exam_id_list = $3, start_time = $4, end_time = $5, is_valid = $6, updated_by = $7, update_date = NOW(), exam_type = $8
       WHERE id = $9 RETURNING *`,
      [name, description, exam_id_list, start_time, end_time, is_valid, updated_by, exam_type, id]
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
      SELECT DISTINCT exam_type 
      FROM exam_schedule 
      WHERE exam_type ILIKE $1
    `;
    const result = await pool.query(query, [`%${search}%`]);
    return result.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const checkAccess = async (userId: string, examScheduleId: string): Promise<AccessCheck> => {
  // Ambil ujian + entitlement (jika ada) untuk user ini
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

  // 1) Jika gratis → selalu granted
  if (isfree) {
    return { accessGranted: true };
  }

  // 2) Jika ada entitlement dan (tidak ada expires_at → permanen, atau expires_at di masa depan) → granted
  const now = new Date();
  if (granted_at && (!expires_at || expires_at > now)) {
    return { accessGranted: true };
  }

  // 3) Semua kondisi lain → ditolak
  return { accessGranted: false };
};