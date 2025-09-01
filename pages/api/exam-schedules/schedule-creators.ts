// pages/api/exam-schedules/schedule-creators.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getScheduleCreatorsController } from '../../../controllers/examSchedule.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getScheduleCreatorsController(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}