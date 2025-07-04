// pages/api/attendance-types/index.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../lib/middleware/auth';
import * as AttendanceTypeController from '../../../controllers/attendanceType.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Jalankan middleware authentication
  await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'GET':
      return AttendanceTypeController.getAllAttendanceTypes(req, res);
    case 'POST':
      return AttendanceTypeController.createAttendanceType(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}