// models/examOrder.model.ts
import pool from '../lib/db';

// Types
export interface ExamOrder {
  id: number;
  user_name: string;
  exam_order: string[];
  exam_schedule_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ExamDetails {
  exam_string: string;
  name: string;
  duration: number;
  exam_id: number;
}

export interface ExamSchedule {
  exam_id_list: number[];
  is_need_order_exam: boolean;
}

export interface ExamInfo {
  question_id_list: number[];
  is_need_order_question: boolean;
  exam_string: string;
}

export interface QuestionOrder {
  id: number;
  user_id: string;
  exam_id: number;
  exam_schedule_id: number;
  question_id_list: number[];
  created_at?: Date;
  updated_at?: Date;
}

export interface QuestionOrderResult {
  exam_id: number;
  question_id_list: number[];
  exam_string?: string;
}

// Get exam order by userName (exam_order contains shuffled exam names)
export const getExamOrderByUserName = async (userName: string, scheduleId: number): Promise<ExamOrder | null> => {
  try {
    const result = await pool.query('SELECT * FROM exam_orders WHERE user_name = $1 and exam_schedule_id = $2', [userName, scheduleId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching exam order:', error);
    throw error;
  }
};

// Insert a new exam order (using shuffled exam names)
export const createExamOrder = async (userName: string, examOrder: string[], scheduleId: number): Promise<ExamOrder> => {
  try {
    const result = await pool.query(
      'INSERT INTO exam_orders (user_name, exam_order, exam_schedule_id) VALUES ($1, $2, $3) RETURNING *',
      [userName, examOrder, scheduleId],
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating exam order:', error);
    throw error;
  }
};

// Get exam names by array of exam IDs
export const getExamNamesByIds = async (examIdList: number[]): Promise<string[]> => {
  try {
    const result = await pool.query(
      `SELECT name
       FROM exams
       WHERE id = ANY($1::int[])`,
      [examIdList]
    );
    return result.rows.map(row => row.name); // Return array of names
  } catch (error) {
    console.error('Error fetching exam names:', error);
    throw error;
  }
};

// Get exam details by shuffled exam names
export const getExamDetailsByNames = async (examOrder: string[], scheduleId: number): Promise<ExamDetails[]> => {
  try {
    const result = await pool.query(
      `SELECT e.exam_string, e.name, e.duration, e.id as exam_id
       FROM exams e
       INNER JOIN exam_schedule es ON es.id = $2
       WHERE e.name = ANY($1::text[])
         AND e.id = ANY(es.exam_id_list)
       ORDER BY array_position($1::text[], e.name)`,
      [examOrder, scheduleId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching exam details:', error);
    throw error;
  }
};

// Get exam_id_list from exam_schedule by schedule ID
export const getExamIdListFromSchedule = async (scheduleId: number): Promise<ExamSchedule | null> => {
  try {
    const result = await pool.query(
      `SELECT exam_id_list, is_need_order_exam
       FROM exam_schedule
       WHERE id = $1`,
      [scheduleId]
    );
    return result.rows[0] || null; // Return the exam_id_list
  } catch (error) {
    console.error('Error fetching exam schedule:', error);
    throw error;
  }
};

export const getExamSchedule = async (scheduleId: number): Promise<{ exam_id_list: number[] } | null> => {
  console.log("getExamSchedule called with scheduleId:", scheduleId); 
  const result = await pool.query(
    `SELECT exam_id_list 
     FROM exam_schedule 
     WHERE id = $1`,
    [scheduleId]
  );
  return result.rows[0] || null;
};

export const getExamDetails = async (examId: number): Promise<ExamInfo | null> => {
  const result = await pool.query(
    `SELECT question_id_list, is_need_order_question, exam_string 
     FROM exams 
     WHERE id = $1`,
    [examId]
  );
  return result.rows[0] || null;
};

export const getExistingQuestionOrders = async (userId: string, scheduleId: number, examIds: number[]): Promise<QuestionOrder[]> => {
  const result = await pool.query(
    `SELECT * 
     FROM question_order 
     WHERE user_id = $1 
       AND exam_schedule_id = $2 
       AND exam_id = ANY($3)`,
    [userId, scheduleId, examIds]
  );
  return result.rows;
};

export const createQuestionOrder = async (userId: string, examId: number, scheduleId: number, questionIdList: number[]): Promise<QuestionOrder> => {
  const result = await pool.query(
    `INSERT INTO question_order 
       (user_id, exam_id, exam_schedule_id, question_id_list) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [userId, examId, scheduleId, questionIdList]
  );
  return result.rows[0];
};

export const updateQuestionOrder = async (orderId: number, newQuestionIdList: number[]): Promise<QuestionOrder> => {
  const result = await pool.query(
    `UPDATE question_order 
     SET question_id_list = $1 
     WHERE id = $2 
     RETURNING *`,
    [newQuestionIdList, orderId]
  );
  return result.rows[0];
};