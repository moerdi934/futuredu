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
    rejectUnauthorized: false // SSL tanpa custom certificate
  }
};

// Log configuration (tanpa password)
console.log('Database config:', {
  host: config.host,
  user: config.user,
  database: config.database,
  port: config.port,
  ssl: config.ssl ? 'enabled' : 'disabled',
  hasCustomCA: !!ca
});

const pool = new Pool(config);

// Test the database connection
pool.connect((err: Error | undefined, client: PoolClient | undefined, release: () => void) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Connected to the database');
  }
  if (release) release();
});

export default pool;