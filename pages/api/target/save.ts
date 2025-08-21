// pages/api/target/save.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT } from '../../../lib/middleware/auth';
import { saveUserTargetController } from '../../../controllers/UserTarget.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
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

    return await saveUserTargetController(req as AuthenticatedRequest, res);
  } catch (error) {
    console.error('Error in save target API route:', error);
    return res.status(401).json({ 
      status: 'error',
      message: 'Unauthorized' 
    });
  }
}