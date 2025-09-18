// controllers/codeAttendance.controller.ts - FIXED version with proper check & generate logic

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
  meeting_url?: string;
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

export interface CreateCodeAttendanceRequest {
  class_mode: 'online' | 'offline';
  meeting_url?: string;
}

// Existing functions remain the same
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

// FIXED: New function to get existing code by event ID (GET only, no generation)
export const getCodeAttendanceByEventId = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { event_id } = req.query;
        const create_user_id = req.user!.id;

        // Get session by event ID
        const eventsession = await Session.getSessionByEventId(parseInt(event_id as string));
        if (!eventsession) {
            return res.status(404).json({ message: 'Session not found for this event' });
        }

        const session_id = eventsession.id;

        // Get the existing code (valid or expired doesn't matter for viewing)
        const existingCode = await CodeAttendance.getCodeAttendancesBySessionId(session_id);

        if (!existingCode || existingCode.length === 0) {
            return res.status(404).json({ message: 'No QR code found for this event' });
        }

        // Get the latest code for this session
        const latestCode = existingCode[0]; // Assuming getCodeAttendancesBySessionId returns ordered by date

        // Get class info for class_mode
        const classInfo = await ClassModel.getClassesByEventId(eventsession.eventid.toString(), false, 'admin');

        return res.status(200).json({
            qrImage: latestCode.qr_image,
            token: latestCode.token,
            expiration_time: latestCode.expiration_time,
            meeting_url: latestCode.meeting_url,
            class_mode: classInfo?.class_mode || 'offline'
        });

    } catch (error) {
        console.error('Get Code Attendance By Event ID Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Existing createCodeAttendance remains the same
export const createCodeAttendance = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { session_id } = req.query;
        const { class_mode, meeting_url }: CreateCodeAttendanceRequest = req.body;
        const create_user_id = req.user!.id;

        const session = await Session.getSessionById(parseInt(session_id as string));
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.create_user_id !== create_user_id) {
            return res.status(403).json({ message: 'Not authorized to generate QR Code for this session' });
        }

        if (class_mode === 'online' && !meeting_url) {
            return res.status(400).json({ message: 'URL meeting diperlukan untuk kelas online' });
        }

        const token = await generateUniqueToken();

        const qr_data = JSON.stringify({ 
            session_id: parseInt(session_id as string), 
            token, 
            reff_user_id: create_user_id,
            type_id: 1,
            meeting_url: class_mode === 'online' ? meeting_url : undefined
        });

        const expiration_time = new Date(Date.now() + 15 * 60 * 1000);
        const qrImageBuffer = await QRCode.toBuffer(qr_data);

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

// Existing updateCodeAttendanceStatus remains the same
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

// FIXED: Proper check and generate logic - only generate if no existing code
export const checkAndGenerateFromEventCodeAttendance = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { event_id } = req.query;
        const { class_mode, meeting_url }: CreateCodeAttendanceRequest = req.body;
        const create_user_id = req.user!.id;
        
        console.log(`[checkAndGenerateFromEventCodeAttendance] Starting for event_id: ${event_id}`);
        
        const eventsession = await Session.getSessionByEventId(parseInt(event_id as string));
        if (!eventsession) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const session_id = eventsession.id;
        console.log(`[checkAndGenerateFromEventCodeAttendance] Found session_id: ${session_id}`);

        // FIXED: Check if ANY code attendance exists for this session (valid or expired)
        const existingCodes = await CodeAttendance.getCodeAttendancesBySessionId(session_id);
        
        if (existingCodes && existingCodes.length > 0) {
            // Return the most recent existing code, regardless of expiration
            const latestCode = existingCodes[0]; // Assuming ordered by date DESC
            
            console.log(`[checkAndGenerateFromEventCodeAttendance] Found existing code, returning it`);
            
            // Get class info for class_mode
            const classInfo = await ClassModel.getClassesByEventId(eventsession.eventid.toString(), false, 'admin');
            
            return res.status(200).json({
                qrImage: latestCode.qr_image,
                token: latestCode.token,
                expiration_time: latestCode.expiration_time,
                meeting_url: latestCode.meeting_url,
                class_mode: classInfo?.class_mode || class_mode || 'offline'
            });
        }

        // No existing code found, generate new one
        console.log(`[checkAndGenerateFromEventCodeAttendance] No existing code found, generating new one`);
        
        // Get class info to validate and update class mode
        const classInfo = await ClassModel.getClassesByEventId(eventsession.eventid.toString(), false, 'admin');
        if (!classInfo) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Validate meeting URL for online classes
        if (class_mode === 'online' && !meeting_url) {
            return res.status(400).json({ message: 'URL meeting diperlukan untuk kelas online' });
        }

        // Update class with class mode and meeting URL
        const updateData: ClassModel.ClassUpdateData = {
            name: classInfo.name,
            course_id: classInfo.course_id,
            description: classInfo.description,
            teacher_id: classInfo.teacher_id,
            student_list_ids: classInfo.student_list,
            start_time: classInfo.start_date,
            end_time: classInfo.end_date,
            edit_user_id: create_user_id,
            class_mode,
            meeting_url: class_mode === 'online' ? meeting_url : undefined
        };
        
        try {
            await ClassModel.updateClass(classInfo.id.toString(), updateData);
            console.log(`[checkAndGenerateFromEventCodeAttendance] Class updated with mode: ${class_mode}`);
        } catch (updateError) {
            console.warn('Class update failed:', updateError);
        }

        // Validate user authorization
        const session = await Session.getSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.create_user_id !== create_user_id) {
            return res.status(403).json({ message: 'Not authorized to generate QR Code for this session' });
        }

        // Generate new QR code
        const token = await generateUniqueToken();
        
        const qr_data = JSON.stringify({ 
            session_id, 
            token, 
            reff_user_id: create_user_id, 
            type_id: 1,
            meeting_url: class_mode === 'online' ? meeting_url : undefined
        });

        const expiration_time = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        const qrImageBuffer = await QRCode.toBuffer(qr_data);

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
        console.log(`[checkAndGenerateFromEventCodeAttendance] New code created with token: ${newCode.token}`);

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

