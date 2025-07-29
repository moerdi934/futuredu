// context/ExamContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
  
  // Logging untuk setiap perubahan state
  useEffect(() => {
    console.log('🆔 ExamContext: topicId updated:', topicId);
  }, [topicId]);

  useEffect(() => {
    console.log('📅 ExamContext: examScheduleId updated:', examScheduleId);
  }, [examScheduleId]);

  useEffect(() => {
    console.log('📝 ExamContext: examOrder updated:', {
      count: examOrder.length,
      data: examOrder
    });
  }, [examOrder]);

  useEffect(() => {
    console.log('💾 ExamContext: examSessions updated:', {
      count: examSessions.length,
      data: examSessions
    });
  }, [examSessions]);

  useEffect(() => {
    console.log('🎯 ExamContext: activeSession updated:', activeSession);
  }, [activeSession]);

  useEffect(() => {
    console.log('📋 ExamContext: selectedSchedule updated:', selectedSchedule);
  }, [selectedSchedule]);

  useEffect(() => {
    console.log('🏷️ ExamContext: examType updated:', examType);
  }, [examType]);

  useEffect(() => {
    console.log('🛤️ ExamContext: originPath updated:', originPath);
  }, [originPath]);

  // Log comprehensive context state when any critical data changes
  useEffect(() => {
    console.log('🔄 ExamContext: Context state summary:', {
      topicId,
      examScheduleId,
      examOrderCount: examOrder.length,
      examSessionsCount: examSessions.length,
      hasActiveSession: !!activeSession,
      hasSelectedSchedule: !!selectedSchedule,
      examType,
      originPath,
      isComplete: examScheduleId !== null && examOrder.length > 0
    });
  }, [topicId, examScheduleId, examOrder, examSessions, activeSession, selectedSchedule, examType, originPath]);
  
  // Utilities
  const clearExamData = useCallback(() => {
    console.log('🗑️ ExamContext: Clearing all exam data');
    setTopicId(null);
    setExamScheduleId(null);
    setExamOrder([]);
    setExamSessions([]);
    setActiveSession(null);
    setSelectedSchedule(null);
    setExamType('Try-Out');
    setOriginPath(null);
    console.log('✅ ExamContext: All exam data cleared');
  }, []);
  
  const isDataComplete = useCallback(() => {
    const complete = examScheduleId !== null && examOrder.length > 0;
    console.log('🔍 ExamContext: Data completeness check:', {
      examScheduleId,
      examOrderLength: examOrder.length,
      isComplete: complete
    });
    return complete;
  }, [examScheduleId, examOrder]);

  // Enhanced setters dengan logging
  const enhancedSetTopicId = useCallback((id: number | null) => {
    console.log('🔄 ExamContext: Setting topicId from', topicId, 'to', id);
    setTopicId(id);
  }, [topicId]);

  const enhancedSetExamScheduleId = useCallback((id: number | null) => {
    console.log('🔄 ExamContext: Setting examScheduleId from', examScheduleId, 'to', id);
    setExamScheduleId(id);
  }, [examScheduleId]);

  const enhancedSetExamOrder = useCallback((order: ExamOrder[]) => {
    console.log('🔄 ExamContext: Setting examOrder from', examOrder.length, 'items to', order.length, 'items');
    setExamOrder(order);
  }, [examOrder.length]);

  const enhancedSetExamSessions = useCallback((sessions: ExamSession[]) => {
    console.log('🔄 ExamContext: Setting examSessions from', examSessions.length, 'items to', sessions.length, 'items');
    setExamSessions(sessions);
  }, [examSessions.length]);

  const enhancedSetActiveSession = useCallback((session: ExamSession | null) => {
    console.log('🔄 ExamContext: Setting activeSession from', activeSession?.id, 'to', session?.id);
    setActiveSession(session);
  }, [activeSession?.id]);

  const enhancedSetSelectedSchedule = useCallback((schedule: ExamSchedule | null) => {
    console.log('🔄 ExamContext: Setting selectedSchedule from', selectedSchedule?.id, 'to', schedule?.id);
    setSelectedSchedule(schedule);
  }, [selectedSchedule?.id]);

  const enhancedSetExamType = useCallback((type: string) => {
    console.log('🔄 ExamContext: Setting examType from', examType, 'to', type);
    setExamType(type);
  }, [examType]);

  const enhancedSetOriginPath = useCallback((path: string | null) => {
    console.log('🔄 ExamContext: Setting originPath from', originPath, 'to', path);
    setOriginPath(path);
  }, [originPath]);
  
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
    
    // Enhanced setters with logging
    setTopicId: enhancedSetTopicId,
    setExamScheduleId: enhancedSetExamScheduleId,
    setExamOrder: enhancedSetExamOrder,
    setExamSessions: enhancedSetExamSessions,
    setActiveSession: enhancedSetActiveSession,
    setSelectedSchedule: enhancedSetSelectedSchedule,
    setExamType: enhancedSetExamType,
    setOriginPath: enhancedSetOriginPath,
    
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