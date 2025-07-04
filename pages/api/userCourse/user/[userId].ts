// pages/api/userCourse/user/[userId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as userCourseController from '../../../../controllers/userCourse.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // GET /api/userCourse/user/:userId - Get user courses by user ID
        await userCourseController.getUserCoursesByUserId(req, res);
        break;

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}