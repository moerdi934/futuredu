// controllers/examSchedule.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as examScheduleModel from '../models/examSchedule.model';
import { AuthenticatedRequest } from '../lib/middleware/auth';

export interface ApprovalRequest {
  approval_status: 'approved' | 'rejected';
  rejection_reason?: string;
}

export interface GoLiveRequest {
  product_type_id: number;
  price: number;
  stock: number;
  features: string[];
  classtype: string;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
  effective_start: string;
  effective_end?: string;
}

export interface DeleteRequest {
  delete_reason?: string;
}
const isAutoCreateSchedule = (description: string): boolean => {
  return description && description.trim().toUpperCase().startsWith('AUTOCREATE');
};

// Helper function to check if user can access exam schedule
const canUserAccessExamSchedule = (examScheduleData: any, userRole: string, userId: number): boolean => {
  if (userRole === 'admin') {
    return true;
  } else if (userRole === 'teacher') {
    return examScheduleData.created_by === userId.toString() || examScheduleData.approval_status === 'approved';
  } else if (userRole === 'student') {
    return examScheduleData.approval_status === 'approved';
  }
  return false;
};

// Helper function to check if user can modify exam schedule
const canUserModifyExamSchedule = (examScheduleData: any, userRole: string, userId: number): boolean => {
  if (userRole === 'admin') {
    return true;
  } else if (userRole === 'teacher') {
    return examScheduleData.created_by === userId.toString() && examScheduleData.approval_status === 'need_approve';
  }
  return false;
};

// Parse comma-separated multiple values
const parseMultipleValues = (value: string | string[]): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split(',').map(v => v.trim()).filter(v => v);
};

// Parse sort parameter (format: "key:direction,key2:direction")
const parseSortParam = (sortParam: string) => {
  if (!sortParam) return { sortKey: 'es.id', sortOrder: 'asc' };
  
  const sorts = sortParam.split(',');
  const firstSort = sorts[0].split(':');
  
  return {
    sortKey: firstSort[0] || 'es.id',
    sortOrder: firstSort[1] || 'asc'
  };
};

