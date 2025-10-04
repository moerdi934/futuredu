// controllers/dashboard.controller.ts
import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import { PoolClient } from 'pg';
import pool from '../lib/db';

// ========== TYPES ==========
export interface WeekData {
  name: string;
  nilai: number;
  target: number | null;
}

export interface SubjectPerformanceData {
  name: string;
  nilai: number;
  target: number;
}

export interface RecentResultData {
  id: number;
  title: string;
  score: number;
  date: string;
}

export interface TopicDataItem {
  topic: string;
  score: number;
  avg: number;
  total: number;
  completed: number;
}

export interface RadarData {
  subject: string;
  score: number;
}

export interface ProgressDetailData {
  nama: string;
  nilai: number;
  peningkatan: number;
}

export interface CompetitiveAnalysisData {
  name: string;
  score: number;
}

export interface UserCourseData {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  courseString: string;
  progressPercentage: number;
  materialsCompleted: number;
  totalMaterials: number;
  quizzesCompleted: number;
  totalQuizzes: number;
}

export interface UserClassData {
  id: number;
  name: string;
  description: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  courseName: string;
}

export interface UserTryOutData {
  id: number;
  examScheduleId: number;
  name: string;
  examType: string;
  isFree: boolean;
  grantedAt: string;
  hasCompleted: boolean;
  totalScore?: number;
  completionTime?: string;
}

export interface ExamDashboardData {
  examType: string;
  hasData: boolean;
  rank?: number;
  averageScore?: number;
  percentileRank?: number;
  totalParticipants?: number;
  subjectPerformance?: SubjectPerformanceData[];
  weeklyProgress?: WeekData[];
  recentResults?: RecentResultData[];
  radarData?: RadarData[];
  progressDetail?: ProgressDetailData[];
  topicData?: { [key: string]: TopicDataItem[] };
  competitiveAnalysis?: CompetitiveAnalysisData[];
}

export interface StudentDashboardResponse {
  examDashboards: ExamDashboardData[];
  courses: UserCourseData[];
  classes: UserClassData[];
  tryOuts: UserTryOutData[];
}

// ========== HELPERS ==========
function parseWeeklyProgress(row: any | null): WeekData[] {
  if (!row) return [];
  return [
    { name: "Minggu 1", nilai: row.week1, target: row.target1 || null },
    { name: "Minggu 2", nilai: row.week2, target: row.target2 || null },
    { name: "Minggu 3", nilai: row.week3, target: row.target3 || null },
    { name: "Minggu 4", nilai: row.week4, target: row.target4 || null },
    { name: "Minggu 5", nilai: row.week5, target: row.target5 || null }
  ];
}

// Helper to fetch courses with shared client
async function fetchUserCoursesWithClient(user_id: number, client: PoolClient): Promise<UserCourseData[]> {
  try {
    const { rows } = await client.query(
      `SELECT DISTINCT ON (c.id)
              c.id,
              c.title,
              c.description,
              c.imageurl,
              c.course_string,
              COALESCE(
                (SELECT COUNT(*)::float / NULLIF(COUNT(*), 0) * 100
                 FROM user_progress up
                 WHERE up.user_id = $1 AND up.course_id = c.id AND up.is_completed = true),
                0
              ) as overall_progress_percentage,
              COALESCE(
                (SELECT COUNT(*)
                 FROM user_progress up
                 JOIN course_materials cm ON cm.id = up.material_id
                 WHERE up.user_id = $1 AND cm.course_id = c.id AND up.is_completed = true),
                0
              ) as finished_materials,
              COALESCE(
                (SELECT COUNT(*)
                 FROM course_materials cm
                 WHERE cm.course_id = c.id),
                0
              ) as material,
              0 as finished_quiz_topics,
              0 as quiz
       FROM courses c
       WHERE EXISTS (
         SELECT 1 FROM user_progress up
         WHERE up.user_id = $1 AND up.course_id = c.id
       )
       ORDER BY c.id, c.title
       LIMIT 10`,
      [user_id]
    );
    
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      imageUrl: row.imageurl,
      courseString: row.course_string,
      progressPercentage: Number(row.overall_progress_percentage || 0),
      materialsCompleted: Number(row.finished_materials || 0),
      totalMaterials: Number(row.material || 0),
      quizzesCompleted: Number(row.finished_quiz_topics || 0),
      totalQuizzes: Number(row.quiz || 0)
    }));
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return [];
  }
}

async function fetchUserClassesWithClient(user_id: number, client: PoolClient): Promise<UserClassData[]> {
  try {
    const { rows } = await client.query(
      `SELECT lc.id, lc.name, lc.description, lc.teacher_name,
              lc.start_date, lc.end_date,
              COALESCE(c.title, 'No Course') as course_name
       FROM live_classes lc
       LEFT JOIN courses c ON c.id = lc.course_id
       WHERE $1 = ANY(lc.student_list_ids)
       ORDER BY lc.start_date DESC
       LIMIT 10`,
      [user_id]
    );
    
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      teacherName: row.teacher_name,
      startDate: new Date(row.start_date).toLocaleDateString('id-ID'),
      endDate: new Date(row.end_date).toLocaleDateString('id-ID'),
      courseName: row.course_name
    }));
  } catch (error) {
    console.error('Error fetching user classes:', error);
    return [];
  }
}

