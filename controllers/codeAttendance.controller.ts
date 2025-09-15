// controllers/codeAttendance.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as CodeAttendance from '../models/codeAttendance.model';
import { generateUniqueToken } from '../utils/attendanceTokenGenerator';
import QRCode from 'qrcode';
import * as Session from '../models/session.model';
import * as Attendance from '../models/attendance.model';
import * as ClassModel from '../models/classes.model';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../lib/middleware/auth';

// Types
export interface QRCodeData {
  session_id: number;
  token: string;
  reff_user_id: string;
  type_id: number;
  meeting_url?: string; // New field for online classes
}

export interface ValidateQRCodeRequest {
  qrCode: string;
  longitude: number;
  latitude: number;
}

export interface ValidateTokenRequest {
  token: string;
  longitude: number;
  latitude: number;
}

export interface UpdateStatusRequest {
  token: string;
  status: string;
}

// Updated interface for creating code attendance with meeting URL
export interface CreateCodeAttendanceRequest {
  class_mode: 'online' | 'offline';
  meeting_url?: string;
}

// Existing functions (getAllCodeAttendances, getCodeAttendanceById remain the same)
export const getAllCodeAttendances = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { session_id, status } = req.query;
        const filters: any = {};
        
        if (session_id) filters.session_id = parseInt(session_id as string);
        if (status) filters.status = status as string;
        
        const codes = await CodeAttendance.getCodeAttendances(filters);
        res.json(codes);
    } catch (error) {
        console.error('Get All Code Attendances Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getCodeAttendanceById = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { id } = req.query;
        const code = await CodeAttendance.getCodeAttendanceById(parseInt(id as string));
        if (!code) {
            return res.status(404).json({ message: 'Code Attendance not found' });
        }
        res.json(code);
    } catch (error) {
        console.error('Get Code Attendance By ID Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
 
// Updated createCodeAttendance with meeting URL support
export const createCodeAttendance = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { session_id } = req.query;
        const { class_mode, meeting_url }: CreateCodeAttendanceRequest = req.body;
        const create_user_id = req.user!.id;

        // Validasi sesi
        const session = await Session.getSessionById(parseInt(session_id as string));
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Validasi apakah user adalah pembuat sesi
        if (session.create_user_id !== create_user_id) {
            return res.status(403).json({ message: 'Not authorized to generate QR Code for this session' });
        }

        // Validate meeting URL for online classes
        if (class_mode === 'online' && !meeting_url) {
            return res.status(400).json({ message: 'URL meeting diperlukan untuk kelas online' });
        }

        // Generate token unik 8 digit
        const token = await generateUniqueToken();

        // Buat qr_data dengan meeting_url jika online
        const qr_data = JSON.stringify({ 
            session_id: parseInt(session_id as string), 
            token, 
            reff_user_id: create_user_id,
            type_id: 1,
            meeting_url: class_mode === 'online' ? meeting_url : undefined
        });

        // Tentukan expiration_time (misalnya 15 menit dari sekarang)
        const expiration_time = new Date(Date.now() + 15 * 60 * 1000); // 15 menit
        const qrImageBuffer = await QRCode.toBuffer(qr_data);

        // Insert code attendance with meeting URL
        const codeData: CodeAttendance.CreateCodeAttendanceData = {
            session_id: parseInt(session_id as string),
            event_id: session.eventid,
            create_user_id,
            qr_data,
            token,
            expiration_time,
            status: 'active',
            qr_image: qrImageBuffer,
            meeting_url: class_mode === 'online' ? meeting_url : null
        };

        const newCode = await CodeAttendance.createCodeAttendance(codeData);

        // Generate QR Code image sebagai data URL
        const qrImage = await QRCode.toDataURL(qr_data);

        res.status(201).json({ 
            qrImage, 
            token, 
            expiration_time, 
            meeting_url: class_mode === 'online' ? meeting_url : null,
            class_mode 
        });
    } catch (error) {
        console.error('Create Code Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Updated updateCodeAttendanceStatus remains the same
export const updateCodeAttendanceStatus = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { token, status }: UpdateStatusRequest = req.body;

        const updatedCode = await CodeAttendance.updateCodeAttendanceStatus(token, status);
        if (!updatedCode) {
            return res.status(404).json({ message: 'Code Attendance not found' });
        }
        res.json(updatedCode);
    } catch (error) {
        console.error('Update Code Attendance Status Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Updated checkAndGenerateFromEventCodeAttendance with class info and meeting URL
export const checkAndGenerateFromEventCodeAttendance = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { event_id } = req.query;
        const { class_mode, meeting_url }: CreateCodeAttendanceRequest = req.body;
        const create_user_id = req.user!.id;
        
        const eventsession = await Session.getSessionByEventId(parseInt(event_id as string));
        if (!eventsession) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const session_id = eventsession.id;

        // Get class info to validate and update class mode
        const classInfo = await ClassModel.getClassesByEventId(eventsession.eventid.toString(), false, 'admin');
        if (!classInfo) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Update class with meeting URL if online
        if (class_mode === 'online') {
            if (!meeting_url) {
                return res.status(400).json({ message: 'URL meeting diperlukan untuk kelas online' });
            }
            // Update class meeting_url and class_mode
            await ClassModel.updateClass(classInfo.id.toString(), {
                ...classInfo,
                class_mode,
                meeting_url,
                edit_user_id: create_user_id
            });
        }
        
        // Cek apakah sudah ada code attendance yang valid
        const latestValidCode = await CodeAttendance.getValidCodeAttendances(session_id);

        if (latestValidCode) {
            // Jika ada code attendance yang masih valid, kirimkan data yang sudah ada
            return res.status(200).json({
                qrImage: latestValidCode.qr_image,
                token: latestValidCode.token,
                expiration_time: latestValidCode.expiration_time,
                meeting_url: latestValidCode.meeting_url,
                class_mode: classInfo.class_mode
            });
        }

        // Jika tidak ada code attendance yang valid, buat yang baru
        const session = await Session.getSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Validasi apakah user adalah pembuat sesi
        if (session.create_user_id !== create_user_id) {
            return res.status(403).json({ message: 'Not authorized to generate QR Code for this session' });
        }

        // Generate token unik 8 digit
        const token = await generateUniqueToken();

        // Buat qr_data dengan meeting_url jika online
        const qr_data = JSON.stringify({ 
            session_id, 
            token, 
            reff_user_id: create_user_id, 
            type_id: 1,
            meeting_url: class_mode === 'online' ? meeting_url : undefined
        });

        // Tentukan expiration_time (misalnya 15 menit dari sekarang)
        const expiration_time = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

        // Generate QR Code image sebagai buffer (bytea)
        const qrImageBuffer = await QRCode.toBuffer(qr_data);

        // Insert code attendance with meeting URL
        const codeData: CodeAttendance.CreateCodeAttendanceData = {
            session_id,
            event_id: session.eventid,
            create_user_id,
            qr_data,
            token,
            expiration_time,
            status: 'active',
            qr_image: qrImageBuffer,
            meeting_url: class_mode === 'online' ? meeting_url : null
        };

        const newCode = await CodeAttendance.createCodeAttendance(codeData);

        res.status(201).json({
            qrImage: `data:image/png;base64,${newCode.qr_image.toString('base64')}`,
            token: newCode.token,
            expiration_time: newCode.expiration_time,
            meeting_url: class_mode === 'online' ? meeting_url : null,
            class_mode
        });
    } catch (error) {
        console.error('Check and Generate Code Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Updated checkAndGenerateCodeAttendance with class mode support
export const checkAndGenerateCodeAttendance = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { id } = req.query;
        const { class_mode, meeting_url }: CreateCodeAttendanceRequest = req.body;
        const create_user_id = req.user!.id;
        const session_id = parseInt(id as string);
        
        // Validate meeting URL for online classes
        if (class_mode === 'online' && !meeting_url) {
            return res.status(400).json({ message: 'URL meeting diperlukan untuk kelas online' });
        }
        
        // Cek apakah sudah ada code attendance yang valid
        const latestValidCode = await CodeAttendance.getValidCodeAttendances(session_id);

        if (latestValidCode) {
            // Jika ada code attendance yang masih valid, kirimkan data yang sudah ada
            return res.status(200).json({
                qrImage: latestValidCode.qr_image,
                token: latestValidCode.token,
                expiration_time: latestValidCode.expiration_time,
                meeting_url: latestValidCode.meeting_url,
                class_mode: class_mode || 'offline'
            });
        }

        // Jika tidak ada code attendance yang valid, buat yang baru
        const session = await Session.getSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Validasi apakah user adalah pembuat sesi
        if (session.create_user_id !== create_user_id) {
            return res.status(403).json({ message: 'Not authorized to generate QR Code for this session' });
        }

        // Generate token unik 8 digit
        const token = await generateUniqueToken();

        // Buat qr_data dengan meeting_url jika online
        const qr_data = JSON.stringify({ 
            session_id, 
            token, 
            reff_user_id: create_user_id, 
            type_id: 1,
            meeting_url: class_mode === 'online' ? meeting_url : undefined
        });

        // Tentukan expiration_time (misalnya 15 menit dari sekarang)
        const expiration_time = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

        // Generate QR Code image sebagai buffer (bytea)
        const qrImageBuffer = await QRCode.toBuffer(qr_data);

        // Insert code attendance with meeting URL
        const codeData: CodeAttendance.CreateCodeAttendanceData = {
            session_id,
            event_id: session.eventid,
            create_user_id,
            qr_data,
            token,
            expiration_time,
            status: 'active',
            qr_image: qrImageBuffer,
            meeting_url: class_mode === 'online' ? meeting_url : null
        };

        const newCode = await CodeAttendance.createCodeAttendance(codeData);

        res.status(201).json({
            qrImage: `data:image/png;base64,${newCode.qr_image.toString('base64')}`,
            token: newCode.token,
            expiration_time: newCode.expiration_time,
            meeting_url: class_mode === 'online' ? meeting_url : null,
            class_mode
        });
    } catch (error) {
        console.error('Check and Generate Code Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Updated validateQRCode with meeting URL access
export const validateQRCode = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { qrCode, longitude, latitude }: ValidateQRCodeRequest = req.body;
        const user_id = req.user!.id;
        
        const qrData: QRCodeData = JSON.parse(qrCode);
        const { session_id, token, reff_user_id, type_id, meeting_url } = qrData;

        // Cek apakah QR Code valid
        const codeAttendance = await CodeAttendance.getCodeAttendanceByToken(token);

        if (!codeAttendance || new Date(codeAttendance.expiration_time) < new Date()) {
            return res.status(400).json({ message: 'QR Code tidak valid atau sudah kadaluarsa.' });
        }

        const session = await Session.getSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const assignedUsers = session.assigned_to || [];
        if (!Array.isArray(assignedUsers)) {
            return res.status(500).json({ message: 'Format data sesi tidak valid' });
        }

        const generatenotes = (type_id: number, user_id: string, session_id: number) => {
            if (type_id === 1) {
                return `Presensi masuk user ${user_id} dalam session ${session_id}.`;
            } else if (type_id === 2) {
                return `Presensi keluar user ${user_id} dalam session ${session_id}.`;
            }
            return '';
        };
        
        const attendanceData = {
            userid: user_id,
            reff_userid: reff_user_id,
            type_id,
            notes: generatenotes(type_id, user_id, session_id),
            latitude,
            longitude,
            session_id,
        };

        const result = await Attendance.createAttendance(attendanceData);

        // Presensi sudah berhasil divalidasi dan disimpan
        const response: any = { 
            message: 'QR Code valid! Presensi berhasil.'
        };

        // Include meeting URL in response if available for students
        if (meeting_url && req.user.role === 'student') {
            response.meeting_url = meeting_url;
            response.message = 'QR Code valid! Presensi berhasil. Link meeting tersedia.';
        }

        return res.status(200).json(response);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan dalam memvalidasi QR Code.' });
    }
};

// Updated validateToken with meeting URL access
export const validateToken = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { token, longitude, latitude }: ValidateTokenRequest = req.body;
        const user_id = req.user!.id;
        
        // Cek apakah token valid
        const codeAttendance = await CodeAttendance.getCodeAttendanceByToken(token);

        if (!codeAttendance || new Date(codeAttendance.expiration_time) < new Date()) {
            return res.status(400).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
        }
        
        const session_id = codeAttendance.session_id;
        const session = await Session.getSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const assignedUsers = session.assigned_to || [];
        if (!Array.isArray(assignedUsers)) {
            return res.status(500).json({ message: 'Format data sesi tidak valid' });
        }

        const generatenotes = (type_id: number, user_id: string, session_id: number) => {
            if (type_id === 1) {
                return `Presensi masuk user ${user_id} dalam session ${session_id}.`;
            } else if (type_id === 2) {
                return `Presensi keluar user ${user_id} dalam session ${session_id}.`;
            }
            return '';
        };
        
        const attendanceData = {
            userid: user_id,
            reff_userid: codeAttendance.create_user_id,
            type_id: 1, // Default type_id
            notes: generatenotes(1, user_id, session_id),
            latitude,
            longitude,
            session_id,
        };

        const result = await Attendance.createAttendance(attendanceData);

        // Presensi sudah berhasil divalidasi dan disimpan
        const response: any = { 
            message: 'Token valid! Presensi berhasil.'
        };

        // Include meeting URL in response if available for students
        if (codeAttendance.meeting_url && req.user.role === 'student') {
            response.meeting_url = codeAttendance.meeting_url;
            response.message = 'Token valid! Presensi berhasil. Link meeting tersedia.';
        }

        return res.status(200).json(response);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan dalam memvalidasi token.' });
    }
};