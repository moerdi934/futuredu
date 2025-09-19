// pages/api/courses/[id]/approve.ts - Course Approval Endpoint
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import * as CourseController from '../../../../controllers/course.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    const authReq = req as AuthenticatedRequest;

    if (req.method !== 'PUT') {
      res.setHeader('Allow', ['PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Only admin can approve courses
    if (authReq.user?.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Akses ditolak. Hanya admin yang dapat menyetujui kursus.' 
      });
    }

    return CourseController.approveCourse(authReq, res);
  } catch (error) {
    console.error('API Approve Course Error:', error);
    return res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}