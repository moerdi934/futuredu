// models/classes.model.ts
import pool from '../lib/db';

// Types
export interface ClassGetOptions {
  sortField?: string;
  sortOrder?: string;
  search?: string;
  searchDate?: string;
  page?: number;
  limit?: number;
  status?: string;
  courseId?: string;
  teacherId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
  includeDeleted?: string; // 'false' | 'true' | 'only_deleted'
}

export interface ClassData {
  name: string;
  course_id: string;
  description: string;
  teacher_id: string;
  student_list: number[];
  start_date: string;
  end_date: string;
  create_user_id: string;
}

export interface ClassUpdateData {
  name: string;
  course_id: string;
  description: string;
  teacher_id: string;
  student_list_ids: number[];
  start_time: string;
  end_time: string;
  edit_user_id: string;
}

export interface ClassRow {
  id: number;
  name: string;
  course_id: string;
  course_name: string;
  description: string;
  teacher_id: string;
  teacher_name: string;
  student_list: number[];
  student_list_names: string[];
  start_date: string;
  end_date: string;
  creator_name: string;
  create_user_id: string;
  create_date: string;
  edit_user_id: string;
  edit_date: string;
  event_id: number;
  starter_user_id: string;
  is_started: boolean;
  status: string;
  is_deleted: boolean;
  delete_reason?: string;
  delete_user_id?: string;
  delete_date?: string;
  total?: number;
}

export interface ClassesResult {
  classes: ClassRow[];
  total: number;
}

