// models/userCourse.model.ts
import pool from '../lib/db';

// Types
export interface UserCourseSession {
  id?: number;
  user_id: number;
  topic_id?: number;
  material_id?: number;
  quiz_id?: number;
  create_date?: Date;
  update_date?: Date;
}

export interface UserCourseSessionTimer {
  id?: number;
  user_id: number;
  topic_id?: number;
  material_id?: number;
  start_time?: Date;
  elapsed_time?: number;
}

export interface MaterialWithAccess {
  id: number;
  title: string;
  content?: string;
  topic_id: number;
  position: number;
  is_mandatory: boolean;
  has_video: boolean;
  is_finish: boolean;
  [key: string]: any;
}

export interface CourseDetailResponse {
  courseId: number;
  title: string;
  description: string;
  imageurl?: string;
  learningPoint?: string;
  isEntitled: boolean;
  sections: SectionDetail[];
}

export interface SectionDetail {
  id: number;
  title: string;
  description?: string;
  durasi?: string;
  position: number;
  section_string: string;
  progress: number;
  bonusProgress: number;
  finished: number;
  totalMandatory: number;
  bonus: number;
  totalBonus: number;
  topics: TopicDetail[];
}

export interface TopicDetail {
  id: number;
  title: string;
  position: number;
  quiz_id?: number;
  drill_id?: number;
  quiz_completed?: boolean;
  drill_completed?: boolean;
  quiz_question_count?: number;
  drill_question_count?: number;
  quiz_accessible?: boolean;
  drill_accessible?: boolean;
  materials?: MaterialDetail[];
}

export interface MaterialDetail {
  id: number;
  title: string;
  is_mandatory: boolean;
  has_video: boolean;
  position: number;
  is_completed: boolean;
  is_accessible: boolean;
}

export interface SectionDetailResponse {
  courseTitle: string;
  courseString: string;
  sectionId: number;
  sectionTitle: string;
  sectionDescription?: string;
  durasi?: string;
  sectionPosition: number;
  isEntitled: boolean;
  topics: TopicDetail[];
}

// Get all user courses
export const getAll = async (): Promise<UserCourseSession[]> => {
  try {
    const result = await pool.query(`
      SELECT * FROM usercoursesession 
      ORDER BY create_date DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching all user courses:', error);
    throw error;
  }
};

export const getMaterialById = async (material_id: number, user_id: number): Promise<MaterialWithAccess[]> => {
  const sql = `
    SELECT
      m.*,
      -- cek apakah user sudah selesai
      CASE WHEN uc.user_id IS NOT NULL THEN true ELSE false END AS is_finish
    FROM materials m
    JOIN topics   t ON t.id        = m.topic_id
    JOIN sections s ON s.id        = t.section_id
    JOIN courses  c ON c.id        = s.course_id
    -- join ke entitlement (jika ada)
    LEFT JOIN course_entitlements ce
      ON ce.course_id = c.id
     AND ce.user_id   = $2
    -- sesi usercoursesession
    LEFT JOIN userCoursesession uc
      ON uc.material_id = m.id
     AND uc.topic_id    = m.topic_id
     AND uc.user_id     = $2
    WHERE m.id = $1
      AND (
        -- always allow topik #1 materi #1
        (t.position = 1 AND m.position = 1)
        -- atau user entitled ke course ini
        OR ce.user_id IS NOT NULL
      )
  `;
  const { rows } = await pool.query(sql, [material_id, user_id]);
  return rows;
};

// Get user course by ID
export const getById = async (id: number): Promise<UserCourseSession | null> => {
  try {
    const query = 'SELECT * FROM usercoursesession WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching user course by id:', error);
    throw error;
  }
};

// Get user courses by user_id
export const getByUserId = async (userId: number): Promise<UserCourseSession[]> => {
  try {
    const query = `
      SELECT * FROM usercoursesession 
      WHERE user_id = $1 
      ORDER BY create_date DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching user courses by user_id:', error);
    throw error;
  }
};

// Get user courses by topic_id
export const getByTopicId = async (topicId: number): Promise<UserCourseSession[]> => {
  try {
    const query = `
      SELECT * FROM usercoursesession 
      WHERE topic_id = $1 
      ORDER BY create_date DESC
    `;
    const result = await pool.query(query, [topicId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching user courses by topic_id:', error);
    throw error;
  }
};

// Get user courses by topic_id and material_id
export const getByTopicAndMaterial = async (topicId: number, materialId: number): Promise<UserCourseSession[]> => {
  try {
    const query = `
      SELECT * FROM usercoursesession 
      WHERE topic_id = $1 AND material_id = $2
      ORDER BY create_date DESC
    `;
    const result = await pool.query(query, [topicId, materialId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching user courses by topic_id and material_id:', error);
    throw error;
  }
};

// Create new user course
export const create = async (usercoursesessionData: Omit<UserCourseSession, 'id' | 'create_date' | 'update_date'>): Promise<UserCourseSession> => {
  try {
    const { user_id, topic_id, material_id, quiz_id } = usercoursesessionData;
    
    const query = `
      INSERT INTO usercoursesession (user_id, topic_id, material_id, quiz_id, create_date)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const values = [user_id, topic_id, material_id, quiz_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user course:', error);
    throw error;
  }
};

// Update user course
export const update = async (id: number, usercoursesessionData: Omit<UserCourseSession, 'id' | 'create_date' | 'update_date'>): Promise<UserCourseSession | null> => {
  try {
    const { user_id, topic_id, material_id, quiz_id } = usercoursesessionData;
    
    const query = `
      UPDATE usercoursesession 
      SET user_id = $1, topic_id = $2, material_id = $3, quiz_id = $4, update_date = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    
    const values = [user_id, topic_id, material_id, quiz_id, id];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating user course:', error);
    throw error;
  }
};

// Search user courses by user_id or topic_id
export const search = async (searchTerm: string): Promise<UserCourseSession[]> => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    const query = `
      SELECT * FROM usercoursesession
      WHERE CAST(user_id AS TEXT) ILIKE $1 
         OR CAST(topic_id AS TEXT) ILIKE $1
         OR CAST(material_id AS TEXT) ILIKE $1
         OR CAST(quiz_id AS TEXT) ILIKE $1
      ORDER BY create_date DESC
      LIMIT 10
    `;
    
    const values = [`%${searchTerm}%`];
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error searching user courses:', error);
    throw error;
  }
};

// Check if user course exists
export const exists = async (userId: number, topicId: number, material_id: number): Promise<boolean> => {
  try {
    const query = `
      SELECT id FROM usercoursesession 
      WHERE user_id = $1 AND topic_id = $2 AND material_id = $3
    `;
    const result = await pool.query(query, [userId, topicId, material_id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking user course existence:', error);
    throw error;
  }
};

export const createTimer = async (usercoursesessiontimerData: Omit<UserCourseSessionTimer, 'id'>, create_user_id: number): Promise<UserCourseSessionTimer> => {
  try {
    const { topic_id, material_id, start_time, elapsed_time } = usercoursesessiontimerData;
    
    const query = `
      INSERT INTO usercoursesessiontimer (user_id, topic_id, material_id, start_time, elapsed_time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [create_user_id, topic_id, material_id, start_time, elapsed_time];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user course timer:', error);
    throw error;
  }
};