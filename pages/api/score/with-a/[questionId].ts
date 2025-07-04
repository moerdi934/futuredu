// pages/api/score/with-a/[questionId].ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../../lib/middleware/auth';
import { submitSingleAnswer } from '../../../../controllers/userExamAnswers.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Run authentication middleware
  await runMiddleware(req, res, authenticateJWT);

  if (req.method === 'POST') {
    return submitSingleAnswer(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}