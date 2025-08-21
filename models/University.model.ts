// models/University.model.ts
import pool from '../lib/db';

// Types
export interface University {
  id: number;
  id_sp: string;
  nama_pt: string;
  nama_singkat: string;
  kab_kota_pt: string;
  provinsi_pt: string;
  akreditasi: string;
  status_pt: string;
  jenis_pt: string;
  create_date: string;
  create_user_id: number;
  update_date: string | null;
  update_user_id: number | null;
}

export interface UniversitySelectOption {
  label: string;
  value: number;
  nama_pt: string;
  nama_singkat: string;
  akreditasi: string;
  status_pt: string;
}

export interface Prodi {
  id: number;
  university_id: number;
  id_sp: string;
  id_sms: string;
  kode_prodi: string;
  nama_prodi: string;
  akreditasi: string;
  jenjang_prodi: string;
  status_prodi: string;
  create_date: string;
  create_user_id: number;
  update_date: string | null;
  update_user_id: number | null;
}

export interface ProdiSelectOption {
  label: string;
  value: number;
  kode_prodi: string;
  jenjang_prodi: string;
  akreditasi: string;
  status_prodi: string;
}

export interface GetUniversitiesParams {
  searchName?: string | null;
  jenisPt?: string | null;
  limit?: number;
}

export interface GetProdiParams {
  universityId?: number | null;
  searchName?: string | null;
  jenjangProdi?: string | null;
  limit?: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// Get universities with search functionality
const getUniversities = async (params: GetUniversitiesParams = {}): Promise<UniversitySelectOption[]> => {
  const { 
    searchName = null,
    jenisPt = null,
    limit = 100 
  } = params;
  console.log("jenisPt", jenisPt)
  let baseQuery = `
    SELECT 
      id,
      nama_pt,
      nama_singkat,
      akreditasi,
      status_pt
    FROM 
      universities
    WHERE 
      nama_pt IS NOT NULL 
      AND nama_singkat IS NOT NULL
  `;

  let queryParams: any[] = [];
  let paramIndex = 1;

  // Filter by jenis_pt if specified
  if (jenisPt) {
    baseQuery += ` AND jenis_pt = $${paramIndex}`;
    queryParams.push(jenisPt);
    paramIndex++;
  }

  // Filter by search name if specified (search in both nama_pt and nama_singkat)
  if (searchName) {
    baseQuery += ` AND (nama_pt ILIKE $${paramIndex} OR nama_singkat ILIKE $${paramIndex})`;
    queryParams.push(`%${searchName}%`);
    paramIndex++;
  }

  // Add ORDER BY and LIMIT
  baseQuery += ` ORDER BY nama_pt ASC LIMIT $${paramIndex}`;
  queryParams.push(limit);

  try {
    const result = await pool.query(baseQuery, queryParams);
    
    return result.rows.map((row: any) => ({
      label: `${row.nama_pt} - ${row.nama_singkat}`,
      value: row.id,
      nama_pt: row.nama_pt,
      nama_singkat: row.nama_singkat,
      akreditasi: row.akreditasi || '',
      status_pt: row.status_pt || ''
    }));
  } catch (error) {
    console.error('Error fetching universities:', error);
    throw error;
  }
};

// Get specific university by ID
const getUniversityById = async (id: number): Promise<University | null> => {
  const query = `
    SELECT * FROM universities WHERE id = $1
  `;

  try {
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching university by ID:', error);
    throw error;
  }
};

// Get prodi by university ID with separate search and jenjang parameters
const getProdiByUniversity = async (params: GetProdiParams = {}): Promise<ProdiSelectOption[]> => {
  const { 
    universityId = null,
    searchName = null,
    jenjangProdi = null,
    limit = 100 
  } = params;

  console.log('Model received params:', { universityId, searchName, jenjangProdi, limit });

  let baseQuery = `
    SELECT 
      id,
      nama_prodi,
      kode_prodi,
      jenjang_prodi,
      akreditasi,
      status_prodi
    FROM 
      prodi
    WHERE 
      nama_prodi IS NOT NULL
      AND nama_prodi != ''
  `;

  let queryParams: any[] = [];
  let paramIndex = 1;

  // Filter by university_id if specified (this should always be provided)
  if (universityId !== null) {
    baseQuery += ` AND university_id = $${paramIndex}`;
    queryParams.push(universityId);
    paramIndex++;
    console.log(`Added university filter: university_id = ${universityId}`);
  }

  // Filter by jenjang_prodi if specified (separate parameter)
  if (jenjangProdi && jenjangProdi.trim() !== '') {
    baseQuery += ` AND jenjang_prodi = $${paramIndex}`;
    queryParams.push(jenjangProdi.trim());
    paramIndex++;
    console.log(`Added jenjang filter: jenjang_prodi = ${jenjangProdi.trim()}`);
  }

  // Filter by search name if specified (separate parameter)
  if (searchName && searchName.trim() !== '') {
    baseQuery += ` AND nama_prodi ILIKE $${paramIndex}`;
    queryParams.push(`%${searchName.trim()}%`);
    paramIndex++;
    console.log(`Added search filter: nama_prodi ILIKE %${searchName.trim()}%`);
  }

  // Add ORDER BY and LIMIT
  baseQuery += ` ORDER BY nama_prodi ASC LIMIT $${paramIndex}`;
  queryParams.push(limit);

  console.log('Final SQL query:', baseQuery);
  console.log('Final query params:', queryParams);

  try {
    const result = await pool.query(baseQuery, queryParams);
    
    console.log(`Query executed successfully. Found ${result.rows.length} records.`);
    
    const mappedResults = result.rows.map((row: any) => ({
      label: `${row.nama_prodi} (${row.jenjang_prodi})`,
      value: row.id,
      kode_prodi: row.kode_prodi || '',
      jenjang_prodi: row.jenjang_prodi || '',
      akreditasi: row.akreditasi || '',
      status_prodi: row.status_prodi || ''
    }));

    console.log('Sample result:', mappedResults.slice(0, 3));
    
    return mappedResults;
  } catch (error) {
    console.error('Error fetching prodi:', error);
    throw error;
  }
};

// Get specific prodi by ID
const getProdiById = async (id: number): Promise<Prodi | null> => {
  const query = `
    SELECT * FROM prodi WHERE id = $1
  `;

  try {
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching prodi by ID:', error);
    throw error;
  }
};

export {
  getUniversities,
  getUniversityById,
  getProdiByUniversity,
  getProdiById
};