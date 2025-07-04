// pages/api/questions/passage/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import * as questionController from '../../../../controllers/questions.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      // Apply authentication middleware for POST
      await runMiddleware(req, res, authenticateJWT);
      return questionController.createPassage(req, res);

    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}