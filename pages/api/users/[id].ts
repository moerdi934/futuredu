// pages/api/users/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, authenticateRole } from '../../../lib/middleware/auth';
import UserController from '../../../controllers/user.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await UserController.findById(req, res);
        
      case 'PUT':
        return await UserController.updateUser(req, res);
        
      case 'DELETE':
        // Run authentication middleware
        await runMiddleware(req, res, authenticateJWT);
        
        // Run role-based authentication middleware (only admin can delete)
        await runMiddleware(req, res, authenticateRole(['admin']));
        
        return await UserController.deleteUser(req, res);
        
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}