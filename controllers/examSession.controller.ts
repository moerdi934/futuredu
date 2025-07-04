// controllers/examSession.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as examSessionModel from '../models/examSession.model';
import * as examModel from '../models/exam.model';
import { AuthenticatedRequest } from '../lib/middleware/auth';

// Types for request bodies
export interface SaveSessionRequest {
  exam_schedule_id: number;
  exam_id: string;
  answers: any;
}

export interface CreateExamSessionsRequest {
  examScheduleId: number;
  examIdList: number[];
}

export interface SubmitSessionRequest {
  exam_schedule_id: number;
  exam_id: string;
  answers?: any;
}

export interface VerifikasiRequest {
  exam_id: string;
  schedule_id: number;
  question_left: number;
  session_id?: number;
}

export interface GetSessionQuery {
  exam_schedule_id: string;
  exam_id: string;
}

export interface GetExamSessionsQuery {
  exam_id: string;
}

export interface GetExamScheduleSessionsQuery {
  exam_schedule_id: string;
}

// Controller methods for exam sessions
export const saveSession = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const user_id = req.user!.id;
  try {
    const { exam_schedule_id, exam_id, answers }: SaveSessionRequest = req.body;

    if (!exam_schedule_id || !exam_id || !user_id || !answers) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Check if an active session exists
    const existingSession = await examSessionModel.getActiveSession(
      exam_schedule_id, 
      exam_id, 
      user_id
    );

    let result;
    if (existingSession) {
      // Update existing session
      result = await examSessionModel.update(existingSession.id, answers);
      return res.status(200).json({
        status: 'success',
        message: 'Session updated successfully',
        data: result
      });
    } else {
      // Create new session
      result = await examSessionModel.create(
        exam_schedule_id,
        exam_id,
        user_id,
        answers
      );
      return res.status(201).json({
        status: 'success',
        message: 'Session created successfully',
        data: result
      });
    }
  } catch (error) {
    console.error('Error saving exam session:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to save session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createExamSessions = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { examScheduleId, examIdList }: CreateExamSessionsRequest = req.body;
  console.log("exam_id_list:", examIdList);
  const userId = req.user!.id;
  
  try {
    // Check if there are already active sessions for this schedule
    const activeSessions = await examSessionModel.getSessionsByExamSchedule(examScheduleId, userId);
    
    if (activeSessions && activeSessions.length > 0) {
      return res.status(200).json({ 
        message: 'Active sessions already exist',
        sessions: activeSessions
      });
    }
    
    // Create new sessions for all exams
    const sessions = await examSessionModel.createExamSessions(userId, examScheduleId, examIdList);
    
    res.status(201).json({
      message: 'Exam sessions created successfully',
      sessions: sessions
    });
  } catch (error) {
    console.error('Error creating exam sessions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get an active session
export const getSession = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { exam_schedule_id, exam_id }: GetSessionQuery = req.query as any;
    const userId = req.user!.id;

    if (!exam_schedule_id || !exam_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters'
      });
    }

    const session = await examSessionModel.getActiveSession(
      parseInt(exam_schedule_id), 
      exam_id, 
      userId
    );

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'No active session found'
      });
    }

    // Check if is_auto_move is true and the current time is before the start time
    console.log('session automove', session.is_auto_move,
      'Now', new Date(), 'start', new Date(session.start_time!), 'kurang', new Date() < new Date(session.start_time!)
    );
    
    if (session.is_auto_move && session.start_time && new Date() < new Date(session.start_time)) {
      // Update start_time to now and end_time to now + minute_exam
      const now = new Date();
      const endTime = new Date(now);
      endTime.setMinutes(endTime.getMinutes() + (session.minute_exam || 0));

      // Update the session times
      await examSessionModel.updateSessionTimes(session.id, now, endTime);
      
      // Retrieve the updated session
      const updatedSession = await examSessionModel.getActiveSession(
        parseInt(exam_schedule_id), 
        exam_id, 
        userId
      );
      
      return res.status(200).json({
        status: 'success',
        data: updatedSession
      });
    }

    return res.status(200).json({
      status: 'success',
      data: session
    });
  } catch (error) {
    console.error('Error in getSession:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get active session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Submit an exam session (mark as completed)
export const submitSession = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const user_id = req.user!.id;
    const { exam_schedule_id, exam_id, answers }: SubmitSessionRequest = req.body;

    if (!exam_schedule_id || !exam_id || !user_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Check if an active session exists
    const existingSession = await examSessionModel.getActiveSession(
      exam_schedule_id,
      exam_id,
      user_id
    );

    let result;
    if (existingSession) {
      // Update and submit existing session
      result = await examSessionModel.submit(
        existingSession.id,
        answers || existingSession.answers
      );
    } else {
      // Create and submit new session
      if (!answers) {
        return res.status(400).json({
          status: 'error',
          message: 'Answers are required for new session submission'
        });
      }
      
      const newSession = await examSessionModel.create(
        exam_schedule_id,
        exam_id,
        user_id,
        answers
      );
      
      result = await examSessionModel.submit(newSession.id, answers);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Session submitted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error submitting exam session:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to submit session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all sessions for a user
export const getUserSessions = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const user_id = req.user!.id;

    if (!user_id) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }

    const sessions = await examSessionModel.getSessionsByUser(user_id);

    return res.status(200).json({
      status: 'success',
      data: sessions
    });
  } catch (error) {
    console.error('Error retrieving user sessions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve sessions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all sessions for a specific exam
export const getExamSessions = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { exam_id }: GetExamSessionsQuery = req.query as any;

    if (!exam_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Exam ID is required'
      });
    }

    const sessions = await examSessionModel.getSessionsByExam(exam_id);

    return res.status(200).json({
      status: 'success',
      data: sessions
    });
  } catch (error) {
    console.error('Error retrieving exam sessions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve sessions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getExamScheduleSessions = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { exam_schedule_id }: GetExamScheduleSessionsQuery = req.query as any;
    const user_id = req.user!.id;
    
    if (!exam_schedule_id) {
      return res.status(400).json({
        status: 'error',
        message: 'exam_schedule_id is required'
      });
    }

    const sessions = await examSessionModel.getSessionsByExamSchedule(
      parseInt(exam_schedule_id), 
      user_id
    );

    return res.status(200).json({
      status: 'success',
      data: sessions
    });
  } catch (error) {
    console.error('Error retrieving exam sessions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve sessions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const Verifikasi = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const user_id = req.user!.id;
    const { exam_id, schedule_id, question_left, session_id }: VerifikasiRequest = req.body;

    const is_finish = question_left > 0 ? false : true;

    const sessions = await examSessionModel.getSessionsByExamSchedule(schedule_id, user_id);
    const session = sessions[0]; // Ambil session terbaru

    const exam_string = await examModel.getExamString(exam_id);

    if (session_id) {
      const ExistingSessionValid = await examSessionModel.getActiveSession(schedule_id, exam_id, user_id);
      if (ExistingSessionValid && ExistingSessionValid.id == session_id) {
        return res.status(200).json({
          status: 'Sesi valid',
          data: {
            id: ExistingSessionValid.id
          }
        });
      } else {
        return res.status(403).json({
          status: 'Sesi Tidak valid',
          data: {
            id: 0
          }
        });
      }     
    }

    if (session) {
      if (session.is_submitted && !is_finish) {
        const UpdateIsSubmitted = await examSessionModel.updateSubmit(session.id, is_finish);
        return res.status(200).json({
          status: 'success',
          data: {
            id: UpdateIsSubmitted.id,
            is_submitted: UpdateIsSubmitted.is_submitted
          }
        });
      }
      return res.status(200).json({
        status: 'success',
        data: {
          id: session.id,
          is_submitted: session.is_submitted,
          exam_string: exam_string
        }
      });
    } else {
      const CreateSession = await examSessionModel.create(schedule_id, exam_id, user_id, []);
      return res.status(201).json({
        status: 'success',
        data: {
          id: CreateSession.id,
          is_submitted: CreateSession.is_submitted,
          exam_string: exam_string
        }
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};