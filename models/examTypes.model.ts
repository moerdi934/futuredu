// models/examTypes.model.ts
import pool from '../lib/db';

// Types
export interface ExamType {
  id: string;
  name: string;
  code: string;
  description?: string;
  kind?: number;
  master_id?: string;
  create_user_id?: string;
  edit_user_id?: string;
  create_date?: Date;
  edit_date?: Date;
}

export interface ExamTypeCreateData {
  name: string;
  description?: string;
  code?: string;
  kind?: number;
  master_id?: string;
  create_user_id?: string;
}

export interface ExamTypeUpdateData {
  name?: string;
  description?: string;
  code?: string;
  kind?: number;
  master_id?: string;
  edit_user_id?: string;
}

export interface ExamTypeSearchOptions {
  sortField?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
  search?: string;
  kind?: number;
  masterId?: string;
}

export interface ExamTypeSearchResult {
  examTypes: ExamType[];
  total: number;
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
    SELECT id, name, code, COUNT(*) OVER() AS total
    FROM exam_types
  `;

  const values: any[] = [];
  const validSortFields = ['id', 'name', 'code'];
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
      'SELECT id, name, code FROM exam_types WHERE id = $1',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error getting exam type by id:', error);
    throw error;
  }
};

const createExamType = async (data: ExamTypeCreateData): Promise<ExamType> => {
  const { name, description, code, kind, master_id, create_user_id } = data;
  try {
    const result = await pool.query(
      `INSERT INTO exam_types (name, description, code, kind, master_id, create_user_id, create_date)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, name, code`,
      [name, description, code, kind, master_id, create_user_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating exam type:', error);
    throw error;
  }
};

const updateExamType = async (id: string, data: ExamTypeUpdateData): Promise<ExamType | undefined> => {
  const { name, description, code, kind, master_id, edit_user_id } = data;
  try {
    const result = await pool.query(
      `UPDATE exam_types 
       SET name = $1, description = $2, code = $3, kind = $4, master_id = $5,
           edit_user_id = $6, edit_date = NOW()
       WHERE id = $7
       RETURNING id, name, code`,
      [name, description, code, kind, master_id, edit_user_id, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating exam type:', error);
    throw error;
  }
};

const deleteExamType = async (id: string): Promise<ExamType | undefined> => {
  try {
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
    masterId
  } = options;

  if (kind === undefined) {
    throw new Error('Kind parameter is required');
  }

  const offset = (page - 1) * limit;
  let query = `
    SELECT 
      et.id, 
      et.name, 
      et.code, 
      COUNT(*) OVER() AS total
      ${kind == 3 ? `, COALESCE((
        SELECT MAX(CAST(SUBSTRING(q.code FROM 8 FOR 4) AS INTEGER)) + 1
        FROM questions q
        WHERE SUBSTRING(q.code FROM 6 FOR 2) = et.code
      ), 1) AS "NextID"` : ''}
    FROM exam_types et
    WHERE (et.name ILIKE $1 OR et.description ILIKE $1 OR et.code ILIKE $1)
    AND kind = $2
  `;
  const values: any[] = [`%${search}%`, kind];

  // Tambahkan kondisi master_id jika masterId tersedia
  if (masterId !== undefined && masterId !== null) {
    query += ` AND et.master_id = $${values.length + 1}`;
    values.push(masterId);
  }

  const validSortFields = ['id', 'name', 'code'];
  if (validSortFields.includes(sortField.toLowerCase()) && ['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;
  } else {
    query += ` ORDER BY name ASC`;
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

export {
  getAllExamTypes,
  getExamTypeById,
  createExamType,
  updateExamType,
  deleteExamType,
  searchExamTypes,
  getSubtopicsInfo
};