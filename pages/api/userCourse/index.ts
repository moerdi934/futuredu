// pages/api/userCourse/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, optionalAuthenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import * as userCourseController from '../../../controllers/userCourse.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // GET /api/userCourse - Get all user courses
        await userCourseController.getAllUserCourses(req, res);
        break;

      case 'POST':
        // POST /api/userCourse - Create new user course (requires auth)
        await runMiddleware(req as AuthenticatedRequest, res, authenticateJWT);
        await userCourseController.createUserCourse(req as AuthenticatedRequest, res);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}