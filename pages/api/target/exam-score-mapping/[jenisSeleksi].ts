// pages/api/target/exam-score-mapping/[jenisSeleksi].ts - Updated
import { NextApiRequest, NextApiResponse } from 'next';
import { getExamScoreMappingController } from '../../../../controllers/UserTarget.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getExamScoreMappingController(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}