-- =========================================================
-- View untuk Recommended Programs
-- =========================================================
-- Memberikan rekomendasi prodi berdasarkan:
-- 1. Similarity nama_prodi dengan semua target user
-- 2. Deduplicate prodi_id (keep highest similarity)
-- 3. Top 20 total recommendations per user (ranked by similarity)
-- 4. Jika user punya 4 target, dapat 20 rekomendasi (bisa overlap)

-- Enable pg_trgm extension untuk fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop view jika sudah ada
DROP MATERIALIZED VIEW IF EXISTS mv_recommended_programs CASCADE;

-- Create materialized view
CREATE MATERIALIZED VIEW mv_recommended_programs AS
WITH current_year AS (
    SELECT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER AS year
),
-- Get latest user scores per product type (using average for SNBT, sum for others)
user_latest_scores AS (
    SELECT DISTINCT ON (ra.user_id, pt.description)
        ra.user_id,
        pt.description AS exam_type,
        pt.id AS product_type_id,
        -- For SNBT: use average score per exam_schedule
        -- For others: use sum of all scores
        CASE 
            WHEN pt.description ILIKE '%SNBT%' THEN
                AVG(
                    CASE 
                        WHEN es.is_need_weighted_score = true THEN ra.weighted_score
                        ELSE ra.score
                    END
                ) OVER (PARTITION BY ra.user_id, ra.exam_schedule_id)
            ELSE
                SUM(
                    CASE 
                        WHEN es.is_need_weighted_score = true THEN ra.weighted_score
                        ELSE ra.score
                    END
                ) OVER (PARTITION BY ra.user_id, ra.exam_schedule_id)
        END AS user_score,
        ra.exam_schedule_id,
        ra.postdate
    FROM (
        SELECT *,
            ROW_NUMBER() OVER (
                PARTITION BY user_id, exam_schedule_id, exam_id
                ORDER BY GREATEST(COALESCE(postdate, '1900-01-01'), COALESCE(completion_time, '1900-01-01')) DESC
            ) AS rn
        FROM user_exam_scores
    ) ra
    JOIN exam_schedule es ON es.id = ra.exam_schedule_id
    JOIN product_type pt ON pt.id = es.type
    WHERE pt.group_product ILIKE 'TO%'
        AND ra.is_final = true
        AND ra.rn = 1
    ORDER BY ra.user_id, pt.description, ra.postdate DESC
),
-- Get prodi data with history (from latest year only)
prodi_with_history AS (
    SELECT 
        p.id AS prodi_id,
        p.university_id,
        p.kode_prodi,
        p.nama_prodi,
        p.jenjang_prodi,
        p.akreditasi,
        u.nama_pt,
        u.nama_singkat,
        u.jenis_pt,
        hur_latest.peminat AS peminat_current,
        hur_latest.daya_tampung AS daya_tampung_current,
        hur_prev.min_score AS min_score_prev,
        hur_prev.max_score AS max_score_prev,
        hur_prev.average_score AS average_score_prev,
        CASE WHEN hur_prev.prodi_id IS NOT NULL THEN true ELSE false END AS has_historical_data
    FROM prodi p
    LEFT JOIN universities u ON u.id = p.university_id
    -- Get latest year data (current)
    LEFT JOIN LATERAL (
        SELECT prodi_id, year, peminat, daya_tampung, min_score, max_score, average_score
        FROM history_utbk_result
        WHERE prodi_id = p.id
            AND peminat IS NOT NULL
            AND daya_tampung IS NOT NULL
        ORDER BY year DESC
        LIMIT 1
    ) hur_latest ON hur_latest.prodi_id = p.id
    -- Get previous year data for score reference
    LEFT JOIN LATERAL (
        SELECT prodi_id, year, min_score, max_score, average_score
        FROM history_utbk_result
        WHERE prodi_id = p.id
            AND min_score IS NOT NULL
            AND min_score > 0
        ORDER BY year DESC
        LIMIT 1
    ) hur_prev ON hur_prev.prodi_id = p.id
    WHERE p.status_prodi = 'Aktif'
        AND p.nama_prodi IS NOT NULL
        AND p.nama_prodi != ''
),
-- Get user target prodi names with choice number
user_target_prodi AS (
    SELECT DISTINCT
        ut.user_id,
        ut.product_type_id,
        pt.description AS exam_type,
        p.nama_prodi AS target_prodi_name,
        prodi_idx AS target_choice_number,
        ut.prodi_id_list  -- Keep array for exclusion
    FROM user_target ut
    JOIN product_type pt ON pt.id = ut.product_type_id
    CROSS JOIN LATERAL unnest(ut.prodi_id_list) WITH ORDINALITY AS t(prodi_id, prodi_idx)
    JOIN prodi p ON p.id = t.prodi_id
    WHERE pt.group_product ILIKE 'TO%'
        AND pt.description ILIKE '%SNBT%'
        AND ut.prodi_id_list IS NOT NULL
        AND array_length(ut.prodi_id_list, 1) > 0
),
-- Combine user scores with prodi history, matched by nama_prodi
user_prodi_match AS (
    SELECT 
        uls.user_id,
        uls.product_type_id,
        uls.exam_type,
        uls.user_score,
        pwh.prodi_id,
        pwh.nama_prodi,
        pwh.jenjang_prodi,
        pwh.akreditasi,
        pwh.nama_pt,
        pwh.nama_singkat,
        pwh.peminat_current,
        pwh.daya_tampung_current,
        pwh.min_score_prev,
        pwh.max_score_prev,
        pwh.average_score_prev,
        pwh.has_historical_data,
        utp.target_choice_number,
        utp.target_prodi_name,
        -- Calculate similarity score (exact match = 1.0)
        ROUND((similarity(pwh.nama_prodi, utp.target_prodi_name) * 100)::NUMERIC, 2) AS similarity_score,
        -- Calculate metrics
        CASE 
            WHEN pwh.min_score_prev IS NOT NULL AND pwh.min_score_prev > 0 
            THEN ROUND(uls.user_score - pwh.min_score_prev, 2)
            ELSE NULL
        END AS score_gap,
        CASE 
            WHEN pwh.daya_tampung_current IS NOT NULL AND pwh.daya_tampung_current > 0
                AND pwh.peminat_current IS NOT NULL AND pwh.peminat_current > 0
            THEN ROUND(pwh.peminat_current::NUMERIC / pwh.daya_tampung_current::NUMERIC, 2)
            ELSE NULL
        END AS competition_ratio,
        -- Qualification status
        CASE 
            WHEN pwh.min_score_prev IS NULL OR pwh.min_score_prev = 0 THEN 'No Historical Data'
            WHEN uls.user_score >= pwh.min_score_prev THEN 'Qualified'
            ELSE 'Not Qualified'
        END AS qualification_status
    FROM user_latest_scores uls
    JOIN user_target_prodi utp ON utp.user_id = uls.user_id 
        AND utp.product_type_id = uls.product_type_id
    CROSS JOIN prodi_with_history pwh
    WHERE pwh.has_historical_data = true
        AND uls.exam_type ILIKE '%SNBT%'  -- Only for SNBT exams
        AND pwh.min_score_prev IS NOT NULL
        AND pwh.min_score_prev > 0  -- Only include prodi with valid min_score
        AND NOT (pwh.prodi_id = ANY(utp.prodi_id_list))  -- Exclude prodi already in target
),
-- Deduplicate prodi_id per user (keep highest similarity match)
user_prodi_dedup AS (
    SELECT DISTINCT ON (user_id, exam_type, prodi_id)
        user_id,
        product_type_id,
        exam_type,
        user_score,
        prodi_id,
        nama_prodi,
        jenjang_prodi,
        akreditasi,
        nama_pt,
        nama_singkat,
        peminat_current,
        daya_tampung_current,
        min_score_prev,
        max_score_prev,
        average_score_prev,
        target_choice_number,
        target_prodi_name,
        similarity_score,
        score_gap,
        competition_ratio,
        qualification_status,
        'similarity' AS recommendation_type
    FROM user_prodi_match
    ORDER BY user_id, exam_type, prodi_id, similarity_score DESC
),
-- Limit similarity-based to top 20 per user
similarity_top20 AS (
    SELECT 
        user_id, product_type_id, exam_type, user_score, prodi_id,
        nama_prodi, jenjang_prodi, akreditasi, nama_pt, nama_singkat,
        peminat_current, daya_tampung_current, min_score_prev, max_score_prev,
        average_score_prev, target_choice_number, target_prodi_name,
        NULL::TEXT AS target_university_name,  -- Not applicable for similarity
        similarity_score, score_gap, competition_ratio, qualification_status,
        recommendation_type
    FROM (
        SELECT *,
            ROW_NUMBER() OVER (
                PARTITION BY user_id, exam_type
                ORDER BY 
                    CASE WHEN qualification_status = 'Qualified' THEN 0 ELSE 1 END,
                    similarity_score DESC,
                    score_gap DESC NULLS LAST,
                    competition_ratio ASC NULLS LAST
            ) AS similarity_rank
        FROM user_prodi_dedup
    ) ranked
    WHERE similarity_rank <= 20
),
-- Get universities from user targets
user_target_universities AS (
    SELECT DISTINCT
        ut.user_id,
        ut.product_type_id,
        pt.description AS exam_type,
        p.university_id,
        u.nama_pt,
        ut.prodi_id_list
    FROM user_target ut
    JOIN product_type pt ON pt.id = ut.product_type_id
    CROSS JOIN LATERAL unnest(ut.prodi_id_list) AS t(prodi_id)
    JOIN prodi p ON p.id = t.prodi_id
    LEFT JOIN universities u ON u.id = p.university_id
    WHERE pt.group_product ILIKE 'TO%'
        AND pt.description ILIKE '%SNBT%'
        AND ut.prodi_id_list IS NOT NULL
        AND array_length(ut.prodi_id_list, 1) > 0
        AND p.university_id IS NOT NULL
),
-- Get other prodi from same universities
same_university_recommendations AS (
    SELECT 
        utu.user_id,
        utu.product_type_id,
        utu.exam_type,
        uls.user_score,
        pwh.prodi_id,
        pwh.nama_prodi,
        pwh.jenjang_prodi,
        pwh.akreditasi,
        pwh.nama_pt,
        pwh.nama_singkat,
        pwh.peminat_current,
        pwh.daya_tampung_current,
        pwh.min_score_prev,
        pwh.max_score_prev,
        pwh.average_score_prev,
        NULL::INTEGER AS target_choice_number,  -- Not linked to specific choice
        NULL::TEXT AS target_prodi_name,  -- Not linked to specific prodi
        utu.nama_pt AS target_university_name,  -- Reference to target university
        100.0 AS similarity_score,  -- Same university = 100% match
        CASE 
            WHEN pwh.min_score_prev IS NOT NULL AND pwh.min_score_prev > 0 
            THEN ROUND(uls.user_score - pwh.min_score_prev, 2)
            ELSE NULL
        END AS score_gap,
        CASE 
            WHEN pwh.daya_tampung_current IS NOT NULL AND pwh.daya_tampung_current > 0
                AND pwh.peminat_current IS NOT NULL AND pwh.peminat_current > 0
            THEN ROUND(pwh.peminat_current::NUMERIC / pwh.daya_tampung_current::NUMERIC, 2)
            ELSE NULL
        END AS competition_ratio,
        CASE 
            WHEN pwh.min_score_prev IS NULL OR pwh.min_score_prev = 0 THEN 'No Historical Data'
            WHEN uls.user_score >= pwh.min_score_prev THEN 'Qualified'
            ELSE 'Not Qualified'
        END AS qualification_status,
        'same_university' AS recommendation_type,
        -- Ranking within same university
        ROW_NUMBER() OVER (
            PARTITION BY utu.user_id, utu.exam_type, utu.university_id
            ORDER BY 
                CASE WHEN uls.user_score >= pwh.min_score_prev THEN 0 ELSE 1 END,
                ABS(uls.user_score - pwh.min_score_prev) ASC,
                pwh.min_score_prev DESC
        ) AS university_rank
    FROM user_target_universities utu
    JOIN user_latest_scores uls ON uls.user_id = utu.user_id 
        AND uls.product_type_id = utu.product_type_id
    JOIN prodi_with_history pwh ON pwh.university_id = utu.university_id
    WHERE pwh.has_historical_data = true
        AND uls.exam_type ILIKE '%SNBT%'
        AND pwh.min_score_prev IS NOT NULL
        AND pwh.min_score_prev > 0
        AND NOT (pwh.prodi_id = ANY(utu.prodi_id_list))  -- Exclude target prodi
),
-- Filter top 5 per university (exclude prodi already in similarity recommendations)
same_university_top5 AS (
    SELECT 
        sur.user_id,
        sur.product_type_id,
        sur.exam_type,
        sur.user_score,
        sur.prodi_id,
        sur.nama_prodi,
        sur.jenjang_prodi,
        sur.akreditasi,
        sur.nama_pt,
        sur.nama_singkat,
        sur.peminat_current,
        sur.daya_tampung_current,
        sur.min_score_prev,
        sur.max_score_prev,
        sur.average_score_prev,
        sur.target_choice_number,
        sur.target_prodi_name,
        sur.target_university_name,
        sur.similarity_score,
        sur.score_gap,
        sur.competition_ratio,
        sur.qualification_status,
        sur.recommendation_type
    FROM same_university_recommendations sur
    WHERE sur.university_rank <= 5
        -- Exclude prodi already recommended via similarity
        AND NOT EXISTS (
            SELECT 1 FROM similarity_top20 st
            WHERE st.user_id = sur.user_id
                AND st.exam_type = sur.exam_type
                AND st.prodi_id = sur.prodi_id
        )
),
-- Combine both recommendation types (20 similarity + 5 per university)
all_recommendations AS (
    SELECT 
        user_id, product_type_id, exam_type, user_score, prodi_id,
        nama_prodi, jenjang_prodi, akreditasi, nama_pt, nama_singkat,
        peminat_current, daya_tampung_current, min_score_prev, max_score_prev,
        average_score_prev, target_choice_number, target_prodi_name,
        target_university_name,
        similarity_score, score_gap, competition_ratio, qualification_status,
        recommendation_type
    FROM similarity_top20
    UNION ALL
    SELECT 
        user_id, product_type_id, exam_type, user_score, prodi_id,
        nama_prodi, jenjang_prodi, akreditasi, nama_pt, nama_singkat,
        peminat_current, daya_tampung_current, min_score_prev, max_score_prev,
        average_score_prev, target_choice_number, target_prodi_name,
        target_university_name,
        similarity_score, score_gap, competition_ratio, qualification_status,
        recommendation_type
    FROM same_university_top5
)
SELECT 
    user_id,
    product_type_id,
    exam_type,
    user_score,
    prodi_id,
    nama_prodi,
    jenjang_prodi,
    akreditasi,
    nama_pt,
    nama_singkat,
    peminat_current,
    daya_tampung_current,
    min_score_prev,
    max_score_prev,
    average_score_prev,
    target_choice_number,
    target_prodi_name,
    target_university_name,
    similarity_score,
    score_gap,
    competition_ratio,
    qualification_status,
    recommendation_type,
    rank_by_score_gap,
    rank_by_competition
