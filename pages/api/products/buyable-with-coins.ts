// pages/api/products/buyable-with-coins.ts - Get products buyable with coins
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, optionalAuthenticateJWT, runMiddleware } from '../../../lib/middleware/auth';
import ProductController from '../../../controllers/products.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Optional authentication for public product listing
    await runMiddleware(req, res, optionalAuthenticateJWT);
    
    await ProductController.getProductsBuyableWithCoins(req, res);
  } catch (error) {
    console.error('Products buyable with coins API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}