// routes/subtopics.route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import pool from '../../../lib/db';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'GET':
      return searchSubtopics(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

const searchSubtopics = async (req: NextApiRequest, res: NextApiResponse) => {
  const { search, limit = 20, masterId } = req.query;

  try {
    let query = `
      SELECT 
        et.id,
        et.name,
        et.code,
        et.description,
        et.master_id,
        parent.name as parent_name
      FROM exam_types et
      LEFT JOIN exam_types parent ON et.master_id = parent.id
      WHERE et.kind = 3
        AND ($1::text IS NULL OR $1 = '' OR 
             et.name ILIKE $1 OR 
             et.description ILIKE $1 OR 
             et.code ILIKE $1)
    `;

    const params: any[] = [`%${search || ''}%`];

    // Filter by master_id jika provided
    if (masterId) {
      query += ` AND et.master_id = $${params.length + 1}`;
      params.push(masterId);
    }

    query += ` ORDER BY et.name ASC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit.toString()));

    const result = await pool.query(query, params);

    const subtopics = result.rows.map(row => ({
      value: row.id,
      label: `${row.name}${row.parent_name ? ` (${row.parent_name})` : ''}${row.description ? ` - ${row.description}` : ''}`,
      code: row.code,
      master_id: row.master_id,
      parent_name: row.parent_name
    }));

    return res.status(200).json({
      message: 'Subtopics retrieved successfully',
      data: subtopics,
    });
  } catch (error: any) {
    console.error('[searchSubtopics] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};