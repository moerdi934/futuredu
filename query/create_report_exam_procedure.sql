CREATE OR REPLACE PROCEDURE mars.sp_build_reportexam()
 LANGUAGE plpgsql
AS $procedure$
	BEGIN
	    
	-- Operasi 1: Insert ke tabel log
	    INSERT INTO mars.process_log_table (log_time, message)
	    VALUES (NOW(), 'Transaction started');
	
	    -- Truncate existing data to avoid duplicates (optional)
	    TRUNCATE TABLE mars.reportExam_subjectPerformance;
	    TRUNCATE TABLE mars.reportexam_weeklyprogressdata;
	    TRUNCATE TABLE mars.reportexam_recentexamresult;
	    TRUNCATE TABLE mars.reportexam_progressdetail;
	    TRUNCATE TABLE mars.reportexam_topicdata;
	    TRUNCATE TABLE mars.reportexam_userglobaldata;
	    TRUNCATE TABLE mars.reportexam_competitiveanalysis;
	
	    --subjectPerformance
	    WITH ranked_answers AS (
	      SELECT *,
	             ROW_NUMBER() OVER (
	               PARTITION BY user_id, exam_schedule_id, exam_id
	               ORDER BY GREATEST(COALESCE(postdate, '1900-01-01'), COALESCE(completion_time, '1900-01-01')) DESC
	             ) AS rn
	      FROM user_exam_scores
	    ),
	    score as (SELECT *,
	        --nama exam
	      es.name exam_schedule_name,
	        -- snbt, simak
	      es.exam_type tipe,
	        --
	      e.name,
	      et.name mapel,
	      CASE 
	        WHEN es.is_need_weighted_score = true THEN weighted_score
	        ELSE score
	      END AS final_score  
	    FROM ranked_answers ra
	    LEFT JOIN exams e ON e.id = ra.exam_id
	    LEFT JOIN exam_schedule es ON es.id = ra.exam_schedule_id
	    left join exam_types et on et.id  = e.exam_type 
	    WHERE ra.rn = 1
	      )
	      INSERT INTO mars.reportExam_subjectPerformance
	      SELECT s.tipe, s.mapel,s.user_id, avg(final_score) nilai, now() postdate 
	      FROM score s
	      GROUP BY
	        s.tipe, s.mapel, s.user_id;
	    
	    --weeklyprogressdata
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
	        es.exam_type AS tipe,
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
	      LEFT JOIN exam_types et ON et.id = e.exam_type
	      WHERE ra.rn = 1
	      GROUP BY es.exam_type, ra.user_id, ra.exam_schedule_id, weeknum, EXTRACT(WEEK FROM CURRENT_DATE)
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
	    INSERT INTO mars.reportexam_weeklyprogressdata
	    SELECT 
	      tipe, 
	      user_id,
	      MAX(CASE WHEN weeks_ago = 0 THEN avg_score END) AS week5,
	      MAX(CASE WHEN weeks_ago = 1 THEN avg_score END) AS week4,
	      MAX(CASE WHEN weeks_ago = 2 THEN avg_score END) AS week3,
	      MAX(CASE WHEN weeks_ago = 3 THEN avg_score END) AS week2,
	      MAX(CASE WHEN weeks_ago = 4 THEN avg_score END) AS week1,
	      now() postdate
	    FROM weekly_scores
	    GROUP BY tipe, user_id
	    ORDER BY tipe, user_id;
	
	    --recentresult
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
	        ra.user_id us,
	        es.name exam_schedule_name,
	        es.exam_type tipe,
	        e.name,
	        et.name mapel,
	        CASE
	          WHEN es.is_need_weighted_score = true THEN weighted_score
	          ELSE score
	        END AS final_score,
	        ra.completion_time
	      FROM ranked_answers ra
	      LEFT JOIN exams e ON e.id = ra.exam_id
	      LEFT JOIN exam_schedule es ON es.id = ra.exam_schedule_id
	      LEFT JOIN exam_types et ON et.id = e.exam_type
	      WHERE ra.rn = 1
	    ),
	    aggregated_scores AS (
	      SELECT
	        score.us user_id,
	        tipe,
	        exam_schedule_name,
	        SUM(final_score) score,
	        completion_time
	      FROM score
	      GROUP BY tipe, exam_schedule_name, completion_time, score.us
	    ),
	    ranked_by_user AS (
	      SELECT 
	        *,
	        ROW_NUMBER() OVER (
	          PARTITION BY user_id
	          ORDER BY completion_time DESC
	        ) AS user_rank
	      FROM aggregated_scores
	    )
	    INSERT INTO mars.reportexam_recentexamresult
	    SELECT
	      user_id,
	      tipe,
	      exam_schedule_name,
	      score,
	      completion_time,
	      now() postdate
	      FROM ranked_by_user
	    WHERE user_rank <= 5
	    ORDER BY user_id, completion_time DESC;
	
	    --radardate & progressdetail
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
	            es.exam_type tipe,
	            et.name mapel,
	            CASE
	                WHEN es.is_need_weighted_score = true THEN weighted_score
	                ELSE score
	            END AS final_score
	        FROM ranked_answers_current ra
	        LEFT JOIN exams e ON e.id = ra.exam_id
	        LEFT JOIN exam_schedule es ON es.id = ra.exam_schedule_id
	        LEFT JOIN exam_types et ON et.id = e.exam_type
	        WHERE ra.rn = 1
	    ),
	    previous_scores AS (
	        SELECT
	            es.exam_type tipe,
	            et.name mapel,
	            CASE
	                WHEN es.is_need_weighted_score = true THEN weighted_score
	                ELSE score
	            END AS final_score,
	            ra.user_id
	        FROM ranked_answers_previous ra
	        LEFT JOIN exams e ON e.id = ra.exam_id
	        LEFT JOIN exam_schedule es ON es.id = ra.exam_schedule_id
	        LEFT JOIN exam_types et ON et.id = e.exam_type
	        WHERE ra.rn = 1
	    )
	    INSERT INTO mars.reportexam_progressdetail
	    SELECT 
	        c.user_id,
	        c.tipe, 
	        c.mapel,
	        COALESCE(AVG(c.final_score), 0) AS avg_all_time,
	        COALESCE(AVG(p.final_score), 0) AS avg_until_last_month,
	        COALESCE(AVG(c.final_score), 0) - COALESCE(AVG(p.final_score), 0) AS difference,
	        now() postdate
	    FROM current_scores c
	    LEFT JOIN previous_scores p ON c.tipe = p.tipe AND c.mapel = p.mapel and c.user_id = p.user_id
	    GROUP BY c.tipe, c.mapel, c.user_id;
	
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
        es.exam_type,
        unnest(es.exam_id_list) AS exam_id
    FROM exam_schedule es
),
-- NEW: Unnest question_id_list from exams to get question-exam relationships
exam_questions AS (
    SELECT 
        e.id AS exam_id,
        e.exam_type AS exam_exam_type,
        unnest(e.question_id_list) AS question_id
    FROM exams e
),
question_exam_types AS (
    SELECT DISTINCT
        q.id AS question_id,
        q.question_topic_type,
        esu.exam_type
    FROM questions q
    -- Join with exam_questions to get the proper relationship
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
                WHEN completed > 0 THEN (correct_answers::numeric / completed) * 100
                ELSE 0
            END
        )) AS avg_accuracy
    FROM user_topic_stats
    GROUP BY topic, mapel, exam_type
)
INSERT INTO mars.reportexam_topicdata
SELECT
    uts.user_id,
    uts.topic,
    uts.mapel,
    uts.exam_type,
    uts.completed,
    uts.correct_answers,
    CASE
        WHEN uts.completed > 0 THEN CEILING((uts.correct_answers::numeric / uts.completed) * 100)
        ELSE 0
    END AS accuracy_percentage,
    jse.count AS jumlah_soal,
    tas.avg_accuracy,
    now() AS postdate
