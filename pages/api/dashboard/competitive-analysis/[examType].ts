// pages/api/dashboard/competitive-analysis/[examType].ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../../../../lib/middleware/auth';
import { authenticate } from '../../../../lib/middleware/auth';
import { getCompetitiveAnalysisWithHistoryController } from '../../../../controllers/dashboard.controller';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return getCompetitiveAnalysisWithHistoryController(req, res);
}

export default authenticate(handler);
