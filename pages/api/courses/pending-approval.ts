// pages/api/courses/pending-approval.ts - Pending Approval Endpoint
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import * as CourseController from '../../../controllers/course.controller';

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
        message: 'Akses ditolak. Hanya admin yang dapat melihat kursus yang memerlukan persetujuan.' 
      });
    }

    return CourseController.getCoursesNeedingApproval(authReq, res);
  } catch (error) {
    console.error('API Pending Approval Courses Error:', error);
    return res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}