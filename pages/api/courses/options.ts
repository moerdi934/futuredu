// pages/api/courses/options.ts - Course Options for Filters
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import * as Course from '../../../models/course.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    const authReq = req as AuthenticatedRequest;

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const search = (authReq.query.search as string) || '';
    const userRole = authReq.user?.role || 'student';
    const userId = authReq.user?.id?.toString();

    const courses = await Course.searchAll(search, userRole, userId);
    
    // Format for select options
    const courseOptions = courses
      .filter(course => course.approval_status === 'approved' || userRole === 'admin')
      .map(course => ({
        value: course.id,
        label: course.title
      }));

    res.json(courseOptions);
  } catch (error: any) {
    console.error('API Course Options Error:', error);
    res.status(500).json({ error: error.message });
  }
}