// ChainExam Component - FIXED HOOKS COMPLIANCE & CONTEXT SYNC
'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import CryptoJS from 'crypto-js';
import ChangeTabPrevention from '../../components/ChangeTabPrevention';
import { useDistributedTimeSync } from '../../hooks/useDistributedTimeSync';
import { useSecureTimer } from '../../hooks/useSecureTimer';
import { useExam } from '../../context/ExamContext'; // FIXED: Import at top level
import { useAuth } from '../../context/AuthContext'; // FIXED: Import at top level
import ExamDBService from '../../utils/ExamDBService'; // FIXED: Import at top level

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
import { Clock, Loader2, Check, AlertCircle, FileCheck, ArrowRight, Eye, EyeOff, Shield, ShieldAlert, Activity, Wifi, WifiOff } from 'lucide-react';

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
        
        // Rate limiting - validate every 3-5 minutes (even less frequent)
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
        
        // FIXED: Even more lenient validation - only trigger on EXTREME discrepancies
        const isValid = 
          validationResult.isValid &&
          validationResult.confidence >= 0.3 && // Even lower threshold
          purchaseValid &&
          userActivityValid &&
          inventoryValid &&
          workerValid &&
          maxDeviation <= 300; // Allow up to 5 minutes deviation
        
        if (!isValid) {
          // FIXED: Only log warning, don't auto-submit unless EXTREME deviation
          console.warn('⚠️ Timer validation warning (not critical):', {
            mainTimer,
            maxDeviation,
            confidence: validationResult.confidence
          });
          
          // FIXED: Only trigger auto-submit if deviation is EXTREME (>10 minutes)
          if (maxDeviation > 600 || validationResult.confidence < 0.1) {
            console.error('🚨 EXTREME timer discrepancy detected - auto-submit triggered');
            onSecurityBreach();
          }
        } else {
          console.log('✅ Timer validation passed', {
            deviation: maxDeviation,
            confidence: validationResult.confidence
          });
        }
        
      } catch (error) {
        console.error('Timer validation error:', error);
        // FIXED: Don't auto-submit on validation errors, just log
      }
    };
    
    // FIXED: Even less frequent validation - every 3-5 minutes
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
      console.log(`🔄 Visibility changed: ${isVisible ? 'visible' : 'hidden'}`);
      setIsPageVisible(isVisible);
      
      if (isVisible) {
        // Reset when page becomes visible
        console.log('🎯 Page refocused - Reset warning');
        lastFocusTime.current = Date.now();
        setFocusWarningTime(0);
        setShowWarning(false);
        
        if (focusTimeoutRef.current) {
          clearTimeout(focusTimeoutRef.current);
          focusTimeoutRef.current = null;
        }
      } else {
        // Start countdown when page loses focus - increased to 15 seconds
        console.log('👁️ Page unfocused - Starting 15 second countdown');
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
          console.log('🚨 Auto-submit triggered: Page unfocused for 15 seconds');
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

// Security Status Display
const SecurityStatusDisplay: React.FC<{
  securityValidation: any;
  timerState: any;
}> = React.memo(({ securityValidation, timerState }) => {
  const getSecurityColor = () => {
    if (!securityValidation.consistent || !securityValidation.backupValid || !timerState.isValid) {
      return 'danger';
    }
    if (!securityValidation.heartbeatActive || !securityValidation.checksumValid) {
      return 'warning';
    }
    return 'success';
  };
  
  const getSecurityIcon = () => {
    const color = getSecurityColor();
    if (color === 'danger') return <ShieldAlert className="tw-text-red-600" size={16} />;
    if (color === 'warning') return <Shield className="tw-text-yellow-600" size={16} />;
    return <Shield className="tw-text-green-600" size={16} />;
  };
  
  const getSecurityText = () => {
    const color = getSecurityColor();
    if (color === 'danger') return 'Security Alert';
    if (color === 'warning') return 'Security Warning';
    return 'Security OK';
  };
  
  return (
    <div className="tw-fixed tw-top-4 tw-left-4 tw-z-40">
      <div className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-p-3 tw-border tw-max-w-xs">
        <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
          {getSecurityIcon()}
          <span className="tw-font-semibold tw-text-sm">{getSecurityText()}</span>
        </div>
        
        <div className="tw-space-y-1 tw-text-xs">
          <div className="tw-flex tw-items-center tw-gap-2">
            <div className={`tw-w-2 tw-h-2 tw-rounded-full ${securityValidation.consistent ? 'tw-bg-green-500' : 'tw-bg-red-500'}`} />
            <span>Timer Consistency</span>
          </div>
          <div className="tw-flex tw-items-center tw-gap-2">
            <div className={`tw-w-2 tw-h-2 tw-rounded-full ${securityValidation.backupValid ? 'tw-bg-green-500' : 'tw-bg-red-500'}`} />
            <span>Backup Validation</span>
          </div>
          <div className="tw-flex tw-items-center tw-gap-2">
            <div className={`tw-w-2 tw-h-2 tw-rounded-full ${securityValidation.heartbeatActive ? 'tw-bg-green-500' : 'tw-bg-red-500'}`} />
            <span>Worker Heartbeat</span>
          </div>
          <div className="tw-flex tw-items-center tw-gap-2">
            <div className={`tw-w-2 tw-h-2 tw-rounded-full ${timerState.isValid ? 'tw-bg-green-500' : 'tw-bg-red-500'}`} />
            <span>Timer Integrity</span>
          </div>
        </div>
        
        <Badge bg={getSecurityColor()} className="tw-mt-2 tw-text-xs">
          {timerState.fallbackActive ? 'Fallback Mode' : 'Worker Timer Active'}
        </Badge>
      </div>
    </div>
  );
});

SecurityStatusDisplay.displayName = 'SecurityStatusDisplay';

// Main Exam Component - FIXED: All hooks at top level
const ExamContent: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  
  // FIXED: All hooks at TOP LEVEL - no conditional hooks
  const params = useParams();
  const router = useRouter();
  
  // FIXED: Context hooks at top level
  const examContext = useExam();
  const authContext = useAuth();
  
  // FIXED: Memoize the exam_string to prevent re-initialization loops
  const exam_string = useMemo(() => params?.exam_string as string, [params?.exam_string]);

  // FIXED: Initialize distributed time sync with stable config (memoized)
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
  
  // FIXED: All state initialization at top level
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

  const autoSaveRef = useRef<NodeJS.Timeout>();
  const submissionInProgress = useRef<boolean>(false);
  const initializationAttempted = useRef<boolean>(false);

  // FIXED: Get context data safely with proper checks
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

  // FIXED: Safe username extraction
  const { username, id: userId } = authContext || { username: null, id: null };

  // FIXED: Stable exam order
  const examOrder = useMemo(() => contextExamOrder || [], [contextExamOrder]);
  const currentExamIndex = useMemo(() => 
    examOrder.findIndex((exam: ExamOrder) => exam.exam_string === exam_string),
    [examOrder, exam_string]
  );

  // FIXED: Stable timer configuration with memoized callbacks
  const handleAutoSubmit = useCallback(async (reason = 'time_expired') => {
    if (submissionInProgress.current) return;
    
    submissionInProgress.current = true;
    setIsTimeExpired(true);
    setIsSubmitting(true);
    
    console.log(`🚨 Auto-submit triggered: ${reason}`);
    
    // Stop the Web Worker timer
    stopTimer();
    
    // Submit to server immediately
    const shouldScore = !nextExam;
    const success = await submitToServer(shouldScore);
    
    if (success) {
      // Clear exam data
      await ExamDBService.deleteExamData(exam_string);
      
      // Determine next action
      const nextExamIndex = currentExamIndex + 1;
      const hasNextExam = nextExamIndex < examOrder.length;
      
      if (hasNextExam) {
        setNextExam(examOrder[nextExamIndex]?.name || null);
        setShowModalNext(true);
      } else {
        // No more exams, go back to home
        if (clearExamData) clearExamData();
        router.push(originPath || '/');
      }
    } else {
      setSubmitError(true);
      setShowModalNext(true);
    }
    
    setIsSubmitting(false);
    submissionInProgress.current = false;
  }, [nextExam, currentExamIndex, examOrder, clearExamData, router, originPath, exam_string]);

  const onSecurityBreach = useCallback((reason: string, details?: any) => {
    // FIXED: Only auto-submit on EXTREME security breaches
    if (reason === 'extreme_time_jump' || reason === 'checksum_failed_with_timeout') {
      console.error('🚨 EXTREME security breach - auto-submit:', reason, details);
      handleAutoSubmit(`extreme_security_breach_${reason}`);
    } else {
      console.warn('⚠️ Security warning logged (no auto-submit):', reason, details);
    }
  }, [handleAutoSubmit]);

  const onValidationFailure = useCallback((reason: string) => {
    // FIXED: Don't auto-submit on validation failures, just log
    console.warn('⚠️ Timer validation issue (no auto-submit):', reason);
  }, []);

  // FIXED: Memoize timer options to prevent re-initialization
const timerOptions = useMemo(() => ({
  examId: exam_string || 'default',
  onTimeout: () => {
    console.log('🚨 Timer timeout callback triggered');
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

  // FIXED: Stable effect for network info updates
  useEffect(() => {
    // Update secure timer with latest network information from time sync
    updateNetworkInfo({
      latency: networkLatency || 0,
      timezoneOffset: timezoneOffset || 0,
      reliability: reliability || 1.0,
      offsetStdDev: offsetStdDev || 0
    });
    
    console.log('🔗 Network sync integration updated:', {
      latency: Math.round(networkLatency || 0) + 'ms',
      reliability: Math.round((reliability || 1.0) * 100) + '%',
      timezoneOffset: Math.round((timezoneOffset || 0) / 1000 / 60) + 'min',
      offsetStdDev: Math.round(offsetStdDev || 0) + 'ms'
    });
  }, [networkLatency, reliability, offsetStdDev, timezoneOffset, updateNetworkInfo]);


  useEffect(() => {
  console.log('🔄 Exam string changed, resetting component state:', {
    newExamString: exam_string,
    previousState: {
      loading,
      questions: questions.length,
      currentQuestion,
      isRunning
    }
  });

  if (exam_string) {
    // Stop current timer
    console.log('⏹️ Stopping current timer for exam change');
    stopTimer();
    
    // Reset all exam-specific state
    console.log('🔄 Resetting exam state for new exam');
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
    
    // Reset initialization flags
    initializationAttempted.current = false;
    submissionInProgress.current = false;
    
    console.log('✅ Component state reset completed for exam:', exam_string);
  }
}, [exam_string, stopTimer]); // Key dependency on exam_string


  // FIXED: Stable effect for time jump detection
  useEffect(() => {
    let lastCheckTime = Date.now();
    
    const timeJumpChecker = setInterval(() => {
      const currentTime = Date.now();
      const hasTimeJump = detectTimeJump(currentTime, lastCheckTime);
      
      if (hasTimeJump) {
        console.warn('🚨 Time jump detected by distributed sync - validating timer integrity');
        validateIntegrity();
        
        // If time sync detects extreme jump, force sync
        const deviation = Math.abs(currentTime - lastCheckTime - 1000);
        if (deviation > 60000) { // 60 seconds - more lenient
          console.log('🔄 Extreme time jump - forcing sync and timer validation');
          forceSyncNow();
        }
      }
      
      lastCheckTime = currentTime;
    }, 1000);
    
    return () => clearInterval(timeJumpChecker);
  }, [detectTimeJump, validateIntegrity, forceSyncNow]);

  const enhancedGetServerTime = useCallback(() => {
    return getServerTime(); // This now includes all compensations from time sync
  }, [getServerTime]);

  // FIXED: Stable client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // FIXED: Stable context data sync - IMMEDIATE sync when context changes
  useEffect(() => {
    if (!examContext) return;
    
    console.log('🔄 Context data changed, syncing to component state:', {
      contextExamScheduleId,
      contextTopicId,
      contextExamType,
      contextOriginPath,
      examOrderLength: examOrder.length
    });
    
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
    
    // CRITICAL: Set examScheduleId IMMEDIATELY when context updates
    if (contextExamScheduleId) {
      const scheduleIdStr = contextExamScheduleId.toString();
      console.log('✅ IMMEDIATELY setting examScheduleId from context:', scheduleIdStr);
      setExamScheduleId(scheduleIdStr);
    }
    
    if (contextActiveSession) {
      setExamSession(contextActiveSession);
    }
    
    if (examOrder.length > 0 && exam_string) {
      const currentExam = examOrder.find(exam => exam.exam_string === exam_string);
      
      if (currentExam && currentExam.exam_id) {
        console.log('✅ Setting examId from examOrder:', currentExam.exam_id);
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
    console.log('🧹 ChainExam component unmounting, cleaning up...');
    
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

  // FIXED: Load existing session WITH better debug and error handling
const loadExistingSession = useCallback(async (currentExamId?: number) => {
  console.log('🔄 loadExistingSession called:', {
    isClient,
    currentExamId,
    examId,
    examScheduleId,
    timerInitialized // Add this to debug
  });
  
  if (!isClient) {
    console.log('❌ loadExistingSession: Prerequisites not met');
    return false;
  }
  
  const examIdToUse = currentExamId || examId;
  
  if (!examScheduleId || !examIdToUse) {
    console.log('❌ loadExistingSession: Missing IDs', { examScheduleId, examIdToUse });
    return false;
  }
  
  console.log('🔄 loadExistingSession: Starting API call...');
  
  try {
    const axios = (await import('axios')).default;
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/examSession/active`,
      {
        params: {
          exam_schedule_id: examScheduleId,
          exam_id: examIdToUse
        },
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
      
    console.log('✅ loadExistingSession API response:', response.data.status);
      
    if (response.data.status === 'success' && response.data.data) {
      const sessionData = response.data.data;
      
      console.log('✅ Session data loaded:', {
        name: sessionData.name,
        isAutoMove: sessionData.is_auto_move,
        startTime: sessionData.start_time,
        endTime: sessionData.end_time
      });
      
      setExamName(sessionData.name);
      
      // Check accessibility
      const serverNow = enhancedGetServerTime();
      const sessionStartTime = new Date(sessionData.start_time).getTime();
      
      if (!sessionData.is_auto_move && serverNow < sessionStartTime) {
        console.log('⏰ Exam not yet accessible');
        setExamStartTime(sessionData.start_time);
        setShowNotAccessibleModal(true);
        setIsExamAccessible(false);
        return false;
      }
      
      console.log('✅ Exam is accessible');
      setIsExamAccessible(true);
      
      // Set answers
      setAnswers(sessionData.answers || {});
      await ExamDBService.saveAnswers(exam_string, sessionData.answers || {});
      
      // Handle question elapsed times
      if (sessionData.question_elapsed_times) {
        const examData = await ExamDBService.getExamData(exam_string) || { 
          answers: sessionData.answers || {}, 
          startTime: enhancedGetServerTime(),
          questionElapsedTimes: {},
          lastQuestionVisit: null
        };
        examData.questionElapsedTimes = sessionData.question_elapsed_times;
        const db = await ExamDBService.db;
        await db.put('examData', examData, exam_string);
      }
      
      // Calculate remaining time
      const endTime = new Date(sessionData.end_time).getTime();
      const remainingTime = Math.max(0, Math.floor((endTime - serverNow) / 1000));
      
      console.log('⏱️ Time calculation:', {
        endTime,
        serverNow,
        remainingTime,
        timerInitialized
      });
      
      if (remainingTime > 0) {
        console.log('🚀 Attempting to start timer with remaining time:', remainingTime);
        
        // CRITICAL FIX: Use a more reliable timer initialization check
        const startTimerWithRetry = () => {
          console.log('🔄 Attempting timer start, current state:', {
            timerInitialized,
            remainingTime,
            timerError
          });
          
          if (timerInitialized) {
            console.log('✅ Timer ready, starting immediately');
            const success = startTimer(remainingTime);
            console.log('Timer start result:', { success });
            return true;
          }
          
          return false;
        };
        
        // Try to start immediately
        if (startTimerWithRetry()) {
          console.log('✅ Timer started immediately');
        } else {
          console.log('⚠️ Timer not ready, implementing retry mechanism...');
          
          let attempts = 0;
          const maxAttempts = 20; // Increased attempts
          
          const waitForTimer = setInterval(() => {
            attempts++;
            console.log(`⏳ Timer retry attempt ${attempts}/${maxAttempts}`, {
              timerInitialized,
              timerError,
              remainingTime
            });
            
            if (startTimerWithRetry()) {
              clearInterval(waitForTimer);
              console.log('✅ Timer started after retry');
            } else if (attempts >= maxAttempts) {
              clearInterval(waitForTimer);
              console.warn('❌ Timer start failed after max attempts - starting fallback');
              
              // Force start with fallback (this should always work)
              try {
                const success = startTimer(remainingTime);
                console.log('Fallback timer result:', { success });
              } catch (error) {
                console.error('❌ Even fallback timer failed:', error);
              }
            }
          }, 500); // Check every 500ms instead of 1s
        }
      } else {
        console.log('❌ Time already expired', { remainingTime });
        setIsTimeExpired(true);
        handleAutoSubmit('session_expired');
      }
      
      setExamSession(sessionData);
      console.log('✅ loadExistingSession completed successfully');
      return true;
      
    } else {
      console.log('ℹ️ No active session found');
      return false;
    }
  } catch (error) {
    console.error('❌ loadExistingSession: API error', error);
    
    // Fallback: load saved answers
    try {
      const savedAnswers = await ExamDBService.getAnswers(exam_string);
      if (savedAnswers) {
        console.log('📂 Using saved answers fallback');
        setAnswers(savedAnswers);
      }
    } catch (fallbackError) {
      console.error('❌ Fallback failed:', fallbackError);
    }
    
    return false;
  }
}, [
  isClient, 
  examId, 
  examScheduleId, 
  enhancedGetServerTime, 
  exam_string, 
  timerInitialized, 
  timerError, // Add this dependency
  startTimer, 
  handleAutoSubmit
]);

  // FIXED: Fetch questions with GUARANTEED loading=false
const fetchQuestions = useCallback(async () => {
  console.log('🔄 fetchQuestions called:', {
    isClient,
    exam_string,
    examOrder: examOrder.length,
    examScheduleId
  });
  
  if (!isClient) {
    console.log('❌ fetchQuestions: Not client side');
    return;
  }
  
  if (!exam_string) {
    console.log('❌ fetchQuestions: No exam_string');
    return;
  }
  
  // CRITICAL: Validate that this exam_string exists in examOrder
  const currentExam = examOrder.find((exam) => exam.exam_string === exam_string);
  if (!currentExam) {
    console.error('❌ fetchQuestions: exam_string not found in examOrder:', {
      exam_string,
      availableExams: examOrder.map(e => e.exam_string)
    });
    setError(true);
    setLoading(false);
    return;
  }
  
  console.log('🔄 fetchQuestions: Starting API call for exam:', currentExam.name);
  
  try {
    const axios = (await import('axios')).default;
    
    console.log('✅ Found current exam', { 
      examId: currentExam.exam_id,
      examName: currentExam.name
    });
    setExamId(currentExam.exam_id);
    setExamName(currentExam.name); // Set exam name immediately
    
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    console.log('🌐 Making API call to fetch questions...');
    
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/questions/byExamString?exam_string=${exam_string}`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    console.log('✅ API response received:', response.status);

    if (!response.data || !response.data.encryptedData) {
      throw new Error('Invalid API response - no encrypted data');
    }

    const decryptedData = decryptData(response.data.encryptedData);
    const parsedData = JSON.parse(decryptedData);
    
    console.log('✅ Data decrypted and parsed:', {
      questionsCount: parsedData.questions?.length,
      duration: parsedData.duration,
      questionsExist: !!parsedData.questions,
      firstQuestionId: parsedData.questions?.[0]?.id,
      examName: currentExam.name
    });
    
    if (!parsedData.questions || parsedData.questions.length === 0) {
      throw new Error('No questions found in response');
    }
    
    // Check if exam is accessible BEFORE setting questions
    if (examSession && !examSession.is_auto_move && enhancedGetServerTime() < new Date(examSession.start_time).getTime()) {
      console.log('⏰ Exam not accessible yet');
      setExamStartTime(examSession.start_time);
      setShowNotAccessibleModal(true);
      setIsExamAccessible(false);
      setLoading(false);
      return;
    }

    // Set questions and duration FIRST
    console.log('📝 Setting questions and duration...');
    setQuestions(parsedData.questions);
    setDuration(parsedData.duration);
    
    console.log('✅ Questions and duration set successfully');
    
    // IMMEDIATELY set loading to false - DON'T wait for session loading
    console.log('🚨 FORCING loading to false immediately');
    setLoading(false);
    setError(false);
    
    // Load session in background WITHOUT blocking
    console.log('🔄 Loading session in background...');
    setTimeout(async () => {
      try {
        const sessionLoaded = await loadExistingSession(currentExam.exam_id);
        
        if (!sessionLoaded) {
          console.log('⚠️ No session loaded, starting fresh timer');
          // Start fresh timer if no session found
          if (parsedData.duration > 0 && timerInitialized) {
            const timerDuration = parsedData.duration * 60;
            console.log('🚀 Starting fresh timer with duration:', timerDuration);
            const success = startTimer(timerDuration);
            console.log('Fresh timer start result:', { success });
          } else {
            console.log('⚠️ Cannot start timer:', {
              duration: parsedData.duration,
              timerInitialized
            });
          }
        } else {
          console.log('✅ Session loaded successfully');
        }
      } catch (sessionError) {
        console.error('❌ Background session loading failed:', sessionError);
        // Still try to start fresh timer
        if (parsedData.duration > 0 && timerInitialized) {
          const timerDuration = parsedData.duration * 60;
          console.log('🚀 Starting fresh timer after session error:', timerDuration);
          const success = startTimer(timerDuration);
          console.log('Fresh timer start result:', { success });
        }
      }
    }, 100); // Small delay to ensure UI updates first
    
    console.log('✅ fetchQuestions completed - UI should be ready now');
    
  } catch (error) {
    console.error('❌ fetchQuestions failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    setError(true);
    setLoading(false);
  }
}, [
  isClient, 
  exam_string,
  examOrder,
  examScheduleId,
  examSession, 
  enhancedGetServerTime, 
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

  // Submit to server
  const submitToServer = useCallback(async (shouldScore = false): Promise<boolean> => {
    if (!isClient) return false;
    
    setSubmitLoading(true);
    setSubmitError(false);
    
    try {
      const axios = (await import('axios')).default;
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      const finalElapsedTimes = await ExamDBService.finalizeCurrentQuestionTime(exam_string);
      
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
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (!nextExam && selectedTopicId){
        try{
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/userCourse/`,{
              topic_id : selectedTopicId,
              quiz_id: examScheduleId
            },
            { 
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`
              }
            }
          )
        }catch(error){
          console.error('Error submitting user course', error);
        }
      }
      
      if (shouldScore && !nextExam) {
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
          console.error('Error submitting for scoring', scoreError);
        }
      }
  
      setSubmitLoading(false);
      return true;
    } catch (error) {
      setSubmitLoading(false);
      setSubmitError(true);
      return false;
    }
  }, [isClient, exam_string, examScheduleId, examId, answers, nextExam, selectedTopicId]);

  // Handle change
  const handleChange = useCallback(async (id: number, value: any) => {
    const updatedAnswers = {
      ...answers,
      [id]: value
    };
    setAnswers(updatedAnswers);
    await ExamDBService.saveAnswers(exam_string, updatedAnswers);
  }, [answers, exam_string]);

  // Handle true/false change
  const handleTrueFalseChange = useCallback(async (id: number, index: number, value: any) => {
    const updatedAnswers = [...(answers[id] || [])];
    updatedAnswers[index] = value;
    const newAnswers = {
      ...answers,
      [id]: updatedAnswers
    };
    setAnswers(newAnswers);
    await ExamDBService.saveAnswers(exam_string, newAnswers);
  }, [answers, exam_string]);

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

  // Handle next exam
const handleNextExam = useCallback(async () => {
  console.log('🔄 handleNextExam called:', {
    nextExam,
    currentExamIndex,
    examOrderLength: examOrder.length
  });

  if (nextExam) {
    const nextExamString = examOrder[currentExamIndex + 1].exam_string;
    console.log('➡️ Navigating to next exam:', nextExamString);
    
    // Close modal first
    setShowModalNext(false);
    
    // CRITICAL: Stop current timer before navigation
    console.log('⏹️ Stopping current timer before navigation');
    stopTimer();
    
    // Clear current exam data from IndexedDB
    try {
      await ExamDBService.deleteExamData(exam_string);
      console.log('🗑️ Cleared IndexedDB data for:', exam_string);
    } catch (error) {
      console.warn('⚠️ Failed to clear IndexedDB:', error);
    }
    
    // Reset component state immediately
    console.log('🔄 Resetting state before navigation');
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
    setIsInitializing(false);
    
    // Reset refs
    initializationAttempted.current = false;
    submissionInProgress.current = false;
    
    // Small delay to ensure state is reset before navigation
    setTimeout(() => {
      console.log('🚀 Navigating to:', `/exam/${nextExamString}`);
      router.push(`/exam/${nextExamString}`);
    }, 100);
    
  } else {
    console.log('🏠 No more exams, returning to home');
    
    // Stop timer
    stopTimer();
    
    // Clear all exam data
    if (clearExamData) {
      clearExamData();
    }
    
    // Navigate to origin
    router.push(originPath || '/');
  }
}, [
  nextExam, 
  examOrder, 
  currentExamIndex, 
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
    router.push(originPath || '/');
  }, [stopTimer, clearExamData, router, originPath]);

  // Handle retry access
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
        
        if (!sessionData.is_auto_move && enhancedGetServerTime() >= new Date(sessionData.start_time).getTime()) {
          setShowNotAccessibleModal(false);
          setIsExamAccessible(true);
          fetchQuestions();
        } else {
          setExamStartTime(sessionData.start_time);
          setIsExamAccessible(false);
        }
      }
    } catch (error) {
      if (examStartTime && enhancedGetServerTime() >= new Date(examStartTime).getTime()) {
        setIsExamAccessible(true);
        setShowNotAccessibleModal(false);
        fetchQuestions();
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

  // Question elapsed time tracking
  useEffect(() => {
    if (!isClient || loading || questions.length === 0 || currentQuestion >= questions.length) return;
    
    const currentQuestionData = questions[currentQuestion];
    if (!currentQuestionData || !currentQuestionData.id) {
      return;
    }
    
    if (exam_string) {
      ExamDBService.updateQuestionElapsedTime(exam_string, currentQuestionData.id);
    }
  }, [isClient, loading, questions, currentQuestion, exam_string]);

  // Cleanup effect
  useEffect(() => {
    if (!isClient) return;
    
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      
      if (exam_string && questions.length > 0) {
        ExamDBService.finalizeCurrentQuestionTime(exam_string);
      }
    };
  }, [isClient, exam_string, questions]);

  // Countdown effect for exam access
  useEffect(() => {
    if (!isClient || isExamAccessible || !examStartTime) return;
    
    const timer = setInterval(() => {
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

  // Add debug effect to track loading state changes
useEffect(() => {
  console.log('🔄 Loading state comprehensive check:', {
    loading,
    isInitializing,
    questionsLength: questions.length,
    isClient,
    exam_string,
    examScheduleId,
    contextExamScheduleId,
    timerInitialized,
    timerError
  });
  
  // Force loading to false if we have all required data
  if (loading && questions.length > 0 && isClient && exam_string && examScheduleId) {
    console.log('🚨 All data ready, forcing loading to false');
    setLoading(false);
  }
  
  // Additional check for timer readiness
  if (!loading && !isInitializing && questions.length > 0 && !timerInitialized && !timerError) {
    console.log('⏰ Questions ready but timer still initializing...');
  }
}, [
  loading, 
  isInitializing, 
  questions.length, 
  isClient, 
  exam_string, 
  examScheduleId, 
  contextExamScheduleId,
  timerInitialized,
  timerError
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

  // FIXED - Main initialization effect - ONLY runs when examScheduleId is available
useEffect(() => {
  console.log('🔍 Main init effect triggered:', {
    isClient,
    exam_string,
    examScheduleId,
    contextExamScheduleId,
    examOrder: examOrder.length,
    initializationAttempted: initializationAttempted.current,
    loading,
    isInitializing,
    timerInitialized,
    questionsLength: questions.length
  });
  
  if (!isClient) {
    console.log('❌ Not client side yet');
    return;
  }
  
  if (!exam_string) {
    console.log('❌ No exam_string yet');
    return;
  }
  
  // CRITICAL: Wait for examScheduleId to be available (from context sync)
  if (!examScheduleId) {
    console.log('❌ Exam schedule ID not ready yet - waiting for context sync');
    return;
  }
  
  if (examOrder.length === 0) {
    console.log('❌ Exam order not ready yet');
    return;
  }
  
  // Prevent multiple initialization attempts for the SAME exam
  const initKey = `${exam_string}-${examScheduleId}`;
  if (initializationAttempted.current === initKey) {
    console.log('⏸️ Initialization already attempted for this exam, skipping...');
    return;
  }
  
  initializationAttempted.current = initKey; // Store unique key instead of boolean
  
  console.log('🚀 Main initialization starting for exam:', exam_string, 'with scheduleId:', examScheduleId);
  
  setIsInitializing(true);
  
  const initExam = async () => {
    try {
      console.log('📚 About to fetch questions for exam:', exam_string);
      await fetchQuestions();
      console.log('✅ fetchQuestions completed');
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      setError(true);
      setLoading(false);
    } finally {
      console.log('🏁 Setting isInitializing to false');
      setIsInitializing(false);
    }
  };
  
  initExam();
}, [
  isClient, 
  exam_string, 
  examScheduleId,
  examOrder.length,
  fetchQuestions
]);

  // FIXED: Better timer state logging in useEffect
useEffect(() => {
  console.log('🔍 Timer state changed:', {
    timerInitialized,
    timerError,
    isRunning,
    timeLeft,
    workerReady: getBackupTimerValues().workerReady,
    fallbackActive: getBackupTimerValues().fallbackActive
  });
}, [timerInitialized, timerError, isRunning, timeLeft, getBackupTimerValues]);


  // Retry on error
  useEffect(() => {
    if (!isClient || !error || isInitializing) return;
    
    const retryTimeout = setTimeout(() => {
      initializationAttempted.current = false; // Reset for retry
      fetchQuestions();
    }, 5000);

    return () => clearTimeout(retryTimeout);
  }, [isClient, error, isInitializing, fetchQuestions]);

  // Show loading while waiting for context or during initialization
if (!isClient || loading || isInitializing) {
  return (
    <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
      <div className="tw-text-center">
        <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
        <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">
          {isInitializing ? 'Initializing Exam...' : 'Loading Exam...'}
        </h2>
        <p className="tw-text-violet-600 tw-mt-2">Please wait while we prepare your questions</p>
        <div className="tw-text-sm tw-text-gray-500 tw-mt-2 tw-space-y-1">
          <p>Current Exam: {exam_string || 'Loading...'}</p>
          <p>Context Schedule ID: {contextExamScheduleId || 'Loading...'}</p>
          <p>Component Schedule ID: {examScheduleId || 'Loading...'}</p>
          <p>Time sync: {syncCount} syncs, offset: {Math.round(timeOffset)}ms</p>
          <p>Worker timer: {timerInitialized ? 'Initialized' : 'Loading...'}</p>
          <p>Questions: {questions.length} loaded</p>
          <p>Status: {isInitializing ? 'Initializing' : loading ? 'Loading' : 'Ready'}</p>
          <p>Init Key: {initializationAttempted.current || 'None'}</p>
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
          <p className="tw-text-gray-600 tw-mt-2">We'll automatically retry in a few seconds...</p>
          <Button 
            variant="primary" 
            className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-mt-4"
            onClick={() => {
              initializationAttempted.current = false;
              fetchQuestions();
            }}
          >
            Retry Now
          </Button>
        </div>
        </div>
    );
  }
  
  if (!isExamAccessible) {
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
          console.log('🚨 EXTREME security breach from validator - auto-submit');
          handleAutoSubmit('extreme_security_breach');
        }}
      />

      {/* Enhanced Focus Detector with network-aware thresholds */}
      <FocusDetector 
        onAutoSubmit={handleAutoSubmit}
        enabled={!loading && !error && isExamAccessible && questions.length > 0 && !isSubmitting}
        timerRunning={isRunning}
      />

      {/* Enhanced Security Status Display with time sync info */}
      <SecurityStatusDisplay 
        securityValidation={{
          ...securityValidation,
          timeSyncActive: isOnline,
          networkQuality: securityValidation.networkQuality,
          syncReliability: Math.round((reliability || 0) * 100)
        }}
        timerState={{ 
          isValid: timerValid, 
          isRunning,
          networkLatency: Math.round(networkLatency || 0),
          timeOffset: Math.round(timeOffset || 0),
          fallbackActive: getBackupTimerValues().fallbackActive
        }}
      />

      <ChangeTabPrevention 
        onAutoSubmit={() => handleAutoSubmit('tab_change')}
        enabled={!loading && !error && isExamAccessible && questions.length > 0}
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
                  {process.env.NODE_ENV === 'development' && (
                    <div className="tw-text-xs tw-text-violet-300 tw-space-y-1">
                      <p>Sync: {syncCount}x | Offset: {Math.round(timeOffset)}ms | {isOnline ? '🟢' : '🔴'}</p>
                      <p>Reliability: {Math.round((reliability || 0) * 100)}% | Network: {Math.round(networkLatency || 0)}ms</p>
                      <p>
                        Worker: {timerInitialized ? '🟢' : '🔴'} | 
                        Valid: {timerValid ? '🟢' : '🔴'} | 
                        Security: {securityValidation.consistent ? '🟢' : '🔴'} |
                        Quality: {securityValidation.networkQuality}
                      </p>
                      <p>
                        StdDev: {Math.round(offsetStdDev || 0)}ms | 
                        TZ Offset: {Math.round((timezoneOffset || 0) / 1000 / 60)}min |
                        Heartbeat: {securityValidation.heartbeatActive ? '🟢' : '🔴'}
                      </p>
                      <p>Context: {contextExamScheduleId} → Component: {examScheduleId}</p>
                      <p>Fallback: {getBackupTimerValues().fallbackActive ? '🟡' : '🟢'}</p>
                    </div>
                  )}
                </div>
                <div className="tw-flex tw-items-center tw-gap-3 tw-bg-violet-700 tw-rounded-lg tw-px-6 tw-py-3 tw-flex-shrink-0">
                  <div className="tw-flex tw-items-center tw-gap-1">
                    <Clock size={28} className="tw-text-violet-200" />
                    {isRunning && <Activity size={16} className="tw-text-green-400 tw-animate-pulse" />}
                    {isOnline ? <Wifi size={16} className="tw-text-green-400" /> : <WifiOff size={16} className="tw-text-red-400" />}
                  </div>
                  <div className="tw-flex tw-flex-col tw-items-start">
                    <span className="tw-text-violet-200 tw-text-sm">Time Remaining</span>
                    <span className="tw-text-3xl tw-font-mono tw-font-bold">{formatTime(timeLeft)}</span>
                    {process.env.NODE_ENV === 'development' && (
                      <span className="tw-text-xs tw-text-violet-300">
                        Server: {formatTime(Math.floor((enhancedGetServerTime()) / 1000) % 86400)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Container>
          </div>

          {/* Auto-Submit Loading Overlay with enhanced info */}
          {isSubmitting && (
            <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
              <div className="tw-bg-white tw-p-8 tw-rounded-lg tw-text-center tw-max-w-md">
                <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
                <h3 className="tw-text-xl tw-font-semibold tw-text-violet-800 tw-mb-2">
                  Submitting Exam
                </h3>
                <p className="tw-text-violet-600 tw-mb-4">
                  Please wait while we process your answers...
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="tw-text-xs tw-text-gray-500 tw-bg-gray-50 tw-p-2 tw-rounded">
                    Sync Quality: {Math.round((reliability || 0) * 100)}% | 
                    Network: {Math.round(networkLatency || 0)}ms |
                    Security: {securityValidation.networkQuality} |
                    Schedule ID: {examScheduleId}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Checkpoint Toast with sync info */}
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
                {process.env.NODE_ENV === 'development' && (
                  <Badge bg="success" className="tw-text-xs">
                    Sync: {Math.round((reliability || 0) * 100)}%
                  </Badge>
                )}
              </Toast.Header>
              <Toast.Body className="tw-text-violet-700">
                Your answers have been saved to the server.
                {process.env.NODE_ENV === 'development' && (
                  <div className="tw-text-xs tw-text-violet-600 tw-mt-1">
                    Server time sync: {timeOffset > 0 ? '+' : ''}{Math.round(timeOffset)}ms
                  </div>
                )}
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
                    {questions.length > 0 && currentQuestion < questions.length ? (
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
                            {process.env.NODE_ENV === 'development' && (
                              <Badge 
                                bg={securityValidation.networkQuality === 'EXCELLENT' ? 'success' : 
                                    securityValidation.networkQuality === 'GOOD' ? 'primary' :
                                    securityValidation.networkQuality === 'FAIR' ? 'warning' : 'danger'}
                                className="tw-text-xs"
                              >
                                {securityValidation.networkQuality}
                              </Badge>
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
                        <p className="tw-text-gray-500">No questions available</p>
                        {process.env.NODE_ENV === 'development' && (
                          <div className="tw-text-xs tw-text-gray-400 tw-mt-2">
                            Sync Status: {isOnline ? 'Online' : 'Offline'} | 
                            Timer: {timerInitialized ? 'Ready' : 'Loading'} |
                            Schedule ID: {examScheduleId || 'NULL'}
                          </div>
                        )}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Enhanced Right Sidebar with sync info */}
              <Col lg={4} className="tw-hidden md:tw-block">
                <Card className="tw-shadow-md tw-border-0 tw-rounded-xl tw-sticky tw-top-4">
                  <Card.Body className="tw-p-4">
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                      <h3 className="tw-text-lg tw-font-semibold tw-text-violet-800">Question Navigator</h3>
                      {process.env.NODE_ENV === 'development' && (
                        <div className="tw-flex tw-items-center tw-gap-1">
                          <div className={`tw-w-2 tw-h-2 tw-rounded-full ${isOnline ? 'tw-bg-green-500' : 'tw-bg-red-500'}`} />
                          <span className="tw-text-xs tw-text-gray-500">
                            {Math.round((reliability || 0) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
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

                        {/* Enhanced Timer Display */}
                        <div className="tw-bg-violet-50 tw-p-3 tw-rounded-lg tw-mb-4">
                          <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                            <span className="tw-text-sm tw-font-medium tw-text-violet-800">Timer Status</span>
                            <div className="tw-flex tw-items-center tw-gap-1">
                              {timerValid && <Shield className="tw-text-green-600" size={14} />}
                              {isRunning && <Activity className="tw-text-blue-600 tw-animate-pulse" size={14} />}
                              {getBackupTimerValues().fallbackActive && <AlertCircle className="tw-text-yellow-600" size={14} />}
                            </div>
                          </div>
                          <p className="tw-text-lg tw-font-mono tw-font-bold tw-text-violet-700">
                            {formatTime(timeLeft)}
                          </p>
                          {process.env.NODE_ENV === 'development' && (
                            <div className="tw-text-xs tw-text-violet-600 tw-space-y-1 tw-mt-2">
                              <p>Elapsed: {formatTime(elapsed)}</p>
                              <p>Network: {Math.round(networkLatency || 0)}ms</p>
                              <p>Offset: {timeOffset > 0 ? '+' : ''}{Math.round(timeOffset)}ms</p>
                              <p>Quality: {securityValidation.networkQuality}</p>
                              <p>Schedule ID: {examScheduleId || 'NULL'}</p>
                              <p>Mode: {getBackupTimerValues().fallbackActive ? 'Fallback' : 'Worker'}</p>
                            </div>
                          )}
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
                        {process.env.NODE_ENV === 'development' && (
                          <div className="tw-text-xs tw-text-gray-400 tw-mt-2">
                            Sync: {syncCount}x | Network: {isOnline ? 'Online' : 'Offline'} | Schedule ID: {examScheduleId || 'NULL'}
                          </div>
                        )}
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
              {questions.length > 0 ? (
                <>
                  <div className="tw-mb-3">
                    <div className="tw-flex tw-justify-between tw-text-sm tw-text-gray-600 tw-mb-2">
                      <span>Progress</span>
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <span>{getFilledAnswersCount()}/{questions.length} Questions</span>
                        {process.env.NODE_ENV === 'development' && (
                          <Badge 
                            bg={isOnline ? 'success' : 'danger'}
                            className="tw-text-xs"
                          >
                            {Math.round((reliability || 0) * 100)}%
                          </Badge>
                        )}
                      </div>
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
                  {process.env.NODE_ENV === 'development' && (
                    <div className="tw-text-xs tw-text-gray-400 tw-mt-2">
                      Sync: {syncCount}x | Timer: {timerInitialized ? 'Ready' : 'Loading'} | Schedule ID: {examScheduleId || 'NULL'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Modal - Enhanced */}
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
                  <p className="tw-text-violet-700 tw-mb-2">
                    <span className="tw-font-medium">Time Remaining:</span> {formatTime(timeLeft)}
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="tw-text-xs tw-text-violet-600 tw-bg-violet-100 tw-p-2 tw-rounded tw-mt-2">
                      <p>Sync Quality: {Math.round((reliability || 0) * 100)}%</p>
                      <p>Network Latency: {Math.round(networkLatency || 0)}ms</p>
                      <p>Time Offset: {timeOffset > 0 ? '+' : ''}{Math.round(timeOffset)}ms</p>
                      <p>Schedule ID: {examScheduleId || 'NULL'}</p>
                      <p>Timer Mode: {getBackupTimerValues().fallbackActive ? 'Fallback' : 'Worker'}</p>
                    </div>
                  )}
                  {getFilledAnswersCount() < questions.length && (
                    <div className="tw-bg-amber-50 tw-p-2 tw-rounded tw-border tw-border-amber-200 tw-text-amber-800 tw-text-sm tw-mt-2">
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
                    {nextExam ? (
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
                  {nextExam ? (
                    <>
                      <ArrowRight className="tw-mr-1" size={16} /> Continue to Next Exam
                    </>
                  ) : (
                    <>
                      <Check className="tw-mr-1" size={16} /> Return to Home
                    </>
                  )}
                </Button>
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
          <p className="tw-text-violet-600 tw-mt-2">Please wait while we prepare the enhanced timer system</p>
        </div>
      </div>
    );
  }

  return (
    <UserPurchaseProvider 
      examDuration={mainTimer} 
      onSecurityBreach={() => {
        console.log('🚨 Purchase context security breach detected');
      }}
    >
      <ActiveUserProvider 
        examDuration={mainTimer}
        onSecurityBreach={() => {
          console.log('🚨 User activity context anomaly detected');
        }}
      >
        <AllProductProvider 
          examDuration={mainTimer}
          onSecurityBreach={() => {
            console.log('🚨 Product context inventory breach detected');
          }}
        >
          <ExamContent />
        </AllProductProvider>
      </ActiveUserProvider>
    </UserPurchaseProvider>
  );
};

export default ChainExam;