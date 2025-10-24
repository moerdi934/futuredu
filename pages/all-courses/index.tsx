// pages/all-courses.tsx - Fixed Date Handling and Complete Implementation - Indonesian UI
import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Star, ChevronDown, ChevronUp, 
  GraduationCap, User, Search, Grid, List, Quote, Eye, Coins, Clock, Calendar, QrCode
} from 'lucide-react';
import NavigationBar from '../../components/layout/NavigationBar';
import { ButtonGradient } from '../../components/button/ButtonTemplate';
import GoToCartFloater from '../../components/floater/GoToCartFloater';
import CoursePurchaseModal from './CoursePurchaseModal';
import ClassPurchaseModal from './ClassPurchaseModal';
import CoinPurchaseModal from '../../components/modals/CoinPurchaseModal';
import StudentAttendanceModal from '../panel/courses/classes-page/StudentAttendanceModal';

// Types
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
  coin_price?: number;
  coin_type?: 'course';
}

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
  coin_price?: number;
  coin_type?: 'class';
}

// FIXED: Interface for enrolled classes matching the API response structure
interface EnrolledClass {
  id: number;
  name: string;
  description: string;
  teacher_name: string;
  teacher_id: string | number;
  course_name: string;
  course_id: string | number;
  start_date: string; // ISO date string from API
  end_date: string; // ISO date string from API
  real_start_datetime?: string;
  real_end_datetime?: string;
  class_mode: string;
  meeting_url?: string;
  status: 'Not Start' | 'Started' | 'Finished' | 'Need Approve' | 'Rejected' | 'Deleted';
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

interface CoinBalance {
  coin_type: 'class' | 'course' | 'tryout';
  total_balance: number;
  expiring_soon: number;
}

interface QuoteType {
  text: string;
  author: string;
}

interface CoursePageProps {
  initialQuote: QuoteType;
}

// Accordion Component
const AccordionSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  gradient: string;
}> = ({ title, icon, count, isOpen, onToggle, children, gradient }) => {
  return (
    <div className="tw-mb-6">
      <button
        onClick={onToggle}
        className={`tw-w-full tw-p-6 tw-rounded-2xl tw-transition-all tw-duration-300 tw-shadow-lg hover:tw-shadow-xl ${gradient}`}
      >
        <div className="tw-flex tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-gap-4">
            <div className="tw-w-12 tw-h-12 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-flex tw-items-center tw-justify-center">
              {icon}
            </div>
            <div className="tw-text-left">
              <h2 className="tw-text-2xl tw-font-bold tw-text-white">{title}</h2>
              <p className="tw-text-white/80 tw-text-sm">{count} item</p>
            </div>
          </div>
          <div className="tw-text-white">
            {isOpen ? <ChevronUp className="tw-w-6 tw-h-6" /> : <ChevronDown className="tw-w-6 tw-h-6" />}
          </div>
        </div>
      </button>
      
      {isOpen && (
        <div className="tw-mt-4 tw-animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

const CoursePage: React.FC<CoursePageProps> = ({ initialQuote }) => {
  const router = useRouter();
  const { isAuthenticated, id: userId } = useAuth();
  
  // State
  const [liveCourses, setLiveCourses] = useState<LiveCourse[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<LiveCourse[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<LiveClass[]>([]);
  const [currentQuote, setCurrentQuote] = useState<QuoteType>(initialQuote);
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);
  const [enrolledClassesLoading, setEnrolledClassesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [purchasedCourses, setPurchasedCourses] = useState<Set<number>>(new Set());
  const [userProgress, setUserProgress] = useState<UserCourseProgress[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);
  
  // Floater state (only for regular cart purchases)
  const [showFloater, setShowFloater] = useState(false);
  const [floaterItemName, setFloaterItemName] = useState('');
  
  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: number; name: string } | null>(null);
  const [selectedClass, setSelectedClass] = useState<{ id: number; name: string } | null>(null);
  const [selectedAttendanceClass, setSelectedAttendanceClass] = useState<EnrolledClass | null>(null);
  
  // Coin system states
  const [coinBalances, setCoinBalances] = useState<CoinBalance[]>([]);
  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const [selectedCoinItem, setSelectedCoinItem] = useState<{ product_id: number; name: string; coin_type: 'class' | 'course'; coin_price: number } | null>(null);
  const [coinLoading, setCoinLoading] = useState(false);
  
  // Accordion states
  const [accordions, setAccordions] = useState({
    yourClasses: true,
    yourCourses: true,
    availableClasses: false,
    availableCourses: false,
  });

  const toggleAccordion = (key: keyof typeof accordions) => {
    setAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // FIXED: Fetch enrolled classes using the /classes API endpoint
  const fetchEnrolledClasses = async () => {
    if (!isAuthenticated || !userId) return;
    
    try {
      setEnrolledClassesLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/classes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: 1,
            limit: 100,
            studentId: userId, // Filter by current user as student
            includeDeleted: 'false',
            approvalStatus: 'approved' // Only approved classes
          }
        }
      );

      if (response.data && response.data.data) {
        // Filter to only show classes that haven't finished (real_end_datetime is null)
        const activeClasses = response.data.data
          .filter((cls: any) => !cls.real_end_datetime) // Only unfinished classes
          .map((cls: any): EnrolledClass => ({
            id: cls.id,
            name: cls.name,
            description: cls.description,
            teacher_name: cls.teacher_name,
            teacher_id: cls.teacher_id,
            course_name: cls.course_name,
            course_id: cls.course_id,
            // FIXED: Use the actual date formatting from API response structure
            start_date: cls.real_start_datetime || cls.start_time || cls.date, // Use available date field
            end_date: cls.real_end_datetime || cls.end_time || cls.date, // Use available date field
            real_start_datetime: cls.real_start_datetime,
            real_end_datetime: cls.real_end_datetime,
            class_mode: cls.class_mode || 'offline',
            meeting_url: cls.meeting_url,
            status: cls.status,
            create_date: cls.create_date
          }));

        setEnrolledClasses(activeClasses);
      }
    } catch (error) {
      console.error('Error fetching enrolled classes:', error);
      setEnrolledClasses([]);
    } finally {
      setEnrolledClassesLoading(false);
    }
  };

  // Fetch user coin balances
  const fetchCoinBalances = async () => {
    if (!isAuthenticated || !userId) return;
    
    try {
      setCoinLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/coins/balance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
          params: { _t: Date.now() }
        }
      );

      if (response.data.success) {
        setCoinBalances(response.data.data.balances || []);
      }
    } catch (error) {
      console.error('Error fetching coin balances:', error);
      setCoinBalances([]);
    } finally {
      setCoinLoading(false);
    }
  };

  // Get coin balance for specific type
  const getCoinBalance = (coinType: 'class' | 'course'): number => {
    const balance = coinBalances.find(b => b.coin_type === coinType);
    return balance ? balance.total_balance : 0;
  };

  // Fetch functions
  useEffect(() => {
    fetchLiveCourses();
    fetchLiveClasses();
  }, [sortBy]);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchUserProgress();
      fetchPurchasedCourses();
      fetchCoinBalances();
      fetchEnrolledClasses();
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    let filtered = liveCourses;
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredCourses(filtered);
  }, [liveCourses, searchTerm]);

  useEffect(() => {
    let filtered = liveClasses;
    if (searchTerm) {
      filtered = filtered.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredClasses(filtered);
  }, [liveClasses, searchTerm]);

  const fetchLiveCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        sortBy: sortBy,
        classtype: 'all'
      });
      const response = await fetch(`/api/courses/live?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setLiveCourses(data.data.courses);
      }
    } catch (error) {
      console.error('Error fetching live courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveClasses = async () => {
    setClassesLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        sortBy: sortBy,
        classtype: 'all'
      });
      const response = await fetch(`/api/classes/live?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setLiveClasses(data.data.classes);
      }
    } catch (error) {
      console.error('Error fetching live classes:', error);
    } finally {
      setClassesLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!isAuthenticated || typeof window === 'undefined') return;
    const token = localStorage.getItem('authToken');
    if (!token) return;

    setProgressLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/progress`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserProgress(response.data.data || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setProgressLoading(false);
    }
  };

  const fetchPurchasedCourses = async () => {
    if (!isAuthenticated) return;
    try {
      const purchased = new Set(userProgress.map(p => p.id));
      setPurchasedCourses(purchased);
    } catch (error) {
      console.error('Error fetching purchased courses:', error);
    }
  };

  useEffect(() => {
    fetchPurchasedCourses();
  }, [userProgress]);

  // Handlers
  const handleStartLearning = (courseString: string) => {
    router.push(`/course/${courseString}`);
  };

  const handleViewCourse = (courseString: string) => {
    router.push(`/course/${courseString}`);
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleBuyCourse = (courseId: number, courseName: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSelectedCourse({ id: courseId, name: courseName });
    setShowCourseModal(true);
  };

  const handleBuyClass = (classId: number, className: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSelectedClass({ id: classId, name: className });
    setShowClassModal(true);
  };

  // Handle attendance
  const handleAttendance = (enrolledClass: EnrolledClass) => {
    setSelectedAttendanceClass(enrolledClass);
    setShowAttendanceModal(true);
  };

  // Handle coin purchase
  const handleBuyWithCoins = (item: LiveCourse | LiveClass, type: 'course' | 'class') => {
    if (!isAuthenticated) {
      alert('Silakan login terlebih dahulu untuk membeli dengan koin');
      router.push('/login');
      return;
    }

    setSelectedCoinItem({
      product_id: item.product_id,
      name: 'title' in item ? item.title : item.name,
      coin_type: type,
      coin_price: item.coin_price || 0
    });
    setCoinModalOpen(true);
  };

  // Handle coin purchase success - refresh page instead of showing floater
  const handleCoinPurchaseSuccess = (entitlements: string[]) => {
    console.log('Coin purchase successful, refreshing page...');
    
    // Show a brief success message before refresh
    alert(`Pembelian berhasil! ${entitlements.join(', ')} telah ditambahkan ke akun Anda.`);
    
    // Refresh the page to show updated data
    window.location.reload();
  };

  // Regular cart purchase success handler (still shows floater)
  const handleAddToCart = async (productId: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Not authenticated');

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

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to add to cart');
    }
  };

  const handlePurchaseSuccess = (itemName: string) => {
    setFloaterItemName(itemName);
    setShowFloater(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = (originalPrice: number, promoPrice: number) => {
    return Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
  };

  // FIXED: Proper date formatting function for ISO date strings
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Belum ditentukan';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Tanggal tidak valid';
      
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Tanggal tidak valid';
    }
  };

  // Format class status
  const formatClassStatus = (status: string) => {
    const statusConfig = {
      'Not Start': { 
        color: 'tw-bg-gray-100 tw-text-gray-800', 
        icon: <Clock className="tw-w-3 tw-h-3" />,
        label: 'Belum Dimulai'
      },
      'Started': { 
        color: 'tw-bg-green-100 tw-text-green-800', 
        icon: <div className="tw-w-2 tw-h-2 tw-bg-green-500 tw-rounded-full tw-animate-pulse"></div>,
        label: 'Sedang Berlangsung'
      },
      'Finished': { 
        color: 'tw-bg-blue-100 tw-text-blue-800', 
        icon: <div className="tw-w-2 tw-h-2 tw-bg-blue-500 tw-rounded-full"></div>,
        label: 'Selesai'
      }
    };

    const config = statusConfig[status] || statusConfig['Not Start'];
    
    return (
      <span className={`tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-flex tw-items-center tw-gap-1 ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getDefaultImage = () => {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
  };

  // Get available items (exclude enrolled classes from live classes)
  const enrolledClassIds = new Set(enrolledClasses.map(cls => cls.id));
  const availableClasses = filteredClasses.filter(cls => !enrolledClassIds.has(cls.id));
  const availableCourses = filteredCourses.filter(course => !purchasedCourses.has(course.id));

  return (
    <div className="tw-min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <NavigationBar />
      <Head>
        <title>Kursus & Kelas - Platform Pembelajaran</title>
        <meta name="description" content="Jelajahi koleksi kursus dan kelas menarik untuk tingkatkan skill-mu" />
      </Head>

      {/* Floater - Only for regular cart purchases */}
      <GoToCartFloater
        show={showFloater}
        onHide={() => setShowFloater(false)}
        itemName={floaterItemName}
      />

      {/* Modals */}
      {selectedCourse && (
        <CoursePurchaseModal
          show={showCourseModal}
          onHide={() => setShowCourseModal(false)}
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
          onAddToCart={handleAddToCart}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      {selectedClass && (
        <ClassPurchaseModal
          show={showClassModal}
          onHide={() => setShowClassModal(false)}
          classId={selectedClass.id}
          className={selectedClass.name}
          onAddToCart={handleAddToCart}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      {/* Coin Purchase Modal */}
      {selectedCoinItem && (
        <CoinPurchaseModal
          show={coinModalOpen}
          onHide={() => {
            setCoinModalOpen(false);
            setSelectedCoinItem(null);
          }}
          productId={selectedCoinItem.product_id}
          productName={selectedCoinItem.name}
          coinType={selectedCoinItem.coin_type}
          coinPrice={selectedCoinItem.coin_price}
          userCoinBalance={getCoinBalance(selectedCoinItem.coin_type)}
          onSuccess={handleCoinPurchaseSuccess}
        />
      )}

      {/* Student Attendance Modal */}
      {selectedAttendanceClass && (
        <StudentAttendanceModal
          show={showAttendanceModal}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedAttendanceClass(null);
          }}
          classData={selectedAttendanceClass}
        />
      )}

      <div className="tw-relative tw-overflow-hidden tw-pb-12">
        <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-violet-600/20 tw-to-purple-800/20"></div>
        
        <div className="tw-container tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-py-12 tw-relative tw-z-10 tw-max-w-7xl">
          {/* Header */}
          <div className="tw-text-center tw-mb-12">
            <div className="tw-mb-8">
              <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-20 tw-h-20 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-mb-6 tw-shadow-lg">
                <GraduationCap className="tw-w-10 tw-h-10 tw-text-yellow-300" />
              </div>
              <h1 className="tw-text-4xl md:tw-text-5xl lg:tw-text-6xl tw-font-bold tw-text-white tw-mb-4 tw-drop-shadow-lg">
                Kursus & Kelas
              </h1>
              <p className="tw-text-lg md:tw-text-xl tw-text-white/90 tw-font-medium tw-drop-shadow tw-max-w-3xl tw-mx-auto">
                Jelajahi koleksi kursus dan kelas menarik untuk tingkatkan skill-mu dengan pembelajaran yang interaktif!
              </p>
            </div>
          </div>

          {/* Quote Section */}
          <div className="tw-max-w-6xl tw-mx-auto tw-mb-12">
            <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20">
              <div className="tw-flex tw-items-center tw-justify-center tw-gap-3 tw-mb-4">
                <Quote className="tw-w-8 tw-h-8 tw-text-yellow-300" />
                <h3 className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-white">
                  Inspirasi Belajar
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

          {/* Coin Balance Display */}
          {isAuthenticated && (
            <div className="tw-max-w-6xl tw-mx-auto tw-mb-8">
              <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20">
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                  <div className="tw-flex tw-items-center tw-justify-between">
                    <div className="tw-flex tw-items-center tw-gap-3">
                      <div className="tw-w-10 tw-h-10 tw-bg-blue-500 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                        <Coins className="tw-w-5 tw-h-5 tw-text-white" />
                      </div>
                      <div>
                        <h6 className="tw-font-bold tw-text-white tw-mb-0">Koin Kelas</h6>
                        <p className="tw-text-white/80 tw-text-sm tw-mb-0">Untuk pendaftaran kelas instan</p>
                      </div>
                    </div>
                    <div className="tw-text-right">
                      {coinLoading ? (
                        <div className="tw-animate-pulse tw-bg-white/20 tw-h-8 tw-w-16 tw-rounded"></div>
                      ) : (
                        <div className="tw-text-2xl tw-font-bold tw-text-white">
                          {getCoinBalance('class')}
                        </div>
                      )}
                      <div className="tw-text-sm tw-text-white/80">Tersedia</div>
                    </div>
                  </div>
                  
                  <div className="tw-flex tw-items-center tw-justify-between">
                    <div className="tw-flex tw-items-center tw-gap-3">
                      <div className="tw-w-10 tw-h-10 tw-bg-green-500 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                        <Coins className="tw-w-5 tw-h-5 tw-text-white" />
                      </div>
                      <div>
                        <h6 className="tw-font-bold tw-text-white tw-mb-0">Koin Kursus</h6>
                        <p className="tw-text-white/80 tw-text-sm tw-mb-0">Untuk akses kursus instan</p>
                      </div>
                    </div>
                    <div className="tw-text-right">
                      {coinLoading ? (
                        <div className="tw-animate-pulse tw-bg-white/20 tw-h-8 tw-w-16 tw-rounded"></div>
                      ) : (
                        <div className="tw-text-2xl tw-font-bold tw-text-white">
                          {getCoinBalance('course')}
                        </div>
                      )}
                      <div className="tw-text-sm tw-text-white/80">Tersedia</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="tw-max-w-6xl tw-mx-auto tw-mb-8">
            <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20">
              <div className="tw-flex tw-flex-col lg:tw-flex-row tw-gap-4 tw-items-center tw-justify-between">
                <div className="tw-relative tw-w-full lg:tw-w-96">
                  <Search className="tw-absolute tw-left-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-white/60 tw-w-5 tw-h-5" />
                  <input
                    type="text"
                    placeholder="Cari kursus atau kelas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="tw-pl-10 tw-pr-4 tw-py-3 tw-rounded-xl tw-border-0 tw-bg-white/20 tw-text-white tw-placeholder-white/60 tw-backdrop-blur-sm tw-w-full"
                  />
                </div>
                
                <div className="tw-flex tw-gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="tw-px-4 tw-py-3 tw-rounded-xl tw-border-0 tw-bg-white/20 tw-text-white tw-backdrop-blur-sm"
                  >
                    <option value="newest" className="tw-text-gray-800">Terbaru</option>
                    <option value="oldest" className="tw-text-gray-800">Terlama</option>
                    <option value="price_low" className="tw-text-gray-800">Harga Terendah</option>
                    <option value="price_high" className="tw-text-gray-800">Harga Tertinggi</option>
                  </select>

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
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="tw-max-w-6xl tw-mx-auto tw-space-y-6">
            
            {/* 1. Your Courses */}
            {isAuthenticated && userProgress.length > 0 && (
              <AccordionSection
                title="Kursus Kamu"
                icon={<BookOpen className="tw-w-6 tw-h-6 tw-text-white" />}
                count={userProgress.length}
                isOpen={accordions.yourCourses}
                onToggle={() => toggleAccordion('yourCourses')}
                gradient="tw-bg-gradient-to-r tw-from-blue-500 tw-to-cyan-600"
              >
                <div className={viewMode === 'grid' 
                  ? 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6' 
                  : 'tw-space-y-6'
                }>
                  {userProgress.map((course) => (
                    <div key={course.id} className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-overflow-hidden tw-transition-all tw-duration-300 hover:tw-scale-105">
                      <div className="tw-relative tw-h-48">
                        <img
                          src={course.imageurl || getDefaultImage()}
                          alt={course.title}
                          className="tw-w-full tw-h-full tw-object-cover"
                        />
                        <div className="tw-absolute tw-top-4 tw-left-4">
                          <div className={`tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-bold ${
                            course.overall_progress_percentage >= 100 ? 'tw-bg-green-500' : 'tw-bg-blue-500'
                          }`}>
                            {Math.round(course.overall_progress_percentage)}%
                          </div>
                        </div>
                      </div>
                      <div className="tw-p-6">
                        <h5 className="tw-font-bold tw-text-lg tw-text-purple-600 tw-mb-2">{course.title}</h5>
                        <p className="tw-text-gray-600 tw-text-sm tw-mb-4 tw-line-clamp-2">{course.description}</p>
                        <div className="tw-text-sm tw-text-gray-500 tw-mb-4">
                          {course.finished_quiz_topics}/{course.quiz} Kuis • {course.finished_materials}/{course.material} Materi
                        </div>
                        <ButtonGradient
                          action={course.overall_progress_percentage >= 100 ? 'view' : 'play'}
                          onClick={() => handleStartLearning(course.course_string)}
                          customText={course.overall_progress_percentage >= 100 ? 'Ulasan' : 'Lanjutkan'}
                          size="sm"
                          className="tw-w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionSection>
            )}

            {/* 2. Your Classes - FIXED with proper date handling */}
            {isAuthenticated && enrolledClasses.length > 0 && (
              <AccordionSection
                title="Kelas Kamu"
                icon={<GraduationCap className="tw-w-6 tw-h-6 tw-text-white" />}
                count={enrolledClasses.length}
                isOpen={accordions.yourClasses}
                onToggle={() => toggleAccordion('yourClasses')}
                gradient="tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-600"
              >
                {enrolledClassesLoading ? (
                  <div className="tw-flex tw-justify-center tw-items-center tw-py-12">
                    <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-white"></div>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' 
                    ? 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6' 
                    : 'tw-space-y-6'
                  }>
                    {enrolledClasses.map((cls) => (
                      <div key={cls.id} className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-overflow-hidden tw-transition-all tw-duration-300 hover:tw-scale-105">
                        <div className="tw-relative tw-h-48 tw-bg-gradient-to-br tw-from-green-400 tw-to-emerald-500 tw-flex tw-items-center tw-justify-center">
                          <GraduationCap className="tw-w-16 tw-h-16 tw-text-white" />
                          <div className="tw-absolute tw-top-4 tw-right-4">
                            {formatClassStatus(cls.status)}
                          </div>
                        </div>
                        <div className="tw-p-6">
                          <h5 className="tw-font-bold tw-text-lg tw-text-orange-600 tw-mb-2">{cls.name}</h5>
                          <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3 tw-text-sm tw-text-gray-600">
                            <User className="tw-w-4 tw-h-4" />
                            <span>{cls.teacher_name}</span>
                          </div>
                          <p className="tw-text-gray-600 tw-text-sm tw-mb-4 tw-line-clamp-2">{cls.description}</p>
                          
                          <div className="tw-bg-gray-50 tw-rounded-lg tw-p-3 tw-mb-4">
                            <div className="tw-text-xs tw-text-gray-600 tw-space-y-1">
                              <div className="tw-flex tw-items-center tw-gap-1">
                                <Calendar className="tw-w-3 tw-h-3" />
                                <span>Mulai: {formatDateTime(cls.start_date)}</span>
                              </div>
                              <div className="tw-flex tw-items-center tw-gap-1">
                                <Calendar className="tw-w-3 tw-h-3" />
                                <span>Selesai: {formatDateTime(cls.end_date)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Show attendance button for ongoing classes */}
                          {cls.status === 'Started' && (
                            <div className="tw-mb-4">
                              <ButtonGradient
                                action="custom"
                                onClick={() => handleAttendance(cls)}
                                customText={
                                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                                    <QrCode className="tw-w-4 tw-h-4" />
                                    <span>Presensi</span>
                                  </div>
                                }
                                size="sm"
                                className="tw-w-full"
                                customColors={{
                                  gradient1: '#EF4444',
                                  gradient2: '#DC2626',
                                  text: '#FFFFFF'
                                }}
                              />
                            </div>
                          )}

                          {/* Show meeting link for online classes */}
                          {cls.class_mode === 'online' && cls.meeting_url && cls.status === 'Started' && (
                            <div className="tw-mb-4">
                              <a
                                href={cls.meeting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tw-w-full tw-py-2 tw-px-4 tw-bg-blue-500 tw-text-white tw-rounded-lg tw-text-center tw-block tw-text-sm tw-font-medium hover:tw-bg-blue-600 tw-transition-colors"
                              >
                                Gabung Meeting
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionSection>
            )}

            {/* 3. Available Courses */}
            <AccordionSection
              title="Kursus yang Tersedia"
              icon={<BookOpen className="tw-w-6 tw-h-6 tw-text-white" />}
              count={availableCourses.length}
              isOpen={accordions.availableCourses}
              onToggle={() => toggleAccordion('availableCourses')}
              gradient="tw-bg-gradient-to-r tw-from-purple-500 tw-to-violet-600"
            >
              {loading ? (
                <div className="tw-flex tw-justify-center tw-items-center tw-py-12">
                  <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-white"></div>
                </div>
              ) : availableCourses.length === 0 ? (
                <div className="tw-text-center tw-py-12 tw-bg-white/10 tw-rounded-2xl">
                  <p className="tw-text-white tw-text-lg">Tidak ada kursus yang tersedia saat ini</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6' 
                  : 'tw-space-y-6'
                }>
                  {availableCourses.map((course) => {
                    const canBuyWithCoins = course.coin_price !== undefined && course.coin_type === 'course';
                    const courseCoinBalance = getCoinBalance('course');
                    const hasEnoughCoins = canBuyWithCoins && courseCoinBalance >= (course.coin_price || 0);
                    
                    return (
                      <div key={course.id} className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-overflow-hidden tw-transition-all tw-duration-300 hover:tw-scale-105">
                        <div className="tw-relative tw-h-48 tw-group tw-cursor-pointer" onClick={() => handleViewCourse(course.course_string || '')}>
                          <img
                            src={course.imageUrl || getDefaultImage()}
                            alt={course.title}
                            className="tw-w-full tw-h-full tw-object-cover"
                          />
                          <div className="tw-absolute tw-inset-0 tw-bg-black tw-bg-opacity-0 group-hover:tw-bg-opacity-40 tw-transition-all tw-duration-300 tw-flex tw-items-center tw-justify-center">
                            <div className="tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity tw-duration-300 tw-bg-white tw-rounded-full tw-p-3">
                              <Eye className="tw-w-6 tw-h-6 tw-text-purple-600" />
                            </div>
                          </div>
                          {canBuyWithCoins && (
                            <div className="tw-absolute tw-top-4 tw-right-4">
                              <div className="tw-bg-green-500 tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold tw-flex tw-items-center tw-gap-1">
                                <Coins className="tw-w-3 tw-h-3" />
                                {course.coin_price} Koin
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="tw-p-6">
                          <h5 
                            className="tw-font-bold tw-text-lg tw-text-purple-600 tw-mb-2 tw-cursor-pointer hover:tw-text-purple-800"
                            onClick={() => handleViewCourse(course.course_string || '')}
                          >
                            {course.title}
                          </h5>
                          <p className="tw-text-gray-600 tw-text-sm tw-mb-4 tw-line-clamp-3">{course.description}</p>
                          
                          {course.learning_point && course.learning_point.length > 0 && (
                            <div className="tw-mb-4">
                              <div className="tw-space-y-1">
                                {course.learning_point.slice(0, 2).map((point, index) => (
                                  <div key={index} className="tw-flex tw-items-start tw-gap-2 tw-text-sm tw-text-gray-600">
                                    <Star className="tw-w-3 tw-h-3 tw-text-yellow-500 tw-mt-1 tw-flex-shrink-0" />
                                    <span className="tw-line-clamp-1">{point}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="tw-mb-4">
                            {course.is_promo && course.no_promo_price ? (
                              <div>
                                <span className="tw-text-gray-500 tw-text-sm tw-line-through">
                                  {formatPrice(course.no_promo_price)}
                                </span>
                                <div className="tw-text-2xl tw-font-bold tw-text-green-600">
                                  {formatPrice(course.price)}
                                </div>
                              </div>
                            ) : (
                              <div className="tw-text-2xl tw-font-bold tw-text-purple-600">
                                {formatPrice(course.price)}
                              </div>
                            )}
                            
                            {canBuyWithCoins && (
                              <div className="tw-flex tw-items-center tw-justify-between tw-mt-2 tw-pt-2 tw-border-t tw-border-gray-200">
                                <span className="tw-text-sm tw-text-gray-600">Atau dengan Koin:</span>
                                <div className="tw-flex tw-items-center tw-gap-2">
                                  <Coins className="tw-w-4 tw-h-4 tw-text-green-600" />
                                  <span className="tw-text-lg tw-font-bold tw-text-green-600">{course.coin_price}</span>
                                  <span className="tw-text-sm tw-text-gray-500">Koin Kursus</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {isAuthenticated && canBuyWithCoins && (
                            <div className="tw-mb-4 tw-bg-green-50 tw-p-3 tw-rounded-lg tw-border tw-border-green-200">
                              <div className="tw-flex tw-items-center tw-justify-between tw-text-sm">
                                <span className="tw-text-gray-600">Koin Kursus Anda:</span>
                                <div className="tw-flex tw-items-center tw-gap-2">
                                  <Coins className="tw-w-4 tw-h-4 tw-text-green-600" />
                                  <span className={`tw-font-bold ${hasEnoughCoins ? 'tw-text-green-600' : 'tw-text-red-600'}`}>
                                    {coinLoading ? '...' : courseCoinBalance}
                                  </span>
                                </div>
                              </div>
                              {!hasEnoughCoins && canBuyWithCoins && (
                                <div className="tw-text-xs tw-text-red-600 tw-mt-1">
                                  Butuh {(course.coin_price || 0) - courseCoinBalance} koin lagi
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="tw-flex tw-gap-2">
                            <ButtonGradient
                              action="view"
                              onClick={() => handleViewCourse(course.course_string || '')}
                              customText="Lihat Detail"
                              size="sm"
                              className="tw-flex-1"
                              customColors={{
                                gradient1: '#6366F1',
                                gradient2: '#8B5CF6',
                                text: '#FFFFFF'
                              }}
                            />
                            {!isAuthenticated ? (
                              <ButtonGradient
                                action="login"
                                onClick={handleLogin}
                                customText="Masuk"
                                size="sm"
                                className="tw-flex-1"
                              />
                            ) : (
                              <div className="tw-flex tw-flex-col tw-gap-2 tw-flex-1">
                                <ButtonGradient
                                  action="cart"
                                  onClick={() => handleBuyCourse(course.id, course.title)}
                                  customText="Beli"
                                  size="sm"
                                  className="tw-w-full"
                                />
                                {canBuyWithCoins && (
                                  <ButtonGradient
                                    action="custom"
                                    customText={
                                      <div className="tw-flex tw-items-center tw-justify-center tw-gap-1">
                                        <Coins className="tw-w-3 tw-h-3" />
                                        <span>{course.coin_price} Koin</span>
                                      </div>
                                    }
                                    onClick={() => handleBuyWithCoins(course, 'course')}
                                    size="sm"
                                    className="tw-w-full"
                                    disabled={!hasEnoughCoins}
                                    customColors={{
                                      gradient1: hasEnoughCoins ? '#10B981' : '#9CA3AF',
                                      gradient2: hasEnoughCoins ? '#059669' : '#6B7280',
                                      text: '#FFFFFF'
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </AccordionSection>

            {/* 4. Available Classes - FIXED with proper date formatting */}
            <AccordionSection
              title="Kelas yang Tersedia"
              icon={<GraduationCap className="tw-w-6 tw-h-6 tw-text-white" />}
              count={availableClasses.length}
              isOpen={accordions.availableClasses}
              onToggle={() => toggleAccordion('availableClasses')}
              gradient="tw-bg-gradient-to-r tw-from-orange-500 tw-to-red-600"
            >
              {classesLoading ? (
                <div className="tw-flex tw-justify-center tw-items-center tw-py-12">
                  <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-white"></div>
                </div>
              ) : availableClasses.length === 0 ? (
                <div className="tw-text-center tw-py-12 tw-bg-white/10 tw-rounded-2xl">
                  <p className="tw-text-white tw-text-lg">Tidak ada kelas yang tersedia saat ini</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6' 
                  : 'tw-space-y-6'
                }>
                  {availableClasses.map((cls) => {
                    const availableSlots = cls.stock;
                    const enrollmentProgress = ((cls.current_students / cls.max_students) * 100);
                    const canBuyWithCoins = cls.coin_price !== undefined && cls.coin_type === 'class';
                    const classCoinBalance = getCoinBalance('class');
                    const hasEnoughCoins = canBuyWithCoins && classCoinBalance >= (cls.coin_price || 0);
                    
                    return (
                      <div key={cls.id} className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-overflow-hidden tw-transition-all tw-duration-300 hover:tw-scale-105">
                        <div className="tw-relative tw-h-48 tw-bg-gradient-to-br tw-from-orange-400 tw-to-pink-500 tw-flex tw-items-center tw-justify-center">
                          <GraduationCap className="tw-w-16 tw-h-16 tw-text-white" />
                          {canBuyWithCoins && (
                            <div className="tw-absolute tw-top-4 tw-right-4">
                              <div className="tw-bg-blue-500 tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold tw-flex tw-items-center tw-gap-1">
                                <Coins className="tw-w-3 tw-h-3" />
                                {cls.coin_price} Koin
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="tw-p-6">
                          <h5 className="tw-font-bold tw-text-lg tw-text-orange-600 tw-mb-2">{cls.name}</h5>
                          <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3 tw-text-sm tw-text-gray-600">
                            <User className="tw-w-4 tw-h-4" />
                            <span>{cls.teacher_name}</span>
                          </div>
                          <p className="tw-text-gray-600 tw-text-sm tw-mb-4 tw-line-clamp-2">{cls.description}</p>
                          
                          <div className="tw-bg-gray-50 tw-rounded-lg tw-p-3 tw-mb-4">
                            <div className="tw-text-xs tw-text-gray-600 tw-space-y-1">
                              <div>Mulai: {formatDateTime(cls.start_date)}</div>
                              <div>Selesai: {formatDateTime(cls.end_date)}</div>
                            </div>
                          </div>

                          <div className="tw-mb-4">
                            <div className="tw-flex tw-justify-between tw-text-sm tw-mb-2">
                              <span className="tw-text-gray-700">Pendaftar</span>
                              <span className="tw-font-bold tw-text-orange-600">
                                {cls.current_students}/{cls.max_students}
                              </span>
                            </div>
                            <div className="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2">
                              <div 
                                className="tw-bg-gradient-to-r tw-from-orange-400 tw-to-red-500 tw-h-2 tw-rounded-full"
                                style={{ width: `${Math.min(enrollmentProgress, 100)}%` }}
                              ></div>
                            </div>
                            <div className="tw-text-xs tw-text-gray-500 tw-mt-1">
                              {availableSlots > 0 ? `${availableSlots} slot tersisa` : 'Kelas penuh'}
                            </div>
                          </div>

                          <div className="tw-mb-4">
                            {cls.is_promo && cls.no_promo_price ? (
                              <div>
                                <span className="tw-text-gray-500 tw-text-sm tw-line-through">
                                  {formatPrice(cls.no_promo_price)}
                                </span>
                                <div className="tw-text-2xl tw-font-bold tw-text-green-600">
                                  {formatPrice(cls.price)}
                                </div>
                              </div>
                            ) : (
                              <div className="tw-text-2xl tw-font-bold tw-text-orange-600">
                                {formatPrice(cls.price)}
                              </div>
                            )}
                            
                            {canBuyWithCoins && (
                              <div className="tw-flex tw-items-center tw-justify-between tw-mt-2 tw-pt-2 tw-border-t tw-border-gray-200">
                                <span className="tw-text-sm tw-text-gray-600">Atau dengan Koin:</span>
                                <div className="tw-flex tw-items-center tw-gap-2">
                                  <Coins className="tw-w-4 tw-h-4 tw-text-blue-600" />
                                  <span className="tw-text-lg tw-font-bold tw-text-blue-600">{cls.coin_price}</span>
                                  <span className="tw-text-sm tw-text-gray-500">Koin Kelas</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {isAuthenticated && canBuyWithCoins && (
                            <div className="tw-mb-4 tw-bg-blue-50 tw-p-3 tw-rounded-lg tw-border tw-border-blue-200">
                              <div className="tw-flex tw-items-center tw-justify-between tw-text-sm">
                                <span className="tw-text-gray-600">Koin Kelas Anda:</span>
                                <div className="tw-flex tw-items-center tw-gap-2">
                                  <Coins className="tw-w-4 tw-h-4 tw-text-blue-600" />
                                  <span className={`tw-font-bold ${hasEnoughCoins ? 'tw-text-green-600' : 'tw-text-red-600'}`}>
                                    {coinLoading ? '...' : classCoinBalance}
                                  </span>
                                </div>
                              </div>
                              {!hasEnoughCoins && canBuyWithCoins && (
                                <div className="tw-text-xs tw-text-red-600 tw-mt-1">
                                  Butuh {(cls.coin_price || 0) - classCoinBalance} koin lagi
                                </div>
                              )}
                            </div>
                          )}
                          
                          {!isAuthenticated ? (
                            <ButtonGradient
                              action="login"
                              onClick={handleLogin}
                              customText="Masuk untuk Daftar"
                              size="sm"
                              className="tw-w-full"
                            />
                          ) : availableSlots <= 0 ? (
                            <div className="tw-w-full tw-py-3 tw-px-4 tw-rounded-xl tw-bg-gray-200 tw-text-gray-500 tw-text-center tw-font-bold">
                              Kelas Penuh
                            </div>
                          ) : (
                            <div className="tw-space-y-2">
                              <ButtonGradient
                                action="cart"
                                onClick={() => handleBuyClass(cls.id, cls.name)}
                                customText="Daftar Kelas"
                                size="sm"
                                className="tw-w-full"
                                customColors={{
                                  gradient1: '#F97316',
                                  gradient2: '#DC2626',
                                  text: '#FFFFFF'
                                }}
                              />
                              {canBuyWithCoins && (
                                <ButtonGradient
                                  action="custom"
                                  customText={
                                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                                      <Coins className="tw-w-4 tw-h-4" />
                                      <span>Daftar dengan {cls.coin_price} Koin</span>
                                    </div>
                                  }
                                  onClick={() => handleBuyWithCoins(cls, 'class')}
                                  size="sm"
                                  className="tw-w-full"
                                  disabled={!hasEnoughCoins}
                                  customColors={{
                                    gradient1: hasEnoughCoins ? '#3B82F6' : '#9CA3AF',
                                    gradient2: hasEnoughCoins ? '#1D4ED8' : '#6B7280',
                                    text: '#FFFFFF'
                                  }}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </AccordionSection>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .tw-animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

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