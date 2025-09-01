// pages/api/exam-schedules/series.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSeriesController } from '../../../controllers/examSchedule.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getSeriesController(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}