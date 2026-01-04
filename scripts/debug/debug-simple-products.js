// scripts/debug/debug-simple-products.js
// Simple debug untuk product

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

async function simpleDebug() {
  const client = await pool.connect();
  
  try {
    console.log('='.repeat(80));
    console.log('🔍 SIMPLE PRODUCT DEBUG');
    console.log('='.repeat(80));
    console.log();

    // 1. Cek product_type structure
    console.log('1️⃣  Product Type table structure:');
    const ptStructure = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'product_type'
      ORDER BY ordinal_position
    `);
    console.table(ptStructure.rows);
    console.log();

    // 2. Cek isi product_type
    console.log('2️⃣  Product Type data:');
    const ptData = await client.query(`SELECT * FROM product_type ORDER BY id`);
    console.table(ptData.rows);
    console.log();

    // 3. Courses dengan products (tanpa filter type)
    console.log('3️⃣  Courses with Products (NO TYPE FILTER):');
    const coursesQuery = `
      SELECT 
        c.id as course_id,
        c.title,
        c.approval_status,
        p.product_id,
        p.name as product_name,
        p.type as product_type,
        p.stock
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      WHERE c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
      ORDER BY c.id
    `;
    const coursesResult = await client.query(coursesQuery);
    console.log(`Found ${coursesResult.rows.length} rows:`);
    console.table(coursesResult.rows);
    console.log();

    // 4. Cek price history untuk produk2 ini
    console.log('4️⃣  Price history for these products:');
    if (coursesResult.rows.length > 0) {
      const productIds = coursesResult.rows.map(r => r.product_id);
      const priceQuery = `
        SELECT 
          product_id,
          price,
          effective_start,
          effective_end,
          is_promo,
          NOW() as current_time,
          CASE 
            WHEN effective_start > NOW() THEN 'FUTURE'
            WHEN effective_start <= NOW() AND (effective_end IS NULL OR effective_end > NOW()) THEN 'CURRENT'
            ELSE 'EXPIRED'
          END as status
        FROM product_price_hist
        WHERE product_id = ANY($1::int[])
        ORDER BY product_id, effective_start DESC
      `;
      const priceResult = await client.query(priceQuery, [productIds]);
      console.log(`Found ${priceResult.rows.length} price records:`);
      console.table(priceResult.rows);
    } else {
      console.log('❌ No products found, cannot check price history');
    }
    console.log();

    // 5. Summary diagnosis
    console.log('='.repeat(80));
    console.log('📊 DIAGNOSIS SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Total courses approved: 15`);
    console.log(`✅ Courses with products: ${coursesResult.rows.length}`);
    console.log(`❌ Products with type 12: 0`);
    console.log();
    console.log('🔍 PROBLEM IDENTIFIED:');
    console.log('   The query filters for p.type = 12 (Course products)');
    console.log('   But NO products have type = 12 in the database!');
    console.log();
    console.log('   Actual product types in use:');
    console.log('   - Type 1: 3 products');
    console.log('   - Type 2: 3 products');
    console.log('   - Type 3: 11 products');
    console.log('   - Type 4: 1 product');
    console.log('   - Type 5: 1 product');
    console.log('   - Type 10: 4 products');
    console.log('   - Type 13: 5 products');
    console.log();
    console.log('💡 SOLUTION:');
    console.log('   Update the query to use the correct product type for courses.');
    console.log('   Check product_type table to find the correct type ID for courses.');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

simpleDebug();
