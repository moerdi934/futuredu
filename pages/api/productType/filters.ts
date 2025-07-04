// pages/api/productType/filters.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getFilters } from '../../../controllers/productType.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    await getFilters(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}