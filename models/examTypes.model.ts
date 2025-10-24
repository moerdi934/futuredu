// models/examTypes.model.ts - Updated with array grade support
import pool from '../lib/db';

// Types
export interface ExamType {
  id: string;
  name: string;
  code: string;
  description?: string;
  kind?: number;
  master_id?: string;
  mix_master_id?: string[];
  grade?: number[];
  create_user_id?: string;
  edit_user_id?: string;
  create_date?: Date;
  edit_date?: Date;
  creator?: string;
  editor?: string;
}

export interface ExamTypeCreateData {
  name: string;
  description?: string;
  code?: string;
  kind?: number;
  master_id?: string;
  mix_master_id?: string[];
  grade?: number[];
  create_user_id?: string;
}

export interface ExamTypeUpdateData {
  name?: string;
  description?: string;
  code?: string;
  kind?: number;
  master_id?: string;
  mix_master_id?: string[];
  grade?: number[];
  edit_user_id?: string;
}

export interface ExamTypeSearchOptions {
  sortField?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
  search?: string;
  kind?: number; // Single kind (backward compatible)
  kinds?: number[]; // Multiple kinds (NEW)
  masterId?: string;
  grade?: number;
}

export interface ExamTypeSearchResult {
  examTypes: ExamType[];
  total: number;
}

