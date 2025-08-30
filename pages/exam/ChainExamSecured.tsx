// ChainExam Component - Complete Implementation with Fixed Timer System
'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import CryptoJS from 'crypto-js';
import ChangeTabPrevention from '../../components/ChangeTabPrevention';

// FIXED TIMER SYSTEM IMPORTS
import { useGlobalTimer } from '../../hooks/useGlobalTimer';
import { useQuestionTimer } from '../../hooks/useQuestionTimer';
import { useExamAutosave } from '../../hooks/useExamAutosave';
import enhancedExamDBService from '../../utils/EnhancedExamDBService';

// Keep existing context imports for compatibility
import { useExam } from '../../context/ExamContext';
import { useAuth } from '../../context/AuthContext';

// Import hidden timer contexts for backward compatibility
import { UserPurchaseProvider, useUserPurchase } from '../../context/UserPurchaseContext';
import { ActiveUserProvider, useActiveUser } from '../../context/ActiveUserContext';
import { AllProductProvider, useAllProduct } from '../../context/AllProductContext';

const SingleChoice = dynamic(() => import('./SingleChoice'), { ssr: false });
const MultipleChoice = dynamic(() => import('./MultipleChoice'), { ssr: false });
const NumberInput = dynamic(() => import('./NumberInput'), { ssr: false });
const TextInput = dynamic(() => import('./TextInput'), { ssr: false });
const TrueFalse = dynamic(() => import('./TrueFalse'), { ssr: false });

const BlockMath = dynamic(() => import('react-katex').then(mod => ({ default: mod.BlockMath })), { ssr: false });
const InlineMath = dynamic(() => import('react-katex').then(mod => ({ default: mod.InlineMath })), { ssr: false });
const Latex = dynamic(() => import('react-latex-next'), { ssr: false });

import { Container, Row, Col, ProgressBar, Card, Button, Modal, Alert, Toast, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Clock, Loader2, Check, AlertCircle, FileCheck, ArrowRight, Eye, EyeOff, Shield, ShieldAlert, Activity, Wifi, WifiOff, Home, Save } from 'lucide-react';

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

// Optimized Focus Detection Component
const FocusDetector: React.FC<{
  onAutoSubmit: (reason: string) => void;
  enabled: boolean;
  timerRunning: boolean;
}> = React.memo(({ onAutoSubmit, enabled, timerRunning }) => {
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFocusTime = useRef<number>(Date.now());
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [focusWarningTime, setFocusWarningTime] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    if (!enabled || !timerRunning) return;
    
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsPageVisible(isVisible);
      
      if (isVisible) {
        lastFocusTime.current = Date.now();
        setFocusWarningTime(0);
        setShowWarning(false);
        
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
          focusTimeoutRef.current = null;
        }
      } else {
        setShowWarning(true);
        
        let countdown = 15;
        setFocusWarningTime(countdown);
        
        const countdownInterval = setInterval(() => {
          countdown -= 1;
          setFocusWarningTime(countdown);
          
          if (countdown <= 0) {
            clearInterval(countdownInterval);
            setShowWarning(false);
          }
        }, 1000);
        
        focusTimeoutRef.current = setTimeout(() => {
          clearInterval(countdownInterval);
          setShowWarning(false);
          onAutoSubmit('focus_lost');
        }, 15000);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, [enabled, timerRunning, onAutoSubmit]);
  
  if (!enabled || !timerRunning || isPageVisible || focusWarningTime <= 0 || !showWarning) {
    return null;
  }
  
  return (
    <div className="tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-bg-red-600 tw-text-white tw-p-4 tw-text-center tw-z-50 tw-shadow-lg tw-animate-pulse">
      <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
        <EyeOff className="tw-h-5 tw-w-5" />
        <span className="tw-font-bold">
          WARNING: Return to exam page! Auto-submit in {focusWarningTime} seconds
        </span>
        <EyeOff className="tw-h-5 tw-w-5" />
      </div>
    </div>
  );
});

FocusDetector.displayName = 'FocusDetector';

