// pages/api/classes/live.ts - UPDATED WITH COIN SUPPORT
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

interface LiveClass {
  id: number;
  name: string;
  description: string;
  teacher_name: string;
  teacher_id: number;
  student_list_ids: number[];
  student_list_names: string[];
  start_date: string;
  end_date: string;
  class_mode: string;
  meeting_url?: string;
  course_name: string;
  course_id: number;
  product_id: number;
  product_name: string;
  price: number;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
  stock: number;
  max_students: number;
  current_students: number;
  features?: string[];
  classtype: string;
  effective_start: string;
  effective_end?: string;
  creator_name?: string;
  create_date: string;
  // NEW: Coin support fields
  coin_price?: number;
  coin_type?: 'class' | 'course' | 'tryout';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Use explicit client for better connection management
  const client = await pool.connect();
  
  try {
    const {
      search = '',
      page = '1',
      limit = '12',
      classtype = 'all',
      sortBy = 'newest',
      minPrice,
      maxPrice,
      class_mode = 'all'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let query = `
      WITH live_classes AS (
        SELECT 
          c.id,
          c.name,
          c.description,
          c.teacher_id,
          t.user_code || '-' || ta.nama_lengkap AS teacher_name,
          c.student_list as student_list_ids,
          COALESCE(ARRAY_AGG(s.user_code || '-' || sa.nama_lengkap) FILTER (WHERE sa.nama_lengkap IS NOT NULL), '{}') AS student_list_names,
          c.start_date,
          c.end_date,
          c.class_mode,
          c.meeting_url,
          c.course_id,
          co.title as course_name,
          c.create_date,
          cu.user_code || '-' || ca.nama_lengkap AS creator_name,
          p.product_id,
          p.name as product_name,
          p.stock,
          (ARRAY_AGG(p.features))[1] as features,
          p.classtype,
          -- NEW: Add coin support fields
          p.coin_price,
          p.coin_type,
          pc.max_students,
          array_length(c.student_list, 1) as current_students,
          -- Apply CEILING to prices for integer values
          CEILING(ph.price) as price,
          ph.is_promo,
          CEILING(ph.no_promo_price) as no_promo_price,
          ph.promo_description,
          ph.effective_start,
          ph.effective_end
        FROM classes c
        JOIN product_classes pc ON c.id = pc.class_id
        JOIN products p ON pc.product_id = p.product_id
        LEFT JOIN LATERAL (
          SELECT
            pph.price,
            pph.is_promo,
            pph.no_promo_price,
            pph.promo_description,
            pph.effective_start,
            pph.effective_end
          FROM product_price_hist pph
          WHERE pph.product_id = p.product_id
            AND (
              pph.effective_start > NOW()
              OR
              (
                pph.effective_start <= NOW()
                AND (pph.effective_end IS NULL OR pph.effective_end > NOW())
              )
            )
          ORDER BY
            (pph.effective_start > NOW()) DESC,
            pph.effective_start DESC
          LIMIT 1
        ) ph ON TRUE
        LEFT JOIN courses co ON c.course_id = co.id
        LEFT JOIN users t ON c.teacher_id = t.id
        LEFT JOIN user_account ta ON ta.user_id = t.user_id
        LEFT JOIN users cu ON c.create_user_id = cu.id
        LEFT JOIN user_account ca ON ca.user_id = cu.user_id
        LEFT JOIN users s ON s.id = ANY(c.student_list)
        LEFT JOIN user_account sa ON sa.user_id = s.user_id
        WHERE c.approval_status = 'approved'
          AND (c.is_deleted IS NULL OR c.is_deleted = false)
          AND c.real_start_datetime IS NULL
          AND p.type = 13  -- Class products
          AND p.stock > 0
          AND (
            ph.effective_start <= NOW()
            AND (ph.effective_end IS NULL OR ph.effective_end > NOW())
          )
        GROUP BY 
          c.id, c.name, c.description, c.teacher_id, t.user_code, ta.nama_lengkap,
          c.student_list, c.start_date, c.end_date, c.class_mode, c.meeting_url,
          c.course_id, co.title, c.create_date, cu.user_code, ca.nama_lengkap,
          p.product_id, p.name, p.stock, p.classtype, p.coin_price, p.coin_type, pc.max_students,
          ph.price, ph.is_promo, ph.no_promo_price, ph.promo_description,
          ph.effective_start, ph.effective_end
      )
      SELECT *, COUNT(*) OVER() as total_count
      FROM live_classes
      WHERE 1=1
    `;

    const params: any[] = [];
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length} OR product_name ILIKE $${params.length} OR teacher_name ILIKE $${params.length})`;
    }

    if (classtype !== 'all') {
      params.push(classtype);
      query += ` AND classtype = $${params.length}`;
    }

    if (class_mode !== 'all') {
      params.push(class_mode);
      query += ` AND class_mode = $${params.length}`;
    }

    if (minPrice) {
      params.push(parseInt(minPrice as string));
      query += ` AND price >= $${params.length}`;
    }
    if (maxPrice) {
      params.push(parseInt(maxPrice as string));
      query += ` AND price <= $${params.length}`;
    }

    switch (sortBy) {
      case 'newest':
        query += ` ORDER BY create_date DESC`;
        break;
      case 'oldest':
        query += ` ORDER BY create_date ASC`;
        break;
      case 'price_low':
        query += ` ORDER BY price ASC`;
        break;
      case 'price_high':
        query += ` ORDER BY price DESC`;
        break;
      case 'name_asc':
        query += ` ORDER BY name ASC`;
        break;
      case 'name_desc':
        query += ` ORDER BY name DESC`;
        break;
      case 'start_date':
        query += ` ORDER BY start_date ASC`;
        break;
      case 'available_slots':
        query += ` ORDER BY (max_students - current_students) DESC`;
        break;
      default:
        query += ` ORDER BY create_date DESC`;
    }

    params.push(parseInt(limit as string), offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await client.query(query, params);
    
    const classes: LiveClass[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      teacher_name: row.teacher_name,
      teacher_id: row.teacher_id,
      student_list_ids: row.student_list_ids || [],
      student_list_names: row.student_list_names || [],
      start_date: row.start_date,
      end_date: row.end_date,
      class_mode: row.class_mode,
      meeting_url: row.meeting_url,
      course_name: row.course_name,
      course_id: row.course_id,
      product_id: row.product_id,
      product_name: row.product_name,
      price: row.price, // Already ceiling-ed in SQL
      is_promo: row.is_promo,
      no_promo_price: row.no_promo_price, // Already ceiling-ed in SQL
      promo_description: row.promo_description,
      stock: row.stock,
      max_students: row.max_students,
      current_students: row.current_students || 0,
      features: row.features,
      classtype: row.classtype,
      effective_start: row.effective_start,
      effective_end: row.effective_end,
      creator_name: row.creator_name,
      create_date: row.create_date,
      // NEW: Include coin fields
      coin_price: row.coin_price ? Math.ceil(row.coin_price) : undefined,
      coin_type: row.coin_type
    }));

    const total = result.rows.length > 0 ? result.rows[0].total_count : 0;
    const totalPages = Math.ceil(total / parseInt(limit as string));

    res.json({
      success: true,
      data: {
        classes,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages
        }
      }
    });

  } catch (error: any) {
    console.error('Get Live Classes Error:', error);
    
    // Better error responses
    if (error.code === '53300') {
      return res.status(503).json({ 
        success: false,
        message: 'Database connection limit reached. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    // CRITICAL: Always release the client
    client.release();
  }
}