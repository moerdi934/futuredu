// pages/api/target/prodi/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getProdiWithUniversityController } from '../../../../controllers/UserTarget.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getProdiWithUniversityController(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}