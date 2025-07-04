// models/examSession.model.ts
import pool from '../lib/db';

// Types
export interface ExamSession {
  id: number;
  exam_schedule_id: number;
  exam_id: string;
  user_id: string;
  start_time?: Date;
  end_time?: Date;
  answers: any;
  is_submitted: boolean;
  last_save: Date;
  is_auto_move?: boolean;
  minute_exam?: number;
  created_at?: Date;
  updated_at?: Date;
  name?: string; // From join with exams table
}

export interface CreateExamSessionData {
  exam_schedule_id: number;
  exam_id: string;
  user_id: string;
  answers: any;
}

export interface UpdateExamSessionData {
  answers: any;
}

export interface CreateExamSessionsData {
  userId: string;
  examScheduleId: number;
  examIds: number[];
}

// Create a new exam session
export const create = async (examScheduleId: number, examId: string, userId: string, answers: any): Promise<ExamSession> => {
  const query = `
    INSERT INTO "tExamSession" (exam_schedule_id, exam_id, user_id, answers, last_save)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *
  `;
  
  try {
    const result = await pool.query(query, [examScheduleId, examId, userId, answers]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating exam session:', error);
    throw error;
  }
};

export const createExamSessions = async (userId: string, examScheduleId: number, examIds: number[]): Promise<ExamSession[]> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('examscheduleid', examScheduleId);
    
    // Get schedule details
    const scheduleResult = await client.query(
      'SELECT start_time, end_time, "is_auto_move" FROM exam_schedule WHERE id = $1',
      [examScheduleId]
    );
    
    if (scheduleResult.rows.length === 0) {
      throw new Error('Exam schedule not found');
    }
    
    const schedule = scheduleResult.rows[0];
    
    // Determine the start time for sessions
    let sessionStartTime: Date;
    if (new Date(schedule.start_time).getFullYear() < 2000) {
      sessionStartTime = new Date(); // Current time
    } else {
      sessionStartTime = new Date(schedule.start_time);
    }
    
    // Get exam details for all exams in the schedule
    const examsResult = await client.query(
      'SELECT id, duration FROM exams WHERE id = ANY($1::int[])',
      [examIds]
    );

    console.log('isautomove', schedule.is_auto_move);
    const examMap = examsResult.rows.reduce((map: any, exam: any) => {
      map[exam.id] = exam;
      return map;
    }, {});

    const sessions: ExamSession[] = [];
    
    // Create sessions for each exam
    for (let i = 0; i < examIds.length; i++) {
      const examId = examIds[i];
      const exam = examMap[examId];
      const duration = exam.duration;
      
      // Calculate end time for this exam
      const sessionEndTime = new Date(sessionStartTime);
      sessionEndTime.setMinutes(sessionEndTime.getMinutes() + duration);
      
      const minuteExam = Math.floor((sessionEndTime.getTime() - sessionStartTime.getTime()) / (1000 * 60));
      
      // Insert session
      const sessionResult = await client.query(
        `INSERT INTO "tExamSession" 
         (exam_schedule_id, exam_id, user_id, start_time, end_time, answers, is_submitted, last_save, is_auto_move, minute_exam)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          examScheduleId,
          examId.toString(),
          userId,
          sessionStartTime,
          sessionEndTime,
          JSON.stringify({}), // Empty answers object
          false, // Not submitted
          new Date(), // Current time for last_save
          schedule.is_auto_move,
          minuteExam
        ]
      );
      
      sessions.push(sessionResult.rows[0]);
      
      // Next exam starts when this one ends
      sessionStartTime = new Date(sessionEndTime);
    }
    
    await client.query('COMMIT');
    return sessions;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating exam sessions:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Get an active (not submitted) exam session
export const getActiveSession = async (examScheduleId: number, examId: string, userId: string): Promise<ExamSession | null> => {
  const query = `
    SELECT x.*, e.name FROM "tExamSession" x
    LEFT JOIN exams e on e.id::varchar = x.exam_id
    WHERE x.exam_schedule_id = $1 AND x.exam_id = $2 AND x.user_id = $3 AND x.is_submitted = FALSE
    ORDER BY x.last_save DESC
    LIMIT 1
  `;
  
  try {
    const result = await pool.query(query, [examScheduleId, examId, userId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting active exam session:', error);
    throw error;
  }
};

// Update an existing exam session
export const updateSessionTimes = async (sessionId: number, startTime: Date, endTime: Date): Promise<ExamSession> => {
  const query = `
    UPDATE "tExamSession"
    SET start_time = $1, end_time = $2, last_save = NOW(), updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;
  
  try {
    const result = await pool.query(query, [startTime, endTime, sessionId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating session times:', error);
    throw error;
  }
};

export const update = async (sessionId: number, answers: any): Promise<ExamSession> => {
  const query = `
    UPDATE "tExamSession"
    SET answers = $1, last_save = NOW(), updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  
  try {
    const result = await pool.query(query, [answers, sessionId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating exam session:', error);
    throw error;
  }
};

// Submit an exam session (mark as completed)
export const submit = async (sessionId: number, answers: any): Promise<ExamSession> => {
  const query = `
    UPDATE "tExamSession"
    SET answers = $1, is_submitted = TRUE, last_save = NOW(), updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  
  try {
    const result = await pool.query(query, [answers, sessionId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error submitting exam session:', error);
    throw error;
  }
};

// Get all sessions for a user
export const getSessionsByUser = async (userId: string): Promise<ExamSession[]> => {
  const query = `
    SELECT * FROM "tExamSession"
    WHERE user_id = $1
    ORDER BY last_save DESC
  `;
  
  try {
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error getting user exam sessions:', error);
    throw error;
  }
};

// Get all sessions for a specific exam
export const getSessionsByExam = async (examId: string): Promise<ExamSession[]> => {
  const query = `
    SELECT * FROM "tExamSession"
    WHERE exam_id = $1
    ORDER BY last_save DESC
  `;
  
  try {
    const result = await pool.query(query, [examId]);
    return result.rows;
  } catch (error) {
    console.error('Error getting exam sessions:', error);
    throw error;
  }
};

// Get all sessions for a specific exam schedule
export const getSessionsByExamSchedule = async (exam_schedule_id: number, user_id: string): Promise<ExamSession[]> => {
  const query = `
    SELECT c.*, e.name FROM "tExamSession" c
    left join exams e on e.id::varchar = c.exam_id
    WHERE c.exam_schedule_id = $1 AND user_id = $2 and is_submitted = False
    ORDER BY last_save DESC
  `;
  
  try {
    const result = await pool.query(query, [exam_schedule_id, user_id]);
    return result.rows;
  } catch (error) {
    console.error('Error getting exam sessions:', error);
    throw error;
  }
};

export const updateSubmit = async (sessionId: number, is_finish: boolean): Promise<ExamSession> => {
  const query = `
    UPDATE "tExamSession"
    SET is_submitted = $1, last_save = NOW(), updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  
  try {
    const result = await pool.query(query, [is_finish, sessionId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating exam session:', error);
    throw error;
  }
};