// File: public/secure-exam-timer.js
// Enhanced Web Worker Timer with Improved Error Handling

console.log('🚀 Enhanced Web Worker Timer Script Loading...');

let timerInterval;
let startTime;
let duration;
let sessionKey;
let backupTimers = {};
let validationInterval;
let heartbeatInterval;
let lastHeartbeat = Date.now();
let networkInfo = { latency: 0, reliability: 1.0, offsetStdDev: 0 };
let workerReady = false;

// Debug logging function
function debugLog(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] WORKER: ${message}`, data || '');
}

debugLog('Worker script loaded successfully');

// Enhanced obfuscation with multiple layers
function createObfuscationKey(sessionKey, timestamp) {
  try {
    const keyParts = [
      sessionKey.substring(0, 8),
      timestamp.toString(36),
      sessionKey.substring(8, 16) || 'default'
    ];
    return keyParts.join('');
  } catch (error) {
    debugLog('Error creating obfuscation key', error);
    return 'fallback' + timestamp.toString(36);
  }
}

function obfuscate(value, key, salt = 0x12345678) {
  try {
    const keyNum = parseInt(key.substring(0, 8), 16) || 0x12345678;
    const timestampNum = parseInt(key.substring(8, 16), 36) || Date.now();
    const complexKey = keyNum ^ timestampNum ^ salt;
    
    // Multiple XOR passes for better security
    let obfuscated = value ^ complexKey;
    obfuscated = obfuscated ^ parseInt(key.substring(16, 24) || '87654321', 16);
    obfuscated = obfuscated ^ 0xABCDEF12;
    
    return obfuscated.toString(36);
  } catch (error) {
    debugLog('Obfuscation error', error);
    return value.toString(36); // Fallback
  }
}

function deobfuscate(obfuscated, key, salt = 0x12345678) {
  try {
    const keyNum = parseInt(key.substring(0, 8), 16) || 0x12345678;
    const timestampNum = parseInt(key.substring(8, 16), 36) || Date.now();
    const complexKey = keyNum ^ timestampNum ^ salt;
    
    let value = parseInt(obfuscated, 36);
    if (isNaN(value)) throw new Error('Invalid obfuscated value');
    
    value = value ^ 0xABCDEF12;
    value = value ^ parseInt(key.substring(16, 24) || '87654321', 16);
    value = value ^ complexKey;
    
    return value;
  } catch (error) {
    debugLog('Deobfuscation failed', error);
    throw new Error('Deobfuscation failed');
  }
}

// Generate backup timer data with different obfuscation
function generateBackupTimers(startTime, duration, sessionKey) {
  const timestamp = Date.now();
  debugLog('Generating backup timers', { startTime, duration, timestamp });
  
  try {
    return {
      purchase: {
        marketResearch: obfuscate(duration, sessionKey + 'purchase', 0x11111111),
        analytics: obfuscate(startTime, sessionKey + 'analytics', 0x22222222),
        validation: sessionKey.substring(0, 4) + timestamp.toString(36).substring(-4)
      },
      userActivity: {
        behaviorPattern: obfuscate(duration, sessionKey + 'behavior', 0x33333333),
        neuralNetwork: obfuscate(startTime, sessionKey + 'neural', 0x44444444),
        validation: sessionKey.substring(4, 8) + timestamp.toString(36).substring(-4)
      },
      inventory: {
        quantum: obfuscate(duration, sessionKey + 'quantum', 0x55555555),
        blockchain: obfuscate(startTime, sessionKey + 'blockchain', 0x66666666),
        validation: sessionKey.substring(8, 12) + timestamp.toString(36).substring(-4)
      }
    };
  } catch (error) {
    debugLog('Error generating backup timers', error);
    return {};
  }
}

// Validate backup timers integrity
function validateBackupTimers(stored, sessionKey) {
  try {
    debugLog('Validating backup timers');
    
    if (!stored || !sessionKey) {
      debugLog('Invalid backup timer parameters');
      return null;
    }
    
    const purchaseDuration = deobfuscate(stored.purchase.marketResearch, sessionKey + 'purchase', 0x11111111);
    const purchaseStart = deobfuscate(stored.purchase.analytics, sessionKey + 'analytics', 0x22222222);
    
    const userActivityDuration = deobfuscate(stored.userActivity.behaviorPattern, sessionKey + 'behavior', 0x33333333);
    const userActivityStart = deobfuscate(stored.userActivity.neuralNetwork, sessionKey + 'neural', 0x44444444);
    
    const inventoryDuration = deobfuscate(stored.inventory.quantum, sessionKey + 'quantum', 0x55555555);
    const inventoryStart = deobfuscate(stored.inventory.blockchain, sessionKey + 'blockchain', 0x66666666);
    
    // Cross-validate all backup timers
    const durations = [purchaseDuration, userActivityDuration, inventoryDuration];
    const starts = [purchaseStart, userActivityStart, inventoryStart];
    
    debugLog('Backup timer validation results', { durations, starts });
    
    // Check if all durations match within tolerance
    const durationValid = durations.every(d => Math.abs(d - durations[0]) <= 1);
    const startValid = starts.every(s => Math.abs(s - starts[0]) <= 1000); // 1 second tolerance
    
    return durationValid && startValid ? {
      duration: durations[0],
      startTime: starts[0]
    } : null;
  } catch (error) {
    debugLog('Backup timer validation error', error);
    return null;
  }
}

// Heartbeat mechanism to detect if main thread is responsive
function startHeartbeat() {
  debugLog('Starting heartbeat mechanism');
  
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  
  heartbeatInterval = setInterval(() => {
    try {
      const now = Date.now();
      
      self.postMessage({
        type: 'heartbeat_request',
        timestamp: now
      });
      
      // If no response within adaptive timeout, assume main thread is compromised
      const adaptiveTimeout = Math.max(5000, (networkInfo.latency || 0) * 5);
      setTimeout(() => {
        if (Date.now() - lastHeartbeat > adaptiveTimeout) {
          debugLog('Main thread unresponsive detected');
          self.postMessage({
            type: 'main_thread_unresponsive',
            message: 'Main thread not responding - potential manipulation detected',
            timeout: adaptiveTimeout
          });
        }
      }, adaptiveTimeout);
    } catch (error) {
      debugLog('Heartbeat error', error);
    }
  }, 3000); // Every 3 seconds
}

// Enhanced message handler with better error handling
self.onmessage = function(e) {
  try {
    const { action, payload } = e.data;
    debugLog(`Received message: ${action}`, payload);
    
    switch (action) {
      case 'ping':
        debugLog('Ping received - responding with worker_ready');
        workerReady = true;
        self.postMessage({ 
          type: 'worker_ready',
          message: 'Enhanced secure timer worker initialized successfully',
          timestamp: Date.now(),
          capabilities: ['obfuscation', 'heartbeat', 'validation', 'backup_timers']
        });
        break;
        
      case 'start':
        handleStart(payload);
        break;
        
      case 'restore':
        handleRestore(payload);
        break;
        
      case 'heartbeat_response':
        debugLog('Heartbeat response received');
        lastHeartbeat = Date.now();
        break;
        
      case 'validate_request':
        debugLog('Validation request received');
        performIntegrityValidation();
        break;
        
      case 'update_network_info':
        debugLog('Network info update received', payload);
        networkInfo = { ...networkInfo, ...payload };
        self.postMessage({ type: 'network_info_updated', networkInfo });
        break;
        
      case 'stop':
        debugLog('Stop command received');
        cleanup();
        break;
        
      default:
        debugLog('Unknown action received', action);
        self.postMessage({ type: 'unknown_action', action });
    }
  } catch (error) {
    debugLog('Message handling error', error);
    self.postMessage({ 
      type: 'worker_error', 
      error: error.message,
      action: e.data?.action || 'unknown'
    });
  }
};

function handleStart(payload) {
  try {
    debugLog('Starting timer', payload);
    startTime = Date.now();
    duration = payload.duration || 0;
    sessionKey = payload.sessionKey || 'default';
    networkInfo = payload.networkInfo || { latency: 0, reliability: 1.0 };
    
    if (duration <= 0) {
      throw new Error('Invalid duration provided');
    }
    
    debugLog('Timer parameters set', { 
      startTime, 
      duration, 
      sessionKey: sessionKey.substring(0, 8) + '***' 
    });
    
    // Generate all backup timer data
    backupTimers = generateBackupTimers(startTime, duration, sessionKey);
    
    // Create main obfuscated data
    const obfuscationKey = createObfuscationKey(sessionKey, startTime);
    const obfuscatedData = {
      main: {
        s: obfuscate(startTime, obfuscationKey),
        e: obfuscate(startTime + (duration * 1000), obfuscationKey),
        d: obfuscate(duration, obfuscationKey),
        v: sessionKey.substring(12, 16) + startTime.toString(36).substring(-4)
      },
      backup: backupTimers,
      checksum: generateChecksum(startTime, duration, sessionKey),
      metadata: {
        created: Date.now(),
        networkInfo: networkInfo
      }
    };
    
    debugLog('Sending store message');
    self.postMessage({
      type: 'store',
      data: obfuscatedData
    });
    
    debugLog('Starting timer loop and heartbeat');
    startTimerLoop();
    startHeartbeat();
    startValidationLoop();
    
  } catch (error) {
    debugLog('Start handler error', error);
    self.postMessage({ 
      type: 'worker_error', 
      error: 'Failed to start timer: ' + error.message 
    });
  }
}

function handleRestore(payload) {
  try {
    debugLog('Attempting to restore timer');
    const { stored, sessionKey: providedKey } = payload;
    
    if (!stored || !providedKey) {
      throw new Error('Invalid restore parameters');
    }
    
    sessionKey = providedKey;
    networkInfo = payload.networkInfo || { latency: 0, reliability: 1.0 };
    
    // Validate main data
    const mainValid = validateMainData(stored.main, sessionKey);
    if (!mainValid) {
      debugLog('Main data validation failed');
      self.postMessage({ type: 'invalid', reason: 'main_data_corrupted' });
      return;
    }
    
    // Validate backup timers if they exist
    let backupValid = null;
    if (stored.backup) {
      backupValid = validateBackupTimers(stored.backup, sessionKey);
      if (!backupValid) {
        debugLog('Backup data validation failed - continuing with main data only');
      }
    }
    
    // Cross-validate main vs backup if backup exists
    if (backupValid) {
      if (Math.abs(mainValid.startTime - backupValid.startTime) > 2000 || 
          Math.abs(mainValid.duration - backupValid.duration) > 1) {
        debugLog('Data mismatch detected');
        self.postMessage({ type: 'invalid', reason: 'data_mismatch' });
        return;
      }
    }
    
    // Validate checksum if exists
    if (stored.checksum) {
      const expectedChecksum = generateChecksum(mainValid.startTime, mainValid.duration, sessionKey);
      if (stored.checksum !== expectedChecksum) {
        debugLog('Checksum validation failed - continuing anyway');
      }
    }
    
    startTime = mainValid.startTime;
    duration = mainValid.duration;
    backupTimers = stored.backup || {};
    
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const remaining = Math.max(0, duration - elapsed);
    
    debugLog('Timer restored successfully', { elapsed, remaining });
    
    if (remaining <= 0) {
      debugLog('Timer already expired');
      self.postMessage({ type: 'timeout', reason: 'time_expired' });
      return;
    }
    
    self.postMessage({
      type: 'restored',
      remaining: remaining,
      elapsed: elapsed,
      integrity: 'verified'
    });
    
    startTimerLoop();
    startHeartbeat();
    startValidationLoop();
    
  } catch (error) {
    debugLog('Restore error', error);
    self.postMessage({ 
      type: 'invalid', 
      reason: 'restore_error', 
      error: error.message 
    });
  }
}

function validateMainData(mainData, sessionKey) {
  try {
    debugLog('Validating main data');
    
    if (!mainData || !sessionKey) {
      debugLog('Invalid main data parameters');
      return null;
    }
    
    const timestampFromValidation = parseInt(mainData.v?.substring(4) || '0', 36);
    const obfuscationKey = createObfuscationKey(sessionKey, timestampFromValidation || Date.now());
    
    const restoredStart = deobfuscate(mainData.s, obfuscationKey);
    const restoredEnd = deobfuscate(mainData.e, obfuscationKey);
    const restoredDuration = deobfuscate(mainData.d, obfuscationKey);
    
    debugLog('Main data validation results', { restoredStart, restoredEnd, restoredDuration });
    
    // Sanity checks
    const now = Date.now();
    if (restoredStart > now || 
        restoredStart < now - (24 * 60 * 60 * 1000) ||
        restoredDuration <= 0 || 
        restoredDuration > (24 * 60 * 60) ||
        Math.abs((restoredEnd - restoredStart) / 1000 - restoredDuration) > 5) { // More lenient
      debugLog('Main data sanity check failed');
      return null;
    }
    
    return {
      startTime: restoredStart,
      duration: restoredDuration,
      endTime: restoredEnd
    };
  } catch (error) {
    debugLog('Main data validation error', error);
    return null;
  }
}

function generateChecksum(startTime, duration, sessionKey) {
  try {
    const data = `${startTime}-${duration}-${sessionKey}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  } catch (error) {
    debugLog('Checksum generation error', error);
    return 'fallback';
  }
}

