'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import SingleChoice from './SingleChoice';
import MultipleChoice from './MultipleChoice';
import NumberInput from './NumberInput';
import TextInput from './TextInput';
import TrueFalse from './TrueFalse';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import { Container, Row, Col, ProgressBar, Card, Button, Modal, Alert, Toast } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Clock, Loader2, Check, AlertCircle, FileCheck, ArrowRight } from 'lucide-react';
import examDbService from '../../utils/ExamDBService';
import { useAuth } from '../../context/AuthContext';
import { useExam } from '../../context/ExamContext';

// Enhanced logging function
const debugLog = (category: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${category}] ${message}`, data ? data : '');
};

interface Question {
  id: number;
  type: string;
  question: string;
  options?: string[];
  statements?: string[];
}

interface Answers {
  [key: number]: any;
}

interface ExamOrder {
  exam_string: string;
  name: string;
  exam_id?: number;
  examType: string;
}

interface ExamSession {
  id: number;
  exam_id: string | number;
  start_time: string;
  end_time: string;
  answers: Answers;
  name: string;
  is_auto_move: boolean;
  question_elapsed_times?: Record<number, number>;
}

const ChainExam: React.FC = () => {
  debugLog('INIT', 'ChainExam component initializing');
  
  const params = useParams();
  const exam_string = params?.exam_string as string;
  debugLog('PARAMS', 'Exam string from params', { exam_string });
  
  const [examId, setExamId] = useState<number | null>(null);
  const [examScheduleId, setExamScheduleId] = useState<string | null>(null);
  const [examName, setExamName] = useState<string | null>(null);
  const [examType, setExamType] = useState<string>('Try-Out');
  const router = useRouter();

  // Get data from context
  const { 
    topicId: contextTopicId,
    examScheduleId: contextExamScheduleId,
    examOrder: contextExamOrder,
    examSessions: contextExamSessions,
    activeSession: contextActiveSession,
    selectedSchedule: contextSelectedSchedule,
    examType: contextExamType,
    originPath: contextOriginPath,
    clearExamData
  } = useExam();

  debugLog('CONTEXT', 'Context data received', {
    contextTopicId,
    contextExamScheduleId,
    contextExamOrder: contextExamOrder?.length || 0,
    contextExamSessions: contextExamSessions?.length || 0,
    contextActiveSession: !!contextActiveSession,
    contextExamType,
    contextOriginPath
  });

  // Local state untuk UI
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [showModalNext, setShowModalNext] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [nextExam, setNextExam] = useState<string | null>(null);
  const [showCheckpointToast, setShowCheckpointToast] = useState<boolean>(false);
  const [autoSaving, setAutoSaving] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [isExamAccessible, setIsExamAccessible] = useState<boolean>(true);
  const [showNotAccessibleModal, setShowNotAccessibleModal] = useState(false);
  const [examStartTime, setExamStartTime] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number|null>(null);
  const [originPath, setOriginPath] = useState<string>('/');

  const timerRef = useRef<NodeJS.Timeout>();
  const lastTickRef = useRef<number>(Date.now());
  const autoSaveRef = useRef<NodeJS.Timeout>();

  // Use context data instead of localStorage
  const examOrder = contextExamOrder || [];
  const currentExamIndex = examOrder.findIndex((exam: ExamOrder) => exam.exam_string === exam_string);
  
  debugLog('EXAM_ORDER', 'Exam order processed', {
    examOrderLength: examOrder.length,
    currentExamIndex,
    foundExam: examOrder.find(exam => exam.exam_string === exam_string)
  });

  // Set data from context
  useEffect(() => {
    debugLog('CONTEXT_EFFECT', 'Setting data from context');
    
    if (contextOriginPath) {
      debugLog('CONTEXT_EFFECT', 'Setting origin path', contextOriginPath);
      setOriginPath(contextOriginPath);
    }
    
    if (contextTopicId) {
      debugLog('CONTEXT_EFFECT', 'Setting topic ID', contextTopicId);
      setSelectedTopicId(contextTopicId);
    }
    
    if (contextExamType) {
      debugLog('CONTEXT_EFFECT', 'Setting exam type', contextExamType);
      setExamType(contextExamType);
    }
    
    if (contextExamScheduleId) {
      debugLog('CONTEXT_EFFECT', 'Setting exam schedule ID', contextExamScheduleId);
      setExamScheduleId(contextExamScheduleId.toString());
    }
    
    if (contextActiveSession) {
      debugLog('CONTEXT_EFFECT', 'Setting active session', contextActiveSession);
      setExamSession(contextActiveSession);
    }
    
    // Find current exam from context examOrder
    if (examOrder.length > 0 && exam_string) {
      const currentExam = examOrder.find(exam => exam.exam_string === exam_string);
      debugLog('CONTEXT_EFFECT', 'Looking for current exam', { 
        exam_string, 
        currentExam,
        examOrderCount: examOrder.length 
      });
      
      if (currentExam && currentExam.exam_id) {
        debugLog('CONTEXT_EFFECT', 'Setting exam ID and type', {
          examId: currentExam.exam_id,
          examType: currentExam.examType
        });
        setExamId(currentExam.exam_id);
        setExamType(currentExam.examType);
      }
    }
  }, [contextOriginPath, contextTopicId, contextExamType, contextExamScheduleId, contextActiveSession, examOrder, exam_string]);

  // Question elapsed time tracking
  useEffect(() => {
    if (!loading && questions.length > 0) {
      debugLog('QUESTION_TRACKING', 'Updating question elapsed time', {
        currentQuestionIndex: currentQuestion,
        questionId: questions[currentQuestion]?.id,
        exam_string
      });
      
      if (exam_string) {
        examDbService.updateQuestionElapsedTime(exam_string, questions[currentQuestion].id);
      }
    }
  }, [loading, questions, currentQuestion, exam_string]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      debugLog('CLEANUP', 'Component cleanup');
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      
      if (exam_string && questions.length > 0) {
        examDbService.finalizeCurrentQuestionTime(exam_string);
      }
    };
  }, [exam_string, questions]);

  // Countdown timer for inaccessible exams
  useEffect(() => {
    if (!isExamAccessible && examStartTime) {
      debugLog('COUNTDOWN', 'Starting countdown timer', examStartTime);
      
      const timer = setInterval(() => {
        const now = new Date();
        const startTime = new Date(examStartTime);
        const diff = startTime.getTime() - now.getTime();
        
        if (diff <= 0) {
          debugLog('COUNTDOWN', 'Countdown finished, retrying access');
          clearInterval(timer);
          handleRetryAccess();
          return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isExamAccessible, examStartTime]);

  const decryptData = (encryptedData: string) => {
    debugLog('DECRYPT', 'Starting decryption');
    
    try {
      const [ivHex, encrypted] = encryptedData.split(':');
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const encryptionKeyString = process.env.NEXT_PUBLIC_EXAM_ENCRYPTION_KEY;
      
      if (!encryptionKeyString) {
        debugLog('DECRYPT', 'Encryption key not found');
        throw new Error('Encryption configuration error');
      }
      
      let key;
      if (encryptionKeyString.length >= 32) {
        key = CryptoJS.enc.Utf8.parse(encryptionKeyString.substring(0, 32));
      } else {
        const paddedKey = encryptionKeyString.padEnd(32, '0');
        key = CryptoJS.enc.Utf8.parse(paddedKey);
      }
      
      const decryptParams = {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      };
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, key, decryptParams);
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      
      debugLog('DECRYPT', 'Decryption successful', { resultLength: result.length });
      return result;
    } catch (error) {
      debugLog('DECRYPT', 'Decryption failed', error);
      throw new Error('Failed to decrypt data');
    }
  };

  const findLatestUnfinishedExam = useCallback(async () => {
    debugLog('FIND_EXAM', 'Finding latest unfinished exam', {
      hasExamString: !!exam_string,
      examOrderLength: examOrder.length
    });
    
    if (!exam_string && examOrder.length > 0) {
      setLoading(true);
      
      for (let i = examOrder.length - 1; i >= 0; i--) {
        const hasData = await examDbService.hasExamData(examOrder[i].exam_string);
        debugLog('FIND_EXAM', `Checking exam ${i}`, {
          examString: examOrder[i].exam_string,
          hasData
        });
        
        if (hasData) {
          debugLog('FIND_EXAM', 'Found unfinished exam, navigating', examOrder[i].exam_string);
          router.push(`/exam/${examOrder[i].exam_string}`);
          return true;
        }
      }
      setLoading(false);
    }
    return false;
  }, [examOrder, exam_string, router]);

  const fetchQuestions = async () => {
    debugLog('FETCH_QUESTIONS', 'Starting to fetch questions', { exam_string });
    
    try {
      const currentExam = examOrder.find((exam) => exam.exam_string === exam_string);
      debugLog('FETCH_QUESTIONS', 'Current exam found', currentExam);
      
      if (currentExam && currentExam.exam_id) {
        setExamId(currentExam.exam_id);
      }
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/byExamString?exam_string=${exam_string}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      debugLog('FETCH_QUESTIONS', 'API response received', {
        status: response.status,
        hasEncryptedData: !!response.data?.encryptedData
      });

      const decryptedData = decryptData(response.data.encryptedData);
      const parsedData = JSON.parse(decryptedData);
      
      debugLog('FETCH_QUESTIONS', 'Data parsed successfully', {
        questionsCount: parsedData.questions?.length || 0,
        duration: parsedData.duration
      });
      
      if (examSession && !examSession.is_auto_move && new Date() < new Date(examSession.start_time)) {
        debugLog('FETCH_QUESTIONS', 'Exam not accessible yet', {
          examStartTime: examSession.start_time,
          currentTime: new Date().toISOString()
        });
        setExamStartTime(examSession.start_time);
        setShowNotAccessibleModal(true);
        setIsExamAccessible(false);
        return;
      }

      const examDurationInMinutes = parsedData.duration;
      setQuestions(parsedData.questions);
      setDuration(examDurationInMinutes);
      
      debugLog('FETCH_QUESTIONS', 'Questions and duration set', {
        questionsLength: parsedData.questions.length,
        duration: examDurationInMinutes
      });
      
      await loadExistingSession(currentExam?.exam_id);
      setLoading(false);
      setError(false);
      
      debugLog('FETCH_QUESTIONS', 'Fetch questions completed successfully');
    } catch (error) {
      debugLog('FETCH_QUESTIONS', 'Error fetching questions', error);
      setError(true);
      setLoading(false);
    }
  };

  const loadExistingSession = async (currentExamId?: number) => {
    const examIdToUse = currentExamId || examId;
    
    debugLog('LOAD_SESSION', 'Loading existing session', {
      examScheduleId,
      examIdToUse,
      currentExamId
    });
    
    if (!examScheduleId || !examIdToUse) {
      debugLog('LOAD_SESSION', 'Missing required IDs, skipping session load');
      return;
    }
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/examSession/active`,
        {
          params: {
            exam_schedule_id: examScheduleId,
            exam_id: examIdToUse
          },
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      debugLog('LOAD_SESSION', 'Session API response', {
        status: response.data.status,
        hasData: !!response.data.data
      });
        
      if (response.data.status === 'success' && response.data.data) {
        const sessionData = response.data.data;
        
        debugLog('LOAD_SESSION', 'Session data received', {
          name: sessionData.name,
          isAutoMove: sessionData.is_auto_move,
          startTime: sessionData.start_time,
          endTime: sessionData.end_time,
          answersCount: Object.keys(sessionData.answers || {}).length
        });
        
        setExamName(sessionData.name);
        
        if (!sessionData.is_auto_move && new Date() < new Date(sessionData.start_time)) {
          debugLog('LOAD_SESSION', 'Session not accessible yet');
          setExamStartTime(sessionData.start_time);
          setShowNotAccessibleModal(true);
          setIsExamAccessible(false);
          return;
        }
        
        setIsExamAccessible(true);
        
        setAnswers(sessionData.answers || {});
        await examDbService.saveAnswers(exam_string, sessionData.answers || {});
        
        if (sessionData.question_elapsed_times) {
          const examData = await examDbService.getExamData(exam_string) || { 
            answers: sessionData.answers || {}, 
            startTime: Date.now(),
            questionElapsedTimes: {},
            lastQuestionVisit: null
          };
          examData.questionElapsedTimes = sessionData.question_elapsed_times;
          const db = await examDbService.db;
          await db.put('examData', examData, exam_string);
        }
        
        const now = Date.now();
        const endTime = new Date(sessionData.end_time).getTime();
        const remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));
        
        debugLog('LOAD_SESSION', 'Time calculations', {
          now: new Date(now).toISOString(),
          endTime: new Date(endTime).toISOString(),
          remainingTime
        });
        
        setTimeLeft(remainingTime);
        lastTickRef.current = now;
        
        setExamSession(sessionData);
        
        if (remainingTime <= 0) {
          debugLog('LOAD_SESSION', 'Time expired, auto-submitting');
          setIsTimeExpired(true);
          handleSubmit(undefined, true);
        }
        
        return;
      }
    } catch (error) {
      debugLog('LOAD_SESSION', 'Error loading session, falling back to local data', error);
      
      const savedAnswers = await examDbService.getAnswers(exam_string);
      if (savedAnswers) {
        debugLog('LOAD_SESSION', 'Loaded answers from local storage', {
          answersCount: Object.keys(savedAnswers).length
        });
        setAnswers(savedAnswers);
      }
      
      if (duration > 0) {
        debugLog('LOAD_SESSION', 'Setting default time from duration', {
          duration,
          timeInSeconds: duration * 60
        });
        setTimeLeft(duration * 60);
        lastTickRef.current = Date.now();
      }
    }
  };

  const handleSubmit = useCallback((e?: React.FormEvent, skipConfirmation = false) => {
    debugLog('SUBMIT', 'Handle submit called', {
      hasEvent: !!e,
      skipConfirmation,
      isTimeExpired
    });
    
    if (e) e.preventDefault();
    
    if (isTimeExpired || skipConfirmation) {
      directSubmit();
    } else {
      setShowConfirmationModal(true);
    }
  }, [isTimeExpired]);

  const directSubmit = useCallback(() => {
    debugLog('DIRECT_SUBMIT', 'Direct submit called', {
      currentExamIndex,
      examOrderLength: examOrder.length
    });
    
    const nextExamIndex = currentExamIndex + 1;
    setNextExam(examOrder[nextExamIndex]?.name || null);
    setShowConfirmationModal(false);
    setShowModalNext(true);
  }, [currentExamIndex, examOrder]);

  const confirmSubmit = useCallback(() => {
    debugLog('CONFIRM_SUBMIT', 'Confirm submit called');
    setShowConfirmationModal(false);
    directSubmit();
  }, [directSubmit]);

  // Initialize exam
  useEffect(() => {
    const initializeExam = async () => {
      debugLog('INITIALIZE', 'Starting exam initialization');
      setIsInitializing(true);
      
      if (!exam_string) {
        debugLog('INITIALIZE', 'No exam string, finding latest unfinished');
        await findLatestUnfinishedExam();
      } else {
        debugLog('INITIALIZE', 'Exam string found, fetching questions');
        await fetchQuestions();
      }
      
      setIsInitializing(false);
      debugLog('INITIALIZE', 'Exam initialization completed');
    };
    
    initializeExam();
  }, []);

  // Re-initialize when exam_string changes
  useEffect(() => {
    if (exam_string && !isInitializing) {
      debugLog('REINITIALIZE', 'Reinitializing for new exam string', exam_string);
      
      setLoading(true);
      setQuestions([]);
      setDuration(0);
      setTimeLeft(0);
      setAnswers({});
      setError(false);
      setSubmitError(false);
      setCurrentQuestion(0);
      setShowModalNext(false);
      setShowConfirmationModal(false);
      setExamSession(null);
      setIsTimeExpired(false);
      
      const currentExam = examOrder.find((exam) => exam.exam_string === exam_string);
      
      if (currentExam && currentExam.exam_id) {
        setExamId(currentExam.exam_id);
      }
      
      fetchQuestions();
    }
  }, [exam_string, isInitializing]);

  // Error retry mechanism
  useEffect(() => {
    if (error && !isInitializing) {
      debugLog('ERROR_RETRY', 'Setting up retry timeout');
      const retryTimeout = setTimeout(() => {
        debugLog('ERROR_RETRY', 'Retrying fetch questions');
        fetchQuestions();
      }, 5000);
  
      return () => clearTimeout(retryTimeout);
    }
  }, [error, isInitializing]);

  // Main timer effect
  useEffect(() => {
    if (!loading && timeLeft > 0) {
      debugLog('TIMER_START', 'Starting main timer', { timeLeft });
      
      const updateTimer = () => {
        const now = Date.now();
        const deltaTime = Math.floor((now - lastTickRef.current) / 1000);
        
        if (deltaTime >= 1) {
          setTimeLeft(prevTime => {
            const newTime = Math.max(0, prevTime - deltaTime);
            if (newTime <= 0) {
              debugLog('TIMER_EXPIRED', 'Timer expired, auto-submitting');
              setIsTimeExpired(true);
              handleSubmit(undefined, true);
              return 0;
            }
            return newTime;
          });
          lastTickRef.current = now;
        }
      };

      timerRef.current = setInterval(updateTimer, 100);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [loading, timeLeft, handleSubmit]);

  // Auto-save effect
  useEffect(() => {
    if (!loading && timeLeft > 0 && timeLeft % 120 === 0) {
      debugLog('AUTO_SAVE', 'Setting up auto-save interval');
      
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
      
      autoSaveRef.current = setInterval(() => {
        if (Object.keys(answers).length > 0) {
          debugLog('AUTO_SAVE', 'Auto-saving answers');
          saveExamSession();
        }
      }, 1000);

      return () => {
        if (autoSaveRef.current) {
          clearInterval(autoSaveRef.current);
        }
      };
    }
  }, [loading, answers, timeLeft]);

  const saveExamSession = async () => {
    debugLog('SAVE_SESSION', 'Starting session save');
    setAutoSaving(true);
    
    try {
      const questionElapsedTimes = await examDbService.getQuestionElapsedTimes(exam_string);
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/examSession/save`,
        { 
          exam_schedule_id: examScheduleId,
          exam_id: examId,
          answers: answers,
          question_elapsed_times: questionElapsedTimes
        },
        { 
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      
      debugLog('SAVE_SESSION', 'Session saved successfully');
      setAutoSaving(false);
      setShowCheckpointToast(true);
      return true;
    } catch (error) {
      debugLog('SAVE_SESSION', 'Error saving session', error);
      setAutoSaving(false);
      return false;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleChange = async (id: number, value: any) => {
    debugLog('ANSWER_CHANGE', 'Answer changed', { questionId: id, value });
    
    const updatedAnswers = {
      ...answers,
      [id]: value
    };
    setAnswers(updatedAnswers);
    await examDbService.saveAnswers(exam_string, updatedAnswers);
  };

  const handleTrueFalseChange = async (id: number, index: number, value: any) => {
    debugLog('TRUE_FALSE_CHANGE', 'True/false answer changed', { questionId: id, index, value });
    
    const updatedAnswers = [...(answers[id] || [])];
    updatedAnswers[index] = value;
    const newAnswers = {
      ...answers,
      [id]: updatedAnswers
    };
    setAnswers(newAnswers);
    await examDbService.saveAnswers(exam_string, newAnswers);
  };

  const isAnswerFilled = (answer: any): boolean => {
    if (answer === undefined || answer === null || answer === '') {
      return false;
    }
    
    if (Array.isArray(answer)) {
      return answer.some(value => value !== undefined && value !== null && value !== '');
    }
    
    return true;
  };

  const getFilledAnswersCount = (): number => {
    return Object.values(answers).filter(answer => isAnswerFilled(answer)).length;
  };

  const handleNextExam = async () => {
    debugLog('NEXT_EXAM', 'Handle next exam', { nextExam });
    
    const shouldScore = !nextExam;
    const success = await submitToServer(shouldScore);
    
    if (success) {
      if (nextExam) {
        const nextExamString = examOrder[currentExamIndex + 1].exam_string;
        setShowModalNext(false);
        
        setCurrentQuestion(0);
        setQuestions([]);
        setAnswers({});
        setExamSession(null);
        
        router.push(`/exam/${nextExamString}`);
      } else {
        clearExamData();
        router.push(originPath || '/');
      }
    }
  };

  const handleRetrySubmit = () => {
    debugLog('RETRY_SUBMIT', 'Retrying submit');
    handleNextExam();
  };

  const handleNavigation = async (index: number) => {
    debugLog('NAVIGATION', 'Navigating to question', { 
      from: currentQuestion, 
      to: index 
    });
    
    if (exam_string) {
      await examDbService.updateQuestionElapsedTime(exam_string, questions[currentQuestion].id);
    }
    
    setCurrentQuestion(index);
  };

  const isAnswered = (id: number) => {
    return answers[id] !== undefined && isAnswerFilled(answers[id]);
  };

  const submitToServer = async (shouldScore = false): Promise<boolean> => {
    debugLog('SUBMIT_SERVER', 'Submitting to server', { shouldScore });
    
    setSubmitLoading(true);
    setSubmitError(false);
    
    try {
      const finalElapsedTimes = await examDbService.finalizeCurrentQuestionTime(exam_string);
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/examSession/submit`,
        { 
          exam_schedule_id: examScheduleId,
          exam_id: examId,
          answers: answers,
          question_elapsed_times: finalElapsedTimes
        },
        { 
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (!nextExam && selectedTopicId){
        debugLog('SUBMIT_SERVER', 'Submitting user course completion', { selectedTopicId });
        
        try{
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/userCourse/`,{
              topic_id : selectedTopicId,
              quiz_id: examScheduleId
            },
            { 
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`
              }
            }
          )
        }catch(error){
          debugLog('SUBMIT_SERVER', 'Error submitting user course', error);
        }
      }
      
      if (shouldScore && !nextExam) {
        debugLog('SUBMIT_SERVER', 'Submitting for scoring');
        
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/score/schedule/${examScheduleId}`,
            {},
            { 
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
              }
            }
          );
        } catch (scoreError) {
          debugLog('SUBMIT_SERVER', 'Error submitting for scoring', scoreError);
        }
      }
  
      await examDbService.deleteExamData(exam_string);
      setSubmitLoading(false);
      debugLog('SUBMIT_SERVER', 'Submit to server completed successfully');
      return true;
    } catch (error) {
      debugLog('SUBMIT_SERVER', 'Error submitting to server', error);
      setSubmitLoading(false);
      setSubmitError(true);
      return false;
    }
  };

  const renderQuestion = (q: Question) => {
    debugLog('RENDER_QUESTION', 'Rendering question', { id: q.id, type: q.type });
    
    switch (q.type) {
      case 'single-choice':
        return (
          <div className="single-choice-container">
            <SingleChoice 
              question={<Latex>{q.question}</Latex>} 
              options={q.options} 
              onChange={(value) => handleChange(q.id, value)} 
              selectedAnswers={answers[q.id] || []} 
            />
          </div>
        );
      
      case 'multiple-choice':
        return (
          <div className="multiple-choice-container">
            <MultipleChoice 
              question={q.question} 
              options={q.options || []} 
              selectedAnswers={answers[q.id] || []} 
              onChange={(value) => handleChange(q.id, value)} 
            />
          </div>
        );
        
      case 'number':
        return (
          <div className="number-input-container">
            <NumberInput 
              question={q.question} 
              onChange={(value) => handleChange(q.id, value)}
              value={answers[q.id]} 
            />
          </div>
        );
        
      case 'text':
        return (
          <div className="text-input-container">
            <TextInput 
              question={q.question} 
              onChange={(value) => handleChange(q.id, value)}
              value={answers[q.id]} 
            />
          </div>
        );
        
      case 'true-false':
        return (
          <div className="true-false-container">
            <TrueFalse 
              question={q.question} 
              statements={q.statements || []} 
              selectedAnswers={answers[q.id] || []} 
              onChange={(index, value) => handleTrueFalseChange(q.id, index, value)} 
            />
          </div>
        );
        
      default:
        debugLog('RENDER_QUESTION', 'Unknown question type', q.type);
        return null;
    }
  };

  const handleClose = async () => {
    debugLog('CLOSE', 'Handling close');
    
    const shouldScore = !nextExam;
    const success = await submitToServer(shouldScore);
    if (success) {
      clearExamData();
      router.push(originPath || '/');
    }
  };

  const handleRetryAccess = async () => {
    debugLog('RETRY_ACCESS', 'Retrying exam access');
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/examSession/active`,
        {
          params: {
            exam_schedule_id: examScheduleId,
            exam_id: examId
          },
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      
      if (response.data.status === 'success' && response.data.data) {
        const sessionData = response.data.data;
        
        if (!sessionData.is_auto_move && new Date() >= new Date(sessionData.start_time)) {
          debugLog('RETRY_ACCESS', 'Access granted, fetching questions');
          setShowNotAccessibleModal(false);
          setIsExamAccessible(true);
          fetchQuestions();
        } else {
          debugLog('RETRY_ACCESS', 'Still not accessible');
          setExamStartTime(sessionData.start_time);
          setIsExamAccessible(false);
        }
      }
    } catch (error) {
      debugLog('RETRY_ACCESS', 'Error checking exam accessibility', error);
      if (examStartTime && new Date() >= new Date(examStartTime)) {
        setIsExamAccessible(true);
        setShowNotAccessibleModal(false);
        fetchQuestions();
      }
    }
  };

  // Loading state
  if (loading) {
    debugLog('RENDER', 'Rendering loading state');
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">Loading Exam...</h2>
          <p className="tw-text-violet-600 tw-mt-2">Please wait while we prepare your questions</p>
          <div className="tw-mt-4 tw-text-sm tw-text-gray-500">
            <p>Debug Info:</p>
            <p>Exam String: {exam_string || 'None'}</p>
            <p>Questions: {questions.length}</p>
            <p>Duration: {duration}</p>
            <p>Time Left: {timeLeft}</p>
            <p>Exam ID: {examId || 'None'}</p>
            <p>Schedule ID: {examScheduleId || 'None'}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Not accessible state
  if (!isExamAccessible) {
    debugLog('RENDER', 'Rendering not accessible state');
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <Clock className="tw-h-12 tw-w-12 tw-text-violet-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">Exam Not Available Yet</h2>
          <p className="tw-text-violet-600 tw-mt-2">Please wait until the scheduled start time</p>
          
          {examStartTime && (
            <div className="tw-mt-4">
              <p className="tw-text-violet-600">Available in:</p>
              <div className="tw-text-3xl tw-font-mono tw-font-bold tw-text-violet-700 tw-mt-2">
                {countdown}
              </div>
              <p className="tw-text-sm tw-text-violet-500 tw-mt-2">
                Scheduled at: {new Date(examStartTime).toLocaleString()}
              </p>
            </div>
          )}
          
          <Button 
            variant="primary" 
            className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-mt-4"
            onClick={handleRetryAccess}
          >
            Check Again
          </Button>
        </div>
      </div>
    );
  }

  debugLog('RENDER', 'Rendering main exam interface', {
    questionsLength: questions.length,
    currentQuestion,
    timeLeft,
    answersCount: Object.keys(answers).length
  });

  return (
    <div className="tw-min-h-screen tw-bg-violet-50">
      <div className="tw-bg-violet-600 tw-text-white tw-py-4 tw-shadow-lg tw-mb-6">
        <Container>
          <div className="tw-flex tw-justify-between tw-items-center">
            <div className="tw-flex-1 tw-min-w-0">
              <h1 className="tw-text-2xl tw-font-bold tw-mb-1 tw-break-words tw-pr-4">
                {examName || 'Loading...'}
              </h1>
              {examSession && (
                <p className="tw-text-sm tw-text-violet-200">
                  End time: {new Date(examSession.end_time).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="tw-flex tw-items-center tw-gap-3 tw-bg-violet-700 tw-rounded-lg tw-px-6 tw-py-3 tw-flex-shrink-0">
              <Clock size={28} className="tw-text-violet-200" />
              <div className="tw-flex tw-flex-col tw-items-start">
                <span className="tw-text-violet-200 tw-text-sm">Time Remaining</span>
                <span className="tw-text-3xl tw-font-mono tw-font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <div 
        className="tw-fixed tw-top-4 tw-right-4 tw-z-50"
        style={{ display: showCheckpointToast ? 'block' : 'none' }}
      >
        <Toast 
          onClose={() => setShowCheckpointToast(false)} 
          show={showCheckpointToast} 
          delay={3000} 
          autohide
          className="tw-bg-violet-100 tw-border-violet-300 tw-border"
        >
          <Toast.Header className="tw-bg-violet-200 tw-text-violet-800">
            <Check className="tw-mr-2 tw-text-violet-600" size={16} />
            <strong className="tw-mr-auto">Checkpoint Saved</strong>
          </Toast.Header>
          <Toast.Body className="tw-text-violet-700">
            Your answers have been saved to the server.
          </Toast.Body>
        </Toast>
      </div>

      <Container className="tw-mb-8">
        <Row>
          <Col lg={8} className="tw-mb-4">
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
                {questions.length > 0 ? (
                  <>
                    <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
                      <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">
                        Question {currentQuestion + 1} of {questions.length}
                      </h2>
                      {autoSaving && (
                        <div className="tw-flex tw-items-center tw-text-violet-600">
                          <Loader2 className="tw-h-4 tw-w-4 tw-animate-spin tw-mr-2" />
                          <span className="tw-text-sm">Saving...</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="tw-mb-6">
                      {renderQuestion(questions[currentQuestion])}
                    </div>

                    <div className="tw-flex tw-justify-between tw-mt-8">
                      <Button
                        variant="outline-secondary"
                        className="tw-border-2 tw-border-violet-200 tw-text-violet-700 hover:tw-bg-violet-50"
                        disabled={currentQuestion === 0}
                        onClick={() => handleNavigation(currentQuestion - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700"
                        disabled={currentQuestion === questions.length - 1}
                        onClick={() => handleNavigation(currentQuestion + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="tw-text-center tw-py-8">
                    <p className="tw-text-gray-500">No questions available</p>
                    <div className="tw-mt-4 tw-text-sm tw-text-gray-400">
                      <p>Debug: Questions array length: {questions.length}</p>
                      <p>Loading state: {loading.toString()}</p>
                      <p>Error state: {error.toString()}</p>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="tw-hidden md:tw-block">
            <Card className="tw-shadow-md tw-border-0 tw-rounded-xl tw-sticky tw-top-4">
              <Card.Body className="tw-p-4">
                <h3 className="tw-text-lg tw-font-semibold tw-text-violet-800 tw-mb-4">Question Navigator</h3>
                {questions.length > 0 ? (
                  <>
                    <div className="tw-grid tw-grid-cols-5 tw-gap-2 tw-mb-6">
                      {questions.map((q, index) => (
                        <Button
                          key={q.id}
                          variant={currentQuestion === index ? "primary" : "outline-secondary"}
                          className={`tw-w-10 tw-h-10 tw-rounded-lg tw-flex tw-items-center tw-justify-center 
                            ${currentQuestion === index 
                              ? 'tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700' 
                              : 'tw-border-2 tw-border-violet-200 tw-text-violet-700 hover:tw-bg-violet-50'}
                            ${isAnswered(q.id) ? 'tw-bg-violet-200' : ''}`}
                          onClick={() => handleNavigation(index)}
                        >
                          {index + 1}
                        </Button>
                      ))}
                    </div>

                    <div className="tw-mb-4">
                      <div className="tw-flex tw-justify-between tw-text-sm tw-text-gray-600 tw-mb-2">
                        <span>Progress</span>
                        <span>{getFilledAnswersCount()}/{questions.length} Questions</span>
                      </div>
                      <ProgressBar 
                        now={(getFilledAnswersCount() / questions.length) * 100} 
                        className="tw-h-2 tw-bg-violet-100"
                      >
                        <ProgressBar 
                          now={(getFilledAnswersCount()/ questions.length) * 100} 
                          className="tw-bg-violet-600"
                        />
                      </ProgressBar>
                    </div>

                    {currentQuestion === questions.length - 1 && (
                      <Button 
                        variant="primary" 
                        className="tw-w-full tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-mt-4"
                        onClick={handleSubmit}
                      >
                        Submit Exam
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="tw-text-center tw-text-gray-500">
                    <p>No questions loaded</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Mobile bottom navigation */}
      <div className="tw-block md:tw-hidden tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-bg-white tw-shadow-lg tw-border-t tw-border-gray-200 tw-z-50">
        <div className="tw-p-4">
          {questions.length > 0 ? (
            <>
              <div className="tw-mb-3">
                <div className="tw-flex tw-justify-between tw-text-sm tw-text-gray-600 tw-mb-2">
                  <span>Progress</span>
                  <span>{getFilledAnswersCount()}/{questions.length} Questions</span>
                </div>
                <ProgressBar 
                  now={(getFilledAnswersCount() / questions.length) * 100} 
                  className="tw-h-2 tw-bg-violet-100"
                >
                  <ProgressBar 
                    now={(getFilledAnswersCount() / questions.length) * 100} 
                    className="tw-bg-violet-600"
                  />
                </ProgressBar>
              </div>
              
              <div className="tw-overflow-x-auto tw-pb-2">
                <div className="tw-flex tw-gap-2 tw-min-w-max">
                  {questions.map((q, index) => (
                    <Button
                      key={q.id}
                      variant={currentQuestion === index ? "primary" : "outline-secondary"}
                      className={`tw-w-10 tw-h-10 tw-rounded-lg tw-flex-shrink-0 tw-flex tw-items-center tw-justify-center 
                        ${currentQuestion === index 
                          ? 'tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700' 
                          : 'tw-border-2 tw-border-violet-200 tw-text-violet-700 hover:tw-bg-violet-50'}
                        ${isAnswered(q.id) ? 'tw-bg-violet-200' : ''}`}
                      onClick={() => handleNavigation(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </div>

              {currentQuestion === questions.length - 1 && (
                <Button 
                  variant="primary" 
                  className="tw-w-full tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-mt-4"
                  onClick={handleSubmit}
                >
                  Submit Exam
                </Button>
              )}
            </>
          ) : (
            <div className="tw-text-center tw-text-gray-500">
              <p>No questions available</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal 
        show={showConfirmationModal} 
        onHide={() => setShowConfirmationModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Header className="tw-bg-violet-50">
          <Modal.Title className="tw-text-violet-800 tw-flex tw-items-center">
            <AlertCircle className="tw-mr-2 tw-text-violet-600" size={20} />
            Confirm Submission
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="tw-p-2">
            <p className="tw-text-lg tw-font-medium tw-mb-3 tw-text-violet-900">Are you sure you want to end this exam?</p>
            
            <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
              <div className="tw-flex tw-items-center tw-mb-2">
                <FileCheck className="tw-text-violet-600 tw-mr-2" size={18} />
                <span className="tw-font-medium tw-text-violet-800">Exam Summary</span>
              </div>
              <p className="tw-text-violet-700 tw-mb-2">
                <span className="tw-font-medium">Completed:</span> {getFilledAnswersCount()} of {questions.length} questions
              </p>
              {getFilledAnswersCount() < questions.length && (
                <div className="tw-bg-amber-50 tw-p-2 tw-rounded tw-border tw-border-amber-200 tw-text-amber-800 tw-text-sm">
                  Warning: You have {questions.length - getFilledAnswersCount()} unanswered questions.
                </div>
              )}
            </div>
            
            <p className="tw-text-gray-600 tw-text-sm">
              Once submitted, you won't be able to change your answers for this section.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowConfirmationModal(false)}
            className="tw-border-2 tw-border-violet-200 tw-text-violet-700 hover:tw-bg-violet-50"
          >
            Continue Exam
          </Button>
          <Button 
            variant="primary" 
            onClick={confirmSubmit}
            className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center"
          >
            <ArrowRight className="tw-mr-1" size={16} /> End Exam
          </Button>
        </Modal.Footer>
      </Modal>
    
      {/* Next Exam Modal */}
      <Modal 
        show={showModalNext} 
        onHide={() => {}}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header className="tw-bg-violet-50">
          <Modal.Title className="tw-text-violet-800">
            {submitLoading ? (
              <div className="tw-flex tw-items-center">
                <Loader2 className="tw-h-5 tw-w-5 tw-animate-spin tw-mr-2 tw-text-violet-600" />
                Menyimpan Jawaban...
              </div>
            ) : isTimeExpired ? (
              "Waktu Telah Habis"
            ) : nextExam ? "Lanjut ke Ujian Berikutnya?" : "Selesai"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitLoading ? (
            <div className="tw-text-center tw-py-4">
              <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
              <p className="tw-text-lg tw-font-medium">Sedang menyimpan jawaban...</p>
              <p className="tw-text-gray-600">Mohon tunggu sebentar</p>
            </div>
          ) : submitError ? (
            <div className="tw-py-2">
              <Alert variant="danger" className="tw-mb-4">
                <p className="tw-font-bold tw-mb-2">Gagal menyimpan jawaban</p>
                <p>Jangan khawatir, soal selanjutnya akan dimulai setelah selesai mengirim jawaban kamu saat ini.</p>
              </Alert>
              <p>Silakan coba kirim ulang jawaban.</p>
            </div>
          ) : isTimeExpired ? (
            <div className="tw-p-2 tw-text-center">
              <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
                <Clock className="tw-h-16 tw-w-16 tw-text-violet-600 tw-mx-auto tw-mb-2" />
                <p className="tw-text-xl tw-font-medium tw-text-violet-800 tw-mb-2">Waktu ujian telah habis!</p>
                <p className="tw-text-violet-700">
                  Jawaban Anda akan diproses secara otomatis.
                </p>
              </div>
              <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
                <div className="tw-flex tw-items-center tw-mb-2">
                  <FileCheck className="tw-text-violet-600 tw-mr-2" size={18} />
                  <span className="tw-font-medium tw-text-violet-800">Ringkasan Ujian</span>
                </div>
                <p className="tw-text-violet-700 tw-mb-2">
                  <span className="tw-font-medium">Terjawab:</span> {getFilledAnswersCount()} dari {questions.length} pertanyaan
                </p>
              </div>
            </div>
          ) : nextExam ? (
            <div className="tw-p-2">
              <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4 tw-text-center">
                <FileCheck className="tw-h-12 tw-w-12 tw-text-violet-600 tw-mx-auto tw-mb-2" />
                <p className="tw-text-lg tw-font-medium tw-text-violet-800 tw-mb-2">Bagian ini telah selesai!</p>
                <p className="tw-text-violet-700">
                  Kamu akan melanjutkan ke <span className="tw-font-semibold">{nextExam}</span>.
                </p>
              </div>
              <p className="tw-text-center tw-text-gray-600">Apakah kamu siap untuk melanjutkan?</p>
            </div>
          ) : (
            <div className="tw-p-2 tw-text-center">
              <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
                <Check className="tw-h-16 tw-w-16 tw-text-violet-600 tw-mx-auto tw-mb-2" />
                <p className="tw-text-xl tw-font-medium tw-text-violet-800 tw-mb-2">Selamat!</p>
                <p className="tw-text-violet-700">
                  Kamu telah menyelesaikan semua ujian dengan baik.
                </p>
              </div>
              <p className="tw-text-gray-600">Terima kasih atas partisipasimu!</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {submitLoading ? null : (
            <>
              {submitError ? (
                <Button 
                  variant="primary" 
                  className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700"
                  onClick={handleRetrySubmit}
                >
                  Kirim Ulang
                </Button>
              ) : (
                <>
                  <Button 
                    variant="secondary" 
                    onClick={handleClose}
                  >
                    Kembali ke Home
                  </Button>
                  {nextExam && !isTimeExpired && (
                    <Button 
                      variant="primary" 
                      className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center"
                      onClick={handleNextExam}
                    >
                      Lanjut <ArrowRight className="tw-ml-1" size={16} />
                    </Button>
                  )}
                  {isTimeExpired && nextExam && (
                    <Button 
                      variant="primary" 
                      className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center"
                      onClick={handleNextExam}
                    >
                      Lanjut ke Ujian Berikutnya <ArrowRight className="tw-ml-1" size={16} />
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChainExam;