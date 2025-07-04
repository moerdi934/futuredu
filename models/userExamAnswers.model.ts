// models/userExamAnswers.model.ts
import pool from '../lib/db';
import { PoolClient } from 'pg';

// Types
export interface ExamSchedule {
  id: number;
  exam_id_list: number[];
}

export interface ExamSession {
  id: number;
  exam_id: number;
  user_id: number;
  answers: string | object;
}

export interface Question {
  id: number;
  question_type: string;
  correct_answer: any;
  level?: number;
  pembahasan?: string;
}

export interface UserAnswer {
  id?: number;
  exam_id: number;
  question_id: number;
  user_answer: any;
  user_id: number;
  is_correct: boolean;
  answer_time?: Date;
  elapsed_time?: number;
}

export interface UserExamScore {
  id?: number;
  user_id: number;
  exam_id: number;
  score: number;
  total_questions: number;
  total_correct: number;
  exam_schedule_id?: number;
}

export interface ExamStatLevel {
  schedule_id: number;
  user_id: number;
  total_questions_answered: number;
  total_correct_answers: number;
  avg_elapsed_time: number;
  level: number;
  questions_per_level: number;
  correct_per_level: number;
  avg_time_per_level: number;
}

export interface ExamQuestionsData {
  exam_id: number;
  question_ids: number[];
  total_questions: number;
}

export interface UserExamStatResult {
  stats: ExamStatLevel[];
  questions_per_exam: ExamQuestionsData[];
}

/**
 * Get exam schedule by ID
 */
export const getExamScheduleById = async (scheduleId: number): Promise<ExamSchedule | null> => {
  const query = `
    SELECT id, exam_id_list
    FROM exam_schedule
    WHERE id = $1
  `;
  const result = await pool.query(query, [scheduleId]);
  return result.rows[0] || null;
};

/**
 * Get exam sessions by schedule ID and user ID
 */
export const getExamSessionsByScheduleAndUser = async (
  scheduleId: number, 
  userId: number
): Promise<ExamSession[]> => {
  const query = `
    WITH RankedSessions AS (
      SELECT 
        ts.*,
        ROW_NUMBER() OVER (PARTITION BY ts.exam_id ORDER BY ts.last_save DESC) as rn
      FROM "tExamSession" ts
      WHERE 
        ts.exam_schedule_id = $1 
        AND ts.user_id = $2 
        AND ts.is_submitted = true
    )
    SELECT id, exam_id, user_id, answers
    FROM RankedSessions
    WHERE rn = 1
  `;
  
  const result = await pool.query(query, [scheduleId, userId]);
  return result.rows;
};

/**
 * Get all questions for an exam
 */
export const getExamQuestions = async (examId: number): Promise<Question[]> => {
  const query = `
    SELECT q.id, q.question_type, q.correct_answer
    FROM exams e
    LEFT JOIN LATERAL unnest(e.question_id_list) AS question_id ON TRUE
    LEFT JOIN questions q ON q.id = question_id
    WHERE e.id = $1
  `;
  const result = await pool.query(query, [examId]);
  return result.rows;
};

/**
 * Format user answer for PostgreSQL storage
 */
export const formatAnswerForStorage = (userAnswer: any, questionType: string): string | null => {
  if (userAnswer === null || userAnswer === undefined) {
    return null;
  }
  
  if (Array.isArray(userAnswer)) {
    if (questionType === 'true-false') {
      const boolArray = userAnswer.map(val => val === true || val === 'true' ? 'true' : 'false');
      return `{${boolArray.join(',')}}`;
    }
    return `{${userAnswer.join(',')}}`;
  }
  
  if (questionType === 'true-false') {
    const boolValue = userAnswer === true || userAnswer === 'true' ? 'true' : 'false';
    return `{${boolValue}}`;
  }
  
  if (['single-choice', 'multiple-choice', 'text'].includes(questionType)) {
    return `{${userAnswer}}`;
  }
  
  if (questionType === 'number') {
    return `{${Number(userAnswer)}}`;
  }
  
  return `{${userAnswer}}`;
};

/**
 * Save a user's answer to a question
 */
