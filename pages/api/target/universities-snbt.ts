import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { search } = req.query;

    let query = `
      SELECT DISTINCT 
        u.id, 
        u.nama_pt, 
        u.nama_singkat, 
        u.jenis_pt
      FROM universities u
      WHERE u.id IN (
        SELECT DISTINCT p.university_id 
        FROM prodi p 
        WHERE p.id IN (
          SELECT DISTINCT prodi_id 
          FROM history_utbk_result
          WHERE prodi_id IS NOT NULL
        )
      )
    `;

    const params: any[] = [];

    // Add search filter if provided
    if (search && typeof search === 'string') {
      query += ` AND (u.nama_pt ILIKE $1 OR u.nama_singkat ILIKE $1)`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.nama_pt`;

    const result = await pool.query(query, params);

    // Format for react-select
    const universities = result.rows.map(row => ({
      value: row.id,
      label: `${row.nama_pt} (${row.nama_singkat})`,
      jenis_pt: row.jenis_pt
    }));

    return res.status(200).json(universities);

  } catch (error) {
    console.error('Error fetching SNBT universities:', error);
    return res.status(500).json({ 
      message: 'Error fetching universities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
