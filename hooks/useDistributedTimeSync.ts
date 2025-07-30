// hooks/useDistributedTimeSync.ts - FIXED VERSION WITH PROPER TIMEZONE HANDLING
import { useState, useEffect, useRef, useCallback } from 'react';

interface TimeSyncConfig {
  minInterval: number;    
  maxInterval: number;    
  focusThreshold: number; 
  jumpThreshold: number;  
  maxRetries: number;     
  samplesCount: number;   
}

interface TimeSyncState {
  timeOffset: number;
  networkLatency: number;
  timezoneOffset: number;
  lastSyncTime: number;
  isOnline: boolean;
  syncCount: number;
  nextSyncTime: number;
  reliability: number;
  offsetStdDev: number;
}

interface TimeSyncSample {
  clientRequestTime: number;
  clientReceiveTime: number;
  serverRequestTime: number;
  serverResponseTime: number;
  serverTime: number;
  roundTripTime: number;
  estimatedLatency: number;
  timeOffset: number;
  utcOffset: number;
}

export const useDistributedTimeSync = (config?: Partial<TimeSyncConfig>) => {
  const defaultConfig: TimeSyncConfig = {
    minInterval: 2 * 60 * 1000,   
    maxInterval: 5 * 60 * 1000,   
    focusThreshold: 1 * 60 * 1000, 
    jumpThreshold: 60 * 1000,      
    maxRetries: 3,
    samplesCount: 5
  };

  const finalConfig = { ...defaultConfig, ...config };
  
  const [state, setState] = useState<TimeSyncState>({
    timeOffset: 0,
    networkLatency: 0,
    timezoneOffset: 0, // FIXED: Initialize to 0, don't auto-calculate
    lastSyncTime: 0,
    isOnline: navigator.onLine,
    syncCount: 0,
    nextSyncTime: 0,
    reliability: 0,
    offsetStdDev: 0
  });

  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const syncInProgressRef = useRef(false);
  const retryCountRef = useRef(0);
  const samplesHistoryRef = useRef<TimeSyncSample[]>([]);

  const generateRandomInterval = useCallback(() => {
    const { minInterval, maxInterval } = finalConfig;
    return Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
  }, [finalConfig]);

  const analyzeSamples = useCallback((samples: TimeSyncSample[]) => {
    if (samples.length === 0) return null;

    const offsets = samples.map(s => s.timeOffset);
    const latencies = samples.map(s => s.estimatedLatency);
    
    const offsetMean = offsets.reduce((a, b) => a + b, 0) / offsets.length;
    const latencyMean = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    
    const offsetStdDev = Math.sqrt(
      offsets.reduce((sq, n) => sq + Math.pow(n - offsetMean, 2), 0) / offsets.length
    );
    
    const latencyStdDev = Math.sqrt(
      latencies.reduce((sq, n) => sq + Math.pow(n - latencyMean, 2), 0) / latencies.length
    );

    const filteredSamples = samples.filter(sample => 
      Math.abs(sample.timeOffset - offsetMean) <= 2 * offsetStdDev &&
      Math.abs(sample.estimatedLatency - latencyMean) <= 2 * latencyStdDev
    );

    if (filteredSamples.length === 0) return null;

    const filteredOffsets = filteredSamples.map(s => s.timeOffset);
    const filteredLatencies = filteredSamples.map(s => s.estimatedLatency);
    
    const finalOffset = filteredOffsets.reduce((a, b) => a + b, 0) / filteredOffsets.length;
    const finalLatency = filteredLatencies.reduce((a, b) => a + b, 0) / filteredLatencies.length;
    const reliability = filteredSamples.length / samples.length;
    
    const finalOffsetStdDev = Math.sqrt(
      filteredOffsets.reduce((sq, n) => sq + Math.pow(n - finalOffset, 2), 0) / filteredOffsets.length
    );

    return {
      timeOffset: finalOffset,
      networkLatency: finalLatency,
      reliability: reliability,
      offsetStdDev: finalOffsetStdDev,
      samplesUsed: filteredSamples.length,
      totalSamples: samples.length,
      filteredSamples
    };
  }, []);

  // CRITICAL FIX: Enhanced sync function with proper timezone handling
  const syncTime = useCallback(async (reason: string = 'manual') => {
    if (syncInProgressRef.current) {
      console.log('Sync already in progress, skipping...');
      return state.timeOffset;
    }

    syncInProgressRef.current = true;
    
    try {
      console.log(`🔄 Starting FIXED time sync (${reason}) with proper timezone handling...`);
      
      const samples: TimeSyncSample[] = [];
      
      for (let i = 0; i < finalConfig.samplesCount; i++) {
        try {
          const clientRequestTime = Date.now(); // Client UTC timestamp
          
          const response = await fetch('/api/time', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'x-request-id': `${clientRequestTime}-${i}`,
              'x-client-time': clientRequestTime.toString()
            }
          });

          const clientReceiveTime = Date.now(); // Client UTC timestamp

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || 'Server returned error');
          }

          // CRITICAL FIX: Both serverTime and clientTime are UTC timestamps
          // No timezone conversion needed for the main sync logic
          const roundTripTime = clientReceiveTime - clientRequestTime;
          const estimatedLatency = roundTripTime / 2;
          
          // FIXED: Calculate pure network offset without timezone confusion
          // Both times are UTC, so this is pure network + clock drift
          const estimatedServerRequestTime = data.serverTime + estimatedLatency;
          const networkClockOffset = estimatedServerRequestTime - clientRequestTime;

          samples.push({
            clientRequestTime,
            clientReceiveTime,
            serverRequestTime: data.serverTime,
            serverResponseTime: data.serverTime,
            serverTime: data.serverTime, // Always UTC
            roundTripTime,
            estimatedLatency,
            timeOffset: networkClockOffset, // Pure network + clock offset
            utcOffset: data.utcOffset || 0 // Server's timezone info (for reference only)
          });

          if (i < finalConfig.samplesCount - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

        } catch (sampleError) {
          console.warn(`Sample ${i + 1} failed:`, sampleError);
        }
      }

      if (samples.length === 0) {
        throw new Error('All time sync samples failed');
      }

      const analysis = analyzeSamples(samples);
      
      if (!analysis) {
        throw new Error('Statistical analysis failed - all samples were outliers');
      }

      // CRITICAL FIX: Don't add timezone compensation to time offset
      // The timeOffset should only compensate for network latency and clock drift
      // Timezone differences should be handled separately if needed
      
      samplesHistoryRef.current = [...samplesHistoryRef.current, ...analysis.filteredSamples].slice(-20);

      const now = Date.now();
      const nextInterval = generateRandomInterval();
      const nextSyncTime = now + nextInterval;

      setState(prev => ({
        ...prev,
        timeOffset: analysis.timeOffset, // Pure network + clock offset
        networkLatency: analysis.networkLatency,
        timezoneOffset: 0, // FIXED: Set to 0 - no timezone compensation in sync
        lastSyncTime: now,
        syncCount: prev.syncCount + 1,
        nextSyncTime: nextSyncTime,
        reliability: analysis.reliability,
        offsetStdDev: analysis.offsetStdDev
      }));

      retryCountRef.current = 0;

      console.log(`✅ FIXED time sync successful (${reason}):`, {
        timeOffset: Math.round(analysis.timeOffset) + 'ms (network + clock drift only)',
        networkLatency: Math.round(analysis.networkLatency) + 'ms',
        timezoneOffset: '0ms (no timezone compensation)',
        reliability: Math.round(analysis.reliability * 100) + '%',
        offsetStdDev: Math.round(analysis.offsetStdDev) + 'ms',
        samplesUsed: `${analysis.samplesUsed}/${analysis.totalSamples}`,
        syncCount: state.syncCount + 1,
        nextSyncIn: Math.round(nextInterval / 1000 / 60) + ' minutes'
      });

      return analysis.timeOffset;

    } catch (error) {
      console.error('Enhanced time sync failed:', error);
      
      retryCountRef.current++;
      
      if (retryCountRef.current < finalConfig.maxRetries) {
        console.log(`Retrying sync in 30 seconds... (${retryCountRef.current}/${finalConfig.maxRetries})`);
        
        setTimeout(() => {
          syncTime(`retry-${retryCountRef.current}`);
        }, 30000);
      } else {
        console.warn('Max retries reached, using existing offset');
      }

      return state.timeOffset;

    } finally {
      syncInProgressRef.current = false;
    }
  }, [finalConfig, generateRandomInterval, analyzeSamples, state.timeOffset, state.syncCount]);

  const scheduleNextSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    const now = Date.now();
    const timeUntilNextSync = Math.max(0, state.nextSyncTime - now);

    if (timeUntilNextSync > 0) {
      syncTimeoutRef.current = setTimeout(() => {
        syncTime('scheduled');
        scheduleNextSync();
      }, timeUntilNextSync);

      console.log(`📅 Next FIXED sync scheduled in ${Math.round(timeUntilNextSync / 1000 / 60)} minutes`);
    }
  }, [state.nextSyncTime, syncTime]);

  // CRITICAL FIX: getServerTime should return synchronized UTC time
  const getServerTime = useCallback(() => {
    // Return client time + network/clock offset (both in UTC)
    // Do NOT subtract timezone offset here
    return Date.now() + state.timeOffset;
  }, [state.timeOffset]);

  const detectTimeJump = useCallback((currentTime: number, lastTime: number) => {
    if (lastTime === 0) return false;
    
    const deltaTime = currentTime - lastTime;
    const expectedDelta = 1000;
    const actualDeviation = Math.abs(deltaTime - expectedDelta);
    
    const baseThreshold = finalConfig.jumpThreshold;
    const networkTolerance = Math.max(5000, state.networkLatency * 3);
    const reliabilityFactor = Math.max(0.5, state.reliability);
    const finalThreshold = Math.max(baseThreshold, networkTolerance / reliabilityFactor);
    
    const isJump = actualDeviation > finalThreshold;
    
    if (isJump) {
      const severity = actualDeviation > finalThreshold * 3 ? 'EXTREME' : 'MODERATE';
      
      console.warn(`🚨 ${severity} time jump detected (FIXED):`, {
        deviation: Math.round(actualDeviation) + 'ms',
        threshold: Math.round(finalThreshold) + 'ms',
        networkLatency: Math.round(state.networkLatency) + 'ms',
        reliability: Math.round(state.reliability * 100) + '%',
        severity,
        timezoneImpact: 'None (timezone compensation disabled)'
      });
      
      if (severity === 'EXTREME') {
        console.log('🔄 Extreme jump detected, forcing immediate sync...');
        setTimeout(() => forceSyncNow(), 1000);
      }
    }
    
    return isJump;
  }, [finalConfig.jumpThreshold, state.networkLatency, state.reliability]);

  const forceSyncNow = useCallback(() => {
    console.log('🔄 Force sync triggered (FIXED version)');
    return syncTime('force');
  }, [syncTime]);

  // Initial sync on mount
  useEffect(() => {
    console.log('🚀 Initializing FIXED distributed time sync...', {
      syncInterval: `${Math.round(finalConfig.minInterval / 1000 / 60)}-${Math.round(finalConfig.maxInterval / 1000 / 60)} minutes`,
      jumpThreshold: `${finalConfig.jumpThreshold / 1000} seconds`,
      samples: finalConfig.samplesCount,
      features: ['Pure UTC Sync', 'No Timezone Compensation', 'Network Latency Only', 'Statistical Analysis']
    });
    syncTime('initial');
  }, []);

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

  useEffect(() => {
    const handleFocus = () => {
      if (!state.isOnline) return;
      
      const timeSinceLastSync = Date.now() - state.lastSyncTime;
      
      const shouldSync = timeSinceLastSync > finalConfig.focusThreshold || 
                        state.reliability < 0.7 || 
                        state.offsetStdDev > 1000;
      
      if (shouldSync) {
        console.log('🎯 Tab focused - FIXED sync conditions met:', {
          timeSinceLastSync: Math.round(timeSinceLastSync / 1000 / 60) + ' min',
          reliability: Math.round(state.reliability * 100) + '%',
          offsetStdDev: Math.round(state.offsetStdDev) + 'ms'
        });
        syncTime('focus');
      } else {
        console.log('🎯 Tab focused - FIXED sync not needed (conditions good)');
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.lastSyncTime, state.isOnline, state.reliability, state.offsetStdDev, finalConfig.focusThreshold, syncTime]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network restored - performing FIXED sync');
      setState(prev => ({ ...prev, isOnline: true }));
      syncTime('online');
    };

    const handleOffline = () => {
      console.log('❌ Network lost - pausing FIXED sync');
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

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      console.log('🧹 FIXED time sync cleanup completed');
    };
  }, []);

  return {
    // State (FIXED)
    timeOffset: state.timeOffset,
    networkLatency: state.networkLatency,
    timezoneOffset: state.timezoneOffset, // Always 0 in fixed version
    lastSyncTime: state.lastSyncTime,
    isOnline: state.isOnline,
    syncCount: state.syncCount,
    nextSyncTime: state.nextSyncTime,
    reliability: state.reliability,
    offsetStdDev: state.offsetStdDev,
    
    // Functions (FIXED)
    getServerTime, // Returns UTC time + network offset only
    syncTime,
    forceSyncNow,
    detectTimeJump,
    
    // Utils (FIXED)
    getNextSyncIn: () => Math.max(0, state.nextSyncTime - Date.now()),
    getSyncStats: () => ({
      totalSyncs: state.syncCount,
      lastSyncAgo: Date.now() - state.lastSyncTime,
      nextSyncIn: state.nextSyncTime - Date.now(),
      currentOffset: state.timeOffset,
      networkLatency: state.networkLatency,
      timezoneOffset: state.timezoneOffset,
      reliability: state.reliability,
      offsetStdDev: state.offsetStdDev,
      syncFrequency: `${Math.round(finalConfig.minInterval / 1000 / 60)}-${Math.round(finalConfig.maxInterval / 1000 / 60)} min`,
      samplesHistory: samplesHistoryRef.current.length,
      qualityScore: state.reliability > 0.8 && state.offsetStdDev < 500 ? 'EXCELLENT' :
                   state.reliability > 0.6 && state.offsetStdDev < 1000 ? 'GOOD' :
                   state.reliability > 0.4 ? 'FAIR' : 'POOR',
      syncMode: 'FIXED_UTC_ONLY'
    }),
    
    config: finalConfig,
    
    getDiagnostics: () => ({
      samplesHistory: samplesHistoryRef.current,
      currentThreshold: Math.max(finalConfig.jumpThreshold, state.networkLatency * 3),
      adaptiveFeatures: {
        networkCompensation: state.networkLatency > 0,
        timezoneCompensation: false, // DISABLED in fixed version
        reliabilityTracking: state.reliability > 0,
        statisticalAnalysis: true,
        pureUtcSync: true // NEW: Indicates this is the fixed version
      }
    })
  };
};