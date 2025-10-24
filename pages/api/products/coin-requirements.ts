// pages/api/products/coin-requirements.ts - Get coin requirements for cart
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../lib/middleware/auth';
import ProductController from '../../../controllers/products.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    await ProductController.getCoinRequirementsForCart(req, res);
  } catch (error) {
    console.error('Get coin requirements API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}