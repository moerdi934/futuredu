// pages/api/users/admin/dashboard.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, authenticateRole } from '../../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Run role-based authentication middleware (only admin)
    await runMiddleware(req, res, authenticateRole(['admin']));
    
    res.json({ message: 'Welcome to the admin dashboard!' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}