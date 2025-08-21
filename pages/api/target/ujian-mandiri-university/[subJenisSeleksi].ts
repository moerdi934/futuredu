// pages/api/target/ujian-mandiri-university/[subJenisSeleksi].ts - New
import { NextApiRequest, NextApiResponse } from 'next';
import { getUjianMandiriUniversityController } from '../../../../controllers/UserTarget.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getUjianMandiriUniversityController(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}