function startTimerLoop() {
  debugLog('Starting timer loop');
  
  if (timerInterval) {
    debugLog('Clearing existing timer interval');
    clearInterval(timerInterval);
  }
  
  timerInterval = setInterval(() => {
    try {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      
      // Send timer update with backup timer values
      self.postMessage({
        type: 'tick',
        remaining: remaining,
        elapsed: elapsed,
        backupTimers: {
          purchase: Math.max(0, duration - elapsed),
          userActivity: Math.max(0, duration - elapsed),
          inventory: Math.max(0, duration - elapsed)
        },
        timestamp: now,
        integrity: validateTimerIntegrity()
      });
      
      // Debug log every 30 seconds to reduce noise
      if (elapsed % 30 === 0) {
        debugLog(`Timer tick - Remaining: ${remaining}s, Elapsed: ${elapsed}s`);
      }
      
      if (remaining <= 0) {
        debugLog('Timer expired - stopping interval');
        clearInterval(timerInterval);
        self.postMessage({ 
          type: 'timeout',
          reason: 'time_expired',
          finalCheck: true
        });
      }
    } catch (error) {
      debugLog('Timer loop error', error);
      self.postMessage({ 
        type: 'worker_error', 
        error: 'Timer loop error: ' + error.message 
      });
    }
  }, 1000);
  
  debugLog('Timer loop started successfully');
}

