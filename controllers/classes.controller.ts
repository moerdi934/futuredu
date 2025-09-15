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
  includeDeleted?: string;
  approvalStatus?: string;
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
  is_deleted: boolean;
  delete_reason?: string;
  // New fields
  approval_status: string;
  approve_user_id?: string;
  approve_date?: string;
  approver_name?: string;
  class_mode: string;
  meeting_url?: string;
}

export interface CreateClassRequest {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  create_user_id: string;
  teacher_id?: string;
  student_list: number[];
  course_id: string;
  class_mode?: string;
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
  class_mode?: string;
  meeting_url?: string;
}

export interface ApprovalRequest {
  approval_status: 'approved' | 'rejected';
  teacher_id?: string; // For admin approval, they can assign teacher
  rejection_reason?: string; // For rejected classes
}

export interface DeleteClassRequest {
  delete_reason?: string;
}

// Helper function to check if user can access class
const canUserAccessClass = (classData: any, userRole: string, userId: string): boolean => {
  if (userRole === 'admin') {
    return true;
  } else if (userRole === 'teacher') {
    return classData.create_user_id === userId || classData.teacher_id === userId;
  } else if (userRole === 'student') {
    return classData.create_user_id === userId || classData.student_list.includes(parseInt(userId));
  }
  return false;
};

// Helper function to check if user can modify class
const canUserModifyClass = (classData: any, userRole: string, userId: string): boolean => {
  if (userRole === 'admin') {
    return true;
  } else if (userRole === 'teacher') {
    return classData.create_user_id === userId || classData.teacher_id === userId;
  } else if (userRole === 'student') {
    // Students can only modify classes they created and are not approved yet
    return classData.create_user_id === userId && classData.approval_status === 'need_approve';
  }
  return false;
};

