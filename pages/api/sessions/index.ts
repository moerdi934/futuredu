// pages/api/sessions/index.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, authenticateJWT, runMiddleware } from '../../../lib/middleware/auth';
import * as SessionController from '../../../controllers/session.controller';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Apply JWT authentication middleware
  try {
    await runMiddleware(req, res, authenticateJWT);
  } catch (error) {
    return; // Middleware already sent response
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      // Endpoint untuk mendapatkan semua sesi
      await SessionController.getAllSessions(req, res);
      break;

    case 'POST':
      // Endpoint untuk membuat sesi baru
      await SessionController.createSession(req, res);
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}