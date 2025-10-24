// pages/api/coins/products.ts - Get products that can be bought with coins
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, optionalAuthenticateJWT, runMiddleware } from '../../../lib/middleware/auth';
import CoinController from '../../../controllers/Coin.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Optional authentication for public product listing
    await runMiddleware(req, res, optionalAuthenticateJWT);
    
    // Call controller
    await CoinController.getCoinsProducts(req, res);
  } catch (error) {
    console.error('Coin products API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}