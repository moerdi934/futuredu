// pages/api/questions/byExamId.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import * as questionController from '../../../controllers/questions.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Apply authentication middleware
  await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'GET':
      return questionController.getQuestionsByExamId(req, res);

    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}