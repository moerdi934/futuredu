-- =========================================================
-- FIX: Competitive Analysis View
-- =========================================================
-- Masalah: Score incomparable karena beda metode agregasi per product_type
-- Solusi: Gunakan raw scores, jangan normalize (karena max_score hanya untuk display)

DROP MATERIALIZED VIEW IF EXISTS mv_reportexam_competitiveanalysis CASCADE;

CREATE MATERIALIZED VIEW mv_reportexam_competitiveanalysis AS
WITH ranked_answers AS (
  -- Get latest attempt for each user per exam_schedule and exam
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, exam_schedule_id, exam_id
      ORDER BY GREATEST(COALESCE(postdate, '1900-01-01'), COALESCE(completion_time, '1900-01-01')) DESC
    ) AS rn
  FROM user_exam_scores
  WHERE is_final = true
),
exam_schedule_totals AS (
  -- Sum all exam scores in each schedule (respecting weighted_score flag)
  SELECT 
    ra.user_id,
    ra.exam_schedule_id,
    es.name AS exam_schedule_name,
    pt.description AS exam_type,
    pt.id AS product_type_id,
    COALESCE(ess.max_score, 100) AS max_score,
    COALESCE(ess.metrics, 'average') AS metrics,
    -- Calculate based on metrics type
    CASE 
      WHEN COALESCE(ess.metrics, 'average') = 'average' THEN 
        AVG(
          CASE 
            WHEN es.is_need_weighted_score = true THEN ra.weighted_score
            ELSE ra.score
          END
        )
      ELSE -- sum or total
        SUM(
          CASE 
            WHEN es.is_need_weighted_score = true THEN ra.weighted_score
            ELSE ra.score
          END
        )
    END AS total_score,
    MAX(ra.completion_time) AS latest_completion_time
  FROM ranked_answers ra
  JOIN exam_schedule es ON es.id = ra.exam_schedule_id
  JOIN product_type pt ON pt.id = es.type
  LEFT JOIN exam_schedule_scoring ess ON ess.type = pt.id
  WHERE ra.rn = 1
    AND pt.group_product ILIKE 'TO%'
    AND pt.description IS NOT NULL
  GROUP BY 
    ra.user_id, 
    ra.exam_schedule_id, 
    es.name,
    pt.description,
    pt.id,
    ess.max_score,
    ess.metrics,
    es.is_need_weighted_score
),
latest_user_exams AS (
  -- Get most recent exam for each user per exam type
  SELECT 
    user_id,
    exam_type,
    product_type_id,
    max_score,
    metrics,
    total_score,
    latest_completion_time,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, exam_type
      ORDER BY latest_completion_time DESC
    ) AS recency_rank
  FROM exam_schedule_totals
),
latest_scores AS (
  -- Only keep the most recent exam
  SELECT 
    user_id,
    exam_type,
    product_type_id,
    max_score,
    metrics,
    total_score
  FROM latest_user_exams
  WHERE recency_rank = 1
),
exam_type_stats AS (
  -- Calculate percentiles based on RAW scores (not normalized)
  SELECT
    exam_type,
    product_type_id,
    MAX(max_score) AS max_score,
    MAX(metrics) AS metrics,
    COUNT(DISTINCT user_id) AS total_participants,
    ROUND(AVG(total_score)::NUMERIC, 2) AS average_score,
    ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY total_score)::NUMERIC, 2) AS top_5_percent,
    ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY total_score)::NUMERIC, 2) AS top_10_percent,
    ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_score)::NUMERIC, 2) AS top_25_percent
  FROM latest_scores
  GROUP BY exam_type, product_type_id
),
user_rankings AS (
  -- Calculate rank per exam type based on raw score
  SELECT
    user_id,
    exam_type,
    total_score,
    RANK() OVER (PARTITION BY exam_type ORDER BY total_score DESC) AS type_rank
  FROM latest_scores
)
SELECT
  ls.user_id,
  ls.exam_type,
  ls.product_type_id,
  ur.type_rank,
  ls.total_score AS avg_score,  -- Raw score
  ets.max_score,
  ets.metrics,
  -- Percentiles in raw score form
  ets.top_5_percent,
  ets.top_10_percent,
  ets.top_25_percent,
  ets.average_score,
  ets.total_participants,
  NOW() AS postdate
FROM latest_scores ls
JOIN exam_type_stats ets ON ls.exam_type = ets.exam_type AND ls.product_type_id = ets.product_type_id
JOIN user_rankings ur ON ur.user_id = ls.user_id AND ur.exam_type = ls.exam_type;

-- Create indexes
CREATE INDEX idx_mv_competitive_user ON mv_reportexam_competitiveanalysis(user_id);
CREATE INDEX idx_mv_competitive_type ON mv_reportexam_competitiveanalysis(exam_type);
CREATE INDEX idx_mv_competitive_user_type ON mv_reportexam_competitiveanalysis(user_id, exam_type);
CREATE INDEX idx_mv_competitive_product_type ON mv_reportexam_competitiveanalysis(product_type_id);
CREATE INDEX idx_mv_competitive_postdate ON mv_reportexam_competitiveanalysis(postdate DESC);

-- Create unique index for CONCURRENT refresh
CREATE UNIQUE INDEX idx_mv_competitive_unique ON mv_reportexam_competitiveanalysis(user_id, exam_type);

COMMENT ON MATERIALIZED VIEW mv_reportexam_competitiveanalysis IS 
'Competitive analysis with proper score calculation based on metrics. 
Uses AVG for metrics=average, SUM for metrics=sum/total. 
Respects is_need_weighted_score flag. Percentiles calculated on raw scores (no normalization).';

-- =========================================================
-- PENJELASAN PERUBAHAN:
-- =========================================================
-- 1. Menghitung total_score dengan benar berdasarkan metrics:
--    - Jika metrics = "average": AVG(scores) dari semua exam dalam schedule
--    - Jika metrics = "sum" atau "total": SUM(scores) dari semua exam
--    - Menggunakan weighted_score jika is_need_weighted_score = true
--
-- 2. TIDAK ADA NORMALISASI:
--    - Percentile dihitung dari raw scores
--    - Karena max_score hanya untuk display reference, bukan untuk normalisasi
--    - SNBT dengan 7 exams bisa dapat total > 1000 (misal 4960)
--
-- 3. Contoh SNBT Exam (metrics = sum atau total):
--    - 7 exams @ 700 max each = 4900 max total
--    - User score: SUM(exam1_score + exam2_score + ... + exam7_score)
--    - Top 5%: 4960.65 (raw sum)
--    - max_score: 1000 (hanya untuk display "dari 1000")
--
-- 4. Backward compatibility:
--    - avg_score: raw score seperti sebelumnya
--    - top_5_percent, top_10_percent, top_25_percent: raw scores
--    - max_score dan metrics: untuk reference
-- =========================================================
