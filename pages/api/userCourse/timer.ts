// pages/api/userCourse/timer.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import * as userCourseController from '../../../controllers/userCourse.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        // POST /api/userCourse/timer - Create user course timer (requires auth)
        await runMiddleware(req as AuthenticatedRequest, res, authenticateJWT);
        await userCourseController.createUserCourseTimer(req as AuthenticatedRequest, res);
        break;

      default:
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}