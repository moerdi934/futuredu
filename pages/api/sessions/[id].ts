// pages/api/sessions/[id].ts
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
      // Endpoint untuk mendapatkan sesi berdasarkan ID
      await SessionController.getSessionById(req, res);
      break;

    case 'PUT':
      // Endpoint untuk mengupdate sesi
      await SessionController.updateSession(req, res);
      break;

    case 'DELETE':
      // Endpoint untuk menghapus sesi
      await SessionController.deleteSession(req, res);
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}