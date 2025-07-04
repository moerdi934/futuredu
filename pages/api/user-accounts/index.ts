// pages/api/user-accounts/index.ts
import { NextApiResponse } from 'next';
import { getAllUserAccounts } from '../../../controllers/userAccount.controller';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Call controller function
    await getAllUserAccounts(req, res);
  } catch (error) {
    console.error('Error in get all user accounts API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}