// pages/api/exam-schedules/type/[examtype].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getExamSchedulesByType } from '../../../../controllers/examSchedule.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getExamSchedulesByType(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}