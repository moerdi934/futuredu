// utils/SimpleExamDBService.ts
import { IDBPDatabase } from 'idb';

interface ExamData {
  // Basic exam info
  examString: string;
  examId: number;
  startTime: number;
  
  // Timer data
  globalStartTime: number;
  globalElapsedTime: number; // Total seconds elapsed
  totalDuration: number; // Total exam duration in seconds
  
  // Question timing
  questionElapsedTimes: Record<number, number>; // questionId -> total seconds spent
  currentQuestionId: number | null;
  currentQuestionStartTime: number;
  
  // Answers
  answers: Record<number, any>;
  
  // Metadata
  lastSaveTime: number;
  isRunning: boolean;
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

class SimpleExamDBService {
  private dbName = 'simpleExamDb';
  private dbVersion = 1;
  public db: Promise<IDBPDatabase | StubDB>;

  constructor() {
    this.db = this.initDatabase();
  }

  private async initDatabase(): Promise<IDBPDatabase | StubDB> {
    if (typeof window === 'undefined') {
      console.log('🔧 SimpleExamDB: Server-side detected, using stub DB');
      return createStubDB();
    }

    try {
      const { openDB } = await import('idb');
      console.log('🔧 SimpleExamDB: Initializing IndexedDB...');
      
      return openDB(this.dbName, this.dbVersion, {
        upgrade(db, oldVersion, newVersion) {
          console.log('🔧 SimpleExamDB: Upgrading database from', oldVersion, 'to', newVersion);
          
          if (!db.objectStoreNames.contains('examData')) {
            const store = db.createObjectStore('examData', { keyPath: 'examString' });
            console.log('🔧 SimpleExamDB: Created examData store');
          }
        },
      });
    } catch (error) {
      console.error('🚨 SimpleExamDB: Failed to initialize IndexedDB:', error);
      return createStubDB();
    }
  }

  // Initialize new exam
  async initializeExam(examString: string, examId: number, totalMinutes: number): Promise<ExamData> {
    console.log('🚀 SimpleExamDB: Initializing exam:', { examString, examId, totalMinutes });
    
    const now = Date.now();
    const initialData: ExamData = {
      examString,
      examId,
      startTime: now,
      globalStartTime: now,
      globalElapsedTime: 0,
      totalDuration: totalMinutes * 60, // Convert to seconds
      questionElapsedTimes: {},
      currentQuestionId: null,
      currentQuestionStartTime: 0,
      answers: {},
      lastSaveTime: now,
      isRunning: false,
      version: 1
    };
    
    const db = await this.db;
    await db.put('examData', initialData);
    
    console.log('✅ SimpleExamDB: Exam initialized successfully');
    return initialData;
  }

  // Get exam data
  async getExamData(examString: string): Promise<ExamData | null> {
    try {
      const db = await this.db;
      const data = await db.get('examData', examString);
      
      if (data) {
        console.log('📖 SimpleExamDB: Retrieved exam data:', {
          examString,
          globalElapsed: data.globalElapsedTime,
          totalDuration: data.totalDuration,
          isRunning: data.isRunning,
          answersCount: Object.keys(data.answers || {}).length,
          questionTimesCount: Object.keys(data.questionElapsedTimes || {}).length
        });
      } else {
        console.log('📖 SimpleExamDB: No data found for exam:', examString);
      }
      
      return data || null;
    } catch (error) {
      console.error('🚨 SimpleExamDB: Error getting exam data:', error);
      return null;
    }
  }

  // Update global elapsed time
  async updateGlobalElapsedTime(examString: string, elapsedSeconds: number): Promise<void> {
    console.log('⏱️ SimpleExamDB: Updating global elapsed time:', { examString, elapsedSeconds });
    
    try {
      const data = await this.getExamData(examString);
      if (!data) {
        console.warn('⚠️ SimpleExamDB: Cannot update elapsed time - exam not found');
        return;
      }
      
      data.globalElapsedTime = Math.max(0, Math.floor(elapsedSeconds));
      data.lastSaveTime = Date.now();
      
      const db = await this.db;
      await db.put('examData', data);
      
      console.log('✅ SimpleExamDB: Global elapsed time updated:', data.globalElapsedTime);
    } catch (error) {
      console.error('🚨 SimpleExamDB: Error updating global elapsed time:', error);
    }
  }

  // Start/stop exam timer
  async setExamRunning(examString: string, isRunning: boolean): Promise<void> {
    console.log('▶️ SimpleExamDB: Setting exam running state:', { examString, isRunning });
    
    try {
      const data = await this.getExamData(examString);
      if (!data) {
        console.warn('⚠️ SimpleExamDB: Cannot set running state - exam not found');
        return;
      }
      
      data.isRunning = isRunning;
      data.lastSaveTime = Date.now();
      
      const db = await this.db;
      await db.put('examData', data);
      
      console.log('✅ SimpleExamDB: Exam running state updated:', isRunning);
    } catch (error) {
      console.error('🚨 SimpleExamDB: Error setting exam running state:', error);
    }
  }

