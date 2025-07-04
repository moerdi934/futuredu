// controllers/classes.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as ClassModel from '../models/classes.model';
import * as eventModel from '../models/event.model';
import { AuthenticatedRequest } from '../lib/middleware/auth';

// Types
export interface ClassQueryParams {
  sortField?: string;
  sortOrder?: string;
  search?: string;
  searchDate?: string;
  page?: string;
  limit?: string;
  status?: string;
  courseId?: string;
  teacherId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProcessedClass {
  id: number;
  event_id: number;
  starter_user_id: string;
  is_started: boolean;
  name: string;
  course_name: string;
  course_id: string;
  teacher_id: string;
  description: string;
  teacher_name: string;
  student_list_ids: number[];
  student_list_names: string[];
  students_display: string;
  date: string;
  start_time: string;
  end_time: string;
  real_start_datetime: string;
  real_end_datetime: string;
  creator: string;
  create_user_id: string;
  create_date: string;
  edit_user_id: string;
  edit_date: string;
  status: string;
}

export interface CreateClassRequest {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  create_user_id: string;
  teacher_id: string;
  student_list: number[];
}

export interface UpdateClassRequest {
  name: string;
  course_id: string;
  description: string;
  teacher_id: string;
  student_list_ids: number[];
  start_time: string;
  end_time: string;
  edit_user_id: string;
  event_id: string;
}

// Fungsi untuk mendapatkan semua kelas
export const getAllClasses = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const query = req.query as ClassQueryParams;
    const params = {
      sortField: query.sortField || 'id',
      sortOrder: query.sortOrder || 'asc',
      search: query.search || '',
      searchDate: query.searchDate || '',
      page: parseInt(query.page || '1'),
      limit: parseInt(query.limit || '10'),
      status: query.status || '',
      courseId: query.courseId || '',
      teacherId: query.teacherId || '',
      studentId: query.studentId || '',
      startDate: query.startDate || '',
      endDate: query.endDate || ''
    };
    
    console.log('test:', params.studentId);
    const { classes, total } = await ClassModel.getClasses(params);
    
    const processedClasses: ProcessedClass[] = classes.map((cls) => ({
      id: cls.id,
      event_id: cls.event_id,
      starter_user_id: cls.starter_user_id, 
      is_started: cls.is_started,
      name: cls.name,
      course_name: cls.course_name,
      course_id: cls.course_id,
      teacher_id: cls.teacher_id,
      description: cls.description,
      teacher_name: cls.teacher_name,
      student_list_ids: cls.student_list,
      student_list_names: cls.student_list_names,
      students_display:
        cls.student_list_names.join(', ').length > 20
          ? cls.student_list_names.join(', ').slice(0, 20) + '...'
          : cls.student_list_names.join(', '),
      date: new Date(cls.start_date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      start_time: new Date(cls.start_date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      end_time: new Date(cls.end_date).toLocaleTimeString('id-ID', {
        hour: '2-digit',  
        minute: '2-digit',
      }),
      real_start_datetime: cls.start_date,
      real_end_datetime: cls.end_date,
      creator: cls.creator_name,
      create_user_id: cls.create_user_id,
      create_date: cls.create_date,
      edit_user_id: cls.edit_user_id,
      edit_date: cls.edit_date,
      status: cls.status
    }));

    res.json({
      data: processedClasses,
      total,
      page: params.page,
      totalPages: Math.ceil(total / params.limit)
    });
  } catch (error) {
    console.error('Get All Classes Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
}; 

// Fungsi untuk mendapatkan kelas berdasarkan ID
export const getClassById = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  try {
    const cls = await ClassModel.getClassesById(id as string);
    if (!cls) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan' });
    }

    const processedClass = {
      id: cls.id,
      name: cls.name,
      course_name: cls.course_name,
      description: cls.description,
      teacher_name: cls.teacher_name,
      student_list_ids: cls.student_list,
      student_list_names: cls.student_list_names,
      students_display:
        cls.student_list_names.join(', ').length > 20
          ? cls.student_list_names.join(', ').slice(0, 20) + '...'
          : cls.student_list_names.join(', '),
      date: new Date(cls.start_date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      start_time: new Date(cls.start_date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      end_time: new Date(cls.end_date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      creator: cls.creator_name,
      create_user_id: cls.create_user_id,
      create_date: cls.create_date,
      edit_user_id: cls.edit_user_id,
      edit_date: cls.edit_date,
    };

    res.json(processedClass);
  } catch (error) {
    console.error('Get Class By ID Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
 
// Fungsi untuk membuat kelas baru
export const createClass = async (req: NextApiRequest, res: NextApiResponse) => {
  try { 
    const { name, description, start_date, end_date, create_user_id, teacher_id, student_list }: CreateClassRequest = req.body;
    const assign = [teacher_id, ...student_list];

    const newClass = await ClassModel.createClass(req.body);

    const classId = newClass.id;
    const newEvent = await eventModel.createEvent({
      title: name,
      notes: description,
      start_time: start_date,
      end_time: end_date,
      create_user_id: create_user_id,
      assigned_to: assign,
      starter_user_id: teacher_id,
      role: ["teacher", "student"],
      event_type: 1,
      master_id: classId
    });

    const responseObj = {
      ...newClass,
      event_id: newEvent.id,
      starter_user_id: newEvent.starter_user_id,
    };
    
    return res.status(201).json(responseObj);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Fungsi untuk mengupdate kelas
export const updateClass = async (req: NextApiRequest, res: NextApiResponse) => {
  const { event_id }: UpdateClassRequest = req.body;
  const { id } = req.query;

  try {
    const updatedClass = await ClassModel.updateClass(id as string, req.body);
    const updatedEvent = await eventModel.updateEvent(event_id, req.body);
    res.status(200).json(updatedClass);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Fungsi untuk menghapus kelas
export const deleteClass = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  try {
    // Cek keberadaan kelas
    const existingClass = await ClassModel.getClassesById(id as string);
    if (!existingClass) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan' });
    }

    // Cek hak akses
    // if (req.user.role !== 'admin' && existingClass.teacher_id !== req.user.user_id) {
    //   return res.status(403).json({ message: 'Akses ditolak: Anda tidak memiliki hak untuk menghapus kelas ini' });
    // }

    const deletedClass = await ClassModel.deleteClass(id as string);
    res.status(200).json(deletedClass);
  } catch (error) {
    console.error('Delete Class Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};