// pages/api/users/migrate-step3.ts
// Step 3: Remove hash_password column
import { NextApiRequest, NextApiResponse } from 'next';
import UserController from '../../../controllers/user.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      message: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    return await UserController.removeHashPasswordColumnController(req, res);
  } catch (error) {
    console.error('Step 3 error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}