FROM user_topic_stats uts
LEFT JOIN topic_avg_stats tas ON uts.topic = tas.topic AND uts.mapel = tas.mapel AND uts.exam_type = tas.exam_type
LEFT JOIN jumlah_soal_exist jse ON jse.topic = uts.topic AND jse.mapel = uts.mapel AND jse.exam_type = uts.exam_type
ORDER BY uts.user_id, uts.topic, uts.mapel, uts.exam_type;
	
	    --Main
	    WITH latest_scores AS (
	        SELECT
	            ues.user_id,
	            es.exam_type,
	            ues.exam_schedule_id,
	            ues.exam_id,
	            ues.score,
	            ues.weighted_score,
	            ues.completion_time,
	            ROW_NUMBER() OVER (PARTITION BY ues.user_id, ues.exam_schedule_id, ues.exam_id ORDER BY ues.completion_time DESC) as score_rn
	        FROM user_exam_scores ues
	        JOIN exam_schedule es ON ues.exam_schedule_id = es.id
	        WHERE ues.is_final = true
	    ),
	    latest_completion_by_type AS (
	        SELECT
	            user_id,
	            exam_type,
	            MAX(completion_time) as latest_completion_time
	        FROM latest_scores
	        WHERE score_rn = 1
	        GROUP BY user_id, exam_type
	    ),
	    latest_schedule_by_type AS (
	        SELECT DISTINCT ON (ls.user_id, ls.exam_type)
	            ls.user_id,
	            ls.exam_type,
	            ls.exam_schedule_id,
	            ls.completion_time
	        FROM latest_scores ls
	        JOIN latest_completion_by_type lct ON 
	            ls.user_id = lct.user_id AND 
	            ls.exam_type = lct.exam_type AND 
	            ls.completion_time = lct.latest_completion_time
	        WHERE ls.score_rn = 1
	        ORDER BY ls.user_id, ls.exam_type, ls.exam_schedule_id
	    ),
	    current_aggregated_scores AS (
	        SELECT
	            ls.user_id,
	            ls.exam_type,
	            lst.exam_schedule_id as latest_schedule_id,
	            lst.completion_time as latest_completion_time,
	            SUM(CASE WHEN es.is_need_weighted_score = true THEN ls.weighted_score ELSE ls.score END) as total_score,
	            COUNT(DISTINCT ls.exam_id) as exam_count,
	            SUM(CASE WHEN es.is_need_weighted_score = true THEN ls.weighted_score ELSE ls.score END) / 
	                NULLIF(COUNT(DISTINCT ls.exam_id), 0) as avg_score_now
	        FROM latest_scores ls
	        JOIN exam_schedule es ON ls.exam_schedule_id = es.id
	        JOIN latest_schedule_by_type lst ON ls.user_id = lst.user_id AND ls.exam_type = lst.exam_type
	        WHERE ls.score_rn = 1
	        GROUP BY ls.user_id, ls.exam_type, lst.exam_schedule_id, lst.completion_time
	    ),
	    previous_week_scores AS (
	        SELECT
	            ues.user_id,
	            es.exam_type,
	            ues.exam_schedule_id,
	            ues.exam_id,
	            ues.score,
	            ues.weighted_score,
	            ues.completion_time,
	            ROW_NUMBER() OVER (PARTITION BY ues.user_id, ues.exam_schedule_id, ues.exam_id ORDER BY ues.completion_time DESC) as score_rn
	        FROM user_exam_scores ues
	        JOIN exam_schedule es ON ues.exam_schedule_id = es.id
	        WHERE 
	            ues.is_final = true AND
	            ues.completion_time <= (CURRENT_DATE - INTERVAL '7 days')
	    ),
	    previous_week_completion_by_type AS (
	        SELECT
	            user_id,
	            exam_type,
	            MAX(completion_time) as latest_completion_time
	        FROM previous_week_scores
	        WHERE score_rn = 1
	        GROUP BY user_id, exam_type
	    ),
	    previous_week_schedule_by_type AS (
	        SELECT DISTINCT ON (pws.user_id, pws.exam_type)
	            pws.user_id,
	            pws.exam_type,
	            pws.exam_schedule_id,
	            pws.completion_time
	        FROM previous_week_scores pws
	        JOIN previous_week_completion_by_type pwct ON 
	            pws.user_id = pwct.user_id AND 
	            pws.exam_type = pwct.exam_type AND 
	            pws.completion_time = pwct.latest_completion_time
	        WHERE pws.score_rn = 1
	        ORDER BY pws.user_id, pws.exam_type, pws.exam_schedule_id
	    ),
	    previous_aggregated_scores AS (
	        SELECT
	            pws.user_id,
	            pws.exam_type,
	            pwst.exam_schedule_id as latest_schedule_id,
	            pwst.completion_time as latest_completion_time,
	            SUM(CASE WHEN es.is_need_weighted_score = true THEN pws.weighted_score ELSE pws.score END) as total_score,
	            COUNT(DISTINCT pws.exam_id) as exam_count,
	            SUM(CASE WHEN es.is_need_weighted_score = true THEN pws.weighted_score ELSE pws.score END) / 
	                NULLIF(COUNT(DISTINCT pws.exam_id), 0) as avg_score_previous
	        FROM previous_week_scores pws
	        JOIN exam_schedule es ON pws.exam_schedule_id = es.id
	        JOIN previous_week_schedule_by_type pwst ON pws.user_id = pwst.user_id AND pws.exam_type = pwst.exam_type
	        WHERE pws.score_rn = 1
	        GROUP BY pws.user_id, pws.exam_type, pwst.exam_schedule_id, pwst.completion_time
	    ),
	    current_participants_count AS (
	        SELECT
	            exam_type,
	            COUNT(DISTINCT user_id) as total_participants
	        FROM latest_scores
	        WHERE score_rn = 1
	        GROUP BY exam_type
	    ),
	    current_user_ranks AS (
	        SELECT
	            cas.user_id,
	            cas.exam_type,
	            cas.latest_schedule_id,
	            cas.latest_completion_time,
	            cas.total_score,
	            cas.avg_score_now,
	            RANK() OVER (
	                PARTITION BY cas.exam_type
	                ORDER BY cas.avg_score_now DESC, cas.latest_completion_time ASC
	            ) as rank_now,
	            cpc.total_participants
	        FROM current_aggregated_scores cas
	        JOIN current_participants_count cpc ON cas.exam_type = cpc.exam_type
	    ),
	    previous_participants_count AS (
	        SELECT
	            exam_type,
	            COUNT(DISTINCT user_id) as total_participants
	        FROM previous_week_scores
	        WHERE score_rn = 1
	        GROUP BY exam_type
	    ),
	    previous_user_ranks AS (
	        SELECT
	            pas.user_id,
	            pas.exam_type,
	            pas.latest_schedule_id,
	            pas.latest_completion_time,
	            pas.total_score,
	            pas.avg_score_previous,
	            RANK() OVER (
	                PARTITION BY pas.exam_type
	                ORDER BY pas.avg_score_previous DESC, pas.latest_completion_time ASC
	            ) as rank_previous,
	            ppc.total_participants as previous_total_participants
	        FROM previous_aggregated_scores pas
	        JOIN previous_participants_count ppc ON pas.exam_type = ppc.exam_type
	    )
	    INSERT INTO mars.reportexam_userglobaldata
	    SELECT
	        cur.user_id,
	        cur.exam_type,
	        cur.rank_now,
	        prev.rank_previous,
	        cur.avg_score_now,
	        prev.avg_score_previous,
	        cur.total_score,
	        cur.total_participants,
	        CEILING(cur.rank_now * 100.0 / NULLIF(cur.total_participants, 0)) as percentile,
	        now() postdate
	    FROM current_user_ranks cur
	    LEFT JOIN previous_user_ranks prev ON 
	        cur.user_id = prev.user_id AND 
	        cur.exam_type = prev.exam_type
	    ORDER BY cur.exam_type, cur.rank_now;
	
	    --competitive_analysis
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
	        es.exam_type
	    FROM latest_scores ls
	    JOIN exam_schedule es ON ls.exam_schedule_id = es.id
	    WHERE ls.rn = 1
	    GROUP BY ls.user_id, ls.exam_schedule_id, es.exam_type
	    ),
	    latest_exam_schedule_per_type AS (
	    SELECT
	        user_id,
	        exam_type,
	        FIRST_VALUE(exam_schedule_id) OVER (
	            PARTITION BY user_id, exam_type
	            ORDER BY latest_completion_time DESC
	        ) as latest_exam_schedule_id
	    FROM aggregated_scores
	    ),
	    user_scores_by_exam_type AS (
	    SELECT
	        as1.user_id,
	        as1.exam_type,
	        as1.total_score,
	        as1.exam_count,
	        ROUND((as1.total_score / NULLIF(as1.exam_count, 0))::numeric, 2) as avg_score
	    FROM aggregated_scores as1
	    JOIN latest_exam_schedule_per_type lept
	    ON as1.user_id = lept.user_id
	    AND as1.exam_schedule_id = lept.latest_exam_schedule_id
	    AND as1.exam_type = lept.exam_type
	    ),
	    participants_count_by_type AS (
	    SELECT
	        es.exam_type,
	        COUNT(DISTINCT usbet.user_id) as total_participants
	    FROM user_scores_by_exam_type usbet
	    JOIN exam_schedule es ON usbet.exam_type = es.exam_type
	    GROUP BY es.exam_type
	    ),
	    exam_type_stats AS (
	    SELECT
	        exam_type,
	        ROUND(AVG(total_score)::numeric, 2) as average_score,
	        ROUND(PERCENTILE_CONT(0.05) WITHIN GROUP (ORDER BY total_score DESC)::numeric, 2) as top_5_percent,
	        ROUND(PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY total_score DESC)::numeric, 2) as top_10_percent,
	        ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_score DESC)::numeric, 2) as top_25_percent
	    FROM user_scores_by_exam_type
	    GROUP BY exam_type
	    ),
	    user_ranks_by_exam_type AS (
	    SELECT
	        usbet.user_id,
	        usbet.exam_type,
	        usbet.total_score,
	        usbet.exam_count,
	        usbet.avg_score,
	        RANK() OVER (
	            PARTITION BY usbet.exam_type
	            ORDER BY usbet.avg_score DESC
	        ) as type_rank,
	        pcbt.total_participants
	    FROM user_scores_by_exam_type usbet
	    JOIN participants_count_by_type pcbt ON usbet.exam_type = pcbt.exam_type
	    )
	    INSERT INTO mars.reportexam_competitiveanalysis
	    SELECT
	        ur.*,
	        ets.average_score,
	        ets.top_5_percent,
	        ets.top_10_percent,
	        ets.top_25_percent,
	        now() postdate    
	    FROM user_ranks_by_exam_type ur
	    JOIN exam_type_stats ets ON ur.exam_type = ets.exam_type
	    ORDER BY ur.exam_type, ur.type_rank;
	
	    -- Operasi 3: Insert ke tabel lain
	    INSERT INTO mars.process_audit_table (action, performed_at)
	    VALUES ('Score updated', NOW());
	    
	EXCEPTION
	    WHEN OTHERS THEN
	        -- Log the error and re-raise
	        INSERT INTO mars.process_error_log (error_time, error_message)
	        VALUES (NOW(), SQLERRM);
	        RAISE NOTICE 'Transaction failed: %', SQLERRM;
	        RAISE; -- Re-throw the exception to ensure rollback
	END;
	$procedure$
