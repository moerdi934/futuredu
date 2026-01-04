import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import pool from '../lib/db';
import {
  getLatestSubjectPerformance,
  getLatestWeeklyProgress,
  getRecentExamResults,
  getProgressDetail,
  getTopicData,
  getUserGlobalData,
  getCompetitiveAnalysis,
  getCompetitiveAnalysisWithHistory,
  getRecommendedPrograms,
  checkExamDataAvailability,
  formatToTwoDecimals,
  getPassingProbabilityWithDetails
} from '../models/dashboard.model';
import type { 
  RecommendedProgram as RecommendedProgramModel,
  PassingProbabilityDetail
} from '../models/dashboard.model';

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
  maxScore: number;
  metrics: string;
}

export interface RecentResultData {
  id: number;
  title: string;
  score: number;
  maxScore: number;
  metrics: string;
  date: string;
  numberOfExams: number;
  averageScore: number;
  minScore: number;
  minExamName: string;
  maxExamScore: number;
  maxExamName: string;
}

export interface TopicDataItem {
  topic: string;
  score: number;
  avg: number;
  total: number;
  completed: number;
  maxScore: number;
  metrics: string;
}

export interface RadarData {
  subject: string;
  score: number;
  maxScore: number;
}

export interface ProgressDetailData {
  nama: string;
  nilai: number;
  peningkatan: number;
  maxScore: number;
  metrics: string;
}

export interface CompetitiveAnalysisData {
  name: string;
  score: number;
}

export interface TargetProdiAnalysis {
  prodi_id: number;
  nama_prodi: string;
  nama_ptn: string;
  user_score: number;
  user_rank: number;
  total_bimbel_participants: number;
  peminat: number | null;
  daya_tampung: number | null;
  safe_zone_rank: number | null;
  min_score_reference: number | null;
  max_score_reference: number | null;
  average_score_reference: number | null;
  has_historical_data: boolean;
  status: 'Aman' | 'Perlu Ditingkatkan' | 'Tidak Aman' | 'No Historical Data';
  score_gap_to_minimum: number | null;
  score_gap_to_average: number | null;
  competition_ratio: number | null;
  status_message: string;
}

export interface LearningInsight {
  insight: string;
  type: 'positive' | 'negative';
}

export interface Achievement {
  title: string;
  description: string;
  completed: boolean;
  progress: number;
}

export interface RecommendedResource {
  type: 'video' | 'quiz' | 'reading';
  subject: string;
  topic: string;
  title: string;
  duration?: string;
  questions?: number;
  pages?: number;
}

export interface RecommendedProgram {
  program: string;
  university: string;
  match: number;
  minScore: number;
  maxScore: number | null;
  averageScore: number | null;
  requirement: string;
  scoreGap: number;
  competitionRatio: number | null;
  akreditasi: string;
  jenjang: string;
  targetChoice: number | null;
  targetProdi: string | null;
  targetUniversity: string | null;
  recommendationType: 'similarity' | 'same_university';
}

export interface NextGoal {
  name: string;
  score: number;
  currentScore: number;
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
  maxScore?: number;
  metrics?: string;
  rank?: number;
  previousRank?: number | null;
  averageScore?: number;
  previousAverageScore?: number | null;
  totalCompleted?: number;
  studyTime?: string;
  percentileRank?: number;
  totalParticipants?: number;
  probabilitasKelulusan?: number | null;
  probabilitasKelulusanDetails?: PassingProbabilityDetail[];
  subjectPerformance?: SubjectPerformanceData[];
  weeklyProgress?: WeekData[];
  recentResults?: RecentResultData[];
  radarData?: RadarData[];
  progressDetail?: ProgressDetailData[];
  topicData?: { [key: string]: TopicDataItem[] };
  competitiveAnalysis?: CompetitiveAnalysisData[];
  targetProdiAnalysis?: TargetProdiAnalysis[];
  nextGoal?: NextGoal;
  learningInsights?: LearningInsight[];
  achievements?: Achievement[];
  recommendedResources?: RecommendedResource[];
  recommendedPrograms?: RecommendedProgram[];
}

export interface StudentDashboardResponse {
  examDashboards: ExamDashboardData[];
  courses: UserCourseData[];
  classes: UserClassData[];
  tryOuts: UserTryOutData[];
}

// ========== SAMPLE DATA GENERATORS ==========

