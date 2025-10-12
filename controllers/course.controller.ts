// controllers/course.controller.ts - Updated with Approval System
import { NextApiRequest, NextApiResponse } from 'next';
import * as Course from '../models/course.model';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import pool from '../lib/db';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import * as examModel from '../models/exam.model';
import * as examScheduleModel from '../models/examSchedule.model';

// Types
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface CourseDetailResponse {
  courseId: number;
  title: string;
  description: string;
  imageurl?: string;
  learningPoint?: any[];
  sections: SectionResponse[];
}

export interface SectionResponse {
  id: number;
  title: string;
  description?: string;
  durasi?: number;
  position: number;
  topics: TopicResponse[];
}

export interface TopicResponse {
  id: number;
  title: string;
  position: number;
  materials: MaterialResponse[];
  quiz: {
    examId: number | null;
    questions: Array<{ id: number; code: string }>;
  };
  drill: {
    examId: number | null;
    questions: Array<{ id: number; code: string }>;
  };
}

export interface MaterialResponse {
  id: number;
  title: string;
  content?: string;
  isMandatory?: boolean;
  hasVideo?: boolean;
  videoType?: string;
  videoUrl?: string;
  videoFileName?: string;
  position: number;
}

// New types for approval system
export interface CourseQueryParams {
  sortField?: string;
  sortOrder?: string;
  search?: string;
  page?: string;
  limit?: string;
  approvalStatus?: string;
  includeDeleted?: string;
}

export interface ProcessedCourse {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  courseUrl?: string;
  learning_point?: any[];
  creator_name?: string;
  create_user_id?: number;
  create_date?: string;
  edit_user_id?: number;
  edit_date?: string;
  approval_status: string;
  approve_user_id?: number;
  approve_date?: string;
  approver_name?: string;
  rejection_reason?: string;
  is_deleted: boolean;
  delete_reason?: string;
  delete_user_id?: number;
  delete_date?: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  imageUrl?: string;
  learning_point?: any[];
  sections?: any[];
  learningPoints?: any[];
}

export interface UpdateCourseRequest {
  title: string;
  description: string;
  imageUrl?: string;
  learning_point?: any[];
}

export interface ApprovalRequest {
  approval_status: 'approved' | 'rejected';
  rejection_reason?: string;
}

export interface DeleteCourseRequest {
  delete_reason?: string;
}

// Configure multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Optional: 100MB file size limit
}).any();

// Helper function to check if user can access course
const canUserAccessCourse = (courseData: any, userRole: string, userId: number): boolean => {
  if (userRole === 'admin') {
    return true;
  } else if (userRole === 'teacher') {
    return courseData.create_user_id === userId || courseData.approval_status === 'approved';
  } else if (userRole === 'student') {
    return courseData.approval_status === 'approved';
  }
  return false;
};

// Helper function to check if user can modify course
const canUserModifyCourse = (courseData: any, userRole: string, userId: number): boolean => {
  if (userRole === 'admin') {
    return true;
  } else if (userRole === 'teacher') {
    return courseData.create_user_id === userId && courseData.approval_status === 'need_approve';
  }
  return false;
};
const isNewId = (id: any): boolean => {
  return typeof id === 'number' && id.toString().length === 13;
};


