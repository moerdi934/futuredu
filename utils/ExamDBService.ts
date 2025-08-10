// utils/ExamDBService.ts - COMPLETE FINAL VERSION - Enhanced Question Elapsed Time Management
import { IDBPDatabase } from 'idb';

interface ExamData {
  answers: Record<number, any>;
  startTime: number;
  questionElapsedTimes: Record<number, number>;
  lastQuestionVisit: {
    questionId: number;
    startTime: number;
    lastUpdateTime: number;
  } | null;
  examString: string;
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

class ExamDbService {
  private dbName = 'examAppDb';
  private dbVersion = 3; // Incremented for enhanced question timing
  public db: Promise<IDBPDatabase | StubDB>;
  private readonly DATA_VERSION = 3;
  private debugMode = false;

  constructor() {
    this.db = this.initDatabase();
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  private log(message: string, data?: any): void {
    if (this.debugMode) {
      const timestamp = new Date().toISOString();
      console.log(`📊 [ExamDB ${timestamp}] ${message}`, data || '');
    }
  }

  private error(message: string, error?: any): void {
    const timestamp = new Date().toISOString();
    console.error(`❌ [ExamDB ${timestamp}] ${message}`, error || '');
  }

  private async initDatabase(): Promise<IDBPDatabase | StubDB> {
    if (typeof window === 'undefined') {
      this.log('Server-side detected, using stub DB');
      return createStubDB();
    }

    try {
      const { openDB } = await import('idb');
      this.log('Initializing IndexedDB...');
      
      return openDB(this.dbName, this.dbVersion, {
        upgrade(db, oldVersion, newVersion) {
          console.log(`📈 ExamDB upgrade: ${oldVersion} → ${newVersion}`);
          
          if (!db.objectStoreNames.contains('examData')) {
            console.log('🆕 Creating examData object store');
            db.createObjectStore('examData');
          }
        },
      });
    } catch (error) {
      this.error('Failed to initialize IndexedDB', error);
      return createStubDB();
    }
  }

  private createDefaultExamData(examString: string): ExamData {
    const defaultData = {
      answers: {},
      startTime: Date.now(),
      questionElapsedTimes: {},
      lastQuestionVisit: null,
      examString: examString,
      version: this.DATA_VERSION
    };
    
    this.log('Creating default exam data', { examString, defaultData });
    return defaultData;
  }

  private validateAndMigrateData(data: any, examString: string): ExamData {
    if (!data) {
      this.log('No existing data, creating new', { examString });
      return this.createDefaultExamData(examString);
    }

    const validatedData: ExamData = {
      answers: data.answers || {},
      startTime: data.startTime || Date.now(),
      questionElapsedTimes: data.questionElapsedTimes || {},
      lastQuestionVisit: data.lastQuestionVisit || null,
      examString: data.examString || examString,
      version: data.version || 1
    };

    if (validatedData.version < this.DATA_VERSION) {
      this.log(`Migrating data from v${validatedData.version} to v${this.DATA_VERSION}`);
      validatedData.version = this.DATA_VERSION;
      
      // Ensure questionElapsedTimes is always an object
      if (!validatedData.questionElapsedTimes || typeof validatedData.questionElapsedTimes !== 'object') {
        validatedData.questionElapsedTimes = {};
        this.log('Fixed questionElapsedTimes structure');
      }
      
      // Ensure all elapsed times are valid numbers
      for (const [qId, time] of Object.entries(validatedData.questionElapsedTimes)) {
        if (!Number.isFinite(time) || Number(time) < 0) {
          validatedData.questionElapsedTimes[parseInt(qId)] = 0;
          this.log('Fixed invalid elapsed time', { questionId: qId, invalidTime: time });
        }
      }
    }

    this.log('Data validated and migrated', { 
      examString,
      answersCount: Object.keys(validatedData.answers).length,
      elapsedTimesCount: Object.keys(validatedData.questionElapsedTimes).length,
      version: validatedData.version
    });

    return validatedData;
  }

  // ===== ANSWERS MANAGEMENT =====

  async saveAnswers(examString: string, answers: Record<number, any>): Promise<void> {
    if (!examString) {
      this.error('saveAnswers: Invalid examString');
      return;
    }

    try {
      this.log('Saving answers', { examString: examString.substring(0, 10) + '...', count: Object.keys(answers).length });
      
      const db = await this.db;
      const existingData = await db.get('examData', examString);
      const data = this.validateAndMigrateData(existingData, examString);
      
      data.answers = answers;
      await db.put('examData', data, examString);
      
      this.log('Answers saved successfully');
    } catch (error) {
      this.error('Error saving answers', error);
    }
  }

  async getAnswers(examString: string): Promise<Record<number, any> | null> {
    if (!examString) {
      this.error('getAnswers: Invalid examString');
      return null;
    }

    try {
      const data = await this.getExamData(examString);
      const answers = data ? data.answers : null;
      this.log('Retrieved answers', { 
        examString: examString.substring(0, 10) + '...', 
        count: answers ? Object.keys(answers).length : 0 
      });
      return answers;
    } catch (error) {
      this.error('Error getting answers', error);
      return null;
    }
  }

  // ===== START TIME MANAGEMENT =====

  async saveStartTime(examString: string, startTime: number): Promise<void> {
    if (!examString || !Number.isFinite(startTime)) {
      this.error('saveStartTime: Invalid parameters', { examString: !!examString, startTime });
      return;
    }

    try {
      this.log('Saving start time', { 
        examString: examString.substring(0, 10) + '...', 
        startTime: new Date(startTime).toLocaleString() 
      });
      
      const db = await this.db;
      const existingData = await db.get('examData', examString);
      const data = this.validateAndMigrateData(existingData, examString);
      
      data.startTime = startTime;
      await db.put('examData', data, examString);
      
      this.log('Start time saved successfully');
    } catch (error) {
      this.error('Error saving start time', error);
    }
  }

  async getStartTime(examString: string): Promise<number | null> {
    if (!examString) {
      this.error('getStartTime: Invalid examString');
      return null;
    }

    try {
      const data = await this.getExamData(examString);
      const startTime = data ? data.startTime : null;
      this.log('Retrieved start time', { 
        examString: examString.substring(0, 10) + '...', 
        startTime: startTime ? new Date(startTime).toLocaleString() : null 
      });
      return startTime;
    } catch (error) {
      this.error('Error getting start time', error);
      return null;
    }
  }

  // ===== ENHANCED QUESTION ELAPSED TIME MANAGEMENT =====

  /**
   * Set question elapsed time directly (for current tracking)
   * This is the primary method for updating question times
   */
  async setQuestionElapsedTime(examString: string, questionId: number, elapsedTimeSeconds: number): Promise<Record<number, number>> {
    this.log('setQuestionElapsedTime called', { 
      examString: examString?.substring(0, 10) + '...', 
      questionId, 
      elapsedTimeSeconds 
    });

    // Ultra-robust validation
    if (!examString || typeof examString !== 'string') {
      this.error('Invalid examString', { examString });
      return {};
    }

    if (!Number.isFinite(questionId) || questionId <= 0) {
      this.error('Invalid questionId', { questionId });
      return {};
    }

    if (!Number.isFinite(elapsedTimeSeconds) || elapsedTimeSeconds < 0) {
      this.error('Invalid elapsedTimeSeconds', { elapsedTimeSeconds });
      return {};
    }

    try {
      const db = await this.db;
      const existingData = await db.get('examData', examString);
      const data = this.validateAndMigrateData(existingData, examString);

      this.log('Setting elapsed time', {
        questionId,
        newElapsedTime: elapsedTimeSeconds,
        previousElapsedTime: data.questionElapsedTimes[questionId] || 0,
        totalQuestionsTracked: Object.keys(data.questionElapsedTimes).length
      });

      // Set the elapsed time directly
      data.questionElapsedTimes[questionId] = Math.floor(elapsedTimeSeconds);

      // Update last question visit for tracking
      data.lastQuestionVisit = {
        questionId: questionId,
        startTime: data.lastQuestionVisit?.questionId === questionId 
          ? (data.lastQuestionVisit.startTime || Date.now()) 
          : Date.now(),
        lastUpdateTime: Date.now()
      };

      await db.put('examData', data, examString);
      
      this.log('Question elapsed time set successfully', {
        questionId,
        elapsedTime: data.questionElapsedTimes[questionId],
        allElapsedTimes: data.questionElapsedTimes
      });
      
      return { ...data.questionElapsedTimes };
    } catch (error) {
      this.error('Error setting question elapsed time', error);
      return {};
    }
  }

  /**
   * Update question elapsed time (alias for setQuestionElapsedTime for backward compatibility)
   */
  async updateQuestionElapsedTime(examString: string, questionId: number, totalElapsedTimeSeconds: number): Promise<Record<number, number>> {
    this.log('updateQuestionElapsedTime called (forwarding to setQuestionElapsedTime)', {
      examString: examString?.substring(0, 10) + '...',
      questionId,
      totalElapsedTimeSeconds
    });
    
    return this.setQuestionElapsedTime(examString, questionId, totalElapsedTimeSeconds);
  }

  /**
   * Add time to existing question elapsed time
   */
  async addQuestionElapsedTime(examString: string, questionId: number, additionalTimeSeconds: number): Promise<Record<number, number>> {
    this.log('addQuestionElapsedTime called', { 
      examString: examString?.substring(0, 10) + '...', 
      questionId, 
      additionalTimeSeconds 
    });

    if (!examString || !Number.isFinite(questionId) || !Number.isFinite(additionalTimeSeconds)) {
      this.error('Invalid parameters for addQuestionElapsedTime');
      return {};
    }

    if (additionalTimeSeconds <= 0) {
      this.log('No time to add (zero or negative)', { additionalTimeSeconds });
      return await this.getQuestionElapsedTimes(examString);
    }

    try {
      const db = await this.db;
      const existingData = await db.get('examData', examString);
      const data = this.validateAndMigrateData(existingData, examString);

      const currentTime = data.questionElapsedTimes[questionId] || 0;
      const newTime = currentTime + Math.floor(additionalTimeSeconds);

      this.log('Adding time to question', {
        questionId,
        currentTime,
        additionalTime: additionalTimeSeconds,
        newTime
      });

      data.questionElapsedTimes[questionId] = newTime;

      // Update last question visit
      data.lastQuestionVisit = {
        questionId: questionId,
        startTime: data.lastQuestionVisit?.questionId === questionId 
          ? (data.lastQuestionVisit.startTime || Date.now()) 
          : Date.now(),
        lastUpdateTime: Date.now()
      };

      await db.put('examData', data, examString);
      
      this.log('Time added successfully', {
        questionId,
        finalTime: newTime,
        allElapsedTimes: data.questionElapsedTimes
      });
      
      return { ...data.questionElapsedTimes };
    } catch (error) {
      this.error('Error adding question elapsed time', error);
      return {};
    }
  }

  /**
   * Get elapsed times for all questions
   */
  async getQuestionElapsedTimes(examString: string): Promise<Record<number, number>> {
    if (!examString) {
      this.error('getQuestionElapsedTimes: Invalid examString');
      return {};
    }

    try {
      const data = await this.getExamData(examString);
      
      if (!data || !data.questionElapsedTimes) {
        this.log('No questionElapsedTimes found', { examString: examString.substring(0, 10) + '...' });
        return {};
      }

      this.log('Retrieved question elapsed times', { 
        examString: examString.substring(0, 10) + '...',
        count: Object.keys(data.questionElapsedTimes).length,
        times: data.questionElapsedTimes
      });
      
      return { ...data.questionElapsedTimes };
    } catch (error) {
      this.error('Error getting question elapsed times', error);
      return {};
    }
  }
  
  /**
   * Finalize current question time and clear last visit
   */
  async finalizeCurrentQuestionTime(examString: string, finalElapsedTimeSeconds?: number): Promise<Record<number, number>> {
    this.log('finalizeCurrentQuestionTime called', { 
      examString: examString?.substring(0, 10) + '...', 
      finalElapsedTimeSeconds 
    });

    if (!examString || typeof examString !== 'string') {
      this.error('Invalid examString for finalization');
      return {};
    }

    try {
      const db = await this.db;
      const existingData = await db.get('examData', examString);
      const data = this.validateAndMigrateData(existingData, examString);

      if (!data.lastQuestionVisit) {
        this.log('No lastQuestionVisit found, returning current elapsed times');
        return { ...data.questionElapsedTimes };
      }

      const questionId = data.lastQuestionVisit.questionId;

      this.log('Finalizing question', {
        questionId,
        currentElapsedTime: data.questionElapsedTimes[questionId] || 0,
        finalElapsedTime: finalElapsedTimeSeconds,
        lastVisit: data.lastQuestionVisit
      });

      // If final elapsed time is provided, use it
      if (Number.isFinite(finalElapsedTimeSeconds) && finalElapsedTimeSeconds >= 0) {
        data.questionElapsedTimes[questionId] = Math.floor(finalElapsedTimeSeconds);
        this.log('Set final elapsed time from parameter', { 
          questionId, 
          finalTime: Math.floor(finalElapsedTimeSeconds) 
        });
      } else {
        // Calculate time since last update and add it
        const now = Date.now();
        const timeSinceLastUpdate = Math.floor((now - data.lastQuestionVisit.lastUpdateTime) / 1000);
        
        if (timeSinceLastUpdate > 0 && timeSinceLastUpdate < 3600) { // Max 1 hour
          const currentTime = data.questionElapsedTimes[questionId] || 0;
          data.questionElapsedTimes[questionId] = currentTime + timeSinceLastUpdate;
          
          this.log('Added time since last update', {
            questionId,
            timeSinceLastUpdate,
            previousTime: currentTime,
            newTime: data.questionElapsedTimes[questionId]
          });
        }
      }

      // Clear last visit since we're finalizing
      data.lastQuestionVisit = null;

      await db.put('examData', data, examString);
      
      this.log('Question time finalized successfully', {
        questionId,
        finalTime: data.questionElapsedTimes[questionId],
        allElapsedTimes: data.questionElapsedTimes
      });
      
      return { ...data.questionElapsedTimes };
    } catch (error) {
      this.error('Error finalizing question time', error);
      return {};
    }
  }

  /**
   * Get elapsed time for a specific question
   */
  async getQuestionElapsedTime(examString: string, questionId: number): Promise<number> {
    if (!examString || !Number.isFinite(questionId)) {
      this.error('getQuestionElapsedTime: Invalid parameters');
      return 0;
    }

    try {
      const allTimes = await this.getQuestionElapsedTimes(examString);
      const elapsedTime = allTimes[questionId] || 0;
      
      this.log('Retrieved specific question elapsed time', {
        examString: examString.substring(0, 10) + '...',
        questionId,
        elapsedTime
      });
      
      return elapsedTime;
    } catch (error) {
      this.error('Error getting specific question elapsed time', error);
      return 0;
    }
  }

  /**
   * Reset elapsed time for a specific question
   */
  async resetQuestionElapsedTime(examString: string, questionId: number): Promise<Record<number, number>> {
    this.log('resetQuestionElapsedTime called', { 
      examString: examString?.substring(0, 10) + '...', 
      questionId 
    });

    return this.setQuestionElapsedTime(examString, questionId, 0);
  }

  /**
   * Reset all question elapsed times
   */
  async resetAllQuestionElapsedTimes(examString: string): Promise<void> {
    if (!examString) {
      this.error('resetAllQuestionElapsedTimes: Invalid examString');
      return;
    }

    try {
      this.log('Resetting all question elapsed times', { 
        examString: examString.substring(0, 10) + '...' 
      });
      
      const db = await this.db;
      const existingData = await db.get('examData', examString);
      const data = this.validateAndMigrateData(existingData, examString);
      
      const previousCount = Object.keys(data.questionElapsedTimes).length;
      data.questionElapsedTimes = {};
      data.lastQuestionVisit = null;
      
      await db.put('examData', data, examString);
      
      this.log('All question elapsed times reset', { 
        examString: examString.substring(0, 10) + '...',
        previousCount
      });
    } catch (error) {
      this.error('Error resetting all question elapsed times', error);
    }
  }

  // ===== EXAM DATA MANAGEMENT =====

  /**
   * Get all exam data
   */
  async getExamData(examString: string): Promise<ExamData | null> {
    if (!examString) {
      this.error('getExamData: Invalid examString');
      return null;
    }

    try {
      const db = await this.db;
      const rawData = await db.get('examData', examString);
      
      if (!rawData) {
        this.log('No exam data found', { examString: examString.substring(0, 10) + '...' });
        return null;
      }

      // Always validate and migrate data when retrieving
      const validatedData = this.validateAndMigrateData(rawData, examString);
      
      this.log('Retrieved exam data', {
        examString: examString.substring(0, 10) + '...',
        answersCount: Object.keys(validatedData.answers).length,
        elapsedTimesCount: Object.keys(validatedData.questionElapsedTimes).length,
        hasLastVisit: !!validatedData.lastQuestionVisit,
        version: validatedData.version
      });

      return validatedData;
    } catch (error) {
      this.error('Error getting exam data', error);
      return null;
    }
  }

  /**
   * Delete exam data after submission
   */
  async deleteExamData(examString: string): Promise<void> {
    if (!examString) {
      this.error('deleteExamData: Invalid examString');
      return;
    }

    try {
      this.log('Deleting exam data', { examString: examString.substring(0, 10) + '...' });
      
      const db = await this.db;
      await db.delete('examData', examString);
      
      this.log('Exam data deleted successfully');
    } catch (error) {
      this.error('Error deleting exam data', error);
    }
  }

  /**
   * Check if exam data exists
   */
  async hasExamData(examString: string): Promise<boolean> {
    if (!examString) {
      this.error('hasExamData: Invalid examString');
      return false;
    }

    try {
      const db = await this.db;
      const data = await db.get('examData', examString);
      const exists = data !== undefined;
      
      this.log('Checked exam data existence', { 
        examString: examString.substring(0, 10) + '...',
        exists
      });
      
      return exists;
    } catch (error) {
      this.error('Error checking exam data existence', error);
      return false;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Get current question time without saving (real-time calculation)
   */
  async getCurrentQuestionTime(examString: string, questionId: number): Promise<number> {
    if (!examString || !Number.isFinite(questionId)) {
      this.error('getCurrentQuestionTime: Invalid parameters');
      return 0;
    }

    try {
      const data = await this.getExamData(examString);
      
      if (!data || !data.lastQuestionVisit || data.lastQuestionVisit.questionId !== questionId) {
        const storedTime = data?.questionElapsedTimes[questionId] || 0;
        this.log('Current question time (stored only)', { 
          questionId, 
          storedTime,
          reason: 'No active session for this question'
        });
        return storedTime;
      }

      const now = Date.now();
      const sessionTime = Math.floor((now - data.lastQuestionVisit.lastUpdateTime) / 1000);
      const storedTime = data.questionElapsedTimes[questionId] || 0;
      const totalTime = storedTime + Math.max(0, Math.min(sessionTime, 3600)); // Max 1 hour session
      
      this.log('Current question time (with session)', { 
        questionId,
        storedTime,
        sessionTime,
        totalTime
      });
      
      return totalTime;
    } catch (error) {
      this.error('Error getting current question time', error);
      return 0;
    }
  }

  /**
   * Get total time for a specific question (includes current session if applicable)
   */
  async getTotalQuestionTime(examString: string, questionId: number): Promise<number> {
    return this.getCurrentQuestionTime(examString, questionId);
  }

  /**
   * Get exam data size (for debugging/monitoring)
   */
  async getExamDataSize(examString: string): Promise<number> {
    try {
      const data = await this.getExamData(examString);
      if (!data) return 0;
      
      const dataString = JSON.stringify(data);
      const size = dataString.length;
      
      this.log('Calculated exam data size', { 
        examString: examString.substring(0, 10) + '...',
        size,
        sizeKB: Math.round(size / 1024 * 100) / 100
      });
      
      return size;
    } catch (error) {
      this.error('Error getting exam data size', error);
      return 0;
    }
  }

  /**
   * Clear all exam data (for development/testing)
   */
  async clearAllExamData(): Promise<void> {
    try {
      this.log('Clearing all exam data...');
      
      const db = await this.db;
      await db.clear('examData');
      
      this.log('All exam data cleared successfully');
    } catch (error) {
      this.error('Error clearing all exam data', error);
    }
  }

  /**
   * Get all exam strings (for debugging)
   */
  async getAllExamStrings(): Promise<string[]> {
    try {
      const db = await this.db;
      const keys = await db.getAllKeys('examData');
      const examStrings = keys.filter(key => typeof key === 'string') as string[];
      
      this.log('Retrieved all exam strings', { count: examStrings.length, examStrings });
      return examStrings;
    } catch (error) {
      this.error('Error getting all exam strings', error);
      return [];
    }
  }

  // ===== DEBUG METHODS =====

  /**
   * Debug method to inspect data
   */
  async debugExamData(examString: string): Promise<void> {
    try {
      const data = await this.getExamData(examString);
      const size = await this.getExamDataSize(examString);
      
      console.log('🔍 DEBUG ExamData for', examString.substring(0, 10) + '...', ':', {
        hasData: !!data,
        answers: {
          count: data?.answers ? Object.keys(data.answers).length : 0,
          data: data?.answers
        },
        questionElapsedTimes: {
          count: data?.questionElapsedTimes ? Object.keys(data.questionElapsedTimes).length : 0,
          data: data?.questionElapsedTimes,
          totalTime: data?.questionElapsedTimes ? Object.values(data.questionElapsedTimes).reduce((sum, time) => sum + time, 0) : 0
        },
        lastQuestionVisit: data?.lastQuestionVisit,
        startTime: data?.startTime ? new Date(data.startTime).toLocaleString() : null,
        version: data?.version,
        dataSize: size,
        dataSizeKB: Math.round(size / 1024 * 100) / 100
      });
    } catch (error) {
      this.error('Error debugging exam data', error);
    }
  }

  /**
   * Export all exam data for debugging
   */
  async exportAllData(): Promise<any> {
    try {
      const db = await this.db;
      const allData = await db.getAll('examData');
      const allKeys = await db.getAllKeys('examData');
      
      const exportData = {
        timestamp: new Date().toISOString(),
        totalExams: allData.length,
        data: allKeys.map((key, index) => ({
          examString: key,
          data: allData[index]
        }))
      };
      
      this.log('Exported all data', { 
        totalExams: exportData.totalExams,
        totalSize: JSON.stringify(exportData).length
      });
      
      return exportData;
    } catch (error) {
      this.error('Error exporting all data', error);
      return null;
    }
  }

  /**
   * Get statistics for all exams
   */
  async getGlobalStatistics(): Promise<any> {
    try {
      const allExamStrings = await this.getAllExamStrings();
      const stats = {
        totalExams: allExamStrings.length,
        totalAnswers: 0,
        totalQuestionTimes: 0,
        totalElapsedTime: 0,
        examsWithData: 0,
        averageQuestionsPerExam: 0,
        averageTimePerQuestion: 0
      };

      for (const examString of allExamStrings) {
        const data = await this.getExamData(examString);
        if (data) {
          stats.examsWithData++;
          stats.totalAnswers += Object.keys(data.answers).length;
          stats.totalQuestionTimes += Object.keys(data.questionElapsedTimes).length;
          stats.totalElapsedTime += Object.values(data.questionElapsedTimes).reduce((sum, time) => sum + time, 0);
        }
      }

      if (stats.examsWithData > 0) {
        stats.averageQuestionsPerExam = Math.round(stats.totalAnswers / stats.examsWithData);
      }

      if (stats.totalQuestionTimes > 0) {
        stats.averageTimePerQuestion = Math.round(stats.totalElapsedTime / stats.totalQuestionTimes);
      }

      this.log('Global statistics calculated', stats);
      return stats;
    } catch (error) {
      this.error('Error calculating global statistics', error);
      return null;
    }
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.log(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get service information
   */
  getServiceInfo(): any {
    return {
      dbName: this.dbName,
      dbVersion: this.dbVersion,
      dataVersion: this.DATA_VERSION,
      debugMode: this.debugMode,
      isClient: typeof window !== 'undefined'
    };
  }

  // ===== BULK OPERATIONS =====

  /**
   * Bulk update multiple question elapsed times
   */
  async bulkUpdateQuestionElapsedTimes(examString: string, questionTimes: Record<number, number>): Promise<Record<number, number>> {
    if (!examString || !questionTimes || typeof questionTimes !== 'object') {
      this.error('bulkUpdateQuestionElapsedTimes: Invalid parameters');
      return {};
    }

    try {
      this.log('Bulk updating question elapsed times', {
        examString: examString.substring(0, 10) + '...',
        questionCount: Object.keys(questionTimes).length,
        questionTimes
      });

      const db = await this.db;
      const existingData = await db.get('examData', examString);
      const data = this.validateAndMigrateData(existingData, examString);

      // Validate and update each question time
      for (const [questionIdStr, time] of Object.entries(questionTimes)) {
        const questionId = parseInt(questionIdStr);
        if (Number.isFinite(questionId) && questionId > 0 && Number.isFinite(time) && time >= 0) {
          data.questionElapsedTimes[questionId] = Math.floor(time);
        } else {
          this.log('Skipped invalid question time entry', { questionId: questionIdStr, time });
        }
      }

      await db.put('examData', data, examString);

      this.log('Bulk update completed successfully', {
        updatedQuestions: Object.keys(data.questionElapsedTimes).length,
        finalTimes: data.questionElapsedTimes
      });

      return { ...data.questionElapsedTimes };
    } catch (error) {
      this.error('Error in bulk update question elapsed times', error);
      return {};
    }
  }

  /**
   * Batch save answers and question times (for performance)
   */
  async batchSave(examString: string, answers: Record<number, any>, questionTimes: Record<number, number>): Promise<boolean> {
    if (!examString) {
      this.error('batchSave: Invalid examString');
      return false;
    }

    try {
      this.log('Batch saving answers and question times', {
        examString: examString.substring(0, 10) + '...',
        answersCount: Object.keys(answers || {}).length,
        questionTimesCount: Object.keys(questionTimes || {}).length
      });

      const db = await this.db;
      const existingData = await db.get('examData', examString);
      const data = this.validateAndMigrateData(existingData, examString);

      // Update answers if provided
      if (answers && typeof answers === 'object') {
        data.answers = { ...data.answers, ...answers };
      }

      // Update question times if provided
      if (questionTimes && typeof questionTimes === 'object') {
        for (const [questionIdStr, time] of Object.entries(questionTimes)) {
          const questionId = parseInt(questionIdStr);
          if (Number.isFinite(questionId) && questionId > 0 && Number.isFinite(time) && time >= 0) {
            data.questionElapsedTimes[questionId] = Math.floor(time);
          }
        }
      }

      await db.put('examData', data, examString);

      this.log('Batch save completed successfully', {
        totalAnswers: Object.keys(data.answers).length,
        totalQuestionTimes: Object.keys(data.questionElapsedTimes).length
      });

      return true;
    } catch (error) {
      this.error('Error in batch save', error);
      return false;
    }
  }

  // ===== ADVANCED QUESTION TIME ANALYTICS =====

  /**
   * Get question time analytics for an exam
   */
  async getQuestionTimeAnalytics(examString: string): Promise<any> {
    try {
      const questionTimes = await this.getQuestionElapsedTimes(examString);
      const times = Object.values(questionTimes).filter(time => time > 0);

      if (times.length === 0) {
        return {
          totalQuestions: 0,
          questionsWithTime: 0,
          totalTime: 0,
          averageTime: 0,
          minTime: 0,
          maxTime: 0,
          medianTime: 0
        };
      }

      times.sort((a, b) => a - b);
      const totalTime = times.reduce((sum, time) => sum + time, 0);
      const averageTime = totalTime / times.length;
      const medianTime = times.length % 2 === 0 
        ? (times[times.length / 2 - 1] + times[times.length / 2]) / 2
        : times[Math.floor(times.length / 2)];

      const analytics = {
        totalQuestions: Object.keys(questionTimes).length,
        questionsWithTime: times.length,
        totalTime,
        averageTime: Math.round(averageTime),
        minTime: Math.min(...times),
        maxTime: Math.max(...times),
        medianTime: Math.round(medianTime),
        questionTimes: questionTimes
      };

      this.log('Question time analytics calculated', {
        examString: examString.substring(0, 10) + '...',
        analytics
      });

      return analytics;
    } catch (error) {
      this.error('Error calculating question time analytics', error);
      return null;
    }
  }

  /**
   * Get questions that took longer than specified threshold
   */
  async getSlowQuestions(examString: string, thresholdSeconds: number = 300): Promise<Array<{questionId: number, elapsedTime: number}>> {
    try {
      const questionTimes = await this.getQuestionElapsedTimes(examString);
      const slowQuestions = Object.entries(questionTimes)
        .filter(([_, time]) => time > thresholdSeconds)
        .map(([questionId, elapsedTime]) => ({
          questionId: parseInt(questionId),
          elapsedTime
        }))
        .sort((a, b) => b.elapsedTime - a.elapsedTime);

      this.log('Slow questions identified', {
        examString: examString.substring(0, 10) + '...',
        threshold: thresholdSeconds,
        count: slowQuestions.length,
        slowQuestions
      });

      return slowQuestions;
    } catch (error) {
      this.error('Error getting slow questions', error);
      return [];
    }
  }

  /**
   * Get questions with no recorded time
   */
  async getUntrackedQuestions(examString: string, allQuestionIds: number[]): Promise<number[]> {
    try {
      const questionTimes = await this.getQuestionElapsedTimes(examString);
      const untrackedQuestions = allQuestionIds.filter(qId => 
        !questionTimes[qId] || questionTimes[qId] === 0
      );

      this.log('Untracked questions identified', {
        examString: examString.substring(0, 10) + '...',
        totalQuestions: allQuestionIds.length,
        untrackedCount: untrackedQuestions.length,
        untrackedQuestions
      });

      return untrackedQuestions;
    } catch (error) {
      this.error('Error getting untracked questions', error);
      return [];
    }
  }

  // ===== DATA MIGRATION AND REPAIR =====

  /**
   * Repair corrupted question elapsed times
   */
  async repairQuestionElapsedTimes(examString: string): Promise<boolean> {
    try {
      this.log('Repairing question elapsed times', {
        examString: examString.substring(0, 10) + '...'
      });

      const db = await this.db;
      const existingData = await db.get('examData', examString);
      
      if (!existingData) {
        this.log('No data to repair');
        return false;
      }

      const data = this.validateAndMigrateData(existingData, examString);
      let repairCount = 0;

      // Fix invalid elapsed times
      for (const [questionIdStr, time] of Object.entries(data.questionElapsedTimes)) {
        const questionId = parseInt(questionIdStr);
        
        if (!Number.isFinite(questionId) || questionId <= 0) {
          delete data.questionElapsedTimes[questionIdStr];
          repairCount++;
          this.log('Removed invalid question ID', { questionId: questionIdStr });
          continue;
        }

        if (!Number.isFinite(time) || time < 0) {
          data.questionElapsedTimes[questionId] = 0;
          repairCount++;
          this.log('Fixed invalid elapsed time', { questionId, invalidTime: time });
        } else if (time > 7200) { // More than 2 hours is suspicious
          data.questionElapsedTimes[questionId] = 7200;
          repairCount++;
          this.log('Capped excessive elapsed time', { questionId, originalTime: time });
        }
      }

      if (repairCount > 0) {
        await db.put('examData', data, examString);
        this.log('Repair completed', { repairCount, finalTimes: data.questionElapsedTimes });
      } else {
        this.log('No repairs needed');
      }

      return repairCount > 0;
    } catch (error) {
      this.error('Error repairing question elapsed times', error);
      return false;
    }
  }

  /**
   * Migrate old data format to new format
   */
  async migrateExamData(examString: string): Promise<boolean> {
    try {
      this.log('Migrating exam data', {
        examString: examString.substring(0, 10) + '...'
      });

      const db = await this.db;
      const existingData = await db.get('examData', examString);
      
      if (!existingData) {
        this.log('No data to migrate');
        return false;
      }

      const oldVersion = existingData.version || 1;
      const data = this.validateAndMigrateData(existingData, examString);

      if (data.version > oldVersion) {
        await db.put('examData', data, examString);
        this.log('Migration completed', {
          fromVersion: oldVersion,
          toVersion: data.version
        });
        return true;
      } else {
        this.log('No migration needed');
        return false;
      }
    } catch (error) {
      this.error('Error migrating exam data', error);
      return false;
    }
  }

  // ===== PERFORMANCE MONITORING =====

  /**
   * Measure operation performance
   */
  async measurePerformance<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.log(`Performance: ${operationName}`, {
        duration: `${duration.toFixed(2)}ms`,
        success: true
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.error(`Performance: ${operationName} (FAILED)`, {
        duration: `${duration.toFixed(2)}ms`,
        error
      });
      
      throw error;
    }
  }

  /**
   * Get database performance stats
   */
  async getPerformanceStats(): Promise<any> {
    try {
      const startTime = performance.now();
      
      // Test basic operations
      const testExamString = 'performance_test_' + Date.now();
      const testData = {
        answers: { 1: 'test' },
        questionTimes: { 1: 60, 2: 120 }
      };
      
      // Measure write performance
      const writeStart = performance.now();
      await this.batchSave(testExamString, testData.answers, testData.questionTimes);
      const writeTime = performance.now() - writeStart;
      
      // Measure read performance
      const readStart = performance.now();
      await this.getExamData(testExamString);
      const readTime = performance.now() - readStart;
      
      // Measure delete performance
      const deleteStart = performance.now();
      await this.deleteExamData(testExamString);
      const deleteTime = performance.now() - deleteStart;
      
      const totalTime = performance.now() - startTime;
      
      const stats = {
        totalTestTime: `${totalTime.toFixed(2)}ms`,
        writeTime: `${writeTime.toFixed(2)}ms`,
        readTime: `${readTime.toFixed(2)}ms`,
        deleteTime: `${deleteTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      };
      
      this.log('Performance stats calculated', stats);
      return stats;
    } catch (error) {
      this.error('Error calculating performance stats', error);
      return null;
    }
  }
}

// Export a singleton instance
const examDbService = new ExamDbService();

// Enable debug mode in development
if (process.env.NODE_ENV === 'development') {
  examDbService.setDebugMode(true);
}

export default examDbService;

