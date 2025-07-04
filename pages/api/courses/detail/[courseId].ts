// pages/api/courses/detail/[courseId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT } from '../../../../lib/middleware/auth';
import * as courseController from '../../../../controllers/course.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return courseController.getCourseDetailReadable(req, res);
    
    case 'PUT':
      await runMiddleware(req, res, authenticateJWT);
      return courseController.updateCourseDetail(req, res);
    
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}