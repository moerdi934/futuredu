// pages/api/checkout/midtrans/callback.ts
import { NextApiRequest, NextApiResponse } from 'next';
import CheckoutController from '../../../../controllers/Checkout.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Handle ping for handshake (GET)
      return CheckoutController.pingMidtrans(req, res);
    } else if (req.method === 'POST') {
      // Handle webhook callback (POST)
      return await CheckoutController.handleMidtransCallback(req, res);
    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Midtrans callback error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}