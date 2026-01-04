// pages/panel/exam/dashboard/StudentExamDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Filter, CheckCircle, AlertTriangle } from 'lucide-react';
import MainLayout from '../../../../components/layout/DashboardLayout';

// Import components for different tabs
import Overview from './Overview';
import Progress from './Progress';
import TopicAnalysis from './TopicAnalysis';
import Achievement from './Achievement';
import TargetProdiAnalysisComponent from './TargetProdiAnalysis';

// Type definitions (sesuaikan dengan response API)
interface LearningInsight {
  type: 'positive' | 'negative';
  insight: string;
}

interface NextGoal {
  name: string;
  score: number;
  currentScore: number;
  maxScore?: number;
}

interface SubjectPerformance {
  name: string | null;
  nilai: number;
  target: number;
  maxScore: number;
  metrics: string;
}

interface WeeklyProgressData {
  name: string;
  nilai: number;
  target: number;
}

interface RadarData {
  subject: string | null;
  score: number;
  maxScore: number;
}

interface TopicData {
  topic: string | null;
  score: number;
  avg: number;
  completed: number;
  total: number;
  maxScore: number;
  metrics: string;
}

interface RecentResult {
  id: number;
  title: string;
  date: string;
  score: number;
  maxScore: number;
  metrics: string;
}

interface CompetitiveAnalysis {
  name: string;
  score: number;
}

