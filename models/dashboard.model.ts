// models/dashboard.model.ts
import pool from '../lib/db';

// ========== TYPES ==========
export interface SubjectPerformance {
  mapel: string;
  nilai: number;
  postdate: Date;
}

export interface WeeklyProgress {
  week1: number;
  week2: number;
  week3: number;
  week4: number;
  week5: number;
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
}

export interface ProgressDetail {
  nama: string;
  nilai: number;
  peningkatan: number;
}

export interface TopicData {
  mapel: string;
  topic: string;
  score: number;
  avg: number;
  total: number;
  completed: number;
}

export interface CompetitiveAnalysis {
  type_rank: number;
  avg_score: number;
  top_5_percent: number;
  top_10_percent: number;
  top_25_percent: number;
  average_score: number;
  postdate: Date;
}

export interface UserGlobalData {
  rank_now: number;
  rank_previous: number;
  avg_score_now: number;
  avg_score_previous: number;
  total_score: number;
  total_participants: number;
  percentile: number;
}

export interface UserCourse {
  id: number;
  title: string;
  description: string;
  imageurl: string | null;
  course_string: string;
  overall_progress_percentage: number;
  finished_materials: number;
  material: number;
  finished_quiz_topics: number;
  quiz: number;
}

export interface UserClass {
  id: number;
  name: string;
  description: string;
  teacher_name: string;
  start_date: Date;
  end_date: Date;
  course_name: string;
}

export interface UserTryOut {
  id: number;
  exam_schedule_id: number;
  exam_schedule_name: string;
  exam_type: string;
  isfree: boolean;
  granted_at: Date;
  has_completed: boolean;
  total_score?: number;
  completion_time?: Date;
}

// ========== EXAM DASHBOARD QUERIES ==========
export async function getLatestSubjectPerformance(user_id: number, tipe: string): Promise<SubjectPerformance[]> {
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (mapel) mapel, nilai, postdate
      FROM mars.reportexam_subjectperformance
      WHERE user_id = $1 AND tipe = $2
      ORDER BY mapel, postdate DESC`,
    [user_id, tipe]
  );
  return rows;
}

export async function getLatestWeeklyProgress(user_id: number, tipe: string): Promise<WeeklyProgress | null> {
  const { rows } = await pool.query(
    `SELECT week1, week2, week3, week4, week5, postdate
      FROM mars.reportexam_weeklyprogressdata
      WHERE user_id = $1 AND tipe = $2
      ORDER BY postdate DESC LIMIT 1`,
    [user_id, tipe]
  );
  return rows[0] || null;
}

export async function getRecentExamResults(user_id: number, tipe: string): Promise<RecentExamResult[]> {
  const { rows } = await pool.query(
    `SELECT exam_schedule_name, score, completion_time
      FROM mars.reportexam_recentexamresult
      WHERE user_id = $1 AND tipe = $2
      ORDER BY completion_time DESC
      LIMIT 5`,
    [user_id, tipe]
  );
  return rows;
}

export async function getProgressDetail(user_id: number, tipe: string): Promise<ProgressDetail[]> {
  const { rows } = await pool.query(
    `SELECT mapel as nama, avg_all_time as nilai, difference as peningkatan
      FROM mars.reportexam_progressdetail
      WHERE user_id = $1 AND tipe = $2
      ORDER BY postdate DESC`,
    [user_id, tipe]
  );
  return rows;
}

export async function getTopicData(user_id: number, tipe: string): Promise<TopicData[]> {
  const { rows } = await pool.query(
    `SELECT mapel, topic, accuracy_percentage as score, avg_accuracy as avg, 
            jumlah_soal as total, completed
      FROM mars.reportexam_topicdata
      WHERE user_id = $1 AND exam_type = $2
      ORDER BY postdate DESC`,
    [user_id, tipe]
  );
  return rows;
}

export async function getUserGlobalData(user_id: number, tipe: string): Promise<UserGlobalData | null> {
  const { rows } = await pool.query(
    `SELECT rank_now, rank_previous, avg_score_now, avg_score_previous,
            total_score, total_participants, percentile
      FROM mars.reportexam_userglobaldata
      WHERE user_id = $1 AND exam_type = $2
      ORDER BY postdate DESC
      LIMIT 1`,
    [user_id, tipe]
  );
  return rows[0] || null;
}

export async function getCompetitiveAnalysis(user_id: number, tipe: string): Promise<CompetitiveAnalysis | null> {
  const { rows } = await pool.query(
    `SELECT type_rank, avg_score, top_5_percent, top_10_percent, top_25_percent, average_score, postdate
      FROM mars.reportexam_competitiveanalysis
      WHERE user_id = $1 AND exam_type = $2
      ORDER BY postdate DESC
      LIMIT 1`,
    [user_id, tipe]
  );
  return rows[0] || null;
}

// Note: getUserCourses, getUserClasses, getUserTryOuts are now handled 
// by API endpoints in the controller layer, not direct database queries

// ========== CHECK DATA AVAILABILITY ==========
export async function checkExamDataAvailability(user_id: number): Promise<{
  SNBT: boolean;
  SIMAK: boolean;
  Quiz: boolean;
  CPNS: boolean;
}> {
  const { rows } = await pool.query(
    `SELECT DISTINCT tipe
      FROM mars.reportexam_subjectperformance
      WHERE user_id = $1`,
    [user_id]
  );
  
  const available = {
    SNBT: false,
    SIMAK: false,
    Quiz: false,
    CPNS: false
  };
  
  rows.forEach((row: { tipe: string }) => {
    if (row.tipe in available) {
      available[row.tipe as keyof typeof available] = true;
    }
  });
  
  return available;
}