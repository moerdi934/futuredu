// pages/api/products/try-out/[exam_schedule_id].ts - Improved version
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';

export interface TryOutProduct {
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
  exam_schedule_id: number;
  exam_schedule_name: string;
  created_at: Date;
  updated_at: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { exam_schedule_id } = req.query;

  if (!exam_schedule_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Exam schedule ID is required' 
    });
  }

  try {
    console.log(`Fetching products for exam schedule ID: ${exam_schedule_id}`);

    // First, verify exam schedule exists and is valid
    const examScheduleCheck = await pool.query(`
      SELECT id, name, is_valid, approval_status, is_deleted, isfree
      FROM exam_schedule 
      WHERE id = $1
    `, [exam_schedule_id]);

    if (examScheduleCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Exam schedule not found'
      });
    }

    const examSchedule = examScheduleCheck.rows[0];

    if (!examSchedule.is_valid || examSchedule.approval_status !== 'approved' || examSchedule.is_deleted) {
      return res.status(400).json({
        success: false,
        message: 'Exam schedule is not available for purchase'
      });
    }

    // If exam is free, return message about not needing to purchase
    if (examSchedule.isfree) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'This exam is free and does not require purchase',
        is_free_exam: true
      });
    }

    // Query to get products associated with the exam schedule
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
        es.id as exam_schedule_id,
        es.name as exam_schedule_name,
        COALESCE(pph.price, 0) as price,
        COALESCE(pph.is_promo, false) as is_promo,
        pph.no_promo_price,
        pph.promo_description
      FROM products p
      JOIN product_exam_schedules pes ON pes.product_id = p.product_id
      JOIN exam_schedule es ON es.id = pes.exam_schedule_id
      LEFT JOIN LATERAL (
        SELECT
          pph.price,
          pph.is_promo,
          pph.no_promo_price,
          pph.promo_description
        FROM product_price_hist pph
        WHERE pph.product_id = p.product_id
          AND (
            -- Current price (started ≤ now and not yet ended)
            (
              pph.effective_start <= NOW()
              AND (pph.effective_end IS NULL OR pph.effective_end > NOW())
            )
            OR
            -- Future adjustment/promo (effective_start > now) - prioritized
            pph.effective_start > NOW()
          )
        ORDER BY
          (pph.effective_start > NOW()) DESC,  -- prioritize future prices
          pph.effective_start DESC              -- get the latest
        LIMIT 1
      ) pph ON TRUE
      WHERE pes.exam_schedule_id = $1
        AND es.is_valid = true
        AND es.approval_status = 'approved'
        AND (es.is_deleted IS NULL OR es.is_deleted = false)
      ORDER BY 
        p.is_stackable DESC,  -- Non-stackable products first (usually premium)
        pph.price ASC,        -- Cheaper products first
        p.product_id ASC
    `;

    console.log('Executing query:', query);
    console.log('With parameter:', exam_schedule_id);

    const result = await pool.query(query, [exam_schedule_id]);
    
    console.log(`Found ${result.rows.length} products`);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No products found for this exam schedule. This try-out may not be available for purchase yet.',
        data: []
      });
    }

    const products: TryOutProduct[] = result.rows.map(row => ({
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
      exam_schedule_id: row.exam_schedule_id,
      exam_schedule_name: row.exam_schedule_name,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    console.log('Processed products:', products);

    return res.status(200).json({
      success: true,
      data: products,
      total: products.length,
      exam_schedule: {
        id: examSchedule.id,
        name: examSchedule.name,
        is_free: examSchedule.isfree
      },
      message: 'Products retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching try-out products:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}