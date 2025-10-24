// pages/api/products/validate-coin-purchase.ts - Validate coin purchase
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../lib/middleware/auth';
import ProductController from '../../../controllers/products.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    await ProductController.validateCoinPurchase(req, res);
  } catch (error) {
    console.error('Validate coin purchase API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}