// controllers/attendance.controller.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import * as AttendanceModel from '../models/attendance.model';

// Types
export interface MarkAttendanceRequest {
  reff_userid?: string | number;
  type_id: string | number;
  notes?: string;
  latitude?: string | number;
  longitude?: string | number;
  session_id?: string | number;
}

export interface UpdateAttendanceRequest {
  userid: string | number;
  reff_userid?: string | number;
  type_id: string | number;
  notes?: string;
  latitude?: string | number;
  longitude?: string | number;
}

// Fungsi untuk menandai presensi (teacher dan student)
export const markAttendance = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { reff_userid, type_id, notes, latitude, longitude, session_id }: MarkAttendanceRequest = req.body;

        // Ambil userid dari JWT hasil middleware
        const userid = req.user?.id;

        if (!userid) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated.',
            });
        }

        const attendanceData: AttendanceModel.AttendanceData = {
            userid,
            reff_userid,
            type_id,
            notes,
            latitude,
            longitude,
            session_id,
        };

        const result = await AttendanceModel.createAttendance(attendanceData);

        return res.status(201).json({
            success: true,
            message: 'Attendance marked successfully.',
            data: result,
        });
    } catch (error: any) {
        console.error('Error marking attendance:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while marking attendance.',
            error: error.message,
        });
    }
};

// Mendapatkan semua presensi
export const getAllAttendances = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
        const { userid, type_id, session_id } = req.query;
        
        const filters: AttendanceModel.AttendanceFilters = {};
        if (userid) filters.userid = userid as string;
        if (type_id) filters.type_id = type_id as string;
        if (session_id) filters.session_id = session_id as string;

        const attendances = await AttendanceModel.getAttendances(filters);
        res.json(attendances);
    } catch (error: any) {
        console.error('Get All Attendances Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Mendapatkan presensi berdasarkan ID
export const getAttendanceById = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const { id } = req.query;
    try {
        const attendance = await AttendanceModel.getAttendanceById(id as string);
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance not found' });
        }
        res.json(attendance);
    } catch (error: any) {
        console.error('Get Attendance By ID Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Mengupdate presensi
export const updateAttendance = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const { id } = req.query;
    const { userid, reff_userid, type_id, notes, latitude, longitude }: UpdateAttendanceRequest = req.body;

    try {
        const existingAttendance = await AttendanceModel.getAttendanceById(id as string);
        if (!existingAttendance) {
            return res.status(404).json({ message: 'Attendance not found' });
        }

        // Validasi hak akses (misalnya, hanya admin atau user yang bersangkutan yang bisa mengupdate)
        // Implementasikan sesuai kebutuhan

        const attendanceData: AttendanceModel.AttendanceData = {
            userid,
            reff_userid,
            type_id,
            notes,
            latitude,
            longitude,
        };

        const updatedAttendance = await AttendanceModel.updateAttendance(id as string, attendanceData);
        res.json(updatedAttendance);
    } catch (error: any) {
        console.error('Update Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Menghapus presensi
export const deleteAttendance = async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const { id } = req.query;
    try {
        const deletedAttendance = await AttendanceModel.deleteAttendance(id as string);
        if (!deletedAttendance) {
            return res.status(404).json({ message: 'Attendance not found' });
        }
        res.status(204).send(); // No Content
    } catch (error: any) {
        console.error('Delete Attendance Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};