// pages/api/classes/[id]/attendance-status.ts - API untuk cek status presensi student
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../../lib/middleware/auth';
import pool from '../../../../lib/db';
import * as ClassModel from '../../../../models/classes.model';
import * as SessionModel from '../../../../models/session.model';

interface AttendanceStatusResponse {
  success: boolean;
  data: {
    classStatus: 'not_started' | 'ongoing' | 'finished';
    studentStatus: 'not_attended' | 'checked_in' | 'checked_out';
    canCheckIn: boolean;
    canCheckOut: boolean;
    classInfo: {
      name: string;
      course_name: string;
      teacher_name: string;
      class_mode: string;
      meeting_url?: string;
      real_start_datetime?: string;
      real_end_datetime?: string;
    };
    attendanceHistory: {
      check_in?: {
        timestamp: string;
        notes?: string;
      };
      check_out?: {
        timestamp: string;
        notes?: string;
      };
    };
  };
  message: string;
}

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
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
    // 1. Get class data
    const classData = await ClassModel.getClassesById(parseInt(classId as string), false, userRole, userId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Kelas tidak ditemukan atau akses ditolak'
      });
    }

    // Check if student is enrolled in this class
    if (!classData.student_list.includes(parseInt(userId))) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak terdaftar dalam kelas ini'
      });
    }

    // 2. Determine class status
    let classStatus: 'not_started' | 'ongoing' | 'finished' = 'not_started';
    
    if (classData.real_end_datetime) {
      classStatus = 'finished';
    } else if (classData.real_start_datetime) {
      classStatus = 'ongoing';
    }

    // 3. Get session data
    const session = classData.event_id ? await SessionModel.getSessionByEventId(classData.event_id) : null;
    
    // 4. Get student's attendance history
    const attendanceQuery = `
      SELECT 
        fa.type_id,
        fa.timestamp,
        fa.notes,
        dt.type as attendance_type
      FROM fAttendances fa
      LEFT JOIN dimAttendanceType dt ON fa.type_id = dt.id
      WHERE fa.userid = $1 AND fa.session_id = $2
      ORDER BY fa.timestamp ASC
    `;
    
    const attendanceResult = session ? 
      await pool.query(attendanceQuery, [userId, session.id]) : 
      { rows: [] };

    const attendanceRecords = attendanceResult.rows;
    
    // Process attendance history
    const attendanceHistory: any = {};
    let studentStatus: 'not_attended' | 'checked_in' | 'checked_out' = 'not_attended';
    
    attendanceRecords.forEach(record => {
      if (record.type_id === 1) { // Check-in
        attendanceHistory.check_in = {
          timestamp: record.timestamp,
          notes: record.notes
        };
        studentStatus = 'checked_in';
      } else if (record.type_id === 2) { // Check-out
        attendanceHistory.check_out = {
          timestamp: record.timestamp,
          notes: record.notes
        };
        studentStatus = 'checked_out';
      }
    });

    // 5. Determine what actions student can perform
    let canCheckIn = false;
    let canCheckOut = false;

    if (classStatus === 'ongoing') {
      if (studentStatus === 'not_attended') {
        canCheckIn = true;
      } else if (studentStatus === 'checked_in') {
        canCheckOut = true;
      }
    } else if (classStatus === 'finished') {
      // Even after class ends, allow check-out if student checked in but hasn't checked out
      if (studentStatus === 'checked_in') {
        canCheckOut = true;
      }
    }

    const response: AttendanceStatusResponse = {
      success: true,
      data: {
        classStatus,
        studentStatus,
        canCheckIn,
        canCheckOut,
        classInfo: {
          name: classData.name,
          course_name: classData.course_name,
          teacher_name: classData.teacher_name,
          class_mode: classData.class_mode,
          meeting_url: classData.meeting_url,
          real_start_datetime: classData.real_start_datetime,
          real_end_datetime: classData.real_end_datetime
        },
        attendanceHistory
      },
      message: 'Status presensi berhasil diambil'
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Get Attendance Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil status presensi'
    });
  }
}