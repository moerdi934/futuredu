// pages/api/checkout/orders.ts
import { NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import CheckoutController from '../../../controllers/Checkout.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Get user orders with pagination
    return await CheckoutController.getUserOrders(req, res);
  } catch (error: any) {
    console.error('Get user orders error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}