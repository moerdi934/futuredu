// pages/api/checkout/process.ts
import { NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import CheckoutController, { CheckoutRequest } from '../../../controllers/Checkout.controller';

export default async function handler(req: CheckoutRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Process checkout
    return await CheckoutController.processCheckout(req, res);
  } catch (error: any) {
    console.error('Process checkout error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}