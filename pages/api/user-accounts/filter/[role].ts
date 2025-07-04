// pages/api/user-accounts/filter/[role].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getFilterUser } from '../../../../controllers/userAccount.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Call controller function
    await getFilterUser(req, res);
  } catch (error) {
    console.error('Error in filter user API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}