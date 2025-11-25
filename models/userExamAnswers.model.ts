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
  question_elapsed_times?: string | object;
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
  score: number; // Compatible dengan PostgreSQL numeric
  total_questions: number;
  total_correct: number;
  exam_schedule_id?: number;
  weighted_score?: number; // Jika weighted_score juga diubah ke numeric
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
 * Get exam sessions by schedule ID and user ID - Updated to include question_elapsed_times
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
    SELECT id, exam_id, user_id, answers, question_elapsed_times
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
 * Save a user's answer to a question - Updated to handle elapsed_time
 */
export const saveUserAnswer = async (answerData: {
  exam_id: number;
  question_id: number;
  user_answer: any;
  user_id: number;
  is_correct: boolean;
  question_type: string;
  elapsed_time?: number | null;
}): Promise<UserAnswer> => {
  const { exam_id, question_id, user_answer, user_id, is_correct, question_type, elapsed_time } = answerData;
  
  try {
    const formattedUserAnswer = formatAnswerForStorage(user_answer, question_type);
    
    // Check if answer already exists for this user, exam, and question
    const existingQuery = `
      SELECT id FROM user_answers 
      WHERE user_id = $1 AND exam_id = $2 AND question_id = $3
    `;
    const existingResult = await pool.query(existingQuery, [user_id, exam_id, question_id]);
    
    if (existingResult.rows.length > 0) {
      // Update existing answer
      const updateQuery = `
        UPDATE user_answers
        SET user_answer = $1, is_correct = $2, elapsed_time = $3, answer_time = NOW()
        WHERE user_id = $4 AND exam_id = $5 AND question_id = $6
        RETURNING *
      `;
      
      const updateResult = await pool.query(updateQuery, [
        formattedUserAnswer,
        is_correct,
        elapsed_time,
        user_id,
        exam_id,
        question_id
      ]);
      
      return updateResult.rows[0];
    } else {
      // Insert new answer
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
        elapsed_time
      ]);
      
      return insertResult.rows[0];
    }
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
  return parseInt(result.rows[0].total) || 0;
};

/**
 * Count total question level for an exam
 */
export const countTotalQuestionLevel = async (examId: number): Promise<number> => {
  const query = `
    SELECT COALESCE((level_1_question_qty+level_2_question_qty+level_3_question_qty+level_4_question_qty+level_5_question_qty), 0) as total
    FROM exams
    WHERE id = $1
  `;
  const result = await pool.query(query, [examId]);
  return parseInt(result.rows[0].total) || 0;
};

/**
 * Save user's exam score - Updated untuk handle numeric precision
 */