/**
 * Generate sample learning insights based on actual data
 */
function generateSampleInsights(
  examType: string,
  subjectPerformance: SubjectPerformanceData[],
  topicData: { [key: string]: TopicDataItem[] },
  rank?: number,
  totalParticipants?: number
): LearningInsight[] {
  const insights: LearningInsight[] = [];

  // Insight 1: Best performing subject
  if (subjectPerformance.length > 0) {
    const bestSubject = subjectPerformance.reduce((prev, current) => 
      (prev.nilai > current.nilai) ? prev : current
    );
    
    if (bestSubject.nilai > bestSubject.target) {
      const diff = Math.round(((bestSubject.nilai - bestSubject.target) / bestSubject.target) * 100);
      insights.push({
        insight: `Kamu ${diff}% lebih baik dalam ${bestSubject.name} dibanding target`,
        type: 'positive'
      });
    }
  }

  // Insight 2: Topic that needs improvement
  const allTopics: TopicDataItem[] = [];
  Object.values(topicData).forEach(topics => allTopics.push(...topics));
  
  if (allTopics.length > 0) {
    const weakTopic = allTopics.reduce((prev, current) => 
      (prev.score < current.score) ? prev : current
    );
    
    if (weakTopic.score < weakTopic.avg) {
      const diff = Math.round(((weakTopic.avg - weakTopic.score) / weakTopic.avg) * 100);
      insights.push({
        insight: `Akurasi menjawab soal ${weakTopic.topic} ${diff}% lebih rendah dari rata-rata`,
        type: 'negative'
      });
    }
  }

  // Insight 3: Overall ranking performance
  if (rank && totalParticipants) {
    const percentile = Math.round((1 - (rank / totalParticipants)) * 100);
    insights.push({
      insight: `Performamu di atas ${percentile}% peserta lain dalam try out`,
      type: 'positive'
    });
  }

  return insights;
}

/**
 * Generate sample achievements based on actual performance
 */
function generateSampleAchievements(
  examType: string,
  subjectPerformance: SubjectPerformanceData[],
  totalCompleted: number,
  averageScore: number
): Achievement[] {
  const achievements: Achievement[] = [];

  // Achievement 1: High score in a subject
  const highScoreSubject = subjectPerformance.find(s => s.nilai >= 90);
  if (highScoreSubject) {
    achievements.push({
      title: `${highScoreSubject.name} Master`,
      description: `Mencapai nilai 90+ di 5 tes ${highScoreSubject.name}`,
      completed: true,
      progress: 100
    });
  } else if (subjectPerformance.length > 0) {
    const bestSubject = subjectPerformance.reduce((prev, curr) => 
      prev.nilai > curr.nilai ? prev : curr
    );
    achievements.push({
      title: `${bestSubject.name} Expert`,
      description: `Mencapai nilai 90+ di 5 tes ${bestSubject.name}`,
      completed: false,
      progress: Math.min(Math.round((bestSubject.nilai / 90) * 100), 95)
    });
  }

  // Achievement 2: Consistency
  if (totalCompleted >= 10) {
    achievements.push({
      title: 'Konsisten Belajar',
      description: 'Belajar selama 10 hari berturut-turut',
      completed: true,
      progress: 100
    });
  } else {
    achievements.push({
      title: 'Konsisten Belajar',
      description: 'Belajar selama 10 hari berturut-turut',
      completed: false,
      progress: totalCompleted * 10
    });
  }

  // Achievement 3: Exam completion
  if (totalCompleted >= 20) {
    achievements.push({
      title: 'Problem Solver',
      description: 'Menyelesaikan 100 soal penalaran',
      completed: false,
      progress: Math.min(totalCompleted * 5, 95)
    });
  }

  // Achievement 4: Average score
  if (averageScore >= 85) {
    achievements.push({
      title: `${examType} Ready`,
      description: 'Nilai rata-rata keseluruhan > 80',
      completed: true,
      progress: 100
    });
  } else if (averageScore > 0) {
    achievements.push({
      title: `${examType} Ready`,
      description: 'Nilai rata-rata keseluruhan > 80',
      completed: false,
      progress: Math.min(Math.round((averageScore / 85) * 100), 95)
    });
  }

  return achievements;
}

/**
 * Generate recommended resources based on weak topics
 */
