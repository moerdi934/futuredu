// hooks/useSecureTimer.ts - Complete Fixed Version
import { useState, useEffect, useRef, useCallback } from 'react';
import CryptoJS from 'crypto-js';

interface TimerState {
  timeLeft: number;
  elapsed: number;
  isRunning: boolean;
  isValid: boolean;
  lastUpdate: number;
}

interface BackupTimers {
  purchase: number;
  userActivity: number;
  inventory: number;
}

interface SecurityValidation {
  consistent: boolean;
  noTimeJump: boolean;
  backupValid: boolean;
  checksumValid: boolean;
  heartbeatActive: boolean;
}

interface UseSecureTimerOptions {
  examId: string;
  onTimeout: () => void;
  onSecurityBreach: (reason: string, details?: any) => void;
  onValidationFailure: (reason: string) => void;
}

export const useSecureTimer = ({
  examId,
  onTimeout,
  onSecurityBreach,
  onValidationFailure
}: UseSecureTimerOptions) => {
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: 0,
    elapsed: 0,
    isRunning: false,
    isValid: true,
    lastUpdate: Date.now()
  });
  
  const [backupTimers, setBackupTimers] = useState<BackupTimers>({
    purchase: 0,
    userActivity: 0,
    inventory: 0
  });
  
  const [securityValidation, setSecurityValidation] = useState<SecurityValidation>({
    consistent: true,
    noTimeJump: true,
    backupValid: true,
    checksumValid: true,
    heartbeatActive: true
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const workerRef = useRef<Worker | null>(null);
  const sessionKeyRef = useRef<string>('');
  const lastHeartbeatRef = useRef<number>(Date.now());
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storageKeyRef = useRef<string>('');
  
  // Generate secure session key
  const generateSessionKey = useCallback(() => {
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    const examHash = CryptoJS.MD5(examId).toString().substring(0, 8);
    
    return `${examHash}${timestamp}${random1}${random2}`;
  }, [examId]);
  
  // Initialize Web Worker
  const initializeWorker = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    try {
      workerRef.current = new Worker('/secure-exam-timer.js');
      sessionKeyRef.current = generateSessionKey();
      storageKeyRef.current = `exam_timer_${examId}_${sessionKeyRef.current.substring(0, 8)}`;
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize worker:', error);
      setError('Worker initialization failed');
      return false;
    }
  }, [examId, generateSessionKey]);
  
  // FIXED: Complete Worker Message Handler
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.onmessage = (e) => {
        const { type, ...data } = e.data;
        
        switch (type) {
          case 'tick':
            setTimerState(prev => ({
              ...prev,
              timeLeft: data.remaining,
              elapsed: data.elapsed,
              isRunning: data.remaining > 0,
              lastUpdate: data.timestamp
            }));
            
            setBackupTimers(data.backupTimers);
            
            if (data.integrity) {
              setSecurityValidation(prev => ({
                ...prev,
                consistent: data.integrity.consistent,
                noTimeJump: data.integrity.noTimeJump,
                backupValid: data.integrity.backupValid
              }));
            }
            break;
            
          case 'timeout':
            // FIXED: Only auto-submit on actual timeout
            console.log('🚨 Timer expired (legitimate):', data.reason);
            setTimerState(prev => ({
              ...prev,
              timeLeft: 0,
              isRunning: false
            }));
            onTimeout(); // This is the ONLY legitimate auto-submit for time
            break;
            
          case 'store':
            // Store encrypted timer data
            try {
              localStorage.setItem(storageKeyRef.current, JSON.stringify(data.data));
              console.log('✅ Timer data stored securely');
            } catch (error) {
              console.error('❌ Failed to store timer data:', error);
              setError('Storage failed');
            }
            break;
            
          case 'restored':
            console.log('✅ Timer restored:', data);
            setTimerState(prev => ({
              ...prev,
              timeLeft: data.remaining,
              elapsed: data.elapsed,
              isRunning: true,
              isValid: data.integrity === 'verified'
            }));
            setIsInitialized(true);
            break;
            
          case 'invalid':
            // FIXED: Don't auto-submit on validation failures, just mark as invalid
            console.warn('⚠️ Timer validation failed (not auto-submitting):', data.reason);
            setError(`Timer validation issue: ${data.reason}`);
            setTimerState(prev => ({ ...prev, isValid: false }));
            // DON'T call onValidationFailure here
            break;
            
          case 'security_breach':
            // FIXED: Only handle EXTREME security breaches
            if (data.reason === 'extreme_time_jump' || 
                data.reason === 'checksum_failed_with_timeout') {
              console.error('🚨 EXTREME security breach detected:', data);
              onSecurityBreach(data.reason, data.details);
            } else {
              // Just log other security issues, don't auto-submit
              console.warn('⚠️ Security warning (non-critical):', data);
            }
            break;
            
          case 'heartbeat_request':
            // Respond to worker heartbeat
            lastHeartbeatRef.current = Date.now();
            workerRef.current?.postMessage({
              action: 'heartbeat_response',
              payload: { timestamp: data.timestamp }
            });
            
            setSecurityValidation(prev => ({
              ...prev,
              heartbeatActive: true
            }));
            break;
            
          case 'main_thread_unresponsive':
            // FIXED: Don't auto-submit, just log warning
            console.warn('⚠️ Main thread unresponsive detected (not auto-submitting)');
            setSecurityValidation(prev => ({
              ...prev,
              heartbeatActive: false
            }));
            break;
            
          case 'validation_result':
            setSecurityValidation({
              consistent: data.validation.backupConsistency,
              noTimeJump: !data.validation.timeJump,
              backupValid: data.validation.backupConsistency,
              checksumValid: data.validation.checksumValid,
              heartbeatActive: Date.now() - lastHeartbeatRef.current < 10000
            });
            
            // FIXED: Don't auto-submit on validation results, just update state
            if (!data.validation.backupConsistency || 
                data.validation.timeJump || 
                !data.validation.checksumValid) {
              console.warn('⚠️ Validation issues detected (logged only):', data.validation);
              // Don't call onSecurityBreach here anymore
            }
            break;
            
          case 'unknown_action':
            console.warn('⚠️ Unknown worker action received:', data.action);
            break;
            
          default:
            console.warn('⚠️ Unknown worker message type:', type, data);
            break;
        }
      };
      
      workerRef.current.onerror = (error) => {
        console.error('❌ Worker error:', error);
        setError('Worker error');
        // FIXED: Don't auto-submit on worker errors, just set error state
        // onSecurityBreach('worker_error', error);
      };
    }
  }, [examId, onTimeout, onSecurityBreach, onValidationFailure]);
  
  // Start timer
  const startTimer = useCallback((durationInSeconds: number) => {
    if (!workerRef.current) {
      console.error('❌ Worker not initialized');
      return false;
    }
    
    console.log(`🚀 Starting secure timer: ${durationInSeconds} seconds`);
    
    workerRef.current.postMessage({
      action: 'start',
      payload: {
        duration: durationInSeconds,
        sessionKey: sessionKeyRef.current
      }
    });
    
    setTimerState(prev => ({
      ...prev,
      timeLeft: durationInSeconds,
      elapsed: 0,
      isRunning: true,
      isValid: true
    }));
    
    return true;
  }, []);
  
  // Attempt to restore timer from storage
  const restoreTimer = useCallback(() => {
    if (!workerRef.current) return false;
    
    try {
      const storedData = localStorage.getItem(storageKeyRef.current);
      if (!storedData) {
        console.log('ℹ️ No stored timer data found');
        return false;
      }
      
      const parsedData = JSON.parse(storedData);
      console.log('🔄 Attempting to restore timer from storage');
      
      workerRef.current.postMessage({
        action: 'restore',
        payload: {
          stored: parsedData,
          sessionKey: sessionKeyRef.current
        }
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to restore timer:', error);
      setError('Timer restoration failed');
      return false;
    }
  }, []);
  
  // Stop timer
  const stopTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ action: 'stop' });
      setTimerState(prev => ({ ...prev, isRunning: false }));
    }
  }, []);
  
  // Get backup timer values for context validation
  const getBackupTimerValues = useCallback(() => {
    return {
      purchaseTimer: backupTimers.purchase,
      userActivityTimer: backupTimers.userActivity,
      inventoryTimer: backupTimers.inventory,
      mainTimer: timerState.timeLeft,
      sessionValid: timerState.isValid && securityValidation.consistent
    };
  }, [backupTimers, timerState.timeLeft, timerState.isValid, securityValidation.consistent]);
  
  // Validate timer integrity manually
  const validateIntegrity = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ action: 'validate_request' });
    }
  }, []);
  
  // Initialize worker on mount
  useEffect(() => {
    const success = initializeWorker();
    if (success) {
      // Try to restore timer first
      const restored = restoreTimer();
      if (restored) {
        console.log('🔄 Timer restoration attempted');
      }
    }
    
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ action: 'stop' });
        workerRef.current.terminate();
        workerRef.current = null;
      }
      
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
    };
  }, [initializeWorker, restoreTimer]);
  
  // Monitor heartbeat
  useEffect(() => {
    const checkHeartbeat = () => {
      const timeSinceLastHeartbeat = Date.now() - lastHeartbeatRef.current;
      
      if (timeSinceLastHeartbeat > 15000) { // 15 seconds
        console.warn('⚠️ Worker heartbeat timeout (not auto-submitting)');
        setSecurityValidation(prev => ({
          ...prev,
          heartbeatActive: false
        }));
        // FIXED: Don't auto-submit on heartbeat timeout
        // onSecurityBreach('worker_heartbeat_timeout', { timeSinceLastHeartbeat });
      }
    };
    
    const heartbeatCheck = setInterval(checkHeartbeat, 5000);
    
    return () => clearInterval(heartbeatCheck);
  }, []); // FIXED: Remove onSecurityBreach from dependencies
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up storage on component unmount (optional)
      try {
        localStorage.removeItem(storageKeyRef.current);
      } catch (error) {
        console.warn('Failed to cleanup storage:', error);
      }
    };
  }, []);
  
  return {
    // Timer state
    timeLeft: timerState.timeLeft,
    elapsed: timerState.elapsed,
    isRunning: timerState.isRunning,
    isValid: timerState.isValid,
    isInitialized,
    error,
    
    // Backup timers for context validation
    backupTimers,
    
    // Security validation status
    securityValidation,
    
    // Control functions
    startTimer,
    stopTimer,
    restoreTimer,
    validateIntegrity,
    getBackupTimerValues,
    
    // Utility functions
    formatTime: (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    },
    
    getTimeRemaining: () => timerState.timeLeft,
    getElapsedTime: () => timerState.elapsed,
    isExpired: () => timerState.timeLeft <= 0
  };
};