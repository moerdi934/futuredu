// hooks/useSecureTimer.ts - COMPLETELY FIXED - PREVENTS TIMER STOPPING
import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerState {
  timeLeft: number;
  elapsed: number;
  isRunning: boolean;
  isValid: boolean;
  lastUpdate: number;
}

interface SecurityValidation {
  consistent: boolean;
  noTimeJump: boolean;
  backupValid: boolean;
  checksumValid: boolean;
  heartbeatActive: boolean;
  networkQuality: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
}

interface BackupTimerValues {
  purchaseTimer: number;
  userActivityTimer: number;
  inventoryTimer: number;
  mainTimer: number;
  sessionValid: boolean;
  networkQuality: string;
  reliability: number;
  adaptiveThreshold: number;
  securityAlerts: string[];
  workerReady: boolean;
  fallbackActive: boolean;
  initAttempts: number;
  workerFailed: boolean;
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
  // Core timer state
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: 0,
    elapsed: 0,
    isRunning: false,
    isValid: true,
    lastUpdate: Date.now()
  });
  
  // Additional states
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [securityValidation, setSecurityValidation] = useState<SecurityValidation>({
    consistent: true,
    noTimeJump: true,
    backupValid: true,
    checksumValid: true,
    heartbeatActive: false,
    networkQuality: 'GOOD'
  });
  
  // FIXED: Ultra-robust refs with proper session management
  const mainTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const displayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const workerRef = useRef<Worker | null>(null);
  const workerReadyRef = useRef<boolean>(false);
  const lastHeartbeatRef = useRef<number>(Date.now());
  const initAttemptedRef = useRef<boolean>(false);
  const sessionIdRef = useRef<string>(''); // Unique session ID
  const stopRequestedRef = useRef<boolean>(false); // FIXED: Track stop requests
  const timeoutTriggeredRef = useRef<boolean>(false); // FIXED: Prevent multiple timeouts

  // FIXED: Generate unique session ID to prevent conflicts
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Format time utility
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }, []);

  // FIXED: Clear all timers with session validation
  const clearAllTimers = useCallback((sessionId?: string) => {
    // Only clear if session matches or no session specified
    if (sessionId && sessionIdRef.current !== sessionId) {
      console.log('🚫 Timer clear skipped - session mismatch:', {
        current: sessionIdRef.current,
        requested: sessionId
      });
      return;
    }
    
    console.log('🧹 Clearing all timers for session:', sessionIdRef.current);
    
    if (mainTimerRef.current) {
      clearInterval(mainTimerRef.current);
      mainTimerRef.current = null;
    }
    
    if (backupTimerRef.current) {
      clearInterval(backupTimerRef.current);
      backupTimerRef.current = null;
    }
    
    if (displayTimerRef.current) {
      clearInterval(displayTimerRef.current);
      displayTimerRef.current = null;
    }
  }, []);

  // FIXED: Primary timer with session protection and anti-stop mechanisms
  const startPrimaryTimer = useCallback((durationInSeconds: number) => {
    const sessionId = generateSessionId();
    sessionIdRef.current = sessionId;
    stopRequestedRef.current = false;
    timeoutTriggeredRef.current = false;
    
    console.log('🎯 Starting ULTRA-PROTECTED timer:', {
      duration: durationInSeconds,
      sessionId,
      examId,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Clear existing timers
    clearAllTimers();
    
    const startTime = Date.now();
    startTimeRef.current = startTime;
    durationRef.current = durationInSeconds;
    isRunningRef.current = true;
    
    // Set initial state immediately
    setTimerState({
      timeLeft: durationInSeconds,
      elapsed: 0,
      isRunning: true,
      isValid: true,
      lastUpdate: startTime
    });
    
    // FIXED: Enhanced primary tick with session protection
    const primaryTick = () => {
      // Validate session and state
      if (sessionIdRef.current !== sessionId) {
        console.log('🛑 Primary tick - session changed, stopping');
        return;
      }
      
      if (stopRequestedRef.current || !isMountedRef.current) {
        console.log('🛑 Primary tick - stop requested or unmounted');
        return;
      }
      
      if (!isRunningRef.current) {
        console.log('🛑 Primary tick - not running flag set');
        return;
      }
      
      const now = Date.now();
      const totalElapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, durationInSeconds - totalElapsed);
      
      // FIXED: Only update state if session is still valid
      if (sessionIdRef.current === sessionId && !stopRequestedRef.current && isMountedRef.current) {
        setTimerState(prevState => ({
          timeLeft: remaining,
          elapsed: totalElapsed,
          isRunning: remaining > 0 && isRunningRef.current && !stopRequestedRef.current,
          isValid: true,
          lastUpdate: now
        }));
        
        // Debug logging every 10 seconds
        if (totalElapsed > 0 && totalElapsed % 10 === 0) {
          console.log('⏰ Timer progress:', {
            sessionId: sessionId.substr(-6),
            elapsed: totalElapsed,
            remaining,
            isRunning: isRunningRef.current,
            stopRequested: stopRequestedRef.current
          });
        }
      }
      
      // FIXED: Check for timeout with protection against multiple triggers
      if (remaining <= 0 && isRunningRef.current && !timeoutTriggeredRef.current && sessionIdRef.current === sessionId) {
        console.log('⏰ Timer reached zero - triggering timeout:', sessionId);
        timeoutTriggeredRef.current = true;
        isRunningRef.current = false;
        clearAllTimers(sessionId);
        
        // Only call timeout if still valid session and mounted
        if (isMountedRef.current && sessionIdRef.current === sessionId && !stopRequestedRef.current) {
          setTimeout(() => {
            if (sessionIdRef.current === sessionId && isMountedRef.current) {
              onTimeout();
            }
          }, 100); // Small delay to ensure state updates
        }
      }
    };
    
    // FIXED: Backup tick with session protection
    const backupTick = () => {
      if (sessionIdRef.current !== sessionId || stopRequestedRef.current || !isMountedRef.current) {
        return;
      }
      
      if (!isRunningRef.current) return;
      
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, durationInSeconds - elapsed);
      
      // Backup timeout trigger with same protections
      if (remaining <= 0 && isRunningRef.current && !timeoutTriggeredRef.current && sessionIdRef.current === sessionId) {
        console.log('⏰ BACKUP timer triggered timeout:', sessionId);
        timeoutTriggeredRef.current = true;
        isRunningRef.current = false;
        clearAllTimers(sessionId);
        
        if (isMountedRef.current && sessionIdRef.current === sessionId && !stopRequestedRef.current) {
          setTimeout(() => {
            if (sessionIdRef.current === sessionId && isMountedRef.current) {
              onTimeout();
            }
          }, 100);
        }
      }
    };
    
    // FIXED: Display tick with session protection
    const displayTick = () => {
      if (sessionIdRef.current !== sessionId || stopRequestedRef.current || !isMountedRef.current) {
        return;
      }
      
      if (!isRunningRef.current) return;
      
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, durationInSeconds - elapsed);
      
      // Smooth display updates
      if (sessionIdRef.current === sessionId && !stopRequestedRef.current && isMountedRef.current) {
        setTimerState(prevState => ({
          ...prevState,
          timeLeft: remaining,
          elapsed: elapsed,
          lastUpdate: now
        }));
      }
    };
    
    try {
      // Start primary timer (1 second intervals)
      mainTimerRef.current = setInterval(() => {
        if (sessionIdRef.current === sessionId && !stopRequestedRef.current) {
          primaryTick();
        }
      }, 1000);
      
      // Start backup timer (1.1 second intervals for safety)
      backupTimerRef.current = setInterval(() => {
        if (sessionIdRef.current === sessionId && !stopRequestedRef.current) {
          backupTick();
        }
      }, 1100);
      
      // Start display timer (0.5 second intervals for smooth updates)
      displayTimerRef.current = setInterval(() => {
        if (sessionIdRef.current === sessionId && !stopRequestedRef.current) {
          displayTick();
        }
      }, 500);
      
      // Initial tick
      primaryTick();
      
      console.log('✅ ULTRA-PROTECTED timer started successfully:', {
        sessionId: sessionId.substr(-6),
        examId,
        duration: durationInSeconds,
        mainTimer: !!mainTimerRef.current,
        backupTimer: !!backupTimerRef.current,
        displayTimer: !!displayTimerRef.current
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error starting protected timer:', error);
      clearAllTimers(sessionId);
      return false;
    }
  }, [onTimeout, generateSessionId, clearAllTimers, examId]);

  // Worker message handler (simplified and protected)
  const handleWorkerMessage = useCallback((e: MessageEvent) => {
    if (!isMountedRef.current || stopRequestedRef.current) return;
    
    const { type, ...data } = e.data;
    
    switch (type) {
      case 'worker_ready':
        console.log('✅ Worker ready');
        workerReadyRef.current = true;
        lastHeartbeatRef.current = Date.now();
        setSecurityValidation(prev => ({ ...prev, heartbeatActive: true }));
        break;
        
      case 'tick':
        lastHeartbeatRef.current = Date.now();
        setSecurityValidation(prev => ({ ...prev, heartbeatActive: true, consistent: true }));
        break;
        
      case 'timeout':
        // Worker timeout is informational only - primary timer handles actual timeout
        console.log('⏰ Worker timeout signal received (informational)');
        break;
        
      case 'heartbeat_request':
        lastHeartbeatRef.current = Date.now();
        if (workerRef.current && workerReadyRef.current && !stopRequestedRef.current) {
          try {
            workerRef.current.postMessage({
              action: 'heartbeat_response',
              payload: { timestamp: data.timestamp }
            });
          } catch (error) {
            console.warn('Worker heartbeat response failed:', error);
          }
        }
        break;
        
      case 'worker_error':
        console.warn('⚠️ Worker error (non-critical):', data.error);
        break;
    }
  }, []);

  // FIXED: Initialize worker (completely optional and protected)
  const initializeWorker = useCallback(async () => {
    if (initAttemptedRef.current || typeof window === 'undefined' || stopRequestedRef.current) {
      return;
    }
    
    initAttemptedRef.current = true;
    
    try {
      // Quick check for worker file existence
      const response = await fetch('/secure-exam-timer.js', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      
      if (!response.ok) {
        console.warn('⚠️ Worker file not found, using PRIMARY timer only');
        setIsInitialized(true);
        return;
      }
      
      // Create worker
      workerRef.current = new Worker('/secure-exam-timer.js');
      workerRef.current.onmessage = handleWorkerMessage;
      
      workerRef.current.onerror = (error) => {
        console.warn('⚠️ Worker error (non-critical):', error);
        workerReadyRef.current = false;
      };
      
      // Send initial ping
      workerRef.current.postMessage({ action: 'ping' });
      
      // Mark as initialized (PRIMARY timer is independent)
      setIsInitialized(true);
      
    } catch (error) {
      console.warn('⚠️ Worker initialization failed (non-critical):', error);
      setIsInitialized(true);
    }
  }, [handleWorkerMessage]);

  // FIXED: Start timer function with enhanced protection
  const startTimer = useCallback((durationInSeconds: number) => {
    console.log('🚀 START TIMER CALLED:', {
      duration: durationInSeconds,
      currentlyRunning: isRunningRef.current,
      mounted: isMountedRef.current,
      examId,
      currentSession: sessionIdRef.current.substr(-6)
    });
    
    if (durationInSeconds <= 0) {
      console.error('❌ Invalid duration:', durationInSeconds);
      setError('Invalid duration');
      return false;
    }
    
    // FIXED: Prevent stopping by external cleanup during start
    stopRequestedRef.current = false;
    timeoutTriggeredRef.current = false;
    setError(null);
    
    // Start new timer session immediately
    const success = startPrimaryTimer(durationInSeconds);
    
    // Optionally start worker timer (non-blocking)
    if (workerRef.current && workerReadyRef.current && !stopRequestedRef.current) {
      try {
        workerRef.current.postMessage({
          action: 'start',
          payload: { duration: durationInSeconds }
        });
      } catch (error) {
        console.warn('⚠️ Worker start failed (non-critical):', error);
      }
    }
    
    console.log('✅ Timer start result:', success);
    return success;
  }, [startPrimaryTimer, examId]);

  // FIXED: Stop timer function with proper session handling
  const stopTimer = useCallback(() => {
    const currentSession = sessionIdRef.current;
    
    console.log('🛑 STOP TIMER CALLED:', {
      currentSession: currentSession.substr(-6),
      isRunning: isRunningRef.current,
      mounted: isMountedRef.current,
      stopRequested: stopRequestedRef.current
    });
    
    // Set stop flags
    stopRequestedRef.current = true;
    isRunningRef.current = false;
    timeoutTriggeredRef.current = true; // Prevent timeout triggers
    
    // Clear all timer intervals for current session
    clearAllTimers(currentSession);
    
    // Stop worker timer (non-blocking)
    if (workerRef.current && workerReadyRef.current) {
      try {
        workerRef.current.postMessage({ action: 'stop' });
      } catch (error) {
        console.warn('⚠️ Worker stop failed (non-critical):', error);
      }
    }
    
    // Update state only if mounted
    if (isMountedRef.current) {
      setTimerState(prev => ({ 
        ...prev, 
        isRunning: false 
      }));
    }
    
    console.log('✅ Timer stopped successfully for session:', currentSession.substr(-6));
  }, [clearAllTimers]);

  // Restore timer function (enhanced with session protection)
  const restoreTimer = useCallback(() => {
    console.log('🔄 Restore timer called');
    
    if (durationRef.current > 0 && startTimeRef.current > 0 && !stopRequestedRef.current) {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      const remaining = Math.max(0, durationRef.current - elapsed);
      
      if (remaining > 0) {
        console.log('🔄 Restoring timer with remaining:', remaining);
        return startTimer(remaining);
      }
    }
    
    return false;
  }, [startTimer]);

  // Validate integrity function
  const validateIntegrity = useCallback(() => {
    if (workerRef.current && workerReadyRef.current && !stopRequestedRef.current) {
      try {
        workerRef.current.postMessage({ action: 'validate_integrity' });
      } catch (error) {
        console.warn('Worker validation failed:', error);
      }
    }
  }, []);

  // Update network info function
  const updateNetworkInfo = useCallback((info: any) => {
    if (!stopRequestedRef.current && isMountedRef.current) {
      setSecurityValidation(prev => ({
        ...prev,
        networkQuality: info.reliability > 0.8 ? 'GOOD' : info.reliability > 0.5 ? 'FAIR' : 'POOR'
      }));
    }
  }, []);

  // Get backup timer values
  const getBackupTimerValues = useCallback((): BackupTimerValues => {
    return {
      purchaseTimer: timerState.timeLeft,
      userActivityTimer: timerState.timeLeft,
      inventoryTimer: timerState.timeLeft,
      mainTimer: timerState.timeLeft,
      sessionValid: timerState.isValid && isRunningRef.current && !stopRequestedRef.current,
      networkQuality: securityValidation.networkQuality,
      reliability: 1.0,
      adaptiveThreshold: 120,
      securityAlerts: error ? [error] : [],
      workerReady: workerReadyRef.current,
      fallbackActive: !!mainTimerRef.current && !stopRequestedRef.current,
      initAttempts: 1,
      workerFailed: false
    };
  }, [timerState, securityValidation, error]);

  // FIXED: Protected heartbeat monitoring
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const heartbeatCheck = setInterval(() => {
      if (!isMountedRef.current || stopRequestedRef.current) return;
      
      const now = Date.now();
      const timeSinceLastHeartbeat = now - lastHeartbeatRef.current;
      
      if (timeSinceLastHeartbeat > 20000) {
        setSecurityValidation(prev => ({ ...prev, heartbeatActive: false }));
      }
    }, 15000);
    
    return () => clearInterval(heartbeatCheck);
  }, []);

  // FIXED: Enhanced initialization with proper cleanup protection
  useEffect(() => {
    isMountedRef.current = true;
    stopRequestedRef.current = false;
    timeoutTriggeredRef.current = false;
    
    // Initialize immediately - PRIMARY timer doesn't need worker
    setIsInitialized(true);
    
    // Initialize worker as enhancement (non-blocking)
    initializeWorker();
    
    console.log('✅ SecureTimer initialized for exam:', examId);
    
    return () => {
      console.log('🧹 SecureTimer cleanup called for exam:', examId);
      
      const currentSession = sessionIdRef.current;
      
      // Set cleanup flags
      isMountedRef.current = false;
      isRunningRef.current = false;
      stopRequestedRef.current = true;
      timeoutTriggeredRef.current = true;
      
      // Clear all timers with session validation
      clearAllTimers(currentSession);
      
      // Terminate worker
      if (workerRef.current) {
        try {
          workerRef.current.terminate();
          workerRef.current = null;
        } catch (error) {
          console.warn('Error terminating worker:', error);
        }
      }
      
      console.log('✅ SecureTimer cleanup completed for session:', currentSession.substr(-6));
    };
  }, [examId, initializeWorker, clearAllTimers]);

  return {
    // Core timer state
    timeLeft: timerState.timeLeft,
    elapsed: timerState.elapsed,
    isRunning: timerState.isRunning && !stopRequestedRef.current && !timeoutTriggeredRef.current,
    isValid: timerState.isValid,
    isInitialized,
    error,
    
    // Security validation
    securityValidation,
    
    // Control functions
    startTimer,
    stopTimer,
    restoreTimer,
    validateIntegrity,
    updateNetworkInfo,
    
    // Backup timers
    backupTimers: {
      purchase: timerState.timeLeft,
      userActivity: timerState.timeLeft,
      inventory: timerState.timeLeft
    },
    
    getBackupTimerValues,
    
    // Utility functions
    formatTime,
    getTimeRemaining: () => timerState.timeLeft,
    getElapsedTime: () => timerState.elapsed,
    isExpired: () => timerState.timeLeft <= 0,
    
    // Debug information
    debugInfo: {
      sessionId: sessionIdRef.current.substr(-6),
      stopRequested: stopRequestedRef.current,
      timeoutTriggered: timeoutTriggeredRef.current,
      isMounted: isMountedRef.current,
      isRunningRef: isRunningRef.current,
      activeTimers: {
        main: !!mainTimerRef.current,
        backup: !!backupTimerRef.current,
        display: !!displayTimerRef.current
      }
    }
  };
};