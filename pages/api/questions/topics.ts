// routes/topics.route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import pool from '../../../lib/db';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'GET':
      return searchTopics(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

const searchTopics = async (req: NextApiRequest, res: NextApiResponse) => {
  const { search, limit = 20 } = req.query;

  try {
    const query = `
      SELECT 
        id,
        name,
        code,
        description
      FROM exam_types
      WHERE kind = 2
        AND ($1::text IS NULL OR $1 = '' OR 
             name ILIKE $1 OR 
             description ILIKE $1 OR 
             code ILIKE $1)
      ORDER BY name ASC
      LIMIT $2;
    `;
    
    const result = await pool.query(query, [
      `%${search || ''}%`,
      parseInt(limit.toString())
    ]);

    const topics = result.rows.map(row => ({
      value: row.id,
      label: `${row.name}${row.description ? ` - ${row.description}` : ''}`,
      code: row.code
    }));

    return res.status(200).json({
      message: 'Topics retrieved successfully',
      data: topics,
    });
  } catch (error: any) {
    console.error('[searchTopics] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};