// pages/api/courses/progress/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT } from '../../../../lib/middleware/auth';
import * as userCourseProgressController from '../../../../controllers/course.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    await runMiddleware(req, res, authenticateJWT);
    return userCourseProgressController.getUserCourseProgress(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}