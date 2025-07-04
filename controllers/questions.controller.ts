// controllers/questions.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as questionModel from '../models/questions.model';
import * as examSessionModel from '../models/examSession.model';
import * as examTypesModel from '../models/examTypes.model';
import * as crypto from 'crypto';
import pool from '../lib/db';
import { AuthenticatedRequest } from '../lib/middleware/auth';

// Types
interface QuestionData {
  exam_type_id?: number;
  question_topic_type?: number;
  question_type: string;
  question_text: string;
  options?: string[];
  correct_answer?: string[];
  statements?: string[];
  passage_id?: number;
  question_code?: string;
  pembahasan?: string;
  level?: number;
}

interface BulkQuestionRequest {
  questions: QuestionData[];
}

interface AppendExamIdRequest {
  questionId: number;
  examId: number;
}

interface QueueItem {
  questionData?: QuestionData;
  questions?: QuestionData[];
  create_user_id: string;
}

// Mock queue implementation
let questionQueue: any = null;

// Initialize queue
const initializeQueue = async () => {
  if (!questionQueue) {
    try {
      const PQueue = (await import('p-queue')).default;
      questionQueue = new PQueue({ concurrency: 1 });
    } catch (error) {
      console.error('Failed to initialize queue:', error);
    }
  }
};

// Helper Functions
const encryptData = (data: any): string => {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.EXAM_ENCRYPTION_KEY || '', 'utf-8');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key.slice(0, 32), iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf-8', 'base64');
  encrypted += cipher.final('base64');
  
  return iv.toString('hex') + ':' + encrypted;
};

