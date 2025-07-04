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
  avg_skor: number;
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

  // Define the Common Table Expressions for more organized and efficient queries
  const cteDefinitions = `
    WITH LatestScores AS (
      SELECT DISTINCT ON (ues.user_id, ues.exam_id)
        ues.user_id,
        ues.exam_id,
        ues.score,
        ues.weighted_score,
        ues.completion_time
      FROM user_exam_scores ues
      WHERE ues.exam_schedule_id = $1
      ORDER BY ues.user_id, ues.exam_id, ues.completion_time DESC
    ),
    AggregatedScores AS (
      SELECT 
        ls.user_id,
        SUM(CASE 
            WHEN es.is_need_weighted_score THEN COALESCE(ls.weighted_score, 0)
            ELSE ls.score
          END) as total_score,
        COUNT(DISTINCT ls.exam_id) as exam_count
      FROM LatestScores ls
      JOIN exam_schedule es ON es.id = $1
      GROUP BY ls.user_id
    ),
    UserData AS (
      SELECT 
        ag.user_id,
        ag.total_score,
        ag.total_score::float / ag.exam_count as average_score,
        vdu.kota,
        vdu.provinsi,
        vdu.pendidikan
      FROM AggregatedScores ag
      LEFT JOIN v_dashboard_userdata vdu ON vdu.userid = ag.user_id
    ),
    /* City Rankings: Rank users within their respective cities only */
    CityRankings AS (
      SELECT 
        user_id,
        kota,
        provinsi,
        DENSE_RANK() OVER (PARTITION BY kota ORDER BY total_score DESC) as rank_kota
      FROM UserData
      WHERE kota IS NOT NULL
    ),
    /* Province Rankings: Rank users within their respective provinces only */
    ProvinceRankings AS (
      SELECT 
        user_id,
        provinsi,
        DENSE_RANK() OVER (PARTITION BY provinsi ORDER BY total_score DESC) as rank_provinsi
      FROM UserData
      WHERE provinsi IS NOT NULL
    ),
    /* Overall user rankings */
    RankedScores AS (
      SELECT 
        ud.user_id,
        ud.total_score,
        ud.average_score,
        DENSE_RANK() OVER (ORDER BY ud.total_score DESC) as rank,
        ud.kota,
        ud.provinsi,
        ud.pendidikan,
        COALESCE(ud.kota || '-' || ud.provinsi, 'Unknown') as lokasi
      FROM UserData ud
    )`;

  // Initialize params array and start with the examScheduleId which is used twice in the CTE
  let params: any[] = [examScheduleId];
  let whereConditions: string[] = [];
  let paramIndex = 2; // Start from 2 as examScheduleId is $1

  // Apply filters
  if (search) {
    whereConditions.push(`
      (CAST(rs.user_id AS TEXT) ILIKE $${paramIndex}
      OR rs.kota ILIKE $${paramIndex}
      OR rs.provinsi ILIKE $${paramIndex}
      OR rs.pendidikan ILIKE $${paramIndex})
    `);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (kota) {
    whereConditions.push(`rs.kota = $${paramIndex}`);
    params.push(kota);
    paramIndex++;
  }

  if (provinsi) {
    whereConditions.push(`rs.provinsi = $${paramIndex}`);
    params.push(provinsi);
    paramIndex++;
  }

  if (sekolah) {
    whereConditions.push(`rs.pendidikan = $${paramIndex}`);
    params.push(sekolah);
    paramIndex++;
  }

  // Construct WHERE clause
  const whereClause = whereConditions.length > 0 ? ' WHERE ' + whereConditions.join(' AND ') : '';

  // Build the main data query
  const mainQuery = `
    ${cteDefinitions}
    SELECT 
      rs.user_id,
      rs.total_score,
      rs.average_score,
      rs.rank,
      rs.kota,
      rs.provinsi,
      cr.rank_kota,
      pr.rank_provinsi,
      rs.lokasi,
      rs.pendidikan as sekolah
    FROM RankedScores rs
    LEFT JOIN CityRankings cr ON cr.user_id = rs.user_id
    LEFT JOIN ProvinceRankings pr ON pr.user_id = rs.user_id
    ${whereClause}
    ORDER BY rs.${validatedSortKey} ${validatedSortOrder}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  // Add LIMIT and OFFSET parameters
  const mainQueryParams = [...params, limit, offset];

  
  // Build the count query (reusing the same CTEs)
  const countQuery = `
    ${cteDefinitions}
    SELECT COUNT(*) AS total
    FROM RankedScores rs
    LEFT JOIN CityRankings cr ON cr.user_id = rs.user_id
    LEFT JOIN ProvinceRankings pr ON pr.user_id = rs.user_id
    ${whereClause}
  `;

  // Count query only needs the examScheduleId and filter params, not LIMIT/OFFSET
  const countQueryParams = params;

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(mainQuery, mainQueryParams),
      pool.query(countQuery, countQueryParams)
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

export const getUserCenteredRankings = async (
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
    // Define base parameters for user info query
    let baseParams: any[] = [examScheduleId, userId];
    
    // Define all CTEs once
    const cteDefinitions = `
      WITH LatestScores AS (
        SELECT DISTINCT ON (ues.user_id, ues.exam_id)
          ues.user_id,
          ues.exam_id,
          ues.score,
          ues.weighted_score,
          ues.completion_time
        FROM user_exam_scores ues
        WHERE ues.exam_schedule_id = $1
        ORDER BY ues.user_id, ues.exam_id, ues.completion_time DESC
      ),
      AggregatedScores AS (
        SELECT 
          ls.user_id,
          SUM(CASE 
              WHEN es.is_need_weighted_score THEN COALESCE(ls.weighted_score, 0)
              ELSE ls.score
            END) as total_score,
          COUNT(DISTINCT ls.exam_id) as exam_count
        FROM LatestScores ls
        JOIN exam_schedule es ON es.id = $1
        GROUP BY ls.user_id
      ),
      UserData AS (
        SELECT 
          ag.user_id,
          ag.total_score,
          ag.total_score::float / ag.exam_count as average_score,
          vdu.kota,
          vdu.provinsi,
          vdu.pendidikan,
          vdu.nama_lengkap name
        FROM AggregatedScores ag
        LEFT JOIN v_dashboard_userdata vdu ON vdu.userid = ag.user_id
      ),
      CityRankings AS (
        SELECT 
          user_id,
          kota,
          provinsi,
          DENSE_RANK() OVER (PARTITION BY kota ORDER BY total_score DESC) as rank_kota
        FROM UserData
        WHERE kota IS NOT NULL
      ),
      ProvinceRankings AS (
        SELECT 
          user_id,
          provinsi,
          DENSE_RANK() OVER (PARTITION BY provinsi ORDER BY total_score DESC) as rank_provinsi
        FROM UserData
        WHERE provinsi IS NOT NULL
      ),
      RankedScores AS (
        SELECT 
          ud.user_id,
          ud.total_score,
          ud.average_score,
          DENSE_RANK() OVER (ORDER BY ud.total_score DESC) as rank,
          ud.kota,
          ud.provinsi,
          ud.pendidikan,
          COALESCE(ud.kota || '-' || ud.provinsi, 'Unknown') as lokasi,
          ud.name
        FROM UserData ud
      )`;
    
    // First get user rank info
    const userInfoQuery = `
      ${cteDefinitions}
      SELECT 
        rs.user_id,
        rs.total_score,
        rs.average_score,
        rs.rank,
        rs.kota,
        rs.provinsi,
        cr.rank_kota,
        pr.rank_provinsi,
        rs.lokasi,
        rs.pendidikan as sekolah,
        rs.name
      FROM RankedScores rs
      LEFT JOIN CityRankings cr ON cr.user_id = rs.user_id
      LEFT JOIN ProvinceRankings pr ON pr.user_id = rs.user_id
      WHERE rs.user_id = $2
    `;
    
    const userInfoResult = await pool.query(userInfoQuery, baseParams);
    
    if (userInfoResult.rows.length === 0) {
      return null; // User has no ranking for this exam schedule
    }
    
    const userInfo = userInfoResult.rows[0];
    
    // Build the filter conditions
    let whereConditionsForRowPosition: string[] = [];
    let whereConditionsForMainQuery: string[] = [];
    
    // Parameters for row position query (includes userId)
    let rowPositionParams: any[] = [examScheduleId, userId];
    let rowPositionParamIndex = 3; // Start after examScheduleId and userId
    
    // Parameters for main query (without userId)
    let mainQueryParams: any[] = [examScheduleId];
    let mainQueryParamIndex = 2; // Start after examScheduleId
    
    if (search) {
      const searchCondition = `
        (CAST(rs.user_id AS TEXT) ILIKE $${rowPositionParamIndex}
        OR rs.kota ILIKE $${rowPositionParamIndex}
        OR rs.provinsi ILIKE $${rowPositionParamIndex}
        OR rs.pendidikan ILIKE $${rowPositionParamIndex})
      `;
      whereConditionsForRowPosition.push(searchCondition);
      rowPositionParams.push(`%${search}%`);
      rowPositionParamIndex++;
      
      // For main query (adjust index)
      const mainSearchCondition = `
        (CAST(rs.user_id AS TEXT) ILIKE $${mainQueryParamIndex}
        OR rs.kota ILIKE $${mainQueryParamIndex}
        OR rs.provinsi ILIKE $${mainQueryParamIndex}
        OR rs.pendidikan ILIKE $${mainQueryParamIndex})
      `;
      whereConditionsForMainQuery.push(mainSearchCondition);
      mainQueryParams.push(`%${search}%`);
      mainQueryParamIndex++;
    }
    
    if (kota) {
      whereConditionsForRowPosition.push(`rs.kota = $${rowPositionParamIndex}`);
      rowPositionParams.push(kota);
      rowPositionParamIndex++;
      
      whereConditionsForMainQuery.push(`rs.kota = $${mainQueryParamIndex}`);
      mainQueryParams.push(kota);
      mainQueryParamIndex++;
    }
    
    if (provinsi) {
      whereConditionsForRowPosition.push(`rs.provinsi = $${rowPositionParamIndex}`);
      rowPositionParams.push(provinsi);
      rowPositionParamIndex++;
      
      whereConditionsForMainQuery.push(`rs.provinsi = $${mainQueryParamIndex}`);
      mainQueryParams.push(provinsi);
      mainQueryParamIndex++;
    }
    
    if (sekolah) {
      whereConditionsForRowPosition.push(`rs.pendidikan = $${rowPositionParamIndex}`);
      rowPositionParams.push(sekolah);
      rowPositionParamIndex++;
      
      whereConditionsForMainQuery.push(`rs.pendidikan = $${mainQueryParamIndex}`);
      mainQueryParams.push(sekolah);
      mainQueryParamIndex++;
    }
    
    // Construct WHERE clauses
    const whereClauseForRowPosition = whereConditionsForRowPosition.length > 0 
      ? ' WHERE ' + whereConditionsForRowPosition.join(' AND ') 
      : '';
    
    const whereClauseForMainQuery = whereConditionsForMainQuery.length > 0 
      ? ' WHERE ' + whereConditionsForMainQuery.join(' AND ') 
      : '';
    
    // Parameters for count query (same as mainQueryParams but without limit/offset)
    const countQueryParams = [...mainQueryParams];
    
    // Calculate the user's row position to determine their page
    let calculatedPage = page;
    
    if (!calculatedPage) {
      // Create a dynamic ORDER BY clause based on the validated sort key
      let orderByClause: string;
      
      if (validatedSortKey === 'rank_kota') {
        orderByClause = `cr.rank_kota ${validatedSortOrder}`;
      } else if (validatedSortKey === 'rank_provinsi') {
        orderByClause = `pr.rank_provinsi ${validatedSortOrder}`;
      } else if (validatedSortKey === 'sekolah') {
        orderByClause = `rs.pendidikan ${validatedSortOrder}`;
      } else {
        orderByClause = `rs.${validatedSortKey} ${validatedSortOrder}`;
      }
      
      const rowPositionQuery = `
        ${cteDefinitions}
        ,OrderedResults AS (
          SELECT 
            rs.user_id,
            ROW_NUMBER() OVER (ORDER BY ${orderByClause}) as row_position
          FROM RankedScores rs
          LEFT JOIN CityRankings cr ON cr.user_id = rs.user_id
          LEFT JOIN ProvinceRankings pr ON pr.user_id = rs.user_id
          ${whereClauseForRowPosition}
        )
        SELECT row_position 
        FROM OrderedResults 
        WHERE user_id = $2
      `;
      
      const rowPositionResult = await pool.query(rowPositionQuery, rowPositionParams);
      
      if (rowPositionResult.rows.length > 0) {
        const rowPosition = parseInt(rowPositionResult.rows[0].row_position);
        console.log(rowPositionResult.rows[0]);
        console.log(limit);
        calculatedPage = Math.ceil(rowPosition / limit);
      } else {
        calculatedPage = 1; // Default to first page if we can't find the row position
      }
    }
    
    const offset = (calculatedPage - 1) * limit;
    
    // Create a dynamic ORDER BY clause for the main query
    let orderByClause: string;
    
    if (validatedSortKey === 'rank_kota') {
      orderByClause = `cr.rank_kota ${validatedSortOrder}`;
    } else if (validatedSortKey === 'rank_provinsi') {
      orderByClause = `pr.rank_provinsi ${validatedSortOrder}`;
    } else if (validatedSortKey === 'sekolah') {
      orderByClause = `rs.pendidikan ${validatedSortOrder}`;
    } else {
      orderByClause = `rs.${validatedSortKey} ${validatedSortOrder}`;
    }
    
    // Add limit and offset to parameters
    mainQueryParams.push(limit, offset);
    
    const mainQuery = `
      ${cteDefinitions}
      SELECT 
        rs.user_id,
        rs.total_score,
        rs.average_score,
        rs.rank,
        rs.kota,
        rs.provinsi,
        cr.rank_kota,
        pr.rank_provinsi,
        rs.lokasi,
        rs.pendidikan as sekolah,
        rs.name
      FROM RankedScores rs
      LEFT JOIN CityRankings cr ON cr.user_id = rs.user_id
      LEFT JOIN ProvinceRankings pr ON pr.user_id = rs.user_id
      ${whereClauseForMainQuery}
      ORDER BY ${orderByClause}
      LIMIT $${mainQueryParamIndex} OFFSET $${mainQueryParamIndex + 1}
    `;
    

    // Count query (reusing the same CTEs)
    const countQuery = `
      ${cteDefinitions}
      SELECT COUNT(*) AS total
      FROM RankedScores rs
      LEFT JOIN CityRankings cr ON cr.user_id = rs.user_id
      LEFT JOIN ProvinceRankings pr ON pr.user_id = rs.user_id
      ${whereClauseForMainQuery}
    `;
    
    const [dataResult, countResult] = await Promise.all([
      pool.query(mainQuery, mainQueryParams),
      pool.query(countQuery, countQueryParams)
    ]);
    
    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);
    console.log(dataResult.rows);

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

export const getUserExamScheduleRankings = async (
  userId: number,
  filters: UserExamRankingFilters
): Promise<UserExamRankingResult> => {
  const {
    page = 1,
    limit = 50,
    search = '',
    examType = null,
    sortKey = 'name', // Diubah dari 'exam_schedule_name'
    sortOrder = 'asc'
  } = filters;

  const offset = (page - 1) * limit;

  // Define allowed sort keys to prevent SQL injection
  const allowedSortKeys = [
    'exam_schedule_id',
    'name', // Diubah dari 'exam_schedule_name'
    'exam_type',
    'rank', 
    'peserta',
    'skor_total',
    'avg_skor',
    'waktu',
    'rank_kota',
    'rank_provinsi',
    'kota',
    'provinsi'
  ];

  // Validate sortKey and sortOrder
  const validatedSortKey = allowedSortKeys.includes(sortKey) ? sortKey : 'name'; // Diubah dari 'exam_schedule_name'
  const validatedSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  // Starting our CTE definitions similar to the second document
  const cteDefinitions = `
    WITH latest_scores AS (
      SELECT
        ues.user_id,
        ues.exam_schedule_id,
        ues.exam_id,
        ues.score,
        ues.weighted_score,
        ues.completion_time,
        ROW_NUMBER() OVER (PARTITION BY ues.user_id, ues.exam_schedule_id, ues.exam_id ORDER BY ues.completion_time DESC) as rn
      FROM user_exam_scores ues
      WHERE ues.is_final = true
    ),
    aggregated_scores AS (
      SELECT
        ls.user_id,
        ls.exam_schedule_id,
        SUM(CASE WHEN es.is_need_weighted_score = true THEN ls.weighted_score ELSE ls.score END) as total_score,
        COUNT(DISTINCT ls.exam_id) as exam_count,
        MAX(ls.completion_time) as latest_completion_time,
        MAX(ls.completion_time) as latest_postdate
      FROM latest_scores ls
      JOIN exam_schedule es ON ls.exam_schedule_id = es.id
      WHERE ls.rn = 1
      GROUP BY ls.user_id, ls.exam_schedule_id
    ),
    participants_count AS (
      SELECT
        exam_schedule_id,
        COUNT(DISTINCT user_id) as total_participants
      FROM latest_scores
      WHERE rn = 1
      GROUP BY exam_schedule_id
    ),
    user_ranks AS (
      SELECT
        as1.user_id,
        as1.exam_schedule_id,
        as1.total_score,
        as1.exam_count,
        as1.total_score / NULLIF(as1.exam_count, 0) as avg_score,
        as1.latest_completion_time,
        RANK() OVER (
          PARTITION BY as1.exam_schedule_id 
          ORDER BY 
            CASE 
              WHEN es.start_time IS NULL OR es.end_time IS NULL OR EXTRACT(YEAR FROM es.start_time) < 2000 OR EXTRACT(YEAR FROM es.end_time) < 2000 
              THEN as1.total_score 
              ELSE as1.total_score 
            END DESC,
            CASE 
              WHEN es.start_time IS NULL OR es.end_time IS NULL OR EXTRACT(YEAR FROM es.start_time) < 2000 OR EXTRACT(YEAR FROM es.end_time) < 2000 
              THEN as1.latest_completion_time 
              ELSE NULL 
            END ASC
        ) as overall_rank,
        pc.total_participants
      FROM aggregated_scores as1
      JOIN participants_count pc ON as1.exam_schedule_id = pc.exam_schedule_id
      JOIN exam_schedule es ON as1.exam_schedule_id = es.id
    ),
    city_ranks AS (
      SELECT
        ur.user_id,
        ur.exam_schedule_id,
        vdu.kota,
        CASE
          WHEN vdu.kota IS NOT NULL THEN
            RANK() OVER (
              PARTITION BY ur.exam_schedule_id, vdu.kota 
              ORDER BY 
                CASE 
                  WHEN es.start_time IS NULL OR es.end_time IS NULL OR EXTRACT(YEAR FROM es.start_time) < 2000 OR EXTRACT(YEAR FROM es.end_time) < 2000 
                  THEN ur.total_score 
                  ELSE ur.total_score 
                END DESC,
                CASE 
                  WHEN es.start_time IS NULL OR es.end_time IS NULL OR EXTRACT(YEAR FROM es.start_time) < 2000 OR EXTRACT(YEAR FROM es.end_time) < 2000 
                  THEN ur.latest_completion_time 
                  ELSE NULL 
                END ASC
            )
          ELSE NULL
        END as city_rank
      FROM user_ranks ur
      JOIN v_dashboard_userdata vdu ON ur.user_id = vdu.userid
      JOIN exam_schedule es ON ur.exam_schedule_id = es.id
    ),
    province_ranks AS (
      SELECT
        ur.user_id,
        ur.exam_schedule_id,
        vdu.provinsi,
        CASE
          WHEN vdu.provinsi IS NOT NULL THEN
            RANK() OVER (
              PARTITION BY ur.exam_schedule_id, vdu.provinsi 
              ORDER BY 
                CASE 
                  WHEN es.start_time IS NULL OR es.end_time IS NULL OR EXTRACT(YEAR FROM es.start_time) < 2000 OR EXTRACT(YEAR FROM es.end_time) < 2000 
                  THEN ur.total_score 
                  ELSE ur.total_score 
                END DESC,
                CASE 
                  WHEN es.start_time IS NULL OR es.end_time IS NULL OR EXTRACT(YEAR FROM es.start_time) < 2000 OR EXTRACT(YEAR FROM es.end_time) < 2000 
                  THEN ur.latest_completion_time 
                  ELSE NULL 
                END ASC
            )
          ELSE NULL
        END as province_rank
      FROM user_ranks ur
      JOIN v_dashboard_userdata vdu ON ur.user_id = vdu.userid
      JOIN exam_schedule es ON ur.exam_schedule_id = es.id
    )
  `;

  // Initialize params array with userId
  let params: any[] = [userId];
  let paramIndex = 2; // Starting from 2 as userId is $1
  let whereConditions: string[] = ['ur.user_id = $1'];

  // Apply exam_type filter if provided
  if (examType) {
    whereConditions.push(`es.exam_type = $${paramIndex}`);
    params.push(examType);
    paramIndex++;
  }

  // Apply search filter if provided
  if (search) {
    whereConditions.push(`(
      es.name ILIKE $${paramIndex} OR
      es.exam_type ILIKE $${paramIndex}
    )`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Construct WHERE clause
  const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

  // Main query to get paginated results
  const mainQuery = `
    ${cteDefinitions}
    SELECT
      ROW_NUMBER() OVER (ORDER BY ${validatedSortKey === 'name' ? 'es.name' : validatedSortKey} ${validatedSortOrder}) + ${offset} as no,
      es.id as exam_schedule_id,
      es.name as exam_schedule_name,
      es.exam_type,
      ur.overall_rank as rank,
      ur.total_participants as peserta,
      ur.total_score as skor_total,
      ur.avg_score as avg_skor,
      ur.latest_completion_time as waktu,
      cr.city_rank as rank_kota,
      pr.province_rank as rank_provinsi,
      vdu.kota,
      vdu.provinsi
    FROM user_ranks ur
    JOIN exam_schedule es ON ur.exam_schedule_id = es.id
    JOIN v_dashboard_userdata vdu ON ur.user_id = vdu.userid
    JOIN city_ranks cr ON ur.user_id = cr.user_id AND ur.exam_schedule_id = cr.exam_schedule_id
    JOIN province_ranks pr ON ur.user_id = pr.user_id AND ur.exam_schedule_id = pr.exam_schedule_id
    ${whereClause}
    ORDER BY ${validatedSortKey === 'name' ? 'es.name' : validatedSortKey} ${validatedSortOrder}
    LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
  `;

  // Add LIMIT and OFFSET parameters
  const mainQueryParams = [...params, limit, offset];

  // Count query to get total number of records
  const countQuery = `
    ${cteDefinitions}
    SELECT COUNT(*) AS total
    FROM user_ranks ur
    JOIN exam_schedule es ON ur.exam_schedule_id = es.id
    JOIN v_dashboard_userdata vdu ON ur.user_id = vdu.userid
    JOIN city_ranks cr ON ur.user_id = cr.user_id AND ur.exam_schedule_id = cr.exam_schedule_id
    JOIN province_ranks pr ON ur.user_id = pr.user_id AND ur.exam_schedule_id = pr.exam_schedule_id
    ${whereClause}
  `;

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(mainQuery, mainQueryParams),
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