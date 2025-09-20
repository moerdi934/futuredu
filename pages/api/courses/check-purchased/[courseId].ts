// pages/api/courses/check-purchased/[courseId].ts - Check if user purchased course
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import pool from '../../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await runMiddleware(req, res, authenticateJWT);
    const authReq = req as AuthenticatedRequest;

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { courseId } = req.query;
    const userId = authReq.user?.id;

    // Check if user has purchased this course
    const result = await pool.query(`
      SELECT ce.course_id, ce.granted_at, ce.expires_at
      FROM course_entitlements ce
      WHERE ce.user_id = $1 AND ce.course_id = $2
        AND (ce.expires_at IS NULL OR ce.expires_at > NOW())
    `, [userId, courseId]);

    const hasPurchased = result.rows.length > 0;
    const entitlement = hasPurchased ? result.rows[0] : null;

    res.json({
      success: true,
      data: {
        hasPurchased,
        entitlement
      }
    });

  } catch (error) {
    console.error('Check Purchased Course Error:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}