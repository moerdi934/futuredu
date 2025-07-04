// pages/api/user-accounts/[user_id].ts
import { NextApiResponse } from 'next';
import { getUserAccount, deleteUserAccount } from '../../../controllers/userAccount.controller';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);

    if (req.method === 'GET') {
      await getUserAccount(req, res);
    } else if (req.method === 'DELETE') {
      await deleteUserAccount(req, res);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in user account API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}