// pages/api/target/prodi-snbt/[universityId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { universityId } = req.query;
  const { jenjang, search } = req.query;

  try {
    let query = `
      SELECT DISTINCT
        p.id AS value,
        CONCAT(p.nama_prodi, ' (', p.jenjang_prodi, ')') AS label,
        p.nama_prodi,
        p.jenjang_prodi,
        p.akreditasi,
        u.nama_pt,
        u.nama_singkat
      FROM prodi p
      JOIN universities u ON u.id = p.university_id
      WHERE p.id IN (
        SELECT DISTINCT prodi_id 
        FROM history_utbk_result 
        WHERE prodi_id IS NOT NULL
      )
      AND p.university_id = $1
      AND p.status_prodi = 'Aktif'
    `;

    const params: any[] = [universityId];
    let paramIndex = 2;

    if (jenjang) {
      query += ` AND p.jenjang_prodi = $${paramIndex}`;
      params.push(jenjang);
      paramIndex++;
    }

    if (search) {
      query += ` AND p.nama_prodi ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY p.nama_prodi ASC LIMIT 50`;

    const { rows } = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching SNBT prodi:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
