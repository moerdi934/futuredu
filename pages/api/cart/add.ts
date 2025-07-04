// pages/api/cart/add.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import * as CartController from '../../../controllers/cart.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Run authentication middleware
  await runMiddleware(req, res, authenticateJWT);

  const { method } = req;

  switch (method) {
    case 'POST':
      return CartController.addToCart(req, res);
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}