async function fetchUserTryOutsWithClient(user_id: number, client: PoolClient): Promise<UserTryOutData[]> {
  try {
    const { rows } = await client.query(
      `SELECT ue.id,
              ue.exam_schedule_id,
              es.name as exam_schedule_name,
              es.exam_type,
              es.isfree,
              ue.granted_at,
              COALESCE(
                (SELECT BOOL_OR(is_final)
                 FROM user_exam_scores ues
                 WHERE ues.user_id = $1 AND ues.exam_schedule_id = ue.exam_schedule_id),
                false
              ) as has_completed,
              (SELECT MAX(total_score)
               FROM user_exam_scores ues
               WHERE ues.user_id = $1 AND ues.exam_schedule_id = ue.exam_schedule_id
              ) as total_score,
              (SELECT MAX(completion_time)
               FROM user_exam_scores ues
               WHERE ues.user_id = $1 AND ues.exam_schedule_id = ue.exam_schedule_id
              ) as completion_time
       FROM user_entitlements ue
       JOIN exam_schedule es ON es.id = ue.exam_schedule_id
       WHERE ue.user_id = $1
       ORDER BY ue.granted_at DESC
       LIMIT 10`,
      [user_id]
    );
    
    return rows.map((row: any) => ({
      id: row.id,
      examScheduleId: row.exam_schedule_id,
      name: row.exam_schedule_name,
      examType: row.exam_type,
      isFree: row.isfree,
      grantedAt: new Date(row.granted_at).toLocaleDateString('id-ID'),
      hasCompleted: row.has_completed,
      totalScore: row.total_score ? Number(row.total_score) : undefined,
      completionTime: row.completion_time ? new Date(row.completion_time).toLocaleDateString('id-ID') : undefined
    }));
  } catch (error) {
    console.error('Error fetching user try-outs:', error);
    return [];
  }
}

