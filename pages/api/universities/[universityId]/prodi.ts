// pages/api/universities/[universityId]/prodi.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getProdiByUniversityId } from '../../../../controllers/University.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getProdiByUniversityId(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}