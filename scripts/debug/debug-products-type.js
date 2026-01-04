// scripts/debug/debug-products-type.js
// Debug untuk cek product types

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: { rejectUnauthorized: false },
  max: 20,
});

async function debugProductTypes() {
  const client = await pool.connect();
  
  try {
    console.log('='.repeat(80));
    console.log('🔍 DEBUGGING PRODUCT TYPES');
    console.log('='.repeat(80));
    console.log();

    // Check all product types
    console.log('📊 All product types in database:');
    console.log('-'.repeat(80));
    const typesQuery = `
      SELECT 
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN stock > 0 THEN 1 END) as with_stock
      FROM products
      GROUP BY type
      ORDER BY type
    `;
    const typesResult = await client.query(typesQuery);
    console.table(typesResult.rows);
    console.log();

    // Check product_type table
    console.log('📊 Product Type reference table:');
    console.log('-'.repeat(80));
    const productTypeQuery = `
      SELECT * FROM product_type
      ORDER BY type_id
    `;
    const productTypeResult = await client.query(productTypeQuery);
    console.table(productTypeResult.rows);
    console.log();

    // Check courses connected to products
    console.log('📊 Courses with products (all types):');
    console.log('-'.repeat(80));
    const coursesProductsQuery = `
      SELECT 
        c.id,
        c.title,
        p.product_id,
        p.name as product_name,
        p.type,
        p.stock,
        pt.name as type_name
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      LEFT JOIN product_type pt ON p.type = pt.type_id
      WHERE c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
      ORDER BY c.id
    `;
    const coursesProductsResult = await client.query(coursesProductsQuery);
    console.log(`Found ${coursesProductsResult.rows.length} courses with products:`);
    console.table(coursesProductsResult.rows);
    console.log();

    // Check if type should be different
    console.log('📊 Checking product name patterns:');
    console.log('-'.repeat(80));
    const patternsQuery = `
      SELECT 
        product_id,
        name,
        type,
        stock,
        CASE 
          WHEN name ILIKE '%course%' THEN 'Likely Course'
          WHEN name ILIKE '%class%' THEN 'Likely Class'
          WHEN name ILIKE '%tryout%' THEN 'Likely Tryout'
          WHEN name ILIKE '%video%' THEN 'Likely Video'
          ELSE 'Unknown'
        END as guessed_type
      FROM products
      WHERE product_id IN (
        SELECT pc.product_id 
        FROM product_courses pc
        JOIN courses c ON pc.course_id = c.id
        WHERE c.approval_status = 'approved'
      )
    `;
    const patternsResult = await client.query(patternsQuery);
    console.table(patternsResult.rows);
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

debugProductTypes();
