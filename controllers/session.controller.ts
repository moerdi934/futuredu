// controllers/session.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as SessionModel from '../models/session.model';
import * as AttendanceModel from '../models/attendance.model';
import * as EventModel from '../models/event.model';
import * as CodeAttendanceModel from '../models/codeAttendance.model';
import * as ClassModel from '../models/classes.model';
import { generateUniqueToken } from '../utils/attendanceTokenGenerator';
import QRCode from 'qrcode';
import { AuthenticatedRequest } from '../lib/middleware/auth';

// Types
export interface CreateSessionRequest {
  eventid: string;
  latitude: number;
  longitude: number;
  notes: string;
  class_mode?: 'online' | 'offline';
  meeting_url?: string;
}

export interface UpdateSessionRequest {
  eventid: string;
  start_time?: Date;
  end_time?: Date;
}

export interface FinishSessionRequest {
  notes: string;
  longitude: number;
  latitude: number;
}

export interface QRResponse {
  qrImage: string;
  token: string;
  expiration_time: Date;
  meeting_url?: string;
  class_mode: string;
}

// Mendapatkan semua sesi
export const getAllSessions = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { eventid, create_user_id } = req.query;
    const sessions = await SessionModel.getSessions({ 
      eventid: eventid as string, 
      create_user_id: create_user_id as string 
    });
    res.json(sessions);
  } catch (error) {
    console.error('Get All Sessions Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Mendapatkan sesi berdasarkan ID
export const getSessionById = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  try {
    const session = await SessionModel.getSessionById(id as string);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    console.error('Get Session By ID Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getSessionByEventId = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  try {
    const session = await SessionModel.getSessionByEventId(id as string);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    console.error('Get Session By ID Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
 
// Updated createSession with class mode and meeting URL support
export const createSession = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { eventid, latitude, longitude, notes, class_mode, meeting_url }: CreateSessionRequest = req.body;
  const create_user_id = req.user!.id;

  try {
    // Get class information
    const classInfo = await ClassModel.getClassesByEventId(eventid, false, req.user.role, create_user_id);
    if (!classInfo) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // CORRECTED: Cek apakah kelas sudah dimulai
    if (classInfo.real_start_datetime) {
      return res.status(400).json({ message: 'Kelas sudah dimulai sebelumnya' });
    }

    // Validate meeting URL for online classes
    const finalClassMode = class_mode || classInfo.class_mode || 'offline';
    if (finalClassMode === 'online' && !meeting_url) {
      return res.status(400).json({ message: 'URL meeting diperlukan untuk kelas online' });
    }

    // CORRECTED: Set real start time HANYA saat session benar-benar dibuat
    await ClassModel.setClassRealStartTime(classInfo.id.toString(), create_user_id);

    // Update class with meeting URL and mode if needed
    if (finalClassMode === 'online' && meeting_url) {
      const updateData: ClassModel.ClassUpdateData = {
        name: classInfo.name,
        course_id: classInfo.course_id,
        description: classInfo.description,
        teacher_id: classInfo.teacher_id,
        student_list_ids: classInfo.student_list,
        start_time: classInfo.start_date,
        end_time: classInfo.end_date,
        edit_user_id: create_user_id,
        class_mode: finalClassMode,
        meeting_url: meeting_url
      };
      
      await ClassModel.updateClass(classInfo.id.toString(), updateData);
    }

    // Create session
    const newSession = await SessionModel.createSession({
      eventid,
      create_user_id,
      end_time: null,
    });

    // Update event
    await EventModel.startEvent(eventid);
    
    // Record attendance
    const attendanceData = {
      userid: create_user_id,
      reff_userid: null,
      type_id: 1,
      notes,
      latitude,
      longitude,
      session_id: newSession.id,
    };

    await AttendanceModel.createAttendance(attendanceData);

    // Generate QR code
    const token = await generateUniqueToken();
    const qr_data = JSON.stringify({ 
      session_id: newSession.id, 
      reff_userid: create_user_id, 
      type_id: 1, 
      token,
      meeting_url: finalClassMode === 'online' ? meeting_url : undefined
    });
    const expiration_time = new Date(Date.now() + 15 * 60 * 1000);
    const qrImageBuffer = await QRCode.toBuffer(qr_data);

    const codeData = {
      session_id: newSession.id,
      event_id: eventid,
      create_user_id,
      qr_data,
      token,
      expiration_time,
      status: 'active',
      qr_image: qrImageBuffer,
      meeting_url: finalClassMode === 'online' ? meeting_url : null
    };

    await CodeAttendanceModel.createCodeAttendance(codeData);

    const qrImage = await QRCode.toDataURL(qr_data);

    res.status(201).json({ 
      qrImage, 
      token, 
      expiration_time,
      meeting_url: finalClassMode === 'online' ? meeting_url : null,
      class_mode: finalClassMode
    } as QRResponse);

  } catch (error) {
    console.error('Create Session Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
// Mengupdate sesi
export const updateSession = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { eventid, start_time, end_time }: UpdateSessionRequest = req.body;
  const create_user_id = req.user!.id;
 
  try {
    const existingSession = await SessionModel.getSessionById(id as string);
    if (!existingSession) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const updatedSession = await SessionModel.updateSession(id as string, {
      eventid,
      create_user_id,
      start_time, 
      end_time,
    });
    res.json(updatedSession);
  } catch (error) {
    console.error('Update Session Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
 
export const finishSession = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id: eventid } = req.query;
  const { notes, longitude, latitude }: FinishSessionRequest = req.body;
  const create_user_id = req.user!.id;

  try {
    // Get session
    const existingSession = await SessionModel.getSessionByEventId(eventid as string);
    if (!existingSession) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Get class
    const classInfo = await ClassModel.getClassesByEventId(parseInt(eventid as string), false, req.user.role, create_user_id);
    if (!classInfo) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // CORRECTED: Cek apakah kelas sudah dimulai tapi belum selesai
    if (!classInfo.real_start_datetime) {
      return res.status(400).json({ message: 'Kelas belum dimulai' });
    }

    if (classInfo.real_end_datetime) {
      return res.status(400).json({ message: 'Kelas sudah selesai sebelumnya' });
    }

    // CORRECTED: Set real end time HANYA saat session benar-benar diakhiri
    await ClassModel.setClassRealEndTime(classInfo.id.toString(), create_user_id);

    // Finish session
    await SessionModel.finishSession(existingSession.id);

    // Record attendance
    const attendanceData = {
      userid: create_user_id,
      reff_userid: null,
      type_id: 2,
      notes,
      latitude,
      longitude, 
      session_id: existingSession.id,
    };

    await AttendanceModel.createAttendance(attendanceData);

    res.status(200).json({ 
      message: 'Session finished successfully'
    });

  } catch (error) {
    console.error('Finish Session Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Menghapus sesi
export const deleteSession = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const create_user_id = req.user!.id;

  try {
    const existingSession = await SessionModel.getSessionById(id as string);
    if (!existingSession) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Validasi apakah user yang menghapus adalah pembuat sesi
    if (existingSession.create_user_id !== create_user_id) {
      return res.status(403).json({ message: 'Not authorized to delete this session' });
    }

    await SessionModel.deleteSession(id as string);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Delete Session Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};