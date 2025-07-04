// pages/api/questions/u/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import * as questionController from '../../../../controllers/questions.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Apply authentication middleware
  await runMiddleware(req, res, authenticateJWT);

  const { id } = req.query;

  // Validate ID parameter
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Valid ID parameter is required' });
  }

  // Add ID to the request query for controller access
  req.query.id = id;

  switch (req.method) {
    case 'GET':
      return questionController.getQuestionByUId(req, res);

    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}