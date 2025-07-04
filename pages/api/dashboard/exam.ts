// pages/api/dashboard/exam.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../lib/middleware/auth';
import { getExamDashboard } from '../../../controllers/dashboard.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Call controller
    await getExamDashboard(req, res);
  } catch (error) {
    console.error('Error in dashboard exam API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}