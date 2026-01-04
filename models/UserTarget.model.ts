// models/UserTarget.model.ts
import pool from '../lib/db';

// Types
export interface UserTarget {
  id: number;
  user_id: number;
  product_type_id: number;
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

export interface ProductType {
  id: number;
  description: string;
  series?: string;
  group_product?: string;
}

export interface ExamScoreMapping {
  id: number;
  product_type_id: number;
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
  product_type_id: number;
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
  product_type_id: number;
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

// Get all product types for selection dropdown
export const getProductTypes = async (): Promise<ProductType[]> => {
  const query = `
    SELECT id, description, series, group_product
    FROM product_type
    where group_product ilike 'TO%'
    ORDER BY description ASC
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching product types:', error);
    throw error;
  }
};

// Get exam score mapping by product_type_id
export const getExamScoreMapping = async (productTypeId: number): Promise<ExamScoreMapping[]> => {
  const query = `
    SELECT * FROM exam_score_mapping 
    WHERE product_type_id = $1 AND is_active = true
    ORDER BY score_position ASC
  `;

  try {
    const result = await pool.query(query, [productTypeId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching exam score mapping:', error);
    throw error;
  }
};

// Get formasi by product_type_id with search
export const getFormasi = async (productTypeId: number, searchName?: string): Promise<FormasiSelectOption[]> => {
  let query = `
    SELECT id, kode_formasi, nama_formasi, instansi, deskripsi
    FROM formasi 
    WHERE product_type_id = $1 AND is_active = true
  `;
  
  let queryParams: any[] = [productTypeId];
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
export const getProdiWithUniversity = async (searchName?: string, productTypeId?: number): Promise<ProdiSelectOption[]> => {
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

  // Filter by jenjang for SNBT/SNBP (S1 only) - check via product_type
  if (productTypeId) {
    const productTypeQuery = `SELECT series FROM product_type WHERE id = $1`;
    const productTypeResult = await pool.query(productTypeQuery, [productTypeId]);
    
    if (productTypeResult.rows.length > 0) {
      const series = productTypeResult.rows[0].series;
      // If series is 'SNBT' or 'SNBP', filter to S1 only
      if (series === 'SNBT' || series === 'SNBP') {
        query += ` AND p.jenjang_prodi = $${paramIndex}`;
        queryParams.push('S1');
        paramIndex++;
      }
    }
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

// Get university for specific product type (for Ujian Mandiri types)
export const getUniversityForProductType = async (productTypeId: number): Promise<{university_id: number; university_name: string} | null> => {
  const query = `
    SELECT DISTINCT esm.university_id, u.nama_pt, u.nama_singkat
    FROM exam_score_mapping esm
    JOIN universities u ON esm.university_id = u.id
    WHERE esm.product_type_id = $1
      AND esm.university_id IS NOT NULL
    LIMIT 1
  `;

  try {
    const result = await pool.query(query, [productTypeId]);
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        university_id: row.university_id,
        university_name: `${row.nama_pt} (${row.nama_singkat})`
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching university for product type:', error);
    return null;
  }
};

// Save or update user target
export const saveUserTarget = async (data: UserTargetInput): Promise<UserTarget> => {
  // Check if user target already exists
  const existingQuery = `
    SELECT id FROM user_target 
    WHERE user_id = $1 AND product_type_id = $2
  `;
  
  const existingResult = await pool.query(existingQuery, [data.user_id, data.product_type_id]);

  if (existingResult.rows.length > 0) {
    // Update existing record
    const updateQuery = `
      UPDATE user_target SET
        notes = $1,
        prodi_id_list = $2,
        formasi_id_list = $3,
        score_1 = $4,
        score_2 = $5,
        score_3 = $6,
        score_4 = $7,
        score_5 = $8,
        score_6 = $9,
        score_7 = $10,
        updated_date = CURRENT_TIMESTAMP
      WHERE user_id = $11 AND product_type_id = $12
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
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
      data.product_type_id
    ]);

