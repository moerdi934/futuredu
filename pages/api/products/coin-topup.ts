// pages/api/products/coin-topup.ts - Get coin topup products
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
    
    await ProductController.getCoinTopupProducts(req, res);
  } catch (error) {
    console.error('Coin topup products API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}