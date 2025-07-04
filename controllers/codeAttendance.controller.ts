// controllers/codeAttendance.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as CodeAttendance from '../models/codeAttendance.model';
import { generateUniqueToken } from '../utils/attendanceTokenGenerator'; // Import fungsi token generator
import QRCode from 'qrcode';
import * as Session from '../models/session.model';
import * as Attendance from '../models/attendance.model';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../lib/middleware/auth';

// Types
export interface QRCodeData {
  session_id: number;
  token: string;
  reff_user_id: string;
  type_id: number;
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

// Mendapatkan semua code attendances
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

// Mendapatkan code attendance berdasarkan ID
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
 
// Membuat code attendance baru (Generate QR Code)
export const createCodeAttendance = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { session_id } = req.query;
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

        // Generate token unik 8 digit
        const token = await generateUniqueToken();

        // Buat qr_data (misalnya JSON string)
        const qr_data = JSON.stringify({ 
            session_id: parseInt(session_id as string), 
            token, 
            reff_user_id: create_user_id,
            type_id: 1 
        });

        // Tentukan expiration_time (misalnya 15 menit dari sekarang)
        const expiration_time = new Date(Date.now() + 15 * 60 * 1000); // 15 menit
        const qrImageBuffer = await QRCode.toBuffer(qr_data); // Menghasilkan buffer QR Code dalam format bytea

        // Insert code attendance
        const codeData: CodeAttendance.CreateCodeAttendanceData = {
            session_id: parseInt(session_id as string),
            event_id: session.eventid,
            create_user_id,
            qr_data,
            token,
            expiration_time,
            status: 'active',
            qr_image: qrImageBuffer
        };

        const newCode = await CodeAttendance.createCodeAttendance(codeData);

        // Generate QR Code image sebagai data URL
        const qrImage = await QRCode.toDataURL(qr_data);

        res.status(201).json({ qrImage, token, expiration_time });
    } catch (error) {
        console.error('Create Code Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Mengupdate status code attendance (misalnya 'used' setelah digunakan)
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

// Fungsi untuk mengecek apakah ada code attendance yang valid
export const checkAndGenerateFromEventCodeAttendance = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { event_id } = req.query;
        const create_user_id = req.user!.id;
        
        const eventsession = await Session.getSessionByEventId(parseInt(event_id as string));
        if (!eventsession) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const session_id = eventsession.id;
        // Cek apakah sudah ada code attendance yang valid
        const latestValidCode = await CodeAttendance.getValidCodeAttendances(session_id);

        if (latestValidCode) {
            // Jika ada code attendance yang masih valid, kirimkan data yang sudah ada
            return res.status(200).json({
                qrImage: latestValidCode.qr_image, // Kirimkan gambar QR Code yang sudah ada
                token: latestValidCode.token,
                expiration_time: latestValidCode.expiration_time,
            });
        }

        // Jika tidak ada code attendance yang valid, buat yang baru
        // Validasi sesi
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

        // Buat qr_data (misalnya JSON string)
        const qr_data = JSON.stringify({ session_id, token, reff_user_id: create_user_id, type_id: 1 });

        // Tentukan expiration_time (misalnya 15 menit dari sekarang)
        const expiration_time = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

        // Generate QR Code image sebagai buffer (bytea)
        const qrImageBuffer = await QRCode.toBuffer(qr_data); // Menghasilkan buffer QR Code dalam format bytea

        // Insert code attendance
        const codeData: CodeAttendance.CreateCodeAttendanceData = {
            session_id,
            event_id: session.eventid,
            create_user_id,
            qr_data,
            token,
            expiration_time,
            status: 'active',
            qr_image: qrImageBuffer, // Simpan gambar QR Code dalam bentuk buffer
        };

        const newCode = await CodeAttendance.createCodeAttendance(codeData);

        res.status(201).json({
            qrImage: `data:image/png;base64,${newCode.qr_image.toString('base64')}`,
            token: newCode.token,
            expiration_time: newCode.expiration_time,
        });
    } catch (error) {
        console.error('Check and Generate Code Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const checkAndGenerateCodeAttendance = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { id } = req.query;
        const create_user_id = req.user!.id;
        const session_id = parseInt(id as string);
        
        // Cek apakah sudah ada code attendance yang valid
        const latestValidCode = await CodeAttendance.getValidCodeAttendances(session_id);

        if (latestValidCode) {
            // Jika ada code attendance yang masih valid, kirimkan data yang sudah ada
            return res.status(200).json({
                qrImage: latestValidCode.qr_image, // Kirimkan gambar QR Code yang sudah ada
                token: latestValidCode.token,
                expiration_time: latestValidCode.expiration_time,
            });
        }

        // Jika tidak ada code attendance yang valid, buat yang baru
        // Validasi sesi
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

        // Buat qr_data (misalnya JSON string)
        const qr_data = JSON.stringify({ session_id, token, reff_user_id: create_user_id, type_id: 1 });

        // Tentukan expiration_time (misalnya 15 menit dari sekarang)
        const expiration_time = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

        // Generate QR Code image sebagai buffer (bytea)
        const qrImageBuffer = await QRCode.toBuffer(qr_data); // Menghasilkan buffer QR Code dalam format bytea

        // Insert code attendance
        const codeData: CodeAttendance.CreateCodeAttendanceData = {
            session_id,
            event_id: session.eventid,
            create_user_id,
            qr_data,
            token,
            expiration_time,
            status: 'active',
            qr_image: qrImageBuffer, // Simpan gambar QR Code dalam bentuk buffer
        };

        const newCode = await CodeAttendance.createCodeAttendance(codeData);

        res.status(201).json({
            qrImage: `data:image/png;base64,${newCode.qr_image.toString('base64')}`,
            token: newCode.token,
            expiration_time: newCode.expiration_time,
        });
    } catch (error) {
        console.error('Check and Generate Code Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const validateQRCode = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { qrCode, longitude, latitude }: ValidateQRCodeRequest = req.body;
        const user_id = req.user!.id;
        
        const qrData: QRCodeData = JSON.parse(qrCode); // Mengambil data JSON dari QR Code
        const { session_id, token, reff_user_id, type_id } = qrData;

        // Cek apakah QR Code valid
        const codeAttendance = await CodeAttendance.getCodeAttendanceByToken(token);

        if (!codeAttendance || new Date(codeAttendance.expiration_time) < new Date()) {
            return res.status(400).json({ message: 'QR Code tidak valid atau sudah kadaluarsa.' });
        }

        const session = await Session.getSessionById(session_id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const assignedUsers = session.assigned_to || []; // Handle null/undefined
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
        return res.status(200).json({ message: 'QR Code valid! Presensi berhasil.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan dalam memvalidasi QR Code.' });
    }
};

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

        const assignedUsers = session.assigned_to || []; // Handle null/undefined
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
        return res.status(200).json({ message: 'Token valid! Presensi berhasil.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan dalam memvalidasi token.' });
    }
};