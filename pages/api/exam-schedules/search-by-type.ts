// pages/api/exam-schedules/search-by-type.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { searchExamSchedulesByExamType } from '../../../controllers/examSchedule.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await searchExamSchedulesByExamType(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}