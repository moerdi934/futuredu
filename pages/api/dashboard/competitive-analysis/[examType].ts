// pages/api/dashboard/competitive-analysis/[examType].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../../lib/middleware/auth';
import { getCompetitiveAnalysisWithHistoryController } from '../../../../controllers/dashboard.controller';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, authenticateJWT);
    return getCompetitiveAnalysisWithHistoryController(req, res);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;
