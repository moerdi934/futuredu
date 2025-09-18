// pages/api/classes/[id]/start.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../../lib/middleware/auth';
import pool from '../../../../lib/db';
import * as ClassModel from '../../../../models/classes.model';
import * as EventModel from '../../../../models/event.model';
import * as SessionModel from '../../../../models/session.model';
import * as AttendanceModel from '../../../../models/attendance.model';
import * as CodeAttendanceModel from '../../../../models/codeAttendance.model';
import { generateUniqueToken } from '../../../../utils/attendanceTokenGenerator';
import QRCode from 'qrcode';

interface StartClassRequest {
  class_mode: 'online' | 'offline';
  meeting_url?: string;
  notes?: string;
  latitude: number;
  longitude: number;
}

interface StartClassResponse {
  success: boolean;
  message: string;
  data: {
    qrImage: string;
    token: string;
    expiration_time: string;
    meeting_url?: string;
    class_mode: string;
  };
}

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Apply JWT authentication middleware
  try {
    await runMiddleware(req, res, authenticateJWT);
  } catch (error) {
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id: classId } = req.query;
  const { class_mode, meeting_url, notes, latitude, longitude }: StartClassRequest = req.body;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  // Validate required fields
  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude dan longitude diperlukan'
    });
  }

  if (class_mode === 'online' && !meeting_url?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'URL meeting diperlukan untuk kelas online'
    });
  }

  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');

    // 1. Get and validate class
    const classData = await ClassModel.getClassesById(parseInt(classId as string), false, userRole, userId);
    if (!classData) {
      throw new Error('Kelas tidak ditemukan atau akses ditolak');
    }

    if (classData.is_deleted) {
      throw new Error('Kelas telah dihapus');
    }

    if (classData.approval_status === 'need_approve' || classData.approval_status === 'rejected') {
      throw new Error('Kelas belum disetujui dan tidak dapat dimulai');
    }

    if (classData.real_start_datetime) {
      throw new Error('Kelas sudah dimulai sebelumnya');
    }

    // Check authorization
    const canStartClass = userId && (
      (classData.starter_user_id && (parseInt(classData.starter_user_id.toString()) === userId || classData.starter_user_id.toString() === userId.toString())) ||
      userRole === 'admin' ||
      (classData.teacher_id && (parseInt(classData.teacher_id.toString()) === userId || classData.teacher_id.toString() === userId.toString()))
    );

    if (!canStartClass) {
      throw new Error('Anda tidak memiliki hak untuk memulai kelas ini');
    }

    // Validate meeting URL format
    if (class_mode === 'online' && meeting_url) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(meeting_url.trim())) {
        throw new Error('Format URL meeting tidak valid. Harus dimulai dengan http:// atau https://');
      }
    }

    const now = new Date().toISOString();

    // 2. Update class with real start time and class settings
    const updateClassQuery = `
      UPDATE classes 
      SET 
        real_start_datetime = $1,
        class_mode = $2,
        meeting_url = $3,
        edit_user_id = $4,
        edit_date = NOW()
      WHERE id = $5 AND (is_deleted IS NULL OR is_deleted = false)
      RETURNING *;
    `;
    const classUpdateResult = await client.query(updateClassQuery, [
      now,
      class_mode,
      class_mode === 'online' ? meeting_url?.trim() : null,
      userId,
      classId
    ]);

    if (classUpdateResult.rows.length === 0) {
      throw new Error('Gagal memulai kelas - tidak dapat mengupdate kelas');
    }

    // 3. Create session
    const createSessionQuery = `
      INSERT INTO fSession 
        (eventid, create_user_id, start_time, end_time, create_date, update_date)
      VALUES 
        ($1, $2, NOW(), NULL, NOW(), NOW())
      RETURNING *;
    `;
    const sessionResult = await client.query(createSessionQuery, [
      classData.event_id,
      userId
    ]);

    if (sessionResult.rows.length === 0) {
      throw new Error('Gagal membuat session');
    }

    const newSession = sessionResult.rows[0];

    // 4. Update event to started
    const updateEventQuery = `
      UPDATE events
      SET is_started = true
      WHERE id = $1 RETURNING *;
    `;
    await client.query(updateEventQuery, [classData.event_id]);

    // 5. Create attendance record
    const createAttendanceQuery = `
      INSERT INTO fAttendances 
        (userid, reff_userid, type_id, notes, timestamp, latitude, longitude, session_id)
      VALUES 
        ($1, $2, $3, $4, NOW(), $5, $6, $7)
      RETURNING *;
    `;
    await client.query(createAttendanceQuery, [
      userId,
      null, // reff_userid
      1, // type_id for check-in
      notes || `Memulai kelas ${classData.name}`,
      latitude,
      longitude,
      newSession.id
    ]);

    // 6. Generate QR code and create code attendance
    const token = await generateUniqueToken();
    const qr_data = JSON.stringify({ 
      session_id: newSession.id, 
      token, 
      reff_user_id: userId,
      type_id: 1,
      meeting_url: class_mode === 'online' ? meeting_url?.trim() : undefined
    });

    const expiration_time = new Date(Date.now() + 15 * 60 * 1000);
    const qrImageBuffer = await QRCode.toBuffer(qr_data);

    const createCodeAttendanceQuery = `
      INSERT INTO dimCodeAttendance 
        (session_id, event_id, create_user_id, qr_data, token, expiration_time, status, create_date, qr_image, meeting_url)
      VALUES 
        ($1, $2, $3, $4, $5, $6, 'active', NOW(), $7, $8)
      RETURNING *;
    `;
    await client.query(createCodeAttendanceQuery, [
      newSession.id,
      classData.event_id,
      userId,
      qr_data,
      token,
      expiration_time,
      qrImageBuffer,
      class_mode === 'online' ? meeting_url?.trim() : null
    ]);

    // Commit transaction
    await client.query('COMMIT');

    // Generate QR image for response
    const qrImage = await QRCode.toDataURL(qr_data);

    const response: StartClassResponse = {
      success: true,
      message: `Kelas berhasil dimulai sebagai kelas ${class_mode.toUpperCase()}!`,
      data: {
        qrImage,
        token,
        expiration_time: expiration_time.toISOString(),
        meeting_url: class_mode === 'online' ? meeting_url?.trim() : undefined,
        class_mode
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Start Class Transaction Error:', error);
    
    res.status(400).json({
      success: false,
      message: error.message || 'Terjadi kesalahan saat memulai kelas'
    });
  } finally {
    client.release();
  }
}