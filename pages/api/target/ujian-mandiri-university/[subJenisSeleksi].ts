// pages/api/target/ujian-mandiri-university/[subJenisSeleksi].ts - New
// TODO: Implement getUjianMandiriUniversityController function
import { NextApiRequest, NextApiResponse } from 'next';
// import { getUjianMandiriUniversityController } from '../../../../controllers/UserTarget.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // TODO: Implement controller
    return res.status(501).json({ error: 'Not implemented yet' });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}