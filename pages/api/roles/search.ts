// pages/api/roles/search.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { searchRolesController } from '../../../controllers/role.controller';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Hanya izinkan method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Jalankan middleware authentication
    await runMiddleware(req as AuthenticatedRequest, res, authenticateJWT);
    
    // Panggil controller
    await searchRolesController(req, res);
  } catch (error) {
    console.error('API Route Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}