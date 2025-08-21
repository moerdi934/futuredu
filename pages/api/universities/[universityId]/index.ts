// pages/api/universities/[universityId]/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getUniversityDetails } from '../../../../controllers/University.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getUniversityDetails(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}