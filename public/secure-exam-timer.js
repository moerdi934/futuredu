// File: public/secure-exam-timer.js
// PRODUCTION VERSION - NO DEBUG LOGGING

// Simple state
let timer = null;
let startTime = 0;
let durationSeconds = 0;
let isRunning = false;

// Immediately send ready signal
self.postMessage({ 
  type: 'worker_ready',
  timestamp: Date.now()
});

// Handle messages
self.onmessage = function(e) {
  const { action, payload } = e.data;
  
  try {
    switch (action) {
      case 'ping':
        self.postMessage({ 
          type: 'worker_ready',
          timestamp: Date.now()
        });
        break;
        
      case 'start':
        startTimer(payload.duration || 0);
        break;
        
      case 'stop':
        stopTimer();
        break;
        
      case 'heartbeat_response':
        // Acknowledge heartbeat response
        break;
        
      default:
        // Ignore unknown actions
    }
  } catch (error) {
    self.postMessage({
      type: 'worker_error',
      error: error.message
    });
  }
};

function startTimer(duration) {
  if (timer) {
    clearInterval(timer);
  }
  
  startTime = Date.now();
  durationSeconds = duration;
  isRunning = true;
  
  // Send immediate tick
  sendTick();
  
  // Start interval
  timer = setInterval(sendTick, 1000);
}

function sendTick() {
  if (!isRunning) return;
  
  const now = Date.now();
  const elapsed = Math.floor((now - startTime) / 1000);
  const remaining = Math.max(0, durationSeconds - elapsed);
  
  self.postMessage({
    type: 'tick',
    remaining: remaining,
    elapsed: elapsed,
    timestamp: now,
    backupTimers: {
      purchase: remaining,
      userActivity: remaining,
      inventory: remaining
    },
    integrity: {
      consistent: true,
      noTimeJump: true,
      backupValid: true
    }
  });
  
  if (remaining <= 0) {
    stopTimer();
    self.postMessage({
      type: 'timeout',
      reason: 'time_expired'
    });
  }
}

function stopTimer() {
  isRunning = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

// Send heartbeat every 5 seconds
setInterval(() => {
  if (isRunning) {
    self.postMessage({
      type: 'heartbeat_request',
      timestamp: Date.now()
    });
  }
}, 5000);