// FIXED: Updated checkAndGenerateCodeAttendance with proper logic
export const checkAndGenerateCodeAttendance = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { id } = req.query;
        const { class_mode, meeting_url }: CreateCodeAttendanceRequest = req.body;
        const create_user_id = req.user!.id;
        const session_id = parseInt(id as string);
        
        console.log(`[checkAndGenerateCodeAttendance] Starting for session_id: ${session_id}`);
        
        if (class_mode === 'online' && !meeting_url) {
            return res.status(400).json({ message: 'URL meeting diperlukan untuk kelas online' });
        }
        
        // FIXED: Check if ANY code attendance exists for this session (valid or expired)
        const existingCodes = await CodeAttendance.getCodeAttendancesBySessionId(session_id);
        
        if (existingCodes && existingCodes.length > 0) {
            // Return the most recent existing code, regardless of expiration
            const latestCode = existingCodes[0];
            
            console.log(`[checkAndGenerateCodeAttendance] Found existing code, returning it`);
            
            return res.status(200).json({
                qrImage: latestCode.qr_image,
                token: latestCode.token,
                expiration_time: latestCode.expiration_time,
                meeting_url: latestCode.meeting_url,
                class_mode: class_mode || 'offline'
            });
        }

        // No existing code found, generate new one
        console.log(`[checkAndGenerateCodeAttendance] No existing code found, generating new one`);
        
        const session = await Session.getSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.create_user_id !== create_user_id) {
            return res.status(403).json({ message: 'Not authorized to generate QR Code for this session' });
        }

        const token = await generateUniqueToken();

        const qr_data = JSON.stringify({ 
            session_id, 
            token, 
            reff_user_id: create_user_id, 
            type_id: 1,
            meeting_url: class_mode === 'online' ? meeting_url : undefined
        });

        const expiration_time = new Date(Date.now() + 15 * 60 * 1000);
        const qrImageBuffer = await QRCode.toBuffer(qr_data);

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
        console.log(`[checkAndGenerateCodeAttendance] New code created with token: ${newCode.token}`);

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

// Existing validate functions remain the same
export const validateQRCode = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { qrCode, longitude, latitude }: ValidateQRCodeRequest = req.body;
        const user_id = req.user!.id;
        
        const qrData: QRCodeData = JSON.parse(qrCode);
        const { session_id, token, reff_user_id, type_id, meeting_url } = qrData;

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

        const response: any = { 
            message: 'QR Code valid! Presensi berhasil.'
        };

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

export const validateToken = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { token, longitude, latitude }: ValidateTokenRequest = req.body;
        const user_id = req.user!.id;
        
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
            type_id: 1,
            notes: generatenotes(1, user_id, session_id),
            latitude,
            longitude,
            session_id,
        };

        const result = await Attendance.createAttendance(attendanceData);

        const response: any = { 
            message: 'Token valid! Presensi berhasil.'
        };

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

// NEW: Get code attendances by session ID
export const getCodeAttendancesBySessionId = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { session_id } = req.query;
        
        const codes = await CodeAttendance.getCodeAttendancesBySessionId(parseInt(session_id as string));
        
        if (!codes || codes.length === 0) {
            return res.status(404).json({ message: 'No QR codes found for this session' });
        }
        
        res.json(codes);
    } catch (error) {
        console.error('Get Code Attendances By Session ID Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};