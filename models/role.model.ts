// models/role.model.ts
import pool from '../lib/db';

// Types
export interface Role {
  id: number;
  role: string;
  description?: string;
}

export interface RoleSearchParams {
  searchTerm: string;
}

export interface RoleSearchResponse {
  roles: Role[];
}

/**
 * Cari role berdasarkan nama dengan pencarian case-insensitive.
 * @param {string} searchTerm - Term pencarian.
 * @returns {Promise<Role[]>} - Array role yang cocok.
 */
export const searchRoles = async (searchTerm: string): Promise<Role[]> => {
  const query = `
    SELECT id, role, description
    FROM dimroles
    WHERE role ILIKE $1 OR description ILIKE $1
    ORDER BY role ASC
    LIMIT 10
  `;
  const values = [`%${searchTerm}%`];
  
  try {
    const res = await pool.query(query, values);
    return res.rows as Role[];
  } catch (error) {
    throw error;
  }
};