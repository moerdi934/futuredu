// pages/api/cart/clear.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import * as CartController from '../../../controllers/cart.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Run authentication middleware
  await runMiddleware(req, res, authenticateJWT);

  const { method } = req;

  switch (method) {
    case 'DELETE':
      return CartController.clearCart(req, res);
    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
  }
}