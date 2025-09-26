// pages/api/exam-schedules/approve/[id].ts - Approval endpoint
import { NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import * as ExamScheduleController from '../../../../controllers/examSchedule.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);

    if (req.method === 'PUT') {
      // Only admin can approve exam schedules
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Hanya admin yang dapat menyetujui jadwal ujian.'
        });
      }

      return ExamScheduleController.approveExamSchedule(req, res);
    } else {
      res.setHeader('Allow', ['PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Approve Exam Schedule Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
