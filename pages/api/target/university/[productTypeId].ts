// pages/api/target/university/[productTypeId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getUniversityForProductTypeController } from '../../../../controllers/UserTarget.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getUniversityForProductTypeController(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}