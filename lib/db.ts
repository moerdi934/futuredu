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
    ca: string;
    rejectUnauthorized: boolean;
  };
}

// Read CA certificate
const ca = fs.readFileSync('./ca.pem').toString();

const config: DatabaseConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
  port: parseInt(process.env.DB_PORT!),
  ssl: {
    ca: ca,
    rejectUnauthorized: false
  }
};

const pool = new Pool(config);

// Test the database connection
pool.connect((err: Error | undefined, client: PoolClient | undefined, release: () => void) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Connected to the database');
  }
  release();
});

export default pool;