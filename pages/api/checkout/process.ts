// pages/api/checkout/process.ts
import { NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import CheckoutController, { CheckoutRequest } from '../../../controllers/Checkout.controller';

export default async function handler(req: CheckoutRequest, res: NextApiResponse) {
  // Set CORS headers if needed
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body'
      });
    }

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