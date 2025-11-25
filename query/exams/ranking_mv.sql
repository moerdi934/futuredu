-- migrations/create_ranking_materialized_views.sql

-- Drop existing views if any
DROP MATERIALIZED VIEW IF EXISTS mv_user_exam_schedule_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_exam_schedule_rankings CASCADE;

-- Materialized View untuk ranking per exam schedule
CREATE MATERIALIZED VIEW mv_exam_schedule_rankings AS
WITH latest_scores AS (
  SELECT DISTINCT ON (ues.user_id, ues.exam_id, ues.exam_schedule_id)
    ues.user_id,
    ues.exam_id,
    ues.exam_schedule_id,
    ues.score,
    ues.weighted_score,
    ues.completion_time
  FROM user_exam_scores ues
  WHERE ues.is_final = true
  ORDER BY ues.user_id, ues.exam_id, ues.exam_schedule_id, ues.completion_time DESC
),
aggregated_scores AS (
  SELECT 
    ls.user_id,
    ls.exam_schedule_id,
    SUM(CASE 
        WHEN es.is_need_weighted_score THEN COALESCE(ls.weighted_score, 0)
        ELSE ls.score
      END) as total_score,
    COUNT(DISTINCT ls.exam_id) as exam_count,
    MAX(ls.completion_time) as latest_completion_time
  FROM latest_scores ls
  JOIN exam_schedule es ON es.id = ls.exam_schedule_id
  GROUP BY ls.user_id, ls.exam_schedule_id
),
user_data AS (
  SELECT 
    ag.user_id,
    ag.exam_schedule_id,
    ag.total_score,
    ROUND(ag.total_score::NUMERIC / NULLIF(ag.exam_count, 0), 2) as average_score,
    ag.latest_completion_time,
    vdu.kota,
    vdu.provinsi,
    vdu.pendidikan,
    vdu.nama_lengkap as name
  FROM aggregated_scores ag
  LEFT JOIN v_dashboard_userdata vdu ON vdu.userid = ag.user_id
),
overall_rankings AS (
  SELECT 
    user_id,
    exam_schedule_id,
    total_score,
    average_score,
    latest_completion_time,
    DENSE_RANK() OVER (
      PARTITION BY exam_schedule_id 
      ORDER BY total_score DESC, latest_completion_time ASC
    ) as rank,
    kota,
    provinsi,
    pendidikan,
    name,
    COALESCE(kota || '-' || provinsi, 'Unknown') as lokasi
  FROM user_data
),
city_rankings AS (
  SELECT 
    user_id,
    exam_schedule_id,
    kota,
    DENSE_RANK() OVER (
      PARTITION BY exam_schedule_id, kota 
      ORDER BY total_score DESC, latest_completion_time ASC
    ) as rank_kota
  FROM user_data
  WHERE kota IS NOT NULL
),
province_rankings AS (
  SELECT 
    user_id,
    exam_schedule_id,
    provinsi,
    DENSE_RANK() OVER (
      PARTITION BY exam_schedule_id, provinsi 
      ORDER BY total_score DESC, latest_completion_time ASC
    ) as rank_provinsi
  FROM user_data
  WHERE provinsi IS NOT NULL
)
SELECT 
  owr.user_id,
  owr.exam_schedule_id,
  owr.total_score,
  owr.average_score,
  owr.rank,
  owr.kota,
  owr.provinsi,
  cr.rank_kota,
  pr.rank_provinsi,
  owr.lokasi,
  owr.pendidikan as sekolah,
  owr.name,
  owr.latest_completion_time,
  NOW() as last_refreshed
FROM overall_rankings owr
LEFT JOIN city_rankings cr ON cr.user_id = owr.user_id AND cr.exam_schedule_id = owr.exam_schedule_id
LEFT JOIN province_rankings pr ON pr.user_id = owr.user_id AND pr.exam_schedule_id = owr.exam_schedule_id;

-- Create indexes for better query performance
CREATE INDEX idx_mv_exam_schedule_rankings_schedule_id 
  ON mv_exam_schedule_rankings(exam_schedule_id);
CREATE INDEX idx_mv_exam_schedule_rankings_user_id 
  ON mv_exam_schedule_rankings(user_id);
