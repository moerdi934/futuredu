'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDrill, useCurrentDrillSession } from '../../context/DrillContext';
import SingleChoice from '../exam/SingleChoice';
import MultipleChoice from '../exam/MultipleChoice';
import NumberInput from '../exam/NumberInput';
import TextInput from '../exam/TextInput';
import TrueFalse from '../exam/TrueFalse';
import { Container, Row, Col, Card, Button, Modal, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Clock, Loader2, Check, FileCheck, ArrowRight, Lightbulb, X, AlertCircle, Home } from 'lucide-react';
import Latex from 'react-latex-next';
import axios from 'axios';

interface Question {
  id: number;
  type: string;
  question: string;
  options?: string[];
  statements?: string[];
  explanation?: string;
  correct_answer?: any;
  exam_id?: number;
}

interface QuestionLeft {
  exam_id: number;
  remaining_questions: number[];
}

interface AnswerPayload {
  exam_schedule_id: number;
  exam_id: number;
  user_answer: any;
  elapsed_time: number;
}

interface ScoreResponse {
  is_correct: boolean;
  correct_answer: any;
  explanation: string;
  user_answer: any;
  pembahasan?: string;
}

// Utility function untuk logging yang konsisten
const logger = {
  info: (component: string, action: string, data?: any) => {
    console.log(`[${new Date().toISOString()}] [PracticeDrill] [${component}] [INFO] ${action}`, data ? data : '');
  },
  warn: (component: string, action: string, data?: any) => {
    console.warn(`[${new Date().toISOString()}] [PracticeDrill] [${component}] [WARN] ${action}`, data ? data : '');
  },
  error: (component: string, action: string, error?: any) => {
    console.error(`[${new Date().toISOString()}] [PracticeDrill] [${component}] [ERROR] ${action}`, error ? error : '');
  },
  debug: (component: string, action: string, data?: any) => {
    console.debug(`[${new Date().toISOString()}] [PracticeDrill] [${component}] [DEBUG] ${action}`, data ? data : '');
  }
};

