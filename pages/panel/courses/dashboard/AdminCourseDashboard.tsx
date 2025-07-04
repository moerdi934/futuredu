'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Book, Trophy, Clock, Calendar, Star, ChevronRight, 
  TrendingUp, LayoutDashboard, Users, Heart,
  Award, Play, Activity, CheckCircle, AlertTriangle,
  Target, Coffee, BarChart2
} from 'lucide-react';
import MainLayout from '../../../../components/layout/DashboardLayout';

// Define color scheme
const COLORS = {
  primary: '#6B46C1', // Main purple
  secondary: '#9F7AEA',
  light: '#E9D8FD',
  dark: '#44337A',
  accent1: '#F687B3', // Pink
  accent2: '#4FD1C5', // Teal
  accent3: '#F6AD55', // Orange
  accent4: '#4299E1', // Blue
  accent5: '#68D391', // Green
  background: '#FAF5FF',
  text: '#2D3748',
};

// Chart color schemes
const PIE_COLORS = [COLORS.primary, COLORS.accent1, COLORS.accent2, COLORS.accent3, COLORS.accent4];
const PROGRESS_COLORS = [COLORS.accent5, COLORS.accent4, COLORS.accent3, COLORS.accent1];
const RADAR_COLORS = [COLORS.primary, COLORS.accent1];

// Custom hook for responsive design
const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  
  useEffect(() => {
    const updateSize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };
    
    // Set initial size
    updateSize();
    
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);
  
  return size;
};

// Custom icons
const BrainIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.5H4.5A2.5 2.5 0 0 1 2 17.5v-10A2.5 2.5 0 0 1 4.5 5h2.76a2.49 2.49 0 0 1 2.24-3Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.5h2.54a2.5 2.5 0 0 0 2.5-2.5v-10A2.5 2.5 0 0 0 19.5 5h-2.76a2.49 2.49 0 0 0-2.24-3Z" />
    </svg>
  );
};

const SparklesIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
};

const Flame = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
    </svg>
  );
};

const CustomLightbulbIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
      <path d="M9 18h6"></path>
      <path d="M10 22h4"></path>
    </svg>
  );
};

const RocketIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
};

const Medal = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
      <path d="M11 12 5.12 2.2" />
      <path d="m13 12 5.88-9.8" />
      <path d="M8 7h8" />
      <circle cx="12" cy="17" r="5" />
      <path d="M12 18v-2h-.5" />
    </svg>
  );
};

// Custom icons for the dashboard
const ZapIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  );
};

const TargetIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>
  );
};

const CoffeeIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  );
};

// Lock component for incomplete achievements
const Lock = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
};

