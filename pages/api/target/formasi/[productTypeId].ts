// pages/api/target/formasi/[productTypeId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getFormasiController } from '../../../../controllers/UserTarget.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getFormasiController(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}