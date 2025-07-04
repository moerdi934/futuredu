// pages/api/exam-schedules/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getValidExamSchedules, createExamSchedule } from '../../../controllers/examSchedule.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getValidExamSchedules(req, res);
  } else if (req.method === 'POST') {
    return await createExamSchedule(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}