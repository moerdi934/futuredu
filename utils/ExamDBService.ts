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
  private dbVersion = 1;
  public db: Promise<IDBPDatabase>;

  constructor() {
    this.db = this.initDatabase();
  }

  private async initDatabase(): Promise<IDBPDatabase> {
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
    const db = await this.db;
    const data = await this.getExamData(examString) || { 
      answers: {}, 
      startTime: Date.now(),
      questionElapsedTimes: {},
      lastQuestionVisit: null
    };
    
    data.answers = answers;
    
    await db.put('examData', data, examString);
  }

  // Get exam answers
  async getAnswers(examString: string): Promise<Record<number, any> | null> {
    const data = await this.getExamData(examString);
    return data ? data.answers : null;
  }

  // Save exam start time
  async saveStartTime(examString: string, startTime: number): Promise<void> {
    const db = await this.db;
    const data = await this.getExamData(examString) || { 
      answers: {}, 
      startTime: Date.now(),
      questionElapsedTimes: {},
      lastQuestionVisit: null
    };
    
    data.startTime = startTime;
    
    await db.put('examData', data, examString);
  }

  // Get exam start time
  async getStartTime(examString: string): Promise<number | null> {
    const data = await this.getExamData(examString);
    return data ? data.startTime : null;
  }

  // Update the elapsed time for a question
  async updateQuestionElapsedTime(examString: string, questionId: number): Promise<Record<number, number>> {
    const db = await this.db;
    const data = await this.getExamData(examString) || { 
      answers: {}, 
      startTime: Date.now(),
      questionElapsedTimes: {},
      lastQuestionVisit: null
    };
    
    const now = Date.now();
    
    // If there was a previously visited question, update elapsed time
    if (data.lastQuestionVisit && data.lastQuestionVisit.questionId !== questionId) {
      const previousQuestionId = data.lastQuestionVisit.questionId;
      const timeSpent = now - data.lastQuestionVisit.timestamp;
      
      // Initialize if not exists
      data.questionElapsedTimes[previousQuestionId] = data.questionElapsedTimes[previousQuestionId] || 0;
      
      // Add the elapsed time (convert to seconds)
      data.questionElapsedTimes[previousQuestionId] += Math.floor(timeSpent / 1000);
    }
    
    // Update last question visit
    data.lastQuestionVisit = {
      questionId,
      timestamp: now
    };
    
    // Make sure current question has an entry
    data.questionElapsedTimes[questionId] = data.questionElapsedTimes[questionId] || 0;
    
    await db.put('examData', data, examString);
    
    return data.questionElapsedTimes;
  }

  // Get elapsed times for all questions
  async getQuestionElapsedTimes(examString: string): Promise<Record<number, number>> {
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
      
      return updatedTimes;
    }
    
    return data?.questionElapsedTimes || {};
  }
  
  // Record the current time for when a user leaves a question
  async finalizeCurrentQuestionTime(examString: string): Promise<Record<number, number>> {
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
  }

  // Get all exam data
  async getExamData(examString: string): Promise<ExamData | null> {
    const db = await this.db;
    return db.get('examData', examString);
  }

  // Delete exam data after submission
  async deleteExamData(examString: string): Promise<void> {
    const db = await this.db;
    await db.delete('examData', examString);
  }

  // Check if exam data exists
  async hasExamData(examString: string): Promise<boolean> {
    const db = await this.db;
    const data = await db.get('examData', examString);
    return data !== undefined;
  }
}

// Export a singleton instance
const examDbService = new ExamDbService();
export default examDbService;