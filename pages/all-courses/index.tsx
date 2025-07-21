// pages/courses.tsx
import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Clock, Users, Star, Play, ChevronRight, Quote, Filter,
  Award, TrendingUp, Grid, List, Search, Eye, Calendar, User, ChevronDown, 
  ChevronUp, Target, Zap, Trophy, ShoppingCart, LogIn,
  Brain, Rocket, Gift, RotateCcw
} from 'lucide-react';
import NavigationBar from '../../components/layout/NavigationBar';

// Types
interface Course {
  id: number;
  title: string;
  description: string;
  imageurl: string | null;
  courseurl: string | null;
  type: number;
  create_date: string;
  create_user_id: number;
  learning_point: string[] | null;
  update_date: string | null;
  update_user_id: number | null;
  course_string: string;
}

interface UserCourseProgress {
  id: number;
  title: string;
  description: string;
  imageurl: string | null;
  type: number;
  learning_point: string[] | null;
  course_string: string;
  user_id: string;
  finished_quiz_topics: number;
  finished_materials: number;
  quiz: number;
  material: number;
  quiz_progress_percentage: number;
  material_progress_percentage: number;
  overall_progress_percentage: number;
}

interface QuoteType {
  text: string;
  author: string;
}

interface CoursePageProps {
  courses: Course[];
  initialQuote: QuoteType;
}

