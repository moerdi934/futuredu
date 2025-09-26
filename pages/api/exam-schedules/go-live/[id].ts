// pages/api/exam-schedules/go-live/[id].ts - Go Live endpoint
import { NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import * as ExamScheduleController from '../../../../controllers/examSchedule.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);

    if (req.method === 'POST') {
      // Only admin can make exam schedules go live
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Hanya admin yang dapat melakukan go-live jadwal ujian.'
        });
      }

      return ExamScheduleController.goLiveExamSchedule(req, res);
    } else {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Go Live Exam Schedule Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
