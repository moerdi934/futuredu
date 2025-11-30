SELECT rank_now, rank_previous, avg_score_now, avg_score_previous,
              total_score, total_participants, percentile
       FROM mv_reportexam_userglobaldata
       WHERE user_id = 92 AND exam_type = 'SNBT Exam'
       ORDER BY postdate DESC
       LIMIT 1
       
       select * from mv_exam_schedule_rankings mesr 
       where user_id =92
       
       select count(*) from mv_exam_schedule_rankings where exam_schedule_id =276
       
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
    -- Get the second latest exam for each user and exam type
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
    ON cr.exam_type = pc.exam_type
 where cr.user_id = 92
 and cr.exam_type = 'SNBT Exam'