// Final models/UserTarget.model.ts with INTEGER user_id

import pool from '../lib/db';

// Types
export interface UserTarget {
  id: number;
  user_id: number;
  jenis_seleksi: string;
  sub_jenis_seleksi?: string;
  notes?: string;
  prodi_id_list?: number[];
  formasi_id_list?: number[];
  score_1?: number;
  score_2?: number;
  score_3?: number;
  score_4?: number;
  score_5?: number;
  score_6?: number;
  score_7?: number;
  created_date: string;
  updated_date: string;
}

export interface ExamScoreMapping {
  id: number;
  jenis_seleksi: string;
  sub_jenis_seleksi?: string;
  university_id?: number;
  score_position: number;
  score_label: string;
  score_description?: string;
  max_score?: number;
  is_active: boolean;
  created_date: string;
  updated_date: string;
}

export interface Formasi {
  id: number;
  jenis_seleksi: string;
  kode_formasi?: string;
  nama_formasi: string;
  instansi?: string;
  deskripsi?: string;
  requirements?: string;
  is_active: boolean;
  created_date: string;
  updated_date: string;
}

export interface FormasiSelectOption {
  label: string;
  value: number;
  kode_formasi?: string;
  instansi?: string;
  deskripsi?: string;
}

export interface ProdiWithUniversity {
  id: number;
  nama_prodi: string;
  jenjang_prodi: string;
  akreditasi: string;
  university_id: number;
  nama_pt: string;
  nama_singkat: string;
}

export interface ProdiSelectOption {
  label: string;
  value: number;
  nama_prodi: string;
  jenjang_prodi: string;
  akreditasi: string;
  university_name: string;
}

export interface UserTargetInput {
  user_id: number;
  jenis_seleksi: string;
  sub_jenis_seleksi?: string;
  notes?: string;
  prodi_id_list?: number[];
  formasi_id_list?: number[];
  score_1?: number;
  score_2?: number;
  score_3?: number;
  score_4?: number;
  score_5?: number;
  score_6?: number;
  score_7?: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// Get exam score mapping by jenis_seleksi
const getExamScoreMapping = async (jenisSeleksi: string, subJenisSeleksi?: string): Promise<ExamScoreMapping[]> => {
  let query = `
    SELECT * FROM exam_score_mapping 
    WHERE jenis_seleksi = $1 AND is_active = true
  `;
  let params: any[] = [jenisSeleksi];

  // For Ujian Mandiri, we need sub_jenis_seleksi
  if (jenisSeleksi === 'Ujian Mandiri') {
    if (!subJenisSeleksi) {
      return []; // Return empty if sub_jenis_seleksi not provided for Ujian Mandiri
    }
    query += ` AND sub_jenis_seleksi = $2`;
    params.push(subJenisSeleksi);
  } else {
    // For other types, ensure sub_jenis_seleksi is NULL
    query += ` AND sub_jenis_seleksi IS NULL`;
  }

  query += ` ORDER BY score_position ASC`;

  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching exam score mapping:', error);
    throw error;
  }
};
// Get formasi by jenis_seleksi with search
const getFormasi = async (jenisSeleksi: string, searchName?: string): Promise<FormasiSelectOption[]> => {
  let query = `
    SELECT id, kode_formasi, nama_formasi, instansi, deskripsi
    FROM formasi 
    WHERE jenis_seleksi = $1 AND is_active = true
  `;
  
  let queryParams: any[] = [jenisSeleksi];
  let paramIndex = 2;

  if (searchName && searchName.trim()) {
    query += ` AND (nama_formasi ILIKE $${paramIndex} OR instansi ILIKE $${paramIndex})`;
    queryParams.push(`%${searchName.trim()}%`);
    paramIndex++;
  }

  query += ` ORDER BY nama_formasi ASC LIMIT 100`;

  try {
    const result = await pool.query(query, queryParams);
    
    return result.rows.map((row: any) => ({
      label: `${row.nama_formasi} - ${row.instansi || 'N/A'}`,
      value: row.id,
      kode_formasi: row.kode_formasi,
      instansi: row.instansi,
      deskripsi: row.deskripsi
    }));
  } catch (error) {
    console.error('Error fetching formasi:', error);
    throw error;
  }
};

