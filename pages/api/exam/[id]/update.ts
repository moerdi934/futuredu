// pages/api/exam/[id]/update.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../../../../lib/middleware/auth';
import * as examController from '../../../../controllers/exam.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'PUT':
      await examController.updateExam(req, res);
      break;

    default:
      res.setHeader('Allow', ['PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}