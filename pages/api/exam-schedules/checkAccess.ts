// pages/api/exam-schedules/checkAccess.ts
import { NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import { checkExamAccess } from '../../../controllers/examSchedule.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Run authentication middleware
    try {
      await runMiddleware(req, res, authenticateJWT);
      return await checkExamAccess(req, res);
    } catch (error) {
      return res.status(500).json({ message: 'Authentication failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}