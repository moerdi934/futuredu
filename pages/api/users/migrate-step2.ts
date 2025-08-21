// pages/api/users/migrate-step2.ts
// Step 2: Replace passwords with hashed versions
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
    return await UserController.replacePasswordsController(req, res);
  } catch (error) {
    console.error('Step 2 error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}