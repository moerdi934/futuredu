// models/course.model.ts - Updated with Approval System
import pool from '../lib/db';
import { PoolClient } from 'pg';

// Updated Types
export interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  courseUrl?: string;
  learning_point?: any[];
  create_user_id?: number;
  edit_user_id?: number;
  create_date?: Date;
  edit_date?: Date;
  // New approval fields
  approval_status: string;
  approve_user_id?: number;
  approve_date?: Date;
  rejection_reason?: string;
  // New soft delete fields
  is_deleted: boolean;
  delete_reason?: string;
  delete_user_id?: number;
  delete_date?: Date;
}

export interface Section {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  time?: number;
  position: number;
  create_user_id?: number;
  create_date?: Date;
}

export interface Topic {
  id: number;
  section_id: number;
  title: string;
  position: number;
  quiz_id?: number;
  drill_id?: number;
  create_user_id?: number;
  create_date?: Date;
}

export interface Material {
  id: number;
  topic_id: number;
  title: string;
  content?: string;
  is_mandatory?: boolean;
  video_url?: string;
  video_file_name?: string;
  position: number;
  has_video?: boolean;
  video_type?: string;
  create_user_id?: number;
  create_date?: Date;
}

export interface CourseData {
  title: string;
  description: string;
  imageUrl?: string;
  create_user_id: number;
  learning_point?: any[];
  approval_status?: string;
  user_role?: string; // Added to determine auto-approval
}

export interface SectionData {
  course_id: number;
  title: string;
  order_index: number;
  create_user_id: number;
  description?: string;
  time?: number;
}

export interface TopicData {
  section_id: number;
  title: string;
  order_index: number;
  quiz_id?: number;
  drill_id?: number;
  create_user_id: number;
}

export interface MaterialData {
  topic_id: number;
  title: string;
  content?: string;
  isMandatory?: boolean;
  video_url?: string;
  video_file_name?: string;
  order_index: number;
  create_user_id: number;
  hasVideo?: boolean;
  videoType?: string;
}

export interface UpdateCourseData {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  edit_user_id: number;
  learning_point?: any[];
}

export interface UserCourseProgress {
  id: number;
  title: string;
  description: string;
  imageurl?: string;
  type?: number;
  learning_point?: any[];
  course_string?: string;
  user_id: string;
  finished_quiz_topics: number;
  finished_materials: number;
  quiz: number;
  material: number;
  quiz_progress_percentage: number;
  material_progress_percentage: number;
  overall_progress_percentage: number;
}

// New types for approval system
export interface CourseGetOptions {
  sortField?: string;
  sortOrder?: string;
  search?: string;
  page?: number;
  limit?: number;
  approvalStatus?: string;
  includeDeleted?: string;
  userRole?: string;
  userId?: string;
}

export interface CourseRow extends Course {
  creator_name?: string;
  approver_name?: string;
  total?: number;
}

export interface CoursesResult {
  courses: CourseRow[];
  total: number;
}

export interface ApprovalData {
  approve_user_id: string;
  approval_status: string;
  rejection_reason?: string;
}

// Helper function to build role-based WHERE conditions
const buildRoleBasedConditions = (userRole: string, userId: string, values: any[]): string => {
  if (userRole === 'admin') {
    // Admin can see all courses
    return '';
  } else if (userRole === 'teacher') {
    // Teacher can see courses they created
    values.push(userId);
    return ` AND c.create_user_id = $${values.length}`;
  } else if (userRole === 'student') {
    // Students can only see approved courses (for learning purposes)
    return ` AND c.approval_status = 'approved'`;
  }
  return '';
};

