// pages/api/attendances/mark.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import * as AttendanceController from '../../../controllers/attendance.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    // Jalankan middleware authentication
    await runMiddleware(req, res, authenticateJWT);

    switch (req.method) {
        case 'POST':
            return AttendanceController.markAttendance(req, res);
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}