// pages/api/userCourse/topic/[topicId]/material/[materialId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as userCourseController from '../../../../../../controllers/userCourse.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // GET /api/userCourse/topic/:topicId/material/:materialId - Get user courses by topic ID and material ID
        await userCourseController.getUserCoursesByTopicAndMaterial(req, res);
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
