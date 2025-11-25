// models/ranking.model.ts
import pool from '../lib/db';

// Types
export interface RankingFilters {
  page?: number;
  limit?: number;
  search?: string;
  kota?: string | null;
  provinsi?: string | null;
  sekolah?: string | null;
  sortKey?: string;
  sortOrder?: string;
}

export interface UserCenteredFilters extends RankingFilters {
  page?: number;
}

export interface UserExamRankingFilters {
  page?: number;
  limit?: number;
  search?: string;
  examType?: string | null;
  sortKey?: string;
  sortOrder?: string;
}

export interface RankingData {
  user_id: number;
  total_score: number;
  average_score: number;
  rank: number;
  kota: string;
  provinsi: string;
  rank_kota: number;
  rank_provinsi: number;
  lokasi: string;
  sekolah: string;
  name?: string;
}

export interface UserRanking extends RankingData {
  name: string;
}

export interface PagedRankingResult {
  data: RankingData[];
  total: number;
  totalPages: number;
}

export interface UserCenteredRankingResult extends PagedRankingResult {
  currentPage: number;
  userRanking: UserRanking;
}

export interface UserExamRankingData {
  no: number;
  exam_schedule_id: number;
  exam_schedule_name: string;
  exam_type: string;
  rank: number;
  peserta: number;
  skor_total: number;
  avg_score: number;
  waktu: Date;
  rank_kota: number;
  rank_provinsi: number;
  kota: string;
  provinsi: string;
}

