// pages/api/sekolah/smp.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getAllSekolahSMP } from '../../../controllers/Sekolah.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getAllSekolahSMP(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}