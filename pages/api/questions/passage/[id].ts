// pages/api/questions/passage/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import * as questionController from '../../../../controllers/questions.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Validate ID parameter
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Valid ID parameter is required' });
  }

  // Add ID to the request query for controller access
  req.query.id = id;

  switch (req.method) {
    case 'GET':
      // Apply authentication middleware for GET
      await runMiddleware(req, res, authenticateJWT);
      return questionController.getPassageById(req, res);

    case 'PUT':
      // Apply authentication middleware for PUT
      await runMiddleware(req, res, authenticateJWT);
      return questionController.updatePassage(req, res);

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}