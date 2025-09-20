// pages/api/courses/[id]/go-live.ts - Course Go Live API
import { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware, authenticateJWT, AuthenticatedRequest } from '../../../../lib/middleware/auth';
import pool from '../../../../lib/db';

interface GoLiveRequest {
  name: string;
  description: string;
  price: number;
  stock?: number;
  features?: string[];
  classtype: string;
  is_promo?: boolean;
  no_promo_price?: number;
  promo_description?: string;
  effective_start: string;
  effective_end?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply authentication middleware
    await runMiddleware(req, res, authenticateJWT);
    const authReq = req as AuthenticatedRequest;

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Only admin can go-live courses
    if (authReq.user?.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Akses ditolak. Hanya admin yang dapat melakukan go-live kursus.' 
      });
    }

    const { id: courseId } = req.query;
    const {
      name,
      description,
      price,
      stock = 999999,
      features = [],
      classtype,
      is_promo = false,
      no_promo_price,
      promo_description,
      effective_start,
      effective_end
    }: GoLiveRequest = req.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Check if course exists and is approved
      const courseResult = await client.query(`
        SELECT id, title, description, approval_status, is_deleted
        FROM courses 
        WHERE id = $1
      `, [courseId]);

      if (courseResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Kursus tidak ditemukan' });
      }

      const course = courseResult.rows[0];

      if (course.is_deleted) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Kursus telah dihapus' });
      }

      if (course.approval_status !== 'approved') {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Kursus harus disetujui terlebih dahulu sebelum go-live' });
      }

      // 2. Check if course is already live
      const existingProduct = await client.query(`
        SELECT p.product_id, p.name
        FROM products p
        JOIN product_courses pc ON p.product_id = pc.product_id
        WHERE pc.course_id = $1 AND p.type = 1
      `, [courseId]);

      if (existingProduct.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          message: 'Kursus sudah live',
          existing_product: existingProduct.rows[0]
        });
      }

      // 3. Create product
      const productResult = await client.query(`
        INSERT INTO products (name, description, stock, type, features, classtype, updated_at)
        VALUES ($1, $2, $3, 1, $4, $5, NOW())
        RETURNING product_id
      `, [
        name, 
        description, 
        stock, 
        JSON.stringify(features), 
        classtype
      ]);

      const productId = productResult.rows[0].product_id;

      // 4. Link product to course
      await client.query(`
        INSERT INTO product_courses (product_id, course_id)
        VALUES ($1, $2)
      `, [productId, courseId]);

      // 5. Set price history
      const finalPrice = is_promo ? price : price;
      const promoPrice = is_promo ? no_promo_price : null;

      await client.query(`
        INSERT INTO product_price_hist (
          product_id, price, effective_start, effective_end, description,
          is_promo, no_promo_price, promo_description
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        productId,
        finalPrice,
        effective_start,
        effective_end || null,
        `Initial price for course: ${course.title}`,
        is_promo,
        promoPrice,
        promo_description || null
      ]);

      await client.query('COMMIT');

      res.status(200).json({
        message: 'Kursus berhasil go-live!',
        data: {
          product_id: productId,
          course_id: courseId,
          course_title: course.title,
          product_name: name,
          price: finalPrice,
          is_promo,
          no_promo_price: promoPrice
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Go Live Course Error:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}