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
  approvalStatus?: string;
  includeDeleted?: string;
  userRole?: string;
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
  type: number; // FK to product_type.id
  is_auto_move: boolean;
  is_need_order_exam: boolean;
  is_need_weighted_score: boolean;
  create_date?: Date;
  update_date?: Date;
  updated_by?: string;
  // Approval fields
  approval_status: string;
  approve_user_id?: number;
  approve_date?: Date;
  rejection_reason?: string;
  // Soft delete fields
  is_deleted: boolean;
  delete_reason?: string;
  delete_user_id?: number;
  delete_date?: Date;
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

export interface ExamScheduleRow extends ExamSchedule {
  creator_name?: string;
  approver_name?: string;
  total?: number;
  is_live?: boolean;
  live_since?: Date;
  exam_type?: string; // From product_type.description
}

export interface ApprovalData {
  approve_user_id: string;
  approval_status: string;
  rejection_reason?: string;
}

export interface GoLiveData {
  product_type_id: number;
  price: number;
  stock: number;
  features: string[];
  classtype: string;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
  effective_start: string;
  effective_end?: string;
}

const isAutoCreateSchedule = (description: string): boolean => {
  return description && description.trim().toUpperCase().startsWith('AUTOCREATE');
};

const buildRoleBasedConditions = (userRole: string, userId: string, values: any[]): string => {
  if (userRole === 'admin') {
    return '';
  } else if (userRole === 'teacher') {
    values.push(userId);
    return ` AND es.created_by = $${values.length}`;
  } else if (userRole === 'student') {
    return ` AND es.approval_status = 'approved'`;
  }
  return '';
};

