// ========== models/dashboard.model.ts ==========

import pool from '../lib/db';

// ========== TYPES ==========
export interface SubjectPerformance {
  mapel: string;
  nilai: number;
  max_score: number;
  metrics: string;
  postdate: Date;
}

export interface WeeklyProgress {
  week1: number;
  week2: number;
  week3: number;
  week4: number;
  week5: number;
  max_score: number;
  metrics: string;
  target1?: number;
  target2?: number;
  target3?: number;
  target4?: number;
  target5?: number;
  postdate: Date;
}

export interface RecentExamResult {
  exam_schedule_name: string;
  score: number;
  completion_time: Date;
  number_of_exams: number;
  average_score: number;
  min_score: number;
  min_exam_name: string;
  max_score: number;
  max_exam_name: string;
  max_score_limit: number;
  metrics: string;
}

export interface ProgressDetail {
  nama: string;
  nilai: number;
  peningkatan: number;
  max_score: number;
  metrics: string;
}

export interface TopicData {
  mapel: string;
  topic: string;
  score: number;
  avg: number;
  total: number;
  completed: number;
  max_score: number;
  metrics: string;
}

export interface CompetitiveAnalysis {
  type_rank: number;
  avg_score: number;
  top_5_percent: number;
  top_10_percent: number;
  top_25_percent: number;
  average_score: number;
  max_score: number;
  metrics: string;
  postdate: Date;
}

export interface UserGlobalData {
  rank_now: number;
  rank_previous: number | null;
  avg_score_now: number;
  avg_score_previous: number | null;
  total_score: number;
  total_participants: number;
  percentile: number;
  max_score: number;
  metrics: string;
}

// ========== HELPER FUNCTIONS ==========

export function formatToTwoDecimals(value: number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return parseFloat(Number(value).toFixed(2));
}

// ========== EXAM DASHBOARD QUERIES ==========

export async function getLatestSubjectPerformance(user_id: number, tipe: string): Promise<SubjectPerformance[]> {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (mapel) 
              mapel, 
              nilai, 
              max_score, 
              metrics, 
              postdate
       FROM mv_reportexam_subjectperformance
       WHERE user_id = $1 AND tipe = $2
       ORDER BY mapel, postdate DESC`,
      [user_id, tipe]
    );
    return rows;
  } catch (error) {
    console.error(`Error fetching subject performance for ${tipe}:`, error);
    return [];
  }
}

export async function getLatestWeeklyProgress(user_id: number, tipe: string): Promise<WeeklyProgress | null> {
  try {
    const { rows } = await pool.query(
      `SELECT week1, 
              week2, 
              week3, 
              week4, 
              week5, 
              max_score, 
              metrics, 
              postdate
       FROM mv_reportexam_weeklyprogressdata
       WHERE user_id = $1 AND tipe = $2
       ORDER BY postdate DESC 
       LIMIT 1`,
      [user_id, tipe]
    );
    return rows[0] || null;
  } catch (error) {
    console.error(`Error fetching weekly progress for ${tipe}:`, error);
    return null;
  }
}

export async function getRecentExamResults(user_id: number, tipe: string): Promise<RecentExamResult[]> {
  try {
    const { rows } = await pool.query(
        `SELECT 
                exam_schedule_name, 
                coalesce(score,0) score, 
                completion_time,
                number_of_exams,
                coalesce(average_score,0) average_score,
                coalesce(min_score,0) min_score,
                coalesce(min_exam_name,'') min_exam_name,
                coalesce(max_score,0) max_score,
                coalesce(max_exam_name,'') max_exam_name,
                max_score_limit,
                metrics
        FROM mv_reportexam_recentexamresult
        WHERE user_id = $1 
          AND tipe = $2
        ORDER BY completion_time DESC
        LIMIT 5`,
      [user_id, tipe]
    );
    
    console.log(`Recent exam results for user ${user_id}, type ${tipe}:`, rows.length, 'records');
    
    return rows;
  } catch (error) {
    console.error(`Error fetching recent exam results for ${tipe}:`, error);
    return [];
  }
}

export async function getProgressDetail(user_id: number, tipe: string): Promise<ProgressDetail[]> {
  try {
    const { rows } = await pool.query(
      `SELECT mapel as nama, 
              avg_all_time as nilai, 
              difference as peningkatan, 
              max_score, 
              metrics
       FROM mv_reportexam_progressdetail
       WHERE user_id = $1 AND tipe = $2
       ORDER BY postdate DESC`,
      [user_id, tipe]
    );
    return rows;
  } catch (error) {
    console.error(`Error fetching progress detail for ${tipe}:`, error);
    return [];
  }
}

export async function getTopicData(user_id: number, tipe: string): Promise<TopicData[]> {
  try {
    const { rows } = await pool.query(
      `SELECT mapel, 
              topic, 
              accuracy_percentage as score, 
              avg_accuracy as avg, 
              jumlah_soal as total, 
              completed, 
              max_score, 
              metrics
       FROM mv_reportexam_topicdata
       WHERE user_id = $1 AND exam_type = $2
       ORDER BY postdate DESC`,
      [user_id, tipe]
    );
    return rows;
  } catch (error) {
    console.error(`Error fetching topic data for ${tipe}:`, error);
    return [];
  }
}

export async function getUserGlobalData(user_id: number, tipe: string): Promise<UserGlobalData | null> {
  try {
    const { rows } = await pool.query(
      `SELECT rank_now, 
              rank_previous, 
              avg_score_now, 
              avg_score_previous,
              total_score, 
              total_participants, 
              percentile, 
              max_score, 
              metrics
       FROM mv_reportexam_userglobaldata
       WHERE user_id = $1 AND exam_type = $2
       ORDER BY postdate DESC
       LIMIT 1`,
      [user_id, tipe]
    );
    return rows[0] || null;
  } catch (error) {
    console.error(`Error fetching user global data for ${tipe}:`, error);
    return null;
  }
}

export async function getCompetitiveAnalysis(user_id: number, tipe: string): Promise<CompetitiveAnalysis | null> {
  try {
    const { rows } = await pool.query(
      `SELECT type_rank, 
              avg_score, 
              top_5_percent, 
              top_10_percent, 
              top_25_percent, 
              average_score, 
              max_score, 
              metrics, 
              postdate
       FROM mv_reportexam_competitiveanalysis
       WHERE user_id = $1 AND exam_type = $2
       ORDER BY postdate DESC
       LIMIT 1`,
      [user_id, tipe]
    );
    return rows[0] || null;
  } catch (error) {
    console.error(`Error fetching competitive analysis for ${tipe}:`, error);
    return null;
  }
}

export async function checkExamDataAvailability(user_id: number): Promise<Record<string, boolean>> {
  try {
    const { rows: examTypes } = await pool.query(
      `SELECT DISTINCT description
       FROM product_type
       WHERE group_product LIKE 'TO%'
       ORDER BY description`
    );
    
    if (examTypes.length === 0) {
      console.warn('No exam types found in product_type with group_product LIKE TO%');
      return {};
    }
    
    const available: Record<string, boolean> = {};
    examTypes.forEach((row: { description: string }) => {
      available[row.description] = false;
    });
    
    const examTypeDescriptions = examTypes.map((r: { description: string }) => r.description);
    
    const { rows: userExamData } = await pool.query(
      `SELECT DISTINCT tipe
       FROM mv_reportexam_subjectperformance
       WHERE user_id = $1 AND tipe = ANY($2::text[])`,
      [user_id, examTypeDescriptions]
    );
    
    userExamData.forEach((row: { tipe: string }) => {
      if (row.tipe in available) {
        available[row.tipe] = true;
      }
    });
    
    console.log(`Exam data availability for user ${user_id}:`, available);
    return available;
  } catch (error) {
    console.error('Error checking exam data availability:', error);
    return {};
  }
}

export async function getAvailableExamTypes(): Promise<string[]> {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT description
       FROM product_type
       WHERE group_product LIKE 'TO%'
       ORDER BY description`
    );
    
    return rows.map((row: { description: string }) => row.description);
  } catch (error) {
    console.error('Error fetching available exam types:', error);
    return [];
  }
}

