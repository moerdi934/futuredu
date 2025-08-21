// pages/api/users/migration-status.ts
// Get migration status
import { NextApiRequest, NextApiResponse } from 'next';
import UserController from '../../../controllers/user.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      message: 'Method not allowed',
      allowedMethods: ['GET']
    });
  }

  try {
    return await UserController.getMigrationStatusController(req, res);
  } catch (error) {
    console.error('Status error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}