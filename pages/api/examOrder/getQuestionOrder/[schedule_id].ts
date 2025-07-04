// pages/api/examOrder/getQuestionOrder/[schedule_id].ts
import { NextApiResponse } from 'next';
import { getQuestionOrder } from '../../../../controllers/examOrder.controller';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Run authentication middleware
      await runMiddleware(req, res, authenticateJWT);
      
      // Call the controller
      return getQuestionOrder(req, res);
    } catch (error) {
      console.error('Middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}