// pages/api/coins/purchase.ts - Purchase with coins
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../lib/middleware/auth';
import CoinController from '../../../controllers/Coin.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Call controller
    await CoinController.purchaseWithCoins(req, res);
  } catch (error) {
    console.error('Coin purchase API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}