// pages/api/users/migrate-step1.ts  
// Step 1: Add hash_password column and populate
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
    return await UserController.addHashPasswordColumnController(req, res);
  } catch (error) {
    console.error('Step 1 error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
