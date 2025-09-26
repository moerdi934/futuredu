// pages/api/exam-schedules/restore/[id].ts - Restore endpoint
import { NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import * as ExamScheduleController from '../../../../controllers/examSchedule.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    await runMiddleware(req, res, authenticateJWT);

    if (req.method === 'PUT') {
      return ExamScheduleController.restoreExamSchedule(req, res);
    } else {
      res.setHeader('Allow', ['PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Restore Exam Schedule Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}