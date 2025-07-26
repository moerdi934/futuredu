// ChainExam Component - FINAL FIXED VERSION
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import CryptoJS from 'crypto-js';
import ChangeTabPrevention from '../../components/ChangeTabPrevention';
import { useDistributedTimeSync } from '../../hooks/useDistributedTimeSync';
import { useSecureTimer } from '../../hooks/useSecureTimer';

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
}> = ({ workerTimerValues, onSecurityBreach }) => {
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
};

// Enhanced Focus Detection with Web Worker Integration
const FocusDetector: React.FC<{
  onAutoSubmit: (reason: string) => void;
  enabled: boolean;
  timerRunning: boolean;
}> = ({ onAutoSubmit, enabled, timerRunning }) => {
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
};

// Security Status Display
const SecurityStatusDisplay: React.FC<{
  securityValidation: any;
  timerState: any;
}> = ({ securityValidation, timerState }) => {
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
};

// Main Exam Component
const ExamContent: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const params = useParams();
  const exam_string = params?.exam_string as string;

  const debugTimer = useCallback((message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] EXAM: ${message}`, data || '');
  }, []);

  // Initialize distributed time sync with shorter intervals for better accuracy
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
  } = useDistributedTimeSync({
    minInterval: 2 * 60 * 1000,    // 2 minutes
    maxInterval: 5 * 60 * 1000,    // 5 minutes  
    focusThreshold: 1 * 60 * 1000, // 1 minute
    jumpThreshold: 5 * 1000        // 5 seconds
  });
  
  const [examId, setExamId] = useState<number | null>(null);
  const [examScheduleId, setExamScheduleId] = useState<string | null>(null);
  const [examName, setExamName] = useState<string | null>(null);
  const [examType, setExamType] = useState<string>('Try-Out');
  const router = useRouter();

  const [examDbService, setExamDbService] = useState<any>(null);
  const [useAuth, setUseAuth] = useState<any>(null);
  const [useExam, setUseExam] = useState<any>(null);

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
  } = useSecureTimer({
    examId: exam_string || 'default',
    onTimeout: () => {
      // FIXED: This is the ONLY legitimate timer auto-submit
      console.log('🚨 Web Worker timer expired (legitimate)');
      handleAutoSubmit('timer_expired');
    },
    onSecurityBreach: (reason, details) => {
      // FIXED: Only auto-submit on EXTREME security breaches
      if (reason === 'extreme_time_jump' || reason === 'checksum_failed_with_timeout') {
        console.error('🚨 EXTREME security breach - auto-submit:', reason, details);
        handleAutoSubmit(`extreme_security_breach_${reason}`);
      } else {
        console.warn('⚠️ Security warning logged (no auto-submit):', reason, details);
      }
    },
    onValidationFailure: (reason) => {
      // FIXED: Don't auto-submit on validation failures, just log
      console.warn('⚠️ Timer validation issue (no auto-submit):', reason);
    }
  });

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

  useEffect(() => {
    if (isClient) {
      Promise.all([
        import('../../utils/ExamDBService').then(mod => mod.default),
        import('../../context/AuthContext').then(mod => mod.useAuth),
        import('../../context/ExamContext').then(mod => mod.useExam)
      ]).then(([examDbServiceImport, useAuthImport, useExamImport]) => {
        setExamDbService(examDbServiceImport);
        setUseAuth(() => useAuthImport);
        setUseExam(() => useExamImport);
      }).catch(error => {
        console.error('Error loading services', error);
      });
    }
  }, [isClient]);

  const contextData = useExam ? useExam() : {
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
  } = contextData;

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
  const [isInitializing, setIsInitializing] = useState(true);
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

  const examOrder = contextExamOrder || [];
  const currentExamIndex = examOrder.findIndex((exam: ExamOrder) => exam.exam_string === exam_string);

  useEffect(() => {
    if (!isClient) return;
    
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
      setExamScheduleId(contextExamScheduleId.toString());
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
  }, [isClient, contextOriginPath, contextTopicId, contextExamType, contextExamScheduleId, contextActiveSession, examOrder, exam_string]);

  useEffect(() => {
    if (!isClient || !examDbService || loading || questions.length === 0 || currentQuestion >= questions.length) return;
    
    const currentQuestionData = questions[currentQuestion];
    if (!currentQuestionData || !currentQuestionData.id) {
      return;
    }
    
    if (exam_string) {
      examDbService.updateQuestionElapsedTime(exam_string, currentQuestionData.id);
    }
  }, [isClient, examDbService, loading, questions, currentQuestion, exam_string]);

  useEffect(() => {
    if (!isClient) return;
    
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      
      if (examDbService && exam_string && questions.length > 0) {
        examDbService.finalizeCurrentQuestionTime(exam_string);
      }
    };
  }, [isClient, examDbService, exam_string, questions]);

  useEffect(() => {
    if (!isClient || isExamAccessible || !examStartTime) return;
    
    const timer = setInterval(() => {
      const now = enhancedGetServerTime(); // 🔗 USE ENHANCED SERVER TIME
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
  }, [isClient, isExamAccessible, examStartTime, enhancedGetServerTime]);

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

  const findLatestUnfinishedExam = useCallback(async () => {
    if (!isClient || !examDbService) return false;
    
    if (!exam_string && examOrder.length > 0) {
      setLoading(true);
      
      for (let i = examOrder.length - 1; i >= 0; i--) {
        const hasData = await examDbService.hasExamData(examOrder[i].exam_string);
        
        if (hasData) {
          router.push(`/exam/${examOrder[i].exam_string}`);
          return true;
        }
      }
      setLoading(false);
    }
    return false;
  }, [isClient, examDbService, examOrder, exam_string, router]);

  const fetchQuestions = async () => {
    if (!isClient) {
      debugTimer('fetchQuestions: Not client side');
      return;
    }
    
    debugTimer('fetchQuestions: Starting');
    
    try {
      const axios = (await import('axios')).default;
      
      const currentExam = examOrder.find((exam) => exam.exam_string === exam_string);
      
      if (currentExam && currentExam.exam_id) {
        debugTimer('fetchQuestions: Found current exam', { examId: currentExam.exam_id });
        setExamId(currentExam.exam_id);
      }
      
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      debugTimer('fetchQuestions: Making questions API call');
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/byExamString?exam_string=${exam_string}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      debugTimer('fetchQuestions: API response received');

      const decryptedData = decryptData(response.data.encryptedData);
      const parsedData = JSON.parse(decryptedData);
      
      debugTimer('fetchQuestions: Data parsed', {
        questionsCount: parsedData.questions?.length,
        duration: parsedData.duration
      });
      
      if (examSession && !examSession.is_auto_move && getServerTime() < new Date(examSession.start_time).getTime()) {
        debugTimer('fetchQuestions: Exam not accessible yet');
        setExamStartTime(examSession.start_time);
        setShowNotAccessibleModal(true);
        setIsExamAccessible(false);
        return;
      }

      const examDurationInMinutes = parsedData.duration;
      setQuestions(parsedData.questions);
      setDuration(examDurationInMinutes);
      
      debugTimer('fetchQuestions: Questions and duration set', {
        questionsCount: parsedData.questions.length,
        durationMinutes: examDurationInMinutes
      });
      
      await loadExistingSession(currentExam?.exam_id);
      
      setLoading(false);
      setError(false);
      
      debugTimer('fetchQuestions: Complete');
      
    } catch (error) {
      debugTimer('fetchQuestions: Error occurred', error);
      setError(true);
      setLoading(false);
    }
  };

  const checkTimerStatus = useCallback(() => {
    debugTimer('Timer Status Check', {
      timerInitialized,
      timerValid,
      isRunning,
      timeLeft,
      elapsed,
      error: timerError,
      securityValidation,
      backupTimers
    });
  }, [timerInitialized, timerValid, isRunning, timeLeft, elapsed, timerError, securityValidation, backupTimers]);

const loadExistingSession = async (currentExamId?: number) => {
    if (!isClient || !examDbService) {
      debugTimer('loadExistingSession: Not ready', { isClient, examDbService: !!examDbService });
      return;
    }
    
    const examIdToUse = currentExamId || examId;
    
    if (!examScheduleId || !examIdToUse) {
      debugTimer('loadExistingSession: Missing IDs', { examScheduleId, examIdToUse });
      return;
    }
    
    debugTimer('loadExistingSession: Starting', { examScheduleId, examIdToUse });
    
    try {
      const axios = (await import('axios')).default;
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      debugTimer('loadExistingSession: Making API call');
      
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
        
      debugTimer('loadExistingSession: API response', { status: response.data.status });
      
      if (response.data.status === 'success' && response.data.data) {
        const sessionData = response.data.data;
        
        debugTimer('loadExistingSession: Session data received', {
          name: sessionData.name,
          isAutoMove: sessionData.is_auto_move,
          startTime: sessionData.start_time,
          endTime: sessionData.end_time
        });
        
        setExamName(sessionData.name);
        
        // Use enhanced server time
        const serverNow = enhancedGetServerTime();
        const sessionStartTime = new Date(sessionData.start_time).getTime();
        
        if (!sessionData.is_auto_move && serverNow < sessionStartTime) {
          debugTimer('loadExistingSession: Exam not yet accessible', {
            serverNow,
            sessionStartTime,
            difference: sessionStartTime - serverNow
          });
          setExamStartTime(sessionData.start_time);
          setShowNotAccessibleModal(true);
          setIsExamAccessible(false);
          return;
        }
        
        debugTimer('loadExistingSession: Exam is accessible');
        setIsExamAccessible(true);
        
        // Set answers
        setAnswers(sessionData.answers || {});
        await examDbService.saveAnswers(exam_string, sessionData.answers || {});
        
        // Handle question elapsed times
        if (sessionData.question_elapsed_times) {
          debugTimer('loadExistingSession: Setting question elapsed times');
          const examData = await examDbService.getExamData(exam_string) || { 
            answers: sessionData.answers || {}, 
            startTime: enhancedGetServerTime(),
            questionElapsedTimes: {},
            lastQuestionVisit: null
          };
          examData.questionElapsedTimes = sessionData.question_elapsed_times;
          const db = await examDbService.db;
          await db.put('examData', examData, exam_string);
        }
        
        // Calculate remaining time with enhanced server time
        const endTime = new Date(sessionData.end_time).getTime();
        const remainingTime = Math.max(0, Math.floor((endTime - serverNow) / 1000));
        
        debugTimer('loadExistingSession: Time calculation', {
          endTime,
          serverNow,
          remainingTime,
          timerInitialized,
          timerValid
        });
        
        if (remainingTime > 0) {
          debugTimer('🚀 Starting Web Worker timer', { remainingTime });
          
          // Check if timer is initialized
          if (!timerInitialized) {
            debugTimer('⚠️ Timer not initialized yet, waiting...');
            
            // Wait for timer to be initialized
            const waitForTimer = setInterval(() => {
              debugTimer('Checking timer initialization', { timerInitialized, timerValid });
              
              if (timerInitialized) {
                clearInterval(waitForTimer);
                debugTimer('✅ Timer initialized, starting now');
                const success = startTimer(remainingTime);
                debugTimer('Timer start result', { success });
              }
            }, 1000);
            
            // Timeout after 10 seconds
            setTimeout(() => {
              clearInterval(waitForTimer);
              if (!timerInitialized) {
                debugTimer('❌ Timer initialization timeout');
                setError('Timer initialization failed');
              }
            }, 10000);
          } else {
            debugTimer('✅ Timer already initialized, starting immediately');
            const success = startTimer(remainingTime);
            debugTimer('Timer start result', { success });
          }
        } else {
          debugTimer('❌ Time already expired', { remainingTime });
          setIsTimeExpired(true);
          handleAutoSubmit('session_expired');
        }
        
        setExamSession(sessionData);
        return;
      } else {
        debugTimer('loadExistingSession: No active session found');
      }
    } catch (error) {
      debugTimer('loadExistingSession: API error', error);
      
      // Fallback: load saved answers and start fresh timer
      const savedAnswers = await examDbService.getAnswers(exam_string);
      if (savedAnswers) {
        debugTimer('loadExistingSession: Using saved answers');
        setAnswers(savedAnswers);
      }
      
      if (duration > 0) {
        const timerDuration = duration * 60;
        debugTimer('🚀 Starting fresh Web Worker timer', { timerDuration });
        
        if (!timerInitialized) {
          debugTimer('⚠️ Timer not initialized, waiting for fresh start...');
          
          const waitForTimer = setInterval(() => {
            debugTimer('Checking timer initialization for fresh start', { timerInitialized });
            
            if (timerInitialized) {
              clearInterval(waitForTimer);
              debugTimer('✅ Timer initialized, starting fresh timer');
              const success = startTimer(timerDuration);
              debugTimer('Fresh timer start result', { success });
            }
          }, 1000);
          
          setTimeout(() => {
            clearInterval(waitForTimer);
            if (!timerInitialized) {
              debugTimer('❌ Fresh timer initialization timeout');
            }
          }, 10000);
        } else {
          debugTimer('✅ Timer ready, starting fresh timer immediately');
          const success = startTimer(timerDuration);
          debugTimer('Fresh timer start result', { success });
        }
      }
    }
  };  

  useEffect(() => {
    debugTimer('Timer hook state update', {
      timeLeft,
      elapsed,
      isRunning,
      isValid: timerValid,
      isInitialized: timerInitialized,
      error: timerError,
      backupTimers,
      securityValidation
    });
  }, [timeLeft, elapsed, isRunning, timerValid, timerInitialized, timerError, backupTimers, securityValidation]);

  useEffect(() => {
    debugTimer('Timer state changed', {
      timeLeft,
      elapsed,
      isRunning,
      isValid: timerValid,
      isInitialized: timerInitialized,
      error: timerError
    });
  }, [timeLeft, elapsed, isRunning, timerValid, timerInitialized, timerError]);

  // Modified submission handler - auto submit immediately when time expires
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
      await examDbService?.deleteExamData(exam_string);
      
      // Determine next action
      const nextExamIndex = currentExamIndex + 1;
      const hasNextExam = nextExamIndex < examOrder.length;
      
      if (hasNextExam) {
        setNextExam(examOrder[nextExamIndex]?.name || null);
        setShowModalNext(true);
      } else {
        // No more exams, go back to home
        clearExamData();
        router.push(originPath || '/');
      }
    } else {
      setSubmitError(true);
      setShowModalNext(true);
    }
    
    setIsSubmitting(false);
    submissionInProgress.current = false;
  }, [examDbService, exam_string, currentExamIndex, examOrder, nextExam, clearExamData, router, originPath, stopTimer]);

  const handleSubmit = useCallback((e?: React.FormEvent, skipConfirmation = false) => {
    if (e) e.preventDefault();
    
    if (isTimeExpired || skipConfirmation) {
      handleAutoSubmit('manual_submit');
    } else {
      setShowConfirmationModal(true);
    }
  }, [isTimeExpired, handleAutoSubmit]);

  const confirmSubmit = useCallback(async () => {
    setShowConfirmationModal(false);
    await handleAutoSubmit('confirmed_submit');
  }, [handleAutoSubmit]);

  // Debug version of the exam initialization effect
  useEffect(() => {
    if (!isClient || !examDbService) {
      debugTimer('Main initialization: Not ready', { isClient, examDbService: !!examDbService });
      return;
    }
    
    debugTimer('Main initialization: Starting', {
      exam_string,
      examOrder: examOrder.length,
      isInitializing
    });
    
    const initializeExam = async () => {
      setIsInitializing(true);
      debugTimer('initializeExam: Starting');
      
      if (!exam_string) {
        debugTimer('initializeExam: No exam_string, finding latest unfinished');
        await findLatestUnfinishedExam();
      } else {
        debugTimer('initializeExam: exam_string exists, fetching questions');
        await fetchQuestions();
      }
      
      setIsInitializing(false);
      debugTimer('initializeExam: Complete');
    };
    
    initializeExam();
  }, [isClient, examDbService]);

  useEffect(() => {
    if (!isClient || !examDbService || !exam_string || isInitializing) return;
    
    setLoading(true);
    setQuestions([]);
    setDuration(0);
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
  }, [isClient, examDbService, exam_string, isInitializing]);

  useEffect(() => {
    if (!isClient || !error || isInitializing) return;
    
    const retryTimeout = setTimeout(() => {
      fetchQuestions();
    }, 5000);

    return () => clearTimeout(retryTimeout);
  }, [isClient, error, isInitializing]);

  // Auto-save mechanism
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
  }, [isClient, loading, answers, timeLeft, isRunning]);

  const saveExamSession = async () => {
    if (!isClient || !examDbService) return false;
    
    setAutoSaving(true);
    
    try {
      const axios = (await import('axios')).default;
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
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
  };

  const handleChange = async (id: number, value: any) => {
    if (!examDbService) return;
    
    const updatedAnswers = {
      ...answers,
      [id]: value
    };
    setAnswers(updatedAnswers);
    await examDbService.saveAnswers(exam_string, updatedAnswers);
  };

  const handleTrueFalseChange = async (id: number, index: number, value: any) => {
    if (!examDbService) return;
    
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
  };

  const handleRetrySubmit = () => {
    handleAutoSubmit('retry');
  };

  const handleNavigation = async (index: number) => {
    if (!examDbService || questions.length === 0 || currentQuestion >= questions.length) return;
    
    if (exam_string && questions[currentQuestion] && questions[currentQuestion].id) {
      await examDbService.updateQuestionElapsedTime(exam_string, questions[currentQuestion].id);
    }
    
    setCurrentQuestion(index);
  };

  const isAnswered = (id: number) => {
    return answers[id] !== undefined && isAnswerFilled(answers[id]);
  };

  const submitToServer = async (shouldScore = false): Promise<boolean> => {
    if (!isClient || !examDbService) return false;
    
    setSubmitLoading(true);
    setSubmitError(false);
    
    try {
      const axios = (await import('axios')).default;
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
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
  };

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

  const handleClose = async () => {
    stopTimer();
    clearExamData();
    router.push(originPath || '/');
  };

  const handleRetryAccess = async () => {
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
        
        // 🔗 USE ENHANCED SERVER TIME
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
      // 🔗 USE ENHANCED SERVER TIME for fallback
      if (examStartTime && enhancedGetServerTime() >= new Date(examStartTime).getTime()) {
        setIsExamAccessible(true);
        setShowNotAccessibleModal(false);
        fetchQuestions();
      }
    }
  };

  if (!isClient) {
    return null;
  }

  if (loading) {
    return (
      <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
          <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">Loading Exam...</h2>
          <p className="tw-text-violet-600 tw-mt-2">Please wait while we prepare your questions</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="tw-text-sm tw-text-gray-500 tw-mt-2 tw-space-y-1">
              <p>Time sync: {syncCount} syncs, offset: {timeOffset}ms</p>
              <p>Worker timer: {timerInitialized ? 'Initialized' : 'Loading...'}</p>
              {timerError && <p className="tw-text-red-600">Timer error: {timerError}</p>}
            </div>
          )}
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
            onClick={fetchQuestions}
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
          // 🔗 ADD SYNC INTEGRATION DATA
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
                      <p>Sync: {syncCount}x | Offset: {timeOffset}ms | {isOnline ? '🟢' : '🔴'}</p>
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
                    Security: {securityValidation.networkQuality}
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
                            Timer: {timerInitialized ? 'Ready' : 'Loading'}
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
                            Sync: {syncCount}x | Network: {isOnline ? 'Online' : 'Offline'}
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
                      Sync: {syncCount}x | Timer: {timerInitialized ? 'Ready' : 'Loading'}
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
                  Once submitted, you won&apos;t be able to change your answers for this section.
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
        
          {/* Next Exam Modal - Enhanced */}
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
                    Processing Submission...
                  </div>
                ) : isTimeExpired ? (
                  "Time Expired"
                ) : nextExam ? "Continue to Next Exam?" : "Completed"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {submitLoading ? (
                <div className="tw-text-center tw-py-4">
                  <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
                  <p className="tw-text-lg tw-font-medium">Processing your answers...</p>
                  <p className="tw-text-gray-600">Please wait a moment</p>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="tw-text-xs tw-text-gray-500 tw-bg-gray-50 tw-p-2 tw-rounded tw-mt-3">
                      Sync: {Math.round((reliability || 0) * 100)}% | 
                      Network: {Math.round(networkLatency || 0)}ms |
                      Offset: {timeOffset > 0 ? '+' : ''}{Math.round(timeOffset)}ms |
                      Mode: {getBackupTimerValues().fallbackActive ? 'Fallback' : 'Worker'}
                    </div>
                  )}
                </div>
              ) : submitError ? (
                <div className="tw-py-2">
                  <Alert variant="danger" className="tw-mb-4">
                    <p className="tw-font-bold tw-mb-2">Submission failed</p>
                    <p>Please try submitting again.</p>
                    {process.env.NODE_ENV === 'development' && (
                      <div className="tw-text-xs tw-mt-2">
                        Network Status: {isOnline ? 'Online' : 'Offline'} | 
                        Quality: {securityValidation.networkQuality}
                      </div>
                    )}
                  </Alert>
                </div>
              ) : isTimeExpired ? (
                <div className="tw-p-2 tw-text-center">
                  <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
                    <Clock className="tw-h-16 tw-w-16 tw-text-violet-600 tw-mx-auto tw-mb-2" />
                    <p className="tw-text-xl tw-font-medium tw-text-violet-800 tw-mb-2">Exam time has expired!</p>
                    <p className="tw-text-violet-700">
                      Your answers have been submitted automatically by the enhanced Web Worker timer.
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                      <div className="tw-text-xs tw-text-violet-600 tw-bg-violet-100 tw-p-2 tw-rounded tw-mt-2">
                        Final sync quality: {Math.round((reliability || 0) * 100)}% | 
                        Network stability: {securityValidation.networkQuality} |
                        Timer mode: {getBackupTimerValues().fallbackActive ? 'Fallback' : 'Worker'}
                      </div>
                    )}
                  </div>
                  <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
                    <div className="tw-flex tw-items-center tw-mb-2">
                      <FileCheck className="tw-text-violet-600 tw-mr-2" size={18} />
                      <span className="tw-font-medium tw-text-violet-800">Exam Summary</span>
                    </div>
                    <p className="tw-text-violet-700 tw-mb-2">
                      <span className="tw-font-medium">Answered:</span> {getFilledAnswersCount()} of {questions.length} questions
                    </p>
                    <p className="tw-text-violet-700 tw-mb-2">
                      <span className="tw-font-medium">Elapsed Time:</span> {formatTime(elapsed)}
                    </p>
                  </div>
                </div>
              ) : nextExam ? (
                <div className="tw-p-2">
                  <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4 tw-text-center">
                    <FileCheck className="tw-h-12 tw-w-12 tw-text-violet-600 tw-mx-auto tw-mb-2" />
                    <p className="tw-text-lg tw-font-medium tw-text-violet-800 tw-mb-2">Section completed!</p>
                    <p className="tw-text-violet-700">
                      Continue to <span className="tw-font-semibold">{nextExam}</span>.
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                      <div className="tw-text-xs tw-text-violet-600 tw-bg-violet-100 tw-p-2 tw-rounded tw-mt-2">
                        Session sync quality: {Math.round((reliability || 0) * 100)}%
                      </div>
                    )}
                  </div>
                  <p className="tw-text-center tw-text-gray-600">Are you ready to continue?</p>
                </div>
              ) : (
                <div className="tw-p-2 tw-text-center">
                  <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
                    <Check className="tw-h-16 tw-w-16 tw-text-violet-600 tw-mx-auto tw-mb-2" />
                    <p className="tw-text-xl tw-font-medium tw-text-violet-800 tw-mb-2">Congratulations!</p>
                    <p className="tw-text-violet-700">
                      You have completed all exams successfully.
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                      <div className="tw-text-xs tw-text-violet-600 tw-bg-violet-100 tw-p-2 tw-rounded tw-mt-2">
                        Total sync sessions: {syncCount} | 
                        Final quality: {Math.round((reliability || 0) * 100)}% |
                        Security: {securityValidation.networkQuality}
                      </div>
                    )}
                  </div>
                  <p className="tw-text-gray-600">Thank you for your participation!</p>
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
                      Retry Submission
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="secondary" 
                        onClick={handleClose}
                      >
                        Back to Home
                      </Button>
                      {nextExam && (
                        <Button 
                          variant="primary" 
                          className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center"
                          onClick={handleNextExam}
                        >
                          Continue <ArrowRight className="tw-ml-1" size={16} />
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}
            </Modal.Footer>
          </Modal>

          {/* Not Accessible Modal - Enhanced */}
          <Modal 
            show={showNotAccessibleModal} 
            onHide={() => setShowNotAccessibleModal(false)}
            centered
            backdrop="static"
          >
            <Modal.Header className="tw-bg-violet-50">
              <Modal.Title className="tw-text-violet-800 tw-flex tw-items-center">
                <Clock className="tw-mr-2 tw-text-violet-600" size={20} />
                Exam Not Available
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="tw-p-2 tw-text-center">
                <p className="tw-text-lg tw-font-medium tw-mb-3 tw-text-violet-900">
                  This exam is not available yet.
                </p>
                
                {examStartTime && (
                  <div className="tw-bg-violet-50 tw-p-4 tw-rounded-lg tw-mb-4">
                    <p className="tw-text-violet-700 tw-mb-2">
                      Scheduled start time:
                    </p>
                    <p className="tw-text-lg tw-font-medium tw-text-violet-800">
                      {new Date(examStartTime).toLocaleString()}
                    </p>
                    
                    <div className="tw-mt-4">
                      <p className="tw-text-violet-600">Available in:</p>
                      <div className="tw-text-2xl tw-font-mono tw-font-bold tw-text-violet-700 tw-mt-2">
                        {countdown}
                      </div>
                    </div>
                    
{process.env.NODE_ENV === 'development' && (
                      <div className="tw-text-xs tw-text-violet-600 tw-bg-violet-100 tw-p-2 tw-rounded tw-mt-2">
                        Server time sync: {timeOffset > 0 ? '+' : ''}{Math.round(timeOffset)}ms | 
                        Network: {Math.round(networkLatency || 0)}ms |
                        Quality: {Math.round((reliability || 0) * 100)}%
                      </div>
                    )}
                  </div>
                )}
                
                <p className="tw-text-gray-600 tw-text-sm">
                  Please wait until the scheduled time to access this exam.
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setShowNotAccessibleModal(false);
                  router.push(originPath || '/');
                }}
                className="tw-border-2 tw-border-violet-200 tw-text-violet-700 hover:tw-bg-violet-50"
              >
                Back to Home
              </Button>
              <Button 
                variant="primary" 
                onClick={handleRetryAccess}
                className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700"
              >
                Check Again
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Enhanced Timer Error Modal with detailed diagnostics */}
          {timerError && (
            <Modal 
              show={!!timerError} 
              onHide={() => {}}
              centered
              backdrop="static"
              keyboard={false}
            >
              <Modal.Header className="tw-bg-red-50">
                <Modal.Title className="tw-text-red-800 tw-flex tw-items-center">
                  <ShieldAlert className="tw-mr-2 tw-text-red-600" size={20} />
                  Enhanced Timer System Error
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="tw-p-2 tw-text-center">
                  <ShieldAlert className="tw-h-16 tw-w-16 tw-text-red-600 tw-mx-auto tw-mb-4" />
                  <p className="tw-text-lg tw-font-medium tw-text-red-800 tw-mb-2">
                    Enhanced Web Worker Timer Error
                  </p>
                  <p className="tw-text-red-700 tw-mb-4">
                    {timerError}
                  </p>
                  
                  {process.env.NODE_ENV === 'development' && (
                    <div className="tw-bg-red-50 tw-p-4 tw-rounded-lg tw-mb-4 tw-text-left">
                      <h4 className="tw-font-semibold tw-text-red-800 tw-mb-2">System Diagnostics:</h4>
                      <div className="tw-text-sm tw-text-red-700 tw-space-y-1">
                        <p>• Network Status: {isOnline ? 'Online' : 'Offline'}</p>
                        <p>• Sync Quality: {Math.round((reliability || 0) * 100)}%</p>
                        <p>• Network Latency: {Math.round(networkLatency || 0)}ms</p>
                        <p>• Time Offset: {timeOffset > 0 ? '+' : ''}{Math.round(timeOffset)}ms</p>
                        <p>• Security Level: {securityValidation.networkQuality}</p>
                        <p>• Timer Initialized: {timerInitialized ? 'Yes' : 'No'}</p>
                        <p>• Worker Valid: {timerValid ? 'Yes' : 'No'}</p>
                        <p>• Fallback Active: {getBackupTimerValues().fallbackActive ? 'Yes' : 'No'}</p>
                        <p>• Init Attempts: {getBackupTimerValues().initAttempts}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="tw-bg-red-50 tw-p-4 tw-rounded-lg tw-mb-4 tw-text-left">
                    <h4 className="tw-font-semibold tw-text-red-800 tw-mb-2">Possible causes:</h4>
                    <ul className="tw-text-sm tw-text-red-700 tw-space-y-1">
                      <li>• Enhanced Web Worker not supported in this browser</li>
                      <li>• Local storage is disabled or corrupted</li>
                      <li>• Browser security settings blocking workers</li>
                      <li>• Network instability affecting timer synchronization</li>
                      <li>• Timer data corruption detected by security validation</li>
                      <li>• System clock manipulation detected</li>
                      <li>• Worker script failed to load from /secure-exam-timer.js</li>
                    </ul>
                  </div>
                  <p className="tw-text-gray-600 tw-text-sm">
                    The exam will be automatically submitted for your security with current progress saved.
                    {getBackupTimerValues().fallbackActive && " Fallback timer is active."}
                  </p>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button 
                  variant="primary" 
                  className="tw-bg-red-600 tw-border-0 hover:tw-bg-red-700"
                  onClick={() => handleAutoSubmit('enhanced_timer_error')}
                >
                  Submit Exam Now
                </Button>
              </Modal.Footer>
            </Modal>
          )}

          {/* Enhanced Network Status Indicator (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="tw-fixed tw-bottom-4 tw-left-4 tw-z-40">
              <div className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-p-3 tw-border tw-max-w-xs">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <div className={`tw-w-3 tw-h-3 tw-rounded-full ${isOnline ? 'tw-bg-green-500' : 'tw-bg-red-500'}`} />
                  <span className="tw-font-semibold tw-text-sm">
                    Network: {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="tw-space-y-1 tw-text-xs">
                  <div className="tw-flex tw-justify-between">
                    <span>Sync Count:</span>
                    <span>{syncCount}x</span>
                  </div>
                  <div className="tw-flex tw-justify-between">
                    <span>Reliability:</span>
                    <span>{Math.round((reliability || 0) * 100)}%</span>
                  </div>
                  <div className="tw-flex tw-justify-between">
                    <span>Latency:</span>
                    <span>{Math.round(networkLatency || 0)}ms</span>
                  </div>
                  <div className="tw-flex tw-justify-between">
                    <span>Time Offset:</span>
                    <span>{timeOffset > 0 ? '+' : ''}{Math.round(timeOffset)}ms</span>
                  </div>
                  <div className="tw-flex tw-justify-between">
                    <span>Quality:</span>
                    <span className={`${
                      securityValidation.networkQuality === 'EXCELLENT' ? 'tw-text-green-600' :
                      securityValidation.networkQuality === 'GOOD' ? 'tw-text-blue-600' :
                      securityValidation.networkQuality === 'FAIR' ? 'tw-text-yellow-600' : 'tw-text-red-600'
                    }`}>
                      {securityValidation.networkQuality}
                    </span>
                  </div>
                </div>
                
                <div className="tw-mt-2 tw-pt-2 tw-border-t tw-border-gray-200">
                  <div className="tw-text-xs tw-font-medium tw-mb-1">Timer Status:</div>
                  <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs">
                    <div className={`tw-w-2 tw-h-2 tw-rounded-full ${timerInitialized ? 'tw-bg-green-500' : 'tw-bg-red-500'}`} />
                    <span>Worker: {timerInitialized ? 'Ready' : 'Loading'}</span>
                  </div>
                  <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-mt-1">
                    <div className={`tw-w-2 tw-h-2 tw-rounded-full ${timerValid ? 'tw-bg-green-500' : 'tw-bg-red-500'}`} />
                    <span>Valid: {timerValid ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-mt-1">
                    <div className={`tw-w-2 tw-h-2 tw-rounded-full ${securityValidation.heartbeatActive ? 'tw-bg-green-500' : 'tw-bg-red-500'}`} />
                    <span>Heartbeat: {securityValidation.heartbeatActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-mt-1">
                    <div className={`tw-w-2 tw-h-2 tw-rounded-full ${getBackupTimerValues().fallbackActive ? 'tw-bg-yellow-500' : 'tw-bg-green-500'}`} />
                    <span>Mode: {getBackupTimerValues().fallbackActive ? 'Fallback' : 'Worker'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Adaptive Security Notice (only shown when network quality is poor) */}
          {securityValidation.networkQuality === 'POOR' && (
            <div className="tw-fixed tw-top-20 tw-right-4 tw-z-40 tw-max-w-sm">
              <Alert variant="warning" className="tw-border-yellow-300 tw-bg-yellow-50">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <ShieldAlert className="tw-text-yellow-600" size={16} />
                  <span className="tw-font-semibold tw-text-yellow-800">Network Quality Alert</span>
                </div>
                <p className="tw-text-sm tw-text-yellow-700">
                  Poor network conditions detected. Security thresholds have been automatically adjusted 
                  to prevent false positives while maintaining exam integrity.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="tw-text-xs tw-text-yellow-600 tw-mt-2 tw-bg-yellow-100 tw-p-2 tw-rounded">
                    Adaptive threshold: {Math.max(120, (networkLatency || 0) * 3 / 1000)}s | 
                    Base reliability: {Math.round((reliability || 0) * 100)}% |
                    Timer mode: {getBackupTimerValues().fallbackActive ? 'Fallback' : 'Worker'}
                  </div>
                )}
              </Alert>
            </div>
          )}

          {/* Enhanced Time Sync Status Indicator (only when sync issues detected) */}
          {Math.abs(timeOffset) > 10000 && ( // Show only if offset > 10 seconds
            <div className="tw-fixed tw-top-32 tw-right-4 tw-z-40 tw-max-w-sm">
              <Alert variant="info" className="tw-border-blue-300 tw-bg-blue-50">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <Clock className="tw-text-blue-600" size={16} />
                  <span className="tw-font-semibold tw-text-blue-800">Time Sync Active</span>
                </div>
                <p className="tw-text-sm tw-text-blue-700">
                  Large time difference detected ({timeOffset > 0 ? '+' : ''}{Math.round(timeOffset / 1000)}s). 
                  Enhanced time synchronization is compensating automatically.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="tw-text-xs tw-text-blue-600 tw-mt-2 tw-bg-blue-100 tw-p-2 tw-rounded">
                    Raw offset: {Math.round(timeOffset)}ms | 
                    Timezone: {Math.round((timezoneOffset || 0) / 1000 / 60)}min |
                    StdDev: {Math.round(offsetStdDev || 0)}ms |
                    Timer: {getBackupTimerValues().fallbackActive ? 'Fallback' : 'Worker'}
                  </div>
                )}
              </Alert>
            </div>
          )}

          {/* Worker Loading Status (only when timer not initialized) */}
          {!timerInitialized && (
            <div className="tw-fixed tw-top-44 tw-right-4 tw-z-40 tw-max-w-sm">
              <Alert variant="info" className="tw-border-blue-300 tw-bg-blue-50">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <Loader2 className="tw-text-blue-600 tw-animate-spin" size={16} />
                  <span className="tw-font-semibold tw-text-blue-800">Timer Initializing</span>
                </div>
                <p className="tw-text-sm tw-text-blue-700">
                  Enhanced Web Worker timer is loading. If this takes too long, fallback timer will activate automatically.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="tw-text-xs tw-text-blue-600 tw-mt-2 tw-bg-blue-100 tw-p-2 tw-rounded">
                    Attempts: {getBackupTimerValues().initAttempts} | 
                    Worker Ready: {getBackupTimerValues().workerReady ? 'Yes' : 'No'} |
                    Error: {timerError || 'None'}
                  </div>
                )}
              </Alert>
            </div>
          )}
        </div>
      </ChangeTabPrevention>
    </>
  );
};

// Main ChainExam Component with All Providers and Web Worker Integration
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