function generateRecommendedResources(
  topicData: { [key: string]: TopicDataItem[] }
): RecommendedResource[] {
  const resources: RecommendedResource[] = [];
  const allTopics: Array<TopicDataItem & { subject: string }> = [];
  
  // Collect all topics with their subjects
  Object.entries(topicData).forEach(([subject, topics]) => {
    topics.forEach(topic => {
      allTopics.push({ ...topic, subject });
    });
  });

  // Sort by lowest score compared to average
  const weakTopics = allTopics
    .filter(t => t.score < t.avg)
    .sort((a, b) => (a.score - a.avg) - (b.score - b.avg))
    .slice(0, 3);

  weakTopics.forEach((topic, index) => {
    if (index === 0) {
      resources.push({
        type: 'video',
        subject: topic.subject,
        topic: topic.topic,
        title: `Konsep Dasar ${topic.topic}`,
        duration: '15 menit'
      });
    } else if (index === 1) {
      resources.push({
        type: 'quiz',
        subject: topic.subject,
        topic: topic.topic,
        title: `Latihan Soal ${topic.topic} Tingkat Lanjut`,
        questions: 20
      });
    } else {
      resources.push({
        type: 'reading',
        subject: topic.subject,
        topic: topic.topic,
        title: `Teknik Menguasai ${topic.topic}`,
        pages: 5
      });
    }
  });

  return resources;
}

/**
 * Get recommended programs based on user score from materialized view
 * Returns two blocks: top 5 by score gap and top 5 by competition ratio
 */
async function fetchRecommendedPrograms(
  user_id: number,
  examType: string,
  averageScore: number,
  maxScore: number
): Promise<RecommendedProgram[]> {
  try {
    console.log(`[DEBUG fetchRecommendedPrograms] Starting for user ${user_id}, examType: "${examType}"`);
    
    // Only fetch for SNBT Exam
    if (!examType.includes('SNBT')) {
      console.log(`[DEBUG fetchRecommendedPrograms] ExamType doesn't include SNBT, returning empty`);
      return [];
    }

    console.log(`[DEBUG fetchRecommendedPrograms] Calling getRecommendedPrograms with limit 100...`);
    const recommendedData = await getRecommendedPrograms(user_id, examType, 100);
    
    console.log(`[DEBUG fetchRecommendedPrograms] Fetched recommendations for user ${user_id}:`, {
      byScoreGapCount: recommendedData.byScoreGap.length,
      byCompetitionCount: recommendedData.byCompetition.length,
      byScoreGapData: recommendedData.byScoreGap,
      byCompetitionData: recommendedData.byCompetition
    });
    
    // Combine both lists and format
    const allPrograms: RecommendedProgram[] = [];
    
    // Add "Top 25 by Score Gap" programs (includes both similarity and same_university types)
    recommendedData.byScoreGap.forEach((item: RecommendedProgramModel) => {
      const matchPercentage = Math.round(item.similarity_score);
      
      allPrograms.push({
        program: item.nama_prodi,
        university: item.nama_pt || item.nama_singkat,
        match: matchPercentage,
        minScore: item.min_score_prev,
        maxScore: item.max_score_prev || null,
        averageScore: item.average_score_prev || null,
        requirement: 'SNBT',
        scoreGap: item.score_gap,
        competitionRatio: item.competition_ratio,
        akreditasi: item.akreditasi,
        jenjang: item.jenjang_prodi,
        targetChoice: item.target_choice_number,
        targetProdi: item.target_prodi_name,
        targetUniversity: item.target_university_name,
        recommendationType: item.recommendation_type
      });
    });
    
    // Add "Top 25 by Competition" programs (avoid duplicates by prodi_id + university)
    recommendedData.byCompetition.forEach((item: RecommendedProgramModel) => {
      const exists = allPrograms.find(p => 
        p.program === item.nama_prodi && 
        p.university === (item.nama_pt || item.nama_singkat)
      );
      if (!exists) {
        const matchPercentage = Math.round(item.similarity_score);
        
        allPrograms.push({
          program: item.nama_prodi,
          university: item.nama_pt || item.nama_singkat,
          match: matchPercentage,
          minScore: item.min_score_prev,
          maxScore: item.max_score_prev || null,
          averageScore: item.average_score_prev || null,
          requirement: 'SNBT',
          scoreGap: item.score_gap,
          competitionRatio: item.competition_ratio,
          akreditasi: item.akreditasi,
          jenjang: item.jenjang_prodi,
          targetChoice: item.target_choice_number,
          targetProdi: item.target_prodi_name,
          targetUniversity: item.target_university_name,
          recommendationType: item.recommendation_type
        });
      }
    });

    // Return all recommendations (frontend will handle display limit)
    const finalResults = allPrograms;
    
    console.log(`[DEBUG fetchRecommendedPrograms] Final recommendations count: ${finalResults.length}`, finalResults);
    
    return finalResults;
  } catch (error) {
    console.error('[ERROR fetchRecommendedPrograms] Error fetching recommended programs:', error);
    console.error('[ERROR fetchRecommendedPrograms] Stack trace:', error instanceof Error ? error.stack : 'No stack');
    return [];
  }
}