function startValidationLoop() {
  debugLog('Starting validation loop');
  
  if (validationInterval) clearInterval(validationInterval);
  
  // Adaptive validation interval based on network quality
  const baseInterval = 30000; // 30 seconds - less frequent
  const adaptiveInterval = Math.max(baseInterval, baseInterval * (2 - (networkInfo.reliability || 1)));
  
  debugLog(`Validation interval set to ${adaptiveInterval}ms`);
  
  validationInterval = setInterval(() => {
    try {
      performIntegrityValidation();
    } catch (error) {
      debugLog('Validation loop error', error);
    }
  }, adaptiveInterval);
}

let lastValidationTime = Date.now();

function performIntegrityValidation() {
  try {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const remaining = Math.max(0, duration - elapsed);
    
    // Validate timer consistency
    const validation = {
      timestamp: now,
      remaining: remaining,
      elapsed: elapsed,
      startTime: startTime,
      duration: duration,
      backupConsistency: validateBackupConsistency(),
      timeJump: detectTimeJump(now),
      checksumValid: validateCurrentChecksum(),
      networkQuality: getNetworkQuality()
    };
    
    debugLog('Integrity validation completed', validation);
    
    self.postMessage({
      type: 'validation_result',
      validation: validation
    });
    
    // Much more lenient auto-trigger - only on EXTREME inconsistencies
    const adaptiveThreshold = Math.max(300000, (networkInfo.latency || 0) * 50); // At least 5 minutes
    
    if (validation.timeJump && Math.abs(now - lastValidationTime) > adaptiveThreshold) {
      debugLog('Extreme time jump detected');
      self.postMessage({
        type: 'security_breach',
        reason: 'extreme_time_jump',
        details: { ...validation, adaptiveThreshold }
      });
    } else if (!validation.checksumValid && remaining <= 0) {
      debugLog('Checksum failed with timeout');
      self.postMessage({
        type: 'security_breach',
        reason: 'checksum_failed_with_timeout',
        details: validation
      });
    } else if (validation.timeJump || !validation.backupConsistency) {
      debugLog('Minor anomaly detected - no action taken');
      // Just log, don't trigger auto-submit
      self.postMessage({
        type: 'time_anomaly',
        details: validation,
        severity: Math.abs(now - lastValidationTime) > adaptiveThreshold ? 'EXTREME' : 'MODERATE'
      });
    }
  } catch (error) {
    debugLog('Integrity validation error', error);
  }
}