export interface UserExamRankingResult {
  data: UserExamRankingData[];
  total: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Get paginated rankings for a specific exam schedule
 * Uses materialized view for better performance
 */
export const getPagedRankingsBySchedule = async (
  examScheduleId: number,
  filters: RankingFilters
): Promise<PagedRankingResult> => {
  const {
    page = 1,
    limit = 50,
    search = '',
    kota = null,
    provinsi = null,
    sekolah = null,
    sortKey = 'rank',
    sortOrder = 'asc'
  } = filters;

  const offset = (page - 1) * limit;

  // Define allowed sort keys to prevent SQL injection
  const allowedSortKeys = [
    'user_id',
    'total_score',
    'average_score',
    'rank',
    'kota',
    'provinsi',
    'rank_kota',
    'rank_provinsi',
    'lokasi',
    'sekolah'
  ];

  // Validate sortKey and sortOrder
  const validatedSortKey = allowedSortKeys.includes(sortKey) ? sortKey : 'rank';
  const validatedSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  // Initialize params array
  let params: any[] = [examScheduleId];
  let whereConditions: string[] = ['exam_schedule_id = $1'];
  let paramIndex = 2;

  // Apply filters
  if (search) {
    whereConditions.push(`
      (CAST(user_id AS TEXT) ILIKE $${paramIndex}
      OR kota ILIKE $${paramIndex}
      OR provinsi ILIKE $${paramIndex}
      OR sekolah ILIKE $${paramIndex})
    `);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (kota) {
    whereConditions.push(`kota = $${paramIndex}`);
    params.push(kota);
    paramIndex++;
  }

  if (provinsi) {
    whereConditions.push(`provinsi = $${paramIndex}`);
    params.push(provinsi);
    paramIndex++;
  }

  if (sekolah) {
    whereConditions.push(`sekolah = $${paramIndex}`);
    params.push(sekolah);
    paramIndex++;
  }

  // Construct WHERE clause
  const whereClause = whereConditions.join(' AND ');

  // Build the main data query using materialized view
  const mainQuery = `
    SELECT 
      user_id,
      total_score,
      average_score,
      rank,
      kota,
      provinsi,
      rank_kota,
      rank_provinsi,
      lokasi,
      sekolah,
      name
    FROM mv_exam_schedule_rankings
    WHERE ${whereClause}
    ORDER BY ${validatedSortKey} ${validatedSortOrder}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  // Build the count query
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM mv_exam_schedule_rankings
    WHERE ${whereClause}
  `;

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(mainQuery, [...params, limit, offset]),
      pool.query(countQuery, params)
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      total,
      totalPages
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch paged rankings: ${error.message}`);
  }
};

/**
 * Get user-centered rankings with pagination
 * Automatically calculates the page where the user appears
 */
export const getUserCenteredRankingsModel = async (
  examScheduleId: number,
  userId: number,
  filters: UserCenteredFilters
): Promise<UserCenteredRankingResult | null> => {
  const {
    limit = 10,
    page,
    search = '',
    kota = null,
    provinsi = null,
    sekolah = null,
    sortKey = 'rank',
    sortOrder = 'asc'
  } = filters;

  // Define allowed sort keys to prevent SQL injection
  const allowedSortKeys = [
    'user_id',
    'total_score',
    'average_score',
    'rank',
    'kota',
    'provinsi',
    'rank_kota',
    'rank_provinsi',
    'lokasi',
    'sekolah'
  ];

  // Validate sortKey and sortOrder
  const validatedSortKey = allowedSortKeys.includes(sortKey) ? sortKey : 'rank';
  const validatedSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  try {
    // First get user info from materialized view
    const userInfoQuery = `
      SELECT 
        user_id,
        total_score,
        average_score,
        rank,
        kota,
        provinsi,
        rank_kota,
        rank_provinsi,
        lokasi,
        sekolah,
        name
      FROM mv_exam_schedule_rankings
      WHERE exam_schedule_id = $1 AND user_id = $2
    `;
    
    const userInfoResult = await pool.query(userInfoQuery, [examScheduleId, userId]);
    
    if (userInfoResult.rows.length === 0) {
      return null; // User has no ranking for this exam schedule
    }
    
    const userInfo = userInfoResult.rows[0];
    
    // Build filter conditions
    let whereConditions: string[] = ['exam_schedule_id = $1'];
    let params: any[] = [examScheduleId];
    let paramIndex = 2;
    
    if (search) {
      whereConditions.push(`
        (CAST(user_id AS TEXT) ILIKE $${paramIndex}
        OR kota ILIKE $${paramIndex}
        OR provinsi ILIKE $${paramIndex}
        OR sekolah ILIKE $${paramIndex})
      `);
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (kota) {
      whereConditions.push(`kota = $${paramIndex}`);
      params.push(kota);
      paramIndex++;
    }
    
    if (provinsi) {
      whereConditions.push(`provinsi = $${paramIndex}`);
      params.push(provinsi);
      paramIndex++;
    }
    
    if (sekolah) {
      whereConditions.push(`sekolah = $${paramIndex}`);
      params.push(sekolah);
      paramIndex++;
    }
    
    // Construct WHERE clause
    const whereClause = whereConditions.join(' AND ');
    
    // Calculate the user's page if not provided
    let calculatedPage = page;
    
    if (!calculatedPage) {
      const rowPositionQuery = `
        WITH ordered_results AS (
          SELECT 
            user_id,
            ROW_NUMBER() OVER (ORDER BY ${validatedSortKey} ${validatedSortOrder}) as row_position
          FROM mv_exam_schedule_rankings
          WHERE ${whereClause}
        )
        SELECT row_position 
        FROM ordered_results 
        WHERE user_id = $${paramIndex}
      `;
      
      const rowPositionResult = await pool.query(rowPositionQuery, [...params, userId]);
      
      if (rowPositionResult.rows.length > 0) {
        const rowPosition = parseInt(rowPositionResult.rows[0].row_position);
        calculatedPage = Math.ceil(rowPosition / limit);
      } else {
        calculatedPage = 1; // Default to first page if we can't find the row position
      }
    }
    
    const offset = (calculatedPage - 1) * limit;
    
    // Get paginated data
    const mainQuery = `
      SELECT 
        user_id,
        total_score,
        average_score,
        rank,
        kota,
        provinsi,
        rank_kota,
        rank_provinsi,
        lokasi,
        sekolah,
        name
      FROM mv_exam_schedule_rankings
      WHERE ${whereClause}
      ORDER BY ${validatedSortKey} ${validatedSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    // Count query
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM mv_exam_schedule_rankings
      WHERE ${whereClause}
    `;
    
    const [dataResult, countResult] = await Promise.all([
      pool.query(mainQuery, [...params, limit, offset]),
      pool.query(countQuery, params)
    ]);
    
    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      total,
      totalPages,
      currentPage: calculatedPage,
      userRanking: {
        user_id: userInfo.user_id,
        name: userInfo.name,
        rank: userInfo.rank,
        total_score: userInfo.total_score,
        average_score: userInfo.average_score,
        rank_kota: userInfo.rank_kota,
        rank_provinsi: userInfo.rank_provinsi,
        kota: userInfo.kota,
        provinsi: userInfo.provinsi,
        sekolah: userInfo.sekolah,
        lokasi: userInfo.lokasi
      }
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch user-centered rankings: ${error.message}`);
  }
};

/**
 * Get all exam schedule rankings for a specific user
 * Shows user's performance across all exam schedules they participated in
 */
export const getUserExamScheduleRankings = async (
  userId: number,
  filters: UserExamRankingFilters
): Promise<UserExamRankingResult> => {
  const {
    page = 1,
    limit = 50,
    search = '',
    examType = null,
    sortKey = 'exam_schedule_name',
    sortOrder = 'asc'
  } = filters;

  const offset = (page - 1) * limit;

  // Define allowed sort keys to prevent SQL injection
  const allowedSortKeys = [
    'exam_schedule_id',
    'exam_schedule_name',
    'exam_type',
    'rank', 
    'peserta',
    'skor_total',
    'avg_score',
    'waktu',
    'rank_kota',
    'rank_provinsi',
    'kota',
    'provinsi'
  ];

  // Validate sortKey and sortOrder
  const validatedSortKey = allowedSortKeys.includes(sortKey) ? sortKey : 'exam_schedule_name';
  const validatedSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  // Initialize params array with userId
  let params: any[] = [userId];
  let whereConditions: string[] = ['user_id = $1'];
  let paramIndex = 2;

  // Apply exam_type filter if provided
  if (examType) {
    whereConditions.push(`exam_type = $${paramIndex}`);
    params.push(examType);
    paramIndex++;
  }

  // Apply search filter if provided
  if (search) {
    whereConditions.push(`(
      exam_schedule_name ILIKE $${paramIndex} OR
      exam_type ILIKE $${paramIndex}
    )`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Construct WHERE clause
  const whereClause = whereConditions.join(' AND ');

  // Main query to get paginated results from materialized view
  const mainQuery = `
    SELECT
      ROW_NUMBER() OVER (ORDER BY ${validatedSortKey} ${validatedSortOrder}) + $${paramIndex + 1} as no,
      exam_schedule_id,
      exam_schedule_name,
      exam_type,
      rank,
      peserta,
      skor_total,
      avg_score,
      waktu,
      rank_kota,
      rank_provinsi,
      kota,
      provinsi
    FROM mv_user_exam_schedule_summary
    WHERE ${whereClause}
    ORDER BY ${validatedSortKey} ${validatedSortOrder}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  // Count query to get total number of records
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM mv_user_exam_schedule_summary
    WHERE ${whereClause}
  `;

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(mainQuery, [...params, limit, offset]),
      pool.query(countQuery, params)
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      total,
      totalPages,
      currentPage: page
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch user exam schedule rankings: ${error.message}`);
  }
};

/**
 * Get the last refresh timestamp for materialized views
 * Useful for showing users when data was last updated
 */
export const getRankingsLastRefreshTime = async (viewName: 'exam_schedule' | 'user_summary'): Promise<Date | null> => {
  try {
    const mvName = viewName === 'exam_schedule' 
      ? 'mv_exam_schedule_rankings' 
      : 'mv_user_exam_schedule_summary';
    
    const query = `
      SELECT last_refreshed 
      FROM ${mvName}
      LIMIT 1
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length > 0 && result.rows[0].last_refreshed) {
      return new Date(result.rows[0].last_refreshed);
    }
    
    return null;
  } catch (error: any) {
    console.error(`Failed to get last refresh time: ${error.message}`);
    return null;
  }
};

/**
 * Check if a specific user exists in the rankings for an exam schedule
 */
export const checkUserInRankings = async (
  examScheduleId: number,
  userId: number
): Promise<boolean> => {
  try {
    const query = `
      SELECT 1
      FROM mv_exam_schedule_rankings
      WHERE exam_schedule_id = $1 AND user_id = $2
      LIMIT 1
    `;
    
    const result = await pool.query(query, [examScheduleId, userId]);
    return result.rows.length > 0;
  } catch (error: any) {
    console.error(`Failed to check user in rankings: ${error.message}`);
    return false;
  }
};

/**
 * Get ranking statistics for an exam schedule
 */
export interface RankingStats {
  total_participants: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  median_score: number;
}

export const getRankingStatsBySchedule = async (
  examScheduleId: number
): Promise<RankingStats | null> => {
  try {
    const query = `
      WITH stats AS (
        SELECT
          COUNT(*) as total_participants,
          AVG(total_score) as average_score,
          MAX(total_score) as highest_score,
          MIN(total_score) as lowest_score,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_score) as median_score
        FROM mv_exam_schedule_rankings
        WHERE exam_schedule_id = $1
      )
      SELECT 
        total_participants,
        ROUND(average_score::NUMERIC, 2) as average_score,
        highest_score,
        lowest_score,
        ROUND(median_score::NUMERIC, 2) as median_score
      FROM stats
    `;
    
    const result = await pool.query(query, [examScheduleId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      total_participants: parseInt(result.rows[0].total_participants),
      average_score: parseFloat(result.rows[0].average_score),
      highest_score: parseFloat(result.rows[0].highest_score),
      lowest_score: parseFloat(result.rows[0].lowest_score),
      median_score: parseFloat(result.rows[0].median_score)
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch ranking statistics: ${error.message}`);
  }
};

/**
 * Get top N users by rank for a specific exam schedule
 */
export const getTopRankers = async (
  examScheduleId: number,
  topN: number = 10
): Promise<RankingData[]> => {
  try {
    const query = `
      SELECT 
        user_id,
        total_score,
        average_score,
        rank,
        kota,
        provinsi,
        rank_kota,
        rank_provinsi,
        lokasi,
        sekolah,
        name
      FROM mv_exam_schedule_rankings
      WHERE exam_schedule_id = $1
      ORDER BY rank ASC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [examScheduleId, topN]);
    return result.rows;
  } catch (error: any) {
    throw new Error(`Failed to fetch top rankers: ${error.message}`);
  }
};

/**
 * Get ranking distribution by city for an exam schedule
 */
export interface CityRankingDistribution {
  kota: string;
  total_participants: number;
  average_score: number;
  top_rank: number;
}

export const getRankingDistributionByCity = async (
  examScheduleId: number
): Promise<CityRankingDistribution[]> => {
  try {
    const query = `
      SELECT 
        kota,
        COUNT(*) as total_participants,
        ROUND(AVG(total_score)::NUMERIC, 2) as average_score,
        MIN(rank) as top_rank
      FROM mv_exam_schedule_rankings
      WHERE exam_schedule_id = $1 AND kota IS NOT NULL
      GROUP BY kota
      ORDER BY average_score DESC
    `;
    
    const result = await pool.query(query, [examScheduleId]);
    return result.rows.map(row => ({
      kota: row.kota,
      total_participants: parseInt(row.total_participants),
      average_score: parseFloat(row.average_score),
      top_rank: parseInt(row.top_rank)
    }));
  } catch (error: any) {
    throw new Error(`Failed to fetch city ranking distribution: ${error.message}`);
  }
};

/**
 * Get ranking distribution by province for an exam schedule
 */
export interface ProvinceRankingDistribution {
  provinsi: string;
  total_participants: number;
  average_score: number;
  top_rank: number;
}

export const getRankingDistributionByProvince = async (
  examScheduleId: number
): Promise<ProvinceRankingDistribution[]> => {
  try {
    const query = `
      SELECT 
        provinsi,
        COUNT(*) as total_participants,
        ROUND(AVG(total_score)::NUMERIC, 2) as average_score,
        MIN(rank) as top_rank
      FROM mv_exam_schedule_rankings
      WHERE exam_schedule_id = $1 AND provinsi IS NOT NULL
      GROUP BY provinsi
      ORDER BY average_score DESC
    `;
    
    const result = await pool.query(query, [examScheduleId]);
    return result.rows.map(row => ({
      provinsi: row.provinsi,
      total_participants: parseInt(row.total_participants),
      average_score: parseFloat(row.average_score),
      top_rank: parseInt(row.top_rank)
    }));
  } catch (error: any) {
    throw new Error(`Failed to fetch province ranking distribution: ${error.message}`);
  }
};