export const saveUserAnswer = async (answerData: {
  exam_id: number;
  question_id: number;
  user_answer: any;
  user_id: number;
  is_correct: boolean;
  question_type: string;
  elapsed_time?: number;
}): Promise<UserAnswer> => {
  const { exam_id, question_id, user_answer, user_id, is_correct, question_type, elapsed_time } = answerData;
  
  try {
    const formattedUserAnswer = formatAnswerForStorage(user_answer, question_type);
    
    const insertQuery = `
      INSERT INTO user_answers
        (exam_id, question_id, user_answer, user_id, is_correct, elapsed_time)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const insertResult = await pool.query(insertQuery, [
      exam_id,
      question_id,
      formattedUserAnswer,
      user_id,
      is_correct,
      elapsed_time || null
    ]);
    
    return insertResult.rows[0];
  } catch (error) {
    console.error('Error saving user answer:', error);
    console.error('Answer data:', JSON.stringify(answerData));
    throw error;
  }
};

/**
 * Count total questions for an exam
 */
export const countTotalQuestions = async (examId: number): Promise<number> => {
  const query = `
    SELECT cardinality(question_id_list) as total
    FROM exams
    WHERE id = $1
  `;
  const result = await pool.query(query, [examId]);
  return parseInt(result.rows[0].total);
};

/**
 * Count total question level for an exam
 */
export const countTotalQuestionLevel = async (examId: number): Promise<number> => {
  const query = `
    SELECT (level_1_question_qty+level_2_question_qty+level_3_question_qty+level_4_question_qty+level_5_question_qty) as total
    FROM exams
    WHERE id = $1
  `;
  const result = await pool.query(query, [examId]);
  return parseInt(result.rows[0].total);
};

/**
 * Save user's exam score
 */
export const saveUserExamScore = async (scoreData: {
  user_id: number;
  exam_id: number;
  score: number;
  total_questions: number;
  total_correct: number;
  exam_schedule_id?: number;
}): Promise<UserExamScore> => {
  const { user_id, exam_id, score, total_questions, total_correct, exam_schedule_id } = scoreData;
  
  const insertQuery = ` 
    INSERT INTO user_exam_scores
      (user_id, exam_id, score, total_questions, total_correct, exam_schedule_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const insertResult = await pool.query(insertQuery, [
    user_id,
    exam_id,
    score,
    total_questions,
    total_correct,
    exam_schedule_id || null
  ]);
  
  return insertResult.rows[0];
};

/**
 * Get question details by ID
 */
export const getQuestionById = async (questionId: number): Promise<Question | null> => {
  const query = `
    SELECT q.id, q.question_type, q.correct_answer, q.level, q.pembahasan
    FROM questions q
    WHERE q.id = $1
  `;
  const result = await pool.query(query, [questionId]);
  return result.rows[0] || null;
};

/**
 * Get user exam stat level
 */
export const getUserExamStatLevel = async (
  scheduleId: number, 
  userId: number
): Promise<UserExamStatResult> => {
  // Query untuk mendapatkan statistik
  const statsQuery = `
    WITH unnested_exam_ids AS (
      SELECT 
        es.id AS schedule_id, 
        unnest(es.exam_id_list) AS exam_id 
      FROM exam_schedule es
    ),
    latest_answers AS (
      SELECT DISTINCT ON (ua.user_id, ua.exam_id, ua.question_id)
        ua.user_id,
        ua.exam_id,
        ua.question_id,
        ua.answer_time,
        ua.is_correct,
        ua.elapsed_time,
        q.level
      FROM unnested_exam_ids ue
      LEFT JOIN exams e ON ue.exam_id = e.id
      LEFT JOIN user_answers ua ON ua.exam_id = e.id
      LEFT JOIN questions q ON q.id = ua.question_id
      WHERE ue.schedule_id = $1 
        AND ua.user_id = $2
        AND ua.user_id IS NOT NULL
        AND ua.question_id IS NOT NULL
      ORDER BY ua.user_id, ua.exam_id, ua.question_id, ua.answer_time DESC
    ),
    exam_totals AS (
      SELECT 
        ue.schedule_id,
        la.user_id,
        COUNT(la.question_id) AS total_questions_answered,
        COUNT(CASE WHEN la.is_correct THEN 1 END) AS total_correct_answers,
        AVG(la.elapsed_time) AS avg_elapsed_time
      FROM unnested_exam_ids ue
      JOIN latest_answers la ON ue.exam_id = la.exam_id
      GROUP BY ue.schedule_id, la.user_id
    ),
    level_stats AS (
      SELECT 
        ue.schedule_id,
        la.user_id,
        la.level,
        COUNT(la.question_id) AS questions_per_level,
        COUNT(CASE WHEN la.is_correct THEN 1 END) AS correct_per_level,
        AVG(la.elapsed_time) AS avg_time_per_level
      FROM unnested_exam_ids ue
      JOIN latest_answers la ON ue.exam_id = la.exam_id
      WHERE la.level IS NOT NULL
      GROUP BY ue.schedule_id, la.user_id, la.level
    )
    SELECT 
      et.schedule_id,
      et.user_id,
      et.total_questions_answered,
      et.total_correct_answers,
      et.avg_elapsed_time,
      ls.level,
      ls.questions_per_level,
      ls.correct_per_level,
      ls.avg_time_per_level
    FROM exam_totals et
    LEFT JOIN level_stats ls ON et.schedule_id = ls.schedule_id 
      AND et.user_id = ls.user_id
    ORDER BY et.schedule_id, et.user_id, ls.level;
  `;

  // Query untuk mendapatkan list question_id per exam_id
  const questionsQuery = `
    WITH unnested_exam_ids AS (
      SELECT 
        es.id AS schedule_id, 
        unnest(es.exam_id_list) AS exam_id 
      FROM exam_schedule es
    ),
    latest_answers AS (
      SELECT DISTINCT ON (ua.user_id, ua.exam_id, ua.question_id)
        ua.user_id,
        ua.exam_id,
        ua.question_id,
        ua.answer_time,
        ua.is_correct,
        ua.elapsed_time
      FROM unnested_exam_ids ue
      LEFT JOIN exams e ON ue.exam_id = e.id
      LEFT JOIN user_answers ua ON ua.exam_id = e.id
      WHERE ue.schedule_id = $1 
        AND ua.user_id = $2
        AND ua.user_id IS NOT NULL
        AND ua.question_id IS NOT NULL
      ORDER BY ua.user_id, ua.exam_id, ua.question_id, ua.answer_time DESC
    )
    SELECT 
      la.exam_id,
      array_agg(la.question_id ORDER BY la.question_id) AS question_ids,
      COUNT(la.question_id) AS total_questions
    FROM latest_answers la
    GROUP BY la.exam_id
    ORDER BY la.exam_id;
  `;

  try {
    // Eksekusi kedua query secara bersamaan
    const [statsResult, questionsResult] = await Promise.all([
      pool.query(statsQuery, [scheduleId, userId]),
      pool.query(questionsQuery, [scheduleId, userId])
    ]);

    return {
      stats: statsResult.rows,
      questions_per_exam: questionsResult.rows
    };
  } catch (error) {
    console.error('Error in getUserExamStatLevel:', error);
    throw error;
  }
};