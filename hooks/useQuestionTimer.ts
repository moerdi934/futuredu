// Enhanced Question Timer Tracking Hook
import { useState, useEffect, useRef, useCallback } from 'react';
import ExamDBService from '../utils/ExamDBService';

// Update untuk ChainExam component - tambahkan di bagian imports
// import { useQuestionTimer, enhancedExamDBService } from '../hooks/useQuestionTimer';

interface QuestionTimerState {
  currentQuestionId: number | null;
  questionStartTime: number;
  accumulatedTime: number;
  lastUpdateTime: number;
  isTracking: boolean;
}

interface UseQuestionTimerOptions {
  examString: string;
  currentQuestionId: number | null;
  timerElapsed: number; // Total timer elapsed dari useSecureTimer
  isTimerRunning: boolean;
  autoSaveInterval?: number; // dalam detik, default 3
}

export const useQuestionTimer = ({
  examString,
  currentQuestionId,
  timerElapsed,
  isTimerRunning,
  autoSaveInterval = 3
}: UseQuestionTimerOptions) => {
  const [state, setState] = useState<QuestionTimerState>({
    currentQuestionId: null,
    questionStartTime: 0,
    accumulatedTime: 0,
    lastUpdateTime: 0,
    isTracking: false
  });

  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousQuestionRef = useRef<number | null>(null);
  const lastTimerElapsedRef = useRef<number>(0);

  // Hitung waktu yang dihabiskan untuk question saat ini
  const getCurrentQuestionTime = useCallback(() => {
    if (!state.isTracking || !state.currentQuestionId) {
      return 0;
    }

    // Hitung berdasarkan perubahan timer elapsed
    const timerDelta = timerElapsed - lastTimerElapsedRef.current;
    return Math.max(0, timerDelta);
  }, [state.isTracking, state.currentQuestionId, timerElapsed]);

  // Save current question time ke IndexedDB
  const saveCurrentQuestionTime = useCallback(async () => {
    if (!examString || !state.currentQuestionId || !state.isTracking) {
      return;
    }

    try {
      const currentTime = getCurrentQuestionTime();
      
      if (currentTime > 0) {
        // Update accumulated time untuk question saat ini
        const newAccumulatedTime = state.accumulatedTime + currentTime;
        
        console.log('💾 Saving question time:', {
          questionId: state.currentQuestionId,
          timeSpent: currentTime,
          accumulated: newAccumulatedTime,
          timerElapsed: timerElapsed
        });

        // Get existing data
        const examData = await ExamDBService.getExamData(examString) || {
          answers: {},
          startTime: Date.now(),
          questionElapsedTimes: {},
          lastQuestionVisit: null
        };

        // Update question elapsed time
        examData.questionElapsedTimes[state.currentQuestionId] = 
          (examData.questionElapsedTimes[state.currentQuestionId] || 0) + currentTime;

        // Update last question visit
        examData.lastQuestionVisit = {
          questionId: state.currentQuestionId,
          timerElapsed: timerElapsed
        };

        // Save to IndexedDB
        const db = await ExamDBService.db;
        await db.put('examData', examData, examString);

        // Update state
        setState(prev => ({
          ...prev,
          accumulatedTime: newAccumulatedTime,
          lastUpdateTime: timerElapsed
        }));

        // Update reference
        lastTimerElapsedRef.current = timerElapsed;
      }
    } catch (error) {
      console.error('❌ Error saving question time:', error);
    }
  }, [examString, state.currentQuestionId, state.isTracking, state.accumulatedTime, getCurrentQuestionTime, timerElapsed]);

  // Finalize time untuk question sebelumnya saat berpindah
  const finalizeQuestionTime = useCallback(async (questionId: number) => {
    if (!examString) return;

    try {
      const currentTime = getCurrentQuestionTime();
      
      if (currentTime > 0) {
        console.log('🔄 Finalizing time for question:', {
          questionId,
          timeSpent: currentTime,
          timerElapsed: timerElapsed
        });

        // Get existing data
        const examData = await ExamDBService.getExamData(examString) || {
          answers: {},
          startTime: Date.now(),
          questionElapsedTimes: {},
          lastQuestionVisit: null
        };

        // Add final time to the question
        examData.questionElapsedTimes[questionId] = 
          (examData.questionElapsedTimes[questionId] || 0) + currentTime;

        // Clear last question visit since we're changing questions
        examData.lastQuestionVisit = null;

        // Save to IndexedDB
        const db = await ExamDBService.db;
        await db.put('examData', examData, examString);
      }
    } catch (error) {
      console.error('❌ Error finalizing question time:', error);
    }
  }, [examString, getCurrentQuestionTime, timerElapsed]);

  // Start tracking untuk question baru
  const startQuestionTracking = useCallback((questionId: number) => {
    console.log('▶️ Starting tracking for question:', questionId);
    
    setState({
      currentQuestionId: questionId,
      questionStartTime: timerElapsed,
      accumulatedTime: 0,
      lastUpdateTime: timerElapsed,
      isTracking: true
    });

    lastTimerElapsedRef.current = timerElapsed;
  }, [timerElapsed]);

  // Stop tracking
  const stopQuestionTracking = useCallback(() => {
    console.log('⏹️ Stopping question tracking');
    
    setState(prev => ({
      ...prev,
      isTracking: false
    }));
  }, []);

  // Handle question change
  useEffect(() => {
    if (!isTimerRunning || !currentQuestionId) {
      if (state.isTracking) {
        stopQuestionTracking();
      }
      return;
    }

    // Jika question berubah
    if (currentQuestionId !== previousQuestionRef.current) {
      // Finalize time untuk question sebelumnya (jika ada)
      if (previousQuestionRef.current && state.isTracking) {
        finalizeQuestionTime(previousQuestionRef.current);
      }

      // Start tracking untuk question baru
      startQuestionTracking(currentQuestionId);
      previousQuestionRef.current = currentQuestionId;
    }
  }, [currentQuestionId, isTimerRunning, state.isTracking, finalizeQuestionTime, startQuestionTracking, stopQuestionTracking]);

  // Auto-save every X seconds
  useEffect(() => {
    if (!state.isTracking || !isTimerRunning) {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
      return;
    }

    // Clear existing interval
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
    }

    // Set new interval
    saveIntervalRef.current = setInterval(() => {
      saveCurrentQuestionTime();
    }, autoSaveInterval * 1000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [state.isTracking, isTimerRunning, autoSaveInterval, saveCurrentQuestionTime]);

  // Stop tracking when timer stops
  useEffect(() => {
    if (!isTimerRunning && state.isTracking) {
      // Final save before stopping
      if (state.currentQuestionId) {
        finalizeQuestionTime(state.currentQuestionId);
      }
      stopQuestionTracking();
    }
  }, [isTimerRunning, state.isTracking, state.currentQuestionId, finalizeQuestionTime, stopQuestionTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      
      // Final save on unmount
      if (state.isTracking && state.currentQuestionId) {
        finalizeQuestionTime(state.currentQuestionId);
      }
    };
  }, [state.isTracking, state.currentQuestionId, finalizeQuestionTime]);

  // Get current question elapsed time
  const getCurrentElapsedTime = useCallback(() => {
    if (!state.isTracking) return 0;
    return state.accumulatedTime + getCurrentQuestionTime();
  }, [state.isTracking, state.accumulatedTime, getCurrentQuestionTime]);

  // Get total elapsed time for specific question
  const getQuestionElapsedTime = useCallback(async (questionId: number): Promise<number> => {
    try {
      const examData = await ExamDBService.getExamData(examString);
      if (!examData || !examData.questionElapsedTimes) {
        return 0;
      }
      
      let totalTime = examData.questionElapsedTimes[questionId] || 0;
      
      // Add current time if this is the active question
      if (state.currentQuestionId === questionId && state.isTracking) {
        totalTime += getCurrentQuestionTime();
      }
      
      return totalTime;
    } catch (error) {
      console.error('❌ Error getting question elapsed time:', error);
      return 0;
    }
  }, [examString, state.currentQuestionId, state.isTracking, getCurrentQuestionTime]);

  return {
    // State
    isTracking: state.isTracking,
    currentQuestionId: state.currentQuestionId,
    currentElapsedTime: getCurrentElapsedTime(),
    
    // Functions
    saveCurrentQuestionTime,
    finalizeQuestionTime,
    getQuestionElapsedTime,
    
    // Manual controls (jika diperlukan)
    startTracking: startQuestionTracking,
    stopTracking: stopQuestionTracking,
    
    // Debug info
    debugInfo: {
      questionStartTime: state.questionStartTime,
      accumulatedTime: state.accumulatedTime,
      lastUpdateTime: state.lastUpdateTime,
      currentQuestionTime: getCurrentQuestionTime(),
      timerElapsed: timerElapsed,
      autoSaveInterval: autoSaveInterval
    }
  };
};

