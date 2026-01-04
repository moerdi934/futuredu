// scripts/debug/debug-live-courses.ts
// Script untuk debug kenapa live courses cuma return 1 result

import pool from '../../lib/db';

interface DebugResult {
  step: string;
  count: number;
  sampleData?: any[];
  description: string;
}

async function debugLiveCourses() {
  const client = await pool.connect();
  const results: DebugResult[] = [];
  
  try {
    console.log('='.repeat(80));
    console.log('DEBUGGING LIVE COURSES QUERY');
    console.log('='.repeat(80));
    console.log('Timestamp:', new Date().toISOString());
    console.log('\n');

    // STEP 1: Check total courses
    console.log('STEP 1: Checking total courses in database');
    console.log('-'.repeat(80));
    const step1 = await client.query(`
      SELECT 
        COUNT(*) as total_courses,
        COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved_courses,
        COUNT(CASE WHEN is_deleted = true THEN 1 END) as deleted_courses,
        COUNT(CASE WHEN approval_status = 'approved' AND (is_deleted IS NULL OR is_deleted = false) THEN 1 END) as approved_not_deleted
      FROM courses
    `);
    console.log('Total courses:', step1.rows[0].total_courses);
    console.log('Approved courses:', step1.rows[0].approved_courses);
    console.log('Deleted courses:', step1.rows[0].deleted_courses);
    console.log('Approved & Not Deleted:', step1.rows[0].approved_not_deleted);
    results.push({
      step: 'Total Courses',
      count: parseInt(step1.rows[0].approved_not_deleted),
      description: 'Courses that are approved and not deleted',
      sampleData: step1.rows
    });
    console.log('\n');

    // STEP 2: Check courses with product linkage
    console.log('STEP 2: Checking courses linked to products');
    console.log('-'.repeat(80));
    const step2 = await client.query(`
      SELECT 
        COUNT(DISTINCT c.id) as courses_with_products,
        COUNT(DISTINCT p.product_id) as unique_products
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      WHERE c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
    `);
    console.log('Courses with products:', step2.rows[0].courses_with_products);
    console.log('Unique products:', step2.rows[0].unique_products);
    results.push({
      step: 'Courses with Products',
      count: parseInt(step2.rows[0].courses_with_products),
      description: 'Approved courses that are linked to products',
      sampleData: step2.rows
    });
    console.log('\n');

    // STEP 3: Check product type filtering
    console.log('STEP 3: Checking product type = 12 (Course products)');
    console.log('-'.repeat(80));
    const step3 = await client.query(`
      SELECT 
        COUNT(DISTINCT c.id) as courses_with_type_12,
        COUNT(DISTINCT p.product_id) as products_type_12
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      WHERE c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
        AND p.type = 12
    `);
    console.log('Courses with type 12:', step3.rows[0].courses_with_type_12);
    console.log('Products type 12:', step3.rows[0].products_type_12);
    results.push({
      step: 'Product Type Filter',
      count: parseInt(step3.rows[0].courses_with_type_12),
      description: 'Courses linked to products with type = 12',
      sampleData: step3.rows
    });
    console.log('\n');

    // STEP 4: Check stock availability
    console.log('STEP 4: Checking stock > 0');
    console.log('-'.repeat(80));
    const step4 = await client.query(`
      SELECT 
        COUNT(DISTINCT c.id) as courses_with_stock,
        COUNT(CASE WHEN p.stock = 0 THEN 1 END) as zero_stock_products,
        COUNT(CASE WHEN p.stock > 0 THEN 1 END) as positive_stock_products,
        MIN(p.stock) as min_stock,
        MAX(p.stock) as max_stock,
        AVG(p.stock)::int as avg_stock
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      WHERE c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
        AND p.type = 12
    `);
    console.log('Courses with stock > 0:', step4.rows[0].courses_with_stock);
    console.log('Zero stock products:', step4.rows[0].zero_stock_products);
    console.log('Positive stock products:', step4.rows[0].positive_stock_products);
    console.log('Stock range:', `${step4.rows[0].min_stock} - ${step4.rows[0].max_stock} (avg: ${step4.rows[0].avg_stock})`);
    
    const step4WithStock = await client.query(`
      SELECT COUNT(DISTINCT c.id) as count
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      WHERE c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
        AND p.type = 12
        AND p.stock > 0
    `);
    console.log('After filtering stock > 0:', step4WithStock.rows[0].count);
    results.push({
      step: 'Stock Filter',
      count: parseInt(step4WithStock.rows[0].count),
      description: 'Courses with products that have stock > 0',
      sampleData: step4.rows
    });
    console.log('\n');

    // STEP 5: Check price history - CRITICAL STEP
    console.log('STEP 5: Checking product_price_hist (CRITICAL - kemungkinan masalah ada disini)');
    console.log('-'.repeat(80));
    
    // First, check if there's any price history at all
    const step5Total = await client.query(`
      SELECT 
        COUNT(*) as total_price_history,
        COUNT(DISTINCT product_id) as products_with_price
      FROM product_price_hist
    `);
    console.log('Total price history records:', step5Total.rows[0].total_price_history);
    console.log('Products with price history:', step5Total.rows[0].products_with_price);
    
    // Check price history for our filtered products
    const step5Filtered = await client.query(`
      SELECT 
        COUNT(DISTINCT p.product_id) as products_with_price_hist
      FROM products p
      WHERE p.type = 12
        AND p.stock > 0
        AND EXISTS (
          SELECT 1 FROM product_price_hist pph 
          WHERE pph.product_id = p.product_id
        )
    `);
    console.log('Type 12 products with stock > 0 that have price history:', step5Filtered.rows[0].products_with_price_hist);
    
    // Check ACTIVE price history (the actual problem area)
    console.log('\nChecking ACTIVE price conditions:');
    const now = new Date();
    console.log('Current timestamp:', now.toISOString());
    
    const step5Active = await client.query(`
      SELECT 
        COUNT(DISTINCT pph.product_id) as products_with_active_or_future_price,
        COUNT(CASE WHEN pph.effective_start > NOW() THEN 1 END) as future_prices,
        COUNT(CASE WHEN pph.effective_start <= NOW() AND (pph.effective_end IS NULL OR pph.effective_end > NOW()) THEN 1 END) as current_active_prices
      FROM product_price_hist pph
      JOIN products p ON pph.product_id = p.product_id
      WHERE p.type = 12
        AND p.stock > 0
        AND (
          pph.effective_start > NOW()
          OR
          (
            pph.effective_start <= NOW()
            AND (pph.effective_end IS NULL OR pph.effective_end > NOW())
          )
        )
    `);
    console.log('Products with active or future prices:', step5Active.rows[0].products_with_active_or_future_price);
    console.log('  - Future prices (effective_start > NOW):', step5Active.rows[0].future_prices);
    console.log('  - Current active prices:', step5Active.rows[0].current_active_prices);
    
    // Sample some price history data
    const step5Sample = await client.query(`
      SELECT 
        p.product_id,
        p.name,
        pph.price,
        pph.effective_start,
        pph.effective_end,
        pph.effective_start > NOW() as is_future,
        pph.effective_start <= NOW() AND (pph.effective_end IS NULL OR pph.effective_end > NOW()) as is_active
      FROM products p
      JOIN product_price_hist pph ON p.product_id = pph.product_id
      WHERE p.type = 12
        AND p.stock > 0
      ORDER BY p.product_id, pph.effective_start DESC
      LIMIT 20
    `);
    console.log('\nSample price history data (first 20):');
    console.table(step5Sample.rows);
    
    results.push({
      step: 'Price History Check',
      count: parseInt(step5Active.rows[0].products_with_active_or_future_price),
      description: 'Products with active or future price history',
      sampleData: step5Sample.rows.slice(0, 5)
    });
    console.log('\n');

    // STEP 6: Full CTE query with LATERAL join
    console.log('STEP 6: Testing full CTE with LATERAL join');
    console.log('-'.repeat(80));
    const step6 = await client.query(`
      WITH live_courses AS (
        SELECT 
          c.id,
          c.title,
          p.product_id,
          p.name as product_name,
          p.stock,
          ph.price,
          ph.effective_start,
          ph.effective_end,
          ph.is_promo
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
        WHERE c.approval_status = 'approved'
          AND (c.is_deleted IS NULL OR c.is_deleted = false)
          AND p.type = 12
          AND p.stock > 0
      )
      SELECT COUNT(*) as count
      FROM live_courses
    `);
    console.log('Courses after LATERAL join:', step6.rows[0].count);
    results.push({
      step: 'After LATERAL Join',
      count: parseInt(step6.rows[0].count),
      description: 'Courses that successfully joined with price history',
      sampleData: step6.rows
    });
    console.log('\n');

    // STEP 7: Final filter - active price
    console.log('STEP 7: Final filter - checking active price requirement');
    console.log('-'.repeat(80));
    const step7 = await client.query(`
      WITH live_courses AS (
        SELECT 
          c.id,
          c.title,
          p.product_id,
          p.name as product_name,
          p.stock,
          ph.price,
          ph.effective_start,
          ph.effective_end,
          ph.is_promo
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
        WHERE c.approval_status = 'approved'
          AND (c.is_deleted IS NULL OR c.is_deleted = false)
          AND p.type = 12
          AND p.stock > 0
          AND (
            ph.effective_start <= NOW()
            AND (ph.effective_end IS NULL OR ph.effective_end > NOW())
          )
      )
      SELECT COUNT(*) as count
      FROM live_courses
    `);
    console.log('Final count after active price filter:', step7.rows[0].count);
    console.log('⚠️  THIS IS THE ACTUAL RESULT RETURNED BY API');
    results.push({
      step: 'Final Active Price Filter',
      count: parseInt(step7.rows[0].count),
      description: 'FINAL RESULT - Courses with currently active prices only',
      sampleData: step7.rows
    });
    console.log('\n');

    // STEP 8: Get actual data to see what passed all filters
    console.log('STEP 8: Getting actual course data that passed all filters');
    console.log('-'.repeat(80));
    const step8 = await client.query(`
      WITH live_courses AS (
        SELECT 
          c.id,
          c.title,
          p.product_id,
          p.name as product_name,
          p.stock,
          p.type,
          ph.price,
          ph.effective_start,
          ph.effective_end,
          ph.is_promo,
          c.approval_status,
          c.is_deleted,
          c.create_date
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
        WHERE c.approval_status = 'approved'
          AND (c.is_deleted IS NULL OR c.is_deleted = false)
          AND p.type = 12
          AND p.stock > 0
          AND (
            ph.effective_start <= NOW()
            AND (ph.effective_end IS NULL OR ph.effective_end > NOW())
          )
      )
      SELECT *
      FROM live_courses
      ORDER BY create_date DESC
    `);
    console.log(`Found ${step8.rows.length} course(s):`);
    console.table(step8.rows);
    console.log('\n');

    // STEP 9: Investigate why other courses failed
    console.log('STEP 9: Investigating courses that FAILED the filters');
    console.log('-'.repeat(80));
    const step9 = await client.query(`
      SELECT 
        c.id,
        c.title,
        p.product_id,
        p.name as product_name,
        p.stock,
        p.type,
        c.approval_status,
        c.is_deleted,
        CASE 
          WHEN p.type != 12 THEN 'Wrong product type'
          WHEN p.stock <= 0 THEN 'No stock'
          WHEN NOT EXISTS (
            SELECT 1 FROM product_price_hist pph 
            WHERE pph.product_id = p.product_id
          ) THEN 'No price history'
          WHEN NOT EXISTS (
            SELECT 1 FROM product_price_hist pph 
            WHERE pph.product_id = p.product_id
              AND (
                pph.effective_start > NOW()
                OR (
                  pph.effective_start <= NOW()
                  AND (pph.effective_end IS NULL OR pph.effective_end > NOW())
                )
              )
          ) THEN 'No active/future price'
          ELSE 'Price not currently active'
        END as failure_reason,
        (SELECT COUNT(*) FROM product_price_hist WHERE product_id = p.product_id) as price_history_count,
        (SELECT MAX(effective_start) FROM product_price_hist WHERE product_id = p.product_id) as latest_price_start,
        (SELECT MAX(effective_end) FROM product_price_hist WHERE product_id = p.product_id) as latest_price_end
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      WHERE c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
      ORDER BY c.id
      LIMIT 30
    `);
    console.log('Sample of courses and why they might fail:');
    console.table(step9.rows);
    console.log('\n');

    // SUMMARY
    console.log('='.repeat(80));
    console.log('SUMMARY OF FINDINGS');
    console.log('='.repeat(80));
    console.log('\nData funnel (how many courses at each step):');
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.step}: ${result.count} courses`);
      console.log(`   → ${result.description}`);
    });
    
    console.log('\n\n🔍 ANALISIS:');
    console.log('-'.repeat(80));
    
    const dropBetweenSteps: { [key: string]: number } = {};
    for (let i = 1; i < results.length; i++) {
      const drop = results[i - 1].count - results[i].count;
      if (drop > 0) {
        dropBetweenSteps[`${results[i - 1].step} → ${results[i].step}`] = drop;
      }
    }
    
    console.log('\nKehilangan data terbesar terjadi di:');
    const sortedDrops = Object.entries(dropBetweenSteps).sort((a, b) => b[1] - a[1]);
    sortedDrops.forEach(([transition, drop], index) => {
      console.log(`${index + 1}. ${transition}: kehilangan ${drop} courses`);
    });
    
    console.log('\n\n⚠️  KEMUNGKINAN MASALAH:');
    console.log('-'.repeat(80));
    
    if (results[results.length - 1].count === 1) {
      console.log('✓ Hasil akhir memang cuma 1 course');
      console.log('\nKemungkinan penyebab:');
      console.log('1. **PRICE HISTORY FILTER TERLALU KETAT**');
      console.log('   - Filter mungkin terlalu restriktif untuk effective_start dan effective_end');
      console.log('   - Banyak produk yang punya price history tapi tidak "currently active"');
      console.log('   - Ada konflik antara LATERAL join yang ambil future/active price,');
      console.log('     tapi WHERE clause cuma mau yang "currently active"');
      console.log('\n2. **Stock habis** - Banyak produk yang stock-nya 0');
      console.log('\n3. **Price history tidak up-to-date** - effective_start/end tidak proper');
      console.log('\n4. **Product type** - Sedikit produk dengan type = 12');
    }
    
    console.log('\n\n💡 REKOMENDASI SOLUSI:');
    console.log('-'.repeat(80));
    console.log('1. Review logic price history - apakah perlu BOTH kondisi:');
    console.log('   a) LATERAL join filter (active OR future)');
    console.log('   b) WHERE clause filter (active only)');
    console.log('   → Mungkin WHERE clause terakhir ini yang bikin banyak data dropped');
    console.log('\n2. Pertimbangkan relax filter untuk include future prices');
    console.log('\n3. Update price history untuk produk-produk yang valid');
    console.log('\n4. Review business logic: apakah benar cuma show "currently active" prices?');
    console.log('   Atau seharusnya show "active or upcoming" prices?');
    
    console.log('\n' + '='.repeat(80));
    console.log('DEBUG SELESAI');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error during debug:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the debug
debugLiveCourses()
  .then(() => {
    console.log('\n✅ Debug script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Debug script failed:', error);
    process.exit(1);
  });
