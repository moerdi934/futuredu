// pages/api/coins/history.ts - Get coin transaction history
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../lib/middleware/auth';
import CoinController from '../../../controllers/Coin.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Call controller
    await CoinController.getCoinHistory(req, res);
  } catch (error) {
    console.error('Coin history API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}