FROM (
    SELECT 
        user_id,
        product_type_id,
        exam_type,
        user_score,
        prodi_id,
        nama_prodi,
        jenjang_prodi,
        akreditasi,
        nama_pt,
        nama_singkat,
        peminat_current,
        daya_tampung_current,
        min_score_prev,
        max_score_prev,
        average_score_prev,
        target_choice_number,
        target_prodi_name,
        target_university_name,
        similarity_score,
        score_gap,
        competition_ratio,
        qualification_status,
        recommendation_type,
        -- Ranking per user (already limited: 20 similarity + 5 per university)
        ROW_NUMBER() OVER (
            PARTITION BY user_id, exam_type
            ORDER BY 
                CASE WHEN recommendation_type = 'similarity' THEN 0 ELSE 1 END,  -- Similarity first, then same-university
                CASE WHEN qualification_status = 'Qualified' THEN 0 ELSE 1 END,
                score_gap DESC NULLS LAST,
                competition_ratio ASC NULLS LAST,
                similarity_score DESC
        ) AS rank_by_score_gap,
        ROW_NUMBER() OVER (
            PARTITION BY user_id, exam_type
            ORDER BY 
                CASE WHEN recommendation_type = 'similarity' THEN 0 ELSE 1 END,
                CASE WHEN qualification_status = 'Qualified' THEN 0 ELSE 1 END,
                competition_ratio ASC NULLS LAST,
                score_gap DESC NULLS LAST,
                similarity_score DESC
        ) AS rank_by_competition
    FROM all_recommendations
) ranked;

