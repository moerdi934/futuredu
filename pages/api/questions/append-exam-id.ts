// pages/api/questions/append-exam-id.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as questionController from '../../../controllers/questions.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return questionController.appendExamId(req, res);

    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}