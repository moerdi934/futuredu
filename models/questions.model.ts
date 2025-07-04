// models/questions.model.ts
import pool from '../lib/db';
import * as crypto from 'crypto';

// Types
export interface Question {
  id: number;
  question_topic_type?: number;
  question_type: string;
  question_text: string;
  options?: string[];
  correct_answer?: string[];
  statements?: string[];
  passage_id?: number;
  code?: string;
  create_user_id?: string;
  edit_user_id?: string;
  create_date?: Date;
  edit_date?: Date;
  pembahasan?: string;
  level?: number;
  exam_id_list?: number[];
}

export interface QuestionFilters {
  page?: number;
  limit?: number;
  search?: string;
  question_type?: string;
  exam_id?: number;
  topic?: string;
  subtopic?: string;
  creator?: string;
  start_date?: string;
  end_date?: string;
  sortKey?: string;
  sortOrder?: string;
  userId?: string;
}

export interface QuestionSearchResult {
  id: number;
  code: string;
}

export interface PagedQuestionsResult {
  data: any[];
  total: number;
  totalPages: number;
}

export interface QuestionPassage {
  id?: number;
  title: string;
  passage: string;
  create_user_id?: string;
  update_user_id?: string;
  create_date?: Date;
  update_date?: Date;
}

export interface VerificationPair {
  id: string;
  code: string;
}

export interface VerificationResult {
  id: string;
  code: string;
  status: 'match' | 'id_not_found' | 'code_mismatch';
  found_code: string | null;
  is_match: boolean;
}

export interface VerificationSummary {
  results: VerificationResult[];
  summary: {
    total: number;
    matched: number;
    id_not_found: number;
    code_mismatched: number;
    success_rate: string;
  };
}

// Helper Functions
const shuffleArray = (array: any[], seed: number): any[] => {
  const result = [...array];
  let currentIndex = result.length;
  let temporaryValue, randomIndex;

  // Use seed for reproducible randomness
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  while (0 !== currentIndex) {
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = result[currentIndex];
    result[currentIndex] = result[randomIndex];
    result[randomIndex] = temporaryValue;
  }

  return result;
};

const makeSeed = (examString: string, level: number): number => {
  const nonce = crypto.randomBytes(4).readUInt32LE(0);
  const hash = crypto
    .createHash('sha256')
    .update(`${examString}-${level}-${nonce}`)
    .digest();
  return hash.readUInt32LE(0) & 0x7fffffff;
};

// Model Functions
export const searchQuestionsByCodeOrId = async (search: string): Promise<QuestionSearchResult[]> => {
  try {
    if (!search || search.trim() === '') {
      return [];
    }

    const query = `
      SELECT id, code
      FROM   questions
      WHERE  code ILIKE $1 OR CAST(id AS text) ILIKE $1
      ORDER  BY md5(id::text)
      LIMIT  15;
    `;
    const values = [`%${search}%`];
    const result = await pool.query(query, values);

    return result.rows.map(row => ({
      id: row.id,
      code: row.code
    }));
  } catch (error) {
    console.error('Error searching questions by code or id:', error);
    throw error;
  }
};