// Updated getAll function with correct live status detection
export const getAll = async (options: CourseGetOptions = {}): Promise<CoursesResult> => {
  const {
    sortField = 'id',
    sortOrder = 'asc',
    search = '',
    page = 1,
    limit = 10,
    approvalStatus = 'all',
    liveStatus = 'all',
    includeDeleted = 'false',
    userRole = 'admin',
    userId = ''
  } = options;

  const offset = (page - 1) * limit;
  
  let query = '';
  const values: any[] = [];
  const conditions: string[] = [];

  if (userRole === 'student') {
    // Query for students: only show entitled courses
    query = `
      WITH course_aggregation AS (
        SELECT 
          c.id,
          c.title,
          c.description,
          c.imageUrl,
          c.courseUrl,
          c.learning_point,
          -- Entitlement information
          ce.granted_at,
          ce.expires_at,
          ce.metadata as entitlement_metadata,
          CASE 
            WHEN ce.expires_at IS NULL THEN true
            WHEN ce.expires_at > NOW() THEN true
            ELSE false
          END as is_entitled_active,
          -- Check if course is live from product relation
          CASE 
            WHEN p.product_id IS NOT NULL THEN true
            ELSE false
          END as is_live,
          p.updated_at as live_since,
          -- Aggregated data
          COUNT(DISTINCT s.id) as section_count,
          STRING_AGG(DISTINCT s.title, ', ' ORDER BY s.title) as section_string,
          COUNT(DISTINCT t.id) as topic_count,
          COUNT(DISTINCT m.id) as material_count,
          COUNT(DISTINCT CASE WHEN m.is_mandatory = true THEN m.id END) as mandatory_material_count,
          COUNT(DISTINCT CASE WHEN m.is_mandatory = false OR m.is_mandatory IS NULL THEN m.id END) as optional_material_count,
          COALESCE(SUM(DISTINCT s.time), 0) as total_duration_minutes
        FROM courses c
        INNER JOIN course_entitlements ce ON ce.course_id = c.id
        LEFT JOIN product_courses pc ON pc.course_id = c.id
        LEFT JOIN products p ON p.product_id = pc.product_id AND p.type = 1
        LEFT JOIN sections s ON s.course_id = c.id 
        LEFT JOIN topics t ON t.section_id = s.id 
        LEFT JOIN materials m ON m.topic_id = t.id 
        WHERE (c.is_deleted IS NULL OR c.is_deleted = false)
          AND c.approval_status = 'approved'
          AND p.product_id IS NOT NULL
    `;

    // Filter by student user_id
    values.push(parseInt(userId));
    conditions.push(`AND ce.user_id = $${values.length}`);

    // Search functionality for students
    if (search) {
      values.push(`%${search}%`);
      values.push(`%${search}%`);
      conditions.push(`AND (c.title ILIKE $${values.length - 1} OR c.description ILIKE $${values.length})`);
    }

    if (conditions.length > 0) {
      query += ` ${conditions.join(' ')}`;
    }

    // GROUP BY clause for student
    query += `
        GROUP BY 
          c.id, c.title, c.description, c.imageUrl, c.courseUrl, c.learning_point,
          ce.granted_at, ce.expires_at, ce.metadata, p.product_id, p.updated_at
      )
      SELECT 
        *, 
        COUNT(*) OVER() AS total 
      FROM course_aggregation
    `;

  } else {
    // Query for admin and teacher: show all courses with entitlement counts
    query = `
      WITH course_aggregation AS (
        SELECT 
          c.id,
          c.title,
          c.description,
          c.imageUrl,
          c.courseUrl,
          c.learning_point,
          c.create_user_id,
          c.edit_user_id,
          c.create_date,
          c.edit_date,
          c.approval_status,
          c.approve_user_id,
          c.approve_date,
          c.rejection_reason,
          c.is_deleted,
          c.delete_reason,
          c.delete_user_id,
          c.delete_date,
          -- Check if course is live from product relation
          CASE 
            WHEN p.product_id IS NOT NULL THEN true
            ELSE false
          END as is_live,
          p.updated_at as live_since,
          p.product_id,
          p.name as product_name,
          cu.user_code || '-' || ua.nama_lengkap AS creator_name,
          au.user_code || '-' || ua2.nama_lengkap AS approver_name,
          -- Aggregated data
          COUNT(DISTINCT s.id) as section_count,
          STRING_AGG(DISTINCT s.title, ', ' ORDER BY s.title) as section_string,
          COUNT(DISTINCT t.id) as topic_count,
          COUNT(DISTINCT m.id) as material_count,
          COUNT(DISTINCT CASE WHEN m.is_mandatory = true THEN m.id END) as mandatory_material_count,
          COUNT(DISTINCT CASE WHEN m.is_mandatory = false OR m.is_mandatory IS NULL THEN m.id END) as optional_material_count,
          COALESCE(SUM(DISTINCT s.time), 0) as total_duration_minutes,
          -- Entitlement counts
          COUNT(DISTINCT ce.user_id) as entitled_users_count,
          COUNT(DISTINCT CASE 
            WHEN ce.expires_at IS NULL OR ce.expires_at > NOW() 
            THEN ce.user_id 
          END) as active_entitled_count
        FROM courses c
        LEFT JOIN users cu ON c.create_user_id = cu.id
        LEFT JOIN user_account ua ON ua.user_id = cu.user_id
        LEFT JOIN users au ON c.approve_user_id = au.id
        LEFT JOIN user_account ua2 ON ua2.user_id = au.user_id
        LEFT JOIN product_courses pc ON pc.course_id = c.id
        LEFT JOIN products p ON p.product_id = pc.product_id AND p.type = 1
        LEFT JOIN sections s ON s.course_id = c.id 
        LEFT JOIN topics t ON t.section_id = s.id 
        LEFT JOIN materials m ON m.topic_id = t.id 
        LEFT JOIN course_entitlements ce ON ce.course_id = c.id
        WHERE 1=1
    `;

    // Add role-based filtering for teacher
    if (userId && userRole === 'teacher') {
      values.push(parseInt(userId));
      conditions.push(`AND c.create_user_id = $${values.length}`);
    }

    // Handle delete filter logic
    if (includeDeleted === 'false') {
      conditions.push('AND (c.is_deleted IS NULL OR c.is_deleted = false)');
    } else if (includeDeleted === 'only_deleted') {
      conditions.push('AND c.is_deleted = true');
    }

    // Filter by approval status
    if (approvalStatus && approvalStatus !== 'all') {
      values.push(approvalStatus);
      conditions.push(`AND c.approval_status = $${values.length}`);
    }

    // Filter by live status - using computed field from product relation
    if (liveStatus && liveStatus !== 'all') {
      if (liveStatus === 'live') {
        conditions.push('AND p.product_id IS NOT NULL');
      } else if (liveStatus === 'not_live') {
        conditions.push('AND p.product_id IS NULL');
      }
    }

    // Search functionality
    if (search) {
      values.push(`%${search}%`);
      values.push(`%${search}%`);
      conditions.push(`AND (c.title ILIKE $${values.length - 1} OR c.description ILIKE $${values.length})`);
    }

    if (conditions.length > 0) {
      query += ` ${conditions.join(' ')}`;
    }

    // GROUP BY clause for admin/teacher
    query += `
        GROUP BY 
          c.id, c.title, c.description, c.imageUrl, c.courseUrl, c.learning_point,
          c.create_user_id, c.edit_user_id, c.create_date, c.edit_date,
          c.approval_status, c.approve_user_id, c.approve_date, c.rejection_reason,
          c.is_deleted, c.delete_reason, c.delete_user_id, c.delete_date,
          p.product_id, p.updated_at, p.name,
          cu.user_code, ua.nama_lengkap, au.user_code, ua2.nama_lengkap
      )
      SELECT 
        *, 
        COUNT(*) OVER() AS total 
      FROM course_aggregation
    `;
  }

  // Sorting
  const validSortFields = ['id', 'title', 'description', 'creator_name', 'create_date', 
                           'approval_status', 'approve_date', 'section_count', 'topic_count', 
                           'material_count', 'total_duration_minutes', 'granted_at', 'expires_at',
                           'is_live', 'live_since', 'entitled_users_count', 'active_entitled_count'];
  if (validSortFields.includes(sortField.toLowerCase()) && ['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;
  } else {
    query += ` ORDER BY id ASC`;
  }

  query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

  const result = await pool.query(query, [...values, limit, offset]);
  
  return {
    courses: result.rows,
    total: result.rows.length > 0 ? result.rows[0].total : 0
  };
};
// Updated searchAll function
export const searchAll = async (search: string = '', userRole: string = 'admin', userId?: string): Promise<Partial<Course>[]> => {
  try {
    let query = `
      SELECT id, title, description, imageUrl, courseUrl, approval_status 
      FROM courses 
      WHERE (is_deleted IS NULL OR is_deleted = false)
    `;
    const values: string[] = [];
    
    // Role-based filtering for search
    if (userRole === 'student') {
      query += ` AND approval_status = 'approved'`;
    } else if (userRole === 'teacher' && userId) {
      values.push(userId);
      query += ` AND (approval_status = 'approved' OR create_user_id = $${values.length})`;
    }

    if (search) {
      values.push(`%${search}%`);
      query += ` AND title ILIKE $${values.length}`;
    }
    
    query += ` ORDER BY title`;
    
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error searching courses:', error);
    throw error;
  }
};

// Get course by ID with role-based access
export const getCourseById = async (id: number, includeDeleted: boolean = false, userRole: string = 'admin', userId?: string): Promise<CourseRow | null> => {
  let query = `
    SELECT 
      c.*,
      cu.user_code || '-' || ua.nama_lengkap AS creator_name,
      au.user_code || '-' || ua2.nama_lengkap AS approver_name
    FROM courses c
    LEFT JOIN users cu ON c.create_user_id = cu.id
    LEFT JOIN user_account ua ON ua.user_id = cu.user_id
    LEFT JOIN users au ON c.approve_user_id = au.id
    LEFT JOIN user_account ua2 ON ua2.user_id = au.user_id
    WHERE c.id = $1
  `;

  const values: any[] = [id];

  // Add role-based filtering if not admin
  if (userRole !== 'admin' && userId) {
    const roleCondition = buildRoleBasedConditions(userRole, userId, values);
    if (roleCondition) {
      query += roleCondition;
    }
  }

  // Add soft delete filter if not including deleted records
  if (!includeDeleted) {
    query += ` AND (c.is_deleted IS NULL OR c.is_deleted = false)`;
  }

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

// Updated createCourse function with admin auto-approval logic
export const createCourse = async (courseData: CourseData): Promise<Course> => {
  const { title, description, imageUrl, create_user_id, learning_point, approval_status, user_role } = courseData;
  
  try {
    let queryFields: string;
    let queryValues: any[];
    let finalApprovalStatus = approval_status || 'need_approve';
    
    // Check if admin is creating the course and should auto-approve
    if (user_role === 'admin' && finalApprovalStatus === 'approved') {
      // For admin auto-approval, set approve_user_id and approve_date
      queryFields = `INSERT INTO courses (
        title, description, imageUrl, create_user_id, create_date, learning_point, 
        approval_status, approve_user_id, approve_date, is_deleted
      ) VALUES ($1, $2, $3, $4, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', $5, $6, $7, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', false)`;
      
      queryValues = [
        title, 
        description, 
        imageUrl, 
        create_user_id, 
        learning_point, 
        finalApprovalStatus,
        create_user_id // approve_user_id = create_user_id for admin
      ];
    } else {
      // Regular course creation
      queryFields = `INSERT INTO courses (
        title, description, imageUrl, create_user_id, create_date, learning_point, 
        approval_status, is_deleted
      ) VALUES ($1, $2, $3, $4, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', $5, $6, false)`;
      
      queryValues = [title, description, imageUrl, create_user_id, learning_point, finalApprovalStatus];
    }
    
    queryFields += ` RETURNING *`;
    
    const result = await pool.query(queryFields, queryValues);
    
    const courseId = result.rows[0].id;
    const baseUrl = process.env.BASE_URL || '';
    const courseUrl = `${baseUrl}/courses/${courseId}`;
    
    const updateResult = await pool.query(
      'UPDATE courses SET courseUrl = $1 WHERE id = $2 RETURNING *',
      [courseUrl, courseId]
    );
    
    return updateResult.rows[0];
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Approve or reject course
export const approveCourse = async (id: number, data: ApprovalData): Promise<Course> => {
  const query = `
    UPDATE courses 
    SET 
      approval_status = $1,
      approve_user_id = $2,
      approve_date = NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta',
      rejection_reason = $3,
      edit_user_id = $2,
      edit_date = NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
    WHERE id = $4
    RETURNING *;
  `;
  const values = [
    data.approval_status,
    data.approve_user_id,
    data.rejection_reason || null,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get courses that need approval
export const getCoursesNeedingApproval = async (): Promise<CourseRow[]> => {
  const query = `
    SELECT 
      c.*,
      cu.user_code || '-' || ua.nama_lengkap AS creator_name
    FROM courses c
    LEFT JOIN users cu ON c.create_user_id = cu.id
    LEFT JOIN user_account ua ON ua.user_id = cu.user_id
    WHERE c.approval_status = 'need_approve'
      AND (c.is_deleted IS NULL OR c.is_deleted = false)
    ORDER BY c.create_date ASC
  `;

  const result = await pool.query(query);
  return result.rows;
};

// Soft delete function
export const softDeleteCourse = async (id: number, deleteUserId: number, deleteReason: string): Promise<Course> => {
  const query = `
    UPDATE courses 
    SET 
      is_deleted = true,
      delete_reason = $2,
      delete_user_id = $3,
      delete_date = NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta',
      edit_user_id = $3,
      edit_date = NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
    WHERE id = $1 AND (is_deleted IS NULL OR is_deleted = false)
    RETURNING *;
  `;
  const result = await pool.query(query, [id, deleteReason, deleteUserId]);
  return result.rows[0];
};

// Hard delete function (for admin use only)
export const deleteCourse = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM courses WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Restore soft deleted course
export const restoreCourse = async (id: number, restoreUserId: number): Promise<Course> => {
  const query = `
    UPDATE courses 
    SET 
      is_deleted = false,
      delete_reason = NULL,
      delete_user_id = NULL,
      delete_date = NULL,
      edit_user_id = $2,
      edit_date = NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
    WHERE id = $1 AND is_deleted = true
    RETURNING *;
  `;
  const result = await pool.query(query, [id, restoreUserId]);
  return result.rows[0];
};

// Updated updateCourse function
export const updateCourse = async (courseData: UpdateCourseData): Promise<Course> => {
  const { id, title, description, imageUrl, edit_user_id, learning_point } = courseData;

  try {
    const result = await pool.query(
      `UPDATE courses
      SET title = $1, description = $2, imageUrl = $3, edit_user_id = $4, edit_date = NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', learning_point = $5
      WHERE id = $6 AND (is_deleted IS NULL OR is_deleted = false)
      RETURNING *`,
      [title, description, imageUrl, edit_user_id, learning_point, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// Keep existing functions for backward compatibility
export const getFilterCourses = async (type: string, search: string): Promise<Partial<Course>[]> => {
  const query = `
    SELECT DISTINCT c.id, c.title 
    FROM courses c left join product_type pt on c."type"  = pt.id 
    WHERE c.title ILIKE $2 AND pt.group_product = $1
      AND c.approval_status = 'approved'
      AND (c.is_deleted IS NULL OR c.is_deleted = false)
    LIMIT 5;
  `;

  try {
    console.log(search);
    const result = await pool.query(query, [type, `%${search}%`]);
    return result.rows;
  } catch (error) {
    console.error('Error filtering courses:', error);
    throw error;
  }
};

// Keep other existing functions (createSection, createTopic, createMaterial, etc.) unchanged
export const createSection = async (sectionData: SectionData): Promise<Section> => {
  const { course_id, title, order_index, create_user_id, description, time } = sectionData;
  
  try {
    const result = await pool.query(
      `INSERT INTO sections (course_id, title, position, create_date, create_user_id, description, time)
      VALUES ($1, $2, $3, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', $4, $5, $6)
      RETURNING *`,
      [course_id, title, order_index, create_user_id, description, time]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating section:', error);
    throw error;
  }
};

export const createTopic = async (topicData: TopicData): Promise<Topic> => {
  const { section_id, title, order_index, quiz_id = null, drill_id = null, create_user_id } = topicData;
  
  try {
    const result = await pool.query(
      `INSERT INTO topics (section_id, title, position, quiz_id, drill_id, create_date, create_user_id)
      VALUES ($1, $2, $3, $4, $5, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', $6)
      RETURNING *`,
      [section_id, title, order_index, quiz_id, drill_id, create_user_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

export const updateTopicQuizDrill = async (topicId: number, quiz_id: number | null, drill_id: number | null): Promise<Topic> => {
  try {
    const result = await pool.query(
      `UPDATE topics SET quiz_id = $1, drill_id = $2
      WHERE id = $3 RETURNING *`,
      [quiz_id, drill_id, topicId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating topic quiz/drill:', error);
    throw error;
  }
};

export const createMaterial = async (materialData: MaterialData): Promise<Material> => {
  const { 
    topic_id, 
    title, 
    content, 
    isMandatory, 
    video_url = null, 
    video_file_name = null,
    order_index,
    create_user_id,
    hasVideo,
    videoType
  } = materialData;
  
  try {
    const result = await pool.query(
      `INSERT INTO materials (topic_id, title, content, is_mandatory, video_url, video_file_name, position, create_date, create_user_id, has_video, video_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', $8, $9, $10)
      RETURNING *`,
      [topic_id, title, content, isMandatory, video_url, video_file_name, order_index, create_user_id, hasVideo, videoType]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating material:', error);
    throw error;
  }
};

export const getUserCourseProgress = async (userId: string): Promise<UserCourseProgress[]> => {
  try {
    const query = `
      WITH material_count AS (
        SELECT
          (
            SELECT COUNT(t.id) 
            FROM topics t
            LEFT JOIN sections s ON s.id = t.section_id
            WHERE s.course_id = c.id
          ) quiz,
          (
            SELECT COUNT(m.id) 
            FROM materials m
            LEFT JOIN topics t ON t.id = m.topic_id
            LEFT JOIN sections s ON s.id = t.section_id
            WHERE s.course_id = c.id
          ) material,
          c.id
        FROM courses c
        WHERE c.approval_status = 'approved' AND (c.is_deleted IS NULL OR c.is_deleted = false)
      )
      SELECT
        c.id, 
        c.title, 
        c.description, 
        c.imageurl, 
        c."type", 
        c.learning_point, 
        c.course_string,
        ce.user_id,
        COUNT(DISTINCT CASE
          WHEN u.quiz_id IS NOT NULL THEN u.topic_id
        END) AS finished_quiz_topics,
        COUNT(DISTINCT u.material_id) AS finished_materials,
        mc.quiz,
        mc.material,
        -- Calculate progress percentages
        CASE 
          WHEN mc.quiz > 0 THEN 
            ROUND((COUNT(DISTINCT CASE WHEN u.quiz_id IS NOT NULL THEN u.topic_id END) * 100.0) / mc.quiz, 2)
          ELSE 0 
        END AS quiz_progress_percentage,
        CASE 
          WHEN mc.material > 0 THEN 
            ROUND((COUNT(DISTINCT u.material_id) * 100.0) / mc.material, 2)
          ELSE 0 
        END AS material_progress_percentage,
        CASE 
          WHEN (mc.quiz + mc.material) > 0 THEN 
            ROUND(((COUNT(DISTINCT CASE WHEN u.quiz_id IS NOT NULL THEN u.topic_id END) + COUNT(DISTINCT u.material_id)) * 100.0) / (mc.quiz + mc.material), 2)
          ELSE 0 
        END AS overall_progress_percentage,
        ce.expires_at
      FROM course_entitlements ce
      LEFT JOIN courses c ON c.id = ce.course_id
      LEFT JOIN material_count mc ON mc.id = c.id
      LEFT JOIN sections s ON s.course_id = c.id
      LEFT JOIN topics t ON t.section_id = s.id
      LEFT JOIN usercoursesession u ON u.topic_id = t.id AND u.user_id = ce.user_id
      WHERE ce.user_id = $1 
        AND (ce.expires_at IS NULL OR ce.expires_at > NOW())
        AND c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
      GROUP BY c.id, c.title, c.description, c.imageurl, c."type", c.learning_point, c.course_string, ce.user_id, mc.quiz, mc.material, ce.expires_at
      ORDER BY c.title
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error getting user course progress:', error);
    throw error;
  }
};

export const getUserCourseProgressByCourseId = async (userId: string, courseId: number): Promise<UserCourseProgress | null> => {
  try {
    const query = `
      WITH material_count AS (
        SELECT
          (
            SELECT COUNT(t.id) 
            FROM topics t
            LEFT JOIN sections s ON s.id = t.section_id
            WHERE s.course_id = c.id
          ) quiz,
          (
            SELECT COUNT(m.id) 
            FROM materials m
            LEFT JOIN topics t ON t.id = m.topic_id
            LEFT JOIN sections s ON s.id = t.section_id
            WHERE s.course_id = c.id
          ) material,
          c.id
        FROM courses c
        WHERE c.id = $2 AND c.approval_status = 'approved' AND (c.is_deleted IS NULL OR c.is_deleted = false)
      )
      SELECT
        c.id, 
        c.title, 
        c.description, 
        c.imageurl, 
        c."type", 
        c.learning_point, 
        c.course_string,
        ce.user_id,
        COUNT(DISTINCT CASE
          WHEN u.quiz_id IS NOT NULL THEN u.topic_id
        END) AS finished_quiz_topics,
        COUNT(DISTINCT u.material_id) AS finished_materials,
        mc.quiz,
        mc.material,
        -- Calculate progress percentages
        CASE 
          WHEN mc.quiz > 0 THEN 
            ROUND((COUNT(DISTINCT CASE WHEN u.quiz_id IS NOT NULL THEN u.topic_id END) * 100.0) / mc.quiz, 2)
          ELSE 0 
        END AS quiz_progress_percentage,
        CASE 
          WHEN mc.material > 0 THEN 
            ROUND((COUNT(DISTINCT u.material_id) * 100.0) / mc.material, 2)
          ELSE 0 
        END AS material_progress_percentage,
        CASE 
          WHEN (mc.quiz + mc.material) > 0 THEN 
            ROUND(((COUNT(DISTINCT CASE WHEN u.quiz_id IS NOT NULL THEN u.topic_id END) + COUNT(DISTINCT u.material_id)) * 100.0) / (mc.quiz + mc.material), 2)
          ELSE 0 
        END AS overall_progress_percentage,
        ce.expires_at
      FROM course_entitlements ce
      LEFT JOIN courses c ON c.id = ce.course_id
      LEFT JOIN material_count mc ON mc.id = c.id
      LEFT JOIN sections s ON s.course_id = c.id
      LEFT JOIN topics t ON t.section_id = s.id
      LEFT JOIN usercoursesession u ON u.topic_id = t.id AND u.user_id = ce.user_id
      WHERE ce.user_id = $1 
        AND ce.course_id = $2
        AND (ce.expires_at IS NULL OR ce.expires_at > NOW())
        AND c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
      GROUP BY c.id, c.title, c.description, c.imageurl, c."type", c.learning_point, c.course_string, ce.user_id, mc.quiz, mc.material, ce.expires_at
    `;

    const result = await pool.query(query, [userId, courseId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error getting user course progress by course ID:', error);
    throw error;
  }
};