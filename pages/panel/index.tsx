// pages/panel/index.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Row, Col, Card, Badge, Spinner, Button, ProgressBar, Dropdown, ButtonGroup, Alert } from 'react-bootstrap';
import { 
  Trophy, Star, Award, Users, BookOpen, GraduationCap, Target, 
  PlayCircle, CheckCircle, Calendar, User, Activity, TrendingUp,
  Clock, ChevronRight, Zap, Brain, Rocket, Flame, Heart, 
  BarChart3, PieChart, Filter, Download, Share2, ArrowUp, ArrowDown,
  Video, FileText, Edit, School, AlertCircle, TrendingDown, Lightbulb,
  Book, Play, FileQuestion
} from 'lucide-react';
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart as RechartsPieChart, 
  Pie, AreaChart, Area
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// ========== TYPES ==========
type UserRole = 'admin' | 'teacher' | 'student';

interface SubjectPerformanceData {
  name: string;
  nilai: number;
  target: number;
  maxScore?: number;
  metrics?: string;
}

interface WeekData {
  name: string;
  nilai: number;
  target: number | null;
}

interface RadarData {
  subject: string;
  score: number;
  maxScore?: number;
}

interface RecentResultData {
  id: number;
  title: string;
  score: number;
  maxScore?: number;
  metrics?: string;
  date: string;
}

interface ProgressDetail {
  nama: string;
  nilai: number;
  peningkatan: number;
  maxScore?: number;
  metrics?: string;
}

interface TopicData {
  topic: string;
  score: number;
  avg: number;
  total: number;
  completed: number;
  maxScore?: number;
  metrics?: string;
}

interface CompetitiveAnalysis {
  name: string;
  score: number;
}

interface NextGoal {
  name: string;
  score: number;
  currentScore: number;
}

interface LearningInsight {
  insight: string;
  type: 'positive' | 'negative';
}

interface Achievement {
  title: string;
  description: string;
  completed: boolean;
  progress: number;
}

interface RecommendedResource {
  type: 'video' | 'quiz' | 'reading';
  subject: string;
  topic: string;
  title: string;
  duration?: string;
  questions?: number;
  pages?: number;
}

interface RecommendedProgram {
  program: string;
  match: number;
  minScore: number;
  requirement: string;
}

interface ExamDashboardData {
  examType: string;
  hasData: boolean;
  maxScore?: number;
  metrics?: string;
  rank?: string | number;
  previousRank?: string | number;
  averageScore?: string | number;
  previousAverageScore?: string | number;
  totalCompleted?: number;
  studyTime?: string;
  percentileRank?: string | number;
  totalParticipants?: string | number;
  probabilitasKelulusan?: number;
  subjectPerformance?: SubjectPerformanceData[];
  weeklyProgress?: WeekData[];
  recentResults?: RecentResultData[];
  radarData?: RadarData[];
  progressDetail?: ProgressDetail[];
  topicData?: { [key: string]: TopicData[] };
  competitiveAnalysis?: CompetitiveAnalysis[];
  nextGoal?: NextGoal;
  learningInsights?: LearningInsight[];
  achievements?: Achievement[];
  recommendedResources?: RecommendedResource[];
  recommendedPrograms?: RecommendedProgram[];
}

interface UserCourseProgress {
  id: number;
  title: string;
  description: string;
  imageurl: string | null;
  course_string: string;
  overall_progress_percentage: number;
  finished_quiz_topics: number;
  finished_materials: number;
  quiz: number;
  material: number;
}

interface LiveClass {
  id: number;
  name: string;
  description: string;
  teacher_name: string;
  teacher_id: number;
  student_list_ids: number[];
  start_date: string;
  end_date: string;
  course_name: string;
}

interface ExamSchedule {
  id: number;
  name: string;
  exam_type: string;
  isfree: boolean;
  start_time: string;
  end_time: string;
}

interface UserEntitlement {
  id: number;
  exam_schedule_id: number;
  granted_at: string;
  exam_schedule: ExamSchedule;
}

interface UserExamScore {
  exam_schedule_id: number;
  total_score: number | string;
  has_completed: boolean;
  completion_time?: string;
}

// ========== COLOR PALETTE ==========
const CHART_COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#F97316'];

// ========== HELPER FUNCTIONS ==========
const getProgressColor = (score: number, maxScore: number = 100): string => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 85) return 'success';
  if (percentage >= 70) return 'info';
  if (percentage >= 60) return 'warning';
  return 'danger';
};

const getScoreColor = (score: number, maxScore: number = 100): string => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 85) return '#10B981';
  if (percentage >= 70) return '#3B82F6';
  if (percentage >= 60) return '#F59E0B';
  return '#EF4444';
};

const normalizeScore = (score: number, maxScore: number = 100): number => {
  return (score / maxScore) * 100;
};

// ========== ENHANCED EXAM DASHBOARD COMPONENT ==========
interface EnhancedExamDashboardProps {
  data: ExamDashboardData;
  onViewDetails: () => void;
}