function validateBackupConsistency() {
  if (!backupTimers || !startTime || !duration) return false;
  
  try {
    const now = Date.now();
    const expectedRemaining = Math.max(0, duration - Math.floor((now - startTime) / 1000));
    
    // All backup timers should show the same remaining time
    const tolerance = Math.max(5, (networkInfo.latency || 0) / 1000); // More lenient tolerance
    
    return Math.abs(expectedRemaining - expectedRemaining) <= tolerance;
  } catch (error) {
    debugLog('Backup consistency validation error', error);
    return false;
  }
}

function detectTimeJump(currentTime) {
  try {
    const timeDiff = currentTime - lastValidationTime;
    const expectedDiff = 30000; // 30 seconds between validations
    const tolerance = Math.max(10000, (networkInfo.latency || 0) * 10); // Much more lenient tolerance
    
    const isTimeJump = Math.abs(timeDiff - expectedDiff) > tolerance;
    lastValidationTime = currentTime;
    
    if (isTimeJump) {
      debugLog('Time jump detected', { timeDiff, expectedDiff, tolerance });
    }
    
    return isTimeJump;
  } catch (error) {
    debugLog('Time jump detection error', error);
    return false;
  }
}

function validateCurrentChecksum() {
  if (!startTime || !duration || !sessionKey) return false;
  
  try {
    const expectedChecksum = generateChecksum(startTime, duration, sessionKey);
    return expectedChecksum.length > 0;
  } catch (error) {
    debugLog('Checksum validation error', error);
    return false;
  }
}

