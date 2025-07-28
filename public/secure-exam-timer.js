// hooks/useSecureTimer.ts - FIXED VERSION WITH PROPER ERROR HANDLING
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
  networkQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

interface UseSecureTimerOptions {
  examId: string;
  onTimeout: () => void;
  onSecurityBreach: (reason: string, details?: any) => void;
  onValidationFailure: (reason: string) => void;
}

interface NetworkInfo {
  latency: number;
  timezoneOffset: number;
  reliability: number;
  offsetStdDev: number;
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
    heartbeatActive: false,
    networkQuality: 'GOOD'
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    latency: 0,
    timezoneOffset: 0,
    reliability: 1.0,
    offsetStdDev: 0
  });
  
  const workerRef = useRef<Worker | null>(null);
  const sessionKeyRef = useRef<string>('');
  const lastHeartbeatRef = useRef<number>(Date.now());
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storageKeyRef = useRef<string>('');
  const securityAlertsRef = useRef<string[]>([]);
  const workerReadyRef = useRef<boolean>(false);
  const pendingStartRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const workerInitAttempts = useRef<number>(0);
  const workerFailedRef = useRef<boolean>(false);

  const debugLog = useCallback((message: string, data?: any) => {
    console.log(`[${new Date().toISOString()}] TIMER: ${message}`, data || '');
  }, []);
  
  // Generate secure session key
  const generateSessionKey = useCallback(() => {
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    const examHash = CryptoJS.MD5(examId).toString().substring(0, 8);
    
    return `${examHash}${timestamp}${random1}${random2}`;
  }, [examId]);
  
  // Check if Web Workers are supported
  const isWorkerSupported = useCallback(() => {
    if (typeof window === 'undefined') return false;
    if (typeof Worker === 'undefined') return false;
    
    try {
      // Try to create a simple test worker
      const testWorker = new Worker('data:text/javascript,self.postMessage("test");');
      testWorker.terminate();
      return true;
    } catch (error) {
      debugLog('Web Worker support test failed', error);
      return false;
    }
  }, [debugLog]);

  // Check if worker file exists
  const checkWorkerFile = useCallback(async (): Promise<boolean> => {
    try {
      debugLog('Checking if worker file exists...');
      const response = await fetch('/secure-exam-timer.js', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const exists = response.ok;
      debugLog(`Worker file check result: ${exists ? 'EXISTS' : 'NOT FOUND'}`, {
        status: response.status,
        statusText: response.statusText
      });
      
      return exists;
    } catch (error) {
      debugLog('Worker file check failed', error);
      return false;
    }
  }, [debugLog]);
  
  // Initialize Web Worker with comprehensive error handling and retry logic
  const initializeWorker = useCallback(async () => {
    if (typeof window === 'undefined') {
      debugLog('Cannot initialize worker - not in browser environment');
      return false;
    }
    
    if (workerFailedRef.current) {
      debugLog('Worker marked as failed - skipping initialization');
      return false;
    }
    
    if (workerRef.current && workerReadyRef.current) {
      debugLog('Worker already exists and ready');
      return true;
    }
    
    // Check if workers are supported
    if (!isWorkerSupported()) {
      debugLog('Web Workers not supported - using fallback');
      workerFailedRef.current = true;
      setError('Web Workers not supported');
      setIsInitialized(true);
      return false;
    }

    // FIXED: Check if worker file exists before creating worker
    const workerFileExists = await checkWorkerFile();
    if (!workerFileExists) {
      debugLog('Worker file not found - using fallback timer');
      workerFailedRef.current = true;
      setError('Worker file not found - using fallback timer');
      setIsInitialized(true);
      
      // Execute pending start with fallback if exists
      if (pendingStartRef.current) {
        debugLog('Executing pending start with fallback (no worker file)', { duration: pendingStartRef.current });
        startFallbackTimer(pendingStartRef.current);
        pendingStartRef.current = null;
      }
      
      return false;
    }
    
    workerInitAttempts.current++;
    debugLog(`Starting worker initialization attempt ${workerInitAttempts.current}...`);
    
    try {
      // Clean up existing worker
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        workerReadyRef.current = false;
      }
      
      // Clear any existing timeout
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      
      // Try to create the worker
      debugLog('Creating new worker instance...');
      workerRef.current = new Worker('/secure-exam-timer.js');
      sessionKeyRef.current = generateSessionKey();
      storageKeyRef.current = `exam_timer_${examId}_${sessionKeyRef.current.substring(0, 8)}`;
      
      debugLog('Worker created successfully', { 
        sessionKey: sessionKeyRef.current.substring(0, 8) + '***'
      });
      
      // Set up error handlers FIRST
      workerRef.current.onerror = (error) => {
        debugLog('Worker error occurred', error);
        workerFailedRef.current = true;
        setError('Worker error: ' + error.message);
        
        // FIXED: Don't retry on worker errors - use fallback immediately
        debugLog('Worker error detected - switching to fallback mode');
        setIsInitialized(true);
        
        // Execute pending start with fallback if exists
        if (pendingStartRef.current && !timerState.isRunning) {
          debugLog('Executing pending start with fallback (worker error)', { duration: pendingStartRef.current });
          startFallbackTimer(pendingStartRef.current);
          pendingStartRef.current = null;
        }
      };
      
      workerRef.current.onmessageerror = (error) => {
        debugLog('Worker message error', error);
        workerFailedRef.current = true;
        setError('Worker communication error');
        setIsInitialized(true);
      };
      
      // Set up initialization timeout - SHORTER timeout
      initTimeoutRef.current = setTimeout(() => {
        if (!workerReadyRef.current && !workerFailedRef.current) {
          debugLog('Worker initialization timeout - switching to fallback');
          workerFailedRef.current = true;
          setError('Worker timeout - using fallback');
          setIsInitialized(true);
          
          // Execute pending start with fallback if exists
          if (pendingStartRef.current) {
            debugLog('Executing pending start with fallback (timeout)', { duration: pendingStartRef.current });
            startFallbackTimer(pendingStartRef.current);
            pendingStartRef.current = null;
          }
        }
      }, 2000); // REDUCED to 2 seconds
      
      // Set up message handler BEFORE sending ping
      workerRef.current.onmessage = (e) => {
        handleWorkerMessage(e);
      };
      
      // Send initial ping to test worker
      debugLog('Sending ping to worker...');
      workerRef.current.postMessage({ action: 'ping' });
      
      return true;
      
    } catch (error) {
      debugLog('Failed to create worker', error);
      workerFailedRef.current = true;
      setError('Worker creation failed - using fallback timer');
      
      // FIXED: Don't retry on creation failure - use fallback immediately
      debugLog('Worker creation failed - switching to fallback mode');
      setIsInitialized(true);
      
      // Execute pending start with fallback if exists
      if (pendingStartRef.current) {
        debugLog('Executing pending start with fallback (creation failed)', { duration: pendingStartRef.current });
        startFallbackTimer(pendingStartRef.current);
        pendingStartRef.current = null;
      }
      
      return false;
    }
  }, [examId, generateSessionKey, isWorkerSupported, checkWorkerFile, debugLog, timerState.isRunning]);

  // Fallback timer implementation
  const startFallbackTimer = useCallback((durationInSeconds: number) => {
    debugLog('Starting fallback timer', { duration: durationInSeconds });
    
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
    }
    
    const startTime = Date.now();
    let lastTick = startTime;
    
    setTimerState(prev => ({
      ...prev,
      timeLeft: durationInSeconds,
      elapsed: 0,
      isRunning: true,
      isValid: true,
      lastUpdate: startTime
    }));
    
    setSecurityValidation(prev => ({
      ...prev,
      consistent: true,
      networkQuality: 'FAIR' // Fallback mode has lower security
    }));
    
    fallbackTimerRef.current = setInterval(() => {
      const now = Date.now();
      const totalElapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, durationInSeconds - totalElapsed);
      
      // Detect potential time jumps in fallback mode
      const timeSinceLastTick = now - lastTick;
      if (timeSinceLastTick > 5000) { // More than 5 seconds since last tick
        debugLog('Potential time jump detected in fallback timer', {
          timeSinceLastTick,
          expected: 1000
        });
        
        setSecurityValidation(prev => ({
          ...prev,
          noTimeJump: false,
          networkQuality: 'POOR'
        }));
      }
      lastTick = now;
      
      setTimerState(prev => ({
        ...prev,
        timeLeft: remaining,
        elapsed: totalElapsed,
        isRunning: remaining > 0,
        lastUpdate: now
      }));
      
      // Update backup timers
      setBackupTimers({
        purchase: remaining,
        userActivity: remaining,
        inventory: remaining
      });
      
      if (remaining <= 0) {
        debugLog('Fallback timer expired');
        clearInterval(fallbackTimerRef.current!);
        onTimeout();
      }
    }, 1000);
    
    debugLog('Fallback timer started successfully');
  }, [onTimeout, debugLog]);

  // FIXED: Enhanced message handler
  const handleWorkerMessage = useCallback((e: MessageEvent) => {
    const { type, ...data } = e.data;
    debugLog(`Worker message received: ${type}`, data);
    
    try {
      switch (type) {
        case 'worker_ready':
          debugLog('Worker ready confirmed');
          workerReadyRef.current = true;
          setIsInitialized(true);
          setError(null);
          
          if (initTimeoutRef.current) {
            clearTimeout(initTimeoutRef.current);
            initTimeoutRef.current = null;
          }
          
          // If there's a pending start, execute it now
          if (pendingStartRef.current) {
            debugLog('Executing pending start with worker', { duration: pendingStartRef.current });
            startTimerWithWorker(pendingStartRef.current);
            pendingStartRef.current = null;
          }
          break;
          
        case 'tick':
          setTimerState(prev => ({
            ...prev,
            timeLeft: data.remaining,
            elapsed: data.elapsed,
            isRunning: data.remaining > 0,
            lastUpdate: data.timestamp
          }));
          
          setBackupTimers(data.backupTimers || { purchase: 0, userActivity: 0, inventory: 0 });
          
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
          debugLog('Worker timer expired', data.reason);
          setTimerState(prev => ({
            ...prev,
            timeLeft: 0,
            isRunning: false
          }));
          onTimeout();
          break;
          
        case 'store':
          try {
            localStorage.setItem(storageKeyRef.current, JSON.stringify(data.data));
            debugLog('Timer data stored successfully');
          } catch (error) {
            debugLog('Failed to store timer data', error);
            setError('Storage failed');
          }
          break;
          
        case 'restored':
          debugLog('Timer restored from storage', data);
          setTimerState(prev => ({
            ...prev,
            timeLeft: data.remaining,
            elapsed: data.elapsed,
            isRunning: true,
            isValid: data.integrity === 'verified'
          }));
          break;
          
        case 'invalid':
          debugLog('Timer validation failed', data.reason);
          setError(`Timer validation issue: ${data.reason}`);
          setTimerState(prev => ({ ...prev, isValid: false }));
          onValidationFailure(data.reason);
          break;
          
        case 'security_breach':
          debugLog('Security breach detected', data);
          securityAlertsRef.current.push(`${Date.now()}: ${data.reason}`);
          
          // Only trigger callback for extreme breaches
          if (data.reason === 'extreme_time_jump' || data.reason === 'checksum_failed_with_timeout') {
            onSecurityBreach(data.reason, data.details);
          }
          break;
          
        case 'time_anomaly':
          debugLog('Time anomaly detected (no action)', data);
          securityAlertsRef.current.push(`${Date.now()}: anomaly_${data.severity}`);
          
          setSecurityValidation(prev => ({
            ...prev,
            noTimeJump: data.severity !== 'EXTREME',
            networkQuality: data.severity === 'EXTREME' ? 'POOR' : prev.networkQuality
          }));
          break;
          
        case 'heartbeat_request':
          lastHeartbeatRef.current = Date.now();
          if (workerRef.current && workerReadyRef.current) {
            workerRef.current.postMessage({
              action: 'heartbeat_response',
              payload: { 
                timestamp: data.timestamp,
                networkQuality: securityValidation.networkQuality,
                reliability: networkInfo.reliability
              }
            });
          }
          
          setSecurityValidation(prev => ({
            ...prev,
            heartbeatActive: true
          }));
          break;
          
        case 'worker_error':
          debugLog('Worker reported error', data);
          setError(data.error);
          
          // If worker fails and we have pending start, use fallback
          if (pendingStartRef.current && !timerState.isRunning) {
            debugLog('Worker failed with pending start - using fallback');
            startFallbackTimer(pendingStartRef.current);
            pendingStartRef.current = null;
          }
          break;
          
        case 'validation_result':
          debugLog('Validation result received', data.validation);
          
          setSecurityValidation(prev => ({
            ...prev,
            consistent: data.validation.backupConsistency,
            noTimeJump: !data.validation.timeJump,
            checksumValid: data.validation.checksumValid,
            networkQuality: data.validation.networkQuality
          }));
          break;
          
        default:
          debugLog('Unknown worker message type', { type, data });
          break;
      }
    } catch (error) {
      debugLog('Error handling worker message', error);
      setError('Message handling error: ' + (error as Error).message);
    }
  }, [onTimeout, onSecurityBreach, onValidationFailure, securityValidation.networkQuality, networkInfo.reliability, startFallbackTimer, timerState.isRunning, debugLog]);
  
  // Start timer with worker
  const startTimerWithWorker = useCallback((durationInSeconds: number) => {
    if (!workerRef.current || !workerReadyRef.current || workerFailedRef.current) {
      debugLog('Worker not ready for start');
      return false;
    }
    
    debugLog('Starting timer with worker', { duration: durationInSeconds });
    
    try {
      workerRef.current.postMessage({
        action: 'start',
        payload: {
          duration: durationInSeconds,
          sessionKey: sessionKeyRef.current,
          networkInfo: networkInfo,
          enhancedSecurity: true
        }
      });
      
      return true;
    } catch (error) {
      debugLog('Error starting worker timer', error);
      setError('Failed to start worker timer');
      return false;
    }
  }, [networkInfo, debugLog]);
  
  // Main start timer function with smart fallback
  const startTimer = useCallback((durationInSeconds: number) => {
    debugLog('Start timer requested', { 
      duration: durationInSeconds,
      workerReady: workerReadyRef.current,
      workerFailed: workerFailedRef.current,
      initialized: isInitialized 
    });
    
    if (durationInSeconds <= 0) {
      debugLog('Invalid duration provided');
      setError('Invalid timer duration');
      return false;
    }
    
    // Clear any existing fallback timer
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    
    // If worker failed or not supported, use fallback immediately
    if (workerFailedRef.current) {
      debugLog('Worker failed - using fallback timer immediately');
      startFallbackTimer(durationInSeconds);
      return true;
    }
    
    // If worker is ready, use it
    if (workerRef.current && workerReadyRef.current) {
      debugLog('Using worker timer');
      return startTimerWithWorker(durationInSeconds);
    }
    
    // If not initialized yet, store pending start
    if (!isInitialized) {
      debugLog('Timer not initialized, storing pending start');
      pendingStartRef.current = durationInSeconds;
      return true;
    }
    
    // Use fallback timer
    debugLog('Using fallback timer');
    startFallbackTimer(durationInSeconds);
    return true;
  }, [isInitialized, startTimerWithWorker, startFallbackTimer, debugLog]);
  
  // Stop timer
  const stopTimer = useCallback(() => {
    debugLog('Stop timer requested');
    
    if (workerRef.current && workerReadyRef.current && !workerFailedRef.current) {
      try {
        workerRef.current.postMessage({ action: 'stop' });
      } catch (error) {
        debugLog('Error stopping worker', error);
      }
    }
    
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    
    setTimerState(prev => ({ ...prev, isRunning: false }));
    debugLog('Timer stopped');
  }, [debugLog]);
  
  // Restore timer from storage
  const restoreTimer = useCallback(() => {
    if (!workerRef.current || !workerReadyRef.current || workerFailedRef.current) {
      debugLog('Cannot restore - worker not ready or failed');
      return false;
    }
    
    try {
      const storedData = localStorage.getItem(storageKeyRef.current);
      if (!storedData) {
        debugLog('No stored timer data found');
        return false;
      }
      
      const parsedData = JSON.parse(storedData);
      debugLog('Attempting to restore timer from storage');
      
      workerRef.current.postMessage({
        action: 'restore',
        payload: {
          stored: parsedData,
          sessionKey: sessionKeyRef.current,
          networkInfo: networkInfo,
          enhancedValidation: true
        }
      });
      
      return true;
    } catch (error) {
      debugLog('Failed to restore timer', error);
      setError('Timer restoration failed');
      return false;
    }
  }, [networkInfo, debugLog]);
  
  // Get backup timer values
  const getBackupTimerValues = useCallback(() => {
    return {
      purchaseTimer: backupTimers.purchase,
      userActivityTimer: backupTimers.userActivity,
      inventoryTimer: backupTimers.inventory,
      mainTimer: timerState.timeLeft,
      sessionValid: timerState.isValid && securityValidation.consistent,
      networkQuality: securityValidation.networkQuality,
      reliability: networkInfo.reliability,
      adaptiveThreshold: Math.max(120, networkInfo.latency * 3 / 1000),
      securityAlerts: securityAlertsRef.current.slice(-5),
      workerReady: workerReadyRef.current,
      fallbackActive: !!fallbackTimerRef.current,
      initAttempts: workerInitAttempts.current,
      workerFailed: workerFailedRef.current
    };
  }, [backupTimers, timerState.timeLeft, timerState.isValid, securityValidation.consistent, securityValidation.networkQuality, networkInfo.reliability, networkInfo.latency]);
  
  // Validate timer integrity
  const validateIntegrity = useCallback(() => {
    if (workerRef.current && workerReadyRef.current && !workerFailedRef.current) {
      try {
        workerRef.current.postMessage({ 
          action: 'validate_request',
          payload: {
            networkInfo: networkInfo,
            enhancedChecks: true
          }
        });
        debugLog('Integrity validation requested');
      } catch (error) {
        debugLog('Error requesting validation', error);
      }
    } else {
      debugLog('Cannot validate - worker not ready or failed');
    }
  }, [networkInfo, debugLog]);

  // Update network info
  const updateNetworkInfo = useCallback((newNetworkInfo: Partial<NetworkInfo>) => {
    const updatedInfo = { ...networkInfo, ...newNetworkInfo };
    setNetworkInfo(updatedInfo);
    
    if (workerRef.current && workerReadyRef.current && !workerFailedRef.current) {
      try {
        workerRef.current.postMessage({
          action: 'update_network_info',
          payload: updatedInfo
        });
      } catch (error) {
        debugLog('Error updating network info', error);
      }
    }
    
    debugLog('Network info updated', {
      latency: Math.round(updatedInfo.latency) + 'ms',
      reliability: Math.round(updatedInfo.reliability * 100) + '%'
    });
  }, [networkInfo, debugLog]);
  
  // Initialize worker on mount with retry logic
  useEffect(() => {
    debugLog('Initializing timer hook');
    
    let mounted = true;
    
    const initWithTimeout = async () => {
      try {
        const success = await initializeWorker();
        
        if (!success && mounted && !workerFailedRef.current) {
          debugLog('Worker initialization failed - fallback mode enabled');
        }
        
        // Try to restore after initialization (with delay for worker readiness)
        if (success && mounted && workerReadyRef.current) {
          setTimeout(() => {
            if (mounted && workerReadyRef.current && !workerFailedRef.current) {
              debugLog('Attempting timer restoration');
              restoreTimer();
            }
          }, 500);
        }
      } catch (error) {
        debugLog('Initialization error', error);
        if (mounted) {
          workerFailedRef.current = true;
          setIsInitialized(true);
          setError('Initialization failed - using fallback');
        }
      }
    };
    
    initWithTimeout();
    
    return () => {
      mounted = false;
      debugLog('Cleaning up timer hook');
      
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      
      if (workerRef.current) {
        try {
          workerRef.current.postMessage({ action: 'stop' });
          workerRef.current.terminate();
        } catch (error) {
          debugLog('Error during worker cleanup', error);
        }
        workerRef.current = null;
      }
      
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
      
      // Clear storage
      try {
        localStorage.removeItem(storageKeyRef.current);
      } catch (error) {
        debugLog('Failed to cleanup storage', error);
      }
    };
  }, [initializeWorker, restoreTimer, debugLog]);
  
  return {
    // Timer state
    timeLeft: timerState.timeLeft,
    elapsed: timerState.elapsed,
    isRunning: timerState.isRunning,
    isValid: timerState.isValid,
    isInitialized,
    error,
    
    // Backup timers
    backupTimers,
    
    // Security validation
    securityValidation,
    
    // Network info
    networkInfo,
    
    // Control functions
    startTimer,
    stopTimer,
    restoreTimer,
    validateIntegrity,
    getBackupTimerValues,
    updateNetworkInfo,
    
    // Utility functions
    formatTime: (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    },
    
    getTimeRemaining: () => timerState.timeLeft,
    getElapsedTime: () => timerState.elapsed,
    isExpired: () => timerState.timeLeft <= 0,
    
    // Debug info
    getDebugInfo: () => ({
      workerReady: workerReadyRef.current,
      workerFailed: workerFailedRef.current,
      fallbackActive: !!fallbackTimerRef.current,
      pendingStart: pendingStartRef.current,
      sessionKey: sessionKeyRef.current.substring(0, 8) + '***',
      storageKey: storageKeyRef.current,
      initAttempts: workerInitAttempts.current,
      workerSupported: isWorkerSupported()
    })
  };
};