const EnhancedExamDashboard: React.FC<EnhancedExamDashboardProps> = ({ data, onViewDetails }) => {
  if (!data.hasData) {
    return (
      <Card className="tw-border-0 tw-shadow-lg tw-h-full">
        <Card.Body className="tw-text-center tw-py-20">
          <Activity size={64} className="tw-mx-auto tw-mb-4 tw-text-gray-400" />
          <h5 className="tw-mb-2 tw-font-bold tw-text-gray-700">Belum Ada Data</h5>
          <p className="tw-text-gray-600">
            Data untuk {data.examType} belum tersedia
          </p>
        </Card.Body>
      </Card>
    );
  }

  const maxScore = data.maxScore || 100;
  const isSNBT = data.examType.toUpperCase().includes('SNBT');

  const getRankChange = () => {
    if (!data.previousRank || !data.rank) return null;
    const current = parseInt(String(data.rank));
    const previous = parseInt(String(data.previousRank));
    const change = previous - current;
    
    if (change > 0) {
      return { value: change, isPositive: true, icon: <ArrowUp size={16} /> };
    } else if (change < 0) {
      return { value: Math.abs(change), isPositive: false, icon: <ArrowDown size={16} /> };
    }
    return null;
  };

  const getScoreChange = () => {
    if (data.previousAverageScore === undefined || data.averageScore === undefined) return null;
    const current = parseFloat(String(data.averageScore));
    const previous = parseFloat(String(data.previousAverageScore));
    const change = current - previous;
    
    if (change > 0) {
      return { value: change.toFixed(2), isPositive: true, icon: <ArrowUp size={16} /> };
    } else if (change < 0) {
      return { value: Math.abs(change).toFixed(2), isPositive: false, icon: <ArrowDown size={16} /> };
    }
    return null;
  };

  const rankChange = getRankChange();
  const scoreChange = getScoreChange();

  // Filter out null subjects
  const validRadarData = data.radarData?.filter(item => item.subject !== null) || [];
  const shouldUseRadar = validRadarData.length >= 3;

  // Normalize radar data for display
  const normalizedRadarData = validRadarData.map(item => ({
    ...item,
    normalizedScore: normalizeScore(item.score, item.maxScore || maxScore),
    displayScore: item.score
  }));

  // Prepare data for bar chart
  const subjectBarData = normalizedRadarData.map((item, index) => ({
    ...item,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }));

  // Prepare topic data for display
  const topicDataArray = data.topicData ? Object.entries(data.topicData)
    .filter(([category]) => category !== 'null')
    .flatMap(([category, topics]) => 
      topics.filter(t => t.topic !== null).map(topic => ({
        ...topic,
        category,
        normalizedScore: normalizeScore(topic.score, topic.maxScore || maxScore),
        displayScore: topic.score
      }))
    )
    .sort((a, b) => b.displayScore - a.displayScore) : [];

  // Weekly progress with actual data
  const weeklyProgressData = data.weeklyProgress?.filter(week => week.nilai > 0) || [];

  // Resource icons
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={18} className="tw-text-red-500" />;
      case 'quiz': return <FileQuestion size={18} className="tw-text-blue-500" />;
      case 'reading': return <Book size={18} className="tw-text-green-500" />;
      default: return <FileText size={18} />;
    }
  };

  return (
    <div className="tw-space-y-4">
      {/* Header Card */}
      <Card className="tw-border-0 tw-shadow-lg tw-overflow-hidden">
        <div className="tw-bg-gradient-to-r tw-from-purple-600 tw-via-purple-700 tw-to-indigo-700 tw-p-6 tw-text-white">
          <div className="tw-flex tw-justify-between tw-items-start tw-mb-4">
            <div>
              <h2 className="tw-text-3xl tw-font-bold tw-mb-2 tw-flex tw-items-center">
                <Trophy className="tw-mr-3" size={32} />
                Dashboard {data.examType}
              </h2>
              <p className="tw-text-purple-100 tw-text-sm">
                Pantau perkembangan dan performa ujianmu secara detail
              </p>
            </div>
            <div className="tw-text-right">
              <Badge bg="light" text="dark" className="tw-px-4 tw-py-2 tw-text-lg tw-mb-2">
                {data.examType}
              </Badge>
              {data.probabilitasKelulusan !== undefined && (
                <div className="tw-mt-2">
                  <div className="tw-text-xs tw-text-purple-100 tw-mb-1">Probabilitas Lulus</div>
                  <div className="tw-text-2xl tw-font-bold">{data.probabilitasKelulusan}%</div>
                </div>
              )}
            </div>
          </div>

          {/* Key Stats Row */}
          <Row className="tw-g-3">
            {data.rank && (
              <Col xs={6} lg={3}>
                <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-lg tw-p-4 tw-border tw-border-white/20">
                  <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                    <Trophy className="tw-text-yellow-300" size={24} />
                    {rankChange && (
                      <span className={`tw-text-xs tw-flex tw-items-center tw-gap-1 ${
                        rankChange.isPositive ? 'tw-text-green-300' : 'tw-text-red-300'
                      }`}>
                        {rankChange.icon}
                        {rankChange.value}
                      </span>
                    )}
                  </div>
                  <div className="tw-text-3xl tw-font-bold">#{data.rank}</div>
                  <div className="tw-text-sm tw-text-purple-100">Peringkat</div>
                </div>
              </Col>
            )}
            
            {data.averageScore !== undefined && (
              <Col xs={6} lg={3}>
                <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-lg tw-p-4 tw-border tw-border-white/20">
                  <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                    <Star className="tw-text-yellow-300" size={24} />
                    {scoreChange && (
                      <span className={`tw-text-xs tw-flex tw-items-center tw-gap-1 ${
                        scoreChange.isPositive ? 'tw-text-green-300' : 'tw-text-red-300'
                      }`}>
                        {scoreChange.icon}
                        {scoreChange.value}
                      </span>
                    )}
                  </div>
                  <div className="tw-text-3xl tw-font-bold">{data.averageScore}</div>
                  <div className="tw-text-sm tw-text-purple-100">
                    Rata-rata Skor {isSNBT ? `(max ${maxScore})` : ''}
                  </div>
                </div>
              </Col>
            )}

            {data.percentileRank && (
              <Col xs={6} lg={3}>
                <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-lg tw-p-4 tw-border tw-border-white/20">
                  <Award className="tw-text-yellow-300 tw-mb-2" size={24} />
                  <div className="tw-text-3xl tw-font-bold">{data.percentileRank}%</div>
                  <div className="tw-text-sm tw-text-purple-100">Persentil</div>
                </div>
              </Col>
            )}

            {data.totalParticipants && (
              <Col xs={6} lg={3}>
                <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-lg tw-p-4 tw-border tw-border-white/20">
                  <Users className="tw-text-yellow-300 tw-mb-2" size={24} />
                  <div className="tw-text-3xl tw-font-bold">{data.totalParticipants}</div>
                  <div className="tw-text-sm tw-text-purple-100">Total Peserta</div>
                </div>
              </Col>
            )}
          </Row>

          {/* Additional Stats */}
          {(data.totalCompleted || data.studyTime) && (
            <Row className="tw-g-3 tw-mt-3">
              {data.totalCompleted !== undefined && (
                <Col xs={6}>
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-lg tw-p-3 tw-border tw-border-white/20">
                    <CheckCircle className="tw-text-green-300 tw-mb-1" size={20} />
                    <div className="tw-text-xl tw-font-bold">{data.totalCompleted}</div>
                    <div className="tw-text-xs tw-text-purple-100">Try Out Selesai</div>
                  </div>
                </Col>
              )}
              {data.studyTime && (
                <Col xs={6}>
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-lg tw-p-3 tw-border tw-border-white/20">
                    <Clock className="tw-text-blue-300 tw-mb-1" size={20} />
                    <div className="tw-text-xl tw-font-bold">{data.studyTime}</div>
                    <div className="tw-text-xs tw-text-purple-100">Waktu Belajar</div>
                  </div>
                </Col>
              )}
            </Row>
          )}
        </div>
      </Card>

      {/* Learning Insights */}
      {data.learningInsights && data.learningInsights.length > 0 && (
        <Row className="tw-g-3">
          {data.learningInsights.map((insight, idx) => (
            <Col key={idx} xs={12} md={6}>
              <Alert 
                variant={insight.type === 'positive' ? 'success' : 'warning'}
                className="tw-mb-0 tw-flex tw-items-start tw-gap-3"
              >
                {insight.type === 'positive' ? (
                  <TrendingUp size={24} className="tw-flex-shrink-0" />
                ) : (
                  <AlertCircle size={24} className="tw-flex-shrink-0" />
                )}
                <div>
                  <div className="tw-font-semibold tw-mb-1">
                    {insight.type === 'positive' ? 'Kelebihan' : 'Area Perbaikan'}
                  </div>
                  <div className="tw-text-sm">{insight.insight}</div>
                </div>
              </Alert>
            </Col>
          ))}
        </Row>
      )}

      {/* Next Goal */}
      {data.nextGoal && (
        <Card className="tw-border-0 tw-shadow-lg tw-bg-gradient-to-r tw-from-amber-50 tw-to-orange-50">
          <Card.Body className="tw-p-4">
            <div className="tw-flex tw-items-center tw-gap-3 tw-mb-3">
              <Target size={24} className="tw-text-orange-600" />
              <div>
                <h5 className="tw-font-bold tw-mb-0 tw-text-gray-800">{data.nextGoal.name}</h5>
                <p className="tw-text-sm tw-text-gray-600 tw-mb-0">
                  Target: {data.nextGoal.score} | Saat ini: {data.nextGoal.currentScore}
                </p>
              </div>
            </div>
            <ProgressBar 
              now={normalizeScore(data.nextGoal.currentScore, data.nextGoal.score)} 
              variant="warning"
              style={{ height: '12px' }}
              label={`${Math.round(normalizeScore(data.nextGoal.currentScore, data.nextGoal.score))}%`}
            />
            <div className="tw-text-sm tw-text-gray-600 tw-mt-2">
              Butuh {(data.nextGoal.score - data.nextGoal.currentScore).toFixed(0)} poin lagi untuk mencapai target
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Charts Section */}
      <Row className="tw-g-4">
        {/* Subject Performance Chart */}
        {validRadarData.length > 0 && (
          <Col lg={6}>
            <Card className="tw-border-0 tw-shadow-lg tw-h-full">
              <Card.Body className="tw-p-4">
                <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                  <h5 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                    <Activity className="tw-mr-2 tw-text-purple-600" size={20} />
                    Performa Mata Pelajaran
                  </h5>
                  <Badge bg="purple" className="tw-px-3 tw-py-1">
                    {validRadarData.length} Mapel
                  </Badge>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  {shouldUseRadar ? (
                    <RadarChart data={normalizedRadarData}>
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#6B7280', fontSize: 11 }} 
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fill: '#6B7280', fontSize: 10 }} 
                      />
                      <Radar 
                        name="Score" 
                        dataKey="normalizedScore" 
                        stroke="#8B5CF6" 
                        fill="#8B5CF6" 
                        fillOpacity={0.6} 
                        strokeWidth={2}
                      />
                      <Tooltip 
                        content={({ payload }) => {
                          if (payload && payload[0]) {
                            const data = payload[0].payload;
                            return (
                              <div className="tw-bg-white tw-p-2 tw-border tw-border-gray-200 tw-rounded-lg tw-shadow-lg">
                                <div className="tw-font-semibold tw-text-sm">{data.subject}</div>
                                <div className="tw-text-sm">Skor: {data.displayScore}</div>
                                <div className="tw-text-xs tw-text-gray-500">
                                  {data.normalizedScore.toFixed(1)}% dari max
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </RadarChart>
                  ) : (
                    <BarChart data={subjectBarData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="subject" 
                        tick={{ fill: '#6B7280', fontSize: 10 }} 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} />
                      <Tooltip 
                        content={({ payload }) => {
                          if (payload && payload[0]) {
                            const data = payload[0].payload;
                            return (
                              <div className="tw-bg-white tw-p-2 tw-border tw-border-gray-200 tw-rounded-lg tw-shadow-lg">
                                <div className="tw-font-semibold tw-text-sm">{data.subject}</div>
                                <div className="tw-text-sm">Skor: {data.displayScore}</div>
                                <div className="tw-text-xs tw-text-gray-500">
                                  {data.normalizedScore.toFixed(1)}% dari max
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="normalizedScore" radius={[8, 8, 0, 0]}>
                        {subjectBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Competitive Analysis */}
        {data.competitiveAnalysis && data.competitiveAnalysis.length > 0 && (
          <Col lg={6}>
            <Card className="tw-border-0 tw-shadow-lg tw-h-full">
              <Card.Body className="tw-p-4">
                <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                  <h5 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                    <TrendingUp className="tw-mr-2 tw-text-purple-600" size={20} />
                    Analisis Kompetitif
                  </h5>
                  <Badge bg="info" className="tw-px-3 tw-py-1">
                    Posisi Kamu
                  </Badge>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={data.competitiveAnalysis}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                    <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={70} 
                      tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 'bold' }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                    <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                      {data.competitiveAnalysis.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === 'Kamu' ? '#EC4899' : '#9CA3AF'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Weekly Progress */}
        {weeklyProgressData.length > 0 && (
          <Col lg={12}>
            <Card className="tw-border-0 tw-shadow-lg">
              <Card.Body className="tw-p-4">
                <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                  <h5 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                    <BarChart3 className="tw-mr-2 tw-text-purple-600" size={20} />
                    Perkembangan Mingguan
                  </h5>
                  <Badge bg="success" className="tw-px-3 tw-py-1">
                    {weeklyProgressData.length} Minggu Aktif
                  </Badge>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.weeklyProgress} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorNilai" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="nilai" 
                      stroke="#8B5CF6" 
                      fillOpacity={1} 
                      fill="url(#colorNilai)" 
                      strokeWidth={3}
                      name="Nilai Aktual"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#colorTarget)" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Recent Results & Progress Detail */}
      <Row className="tw-g-4">
        {/* Recent Results */}
        {data.recentResults && data.recentResults.length > 0 && (
          <Col lg={6}>
            <Card className="tw-border-0 tw-shadow-lg tw-h-full">
              <Card.Body className="tw-p-4">
                <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                  <h5 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                    <Clock className="tw-mr-2 tw-text-purple-600" size={20} />
                    Try Out Terbaru
                  </h5>
                  <Badge bg="primary" className="tw-px-3 tw-py-1">
                    {data.recentResults.length} Test
                  </Badge>
                </div>
                <div className="tw-space-y-3">
                  {data.recentResults.map((result, idx) => {
                    const resultMaxScore = result.maxScore || maxScore;
                    const normalizedValue = normalizeScore(result.score, resultMaxScore);
                    return (
                      <div 
                        key={result.id} 
                        className="tw-p-4 tw-bg-gradient-to-r tw-from-purple-50 tw-to-pink-50 tw-rounded-lg tw-border tw-border-purple-200 hover:tw-shadow-md tw-transition-all"
                      >
                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
                          <div className="tw-flex tw-items-center tw-gap-2">
                            <div className="tw-w-8 tw-h-8 tw-bg-purple-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-sm">
                              {idx + 1}
                            </div>
                            <span className="tw-font-semibold tw-text-gray-800">{result.title}</span>
                          </div>
                          <span className="tw-text-xs tw-text-gray-500 tw-bg-white tw-px-2 tw-py-1 tw-rounded">
                            {result.date}
                          </span>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-3">
                          <ProgressBar 
                            now={normalizedValue} 
                            variant={getProgressColor(result.score, resultMaxScore)}
                            className="tw-flex-1"
                            style={{ height: '10px' }}
                          />
                          <span 
                            className="tw-font-bold tw-text-lg tw-min-w-[80px] tw-text-right" 
                            style={{ color: getScoreColor(result.score, resultMaxScore) }}
                          >
                            {result.score}
                            {isSNBT && <span className="tw-text-xs tw-text-gray-500">/{resultMaxScore}</span>}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Progress Detail */}
        {data.progressDetail && data.progressDetail.filter(item => item.nama !== null).length > 0 && (
          <Col lg={6}>
            <Card className="tw-border-0 tw-shadow-lg tw-h-full">
              <Card.Body className="tw-p-4">
                <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                  <h5 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                    <Brain className="tw-mr-2 tw-text-purple-600" size={20} />
                    Detail Perkembangan
                  </h5>
                  <Badge bg="warning" className="tw-px-3 tw-py-1">
                    Top Subjects
                  </Badge>
                </div>
                <div className="tw-space-y-3">
                  {data.progressDetail.filter(item => item.nama !== null).slice(0, 5).map((item, idx) => {
                    const itemMaxScore = item.maxScore || maxScore;
                    const normalizedValue = normalizeScore(item.nilai, itemMaxScore);
                    return (
                      <div 
                        key={idx} 
                        className="tw-p-4 tw-bg-gradient-to-r tw-from-blue-50 tw-to-cyan-50 tw-rounded-lg tw-border tw-border-blue-200 hover:tw-shadow-md tw-transition-all"
                      >
                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                          <span className="tw-text-sm tw-font-semibold tw-text-gray-800">{item.nama}</span>
                          <div className="tw-flex tw-items-center tw-gap-2">
                            <span 
                              className="tw-font-bold tw-text-lg" 
                              style={{ color: getScoreColor(item.nilai, itemMaxScore) }}
                            >
                              {item.nilai}
                              {isSNBT && <span className="tw-text-xs tw-text-gray-500">/{itemMaxScore}</span>}
                            </span>
                            {item.peningkatan > 0 && (
                              <span className="tw-text-xs tw-bg-green-100 tw-text-green-700 tw-px-2 tw-py-1 tw-rounded-full tw-flex tw-items-center tw-gap-1 tw-font-semibold">
                                <TrendingUp size={12} />
                                +{item.peningkatan}
                              </span>
                            )}
                          </div>
                        </div>
                        <ProgressBar 
                          now={normalizedValue} 
                          variant={getProgressColor(item.nilai, itemMaxScore)} 
                          style={{ height: '8px' }}
                        />
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <Card className="tw-border-0 tw-shadow-lg">
          <Card.Body className="tw-p-4">
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
              <h5 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                <Award className="tw-mr-2 tw-text-purple-600" size={20} />
                Pencapaian
              </h5>
              <Badge bg="success" className="tw-px-3 tw-py-1">
                {data.achievements.filter(a => a.completed).length}/{data.achievements.length} Selesai
              </Badge>
            </div>
            <Row className="tw-g-3">
              {data.achievements.map((achievement, idx) => (
                <Col key={idx} xs={12} md={4}>
                  <div className={`tw-p-4 tw-rounded-lg tw-border-2 tw-transition-all ${
                    achievement.completed 
                      ? 'tw-bg-gradient-to-br tw-from-green-50 tw-to-emerald-50 tw-border-green-300' 
                      : 'tw-bg-gray-50 tw-border-gray-200'
                  }`}>
                    <div className="tw-flex tw-items-start tw-gap-3 tw-mb-3">
                      {achievement.completed ? (
                        <CheckCircle size={24} className="tw-text-green-600 tw-flex-shrink-0" />
                      ) : (
                        <Target size={24} className="tw-text-gray-400 tw-flex-shrink-0" />
                      )}
                      <div className="tw-flex-1">
                        <h6 className="tw-font-bold tw-text-sm tw-mb-1 tw-text-gray-800">
                          {achievement.title}
                        </h6>
                        <p className="tw-text-xs tw-text-gray-600 tw-mb-0">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    <ProgressBar 
                      now={achievement.progress} 
                      variant={achievement.completed ? 'success' : 'secondary'}
                      style={{ height: '6px' }}
                      label={achievement.completed ? '' : `${achievement.progress}%`}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Recommended Resources */}
      {data.recommendedResources && data.recommendedResources.length > 0 && (
        <Card className="tw-border-0 tw-shadow-lg">
          <Card.Body className="tw-p-4">
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
              <h5 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                <Lightbulb className="tw-mr-2 tw-text-purple-600" size={20} />
                Rekomendasi Belajar
              </h5>
              <Badge bg="info" className="tw-px-3 tw-py-1">
                Untuk Kamu
              </Badge>
            </div>
            <Row className="tw-g-3">
              {data.recommendedResources.map((resource, idx) => (
                <Col key={idx} xs={12} md={4}>
                  <div className="tw-p-4 tw-bg-white tw-rounded-lg tw-border-2 tw-border-gray-200 hover:tw-border-purple-400 hover:tw-shadow-md tw-transition-all">
                    <div className="tw-flex tw-items-start tw-gap-3 tw-mb-3">
                      {getResourceIcon(resource.type)}
                      <div className="tw-flex-1">
                        <Badge 
                          bg={resource.type === 'video' ? 'danger' : resource.type === 'quiz' ? 'primary' : 'success'}
                          className="tw-mb-2"
                        >
                          {resource.type === 'video' ? 'Video' : resource.type === 'quiz' ? 'Quiz' : 'Bacaan'}
                        </Badge>
                        <div className="tw-text-xs tw-text-purple-600 tw-font-semibold tw-mb-1">
                          {resource.subject}
                        </div>
                        <h6 className="tw-font-bold tw-text-sm tw-mb-2 tw-text-gray-800 tw-line-clamp-2">
                          {resource.title}
                        </h6>
                        <div className="tw-text-xs tw-text-gray-600">
                          <div className="tw-font-medium tw-mb-1">{resource.topic}</div>
                          {resource.duration && <div>⏱️ {resource.duration}</div>}
                          {resource.questions && <div>📝 {resource.questions} soal</div>}
                          {resource.pages && <div>📄 {resource.pages} halaman</div>}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="tw-w-full"
                    >
                      Mulai Belajar
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Recommended Programs */}
      {data.recommendedPrograms && data.recommendedPrograms.length > 0 && (
        <Card className="tw-border-0 tw-shadow-lg">
          <Card.Body className="tw-p-4">
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
              <h5 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                <School className="tw-mr-2 tw-text-purple-600" size={20} />
                Program Studi Rekomendasi
              </h5>
              <Badge bg="secondary" className="tw-px-3 tw-py-1">
                Berdasarkan Skormu
              </Badge>
            </div>
            <div className="tw-space-y-3">
              {data.recommendedPrograms.map((program, idx) => (
                <div 
                  key={idx} 
                  className="tw-p-4 tw-bg-gradient-to-r tw-from-indigo-50 tw-to-blue-50 tw-rounded-lg tw-border-2 tw-border-indigo-200 hover:tw-shadow-md tw-transition-all"
                >
                  <div className="tw-flex tw-justify-between tw-items-start tw-mb-2">
                    <div className="tw-flex-1">
                      <h6 className="tw-font-bold tw-text-gray-800 tw-mb-1">{program.program}</h6>
                      <div className="tw-text-sm tw-text-gray-600 tw-mb-2">
                        <span className="tw-font-medium">Min. Skor:</span> {program.minScore} • {program.requirement}
                      </div>
                    </div>
                    <div className="tw-text-center">
                      <div 
                        className="tw-text-2xl tw-font-bold"
                        style={{ color: getScoreColor(program.match, 100) }}
                      >
                        {program.match}%
                      </div>
                      <div className="tw-text-xs tw-text-gray-500">Match</div>
                    </div>
                  </div>
                  <ProgressBar 
                    now={program.match} 
                    variant={getProgressColor(program.match, 100)}
                    style={{ height: '8px' }}
                  />
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Topic Performance Details */}
      {topicDataArray.length > 0 && (
        <Card className="tw-border-0 tw-shadow-lg">
          <Card.Body className="tw-p-4">
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
              <h5 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                <PieChart className="tw-mr-2 tw-text-purple-600" size={20} />
                Performa Per Topik
              </h5>
              <Badge bg="secondary" className="tw-px-3 tw-py-1">
                {topicDataArray.length} Topik
              </Badge>
            </div>
            
            <Row className="tw-g-3">
              {topicDataArray.slice(0, 12).map((topic, idx) => {
                const topicMaxScore = topic.maxScore || maxScore;
                return (
                  <Col key={idx} xs={12} sm={6} lg={4} xl={3}>
                    <div className="tw-p-3 tw-bg-white tw-rounded-lg tw-border-2 tw-border-gray-200 hover:tw-border-purple-400 tw-transition-all hover:tw-shadow-md">
                      <div className="tw-flex tw-items-start tw-justify-between tw-mb-2">
                        <div className="tw-flex-1">
                          <div className="tw-text-xs tw-text-purple-600 tw-font-semibold tw-mb-1">
                            {topic.category}
                          </div>
                          <div className="tw-font-semibold tw-text-sm tw-text-gray-800 tw-line-clamp-2">
                            {topic.topic}
                          </div>
                        </div>
                        <div 
                          className="tw-text-xl tw-font-bold tw-ml-2" 
                          style={{ color: getScoreColor(topic.displayScore, topicMaxScore) }}
                        >
                          {topic.displayScore}
                          {isSNBT && <div className="tw-text-xs tw-text-gray-500 tw-font-normal">/{topicMaxScore}</div>}
                        </div>
                      </div>
                      
                      <div className="tw-mb-2">
                        <ProgressBar 
                          now={topic.normalizedScore} 
                          variant={getProgressColor(topic.displayScore, topicMaxScore)}
                          style={{ height: '6px' }}
                        />
                      </div>
                      
                      <div className="tw-flex tw-justify-between tw-text-xs tw-text-gray-500">
                        <span>Avg: {topic.avg}</span>
                        <span>{topic.completed}/{topic.total} soal</span>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>

            {topicDataArray.length > 12 && (
              <div className="tw-text-center tw-mt-4">
                <Button 
                  variant="outline-primary"
                  size="sm"
                  onClick={onViewDetails}
                >
                  Lihat Semua {topicDataArray.length} Topik
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* View Full Details Button */}
      <Card className="tw-border-0 tw-shadow-lg tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600">
        <Card.Body className="tw-p-4">
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-between tw-gap-3">
            <div className="tw-text-white tw-text-center sm:tw-text-left">
              <h5 className="tw-font-bold tw-mb-1">Lihat Dashboard Lengkap</h5>
              <p className="tw-text-sm tw-text-purple-100 tw-mb-0">
                Analisis mendalam dengan grafik interaktif dan insight detail
              </p>
            </div>
            <Button
              onClick={onViewDetails}
              variant="light"
              size="lg"
              className="tw-px-6 tw-font-semibold tw-whitespace-nowrap"
            >
              Buka Dashboard {data.examType}
              <ChevronRight size={20} className="tw-inline tw-ml-2" />
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

// ========== STUDENT DASHBOARD ==========
const StudentDashboard: React.FC = () => {
  const router = useRouter();
  const { id: userId } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [examDashboards, setExamDashboards] = useState<ExamDashboardData[]>([]);
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [courses, setCourses] = useState<UserCourseProgress[]>([]);
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [tryOuts, setTryOuts] = useState<UserEntitlement[]>([]);
  const [userScores, setUserScores] = useState<Record<number, UserExamScore>>({});
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch exam dashboards
        const dashboardResponse = await axios.get(`${apiUrl}/dashboard/student`, { headers });
        const dashboards = dashboardResponse.data.examDashboards || [];
        setExamDashboards(dashboards);
        
        // Set default selected exam type
        if (dashboards.length > 0 && !selectedExamType) {
          setSelectedExamType(dashboards[0].examType);
        }

        // Fetch courses progress
        const coursesResponse = await axios.get(`${apiUrl}/courses/progress`, { headers });
        setCourses(coursesResponse.data.data || []);

        // Fetch user entitlements
        const entitlementsResponse = await axios.get<UserEntitlement[]>(
          `${apiUrl}/user-entitlements/exam-schedules`,
          { headers }
        );
        setTryOuts(entitlementsResponse.data || []);

        // Fetch user scores
        const scoresResponse = await axios.get(`${apiUrl}/user-exam-scores/by-schedule`, { headers });
        const scoresMap: Record<number, UserExamScore> = {};
        if (Array.isArray(scoresResponse.data)) {
          scoresResponse.data.forEach((score: UserExamScore) => {
            scoresMap[score.exam_schedule_id] = score;
          });
        }
        setUserScores(scoresMap);

        // Fetch live classes
        const classesResponse = await fetch(`${apiUrl}/classes/live?classtype=all`, { headers });
        const classesData = await classesResponse.json();
        if (classesData.success && userId) {
          const enrolledClasses = classesData.data.classes.filter((cls: LiveClass) =>
            cls.student_list_ids.includes(parseInt(userId))
          );
          setClasses(enrolledClasses);
        }

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.error || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userId, apiUrl]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasCompletedExam = (examScheduleId: number): boolean => {
    return userScores[examScheduleId]?.has_completed || false;
  };

  const getExamScore = (examScheduleId: number): UserExamScore | null => {
    return userScores[examScheduleId] || null;
  };

  const notCompletedTryOuts = tryOuts.filter(ent => !hasCompletedExam(ent.exam_schedule_id));
  const completedTryOuts = tryOuts.filter(ent => hasCompletedExam(ent.exam_schedule_id));

  // Get selected exam dashboard data
  const selectedDashboard = examDashboards.find(d => d.examType === selectedExamType);

  if (loading) {
    return (
      <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-py-20">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <span className="tw-mt-3 tw-text-gray-600 tw-font-medium">Memuat dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tw-text-center tw-py-20">
        <Activity size={48} className="tw-mx-auto tw-mb-3 tw-text-gray-400" />
        <h5 className="tw-text-gray-700 tw-font-bold">Error loading dashboard</h5>
        <p className="tw-text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard Siswa</title>
      </Head>
      
      <div className="tw-px-3 tw-py-4">
        {/* Header */}
        <div className="tw-mb-6 tw-text-center">
          <h1 className="tw-text-4xl tw-font-bold tw-text-gray-800 tw-mb-2 tw-flex tw-items-center tw-justify-center tw-gap-3">
            <Rocket className="tw-text-purple-600" size={36} />
            Dashboard Siswa
          </h1>
          <p className="tw-text-gray-600 tw-text-lg">Pantau progress belajar dan performa ujianmu di sini</p>
        </div>

        {/* Exam Dashboard Section */}
        {examDashboards.length > 0 && (
          <div className="tw-mb-6">
            {/* Exam Type Selector */}
            {examDashboards.length > 1 && (
              <div className="tw-mb-4 tw-flex tw-justify-center">
                <Card className="tw-border-0 tw-shadow-md tw-inline-block">
                  <Card.Body className="tw-p-3">
                    <div className="tw-flex tw-items-center tw-gap-3">
                      <Filter className="tw-text-purple-600" size={20} />
                      <span className="tw-font-semibold tw-text-gray-700">Pilih Jenis Ujian:</span>
                      <Dropdown as={ButtonGroup}>
                        <Button 
                          variant="purple"
                          className="tw-bg-purple-600 hover:tw-bg-purple-700 tw-border-0 tw-px-4"
                        >
                          {selectedExamType || 'Pilih Ujian'}
                        </Button>
                        <Dropdown.Toggle 
                          split 
                          variant="purple" 
                          className="tw-bg-purple-600 hover:tw-bg-purple-700 tw-border-0"
                        />
                        <Dropdown.Menu>
                          {examDashboards.map((exam) => (
                            <Dropdown.Item
                              key={exam.examType}
                              active={selectedExamType === exam.examType}
                              onClick={() => setSelectedExamType(exam.examType)}
                            >
                              <Trophy size={16} className="tw-mr-2 tw-inline" />
                              {exam.examType}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            )}

            {/* Display Selected Exam Dashboard */}
            {selectedDashboard && (
              <EnhancedExamDashboard
                data={selectedDashboard}
                onViewDetails={() => router.push(`/panel/exam/dashboard?type=${selectedDashboard.examType}`)}
              />
            )}
          </div>
        )}

        {/* Courses */}
        {courses.length > 0 && (
          <Card className="tw-border-0 tw-shadow-lg tw-mb-6">
            <Card.Body className="tw-p-5">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h4 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                  <BookOpen className="tw-mr-2 tw-text-purple-600" size={24} />
                  Kursus Saya
                </h4>
                <Badge bg="purple" className="tw-px-4 tw-py-2 tw-text-lg">
                  {courses.length} Kursus
                </Badge>
              </div>

              <Row className="tw-g-4">
                {courses.slice(0, 6).map((course) => (
                  <Col key={course.id} xs={12} sm={6} lg={4}>
                    <Card className="tw-h-full tw-border-2 tw-border-gray-200 hover:tw-border-purple-400 hover:tw-shadow-xl tw-transition-all">
                      <div className="tw-relative tw-h-36 tw-bg-gradient-to-br tw-from-purple-500 tw-to-purple-700">
                        {course.imageurl && (
                          <img 
                            src={course.imageurl} 
                            alt={course.title}
                            className="tw-w-full tw-h-full tw-object-cover"
                          />
                        )}
                        <div className="tw-absolute tw-top-3 tw-right-3">
                          <Badge 
                            bg={course.overall_progress_percentage >= 100 ? 'success' : 'primary'}
                            className="tw-px-3 tw-py-2 tw-text-sm tw-font-bold"
                          >
                            {Math.round(course.overall_progress_percentage)}%
                          </Badge>
                        </div>
                      </div>
                      <Card.Body className="tw-p-4">
                        <h6 className="tw-font-bold tw-mb-2 tw-line-clamp-2 tw-text-gray-800">
                          {course.title}
                        </h6>
                        <p className="tw-text-sm tw-text-gray-600 tw-mb-3 tw-line-clamp-2">
                          {course.description}
                        </p>
                        <div className="tw-text-sm tw-text-gray-500 tw-mb-3 tw-flex tw-justify-between">
                          <span>{course.finished_materials}/{course.material} Materi</span>
                          <span>{course.finished_quiz_topics}/{course.quiz} Quiz</span>
                        </div>
                        <Button
                          variant="primary"
                          onClick={() => router.push(`/course/${course.course_string}`)}
                          className="tw-w-full tw-bg-purple-600 hover:tw-bg-purple-700 tw-border-0 tw-font-semibold"
                        >
                          {course.overall_progress_percentage >= 100 ? (
                            <>
                              <CheckCircle size={16} className="tw-mr-2 tw-inline" />
                              Review Kursus
                            </>
                          ) : (
                            <>
                              <PlayCircle size={16} className="tw-mr-2 tw-inline" />
                              Lanjutkan Belajar
                            </>
                          )}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {courses.length > 6 && (
                <div className="tw-text-center tw-mt-5">
                  <Button
                    variant="outline-primary"
                    size="lg"
                    onClick={() => router.push('/all-courses')}
                    className="tw-px-6"
                  >
                    Lihat Semua {courses.length} Kursus
                    <ChevronRight size={18} className="tw-inline tw-ml-2" />
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Classes */}
        {classes.length > 0 && (
          <Card className="tw-border-0 tw-shadow-lg tw-mb-6">
            <Card.Body className="tw-p-5">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h4 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                  <GraduationCap className="tw-mr-2 tw-text-purple-600" size={24} />
                  Kelas Saya
                </h4>
                <Badge bg="success" className="tw-px-4 tw-py-2 tw-text-lg">
                  {classes.length} Kelas Aktif
                </Badge>
              </div>

              <div className="tw-space-y-4">
                {classes.slice(0, 5).map((cls) => (
                  <div 
                    key={cls.id} 
                    className="tw-p-4 tw-border-2 tw-border-gray-200 tw-rounded-xl hover:tw-border-green-400 hover:tw-shadow-lg tw-transition-all tw-bg-gradient-to-r tw-from-green-50 tw-to-emerald-50"
                  >
                    <div className="tw-flex tw-justify-between tw-items-start tw-mb-3">
                      <h5 className="tw-font-bold tw-mb-1 tw-text-gray-800">{cls.name}</h5>
                      <Badge bg="success" pill className="tw-px-3 tw-py-1">
                        <CheckCircle size={14} className="tw-inline tw-mr-1" />
                        Terdaftar
                      </Badge>
                    </div>
                    <p className="tw-text-sm tw-text-gray-700 tw-mb-3 tw-line-clamp-2">
                      {cls.description}
                    </p>
                    <div className="tw-flex tw-flex-wrap tw-gap-4 tw-text-sm tw-text-gray-600">
                      <div className="tw-flex tw-items-center tw-bg-white tw-px-3 tw-py-1 tw-rounded-full">
                        <User size={16} className="tw-mr-2 tw-text-green-600" />
                        <span className="tw-font-medium">{cls.teacher_name}</span>
                      </div>
                      <div className="tw-flex tw-items-center tw-bg-white tw-px-3 tw-py-1 tw-rounded-full">
                        <Calendar size={16} className="tw-mr-2 tw-text-green-600" />
                        <span>{formatDateTime(cls.start_date)}</span>
                      </div>
                      <div className="tw-flex tw-items-center tw-bg-white tw-px-3 tw-py-1 tw-rounded-full">
                        <BookOpen size={16} className="tw-mr-2 tw-text-green-600" />
                        <span>{cls.course_name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {classes.length > 5 && (
                <div className="tw-text-center tw-mt-5">
                  <Button 
                    variant="outline-success" 
                    size="lg"
                    onClick={() => router.push('/all-courses')}
                    className="tw-px-6"
                  >
                    Lihat Semua {classes.length} Kelas
                    <ChevronRight size={18} className="tw-inline tw-ml-2" />
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Try Outs */}
        {tryOuts.length > 0 && (
          <Card className="tw-border-0 tw-shadow-lg tw-mb-6">
            <Card.Body className="tw-p-5">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h4 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                  <Target className="tw-mr-2 tw-text-purple-600" size={24} />
                  Try Out Saya
                </h4>
                <Badge bg="warning" text="dark" className="tw-px-4 tw-py-2 tw-text-lg">
                  {tryOuts.length} Try Out
                </Badge>
              </div>

              {notCompletedTryOuts.length > 0 && (
                <div className="tw-mb-5">
                  <h5 className="tw-font-bold tw-mb-3 tw-text-orange-600 tw-flex tw-items-center">
                    <PlayCircle className="tw-mr-2" size={20} />
                    Belum Dikerjakan ({notCompletedTryOuts.length})
                  </h5>
                  <Row className="tw-g-4">
                    {notCompletedTryOuts.slice(0, 3).map((tryOut) => (
                      <Col key={tryOut.id} xs={12} sm={6} lg={4}>
                        <Card className="tw-border-2 tw-border-orange-300 tw-bg-gradient-to-br tw-from-orange-50 tw-to-yellow-50 hover:tw-shadow-xl tw-transition-all tw-h-full">
                          <Card.Body className="tw-p-4">
                            <Badge 
                              bg={tryOut.exam_schedule.isfree ? 'success' : 'primary'} 
                              className="tw-mb-3 tw-px-3 tw-py-2"
                            >
                              {tryOut.exam_schedule.isfree ? '🎉 Gratis' : tryOut.exam_schedule.exam_type}
                            </Badge>
                            <h6 className="tw-font-bold tw-mb-3 tw-line-clamp-2 tw-text-gray-800">
                              {tryOut.exam_schedule.name}
                            </h6>
                            <div className="tw-text-sm tw-text-gray-600 tw-mb-4 tw-flex tw-items-center">
                              <Calendar size={14} className="tw-mr-2" />
                              Akses: {new Date(tryOut.granted_at).toLocaleDateString('id-ID')}
                            </div>
                            <Button
                              variant="warning"
                              onClick={() => router.push('/exam/tryout')}
                              className="tw-w-full tw-font-semibold"
                            >
                              <PlayCircle size={16} className="tw-inline tw-mr-2" />
                              Mulai Try Out
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {completedTryOuts.length > 0 && (
                <div>
                  <h5 className="tw-font-bold tw-mb-3 tw-text-green-600 tw-flex tw-items-center">
                    <CheckCircle className="tw-mr-2" size={20} />
                    Sudah Selesai ({completedTryOuts.length})
                  </h5>
                  <div className="tw-space-y-3">
                    {completedTryOuts.slice(0, 3).map((tryOut) => {
                      const score = getExamScore(tryOut.exam_schedule_id);
                      return (
                        <div 
                          key={tryOut.id} 
                          className="tw-p-4 tw-bg-gradient-to-r tw-from-green-50 tw-to-emerald-50 tw-border-2 tw-border-green-300 tw-rounded-lg hover:tw-shadow-md tw-transition-all"
                        >
                          <div className="tw-flex tw-justify-between tw-items-center">
                            <div className="tw-flex-1">
                              <h6 className="tw-font-bold tw-mb-2 tw-text-gray-800">
                                {tryOut.exam_schedule.name}
                              </h6>
                              <div className="tw-text-sm tw-text-gray-600 tw-flex tw-items-center tw-gap-4">
                                <span className="tw-flex tw-items-center">
                                  <Trophy size={14} className="tw-mr-1 tw-text-green-600" />
                                  Skor: <span className="tw-font-bold tw-text-green-700 tw-ml-1">{score?.total_score}</span>
                                </span>
                                {score?.completion_time && (
                                  <span className="tw-flex tw-items-center">
                                    <Calendar size={14} className="tw-mr-1 tw-text-green-600" />
                                    {new Date(score.completion_time).toLocaleDateString('id-ID')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <CheckCircle className="tw-text-green-600 tw-ml-4" size={32} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {tryOuts.length > 6 && (
                <div className="tw-text-center tw-mt-5">
                  <Button 
                    variant="outline-warning" 
                    size="lg"
                    onClick={() => router.push('/exam/tryout')}
                    className="tw-px-6"
                  >
                    Lihat Semua {tryOuts.length} Try Out
                    <ChevronRight size={18} className="tw-inline tw-ml-2" />
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Empty State */}
        {examDashboards.length === 0 && 
         courses.length === 0 && 
         classes.length === 0 && 
         tryOuts.length === 0 && (
          <Card className="tw-border-0 tw-shadow-xl">
            <Card.Body className="tw-text-center tw-py-20">
              <div className="tw-bg-purple-100 tw-w-32 tw-h-32 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-6">
                <Rocket size={64} className="tw-text-purple-600" />
              </div>
              <h3 className="tw-mb-3 tw-font-bold tw-text-gray-800">Belum Ada Aktivitas</h3>
              <p className="tw-text-gray-600 tw-mb-6 tw-text-lg">
                Mulai perjalanan belajarmu dengan mengikuti kursus atau try out
              </p>
              <div className="tw-flex tw-justify-center tw-gap-4">
                <Button 
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/all-courses')}
                  className="tw-bg-purple-600 hover:tw-bg-purple-700 tw-border-0 tw-px-6"
                >
                  <BookOpen size={18} className="tw-inline tw-mr-2" />
                  Lihat Kursus
                </Button>
                <Button 
                  variant="outline-primary"
                  size="lg"
                  onClick={() => router.push('/exam/tryout')}
                  className="tw-px-6"
                >
                  <Target size={18} className="tw-inline tw-mr-2" />
                  Lihat Try Out
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </>
  );
};

// ========== MAIN COMPONENT ==========
export default function AdminDashboard() {
  const { isAuthenticated, role, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Dashboard</title>
        </Head>
        <div className="tw-p-5 tw-text-center tw-py-20">
          <h5 className="tw-font-bold tw-text-gray-700">Please login to access the dashboard</h5>
        </div>
      </>
    );
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <DashboardLayout 
      userRole={role as UserRole} 
      onLogout={handleLogout}
    >
      <Head>
        <title>Dashboard Siswa</title>
      </Head>
      <div className="dashboard-container">
        {role === 'student' ? (
          <StudentDashboard />
        ) : (
          <div className="tw-text-center tw-py-20">
            <h5 className="tw-font-bold">Admin/Teacher Dashboard</h5>
            <p className="tw-text-gray-600">This is the admin/teacher view</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}