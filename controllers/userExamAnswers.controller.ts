// controllers/userExamAnswers.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import pool from '../lib/db';
import * as UserExamAnswers from '../models/userExamAnswers.model';

// Types
interface AnswerData {
  question_id: number;
  user_answer: any;
  elapsed_time?: number;
}

interface DiagnosticAnswerData {
  answers: AnswerData[];
}

/**
 * Compare user answers with correct answers
 */
export const isAnswerCorrect = (userAnswer: any, correctAnswer: any, questionType: string): boolean => {
  // Handle null or undefined userAnswer
  if (userAnswer === null || userAnswer === undefined) {
    return false;
  }
  
  console.log(`Comparing - Type: ${questionType}, User answer: ${JSON.stringify(userAnswer)}, Correct answer: ${JSON.stringify(correctAnswer)}`);
  
  try {
    // Parse PostgreSQL array format if needed
    let parsedCorrectAnswer = correctAnswer;
    if (typeof correctAnswer === 'string' && correctAnswer.startsWith('{') && correctAnswer.endsWith('}')) {
      // Remove curly braces and split by comma
      parsedCorrectAnswer = correctAnswer.slice(1, -1).split(',');
    }
    
    // Different handling based on question type
    switch (questionType) {
      case 'single-choice':
        // For single-choice, compare strings (case-sensitive)
        let correctSingleAnswer = Array.isArray(parsedCorrectAnswer) 
          ? parsedCorrectAnswer[0] 
          : parsedCorrectAnswer;
          
        // Ensure both values are strings for comparison
        return String(userAnswer).trim() === String(correctSingleAnswer).trim();
        
      case 'multiple-choice':
        // Ensure we have arrays to compare
        const userMultipleAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        
        let correctMultipleAnswers = Array.isArray(parsedCorrectAnswer) 
          ? parsedCorrectAnswer 
          : [parsedCorrectAnswer];
          
        // If lengths differ, they can't be equal
        if (userMultipleAnswers.length !== correctMultipleAnswers.length) {
          return false;
        }
        
        // Sort both arrays to ignore order
        const sortedUserAnswers = [...userMultipleAnswers].map(String).sort();
        const sortedCorrectAnswers = [...correctMultipleAnswers].map(String).sort();
        
        // Compare each element
        for (let i = 0; i < sortedUserAnswers.length; i++) {
          if (sortedUserAnswers[i].trim() !== sortedCorrectAnswers[i].trim()) {
            return false;
          }
        }
        return true;
        
      case 'true-false':
        // For true-false, compare booleans and maintain order
        const userTrueFalse = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        
        let correctTrueFalse = Array.isArray(parsedCorrectAnswer) 
          ? parsedCorrectAnswer 
          : [parsedCorrectAnswer];
          
        // Convert string representations to actual booleans
        correctTrueFalse = correctTrueFalse.map(val => {
          return val === 'true' || val === true;
        });
        
        // If user provided fewer answers than expected, it's incorrect
        if (userTrueFalse.length < correctTrueFalse.length) {
          return false;
        }
        
        // For true-false, order matters - verify each position matches
        for (let i = 0; i < correctTrueFalse.length; i++) {
          const userBool = userTrueFalse[i] === true || userTrueFalse[i] === 'true';
          const correctBool = correctTrueFalse[i];
          
          if (userBool !== correctBool) {
            return false;
          }
        }
        return true;
        
      case 'number':
        // For number, compare as numbers
        let correctNumber = Array.isArray(parsedCorrectAnswer) 
          ? parsedCorrectAnswer[0] 
          : parsedCorrectAnswer;
          
        return Number(userAnswer) === Number(correctNumber);
        
      case 'text':
        // For text, compare as trimmed, lowercase strings
        let correctText = Array.isArray(parsedCorrectAnswer) 
          ? parsedCorrectAnswer[0] 
          : parsedCorrectAnswer;
          
        return String(userAnswer).trim().toLowerCase() === 
               String(correctText).trim().toLowerCase();
        
      default:
        // For any other type, do string comparison
        return String(userAnswer) === String(correctAnswer);
    }
  } catch (error) {
    console.error('Error comparing answers:', error);
    console.error(`Failed to compare: ${questionType}, User: ${JSON.stringify(userAnswer)}, Correct: ${JSON.stringify(correctAnswer)}`);
    return false; // Default to incorrect if there's an error
  }
};

