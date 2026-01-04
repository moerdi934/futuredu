// pages/api/target/product-types/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getProductTypesController } from '../../../../controllers/UserTarget.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getProductTypesController(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}