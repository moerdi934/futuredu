// scripts/debug/debug-live-courses.js
// Debug script untuk menganalisis kenapa GET /api/courses/live hanya return 1 result

require('dotenv').config();
const { Pool } = require('pg');

// Setup database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function debugLiveCourses() {
  const client = await pool.connect();
  
  try {
    console.log('='.repeat(80));
    console.log('🔍 DEBUGGING LIVE COURSES QUERY');
    console.log('='.repeat(80));
    console.log();

    // STEP 1: Check total courses
    console.log('📊 STEP 1: Total courses in database');
    console.log('-'.repeat(80));
    const totalCoursesQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN is_deleted = true THEN 1 END) as deleted
      FROM courses
    `;
    const totalCoursesResult = await client.query(totalCoursesQuery);
    console.log('Total courses:', totalCoursesResult.rows[0]);
    console.log();

    // STEP 2: Check product_courses relationship
    console.log('📊 STEP 2: Courses with products');
    console.log('-'.repeat(80));
    const coursesWithProductsQuery = `
      SELECT 
        COUNT(DISTINCT c.id) as courses_with_products,
        COUNT(DISTINCT p.product_id) as unique_products
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      WHERE c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
    `;
    const coursesWithProductsResult = await client.query(coursesWithProductsQuery);
    console.log('Result:', coursesWithProductsResult.rows[0]);
    console.log();

    // STEP 3: Check products with type 12
    console.log('📊 STEP 3: Products with type 12 (Course products)');
    console.log('-'.repeat(80));
    const type12Query = `
      SELECT 
        COUNT(DISTINCT c.id) as courses_count,
        COUNT(DISTINCT p.product_id) as products_count
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      WHERE c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
        AND p.type = 12
    `;
    const type12Result = await client.query(type12Query);
    console.log('Result:', type12Result.rows[0]);
    console.log();

    // STEP 4: Check stock > 0
    console.log('📊 STEP 4: Products with stock > 0');
    console.log('-'.repeat(80));
    const stockQuery = `
      SELECT 
        COUNT(DISTINCT c.id) as courses_count,
        MIN(p.stock) as min_stock,
        MAX(p.stock) as max_stock,
        AVG(p.stock) as avg_stock
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      WHERE c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
        AND p.type = 12
        AND p.stock > 0
    `;
    const stockResult = await client.query(stockQuery);
    console.log('Result:', stockResult.rows[0]);
    console.log();

    // STEP 5: Check price history - CRITICAL PART!
    console.log('📊 STEP 5: Analyzing product_price_hist (CRITICAL!)');
    console.log('-'.repeat(80));
    
    // 5a: Total price records
    const priceHistTotalQuery = `
      SELECT COUNT(*) as total_price_records
      FROM product_price_hist
    `;
    const priceHistTotal = await client.query(priceHistTotalQuery);
    console.log('Total price history records:', priceHistTotal.rows[0].total_price_records);
    
    // 5b: Check products without price history
    const noPriceQuery = `
      SELECT 
        p.product_id,
        p.name,
        p.type,
        p.stock
      FROM products p
      WHERE p.type = 12 
        AND p.stock > 0
        AND NOT EXISTS (
          SELECT 1 FROM product_price_hist pph 
          WHERE pph.product_id = p.product_id
        )
      LIMIT 10
    `;
    const noPriceResult = await client.query(noPriceQuery);
    console.log(`\nProducts WITHOUT price history: ${noPriceResult.rows.length}`);
    if (noPriceResult.rows.length > 0) {
      console.log('Sample products without price:');
      noPriceResult.rows.forEach(row => {
        console.log(`  - ID: ${row.product_id}, Name: ${row.name}, Stock: ${row.stock}`);
      });
    }
    
    // 5c: Check price records by date condition
    console.log('\n📅 Price history by effective date:');
    const priceByDateQuery = `
      SELECT 
        COUNT(CASE WHEN effective_start > NOW() THEN 1 END) as future_prices,
        COUNT(CASE WHEN effective_start <= NOW() AND (effective_end IS NULL OR effective_end > NOW()) THEN 1 END) as current_prices,
        COUNT(CASE WHEN effective_end <= NOW() THEN 1 END) as expired_prices
      FROM product_price_hist pph
      JOIN products p ON pph.product_id = p.product_id
      WHERE p.type = 12 AND p.stock > 0
    `;
    const priceByDateResult = await client.query(priceByDateQuery);
    console.log('Price distribution:', priceByDateResult.rows[0]);
    console.log();

    // STEP 6: Check the LATERAL JOIN result
    console.log('📊 STEP 6: Products with valid current OR future prices');
    console.log('-'.repeat(80));
    const lateralCheckQuery = `
      SELECT 
        COUNT(DISTINCT p.product_id) as products_with_price
      FROM products p
      WHERE p.type = 12 
        AND p.stock > 0
        AND EXISTS (
          SELECT 1 
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
        )
    `;
    const lateralCheckResult = await client.query(lateralCheckQuery);
    console.log('Products with current or future prices:', lateralCheckResult.rows[0]);
    console.log();

    // STEP 7: The problematic WHERE clause
    console.log('📊 STEP 7: Apply FINAL WHERE clause (current prices only)');
    console.log('-'.repeat(80));
    const finalWhereQuery = `
      SELECT 
        COUNT(DISTINCT c.id) as final_courses_count
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      LEFT JOIN LATERAL (
        SELECT
          pph.price,
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
      WHERE c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
        AND p.type = 12
        AND p.stock > 0
        AND (
          ph.effective_start <= NOW()
          AND (ph.effective_end IS NULL OR ph.effective_end > NOW())
        )
    `;
    const finalWhereResult = await client.query(finalWhereQuery);
    console.log('⚠️  FINAL RESULT with WHERE clause:', finalWhereResult.rows[0]);
    console.log();

    // STEP 8: Sample data - show what passes and what doesn't
    console.log('📊 STEP 8: Sample data analysis');
    console.log('-'.repeat(80));
    const sampleQuery = `
      SELECT 
        c.id as course_id,
        c.title,
        p.product_id,
        p.name as product_name,
        ph.price,
        ph.effective_start,
        ph.effective_end,
        CASE 
          WHEN ph.effective_start <= NOW() AND (ph.effective_end IS NULL OR ph.effective_end > NOW())
          THEN 'PASS ✅'
          ELSE 'FAIL ❌'
        END as passes_filter,
        NOW() as current_time
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      LEFT JOIN LATERAL (
        SELECT
          pph.price,
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
      WHERE c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
        AND p.type = 12
        AND p.stock > 0
      LIMIT 10
    `;
    const sampleResult = await client.query(sampleQuery);
    console.log(`Total samples found: ${sampleResult.rows.length}`);
    console.log();
    sampleResult.rows.forEach((row, idx) => {
      console.log(`Sample ${idx + 1}: ${row.passes_filter}`);
      console.log(`  Course: ${row.title}`);
      console.log(`  Product: ${row.product_name} (ID: ${row.product_id})`);
      console.log(`  Price: ${row.price}`);
      console.log(`  Current Time: ${row.current_time}`);
      console.log(`  Effective Start: ${row.effective_start}`);
      console.log(`  Effective End: ${row.effective_end || 'NULL'}`);
      console.log();
    });

    // DIAGNOSIS
    console.log('='.repeat(80));
    console.log('🔍 DIAGNOSIS');
    console.log('='.repeat(80));
    
    const diagnosis = [];
    
    if (lateralCheckResult.rows[0].products_with_price > 1 && 
        finalWhereResult.rows[0].final_courses_count === 1) {
      diagnosis.push('⚠️  PROBLEM IDENTIFIED!');
      diagnosis.push('The LATERAL JOIN finds multiple products with prices,');
      diagnosis.push('BUT the final WHERE clause filters most of them out!');
      diagnosis.push('');
      diagnosis.push('ISSUE: The WHERE clause requires:');
      diagnosis.push('  ph.effective_start <= NOW()');
      diagnosis.push('');
      diagnosis.push('However, the LATERAL JOIN prioritizes FUTURE prices:');
      diagnosis.push('  ORDER BY (pph.effective_start > NOW()) DESC');
      diagnosis.push('');
      diagnosis.push('This means: If a product has a future price, that future');
      diagnosis.push('price is selected by LATERAL, then rejected by WHERE!');
      diagnosis.push('');
      diagnosis.push('💡 SOLUTION:');
      diagnosis.push('Remove future prices from LATERAL JOIN, OR');
      diagnosis.push('Remove the WHERE clause filter for effective_start');
    }
    
    if (noPriceResult.rows.length > 0) {
      diagnosis.push(`⚠️  ${noPriceResult.rows.length} products have NO price history at all!`);
    }
    
    console.log(diagnosis.join('\n'));
    console.log();
    
    console.log('='.repeat(80));
    console.log('✅ ANALYSIS COMPLETE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error during analysis:', error);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the debug
debugLiveCourses();
