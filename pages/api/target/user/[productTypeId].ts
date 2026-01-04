// pages/api/target/user/[productTypeId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT } from '../../../../lib/middleware/auth';
import { getUserTargetController, deleteUserTargetController } from '../../../../controllers/UserTarget.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Apply JWT authentication middleware
    await new Promise<void>((resolve, reject) => {
      authenticateJWT(req as AuthenticatedRequest, res, (error?: any) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    if (req.method === 'GET') {
      return await getUserTargetController(req as AuthenticatedRequest, res);
    } else if (req.method === 'DELETE') {
      return await deleteUserTargetController(req as AuthenticatedRequest, res);
    }
  } catch (error) {
    console.error('Error in user target API route:', error);
    return res.status(401).json({ 
      status: 'error',
      message: 'Unauthorized' 
    });
  }
}