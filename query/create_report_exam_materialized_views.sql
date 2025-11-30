  -- migrations/create_report_exam_materialized_views.sql

  -- Drop existing materialized views if any
  DROP MATERIALIZED VIEW IF EXISTS mv_reportexam_competitiveanalysis CASCADE;
  DROP MATERIALIZED VIEW IF EXISTS mv_reportexam_userglobaldata CASCADE;
  DROP MATERIALIZED VIEW IF EXISTS mv_reportexam_topicdata CASCADE;
  DROP MATERIALIZED VIEW IF EXISTS mv_reportexam_progressdetail CASCADE;
  DROP MATERIALIZED VIEW IF EXISTS mv_reportexam_recentexamresult CASCADE;
  DROP MATERIALIZED VIEW IF EXISTS mv_reportexam_weeklyprogressdata CASCADE;
  DROP MATERIALIZED VIEW IF EXISTS mv_reportexam_subjectperformance CASCADE;

  -- #============================================================================
  -- 1. Subject Performance
  -- ============================================================================
  CREATE MATERIALIZED VIEW mv_reportexam_subjectperformance AS
  WITH ranked_answers AS (
    SELECT *,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, exam_schedule_id, exam_id
        ORDER BY GREATEST(COALESCE(postdate, '1900-01-01'), COALESCE(completion_time, '1900-01-01')) DESC
      ) AS rn
    FROM user_exam_scores
  ),
  score AS (
    SELECT 
      ra.*,
      es.name exam_schedule_name,
      pt.description AS tipe,
      e.name,
      et.name mapel,
      CASE 
        WHEN es.is_need_weighted_score = true THEN weighted_score
        ELSE score
      END AS final_score  
    FROM ranked_answers ra
    LEFT JOIN exams e ON e.id = ra.exam_id
    LEFT JOIN exam_schedule es ON es.id = ra.exam_schedule_id
    LEFT JOIN product_type pt ON pt.id = es.type
    LEFT JOIN exam_types et ON et.id = e.exam_type 
    WHERE ra.rn = 1
  )
  SELECT 
    s.tipe, 
    s.mapel,
    s.user_id, 
    AVG(final_score) nilai, 
    NOW() postdate 
  FROM score s
  GROUP BY s.tipe, s.mapel, s.user_id;

  CREATE INDEX idx_mv_subjectperf_user ON mv_reportexam_subjectperformance(user_id);
  CREATE INDEX idx_mv_subjectperf_tipe ON mv_reportexam_subjectperformance(tipe);
  CREATE INDEX idx_mv_subjectperf_mapel ON mv_reportexam_subjectperformance(mapel);
  CREATE INDEX idx_mv_subjectperf_user_tipe ON mv_reportexam_subjectperformance(user_id, tipe);

  -- ============================================================================
  -- 2. Weekly Progress Data
  -- ============================================================================
  CREATE MATERIALIZED VIEW mv_reportexam_weeklyprogressdata AS
  WITH ranked_answers AS (
    SELECT *,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, exam_schedule_id, exam_id
        ORDER BY GREATEST(COALESCE(postdate, '1900-01-01'), COALESCE(completion_time, '1900-01-01')) DESC
      ) AS rn
    FROM user_exam_scores
  ),
  exam_totals AS (
    SELECT
      pt.description AS tipe,
      ra.user_id,
      ra.exam_schedule_id,
      SUM(
        CASE
          WHEN es.is_need_weighted_score = true THEN weighted_score
          ELSE score
        END
      ) AS total_score,
      EXTRACT(WEEK FROM completion_time) AS weeknum,
      EXTRACT(WEEK FROM CURRENT_DATE) AS current_weeknum
    FROM ranked_answers ra
    LEFT JOIN exams e ON e.id = ra.exam_id
    LEFT JOIN exam_schedule es ON es.id = ra.exam_schedule_id
    LEFT JOIN product_type pt ON pt.id = es.type
    LEFT JOIN exam_types et ON et.id = e.exam_type
    WHERE ra.rn = 1
    GROUP BY pt.description, ra.user_id, ra.exam_schedule_id, weeknum, EXTRACT(WEEK FROM CURRENT_DATE)
  ),
  weekly_scores AS (
    SELECT 
      tipe, 
      user_id,
      (current_weeknum - weeknum) AS weeks_ago,
      AVG(total_score) AS avg_score
    FROM exam_totals
    WHERE weeknum BETWEEN (current_weeknum - 4) AND current_weeknum
    GROUP BY tipe, user_id, weeks_ago
  )
  SELECT 
    tipe, 
    user_id,
    MAX(CASE WHEN weeks_ago = 0 THEN avg_score END) AS week5,
    MAX(CASE WHEN weeks_ago = 1 THEN avg_score END) AS week4,
    MAX(CASE WHEN weeks_ago = 2 THEN avg_score END) AS week3,
    MAX(CASE WHEN weeks_ago = 3 THEN avg_score END) AS week2,
    MAX(CASE WHEN weeks_ago = 4 THEN avg_score END) AS week1,
    NOW() postdate
  FROM weekly_scores
  GROUP BY tipe, user_id;

  CREATE INDEX idx_mv_weeklyprog_user ON mv_reportexam_weeklyprogressdata(user_id);
  CREATE INDEX idx_mv_weeklyprog_tipe ON mv_reportexam_weeklyprogressdata(tipe);
  CREATE INDEX idx_mv_weeklyprog_user_tipe ON mv_reportexam_weeklyprogressdata(user_id, tipe);

  -- ============================================================================
  -- 3. Recent Exam Result (Updated with correct logic)
  -- ============================================================================
    DROP MATERIALIZED VIEW IF EXISTS mv_reportexam_recentexamresult CASCADE;

  CREATE MATERIALIZED VIEW mv_reportexam_recentexamresult AS
  WITH ranked_answers AS (
    SELECT *,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, exam_schedule_id, exam_id
        ORDER BY GREATEST(COALESCE(postdate, '1900-01-01'), COALESCE(completion_time, '1900-01-01')) DESC
      ) AS rn
    FROM user_exam_scores
  ),
  exam_schedule_with_count AS (
    SELECT 
      es.id as exam_schedule_id,
      es.name as exam_schedule_name,
      es.is_need_weighted_score,
      pt.description as tipe,
      CARDINALITY(es.exam_id_list) as number_of_exams
    FROM exam_schedule es
    LEFT JOIN product_type pt ON pt.id = es.type
  ),
  user_exam_scores_per_schedule AS (
    SELECT
      ra.user_id,
      ra.exam_schedule_id,
      ra.exam_id,
      CASE 
        WHEN esc.is_need_weighted_score = true THEN ra.weighted_score
        ELSE ra.score
      END AS final_score,
      ra.completion_time
    FROM ranked_answers ra
    JOIN exam_schedule_with_count esc ON esc.exam_schedule_id = ra.exam_schedule_id
    WHERE ra.rn = 1 AND ra.is_final = true
  ),
  exam_schedule_stats AS (
    SELECT
      ues.user_id,
      ues.exam_schedule_id,
      AVG(ues.final_score) as average_score,
      MIN(ues.final_score) as min_score,
      MAX(ues.final_score) as max_score,
      MAX(ues.completion_time) as latest_completion_time
    FROM user_exam_scores_per_schedule ues
    GROUP BY ues.user_id, ues.exam_schedule_id
  ),
  min_exam_detail AS (
    SELECT DISTINCT ON (ues.user_id, ues.exam_schedule_id)
      ues.user_id,
      ues.exam_schedule_id,
      mtr.top_topic_name as min_exam_name,
      ues.final_score as min_score
    FROM user_exam_scores_per_schedule ues
    JOIN exams e ON e.id = ues.exam_id
    INNER JOIN exam_schedule_stats ess 
      ON ess.user_id = ues.user_id 
      AND ess.exam_schedule_id = ues.exam_schedule_id
      AND ess.min_score = ues.final_score
     left join (
    SELECT
    sub.exam_schedule_id,
    sub.exam_id,
    sub.topic AS top_topic_name,
    sub.percentage AS top_topic_percentage
FROM (
    SELECT
        es.id AS exam_schedule_id,
        e.id AS exam_id,
        et3.name AS topic,
        COUNT(*) AS topic_count,
        ROUND(
            COUNT(*)::numeric * 100 / SUM(COUNT(*)) OVER (PARTITION BY es.id, e.id),
            2
        ) AS percentage,
        ROW_NUMBER() OVER (
            PARTITION BY es.id, e.id
            ORDER BY COUNT(*) DESC
        ) AS rn
    FROM exam_schedule es
    CROSS JOIN LATERAL unnest(es.exam_id_list) AS exam_id
    JOIN exams e ON e.id = exam_id
    CROSS JOIN LATERAL unnest(e.question_id_list) AS question_id
    JOIN questions q ON q.id = question_id
    LEFT JOIN exam_types et ON et.id = q.question_topic_type
    LEFT JOIN exam_types et2 ON et2.id = et.master_id
    LEFT JOIN exam_types et3 ON et3.id = et2.master_id
    WHERE es.id = 276
    GROUP BY es.id, e.id, et3.name
) sub
WHERE sub.rn = 1
    ) mtr on mtr.exam_schedule_id= ues.exam_schedule_id and mtr.exam_id = ues.exam_id
    ORDER BY ues.user_id, ues.exam_schedule_id, ues.completion_time DESC
  ),
  max_exam_detail AS (
    SELECT DISTINCT ON (ues.user_id, ues.exam_schedule_id)
      ues.user_id,
      ues.exam_schedule_id,
      mtr.top_topic_name as max_exam_name,
      ues.final_score as max_score
    FROM user_exam_scores_per_schedule ues
    JOIN exams e ON e.id = ues.exam_id
    INNER JOIN exam_schedule_stats ess 
      ON ess.user_id = ues.user_id 
      AND ess.exam_schedule_id = ues.exam_schedule_id
      AND ess.max_score = ues.final_score
    left join (
    SELECT
    sub.exam_schedule_id,
    sub.exam_id,
    sub.topic AS top_topic_name,
    sub.percentage AS top_topic_percentage
FROM (
    SELECT
        es.id AS exam_schedule_id,
        e.id AS exam_id,
        et3.name AS topic,
        COUNT(*) AS topic_count,
        ROUND(
            COUNT(*)::numeric * 100 / SUM(COUNT(*)) OVER (PARTITION BY es.id, e.id),
            2
        ) AS percentage,
        ROW_NUMBER() OVER (
            PARTITION BY es.id, e.id
            ORDER BY COUNT(*) DESC
        ) AS rn
    FROM exam_schedule es
    CROSS JOIN LATERAL unnest(es.exam_id_list) AS exam_id
    JOIN exams e ON e.id = exam_id
    CROSS JOIN LATERAL unnest(e.question_id_list) AS question_id
    JOIN questions q ON q.id = question_id
    LEFT JOIN exam_types et ON et.id = q.question_topic_type
    LEFT JOIN exam_types et2 ON et2.id = et.master_id
    LEFT JOIN exam_types et3 ON et3.id = et2.master_id
    WHERE es.id = 276
    GROUP BY es.id, e.id, et3.name
) sub
WHERE sub.rn = 1
    ) mtr on mtr.exam_schedule_id= ues.exam_schedule_id and mtr.exam_id = ues.exam_id
    ORDER BY ues.user_id, ues.exam_schedule_id, ues.completion_time DESC
  ),
  latest_schedule_per_type AS (
    SELECT
      ess.user_id,
      esc.tipe,
      ess.exam_schedule_id,
      esc.exam_schedule_name,
      ess.average_score as score,
      ess.latest_completion_time as completion_time,
      esc.number_of_exams,
      ess.average_score,
      ess.min_score,
      med.min_exam_name,
      ess.max_score,
      maxd.max_exam_name,
      ROW_NUMBER() OVER (
        PARTITION BY ess.user_id, esc.tipe
        ORDER BY ess.latest_completion_time DESC
      ) as type_rank
    FROM exam_schedule_stats ess
    JOIN exam_schedule_with_count esc ON esc.exam_schedule_id = ess.exam_schedule_id
    LEFT JOIN min_exam_detail med 
      ON med.user_id = ess.user_id 
      AND med.exam_schedule_id = ess.exam_schedule_id
    LEFT JOIN max_exam_detail maxd 
      ON maxd.user_id = ess.user_id 
      AND maxd.exam_schedule_id = ess.exam_schedule_id
  )
  SELECT
    user_id,
    tipe,
    exam_schedule_name,
    score,
    completion_time,
    number_of_exams,
    average_score,
    min_score,
    min_exam_name,
    t.max_score,
    max_exam_name,
    sc.max_score  max_score_limit,
    sc.metrics,
    NOW() as postdate
  FROM latest_schedule_per_type t
  left join product_type pt on pt.description = t.tipe
  left join exam_schedule_scoring sc on sc.type= pt.id
  WHERE type_rank <= 5;
  
  CREATE INDEX idx_mv_recentexam_user ON mv_reportexam_recentexamresult(user_id);
  CREATE INDEX idx_mv_recentexam_tipe ON mv_reportexam_recentexamresult(tipe);
  CREATE INDEX idx_mv_recentexam_user_tipe ON mv_reportexam_recentexamresult(user_id, tipe);
  CREATE INDEX idx_mv_recentexam_completion ON mv_reportexam_recentexamresult(completion_time DESC);

  -- ============================================================================
  -- 4. Progress Detail
  -- ============================================================================
  CREATE MATERIALIZED VIEW mv_reportexam_progressdetail AS
  WITH ranked_answers_current AS (
    SELECT *,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, exam_schedule_id, exam_id
        ORDER BY GREATEST(COALESCE(postdate, '1900-01-01'), COALESCE(completion_time, '1900-01-01')) DESC
      ) AS rn
    FROM user_exam_scores
  ),
  ranked_answers_previous AS (
    SELECT *,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, exam_schedule_id, exam_id
        ORDER BY GREATEST(COALESCE(postdate, '1900-01-01'), COALESCE(completion_time, '1900-01-01')) DESC
      ) AS rn
    FROM user_exam_scores
    WHERE completion_time < DATE_TRUNC('month', CURRENT_DATE)
  ),
  current_scores AS (
    SELECT
      ra.user_id,
      pt.description AS tipe,
      et.name mapel,
      CASE
        WHEN es.is_need_weighted_score = true THEN weighted_score
        ELSE score
      END AS final_score
    FROM ranked_answers_current ra
    LEFT JOIN exams e ON e.id = ra.exam_id
    LEFT JOIN exam_schedule es ON es.id = ra.exam_schedule_id
    LEFT JOIN product_type pt ON pt.id = es.type
    LEFT JOIN exam_types et ON et.id = e.exam_type
    WHERE ra.rn = 1
  ),
  previous_scores AS (
    SELECT
      pt.description AS tipe,
      et.name mapel,
      CASE
        WHEN es.is_need_weighted_score = true THEN weighted_score
        ELSE score
      END AS final_score,
      ra.user_id
    FROM ranked_answers_previous ra
    LEFT JOIN exams e ON e.id = ra.exam_id
    LEFT JOIN exam_schedule es ON es.id = ra.exam_schedule_id
    LEFT JOIN product_type pt ON pt.id = es.type
    LEFT JOIN exam_types et ON et.id = e.exam_type
    WHERE ra.rn = 1
  )
  SELECT 
    c.user_id,
    c.tipe, 
    c.mapel,
    COALESCE(AVG(c.final_score), 0) AS avg_all_time,
    COALESCE(AVG(p.final_score), 0) AS avg_until_last_month,
    COALESCE(AVG(c.final_score), 0) - COALESCE(AVG(p.final_score), 0) AS difference,
    NOW() postdate
  FROM current_scores c
  LEFT JOIN previous_scores p ON c.tipe = p.tipe AND c.mapel = p.mapel AND c.user_id = p.user_id
  GROUP BY c.tipe, c.mapel, c.user_id;

  CREATE INDEX idx_mv_progdetail_user ON mv_reportexam_progressdetail(user_id);
  CREATE INDEX idx_mv_progdetail_tipe ON mv_reportexam_progressdetail(tipe);
  CREATE INDEX idx_mv_progdetail_mapel ON mv_reportexam_progressdetail(mapel);
  CREATE INDEX idx_mv_progdetail_user_tipe ON mv_reportexam_progressdetail(user_id, tipe);

  -- ============================================================================
  -- 5. Topic Data
  -- ============================================================================
  CREATE MATERIALIZED VIEW mv_reportexam_topicdata AS
  WITH ranked_answers AS (
    SELECT *,
      ROW_NUMBER() OVER (
        PARTITION BY user_id, question_id
        ORDER BY COALESCE(answer_time, '1900-01-01') DESC
      ) AS rn
    FROM user_answers ua
  ),
  exam_schedule_unnested AS (
    SELECT
      es.id AS schedule_id,
      pt.description AS exam_type,
      UNNEST(es.exam_id_list) AS exam_id
    FROM exam_schedule es
    LEFT JOIN product_type pt ON pt.id = es.type
  ),
  exam_questions AS (
    SELECT 
      e.id AS exam_id,
      e.exam_type AS exam_exam_type,
      UNNEST(e.question_id_list) AS question_id
    FROM exams e
  ),
  question_exam_types AS (
    SELECT DISTINCT
      q.id AS question_id,
      q.question_topic_type,
      esu.exam_type
    FROM questions q
    LEFT JOIN exam_questions eq ON eq.question_id = q.id
    LEFT JOIN exam_schedule_unnested esu ON esu.exam_id = eq.exam_id
  ),
  jumlah_soal_exist AS (
    SELECT
      COUNT(DISTINCT qet.question_id),
      et2.name AS topic,
      et3.name AS mapel,
      qet.exam_type
    FROM question_exam_types qet
    LEFT JOIN exam_types et ON et.id = qet.question_topic_type
    LEFT JOIN exam_types et2 ON et2.id = et.master_id
    LEFT JOIN exam_types et3 ON et3.id = et2.master_id
    GROUP BY topic, mapel, qet.exam_type
  ),
  user_topic_stats AS (
    SELECT
      ra.user_id,
      et2.name AS topic,
      et3.name AS mapel,
      qet.exam_type,
      COUNT(DISTINCT ra.question_id) AS completed,
      SUM(CASE WHEN ra.is_correct = true THEN 1 ELSE 0 END) AS correct_answers
    FROM ranked_answers ra
    JOIN question_exam_types qet ON qet.question_id = ra.question_id
    LEFT JOIN exam_types et ON qet.question_topic_type = et.id
    LEFT JOIN exam_types et2 ON et.master_id = et2.id
    LEFT JOIN exam_types et3 ON et3.id = et2.master_id
    WHERE rn = 1
    GROUP BY ra.user_id, et2.name, et3.name, qet.exam_type
  ),
  topic_avg_stats AS (
    SELECT
      topic,
      mapel,
      exam_type,
      CEILING(AVG(
        CASE
          WHEN completed > 0 THEN (correct_answers::NUMERIC / completed) * 100
          ELSE 0
        END
      )) AS avg_accuracy
    FROM user_topic_stats
    GROUP BY topic, mapel, exam_type
  )
  SELECT
    uts.user_id,
    uts.topic,
    uts.mapel,
    uts.exam_type,
    uts.completed,
    uts.correct_answers,
    CASE
      WHEN uts.completed > 0 THEN CEILING((uts.correct_answers::NUMERIC / uts.completed) * 100)
      ELSE 0
    END AS accuracy_percentage,
    jse.count AS jumlah_soal,
    tas.avg_accuracy,
    NOW() AS postdate
  FROM user_topic_stats uts
  LEFT JOIN topic_avg_stats tas ON uts.topic = tas.topic AND uts.mapel = tas.mapel AND uts.exam_type = tas.exam_type
  LEFT JOIN jumlah_soal_exist jse ON jse.topic = uts.topic AND jse.mapel = uts.mapel AND jse.exam_type = uts.exam_type;

  CREATE INDEX idx_mv_topicdata_user ON mv_reportexam_topicdata(user_id);
  CREATE INDEX idx_mv_topicdata_type ON mv_reportexam_topicdata(exam_type);
  CREATE INDEX idx_mv_topicdata_topic ON mv_reportexam_topicdata(topic);
  CREATE INDEX idx_mv_topicdata_user_type ON mv_reportexam_topicdata(user_id, exam_type);

  -- ============================================================================
  -- 6. User Global Data (Using mv_exam_schedule_rankings)
  -- ============================================================================
  CREATE MATERIALIZED VIEW mv_reportexam_userglobaldata AS
  WITH ranked_exams AS (
    -- Get all exam schedule rankings with exam type
    SELECT 
      esr.user_id,
      esr.exam_schedule_id,
      esr.total_score,
      esr.average_score,
      esr.rank,
      esr.latest_completion_time,
      pt.description AS exam_type,
      ROW_NUMBER() OVER (
        PARTITION BY esr.user_id, pt.description 
        ORDER BY esr.latest_completion_time DESC
      ) AS completion_order
    FROM mv_exam_schedule_rankings esr
    JOIN exam_schedule es ON es.id = esr.exam_schedule_id
    LEFT JOIN product_type pt ON pt.id = es.type
    WHERE pt.description IS NOT NULL
  ),
  current_rankings AS (
    -- Get the latest (most recent) exam for each user and exam type
    SELECT 
      user_id,
      exam_type,
      exam_schedule_id AS latest_schedule_id,
      total_score,
      average_score AS avg_score_now,
      rank AS rank_now,
      latest_completion_time
    FROM ranked_exams
    WHERE completion_order = 1
  ),
  previous_rankings AS (
    -- Get the second latest exam for each user and exam type (previous week equivalent)
    SELECT 
      user_id,
      exam_type,
      exam_schedule_id AS previous_schedule_id,
      average_score AS avg_score_previous,
      rank AS rank_previous
    FROM ranked_exams
    WHERE completion_order = 2
  ),
  participant_counts AS (
    -- Count total participants per exam type (based on latest completion)
    SELECT 
      re.exam_type,
      COUNT(DISTINCT re.user_id) AS total_participants
    FROM ranked_exams re
    WHERE re.completion_order = 1
    GROUP BY re.exam_type
  )
  SELECT 
    cr.user_id,
    cr.exam_type,
    cr.rank_now,
    pr.rank_previous,
    cr.avg_score_now,
    pr.avg_score_previous,
    cr.total_score,
    pc.total_participants,
    CEILING(cr.rank_now::numeric * 100.0 / NULLIF(pc.total_participants, 0)::numeric) AS percentile,
    NOW() AS postdate
  FROM current_rankings cr
  LEFT JOIN previous_rankings pr 
    ON cr.user_id = pr.user_id 
    AND cr.exam_type = pr.exam_type
  LEFT JOIN participant_counts pc 
    ON cr.exam_type = pc.exam_type;

  CREATE INDEX idx_mv_userglobal_user ON mv_reportexam_userglobaldata(user_id);
  CREATE INDEX idx_mv_userglobal_type ON mv_reportexam_userglobaldata(exam_type);
  CREATE INDEX idx_mv_userglobal_user_type ON mv_reportexam_userglobaldata(user_id, exam_type);
  CREATE INDEX idx_mv_userglobal_postdate ON mv_reportexam_userglobaldata(postdate DESC);

  -- ============================================================================
  -- 7. Competitive Analysis (Using mv_exam_schedule_rankings)
  -- ============================================================================
  CREATE MATERIALIZED VIEW mv_reportexam_competitiveanalysis AS
  WITH ranked_exams AS (
    -- Get latest exam for each user per exam type
    SELECT 
      esr.user_id,
      esr.exam_schedule_id,
      esr.total_score,
      esr.average_score,
      esr.rank,
      esr.latest_completion_time,
      pt.description AS exam_type,
      ROW_NUMBER() OVER (
        PARTITION BY esr.user_id, pt.description 
        ORDER BY esr.latest_completion_time DESC
      ) AS completion_order
    FROM mv_exam_schedule_rankings esr
    JOIN exam_schedule es ON es.id = esr.exam_schedule_id
    LEFT JOIN product_type pt ON pt.id = es.type
    WHERE pt.description IS NOT NULL
  ),
  latest_user_scores AS (
    -- Only get the most recent exam for each user per exam type
    SELECT 
      user_id,
      exam_type,
      total_score,
      average_score AS avg_score,
      rank AS type_rank
    FROM ranked_exams
    WHERE completion_order = 1
  ),
  participants_count_by_type AS (
    -- Count participants per exam type
    SELECT
      exam_type,
      COUNT(DISTINCT user_id) AS total_participants
    FROM latest_user_scores
    GROUP BY exam_type
  ),
  exam_type_stats AS (
    -- Calculate percentiles and average for each exam type
    SELECT
      exam_type,
      ROUND(AVG(total_score)::NUMERIC, 2) AS average_score,
      ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY total_score)::NUMERIC, 2) AS top_5_percent,
      ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY total_score)::NUMERIC, 2) AS top_10_percent,
      ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_score)::NUMERIC, 2) AS top_25_percent
    FROM latest_user_scores
    GROUP BY exam_type
  )
  SELECT
    lus.user_id,
    lus.exam_type,
    lus.type_rank,
    lus.avg_score,
    ets.top_5_percent,
    ets.top_10_percent,
    ets.top_25_percent,
    ets.average_score,
    pcbt.total_participants,
    NOW() AS postdate    
  FROM latest_user_scores lus
  JOIN exam_type_stats ets ON lus.exam_type = ets.exam_type
  JOIN participants_count_by_type pcbt ON lus.exam_type = pcbt.exam_type;

  CREATE INDEX idx_mv_competitive_user ON mv_reportexam_competitiveanalysis(user_id);
  CREATE INDEX idx_mv_competitive_type ON mv_reportexam_competitiveanalysis(exam_type);
  CREATE INDEX idx_mv_competitive_user_type ON mv_reportexam_competitiveanalysis(user_id, exam_type);
  CREATE INDEX idx_mv_competitive_postdate ON mv_reportexam_competitiveanalysis(postdate DESC);

  -- ============================================================================
  -- REFRESH COMMAND (Run this periodically via cron job)
  -- ============================================================================
  -- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_subjectperformance;
  -- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_weeklyprogressdata;
  -- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_recentexamresult;
  -- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_progressdetail;
  -- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_topicdata;
  -- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_userglobaldata;
  -- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_reportexam_competitiveanalysis;