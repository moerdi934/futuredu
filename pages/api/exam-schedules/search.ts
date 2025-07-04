// pages/api/exam-schedules/search.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { searchExamSchedules } from '../../../controllers/examSchedule.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await searchExamSchedules(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}