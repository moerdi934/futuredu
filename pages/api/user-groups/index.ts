// pages/api/user-groups/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getAllGroups } from '../../../controllers/UserGroup.controller';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware
  await runMiddleware(req as AuthenticatedRequest, res, authenticateJWT);
  
  if (req.method === 'GET') {
    return getAllGroups(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}