const PracticeDrill: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const examString = params?.examString as string;
  
  // Drill context
  const { 
    createSession, 
    updateQuestionsLeft, 
    removeSession,
    generateSessionId
  } = useDrill();
  const { session: currentSession, sessionId } = useCurrentDrillSession();

  // ======= Session & akses logic =======
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [sessionVerified, setSessionVerified] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);

  // ======= Soal drill logic =======
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [questionsLeft, setQuestionsLeft] = useState<QuestionLeft[]>([]);
  const [currentExamId, setCurrentExamId] = useState<number | null>(null);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);
  const [completedQuestionsCount, setCompletedQuestionsCount] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [scoreResponse, setScoreResponse] = useState<ScoreResponse | null>(null);

  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(Date.now());
  const mountedRef = useRef(true);
  const initializationRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    logger.info('Component', 'Component mounted', { examString });
    
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      logger.info('Component', 'Component unmounted');
    };
  }, [examString]);

  // Initialize session ONLY ONCE
  useEffect(() => {
    if (initializationRef.current) {
      logger.debug('SessionInit', 'Initialization already in progress, skipping');
      return;
    }

    initializationRef.current = true;
    logger.info('SessionInit', 'Starting ONE-TIME session initialization');
    
    const initializeSession = () => {
      logger.debug('SessionInit', 'Checking URL parameters');
      
      // Try to get session data from URL params (when coming from another page)
      const examScheduleId = searchParams?.get('exam_schedule_id');
      const topicId = searchParams?.get('topic_id');
      const sessionIdParam = searchParams?.get('session_id');
      const examId = searchParams?.get('exam_id');
      const questionsLeftParam = searchParams?.get('questions_left');

      logger.debug('SessionInit', 'URL parameters extracted', {
        examScheduleId,
        topicId,
        sessionIdParam,
        examId,
        questionsLeftParam: questionsLeftParam ? questionsLeftParam.substring(0, 100) + '...' : null
      });

      if (examScheduleId && topicId && sessionIdParam && examId && questionsLeftParam) {
        try {
          logger.info('SessionInit', 'Creating session from URL parameters');
          
          const questionsLeft = JSON.parse(decodeURIComponent(questionsLeftParam));
          
          logger.debug('SessionInit', 'Questions left parsed', { 
            questionsCount: questionsLeft.length,
            totalQuestions: questionsLeft.reduce((total: number, ql: QuestionLeft) => total + ql.remaining_questions.length, 0)
          });
          
          // Generate unique session ID for this drill instance
          const drillSessionId = generateSessionId(
            parseInt(examScheduleId), 
            parseInt(examId), 
            parseInt(topicId)
          );
          
          logger.info('SessionInit', 'Generated drill session ID', { drillSessionId });
          
          // Create new session
          createSession(drillSessionId, {
            exam_schedule_id: parseInt(examScheduleId),
            topic_id: parseInt(topicId),
            session_id: parseInt(sessionIdParam),
            exam_id: parseInt(examId),
            questions_left: questionsLeft,
            exam_string: examString
          });
          
          setSessionInitialized(true);
          logger.info('SessionInit', 'Session created successfully from URL parameters');
          return;
        } catch (error) {
          logger.error('SessionInit', 'Error parsing URL parameters', error);
        }
      }

      // Try to get from existing sessionStorage (fallback for compatibility)
      logger.debug('SessionInit', 'Checking sessionStorage for fallback');
      
      if (typeof window !== 'undefined') {
        const storedState = sessionStorage.getItem('drillState');
        if (storedState) {
          try {
            logger.info('SessionInit', 'Found stored state in sessionStorage');
            
            const parsedState = JSON.parse(storedState);
            const drillSessionId = generateSessionId(
              parsedState.exam_schedule_id,
              parsedState.exam_id,
              parsedState.topic_id
            );
            
            logger.debug('SessionInit', 'Creating session from sessionStorage', {
              drillSessionId,
              examScheduleId: parsedState.exam_schedule_id,
              examId: parsedState.exam_id,
              topicId: parsedState.topic_id
            });
            
            createSession(drillSessionId, {
              ...parsedState,
              exam_string: examString
            });
            
            // Clean up old sessionStorage
            sessionStorage.removeItem('drillState');
            setSessionInitialized(true);
            logger.info('SessionInit', 'Session created from sessionStorage and cleaned up');
            return;
          } catch (error) {
            logger.error('SessionInit', 'Error parsing stored state', error);
          }
        }
      }

      // If no valid session data found
      logger.warn('SessionInit', 'No valid session data found, setting error state');
      setPageError('Anda tidak dapat akses latihan ini. Hubungi admin jika Anda merasa ini kesalahan.');
      setPageLoading(false);
      logger.error('SessionInit', 'Access denied - no valid session data');
    };

    initializeSession();
  }, [searchParams, examString, createSession, generateSessionId]);

  // Session verification - hanya jalankan jika session sudah terinisialisasi
  useEffect(() => {
    if (!sessionInitialized || !currentSession) {
      logger.debug('SessionVerify', 'Session not initialized or no current session', {
        sessionInitialized,
        hasCurrentSession: !!currentSession
      });
      return;
    }

    // Prevent multiple verification calls
    if (sessionVerified) {
      logger.debug('SessionVerify', 'Session already verified, skipping');
      return;
    }

    logger.info('SessionVerify', 'Starting session verification', {
      sessionId: currentSession.session_id,
      examScheduleId: currentSession.exam_schedule_id,
      examId: currentSession.exam_id
    });

    const verifySession = async () => {
      try {
        setPageError(null); // Clear any previous errors
        
        logger.debug('SessionVerify', 'Sending verification request to API');
        
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/examSession/verifikasi`,
          {
            schedule_id: currentSession.exam_schedule_id,
            exam_id: currentSession.exam_id,
            session_id: currentSession.session_id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        logger.info('SessionVerify', 'Verification response received', { 
          status: res.status,
          responseData: res.data 
        });

        if (res.status === 200 && mountedRef.current) {
          setSessionVerified(true);
          setQuestionsLeft(currentSession.questions_left || []);
          
          const totalCount = (currentSession.questions_left || []).reduce(
            (total, ql) => total + ql.remaining_questions.length,
            0
          );
          setTotalQuestionsCount(totalCount);
          setPageLoading(false);
          setPageError(null); // Ensure error is cleared
          
          logger.info('SessionVerify', 'Session verified successfully', {
            totalQuestions: totalCount,
            questionsLeftCount: currentSession.questions_left?.length
          });
        } else {
          const errorMsg = 'Gagal verifikasi sesi. Silakan mulai ulang dari kursus.';
          setPageError(errorMsg);
          setPageLoading(false);
          logger.warn('SessionVerify', 'Verification failed - unexpected status', { status: res.status });
        }
      } catch (err: any) {
        if (!mountedRef.current) return;
        
        logger.error('SessionVerify', 'Verification request failed', {
          status: err?.response?.status,
          message: err?.message,
          response: err?.response?.data
        });
        
        if (err?.response?.status === 403) {
          const errorMsg = 'Sesi tidak valid atau sudah kedaluwarsa. Silakan mulai latihan drill dari kursus terkait.';
          setPageError(errorMsg);
          logger.error('SessionVerify', 'Session invalid or expired (403)');
        } else {
          const errorMsg = 'Tidak dapat memverifikasi sesi. Hubungi admin jika ini kesalahan.';
          setPageError(errorMsg);
          logger.error('SessionVerify', 'Verification failed with unknown error');
        }
        setPageLoading(false);
      }
    };

    verifySession();
  }, [sessionInitialized, currentSession, sessionVerified]);

  // Load questions setelah session terverifikasi
  useEffect(() => {
    if (!sessionVerified || !currentSession) {
      logger.debug('QuestionLoad', 'Conditions not met for loading questions', {
        sessionVerified,
        hasCurrentSession: !!currentSession
      });
      return;
    }
    
    logger.info('QuestionLoad', 'Session verified, checking questions', {
      questionsLeftCount: questionsLeft.length
    });
    
    if (questionsLeft.length > 0) {
      loadCurrentQuestion();
    } else {
      logger.warn('QuestionLoad', 'No questions left to load');
      setLoading(false);
    }
  }, [sessionVerified, currentSession, questionsLeft]);

  const getInitialAnswer = useCallback((questionType: string, statements?: string[]) => {
    logger.debug('Answer', 'Getting initial answer', { questionType, statementsCount: statements?.length });
    
    switch (questionType) {
      case 'single-choice':
        return '';
      case 'multiple-choice':
        return [];
      case 'number':
        return undefined;
      case 'text':
        return '';
      case 'true-false':
        return statements ? Array(statements.length).fill(undefined) : [];
      default:
        logger.warn('Answer', 'Unknown question type for initial answer', { questionType });
        return null;
    }
  }, []);

  const getNextQuestionId = useCallback((): { questionId: number; examId: number } | null => {
    logger.debug('QuestionSelection', 'Getting next question ID', {
      questionsLeftCount: questionsLeft.length
    });
    
    for (const ql of questionsLeft) {
      if (ql.remaining_questions.length > 0) {
        const result = { questionId: ql.remaining_questions[0], examId: ql.exam_id };
        logger.debug('QuestionSelection', 'Next question found', result);
        return result;
      }
    }
    
    logger.warn('QuestionSelection', 'No next question found');
    return null;
  }, [questionsLeft]);

  const loadCurrentQuestion = useCallback(async () => {
    logger.info('QuestionLoad', 'Starting to load current question');
    
    if (!questionsLeft || questionsLeft.length === 0) {
      const errorMsg = 'Tidak ada soal yang tersisa untuk dikerjakan.';
      setError(errorMsg);
      setLoading(false);
      logger.warn('QuestionLoad', errorMsg);
      return;
    }
    
    const nextQuestion = getNextQuestionId();
    if (!nextQuestion) {
      const errorMsg = 'Semua soal sudah selesai dikerjakan!';
      setError(errorMsg);
      setLoading(false);
      logger.info('QuestionLoad', errorMsg);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      logger.info('QuestionLoad', 'Fetching question from API', {
        questionId: nextQuestion.questionId,
        examId: nextQuestion.examId
      });
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/u/${nextQuestion.questionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!mountedRef.current) return;
      
      logger.info('QuestionLoad', 'Question fetched successfully', {
        questionId: response.data.id,
        questionType: response.data.question_type,
        hasOptions: !!response.data.options,
        hasStatements: !!response.data.statements,
        optionsCount: response.data.options?.length,
        statementsCount: response.data.statements?.length
      });
      
      const fetchedQuestion: Question = {
        id: response.data.id,
        type: response.data.question_type,
        question: response.data.question_text,
        options: response.data.options,
        statements: response.data.statements,
        exam_id: nextQuestion.examId
      };
      
      setQuestion(fetchedQuestion);
      setCurrentQuestionId(fetchedQuestion.id);
      setCurrentExamId(nextQuestion.examId);
      
      const initialAnswer = getInitialAnswer(fetchedQuestion.type, fetchedQuestion.statements);
      setAnswer(initialAnswer);
      setSubmitted(false);
      setShowExplanation(false);
      setIsAnswerCorrect(null);
      setScoreResponse(null);
      setTimeElapsed(0);
      
      logger.info('QuestionLoad', 'Question loaded and state reset', {
        questionId: fetchedQuestion.id,
        questionType: fetchedQuestion.type,
        initialAnswer
      });
      
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      logger.error('QuestionLoad', 'Failed to fetch question', {
        status: err.response?.status,
        message: err?.message,
        questionId: nextQuestion.questionId
      });
      
      if (err.response?.status === 404) {
        setError('Soal tidak ditemukan. Silakan coba lagi.');
      } else {
        setError('Gagal memuat soal. Silakan coba lagi.');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [questionsLeft, getNextQuestionId, getInitialAnswer]);

  // Timer management
  useEffect(() => {
    if (!loading && !submitted && question && mountedRef.current) {
      logger.info('Timer', 'Starting timer for question', { questionId: question.id });
      
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        if (mountedRef.current) {
          setTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          logger.debug('Timer', 'Cleaning up timer');
          clearInterval(timerRef.current);
        }
      };
    }
  }, [loading, submitted, question]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
      : `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleChange = useCallback((value: any) => {
    logger.debug('Answer', 'Answer changed', { 
      questionType: question?.type,
      newValue: value,
      questionId: currentQuestionId 
    });
    setAnswer(value);
  }, [question?.type, currentQuestionId]);

  const handleTrueFalseChange = useCallback((index: number, value: any) => {
    logger.debug('Answer', 'True/False answer changed', { 
      index, 
      value, 
      questionId: currentQuestionId 
    });
    
    setAnswer(prev => {
      const updatedAnswer = [...(prev || [])];
      updatedAnswer[index] = value;
      return updatedAnswer;
    });
  }, [currentQuestionId]);

  const handleSubmit = useCallback(() => {
    logger.info('Submit', 'Submit button clicked', {
      questionId: currentQuestionId,
      answer,
      timeElapsed,
      questionType: question?.type
    });
    setShowSubmitModal(true);
  }, [currentQuestionId, answer, timeElapsed, question?.type]);

  const formatAnswerForDisplay = (ans: any, type: string): string => {
    switch (type) {
      case 'single-choice':
        return ans;
      case 'multiple-choice':
        return Array.isArray(ans) ? ans.join(', ') : String(ans);
      case 'number':
        return String(ans);
      case 'text':
        return ans;
      case 'true-false':
        if (Array.isArray(ans)) {
          return ans.map(a => a ? 'Benar' : 'Salah').join(', ');
        }
        return String(ans);
      default:
        return String(ans);
    }
  };

  const submitAnswerToAPI = async (questionId: number, examId: number, userAnswer: any, elapsed: number): Promise<ScoreResponse | null> => {
    logger.info('SubmitAPI', 'Submitting answer to API', {
      questionId,
      examId,
      userAnswer,
      elapsed,
      examScheduleId: currentSession?.exam_schedule_id
    });
    
    try {
      const payload: AnswerPayload = {
        exam_schedule_id: currentSession!.exam_schedule_id,
        exam_id: examId,
        user_answer: userAnswer,
        elapsed_time: elapsed
      };
      
      logger.debug('SubmitAPI', 'Sending payload to score endpoint', payload);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/score/with-a/${questionId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      logger.info('SubmitAPI', 'Score response received', {
        isCorrect: response.data.data.is_correct,
        hasExplanation: !!response.data.data.explanation,
        hasPembahasan: !!response.data.data.pembahasan,
        correctAnswer: response.data.data.correct_answer
      });
      
      return {
        is_correct: response.data.data.is_correct,
        correct_answer: response.data.data.correct_answer,
        explanation: response.data.data.explanation,
        user_answer: response.data.data.user_answer || userAnswer,
        pembahasan: response.data.data.pembahasan
      };
    } catch (err: any) {
      logger.error('SubmitAPI', 'Failed to submit answer', {
        status: err.response?.status,
        message: err?.message,
        response: err.response?.data,
        questionId
      });
      return null;
    }
  };

  const confirmSubmit = async () => {
    if (!question || !currentSession || !currentQuestionId) {
      logger.warn('SubmitConfirm', 'Cannot submit - missing required data', {
        hasQuestion: !!question,
        hasCurrentSession: !!currentSession,
        hasCurrentQuestionId: !!currentQuestionId
      });
      return;
    }
    
    logger.info('SubmitConfirm', 'Confirming submission', {
      questionId: currentQuestionId,
      examId: currentExamId,
      timeElapsed
    });
    
    setSubmitLoading(true);
    
    if (timerRef.current) {
      logger.debug('SubmitConfirm', 'Stopping timer');
      clearInterval(timerRef.current);
    }
    
    const scoreResult = await submitAnswerToAPI(
      currentQuestionId,
      currentExamId || 0,
      answer,
      timeElapsed
    );
    
    if (scoreResult && mountedRef.current) {
      logger.info('SubmitConfirm', 'Answer submitted successfully', {
        isCorrect: scoreResult.is_correct,
        questionId: currentQuestionId
      });
      
      setScoreResponse(scoreResult);
      setIsAnswerCorrect(scoreResult.is_correct);
      setQuestion(prev => prev ? {
        ...prev,
        correct_answer: scoreResult.correct_answer,
        explanation: scoreResult.explanation
      } : prev);
      setSubmitted(true);
    } else if (mountedRef.current) {
      logger.error('SubmitConfirm', 'Failed to submit answer');
      setError('Gagal menyimpan jawaban. Silakan coba lagi.');
    }
    
    setShowSubmitModal(false);
    setSubmitLoading(false);
  };

  const handleShowExplanation = useCallback(() => {
    logger.info('UI', 'Showing explanation', { questionId: currentQuestionId });
    setShowExplanation(true);
  }, [currentQuestionId]);

  const handleNextQuestion = useCallback(() => {
    if (!currentSession || !sessionId) {
      logger.warn('NextQuestion', 'Cannot proceed - missing session data', {
        hasCurrentSession: !!currentSession,
        hasSessionId: !!sessionId
      });
      return;
    }

    logger.info('NextQuestion', 'Moving to next question', {
      currentQuestionId,
      currentExamId,
      questionsLeftCount: questionsLeft.length
    });

    const updatedQuestionsLeft = questionsLeft.map(ql => {
      if (ql.exam_id === currentExamId) {
        const filtered = ql.remaining_questions.filter(qId => qId !== currentQuestionId);
        logger.debug('NextQuestion', 'Updated questions for exam', {
          examId: ql.exam_id,
          removedQuestionId: currentQuestionId,
          remainingCount: filtered.length
        });
        return {
          ...ql,
          remaining_questions: filtered
        };
      }
      return ql;
    }).filter(ql => ql.remaining_questions.length > 0);

    // Update context instead of sessionStorage
    updateQuestionsLeft(sessionId, updatedQuestionsLeft);
    setQuestionsLeft(updatedQuestionsLeft);
    setCompletedQuestionsCount(prev => prev + 1);

    const hasMoreQuestions = updatedQuestionsLeft.some(ql => ql.remaining_questions.length > 0);
    
    logger.info('NextQuestion', 'Questions updated', {
      updatedQuestionsLeftCount: updatedQuestionsLeft.length,
      hasMoreQuestions,
      completedCount: completedQuestionsCount + 1
    });
    
    if (!hasMoreQuestions) {
      logger.info('NextQuestion', 'All questions completed, removing session and navigating back');
      // Remove session when drill is completed
      if (sessionId) {
        removeSession(sessionId);
      }
      router.back();
      return;
    }
    
    // Reset for next question
    setQuestion(null);
    setLoading(true);
    startTimeRef.current = Date.now();
  }, [currentSession, sessionId, currentQuestionId, currentExamId, questionsLeft, updateQuestionsLeft, removeSession, router, completedQuestionsCount]);

  const handleBackToDashboard = useCallback(() => {
    logger.info('Navigation', 'Navigating back to dashboard');
    
    // Clean up session when leaving
    if (sessionId) {
      logger.debug('Navigation', 'Removing session', { sessionId });
      removeSession(sessionId);
    }
    router.push('/dashboard');
  }, [sessionId, removeSession, router]);

  const isAnswerFilled = useCallback((): boolean => {
    if (!question) return false;
    
    const filled = (() => {
      switch (question.type) {
        case 'single-choice':
          return answer !== '' && answer !== null;
        case 'multiple-choice':
          return Array.isArray(answer) && answer.length > 0;
        case 'number':
          return typeof answer === 'number' && !isNaN(answer);
        case 'text':
          return answer !== '' && answer !== null;
        case 'true-false':
          return Array.isArray(answer) &&
            answer.length === (question.statements?.length || 0) &&
            answer.every(a => a !== undefined);
        default:
          return false;
      }
    })();
    
    logger.debug('Answer', 'Checking if answer is filled', {
      questionType: question.type,
      answer,
      filled,
      questionId: currentQuestionId
    });
    
    return filled;
  }, [question, answer, currentQuestionId]);

  const renderQuestion = (q: Question) => {
    if (answer === null) {
      logger.warn('Render', 'Cannot render question - answer is null', { questionId: q.id });
      return null;
    }
    
    logger.debug('Render', 'Rendering question', {
      questionId: q.id,
      questionType: q.type,
      hasOptions: !!q.options,
      hasStatements: !!q.statements
    });
    
    switch (q.type) {
      case 'single-choice':
        return (
          <SingleChoice
            question={<Latex>{q.question}</Latex>}
            options={q.options || []}
            onChange={handleChange}
            selectedAnswers={answer}
            submitted={submitted}
            correctAnswer={scoreResponse?.correct_answer}
          />
        );
      case 'multiple-choice':
        if (!Array.isArray(answer)) {
          logger.warn('Render', 'Multiple choice answer is not array', { answer, questionId: q.id });
          return null;
        }
        return (
          <MultipleChoice
            question={<Latex>{q.question}</Latex>}
            options={q.options || []}
            selectedAnswers={answer}
            onChange={handleChange}
            submitted={submitted}
            correctAnswer={scoreResponse?.correct_answer}
          />
        );
case 'number':
        return (
          <NumberInput
            question={q.question}
            onChange={handleChange}
            value={answer}
            submitted={submitted}
            correctAnswer={scoreResponse?.correct_answer}
          />
        );
      case 'text':
        return (
          <TextInput
            question={q.question}
            onChange={handleChange}
            value={answer}
            submitted={submitted}
            correctAnswer={scoreResponse?.correct_answer}
          />
        );
      case 'true-false':
        if (!Array.isArray(answer)) {
          logger.warn('Render', 'True/False answer is not array', { answer, questionId: q.id });
          return null;
        }
        return (
          <TrueFalse
            question={q.question}
            statements={q.statements || []}
            selectedAnswers={answer}
            onChange={handleTrueFalseChange}
            submitted={submitted}
            correctAnswer={scoreResponse?.correct_answer}
          />
        );
      default:
        logger.warn('Render', 'Unknown question type', { questionType: q.type, questionId: q.id });
        return null;
    }
  };

  const hasMoreQuestions = useCallback(() => {
    const result = questionsLeft.some(ql => ql.remaining_questions.length > 0);
    logger.debug('Questions', 'Checking if more questions available', {
      result,
      questionsLeftCount: questionsLeft.length
    });
    return result;
  }, [questionsLeft]);

  // Debug current state
  logger.debug('State', 'Current component state', {
    pageLoading,
    pageError,
    sessionVerified,
    sessionInitialized,
    loading,
    error,
    hasQuestion: !!question,
    hasCurrentSession: !!currentSession,
    sessionId,
    questionsLeftCount: questionsLeft.length
  });

  // =================== UI: ACCESS ERROR / LOADING ===================
  if (pageLoading) {
    logger.debug('UI', 'Rendering page loading state');
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">Memeriksa Akses...</h2>
          <p className="tw-text-violet-600 tw-mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    logger.debug('UI', 'Rendering page error state', { pageError });
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <Container>
          <Row className="tw-justify-center">
            <Col md={6}>
              <Card className="tw-shadow-lg tw-border-0 tw-rounded-xl">
                <Card.Body className="tw-text-center tw-py-8">
                  <AlertCircle className="tw-h-16 tw-w-16 tw-text-red-500 tw-mx-auto tw-mb-4" />
                  <h2 className="tw-text-xl tw-font-semibold tw-text-red-800 tw-mb-3">
                    Tidak Dapat Akses Latihan
                  </h2>
                  <p className="tw-text-red-600 tw-mb-6">{pageError}</p>
                  <Button
                    className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center tw-mx-auto"
                    onClick={handleBackToDashboard}
                  >
                    <Home className="tw-mr-2" size={16} />
                    Kembali ke Dashboard
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // =================== UI: DRILL LOGIC ===================
  if (error) {
    logger.debug('UI', 'Rendering error state', { error });
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <Container>
          <Row className="tw-justify-center">
            <Col md={6}>
              <Card className="tw-shadow-lg tw-border-0 tw-rounded-xl">
                <Card.Body className="tw-text-center tw-py-8">
                  <AlertCircle className="tw-h-16 tw-w-16 tw-text-red-500 tw-mx-auto tw-mb-4" />
                  <h2 className="tw-text-xl tw-font-semibold tw-text-red-800 tw-mb-3">
                    Terjadi Kesalahan
                  </h2>
                  <p className="tw-text-red-600 tw-mb-6">{error}</p>
                  <Button
                    className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center tw-mx-auto"
                    onClick={handleBackToDashboard}
                  >
                    <Home className="tw-mr-2" size={16} />
                    Kembali ke Dashboard
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (loading) {
    logger.debug('UI', 'Rendering loading state');
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">Loading Soal...</h2>
          <p className="tw-text-violet-600 tw-mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (!question && !loading) {
    logger.debug('UI', 'Rendering completion state - no questions left');
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <Container>
          <Row className="tw-justify-center">
            <Col md={6}>
              <Card className="tw-shadow-lg tw-border-0 tw-rounded-xl">
                <Card.Body className="tw-text-center tw-py-8">
                  <Check className="tw-h-16 tw-w-16 tw-text-green-500 tw-mx-auto tw-mb-4" />
                  <h2 className="tw-text-2xl tw-font-bold tw-text-green-800 tw-mb-3">
                    Selamat! 🎉
                  </h2>
                  <p className="tw-text-green-600 tw-mb-6">
                    Anda telah menyelesaikan semua soal drill ini!
                  </p>
                  <Button
                    className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center tw-mx-auto"
                    onClick={handleBackToDashboard}
                  >
                    <Home className="tw-mr-2" size={16} />
                    Kembali ke Dashboard
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  logger.debug('UI', 'Rendering main drill interface', {
    questionId: question?.id,
    questionType: question?.type,
    submitted,
    timeElapsed,
    progressPercent: (completedQuestionsCount / totalQuestionsCount) * 100
  });

  return (
    <div className="tw-min-h-screen tw-bg-violet-50">
      <div className="tw-bg-violet-600 tw-text-white tw-py-4 tw-shadow-lg tw-mb-6">
        <Container>
          <div className="tw-flex tw-justify-between tw-items-center">
            <div className="tw-flex-1 tw-min-w-0">
              <h1 className="tw-text-2xl tw-font-bold tw-mb-1 tw-break-words tw-pr-4">
                Drill Soal {examString}
              </h1>
              <p className="tw-text-sm tw-text-violet-200">
                Progres: {completedQuestionsCount} dari {totalQuestionsCount} soal
              </p>
              <div className="tw-w-full tw-bg-violet-700 tw-rounded-full tw-h-2 tw-mt-2">
                <div
                  className="tw-bg-violet-300 tw-h-2 tw-rounded-full tw-transition-all tw-duration-300"
                  style={{
                    width: `${(completedQuestionsCount / totalQuestionsCount) * 100}%`
                  }}
                ></div>
              </div>
            </div>
            <div className="tw-flex tw-items-center tw-gap-3 tw-bg-violet-700 tw-rounded-lg tw-px-6 tw-py-3 tw-flex-shrink-0">
              <Clock size={28} className="tw-text-violet-200" />
              <div className="tw-flex tw-flex-col tw-items-start">
                <span className="tw-text-violet-200 tw-text-sm">Waktu</span>
                <span className="tw-text-3xl tw-font-mono tw-font-bold">{formatTime(timeElapsed)}</span>
              </div>
            </div>
          </div>
        </Container>
      </div>
      
      <Container className="tw-mb-8">
        <Row className="tw-justify-center">
          <Col lg={8}>
            <Card className="tw-shadow-md tw-border-0 tw-rounded-xl
              [&_p_img]:tw-max-w-full 
              [&_p_img]:tw-h-auto 
              [&_p_img]:tw-block 
              [&_p_img]:tw-mx-auto 
              [&_p_img]:tw-my-4
              [&_img]:tw-max-w-full 
              [&_img]:tw-h-auto 
              [&_img]:tw-block 
              [&_img]:tw-mx-auto 
              [&_img]:tw-my-4">
              <Card.Body className="tw-p-6">
                {question && (
                  <>
                    <div className="tw-mb-6">
                      {renderQuestion(question)}
                    </div>
                    {!submitted && (
                      <div className="tw-flex tw-justify-center tw-mt-8">
                        <Button
                          className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-px-8"
                          onClick={handleSubmit}
                          disabled={!isAnswerFilled()}
                        >
                          Submit Jawaban
                        </Button>
                      </div>
                    )}
                    {submitted && scoreResponse && (
                      <div className="tw-mt-8">
                        <div className={`tw-p-4 tw-rounded-lg tw-mb-6 ${isAnswerCorrect ? 'tw-bg-green-50 tw-border tw-border-green-200' : 'tw-bg-red-50 tw-border tw-border-red-200'}`}>
                          <div className="tw-font-medium tw-text-lg tw-mb-1">
                            {isAnswerCorrect ? (
                              <span className="tw-text-green-700 tw-flex tw-items-center">
                                <Check className="tw-mr-2" size={20} /> Jawaban Anda Benar!
                              </span>
                            ) : (
                              <span className="tw-text-red-700 tw-flex tw-items-center">
                                <X className="tw-mr-2" size={20} /> Jawaban Anda Salah!
                              </span>
                            )}
                          </div>
                          {!isAnswerCorrect && (
                            <div className="tw-mt-3">
                              <div className="tw-text-red-600">
                                <span className="tw-font-medium">Jawaban Anda:</span> {formatAnswerForDisplay(scoreResponse.user_answer, question.type)}
                              </div>
                              <div className="tw-text-green-600 tw-mt-1">
                                <span className="tw-font-medium">Jawaban Benar:</span> {formatAnswerForDisplay(scoreResponse.correct_answer, question.type)}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="tw-flex tw-gap-4 tw-justify-center tw-flex-wrap">
                          {scoreResponse.pembahasan && (
                            <Button
                              variant="outline-primary"
                              className="tw-border-2 tw-border-violet-600 tw-text-violet-700 hover:tw-bg-violet-50 tw-flex tw-items-center"
                              onClick={handleShowExplanation}
                            >
                              <Lightbulb className="tw-mr-2" size={16} />
                              Lihat Pembahasan
                            </Button>
                          )}
                          {hasMoreQuestions() ? (
                            <Button
                              className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center"
                              onClick={handleNextQuestion}
                            >
                              Lanjut ke Soal Berikutnya
                              <ArrowRight className="tw-ml-2" size={16} />
                            </Button>
                          ) : (
                            <Button
                              className="tw-bg-green-600 tw-border-0 hover:tw-bg-green-700 tw-flex tw-items-center"
                              onClick={handleBackToDashboard}
                            >
                              <Home className="tw-mr-2" size={16} />
                              Kembali ke Dashboard
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                    {showExplanation && scoreResponse?.pembahasan && (
                      <div className="tw-mt-6 tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-4">
                        <div className="tw-flex tw-items-center tw-mb-3">
                          <Lightbulb className="tw-text-blue-600 tw-mr-2" size={20} />
                          <h4 className="tw-text-lg tw-font-semibold tw-text-blue-800">Pembahasan</h4>
                        </div>
                        <div className="tw-text-blue-700">
                          <div dangerouslySetInnerHTML={{ __html: scoreResponse.pembahasan }} />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showSubmitModal}
        onHide={() => {
          logger.debug('UI', 'Submit modal closed by user');
          setShowSubmitModal(false);
        }}
        centered
        backdrop="static"
      >
        <Modal.Header className="tw-bg-violet-50">
          <Modal.Title className="tw-text-violet-800 tw-flex tw-items-center">
            <FileCheck className="tw-mr-2 tw-text-violet-600" size={20} />
            Konfirmasi Submit
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="tw-p-2">
            <p className="tw-text-lg tw-font-medium tw-mb-3 tw-text-violet-900">
              Apakah Anda yakin ingin submit jawaban ini?
            </p>
            <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
              <div className="tw-flex tw-items-center tw-mb-2">
                <Clock className="tw-text-violet-600 tw-mr-2" size={18} />
                <span className="tw-font-medium tw-text-violet-800">Waktu Pengerjaan</span>
              </div>
              <p className="tw-text-violet-700">
                {formatTime(timeElapsed)}
              </p>
            </div>
            <p className="tw-text-gray-600 tw-text-sm">
              Setelah submit, Anda bisa melihat pembahasan dan melanjutkan ke soal berikutnya.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              logger.debug('UI', 'Submit cancelled by user');
              setShowSubmitModal(false);
            }}
            className="tw-border-2 tw-border-violet-200 tw-text-violet-700 hover:tw-bg-violet-50"
            disabled={submitLoading}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={confirmSubmit}
            className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center"
            disabled={submitLoading}
          >
            {submitLoading ? (
              <>
                <Spinner animation="border" size="sm" className="tw-mr-2" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="tw-mr-1" size={16} /> Submit Jawaban
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PracticeDrill;