/**
 * Parse user answers from JSON format in tExamSession
 */
export const parseUserAnswers = (answers: any): Record<string, any> => {
  if (!answers) return {};
  
  // If answers is already a parsed object, return it
  if (typeof answers === 'object' && !Array.isArray(answers)) {
    return answers;
  }
  
  // Try to parse the JSON string
  try {
    return JSON.parse(answers);
  } catch (error) {
    console.error('Error parsing user answers:', error);
    return {};
  }
};

/**
 * Process all exam answers for an exam schedule with transaction support
 */
export const processExamScheduleAnswers = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    const userId = req.user!.id;
    const { examScheduleId } = req.query;
    
    // Get exam ID list from exam schedule
    const examSchedule = await UserExamAnswers.getExamScheduleById(Number(examScheduleId));
    
    if (!examSchedule) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Exam schedule not found.'
      });
    }
    
    // Get all relevant exam sessions for this user and schedule
    const examSessions = await UserExamAnswers.getExamSessionsByScheduleAndUser(
      Number(examScheduleId),
      userId
    );
    
    if (!examSessions || examSessions.length === 0) { 
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'No submitted exam sessions found for this schedule.'
      });
    }
    
    // Process each exam session
    const results = [];
    for (const session of examSessions) {
      // Skip empty answer sessions
      const parsedAnswers = parseUserAnswers(session.answers);
      if (!session.answers || Object.keys(parsedAnswers).length === 0) {
        console.log(`Skipping session ${session.id} with empty answers`);
        continue;
      }
      
      try {
        // Get questions for this exam
        const questions = await UserExamAnswers.getExamQuestions(session.exam_id);
        
        // Track correct answers
        let correctCount = 0;
        const processedAnswers = [];
        
        // Process each question and answer
        for (const question of questions) {
          const questionId = question.id;
          const userAnswer = parsedAnswers[questionId.toString()]; // Make sure keys are strings
          
          // Skip questions that weren't answered
          if (userAnswer === undefined) continue;
          
          // Check if the answer is correct
          const isCorrect = isAnswerCorrect(
            userAnswer, 
            question.correct_answer, 
            question.question_type
          );
          
          if (isCorrect) correctCount++;
          
          // Save the answer
          const answerData = {
            exam_id: session.exam_id,
            question_id: questionId,
            user_answer: userAnswer,
            user_id: userId,
            is_correct: isCorrect,
            question_type: question.question_type
          };
          
          const savedAnswer = await UserExamAnswers.saveUserAnswer(answerData);
          processedAnswers.push(savedAnswer);
        }
        
        // Get total questions count
        const totalQuestions = await UserExamAnswers.countTotalQuestions(session.exam_id);
        
        // Calculate score (percentage)
        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        
        // Save final score
        const scoreData = {
          user_id: userId,
          exam_id: session.exam_id,
          score,
          total_questions: totalQuestions,
          total_correct: correctCount,
          exam_schedule_id: Number(examScheduleId)
        };
        
        const savedScore = await UserExamAnswers.saveUserExamScore(scoreData);
        
        results.push({
          examSessionId: session.id,
          examId: session.exam_id,
          score: savedScore,
          correctAnswers: correctCount,
          totalQuestions,
          processedAnswers
        });
      } catch (error) {
        // If there's an error processing any session, roll back the entire transaction
        console.error(`Error processing session ${session.id}:`, error);
        await client.query('ROLLBACK');
        throw error; // Rethrow to be caught by the outer try-catch
      }
    }
    
    // If we made it here, commit the transaction
    await client.query('COMMIT');
    
    return res.status(200).json({
      success: true,
      message: 'All exam answers processed successfully',
      data: results
    });
  } catch (error) {
    // Make sure transaction is rolled back on any error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }
    
    console.error('Error processing exam schedule answers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process exam schedule answers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // Always release the client back to the pool
    client.release();
  }
};

/**
 * Submit a single answer for a specific question
 */
