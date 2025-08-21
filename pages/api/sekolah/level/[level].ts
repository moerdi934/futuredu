// pages/api/sekolah/level/[level].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSekolahByLevel } from '../../../../controllers/Sekolah.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getSekolahByLevel(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}