// Get exam schedules with comprehensive filters, sorting, and pagination
export const getExamSchedules = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const userRole = req.user?.role || 'student';
    const userId = req.user?.id?.toString();

    // Parse pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Parse global search
    const search = (req.query.search as string) || '';
    
    // Parse filters
    const exam_type = (req.query.exam_type as string) || 'All';
    const group_product = (req.query.group_product as string) || 'All';
    const series = (req.query.series as string) || 'All';
    const isfree = (req.query.isfree as string) || 'All';
    const is_valid = (req.query.is_valid as string) || 'All';
    const approvalStatus = (req.query.approvalStatus as string) || 'all';
    const includeDeleted = (req.query.includeDeleted as string) || 'false';
    
    // Parse date filters
    const start_time = (req.query.start_time as string) || null;
    const end_time = (req.query.end_time as string) || null;
    
    // Parse multiple creator filters
    const schedule_creator = parseMultipleValues(req.query.schedule_creator as string);
    const exam_creator = parseMultipleValues(req.query.exam_creator as string);
    
    // Parse name filter
    const schedule_name = (req.query.schedule_name as string) || '';
    
    // Parse sort parameter
    const { sortKey, sortOrder } = parseSortParam(req.query.sort as string);
    
    // Parse user filter
    const userIdFilter = (req.query.userId as string) || null;

    // Build filters object
    const filters = {
      page,
      limit,
      search,
      schedule_name,
      exam_type,
      group_product,
      series,
      isfree,
      is_valid,
      start_time,
      end_time,
      schedule_creator,
      exam_creator,
      sortKey,
      sortOrder,
      userId: userIdFilter,
      approvalStatus,
      includeDeleted,
      userRole
    };

    console.log('Controller filters:', filters);

    const result = await examScheduleModel.getExamSchedules(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching exam schedules:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const searchExamSchedules = async (req: NextApiRequest, res: NextApiResponse) => {
  const { 
    search = '', 
    limit = '10', 
    userId = null 
  } = req.query;
  
  console.log(req.query);
  try {
    const schedules = await examScheduleModel.searchExamSchedules(
      search as string, 
      parseInt(limit as string, 10), 
      userId as string
    );
    res.status(200).json({ data: schedules });
  } catch (error) {
    console.error('Error searching exam schedules:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const searchExamSchedulesByExamType = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { search, exam_type } = req.query;
    const examSchedules = await examScheduleModel.searchExamScheduleByExamType(
      search as string, 
      exam_type as string
    );
    
    return res.status(200).json({
      success: true,
      data: examSchedules,
      message: 'Exam schedules retrieved successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all valid exam schedules (is_valid = true)
export const getValidExamSchedules = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const userRole = req.user?.role || 'student';
    const userId = req.user?.id?.toString();
    const schedules = await examScheduleModel.getValidExamSchedules(userRole, userId);
    res.status(200).json(schedules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get exam schedule by ID
export const getExamScheduleById = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const userRole = req.user?.role || 'student';
  const userId = req.user?.id;

  try {
    const schedule = await examScheduleModel.getExamScheduleByIdWithAccess(
      id as string, 
      false, 
      userRole, 
      userId?.toString()
    );

    if (!schedule) {
      return res.status(404).json({ message: 'Jadwal ujian tidak ditemukan atau akses ditolak' });
    }

    // Check if exam schedule is soft deleted
    if (schedule.is_deleted) {
      return res.status(410).json({ 
        message: 'Jadwal ujian telah dihapus',
        delete_reason: schedule.delete_reason 
      });
    }

    // Check if this is an AUTOCREATE schedule and user is not admin
    if (userRole !== 'admin' && isAutoCreateSchedule(schedule.description)) {
      return res.status(404).json({ 
        message: 'Jadwal ujian tidak ditemukan atau akses ditolak' 
      });
    }

    res.status(200).json({
      ...schedule,
      is_free_exam: schedule.isfree === true,
      is_autocreate: isAutoCreateSchedule(schedule.description)
    });
  } catch (error: any) {
    console.error('Get exam schedule by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};
// Get exam schedules by exam type
export const getExamSchedulesByType = async (req: NextApiRequest, res: NextApiResponse) => {
  const { examtype } = req.query;
  try {
    const schedules = await examScheduleModel.getExamSchedulesByType(examtype as string);
    if (!schedules.length) {
      return res.status(404).json({ message: `No schedules found for exam type: ${examtype}` });
    }
    res.status(200).json(schedules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new exam schedule
export const createExamSchedule = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { 
    name, 
    description, 
    exam_id_list, 
    start_time, 
    end_time, 
    isfree, 
    is_valid, 
    created_by, 
    exam_type, // This comes from modal (product_type.id)
    exam_group_id, // This is also product_type.id
    is_auto_move, 
    is_need_order_exam, 
    is_need_weighted_score 
  } = req.body;
  
  console.log('Create Exam Schedule Request Body:', req.body);
  console.log('User:', req.user);
  
  const userRole = req.user?.role;
  const userId = req.user?.id;
  
  try {
    if (userRole !== 'teacher' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya guru dan admin yang dapat membuat jadwal ujian.'
      });
    }

    const isAutoCreate = isAutoCreateSchedule(description);

    // Use exam_type as product_type_id (it's already the ID from product_type table)
    const productTypeId = typeof exam_type === 'number' 
      ? exam_type 
      : parseInt(String(exam_type), 10);

    console.log('Product Type ID:', productTypeId, 'Type:', typeof productTypeId);

    if (isNaN(productTypeId)) {
      return res.status(400).json({
        success: false,
        message: 'Tipe ujian tidak valid'
      });
    }

    const newSchedule = await examScheduleModel.createExamSchedule(
      name, 
      description, 
      exam_id_list, 
      start_time, 
      end_time, 
      isfree, 
      is_valid, 
      userId?.toString() || created_by, 
      productTypeId, // Pass the product_type.id
      is_auto_move, 
      is_need_order_exam, 
      is_need_weighted_score,
      userRole
    );

    let responseMessage: string;
    if (isAutoCreate) {
      responseMessage = 'Jadwal ujian AUTOCREATE berhasil dibuat dan disetujui otomatis (tersembunyi dari tampilan umum)';
    } else if (newSchedule.approval_status === 'need_approve') {
      responseMessage = 'Jadwal ujian berhasil dibuat dan menunggu persetujuan admin';
    } else {
      responseMessage = 'Jadwal ujian berhasil dibuat dan disetujui otomatis';
    }

    res.status(201).json({
      ...newSchedule,
      message: responseMessage,
      is_autocreate: isAutoCreate
    });
  } catch (error: any) {
    console.error('Create exam schedule error:', error);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
// Update an existing exam schedule
export const updateExamSchedule = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { 
    name, 
    description, 
    exam_id_list, 
    start_time, 
    end_time, 
    is_valid, 
    updated_by, 
    exam_type // This is product_type.id
  } = req.body;

  const userRole = req.user?.role;
  const userId = req.user?.id;
  
  try {
    const existingSchedule = await examScheduleModel.getExamScheduleByIdWithAccess(
      id as string, 
      false, 
      userRole, 
      userId?.toString()
    );

    if (!existingSchedule) {
      return res.status(404).json({ message: 'Jadwal ujian tidak ditemukan atau akses ditolak' });
    }

    if (existingSchedule.is_deleted) {
      return res.status(410).json({ 
        message: 'Jadwal ujian telah dihapus dan tidak dapat diubah',
        delete_reason: existingSchedule.delete_reason 
      });
    }

    if (!canUserModifyExamSchedule(existingSchedule, userRole, userId)) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki hak untuk mengubah jadwal ujian ini' 
      });
    }

    if (userRole === 'teacher' && existingSchedule.approval_status !== 'need_approve') {
      return res.status(403).json({ 
        message: 'Jadwal ujian yang sudah disetujui tidak dapat diubah' 
      });
    }

    // Parse product_type_id
    const productTypeId = typeof exam_type === 'number' 
      ? exam_type 
      : parseInt(String(exam_type), 10);

    console.log('Update Product Type ID:', productTypeId, 'Type:', typeof productTypeId);

    if (isNaN(productTypeId)) {
      return res.status(400).json({
        success: false,
        message: 'Tipe ujian tidak valid'
      });
    }

    const updatedSchedule = await examScheduleModel.updateExamSchedule(
      id as string, 
      name, 
      description, 
      exam_id_list, 
      start_time, 
      end_time, 
      is_valid, 
      userId?.toString() || updated_by, 
      productTypeId, // Pass the product_type.id
      userRole
    );

    if (!updatedSchedule) {
      return res.status(404).json({ message: 'Jadwal ujian tidak ditemukan' });
    }

    const responseMessage = userRole === 'teacher' 
      ? 'Jadwal ujian berhasil diubah dan kembali memerlukan persetujuan admin'
      : 'Jadwal ujian berhasil diubah';

    res.status(200).json({
      ...updatedSchedule,
      message: responseMessage
    });
  } catch (error: any) {
    console.error('Update exam schedule error:', error);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Delete an exam schedule
export const deleteExamSchedule = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  try {
    const deletedSchedule = await examScheduleModel.deleteExamSchedule(id as string);
    if (!deletedSchedule) {
      return res.status(404).json({ message: 'Exam schedule not found' });
    }
    res.status(200).json({ message: 'Exam schedule deleted', schedule: deletedSchedule });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const searchExamTypeController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    let { search } = req.query;
    
    if (!search) {
      search = '';
    }

    const examTypes = await examScheduleModel.getExamScheduleTypes(search as string);
    
    res.status(200).json({
      examTypes: examTypes.map(row => ({ exam_type: row.exam_type }))
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
};

export const checkExamAccess = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const userId = req.user?.id;
  const { examId } = req.body;
  try {
    const access = await examScheduleModel.checkAccess(userId!, examId);

    if (access.accessGranted) {
      return res.status(200).json({ message: 'Access granted to the exam' });
    } else {
      return res.status(403).json({ message: 'Access denied. Purchase required.' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// New endpoints for form dropdowns
export const getExamTypesController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { search = '' } = req.query;
    const examTypes = await examScheduleModel.getExamTypes(search as string);
    
    res.status(200).json(examTypes.map(item => ({
      value: item.exam_type,
      label: item.exam_type
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSeriesController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { search = '' } = req.query;
    const series = await examScheduleModel.getSeries(search as string);
    
    res.status(200).json(series.map(item => ({
      value: item.series,
      label: item.series
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getScheduleCreatorsController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { search = '' } = req.query;
    const creators = await examScheduleModel.getScheduleCreators(search as string);
    
    res.status(200).json(creators.map(item => ({
      value: item.id,
      label: item.name
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getExamCreatorsController = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { search = '' } = req.query;
    const creators = await examScheduleModel.getExamCreators(search as string);
    
    res.status(200).json(creators.map(item => ({
      value: item.id,
      label: item.name
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const approveExamSchedule = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { approval_status, rejection_reason }: ApprovalRequest = req.body;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    console.log('Approve Exam Schedule Request:', { id, approval_status, rejection_reason, userRole, userId });

    // Only admin can approve exam schedules
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'Akses ditolak. Hanya admin yang dapat menyetujui jadwal ujian.' 
      });
    }

    // Check if exam schedule exists
    const existingSchedule = await examScheduleModel.getExamScheduleByIdWithAccess(id as string, false, 'admin');
    if (!existingSchedule) {
      return res.status(404).json({ message: 'Jadwal ujian tidak ditemukan' });
    }

    console.log('Existing Exam Schedule:', existingSchedule);

    // Check if exam schedule is already processed
    if (existingSchedule.approval_status !== 'need_approve') {
      return res.status(400).json({ 
        message: 'Jadwal ujian ini sudah diproses sebelumnya' 
      });
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
      rejection_reason: approval_status === 'rejected' ? rejection_reason : undefined
    };

    console.log('Approval Data:', approvalData);

    const approvedSchedule = await examScheduleModel.approveExamSchedule(id as string, approvalData);

    const successMessage = approval_status === 'approved' 
      ? `Jadwal ujian "${existingSchedule.name}" berhasil disetujui!`
      : `Jadwal ujian "${existingSchedule.name}" telah ditolak.`;

    res.status(200).json({
      ...approvedSchedule,
      message: successMessage
    });
  } catch (error) {
    console.error('Approve Exam Schedule Error:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get exam schedules that need approval (admin only)
export const getExamSchedulesNeedingApproval = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const userRole = req.user?.role;

  try {
    // Only admin can access this endpoint
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'Akses ditolak. Hanya admin yang dapat melihat jadwal ujian yang memerlukan persetujuan.' 
      });
    }

    const schedules = await examScheduleModel.getExamSchedulesNeedingApproval();
    
    const processedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      name: schedule.name,
      description: schedule.description,
      creator_name: schedule.creator_name,
      create_date: schedule.create_date,
      approval_status: schedule.approval_status,
      exam_id_list: schedule.exam_id_list
    }));

    res.json(processedSchedules);
  } catch (error) {
    console.error('Get Exam Schedules Needing Approval Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// Go live exam schedule (admin only)
export const goLiveExamSchedule = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const goLiveData: GoLiveRequest = req.body;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    // Only admin can make exam schedules go live
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat melakukan go-live jadwal ujian.'
      });
    }

    // Check if exam schedule exists and is approved
    const existingSchedule = await examScheduleModel.getExamScheduleByIdWithAccess(id as string, false, 'admin');
    if (!existingSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal ujian tidak ditemukan'
      });
    }

    if (existingSchedule.approval_status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Jadwal ujian harus disetujui terlebih dahulu sebelum go-live'
      });
    }

    if (existingSchedule.is_deleted) {
      return res.status(400).json({
        success: false,
        message: 'Jadwal ujian yang dihapus tidak dapat go-live'
      });
    }

    if (existingSchedule.is_live) {
      return res.status(400).json({
        success: false,
        message: 'Jadwal ujian sudah dalam status live'
      });
    }

    // Check if exam is free
    const isFreeExam = existingSchedule.isfree === true;

    // Modify goLiveData for free exams
    const processedGoLiveData = {
      ...goLiveData,
      price: isFreeExam ? 0 : goLiveData.price,
      is_promo: isFreeExam ? false : goLiveData.is_promo,
      no_promo_price: isFreeExam ? undefined : goLiveData.no_promo_price,
      promo_description: isFreeExam ? undefined : goLiveData.promo_description
    };

    // Validate required fields (skip price validation for free exams)
    if (!processedGoLiveData.product_type_id || !processedGoLiveData.effective_start) {
      return res.status(400).json({
        success: false,
        message: 'Product type dan tanggal mulai harus diisi'
      });
    }

    // Validate price only for paid exams
    if (!isFreeExam && (!processedGoLiveData.price || processedGoLiveData.price <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Harga harus lebih dari 0 untuk ujian berbayar'
      });
    }

    const result = await examScheduleModel.goLiveExamSchedule(id as string, processedGoLiveData);

    const examType = isFreeExam ? 'gratis' : 'berbayar';
    const successMessage = `Jadwal ujian ${examType} "${existingSchedule.name}" berhasil go-live!`;

    res.status(200).json({
      success: true,
      message: successMessage,
      data: {
        ...result,
        is_free_exam: isFreeExam,
        final_price: processedGoLiveData.price
      }
    });

  } catch (error: any) {
    console.error('Go Live Exam Schedule Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// Soft delete exam schedule
export const deleteExamScheduleWithApproval = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { delete_reason }: DeleteRequest = req.body;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    // Check exam schedule exists
    const existingSchedule = await examScheduleModel.getExamScheduleByIdWithAccess(
      id as string, 
      false, 
      userRole, 
      userId?.toString()
    );
    
    if (!existingSchedule) {
      return res.status(404).json({ message: 'Jadwal ujian tidak ditemukan atau akses ditolak' });
    }

    // Check if already deleted
    if (existingSchedule.is_deleted) {
      return res.status(410).json({ 
        message: 'Jadwal ujian sudah dihapus sebelumnya',
        delete_reason: existingSchedule.delete_reason 
      });
    }

    // Check if user can delete this exam schedule
    if (!canUserModifyExamSchedule(existingSchedule, userRole, userId)) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki hak untuk menghapus jadwal ujian ini' 
      });
    }

    // Perform soft delete
    const deletedSchedule = await examScheduleModel.softDeleteExamSchedule(
      id as string, 
      userId, 
      delete_reason || 'Dihapus oleh pengguna'
    );

    res.status(200).json({
      message: 'Jadwal ujian berhasil dihapus',
      data: deletedSchedule
    });
  } catch (error) {
    console.error('Delete Exam Schedule Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Restore exam schedule
export const restoreExamSchedule = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    // Check if exam schedule exists (including deleted ones)
    const existingSchedule = await examScheduleModel.getExamScheduleByIdWithAccess(id as string, true, 'admin');
    if (!existingSchedule) {
      return res.status(404).json({ message: 'Jadwal ujian tidak ditemukan' });
    }

    // Check if exam schedule is actually deleted
    if (!existingSchedule.is_deleted) {
      return res.status(400).json({ 
        message: 'Jadwal ujian ini tidak dalam status terhapus' 
      });
    }

    // Check permissions - same as delete permissions
    if (!canUserModifyExamSchedule(existingSchedule, userRole, userId)) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki hak untuk mengembalikan jadwal ujian ini' 
      });
    }

    // Perform restore
    const restoredSchedule = await examScheduleModel.restoreExamSchedule(id as string, userId);

    if (!restoredSchedule) {
      return res.status(400).json({ 
        message: 'Gagal mengembalikan jadwal ujian' 
      });
    }

    res.status(200).json({
      message: 'Jadwal ujian berhasil dikembalikan',
      data: restoredSchedule
    });
  } catch (error) {
    console.error('Restore Exam Schedule Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Updated getValidExamSchedules with role-based access
