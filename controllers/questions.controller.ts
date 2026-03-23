// controllers/questions.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as questionModel from '../models/questions.model';
import * as examSessionModel from '../models/examSession.model';
import * as examTypesModel from '../models/examTypes.model';
import * as crypto from 'crypto';
import pool from '../lib/db';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import * as cache from '../lib/cache';
import { CACHE_DURATION, generateCacheKey } from '../lib/cache';

// Types
interface QuestionData {
  question_topic_type?: number;
  question_type: string;
  question_text: string;
  options?: string[];
  correct_answer?: string[];
  statements?: string[];
  passage_id?: number;
  question_code?: string;
  explanation?: string;
  level?: number;
  question_source_id?: number;
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
      console.log('[Queue] Initialized successfully');
    } catch (error) {
      console.error('[Queue] Failed to initialize:', error);
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

// Validation helper
const validateQuestionData = (questionData: QuestionData, index?: number): string[] => {
  const errors: string[] = [];
  const prefix = index !== undefined ? `Question ${index + 1}: ` : '';
  
  // Validate question_topic_type
  if (!questionData.question_topic_type) {
    errors.push(`${prefix}Sub Topik harus dipilih (question_topic_type is required)`);
  } else if (typeof questionData.question_topic_type !== 'number' || isNaN(questionData.question_topic_type)) {
    errors.push(`${prefix}Sub Topik tidak valid (question_topic_type must be a valid number)`);
  }
  
  // Validate question_text
  if (!questionData.question_text || !questionData.question_text.trim()) {
    errors.push(`${prefix}Teks soal harus diisi (question_text is required)`);
  }
  
  // Validate question_type
  if (!questionData.question_type) {
    errors.push(`${prefix}Tipe soal harus dipilih (question_type is required)`);
  } else if (!['single-choice', 'multiple-choice', 'true-false', 'number', 'text'].includes(questionData.question_type)) {
    errors.push(`${prefix}Tipe soal tidak valid (invalid question_type)`);
  }
  
  // Validate level
  if (!questionData.level) {
    errors.push(`${prefix}Level soal harus dipilih (level is required)`);
  } else if (typeof questionData.level !== 'number' || questionData.level < 1 || questionData.level > 5) {
    errors.push(`${prefix}Level soal tidak valid (level must be between 1-5)`);
  }

  // Validate options for choice questions
  if ((questionData.question_type === 'single-choice' || questionData.question_type === 'multiple-choice')) {
    if (!questionData.options || !Array.isArray(questionData.options) || questionData.options.length < 2) {
      errors.push(`${prefix}Minimal 2 opsi jawaban diperlukan untuk soal pilihan`);
    }
    if (!questionData.correct_answer || !Array.isArray(questionData.correct_answer) || questionData.correct_answer.length === 0) {
      errors.push(`${prefix}Jawaban benar harus dipilih untuk soal pilihan`);
    }
  }

  // Validate statements for true-false questions
  if (questionData.question_type === 'true-false') {
    if (!questionData.statements || !Array.isArray(questionData.statements) || questionData.statements.length === 0) {
      errors.push(`${prefix}Minimal 1 pernyataan diperlukan untuk soal true-false`);
    }
  }

  // Validate answer for text/number questions
  if ((questionData.question_type === 'text' || questionData.question_type === 'number')) {
    if (!questionData.correct_answer || !Array.isArray(questionData.correct_answer) || questionData.correct_answer.length === 0 || !questionData.correct_answer[0]) {
      errors.push(`${prefix}Jawaban benar harus diisi untuk soal ${questionData.question_type}`);
    }
  }
  
  return errors;
};

// Sanitize question data
const sanitizeQuestionData = (questionData: QuestionData): QuestionData => {
  return {
    ...questionData,
    question_text: questionData.question_text?.trim(),
    explanation: questionData.explanation?.trim() || null,
    passage_id: questionData.passage_id || null,
    options: questionData.options?.filter(opt => opt && opt.trim()) || [],
    statements: questionData.statements?.filter(stmt => stmt && stmt.trim()) || [],
  };
};

// Controller Functions
export const searchQuestions = async (req: NextApiRequest, res: NextApiResponse) => {
  const { search, selected_ids, limit = 20 } = req.query;

  try {
    // Jika tidak ada search dan tidak ada selected_ids, return semua questions (limited)
    if ((!search || search.toString().trim() === '') && !selected_ids) {
      const query = `
        SELECT id, code
        FROM   questions
        ORDER  BY md5(id::text)
        LIMIT  $1;
      `;
      const result = await pool.query(query, [parseInt(limit.toString())]);
      
      return res.status(200).json({
        message: 'Questions retrieved successfully',
        data: result.rows.map(row => ({
          id: row.id,
          code: row.code
        })),
      });
    }

    // Handle search dengan exclusion
    const results = await questionModel.searchQuestionsByCodeOrId(search as string, selected_ids as string);
    return res.status(200).json({
      message: 'Questions retrieved successfully',
      data: results,
    });
  } catch (error: any) {
    console.error('[searchQuestions] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const getAllQuestions = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const cacheKey = 'questions:all';
    
    // Try to get from cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('[getAllQuestions] Cache HIT');
      return res.status(200).json(cachedData);
    }
    
    console.log('[getAllQuestions] Cache MISS - fetching from DB');
    const questions = await questionModel.getAllQuestions();
    
    // Cache for 1 month
    cache.set(cacheKey, questions, CACHE_DURATION.ONE_MONTH);
    
    res.status(200).json(questions);
  } catch (error) {
    console.error('[getAllQuestions] Error:', error);
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

    // Generate cache key from filters
    const cacheKey = generateCacheKey('questions:paged', filters);
    
    // Try to get from cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('[getPagedQuestions] Cache HIT:', cacheKey);
      return res.status(200).json(cachedData);
    }
    
    console.log('[getPagedQuestions] Cache MISS - fetching from DB');
    const result = await questionModel.getPagedQuestions(filters);
    
    // Cache for 1 month
    cache.set(cacheKey, result, CACHE_DURATION.ONE_MONTH);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[getPagedQuestions] Error:', error);
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
    console.error('[getQuestionsByExamString] Error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const getDiagnosticQuestionsByExamString = async (req: NextApiRequest, res: NextApiResponse) => {
  const examString = req.query.exam_string as string;
  try {
    const payload = await questionModel.getDiagnosticQuestionsByExamString(examString);
    res.status(200).json({ encryptedData: encryptData(payload) });
  } catch (error) {
    console.error('[getDiagnosticQuestionsByExamString] Error:', error);
    res.status(500).json({ error: 'Failed to fetch diagnostic questions' });
  }
};

export const getQuestionsByExamId = async (req: NextApiRequest, res: NextApiResponse) => {
  const examId = parseInt(req.query.examid as string);
  
  try {
    const cacheKey = `questions:exam:${examId}`;
    
    // Try to get from cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('[getQuestionsByExamId] Cache HIT:', cacheKey);
      return res.status(200).json(cachedData);
    }
    
    console.log('[getQuestionsByExamId] Cache MISS - fetching from DB');
    const questions = await questionModel.getQuestionsByExamId(examId);
    
    // Cache for 1 month
    cache.set(cacheKey, questions, CACHE_DURATION.ONE_MONTH);
    
    res.status(200).json(questions);
  } catch (error) {
    console.error('[getQuestionsByExamId] Error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const getQuestionById = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = parseInt(req.query.id as string);
  try {
    const cacheKey = `question:${id}`;
    
    // Try to get from cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('[getQuestionById] Cache HIT:', cacheKey);
      return res.status(200).json(cachedData);
    }
    
    console.log('[getQuestionById] Cache MISS - fetching from DB');
    const question = await questionModel.getQuestionById(id);
    
    // Cache individual question for 1 month  
    if (question) {
      cache.set(cacheKey, question, CACHE_DURATION.ONE_MONTH);
    }
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.status(200).json(question);
  } catch (error) {
    console.error('[getQuestionById] Error:', error);
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
    console.error('[getQuestionByUId] Error:', error);
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

  // Sanitize and validate question data
  const sanitizedData = sanitizeQuestionData(questionData);
  const errors = validateQuestionData(sanitizedData);
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  try {
    const result = await questionQueue.add(() =>
      handleSingleQuestion({ questionData: sanitizedData, create_user_id })
    );

    // Invalidate hanya list caches (tidak perlu hapus individual question cache)
    cache.invalidate.questionLists();
    
    res.status(201).json(result);
  } catch (error: any) {
    console.error('[createQuestion] Error in queue:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleSingleQuestion = async (
  { questionData, create_user_id }: { questionData: QuestionData; create_user_id: string }
) => {
  const client = await pool.connect();
  const startTime = Date.now();
  console.log('[handleSingleQuestion] START', { 
    subtopicId: questionData.question_topic_type, 
    create_user_id,
    questionType: questionData.question_type 
  });

  try {
    await client.query('BEGIN');
    console.log('[handleSingleQuestion] BEGIN transaction');

    // Validate subtopic ID
    const subtopicId = questionData.question_topic_type;
    if (!subtopicId || typeof subtopicId !== 'number' || isNaN(subtopicId)) {
      throw new Error(`Invalid question_topic_type: ${subtopicId}. Must be a valid number.`);
    }

    // Get subtopic metadata
    const subtopicsInfo = await examTypesModel.getSubtopicsInfo([subtopicId]);
    if (!subtopicsInfo.length) {
      throw new Error(`Subtopik dengan ID ${subtopicId} tidak ditemukan`);
    }

    const { bid_code, top_code, sub_code, last_sequence } = subtopicsInfo[0];
    console.log('[handleSingleQuestion] Subtopic info:', {
      bid_code, top_code, sub_code, last_sequence
    });

    // Generate question code
    const nextSequence = last_sequence ? parseInt(last_sequence) + 1 : 1;
    const sequence = nextSequence.toString().padStart(4, '0');
    const question_code = `${bid_code}${top_code}${sub_code}${sequence}`;

    // Prepare question data with code
    const questionWithCode = {
      ...questionData,
      code: question_code,
      question_code: question_code
    };

    console.log('[handleSingleQuestion] Creating question with code:', question_code);

    // Save question
    const savedQuestion = await questionModel.createQuestion(questionWithCode, create_user_id);
    
    await client.query('COMMIT');
    console.log('[handleSingleQuestion] SUCCESS - elapsed:', Date.now() - startTime, 'ms');

    return savedQuestion;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[handleSingleQuestion] ROLLBACK due to error:', error);
    throw error;
  } finally {
    client.release();
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

  console.log('[createBulkQuestions] Processing', questions.length, 'questions');

  // Sanitize and validate all questions
  const sanitizedQuestions = questions.map(q => sanitizeQuestionData(q));
  const validationErrors: string[] = [];
  
  sanitizedQuestions.forEach((q, index) => {
    const errors = validateQuestionData(q, index);
    validationErrors.push(...errors);
  });

  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: validationErrors 
    });
  }

  try {
    const result = await questionQueue.add(() =>
      handleBulkQuestions({ questions: sanitizedQuestions, create_user_id })
    );

    res.status(201).json(result);
  } catch (error: any) {
    console.error('[createBulkQuestions] Error in bulk queue:', error);
    res.status(500).json({ error: error.message });
  }
};

const handleBulkQuestions = async ({ questions, create_user_id }: { questions: QuestionData[]; create_user_id: string }) => {
  const client = await pool.connect();
  const startTime = Date.now();
  console.log('[handleBulkQuestions] START', { 
    questionsCount: questions.length, 
    create_user_id 
  });

  try {
    await client.query('BEGIN');

    // Group questions by subtopic and validate IDs
    const subtopicMap = new Map<number, QuestionData[]>();
    const invalidQuestions: string[] = [];
    
    questions.forEach((q, index) => {
      const subtopicId = q.question_topic_type;
      
      if (!subtopicId || typeof subtopicId !== 'number' || isNaN(subtopicId)) {
        invalidQuestions.push(`Question ${index + 1}: Invalid question_topic_type (${subtopicId})`);
        return;
      }
      
      if (!subtopicMap.has(subtopicId)) {
        subtopicMap.set(subtopicId, []);
      }
      subtopicMap.get(subtopicId)!.push(q);
    });

    if (invalidQuestions.length > 0) {
      throw new Error(`Invalid subtopic IDs: ${invalidQuestions.join('; ')}`);
    }

    if (subtopicMap.size === 0) {
      throw new Error('No valid questions to process');
    }

    const subtopicIds = [...subtopicMap.keys()];
    console.log('[handleBulkQuestions] Processing subtopic IDs:', subtopicIds);

    // Get subtopic information
    const subtopicsInfo = await examTypesModel.getSubtopicsInfo(subtopicIds);
    
    if (subtopicsInfo.length !== subtopicIds.length) {
      const foundIds = subtopicsInfo.map(info => info.id);
      const missingIds = subtopicIds.filter(id => !foundIds.includes(id));
      throw new Error(`Subtopik tidak ditemukan untuk ID: ${missingIds.join(', ')}`);
    }

    // Generate codes and prepare questions
    const questionsWithCodes: any[] = [];
    const codeCounters = new Map<number, number>();

    // Initialize counters
    subtopicsInfo.forEach(({ id, last_sequence }) => {
      codeCounters.set(id, last_sequence ? parseInt(last_sequence) + 1 : 1);
    });

    // Generate codes for each question
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
          code: question_code,
          question_code: question_code
        });

        counter++;
      }

      codeCounters.set(subtopicId, counter);
    }

    console.log('[handleBulkQuestions] Generated codes for', questionsWithCodes.length, 'questions');

    // Create all questions
    const savedQuestions = [];
    for (const q of questionsWithCodes) {
      try {
        const savedQuestion = await questionModel.createQuestion(q, create_user_id);
        savedQuestions.push(savedQuestion);
      } catch (error) {
        console.error('[handleBulkQuestions] Error creating question:', error);
        throw new Error(`Failed to create question: ${error.message}`);
      }
    }

    await client.query('COMMIT');
    console.log('[handleBulkQuestions] SUCCESS - created', savedQuestions.length, 'questions in', Date.now() - startTime, 'ms');

    return savedQuestions;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[handleBulkQuestions] ROLLBACK due to error:', error);
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

  // Sanitize and validate
  const sanitizedData = sanitizeQuestionData(questionData);
  const errors = validateQuestionData(sanitizedData);
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }

  try {
    const updatedQuestion = await questionModel.updateQuestion(questionId, sanitizedData, edit_user_id);
    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Invalidate cache untuk question ini + semua list caches
    cache.invalidate.questionWithLists(questionId);
    
    res.json(updatedQuestion);
  } catch (error) {
    console.error('[updateQuestion] Error:', error);
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

  // Validate all questions
  const sanitizedQuestions = questions.map(q => sanitizeQuestionData(q));
  const validationErrors: string[] = [];
  
  sanitizedQuestions.forEach((q, index) => {
    const errors = validateQuestionData(q, index);
    validationErrors.push(...errors);
  });

  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: validationErrors 
    });
  }

  try {
    const updatedQuestions = await questionModel.updateBulkQuestions(sanitizedQuestions, edit_user_id);
    
    // Bulk update: hapus semua cache (karena banyak questions terpengaruh)
    cache.invalidate.questions();
    
    res.status(200).json(updatedQuestions);
  } catch (error) {
    console.error('[updateBulkQuestions] Error:', error);
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
    
    // Invalidate list caches karena exam associations berubah
    cache.invalidate.questionLists();
    
    return res.status(200).json({
      message: 'Exam ID appended successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('[appendExamId] Error:', error);
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
    
    // Invalidate cache untuk question ini + semua list caches
    cache.invalidate.questionWithLists(questionId);
    
    res.json({ message: 'Question deleted successfully', question: deletedQuestion });
  } catch (error) {
    console.error('[deleteQuestion] Error:', error);
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
    console.error('[searchPassages] Error:', error);
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
    console.error('[getPassageById] Error:', error);
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
    console.error('[createPassage] Error:', error);
    
    // Handle duplicate title error
    if (error.message && error.message.includes('sudah digunakan')) {
      return res.status(409).json({ 
        error: error.message,
        code: 'DUPLICATE_TITLE' 
      });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
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
    console.error('[updatePassage] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deletePassage = async (req: NextApiRequest, res: NextApiResponse) => {
  const passageId = parseInt(req.query.id as string);

  if (!passageId) {
    return res.status(400).json({ error: 'Passage ID is required' });
  }

  try {
    await questionModel.deletePassage(passageId);
    res.status(200).json({ message: 'Passage deleted successfully' });
  } catch (error: any) {
    console.error('[deletePassage] Error:', error);
    if (error.message.includes('Cannot delete passage')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const getPagedPassages = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const filters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
      search: req.query.search as string || '',
      creator: req.query.creator as string || undefined,
      start_date: req.query.start_date as string || undefined,
      end_date: req.query.end_date as string || undefined,
      sortKey: req.query.sortKey as string || 'qp.id',
      sortOrder: req.query.sortOrder as string || 'desc',
    };

    const result = await questionModel.getPagedPassages(filters);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('[getPagedPassages] Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export const verifyCsv = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const payload = req.body;
    console.log(payload)

    if (!Array.isArray(payload) || payload.length === 0) {
      return res.status(400).json({ 
        error: 'Payload harus berupa array dan tidak boleh kosong',
        example: [
          {"ID Soal":"311","Kode Soal":"LOGFRPR0165"},
          {"ID Soal":"312","Kode Soal":"LOGVSSP0139"}
        ]
      });
    }

    // Extract only ID Soal and Kode Soal, map to id and code
    const pairs = payload.map((item, index) => {
      const idSoal = item['ID Soal'] || item['id'] || item['Id'] || item['ID'];
      const kodeSoal = item['Kode Soal'] || item['code'] || item['Code'] || item['kode'];
      
      if (!idSoal || !kodeSoal) {
        throw new Error(
          `Baris ${index + 1}: Data tidak lengkap. Pastikan setiap baris memiliki "ID Soal" dan "Kode Soal"`
        );
      }
      
      // Clean the values - remove quotes and trim
      const cleanedId = idSoal.toString().trim().replace(/^["']+|["']+$/g, '');
      const cleanedCode = kodeSoal.toString().trim().replace(/^["']+|["']+$/g, '');
      
      return {
        id: cleanedId,
        code: cleanedCode
      };
    });

    // Validate that we have valid pairs
    if (pairs.length === 0) {
      return res.status(400).json({ 
        error: 'Tidak ada data valid yang dapat diproses',
        example: [
          {"ID Soal":"311","Kode Soal":"LOGFRPR0165"},
          {"ID Soal":"312","Kode Soal":"LOGVSSP0139"}
        ]
      });
    }

    console.log('Cleaned pairs:', pairs); // For debugging

    const verificationResult = await questionModel.verifyIdCodePairs(pairs);

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
    console.error('[verifyCsv] Error:', error);
    res.status(500).json({ 
      error: 'Gagal melakukan verifikasi CSV',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add these functions to your existing questions.controller.ts
export const getQuestionWithAnswer = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = parseInt(req.query.id as string);
  try {
    const question = await questionModel.getQuestionWithAnswerById(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.status(200).json(question);
  } catch (error) {
    console.error('[getQuestionWithAnswer] Error:', error);
    res.status(500).json({ error: 'Failed to fetch question with answer' });
  }
};


// controllers/questions.controller.ts - Update searchQuestionsForPractice
export const searchQuestionsForPractice = async (req: NextApiRequest, res: NextApiResponse) => {
  const { search, limit = 20 } = req.query;

  try {
    const results = await questionModel.searchQuestionsForPracticeByCode(
      search as string, 
      parseInt(limit.toString())
    );
    
    return res.status(200).json({
      message: 'Questions retrieved successfully',
      data: results,
    });
  } catch (error: any) {
    console.error('[searchQuestionsForPractice] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};