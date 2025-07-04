// models/exam.model.ts
import pool from '../lib/db';

// Types
export interface Exam {
  id: number;
  name: string;
  duration: number;
  exam_string: string;
  create_user_id: number;
  edit_user_id?: number;
  create_date: Date;
  edit_date?: Date;
  exam_group: number;
  question_id_list: number[];
}

export interface ExamCreateData {
  name: string;
  duration: number;
  exam_group: number;
  question_id_list: number[];
}

export interface ExamUpdateData {
  id: number;
  name: string;
  duration: number;
  edit_user_id: number;
}

export interface ExamSearchResult {
  id: number;
  name: string;
  duration: number;
}

export interface ExamByIdsResult {
  id: number;
  name: string;
}

// Get exam by exam_string
export const getExamByString = async (examString: string): Promise<Exam | null> => {
  try {
    const result = await pool.query('SELECT * FROM exams WHERE exam_string = $1', [examString]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching exam:', error);
    throw error;
  }
};

export const getExamString = async (id: number): Promise<string | null> => {
  try {
    const result = await pool.query('SELECT exam_string FROM exams WHERE id = $1', [id]);
    return result.rows[0]?.exam_string || null;
  } catch (error) {
    console.error('Error fetching exam:', error);
    throw error;
  }
};

export const searchExams = async (query: string | null, limit: number, userId: number | null): Promise<ExamSearchResult[]> => {
  try {
    // Start constructing the query
    let sql = `
      SELECT id, name, duration
      FROM exams
    `;
    
    // Initialize WHERE clauses and values
    let whereClauses: string[] = [];
    let values: any[] = [];
    let valueIndex = 1;
    
    if (query) {
      whereClauses.push(`(name ILIKE $${valueIndex} OR CAST(id AS TEXT) ILIKE $${valueIndex})`);
      values.push(`%${query}%`);
      valueIndex++;
    }

    if (userId) {
      whereClauses.push(`edit_user_id = $${valueIndex}`);
      values.push(userId);
      valueIndex++;
    }

    // Append WHERE clauses if any
    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Append ORDER BY and LIMIT
    sql += `
      ORDER BY id ASC
      LIMIT $${valueIndex}
    `;
    values.push(limit);

    console.log(sql);

    const result = await pool.query(sql, values);
    return result.rows;
  } catch (error) {
    console.error('Error searching exams:', error);
    throw error;
  }
};

export const createExam = async (examData: ExamCreateData, create_user_id: number): Promise<Exam> => {
  const { name, duration, exam_group, question_id_list } = examData;
  console.log(examData);
  
  try {
    const result = await pool.query(
      `INSERT INTO exams (name, duration, create_user_id, create_date, exam_group, question_id_list)
       VALUES ($1, $2, $3, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', $4, $5)
       RETURNING *`,
      [name, duration, create_user_id, exam_group, question_id_list]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan exams berdasarkan IDs
export const getExamsByIds = async (examIds: number[]): Promise<ExamByIdsResult[]> => {
  try {
    const query = `
      SELECT id, name
      FROM exams
      WHERE id = ANY($1::int[])
      ORDER BY id ASC
    `;
    const result = await pool.query(query, [examIds]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching exams by IDs:', error);
    throw error;
  }
};

export const updateExam = async (examData: ExamUpdateData): Promise<Exam | null> => {
  const { id, name, duration, edit_user_id } = examData;

  try {
    const result = await pool.query(
      `UPDATE exams
       SET name = $1, duration = $2, edit_user_id = $3, edit_date = NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
       WHERE id = $4
       RETURNING *`,
      [name, duration, edit_user_id, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating exam:', error); 
    throw error;
  }
};