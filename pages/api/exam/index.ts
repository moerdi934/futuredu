// pages/api/exam/index.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT, optionalAuthenticateJWT } from '../../../lib/middleware/auth';
import * as examController from '../../../controllers/exam.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Check if it's a search request or get by IDs
      if (req.query.query !== undefined || req.query.userId !== undefined) {
        // Search exams
        await examController.searchExams(req, res);
      } else {
        // Get exams by IDs
        await examController.getExamsByIds(req, res);
      }
      break;

    case 'POST':
      // Create exam - requires authentication
      await runMiddleware(req, res, authenticateJWT);
      await examController.createExam(req, res);
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
