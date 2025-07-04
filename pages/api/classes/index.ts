// pages/api/classes/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import * as ClassController from '../../../controllers/classes.controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply authentication middleware
  await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'GET':
      return ClassController.getAllClasses(req, res);
    
    case 'POST':
      return ClassController.createClass(req, res);
    
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}