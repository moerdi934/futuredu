// pages/api/users/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import UserController from '../../../controllers/user.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== API Route Debug ===');
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
    console.log('Calling UserController.login...');
    // Ubah dari UserController.login menjadi UserController.login
    // karena login adalah property dari object UserController, bukan static method
    return await UserController.login(req, res);
  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}