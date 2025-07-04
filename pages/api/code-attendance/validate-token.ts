// pages/api/code-attendance/validate-token.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import * as CodeAttendanceController from '../../../controllers/codeAttendance.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Apply authentication middleware
  await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'POST':
      return CodeAttendanceController.validateToken(req, res);
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}