// pages/api/courses/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import * as courseController from '../../../controllers/course.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return courseController.getAllCourses(req, res);
    
    case 'POST':
      await runMiddleware(req, res, authenticateJWT);
      return courseController.createCourse(req, res);
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}