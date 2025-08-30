// hooks/useSimpleQuestionTimer.ts - OPTIMIZED VERSION
import { useState, useEffect, useRef, useCallback } from 'react';
import simpleExamDBService from '../utils/SimpleExamDBService';

interface UseSimpleQuestionTimerProps {
  examString: string;
  currentQuestionId: number | null;
  isExamRunning: boolean;
}

export const useSimpleQuestionTimer = ({
  examString,
  currentQuestionId,
  isExamRunning
}: UseSimpleQuestionTimerProps) => {
  // State-first approach for question timing
  const [currentQuestionElapsed, setCurrentQuestionElapsed] = useState(0);
  const [allQuestionTimes, setAllQuestionTimes] = useState<Record<number, number>>({});
  
  // In-memory question timing state
  const questionStartTime = useRef<number>(0);
  const questionTimesCache = useRef<Record<number, number>>({});
  const lastQuestionId = useRef<number | null>(null);
  const lastDbSyncTime = useRef<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dbSyncRef = useRef<NodeJS.Timeout | null>(null);

  console.log('QuestionTimer: State-first -', { 
    currentQuestionId, isExamRunning, currentElapsed: currentQuestionElapsed 
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

  // Sync question times to database (non-blocking)
  const syncQuestionTimesToDb = useCallback(async (force = false) => {
    if (!examString || (!force && Date.now() - lastDbSyncTime.current < 15000)) {
      return;
    }

    try {
      // Update current question time in cache if active
      if (currentQuestionId !== null && questionStartTime.current > 0) {
        const sessionTime = Math.floor((Date.now() - questionStartTime.current) / 1000);
        const previousTime = questionTimesCache.current[currentQuestionId] || 0;
        questionTimesCache.current[currentQuestionId] = previousTime + sessionTime;
        questionStartTime.current = Date.now(); // Reset session start
      }

      // Sync all question times to database
      for (const [questionId, totalTime] of Object.entries(questionTimesCache.current)) {
        await simpleExamDBService.updateQuestionTime?.(examString, parseInt(questionId), totalTime);
      }
      
      lastDbSyncTime.current = Date.now();
      console.log('QuestionTimer: Synced to DB');
    } catch (err) {
      console.warn('QuestionTimer: DB sync failed (non-critical):', err);
    }
  }, [examString, currentQuestionId]);

  // Load initial question times from database
  const loadQuestionTimes = useCallback(async () => {
    if (!examString) return;
    
    try {
      const times = await simpleExamDBService.getAllQuestionTimes(examString);
      questionTimesCache.current = { ...times };
      setAllQuestionTimes(times);
    } catch (err) {
      console.warn('QuestionTimer: Failed to load times:', err);
    }
  }, [examString]);

  // Handle question changes
  useEffect(() => {
    if (currentQuestionId === lastQuestionId.current) return;

    console.log('QuestionTimer: Question changed:', lastQuestionId.current, '->', currentQuestionId);

    // Finalize previous question time in cache
    if (lastQuestionId.current !== null && questionStartTime.current > 0) {
      const sessionTime = Math.floor((Date.now() - questionStartTime.current) / 1000);
      const previousTime = questionTimesCache.current[lastQuestionId.current] || 0;
      questionTimesCache.current[lastQuestionId.current] = previousTime + sessionTime;
      
      // Update state immediately
      setAllQuestionTimes(prev => ({
        ...prev,
        [lastQuestionId.current!]: questionTimesCache.current[lastQuestionId.current!]
      }));
    }

    // Start timing new question
    lastQuestionId.current = currentQuestionId;
    questionStartTime.current = currentQuestionId !== null && isExamRunning ? Date.now() : 0;
    
    if (currentQuestionId === null) {
      setCurrentQuestionElapsed(0);
    }

    // Async DB update for question change
    if (examString && currentQuestionId !== null) {
      simpleExamDBService.updateCurrentQuestion(examString, currentQuestionId)
        .catch(err => console.warn('QuestionTimer: Update current question failed:', err));
    }
  }, [currentQuestionId, isExamRunning, examString]);

  // Main question timer - state-only updates
  useEffect(() => {
    clearTimers();
    
    if (!isExamRunning || currentQuestionId === null) {
      setCurrentQuestionElapsed(0);
      return;
    }

    console.log('QuestionTimer: Starting timer for question:', currentQuestionId);

    // Update current question elapsed every second
    timerRef.current = setInterval(() => {
      if (questionStartTime.current > 0) {
        const sessionElapsed = Math.floor((Date.now() - questionStartTime.current) / 1000);
        const previousTime = questionTimesCache.current[currentQuestionId] || 0;
        setCurrentQuestionElapsed(previousTime + sessionElapsed);
      }
    }, 1000);

    // Sync to database every 15 seconds
    dbSyncRef.current = setInterval(() => {
      syncQuestionTimesToDb();
    }, 15000);

    return clearTimers;
  }, [isExamRunning, currentQuestionId, clearTimers, syncQuestionTimesToDb]);

  // Load initial data
  useEffect(() => {
    if (examString) {
      loadQuestionTimes();
    }
  }, [examString, loadQuestionTimes]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimers();
      // Force final sync
      if (examString) {
        syncQuestionTimesToDb(true).catch(console.error);
      }
    };
  }, [clearTimers, examString, syncQuestionTimesToDb]);

  const formatTime = useCallback((seconds: number): string => {
    return simpleExamDBService.formatTime(seconds);
  }, []);

  // Get all times including current session
  const getAllQuestionTimes = useCallback((): Record<number, number> => {
    const result = { ...questionTimesCache.current };
    
    // Add current session time if active
    if (currentQuestionId !== null && questionStartTime.current > 0) {
      const sessionTime = Math.floor((Date.now() - questionStartTime.current) / 1000);
      const previousTime = result[currentQuestionId] || 0;
      result[currentQuestionId] = previousTime + sessionTime;
    }
    
    return result;
  }, [currentQuestionId]);

  return {
    currentQuestionElapsed,
    allQuestionTimes: getAllQuestionTimes(),
    formatTime,
    getAllQuestionTimes,
    // Force sync when needed (e.g., before submission)
    forceSync: () => syncQuestionTimesToDb(true)
  };
};