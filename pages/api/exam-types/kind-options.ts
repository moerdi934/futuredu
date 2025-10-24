// pages/api/exam-types/kind-options.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import * as examTypesController from '../../../controllers/examTypes.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);

    if (req.method === 'GET') {
      await examTypesController.getKindOptions(req, res);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}