export const submitSingleAnswer = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const client = await pool.connect();
  try {
    // Start transaction
    await client.query('BEGIN');
    
    const userId = req.user!.id;
    const { questionId } = req.query;
    const { exam_schedule_id, exam_id, user_answer, elapsed_time } = req.body;
    
    // Validate required fields
    if (!exam_schedule_id || !exam_id || user_answer === undefined) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: exam_schedule_id, exam_id, and user_answer are required.'
      });
    }
    
    // Validate questionId
    if (!questionId || isNaN(Number(questionId))) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID.'
      });
    }

    // Get question details
    const question = await UserExamAnswers.getQuestionById(Number(questionId));
    
    if (!question) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Question not found.'
      });
    }

    // Check if the answer is correct
    const isCorrect = isAnswerCorrect(
      user_answer, 
      question.correct_answer, 
      question.question_type
    );
    
    // Prepare answer data
    const answerData = {
      exam_id: parseInt(exam_id),
      question_id: parseInt(questionId as string),
      user_answer: user_answer,
      user_id: userId,
      is_correct: isCorrect,
      question_type: question.question_type,
      elapsed_time: elapsed_time || null,
    };
    
    // Save or update the answer
    const savedAnswer = await UserExamAnswers.saveUserAnswer(answerData);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    return res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        answer_id: savedAnswer.id,
        question_id: parseInt(questionId as string),
        exam_id: parseInt(exam_id),
        is_correct: isCorrect,
        user_answer: user_answer,
        elapsed_time: elapsed_time,
        submitted_at: savedAnswer.answer_time,
        level: question.level,
        correct_answer: question.correct_answer,
        pembahasan: question.pembahasan
      }
    });
    
  } catch (error) {
    // Rollback transaction on error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }
    
    console.error('Error submitting single answer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // Always release the client back to the pool
    client.release();
  }
};

/**
 * Get user exam stat level
 */
export const getUserExamStatLevel = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { examScheduleId } = req.query;
    const userId = req.user!.id;

    if (!examScheduleId || isNaN(Number(examScheduleId))) {
      return res.status(400).json({ error: 'Invalid exam schedule ID' });
    }

    const examData = await UserExamAnswers.getUserExamStatLevel(Number(examScheduleId), userId);

    if (!examData || !examData.stats || examData.stats.length === 0) {
      return res.status(404).json({ error: 'No exam data found for this schedule and user' });
    }

    res.status(200).json(examData);
  } catch (error) {
    console.error('Error fetching user exam data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Submit diagnostic answers
 */
export const submitDiagnosticAnswers = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userId = req.user!.id;
    const { examId } = req.query;
    const { answers }: DiagnosticAnswerData = req.body;

    if (!examId || isNaN(Number(examId)) || !Array.isArray(answers) || answers.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'examId harus valid & answers tidak boleh kosong'
      });
    }

    // Ambil bank soal utk exam ini
    const questions = await UserExamAnswers.getExamQuestions(Number(examId));
    const qMap = new Map(questions.map(q => [q.id, q]));

    let correctCount = 0;
    const processed = [];

    for (const a of answers) {
      const qDetail = qMap.get(Number(a.question_id));
      if (!qDetail) continue; // soal tak dikenal → skip

      const isCorrect = isAnswerCorrect(
        a.user_answer,
        qDetail.correct_answer,
        qDetail.question_type
      );
      if (isCorrect) correctCount++;

      const saved = await UserExamAnswers.saveUserAnswer({
        exam_id: Number(examId),
        question_id: qDetail.id,
        user_answer: a.user_answer,
        user_id: userId,
        is_correct: isCorrect,
        question_type: qDetail.question_type,
        elapsed_time: a.elapsed_time ?? null
      });
      processed.push(saved);
    }

    const totalQuestions = await UserExamAnswers.countTotalQuestionLevel(Number(examId));
    const score = totalQuestions ? Math.round((correctCount/totalQuestions)*100) : 0;

    // simpan skor (hapus blok ini bila tidak diperlukan)
    const savedScore = await UserExamAnswers.saveUserExamScore({
      user_id: userId,
      exam_id: Number(examId),
      score,
      total_questions: totalQuestions,
      total_correct: correctCount,
      exam_schedule_id: undefined // diagnostic berdiri sendiri
    });

    await client.query('COMMIT');
    return res.status(200).json({
      success: true,
      message: 'Diagnostic answers processed',
      data: {
        examId: Number(examId),
        score: savedScore,
        totalQuestions,
        correctAnswers: correctCount,
        processedAnswers: processed
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('submitDiagnosticAnswers error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  } finally {
    client.release();
  }
};