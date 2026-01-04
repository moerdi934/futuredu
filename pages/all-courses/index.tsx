// pages/all-courses/index.tsx - Modular Component Structure
import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, GraduationCap, Search, Grid, List, Quote, Coins
} from 'lucide-react';
import NavigationBar from '../../components/layout/NavigationBar';
import GoToCartFloater from '../../components/floater/GoToCartFloater';
import CoursePurchaseModal from './CoursePurchaseModal';
// import ClassPurchaseModal from './ClassPurchaseModal'; // TODO: Uncomment when class feature is ready
import CoinPurchaseModal from '../../components/modals/CoinPurchaseModal';
// import StudentAttendanceModal from '../panel/courses/classes-page/StudentAttendanceModal'; // TODO: Uncomment when class feature is ready

// Import separated components
import AccordionSection from './AccordionSection';
import CourseSection from './CourseSection';
// import ClassSection from './ClassSection'; // TODO: Uncomment when class feature is ready

// Import types
import type { 
  LiveCourse, 
  // LiveClass, // TODO: Uncomment when class feature is ready
  // EnrolledClass, // TODO: Uncomment when class feature is ready
  UserCourseProgress, 
  CoinBalance, 
  QuoteType 
} from './types';

interface CoursePageProps {
  initialQuote: QuoteType;
}

