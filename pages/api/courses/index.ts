// pages/api/courses/index.ts - Updated with Student Entitlement System
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import * as CourseController from '../../../controllers/course.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    const authReq = req as AuthenticatedRequest;

    if (req.method === 'GET') {
      // Allow GET for all authenticated users (admin, teacher, student)
      return CourseController.getAllCoursesWithApproval(authReq, res);
    } else if (req.method === 'POST') {
      // Only teachers and admins can create courses
      if (authReq.user?.role !== 'teacher' && authReq.user?.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Akses ditolak. Hanya guru dan admin yang dapat membuat kursus.' 
        });
      }
      return CourseController.createCourseWithApproval(authReq, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Courses Error:', error);
    return res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}