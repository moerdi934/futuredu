// utils/EnhancedExamDBService.ts
import { IDBPDatabase } from 'idb';

interface ExamData {
  // Basic exam info
  examString: string;
  examId: number;
  startTime: number;
  
  // Answers
  answers: Record<number, any>;
  
  // Question timing
  questionTimes: Record<number, number>; // questionId -> total seconds spent
  currentQuestion: {
    id: number | null;
    startTime: number;
  };
  
  // Metadata
  lastSaveTime: number;
  version: number;
}

type StubDB = {
  put: (..._: any[]) => Promise<void>;
  get: (..._: any[]) => Promise<any>;
  getAll: (..._: any[]) => Promise<any[]>;
  delete: (..._: any[]) => Promise<void>;
  clear: (..._: any[]) => Promise<void>;
};

function createStubDB(): StubDB {
  const noop = async () => {};
  const noopArr = async () => [];
  return { put: noop, get: noop, getAll: noopArr, delete: noop, clear: noop };
}

class EnhancedExamDBService {
  private dbName = 'examAppDb';
  private dbVersion = 2; // Incremented for new schema
  public db: Promise<IDBPDatabase | StubDB>;

  constructor() {
    this.db = this.initDatabase();
  }

  private async initDatabase(): Promise<IDBPDatabase | StubDB> {
    if (typeof window === 'undefined') {
      return createStubDB();
    }

    const { openDB } = await import('idb');
    return openDB(this.dbName, this.dbVersion, {
      upgrade(db, oldVersion, newVersion) {
        // Create or recreate store for new schema
        if (oldVersion < 2) {
          if (db.objectStoreNames.contains('examData')) {
            db.deleteObjectStore('examData');
          }
          db.createObjectStore('examData');
        }
      },
    });
  }

  // Initialize exam data
  async initializeExam(examString: string, examId: number): Promise<void> {
    const db = await this.db;
    
    const initialData: ExamData = {
      examString,
      examId,
      startTime: Date.now(),
      answers: {},
      questionTimes: {},
      currentQuestion: {
        id: null,
        startTime: 0
      },
      lastSaveTime: 0,
      version: 2
    };
    
    await db.put('examData', initialData, examString);
  }

  // Get full exam data
  async getExamData(examString: string): Promise<ExamData | null> {
    const db = await this.db;
    const data = await db.get('examData', examString);
    
    // Migration: if old format, return null to force re-initialization
    if (data && (!data.version || data.version < 2)) {
      await this.deleteExamData(examString);
      return null;
    }
    
    return data;
  }

  // Save answers
  async saveAnswers(examString: string, answers: Record<number, any>): Promise<void> {
    const db = await this.db;
    let data = await this.getExamData(examString);
    
    if (!data) {
      throw new Error('Exam not initialized');
    }
    
    data.answers = { ...answers };
    data.lastSaveTime = Date.now();
    
    await db.put('examData', data, examString);
  }

  // Get answers
  async getAnswers(examString: string): Promise<Record<number, any> | null> {
    const data = await this.getExamData(examString);
    return data ? data.answers : null;
  }

  // Save question times
  async saveQuestionTimes(examString: string, questionTimes: Record<number, number>): Promise<void> {
    const db = await this.db;
    let data = await this.getExamData(examString);
    
    if (!data) {
      throw new Error('Exam not initialized');
    }
    
    data.questionTimes = { ...questionTimes };
    data.lastSaveTime = Date.now();
    
    await db.put('examData', data, examString);
  }

  // Get question times
  async getQuestionTimes(examString: string): Promise<Record<number, number>> {
    const data = await this.getExamData(examString);
    return data ? data.questionTimes : {};
  }

  // Update single question time
  async updateQuestionTime(examString: string, questionId: number, additionalSeconds: number): Promise<void> {
    if (!Number.isFinite(additionalSeconds) || additionalSeconds < 0) {
      return;
    }

    const db = await this.db;
    let data = await this.getExamData(examString);
    
    if (!data) {
      throw new Error('Exam not initialized');
    }
    
    data.questionTimes[questionId] = (data.questionTimes[questionId] || 0) + Math.floor(additionalSeconds);
    data.lastSaveTime = Date.now();
    
    await db.put('examData', data, examString);
  }

  // Set current question
  async setCurrentQuestion(examString: string, questionId: number | null): Promise<void> {
    const db = await this.db;
    let data = await this.getExamData(examString);
    
    if (!data) {
      throw new Error('Exam not initialized');
    }
    
    data.currentQuestion = {
      id: questionId,
      startTime: questionId ? Date.now() : 0
    };
    data.lastSaveTime = Date.now();
    
    await db.put('examData', data, examString);
  }

  // Get current question
  async getCurrentQuestion(examString: string): Promise<{ id: number | null; startTime: number } | null> {
    const data = await this.getExamData(examString);
    return data ? data.currentQuestion : null;
  }

  // Save complete exam state
  async saveExamState(examString: string, answers: Record<number, any>, questionTimes: Record<number, number>): Promise<void> {
    const db = await this.db;
    let data = await this.getExamData(examString);
    
    if (!data) {
      throw new Error('Exam not initialized');
    }
    
    data.answers = { ...answers };
    data.questionTimes = { ...questionTimes };
    data.lastSaveTime = Date.now();
    
    await db.put('examData', data, examString);
  }

  // Check if exam exists
  async hasExamData(examString: string): Promise<boolean> {
    const data = await this.getExamData(examString);
    return data !== null;
  }

  // Delete exam data
  async deleteExamData(examString: string): Promise<void> {
    const db = await this.db;
    await db.delete('examData', examString);
  }

  // Get exam metadata
  async getExamMetadata(examString: string): Promise<{
    startTime: number;
    lastSaveTime: number;
    totalQuestions: number;
    answeredQuestions: number;
    totalTimeSpent: number;
  } | null> {
    const data = await this.getExamData(examString);
    
    if (!data) return null;
    
    const totalQuestions = Object.keys(data.questionTimes).length;
    const answeredQuestions = Object.keys(data.answers).filter(key => {
      const answer = data.answers[parseInt(key)];
      return answer !== undefined && answer !== null && answer !== '';
    }).length;
    
    const totalTimeSpent = Object.values(data.questionTimes).reduce((sum, time) => sum + time, 0);
    
    return {
      startTime: data.startTime,
      lastSaveTime: data.lastSaveTime,
      totalQuestions,
      answeredQuestions,
      totalTimeSpent
    };
  }

  // Clear all exam data (for debugging)
  async clearAllData(): Promise<void> {
    const db = await this.db;
    await db.clear('examData');
  }

  // Get all stored exams (for debugging)
  async getAllExams(): Promise<string[]> {
    const db = await this.db;
    const allData = await db.getAll('examData');
    return allData.map(data => data.examString).filter(Boolean);
  }
}

// Export singleton instance
const enhancedExamDBService = new EnhancedExamDBService();
export default enhancedExamDBService;