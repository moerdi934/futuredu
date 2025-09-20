    // pages/api/courses/live.ts - Get Live Courses API
    import { NextApiRequest, NextApiResponse } from 'next';
    import pool from '../../../lib/db';

    interface LiveCourse {
    id: number;
    title: string;
    description: string;
    imageUrl?: string;
    learning_point?: any[];
    course_string?: string;
    product_id: number;
    product_name: string;
    price: number;
    is_promo: boolean;
    no_promo_price?: number;
    promo_description?: string;
    stock: number;
    features?: string[];
    classtype: string;
    effective_start: string;
    effective_end?: string;
    creator_name?: string;
    create_date: string;
    }

    export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const {
        search = '',
        page = '1',
        limit = '12',
        classtype = 'all',
        sortBy = 'newest',
        minPrice,
        maxPrice
        } = req.query;

        const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
        
        // Base query for live courses
        let query = `
        WITH live_courses AS (
            SELECT 
            c.id,
            c.title,
            c.description,
            c.imageurl,
            c.learning_point,
            c.course_string,
            c.create_date,
            cu.user_code || '-' || ua.nama_lengkap AS creator_name,
            p.product_id,
            p.name as product_name,
            p.stock,
            p.features,
            p.classtype,
            -- Get current price with promo info
            ph.price,
            ph.is_promo,
            ph.no_promo_price,
            ph.promo_description,
            ph.effective_start,
            ph.effective_end
            FROM courses c
            JOIN product_courses pc ON c.id = pc.course_id
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
            LEFT JOIN users cu ON c.create_user_id = cu.id
            LEFT JOIN user_account ua ON ua.user_id = cu.user_id
            WHERE c.approval_status = 'approved'
            AND (c.is_deleted IS NULL OR c.is_deleted = false)
            AND p.type = 1
            AND p.stock > 0
        )
        SELECT *, COUNT(*) OVER() as total_count
        FROM live_courses
        WHERE 1=1
        `;

        const params: any[] = [];
        
        // Search filter
        if (search) {
        params.push(`%${search}%`);
        query += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length} OR product_name ILIKE $${params.length})`;
        }

        // Classtype filter
        if (classtype !== 'all') {
        params.push(classtype);
        query += ` AND classtype = $${params.length}`;
        }

        // Price filter
        if (minPrice) {
        params.push(parseInt(minPrice as string));
        query += ` AND price >= $${params.length}`;
        }
        if (maxPrice) {
        params.push(parseInt(maxPrice as string));
        query += ` AND price <= $${params.length}`;
        }

        // Sorting
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
            query += ` ORDER BY title ASC`;
            break;
        case 'name_desc':
            query += ` ORDER BY title DESC`;
            break;
        default:
            query += ` ORDER BY create_date DESC`;
        }

        // Pagination
        params.push(parseInt(limit as string), offset);
        query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

        const result = await pool.query(query, params);
        
        const courses: LiveCourse[] = result.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        imageUrl: row.imageurl,
        learning_point: row.learning_point,
        course_string: row.course_string,
        product_id: row.product_id,
        product_name: row.product_name,
        price: row.price,
        is_promo: row.is_promo,
        no_promo_price: row.no_promo_price,
        promo_description: row.promo_description,
        stock: row.stock,
        features: row.features,
        classtype: row.classtype,
        effective_start: row.effective_start,
        effective_end: row.effective_end,
        creator_name: row.creator_name,
        create_date: row.create_date
        }));

        const total = result.rows.length > 0 ? result.rows[0].total_count : 0;
        const totalPages = Math.ceil(total / parseInt(limit as string));

        res.json({
        success: true,
        data: {
            courses,
            pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            totalPages
            }
        }
        });

    } catch (error) {
        console.error('Get Live Courses Error:', error);
        res.status(500).json({ 
        message: 'Server Error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
    }