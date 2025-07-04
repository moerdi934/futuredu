// models/course.model.ts
import pool from '../lib/db';
import { PoolClient } from 'pg';

// Types
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
}

// Course Model Functions
export const getAll = async (): Promise<Course[]> => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY title');
    return result.rows;
  } catch (error) {
    console.error('Error getting all courses:', error);
    throw error;
  }
};

export const searchAll = async (search: string = ''): Promise<Partial<Course>[]> => {
  try {
    let query = 'SELECT id, title, description, imageUrl, courseUrl FROM courses ORDER BY title';
    const values: string[] = [];
    if (search) {
      query = 'SELECT id, title, description, imageUrl, courseUrl FROM courses WHERE title ILIKE $1 ORDER BY title';
      values.push(`%${search}%`);
    }
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error searching courses:', error);
    throw error;
  }
};

export const getFilterCourses = async (type: string, search: string): Promise<Partial<Course>[]> => {
  const query = `
    SELECT DISTINCT c.id, c.title 
    FROM courses c left join product_type pt on c."type"  = pt.id 
    WHERE c.title ILIKE $2 AND pt.group_product = $1
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

export const createCourse = async (courseData: CourseData): Promise<Course> => {
  const { title, description, imageUrl, create_user_id } = courseData;
  
  try {
    const result = await pool.query(
      `INSERT INTO courses (title, description, imageUrl, create_user_id, create_date) 
      VALUES ($1, $2, $3, $4, NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') 
      RETURNING id`,
      [title, description, imageUrl, create_user_id]
    );
    
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

export const updateCourse = async (courseData: UpdateCourseData): Promise<Course> => {
  const { id, title, description, imageUrl, edit_user_id } = courseData;

  try {
    const result = await pool.query(
      `UPDATE courses
      SET title = $1, description = $2, imageUrl = $3, edit_user_id = $4, edit_date = NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta'
      WHERE id = $5
      RETURNING *`,
      [title, description, imageUrl, edit_user_id, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const deleteCourse = async (id: number): Promise<void> => {
  try {
    await pool.query('DELETE FROM courses WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};