// ========== CONTROLLER ==========
export async function getStudentDashboard(
  req: AuthenticatedRequest, 
  res: NextApiResponse<StudentDashboardResponse | { error: string }>
) {
  const user_id = parseInt(req.user!.id);

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  let client: PoolClient | undefined;

  try {
    console.log('Dashboard request for user:', user_id);
    console.log('Pool status before - Total:', pool.totalCount, 'Idle:', pool.idleCount, 'Waiting:', pool.waitingCount);

    // ⭐ Ambil SATU connection dengan timeout handling
    try {
      client = await pool.connect();
      console.log('✅ Client connected successfully');
    } catch (connectError) {
      console.error('❌ Failed to connect to database:', connectError);
      return res.status(503).json({ 
        error: 'Database connection failed. Please try again later.' 
      });
    }

    // Check which exam types have data
    const { rows: examTypes } = await client.query(
      `SELECT DISTINCT tipe
       FROM mars.reportexam_subjectperformance
       WHERE user_id = $1`,
      [user_id]
    );
    
    const availableExams: { [key: string]: boolean } = {
      SNBT: false,
      SIMAK: false,
      Quiz: false,
      CPNS: false
    };
    
    examTypes.forEach((row: { tipe: string }) => {
      if (row.tipe in availableExams) {
        availableExams[row.tipe as keyof typeof availableExams] = true;
      }
    });
    
    // Build exam dashboards for available types
    const examDashboards: ExamDashboardData[] = [];
    
    for (const [examType, hasData] of Object.entries(availableExams)) {
      if (hasData) {
        console.log('Processing exam type:', examType);
        
        // ⭐ Semua query parallel menggunakan CLIENT yang SAMA
        const [
          subjectPerformance,
          weeklyProgress,
          recentResults,
          progressDetail,
          topicDataRaw,
          globalData,
          competitiveAnalysis
        ] = await Promise.all([
          client.query(
            `SELECT DISTINCT ON (mapel) mapel, nilai, postdate
             FROM mars.reportexam_subjectperformance
             WHERE user_id = $1 AND tipe = $2
             ORDER BY mapel, postdate DESC`,
            [user_id, examType]
          ),
          client.query(
            `SELECT week1, week2, week3, week4, week5, postdate
             FROM mars.reportexam_weeklyprogressdata
             WHERE user_id = $1 AND tipe = $2
             ORDER BY postdate DESC LIMIT 1`,
            [user_id, examType]
          ),
          client.query(
            `SELECT exam_schedule_name, score, completion_time
             FROM mars.reportexam_recentexamresult
             WHERE user_id = $1 AND tipe = $2
             ORDER BY completion_time DESC
             LIMIT 5`,
            [user_id, examType]
          ),
          client.query(
            `SELECT mapel as nama, avg_all_time as nilai, difference as peningkatan
             FROM mars.reportexam_progressdetail
             WHERE user_id = $1 AND tipe = $2
             ORDER BY postdate DESC`,
            [user_id, examType]
          ),
          client.query(
            `SELECT mapel, topic, accuracy_percentage as score, avg_accuracy as avg, 
                    jumlah_soal as total, completed
             FROM mars.reportexam_topicdata
             WHERE user_id = $1 AND exam_type = $2
             ORDER BY postdate DESC`,
            [user_id, examType]
          ),
          client.query(
            `SELECT rank_now, rank_previous, avg_score_now, avg_score_previous,
                    total_score, total_participants, percentile
             FROM mars.reportexam_userglobaldata
             WHERE user_id = $1 AND exam_type = $2
             ORDER BY postdate DESC
             LIMIT 1`,
            [user_id, examType]
          ),
          client.query(
            `SELECT type_rank, avg_score, top_5_percent, top_10_percent, top_25_percent, average_score, postdate
             FROM mars.reportexam_competitiveanalysis
             WHERE user_id = $1 AND exam_type = $2
             ORDER BY postdate DESC
             LIMIT 1`,
            [user_id, examType]
          )
        ]);

        // Map subject performance
        const subjectPerformanceData: SubjectPerformanceData[] = subjectPerformance.rows.map(s => ({
          name: s.mapel,
          nilai: Number(s.nilai),
          target: 85
        }));

        // Map weekly progress
        const weeklyProgressData = parseWeeklyProgress(weeklyProgress.rows[0] || null);

        // Map recent results
        const recentResultsData: RecentResultData[] = recentResults.rows.map((r, i) => ({
          id: i + 1,
          title: r.exam_schedule_name,
          score: Number(r.score),
          date: new Date(r.completion_time).toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }),
        }));

        // Group topic data by mapel
        const topicData: { [key: string]: TopicDataItem[] } = {};
        for (const t of topicDataRaw.rows) {
          if (!topicData[t.mapel]) topicData[t.mapel] = [];
          topicData[t.mapel].push({
            topic: t.topic,
            score: Number(t.score),
            avg: Number(t.avg),
            total: Number(t.total),
            completed: Number(t.completed),
          });
        }

        // Radar data
        const radarData: RadarData[] = subjectPerformance.rows.map(s => ({
          subject: s.mapel,
          score: Number(s.nilai),
        }));

        // Progress detail
        const progressDetailData: ProgressDetailData[] = progressDetail.rows.map(d => ({
          nama: d.nama,
          nilai: Number(d.nilai),
          peningkatan: Number(d.peningkatan),
        }));

        // Competitive analysis
        const competitiveAnalysisData: CompetitiveAnalysisData[] = competitiveAnalysis.rows[0] ? [
          { name: "Top 5%", score: Number(competitiveAnalysis.rows[0].top_5_percent) },
          { name: "Top 10%", score: Number(competitiveAnalysis.rows[0].top_10_percent) },
          { name: "Top 25%", score: Number(competitiveAnalysis.rows[0].top_25_percent) },
          { name: "Kamu", score: Number(competitiveAnalysis.rows[0].avg_score) },
          { name: "Rata-rata", score: Number(competitiveAnalysis.rows[0].average_score) },
        ] : [];

        examDashboards.push({
          examType,
          hasData: true,
          rank: globalData.rows[0]?.rank_now || undefined,
          averageScore: globalData.rows[0]?.avg_score_now || undefined,
          percentileRank: globalData.rows[0]?.percentile || undefined,
          totalParticipants: globalData.rows[0]?.total_participants || undefined,
          subjectPerformance: subjectPerformanceData,
          weeklyProgress: weeklyProgressData,
          recentResults: recentResultsData,
          radarData,
          progressDetail: progressDetailData,
          topicData,
          competitiveAnalysis: competitiveAnalysisData
        });
      }
    }

    // Get user courses, classes, and try-outs (gunakan client yang sama)
    const [courses, classes, tryOuts] = await Promise.all([
      fetchUserCoursesWithClient(user_id, client),
      fetchUserClassesWithClient(user_id, client),
      fetchUserTryOutsWithClient(user_id, client)
    ]);

    const response: StudentDashboardResponse = {
      examDashboards,
      courses: courses,
      classes: classes,
      tryOuts: tryOuts
    };

    console.log('Dashboard response prepared successfully');
    res.json(response);
    
  } catch (error: any) {
    console.error('Error in getStudentDashboard:', error);
    
    // Handle specific error types
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Database connection refused' });
    }
    if (error.code === '53300') {
      return res.status(503).json({ error: 'Database too many connections' });
    }
    if (error.message?.includes('timeout')) {
      return res.status(504).json({ error: 'Database query timeout' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    // ⭐ PENTING: Release connection setelah selesai
    if (client) {
      client.release();
      console.log('✅ Client released');
      console.log('Pool status after - Total:', pool.totalCount, 'Idle:', pool.idleCount, 'Waiting:', pool.waitingCount);
    }
  }
}