export const getAllQuestions = async (): Promise<Question[]> => {
  try {
    const result = await pool.query('SELECT * FROM questions ORDER BY id');
    return result.rows;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const getPagedQuestions = async (filters: QuestionFilters): Promise<PagedQuestionsResult> => {
  const {
    page = 1,
    limit = 50,
    search = '',
    question_type = 'All',
    exam_id,
    topic,
    subtopic,
    creator,
    start_date,
    end_date,
    sortKey = 'q.id',
    sortOrder = 'asc',
    userId,
  } = filters;

  const offset = (page - 1) * limit;

  const allowedSortKeys = [
    'q.id',
    'question_type',
    'question_text',
    'correct_answer',
    'topic',
    'subtopic',
    'creator',
    'create_date',
    'editor',
    'edit_date',
  ];

  const validatedSortKey = allowedSortKeys.includes(sortKey) ? sortKey : 'q.id';
  const validatedSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const baseSelectClause = `
    SELECT 
      q.id,
      ARRAY_AGG(e.id) AS exam_id,
      ARRAY_AGG(e.name) AS exam_name,
      q.question_type,
      q.question_text,
      q.options,
      q.correct_answer,
      et.name AS subtopic,
      et2.name AS topic,
      COALESCE(u.name, 'admin') AS creator,
      q.create_date::date AS create_date,
      u2.name AS editor,
      q.edit_date::date AS edit_date,
      q.pembahasan,
      pg.title,
      pg.passage
  `;

  const baseFromClause = `
    FROM questions q
    LEFT JOIN exams e ON q.id = ANY(e.question_id_list)
    LEFT JOIN v_dashboard_userdata u ON u.userid = q.create_user_id
    LEFT JOIN v_dashboard_userdata u2 ON u2.userid = q.edit_user_id
    LEFT JOIN exam_types et ON et.id = q.question_topic_type
    LEFT JOIN exam_types et2 ON et2.id = et.id
    LEFT Join question_passages pg on pg.id = q.passage_id
  `;

  let whereClauses: string[] = [];
  let values: any[] = [];
  let valueIndex = 1;
  let filterParamsCount = 0;

  if (search) {
    whereClauses.push(`(q.question_text ILIKE $${valueIndex} OR CAST(q.id AS TEXT) ILIKE $${valueIndex})`);
    values.push(`%${search}%`);
    valueIndex++;
    filterParamsCount++;
  }

  if (question_type && question_type !== 'All') {
    whereClauses.push(`q.question_type = $${valueIndex}`);
    values.push(question_type);
    valueIndex++;
    filterParamsCount++;
  }

  if (exam_id) {
    whereClauses.push(`q.id = ANY(SELECT question_id_list FROM exams WHERE id = $${valueIndex})`);
    values.push(exam_id);
    valueIndex++;
    filterParamsCount++;
  }

  if (topic) {
    whereClauses.push(`et2.name = $${valueIndex}`);
    values.push(topic);
    valueIndex++;
    filterParamsCount++;
  }

  if (subtopic) {
    whereClauses.push(`et.name = $${valueIndex}`);
    values.push(subtopic);
    valueIndex++;
    filterParamsCount++;
  }

  if (creator) {
    whereClauses.push(`u.name = $${valueIndex}`);
    values.push(creator);
    valueIndex++;
    filterParamsCount++;
  }

  if (start_date) {
    whereClauses.push(`q.create_date::date >= $${valueIndex}`);
    values.push(start_date);
    valueIndex++;
    filterParamsCount++;
  }

  if (end_date) {
    whereClauses.push(`q.create_date::date <= $${valueIndex}`);
    values.push(end_date);
    valueIndex++;
    filterParamsCount++;
  }

  if (userId) {
    whereClauses.push(`(q.create_user_id = $${valueIndex} OR q.edit_user_id = $${valueIndex})`);
    values.push(userId);
    valueIndex++;
    filterParamsCount++;
  }

  let whereClause = whereClauses.length > 0 
    ? ' WHERE ' + whereClauses.join(' AND ')
    : '';

  const mainQuery = `
    ${baseSelectClause}
    ${baseFromClause}
    ${whereClause}
    GROUP BY q.id, q.question_type, q.question_text, q.options, q.correct_answer, 
            et.name, et2.name, u.name, q.create_date, u2.name, q.edit_date, q.pembahasan,
      pg.title,
      pg.passage
    ORDER BY ${validatedSortKey} ${validatedSortOrder}
    LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
  `;
  values.push(limit, offset);

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM (
      SELECT q.id
      ${baseFromClause}
      ${whereClause}
      GROUP BY q.id
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
    console.error('Error fetching paged questions:', error);
    throw error;
  }
};

export const getTotalQuestions = async ({ search, type, examId, userId }: {
  search?: string;
  type?: string;
  examId?: number;
  userId?: string;
}): Promise<number> => {
  try {
    let query = `
      SELECT COUNT(DISTINCT q.id) AS total
      FROM questions q
      LEFT JOIN exams e ON q.id = ANY(e.question_id_list)
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (q.question_text ILIKE $${paramIndex} OR CAST(q.id AS TEXT) ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (type && type !== 'All') {
      query += ` AND q.question_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (examId) {
      query += ` AND q.id = ANY(SELECT question_id_list FROM exams WHERE id = $${paramIndex})`;
      params.push(examId);
      paramIndex++;
    }

    if (userId) {
      query += ` AND (q.create_user_id = $${paramIndex} OR q.edit_user_id = $${paramIndex})`;
      params.push(userId);
      paramIndex++;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].total, 10);
  } catch (error) {
    console.error('Error fetching total questions:', error);
    throw error;
  }
};

export const getDiagnosticQuestionsByExamString = async (exam_string: string) => {
  const client = await pool.connect();
  try {
    const examRes = await client.query(
      `SELECT id, duration,
              level_1_question_qty,
              level_2_question_qty,
              level_3_question_qty,
              level_4_question_qty, 
              level_5_question_qty,
              question_id_list
       FROM   exams
       WHERE  exam_string = $1`,
      [exam_string]
    );
    if (!examRes.rowCount) throw new Error('Exam not found');
    const exam = examRes.rows[0];

    const qRes = await client.query(
      `SELECT *
       FROM   questions
       WHERE  id = ANY($1::int[])`,
      [exam.question_id_list]
    );

    const grouped: { [key: number]: any[] } = {};
    for (const q of qRes.rows) {
      const lvl = q.level;
      (grouped[lvl] ??= []).push(q);
    }

    const spec = [
      { lvl: 1, qty: exam.level_1_question_qty },
      { lvl: 2, qty: exam.level_2_question_qty },
      { lvl: 3, qty: exam.level_3_question_qty },
      { lvl: 4, qty: exam.level_4_question_qty },
      { lvl: 5, qty: exam.level_5_question_qty },
    ];

    const finalQuestions: any[] = [];

    for (const { lvl, qty } of spec) {
      const poolForLvl = grouped[lvl] ?? [];
      if (!poolForLvl.length) continue;

      const shuffled = shuffleArray(poolForLvl, makeSeed(exam_string, lvl));
      finalQuestions.push(...shuffled.slice(0, qty || shuffled.length));
    }

    return {
      duration: exam.duration,
      questions: finalQuestions.map((q) => ({
        id: q.id,
        level: q.level,
        type: q.question_type,
        question: q.question_text,
        options: q.options,
        correct: q.correct_answer,
        statements: q.statements,
      })),
    };
  } finally {
    client.release();
  }
};

export const getQuestionsByExamString = async (exam_string: string) => {
  try {
    const examResult = await pool.query('SELECT * FROM exams WHERE exam_string = $1', [exam_string]);
    
    if (examResult.rows.length === 0) {
      throw new Error('Exam not found');
    }

    const examId = examResult.rows[0].id;

    const query = `
      SELECT q.*
      FROM questions q
      WHERE q.id = ANY (
        SELECT unnest(question_id_list)
        FROM exams
        WHERE id = $1
      )
      ORDER BY q.id
    `;

    const questionsResult = await pool.query(query, [examId]);

    return {
      duration: examResult.rows[0].duration,
      questions: questionsResult.rows.map((q: any) => ({
        id: q.id,
        type: q.question_type,
        question: q.question_text,
        options: q.options,
        correct: q.correct_answer,
        statements: q.statements
      }))
    };
  } catch (error) {
    console.error('Error fetching questions by exam_string:', error);
    throw error;
  }
};

export const getQuestionsByExamId = async (examId: number) => {
  try {
    const query = `
      SELECT q.*
      FROM questions q
      WHERE q.id = ANY (
        SELECT unnest(question_id_list)
        FROM exams
        WHERE id = $1
      )
      ORDER BY q.id
    `;

    const questionsResult = await pool.query(query, [examId]);

    return {
      questions: questionsResult.rows.map((q: any) => ({
        id: q.id,
        type: q.question_type,
        question: q.question_text,
        options: q.options,
        correct: q.correct_answer,
        statements: q.statements
      }))
    };
  } catch (error) {
    console.error('Error fetching questions by examId:', error);
    throw error;
  }
};

export const getQuestionById = async (id: number): Promise<Question | null> => {
  try {
    const result = await pool.query('SELECT * FROM questions WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
};

export const getQuestionByUId = async (id: number) => {
  try {
    const result = await pool.query('SELECT id, question_type, question_text,options, statements, level FROM questions WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
};

export const createQuestion = async (questionData: Partial<Question>, create_user_id: string): Promise<Question> => {
  const client = await pool.connect();
  
  try {
    const defaultPembahasan = `
    <div>
      <h4>Pembahasan belum tersedia secara spesifik.</h4>
      <p>Silakan cek kembali soal dan diskusikan dengan pengajar atau teman sekelas.</p>
    </div>
    `;

    const insertQuery = `
      INSERT INTO questions 
        (question_topic_type, question_type, question_text, options, correct_answer, statements, passage_id, code, create_user_id, pembahasan, level) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *
    `;

    const { 
      question_topic_type,
      question_type, 
      question_text, 
      options, 
      correct_answer, 
      statements,
      passage_id,
      code,
      pembahasan,
      level
    } = questionData;

    const result = await client.query(insertQuery, [
      question_topic_type,
      question_type,
      question_text,
      options,
      correct_answer,
      statements,
      passage_id,
      code,
      create_user_id,
      pembahasan || defaultPembahasan,
      level
    ]);

    return result.rows[0];

  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const createBulkQuestions = async (questions: Partial<Question>[], create_user_id: string): Promise<Question[]> => {
  try {
    await pool.query('BEGIN');
    
    const createdQuestions: Question[] = [];
    
    const insertQuery = `
      INSERT INTO questions 
        (exam_id, question_type, question_text, options, correct_answer, statements, create_user_id, question_topic_type, edit_date) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, null) 
      RETURNING *
    `;

    for (const question of questions) {
      const result = await pool.query(insertQuery, [
        (question as any).exam_id,
        question.question_type,
        question.question_text,
        question.options,
        question.correct_answer,
        question.statements,
        create_user_id,
        question.question_topic_type
      ]);

      createdQuestions.push(result.rows[0]);
    }

    await pool.query('COMMIT');
    return createdQuestions;

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error in bulk question creation:', error);
    throw error;
  }
};

export const updateQuestion = async (id: number, questionData: Partial<Question>, edit_user_id: string): Promise<Question | null> => {
  const { 
    question_text, 
    question_type, 
    options, 
    correct_answer, 
    statements, 
    question_topic_type
  } = questionData;
  
  try {
    const result = await pool.query(
      `UPDATE questions 
      SET 
        question_text = $1, 
        question_type = $2, 
        options = $3::text[], 
        correct_answer = $4::text[], 
        statements = $5::text[],
        edit_user_id = $6,
        edit_date = NOW(),
        question_topic_type = $8
      WHERE id = $7 
      RETURNING *`,
      [question_text, question_type, options, correct_answer, statements, edit_user_id, id, question_topic_type]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

export const updateBulkQuestions = async (questions: Partial<Question>[], edit_user_id: string): Promise<Question[]> => {
  try {
    await pool.query('BEGIN');
    
    const updatedQuestions: Question[] = [];
    
    const updateQuery = `
      UPDATE questions 
      SET 
        exam_id = $1,
        question_type = $2,
        question_text = $3,
        options = $4,
        correct_answer = $5,
        statements = $6,
        edit_user_id = $7,
        question_topic_type = $8,
        edit_date = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;

    for (const question of questions) {
      const result = await pool.query(updateQuery, [
        (question as any).exam_id,
        question.question_type,
        question.question_text,
        question.options,
        question.correct_answer,
        question.statements,
        edit_user_id,
        question.question_topic_type,
        question.id
      ]);

      if (result.rows.length === 0) {
        throw new Error(`Question with ID ${question.id} not found`);
      }

      updatedQuestions.push(result.rows[0]);
    }

    await pool.query('COMMIT');
    return updatedQuestions;

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error in bulk question update:', error);
    throw error;
  }
};

export const appendExamIdToQuestion = async (questionId: number, examId: number) => {
  try {
    const questionCheck = await pool.query('SELECT * FROM questions WHERE id = $1', [questionId]);
    if (questionCheck.rows.length === 0) {
      throw new Error('Question not found');
    }

    const examCheck = await pool.query('SELECT * FROM exams WHERE id = $1', [examId]);
    if (examCheck.rows.length === 0) {
      throw new Error('Exam not found');
    }

    const result = await pool.query(
      `UPDATE questions
      SET exam_id_list = array_append(COALESCE(exam_id_list, '{}'), $1::INTEGER)
      WHERE id = $2
      RETURNING *`,
      [examId, questionId]
    );

    return {
      id: result.rows[0].id,
      exam_id_list: result.rows[0].exam_id_list,
    };
  } catch (error) {
    console.error('Error appending exam_id to question:', error);
    throw error;
  }
};

export const deleteQuestion = async (id: number): Promise<Question | null> => {
  try {
    const result = await pool.query(
      'DELETE FROM questions WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// Question Passages Functions
export const searchPassages = async (search: string): Promise<QuestionPassage[]> => {
  try {
    if (!search || search.trim() === '') {
      return [];
    }

    const query = `
      SELECT id, title, passage
      FROM question_passages
      WHERE id::text ILIKE $1 OR title ILIKE $1
      ORDER BY id
      LIMIT 10
    `;
    const values = [`%${search}%`];
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error searching passages:', error);
    throw error;
  }
};

export const getPassageById = async (id: number): Promise<QuestionPassage | null> => {
  try {
    const result = await pool.query('SELECT * FROM question_passages WHERE id = $1', [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching passage:', error);
    throw error;
  }
};

export const createPassage = async (passageData: QuestionPassage, create_user_id: string): Promise<QuestionPassage> => {
  const { title, passage } = passageData;
  try {
    const result = await pool.query(
      `INSERT INTO question_passages 
        (title, passage, create_user_id, create_date) 
      VALUES 
        ($1, $2, $3, NOW()) 
      RETURNING *`,
      [title, passage, create_user_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating passage:', error);
    throw error;
  }
};

export const updatePassage = async (id: number, passageData: QuestionPassage, update_user_id: string): Promise<QuestionPassage | null> => {
  const { title, passage } = passageData;
  try {
    const result = await pool.query(
      `UPDATE question_passages
      SET 
        title = $1,
        passage = $2,
        update_user_id = $3,
        update_date = NOW()
      WHERE id = $4
      RETURNING *`,
      [title, passage, update_user_id, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating passage:', error);
    throw error;
  }
};

export const verifyIdCodePairs = async (pairs: VerificationPair[]): Promise<VerificationSummary> => {
  const client = await pool.connect();
  
  try {
    const results: VerificationResult[] = [];
    
    for (const pair of pairs) {
      const { id, code } = pair;
      
      const selectQuery = `
        SELECT id, code 
        FROM questions 
        WHERE id = $1
      `;
      
      const result = await client.query(selectQuery, [id]);
      
      if (result.rows.length === 0) {
        results.push({
          id: id,
          code: code,
          status: 'id_not_found',
          found_code: null,
          is_match: false
        });
      } else {
        const foundQuestion = result.rows[0];
        const isMatch = foundQuestion.code === code;
        
        results.push({
          id: id,
          code: code,
          status: isMatch ? 'match' : 'code_mismatch',
          found_code: foundQuestion.code,
          is_match: isMatch
        });
      }
    }
    
    const totalPairs = results.length;
    const matchedPairs = results.filter(r => r.is_match).length;
    const notFoundIds = results.filter(r => r.status === 'id_not_found').length;
    const mismatchedCodes = results.filter(r => r.status === 'code_mismatch').length;
    
    return {
      results: results,
      summary: {
        total: totalPairs,
        matched: matchedPairs,
        id_not_found: notFoundIds,
        code_mismatched: mismatchedCodes,
        success_rate: totalPairs > 0 ? ((matchedPairs / totalPairs) * 100).toFixed(2) + '%' : '0%'
      }
    };

  } catch (error) {
    console.error('Error verifying ID-Code pairs:', error);
    throw error;
  } finally {
    client.release();
  }
};