    return result.rows[0];
  } else {
    // Insert new record
    const insertQuery = `
      INSERT INTO user_target (
        user_id, product_type_id, notes, prodi_id_list, formasi_id_list,
        score_1, score_2, score_3, score_4, score_5, score_6, score_7
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      data.user_id,
      data.product_type_id,
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

// Get user target by user_id and product_type_id
export const getUserTarget = async (userId: number, productTypeId: number): Promise<UserTarget | null> => {
  const query = `
    SELECT * FROM user_target 
    WHERE user_id = $1 AND product_type_id = $2
  `;

  try {
    const result = await pool.query(query, [userId, productTypeId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching user target:', error);
    throw error;
  }
};

// Get user target with detailed prodi and formasi information
// Get user target with detailed prodi and formasi information
export const getUserTargetWithDetails = async (userId: number, productTypeId: number) => {
  const query = `
    SELECT 
      ut.*,
      pt.description as product_type_description,
      pt.series as product_type_series,
      pt.group_product as product_type_group,
      CASE 
        WHEN ut.prodi_id_list IS NOT NULL AND array_length(ut.prodi_id_list, 1) > 0 THEN
          json_agg(
            DISTINCT jsonb_build_object(
              'id', p.id,
              'nama_prodi', p.nama_prodi,
              'jenjang_prodi', p.jenjang_prodi,
              'akreditasi', p.akreditasi,
              'university_id', p.university_id,
              'nama_pt', u.nama_pt,
              'nama_singkat', u.nama_singkat
            ) ORDER BY jsonb_build_object(
              'id', p.id,
              'nama_prodi', p.nama_prodi,
              'jenjang_prodi', p.jenjang_prodi,
              'akreditasi', p.akreditasi,
              'university_id', p.university_id,
              'nama_pt', u.nama_pt,
              'nama_singkat', u.nama_singkat
            )
          ) FILTER (WHERE p.id IS NOT NULL)
        ELSE '[]'::json
      END as prodi_details,
      CASE 
        WHEN ut.formasi_id_list IS NOT NULL AND array_length(ut.formasi_id_list, 1) > 0 THEN
          json_agg(
            DISTINCT jsonb_build_object(
              'id', f.id,
              'product_type_id', f.product_type_id,
              'kode_formasi', f.kode_formasi,
              'nama_formasi', f.nama_formasi,
              'instansi', f.instansi,
              'deskripsi', f.deskripsi,
              'requirements', f.requirements,
              'is_active', f.is_active
            ) ORDER BY jsonb_build_object(
              'id', f.id,
              'product_type_id', f.product_type_id,
              'kode_formasi', f.kode_formasi,
              'nama_formasi', f.nama_formasi,
              'instansi', f.instansi,
              'deskripsi', f.deskripsi,
              'requirements', f.requirements,
              'is_active', f.is_active
            )
          ) FILTER (WHERE f.id IS NOT NULL)
        ELSE '[]'::json
      END as formasi_details
    FROM user_target ut
    JOIN product_type pt ON ut.product_type_id = pt.id
    LEFT JOIN LATERAL unnest(ut.prodi_id_list) WITH ORDINALITY AS prodi_array(prodi_id, prodi_ord) ON true
    LEFT JOIN prodi p ON p.id = prodi_array.prodi_id
    LEFT JOIN universities u ON u.id = p.university_id
    LEFT JOIN LATERAL unnest(ut.formasi_id_list) WITH ORDINALITY AS formasi_array(formasi_id, formasi_ord) ON true
    LEFT JOIN formasi f ON f.id = formasi_array.formasi_id
    WHERE ut.user_id = $1 AND ut.product_type_id = $2
    GROUP BY ut.id, ut.user_id, ut.product_type_id, ut.notes, ut.prodi_id_list, ut.formasi_id_list,
             ut.score_1, ut.score_2, ut.score_3, ut.score_4, ut.score_5, ut.score_6, ut.score_7,
             ut.created_date, ut.updated_date, pt.description, pt.series, pt.group_product
  `;

  try {
    const result = await pool.query(query, [userId, productTypeId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const userTarget = result.rows[0];
    
    // Parse JSON arrays back to JavaScript arrays and sort by original order
    const prodiDetails = userTarget.prodi_details || [];
    const formasiDetails = userTarget.formasi_details || [];

    // Sort prodi_details based on original prodi_id_list order
    if (prodiDetails.length > 0 && userTarget.prodi_id_list) {
      prodiDetails.sort((a: any, b: any) => {
        const indexA = userTarget.prodi_id_list.indexOf(a.id);
        const indexB = userTarget.prodi_id_list.indexOf(b.id);
        return indexA - indexB;
      });
    }

    // Sort formasi_details based on original formasi_id_list order
    if (formasiDetails.length > 0 && userTarget.formasi_id_list) {
      formasiDetails.sort((a: any, b: any) => {
        const indexA = userTarget.formasi_id_list.indexOf(a.id);
        const indexB = userTarget.formasi_id_list.indexOf(b.id);
        return indexA - indexB;
      });
    }

    // Remove the JSON fields from the main object
    delete userTarget.prodi_details;
    delete userTarget.formasi_details;

    return {
      ...userTarget,
      prodi_details: prodiDetails,
      formasi_details: formasiDetails
    };

  } catch (error) {
    console.error('Error in getUserTargetWithDetails:', error);
    throw error;
  }
};

// Delete user target
export const deleteUserTarget = async (userId: number, productTypeId: number): Promise<boolean> => {
  const query = `
    DELETE FROM user_target 
    WHERE user_id = $1 AND product_type_id = $2
  `;

  try {
    const result = await pool.query(query, [userId, productTypeId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting user target:', error);
    throw error;
  }
};