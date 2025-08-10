// utils/TimerRecoveryUtil.ts - COMPLETELY FIXED SIMPLIFIED VERSION
export class TimerRecoveryUtil {
  private lastMainTimerValue: number = 0;
  private lastUpdateTime: number = Date.now();
  private stuckCount: number = 0;
  private recoveryAttempts: number = 0;
  private maxRecoveryAttempts: number = 3;
  private debugMode: boolean = false;
  private recoveryInProgress: boolean = false;

  constructor(debugMode: boolean = false) {
    this.debugMode = debugMode;
    this.log('TimerRecoveryUtil initialized');
  }

  private log(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`🔧 TimerRecovery: ${message}`, data || '');
    }
  }

  // FIXED: Simple and reliable health check
  checkTimerHealth(currentMainTimer: number, isTimerRunning: boolean): {
    isHealthy: boolean;
    isStuck: boolean;
    needsRecovery: boolean;
    diagnostics: any;
  } {
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUpdateTime;
    
    // Timer should progress if running for more than 3 seconds
    const shouldHaveProgressed = isTimerRunning && timeSinceLastUpdate > 3000;
    const timerProgressed = currentMainTimer !== this.lastMainTimerValue;
    
    // Detect stuck timer
    const isStuck = shouldHaveProgressed && !timerProgressed;
    
    if (isStuck) {
      this.stuckCount++;
      this.log('Timer appears stuck', {
        currentTimer: currentMainTimer,
        lastTimer: this.lastMainTimerValue,
        timeSinceUpdate: timeSinceLastUpdate,
        stuckCount: this.stuckCount
      });
    } else if (timerProgressed) {
      // Timer is moving, reset stuck count
      this.stuckCount = 0;
    }
    
    // Update tracking variables only if timer progressed
    if (timerProgressed || timeSinceLastUpdate > 5000) {
      this.lastMainTimerValue = currentMainTimer;
      this.lastUpdateTime = now;
    }
    
    const diagnostics = {
      currentTimer: currentMainTimer,
      lastTimer: this.lastMainTimerValue,
      timeSinceUpdate: timeSinceLastUpdate,
      timerProgressed,
      shouldHaveProgressed,
      stuckCount: this.stuckCount,
      recoveryAttempts: this.recoveryAttempts,
      isTimerRunning,
      recoveryInProgress: this.recoveryInProgress
    };
    
    const needsRecovery = 
      isStuck && 
      this.stuckCount >= 2 && 
      this.recoveryAttempts < this.maxRecoveryAttempts && 
      !this.recoveryInProgress;
    
    return {
      isHealthy: !isStuck && this.stuckCount === 0,
      isStuck,
      needsRecovery,
      diagnostics
    };
  }

  // FIXED: Attempt to recover stuck timer with proper error handling
  async attemptRecovery(
    restartMainTimer: () => boolean,
    getCurrentExpectedTime: () => number,
    onRecoverySuccess?: () => void,
    onRecoveryFailed?: (error: any) => void
  ): Promise<boolean> {
    if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
      this.log('Max recovery attempts reached');
      return false;
    }

    if (this.recoveryInProgress) {
      this.log('Recovery already in progress');
      return false;
    }

    this.recoveryInProgress = true;
    this.recoveryAttempts++;
    
    try {
      this.log(`Attempting timer recovery (attempt ${this.recoveryAttempts})`);

      // Get expected timer value
      const expectedTime = getCurrentExpectedTime();
      this.log('Expected timer value:', expectedTime);
      
      // Try to restart main timer
      const restartSuccess = restartMainTimer();
      
      if (restartSuccess) {
        // Reset counters on successful restart
        this.stuckCount = 0;
        this.lastMainTimerValue = expectedTime;
        this.lastUpdateTime = Date.now();
        
        this.log('Timer recovery successful', {
          attempt: this.recoveryAttempts,
          expectedTime,
          newLastValue: this.lastMainTimerValue
        });
        
        onRecoverySuccess?.();
        this.recoveryInProgress = false;
        return true;
      } else {
        this.log('Timer restart failed');
        this.recoveryInProgress = false;
        return false;
      }
      
    } catch (error) {
      this.log('Timer recovery failed with error:', error);
      
      onRecoveryFailed?.(error);
      this.recoveryInProgress = false;
      return false;
    }
  }

  // Reset recovery state - useful when starting new exam
  resetRecovery(): void {
    this.stuckCount = 0;
    this.recoveryAttempts = 0;
    this.lastUpdateTime = Date.now();
    this.lastMainTimerValue = 0;
    this.recoveryInProgress = false;
    
    this.log('Timer recovery state reset');
  }

  // Get recovery statistics
  getRecoveryStats(): {
    stuckCount: number;
    recoveryAttempts: number;
    maxRecoveryAttempts: number;
    lastUpdateTime: number;
    canAttemptRecovery: boolean;
    recoveryInProgress: boolean;
  } {
    return {
      stuckCount: this.stuckCount,
      recoveryAttempts: this.recoveryAttempts,
      maxRecoveryAttempts: this.maxRecoveryAttempts,
      lastUpdateTime: this.lastUpdateTime,
      canAttemptRecovery: this.recoveryAttempts < this.maxRecoveryAttempts && !this.recoveryInProgress,
      recoveryInProgress: this.recoveryInProgress
    };
  }

  // Force recovery state update (for debugging)
  forceUpdateState(currentTimer: number): void {
    this.lastMainTimerValue = currentTimer;
    this.lastUpdateTime = Date.now();
    this.stuckCount = 0;
    this.log('Force updated recovery state', { currentTimer });
  }

  // Check if recovery is needed without updating state
  isRecoveryNeeded(currentMainTimer: number, isTimerRunning: boolean): boolean {
    const health = this.checkTimerHealth(currentMainTimer, isTimerRunning);
    return health.needsRecovery;
  }
}

// Simplified hook for using Timer Recovery
import { useRef, useCallback } from 'react';

export const useTimerRecovery = (debugMode: boolean = false) => {
  const recoveryUtil = useRef(new TimerRecoveryUtil(debugMode));

  const checkTimerHealth = useCallback((mainTimer: number, isRunning: boolean) => {
    return recoveryUtil.current.checkTimerHealth(mainTimer, isRunning);
  }, []);

  const attemptRecovery = useCallback(async (
    restartTimer: () => boolean,
    getExpectedTime: () => number,
    onSuccess?: () => void,
    onFailed?: (error: any) => void
  ) => {
    return recoveryUtil.current.attemptRecovery(restartTimer, getExpectedTime, onSuccess, onFailed);
  }, []);

  const resetRecovery = useCallback(() => {
    recoveryUtil.current.resetRecovery();
  }, []);

  const getStats = useCallback(() => {
    return recoveryUtil.current.getRecoveryStats();
  }, []);

  const forceUpdateState = useCallback((currentTimer: number) => {
    recoveryUtil.current.forceUpdateState(currentTimer);
  }, []);

  const isRecoveryNeeded = useCallback((currentTimer: number, isRunning: boolean) => {
    return recoveryUtil.current.isRecoveryNeeded(currentTimer, isRunning);
  }, []);

  return {
    checkTimerHealth,
    attemptRecovery,
    resetRecovery,
    getStats,
    forceUpdateState,
    isRecoveryNeeded
  };
};