// Controller Functions
export const searchQuestions = async (req: NextApiRequest, res: NextApiResponse) => {
  const { search } = req.query;

  try {
    const results = await questionModel.searchQuestionsByCodeOrId(search as string);
    return res.status(200).json({
      message: 'Questions retrieved successfully',
      data: results,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllQuestions = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const questions = await questionModel.getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const getPagedQuestions = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const filters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
      search: req.query.search as string || '',
      question_type: req.query.question_type as string || 'All',
      exam_id: req.query.exam_id ? parseInt(req.query.exam_id as string) : undefined,
      topic: req.query.topic as string || undefined,
      subtopic: req.query.subtopic as string || undefined,
      creator: req.query.creator as string || undefined,
      start_date: req.query.start_date as string || undefined,
      end_date: req.query.end_date as string || undefined,
      sortKey: req.query.sortKey as string || 'q.id',
      sortOrder: req.query.sortOrder as string || 'asc',
      userId: req.query.userId as string || undefined,
    };

    const result = await questionModel.getPagedQuestions(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getQuestions controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getQuestionsByExamString = async (req: NextApiRequest, res: NextApiResponse) => {
  const examString = req.query.exam_string as string;

  try {
    const questions = await questionModel.getQuestionsByExamString(examString);
    
    const encryptedQuestions = encryptData(questions);
    
    res.status(200).json({ encryptedData: encryptedQuestions });
  } catch (error) {
    console.error('Error fetching questions by exam_string:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const getDiagnosticQuestionsByExamString = async (req: NextApiRequest, res: NextApiResponse) => {
  const examString = req.query.exam_string as string;
  try {
    const payload = await questionModel.getDiagnosticQuestionsByExamString(examString);

    console.log(payload);
    res.status(200).json({ encryptedData: encryptData(payload) });
  } catch (err) {
    console.error('Error fetching diagnostic questions:', err);
    res.status(500).json({ error: 'Failed to fetch diagnostic questions' });
  }
};

export const getQuestionsByExamId = async (req: NextApiRequest, res: NextApiResponse) => {
  const examId = parseInt(req.query.examid as string);
  
  try {
    const questions = await questionModel.getQuestionsByExamId(examId);
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions by exam_string:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const getQuestionById = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = parseInt(req.query.id as string);
  try {
    const question = await questionModel.getQuestionById(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.status(200).json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
};

export const getQuestionByUId = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = parseInt(req.query.id as string);
  try {
    const question = await questionModel.getQuestionByUId(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.status(200).json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
};

export const createQuestion = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  await initializeQueue();
  
  if (!questionQueue) {
    return res.status(503).json({ error: 'Queue not initialized yet. Please try again shortly.' });
  }

  const questionData: QuestionData = req.body;
  const create_user_id = req.user?.id;

  if (!create_user_id) {
    return res.status(400).json({ error: 'create_user_id is required' });
  }

  try {
    const result = await questionQueue.add(() =>
      handleSingleQuestion({ questionData, create_user_id })
    );

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error in question queue:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleSingleQuestion = async (
  { questionData, create_user_id }: { questionData: QuestionData; create_user_id: string }
) => {
  const client = await pool.connect();
  const startTime = Date.now();
  console.log('[handleSingleQuestion] START', { questionData, create_user_id });

  try {
    // --- Begin transaction --------------------------------------------------
    await client.query('BEGIN');
    console.log('[handleSingleQuestion] BEGIN transaction');

    // --- Resolve sub‑topic metadata ----------------------------------------
    const subtopicId = questionData.exam_type_id;
    console.log('[handleSingleQuestion] subtopicId:', subtopicId);

    const subtopicsInfo = await examTypesModel.getSubtopicsInfo([subtopicId!]);
    console.log('[handleSingleQuestion] subtopicsInfo:', subtopicsInfo);

    if (!subtopicsInfo.length) {
      console.error('[handleSingleQuestion] Subtopic not found', { subtopicId });
      throw new Error(`Subtopik dengan ID ${subtopicId} tidak ditemukan`);
    }

    const { bid_code, top_code, sub_code, last_sequence } = subtopicsInfo[0];
    console.log('[handleSingleQuestion] subtopicInfo:', {
      bid_code,
      top_code,
      sub_code,
      last_sequence
    });

    // --- Generate next question code ---------------------------------------
    const nextSequence = last_sequence ? parseInt(last_sequence) + 1 : 1;
    const sequence = nextSequence.toString().padStart(4, '0');
    const question_code = `${bid_code}${top_code}${sub_code}${sequence}`;
    console.log('[handleSingleQuestion] Generated question_code:', question_code);

    // --- Prepare payload ----------------------------------------------------
    const questionWithCode = {
      ...questionData,
      code:question_code,
      passage_id: questionData.passage_id || null
    };
    console.log('[handleSingleQuestion] questionWithCode:', questionWithCode);

    // --- Persist question ---------------------------------------------------
    const savedQuestion = await questionModel.createQuestion(
      questionWithCode,
      create_user_id
    );
    console.log('[handleSingleQuestion] savedQuestion:', savedQuestion);

    // --- Commit transaction -------------------------------------------------
    await client.query('COMMIT');
    console.log(
      '[handleSingleQuestion] COMMIT transaction (elapsed %dms)',
      Date.now() - startTime
    );

    return savedQuestion;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[handleSingleQuestion] ROLLBACK transaction due to error', error);
    throw error;
  } finally {
    client.release();
    console.log(
      '[handleSingleQuestion] client released (total %dms)',
      Date.now() - startTime
    );
  }
};


export const createBulkQuestions = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  await initializeQueue();
  
  if (!questionQueue) {
    return res.status(503).json({ error: 'Queue not initialized yet. Please try again shortly.' });
  }

  const { questions }: BulkQuestionRequest = req.body;
  const create_user_id = req.user?.id;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'No questions provided' });
  }

  if (!create_user_id) {
    return res.status(400).json({ error: 'create_user_id is required' });
  }

  try {
    const result = await questionQueue.add(() =>
      handleBulkQuestions({ questions, create_user_id })
    );

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error in bulk queue:', error);
    res.status(500).json({ error: error.message });
  }
};

const handleBulkQuestions = async ({ questions, create_user_id }: { questions: QuestionData[]; create_user_id: string }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const subtopicMap = new Map<number, QuestionData[]>();
    
    questions.forEach(q => {
      const subtopicId = q.exam_type_id!;
      if (!subtopicMap.has(subtopicId)) {
        subtopicMap.set(subtopicId, []);
      }
      subtopicMap.get(subtopicId)!.push(q);
    });

    const subtopicIds = [...subtopicMap.keys()];
    const subtopicsInfo = await examTypesModel.getSubtopicsInfo(subtopicIds);

    const questionsWithCodes: any[] = [];
    const codeCounters = new Map<number, number>();

    for (const { id, last_sequence } of subtopicsInfo) {
      codeCounters.set(id, last_sequence ? parseInt(last_sequence) + 1 : 1);
    }

    for (const [subtopicId, questionGroup] of subtopicMap) {
      const subtopicInfo = subtopicsInfo.find(info => info.id === subtopicId);
      if (!subtopicInfo) {
        throw new Error(`Subtopik dengan ID ${subtopicId} tidak ditemukan`);
      }

      const { bid_code, top_code, sub_code } = subtopicInfo;
      let counter = codeCounters.get(subtopicId)!;

      for (const question of questionGroup) {
        const sequence = counter.toString().padStart(4, '0');
        const question_code = `${bid_code}${top_code}${sub_code}${sequence}`;
        
        questionsWithCodes.push({
          ...question,
          question_code,
          passage_id: question.passage_id || null,
          create_user_id
        });

        counter++;
      }

      codeCounters.set(subtopicId, counter);
    }

    const savedQuestions = [];
    for (const q of questionsWithCodes) {
      const savedQuestion = await questionModel.createQuestion(q, create_user_id);
      savedQuestions.push(savedQuestion);
    }

    await client.query('COMMIT');
    return savedQuestions;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updateQuestion = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const questionId = parseInt(req.query.id as string);
  const questionData: QuestionData = req.body;
  
  const edit_user_id = req.user?.id;
  if (!edit_user_id) {
    return res.status(400).json({ error: 'edit_user_id is required' });
  }

  try {
    const updatedQuestion = await questionModel.updateQuestion(questionId, questionData, edit_user_id);
    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

export const updateBulkQuestions = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { questions }: BulkQuestionRequest = req.body;
  const edit_user_id = req.user?.id;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Questions array is required and must not be empty' });
  }

  if (!edit_user_id) {
    return res.status(400).json({ error: 'edit_user_id is required' });
  }

  const missingIds = questions.some(q => !(q as any).id);
  if (missingIds) {
    return res.status(400).json({ error: 'All questions must have an ID for bulk update' });
  }

  try {
    const updatedQuestions = await questionModel.updateBulkQuestions(questions, edit_user_id);
    res.status(200).json(updatedQuestions);
  } catch (error) {
    console.error('Error updating bulk questions:', error);
    res.status(500).json({ error: 'Failed to update questions in bulk' });
  }
};

export const appendExamId = async (req: NextApiRequest, res: NextApiResponse) => {
  const { questionId, examId }: AppendExamIdRequest = req.body;

  try {
    if (!questionId || !examId) {
      return res.status(400).json({ error: 'questionId and examId are required' });
    }

    const result = await questionModel.appendExamIdToQuestion(questionId, examId);
    return res.status(200).json({
      message: 'Exam ID appended successfully',
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteQuestion = async (req: NextApiRequest, res: NextApiResponse) => {
  const questionId = parseInt(req.query.id as string);

  try {
    const deletedQuestion = await questionModel.deleteQuestion(questionId);
    if (!deletedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully', question: deletedQuestion });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

// Passage Controllers
export const searchPassages = async (req: NextApiRequest, res: NextApiResponse) => {
  const { search } = req.query;
  try {
    const results = await questionModel.searchPassages(search as string);
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPassageById = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = parseInt(req.query.id as string);
  try {
    const passage = await questionModel.getPassageById(id);
    if (!passage) {
      return res.status(404).json({ error: 'Passage not found' });
    }
    res.status(200).json(passage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPassage = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { title, passage } = req.body;
  const create_user_id = req.user?.id;

  if (!title || !passage) {
    return res.status(400).json({ error: 'Title and passage are required' });
  }

  if (!create_user_id) {
    return res.status(400).json({ error: 'create_user_id is required' });
  }

  try {
    const newPassage = await questionModel.createPassage({ title, passage }, create_user_id);
    res.status(201).json(newPassage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePassage = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const passageId = parseInt(req.query.id as string);
  const { title, passage } = req.body;
  const update_user_id = req.user?.id;

  if (!title || !passage) {
    return res.status(400).json({ error: 'Title and passage are required' });
  }

  if (!update_user_id) {
    return res.status(400).json({ error: 'update_user_id is required' });
  }

  try {
    const updatedPassage = await questionModel.updatePassage(passageId, { title, passage }, update_user_id);
    if (!updatedPassage) {
      return res.status(404).json({ error: 'Passage not found' });
    }
    res.status(200).json(updatedPassage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyCsv = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const payload = req.body;

    if (!Array.isArray(payload) || payload.length === 0) {
      return res.status(400).json({ 
        error: 'Payload harus berupa array dan tidak boleh kosong',
        example: [{"id":"194","code":"LOGFRPR0152"},{"id":"195","code":"LOGFRPR0153"}]
      });
    }

    const invalidItems = payload.filter(item => 
      !item.id || !item.code || 
      typeof item.id !== 'string' || 
      typeof item.code !== 'string'
    );

    if (invalidItems.length > 0) {
      return res.status(400).json({ 
        error: 'Setiap item harus memiliki property id dan code yang valid',
        invalidItems: invalidItems,
        example: {"id":"194","code":"LOGFRPR0152"}
      });
    }

    const verificationResult = await questionModel.verifyIdCodePairs(payload);

    const matchedPairs = verificationResult.results.filter(r => r.is_match);
    const notFoundIds = verificationResult.results.filter(r => r.status === 'id_not_found');
    const mismatchedCodes = verificationResult.results.filter(r => r.status === 'code_mismatch');

    const response = {
      status: 'success',
      message: 'Verifikasi pasangan ID-Code berhasil dilakukan',
      summary: verificationResult.summary,
      data: {
        matched_pairs: matchedPairs,
        id_not_found: notFoundIds,
        code_mismatched: mismatchedCodes
      }
    };

    if (verificationResult.summary.matched === verificationResult.summary.total) {
      res.status(200).json(response);
    } else if (verificationResult.summary.matched === 0) {
      res.status(404).json({
        ...response,
        status: 'no_match',
        message: 'Tidak ada pasangan ID-Code yang cocok'
      });
    } else {
      res.status(206).json({
        ...response,
        status: 'partial_match',
        message: 'Sebagian pasangan ID-Code cocok, sebagian tidak cocok'
      });
    }

  } catch (error: any) {
    console.error('Error verifying CSV:', error);
    res.status(500).json({ 
      error: 'Gagal melakukan verifikasi CSV',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};