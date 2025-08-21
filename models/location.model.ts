// models/Location.model.ts
import pool from '../lib/db';

// Types
export interface Location {
  id: number;
  kode_provinsi: string;
  kode_kota: string;
  kode_kecamatan: string;
  kode_desa: string;
  kode_wilayah: string;
  nama: string;
  level: 'provinsi' | 'kota' | 'kecamatan' | 'kelurahan';
  parent_id: number | null;
  create_date: string;
  create_user_id: number;
  update_date: string | null;
  update_user_id: number | null;
}

export interface LocationSelectOption {
  label: string;
  value: number;
  kode_wilayah: string;
  level: string;
  parent_id: number | null;
}

export interface GetLocationsParams {
  searchName?: string | null;
  level?: 'provinsi' | 'kota' | 'kecamatan' | 'kelurahan';
  parentId?: number | null;
  limit?: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

const getLocations = async (params: GetLocationsParams = {}): Promise<LocationSelectOption[]> => {
  const { 
    searchName = null, 
    level = null, 
    parentId = null, 
    limit = 100 
  } = params;

  let baseQuery = `
    SELECT 
      id,
      nama,
      kode_wilayah,
      level,
      parent_id
    FROM 
      location
  `;

  let whereConditions: string[] = [];
  let queryParams: any[] = [];
  let paramIndex = 1;

  // Filter by level if specified
  if (level) {
    whereConditions.push(`level = $${paramIndex}`);
    queryParams.push(level);
    paramIndex++;
  }

  // Filter by parent_id if specified
  if (parentId !== null) {
    whereConditions.push(`parent_id = $${paramIndex}`);
    queryParams.push(parentId);
    paramIndex++;
  }

  // Filter by search name if specified
  if (searchName) {
    whereConditions.push(`nama ILIKE $${paramIndex}`);
    queryParams.push(`%${searchName}%`);
    paramIndex++;
  }

  // Construct WHERE clause
  if (whereConditions.length > 0) {
    baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
  }

  // Add ORDER BY and LIMIT
  baseQuery += ` ORDER BY nama ASC LIMIT $${paramIndex}`;
  queryParams.push(limit);

  try {
    const result = await pool.query(baseQuery, queryParams);
    
    return result.rows.map((row: any) => ({
      label: row.nama,
      value: row.id,
      kode_wilayah: row.kode_wilayah,
      level: row.level,
      parent_id: row.parent_id
    }));
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

// Get specific location by ID
const getLocationById = async (id: number): Promise<Location | null> => {
  const query = `
    SELECT * FROM location WHERE id = $1
  `;

  try {
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching location by ID:', error);
    throw error;
  }
};

// Get provinces (level = 'provinsi')
const getProvinces = async (searchName: string | null = null): Promise<LocationSelectOption[]> => {
  return getLocations({
    searchName,
    level: 'provinsi',
    limit: 50
  });
};

// Get cities by province (level = 'kota' and parent_id = provinsi_id)
const getCitiesByProvince = async (
  provinceId: number, 
  searchName: string | null = null
): Promise<LocationSelectOption[]> => {
  return getLocations({
    searchName,
    level: 'kota',
    parentId: provinceId,
    limit: 100
  });
};

// Get districts by city (level = 'kecamatan' and parent_id = kota_id)
const getDistrictsByCity = async (
  cityId: number, 
  searchName: string | null = null
): Promise<LocationSelectOption[]> => {
  return getLocations({
    searchName,
    level: 'kecamatan',
    parentId: cityId,
    limit: 100
  });
};

// Get villages by district (level = 'kelurahan' and parent_id = kecamatan_id)
const getVillagesByDistrict = async (
  districtId: number, 
  searchName: string | null = null
): Promise<LocationSelectOption[]> => {
  return getLocations({
    searchName,
    level: 'kelurahan',
    parentId: districtId,
    limit: 100
  });
};

export {
  getLocations,
  getLocationById,
  getProvinces,
  getCitiesByProvince,
  getDistrictsByCity,
  getVillagesByDistrict
};