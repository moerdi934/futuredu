// pages/api/exam-schedules/batch.ts
import { NextApiResponse } from 'next';
import { getExamSchedulesByIds } from '../../../controllers/examSchedule.controller';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Call controller
    return await getExamSchedulesByIds(req, res);
  } catch (error) {
    console.error('Batch API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
