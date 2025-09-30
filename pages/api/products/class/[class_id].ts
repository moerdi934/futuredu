// pages/api/products/class/[class_id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { class_id } = req.query;

  if (!class_id) {
    return res.status(400).json({
      success: false,
      message: 'Class ID is required'
    });
  }

  try {
    console.log(`Fetching products for class ID: ${class_id}`);

    // Cek apakah class ada
    const classCheck = await pool.query(`
      SELECT c.id, c.name, c.start_date, c.end_date, c.class_mode,
             c.teacher_id, c.student_list, c.is_deleted, c.approval_status,
             u.nama_lengkap as teacher_name
      FROM classes c
      LEFT JOIN v_dashboard_userdata u ON u.userid = c.teacher_id
      WHERE c.id = $1
    `, [class_id]);

    if (classCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const classData = classCheck.rows[0];
    if (classData.is_deleted || classData.approval_status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Class is not available for purchase'
      });
    }

    // Ambil produk yang terkait dengan class
    const query = `
      SELECT 
        p.product_id,
        p.name,
        p.description,
        p.stock,
        p.type,
        p.features,
        p.classtype class_mode,
        p.is_stackable,
        p.created_at,
        p.updated_at,
        pc.class_id,
        c.name as class_name,
        c.start_date,
        c.end_date,
        c.class_mode,
        pc.max_students,
        c.student_list,
        u.nama_lengkap as teacher_name,
        COALESCE(pph.price, 0) as price,
        COALESCE(pph.is_promo, false) as is_promo,
        pph.no_promo_price,
        pph.promo_description
      FROM products p
      JOIN product_classes pc ON pc.product_id = p.product_id
      JOIN classes c ON c.id = pc.class_id
      LEFT JOIN v_dashboard_userdata u ON u.userid = c.teacher_id
      LEFT JOIN LATERAL (
        SELECT
          pph.price,
          pph.is_promo,
          pph.no_promo_price,
          pph.promo_description
        FROM product_price_hist pph
        WHERE pph.product_id = p.product_id
          AND (
            (pph.effective_start <= NOW()
              AND (pph.effective_end IS NULL OR pph.effective_end > NOW()))
            OR pph.effective_start > NOW()
          )
        ORDER BY
          (pph.effective_start > NOW()) DESC,
          pph.effective_start DESC
        LIMIT 1
      ) pph ON TRUE
      WHERE pc.class_id = $1
        AND c.is_deleted = false
        AND c.approval_status = 'approved'
      ORDER BY 
        p.is_stackable DESC,
        pph.price ASC,
        p.product_id ASC
    `;

    const result = await pool.query(query, [class_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No products found for this class.',
        data: []
      });
    }

    const products = result.rows.map(row => ({
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
      class_id: row.class_id,
      class_name: row.class_name,
      start_date: row.start_date,
      end_date: row.end_date,
      teacher_name: row.teacher_name,
      max_students: row.max_students,
      current_students: row.student_list ? row.student_list.length : 0,
      class_mode: row.class_mode
    }));

    return res.status(200).json({
      success: true,
      data: products,
      total: products.length,
      class: {
        id: classData.id,
        name: classData.name,
        start_date: classData.start_date,
        end_date: classData.end_date,
        class_mode: classData.class_mode,
        teacher_name: classData.teacher_name
      },
      message: 'Class products retrieved successfully'
    });

  } catch (error: any) {
    console.error('Error fetching class products:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