export const getClasses = async (options: ClassGetOptions = {}): Promise<ClassesResult> => {
  const {
    sortField = 'id',
    sortOrder = 'asc',
    search = '',
    searchDate = '',
    page = 1,
    limit = 10,
    status = '',
    courseId = '',
    teacherId = '',
    studentId = '',
    startDate = '',
    endDate = '',
    includeDeleted = 'false'
  } = options;

  const offset = (page - 1) * limit;
  let query = ` 
  WITH filtered_classes AS (
    SELECT 
      c.id,
      c.name,
      c.course_id,
      co.title AS course_name,
      c.description,
      c.teacher_id,
      u.user_code || '-' ||ua.nama_lengkap AS teacher_name,
      c.student_list,
      COALESCE(ARRAY_AGG(s.user_code || '-' ||ua3.nama_lengkap) FILTER (WHERE ua3.nama_lengkap IS NOT NULL), '{}') AS student_list_names,
      c.start_date,
      c.end_date,
      cu.user_code || '-' ||ua2.nama_lengkap AS creator_name,
      c.create_user_id,
      c.create_date,
      c.edit_user_id,
      c.edit_date,
      e.id event_id,
      e.starter_user_id,
      e.is_started,
      c.is_deleted,
      c.delete_reason,
      c.delete_user_id,
      c.delete_date,
      case
        when c.is_deleted = true then 'Deleted'
        when fs.start_time<now() and fs.end_time is null then 'Started'
        when fs.end_time is not null then 'Finished'
        when fs.start_time is null then 'Not Start'
        else 'Not Start'
      end status
    FROM classes c
    LEFT JOIN courses co ON c.course_id = co.id
    LEFT JOIN users u ON c.teacher_id = u.id
    LEFT JOIN user_account ua ON ua.user_id = u.user_id
    LEFT JOIN users cu ON c.create_user_id = cu.id
    LEFT JOIN user_account ua2 ON ua2.user_id = cu.user_id
    LEFT JOIN users s ON s.id = ANY(c.student_list)
    LEFT JOIN user_account ua3 ON ua3.user_id = s.user_id
    LEFT JOIN events e ON e.master_id = c.id
    LEFT JOIN (
        SELECT f.*
        FROM fsession f
        WHERE f.create_date = (
            SELECT MAX(f2.create_date)
            FROM fsession f2
            WHERE f2.eventid = f.eventid
        )
    ) fs ON fs.eventid = e.id
    WHERE e.event_type = 1 
  `;

  const values: any[] = [];
  const conditions: string[] = [];

  // Handle delete filter logic
  if (includeDeleted === 'false') {
    // Show only active records (default behavior)
    conditions.push('AND (c.is_deleted IS NULL OR c.is_deleted = false)');
  } else if (includeDeleted === 'only_deleted') {
    // Show only deleted records
    conditions.push('AND c.is_deleted = true');
  }
  // If includeDeleted === 'true', show all records (no additional condition)

  // Filter by status (ignore if "All")
  if (status && status !== 'All') {
    values.push(status);
    conditions.push(`
      AND (case
        when c.is_deleted = true then 'Deleted'
        when fs.start_time<now() and fs.end_time is null then 'Started'
        when fs.end_time is not null then 'Finished'
        when fs.start_time is null then 'Not Start'
        else 'Not Start'
      end) = $${values.length}
    `);
  }
  
  // Filter by course ID (ignore if "All")
  if (courseId && courseId !== 'All') {
    values.push(courseId);
    conditions.push(`AND c.course_id = $${values.length}`);
  }
  
  // Filter by teacher ID (ignore if "All")
  if (teacherId && teacherId !== 'All') {
    values.push(teacherId);
    conditions.push(`AND c.teacher_id = $${values.length}`);
  }
  
  // Filter by student ID (ignore if "All")
  if (studentId && studentId !== 'All') {
    values.push(studentId);
    conditions.push(`AND $${values.length}::int = ANY(c.student_list)`);
  }
  
  // Filter by date range (ignore if "All")
  if (startDate && startDate !== 'All' && endDate && endDate !== 'All') {
    values.push(new Date(startDate), new Date(endDate));
    conditions.push(`AND c.start_date >= $${values.length - 1} AND c.start_date <= $${values.length}`);
  } else if (startDate && startDate !== 'All') {
    values.push(new Date(startDate));
    conditions.push(`AND c.start_date >= $${values.length}`);
  } else if (endDate && endDate !== 'All') {
    values.push(new Date(endDate));
    conditions.push(`AND c.start_date <= $${values.length}`);
  }
  
  // Filter by specific date (ignore if "All")
  if (searchDate && searchDate !== 'All') {
    values.push(new Date(searchDate));
    conditions.push(`AND DATE(c.start_date) = DATE($${values.length})`);
  }
  
  // Filter by search term
  if (search) {  
    values.push(`%${search}%`);
    values.push(`%${search}%`);
    values.push(`%${search}%`);
    conditions.push(`AND (c.name ILIKE $${values.length - 2} OR co.title ILIKE $${values.length - 1} OR c.description ILIKE $${values.length})`);
  }

  if (conditions.length > 0) {
    query += `${conditions.join(' ')}`;
  }
 
  // Group by clause
  query += `
    GROUP BY 
      c.course_id,
      c.teacher_id,
      c.id,
      c.name,
      co.title,
      c.description,
      ua.nama_lengkap,
      c.student_list,
      c.start_date,
      c.end_date,
      ua2.nama_lengkap,
      u.user_code,
      cu.user_code,
      c.create_user_id,
      c.create_date,
      c.edit_user_id,
      c.edit_date,
      c.is_deleted,
      c.delete_reason,
      c.delete_user_id,
      c.delete_date,
      e.id, 
      e.starter_user_id,
      e.is_started,
      case
        when c.is_deleted = true then 'Deleted'
        when fs.start_time<now() and fs.end_time is null then 'Started'
        when fs.end_time is not null then 'Finished'
        when fs.start_time is null then 'Not Start'
        else 'Not Start'
      end)
          SELECT 
      *, 
      COUNT(*) OVER() AS total 
    FROM filtered_classes
  `;

  // Sorting
  const validSortFields = ['id', 'name', 'course_name', 'description', 'teacher_name', 'start_date', 'end_date', 'creator_name', 'delete_date'];
  if (validSortFields.includes(sortField.toLowerCase()) && ['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;
  } else {
    query += ` ORDER BY id ASC`;
  }

  query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  const result = await pool.query(query, [...values, limit, offset]);
  return {
    classes: result.rows,
    total: result.rows.length > 0 ? result.rows[0].total : 0
  };
};

export const getClassesById = async (id: string, includeDeleted: boolean = false): Promise<ClassRow | null> => {
  let query = `
  SELECT 
    c.id,
    c.name,
    c.course_id,
    co.title AS course_name,
    c.description,
    c.teacher_id,
    u.user_code || '-' ||ua.nama_lengkap AS teacher_name,
    c.student_list,
    COALESCE(ARRAY_AGG(s.user_code || '-' ||ua3.nama_lengkap) FILTER (WHERE ua3.nama_lengkap IS NOT NULL), '{}') AS student_list_names,
    c.start_date,
    c.end_date,
    cu.user_code || '-' ||ua2.nama_lengkap AS creator_name,
    c.create_user_id,
    c.create_date,
    c.edit_user_id,
    c.edit_date,
    c.is_deleted,
    c.delete_reason,
    c.delete_user_id,
    c.delete_date,
    e.id event_id,
    e.starter_user_id,
    e.is_started,
    case
      when c.is_deleted = true then 'Deleted'
      when fs.start_time<now() and fs.end_time is null then 'Started'
      when fs.end_time is not null then 'Finished'
      when fs.start_time is null then 'Not Start'
      else 'Not Start'
    end status
  FROM classes c
  LEFT JOIN courses co ON c.course_id = co.id
  LEFT JOIN users u ON c.teacher_id = u.id
  LEFT JOIN user_account ua ON ua.user_id = u.user_id
  LEFT JOIN users cu ON c.create_user_id = cu.id
  LEFT JOIN user_account ua2 ON ua2.user_id = cu.user_id
  LEFT JOIN users s ON s.id = ANY(c.student_list)
  LEFT JOIN user_account ua3 ON ua3.user_id = s.user_id
  LEFT JOIN events e ON e.master_id = c.id
  LEFT JOIN (
      SELECT f.*
      FROM fsession f
      WHERE f.create_date = (
          SELECT MAX(f2.create_date)
          FROM fsession f2
          WHERE f2.eventid = f.eventid
      )
  ) fs ON fs.eventid = e.id
  WHERE c.id = $1 and e.event_type = 1
  `;

  // Add soft delete filter if not including deleted records
  if (!includeDeleted) {
    query += ` AND (c.is_deleted IS NULL OR c.is_deleted = false)`;
  }

  query += `
  GROUP BY 
    c.course_id,
    c.teacher_id,
    c.id,
    c.name,
    co.title,
    c.description,
    ua.nama_lengkap,
    c.student_list,
    c.start_date,
    c.end_date,
    ua2.nama_lengkap,
    u.user_code,
    cu.user_code,
    c.create_user_id,
    c.create_date,
    c.edit_user_id,
    c.edit_date,
    c.is_deleted,
    c.delete_reason,
    c.delete_user_id,
    c.delete_date,
    e.id, 
    e.starter_user_id,
    e.is_started,
    case
      when c.is_deleted = true then 'Deleted'
      when fs.start_time<now() and fs.end_time is null then 'Started'
      when fs.end_time is not null then 'Finished'
      when fs.start_time is null then 'Not Start'
      else 'Not Start'
    end
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};
 
export const createClass = async (data: ClassData): Promise<ClassRow> => {
  const query = `
    INSERT INTO classes 
      (name, course_id, description, teacher_id, student_list, start_date, end_date, create_user_id, create_date, is_deleted)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), false)
    RETURNING *;
  `;
  const values = [
    data.name,
    data.course_id,
    data.description,
    data.teacher_id,
    data.student_list,
    data.start_date,
    data.end_date,
    data.create_user_id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updateClass = async (id: string, data: ClassUpdateData): Promise<ClassRow> => {
  console.log("data model", data);
  const query = `
    UPDATE classes 
    SET 
      name = $1,
      course_id = $2,
      description = $3,
      teacher_id = $4,
      student_list = $5,
      start_date = $6,
      end_date = $7,
      edit_user_id = $8,
      edit_date = NOW()
    WHERE id = $9 AND (is_deleted IS NULL OR is_deleted = false)
    RETURNING *;
  `;
  const values = [
    data.name,
    data.course_id,
    data.description,
    data.teacher_id,
    data.student_list_ids,
    data.start_time,
    data.end_time,
    data.edit_user_id,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Soft delete function
export const softDeleteClass = async (id: string, deleteUserId: string, deleteReason: string): Promise<ClassRow> => {
  const query = `
    UPDATE classes 
    SET 
      is_deleted = true,
      delete_reason = $2,
      delete_user_id = $3,
      delete_date = NOW(),
      edit_user_id = $3,
      edit_date = NOW()
    WHERE id = $1 AND (is_deleted IS NULL OR is_deleted = false)
    RETURNING *;
  `;
  const result = await pool.query(query, [id, deleteReason, deleteUserId]);
  return result.rows[0];
};

// Hard delete function (for admin use only)
export const deleteClass = async (id: string): Promise<ClassRow> => {
  const query = `DELETE FROM classes WHERE id = $1 RETURNING *;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Restore soft deleted class
export const restoreClass = async (id: string, restoreUserId: string): Promise<ClassRow> => {
  const query = `
    UPDATE classes 
    SET 
      is_deleted = false,
      delete_reason = NULL,
      delete_user_id = NULL,
      delete_date = NULL,
      edit_user_id = $2,
      edit_date = NOW()
    WHERE id = $1 AND is_deleted = true
    RETURNING *;
  `;
  const result = await pool.query(query, [id, restoreUserId]);
  return result.rows[0];
};