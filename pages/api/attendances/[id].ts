// pages/api/attendances/[id].ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import * as AttendanceController from '../../../controllers/attendance.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    // Jalankan middleware authentication
    await runMiddleware(req, res, authenticateJWT);

    switch (req.method) {
        case 'GET':
            return AttendanceController.getAttendanceById(req, res);
        case 'PUT':
            return AttendanceController.updateAttendance(req, res);
        case 'DELETE':
            return AttendanceController.deleteAttendance(req, res);
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}