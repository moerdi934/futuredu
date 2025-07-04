// models/userExam.model.ts
import pool from '../lib/db';

// Types
export interface UserExamRequest {
  userName: string;
  exam_string: string;
}

export interface UserExamResponse {
  exists: boolean;
}

export interface Exam {
  id: string;
  exam_string: string;
  [key: string]: any;
}

export interface UserExamScore {
  id: string;
  user_name: string;
  exam_id: string;
  [key: string]: any;
}

export interface UserExamError {
  error: string;
}

// Model functions
const checkUserExam = async (userName: string, examString: string): Promise<boolean | null> => {
  // eslint-disable-next-line no-useless-catch
  try {
    // Fetch exam based on exam_string
    const examResult = await pool.query('SELECT * FROM exams WHERE exam_string = $1', [examString]);
    
    if (examResult.rows.length === 0) {
      return null;  // If no exam found
    }

    const examId = examResult.rows[0].id;

    // Check if user has already taken the exam
    const userExam = await pool.query(
      'SELECT * FROM user_exam_scores WHERE user_name = $1 AND exam_id = $2',
      [userName, examId]
    );

    return userExam.rows.length > 0;  // Return true if the exam exists, otherwise false
  } catch (error) {
    throw error;
  }
};

export {
  checkUserExam,
};