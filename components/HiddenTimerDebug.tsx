// components/HiddenTimerDebug.tsx - Complete Enhanced Debug Component
import React, { useState, useEffect } from 'react';
import { Card, Badge, Row, Col, Table, Button, Collapse } from 'react-bootstrap';
import { 
  Clock, 
  Activity, 
  PlayCircle, 
  PauseCircle, 
  StopCircle, 
  RotateCcw, 
  Info,
  ChevronDown,
  ChevronUp,
  Timer,
  Zap,
  Database,
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Power,
  Play,
  Square
} from 'lucide-react';

interface HiddenTimerDebugProps {
  questionTimer: any; // Enhanced question timer instance
  mainTimerElapsed: number; // Main timer elapsed for comparison
  isVisible?: boolean; // Control visibility
  position?: 'fixed' | 'relative';
  className?: string;
}

export const HiddenTimerDebug: React.FC<HiddenTimerDebugProps> = ({
  questionTimer,
  mainTimerElapsed,
  isVisible = true,
  position = 'fixed',
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every second
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !questionTimer) {
    return null;
  }

  const debugInfo = questionTimer.debugInfo;
  const hiddenTimer = questionTimer.hiddenTimer;
  const timeDrift = Math.abs(hiddenTimer.getCurrentElapsed() - mainTimerElapsed);

  const getStatusColor = (isRunning: boolean, isAccurate: boolean) => {
    if (!isRunning) return 'secondary';
    if (isAccurate) return 'success';
    return 'warning';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const containerClasses = position === 'fixed' 
    ? 'tw-fixed tw-top-4 tw-left-4 tw-z-50 tw-w-80' 
    : 'tw-w-full';

  return (
    <div className={`${containerClasses} ${className}`}>
      <Card className="tw-shadow-lg tw-border-2 tw-border-blue-200 tw-bg-blue-50">
        <Card.Header className="tw-bg-blue-100 tw-py-2">
          <div className="tw-flex tw-items-center tw-justify-between">
            <div className="tw-flex tw-items-center tw-gap-2">
              <Timer className="tw-text-blue-600" size={16} />
              <span className="tw-text-sm tw-font-semibold tw-text-blue-800">
                Hidden Question Timer
              </span>
              {questionTimer.debugMode && (
                <Badge bg="info" className="tw-text-xs">DEBUG</Badge>
              )}
            </div>
            <Button
              variant="link"
              size="sm"
              className="tw-p-0 tw-text-blue-600"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
        </Card.Header>

        <Card.Body className="tw-py-3">
          {/* Main Timer Display */}
          <div className="tw-mb-3">
            <Row className="tw-text-center">
              <Col xs={6}>
                <div className="tw-bg-white tw-p-2 tw-rounded tw-border">
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-1 tw-mb-1">
                    <Clock size={14} className="tw-text-blue-600" />
                    <span className="tw-text-xs tw-text-gray-600">Hidden</span>
                  </div>
                  <div className="tw-text-lg tw-font-mono tw-font-bold tw-text-blue-700">
                    {hiddenTimer.currentFormattedTime}
                  </div>
                  <div className="tw-text-xs tw-text-gray-500">
                    {hiddenTimer.getCurrentElapsed()}s
                  </div>
                </div>
              </Col>
              <Col xs={6}>
                <div className="tw-bg-white tw-p-2 tw-rounded tw-border">
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-1 tw-mb-1">
                    <Zap size={14} className="tw-text-green-600" />
                    <span className="tw-text-xs tw-text-gray-600">Main</span>
                  </div>
                  <div className="tw-text-lg tw-font-mono tw-font-bold tw-text-green-700">
                    {formatTime(mainTimerElapsed)}
                  </div>
                  <div className="tw-text-xs tw-text-gray-500">
                    {mainTimerElapsed}s
                  </div>
                </div>
              </Col>
            </Row>

            {/* Status Indicators */}
            <div className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-mt-2 tw-flex-wrap">
              <Badge 
                bg={getStatusColor(hiddenTimer.isRunning, hiddenTimer.isAccurate)}
                className="tw-flex tw-items-center tw-gap-1"
              >
                <Activity size={12} />
                {hiddenTimer.isRunning ? 'RUNNING' : 'STOPPED'}
              </Badge>
              
              {timeDrift > 1 && (
                <Badge bg="warning" className="tw-flex tw-items-center tw-gap-1">
                  <Info size={12} />
                  DRIFT: {timeDrift}s
                </Badge>
              )}

              <Badge 
                bg={questionTimer.isTracking ? 'success' : 'danger'}
                className="tw-flex tw-items-center tw-gap-1"
              >
                <Target size={12} />
                {questionTimer.isTracking ? 'TRACKING' : 'NOT TRACKING'}
              </Badge>
            </div>
          </div>

          {/* Enhanced Timer Controls */}
          <div className="tw-mb-3">
            <div className="tw-text-xs tw-text-gray-600 tw-mb-2 tw-text-center">Hidden Timer Controls</div>
            <div className="tw-flex tw-justify-center tw-gap-1 tw-mb-2">
              <Button
                variant="outline-success"
                size="sm"
                onClick={hiddenTimer.start}
                disabled={hiddenTimer.isRunning}
                title="Start Hidden Timer"
              >
                <PlayCircle size={14} />
              </Button>
              <Button
                variant="outline-warning"
                size="sm"
                onClick={hiddenTimer.pause}
                disabled={!hiddenTimer.isRunning}
                title="Pause Hidden Timer"
              >
                <PauseCircle size={14} />
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={hiddenTimer.stop}
                title="Stop Hidden Timer"
              >
                <StopCircle size={14} />
              </Button>
              <Button
                variant="outline-info"
                size="sm"
                onClick={hiddenTimer.restart}
                title="Restart Hidden Timer"
              >
                <RotateCcw size={14} />
              </Button>
            </div>

            {/* Question Tracking Controls */}
            <div className="tw-text-xs tw-text-gray-600 tw-mb-2 tw-text-center">Question Tracking Controls</div>
            <div className="tw-flex tw-justify-center tw-gap-1">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => questionTimer.forceStartTracking?.()}
                disabled={questionTimer.isTracking}
                title="Force Start Question Tracking"
                className="tw-text-xs"
              >
                <Power size={12} className="tw-mr-1" />
                Force Track
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => questionTimer.stopTracking()}
                disabled={!questionTimer.isTracking}
                title="Stop Question Tracking"
                className="tw-text-xs"
              >
                <Square size={12} className="tw-mr-1" />
                Stop Track
              </Button>
            </div>
          </div>

          {/* Question Info */}
          {debugInfo.questionTimer.currentQuestionId && (
            <div className="tw-bg-white tw-p-2 tw-rounded tw-border tw-mb-3">
              <div className="tw-flex tw-items-center tw-gap-1 tw-mb-1">
                <Target size={14} className="tw-text-orange-600" />
                <span className="tw-text-xs tw-font-medium tw-text-gray-700">Current Question</span>
              </div>
              <div className="tw-text-sm tw-text-gray-600">
                <div>ID: <span className="tw-font-mono">{debugInfo.questionTimer.currentQuestionId}</span></div>
                <div>Time: <span className="tw-font-mono">{formatTime(debugInfo.questionTimer.currentQuestionTime)}</span></div>
                <div>Total: <span className="tw-font-mono">{formatTime(debugInfo.questionTimer.currentElapsedTime)}</span></div>
                <div>Tracking: <span className={`tw-font-mono ${questionTimer.isTracking ? 'tw-text-green-600' : 'tw-text-red-600'}`}>
                  {questionTimer.isTracking ? 'ACTIVE' : 'INACTIVE'}
                </span></div>
              </div>
            </div>
          )}

          {/* Detailed Information */}
          <Collapse in={showDetails}>
            <div>
              {/* Timer States Comparison */}
              <Card className="tw-mb-3 tw-border">
                <Card.Header className="tw-py-2 tw-bg-gray-50">
                  <span className="tw-text-sm tw-font-medium">Timer Comparison</span>
                </Card.Header>
                <Card.Body className="tw-py-2">
                  <Table size="sm" className="tw-mb-0">
                    <tbody>
                      <tr>
                        <td className="tw-text-xs">Hidden Timer</td>
                        <td className="tw-text-xs tw-font-mono">{hiddenTimer.getCurrentElapsed()}s</td>
                        <td className="tw-text-xs">
                          {hiddenTimer.isAccurate ? (
                            <CheckCircle size={12} className="tw-text-green-600" />
                          ) : (
                            <AlertTriangle size={12} className="tw-text-yellow-600" />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="tw-text-xs">Main Timer</td>
                        <td className="tw-text-xs tw-font-mono">{mainTimerElapsed}s</td>
                        <td className="tw-text-xs">
                          <CheckCircle size={12} className="tw-text-green-600" />
                        </td>
                      </tr>
                      <tr className={timeDrift > 2 ? 'tw-bg-yellow-50' : ''}>
                        <td className="tw-text-xs tw-font-medium">Drift</td>
                        <td className="tw-text-xs tw-font-mono">{timeDrift}s</td>
                        <td className="tw-text-xs">
                          {timeDrift > 2 ? (
                            <AlertTriangle size={12} className="tw-text-yellow-600" />
                          ) : (
                            <CheckCircle size={12} className="tw-text-green-600" />
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {/* Enhanced Question Timer Details */}
              <Card className="tw-mb-3 tw-border">
                <Card.Header className="tw-py-2 tw-bg-gray-50">
                  <span className="tw-text-sm tw-font-medium">Question Timer Details</span>
                </Card.Header>
                <Card.Body className="tw-py-2">
                  <div className="tw-text-xs tw-space-y-1">
                    <div className="tw-flex tw-justify-between">
                      <span>Current Question:</span>
                      <span className="tw-font-mono">{debugInfo.questionTimer.currentQuestionId || 'None'}</span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Is Tracking:</span>
                      <span className={debugInfo.questionTimer.isTracking ? 'tw-text-green-600' : 'tw-text-red-600'}>
                        {debugInfo.questionTimer.isTracking ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Question Time:</span>
                      <span className="tw-font-mono">{formatTime(debugInfo.questionTimer.currentQuestionTime)}</span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Accumulated:</span>
                      <span className="tw-font-mono">{formatTime(debugInfo.questionTimer.accumulatedTime)}</span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Total Elapsed:</span>
                      <span className="tw-font-mono">{formatTime(debugInfo.questionTimer.currentElapsedTime)}</span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Last Save:</span>
                      <span className="tw-font-mono">{formatTime(debugInfo.questionTimer.lastSaveTime)}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Auto-Save Status */}
              <Card className="tw-mb-3 tw-border">
                <Card.Header className="tw-py-2 tw-bg-gray-50">
                  <div className="tw-flex tw-items-center tw-gap-1">
                    <Database size={14} className="tw-text-blue-600" />
                    <span className="tw-text-sm tw-font-medium">Auto-Save Status</span>
                  </div>
                </Card.Header>
                <Card.Body className="tw-py-2">
                  <div className="tw-text-xs tw-space-y-1">
                    <div className="tw-flex tw-justify-between">
                      <span>Interval:</span>
                      <span className="tw-font-mono">{debugInfo.autoSave.interval}s</span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Active:</span>
                      <span className={debugInfo.autoSave.isActive ? 'tw-text-green-600' : 'tw-text-red-600'}>
                        {debugInfo.autoSave.isActive ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Next Save:</span>
                      <span className="tw-font-mono">
                        {debugInfo.autoSave.nextSaveIn ? `${debugInfo.autoSave.nextSaveIn}s` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Session Information */}
              <Card className="tw-mb-3 tw-border">
                <Card.Header className="tw-py-2 tw-bg-gray-50">
                  <span className="tw-text-sm tw-font-medium">Session Info</span>
                </Card.Header>
                <Card.Body className="tw-py-2">
                  <div className="tw-text-xs tw-space-y-1">
                    <div className="tw-flex tw-justify-between">
                      <span>Exam String:</span>
                      <span className="tw-font-mono tw-text-right tw-max-w-32 tw-truncate" title={debugInfo.session.examString}>
                        {debugInfo.session.examString}
                      </span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Session Uptime:</span>
                      <span className="tw-font-mono">{formatTime(Math.floor(debugInfo.session.sessionUptime / 1000))}</span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Session Total:</span>
                      <span className="tw-font-mono">{formatTime(Math.floor(debugInfo.questionTimer.totalSessionTime / 1000))}</span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Previous Q:</span>
                      <span className="tw-font-mono">{debugInfo.session.previousQuestion || 'None'}</span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Is Initialized:</span>
                      <span className={debugInfo.session.isInitialized ? 'tw-text-green-600' : 'tw-text-red-600'}>
                        {debugInfo.session.isInitialized ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Timer Running:</span>
                      <span className={debugInfo.session.isTimerRunning ? 'tw-text-green-600' : 'tw-text-red-600'}>
                        {debugInfo.session.isTimerRunning ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Hidden Timer Internal State */}
              <Card className="tw-mb-3 tw-border">
                <Card.Header className="tw-py-2 tw-bg-gray-50">
                  <span className="tw-text-sm tw-font-medium">Hidden Timer Internal</span>
                </Card.Header>
                <Card.Body className="tw-py-2">
                  <div className="tw-text-xs tw-space-y-1">
                    <div className="tw-flex tw-justify-between">
                      <span>Start Time:</span>
                      <span className="tw-font-mono">{formatTimestamp(debugInfo.hiddenTimer.state.startTime)}</span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Last Tick:</span>
                      <span className="tw-font-mono">{formatTimestamp(debugInfo.hiddenTimer.state.lastTick)}</span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Uptime:</span>
                      <span className="tw-font-mono">{formatTime(Math.floor(debugInfo.hiddenTimer.uptime / 1000))}</span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Is Accurate:</span>
                      <span className={debugInfo.hiddenTimer.isAccurate ? 'tw-text-green-600' : 'tw-text-red-600'}>
                        {debugInfo.hiddenTimer.isAccurate ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>Current Elapsed:</span>
                      <span className="tw-font-mono">{hiddenTimer.getCurrentElapsed()}s</span>
                    </div>
                    <div className="tw-flex tw-justify-between">
                      <span>State Elapsed:</span>
                      <span className="tw-font-mono">{debugInfo.hiddenTimer.state.elapsed}s</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Recent Debug Logs (if available) */}
              {questionTimer.debugMode && questionTimer.debugLogs && questionTimer.debugLogs.length > 0 && (
                <Card className="tw-border">
                  <Card.Header className="tw-py-2 tw-bg-gray-50">
                    <span className="tw-text-sm tw-font-medium">Recent Debug Logs</span>
                  </Card.Header>
                  <Card.Body className="tw-py-2">
                    <div className="tw-max-h-32 tw-overflow-y-auto">
                      {questionTimer.debugLogs.slice(-5).map((log: any, index: number) => (
                        <div key={index} className="tw-text-xs tw-mb-1 tw-border-b tw-border-gray-100 tw-pb-1">
                          <div className="tw-flex tw-justify-between">
                            <span className="tw-font-medium">{log.action}</span>
                            <span className="tw-font-mono">{formatTime(log.elapsed)}</span>
                          </div>
                          <div className="tw-text-gray-500">
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Emergency Actions */}
              <Card className="tw-border tw-border-red-200 tw-bg-red-50">
                <Card.Header className="tw-py-2 tw-bg-red-100">
                  <span className="tw-text-sm tw-font-medium tw-text-red-800">Emergency Actions</span>
                </Card.Header>
                <Card.Body className="tw-py-2">
                  <div className="tw-flex tw-justify-center tw-gap-2">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        if (confirm('Reset both timers? This will clear all timing data!')) {
                          hiddenTimer.reset();
                          questionTimer.stopTracking();
                          if (questionTimer.currentQuestionId) {
                            questionTimer.forceStartTracking?.();
                          }
                        }
                      }}
                      className="tw-text-xs"
                    >
                      <RefreshCw size={12} className="tw-mr-1" />
                      Reset All
                    </Button>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => {
                        questionTimer.syncWithExternalTimer(mainTimerElapsed);
                      }}
                      className="tw-text-xs"
                    >
                      <Settings size={12} className="tw-mr-1" />
                      Force Sync
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Collapse>
        </Card.Body>

        {/* Footer with sync button and refresh info */}
        <Card.Footer className="tw-py-2 tw-bg-blue-50">
          <div className="tw-flex tw-justify-between tw-items-center">
            <span className="tw-text-xs tw-text-gray-600">
              Refresh: {refreshKey} | Drift: {timeDrift}s
            </span>
            <div className="tw-flex tw-gap-1">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => questionTimer.syncWithExternalTimer(mainTimerElapsed)}
                className="tw-text-xs tw-py-1"
              >
                <RefreshCw size={10} className="tw-mr-1" />
                Sync
              </Button>
              {!questionTimer.isTracking && questionTimer.currentQuestionId && (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => questionTimer.forceStartTracking?.()}
                  className="tw-text-xs tw-py-1"
                >
                  <Play size={10} className="tw-mr-1" />
                  Start
                </Button>
              )}
            </div>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

// Export for use
export default HiddenTimerDebug;