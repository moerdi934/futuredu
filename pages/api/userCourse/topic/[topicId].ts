// pages/api/userCourse/topic/[topicId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as userCourseController from '../../../../controllers/userCourse.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // GET /api/userCourse/topic/:topicId - Get user courses by topic ID
        await userCourseController.getUserCoursesByTopicId(req, res);
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