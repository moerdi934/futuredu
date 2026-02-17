// pages/api/user/try-out-data.ts
// Combined endpoint for try-out page data to reduce N+1 queries
import { NextApiResponse } from 'next';
import { AuthenticatedRequest, runMiddleware, authenticateJWT } from '../../../lib/middleware/auth';
import pool from '../../../lib/db';

export interface CoinBalance {
  coin_type: 'class' | 'course' | 'tryout';
  total_balance: number;
  expiring_soon: number;
}

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

export interface UserExamScore {
  exam_schedule_id: number;
  total_score: number | string;
  average_score: number | string;
  total_correct: number | string;
  total_questions: number | string;
  completion_time: string;
  has_completed: boolean;
}

export interface TryOutUserData {
  entitlements: UserExamEntitlement[];
  scores: UserExamScore[];
  coinBalances: CoinBalance[];
}

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'User ID not found' 
      });
    }

    // Execute all 3 queries in parallel for maximum efficiency
    const [entitlementsResult, scoresResult, coinBalancesResult] = await Promise.all([
      // Query 1: User Entitlements
      pool.query(`
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
      `, [userId]),

      // Query 2: User Scores
      pool.query(`
        WITH active_sessions AS (
          SELECT DISTINCT exam_schedule_id
          FROM "tExamSession"
          WHERE user_id = $1 AND is_submitted = false
        ),
        latest_sessions AS (
          SELECT DISTINCT ON (ts.exam_schedule_id, ts.exam_id)
            ts.exam_schedule_id,
            ts.exam_id,
            ts.user_id,
            ts.is_submitted,
            ts.last_save
          FROM "tExamSession" ts
          WHERE ts.user_id = $1 AND ts.is_submitted = true
          ORDER BY ts.exam_schedule_id, ts.exam_id, ts.last_save DESC
        ),
        schedule_completion AS (
          SELECT 
            ls.exam_schedule_id,
            es.exam_id_list,
            COUNT(DISTINCT ls.exam_id) as completed_exams,
            CARDINALITY(es.exam_id_list) as total_exams
          FROM latest_sessions ls
          JOIN exam_schedule es ON es.id = ls.exam_schedule_id
          WHERE NOT EXISTS (
            SELECT 1 FROM active_sessions acts 
            WHERE acts.exam_schedule_id = ls.exam_schedule_id
          )
          GROUP BY ls.exam_schedule_id, es.exam_id_list
        ),
        completed_schedules AS (
          SELECT exam_schedule_id
          FROM schedule_completion
          WHERE completed_exams = total_exams
        ),
        latest_scores AS (
          SELECT DISTINCT ON (ues.exam_id)
            ues.exam_schedule_id,
            ues.exam_id,
            ues.score,
            ues.weighted_score,
            ues.total_correct,
            ues.total_questions,
            ues.completion_time
          FROM user_exam_scores ues
          JOIN completed_schedules cs ON cs.exam_schedule_id = ues.exam_schedule_id
          WHERE ues.user_id = $1
          ORDER BY ues.exam_id, ues.completion_time DESC
        ),
        aggregated_scores AS (
          SELECT 
            ls.exam_schedule_id,
            es.is_need_weighted_score,
            SUM(CASE 
              WHEN COALESCE(es.is_need_weighted_score, false) = true 
              THEN COALESCE(ls.weighted_score, 0)
              ELSE ls.score
            END) as total_score,
            AVG(CASE 
              WHEN COALESCE(es.is_need_weighted_score, false) = true 
              THEN COALESCE(ls.weighted_score, 0)
              ELSE ls.score
            END) as average_score,
            SUM(ls.total_correct) as total_correct,
            SUM(ls.total_questions) as total_questions,
            MAX(ls.completion_time) as completion_time
          FROM latest_scores ls
          JOIN exam_schedule es ON es.id = ls.exam_schedule_id
          GROUP BY ls.exam_schedule_id, es.is_need_weighted_score
        )
        SELECT 
          agg.exam_schedule_id,
          agg.total_score,
          agg.average_score,
          agg.total_correct,
          agg.total_questions,
          agg.completion_time,
          true as has_completed
        FROM aggregated_scores agg
        ORDER BY agg.completion_time DESC
      `, [userId]),

      // Query 3: Coin Balances (from user_coin table with FIFO logic)
      pool.query(`
        SELECT 
          coin_type,
          COALESCE(SUM(remaining), 0) as total_balance,
          COALESCE(SUM(CASE 
            WHEN expiry_date <= NOW() + INTERVAL '30 days' AND remaining > 0 
            THEN remaining 
            ELSE 0 
          END), 0) as expiring_soon
        FROM user_coin
        WHERE user_id = $1 
          AND remaining > 0 
          AND expiry_date > NOW()
        GROUP BY coin_type
        ORDER BY coin_type
      `, [userId])
    ]);

    // Transform entitlements
    const entitlements: UserExamEntitlement[] = entitlementsResult.rows.map(row => ({
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

    // Transform scores (already in correct format)
    const scores: UserExamScore[] = scoresResult.rows;

    // Transform coin balances - ensure all coin types are represented
    const coinTypes: ('class' | 'course' | 'tryout')[] = ['class', 'course', 'tryout'];
    const coinBalances: CoinBalance[] = coinTypes.map(type => {
      const existing = coinBalancesResult.rows.find((r: any) => r.coin_type === type);
      return {
        coin_type: type,
        total_balance: existing ? parseFloat(existing.total_balance) : 0,
        expiring_soon: existing ? parseFloat(existing.expiring_soon) : 0
      };
    });

    // Return combined data
    return res.status(200).json({
      success: true,
      data: {
        entitlements,
        scores,
        coinBalances
      }
    });

  } catch (error) {
    console.error('Error fetching try-out user data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
