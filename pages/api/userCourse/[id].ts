// pages/api/userCourse/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import * as userCourseController from '../../../controllers/userCourse.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // GET /api/userCourse/:id - Get user course by ID
        await userCourseController.getUserCourseById(req, res);
        break;

      case 'PUT':
        // PUT /api/userCourse/:id - Update user course
        await userCourseController.updateUserCourse(req, res);
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}