-- =========================================================
-- Materialized View: Passing Probability with Details
-- =========================================================

DROP MATERIALIZED VIEW IF EXISTS mv_passing_probability CASCADE;

CREATE MATERIALIZED VIEW mv_passing_probability AS
  WITH user_latest_score AS (
    -- Get user's latest total score per user, exam_schedule, and product_type
    -- Respect metrics (AVG vs SUM) and weighted_score flag
    SELECT 
      ra.user_id,
      ra.exam_schedule_id,
      es.type as product_type_id,
      pt.description as exam_type,
      esc.metrics,
      CASE 
        WHEN esc.metrics = 'average' THEN
          AVG(
            CASE 
              WHEN es.is_need_weighted_score = true THEN ra.weighted_score
              ELSE ra.score
            END
          )
        ELSE
          SUM(
            CASE 
              WHEN es.is_need_weighted_score = true THEN ra.weighted_score
              ELSE ra.score
            END
          )
      END as total_score
    FROM (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY user_id, exam_schedule_id, exam_id
          ORDER BY GREATEST(COALESCE(postdate, '1900-01-01'), COALESCE(completion_time, '1900-01-01')) DESC
        ) AS rn
      FROM user_exam_scores
      WHERE is_final = true
    ) ra
    JOIN exam_schedule es ON es.id = ra.exam_schedule_id
    JOIN product_type pt ON pt.id = es.type
    LEFT JOIN exam_schedule_scoring esc ON esc.type = pt.id
    WHERE ra.rn = 1
    GROUP BY ra.user_id, ra.exam_schedule_id, es.type, pt.description, esc.metrics
  ),
  latest_user_score AS (
    -- Get only the latest exam_schedule per user and product_type
    SELECT 
      uls.*,
      ROW_NUMBER() OVER (PARTITION BY uls.user_id, uls.product_type_id ORDER BY uls.exam_schedule_id DESC) as latest_rn
    FROM user_latest_score uls
  ),
  user_targets AS (
    SELECT 
      ut.user_id,
      ut.product_type_id,
      t.prodi_id,
      t.prodi_idx as choice_number
    FROM user_target ut
    CROSS JOIN LATERAL unnest(ut.prodi_id_list) WITH ORDINALITY AS t(prodi_id, prodi_idx)
  ),
  target_scores AS (
    SELECT 
      uls.user_id,
      uls.product_type_id,
      uls.exam_type,
      ut.choice_number,
      ut.prodi_id,
      p.nama_prodi,
      u.nama_pt as university_name,
      hur.min_score as min_score_prev,
      uls.total_score as user_score,
      -- Calculate probability for each choice
      CASE 
        WHEN hur.min_score IS NULL OR hur.min_score = 0 THEN 0
        WHEN uls.total_score >= hur.min_score THEN
          -- Score exceeds minimum → high probability (75-100%)
          LEAST(100, 75 + ((uls.total_score - hur.min_score) / NULLIF(hur.min_score, 0) * 25))
        ELSE
          -- Score below minimum → scaled probability (0-75%)
          (uls.total_score / NULLIF(hur.min_score, 0) * 75)
      END as choice_probability
    FROM user_targets ut
    JOIN latest_user_score uls ON uls.user_id = ut.user_id AND uls.product_type_id = ut.product_type_id
    JOIN prodi p ON p.id = ut.prodi_id
    LEFT JOIN universities u ON u.id = p.university_id
    LEFT JOIN LATERAL (
      SELECT min_score, average_score
      FROM history_utbk_result
      WHERE prodi_id = ut.prodi_id
        AND min_score IS NOT NULL
        AND min_score > 0
      ORDER BY year DESC
      LIMIT 1
    ) hur ON true
    WHERE uls.latest_rn = 1  -- Only latest exam_schedule
  ),
  max_probability_per_user AS (
    SELECT 
      user_id, 
      product_type_id,
      exam_type,
      MAX(choice_probability) as max_prob
    FROM target_scores
    GROUP BY user_id, product_type_id, exam_type
  )
  SELECT 
    ts.user_id,
    ts.product_type_id,
    ts.exam_type,
    ROUND(COALESCE(mp.max_prob, 0), 2) as overall_probability,
    ts.choice_number,
    ts.nama_prodi as prodi_name,
    ts.university_name,
    ts.min_score_prev,
    ts.user_score,
    ROUND(ts.choice_probability, 2) as choice_probability
  FROM target_scores ts
  JOIN max_probability_per_user mp ON mp.user_id = ts.user_id 
    AND mp.product_type_id = ts.product_type_id 
    AND mp.exam_type = ts.exam_type
  ORDER BY ts.user_id, ts.product_type_id, ts.choice_number;

CREATE INDEX idx_mv_passing_probability_user ON mv_passing_probability(user_id, product_type_id);
CREATE INDEX idx_mv_passing_probability_exam_type ON mv_passing_probability(exam_type);

COMMENT ON MATERIALIZED VIEW mv_passing_probability IS
'Passing probability with details for each target choice.
Shows overall probability (max) and breakdown per choice (1-4) for all users.';
