// controllers/userCourse.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../lib/db';
import * as UserCourse from '../models/userCourse.model';
import { AuthenticatedRequest } from '../lib/middleware/auth';

export const getCourseDetailReadable = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const client = await pool.connect();
  
  try {
    const { courseString } = req.query;
    
    if (!courseString || typeof courseString !== 'string') {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const userId = req.user?.id || null;
    console.log(userId);

    const query = `
      SELECT 
        c.id as course_id, 
        c.title as course_title, 
        c.description as course_description,
        c.imageurl as course_imageurl,
        c.learning_point as course_learning_point,
        s.id as section_id, 
        s.title as section_title, 
        s.description as section_description,
        s.time as durasi,
        s.position as section_position,
        s.section_string,
        t.id as topic_id,
        t.title as topic_title, 
        t.position as topic_position,
        EXISTS(
          SELECT 1 FROM course_entitlements ce
          WHERE ce.course_id = c.id 
            AND ce.user_id = $2
            AND (ce.expires_at is null or ce.expires_at > now())
        ) as is_entitled,
        
        -- Finished count (mandatory materials + quizzes completed)
        COALESCE((
          SELECT DISTINCT COUNT(ucs.material_id)::integer 
          FROM usercoursesession ucs
          LEFT JOIN topics t2 ON t2.id = ucs.topic_id
          LEFT JOIN materials m2 ON m2.id = ucs.material_id
          WHERE t2.section_id = s.id 
            AND ucs.user_id = $2
            AND m2.is_mandatory = true
        ), 0) + COALESCE((
          SELECT DISTINCT COUNT(ucs.quiz_id)::integer 
          FROM usercoursesession ucs
          LEFT JOIN topics t2 ON t2.id = ucs.topic_id
          WHERE t2.section_id = s.id 
            AND ucs.user_id = $2
            AND ucs.quiz_id IS NOT NULL
        ), 0) as finished,
        
        -- Bonus count (non-mandatory materials completed)
        COALESCE((
          SELECT DISTINCT COUNT(ucs.material_id)::integer 
          FROM usercoursesession ucs
          LEFT JOIN topics t2 ON t2.id = ucs.topic_id
          LEFT JOIN materials m2 ON m2.id = ucs.material_id
          WHERE t2.section_id = s.id 
            AND ucs.user_id = $2
            AND m2.is_mandatory = false
        ), 0) as bonus,
        
        -- Total mandatory materials in section
        COALESCE((
          SELECT COUNT(DISTINCT m.id)::integer
          FROM materials m
          LEFT JOIN topics t3 ON t3.id = m.topic_id
          WHERE t3.section_id = s.id 
            AND m.is_mandatory = true
        ), 0) as total_mandatory_materials,
        
        -- Total quizzes in section (1 quiz per topic)
        COALESCE((
          SELECT COUNT(DISTINCT t4.id)::integer
          FROM topics t4
          WHERE t4.section_id = s.id
        ), 0) as total_quizzes,
        
        -- Total bonus materials in section
        COALESCE((
          SELECT COUNT(DISTINCT m.id)::integer
          FROM materials m
          LEFT JOIN topics t5 ON t5.id = m.topic_id
          WHERE t5.section_id = s.id 
            AND m.is_mandatory = false
        ), 0) as total_bonus_materials
        
      FROM courses c 
      LEFT JOIN sections s ON s.course_id = c.id 
      LEFT JOIN topics t ON t.section_id = s.id 
      WHERE c.course_string = $1
      ORDER BY s.position, t.position
    `;

    const result = await client.query(query, [courseString, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const sectionsMap = new Map();
    const topicsMap = new Map();

    const isEntitled = result.rows[0].is_entitled;

    result.rows.forEach((row: any) => {
      if (!row.section_id) return;

      if (!sectionsMap.has(row.section_id)) {
        // Calculate progress and bonus progress
        const totalMandatoryItems = parseInt(row.total_mandatory_materials) + parseInt(row.total_quizzes);
        console.log(row.total_mandatory_materials, ',', row.total_quizzes, ',', totalMandatoryItems);
        const progress = totalMandatoryItems > 0 
          ? Math.ceil((row.finished / totalMandatoryItems) * 100) 
          : 0;
        
        const bonusProgress = row.total_bonus_materials > 0 
          ? Math.ceil((row.bonus / row.total_bonus_materials) * 100) 
          : 0;

        sectionsMap.set(row.section_id, {
          id: row.section_id,
          title: row.section_title,
          description: row.section_description,
          durasi: row.durasi,
          position: row.section_position,
          section_string: row.section_string,
          progress: progress,
          bonusProgress: bonusProgress,
          finished: row.finished,
          totalMandatory: totalMandatoryItems,
          bonus: row.bonus,
          totalBonus: row.total_bonus_materials,
          topics: []
        });
      }

      if (row.topic_id && !topicsMap.has(row.topic_id)) {
        const topicData = {
          id: row.topic_id,
          title: row.topic_title,
          position: row.topic_position
        };

        topicsMap.set(row.topic_id, topicData);
        sectionsMap.get(row.section_id).topics.push(topicData);
      }
    });

    const sections = Array.from(sectionsMap.values())
      .sort((a: any, b: any) => a.position - b.position)
      .map((section: any) => ({
        ...section,
        topics: section.topics.sort((a: any, b: any) => a.position - b.position)
      }));

    const response: UserCourse.CourseDetailResponse = {
      courseId: result.rows[0].course_id,
      title: result.rows[0].course_title,
      description: result.rows[0].course_description,
      imageurl: result.rows[0].course_imageurl,
      learningPoint: result.rows[0].course_learning_point,
      isEntitled,
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

export const getMaterial = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const user_id = req.user?.id || null;
    const materialId = req.query.materialId;
    
    if (!materialId || typeof materialId !== 'string') {
      return res.status(400).json({ message: 'Material ID is required' });
    }
    
    const material_id = parseInt(materialId, 10);

    const rows = await UserCourse.getMaterialById(material_id, user_id);

    if (rows.length === 0) {
      return res.status(403).json({ message: 'Access denied to this material' });
    }

    const material = rows[0];
    res.status(200).json({ material });
  } catch (error: any) {
    console.error('Error fetching materials: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getSectionDetailReadable = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const client = await pool.connect();
  try {
    const { sectionString } = req.query;
    if (!sectionString || typeof sectionString !== 'string') {
      return res.status(400).json({ message: 'Section string is required' });
    }

    const userId = req.user?.id || null;

    const query = `
      SELECT
        c.title                  AS course_title,
        c.course_string          AS course_string,
        s.id                     AS section_id,
        s.title                  AS section_title,
        s.description            AS section_description,
        s.time                   AS durasi,
        s.position               AS section_position,
        t.id                     AS topic_id,
        t.title                  AS topic_title,
        t.position               AS topic_position,
        t.quiz_id                AS quiz_id,
        t.drill_id               AS drill_id,
        m.id                     AS material_id,
        m.title                  AS material_title,
        m.is_mandatory           AS is_mandatory,
        m.has_video              AS has_video,
        m.position               AS material_position,
        -- entitlement flag
        EXISTS (
          SELECT 1
          FROM course_entitlements ce
          WHERE ce.course_id = c.id
            AND ce.user_id   = $2
        )                        AS is_entitled,
        -- completion flags
        (SELECT COUNT(*)>0 FROM usercoursesession ucs
         WHERE ucs.material_id = m.id
           AND ucs.topic_id    = t.id
           AND ucs.user_id     = $2
        )                        AS is_completed,
        (SELECT COUNT(*)>0 FROM usercoursesession ucs
         WHERE ucs.quiz_id  = t.quiz_id
           AND ucs.user_id  = $2
         LIMIT 1
        )                        AS quiz_completed,
        (SELECT COUNT(*)>0 FROM usercoursesession ucs
         WHERE ucs.quiz_id  = t.drill_id
           AND ucs.user_id  = $2
         LIMIT 1
        )                        AS drill_completed,
        -- question counts
        COALESCE(array_length(e_quiz.question_id_list,1),0)  AS quiz_question_count,
        COALESCE(array_length(e_drill.question_id_list,1),0) AS drill_question_count
      FROM courses c
      LEFT JOIN sections s           ON s.course_id      = c.id
      LEFT JOIN topics t             ON t.section_id     = s.id
      LEFT JOIN materials m          ON m.topic_id       = t.id
      LEFT JOIN exam_schedule es_quiz   ON es_quiz.id   = t.quiz_id
      LEFT JOIN exam_schedule es_drill  ON es_drill.id  = t.drill_id
      LEFT JOIN unnest(es_quiz.exam_id_list)   AS quiz_exam_id ON true
      LEFT JOIN exams e_quiz           ON e_quiz.id       = quiz_exam_id
      LEFT JOIN unnest(es_drill.exam_id_list) AS drill_exam_id ON true
      LEFT JOIN exams e_drill          ON e_drill.id      = drill_exam_id
      WHERE s.section_string = $1
      ORDER BY s.position, t.position, m.position
    `;

    const { rows } = await client.query(query, [sectionString, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const isEntitled = rows[0].is_entitled;

    // Build topics → materials map
    const topicsMap = new Map();
    rows.forEach((row: any) => {
      if (!row.topic_id) return;

      if (!topicsMap.has(row.topic_id)) {
        topicsMap.set(row.topic_id, {
          id:                 row.topic_id,
          title:              row.topic_title,
          position:           row.topic_position,
          quiz_id:            row.quiz_id,
          drill_id:           row.drill_id,
          quiz_completed:     row.quiz_completed,
          drill_completed:    row.drill_completed,
          quiz_question_count: row.quiz_question_count,
          drill_question_count: row.drill_question_count,
          materials:          []
        });
      }

      if (row.material_id) {
        topicsMap.get(row.topic_id).materials.push({
          id:           row.material_id,
          title:        row.material_title,
          is_mandatory: row.is_mandatory,
          has_video:    row.has_video,
          position:     row.material_position,
          is_completed: row.is_completed
        });
      }
    });

    // Serialize and compute accessibility
    const topics = Array.from(topicsMap.values())
      .sort((a: any, b: any) => a.position - b.position)
      .map((topic: any) => ({
        id:                   topic.id,
        title:                topic.title,
        position:             topic.position,
        quiz_id:              topic.quiz_id,
        drill_id:             topic.drill_id,
        quiz_completed:       topic.quiz_completed,
        drill_completed:      topic.drill_completed,
        quiz_question_count:  topic.quiz_question_count,
        drill_question_count: topic.drill_question_count,
        // quizzes & drills only accessible if entitled
        quiz_accessible:      isEntitled && !!topic.quiz_id,
        drill_accessible:     isEntitled && !!topic.drill_id,
        materials: topic.materials
          .sort((a: any, b: any) => a.position - b.position)
          .map((mat: any) => ({
            ...mat,
            // only entitled OR first topic & first material
            is_accessible: isEntitled
              || (topic.position === 1 && mat.position === 1)
          }))
      }));

    const first = rows[0];
    const response: UserCourse.SectionDetailResponse = {
      courseTitle:      first.course_title,
      courseString:     first.course_string,
      sectionId:        first.section_id,
      sectionTitle:     first.section_title,
      sectionDescription: first.section_description,
      durasi:           first.durasi,
      sectionPosition:  first.section_position,
      isEntitled,
      topics
    };

    res.status(200).json({
      message: 'Section retrieved successfully',
      data: response
    });

  } catch (error: any) {
    console.error('Error retrieving section:', error);
    res.status(500).json({
      message: 'Failed to retrieve section',
      error:   error.message
    });
  } finally {
    client.release();
  }
};

export const getAllUserCourses = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const userCourses = await UserCourse.getAll();
    res.status(200).json({
      success: true,
      message: 'User courses retrieved successfully',
      data: userCourses
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user courses',
      error: error.message
    });
  }
};

export const getUserCourseById = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID is required'
      });
    }
    
    const userCourse = await UserCourse.getById(parseInt(id));
    
    if (!userCourse) {
      return res.status(404).json({
        success: false,
        message: 'User course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User course retrieved successfully',
      data: userCourse
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user course',
      error: error.message
    });
  }
};

export const getUserCoursesByUserId = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const userCourses = await UserCourse.getByUserId(parseInt(userId));
    
    res.status(200).json({
      success: true,
      message: 'User courses retrieved successfully',
      data: userCourses
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user courses',
      error: error.message
    });
  }
};

