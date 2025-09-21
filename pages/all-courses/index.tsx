// pages/all-courses.tsx - Fixed Version
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
  Brain, Rocket, Gift, RotateCcw, Tag, DollarSign, Video, MapPin,
  GraduationCap, Bookmark, UserCheck
} from 'lucide-react';
import NavigationBar from '../../components/layout/NavigationBar';

// Types for Courses (existing)
interface LiveCourse {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  learning_point?: string[];
  course_string?: string;
  product_id: number;
  product_name: string;
  price: number;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
  stock: number;
  features?: string[];
  classtype: string;
  creator_name?: string;
  create_date: string;
}

// Types for Classes (new)
interface LiveClass {
  id: number;
  name: string;
  description: string;
  teacher_name: string;
  teacher_id: number;
  student_list_ids: number[];
  student_list_names: string[];
  start_date: string;
  end_date: string;
  class_mode: string;
  meeting_url?: string;
  course_name: string;
  course_id: number;
  product_id: number;
  product_name: string;
  price: number;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
  stock: number;
  max_students: number;
  current_students: number;
  features?: string[];
  classtype: string;
  effective_start: string;
  effective_end?: string;
  creator_name?: string;
  create_date: string;
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
  initialQuote: QuoteType;
}

const CoursePage: React.FC<CoursePageProps> = ({ initialQuote }) => {
  const router = useRouter();
  const { isAuthenticated, id: userId } = useAuth();
  
  // Courses state
  const [liveCourses, setLiveCourses] = useState<LiveCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<LiveCourse[]>([]);
  
  // Classes state (new)
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<LiveClass[]>([]);
  
  // Common state
  const [currentQuote, setCurrentQuote] = useState<QuoteType>(initialQuote);
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'courses' | 'classes'>('courses');
  const [selectedClasstype, setSelectedClasstype] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quickFilter, setQuickFilter] = useState<'all' | 'newest' | 'cheapest' | 'premium'>('all');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000000 });
  const [sortBy, setSortBy] = useState<string>('newest');
  const [cartLoading, setCartLoading] = useState<{ [key: number]: boolean }>({});
  const [purchasedCourses, setPurchasedCourses] = useState<Set<number>>(new Set());
  const [enrolledClasses, setEnrolledClasses] = useState<Set<number>>(new Set());
  
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

  // Fetch live courses
  useEffect(() => {
    if (activeTab === 'courses') {
      fetchLiveCourses();
    }
  }, [sortBy, selectedClasstype, activeTab]);

  // Fetch live classes
  useEffect(() => {
    if (activeTab === 'classes') {
      fetchLiveClasses();
    }
  }, [sortBy, selectedClasstype, activeTab]);

  // Fetch user progress when authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchUserProgress();
      fetchPurchasedCourses();
      fetchEnrolledClasses();
    }
  }, [isAuthenticated, userId]);

  // Filter courses
  useEffect(() => {
    let filtered = liveCourses;
    
    if (quickFilter === 'newest') {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.create_date).getTime() - new Date(a.create_date).getTime()
      );
    } else if (quickFilter === 'cheapest') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (quickFilter === 'premium') {
      filtered = filtered.filter(course => course.price >= 500000);
    }
    
    if (selectedClasstype !== 'all') {
      filtered = filtered.filter(course => course.classtype === selectedClasstype);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    filtered = filtered.filter(course => 
      course.price >= priceRange.min && course.price <= priceRange.max
    );
    
    setFilteredCourses(filtered);
  }, [liveCourses, selectedClasstype, searchTerm, quickFilter, priceRange]);

  // Filter classes
  useEffect(() => {
    let filtered = liveClasses;
    
    if (quickFilter === 'newest') {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.create_date).getTime() - new Date(a.create_date).getTime()
      );
    } else if (quickFilter === 'cheapest') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (quickFilter === 'premium') {
      filtered = filtered.filter(cls => cls.price >= 500000);
    }
    
    if (selectedClasstype !== 'all') {
      filtered = filtered.filter(cls => cls.classtype === selectedClasstype);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    filtered = filtered.filter(cls => 
      cls.price >= priceRange.min && cls.price <= priceRange.max
    );
    
    setFilteredClasses(filtered);
  }, [liveClasses, selectedClasstype, searchTerm, quickFilter, priceRange]);

  // Fetch live courses
  const fetchLiveCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        sortBy: sortBy,
        classtype: selectedClasstype
      });

      const response = await fetch(`/api/courses/live?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setLiveCourses(data.data.courses);
      } else {
        console.error('Failed to fetch live courses:', data.message);
      }
    } catch (error) {
      console.error('Error fetching live courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch live classes
  const fetchLiveClasses = async () => {
    setClassesLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        sortBy: sortBy,
        classtype: selectedClasstype
      });

      const response = await fetch(`/api/classes/live?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setLiveClasses(data.data.classes);
      } else {
        console.error('Failed to fetch live classes:', data.message);
      }
    } catch (error) {
      console.error('Error fetching live classes:', error);
    } finally {
      setClassesLoading(false);
    }
  };

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

  // Fetch purchased courses
  const fetchPurchasedCourses = async () => {
    if (!isAuthenticated) return;
    
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const progress = userProgress;
      const purchased = new Set(progress.map(p => p.id));
      setPurchasedCourses(purchased);
    } catch (error) {
      console.error('Error fetching purchased courses:', error);
    }
  };

  // Fetch enrolled classes
  const fetchEnrolledClasses = async () => {
    if (!isAuthenticated || !userId) return;
    
    try {
      // Get enrolled classes from live classes where user is in student_list_ids
      const enrolled = new Set(
        liveClasses
          .filter(cls => cls.student_list_ids.includes(parseInt(userId)))
          .map(cls => cls.id)
      );
      setEnrolledClasses(enrolled);
    } catch (error) {
      console.error('Error fetching enrolled classes:', error);
    }
  };

  useEffect(() => {
    fetchPurchasedCourses();
  }, [userProgress]);

  useEffect(() => {
    fetchEnrolledClasses();
  }, [liveClasses, userId]);

  // Navigation handlers
  const handleStartLearning = (courseString: string) => {
    router.push(`/course/${courseString}`);
  };

  const handleReviewCourse = (courseString: string) => {
    router.push(`/course/${courseString}`);
  };

  const handleLogin = () => {
    router.push('/login');
  };

  // Add to cart handler
  const handleAddToCart = async (productId: number, itemType: 'course' | 'class' = 'course') => {
    if (!isAuthenticated) {
      alert(`Silakan login terlebih dahulu untuk membeli ${itemType === 'course' ? 'kursus' : 'kelas'}`);
      handleLogin();
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) return;

    setCartLoading(prev => ({ ...prev, [productId]: true }));

    try {
      const response = await axios.post(
        '/api/cart/add',
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert(`${itemType === 'course' ? 'Kursus' : 'Kelas'} berhasil ditambahkan ke keranjang!`);
        router.push('/keranjang');
      } else {
        alert('Gagal menambahkan ke keranjang: ' + response.data.message);
      }
    } catch (error: any) {
      console.error('Add to cart error:', error);
      alert('Gagal menambahkan ke keranjang: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
    } finally {
      setCartLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Get unique classtypes from both courses and classes
  const allClasstypes = Array.from(new Set([
    ...liveCourses.map(course => course.classtype),
    ...liveClasses.map(cls => cls.classtype)
  ]));

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate discount percentage
  const getDiscountPercentage = (originalPrice: number, discountPrice: number) => {
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  };

  const displayedCourses = showAll ? filteredCourses : filteredCourses.slice(0, displayLimit);
  const displayedClasses = showAllClasses ? filteredClasses : filteredClasses.slice(0, displayLimit);
  const displayedProgress = showAllProgress ? userProgress : userProgress.slice(0, progressDisplayLimit);

  // Handle quick action clicks
  const handleQuickAction = (action: 'newest' | 'cheapest' | 'premium') => {
    setQuickFilter(action);
    setSelectedClasstype('all');
    setSearchTerm('');
    setShowAll(false);
    setShowAllClasses(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDefaultImage = () => {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
  };

  const currentItems = activeTab === 'courses' ? displayedCourses : displayedClasses;
  const filteredItems = activeTab === 'courses' ? filteredCourses : filteredClasses;
  const isLoading = activeTab === 'courses' ? loading : classesLoading;

  return (
    <div className="tw-min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <NavigationBar />
      <Head>
        <title>Courses & Classes - Platform Pembelajaran</title>
        <meta name="description" content="Jelajahi koleksi kursus dan kelas menarik dan tingkatkan skill-mu dengan pembelajaran yang interaktif" />
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
                Explore Learning
              </h1>
              <p className="tw-text-lg md:tw-text-xl tw-text-white/90 tw-font-medium tw-drop-shadow tw-max-w-3xl tw-mx-auto">
                Jelajahi koleksi kursus dan kelas menarik dan tingkatkan skill-mu dengan pembelajaran yang interaktif! 🚀✨
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

          {/* Courses & Classes Tabs */}
          <div className="tw-max-w-full tw-mx-auto tw-mb-8 tw-px-4">
            <div className="tw-flex tw-justify-center tw-mb-8">
              <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-2 tw-border tw-border-white/20">
                <div className="tw-flex tw-gap-2">
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`tw-px-6 tw-py-3 tw-rounded-xl tw-font-bold tw-transition-all tw-duration-300 tw-flex tw-items-center tw-gap-2 ${
                      activeTab === 'courses'
                        ? 'tw-bg-white tw-text-purple-600 tw-shadow-lg'
                        : 'tw-text-white hover:tw-bg-white/20'
                    }`}
                  >
                    <BookOpen className="tw-w-5 tw-h-5" />
                    Kursus Online
                    <span className="tw-bg-purple-500 tw-text-white tw-text-xs tw-px-2 tw-py-1 tw-rounded-full">
                      {liveCourses.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('classes')}
                    className={`tw-px-6 tw-py-3 tw-rounded-xl tw-font-bold tw-transition-all tw-duration-300 tw-flex tw-items-center tw-gap-2 ${
                      activeTab === 'classes'
                        ? 'tw-bg-white tw-text-purple-600 tw-shadow-lg'
                        : 'tw-text-white hover:tw-bg-white/20'
                    }`}
                  >
                    <GraduationCap className="tw-w-5 tw-h-5" />
                    Kelas Live
                    <span className="tw-bg-orange-500 tw-text-white tw-text-xs tw-px-2 tw-py-1 tw-rounded-full">
                      {liveClasses.length}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Section */}
          <div className="tw-max-w-full tw-mx-auto tw-mb-12 tw-px-4">
            <div className="tw-text-center tw-mb-8">
              <h2 className="tw-text-3xl tw-font-bold tw-text-white tw-mb-4">
                {activeTab === 'courses' ? '🛒 Kursus Premium Terbaru' : '🎓 Kelas Live Tersedia'}
              </h2>
              <p className="tw-text-white/80 tw-text-lg">
                {activeTab === 'courses' 
                  ? 'Investasi terbaik adalah investasi untuk diri sendiri!'
                  : 'Belajar langsung dengan mentor berpengalaman dalam kelas interaktif!'
                }
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6 tw-mb-8">
              <div 
                onClick={() => handleQuickAction('newest')}
                className={`tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-text-center tw-group tw-cursor-pointer tw-transition-all tw-duration-300 tw-hover:scale-105 tw-relative ${
                  quickFilter === 'newest' 
                    ? 'tw-bg-blue-500/30 tw-border-blue-400/50 tw-shadow-lg tw-shadow-blue-500/25' 
                    : 'tw-bg-white/10 tw-border-white/20 tw-hover:bg-white/20'
                }`}
              >
                <div className={`tw-w-16 tw-h-16 tw-bg-gradient-to-br tw-from-blue-400 tw-to-cyan-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4 tw-group-hover:scale-110 tw-transition-transform tw-shadow-lg ${
                  quickFilter === 'newest' ? 'tw-ring-4 tw-ring-blue-300/50' : ''
                }`}>
                  <Clock className="tw-w-8 tw-h-8 tw-text-white" />
                </div>
                <h3 className={`tw-text-xl tw-font-bold tw-mb-2 ${
                  quickFilter === 'newest' ? 'tw-text-blue-100' : 'tw-text-white'
                }`}>
                  {activeTab === 'courses' ? 'Kursus Terbaru' : 'Kelas Terbaru'}
                  {quickFilter === 'newest' && <span className="tw-ml-2 tw-text-blue-300">🆕</span>}
                </h3>
                <p className="tw-text-white/80 tw-text-sm">
                  {activeTab === 'courses' 
                    ? 'Kursus-kursus yang baru saja dirilis'
                    : 'Kelas-kelas yang baru dibuka untuk pendaftaran'
                  }
                </p>
              </div>
              
              <div 
                onClick={() => handleQuickAction('cheapest')}
                className={`tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-text-center tw-group tw-cursor-pointer tw-transition-all tw-duration-300 tw-hover:scale-105 tw-relative ${
                  quickFilter === 'cheapest' 
                    ? 'tw-bg-green-500/30 tw-border-green-400/50 tw-shadow-lg tw-shadow-green-500/25' 
                    : 'tw-bg-white/10 tw-border-white/20 tw-hover:bg-white/20'
                }`}
              >
                <div className={`tw-w-16 tw-h-16 tw-bg-gradient-to-br tw-from-green-400 tw-to-emerald-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4 tw-group-hover:scale-110 tw-transition-transform tw-shadow-lg ${
                  quickFilter === 'cheapest' ? 'tw-ring-4 tw-ring-green-300/50' : ''
                }`}>
                  <DollarSign className="tw-w-8 tw-h-8 tw-text-white" />
                </div>
                <h3 className={`tw-text-xl tw-font-bold tw-mb-2 ${
                  quickFilter === 'cheapest' ? 'tw-text-green-100' : 'tw-text-white'
                }`}>
                  Termurah
                  {quickFilter === 'cheapest' && <span className="tw-ml-2 tw-text-green-300">💰</span>}
                </h3>
                <p className="tw-text-white/80 tw-text-sm">
                  {activeTab === 'courses' 
                    ? 'Kursus dengan harga paling terjangkau'
                    : 'Kelas dengan biaya paling affordable'
                  }
                </p>
              </div>
              
              <div 
                onClick={() => handleQuickAction('premium')}
                className={`tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-text-center tw-group tw-cursor-pointer tw-transition-all tw-duration-300 tw-hover:scale-105 tw-relative ${
                  quickFilter === 'premium' 
                    ? 'tw-bg-purple-500/30 tw-border-purple-400/50 tw-shadow-lg tw-shadow-purple-500/25' 
                    : 'tw-bg-white/10 tw-border-white/20 tw-hover:bg-white/20'
                }`}
              >
                <div className={`tw-w-16 tw-h-16 tw-bg-gradient-to-br tw-from-purple-400 tw-to-pink-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4 tw-group-hover:scale-110 tw-transition-transform tw-shadow-lg ${
                  quickFilter === 'premium' ? 'tw-ring-4 tw-ring-purple-300/50' : ''
                }`}>
                  <Award className="tw-w-8 tw-h-8 tw-text-white" />
                </div>
                <h3 className={`tw-text-xl tw-font-bold tw-mb-2 ${
                  quickFilter === 'premium' ? 'tw-text-purple-100' : 'tw-text-white'
                }`}>
                  Premium
                  {quickFilter === 'premium' && <span className="tw-ml-2 tw-text-purple-300">👑</span>}
                </h3>
                <p className="tw-text-white/80 tw-text-sm">
                  {activeTab === 'courses' 
                    ? 'Kursus premium dengan kualitas terbaik'
                    : 'Kelas premium dengan mentor expert'
                  }
                </p>
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
                      placeholder={`Cari ${activeTab === 'courses' ? 'kursus' : 'kelas'}...`}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setQuickFilter('all');
                      }}
                      className="tw-pl-10 tw-pr-4 tw-py-3 tw-rounded-xl tw-border-0 tw-bg-white/20 tw-text-white tw-placeholder-white/60 tw-backdrop-blur-sm tw-w-full sm:tw-w-64"
                    />
                  </div>
                  
                  <select
                    value={selectedClasstype}
                    onChange={(e) => {
                      setSelectedClasstype(e.target.value);
                      setQuickFilter('all');
                    }}
                    className="tw-px-4 tw-py-3 tw-rounded-xl tw-border-0 tw-bg-white/20 tw-text-white tw-backdrop-blur-sm"
                  >
                    <option value="all" className="tw-text-gray-800">Semua Kategori</option>
                    {allClasstypes.map(classtype => (
                      <option key={classtype} value={classtype} className="tw-text-gray-800">
                        {classtype === 'online' ? 'Online' : 
                         classtype === 'utbk' ? 'UTBK' : 
                         classtype === 'sbmptn' ? 'SBMPTN' : 
                         `Kelas ${classtype}`}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="tw-px-4 tw-py-3 tw-rounded-xl tw-border-0 tw-bg-white/20 tw-text-white tw-backdrop-blur-sm"
                  >
                    <option value="newest" className="tw-text-gray-800">Terbaru</option>
                    <option value="oldest" className="tw-text-gray-800">Terlama</option>
                    <option value="price_low" className="tw-text-gray-800">Harga Terendah</option>
                    <option value="price_high" className="tw-text-gray-800">Harga Tertinggi</option>
                    <option value="name_asc" className="tw-text-gray-800">Nama A-Z</option>
                    <option value="name_desc" className="tw-text-gray-800">Nama Z-A</option>
                    {activeTab === 'classes' && (
                      <>
                        <option value="start_date" className="tw-text-gray-800">Tanggal Mulai</option>
                        <option value="available_slots" className="tw-text-gray-800">Slot Tersedia</option>
                      </>
                    )}
                  </select>

                  {(quickFilter !== 'all' || selectedClasstype !== 'all' || searchTerm) && (
                    <button
                      onClick={() => {
                        setQuickFilter('all');
                        setSelectedClasstype('all');
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
                  <span>Menampilkan {currentItems.length} dari {filteredItems.length} {activeTab === 'courses' ? 'kursus' : 'kelas'}</span>
                </div>
                <div className="tw-flex tw-items-center tw-gap-2">
                  <Filter className="tw-w-4 tw-h-4 tw-text-green-300" />
                  <span>
                    Filter: {quickFilter === 'all' 
                      ? (selectedClasstype === 'all' ? 'Semua' : `${selectedClasstype}`)
                      : quickFilter === 'newest' ? 'Terbaru'
                      : quickFilter === 'cheapest' ? 'Termurah' 
                      : 'Premium'
                    }
                  </span>
                </div>
                {quickFilter !== 'all' && (
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <Star className="tw-w-4 tw-h-4 tw-text-yellow-300" />
                    <span className="tw-capitalize tw-font-semibold">
                      {quickFilter === 'newest' ? '🆕 Fresh' 
                       : quickFilter === 'cheapest' ? '💰 Budget Friendly' 
                       : '👑 Premium Quality'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Grid/List */}
          <div className="tw-max-w-full tw-mx-auto tw-mb-12 tw-px-4">
            {isLoading ? (
              <div className="tw-flex tw-justify-center tw-items-center tw-py-12">
                <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-white"></div>
              </div>
            ) : (
              <>
                {activeTab === 'courses' ? (
                  // Courses Grid/List (existing code)
                  viewMode === 'grid' ? (
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-6">
                      {displayedCourses.map((course) => {
                        const isPurchased = purchasedCourses.has(course.id);
                        const isAddingToCart = cartLoading[course.product_id];
                        
                        return (
                          <div
                            key={course.id}
                            className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-transition-all tw-duration-300 tw-hover:shadow-2xl tw-hover:scale-105 tw-overflow-hidden tw-flex tw-flex-col tw-h-full tw-relative"
                          >
                            {course.is_promo && (
                              <div className="tw-absolute tw-top-4 tw-left-4 tw-z-10">
                                <div className="tw-bg-gradient-to-r tw-from-red-500 tw-to-pink-600 tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold tw-flex tw-items-center tw-gap-1 tw-shadow-lg">
                                  <Tag className="tw-w-3 tw-h-3" />
                                  {course.no_promo_price && getDiscountPercentage(course.no_promo_price, course.price)}% OFF
                                </div>
                              </div>
                            )}

                            <div className="tw-relative tw-h-48">
                              <img
                                src={course.imageUrl || getDefaultImage()}
                                alt={course.title}
                                className="tw-w-full tw-h-full tw-object-cover"
                              />
                              <div className="tw-absolute tw-top-4 tw-right-4">
                                <div className="tw-bg-purple-600 tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-semibold">
                                  {course.classtype === 'online' ? 'Online' : 
                                   course.classtype === 'utbk' ? 'UTBK' : 
                                   course.classtype === 'sbmptn' ? 'SBMPTN' : 
                                   `Kelas ${course.classtype}`}
                                </div>
                              </div>
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
                                    Yang akan kamu pelajari:
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
                                        +{course.learning_point.length - 2} poin lainnya
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="tw-mb-4 tw-mt-auto">
                                <div className="tw-flex tw-items-center tw-justify-between">
                                  <div>
                                    {course.is_promo && course.no_promo_price ? (
                                      <div>
                                        <span className="tw-text-gray-500 tw-text-sm tw-line-through">
                                          {formatPrice(course.no_promo_price)}
                                        </span>
                                        <div className="tw-text-2xl tw-font-bold tw-text-green-600">
                                          {formatPrice(course.price)}
                                        </div>
                                        {course.promo_description && (
                                          <p className="tw-text-xs tw-text-red-600 tw-font-medium">
                                            {course.promo_description}
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="tw-text-2xl tw-font-bold tw-text-purple-600">
                                        {formatPrice(course.price)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="tw-text-sm tw-text-gray-500">
                                    Stok: {course.stock > 999 ? '∞' : course.stock}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="tw-flex tw-items-center tw-justify-between tw-mb-4 tw-text-sm tw-text-gray-500">
                                <div className="tw-flex tw-items-center tw-gap-2">
                                  <Calendar className="tw-w-4 tw-h-4" />
                                  <span>{formatDate(course.create_date)}</span>
                                </div>
                                <div className="tw-flex tw-items-center tw-gap-2">
                                  <User className="tw-w-4 tw-h-4" />
                                  <span>{course.creator_name || 'Instructor'}</span>
                                </div>
                              </div>
                              
                              <div className="tw-mt-auto">
                                {!isAuthenticated ? (
                                  <button 
                                    onClick={handleLogin}
                                    className="tw-w-full tw-font-bold tw-py-3 tw-px-4 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md tw-text-white hover:tw-shadow-lg hover:tw-scale-105 tw-bg-gradient-to-r tw-from-blue-500 tw-to-cyan-600"
                                  >
                                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                                      <LogIn className="tw-w-5 tw-h-5" />
                                      Login untuk Membeli
                                    </div>
                                  </button>
                                ) : isPurchased ? (
                                  <button 
                                    onClick={() => handleStartLearning(course.course_string)}
                                    className="tw-w-full tw-font-bold tw-py-3 tw-px-4 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md tw-text-white hover:tw-shadow-lg hover:tw-scale-105 tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-600"
                                  >
                                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                                      <Play className="tw-w-5 tw-h-5" />
                                      Mulai Belajar
                                      <ChevronRight className="tw-w-4 tw-h-4" />
                                    </div>
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleAddToCart(course.product_id, 'course')}
                                    disabled={isAddingToCart || course.stock <= 0}
                                    className="tw-w-full tw-font-bold tw-py-3 tw-px-4 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md tw-text-white hover:tw-shadow-lg hover:tw-scale-105 tw-bg-gradient-to-r tw-from-purple-500 tw-to-violet-600 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                                  >
                                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                                      {isAddingToCart ? (
                                        <>
                                          <div className="tw-animate-spin tw-rounded-full tw-h-4 tw-w-4 tw-border-b-2 tw-border-white"></div>
                                          Menambahkan...
                                        </>
                                      ) : course.stock <= 0 ? (
                                        <>
                                          <div className="tw-text-red-400">Stok Habis</div>
                                        </>
                                      ) : (
                                        <>
                                          <ShoppingCart className="tw-w-5 tw-h-5" />
                                          Tambah ke Keranjang
                                        </>
                                      )}
                                    </div>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Course List View (similar to grid but horizontal layout)
                    <div className="tw-space-y-6">
                      {displayedCourses.map((course) => {
                        const isPurchased = purchasedCourses.has(course.id);
                        const isAddingToCart = cartLoading[course.product_id];
                        
                        return (
                          <div
                            key={course.id}
                            className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-transition-all tw-duration-300 tw-hover:shadow-2xl tw-overflow-hidden tw-relative"
                          >
                            {course.is_promo && (
                              <div className="tw-absolute tw-top-4 tw-left-4 tw-z-10">
                                <div className="tw-bg-gradient-to-r tw-from-red-500 tw-to-pink-600 tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-bold tw-flex tw-items-center tw-gap-2">
                                  <Tag className="tw-w-4 tw-h-4" />
                                  {course.no_promo_price && getDiscountPercentage(course.no_promo_price, course.price)}% OFF
                                </div>
                              </div>
                            )}
                            
                            <div className="tw-flex tw-flex-col md:tw-flex-row">
                              <div className="tw-relative tw-w-full md:tw-w-80 tw-h-48 md:tw-h-auto">
                                <img
                                  src={course.imageUrl || getDefaultImage()}
                                  alt={course.title}
                                  className="tw-w-full tw-h-full tw-object-cover"
                                />
                                <div className="tw-absolute tw-top-4 tw-right-4">
                                  <div className="tw-bg-purple-600 tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-semibold">
                                    {course.classtype === 'online' ? 'Online' : 
                                     course.classtype === 'utbk' ? 'UTBK' : 
                                     course.classtype === 'sbmptn' ? 'SBMPTN' : 
                                     `Kelas ${course.classtype}`}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="tw-flex-1 tw-p-6 tw-flex tw-flex-col">
                                <div className="tw-flex tw-justify-between tw-items-start tw-mb-4">
                                  <div className="tw-flex-1">
                                    <h5 className="tw-font-bold tw-text-2xl tw-text-purple-600 tw-mb-2">
                                      {course.title}
                                    </h5>
                                    <p className="tw-text-gray-600 tw-mb-4 tw-leading-relaxed">
                                      {course.description}
                                    </p>
                                  </div>
                                  
                                  <div className="tw-text-right tw-ml-6">
                                    {course.is_promo && course.no_promo_price ? (
                                      <div>
                                        <span className="tw-text-gray-500 tw-text-lg tw-line-through">
                                          {formatPrice(course.no_promo_price)}
                                        </span>
                                        <div className="tw-text-3xl tw-font-bold tw-text-green-600">
                                          {formatPrice(course.price)}
                                        </div>
                                        {course.promo_description && (
                                          <p className="tw-text-sm tw-text-red-600 tw-font-medium">
                                            {course.promo_description}
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="tw-text-3xl tw-font-bold tw-text-purple-600">
                                        {formatPrice(course.price)}
                                      </div>
                                    )}
                                    <p className="tw-text-sm tw-text-gray-500 tw-mt-1">
                                      Stok: {course.stock > 999 ? '∞' : course.stock}
                                    </p>
                                  </div>
                                </div>
                                
                                {course.learning_point && course.learning_point.length > 0 && (
                                  <div className="tw-mb-4">
                                    <p className="tw-text-gray-700 tw-font-semibold tw-mb-2">
                                      Yang akan kamu pelajari:
                                    </p>
                                    <div className="tw-space-y-2">
                                      {course.learning_point.map((point, index) => (
                                        <div key={index} className="tw-flex tw-items-start tw-gap-2 tw-text-sm tw-text-gray-600">
                                          <Star className="tw-w-3 tw-h-3 tw-text-yellow-500 tw-mt-1 tw-flex-shrink-0" />
                                          <span>{point}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="tw-flex tw-justify-between tw-items-center tw-mt-auto">
                                  <div className="tw-flex tw-items-center tw-gap-4 tw-text-sm tw-text-gray-500">
                                    <div className="tw-flex tw-items-center tw-gap-1">
                                      <Calendar className="tw-w-4 tw-h-4" />
                                      <span>{formatDate(course.create_date)}</span>
                                    </div>
                                    <div className="tw-flex tw-items-center tw-gap-1">
                                      <User className="tw-w-4 tw-h-4" />
                                      <span>{course.creator_name || 'Instructor'}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="tw-ml-4">
                                    {!isAuthenticated ? (
                                      <button 
                                        onClick={handleLogin}
                                        className="tw-font-bold tw-py-3 tw-px-6 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md tw-text-white hover:tw-shadow-lg hover:tw-scale-105 tw-bg-gradient-to-r tw-from-blue-500 tw-to-cyan-600"
                                      >
                                        <div className="tw-flex tw-items-center tw-gap-2">
                                          <LogIn className="tw-w-5 tw-h-5" />
                                          Login untuk Membeli
                                        </div>
                                      </button>
                                    ) : isPurchased ? (
                                      <button 
                                        onClick={() => handleStartLearning(course.course_string)}
                                        className="tw-font-bold tw-py-3 tw-px-6 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md tw-text-white hover:tw-shadow-lg hover:tw-scale-105 tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-600"
                                      >
                                        <div className="tw-flex tw-items-center tw-gap-2">
                                          <Play className="tw-w-5 tw-h-5" />
                                          Mulai Belajar
                                          <ChevronRight className="tw-w-4 tw-h-4" />
                                        </div>
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => handleAddToCart(course.product_id, 'course')}
                                        disabled={isAddingToCart || course.stock <= 0}
                                        className="tw-font-bold tw-py-3 tw-px-6 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md tw-text-white hover:tw-shadow-lg hover:tw-scale-105 tw-bg-gradient-to-r tw-from-purple-500 tw-to-violet-600 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                                      >
                                        <div className="tw-flex tw-items-center tw-gap-2">
                                          {isAddingToCart ? (
                                            <>
                                              <div className="tw-animate-spin tw-rounded-full tw-h-4 tw-w-4 tw-border-b-2 tw-border-white"></div>
                                              Menambahkan...
                                            </>
                                          ) : course.stock <= 0 ? (
                                            <>
                                              <div className="tw-text-red-400">Stok Habis</div>
                                            </>
                                          ) : (
                                            <>
                                              <ShoppingCart className="tw-w-5 tw-h-5" />
                                              Tambah ke Keranjang
                                            </>
                                          )}
                                        </div>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  // Classes Grid/List (new)
                  viewMode === 'grid' ? (
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-6">
                      {displayedClasses.map((cls) => {
                        const isEnrolled = enrolledClasses.has(cls.id);
                        const isAddingToCart = cartLoading[cls.product_id];
                        const availableSlots = cls.stock;
                        const enrollmentProgress = ((cls.current_students / cls.max_students) * 100);
                        
                        return (
                          <div
                            key={cls.id}
                            className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-transition-all tw-duration-300 tw-hover:shadow-2xl tw-hover:scale-105 tw-overflow-hidden tw-flex tw-flex-col tw-h-full tw-relative"
                          >
                            {cls.is_promo && (
                              <div className="tw-absolute tw-top-4 tw-left-4 tw-z-10">
                                <div className="tw-bg-gradient-to-r tw-from-red-500 tw-to-pink-600 tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold tw-flex tw-items-center tw-gap-1 tw-shadow-lg">
                                  <Tag className="tw-w-3 tw-h-3" />
                                  {cls.no_promo_price && getDiscountPercentage(cls.no_promo_price, cls.price)}% OFF
                                </div>
                              </div>
                            )}

                            {isEnrolled && (
                              <div className="tw-absolute tw-top-4 tw-right-4 tw-z-10">
                                <div className="tw-bg-green-500 tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold tw-flex tw-items-center tw-gap-1 tw-shadow-lg">
                                  <UserCheck className="tw-w-3 tw-h-3" />
                                  Terdaftar
                                </div>
                              </div>
                            )}

                            <div className="tw-relative tw-h-48">
                              <div 
                                className="tw-w-full tw-h-full tw-bg-gradient-to-br tw-from-orange-400 tw-to-pink-500 tw-flex tw-items-center tw-justify-center"
                                style={{
                                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.3"/><circle cx="80" cy="30" r="1.5" fill="white" opacity="0.2"/><circle cx="40" cy="70" r="1" fill="white" opacity="0.4"/><circle cx="70" cy="80" r="1.2" fill="white" opacity="0.3"/></svg>')`,
                                }}
                              >
                                <div className="tw-text-center tw-text-white">
                                  <GraduationCap className="tw-w-16 tw-h-16 tw-mx-auto tw-mb-2" />
                                  <div className="tw-text-sm tw-font-semibold tw-bg-black/20 tw-px-3 tw-py-1 tw-rounded-full">
                                    {cls.class_mode === 'online' ? (
                                      <div className="tw-flex tw-items-center tw-gap-1">
                                        <Video className="tw-w-4 tw-h-4" />
                                        Online Class
                                      </div>
                                    ) : (
                                      <div className="tw-flex tw-items-center tw-gap-1">
                                        <MapPin className="tw-w-4 tw-h-4" />
                                        Offline Class
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="tw-absolute tw-bottom-4 tw-left-4">
                                <div className="tw-bg-white/90 tw-text-gray-800 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-semibold">
                                  {cls.classtype === 'online' ? 'Online' : 
                                   cls.classtype === 'utbk' ? 'UTBK' : 
                                   cls.classtype === 'sbmptn' ? 'SBMPTN' : 
                                   `Kelas ${cls.classtype}`}
                                </div>
                              </div>
                            </div>
                            
                            <div className="tw-p-6 tw-flex tw-flex-col tw-flex-grow">
                              <h5 className="tw-font-bold tw-mb-2 tw-text-lg tw-text-orange-600 tw-leading-tight">
                                {cls.name}
                              </h5>
                              
                              <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3 tw-text-sm tw-text-gray-600">
                                <GraduationCap className="tw-w-4 tw-h-4 tw-text-orange-500" />
                                <span className="tw-font-medium">{cls.teacher_name}</span>
                              </div>
                              
                              <p className="tw-text-gray-600 tw-text-sm tw-mb-4 tw-leading-relaxed tw-line-clamp-3 tw-flex-grow">
                                {cls.description}
                              </p>
                              
                              {/* Class Schedule */}
                              <div className="tw-bg-gray-50 tw-rounded-lg tw-p-3 tw-mb-4">
                                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2 tw-text-sm tw-font-semibold tw-text-gray-700">
                                  <Calendar className="tw-w-4 tw-h-4 tw-text-blue-500" />
                                  Jadwal Kelas
                                </div>
                                <div className="tw-text-xs tw-text-gray-600 tw-space-y-1">
                                  <div>Mulai: {formatDateTime(cls.start_date)}</div>
                                  <div>Selesai: {formatDateTime(cls.end_date)}</div>
                                </div>
                              </div>

                              {/* Enrollment Progress */}
                              <div className="tw-mb-4">
                                <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                                  <span className="tw-text-sm tw-font-medium tw-text-gray-700">Pendaftar</span>
                                  <span className="tw-text-sm tw-font-bold tw-text-orange-600">
                                    {cls.current_students}/{cls.max_students}
                                  </span>
                                </div>
                                <div className="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2">
                                  <div 
                                    className="tw-bg-gradient-to-r tw-from-orange-400 tw-to-red-500 tw-h-2 tw-rounded-full tw-transition-all tw-duration-500"
                                    style={{ width: `${Math.min(enrollmentProgress, 100)}%` }}
                                  ></div>
                                </div>
                                <div className="tw-text-xs tw-text-gray-500 tw-mt-1">
                                  {availableSlots > 0 ? `${availableSlots} slot tersisa` : 'Kelas penuh'}
                                </div>
                              </div>

                              {/* Pricing */}
                              <div className="tw-mb-4 tw-mt-auto">
                                <div className="tw-flex tw-items-center tw-justify-between">
                                  <div>
                                    {cls.is_promo && cls.no_promo_price ? (
                                      <div>
                                        <span className="tw-text-gray-500 tw-text-sm tw-line-through">
                                          {formatPrice(cls.no_promo_price)}
                                        </span>
                                        <div className="tw-text-2xl tw-font-bold tw-text-green-600">
                                          {formatPrice(cls.price)}
                                        </div>
                                        {cls.promo_description && (
                                          <p className="tw-text-xs tw-text-red-600 tw-font-medium">
                                            {cls.promo_description}
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="tw-text-2xl tw-font-bold tw-text-orange-600">
                                        {formatPrice(cls.price)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Course Info */}
                              <div className="tw-flex tw-items-center tw-justify-between tw-mb-4 tw-text-sm tw-text-gray-500">
                                <div className="tw-flex tw-items-center tw-gap-2">
                                  <Bookmark className="tw-w-4 tw-h-4" />
                                  <span>{cls.course_name}</span>
                                </div>
                                <div className="tw-flex tw-items-center tw-gap-2">
                                  <User className="tw-w-4 tw-h-4" />
                                  <span>{cls.creator_name || 'Admin'}</span>
                                </div>
                              </div>
                              
                              {/* Action Button */}
                              <div className="tw-mt-auto">
                                {!isAuthenticated ? (
                                  <button 
                                    onClick={handleLogin}
                                    className="tw-w-full tw-font-bold tw-py-3 tw-px-4 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md tw-text-white hover:tw-shadow-lg hover:tw-scale-105 tw-bg-gradient-to-r tw-from-blue-500 tw-to-cyan-600"
                                  >
                                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                                      <LogIn className="tw-w-5 tw-h-5" />
                                      Login untuk Daftar
                                    </div>
                                  </button>
                                ) : isEnrolled ? (
                                  <div className="tw-w-full tw-font-bold tw-py-3 tw-px-4 tw-rounded-xl tw-border-2 tw-border-green-500 tw-bg-green-50 tw-text-green-700 tw-text-center">
                                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                                      <UserCheck className="tw-w-5 tw-h-5" />
                                      Sudah Terdaftar
                                    </div>
                                  </div>
                                ) : availableSlots <= 0 ? (
                                  <div className="tw-w-full tw-font-bold tw-py-3 tw-px-4 tw-rounded-xl tw-bg-gray-200 tw-text-gray-500 tw-text-center">
                                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                                      <Users className="tw-w-5 tw-h-5" />
                                      Kelas Penuh
                                    </div>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => handleAddToCart(cls.product_id, 'class')}
                                    disabled={isAddingToCart}
                                    className="tw-w-full tw-font-bold tw-py-3 tw-px-4 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md tw-text-white hover:tw-shadow-lg hover:tw-scale-105 tw-bg-gradient-to-r tw-from-orange-500 tw-to-red-600 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                                  >
                                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                                      {isAddingToCart ? (
                                        <>
                                          <div className="tw-animate-spin tw-rounded-full tw-h-4 tw-w-4 tw-border-b-2 tw-border-white"></div>
                                          Mendaftar...
                                        </>
                                      ) : (
                                        <>
                                          <ShoppingCart className="tw-w-5 tw-h-5" />
                                          Daftar Kelas
                                        </>
                                      )}
                                    </div>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Classes List View
                    <div className="tw-space-y-6">
                      {displayedClasses.map((cls) => {
                        const isEnrolled = enrolledClasses.has(cls.id);
                        const isAddingToCart = cartLoading[cls.product_id];
                        const availableSlots = cls.stock;
                        const enrollmentProgress = ((cls.current_students / cls.max_students) * 100);
                        
                        return (
                          <div
                            key={cls.id}
                            className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-transition-all tw-duration-300 tw-hover:shadow-2xl tw-overflow-hidden tw-relative"
                          >
                            {cls.is_promo && (
                              <div className="tw-absolute tw-top-4 tw-left-4 tw-z-10">
                                <div className="tw-bg-gradient-to-r tw-from-red-500 tw-to-pink-600 tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-bold tw-flex tw-items-center tw-gap-2">
                                  <Tag className="tw-w-4 tw-h-4" />
                                  {cls.no_promo_price && getDiscountPercentage(cls.no_promo_price, cls.price)}% OFF
                                </div>
                              </div>
                            )}

                            {isEnrolled && (
                              <div className="tw-absolute tw-top-4 tw-right-4 tw-z-10">
                                <div className="tw-bg-green-500 tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-bold tw-flex tw-items-center tw-gap-2">
                                  <UserCheck className="tw-w-4 tw-h-4" />
                                  Terdaftar
                                </div>
                              </div>
                            )}
                            
                            <div className="tw-flex tw-flex-col md:tw-flex-row">
                              <div className="tw-relative tw-w-full md:tw-w-80 tw-h-48 md:tw-h-auto">
                                <div 
                                  className="tw-w-full tw-h-full tw-bg-gradient-to-br tw-from-orange-400 tw-to-pink-500 tw-flex tw-items-center tw-justify-center"
                                  style={{
                                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.3"/><circle cx="80" cy="30" r="1.5" fill="white" opacity="0.2"/><circle cx="40" cy="70" r="1" fill="white" opacity="0.4"/><circle cx="70" cy="80" r="1.2" fill="white" opacity="0.3"/></svg>')`,
                                  }}
                                >
                                  <div className="tw-text-center tw-text-white">
                                    <GraduationCap className="tw-w-20 tw-h-20 tw-mx-auto tw-mb-2" />
                                    <div className="tw-text-sm tw-font-semibold tw-bg-black/20 tw-px-3 tw-py-1 tw-rounded-full">
                                      {cls.class_mode === 'online' ? (
                                        <div className="tw-flex tw-items-center tw-gap-1">
                                          <Video className="tw-w-4 tw-h-4" />
                                          Online Class
                                        </div>
                                      ) : (
                                        <div className="tw-flex tw-items-center tw-gap-1">
                                          <MapPin className="tw-w-4 tw-h-4" />
                                          Offline Class
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="tw-absolute tw-bottom-4 tw-left-4">
                                  <div className="tw-bg-white/90 tw-text-gray-800 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-semibold">
                                    {cls.classtype === 'online' ? 'Online' : 
                                     cls.classtype === 'utbk' ? 'UTBK' : 
                                     cls.classtype === 'sbmptn' ? 'SBMPTN' : 
                                     `Kelas ${cls.classtype}`}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="tw-flex-1 tw-p-6 tw-flex tw-flex-col">
                                <div className="tw-flex tw-justify-between tw-items-start tw-mb-4">
                                  <div className="tw-flex-1">
                                    <h5 className="tw-font-bold tw-text-2xl tw-text-orange-600 tw-mb-2">
                                      {cls.name}
                                    </h5>
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3 tw-text-sm tw-text-gray-600">
                                      <GraduationCap className="tw-w-4 tw-h-4 tw-text-orange-500" />
                                      <span className="tw-font-medium">{cls.teacher_name}</span>
                                      <span className="tw-text-gray-400">•</span>
                                      <Bookmark className="tw-w-4 tw-h-4 tw-text-blue-500" />
                                      <span>{cls.course_name}</span>
                                    </div>
                                    <p className="tw-text-gray-600 tw-mb-4 tw-leading-relaxed">
                                      {cls.description}
                                    </p>
                                  </div>
                                  
                                  <div className="tw-text-right tw-ml-6">
                                    {cls.is_promo && cls.no_promo_price ? (
                                      <div>
                                        <span className="tw-text-gray-500 tw-text-lg tw-line-through">
                                          {formatPrice(cls.no_promo_price)}
                                        </span>
                                        <div className="tw-text-3xl tw-font-bold tw-text-green-600">
                                          {formatPrice(cls.price)}
                                        </div>
                                        {cls.promo_description && (
                                          <p className="tw-text-sm tw-text-red-600 tw-font-medium">
                                            {cls.promo_description}
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="tw-text-3xl tw-font-bold tw-text-orange-600">
                                        {formatPrice(cls.price)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Class Schedule & Info */}
                                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-mb-4">
                                  <div className="tw-bg-gray-50 tw-rounded-lg tw-p-3">
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2 tw-text-sm tw-font-semibold tw-text-gray-700">
                                      <Calendar className="tw-w-4 tw-h-4 tw-text-blue-500" />
                                      Jadwal Kelas
                                    </div>
                                    <div className="tw-text-sm tw-text-gray-600 tw-space-y-1">
                                      <div>Mulai: {formatDateTime(cls.start_date)}</div>
                                      <div>Selesai: {formatDateTime(cls.end_date)}</div>
                                    </div>
                                  </div>

                                  <div className="tw-bg-gray-50 tw-rounded-lg tw-p-3">
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2 tw-text-sm tw-font-semibold tw-text-gray-700">
                                      <Users className="tw-w-4 tw-h-4 tw-text-orange-500" />
                                      Status Pendaftaran
                                    </div>
                                    <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                                      <span className="tw-text-sm tw-text-gray-600">
                                        {cls.current_students}/{cls.max_students} terdaftar
                                      </span>
                                      <span className="tw-text-sm tw-font-bold tw-text-orange-600">
                                        {Math.round(enrollmentProgress)}%
                                      </span>
                                    </div>
                                    <div className="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2">
                                      <div 
                                        className="tw-bg-gradient-to-r tw-from-orange-400 tw-to-red-500 tw-h-2 tw-rounded-full tw-transition-all tw-duration-500"
                                        style={{ width: `${Math.min(enrollmentProgress, 100)}%` }}
                                      ></div>
                                    </div>
                                    <div className="tw-text-xs tw-text-gray-500 tw-mt-1">
                                      {availableSlots > 0 ? `${availableSlots} slot tersisa` : 'Kelas penuh'}
                                    </div>
                                  </div>
                                </div>

                                {/* Features */}
                                {cls.features && cls.features.length > 0 && (
                                  <div className="tw-mb-4">
                                    <p className="tw-text-gray-700 tw-font-semibold tw-mb-2">
                                      Yang akan kamu dapatkan:
                                    </p>
                                    <div className="tw-flex tw-flex-wrap tw-gap-2">
                                      {cls.features.map((feature, index) => (
                                        <span key={index} className="tw-bg-orange-100 tw-text-orange-800 tw-text-sm tw-px-3 tw-py-1 tw-rounded-full">
                                          {feature}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="tw-flex tw-justify-between tw-items-center tw-mt-auto">
                                  <div className="tw-flex tw-items-center tw-gap-4 tw-text-sm tw-text-gray-500">
                                    <div className="tw-flex tw-items-center tw-gap-1">
                                      <Calendar className="tw-w-4 tw-h-4" />
                                      <span>{formatDate(cls.create_date)}</span>
                                    </div>
                                    <div className="tw-flex tw-items-center tw-gap-1">
                                      <User className="tw-w-4 tw-h-4" />
                                      <span>{cls.creator_name || 'Admin'}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="tw-ml-4">
                                    {!isAuthenticated ? (
                                      <button 
                                        onClick={handleLogin}
                                        className="tw-font-bold tw-py-3 tw-px-6 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md tw-text-white hover:tw-shadow-lg hover:tw-scale-105 tw-bg-gradient-to-r tw-from-blue-500 tw-to-cyan-600"
                                      >
                                        <div className="tw-flex tw-items-center tw-gap-2">
                                          <LogIn className="tw-w-5 tw-h-5" />
                                          Login untuk Daftar
                                        </div>
                                      </button>
                                    ) : isEnrolled ? (
                                      <div className="tw-font-bold tw-py-3 tw-px-6 tw-rounded-xl tw-border-2 tw-border-green-500 tw-bg-green-50 tw-text-green-700">
                                        <div className="tw-flex tw-items-center tw-gap-2">
                                          <UserCheck className="tw-w-5 tw-h-5" />
                                          Sudah Terdaftar
                                        </div>
                                      </div>
                                    ) : availableSlots <= 0 ? (
                                      <div className="tw-font-bold tw-py-3 tw-px-6 tw-rounded-xl tw-bg-gray-200 tw-text-gray-500">
                                        <div className="tw-flex tw-items-center tw-gap-2">
                                          <Users className="tw-w-5 tw-h-5" />
                                          Kelas Penuh
                                        </div>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={() => handleAddToCart(cls.product_id, 'class')}
                                        disabled={isAddingToCart}
                                        className="tw-font-bold tw-py-3 tw-px-6 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md tw-text-white hover:tw-shadow-lg hover:tw-scale-105 tw-bg-gradient-to-r tw-from-orange-500 tw-to-red-600 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                                      >
                                        <div className="tw-flex tw-items-center tw-gap-2">
                                          {isAddingToCart ? (
                                            <>
                                              <div className="tw-animate-spin tw-rounded-full tw-h-4 tw-w-4 tw-border-b-2 tw-border-white"></div>
                                              Mendaftar...
                                            </>
                                          ) : (
                                            <>
                                              <ShoppingCart className="tw-w-5 tw-h-5" />
                                              Daftar Kelas
                                            </>
                                          )}
                                        </div>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {/* Show More/Less Button */}
                {filteredItems.length > displayLimit && (
                  <div className="tw-text-center tw-mt-8">
                    <button
                      onClick={() => activeTab === 'courses' ? setShowAll(!showAll) : setShowAllClasses(!showAllClasses)}
                      className="tw-bg-white tw-text-purple-600 tw-font-bold tw-py-3 tw-px-8 tw-rounded-xl tw-shadow-lg tw-transition-all tw-duration-300 hover:tw-shadow-xl hover:tw-scale-105"
                    >
                      <div className="tw-flex tw-items-center tw-gap-2">
                        {(activeTab === 'courses' ? showAll : showAllClasses) ? (
                          <>
                            Tampilkan Lebih Sedikit
                            <ChevronUp className="tw-w-5 tw-h-5" />
                          </>
                        ) : (
                          <>
                            Tampilkan Semua ({filteredItems.length} {activeTab === 'courses' ? 'kursus' : 'kelas'})
                            <ChevronDown className="tw-w-5 tw-h-5" />
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                )}

                {/* Empty State */}
                {filteredItems.length === 0 && (
                  <div className="tw-text-center tw-py-12">
                    <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-8 tw-border tw-border-white/20">
                      {activeTab === 'courses' ? (
                        <ShoppingCart className="tw-w-16 tw-h-16 tw-text-white/60 tw-mx-auto tw-mb-4" />
                      ) : (
                        <GraduationCap className="tw-w-16 tw-h-16 tw-text-white/60 tw-mx-auto tw-mb-4" />
                      )}
                      <h3 className="tw-text-xl tw-font-bold tw-text-white tw-mb-2">
                        Tidak ada {activeTab === 'courses' ? 'kursus' : 'kelas'} ditemukan
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
                  Tips Maksimalkan Pembelajaran
                </h4>
                <p className="tw-text-white/80 tw-text-lg tw-max-w-2xl tw-mx-auto">
                  {activeTab === 'courses' 
                    ? 'Ikuti panduan ini untuk mendapatkan hasil pembelajaran yang optimal dari kursus online!'
                    : 'Tips khusus untuk memaksimalkan pengalaman belajar di kelas live interaktif!'
                  }
                </p>
              </div>

              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6 tw-mb-8">
                {(activeTab === 'courses' ? [
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
                ] : [
                  {
                    icon: <Calendar className="tw-w-6 tw-h-6" />,
                    title: "Datang Tepat Waktu",
                    desc: "Hadir 10 menit sebelum kelas dimulai untuk persiapan optimal",
                    color: "tw-from-blue-500 tw-to-cyan-500"
                  },
                  {
                    icon: <Users className="tw-w-6 tw-h-6" />,
                    title: "Aktif Berpartisipasi",
                    desc: "Jangan malu untuk bertanya dan berkontribusi dalam diskusi",
                    color: "tw-from-green-500 tw-to-emerald-500"
                  },
                  {
                    icon: <Video className="tw-w-6 tw-h-6" />,
                    title: "Siapkan Teknologi",
                    desc: "Pastikan koneksi internet stabil dan perangkat siap digunakan",
                    color: "tw-from-yellow-500 tw-to-orange-500"
                  },
                  {
                    icon: <BookOpen className="tw-w-6 tw-h-6" />,
                    title: "Siapkan Materi",
                    desc: "Baca materi pendukung sebelum kelas untuk pemahaman yang lebih baik",
                    color: "tw-from-purple-500 tw-to-violet-500"
                  },
                  {
                    icon: <Target className="tw-w-6 tw-h-6" />,
                    title: "Fokus & Minimasi Gangguan",
                    desc: "Cari tempat tenang dan matikan notifikasi yang tidak penting",
                    color: "tw-from-pink-500 tw-to-rose-500"
                  },
                  {
                    icon: <TrendingUp className="tw-w-6 tw-h-6" />,
                    title: "Follow Up Setelah Kelas",
                    desc: "Review materi dan lakukan latihan untuk memperkuat pemahaman",
                    color: "tw-from-indigo-500 tw-to-blue-500"
                  }
                ]).map((tip, index) => (
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

              {/* Study Method Cards - FIXED */}
              <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20">
                <h5 className="tw-text-xl tw-font-bold tw-text-white tw-mb-4 tw-text-center">
                  {activeTab === 'courses' ? 'Metode Belajar Efektif' : 'Tips Sukses di Kelas Live'}
                </h5>
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4">
                  {(activeTab === 'courses' ? [
                    { method: "Pomodoro", desc: "25 menit fokus + 5 menit istirahat", emoji: "⏰" },
                    { method: "Active Recall", desc: "Uji pemahaman tanpa melihat materi", emoji: "🧠" },
                    { method: "Spaced Repetition", desc: "Review materi dalam interval waktu", emoji: "📅" },
                    { method: "Feynman Technique", desc: "Jelaskan konsep dengan bahasa sederhana", emoji: "💬" }
                  ] : [
                    { method: "Prepare Questions", desc: "Siapkan pertanyaan sebelum kelas", emoji: "❓" },
                    { method: "Take Notes", desc: "Buat catatan selama kelas berlangsung", emoji: "📝" },
                    { method: "Network", desc: "Berkenalan dengan teman sekelas", emoji: "🤝" },
                    { method: "Follow Up", desc: "Hubungi mentor jika ada yang belum jelas", emoji: "📞" }
                  ]).map((method, index) => (
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
              <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-overflow-hidden">
                <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/20 tw-rounded-full tw-blur-xl tw-animate-pulse tw-delay-1000"></div>
                <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-500"></div>
              </div>

              <div className="tw-relative tw-z-10">
                <div className="tw-mb-8">
                  <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-20 tw-h-20 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-mb-6 tw-shadow-lg">
                    <Rocket className="tw-w-10 tw-h-10 tw-text-white" />
                  </div>
                  <h3 className="tw-text-3xl md:tw-text-4xl tw-font-bold tw-text-white tw-mb-4">
                    Siap Memulai Perjalanan Pembelajaran?
                  </h3>
                  <p className="tw-text-white/90 tw-text-lg tw-mb-6 tw-max-w-3xl tw-mx-auto tw-leading-relaxed">
                    {activeTab === 'courses' 
                      ? 'Bergabunglah dengan ribuan pelajar lainnya dan tingkatkan skill mu hari ini juga! Akses ratusan kursus berkualitas tinggi dengan mentor berpengalaman.'
                      : 'Daftar di kelas live interaktif dan belajar langsung dari mentor expert! Dapatkan pengalaman pembelajaran yang personal dan mendalam.'
                    }
                  </p>
                </div>

                {/* Feature Highlights */}
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6 tw-mb-8">
                  {(activeTab === 'courses' ? [
                    {
                      icon: <Trophy className="tw-w-6 tw-h-6 tw-text-white" />,
                      title: "Sertifikat Resmi",
                      desc: "Dapatkan sertifikat yang diakui industri setelah menyelesaikan kursus"
                    },
                    {
                      icon: <Users className="tw-w-6 tw-h-6 tw-text-white" />,
                      title: "Komunitas Aktif",
                      desc: "Bergabung dengan komunitas learner yang saling mendukung"
                    },
                    {
                      icon: <Clock className="tw-w-6 tw-h-6 tw-text-white" />,
                      title: "Akses Selamanya",
                      desc: "Akses materi kursus kapan saja dan di mana saja selamanya"
                    }
                  ] : [
                    {
                      icon: <GraduationCap className="tw-w-6 tw-h-6 tw-text-white" />,
                      title: "Mentor Expert",
                      desc: "Belajar langsung dari praktisi berpengalaman di bidangnya"
                    },
                    {
                      icon: <Users className="tw-w-6 tw-h-6 tw-text-white" />,
                      title: "Kelas Interaktif",
                      desc: "Diskusi real-time dan tanya jawab langsung dengan mentor"
                    },
                    {
                      icon: <Award className="tw-w-6 tw-h-6 tw-text-white" />,
                      title: "Learning by Doing",
                      desc: "Praktik langsung dan project-based learning"
                    }
                  ]).map((feature, index) => (
                    <div key={index} className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20">
                      <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-green-400 tw-to-green-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                        {feature.icon}
                      </div>
                      <h4 className="tw-font-bold tw-text-white tw-mb-2">{feature.title}</h4>
                      <p className="tw-text-white/80 tw-text-sm">{feature.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="tw-pt-8 tw-border-t tw-border-white/20">
                  <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-6 tw-text-center">
                    <div>
                      <div className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-yellow-300 tw-mb-1">
                        {activeTab === 'courses' ? `${liveCourses.length}+` : `${liveClasses.length}+`}
                      </div>
                      <div className="tw-text-white/80 tw-text-sm">
                        {activeTab === 'courses' ? 'Kursus Live' : 'Kelas Tersedia'}
                      </div>
                    </div>
                    <div>
                      <div className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-yellow-300 tw-mb-1">50+</div>
                      <div className="tw-text-white/80 tw-text-sm">Mentor Expert</div>
                    </div>
                    <div>
                      <div className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-yellow-300 tw-mb-1">95%</div>
                      <div className="tw-text-white/80 tw-text-sm">Tingkat Kepuasan</div>
                    </div>
                    <div>
                      <div className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-yellow-300 tw-mb-1">24/7</div>
                      <div className="tw-text-white/80 tw-text-sm">Support</div>
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

  return {
    props: {
      initialQuote: randomQuote,
    },
  };
};

export default CoursePage;