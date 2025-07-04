// pages/api/attendance-types/[id].ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../lib/middleware/auth';
import * as AttendanceTypeController from '../../../controllers/attendanceType.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Jalankan middleware authentication
  await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'GET':
      return AttendanceTypeController.getAttendanceTypeById(req, res);
    case 'PUT':
      return AttendanceTypeController.updateAttendanceType(req, res);
    case 'DELETE':
      return AttendanceTypeController.deleteAttendanceType(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}