// Get all courses with role-based filtering and approval system
// Get all courses with role-based filtering and approval system
export const getAllCoursesWithApproval = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const query = req.query as CourseQueryParams;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const params = {
      sortField: query.sortField || 'id',
      sortOrder: query.sortOrder || 'asc',
      search: query.search || '',
      page: parseInt(query.page || '1'),
      limit: parseInt(query.limit || '10'),
      approvalStatus: query.approvalStatus || 'all',
      includeDeleted: query.includeDeleted || 'false',
      liveStatus: query.liveStatus || 'all',
      userRole: userRole,
      userId: userId?.toString()
    };

    console.log('Courses query params:', params);
    const { courses, total } = await Course.getAll(params);

    // Process courses based on role
    let processedCourses;

    if (userRole === 'student') {
      // For students: only show entitled courses with limited fields
      processedCourses = courses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        courseUrl: course.courseUrl,
        learning_point: course.learning_point,
        section_count: parseInt(course.section_count) || 0,
        section_string: course.section_string || '',
        topic_count: parseInt(course.topic_count) || 0,
        material_count: parseInt(course.material_count) || 0,
        mandatory_material_count: parseInt(course.mandatory_material_count) || 0,
        optional_material_count: parseInt(course.optional_material_count) || 0,
        total_duration_minutes: parseInt(course.total_duration_minutes) || 0,
        // Entitlement information
        granted_at: course.granted_at,
        expires_at: course.expires_at,
        entitlement_metadata: course.entitlement_metadata,
        is_entitled_active: course.is_entitled_active
      }));
    } else {
      // For admin and teacher: show all fields including management data
      processedCourses = courses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        courseUrl: course.courseUrl,
        learning_point: course.learning_point,
        creator_name: course.creator_name || 'Unknown',
        create_user_id: course.create_user_id,
        create_date: course.create_date,
        edit_user_id: course.edit_user_id,
        edit_date: course.edit_date,
        approval_status: course.approval_status,
        approve_user_id: course.approve_user_id,
        approve_date: course.approve_date,
        approver_name: course.approver_name,
        rejection_reason: course.rejection_reason,
        is_deleted: course.is_deleted,
        delete_reason: course.delete_reason,
        delete_user_id: course.delete_user_id,
        delete_date: course.delete_date,
        is_live: course.is_live,
        live_since: course.live_since,
        // Aggregated fields
        section_count: parseInt(course.section_count) || 0,
        section_string: course.section_string || '',
        topic_count: parseInt(course.topic_count) || 0,
        material_count: parseInt(course.material_count) || 0,
        mandatory_material_count: parseInt(course.mandatory_material_count) || 0,
        optional_material_count: parseInt(course.optional_material_count) || 0,
        total_duration_minutes: parseInt(course.total_duration_minutes) || 0,
        // Entitlement counts for admin/teacher
        entitled_users_count: parseInt(course.entitled_users_count) || 0,
        active_entitled_count: parseInt(course.active_entitled_count) || 0
      }));
    }

    res.json({
      data: processedCourses,
      total,
      page: params.page,
      totalPages: Math.ceil(total / params.limit)
    });
  } catch (error) {
    console.error('Get All Courses Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get course by ID with role-based access
export const getCourseByIdWithApproval = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    const course = await Course.getCourseById(parseInt(id as string), false, userRole, userId?.toString());
    if (!course) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan atau akses ditolak' });
    }

    // Check if course is soft deleted
    if (course.is_deleted) {
      return res.status(410).json({ 
        message: 'Kursus telah dihapus',
        delete_reason: course.delete_reason 
      });
    }

    const processedCourse: ProcessedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl,
      courseUrl: course.courseUrl,
      learning_point: course.learning_point,
      creator_name: course.creator_name || 'Unknown',
      create_user_id: course.create_user_id,
      create_date: course.create_date,
      edit_user_id: course.edit_user_id,
      edit_date: course.edit_date,
      approval_status: course.approval_status,
      approve_user_id: course.approve_user_id,
      approve_date: course.approve_date,
      approver_name: course.approver_name,
      rejection_reason: course.rejection_reason,
      is_deleted: course.is_deleted,
      delete_reason: course.delete_reason,
      delete_user_id: course.delete_user_id,
      delete_date: course.delete_date
    };

    res.json(processedCourse);
  } catch (error) {
    console.error('Get Course By ID Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create course with approval system
export const createCourseWithApproval = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { title, description, imageUrl, learning_point }: CreateCourseRequest = req.body;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Only teachers and admins can create courses
    if (userRole !== 'teacher' && userRole !== 'admin') {
      return res.status(403).json({
        message: 'Akses ditolak. Hanya guru dan admin yang dapat membuat kursus.'
      });
    }

    // Determine approval status based on role
    let approvalStatus = 'need_approve';
    if (userRole === 'admin') {
      approvalStatus = 'approved'; // Admin courses are auto-approved
    }

    const courseData = {
      title,
      description,
      imageUrl,
      create_user_id: userId,
      learning_point,
      approval_status: approvalStatus,
      user_role: userRole // Pass user role for auto-approval logic
    };

    const newCourse = await Course.createCourse(courseData);

    const responseMessage = approvalStatus === 'need_approve' 
      ? 'Kursus berhasil dibuat dan menunggu persetujuan admin'
      : 'Kursus berhasil dibuat dan disetujui otomatis';

    return res.status(201).json({
      ...newCourse,
      message: responseMessage
    });
  } catch (err: any) {
    console.error('Create Course Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update course with approval system
export const updateCourseWithApproval = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { title, description, imageUrl, learning_point }: UpdateCourseRequest = req.body;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    // Check if course exists and is not deleted
    const existingCourse = await Course.getCourseById(parseInt(id as string), false, userRole, userId?.toString());
    if (!existingCourse) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan atau akses ditolak' });
    }

    if (existingCourse.is_deleted) {
      return res.status(410).json({ 
        message: 'Kursus telah dihapus dan tidak dapat diubah',
        delete_reason: existingCourse.delete_reason 
      });
    }

    // Check if user can modify this course
    if (!canUserModifyCourse(existingCourse, userRole, userId)) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki hak untuk mengubah kursus ini' 
      });
    }

    // Teachers can only edit courses that are not approved yet
    if (userRole === 'teacher' && existingCourse.approval_status !== 'need_approve') {
      return res.status(403).json({ 
        message: 'Kursus yang sudah disetujui tidak dapat diubah' 
      });
    }

    const updateData = {
      id: parseInt(id as string),
      title,
      description,
      imageUrl,
      edit_user_id: userId,
      learning_point
    };

    const updatedCourse = await Course.updateCourse(updateData);
    
    res.status(200).json(updatedCourse);
  } catch (err: any) {
    console.error('Update Course Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Approve or reject course (admin only)
export const approveCourse = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { approval_status, rejection_reason }: ApprovalRequest = req.body;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    console.log('Approve Course Request:', { id, approval_status, rejection_reason, userRole, userId });

    // Only admin can approve courses
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'Akses ditolak. Hanya admin yang dapat menyetujui kursus.' 
      });
    }

    // Check if course exists
    const existingCourse = await Course.getCourseById(parseInt(id as string), false, 'admin'); // Use admin to bypass filtering
    if (!existingCourse) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }

    console.log('Existing Course:', existingCourse);

    // Check if course is already processed
    if (existingCourse.approval_status !== 'need_approve') {
      return res.status(400).json({ 
        message: 'Kursus ini sudah diproses sebelumnya' 
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

    const approvedCourse = await Course.approveCourse(parseInt(id as string), approvalData);

    const successMessage = approval_status === 'approved' 
      ? `Kursus "${existingCourse.title}" berhasil disetujui!`
      : `Kursus "${existingCourse.title}" telah ditolak.`;

    res.status(200).json({
      ...approvedCourse,
      message: successMessage
    });
  } catch (error) {
    console.error('Approve Course Error:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get courses that need approval (admin only)
export const getCoursesNeedingApproval = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const userRole = req.user?.role;

  try {
    // Only admin can access this endpoint
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'Akses ditolak. Hanya admin yang dapat melihat kursus yang memerlukan persetujuan.' 
      });
    }

    const courses = await Course.getCoursesNeedingApproval();
    
    const processedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      creator_name: course.creator_name,
      create_date: course.create_date,
      approval_status: course.approval_status,
      learning_point: course.learning_point
    }));

    res.json(processedCourses);
  } catch (error) {
    console.error('Get Courses Needing Approval Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Soft delete course
export const deleteCourseWithApproval = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { delete_reason }: DeleteCourseRequest = req.body;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    // Check course exists
    const existingCourse = await Course.getCourseById(parseInt(id as string), false, userRole, userId?.toString());
    if (!existingCourse) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan atau akses ditolak' });
    }

    // Check if already deleted
    if (existingCourse.is_deleted) {
      return res.status(410).json({ 
        message: 'Kursus sudah dihapus sebelumnya',
        delete_reason: existingCourse.delete_reason 
      });
    }

    // Check if user can delete this course
    if (!canUserModifyCourse(existingCourse, userRole, userId)) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki hak untuk menghapus kursus ini' 
      });
    }

    // Perform soft delete
    const deletedCourse = await Course.softDeleteCourse(
      parseInt(id as string), 
      userId, 
      delete_reason || 'Dihapus oleh pengguna'
    );

    res.status(200).json({
      message: 'Kursus berhasil dihapus',
      data: deletedCourse
    });
  } catch (error) {
    console.error('Delete Course Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Restore course
export const restoreCourse = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  try {
    // Check if course exists (including deleted ones)
    const existingCourse = await Course.getCourseById(parseInt(id as string), true, 'admin'); // Use admin to bypass filtering for deleted
    if (!existingCourse) {
      return res.status(404).json({ message: 'Kursus tidak ditemukan' });
    }

    // Check if course is actually deleted
    if (!existingCourse.is_deleted) {
      return res.status(400).json({ 
        message: 'Kursus ini tidak dalam status terhapus' 
      });
    }

    // Check permissions - same as delete permissions
    if (!canUserModifyCourse(existingCourse, userRole, userId)) {
      return res.status(403).json({ 
        message: 'Anda tidak memiliki hak untuk mengembalikan kursus ini' 
      });
    }

    // Perform restore
    const restoredCourse = await Course.restoreCourse(parseInt(id as string), userId);

    if (!restoredCourse) {
      return res.status(400).json({ 
        message: 'Gagal mengembalikan kursus' 
      });
    }

    res.status(200).json({
      message: 'Kursus berhasil dikembalikan',
      data: restoredCourse
    });
  } catch (error) {
    console.error('Restore Course Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Keep existing functions for backward compatibility
export const getAllCourses = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const courses = await Course.getAll();
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const searchAllCourses = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const search = (req.query.search as string) || '';
    const courses = await Course.searchAll(search);
    // Only send id and title for search purposes
    const simplifiedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
    }));
    res.json(simplifiedCourses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFilterCourses = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const type = req.query.grp as string;
    const search = (req.query.search as string) || '';
    const courses = await Course.getFilterCourses(type, search);
    res.status(200).json({ courses });
  } catch (error: any) {
    console.error('Error fetching group products:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Alternative method to get data in more readable format
export const getCourseDetailReadable = async (req: NextApiRequest, res: NextApiResponse) => {
  const client = await pool.connect();
  
  try {
    const { courseId } = req.query;
    
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Add approval status check to the query
    const query = `
      SELECT 
        c.id as course_id, 
        c.title as course_title, 
        c.description as course_description,
        c.imageurl as course_imageurl,
        c.learning_point as course_learning_point,
        c.approval_status,
        c.is_deleted,
        s.id as section_id, 
        s.title as section_title, 
        s.description as section_description,
        s.time as durasi,
        s.position as section_position,
        t.id as topic_id,
        t.title as topic_title, 
        t.position as topic_position,
        t.quiz_id,
        t.drill_id,
        m.id as material_id, 
        m.title as material_title, 
        m.content as material_content,
        m.is_mandatory, 
        m.has_video, 
        m.video_type, 
        m.video_url, 
        m.video_file_name, 
        m.position as material_position,
        -- Quiz exam data
        e_quiz.id as quiz_exam_id,
        CASE WHEN es_quiz.id IS NOT NULL THEN 
          (SELECT array_agg(
            json_build_object('id', q_quiz.id, 'code', q_quiz.code)
            ORDER BY q_quiz.id
          )
          FROM unnest(e_quiz.question_id_list) as quiz_q_id
          JOIN questions q_quiz ON q_quiz.id = quiz_q_id)
        ELSE NULL END as quiz_questions,
        -- Drill exam data
        e_drill.id as drill_exam_id,
        CASE WHEN es_drill.id IS NOT NULL THEN 
          (SELECT array_agg(
            json_build_object('id', q_drill.id, 'code', q_drill.code)
            ORDER BY q_drill.id
          )
          FROM unnest(e_drill.question_id_list) as drill_q_id
          JOIN questions q_drill ON q_drill.id = drill_q_id)
        ELSE NULL END as drill_questions
      FROM courses c 
      LEFT JOIN sections s ON s.course_id = c.id 
      LEFT JOIN topics t ON t.section_id = s.id 
      LEFT JOIN materials m ON m.topic_id = t.id 
      LEFT JOIN exam_schedule es_quiz ON es_quiz.id = t.quiz_id 
      LEFT JOIN exam_schedule es_drill ON es_drill.id = t.drill_id
      LEFT JOIN unnest(es_quiz.exam_id_list) as quiz_exam_id ON true
      LEFT JOIN exams e_quiz ON e_quiz.id = quiz_exam_id
      LEFT JOIN unnest(es_drill.exam_id_list) as drill_exam_id ON true  
      LEFT JOIN exams e_drill ON e_drill.id = drill_exam_id
      WHERE c.id = $1 
        AND c.approval_status = 'approved' 
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
      ORDER BY s.position, t.position, m.position
    `;

    const result = await client.query(query, [courseId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found or not approved' });
    }

    const sectionsMap = new Map();
    const topicsMap = new Map();
    const materialsMap = new Map();

    result.rows.forEach(row => {
      if (!row.section_id) return;

      if (!sectionsMap.has(row.section_id)) {
        sectionsMap.set(row.section_id, {
          id: row.section_id,
          title: row.section_title,
          description: row.section_description,
          durasi: row.durasi,
          position: row.section_position,
          topics: []
        });
      }

      if (row.topic_id && !topicsMap.has(row.topic_id)) {
        const topicData = {
          id: row.topic_id,
          title: row.topic_title,
          position: row.topic_position,
          materials: [],
          quiz: {
            examId: row.quiz_exam_id || null,
            questions: row.quiz_questions || []
          },
          drill: {
            examId: row.drill_exam_id || null,
            questions: row.drill_questions || []
          }
        };

        topicsMap.set(row.topic_id, topicData);
        sectionsMap.get(row.section_id).topics.push(topicData);
      }

      if (row.material_id && !materialsMap.has(row.material_id)) {
        const materialData = {
          id: row.material_id,
          title: row.material_title,
          content: row.material_content,
          isMandatory: row.is_mandatory,
          hasVideo: row.has_video,
          videoType: row.video_type,
          videoUrl: row.video_url,
          videoFileName: row.video_file_name,
          position: row.material_position
        };

        materialsMap.set(row.material_id, materialData);
        
        if (topicsMap.has(row.topic_id)) {
          topicsMap.get(row.topic_id).materials.push(materialData);
        }
      }
    });

    const sections = Array.from(sectionsMap.values())
      .sort((a, b) => a.position - b.position)
      .map((section: any) => ({
        ...section,
        topics: section.topics
          .sort((a: any, b: any) => a.position - b.position)
          .map((topic: any) => ({
            ...topic,
            materials: topic.materials.sort((a: any, b: any) => a.position - b.position)
          }))
      }));

    const response: CourseDetailResponse = {
      courseId: result.rows[0].course_id,
      title: result.rows[0].course_title,
      description: result.rows[0].course_description,
      imageurl: result.rows[0].course_imageurl,
      learningPoint: result.rows[0].course_learning_point,
      sections: sections
    };

    res.status(200).json({
      message: 'Course retrieved successfully',
      data: response
    });

  } catch (error: any) {
    console.error('Error retrieving course:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve course', 
      error: error.message 
    });
  } finally {
    client.release();
  }
};

// Keep the detailed course creation and update functions unchanged but add approval checks
export const createCourseDetail = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { title, description, sections, imageUrl, learningPoints } = req.body;
    const userId = req.user?.id || 20;
    const userRole = req.user?.role;

    // Only teachers and admins can create courses
    if (userRole !== 'teacher' && userRole !== 'admin') {
      await client.query('ROLLBACK');
      return res.status(403).json({
        message: 'Akses ditolak. Hanya guru dan admin yang dapat membuat kursus.'
      });
    }

    // Validation basic input
    if (!title || !description || !sections) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Title, description, dan sections wajib diisi' });
    }

    // Parse sections JSON
    let sectionsData;
    try {
      sectionsData = typeof sections === 'string' ? JSON.parse(sections) : sections;
    } catch (parseError) {
      console.error('Error parsing sections:', parseError);
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Invalid sections data' });
    }

    // Validate sections not empty
    if (!Array.isArray(sectionsData) || sectionsData.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Sections tidak boleh kosong' });
    }

    // Check if course with the same title already exists for this user
    const existingCourse = await client.query(
      'SELECT id FROM courses WHERE title = $1 AND create_user_id = $2 AND (is_deleted IS NULL OR is_deleted = false)',
      [title, userId]
    );

    if (existingCourse.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ 
        message: 'Course dengan title yang sama sudah ada',
        existing_course_id: existingCourse.rows[0].id
      });
    }

    // Determine approval status based on role
    const approvalStatus = userRole === 'admin' ? 'approved' : 'need_approve';

    // Create video directory if it doesn't exist
    const videoDir = path.join(process.cwd(), 'public', 'assets', 'video', 'materi');
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }

    // Create course first - with admin auto-approval logic
    let courseQuery: string;
    let courseValues: any[];

    if (userRole === 'admin' && approvalStatus === 'approved') {
      // For admin auto-approval, set approve_user_id and approve_date
      courseQuery = `
        INSERT INTO courses (
          title, description, create_user_id, create_date, imageurl, learning_point, 
          approval_status, approve_user_id, approve_date, is_deleted
        ) VALUES ($1, $2, $3, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', $4, $5, $6, $7, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', false) 
        RETURNING *
      `;
      courseValues = [
        title, 
        description, 
        userId, 
        imageUrl, 
        typeof learningPoints === 'string' ? JSON.parse(learningPoints) : learningPoints, 
        approvalStatus,
        userId // approve_user_id = create_user_id for admin
      ];
    } else {
      // Regular course creation
      courseQuery = `
        INSERT INTO courses (
          title, description, create_user_id, create_date, imageurl, learning_point, 
          approval_status, is_deleted
        ) VALUES ($1, $2, $3, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', $4, $5, $6, false) 
        RETURNING *
      `;
      courseValues = [
        title, 
        description, 
        userId, 
        imageUrl, 
        typeof learningPoints === 'string' ? JSON.parse(learningPoints) : learningPoints, 
        approvalStatus
      ];
    }

    const courseResult = await client.query(courseQuery, courseValues);
    const course = courseResult.rows[0];

    // Process sections and save to database (rest of the logic remains the same)
    const processedSections = [];
    
    for (let sectionIndex = 0; sectionIndex < sectionsData.length; sectionIndex++) {
      const sectionData = sectionsData[sectionIndex];
      
      // Validate section data
      if (!sectionData.title) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          message: `Section ke-${sectionIndex + 1} harus memiliki title` 
        });
      }

      // Create section
      const sectionResult = await client.query(
        `INSERT INTO sections (course_id, title, position, create_date, create_user_id, description, time)
         VALUES ($1, $2, $3, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', $4, $5, $6)
         RETURNING *`,  
        [course.id, sectionData.title, sectionIndex + 1, userId, sectionData.description, sectionData.duration]
      );
      
      const section = sectionResult.rows[0];
      const processedTopics = [];

      // Process topics for this section
      if (sectionData.topics && Array.isArray(sectionData.topics)) {
        for (let topicIndex = 0; topicIndex < sectionData.topics.length; topicIndex++) {
          const topicData = sectionData.topics[topicIndex];
          
          // Validate topic data
          if (!topicData.title) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
              message: `Topic ke-${topicIndex + 1} di section "${sectionData.title}" harus memiliki title` 
            });
          }

          // Create topic first without quiz_id and drill_id
          const topicResult = await client.query(
            `INSERT INTO topics (section_id, title, position, create_date, create_user_id)
             VALUES ($1, $2, $3, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', $4)
             RETURNING *`,
            [section.id, topicData.title, topicIndex + 1, userId]
          );
          
          const topic = topicResult.rows[0];
          const processedMaterials = [];

          // Process materials for this topic
          if (topicData.materials && Array.isArray(topicData.materials)) {
            for (let materialIndex = 0; materialIndex < topicData.materials.length; materialIndex++) {
              const material = topicData.materials[materialIndex];
              
              let materialData = {
                topic_id: topic.id,
                title: material.title || `Material ${materialIndex + 1}`,
                content: material.content || '',
                isMandatory: material.isMandatory || false,
                hasVideo: material.hasVideo || false,
                videoType: material.videoType || null,
                video_url: material.videoUrl || null,
                video_file_name: material.videoFileName || null,
                order_index: materialIndex + 1,
              };

              // Create material in database
              const materialResult = await client.query(
                `INSERT INTO materials (topic_id, title, content, is_mandatory, video_url, video_file_name, position, create_date, create_user_id, has_video, video_type)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', $8, $9, $10)
                 RETURNING *`,
                [
                  materialData.topic_id, 
                  materialData.title, 
                  materialData.content, 
                  materialData.isMandatory, 
                  materialData.video_url, 
                  materialData.video_file_name, 
                  materialData.order_index, 
                  userId,
                  materialData.hasVideo,
                  materialData.videoType
                ]
              );
              
              processedMaterials.push(materialResult.rows[0]);
            }
          }

          // Create Quiz and Drill for this topic
          let quizId = null;
          let drillId = null;

          // Extract question IDs from topicData.quiz and topicData.drill
          let quizQuestionIds: number[] = [];
          let drillQuestionIds: number[] = [];

          if (topicData.quiz && topicData.quiz.questions && Array.isArray(topicData.quiz.questions)) {
            quizQuestionIds = topicData.quiz.questions.map((q: any) => q.id);
          }

          if (topicData.drill && topicData.drill.questions && Array.isArray(topicData.drill.questions)) {
            drillQuestionIds = topicData.drill.questions.map((q: any) => q.id);
          }

          // Create Quiz if there are question IDs
          if (quizQuestionIds.length > 0) {
            try {
              const quizExam = await examModel.createExam({
                name: `Quiz ${topicData.title}`,
                duration: 30,
                create_user_id: userId,
                exam_group: 1,
                question_id_list: quizQuestionIds
              });

              const quizSchedule = await examScheduleModel.createExamSchedule(
                `Quiz ${topicData.title}`,
                `AUTOCREATE Quiz untuk topik ${topicData.title}`,
                [quizExam.id],
                new Date('1970-01-01T00:00:00Z'),
                new Date('1970-01-01T00:00:00Z'),
                true,
                true,
                userId,
                1
              );

              quizId = quizSchedule.id;
              console.log(`Quiz berhasil dibuat untuk topic: ${topicData.title} dengan ID: ${quizId}`);

            } catch (examError: any) {
              console.error(`Error creating quiz for topic ${topicData.title}:`, examError);
              await client.query('ROLLBACK');
              return res.status(500).json({ 
                message: `Failed to create quiz for topic: ${topicData.title}`,
                error: examError.message 
              });
            }
          }

          // Create Drill if there are question IDs
          if (drillQuestionIds.length > 0) {
            try {
              const drillExam = await examModel.createExam({
                name: `Drill ${topicData.title}`,
                duration: 0,
                create_user_id: userId,
                exam_group: 6,
                question_id_list: drillQuestionIds
              });

              const drillSchedule = await examScheduleModel.createExamSchedule(
                `Drill ${topicData.title}`,
                `AUTOCREATE Drill untuk topik ${topicData.title}`,
                [drillExam.id],
                new Date('1970-01-01T00:00:00Z'),
                new Date('1970-01-01T00:00:00Z'),
                true,
                true,
                userId,
                6
              );

              drillId = drillSchedule.id;
              console.log(`Drill berhasil dibuat untuk topic: ${topicData.title} dengan ID: ${drillId}`);

            } catch (examError: any) {
              console.error(`Error creating drill for topic ${topicData.title}:`, examError);
              await client.query('ROLLBACK');
              return res.status(500).json({ 
                message: `Failed to create drill for topic: ${topicData.title}`,
                error: examError.message 
              });
            }
          }

          // Update topic with quiz_id and drill_id if any
          if (quizId || drillId) {
            await client.query(
              `UPDATE topics SET quiz_id = $1, drill_id = $2 WHERE id = $3`,
              [quizId, drillId, topic.id]
            );
          }

          processedTopics.push({
            ...topic,
            materials: processedMaterials,
            quiz_id: quizId,
            drill_id: drillId,
            quiz_questions: quizQuestionIds,
            drill_questions: drillQuestionIds
          });
        }
      }
      
      processedSections.push({
        ...section,
        topics: processedTopics
      });
    }

    // Commit transaction if all successful
    await client.query('COMMIT');

    console.log('Course created successfully with ID:', course.id);
    console.log('Total sections processed:', processedSections.length);

    const responseMessage = approvalStatus === 'need_approve' 
      ? 'Course created successfully and pending approval with auto-generated quizzes and drills'
      : 'Course created successfully and approved automatically with auto-generated quizzes and drills';

    res.status(201).json({
      message: responseMessage,
      data: { 
        course_id: course.id,
        title, 
        description, 
        sections: processedSections, 
        videoDirectory: videoDir,
        approval_status: approvalStatus
      },
    });

  } catch (error: any) {
    // Rollback transaction if any error
    await client.query('ROLLBACK');
    console.error('Error saving course:', error);
    res.status(500).json({ 
      message: 'Failed to save course', 
      error: error.message 
    });
  } finally {
    // Release client connection
    client.release();
  }
};


