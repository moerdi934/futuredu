// pages/api/questions/bulk.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import * as questionController from '../../../controllers/questions.controller';

/**
 * API Route for bulk question operations
 * 
 * Supported Methods:
 * - POST: Create multiple questions at once
 * - PUT: Update multiple questions at once
 * 
 * Expected payload format for POST:
 * {
 *   "questions": [
 *     {
 *       "question_topic_type": 123,
 *       "question_text": "Question text here",
 *       "question_type": "single-choice",
 *       "options": ["Option A", "Option B", "Option C", "Option D"],
 *       "correct_answer": ["A"],
 *       "level": 1,
 *       "explanation": "Optional explanation",
 *       "passage_id": null
 *     }
 *   ]
 * }
 * 
 * Expected payload format for PUT:
 * {
 *   "questions": [
 *     {
 *       "id": 456,
 *       "question_topic_type": 123,
 *       "question_text": "Updated question text",
 *       "question_type": "single-choice",
 *       "options": ["Updated Option A", "Updated Option B"],
 *       "correct_answer": ["A"],
 *       "level": 2
 *     }
 *   ]
 * }
 */
export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);

    // Handle different HTTP methods
    switch (req.method) {
      case 'POST':
        return await questionController.createBulkQuestions(req, res);

      case 'PUT':
        return await questionController.updateBulkQuestions(req, res);

      default:
        res.setHeader('Allow', ['POST', 'PUT']);
        return res.status(405).json({ 
          error: `Method ${req.method} Not Allowed`,
          allowedMethods: ['POST', 'PUT']
        });
    }
  } catch (error: any) {
    console.error('Error in bulk questions API route:', error);
    
    // Handle authentication errors
    if (error.name === 'UnauthorizedError' || error.message?.includes('unauthorized')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Handle other errors
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
}

// Configure body parser to handle larger payloads for bulk operations
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increased limit for bulk operations
    },
  },
};