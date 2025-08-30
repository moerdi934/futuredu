'use client';

import { openDB, IDBPDatabase } from 'idb';

interface ExamData {
  answers: Record<number, any>;
  startTime: number;
  questionElapsedTimes: Record<number, number>;
  lastQuestionVisit: {
    questionId: number;
    timestamp: number;
  } | null;
}

class ExamDbService {
  private dbName = 'examAppDb';
  private dbVersion = 2; // Increased version to fix version error
  private _db: Promise<IDBPDatabase> | null = null;

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this._db = this.initDatabase();
    }
  }

  get db(): Promise<IDBPDatabase> {
    if (!this._db) {
      if (typeof window === 'undefined') {
        throw new Error('ExamDbService can only be used in browser environment');
      }
      this._db = this.initDatabase();
    }
    return this._db;
  }

  private async initDatabase(): Promise<IDBPDatabase> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
      throw new Error('IndexedDB is not available in this environment');
    }

    return openDB(this.dbName, this.dbVersion, {
      upgrade(db) {
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('examData')) {
          db.createObjectStore('examData');
        }
      },
    });
  }

  // Save exam answers
  async saveAnswers(examString: string, answers: Record<number, any>): Promise<void> {
    if (typeof window === 'undefined') {
      console.warn('ExamDbService: Cannot save answers in non-browser environment');
      return;
    }

    try {
      const db = await this.db;
      const data = await this.getExamData(examString) || { 
        answers: {}, 
        startTime: Date.now(),
        questionElapsedTimes: {},
        lastQuestionVisit: null
      };
      
      data.answers = answers;
      
      await db.put('examData', data, examString);
    } catch (error) {
      console.error('ExamDbService: Error saving answers:', error);
    }
  }

  // Get exam answers
  async getAnswers(examString: string): Promise<Record<number, any> | null> {
    if (typeof window === 'undefined') {
      console.warn('ExamDbService: Cannot get answers in non-browser environment');
      return null;
    }

    try {
      const data = await this.getExamData(examString);
      return data ? data.answers : null;
    } catch (error) {
      console.error('ExamDbService: Error getting answers:', error);
      return null;
    }
  }

  // Save exam start time
  async saveStartTime(examString: string, startTime: number): Promise<void> {
    if (typeof window === 'undefined') {
      console.warn('ExamDbService: Cannot save start time in non-browser environment');
      return;
    }

    try {
      const db = await this.db;
      const data = await this.getExamData(examString) || { 
        answers: {}, 
        startTime: Date.now(),
        questionElapsedTimes: {},
        lastQuestionVisit: null
      };
      
      data.startTime = startTime;
      
      await db.put('examData', data, examString);
    } catch (error) {
      console.error('ExamDbService: Error saving start time:', error);
    }
  }

  // Get exam start time
  async getStartTime(examString: string): Promise<number | null> {
    if (typeof window === 'undefined') {
      console.warn('ExamDbService: Cannot get start time in non-browser environment');
      return null;
    }

    try {
      const data = await this.getExamData(examString);
      return data ? data.startTime : null;
    } catch (error) {
      console.error('ExamDbService: Error getting start time:', error);
      return null;
    }
  }

  // Update the elapsed time for a question
  async updateQuestionElapsedTime(examString: string, questionId: number): Promise<Record<number, number>> {
    if (typeof window === 'undefined') {
      console.warn('ExamDbService: Cannot update question elapsed time in non-browser environment');
      return {};
    }

    try {
      const db = await this.db;
      const data = await this.getExamData(examString) || { 
        answers: {}, 
        startTime: Date.now(),
        questionElapsedTimes: {},
        lastQuestionVisit: null
      };
      
      const now = Date.now();
      
      console.log('🔄 UPDATE QUESTION ELAPSED TIME');
      console.log('Target Question ID:', questionId);
      console.log('Previous visit data:', data.lastQuestionVisit);
      console.log('Current elapsed times (before update):', data.questionElapsedTimes);
      
      // If there was a previously visited question, update elapsed time
      if (data.lastQuestionVisit && data.lastQuestionVisit.questionId !== questionId) {
        const previousQuestionId = data.lastQuestionVisit.questionId;
        const timeSpent = now - data.lastQuestionVisit.timestamp;
        
        console.log('Finalizing previous question:', previousQuestionId);
        console.log('Time spent on previous question (ms):', timeSpent);
        console.log('Time spent on previous question (seconds):', Math.floor(timeSpent / 1000));
        
        // Initialize questionElapsedTimes if it doesn't exist or is null
        if (!data.questionElapsedTimes) {
          data.questionElapsedTimes = {};
        }
        
        // Initialize if not exists
        data.questionElapsedTimes[previousQuestionId] = data.questionElapsedTimes[previousQuestionId] || 0;
        
        // Add the elapsed time (convert to seconds)
        data.questionElapsedTimes[previousQuestionId] += Math.floor(timeSpent / 1000);
        
        console.log('Previous question new total time:', data.questionElapsedTimes[previousQuestionId]);
      }
      
      // Initialize questionElapsedTimes if it doesn't exist
      if (!data.questionElapsedTimes) {
        data.questionElapsedTimes = {};
      }
      
      // Update last question visit
      data.lastQuestionVisit = {
        questionId,
        timestamp: now
      };
      
      // Make sure current question has an entry
      data.questionElapsedTimes[questionId] = data.questionElapsedTimes[questionId] || 0;
      
      console.log('Updated elapsed times (after update):', data.questionElapsedTimes);
      console.log('New visit data:', data.lastQuestionVisit);
      console.log('---');
      
      await db.put('examData', data, examString);
      
      return data.questionElapsedTimes;
    } catch (error) {
      console.error('ExamDbService: Error updating question elapsed time:', error);
      return {};
    }
  }

  // Get elapsed times for all questions
  async getQuestionElapsedTimes(examString: string): Promise<Record<number, number>> {
    if (typeof window === 'undefined') {
      console.warn('ExamDbService: Cannot get question elapsed times in non-browser environment');
      return {};
    }

    try {
      const data = await this.getExamData(examString);
      
      // If we have data but no visit record, return the stored elapsed times
      if (data && !data.questionElapsedTimes) {
        return {};
      }
      
      // If we have a last visit record, update the current question time
      if (data && data.lastQuestionVisit) {
        const now = Date.now();
        const timeSpent = now - data.lastQuestionVisit.timestamp;
        const questionId = data.lastQuestionVisit.questionId;
        
        // Create a copy to avoid modifying the stored data
        const updatedTimes = { ...data.questionElapsedTimes };
        
        // Add current session time to the current question (convert to seconds)
        updatedTimes[questionId] = (updatedTimes[questionId] || 0) + Math.floor(timeSpent / 1000);
        
        // CRITICAL FIX: Update the stored data to prevent reset
        const db = await this.db;
        data.questionElapsedTimes[questionId] = updatedTimes[questionId];
        data.lastQuestionVisit.timestamp = now; // Update timestamp to prevent double counting
        await db.put('examData', data, examString);
        
        return updatedTimes;
      }
      
      return data?.questionElapsedTimes || {};
    } catch (error) {
      console.error('ExamDbService: Error getting question elapsed times:', error);
      return {};
    }
  }
  
  // Record the current time for when a user leaves a question
  async finalizeCurrentQuestionTime(examString: string): Promise<Record<number, number>> {
    if (typeof window === 'undefined') {
      console.warn('ExamDbService: Cannot finalize current question time in non-browser environment');
      return {};
    }

    try {
      const db = await this.db;
      const data = await this.getExamData(examString);
      
      if (data && data.lastQuestionVisit) {
        const now = Date.now();
        const timeSpent = now - data.lastQuestionVisit.timestamp;
        const questionId = data.lastQuestionVisit.questionId;
        
        // Initialize if not exists
        data.questionElapsedTimes[questionId] = data.questionElapsedTimes[questionId] || 0;
        
        // Add the elapsed time (convert to seconds)
        data.questionElapsedTimes[questionId] += Math.floor(timeSpent / 1000);
        
        // Reset last visit
        data.lastQuestionVisit = null;
        
        await db.put('examData', data, examString);
        
        return data.questionElapsedTimes;
      }
      
      return data?.questionElapsedTimes || {};
    } catch (error) {
      console.error('ExamDbService: Error finalizing current question time:', error);
      return {};
    }
  }

  // Get all exam data
  async getExamData(examString: string): Promise<ExamData | null> {
    if (typeof window === 'undefined') {
      console.warn('ExamDbService: Cannot get exam data in non-browser environment');
      return null;
    }

    try {
      const db = await this.db;
      return await db.get('examData', examString) || null;
    } catch (error) {
      console.error('ExamDbService: Error getting exam data:', error);
      return null;
    }
  }

  // Delete exam data after submission
  async deleteExamData(examString: string): Promise<void> {
    if (typeof window === 'undefined') {
      console.warn('ExamDbService: Cannot delete exam data in non-browser environment');
      return;
    }

    try {
      const db = await this.db;
      await db.delete('examData', examString);
    } catch (error) {
      console.error('ExamDbService: Error deleting exam data:', error);
    }
  }

  // Check if exam data exists
  async hasExamData(examString: string): Promise<boolean> {
    if (typeof window === 'undefined') {
      console.warn('ExamDbService: Cannot check exam data in non-browser environment');
      return false;
    }

    try {
      const db = await this.db;
      const data = await db.get('examData', examString);
      return data !== undefined;
    } catch (error) {
      console.error('ExamDbService: Error checking exam data:', error);
      return false;
    }
  }

  // Clear all exam data (useful for development/testing)
  async clearAllData(): Promise<void> {
    if (typeof window === 'undefined') {
      console.warn('ExamDbService: Cannot clear all data in non-browser environment');
      return;
    }

    try {
      const db = await this.db;
      await db.clear('examData');
    } catch (error) {
      console.error('ExamDbService: Error clearing all data:', error);
    }
  }

  // Get all stored exam strings (useful for debugging)
  async getAllExamStrings(): Promise<string[]> {
    if (typeof window === 'undefined') {
      console.warn('ExamDbService: Cannot get all exam strings in non-browser environment');
      return [];
    }

    try {
      const db = await this.db;
      return await db.getAllKeys('examData') as string[];
    } catch (error) {
      console.error('ExamDbService: Error getting all exam strings:', error);
      return [];
    }
  }
}

// Export a singleton instance
const examDbService = new ExamDbService();
export default examDbService;