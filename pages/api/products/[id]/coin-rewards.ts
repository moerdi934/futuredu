// pages/api/products/[id]/coin-rewards.ts - Update product coin rewards
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../../lib/middleware/auth';
import ProductController from '../../../../controllers/products.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
    }
    
    await ProductController.updateProductCoinRewards(req, res);
  } catch (error) {
    console.error('Update product coin rewards API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}