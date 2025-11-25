CREATE OR REPLACE FUNCTION estimate_theta_simple(
    p_user_id INTEGER,
    p_exam_id INTEGER,
    p_exam_schedule_id INTEGER
)
RETURNS NUMERIC AS $$
DECLARE
    v_theta NUMERIC := 0;  -- Initial guess (ability = 0)
    v_iteration INTEGER;
    v_max_iterations INTEGER := 10;
    v_tolerance NUMERIC := 0.01;
    v_delta NUMERIC;
    v_first_derivative NUMERIC;
    v_second_derivative NUMERIC;
    rec RECORD;
    v_a NUMERIC;
    v_b NUMERIC;
    v_c NUMERIC;
    v_u NUMERIC;
    v_exp_term NUMERIC;
    v_p NUMERIC;
    v_q NUMERIC;
    v_p_star NUMERIC;
    v_q_star NUMERIC;
BEGIN
    -- Newton-Raphson iteration
    FOR v_iteration IN 1..v_max_iterations LOOP
        v_first_derivative := 0;
        v_second_derivative := 0;
        
        -- Loop through all user answers and calculate derivatives
        FOR rec IN
            WITH answer_stats AS (
                SELECT 
                    ua.question_id,
                    COUNT(*) FILTER (WHERE ua.is_correct = true)::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC as p_correct,
                    COUNT(*) as total_responses
                FROM user_answers ua
                WHERE ua.exam_schedule_id = p_exam_schedule_id
                    AND ua.exam_id = p_exam_id
                GROUP BY ua.question_id
            ),
            user_scores AS (
                SELECT 
                    ues.user_id,
                    ues.score as ctt_score
                FROM user_exam_scores ues
                WHERE ues.exam_schedule_id = p_exam_schedule_id
                    AND ues.exam_id = p_exam_id
            ),
            score_stats AS (
                SELECT 
                    AVG(score) as mean_score,
                    STDDEV_POP(score) as stddev_score
                FROM user_exam_scores
                WHERE exam_schedule_id = p_exam_schedule_id
                    AND exam_id = p_exam_id
            ),
            correct_wrong_scores AS (
                SELECT 
                    ua.question_id,
                    AVG(us.ctt_score) FILTER (WHERE ua.is_correct = true) as mean_correct,
                    AVG(us.ctt_score) FILTER (WHERE ua.is_correct = false) as mean_wrong,
                    COUNT(*) FILTER (WHERE ua.is_correct = true)::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC as p_correct
                FROM user_answers ua
                INNER JOIN user_scores us ON ua.user_id = us.user_id
                WHERE ua.exam_schedule_id = p_exam_schedule_id
                    AND ua.exam_id = p_exam_id
                GROUP BY ua.question_id
            ),
            discrimination_index AS (
                SELECT 
                    ua.question_id,
                    AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) 
                        FILTER (WHERE percentile_rank >= 73) as p_upper,
                    AVG(CASE WHEN ua.is_correct THEN 1.0 ELSE 0.0 END) 
                        FILTER (WHERE percentile_rank <= 27) as p_lower
                FROM user_answers ua
                INNER JOIN (
                    SELECT 
                        user_id,
                        NTILE(100) OVER (ORDER BY score) as percentile_rank
                    FROM user_exam_scores
                    WHERE exam_schedule_id = p_exam_schedule_id
                        AND exam_id = p_exam_id
                ) ranked_users ON ua.user_id = ranked_users.user_id
                WHERE ua.exam_schedule_id = p_exam_schedule_id
                    AND ua.exam_id = p_exam_id
                GROUP BY ua.question_id
            )
            SELECT 
                ua.question_id,
                ua.is_correct,
                -- Parameter a (discrimination)
                CASE 
                    WHEN COALESCE(ast.total_responses, 0) < 10 THEN 1.0
                    ELSE GREATEST(0.5, LEAST(2.5,
                        COALESCE(
                            ((cws.mean_correct - cws.mean_wrong) / NULLIF(ss.stddev_score, 0)) 
                            * SQRT(cws.p_correct * (1 - cws.p_correct))
                            * 1.7,
                        0) * 0.6
                        +
                        COALESCE((di.p_upper - di.p_lower) * 2.5, 0) * 0.4
                    ))
                END as a_param,
                -- Parameter b (difficulty)
                CASE 
                    WHEN COALESCE(ast.total_responses, 0) = 0 THEN 0
                    ELSE GREATEST(-3, LEAST(3,
                        -LN(GREATEST(0.01, LEAST(0.99, ast.p_correct))
                            / (1 - GREATEST(0.01, LEAST(0.99, ast.p_correct))))
                    ))
                END as b_param,
                -- Parameter c (guessing)
                CASE 
                    WHEN q.question_type IN ('single-choice', 'multiple-choice') THEN
                        CASE 
                            WHEN array_length(q.options, 1) > 0 THEN 1.0 / array_length(q.options, 1)
                            ELSE 0.25
                        END
                    WHEN q.question_type = 'true-false' THEN
                        CASE 
                            WHEN array_length(q.statements, 1) > 0 THEN 1.0 / POWER(2, array_length(q.statements, 1))
                            ELSE 0.5
                        END
                    WHEN q.question_type IN ('number', 'text') THEN 0
                    ELSE 0.25
                END as c_param
            FROM user_answers ua
            LEFT JOIN answer_stats ast ON ua.question_id = ast.question_id
            LEFT JOIN correct_wrong_scores cws ON ua.question_id = cws.question_id
            LEFT JOIN discrimination_index di ON ua.question_id = di.question_id
            LEFT JOIN questions q ON ua.question_id = q.id
            CROSS JOIN score_stats ss
            WHERE ua.user_id = p_user_id
                AND ua.exam_id = p_exam_id
                AND ua.exam_schedule_id = p_exam_schedule_id
        LOOP
            -- Extract parameters from record
            v_a := rec.a_param;
            v_b := rec.b_param;
            v_c := rec.c_param;
            v_u := CASE WHEN rec.is_correct THEN 1.0 ELSE 0.0 END;
            
            -- Hitung P(theta) = c + (1-c)/(1 + e^(-a(theta-b)))
            v_exp_term := EXP(-v_a * (v_theta - v_b));
            v_p := v_c + ((1 - v_c) / (1 + v_exp_term));
            v_q := 1 - v_p;
            
            -- Avoid division by zero in P*
            IF ABS(1 - v_c) < 0.00001 THEN
                v_p_star := 0.5;
            ELSE
                v_p_star := (v_p - v_c) / (1 - v_c);
            END IF;
            v_q_star := 1 - v_p_star;
            
            -- Avoid division by zero in derivatives
            IF ABS(v_p * v_q) > 0.00001 THEN
                -- First derivative: Σ a * (u - P) * P* * (1-P*) / (P * (1-P))
                v_first_derivative := v_first_derivative + 
                    (v_a * (v_u - v_p) * v_p_star * v_q_star) / (v_p * v_q);
                
                -- Second derivative: Σ -a² * P* * (1-P*) * (P* - P*²) / (P² * (1-P)²)
                v_second_derivative := v_second_derivative - 
                    (v_a * v_a * v_p_star * v_q_star * (v_p_star - v_p_star * v_p_star)) / 
                    (v_p * v_p * v_q * v_q);
            END IF;
        END LOOP;
        
        -- Avoid division by zero
        IF ABS(v_second_derivative) < 0.00001 THEN
            EXIT;
        END IF;
        
        -- Newton-Raphson update: theta_new = theta_old - f'(theta) / f''(theta)
        v_delta := v_first_derivative / v_second_derivative;
        v_theta := v_theta - v_delta;
        
        -- Clamp theta to reasonable range [-3, 3]
        v_theta := GREATEST(-3, LEAST(3, v_theta));
        
        -- Check convergence
        IF ABS(v_delta) < v_tolerance THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN v_theta;
END;
$$ LANGUAGE plpgsql;