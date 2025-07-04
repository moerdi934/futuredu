// pages/api/users/check-auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    const authReq = req as AuthenticatedRequest;
    console.log('Authenticated user:', authReq.user);
    
    res.json({ 
      isAuthenticated: true, 
      username: authReq.user?.username 
    });
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}