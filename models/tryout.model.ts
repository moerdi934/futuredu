// models/tryout.model.ts
import pool from '../lib/db';

// Types
export interface Test {
  id: number;
  name: string;
  description?: string;
  duration?: number;
  created_at?: Date;
  updated_at?: Date;
  [key: string]: any;
}

export interface Subject {
  id: number;
  test_id: number;
  name: string;
  description?: string;
  question_count?: number;
  created_at?: Date;
  updated_at?: Date;
  [key: string]: any;
}

export interface TryOutModelInterface {
  getTestByName: (testName: string) => Promise<Test | null>;
  getSubjectsByTestId: (testId: number) => Promise<Subject[]>;
}

const TryOut: TryOutModelInterface = {
  // Function to get test details by name
  getTestByName: async (testName: string): Promise<Test | null> => {
    try {
      const testResult = await pool.query('SELECT * FROM test WHERE name = $1', [testName]);
      return testResult.rows[0] || null;
    } catch (error) {
      console.error('Error in getTestByName:', error);
      throw error;
    }
  },

  // Function to get subjects by test ID
  getSubjectsByTestId: async (testId: number): Promise<Subject[]> => {
    try {
      const subjectsResult = await pool.query('SELECT * FROM subjects WHERE test_id = $1', [testId]);
      return subjectsResult.rows;
    } catch (error) {
      console.error('Error in getSubjectsByTestId:', error);
      throw error;
    }
  },
};

export default TryOut;