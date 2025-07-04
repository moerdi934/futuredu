// pages/api/classes/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import * as ClassController from '../../../controllers/classes.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware
  await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'GET':
      return ClassController.getClassById(req, res);
    
    case 'PUT':
      return ClassController.updateClass(req, res);
    
    case 'DELETE':
      return ClassController.deleteClass(req, res);
    
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}