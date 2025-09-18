// pages/api/classes/[id]/qr-code.ts - Get existing QR code
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../../lib/middleware/auth';
import * as ClassModel from '../../../../models/classes.model';
import * as SessionModel from '../../../../models/session.model';
import * as CodeAttendanceModel from '../../../../models/codeAttendance.model';

interface QRCodeResponse {
  success: boolean;
  data?: {
    qrImage: string;
    token: string;
    expiration_time: string;
    meeting_url?: string;
    class_mode: string;
  };
  message: string;
}

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Apply JWT authentication middleware
  try {
    await runMiddleware(req, res, authenticateJWT);
  } catch (error) {
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id: classId } = req.query;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  try {
    // Get class data
    const classData = await ClassModel.getClassesById(parseInt(classId as string), false, userRole, userId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Kelas tidak ditemukan atau akses ditolak'
      });
    }

    if (!classData.event_id) {
      return res.status(404).json({
        success: false,
        message: 'Event tidak ditemukan untuk kelas ini'
      });
    }

    // Get session
    const session = await SessionModel.getSessionByEventId(classData.event_id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session tidak ditemukan'
      });
    }

    // Get existing QR codes
    const existingCodes = await CodeAttendanceModel.getCodeAttendancesBySessionId(session.id);
    if (!existingCodes || existingCodes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'QR Code tidak ditemukan'
      });
    }

    // Get the latest code
    const latestCode = existingCodes[0];

    const response: QRCodeResponse = {
      success: true,
      data: {
        qrImage: latestCode.qr_image,
        token: latestCode.token,
        expiration_time: latestCode.expiration_time.toISOString(),
        meeting_url: latestCode.meeting_url || undefined,
        class_mode: classData.class_mode || 'offline'
      },
      message: 'QR Code berhasil diambil'
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Get QR Code Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil QR Code'
    });
  }
}