export const getUserCoursesByTopicId = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { topicId } = req.query;
    if (!topicId || typeof topicId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Topic ID is required'
      });
    }
    
    const userCourses = await UserCourse.getByTopicId(parseInt(topicId));
    
    res.status(200).json({
      success: true,
      message: 'User courses retrieved successfully',
      data: userCourses
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user courses',
      error: error.message
    });
  }
};

export const getUserCoursesByTopicAndMaterial = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { topicId, materialId } = req.query;
    if (!topicId || typeof topicId !== 'string' || !materialId || typeof materialId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Topic ID and Material ID are required'
      });
    }
    
    const userCourses = await UserCourse.getByTopicAndMaterial(parseInt(topicId), parseInt(materialId));
    
    res.status(200).json({
      success: true,
      message: 'User courses retrieved successfully',
      data: userCourses
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user courses',
      error: error.message
    });
  }
};

export const createUserCourse = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { topic_id, material_id, quiz_id } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    // Check if user course already exists (optional)
    if (topic_id) {
      const exists = await UserCourse.exists(user_id, topic_id, material_id);
      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'User course already exists for this user and topic'
        });
      }
    }

    const userCourseData = {
      user_id,
      topic_id: topic_id || null,
      material_id: material_id || null,
      quiz_id: quiz_id || null
    };

    const newUserCourse = await UserCourse.create(userCourseData);
    
    res.status(201).json({
      success: true,
      message: 'User course created successfully',
      data: newUserCourse
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user course',
      error: error.message
    });
  }
};

