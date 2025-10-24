// pages/api/admin/coins/cleanup.ts - Clean up expired coins (admin only)
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../../lib/middleware/auth';
import CoinController from '../../../../controllers/Coin.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }
    
    // Call controller
    await CoinController.cleanupExpiredCoins(req, res);
  } catch (error) {
    console.error('Coin cleanup API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}