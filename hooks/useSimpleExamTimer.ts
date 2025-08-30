// hooks/useSimpleExamTimer.ts - OPTIMIZED VERSION WITH STATE-FIRST APPROACH
import { useState, useEffect, useRef, useCallback } from 'react';
import simpleExamDBService from '../utils/SimpleExamDBService';

interface UseSimpleExamTimerProps {
  examString: string;
  examId?: number;
  totalMinutes?: number;
  onTimeExpired?: () => void;
  onTick?: (remainingSeconds: number) => void;
}

export const useSimpleExamTimer = ({
  examString,
  examId = 0,
  totalMinutes = 0,
  onTimeExpired,
  onTick
}: UseSimpleExamTimerProps) => {
  // State-first approach - keep everything in memory
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In-memory state that syncs to DB periodically
  const sessionStartTime = useRef<number>(0);
  const totalElapsedSeconds = useRef<number>(0);
  const totalDurationSeconds = useRef<number>(0);
  const lastDbSyncTime = useRef<number>(0);
  
  // Timer references
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dbSyncRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false);

  console.log('SimpleTimer: State-first hook:', { 
    examString, remainingTime, isRunning, isInitialized, totalElapsed: totalElapsedSeconds.current 
  });

  // Clear timers
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (dbSyncRef.current) {
      clearInterval(dbSyncRef.current);
      dbSyncRef.current = null;
    }
  }, []);

  // Sync to database (non-blocking)
  const syncToDatabase = useCallback(async (force = false) => {
    if (!examString || (!force && Date.now() - lastDbSyncTime.current < 15000)) {
      return; // Skip if less than 15 seconds since last sync
    }

    try {
      const currentElapsed = totalElapsedSeconds.current + 
        (isRunning && sessionStartTime.current > 0 ? 
         Math.floor((Date.now() - sessionStartTime.current) / 1000) : 0);

      await simpleExamDBService.updateGlobalElapsedTime(examString, currentElapsed);
      await simpleExamDBService.setExamRunning(examString, isRunning);
      
      lastDbSyncTime.current = Date.now();
      console.log('SimpleTimer: Synced to DB - elapsed:', currentElapsed);
    } catch (err) {
      console.warn('SimpleTimer: DB sync failed (non-critical):', err);
    }
  }, [examString, isRunning]);

  // Initialize timer from database once
  const initializeTimer = useCallback(async () => {
    if (!examString || !examId || !totalMinutes || isInitializingRef.current || isInitialized) {
      return;
    }

    isInitializingRef.current = true;
    console.log('SimpleTimer: Initializing from DB...');
    
    try {
      let examData = await simpleExamDBService.getExamData(examString);
      
      if (!examData) {
        examData = await simpleExamDBService.initializeExam(examString, examId, totalMinutes);
      }

      // Load into memory state
      totalDurationSeconds.current = examData.totalDuration;
      totalElapsedSeconds.current = examData.globalElapsedTime;
      const remaining = Math.max(0, examData.totalDuration - examData.globalElapsedTime);
      
      setRemainingTime(remaining);
      setIsInitialized(true);
      
      console.log('SimpleTimer: Initialized - duration:', examData.totalDuration, 'elapsed:', examData.globalElapsedTime, 'remaining:', remaining);

      if (remaining <= 0) {
        if (onTimeExpired) setTimeout(() => onTimeExpired(), 100);
        return;
      }

      // Auto-resume if was running
      if (examData.isRunning && remaining > 0) {
        console.log('SimpleTimer: Auto-resuming previous session');
        sessionStartTime.current = Date.now();
        setIsRunning(true);
      }

    } catch (err) {
      console.error('SimpleTimer: Init failed:', err);
      setError('Failed to initialize timer');
    } finally {
      isInitializingRef.current = false;
    }
  }, [examString, examId, totalMinutes, onTimeExpired, isInitialized]);

  // Start timer (state-only, fast)
  const startTimer = useCallback(() => {
    if (!isInitialized || isRunning) return;
    
    console.log('SimpleTimer: Starting (state-first)');
    sessionStartTime.current = Date.now();
    setIsRunning(true);
    setError(null);
    
    // Async DB update (non-blocking)
    syncToDatabase();
  }, [isInitialized, isRunning, syncToDatabase]);

  // Stop timer (immediate state update, async DB sync)
  const stopTimer = useCallback(async () => {
    if (!isRunning) return;
    
    console.log('SimpleTimer: Stopping (state-first)');
    
    // Update in-memory state immediately
    if (sessionStartTime.current > 0) {
      const sessionElapsed = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      totalElapsedSeconds.current += sessionElapsed;
      
      const newRemaining = Math.max(0, totalDurationSeconds.current - totalElapsedSeconds.current);
      setRemainingTime(newRemaining);
    }
    
    setIsRunning(false);
    sessionStartTime.current = 0;
    clearTimers();
    
    // Force sync to database
    await syncToDatabase(true);
  }, [isRunning, clearTimers, syncToDatabase]);

  const pauseTimer = useCallback(() => {
    if (!isRunning) return;
    
    // Update elapsed time before pausing
    if (sessionStartTime.current > 0) {
      const sessionElapsed = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      totalElapsedSeconds.current += sessionElapsed;
    }
    
    setIsRunning(false);
    sessionStartTime.current = 0;
    clearTimers();
  }, [isRunning, clearTimers]);

  const resumeTimer = useCallback(() => {
    if (isRunning || remainingTime <= 0) return;
    startTimer();
  }, [isRunning, remainingTime, startTimer]);

  const formatTime = useCallback((seconds: number): string => {
    return simpleExamDBService.formatTime(seconds);
  }, []);

  // Main countdown timer - pure calculation, no DB calls
  useEffect(() => {
    if (!isRunning || !isInitialized) {
      clearTimers();
      return;
    }

    console.log('SimpleTimer: Starting countdown (state-only)');

    // Main timer - updates UI every second
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const sessionElapsed = sessionStartTime.current > 0 ? 
        Math.floor((now - sessionStartTime.current) / 1000) : 0;
      
      const totalCurrentElapsed = totalElapsedSeconds.current + sessionElapsed;
      const remaining = Math.max(0, totalDurationSeconds.current - totalCurrentElapsed);
      
      setRemainingTime(remaining);
      
      if (onTick) onTick(remaining);
      
      // Check expiry
      if (remaining <= 0) {
        console.log('SimpleTimer: Time expired');
        setIsRunning(false);
        clearTimers();
        
        // Update final elapsed time
        totalElapsedSeconds.current = totalDurationSeconds.current;
        sessionStartTime.current = 0;
        
        // Force final sync
        syncToDatabase(true);
        
        if (onTimeExpired) onTimeExpired();
      }
    }, 1000);

    // Separate timer for DB sync every 15 seconds
    dbSyncRef.current = setInterval(() => {
      syncToDatabase();
    }, 15000);

    return clearTimers;
  }, [isRunning, isInitialized, onTick, onTimeExpired, clearTimers, syncToDatabase]);

  // Initialize when ready
  useEffect(() => {
    if (examString && examId && totalMinutes && !isInitialized) {
      initializeTimer();
    }
  }, [examString, examId, totalMinutes, isInitialized, initializeTimer]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimers();
      // Final sync on unmount
      if (isRunning && examString) {
        syncToDatabase(true).catch(console.error);
      }
    };
  }, [clearTimers, isRunning, examString, syncToDatabase]);

  return {
    remainingTime,
    isRunning,
    isInitialized,
    error,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    formatTime,
    // Helper to get current elapsed time for immediate access
    getCurrentElapsed: () => {
      const sessionElapsed = sessionStartTime.current > 0 ? 
        Math.floor((Date.now() - sessionStartTime.current) / 1000) : 0;
      return totalElapsedSeconds.current + sessionElapsed;
    },
    // Force sync when needed
    forceSync: () => syncToDatabase(true)
  };
};