// routes/exam-usage.route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import pool from '../../../lib/db';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await runMiddleware(req, res, authenticateJWT);

  switch (req.method) {
    case 'GET':
      return searchExamUsage(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

const searchExamUsage = async (req: NextApiRequest, res: NextApiResponse) => {
  const { search, limit = 20 } = req.query;

  try {
    const query = `
      SELECT DISTINCT 
        e.id,
        e.name
      FROM exams e
      WHERE ($1::text IS NULL OR $1 = '' OR 
             e.name ILIKE $1 OR 
             CAST(e.id AS TEXT) ILIKE $1)
      ORDER BY e.name ASC
      LIMIT $2;
    `;
    
    const result = await pool.query(query, [
      `%${search || ''}%`,
      parseInt(limit.toString())
    ]);

    const exams = result.rows.map(row => ({
      value: row.id,
      label: `${row.name} (ID: ${row.id})`
    }));

    return res.status(200).json({
      message: 'Exam usage retrieved successfully',
      data: exams,
    });
  } catch (error: any) {
    console.error('[searchExamUsage] Error:', error);
    return res.status(500).json({ error: error.message });
  }
};