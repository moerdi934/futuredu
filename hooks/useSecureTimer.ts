// hooks/useSecureTimer.ts - FIXED SIMPLE VERSION
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
    
    debugLog('Fallback timer started');
  }, [onTimeout, debugLog]);

  // Worker message handler
  const handleWorkerMessage = useCallback((e: MessageEvent) => {
    const { type, ...data } = e.data;
    debugLog(`Worker message: ${type}`, data);
    
    switch (type) {
      case 'worker_ready':
        debugLog('Worker is ready!');
        workerReadyRef.current = true;
        setIsInitialized(true);
        setError(null);
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

  // Initialize worker
  const initializeWorker = useCallback(async () => {
    if (initAttemptedRef.current) return;
    initAttemptedRef.current = true;
    
    debugLog('Initializing worker...');
    
    try {
      // Check if worker file exists
      const response = await fetch('/secure-exam-timer.js', { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('Worker file not found');
      }
      
      // Create worker
      workerRef.current = new Worker('/secure-exam-timer.js');
      
      workerRef.current.onmessage = handleWorkerMessage;
      
      workerRef.current.onerror = (error) => {
        debugLog('Worker error', error);
        setError('Worker failed to load');
        setIsInitialized(true);
      };
      
      // Send ping
      workerRef.current.postMessage({ action: 'ping' });
      
      // Timeout fallback
      setTimeout(() => {
        if (!workerReadyRef.current) {
          debugLog('Worker timeout - using fallback');
          setError('Worker timeout');
          setIsInitialized(true);
        }
      }, 3000);
      
    } catch (error) {
      debugLog('Failed to create worker', error);
      setError('Worker initialization failed');
      setIsInitialized(true);
    }
  }, [handleWorkerMessage, debugLog]);

  // Start timer function
  const startTimer = useCallback((durationInSeconds: number) => {
    debugLog('Starting timer', { duration: durationInSeconds, workerReady: workerReadyRef.current });
    
    if (durationInSeconds <= 0) {
      setError('Invalid duration');
      return false;
    }
    
    // Clear any existing fallback timer
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
    }
    
    // Try worker first, fallback if not available
    if (workerRef.current && workerReadyRef.current) {
      debugLog('Using worker timer');
      workerRef.current.postMessage({
        action: 'start',
        payload: { duration: durationInSeconds }
      });
    } else {
      debugLog('Using fallback timer');
      startFallbackTimer(durationInSeconds);
    }
    
    return true;
  }, [startFallbackTimer, debugLog]);

  // Stop timer function
  const stopTimer = useCallback(() => {
    debugLog('Stopping timer');
    
    if (workerRef.current && workerReadyRef.current) {
      workerRef.current.postMessage({ action: 'stop' });
    }
    
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, [debugLog]);

  // Initialize on mount
  useEffect(() => {
    debugLog('Hook mounted, initializing...');
    initializeWorker();
    
    return () => {
      debugLog('Hook unmounting, cleaning up...');
      
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
      }
    };
  }, []); // Empty deps array

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
      heartbeatActive: true,
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
      workerFailed: !!error
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