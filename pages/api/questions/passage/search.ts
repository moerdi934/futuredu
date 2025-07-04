// pages/api/questions/passage/search.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as questionController from '../../../../controllers/questions.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return questionController.searchPassages(req, res);

    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}