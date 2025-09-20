// pages/api/checkout/midtrans/callback.ts
import { NextApiRequest, NextApiResponse } from 'next';
import CheckoutController from '../../../../controllers/Checkout.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers for Midtrans
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Handle ping for handshake (GET)
      return CheckoutController.pingMidtrans(req, res);
    } else if (req.method === 'POST') {
      // Handle webhook callback (POST)
      
      // Log the incoming request for debugging
      console.log('Midtrans callback received:', {
        method: req.method,
        headers: req.headers,
        body: req.body
      });

      // Validate request body
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid callback data'
        });
      }

      return await CheckoutController.handleMidtransCallback(req, res);
    } else {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }
  } catch (error: any) {
    console.error('Midtrans callback error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
}