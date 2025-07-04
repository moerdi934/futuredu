// pages/api/user-accounts/save-account.ts
import { NextApiResponse } from 'next';
import { saveUserAccount } from '../../../controllers/userAccount.controller';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    console.log('Hit /save-account route');
    
    // Call controller function
    await saveUserAccount(req, res);
  } catch (error) {
    console.error('Error in save-account API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}