/**
 * Generate next goal based on exam type and current performance
 */
function generateNextGoal(
  examType: string,
  averageScore: number,
  maxScore: number
): NextGoal | undefined {
  // Goal is typically 85% of max score
  const targetScore = Math.round(maxScore * 0.85);

  return {
    name: `Target ${examType}`,
    score: targetScore,
    currentScore: formatToTwoDecimals(averageScore)
  };
}

/**
 * Calculate probability of passing based on performance
 */
function calculateProbabilityOfPassing(
  examType: string,
  averageScore: number,
  maxScore: number,
  percentileRank?: number
): number | null {
  // For Quiz, we don't calculate probability
  if (examType === 'Quiz') return null;

  let probability = 0;

  // Calculate score percentage
  const scorePercentage = maxScore > 0 ? (averageScore / maxScore) * 100 : 0;

  // Base probability on score percentage
  if (scorePercentage >= 85) {
    probability = 85;
  } else if (scorePercentage >= 75) {
    probability = 70;
  } else if (scorePercentage >= 65) {
    probability = 55;
  } else {
    probability = 40;
  }

  // Adjust based on percentile rank
  if (percentileRank) {
    if (percentileRank <= 10) {
      probability += 15;
    } else if (percentileRank <= 25) {
      probability += 10;
    } else if (percentileRank <= 50) {
      probability += 5;
    }
  }

  return Math.min(probability, 95); // Cap at 95%
}

/**
 * Calculate total completed exams for specific exam type
 */
