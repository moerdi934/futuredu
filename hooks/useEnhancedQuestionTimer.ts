// hooks/useEnhancedQuestionTimer.ts - FIXED ELAPSED TIME PER QUESTION
import { useState, useEffect, useRef, useCallback } from 'react';
import ExamDBService from '../utils/ExamDBService';
import { useHiddenQuestionTimer } from './useHiddenQuestionTimer';

interface QuestionTimerState {
  currentQuestionId: number | null;
  questionStartTime: number;
  baseElapsedTime: number; // Previously accumulated time for current question
  isTracking: boolean;
  totalSessionTime: number;
  lastSaveTime: number;
  allQuestionElapsedTimes: Record<number, number>; // All question elapsed times
}

interface UseEnhancedQuestionTimerOptions {
  examString: string;
  currentQuestionId: number | null;
  isTimerRunning: boolean;
  autoSaveInterval?: number;
  debugMode?: boolean;
}

export const useEnhancedQuestionTimer = ({
  examString,
  currentQuestionId,
  isTimerRunning,
  autoSaveInterval = 5,
  debugMode = false
}: UseEnhancedQuestionTimerOptions) => {
  
  // Core state with accumulated elapsed times
  const [state, setState] = useState<QuestionTimerState>({
    currentQuestionId: null,
    questionStartTime: 0,
    baseElapsedTime: 0,
    isTracking: false,
    totalSessionTime: 0,
    lastSaveTime: 0,
    allQuestionElapsedTimes: {}
  });

  // Control refs
  const isMountedRef = useRef<boolean>(true);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousQuestionRef = useRef<number | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const dataLoadedRef = useRef<boolean>(false);

  // Initialize hidden timer
  const hiddenTimer = useHiddenQuestionTimer({
    onTick: (elapsed) => {
      if (!isMountedRef.current || !state.isTracking) return;
      
      if (debugMode && elapsed > 0 && elapsed % 10 === 0) {
        const totalElapsed = state.baseElapsedTime + elapsed;
        console.log(`🕐 Question Timer Tick: ${elapsed}s (Total for Q${currentQuestionId}: ${totalElapsed}s)`);
      }
    },
    tickInterval: 1000,
    autoStart: false,
    debugMode
  });

  // Load existing elapsed times from database
  const loadExistingElapsedTimes = useCallback(async () => {
    if (!examString || dataLoadedRef.current) return;
    
    try {
      if (debugMode) {
        console.log('📊 Loading existing elapsed times from database...');
      }
      
      const savedElapsedTimes = await ExamDBService.getQuestionElapsedTimes(examString);
      
      setState(prev => ({
        ...prev,
        allQuestionElapsedTimes: savedElapsedTimes || {}
      }));
      
      dataLoadedRef.current = true;
      
      if (debugMode) {
        console.log('✅ Loaded elapsed times:', savedElapsedTimes);
      }
    } catch (error) {
      console.error('❌ Error loading elapsed times:', error);
      dataLoadedRef.current = true; // Prevent infinite retry
    }
  }, [examString, debugMode]);

  // Get current session time for current question (hidden timer + base)
  const getCurrentQuestionTime = useCallback(() => {
    if (!state.isTracking || !state.currentQuestionId || !isMountedRef.current) {
      return state.baseElapsedTime;
    }
    
    try {
      const hiddenTimerElapsed = hiddenTimer.getCurrentElapsed();
      return state.baseElapsedTime + hiddenTimerElapsed;
    } catch (error) {
      console.error('Error getting current question time:', error);
      return state.baseElapsedTime;
    }
  }, [state.isTracking, state.currentQuestionId, state.baseElapsedTime, hiddenTimer]);

  // Get total elapsed time for any question (includes current session if applicable)
  const getQuestionElapsedTime = useCallback((questionId: number): number => {
    // Get saved elapsed time
    const savedTime = state.allQuestionElapsedTimes[questionId] || 0;
    
    // If this is the current question being tracked, add current session time
    if (state.currentQuestionId === questionId && state.isTracking) {
      const currentSessionTime = hiddenTimer.getCurrentElapsed();
      return state.baseElapsedTime + currentSessionTime;
    }
    
    return savedTime;
  }, [state.allQuestionElapsedTimes, state.currentQuestionId, state.isTracking, state.baseElapsedTime, hiddenTimer]);

  // Start tracking for a question
  const startQuestionTracking = useCallback(async (questionId: number) => {
    if (!isMountedRef.current || !examString || !isTimerRunning) {
      if (debugMode) {
        console.log('❌ Cannot start tracking - invalid state');
      }
      return;
    }

    // Load existing elapsed times if not loaded
    if (!dataLoadedRef.current) {
      await loadExistingElapsedTimes();
    }

    // Get previously accumulated time for this question
    const existingElapsedTime = state.allQuestionElapsedTimes[questionId] || 0;

    if (debugMode) {
      console.log('▶️ Starting tracking for question:', questionId, 'with existing time:', existingElapsedTime);
    }
    
    // Update state with base elapsed time
    setState(prev => ({
      ...prev,
      currentQuestionId: questionId,
      questionStartTime: Date.now(),
      baseElapsedTime: existingElapsedTime,
      isTracking: true,
      totalSessionTime: Date.now() - sessionStartTimeRef.current,
      lastSaveTime: 0
    }));

    // Start hidden timer from 0 (it will be added to baseElapsedTime)
    try {
      hiddenTimer.restart();
      
      if (debugMode) {
        console.log('✅ Question tracking started - Base time:', existingElapsedTime, 'Hidden timer reset');
      }
    } catch (error) {
      console.error('❌ Error starting hidden timer:', error);
      setState(prev => ({ ...prev, isTracking: false }));
    }
  }, [examString, isTimerRunning, hiddenTimer, debugMode, state.allQuestionElapsedTimes, loadExistingElapsedTimes]);

  // Stop tracking
  const stopQuestionTracking = useCallback(() => {
    if (debugMode) {
      console.log('⏹️ Stopping question tracking');
    }
    
    setState(prev => ({ ...prev, isTracking: false }));
    
    try {
      hiddenTimer.stop();
    } catch (error) {
      console.error('❌ Error stopping hidden timer:', error);
    }
  }, [hiddenTimer, debugMode]);

  // Save current question time to database and update state
  const saveCurrentQuestionTime = useCallback(async () => {
    if (!state.currentQuestionId || !state.isTracking || !isMountedRef.current) {
      return;
    }

    try {
      const currentSessionTime = hiddenTimer.getCurrentElapsed();
      const totalElapsedTime = state.baseElapsedTime + currentSessionTime;

      if (debugMode) {
        console.log('💾 Saving question time:', {
          questionId: state.currentQuestionId,
          baseTime: state.baseElapsedTime,
          sessionTime: currentSessionTime,
          totalTime: totalElapsedTime
        });
      }

      // Save to database
      const updatedElapsedTimes = await ExamDBService.updateQuestionElapsedTime(
        examString, 
        state.currentQuestionId, 
        totalElapsedTime
      );

      // Update local state with all elapsed times
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          allQuestionElapsedTimes: { ...updatedElapsedTimes },
          baseElapsedTime: updatedElapsedTimes[state.currentQuestionId] || totalElapsedTime,
          lastSaveTime: hiddenTimer.getCurrentElapsed(),
          totalSessionTime: Date.now() - sessionStartTimeRef.current
        }));

        // Reset hidden timer for next interval
        hiddenTimer.restart();
      }
      
      if (debugMode) {
        console.log('✅ Question time saved - Updated elapsed times:', updatedElapsedTimes);
      }
    } catch (error) {
      console.error('❌ Error saving question time:', error);
    }
  }, [examString, hiddenTimer, debugMode, state.currentQuestionId, state.isTracking, state.baseElapsedTime]);

  // Finalize question time when leaving question
  const finalizeQuestionTime = useCallback(async (questionId: number) => {
    if (!examString || !isMountedRef.current) return;

    try {
      const currentSessionTime = hiddenTimer.getCurrentElapsed();
      const totalElapsedTime = state.baseElapsedTime + currentSessionTime;

      if (debugMode) {
        console.log('🔄 Finalizing time for question:', questionId, {
          baseTime: state.baseElapsedTime,
          sessionTime: currentSessionTime,
          totalTime: totalElapsedTime
        });
      }

      // Update database with final time
      const finalElapsedTimes = await ExamDBService.finalizeCurrentQuestionTime(examString, totalElapsedTime);
      
      // Update state with final elapsed times
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          allQuestionElapsedTimes: { ...finalElapsedTimes }
        }));
      }
      
      if (debugMode) {
        console.log('✅ Question time finalized - Final elapsed times:', finalElapsedTimes);
      }
    } catch (error) {
      console.error('❌ Error finalizing question time:', error);
    }
  }, [examString, hiddenTimer, debugMode, state.baseElapsedTime]);

  // Get all question elapsed times (for submission)
  const getAllQuestionElapsedTimes = useCallback((): Record<number, number> => {
    const result = { ...state.allQuestionElapsedTimes };
    
    // Include current question's time if tracking
    if (state.currentQuestionId && state.isTracking) {
      const currentSessionTime = hiddenTimer.getCurrentElapsed();
      result[state.currentQuestionId] = state.baseElapsedTime + currentSessionTime;
    }
    
    if (debugMode) {
      console.log('📊 Getting all question elapsed times:', result);
    }
    
    return result;
  }, [state.allQuestionElapsedTimes, state.currentQuestionId, state.isTracking, state.baseElapsedTime, hiddenTimer, debugMode]);

  // Get current elapsed time for display
  const getCurrentElapsedTime = useCallback(() => {
    if (!state.isTracking || !state.currentQuestionId) {
      return state.baseElapsedTime;
    }
    return getCurrentQuestionTime();
  }, [state.isTracking, state.currentQuestionId, state.baseElapsedTime, getCurrentQuestionTime]);

  // Sync with external timer
  const syncWithExternalTimer = useCallback((externalElapsed: number) => {
    if (isMountedRef.current && hiddenTimer.isRunning) {
      hiddenTimer.syncWithExternalTimer(externalElapsed);
    }
  }, [hiddenTimer]);

  // Load data on initialization
  useEffect(() => {
    if (examString && !dataLoadedRef.current) {
      loadExistingElapsedTimes();
    }
  }, [examString, loadExistingElapsedTimes]);

  // Handle question changes
  useEffect(() => {
    // Don't track if main timer not running
    if (!isTimerRunning || !isMountedRef.current) {
      if (state.isTracking) {
        stopQuestionTracking();
      }
      return;
    }

    // No current question
    if (!currentQuestionId) {
      if (state.isTracking) {
        stopQuestionTracking();
      }
      return;
    }

    // Handle question change or initialization
    if (!isInitializedRef.current || currentQuestionId !== previousQuestionRef.current) {
      if (debugMode) {
        console.log('🔄 Question change detected:', {
          previous: previousQuestionRef.current,
          current: currentQuestionId,
          previousElapsed: previousQuestionRef.current ? getQuestionElapsedTime(previousQuestionRef.current) : 0
        });
      }

      // Finalize previous question
      if (previousQuestionRef.current && state.isTracking) {
        finalizeQuestionTime(previousQuestionRef.current);
      }

      // Start tracking new question
      startQuestionTracking(currentQuestionId);
      previousQuestionRef.current = currentQuestionId;
      isInitializedRef.current = true;
    }
  }, [currentQuestionId, isTimerRunning, debugMode, startQuestionTracking, stopQuestionTracking, finalizeQuestionTime, state.isTracking, getQuestionElapsedTime]);

  // Auto-save interval
  useEffect(() => {
    // Clear existing interval
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }

    // Only start auto-save if tracking and timer running
    if (!state.isTracking || !isTimerRunning || !hiddenTimer.isRunning || !isMountedRef.current) {
      return;
    }

    // Set new interval
    saveIntervalRef.current = setInterval(() => {
      if (isMountedRef.current && state.isTracking && hiddenTimer.isRunning) {
        saveCurrentQuestionTime();
      }
    }, autoSaveInterval * 1000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    };
  }, [state.isTracking, isTimerRunning, hiddenTimer.isRunning, autoSaveInterval, saveCurrentQuestionTime]);

  // Handle timer stop
  useEffect(() => {
    if (!isTimerRunning && state.isTracking && isMountedRef.current) {
      if (debugMode) {
        console.log('🛑 Main timer stopped, finalizing current question');
      }
      
      if (state.currentQuestionId) {
        finalizeQuestionTime(state.currentQuestionId);
      }
      stopQuestionTracking();
    }
  }, [isTimerRunning, finalizeQuestionTime, stopQuestionTracking, debugMode, state.isTracking, state.currentQuestionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      // Clear save interval
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
      
      // Final save on unmount
      if (state.isTracking && state.currentQuestionId) {
        finalizeQuestionTime(state.currentQuestionId).catch(console.error);
      }
      
      // Cleanup hidden timer
      try {
        hiddenTimer.forceCleanup?.();
      } catch (error) {
        // Silent fail during cleanup
      }
    };
  }, []); // Empty dependency array

  // Debug info
  const getDebugInfo = useCallback(() => {
    const currentQuestionTotalTime = state.currentQuestionId ? getQuestionElapsedTime(state.currentQuestionId) : 0;
    
    return {
      questionTimer: {
        currentQuestionId: state.currentQuestionId,
        questionStartTime: state.questionStartTime,
        baseElapsedTime: state.baseElapsedTime,
        currentSessionTime: hiddenTimer.getCurrentElapsed(),
        currentQuestionTotalTime: currentQuestionTotalTime,
        isTracking: state.isTracking,
        totalSessionTime: state.totalSessionTime,
        lastSaveTime: state.lastSaveTime,
        allQuestionElapsedTimes: state.allQuestionElapsedTimes,
        dataLoaded: dataLoadedRef.current
      },
      hiddenTimer: hiddenTimer.getDebugInfo(),
      autoSave: {
        interval: autoSaveInterval,
        isActive: !!saveIntervalRef.current,
        nextSaveIn: saveIntervalRef.current ? autoSaveInterval : 0
      },
      session: {
        examString,
        sessionStartTime: sessionStartTimeRef.current,
        sessionUptime: Date.now() - sessionStartTimeRef.current,
        isTimerRunning,
        previousQuestion: previousQuestionRef.current,
        isInitialized: isInitializedRef.current,
        isMounted: isMountedRef.current
      }
    };
  }, [
    state, 
    hiddenTimer, 
    autoSaveInterval, 
    examString, 
    isTimerRunning,
    getQuestionElapsedTime
  ]);

  // Force start tracking (debug function)
  const forceStartTracking = useCallback(() => {
    if (currentQuestionId && isTimerRunning && isMountedRef.current) {
      if (debugMode) {
        console.log('🔧 Force starting question tracking');
      }
      startQuestionTracking(currentQuestionId);
    }
  }, [currentQuestionId, isTimerRunning, startQuestionTracking, debugMode]);

  return {
    // State
    isTracking: state.isTracking,
    currentQuestionId: state.currentQuestionId,
    currentElapsedTime: getCurrentElapsedTime(),
    currentQuestionTotalTime: state.currentQuestionId ? getQuestionElapsedTime(state.currentQuestionId) : 0,
    totalSessionTime: state.totalSessionTime,
    
    // Functions
    saveCurrentQuestionTime,
    finalizeQuestionTime,
    getQuestionElapsedTime,
    getAllQuestionElapsedTimes, // NEW: For submission payload
    syncWithExternalTimer,
    
    // Manual controls
    startTracking: startQuestionTracking,
    stopTracking: stopQuestionTracking,
    forceStartTracking,
    
    // Hidden timer access
    hiddenTimer: {
      elapsed: hiddenTimer.elapsed,
      isRunning: hiddenTimer.isRunning,
      formattedTime: hiddenTimer.formattedTime,
      currentFormattedTime: hiddenTimer.currentFormattedTime,
      start: hiddenTimer.start,
      stop: hiddenTimer.stop,
      pause: hiddenTimer.pause,
      resume: hiddenTimer.resume,
      reset: hiddenTimer.reset,
      restart: hiddenTimer.restart,
      getCurrentElapsed: hiddenTimer.getCurrentElapsed,
      isAccurate: hiddenTimer.isAccurate,
      forceCleanup: hiddenTimer.forceCleanup
    },
    
    // Debug info
    debugInfo: getDebugInfo(),
    debugMode,
    
    // Status checks
    isMounted: isMountedRef.current,
    dataLoaded: dataLoadedRef.current,
    
    // All question elapsed times for easy access
    allQuestionElapsedTimes: state.allQuestionElapsedTimes,
    
    // Debug-only functions
    ...(debugMode && {
      getFullDebugInfo: getDebugInfo,
      addDebugLog: hiddenTimer.addDebugLog,
      debugLogs: hiddenTimer.debugLogs,
      loadExistingElapsedTimes // Debug function to manually reload
    })
  };
};