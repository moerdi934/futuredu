// pages/api/product-types/index.ts - Product types endpoint for go-live modal
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../lib/middleware/auth';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await runMiddleware(req, res, authenticateJWT);
    const authReq = req as AuthenticatedRequest;

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Only admin can access product types for go-live
    if (authReq.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mengakses product types.'
      });
    }

    const { search = '' } = req.query;

    const query = `
      SELECT 
        id,
        description,
        series,
        group_product
      FROM product_type
      WHERE description IS NOT NULL 
        AND description ILIKE $1
      ORDER BY description
      LIMIT 50
    `;

    const result = await pool.query(query, [`%${search}%`]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        value: row.id,
        label: row.description,
        description: row.description,
        series: row.series,
        group_product: row.group_product
      }))
    });

  } catch (error) {
    console.error('Get Product Types Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}