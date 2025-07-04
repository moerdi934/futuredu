// pages/api/userExam/checkUserExam.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { checkUserExam } from '../../../controllers/userExam.controller';
import { UserExamResponse, UserExamError } from '../../../models/userExam.model';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserExamResponse | UserExamError>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Call the controller function
  await checkUserExam(req, res);
}