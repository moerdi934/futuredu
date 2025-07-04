// pages/api/courses/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import * as courseController from '../../../controllers/course.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'PUT':
      await runMiddleware(req, res, authenticateJWT);
      return courseController.updateCourse(req, res);
    
    case 'DELETE':
      await runMiddleware(req, res, authenticateJWT);
      return courseController.deleteCourse(req, res);
    
    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}