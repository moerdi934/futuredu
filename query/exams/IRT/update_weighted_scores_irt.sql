-- functions/update_weighted_scores_irt.sql

CREATE OR REPLACE FUNCTION update_weighted_scores_irt_3pl()
RETURNS TABLE(
    exam_schedule_id INTEGER,
    users_updated INTEGER,
    execution_time_ms INTEGER
) AS $$
DECLARE
    schedule_record RECORD;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    users_affected INTEGER;
BEGIN
    -- Loop through all exam schedules that need weighted scoring with IRT 3PL
    FOR schedule_record IN 
        SELECT id 
        FROM exam_schedule 
        WHERE is_need_weighted_score = true 
          AND weighted_formula_id = 1
          AND is_active = true -- optional: only process active schedules
    LOOP
        start_time := clock_timestamp();
        
        -- Execute the weighted score calculation for this exam_schedule_id
        WITH exam_data AS (
            -- Ambil semua exam_id dari exam_schedule
            SELECT UNNEST(exam_id_list) as exam_id
            FROM exam_schedule
            WHERE id = schedule_record.id
        ),
        question_data AS (
            -- Ambil semua question_id dari exams yang terkait
            SELECT DISTINCT 
                e.id as exam_id,
                UNNEST(e.question_id_list) as question_id
            FROM exams e
            INNER JOIN exam_data ed ON e.id = ed.exam_id
        ),
        answer_stats AS (
            -- Hitung statistik jawaban per soal untuk parameter IRT
            SELECT 
                ua.question_id,
                COUNT(*) FILTER (WHERE ua.is_correct = true) as count_user_right,
                COUNT(*) FILTER (WHERE ua.is_correct = false) as count_user_false,
                COUNT(*) as total_responses
            FROM user_answers ua
            WHERE ua.exam_schedule_id = schedule_record.id
            GROUP BY ua.question_id
        ),
        user_scores AS (
            -- Ambil skor CTT (raw score) untuk setiap user
            SELECT 
                ues.user_id,
                ues.exam_id,
                ues.score as ctt_score
            FROM user_exam_scores ues
            WHERE ues.exam_schedule_id = schedule_record.id
        ),
        score_statistics AS (
            -- Hitung mean dan stddev skor total per exam
            SELECT 
                exam_id,
                AVG(score) as mean_score,
                STDDEV_POP(score) as stddev_score
            FROM user_exam_scores
            WHERE exam_schedule_id = schedule_record.id
            GROUP BY exam_id
        ),
        correct_wrong_scores AS (
            -- Hitung rata-rata skor untuk yang benar dan salah per soal
            SELECT 
                ua.question_id,
                ua.exam_id,
                AVG(us.ctt_score) FILTER (WHERE ua.is_correct = true) as mean_score_correct,
                AVG(us.ctt_score) FILTER (WHERE ua.is_correct = false) as mean_score_wrong,
                COUNT(*) FILTER (WHERE ua.is_correct = true)::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC as p_correct
            FROM user_answers ua
            INNER JOIN user_scores us ON ua.user_id = us.user_id AND ua.exam_id = us.exam_id
            WHERE ua.exam_schedule_id = schedule_record.id
            GROUP BY ua.question_id, ua.exam_id
        ),
        discrimination_index AS (
            -- Hitung D-index (top 27% vs bottom 27%) per exam
            SELECT 
                ua.question_id,
                ua.exam_id,
                AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) 
                    FILTER (WHERE percentile_rank >= 73) as p_upper,
                AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) 
                    FILTER (WHERE percentile_rank <= 27) as p_lower
            FROM user_answers ua
            INNER JOIN (
                SELECT 
                    user_id,
                    exam_id,
                    NTILE(100) OVER (PARTITION BY exam_id ORDER BY score) as percentile_rank
                FROM user_exam_scores
                WHERE exam_schedule_id = schedule_record.id
            ) ranked_users ON ua.user_id = ranked_users.user_id AND ua.exam_id = ranked_users.exam_id
            WHERE ua.exam_schedule_id = schedule_record.id
            GROUP BY ua.question_id, ua.exam_id
        ),
        param_c AS (
            -- Hitung parameter c (guessing) berdasarkan question_type
            SELECT 
                q.id as question_id,
                CASE 
                    WHEN q.question_type IN ('single-choice', 'multiple-choice') THEN
                        CASE 
                            WHEN array_length(q.options, 1) > 0 THEN 
                                1.0 / array_length(q.options, 1)
                            ELSE 0.25
                        END
                    WHEN q.question_type = 'true-false' THEN
                        CASE 
                            WHEN array_length(q.statements, 1) > 0 THEN
                                1.0 / POWER(2, array_length(q.statements, 1))
                            ELSE 0.5
                        END
                    WHEN q.question_type IN ('number', 'text') THEN 0
                    ELSE 0.25
                END as c_param
            FROM questions q
        ),
        item_parameters AS (
            -- Gabungkan semua parameter IRT (a, b, c) per soal
            SELECT 
                qd.exam_id,
                qd.question_id,
                
                -- Parameter a (discrimination)
                CASE 
                    WHEN COALESCE(ast.total_responses, 0) < 10 THEN 1.0
                    ELSE
                        GREATEST(0.5, LEAST(2.5,
                            COALESCE(
                                ((cws.mean_score_correct - cws.mean_score_wrong) / NULLIF(ss.stddev_score, 0)) 
                                * SQRT(cws.p_correct * (1 - cws.p_correct))
                                * 1.7,
                            0) * 0.6
                            +
                            COALESCE(
                                (di.p_upper - di.p_lower) * 2.5,
                            0) * 0.4
                        ))
                END as a_param,
                
                -- Parameter b (difficulty)
                CASE 
                    WHEN COALESCE(ast.total_responses, 0) = 0 THEN 0
                    ELSE
                        GREATEST(-3, LEAST(3,
                            -LN(
                                GREATEST(0.01, LEAST(0.99, cws.p_correct))
                                / 
                                (1 - GREATEST(0.01, LEAST(0.99, cws.p_correct)))
                            )
                        ))
                END as b_param,
                
                -- Parameter c (guessing)
                COALESCE(pc.c_param, 0.25) as c_param
                
            FROM question_data qd
            LEFT JOIN answer_stats ast ON qd.question_id = ast.question_id
            LEFT JOIN correct_wrong_scores cws ON qd.question_id = cws.question_id AND qd.exam_id = cws.exam_id
            LEFT JOIN discrimination_index di ON qd.question_id = di.question_id AND qd.exam_id = di.exam_id
            LEFT JOIN param_c pc ON qd.question_id = pc.question_id
            LEFT JOIN score_statistics ss ON qd.exam_id = ss.exam_id
        ),
        user_responses AS (
            -- Ambil semua jawaban user dengan parameter IRT soal
            SELECT 
                ua.user_id,
                ua.exam_id,
                ua.question_id,
                ua.is_correct,
                ip.a_param,
                ip.b_param,
                ip.c_param
            FROM user_answers ua
            INNER JOIN item_parameters ip ON ua.question_id = ip.question_id AND ua.exam_id = ip.exam_id
            WHERE ua.exam_schedule_id = schedule_record.id
        ),
        theta_estimation AS (
            -- Estimasi theta (ability) untuk setiap user per exam
            SELECT 
                user_id,
                exam_id,
                estimate_theta_simple(user_id, exam_id, schedule_record.id) as theta
            FROM (
                SELECT DISTINCT user_id, exam_id
                FROM user_responses
            ) unique_users
        ),
        weighted_scores AS (
            -- Konversi theta ke weighted score (0-1000)
            SELECT 
                te.user_id,
                te.exam_id,
                ROUND(((te.theta + 3) / 6) * 1000)::INTEGER as weighted_score
            FROM theta_estimation te
        ),
        update_result AS (
            -- Update user_exam_scores
            UPDATE user_exam_scores ues
            SET 
                weighted_score = ws.weighted_score,
                updated_at = NOW()
            FROM weighted_scores ws
            WHERE ues.user_id = ws.user_id
                AND ues.exam_id = ws.exam_id
                AND ues.exam_schedule_id = schedule_record.id
            RETURNING ues.user_id
        )
        SELECT COUNT(DISTINCT user_id) INTO users_affected
        FROM update_result;
        
        end_time := clock_timestamp();
        
        -- Return results for this schedule
        exam_schedule_id := schedule_record.id;
        users_updated := COALESCE(users_affected, 0);
        execution_time_ms := EXTRACT(MILLISECONDS FROM (end_time - start_time))::INTEGER;
        
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Add comment to function
COMMENT ON FUNCTION update_weighted_scores_irt_3pl() IS 
'Updates weighted scores using IRT 3PL model for all exam schedules where is_need_weighted_score = true and weighted_formula_id = 1';