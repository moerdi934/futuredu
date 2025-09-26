// pages/api/exam-schedules/pending-approval.ts - Get pending approval schedules
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import * as ExamScheduleController from '../../../controllers/examSchedule.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    const authReq = req as AuthenticatedRequest;

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Only admin can see pending approvals
    if (authReq.user?.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Akses ditolak. Hanya admin yang dapat melihat jadwal ujian yang memerlukan persetujuan.' 
      });
    }

    return ExamScheduleController.getExamSchedulesNeedingApproval(authReq, res);
  } catch (error) {
    console.error('API Pending Approval Exam Schedules Error:', error);
    return res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}