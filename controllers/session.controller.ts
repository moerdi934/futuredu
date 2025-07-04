// controllers/session.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as SessionModel from '../models/session.model';
import * as AttendanceModel from '../models/attendance.model';
import * as EventModel from '../models/event.model';
import * as CodeAttendanceModel from '../models/codeAttendance.model';
import { generateUniqueToken } from '../utils/attendanceTokenGenerator';
import QRCode from 'qrcode';
import { AuthenticatedRequest } from '../lib/middleware/auth';

// Types
export interface CreateSessionRequest {
  eventid: string;
  latitude: number;
  longitude: number;
  notes: string;
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
 
// Membuat sesi baru
export const createSession = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { eventid, latitude, longitude, notes }: CreateSessionRequest = req.body;
  const create_user_id = req.user!.id;
  
  // Tambahkan log untuk memeriksa nilai create_user_id
  console.log('Creating session for user ID:', create_user_id);

  try {
    const newSession = await SessionModel.createSession({
      eventid,
      create_user_id,
      end_time: null,
    });
    const session_id = newSession.id;
    const updatedEvent = await EventModel.startEvent(eventid);
    
    try {
      const attendanceData = {
        userid: create_user_id,
        reff_userid: null,
        type_id: 1,
        notes,
        latitude,
        longitude,
        session_id,
      };

      const result = await AttendanceModel.createAttendance(attendanceData);

      const token = await generateUniqueToken();
      const qr_data = JSON.stringify({ session_id, reff_userid: create_user_id, type_id: 1, token });
      const expiration_time = new Date(Date.now() + 15 * 60 * 1000); // 15 menit
      const qrImageBuffer = await QRCode.toBuffer(qr_data); // Menghasilkan buffer QR Code dalam format bytea

      // Insert code attendance
      const codeData = {
        session_id,
        event_id: eventid,
        create_user_id,
        qr_data,
        token,
        expiration_time,
        status: 'active',
        qr_image: qrImageBuffer
      };

      const newCode = await CodeAttendanceModel.createCodeAttendance(codeData);

      // Generate QR Code image sebagai data URL
      const qrImage = await QRCode.toDataURL(qr_data);

      res.status(201).json({ qrImage, token, expiration_time } as QRResponse);

    } catch (error) {
      console.error('Error marking attendance:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while marking attendance.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
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

    // // Validasi apakah user yang mengupdate adalah pembuat sesi
    // if (existingSession.create_user_id !== create_user_id) {
    //     return res.status(403).json({ message: 'Not authorized to update this session' });
    // }

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
  const { eventid } = req.query;
  const { notes, longitude, latitude }: FinishSessionRequest = req.body;
  const create_user_id = req.user!.id;
 
  try {
    const existingSession = await SessionModel.getSessionByEventId(eventid as string);
    if (!existingSession) {
      return res.status(404).json({ message: 'Session not found' });
    }
    const session_id = existingSession.id;
    console.log(existingSession);
    
    // // Validasi apakah user yang mengupdate adalah pembuat sesi
    // if (existingSession.create_user_id !== create_user_id) {
    //     return res.status(403).json({ message: 'Not authorized to update this session' });
    // }

    const updatedSession = await SessionModel.finishSession(session_id);

    const attendanceData = {
      userid: create_user_id,
      reff_userid: null,
      type_id: 2,
      notes,
      latitude,
      longitude, 
      session_id: session_id,
    };

    const result = await AttendanceModel.createAttendance(attendanceData);

    const token = await generateUniqueToken();
    const qr_data = JSON.stringify({ session_id, reff_userid: create_user_id, type_id: 2, token });
    const expiration_time = new Date(Date.now() + 60 * 60 * 1000); // 60 menit
    const qrImageBuffer = await QRCode.toBuffer(qr_data); // Menghasilkan buffer QR Code dalam format bytea

    // Insert code attendance
    const codeData = {
      session_id,
      event_id: eventid as string,
      create_user_id,
      qr_data,
      token,
      expiration_time,
      status: 'active',
      qr_image: qrImageBuffer
    };

    const newCode = await CodeAttendanceModel.createCodeAttendance(codeData);

    // Generate QR Code image sebagai data URL
    const qrImage = await QRCode.toDataURL(qr_data);

    res.status(201).json({ qrImage, token, expiration_time } as QRResponse);

  } catch (error) {
    console.error('Update Session Error:', error);
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