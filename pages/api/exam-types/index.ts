// pages/api/exam-types/index.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import * as examTypesController from '../../../controllers/examTypes.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);

    switch (req.method) {
      case 'GET':
        // Get all exam types with basic pagination
        await examTypesController.getAllExamTypes(req, res);
        break;
      case 'POST':
        // Create new exam type
        await examTypesController.createExamType(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}