export async function getReportExamLastRefreshTime(): Promise<Date | null> {
  try {
    const { rows } = await pool.query(
      `SELECT postdate as last_refreshed 
       FROM mv_reportexam_subjectperformance
       ORDER BY postdate DESC
       LIMIT 1`
    );
    
    if (rows.length > 0 && rows[0].last_refreshed) {
      return new Date(rows[0].last_refreshed);
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get last refresh time:', error);
    return null;
  }
}

export async function getUserCompletedExamTypes(user_id: number): Promise<string[]> {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT tipe
       FROM mv_reportexam_subjectperformance
       WHERE user_id = $1
       ORDER BY tipe`,
      [user_id]
    );
    
    return rows.map((row: { tipe: string }) => row.tipe);
  } catch (error) {
    console.error('Error fetching user completed exam types:', error);
    return [];
  }
}

export async function hasExamTypeData(user_id: number, examType: string): Promise<boolean> {
  try {
    const { rows } = await pool.query(
      `SELECT EXISTS(
         SELECT 1 
         FROM mv_reportexam_subjectperformance
         WHERE user_id = $1 AND tipe = $2
       ) as has_data`,
      [user_id, examType]
    );
    
    return rows[0]?.has_data || false;
  } catch (error) {
    console.error(`Error checking if user has ${examType} data:`, error);
    return false;
  }
}

export async function getExamTypeScoring(examType: string): Promise<{ max_score: number; metrics: string } | null> {
  try {
    const { rows } = await pool.query(
      `SELECT esc.max_score, esc.metrics
       FROM exam_schedule_scoring esc
       JOIN product_type pt ON pt.id = esc.type
       WHERE pt.description = $1
       LIMIT 1`,
      [examType]
    );
    
    return rows[0] || null;
  } catch (error) {
    console.error(`Error fetching scoring config for ${examType}:`, error);
    return null;
  }
}