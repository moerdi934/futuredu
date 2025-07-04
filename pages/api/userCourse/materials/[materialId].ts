// pages/api/userCourse/materials/[materialId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, optionalAuthenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import * as userCourseController from '../../../../controllers/userCourse.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // GET /api/userCourse/materials/:materialId - Get material (optional auth)
        await runMiddleware(req as AuthenticatedRequest, res, optionalAuthenticateJWT);
        await userCourseController.getMaterial(req as AuthenticatedRequest, res);
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