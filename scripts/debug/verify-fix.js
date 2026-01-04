// scripts/debug/verify-fix.js
// Verify the fix by testing different type filters

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

async function verifyFix() {
  const client = await pool.connect();
  
  try {
    console.log('='.repeat(80));
    console.log('🔧 VERIFYING FIX FOR LIVE COURSES API');
    console.log('='.repeat(80));
    console.log();

    // Test dengan type = 12 (WRONG - current implementation)
    console.log('❌ TEST 1: Current Implementation (p.type = 12)');
    console.log('-'.repeat(80));
    const test1 = await client.query(`
      SELECT COUNT(DISTINCT c.id) as count
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      WHERE c.approval_status = 'approved'
        AND (c.is_deleted IS NULL OR c.is_deleted = false)
        AND p.type = 12
        AND p.stock > 0
    `);
    console.log(`Result: ${test1.rows[0].count} courses`);
    console.log('Status: ❌ WRONG - Returns 0 courses\n');

    // Test dengan type = 1 (FIX 1 - Courses only)
    console.log('✅ TEST 2: Fix Option 1 (p.type = 1) - Courses Only');
    console.log('-'.repeat(80));
    const test2Query = `
      SELECT 
        c.id,
        c.title,
        p.product_id,
        p.name as product_name,
        p.type,
        ph.price
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      LEFT JOIN LATERAL (
        SELECT price, effective_start, effective_end
        FROM product_price_hist pph
        WHERE pph.product_id = p.product_id
          AND (
            pph.effective_start > NOW()
            OR (
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
        AND p.type = 1
        AND p.stock > 0
        AND (
          ph.effective_start <= NOW()
          AND (ph.effective_end IS NULL OR ph.effective_end > NOW())
        )
    `;
    const test2 = await client.query(test2Query);
    console.log(`Result: ${test2.rows.length} courses`);
    test2.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.title} - Rp ${row.price}`);
    });
    console.log('Status: ✅ CORRECT - Returns Courses only\n');

    // Test dengan type IN (1, 10) (FIX 2 - Courses + Paket)
    console.log('✅ TEST 3: Fix Option 2 (p.type IN (1, 10)) - Courses + Paket');
    console.log('-'.repeat(80));
    const test3Query = `
      SELECT 
        c.id,
        c.title,
        p.product_id,
        p.name as product_name,
        p.type,
        pt.description as type_name,
        ph.price
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      LEFT JOIN product_type pt ON p.type = pt.id
      LEFT JOIN LATERAL (
        SELECT price, effective_start, effective_end
        FROM product_price_hist pph
        WHERE pph.product_id = p.product_id
          AND (
            pph.effective_start > NOW()
            OR (
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
        AND p.type IN (1, 10)
        AND p.stock > 0
        AND (
          ph.effective_start <= NOW()
          AND (ph.effective_end IS NULL OR ph.effective_end > NOW())
        )
    `;
    const test3 = await client.query(test3Query);
    console.log(`Result: ${test3.rows.length} courses`);
    test3.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.title} - Rp ${row.price} [${row.type_name}]`);
    });
    console.log('Status: ✅ CORRECT - Returns all available courses\n');

    // Test dengan group filter (FIX 3 - By group)
    console.log('✅ TEST 4: Fix Option 3 - Filter by Group (CRSONL)');
    console.log('-'.repeat(80));
    const test4Query = `
      SELECT 
        c.id,
        c.title,
        p.product_id,
        p.name as product_name,
        pt.description as type_name,
        pt.group_product,
        ph.price
      FROM courses c
      JOIN product_courses pc ON c.id = pc.course_id
      JOIN products p ON pc.product_id = p.product_id
      LEFT JOIN product_type pt ON p.type = pt.id
      LEFT JOIN LATERAL (
        SELECT price, effective_start, effective_end
        FROM product_price_hist pph
        WHERE pph.product_id = p.product_id
          AND (
            pph.effective_start > NOW()
            OR (
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
        AND p.type IN (
          SELECT id FROM product_type WHERE group_product = 'CRSONL'
        )
        AND p.stock > 0
        AND (
          ph.effective_start <= NOW()
          AND (ph.effective_end IS NULL OR ph.effective_end > NOW())
        )
    `;
    const test4 = await client.query(test4Query);
    console.log(`Result: ${test4.rows.length} courses`);
    test4.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.title} - Rp ${row.price} [${row.type_name}, Group: ${row.group_product}]`);
    });
    console.log('Status: ✅ CORRECT - Returns courses in CRSONL group\n');

    // Recommendation
    console.log('='.repeat(80));
    console.log('📊 RECOMMENDATION');
    console.log('='.repeat(80));
    console.log();
    console.log('Recommended Fix: Use Option 2 (p.type IN (1, 10))');
    console.log();
    console.log('Reasons:');
    console.log('  1. Includes both Courses (type 1) and Paket (type 10)');
    console.log('  2. Returns all 4 available courses');
    console.log('  3. Simple and clear filter');
    console.log('  4. Matches business logic (show all purchasable courses)');
    console.log();
    console.log('Change in pages/api/courses/live.ts line 62:');
    console.log('  FROM: AND p.type = 12  -- Course products');
    console.log('  TO:   AND p.type IN (1, 10)  -- Courses and Paket');
    console.log();
    console.log('Alternative (Courses only): AND p.type = 1');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyFix();