export const saveUserExamScore = async (scoreData: {
  user_id: number;
  exam_id: number;
  score: number; // Sekarang bisa handle nilai desimal seperti 85.5, 92.75, dll
  total_questions: number;
  total_correct: number;
  exam_schedule_id?: number;
  weighted_score?: number; // Tambahan jika weighted_score juga numeric
}): Promise<UserExamScore> => {
  const { user_id, exam_id, score, total_questions, total_correct, exam_schedule_id, weighted_score } = scoreData;
  
  try {
    // Check if score already exists for this user and exam
    const existingQuery = `
      SELECT id FROM user_exam_scores 
      WHERE user_id = $1 AND exam_id = $2 AND (exam_schedule_id = $3 OR (exam_schedule_id IS NULL AND $3 IS NULL))
    `;
    const existingResult = await pool.query(existingQuery, [user_id, exam_id, exam_schedule_id || null]);
    
    if (existingResult.rows.length > 0) {
      // Update existing score - numeric akan otomatis handle precision
      const updateQuery = `
        UPDATE user_exam_scores
        SET score = $1::numeric, 
            total_questions = $2, 
            total_correct = $3,
            weighted_score = $4::numeric,
            postdate = NOW()
        WHERE user_id = $5 AND exam_id = $6 
          AND (exam_schedule_id = $7 OR (exam_schedule_id IS NULL AND $7 IS NULL))
        RETURNING *
      `;
      
      const updateResult = await pool.query(updateQuery, [
        score,
        total_questions,
        total_correct,
        weighted_score || null,
        user_id,
        exam_id,
        exam_schedule_id || null
      ]);
      
      return updateResult.rows[0];
    } else {
      // Insert new score
      const insertQuery = ` 
        INSERT INTO user_exam_scores
          (user_id, exam_id, score, total_questions, total_correct, exam_schedule_id, weighted_score)
        VALUES ($1, $2, $3::numeric, $4, $5, $6, $7::numeric)
        RETURNING *
      `;
      
      const insertResult = await pool.query(insertQuery, [
        user_id,
        exam_id,
        score,
        total_questions,
        total_correct,
        exam_schedule_id || null,
        weighted_score || null
      ]);
      
      return insertResult.rows[0];
    }
  } catch (error) {
    console.error('Error saving user exam score:', error);
    throw error;
  }
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
 * Get user exam stat level - Enhanced with elapsed time analysis
 */
export const getUserExamStatLevel = async (
  scheduleId: number, 
  userId: number
): Promise<UserExamStatResult> => {
  // Query untuk mendapatkan statistik dengan enhanced elapsed time handling
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
        COALESCE(ua.elapsed_time, 0) as elapsed_time,
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
        ROUND(AVG(CASE WHEN la.elapsed_time > 0 THEN la.elapsed_time END), 2) AS avg_elapsed_time
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
        ROUND(AVG(CASE WHEN la.elapsed_time > 0 THEN la.elapsed_time END), 2) AS avg_time_per_level
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
      COALESCE(et.avg_elapsed_time, 0) as avg_elapsed_time,
      ls.level,
      COALESCE(ls.questions_per_level, 0) as questions_per_level,
      COALESCE(ls.correct_per_level, 0) as correct_per_level,
      COALESCE(ls.avg_time_per_level, 0) as avg_time_per_level
    FROM exam_totals et
    LEFT JOIN level_stats ls ON et.schedule_id = ls.schedule_id 
      AND et.user_id = ls.user_id
    ORDER BY et.schedule_id, et.user_id, ls.level;
  `;

  // Query untuk mendapatkan list question_id per exam_id dengan elapsed time info
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
        COALESCE(ua.elapsed_time, 0) as elapsed_time
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
      COUNT(la.question_id) AS total_questions,
      ROUND(AVG(CASE WHEN la.elapsed_time > 0 THEN la.elapsed_time END), 2) as avg_elapsed_time_per_exam
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

/**
 * Get user answers with elapsed time for a specific exam
 */
export const getUserAnswersWithElapsedTime = async (
  userId: number,
  examId: number
): Promise<UserAnswer[]> => {
  const query = `
    SELECT 
      id,
      exam_id,
      question_id,
      user_answer,
      user_id,
      is_correct,
      answer_time,
      elapsed_time
    FROM user_answers
    WHERE user_id = $1 AND exam_id = $2
    ORDER BY question_id, answer_time DESC
  `;
  
  const result = await pool.query(query, [userId, examId]);
  return result.rows;
};

/**
 * Get average elapsed time per question type for analytics
 */
export const getElapsedTimeAnalytics = async (
  examId: number,
  userId?: number
): Promise<any[]> => {
  const baseQuery = `
    SELECT 
      q.question_type,
      q.level,
      COUNT(ua.id) as total_answers,
      ROUND(AVG(CASE WHEN ua.elapsed_time > 0 THEN ua.elapsed_time END), 2) as avg_elapsed_time,
      ROUND(MIN(CASE WHEN ua.elapsed_time > 0 THEN ua.elapsed_time END), 2) as min_elapsed_time,
      ROUND(MAX(ua.elapsed_time), 2) as max_elapsed_time,
      COUNT(CASE WHEN ua.is_correct THEN 1 END) as correct_answers,
      ROUND(COUNT(CASE WHEN ua.is_correct THEN 1 END) * 100.0 / COUNT(ua.id), 2) as accuracy_percentage
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.id
    WHERE ua.exam_id = $1
  `;
  
  let query = baseQuery;
  let params = [examId];
  
  if (userId) {
    query += ' AND ua.user_id = $2';
    params.push(userId);
  }
  
  query += `
    GROUP BY q.question_type, q.level
    ORDER BY q.level, q.question_type
  `;
  
  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Get user exam scores with proper numeric handling
 */
export const getUserExamScores = async (
  userId: number,
  examScheduleId?: number
): Promise<UserExamScore[]> => {
  const query = `
    SELECT 
      id,
      user_id,
      exam_id,
      score::numeric as score,
      weighted_score::numeric as weighted_score,
      total_questions,
      total_correct,
      exam_schedule_id,
      completion_time,
      postdate,
      is_final
    FROM user_exam_scores
    WHERE user_id = $1
      ${examScheduleId ? 'AND exam_schedule_id = $2' : ''}
    ORDER BY postdate DESC
  `;
  
  const params = examScheduleId ? [userId, examScheduleId] : [userId];
  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Get exam score statistics - with numeric precision
 */
export const getExamScoreStatistics = async (
  examId: number,
  examScheduleId?: number
): Promise<{
  total_participants: number;
  avg_score: number;
  max_score: number;
  min_score: number;
  median_score: number;
}> => {
  const query = `
    SELECT 
      COUNT(DISTINCT user_id) as total_participants,
      ROUND(AVG(score::numeric), 2) as avg_score,
      MAX(score::numeric) as max_score,
      MIN(score::numeric) as min_score,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score::numeric) as median_score
    FROM user_exam_scores
    WHERE exam_id = $1
      AND is_final = true
      ${examScheduleId ? 'AND exam_schedule_id = $2' : ''}
  `;
  
  const params = examScheduleId ? [examId, examScheduleId] : [examId];
  const result = await pool.query(query, params);
  return result.rows[0];
};

/**
 * Bulk update scores with weighted calculation
 */
export const bulkUpdateWeightedScores = async (
  examScheduleId: number,
  weightMultiplier: number
): Promise<number> => {
  const query = `
    UPDATE user_exam_scores
    SET weighted_score = (score::numeric * $2::numeric)
    WHERE exam_schedule_id = $1
      AND is_final = true
    RETURNING id
  `;
  
  const result = await pool.query(query, [examScheduleId, weightMultiplier]);
  return result.rowCount || 0;
};