interface TargetProdiAnalysis {
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

interface ProgressDetail {
  nama: string | null;
  nilai: number;
  peningkatan: number;
  maxScore: number;
  metrics: string;
}

interface RecommendedProgram {
  program: string;
  match: number;
  minScore: number;
  requirement: string;
}

interface RecommendedResource {
  type: 'video' | 'quiz' | 'reading';
  title: string;
  subject: string;
  topic: string;
  duration?: string;
  questions?: number;
  pages?: number;
}

interface Achievement {
  title: string;
  description: string;
  progress: number;
  completed: boolean;
}

interface ExamDashboard {
  examType: string;
  hasData: boolean;
  maxScore: number;
  metrics: string;
  rank?: string;
  previousRank?: string | null;
  averageScore?: number;
  previousAverageScore?: number | null;
  totalCompleted?: number;
  studyTime?: string;
  percentileRank?: number;
  totalParticipants?: string;
  probabilitasKelulusan?: number | null;
  subjectPerformance?: SubjectPerformance[];
  weeklyProgress?: WeeklyProgressData[];
  recentResults?: RecentResult[];
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

interface DashboardResponse {
  examDashboards: ExamDashboard[];
  courses: any[];
  classes: any[];
  tryOuts: any[];
}

interface UpcomingExam {
  id: number;
  title: string;
  date: string;
  subject: string;
}

type ActiveTab = 'overview' | 'progress' | 'topics' | 'achievements';

const MainDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedExamIndex, setSelectedExamIndex] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showTopicDetail, setShowTopicDetail] = useState<boolean>(false);
  
  // State for API data
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:3000/api/dashboard/student', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: DashboardResponse = await response.json();
        setDashboardData(data);
        
        if (data.examDashboards && data.examDashboards.length > 0) {
          setSelectedExamIndex(0);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get current exam data
  const currentExamData = dashboardData?.examDashboards[selectedExamIndex];
  const examType = currentExamData?.examType || 'SNBT';
  const maxScore = currentExamData?.maxScore || 100;
  const metrics = currentExamData?.metrics || 'average';

  // Mock upcoming exams
  const upcomingExams: UpcomingExam[] = [
    { id: 1, title: `Try Out ${examType} Sesi 1`, date: '25 April 2025', subject: 'Semua Mata Pelajaran' },
    { id: 2, title: `Latihan Soal ${examType}`, date: '27 April 2025', subject: 'Materi Unggulan' },
    { id: 3, title: `Simulasi ${examType} Lengkap`, date: '30 April 2025', subject: 'Full Test' },
  ];

  // Helper functions with maxScore support
  const getColorForScore = (score: number, itemMaxScore?: number): string => {
    const max = itemMaxScore || maxScore;
    const percentage = (score / max) * 100;
    
    if (percentage >= 85) return 'tw-text-green-600';
    if (percentage >= 70) return 'tw-text-blue-600';
    if (percentage >= 60) return 'tw-text-yellow-600';
    return 'tw-text-red-600';
  };

  const getProgressColor = (score: number, itemMaxScore?: number): string => {
    const max = itemMaxScore || maxScore;
    const percentage = (score / max) * 100;
    
    if (percentage >= 85) return 'success';
    if (percentage >= 70) return 'info';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  // Calculate percentage for display
  const calculatePercentage = (score: number, itemMaxScore?: number): number => {
    const max = itemMaxScore || maxScore;
    return (score / max) * 100;
  };

  // Get topic data for selected subject - handle null subjects
  const getTopicData = (subject: string): TopicData[] => {
    if (!subject || !currentExamData?.topicData) {
      return [];
    }
    return currentExamData.topicData[subject] || [];
  };

  // Generate next goal if not provided by API
  const getNextGoal = (): NextGoal => {
    if (currentExamData?.nextGoal) {
      return {
        ...currentExamData.nextGoal,
        maxScore: currentExamData.nextGoal.maxScore || maxScore
      };
    }
    
    // Default goal based on exam type
    const goalMap: { [key: string]: { name: string; targetScore: number } } = {
      'SNBT': { name: 'Target SNBT UI', targetScore: maxScore === 1000 ? 700 : 80 },
      'SNBT Exam': { name: 'Target SNBT UI', targetScore: maxScore === 1000 ? 700 : 80 },
      'SIMAK': { name: 'Target SIMAK UI', targetScore: maxScore === 1000 ? 850 : 85 },
      'Quiz': { name: 'Rata-rata Nilai Quiz', targetScore: 90 },
      'CPNS': { name: 'Target CPNS', targetScore: 85 }
    };
    
    const goal = goalMap[examType] || { name: 'Target Belajar', targetScore: maxScore === 1000 ? 700 : 80 };
    const currentScore = currentExamData?.averageScore || 0;
    
    return {
      name: goal.name,
      score: goal.targetScore,
      currentScore: currentScore,
      maxScore: maxScore
    };
  };

  // Transform data for components
  const transformedExamData = currentExamData ? {
    ...currentExamData,
    nextGoal: getNextGoal(),
    subjectPerformanceData: currentExamData.subjectPerformance || [],
    weeklyProgressData: currentExamData.weeklyProgress || [],
    recentResults: currentExamData.recentResults || [],
  } : null;

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <Container fluid className="tw-py-4">
          <div className="tw-flex tw-justify-center tw-items-center" style={{ minHeight: '400px' }}>
            <div className="tw-text-center">
              <Spinner animation="border" variant="purple" className="tw-mb-3" />
              <p className="tw-text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        </Container>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <Container fluid className="tw-py-4">
          <Alert variant="danger">
            <Alert.Heading>Error Loading Dashboard</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  // No data state
  if (!dashboardData || !dashboardData.examDashboards || dashboardData.examDashboards.length === 0) {
    return (
      <MainLayout>
        <Container fluid className="tw-py-4">
          <Alert variant="info">
            <Alert.Heading>No Exam Data Available</Alert.Heading>
            <p>You haven't completed any exams yet. Start taking exams to see your dashboard!</p>
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container fluid className="tw-py-4">
        {/* Filter */}
        <Row className="tw-mb-4">
          <Col>
            <Card className="tw-border-0 tw-shadow-sm">
              <Card.Body>
                <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-4">
                  <div className="tw-flex tw-items-center">
                    <Filter size={20} className="tw-text-purple-600 tw-mr-2" />
                    <span className="tw-font-medium">Filter Tipe Ujian:</span>
                  </div>
                  <div className="tw-flex tw-flex-wrap tw-gap-2">
                    {dashboardData.examDashboards.map((exam, index) => (
                      <Button 
                        key={index}
                        variant={selectedExamIndex === index ? "purple" : "outline-purple"}
                        className={`${selectedExamIndex === index ? 'tw-bg-purple-600 tw-border-purple-600' : 'tw-border-purple-500 tw-text-purple-500'}`}
                        onClick={() => {
                          setSelectedExamIndex(index);
                          setSelectedSubject(null);
                          setShowTopicDetail(false);
                        }}
                      >
                        {exam.examType}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="tw-mb-4">
          <Col md={3} sm={6} className="tw-mb-3 tw-mb-md-0">
            <Card className="tw-border-0 tw-shadow-sm tw-h-full hover:tw-shadow-md tw-transition-all">
              <Card.Body className="tw-flex tw-items-center">
                <div className="tw-rounded-full tw-bg-purple-100 tw-p-3 tw-mr-4">
                  <Trophy className="tw-text-purple-600" size={24} />
                </div>
                <div>
                  <div className="tw-text-gray-500 tw-text-sm">Peringkat</div>
                  <div className="tw-font-bold tw-text-xl">#{currentExamData?.rank || 'N/A'}</div>
                  {currentExamData?.previousRank && (
                    <div className="tw-text-green-500 tw-text-xs">
                      {parseInt(currentExamData.previousRank) > parseInt(currentExamData.rank || '0') ? '↑' : '↓'} 
                      {' '}{Math.abs(parseInt(currentExamData.previousRank) - parseInt(currentExamData.rank || '0'))} dari minggu lalu
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="tw-mb-3 tw-mb-md-0">
            <Card className="tw-border-0 tw-shadow-sm tw-h-full hover:tw-shadow-md tw-transition-all">
              <Card.Body className="tw-flex tw-items-center">
                <div className="tw-rounded-full tw-bg-blue-100 tw-p-3 tw-mr-4">
                  <Star className="tw-text-blue-600" size={24} />
                </div>
                <div>
                  <div className="tw-text-gray-500 tw-text-sm">
                    {metrics === 'average' ? 'Rata-rata Nilai' : 'Total Nilai'}
                  </div>
                  <div className="tw-font-bold tw-text-xl">
                    {currentExamData?.averageScore?.toFixed(2) || 0}
                    {maxScore !== 100 && <span className="tw-text-sm tw-text-gray-500">/{maxScore}</span>}
                  </div>
                  {currentExamData?.previousAverageScore !== null && currentExamData?.previousAverageScore !== undefined && (
                    <div className="tw-text-green-500 tw-text-xs">
                      ↑ {((currentExamData.averageScore || 0) - currentExamData.previousAverageScore).toFixed(2)} dari minggu lalu
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="tw-mb-3 tw-mb-md-0"> 
            <Card className="tw-border-0 tw-shadow-sm tw-h-full hover:tw-shadow-md tw-transition-all">
              <Card.Body className="tw-flex tw-items-center">
                <div className="tw-rounded-full tw-bg-green-100 tw-p-3 tw-mr-4">
                  <LightbulbIcon className="tw-text-green-600" size={24} />
                </div>
                <div>
                  <div className="tw-text-gray-500 tw-text-sm">Target Progress</div>
                  <div className="tw-flex tw-items-end">
                    <div className="tw-font-bold tw-text-xl">{getNextGoal().currentScore.toFixed(0)}</div>
                    <div className="tw-text-gray-500 tw-text-xs tw-ml-1">/ {getNextGoal().score}</div>
                  </div>
                  <div className="tw-text-purple-500 tw-text-xs">
                    {((getNextGoal().currentScore / getNextGoal().score) * 100).toFixed(1)}% tercapai
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="tw-border-0 tw-shadow-sm tw-h-full hover:tw-shadow-md tw-transition-all">
              <Card.Body className="tw-flex tw-items-center">
                <div className="tw-rounded-full tw-bg-orange-100 tw-p-3 tw-mr-4">
                  <Percent className="tw-text-orange-600" size={24} />
                </div>
                <div>
                  <div className="tw-text-gray-500 tw-text-sm">Persentil</div>
                  <div className="tw-font-bold tw-text-xl">{currentExamData?.percentileRank || 0}%</div>
                  <div className="tw-text-purple-500 tw-text-xs">
                    Lebih baik dari {100-(currentExamData?.percentileRank || 0)}% peserta
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Smart Insights */}
        {currentExamData?.learningInsights && currentExamData.learningInsights.length > 0 && (
          <Row className="tw-mb-4">
            <Col md={12}>
              <Card className="tw-border-0 tw-shadow-sm">
                <Card.Body>
                  <h5 className="tw-font-bold tw-mb-3">Learning Insights 🔍</h5>
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
                    {currentExamData.learningInsights.map((insight, idx) => (
                      <div key={idx} className={`tw-border tw-border-${insight.type === 'positive' ? 'green' : 'red'}-200 tw-rounded-lg tw-p-3 tw-flex tw-items-center tw-gap-3 ${insight.type === 'positive' ? 'tw-bg-green-50' : 'tw-bg-red-50'}`}>
                        {insight.type === 'positive' ? 
                          <CheckCircle className="tw-text-green-500" size={20} /> : 
                          <AlertTriangle className="tw-text-red-500" size={20} />
                        }
                        <span className="tw-text-sm">{insight.insight}</span>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Tab Navigation */}
        <Row className="tw-mb-4">
          <Col>
            <Card className="tw-border-0 tw-shadow-sm">
              <Card.Body className="tw-p-0">
                <div className="tw-flex tw-flex-wrap">
                  <button
                    className={`tw-flex-1 tw-py-3 tw-font-medium tw-text-center ${activeTab === 'overview' ? 'tw-bg-purple-100 tw-text-purple-700' : 'tw-text-gray-600'}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                  <button
                    className={`tw-flex-1 tw-py-3 tw-font-medium tw-text-center ${activeTab === 'progress' ? 'tw-bg-purple-100 tw-text-purple-700' : 'tw-text-gray-600'}`}
                    onClick={() => setActiveTab('progress')}
                  >
                    Progress
                  </button>
                  <button
                    className={`tw-flex-1 tw-py-3 tw-font-medium tw-text-center ${activeTab === 'topics' ? 'tw-bg-purple-100 tw-text-purple-700' : 'tw-text-gray-600'}`}
                    onClick={() => {
                      setActiveTab('topics');
                      setSelectedSubject(null);
                    }}
                  >
                    Topic Analysis
                  </button>
                  <button
                    className={`tw-flex-1 tw-py-3 tw-font-medium tw-text-center ${activeTab === 'achievements' ? 'tw-bg-purple-100 tw-text-purple-700' : 'tw-text-gray-600'}`}
                    onClick={() => setActiveTab('achievements')}
                  >
                    Achievements
                  </button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Dashboard Content */}
        {activeTab === 'overview' && transformedExamData && (
          <Overview 
            examType={examType} 
            currentExamData={transformedExamData} 
            upcomingExams={upcomingExams}
            maxScore={maxScore}
            metrics={metrics}
            getProgressColor={getProgressColor}
            calculatePercentage={calculatePercentage}
          />
        )}

        {activeTab === 'progress' && currentExamData && (
          <Progress 
            examType={examType} 
            currentExamData={currentExamData} 
            selectedSubject={selectedSubject} 
            setSelectedSubject={setSelectedSubject}
            showTopicDetail={showTopicDetail}
            setShowTopicDetail={setShowTopicDetail}
            maxScore={maxScore}
            metrics={metrics}
            getTopicData={getTopicData}
            getColorForScore={getColorForScore}
            getProgressColor={getProgressColor}
            calculatePercentage={calculatePercentage}
          />
        )}

        {activeTab === 'topics' && currentExamData && (
          <TopicAnalysis 
            examType={examType} 
            currentExamData={currentExamData} 
            selectedSubject={selectedSubject} 
            setSelectedSubject={setSelectedSubject}
            maxScore={maxScore}
            metrics={metrics}
            getTopicData={getTopicData}
            getColorForScore={getColorForScore}
            getProgressColor={getProgressColor}
            calculatePercentage={calculatePercentage}
          />
        )}

        {activeTab === 'achievements' && currentExamData && (
          <Achievement 
            examType={examType} 
            currentExamData={currentExamData}
            maxScore={maxScore}
            metrics={metrics}
          />
        )}
      </Container>
    </MainLayout>
  );
};

// Icon Components
interface IconProps {
  className?: string;
  size?: number;
}

const Trophy: React.FC<IconProps> = ({ className, size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  );
};

const Star: React.FC<IconProps> = ({ className, size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
};

const LightbulbIcon: React.FC<IconProps> = ({ className, size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
      <path d="M9 18h6"></path>
      <path d="M10 22h4"></path>
    </svg>
  );
};

const Percent: React.FC<IconProps> = ({ className, size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="19" y1="5" x2="5" y2="19"></line>
      <circle cx="6.5" cy="6.5" r="2.5"></circle>
      <circle cx="17.5" cy="17.5" r="2.5"></circle>
    </svg>
  );
};

export default MainDashboard;