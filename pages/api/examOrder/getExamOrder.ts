// pages/api/examOrder/getExamOrder.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getExamOrder } from '../../../controllers/examOrder.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return getExamOrder(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}