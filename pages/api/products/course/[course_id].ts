import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';

export interface CourseProduct {
  product_id: number;
  name: string;
  description: string;
  stock: number;
  type: number;
  features: string[];
  classtype: string;
  is_stackable: boolean;
  price: number;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
  course_id: number;
  course_title: string;
  created_at: Date;
  updated_at: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { course_id } = req.query;

  if (!course_id) {
    return res.status(400).json({
      success: false,
      message: 'Course ID is required'
    });
  }

  try {
    console.log(`Fetching products for course ID: ${course_id}`);

    // Validate course
    const courseCheck = await pool.query(`
      SELECT id, title, approval_status, is_deleted
      FROM courses
      WHERE id = $1
    `, [course_id]);

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const course = courseCheck.rows[0];

    if (course.is_deleted || course.approval_status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for purchase'
      });
    }

    // Query products linked to this course
    const query = `
      SELECT 
        p.product_id,
        p.name,
        p.description,
        p.stock,
        p.type,
        p.features,
        p.classtype,
        p.is_stackable,
        p.created_at,
        p.updated_at,
        c.id as course_id,
        c.title as course_title,
        COALESCE(pph.price, 0) as price,
        COALESCE(pph.is_promo, false) as is_promo,
        pph.no_promo_price,
        pph.promo_description
      FROM products p
      JOIN product_courses pc ON pc.product_id = p.product_id
      JOIN courses c ON c.id = pc.course_id
      LEFT JOIN LATERAL (
        SELECT
          pph.price,
          pph.is_promo,
          pph.no_promo_price,
          pph.promo_description
        FROM product_price_hist pph
        WHERE pph.product_id = p.product_id
          AND (
            (pph.effective_start <= NOW() AND (pph.effective_end IS NULL OR pph.effective_end > NOW()))
            OR pph.effective_start > NOW()
          )
        ORDER BY
          (pph.effective_start > NOW()) DESC,
          pph.effective_start DESC
        LIMIT 1
      ) pph ON TRUE
      WHERE pc.course_id = $1
        AND c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
      ORDER BY 
        p.is_stackable DESC,
        pph.price ASC,
        p.product_id ASC
    `;

    const result = await pool.query(query, [course_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No products found for this course.',
        data: []
      });
    }

    const products: CourseProduct[] = result.rows.map(row => ({
      product_id: row.product_id,
      name: row.name,
      description: row.description,
      stock: row.stock,
      type: row.type,
      features: row.features || [],
      classtype: row.classtype,
      is_stackable: row.is_stackable,
      price: row.price || 0,
      is_promo: row.is_promo || false,
      no_promo_price: row.no_promo_price,
      promo_description: row.promo_description,
      course_id: row.course_id,
      course_title: row.course_title,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    return res.status(200).json({
      success: true,
      data: products,
      total: products.length,
      course: {
        id: course.id,
        title: course.title
      },
      message: 'Products retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching course products:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
