// utils/attendanceTokenGenerator.ts
import pool from '../lib/db';      // pakai alias "~" / "@" kalau sudah di-set di tsconfig.json
import { QueryResult } from 'pg';

/**
 * Menghasilkan string acak 8 digit.
 */
export const generateRandomToken = (): string =>
  Math.floor(10000000 + Math.random() * 90000000).toString();

/**
 * Mengecek apakah token sudah dipakai di tabel dimCodeAttendance.
 */
const tokenExists = async (token: string): Promise<boolean> => {
  const res: QueryResult = await pool.query(
    'SELECT 1 FROM dimCodeAttendance WHERE token = $1 LIMIT 1',
    [token]
  );
  return res.rowCount > 0;
};

/**
 * Loop sampai dapat token yang benar-benar unik.
 */
export const generateUniqueToken = async (): Promise<string> => {
  let token = generateRandomToken();
  while (await tokenExists(token)) {
    token = generateRandomToken();
  }
  return token;
};

/* ───────────── OPTIONAL: default export bila suka ───────────── */
export default { generateUniqueToken, generateRandomToken };
// 