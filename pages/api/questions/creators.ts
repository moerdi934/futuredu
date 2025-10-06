// routes/creators.route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import pool from '../../../lib/db';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'GET':
      return searchCreators(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

const searchCreators = async (req: NextApiRequest, res: NextApiResponse) => {
  const { search, limit = 20 } = req.query;

  try {
    const query = `
      SELECT DISTINCT 
        u.name,
        u.userid
      FROM questions q
      LEFT JOIN v_dashboard_userdata u ON u.userid = q.create_user_id
      WHERE ($1::text IS NULL OR $1 = '' OR 
             u.name ILIKE $1)
        AND u.name IS NOT NULL
      ORDER BY u.name ASC
      LIMIT $2;
    `;
    
    const result = await pool.query(query, [
      `%${search || ''}%`,
      parseInt(limit.toString())
    ]);

    const creators = result.rows.map(row => ({
      value: row.userid,
      label: row.name
    }));

    return res.status(200).json({
      message: 'Creators retrieved successfully',
      data: creators,
    });
  } catch (error: any) {
    console.error('[searchCreators] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};