-- Create unique index for CONCURRENTLY refresh (required)
CREATE UNIQUE INDEX idx_recommended_programs_unique 
    ON mv_recommended_programs(user_id, exam_type, prodi_id);

-- Create indexes for better performance
CREATE INDEX idx_recommended_programs_user_exam 
    ON mv_recommended_programs(user_id, exam_type);
CREATE INDEX idx_recommended_programs_rank_score 
    ON mv_recommended_programs(user_id, exam_type, rank_by_score_gap);
CREATE INDEX idx_recommended_programs_rank_competition 
    ON mv_recommended_programs(user_id, exam_type, rank_by_competition);

-- Create function to refresh the view
CREATE OR REPLACE FUNCTION refresh_recommended_programs_view()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_recommended_programs;
    RAISE NOTICE 'Materialized view mv_recommended_programs refreshed successfully';
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON mv_recommended_programs TO PUBLIC;

-- =========================================================
-- Usage Examples:
-- =========================================================

-- Refresh view manually:
-- SELECT refresh_recommended_programs_view();

-- Get top 5 recommendations per target prodi for user:
-- SELECT * FROM mv_recommended_programs 
-- WHERE user_id = 123 AND exam_type = 'SNBT Exam'
-- ORDER BY nama_prodi, rank_by_score_gap;

-- Count recommendations per user:
-- SELECT user_id, exam_type, COUNT(*) AS total_recs, COUNT(DISTINCT nama_prodi) AS unique_prodi
-- FROM mv_recommended_programs
-- WHERE user_id = 123
-- GROUP BY user_id, exam_type;
