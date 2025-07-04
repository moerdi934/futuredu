// controllers/attendanceType.controller.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import * as AttendanceTypeModel from '../models/attendanceType.model';

// Mendapatkan semua tipe presensi
export const getAllAttendanceTypes = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const types = await AttendanceTypeModel.getAttendanceTypes();
    res.json(types);
  } catch (error) {
    console.error('Get All Attendance Types Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Mendapatkan tipe presensi berdasarkan ID
export const getAttendanceTypeById = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  try {
    const type = await AttendanceTypeModel.getAttendanceTypeById(id as string);
    if (!type) {
      return res.status(404).json({ message: 'Attendance Type not found' });
    }
    res.json(type);
  } catch (error) {
    console.error('Get Attendance Type By ID Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Membuat tipe presensi baru
export const createAttendanceType = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { type, description } = req.body;
  const create_user_id = req.user!.id;

  try {
    const newType = await AttendanceTypeModel.createAttendanceType({
      type,
      description,
      create_user_id
    });
    res.status(201).json(newType);
  } catch (error) {
    console.error('Create Attendance Type Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Mengupdate tipe presensi
export const updateAttendanceType = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { type, description } = req.body;
  const edit_user_id = req.user!.id;

  try {
    const existingType = await AttendanceTypeModel.getAttendanceTypeById(id as string);
    if (!existingType) {
      return res.status(404).json({ message: 'Attendance Type not found' });
    }

    const updatedType = await AttendanceTypeModel.updateAttendanceType(id as string, {
      type,
      description,
      edit_user_id,
    });
    res.json(updatedType);
  } catch (error) {
    console.error('Update Attendance Type Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Menghapus tipe presensi
export const deleteAttendanceType = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  try {
    const deletedType = await AttendanceTypeModel.deleteAttendanceType(id as string);
    if (!deletedType) {
      return res.status(404).json({ message: 'Attendance Type not found' });
    }
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Delete Attendance Type Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};