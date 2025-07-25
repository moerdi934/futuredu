// File: public/secure-exam-timer.js
// Advanced Web Worker Timer with Multiple Security Layers

let timerInterval;
let startTime;
let duration;
let sessionKey;
let backupTimers = {};
let validationInterval;
let heartbeatInterval;
let lastHeartbeat = Date.now();

// Advanced obfuscation with multiple layers
function createObfuscationKey(sessionKey, timestamp) {
  const keyParts = [
    sessionKey.substring(0, 8),
    timestamp.toString(36),
    sessionKey.substring(8, 16)
  ];
  return keyParts.join('');
}

function obfuscate(value, key, salt = 0x12345678) {
  const keyNum = parseInt(key.substring(0, 8), 16);
  const timestampNum = parseInt(key.substring(8, 16), 36) || Date.now();
  const complexKey = keyNum ^ timestampNum ^ salt;
  
  // Multiple XOR passes for better security
  let obfuscated = value ^ complexKey;
  obfuscated = obfuscated ^ parseInt(key.substring(16, 24) || '87654321', 16);
  obfuscated = obfuscated ^ 0xABCDEF12;
  
  return obfuscated.toString(36);
}

function deobfuscate(obfuscated, key, salt = 0x12345678) {
  try {
    const keyNum = parseInt(key.substring(0, 8), 16);
    const timestampNum = parseInt(key.substring(8, 16), 36) || Date.now();
    const complexKey = keyNum ^ timestampNum ^ salt;
    
    let value = parseInt(obfuscated, 36);
    value = value ^ 0xABCDEF12;
    value = value ^ parseInt(key.substring(16, 24) || '87654321', 16);
    value = value ^ complexKey;
    
    return value;
  } catch (error) {
    throw new Error('Deobfuscation failed');
  }
}

// Generate backup timer data with different obfuscation
function generateBackupTimers(startTime, duration, sessionKey) {
  const timestamp = Date.now();
  
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
}

// Validate backup timers integrity
function validateBackupTimers(stored, sessionKey) {
  try {
    const purchaseDuration = deobfuscate(stored.purchase.marketResearch, sessionKey + 'purchase', 0x11111111);
    const purchaseStart = deobfuscate(stored.purchase.analytics, sessionKey + 'analytics', 0x22222222);
    
    const userActivityDuration = deobfuscate(stored.userActivity.behaviorPattern, sessionKey + 'behavior', 0x33333333);
    const userActivityStart = deobfuscate(stored.userActivity.neuralNetwork, sessionKey + 'neural', 0x44444444);
    
    const inventoryDuration = deobfuscate(stored.inventory.quantum, sessionKey + 'quantum', 0x55555555);
    const inventoryStart = deobfuscate(stored.inventory.blockchain, sessionKey + 'blockchain', 0x66666666);
    
    // Cross-validate all backup timers
    const durations = [purchaseDuration, userActivityDuration, inventoryDuration];
    const starts = [purchaseStart, userActivityStart, inventoryStart];
    
    // Check if all durations match
    const durationValid = durations.every(d => d === durations[0]);
    const startValid = starts.every(s => Math.abs(s - starts[0]) <= 1000); // 1 second tolerance
    
    return durationValid && startValid ? {
      duration: durations[0],
      startTime: starts[0]
    } : null;
  } catch (error) {
    return null;
  }
}

// Heartbeat mechanism to detect if main thread is responsive
function startHeartbeat() {
  heartbeatInterval = setInterval(() => {
    const now = Date.now();
    
    self.postMessage({
      type: 'heartbeat_request',
      timestamp: now
    });
    
    // If no response within 5 seconds, assume main thread is compromised
    setTimeout(() => {
      if (Date.now() - lastHeartbeat > 5000) {
        self.postMessage({
          type: 'main_thread_unresponsive',
          message: 'Main thread not responding - potential manipulation detected'
        });
      }
    }, 5000);
  }, 3000); // Every 3 seconds
}

// Main message handler
self.onmessage = function(e) {
  const { action, payload } = e.data;
  
  switch (action) {
    case 'start':
      startTime = Date.now();
      duration = payload.duration;
      sessionKey = payload.sessionKey;
      
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
        checksum: generateChecksum(startTime, duration, sessionKey)
      };
      
      self.postMessage({
        type: 'store',
        data: obfuscatedData
      });
      
      startTimerLoop();
      startHeartbeat();
      startValidationLoop();
      break;
      
    case 'restore':
      try {
        const { stored, sessionKey: providedKey } = payload;
        sessionKey = providedKey;
        
        // Validate main data
        const mainValid = validateMainData(stored.main, sessionKey);
        if (!mainValid) {
          self.postMessage({ type: 'invalid', reason: 'main_data_corrupted' });
          return;
        }
        
        // Validate backup timers
        const backupValid = validateBackupTimers(stored.backup, sessionKey);
        if (!backupValid) {
          self.postMessage({ type: 'invalid', reason: 'backup_data_corrupted' });
          return;
        }
        
        // Cross-validate main vs backup
        if (Math.abs(mainValid.startTime - backupValid.startTime) > 2000 || 
            Math.abs(mainValid.duration - backupValid.duration) > 1) {
          self.postMessage({ type: 'invalid', reason: 'data_mismatch' });
          return;
        }
        
        // Validate checksum
        const expectedChecksum = generateChecksum(mainValid.startTime, mainValid.duration, sessionKey);
        if (stored.checksum !== expectedChecksum) {
          self.postMessage({ type: 'invalid', reason: 'checksum_failed' });
          return;
        }
        
        startTime = mainValid.startTime;
        duration = mainValid.duration;
        backupTimers = stored.backup;
        
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, duration - elapsed);
        
        if (remaining <= 0) {
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
        self.postMessage({ type: 'invalid', reason: 'restore_error', error: error.message });
      }
      break;
      
    case 'heartbeat_response':
      lastHeartbeat = Date.now();
      break;
      
    case 'validate_request':
      performIntegrityValidation();
      break;
      
    case 'stop':
      cleanup();
      break;
      
    default:
      self.postMessage({ type: 'unknown_action', action });
  }
};

