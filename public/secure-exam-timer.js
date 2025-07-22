// File: public/secure-exam-timer.js
let timerInterval;
let startTime;
let duration;
let sessionKey;

// Simple but effective obfuscation
function obfuscate(value, key) {
  const keyNum = parseInt(key.substring(0, 8), 16);
  const obfuscated = (value ^ keyNum ^ 0x12345678).toString(36);
  return obfuscated;
}

function deobfuscate(obfuscated, key) {
  const keyNum = parseInt(key.substring(0, 8), 16);
  const value = parseInt(obfuscated, 36) ^ keyNum ^ 0x12345678;
  return value;
}

self.onmessage = function(e) {
  const { action, payload } = e.data;
  
  switch (action) {
    case 'start':
      startTime = Date.now();
      duration = payload.duration;
      sessionKey = payload.sessionKey;
      
      // Store obfuscated data
      const obfuscatedData = {
        s: obfuscate(startTime, sessionKey),
        e: obfuscate(startTime + (duration * 1000), sessionKey),
        d: obfuscate(duration, sessionKey),
        v: sessionKey.substring(8, 12) // Verification fragment
      };
      
      self.postMessage({
        type: 'store',
        data: obfuscatedData
      });
      
      startTimerLoop();
      break;
      
    case 'restore':
      try {
        const { stored, sessionKey: providedKey } = payload;
        sessionKey = providedKey;
        
        // Verify session
        if (!stored.v || stored.v !== sessionKey.substring(8, 12)) {
          self.postMessage({ type: 'invalid' });
          return;
        }
        
        const restoredStart = deobfuscate(stored.s, sessionKey);
        const restoredEnd = deobfuscate(stored.e, sessionKey);
        const restoredDuration = deobfuscate(stored.d, sessionKey);
        
        // Sanity checks
        const now = Date.now();
        if (restoredStart > now || 
            restoredStart < now - (24 * 60 * 60 * 1000) ||
            restoredDuration <= 0 || 
            restoredDuration > (24 * 60 * 60)) {
          self.postMessage({ type: 'invalid' });
          return;
        }
        
        startTime = restoredStart;
        duration = restoredDuration;
        
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, duration - elapsed);
        
        if (remaining <= 0) {
          self.postMessage({ type: 'timeout' });
          return;
        }
        
        self.postMessage({
          type: 'restored',
          remaining: remaining
        });
        
        startTimerLoop();
      } catch (error) {
        self.postMessage({ type: 'invalid' });
      }
      break;
      
    case 'stop':
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      break;
  }
};

function startTimerLoop() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, duration - elapsed);
    
    self.postMessage({
      type: 'tick',
      remaining: remaining,
      elapsed: elapsed
    });
    
    if (remaining <= 0) {
      clearInterval(timerInterval);
      self.postMessage({ type: 'timeout' });
    }
  }, 1000);
}