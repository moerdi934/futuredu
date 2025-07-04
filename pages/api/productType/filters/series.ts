// pages/api/productType/filters/series.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSeries } from '../../../../controllers/productType.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    await getSeries(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}