// Fungsi untuk mendapatkan semua kelas dengan role-based filtering
export const getAllClasses = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const query = req.query as ClassQueryParams;
    const userRole = req.user?.role;
    const userId = req.user?.id;

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
      endDate: query.endDate || '',
      includeDeleted: query.includeDeleted || 'false',
      approvalStatus: query.approvalStatus || 'all',
      // Role-based filtering
      userRole: userRole,
      userId: userId
    };
    
    console.log('Classes query params:', params);
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
      teacher_name: cls.teacher_name || 'Belum Ditentukan',
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
      status: cls.status,
      is_deleted: cls.is_deleted,
      delete_reason: cls.delete_reason,
      // New fields
      approval_status: cls.approval_status,
      approve_user_id: cls.approve_user_id,
      approve_date: cls.approve_date,
      approver_name: cls.approver_name,
      class_mode: cls.class_mode,
      meeting_url: cls.meeting_url
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
export const getClassById = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    const cls = await ClassModel.getClassesById(id as string, false, userRole, userId);
    if (!cls) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan atau akses ditolak' });
    }

    // Check if class is soft deleted
    if (cls.is_deleted) {
      return res.status(410).json({ 
        message: 'Kelas telah dihapus',
        delete_reason: cls.delete_reason 
      });
    }

    const processedClass = {
      id: cls.id,
      name: cls.name,
      course_name: cls.course_name,
      course_id: cls.course_id,
      teacher_id: cls.teacher_id,
      description: cls.description,
      teacher_name: cls.teacher_name || 'Belum Ditentukan',
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
      event_id: cls.event_id,
      starter_user_id: cls.starter_user_id,
      is_started: cls.is_started,
      status: cls.status,
      is_deleted: cls.is_deleted,
      delete_reason: cls.delete_reason,
      // New fields
      approval_status: cls.approval_status,
      approve_user_id: cls.approve_user_id,
      approve_date: cls.approve_date,
      approver_name: cls.approver_name,
      class_mode: cls.class_mode,
      meeting_url: cls.meeting_url
    };

    res.json(processedClass);
  } catch (error) {
    console.error('Get Class By ID Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
 
// Fungsi untuk membuat kelas baru dengan role-based logic
export const createClass = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try { 
    const { name, description, start_date, end_date, teacher_id, student_list, course_id, class_mode }: CreateClassRequest = req.body;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Determine approval status and teacher assignment based on role
    let finalTeacherId = teacher_id;
    let approvalStatus = 'approved'; // Default for admin

    if (userRole === 'student') {
      // Students can create classes but need approval and can't assign teacher
      finalTeacherId = null;
      approvalStatus = 'need_approve';
    } else if (userRole === 'teacher') {
      // Teachers can create classes and become the teacher, but might need approval
      if (!teacher_id) {
        finalTeacherId = userId; // Teacher becomes the teacher of their own class
      }
      // You can decide if teacher-created classes need approval
      approvalStatus = 'approved'; // Or 'need_approve' if you want teacher classes to need approval too
    }

    // Set create_user_id from authenticated user
    const classData = {
      name,
      description,
      start_date,
      end_date,
      teacher_id: finalTeacherId,
      student_list,
      course_id,
      create_user_id: userId,
      approval_status: approvalStatus,
      class_mode: class_mode || 'offline'
    };

    const newClass = await ClassModel.createClass(classData);

    // Only create event if class is approved
    let newEvent = null;
    if (approvalStatus === 'approved') {
      const assign = finalTeacherId ? [finalTeacherId, ...student_list] : student_list;

      newEvent = await eventModel.createEvent({
        title: name,
        notes: description,
        start_time: start_date,
        end_time: end_date,
        create_user_id: userId,
        assigned_to: assign,
        starter_user_id: finalTeacherId || userId,
        role: finalTeacherId ? ["teacher", "student"] : ["student"],
        event_type: 1,
        master_id: newClass.id
      });
    }

    const responseObj = {
      ...newClass,
      event_id: newEvent?.id || null,
      starter_user_id: newEvent?.starter_user_id || null,
      message: approvalStatus === 'need_approve' 
        ? 'Kelas berhasil dibuat dan menunggu persetujuan'
        : 'Kelas berhasil dibuat'
    };
    
    return res.status(201).json(responseObj);
  } catch (err: any) {
    console.error('Create Class Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Fungsi untuk mengupdate kelas
export const updateClass = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { event_id }: UpdateClassRequest = req.body;
  const { id } = req.query;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    // Check if class exists and is not deleted
    const existingClass = await ClassModel.getClassesById(id as string, false, userRole, userId);
    if (!existingClass) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan atau akses ditolak' });
    }

    if (existingClass.is_deleted) {
      return res.status(410).json({ 
        message: 'Kelas telah dihapus dan tidak dapat diubah',
        delete_reason: existingClass.delete_reason 
      });
    }

    // Check if user can modify this class
    if (!canUserModifyClass(existingClass, userRole, userId)) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki hak untuk mengubah kelas ini' 
      });
    }

    // Students can only edit classes that are not approved yet
    if (userRole === 'student' && existingClass.approval_status !== 'need_approve') {
      return res.status(403).json({ 
        message: 'Kelas yang sudah disetujui tidak dapat diubah' 
      });
    }

    // Add edit_user_id from authenticated user
    const updateData = {
      ...req.body,
      edit_user_id: userId
    };

    const updatedClass = await ClassModel.updateClass(id as string, updateData);
    
    // Update event if it exists
    if (event_id && existingClass.approval_status === 'approved') {
      const updatedEvent = await eventModel.updateEvent(event_id, updateData);
    }
    
    res.status(200).json(updatedClass);
  } catch (err: any) {
    console.error('Update Class Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Fungsi untuk approve/reject kelas
export const approveClass = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { approval_status, teacher_id, rejection_reason }: ApprovalRequest = req.body;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    console.log('Approve Class Request:', { id, approval_status, teacher_id, userRole, userId });

    // Check if class exists
    const existingClass = await ClassModel.getClassesById(id , false, 'admin'); // Use admin to bypass filtering
    if (!existingClass) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan' });
    }

    console.log('Existing Class:', existingClass);

    // Check if class is already processed
    if (existingClass.approval_status !== 'need_approve') {
      return res.status(400).json({ 
        message: 'Kelas ini sudah diproses sebelumnya' 
      });
    }

    // Check permissions
    let canApprove = false;
    if (userRole === 'admin') {
      canApprove = true;
    } else if (userRole === 'teacher') {
      // Teachers can only approve classes where teacher_id is null (student-created without teacher)
      canApprove = existingClass.teacher_id === null || existingClass.teacher_id === '' || existingClass.teacher_id === undefined;
    }

    if (!canApprove) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki hak untuk menyetujui kelas ini' 
      });
    }

    // For teacher approval, they become the teacher automatically
    let finalTeacherId = teacher_id;
    if (userRole === 'teacher' && approval_status === 'approved') {
      finalTeacherId = userId.toString();
    }

    // Validation for rejection
    if (approval_status === 'rejected' && !rejection_reason?.trim()) {
      return res.status(400).json({
        message: 'Alasan penolakan harus diisi'
      });
    }

    const approvalData = {
      approval_status,
      approve_user_id: userId.toString(),
      teacher_id: finalTeacherId,
      rejection_reason: approval_status === 'rejected' ? rejection_reason : undefined
    };

    console.log('Approval Data:', approvalData);

    const approvedClass = await ClassModel.approveClass(id as string, approvalData);

    // Create event if approved
    if (approval_status === 'approved') {
      const assign = finalTeacherId 
        ? [finalTeacherId, ...existingClass.student_list]
        : existingClass.student_list;

      const newEvent = await eventModel.createEvent({
        title: existingClass.name,
        notes: existingClass.description,
        start_time: existingClass.start_date,
        end_time: existingClass.end_date,
        create_user_id: existingClass.create_user_id,
        assigned_to: assign,
        starter_user_id: finalTeacherId || existingClass.create_user_id,
        role: finalTeacherId ? ["teacher", "student"] : ["student"],
        event_type: 1,
        master_id: existingClass.id
      });

      res.status(200).json({
        ...approvedClass,
        event_id: newEvent.id,
        message: 'Kelas berhasil disetujui'
      });
    } else {
      res.status(200).json({
        ...approvedClass,
        message: 'Kelas telah ditolak'
      });
    }
  } catch (error) {
    console.error('Approve Class Error:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Fungsi untuk mendapatkan kelas yang membutuhkan approval
export const getClassesNeedingApproval = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    // Only admin and teacher can access this endpoint
    if (userRole !== 'admin' && userRole !== 'teacher') {
      return res.status(403).json({ 
        message: 'Akses ditolak' 
      });
    }

    const classes = await ClassModel.getClassesNeedingApproval(userRole, userId?.toString());
    
    const processedClasses = classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      course_name: cls.course_name,
      description: cls.description,
      teacher_name: cls.teacher_name || 'Belum Ditentukan',
      creator_name: cls.creator_name,
      create_date: cls.create_date,
      start_date: cls.start_date,
      end_date: cls.end_date,
      approval_status: cls.approval_status
    }));

    res.json(processedClasses);
  } catch (error) {
    console.error('Get Classes Needing Approval Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Fungsi untuk soft delete kelas
export const deleteClass = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { delete_reason }: DeleteClassRequest = req.body;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    // Cek keberadaan kelas
    const existingClass = await ClassModel.getClassesById(id as string, false, userRole, userId);
    if (!existingClass) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan atau akses ditolak' });
    }

    // Check if already deleted
    if (existingClass.is_deleted) {
      return res.status(410).json({ 
        message: 'Kelas sudah dihapus sebelumnya',
        delete_reason: existingClass.delete_reason 
      });
    }

    // Check if user can delete this class
    if (!canUserModifyClass(existingClass, userRole, userId)) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki hak untuk menghapus kelas ini' 
      });
    }

    // Perform soft delete
    const deletedClass = await ClassModel.softDeleteClass(
      id as string, 
      userId.toString(), 
      delete_reason || 'Dihapus oleh pengguna'
    );

    res.status(200).json({
      message: 'Kelas berhasil dihapus',
      data: deletedClass
    });
  } catch (error) {
    console.error('Delete Class Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Fungsi untuk restore kelas
export const restoreClass = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    // Check if class exists (including deleted ones)
    const existingClass = await ClassModel.getClassesById(id as string, true, 'admin'); // Use admin to bypass filtering for deleted
    if (!existingClass) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan' });
    }

    // Check if class is actually deleted
    if (!existingClass.is_deleted) {
      return res.status(400).json({ 
        message: 'Kelas ini tidak dalam status terhapus' 
      });
    }

    // Check permissions - same as delete permissions
    if (!canUserModifyClass(existingClass, userRole, userId)) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki hak untuk mengembalikan kelas ini' 
      });
    }

    // Perform restore
    const restoredClass = await ClassModel.restoreClass(id as string, userId.toString());

    if (!restoredClass) {
      return res.status(400).json({ 
        message: 'Gagal mengembalikan kelas' 
      });
    }

    res.status(200).json({
      message: 'Kelas berhasil dikembalikan',
      data: restoredClass
    });
  } catch (error) {
    console.error('Restore Class Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};