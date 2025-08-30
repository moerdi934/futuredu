// public/global-timer.js - Improved Global Timer Worker
// This worker handles exam timing with better stability and error handling

let timer = null;
let startTime = 0;
let durationSeconds = 0;
let isRunning = false;
let examId = null;
let lastTickTime = Date.now();
let initialized = false;

// Prevent multiple ready signals
function sendReadyOnce() {
  if (!initialized) {
    initialized = true;
    self.postMessage({ 
      type: 'ready', 
      timestamp: Date.now(),
      workerId: Math.random().toString(36).substr(2, 9)
    });
  }
}

// Send ready signal
sendReadyOnce();

// Handle messages from main thread
self.onmessage = function(e) {
  const { action, ...payload } = e.data;
  
  try {
    switch (action) {
      case 'init':
        handleInit(payload);
        break;
        
      case 'start':
        handleStart(payload);
        break;
        
      case 'stop':
        handleStop();
        break;
        
      case 'sync':
        handleSync(payload);
        break;

      case 'ping':
        // Health check
        self.postMessage({ 
          type: 'pong', 
          timestamp: Date.now(),
          isRunning,
          examId
        });
        break;
        
      default:
        // Log unknown actions but don't error
        console.warn('Unknown worker action:', action);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
      action: action,
      timestamp: Date.now()
    });
  }
};

function handleInit(payload) {
  examId = payload.examId;
  
  // Only send ready if not already sent
  if (initialized) {
    self.postMessage({ 
      type: 'init_complete', 
      examId,
      timestamp: Date.now()
    });
  } else {
    sendReadyOnce();
  }
}

function handleStart(payload) {
  const duration = payload.duration || 0;
  
  if (duration <= 0) {
    self.postMessage({ 
      type: 'error', 
      error: 'Invalid duration: ' + duration 
    });
    return;
  }

  // Clear existing timer safely
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  startTime = Date.now();
  durationSeconds = duration;
  isRunning = true;
  lastTickTime = startTime;

  // Send immediate tick
  sendTick();

  // Set interval for regular updates
  timer = setInterval(sendTick, 1000);
  
  self.postMessage({
    type: 'started',
    duration: duration,
    startTime: startTime,
    examId: examId
  });
}

function handleStop() {
  const wasRunning = isRunning;
  isRunning = false;
  
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  if (wasRunning) {
    self.postMessage({
      type: 'stopped',
      examId: examId,
      finalElapsed: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
    });
  }
}

function handleSync(payload) {
  if (!isRunning) {
    return;
  }

  const { timeLeft, elapsed } = payload;
  
  if (typeof timeLeft === 'number' && typeof elapsed === 'number') {
    // Update internal state based on server sync
    const now = Date.now();
    startTime = now - (elapsed * 1000);
    durationSeconds = timeLeft + elapsed;
    
    // Send updated tick immediately
    sendTick();
    
    self.postMessage({
      type: 'synced',
      timeLeft: timeLeft,
      elapsed: elapsed,
      timestamp: now
    });
  }
}

function sendTick() {
  if (!isRunning || !startTime) {
    return;
  }

  const now = Date.now();
  const elapsed = Math.floor((now - startTime) / 1000);
  const timeLeft = Math.max(0, durationSeconds - elapsed);

  // Update last tick time for jump detection
  lastTickTime = now;

  self.postMessage({
    type: 'tick',
    timeLeft: timeLeft,
    elapsed: elapsed,
    timestamp: now,
    examId: examId
  });

  // Check for timeout
  if (timeLeft <= 0) {
    isRunning = false;
    
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    
    self.postMessage({
      type: 'timeout',
      examId: examId,
      finalElapsed: elapsed,
      timestamp: now
    });
  }
}

// Time jump detection - less aggressive
let timeJumpCheckInterval = setInterval(() => {
  if (isRunning && startTime) {
    const now = Date.now();
    const expectedTime = lastTickTime + 2000; // Allow 2 second variance
    
    // Only report significant time jumps (> 10 seconds)
    if (now > expectedTime + 10000) {
      self.postMessage({
        type: 'time_jump_detected',
        timeDiff: now - expectedTime,
        timestamp: now,
        severity: 'warning'
      });
    }
  }
}, 5000); // Check every 5 seconds

// Heartbeat for health monitoring
let heartbeatInterval = setInterval(() => {
  if (isRunning) {
    self.postMessage({
      type: 'heartbeat',
      timestamp: Date.now(),
      examId: examId,
      uptime: startTime ? Date.now() - startTime : 0
    });
  }
}, 30000); // Every 30 seconds

// Handle worker termination
self.addEventListener('error', function(error) {
  self.postMessage({
    type: 'worker_error',
    error: error.message,
    timestamp: Date.now()
  });
});

// Clean up on termination
self.addEventListener('beforeunload', function() {
  if (timer) {
    clearInterval(timer);
  }
  if (timeJumpCheckInterval) {
    clearInterval(timeJumpCheckInterval);
  }
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
});