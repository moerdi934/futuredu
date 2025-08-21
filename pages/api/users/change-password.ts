// pages/api/users/change-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT } from '../../../lib/middleware/auth';
import UserController from '../../../controllers/user.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== Change Password API Route Debug ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Body:', req.body);
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ 
      message: `Method not allowed. Method sekarang adalah ${req.method}`,
      allowedMethods: ['POST']
    });
  }

  try {
    // Apply JWT authentication middleware
    console.log('Applying JWT authentication...');
    await new Promise<void>((resolve, reject) => {
      authenticateJWT(req as AuthenticatedRequest, res, (error?: any) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    console.log('Calling UserController.changePasswordController...');
    return await UserController.changePasswordController(req as AuthenticatedRequest, res);
  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}