// controllers/exam.controller.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import * as examModel from '../models/exam.model';

export const searchExams = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { query, limit = 10, userId = null } = req.query;

  try { 
    const exams = await examModel.searchExams(
      query as string | null, 
      parseInt(limit as string, 10), 
      userId ? parseInt(userId as string, 10) : null
    );
    res.status(200).json({ data: exams });
  } catch (error) {
    console.error('Error searching exams:', error);
    res.status(500).json({ error: 'Failed to search exams' });
  }
};

// Get exam by exam_string
export const getExamByString = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { exam_string } = req.query;
  
  try {
    const exam = await examModel.getExamByString(exam_string as string);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    res.status(200).json(exam);
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
};

// Create a new exam
export const createExam = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const examData = req.body;
  
  const create_user_id = req.user?.id;
  
  // Validasi input
  const { name, duration, exam_group, question_id_list } = examData;
  
  if (!name || !duration || !create_user_id || exam_group === undefined || !question_id_list) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, duration, create_user_id, exam_group, question_id_list' 
    });
  }
  
  if (!Array.isArray(question_id_list)) {
    return res.status(400).json({ 
      error: 'question_id_list must be an array' 
    });
  }
  
  try {
    const newExam = await examModel.createExam(examData, parseInt(create_user_id, 10));
    res.status(201).json(newExam);
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
};

export const getExamsByIds = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { ids } = req.query;

  if (!ids) {
    return res.status(400).json({ error: 'Missing ids parameter' });
  }

  let examIds: number[] = [];

  // IDs dapat datang sebagai array atau string tergantung query
  if (Array.isArray(ids)) {
    examIds = ids.map(id => parseInt(id as string, 10)).filter(id => !isNaN(id));
  } else if (typeof ids === 'string') {
    // Jika hanya satu ID yang dikirim sebagai string
    const parsedId = parseInt(ids, 10);
    if (!isNaN(parsedId)) {
      examIds.push(parsedId);
    }
  }

  if (examIds.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty ids parameter' });
  }

  try {
    const exams = await examModel.getExamsByIds(examIds);
    res.status(200).json({ data: exams });
  } catch (error) {
    console.error('Error fetching exams by IDs:', error);
    res.status(500).json({ error: 'Failed to fetch exams by IDs' });
  }
};

export const updateExam = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { name, duration, edit_user_id } = req.body;

  if (!id || !name || !duration || !edit_user_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const updatedExam = await examModel.updateExam({
      id: parseInt(id as string, 10),
      name,
      duration,
      edit_user_id,
    });

    if (!updatedExam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.status(200).json(updatedExam);
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ error: 'Failed to update exam' });
  }
};