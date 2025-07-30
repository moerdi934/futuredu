// ChainExam Component - PRODUCTION CLEAN VERSION
'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import CryptoJS from 'crypto-js';
import ChangeTabPrevention from '../../components/ChangeTabPrevention';
import { useDistributedTimeSync } from '../../hooks/useDistributedTimeSync';
import { useSecureTimer } from '../../hooks/useSecureTimer';
import { useExam } from '../../context/ExamContext';
import { useAuth } from '../../context/AuthContext';
import ExamDBService from '../../utils/ExamDBService';

// Import hidden timer contexts
import { UserPurchaseProvider, useUserPurchase } from '../../context/UserPurchaseContext';
import { ActiveUserProvider, useActiveUser } from '../../context/ActiveUserContext';
import { AllProductProvider, useAllProduct } from '../../context/AllProductContext';

// Import helper for timer authentication
import { RewardTimerAuthenticator } from '../../utils/RewardAuthenticationProcessor';

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
import { Clock, Loader2, Check, AlertCircle, FileCheck, ArrowRight, Eye, EyeOff, Shield, ShieldAlert, Activity, Wifi, WifiOff, Home } from 'lucide-react';

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

// Enhanced Hidden Timer Validator with Web Worker Integration
const HiddenTimerValidator: React.FC<{
  workerTimerValues: any;
  onSecurityBreach: () => void;
}> = React.memo(({ workerTimerValues, onSecurityBreach }) => {
  const userPurchase = useUserPurchase();
  const activeUser = useActiveUser();
  const allProduct = useAllProduct();
  const timerAuthenticator = useRef(new RewardTimerAuthenticator(30));
  const lastValidationRef = useRef<number>(0);
  
  useEffect(() => {
    const validateTimers = () => {
      try {
        const now = Date.now();
        
        // Rate limiting - validate every 3-5 minutes
        const timeSinceLastValidation = now - lastValidationRef.current;
        const minInterval = 3 * 60 * 1000; // 3 minutes
        const maxInterval = 5 * 60 * 1000; // 5 minutes
        const randomInterval = minInterval + Math.random() * (maxInterval - minInterval);
        
        if (timeSinceLastValidation < randomInterval) {
          return;
        }
        
        lastValidationRef.current = now;
        
        // Get all timer values
        const mainTimer = workerTimerValues.mainTimer || 0;
        const purchaseTimer = userPurchase.getMarketResearchInterval();
        const userActivityTimer = activeUser.getUserActivityInterval();
        const inventoryTimer = allProduct.getInventoryUpdateInterval();
        
        // Get worker backup timers
        const workerBackupTimers = workerTimerValues.backupTimers || {};
        
        // Very lenient validation - only flag EXTREME discrepancies
        const allTimers = [
          mainTimer,
          purchaseTimer,
          userActivityTimer,
          inventoryTimer,
          workerBackupTimers.purchase || 0,
          workerBackupTimers.userActivity || 0,
          workerBackupTimers.inventory || 0
        ];
        
        // Cross-validation using helper
        const validationResult = timerAuthenticator.current.validateTimerConsistency(allTimers);
        
        // Individual context validations
        const purchaseValid = userPurchase.validatePurchaseAuthority(mainTimer);
        const userActivityValid = activeUser.validateUserSessionIntegrity(mainTimer);
        const inventoryValid = allProduct.validateInventorySystemIntegrity(mainTimer);
        
        // Worker timer validation
        const workerValid = workerTimerValues.sessionValid;
        
        // Calculate deviation between worker and context timers
        const maxDeviation = Math.max(
          Math.abs(mainTimer - purchaseTimer),
          Math.abs(mainTimer - userActivityTimer),
          Math.abs(mainTimer - inventoryTimer),
          Math.abs(mainTimer - (workerBackupTimers.purchase || 0)),
          Math.abs(mainTimer - (workerBackupTimers.userActivity || 0)),
          Math.abs(mainTimer - (workerBackupTimers.inventory || 0))
        );
        
        // Even more lenient validation - only trigger on EXTREME discrepancies
        const isValid = 
          validationResult.isValid &&
          validationResult.confidence >= 0.3 && // Even lower threshold
          purchaseValid &&
          userActivityValid &&
          inventoryValid &&
          workerValid &&
          maxDeviation <= 300; // Allow up to 5 minutes deviation
        
        if (!isValid) {
          // Only trigger auto-submit if deviation is EXTREME (>10 minutes)
          if (maxDeviation > 600 || validationResult.confidence < 0.1) {
            onSecurityBreach();
          }
        }
        
      } catch (error) {
        // Don't auto-submit on validation errors, just log
      }
    };
    
    // Even less frequent validation - every 3-5 minutes
    const intervalId = setInterval(() => {
      validateTimers();
    }, 3 * 60 * 1000 + Math.random() * 2 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [workerTimerValues, userPurchase, activeUser, allProduct, onSecurityBreach]);
  
  return null; // Hidden component
});

HiddenTimerValidator.displayName = 'HiddenTimerValidator';

// Enhanced Focus Detection with Web Worker Integration
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
        // Reset when page becomes visible
        lastFocusTime.current = Date.now();
        setFocusWarningTime(0);
        setShowWarning(false);
        
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
          focusTimeoutRef.current = null;
        }
      } else {
        // Start countdown when page loses focus - increased to 15 seconds
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
        
        // Auto-submit after 15 seconds
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
  
  // Show warning only if page is not visible and countdown is active
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
  
  // Context hooks at top level
  const examContext = useExam();
  const authContext = useAuth();
  
  // Memoize the exam_string to prevent re-initialization loops
  const exam_string = useMemo(() => params?.exam_string as string, [params?.exam_string]);

  // Initialize distributed time sync with stable config (memoized)
  const timeSyncConfig = useMemo(() => ({
    minInterval: 2 * 60 * 1000,    // 2 minutes
    maxInterval: 5 * 60 * 1000,    // 5 minutes  
    focusThreshold: 1 * 60 * 1000, // 1 minute
    jumpThreshold: 5 * 1000        // 5 seconds
  }), []);
  
  const {
    timeOffset,
    getServerTime,
    detectTimeJump,
    forceSyncNow,
    isOnline,
    syncCount,
    getSyncStats,
    networkLatency,
    reliability,
    offsetStdDev,
    timezoneOffset
  } = useDistributedTimeSync(timeSyncConfig);
  
  // More granular loading states
  const [examId, setExamId] = useState<number | null>(null);
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
  const [isInitializing, setIsInitializing] = useState(false);
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [isExamAccessible, setIsExamAccessible] = useState<boolean>(true);
  const [showNotAccessibleModal, setShowNotAccessibleModal] = useState(false);
  const [examStartTime, setExamStartTime] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number|null>(null);
  const [originPath, setOriginPath] = useState<string>('/');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enhanced loading control states
  const [questionsForCurrentExam, setQuestionsForCurrentExam] = useState<Question[]>([]);
  const [currentExamQuestionIds, setCurrentExamQuestionIds] = useState<Set<number>>(new Set());
  const [isQuestionsReady, setIsQuestionsReady] = useState(false);
  const [lastLoadedExamString, setLastLoadedExamString] = useState<string | null>(null);
  const [examDataConsistency, setExamDataConsistency] = useState({
    examStringMatch: false,
    examIdMatch: false,
    questionsMatch: false,
    sessionMatch: false
  });

  // Fixed submission states
  const [isLastExam, setIsLastExam] = useState(false);
  const [finalSubmitSuccess, setFinalSubmitSuccess] = useState(false);
  const [showFinalCompletionModal, setShowFinalCompletionModal] = useState(false);

  // Fixed loading states for exam accessibility
  const [isCheckingExamAccess, setIsCheckingExamAccess] = useState(true);
  const [hasInitialAccessCheck, setHasInitialAccessCheck] = useState(false);

  const autoSaveRef = useRef<NodeJS.Timeout>();
  const submissionInProgress = useRef<boolean>(false);
  const initializationAttempted = useRef<boolean>(false);

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
  }, [currentExamIndex, examOrder.length, exam_string]);

  // Enhanced validation for exam readiness
  const validateExamReadiness = useCallback((
    targetExamString: string,
    targetExamId: number,
    targetQuestions: Question[],
    targetExamName: string
  ) => {
    // Check 1: Exam string must match current route
    const examStringMatch = targetExamString === exam_string;
    
    // Check 2: Exam ID must match the one from examOrder
    const currentExam = examOrder.find(exam => exam.exam_string === targetExamString);
    const examIdMatch = currentExam && currentExam.exam_id === targetExamId;
    
    // Check 3: Questions must exist and be non-empty
    const questionsMatch = targetQuestions.length > 0;
    
    // Check 4: Exam name must match
    const examNameMatch = targetExamName && targetExamName.trim().length > 0;

    const consistency = {
      examStringMatch,
      examIdMatch: !!examIdMatch,
      questionsMatch,
      sessionMatch: examNameMatch
    };

    setExamDataConsistency(consistency);

    const isReady = examStringMatch && examIdMatch && questionsMatch && examNameMatch;

    return isReady;
  }, [exam_string, examId, examOrder]);

  // Enhanced questions setter with validation
  const setQuestionsWithValidation = useCallback((
    newQuestions: Question[],
    forExamString: string,
    forExamId: number,
    forExamName: string
  ) => {
    // Validate that these questions are for the current exam
    const isReady = validateExamReadiness(forExamString, forExamId, newQuestions, forExamName);

    if (isReady) {
      // Set the question IDs for this exam
      const questionIds = new Set(newQuestions.map(q => q.id));
      setCurrentExamQuestionIds(questionIds);
      
      // Set questions for current exam
      setQuestionsForCurrentExam(newQuestions);
      setQuestions(newQuestions);
      setLastLoadedExamString(forExamString);
      setIsQuestionsReady(true);
      setLoading(false);
      setError(false);
    } else {
      // Keep in loading state until proper questions arrive
      setIsQuestionsReady(false);
      setLoading(true);
      
      // Clear any existing questions that don't match
      if (lastLoadedExamString !== forExamString) {
        setQuestions([]);
        setQuestionsForCurrentExam([]);
        setCurrentExamQuestionIds(new Set());
      }
    }
  }, [exam_string, validateExamReadiness, lastLoadedExamString]);

  // Enhanced auto-submit handler with proper final exam handling
  const handleAutoSubmit = useCallback(async (reason = 'time_expired') => {
    if (submissionInProgress.current) return;
    
    submissionInProgress.current = true;
    setIsTimeExpired(true);
    setIsSubmitting(true);
    
    // Stop the Web Worker timer
    stopTimer();
    
    // Always submit to server, but handle scoring based on exam position
    const shouldScore = isLastExam && !nextExam;
    
    const success = await submitToServer(shouldScore);
    
    if (success) {
      // Clear exam data
      await ExamDBService.deleteExamData(exam_string);
      
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

  const onSecurityBreach = useCallback((reason: string, details?: any) => {
    // Only auto-submit on EXTREME security breaches
    if (reason === 'extreme_time_jump' || reason === 'checksum_failed_with_timeout') {
      handleAutoSubmit(`extreme_security_breach_${reason}`);
    }
  }, [handleAutoSubmit]);

  const onValidationFailure = useCallback((reason: string) => {
    // Don't auto-submit on validation failures, just log
  }, []);

  // Memoize timer options to prevent re-initialization
  const timerOptions = useMemo(() => ({
    examId: exam_string || 'default',
    onTimeout: () => {
      handleAutoSubmit('timer_expired');
    },
    onSecurityBreach,
    onValidationFailure
  }), [exam_string, handleAutoSubmit, onSecurityBreach, onValidationFailure]);

  // Initialize secure timer with Web Worker
  const {
    timeLeft,
    elapsed,
    isRunning,
    isValid: timerValid,
    isInitialized: timerInitialized,
    error: timerError,
    backupTimers,
    securityValidation,
    startTimer,
    stopTimer,
    restoreTimer,
    validateIntegrity,
    getBackupTimerValues,
    formatTime,
    isExpired,
    updateNetworkInfo 
  } = useSecureTimer(timerOptions);

  // Stable effect for network info updates
  useEffect(() => {
    // Update secure timer with latest network information from time sync
    updateNetworkInfo({
      latency: networkLatency || 0,
      timezoneOffset: timezoneOffset || 0,
      reliability: reliability || 1.0,
      offsetStdDev: offsetStdDev || 0
    });
  }, [networkLatency, reliability, offsetStdDev, timezoneOffset, updateNetworkInfo]);

  // Exam string change handler with better state management
  useEffect(() => {
    if (exam_string && exam_string !== lastLoadedExamString) {
      // Stop current timer
      stopTimer();
      
      // Enhanced state reset for exam change
      setLoading(true);
      setError(false);
      setSubmitError(false);
      
      // Clear previous exam data immediately
      setQuestions([]);
      setQuestionsForCurrentExam([]);
      setCurrentExamQuestionIds(new Set());
      setIsQuestionsReady(false);
      
      setAnswers({});
      setCurrentQuestion(0);
      setExamSession(null);
      setIsTimeExpired(false);
      setExamName(null);
      setDuration(0);
      
      // Reset access check states
      setIsCheckingExamAccess(true);
      setHasInitialAccessCheck(false);
      setIsExamAccessible(true);
      setShowNotAccessibleModal(false);
      setExamStartTime(null);
      setCountdown("");
      
      // Reset validation states
      setExamDataConsistency({
        examStringMatch: false,
        examIdMatch: false,
        questionsMatch: false,
        sessionMatch: false
      });
      
      // Reset initialization flags
      initializationAttempted.current = false;
      submissionInProgress.current = false;
    }
  }, [exam_string, lastLoadedExamString, questions.length, isQuestionsReady, examDataConsistency, stopTimer]);

  // Stable effect for time jump detection
  useEffect(() => {
    let lastCheckTime = Date.now();
    
    const timeJumpChecker = setInterval(() => {
      const currentTime = Date.now();
      const hasTimeJump = detectTimeJump(currentTime, lastCheckTime);
      
      if (hasTimeJump) {
        validateIntegrity();
        
        // If time sync detects extreme jump, force sync
        const deviation = Math.abs(currentTime - lastCheckTime - 1000);
        if (deviation > 60000) { // 60 seconds - more lenient
          forceSyncNow();
        }
      }
      
      lastCheckTime = currentTime;
    }, 1000);
    
    return () => clearInterval(timeJumpChecker);
  }, [detectTimeJump, validateIntegrity, forceSyncNow]);

  // Use FIXED getServerTime for all time calculations
  const enhancedGetServerTime = useCallback(() => {
    return getServerTime(); // This now returns pure UTC + network offset (no timezone confusion)
  }, [getServerTime]);

  // Stable client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Stable context data sync - IMMEDIATE sync when context changes
  useEffect(() => {
    if (!examContext) return;
    
    // IMMEDIATE synchronization - no delays
    if (contextOriginPath) {
      setOriginPath(contextOriginPath);
    }
    
    if (contextTopicId) {
      setSelectedTopicId(contextTopicId);
    }
    
    if (contextExamType) {
      setExamType(contextExamType);
    }
    
    // Set examScheduleId IMMEDIATELY when context updates
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
        setExamId(currentExam.exam_id);
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

  useEffect(() => {
    return () => {
      // Stop timer
      stopTimer();
      
      // Clear any pending timeouts/intervals
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
      
      // Finalize current question time if needed
      if (exam_string && questions.length > 0) {
        ExamDBService.finalizeCurrentQuestionTime(exam_string).catch(console.error);
      }
    };
  }, [exam_string, questions.length, stopTimer]);

  // Decryption function
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

  // Find latest unfinished exam
  const findLatestUnfinishedExam = useCallback(async () => {
    if (!isClient) return false;
    
    if (!exam_string && examOrder.length > 0) {
      setLoading(true);
      
      for (let i = examOrder.length - 1; i >= 0; i--) {
        const hasData = await ExamDBService.hasExamData(examOrder[i].exam_string);
        
        if (hasData) {
          router.push(`/exam/${examOrder[i].exam_string}`);
          return true;
        }
      }
      setLoading(false);
    }
    return false;
  }, [isClient, examOrder, exam_string, router]);

  // Enhanced loadExistingSession with proper access control
  const loadExistingSession = useCallback(async (currentExamId: number, expectedExamString: string) => {
    if (!isClient || !examScheduleId || !currentExamId) {
      return false;
    }

    // VALIDATION: Ensure we're loading session for the correct exam
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
            exam_id: currentExamId // ALWAYS use the passed exam_id
          },
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
        
      // DOUBLE CHECK: Ensure current exam hasn't changed during API call
      if (expectedExamString !== exam_string) {
        return false;
      }
        
      if (response.data.status === 'success' && response.data.data) {
        const sessionData = response.data.data;
        
        setExamName(sessionData.name);
        
        // Check exam accessibility FIRST before setting up timer
        const serverNow = enhancedGetServerTime();
        const sessionStartTime = new Date(sessionData.start_time).getTime();
        
        if (!sessionData.is_auto_move && serverNow < sessionStartTime) {
          // Set access state and show wait screen WITHOUT loading questions
          setExamStartTime(sessionData.start_time);
          setIsExamAccessible(false);
          setIsCheckingExamAccess(false);
          setHasInitialAccessCheck(true);
          setShowNotAccessibleModal(true);
          setLoading(false); // Stop loading to show wait screen
          
          // Don't proceed with timer setup
          return false;
        }
        
        setIsExamAccessible(true);
        setIsCheckingExamAccess(false);
        setHasInitialAccessCheck(true);
        
        // Set answers
        setAnswers(sessionData.answers || {});
        await ExamDBService.saveAnswers(expectedExamString, sessionData.answers || {});
        
        // Handle question elapsed times
        if (sessionData.question_elapsed_times) {
          const examData = await ExamDBService.getExamData(expectedExamString) || { 
            answers: sessionData.answers || {}, 
            startTime: serverNow, // Use serverNow
            questionElapsedTimes: {},
            lastQuestionVisit: null
          };
          examData.questionElapsedTimes = sessionData.question_elapsed_times;
          const db = await ExamDBService.db;
          await db.put('examData', examData, expectedExamString);
        }
        
        // Proper time calculation with synchronized time
        const endTime = new Date(sessionData.end_time).getTime();
        
        // Both serverNow and endTime are now properly synchronized
        const remainingTime = Math.max(0, Math.floor((endTime - serverNow) / 1000));
        
        if (remainingTime > 0) {
          const startTimerWithRetry = () => {
            if (timerInitialized && expectedExamString === exam_string) {
              const success = startTimer(remainingTime);
              return true;
            }
            return false;
          };
          
          // Try to start immediately
          if (!startTimerWithRetry()) {
            let attempts = 0;
            const maxAttempts = 10;
            
            const waitForTimer = setInterval(() => {
              attempts++;
              
              // Check if exam has changed during retry
              if (expectedExamString !== exam_string) {
                clearInterval(waitForTimer);
                return;
              }
              
              if (startTimerWithRetry()) {
                clearInterval(waitForTimer);
              } else if (attempts >= maxAttempts) {
                clearInterval(waitForTimer);
                
                // Force start with fallback
                if (expectedExamString === exam_string) {
                  try {
                    const success = startTimer(remainingTime);
                  } catch (error) {
                    // Error handling
                  }
                }
              }
            }, 500);
          }
        } else {
          setIsTimeExpired(true);
          handleAutoSubmit('session_expired');
        }
        
        setExamSession(sessionData);
        return true;
        
      } else {
        // Even if no session, still check exam accessibility
        setIsCheckingExamAccess(false);
        setHasInitialAccessCheck(true);
        return false;
      }
    } catch (error) {
      // Set access check complete even on error
      setIsCheckingExamAccess(false);
      setHasInitialAccessCheck(true);
      
      // Fallback: load saved answers (but only if exam hasn't changed)
      if (expectedExamString === exam_string) {
        try {
          const savedAnswers = await ExamDBService.getAnswers(expectedExamString);
          if (savedAnswers) {
            setAnswers(savedAnswers);
          }
        } catch (fallbackError) {
          // Fallback error
        }
      }
      
      return false;
    }
  }, [
    isClient, 
    examScheduleId, 
    exam_string,
    enhancedGetServerTime, 
    timerInitialized, 
    startTimer, 
    handleAutoSubmit,
    timeOffset
  ]);

  // Enhanced fetchQuestions with strict validation and loading control
  const fetchQuestions = useCallback(async () => {
    if (!isClient) {
      return;
    }
    
    if (!exam_string) {
      return;
    }
    
    // Validate that this exam_string exists in examOrder
    const currentExam = examOrder.find((exam) => exam.exam_string === exam_string);
    if (!currentExam) {
      setError(true);
      setLoading(false);
      return;
    }

    // CHECK: Avoid duplicate requests for the same exam
    if (lastLoadedExamString === exam_string && isQuestionsReady && questions.length > 0) {
      return;
    }
    
    // Set examId IMMEDIATELY and SYNCHRONOUSLY
    setExamId(currentExam.exam_id);
    setExamName(currentExam.name);
    
    try {
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

      // CHECK: Ensure exam hasn't changed during API call
      if (exam_string !== (params?.exam_string as string)) {
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

      // FINAL CHECK: Ensure exam is still the same
      if (exam_string !== (params?.exam_string as string)) {
        return;
      }
      
      // Set duration first
      setDuration(parsedData.duration);
      
      // Use validation-based question setter
      setQuestionsWithValidation(
        parsedData.questions,
        exam_string,
        currentExam.exam_id,
        currentExam.name
      );
      
      // Load session ONLY after questions are set AND accessibility is confirmed
      if (validateExamReadiness(exam_string, currentExam.exam_id, parsedData.questions, currentExam.name)) {
        try {
          const sessionLoaded = await loadExistingSession(currentExam.exam_id, exam_string);
          
          // If session loading indicated exam is not accessible, stop here
          if (!isExamAccessible && hasInitialAccessCheck) {
            return;
          }
          
          if (!sessionLoaded && isExamAccessible) {
            if (parsedData.duration > 0 && timerInitialized && exam_string === (params?.exam_string as string)) {
              const timerDuration = parsedData.duration * 60;
              const success = startTimer(timerDuration);
            }
          }
        } catch (sessionError) {
          // Only start fresh timer if exam is accessible
          if (isExamAccessible && parsedData.duration > 0 && timerInitialized && exam_string === (params?.exam_string as string)) {
            const timerDuration = parsedData.duration * 60;
            const success = startTimer(timerDuration);
          }
        }
      }
      
    } catch (error) {
      setError(true);
      setLoading(false);
      setIsQuestionsReady(false);
    }
  }, [
    isClient, 
    exam_string,
    examOrder,
    examScheduleId,
    examId,
    lastLoadedExamString,
    isQuestionsReady,
    questions.length,
    params?.exam_string,
    hasInitialAccessCheck,
    isExamAccessible,
    setQuestionsWithValidation,
    validateExamReadiness,
    loadExistingSession, 
    timerInitialized, 
    startTimer
  ]);

  // Save exam session
  const saveExamSession = useCallback(async () => {
    if (!isClient) return false;
    
    setAutoSaving(true);
    
    try {
      const axios = (await import('axios')).default;
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      const questionElapsedTimes = await ExamDBService.getQuestionElapsedTimes(exam_string);
      
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
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      setAutoSaving(false);
      setShowCheckpointToast(true);
      return true;
    } catch (error) {
      setAutoSaving(false);
      return false;
    }
  }, [isClient, exam_string, examScheduleId, examId, answers]);

  // Enhanced submit to server with proper final exam handling
  const submitToServer = useCallback(async (shouldScore = false): Promise<boolean> => {
    if (!isClient) return false;
    
    setSubmitLoading(true);
    setSubmitError(false);
    
    try {
      console.log('🔍 Current examOrder in context:', examOrder);
      
      const currentExam = examOrder.find(exam => exam.exam_string === exam_string);
      if (!currentExam) {
        console.error('🚨 Current exam not found in examOrder for exam_string:', exam_string);
        throw new Error('Current exam not found');
      }
      
      if (!currentExam.exam_id) {
        console.error('🚨 Exam ID missing for exam:', currentExam);
        throw new Error('Exam ID missing');
      }
      
      const examIdToSubmit = currentExam.exam_id;

      // Fetch the latest answers from ExamDBService
      const savedAnswers = await ExamDBService.getAnswers(exam_string) || answers;
      const finalElapsedTimes = await ExamDBService.finalizeCurrentQuestionTime(exam_string, elapsed);

      const axios = (await import('axios')).default;
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      console.log('📤 Submitting to server:', {
      exam_string,
      examIdToSubmit,
      savedAnswers,
      finalElapsedTimes
    });


      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/examSession/submit`,
        { 
          exam_schedule_id: examScheduleId,
          exam_id: examIdToSubmit,
          answers: savedAnswers,
          question_elapsed_times: finalElapsedTimes
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
                Authorization: `Bearer ${authToken}`
              }
            }
          );
        } catch (error) {
          // Error handling
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
          // Score error handling
        }
      }
  
      setSubmitLoading(false);
      return true;
    } catch (error) {
      setSubmitLoading(false);
      setSubmitError(true);
      return false;
    }
    }, [isClient, exam_string, examScheduleId, examId, answers, isLastExam, selectedTopicId,examOrder]);

  // Handle change
  const handleChange = useCallback(async (id: number, value: any) => {
    // VALIDATION: Only allow changes for current exam's questions
    if (!currentExamQuestionIds.has(id)) {
      return;
    }

    const updatedAnswers = {
      ...answers,
      [id]: value
    };
    setAnswers(updatedAnswers);
    await ExamDBService.saveAnswers(exam_string, updatedAnswers);
  }, [answers, exam_string, currentExamQuestionIds]);

  // Handle true/false change
  const handleTrueFalseChange = useCallback(async (id: number, index: number, value: any) => {
    // VALIDATION: Only allow changes for current exam's questions
    if (!currentExamQuestionIds.has(id)) {
      return;
    }

    const updatedAnswers = [...(answers[id] || [])];
    updatedAnswers[index] = value;
    const newAnswers = {
      ...answers,
      [id]: updatedAnswers
    };
    setAnswers(newAnswers);
    await ExamDBService.saveAnswers(exam_string, newAnswers);
  }, [answers, exam_string, currentExamQuestionIds]);

  // Utility functions
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

  // Enhanced handleNextExam with proper final exam handling
  const handleNextExam = useCallback(async () => {
    if (nextExam && !isLastExam) {
      const nextExamString = examOrder[currentExamIndex + 1].exam_string;
      
      // Close modal first
      setShowModalNext(false);
      
      // Stop current timer before navigation
      stopTimer();
      
      // Clear current exam data from IndexedDB
      try {
        await ExamDBService.deleteExamData(exam_string);
      } catch (error) {
        // Error handling
      }
      
      // Enhanced state reset before navigation
      setLoading(true);
      setError(false);
      setSubmitError(false);
      setQuestions([]);
      setQuestionsForCurrentExam([]);
      setCurrentExamQuestionIds(new Set());
      setIsQuestionsReady(false);
      setAnswers({});
      setCurrentQuestion(0);
      setExamSession(null);
      setIsTimeExpired(false);
      setExamName(null);
      setDuration(0);
      setIsInitializing(false);
      setLastLoadedExamString(null);
      
      // Reset validation states
      setExamDataConsistency({
        examStringMatch: false,
        examIdMatch: false,
        questionsMatch: false,
        sessionMatch: false
      });
      
      // Reset refs
      initializationAttempted.current = false;
      submissionInProgress.current = false;
      
      // Small delay to ensure state is reset before navigation
      setTimeout(() => {
        router.push(`/exam/${nextExamString}`);
      }, 100);
      
    } else {
      // Close any open modals
      setShowModalNext(false);
      setShowFinalCompletionModal(false);
      
      // Stop timer
      stopTimer();
      
      // Clear all exam data
      if (clearExamData) {
        clearExamData();
      }
      
      // Navigate to origin or default to /try-out
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
    stopTimer
  ]);

  // Handle retry submit
  const handleRetrySubmit = () => {
    handleAutoSubmit('retry');
  };

  // Handle navigation
  const handleNavigation = useCallback(async (index: number) => {
    if (questions.length === 0 || currentQuestion >= questions.length) return;
    
    if (exam_string && questions[currentQuestion] && questions[currentQuestion].id) {
      await ExamDBService.updateQuestionElapsedTime(exam_string, questions[currentQuestion].id);
    }
    
    setCurrentQuestion(index);
  }, [questions, currentQuestion, exam_string]);

  // Check if answered
  const isAnswered = (id: number) => {
    return answers[id] !== undefined && isAnswerFilled(answers[id]);
  };

  // Handle close
  const handleClose = useCallback(async () => {
    stopTimer();
    if (clearExamData) clearExamData();
    router.push(originPath || '/try-out');
  }, [stopTimer, clearExamData, router, originPath]);

  // Handle retry access with proper timezone handling
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
            exam_id: examId
          },
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      
      if (response.data.status === 'success' && response.data.data) {
        const sessionData = response.data.data;
        
        // Use enhancedGetServerTime() for time comparison
        const serverNow = enhancedGetServerTime();
        const sessionStartTime = new Date(sessionData.start_time).getTime();
        
        if (!sessionData.is_auto_move && serverNow >= sessionStartTime) {
          setShowNotAccessibleModal(false);
          setIsExamAccessible(true);
          setIsCheckingExamAccess(true);
          setLoading(true);
          
          // Fetch questions since exam is now accessible
          fetchQuestions();
        } else {
          setExamStartTime(sessionData.start_time);
          setIsExamAccessible(false);
        }
      }
    } catch (error) {
      // Fallback: check if examStartTime is past current server time
      if (examStartTime) {
        const serverNow = enhancedGetServerTime();
        const startTime = new Date(examStartTime).getTime();
        
        if (serverNow >= startTime) {
          setIsExamAccessible(true);
          setShowNotAccessibleModal(false);
          setIsCheckingExamAccess(true);
          setLoading(true);
          fetchQuestions();
        }
      }
    }
  }, [isClient, examScheduleId, examId, enhancedGetServerTime, examStartTime, fetchQuestions]);

  // Render question
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

  

  // Di dalam ExamProvider (context/ExamContext.tsx)
  useEffect(() => {
    console.log('📝 ExamContext: examOrder updated:', {
      count: examOrder.length,
      data: examOrder.map(exam => ({
        exam_string: exam.exam_string,
        exam_id: exam.exam_id,
        name: exam.name
      }))
    });
  }, [examOrder]);

  // Question elapsed time tracking
  useEffect(() => {
    if (!isClient || loading || questions.length === 0 || currentQuestion >= questions.length || !isRunning) return;
    
    const currentQuestionData = questions[currentQuestion];
    if (!currentQuestionData || !currentQuestionData.id) {
      return;
    }
    
if (exam_string && Number.isFinite(elapsed)) {
    console.log('⏱ Updating question elapsed time:', { exam_string, questionId: currentQuestionData.id, elapsed });
    ExamDBService.updateQuestionElapsedTime(exam_string, currentQuestionData.id, elapsed).catch(err => {
      console.error('🚨 Error updating question elapsed time:', err);
    });
  } else {
    console.warn('⚠ Skipping updateQuestionElapsedTime due to invalid elapsed:', { elapsed, isRunning });
  }
  }, [isClient, loading, questions, currentQuestion, exam_string,elapsed, isRunning]);

  // Cleanup effect
  useEffect(() => {
    if (!isClient) return;
    
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      
      if (exam_string && questions.length > 0 && isRunning && Number.isFinite(elapsed)) {
      console.log('⏱ Finalizing question elapsed time:', { exam_string, elapsed });
      ExamDBService.finalizeCurrentQuestionTime(exam_string, elapsed).catch(err => {
        console.error('🚨 Error finalizing question elapsed time:', err);
      });
    } else {
      console.warn('⚠ Skipping finalizeCurrentQuestionTime:', { exam_string, questionsLength: questions.length, isRunning, elapsed });
    }
    };
  }, [isClient, exam_string, questions, elapsed, isRunning]);

  useEffect(() => {
  if (!isClient || !exam_string || !examScheduleId || examOrder.length === 0) return;

  const initExam = async () => {
    try {
      setIsInitializing(true);

      // Fetch saved answers from ExamDBService
      const savedAnswers = await ExamDBService.getAnswers(exam_string);
      if (savedAnswers) {
        setAnswers(savedAnswers);
      }

      await fetchQuestions();
    } catch (error) {
      setError(true);
      setLoading(false);
      setIsQuestionsReady(false);
    } finally {
      setIsInitializing(false);
    }
  };

  if (lastLoadedExamString !== exam_string || !isQuestionsReady || !hasInitialAccessCheck) {
    initExam();
  }
}, [
  isClient,
  exam_string,
  examScheduleId,
  examOrder.length,
  lastLoadedExamString,
  isQuestionsReady,
  hasInitialAccessCheck,
  fetchQuestions
]);

  // Countdown effect for exam access with proper timezone handling
  useEffect(() => {
    if (!isClient || isExamAccessible || !examStartTime) return;
    
    const timer = setInterval(() => {
      // Use enhancedGetServerTime() for countdown
      const now = enhancedGetServerTime();
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
  }, [isClient, isExamAccessible, examStartTime, enhancedGetServerTime, handleRetryAccess]);

  // Enhanced loading state validation
  useEffect(() => {
    // Enhanced condition for loading state
    if (loading && isQuestionsReady && questions.length > 0 && isClient && exam_string && examScheduleId && hasInitialAccessCheck) {
      // Double check that questions belong to current exam
      const currentExam = examOrder.find(exam => exam.exam_string === exam_string);
      if (currentExam && examDataConsistency.examIdMatch && examDataConsistency.questionsMatch && isExamAccessible) {
        setLoading(false);
      }
    }
  }, [
    loading, 
    isInitializing, 
    questions.length, 
    isQuestionsReady,
    isClient, 
    exam_string, 
    examScheduleId, 
    contextExamScheduleId,
    timerInitialized,
    timerError,
    examDataConsistency,
    lastLoadedExamString,
    examOrder,
    isCheckingExamAccess,
    hasInitialAccessCheck,
    isExamAccessible
  ]);

  // Auto-save effect
  useEffect(() => {
    if (!isClient || loading || !isRunning || timeLeft <= 0 || timeLeft % 120 !== 0) return;
    
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }
    
    autoSaveRef.current = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        saveExamSession();
      }
    }, 1000);

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [isClient, loading, answers, timeLeft, isRunning, saveExamSession]);

  // Main initialization effect
  useEffect(() => {
    if (!isClient) {
      return;
    }
    
    if (!exam_string) {
      return;
    }
    
    // Wait for examScheduleId to be available (from context sync)
    if (!examScheduleId) {
      return;
    }
    
    if (examOrder.length === 0) {
      return;
    }

    // Check if we already have valid questions for this exam
    if (lastLoadedExamString === exam_string && isQuestionsReady && questions.length > 0 && hasInitialAccessCheck) {
      return;
    }
    
    // Prevent multiple initialization attempts for the SAME exam
    const initKey = `${exam_string}-${examScheduleId}`;
    if (initializationAttempted.current === initKey) {
      return;
    }
    
    initializationAttempted.current = initKey; // Store unique key instead of boolean
    
    setIsInitializing(true);
    
    const initExam = async () => {
      try {
        await fetchQuestions();
      } catch (error) {
        setError(true);
        setLoading(false);
        setIsQuestionsReady(false);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initExam();
  }, [
    isClient, 
    exam_string, 
    examScheduleId,
    examOrder.length,
    lastLoadedExamString,
    isQuestionsReady,
    questions.length,
    hasInitialAccessCheck,
    fetchQuestions
  ]);

  // Retry on error
  useEffect(() => {
    if (!isClient || !error || isInitializing) return;
    
    const retryTimeout = setTimeout(() => {
      initializationAttempted.current = false; // Reset for retry
      setIsQuestionsReady(false);
      setLastLoadedExamString(null);
      setHasInitialAccessCheck(false);
      fetchQuestions();
    }, 5000);

    return () => clearTimeout(retryTimeout);
  }, [isClient, error, isInitializing, fetchQuestions]);

  // Enhanced loading screen with access check status
  if (!isClient || loading || isInitializing || !isQuestionsReady || isCheckingExamAccess) {
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">
            {isCheckingExamAccess ? 'Checking Exam Access...' : 
             isInitializing ? 'Initializing Exam...' : 
             !isQuestionsReady ? 'Validating Questions...' : 'Loading Exam...'}
          </h2>
          <p className="tw-text-violet-600 tw-mt-2">
            {isCheckingExamAccess ? 'Verifying exam schedule and accessibility...' :
             !isQuestionsReady ? 'Ensuring questions match current exam...' : 
             'Please wait while we prepare your questions'}
          </p>
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
          <p className="tw-text-gray-600 tw-mt-2">We'll automatically retry in a few seconds...</p>
          <Button 
            variant="primary" 
            className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-mt-4"
            onClick={() => {
              initializationAttempted.current = false;
              setIsQuestionsReady(false);
              setLastLoadedExamString(null);
              setHasInitialAccessCheck(false);
              fetchQuestions();
            }}
          >
            Retry Now
          </Button>
        </div>
      </div>
    );
  }
  
  // Show waiting screen ONLY when exam is not accessible
  if (!isExamAccessible && hasInitialAccessCheck) {
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
      {/* Enhanced Hidden Timer Validator */}
      <HiddenTimerValidator 
        workerTimerValues={{
          ...getBackupTimerValues(),
          timeSync: {
            offset: timeOffset,
            reliability: reliability,
            syncCount: syncCount,
            networkLatency: networkLatency
          }
        }}
        onSecurityBreach={() => {
          handleAutoSubmit('extreme_security_breach');
        }}
      />

      {/* Enhanced Focus Detector with network-aware thresholds */}
      <FocusDetector 
        onAutoSubmit={handleAutoSubmit}
        enabled={!loading && !error && isExamAccessible && questions.length > 0 && !isSubmitting && isQuestionsReady}
        timerRunning={isRunning}
      />

      <ChangeTabPrevention 
        onAutoSubmit={() => handleAutoSubmit('tab_change')}
        enabled={!loading && !error && isExamAccessible && questions.length > 0 && isQuestionsReady}
      >
        <div className="tw-min-h-screen tw-bg-violet-50">
          {/* Enhanced Header with integrated time sync and timer info */}
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
                    {isRunning && <Activity size={16} className="tw-text-green-400 tw-animate-pulse" />}
                    {isOnline ? <Wifi size={16} className="tw-text-green-400" /> : <WifiOff size={16} className="tw-text-red-400" />}
                    {isQuestionsReady && <Check size={16} className="tw-text-green-400" />}
                  </div>
                  <div className="tw-flex tw-flex-col tw-items-start">
                    <span className="tw-text-violet-200 tw-text-sm">Time Remaining</span>
                    <span className="tw-text-3xl tw-font-mono tw-font-bold">{formatTime(timeLeft)}</span>
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
                <strong className="tw-mr-auto">Checkpoint Saved</strong>
              </Toast.Header>
              <Toast.Body className="tw-text-violet-700">
                Your answers have been saved to the server.
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
                    {questions.length > 0 && currentQuestion < questions.length && isQuestionsReady ? (
                      <>
                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
                          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">
                            Question {currentQuestion + 1} of {questions.length}
                          </h2>
                          <div className="tw-flex tw-items-center tw-gap-2">
                            {autoSaving && (
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
                          {!isQuestionsReady ? 'Validating questions for current exam...' : 'No questions available'}
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Enhanced Right Sidebar */}
              <Col lg={4} className="tw-hidden md:tw-block">
                <Card className="tw-shadow-md tw-border-0 tw-rounded-xl tw-sticky tw-top-4">
                  <Card.Body className="tw-p-4">
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                      <h3 className="tw-text-lg tw-font-semibold tw-text-violet-800">Question Navigator</h3>
                    </div>
                    {questions.length > 0 && isQuestionsReady ? (
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

                        {/* Enhanced Timer Display */}
                        <div className="tw-bg-violet-50 tw-p-3 tw-rounded-lg tw-mb-4">
                          <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                            <span className="tw-text-sm tw-font-medium tw-text-violet-800">Timer Status</span>
                            <div className="tw-flex tw-items-center tw-gap-1">
                              {timerValid && <Shield className="tw-text-green-600" size={14} />}
                              {isRunning && <Activity className="tw-text-blue-600 tw-animate-pulse" size={14} />}
                              {getBackupTimerValues().fallbackActive && <AlertCircle className="tw-text-yellow-600" size={14} />}
                              {isQuestionsReady && <Check className="tw-text-green-600" size={14} />}
                              {isLastExam && <span className="tw-text-orange-600 tw-text-xs">🏁</span>}
                            </div>
                          </div>
                          <p className="tw-text-lg tw-font-mono tw-font-bold tw-text-violet-700">
                            {formatTime(timeLeft)}
                          </p>
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
                        <p>{!isQuestionsReady ? 'Validating questions...' : 'No questions loaded'}</p>
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
              {questions.length > 0 && isQuestionsReady ? (
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
                  <p>{!isQuestionsReady ? 'Validating questions...' : 'No questions available'}</p>
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
                    <span className="tw-font-medium">Time Remaining:</span> {formatTime(timeLeft)}
                  </p>
                  {isLastExam && (
                    <p className="tw-text-orange-700 tw-mb-2 tw-font-medium">
                      📋 This is your final exam section. Results will be processed after submission.
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
                    🎉 Exam Session Completed!
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
                      🌟 Congratulations! You have successfully completed your entire exam session.
                    </p>
                    <div className="tw-bg-gradient-to-r tw-from-green-50 tw-to-blue-50 tw-p-4 tw-rounded-lg tw-mb-4">
                      <div className="tw-flex tw-items-center tw-mb-2">
                        <FileCheck className="tw-text-green-600 tw-mr-2" size={18} />
                        <span className="tw-font-medium tw-text-green-800">Final Results</span>
                      </div>
                      <p className="tw-text-green-700 tw-mb-2">
                        ✅ All exam sections have been submitted successfully
                      </p>
                      <p className="tw-text-green-700 tw-mb-2">
                        📊 Your answers are being processed for scoring
                      </p>
                      <p className="tw-text-blue-700 tw-font-medium">
                        🏆 Results will be available on your dashboard shortly
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

// Main ChainExam Component with All Providers and Enhanced Context Management
const ChainExam: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [examDuration, setExamDuration] = useState<number>(0);
  const [mainTimer, setMainTimer] = useState<number>(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Callback untuk menerima timer updates dari ExamContent
  const handleTimerUpdate = useCallback((currentTime: number) => {
    setMainTimer(currentTime);
    setExamDuration(currentTime);
  }, []);

  if (!isClient) {
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">Initializing Exam System...</h2>
          <p className="tw-text-violet-600 tw-mt-2">Please wait while we prepare the timer and validation system</p>
        </div>
      </div>
    );
  }

  return (
    <UserPurchaseProvider 
      examDuration={mainTimer} 
      onSecurityBreach={() => {
        // Security breach handler
      }}
    >
      <ActiveUserProvider 
        examDuration={mainTimer}
        onSecurityBreach={() => {
          // Security breach handler
        }}
      >
        <AllProductProvider 
          examDuration={mainTimer}
          onSecurityBreach={() => {
            // Security breach handler
          }}
        >
          <ExamContent />
        </AllProductProvider>
      </ActiveUserProvider>
    </UserPurchaseProvider>
  );
};

export default ChainExam;