// Get exam schedules with comprehensive filters
export const getExamSchedules = async (filters: ExamScheduleFilters): Promise<{data: any[], total: number, totalPages: number}> => {
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
    approvalStatus = 'all',
    includeDeleted = 'false',
    userRole = 'admin'
  } = filters;

  const offset = (page - 1) * limit;

  const allowedSortKeys = [
    'es.id', 'schedule_name', 'exam_id', 'exam_name', 'exam_duration', 'exam_type',
    'isfree', 'is_valid', 'start_time', 'end_time', 'question_qty',
    'schedule_creator', 'exam_creator', 'approval_status', 'approve_date'
  ];

  const validatedSortKey = allowedSortKeys.includes(sortKey) ? sortKey : 'es.id';
  const validatedSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  // Updated base query with proper product_type join
  const baseFromClause = `
    FROM exam_schedule es
    LEFT JOIN product_type pt ON pt.id = es.type
    JOIN LATERAL unnest(es.exam_id_list) AS u(exam_id) ON true
    JOIN exams ex ON ex.id = u.exam_id
    LEFT JOIN v_dashboard_userdata us ON us.userid = es.created_by
    LEFT JOIN v_dashboard_userdata us2 ON us2.userid = ex.create_user_id
    LEFT JOIN v_dashboard_userdata approver ON approver.userid = es.approve_user_id
    LEFT JOIN product_exam_schedules pes ON pes.exam_schedule_id = es.id
    LEFT JOIN products p ON p.product_id = pes.product_id
  `;

  const baseSelectClause = `
    SELECT 
      es.id,
      es.name AS schedule_name,
      es.description,
      es.exam_id_list::TEXT exam_id,
      es.isfree,
      (
        SELECT string_agg(ex2.name, '.') AS exam_name
        FROM exam_schedule es2
        JOIN LATERAL unnest(es2.exam_id_list) AS u(exam_id) ON true
        JOIN exams ex2 ON ex2.id = u.exam_id
        WHERE es2.id = es.id
        GROUP BY es2.id
      ) AS exam_name,
      (
        SELECT SUM(ex2.duration)
        FROM exam_schedule es2
        JOIN LATERAL unnest(es2.exam_id_list) AS u(exam_id) ON true
        JOIN exams ex2 ON ex2.id = u.exam_id
        WHERE es2.id = es.id
        GROUP BY es2.id
      ) AS exam_duration,
      COALESCE(pt.description, 'Unknown') as exam_type,
      es.is_valid,
      es.start_time,
      es.end_time,
      COALESCE(us.name, 'admin') AS schedule_creator,
      COALESCE(us2.name, 'admin') AS exam_creator,
      (
        SELECT SUM(array_length(ex2.question_id_list, 1))
        FROM exam_schedule es2
        JOIN LATERAL unnest(es2.exam_id_list) AS u(exam_id) ON true
        JOIN exams ex2 ON ex2.id = u.exam_id
        WHERE es2.id = es.id
        GROUP BY es2.id
      ) AS question_qty,
      es.approval_status,
      es.approve_user_id,
      es.approve_date,
      es.rejection_reason,
      COALESCE(approver.name, 'admin') AS approver_name,
      es.is_deleted,
      es.delete_reason,
      es.delete_user_id,
      es.delete_date,
      CASE WHEN p.product_id IS NOT NULL THEN true ELSE false END AS is_live,
      p.updated_at AS live_since,
      es.created_by,
      es.create_date,
      es.type as product_type_id
  `;

  const baseGroupByClause = `
    GROUP BY es.id, es.name, es.description, es.type, pt.description, es.isfree, es.is_valid, 
             es.start_time, es.end_time, us.name, us2.name, es.approval_status, 
             es.approve_user_id, es.approve_date, es.rejection_reason, approver.name,
             es.is_deleted, es.delete_reason, es.delete_user_id, es.delete_date,
             es.created_by, es.create_date, p.product_id, p.updated_at
  `;

  let whereClauses: string[] = [];
  let values: any[] = [];
  
  // Hide AUTOCREATE schedules
  whereClauses.push(`NOT (es.description ILIKE 'AUTOCREATE%')`);

  // Role-based filtering
  if (userId && userRole !== 'admin') {
    if (userRole === 'teacher') {
      whereClauses.push(`es.created_by = $${values.length + 1}`);
      values.push(userId);
    } else if (userRole === 'student') {
      whereClauses.push(`es.approval_status = 'approved'`);
    }
  }

  // Soft delete filter
  if (includeDeleted === 'false') {
    whereClauses.push(`(es.is_deleted IS NULL OR es.is_deleted = false)`);
  } else if (includeDeleted === 'only_deleted') {
    whereClauses.push(`es.is_deleted = true`);
  }

  // Approval status filter
  if (approvalStatus && approvalStatus !== 'all') {
    whereClauses.push(`es.approval_status = $${values.length + 1}`);
    values.push(approvalStatus);
  }

  // Global search
  if (search && search.trim()) {
    whereClauses.push(`(
      es.name ILIKE $${values.length + 1} OR 
      es.id::TEXT ILIKE $${values.length + 1} OR
      es.description ILIKE $${values.length + 1} OR
      pt.description ILIKE $${values.length + 1} OR
      us.name ILIKE $${values.length + 1} OR
      us2.name ILIKE $${values.length + 1}
    )`);
    values.push(`%${search.trim()}%`);
  }

  // Schedule name filter
  if (schedule_name && schedule_name.trim()) {
    whereClauses.push(`es.name ILIKE $${values.length + 1}`);
    values.push(`%${schedule_name.trim()}%`);
  }

  // Exam type filter (using product_type.description)
  if (exam_type && exam_type !== 'All') {
    whereClauses.push(`pt.description = $${values.length + 1}`);
    values.push(exam_type);
  }

  // Is free filter
  if (isfree && isfree !== 'All') {
    whereClauses.push(`es.isfree = $${values.length + 1}`);
    values.push(isfree === 'true');
  }

  // Is valid filter
  if (is_valid && is_valid !== 'All') {
    whereClauses.push(`es.is_valid = $${values.length + 1}`);
    values.push(is_valid === 'true');
  }

  // Start time filter
  if (start_time) {
    whereClauses.push(`es.start_time >= $${values.length + 1}`);
    values.push(start_time);
  }

  // End time filter
  if (end_time) {
    whereClauses.push(`es.end_time <= $${values.length + 1}`);
    values.push(end_time);
  }

  // Schedule creator filter
  if (schedule_creator && schedule_creator.length > 0) {
    const startIndex = values.length + 1;
    whereClauses.push(`us.userid IN (${schedule_creator.map((_, i) => `$${startIndex + i}`).join(',')})`);
    values.push(...schedule_creator);
  }

  // Exam creator filter
  if (exam_creator && exam_creator.length > 0) {
    const startIndex = values.length + 1;
    whereClauses.push(`us2.userid IN (${exam_creator.map((_, i) => `$${startIndex + i}`).join(',')})`);
    values.push(...exam_creator);
  }

  const filterParamsCount = values.length;

  let whereClause = '';
  if (whereClauses.length > 0) {
    whereClause = ' WHERE ' + whereClauses.join(' AND ');
  }

  const mainQuery = `
    ${baseSelectClause}
    ${baseFromClause}
    ${whereClause}
    ${baseGroupByClause}
    ORDER BY ${validatedSortKey} ${validatedSortOrder}
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;
  
  const mainQueryValues = [...values, limit, offset];

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
    console.log('Main Query:', mainQuery);
    console.log('Main Query Values:', mainQueryValues);

    const [dataResult, countResult] = await Promise.all([
      pool.query(mainQuery, mainQueryValues),
      pool.query(countQuery, values.slice(0, filterParamsCount))
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      total,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching exam schedules:', error);
    throw error;
  }
};

// Search exam schedules
export const searchExamSchedules = async (search: string, limit: number, userId?: string): Promise<SearchExamSchedule[]> => {
  try {
    let query = `
      SELECT id, name AS schedule_name
      FROM exam_schedule
    `;
    
    let whereClauses: string[] = [];
    let values: any[] = [];
    let valueIndex = 1;
    
    whereClauses.push(`NOT (description ILIKE 'AUTOCREATE%')`);
    
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

    query += ` ORDER BY id ASC LIMIT $${valueIndex}`;
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
      LEFT JOIN product_type pt ON pt.id = es.type
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

// Get all valid exam schedules
export const getValidExamSchedules = async (userRole: string = 'admin', userId?: string): Promise<ExamSchedule[]> => {
  try {
    let query = 'SELECT * FROM exam_schedule WHERE is_valid = TRUE AND approval_status = $1';
    const values: any[] = ['approved'];

    query += ' AND NOT (description ILIKE $2)';
    values.push('AUTOCREATE%');

    if (userRole !== 'admin' && userId) {
      const roleCondition = buildRoleBasedConditions(userRole, userId, values);
      if (roleCondition) {
        query += roleCondition;
      }
    }

    query += ' AND (is_deleted IS NULL OR is_deleted = false)';

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Get exam schedule by ID
export const getExamScheduleById = async (id: string): Promise<any> => {
  try {
    const query = `
      SELECT 
        es.*,
        pt.description as exam_type,
        us1.name as created_by_name,
        us2.name as updated_by_name
      FROM exam_schedule es
      LEFT JOIN product_type pt ON pt.id = es.type
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
      LEFT JOIN product_type pt ON pt.id = es.type
      WHERE pt.description = $1
    `, [exam_type]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Create exam schedule
export const createExamSchedule = async (
  name: string,
  description: string,
  exam_id_list: number[],
  start_time: Date,
  end_time: Date,
  isfree: boolean,
  is_valid: boolean,
  created_by: string,
  product_type_id: number, // Changed from exam_type to product_type_id
  is_auto_move: boolean,
  is_need_order_exam: boolean,
  is_need_weighted_score: boolean,
  user_role?: string
): Promise<ExamSchedule> => {
  try {
    const isAutoCreate = isAutoCreateSchedule(description);
    
    let approvalStatus: string;
    if (isAutoCreate) {
      approvalStatus = 'approved';
    } else {
      approvalStatus = user_role === 'admin' ? 'approved' : 'need_approve';
    }
    
    let query: string;
    let values: any[];

    if (approvalStatus === 'approved') {
      query = `
        INSERT INTO exam_schedule (
          name, description, exam_id_list, start_time, end_time, isfree, is_valid, 
          created_by, type, is_auto_move, is_need_order_exam, is_need_weighted_score,
          approval_status, approve_user_id, approve_date, is_deleted
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), false)
        RETURNING *
      `;
      values = [
        name, description, exam_id_list, start_time, end_time, isfree, is_valid, 
        created_by, product_type_id, is_auto_move, is_need_order_exam, is_need_weighted_score,
        approvalStatus, created_by
      ];
    } else {
      query = `
        INSERT INTO exam_schedule (
          name, description, exam_id_list, start_time, end_time, isfree, is_valid, 
          created_by, type, is_auto_move, is_need_order_exam, is_need_weighted_score,
          approval_status, is_deleted
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, false)
        RETURNING *
      `;
      values = [
        name, description, exam_id_list, start_time, end_time, isfree, is_valid, 
        created_by, product_type_id, is_auto_move, is_need_order_exam, is_need_weighted_score,
        approvalStatus
      ];
    }

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Update exam schedule
export const updateExamSchedule = async (
  id: string,
  name: string,
  description: string,
  exam_id_list: number[],
  start_time: Date,
  end_time: Date,
  is_valid: boolean,
  updated_by: string,
  product_type_id: number, // Changed from exam_type
  userRole?: string
): Promise<ExamSchedule> => {
  try {
    let approvalFields = '';
    let values = [name, description, exam_id_list, start_time, end_time, is_valid, product_type_id, updated_by, id];
    
    if (userRole === 'teacher') {
      approvalFields = ', approval_status = $10, approve_user_id = NULL, approve_date = NULL, rejection_reason = NULL';
      values.splice(8, 0, 'need_approve');
    }

    const result = await pool.query( 
      `UPDATE exam_schedule 
       SET name = $1, description = $2, exam_id_list = $3, start_time = $4, end_time = $5, 
           is_valid = $6, type = $7, updated_by = $8, update_date = NOW()${approvalFields}
       WHERE id = $9 AND (is_deleted IS NULL OR is_deleted = false)
       RETURNING *`,
      values
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const approveExamSchedule = async (id: string, data: ApprovalData): Promise<ExamSchedule> => {
  const query = `
    UPDATE exam_schedule 
    SET 
      approval_status = $1,
      approve_user_id = $2,
      approve_date = NOW(),
      rejection_reason = $3,
      updated_by = $2,
      update_date = NOW()
    WHERE id = $4
    RETURNING *;
  `;
  const values = [
    data.approval_status,
    data.approve_user_id,
    data.rejection_reason || null,
    id
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getExamSchedulesNeedingApproval = async (): Promise<ExamScheduleRow[]> => {
  const query = `
    SELECT 
      es.*,
      pt.description as exam_type,
      us.name as creator_name
    FROM exam_schedule es
    LEFT JOIN product_type pt ON pt.id = es.type
    LEFT JOIN v_dashboard_userdata us ON us.userid = es.created_by
    WHERE es.approval_status = 'need_approve'
      AND (es.is_deleted IS NULL OR es.is_deleted = false)
    ORDER BY es.create_date ASC
  `;

  const result = await pool.query(query);
  return result.rows;
};

export const goLiveExamSchedule = async (examScheduleId: string, data: GoLiveData): Promise<any> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const examScheduleResult = await client.query(
      'SELECT * FROM exam_schedule WHERE id = $1 AND approval_status = $2 AND (is_deleted IS NULL OR is_deleted = false)',
      [examScheduleId, 'approved']
    );

    if (examScheduleResult.rows.length === 0) {
      throw new Error('Exam schedule not found or not approved');
    }

    const examSchedule = examScheduleResult.rows[0];

    const productResult = await client.query(`
      INSERT INTO products (
        name, description, stock, type, features, classtype, updated_at, is_stackable
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), true)
      RETURNING product_id
    `, [
      examSchedule.name,
      examSchedule.description,
      data.stock,
      data.product_type_id,
      JSON.stringify(data.features),
      data.classtype
    ]);

    const productId = productResult.rows[0].product_id;

    await client.query(
      'INSERT INTO product_exam_schedules (product_id, exam_schedule_id) VALUES ($1, $2)',
      [productId, examScheduleId]
    );

    await client.query(`
      INSERT INTO product_price_hist (
        product_id, price, effective_start, effective_end, description,
        is_promo, no_promo_price, promo_description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      productId,
      data.price,
      data.effective_start,
      data.effective_end || null,
      `Initial pricing for ${examSchedule.name}`,
      data.is_promo,
      data.no_promo_price || null,
      data.promo_description || null
    ]);

    await client.query('COMMIT');

    return {
      productId,
      examScheduleId,
      message: `Exam schedule "${examSchedule.name}" successfully went live!`
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const softDeleteExamSchedule = async (id: string, deleteUserId: number, deleteReason: string): Promise<ExamSchedule> => {
  const query = `
    UPDATE exam_schedule 
    SET 
      is_deleted = true,
      delete_reason = $2,
      delete_user_id = $3,
      delete_date = NOW(),
      updated_by = $3,
      update_date = NOW()
    WHERE id = $1 AND (is_deleted IS NULL OR is_deleted = false)
    RETURNING *;
  `;
  const result = await pool.query(query, [id, deleteReason, deleteUserId]);
  return result.rows[0];
};

export const restoreExamSchedule = async (id: string, restoreUserId: number): Promise<ExamSchedule> => {
  const query = `
    UPDATE exam_schedule 
    SET 
      is_deleted = false,
      delete_reason = NULL,
      delete_user_id = NULL,
      delete_date = NULL,
      updated_by = $2,
      update_date = NOW()
    WHERE id = $1 AND is_deleted = true
    RETURNING *;
  `;
  const result = await pool.query(query, [id, restoreUserId]);
  return result.rows[0];
};

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
      LEFT JOIN product_type pt ON pt.id = es.type
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

export const getExamScheduleByIdWithAccess = async (
  id: string, 
  includeDeleted: boolean = false, 
  userRole: string = 'admin', 
  userId?: string
): Promise<ExamScheduleRow | null> => {
  let query = `
    SELECT 
      es.*,
      pt.description as exam_type,
      us1.name as creator_name,
      us2.name as approver_name,
      CASE WHEN pes.exam_schedule_id IS NOT NULL THEN true ELSE false END AS is_live,
      p.updated_at AS live_since
    FROM exam_schedule es
    LEFT JOIN product_type pt ON pt.id = es.type
    LEFT JOIN v_dashboard_userdata us1 ON us1.userid = es.created_by
    LEFT JOIN v_dashboard_userdata us2 ON us2.userid = es.approve_user_id
    LEFT JOIN product_exam_schedules pes ON pes.exam_schedule_id = es.id
    LEFT JOIN products p ON p.product_id = pes.product_id
    WHERE es.id = $1
  `;

  const values: any[] = [id];

  if (userRole !== 'admin' && userId) {
    const roleCondition = buildRoleBasedConditions(userRole, userId, values);
    if (roleCondition) {
      query += roleCondition;
    }
  }

  if (!includeDeleted) {
    query += ` AND (es.is_deleted IS NULL OR es.is_deleted = false)`;
  }

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};