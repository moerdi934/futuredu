// pages/api/products/[id]/price.ts
import { NextApiRequest, NextApiResponse } from 'next';
import ProductController from '../../../../controllers/products.controller';
import { runMiddleware } from '../../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware if needed
  // await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'PATCH':
      return ProductController.updateProductPrices(req, res);
    
    default:
      res.setHeader('Allow', ['PATCH']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}