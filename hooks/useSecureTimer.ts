// hooks/useSecureTimer.ts - FINAL FIXED VERSION
import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerState {
  timeLeft: number;
  elapsed: number;
  isRunning: boolean;
  isValid: boolean;
  lastUpdate: number;
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
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const workerRef = useRef<Worker | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const workerReadyRef = useRef<boolean>(false);
  const initAttemptedRef = useRef<boolean>(false);
  const workerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const debugLog = useCallback((message: string, data?: any) => {
    console.log(`[TIMER] ${message}`, data || '');
  }, []);

  // Simple fallback timer
  const startFallbackTimer = useCallback((durationInSeconds: number) => {
    debugLog('Starting fallback timer', { duration: durationInSeconds });
    
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
    }
    
    const startTime = Date.now();
    
    setTimerState({
      timeLeft: durationInSeconds,
      elapsed: 0,
      isRunning: true,
      isValid: true,
      lastUpdate: startTime
    });
    
    fallbackTimerRef.current = setInterval(() => {
      const now = Date.now();
      const totalElapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, durationInSeconds - totalElapsed);
      
      setTimerState({
        timeLeft: remaining,
        elapsed: totalElapsed,
        isRunning: remaining > 0,
        isValid: true,
        lastUpdate: now
      });
      
      if (remaining <= 0) {
        debugLog('Fallback timer expired');
        clearInterval(fallbackTimerRef.current!);
        onTimeout();
      }
    }, 1000);
    
    debugLog('Fallback timer started successfully');
  }, [onTimeout, debugLog]);

  // Worker message handler
  const handleWorkerMessage = useCallback((e: MessageEvent) => {
    const { type, ...data } = e.data;
    debugLog(`Worker message: ${type}`, data);
    
    switch (type) {
      case 'worker_ready':
        debugLog('Worker is ready!');
        workerReadyRef.current = true;
        
        // CRITICAL FIX: Set isInitialized immediately when worker is ready
        setIsInitialized(true);
        setError(null);
        
        // Clear the timeout since worker is ready
        if (workerTimeoutRef.current) {
          clearTimeout(workerTimeoutRef.current);
          workerTimeoutRef.current = null;
        }
        break;
        
      case 'tick':
        setTimerState({
          timeLeft: data.remaining,
          elapsed: data.elapsed,
          isRunning: data.remaining > 0,
          isValid: true,
          lastUpdate: data.timestamp
        });
        break;
        
      case 'timeout':
        debugLog('Worker timer expired');
        setTimerState(prev => ({ ...prev, timeLeft: 0, isRunning: false }));
        onTimeout();
        break;
        
      case 'worker_error':
        debugLog('Worker error', data.error);
        setError(data.error);
        break;
        
      case 'heartbeat_request':
        if (workerRef.current) {
          workerRef.current.postMessage({
            action: 'heartbeat_response',
            payload: { timestamp: data.timestamp }
          });
        }
        break;
    }
  }, [onTimeout, debugLog]);

  // Initialize worker with better error handling
  const initializeWorker = useCallback(async () => {
    if (initAttemptedRef.current) {
      debugLog('Worker initialization already attempted');
      return;
    }
    
    initAttemptedRef.current = true;
    debugLog('Initializing worker...');
    
    try {
      // First check if we're in a browser environment
      if (typeof window === 'undefined' || typeof Worker === 'undefined') {
        throw new Error('Worker not supported in this environment');
      }

      // Check if worker file exists with better error handling
      try {
        const response = await fetch('/secure-exam-timer.js', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          throw new Error(`Worker file not found: ${response.status} ${response.statusText}`);
        }
        
        debugLog('Worker file found, creating worker...');
      } catch (fetchError) {
        debugLog('Worker file check failed', fetchError);
        throw new Error('Worker file not accessible');
      }
      
      // Create worker with error handling
      try {
        workerRef.current = new Worker('/secure-exam-timer.js');
        debugLog('Worker created successfully');
      } catch (workerError) {
        debugLog('Failed to create worker', workerError);
        throw new Error('Failed to create worker instance');
      }
      
      // Set up event handlers
      workerRef.current.onmessage = handleWorkerMessage;
      
      workerRef.current.onerror = (error) => {
        debugLog('Worker runtime error', error);
        setError(`Worker error: ${error.message || 'Unknown error'}`);
        
        // Mark as initialized even on error so we can use fallback
        if (!isInitialized) {
          setIsInitialized(true);
        }
      };
      
      workerRef.current.onmessageerror = (error) => {
        debugLog('Worker message error', error);
        setError('Worker message error');
      };
      
      // Send initial ping
      debugLog('Sending ping to worker...');
      workerRef.current.postMessage({ action: 'ping' });
      
      // CRITICAL FIX: Much shorter timeout since worker loads quickly
      workerTimeoutRef.current = setTimeout(() => {
        if (!workerReadyRef.current) {
          debugLog('Worker timeout - marking as initialized for fallback');
          setError('Worker timeout');
          setIsInitialized(true); // Still mark as initialized to allow fallback
        }
      }, 2000); // Reduced to 2 seconds since your worker loads in ~1 second
      
    } catch (error) {
      debugLog('Worker initialization failed', error);
      setError(`Worker initialization failed: ${error.message}`);
      setIsInitialized(true); // Mark as initialized to enable fallback timer
    }
  }, [handleWorkerMessage, debugLog, isInitialized]);

  // Start timer function with better fallback logic
  const startTimer = useCallback((durationInSeconds: number) => {
    debugLog('Starting timer', { 
      duration: durationInSeconds, 
      workerReady: workerReadyRef.current,
      workerExists: !!workerRef.current,
      isInitialized,
      error
    });
    
    if (durationInSeconds <= 0) {
      setError('Invalid duration');
      return false;
    }
    
    // Clear any existing fallback timer
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
    }
    
    // CRITICAL FIX: Check worker status more accurately
    const canUseWorker = workerRef.current && workerReadyRef.current && !error;
    
    // Try worker first if available and ready
    if (canUseWorker) {
      debugLog('Using worker timer');
      try {
        workerRef.current!.postMessage({
          action: 'start',
          payload: { duration: durationInSeconds }
        });
        
        debugLog('Worker timer started successfully');
        return true;
      } catch (workerError) {
        debugLog('Worker start failed, falling back', workerError);
        // Fall through to fallback timer
      }
    } else {
      debugLog('Worker not available, using fallback', {
        hasWorker: !!workerRef.current,
        workerReady: workerReadyRef.current,
        hasError: !!error,
        isInitialized
      });
    }
    
    // Use fallback timer
    startFallbackTimer(durationInSeconds);
    return true;
  }, [startFallbackTimer, debugLog, isInitialized, error]);

  // Stop timer function
  const stopTimer = useCallback(() => {
    debugLog('Stopping timer');
    
    // Stop worker timer
    if (workerRef.current && workerReadyRef.current) {
      try {
        workerRef.current.postMessage({ action: 'stop' });
      } catch (error) {
        debugLog('Error stopping worker timer', error);
      }
    }
    
    // Stop fallback timer
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, [debugLog]);

  // Initialize on mount with better timing
  useEffect(() => {
    debugLog('Hook mounted, initializing...');
    
    // CRITICAL FIX: Initialize immediately instead of setTimeout
    initializeWorker();
    
    return () => {
      debugLog('Hook unmounting, cleaning up...');
      
      // Clear timeouts
      if (workerTimeoutRef.current) {
        clearTimeout(workerTimeoutRef.current);
      }
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      // Terminate worker
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      
      // Clear fallback timer
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
      }
    };
  }, []); // Empty deps array

  // Effect to handle initialization state changes
  useEffect(() => {
    debugLog('Initialization state changed', {
      isInitialized,
      error,
      workerReady: workerReadyRef.current
    });
  }, [isInitialized, error, debugLog]);

  // CRITICAL FIX: Add effect to monitor worker ready state changes
  useEffect(() => {
    debugLog('Worker ready state update', {
      workerReady: workerReadyRef.current,
      isInitialized,
      hasWorker: !!workerRef.current
    });
  }, [isInitialized, debugLog]);

  return {
    // Timer state
    timeLeft: timerState.timeLeft,
    elapsed: timerState.elapsed,
    isRunning: timerState.isRunning,
    isValid: timerState.isValid,
    isInitialized,
    error,
    
    // Control functions
    startTimer,
    stopTimer,
    
    // Dummy functions for compatibility
    restoreTimer: () => false,
    validateIntegrity: () => {},
    updateNetworkInfo: () => {},
    
    // Mock values for compatibility
    backupTimers: {
      purchase: timerState.timeLeft,
      userActivity: timerState.timeLeft,
      inventory: timerState.timeLeft
    },
    
    securityValidation: {
      consistent: true,
      noTimeJump: true,
      backupValid: true,
      checksumValid: true,
      heartbeatActive: workerReadyRef.current,
      networkQuality: 'GOOD' as const
    },
    
    getBackupTimerValues: () => ({
      purchaseTimer: timerState.timeLeft,
      userActivityTimer: timerState.timeLeft,
      inventoryTimer: timerState.timeLeft,
      mainTimer: timerState.timeLeft,
      sessionValid: true,
      networkQuality: 'GOOD',
      reliability: 1.0,
      adaptiveThreshold: 120,
      securityAlerts: [],
      workerReady: workerReadyRef.current,
      fallbackActive: !!fallbackTimerRef.current,
      initAttempts: 1,
      workerFailed: !!error && !workerReadyRef.current
    }),
    
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