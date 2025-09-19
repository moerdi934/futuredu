// pages/api/courses/[id]/index.ts - Updated with Approval System
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import * as CourseController from '../../../../controllers/course.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    const authReq = req as AuthenticatedRequest;

    if (req.method === 'GET') {
      return CourseController.getCourseByIdWithApproval(authReq, res);
    } else if (req.method === 'PUT') {
      return CourseController.updateCourseWithApproval(authReq, res);
    } else if (req.method === 'DELETE') {
      return CourseController.deleteCourseWithApproval(authReq, res);
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Course by ID Error:', error);
    return res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}