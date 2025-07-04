// pages/api/checkout/all-transactions.ts
import { NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import CheckoutController from '../../../controllers/Checkout.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Get all transactions
    return await CheckoutController.getAllTransactions(req, res);
  } catch (error: any) {
    console.error('Get all transactions error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}