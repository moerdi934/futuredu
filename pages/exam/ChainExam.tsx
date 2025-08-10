// ChainExam.tsx - COMPLETE FIXED VERSION WITH ENHANCED QUESTION ELAPSED TIME
'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import CryptoJS from 'crypto-js';
import ChangeTabPrevention from '../../components/ChangeTabPrevention';
import { useDistributedTimeSync } from '../../hooks/useDistributedTimeSync';
import { useSecureTimer } from '../../hooks/useSecureTimer';
import { useEnhancedQuestionTimer } from '../../hooks/useEnhancedQuestionTimer';
import { useTimerRecovery } from '../../utils/TimerRecoveryUtil';
import { useExam } from '../../context/ExamContext';
import { useAuth } from '../../context/AuthContext';
import ExamDBService from '../../utils/ExamDBService';
import HiddenTimerDebug from '../../components/HiddenTimerDebug';

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
import { Clock, Loader2, Check, AlertCircle, FileCheck, ArrowRight, Eye, EyeOff, Shield, ShieldAlert, Activity, Wifi, WifiOff, Home, Settings, RefreshCw, Play, Square, Power } from 'lucide-react';

// Interface definitions
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

// Enhanced Debug Logger
class UltraDebugLogger {
  private sessionId: string;
  private logs: Array<{ timestamp: number; level: string; component: string; message: string; data?: any }> = [];
  private maxLogs = 1000;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.log('SYSTEM', 'UltraDebugLogger initialized', { sessionId });
  }

  log(component: string, message: string, data?: any) {
    const logEntry = {
      timestamp: Date.now(),
      level: 'INFO',
      component,
      message,
      data
    };
    
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    const timeStr = new Date().toLocaleTimeString();
    console.log(`🔍 [${timeStr}] [${component}] ${message}`, data || '');
  }

  error(component: string, message: string, error?: any) {
    const logEntry = {
      timestamp: Date.now(),
      level: 'ERROR',
      component,
      message,
      data: error
    };
    
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    const timeStr = new Date().toLocaleTimeString();
    console.error(`❌ [${timeStr}] [${component}] ${message}`, error || '');
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Enhanced Session Manager
class UltraSessionManager {
  private isActive: boolean = false;
  private sessionId: string = '';
  private logger: UltraDebugLogger;
  private activationStack: string[] = [];

  constructor(logger: UltraDebugLogger) {
    this.logger = logger;
    this.sessionId = this.generateSessionId();
    this.logger.log('SESSION', 'Session Manager initialized', { sessionId: this.sessionId });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  activate(reason: string, component: string = 'UNKNOWN'): boolean {
    if (this.isActive) {
      this.logger.log('SESSION', `Already active: ${reason}`, { component });
      return false;
    }

    this.isActive = true;
    this.activationStack.push(`${component}:${reason}:${Date.now()}`);
    
    this.logger.log('SESSION', `✅ SESSION ACTIVATED: ${reason}`, { 
      component,
      sessionId: this.sessionId
    });
    
    return true;
  }

  deactivate(reason: string, component: string = 'UNKNOWN'): boolean {
    if (!this.isActive) {
      this.logger.log('SESSION', `Already inactive: ${reason}`, { component });
      return false;
    }

    this.isActive = false;
    
    this.logger.log('SESSION', `🛑 SESSION DEACTIVATED: ${reason}`, { 
      component,
      sessionId: this.sessionId
    });
    
    return true;
  }

  isSessionActive(): boolean {
    return this.isActive;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getDebugInfo() {
    return {
      isActive: this.isActive,
      sessionId: this.sessionId,
      activationCount: this.activationStack.length,
      lastActivation: this.activationStack[this.activationStack.length - 1],
      recentActivations: this.activationStack.slice(-5)
    };
  }
}

// Enhanced Hidden Timer Validator
const HiddenTimerValidator: React.FC<{
  workerTimerValues: any;
  questionTimer: any;
  mainTimerElapsed: number;
  onSecurityBreach: () => void;
  onTimerRecovery?: () => void;
  sessionManager: UltraSessionManager;
  timerRunning: boolean;
  logger: UltraDebugLogger;
}> = React.memo(({ workerTimerValues, questionTimer, mainTimerElapsed, onSecurityBreach, onTimerRecovery, sessionManager, timerRunning, logger }) => {
  const userPurchase = useUserPurchase();
  const activeUser = useActiveUser();
  const allProduct = useAllProduct();
  const timerAuthenticator = useRef(new RewardTimerAuthenticator(30));
  const lastValidationRef = useRef<number>(0);
  
  useEffect(() => {
    const sessionActive = sessionManager.isSessionActive();
    
    if (!sessionActive || !timerRunning) {
      return;
    }
    
    const validateTimers = () => {
      try {
        const now = Date.now();
        
        // Rate limiting - validate every 3-5 minutes
        const timeSinceLastValidation = now - lastValidationRef.current;
        const minInterval = 3 * 60 * 1000;
        
        if (timeSinceLastValidation < minInterval) {
          return;
        }
        
        lastValidationRef.current = now;
        
        // Get all timer values
        const hiddenTimer = questionTimer?.hiddenTimer?.getCurrentElapsed() || 0;
        const purchaseTimer = userPurchase.getMarketResearchInterval();
        const userActivityTimer = activeUser.getUserActivityInterval();
        const inventoryTimer = allProduct.getInventoryUpdateInterval();
        
        const allTimers = [
          mainTimerElapsed,
          hiddenTimer,
          purchaseTimer,
          userActivityTimer,
          inventoryTimer
        ];
        
        logger.log('VALIDATOR', 'Performing validation', {
          mainTimer: mainTimerElapsed,
          hiddenTimer,
          allTimers
        });
        
        // Validation logic
        const maxDeviation = Math.max(...allTimers.map(t => Math.abs(t - mainTimerElapsed)));
        const isValid = maxDeviation <= 300;
        
        if (!isValid && maxDeviation > 60 && maxDeviation <= 300) {
          logger.log('VALIDATOR', 'Timer deviation detected, triggering recovery', { maxDeviation });
          onTimerRecovery?.();
        } else if (!isValid && maxDeviation > 600) {
          logger.error('VALIDATOR', 'Extreme timer deviation, triggering auto-submit', { maxDeviation });
          onSecurityBreach();
        }
        
      } catch (error) {
        logger.error('VALIDATOR', 'Validation error', error);
      }
    };
    
    const intervalId = setInterval(() => {
      if (sessionManager.isSessionActive() && timerRunning) {
        validateTimers();
      }
    }, 3 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [sessionManager, timerRunning, mainTimerElapsed]);
  
  return null;
});

HiddenTimerValidator.displayName = 'HiddenTimerValidator';

// Enhanced Focus Detection
const FocusDetector: React.FC<{
  onAutoSubmit: (reason: string) => void;
  enabled: boolean;
  timerRunning: boolean;
  sessionManager: UltraSessionManager;
  logger: UltraDebugLogger;
}> = React.memo(({ onAutoSubmit, enabled, timerRunning, sessionManager, logger }) => {
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [focusWarningTime, setFocusWarningTime] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    const sessionActive = sessionManager.isSessionActive();
    
    if (!enabled || !timerRunning || !sessionActive) {
      return;
    }
    
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsPageVisible(isVisible);
      
      if (isVisible) {
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
  }, [enabled, timerRunning, sessionManager, onAutoSubmit]);
  
  if (!enabled || !timerRunning || !isPageVisible || focusWarningTime <= 0 || !showWarning || !sessionManager.isSessionActive()) {
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
  const [showDebugTimer, setShowDebugTimer] = useState(false);
  const [timerRecoveryAttempts, setTimerRecoveryAttempts] = useState(0);
  const [showRecoveryToast, setShowRecoveryToast] = useState(false);
  
  // Create logger and session manager
  const loggerRef = useRef<UltraDebugLogger | null>(null);
  const sessionManagerRef = useRef<UltraSessionManager | null>(null);
  
  if (!loggerRef.current) {
    loggerRef.current = new UltraDebugLogger('ExamContent');
  }
  if (!sessionManagerRef.current) {
    sessionManagerRef.current = new UltraSessionManager(loggerRef.current);
  }
  
  const logger = loggerRef.current;
  const sessionManager = sessionManagerRef.current;
  
  // Hooks
  const params = useParams();
  const router = useRouter();
  const examContext = useExam();
  const authContext = useAuth();
  
  // Memoize exam string
  const exam_string = useMemo(() => {
    const examStr = params?.exam_string as string;
    logger.log('MEMO', 'ExamString memoized', { examStr });
    return examStr;
  }, [params?.exam_string]);

  // Time sync configuration
  const timeSyncConfig = useMemo(() => ({
    minInterval: 2 * 60 * 1000,
    maxInterval: 5 * 60 * 1000,
    focusThreshold: 1 * 60 * 1000,
    jumpThreshold: 5 * 1000
  }), []);
  
  const {
    timeOffset,
    getServerTime,
    detectTimeJump,
    forceSyncNow,
    isOnline,
    syncCount,
    networkLatency,
    reliability,
    offsetStdDev,
    timezoneOffset
  } = useDistributedTimeSync(timeSyncConfig);

  // Timer Recovery
  const {
    checkTimerHealth,
    attemptRecovery,
    resetRecovery
  } = useTimerRecovery(true);

  // State variables
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
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [isExamAccessible, setIsExamAccessible] = useState<boolean>(true);
  const [showNotAccessibleModal, setShowNotAccessibleModal] = useState(false);
  const [examStartTime, setExamStartTime] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number|null>(null);
  const [originPath, setOriginPath] = useState<string>('/');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [accessCheckComplete, setAccessCheckComplete] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [isLastExam, setIsLastExam] = useState(false);
  const [finalSubmitSuccess, setFinalSubmitSuccess] = useState(false);
  const [showFinalCompletionModal, setShowFinalCompletionModal] = useState(false);

  // Refs
  const autoSaveRef = useRef<NodeJS.Timeout>();
  const submissionInProgress = useRef<boolean>(false);
  const initializationStartedRef = useRef<boolean>(false);
  const questionsLoadedRef = useRef<boolean>(false);
  const componentMountedRef = useRef<boolean>(false);
  const cleanupExecutedRef = useRef<boolean>(false);

  // Get context data
  const contextData = useMemo(() => {
    if (!examContext) return null;
    
    const data = {
      topicId: examContext.topicId,
      examScheduleId: examContext.examScheduleId,
      examOrder: examContext.examOrder || [],
      examSessions: examContext.examSessions || [],
      activeSession: examContext.activeSession,
      selectedSchedule: examContext.selectedSchedule,
      examType: examContext.examType || 'Try-Out',
      originPath: examContext.originPath || '/',
      clearExamData: examContext.clearExamData
    };
    
    return data;
  }, [examContext]);

  const { username, id: userId } = authContext || { username: null, id: null };

  // Exam order
  const examOrder = useMemo(() => {
    const order = contextData?.examOrder || [];
    logger.log('EXAMORDER', 'ExamOrder memoized', { count: order.length });
    return order;
  }, [contextData?.examOrder]);

  // Current exam index
  const currentExamIndex = useMemo(() => {
    const index = examOrder.findIndex((exam: ExamOrder) => exam.exam_string === exam_string);
    return index;
  }, [examOrder, exam_string]);

  // Check if this is the last exam
  useEffect(() => {
    const isLast = currentExamIndex === examOrder.length - 1;
    setIsLastExam(isLast);
  }, [currentExamIndex, examOrder.length]);

  // Auto-submit handler
  const handleAutoSubmit = useCallback(async (reason = 'time_expired') => {
    const sessionActive = sessionManager.isSessionActive();
    
    if (submissionInProgress.current || !sessionActive) {
      logger.log('AUTOSUBMIT', 'Auto-submit blocked', { 
        submissionInProgress: submissionInProgress.current,
        sessionActive,
        reason 
      });
      return;
    }
    
    logger.log('AUTOSUBMIT', 'Auto-submit triggered', { reason });
    
    submissionInProgress.current = true;
    sessionManager.deactivate(`auto_submit_${reason}`, 'AUTOSUBMIT');
    setIsTimeExpired(true);
    setIsSubmitting(true);
    
    stopTimer();
    
    const shouldScore = isLastExam && !nextExam;
    const success = await submitToServer(shouldScore);
    
    if (success) {
      await ExamDBService.deleteExamData(exam_string);
      
      if (isLastExam) {
        setFinalSubmitSuccess(true);
        setShowFinalCompletionModal(true);
      } else {
        const nextExamIndex = currentExamIndex + 1;
        const hasNextExam = nextExamIndex < examOrder.length;
        
        if (hasNextExam) {
          setNextExam(examOrder[nextExamIndex]?.name || null);
          setShowModalNext(true);
        } else {
          if (contextData?.clearExamData) contextData.clearExamData();
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
  }, [isLastExam, nextExam, currentExamIndex, examOrder, contextData, router, originPath, exam_string, sessionManager]);

  // Security breach handler
  const onSecurityBreach = useCallback((reason: string, details?: any) => {
    const sessionActive = sessionManager.isSessionActive();
    
    if (!sessionActive) return;
    
    logger.error('SECURITY', 'Security breach detected', { reason, details });
    handleAutoSubmit(`security_breach_${reason}`);
  }, [handleAutoSubmit, sessionManager]);

  const onValidationFailure = useCallback((reason: string) => {
    logger.log('VALIDATION', 'Validation failure', { reason });
  }, []);

  // Timer options
  const timerOptions = useMemo(() => {
    const options = {
      examId: exam_string || 'default',
      onTimeout: () => {
        const sessionActive = sessionManager.isSessionActive();
        if (!sessionActive) return;
        handleAutoSubmit('timer_expired');
      },
      onSecurityBreach,
      onValidationFailure
    };
    
    return options;
  }, [exam_string, handleAutoSubmit, onSecurityBreach, onValidationFailure, sessionManager]);

  // Initialize secure timer
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
    updateNetworkInfo,
    debugInfo
  } = useSecureTimer(timerOptions);

  // Timer recovery handler
  const handleTimerRecovery = useCallback(async () => {
    const sessionActive = sessionManager.isSessionActive();
    
    if (!sessionActive) return;
    
    try {
      const expectedTime = examSession ? 
        Math.max(0, Math.floor((new Date(examSession.end_time).getTime() - getServerTime()) / 1000)) :
        Math.max(0, duration * 60 - elapsed);

      const success = await attemptRecovery(
        () => {
          try {
            const sessionActive = sessionManager.isSessionActive();
            if (!sessionActive) return false;
            return startTimer(expectedTime);
          } catch (error) {
            return false;
          }
        },
        () => expectedTime,
        () => {
          setTimerRecoveryAttempts(prev => prev + 1);
          setShowRecoveryToast(true);
          setTimeout(() => setShowRecoveryToast(false), 4000);
        },
        (error) => {
          logger.error('RECOVERY', 'Timer recovery failed', error);
        }
      );

    } catch (error) {
      logger.error('RECOVERY', 'Timer recovery error', error);
    }
  }, [examSession, getServerTime, duration, elapsed, attemptRecovery, startTimer, sessionManager]);

  // Initialize Enhanced Question Timer with debug enabled
  const questionTimer = useEnhancedQuestionTimer({
    examString: exam_string || '',
    currentQuestionId: questions.length > 0 && currentQuestion < questions.length ? questions[currentQuestion]?.id : null,
    isTimerRunning: isRunning && sessionManager.isSessionActive(),
    autoSaveInterval: 5,
    debugMode: true // Enable debug mode
  });

  // Network info updates
  useEffect(() => {
    updateNetworkInfo({
      latency: networkLatency || 0,
      timezoneOffset: timezoneOffset || 0,
      reliability: reliability || 1.0,
      offsetStdDev: offsetStdDev || 0
    });
  }, [networkLatency, reliability, offsetStdDev, timezoneOffset, updateNetworkInfo]);

  // Sync hidden timer with main timer
  useEffect(() => {
    const sessionActive = sessionManager.isSessionActive();
    
    if (elapsed > 0 && questionTimer && sessionActive) {
      questionTimer.syncWithExternalTimer(elapsed);
    }
  }, [elapsed, questionTimer, sessionManager]);

  // Context data sync
  useEffect(() => {
    if (!contextData) return;
    
    if (contextData.originPath) {
      setOriginPath(contextData.originPath);
    }
    
    if (contextData.topicId) {
      setSelectedTopicId(contextData.topicId);
    }
    
    if (contextData.examType) {
      setExamType(contextData.examType);
    }
    
    if (contextData.examScheduleId) {
      const scheduleIdStr = contextData.examScheduleId.toString();
      setExamScheduleId(scheduleIdStr);
    }
    
    if (contextData.activeSession) {
      setExamSession(contextData.activeSession);
    }
    
    if (examOrder.length > 0 && exam_string) {
      const currentExam = examOrder.find(exam => exam.exam_string === exam_string);
      
      if (currentExam && currentExam.exam_id) {
        setExamId(currentExam.exam_id);
        setExamName(currentExam.name);
        setExamType(currentExam.examType || contextData.examType);
      }
    }
  }, [contextData, examOrder, exam_string]);

  // Enhanced exam string change handler
  useEffect(() => {
    if (exam_string) {
      sessionManager.deactivate('exam_string_change', 'EXAMCHANGE');
      
      initializationStartedRef.current = false;
      questionsLoadedRef.current = false;
      cleanupExecutedRef.current = false;
      
      // Reset states
      setLoading(true);
      setError(false);
      setSubmitError(false);
      setQuestions([]);
      setAnswers({});
      setCurrentQuestion(0);
      setExamSession(null);
      setIsTimeExpired(false);
      setQuestionsReady(false);
      setAccessCheckComplete(false);
      setInitializationComplete(false);
      setIsExamAccessible(true);
      setShowNotAccessibleModal(false);
      setExamStartTime(null);
      setCountdown("");
      setTimerRecoveryAttempts(0);
      
      submissionInProgress.current = false;
    }
  }, [exam_string, sessionManager]);

  // Client-side initialization
  useEffect(() => {
    componentMountedRef.current = true;
    setIsClient(true);
  }, []);

  // Debug mode toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebugTimer(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDebugTimer]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (cleanupExecutedRef.current) return;
      
      cleanupExecutedRef.current = true;
      componentMountedRef.current = false;
      
      sessionManager.deactivate('component_cleanup', 'CLEANUP');
      
      stopTimer();
      
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
      
      if (exam_string && questions.length > 0) {
        // Finalize current question time with all accumulated times
        const allElapsedTimes = questionTimer?.getAllQuestionElapsedTimes() || {};
        ExamDBService.finalizeCurrentQuestionTime(exam_string, elapsed).catch(error => {
          logger.error('CLEANUP', 'Error finalizing question time', error);
        });
      }
    };
  }, []);

  // Decryption function
  const decryptData = useCallback((encryptedData: string) => {
    try {
      const [ivHex, encrypted] = encryptedData.split(':');
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const encryptionKeyString = process.env.NEXT_PUBLIC_EXAM_ENCRYPTION_KEY;
      
      if (!encryptionKeyString) {
        throw new Error('Encryption configuration error');
      }
      // ChainExam.tsx - Part 2: Enhanced with Question Timer Integration

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
      logger.error('DECRYPT', 'Decryption failed', error);
      throw new Error('Failed to decrypt data');
    }
  }, []);

  // Load existing session
  const loadExistingSession = useCallback(async (currentExamId: number, expectedExamString: string) => {
    if (!isClient || !examScheduleId || !currentExamId) {
      return false;
    }

    if (expectedExamString !== exam_string) {
      return false;
    }
    
    try {
      logger.log('LOADSESSION', 'Loading existing session for exam', { currentExamId, expectedExamString });
      
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
        
        logger.log('LOADSESSION', 'Existing session found', sessionData);
        
        const activationSuccess = sessionManager.activate('existing_session_found', 'LOADSESSION');
        
        if (!activationSuccess) {
          return false;
        }
        
        setExamName(sessionData.name);
        
        const serverNow = getServerTime();
        const sessionStartTime = new Date(sessionData.start_time).getTime();
        
        if (!sessionData.is_auto_move && serverNow < sessionStartTime) {
          sessionManager.deactivate('exam_not_accessible', 'LOADSESSION');
          setExamStartTime(sessionData.start_time);
          setIsExamAccessible(false);
          setAccessCheckComplete(true);
          setShowNotAccessibleModal(true);
          setLoading(false);
          return false;
        }
        
        setIsExamAccessible(true);
        setAccessCheckComplete(true);
        
        setAnswers(sessionData.answers || {});
        await ExamDBService.saveAnswers(expectedExamString, sessionData.answers || {});
        
        // ENHANCED: Load question elapsed times from session
        if (sessionData.question_elapsed_times) {
          const examData = await ExamDBService.getExamData(expectedExamString) || { 
            answers: sessionData.answers || {}, 
            startTime: serverNow,
            questionElapsedTimes: {},
            lastQuestionVisit: null
          };
          
          // Save each question's elapsed time individually
          for (const [questionId, elapsedTime] of Object.entries(sessionData.question_elapsed_times)) {
            const qId = parseInt(questionId);
            const elapsed = Number(elapsedTime);
            if (Number.isFinite(qId) && Number.isFinite(elapsed) && elapsed >= 0) {
              await ExamDBService.setQuestionElapsedTime(expectedExamString, qId, elapsed);
              logger.log('LOADSESSION', 'Loaded question elapsed time', { questionId: qId, elapsed });
            }
          }
        }
        
        const endTime = new Date(sessionData.end_time).getTime();
        const remainingTime = Math.max(0, Math.floor((endTime - serverNow) / 1000));
        
        if (remainingTime > 0) {
          const startTimerWithSession = () => {
            const sessionActive = sessionManager.isSessionActive();
            
            if (timerInitialized && expectedExamString === exam_string && sessionActive) {
              return startTimer(remainingTime);
            }
            
            return false;
          };
          
          if (!startTimerWithSession()) {
            let attempts = 0;
            const maxAttempts = 30;
            
            const waitForTimer = setInterval(() => {
              attempts++;
              
              if (expectedExamString !== exam_string) {
                clearInterval(waitForTimer);
                return;
              }
              
              if (startTimerWithSession()) {
                clearInterval(waitForTimer);
              } else if (attempts >= maxAttempts) {
                clearInterval(waitForTimer);
                
                if (expectedExamString === exam_string && sessionManager.isSessionActive()) {
                  try {
                    const forceStart = startTimer(remainingTime);
                    logger.log('LOADSESSION', 'Force timer start result', { forceStart });
                  } catch (error) {
                    logger.error('LOADSESSION', 'Force timer start error', error);
                  }
                }
              }
            }, 250);
          }
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
      logger.error('LOADSESSION', 'Error loading existing session', error);
      setAccessCheckComplete(true);
      
      if (expectedExamString === exam_string) {
        try {
          const savedAnswers = await ExamDBService.getAnswers(expectedExamString);
          if (savedAnswers) {
            setAnswers(savedAnswers);
          }
        } catch (fallbackError) {
          logger.error('LOADSESSION', 'Fallback error', fallbackError);
        }
      }
      
      return false;
    }
  }, [isClient, examScheduleId, exam_string, getServerTime, timerInitialized, startTimer, handleAutoSubmit, sessionManager]);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    if (!isClient || !exam_string || !examScheduleId || examOrder.length === 0) {
      return;
    }

    if (questionsLoadedRef.current) {
      return;
    }

    if (initializationStartedRef.current) {
      return;
    }

    const currentExam = examOrder.find((exam) => exam.exam_string === exam_string);
    if (!currentExam) {
      setError(true);
      setLoading(false);
      return;
    }

    initializationStartedRef.current = true;
    
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

      if (exam_string !== params?.exam_string) {
        initializationStartedRef.current = false;
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

      if (exam_string !== params?.exam_string) {
        initializationStartedRef.current = false;
        return;
      }
      
      setExamId(currentExam.exam_id);
      setExamName(currentExam.name);
      setDuration(parsedData.duration);
      setQuestions(parsedData.questions);
      setQuestionsReady(true);
      questionsLoadedRef.current = true;
      
      try {
        const sessionLoaded = await loadExistingSession(currentExam.exam_id, exam_string);
        
        if (!isExamAccessible && accessCheckComplete) {
          setLoading(false);
          return;
        }
        
        if (!sessionLoaded && isExamAccessible) {
          if (parsedData.duration > 0 && timerInitialized && exam_string === params?.exam_string) {
            const timerDuration = parsedData.duration * 60;
            
            const activationSuccess = sessionManager.activate('fresh_timer_start', 'FETCHQUESTIONS');
            
            if (!activationSuccess) {
              setError(true);
              return;
            }
            
            const timerStarted = startTimer(timerDuration);
            
            if (!timerStarted) {
              setTimeout(() => {
                if (exam_string === params?.exam_string && isExamAccessible && sessionManager.isSessionActive()) {
                  const retryResult = startTimer(timerDuration);
                  logger.log('FETCHQUESTIONS', 'Timer retry result', { retryResult });
                }
              }, 1000);
            }
          }
        }
      } catch (sessionError) {
        logger.error('FETCHQUESTIONS', 'Session loading failed, starting fresh timer', sessionError);
        if (isExamAccessible && parsedData.duration > 0 && timerInitialized && exam_string === params?.exam_string) {
          const timerDuration = parsedData.duration * 60;
          
          const activationSuccess = sessionManager.activate('fallback_timer_start', 'FETCHQUESTIONS');
          
          if (activationSuccess) {
            const fallbackResult = startTimer(timerDuration);
            logger.log('FETCHQUESTIONS', 'Fallback timer result', { fallbackResult });
          }
        }
      }
      
      setInitializationComplete(true);
      setAccessCheckComplete(true);
      setError(false);
      
    } catch (error) {
      logger.error('FETCHQUESTIONS', 'Error fetching questions', error);
      setError(true);
      setQuestionsReady(false);
      initializationStartedRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [
    isClient, 
    exam_string,
    examScheduleId,
    examOrder,
    params?.exam_string,
    decryptData,
    loadExistingSession,
    isExamAccessible,
    accessCheckComplete,
    timerInitialized,
    startTimer,
    sessionManager
  ]);

  // Initialization effect
  useEffect(() => {
    if (!isClient || !exam_string || !examScheduleId || examOrder.length === 0) {
      return;
    }

    if (initializationStartedRef.current || questionsLoadedRef.current) {
      return;
    }
    
    const initExam = async () => {
      try {
        const savedAnswers = await ExamDBService.getAnswers(exam_string);
        if (savedAnswers && Object.keys(savedAnswers).length > 0) {
          setAnswers(savedAnswers);
        }

        await fetchQuestions();
      } catch (error) {
        logger.error('INITIALIZATION', 'Initialization failed', error);
        setError(true);
        setLoading(false);
        initializationStartedRef.current = false;
      }
    };

    initExam();
  }, [isClient, exam_string, examScheduleId, examOrder.length, fetchQuestions]);

  // Save exam session
  const saveExamSession = useCallback(async () => {
    const sessionActive = sessionManager.isSessionActive();
    
    if (!isClient || !sessionActive) {
      return false;
    }
    
    setAutoSaving(true);
    
    try {
      const axios = (await import('axios')).default;
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      // ENHANCED: Get all question elapsed times from question timer
      const questionElapsedTimes = questionTimer?.getAllQuestionElapsedTimes() || 
                                   await ExamDBService.getQuestionElapsedTimes(exam_string);
      
      logger.log('SAVE', 'Saving session data with enhanced elapsed times', {
        examScheduleId,
        examId,
        answersCount: Object.keys(answers).length,
        questionTimesCount: Object.keys(questionElapsedTimes).length,
        questionElapsedTimes
      });
      
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
      setTimeout(() => setShowCheckpointToast(false), 3000);
      return true;
    } catch (error) {
      logger.error('SAVE', 'Error saving session', error);
      setAutoSaving(false);
      return false;
    }
  }, [isClient, exam_string, examScheduleId, examId, answers, questionTimer, sessionManager]);

  // Submit to server
  const submitToServer = useCallback(async (shouldScore = false): Promise<boolean> => {
    if (!isClient) return false;
    
    setSubmitLoading(true);
    setSubmitError(false);
    
    try {
      const currentExam = examOrder.find(exam => exam.exam_string === exam_string);
      if (!currentExam || !currentExam.exam_id) {
        throw new Error('Current exam not found or missing ID');
      }
      
      const examIdToSubmit = currentExam.exam_id;
      const savedAnswers = await ExamDBService.getAnswers(exam_string) || answers;
      
      // ENHANCED: Get final elapsed times from question timer
      const finalElapsedTimes = questionTimer?.getAllQuestionElapsedTimes() || 
                               await ExamDBService.finalizeCurrentQuestionTime(exam_string, elapsed);

      logger.log('SUBMIT', 'Submitting exam data with enhanced elapsed times', {
        examId: examIdToSubmit,
        answersCount: Object.keys(savedAnswers).length,
        elapsedTimesCount: Object.keys(finalElapsedTimes).length,
        finalElapsedTimes,
        shouldScore
      });

      const axios = (await import('axios')).default;
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

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

      // Submit user course data for last exam
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
          logger.error('SUBMIT', 'User course submission error', error);
        }
      }
      
      // Submit scoring for last exam
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
          logger.error('SUBMIT', 'Score submission error', scoreError);
        }
      }
  
      setSubmitLoading(false);
      return true;
    } catch (error) {
      logger.error('SUBMIT', 'Submit error', error);
      setSubmitLoading(false);
      setSubmitError(true);
      return false;
    }
  }, [isClient, exam_string, examScheduleId, examId, answers, isLastExam, selectedTopicId, examOrder, elapsed, questionTimer]);

  // Handle change
  const handleChange = useCallback(async (id: number, value: any) => {
    const sessionActive = sessionManager.isSessionActive();
    
    if (!sessionActive) {
      return;
    }
    
    const updatedAnswers = {
      ...answers,
      [id]: value
    };
    setAnswers(updatedAnswers);
    await ExamDBService.saveAnswers(exam_string, updatedAnswers);
  }, [answers, exam_string, sessionManager]);

  // Handle true/false change
  const handleTrueFalseChange = useCallback(async (id: number, index: number, value: any) => {
    const sessionActive = sessionManager.isSessionActive();
    
    if (!sessionActive) {
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
  }, [answers, exam_string, sessionManager]);

  // Utility functions
  const isAnswerFilled = useCallback((answer: any): boolean => {
    if (answer === undefined || answer === null || answer === '') {
      return false;
    }
    
    if (Array.isArray(answer)) {
      return answer.some(value => value !== undefined && value !== null && value !== '');
    }
    
    return true;
  }, []);

  const getFilledAnswersCount = useCallback((): number => {
    return Object.values(answers).filter(answer => isAnswerFilled(answer)).length;
  }, [answers, isAnswerFilled]);

  // Handle submit
  const handleSubmit = useCallback((e?: React.FormEvent, skipConfirmation = false) => {
    if (e) e.preventDefault();
    
    const sessionActive = sessionManager.isSessionActive();
    
    if (!sessionActive) {
      return;
    }
    
    if (isTimeExpired || skipConfirmation) {
      handleAutoSubmit('manual_submit');
    } else {
      setShowConfirmationModal(true);
    }
  }, [isTimeExpired, handleAutoSubmit, sessionManager]);

  // Confirm submit
  const confirmSubmit = useCallback(async () => {
    setShowConfirmationModal(false);
    await handleAutoSubmit('confirmed_submit');
  }, [handleAutoSubmit]);

  // Handle next exam
  const handleNextExam = useCallback(async () => {
    if (nextExam && !isLastExam) {
      const nextExamString = examOrder[currentExamIndex + 1].exam_string;
      
      setShowModalNext(false);
      
      sessionManager.deactivate('moving_to_next_exam', 'NEXTEXAM');
      initializationStartedRef.current = false;
      questionsLoadedRef.current = false;
      
      stopTimer();
      
      try {
        await ExamDBService.deleteExamData(exam_string);
      } catch (error) {
        logger.error('NEXTEXAM', 'Error clearing exam data', error);
      }
      
      // Reset states for new exam
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
      setTimerRecoveryAttempts(0);
      
      submissionInProgress.current = false;
      
      setTimeout(() => {
        router.push(`/exam/${nextExamString}`);
      }, 100);
      
    } else {
      setShowModalNext(false);
      setShowFinalCompletionModal(false);
      
      sessionManager.deactivate('returning_to_dashboard', 'NEXTEXAM');
      
      stopTimer();
      
      if (contextData?.clearExamData) {
        contextData.clearExamData();
      }
      
      router.push(originPath || '/try-out');
    }
  }, [
    nextExam, 
    examOrder, 
    currentExamIndex, 
    isLastExam,
    contextData, 
    router, 
    originPath, 
    exam_string,
    stopTimer,
    sessionManager
  ]);

  // Handle retry submit
  const handleRetrySubmit = useCallback(() => {
    handleAutoSubmit('retry');
  }, [handleAutoSubmit]);

  // ENHANCED: Handle navigation with question timer finalization
  const handleNavigation = useCallback(async (index: number) => {
    const sessionActive = sessionManager.isSessionActive();
    
    if (questions.length === 0 || currentQuestion >= questions.length || !sessionActive) {
      return;
    }
    
    // ENHANCED: Finalize current question time before navigation
    if (exam_string && questions[currentQuestion] && questions[currentQuestion].id && questionTimer) {
      try {
        await questionTimer.finalizeQuestionTime(questions[currentQuestion].id);
        logger.log('NAV', 'Question time finalized before navigation', {
          fromQuestion: questions[currentQuestion].id,
          toQuestion: questions[index]?.id,
          elapsedTime: questionTimer.getQuestionElapsedTime(questions[currentQuestion].id)
        });
      } catch (error) {
        logger.error('NAV', 'Error finalizing question time', error);
      }
    }
    
    setCurrentQuestion(index);
  }, [questions, currentQuestion, exam_string, questionTimer, sessionManager]);

  // Check if answered
  const isAnswered = useCallback((id: number) => {
    return answers[id] !== undefined && isAnswerFilled(answers[id]);
  }, [answers, isAnswerFilled]);

  // Handle close
  const handleClose = useCallback(async () => {
    sessionManager.deactivate('user_close', 'CLOSE');
    
    stopTimer();
    if (contextData?.clearExamData) contextData.clearExamData();
    router.push(originPath || '/try-out');
  }, [stopTimer, contextData, router, originPath, sessionManager]);

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
        
        const serverNow = getServerTime();
        const sessionStartTime = new Date(sessionData.start_time).getTime();
        
        if (!sessionData.is_auto_move && serverNow >= sessionStartTime) {
          setShowNotAccessibleModal(false);
          setIsExamAccessible(true);
          setAccessCheckComplete(false);
          setLoading(true);
          
          initializationStartedRef.current = false;
          questionsLoadedRef.current = false;
          
          fetchQuestions();
        } else {
          setExamStartTime(sessionData.start_time);
          setIsExamAccessible(false);
        }
      }
    } catch (error) {
      logger.error('RETRY', 'Error retrying access', error);
      if (examStartTime) {
        const serverNow = getServerTime();
        const startTime = new Date(examStartTime).getTime();
        
        if (serverNow >= startTime) {
          setIsExamAccessible(true);
          setShowNotAccessibleModal(false);
          setAccessCheckComplete(false);
          setLoading(true);
          
          initializationStartedRef.current = false;
          questionsLoadedRef.current = false;
          
          fetchQuestions();
        }
      }
    }
  }, [isClient, examScheduleId, examId, getServerTime, examStartTime, fetchQuestions]);

  // Render question
  const renderQuestion = useCallback((q: Question) => {
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
  }, [isClient, handleChange, handleTrueFalseChange, answers]);

  // Enhanced loading screen
  if (!isClient || loading || !questionsReady || !accessCheckComplete || !timerInitialized || !questionsLoadedRef.current) {
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">
            {!timerInitialized ? 'Initializing Timer System...' :
             !accessCheckComplete ? 'Checking Exam Access...' : 
             !questionsReady || !questionsLoadedRef.current ? 'Loading Questions...' : 
             'Finalizing Setup...'}
          </h2>
          <p className="tw-text-violet-600 tw-mt-2">
            {!timerInitialized ? 'Setting up secure timer and recovery systems...' :
             !accessCheckComplete ? 'Verifying exam schedule and accessibility...' :
             !questionsReady || !questionsLoadedRef.current ? 'Fetching exam questions and configuration...' : 
             'Preparing your exam environment...'}
          </p>
          <div className="tw-mt-4 tw-text-sm tw-text-violet-500">
            <p>🎯 ENHANCED: Question Timer with Elapsed Time Per Question</p>
            <p>📊 ENHANCED: Advanced Question Time Tracking & Recovery</p>
            <p>💾 ENHANCED: Auto-save Question Times to Database</p>
            <p>🔄 ENHANCED: Question Navigation with Time Finalization</p>
            <p>📝 ENHANCED: Submission with Complete Elapsed Times</p>
            <p>🐛 DEBUG: Full Question Timer Debug Information</p>
            {questionTimer?.debugMode && (
              <>
                <p>📊 Current Question: {questionTimer.currentQuestionId || 'None'}</p>
                <p>⏱️ Question Elapsed: {questionTimer.currentElapsedTime}s</p>
                <p>🎯 Tracking: {questionTimer.isTracking ? 'Active' : 'Inactive'}</p>
                <p>💾 Data Loaded: {questionTimer.dataLoaded ? 'Yes' : 'No'}</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Rest of the render logic continues with enhanced question timer
  // ChainExam.tsx - Part 3: Complete UI Render with Enhanced Question Timer

  if (error) {
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <AlertCircle className="tw-h-12 tw-w-12 tw-text-red-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-red-800">Error Loading Exam</h2>
          <p className="tw-text-red-600 tw-mt-2">There was an error loading the exam questions</p>
          {timerError && (
            <p className="tw-text-red-500 tw-text-sm tw-mt-2">Timer Error: {timerError}</p>
          )}
          <div className="tw-mt-4 tw-bg-red-50 tw-p-4 tw-rounded-lg tw-border tw-border-red-200">
            <h3 className="tw-text-red-800 tw-font-semibold tw-mb-2">Debug Information:</h3>
            <div className="tw-text-xs tw-text-red-600 tw-space-y-1">
              <p>Session Active: {sessionManager.isSessionActive() ? 'Yes' : 'No'}</p>
              <p>Questions Loaded: {questionsLoadedRef.current ? 'Yes' : 'No'}</p>
              <p>Timer Initialized: {timerInitialized ? 'Yes' : 'No'}</p>
              <p>Question Timer Debug: {questionTimer?.debugMode ? 'Enabled' : 'Disabled'}</p>
              {questionTimer?.debugMode && (
                <>
                  <p>Question Tracking: {questionTimer.isTracking ? 'Yes' : 'No'}</p>
                  <p>Data Loaded: {questionTimer.dataLoaded ? 'Yes' : 'No'}</p>
                  <p>Current Question: {questionTimer.currentQuestionId || 'None'}</p>
                  <p>Elapsed Time: {questionTimer.currentElapsedTime}s</p>
                </>
              )}
            </div>
          </div>
          <Button 
            variant="primary" 
            className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-mt-4"
            onClick={() => {
              sessionManager.deactivate('error_retry', 'ERROR');
              initializationStartedRef.current = false;
              questionsLoadedRef.current = false;
              cleanupExecutedRef.current = false;
              setQuestionsReady(false);
              setAccessCheckComplete(false);
              setInitializationComplete(false);
              setError(false);
              setLoading(true);
              setTimerRecoveryAttempts(0);
              resetRecovery();
              setTimeout(() => fetchQuestions(), 100);
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
        questionTimer={questionTimer}
        mainTimerElapsed={elapsed}
        sessionManager={sessionManager}
        timerRunning={isRunning}
        logger={logger}
        onSecurityBreach={() => {
          handleAutoSubmit('extreme_security_breach');
        }}
        onTimerRecovery={handleTimerRecovery}
      />

      {/* Focus Detector */}
      <FocusDetector 
        onAutoSubmit={handleAutoSubmit}
        enabled={!loading && !error && isExamAccessible && questions.length > 0 && !isSubmitting && questionsReady && sessionManager.isSessionActive()}
        timerRunning={isRunning && sessionManager.isSessionActive()}
        sessionManager={sessionManager}
        logger={logger}
      />

      {/* Enhanced Hidden Timer Debug Component */}
      {showDebugTimer && questionTimer && (
        <HiddenTimerDebug
          questionTimer={questionTimer}
          mainTimerElapsed={elapsed}
          isVisible={showDebugTimer}
          position="fixed"
        />
      )}

      <ChangeTabPrevention 
        onAutoSubmit={() => handleAutoSubmit('tab_change')}
        enabled={!loading && !error && isExamAccessible && questions.length > 0 && questionsReady && sessionManager.isSessionActive()}
      >
        <div className="tw-min-h-screen tw-bg-violet-50">
          {/* ENHANCED Header with Question Timer Debug */}
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
                  {timerRecoveryAttempts > 0 && (
                    <p className="tw-text-xs tw-text-violet-300">
                      ✅ Timer recovered {timerRecoveryAttempts} time(s)
                    </p>
                  )}
                  
                  {/* ENHANCED: Question Timer Debug Info */}
                  {questionTimer?.debugMode && (
                    <div className="tw-text-xs tw-text-violet-300 tw-mt-1">
                      <p>📊 Q{questionTimer.currentQuestionId}: {questionTimer.currentQuestionTotalTime}s total | Session: {questionTimer.hiddenTimer.getCurrentElapsed()}s</p>
                      <p>🎯 Tracking: {questionTimer.isTracking ? 'Active' : 'Inactive'} | Data: {questionTimer.dataLoaded ? 'Loaded' : 'Loading'}</p>
                      <p>💾 All Times: {Object.keys(questionTimer.allQuestionElapsedTimes).length} questions tracked</p>
                    </div>
                  )}
                  
                  <div className="tw-text-xs tw-text-violet-300">
                    <span>Session: {sessionManager.getSessionId().substr(-6)} | </span>
                    <span>Active: {sessionManager.isSessionActive() ? 'Yes' : 'No'} | </span>
                    <span>QTimer: {questionTimer?.isTracking ? 'Tracking' : 'Idle'}</span>
                  </div>
                </div>
                
                <div className="tw-flex tw-items-center tw-gap-3 tw-bg-violet-700 tw-rounded-lg tw-px-6 tw-py-3 tw-flex-shrink-0">
                  <div className="tw-flex tw-items-center tw-gap-1">
                    <Clock size={28} className="tw-text-violet-200" />
                    {isRunning && sessionManager.isSessionActive() && <Activity size={16} className="tw-text-green-400 tw-animate-pulse" />}
                    {timerValid && <Shield size={16} className="tw-text-green-400" />}
                    {isOnline ? <Wifi size={16} className="tw-text-green-400" /> : <WifiOff size={16} className="tw-text-red-400" />}
                    {questionsReady && questionsLoadedRef.current && <Check size={16} className="tw-text-green-400" />}
                    {questionTimer?.hiddenTimer?.isRunning && <Shield size={16} className="tw-text-blue-400" />}
                    {questionTimer?.isTracking && <Activity size={16} className="tw-text-orange-400 tw-animate-pulse" />}
                    {isLastExam && <span className="tw-text-orange-400 tw-text-sm">🏁</span>}
                    {sessionManager.isSessionActive() && <Power size={16} className="tw-text-green-400" />}
                  </div>
                  <div className="tw-flex tw-flex-col tw-items-start">
                    <span className="tw-text-violet-200 tw-text-sm">Time Remaining</span>
                    <span className="tw-text-3xl tw-font-mono tw-font-bold">{formatTime(timeLeft)}</span>
                    {questionTimer?.debugMode && (
                      <span className="tw-text-xs tw-text-violet-300">
                        Q-Time: {Math.floor(questionTimer.currentElapsedTime / 60)}:{(questionTimer.currentElapsedTime % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Debug Panel */}
              {process.env.NODE_ENV === 'development' && (
                <div className="tw-flex tw-justify-between tw-items-center tw-mt-2">
                  <div className="tw-text-xs tw-text-violet-300">
                    <p>Session Debug: Activations: {sessionManager.getDebugInfo().activationCount}</p>
                    {questionTimer?.debugMode && (
                      <p>Question Timer: Q{questionTimer.currentQuestionId} | Total: {questionTimer.currentQuestionTotalTime}s | Session: {questionTimer.hiddenTimer.getCurrentElapsed()}s</p>
                    )}
                  </div>
                  <div className="tw-flex tw-gap-2">
                    <Button
                      variant="outline-light"
                      size="sm"
                      onClick={() => setShowDebugTimer(!showDebugTimer)}
                      className="tw-text-xs"
                    >
                      <Settings size={12} className="tw-mr-1" />
                      {showDebugTimer ? 'Hide' : 'Show'} Debug
                    </Button>
                    <Button
                      variant="outline-light"
                      size="sm"
                      onClick={() => {
                        console.log('🔍 QUESTION TIMER DEBUG:', questionTimer?.getFullDebugInfo?.());
                        console.log('🕐 ALL QUESTION TIMES:', questionTimer?.getAllQuestionElapsedTimes());
                      }}
                      className="tw-text-xs"
                    >
                      Export Q-Times
                    </Button>
                  </div>
                </div>
              )}
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
                  {isLastExam ? 'Processing your final answers and question times...' : 'Please wait while we process your answers and question times...'}
                </p>
                {questionTimer?.debugMode && (
                  <div className="tw-text-xs tw-text-gray-500">
                    <p>📊 Submitting times for {Object.keys(questionTimer.getAllQuestionElapsedTimes()).length} questions</p>
                    <p>⏱️ Current Question Total: {questionTimer.currentQuestionTotalTime}s</p>
                    <p>🎯 Question Timer: {questionTimer.isTracking ? 'Active' : 'Finalizing'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Recovery Toast */}
          <div 
            className="tw-fixed tw-top-4 tw-right-4 tw-z-50"
            style={{ display: showRecoveryToast ? 'block' : 'none' }}
          >
            <Toast 
              onClose={() => setShowRecoveryToast(false)} 
              show={showRecoveryToast} 
              delay={4000} 
              autohide
              className="tw-bg-green-100 tw-border-green-300 tw-border"
            >
              <Toast.Header className="tw-bg-green-200 tw-text-green-800">
                <RefreshCw className="tw-mr-2 tw-text-green-600" size={16} />
                <strong className="tw-mr-auto">Timer Recovered</strong>
              </Toast.Header>
              <Toast.Body className="tw-text-green-700">
                Timer has been automatically recovered and is now running normally.
                {questionTimer?.debugMode && (
                  <div className="tw-text-xs tw-mt-2 tw-text-gray-600">
                    Recovery #{timerRecoveryAttempts} | Q-Timer: {questionTimer.isTracking ? 'Active' : 'Inactive'}
                  </div>
                )}
              </Toast.Body>
            </Toast>
          </div>

          {/* Checkpoint Toast */}
          <div 
            className="tw-fixed tw-top-4 tw-right-4 tw-z-50"
            style={{ 
              display: showCheckpointToast ? 'block' : 'none',
              transform: showRecoveryToast ? 'translateY(80px)' : 'translateY(0)'
            }}
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
                <strong className="tw-mr-auto">Progress Saved</strong>
              </Toast.Header>
              <Toast.Body className="tw-text-violet-700">
                Your answers and question times have been saved to the server.
                {questionTimer?.debugMode && (
                  <div className="tw-text-xs tw-mt-2 tw-text-gray-600">
                    Q{questionTimer.currentQuestionId}: {questionTimer.currentQuestionTotalTime}s total
                  </div>
                )}
              </Toast.Body>
            </Toast>
          </div>

          {/* Main Content Container */}
          <Container className="tw-mb-8">
            <Row>
              <Col lg={8} className="tw-mb-4">
                <Card className="tw-shadow-md tw-border-0 tw-rounded-xl">
                  <Card.Body className="tw-p-6">
                    {questions.length > 0 && currentQuestion < questions.length && questionsReady && sessionManager.isSessionActive() && questionsLoadedRef.current ? (
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
                            {/* ENHANCED: Question Timer Display */}
                            {questionTimer?.debugMode && questions[currentQuestion] && (
                              <div className="tw-text-xs tw-text-gray-500 tw-bg-gray-50 tw-p-2 tw-rounded">
                                <div>🎯 Q{questions[currentQuestion].id}: {Math.floor(questionTimer.getQuestionElapsedTime(questions[currentQuestion].id) / 60)}:{(questionTimer.getQuestionElapsedTime(questions[currentQuestion].id) % 60).toString().padStart(2, '0')}</div>
                                <div>📊 Session: {Math.floor(questionTimer.hiddenTimer.getCurrentElapsed() / 60)}:{(questionTimer.hiddenTimer.getCurrentElapsed() % 60).toString().padStart(2, '0')}</div>
                                <div>💾 Tracking: {questionTimer.isTracking ? '✅' : '❌'}</div>
                                <div>🔄 Auto-Save: {questionTimer.debugInfo?.autoSave?.isActive ? '✅' : '❌'}</div>
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
                          {!questionsReady ? 'Loading questions...' : 
                           !questionsLoadedRef.current ? 'Questions not loaded...' :
                           !sessionManager.isSessionActive() ? 'Session not active' :
                           'No questions available'}
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* ENHANCED Right Sidebar with Question Timer Info */}
              <Col lg={4} className="tw-hidden md:tw-block">
                <Card className="tw-shadow-md tw-border-0 tw-rounded-xl tw-sticky tw-top-4">
                  <Card.Body className="tw-p-4">
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                      <h3 className="tw-text-lg tw-font-semibold tw-text-violet-800">Question Navigator</h3>
                      {questionTimer?.debugMode && (
                        <Badge bg="info" className="tw-text-xs">
                          QT: {Math.floor(questionTimer.currentElapsedTime / 60)}:{(questionTimer.currentElapsedTime % 60).toString().padStart(2, '0')}
                        </Badge>
                      )}
                    </div>
                    
                    {questions.length > 0 && questionsReady && sessionManager.isSessionActive() && questionsLoadedRef.current ? (
                      <>
                        {/* ENHANCED: Question Grid with Time Indicators */}
                        <div className="tw-grid tw-grid-cols-5 tw-gap-2 tw-mb-6">
                          {questions.map((q, index) => {
                            const isCurrentQuestion = currentQuestion === index;
                            const isAnswered = answered => answers[q.id] !== undefined && isAnswerFilled(answers[q.id]);
                            const questionElapsed = questionTimer?.getQuestionElapsedTime(q.id) || 0;
                            const hasTimeSpent = questionElapsed > 0;
                            
                            return (
                              <div key={q.id} className="tw-relative">
                                <Button
                                  variant={isCurrentQuestion ? "primary" : "outline-secondary"}
                                  className={`tw-w-10 tw-h-10 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-relative
                                    ${isCurrentQuestion 
                                      ? 'tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700' 
                                      : 'tw-border-2 tw-border-violet-200 tw-text-violet-700 hover:tw-bg-violet-50'}
                                    ${isAnswered(q.id) ? 'tw-bg-violet-200' : ''}`}
                                  onClick={() => handleNavigation(index)}
                                >
                                  {index + 1}
                                </Button>
                                {/* Time indicator dot */}
                                {hasTimeSpent && questionTimer?.debugMode && (
                                  <div 
                                    className="tw-absolute tw--top-1 tw--right-1 tw-w-3 tw-h-3 tw-rounded-full tw-bg-orange-400 tw-text-xs tw-flex tw-items-center tw-justify-center"
                                    title={`${Math.floor(questionElapsed / 60)}:${(questionElapsed % 60).toString().padStart(2, '0')}`}
                                  >
                                    <span className="tw-text-white tw-text-xs">•</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="tw-mb-4">
                          <div className="tw-flex tw-justify-between tw-text-sm tw-text-gray-600 tw-mb-2">
                            <span>Progress</span>
                            <span>{getFilledAnswersCount()}/{questions.length} Questions</span>
                          </div>
                          <ProgressBar 
                            now={(getFilledAnswersCount() / questions.length) * 100} 
                            className="tw-h-2 tw-bg-violet-100"
                          />
                        </div>

                        {/* ENHANCED: Timer Display with Question Time */}
                        <div className="tw-bg-violet-50 tw-p-3 tw-rounded-lg tw-mb-4">
                          <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                            <span className="tw-text-sm tw-font-medium tw-text-violet-800">Timer Status</span>
                            <div className="tw-flex tw-items-center tw-gap-1">
                              {timerValid && <Shield className="tw-text-green-600" size={14} />}
                              {isRunning && sessionManager.isSessionActive() && <Activity className="tw-text-blue-600 tw-animate-pulse" size={14} />}
                              {questionTimer?.isTracking && <Activity className="tw-text-orange-600 tw-animate-pulse" size={14} />}
                              {questionsReady && questionsLoadedRef.current && <Check className="tw-text-green-600" size={14} />}
                              {sessionManager.isSessionActive() && <Power className="tw-text-green-600" size={14} />}
                            </div>
                          </div>
                          <p className="tw-text-lg tw-font-mono tw-font-bold tw-text-violet-700">
                            {formatTime(timeLeft)}
                          </p>
                          
                          {/* ENHANCED: Current Question Time Display */}
                          {questionTimer?.debugMode && questions[currentQuestion] && (
                            <div className="tw-text-xs tw-text-gray-600 tw-mt-2 tw-border-t tw-border-violet-200 tw-pt-2">
                              <div className="tw-flex tw-justify-between">
                                <span>Question {currentQuestion + 1} Time:</span>
                                <span className="tw-font-mono">
                                  {Math.floor(questionTimer.getQuestionElapsedTime(questions[currentQuestion].id) / 60)}:
                                  {(questionTimer.getQuestionElapsedTime(questions[currentQuestion].id) % 60).toString().padStart(2, '0')}
                                </span>
                              </div>
                              <div className="tw-flex tw-justify-between">
                                <span>Session Time:</span>
                                <span className="tw-font-mono">
                                  {Math.floor(questionTimer.hiddenTimer.getCurrentElapsed() / 60)}:
                                  {(questionTimer.hiddenTimer.getCurrentElapsed() % 60).toString().padStart(2, '0')}
                                </span>
                              </div>
                              <div className="tw-flex tw-justify-between">
                                <span>Tracking:</span>
                                <span>{questionTimer.isTracking ? '✅ Active' : '❌ Inactive'}</span>
                              </div>
                              <div className="tw-flex tw-justify-between">
                                <span>Questions Tracked:</span>
                                <span>{Object.keys(questionTimer.allQuestionElapsedTimes).length}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Submit button */}
                        {currentQuestion === questions.length - 1 && sessionManager.isSessionActive() && questionsLoadedRef.current && (
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

                        {/* ENHANCED: Question Timer Debug Panel */}
                        {questionTimer?.debugMode && (
                          <div className="tw-bg-gray-50 tw-p-3 tw-rounded-lg tw-mt-4">
                            <h5 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">Question Timer Debug</h5>
                            <div className="tw-text-xs tw-text-gray-600 tw-space-y-1">
                              <div>Current Q: {questionTimer.currentQuestionId || 'None'}</div>
                              <div>Total Time: {questionTimer.currentQuestionTotalTime}s</div>
                              <div>Session Time: {questionTimer.hiddenTimer.getCurrentElapsed()}s</div>
                              <div>Base Time: {questionTimer.debugInfo?.questionTimer?.baseElapsedTime || 0}s</div>
                              <div>Tracking: {questionTimer.isTracking ? 'Yes' : 'No'}</div>
                              <div>Data Loaded: {questionTimer.dataLoaded ? 'Yes' : 'No'}</div>
                              <div>Auto-Save: {questionTimer.debugInfo?.autoSave?.isActive ? 'Active' : 'Inactive'}</div>
                              <div>Questions: {Object.keys(questionTimer.allQuestionElapsedTimes).length} tracked</div>
                              <div className="tw-mt-2 tw-text-xs">
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  onClick={() => {
                                    console.log('🔍 ALL QUESTION TIMES:', questionTimer.getAllQuestionElapsedTimes());
                                    console.log('🔍 FULL DEBUG INFO:', questionTimer.getFullDebugInfo());
                                  }}
                                  className="tw-text-xs tw-py-1 tw-px-2"
                                >
                                  Export Times
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="tw-text-center tw-text-gray-500">
                        <p>Loading questions...</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>

          // ChainExam.tsx - Final Part: Modals, Mobile UI & Component Wrapper

          {/* Mobile Bottom Navigation with Enhanced Question Timer */}
          <div className="tw-block md:tw-hidden tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-bg-white tw-shadow-lg tw-border-t tw-border-gray-200 tw-z-50">
            <div className="tw-p-4">
              {questions.length > 0 && questionsReady && sessionManager.isSessionActive() && questionsLoadedRef.current ? (
                <>
                  <div className="tw-mb-3">
                    <div className="tw-flex tw-justify-between tw-text-sm tw-text-gray-600 tw-mb-2">
                      <span>Progress</span>
                      <span>{getFilledAnswersCount()}/{questions.length} Questions</span>
                      {questionTimer?.debugMode && (
                        <span className="tw-text-xs">
                          Q{questionTimer.currentQuestionId}: {Math.floor(questionTimer.currentQuestionTotalTime / 60)}:{(questionTimer.currentQuestionTotalTime % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <ProgressBar 
                      now={(getFilledAnswersCount() / questions.length) * 100} 
                      className="tw-h-2 tw-bg-violet-100"
                    />
                  </div>
                  
                  <div className="tw-overflow-x-auto tw-pb-2">
                    <div className="tw-flex tw-gap-2 tw-min-w-max">
                      {questions.map((q, index) => {
                        const isCurrentQuestion = currentQuestion === index;
                        const isAnswered = answers[q.id] !== undefined && isAnswerFilled(answers[q.id]);
                        const questionElapsed = questionTimer?.getQuestionElapsedTime(q.id) || 0;
                        const hasTimeSpent = questionElapsed > 0;
                        
                        return (
                          <div key={q.id} className="tw-relative">
                            <Button
                              variant={isCurrentQuestion ? "primary" : "outline-secondary"}
                              className={`tw-w-10 tw-h-10 tw-rounded-lg tw-flex-shrink-0 tw-flex tw-items-center tw-justify-center 
                                ${isCurrentQuestion 
                                  ? 'tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700' 
                                  : 'tw-border-2 tw-border-violet-200 tw-text-violet-700 hover:tw-bg-violet-50'}
                                ${isAnswered ? 'tw-bg-violet-200' : ''}`}
                              onClick={() => handleNavigation(index)}
                            >
                              {index + 1}
                            </Button>
                            {/* Mobile time indicator */}
                            {hasTimeSpent && questionTimer?.debugMode && (
                              <div className="tw-absolute tw--top-1 tw--right-1 tw-w-2 tw-h-2 tw-rounded-full tw-bg-orange-400"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {currentQuestion === questions.length - 1 && sessionManager.isSessionActive() && questionsLoadedRef.current && (
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
                  <p>Loading questions...</p>
                </div>
              )}
            </div>
          </div>

          {/* ENHANCED MODALS with Question Timer Information */}
          
          {/* Enhanced Confirmation Modal */}
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
                  
                  {/* ENHANCED: Question Timer Summary in Modal */}
                  {questionTimer?.debugMode && (
                    <>
                      <p className={`${isLastExam ? 'tw-text-orange-700' : 'tw-text-violet-700'} tw-mb-2 tw-text-sm`}>
                        <span className="tw-font-medium">Current Question Time:</span> {Math.floor(questionTimer.currentQuestionTotalTime / 60)}:{(questionTimer.currentQuestionTotalTime % 60).toString().padStart(2, '0')}
                      </p>
                      <p className={`${isLastExam ? 'tw-text-orange-700' : 'tw-text-violet-700'} tw-mb-2 tw-text-sm`}>
                        <span className="tw-font-medium">Questions with Time:</span> {Object.keys(questionTimer.allQuestionElapsedTimes).filter(qId => questionTimer.allQuestionElapsedTimes[parseInt(qId)] > 0).length}
                      </p>
                      <p className={`${isLastExam ? 'tw-text-orange-700' : 'tw-text-violet-700'} tw-mb-2 tw-text-sm`}>
                        <span className="tw-font-medium">Total Question Time:</span> {Math.floor(Object.values(questionTimer.allQuestionElapsedTimes).reduce((sum, time) => sum + time, questionTimer.currentQuestionTotalTime) / 60)} minutes
                      </p>
                    </>
                  )}
                  
                  {getFilledAnswersCount() < questions.length && (
                    <div className="tw-bg-amber-50 tw-p-2 tw-rounded tw-border tw-border-amber-200 tw-text-amber-800 tw-text-sm tw-mt-2">
                      Warning: You have {questions.length - getFilledAnswersCount()} unanswered questions.
                    </div>
                  )}
                </div>
                
                <p className="tw-text-gray-600 tw-text-sm">
                  {isLastExam 
                    ? 'Once submitted, you won\'t be able to change your answers and your results will be processed with all question timing data.'
                    : 'Once submitted, you won\'t be able to change your answers for this section. All question timing data will be saved.'
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

          {/* Next Exam Modal with Enhanced Question Timer Info */}
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
                        Your answers and question timing data have been saved locally. Please check your internet connection and try again.
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
                    
                    {/* ENHANCED: Question Timer Summary in Success Modal */}
                    {questionTimer?.debugMode && (
                      <div className="tw-bg-gray-50 tw-p-3 tw-rounded tw-text-xs tw-text-gray-600 tw-mb-3">
                        <h5 className="tw-font-semibold tw-mb-2">📊 Question Timing Summary:</h5>
                        <p>✅ Questions with recorded time: {Object.keys(questionTimer.allQuestionElapsedTimes).filter(qId => questionTimer.allQuestionElapsedTimes[parseInt(qId)] > 0).length}</p>
                        <p>⏱️ Total question time: {Math.floor(Object.values(questionTimer.allQuestionElapsedTimes).reduce((sum, time) => sum + time, 0) / 60)} minutes</p>
                        <p>🎯 Current question final time: {Math.floor(questionTimer.currentQuestionTotalTime / 60)}:{(questionTimer.currentQuestionTotalTime % 60).toString().padStart(2, '0')}</p>
                        <p>💾 All timing data submitted successfully</p>
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

          {/* Enhanced Final Completion Modal */}
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
                        📊 Your answers and detailed question timing data are being processed
                      </p>
                      <p className="tw-text-blue-700 tw-font-medium">
                        🏆 Results will be available on your dashboard shortly
                      </p>
                    </div>
                    
                    {/* ENHANCED: Final Question Timer Summary */}
                    {questionTimer?.debugMode && (
                      <div className="tw-bg-blue-50 tw-p-3 tw-rounded tw-border tw-border-blue-200 tw-mb-4">
                        <h5 className="tw-text-blue-800 tw-font-semibold tw-mb-2">📊 Final Session Summary:</h5>
                        <div className="tw-text-blue-700 tw-text-sm tw-space-y-1">
                          <p>🎯 Questions answered: {getFilledAnswersCount()} of {questions.length}</p>
                          <p>⏱️ Questions with timing data: {Object.keys(questionTimer.allQuestionElapsedTimes).filter(qId => questionTimer.allQuestionElapsedTimes[parseInt(qId)] > 0).length}</p>
                          <p>📊 Total session time: {Math.floor(questionTimer.debugInfo?.session?.sessionUptime / 1000 / 60) || 0} minutes</p>
                          <p>🔄 Auto-saves performed: Multiple throughout session</p>
                          <p>💾 All timing data successfully submitted for analysis</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="tw-bg-blue-50 tw-p-3 tw-rounded tw-border tw-border-blue-200">
                      <p className="tw-text-blue-800 tw-text-sm tw-mb-1">
                        <strong>What happens next?</strong>
                      </p>
                      <ul className="tw-text-blue-700 tw-text-sm tw-list-disc tw-list-inside tw-space-y-1">
                        <li>Your answers will be automatically scored</li>
                        <li>Question timing data will be analyzed for insights</li>
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
                        Don't worry! Your answers and question timing data have been saved locally.
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

// ENHANCED: Main ChainExam Component with Question Timer Integration
const ChainExam: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [examDuration, setExamDuration] = useState<number>(0);
  const [mainTimer, setMainTimer] = useState<number>(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Enhanced callback for timer updates
  const handleTimerUpdate = useCallback((currentTime: number) => {
    setMainTimer(currentTime);
    setExamDuration(currentTime);
  }, []);

  if (!isClient) {
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">Initializing ENHANCED Exam System...</h2>
          <p className="tw-text-violet-600 tw-mt-2">Preparing advanced question timer with elapsed time tracking</p>
          <div className="tw-mt-4 tw-text-sm tw-text-violet-500">
            <p>🎯 <strong>ENHANCED:</strong> Question Timer with Individual Elapsed Times</p>
            <p>📊 <strong>ENHANCED:</strong> Advanced Question Time Tracking & Database Storage</p>
            <p>💾 <strong>ENHANCED:</strong> Auto-save Question Times Every 5 Seconds</p>
            <p>🔄 <strong>ENHANCED:</strong> Question Navigation with Time Finalization</p>
            <p>📝 <strong>ENHANCED:</strong> Submission with Complete Question Elapsed Times</p>
            <p>🐛 <strong>DEBUG:</strong> Full Question Timer Debug Information Available</p>
            <p>⚡ <strong>FIXED:</strong> Elapsed Time Persistence Per Question ID</p>
            <p>🎨 <strong>UI:</strong> Enhanced Debug Panels & Question Time Indicators</p>
            <p>📱 <strong>MOBILE:</strong> Question Time Support on Mobile Navigation</p>
            <p>🔒 <strong>SECURE:</strong> Protected Timer System with Recovery</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserPurchaseProvider 
      examDuration={mainTimer} 
      onSecurityBreach={() => {
        console.warn('🚨 Security breach detected in UserPurchase context');
      }}
    >
      <ActiveUserProvider 
        examDuration={mainTimer}
        onSecurityBreach={() => {
          console.warn('🚨 Security breach detected in ActiveUser context');
        }}
      >
        <AllProductProvider 
          examDuration={mainTimer}
          onSecurityBreach={() => {
            console.warn('🚨 Security breach detected in AllProduct context');
          }}
        >
          <ExamContent />
        </AllProductProvider>
      </ActiveUserProvider>
    </UserPurchaseProvider>
  );
};

export default ChainExam;

/* 
ENHANCED QUESTION TIMER FEATURES SUMMARY:

✅ FIXED ELAPSED TIME PER QUESTION:
- Each question ID now stores its accumulated elapsed time
- When navigating between questions, elapsed time is preserved
- Base elapsed time + current session time = total question time

✅ ENHANCED DATABASE INTEGRATION:
- setQuestionElapsedTime() method for direct time setting
- getAllQuestionElapsedTimes() for submission payload
- Proper data loading and persistence across sessions

✅ ADVANCED DEBUG INFORMATION:
- Real-time question timer display in header
- Question navigation grid with time indicators
- Enhanced debug panels with detailed timing info
- Console export functions for debugging

✅ AUTO-SAVE & RECOVERY:
- Auto-save question times every 5 seconds
- Proper finalization when navigating between questions
- Session recovery with question time restoration
- Protected timer system integration

✅ UI ENHANCEMENTS:
- Question time displays in sidebars
- Mobile support with time indicators
- Enhanced modals with question timing summaries
- Progress indicators with timing data

✅ SUBMISSION INTEGRATION:
- Complete question elapsed times in submission payload
- Proper finalization before submission
- Enhanced success/error modals with timing info
- Database cleanup after successful submission

🐛 DEBUG MODE FEATURES:
- Ctrl+Shift+D to toggle debug timer display
- Full question timer debug information
- Console export for question times and debug data
- Real-time tracking status indicators

This implementation ensures that each question's elapsed time is properly tracked,
stored per question ID, and included in the final submission payload for analysis.
*/