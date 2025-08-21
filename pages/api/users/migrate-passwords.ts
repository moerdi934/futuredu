// pages/api/users/migrate-passwords.ts
// Complete migration (semua step sekaligus)
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
    return await UserController.migrateAllPasswordsController(req, res);
  } catch (error) {
    console.error('Complete migration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}