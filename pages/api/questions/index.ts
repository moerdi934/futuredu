// pages/api/questions/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import * as questionController from '../../../controllers/questions.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Apply authentication middleware for all methods except search
  if (req.method !== 'GET' || !req.url?.includes('/search')) {
    await runMiddleware(req, res, authenticateJWT);
  }

  switch (req.method) {
    case 'GET':
      // Handle different GET endpoints based on query parameters
      if (req.query.search !== undefined && req.url?.includes('/search')) {
        return questionController.searchQuestions(req, res);
      } else if (req.query.exam_string && req.url?.includes('/byExamString')) {
        return questionController.getQuestionsByExamString(req, res);
      } else if (req.query.exam_string && req.url?.includes('/diagnostic/byExamString')) {
        return questionController.getDiagnosticQuestionsByExamString(req, res);
      } else if (req.query.examid && req.url?.includes('/byExamId')) {
        return questionController.getQuestionsByExamId(req, res);
      } else if (req.query.page || req.query.limit) {
        return questionController.getPagedQuestions(req, res);
      } else {
        return questionController.getAllQuestions(req, res);
      }

    case 'POST':
      if (req.url?.includes('/verif-csv')) {
        return questionController.verifyCsv(req, res);
      } else if (req.url?.includes('/bulk')) {
        return questionController.createBulkQuestions(req, res);
      } else if (req.url?.includes('/append-exam-id')) {
        return questionController.appendExamId(req, res);
      } else {
        return questionController.createQuestion(req, res);
      }

    case 'PUT':
      if (req.url?.includes('/bulk')) {
        return questionController.updateBulkQuestions(req, res);
      } else {
        return res.status(400).json({ error: 'PUT method requires ID parameter' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}