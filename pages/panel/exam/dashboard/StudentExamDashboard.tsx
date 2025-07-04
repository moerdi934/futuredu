'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Filter, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import MainLayout from '../../../../components/layout/DashboardLayout';

// Import components for different tabs
import Overview from './Overview';
import Progress from './Progress';
import TopicAnalysis from './TopicAnalysis';
import Achievement from './Achievement';

// Import data
import examData from './data.json';

// Type definitions
interface LearningInsight {
  type: 'positive' | 'negative';
  insight: string;
}

interface NextGoal {
  name: string;
  score: number;
  currentScore: number;
}

interface SubjectPerformance {
  name: string;
  nilai: number;
  target: number;
}

interface WeeklyProgressData {
  name: string;
  nilai: number;
  target: number;
}

interface RadarData {
  subject: string;
  score: number;
}

interface TopicData {
  topic: string;
  score: number;
  avg: number;
  completed: number;
  total: number;
}

interface RecentResult {
  id: number;
  title: string;
  date: string;
  score: number;
}

interface CompetitiveAnalysis {
  name: string;
  score: number;
}

interface ProgressDetail {
  nama: string;
  nilai: number;
  peningkatan: number;
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

interface ExamData {
  rank: number;
  averageScore: number;
  percentileRank: number;
  probabilitasKelulusan?: number;
  learningInsights: LearningInsight[];
  nextGoal: NextGoal;
  subjectPerformanceData: SubjectPerformance[];
  weeklyProgressData: WeeklyProgressData[];
  radarData: RadarData[];
  topicData: { [key: string]: TopicData[] };
  recentResults: RecentResult[];
  competitiveAnalysis: CompetitiveAnalysis[];
  progressDetail: ProgressDetail[];
  recommendedPrograms: RecommendedProgram[];
  recommendedResources: RecommendedResource[];
  achievements: Achievement[];
}

interface ExamDataCollection {
  [key: string]: ExamData;
}

interface UpcomingExam {
  id: number;
  title: string;
  date: string;
  subject: string;
}

type ExamType = 'SNBT' | 'SIMAK' | 'Quiz' | 'CPNS';
type ActiveTab = 'overview' | 'progress' | 'topics' | 'achievements';

const MainDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [examType, setExamType] = useState<ExamType>('SNBT');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showTopicDetail, setShowTopicDetail] = useState<boolean>(false);
  
  // Data for the selected exam type
  const currentExamData: ExamData = (examData as ExamDataCollection)[examType];
  console.log(currentExamData);

  const upcomingExams: UpcomingExam[] = [
    { id: 1, title: `Try Out ${examType} Sesi 1`, date: '25 April 2025', subject: 'Semua Mata Pelajaran' },
    { id: 2, title: `Latihan Soal ${examType}`, date: '27 April 2025', subject: 'Materi Unggulan' },
    { id: 3, title: `Simulasi ${examType} Lengkap`, date: '30 April 2025', subject: 'Full Test' },
  ];

  // Color constants defined
  const SUBJECT_COLORS: { [key: string]: string } = {
    'Matematika': '#8884d8',
    'B. Indonesia': '#82ca9d',
    'B. Inggris': '#ffc658',
    'Penalaran': '#ff8042',
    'Literasi': '#0088fe',
    'TKPA': '#8884d8',
    'Saintek': '#82ca9d',
    'Soshum': '#ffc658',
    'TWK': '#8884d8',
    'TIU': '#82ca9d',
    'TKP': '#ffc658',
    'Wawasan': '#ff8042',
    'Kebangsaan': '#0088fe',
    'Fisika': '#8884d8',
    'Kimia': '#82ca9d',
    'Biologi': '#ffc658'
  };

  // Helper functions
  const getColorForScore = (score: number): string => {
    if (score >= 85) return 'tw-text-green-600';
    if (score >= 70) return 'tw-text-blue-600';
    if (score >= 60) return 'tw-text-yellow-600';
    return 'tw-text-red-600';
  };

  const getProgressColor = (score: number): string => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'info';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  // Get topic data for selected subject
  const getTopicData = (subject: string): TopicData[] => {
    if (!subject || !currentExamData.topicData || !currentExamData.topicData[subject]) {
      return [];
    }
    return currentExamData.topicData[subject];
  };

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
                    {(['SNBT', 'SIMAK', 'Quiz', 'CPNS'] as ExamType[]).map(type => (
                      <Button 
                        key={type}
                        variant={examType === type ? "purple" : "outline-purple"}
                        className={`${examType === type ? 'tw-bg-purple-600 tw-border-purple-600' : 'tw-border-purple-500 tw-text-purple-500'}`}
                        onClick={() => {
                          setExamType(type);
                          setSelectedSubject(null);
                          setShowTopicDetail(false);
                        }}
                      >
                        {type}
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
                  <div className="tw-font-bold tw-text-xl">#{currentExamData.rank}</div>
                  <div className="tw-text-green-500 tw-text-xs">↑ 3 dari minggu lalu</div>
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
                  <div className="tw-text-gray-500 tw-text-sm">Rata-rata Nilai</div>
                  <div className="tw-font-bold tw-text-xl">{currentExamData.averageScore}</div>
                  <div className="tw-text-green-500 tw-text-xs">↑ 2.3 dari minggu lalu</div>
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
                    <div className="tw-font-bold tw-text-xl">{currentExamData.nextGoal.currentScore}</div>
                    <div className="tw-text-gray-500 tw-text-xs tw-ml-1">/ {currentExamData.nextGoal.score}</div>
                  </div>
                  <div className="tw-text-purple-500 tw-text-xs">{((currentExamData.nextGoal.currentScore / currentExamData.nextGoal.score) * 100).toFixed(1)}% tercapai</div>
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
                  <div className="tw-font-bold tw-text-xl">{currentExamData.percentileRank}%</div>
                  <div className="tw-text-purple-500 tw-text-xs">Lebih baik dari {100-currentExamData.percentileRank}% peserta</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Smart Insights */}
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

        {/* Main Dashboard Content - Rendered based on active tab */}
        {activeTab === 'overview' && (
          <Overview 
            examType={examType} 
            currentExamData={currentExamData} 
            upcomingExams={upcomingExams}
            getProgressColor={getProgressColor}
          />
        )}

        {activeTab === 'progress' && (
          <Progress 
            examType={examType} 
            currentExamData={currentExamData} 
            selectedSubject={selectedSubject} 
            setSelectedSubject={setSelectedSubject}
            showTopicDetail={showTopicDetail}
            setShowTopicDetail={setShowTopicDetail}
            getTopicData={getTopicData}
            getColorForScore={getColorForScore}
            getProgressColor={getProgressColor}
          />
        )}

        {activeTab === 'topics' && (
          <TopicAnalysis 
            examType={examType} 
            currentExamData={currentExamData} 
            selectedSubject={selectedSubject} 
            setSelectedSubject={setSelectedSubject}
            getTopicData={getTopicData}
            getColorForScore={getColorForScore}
            getProgressColor={getProgressColor}
          />
        )}

        {activeTab === 'achievements' && (
          <Achievement 
            examType={examType} 
            currentExamData={currentExamData} 
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