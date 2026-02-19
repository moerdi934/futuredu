// pages/api/exam-types/by-kind.ts - Get exam types by kind (for dropdown)
// TODO: Implement getExamTypesByKind controller function
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
// import * as examTypesController from '../../../controllers/examTypes.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);

    if (req.method === 'GET') {
      // TODO: Implement controller
      res.status(501).json({ error: 'Not implemented yet' });
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}