CREATE INDEX idx_mv_exam_schedule_rankings_rank 
  ON mv_exam_schedule_rankings(exam_schedule_id, rank);
CREATE INDEX idx_mv_exam_schedule_rankings_kota 
  ON mv_exam_schedule_rankings(exam_schedule_id, kota);
CREATE INDEX idx_mv_exam_schedule_rankings_provinsi 
  ON mv_exam_schedule_rankings(exam_schedule_id, provinsi);
CREATE INDEX idx_mv_exam_schedule_rankings_sekolah 
  ON mv_exam_schedule_rankings(exam_schedule_id, sekolah);

-- Materialized View untuk user exam schedule summary
CREATE MATERIALIZED VIEW mv_user_exam_schedule_summary AS
WITH latest_scores AS (
  SELECT
    ues.user_id,
    ues.exam_schedule_id,
    ues.exam_id,
    ues.score,
    ues.weighted_score,
    ues.completion_time,
    ROW_NUMBER() OVER (
      PARTITION BY ues.user_id, ues.exam_schedule_id, ues.exam_id 
      ORDER BY ues.completion_time DESC
    ) as rn
  FROM user_exam_scores ues
  WHERE ues.is_final = true
),
aggregated_scores AS (
  SELECT
    ls.user_id,
    ls.exam_schedule_id,
    SUM(CASE 
      WHEN es.is_need_weighted_score = true 
      THEN ls.weighted_score 
      ELSE ls.score 
    END) as total_score,
    COUNT(DISTINCT ls.exam_id) as exam_count,
    MAX(ls.completion_time) as latest_completion_time
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
    ag.user_id,
    ag.exam_schedule_id,
    ag.total_score,
    ag.exam_count,
    ROUND(ag.total_score::NUMERIC / NULLIF(ag.exam_count, 0), 2) as avg_score,
    ag.latest_completion_time,
    RANK() OVER (
      PARTITION BY ag.exam_schedule_id 
      ORDER BY ag.total_score DESC, ag.latest_completion_time ASC
    ) as overall_rank,
    pc.total_participants
  FROM aggregated_scores ag
  JOIN participants_count pc ON ag.exam_schedule_id = pc.exam_schedule_id
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
          ORDER BY ur.total_score DESC, ur.latest_completion_time ASC
        )
      ELSE NULL
    END as city_rank
  FROM user_ranks ur
  JOIN v_dashboard_userdata vdu ON ur.user_id = vdu.userid
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
          ORDER BY ur.total_score DESC, ur.latest_completion_time ASC
        )
      ELSE NULL
    END as province_rank
  FROM user_ranks ur
  JOIN v_dashboard_userdata vdu ON ur.user_id = vdu.userid
)
SELECT
  ur.user_id,
  ur.exam_schedule_id,
  es.name as exam_schedule_name,
  es.exam_type,
  ur.overall_rank as rank,
  ur.total_participants as peserta,
  ur.total_score as skor_total,
  ur.avg_score,
  ur.latest_completion_time as waktu,
  cr.city_rank as rank_kota,
  pr.province_rank as rank_provinsi,
  cr.kota,
  pr.provinsi,
  NOW() as last_refreshed
FROM user_ranks ur
JOIN exam_schedule es ON ur.exam_schedule_id = es.id
LEFT JOIN city_ranks cr ON ur.user_id = cr.user_id AND ur.exam_schedule_id = cr.exam_schedule_id
LEFT JOIN province_ranks pr ON ur.user_id = pr.user_id AND ur.exam_schedule_id = pr.exam_schedule_id;

-- Create indexes
CREATE INDEX idx_mv_user_exam_summary_user_id 
  ON mv_user_exam_schedule_summary(user_id);
CREATE INDEX idx_mv_user_exam_summary_schedule_id 
  ON mv_user_exam_schedule_summary(exam_schedule_id);
CREATE INDEX idx_mv_user_exam_summary_exam_type 
  ON mv_user_exam_schedule_summary(exam_type);
CREATE INDEX idx_mv_user_exam_summary_rank 
  ON mv_user_exam_schedule_summary(user_id, rank);