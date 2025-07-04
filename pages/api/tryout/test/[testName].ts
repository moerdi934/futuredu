// pages/api/tryout/test/[testName].ts
import { NextApiRequest, NextApiResponse } from 'next';
import TryOutController from '../../../../controllers/tryout.controller';
import { runMiddleware, optionalAuthenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Cast req to AuthenticatedRequest for middleware compatibility
  const authReq = req as AuthenticatedRequest;

  // Set CORS headers if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Apply optional authentication middleware
    await runMiddleware(authReq, res, optionalAuthenticateJWT);

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        await TryOutController.getTestDetails(authReq, res);
        break;
      
      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
        break;
    }
  } catch (error) {
    console.error('API Route Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}