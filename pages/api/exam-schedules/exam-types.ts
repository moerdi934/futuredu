// pages/api/exam-schedules/exam-types.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getExamTypesController } from '../../../controllers/examSchedule.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getExamTypesController(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}