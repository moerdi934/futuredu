// pages/panel/index.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Row, Col, Card, Badge, Spinner, Button, ProgressBar } from 'react-bootstrap';
import { 
  Trophy, Star, Award, Users, BookOpen, GraduationCap, Target, 
  PlayCircle, CheckCircle, Calendar, User, Activity, TrendingUp,
  Clock, ChevronRight, Zap, Brain, Rocket, Flame, Heart
} from 'lucide-react';
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { ButtonGradient } from '../../components/button/ButtonTemplate';
import axios from 'axios';

// ========== TYPES ==========
type UserRole = 'admin' | 'teacher' | 'student';

interface SubjectPerformanceData {
  name: string;
  nilai: number;
  target: number;
}

interface WeekData {
  name: string;
  nilai: number;
  target: number | null;
}

interface RadarData {
  subject: string;
  score: number;
}

interface RecentResultData {
  id: number;
  title: string;
  score: number;
  date: string;
}

interface ProgressDetail {
  nama: string;
  nilai: number;
  peningkatan: number;
}

interface TopicData {
  topic: string;
  score: number;
  avg: number;
  total: number;
  completed: number;
}

interface CompetitiveAnalysis {
  name: string;
  score: number;
}

interface ExamDashboardData {
  examType: string;
  hasData: boolean;
  rank?: string | number;
  averageScore?: string | number;
  percentileRank?: string | number;
  totalParticipants?: string | number;
  subjectPerformance?: SubjectPerformanceData[];
  weeklyProgress?: WeekData[];
  recentResults?: RecentResultData[];
  radarData?: RadarData[];
  progressDetail?: ProgressDetail[];
  topicData?: { [key: string]: TopicData[] };
  competitiveAnalysis?: CompetitiveAnalysis[];
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
const CHART_COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

// ========== EXAM DASHBOARD CARD COMPONENT ==========
interface ExamDashboardCardProps {
  data: ExamDashboardData;
  onViewDetails: () => void;
  isSingleCard?: boolean;
}

const ExamDashboardCard: React.FC<ExamDashboardCardProps> = ({ data, onViewDetails, isSingleCard = false }) => {
  if (!data.hasData) return null;

  const getProgressColor = (score: number): string => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'info';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return '#10B981';
    if (score >= 70) return '#3B82F6';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  // Check if we have enough subjects for radar chart (minimum 3)
  const shouldUseRadar = data.radarData && data.radarData.length >= 3;

  // Prepare data for bar chart when < 3 subjects
  const subjectBarData = data.radarData?.map((item, index) => ({
    ...item,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  })) || [];

  return (
    <Card className={`tw-border-0 tw-shadow-lg tw-h-full hover:tw-shadow-xl tw-transition-shadow ${isSingleCard ? 'tw-max-w-6xl tw-mx-auto' : ''}`}>
      <div className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-purple-700 tw-p-4 tw-text-white">
        <div className="tw-flex tw-justify-between tw-items-center">
          <h4 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
            <Trophy className="tw-mr-2" size={24} />
            Dashboard {data.examType}
          </h4>
          <Badge bg="light" text="dark" className="tw-px-3 tw-py-2">
            {data.examType}
          </Badge>
        </div>
      </div>

      <Card.Body className={`tw-p-4 ${isSingleCard ? 'lg:tw-p-5' : ''}`}>
        {/* Stats Grid */}
        <Row className="tw-mb-4 tw-g-3">
          {data.rank && (
            <Col xs={6} md={isSingleCard ? 6 : 3} lg={isSingleCard ? 3 : 3}>
              <div className="tw-text-center tw-p-3 tw-bg-purple-50 tw-rounded-lg tw-border tw-border-purple-200">
                <Trophy className="tw-mx-auto tw-mb-2 tw-text-purple-600" size={24} />
                <div className="tw-text-2xl tw-font-bold tw-text-purple-700">#{data.rank}</div>
                <div className="tw-text-xs tw-text-gray-600">Peringkat</div>
              </div>
            </Col>
          )}
          {data.averageScore !== undefined && (
            <Col xs={6} md={isSingleCard ? 6 : 3} lg={isSingleCard ? 3 : 3}>
              <div className="tw-text-center tw-p-3 tw-bg-purple-50 tw-rounded-lg tw-border tw-border-purple-200">
                <Star className="tw-mx-auto tw-mb-2 tw-text-purple-600" size={24} />
                <div className="tw-text-2xl tw-font-bold tw-text-purple-700">{data.averageScore}</div>
                <div className="tw-text-xs tw-text-gray-600">Rata-rata</div>
              </div>
            </Col>
          )}
          {data.percentileRank && (
            <Col xs={6} md={isSingleCard ? 6 : 3} lg={isSingleCard ? 3 : 3}>
              <div className="tw-text-center tw-p-3 tw-bg-purple-50 tw-rounded-lg tw-border tw-border-purple-200">
                <Award className="tw-mx-auto tw-mb-2 tw-text-purple-600" size={24} />
                <div className="tw-text-2xl tw-font-bold tw-text-purple-700">{data.percentileRank}%</div>
                <div className="tw-text-xs tw-text-gray-600">Persentil</div>
              </div>
            </Col>
          )}
          {data.totalParticipants && (
            <Col xs={6} md={isSingleCard ? 6 : 3} lg={isSingleCard ? 3 : 3}>
              <div className="tw-text-center tw-p-3 tw-bg-purple-50 tw-rounded-lg tw-border tw-border-purple-200">
                <Users className="tw-mx-auto tw-mb-2 tw-text-purple-600" size={24} />
                <div className="tw-text-2xl tw-font-bold tw-text-purple-700">{data.totalParticipants}</div>
                <div className="tw-text-xs tw-text-gray-600">Peserta</div>
              </div>
            </Col>
          )}
        </Row>

        {/* Charts Row */}
        <Row className="tw-mb-4">
          {/* Subject Performance Chart */}
          {data.radarData && data.radarData.length > 0 && (
            <Col md={isSingleCard && !shouldUseRadar ? 12 : 6} className="tw-mb-4 tw-mb-md-0">
              <div className="tw-bg-gray-50 tw-rounded-lg tw-p-3 tw-border tw-border-gray-200">
                <h6 className="tw-font-semibold tw-mb-3 tw-text-gray-700 tw-flex tw-items-center">
                  <Activity className="tw-mr-2 tw-text-purple-600" size={18} />
                  Performa Mata Pelajaran
                </h6>
                <ResponsiveContainer width="100%" height={220}>
                  {shouldUseRadar ? (
                    // Radar chart for 3+ subjects
                    <RadarChart data={data.radarData}>
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} />
                      <Radar 
                        name="Score" 
                        dataKey="score" 
                        stroke="#8B5CF6" 
                        fill="#8B5CF6" 
                        fillOpacity={0.6} 
                        strokeWidth={2}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }} 
                      />
                    </RadarChart>
                  ) : (
                    // Bar chart for < 3 subjects
                    <BarChart data={subjectBarData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }} 
                      />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={isSingleCard ? 80 : 50}>
                        {subjectBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Col>
          )}

          {/* Competitive Analysis - All same color except user */}
          {data.competitiveAnalysis && data.competitiveAnalysis.length > 0 && (
            <Col md={isSingleCard && !shouldUseRadar ? 12 : 6}>
              <div className="tw-bg-gray-50 tw-rounded-lg tw-p-3 tw-border tw-border-gray-200">
                <h6 className="tw-font-semibold tw-mb-3 tw-text-gray-700 tw-flex tw-items-center">
                  <TrendingUp className="tw-mr-2 tw-text-purple-600" size={18} />
                  Perbandingan Kompetitif
                </h6>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={data.competitiveAnalysis}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                    <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 10, fill: '#6B7280' }} />
                    <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }} 
                    />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                      {data.competitiveAnalysis.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === 'Kamu' ? '#EC4899' : '#9CA3AF'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Col>
          )}
        </Row>

        {/* Recent Results */}
        {data.recentResults && data.recentResults.length > 0 && (
          <div className="tw-mb-4">
            <h6 className="tw-font-semibold tw-mb-3 tw-text-gray-700 tw-flex tw-items-center">
              <Clock className="tw-mr-2 tw-text-purple-600" size={18} />
              Hasil Try Out Terbaru
            </h6>
            <div className="tw-space-y-2">
              {data.recentResults.slice(0, 3).map((result) => (
                <div key={result.id} className="tw-p-3 tw-bg-white tw-rounded-lg tw-border tw-border-gray-200">
                  <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                    <span className="tw-font-medium tw-text-sm">{result.title}</span>
                    <span className="tw-text-xs tw-text-gray-500">{result.date}</span>
                  </div>
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <ProgressBar 
                      now={result.score} 
                      variant={getProgressColor(result.score)}
                      className="tw-flex-1"
                      style={{ height: '8px' }}
                    />
                    <span className="tw-font-semibold tw-text-sm" style={{ color: getScoreColor(result.score) }}>
                      {result.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Detail */}
        {data.progressDetail && data.progressDetail.length > 0 && (
          <div className="tw-mb-4">
            <h6 className="tw-font-semibold tw-mb-3 tw-text-gray-700 tw-flex tw-items-center">
              <Brain className="tw-mr-2 tw-text-purple-600" size={18} />
              Detail Perkembangan
            </h6>
            <div className="tw-space-y-2">
              {data.progressDetail.slice(0, 3).map((item, idx) => (
                <div key={idx} className="tw-p-3 tw-bg-white tw-rounded-lg tw-border tw-border-gray-200">
                  <div className="tw-flex tw-justify-between tw-items-center tw-mb-1">
                    <span className="tw-text-sm tw-font-medium">{item.nama}</span>
                    <span className="tw-font-semibold" style={{ color: getScoreColor(item.nilai) }}>
                      {item.nilai}/100
                    </span>
                  </div>
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <ProgressBar 
                      now={item.nilai} 
                      variant={getProgressColor(item.nilai)} 
                      className="tw-flex-1"
                      style={{ height: '6px' }}
                    />
                    {item.peningkatan > 0 && (
                      <span className="tw-text-xs tw-text-green-600 tw-flex tw-items-center">
                        <TrendingUp size={12} className="tw-mr-1" />
                        +{item.peningkatan}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Details Button */}
        <Button
          onClick={onViewDetails}
          variant="primary"
          className="tw-w-full tw-bg-purple-600 hover:tw-bg-purple-700 tw-border-0 tw-py-2 tw-font-medium"
        >
          Lihat Detail Dashboard {data.examType}
          <ChevronRight size={18} className="tw-inline tw-ml-1" />
        </Button>
      </Card.Body>
    </Card>
  );
};

// ========== STUDENT DASHBOARD ==========
const StudentDashboard: React.FC = () => {
  const router = useRouter();
  const { id: userId } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [examDashboards, setExamDashboards] = useState<ExamDashboardData[]>([]);
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
        setExamDashboards(dashboardResponse.data.examDashboards || []);

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

  if (loading) {
    return (
      <div className="tw-flex tw-flex-col tw-justify-center tw-items-center tw-py-20">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <span className="tw-mt-3 tw-text-gray-600">Memuat dashboard...</span>
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
        <title>Dashboard</title>
      </Head>
      
      <div className="tw-px-2 tw-py-2">
        {/* Header */}
        <div className="tw-mb-5 tw-text-center">
          <h1 className="tw-text-3xl tw-font-bold tw-text-gray-800 tw-mb-2">Dashboard Siswa</h1>
          <p className="tw-text-gray-600">Pantau progress belajarmu di sini</p>
        </div>

        {/* Exam Dashboards */}
        {examDashboards.length > 0 && (
          <div className="tw-mb-5">
            <h4 className="tw-font-bold tw-mb-3 tw-text-gray-800 tw-flex tw-items-center tw-justify-center">
              <Trophy className="tw-mr-2 tw-text-purple-600" size={24} />
              Performa Ujian
            </h4>
            <Row className="tw-g-4">
              {examDashboards.map((examData) => (
                <Col 
                  key={examData.examType} 
                  xs={12} 
                  md={examDashboards.length === 1 ? 12 : examDashboards.length === 2 ? 6 : 6}
                  lg={examDashboards.length === 1 ? 12 : examDashboards.length === 2 ? 6 : 6}
                  xl={examDashboards.length === 1 ? 12 : examDashboards.length === 2 ? 6 : 4}
                >
                  <ExamDashboardCard 
                    data={examData}
                    onViewDetails={() => router.push(`/panel/exam/dashboard?type=${examData.examType}`)}
                    isSingleCard={examDashboards.length === 1}
                  />
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Courses */}
        {courses.length > 0 && (
          <Card className="tw-border-0 tw-shadow-lg tw-mb-5">
            <Card.Body className="tw-p-4">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h5 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                  <BookOpen className="tw-mr-2 tw-text-purple-600" size={22} />
                  Kursus Saya
                </h5>
                <Badge bg="purple" className="tw-px-3 tw-py-2">
                  {courses.length} Kursus
                </Badge>
              </div>

              <Row className="tw-g-3">
                {courses.slice(0, 6).map((course) => (
                  <Col key={course.id} xs={12} sm={6} lg={4}>
                    <Card className="tw-h-full tw-border hover:tw-shadow-md tw-transition-shadow">
                      <div className="tw-relative tw-h-32 tw-bg-gradient-to-br tw-from-purple-500 tw-to-purple-700">
                        {course.imageurl && (
                          <img 
                            src={course.imageurl} 
                            alt={course.title}
                            className="tw-w-full tw-h-full tw-object-cover"
                          />
                        )}
                        <div className="tw-absolute tw-top-2 tw-right-2">
                          <Badge bg={course.overall_progress_percentage >= 100 ? 'success' : 'primary'}>
                            {Math.round(course.overall_progress_percentage)}%
                          </Badge>
                        </div>
                      </div>
                      <Card.Body className="tw-p-3">
                        <h6 className="tw-font-semibold tw-mb-2 tw-line-clamp-2">{course.title}</h6>
                        <p className="tw-text-sm tw-text-gray-600 tw-mb-2 tw-line-clamp-2">
                          {course.description}
                        </p>
                        <div className="tw-text-xs tw-text-gray-500 tw-mb-3">
                          {course.finished_materials}/{course.material} Materi • {course.finished_quiz_topics}/{course.quiz} Quiz
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => router.push(`/course/${course.course_string}`)}
                          className="tw-w-full tw-bg-purple-600 hover:tw-bg-purple-700 tw-border-0"
                        >
                          {course.overall_progress_percentage >= 100 ? 'Review' : 'Lanjutkan'}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {courses.length > 6 && (
                <div className="tw-text-center tw-mt-4">
                  <Button
                    variant="outline-primary"
                    onClick={() => router.push('/all-courses')}
                  >
                    Lihat Semua {courses.length} Kursus
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Classes */}
        {classes.length > 0 && (
          <Card className="tw-border-0 tw-shadow-lg tw-mb-5">
            <Card.Body className="tw-p-4">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h5 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                  <GraduationCap className="tw-mr-2 tw-text-purple-600" size={22} />
                  Kelas Saya
                </h5>
                <Badge bg="success" className="tw-px-3 tw-py-2">
                  {classes.length} Kelas
                </Badge>
              </div>

              <div className="tw-space-y-3">
                {classes.slice(0, 5).map((cls) => (
                  <div key={cls.id} className="tw-p-3 tw-border tw-rounded-lg hover:tw-shadow-md tw-transition-shadow">
                    <div className="tw-flex tw-justify-between tw-items-start tw-mb-2">
                      <h6 className="tw-font-semibold tw-mb-1">{cls.name}</h6>
                      <Badge bg="success" pill>Terdaftar</Badge>
                    </div>
                    <p className="tw-text-sm tw-text-gray-600 tw-mb-2 tw-line-clamp-2">{cls.description}</p>
                    <div className="tw-flex tw-flex-wrap tw-gap-3 tw-text-xs tw-text-gray-500">
                      <div className="tw-flex tw-items-center">
                        <User size={14} className="tw-mr-1" />
                        {cls.teacher_name}
                      </div>
                      <div className="tw-flex tw-items-center">
                        <Calendar size={14} className="tw-mr-1" />
                        {formatDateTime(cls.start_date)}
                      </div>
                      <div className="tw-flex tw-items-center">
                        <BookOpen size={14} className="tw-mr-1" />
                        {cls.course_name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {classes.length > 5 && (
                <div className="tw-text-center tw-mt-4">
                  <Button variant="outline-primary" onClick={() => router.push('/all-courses')}>
                    Lihat Semua {classes.length} Kelas
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Try Outs */}
        {tryOuts.length > 0 && (
          <Card className="tw-border-0 tw-shadow-lg tw-mb-5">
            <Card.Body className="tw-p-4">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h5 className="tw-font-bold tw-mb-0 tw-flex tw-items-center">
                  <Target className="tw-mr-2 tw-text-purple-600" size={22} />
                  Try Out Saya
                </h5>
                <Badge bg="warning" text="dark" className="tw-px-3 tw-py-2">
                  {tryOuts.length} Try Out
                </Badge>
              </div>

              {notCompletedTryOuts.length > 0 && (
                <div className="tw-mb-4">
                  <h6 className="tw-font-semibold tw-mb-3 tw-text-orange-600 tw-flex tw-items-center">
                    <PlayCircle className="tw-mr-2" size={18} />
                    Belum Dikerjakan ({notCompletedTryOuts.length})
                  </h6>
                  <Row className="tw-g-3">
                    {notCompletedTryOuts.slice(0, 3).map((tryOut) => (
                      <Col key={tryOut.id} xs={12} sm={6} lg={4}>
                        <Card className="tw-border-orange-200 tw-bg-orange-50">
                          <Card.Body>
                            <Badge bg={tryOut.exam_schedule.isfree ? 'success' : 'primary'} className="tw-mb-2">
                              {tryOut.exam_schedule.isfree ? 'Gratis' : tryOut.exam_schedule.exam_type}
                            </Badge>
                            <h6 className="tw-font-semibold tw-mb-2 tw-line-clamp-2">{tryOut.exam_schedule.name}</h6>
                            <div className="tw-text-xs tw-text-gray-500 tw-mb-3">
                              Akses: {new Date(tryOut.granted_at).toLocaleDateString('id-ID')}
                            </div>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => router.push('/exam/tryout')}
                              className="tw-w-full"
                            >
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
                  <h6 className="tw-font-semibold tw-mb-3 tw-text-green-600 tw-flex tw-items-center">
                    <CheckCircle className="tw-mr-2" size={18} />
                    Sudah Selesai ({completedTryOuts.length})
                  </h6>
                  <div className="tw-space-y-2">
                    {completedTryOuts.slice(0, 3).map((tryOut) => {
                      const score = getExamScore(tryOut.exam_schedule_id);
                      return (
                        <div key={tryOut.id} className="tw-p-3 tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-lg">
                          <div className="tw-flex tw-justify-between tw-items-center">
                            <div>
                              <h6 className="tw-font-semibold tw-mb-1 tw-text-sm">{tryOut.exam_schedule.name}</h6>
                              <div className="tw-text-xs tw-text-gray-600">
                                Skor: <span className="tw-font-bold tw-text-green-600">{score?.total_score}</span>
                                {score?.completion_time && ` • ${new Date(score.completion_time).toLocaleDateString('id-ID')}`}
                              </div>
                            </div>
                            <CheckCircle className="tw-text-green-600" size={20} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {tryOuts.length > 6 && (
                <div className="tw-text-center tw-mt-4">
                  <Button variant="outline-primary" onClick={() => router.push('/exam/tryout')}>
                    Lihat Semua {tryOuts.length} Try Out
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
          <Card className="tw-border-0 tw-shadow-lg">
            <Card.Body className="tw-text-center tw-py-16">
              <Rocket size={64} className="tw-mx-auto tw-mb-4 tw-text-purple-500" />
              <h5 className="tw-mb-2 tw-font-bold tw-text-gray-700">Belum Ada Aktivitas</h5>
              <p className="tw-text-gray-600 tw-mb-4">
                Mulai perjalanan belajarmu dengan mengikuti kursus atau try out
              </p>
              <div className="tw-flex tw-justify-center tw-gap-3">
                <Button 
                  variant="primary"
                  onClick={() => router.push('/all-courses')}
                  className="tw-bg-purple-600 hover:tw-bg-purple-700 tw-border-0"
                >
                  Lihat Kursus
                </Button>
                <Button 
                  variant="outline-primary"
                  onClick={() => router.push('/exam/tryout')}
                >
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
        <title>Dashboard</title>
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