export const deleteCourse = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await Course.deleteCourse(parseInt(req.query.id as string));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserCourseProgress = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const progress = await Course.getUserCourseProgress(req.user.id);
    
    res.status(200).json({
      message: 'User course progress retrieved successfully',
      data: progress
    });
  } catch (error: any) {
    console.error('Error getting user course progress:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve user course progress', 
      error: error.message 
    });
  }
};

export const getUserCourseProgressByCourseId = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { courseId } = req.query;
    
    if (!courseId || isNaN(Number(courseId))) {
      return res.status(400).json({ message: 'Valid course ID is required' });
    }

    const progress = await Course.getUserCourseProgressByCourseId(
      req.user.id, 
      Number(courseId)
    );
    
    if (!progress) {
      return res.status(404).json({ message: 'Course not found or no progress data available' });
    }

    res.status(200).json({
      message: 'User course progress retrieved successfully',
      data: progress
    });
  } catch (error: any) {
    console.error('Error getting user course progress by course ID:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve user course progress', 
      error: error.message 
    });
  }
};

export const updateCourseDetail = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Extract parameters
    const { courseId } = req.query;
    const { title, description, sections, imageUrl, learningPoint } = req.body;
    const userId = req.user?.id || 20;
    const userRole = req.user?.role;

    // Validasi input dasar
    if (!courseId || !title || !description || !sections) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        message: 'Course ID, title, description, dan sections wajib diisi' 
      });
    }

    // Check permissions and approval status before allowing updates
    const existingCourse = await Course.getCourseById(
      parseInt(courseId as string), 
      false, 
      userRole, 
      userId?.toString()
    );

    if (!existingCourse) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        message: 'Kursus tidak ditemukan atau akses ditolak' 
      });
    }

    if (!canUserModifyCourse(existingCourse, userRole, userId)) {
      await client.query('ROLLBACK');
      return res.status(403).json({ 
        message: 'Anda tidak memiliki hak untuk mengubah kursus ini' 
      });
    }

    if (userRole === 'teacher' && existingCourse.approval_status !== 'need_approve') {
      await client.query('ROLLBACK');
      return res.status(403).json({ 
        message: 'Kursus yang sudah disetujui tidak dapat diubah' 
      });
    }

    // Parse sections JSON
    let sectionsData;
    try {
      sectionsData = typeof sections === 'string' ? JSON.parse(sections) : sections;
    } catch (parseError) {
      console.error('Error parsing sections:', parseError);
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Invalid sections data' });
    }

    // Parse learningPoint JSON with safety check
    let learningPointData = [];
    if (learningPoint) {
      try {
        learningPointData = typeof learningPoint === 'string' 
          ? JSON.parse(learningPoint) 
          : learningPoint;
      } catch (parseError) {
        console.error('Error parsing learningPoint:', parseError);
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Invalid learning point data' });
      }
    }

    // Validasi sections tidak kosong
    if (!Array.isArray(sectionsData) || sectionsData.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Sections tidak boleh kosong' });
    }

    // Query existing data structure
    const existingDataQuery = `
      SELECT 
        c.id as course_id,
        s.id as section_id,
        t.id as topic_id,
        t.quiz_id,
        t.drill_id,
        m.id as material_id
      FROM courses c 
      LEFT JOIN sections s ON s.course_id = c.id 
      LEFT JOIN topics t ON t.section_id = s.id 
      LEFT JOIN materials m ON m.topic_id = t.id 
      WHERE c.id = $1
      ORDER BY s.position, t.position, m.position
    `;

    const existingDataResult = await client.query(existingDataQuery, [courseId]);

    // Extract existing IDs
    const existingSectionIds = new Set<number>();
    const existingTopicIds = new Set<number>();
    const existingMaterialIds = new Set<number>();

    existingDataResult.rows.forEach(row => {
      if (row.section_id) existingSectionIds.add(row.section_id);
      if (row.topic_id) existingTopicIds.add(row.topic_id);
      if (row.material_id) existingMaterialIds.add(row.material_id);
    });

    // Extract payload IDs
    const payloadSectionIds = new Set<number>();
    const payloadTopicIds = new Set<number>();
    const payloadMaterialIds = new Set<number>();

    sectionsData.forEach((section: any) => {
      if (section.id && !isNewId(section.id)) {
        payloadSectionIds.add(section.id);
      }
      if (section.topics && Array.isArray(section.topics)) {
        section.topics.forEach((topic: any) => {
          if (topic.id && !isNewId(topic.id)) {
            payloadTopicIds.add(topic.id);
          }
          if (topic.materials && Array.isArray(topic.materials)) {
            topic.materials.forEach((material: any) => {
              if (material.id && !isNewId(material.id)) {
                payloadMaterialIds.add(material.id);
              }
            });
          }
        });
      }
    });

    // Delete sections not in payload
    const sectionsToDelete = Array.from(existingSectionIds)
      .filter(id => !payloadSectionIds.has(id));
    
    if (sectionsToDelete.length > 0) {
      console.log('Deleting sections:', sectionsToDelete);
      
      // Get quiz and drill IDs to delete from topics in these sections
      const quizDrillToDeleteResult = await client.query(
        'SELECT quiz_id, drill_id FROM topics WHERE section_id = ANY($1)',
        [sectionsToDelete]
      );
      
      const quizIdsToDelete = quizDrillToDeleteResult.rows
        .map(row => row.quiz_id)
        .filter(id => id !== null);
      const drillIdsToDelete = quizDrillToDeleteResult.rows
        .map(row => row.drill_id)
        .filter(id => id !== null);

      // Delete exam schedules and exams
      if (quizIdsToDelete.length > 0) {
        await client.query('DELETE FROM exam_schedule WHERE id = ANY($1)', [quizIdsToDelete]);
      }
      if (drillIdsToDelete.length > 0) {
        await client.query('DELETE FROM exam_schedule WHERE id = ANY($1)', [drillIdsToDelete]);
      }

      // Delete cascade will handle materials, topics
      await client.query('DELETE FROM sections WHERE id = ANY($1)', [sectionsToDelete]);
    }

    // Delete topics not in payload (but section exists)
    const topicsToDelete = Array.from(existingTopicIds)
      .filter(id => !payloadTopicIds.has(id));
    
    if (topicsToDelete.length > 0) {
      console.log('Deleting topics:', topicsToDelete);
      
      // Get quiz and drill IDs to delete
      const quizDrillToDeleteResult = await client.query(
        'SELECT quiz_id, drill_id FROM topics WHERE id = ANY($1)',
        [topicsToDelete]
      );
      
      const quizIdsToDelete = quizDrillToDeleteResult.rows
        .map(row => row.quiz_id)
        .filter(id => id !== null);
      const drillIdsToDelete = quizDrillToDeleteResult.rows
        .map(row => row.drill_id)
        .filter(id => id !== null);

      // Delete exam schedules
      if (quizIdsToDelete.length > 0) {
        await client.query('DELETE FROM exam_schedule WHERE id = ANY($1)', [quizIdsToDelete]);
      }
      if (drillIdsToDelete.length > 0) {
        await client.query('DELETE FROM exam_schedule WHERE id = ANY($1)', [drillIdsToDelete]);
      }

      await client.query('DELETE FROM topics WHERE id = ANY($1)', [topicsToDelete]);
    }

    // Delete materials not in payload
    const materialsToDelete = Array.from(existingMaterialIds)
      .filter(id => !payloadMaterialIds.has(id));
    
    if (materialsToDelete.length > 0) {
      console.log('Deleting materials:', materialsToDelete);
      await client.query('DELETE FROM materials WHERE id = ANY($1)', [materialsToDelete]);
    }

    // Update course
    await client.query(
      `UPDATE courses SET 
       title = $1, 
       description = $2, 
       imageurl = $3, 
       learning_point = $4,
       edit_date = NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
       WHERE id = $5`,
      [title, description, imageUrl, learningPointData, courseId]
    );

    // Create video directory if it doesn't exist
    const videoDir = path.join(process.cwd(), 'public', 'assets', 'video', 'materi');
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }

    // Process sections
    const processedSections = [];

    for (let sectionIndex = 0; sectionIndex < sectionsData.length; sectionIndex++) {
      const sectionData = sectionsData[sectionIndex];
      
      // Validasi section data
      if (!sectionData.title) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          message: `Section ke-${sectionIndex + 1} harus memiliki title` 
        });
      }

      let section;
      
      // Insert or Update section
      if (isNewId(sectionData.id)) {
        // Insert new section
        const sectionResult = await client.query(
          `INSERT INTO sections (course_id, title, position, create_date, create_user_id, description, time)
           VALUES ($1, $2, $3, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', $4, $5, $6)
           RETURNING *`,  
          [courseId, sectionData.title, sectionIndex + 1, userId, sectionData.description, sectionData.durasi]
        );
        section = sectionResult.rows[0];
        console.log('Created new section:', section.id);
      } else {
        // Update existing section
        const sectionResult = await client.query(
          `UPDATE sections SET 
           title = $1, 
           position = $2, 
           description = $3, 
           time = $4,
           update_date = NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
           WHERE id = $5
           RETURNING *`,
          [sectionData.title, sectionIndex + 1, sectionData.description, sectionData.durasi, sectionData.id]
        );
        section = sectionResult.rows[0];
        console.log('Updated section:', section.id);
      }

      const processedTopics = [];

      // Process topics untuk section ini
      if (sectionData.topics && Array.isArray(sectionData.topics)) {
        for (let topicIndex = 0; topicIndex < sectionData.topics.length; topicIndex++) {
          const topicData = sectionData.topics[topicIndex];
          
          // Validasi topic data
          if (!topicData.title) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
              message: `Topic ke-${topicIndex + 1} di section "${sectionData.title}" harus memiliki title` 
            });
          }

          let topic;
          let existingQuizId = null;
          let existingDrillId = null;

          // Insert or Update topic
          if (isNewId(topicData.id)) {
            // Insert new topic
            const topicResult = await client.query(
              `INSERT INTO topics (section_id, title, position, create_date, create_user_id)
               VALUES ($1, $2, $3, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', $4)
               RETURNING *`,
              [section.id, topicData.title, topicIndex + 1, userId]
            );
            topic = topicResult.rows[0];
            console.log('Created new topic:', topic.id);
          } else {
            // Get existing quiz and drill IDs before update
            const existingTopicResult = await client.query(
              'SELECT quiz_id, drill_id FROM topics WHERE id = $1',
              [topicData.id]
            );
            
            if (existingTopicResult.rows.length > 0) {
              existingQuizId = existingTopicResult.rows[0].quiz_id;
              existingDrillId = existingTopicResult.rows[0].drill_id;
            }

            // Update existing topic
            const topicResult = await client.query(
              `UPDATE topics SET 
               title = $1, 
               position = $2,
               update_date = NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
               WHERE id = $3
               RETURNING *`,
              [topicData.title, topicIndex + 1, topicData.id]
            );
            topic = topicResult.rows[0];
            console.log('Updated topic:', topic.id);
          }

          const processedMaterials = [];

          // Process materials untuk topic ini
          if (topicData.materials && Array.isArray(topicData.materials)) {
            for (let materialIndex = 0; materialIndex < topicData.materials.length; materialIndex++) {
              const material = topicData.materials[materialIndex];
              
              let materialData = {
                topic_id: topic.id,
                title: material.title || `Material ${materialIndex + 1}`,
                content: material.content || '',
                isMandatory: material.isMandatory || false,
                hasVideo: material.hasVideo || false,
                videoType: material.videoType || null,
                video_url: material.videoUrl || null,
                video_file_name: material.videoFileName || null,
                order_index: materialIndex + 1,
              };

              let materialResult;
              
              // Insert or Update material
              if (isNewId(material.id)) {
                // Insert new material
                materialResult = await client.query(
                  `INSERT INTO materials (topic_id, title, content, is_mandatory, video_url, video_file_name, position, create_date, create_user_id, has_video, video_type)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', $8, $9, $10)
                   RETURNING *`,
                  [
                    materialData.topic_id, 
                    materialData.title, 
                    materialData.content, 
                    materialData.isMandatory, 
                    materialData.video_url, 
                    materialData.video_file_name, 
                    materialData.order_index, 
                    userId,
                    materialData.hasVideo,
                    materialData.videoType
                  ]
                );
                console.log('Created new material:', materialResult.rows[0].id);
              } else {
                // Update existing material
                materialResult = await client.query(
                  `UPDATE materials SET 
                   title = $1, 
                   content = $2, 
                   is_mandatory = $3, 
                   video_url = $4, 
                   video_file_name = $5, 
                   position = $6,
                   has_video = $7,
                   video_type = $8,
                   update_date = NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
                   WHERE id = $9
                   RETURNING *`,
                  [
                    materialData.title, 
                    materialData.content, 
                    materialData.isMandatory, 
                    materialData.video_url, 
                    materialData.video_file_name, 
                    materialData.order_index,
                    materialData.hasVideo,
                    materialData.videoType,
                    material.id
                  ]
                );
                console.log('Updated material:', material.id);
              }
              
              processedMaterials.push(materialResult.rows[0]);
            }
          }

          // Handle Quiz dan Drill
          let quizId = null;
          let drillId = null;

          // Extract question IDs dari topicData.quiz dan topicData.drill
          let quizQuestionIds: number[] = [];
          let drillQuestionIds: number[] = [];

          if (topicData.quiz && topicData.quiz.questions && Array.isArray(topicData.quiz.questions)) {
            quizQuestionIds = topicData.quiz.questions.map((q: any) => q.id);
          }

          if (topicData.drill && topicData.drill.questions && Array.isArray(topicData.drill.questions)) {
            drillQuestionIds = topicData.drill.questions.map((q: any) => q.id);
          }

          // Handle Quiz
          if (quizQuestionIds.length > 0) {
            try {
              if (existingQuizId) {
                // Update existing quiz - delete old and create new
                await client.query('DELETE FROM exam_schedule WHERE id = $1', [existingQuizId]);
              }
              
              // Create new quiz
              const quizExam = await examModel.createExam({
                name: `Quiz ${topicData.title}`,
                duration: 30,
                exam_group: 1,
                question_id_list: quizQuestionIds
              }, userId);

              const quizSchedule = await examScheduleModel.createExamSchedule(
                `Quiz ${topicData.title}`,
                `AUTOCREATE Quiz untuk topik ${topicData.title}`,
                [quizExam.id],
                new Date('1970-01-01T00:00:00Z'),
                new Date('1970-01-01T00:00:00Z'),
                true,
                true,
                userId,
                1
              );

              quizId = quizSchedule.id;
              console.log(`Quiz ${existingQuizId ? 'updated' : 'created'} for topic: ${topicData.title} with ID: ${quizId}`);
            } catch (examError: any) {
              console.error(`Error handling quiz for topic ${topicData.title}:`, examError);
              await client.query('ROLLBACK');
              return res.status(500).json({ 
                message: `Failed to handle quiz for topic: ${topicData.title}`,
                error: examError.message 
              });
            }
          } else if (existingQuizId) {
            // Delete existing quiz if no questions provided
            await client.query('DELETE FROM exam_schedule WHERE id = $1', [existingQuizId]);
            console.log(`Quiz deleted for topic: ${topicData.title}`);
          }

          // Handle Drill
          if (drillQuestionIds.length > 0) {
            try {
              if (existingDrillId) {
                // Update existing drill - delete old and create new
                await client.query('DELETE FROM exam_schedule WHERE id = $1', [existingDrillId]);
              }
              
              // Create new drill
              const drillExam = await examModel.createExam({
                name: `Drill ${topicData.title}`,
                duration: 0, 
                exam_group: 6,
                question_id_list: drillQuestionIds
              }, userId);

              const drillSchedule = await examScheduleModel.createExamSchedule(
                `Drill ${topicData.title}`,
                `AUTOCREATE Drill untuk topik ${topicData.title}`,
                [drillExam.id],
                new Date('1970-01-01T00:00:00Z'),
                new Date('1970-01-01T00:00:00Z'),
                true,
                true,
                userId,
                6
              );

              drillId = drillSchedule.id;
              console.log(`Drill ${existingDrillId ? 'updated' : 'created'} for topic: ${topicData.title} with ID: ${drillId}`);
            } catch (examError: any) {
              console.error(`Error handling drill for topic ${topicData.title}:`, examError);
              await client.query('ROLLBACK');
              return res.status(500).json({ 
                message: `Failed to handle drill for topic: ${topicData.title}`,
                error: examError.message 
              });
            }
          } else if (existingDrillId) {
            // Delete existing drill if no questions provided
            await client.query('DELETE FROM exam_schedule WHERE id = $1', [existingDrillId]);
            console.log(`Drill deleted for topic: ${topicData.title}`);
          }

          // Update topic dengan quiz_id dan drill_id
          await client.query(
            `UPDATE topics SET quiz_id = $1, drill_id = $2 WHERE id = $3`,
            [quizId, drillId, topic.id]
          );

          processedTopics.push({
            ...topic,
            materials: processedMaterials,
            quiz_id: quizId,
            drill_id: drillId,
            quiz_questions: quizQuestionIds,
            drill_questions: drillQuestionIds
          });
        }
      }
      
      processedSections.push({
        ...section,
        topics: processedTopics
      });
    }

    // Commit transaction jika semua berhasil
    await client.query('COMMIT');

    console.log('Course updated successfully with ID:', courseId);
    console.log('Total sections processed:', processedSections.length);

    res.status(200).json({
      message: 'Course updated successfully',
      data: { 
        course_id: courseId,
        sections: processedSections 
      }
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error updating course:', error);
    res.status(500).json({ 
      message: 'Failed to update course', 
      error: error.message 
    });
  } finally {
    client.release();
  }
};