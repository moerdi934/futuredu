// hooks/useExamAutosave.ts
import { useState, useEffect, useRef, useCallback } from 'react';

interface AutosaveState {
  isAutoSaving: boolean;
  lastSaveTime: number;
  saveCount: number;
  error: string | null;
}

interface AutosaveData {
  answers: Record<number, any>;
  questionTimes: Record<number, number>;
}

interface UseExamAutosaveOptions {
  examScheduleId: string;
  examId: number;
  answers: Record<number, any>;
  questionTimes: Record<number, number>;
  interval?: number; // milliseconds, default 2 minutes
  enabled?: boolean;
}

export const useExamAutosave = ({
  examScheduleId,
  examId,
  answers,
  questionTimes,
  interval = 120000, // 2 minutes
  enabled = true
}: UseExamAutosaveOptions) => {
  const [state, setState] = useState<AutosaveState>({
    isAutoSaving: false,
    lastSaveTime: 0,
    saveCount: 0,
    error: null
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<AutosaveData>({ answers: {}, questionTimes: {} });
  const saveInProgressRef = useRef<boolean>(false);

  // Check if data has changed
  const hasDataChanged = useCallback((newData: AutosaveData): boolean => {
    const { answers: lastAnswers, questionTimes: lastQuestionTimes } = lastDataRef.current;
    
    // Check answers
    const answersChanged = JSON.stringify(newData.answers) !== JSON.stringify(lastAnswers);
    
    // Check question times (more lenient - only save if significant change)
    const questionTimesChanged = Object.keys(newData.questionTimes).some(qId => {
      const questionId = parseInt(qId);
      const newTime = newData.questionTimes[questionId] || 0;
      const lastTime = lastQuestionTimes[questionId] || 0;
      return Math.abs(newTime - lastTime) >= 5; // Only save if 5+ seconds difference
    });

    return answersChanged || questionTimesChanged;
  }, []);

  // Save to server
  const saveToServer = useCallback(async (data: AutosaveData): Promise<boolean> => {
    if (saveInProgressRef.current) {
      return false;
    }

    saveInProgressRef.current = true;
    setState(prev => ({ ...prev, isAutoSaving: true, error: null }));

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No auth token');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/examSession/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        credentials: 'include',
        body: JSON.stringify({
          exam_schedule_id: examScheduleId,
          exam_id: examId,
          answers: data.answers,
          question_elapsed_times: data.questionTimes,
          save_timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status !== 'success') {
        throw new Error(result.message || 'Save failed');
      }

      // Update last saved data
      lastDataRef.current = {
        answers: { ...data.answers },
        questionTimes: { ...data.questionTimes }
      };

      setState(prev => ({
        ...prev,
        isAutoSaving: false,
        lastSaveTime: Date.now(),
        saveCount: prev.saveCount + 1,
        error: null
      }));

      return true;

    } catch (error) {
      setState(prev => ({
        ...prev,
        isAutoSaving: false,
        error: error.message || 'Save failed'
      }));
      return false;
    } finally {
      saveInProgressRef.current = false;
    }
  }, [examScheduleId, examId]);

  // Manual save function
  const saveNow = useCallback(async (): Promise<boolean> => {
    const currentData = { answers, questionTimes };
    return await saveToServer(currentData);
  }, [answers, questionTimes, saveToServer]);

  // Auto-save interval
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const performAutoSave = async () => {
      const currentData = { answers, questionTimes };
      
      // Only save if data has changed
      if (hasDataChanged(currentData)) {
        await saveToServer(currentData);
      }
    };

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set new interval
    intervalRef.current = setInterval(performAutoSave, interval);

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, answers, questionTimes, hasDataChanged, saveToServer]);

  // Save on significant changes (immediate)
  useEffect(() => {
    if (!enabled) return;

    const currentData = { answers, questionTimes };
    
    // Check for significant answer changes (immediate save)
    const answersChanged = JSON.stringify(currentData.answers) !== JSON.stringify(lastDataRef.current.answers);
    
    if (answersChanged && Object.keys(currentData.answers).length > 0) {
      // Debounce immediate saves
      const timeoutId = setTimeout(() => {
        saveToServer(currentData);
      }, 3000); // 3 second delay for answer changes

      return () => clearTimeout(timeoutId);
    }
  }, [answers, enabled, saveToServer]);

  // Final save on unmount
  useEffect(() => {
    return () => {
      // Attempt final save on unmount
      if (enabled && !saveInProgressRef.current) {
        const currentData = { answers, questionTimes };
        if (hasDataChanged(currentData)) {
          // Fire and forget final save
          saveToServer(currentData).catch(console.error);
        }
      }
    };
  }, []);

  return {
    // State
    isAutoSaving: state.isAutoSaving,
    lastSaveTime: state.lastSaveTime,
    saveCount: state.saveCount,
    error: state.error,

    // Actions
    saveNow,
    
    // Status helpers
    hasUnsavedChanges: hasDataChanged({ answers, questionTimes }),
    timeSinceLastSave: state.lastSaveTime ? Date.now() - state.lastSaveTime : null,
    
    // Utilities
    formatLastSave: (): string => {
      if (!state.lastSaveTime) return 'Never';
      
      const timeDiff = Date.now() - state.lastSaveTime;
      const minutes = Math.floor(timeDiff / 60000);
      const seconds = Math.floor((timeDiff % 60000) / 1000);
      
      if (minutes > 0) {
        return `${minutes}m ${seconds}s ago`;
      }
      return `${seconds}s ago`;
    },

    // Debug info
    debugInfo: {
      enabled,
      interval,
      saveInProgress: saveInProgressRef.current,
      lastData: lastDataRef.current,
      currentData: { answers, questionTimes }
    }
  };
};