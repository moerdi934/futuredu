// controllers/dashboard.controller.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest } from '../lib/middleware/auth';
import * as dashboardModel from '../models/dashboard.model';

// Response Types
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

export interface Achievement {
  title: string;
  description: string;
  completed: boolean;
  progress: number;
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

export interface LearningInsight {
  insight: string;
  type: 'positive' | 'negative';
}

export interface RecommendedResource {
  type: string;
  subject: string;
  topic: string;
  title: string;
  duration: string;
}

export interface RecommendedProgram {
  program: string;
  match: number;
  minScore: number;
  requirement: string;
}

export interface CompetitiveAnalysisData {
  name: string;
  score: number;
}

export interface NextGoal {
  name: string;
  score: number;
  currentScore: number;
}

export interface DashboardResponse {
  subjectPerformanceData: SubjectPerformanceData[];
  weeklyProgressData: WeekData[];
  recentResults: RecentResultData[];
  averageScore: number;
  totalCompleted: number;
  studyTime: string;
  rank: number;
  radarData: RadarData[];
  progressDetail: ProgressDetailData[];
  topicData: { [key: string]: TopicDataItem[] };
  probabilitasKelulusan: number;
  nextGoal: NextGoal;
  learningInsights: LearningInsight[];
  achievements: Achievement[];
  recommendedResources: RecommendedResource[];
  recommendedPrograms: RecommendedProgram[];
  percentileRank: number;
  competitiveAnalysis: CompetitiveAnalysisData[];
}

// helper konversi hasil weekly progress ke array week
function parseWeeklyProgress(row: dashboardModel.WeeklyProgress | null): WeekData[] {
  if (!row) return [];
  return [
    { name: "Minggu 1", nilai: row.week1, target: row.target1 || null },
    { name: "Minggu 2", nilai: row.week2, target: row.target2 || null },
    { name: "Minggu 3", nilai: row.week3, target: row.target3 || null },
    { name: "Minggu 4", nilai: row.week4, target: row.target4 || null },
    { name: "Minggu 5", nilai: row.week5, target: row.target5 || null }
  ];
}

export async function getExamDashboard(req: AuthenticatedRequest, res: NextApiResponse<DashboardResponse | { error: string }>) {
  const user_id = parseInt(req.user!.id); // dari query string atau session/jwt
  const tipe = req.query.tipe as string; // 'SNBT', 'SIMAK', dsb

  if (!user_id || !tipe) {
    return res.status(400).json({ error: 'user_id and tipe are required' });
  }

  try {
    // 1. Get data dari model
    const [
      subjectPerformance,
      weeklyProgress,
      recentResults,
      progressDetail,
      topicDataRaw,
      competitiveAnalysis
    ] = await Promise.all([
      dashboardModel.getLatestSubjectPerformance(user_id, tipe),
      dashboardModel.getLatestWeeklyProgress(user_id, tipe),
      dashboardModel.getRecentExamResults(user_id, tipe),
      dashboardModel.getProgressDetail(user_id, tipe),
      dashboardModel.getTopicData(user_id, tipe),
      dashboardModel.getCompetitiveAnalysis(user_id, tipe)
    ]);

    // 2. Mapping data per field (disesuaikan dengan JSON contoh kamu)
    const subjectPerformanceData: SubjectPerformanceData[] = subjectPerformance.map(s => ({
      name: s.mapel,
      nilai: Number(s.nilai),
      target: 85 // target dummy/manual, bisa pakai mapping atau static
    }));

    const weeklyProgressData: WeekData[] = parseWeeklyProgress(weeklyProgress);

    const recentResultsData: RecentResultData[] = recentResults.map((r, i) => ({
      id: i + 1,
      title: r.exam_schedule_name,
      score: Number(r.score),
      date: new Date(r.completion_time).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
    }));

    // dummy fields
    const achievements: Achievement[] = [
      { title: "Matematika Master", description: "Mencapai nilai 90+ di 5 tes Matematika", completed: true, progress: 100 },
      { title: "Konsisten Belajar", description: "Belajar selama 10 hari berturut-turut", completed: true, progress: 100 }
      // dst...
    ];

    // Group topicData by mapel
    const topicData: { [key: string]: TopicDataItem[] } = {};
    for (const t of topicDataRaw) {
      if (!topicData[t.mapel]) topicData[t.mapel] = [];
      topicData[t.mapel].push({
        topic: t.topic,
        score: Number(t.score),
        avg: Number(t.avg),
        total: Number(t.total),
        completed: Number(t.completed),
      });
    }

    // radarData dari subjectPerformance
    const radarData: RadarData[] = subjectPerformance.map(s => ({
      subject: s.mapel,
      score: Number(s.nilai),
    }));

    // percentilerank, averageScore, dsb dari competitiveAnalysis
    const percentileRank = competitiveAnalysis ? competitiveAnalysis.type_rank : 0;
    const averageScore = competitiveAnalysis ? Number(competitiveAnalysis.avg_score) : 0;

    // Lainnya: studyTime, rank, totalCompleted bisa dummy/manual
    // response json
    const response: DashboardResponse = {
      subjectPerformanceData,
      weeklyProgressData,
      recentResults: recentResultsData,
      averageScore: averageScore || 0,
      totalCompleted: 15, // manual/dummy
      studyTime: "24.5", // manual/dummy
      rank: 42, // manual/dummy
      radarData,
      progressDetail: progressDetail.map(d => ({
        nama: d.nama,
        nilai: Number(d.nilai),
        peningkatan: Number(d.peningkatan),
      })),
      topicData,
      probabilitasKelulusan: 78, // manual/dummy
      nextGoal: { name: "Target SNBT UI", score: 700, currentScore: 650 }, // manual/dummy
      learningInsights: [
        { insight: "Kamu 15% lebih baik dalam soal geometri dibanding rata-rata", type: "positive" },
        { insight: "Kecepatan menjawab soal kalkulus 20% lebih lambat dari target", type: "negative" },
        { insight: "Performamu di atas 65% peserta lain dalam try out", type: "positive" }
      ],
      achievements,
      recommendedResources: [
        { type: "video", subject: "Matematika", topic: "Kalkulus", title: "Konsep Dasar Integral", duration: "15 menit" },
        // dst
      ],
      recommendedPrograms: [
        { program: "Kedokteran UI", match: 82, minScore: 700, requirement: "SNBT + SIMAK FK" },
        // dst
      ],
      percentileRank: percentileRank || 0,
      competitiveAnalysis: competitiveAnalysis ? [
        { name: "Top 5%", score: Number(competitiveAnalysis.top_5_percent) },
        { name: "Top 10%", score: Number(competitiveAnalysis.top_10_percent) },
        { name: "Top 25%", score: Number(competitiveAnalysis.top_25_percent) },
        { name: "Kamu", score: Number(competitiveAnalysis.avg_score) },
        { name: "Rata-rata", score: Number(competitiveAnalysis.average_score) },
      ] : []
    };

    res.json(response);
  } catch (error) {
    console.error('Error in getExamDashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}