// Main Exam Component
const ExamContent: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  
  // All hooks at TOP LEVEL - no conditional hooks
  const params = useParams();
  const router = useRouter();
  
  // Context hooks at top level for backward compatibility
  const examContext = useExam();
  const authContext = useAuth();
  
  // Keep compatibility contexts
  const userPurchase = useUserPurchase();
  const activeUser = useActiveUser();
  const allProduct = useAllProduct();
  
  // FIXED: Memoize the exam_string to prevent re-initialization loops
  const exam_string = useMemo(() => params?.exam_string as string, [params?.exam_string]);

  // FIXED: Stable examId for timer initialization
  const examId = useMemo(() => exam_string || 'default', [exam_string]);

  // Exam data state - keeping original structure
  const [examIdNum, setExamIdNum] = useState<number | null>(null);
  const [examScheduleId, setExamScheduleId] = useState<string | null>(null);
  const [examName, setExamName] = useState<string | null>(null);
  const [examType, setExamType] = useState<string>('Try-Out');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [showModalNext, setShowModalNext] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [nextExam, setNextExam] = useState<string | null>(null);
  const [showCheckpointToast, setShowCheckpointToast] = useState<boolean>(false);
  const [autoSaving, setAutoSaving] = useState<boolean>(false);
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [isExamAccessible, setIsExamAccessible] = useState<boolean>(true);
  const [showNotAccessibleModal, setShowNotAccessibleModal] = useState(false);
  const [examStartTime, setExamStartTime] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number|null>(null);
  const [originPath, setOriginPath] = useState<string>('/');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enhanced loading control states with proper fetch tracking
  const [questionsReady, setQuestionsReady] = useState(false);
  const [accessCheckComplete, setAccessCheckComplete] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);

  // Fixed submission states
  const [isLastExam, setIsLastExam] = useState(false);
  const [finalSubmitSuccess, setFinalSubmitSuccess] = useState(false);
  const [showFinalCompletionModal, setShowFinalCompletionModal] = useState(false);

  // FIXED: Single fetch tracking with stable structure
  const fetchStateRef = useRef<{
    currentExamString: string | null;
    isFetching: boolean;
    hasFetched: boolean;
    lastSuccessfulFetch: string | null;
  }>({
    currentExamString: null,
    isFetching: false,
    hasFetched: false,
    lastSuccessfulFetch: null
  });

  const submissionInProgress = useRef<boolean>(false);

  // Get context data safely with proper checks
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
  } = examContext || {
    topicId: null,
    examScheduleId: null,
    examOrder: [],
    examSessions: [],
    activeSession: null,
    selectedSchedule: null,
    examType: 'Try-Out',
    originPath: '/',
    clearExamData: () => {}
  };

  // Safe username extraction
  const { username, id: userId } = authContext || { username: null, id: null };

  // Stable exam order
  const examOrder = useMemo(() => contextExamOrder || [], [contextExamOrder]);
  const currentExamIndex = useMemo(() => 
    examOrder.findIndex((exam: ExamOrder) => exam.exam_string === exam_string),
    [examOrder, exam_string]
  );

  // Check if this is the last exam
  useEffect(() => {
    const isLast = currentExamIndex === examOrder.length - 1;
    setIsLastExam(isLast);
  }, [currentExamIndex, examOrder.length]);

  // FIXED: Enhanced auto-submit handler with proper final exam handling
  const handleAutoSubmit = useCallback(async (reason = 'time_expired') => {
    if (submissionInProgress.current) return;
    
    submissionInProgress.current = true;
    setIsTimeExpired(true);
    setIsSubmitting(true);
    
    console.log('Auto-submit triggered:', reason);
    
    // Stop the global timer
    globalTimer.stopTimer();
    
    // Always submit to server, but handle scoring based on exam position
    const shouldScore = isLastExam && !nextExam;
    
    const success = await submitToServer(shouldScore);
    
    if (success) {
      // Clear exam data
      await enhancedExamDBService.deleteExamData(exam_string);
      
      // Handle final exam completion vs next exam
      if (isLastExam) {
        setFinalSubmitSuccess(true);
        setShowFinalCompletionModal(true);
      } else {
        // Determine next action for non-final exams
        const nextExamIndex = currentExamIndex + 1;
        const hasNextExam = nextExamIndex < examOrder.length;
        
        if (hasNextExam) {
          setNextExam(examOrder[nextExamIndex]?.name || null);
          setShowModalNext(true);
        } else {
          // Fallback: no more exams, go back to home
          if (clearExamData) clearExamData();
          router.push(originPath || '/try-out');
        }
      }
    } else {
      setSubmitError(true);
      if (isLastExam) {
        setShowFinalCompletionModal(true);
      } else {
        setShowModalNext(true);
      }
    }
    
    setIsSubmitting(false);
    submissionInProgress.current = false;
  }, [isLastExam, nextExam, currentExamIndex, examOrder, clearExamData, router, originPath, exam_string]);

  // FIXED: NEW TIMER SYSTEM INITIALIZATION with stable examId
  const globalTimer = useGlobalTimer({
    examId: examId, // Use memoized examId
    onTimeout: () => handleAutoSubmit('timeout'),
    syncInterval: 120000 // 2 minutes server sync
  });

  // Question timer for per-question analytics
  const questionTimer = useQuestionTimer({
    currentQuestionId: questions[currentQuestion]?.id || null,
    isExamRunning: globalTimer.isRunning,
    onQuestionTimeUpdate: (data) => {
      console.log('Question time updated:', data);
    }
  });

  // Autosave system for answers and question times
  const autosave = useExamAutosave({
    examScheduleId: examScheduleId || '',
    examId: examIdNum || 0,
    answers,
    questionTimes: questionTimer.getAllQuestionTimes(),
    interval: 120000, // 2 minutes
    enabled: !loading && !error && globalTimer.isRunning && questionsReady
  });

  // Show autosave notifications
  useEffect(() => {
    if (autosave.lastSaveTime > 0 && Date.now() - autosave.lastSaveTime < 5000) {
      setShowCheckpointToast(true);
      setTimeout(() => setShowCheckpointToast(false), 3000);
    }
  }, [autosave.lastSaveTime]);

  // FIXED: Enhanced exam string change handler with proper state reset
  useEffect(() => {
    if (exam_string !== fetchStateRef.current.currentExamString) {
      console.log('Exam string changed, resetting state:', {
        from: fetchStateRef.current.currentExamString,
        to: exam_string
      });
      
      // Stop current timer
      globalTimer.stopTimer();
      
      // Reset fetch state
      fetchStateRef.current = {
        currentExamString: exam_string,
        isFetching: false,
        hasFetched: false,
        lastSuccessfulFetch: null
      };
      
      // Enhanced state reset for exam change
      setLoading(true);
      setError(false);
      setSubmitError(false);
      setQuestions([]);
      setAnswers({});
      setCurrentQuestion(0);
      setExamSession(null);
      setIsTimeExpired(false);
      setExamName(null);
      setDuration(0);
      setQuestionsReady(false);
      setAccessCheckComplete(false);
      setInitializationComplete(false);
      
      // Reset access check states
      setIsExamAccessible(true);
      setShowNotAccessibleModal(false);
      setExamStartTime(null);
      setCountdown("");
      
      // Reset initialization flags
      submissionInProgress.current = false;
    }
  }, [exam_string, globalTimer]);

  // Stable client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // FIXED: Stable context data sync with immediate synchronization
  useEffect(() => {
    if (!examContext) return;
    
    if (contextOriginPath) {
      setOriginPath(contextOriginPath);
    }
    
    if (contextTopicId) {
      setSelectedTopicId(contextTopicId);
    }
    
    if (contextExamType) {
      setExamType(contextExamType);
    }
    
    if (contextExamScheduleId) {
      const scheduleIdStr = contextExamScheduleId.toString();
      setExamScheduleId(scheduleIdStr);
    }
    
    if (contextActiveSession) {
      setExamSession(contextActiveSession);
    }
    
    if (examOrder.length > 0 && exam_string) {
      const currentExam = examOrder.find(exam => exam.exam_string === exam_string);
      
      if (currentExam && currentExam.exam_id) {
        setExamIdNum(currentExam.exam_id);
        setExamName(currentExam.name);
        setExamType(currentExam.examType);
      }
    }
  }, [
    examContext,
    contextOriginPath, 
    contextTopicId, 
    contextExamType, 
    contextExamScheduleId, 
    contextActiveSession, 
    examOrder, 
    exam_string
  ]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Stop global timer
      globalTimer.stopTimer();
      
      // Finalize current question time if needed
      if (exam_string && questions.length > 0) {
        const currentQuestionId = questions[currentQuestion]?.id;
        if (currentQuestionId) {
          // The question timer will handle this automatically
        }
      }
    };
  }, [exam_string, questions.length, currentQuestion, globalTimer]);

  // Decryption function - keeping original
  const decryptData = (encryptedData: string) => {
    try {
      const [ivHex, encrypted] = encryptedData.split(':');
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const encryptionKeyString = process.env.NEXT_PUBLIC_EXAM_ENCRYPTION_KEY;
      
      if (!encryptionKeyString) {
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
      
      return result;
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  };

  // FIXED: Enhanced loadExistingSession - adapted for new timer system
  const loadExistingSession = useCallback(async (currentExamId: number, expectedExamString: string) => {
    if (!isClient || !examScheduleId || !currentExamId) {
      return false;
    }

    if (expectedExamString !== exam_string) {
      return false;
    }
    
    try {
      const axios = (await import('axios')).default;
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/examSession/active`,
        {
          params: {
            exam_schedule_id: examScheduleId,
            exam_id: currentExamId
          },
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
        
      if (expectedExamString !== exam_string) {
        return false;
      }
        
      if (response.data.status === 'success' && response.data.data) {
        const sessionData = response.data.data;
        
        setExamName(sessionData.name);
        
        // Check exam accessibility FIRST
        const serverNow = Date.now(); // Using local time for now
        const sessionStartTime = new Date(sessionData.start_time).getTime();
        
        if (!sessionData.is_auto_move && serverNow < sessionStartTime) {
          setExamStartTime(sessionData.start_time);
          setIsExamAccessible(false);
          setAccessCheckComplete(true);
          setShowNotAccessibleModal(true);
          setLoading(false);
          
          return false;
        }
        
        setIsExamAccessible(true);
        setAccessCheckComplete(true);
        
        // Set answers
        setAnswers(sessionData.answers || {});
        await enhancedExamDBService.saveAnswers(expectedExamString, sessionData.answers || {});
        
        // Handle question elapsed times
        if (sessionData.question_elapsed_times) {
          await enhancedExamDBService.saveQuestionTimes(expectedExamString, sessionData.question_elapsed_times);
        }
        
        // Calculate remaining time and start timer
        const endTime = new Date(sessionData.end_time).getTime();
        const remainingTime = Math.max(0, Math.floor((endTime - serverNow) / 1000));
        
        if (remainingTime > 0) {
          // Start global timer with remaining time
          globalTimer.startTimer(remainingTime);
        } else {
          setIsTimeExpired(true);
          handleAutoSubmit('session_expired');
        }
        
        setExamSession(sessionData);
        return true;
        
      } else {
        setAccessCheckComplete(true);
        return false;
      }
    } catch (error) {
      setAccessCheckComplete(true);
      
      // Fallback: load saved answers
      if (expectedExamString === exam_string) {
        try {
          const savedAnswers = await enhancedExamDBService.getAnswers(expectedExamString);
          if (savedAnswers) {
            setAnswers(savedAnswers);
          }
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
        }
      }
      
      return false;
    }
  }, [
    isClient, 
    examScheduleId, 
    exam_string,
    globalTimer,
    handleAutoSubmit
  ]);

  // FIXED: Single fetch function with comprehensive duplicate prevention
  const fetchQuestions = useCallback(async () => {
    if (!isClient) {
      console.log('fetchQuestions: Not client-side, skipping');
      return;
    }
    
    if (!exam_string) {
      console.log('fetchQuestions: No exam_string, skipping');
      return;
    }
    
    if (!examScheduleId) {
      console.log('fetchQuestions: No examScheduleId, skipping');
      return;
    }
    
    if (examOrder.length === 0) {
      console.log('fetchQuestions: No examOrder, skipping');
      return;
    }

    const fetchState = fetchStateRef.current;
    
    if (fetchState.isFetching) {
      console.log('fetchQuestions: Already fetching, skipping duplicate request');
      return;
    }
    
    if (fetchState.hasFetched && fetchState.lastSuccessfulFetch === exam_string) {
      console.log('fetchQuestions: Already fetched for this exam, skipping');
      return;
    }
    
    const currentExam = examOrder.find((exam) => exam.exam_string === exam_string);
    if (!currentExam) {
      console.log('fetchQuestions: Exam not found in examOrder');
      setError(true);
      setLoading(false);
      return;
    }

    fetchStateRef.current.isFetching = true;
    
    console.log('fetchQuestions: Starting fetch for exam:', {
      exam_string,
      examId: currentExam.exam_id,
      examName: currentExam.name
    });
    
    try {
      // Initialize exam in enhanced database
      if (currentExam.exam_id) {
        await enhancedExamDBService.initializeExam(exam_string, currentExam.exam_id);
      }

      const axios = (await import('axios')).default;
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/byExamString?exam_string=${exam_string}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (exam_string !== fetchStateRef.current.currentExamString) {
        console.log('fetchQuestions: Exam changed during fetch, aborting');
        return;
      }

      if (!response.data || !response.data.encryptedData) {
        throw new Error('Invalid API response - no encrypted data');
      }

      const decryptedData = decryptData(response.data.encryptedData);
      const parsedData = JSON.parse(decryptedData);
      
      if (!parsedData.questions || parsedData.questions.length === 0) {
        throw new Error('No questions found in response');
      }

      if (exam_string !== fetchStateRef.current.currentExamString) {
        console.log('fetchQuestions: Exam changed after decrypt, aborting');
        return;
      }
      
      console.log('fetchQuestions: Successfully fetched questions:', {
        count: parsedData.questions.length,
        duration: parsedData.duration
      });
      
      // Set exam data
      setExamIdNum(currentExam.exam_id);
      setExamName(currentExam.name);
      setDuration(parsedData.duration);
      setQuestions(parsedData.questions);
      setQuestionsReady(true);
      
      fetchStateRef.current.hasFetched = true;
      fetchStateRef.current.lastSuccessfulFetch = exam_string;
      
      // Load session ONLY after questions are set
      try {
        const sessionLoaded = await loadExistingSession(currentExam.exam_id, exam_string);
        
        if (!isExamAccessible && accessCheckComplete) {
          return;
        }
        
        if (!sessionLoaded && isExamAccessible) {
          if (parsedData.duration > 0 && exam_string === fetchStateRef.current.currentExamString) {
            const timerDuration = parsedData.duration * 60; // Convert to seconds
            globalTimer.startTimer(timerDuration);
          }
        }
      } catch (sessionError) {
        console.warn('Session loading failed, starting fresh timer:', sessionError);
        if (isExamAccessible && parsedData.duration > 0 && exam_string === fetchStateRef.current.currentExamString) {
          const timerDuration = parsedData.duration * 60;
          globalTimer.startTimer(timerDuration);
        }
      }
      
      setInitializationComplete(true);
      setError(false);
      
    } catch (error) {
      console.error('fetchQuestions: Error fetching questions:', error);
      setError(true);
      setQuestionsReady(false);
    } finally {
      fetchStateRef.current.isFetching = false;
      setLoading(false);
    }
  }, [
    isClient, 
    exam_string,
    examOrder,
    examScheduleId,
    isExamAccessible,
    accessCheckComplete,
    loadExistingSession, 
    globalTimer
  ]);

  // Enhanced submit to server with proper final exam handling
  const submitToServer = useCallback(async (shouldScore = false): Promise<boolean> => {
    if (!isClient) return false;
    
    setSubmitLoading(true);
    setSubmitError(false);
    
    try {
      console.log('Current examOrder in context:', examOrder);
      
      const currentExam = examOrder.find(exam => exam.exam_string === exam_string);
      if (!currentExam) {
        console.error('Current exam not found in examOrder for exam_string:', exam_string);
        throw new Error('Current exam not found');
      }
      
      if (!currentExam.exam_id) {
        console.error('Exam ID missing for exam:', currentExam);
        throw new Error('Exam ID missing');
      }
      
      const examIdToSubmit = currentExam.exam_id;

      // Get latest answers and question times from new system
      const savedAnswers = await enhancedExamDBService.getAnswers(exam_string) || answers;
      const finalQuestionTimes = questionTimer.getAllQuestionTimes();

      const axios = (await import('axios')).default;
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      console.log('Submitting to server:', {
        exam_string,
        examIdToSubmit,
        savedAnswers,
        finalQuestionTimes
      });

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/examSession/submit`,
        { 
          exam_schedule_id: examScheduleId,
          exam_id: examIdToSubmit,
          answers: savedAnswers,
          question_elapsed_times: finalQuestionTimes
        },
        { 
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      // Handle user course submission for final exam
      if (isLastExam && selectedTopicId) {
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/userCourse/`,
            {
              topic_id: selectedTopicId,
              quiz_id: examScheduleId
            },
            { 
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${authToken}`}
            }
          );
        } catch (error) {
          console.warn('User course submission failed:', error);
        }
      }
      
      // Handle scoring for final exam
      if (shouldScore && isLastExam) {
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/score/schedule/${examScheduleId}`,
            {},
            { 
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${authToken}`
              }
            }
          );
        } catch (scoreError) {
          console.warn('Scoring failed:', scoreError);
        }
      }
  
      setSubmitLoading(false);
      return true;
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitLoading(false);
      setSubmitError(true);
      return false;
    }
  }, [isClient, exam_string, examScheduleId, examIdNum, answers, isLastExam, selectedTopicId, examOrder, questionTimer]);

  // Handle change - adapted for new database system
  const handleChange = useCallback(async (id: number, value: any) => {
    const updatedAnswers = {
      ...answers,
      [id]: value
    };
    setAnswers(updatedAnswers);
    await enhancedExamDBService.saveAnswers(exam_string, updatedAnswers);
  }, [answers, exam_string]);

  // Handle true/false change - adapted for new database system
  const handleTrueFalseChange = useCallback(async (id: number, index: number, value: any) => {
    const updatedAnswers = [...(answers[id] || [])];
    updatedAnswers[index] = value;
    const newAnswers = {
      ...answers,
      [id]: updatedAnswers
    };
    setAnswers(newAnswers);
    await enhancedExamDBService.saveAnswers(exam_string, newAnswers);
  }, [answers, exam_string]);

  // Utility functions - keeping original
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

  // Handle submit
  const handleSubmit = useCallback((e?: React.FormEvent, skipConfirmation = false) => {
    if (e) e.preventDefault();
    
    if (isTimeExpired || skipConfirmation) {
      handleAutoSubmit('manual_submit');
    } else {
      setShowConfirmationModal(true);
    }
  }, [isTimeExpired, handleAutoSubmit]);

  // Confirm submit
  const confirmSubmit = useCallback(async () => {
    setShowConfirmationModal(false);
    await handleAutoSubmit('confirmed_submit');
  }, [handleAutoSubmit]);

  // Enhanced handleNextExam - keeping original logic
  const handleNextExam = useCallback(async () => {
    if (nextExam && !isLastExam) {
      const nextExamString = examOrder[currentExamIndex + 1].exam_string;
      
      setShowModalNext(false);
      globalTimer.stopTimer();
      
      try {
        await enhancedExamDBService.deleteExamData(exam_string);
      } catch (error) {
        console.error('Error deleting exam data:', error);
      }
      
      // Reset fetch state for new exam
      fetchStateRef.current = {
        currentExamString: null,
        isFetching: false,
        hasFetched: false,
        lastSuccessfulFetch: null
      };
      
      // Enhanced state reset before navigation
      setLoading(true);
      setError(false);
      setSubmitError(false);
      setQuestions([]);
      setAnswers({});
      setCurrentQuestion(0);
      setExamSession(null);
      setIsTimeExpired(false);
      setExamName(null);
      setDuration(0);
      setQuestionsReady(false);
      setAccessCheckComplete(false);
      setInitializationComplete(false);
      
      submissionInProgress.current = false;
      
      setTimeout(() => {
        router.push(`/exam/${nextExamString}`);
      }, 100);
      
    } else {
      setShowModalNext(false);
      setShowFinalCompletionModal(false);
      
      globalTimer.stopTimer();
      
      if (clearExamData) {
        clearExamData();
      }
      
      router.push(originPath || '/try-out');
    }
  }, [
    nextExam, 
    examOrder, 
    currentExamIndex, 
    isLastExam,
    finalSubmitSuccess,
    clearExamData, 
    router, 
    originPath, 
    exam_string,
    globalTimer
  ]);

  // Handle retry submit
  const handleRetrySubmit = () => {
    handleAutoSubmit('retry');
  };

  // Handle navigation - adapted for new question timer
  const handleNavigation = useCallback(async (index: number) => {
    if (questions.length === 0 || index < 0 || index >= questions.length) return;
    
    setCurrentQuestion(index);
    // Question timer will automatically handle timing when currentQuestion changes
  }, [questions.length]);

  // Check if answered
  const isAnswered = (id: number) => {
    return answers[id] !== undefined && isAnswerFilled(answers[id]);
  };

  // Handle close
  const handleClose = useCallback(async () => {
    globalTimer.stopTimer();
    if (clearExamData) clearExamData();
    router.push(originPath || '/try-out');
  }, [globalTimer, clearExamData, router, originPath]);

  // Handle retry access - keeping original logic
  const handleRetryAccess = useCallback(async () => {
    if (!isClient) return;
    
    try {
      const axios = (await import('axios')).default;
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/examSession/active`,
        {
          params: {
            exam_schedule_id: examScheduleId,
            exam_id: examIdNum
          },
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      if (response.data.status === 'success' && response.data.data) {
        const sessionData = response.data.data;
        
        const serverNow = Date.now();
        const sessionStartTime = new Date(sessionData.start_time).getTime();
        
        if (!sessionData.is_auto_move && serverNow >= sessionStartTime) {
          setShowNotAccessibleModal(false);
          setIsExamAccessible(true);
          setAccessCheckComplete(false);
          setLoading(true);
          
          fetchStateRef.current.hasFetched = false;
          fetchStateRef.current.lastSuccessfulFetch = null;
          
          fetchQuestions();
        } else {
          setExamStartTime(sessionData.start_time);
          setIsExamAccessible(false);
        }
      }
    } catch (error) {
      if (examStartTime) {
        const serverNow = Date.now();
        const startTime = new Date(examStartTime).getTime();
        
        if (serverNow >= startTime) {
          setIsExamAccessible(true);
          setShowNotAccessibleModal(false);
          setAccessCheckComplete(false);
          setLoading(true);
          
          fetchStateRef.current.hasFetched = false;
          fetchStateRef.current.lastSuccessfulFetch = null;
          
          fetchQuestions();
        }
      }
    }
  }, [isClient, examScheduleId, examIdNum, examStartTime, fetchQuestions]);

  // Render question - keeping original
  const renderQuestion = (q: Question) => {
    if (!isClient) return null;
    
    switch (q.type) {
      case 'single-choice':
        return (
          <div className="single-choice-container">
            {SingleChoice && (
              <SingleChoice 
                question={Latex ? <Latex>{q.question}</Latex> : q.question} 
                options={q.options} 
                onChange={(value) => handleChange(q.id, value)} 
                selectedAnswers={answers[q.id] || []} 
              />
            )}
          </div>
        );
      
      case 'multiple-choice':
        return (
          <div className="multiple-choice-container">
            {MultipleChoice && (
              <MultipleChoice 
                question={q.question} 
                options={q.options || []} 
                selectedAnswers={answers[q.id] || []} 
                onChange={(value) => handleChange(q.id, value)} 
              />
            )}
          </div>
        );
        
      case 'number':
        return (
          <div className="number-input-container">
            {NumberInput && (
              <NumberInput 
                question={q.question} 
                onChange={(value) => handleChange(q.id, value)}
                value={answers[q.id]} 
              />
            )}
          </div>
        );
        
      case 'text':
        return (
          <div className="text-input-container">
            {TextInput && (
              <TextInput 
                question={q.question} 
                onChange={(value) => handleChange(q.id, value)}
                value={answers[q.id]} 
              />
            )}
          </div>
        );
        
      case 'true-false':
        return (
          <div className="true-false-container">
            {TrueFalse && (
              <TrueFalse 
                question={q.question} 
                statements={q.statements || []} 
                selectedAnswers={answers[q.id] || []} 
                onChange={(index, value) => handleTrueFalseChange(q.id, index, value)} 
              />
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  // FIXED: Single initialization effect
  useEffect(() => {
    if (!isClient || !exam_string || !examScheduleId || examOrder.length === 0) {
      return;
    }
    
    if (!fetchStateRef.current.hasFetched || fetchStateRef.current.lastSuccessfulFetch !== exam_string) {
      console.log('Single initialization for exam:', exam_string);
      
      const initExam = async () => {
        try {
          // Load saved answers first
          const savedAnswers = await enhancedExamDBService.getAnswers(exam_string);
          if (savedAnswers) {
            setAnswers(savedAnswers);
          }

          await fetchQuestions();
        } catch (error) {
          console.error('Initialization failed:', error);
          setError(true);
          setLoading(false);
        }
      };

      initExam();
    }
  }, [
    isClient,
    exam_string,
    examScheduleId,
    examOrder.length,
    fetchQuestions
  ]);

  // Countdown effect for exam access - keeping original logic
  useEffect(() => {
    if (!isClient || isExamAccessible || !examStartTime) return;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const startTime = new Date(examStartTime).getTime();
      const diff = startTime - now;
      
      if (diff <= 0) {
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
  }, [isClient, isExamAccessible, examStartTime, handleRetryAccess]);

  // Enhanced loading state management
  useEffect(() => {
    const shouldStopLoading = 
      questionsReady && 
      accessCheckComplete && 
      initializationComplete &&
      questions.length > 0 && 
      isClient && 
      exam_string && 
      examScheduleId;

    if (shouldStopLoading && loading) {
      console.log('All conditions met, stopping loading');
      setLoading(false);
    }
  }, [
    questionsReady,
    accessCheckComplete, 
    initializationComplete,
    questions.length,
    isClient,
    exam_string,
    examScheduleId,
    loading
  ]);

  // Debug effect to monitor timer status
  useEffect(() => {
    console.log('Timer debug info:', {
      examId: examId,
      isInitialized: globalTimer.isInitialized,
      isRunning: globalTimer.isRunning,
      timeLeft: globalTimer.timeLeft,
      error: globalTimer.error,
      debugInfo: globalTimer.debugInfo
    });
  }, [examId, globalTimer.isInitialized, globalTimer.isRunning, globalTimer.timeLeft, globalTimer.error]);

  // Enhanced loading screen
  if (!isClient || loading || !questionsReady || !accessCheckComplete) {
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">
            {!accessCheckComplete ? 'Checking Exam Access...' : 
             !questionsReady ? 'Loading Questions...' : 
             'Initializing Exam...'}
          </h2>
          <p className="tw-text-violet-600 tw-mt-2">
            {!accessCheckComplete ? 'Verifying exam schedule and accessibility...' :
             !questionsReady ? 'Fetching exam questions and setup...' : 
             'Preparing your exam environment...'}
          </p>
          <div className="tw-mt-4 tw-text-sm tw-text-violet-500">
            <p>Exam: {exam_string}</p>
            <p>Timer Status: {globalTimer.isInitialized ? 'Ready' : 'Initializing...'}</p>
            <p>Fetch Status: {fetchStateRef.current.isFetching ? 'Fetching...' : 'Waiting...'}</p>
          </div>
        </div>
      </div>
    );
  }
    
  if (error) {
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <AlertCircle className="tw-h-12 tw-w-12 tw-text-red-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-red-800">Error Loading Exam</h2>
          <p className="tw-text-red-600 tw-mt-2">There was an error loading the exam questions</p>
          {globalTimer.error && (
            <p className="tw-text-red-500 tw-mt-1 tw-text-sm">Timer Error: {globalTimer.error}</p>
          )}
          <Button 
            variant="primary" 
            className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-mt-4"
            onClick={() => {
              fetchStateRef.current = {
                currentExamString: exam_string,
                isFetching: false,
                hasFetched: false,
                lastSuccessfulFetch: null
              };
              setQuestionsReady(false);
              setAccessCheckComplete(false);
              setInitializationComplete(false);
              setError(false);
              setLoading(true);
              fetchQuestions();
            }}
          >
            Retry Now
          </Button>
        </div>
      </div>
    );
  }
  
  // Show waiting screen when exam is not accessible
  if (!isExamAccessible && accessCheckComplete) {
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

  return (
    <>
      {/* Focus Detector - keeping original behavior */}
      <FocusDetector 
        onAutoSubmit={handleAutoSubmit}
        enabled={!loading && !error && isExamAccessible && questions.length > 0 && !isSubmitting && questionsReady}
        timerRunning={globalTimer.isRunning}
      />

      <ChangeTabPrevention 
        onAutoSubmit={() => handleAutoSubmit('tab_change')}
        enabled={!loading && !error && isExamAccessible && questions.length > 0 && questionsReady}
      >
        <div className="tw-min-h-screen tw-bg-violet-50">
          {/* Header with FIXED timer display */}
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
                  <div className="tw-flex tw-items-center tw-gap-1">
                    <Clock size={28} className="tw-text-violet-200" />
                    {globalTimer.isRunning && <Activity size={16} className="tw-text-green-400 tw-animate-pulse" />}
                    {globalTimer.debugInfo.usingWorker ? <Wifi size={16} className="tw-text-green-400" /> : <WifiOff size={16} className="tw-text-yellow-400" />}
                    {questionsReady && <Check size={16} className="tw-text-green-400" />}
                    {autosave.isAutoSaving && <Save size={16} className="tw-text-blue-400 tw-animate-pulse" />}
                  </div>
                  <div className="tw-flex tw-flex-col tw-items-start">
                    <span className="tw-text-violet-200 tw-text-sm">Time Remaining</span>
                    <span className="tw-text-3xl tw-font-mono tw-font-bold">{globalTimer.formatTime(globalTimer.timeLeft)}</span>
                  </div>
                </div>
              </div>
            </Container>
          </div>

          {/* Auto-Submit Loading Overlay */}
          {isSubmitting && (
            <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
              <div className="tw-bg-white tw-p-8 tw-rounded-lg tw-text-center tw-max-w-md">
                <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
                <h3 className="tw-text-xl tw-font-semibold tw-text-violet-800 tw-mb-2">
                  {isLastExam ? 'Submitting Final Exam' : 'Submitting Exam'}
                </h3>
                <p className="tw-text-violet-600 tw-mb-4">
                  {isLastExam ? 'Processing your final answers and generating results...' : 'Please wait while we process your answers...'}
                </p>
                <div className="tw-text-sm tw-text-violet-500">
                  <p>Timer Status: {globalTimer.isRunning ? 'Stopped' : 'Inactive'}</p>
                  <p>Worker: {globalTimer.debugInfo.usingWorker ? 'Active' : 'Fallback'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Checkpoint Toast */}
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
                <strong className="tw-mr-auto">Auto-Saved</strong>
              </Toast.Header>
              <Toast.Body className="tw-text-violet-700">
                Progress saved {autosave.formatLastSave()}
              </Toast.Body>
            </Toast>
          </div>

          {/* Main Content Container */}
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
                    {questions.length > 0 && currentQuestion < questions.length && questionsReady ? (
                      <>
                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
                          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">
                            Question {currentQuestion + 1} of {questions.length}
                          </h2>
                          <div className="tw-flex tw-items-center tw-gap-2">
                            <div className="tw-flex tw-items-center tw-gap-1 tw-text-sm tw-text-violet-600">
                              <Clock size={16} />
                              <span>Current: {questionTimer.formatTime(questionTimer.currentQuestionElapsed)}</span>
                            </div>
                            {autosave.isAutoSaving && (
                              <div className="tw-flex tw-items-center tw-text-violet-600">
                                <Loader2 className="tw-h-4 tw-w-4 tw-animate-spin tw-mr-2" />
                                <span className="tw-text-sm">Saving...</span>
                              </div>
                            )}
                          </div>
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
                        <p className="tw-text-gray-500">
                          {!questionsReady ? 'Loading questions...' : 'No questions available'}
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Enhanced Right Sidebar with FIXED timer information */}
              <Col lg={4} className="tw-hidden md:tw-block">
                <Card className="tw-shadow-md tw-border-0 tw-rounded-xl tw-sticky tw-top-4">
                  <Card.Body className="tw-p-4">
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                      <h3 className="tw-text-lg tw-font-semibold tw-text-violet-800">Question Navigator</h3>
                    </div>
                    {questions.length > 0 && questionsReady ? (
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

                        {/* FIXED Timer Display with detailed information */}
                        <div className="tw-bg-violet-50 tw-p-3 tw-rounded-lg tw-mb-4">
                          <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                            <span className="tw-text-sm tw-font-medium tw-text-violet-800">Timer Status</span>
                            <div className="tw-flex tw-items-center tw-gap-1">
                              {globalTimer.isRunning && <Activity className="tw-text-blue-600 tw-animate-pulse" size={14} />}
                              {globalTimer.debugInfo.usingWorker ? <Wifi className="tw-text-green-600" size={14} /> : <WifiOff className="tw-text-yellow-600" size={14} />}
                              {questionsReady && <Check className="tw-text-green-600" size={14} />}
                              {isLastExam && <span className="tw-text-orange-600 tw-text-xs">🏁</span>}
                              {autosave.isAutoSaving && <Save className="tw-text-blue-600 tw-animate-pulse" size={14} />}
                              {globalTimer.isInitialized && <Shield className="tw-text-green-600" size={14} />}
                            </div>
                          </div>
                          <p className="tw-text-lg tw-font-mono tw-font-bold tw-text-violet-700">
                            {globalTimer.formatTime(globalTimer.timeLeft)}
                          </p>
                          <div className="tw-space-y-1 tw-text-xs tw-text-violet-600 tw-mt-2">
                            <div className="tw-flex tw-justify-between">
                              <span>Global Timer:</span>
                              <span>{globalTimer.isRunning ? 'Running' : 'Stopped'}</span>
                            </div>
                            <div className="tw-flex tw-justify-between">
                              <span>Worker:</span>
                              <span>{globalTimer.debugInfo.usingWorker ? 'Active' : 'Fallback'}</span>
                            </div>
                            <div className="tw-flex tw-justify-between">
                              <span>Last Sync:</span>
                              <span>{autosave.formatLastSave()}</span>
                            </div>
                            <div className="tw-flex tw-justify-between">
                              <span>Question Time:</span>
                              <span>{questionTimer.formatTime(questionTimer.currentQuestionElapsed)}</span>
                            </div>
                            <div className="tw-flex tw-justify-between">
                              <span>Initialized:</span>
                              <span>{globalTimer.isInitialized ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced submit button for final exam */}
                        {currentQuestion === questions.length - 1 && (
                          <Button 
                            variant="primary" 
                            className={`tw-w-full tw-border-0 tw-mt-4 ${
                              isLastExam 
                                ? 'tw-bg-orange-600 hover:tw-bg-orange-700' 
                                : 'tw-bg-violet-600 hover:tw-bg-violet-700'
                            }`}
                            onClick={handleSubmit}
                          >
                            {isLastExam ? (
                              <>
                                <FileCheck className="tw-mr-2" size={16} />
                                Submit Final Exam
                              </>
                            ) : (
                              'Submit Exam'
                            )}
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="tw-text-center tw-text-gray-500">
                        <p>{!questionsReady ? 'Loading questions...' : 'No questions loaded'}</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>

          {/* Enhanced Mobile Bottom Navigation */}
          <div className="tw-block md:tw-hidden tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-bg-white tw-shadow-lg tw-border-t tw-border-gray-200 tw-z-50">
            <div className="tw-p-4">
              {questions.length > 0 && questionsReady ? (
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

                  {/* Enhanced mobile submit button */}
                  {currentQuestion === questions.length - 1 && (
                    <Button 
                      variant="primary" 
                      className={`tw-w-full tw-border-0 tw-mt-4 ${
                        isLastExam 
                          ? 'tw-bg-orange-600 hover:tw-bg-orange-700' 
                          : 'tw-bg-violet-600 hover:tw-bg-violet-700'
                      }`}
                      onClick={handleSubmit}
                    >
                      {isLastExam ? (
                        <>
                          <FileCheck className="tw-mr-2" size={16} />
                          Submit Final Exam
                        </>
                      ) : (
                        'Submit Exam'
                      )}
                    </Button>
                  )}
                </>
              ) : (
                <div className="tw-text-center tw-text-gray-500">
                  <p>{!questionsReady ? 'Loading questions...' : 'No questions available'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Confirmation Modal with final exam awareness */}
          <Modal 
            show={showConfirmationModal} 
            onHide={() => setShowConfirmationModal(false)}
            centered
            backdrop="static"
          >
            <Modal.Header className={`${isLastExam ? 'tw-bg-orange-50' : 'tw-bg-violet-50'}`}>
              <Modal.Title className={`${isLastExam ? 'tw-text-orange-800' : 'tw-text-violet-800'} tw-flex tw-items-center`}>
                <AlertCircle className={`tw-mr-2 ${isLastExam ? 'tw-text-orange-600' : 'tw-text-violet-600'}`} size={20} />
                {isLastExam ? 'Confirm Final Submission' : 'Confirm Submission'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="tw-p-2">
                <p className={`tw-text-lg tw-font-medium tw-mb-3 ${isLastExam ? 'tw-text-orange-900' : 'tw-text-violet-900'}`}>
                  {isLastExam 
                    ? 'Are you sure you want to end this final exam? This will complete your entire exam session.'
                    : 'Are you sure you want to end this exam?'
                  }
                </p>
                
                <div className={`${isLastExam ? 'tw-bg-orange-50' : 'tw-bg-violet-50'} tw-p-4 tw-rounded-lg tw-mb-4`}>
                  <div className="tw-flex tw-items-center tw-mb-2">
                    <FileCheck className={`${isLastExam ? 'tw-text-orange-600' : 'tw-text-violet-600'} tw-mr-2`} size={18} />
                    <span className={`tw-font-medium ${isLastExam ? 'tw-text-orange-800' : 'tw-text-violet-800'}`}>
                      {isLastExam ? 'Final Exam Summary' : 'Exam Summary'}
                    </span>
                  </div>
                  <p className={`${isLastExam ? 'tw-text-orange-700' : 'tw-text-violet-700'} tw-mb-2`}>
                    <span className="tw-font-medium">Completed:</span> {getFilledAnswersCount()} of {questions.length} questions
                  </p>
                  <p className={`${isLastExam ? 'tw-text-orange-700' : 'tw-text-violet-700'} tw-mb-2`}>
                    <span className="tw-font-medium">Time Remaining:</span> {globalTimer.formatTime(globalTimer.timeLeft)}
                  </p>
                  <p className={`${isLastExam ? 'tw-text-orange-700' : 'tw-text-violet-700'} tw-mb-2`}>
                    <span className="tw-font-medium">Current Question Time:</span> {questionTimer.formatTime(questionTimer.currentQuestionElapsed)}
                  </p>
                  <p className={`${isLastExam ? 'tw-text-orange-700' : 'tw-text-violet-700'} tw-mb-2`}>
                    <span className="tw-font-medium">Timer Status:</span> {globalTimer.isRunning ? 'Running' : 'Stopped'} ({globalTimer.debugInfo.usingWorker ? 'Worker' : 'Fallback'})
                  </p>
                  {isLastExam && (
                    <p className="tw-text-orange-700 tw-mb-2 tw-font-medium">
                      This is your final exam section. Results will be processed after submission.
                    </p>
                  )}
                  {getFilledAnswersCount() < questions.length && (
                    <div className="tw-bg-amber-50 tw-p-2 tw-rounded tw-border tw-border-amber-200 tw-text-amber-800 tw-text-sm tw-mt-2">
                      Warning: You have {questions.length - getFilledAnswersCount()} unanswered questions.
                    </div>
                  )}
                </div>
                
                <p className="tw-text-gray-600 tw-text-sm">
                  {isLastExam 
                    ? 'Once submitted, you won\'t be able to change your answers and your results will be processed.'
                    : 'Once submitted, you won\'t be able to change your answers for this section.'
                  }
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowConfirmationModal(false)}
                className={`tw-border-2 ${isLastExam ? 'tw-border-orange-200 tw-text-orange-700 hover:tw-bg-orange-50' : 'tw-border-violet-200 tw-text-violet-700 hover:tw-bg-violet-50'}`}
              >
                Continue Exam
              </Button>
              <Button 
                variant="primary" 
                onClick={confirmSubmit}
                className={`tw-border-0 tw-flex tw-items-center ${
                  isLastExam 
                    ? 'tw-bg-orange-600 hover:tw-bg-orange-700' 
                    : 'tw-bg-violet-600 hover:tw-bg-violet-700'
                }`}
              >
                <ArrowRight className="tw-mr-1" size={16} /> 
                {isLastExam ? 'Submit Final Exam' : 'End Exam'}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Enhanced Next Exam Modal with final exam completion handling */}
          <Modal 
            show={showModalNext} 
            onHide={() => setShowModalNext(false)}
            centered
            backdrop="static"
          >
            <Modal.Header className="tw-bg-green-50">
              <Modal.Title className="tw-text-green-800 tw-flex tw-items-center">
                <Check className="tw-mr-2 tw-text-green-600" size={20} />
                {submitError ? 'Submission Error' : 'Exam Submitted Successfully'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="tw-p-2">
                {submitError ? (
                  <>
                    <p className="tw-text-lg tw-font-medium tw-mb-3 tw-text-red-900">
                      There was an error submitting your exam.
                    </p>
                    <div className="tw-bg-red-50 tw-p-4 tw-rounded-lg tw-mb-4">
                      <p className="tw-text-red-700">
                        Your answers have been saved locally. Please check your internet connection and try again.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="tw-text-lg tw-font-medium tw-mb-3 tw-text-green-900">
                      Great job! Your exam has been submitted successfully.
                    </p>
                    {nextExam && !isLastExam ? (
                      <div className="tw-bg-blue-50 tw-p-4 tw-rounded-lg tw-mb-4">
                        <p className="tw-text-blue-700 tw-mb-2">
                          <span className="tw-font-medium">Next exam:</span> {nextExam}
                        </p>
                        <p className="tw-text-blue-600 tw-text-sm">
                          Click "Continue" to proceed to the next section.
                        </p>
                      </div>
                    ) : (
                      <div className="tw-bg-green-50 tw-p-4 tw-rounded-lg tw-mb-4">
                        <p className="tw-text-green-700">
                          You have completed all sections of this exam session.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              {submitError ? (
                <>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setShowModalNext(false)}
                    className="tw-border-2 tw-border-gray-200 tw-text-gray-700 hover:tw-bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleRetrySubmit}
                    className="tw-bg-red-600 tw-border-0 hover:tw-bg-red-700"
                  >
                    Retry Submit
                  </Button>
                </>
              ) : (
                <Button 
                  variant="primary" 
                  onClick={handleNextExam}
                  className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center"
                >
                  {nextExam && !isLastExam ? (
                    <>
                      <ArrowRight className="tw-mr-1" size={16} /> Continue to Next Exam
                    </>
                  ) : (
                    <>
                      <Home className="tw-mr-1" size={16} /> Return to Try-Out
                    </>
                  )}
                </Button>
              )}
            </Modal.Footer>
          </Modal>

          {/* Final Completion Modal for last exam */}
          <Modal 
            show={showFinalCompletionModal} 
            onHide={() => setShowFinalCompletionModal(false)}
            centered
            backdrop="static"
          >
            <Modal.Header className="tw-bg-gradient-to-r tw-from-green-50 tw-to-blue-50">
              <Modal.Title className="tw-text-green-800 tw-flex tw-items-center">
                {finalSubmitSuccess ? (
                  <>
                    <Check className="tw-mr-2 tw-text-green-600" size={20} />
                    Exam Session Completed!
                  </>
                ) : (
                  <>
                    <AlertCircle className="tw-mr-2 tw-text-red-600" size={20} />
                    Final Submission Error
                  </>
                )}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="tw-p-2">
                {finalSubmitSuccess ? (
                  <>
                    <p className="tw-text-lg tw-font-medium tw-mb-3 tw-text-green-900">
                      Congratulations! You have successfully completed your entire exam session.
                    </p>
                    <div className="tw-bg-gradient-to-r tw-from-green-50 tw-to-blue-50 tw-p-4 tw-rounded-lg tw-mb-4">
                      <div className="tw-flex tw-items-center tw-mb-2">
                        <FileCheck className="tw-text-green-600 tw-mr-2" size={18} />
                        <span className="tw-font-medium tw-text-green-800">Final Results</span>
                      </div>
                      <p className="tw-text-green-700 tw-mb-2">
                        All exam sections have been submitted successfully
                      </p>
                      <p className="tw-text-green-700 tw-mb-2">
                        Your answers are being processed for scoring
                      </p>
                      <p className="tw-text-blue-700 tw-font-medium">
                        Results will be available on your dashboard shortly
                      </p>
                    </div>
                    <div className="tw-bg-blue-50 tw-p-3 tw-rounded tw-border tw-border-blue-200">
                      <p className="tw-text-blue-800 tw-text-sm tw-mb-1">
                        <strong>What happens next?</strong>
                      </p>
                      <ul className="tw-text-blue-700 tw-text-sm tw-list-disc tw-list-inside tw-space-y-1">
                        <li>Your answers will be automatically scored</li>
                        <li>Results will appear on your dashboard</li>
                        <li>You can review your performance and areas for improvement</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="tw-text-lg tw-font-medium tw-mb-3 tw-text-red-900">
                      There was an error submitting your final exam.
                    </p>
                    <div className="tw-bg-red-50 tw-p-4 tw-rounded-lg tw-mb-4">
                      <p className="tw-text-red-700 tw-mb-2">
                        Don't worry! Your answers have been saved locally.
                      </p>
                      <p className="tw-text-red-600 tw-text-sm">
                        Please check your internet connection and try submitting again.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              {finalSubmitSuccess ? (
                <Button 
                  variant="primary" 
                  onClick={handleNextExam}
                  className="tw-bg-gradient-to-r tw-from-green-600 tw-to-blue-600 tw-border-0 hover:tw-from-green-700 hover:tw-to-blue-700 tw-flex tw-items-center"
                >
                  <Home className="tw-mr-2" size={16} />
                  Return to Try-Out Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setShowFinalCompletionModal(false)}
                    className="tw-border-2 tw-border-gray-200 tw-text-gray-700 hover:tw-bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={handleRetrySubmit}
                    className="tw-bg-red-600 tw-border-0 hover:tw-bg-red-700"
                  >
                    Retry Final Submit
                  </Button>
                </>
              )}
            </Modal.Footer>
          </Modal>

          {/* Not Accessible Modal */}
          <Modal 
            show={showNotAccessibleModal} 
            onHide={() => setShowNotAccessibleModal(false)}
            centered
            backdrop="static"
          >
            <Modal.Header className="tw-bg-amber-50">
              <Modal.Title className="tw-text-amber-800 tw-flex tw-items-center">
                <Clock className="tw-mr-2 tw-text-amber-600" size={20} />
                Exam Not Available
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="tw-p-2 tw-text-center">
                <p className="tw-text-lg tw-font-medium tw-mb-3 tw-text-amber-900">
                  This exam is not yet available.
                </p>
                
                <div className="tw-bg-amber-50 tw-p-4 tw-rounded-lg tw-mb-4">
                  {examStartTime && (
                    <>
                      <p className="tw-text-amber-700 tw-mb-2">
                        <span className="tw-font-medium">Available at:</span><br />
                        {new Date(examStartTime).toLocaleString()}
                      </p>
                      <div className="tw-text-2xl tw-font-mono tw-font-bold tw-text-amber-700 tw-mt-2">
                        {countdown}
                      </div>
                    </>
                  )}
                </div>
                
                <p className="tw-text-amber-600 tw-text-sm">
                  Please wait until the scheduled start time or check if the exam has auto-start enabled.
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="outline-secondary" 
                onClick={handleClose}
                className="tw-border-2 tw-border-gray-200 tw-text-gray-700 hover:tw-bg-gray-50"
              >
                Go Back
              </Button>
              <Button 
                variant="primary" 
                onClick={handleRetryAccess}
                className="tw-bg-amber-600 tw-border-0 hover:tw-bg-amber-700"
              >
                Check Again
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </ChangeTabPrevention>
    </>
  );
};

// FIXED: Main ChainExam Component with All Providers and Enhanced Context Management
const ChainExam: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [examDuration, setExamDuration] = useState<number>(0);
  const [mainTimer, setMainTimer] = useState<number>(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // FIXED: Stable callback for backward compatibility with old timer contexts
  const handleTimerUpdate = useCallback((currentTime: number) => {
    setMainTimer(currentTime);
    setExamDuration(currentTime);
  }, []);

  // FIXED: Security breach handler for backward compatibility
  const handleSecurityBreach = useCallback(() => {
    console.warn('Security breach detected (compatibility handler)');
  }, []);

  if (!isClient) {
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">Initializing Enhanced Timer System...</h2>
          <p className="tw-text-violet-600 tw-mt-2">Please wait while we prepare the optimized exam environment</p>
          <div className="tw-mt-4 tw-text-sm tw-text-violet-500">
            <p>Loading optimized timer components...</p>
            <p>Initializing worker threads...</p>
            <p>Setting up auto-save system...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserPurchaseProvider 
      examDuration={mainTimer} 
      onSecurityBreach={handleSecurityBreach}
    >
      <ActiveUserProvider 
        examDuration={mainTimer}
        onSecurityBreach={handleSecurityBreach}
      >
        <AllProductProvider 
          examDuration={mainTimer}
          onSecurityBreach={handleSecurityBreach}
        >
          <ExamContent />
        </AllProductProvider>
      </ActiveUserProvider>
    </UserPurchaseProvider>
  );
};

export default ChainExam;