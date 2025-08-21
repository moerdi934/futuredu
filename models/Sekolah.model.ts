// models/Sekolah.model.ts
import pool from '../lib/db';

// Types
export interface Sekolah {
  id: number;
  kode_sekolah: string;
  npsn: string;
  nama: string;
  level: string;
  status: string;
  bentuk_pendidikan: string;
  status_kepemilikan: string;
  alamat: string;
  desa_kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kode_pos: string;
  akreditasi: string;
  created_at: string;
  updated_at: string;
  create_user_id: number;
}

export interface SekolahSelectOption {
  label: string;
  value: number;
  level: string;
  npsn: string;
  status: string;
  akreditasi: string;
}

export interface GetSekolahParams {
  searchName?: string | null;
  level?: string | null;
  limit?: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// Get sekolah with search functionality
const getSekolah = async (params: GetSekolahParams = {}): Promise<SekolahSelectOption[]> => {
  const { 
    searchName = null,
    level = null,
    limit = 100 
  } = params;

  let baseQuery = `
    SELECT 
      id,
      nama,
      level,
      npsn,
      status,
      akreditasi
    FROM 
      sekolah
    WHERE 
      nama IS NOT NULL
  `;

  let queryParams: any[] = [];
  let paramIndex = 1;

  // Filter by level if specified
  if (level) {
    baseQuery += ` AND level = $${paramIndex}`;
    queryParams.push(level);
    paramIndex++;
  }

  // Filter by search name if specified
  if (searchName) {
    baseQuery += ` AND nama ILIKE $${paramIndex}`;
    queryParams.push(`%${searchName}%`);
    paramIndex++;
  }

  // Add ORDER BY and LIMIT
  baseQuery += ` ORDER BY nama ASC LIMIT $${paramIndex}`;
  queryParams.push(limit);

  try {
    const result = await pool.query(baseQuery, queryParams);
    
    return result.rows.map((row: any) => ({
      label: row.nama,
      value: row.id,
      level: row.level || '',
      npsn: row.npsn || '',
      status: row.status || '',
      akreditasi: row.akreditasi || ''
    }));
  } catch (error) {
    console.error('Error fetching sekolah:', error);
    throw error;
  }
};

// Get specific sekolah by ID
const getSekolahById = async (id: number): Promise<Sekolah | null> => {
  const query = `
    SELECT * FROM sekolah WHERE id = $1
  `;

  try {
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching sekolah by ID:', error);
    throw error;
  }
};

// Get SD schools
const getSekolahSD = async (searchName: string | null = null): Promise<SekolahSelectOption[]> => {
  return getSekolah({
    searchName,
    level: 'SD',
    limit: 100
  });
};

// Get SMP schools
const getSekolahSMP = async (searchName: string | null = null): Promise<SekolahSelectOption[]> => {
  return getSekolah({
    searchName,
    level: 'SMP',
    limit: 100
  });
};

// Get SMA schools (includes SMK for SMA/SMK level)
const getSekolahSMA = async (searchName: string | null = null): Promise<SekolahSelectOption[]> => {
  return getSekolah({
    searchName,
    level: 'SMA',
    limit: 100
  });
};

export {
  getSekolah,
  getSekolahById,
  getSekolahSD,
  getSekolahSMP,
  getSekolahSMA
};