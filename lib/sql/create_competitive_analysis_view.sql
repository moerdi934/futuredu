-- =========================================================
-- View untuk Competitive Analysis dengan History UTBK Result
-- =========================================================
-- Menggabungkan data user achievement dengan history UTBK
-- untuk memberikan analisis kompetitif per target prodi

-- Drop view jika sudah ada
DROP MATERIALIZED VIEW IF EXISTS mv_competitive_analysis_with_history CASCADE;

-- Create materialized view
CREATE MATERIALIZED VIEW mv_competitive_analysis_with_history AS
WITH current_year AS (
    SELECT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER AS year
),
-- Get latest user scores per product type
user_latest_scores AS (
    SELECT DISTINCT ON (ues.user_id, pt.description)
        ues.user_id,
        pt.description AS exam_type,
        pt.id AS product_type_id,
        COALESCE(ues.score, 0) AS user_score,
        ues.exam_schedule_id,
        ues.postdate
    FROM user_exam_scores ues
    JOIN exam_schedule es ON es.id = ues.exam_schedule_id
    JOIN product_type pt ON pt.id = es.type
    WHERE pt.group_product ILIKE 'TO%'
        AND ues.is_final = true
    ORDER BY ues.user_id, pt.description, ues.postdate DESC
),
-- Get user targets (prodi selections)
user_targets AS (
    SELECT 
        ut.user_id,
        ut.product_type_id,
        pt.description AS exam_type,
        UNNEST(ut.prodi_id_list) AS prodi_id
    FROM user_target ut
    JOIN product_type pt ON pt.id = ut.product_type_id
    WHERE ut.prodi_id_list IS NOT NULL 
        AND array_length(ut.prodi_id_list, 1) > 0
),
-- Get history data with current and previous year
prodi_history AS (
    SELECT 
        hur.prodi_id,
        hur.nama_prodi_dikbud,
        hur.nama_ptn_dikbud,
        -- Current year data (for peminat & daya_tampung)
        MAX(CASE WHEN hur.year = (SELECT year FROM current_year) 
            THEN hur.peminat ELSE NULL END) AS peminat_current,
        MAX(CASE WHEN hur.year = (SELECT year FROM current_year) 
            THEN hur.daya_tampung ELSE NULL END) AS daya_tampung_current,
        -- Previous year data (for score reference)
        MAX(CASE WHEN hur.year = (SELECT year - 1 FROM current_year) 
            THEN hur.min_score ELSE NULL END) AS min_score_prev,
        MAX(CASE WHEN hur.year = (SELECT year - 1 FROM current_year) 
            THEN hur.max_score ELSE NULL END) AS max_score_prev,
        MAX(CASE WHEN hur.year = (SELECT year - 1 FROM current_year) 
            THEN hur.average_score ELSE NULL END) AS average_score_prev,
        -- Check if previous year data exists
        MAX(CASE WHEN hur.year = (SELECT year - 1 FROM current_year) 
            THEN 1 ELSE 0 END) AS has_prev_year_data
    FROM history_utbk_result hur
    WHERE hur.year IN (
        (SELECT year FROM current_year),
        (SELECT year - 1 FROM current_year)
    )
    GROUP BY hur.prodi_id, hur.nama_prodi_dikbud, hur.nama_ptn_dikbud
),
-- Get user ranking per exam type (from bimbel participants only)
user_rankings AS (
    SELECT 
        ues.user_id,
        pt.description AS exam_type,
        RANK() OVER (
            PARTITION BY pt.description 
            ORDER BY COALESCE(ues.score, 0) DESC
        ) AS user_rank,
        COUNT(*) OVER (PARTITION BY pt.description) AS total_bimbel_participants
    FROM user_exam_scores ues
    JOIN exam_schedule es ON es.id = ues.exam_schedule_id
    JOIN product_type pt ON pt.id = es.type
    WHERE pt.group_product ILIKE 'TO%'
        AND ues.is_final = true
),
-- Main competitive analysis per user per prodi target
competitive_data AS (
    SELECT 
        uls.user_id,
        uls.exam_type,
        uls.product_type_id,
        ut.prodi_id,
        ph.nama_prodi_dikbud,
        ph.nama_ptn_dikbud,
        
        -- User achievement
        uls.user_score,
        ur.user_rank,
        ur.total_bimbel_participants,
        
        -- History data
        ph.peminat_current,
        ph.daya_tampung_current,
        ph.min_score_prev,
        ph.max_score_prev,
        ph.average_score_prev,
        ph.has_prev_year_data,
        
        -- Calculated metrics
        CASE 
            WHEN ph.daya_tampung_current > 0 
            THEN ROUND((ph.daya_tampung_current * 0.25)::NUMERIC, 0)
            ELSE 0 
        END AS safe_zone_rank,
        
        -- Status determination (Aman, Perlu Ditingkatkan, Tidak Aman)
        CASE 
            -- No previous year data available
            WHEN ph.has_prev_year_data = 0 THEN 'No Historical Data'
            -- Score below minimum = Not Safe
            WHEN uls.user_score < ph.min_score_prev THEN 'Tidak Aman'
            -- Score >= minimum AND rank within 25% of daya_tampung = Safe
            WHEN uls.user_score >= ph.min_score_prev 
                AND ur.user_rank <= ROUND((ph.daya_tampung_current * 0.25)::NUMERIC, 0)
            THEN 'Aman'
            -- Score >= minimum BUT rank beyond 25% = Needs Improvement
            WHEN uls.user_score >= ph.min_score_prev 
                AND ur.user_rank > ROUND((ph.daya_tampung_current * 0.25)::NUMERIC, 0)
            THEN 'Perlu Ditingkatkan'
            ELSE 'Tidak Aman'
        END AS status,
        
        -- Gap analysis
        CASE 
            WHEN ph.has_prev_year_data = 1 
            THEN GREATEST(0, ph.min_score_prev - uls.user_score)
            ELSE NULL
        END AS score_gap_to_minimum,
        
        CASE 
            WHEN ph.has_prev_year_data = 1 AND ph.average_score_prev IS NOT NULL
            THEN ph.average_score_prev - uls.user_score
            ELSE NULL
        END AS score_gap_to_average,
        
        -- Competition intensity
        CASE 
            WHEN ph.daya_tampung_current > 0 
            THEN ROUND((ph.peminat_current::NUMERIC / ph.daya_tampung_current), 2)
            ELSE NULL
        END AS competition_ratio,
        
        uls.postdate
        
    FROM user_latest_scores uls
    JOIN user_targets ut ON ut.user_id = uls.user_id 
        AND ut.product_type_id = uls.product_type_id
    LEFT JOIN prodi_history ph ON ph.prodi_id = ut.prodi_id
    LEFT JOIN user_rankings ur ON ur.user_id = uls.user_id 
        AND ur.exam_type = uls.exam_type
)
-- Final select with all fields
SELECT 
    user_id,
    exam_type,
    product_type_id,
    prodi_id,
    nama_prodi_dikbud,
    nama_ptn_dikbud,
    user_score,
    user_rank,
    total_bimbel_participants,
    peminat_current,
    daya_tampung_current,
    safe_zone_rank,
    min_score_prev,
    max_score_prev,
    average_score_prev,
    has_prev_year_data,
    status,
    score_gap_to_minimum,
    score_gap_to_average,
    competition_ratio,
    postdate,
    NOW() AS created_at
FROM competitive_data;

-- Create indexes for better performance
CREATE INDEX idx_mv_competitive_user_exam 
    ON mv_competitive_analysis_with_history(user_id, exam_type);

CREATE INDEX idx_mv_competitive_prodi 
    ON mv_competitive_analysis_with_history(prodi_id);

CREATE INDEX idx_mv_competitive_status 
    ON mv_competitive_analysis_with_history(status);

-- Add comments
COMMENT ON MATERIALIZED VIEW mv_competitive_analysis_with_history IS 
'Competitive analysis view combining user achievements with historical UTBK data. 
Uses current year for peminat/daya_tampung and previous year for score benchmarks.
Safe zone calculated as 25% of daya_tampung (assumption: 25% from bimbel, 75% external).';

-- Grant permissions (adjust as needed)
-- GRANT SELECT ON mv_competitive_analysis_with_history TO your_app_user;

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_competitive_analysis_view()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_competitive_analysis_with_history;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_competitive_analysis_view() IS 
'Refresh the competitive analysis materialized view. Should be run after exam scoring or target updates.';
