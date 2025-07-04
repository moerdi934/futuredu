// pages/api/products/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import ProductController from '../../../controllers/products.controller';
import { runMiddleware } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware if needed
//   await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'GET':
      return ProductController.getProducts(req, res);
    
    case 'POST':
      return ProductController.createProduct(req, res);
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}