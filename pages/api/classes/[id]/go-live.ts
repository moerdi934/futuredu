// pages/api/classes/[id]/go-live.ts
import { NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import pool from '../../../../lib/db';

interface GoLiveRequest {
  name: string;
  description: string;
  price: number;
  max_students: number;
  features: string[];
  classtype: string;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
  effective_start: string;
  effective_end?: string;
}

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Apply authentication middleware
  await runMiddleware(req, res, authenticateJWT);

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Only admin can make classes go live
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Only admin can make classes go live' 
    });
  }

  const { id: classId } = req.query;
  const {
    name,
    description,
    price,
    max_students,
    features,
    classtype,
    is_promo,
    no_promo_price,
    promo_description,
    effective_start,
    effective_end
  }: GoLiveRequest = req.body;

  // Validation
  if (!name?.trim() || !description?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Name and description are required'
    });
  }

  if (!price || price <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid price is required'
    });
  }

  if (!max_students || max_students <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid maximum students count is required'
    });
  }

  if (is_promo && (!no_promo_price || no_promo_price <= price)) {
    return res.status(400).json({
      success: false,
      message: 'Original price must be higher than promo price'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Check if class exists and is valid for go-live
    const classResult = await client.query(`
      SELECT 
        c.*,
        array_length(c.student_list, 1) as current_students
      FROM classes c 
      WHERE c.id = $1 
        AND c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
        AND c.real_start_datetime IS NULL
    `, [classId]);

    if (classResult.rows.length === 0) {
      throw new Error('Class not found, not approved, already started, or deleted');
    }

    const classData = classResult.rows[0];
    const currentStudents = classData.current_students || 0;

    // Validate max_students against current enrolled students
    if (max_students < currentStudents) {
      throw new Error(`Maximum students (${max_students}) cannot be less than current enrolled students (${currentStudents})`);
    }

    // 2. Check if class is already live
    const existingProductResult = await client.query(`
      SELECT p.product_id 
      FROM products p
      JOIN product_classes pc ON p.product_id = pc.product_id
      WHERE pc.class_id = $1
    `, [classId]);

    if (existingProductResult.rows.length > 0) {
      throw new Error('Class is already live');
    }

    // 3. Create product
    const productResult = await client.query(`
      INSERT INTO products 
        (name, description, stock, type, features, classtype)
      VALUES ($1, $2, $3, 2, $4, $5)
      RETURNING product_id
    `, [
      name.trim(),
      description.trim(),
      max_students - currentStudents, // Available stock for purchase
      JSON.stringify(features || []),
      classtype
    ]);

    const productId = productResult.rows[0].product_id;

    // 4. Create product_classes relationship
    await client.query(`
      INSERT INTO product_classes (product_id, class_id, max_students)
      VALUES ($1, $2, $3)
    `, [productId, classId, max_students]);

    // 5. Create price history
    const priceData = {
      product_id: productId,
      price: price,
      effective_start: new Date(effective_start),
      effective_end: effective_end ? new Date(effective_end) : null,
      description: `Class: ${name}`,
      is_promo: is_promo || false,
      no_promo_price: is_promo ? no_promo_price : null,
      promo_description: is_promo ? (promo_description || null) : null
    };

    await client.query(`
      INSERT INTO product_price_hist 
        (product_id, price, effective_start, effective_end, description, is_promo, no_promo_price, promo_description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      priceData.product_id,
      priceData.price,
      priceData.effective_start,
      priceData.effective_end,
      priceData.description,
      priceData.is_promo,
      priceData.no_promo_price,
      priceData.promo_description
    ]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Class successfully made live',
      data: {
        product_id: productId,
        class_id: classId,
        max_students: max_students,
        available_slots: max_students - currentStudents,
        current_students: currentStudents
      }
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Go live class error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to make class live'
    });
  } finally {
    client.release();
  }
}