export const createUserCourseTimer = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { topic_id, material_id, start_time, elapsed_time } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    const userCourseData = {
      topic_id: topic_id || null,
      material_id: material_id || null,
      start_time: start_time || null,
      elapsed_time: elapsed_time
    };

    const newUserCourseTimer = await UserCourse.createTimer(userCourseData, user_id);
    
    res.status(201).json({
      success: true,
      message: 'User course timer created successfully',
      data: newUserCourseTimer
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user course timer',
      error: error.message
    });
  }
};

export const updateUserCourse = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    const { user_id, topic_id, material_id, quiz_id } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID is required'
      });
    }

    // Check if user course exists
    const existingUserCourse = await UserCourse.getById(parseInt(id));
    if (!existingUserCourse) {
      return res.status(404).json({
        success: false,
        message: 'User course not found'
      });
    }

    // Validasi required field
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    const userCourseData = {
      user_id,
      topic_id: topic_id || null,
      material_id: material_id || null,
      quiz_id: quiz_id || null
    };

    const updatedUserCourse = await UserCourse.update(parseInt(id), userCourseData);
    
    if (!updatedUserCourse) {
      return res.status(404).json({
        success: false,
        message: 'User course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User course updated successfully',
      data: updatedUserCourse
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user course',
      error: error.message
    });
  }
};

export const searchUserCourses = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { search } = req.query;
    const searchTerm = typeof search === 'string' ? search : '';
    const userCourses = await UserCourse.search(searchTerm);
    
    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: userCourses
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to search user courses',
      error: error.message
    });
  }
};