'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

// Types
interface ExamOrder {
  exam_id: number;
  exam_string: string;
  name: string;
  duration: number;
  start_time?: string;
  end_time?: string;
  is_submitted?: boolean;
  examType: string;
}

interface ExamSchedule {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

interface ExamSession {
  id: number;
  exam_schedule_id: number;
  exam_id: number | string;
  user_id: number;
  answers: any;
  is_submitted: boolean;
  last_save: string;
  start_time: string;
  end_time: string;
  is_auto_move: boolean;
  minute_exam: number;
}

interface TimerSyncData {
  serverEndTime: string;
  serverRemainingTime: number;
  lastSyncTime: number;
  timeDifference: number;
}

interface ExamContextType {
  // Data
  topicId: number | null;
  examScheduleId: number | null;
  examOrder: ExamOrder[];
  examSessions: ExamSession[];
  activeSession: ExamSession | null;
  selectedSchedule: ExamSchedule | null;
  examType: string;
  originPath: string | null;
  timerSync: TimerSyncData | null;
  
  // Setters
  setTopicId: (id: number | null) => void;
  setExamScheduleId: (id: number | null) => void;
  setExamOrder: (order: ExamOrder[]) => void;
  setExamSessions: (sessions: ExamSession[]) => void;
  setActiveSession: (session: ExamSession | null) => void;
  setSelectedSchedule: (schedule: ExamSchedule | null) => void;
  setExamType: (type: string) => void;
  setOriginPath: (path: string | null) => void;
  setTimerSync: (sync: TimerSyncData | null) => void;
  
  // Utilities
  clearExamData: () => void;
  isDataComplete: () => boolean;
  updateTimerFromServer: (serverEndTime: string) => TimerSyncData | null;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [topicId, setTopicId] = useState<number | null>(null);
  const [examScheduleId, setExamScheduleId] = useState<number | null>(null);
  const [examOrder, setExamOrder] = useState<ExamOrder[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);
  const [examType, setExamType] = useState<string>('Try-Out');
  const [originPath, setOriginPath] = useState<string | null>(null);
  const [timerSync, setTimerSync] = useState<TimerSyncData | null>(null);
  
  // Utilities
  const clearExamData = useCallback(() => {
    setTopicId(null);
    setExamScheduleId(null);
    setExamOrder([]);
    setExamSessions([]);
    setActiveSession(null);
    setSelectedSchedule(null);
    setExamType('Try-Out');
    setOriginPath(null);
    setTimerSync(null);
  }, []);
  
  const isDataComplete = useCallback(() => {
    return examScheduleId !== null && examOrder.length > 0;
  }, [examScheduleId, examOrder]);

  // Timer sync utility
  const updateTimerFromServer = useCallback((serverEndTime: string): TimerSyncData | null => {
    const serverEndTimeMs = new Date(serverEndTime).getTime();
    const currentTime = Date.now();
    const serverRemainingTime = Math.max(0, Math.floor((serverEndTimeMs - currentTime) / 1000));
    
    const syncData: TimerSyncData = {
      serverEndTime,
      serverRemainingTime,
      lastSyncTime: currentTime,
      timeDifference: 0 // Will be calculated by consumer
    };
    
    setTimerSync(syncData);
    return syncData;
  }, []);
  
  const contextValue: ExamContextType = {
    // Data
    topicId,
    examScheduleId,
    examOrder,
    examSessions,
    activeSession,
    selectedSchedule,
    examType,
    originPath,
    timerSync,
    
    // Setters
    setTopicId,
    setExamScheduleId,
    setExamOrder,
    setExamSessions,
    setActiveSession,
    setSelectedSchedule,
    setExamType,
    setOriginPath,
    setTimerSync,
    
    // Utilities
    clearExamData,
    isDataComplete,
    updateTimerFromServer
  };
  
  return (
    <ExamContext.Provider value={contextValue}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};