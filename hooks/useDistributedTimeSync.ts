// ===================================
// /hooks/useDistributedTimeSync.ts - ENHANCED FINAL VERSION
// ===================================

import { useState, useEffect, useRef, useCallback } from 'react';

interface TimeSyncConfig {
  minInterval: number;    // Minimum interval (default: 2 minutes)
  maxInterval: number;    // Maximum interval (default: 5 minutes) 
  focusThreshold: number; // Re-sync threshold when tab focused (default: 1 minute)
  jumpThreshold: number;  // Time jump detection threshold (default: 60 seconds - more lenient)
  maxRetries: number;     // Max retry attempts (default: 3)
  samplesCount: number;   // Number of samples for statistical analysis (default: 5)
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
    minInterval: 2 * 60 * 1000,   // 2 minutes
    maxInterval: 5 * 60 * 1000,   // 5 minutes
    focusThreshold: 1 * 60 * 1000, // 1 minute
    jumpThreshold: 60 * 1000,      // 60 seconds - much more lenient
    maxRetries: 3,
    samplesCount: 5
  };

  const finalConfig = { ...defaultConfig, ...config };
  
  const [state, setState] = useState<TimeSyncState>({
    timeOffset: 0,
    networkLatency: 0,
    timezoneOffset: 0,
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

  // Generate random interval between min and max
  const generateRandomInterval = useCallback(() => {
    const { minInterval, maxInterval } = finalConfig;
    return Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
  }, [finalConfig]);

  // Statistical analysis helper
  const analyzesamples = useCallback((samples: TimeSyncSample[]) => {
    if (samples.length === 0) return null;

    const offsets = samples.map(s => s.timeOffset);
    const latencies = samples.map(s => s.estimatedLatency);
    
    // Calculate means
    const offsetMean = offsets.reduce((a, b) => a + b, 0) / offsets.length;
    const latencyMean = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    
    // Calculate standard deviations
    const offsetStdDev = Math.sqrt(
      offsets.reduce((sq, n) => sq + Math.pow(n - offsetMean, 2), 0) / offsets.length
    );
    
    const latencyStdDev = Math.sqrt(
      latencies.reduce((sq, n) => sq + Math.pow(n - latencyMean, 2), 0) / latencies.length
    );

    // Remove outliers (beyond 2 standard deviations)
    const filteredSamples = samples.filter(sample => 
      Math.abs(sample.timeOffset - offsetMean) <= 2 * offsetStdDev &&
      Math.abs(sample.estimatedLatency - latencyMean) <= 2 * latencyStdDev
    );

    if (filteredSamples.length === 0) return null;

    // Recalculate with filtered samples
    const filteredOffsets = filteredSamples.map(s => s.timeOffset);
    const filteredLatencies = filteredSamples.map(s => s.estimatedLatency);
    
    const finalOffset = filteredOffsets.reduce((a, b) => a + b, 0) / filteredOffsets.length;
    const finalLatency = filteredLatencies.reduce((a, b) => a + b, 0) / filteredLatencies.length;
    const reliability = filteredSamples.length / samples.length;
    
    // Calculate final standard deviation
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

  // Enhanced sync function with statistical analysis
  const syncTime = useCallback(async (reason: string = 'manual') => {
    if (syncInProgressRef.current) {
      console.log('Sync already in progress, skipping...');
      return state.timeOffset;
    }

    syncInProgressRef.current = true;
    
    try {
      console.log(`🔄 Starting enhanced time sync (${reason}) with ${finalConfig.samplesCount} samples...`);
      
      const samples: TimeSyncSample[] = [];
      
      // Collect multiple samples for statistical analysis
      for (let i = 0; i < finalConfig.samplesCount; i++) {
        try {
          const clientRequestTime = Date.now();
          
          const response = await fetch('/api/time', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'x-request-id': `${clientRequestTime}-${i}`,
              'x-client-time': clientRequestTime.toString()
            }
          });

          const clientReceiveTime = Date.now();

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || 'Server returned error');
          }

          // Calculate network timing
          const roundTripTime = clientReceiveTime - clientRequestTime;
          const estimatedLatency = roundTripTime / 2;
          
          // Calculate time offset (compensating for network delay)
          const estimatedServerRequestTime = data.serverTime + estimatedLatency;
          const timeOffset = estimatedServerRequestTime - clientRequestTime;

          samples.push({
            clientRequestTime,
            clientReceiveTime,
            serverRequestTime: data.serverTime,
            serverResponseTime: data.serverTime, // Assuming minimal processing time
            serverTime: data.serverTime,
            roundTripTime,
            estimatedLatency,
            timeOffset,
            utcOffset: data.utcOffset || 0
          });

          // Small delay between samples to avoid overwhelming server
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

      // Analyze samples statistically
      const analysis = analyzesamples(samples);
      
      if (!analysis) {
        throw new Error('Statistical analysis failed - all samples were outliers');
      }

      // Calculate timezone offset
      const serverUtcOffset = samples[0].utcOffset;
      const clientUtcOffset = new Date().getTimezoneOffset();
      const timezoneOffsetDiff = (serverUtcOffset - clientUtcOffset) * 60 * 1000;

      // Store samples history (keep last 20 samples for trend analysis)
      samplesHistoryRef.current = [...samplesHistoryRef.current, ...analysis.filteredSamples].slice(-20);

      const now = Date.now();
      const nextInterval = generateRandomInterval();
      const nextSyncTime = now + nextInterval;

      setState(prev => ({
        ...prev,
        timeOffset: analysis.timeOffset,
        networkLatency: analysis.networkLatency,
        timezoneOffset: timezoneOffsetDiff,
        lastSyncTime: now,
        syncCount: prev.syncCount + 1,
        nextSyncTime: nextSyncTime,
        reliability: analysis.reliability,
        offsetStdDev: analysis.offsetStdDev
      }));

      retryCountRef.current = 0; // Reset retry counter on success

      console.log(`✅ Enhanced time sync successful (${reason}):`, {
        timeOffset: Math.round(analysis.timeOffset),
        networkLatency: Math.round(analysis.networkLatency),
        timezoneOffset: Math.round(timezoneOffsetDiff),
        reliability: Math.round(analysis.reliability * 100) + '%',
        offsetStdDev: Math.round(analysis.offsetStdDev),
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

      return state.timeOffset; // Return existing offset on failure

    } finally {
      syncInProgressRef.current = false;
    }
  }, [finalConfig, generateRandomInterval, analyzesamples, state.timeOffset, state.syncCount]);

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

      console.log(`📅 Next enhanced sync scheduled in ${Math.round(timeUntilNextSync / 1000 / 60)} minutes`);
    }
  }, [state.nextSyncTime, syncTime]);

  // Get server-adjusted time with all compensations
  const getServerTime = useCallback(() => {
    return Date.now() + state.timeOffset - state.timezoneOffset;
  }, [state.timeOffset, state.timezoneOffset]);

  // Enhanced time jump detection with adaptive thresholds
  const detectTimeJump = useCallback((currentTime: number, lastTime: number) => {
    if (lastTime === 0) return false;
    
    const deltaTime = currentTime - lastTime;
    const expectedDelta = 1000; // 1 second expected
    const actualDeviation = Math.abs(deltaTime - expectedDelta);
    
    // Adaptive threshold based on network conditions and reliability
    const baseThreshold = finalConfig.jumpThreshold;
    const networkTolerance = Math.max(5000, state.networkLatency * 3); // At least 5s or 3x latency
    const reliabilityFactor = Math.max(0.5, state.reliability); // Lower reliability = higher tolerance
    const finalThreshold = Math.max(baseThreshold, networkTolerance / reliabilityFactor);
    
    const isJump = actualDeviation > finalThreshold;
    
    if (isJump) {
      const severity = actualDeviation > finalThreshold * 3 ? 'EXTREME' : 'MODERATE';
      
      console.warn(`🚨 ${severity} time jump detected:`, {
        deviation: Math.round(actualDeviation),
        threshold: Math.round(finalThreshold),
        networkLatency: Math.round(state.networkLatency),
        reliability: Math.round(state.reliability * 100) + '%',
        severity
      });
      
      // Only force sync on extreme jumps
      if (severity === 'EXTREME') {
        console.log('🔄 Extreme jump detected, forcing immediate sync...');
        setTimeout(() => forceSyncNow(), 1000);
      }
    }
    
    return isJump;
  }, [finalConfig.jumpThreshold, state.networkLatency, state.reliability]);

  // Force immediate sync (for time jump detection)
  const forceSyncNow = useCallback(() => {
    console.log('🔄 Force sync triggered with enhanced analysis');
    return syncTime('force');
  }, [syncTime]);

  // Initial sync on mount
  useEffect(() => {
    console.log('🚀 Initializing enhanced distributed time sync...', {
      syncInterval: `${Math.round(finalConfig.minInterval / 1000 / 60)}-${Math.round(finalConfig.maxInterval / 1000 / 60)} minutes`,
      jumpThreshold: `${finalConfig.jumpThreshold / 1000} seconds`,
      samples: finalConfig.samplesCount,
      features: ['Statistical Analysis', 'Outlier Removal', 'Adaptive Thresholds', 'Timezone Compensation']
    });
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

  // Handle tab focus events - more intelligent sync
  useEffect(() => {
    const handleFocus = () => {
      if (!state.isOnline) return;
      
      const timeSinceLastSync = Date.now() - state.lastSyncTime;
      
      // More intelligent focus sync based on reliability and time elapsed
      const shouldSync = timeSinceLastSync > finalConfig.focusThreshold || 
                        state.reliability < 0.7 || 
                        state.offsetStdDev > 1000;
      
      if (shouldSync) {
        console.log('🎯 Tab focused - conditions met for sync:', {
          timeSinceLastSync: Math.round(timeSinceLastSync / 1000 / 60) + ' min',
          reliability: Math.round(state.reliability * 100) + '%',
          offsetStdDev: Math.round(state.offsetStdDev)
        });
        syncTime('focus');
      } else {
        console.log('🎯 Tab focused - sync not needed (conditions good)');
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

  // Handle network status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network restored - performing enhanced sync');
      setState(prev => ({ ...prev, isOnline: true }));
      syncTime('online');
    };

    const handleOffline = () => {
      console.log('❌ Network lost - pausing enhanced sync');
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
      console.log('🧹 Enhanced time sync cleanup completed');
    };
  }, []);

  return {
    // Enhanced State
    timeOffset: state.timeOffset,
    networkLatency: state.networkLatency,
    timezoneOffset: state.timezoneOffset,
    lastSyncTime: state.lastSyncTime,
    isOnline: state.isOnline,
    syncCount: state.syncCount,
    nextSyncTime: state.nextSyncTime,
    reliability: state.reliability,
    offsetStdDev: state.offsetStdDev,
    
    // Functions
    getServerTime,
    syncTime,
    forceSyncNow,
    detectTimeJump,
    
    // Enhanced Utils
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
                   state.reliability > 0.4 ? 'FAIR' : 'POOR'
    }),
    
    // Configuration info
    config: finalConfig,
    
    // Advanced diagnostics
    getDiagnostics: () => ({
      samplesHistory: samplesHistoryRef.current,
      currentThreshold: Math.max(finalConfig.jumpThreshold, state.networkLatency * 3),
      adaptiveFeatures: {
        networkCompensation: state.networkLatency > 0,
        timezoneCompensation: state.timezoneOffset !== 0,
        reliabilityTracking: state.reliability > 0,
        statisticalAnalysis: true
      }
    })
  };
};