// Updated ExamDBService methods for better question time tracking
export const enhancedExamDBService = {
  // Get all question elapsed times with current question adjustment
  async getQuestionElapsedTimes(examString: string, currentQuestionId?: number, currentTime?: number): Promise<Record<number, number>> {
    try {
      const data = await ExamDBService.getExamData(examString);
      
      if (!data || !data.questionElapsedTimes) {
        return {};
      }
      
      const times = { ...data.questionElapsedTimes };
      
      // Add current time if tracking active question
      if (currentQuestionId && currentTime && currentTime > 0) {
        times[currentQuestionId] = (times[currentQuestionId] || 0) + currentTime;
      }
      
      return times;
    } catch (error) {
      console.error('❌ Error getting question elapsed times:', error);
      return {};
    }
  },

  // Update question time with better logic
  async updateQuestionTime(examString: string, questionId: number, additionalTime: number): Promise<void> {
    try {
      if (!Number.isFinite(additionalTime) || additionalTime <= 0) {
        return;
      }

      const db = await ExamDBService.db;
      const data = await ExamDBService.getExamData(examString) || {
        answers: {},
        startTime: Date.now(),
        questionElapsedTimes: {},
        lastQuestionVisit: null
      };

      // Add time to existing time
      data.questionElapsedTimes[questionId] = (data.questionElapsedTimes[questionId] || 0) + Math.floor(additionalTime);

      await db.put('examData', data, examString);
      
      console.log('✅ Updated question time:', {
        questionId,
        additionalTime: Math.floor(additionalTime),
        totalTime: data.questionElapsedTimes[questionId]
      });
    } catch (error) {
      console.error('❌ Error updating question time:', error);
    }
  },

  // Reset all question times (jika diperlukan)
  async resetQuestionTimes(examString: string): Promise<void> {
    try {
      const db = await ExamDBService.db;
      const data = await ExamDBService.getExamData(examString);
      
      if (data) {
        data.questionElapsedTimes = {};
        data.lastQuestionVisit = null;
        await db.put('examData', data, examString);
        console.log('🔄 Reset question times for exam:', examString);
      }
    } catch (error) {
      console.error('❌ Error resetting question times:', error);
    }
  }
};