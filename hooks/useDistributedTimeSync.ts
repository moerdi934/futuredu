// ===================================
// /hooks/useDistributedTimeSync.ts
// ===================================

import { useState, useEffect, useRef, useCallback } from 'react';

interface TimeSyncConfig {
  minInterval: number;    // Minimum interval (default: 15 minutes)
  maxInterval: number;    // Maximum interval (default: 20 minutes) 
  focusThreshold: number; // Re-sync threshold when tab focused (default: 5 minutes)
  jumpThreshold: number;  // Time jump detection threshold (default: 10 seconds)
  maxRetries: number;     // Max retry attempts (default: 3)
}

interface TimeSyncState {
  timeOffset: number;
  lastSyncTime: number;
  isOnline: boolean;
  syncCount: number;
  nextSyncTime: number;
}

export const useDistributedTimeSync = (config?: Partial<TimeSyncConfig>) => {
  const defaultConfig: TimeSyncConfig = {
    minInterval: 15 * 60 * 1000,  // 15 minutes
    maxInterval: 20 * 60 * 1000,  // 20 minutes
    focusThreshold: 5 * 60 * 1000, // 5 minutes
    jumpThreshold: 10 * 1000,      // 10 seconds
    maxRetries: 3
  };

  const finalConfig = { ...defaultConfig, ...config };
  
  const [state, setState] = useState<TimeSyncState>({
    timeOffset: 0,
    lastSyncTime: 0,
    isOnline: navigator.onLine,
    syncCount: 0,
    nextSyncTime: 0
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const syncInProgressRef = useRef(false);
  const retryCountRef = useRef(0);

  // Generate random interval between min and max
  const generateRandomInterval = useCallback(() => {
    const { minInterval, maxInterval } = finalConfig;
    return Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
  }, [finalConfig]);

  // Core sync function
  const syncTime = useCallback(async (reason: string = 'manual') => {
    if (syncInProgressRef.current) {
      console.log('Sync already in progress, skipping...');
      return state.timeOffset;
    }

    syncInProgressRef.current = true;
    
    try {
      const startTime = performance.now();
      
      const response = await fetch('/api/time', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const endTime = performance.now();
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Server returned error');
      }

      // Calculate network latency compensation
      const networkLatency = (endTime - startTime) / 2;
      const adjustedServerTime = data.serverTime + networkLatency;
      const newOffset = adjustedServerTime - Date.now();

      const now = Date.now();
      const nextInterval = generateRandomInterval();
      const nextSyncTime = now + nextInterval;

      setState(prev => ({
        ...prev,
        timeOffset: newOffset,
        lastSyncTime: now,
        syncCount: prev.syncCount + 1,
        nextSyncTime: nextSyncTime
      }));

      retryCountRef.current = 0; // Reset retry counter on success

      console.log(`⏰ Time sync successful (${reason}):`, {
        offset: newOffset,
        networkLatency: Math.round(networkLatency),
        syncCount: state.syncCount + 1,
        nextSyncIn: Math.round(nextInterval / 1000 / 60) + ' minutes',
        nextSyncAt: new Date(nextSyncTime).toLocaleTimeString()
      });

      return newOffset;

    } catch (error) {
      console.error('Time sync failed:', error);
      
      retryCountRef.current++;
      
      if (retryCountRef.current < finalConfig.maxRetries) {
        console.log(`Retrying sync in 30 seconds... (${retryCountRef.current}/${finalConfig.maxRetries})`);
        
        setTimeout(() => {
          syncTime(`retry-${retryCountRef.current}`);
        }, 30000);
      }

      return state.timeOffset; // Return existing offset on failure

    } finally {
      syncInProgressRef.current = false;
    }
  }, [finalConfig, generateRandomInterval, state.timeOffset, state.syncCount]);

  // Schedule next sync with random interval
  const scheduleNextSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    const now = Date.now();
    const timeUntilNextSync = Math.max(0, state.nextSyncTime - now);

    if (timeUntilNextSync > 0) {
      syncTimeoutRef.current = setTimeout(() => {
        syncTime('scheduled');
        scheduleNextSync(); // Schedule the next one
      }, timeUntilNextSync);

      console.log(`📅 Next sync scheduled in ${Math.round(timeUntilNextSync / 1000 / 60)} minutes`);
    }
  }, [state.nextSyncTime, syncTime]);

  // Get server-adjusted time
  const getServerTime = useCallback(() => {
    return Date.now() + state.timeOffset;
  }, [state.timeOffset]);

  // Detect time jumps (potential manipulation)
  const detectTimeJump = useCallback((currentTime: number, lastTime: number) => {
    if (lastTime === 0) return false;
    
    const deltaTime = currentTime - lastTime;
    const expectedDelta = 1000; // 1 second expected
    const actualJump = Math.abs(deltaTime - expectedDelta);
    
    return actualJump > finalConfig.jumpThreshold;
  }, [finalConfig.jumpThreshold]);

  // Force immediate sync (for time jump detection)
  const forceSyncNow = useCallback(() => {
    return syncTime('force');
  }, [syncTime]);

  // Initial sync on mount
  useEffect(() => {
    console.log('🚀 Initializing distributed time sync...');
    syncTime('initial');
  }, []);

  // Schedule periodic syncs
  useEffect(() => {
    if (state.nextSyncTime > 0) {
      scheduleNextSync();
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [state.nextSyncTime, scheduleNextSync]);

  // Handle tab focus events
  useEffect(() => {
    const handleFocus = () => {
      if (!state.isOnline) return;
      
      const timeSinceLastSync = Date.now() - state.lastSyncTime;
      
      if (timeSinceLastSync > finalConfig.focusThreshold) {
        console.log('🎯 Tab focused after', Math.round(timeSinceLastSync / 1000 / 60), 'minutes');
        syncTime('focus');
      }
    };

    const handleBlur = () => {
      console.log('👋 Tab lost focus');
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [state.lastSyncTime, state.isOnline, finalConfig.focusThreshold, syncTime]);

  // Handle network status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network restored');
      setState(prev => ({ ...prev, isOnline: true }));
      syncTime('online');
    };

    const handleOffline = () => {
      console.log('❌ Network lost');
      setState(prev => ({ ...prev, isOnline: false }));
      
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      console.log('🧹 Time sync cleanup completed');
    };
  }, []);

  return {
    // State
    timeOffset: state.timeOffset,
    lastSyncTime: state.lastSyncTime,
    isOnline: state.isOnline,
    syncCount: state.syncCount,
    nextSyncTime: state.nextSyncTime,
    
    // Functions
    getServerTime,
    syncTime,
    forceSyncNow,
    detectTimeJump,
    
    // Utils
    getNextSyncIn: () => Math.max(0, state.nextSyncTime - Date.now()),
    getSyncStats: () => ({
      totalSyncs: state.syncCount,
      lastSyncAgo: Date.now() - state.lastSyncTime,
      nextSyncIn: state.nextSyncTime - Date.now(),
      currentOffset: state.timeOffset
    })
  };
};