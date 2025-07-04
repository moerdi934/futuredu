// pages/api/exam-schedules/search-exam-type.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { searchExamTypeController } from '../../../controllers/examSchedule.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await searchExamTypeController(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}