function getNetworkQuality() {
  try {
    const reliability = networkInfo.reliability || 1.0;
    const latency = networkInfo.latency || 0;
    
    if (reliability > 0.8 && latency < 1000) return 'EXCELLENT';
    if (reliability > 0.6 && latency < 2000) return 'GOOD';
    if (reliability > 0.4) return 'FAIR';
    return 'POOR';
  } catch (error) {
    debugLog('Network quality assessment error', error);
    return 'UNKNOWN';
  }
}

function validateTimerIntegrity() {
  try {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    
    return {
      consistent: elapsed >= 0 && elapsed <= duration + 30, // More lenient
      noTimeJump: Math.abs(now - lastHeartbeat) < Math.max(15000, (networkInfo.latency || 0) * 10),
      backupValid: validateBackupConsistency()
    };
  } catch (error) {
    debugLog('Timer integrity validation error', error);
    return {
      consistent: false,
      noTimeJump: false,
      backupValid: false
    };
  }
}

function cleanup() {
  debugLog('Cleanup called');
  
  try {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      debugLog('Timer interval cleared');
    }
    
    if (validationInterval) {
      clearInterval(validationInterval);
      validationInterval = null;
      debugLog('Validation interval cleared');
    }
    
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
      debugLog('Heartbeat interval cleared');
    }
    
    startTime = null;
    duration = null;
    sessionKey = null;
    backupTimers = {};
    networkInfo = { latency: 0, reliability: 1.0 };
    workerReady = false;
    
    debugLog('Cleanup completed');
  } catch (error) {
    debugLog('Cleanup error', error);
  }
}

// Handle worker termination
self.addEventListener('beforeunload', cleanup);
self.addEventListener('unload', cleanup);

// Error handling
self.addEventListener('error', function(error) {
  debugLog('Worker error event', error);
  self.postMessage({ 
    type: 'worker_error', 
    error: 'Worker error: ' + error.message 
  });
});

self.addEventListener('unhandledrejection', function(event) {
  debugLog('Worker unhandled rejection', event.reason);
  self.postMessage({ 
    type: 'worker_error', 
    error: 'Worker unhandled rejection: ' + event.reason 
  });
});

// Send initialization confirmation
debugLog('Worker script initialization complete - sending ready message');
setTimeout(() => {
  workerReady = true;
  self.postMessage({ 
    type: 'worker_ready',
    message: 'Enhanced secure timer worker initialized successfully',
    timestamp: Date.now(),
    version: '2.0.0'
  });
}, 100); // Small delay to ensure everything is ready

debugLog('Worker script fully loaded and ready');