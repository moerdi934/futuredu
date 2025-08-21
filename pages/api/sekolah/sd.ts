// pages/api/sekolah/sd.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getAllSekolahSD } from '../../../controllers/Sekolah.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getAllSekolahSD(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}