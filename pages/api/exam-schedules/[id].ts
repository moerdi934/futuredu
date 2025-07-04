// pages/api/exam-schedules/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getExamScheduleById, updateExamSchedule, deleteExamSchedule } from '../../../controllers/examSchedule.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getExamScheduleById(req, res);
  } else if (req.method === 'PUT') {
    return await updateExamSchedule(req, res);
  } else if (req.method === 'DELETE') {
    return await deleteExamSchedule(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}