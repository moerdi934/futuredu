-- Debug query untuk user_id = 92

-- 1. Cek user punya target SNBT
SELECT 
    ut.user_id,
    pt.description AS exam_type,
    ut.prodi_id_list,
    array_length(ut.prodi_id_list, 1) AS target_count
FROM user_target ut
JOIN product_type pt ON pt.id = ut.product_type_id
WHERE ut.user_id = 92
    AND pt.description ILIKE '%SNBT%';

-- 2. Cek user punya score SNBT
SELECT 
    ra.user_id,
    pt.description AS exam_type,
    SUM(
        CASE 
            WHEN es.is_need_weighted_score = true THEN ra.weighted_score
            ELSE ra.score
        END
    ) AS total_score
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
WHERE ra.user_id = 92
    AND pt.description ILIKE '%SNBT%'
    AND ra.is_final = true
    AND ra.rn = 1
GROUP BY ra.user_id, pt.description;

-- 3. Cek data di materialized view untuk user ini
SELECT 
    user_id,
    exam_type,
    COUNT(*) AS total_recommendations
FROM mv_recommended_programs
WHERE user_id = 92
GROUP BY user_id, exam_type;

-- 4. Detail recommendations jika ada
SELECT 
    user_id,
    exam_type,
    nama_prodi,
    nama_pt,
    target_choice_number,
    target_prodi_name,
    similarity_score,
    score_gap,
    qualification_status,
    rank_by_score_gap
FROM mv_recommended_programs
WHERE user_id = 92
ORDER BY rank_by_score_gap
LIMIT 20;

-- 5. Cek apakah pg_trgm extension aktif
SELECT * FROM pg_extension WHERE extname = 'pg_trgm';
