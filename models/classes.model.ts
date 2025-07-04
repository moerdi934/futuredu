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
    endDate = ''
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
      case
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

  // Filter by status (ignore if "All")
  if (status && status !== 'All') {
    values.push(status);
    conditions.push(`
      AND (case
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
      e.id, 
      e.starter_user_id,
      e.is_started,
      case
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
  const validSortFields = ['id', 'name', 'course_name', 'description', 'teacher_name', 'start_date', 'end_date', 'creator_name'];
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

export const getClassesById = async (id: string): Promise<ClassRow | null> => {
  const query = `
  SELECT 
    c.id,
    c.name,
    c.course_id,
    co.title AS course_name,
    c.description,
    c.teacher_id,
    u.username AS teacher_name,
    c.student_list,
    COALESCE(ARRAY_AGG(s.username) FILTER (WHERE s.username IS NOT NULL), '{}') AS student_list_names,
    c.start_date,
    c.end_date,
    cu.username AS creator_name,
    c.create_user_id,
    c.create_date,
    c.edit_user_id,
    c.edit_date,
    e.id event_id,
    e.starter_user_id
  FROM classes c
  LEFT JOIN courses co ON c.course_id = co.id
  LEFT JOIN users u ON c.teacher_id = u.id
  LEFT JOIN users cu ON c.create_user_id = cu.id
  LEFT JOIN users s ON s.id = ANY(c.student_list)
  LEFT JOIN events e ON e.master_id = c.id
   WHERE c.id = $1 and e.event_type = 1
  GROUP BY 
    c.course_id,
    c.teacher_id,
    c.id,
    c.name,
    co.title,
    c.description,
    u.username,
    c.student_list,
    c.start_date,
    c.end_date,
    cu.username,
    c.create_user_id,
    c.create_date,
    c.edit_user_id,
    c.edit_date,
    e.id, 
    e.starter_user_id
`;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};
 
export const createClass = async (data: ClassData): Promise<ClassRow> => {
  const query = `
    INSERT INTO classes 
      (name, course_id, description, teacher_id, student_list, start_date, end_date, create_user_id, create_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
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
    WHERE id = $9
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

export const deleteClass = async (id: string): Promise<ClassRow> => {
  const query = `DELETE FROM classes WHERE id = $1 RETURNING *;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};