// hooks/useQuestionTimer.ts
import { useState, useEffect, useRef, useCallback } from 'react';

interface QuestionTimerState {
  currentQuestionId: number | null;
  startTime: number;
  previousQuestionId: number | null;
}

interface QuestionTimeData {
  questionId: number;
  timeSpent: number; // in seconds
  timestamp: number;
}

interface UseQuestionTimerOptions {
  currentQuestionId: number | null;
  isExamRunning: boolean;
  onQuestionTimeUpdate?: (data: QuestionTimeData) => void;
}

export const useQuestionTimer = ({
  currentQuestionId,
  isExamRunning,
  onQuestionTimeUpdate
}: UseQuestionTimerOptions) => {
  const [state, setState] = useState<QuestionTimerState>({
    currentQuestionId: null,
    startTime: 0,
    previousQuestionId: null
  });

  const questionTimesRef = useRef<Record<number, number>>({});
  const isInitializedRef = useRef(false);

  // Calculate time spent on previous question
  const calculatePreviousQuestionTime = useCallback((): QuestionTimeData | null => {
    if (state.previousQuestionId === null || state.startTime === 0) {
      return null;
    }

    const now = Date.now();
    const timeSpent = Math.floor((now - state.startTime) / 1000);
    
    if (timeSpent < 0) return null;

    return {
      questionId: state.previousQuestionId,
      timeSpent,
      timestamp: now
    };
  }, [state.previousQuestionId, state.startTime]);

  // Get current question elapsed time
  const getCurrentQuestionTime = useCallback((): number => {
    if (state.currentQuestionId === null || state.startTime === 0 || !isExamRunning) {
      return 0;
    }

    const now = Date.now();
    const elapsed = Math.floor((now - state.startTime) / 1000);
    return Math.max(0, elapsed);
  }, [state.currentQuestionId, state.startTime, isExamRunning]);

  // Get total time for a specific question
  const getQuestionTime = useCallback((questionId: number): number => {
    const savedTime = questionTimesRef.current[questionId] || 0;
    
    // Add current time if this is the active question
    if (state.currentQuestionId === questionId && isExamRunning) {
      return savedTime + getCurrentQuestionTime();
    }
    
    return savedTime;
  }, [state.currentQuestionId, isExamRunning, getCurrentQuestionTime]);

  // Get all question times
  const getAllQuestionTimes = useCallback((): Record<number, number> => {
    const times = { ...questionTimesRef.current };
    
    // Add current question time if active
    if (state.currentQuestionId !== null && isExamRunning) {
      const currentTime = getCurrentQuestionTime();
      times[state.currentQuestionId] = (times[state.currentQuestionId] || 0) + currentTime;
    }
    
    return times;
  }, [state.currentQuestionId, isExamRunning, getCurrentQuestionTime]);

  // Finalize previous question time
  const finalizePreviousQuestion = useCallback(() => {
    const previousQuestionData = calculatePreviousQuestionTime();
    
    if (previousQuestionData) {
      const { questionId, timeSpent } = previousQuestionData;
      
      // Add to accumulated time
      questionTimesRef.current[questionId] = (questionTimesRef.current[questionId] || 0) + timeSpent;
      
      // Notify parent component
      if (onQuestionTimeUpdate) {
        onQuestionTimeUpdate(previousQuestionData);
      }
    }
  }, [calculatePreviousQuestionTime, onQuestionTimeUpdate]);

  // Handle question change
  useEffect(() => {
    if (!isExamRunning) {
      // If exam stopped, finalize current question and reset
      if (state.currentQuestionId !== null) {
        finalizePreviousQuestion();
      }
      
      setState({
        currentQuestionId: null,
        startTime: 0,
        previousQuestionId: null
      });
      isInitializedRef.current = false;
      return;
    }

    // Skip if question hasn't changed
    if (currentQuestionId === state.currentQuestionId) {
      return;
    }

    // Initialize or handle question change
    if (!isInitializedRef.current) {
      // First initialization
      setState({
        currentQuestionId,
        startTime: currentQuestionId ? Date.now() : 0,
        previousQuestionId: null
      });
      isInitializedRef.current = true;
    } else {
      // Question changed - finalize previous and start new
      finalizePreviousQuestion();
      
      setState(prev => ({
        currentQuestionId,
        startTime: currentQuestionId ? Date.now() : 0,
        previousQuestionId: prev.currentQuestionId
      }));
    }
  }, [currentQuestionId, isExamRunning, state.currentQuestionId, finalizePreviousQuestion]);

  // Finalize on unmount
  useEffect(() => {
    return () => {
      if (state.currentQuestionId !== null && isExamRunning) {
        const questionData = calculatePreviousQuestionTime();
        if (questionData) {
          const { questionId, timeSpent } = questionData;
          questionTimesRef.current[questionId] = (questionTimesRef.current[questionId] || 0) + timeSpent;
          
          if (onQuestionTimeUpdate) {
            onQuestionTimeUpdate(questionData);
          }
        }
      }
    };
  }, []);

  // Reset all times (useful for exam restart)
  const resetAllTimes = useCallback(() => {
    questionTimesRef.current = {};
    setState({
      currentQuestionId: null,
      startTime: 0,
      previousQuestionId: null
    });
    isInitializedRef.current = false;
  }, []);

  return {
    // Current state
    currentQuestionId: state.currentQuestionId,
    isTracking: state.currentQuestionId !== null && isExamRunning,
    currentQuestionElapsed: getCurrentQuestionTime(),

    // Question time data
    getQuestionTime,
    getAllQuestionTimes,
    
    // Actions
    resetAllTimes,
    
    // Utilities
    formatTime: (seconds: number): string => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },

    // Debug info
    debugInfo: {
      startTime: state.startTime,
      previousQuestionId: state.previousQuestionId,
      savedTimes: questionTimesRef.current,
      isInitialized: isInitializedRef.current
    }
  };
};