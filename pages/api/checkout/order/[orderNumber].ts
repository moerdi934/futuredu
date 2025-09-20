// pages/api/checkout/order/[orderNumber].ts
import { NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import CheckoutController from '../../../../controllers/Checkout.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

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
    
    // Validate orderNumber parameter
    const { orderNumber } = req.query;
    if (!orderNumber || typeof orderNumber !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Order number is required'
      });
    }
    
    // Get order status
    return await CheckoutController.getOrderStatus(req, res);
  } catch (error: any) {
    console.error('Get order status error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}