const CoursePage: React.FC<CoursePageProps> = ({ initialQuote }) => {
  const router = useRouter();
  const { isAuthenticated, id: userId } = useAuth();
  
  // State
  const [liveCourses, setLiveCourses] = useState<LiveCourse[]>([]);
  // const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]); // TODO: Uncomment when class feature is ready
  // const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([]); // TODO: Uncomment when class feature is ready
  const [filteredCourses, setFilteredCourses] = useState<LiveCourse[]>([]);
  // const [filteredClasses, setFilteredClasses] = useState<LiveClass[]>([]); // TODO: Uncomment when class feature is ready
  const [currentQuote] = useState<QuoteType>(initialQuote);
  const [loading, setLoading] = useState(false);
  // const [classesLoading, setClassesLoading] = useState(false); // TODO: Uncomment when class feature is ready
  // const [enrolledClassesLoading, setEnrolledClassesLoading] = useState(false); // TODO: Uncomment when class feature is ready
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
  // const [showClassModal, setShowClassModal] = useState(false); // TODO: Uncomment when class feature is ready
  // const [showAttendanceModal, setShowAttendanceModal] = useState(false); // TODO: Uncomment when class feature is ready
  const [selectedCourse, setSelectedCourse] = useState<{ id: number; name: string } | null>(null);
  // const [selectedClass, setSelectedClass] = useState<{ id: number; name: string } | null>(null); // TODO: Uncomment when class feature is ready
  // const [selectedAttendanceClass, setSelectedAttendanceClass] = useState<EnrolledClass | null>(null); // TODO: Uncomment when class feature is ready
  
  // Coin system states
  const [coinBalances, setCoinBalances] = useState<CoinBalance[]>([]);
  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const [selectedCoinItem, setSelectedCoinItem] = useState<{ product_id: number; name: string; coin_type: 'class' | 'course'; coin_price: number } | null>(null);
  const [coinLoading, setCoinLoading] = useState(false);
  
  // Accordion states
  const [accordions, setAccordions] = useState({
    // yourClasses: true, // TODO: Uncomment when class feature is ready
    yourCourses: true,
    // availableClasses: false, // TODO: Uncomment when class feature is ready
    availableCourses: false,
  });

  const toggleAccordion = (key: keyof typeof accordions) => {
    setAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // TODO: Uncomment when class feature is ready
  // FIXED: Fetch enrolled classes using the /classes API endpoint
  // const fetchEnrolledClasses = async () => {
  //   if (!isAuthenticated || !userId) return;
  //   
  //   try {
  //     setEnrolledClassesLoading(true);
  //     const token = localStorage.getItem('authToken');
  //     if (!token) return;

  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_API_URL}/classes`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         params: {
  //           page: 1,
  //           limit: 100,
  //           studentId: userId,
  //           includeDeleted: 'false',
  //           approvalStatus: 'approved'
  //         }
  //       }
  //     );

  //     if (response.data && response.data.data) {
  //       const activeClasses = response.data.data
  //         .filter((cls: any) => !cls.real_end_datetime)
  //         .map((cls: any): EnrolledClass => ({
  //           id: cls.id,
  //           name: cls.name,
  //           description: cls.description,
  //           teacher_name: cls.teacher_name,
  //           teacher_id: cls.teacher_id,
  //           course_name: cls.course_name,
  //           course_id: cls.course_id,
  //           start_date: cls.real_start_datetime || cls.start_time || cls.date,
  //           end_date: cls.real_end_datetime || cls.end_time || cls.date,
  //           real_start_datetime: cls.real_start_datetime,
  //           real_end_datetime: cls.real_end_datetime,
  //           class_mode: cls.class_mode || 'offline',
  //           meeting_url: cls.meeting_url,
  //           status: cls.status,
  //           create_date: cls.create_date
  //         }));

  //       setEnrolledClasses(activeClasses);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching enrolled classes:', error);
  //     setEnrolledClasses([]);
  //   } finally {
  //     setEnrolledClassesLoading(false);
  //   }
  // };

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
    // fetchLiveClasses(); // TODO: Uncomment when class feature is ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchUserProgress();
      fetchPurchasedCourses();
      fetchCoinBalances();
      // fetchEnrolledClasses(); // TODO: Uncomment when class feature is ready
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // TODO: Uncomment when class feature is ready
  // useEffect(() => {
  //   let filtered = liveClasses;
  //   if (searchTerm) {
  //     filtered = filtered.filter(cls =>
  //       cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       cls.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       cls.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       cls.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //   }
  //   setFilteredClasses(filtered);
  // }, [liveClasses, searchTerm]);

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

  // TODO: Uncomment when class feature is ready
  // const fetchLiveClasses = async () => {
  //   setClassesLoading(true);
  //   try {
  //     const params = new URLSearchParams({
  //       page: '1',
  //       limit: '100',
  //       sortBy: sortBy,
  //       classtype: 'all'
  //     });
  //     const response = await fetch(`/api/classes/live?${params.toString()}`);
  //     const data = await response.json();
  //     if (data.success) {
  //       setLiveClasses(data.data.classes);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching live classes:', error);
  //   } finally {
  //     setClassesLoading(false);
  //   }
  // };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // TODO: Uncomment when class feature is ready
  // const handleBuyClass = (classId: number, className: string) => {
  //   if (!isAuthenticated) {
  //     router.push('/login');
  //     return;
  //   }
  //   setSelectedClass({ id: classId, name: className });
  //   setShowClassModal(true);
  // };

  // const handleAttendance = (enrolledClass: EnrolledClass) => {
  //   setSelectedAttendanceClass(enrolledClass);
  //   setShowAttendanceModal(true);
  // };

  const handleBuyWithCoins = (item: LiveCourse, type: 'course') => {
    if (!isAuthenticated) {
      alert('Silakan login terlebih dahulu untuk membeli dengan koin');
      router.push('/login');
      return;
    }

    setSelectedCoinItem({
      product_id: item.product_id,
      name: item.title,
      coin_type: type,
      coin_price: item.coin_price || 0
    });
    setCoinModalOpen(true);
  };

  // TODO: Uncomment when class feature is ready
  // const handleBuyWithCoins = (item: LiveCourse | LiveClass, type: 'course' | 'class') => {
  //   if (!isAuthenticated) {
  //     alert('Silakan login terlebih dahulu untuk membeli dengan koin');
  //     router.push('/login');
  //     return;
  //   }

  //   setSelectedCoinItem({
  //     product_id: item.product_id,
  //     name: 'title' in item ? item.title : item.name,
  //     coin_type: type,
  //     coin_price: item.coin_price || 0
  //   });
  //   setCoinModalOpen(true);
  // };

  const handleCoinPurchaseSuccess = (entitlements: string[]) => {
    alert(`Pembelian berhasil! ${entitlements.join(', ')} telah ditambahkan ke akun Anda.`);
    window.location.reload();
  };

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

  // TODO: Uncomment when class feature is ready
  // const formatDateTime = (dateString: string) => {
  //   if (!dateString) return 'Belum ditentukan';
  //   
  //   try {
  //     const date = new Date(dateString);
  //     if (isNaN(date.getTime())) return 'Tanggal tidak valid';
  //     
  //     return date.toLocaleString('id-ID', {
  //       year: 'numeric',
  //       month: 'short',
  //       day: 'numeric',
  //       hour: '2-digit',
  //       minute: '2-digit'
  //     });
  //   } catch (error) {
  //     console.error('Error formatting date:', error);
  //     return 'Tanggal tidak valid';
  //   }
  // };

  // TODO: Uncomment when class feature is ready
  // const formatClassStatus = (status: string) => {
  //   const statusConfig: Record<string, { color: string; icon: React.ReactElement; label: string }> = {
  //     'Not Start': { 
  //       color: 'tw-bg-gray-100 tw-text-gray-800', 
  //       icon: <Clock className="tw-w-3 tw-h-3" />,
  //       label: 'Belum Dimulai'
  //     },
  //     'Started': { 
  //       color: 'tw-bg-green-100 tw-text-green-800', 
  //       icon: <div className="tw-w-2 tw-h-2 tw-bg-green-500 tw-rounded-full tw-animate-pulse"></div>,
  //       label: 'Sedang Berlangsung'
  //     },
  //     'Finished': { 
  //       color: 'tw-bg-blue-100 tw-text-blue-800', 
  //       icon: <div className="tw-w-2 tw-h-2 tw-bg-blue-500 tw-rounded-full"></div>,
  //       label: 'Selesai'
  //     }
  //   };

  //   const config = statusConfig[status] || statusConfig['Not Start'];
  //   
  //   return (
  //     <span className={`tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-flex tw-items-center tw-gap-1 ${config.color}`}>
  //       {config.icon}
  //       {config.label}
  //     </span>
  //   );
  // };

  const getDefaultImage = () => {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
  };

  // TODO: Uncomment when class feature is ready
  // const enrolledClassIds = new Set(enrolledClasses.map(cls => cls.id));
  // const availableClasses = filteredClasses.filter(cls => !enrolledClassIds.has(cls.id));
  const availableCourses = filteredCourses.filter(course => !purchasedCourses.has(course.id));

  return (
    <div className="tw-min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <NavigationBar />
      <Head>
        <title>Kursus Online - Platform Pembelajaran</title>
        <meta name="description" content="Jelajahi koleksi kursus online menarik untuk tingkatkan skill-mu" />
      </Head>

      <GoToCartFloater
        show={showFloater}
        onHide={() => setShowFloater(false)}
        itemName={floaterItemName}
      />

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

      {/* TODO: Uncomment when class feature is ready */}
      {/* {selectedClass && (
        <ClassPurchaseModal
          show={showClassModal}
          onHide={() => setShowClassModal(false)}
          classId={selectedClass.id}
          className={selectedClass.name}
          onAddToCart={handleAddToCart}
          onSuccess={handlePurchaseSuccess}
        />
      )} */}

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

      {/* TODO: Uncomment when class feature is ready */}
      {/* {selectedAttendanceClass && (
        <StudentAttendanceModal
          show={showAttendanceModal}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedAttendanceClass(null);
          }}
          classData={selectedAttendanceClass}
        />
      )} */}

      <div className="tw-relative tw-overflow-hidden tw-pb-12">
        <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-violet-600/20 tw-to-purple-800/20"></div>
        
        <div className="tw-container tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-py-12 tw-relative tw-z-10 tw-max-w-7xl">
          <div className="tw-text-center tw-mb-12">
            <div className="tw-mb-8">
              <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-20 tw-h-20 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-mb-6 tw-shadow-lg">
                <GraduationCap className="tw-w-10 tw-h-10 tw-text-yellow-300" />
              </div>
              <h1 className="tw-text-4xl md:tw-text-5xl lg:tw-text-6xl tw-font-bold tw-text-white tw-mb-4 tw-drop-shadow-lg">
                Kursus Online
              </h1>
              <p className="tw-text-lg md:tw-text-xl tw-text-white/90 tw-font-medium tw-drop-shadow tw-max-w-3xl tw-mx-auto">
                Jelajahi koleksi kursus online menarik untuk tingkatkan skill-mu dengan pembelajaran yang interaktif!
              </p>
            </div>
          </div>

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
                  &ldquo;{currentQuote.text}&rdquo;
                </p>
                <p className="tw-text-white/80 tw-text-base tw-font-semibold">
                  — {currentQuote.author}
                </p>
              </div>
            </div>
          </div>

          {isAuthenticated && (
            <div className="tw-max-w-6xl tw-mx-auto tw-mb-8">
              <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20">
                <div className="tw-grid tw-grid-cols-1 tw-gap-6">
                  {/* TODO: Uncomment when class feature is ready */}
                  {/* <div className="tw-flex tw-items-center tw-justify-between">
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
                  </div> */}
                  
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

          <div className="tw-max-w-6xl tw-mx-auto tw-space-y-6">
            {isAuthenticated && userProgress.length > 0 && (
              <AccordionSection
                title="Kursus Kamu"
                icon={<BookOpen className="tw-w-6 tw-h-6 tw-text-white" />}
                count={userProgress.length}
                isOpen={accordions.yourCourses}
                onToggle={() => toggleAccordion('yourCourses')}
                gradient="tw-bg-gradient-to-r tw-from-blue-500 tw-to-cyan-600"
              >
                <CourseSection
                  userProgress={userProgress}
                  progressLoading={progressLoading}
                  availableCourses={[]}
                  loading={false}
                  viewMode={viewMode}
                  isAuthenticated={isAuthenticated}
                  coinLoading={coinLoading}
                  getCoinBalance={getCoinBalance}
                  handleStartLearning={handleStartLearning}
                  handleViewCourse={handleViewCourse}
                  handleLogin={handleLogin}
                  handleBuyCourse={handleBuyCourse}
                  handleBuyWithCoins={handleBuyWithCoins}
                  formatPrice={formatPrice}
                  getDefaultImage={getDefaultImage}
                />
              </AccordionSection>
            )}

            {/* TODO: Uncomment when class feature is ready */}
            {/* {isAuthenticated && enrolledClasses.length > 0 && (
              <AccordionSection
                title="Kelas Kamu"
                icon={<GraduationCap className="tw-w-6 tw-h-6 tw-text-white" />}
                count={enrolledClasses.length}
                isOpen={accordions.yourClasses}
                onToggle={() => toggleAccordion('yourClasses')}
                gradient="tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-600"
              >
                <ClassSection
                  enrolledClasses={enrolledClasses}
                  enrolledClassesLoading={enrolledClassesLoading}
                  availableClasses={[]}
                  classesLoading={false}
                  viewMode={viewMode}
                  isAuthenticated={isAuthenticated}
                  coinLoading={coinLoading}
                  getCoinBalance={getCoinBalance}
                  handleLogin={handleLogin}
                  handleBuyClass={handleBuyClass}
                  handleAttendance={handleAttendance}
                  handleBuyWithCoins={handleBuyWithCoins}
                  formatPrice={formatPrice}
                  formatDateTime={formatDateTime}
                  formatClassStatus={formatClassStatus}
                />
              </AccordionSection>
            )} */}

            <AccordionSection
              title="Kursus yang Tersedia"
              icon={<BookOpen className="tw-w-6 tw-h-6 tw-text-white" />}
              count={availableCourses.length}
              isOpen={accordions.availableCourses}
              onToggle={() => toggleAccordion('availableCourses')}
              gradient="tw-bg-gradient-to-r tw-from-purple-500 tw-to-violet-600"
            >
              <CourseSection
                userProgress={[]}
                progressLoading={false}
                availableCourses={availableCourses}
                loading={loading}
                viewMode={viewMode}
                isAuthenticated={isAuthenticated}
                coinLoading={coinLoading}
                getCoinBalance={getCoinBalance}
                handleStartLearning={handleStartLearning}
                handleViewCourse={handleViewCourse}
                handleLogin={handleLogin}
                handleBuyCourse={handleBuyCourse}
                handleBuyWithCoins={handleBuyWithCoins}
                formatPrice={formatPrice}
                getDefaultImage={getDefaultImage}
              />
            </AccordionSection>

            {/* TODO: Uncomment when class feature is ready */}
            {/* <AccordionSection
              title="Kelas yang Tersedia"
              icon={<GraduationCap className="tw-w-6 tw-h-6 tw-text-white" />}
              count={availableClasses.length}
              isOpen={accordions.availableClasses}
              onToggle={() => toggleAccordion('availableClasses')}
              gradient="tw-bg-gradient-to-r tw-from-orange-500 tw-to-red-600"
            >
              <ClassSection
                enrolledClasses={[]}
                enrolledClassesLoading={false}
                availableClasses={availableClasses}
                classesLoading={classesLoading}
                viewMode={viewMode}
                isAuthenticated={isAuthenticated}
                coinLoading={coinLoading}
                getCoinBalance={getCoinBalance}
                handleLogin={handleLogin}
                handleBuyClass={handleBuyClass}
                handleAttendance={handleAttendance}
                handleBuyWithCoins={handleBuyWithCoins}
                formatPrice={formatPrice}
                formatDateTime={formatDateTime}
                formatClassStatus={formatClassStatus}
              />
            </AccordionSection> */}
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