async function getTotalCompletedExams(user_id: number, examType: string): Promise<number> {
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(DISTINCT ues.exam_schedule_id) as total_completed
       FROM user_exam_scores ues
       JOIN exam_schedule es ON es.id = ues.exam_schedule_id
       JOIN product_type pt ON pt.id = es.type
       WHERE ues.user_id = $1 
         AND pt.description = $2
         AND ues.is_final = true`,
      [user_id, examType]
    );
    return Number(rows[0]?.total_completed || 0);
  } catch (error) {
    console.error('Error getting total completed exams:', error);
    return 0;
  }
}

/**
 * Calculate study time for specific exam type
 */
async function getStudyTime(user_id: number, examType: string): Promise<string> {
  try {
    const { rows } = await pool.query(
      `SELECT COALESCE(
         SUM(EXTRACT(EPOCH FROM (ues.completion_time - ues.start_time)) / 3600),
         0
       ) as study_hours
       FROM user_exam_scores ues
       JOIN exam_schedule es ON es.id = ues.exam_schedule_id
       JOIN product_type pt ON pt.id = es.type
       WHERE ues.user_id = $1 
         AND pt.description = $2
         AND ues.start_time IS NOT NULL
         AND ues.completion_time IS NOT NULL`,
      [user_id, examType]
    );
    
    const hours = Number(rows[0]?.study_hours || 0);
    return formatToTwoDecimals(hours).toString();
  } catch (error) {
    console.error('Error calculating study time:', error);
    return '0';
  }
}

// ========== HELPERS ==========
function parseWeeklyProgress(row: any | null, maxScore: number): WeekData[] {
  if (!row) return [];
  
  // Calculate targets as percentages of max_score (you can adjust these percentages)
  const targetPercentages = [0.60, 0.65, 0.70, 0.75, 0.80]; // 60%, 65%, 70%, 75%, 80% of max
  
  return [
    { 
      name: "Minggu 1", 
      nilai: formatToTwoDecimals(row.week1 || 0), 
      target: formatToTwoDecimals(maxScore * targetPercentages[0])
    },
    { 
      name: "Minggu 2", 
      nilai: formatToTwoDecimals(row.week2 || 0), 
      target: formatToTwoDecimals(maxScore * targetPercentages[1])
    },
    { 
      name: "Minggu 3", 
      nilai: formatToTwoDecimals(row.week3 || 0), 
      target: formatToTwoDecimals(maxScore * targetPercentages[2])
    },
    { 
      name: "Minggu 4", 
      nilai: formatToTwoDecimals(row.week4 || 0), 
      target: formatToTwoDecimals(maxScore * targetPercentages[3])
    },
    { 
      name: "Minggu 5", 
      nilai: formatToTwoDecimals(row.week5 || 0), 
      target: formatToTwoDecimals(maxScore * targetPercentages[4])
    }
  ];
}

// Helper to fetch courses
async function fetchUserCourses(user_id: number): Promise<UserCourseData[]> {
  try {
    const { rows } = await pool.query(
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
      progressPercentage: formatToTwoDecimals(row.overall_progress_percentage),
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

async function fetchUserClasses(user_id: number): Promise<UserClassData[]> {
  try {
    const { rows } = await pool.query(
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

async function fetchUserTryOuts(user_id: number): Promise<UserTryOutData[]> {
  try {
    const { rows } = await pool.query(
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
      totalScore: row.total_score ? formatToTwoDecimals(row.total_score) : undefined,
      completionTime: row.completion_time ? new Date(row.completion_time).toLocaleDateString('id-ID') : undefined
    }));
  } catch (error) {
    console.error('Error fetching user try-outs:', error);
    return [];
  }
}

// ========== PROCESS SINGLE EXAM TYPE ==========
async function processExamType(user_id: number, examType: string): Promise<ExamDashboardData | null> {
  try {
    console.log(`Processing exam type: ${examType}`);
    
    // Get product_type_id for this exam type
    const productTypeResult = await pool.query(
      `SELECT id FROM product_type WHERE description = $1 LIMIT 1`,
      [examType]
    );
    const productTypeId = productTypeResult.rows[0]?.id;
    
    // Fetch all exam data in parallel using model functions with materialized views
    const [
      subjectPerformanceRaw,
      weeklyProgressRaw,
      recentResultsRaw,
      progressDetailRaw,
      topicDataRaw,
      globalData,
      competitiveAnalysisRaw,
      competitiveAnalysisWithHistoryRaw,
      totalCompleted,
      studyTime
    ] = await Promise.all([
      getLatestSubjectPerformance(user_id, examType),
      getLatestWeeklyProgress(user_id, examType),
      getRecentExamResults(user_id, examType),
      getProgressDetail(user_id, examType),
      getTopicData(user_id, examType),
      getUserGlobalData(user_id, examType),
      getCompetitiveAnalysis(user_id, examType),
      getCompetitiveAnalysisWithHistory(user_id, examType),
      getTotalCompletedExams(user_id, examType),
      getStudyTime(user_id, examType)
    ]);

    // Get max_score and metrics from globalData (or from any of the raw data that has it)
    const maxScore = globalData?.max_score || subjectPerformanceRaw[0]?.max_score || 100;
    const metrics = globalData?.metrics || subjectPerformanceRaw[0]?.metrics || 'average';

    console.log(`Exam type: ${examType}, Max Score: ${maxScore}, Metrics: ${metrics}`);

    // Map subject performance
    const subjectPerformanceData: SubjectPerformanceData[] = subjectPerformanceRaw.map(s => ({
      name: s.mapel,
      nilai: formatToTwoDecimals(s.nilai),
      target: Math.round(maxScore * 0.85), // Target is 85% of max_score
      maxScore: s.max_score,
      metrics: s.metrics
    }));

    // Map weekly progress
    const weeklyProgressData = parseWeeklyProgress(weeklyProgressRaw, maxScore);

    // Map recent results with new fields
const recentResultsData: RecentResultData[] = recentResultsRaw
  .filter(r => r.score !== null && r.average_score !== null)
  .map((r, i) => {
    console.log(`[${examType}] Mapping recent result ${i}:`, r);
    return {
      id: i + 1,
      title: r.exam_schedule_name || 'Unknown',
      score: formatToTwoDecimals(r.score),
      maxScore: r.max_score_limit || maxScore,
      metrics: r.metrics || metrics,
      date: new Date(r.completion_time).toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      numberOfExams: r.number_of_exams || 0,
      averageScore: formatToTwoDecimals(r.average_score),
      minScore: formatToTwoDecimals(r.min_score || 0),
      minExamName: r.min_exam_name || 'Unknown',
      maxExamScore: formatToTwoDecimals(r.max_score || 0),
      maxExamName: r.max_exam_name || 'Unknown'
    };
  });

          console.log(`[${examType}] Recent results data count:`, recentResultsData.length);
    console.log(`[${examType}] Recent results data:`, JSON.stringify(recentResultsData, null, 2));


    // Group topic data by mapel
    const topicData: { [key: string]: TopicDataItem[] } = {};
    for (const t of topicDataRaw) {
      if (!topicData[t.mapel]) topicData[t.mapel] = [];
      topicData[t.mapel].push({
        topic: t.topic,
        score: formatToTwoDecimals(t.score),
        avg: formatToTwoDecimals(t.avg),
        total: Number(t.total),
        completed: Number(t.completed),
        maxScore: t.max_score,
        metrics: t.metrics
      });
    }

    // Radar data
    const radarData: RadarData[] = subjectPerformanceRaw.map(s => ({
      subject: s.mapel,
      score: formatToTwoDecimals(s.nilai),
      maxScore: s.max_score
    }));

    // Progress detail
    const progressDetailData: ProgressDetailData[] = progressDetailRaw.map(d => ({
      nama: d.nama,
      nilai: formatToTwoDecimals(d.nilai),
      peningkatan: formatToTwoDecimals(d.peningkatan),
      maxScore: d.max_score,
      metrics: d.metrics
    }));

    // Competitive analysis
    const competitiveAnalysisData: CompetitiveAnalysisData[] = competitiveAnalysisRaw ? [
      { name: "Top 5%", score: formatToTwoDecimals(competitiveAnalysisRaw.top_5_percent) },
      { name: "Top 10%", score: formatToTwoDecimals(competitiveAnalysisRaw.top_10_percent) },
      { name: "Top 25%", score: formatToTwoDecimals(competitiveAnalysisRaw.top_25_percent) },
      { name: "Kamu", score: formatToTwoDecimals(competitiveAnalysisRaw.avg_score) },
      { name: "Rata-rata", score: formatToTwoDecimals(competitiveAnalysisRaw.average_score) },
    ] : [];

    // Target Prodi Analysis with Historical Data
    const targetProdiAnalysisData: TargetProdiAnalysis[] = competitiveAnalysisWithHistoryRaw.map(item => {
      // Generate status message based on status
      let statusMessage = '';
      if (item.status === 'No Historical Data') {
        statusMessage = 'Data historis belum tersedia. Target ini baru atau belum ada data tahun sebelumnya.';
      } else if (item.status === 'Aman') {
        statusMessage = `Selamat! Kamu berada di posisi aman (rank ${item.user_rank} dari ${item.safe_zone_rank} safe zone). Score kamu ${formatToTwoDecimals(item.user_score)} sudah di atas minimum ${formatToTwoDecimals(item.min_score_prev || 0)}.`;
      } else if (item.status === 'Perlu Ditingkatkan') {
        const gapToMin = item.score_gap_to_minimum || 0;
        statusMessage = `Score kamu sudah di atas minimum (${formatToTwoDecimals(item.min_score_prev || 0)}), namun ranking perlu ditingkatkan. Kamu di rank ${item.user_rank}, target safe zone: ${item.safe_zone_rank}.`;
      } else { // Tidak Aman
        const gapToMin = item.score_gap_to_minimum || 0;
        statusMessage = `Perlu peningkatan! Score kamu (${formatToTwoDecimals(item.user_score)}) masih ${formatToTwoDecimals(gapToMin)} poin di bawah minimum tahun lalu (${formatToTwoDecimals(item.min_score_prev || 0)}).`;
      }

      return {
        prodi_id: item.prodi_id,
        nama_prodi: item.nama_prodi_dikbud,
        nama_ptn: item.nama_ptn_dikbud,
        user_score: formatToTwoDecimals(item.user_score),
        user_rank: item.user_rank,
        total_bimbel_participants: item.total_bimbel_participants,
        peminat: item.peminat_current,
        daya_tampung: item.daya_tampung_current,
        safe_zone_rank: item.safe_zone_rank,
        min_score_reference: item.min_score_prev ? formatToTwoDecimals(item.min_score_prev) : null,
        max_score_reference: item.max_score_prev ? formatToTwoDecimals(item.max_score_prev) : null,
        average_score_reference: item.average_score_prev ? formatToTwoDecimals(item.average_score_prev) : null,
        has_historical_data: item.has_prev_year_data === 1,
        status: item.status,
        score_gap_to_minimum: item.score_gap_to_minimum ? formatToTwoDecimals(item.score_gap_to_minimum) : null,
        score_gap_to_average: item.score_gap_to_average ? formatToTwoDecimals(item.score_gap_to_average) : null,
        competition_ratio: item.competition_ratio ? formatToTwoDecimals(item.competition_ratio) : null,
        status_message: statusMessage
      };
    });

    // Calculate average score
    const averageScore = globalData?.avg_score_now || 0;

    // Generate sample data for missing fields
    const learningInsights = generateSampleInsights(
      examType,
      subjectPerformanceData,
      topicData,
      globalData?.rank_now,
      globalData?.total_participants
    );

    const achievements = generateSampleAchievements(
      examType,
      subjectPerformanceData,
      totalCompleted,
      averageScore
    );

    const recommendedResources = generateRecommendedResources(topicData);
    
    const recommendedPrograms = await fetchRecommendedPrograms(user_id, examType, averageScore, maxScore);
    
    const nextGoal = generateNextGoal(examType, averageScore, maxScore);
    
    // Get passing probability with details per target choice
    const passingProbabilityData = productTypeId 
      ? await getPassingProbabilityWithDetails(user_id, productTypeId)
      : { overall_probability: 0, details: [] };
    
    const probabilitasKelulusan = passingProbabilityData.overall_probability;

    return {
      examType,
      hasData: true,
      maxScore,
      metrics,
      rank: globalData?.rank_now || undefined,
      previousRank: globalData?.rank_previous !== null && globalData?.rank_previous !== undefined 
        ? globalData.rank_previous 
        : null,
      averageScore: averageScore ? formatToTwoDecimals(averageScore) : undefined,
      previousAverageScore: globalData?.avg_score_previous !== null && globalData?.avg_score_previous !== undefined
        ? formatToTwoDecimals(globalData.avg_score_previous)
        : null,
      totalCompleted,
      studyTime,
      percentileRank: globalData?.percentile ? formatToTwoDecimals(globalData.percentile) : undefined,
      totalParticipants: globalData?.total_participants || undefined,
      probabilitasKelulusan,
      probabilitasKelulusanDetails: passingProbabilityData.details,
      subjectPerformance: subjectPerformanceData,
      weeklyProgress: weeklyProgressData,
      recentResults: recentResultsData,
      radarData,
      progressDetail: progressDetailData,
      topicData,
      competitiveAnalysis: competitiveAnalysisData,
      targetProdiAnalysis: targetProdiAnalysisData,
      nextGoal,
      learningInsights,
      achievements,
      recommendedResources,
      recommendedPrograms
    };
  } catch (error) {
    console.error(`Error processing exam type ${examType}:`, error);
    return null;
  }
}

// ========== MAIN CONTROLLER ==========
export async function getStudentDashboard(
  req: AuthenticatedRequest, 
  res: NextApiResponse<StudentDashboardResponse | { error: string }>
) {
  const user_id = parseInt(req.user!.id);

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({ error: 'Valid user_id is required' });
  }

  try {
    console.log('===========================================');
    console.log('Dashboard request for user:', user_id);
    console.log('Timestamp:', new Date().toISOString());

    // Check which exam types have data using materialized view
    const availableExams = await checkExamDataAvailability(user_id);
    console.log('Available exams:', availableExams);
    
    // Build exam dashboards for available types
    const examDashboards: ExamDashboardData[] = [];
    
    // Process each exam type that has data
    const examTypePromises = Object.entries(availableExams)
      .filter(([_, hasData]) => hasData)
      .map(([examType, _]) => processExamType(user_id, examType));
    
    const examResults = await Promise.allSettled(examTypePromises);
    
    examResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value !== null) {
        examDashboards.push(result.value);
      } else if (result.status === 'rejected') {
        console.error(`Failed to process exam type at index ${index}:`, result.reason);
      }
    });

    console.log(`Successfully processed ${examDashboards.length} exam dashboards`);

    // Get user courses, classes, and try-outs in parallel
    const [courses, classes, tryOuts] = await Promise.allSettled([
      fetchUserCourses(user_id),
      fetchUserClasses(user_id),
      fetchUserTryOuts(user_id)
    ]);

    const response: StudentDashboardResponse = {
      examDashboards,
      courses: courses.status === 'fulfilled' ? courses.value : [],
      classes: classes.status === 'fulfilled' ? classes.value : [],
      tryOuts: tryOuts.status === 'fulfilled' ? tryOuts.value : []
    };

    console.log('Dashboard response summary:');
    console.log('- Exam dashboards:', response.examDashboards.length);
    console.log('- Courses:', response.courses.length);
    console.log('- Classes:', response.classes.length);
    console.log('- Try-outs:', response.tryOuts.length);
    console.log('===========================================');

    res.json(response);
    
  } catch (error: any) {
    console.error('Error in getStudentDashboard:', error);
    console.error('Error stack:', error.stack);
    
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
    if (error.code === '42P01') {
      return res.status(500).json({ error: 'Database table or view not found' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ========== COMPETITIVE ANALYSIS WITH HISTORY ENDPOINT ==========
export async function getCompetitiveAnalysisWithHistoryController(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const user_id = parseInt(req.user!.id);
  const { examType } = req.query;

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({ error: 'Valid user_id is required' });
  }

  if (!examType || typeof examType !== 'string') {
    return res.status(400).json({ error: 'examType is required' });
  }

  try {
    const analysisData = await getCompetitiveAnalysisWithHistory(user_id, examType);
    
    const formattedData: TargetProdiAnalysis[] = analysisData.map(item => {
      let statusMessage = '';
      if (item.status === 'No Historical Data') {
        statusMessage = 'Data historis belum tersedia. Target ini baru atau belum ada data tahun sebelumnya.';
      } else if (item.status === 'Aman') {
        statusMessage = `Selamat! Kamu berada di posisi aman (rank ${item.user_rank} dari ${item.safe_zone_rank} safe zone). Score kamu ${formatToTwoDecimals(item.user_score)} sudah di atas minimum ${formatToTwoDecimals(item.min_score_prev || 0)}.`;
      } else if (item.status === 'Perlu Ditingkatkan') {
        statusMessage = `Score kamu sudah di atas minimum (${formatToTwoDecimals(item.min_score_prev || 0)}), namun ranking perlu ditingkatkan. Kamu di rank ${item.user_rank}, target safe zone: ${item.safe_zone_rank}.`;
      } else {
        const gapToMin = item.score_gap_to_minimum || 0;
        statusMessage = `Perlu peningkatan! Score kamu (${formatToTwoDecimals(item.user_score)}) masih ${formatToTwoDecimals(gapToMin)} poin di bawah minimum tahun lalu (${formatToTwoDecimals(item.min_score_prev || 0)}).`;
      }

      return {
        prodi_id: item.prodi_id,
        nama_prodi: item.nama_prodi_dikbud,
        nama_ptn: item.nama_ptn_dikbud,
        user_score: formatToTwoDecimals(item.user_score),
        user_rank: item.user_rank,
        total_bimbel_participants: item.total_bimbel_participants,
        peminat: item.peminat_current,
        daya_tampung: item.daya_tampung_current,
        safe_zone_rank: item.safe_zone_rank,
        min_score_reference: item.min_score_prev ? formatToTwoDecimals(item.min_score_prev) : null,
        max_score_reference: item.max_score_prev ? formatToTwoDecimals(item.max_score_prev) : null,
        average_score_reference: item.average_score_prev ? formatToTwoDecimals(item.average_score_prev) : null,
        has_historical_data: item.has_prev_year_data === 1,
        status: item.status,
        score_gap_to_minimum: item.score_gap_to_minimum ? formatToTwoDecimals(item.score_gap_to_minimum) : null,
        score_gap_to_average: item.score_gap_to_average ? formatToTwoDecimals(item.score_gap_to_average) : null,
        competition_ratio: item.competition_ratio ? formatToTwoDecimals(item.competition_ratio) : null,
        status_message: statusMessage
      };
    });

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error in getCompetitiveAnalysisWithHistory:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch competitive analysis with history' 
    });
  }
}