// Enhanced course dashboard with tabs
const StudentCourseDashboard = () => {
  const [width] = useWindowSize();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const coursesContainerRef = useRef(null);
  
  // Updated data with additional fields needed for the enhanced dashboard
  const data = {
    activeCoursesCount: 4,
    totalLearningHours: 28,
    completionRate: {
      current: 76,
      target: 85,
      improvement: 12
    },
    dailyStreak: 14,
    
    weeklyLearningData: [
      { day: "Senin", minutes: 45 },
      { day: "Selasa", minutes: 60 },
      { day: "Rabu", minutes: 30 },
      { day: "Kamis", minutes: 90 },
      { day: "Jumat", minutes: 45 },
      { day: "Sabtu", minutes: 120 },
      { day: "Minggu", minutes: 75 }
    ],
    
    focusTime: {
      daily: 45, // in minutes
      weekly: 315, // in minutes
      improvement: 18, // percentage improvement
      bestTimeOfDay: "19:00 - 21:00"
    },
    
    learningPerformance: [
      { name: "Quiz Scores", value: 85 },
      { name: "Assignment Completion", value: 92 },
      { name: "Discussion Participation", value: 65 },
      { name: "Learning Consistency", value: 78 }
    ],
    
    progressByWeek: [
      { week: "Minggu 1", progress: 85 },
      { week: "Minggu 2", progress: 65 },
      { week: "Minggu 3", progress: 75 },
      { week: "Minggu 4", progress: 90 }
    ],
    
    courseCategories: [
      { name: "Teknologi", value: 45 },
      { name: "Bahasa", value: 20 },
      { name: "Bisnis", value: 15 },
      { name: "Desain", value: 10 },
      { name: "Lainnya", value: 10 }
    ],
    
    coursesInProgress: [
      {
        title: "Web Development Bootcamp",
        completionCount: 1283,
        progress: 68,
        completedModules: 12,
        totalModules: 18,
        thumbnailColor: "#6B46C1",
        skillsGained: [
          { name: "HTML", level: 85 },
          { name: "CSS", level: 75 },
          { name: "JavaScript", level: 60 },
          { name: "React", level: 45 }
        ],
        learningPathProgress: 62,
        quizScores: [
          { quiz: "Quiz 1", score: 90 },
          { quiz: "Quiz 2", score: 85 },
          { quiz: "Quiz 3", score: 78 }
        ]
      },
      {
        title: "UI/UX Design Fundamentals",
        completionCount: 952,
        progress: 42,
        completedModules: 5,
        totalModules: 12,
        thumbnailColor: "#F687B3",
        skillsGained: [
          { name: "Design Thinking", level: 80 },
          { name: "Wireframing", level: 70 },
          { name: "Prototyping", level: 65 },
          { name: "User Research", level: 55 }
        ],
        learningPathProgress: 38,
        quizScores: [
          { quiz: "Quiz 1", score: 88 },
          { quiz: "Quiz 2", score: 75 }
        ]
      },
      {
        title: "English for Professionals",
        completionCount: 2145,
        progress: 75,
        completedModules: 9,
        totalModules: 12,
        thumbnailColor: "#4FD1C5",
        skillsGained: [
          { name: "Speaking", level: 85 },
          { name: "Writing", level: 78 },
          { name: "Listening", level: 90 },
          { name: "Reading", level: 82 }
        ],
        learningPathProgress: 70,
        quizScores: [
          { quiz: "Quiz 1", score: 92 },
          { quiz: "Quiz 2", score: 88 },
          { quiz: "Quiz 3", score: 85 }
        ]
      },
      {
        title: "Digital Marketing Strategy",
        completionCount: 768,
        progress: 30,
        completedModules: 3,
        totalModules: 10,
        thumbnailColor: "#F6AD55",
        skillsGained: [
          { name: "SEO", level: 60 },
          { name: "Social Media", level: 75 },
          { name: "Content Marketing", level: 50 },
          { name: "Analytics", level: 40 }
        ],
        learningPathProgress: 25,
        quizScores: [
          { quiz: "Quiz 1", score: 82 }
        ]
      }
    ],
    
    upcomingDeadlines: [
      {
        title: "Final Project Submission",
        courseTitle: "UI/UX Design Fundamentals",
        dueDate: "25 April",
        daysLeft: 3
      },
      {
        title: "Quiz Module 8",
        courseTitle: "English for Professionals",
        dueDate: "24 April",
        daysLeft: 2
      },
      {
        title: "Group Assignment",
        courseTitle: "Digital Marketing Strategy",
        dueDate: "28 April",
        daysLeft: 6
      },
      {
        title: "Coding Challenge",
        courseTitle: "Web Development Bootcamp",
        dueDate: "23 April",
        daysLeft: 1
      }
    ],
    
    recommendedCourses: [
      {
        title: "Data Science for Beginners",
        rating: 4.8,
        enrollments: "1,245",
        duration: "8 minggu",
        description: "Mempelajari dasar-dasar dari pengolahan data, visualisasi, dan machine learning."
      },
      {
        title: "Mobile App Development",
        rating: 4.7,
        enrollments: "983",
        duration: "10 minggu",
        description: "Membuat aplikasi Android dan iOS dengan React Native framework."
      },
      {
        title: "Public Speaking Mastery",
        rating: 4.9,
        enrollments: "2,150",
        duration: "6 minggu",
        description: "Tingkatkan kemampuan berbicara di depan umum dan kemampuan presentasi."
      },
      {
        title: "Photography Basics",
        rating: 4.6,
        enrollments: "765",
        duration: "4 minggu",
        description: "Pahami dasar-dasar fotografi dan teknik pengambilan gambar profesional."
      }
    ],
    
    streakMilestones: [
      { milestone: 7, achieved: true },
      { milestone: 14, achieved: true },
      { milestone: 30, achieved: false, progress: 47 },
      { milestone: 60, achieved: false, progress: 23 },
      { milestone: 100, achieved: false, progress: 14 }
    ],
    
    badges: [
      { 
        id: 1, 
        name: "First Steps", 
        icon: "Rocket", 
        description: "Menyelesaikan kursus pertama", 
        earned: true,
        date: "12 Feb 2025"
      },
      { 
        id: 2, 
        name: "Knowledge Seeker", 
        icon: "Book", 
        description: "Menyelesaikan 5 kursus", 
        earned: false,
        progress: 80
      },
      { 
        id: 3, 
        name: "Consistent Learner", 
        icon: "Flame", 
        description: "Streak belajar 14 hari", 
        earned: true,
        date: "20 Apr 2025"
      },
      { 
        id: 4, 
        name: "Night Owl", 
        icon: "Coffee", 
        description: "Belajar lebih dari 10 jam di malam hari", 
        earned: true,
        date: "15 Mar 2025"
      },
      { 
        id: 5, 
        name: "Perfect Score", 
        icon: "Star", 
        description: "Mendapatkan nilai 100 di quiz", 
        earned: false,
        progress: 90
      },
      { 
        id: 6, 
        name: "Tech Wizard", 
        icon: "Sparkles", 
        description: "Menyelesaikan 3 kursus teknologi", 
        earned: true,
        date: "5 Apr 2025"
      },
      { 
        id: 7, 
        name: "Quick Learner", 
        icon: "Zap", 
        description: "Menyelesaikan kursus dalam 7 hari", 
        earned: true,
        date: "18 Mar 2025"
      },
      { 
        id: 8, 
        name: "Goal Setter", 
        icon: "Target", 
        description: "Mencapai 5 target pembelajaran", 
        earned: false,
        progress: 60
      }
    ],
    
    skillsProgress: [
      { skill: "Web Development", level: 75 },
      { skill: "Design", level: 60 },
      { skill: "Languages", level: 85 },
      { skill: "Marketing", level: 45 },
      { skill: "Soft Skills", level: 70 }
    ],

    competencies: {
      technical: [
        { name: "Coding", value: 68 },
        { name: "Design", value: 55 },
        { name: "Data Analysis", value: 40 },
        { name: "SEO", value: 35 },
        { name: "Mobile Dev", value: 30 }
      ],
      soft: [
        { name: "Communication", value: 75 },
        { name: "Teamwork", value: 80 },
        { name: "Problem Solving", value: 65 },
        { name: "Leadership", value: 50 },
        { name: "Time Management", value: 70 }
      ]
    },

    learningInsights: [
      {
        type: "positive",
        insight: "Kamu konsisten belajar setiap hari! Pertahankan streak-mu untuk hasil maksimal."
      },
      {
        type: "warning",
        insight: "Ada tugas yang deadline-nya kurang dari 48 jam. Segera selesaikan!"
      },
      {
        type: "positive",
        insight: "Kamu sudah mencapai 75% target belajar minggu ini. Tinggal sedikit lagi!"
      }
    ],
    
    recentActivity: [
      {
        type: "completion",
        title: "Completed Module 12",
        courseTitle: "Web Development Bootcamp",
        timestamp: "2025-04-21T15:30:00Z"
      },
      {
        type: "badge",
        title: "Earned Badge",
        courseTitle: "Consistent Learner",
        timestamp: "2025-04-20T10:15:00Z"
      },
      {
        type: "badge",
        title: "Earned '10-Day Streak' Badge",
        courseTitle: "",
        timestamp: "2025-04-18T22:00:00Z"
      },
      {
        type: "quiz",
        title: "Scored 95% on Quiz",
        courseTitle: "English for Professionals",
        timestamp: "2025-04-17T14:45:00Z"
      }
    ],

    learningGoals: [
      { goal: "Menyelesaikan Web Development Bootcamp", progress: 68, dueDate: "15 Mei 2025" },
      { goal: "Mendapatkan nilai > 90 di semua quiz", progress: 75, dueDate: "30 Apr 2025" },
      { goal: "30 hari streak belajar", progress: 47, dueDate: "8 Mei 2025" },
      { goal: "Belajar 40 jam bulan ini", progress: 70, dueDate: "30 Apr 2025" }
    ],
    
    achievements: [
      {
        title: "Course Completer",
        description: "Complete your first course",
        progress: 100,
        completed: true
      },
      {
        title: "Quiz Master",
        description: "Score 100% on any quiz",
        progress: 90,
        completed: false
      },
      {
        title: "Streak Champion",
        description: "Maintain a 14-day learning streak",
        progress: 100,
        completed: true
      },
      {
        title: "Peer Helper",
        description: "Answer 10 questions in the forum",
        progress: 70,
        completed: false
      },
      {
        title: "Night Owl",
        description: "Complete 5 lessons after 10pm",
        progress: 100,
        completed: true
      }
    ],
    
    popularTopics: [
      { name: "JavaScript", count: 45 },
      { name: "UI Design", count: 38 },
      { name: "Marketing", count: 32 },
      { name: "Data Science", count: 28 },
      { name: "English", count: 25 }
    ]
  };
  
  // Scroll handler for course selection
  const scrollCourses = (direction) => {
    if (coursesContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      coursesContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  // Get color for progress
  const getProgressColor = (progress) => {
    if (progress >= 85) return "success";
    if (progress >= 60) return "info";
    if (progress >= 40) return "warning";
    return "danger";
  };

  // Get Icon component based on name
  const getIconComponent = (iconName) => {
    const iconMap = {
      "Book": Book,
      "Trophy": Trophy,
      "Star": Star,
      "Flame": Flame,
      "Coffee": CoffeeIcon,
      "Sparkles": SparklesIcon,
      "Zap": ZapIcon,
      "Target": TargetIcon,
      "Rocket": RocketIcon,
      "Medal": Medal,
      "Brain": BrainIcon
    };
    
    const IconComponent = iconMap[iconName] || Book;
    return IconComponent;
  };

  // Filter badges
  const earnedBadges = data.badges.filter(badge => badge.earned);
  const inProgressBadges = data.badges.filter(badge => !badge.earned);

  // Stats Cards - these will always be displayed
  const renderStatsCards = () => {
    return (
      <Row className="tw-mb-6">
        <Col md={3} sm={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-sm tw-h-full">
            <Card.Body>
              <div className="tw-flex tw-justify-between">
                <div>
                  <p className="tw-text-gray-500 tw-text-sm">Kursus Aktif</p>
                  <h3 className="tw-text-2xl tw-font-bold">{data.activeCoursesCount}</h3>
                </div>
                <div className="tw-bg-purple-100 tw-p-3 tw-rounded-full">
                  <Book size={20} color={COLORS.primary} />
                </div>
              </div>
              <div className="tw-mt-2 tw-text-sm tw-text-green-500 tw-flex tw-items-center">
                <TrendingUp size={16} className="tw-mr-1" />
                <span>12% dari bulan lalu</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-sm tw-h-full">
            <Card.Body>
              <div className="tw-flex tw-justify-between">
                <div>
                  <p className="tw-text-gray-500 tw-text-sm">Total Jam Belajar</p>
                  <h3 className="tw-text-2xl tw-font-bold">{data.totalLearningHours}</h3>
                </div>
                <div className="tw-bg-blue-100 tw-p-3 tw-rounded-full">
                  <Clock size={20} color={COLORS.accent4} />
                </div>
              </div>
              <div className="tw-mt-2 tw-text-sm tw-text-green-500 tw-flex tw-items-center">
                <TrendingUp size={16} className="tw-mr-1" />
                <span>5% dari minggu lalu</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-sm tw-h-full">
            <Card.Body>
              <div className="tw-flex tw-justify-between">
                <div>
                  <p className="tw-text-gray-500 tw-text-sm">Tingkat Penyelesaian</p>
                  <h3 className="tw-text-2xl tw-font-bold">{data.completionRate.current}%</h3>
                </div>
                <div className="tw-bg-orange-100 tw-p-3 tw-rounded-full">
                  <BarChart2 size={20} color={COLORS.accent3} />
                </div>
              </div>
              <div className="tw-mt-2 tw-text-sm tw-text-green-500 tw-flex tw-items-center">
                <TrendingUp size={16} className="tw-mr-1" />
                <span>{data.completionRate.improvement}% peningkatan</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="tw-mb-4">
          <Card className="tw-border-0 tw-shadow-sm tw-h-full">
            <Card.Body>
              <div className="tw-flex tw-justify-between">
                <div>
                  <p className="tw-text-gray-500 tw-text-sm">Streak Harian</p>
                  <h3 className="tw-text-2xl tw-font-bold">{data.dailyStreak} hari</h3>
                </div>
                <div className="tw-bg-pink-100 tw-p-3 tw-rounded-full">
                  <Flame size={20} color={COLORS.accent1} />
                </div>
              </div>
              <div className="tw-mt-2 tw-text-sm tw-text-red-500 tw-flex tw-items-center">
                <span>Jangan putus streak-mu!</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  // Render appropriate content based on active tab
  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'progress':
        return renderProgressTab();
      case 'skills':
        return renderSkillsTab();
      case 'achievements':
        return renderAchievementsTab();
      default:
        return renderOverviewTab();
    }
  };

  // Render Overview Tab
  const renderOverviewTab = () => {
    return (
      <>
        {/* Learning performance and time data */}
        <Row className="tw-mb-6">
          <Col lg={8} className="tw-mb-4">
            <Card className="tw-border-0 tw-shadow-md tw-h-full">
              <Card.Body>
                <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Progress Belajar Mingguan</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.weeklyLearningData}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="minutes" 
                      stroke={COLORS.primary} 
                      fillOpacity={1} 
                      fill="url(#colorUv)" 
                      name="Menit Belajar"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} className="tw-mb-4">
            <Card className="tw-border-0 tw-shadow-md tw-h-full">
              <Card.Body>
                <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Performa Pembelajaran</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart outerRadius={90} data={data.learningPerformance}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar 
                      name="Performa" 
                      dataKey="value" 
                      stroke={COLORS.primary} 
                      fill={COLORS.primary} 
                      fillOpacity={0.5} 
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Focus time and popular topics */}
        <Row className="tw-mb-6">
          <Col md={6} className="tw-mb-4">
            <Card className="tw-border-0 tw-shadow-md tw-h-full">
              <Card.Body>
                <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Waktu Fokus Belajar</h5>
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-mb-4">
                  <div className="tw-bg-purple-50 tw-rounded-lg tw-p-4">
                    <div className="tw-flex tw-items-center tw-mb-2">
                      <Clock size={18} className="tw-mr-2" color={COLORS.primary} />
                      <span className="tw-font-medium">Rata-rata Harian</span>
                    </div>
                    <h3 className="tw-text-2xl tw-font-bold tw-text-purple-700">{data.focusTime.daily} menit</h3>
                    <p className="tw-text-sm tw-text-gray-500 tw-mb-0">
                      {data.focusTime.improvement}% lebih baik dari minggu lalu
                    </p>
                  </div>
                  <div className="tw-bg-blue-50 tw-rounded-lg tw-p-4">
                    <div className="tw-flex tw-items-center tw-mb-2">
                      <Calendar size={18} className="tw-mr-2" color={COLORS.accent4} />
                      <span className="tw-font-medium">Total Mingguan</span>
                    </div>
                    <h3 className="tw-text-2xl tw-font-bold tw-text-blue-700">{data.focusTime.weekly} menit</h3>
                    <p className="tw-text-sm tw-text-gray-500 tw-mb-0">
                      {Math.round(data.focusTime.weekly / 60)} jam belajar minggu ini
                    </p>
                  </div>
                </div>
                
                <div className="tw-bg-gray-50 tw-rounded-lg tw-p-4">
                  <div className="tw-flex tw-items-center tw-mb-2">
                    <CoffeeIcon size={18} className="tw-mr-2" color={COLORS.accent3} />
                    <span className="tw-font-medium">Waktu Optimal Belajar</span>
                  </div>
                  <h3 className="tw-text-xl tw-font-bold tw-text-gray-700">{data.focusTime.bestTimeOfDay}</h3>
                  <p className="tw-text-sm tw-text-gray-500 tw-mb-0">
                    Saat ini kamu paling produktif belajar
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6} className="tw-mb-4">
            <Card className="tw-border-0 tw-shadow-md tw-h-full">
              <Card.Body>
                <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Topik Populer</h5>
                {data.popularTopics.map((topic, index) => (
                  <div key={index} className="tw-mb-3">
                    <div className="tw-flex tw-justify-between tw-mb-1">
                      <span className="tw-font-medium">{topic.name}</span>
                      <span>{topic.count} orang belajar</span>
                    </div>
                    <ProgressBar 
                      now={topic.count} 
                      max={data.popularTopics[0].count}
                      variant={['primary', 'info', 'success', 'warning', 'danger'][index % 5]}
                      className="tw-h-2" 
                    />
                  </div>
                ))}
                <div className="tw-mt-4 tw-text-center">
                  <Button 
                    variant="outline-primary" 
                    className="tw-rounded-full tw-text-sm"
                    style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                  >
                    Jelajahi Topik Lainnya
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Courses in progress */}
        <Row className="tw-mb-6">
          <Col>
            <Card className="tw-border-0 tw-shadow-md">
              <Card.Body>
                <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                  <h5 className="tw-font-bold" style={{ color: COLORS.primary }}>Kursus Sedang Berlangsung</h5>
                  <Button 
                    variant="link"
                    className="tw-text-sm tw-flex tw-items-center"
                    style={{ color: COLORS.primary }}
                  >
                    Lihat Semua <ChevronRight size={16} />
                  </Button>
                </div>
                
                {data.coursesInProgress.map((course, index) => (
                  <div key={index} className="tw-mb-4 tw-bg-white tw-rounded-lg tw-p-4 tw-shadow-sm hover:tw-shadow-md tw-transition-all tw-cursor-pointer" onClick={() => {
                    setSelectedCourse(course);
                    setActiveTab('progress');
                  }}>
                    <div className="tw-flex tw-items-center">
                      <div 
                        className="tw-w-12 tw-h-12 tw-rounded tw-flex tw-items-center tw-justify-center tw-mr-3"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] + '20' }}
                      >
                        <Book size={24} color={PIE_COLORS[index % PIE_COLORS.length]} />
                      </div>
                      <div className="tw-flex-1">
                        <div className="tw-flex tw-justify-between tw-items-start">
                          <div>
                            <h6 className="tw-font-bold tw-mb-0">{course.title}</h6>
                            <p className="tw-text-sm tw-text-gray-500 tw-mb-2">
                              {course.completionCount.toLocaleString()} orang telah menyelesaikan • {course.totalModules} modul
                            </p>
                          </div>
                          <Button 
                            className="tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-sm" 
                            size="sm"
                            style={{ backgroundColor: COLORS.primary, borderColor: COLORS.primary }}
                          >
                            <Play size={16} className="tw-mr-1" /> Lanjut
                          </Button>
                        </div>
                        <div className="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-1.5">
                          <div 
                            className="tw-h-1.5 tw-rounded-full" 
                            style={{
                              width: `${course.progress}%`,
                              backgroundColor: PROGRESS_COLORS[index % PROGRESS_COLORS.length]
                            }}
                          />
                        </div>
                        <div className="tw-flex tw-justify-between tw-mt-1">
                          <span className="tw-text-xs tw-text-gray-500">{course.progress}% selesai</span>
                          <span className="tw-text-xs tw-text-gray-500">
                            {course.completedModules}/{course.totalModules} modul
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Bottom row - Upcoming deadlines & Recommended courses */}
        <Row>
          <Col md={6} className="tw-mb-4">
            <Card className="tw-border-0 tw-shadow-md tw-h-full">
              <Card.Body>
                <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Tugas & Deadline</h5>
                {data.upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="tw-flex tw-items-center tw-mb-3 tw-p-3 tw-bg-gray-50 tw-rounded-lg hover:tw-bg-gray-100 tw-transition-all">
                    <div 
                      className="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-3"
                      style={{ backgroundColor: index % 2 === 0 ? COLORS.accent1 + '30' : COLORS.accent4 + '30' }}
                    >
                      <Calendar size={18} color={index % 2 === 0 ? COLORS.accent1 : COLORS.accent4} />
                    </div>
                    <div className="tw-flex-1">
                      <h6 className="tw-font-medium tw-mb-0">{deadline.title}</h6>
                      <p className="tw-text-sm tw-text-gray-500 tw-mb-0">{deadline.courseTitle}</p>
                    </div>
                    <div className="tw-text-right">
                      <p className="tw-text-sm tw-font-medium tw-mb-0" style={{ color: deadline.daysLeft <= 2 ? '#E53E3E' : '#718096' }}>
                        {deadline.dueDate}
                      </p>
                      <p className="tw-text-xs tw-text-gray-500 tw-mb-0">
                        {deadline.daysLeft} hari lagi
                      </p>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="tw-mb-4">
            <Card className="tw-border-0 tw-shadow-md tw-h-full">
              <Card.Body>
                <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Rekomendasi Kursus</h5>
                {data.recommendedCourses.map((course, index) => (
                  <div key={index} className="tw-flex tw-items-center tw-mb-3 tw-p-3 tw-bg-gray-50 tw-rounded-lg hover:tw-bg-gray-100 tw-transition-all">
                    <div 
                      className="tw-w-10 tw-h-10 tw-rounded tw-flex tw-items-center tw-justify-center tw-mr-3"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] + '20' }}
                    >
                      <Book size={18} color={PIE_COLORS[index % PIE_COLORS.length]} />
                    </div>
                    <div className="tw-flex-1">
                      <h6 className="tw-font-medium tw-mb-0">{course.title}</h6>
                      <div className="tw-flex tw-items-center">
                        <Star size={12} fill="#F6AD55" color="#F6AD55" />
                        <span className="tw-text-sm tw-ml-1">{course.rating}</span>
                        <span className="tw-text-sm tw-text-gray-500 tw-ml-2">{course.enrollments} peserta</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="tw-flex tw-items-center"
                      style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                    >
                      <Heart size={14} className="tw-mr-1" /> Simpan
                    </Button>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  // Render Progress Tab
  const renderProgressTab = () => {
    return (
      <>
        {/* Course Selection with horizontal scroll */}
        <Row className="tw-mb-6">
          <Col>
            <Card className="tw-border-0 tw-shadow-md">
              <Card.Body>
                <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                  <h5 className="tw-font-bold" style={{ color: COLORS.primary }}>Pilih Kursus</h5>
                  <div className="tw-flex tw-space-x-2">
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="tw-rounded-full"
                      onClick={() => scrollCourses('left')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="tw-rounded-full"
                      onClick={() => scrollCourses('right')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Button>
                  </div>
                </div>
                
                <div 
                  className="tw-flex tw-overflow-x-auto tw-pb-2 tw-hide-scrollbar"
                  ref={coursesContainerRef}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="tw-flex tw-space-x-4" style={{ minWidth: 'max-content' }}>
                    {data.coursesInProgress.map((course, idx) => (
                      <Card 
                        key={idx} 
                        className={`tw-border-0 tw-shadow-sm tw-cursor-pointer tw-transition-all ${selectedCourse && selectedCourse.title === course.title ? 'tw-ring-2 tw-ring-purple-500' : 'hover:tw-shadow-md'}`}
                        onClick={() => setSelectedCourse(course)}
                        style={{ width: '280px', flex: '0 0 auto' }}
                      >
                        <Card.Body>
                          <div 
                            className="tw-w-12 tw-h-12 tw-rounded tw-flex tw-items-center tw-justify-center tw-mb-3"
                            style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] + '20' }}
                          >
                            <Book size={24} color={PIE_COLORS[idx % PIE_COLORS.length]} />
                          </div>
                          <h6 className="tw-font-bold">{course.title}</h6>
                          <p className="tw-text-sm tw-text-gray-500">
                            {course.completionCount.toLocaleString()} orang telah menyelesaikan
                          </p>
                          <div className="tw-mt-2">
                            <div className="tw-flex tw-justify-between tw-mb-1">
                              <span className="tw-text-xs">Progress</span>
                              <span className="tw-text-xs tw-font-medium">{course.progress}%</span>
                            </div>
                            <ProgressBar 
                              now={course.progress} 
                              variant={getProgressColor(course.progress)}
                              className="tw-h-2" 
                            />
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {selectedCourse ? (
          <>
            {/* Course Progress Detail */}
            <Row className="tw-mb-6">
              <Col md={7} className="tw-mb-4">
                <Card className="tw-border-0 tw-shadow-md tw-h-full">
                  <Card.Body>
                    <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Progress Detail: {selectedCourse.title}</h5>
                    <div className="tw-mb-4">
                      <div className="tw-flex tw-justify-between tw-mb-2">
                        <span className="tw-font-medium">Overall Progress</span>
                        <span className="tw-font-medium">{selectedCourse.progress}%</span>
                      </div>
                      <ProgressBar 
                        now={selectedCourse.progress} 
                        variant={getProgressColor(selectedCourse.progress)}
                        className="tw-h-3 tw-mb-4" 
                      />
                    </div>
                    
                    <div className="tw-mb-4">
                      <div className="tw-flex tw-justify-between tw-mb-2">
                        <span className="tw-font-medium">Learning Path Progress</span>
                        <span className="tw-font-medium">{selectedCourse.learningPathProgress}%</span>
                      </div>
                      <ProgressBar 
                        now={selectedCourse.learningPathProgress} 
                        variant={getProgressColor(selectedCourse.learningPathProgress)}
                        className="tw-h-3" 
                      />
                    </div>
                    
                    <h6 className="tw-font-medium tw-mt-4">Module Completion</h6>
                    <p className="tw-text-sm tw-text-gray-500 tw-mb-3">
                      {selectedCourse.completedModules} dari {selectedCourse.totalModules} modul selesai
                    </p>
                    
                    <div className="tw-grid tw-grid-cols-4 md:tw-grid-cols-6 tw-gap-2">
                      {Array.from({ length: selectedCourse.totalModules }).map((_, idx) => (
                        <div 
                          key={idx}
                          className={`tw-h-8 tw-rounded tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-medium tw-transition-all ${idx < selectedCourse.completedModules ? 'tw-bg-purple-600 tw-text-white' : 'tw-bg-gray-200 tw-text-gray-500'}`}
                        >
                          {idx + 1}
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={5} className="tw-mb-4">
                <Card className="tw-border-0 tw-shadow-md tw-h-full">
                  <Card.Body>
                    <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Quiz Performance</h5>
                    
                    {selectedCourse.quizScores.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={selectedCourse.quizScores}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="quiz" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Bar dataKey="score" fill={COLORS.secondary} />
                          </BarChart>
                        </ResponsiveContainer>
                        
                        <div className="tw-mt-4">
                          {selectedCourse.quizScores.map((quiz, idx) => (
                            <div key={idx} className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                              <span className="tw-text-sm">{quiz.quiz}</span>
                              <span className={`tw-font-medium ${quiz.score >= 85 ? 'tw-text-green-500' : quiz.score >= 70 ? 'tw-text-blue-500' : 'tw-text-yellow-500'}`}>
                                {quiz.score}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="tw-flex tw-justify-center tw-items-center tw-h-48 tw-text-gray-500">
                        <p>Belum ada quiz yang diselesaikan</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          
            {/* Skills Gained */}
            <Row className="tw-mb-6">
              <Col>
                <Card className="tw-border-0 tw-shadow-md">
                  <Card.Body>
                    <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Skills yang Didapat</h5>
                    <Row>
                      {selectedCourse.skillsGained.map((skill, idx) => (
                        <Col key={idx} md={6} lg={3} className="tw-mb-4">
                          <div 
                            className="tw-p-4 tw-rounded-lg tw-h-full tw-transition-all hover:tw-shadow-md tw-cursor-pointer"
                            style={{ backgroundColor: `${PIE_COLORS[idx % PIE_COLORS.length]}15` }}
                            onClick={() => setSelectedSkill(skill)}
                          >
                            <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                              <h6 className="tw-font-medium tw-mb-0">{skill.name}</h6>
                              <div 
                                className="tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center"
                                style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] + '30' }}
                              >
                                <BrainIcon size={16} color={PIE_COLORS[idx % PIE_COLORS.length]} />
                              </div>
                            </div>
                            <div className="tw-flex tw-justify-between tw-mb-1">
                              <span className="tw-text-sm">Level</span>
                              <span className="tw-text-sm tw-font-medium">{skill.level}%</span>
                            </div>
                            <ProgressBar 
                              now={skill.level} 
                              variant={getProgressColor(skill.level)}
                              className="tw-h-2" 
                            />
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <Row>
            <Col>
              <Card className="tw-border-0 tw-shadow-md">
                <Card.Body className="tw-flex tw-justify-center tw-items-center tw-py-16">
                  <div className="tw-text-center">
                    <div className="tw-bg-purple-100 tw-rounded-full tw-w-16 tw-h-16 tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                      <Book size={32} color={COLORS.primary} />
                    </div>
                    <h5 className="tw-font-bold tw-mb-2" style={{ color: COLORS.primary }}>Pilih Kursus untuk Melihat Detail</h5>
                    <p className="tw-text-gray-500">Klik pada salah satu kursus di atas untuk melihat detail progress kursus</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </>
    );
  };

  // Render Skills Tab
  const renderSkillsTab = () => {
    return (
      <>
        {/* Skills Overview */}
        <Row className="tw-mb-6">
          <Col md={7} className="tw-mb-4">
            <Card className="tw-border-0 tw-shadow-md tw-h-full">
              <Card.Body>
                <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Peta Kompetensi & Skill</h5>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart outerRadius={120} data={data.skillsProgress}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar name="Skill Level" dataKey="level" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.5} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={5} className="tw-mb-4">
            <Card className="tw-border-0 tw-shadow-md tw-h-full">
              <Card.Body>
                <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Technical vs Soft Skills</h5>
                
                <h6 className="tw-font-medium tw-mb-2">Technical Skills</h6>
                {data.competencies.technical.map((skill, idx) => (
                  <div key={idx} className="tw-mb-3">
                    <div className="tw-flex tw-justify-between tw-mb-1">
                      <span className="tw-text-sm">{skill.name}</span>
                      <span className="tw-text-sm tw-font-medium">{skill.value}%</span>
                    </div>
                    <ProgressBar 
                      now={skill.value} 
                      variant={getProgressColor(skill.value)}
                      className="tw-h-2" 
                    />
                  </div>
                ))}
                
                <h6 className="tw-font-medium tw-mb-2 tw-mt-4">Soft Skills</h6>
                {data.competencies.soft.map((skill, idx) => (
                  <div key={idx} className="tw-mb-3">
                    <div className="tw-flex tw-justify-between tw-mb-1">
                      <span className="tw-text-sm">{skill.name}</span>
                      <span className="tw-text-sm tw-font-medium">{skill.value}%</span>
                    </div>
                    <ProgressBar 
                      now={skill.value} 
                      variant={getProgressColor(skill.value)}
                      className="tw-h-2" 
                    />
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Streak Milestones */}
        <Row className="tw-mb-6">
          <Col>
            <Card className="tw-border-0 tw-shadow-md">
              <Card.Body>
                <h5 className="tw-font-bold tw-mb-4" style={{ color: COLORS.primary }}>Milestone Streak Belajar</h5>
                <div className="tw-relative">
                  <div className="tw-h-2 tw-bg-gray-200 tw-absolute tw-top-5 tw-left-0 tw-right-0 tw-z-0"></div>
                  <div className="tw-flex tw-justify-between tw-relative tw-z-10">
                    {data.streakMilestones.map((milestone, idx) => (
                      <div key={idx} className="tw-flex tw-flex-col tw-items-center">
                        <div 
                          className={`tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center ${
                            milestone.achieved 
                              ? 'tw-bg-green-500 tw-text-white' 
                              : 'tw-bg-gray-200 tw-text-gray-500'
                          }`}
                        >
                          {milestone.achieved ? (
                            <CheckCircle size={24} />
                          ) : (
                            <span className="tw-text-sm tw-font-bold">{milestone.progress}%</span>
                          )}
                        </div>
                        <div className="tw-text-center tw-mt-2">
                          <div className="tw-font-medium">{milestone.milestone} Hari</div>
                          <div className="tw-text-xs tw-text-gray-500">
                            {milestone.achieved ? 'Tercapai' : 'Dalam Progres'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="tw-mt-8 tw-flex tw-justify-center">
                  <Button 
                    variant="primary" 
                    className="tw-rounded-full tw-px-5 tw-py-2"
                    style={{ backgroundColor: COLORS.primary, borderColor: COLORS.primary }}
                  >
                    <Flame size={16} className="tw-mr-2" /> Pertahankan Streak-mu!
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Learning Goals */}
        <Row className="tw-mb-6">
          <Col>
            <Card className="tw-border-0 tw-shadow-md">
              <Card.Body>
                <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                  <h5 className="tw-font-bold tw-mb-0" style={{ color: COLORS.primary }}>Learning Goals</h5>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="tw-flex tw-items-center"
                    style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                  >
                    <TargetIcon size={14} className="tw-mr-1" /> Tambah Goal
                  </Button>
                </div>
                
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                  {data.learningGoals.map((goal, idx) => (
                    <Card key={idx} className="tw-border-0 tw-shadow-sm">
                      <Card.Body>
                        <div className="tw-flex tw-items-start">
                          <div 
                            className="tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-3"
                            style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] + '20' }}
                          >
                            <TargetIcon size={20} color={PIE_COLORS[idx % PIE_COLORS.length]} />
                          </div>
                          <div className="tw-flex-1">
                            <h6 className="tw-font-medium tw-mb-1">{goal.goal}</h6>
                            <div className="tw-flex tw-justify-between tw-mb-2">
                              <span className="tw-text-xs tw-text-gray-500">Target: {goal.dueDate}</span>
                              <span className="tw-text-xs tw-font-medium">{goal.progress}%</span>
                            </div>
                            <ProgressBar 
                              now={goal.progress} 
                              variant={getProgressColor(goal.progress)}
                              className="tw-h-2" 
                            />
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  // Render Achievements Tab
  const renderAchievementsTab = () => {
    return (
      <>
        <Row className="tw-mb-4">
          <Col md={8}>
            <Card className="tw-border-0 tw-shadow-sm">
              <Card.Body>
                <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                  <h5 className="tw-font-bold tw-mb-0">Achievements & Badges</h5>
                  <div className="tw-bg-purple-100 tw-text-purple-700 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm">
                    {data.achievements.filter(a => a.completed).length}/{data.achievements.length} Achievements
                  </div>
                </div>
                
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                  {data.achievements.map((achievement, idx) => (
                    <div key={idx} className={`tw-border tw-border-gray-100 tw-rounded-lg tw-p-4 tw-shadow-sm 
                      ${achievement.completed ? 'tw-bg-yellow-50' : 'tw-bg-white'}`}>
                      <div className="tw-flex tw-gap-3">
                        <div className={`tw-rounded-full tw-h-12 tw-w-12 tw-flex tw-items-center tw-justify-center 
                          ${achievement.completed ? 'tw-bg-yellow-500' : 'tw-bg-gray-200'}`}>
                          {achievement.completed ? (
                            <Trophy className="tw-text-white" size={24} />
                          ) : (
                            <Lock className="tw-text-gray-500" size={24} />
                          )}
                        </div>
                        <div className="tw-flex-1">
                          <div className="tw-flex tw-justify-between">
                            <span className="tw-font-medium">{achievement.title}</span>
                            {achievement.completed && (
                              <span className="tw-bg-yellow-200 tw-text-yellow-800 tw-px-2 tw-py-0.5 tw-rounded-full tw-text-xs">
                                Completed
                              </span>
                            )}
                          </div>
                          <div className="tw-text-sm tw-text-gray-600 tw-mb-2">{achievement.description}</div>
                          <ProgressBar 
                            now={achievement.progress} 
                            variant={achievement.completed ? "warning" : "secondary"} 
                            className="tw-h-2" 
                          />
                          <div className="tw-text-xs tw-text-right tw-mt-1 tw-text-gray-500">
                            {achievement.progress}% complete
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="tw-border-0 tw-shadow-sm tw-mb-4">
              <Card.Body>
                <h5 className="tw-font-bold tw-mb-4">Progress Summary</h5>
                <div className="tw-bg-purple-50 tw-rounded-xl tw-p-4 tw-text-center tw-mb-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: data.achievements.filter(a => a.completed).length },
                          { name: 'Ongoing', value: data.achievements.filter(a => !a.completed).length }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {
                          [
                            { name: 'Completed', value: data.achievements.filter(a => a.completed).length },
                            { name: 'Ongoing', value: data.achievements.filter(a => !a.completed).length }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#8884d8', '#e0e0e0'][index % 2]} />
                          ))
                        }
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <h6 className="tw-font-medium tw-mb-3">Achievement Leaderboard</h6>
                <div className="tw-space-y-2">
                  {[
                    { name: 'Alex', achievements: 15, rank: 1 },
                    { name: 'Budi', achievements: 12, rank: 2 },
                    { name: 'Citra', achievements: 10, rank: 3 },
                    { name: 'Kamu', achievements: data.achievements.filter(a => a.completed).length, rank: 4, isYou: true }
                  ].map((user, idx) => (
                    <div key={idx} className={`tw-flex tw-items-center tw-justify-between tw-p-2 tw-rounded-lg ${user.isYou ? 'tw-bg-purple-100' : 'tw-bg-gray-50'}`}>
                      <div className="tw-flex tw-items-center">
                        <div className={`tw-w-6 tw-h-6 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-2 ${
                          user.rank === 1 ? 'tw-bg-yellow-500 tw-text-white' : 
                          user.rank === 2 ? 'tw-bg-gray-400 tw-text-white' : 
                          user.rank === 3 ? 'tw-bg-orange-500 tw-text-white' : 
                          'tw-bg-purple-200 tw-text-purple-700'
                        }`}>
                          {user.rank}
                        </div>
                        <span className={`${user.isYou ? 'tw-font-medium tw-text-purple-700' : ''}`}>
                          {user.name} {user.isYou && '(Kamu)'}
                        </span>
                      </div>
                      <div className="tw-flex tw-items-center">
                        <Trophy size={14} className={`tw-mr-1 ${user.rank <= 3 ? 'tw-text-yellow-500' : 'tw-text-gray-500'}`} />
                        <span>{user.achievements}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="purple" className="tw-bg-purple-600 tw-border-0 tw-w-full tw-mt-4">
                  Lihat Full Leaderboard
                </Button>
              </Card.Body>
            </Card>
            
            <Card className="tw-border-0 tw-shadow-sm">
              <Card.Body>
                <h5 className="tw-font-bold tw-mb-4">Achievement Terbaru</h5>
                {data.achievements.filter(a => a.completed).length > 0 ? (
                  <div className="tw-space-y-3">
                    {data.achievements.filter(a => a.completed).map((achievement, idx) => (
                      <div key={idx} className="tw-flex tw-gap-3 tw-items-center tw-p-3 tw-bg-yellow-50 tw-rounded-lg">
                        <div className="tw-rounded-full tw-bg-yellow-500 tw-p-2">
                          <Trophy className="tw-text-white" size={20} />
                        </div>
                        <div>
                          <div className="tw-font-medium">{achievement.title}</div>
                          <div className="tw-text-xs tw-text-gray-600">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="tw-text-center tw-py-5">
                    <Trophy size={36} className="tw-mx-auto tw-text-gray-400 tw-mb-2" />
                    <p className="tw-text-gray-600">Belum ada achievement yang selesai</p>
                    <p className="tw-text-sm tw-text-gray-500">Selesaikan tantangan untuk mendapatkan achievement!</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  return (
    <MainLayout>
      <div className="tw-min-h-screen" style={{ backgroundColor: COLORS.background }}>
        <Container fluid className="tw-py-4">
          {/* Stats Cards - Always displayed */}
          {renderStatsCards()}
          
          {/* Learning insights - Always displayed, showing only 3 */}
          {data.learningInsights.length > 0 && (
            <Row className="tw-mb-6">
              <Col>
                <Card className="tw-border-0 tw-shadow-md">
                  <Card.Body>
                    <h5 className="tw-font-bold tw-mb-3" style={{ color: COLORS.primary }}>Learning Insights 🔍</h5>
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
                      {data.learningInsights.slice(0, 3).map((insight, idx) => (
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
          <Row className="tw-mb-6">
            <Col>
              <Card className="tw-border-0 tw-shadow-sm">
                <Card.Body className="tw-p-0">
                  <div className="tw-flex tw-flex-wrap">
                    <button
                      className={`tw-flex-1 tw-py-3 tw-px-2 tw-font-medium tw-text-center ${activeTab === 'overview' ? 'tw-bg-purple-100 tw-text-purple-700' : 'tw-text-gray-600 hover:tw-bg-gray-50'}`}
                      onClick={() => setActiveTab('overview')}
                    >
                      <LayoutDashboard size={18} className="tw-mx-auto tw-mb-1" />
                      <span className="tw-block">Dashboard</span>
                    </button>
                    <button
                      className={`tw-flex-1 tw-py-3 tw-px-2 tw-font-medium tw-text-center ${activeTab === 'progress' ? 'tw-bg-purple-100 tw-text-purple-700' : 'tw-text-gray-600 hover:tw-bg-gray-50'}`}
                      onClick={() => setActiveTab('progress')}
                    >
                      <Activity size={18} className="tw-mx-auto tw-mb-1" />
                      <span className="tw-block">Progress</span>
                    </button>
                    <button
                      className={`tw-flex-1 tw-py-3 tw-px-2 tw-font-medium tw-text-center ${activeTab === 'skills' ? 'tw-bg-purple-100 tw-text-purple-700' : 'tw-text-gray-600 hover:tw-bg-gray-50'}`}
                      onClick={() => setActiveTab('skills')}
                    >
                      <BrainIcon size={18} className="tw-mx-auto tw-mb-1" />
                      <span className="tw-block">Skills</span>
                    </button>
                    <button
                      className={`tw-flex-1 tw-py-3 tw-px-2 tw-font-medium tw-text-center ${activeTab === 'achievements' ? 'tw-bg-purple-100 tw-text-purple-700' : 'tw-text-gray-600 hover:tw-bg-gray-50'}`}
                      onClick={() => setActiveTab('achievements')}
                    >
                      <Award size={18} className="tw-mx-auto tw-mb-1" />
                      <span className="tw-block">Achievements</span>
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Main content based on active tab */}
          {renderTabContent()}
        </Container>
      </div>
    </MainLayout>
  );
};

export default StudentCourseDashboard;