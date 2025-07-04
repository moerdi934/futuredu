// context/ExamContext.tsx
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
  
  // Setters
  setTopicId: (id: number | null) => void;
  setExamScheduleId: (id: number | null) => void;
  setExamOrder: (order: ExamOrder[]) => void;
  setExamSessions: (sessions: ExamSession[]) => void;
  setActiveSession: (session: ExamSession | null) => void;
  setSelectedSchedule: (schedule: ExamSchedule | null) => void;
  setExamType: (type: string) => void;
  setOriginPath: (path: string | null) => void;
  
  // Utilities
  clearExamData: () => void;
  isDataComplete: () => boolean;
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
  }, []);
  
  const isDataComplete = useCallback(() => {
    return examScheduleId !== null && examOrder.length > 0;
  }, [examScheduleId, examOrder]);
  
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
    
    // Setters
    setTopicId,
    setExamScheduleId,
    setExamOrder,
    setExamSessions,
    setActiveSession,
    setSelectedSchedule,
    setExamType,
    setOriginPath,
    
    // Utilities
    clearExamData,
    isDataComplete
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