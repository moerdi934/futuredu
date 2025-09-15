// pages/api/classes/pending-approval.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import * as ClassController from '../../../controllers/classes.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware
  await runMiddleware(req, res, authenticateJWT);
  const authReq = req as AuthenticatedRequest;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Only admin and teacher can see pending approvals
  if (authReq.user.role !== 'admin' && authReq.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Akses ditolak' });
  }

  return ClassController.getClassesNeedingApproval(authReq, res);
}