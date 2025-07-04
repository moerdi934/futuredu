// pages/api/products/[id]/detail.ts
import { NextApiRequest, NextApiResponse } from 'next';
import ProductController from '../../../../controllers/products.controller';
import { runMiddleware } from '../../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware if needed
  // await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'GET':
      return ProductController.getProductDetail(req, res);
    
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}