// Get prodi with university details for target selection
const getProdiWithUniversity = async (searchName?: string, jenisSeleksi?: string): Promise<ProdiSelectOption[]> => {
  let query = `
    SELECT 
      p.id,
      p.nama_prodi,
      p.jenjang_prodi,
      p.akreditasi,
      p.university_id,
      u.nama_pt,
      u.nama_singkat
    FROM prodi p
    JOIN universities u ON p.university_id = u.id
    WHERE p.nama_prodi IS NOT NULL 
      AND p.nama_prodi != ''
      AND u.nama_pt IS NOT NULL
  `;

  let queryParams: any[] = [];
  let paramIndex = 1;

  // Filter by jenjang for specific selection types
  if (jenisSeleksi === 'SNBT' || jenisSeleksi === 'SNBP') {
    query += ` AND p.jenjang_prodi = $${paramIndex}`;
    queryParams.push('S1');
    paramIndex++;
  }

  if (searchName && searchName.trim()) {
    query += ` AND (p.nama_prodi ILIKE $${paramIndex} OR u.nama_pt ILIKE $${paramIndex} OR u.nama_singkat ILIKE $${paramIndex})`;
    queryParams.push(`%${searchName.trim()}%`);
    paramIndex++;
  }

  query += ` ORDER BY u.nama_pt ASC, p.nama_prodi ASC LIMIT 100`;

  try {
    const result = await pool.query(query, queryParams);
    
    return result.rows.map((row: any) => ({
      label: `${row.nama_prodi} - ${row.nama_pt} (${row.nama_singkat})`,
      value: row.id,
      nama_prodi: row.nama_prodi,
      jenjang_prodi: row.jenjang_prodi,
      akreditasi: row.akreditasi,
      university_name: `${row.nama_pt} (${row.nama_singkat})`
    }));
  } catch (error) {
    console.error('Error fetching prodi with university:', error);
    throw error;
  }
};

// Save or update user target
const saveUserTarget = async (data: UserTargetInput): Promise<UserTarget> => {
  // Check if user target already exists
  const existingQuery = `
    SELECT id FROM user_target 
    WHERE user_id = $1 AND jenis_seleksi = $2
  `;
  
  const existingResult = await pool.query(existingQuery, [data.user_id, data.jenis_seleksi]);

  if (existingResult.rows.length > 0) {
    // Update existing record
    const updateQuery = `
      UPDATE user_target SET
        sub_jenis_seleksi = $1,
        notes = $2,
        prodi_id_list = $3,
        formasi_id_list = $4,
        score_1 = $5,
        score_2 = $6,
        score_3 = $7,
        score_4 = $8,
        score_5 = $9,
        score_6 = $10,
        score_7 = $11,
        updated_date = CURRENT_TIMESTAMP
      WHERE user_id = $12 AND jenis_seleksi = $13
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      data.sub_jenis_seleksi || null,
      data.notes || null,
      data.prodi_id_list || null,
      data.formasi_id_list || null,
      data.score_1 || null,
      data.score_2 || null,
      data.score_3 || null,
      data.score_4 || null,
      data.score_5 || null,
      data.score_6 || null,
      data.score_7 || null,
      data.user_id,
      data.jenis_seleksi
    ]);

    return result.rows[0];
  } else {
    // Insert new record
    const insertQuery = `
      INSERT INTO user_target (
        user_id, jenis_seleksi, sub_jenis_seleksi, notes, prodi_id_list, formasi_id_list,
        score_1, score_2, score_3, score_4, score_5, score_6, score_7
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      data.user_id,
      data.jenis_seleksi,
      data.sub_jenis_seleksi || null,
      data.notes || null,
      data.prodi_id_list || null,
      data.formasi_id_list || null,
      data.score_1 || null,
      data.score_2 || null,
      data.score_3 || null,
      data.score_4 || null,
      data.score_5 || null,
      data.score_6 || null,
      data.score_7 || null
    ]);

    return result.rows[0];
  }
};

