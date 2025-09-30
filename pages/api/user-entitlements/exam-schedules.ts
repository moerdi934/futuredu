// pages/api/user-entitlements/exam-schedules.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import pool from '../../../lib/db';

export interface UserExamEntitlement {
  id: number;
  exam_schedule_id: number;
  granted_at: string;
  expires_at?: string;
  metadata?: any;
  exam_schedule: {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    exam_type: string;
    isfree: boolean;
    is_valid: boolean;
    approval_status: string;
    creator_name?: string;
    create_date: string;
    description?: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    const authReq = req as AuthenticatedRequest;

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const userId = authReq.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found' });
    }

    // Query to get user's exam schedule entitlements with exam schedule details
    const query = `
      SELECT 
        ent.id,
        ent.exam_schedule_id,
        ent.granted_at,
        ent.expires_at,
        ent.metadata,
        es.id as schedule_id,
        es.name as schedule_name,
        es.start_time,
        es.end_time,
        es.exam_type,
        es.isfree,
        es.is_valid,
        es.approval_status,
        es.create_date,
        es.description,
        us.name as creator_name
      FROM exam_schedule_entitlements ent
      JOIN exam_schedule es ON es.id = ent.exam_schedule_id
      LEFT JOIN v_dashboard_userdata us ON us.userid = es.created_by
      WHERE ent.user_id = $1
        AND es.is_valid = true
        AND es.approval_status = 'approved'
        AND (es.is_deleted IS NULL OR es.is_deleted = false)
        AND (
          ent.expires_at IS NULL 
          OR ent.expires_at > NOW()
        )
      ORDER BY ent.granted_at DESC, es.create_date DESC
    `;

    const result = await pool.query(query, [userId]);
    
    // Transform the result to match the expected structure
    const entitlements: UserExamEntitlement[] = result.rows.map(row => ({
      id: row.id,
      exam_schedule_id: row.exam_schedule_id,
      granted_at: row.granted_at,
      expires_at: row.expires_at,
      metadata: row.metadata,
      exam_schedule: {
        id: row.schedule_id,
        name: row.schedule_name,
        start_time: row.start_time,
        end_time: row.end_time,
        exam_type: row.exam_type || 'Unknown',
        isfree: row.isfree,
        is_valid: row.is_valid,
        approval_status: row.approval_status,
        creator_name: row.creator_name,
        create_date: row.create_date,
        description: row.description
      }
    }));

    return res.status(200).json(entitlements);
  } catch (error) {
    console.error('Error fetching user exam entitlements:', error);
    return res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}