// pages/api/exam-schedules/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getValidExamSchedules, createExamSchedule } from '../../../controllers/examSchedule.controller';
import { authenticateJWT, runMiddleware, AuthenticatedRequest } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getValidExamSchedules(req, res);
  } else if (req.method === 'POST') {
    // Jalankan middleware autentikasi
    await runMiddleware(req as AuthenticatedRequest, res, authenticateJWT);
    
    // Setelah autentikasi berhasil, req.user akan tersedia
    return await createExamSchedule(req as AuthenticatedRequest, res);
  } else {    
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}