function validateMainData(mainData, sessionKey) {
  try {
    const obfuscationKey = createObfuscationKey(sessionKey, parseInt(mainData.v.substring(4), 36));
    
    const restoredStart = deobfuscate(mainData.s, obfuscationKey);
    const restoredEnd = deobfuscate(mainData.e, obfuscationKey);
    const restoredDuration = deobfuscate(mainData.d, obfuscationKey);
    
    // Sanity checks
    const now = Date.now();
    if (restoredStart > now || 
        restoredStart < now - (24 * 60 * 60 * 1000) ||
        restoredDuration <= 0 || 
        restoredDuration > (24 * 60 * 60) ||
        Math.abs((restoredEnd - restoredStart) / 1000 - restoredDuration) > 1) {
      return null;
    }
    
    return {
      startTime: restoredStart,
      duration: restoredDuration,
      endTime: restoredEnd
    };
  } catch (error) {
    return null;
  }
}

function generateChecksum(startTime, duration, sessionKey) {
  const data = `${startTime}-${duration}-${sessionKey}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

function startTimerLoop() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
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
    
    if (remaining <= 0) {
      clearInterval(timerInterval);
      self.postMessage({ 
        type: 'timeout',
        reason: 'time_expired',
        finalCheck: true
      });
    }
  }, 1000);
}

function startValidationLoop() {
  validationInterval = setInterval(() => {
    performIntegrityValidation();
  }, 10000); // Every 10 seconds
}

function performIntegrityValidation() {
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
    checksumValid: validateCurrentChecksum()
  };
  
  self.postMessage({
    type: 'validation_result',
    validation: validation
  });
  
  // FIXED: Only auto-trigger timeout on EXTREME inconsistencies
  // Don't auto-submit on minor validation failures
  if (validation.timeJump && Math.abs(now - lastValidationTime) > 60000) {
    // Only if time jump is more than 1 minute
    self.postMessage({
      type: 'security_breach',
      reason: 'extreme_time_jump',
      details: validation
    });
  } else if (!validation.checksumValid && remaining <= 0) {
    // Only if checksum fails AND time is actually expired
    self.postMessage({
      type: 'security_breach',
      reason: 'checksum_failed_with_timeout',
      details: validation
    });
  }
  // FIXED: Remove other auto-submit triggers
}
function validateBackupConsistency() {
  if (!backupTimers) return false;
  
  try {
    const now = Date.now();
    const expectedRemaining = Math.max(0, duration - Math.floor((now - startTime) / 1000));
    
    // All backup timers should show the same remaining time
    const tolerance = 2; // 2 seconds tolerance
    
    return Math.abs(expectedRemaining - expectedRemaining) <= tolerance;
  } catch (error) {
    return false;
  }
}

let lastValidationTime = Date.now();
function detectTimeJump(currentTime) {
  const timeDiff = currentTime - lastValidationTime;
  const expectedDiff = 10000; // 10 seconds between validations
  const tolerance = 2000; // 2 seconds tolerance
  
  const isTimeJump = Math.abs(timeDiff - expectedDiff) > tolerance;
  lastValidationTime = currentTime;
  
  return isTimeJump;
}

function validateCurrentChecksum() {
  if (!startTime || !duration || !sessionKey) return false;
  
  const expectedChecksum = generateChecksum(startTime, duration, sessionKey);
  return expectedChecksum.length > 0;
}

function validateTimerIntegrity() {
  const now = Date.now();
  const elapsed = Math.floor((now - startTime) / 1000);
  
  return {
    consistent: elapsed >= 0 && elapsed <= duration + 10,
    noTimeJump: Math.abs(now - lastHeartbeat) < 10000,
    backupValid: validateBackupConsistency()
  };
}

function cleanup() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  if (validationInterval) {
    clearInterval(validationInterval);
    validationInterval = null;
  }
  
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  
  startTime = null;
  duration = null;
  sessionKey = null;
  backupTimers = {};
}

// Handle worker termination
self.addEventListener('beforeunload', cleanup);
self.addEventListener('unload', cleanup);