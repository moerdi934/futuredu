// models/UserGroup.model.ts
import pool from '../lib/db';

// Types
export interface UserGroup {
  id: string;
  name: string;
  role: string;
  status: string;
  id_list: string[];
  user_names: string[];
}

export interface GetGroupsParams {
  searchName?: string | null;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

const getGroups = async (searchName: string | null = null): Promise<UserGroup[]> => {
  let baseQuery = `
    SELECT 
      dgu.id,
      dgu.name,
      dgu.role,
      dgu.status,
      dgu.id_list,
      array_agg(vdu.name) AS user_names
    FROM 
      dimgroupstudent dgu
    CROSS JOIN LATERAL UNNEST(dgu.id_list) AS user_id
    JOIN 
      v_dashboard_userdata vdu ON vdu.userid = user_id
  `;

  const groupBy = ' GROUP BY dgu.id, dgu.name';
  
  let queryParams: string[] = [];
  let whereClause = '';

  if (searchName) {
    whereClause = ' WHERE dgu.name ILIKE $1';
    queryParams.push(`%${searchName}%`);
  }

  const finalQuery = baseQuery + whereClause + groupBy;
  
  // eslint-disable-next-line no-useless-catch
  try {
    const result = await pool.query(finalQuery, queryParams);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

export {
  getGroups
};