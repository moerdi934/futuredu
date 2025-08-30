// hooks/useGlobalTimer.ts - Fixed version
import { useState, useEffect, useRef, useCallback } from 'react';

interface GlobalTimerState {
  timeLeft: number;
  elapsed: number;
  isRunning: boolean;
  lastSyncTime: number;
}

interface UseGlobalTimerOptions {
  examId: string;
  onTimeout: () => void;
  syncInterval?: number; // milliseconds, default 2 minutes
}

interface ServerSyncData {
  serverTime: number;
  examEndTime: number;
  isValid: boolean;
}

export const useGlobalTimer = ({
  examId,
  onTimeout,
  syncInterval = 120000 // 2 minutes
}: UseGlobalTimerOptions) => {
  const [state, setState] = useState<GlobalTimerState>({
    timeLeft: 0,
    elapsed: 0,
    isRunning: false,
    lastSyncTime: 0
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Stable refs - these won't cause re-initialization
  const workerRef = useRef<Worker | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const initAttemptRef = useRef<boolean>(false);
  const onTimeoutRef = useRef(onTimeout);

  // Update callback ref when prop changes
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // Stable worker initialization - only run once per examId
  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initAttemptRef.current || !examId) {
      return;
    }

    initAttemptRef.current = true;

    const initializeWorker = async () => {
      try {
        if (typeof window === 'undefined' || typeof Worker === 'undefined') {
          throw new Error('Worker not supported');
        }

        // Cleanup existing worker first
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }

        console.log('Initializing worker for exam:', examId);
        workerRef.current = new Worker('/global-timer.js');
        
        workerRef.current.onmessage = (e) => {
          const { type, ...data } = e.data;
          
          switch (type) {
            case 'ready':
              setIsInitialized(true);
              setError(null);
              break;
              
            case 'tick':
              setState(prev => ({
                ...prev,
                timeLeft: data.timeLeft,
                elapsed: data.elapsed
              }));
              break;
              
            case 'timeout':
              setState(prev => ({ ...prev, timeLeft: 0, isRunning: false }));
              onTimeoutRef.current();
              break;
              
            case 'error':
              console.error('Worker error:', data.error);
              setError(data.error);
              break;
          }
        };

        workerRef.current.onerror = (error) => {
          console.error('Worker initialization failed:', error);
          setError('Worker initialization failed');
          setIsInitialized(true);
        };

        // Send ping to initialize
        workerRef.current.postMessage({ action: 'init', examId });

        // Fallback timeout
        setTimeout(() => {
          if (!isInitialized) {
            console.warn('Worker initialization timeout, using fallback');
            setError('Worker timeout');
            setIsInitialized(true);
          }
        }, 3000);

      } catch (error) {
        console.error('Worker setup error:', error);
        setError(`Worker error: ${error.message}`);
        setIsInitialized(true);
      }
    };

    initializeWorker();

    // Cleanup function
    return () => {
      if (workerRef.current) {
        console.log('Terminating worker for exam:', examId);
        workerRef.current.terminate();
        workerRef.current = null;
      }
      
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      
      initAttemptRef.current = false;
      setIsInitialized(false);
    };
  }, [examId]); // Only depend on examId

  // Fallback timer (if worker fails)
  const startFallbackTimer = useCallback((durationSeconds: number) => {
    console.log('Starting fallback timer:', durationSeconds);
    
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
    }

    const startTime = Date.now();
    startTimeRef.current = startTime;
    durationRef.current = durationSeconds;

    setState(prev => ({
      ...prev,
      timeLeft: durationSeconds,
      elapsed: 0,
      isRunning: true
    }));

    fallbackTimerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const timeLeft = Math.max(0, durationSeconds - elapsed);

      setState(prev => ({
        ...prev,
        timeLeft,
        elapsed
      }));

      if (timeLeft <= 0) {
        clearInterval(fallbackTimerRef.current!);
        setState(prev => ({ ...prev, isRunning: false }));
        onTimeoutRef.current();
      }
    }, 1000);
  }, []);

  // Sync with server
  const syncWithServer = useCallback(async (): Promise<boolean> => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) return false;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/examSession/sync-timer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        credentials: 'include',
        body: JSON.stringify({
          exam_id: examId,
          client_time: Date.now(),
          elapsed_time: state.elapsed
        })
      });

      if (!response.ok) return false;

      const data: ServerSyncData = await response.json();
      
      if (!data.isValid) {
        setError('Timer validation failed');
        return false;
      }

      // Update timer based on server time
      const serverTimeLeft = Math.floor((data.examEndTime - data.serverTime) / 1000);
      const serverElapsed = durationRef.current - serverTimeLeft;

      setState(prev => ({
        ...prev,
        timeLeft: Math.max(0, serverTimeLeft),
        elapsed: Math.max(0, serverElapsed),
        lastSyncTime: Date.now()
      }));

      // Update worker with corrected time
      if (workerRef.current) {
        workerRef.current.postMessage({
          action: 'sync',
          timeLeft: serverTimeLeft,
          elapsed: serverElapsed
        });
      }

      return true;
    } catch (error) {
      console.error('Server sync failed:', error);
      return false;
    }
  }, [examId, state.elapsed]);

  // Start timer - wait for initialization
  const startTimer = useCallback((durationSeconds: number): boolean => {
    if (!isInitialized) {
      console.warn('Timer not initialized yet, cannot start');
      return false;
    }

    if (durationSeconds <= 0) {
      setError('Invalid duration');
      return false;
    }

    console.log('Starting timer:', durationSeconds, 'seconds');

    durationRef.current = durationSeconds;
    startTimeRef.current = Date.now();

    setState(prev => ({
      ...prev,
      timeLeft: durationSeconds,
      elapsed: 0,
      isRunning: true,
      lastSyncTime: Date.now()
    }));

    // Try worker first, fallback if error
    if (workerRef.current && !error) {
      try {
        workerRef.current.postMessage({
          action: 'start',
          duration: durationSeconds
        });
      } catch (workerError) {
        console.error('Worker start failed, using fallback:', workerError);
        startFallbackTimer(durationSeconds);
      }
    } else {
      console.log('Using fallback timer (no worker or error exists)');
      startFallbackTimer(durationSeconds);
    }

    // Setup server sync interval
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(() => {
      syncWithServer();
    }, syncInterval);

    return true;
  }, [isInitialized, error, startFallbackTimer, syncWithServer, syncInterval]);

  // Stop timer
  const stopTimer = useCallback(() => {
    console.log('Stopping timer');
    
    setState(prev => ({ ...prev, isRunning: false }));

    if (workerRef.current) {
      workerRef.current.postMessage({ action: 'stop' });
    }

    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  // Format time utility
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    timeLeft: state.timeLeft,
    elapsed: state.elapsed,
    isRunning: state.isRunning,
    lastSyncTime: state.lastSyncTime,
    isInitialized,
    error,

    // Actions
    startTimer,
    stopTimer,
    syncWithServer,

    // Utilities
    formatTime,
    isExpired: state.timeLeft <= 0,
    
    // Debug info
    debugInfo: {
      usingWorker: !!workerRef.current && !error,
      usingFallback: !!fallbackTimerRef.current,
      startTime: startTimeRef.current,
      duration: durationRef.current,
      examId,
      initAttempted: initAttemptRef.current
    }
  };
};