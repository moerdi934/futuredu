// pages/api/exam-schedules/public.ts - Dedicated Public Endpoint
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export interface PublicExamSchedule {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  exam_type: string;
  isfree: boolean;
  is_valid: boolean;
  approval_status: string;
  creator_name?: string;
  create_date: string;
  description?: string;
  // Pricing information
  price?: number;
  original_price?: number;
  is_promo?: boolean;
  promo_description?: string;
  is_live?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Parse query parameters
    const {
      includeDeleted = 'false',
      approvalStatus = 'approved',
      is_valid = 'true',
      exam_type,
      isfree
    } = req.query;

    // Build the base query for public exam schedules with pricing info
    // Updated to use product_type join for exam_type
    let query = `
      SELECT 
        es.id,
        es.name,
        es.start_time,
        es.end_time,
        COALESCE(pt.description, 'Unknown') as exam_type,
        es.isfree,
        es.is_valid,
        es.approval_status,
        es.create_date,
        es.description,
        us.name as creator_name,
        -- Pricing information
        p.price,
        p.no_promo_price as original_price,
        p.is_promo,
        p.promo_description,
        CASE WHEN p.product_id IS NOT NULL THEN true ELSE false END as is_live
      FROM exam_schedule es
      LEFT JOIN product_type pt ON pt.id = es.type
      LEFT JOIN v_dashboard_userdata us ON us.userid = es.created_by
      LEFT JOIN product_exam_schedules pes ON pes.exam_schedule_id = es.id
      LEFT JOIN products prod ON prod.product_id = pes.product_id
      LEFT JOIN product_price_hist p ON p.product_id = prod.product_id 
        AND p.effective_start <= NOW() 
        AND (p.effective_end IS NULL OR p.effective_end >= NOW())
      WHERE 1=1
    `;

    const values: any[] = [];
    let paramCount = 1;

    // Always hide AUTOCREATE schedules from public view
    query += ` AND NOT (es.description ILIKE 'AUTOCREATE%')`;

    // Filter by approval status
    if (approvalStatus && approvalStatus !== 'all') {
      query += ` AND es.approval_status = $${paramCount}`;
      values.push(approvalStatus);
      paramCount++;
    }

    // Filter by validity
    if (is_valid && is_valid !== 'all') {
      query += ` AND es.is_valid = $${paramCount}`;
      values.push(is_valid === 'true');
      paramCount++;
    }

    // Filter by exam type - Updated to use product_type.description
    if (exam_type && exam_type !== 'all') {
      query += ` AND pt.description = $${paramCount}`;
      values.push(exam_type);
      paramCount++;
    }

    // Filter by free status
    if (isfree && isfree !== 'all') {
      query += ` AND es.isfree = $${paramCount}`;
      values.push(isfree === 'true');
      paramCount++;
    }

    // Filter deleted schedules
    if (includeDeleted === 'false') {
      query += ` AND (es.is_deleted IS NULL OR es.is_deleted = false)`;
    } else if (includeDeleted === 'only_deleted') {
      query += ` AND es.is_deleted = true`;
    }
    // If includeDeleted === 'true', don't add any filter (show all)

    // Order by: free schedules first, then by exam_type, then by creation date
    query += ` 
      ORDER BY 
        es.isfree DESC,
        pt.description ASC,
        es.create_date DESC
    `;

    console.log('Public Exam Schedules Query:', query);
    console.log('Query Parameters:', values);

    const result = await pool.query(query, values);
    
    const schedules: PublicExamSchedule[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      start_time: row.start_time,
      end_time: row.end_time,
      exam_type: row.exam_type || 'Unknown',
      isfree: row.isfree,
      is_valid: row.is_valid,
      approval_status: row.approval_status,
      creator_name: row.creator_name,
      create_date: row.create_date,
      description: row.description,
      // Pricing information
      price: row.price || 0,
      original_price: row.original_price || null,
      is_promo: row.is_promo || false,
      promo_description: row.promo_description || null,
      is_live: row.is_live || false
    }));

    // Group schedules by exam_type (optional, for easier frontend processing)
    const groupedSchedules = schedules.reduce((acc, schedule) => {
      const examType = schedule.exam_type;
      if (!acc[examType]) {
        acc[examType] = { free: [], paid: [] };
      }
      
      if (schedule.isfree) {
        acc[examType].free.push(schedule);
      } else {
        acc[examType].paid.push(schedule);
      }
      
      return acc;
    }, {} as Record<string, { free: PublicExamSchedule[]; paid: PublicExamSchedule[] }>);

    // Add cache control headers for better performance
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json({
      success: true,
      data: schedules,
      grouped: groupedSchedules,
      total: schedules.length,
      message: 'Public exam schedules retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching public exam schedules:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}