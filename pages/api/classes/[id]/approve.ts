// pages/api/classes/[id]/approve.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import * as ClassController from '../../../../controllers/classes.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    const authReq = req as AuthenticatedRequest;

    if (req.method !== 'PUT') {
      res.setHeader('Allow', ['PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Only admin and teacher can approve classes
    if (authReq.user?.role !== 'admin' && authReq.user?.role !== 'teacher') {
      return res.status(403).json({ 
        message: 'Akses ditolak. Hanya admin dan guru yang dapat menyetujui kelas.' 
      });
    }

    return ClassController.approveClass(authReq, res);
  } catch (error) {
    console.error('API Approve Class Error:', error);
    return res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}