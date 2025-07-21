// contexts/DrillContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
interface QuestionLeft {
  exam_id: number;
  remaining_questions: number[];
}

interface DrillSession {
  exam_schedule_id: number;
  topic_id: number;
  session_id: number;
  exam_id: number;
  questions_left: QuestionLeft[];
  exam_string?: string;
  created_at: number; // timestamp
  last_accessed: number; // timestamp
}

interface DrillState {
  sessions: Record<string, DrillSession>; // key: unique drill identifier
  currentSessionId: string | null;
}

// Actions
type DrillAction =
  | { type: 'CREATE_SESSION'; payload: { sessionId: string; data: DrillSession } }
  | { type: 'UPDATE_SESSION'; payload: { sessionId: string; data: Partial<DrillSession> } }
  | { type: 'SET_CURRENT_SESSION'; payload: string }
  | { type: 'REMOVE_SESSION'; payload: string }
  | { type: 'UPDATE_QUESTIONS_LEFT'; payload: { sessionId: string; questionsLeft: QuestionLeft[] } }
  | { type: 'CLEANUP_OLD_SESSIONS' }
  | { type: 'LOAD_FROM_STORAGE'; payload: DrillState };

// Reducer
const drillReducer = (state: DrillState, action: DrillAction): DrillState => {
  switch (action.type) {
    case 'CREATE_SESSION':
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.payload.sessionId]: {
            ...action.payload.data,
            created_at: Date.now(),
            last_accessed: Date.now(),
          }
        },
        currentSessionId: action.payload.sessionId
      };

    case 'UPDATE_SESSION':
      if (!state.sessions[action.payload.sessionId]) return state;
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.payload.sessionId]: {
            ...state.sessions[action.payload.sessionId],
            ...action.payload.data,
            last_accessed: Date.now(),
          }
        }
      };

    case 'SET_CURRENT_SESSION':
      if (!state.sessions[action.payload]) return state;
      return {
        ...state,
        currentSessionId: action.payload,
        sessions: {
          ...state.sessions,
          [action.payload]: {
            ...state.sessions[action.payload],
            last_accessed: Date.now(),
          }
        }
      };

    case 'REMOVE_SESSION':
      const { [action.payload]: removed, ...remainingSessions } = state.sessions;
      return {
        ...state,
        sessions: remainingSessions,
        currentSessionId: state.currentSessionId === action.payload ? null : state.currentSessionId
      };

    case 'UPDATE_QUESTIONS_LEFT':
      if (!state.sessions[action.payload.sessionId]) return state;
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [action.payload.sessionId]: {
            ...state.sessions[action.payload.sessionId],
            questions_left: action.payload.questionsLeft,
            last_accessed: Date.now(),
          }
        }
      };

    case 'CLEANUP_OLD_SESSIONS':
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      const activeSessions = Object.fromEntries(
        Object.entries(state.sessions).filter(([_, session]) => 
          now - session.last_accessed < maxAge
        )
      );
      return {
        ...state,
        sessions: activeSessions,
        currentSessionId: activeSessions[state.currentSessionId || ''] ? state.currentSessionId : null
      };

    case 'LOAD_FROM_STORAGE':
      return action.payload;

    default:
      return state;
  }
};

// Context
interface DrillContextValue {
  state: DrillState;
  createSession: (sessionId: string, data: Omit<DrillSession, 'created_at' | 'last_accessed'>) => void;
  updateSession: (sessionId: string, data: Partial<DrillSession>) => void;
  setCurrentSession: (sessionId: string) => void;
  removeSession: (sessionId: string) => void;
  updateQuestionsLeft: (sessionId: string, questionsLeft: QuestionLeft[]) => void;
  getCurrentSession: () => DrillSession | null;
  getSession: (sessionId: string) => DrillSession | null;
  generateSessionId: (examScheduleId: number, examId: number, topicId: number) => string;
  cleanupOldSessions: () => void;
}

const DrillContext = createContext<DrillContextValue | undefined>(undefined);

// Provider
interface DrillProviderProps {
  children: ReactNode;
}

export const DrillProvider: React.FC<DrillProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(drillReducer, {
    sessions: {},
    currentSessionId: null
  });

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('drillSessions');
        if (stored) {
          const parsedState = JSON.parse(stored) as DrillState;
          dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedState });
        }
      } catch (error) {
        console.error('Error loading drill sessions from storage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('drillSessions', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving drill sessions to storage:', error);
      }
    }
  }, [state]);

  // Cleanup old sessions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'CLEANUP_OLD_SESSIONS' });
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, []);

  const createSession = (sessionId: string, data: Omit<DrillSession, 'created_at' | 'last_accessed'>) => {
    dispatch({ type: 'CREATE_SESSION', payload: { sessionId, data } });
  };

  const updateSession = (sessionId: string, data: Partial<DrillSession>) => {
    dispatch({ type: 'UPDATE_SESSION', payload: { sessionId, data } });
  };

  const setCurrentSession = (sessionId: string) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: sessionId });
  };

  const removeSession = (sessionId: string) => {
    dispatch({ type: 'REMOVE_SESSION', payload: sessionId });
  };

  const updateQuestionsLeft = (sessionId: string, questionsLeft: QuestionLeft[]) => {
    dispatch({ type: 'UPDATE_QUESTIONS_LEFT', payload: { sessionId, questionsLeft } });
  };

  const getCurrentSession = (): DrillSession | null => {
    if (!state.currentSessionId) return null;
    return state.sessions[state.currentSessionId] || null;
  };

  const getSession = (sessionId: string): DrillSession | null => {
    return state.sessions[sessionId] || null;
  };

  const generateSessionId = (examScheduleId: number, examId: number, topicId: number): string => {
    return `drill_${examScheduleId}_${examId}_${topicId}_${Date.now()}`;
  };

  const cleanupOldSessions = () => {
    dispatch({ type: 'CLEANUP_OLD_SESSIONS' });
  };

  const value: DrillContextValue = {
    state,
    createSession,
    updateSession,
    setCurrentSession,
    removeSession,
    updateQuestionsLeft,
    getCurrentSession,
    getSession,
    generateSessionId,
    cleanupOldSessions
  };

  return (
    <DrillContext.Provider value={value}>
      {children}
    </DrillContext.Provider>
  );
};

// Hook
export const useDrill = (): DrillContextValue => {
  const context = useContext(DrillContext);
  if (!context) {
    throw new Error('useDrill must be used within a DrillProvider');
  }
  return context;
};

// Helper hook for current session
export const useCurrentDrillSession = () => {
  const { getCurrentSession, state } = useDrill();
  const currentSession = getCurrentSession();
  
  return {
    session: currentSession,
    isActive: !!currentSession,
    sessionId: state.currentSessionId
  };
};