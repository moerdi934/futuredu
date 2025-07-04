// pages/api/products/[id]/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import ProductController from '../../../../controllers/products.controller';
import { runMiddleware } from '../../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware if needed
  // await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'PUT':
      return ProductController.updateProductAndAssignments(req, res);
    
    default:
      res.setHeader('Allow', ['PUT']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}