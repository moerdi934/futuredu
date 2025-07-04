// pages/api/ranking/user-exam-rankings.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import { getUserExamRankings } from '../../../controllers/ranking.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Call controller function
    await getUserExamRankings(req, res);
  } catch (error: any) {
    console.error('Error in user-exam-rankings route:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
}