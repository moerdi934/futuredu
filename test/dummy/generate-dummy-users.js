// test/dummy/generate-dummy-users.js
// Run this script with: node test/dummy/generate-dummy-users.js (from project root)

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load environment variables - try multiple paths to find .env file
const envPaths = [
  path.resolve(__dirname, '../../.env'),  // Original path
  path.resolve(__dirname, '../.env'),     // One level up
  path.resolve(process.cwd(), '.env'),    // Current working directory
  '.env'                                  // Let dotenv search automatically
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    if (fs.existsSync(envPath)) {
      require('dotenv').config({ path: envPath });
      console.log(`✅ Environment loaded from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (error) {
    // Continue to next path
  }
}

// If no specific path worked, try default dotenv behavior
if (!envLoaded) {
  require('dotenv').config();
  console.log('🔍 Using default dotenv search...');
}

// Debug: Show which environment variables are loaded
console.log('\n📋 Environment variables check:');
console.log('DB_HOST:', process.env.DB_HOST ? '✅ loaded' : '❌ missing');
console.log('DB_USER:', process.env.DB_USER ? '✅ loaded' : '❌ missing');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ loaded' : '❌ missing');
console.log('DB_DATABASE:', process.env.DB_DATABASE ? '✅ loaded' : '❌ missing');
console.log('DB_PORT:', process.env.DB_PORT ? '✅ loaded' : '❌ missing');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('---\n');

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\nPlease check your .env file contains:');
  console.error('DB_HOST=your_host');
  console.error('DB_USER=your_username');
  console.error('DB_PASSWORD=your_password');
  console.error('DB_DATABASE=your_database');
  console.error('DB_PORT=5432');
  process.exit(1);
}

// Ensure password is a string
if (typeof process.env.DB_PASSWORD !== 'string' || process.env.DB_PASSWORD === '') {
  console.error('❌ DB_PASSWORD must be a non-empty string');
  process.exit(1);
}

console.log('✅ All required environment variables are loaded\n');

// Function to get CA certificate
const getCA = () => {
  // In production (Vercel), use environment variable
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return process.env.DATABASE_CA_CERT;
  }
  
  // In development, try to read local file
  try {
    if (fs.existsSync('./ca.pem')) {
      return fs.readFileSync('./ca.pem').toString();
    }
  } catch (error) {
    console.warn('ca.pem file not found, using SSL without custom CA');
  }
  
  return undefined;
};

const ca = getCA();

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: ca ? {
    ca: ca,
    rejectUnauthorized: false
  } : false // Disable SSL if no CA certificate
};

// Log configuration (without password for security)
console.log('🔗 Database config:');
console.log({
  host: config.host,
  user: config.user,
  database: config.database,
  port: config.port,
  ssl: config.ssl ? 'enabled' : 'disabled',
  hasCustomCA: !!ca
});
console.log('---\n');

// Database connection using your exact configuration
const pool = new Pool(config);

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Random data generators
const generateRandomData = () => {
  const jurusanOptions = ['IPA', 'IPS', 'Bahasa'];
  const jenisKelaminOptions = ['Laki-laki', 'Perempuan'];
  const pendidikanSekarangOptions = ['SMA', 'SMK'];
  const kelasOptions = ['Kelas 12'];
  
  // Generate random birth date (16-18 years old)
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - Math.floor(Math.random() * 3) - 16; // 16-18 years old
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1;
  const tanggalLahir = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
  
  // Generate random phone numbers
  const nomorWhatsapp = '62' + Math.floor(Math.random() * 900000000 + 100000000).toString();
  const nomorWhatsappOrtu = '62' + Math.floor(Math.random() * 900000000 + 100000000).toString();
  
  // Generate random graduation years
  const tahunLulusSmaSmk = currentYear + Math.floor(Math.random() * 2); // This year or next year
  const tahunMasuk = tahunLulusSmaSmk - 3; // Assuming 3 years of high school
  
  return {
    jurusan: jurusanOptions[Math.floor(Math.random() * jurusanOptions.length)],
    jenisKelamin: jenisKelaminOptions[Math.floor(Math.random() * jenisKelaminOptions.length)],
    pendidikanSekarang: pendidikanSekarangOptions[Math.floor(Math.random() * pendidikanSekarangOptions.length)],
    kelas: kelasOptions[0],
    tanggalLahir,
    nomorWhatsapp: parseInt(nomorWhatsapp),
    nomorWhatsappOrtu: parseInt(nomorWhatsappOrtu),
    tahunLulusSmaSmk,
    tahunMasuk
  };
};

// Function to get random school data
const getRandomSchoolData = async () => {
  try {
    const schoolQuery = `
      SELECT id, nama as sekolah_nama
      FROM sekolah 
      ORDER BY RANDOM() 
      LIMIT 1
    `;
    const schoolResult = await pool.query(schoolQuery);
    
    if (schoolResult.rows.length === 0) {
      throw new Error('No schools found in database');
    }
    
    return schoolResult.rows[0];
  } catch (error) {
    console.error('Error getting random school:', error);
    throw error;
  }
};

// Function to get random location data (kelurahan level)
const getRandomLocationData = async () => {
  try {
    // Get a random kelurahan and its hierarchy
    const locationQuery = `
      WITH kelurahan AS (
        SELECT id as kelurahan_id, nama as kelurahan_nama, parent_id as kecamatan_id
        FROM location 
        WHERE level = 'kelurahan' 
        ORDER BY RANDOM() 
        LIMIT 1
      ),
      kecamatan AS (
        SELECT k.kelurahan_id, k.kelurahan_nama, k.kecamatan_id, 
               l.nama as kecamatan_nama, l.parent_id as kota_id
        FROM kelurahan k
        JOIN location l ON k.kecamatan_id = l.id
      ),
      kota AS (
        SELECT kc.kelurahan_id, kc.kelurahan_nama, kc.kecamatan_id, kc.kecamatan_nama,
               kc.kota_id, l.nama as kota_nama, l.parent_id as provinsi_id
        FROM kecamatan kc
        JOIN location l ON kc.kota_id = l.id
      ),
      provinsi AS (
        SELECT kt.kelurahan_id, kt.kelurahan_nama, kt.kecamatan_id, kt.kecamatan_nama,
               kt.kota_id, kt.kota_nama, kt.provinsi_id, l.nama as provinsi_nama
        FROM kota kt
        JOIN location l ON kt.provinsi_id = l.id
      )
      SELECT * FROM provinsi
    `;
    
    const locationResult = await pool.query(locationQuery);
    
    if (locationResult.rows.length === 0) {
      throw new Error('No location data found in database');
    }
    
    return locationResult.rows[0];
  } catch (error) {
    console.error('Error getting random location:', error);
    throw error;
  }
};

// Main function to generate dummy users
const generateDummyUsers = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🚀 Starting to generate 100 dummy users...\n');
    
    // Hash the password once
    const hashedPassword = await bcrypt.hash('megaledon22', 12);
    console.log('✅ Password hashed successfully\n');
    
    for (let i = 1; i <= 100; i++) {
      const paddedNumber = i.toString().padStart(3, '0');
      const username = `dummyAg${paddedNumber}`;
      const email = `dummy.ag${paddedNumber}@example.com`;
      const namaLengkap = `Dummy Student ${paddedNumber}`;
      const namaPanggilan = `Dummy${paddedNumber}`;
      
      console.log(`Creating user ${i}/100: ${username}`);
      
      // Insert into users table
      const userInsertQuery = `
        INSERT INTO users (username, email, password, role) 
        VALUES ($1, $2, $3, 'student') 
        RETURNING id, user_id
      `;
      
      const userResult = await client.query(userInsertQuery, [
        username, 
        email, 
        hashedPassword
      ]);
      
      const userId = userResult.rows[0].id;
      const userIdString = userResult.rows[0].user_id;
      
      // Get random school and location data
      const schoolData = await getRandomSchoolData();
      const locationData = await getRandomLocationData();
      const randomData = generateRandomData();
      
      // Insert into user_account table
      const accountInsertQuery = `
        INSERT INTO user_account (
          user_id, nama_lengkap, nama_panggilan, jenis_kelamin, tanggal_lahir,
          nomor_whatsapp, nomor_whatsapp_ortu, provinsi, kota, kecamatan, kelurahan,
          pendidikan_sekarang, sekolah, kelas, jurusan, tahun_lulus_sma_smk, tahun_masuk,
          is_manual, sekolah_id, provinsi_id, city_id, kecamatan_id, kelurahan_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        )
      `;
      
      await client.query(accountInsertQuery, [
        userIdString,                           // user_id
        namaLengkap,                           // nama_lengkap
        namaPanggilan,                         // nama_panggilan
        randomData.jenisKelamin,               // jenis_kelamin
        randomData.tanggalLahir,               // tanggal_lahir
        randomData.nomorWhatsapp,              // nomor_whatsapp
        randomData.nomorWhatsappOrtu,          // nomor_whatsapp_ortu
        locationData.provinsi_nama,            // provinsi
        locationData.kota_nama,                // kota
        locationData.kecamatan_nama,           // kecamatan
        locationData.kelurahan_nama,           // kelurahan
        randomData.pendidikanSekarang,         // pendidikan_sekarang
        schoolData.sekolah_nama,               // sekolah
        randomData.kelas,                      // kelas
        randomData.jurusan,                    // jurusan
        randomData.tahunLulusSmaSmk,          // tahun_lulus_sma_smk
        randomData.tahunMasuk,                // tahun_masuk
        false,                                // is_manual
        schoolData.id,                        // sekolah_id
        locationData.provinsi_id,             // provinsi_id
        locationData.kota_id,                 // city_id
        locationData.kecamatan_id,            // kecamatan_id
        locationData.kelurahan_id             // kelurahan_id
      ]);
      
      console.log(`✓ Created user ${username} with complete account data`);
      
      // Add small delay to avoid overwhelming the database
      if (i % 10 === 0) {
        console.log(`📊 Progress: ${i}/100 users created\n`);
      }
    }
    
    await client.query('COMMIT');
    console.log('\n🎉 Successfully created 100 dummy users!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error generating dummy users:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Function to verify created users
const verifyUsers = async () => {
  try {
    const verifyQuery = `
      SELECT 
        u.username, 
        u.email, 
        u.role,
        ua.nama_lengkap,
        ua.sekolah,
        ua.kelas,
        ua.jurusan,
        ua.provinsi,
        ua.kota
      FROM users u
      LEFT JOIN user_account ua ON u.user_id = ua.user_id
      WHERE u.username LIKE 'dummyAg%'
      ORDER BY u.username
      LIMIT 5
    `;
    
    const result = await pool.query(verifyQuery);
    
    console.log('\n📋 Sample of created users:');
    console.log('=========================================');
    result.rows.forEach(user => {
      console.log(`👤 ${user.username} | ${user.nama_lengkap}`);
      console.log(`   📧 ${user.email}`);
      console.log(`   🏫 ${user.sekolah} | ${user.kelas} ${user.jurusan}`);
      console.log(`   📍 ${user.kota}, ${user.provinsi}`);
      console.log('   ---');
    });
    
    // Count total dummy users
    const countQuery = `SELECT COUNT(*) as total FROM users WHERE username LIKE 'dummyAg%'`;
    const countResult = await pool.query(countQuery);
    console.log(`\n📊 Total dummy users created: ${countResult.rows[0].total}`);
    
    // Count users with complete accounts
    const accountCountQuery = `
      SELECT COUNT(*) as total 
      FROM users u
      INNER JOIN user_account ua ON u.user_id = ua.user_id
      WHERE u.username LIKE 'dummyAg%'
    `;
    const accountCountResult = await pool.query(accountCountQuery);
    console.log(`📊 Users with complete account data: ${accountCountResult.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error verifying users:', error);
  }
};

// Function to clean up dummy users (optional)
const cleanupDummyUsers = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🧹 Cleaning up dummy users...');
    
    // Delete from user_account first (due to foreign key constraint)
    const deleteAccountQuery = `
      DELETE FROM user_account 
      WHERE user_id IN (
        SELECT user_id FROM users WHERE username LIKE 'dummyAg%'
      )
    `;
    const accountResult = await client.query(deleteAccountQuery);
    
    // Delete from users
    const deleteUserQuery = `DELETE FROM users WHERE username LIKE 'dummyAg%'`;
    const userResult = await client.query(deleteUserQuery);
    
    await client.query('COMMIT');
    
    console.log(`✅ Deleted ${accountResult.rowCount} user accounts`);
    console.log(`✅ Deleted ${userResult.rowCount} users`);
    console.log('🧹 Cleanup completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error cleaning up dummy users:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Main execution
const main = async () => {
  try {
    console.log('🚀 Dummy User Generator Script');
    console.log('============================\n');
    
    // Test database connection first
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Cannot proceed without database connection');
      process.exit(1);
    }
    
    // Check if we should cleanup first
    const args = process.argv.slice(2);
    if (args.includes('--cleanup')) {
      await cleanupDummyUsers();
      return;
    }
    
    // Check if dummy users already exist
    const existingCountQuery = `SELECT COUNT(*) as total FROM users WHERE username LIKE 'dummyAg%'`;
    const existingCount = await pool.query(existingCountQuery);
    
    if (existingCount.rows[0].total > 0) {
      console.log(`⚠️  Found ${existingCount.rows[0].total} existing dummy users`);
      console.log('Run with --cleanup flag to remove them first, or they will be skipped if usernames conflict.\n');
    }
    
    // Generate users
    await generateDummyUsers();
    
    // Verify creation
    await verifyUsers();
    
    console.log('\n✨ Script completed successfully!');
    console.log('\nLogin credentials for all dummy users:');
    console.log('👤 Username: dummyAg001 to dummyAg100');
    console.log('📧 Email: dummy.ag001@example.com to dummy.ag100@example.com');
    console.log('🔑 Password: megaledon22');
    console.log('👥 Role: student');
    console.log('\nTo cleanup these dummy users later, run:');
    console.log('node test/dummy/generate-dummy-users.js --cleanup');
    
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    console.error('\nTroubleshooting steps:');
    console.error('1. Check your .env file exists and has correct database credentials');
    console.error('2. Verify database connection and tables exist');
    console.error('3. Ensure you have the required npm packages installed');
    console.error('4. Run from the correct directory (project root)');
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Export functions for use in other scripts
module.exports = {
  generateDummyUsers,
  cleanupDummyUsers,
  verifyUsers
};

// Run main function if this script is executed directly
if (require.main === module) {
  main();
}