// lib/db.ts
import { Pool, PoolClient } from 'pg';
import * as fs from 'fs';

// Types
export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  ssl: {
    ca?: string;
    rejectUnauthorized: boolean;
  } | boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  statement_timeout?: number;
  query_timeout?: number;
}

// Function to get CA certificate
const getCA = (): string | undefined => {
  // Di production (Vercel), gunakan environment variable
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return process.env.DATABASE_CA_CERT;
  }
  
  // Di development, coba baca file lokal
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

const config: DatabaseConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: ca ? {
    ca: ca,
    rejectUnauthorized: false
  } : {
    rejectUnauthorized: false
  },
  // ⭐ Konfigurasi pool yang optimal
  max: 3, // maksimum 20 koneksi (jangan terlalu besar)
  idleTimeoutMillis: 10000, // 30 detik
  connectionTimeoutMillis: 10000, // 10 detik (lebih dari 2 detik)
  statement_timeout: 30000, // 30 detik untuk query
  query_timeout: 30000, // 30 detik timeout
};

// Log configuration (tanpa password)
console.log('Database config:', {
  host: config.host,
  user: config.user,
  database: config.database,
  port: config.port,
  ssl: config.ssl ? 'enabled' : 'disabled',
  hasCustomCA: !!ca,
  maxConnections: config.max,
  idleTimeout: config.idleTimeoutMillis,
  connectionTimeout: config.connectionTimeoutMillis,
});

// Create pool instance
const pool = new Pool(config);

// Event listeners untuk monitoring dan debugging
pool.on('connect', (client) => {
  console.log('New client connected to pool');
  // Set statement timeout untuk setiap koneksi
  client.query('SET statement_timeout = 30000');
});

pool.on('acquire', () => {
  console.log('Client acquired from pool');
});

pool.on('remove', () => {
  console.log('Client removed from pool');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Jangan exit process, biarkan pool handle error
});

// Test the database connection dengan error handling yang baik
(async () => {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    console.log('✅ Connected to the database successfully');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database test query successful:', result.rows[0]);
    
    console.log('Pool status - Total:', pool.totalCount, 'Idle:', pool.idleCount, 'Waiting:', pool.waitingCount);
  } catch (err) {
    console.error('❌ Error connecting to database:', err);
    console.error('Please check your database configuration and network connectivity');
  } finally {
    if (client) {
      client.release();
    }
  }
})();

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  try {
    await pool.end();
    console.log('Database pool closed successfully');
  } catch (err) {
    console.error('Error during pool shutdown:', err);
  }
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default pool;