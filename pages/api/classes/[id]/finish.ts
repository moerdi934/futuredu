// pages/api/classes/[id]/finish.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../../lib/middleware/auth';
import { generateUniqueToken } from '../../../../utils/attendanceTokenGenerator';
import QRCode from 'qrcode';
import pool from '../../../../lib/db';
import * as ClassModel from '../../../../models/classes.model';

interface FinishClassRequest {
  notes?: string;
  latitude: number;
  longitude: number;
}

interface FinishClassResponse {
  success: boolean;
  message: string;
  data?: {
    qrImage: string;
    token: string;
    expiration_time: string;
    meeting_url?: string;
    class_mode: string;
    type: 'check_out';
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
  const { notes, latitude, longitude }: FinishClassRequest = req.body;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  // Validate required fields
  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude dan longitude diperlukan'
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

    if (!classData.real_start_datetime) {
      throw new Error('Kelas belum dimulai');
    }

    if (classData.real_end_datetime) {
      throw new Error('Kelas sudah selesai sebelumnya');
    }

    // Check authorization
    const canFinishClass = userId && (
      (classData.starter_user_id && (parseInt(classData.starter_user_id.toString()) === userId || classData.starter_user_id.toString() === userId.toString())) ||
      userRole === 'admin' ||
      (classData.teacher_id && (parseInt(classData.teacher_id.toString()) === userId || classData.teacher_id.toString() === userId.toString()))
    );

    if (!canFinishClass) {
      throw new Error('Anda tidak memiliki hak untuk menyelesaikan kelas ini');
    }

    const now = new Date().toISOString();

    // 2. Update class with real end time
    const updateClassQuery = `
      UPDATE classes 
      SET 
        real_end_datetime = $1,
        edit_user_id = $2,
        edit_date = NOW()
      WHERE id = $3 AND (is_deleted IS NULL OR is_deleted = false)
      RETURNING *;
    `;
    const classUpdateResult = await client.query(updateClassQuery, [
      now,
      userId,
      classId
    ]);

    if (classUpdateResult.rows.length === 0) {
      throw new Error('Gagal menyelesaikan kelas - tidak dapat mengupdate kelas');
    }

    // 3. Get session by event ID
    const getSessionQuery = `
      SELECT * FROM fSession 
      WHERE eventid = $1 
      ORDER BY create_date DESC 
      LIMIT 1;
    `;
    const sessionResult = await client.query(getSessionQuery, [classData.event_id]);
    
    if (sessionResult.rows.length === 0) {
      throw new Error('Session tidak ditemukan');
    }

    const session = sessionResult.rows[0];

    // 4. Finish session
    const finishSessionQuery = `
      UPDATE fSession 
      SET 
        end_time = NOW(),
        update_date = NOW()
      WHERE id = $1
      RETURNING *;
    `;
    await client.query(finishSessionQuery, [session.id]);

    // 5. Create finish attendance record
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
      2, // type_id for check-out
      notes || `Menyelesaikan kelas ${classData.name}`,
      latitude,
      longitude,
      session.id
    ]);

    // 6. Generate new QR code for student check-out
    const token = await generateUniqueToken();
    const qr_data = JSON.stringify({ 
      session_id: session.id, 
      token, 
      reff_user_id: userId,
      type_id: 2, // Check-out QR code
      meeting_url: classData.class_mode === 'online' ? classData.meeting_url : undefined
    });

    const expiration_time = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes for check-out
    const qrImageBuffer = await QRCode.toBuffer(qr_data);

    const createCheckOutCodeQuery = `
      INSERT INTO dimCodeAttendance 
        (session_id, event_id, create_user_id, qr_data, token, expiration_time, status, create_date, qr_image, meeting_url)
      VALUES 
        ($1, $2, $3, $4, $5, $6, 'active', NOW(), $7, $8)
      RETURNING *;
    `;
    await client.query(createCheckOutCodeQuery, [
      session.id,
      classData.event_id,
      userId,
      qr_data,
      token,
      expiration_time,
      qrImageBuffer,
      classData.class_mode === 'online' ? classData.meeting_url : null
    ]);

    // Commit transaction
    await client.query('COMMIT');

    // Generate QR image for response
    const qrImage = await QRCode.toDataURL(qr_data);

    const response = {
      success: true,
      message: 'Kelas berhasil diselesaikan!',
      data: {
        qrImage,
        token,
        expiration_time: expiration_time.toISOString(),
        meeting_url: classData.class_mode === 'online' ? classData.meeting_url : undefined,
        class_mode: classData.class_mode,
        type: 'check_out'
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Finish Class Transaction Error:', error);
    
    res.status(400).json({
      success: false,
      message: error.message || 'Terjadi kesalahan saat menyelesaikan kelas'
    });
  } finally {
    client.release();
  }
}
