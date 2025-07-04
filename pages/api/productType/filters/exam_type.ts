// pages/api/productType/filters/exam_type.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getExamTypes } from '../../../../controllers/productType.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    await getExamTypes(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}