// Get user target by user_id and jenis_seleksi
const getUserTarget = async (userId: number, jenisSeleksi: string): Promise<UserTarget | null> => {
  const query = `
    SELECT * FROM user_target 
    WHERE user_id = $1 AND jenis_seleksi = $2
  `;

  try {
    const result = await pool.query(query, [userId, jenisSeleksi]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching user target:', error);
    throw error;
  }
};

// Get user target with detailed prodi and formasi information
const getUserTargetWithDetails = async (userId: number, jenisSeleksi: string) => {
  console.log("getUserTargetWithDetailsOptimized called with:", { userId, jenisSeleksi });

  const query = `
    SELECT 
      ut.*,
      CASE 
        WHEN ut.prodi_id_list IS NOT NULL AND array_length(ut.prodi_id_list, 1) > 0 THEN
          json_agg(
            json_build_object(
              'id', p.id,
              'nama_prodi', p.nama_prodi,
              'jenjang_prodi', p.jenjang_prodi,
              'akreditasi', p.akreditasi,
              'university_id', p.university_id,
              'nama_pt', u.nama_pt,
              'nama_singkat', u.nama_singkat
            ) ORDER BY array_position(ut.prodi_id_list, p.id)
          ) FILTER (WHERE p.id IS NOT NULL)
        ELSE '[]'::json
      END as prodi_details,
      CASE 
        WHEN ut.formasi_id_list IS NOT NULL AND array_length(ut.formasi_id_list, 1) > 0 THEN
          json_agg(
            json_build_object(
              'id', f.id,
              'jenis_seleksi', f.jenis_seleksi,
              'kode_formasi', f.kode_formasi,
              'nama_formasi', f.nama_formasi,
              'instansi', f.instansi,
              'deskripsi', f.deskripsi,
              'requirements', f.requirements,
              'is_active', f.is_active
            ) ORDER BY array_position(ut.formasi_id_list, f.id)
          ) FILTER (WHERE f.id IS NOT NULL)
        ELSE '[]'::json
      END as formasi_details
    FROM user_target ut
    LEFT JOIN prodi p ON p.id = ANY(ut.prodi_id_list)
    LEFT JOIN universities u ON u.id = p.university_id
    LEFT JOIN formasi f ON f.id = ANY(ut.formasi_id_list)
    WHERE ut.user_id = $1 AND ut.jenis_seleksi = $2
    GROUP BY ut.id, ut.user_id, ut.jenis_seleksi, ut.notes, ut.prodi_id_list, ut.formasi_id_list,
             ut.score_1, ut.score_2, ut.score_3, ut.score_4, ut.score_5, ut.score_6, ut.score_7,
             ut.created_date, ut.updated_date
  `;

  try {
    const result = await pool.query(query, [userId, jenisSeleksi]);
    
    if (result.rows.length === 0) {
      console.log("No user target found");
      return null;
    }

    const userTarget = result.rows[0];
    
    // Parse JSON arrays back to JavaScript arrays
    const prodiDetails = userTarget.prodi_details || [];
    const formasiDetails = userTarget.formasi_details || [];

    // Remove the JSON fields from the main object
    delete userTarget.prodi_details;
    delete userTarget.formasi_details;

    const finalResult = {
      ...userTarget,
      prodi_details: prodiDetails,
      formasi_details: formasiDetails
    };

    console.log("Returning optimized user target with details:", {
      id: finalResult.id,
      jenis_seleksi: finalResult.jenis_seleksi,
      prodi_count: prodiDetails.length,
      formasi_count: formasiDetails.length
    });

    return finalResult;

  } catch (error) {
    console.error('Error in getUserTargetWithDetailsOptimized:', error);
    throw error;
  }
};

// Delete user target
const deleteUserTarget = async (userId: number, jenisSeleksi: string): Promise<boolean> => {
  const query = `
    DELETE FROM user_target 
    WHERE user_id = $1 AND jenis_seleksi = $2
  `;

  try {
    const result = await pool.query(query, [userId, jenisSeleksi]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting user target:', error);
    throw error;
  }
};

const getUniversityForUjianMandiri = async (subJenisSeleksi: string): Promise<{university_id: number; university_name: string} | null> => {
  const query = `
    SELECT DISTINCT esm.university_id, u.nama_pt, u.nama_singkat
    FROM exam_score_mapping esm
    JOIN universities u ON esm.university_id = u.id
    WHERE esm.jenis_seleksi = 'Ujian Mandiri' 
      AND esm.sub_jenis_seleksi = $1 
      AND esm.university_id IS NOT NULL
    LIMIT 1
  `;

  try {
    const result = await pool.query(query, [subJenisSeleksi]);
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        university_id: row.university_id,
        university_name: `${row.nama_pt} (${row.nama_singkat})`
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching university for ujian mandiri:', error);
    return null;
  }
};

export {
  getExamScoreMapping,
  getFormasi,
  getProdiWithUniversity,
  saveUserTarget,
  getUserTarget,
  getUserTargetWithDetails,
  deleteUserTarget,
  getUniversityForUjianMandiri
};