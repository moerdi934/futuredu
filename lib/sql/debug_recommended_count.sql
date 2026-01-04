-- Debug query untuk cek kenapa lebih dari 10 rekomendasi

-- 1. Cek berapa target prodi user
SELECT 
    ut.user_id,
    pt.description AS exam_type,
    ut.prodi_id_list,
    array_length(ut.prodi_id_list, 1) AS jumlah_target,
    array_to_string(
        ARRAY(
            SELECT p.nama_prodi 
            FROM unnest(ut.prodi_id_list) AS pid
            JOIN prodi p ON p.id = pid
        ), ', '
    ) AS nama_prodi_targets
FROM user_target ut
JOIN product_type pt ON pt.id = ut.product_type_id
WHERE ut.user_id = 92  -- Ganti dengan user_id yang bermasalah
    AND pt.description ILIKE '%SNBT%';

-- 2. Cek berapa rekomendasi di materialized view
SELECT 
    user_id,
    exam_type,
    COUNT(*) AS total_recommendations,
    COUNT(DISTINCT nama_prodi) AS unique_prodi_names,
    COUNT(DISTINCT prodi_id) AS unique_prodi_ids
FROM mv_recommended_programs
WHERE user_id = 92  -- Ganti dengan user_id yang bermasalah
GROUP BY user_id, exam_type;

-- 3. Lihat detail rekomendasi
SELECT 
    user_id,
    nama_prodi,
    nama_pt,
    rank_by_score_gap,
    rank_by_competition,
    score_gap,
    competition_ratio
FROM mv_recommended_programs
WHERE user_id = 92  -- Ganti dengan user_id yang bermasalah
ORDER BY rank_by_score_gap;

-- 3b. Cek distribusi ranking
SELECT 
    'Score Gap Ranking' AS category,
    rank_by_score_gap AS rank_number,
    COUNT(*) AS count_at_this_rank
FROM mv_recommended_programs
WHERE user_id = 92
GROUP BY rank_by_score_gap
ORDER BY rank_by_score_gap
LIMIT 10;

SELECT 
    'Competition Ranking' AS category,
    rank_by_competition AS rank_number,
    COUNT(*) AS count_at_this_rank
FROM mv_recommended_programs
WHERE user_id = 92
GROUP BY rank_by_competition
ORDER BY rank_by_competition
LIMIT 10;

-- 4. Cek apakah ada duplicate prodi_id
SELECT 
    prodi_id,
    nama_prodi,
    nama_pt,
    COUNT(*) AS duplicate_count
FROM mv_recommended_programs
WHERE user_id = 92  -- Ganti dengan user_id yang bermasalah
GROUP BY prodi_id, nama_prodi, nama_pt
HAVING COUNT(*) > 1;
