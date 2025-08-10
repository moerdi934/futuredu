// hooks/useHiddenQuestionTimer.ts - COMPLETELY FIXED SIMPLE VERSION
import { useState, useEffect, useRef, useCallback } from 'react';

interface HiddenTimerState {
  elapsed: number;
  isRunning: boolean;
  startTime: number;
  lastTick: number;
  isAccurate: boolean;
}

interface DebugLogEntry {
  timestamp: number;
  elapsed: number;
  action: string;
  details?: any;
}

interface UseHiddenQuestionTimerOptions {
  onTick?: (elapsed: number) => void;
  tickInterval?: number;
  autoStart?: boolean;
  debugMode?: boolean;
}

export const useHiddenQuestionTimer = ({
  onTick,
  tickInterval = 1000,
  autoStart = false,
  debugMode = false
}: UseHiddenQuestionTimerOptions = {}) => {
  
  // Core state - simplified
  const [timerState, setTimerState] = useState<HiddenTimerState>({
    elapsed: 0,
    isRunning: false,
    startTime: 0,
    lastTick: 0,
    isAccurate: true
  });

  // Control refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const debugLogsRef = useRef<DebugLogEntry[]>([]);
  const lastElapsedRef = useRef<number>(0);

  // Stable debug logging function
  const addDebugLog = useCallback((action: string, details?: any) => {
    if (!debugMode || !isMountedRef.current) return;
    
    try {
      const logEntry: DebugLogEntry = {
        timestamp: Date.now(),
        elapsed: timerState.elapsed,
        action,
        details
      };
      
      debugLogsRef.current = [...debugLogsRef.current.slice(-19), logEntry]; // Keep last 20
      
      if (debugMode) {
        console.log(`🕐 HiddenTimer [${action}]:`, logEntry);
      }
    } catch (error) {
      // Silent fail to prevent loops
    }
  }, [debugMode, timerState.elapsed]);

  // FIXED: Simple, reliable tick function
  const tick = useCallback(() => {
    if (!isMountedRef.current) return;

    setTimerState(prevState => {
      if (!prevState.isRunning || !isMountedRef.current) {
        return prevState;
      }

      const now = Date.now();
      const rawElapsed = Math.floor((now - prevState.startTime) / 1000);
      
      // Ensure elapsed never decreases
      const safeElapsed = Math.max(rawElapsed, prevState.elapsed, lastElapsedRef.current);
      lastElapsedRef.current = safeElapsed;
      
      const newState = {
        ...prevState,
        elapsed: safeElapsed,
        lastTick: now,
        isAccurate: true
      };

      // Call onTick callback safely
      if (onTick && isMountedRef.current) {
        try {
          onTick(safeElapsed);
        } catch (error) {
          console.error('Error in onTick callback:', error);
        }
      }

      return newState;
    });
  }, [onTick]);

  // Clear interval safely
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // FIXED: Start timer - completely rewritten
  const start = useCallback(() => {
    if (!isMountedRef.current) return;
    
    // Clear any existing interval
    clearCurrentInterval();

    const now = Date.now();
    
    // Reset state completely
    setTimerState({
      elapsed: 0,
      isRunning: true,
      startTime: now,
      lastTick: now,
      isAccurate: true
    });

    lastElapsedRef.current = 0;
    addDebugLog('START', { startTime: now });

    // Start new interval
    intervalRef.current = setInterval(tick, tickInterval);
    
    // Immediate first tick
    setTimeout(tick, 0);
  }, [tick, tickInterval, addDebugLog, clearCurrentInterval]);

  // Stop timer
  const stop = useCallback(() => {
    clearCurrentInterval();
    
    setTimerState(prevState => {
      addDebugLog('STOP', { finalElapsed: prevState.elapsed });
      return {
        ...prevState,
        isRunning: false
      };
    });
  }, [addDebugLog, clearCurrentInterval]);

  // Pause timer
  const pause = useCallback(() => {
    clearCurrentInterval();
    
    setTimerState(prevState => {
      addDebugLog('PAUSE', { pausedAt: prevState.elapsed });
      return {
        ...prevState,
        isRunning: false
      };
    });
  }, [addDebugLog, clearCurrentInterval]);

  // Resume timer
  const resume = useCallback(() => {
    if (timerState.isRunning || !isMountedRef.current) return;

    const now = Date.now();
    const currentElapsed = timerState.elapsed;
    
    setTimerState(prevState => ({
      ...prevState,
      isRunning: true,
      startTime: now - (currentElapsed * 1000), // Adjust start time
      lastTick: now,
      isAccurate: true
    }));

    addDebugLog('RESUME', { resumedAt: currentElapsed });
    
    // Start interval
    intervalRef.current = setInterval(tick, tickInterval);
    
    // Immediate tick
    setTimeout(tick, 0);
  }, [timerState.isRunning, timerState.elapsed, tick, tickInterval, addDebugLog]);

  // Reset timer
  const reset = useCallback(() => {
    clearCurrentInterval();

    const now = Date.now();
    
    setTimerState({
      elapsed: 0,
      isRunning: false,
      startTime: now,
      lastTick: now,
      isAccurate: true
    });

    lastElapsedRef.current = 0;
    addDebugLog('RESET', { resetTime: now });
  }, [addDebugLog, clearCurrentInterval]);

  // Restart timer (reset + start)
  const restart = useCallback(() => {
    if (!isMountedRef.current) return;
    
    clearCurrentInterval();

    const now = Date.now();
    
    setTimerState({
      elapsed: 0,
      isRunning: true,
      startTime: now,
      lastTick: now,
      isAccurate: true
    });

    lastElapsedRef.current = 0;
    addDebugLog('RESTART', { restartTime: now });

    // Start interval
    intervalRef.current = setInterval(tick, tickInterval);
    
    // Immediate tick
    setTimeout(tick, 0);
  }, [tick, tickInterval, addDebugLog, clearCurrentInterval]);

  // Get current elapsed time
  const getCurrentElapsed = useCallback(() => {
    if (!timerState.isRunning) {
      return timerState.elapsed;
    }

    const now = Date.now();
    const calculatedElapsed = Math.floor((now - timerState.startTime) / 1000);
    
    return Math.max(calculatedElapsed, timerState.elapsed, lastElapsedRef.current);
  }, [timerState.isRunning, timerState.elapsed, timerState.startTime]);

  // Format time utility
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Sync with external timer - simplified
  const syncWithExternalTimer = useCallback((externalElapsed: number) => {
    if (!isMountedRef.current) return;
    
    const currentElapsed = getCurrentElapsed();
    const difference = Math.abs(currentElapsed - externalElapsed);
    
    if (debugMode && difference > 2) {
      addDebugLog('SYNC_DRIFT', { 
        hiddenElapsed: currentElapsed, 
        externalElapsed, 
        drift: difference 
      });
    }

    // Auto-correct if drift is significant (more than 5 seconds)
    if (difference > 5 && isMountedRef.current) {
      const now = Date.now();
      setTimerState(prevState => {
        const newState = {
          ...prevState,
          startTime: now - (externalElapsed * 1000),
          elapsed: externalElapsed,
          lastTick: now,
          isAccurate: true
        };
        
        lastElapsedRef.current = externalElapsed;
        return newState;
      });
      
      addDebugLog('AUTO_SYNC', { correctedElapsed: externalElapsed });
    }
  }, [getCurrentElapsed, debugMode, addDebugLog]);

  // Get debug info
  const getDebugInfo = useCallback(() => {
    return {
      state: timerState,
      logs: debugLogsRef.current.slice(-5),
      uptime: Date.now() - (timerState.startTime || Date.now()),
      currentElapsed: getCurrentElapsed(),
      isAccurate: timerState.isAccurate,
      isUnmounted: !isMountedRef.current,
      lastElapsedRef: lastElapsedRef.current,
      intervalActive: !!intervalRef.current
    };
  }, [timerState, getCurrentElapsed]);

  // Force cleanup
  const forceCleanup = useCallback(() => {
    isMountedRef.current = false;
    clearCurrentInterval();
    
    try {
      setTimerState(prev => ({ ...prev, isRunning: false }));
    } catch (error) {
      // Silent fail during cleanup
    }
    
    if (debugMode) {
      console.log('🕐 HiddenTimer [FORCE_CLEANUP]: Timer cleaned up');
    }
  }, [debugMode, clearCurrentInterval]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart && isMountedRef.current) {
      start();
    }
  }, []); // Run once on mount only

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Empty dependency array

  return {
    // Core state
    elapsed: timerState.elapsed,
    isRunning: timerState.isRunning && isMountedRef.current,
    startTime: timerState.startTime,
    lastTick: timerState.lastTick,
    isAccurate: timerState.isAccurate,

    // Control functions
    start,
    stop,
    pause,
    resume,
    reset,
    restart,

    // Utility functions
    getCurrentElapsed,
    formatTime,
    syncWithExternalTimer,
    forceCleanup,

    // Debug functions
    getDebugInfo,
    addDebugLog,

    // Computed values
    formattedTime: formatTime(timerState.elapsed),
    currentFormattedTime: formatTime(getCurrentElapsed()),
    
    // Status checks
    isUnmounted: !isMountedRef.current,
    intervalActive: !!intervalRef.current,
    
    // Debug mode info
    debugMode,
    debugLogs: debugMode ? debugLogsRef.current.slice(-5) : []
  };
};