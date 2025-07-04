// pages/api/users/username/[username].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, authenticateRole } from '../../../../lib/middleware/auth';
import UserController from '../../../../controllers/user.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Run role-based authentication middleware
    await runMiddleware(req, res, authenticateRole(['admin', 'student']));
    
    // Call controller
    return await UserController.findByUsername(req, res);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}