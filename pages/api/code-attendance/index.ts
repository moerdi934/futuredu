// pages/api/code-attendance/index.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import * as CodeAttendanceController from '../../../controllers/codeAttendance.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Apply authentication middleware
  await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'GET':
      return CodeAttendanceController.getAllCodeAttendances(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}