export interface ExamTypePagedResult {
  data: ExamType[];
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface SubtopicInfo {
  id: string;
  sub_code: string;
  last_sequence: number;
  top_code: string;
  bid_code: string;
}

const getAllExamTypes = async (options: ExamTypeSearchOptions = {}): Promise<ExamTypeSearchResult> => {
  const {
    sortField = 'name',
    sortOrder = 'asc',
    page = 1,
    limit = 10,
  } = options;

  const offset = (page - 1) * limit;
  let query = `
    SELECT 
      et.id, 
      et.name, 
      et.code, 
      et.description,
      et.kind,
      et.master_id,
      et.mix_master_id,
      et.grade,
      et.create_date,
      et.edit_date,
      cu.name as creator,
      eu.name as editor,
      COUNT(*) OVER() AS total
    FROM exam_types et
    LEFT JOIN v_dashboard_userdata cu ON et.create_user_id = cu.userid
    LEFT JOIN v_dashboard_userdata eu ON et.edit_user_id = eu.userid
  `;

  const values: any[] = [];
  const validSortFields = ['id', 'name', 'code', 'kind', 'create_date'];
  if (validSortFields.includes(sortField.toLowerCase()) && ['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;
  } else {
    query += ` ORDER BY name ASC`;
  }

  query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  
  try {
    const result = await pool.query(query, [limit, offset]);
    return {
      examTypes: result.rows,
      total: result.rows.length > 0 ? parseInt(result.rows[0].total) : 0,
    };
  } catch (error) {
    console.error('Error getting all exam types:', error);
    throw error;
  }
};

const getExamTypeById = async (id: string): Promise<ExamType | undefined> => {
  try {
    const result = await pool.query(
      `SELECT 
        et.id, 
        et.name, 
        et.code, 
        et.description,
        et.kind,
        et.master_id,
        et.mix_master_id,
        et.grade,
        et.create_date,
        et.edit_date,
        cu.name as creator,
        eu.name as editor
      FROM exam_types et
      LEFT JOIN v_dashboard_userdata cu ON et.create_user_id = cu.userid
      LEFT JOIN v_dashboard_userdata eu ON et.edit_user_id = eu.userid
      WHERE et.id = $1`,
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error getting exam type by id:', error);
    throw error;
  }
};

const createExamType = async (data: ExamTypeCreateData): Promise<ExamType> => {
  const { name, description, code, kind, master_id, mix_master_id, grade, create_user_id } = data;
  try {
    const result = await pool.query(
      `INSERT INTO exam_types (name, description, code, kind, master_id, mix_master_id, grade, create_user_id, create_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING 
         id, name, code, description, kind, master_id, mix_master_id, grade, create_date`,
      [name, description, code, kind, master_id, mix_master_id, grade, create_user_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating exam type:', error);
    throw error;
  }
};

const updateExamType = async (id: string, data: ExamTypeUpdateData): Promise<ExamType | undefined> => {
  const { name, description, code, kind, master_id, mix_master_id, grade, edit_user_id } = data;
  try {
    const result = await pool.query(
      `UPDATE exam_types 
       SET name = $1, description = $2, code = $3, kind = $4, master_id = $5,
           mix_master_id = $6, grade = $7, edit_user_id = $8, edit_date = NOW()
       WHERE id = $9
       RETURNING 
         id, name, code, description, kind, master_id, mix_master_id, grade, edit_date`,
      [name, description, code, kind, master_id, mix_master_id, grade, edit_user_id, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating exam type:', error);
    throw error;
  }
};

const deleteExamType = async (id: string): Promise<ExamType | undefined> => {
  try {
    // Check if exam type is being used
    const usageCheck = await pool.query(
      `SELECT COUNT(*) as count FROM exam_types WHERE master_id = $1 OR $1 = ANY(mix_master_id)`,
      [id]
    );
    
    if (parseInt(usageCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete exam type that is being used as master');
    }

    const result = await pool.query(
      'DELETE FROM exam_types WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting exam type:', error);
    throw error;
  }
};

const searchExamTypes = async (options: ExamTypeSearchOptions = {}): Promise<ExamTypeSearchResult> => {
  const {
    search = '',
    kind,
    sortField = 'id',
    sortOrder = 'asc',
    page = 1,
    limit = 10,
    masterId,
    grade
  } = options;

  const offset = (page - 1) * limit;
  let query = `
    SELECT 
      et.id, 
      et.name, 
      et.code, 
      et.description,
      et.kind,
      et.master_id,
      et.mix_master_id,
      et.grade,
      et.create_date,
      et.edit_date,
      cu.name as creator,
      eu.name as editor,
      COUNT(*) OVER() AS total
    FROM exam_types et
    LEFT JOIN v_dashboard_userdata cu ON et.create_user_id = cu.userid
    LEFT JOIN v_dashboard_userdata eu ON et.edit_user_id = eu.userid
    WHERE (et.name ILIKE $1 OR et.description ILIKE $1 OR et.code ILIKE $1)
  `;
  
  const values: any[] = [`%${search}%`];

  if (kind !== undefined) {
    query += ` AND et.kind = $${values.length + 1}`;
    values.push(kind);
  }

  if (masterId !== undefined && masterId !== null) {
    query += ` AND et.master_id = $${values.length + 1}`;
    values.push(masterId);
  }

  if (grade !== undefined && grade !== null) {
    query += ` AND $${values.length + 1} = ANY(et.grade)`;
    values.push(grade);
  }

  const validSortFields = ['id', 'name', 'code', 'kind', 'create_date'];
  if (validSortFields.includes(sortField.toLowerCase()) && ['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    query += ` ORDER BY et.${sortField} ${sortOrder.toUpperCase()}`;
  } else {
    query += ` ORDER BY et.name ASC`;
  }

  query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(limit, offset);

  try {
    const result = await pool.query(query, values);
    return {
      examTypes: result.rows,
      total: result.rows.length > 0 ? parseInt(result.rows[0].total) : 0,
    };
  } catch (error) {
    console.error('Error searching exam types:', error);
    throw error;
  }
};

const getPagedExamTypes = async (options: ExamTypeSearchOptions = {}): Promise<ExamTypePagedResult> => {
  const {
    search = '',
    kind, // Single kind (backward compatible)
    kinds, // Multiple kinds (NEW)
    sortField = 'id',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
    masterId,
    grade
  } = options;

  const offset = (page - 1) * limit;
  
  let query = `
    SELECT 
      et.id, 
      et.name, 
      et.code, 
      et.description,
      et.kind,
      et.master_id,
      et.mix_master_id,
      et.grade,
      et.create_date,
      et.edit_date,
      cu.name as creator,
      eu.name as editor,
      CASE 
        WHEN et.master_id IS NOT NULL THEN (SELECT name FROM exam_types WHERE id = et.master_id)
        ELSE NULL
      END as master_name,
      COUNT(*) OVER() AS total
    FROM exam_types et
    LEFT JOIN v_dashboard_userdata cu ON et.create_user_id = cu.userid
    LEFT JOIN v_dashboard_userdata eu ON et.edit_user_id = eu.userid
    WHERE 1=1
  `;
  
  const values: any[] = [];

  if (search) {
    query += ` AND (et.name ILIKE $${values.length + 1} OR et.description ILIKE $${values.length + 1} OR et.code ILIKE $${values.length + 1})`;
    values.push(`%${search}%`);
  }

  // Support both single kind and multiple kinds
  if (kinds && kinds.length > 0) {
    // Multiple kinds: use ANY with array
    query += ` AND et.kind = ANY($${values.length + 1})`;
    values.push(kinds);
  } else if (kind !== undefined) {
    // Single kind: use equality
    query += ` AND et.kind = $${values.length + 1}`;
    values.push(kind);
  }

  if (masterId !== undefined && masterId !== null) {
    query += ` AND et.master_id = $${values.length + 1}`;
    values.push(masterId);
  }

  if (grade !== undefined && grade !== null) {
    query += ` AND $${values.length + 1} = ANY(et.grade)`;
    values.push(grade);
  }

  const validSortFields = ['id', 'name', 'code', 'kind', 'create_date', 'edit_date'];
  if (validSortFields.includes(sortField.toLowerCase()) && ['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    query += ` ORDER BY et.${sortField} ${sortOrder.toUpperCase()}`;
  } else {
    query += ` ORDER BY et.id DESC`;
  }

  query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(limit, offset);

  try {
    const result = await pool.query(query, values);
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total) : 0;
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: result.rows,
      total,
      currentPage: page,
      pageSize: limit,
      totalPages
    };
  } catch (error) {
    console.error('Error getting paged exam types:', error);
    throw error;
  }
};

const getSubtopicsInfo = async (subtopicIds: string[]): Promise<SubtopicInfo[]> => {
  if (!subtopicIds.length) return [];
  
  const placeholders = subtopicIds.map((_, i) => `$${i + 1}`).join(',');
  
  const query = `
    WITH subtopics AS (
      SELECT 
        et.id,
        et.code AS sub_code,
        et.master_id AS top_id,
        (SELECT MAX(CAST(SUBSTRING(q.code FROM 8 FOR 4) AS INTEGER)) 
          FROM questions q 
          WHERE q.question_topic_type = et.id) AS last_sequence
      FROM exam_types et
      WHERE et.id IN (${placeholders})
    ),
    topics AS (
      SELECT
        t.id,
        t.code AS top_code,
        t.master_id AS bid_id
      FROM exam_types t
      WHERE t.id IN (SELECT top_id FROM subtopics)
    ),
    bids AS (
      SELECT
        b.id,
        b.code AS bid_code
      FROM exam_types b
      WHERE b.id IN (SELECT bid_id FROM topics)
    )
    SELECT
      s.id,
      s.sub_code,
      s.last_sequence,
      t.top_code,
      b.bid_code
    FROM subtopics s
    JOIN topics t ON s.top_id = t.id
    JOIN bids b ON t.bid_id = b.id
  `;

  const result = await pool.query(query, subtopicIds);
  return result.rows;
};

// Get hierarchy data for filters
const getKindOptions = async (kind: number): Promise<ExamType[]> => {
  try {
    const result = await pool.query(
      `SELECT id, name, code FROM exam_types WHERE kind = $1 ORDER BY name ASC`,
      [kind]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting kind options:', error);
    throw error;
  }
};

export {
  getAllExamTypes,
  getExamTypeById,
  createExamType,
  updateExamType,
  deleteExamType,
  searchExamTypes,
  getPagedExamTypes,
  getSubtopicsInfo,
  getKindOptions
};