  // Update current question and finalize previous question time
  async updateCurrentQuestion(examString: string, questionId: number | null): Promise<void> {
    console.log('🔄 SimpleExamDB: Updating current question:', { examString, questionId });
    
    try {
      const data = await this.getExamData(examString);
      if (!data) {
        console.warn('⚠️ SimpleExamDB: Cannot update current question - exam not found');
        return;
      }
      
      const now = Date.now();
      
      // Finalize previous question time if exists
      if (data.currentQuestionId !== null && data.currentQuestionStartTime > 0) {
        const previousElapsed = Math.floor((now - data.currentQuestionStartTime) / 1000);
        const previousTotal = (data.questionElapsedTimes[data.currentQuestionId] || 0) + previousElapsed;
        data.questionElapsedTimes[data.currentQuestionId] = previousTotal;
        
        console.log('📊 SimpleExamDB: Finalized question time:', {
          questionId: data.currentQuestionId,
          sessionTime: previousElapsed,
          totalTime: previousTotal
        });
      }
      
      // Set new current question
      data.currentQuestionId = questionId;
      data.currentQuestionStartTime = questionId !== null ? now : 0;
      data.lastSaveTime = now;
      
      const db = await this.db;
      await db.put('examData', data);
      
      console.log('✅ SimpleExamDB: Current question updated to:', questionId);
    } catch (error) {
      console.error('🚨 SimpleExamDB: Error updating current question:', error);
    }
  }

  // Get current question elapsed time (live calculation)
  async getCurrentQuestionElapsed(examString: string): Promise<number> {
    try {
      const data = await this.getExamData(examString);
      if (!data || data.currentQuestionId === null || data.currentQuestionStartTime === 0) {
        return 0;
      }
      
      const now = Date.now();
      const currentSessionTime = Math.floor((now - data.currentQuestionStartTime) / 1000);
      const previousTime = data.questionElapsedTimes[data.currentQuestionId] || 0;
      
      return previousTime + currentSessionTime;
    } catch (error) {
      console.error('🚨 SimpleExamDB: Error getting current question elapsed:', error);
      return 0;
    }
  }

  // Get all question elapsed times
  async getAllQuestionTimes(examString: string): Promise<Record<number, number>> {
    try {
      const data = await this.getExamData(examString);
      if (!data) return {};
      
      const times = { ...data.questionElapsedTimes };
      
      // Add current question time if active
      if (data.currentQuestionId !== null && data.currentQuestionStartTime > 0) {
        const now = Date.now();
        const currentSessionTime = Math.floor((now - data.currentQuestionStartTime) / 1000);
        const previousTime = times[data.currentQuestionId] || 0;
        times[data.currentQuestionId] = previousTime + currentSessionTime;
      }
      
      return times;
    } catch (error) {
      console.error('🚨 SimpleExamDB: Error getting all question times:', error);
      return {};
    }
  }

  // Save answers
  async saveAnswers(examString: string, answers: Record<number, any>): Promise<void> {
    console.log('💾 SimpleExamDB: Saving answers:', { examString, count: Object.keys(answers).length });
    
    try {
      const data = await this.getExamData(examString);
      if (!data) {
        console.warn('⚠️ SimpleExamDB: Cannot save answers - exam not found');
        return;
      }
      
      data.answers = { ...answers };
      data.lastSaveTime = Date.now();
      
      const db = await this.db;
      await db.put('examData', data);
      
      console.log('✅ SimpleExamDB: Answers saved successfully');
    } catch (error) {
      console.error('🚨 SimpleExamDB: Error saving answers:', error);
    }
  }

  // Get answers
  async getAnswers(examString: string): Promise<Record<number, any>> {
    try {
      const data = await this.getExamData(examString);
      return data ? data.answers : {};
    } catch (error) {
      console.error('🚨 SimpleExamDB: Error getting answers:', error);
      return {};
    }
  }

  // Calculate remaining time
  getRemainingTime(data: ExamData): number {
    if (!data) return 0;
    return Math.max(0, data.totalDuration - data.globalElapsedTime);
  }

  // Check if time expired
  isTimeExpired(data: ExamData): boolean {
    return this.getRemainingTime(data) <= 0;
  }

  // Format time for display
  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Delete exam data
  async deleteExamData(examString: string): Promise<void> {
    console.log('🗑️ SimpleExamDB: Deleting exam data:', examString);
    
    try {
      const db = await this.db;
      await db.delete('examData', examString);
      console.log('✅ SimpleExamDB: Exam data deleted successfully');
    } catch (error) {
      console.error('🚨 SimpleExamDB: Error deleting exam data:', error);
    }
  }

  // Clear all data (for debugging)
  async clearAllData(): Promise<void> {
    console.log('🗑️ SimpleExamDB: Clearing all exam data');
    
    try {
      const db = await this.db;
      await db.clear('examData');
      console.log('✅ SimpleExamDB: All exam data cleared');
    } catch (error) {
      console.error('🚨 SimpleExamDB: Error clearing all data:', error);
    }
  }

  // Get exam summary for debugging
  async getExamSummary(examString: string): Promise<any> {
    try {
      const data = await this.getExamData(examString);
      if (!data) return null;
      
      const summary = {
        examString: data.examString,
        examId: data.examId,
        isRunning: data.isRunning,
        globalElapsedTime: data.globalElapsedTime,
        totalDuration: data.totalDuration,
        remainingTime: this.getRemainingTime(data),
        isExpired: this.isTimeExpired(data),
        currentQuestionId: data.currentQuestionId,
        answersCount: Object.keys(data.answers).length,
        questionTimesCount: Object.keys(data.questionElapsedTimes).length,
        totalQuestionTime: Object.values(data.questionElapsedTimes).reduce((sum, time) => sum + time, 0),
        lastSaveTime: new Date(data.lastSaveTime).toLocaleTimeString(),
        formattedRemaining: this.formatTime(this.getRemainingTime(data))
      };
      
      console.log('📊 SimpleExamDB: Exam summary:', summary);
      return summary;
    } catch (error) {
      console.error('🚨 SimpleExamDB: Error getting exam summary:', error);
      return null;
    }
  }
}

// Export singleton instance
const simpleExamDBService = new SimpleExamDBService();
export default simpleExamDBService;