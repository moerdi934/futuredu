// pages/api/users/[userId]/details.ts
import { NextApiRequest, NextApiResponse } from 'next';
import UserController from '../../../../../controllers/user.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    return await UserController.getUserDetails(req, res);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}