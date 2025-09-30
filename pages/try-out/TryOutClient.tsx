// pages/exam/TryOutClient.tsx - Updated with Floater Integration
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Card, Accordion, Spinner, Badge } from 'react-bootstrap';
import {
  BookOpen, Clock, Star, Zap, Target, Trophy, Gift, 
  ShoppingCart, Play, Calendar, Check, AlertCircle,
  Award, ChevronDown, ChevronUp, Unlock, Lock
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import ExamModal from './ExamModal';
import ExamScoreModal from './ExamScoreModal';
import TryOutPurchaseModal from './TryOutPurchaseModal';
import GoToCartFloater from '../../components/floater/GoToCartFloater'; // NEW
import { ButtonGradient } from '../../components/button/ButtonTemplate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

/* ---------- types ---------- */
interface ExamSchedule {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  exam_type: string;
  isfree: boolean;
  is_valid: boolean;
  approval_status: string;
  create_date: string;
  description?: string;
  price?: number;
  original_price?: number;
  is_promo?: boolean;
  promo_description?: string;
  is_live?: boolean;
}

interface UserEntitlement {
  id: number;
  exam_schedule_id: number;
  granted_at: string;
  expires_at?: string;
  exam_schedule: ExamSchedule;
}

interface UserExamScore {
  exam_schedule_id: number;
  total_score: number | string;
  average_score: number | string;
  total_correct: number | string;
  total_questions: number | string;
  completion_time: string;
  has_completed: boolean;
}

interface GroupedSchedules {
  [examType: string]: {
    free: ExamSchedule[];
    paid: ExamSchedule[];
  };
}

interface Props { 
  initialSchedules?: ExamSchedule[] | null;
}

export default function TryOutClient({ initialSchedules = null }: Props) {
  const { username, isAuthenticated, id: userId } = useAuth();
  const router = useRouter();

  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [userEntitlements, setUserEntitlements] = useState<UserEntitlement[]>([]);
  const [userScores, setUserScores] = useState<Record<number, UserExamScore>>({});
  const [groupedSchedules, setGroupedSchedules] = useState<GroupedSchedules>({});
  const [completedSchedules, setCompletedSchedules] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [entitlementsLoading, setEntitlementsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);
  const [selId, setSelId] = useState<number|null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllOwned, setShowAllOwned] = useState(false);
  
  // NEW: Floater states
  const [showFloater, setShowFloater] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  
  const MAX_INITIAL_OWNED = 6;

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get<{success: boolean; data: ExamSchedule[]}>(
        `${apiUrl}/exam-schedules/public`,
        {
          params: {
            includeDeleted: 'false',
            approvalStatus: 'approved',
            is_valid: 'true',
            _t: Date.now()
          },
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
          timeout: 10000,
        }
      );
      
      if (response.data?.success && response.data?.data && Array.isArray(response.data.data)) {
        setSchedules(response.data.data);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEntitlements = async () => {
    if (!isAuthenticated || !userId) return;
    
    try {
      setEntitlementsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get<UserEntitlement[]>(
        `${apiUrl}/user-entitlements/exam-schedules`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
          params: { _t: Date.now() }
        }
      );

      setUserEntitlements(response.data || []);
    } catch (error) {
      console.error('Error fetching user entitlements:', error);
      setUserEntitlements([]);
    } finally {
      setEntitlementsLoading(false);
    }
  };

  const fetchUserScores = async () => {
    if (!isAuthenticated || !userId) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(
        `${apiUrl}/user-exam-scores/by-schedule`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
          params: { _t: Date.now() }
        }
      );

      const scoresMap: Record<number, UserExamScore> = {};
      if (Array.isArray(response.data)) {
        response.data.forEach((score: UserExamScore) => {
          scoresMap[score.exam_schedule_id] = score;
        });
      }
      
      console.log('Fetched user scores:', scoresMap);
      console.log('Total completed exams:', Object.values(scoresMap).filter(s => s.has_completed).length);
      setUserScores(scoresMap);

      // Fetch schedules for completed exams
      const completedExamIds = Object.entries(scoresMap)
        .filter(([_, score]) => score.has_completed)
        .map(([id, _]) => parseInt(id));

      if (completedExamIds.length > 0) {
        await fetchCompletedSchedules(completedExamIds, token);
      }
    } catch (error) {
      console.error('Error fetching user scores:', error);
      setUserScores({});
    }
  };

  const fetchCompletedSchedules = async (examScheduleIds: number[], token: string) => {
    try {
      // Fetch all schedules
      const schedulePromises = examScheduleIds.map(id => 
        axios.get(`${apiUrl}/exam-schedules/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          console.error(`Failed to fetch schedule ${id}:`, err);
          return null;
        })
      );

      const results = await Promise.all(schedulePromises);
      const validSchedules = results
        .filter(res => res !== null && res.data)
        .map(res => res!.data);

      console.log('Fetched completed schedules:', validSchedules.length);
      setCompletedSchedules(validSchedules);
    } catch (error) {
      console.error('Error fetching completed schedules:', error);
      setCompletedSchedules([]);
    }
  };

  const groupSchedulesByType = (schedulesData: ExamSchedule[]) => {
    const grouped: GroupedSchedules = {};
    
    schedulesData.forEach(schedule => {
      const examType = schedule.exam_type || 'Unknown';
      
      if (!grouped[examType]) {
        grouped[examType] = { free: [], paid: [] };
      }
      
      if (schedule.isfree) {
        grouped[examType].free.push(schedule);
      } else {
        grouped[examType].paid.push(schedule);
      }
    });

    Object.values(grouped).forEach(group => {
      group.free.sort((a, b) => new Date(b.create_date).getTime() - new Date(a.create_date).getTime());
      group.paid.sort((a, b) => new Date(b.create_date).getTime() - new Date(a.create_date).getTime());
    });

    setGroupedSchedules(grouped);
  };

  useEffect(() => {
    if (initialSchedules && Array.isArray(initialSchedules) && initialSchedules.length > 0) {
      setSchedules(initialSchedules);
      groupSchedulesByType(initialSchedules);
      setLoading(false);
    } else {
      fetchSchedules();
    }
  }, []);

  useEffect(() => {
    if (schedules.length > 0) {
      groupSchedulesByType(schedules);
    }
  }, [schedules]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserEntitlements();
      fetchUserScores();
    }
  }, [isAuthenticated, userId]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscountPercentage = (originalPrice: number, currentPrice: number): number => {
    if (originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const formatTimeDisplay = (timeString: string | undefined): JSX.Element => {
    if (!timeString) return (
      <span className="tw-flex tw-items-center tw-text-violet-600 tw-font-medium">
        <Zap className="tw-w-4 tw-h-4 tw-mr-1" />
        Anytime
      </span>
    );
    
    const timeDate = new Date(timeString);
    if (isNaN(timeDate.getTime()) || timeDate.getFullYear() < 2000) {
      return (
        <span className="tw-flex tw-items-center">
          <span className="tw-text-violet-600 tw-font-semibold tw-flex tw-items-center">
            <Zap className="tw-w-4 tw-h-4 tw-mr-1" />
            Anytime
          </span>
          <span className="tw-inline-block tw-ml-2 tw-w-3 tw-h-3 tw-bg-violet-500 tw-rounded-full tw-animate-pulse"></span>
        </span>
      );
    }
    
    const now = new Date();
    const isPast = timeDate < now;
    const isFuture = timeDate > now;
    let className = "tw-font-medium tw-flex tw-items-center";
    if (isPast) className += " tw-text-red-500 tw-line-through";
    if (isFuture) className += " tw-text-green-600";
    
    return (
      <span className={className}>
        <Clock className="tw-w-4 tw-h-4 tw-mr-1" />
        {timeDate.toLocaleString('id-ID', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </span>
    );
  };

  const isUserEntitled = (examScheduleId: number): boolean => {
    const entitlement = userEntitlements.find(e => e.exam_schedule_id === examScheduleId);
    if (!entitlement) return false;
    
    if (!entitlement.expires_at) return true;
    
    const expiryDate = new Date(entitlement.expires_at);
    return expiryDate > new Date();
  };

  const hasCompletedExam = (examScheduleId: number): boolean => {
    return userScores[examScheduleId]?.has_completed || false;
  };

  const getExamScore = (examScheduleId: number): UserExamScore | null => {
    return userScores[examScheduleId] || null;
  };

  const handleStart = (id: number) => {
    if (!username) { 
      router.push('/login'); 
      return; 
    }
    setSelId(id);
    setModalOpen(true);
  };

  const handleViewScore = (scheduleId: number, scheduleName: string) => {
    setSelId(scheduleId);
    setSelectedSchedule({ id: scheduleId, name: scheduleName } as ExamSchedule);
    setScoreModalOpen(true);
  };

  const handleBuyTryOut = (schedule: ExamSchedule) => {
    if (!isAuthenticated) {
      alert('Silakan login terlebih dahulu untuk membeli try-out');
      router.push('/login');
      return;
    }

    setSelectedSchedule(schedule);
    setPurchaseModalOpen(true);
  };

  // UPDATED: No alert, just return success/error
  const handleAddToCartFromModal = async (productId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      
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
        // Success - will be handled by onSuccess callback
        return;
      } else {
        alert('Gagal menambahkan ke keranjang: ' + response.data.message);
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Add to cart error:', error);
      alert('Gagal menambahkan ke keranjang: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
      throw error;
    }
  };

  // NEW: Handle success callback dari modal
  const handleAddToCartSuccess = (itemName: string) => {
    setAddedItemName(itemName);
    setShowFloater(true);
    
    // Refresh entitlements in case user got access
    if (isAuthenticated) {
      fetchUserEntitlements();
    }
  };

  const handleRetry = () => {
    fetchSchedules();
  };

  const renderScheduleCard = (schedule: ExamSchedule, index: number, isFree: boolean, isOwned: boolean = false) => {
    const isEntitled = isUserEntitled(schedule.id);
    const hasCompleted = hasCompletedExam(schedule.id);
    const examScore = getExamScore(schedule.id);
    const canStart = (isFree || isEntitled) && !hasCompleted;
    const hasValidPrice = schedule.is_live && schedule.price !== undefined && schedule.price > 0;
    const discountPercentage = schedule.original_price && schedule.price 
      ? calculateDiscountPercentage(schedule.original_price, schedule.price) 
      : 0;

    return (
      <Card key={schedule.id} className="tw-border-0 tw-shadow-lg tw-transition-all tw-duration-300 tw-hover:shadow-2xl tw-hover:scale-105 tw-bg-white tw-relative">
        <Card.Body className="tw-p-6">
          {/* Status badges */}
          <div className="tw-absolute tw-top-4 tw-right-4 tw-flex tw-flex-col tw-gap-2">
            {isFree && !isOwned && (
              <Badge className="tw-bg-green-500 tw-text-white tw-flex tw-items-center tw-gap-1 tw-px-3 tw-py-1">
                <Gift className="tw-w-3 tw-h-3" />
                GRATIS
              </Badge>
            )}
            {hasCompleted && (
              <Badge className="tw-bg-purple-500 tw-text-white tw-flex tw-items-center tw-gap-1 tw-px-3 tw-py-1">
                <Award className="tw-w-3 tw-h-3" />
                Selesai
              </Badge>
            )}
            {schedule.is_promo && discountPercentage > 0 && !isOwned && (
              <Badge className="tw-bg-red-500 tw-text-white tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
            <div className={`tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-sm
                           ${isFree ? 'tw-bg-green-500' : index % 3 === 0 ? 'tw-bg-violet-500' : index % 3 === 1 ? 'tw-bg-purple-500' : 'tw-bg-indigo-500'}`}>
              {index + 1}
            </div>
            <Star className="tw-w-5 tw-h-5 tw-text-yellow-500" />
          </div>
          
          <h5 className={`tw-font-bold tw-mb-4 tw-text-lg ${isFree ? 'tw-text-green-700' : 'tw-text-violet-800'}`}>
            {schedule.name}
          </h5>

          {/* Score Display for Completed Exams */}
          {hasCompleted && examScore && (
            <div className="tw-mb-4 tw-bg-gradient-to-r tw-from-purple-50 tw-to-pink-50 tw-p-4 tw-rounded-lg tw-border-2 tw-border-purple-200">
              <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3">
                <Award className="tw-w-6 tw-h-6 tw-text-purple-600" />
                <h6 className="tw-text-lg tw-font-bold tw-text-purple-800 tw-mb-0">Hasil Try Out Anda</h6>
              </div>
              <div className="tw-space-y-2">
                <div className="tw-flex tw-justify-between tw-items-center">
                  <span className="tw-text-sm tw-text-gray-600">Skor Total:</span>
                  <span className="tw-text-2xl tw-font-bold tw-text-purple-600">
                    {typeof examScore.total_score === 'number' 
                      ? examScore.total_score 
                      : parseFloat(examScore.total_score || '0')}
                  </span>
                </div>
                <div className="tw-flex tw-justify-between tw-items-center">
                  <span className="tw-text-sm tw-text-gray-600">Rata-rata:</span>
                  <span className="tw-text-lg tw-font-semibold tw-text-purple-600">
                    {typeof examScore.average_score === 'number' 
                      ? examScore.average_score.toFixed(2) 
                      : parseFloat(examScore.average_score || '0').toFixed(2)}
                  </span>
                </div>
                <div className="tw-flex tw-justify-between tw-items-center">
                  <span className="tw-text-sm tw-text-gray-600">Benar:</span>
                  <span className="tw-text-sm tw-font-medium tw-text-green-600">
                    {typeof examScore.total_correct === 'number' 
                      ? examScore.total_correct 
                      : parseInt(examScore.total_correct || '0')}/
                    {typeof examScore.total_questions === 'number' 
                      ? examScore.total_questions 
                      : parseInt(examScore.total_questions || '0')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Information - Only show if not completed and not owned */}
          {!hasCompleted && !isFree && !isOwned && (
            <div className="tw-mb-4 tw-bg-gradient-to-r tw-from-purple-50 tw-to-pink-50 tw-p-4 tw-rounded-lg tw-border tw-border-purple-100">
              {!schedule.is_live ? (
                <div className="tw-text-center">
                  <p className="tw-text-sm tw-text-gray-600 tw-mb-1">Status:</p>
                  <Badge className="tw-bg-orange-100 tw-text-orange-800 tw-px-3 tw-py-1">
                    Belum Tersedia untuk Pembelian
                  </Badge>
                </div>
              ) : hasValidPrice ? (
                <div>
                  <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                    <span className="tw-text-sm tw-font-medium tw-text-gray-600">Harga:</span>
                    <div className="tw-text-right">
                      <div className="tw-text-lg tw-font-bold tw-text-purple-600">
                        {formatPrice(schedule.price!)}
                      </div>
                      {schedule.is_promo && schedule.original_price && schedule.original_price > schedule.price! && (
                        <div className="tw-text-sm tw-text-gray-500 tw-line-through">
                          {formatPrice(schedule.original_price)}
                        </div>
                      )}
                    </div>
                  </div>
                  {schedule.is_promo && schedule.promo_description && (
                    <div className="tw-text-xs tw-text-red-600 tw-bg-red-50 tw-px-2 tw-py-1 tw-rounded">
                      🔥 {schedule.promo_description}
                    </div>
                  )}
                </div>
              ) : (
                <div className="tw-text-center">
                  <p className="tw-text-sm tw-text-gray-600">Hubungi admin untuk info harga</p>
                </div>
              )}
            </div>
          )}
          
          {/* Time display - Only show if not completed */}
          {!hasCompleted && (
            <div className="tw-space-y-3 tw-mb-6">
              <div className="tw-bg-green-50 tw-p-3 tw-rounded-lg tw-border-l-4 tw-border-green-400">
                <p className="tw-text-sm tw-font-medium tw-text-green-800 tw-mb-1">Mulai:</p>
                <div className="tw-text-sm">
                  {formatTimeDisplay(schedule.start_time)}
                </div>
              </div>
              <div className="tw-bg-red-50 tw-p-3 tw-rounded-lg tw-border-l-4 tw-border-red-400">
                <p className="tw-text-sm tw-font-medium tw-text-red-800 tw-mb-1">Berakhir:</p>
                <div className="tw-text-sm">
                  {formatTimeDisplay(schedule.end_time)}
                </div>
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          {!isAuthenticated ? (
            <ButtonGradient
              action="login"
              customText="Login untuk Akses"
              onClick={() => router.push('/login')}
              size="md"
              className="tw-w-full"
            />
          ) : hasCompleted ? (
            <ButtonGradient
              action="view"
              customText="Lihat Hasil Detail"
              onClick={() => handleViewScore(schedule.id, schedule.name)}
              size="md"
              className="tw-w-full"
              customColors={{
                gradient1: '#8B5CF6',
                gradient2: '#7C3AED',
                text: '#FFFFFF'
              }}
            />
          ) : canStart ? (
            <ButtonGradient
              action="play"
              customText={isFree ? 'Mulai Try Out Gratis' : 'Mulai Try Out'}
              onClick={() => handleStart(schedule.id)}
              size="md"
              className="tw-w-full"
              customColors={isFree ? {
                gradient1: '#10B981',
                gradient2: '#059669',
                text: '#FFFFFF'
              } : undefined}
            />
          ) : !schedule.is_live ? (
            <ButtonGradient
              action="lock"
              customText="Belum Tersedia"
              disabled
              size="md"
              className="tw-w-full"
            />
          ) : (
            <ButtonGradient
              action="cart"
              customText={hasValidPrice ? `Beli ${formatPrice(schedule.price!)}` : 'Beli Try Out'}
              onClick={() => handleBuyTryOut(schedule)}
              size="md"
              className="tw-w-full"
              customColors={{
                gradient1: '#8B5CF6',
                gradient2: '#7C3AED',
                text: '#FFFFFF'
              }}
            />
          )}
        </Card.Body>
      </Card>
    );
  };

  // Separate owned try-outs into completed and not completed
  const { ownedCompleted, ownedNotCompleted, displayedNotCompleted, displayedCompleted } = useMemo(() => {
    // Not completed: from entitlements that are not in userScores or has_completed: false
    const notCompleted = userEntitlements.filter(ent => !hasCompletedExam(ent.exam_schedule_id));
    
    // Completed: from completedSchedules (fetched separately)
    const completed = completedSchedules;
    
    console.log('=== TRY OUT SAYA BREAKDOWN ===');
    console.log('Total entitlements:', userEntitlements.length);
    console.log('Not completed exams:', notCompleted.length);
    console.log('Completed schedules fetched:', completed.length);
    console.log('User scores with has_completed=true:', 
      Object.values(userScores).filter(s => s.has_completed).length
    );
    
    return {
      ownedCompleted: completed,
      ownedNotCompleted: notCompleted,
      displayedNotCompleted: showAllOwned ? notCompleted : notCompleted.slice(0, MAX_INITIAL_OWNED),
      displayedCompleted: showAllOwned ? completed : completed.slice(0, MAX_INITIAL_OWNED)
    };
  }, [userEntitlements, userScores, completedSchedules, showAllOwned]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!error && !loading) {
        fetchSchedules();
        if (isAuthenticated) {
          fetchUserEntitlements();
          fetchUserScores();
        }
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [error, loading, isAuthenticated]);

  return (
    <>
      <Row className="justify-content-center">
        <Col lg={11} xl={10}>
          {/* My Try Outs Section */}
          {isAuthenticated && (userEntitlements.length > 0 || completedSchedules.length > 0) && (
            <div className="tw-mb-8">
              <Card className="tw-border-0 tw-shadow-2xl tw-bg-gradient-to-br tw-from-purple-50 tw-to-indigo-100 tw-border-2 tw-border-purple-200">
                <Card.Body className="tw-p-6">
                  <div className="tw-flex tw-items-center tw-gap-3 tw-mb-4">
                    <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-purple-500 tw-to-indigo-600 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                      <Trophy className="tw-w-6 tw-h-6 tw-text-white" />
                    </div>
                    <div>
                      <h3 className="tw-text-2xl tw-font-bold tw-text-indigo-800 tw-mb-1">Try Out Saya</h3>
                      <p className="tw-text-indigo-600 tw-text-sm">Try out yang sudah kamu akses</p>
                    </div>
                    <div className="tw-ml-auto">
                      <Badge className="tw-bg-indigo-500 tw-text-white tw-px-3 tw-py-2 tw-text-sm">
                        {userEntitlements.length + completedSchedules.length} Try Out
                      </Badge>
                    </div>
                  </div>

                  {entitlementsLoading ? (
                    <div className="tw-text-center tw-py-8">
                      <Spinner animation="border" className="tw-text-indigo-600" />
                      <p className="tw-mt-3 tw-text-indigo-600">Memuat try out Anda...</p>
                    </div>
                  ) : (
                    <Accordion defaultActiveKey={['not-completed', 'completed']} alwaysOpen>
                      {/* Belum Dikerjakan */}
                      {ownedNotCompleted.length > 0 && (
                        <Accordion.Item eventKey="not-completed" className="tw-mb-4">
                          <Accordion.Header className="tw-bg-gradient-to-r tw-from-indigo-50 tw-to-blue-50">
                            <div className="tw-flex tw-items-center tw-gap-3 tw-font-bold tw-text-indigo-800 tw-text-lg tw-w-full">
                              <div className="tw-w-10 tw-h-10 tw-bg-gradient-to-br tw-from-indigo-500 tw-to-blue-600 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                                <Play className="tw-w-5 tw-h-5 tw-text-white" />
                              </div>
                              <span className="tw-flex-1">Belum Dikerjakan</span>
                              <Badge className="tw-bg-indigo-500 tw-text-white tw-px-3 tw-py-1">
                                {ownedNotCompleted.length}
                              </Badge>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body className="tw-bg-gradient-to-br tw-from-indigo-50/50 tw-to-blue-50/50 tw-p-4">
                            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                              {displayedNotCompleted.map((entitlement, index) => 
                                renderScheduleCard(entitlement.exam_schedule, index, entitlement.exam_schedule.isfree, true)
                              )}
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      )}

                      {/* Sudah Selesai */}
                      {ownedCompleted.length > 0 && (
                        <Accordion.Item eventKey="completed">
                          <Accordion.Header className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-pink-50">
                            <div className="tw-flex tw-items-center tw-gap-3 tw-font-bold tw-text-purple-800 tw-text-lg tw-w-full">
                              <div className="tw-w-10 tw-h-10 tw-bg-gradient-to-br tw-from-purple-500 tw-to-pink-600 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                                <Award className="tw-w-5 tw-h-5 tw-text-white" />
                              </div>
                              <span className="tw-flex-1">Sudah Selesai</span>
                              <Badge className="tw-bg-purple-500 tw-text-white tw-px-3 tw-py-1">
                                {ownedCompleted.length}
                              </Badge>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body className="tw-bg-gradient-to-br tw-from-purple-50/50 tw-to-pink-50/50 tw-p-4">
                            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                              {displayedCompleted.map((schedule, index) => 
                                renderScheduleCard(schedule, index, schedule.isfree, true)
                              )}
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      )}
                    </Accordion>
                  )}

                  {/* Show More/Less Button */}
                  {(ownedNotCompleted.length + ownedCompleted.length) > MAX_INITIAL_OWNED && !entitlementsLoading && (
                    <div className="tw-text-center tw-mt-4">
                      <ButtonGradient
                        action={showAllOwned ? "minimize" : "maximize"}
                        customText={showAllOwned ? "Lihat Lebih Sedikit" : `Lihat Semua (${ownedNotCompleted.length + ownedCompleted.length})`}
                        onClick={() => setShowAllOwned(!showAllOwned)}
                        size="sm"
                        customColors={{
                          gradient1: '#8B5CF6',
                          gradient2: '#7C3AED',
                          text: '#FFFFFF'
                        }}
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          )}

          {/* All Try Outs Section - Grouped by Type */}
          {loading ? (
            <div className="tw-text-center tw-py-12">
              <Spinner animation="border" className="tw-text-violet-600 tw-w-16 tw-h-16" />
              <p className="tw-mt-4 tw-text-violet-600 tw-font-medium">Memuat jadwal try out...</p>
            </div>
          ) : error ? (
            <div className="tw-text-center tw-py-12">
              <div className="tw-w-24 tw-h-24 tw-bg-red-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                <Zap className="tw-w-12 tw-h-12 tw-text-red-600" />
              </div>
              <h4 className="tw-text-xl tw-font-semibold tw-text-red-800 tw-mb-2">Gagal Memuat Data</h4>
              <p className="tw-text-red-600 tw-mb-4">{error}</p>
              <ButtonGradient
                action="refresh"
                customText="Coba Lagi"
                onClick={handleRetry}
                size="md"
              />
            </div>
          ) : Object.keys(groupedSchedules).length === 0 ? (
            <div className="tw-text-center tw-py-12">
              <div className="tw-w-24 tw-h-24 tw-bg-violet-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                <Clock className="tw-w-12 tw-h-12 tw-text-violet-600" />
              </div>
              <h4 className="tw-text-xl tw-font-semibold tw-text-violet-800 tw-mb-2">Belum Ada Try Out Tersedia</h4>
              <p className="tw-text-violet-600 tw-mb-4">Try out akan segera hadir! Stay tuned</p>
              <ButtonGradient
                action="refresh"
                customText="Refresh"
                onClick={handleRetry}
                size="md"
              />
            </div>
          ) : (
            <Accordion className="tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden tw-border-0">
              {Object.entries(groupedSchedules).map(([examType, typeSchedules], typeIndex) => {
                const totalSchedules = typeSchedules.free.length + typeSchedules.paid.length;
                const freeCount = typeSchedules.free.length;
                
                return (
                  <Accordion.Item key={examType} eventKey={examType.toLowerCase()} className="tw-border-0">
                    <Accordion.Header className="tw-bg-gradient-to-r tw-from-violet-100 tw-to-purple-100">
                      <div className="tw-flex tw-items-center tw-gap-3 tw-font-bold tw-text-violet-800 tw-text-xl tw-w-full">
                        <div className={`tw-w-12 tw-h-12 tw-rounded-full tw-flex tw-items-center tw-justify-center ${
                          typeIndex % 4 === 0 ? 'tw-bg-violet-600' :
                          typeIndex % 4 === 1 ? 'tw-bg-purple-600' :
                          typeIndex % 4 === 2 ? 'tw-bg-indigo-600' : 'tw-bg-blue-600'
                        }`}>
                          <BookOpen className="tw-w-6 tw-h-6 tw-text-white" />
                        </div>
                        <div className="tw-flex-1">
                          <div className="tw-flex tw-items-center tw-gap-2">
                            <span>Tryout {examType}</span>
                            {freeCount > 0 && (
                              <Badge className="tw-bg-green-500 tw-text-white tw-text-xs tw-px-2 tw-py-1">
                                {freeCount} Gratis
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="tw-ml-auto tw-flex tw-items-center tw-gap-3">
                          <div className="tw-flex tw-items-center tw-gap-1">
                            <div className="tw-w-2 tw-h-2 tw-bg-green-500 tw-rounded-full tw-animate-pulse"></div>
                            <span className="tw-text-sm tw-font-medium tw-text-green-600">{totalSchedules} Available</span>
                          </div>
                        </div>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="tw-p-8 tw-bg-gradient-to-br tw-from-gray-50 tw-to-violet-50">
                      {/* Free schedules first */}
                      {typeSchedules.free.length > 0 && (
                        <div className="tw-mb-8">
                          <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6">
                            <div className="tw-w-10 tw-h-10 tw-bg-gradient-to-br tw-from-green-400 tw-to-green-600 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                              <Gift className="tw-w-5 tw-h-5 tw-text-white" />
                            </div>
                            <h4 className="tw-text-xl tw-font-bold tw-text-green-700 tw-mb-0">Try Out Gratis</h4>
                            <Badge className="tw-bg-green-100 tw-text-green-800 tw-px-3 tw-py-1">
                              {typeSchedules.free.length} tersedia
                            </Badge>
                          </div>
                          
                          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-3 2xl:tw-grid-cols-4 tw-gap-6 tw-mb-8">
                            {typeSchedules.free.map((schedule, index) => 
                              renderScheduleCard(schedule, index, true, isUserEntitled(schedule.id))
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Paid schedules - with clear border separator */}
                      {typeSchedules.paid.length > 0 && (
                        <>
                          {typeSchedules.free.length > 0 && (
                            <div className="tw-border-t-2 tw-border-purple-300 tw-my-8"></div>
                          )}
                          <div>
                            <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6">
                              <div className="tw-w-10 tw-h-10 tw-bg-gradient-to-br tw-from-purple-400 tw-to-violet-600 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                                <Lock className="tw-w-5 tw-h-5 tw-text-white" />
                              </div>
                              <h4 className="tw-text-xl tw-font-bold tw-text-violet-700 tw-mb-0">Try Out Premium</h4>
                              <Badge className="tw-bg-violet-100 tw-text-violet-800 tw-px-3 tw-py-1">
                                {typeSchedules.paid.length} tersedia
                              </Badge>
                            </div>
                            
                            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-3 2xl:tw-grid-cols-4 tw-gap-6">
                              {typeSchedules.paid.map((schedule, index) => 
                                renderScheduleCard(schedule, index + typeSchedules.free.length, false, isUserEntitled(schedule.id))
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          )}
        </Col>

        {/* Exam Modal */}
        {selId && (
          <ExamModal
            show={modalOpen}
            onClose={() => setModalOpen(false)}
            scheduleId={selId}
          />
        )}

        {/* Score Modal */}
        {selId && (
          <ExamScoreModal
            show={scoreModalOpen}
            onClose={() => {
              setScoreModalOpen(false);
              setSelId(null);
              setSelectedSchedule(null);
            }}
            scheduleId={selId}
            scheduleName={selectedSchedule?.name}
          />
        )}

        {/* Purchase Modal */}
        {selectedSchedule && (
          <TryOutPurchaseModal
            show={purchaseModalOpen}
            onHide={() => {
              setPurchaseModalOpen(false);
              setSelectedSchedule(null);
            }}
            examScheduleId={selectedSchedule.id}
            examScheduleName={selectedSchedule.name}
            onAddToCart={handleAddToCartFromModal}
            onSuccess={handleAddToCartSuccess}
          />
        )}
      </Row>

      {/* NEW: Cart Floater */}
      <GoToCartFloater
        show={showFloater}
        onHide={() => setShowFloater(false)}
        itemName={addedItemName}
        autoHideDelay={5000}
      />
    </>
  );
}