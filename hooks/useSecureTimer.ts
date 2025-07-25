// hooks/useSecureTimer.ts - ENHANCED FINAL VERSION
import { useState, useEffect, useRef, useCallback } from 'react';
import CryptoJS from 'crypto-js';

interface TimerState {
  timeLeft: number;
  elapsed: number;
  isRunning: boolean;
  isValid: boolean;
  lastUpdate: number;
}

interface BackupTimers {
  purchase: number;
  userActivity: number;
  inventory: number;
}

interface SecurityValidation {
  consistent: boolean;
  noTimeJump: boolean;
  backupValid: boolean;
  checksumValid: boolean;
  heartbeatActive: boolean;
  networkQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

interface UseSecureTimerOptions {
  examId: string;
  onTimeout: () => void;
  onSecurityBreach: (reason: string, details?: any) => void;
  onValidationFailure: (reason: string) => void;
}

interface NetworkInfo {
  latency: number;
  timezoneOffset: number;
  reliability: number;
  offsetStdDev: number;
}

export const useSecureTimer = ({
  examId,
  onTimeout,
  onSecurityBreach,
  onValidationFailure
}: UseSecureTimerOptions) => {
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: 0,
    elapsed: 0,
    isRunning: false,
    isValid: true,
    lastUpdate: Date.now()
  });
  
  const [backupTimers, setBackupTimers] = useState<BackupTimers>({
    purchase: 0,
    userActivity: 0,
    inventory: 0
  });
  
  const [securityValidation, setSecurityValidation] = useState<SecurityValidation>({
    consistent: true,
    noTimeJump: true,
    backupValid: true,
    checksumValid: true,
    heartbeatActive: true,
    networkQuality: 'GOOD'
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    latency: 0,
    timezoneOffset: 0,
    reliability: 1.0,
    offsetStdDev: 0
  });
  
  const workerRef = useRef<Worker | null>(null);
  const sessionKeyRef = useRef<string>('');
  const lastHeartbeatRef = useRef<number>(Date.now());
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storageKeyRef = useRef<string>('');
  const securityAlertsRef = useRef<string[]>([]);
  
  // Generate secure session key
  const generateSessionKey = useCallback(() => {
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    const examHash = CryptoJS.MD5(examId).toString().substring(0, 8);
    
    return `${examHash}${timestamp}${random1}${random2}`;
  }, [examId]);
  
  // Initialize Web Worker
  const initializeWorker = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    try {
      workerRef.current = new Worker('/secure-exam-timer.js');
      sessionKeyRef.current = generateSessionKey();
      storageKeyRef.current = `exam_timer_${examId}_${sessionKeyRef.current.substring(0, 8)}`;
      
      console.log('🚀 Enhanced Web Worker timer initialized with advanced security');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize enhanced worker:', error);
      setError('Enhanced worker initialization failed');
      return false;
    }
  }, [examId, generateSessionKey]);

  // Update worker with network information for adaptive security
  const updateWorkerNetworkInfo = useCallback((networkData: NetworkInfo) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        action: 'update_network_info',
        payload: {
          latency: networkData.latency,
          timezoneOffset: networkData.timezoneOffset,
          reliability: networkData.reliability,
          offsetStdDev: networkData.offsetStdDev
        }
      });
      
      console.log('📊 Worker updated with network info:', {
        latency: Math.round(networkData.latency) + 'ms',
        timezoneOffset: Math.round(networkData.timezoneOffset / 1000 / 60) + 'min',
        reliability: Math.round(networkData.reliability * 100) + '%',
        tolerance: Math.round(Math.max(5000, networkData.latency * 3)) + 'ms'
      });
    }
  }, []);

  // Enhanced security assessment
  const assessSecurityLevel = useCallback((validation: any) => {
    const alerts = [];
    let riskLevel = 'LOW';

    // Check various security factors
    if (!validation.consistent) {
      alerts.push('Timer consistency issues detected');
      riskLevel = 'MEDIUM';
    }

    if (validation.timeJump && validation.severity === 'EXTREME') {
      alerts.push('Extreme time manipulation detected');
      riskLevel = 'CRITICAL';
    } else if (validation.timeJump) {
      alerts.push('Minor time inconsistency detected');
      if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
    }

    if (!validation.checksumValid) {
      alerts.push('Data integrity check failed');
      riskLevel = 'HIGH';
    }

    if (!validation.backupConsistency) {
      alerts.push('Backup timer validation failed');
      if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
    }

    // Update security alerts history
    securityAlertsRef.current = [...securityAlertsRef.current, ...alerts].slice(-10);

    return { riskLevel, alerts };
  }, []);
  
  // ENHANCED: Complete Worker Message Handler with adaptive security
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.onmessage = (e) => {
        const { type, ...data } = e.data;
        
        switch (type) {
          case 'tick':
            setTimerState(prev => ({
              ...prev,
              timeLeft: data.remaining,
              elapsed: data.elapsed,
              isRunning: data.remaining > 0,
              lastUpdate: data.timestamp
            }));
            
            setBackupTimers(data.backupTimers || { purchase: 0, userActivity: 0, inventory: 0 });
            
            if (data.integrity) {
              setSecurityValidation(prev => ({
                ...prev,
                consistent: data.integrity.consistent,
                noTimeJump: data.integrity.noTimeJump,
                backupValid: data.integrity.backupValid
              }));
            }
            break;
            
          case 'timeout':
            // Only auto-submit on legitimate timeout
            console.log('🚨 Timer expired (legitimate):', data.reason);
            setTimerState(prev => ({
              ...prev,
              timeLeft: 0,
              isRunning: false
            }));
            onTimeout();
            break;
            
          case 'store':
            // Store encrypted timer data
            try {
              localStorage.setItem(storageKeyRef.current, JSON.stringify(data.data));
              console.log('✅ Enhanced timer data stored securely');
            } catch (error) {
              console.error('❌ Failed to store enhanced timer data:', error);
              setError('Enhanced storage failed');
            }
            break;
            
          case 'restored':
            console.log('✅ Enhanced timer restored:', data);
            setTimerState(prev => ({
              ...prev,
              timeLeft: data.remaining,
              elapsed: data.elapsed,
              isRunning: true,
              isValid: data.integrity === 'verified'
            }));
            setIsInitialized(true);
            break;
            
          case 'invalid':
            // Don't auto-submit on validation failures, just mark as invalid
            console.warn('⚠️ Enhanced timer validation failed (not auto-submitting):', data.reason);
            setError(`Enhanced timer validation issue: ${data.reason}`);
            setTimerState(prev => ({ ...prev, isValid: false }));
            break;
            
          case 'time_anomaly':
            // NEW: Handle minor time inconsistencies (don't auto-submit)
            console.warn('⚠️ Time anomaly detected (adaptive handling):', data);
            
            const assessment = assessSecurityLevel(data);
            
            if (assessment.riskLevel === 'LOW' || assessment.riskLevel === 'MEDIUM') {
              console.log('📊 Minor anomaly - within adaptive tolerance');
              setSecurityValidation(prev => ({
                ...prev,
                noTimeJump: false,
                networkQuality: networkInfo.reliability > 0.8 ? 'EXCELLENT' :
                               networkInfo.reliability > 0.6 ? 'GOOD' :
                               networkInfo.reliability > 0.4 ? 'FAIR' : 'POOR'
              }));
            } else {
              console.warn('🚨 Significant anomaly detected:', assessment);
            }
            break;
            
          case 'security_breach':
            // Enhanced security breach handling with adaptive response
            const riskAssessment = assessSecurityLevel(data.details || {});
            
            if (data.reason === 'extreme_time_jump' || 
                data.reason === 'checksum_failed_with_timeout' ||
                riskAssessment.riskLevel === 'CRITICAL') {
              console.error('🚨 CRITICAL security breach detected:', {
                reason: data.reason,
                riskLevel: riskAssessment.riskLevel,
                alerts: riskAssessment.alerts,
                details: data.details
              });
              onSecurityBreach(data.reason, { ...data.details, riskAssessment });
            } else {
              console.warn('⚠️ Security warning (adaptive tolerance applied):', {
                reason: data.reason,
                riskLevel: riskAssessment.riskLevel,
                networkQuality: securityValidation.networkQuality,
                tolerance: `${Math.round(Math.max(5000, networkInfo.latency * 3))}ms`
              });
            }
            break;
            
          case 'heartbeat_request':
            // Respond to worker heartbeat with network quality info
            lastHeartbeatRef.current = Date.now();
            workerRef.current?.postMessage({
              action: 'heartbeat_response',
              payload: { 
                timestamp: data.timestamp,
                networkQuality: securityValidation.networkQuality,
                reliability: networkInfo.reliability
              }
            });
            
            setSecurityValidation(prev => ({
              ...prev,
              heartbeatActive: true
            }));
            break;
            
          case 'main_thread_unresponsive':
            // Enhanced main thread monitoring with adaptive thresholds
            const responseTime = Date.now() - lastHeartbeatRef.current;
            const adaptiveThreshold = Math.max(15000, networkInfo.latency * 10); // Adaptive based on network
            
            if (responseTime > adaptiveThreshold) {
              console.warn('⚠️ Main thread unresponsive (adaptive threshold):', {
                responseTime: Math.round(responseTime),
                threshold: Math.round(adaptiveThreshold),
                networkLatency: Math.round(networkInfo.latency)
              });
            }
            
            setSecurityValidation(prev => ({
              ...prev,
              heartbeatActive: false
            }));
            break;
            
          case 'validation_result':
            // Enhanced validation with adaptive security assessment
            const validationAssessment = assessSecurityLevel(data.validation);
            
            setSecurityValidation(prev => ({
              ...prev,
              consistent: data.validation.backupConsistency,
              noTimeJump: !data.validation.timeJump || validationAssessment.riskLevel === 'LOW',
              backupValid: data.validation.backupConsistency,
              checksumValid: data.validation.checksumValid,
              heartbeatActive: Date.now() - lastHeartbeatRef.current < Math.max(15000, networkInfo.latency * 10),
              networkQuality: networkInfo.reliability > 0.8 ? 'EXCELLENT' :
                             networkInfo.reliability > 0.6 ? 'GOOD' :
                             networkInfo.reliability > 0.4 ? 'FAIR' : 'POOR'
            }));
            
            // Only log significant validation issues
            if (validationAssessment.riskLevel === 'HIGH' || validationAssessment.riskLevel === 'CRITICAL') {
              console.warn('🚨 Significant validation issues detected:', {
                riskLevel: validationAssessment.riskLevel,
                alerts: validationAssessment.alerts,
                validation: data.validation,
                networkContext: {
                  latency: Math.round(networkInfo.latency),
                  reliability: Math.round(networkInfo.reliability * 100) + '%',
                  adaptiveThreshold: Math.round(Math.max(60000, networkInfo.latency * 3))
                }
              });
            } else if (validationAssessment.alerts.length > 0) {
              console.log('📊 Minor validation alerts (within tolerance):', validationAssessment.alerts);
            }
            break;
            
          case 'network_info_updated':
            console.log('📊 Worker network info update confirmed:', data);
            break;
            
          case 'unknown_action':
            console.warn('⚠️ Unknown worker action received:', data.action);
            break;
            
          default:
            console.warn('⚠️ Unknown enhanced worker message type:', type, data);
            break;
        }
      };
      
      workerRef.current.onerror = (error) => {
        console.error('❌ Enhanced worker error:', error);
        setError('Enhanced worker error');
        
        // Assess if this is a critical error that should trigger auto-submit
        const isCriticalError = error.message?.includes('security') || 
                               error.message?.includes('corruption') ||
                               error.message?.includes('manipulation');
        
        if (isCriticalError) {
          console.error('🚨 Critical worker error detected - potential security issue');
          onSecurityBreach('critical_worker_error', { error: error.message });
        }
      };
    }
  }, [examId, onTimeout, onSecurityBreach, onValidationFailure, assessSecurityLevel, networkInfo, securityValidation.networkQuality]);
  
  // Start timer with enhanced initialization
  const startTimer = useCallback((durationInSeconds: number) => {
    if (!workerRef.current) {
      console.error('❌ Enhanced worker not initialized');
      return false;
    }
    
    console.log(`🚀 Starting enhanced secure timer: ${durationInSeconds} seconds`);
    
    workerRef.current.postMessage({
      action: 'start',
      payload: {
        duration: durationInSeconds,
        sessionKey: sessionKeyRef.current,
        networkInfo: networkInfo,
        enhancedSecurity: true
      }
    });
    
    setTimerState(prev => ({
      ...prev,
      timeLeft: durationInSeconds,
      elapsed: 0,
      isRunning: true,
      isValid: true
    }));
    
    return true;
  }, [networkInfo]);
  
  // Attempt to restore timer from storage with enhanced validation
  const restoreTimer = useCallback(() => {
    if (!workerRef.current) return false;
    
    try {
      const storedData = localStorage.getItem(storageKeyRef.current);
      if (!storedData) {
        console.log('ℹ️ No stored enhanced timer data found');
        return false;
      }
      
      const parsedData = JSON.parse(storedData);
      console.log('🔄 Attempting to restore enhanced timer from storage');
      
      workerRef.current.postMessage({
        action: 'restore',
        payload: {
          stored: parsedData,
          sessionKey: sessionKeyRef.current,
          networkInfo: networkInfo,
          enhancedValidation: true
        }
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to restore enhanced timer:', error);
      setError('Enhanced timer restoration failed');
      return false;
    }
  }, [networkInfo]);
  
  // Stop timer
  const stopTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ action: 'stop' });
      setTimerState(prev => ({ ...prev, isRunning: false }));
      console.log('⏹️ Enhanced timer stopped');
    }
  }, []);
  
  // Get backup timer values for context validation with enhanced metrics
  const getBackupTimerValues = useCallback(() => {
    return {
      purchaseTimer: backupTimers.purchase,
      userActivityTimer: backupTimers.userActivity,
      inventoryTimer: backupTimers.inventory,
      mainTimer: timerState.timeLeft,
      sessionValid: timerState.isValid && securityValidation.consistent,
      networkQuality: securityValidation.networkQuality,
      reliability: networkInfo.reliability,
      adaptiveThreshold: Math.max(120, networkInfo.latency * 3 / 1000), // in seconds
      securityAlerts: securityAlertsRef.current.slice(-5) // Last 5 alerts
    };
  }, [backupTimers, timerState.timeLeft, timerState.isValid, securityValidation.consistent, securityValidation.networkQuality, networkInfo.reliability]);
  
  // Validate timer integrity manually with enhanced checks
  const validateIntegrity = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ 
        action: 'validate_request',
        payload: {
          networkInfo: networkInfo,
          enhancedChecks: true
        }
      });
      console.log('🔍 Enhanced integrity validation requested');
    }
  }, [networkInfo]);

  // Update network information from time sync
  const updateNetworkInfo = useCallback((newNetworkInfo: Partial<NetworkInfo>) => {
    const updatedInfo = { ...networkInfo, ...newNetworkInfo };
    setNetworkInfo(updatedInfo);
    updateWorkerNetworkInfo(updatedInfo);
    
    console.log('📊 Network info updated:', {
      latency: Math.round(updatedInfo.latency) + 'ms',
      reliability: Math.round(updatedInfo.reliability * 100) + '%',
      timezoneOffset: Math.round(updatedInfo.timezoneOffset / 1000 / 60) + 'min'
    });
  }, [networkInfo, updateWorkerNetworkInfo]);
  
  // Initialize worker on mount
  useEffect(() => {
    const success = initializeWorker();
    if (success) {
      // Try to restore timer first
      const restored = restoreTimer();
      if (restored) {
        console.log('🔄 Enhanced timer restoration attempted');
      }
    }
    
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ action: 'stop' });
        workerRef.current.terminate();
        workerRef.current = null;
      }
      
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
      
      console.log('🧹 Enhanced timer cleanup completed');
    };
  }, [initializeWorker, restoreTimer]);
  
  // Enhanced heartbeat monitoring with adaptive thresholds
  useEffect(() => {
    const checkHeartbeat = () => {
      const timeSinceLastHeartbeat = Date.now() - lastHeartbeatRef.current;
      const adaptiveTimeout = Math.max(15000, networkInfo.latency * 10); // Adaptive based on network
      
      if (timeSinceLastHeartbeat > adaptiveTimeout) {
        console.warn('⚠️ Enhanced worker heartbeat timeout:', {
          timeSinceLastHeartbeat: Math.round(timeSinceLastHeartbeat),
          adaptiveTimeout: Math.round(adaptiveTimeout),
          networkLatency: Math.round(networkInfo.latency),
          reliability: Math.round(networkInfo.reliability * 100) + '%'
        });
        
        setSecurityValidation(prev => ({
          ...prev,
          heartbeatActive: false
        }));
        
        // Only consider this critical if network quality is good but heartbeat fails
        if (networkInfo.reliability > 0.7 && timeSinceLastHeartbeat > adaptiveTimeout * 2) {
          console.error('🚨 Critical heartbeat failure with good network - potential security issue');
        }
      }
    };
    
    const heartbeatCheck = setInterval(checkHeartbeat, 5000);
    
    return () => clearInterval(heartbeatCheck);
  }, [networkInfo]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up storage on component unmount (optional)
      try {
        localStorage.removeItem(storageKeyRef.current);
      } catch (error) {
        console.warn('Failed to cleanup enhanced storage:', error);
      }
    };
  }, []);
  
  return {
    // Enhanced Timer state
    timeLeft: timerState.timeLeft,
    elapsed: timerState.elapsed,
    isRunning: timerState.isRunning,
    isValid: timerState.isValid,
    isInitialized,
    error,
    
    // Backup timers for context validation
    backupTimers,
    
    // Enhanced security validation status
    securityValidation,
    
    // Network information
    networkInfo,
    
    // Control functions
    startTimer,
    stopTimer,
    restoreTimer,
    validateIntegrity,
    getBackupTimerValues,
    updateNetworkInfo,
    
    // Enhanced utility functions
    formatTime: (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    },
    
    getTimeRemaining: () => timerState.timeLeft,
    getElapsedTime: () => timerState.elapsed,
    isExpired: () => timerState.timeLeft <= 0,
    
    // Enhanced diagnostics
    getSecurityDiagnostics: () => ({
      securityAlerts: securityAlertsRef.current,
      networkQuality: securityValidation.networkQuality,
      adaptiveThresholds: {
        timeJump: Math.max(60000, networkInfo.latency * 3),
        heartbeat: Math.max(15000, networkInfo.latency * 10),
        validation: Math.max(120000, networkInfo.latency * 30)
      },
      riskAssessment: {
        current: securityValidation.consistent && securityValidation.checksumValid && 
                securityValidation.heartbeatActive ? 'LOW' : 
                !securityValidation.consistent || !securityValidation.checksumValid ? 'MEDIUM' : 'HIGH',
        factors: {
          timerConsistency: securityValidation.consistent,
          dataIntegrity: securityValidation.checksumValid,
          workerHealth: securityValidation.heartbeatActive,
          networkStability: networkInfo.reliability > 0.6
        }
      }
    }),
    
    // Performance metrics
    getPerformanceMetrics: () => ({
      networkLatency: networkInfo.latency,
      reliability: networkInfo.reliability,
      offsetStdDev: networkInfo.offsetStdDev,
      timezoneCompensation: networkInfo.timezoneOffset,
      qualityScore: networkInfo.reliability > 0.8 && networkInfo.latency < 1000 ? 'EXCELLENT' :
                   networkInfo.reliability > 0.6 && networkInfo.latency < 2000 ? 'GOOD' :
                   networkInfo.reliability > 0.4 ? 'FAIR' : 'POOR'
    })
  };
};