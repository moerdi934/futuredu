// pages/api/classes/[id]/restore.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import { restoreClass, getClassesById } from '../../../../models/classes.model';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware
  await runMiddleware(req, res, authenticateJWT);
  const authReq = req as AuthenticatedRequest;

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;

  try {
    // Check if class exists
    const existingClass = await getClassesById(id as string, true); // Include deleted records
    if (!existingClass) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan' });
    }

    // Check if class is actually deleted
    if (!existingClass.is_deleted) {
      return res.status(400).json({ 
        message: 'Kelas ini tidak dalam status terhapus' 
      });
    }

    // Check permissions - only admin, creator, or teacher can restore
    if (authReq.user.role !== 'admin' && 
        existingClass.create_user_id !== authReq.user.user_id && 
        existingClass.teacher_id !== authReq.user.user_id) {
      return res.status(403).json({ 
        message: 'Akses ditolak: Anda tidak memiliki hak untuk mengembalikan kelas ini' 
      });
    }

    // Perform restore
    const restoredClass = await restoreClass(id as string, authReq.user.user_id);

    if (!restoredClass) {
      return res.status(400).json({ 
        message: 'Gagal mengembalikan kelas' 
      });
    }

    res.status(200).json({
      message: 'Kelas berhasil dikembalikan',
      data: restoredClass
    });
  } catch (error) {
    console.error('Restore Class Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
}