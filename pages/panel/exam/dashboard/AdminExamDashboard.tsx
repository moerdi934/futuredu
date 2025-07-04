'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Badge, Dropdown } from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Calendar, Clock, Users, FileText, Award, BookOpen,
  CheckCircle, AlertTriangle, TrendingUp, BarChart3, Target,
  Activity, Database, Zap, Brain, Globe, Layers, Filter,
  Eye, Settings, Download, Upload, User, UserCheck, AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';

const COLORS = {
  primary: '#6B46C1',
  secondary: '#9F7AEA',
  light: '#E9D8FD',
  dark: '#44337A',
  accent1: '#F687B3',
  accent2: '#4FD1C5',
  accent3: '#F6AD55',
  accent4: '#4299E1',
  accent5: '#68D391',
  background: '#FAF5FF',
  text: '#2D3748',
};

const PIE_COLORS = [COLORS.primary, COLORS.accent1, COLORS.accent2, COLORS.accent3, COLORS.accent4];

const AdminExamDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedQuestionGroup, setSelectedQuestionGroup] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [viewLevel, setViewLevel] = useState('topic'); // 'topic' or 'subtopic'

  const dashboardData = {
    stats: {
      totalSchedules: 156,
      activeSchedules: 42,
      totalExams: 324,
      totalQuestions: 12450,
      totalUsers: 8924,
      entitledUsers: 3245,
      completedUsers: 2456,
      completedSessions: 15680,
      averageScore: 78.5,
      questionsIncrease: 2456
    },
    
    scheduleStats: {
      byType: [
        { name: 'Drill', count: 45, percentage: 29 },
        { name: 'Quiz', count: 38, percentage: 24 },
        { name: 'Diagnostic Test', count: 35, percentage: 22 },
        { name: 'SNBT', count: 25, percentage: 16 },
        { name: 'CPNS', count: 13, percentage: 8 }
      ],
      byGroup: [
        { name: 'SNBT', count: 62, color: COLORS.primary },
        { name: 'Ujian Mandiri', count: 45, color: COLORS.accent1 },
        { name: 'CPNS', count: 28, color: COLORS.accent2 },
        { name: 'Bahasa', count: 21, color: COLORS.accent3 },
        { name: 'BUMN', count: 15, color: COLORS.accent4 }
      ],
      validityStatus: [
        { name: 'Valid & Active', count: 89, color: COLORS.accent5 },
        { name: 'Valid & Inactive', count: 34, color: COLORS.accent4 },
        { name: 'Expired', count: 23, color: COLORS.accent3 },
        { name: 'Invalid', count: 10, color: '#E53E3E' }
      ],
      accessTypes: [
        { name: 'Free Access', count: 45 },
        { name: 'Paid Access', count: 111 }
      ],
      performance: [
        { subject: 'SNBT', avgEntitled: 85, satisfaction: 78 },
        { subject: 'Ujian Mandiri', avgEntitled: 72, satisfaction: 68 },
        { subject: 'CPNS', avgEntitled: 35, satisfaction: 82 },
        { subject: 'Bahasa', avgEntitled: 28, satisfaction: 75 },
        { subject: 'BUMN', avgEntitled: 42, satisfaction: 73 }
      ]
    },

    examStats: {
      diagnosticStats: {
        completionStats: [
          { completed: 0, userCount: 2456 },
          { completed: 1, userCount: 1890 },
          { completed: 2, userCount: 1534 },
          { completed: 3, userCount: 1245 },
          { completed: 4, userCount: 890 },
          { completed: 5, userCount: 567 },
          { completed: 6, userCount: 345 },
          { completed: 7, userCount: 234 },
          { completed: 8, userCount: 156 },
          { completed: 9, userCount: 89 },
          { completed: 10, userCount: 45 }
        ],
        averageScores: {
          mean: 78.5,
          median: 76.0,
          high: 95.2,
          low: 42.1
        },
        levelPerformance: [
          { level: 1, avgTime: 45, accuracy: 85 },
          { level: 2, avgTime: 52, accuracy: 78 },
          { level: 3, avgTime: 68, accuracy: 71 },
          { level: 4, avgTime: 89, accuracy: 64 },
          { level: 5, avgTime: 112, accuracy: 58 }
        ],
        mostPopular: [
          { name: 'Mathematics Diagnostic', attempts: 5678 },
          { name: 'Physics Diagnostic', attempts: 4521 },
          { name: 'Chemistry Diagnostic', attempts: 3789 },
          { name: 'Biology Diagnostic', attempts: 3456 }
        ],
        avgCompletionAge: 22.5
      },
      quizDrillStats: {
        totalQuiz: 245,
        totalDrill: 156,
        avgQuestionsPerDrill: 15,
        avgQuestionsPerQuiz: 25,
        completionRate: 87
      },
      levelDistribution: [
        { level: 'Level 1', count: 2890, percentage: 23 },
        { level: 'Level 2', count: 3120, percentage: 25 },
        { level: 'Level 3', count: 2780, percentage: 22 },
        { level: 'Level 4', count: 2340, percentage: 19 },
        { level: 'Level 5', count: 1320, percentage: 11 }
      ],
      groupLevelDistribution: {
        'SNBT': [
          { level: 'Level 1', count: 890, percentage: 20 },
          { level: 'Level 2', count: 1120, percentage: 25 },
          { level: 'Level 3', count: 1080, percentage: 24 },
          { level: 'Level 4', count: 890, percentage: 20 },
          { level: 'Level 5', count: 520, percentage: 11 }
        ],
        'CPNS': [
          { level: 'Level 1', count: 456, percentage: 25 },
          { level: 'Level 2', count: 567, percentage: 31 },
          { level: 'Level 3', count: 445, percentage: 24 },
          { level: 'Level 4', count: 234, percentage: 13 },
          { level: 'Level 5', count: 123, percentage: 7 }
        ]
      }
    },

    questionStats: {
      byType: [
        { name: 'Single Choice', count: 4562, percentage: 37 },
        { name: 'Multiple Choice', count: 3245, percentage: 26 },
        { name: 'True/False', count: 2134, percentage: 17 },
        { name: 'Text Input', count: 1567, percentage: 13 },
        { name: 'Number Input', count: 942, percentage: 8 }
      ],
      byLevel: [
        { level: 1, count: 2890, difficulty: 'Very Easy' },
        { level: 2, count: 3120, difficulty: 'Easy' },
        { level: 3, count: 2780, difficulty: 'Medium' },
        { level: 4, count: 2340, difficulty: 'Hard' },
        { level: 5, count: 1320, difficulty: 'Very Hard' }
      ],
      bySubject: [
        { subject: 'Mathematics', count: 4235, topics: 45 },
        { subject: 'Physics', count: 3456, topics: 38 },
        { subject: 'Chemistry', count: 2678, topics: 32 },
        { subject: 'Biology', count: 2081, topics: 28 }
      ],
      withPassage: {
        withPassage: 3456,
        withoutPassage: 8994,
        passageReusageRate: 2.8
      },
subjectTopics: {
        'Mathematics': [
          { 
            name: 'Algebra', 
            questionCount: 856,
            subtopics: [
              { name: 'Linear Equations', questionCount: 234 },
              { name: 'Quadratic Equations', questionCount: 189 },
              { name: 'Polynomials', questionCount: 156 },
              { name: 'Systems of Equations', questionCount: 143 },
              { name: 'Inequalities', questionCount: 134 }
            ]
          },
          { 
            name: 'Calculus', 
            questionCount: 734,
            subtopics: [
              { name: 'Derivatives', questionCount: 198 },
              { name: 'Integrals', questionCount: 176 },
              { name: 'Limits', questionCount: 145 },
              { name: 'Applications', questionCount: 123 },
              { name: 'Series', questionCount: 92 }
            ]
          },
          { 
            name: 'Geometry', 
            questionCount: 623,
            subtopics: [
              { name: 'Triangles', questionCount: 167 },
              { name: 'Circles', questionCount: 134 },
              { name: 'Polygons', questionCount: 112 },
              { name: 'Coordinate Geometry', questionCount: 98 },
              { name: 'Solid Geometry', questionCount: 112 }
            ]
          },
          { 
            name: 'Statistics', 
            questionCount: 567,
            subtopics: [
              { name: 'Descriptive Statistics', questionCount: 156 },
              { name: 'Probability', questionCount: 134 },
              { name: 'Distributions', questionCount: 123 },
              { name: 'Hypothesis Testing', questionCount: 89 },
              { name: 'Regression', questionCount: 65 }
            ]
          },
          { 
            name: 'Trigonometry', 
            questionCount: 456,
            subtopics: [
              { name: 'Basic Functions', questionCount: 123 },
              { name: 'Identities', questionCount: 98 },
              { name: 'Equations', questionCount: 87 },
              { name: 'Applications', questionCount: 76 },
              { name: 'Inverse Functions', questionCount: 72 }
            ]
          }
        ],
        'Physics': [
          { 
            name: 'Mechanics', 
            questionCount: 645,
            subtopics: [
              { name: 'Motion', questionCount: 178 },
              { name: 'Forces', questionCount: 156 },
              { name: 'Energy', questionCount: 134 },
              { name: 'Momentum', questionCount: 98 },
              { name: 'Rotation', questionCount: 79 }
            ]
          },
          { 
            name: 'Thermodynamics', 
            questionCount: 523,
            subtopics: [
              { name: 'Heat Transfer', questionCount: 145 },
              { name: 'Laws of Thermodynamics', questionCount: 123 },
              { name: 'Entropy', questionCount: 98 },
              { name: 'Phase Changes', questionCount: 87 },
              { name: 'Engines', questionCount: 70 }
            ]
          },
          { 
            name: 'Electricity', 
            questionCount: 478,
            subtopics: [
              { name: 'Electric Fields', questionCount: 134 },
              { name: 'Circuits', questionCount: 123 },
              { name: 'Magnetism', questionCount: 98 },
              { name: 'AC/DC', questionCount: 76 },
              { name: 'Electromagnetic Waves', questionCount: 47 }
            ]
          },
          { 
            name: 'Optics', 
            questionCount: 367,
            subtopics: [
              { name: 'Reflection', questionCount: 98 },
              { name: 'Refraction', questionCount: 87 },
              { name: 'Lenses', questionCount: 76 },
              { name: 'Interference', questionCount: 56 },
              { name: 'Diffraction', questionCount: 50 }
            ]
          },
          { 
            name: 'Quantum', 
            questionCount: 289,
            subtopics: [
              { name: 'Wave-Particle Duality', questionCount: 78 },
              { name: 'Uncertainty Principle', questionCount: 65 },
              { name: 'Atomic Structure', questionCount: 56 },
              { name: 'Energy Levels', questionCount: 45 },
              { name: 'Quantum Numbers', questionCount: 45 }
            ]
          }
        ],
        'Chemistry': [
          { 
            name: 'Organic Chemistry', 
            questionCount: 734,
            subtopics: [
              { name: 'Hydrocarbons', questionCount: 198 },
              { name: 'Functional Groups', questionCount: 167 },
              { name: 'Reactions', questionCount: 156 },
              { name: 'Stereochemistry', questionCount: 123 },
              { name: 'Polymers', questionCount: 90 }
            ]
          },
          { 
            name: 'Inorganic Chemistry', 
            questionCount: 623,
            subtopics: [
              { name: 'Periodic Table', questionCount: 178 },
              { name: 'Chemical Bonding', questionCount: 145 },
              { name: 'Coordination Compounds', questionCount: 123 },
              { name: 'Acids and Bases', questionCount: 98 },
              { name: 'Redox Reactions', questionCount: 79 }
            ]
          },
          { 
            name: 'Physical Chemistry', 
            questionCount: 567,
            subtopics: [
              { name: 'Thermochemistry', questionCount: 156 },
              { name: 'Chemical Kinetics', questionCount: 134 },
              { name: 'Equilibrium', questionCount: 123 },
              { name: 'Electrochemistry', questionCount: 89 },
              { name: 'Surface Chemistry', questionCount: 65 }
            ]
          },
          { 
            name: 'Analytical Chemistry', 
            questionCount: 456,
            subtopics: [
              { name: 'Qualitative Analysis', questionCount: 134 },
              { name: 'Quantitative Analysis', questionCount: 123 },
              { name: 'Instrumental Methods', questionCount: 98 },
              { name: 'Chromatography', questionCount: 56 },
              { name: 'Spectroscopy', questionCount: 45 }
            ]
          }
        ],
        'Biology': [
          { 
            name: 'Cell Biology', 
            questionCount: 567,
            subtopics: [
              { name: 'Cell Structure', questionCount: 156 },
              { name: 'Cell Division', questionCount: 134 },
              { name: 'Membrane Transport', questionCount: 123 },
              { name: 'Organelles', questionCount: 89 },
              { name: 'Cell Cycle', questionCount: 65 }
            ]
          },
          { 
            name: 'Genetics', 
            questionCount: 489,
            subtopics: [
              { name: 'Mendelian Genetics', questionCount: 134 },
              { name: 'DNA Structure', questionCount: 123 },
              { name: 'Gene Expression', questionCount: 98 },
              { name: 'Mutations', questionCount: 76 },
              { name: 'Population Genetics', questionCount: 58 }
            ]
          },
          { 
            name: 'Ecology', 
            questionCount: 423,
            subtopics: [
              { name: 'Ecosystems', questionCount: 123 },
              { name: 'Food Chains', questionCount: 98 },
              { name: 'Population Dynamics', questionCount: 87 },
              { name: 'Biodiversity', questionCount: 65 },
              { name: 'Conservation', questionCount: 50 }
            ]
          },
          { 
            name: 'Evolution', 
            questionCount: 345,
            subtopics: [
              { name: 'Natural Selection', questionCount: 98 },
              { name: 'Speciation', questionCount: 76 },
              { name: 'Phylogeny', questionCount: 65 },
              { name: 'Fossil Record', questionCount: 56 },
              { name: 'Molecular Evolution', questionCount: 50 }
            ]
          }
        ]
      },
      usageStats: {
        totalQuestions: 12450,
        usedQuestions: 8934,
        averageUsage: 2.3,
        maxUsageQuestion: {
          code: 'MATHAL0001',
          usageCount: 15
        },
        subjects: 18,
        topics: 143,
        passages: 1235
      }
    },

    userActivity: {
      '7d': [
        { date: '2025-01-01', sessions: 245, completions: 189, avgScore: 76 },
        { date: '2025-01-02', sessions: 287, completions: 234, avgScore: 78 },
        { date: '2025-01-03', sessions: 312, completions: 267, avgScore: 81 },
        { date: '2025-01-04', sessions: 298, completions: 245, avgScore: 79 },
        { date: '2025-01-05', sessions: 334, completions: 289, avgScore: 82 },
        { date: '2025-01-06', sessions: 356, completions: 301, avgScore: 84 },
        { date: '2025-01-07', sessions: 289, completions: 234, avgScore: 77 }
      ],
      '30d': [
        { date: '2025-01-01', sessions: 1245, completions: 989, avgScore: 76 },
        { date: '2025-01-05', sessions: 1387, completions: 1134, avgScore: 78 },
        { date: '2025-01-10', sessions: 1512, completions: 1267, avgScore: 81 },
        { date: '2025-01-15', sessions: 1398, completions: 1145, avgScore: 79 },
        { date: '2025-01-20', sessions: 1534, completions: 1289, avgScore: 82 },
        { date: '2025-01-25', sessions: 1656, completions: 1401, avgScore: 84 },
        { date: '2025-01-30', sessions: 1489, completions: 1234, avgScore: 77 }
      ],
      '90d': [
        { date: '2024-11-01', sessions: 3245, completions: 2589, avgScore: 74 },
        { date: '2024-11-15', sessions: 3687, completions: 2934, avgScore: 76 },
        { date: '2024-12-01', sessions: 4012, completions: 3267, avgScore: 78 },
        { date: '2024-12-15', sessions: 3898, completions: 3145, avgScore: 77 },
        { date: '2025-01-01', sessions: 4234, completions: 3489, avgScore: 80 },
        { date: '2025-01-15', sessions: 4456, completions: 3701, avgScore: 82 },
        { date: '2025-01-30', sessions: 4289, completions: 3534, avgScore: 79 }
      ]
    },

    entitlementTrends: [
      { month: 'Jul', entitlements: 1245 },
      { month: 'Aug', entitlements: 1456 },
      { month: 'Sep', entitlements: 1689 },
      { month: 'Oct', entitlements: 1534 },
      { month: 'Nov', entitlements: 1823 },
      { month: 'Dec', entitlements: 1967 }
    ],

    examMetrics: {
      examCompletionRate: 87,
      userSatisfaction: 89,
      averageSessionTime: 24,
      retakeRate: 15,
      passRate: 73
    },

    recentActivity: [
      {
        type: 'schedule',
        action: 'Created',
        item: 'SNBT Physics Test',
        user: 'Dr. Sarah Wilson',
        time: '2 hours ago',
        details: 'New schedule with 130 questions, 5 levels'
      },
      {
        type: 'exam',
        action: 'Updated',
        item: 'Mathematics Level 3 Assessment',
        user: 'Prof. John Doe',
        time: '4 hours ago',
        details: 'Added 15 new questions, updated difficulty distribution'
      },
      {
        type: 'question',
        action: 'Bulk Import',
        item: '45 Chemistry Questions',
        user: 'Dr. Maria Garcia',
        time: '6 hours ago',
        details: 'Imported with passages, levels 2-4'
      },
      {
        type: 'user',
        action: 'Entitled',
        item: 'CPNS Package Access',
        user: 'System',
        time: '1 day ago',
        details: '234 new users gained access to CPNS schedules'
      }
    ],

    dailyStats: {
      schedulesCreated: 3,
      schedulesActivated: 2,
      schedulesDeactivated: 1,
      userCompletions: 456,
      newEntitlements: 89
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { variant: 'success', text: 'Active' },
      'Valid': { variant: 'info', text: 'Valid' },
      'Expired': { variant: 'warning', text: 'Expired' },
      'Invalid': { variant: 'danger', text: 'Invalid' },
      'Draft': { variant: 'secondary', text: 'Draft' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
  };

  const renderStatsCards = () => (
    <Row className="tw-mb-6">
      <Col md={3} sm={6} className="tw-mb-4">
        <Card className="tw-border-0 tw-shadow-sm tw-h-full">
          <Card.Body>
            <div className="tw-flex tw-justify-between tw-items-center">
              <div>
                <p className="tw-text-gray-500 tw-text-sm tw-mb-1">Total Schedules</p>
                <h3 className="tw-text-2xl tw-font-bold tw-mb-0">{dashboardData.stats.totalSchedules}</h3>
                <p className="tw-text-xs tw-text-gray-500">Active: {dashboardData.stats.activeSchedules}</p>
              </div>
              <div className="tw-bg-purple-100 tw-p-3 tw-rounded-full">
                <Calendar size={24} color={COLORS.primary} />
              </div>
            </div>
            <div className="tw-mt-2 tw-text-sm tw-text-green-500 tw-flex tw-items-center">
              <TrendingUp size={16} className="tw-mr-1" />
              <span>12% from last month</span>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={3} sm={6} className="tw-mb-4">
        <Card className="tw-border-0 tw-shadow-sm tw-h-full">
          <Card.Body>
            <div className="tw-flex tw-justify-between tw-items-center">
              <div>
                <p className="tw-text-gray-500 tw-text-sm tw-mb-1">Total Exams</p>
                <h3 className="tw-text-2xl tw-font-bold tw-mb-0">{dashboardData.stats.totalExams}</h3>
                <p className="tw-text-xs tw-text-gray-500">Across all schedules</p>
              </div>
              <div className="tw-bg-blue-100 tw-p-3 tw-rounded-full">
                <FileText size={24} color={COLORS.accent4} />
              </div>
            </div>
            <div className="tw-mt-2 tw-text-sm tw-text-green-500 tw-flex tw-items-center">
              <TrendingUp size={16} className="tw-mr-1" />
              <span>8% from last week</span>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} sm={6} className="tw-mb-4">
        <Card className="tw-border-0 tw-shadow-sm tw-h-full">
          <Card.Body>
            <div className="tw-flex tw-justify-between tw-items-center">
              <div>
                <p className="tw-text-gray-500 tw-text-sm tw-mb-1">Total Questions</p>
                <h3 className="tw-text-2xl tw-font-bold tw-mb-0">{dashboardData.stats.totalQuestions.toLocaleString()}</h3>
                <p className="tw-text-xs tw-text-gray-500">All difficulty levels</p>
              </div>
              <div className="tw-bg-orange-100 tw-p-3 tw-rounded-full">
                <BookOpen size={24} color={COLORS.accent3} />
              </div>
            </div>
            <div className="tw-mt-2 tw-text-sm tw-text-green-500 tw-flex tw-items-center">
              <TrendingUp size={16} className="tw-mr-1" />
              <span>+{dashboardData.stats.questionsIncrease.toLocaleString()} (24%)</span>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} sm={6} className="tw-mb-4">
        <Card className="tw-border-0 tw-shadow-sm tw-h-full">
          <Card.Body>
            <div className="tw-flex tw-justify-between tw-items-center">
              <div>
                <p className="tw-text-gray-500 tw-text-sm tw-mb-1">Entitled Users</p>
                <h3 className="tw-text-2xl tw-font-bold tw-mb-0">{dashboardData.stats.entitledUsers.toLocaleString()}</h3>
                <p className="tw-text-xs tw-text-gray-500">{dashboardData.stats.completedUsers.toLocaleString()} users ({Math.round((dashboardData.stats.completedUsers/dashboardData.stats.entitledUsers)*100)}%) completed</p>
              </div>
              <div className="tw-bg-green-100 tw-p-3 tw-rounded-full">
                <Users size={24} color={COLORS.accent5} />
              </div>
            </div>
            <div className="tw-mt-2 tw-text-sm tw-text-green-500 tw-flex tw-items-center">
              <UserCheck size={16} className="tw-mr-1" />
              <span>76% completion rate</span>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderOverviewTab = () => (
    <>
      <Row className="tw-mb-6">
        <Col lg={8} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h5 className="tw-font-bold" style={{ color: COLORS.primary }}>User Activity & Performance Trends</h5>
                <div className="tw-flex tw-gap-2">
                  {['7d', '30d', '90d'].map(range => (
                    <Button
                      key={range}
                      size="sm"
                      variant={selectedTimeRange === range ? 'primary' : 'outline-secondary'}
                      onClick={() => handleTimeRangeChange(range)}
                      style={selectedTimeRange === range ? { backgroundColor: COLORS.primary, borderColor: COLORS.primary } : {}}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.userActivity[selectedTimeRange]}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.accent1} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.accent1} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="sessions" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorSessions)" name="Sessions" />
                  <Area type="monotone" dataKey="completions" stroke={COLORS.accent1} fillOpacity={1} fill="url(#colorCompletions)" name="Completions" />
                </AreaChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Exam Performance Metrics</h5>
              <div className="tw-space-y-4">
                {Object.entries(dashboardData.examMetrics).map(([key, value], idx) => (
                  <div key={key}>
                    <div className="tw-flex tw-justify-between tw-mb-1">
                      <span className="tw-text-sm tw-font-medium tw-capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className="tw-text-sm tw-font-bold">{value}{key.includes('Time') ? ' min' : '%'}</span>
                    </div>
                    <ProgressBar 
                      now={key.includes('Time') ? (value/60)*100 : value} 
                      variant={value >= 90 ? 'success' : value >= 75 ? 'info' : value >= 60 ? 'warning' : 'danger'}
                      className="tw-h-2" 
                    />
                  </div>
                ))}
              </div>
              <div className="tw-mt-4 tw-p-3 tw-bg-green-50 tw-rounded-lg">
                <div className="tw-flex tw-items-center">
                  <CheckCircle size={20} className="tw-text-green-500 tw-mr-2" />
                  <span className="tw-text-sm tw-font-medium">Performance Stable</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="tw-mb-6">
        <Col md={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Active Schedule Type Distribution</h5>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dashboardData.scheduleStats.byType}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {dashboardData.scheduleStats.byType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Monthly Entitlement Trends</h5>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dashboardData.entitlementTrends}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="entitlements" stroke={COLORS.primary} name="User Entitlements" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="tw-mb-6">
        <Col md={8} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Recent Activity</h5>
              <div className="tw-space-y-3">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="tw-flex tw-items-start tw-space-x-3 tw-p-3 tw-bg-gray-50 tw-rounded-lg">
                    <div 
                      className="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mt-1"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] + '20' }}
                    >
                      {activity.type === 'schedule' && <Calendar size={20} color={PIE_COLORS[index % PIE_COLORS.length]} />}
                      {activity.type === 'exam' && <FileText size={20} color={PIE_COLORS[index % PIE_COLORS.length]} />}
                      {activity.type === 'question' && <BookOpen size={20} color={PIE_COLORS[index % PIE_COLORS.length]} />}
                      {activity.type === 'user' && <Users size={20} color={PIE_COLORS[index % PIE_COLORS.length]} />}
                    </div>
                    <div className="tw-flex-1">
                      <div className="tw-flex tw-justify-between tw-items-start">
                        <div>
                          <p className="tw-mb-1 tw-text-sm tw-font-medium">
                            <span className="tw-text-purple-600">{activity.user}</span> {activity.action.toLowerCase()} 
                            <span className="tw-font-semibold"> {activity.item}</span>
                          </p>
                          <p className="tw-text-xs tw-text-gray-600 tw-mb-0">{activity.details}</p>
                        </div>
                        <span className="tw-text-xs tw-text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Quick Actions</h5>
              <div className="tw-space-y-3">
                <Button 
                  variant="outline-primary" 
                  className="tw-w-full tw-flex tw-items-center tw-justify-center"
                  style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                  onClick={() => window.location.href = '/panel/exams'}
                >
                  <Calendar size={16} className="tw-mr-2" />
                  Create Exam Schedule
                </Button>
                <Button 
                  variant="outline-primary" 
                  className="tw-w-full tw-flex tw-items-center tw-justify-center"
                  style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                  onClick={() => window.location.href = '/panel/exams'}
                >
                  <FileText size={16} className="tw-mr-2" />
                  All Exams
                </Button>
                <Button 
                  variant="outline-primary" 
                  className="tw-w-full tw-flex tw-items-center tw-justify-center"
                  style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                  onClick={() => window.location.href = '/panel/questions'}
                >
                  <BookOpen size={16} className="tw-mr-2" />
                  Create Questions
                </Button>
                <Button 
                  variant="outline-primary" 
                  className="tw-w-full tw-flex tw-items-center tw-justify-center"
                  style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                  onClick={() => window.location.href = '/panel/questions/create-bulk'}
                >
                  <Upload size={16} className="tw-mr-2" />
                  Create Bulk Questions
                </Button>
                <Button 
                  variant="outline-primary" 
                  className="tw-w-full tw-flex tw-items-center tw-justify-center"
                  style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                  onClick={() => window.location.href = '/panel/question'}
                >
                  <Eye size={16} className="tw-mr-2" />
                  All Questions
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="tw-mb-6">
        <Col md={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Daily Activity Summary</h5>
              <div className="tw-space-y-3">
                <div className="tw-p-3 tw-bg-purple-50 tw-rounded-lg">
                  <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                    <span className="tw-font-medium">Schedules Created</span>
                    <Calendar size={18} color={COLORS.primary} />
                  </div>
                  <h4 className="tw-font-bold tw-text-purple-700">{dashboardData.dailyStats.schedulesCreated}</h4>
                  <div className="tw-text-xs tw-text-gray-500">Today</div>
                </div>
                
                <div className="tw-p-3 tw-bg-green-50 tw-rounded-lg">
                  <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                    <span className="tw-font-medium">User Completions</span>
                    <UserCheck size={18} color={COLORS.accent5} />
                  </div>
                  <h4 className="tw-font-bold tw-text-green-700">{dashboardData.dailyStats.userCompletions}</h4>
                  <div className="tw-text-xs tw-text-gray-500">Today</div>
                </div>
                
                <div className="tw-p-3 tw-bg-blue-50 tw-rounded-lg">
                  <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                    <span className="tw-font-medium">New Entitlements</span>
                    <Users size={18} color={COLORS.accent4} />
                  </div>
                  <h4 className="tw-font-bold tw-text-blue-700">{dashboardData.dailyStats.newEntitlements}</h4>
                  <div className="tw-text-xs tw-text-gray-500">Today</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Schedule Group Performance</h5>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart outerRadius={70} data={dashboardData.scheduleStats.performance}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="Avg Entitled" dataKey="avgEntitled" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} />
                  <Radar name="Satisfaction" dataKey="satisfaction" stroke={COLORS.accent1} fill={COLORS.accent1} fillOpacity={0.3} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderSchedulesTab = () => (
    <>
      <Row className="tw-mb-6">
        <Col md={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Schedule Validity Status</h5>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dashboardData.scheduleStats.validityStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {dashboardData.scheduleStats.validityStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Schedules by Group</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dashboardData.scheduleStats.byGroup}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS.secondary} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="tw-mb-6">
        <Col md={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Access Type Distribution</h5>
              {dashboardData.scheduleStats.accessTypes.map((access, index) => (
                <div key={index} className="tw-mb-3">
                  <div className="tw-flex tw-justify-between tw-mb-1">
                    <span className="tw-font-medium">{access.name}</span>
                    <span>{access.count} schedules</span>
                  </div>
                  <ProgressBar 
                    now={(access.count / dashboardData.scheduleStats.accessTypes.reduce((sum, item) => sum + item.count, 0)) * 100} 
                    variant={index === 0 ? 'success' : 'primary'}
                    className="tw-h-3" 
                  />
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Monthly Schedule Activity</h5>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={[
                  { month: 'Jan', created: 12, active: 10, inactive: 2 },
                  { month: 'Feb', created: 18, active: 15, inactive: 3 },
                  { month: 'Mar', created: 24, active: 21, inactive: 3 },
                  { month: 'Apr', created: 19, active: 17, inactive: 2 },
                  { month: 'May', created: 28, active: 25, inactive: 3 },
                  { month: 'Jun', created: 22, active: 20, inactive: 2 }
                ]}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="created" stroke={COLORS.primary} strokeWidth={2} name="Created" />
                  <Line type="monotone" dataKey="active" stroke={COLORS.accent5} strokeWidth={2} name="Active" />
                  <Line type="monotone" dataKey="inactive" stroke={COLORS.accent3} strokeWidth={2} name="Inactive" />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="tw-mb-6">
        <Col>
          <Card className="tw-border-0 tw-shadow-md">
            <Card.Body>
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h5 className="tw-font-bold" style={{ color: COLORS.primary }}>Schedule Management Overview</h5>
                <Button 
                  size="sm"
                  style={{ backgroundColor: COLORS.primary, borderColor: COLORS.primary }}
                  onClick={() => window.location.href = '/panel/exam-schedules'}
                >
                  <Eye size={16} className="tw-mr-1" /> View All Schedules
                </Button>
              </div>
              
              <Row>
                <Col md={3} sm={6} className="tw-mb-3">
                  <div className="tw-bg-purple-50 tw-p-4 tw-rounded-lg tw-text-center">
                    <Calendar size={32} color={COLORS.primary} className="tw-mx-auto tw-mb-2" />
                    <h4 className="tw-font-bold tw-text-purple-700">{dashboardData.stats.totalSchedules}</h4>
                    <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Total Schedules</p>
                  </div>
                </Col>
                <Col md={3} sm={6} className="tw-mb-3">
                  <div className="tw-bg-green-50 tw-p-4 tw-rounded-lg tw-text-center">
                    <CheckCircle size={32} color={COLORS.accent5} className="tw-mx-auto tw-mb-2" />
                    <h4 className="tw-font-bold tw-text-green-700">{dashboardData.scheduleStats.validityStatus[0].count}</h4>
                    <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Valid & Active</p>
                  </div>
                </Col>
                <Col md={3} sm={6} className="tw-mb-3">
                  <div className="tw-bg-yellow-50 tw-p-4 tw-rounded-lg tw-text-center">
                    <AlertTriangle size={32} color={COLORS.accent3} className="tw-mx-auto tw-mb-2" />
                    <h4 className="tw-font-bold tw-text-yellow-700">{dashboardData.scheduleStats.validityStatus[2].count}</h4>
                    <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Expired</p>
                  </div>
                </Col>
                <Col md={3} sm={6} className="tw-mb-3">
                  <div className="tw-bg-red-50 tw-p-4 tw-rounded-lg tw-text-center">
                    <AlertCircle size={32} color="#E53E3E" className="tw-mx-auto tw-mb-2" />
                    <h4 className="tw-font-bold tw-text-red-700">{dashboardData.scheduleStats.validityStatus[3].count}</h4>
                    <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Invalid</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="tw-mb-6">
        <Col md={8} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Schedule Performance by Group</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dashboardData.scheduleStats.performance}>
                  <XAxis dataKey="subject" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="avgEntitled" fill={COLORS.primary} name="Avg Entitled Users" />
                  <Bar yAxisId="right" dataKey="satisfaction" fill={COLORS.accent1} name="Satisfaction Score" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Daily User Statistics</h5>
              <div className="tw-space-y-3">
                <div className="tw-p-3 tw-bg-gray-50 tw-rounded-lg">
                  <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                    <span className="tw-font-medium">Completed Schedules</span>
                    <UserCheck size={18} color={COLORS.accent5} />
                  </div>
                  <h4 className="tw-font-bold tw-text-green-700">{dashboardData.dailyStats.userCompletions}</h4>
                  <div className="tw-text-xs tw-text-gray-500">Today</div>
                </div>
                
                <div className="tw-p-3 tw-bg-gray-50 tw-rounded-lg">
                  <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                    <span className="tw-font-medium">New Entitlements</span>
                    <Users size={18} color={COLORS.accent4} />
                  </div>
                  <h4 className="tw-font-bold tw-text-blue-700">{dashboardData.dailyStats.newEntitlements}</h4>
                  <div className="tw-text-xs tw-text-gray-500">Today</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
  
  const renderExamsTab = () => (
    <>
      <Row className="tw-mb-6">
        <Col md={8} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Diagnostic Test User Completion Distribution</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.examStats.diagnosticStats.completionStats}>
                  <XAxis dataKey="completed" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Bar dataKey="userCount" fill={COLORS.primary} name="User Count" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Diagnostic Score Statistics</h5>
              <div className="tw-space-y-3">
                <div className="tw-p-3 tw-bg-blue-50 tw-rounded-lg">
                  <div className="tw-flex tw-items-center tw-justify-between">
                    <div>
                      <h4 className="tw-font-bold tw-text-blue-700">{dashboardData.examStats.diagnosticStats.averageScores.mean}%</h4>
                      <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Mean Score</p>
                    </div>
                    <Target size={32} color={COLORS.accent4} />
                  </div>
                </div>
                
                <div className="tw-p-3 tw-bg-green-50 tw-rounded-lg">
                  <div className="tw-flex tw-items-center tw-justify-between">
                    <div>
                      <h4 className="tw-font-bold tw-text-green-700">{dashboardData.examStats.diagnosticStats.averageScores.median}%</h4>
                      <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Median Score</p>
                    </div>
                    <Activity size={32} color={COLORS.accent5} />
                  </div>
                </div>
                
                <div className="tw-grid tw-grid-cols-2 tw-gap-2">
                  <div className="tw-p-2 tw-bg-purple-50 tw-rounded-lg tw-text-center">
                    <h5 className="tw-font-bold tw-text-purple-700">{dashboardData.examStats.diagnosticStats.averageScores.high}%</h5>
                    <p className="tw-text-xs tw-text-gray-600 tw-mb-0">High</p>
                  </div>
                  <div className="tw-p-2 tw-bg-orange-50 tw-rounded-lg tw-text-center">
                    <h5 className="tw-font-bold tw-text-orange-700">{dashboardData.examStats.diagnosticStats.averageScores.low}%</h5>
                    <p className="tw-text-xs tw-text-gray-600 tw-mb-0">Low</p>
                  </div>
                </div>
                
                <div className="tw-p-3 tw-bg-yellow-50 tw-rounded-lg tw-text-center">
                  <h4 className="tw-font-bold tw-text-yellow-700">{dashboardData.examStats.diagnosticStats.avgCompletionAge} years</h4>
                  <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Avg Age at Full Completion</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="tw-mb-6">
        <Col md={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Level Performance Analysis</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dashboardData.examStats.diagnosticStats.levelPerformance}>
                  <XAxis dataKey="level" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="avgTime" fill={COLORS.accent4} name="Avg Time (seconds)" />
                  <Bar yAxisId="right" dataKey="accuracy" fill={COLORS.accent5} name="Accuracy %" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Most Popular Diagnostic Tests</h5>
              <div className="tw-space-y-3">
                {dashboardData.examStats.diagnosticStats.mostPopular.map((test, index) => (
                  <div key={index} className="tw-p-3 tw-bg-gray-50 tw-rounded-lg">
                    <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                      <span className="tw-font-medium">{test.name}</span>
                      <span className="tw-text-sm tw-text-gray-600">{test.attempts.toLocaleString()} attempts</span>
                    </div>
                    <ProgressBar 
                      now={(test.attempts / dashboardData.examStats.diagnosticStats.mostPopular[0].attempts) * 100} 
                      variant={index === 0 ? 'primary' : index === 1 ? 'info' : 'secondary'}
                      className="tw-h-2" 
                    />
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="tw-mb-6">
        <Col md={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Quiz & Drill Statistics</h5>
              <div className="tw-space-y-4">
                <div className="tw-bg-blue-50 tw-p-4 tw-rounded-lg">
                  <div className="tw-flex tw-items-center tw-justify-between">
                    <div>
                      <h4 className="tw-font-bold tw-text-blue-700">{dashboardData.examStats.quizDrillStats.totalQuiz}</h4>
                      <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Total Quiz</p>
                      <p className="tw-text-xs tw-text-gray-500">Avg {dashboardData.examStats.quizDrillStats.avgQuestionsPerQuiz} questions each</p>
                    </div>
                    <FileText size={32} color={COLORS.accent4} />
                  </div>
                </div>
                
                <div className="tw-bg-green-50 tw-p-4 tw-rounded-lg">
                  <div className="tw-flex tw-items-center tw-justify-between">
                    <div>
                      <h4 className="tw-font-bold tw-text-green-700">{dashboardData.examStats.quizDrillStats.totalDrill}</h4>
                      <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Total Drill</p>
                      <p className="tw-text-xs tw-text-gray-500">Avg {dashboardData.examStats.quizDrillStats.avgQuestionsPerDrill} questions each</p>
                    </div>
                    <Brain size={32} color={COLORS.accent5} />
                  </div>
                </div>
                
                <div className="tw-bg-purple-50 tw-p-4 tw-rounded-lg">
                  <div className="tw-flex tw-items-center tw-justify-between">
                    <div>
                      <h4 className="tw-font-bold tw-text-purple-700">{dashboardData.examStats.quizDrillStats.completionRate}%</h4>
                      <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Completion Rate</p>
                    </div>
                    <CheckCircle size={32} color={COLORS.primary} />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Question Level Distribution</h5>
              <div className="tw-mb-3">
                <Dropdown>
                  <Dropdown.Toggle variant="outline-primary" size="sm">
                    {selectedQuestionGroup === 'all' ? 'All Groups' : selectedQuestionGroup}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setSelectedQuestionGroup('all')}>All Groups</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSelectedQuestionGroup('SNBT')}>SNBT</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSelectedQuestionGroup('CPNS')}>CPNS</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSelectedQuestionGroup('Diagnostic')}>Diagnostic Test</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSelectedQuestionGroup('Quiz')}>Quiz</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSelectedQuestionGroup('Drill')}>Drill</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={selectedQuestionGroup === 'all' ? dashboardData.examStats.levelDistribution : 
                          dashboardData.examStats.groupLevelDistribution[selectedQuestionGroup] || dashboardData.examStats.levelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    label={({ level, percentage }) => `${level}: ${percentage}%`}
                  >
                    {(selectedQuestionGroup === 'all' ? dashboardData.examStats.levelDistribution : 
                      dashboardData.examStats.groupLevelDistribution[selectedQuestionGroup] || dashboardData.examStats.levelDistribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="tw-mb-6">
        <Col>
          <Card className="tw-border-0 tw-shadow-md">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Exam Performance Metrics</h5>
              <Row>
                <Col md={3} sm={6} className="tw-mb-3">
                  <div className="tw-bg-blue-50 tw-p-4 tw-rounded-lg tw-text-center">
                    <Activity size={32} color={COLORS.accent4} className="tw-mx-auto tw-mb-2" />
                    <h4 className="tw-font-bold tw-text-blue-700">{dashboardData.stats.completedSessions.toLocaleString()}</h4>
                    <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Total Completed Sessions</p>
                  </div>
                </Col>
                <Col md={3} sm={6} className="tw-mb-3">
                  <div className="tw-bg-green-50 tw-p-4 tw-rounded-lg tw-text-center">
                    <Target size={32} color={COLORS.accent5} className="tw-mx-auto tw-mb-2" />
                    <h4 className="tw-font-bold tw-text-green-700">{dashboardData.stats.averageScore}%</h4>
                    <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Average Score</p>
                  </div>
                </Col>
                <Col md={3} sm={6} className="tw-mb-3">
                  <div className="tw-bg-purple-50 tw-p-4 tw-rounded-lg tw-text-center">
                    <CheckCircle size={32} color={COLORS.primary} className="tw-mx-auto tw-mb-2" />
                    <h4 className="tw-font-bold tw-text-purple-700">{dashboardData.examMetrics.examCompletionRate}%</h4>
                    <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Completion Rate</p>
                  </div>
                </Col>
                <Col md={3} sm={6} className="tw-mb-3">
                  <div className="tw-bg-orange-50 tw-p-4 tw-rounded-lg tw-text-center">
                    <Clock size={32} color={COLORS.accent3} className="tw-mx-auto tw-mb-2" />
                    <h4 className="tw-font-bold tw-text-orange-700">{dashboardData.examMetrics.averageSessionTime} min</h4>
                    <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Avg Session Time</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderQuestionsTab = () => (
    <>
      <Row className="tw-mb-6">
        <Col md={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Question Type Distribution</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dashboardData.questionStats.byType}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS.secondary} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Question Level Analysis</h5>
              {dashboardData.questionStats.byLevel.map((level, index) => (
                <div key={index} className="tw-mb-3">
                  <div className="tw-flex tw-justify-between tw-mb-1">
                    <span className="tw-font-medium">Level {level.level} - {level.difficulty}</span>
                    <span>{level.count.toLocaleString()} questions</span>
                  </div>
                  <ProgressBar 
                    now={(level.count / dashboardData.stats.totalQuestions) * 100} 
                    variant={index % 2 === 0 ? 'primary' : 'info'}
                    className="tw-h-3" 
                  />
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="tw-mb-6">
        <Col md={8} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Questions by Subject & Topics</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.questionStats.bySubject}>
                  <XAxis dataKey="subject" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill={COLORS.primary} name="Question Count" />
                  <Bar yAxisId="right" dataKey="topics" fill={COLORS.accent2} name="Topic Count" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-md tw-h-full">
            <Card.Body>
              <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Passage Usage</h5>
              
              <div className="tw-text-center tw-mb-4">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'With Passage', value: dashboardData.questionStats.withPassage.withPassage },
                        { name: 'Without Passage', value: dashboardData.questionStats.withPassage.withoutPassage }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill={COLORS.primary} />
                      <Cell fill={COLORS.secondary} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="tw-space-y-3">
                <div className="tw-bg-purple-50 tw-p-3 tw-rounded-lg">
                  <div className="tw-text-center">
                    <h4 className="tw-font-bold tw-text-purple-700">
                      {dashboardData.questionStats.withPassage.withPassage.toLocaleString()}
                    </h4>
                    <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Questions with Passage</p>
                  </div>
                </div>
                
                <div className="tw-bg-gray-50 tw-p-3 tw-rounded-lg">
                  <div className="tw-text-center">
                    <h4 className="tw-font-bold tw-text-gray-700">
                      {dashboardData.questionStats.withPassage.withoutPassage.toLocaleString()}
                    </h4>
                    <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Questions without Passage</p>
                  </div>
                </div>
                
                <div className="tw-bg-blue-50 tw-p-3 tw-rounded-lg">
                  <div className="tw-text-center">
                    <h4 className="tw-font-bold tw-text-blue-700">
                      {dashboardData.questionStats.withPassage.passageReusageRate}x
                    </h4>
                    <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Avg Passage Reusage Rate</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

// Replace the existing "Topic Distribution by Subject" section in renderQuestionsTab with this:

<Row className="tw-mb-6">
  <Col>
    <Card className="tw-border-0 tw-shadow-md">
      <Card.Body>
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
          <h5 className="tw-font-bold" style={{ color: COLORS.primary }}>Topic Distribution Across Subjects</h5>
          <div className="tw-flex tw-gap-2 tw-items-center">
            {selectedTopic && viewLevel === 'subtopic' && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setSelectedTopic(null);
                  setViewLevel('topic');
                }}
              >
                ← Back to Topics
              </Button>
            )}
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" size="sm">
                {selectedSubject === 'all' ? 'All Subjects' : selectedSubject}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => {
                  setSelectedSubject('all');
                  setSelectedTopic(null);
                  setViewLevel('topic');
                }}>All Subjects</Dropdown.Item>
                <Dropdown.Item onClick={() => {
                  setSelectedSubject('Mathematics');
                  setSelectedTopic(null);
                  setViewLevel('topic');
                }}>Mathematics</Dropdown.Item>
                <Dropdown.Item onClick={() => {
                  setSelectedSubject('Physics');
                  setSelectedTopic(null);
                  setViewLevel('topic');
                }}>Physics</Dropdown.Item>
                <Dropdown.Item onClick={() => {
                  setSelectedSubject('Chemistry');
                  setSelectedTopic(null);
                  setViewLevel('topic');
                }}>Chemistry</Dropdown.Item>
                <Dropdown.Item onClick={() => {
                  setSelectedSubject('Biology');
                  setSelectedTopic(null);
                  setViewLevel('topic');
                }}>Biology</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        
        {/* Breadcrumb */}
        <div className="tw-mb-3 tw-text-sm tw-text-gray-600">
          <span>Questions</span>
          {selectedSubject !== 'all' && (
            <>
              <span className="tw-mx-2">›</span>
              <span className="tw-font-medium">{selectedSubject}</span>
            </>
          )}
          {selectedTopic && (
            <>
              <span className="tw-mx-2">›</span>
              <span className="tw-font-medium">{selectedTopic}</span>
            </>
          )}
          {viewLevel === 'subtopic' && (
            <>
              <span className="tw-mx-2">›</span>
              <span className="tw-text-purple-600">Subtopics</span>
            </>
          )}
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart 
            data={(() => {
              if (selectedSubject === 'all') {
                return dashboardData.questionStats.bySubject.map(item => ({ 
                  name: item.subject, 
                  questionCount: item.count,
                  clickable: true
                }));
              } else if (viewLevel === 'topic') {
                return dashboardData.questionStats.subjectTopics[selectedSubject]?.map(topic => ({
                  name: topic.name,
                  questionCount: topic.questionCount,
                  clickable: true,
                  hasSubtopics: topic.subtopics && topic.subtopics.length > 0
                })) || [];
              } else if (viewLevel === 'subtopic' && selectedTopic) {
                const topicData = dashboardData.questionStats.subjectTopics[selectedSubject]?.find(t => t.name === selectedTopic);
                return topicData?.subtopics?.map(subtopic => ({
                  name: subtopic.name,
                  questionCount: subtopic.questionCount,
                  clickable: false
                })) || [];
              }
              return [];
            })()}
            onClick={(data) => {
              if (!data || !data.activePayload) return;
              
              const clickedItem = data.activePayload[0]?.payload;
              if (!clickedItem?.clickable) return;

              if (selectedSubject === 'all') {
                // Clicked on subject - drill down to topics
                setSelectedSubject(clickedItem.name);
                setViewLevel('topic');
              } else if (viewLevel === 'topic' && clickedItem.hasSubtopics) {
                // Clicked on topic - drill down to subtopics
                setSelectedTopic(clickedItem.name);
                setViewLevel('subtopic');
              }
            }}
          >
            <defs>
              <linearGradient id="colorQuestion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip 
              formatter={(value, name) => [value.toLocaleString(), 'Questions']}
              labelFormatter={(label) => `${viewLevel === 'subtopic' ? 'Subtopic' : viewLevel === 'topic' ? 'Topic' : 'Subject'}: ${label}`}
            />
            <Bar 
              dataKey="questionCount" 
              fill="url(#colorQuestion)"
              stroke={COLORS.primary}
              strokeWidth={1}
              cursor={selectedSubject === 'all' || (viewLevel === 'topic' && selectedSubject !== 'all') ? 'pointer' : 'default'}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Instructions */}
        <div className="tw-mt-3 tw-p-3 tw-bg-blue-50 tw-rounded-lg">
          <div className="tw-flex tw-items-start tw-gap-2">
            <div className="tw-w-4 tw-h-4 tw-bg-blue-500 tw-rounded-full tw-mt-1 tw-flex-shrink-0"></div>
            <div className="tw-text-sm tw-text-blue-700">
              {selectedSubject === 'all' ? (
                <span><strong>Click on any subject bar</strong> to drill down and view topics within that subject</span>
              ) : viewLevel === 'topic' ? (
                <span><strong>Click on any topic bar</strong> to drill down and view subtopics, or use the subject dropdown to switch subjects</span>
              ) : (
                <span>Viewing subtopics for <strong>{selectedTopic}</strong> in <strong>{selectedSubject}</strong>. Use "Back to Topics" to return to topic view</span>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <Row className="tw-mt-4">
          <Col md={3} sm={6} className="tw-mb-3">
            <div className="tw-bg-purple-50 tw-p-3 tw-rounded-lg tw-text-center">
              <h5 className="tw-font-bold tw-text-purple-700">
                {(() => {
                  if (selectedSubject === 'all') {
                    return dashboardData.questionStats.bySubject.reduce((sum, item) => sum + item.count, 0).toLocaleString();
                  } else if (viewLevel === 'topic') {
                    return dashboardData.questionStats.subjectTopics[selectedSubject]?.reduce((sum, topic) => sum + topic.questionCount, 0).toLocaleString() || '0';
                  } else if (viewLevel === 'subtopic' && selectedTopic) {
                    const topicData = dashboardData.questionStats.subjectTopics[selectedSubject]?.find(t => t.name === selectedTopic);
                    return topicData?.subtopics?.reduce((sum, subtopic) => sum + subtopic.questionCount, 0).toLocaleString() || '0';
                  }
                  return '0';
                })()}
              </h5>
              <p className="tw-text-xs tw-text-gray-600 tw-mb-0">Total Questions</p>
            </div>
          </Col>
          <Col md={3} sm={6} className="tw-mb-3">
            <div className="tw-bg-blue-50 tw-p-3 tw-rounded-lg tw-text-center">
              <h5 className="tw-font-bold tw-text-blue-700">
                {(() => {
                  if (selectedSubject === 'all') {
                    return dashboardData.questionStats.bySubject.length;
                  } else if (viewLevel === 'topic') {
                    return dashboardData.questionStats.subjectTopics[selectedSubject]?.length || 0;
                  } else if (viewLevel === 'subtopic' && selectedTopic) {
                    const topicData = dashboardData.questionStats.subjectTopics[selectedSubject]?.find(t => t.name === selectedTopic);
                    return topicData?.subtopics?.length || 0;
                  }
                  return 0;
                })()}
              </h5>
              <p className="tw-text-xs tw-text-gray-600 tw-mb-0">
                {selectedSubject === 'all' ? 'Subjects' : viewLevel === 'topic' ? 'Topics' : 'Subtopics'}
              </p>
            </div>
          </Col>
          <Col md={3} sm={6} className="tw-mb-3">
            <div className="tw-bg-green-50 tw-p-3 tw-rounded-lg tw-text-center">
              <h5 className="tw-font-bold tw-text-green-700">
                {(() => {
                  if (selectedSubject === 'all') {
                    const avgPerSubject = dashboardData.questionStats.bySubject.reduce((sum, item) => sum + item.count, 0) / dashboardData.questionStats.bySubject.length;
                    return Math.round(avgPerSubject).toLocaleString();
                  } else if (viewLevel === 'topic') {
                    const topics = dashboardData.questionStats.subjectTopics[selectedSubject] || [];
                    const avgPerTopic = topics.reduce((sum, topic) => sum + topic.questionCount, 0) / topics.length;
                    return Math.round(avgPerTopic).toLocaleString();
                  } else if (viewLevel === 'subtopic' && selectedTopic) {
                    const topicData = dashboardData.questionStats.subjectTopics[selectedSubject]?.find(t => t.name === selectedTopic);
                    const subtopics = topicData?.subtopics || [];
                    const avgPerSubtopic = subtopics.reduce((sum, subtopic) => sum + subtopic.questionCount, 0) / subtopics.length;
                    return Math.round(avgPerSubtopic).toLocaleString();
                  }
                  return '0';
                })()}
              </h5>
              <p className="tw-text-xs tw-text-gray-600 tw-mb-0">Average per {viewLevel === 'subtopic' ? 'Subtopic' : viewLevel === 'topic' ? 'Topic' : 'Subject'}</p>
            </div>
          </Col>
          <Col md={3} sm={6} className="tw-mb-3">
            <div className="tw-bg-orange-50 tw-p-3 tw-rounded-lg tw-text-center">
              <h5 className="tw-font-bold tw-text-orange-700">
                {selectedSubject === 'all' ? 'All' : selectedSubject}
              </h5>
              <p className="tw-text-xs tw-text-gray-600 tw-mb-0">Current View</p>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  </Col>
</Row>

      <Row className="tw-mb-6">
        <Col>
          <Card className="tw-border-0 tw-shadow-md">
            <Card.Body>
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                <h5 className="tw-font-bold" style={{ color: COLORS.primary }}>Question Management Summary</h5>
                <div className="tw-flex tw-gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                    onClick={() => window.location.href = '/panel/questions/create-bulk'}
                  >
                    <Upload size={16} className="tw-mr-1" /> Bulk Import
                  </Button>
                  <Button 
                    size="sm"
                    style={{ backgroundColor: COLORS.primary, borderColor: COLORS.primary }}
                    onClick={() => window.location.href = '/panel/question'}
                  >
                    <Eye size={16} className="tw-mr-1" /> View All Questions
                  </Button>
                </div>
              </div>
              
              <Row>
                <Col md={2} sm={4} className="tw-mb-3">
                  <div className="tw-bg-purple-50 tw-p-4 tw-rounded-lg tw-text-center">
                    <BookOpen size={32} color={COLORS.primary} className="tw-mx-auto tw-mb-2" />
                    <h4 className="tw-font-bold tw-text-purple-700">{dashboardData.questionStats.usageStats.totalQuestions.toLocaleString()}</h4>
                    <p className="tw-text-xs tw-text-gray-600 tw-mb-0">Total Questions</p>
                  </div>
                </Col>
                <Col md={2} sm={4} className="tw-mb-3">
                  <div className="tw-bg-green-50 tw-p-4 tw-rounded-lg tw-text-center">
                    <CheckCircle size={32} color={COLORS.accent5} className="tw-mx-auto tw-mb-2" />
                    <h4 className="tw-font-bold tw-text-green-700">{dashboardData.questionStats.usageStats.usedQuestions.toLocaleString()}</h4>
                    <p className="tw-text-xs tw-text-gray-600 tw-mb-0">Used in Exams</p>
                  </div>
                </Col>
                <Col md={2} sm={4} className="tw-mb-3">
                  <div className="tw-bg-yellow-50 tw-p-4 tw-rounded-lg tw-text-center">
                    <Zap size={32} color={COLORS.accent3} className="tw-mx-auto tw-mb-2" />
                    <h4 className="tw-font-bold tw-text-yellow-700">{dashboardData.questionStats.usageStats.averageUsage}x</h4>
                    <p className="tw-text-xs tw-text-gray-600 tw-mb-0">Average Usage</p>
                  </div>
                </Col>
                <Col md={2} sm={4} className="tw-mb-3">
                  <div className="tw-bg-blue-50 tw-p-4 tw-rounded-lg tw-text-center">
                    <Database size={32} color={COLORS.accent4} className="tw-mx-auto tw-mb-2" />
                    <h4 className="tw-font-bold tw-text-blue-700">{dashboardData.questionStats.usageStats.passages}</h4>
                    <p className="tw-text-xs tw-text-gray-600 tw-mb-0">Passages</p>
                  </div>
                </Col>
                <Col md={2} sm={4} className="tw-mb-3">
                  <div className="tw-bg-pink-50 tw-p-4 tw-rounded-lg tw-text-center">
                    <Layers size={32} color={COLORS.accent1} className="tw-mx-auto tw-mb-2" />
                    <h4 className="tw-font-bold tw-text-pink-700">{dashboardData.questionStats.usageStats.topics}</h4>
                    <p className="tw-text-xs tw-text-gray-600 tw-mb-0">Topics</p>
                  </div>
                </Col>
                <Col md={2} sm={4} className="tw-mb-3">
                  <div className="tw-bg-orange-50 tw-p-4 tw-rounded-lg tw-text-center">
                    <Brain size={32} color={COLORS.accent3} className="tw-mx-auto tw-mb-2" />
                    <h4 className="tw-font-bold tw-text-orange-700">{dashboardData.questionStats.usageStats.subjects}</h4>
                    <p className="tw-text-xs tw-text-gray-600 tw-mb-0">Subjects</p>
                  </div>
                </Col>
              </Row>

              <Row className="tw-mt-4">
                <Col md={6} className="tw-mb-3">
                  <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-purple-100 tw-p-4 tw-rounded-lg">
                    <div className="tw-flex tw-items-center tw-justify-between">
                      <div>
                        <h4 className="tw-font-bold tw-text-purple-700">{dashboardData.questionStats.usageStats.maxUsageQuestion.usageCount}x</h4>
                        <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Max Usage Count</p>
                        <p className="tw-text-xs tw-text-gray-500">Question: {dashboardData.questionStats.usageStats.maxUsageQuestion.code}</p>
                      </div>
                      <Target size={32} color={COLORS.primary} />
                    </div>
                  </div>
                </Col>
                <Col md={6} className="tw-mb-3">
                  <div className="tw-bg-gradient-to-r tw-from-green-50 tw-to-green-100 tw-p-4 tw-rounded-lg">
                    <div className="tw-flex tw-items-center tw-justify-between">
                      <div>
                        <h4 className="tw-font-bold tw-text-green-700">{Math.round((dashboardData.questionStats.usageStats.usedQuestions / dashboardData.questionStats.usageStats.totalQuestions) * 100)}%</h4>
                        <p className="tw-text-sm tw-text-gray-600 tw-mb-0">Utilization Rate</p>
                        <p className="tw-text-xs tw-text-gray-500">Questions used in exams</p>
                      </div>
                      <Activity size={32} color={COLORS.accent5} />
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'schedules':
        return renderSchedulesTab();
      case 'exams':
        return renderExamsTab();
      case 'questions':
        return renderQuestionsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <DashboardLayout>
      <div className="tw-min-h-screen" style={{ backgroundColor: COLORS.background }}>
        <Container fluid className="tw-py-4">
          <div className="tw-mb-6">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
              <h2 className="tw-font-bold tw-mb-0" style={{ color: COLORS.primary }}>
                Admin Dashboard - Exam System Management
              </h2>
            </div>
            <p className="tw-text-gray-600 tw-mb-0">Comprehensive exam system analytics and management dashboard</p>
          </div>

          {renderStatsCards()}

          <Row className="tw-mb-6">
            <Col>
              <Card className="tw-border-0 tw-shadow-sm">
                <Card.Body className="tw-p-0">
                  <div className="tw-flex tw-flex-wrap">
                    <button
                      className={`tw-flex-1 tw-py-3 tw-px-4 tw-font-medium tw-text-center tw-border-0 tw-bg-transparent tw-transition-all ${
                        activeTab === 'overview' ? 'tw-bg-purple-100 tw-text-purple-700 tw-border-b-2 tw-border-purple-500' : 'tw-text-gray-600 hover:tw-bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('overview')}
                    >
                      <BarChart3 size={18} className="tw-mx-auto tw-mb-1" />
                      <span className="tw-block tw-text-sm">Overview</span>
                    </button>
                    <button
                      className={`tw-flex-1 tw-py-3 tw-px-4 tw-font-medium tw-text-center tw-border-0 tw-bg-transparent tw-transition-all ${
                        activeTab === 'schedules' ? 'tw-bg-purple-100 tw-text-purple-700 tw-border-b-2 tw-border-purple-500' : 'tw-text-gray-600 hover:tw-bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('schedules')}
                    >
                      <Calendar size={18} className="tw-mx-auto tw-mb-1" />
                      <span className="tw-block tw-text-sm">Schedules</span>
                    </button>
                    <button
                      className={`tw-flex-1 tw-py-3 tw-px-4 tw-font-medium tw-text-center tw-border-0 tw-bg-transparent tw-transition-all ${
                        activeTab === 'exams' ? 'tw-bg-purple-100 tw-text-purple-700 tw-border-b-2 tw-border-purple-500' : 'tw-text-gray-600 hover:tw-bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('exams')}
                    >
                      <FileText size={18} className="tw-mx-auto tw-mb-1" />
                      <span className="tw-block tw-text-sm">Exams</span>
                    </button>
                    <button
                      className={`tw-flex-1 tw-py-3 tw-px-4 tw-font-medium tw-text-center tw-border-0 tw-bg-transparent tw-transition-all ${
                        activeTab === 'questions' ? 'tw-bg-purple-100 tw-text-purple-700 tw-border-b-2 tw-border-purple-500' : 'tw-text-gray-600 hover:tw-bg-gray-50'
                      }`}
                      onClick={() => setActiveTab('questions')}
                    >
                      <BookOpen size={18} className="tw-mx-auto tw-mb-1" />
                      <span className="tw-block tw-text-sm">Questions</span>
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {renderTabContent()}
        </Container>
      </div>
    </DashboardLayout>
  );
};

export default AdminExamDashboard;