const CoursePage: React.FC<CoursePageProps> = ({ courses: initialCourses, initialQuote }) => {
  const router = useRouter();
  const { isAuthenticated, id: userId } = useAuth();
  
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(initialCourses);
  const [currentQuote, setCurrentQuote] = useState<QuoteType>(initialQuote);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickFilter, setQuickFilter] = useState<'all' | 'popular' | 'newest' | 'recommended'>('all');
  
  // Progress related states
  const [userProgress, setUserProgress] = useState<UserCourseProgress[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [showAllProgress, setShowAllProgress] = useState(false);
  
  const displayLimit = 6;
  const progressDisplayLimit = 4;

  const inspirationalQuotes: QuoteType[] = [
    {
      text: "Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia.",
      author: "Nelson Mandela"
    },
    {
      text: "Investasi terbaik adalah investasi dalam pendidikan diri sendiri.",
      author: "Benjamin Franklin"
    },
    {
      text: "Pembelajaran tidak pernah berakhir. Setiap hari adalah kesempatan baru untuk berkembang.",
      author: "Maya Angelou"
    },
    {
      text: "Masa depan milik mereka yang percaya pada keindahan mimpi mereka.",
      author: "Eleanor Roosevelt"
    },
    {
      text: "Pengetahuan adalah kekuatan, tapi implementasi adalah kunci kesuksesan.",
      author: "Tony Robbins"
    }
  ];

  // Fetch user progress when authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchUserProgress();
    }
  }, [isAuthenticated, userId]);

  // Fetch user progress
  const fetchUserProgress = async () => {
    if (!isAuthenticated || typeof window === 'undefined') return;
    
    const token = localStorage.getItem('authToken');
    if (!token) return;

    setProgressLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setUserProgress(response.data.data || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setProgressLoading(false);
    }
  };

  // Navigation handler
  const handleStartLearning = (courseString: string) => {
    router.push(`/course/${courseString}`);
  };

  const handleReviewCourse = (courseString: string) => {
    router.push(`/course/${courseString}`);
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handlePurchase = () => {
    router.push('/pricing');
  };

  // Get unique course types
  const courseTypes = Array.from(new Set(courses.map(course => course.type))).map(type => ({
    value: type,
    label: `Type ${type}`
  }));

  // Filter courses
  useEffect(() => {
    let filtered = courses;
    
    // Apply quick filter first
    if (quickFilter === 'popular') {
      filtered = [...filtered].sort((a, b) => {
        const aPoints = a.learning_point?.length || 0;
        const bPoints = b.learning_point?.length || 0;
        return bPoints - aPoints;
      }).slice(0, Math.ceil(courses.length * 0.6));
    } else if (quickFilter === 'newest') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentCourses = filtered.filter(course => 
        new Date(course.create_date) > thirtyDaysAgo
      );
      filtered = recentCourses.length > 0 ? recentCourses : 
        [...filtered].sort((a, b) => 
          new Date(b.create_date).getTime() - new Date(a.create_date).getTime()
        ).slice(0, 3);
    } else if (quickFilter === 'recommended') {
      filtered = filtered.filter(course => 
        course.learning_point && course.learning_point.length >= 3
      );
    }
    
    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(course => course.type === selectedType);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCourses(filtered);
  }, [courses, selectedType, searchTerm, quickFilter]);

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const displayedCourses = showAll ? filteredCourses : filteredCourses.slice(0, displayLimit);
  const displayedProgress = showAllProgress ? userProgress : userProgress.slice(0, progressDisplayLimit);

  // Handle quick action clicks
  const handleQuickAction = (action: 'popular' | 'newest' | 'recommended') => {
    setQuickFilter(action);
    setSelectedType('all');
    setSearchTerm('');
    setShowAll(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDefaultImage = () => {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
  };

  return (
    <div className="tw-min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <NavigationBar></NavigationBar> 
      <Head>
        <title>Courses - Platform Pembelajaran</title>
        <meta name="description" content="Jelajahi koleksi kursus menarik dan tingkatkan skill-mu dengan pembelajaran yang interaktif" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="tw-relative tw-overflow-hidden tw-pb-12">
        <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-violet-600/20 tw-to-purple-800/20"></div>
        <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
        <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
        <div className="tw-absolute tw-top-1/2 tw-left-1/2 tw-w-16 tw-h-16 tw-bg-blue-300/20 tw-rounded-full tw-blur-lg tw-animate-pulse tw-delay-500"></div>

        <div className="tw-container tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-py-12 tw-relative tw-z-10 tw-max-w-full">
          {/* Header */}
          <div className="tw-text-center tw-mb-12">
            <div className="tw-mb-8">
              <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-20 tw-h-20 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-mb-6 tw-shadow-lg">
                <BookOpen className="tw-w-10 tw-h-10 tw-text-yellow-300" />
              </div>
              <h1 className="tw-text-4xl md:tw-text-5xl lg:tw-text-6xl tw-font-bold tw-text-white tw-mb-4 tw-drop-shadow-lg">
                Explore Courses
              </h1>
              <p className="tw-text-lg md:tw-text-xl tw-text-white/90 tw-font-medium tw-drop-shadow tw-max-w-3xl tw-mx-auto">
                Jelajahi koleksi kursus menarik dan tingkatkan skill-mu dengan pembelajaran yang interaktif! 🚀✨
              </p>
            </div>
          </div>

          {/* Quote Section */}
          <div className="tw-max-w-6xl tw-mx-auto tw-mb-12">
            <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20 tw-mb-8">
              <div className="tw-flex tw-items-center tw-justify-center tw-gap-3 tw-mb-4">
                <Quote className="tw-w-8 tw-h-8 tw-text-yellow-300" />
                <h3 className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-white">
                  Learning Inspiration
                </h3>
              </div>
              <div className="tw-text-center">
                <p className="tw-text-white/95 tw-text-lg tw-font-medium tw-mb-3 tw-italic tw-leading-relaxed">
                  "{currentQuote.text}"
                </p>
                <p className="tw-text-white/80 tw-text-base tw-font-semibold">
                  — {currentQuote.author}
                </p>
              </div>
            </div>
          </div>

          {/* User Progress Section */}
          {isAuthenticated && userProgress.length > 0 && (
            <div className="tw-max-w-full tw-mx-auto tw-mb-12 tw-px-4">
              <div className="tw-bg-gradient-to-br tw-from-indigo-600/20 tw-to-purple-700/20 tw-backdrop-blur-sm tw-rounded-3xl tw-p-8 tw-border tw-border-white/30 tw-shadow-2xl">
                <div className="tw-text-center tw-mb-8">
                  <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-bg-gradient-to-br tw-from-purple-500 tw-to-indigo-600 tw-rounded-full tw-mb-4 tw-shadow-lg">
                    <Trophy className="tw-w-8 tw-h-8 tw-text-white" />
                  </div>
                  <h2 className="tw-text-3xl tw-font-bold tw-text-white tw-mb-4">
                    🎯 Progress Pembelajaran Kamu
                  </h2>
                  <p className="tw-text-white/80 tw-text-lg tw-max-w-2xl tw-mx-auto">
                    Lihat kursus yang sedang kamu ikuti dan lanjutkan perjalanan belajarmu!
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4 tw-mb-8">
                  <div className="tw-bg-gradient-to-br tw-from-green-500 tw-to-emerald-600 tw-rounded-xl tw-p-4 tw-text-center tw-text-white">
                    <Trophy className="tw-w-8 tw-h-8 tw-mx-auto tw-mb-2" />
                    <div className="tw-text-2xl tw-font-bold">
                      {userProgress.filter(c => c.overall_progress_percentage >= 100).length}
                    </div>
                    <div className="tw-text-sm tw-opacity-90">Selesai</div>
                  </div>
                  
                  <div className="tw-bg-gradient-to-br tw-from-blue-500 tw-to-cyan-600 tw-rounded-xl tw-p-4 tw-text-center tw-text-white">
                    <Rocket className="tw-w-8 tw-h-8 tw-mx-auto tw-mb-2" />
                    <div className="tw-text-2xl tw-font-bold">
                      {userProgress.filter(c => c.overall_progress_percentage > 0 && c.overall_progress_percentage < 100).length}
                    </div>
                    <div className="tw-text-sm tw-opacity-90">Berlangsung</div>
                  </div>
                  
                  <div className="tw-bg-gradient-to-br tw-from-purple-500 tw-to-violet-600 tw-rounded-xl tw-p-4 tw-text-center tw-text-white">
                    <Target className="tw-w-8 tw-h-8 tw-mx-auto tw-mb-2" />
                    <div className="tw-text-2xl tw-font-bold">
                      {Math.round(userProgress.reduce((acc, c) => acc + c.overall_progress_percentage, 0) / userProgress.length) || 0}%
                    </div>
                    <div className="tw-text-sm tw-opacity-90">Rata-rata</div>
                  </div>
                  
                  <div className="tw-bg-gradient-to-br tw-from-orange-500 tw-to-red-500 tw-rounded-xl tw-p-4 tw-text-center tw-text-white">
                    <Brain className="tw-w-8 tw-h-8 tw-mx-auto tw-mb-2" />
                    <div className="tw-text-2xl tw-font-bold">
                      {userProgress.length}
                    </div>
                    <div className="tw-text-sm tw-opacity-90">Total Kursus</div>
                  </div>
                </div>

                {/* Progress Courses List */}
                <div className="tw-mb-6">
                  <h3 className="tw-text-xl tw-font-bold tw-text-white tw-mb-6 tw-text-center">
                    📚 Kursus yang Sedang Kamu Ikuti
                  </h3>
                  
                  {progressLoading ? (
                    <div className="tw-flex tw-justify-center tw-items-center tw-py-8">
                      <div className="tw-animate-spin tw-rounded-full tw-h-8 tw-w-8 tw-border-b-2 tw-border-white"></div>
                    </div>
                  ) : (
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                      {displayedProgress.map((course) => (
                        <div
                          key={course.id}
                          className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-transition-all tw-duration-300 tw-hover:shadow-2xl tw-overflow-hidden tw-relative"
                        >
                          <div className="tw-absolute tw-top-4 tw-left-4 tw-z-10">
                            <div className={`tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-bold tw-flex tw-items-center tw-gap-1 ${
                              course.overall_progress_percentage >= 100 
                                ? 'tw-bg-green-500' 
                                : 'tw-bg-blue-500'
                            }`}>
                              {course.overall_progress_percentage >= 100 ? (
                                <Trophy className="tw-w-4 tw-h-4" />
                              ) : (
                                <Zap className="tw-w-4 tw-h-4" />
                              )}
                              {Math.round(course.overall_progress_percentage)}%
                            </div>
                          </div>
                          
                          <div className="tw-flex tw-flex-col md:tw-flex-row">
                            <div className="tw-relative tw-w-full md:tw-w-48 tw-h-32 md:tw-h-auto">
                              <img
                                src={course.imageurl || getDefaultImage()}
                                alt={course.title}
                                className="tw-w-full tw-h-full tw-object-cover"
                              />
                              <div className="tw-absolute tw-top-4 tw-right-4">
                                <div className="tw-bg-purple-600 tw-text-white tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-semibold">
                                  Type {course.type}
                                </div>
                              </div>
                              <div className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-h-2 tw-bg-gray-200">
                                <div 
                                  className={`tw-h-full tw-transition-all tw-duration-500 ${
                                    course.overall_progress_percentage >= 100
                                      ? 'tw-bg-gradient-to-r tw-from-green-400 tw-to-green-600'
                                      : 'tw-bg-gradient-to-r tw-from-blue-400 tw-to-blue-600'
                                  }`}
                                  style={{ width: `${course.overall_progress_percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="tw-flex-1 tw-p-6">
                              <div className="tw-flex tw-justify-between tw-items-start tw-mb-3">
                                <h5 className="tw-font-bold tw-text-lg tw-text-purple-600 tw-leading-tight">
                                  {course.title}
                                </h5>
                              </div>
                              
                              <p className="tw-text-gray-600 tw-text-sm tw-mb-4 tw-leading-relaxed tw-line-clamp-2">
                                {course.description}
                              </p>
                              
                              <div className="tw-flex tw-items-center tw-justify-between tw-gap-4">
                                <div className="tw-text-sm tw-text-gray-500">
                                  <span className="tw-font-semibold">
                                    {course.finished_quiz_topics}/{course.quiz} Quiz • {course.finished_materials}/{course.material} Materials
                                  </span>
                                </div>
                                
                                <button 
                                  onClick={() => course.overall_progress_percentage >= 100 
                                    ? handleReviewCourse(course.course_string)
                                    : handleStartLearning(course.course_string)
                                  }
                                  className={`tw-font-bold tw-py-2 tw-px-4 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md tw-text-white hover:tw-shadow-lg hover:tw-scale-105 tw-text-sm ${
                                    course.overall_progress_percentage >= 100
                                      ? 'tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-600' 
                                      : 'tw-bg-gradient-to-r tw-from-blue-500 tw-to-cyan-600'
                                  }`}
                                >
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    {course.overall_progress_percentage >= 100 ? (
                                      <>
                                        <RotateCcw className="tw-w-4 tw-h-4" />
                                        Review
                                      </>
                                    ) : (
                                      <>
                                        <Play className="tw-w-4 tw-h-4" />
                                        Lanjutkan
                                      </>
                                    )}
                                  </div>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {userProgress.length > progressDisplayLimit && (
                    <div className="tw-text-center tw-mt-6">
                      <button
                        onClick={() => setShowAllProgress(!showAllProgress)}
                        className="tw-bg-white/20 tw-text-white tw-font-bold tw-py-3 tw-px-6 tw-rounded-xl tw-border tw-border-white/30 tw-backdrop-blur-sm tw-transition-all tw-duration-300 hover:tw-bg-white/30"
                      >
                        <div className="tw-flex tw-items-center tw-gap-2">
                          {showAllProgress ? (
                            <>
                              Tampilkan Lebih Sedikit
                              <ChevronUp className="tw-w-4 tw-h-4" />
                            </>
                          ) : (
                            <>
                              Tampilkan Semua ({userProgress.length} kursus)
                              <ChevronDown className="tw-w-4 tw-h-4" />
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Login/Purchase Section - Show when not logged in or no progress */}
          {(!isAuthenticated || userProgress.length === 0) && (
            <div className="tw-max-w-full tw-mx-auto tw-mb-12 tw-px-4">
              <div className="tw-bg-gradient-to-br tw-from-purple-600/20 tw-to-pink-600/20 tw-backdrop-blur-sm tw-rounded-3xl tw-p-8 tw-border tw-border-white/30 tw-shadow-2xl">
                <div className="tw-text-center tw-mb-8">
                  <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-bg-gradient-to-br tw-from-purple-500 tw-to-pink-600 tw-rounded-full tw-mb-4 tw-shadow-lg">
                    {!isAuthenticated ? <LogIn className="tw-w-8 tw-h-8 tw-text-white" /> : <Gift className="tw-w-8 tw-h-8 tw-text-white" />}
                  </div>
                  <h2 className="tw-text-3xl tw-font-bold tw-text-white tw-mb-4">
                    {!isAuthenticated ? "🔐 Masuk untuk Melacak Progress" : "🎁 Mulai Petualangan Belajarmu"}
                  </h2>
                  <p className="tw-text-white/80 tw-text-lg tw-max-w-2xl tw-mx-auto tw-mb-6">
                    {!isAuthenticated 
                      ? "Login untuk melihat progress pembelajaran dan mengakses fitur-fitur eksklusif lainnya!"
                      : "Daftar kursus premium untuk memulai perjalanan pembelajaran yang menakjubkan!"
                    }
                  </p>
                </div>

                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6 tw-mb-8">
                  <div className="tw-bg-white/15 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-text-center tw-border tw-border-white/20">
                    <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-blue-400 tw-to-blue-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                      <Trophy className="tw-w-6 tw-h-6 tw-text-white" />
                    </div>
                    <h3 className="tw-text-lg tw-font-bold tw-text-white tw-mb-2">Progress Tracking</h3>
                    <p className="tw-text-white/80 tw-text-sm">Pantau kemajuan belajarmu dengan sistem progress yang lengkap</p>
                  </div>

                  <div className="tw-bg-white/15 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-text-center tw-border tw-border-white/20">
                    <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-green-400 tw-to-green-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                      <Users className="tw-w-6 tw-h-6 tw-text-white" />
                    </div>
                    <h3 className="tw-text-lg tw-font-bold tw-text-white tw-mb-2">Komunitas Aktif</h3>
                    <p className="tw-text-white/80 tw-text-sm">Bergabung dengan komunitas learner yang saling mendukung</p>
                  </div>

                  <div className="tw-bg-white/15 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-text-center tw-border tw-border-white/20">
                    <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-purple-400 tw-to-purple-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                      <Brain className="tw-w-6 tw-h-6 tw-text-white" />
                    </div>
                    <h3 className="tw-text-lg tw-font-bold tw-text-white tw-mb-2">Personalized Learning</h3>
                    <p className="tw-text-white/80 tw-text-sm">Pembelajaran yang disesuaikan dengan kemampuanmu</p>
                  </div>
                </div>

                <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4 tw-justify-center">
                  {!isAuthenticated ? (
                    <>
                      <button 
                        onClick={handleLogin}
                        className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-violet-600 tw-text-white tw-font-bold tw-py-4 tw-px-8 tw-rounded-xl tw-shadow-lg tw-transition-all tw-duration-300 hover:tw-shadow-xl hover:tw-scale-105"
                      >
                        <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                          <LogIn className="tw-w-5 tw-h-5" />
                          Masuk Sekarang
                        </div>
                      </button>
                      <button 
                        onClick={handlePurchase}
                        className="tw-bg-white/20 tw-text-white tw-font-bold tw-py-4 tw-px-8 tw-rounded-xl tw-border tw-border-white/30 tw-backdrop-blur-sm tw-transition-all tw-duration-300 hover:tw-bg-white/30"
                      >
                        <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                          <Users className="tw-w-5 tw-h-5" />
                          Daftar Gratis
                        </div>
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handlePurchase}
                      className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-violet-600 tw-text-white tw-font-bold tw-py-4 tw-px-8 tw-rounded-xl tw-shadow-lg tw-transition-all tw-duration-300 hover:tw-shadow-xl hover:tw-scale-105"
                    >
                      <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                        <ShoppingCart className="tw-w-5 tw-h-5" />
                        Beli Kursus Premium
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Featured Section */}
          <div className="tw-max-w-full tw-mx-auto tw-mb-12 tw-px-4">
            <div className="tw-text-center tw-mb-8">
              <h2 className="tw-text-3xl tw-font-bold tw-text-white tw-mb-4">
                🌟 Temukan Kursus Terbaikmu
              </h2>
              <p className="tw-text-white/80 tw-text-lg">
                Mulai perjalanan belajarmu dengan pilihan kursus yang tepat!
              </p>
            </div>
            
            {/* Learning Path Cards */}
            <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 lg:tw-grid-cols-7 tw-gap-3 tw-mb-8">
              {[
                { icon: "🎯", name: "Skill Boost", color: "tw-from-blue-500 tw-to-cyan-500", desc: "Tingkatkan keahlianmu" },
                { icon: "⚡", name: "Quick Learn", color: "tw-from-yellow-500 tw-to-orange-500", desc: "Belajar cepat efektif" },
                { icon: "📝", name: "Quiz", color: "tw-from-green-500 tw-to-emerald-500", desc: "Uji pemahamanmu" },
                { icon: "🎯", name: "Drill Exam", color: "tw-from-red-500 tw-to-pink-500", desc: "Latihan soal intensif" },
                { icon: "📊", name: "Analysis", color: "tw-from-purple-500 tw-to-violet-500", desc: "Analisis mendalam" },
                { icon: "🧭", name: "Exploration", color: "tw-from-indigo-500 tw-to-blue-500", desc: "Jelajahi topik baru" },
                { icon: "🏋️", name: "Self-Practice", color: "tw-from-teal-500 tw-to-cyan-500", desc: "Latihan mandiri" }
              ].map((item, index) => (
                <div
                  key={index}
                  className={`tw-bg-gradient-to-br ${item.color} tw-rounded-2xl tw-p-3 tw-text-center tw-cursor-pointer tw-transition-all tw-duration-300 tw-hover:scale-105 tw-hover:shadow-xl tw-group tw-relative tw-overflow-hidden tw-min-h-[100px] tw-flex tw-flex-col tw-justify-center`}
                >
                  <div className="tw-absolute tw-inset-0 tw-bg-white/20 tw-opacity-0 tw-group-hover:tw-opacity-100 tw-transition-opacity tw-duration-300"></div>
                  <div className="tw-relative tw-z-10">
                    <div className="tw-text-2xl tw-mb-2 tw-group-hover:scale-110 tw-transition-transform">
                      {item.icon}
                    </div>
                    <p className="tw-text-white tw-font-bold tw-text-xs tw-mb-1 tw-leading-tight">
                      {item.name}
                    </p>
                    <p className="tw-text-white/80 tw-text-xs tw-leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
              <div 
                onClick={() => handleQuickAction('popular')}
                className={`tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-text-center tw-group tw-cursor-pointer tw-transition-all tw-duration-300 tw-hover:scale-105 tw-relative ${
                  quickFilter === 'popular' 
                    ? 'tw-bg-yellow-500/30 tw-border-yellow-400/50 tw-shadow-lg tw-shadow-yellow-500/25' 
                    : 'tw-bg-white/10 tw-border-white/20 tw-hover:bg-white/20'
                }`}
              >
                <div className={`tw-w-16 tw-h-16 tw-bg-gradient-to-br tw-from-yellow-400 tw-to-orange-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4 tw-group-hover:scale-110 tw-transition-transform tw-shadow-lg ${
                  quickFilter === 'popular' ? 'tw-ring-4 tw-ring-yellow-300/50' : ''
                }`}>
                  <Star className="tw-w-8 tw-h-8 tw-text-white" />
                </div>
                <h3 className={`tw-text-xl tw-font-bold tw-mb-2 ${
                  quickFilter === 'popular' ? 'tw-text-yellow-100' : 'tw-text-white'
                }`}>
                  Kursus Terpopuler
                  {quickFilter === 'popular' && (
                    <span className="tw-ml-2 tw-text-yellow-300">✨</span>
                  )}
                </h3>
                <p className="tw-text-white/80 tw-text-sm">
                  Lihat kursus yang paling banyak diambil pelajar lain
                </p>
                <div className="tw-mt-4 tw-text-white/60 tw-text-xs">
                  📊 {courses.length > 0 ? Math.ceil(courses.length * 0.6) : 0} kursus tersedia
                </div>
                {quickFilter === 'popular' && (
                  <div className="tw-absolute tw-top-2 tw-right-2 tw-w-3 tw-h-3 tw-bg-yellow-400 tw-rounded-full tw-animate-pulse"></div>
                )}
              </div>
              
              <div 
                onClick={() => handleQuickAction('newest')}
                className={`tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-text-center tw-group tw-cursor-pointer tw-transition-all tw-duration-300 tw-hover:scale-105 tw-relative ${
                  quickFilter === 'newest' 
                    ? 'tw-bg-green-500/30 tw-border-green-400/50 tw-shadow-lg tw-shadow-green-500/25' 
                    : 'tw-bg-white/10 tw-border-white/20 tw-hover:bg-white/20'
                }`}
              >
                <div className={`tw-w-16 tw-h-16 tw-bg-gradient-to-br tw-from-green-400 tw-to-blue-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4 tw-group-hover:scale-110 tw-transition-transform tw-shadow-lg ${
                  quickFilter === 'newest' ? 'tw-ring-4 tw-ring-green-300/50' : ''
                }`}>
                  <Clock className="tw-w-8 tw-h-8 tw-text-white" />
                </div>
                <h3 className={`tw-text-xl tw-font-bold tw-mb-2 ${
                  quickFilter === 'newest' ? 'tw-text-green-100' : 'tw-text-white'
                }`}>
                  Kursus Terbaru
                  {quickFilter === 'newest' && (
                    <span className="tw-ml-2 tw-text-green-300">🆕</span>
                  )}
                </h3>
                <p className="tw-text-white/80 tw-text-sm">
                  Temukan kursus-kursus yang baru saja dirilis
                </p>
                <div className="tw-mt-4 tw-text-white/60 tw-text-xs">
                  🆕 {courses.filter(course => {
                    const courseDate = new Date(course.create_date);
                    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    return courseDate > thirtyDaysAgo;
                  }).length} kursus baru
                </div>
                {quickFilter === 'newest' && (
                  <div className="tw-absolute tw-top-2 tw-right-2 tw-w-3 tw-h-3 tw-bg-green-400 tw-rounded-full tw-animate-pulse"></div>
                )}
              </div>
              
              <div 
                onClick={() => handleQuickAction('recommended')}
                className={`tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-text-center tw-group tw-cursor-pointer tw-transition-all tw-duration-300 tw-hover:scale-105 tw-relative ${
                  quickFilter === 'recommended' 
                    ? 'tw-bg-purple-500/30 tw-border-purple-400/50 tw-shadow-lg tw-shadow-purple-500/25' 
                    : 'tw-bg-white/10 tw-border-white/20 tw-hover:bg-white/20'
                }`}
              >
                <div className={`tw-w-16 tw-h-16 tw-bg-gradient-to-br tw-from-purple-400 tw-to-pink-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4 tw-group-hover:scale-110 tw-transition-transform tw-shadow-lg ${
                  quickFilter === 'recommended' ? 'tw-ring-4 tw-ring-purple-300/50' : ''
                }`}>
                  <Award className="tw-w-8 tw-h-8 tw-text-white" />
                </div>
                <h3 className={`tw-text-xl tw-font-bold tw-mb-2 ${
                  quickFilter === 'recommended' ? 'tw-text-purple-100' : 'tw-text-white'
                }`}>
                  Rekomendasi
                  {quickFilter === 'recommended' && (
                    <span className="tw-ml-2 tw-text-purple-300">⭐</span>
                  )}
                </h3>
                <p className="tw-text-white/80 tw-text-sm">
                  Kursus yang direkomendasikan khusus untukmu
                </p>
                <div className="tw-mt-4 tw-text-white/60 tw-text-xs">
                  ⭐ {courses.filter(course => course.learning_point && course.learning_point.length >= 3).length} kursus pilihan
                </div>
                {quickFilter === 'recommended' && (
                  <div className="tw-absolute tw-top-2 tw-right-2 tw-w-3 tw-h-3 tw-bg-purple-400 tw-rounded-full tw-animate-pulse"></div>
                )}
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="tw-max-w-full tw-mx-auto tw-mb-8 tw-px-4">
            <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20">
              <div className="tw-flex tw-flex-col lg:tw-flex-row tw-gap-4 tw-items-center tw-justify-between">
                <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4 tw-w-full lg:tw-w-auto">
                  <div className="tw-relative">
                    <Search className="tw-absolute tw-left-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-white/60 tw-w-5 tw-h-5" />
                    <input
                      type="text"
                      placeholder="Cari kursus..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setQuickFilter('all');
                      }}
                      className="tw-pl-10 tw-pr-4 tw-py-3 tw-rounded-xl tw-border-0 tw-bg-white/20 tw-text-white tw-placeholder-white/60 tw-backdrop-blur-sm tw-w-full sm:tw-w-64"
                    />
                  </div>
                  
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value === 'all' ? 'all' : Number(e.target.value));
                      setQuickFilter('all');
                    }}
                    className="tw-px-4 tw-py-3 tw-rounded-xl tw-border-0 tw-bg-white/20 tw-text-white tw-backdrop-blur-sm"
                  >
                    <option value="all">Semua Tipe</option>
                    {courseTypes.map(type => (
                      <option key={type.value} value={type.value} className="tw-text-gray-800">
                        {type.label}
                      </option>
                    ))}
                  </select>

                  {quickFilter !== 'all' && (
                    <button
                      onClick={() => {
                        setQuickFilter('all');
                        setSelectedType('all');
                        setSearchTerm('');
                      }}
                      className="tw-px-4 tw-py-3 tw-rounded-xl tw-bg-red-500/80 tw-text-white tw-font-semibold tw-backdrop-blur-sm tw-transition-all tw-duration-300 tw-hover:bg-red-600/80"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
                
                <div className="tw-flex tw-gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`tw-p-3 tw-rounded-xl tw-transition-all tw-duration-300 ${
                      viewMode === 'grid' 
                        ? 'tw-bg-white tw-text-purple-600' 
                        : 'tw-bg-white/20 tw-text-white hover:tw-bg-white/30'
                    }`}
                  >
                    <Grid className="tw-w-5 tw-h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`tw-p-3 tw-rounded-xl tw-transition-all tw-duration-300 ${
                      viewMode === 'list' 
                        ? 'tw-bg-white tw-text-purple-600' 
                        : 'tw-bg-white/20 tw-text-white hover:tw-bg-white/30'
                    }`}
                  >
                    <List className="tw-w-5 tw-h-5" />
                  </button>
                </div>
              </div>
              
              <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-4 tw-text-sm tw-text-white/80 tw-mt-4">
                <div className="tw-flex tw-items-center tw-gap-2">
                  <Eye className="tw-w-4 tw-h-4 tw-text-blue-300" />
                  <span>Showing {displayedCourses.length} of {filteredCourses.length} courses</span>
                </div>
                <div className="tw-flex tw-items-center tw-gap-2">
                  <Filter className="tw-w-4 tw-h-4 tw-text-green-300" />
                  <span>
                    Filter: {quickFilter === 'all' 
                      ? (selectedType === 'all' ? 'All Types' : `Type ${selectedType}`)
                      : quickFilter === 'popular' ? 'Popular Courses'
                      : quickFilter === 'newest' ? 'Newest Courses' 
                      : 'Recommended Courses'
                    }
                  </span>
                </div>
                {quickFilter !== 'all' && (
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <Star className="tw-w-4 tw-h-4 tw-text-yellow-300" />
                    <span className="tw-capitalize tw-font-semibold">
                      {quickFilter === 'popular' ? '🔥 Trending' 
                       : quickFilter === 'newest' ? '🆕 Fresh' 
                       : '⭐ Curated'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="tw-max-w-full tw-mx-auto tw-mb-12 tw-px-4">
            {loading ? (
              <div className="tw-flex tw-justify-center tw-items-center tw-py-12">
                <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-white"></div>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-6">
                    {displayedCourses.map((course) => {
                      const userCourseProgress = userProgress.find(p => p.id === course.id);
                      const hasProgress = userCourseProgress && userCourseProgress.overall_progress_percentage > 0;
                      const isCompleted = userCourseProgress && userCourseProgress.overall_progress_percentage >= 100;
                      
                      return (
                        <div
                          key={course.id}
                          className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-transition-all tw-duration-300 tw-hover:shadow-2xl tw-hover:scale-105 tw-overflow-hidden tw-flex tw-flex-col tw-h-full tw-relative"
                        >
                          {hasProgress && (
                            <div className="tw-absolute tw-top-4 tw-left-4 tw-z-10">
                              <div className={`tw-text-white tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold tw-flex tw-items-center tw-gap-1 ${
                                isCompleted ? 'tw-bg-green-500' : 'tw-bg-blue-500'
                              }`}>
                                {isCompleted ? (
                                  <Trophy className="tw-w-3 tw-h-3" />
                                ) : (
                                  <Zap className="tw-w-3 tw-h-3" />
                                )}
                                {Math.round(userCourseProgress!.overall_progress_percentage)}%
                              </div>
                            </div>
                          )}
                          
                          <div className="tw-relative tw-h-48">
                            <img
                              src={course.imageurl || getDefaultImage()}
                              alt={course.title}
                              className="tw-w-full tw-h-full tw-object-cover"
                            />
                            <div className="tw-absolute tw-top-4 tw-right-4">
                              <div className="tw-bg-purple-600 tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-semibold">
                                Type {course.type}
                              </div>
                            </div>
                            {hasProgress && (
                              <div className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-h-1 tw-bg-gray-200">
                                <div 
                                  className={`tw-h-full tw-transition-all tw-duration-500 ${
                                    isCompleted 
                                      ? 'tw-bg-gradient-to-r tw-from-green-400 tw-to-green-600'
                                      : 'tw-bg-gradient-to-r tw-from-blue-400 tw-to-blue-600'
                                  }`}
                                  style={{ width: `${userCourseProgress!.overall_progress_percentage}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                          
                          <div className="tw-p-6 tw-flex tw-flex-col tw-flex-grow">
                            <h5 className="tw-font-bold tw-mb-3 tw-text-lg tw-text-purple-600 tw-leading-tight">
                              {course.title}
                            </h5>
                            <p className="tw-text-gray-600 tw-text-sm tw-mb-4 tw-leading-relaxed tw-line-clamp-3 tw-flex-grow">
                              {course.description}
                            </p>
                            
                            {course.learning_point && course.learning_point.length > 0 && (
                              <div className="tw-mb-4">
                                <p className="tw-text-gray-700 tw-font-semibold tw-text-sm tw-mb-2">
                                  Learning Points:
                                </p>
                                <div className="tw-space-y-1">
                                  {course.learning_point.slice(0, 2).map((point, index) => (
                                    <div key={index} className="tw-flex tw-items-start tw-gap-2 tw-text-sm tw-text-gray-600">
                                      <Star className="tw-w-3 tw-h-3 tw-text-yellow-500 tw-mt-1 tw-flex-shrink-0" />
                                      <span className="tw-line-clamp-1">{point}</span>
                                    </div>
                                  ))}
                                  {course.learning_point.length > 2 && (
                                    <p className="tw-text-xs tw-text-gray-500 tw-pl-5">
                                      +{course.learning_point.length - 2} more points
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="tw-flex tw-items-center tw-justify-between tw-mb-4 tw-text-sm tw-text-gray-500">
                              <div className="tw-flex tw-items-center tw-gap-2">
                                <Calendar className="tw-w-4 tw-h-4" />
                                <span>{formatDate(course.create_date)}</span>
                              </div>
                              <div className="tw-flex tw-items-center tw-gap-2">
                                <User className="tw-w-4 tw-h-4" />
                                <span>ID: {course.create_user_id}</span>
                              </div>
                            </div>
                            
                            <div className="tw-mt-auto">
                              <button 
                                onClick={() => {
                                  if (isCompleted) {
                                    handleReviewCourse(course.course_string);
                                  } else {
                                    handleStartLearning(course.course_string);
                                  }
                                }}
                                className={`tw-w-full tw-font-bold tw-py-3 tw-px-4 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md tw-text-white hover:tw-shadow-lg hover:tw-scale-105 ${
                                  isCompleted
                                    ? 'tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-600'
                                    : hasProgress 
                                      ? 'tw-bg-gradient-to-r tw-from-blue-500 tw-to-cyan-600' 
                                      : 'tw-bg-gradient-to-r tw-from-purple-500 tw-to-violet-600'
                                }`}
                              >
                                <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                                  {isCompleted ? (
                                    <>
                                      <RotateCcw className="tw-w-5 tw-h-5" />
                                      Review
                                    </>
                                  ) : hasProgress ? (
                                    <>
                                      <Play className="tw-w-5 tw-h-5" />
                                      Lanjutkan Belajar
                                    </>
                                  ) : (
                                    <>
                                      <Play className="tw-w-5 tw-h-5" />
                                      Mulai Belajar
                                    </>
                                  )}
                                  <ChevronRight className="tw-w-4 tw-h-4" />
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="tw-space-y-6">
                    {displayedCourses.map((course) => {
                      const userCourseProgress = userProgress.find(p => p.id === course.id);
                      const hasProgress = userCourseProgress && userCourseProgress.overall_progress_percentage > 0;
                      const isCompleted = userCourseProgress && userCourseProgress.overall_progress_percentage >= 100;
                      
                      return (
                        <div
                          key={course.id}
                          className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-transition-all tw-duration-300 tw-hover:shadow-2xl tw-overflow-hidden tw-relative"
                        >
                          {hasProgress && (
                            <div className="tw-absolute tw-top-4 tw-left-4 tw-z-10">
                              <div className={`tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-bold tw-flex tw-items-center tw-gap-2 ${
                                isCompleted ? 'tw-bg-green-500' : 'tw-bg-blue-500'
                              }`}>
                                {isCompleted ? (
                                  <Trophy className="tw-w-4 tw-h-4" />
                                ) : (
                                  <Zap className="tw-w-4 tw-h-4" />
                                )}
                                Progress: {Math.round(userCourseProgress!.overall_progress_percentage)}%
                              </div>
                            </div>
                          )}
                          
                          <div className="tw-flex tw-flex-col md:tw-flex-row">
                            <div className="tw-relative tw-w-full md:tw-w-64 tw-h-48 md:tw-h-auto">
                              <img
                                src={course.imageurl || getDefaultImage()}
                                alt={course.title}
                                className="tw-w-full tw-h-full tw-object-cover"
                              />
                              <div className="tw-absolute tw-top-4 tw-right-4">
                                <div className="tw-bg-purple-600 tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-semibold">
                                  Type {course.type}
                                </div>
                              </div>
                              {hasProgress && (
                                <div className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-h-2 tw-bg-gray-200">
                                  <div 
                                    className={`tw-h-full tw-transition-all tw-duration-500 ${
                                      isCompleted 
                                        ? 'tw-bg-gradient-to-r tw-from-green-400 tw-to-green-600'
                                        : 'tw-bg-gradient-to-r tw-from-blue-400 tw-to-blue-600'
                                    }`}
                                    style={{ width: `${userCourseProgress!.overall_progress_percentage}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                            
                            <div className="tw-flex-1 tw-p-6">
                              <div className="tw-flex tw-justify-between tw-items-start tw-mb-4">
                                <h5 className="tw-font-bold tw-text-xl tw-text-purple-600">
                                  {course.title}
                                </h5>
                                <div className="tw-flex tw-items-center tw-gap-4 tw-text-sm tw-text-gray-500">
                                  <div className="tw-flex tw-items-center tw-gap-1">
                                    <Calendar className="tw-w-4 tw-h-4" />
                                    <span>{formatDate(course.create_date)}</span>
                                  </div>
                                  <div className="tw-flex tw-items-center tw-gap-1">
                                    <User className="tw-w-4 tw-h-4" />
                                    <span>ID: {course.create_user_id}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <p className="tw-text-gray-600 tw-mb-4 tw-leading-relaxed">
                                {course.description}
                              </p>
                              
                              {course.learning_point && course.learning_point.length > 0 && (
                                <div className="tw-mb-4">
                                  <p className="tw-text-gray-700 tw-font-semibold tw-mb-2">
                                    Learning Points:
                                  </p>
                                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-2">
                                    {course.learning_point.map((point, index) => (
                                      <div key={index} className="tw-flex tw-items-start tw-gap-2 tw-text-sm tw-text-gray-600">
                                        <Star className="tw-w-3 tw-h-3 tw-text-yellow-500 tw-mt-1 tw-flex-shrink-0" />
                                        <span>{point}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="tw-flex tw-justify-end">
                                <button 
                                  onClick={() => {
                                    if (isCompleted) {
                                      handleReviewCourse(course.course_string);
                                    } else {
                                      handleStartLearning(course.course_string);
                                    }
                                  }}
                                  className={`tw-font-bold tw-py-3 tw-px-6 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md tw-text-white hover:tw-shadow-lg hover:tw-scale-105 ${
                                    isCompleted
                                      ? 'tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-600'
                                      : hasProgress 
                                        ? 'tw-bg-gradient-to-r tw-from-blue-500 tw-to-cyan-600' 
                                        : 'tw-bg-gradient-to-r tw-from-purple-500 tw-to-violet-600'
                                  }`}
                                >
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    {isCompleted ? (
                                      <>
                                        <RotateCcw className="tw-w-5 tw-h-5" />
                                        Review
                                      </>
                                    ) : hasProgress ? (
                                      <>
                                        <Play className="tw-w-5 tw-h-5" />
                                        Lanjutkan Belajar
                                      </>
                                    ) : (
                                      <>
                                        <Play className="tw-w-5 tw-h-5" />
                                        Mulai Belajar
                                      </>
                                    )}
                                    <ChevronRight className="tw-w-4 tw-h-4" />
                                  </div>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {filteredCourses.length > displayLimit && (
                  <div className="tw-text-center tw-mt-8">
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="tw-bg-white tw-text-purple-600 tw-font-bold tw-py-3 tw-px-8 tw-rounded-xl tw-shadow-lg tw-transition-all tw-duration-300 hover:tw-shadow-xl hover:tw-scale-105"
                    >
                      <div className="tw-flex tw-items-center tw-gap-2">
                        {showAll ? (
                          <>
                            Tampilkan Lebih Sedikit
                            <ChevronUp className="tw-w-5 tw-h-5" />
                          </>
                        ) : (
                          <>
                            Tampilkan Semua ({filteredCourses.length} kursus)
                            <ChevronDown className="tw-w-5 tw-h-5" />
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                )}

                {filteredCourses.length === 0 && (
                  <div className="tw-text-center tw-py-12">
                    <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-8 tw-border tw-border-white/20">
                      <BookOpen className="tw-w-16 tw-h-16 tw-text-white/60 tw-mx-auto tw-mb-4" />
                      <h3 className="tw-text-xl tw-font-bold tw-text-white tw-mb-2">
                        Tidak ada kursus ditemukan
                      </h3>
                      <p className="tw-text-white/80">
                        Coba ubah filter atau kata kunci pencarian Anda
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Enhanced Learning Tips */}
          <div className="tw-max-w-6xl tw-mx-auto tw-mt-12 tw-mb-12">
            <div className="tw-bg-gradient-to-br tw-from-indigo-600/20 tw-to-purple-700/20 tw-backdrop-blur-sm tw-rounded-3xl tw-p-8 tw-border tw-border-white/30 tw-shadow-2xl">
              <div className="tw-text-center tw-mb-8">
                <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-bg-gradient-to-br tw-from-yellow-400 tw-to-orange-500 tw-rounded-full tw-mb-4 tw-shadow-lg">
                  <Brain className="tw-w-8 tw-h-8 tw-text-white" />
                </div>
                <h4 className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-white tw-mb-4">
                  💡 Tips Maksimalkan Pembelajaran
                </h4>
                <p className="tw-text-white/80 tw-text-lg tw-max-w-2xl tw-mx-auto">
                  Ikuti panduan ini untuk mendapatkan hasil pembelajaran yang optimal dan mencapai tujuan belajarmu!
                </p>
              </div>

              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6 tw-mb-8">
                {[
                  {
                    icon: <Clock className="tw-w-6 tw-h-6" />,
                    title: "Konsistensi Harian",
                    desc: "Buat jadwal belajar yang konsisten setiap hari, minimal 30 menit",
                    color: "tw-from-blue-500 tw-to-cyan-500"
                  },
                  {
                    icon: <Target className="tw-w-6 tw-h-6" />,
                    title: "Catat Poin Penting",
                    desc: "Selalu catat poin-poin penting dan rangkum materi yang sudah dipelajari",
                    color: "tw-from-green-500 tw-to-emerald-500"
                  },
                  {
                    icon: <Zap className="tw-w-6 tw-h-6" />,
                    title: "Praktik Langsung",
                    desc: "Praktikkan ilmu yang sudah dipelajari dengan project nyata",
                    color: "tw-from-yellow-500 tw-to-orange-500"
                  },
                  {
                    icon: <Users className="tw-w-6 tw-h-6" />,
                    title: "Bergabung Komunitas",
                    desc: "Aktif di komunitas learner untuk sharing dan networking",
                    color: "tw-from-purple-500 tw-to-violet-500"
                  },
                  {
                    icon: <TrendingUp className="tw-w-6 tw-h-6" />,
                    title: "Evaluasi Berkala",
                    desc: "Lakukan evaluasi progress secara berkala dan adjust strategi belajar",
                    color: "tw-from-pink-500 tw-to-rose-500"
                  },
                  {
                    icon: <BookOpen className="tw-w-6 tw-h-6" />,
                    title: "Jangan Takut Bertanya",
                    desc: "Aktif bertanya dan berdiskusi untuk memperdalam pemahaman",
                    color: "tw-from-indigo-500 tw-to-blue-500"
                  }
                ].map((tip, index) => (
                  <div
                    key={index}
                    className={`tw-bg-gradient-to-br ${tip.color} tw-rounded-2xl tw-p-6 tw-text-white tw-transition-all tw-duration-300 tw-hover:scale-105 tw-hover:shadow-xl tw-group`}
                  >
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-3">
                      <div className="tw-w-10 tw-h-10 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-flex tw-items-center tw-justify-center tw-group-hover:scale-110 tw-transition-transform">
                        {tip.icon}
                      </div>
                      <h5 className="tw-font-bold tw-text-lg">{tip.title}</h5>
                    </div>
                    <p className="tw-text-white/90 tw-text-sm tw-leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Study Method Cards */}
              <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20">
                <h5 className="tw-text-xl tw-font-bold tw-text-white tw-mb-4 tw-text-center">
                  🎯 Metode Belajar Efektif
                </h5>
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4">
                  {[
                    { method: "Pomodoro", desc: "25 menit fokus + 5 menit istirahat", emoji: "⏰" },
                    { method: "Active Recall", desc: "Uji pemahaman tanpa melihat materi", emoji: "🧠" },
                    { method: "Spaced Repetition", desc: "Review materi dalam interval waktu", emoji: "📅" },
                    { method: "Feynman Technique", desc: "Jelaskan konsep dengan bahasa sederhana", emoji: "💬" }
                  ].map((method, index) => (
                    <div key={index} className="tw-text-center tw-p-4 tw-bg-white/5 tw-rounded-xl tw-border tw-border-white/10">
                      <div className="tw-text-2xl tw-mb-2">{method.emoji}</div>
                      <h6 className="tw-font-bold tw-text-white tw-mb-1">{method.method}</h6>
                      <p className="tw-text-white/80 tw-text-sm">{method.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Call to Action */}
          <div className="tw-max-w-6xl tw-mx-auto tw-mt-12">
            <div className="tw-relative tw-overflow-hidden tw-bg-gradient-to-br tw-from-purple-600 tw-via-violet-600 tw-to-indigo-700 tw-rounded-3xl tw-p-8 tw-text-center tw-shadow-2xl">
              {/* Animated Background Elements */}
              <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-overflow-hidden">
                <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/20 tw-rounded-full tw-blur-xl tw-animate-pulse tw-delay-1000"></div>
                <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-500"></div>
                <div className="tw-absolute tw-top-1/2 tw-left-1/2 tw-w-16 tw-h-16 tw-bg-blue-300/20 tw-rounded-full tw-blur-lg tw-animate-pulse"></div>
              </div>

              <div className="tw-relative tw-z-10">
                <div className="tw-mb-8">
                  <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-20 tw-h-20 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-mb-6 tw-shadow-lg">
                    <Rocket className="tw-w-10 tw-h-10 tw-text-white" />
                  </div>
                  <h3 className="tw-text-3xl md:tw-text-4xl tw-font-bold tw-text-white tw-mb-4">
                    🚀 Siap Memulai Perjalanan Pembelajaran?
                  </h3>
                  <p className="tw-text-white/90 tw-text-lg tw-mb-6 tw-max-w-3xl tw-mx-auto tw-leading-relaxed">
                    Bergabunglah dengan <span className="tw-font-bold tw-text-yellow-300">ribuan pelajar</span> lainnya 
                    dan tingkatkan skill mu hari ini juga! Akses ratusan kursus berkualitas tinggi dengan 
                    <span className="tw-font-bold tw-text-yellow-300"> mentor berpengalaman</span>.
                  </p>
                </div>

                {/* Feature Highlights */}
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6 tw-mb-8">
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20">
                    <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-green-400 tw-to-green-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                      <Trophy className="tw-w-6 tw-h-6 tw-text-white" />
                    </div>
                    <h4 className="tw-font-bold tw-text-white tw-mb-2">Sertifikat Resmi</h4>
                    <p className="tw-text-white/80 tw-text-sm">Dapatkan sertifikat yang diakui industri setelah menyelesaikan kursus</p>
                  </div>

                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20">
                    <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-blue-400 tw-to-blue-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                      <Users className="tw-w-6 tw-h-6 tw-text-white" />
                    </div>
                    <h4 className="tw-font-bold tw-text-white tw-mb-2">Komunitas Aktif</h4>
                    <p className="tw-text-white/80 tw-text-sm">Bergabung dengan komunitas learner yang saling mendukung</p>
                  </div>

                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20">
                    <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-purple-400 tw-to-purple-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                      <Clock className="tw-w-6 tw-h-6 tw-text-white" />
                    </div>
                    <h4 className="tw-font-bold tw-text-white tw-mb-2">Akses Selamanya</h4>
                    <p className="tw-text-white/80 tw-text-sm">Akses materi kursus kapan saja dan di mana saja selamanya</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4 tw-justify-center tw-items-center">
                  <button 
                    onClick={() => router.push('/courses')}
                    className="tw-bg-white tw-text-purple-600 tw-font-bold tw-py-4 tw-px-8 tw-rounded-xl tw-shadow-lg tw-transition-all tw-duration-300 hover:tw-shadow-xl hover:tw-scale-105 tw-group"
                  >
                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                      <Play className="tw-w-5 tw-h-5 tw-group-hover:tw-scale-110 tw-transition-transform" />
                      Mulai Belajar Gratis
                      <ChevronRight className="tw-w-4 tw-h-4 tw-group-hover:tw-translate-x-1 tw-transition-transform" />
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/about')}
                    className="tw-bg-white/20 tw-text-white tw-font-bold tw-py-4 tw-px-8 tw-rounded-xl tw-border tw-border-white/30 tw-backdrop-blur-sm tw-transition-all tw-duration-300 hover:tw-bg-white/30 tw-group"
                  >
                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                      <Eye className="tw-w-5 tw-h-5 tw-group-hover:tw-scale-110 tw-transition-transform" />
                      Pelajari Lebih Lanjut
                    </div>
                  </button>
                </div>

                {/* Stats */}
                <div className="tw-mt-8 tw-pt-8 tw-border-t tw-border-white/20">
                  <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-6 tw-text-center">
                    <div>
                      <div className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-yellow-300 tw-mb-1">10,000+</div>
                      <div className="tw-text-white/80 tw-text-sm">Pelajar Aktif</div>
                    </div>
                    <div>
                      <div className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-yellow-300 tw-mb-1">500+</div>
                      <div className="tw-text-white/80 tw-text-sm">Kursus Tersedia</div>
                    </div>
                    <div>
                      <div className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-yellow-300 tw-mb-1">50+</div>
                      <div className="tw-text-white/80 tw-text-sm">Mentor Expert</div>
                    </div>
                    <div>
                      <div className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-yellow-300 tw-mb-1">95%</div>
                      <div className="tw-text-white/80 tw-text-sm">Tingkat Kepuasan</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async () => {
  const inspirationalQuotes = [
    {
      text: "Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia.",
      author: "Nelson Mandela"
    },
    {
      text: "Investasi terbaik adalah investasi dalam pendidikan diri sendiri.",
      author: "Benjamin Franklin"
    },
    {
      text: "Pembelajaran tidak pernah berakhir. Setiap hari adalah kesempatan baru untuk berkembang.",
      author: "Maya Angelou"
    },
    {
      text: "Masa depan milik mereka yang percaya pada keindahan mimpi mereka.",
      author: "Eleanor Roosevelt"
    },
    {
      text: "Pengetahuan adalah kekuatan, tapi implementasi adalah kunci kesuksesan.",
      author: "Tony Robbins"
    }
  ];

  const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];

  // Initial fetch for SSR
  let courses: Course[] = [];
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
    courses = await response.json();
  } catch (error) {
    console.error('Error fetching courses in SSR:', error);
    courses = [];
  }

  return {
    props: {
      courses,
      initialQuote: randomQuote,
    },
  };
};

export default CoursePage;