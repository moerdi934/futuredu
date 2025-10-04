// pages/api/dashboard/student.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../lib/middleware/auth';
import { getStudentDashboard } from '../../../controllers/dashboard.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    
    // Check if user is a student
    if (req.user?.role !== 'student') {
      return res.status(403).json({ error: 'Access denied. Student role required.' });
    }
    
    // Call controller
    await getStudentDashboard(req, res);
  } catch (error) {
    console.error('Error in student dashboard API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}