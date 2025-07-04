// pages/api/productType/filters/group_product.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getGroupProducts } from '../../../../controllers/productType.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    await getGroupProducts(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}