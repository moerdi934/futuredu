// pages/exam/TryOutClient.tsx - Updated with Coin System Integration and Live Filtering
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Card, Accordion, Spinner, Badge } from 'react-bootstrap';
import {
  BookOpen, Clock, Star, Zap, Target, Trophy, Gift, 
  ShoppingCart, Play, Calendar, Check, AlertCircle,
  Award, ChevronDown, ChevronUp, Unlock, Lock, Coins, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import ExamModal from './ExamModal';
import ExamScoreModal from './ExamScoreModal';
import TryOutPurchaseModal from './TryOutPurchaseModal';
import GoToCartFloater from '../../components/floater/GoToCartFloater';
import CoinPurchaseModal from '../../components/modals/CoinPurchaseModal';
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
  coin_price?: number;
  coin_type?: 'tryout';
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

interface CoinBalance {
  coin_type: 'class' | 'course' | 'tryout';
  total_balance: number;
  expiring_soon: number;
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
  
  // Floater states
  const [showFloater, setShowFloater] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  
  // Coin system states
  const [coinBalances, setCoinBalances] = useState<CoinBalance[]>([]);
  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const [selectedCoinSchedule, setSelectedCoinSchedule] = useState<ExamSchedule | null>(null);
  const [coinLoading, setCoinLoading] = useState(false);
  
  const MAX_INITIAL_OWNED = 6;

  // Fetch all try-out user data in a single API call (optimized to reduce N+1 queries)
  const fetchTryOutUserData = async () => {
    if (!isAuthenticated || !userId) return;
    
    try {
      setEntitlementsLoading(true);
      setCoinLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(
        `${apiUrl}/user/try-out-data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
          params: { _t: Date.now() }
        }
      );

      if (response.data.success) {
        const { entitlements, scores, coinBalances } = response.data.data;
        
        // Set entitlements
        setUserEntitlements(entitlements || []);
        
        // Set scores
        const scoresMap: Record<number, UserExamScore> = {};
        if (Array.isArray(scores)) {
          scores.forEach((score: UserExamScore) => {
            scoresMap[score.exam_schedule_id] = score;
          });
        }
        setUserScores(scoresMap);
        
        // Fetch schedules for completed exams
        const completedExamIds = Object.entries(scoresMap)
          .filter(([_, score]) => score.has_completed)
          .map(([id, _]) => parseInt(id));

        if (completedExamIds.length > 0) {
          await fetchCompletedSchedules(completedExamIds, token);
        }
        
        // Set coin balances
        setCoinBalances(coinBalances || []);
      }
    } catch (error) {
      console.error('Error fetching try-out user data:', error);
      setUserEntitlements([]);
      setUserScores({});
      setCoinBalances([]);
    } finally {
      setEntitlementsLoading(false);
      setCoinLoading(false);
    }
  };

  // Fetch user coin balances (kept for backward compatibility)
  const fetchCoinBalances = async () => {
    if (!isAuthenticated || !userId) return;
    
    try {
      setCoinLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.get(
        `${apiUrl}/coins/balance`,
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
      setCoinBalances([]);
    } finally {
      setCoinLoading(false);
    }
  };

  // Get coin balance for specific type
  const getCoinBalance = (coinType: 'tryout'): number => {
    const balance = coinBalances.find(b => b.coin_type === coinType);
    return balance ? balance.total_balance : 0;
  };

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
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @deprecated Use fetchTryOutUserData() instead for better performance
   * This function is kept for backward compatibility only
   */
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
      setUserEntitlements([]);
    } finally {
      setEntitlementsLoading(false);
    }
  };

  /**
   * @deprecated Use fetchTryOutUserData() instead for better performance
   * This function is kept for backward compatibility only
   */
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
      
      setUserScores(scoresMap);

      // Fetch schedules for completed exams
      const completedExamIds = Object.entries(scoresMap)
        .filter(([_, score]) => score.has_completed)
        .map(([id, _]) => parseInt(id));

      if (completedExamIds.length > 0) {
        await fetchCompletedSchedules(completedExamIds, token);
      }
    } catch (error) {
      setUserScores({});
    }
  };

  const fetchCompletedSchedules = async (examScheduleIds: number[], token: string) => {
    if (examScheduleIds.length === 0) {
      setCompletedSchedules([]);
      return;
    }

    try {
      // Use batch endpoint - 1 API call instead of N calls
      const response = await axios.get(
        `${apiUrl}/exam-schedules/batch`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            ids: examScheduleIds.join(','),
            _t: Date.now() 
          }
        }
      );

      if (response.data?.success && Array.isArray(response.data.data)) {
        setCompletedSchedules(response.data.data);
      } else {
        setCompletedSchedules([]);
      }
    } catch (error) {
      setCompletedSchedules([]);
    }
  };

  // Filter function to check if schedule should be displayed
  const shouldDisplaySchedule = (schedule: ExamSchedule, isOwned: boolean): boolean => {
    // Always show if user owns it (has entitlement)
    if (isOwned) return true;
    
    // Always show free schedules
    if (schedule.isfree) return true;
    
    // For paid schedules, only show if is_live is true
    // If is_live is undefined/null, treat as not live (don't show)
    return schedule.is_live === true;
  };

  const groupSchedulesByType = (schedulesData: ExamSchedule[]) => {
    const grouped: GroupedSchedules = {};
    
    // Filter schedules based on shouldDisplaySchedule logic
    const filteredSchedules = schedulesData.filter(schedule => {
      const isOwned = isUserEntitled(schedule.id);
      return shouldDisplaySchedule(schedule, isOwned);
    });
    
    filteredSchedules.forEach(schedule => {
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

    // Sort schedules within each group
    Object.values(grouped).forEach(group => {
      group.free.sort((a, b) => new Date(b.create_date).getTime() - new Date(a.create_date).getTime());
      group.paid.sort((a, b) => new Date(b.create_date).getTime() - new Date(a.create_date).getTime());
    });

    setGroupedSchedules(grouped);
  };

  useEffect(() => {
    // Always use SSR data, never refetch on mount
    if (initialSchedules && Array.isArray(initialSchedules)) {
      setSchedules(initialSchedules);
      setLoading(false);
    } else {
      // SSR failed, set empty state
      setSchedules([]);
      setLoading(false);
      setError('Tidak ada jadwal try out tersedia');
    }
  }, [initialSchedules]);

  useEffect(() => {
    if (schedules.length > 0) {
      groupSchedulesByType(schedules);
    }
  }, [schedules, userEntitlements]); // Re-group when entitlements change

  useEffect(() => {
    if (isAuthenticated) {
      // Use combined API call to reduce N+1 queries
      fetchTryOutUserData();
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

  const formatTimeDisplay = (timeString: string | undefined): React.ReactElement => {
    if (!timeString) return (
      <span className="tw-flex tw-items-center tw-text-violet-600 tw-font-medium">
        <Zap className="tw-w-4 tw-h-4 tw-mr-1" />
        Kapan Saja
      </span>
    );
    
    const timeDate = new Date(timeString);
    if (isNaN(timeDate.getTime()) || timeDate.getFullYear() < 2000) {
      return (
        <span className="tw-flex tw-items-center">
          <span className="tw-text-violet-600 tw-font-semibold tw-flex tw-items-center">
            <Zap className="tw-w-4 tw-h-4 tw-mr-1" />
            Kapan Saja
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

  const handleBuyWithCoins = (schedule: ExamSchedule) => {
    if (!isAuthenticated) {
      alert('Silakan login terlebih dahulu untuk membeli try-out');
      router.push('/login');
      return;
    }

    setSelectedCoinSchedule(schedule);
    setCoinModalOpen(true);
  };

  const handleCoinPurchaseSuccess = (entitlements: string[]) => {
    setAddedItemName(`Try-out dibeli dengan koin: ${entitlements.join(', ')}`);
    setShowFloater(true);
    
    // Refresh data with combined API call
    if (isAuthenticated) {
      fetchTryOutUserData();
    }
  };

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
        return;
      } else {
        alert('Gagal menambahkan ke keranjang: ' + response.data.message);
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      alert('Gagal menambahkan ke keranjang: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
      throw error;
    }
  };

  const handleAddToCartSuccess = (itemName: string) => {
    setAddedItemName(itemName);
    setShowFloater(true);
    
    if (isAuthenticated) {
      // Use combined API call to reduce N+1 queries
      fetchTryOutUserData();
    }
  };

  const handleRetry = () => {
    handleRefreshData();
  };

  const renderScheduleCard = (schedule: ExamSchedule, index: number, isFree: boolean, isOwned: boolean = false) => {
    const isEntitled = isUserEntitled(schedule.id);
    const hasCompleted = hasCompletedExam(schedule.id);
    const examScore = getExamScore(schedule.id);
    const canStart = (isFree || isEntitled) && !hasCompleted;
    const hasValidPrice = schedule.price !== undefined && schedule.price > 0;
    const discountPercentage = schedule.original_price && schedule.price 
      ? calculateDiscountPercentage(schedule.original_price, schedule.price) 
      : 0;

    // Coin purchase availability
    const canBuyWithCoins = schedule.coin_price !== undefined && schedule.coin_type === 'tryout';
    const tryoutCoinBalance = getCoinBalance('tryout');
    const hasEnoughCoins = canBuyWithCoins && tryoutCoinBalance >= (schedule.coin_price || 0);

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
            {canBuyWithCoins && !isOwned && !hasCompleted && (
              <Badge className="tw-bg-yellow-500 tw-text-white tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1">
                <Coins className="tw-w-3 tw-h-3" />
                {schedule.coin_price} Koin
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
              {hasValidPrice ? (
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
                  {canBuyWithCoins && (
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-2 tw-pt-2 tw-border-t tw-border-gray-200">
                      <span className="tw-text-sm tw-font-medium tw-text-gray-600">Atau dengan Koin:</span>
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <Coins className="tw-w-4 tw-h-4 tw-text-yellow-600" />
                        <span className="tw-text-lg tw-font-bold tw-text-yellow-600">{schedule.coin_price}</span>
                        <span className="tw-text-sm tw-text-gray-500">Koin Try-out</span>
                      </div>
                    </div>
                  )}
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

          {/* Coin balance display for authenticated users */}
          {!hasCompleted && !isFree && !isOwned && isAuthenticated && canBuyWithCoins && (
            <div className="tw-mb-4 tw-bg-yellow-50 tw-p-3 tw-rounded-lg tw-border tw-border-yellow-200">
              <div className="tw-flex tw-items-center tw-justify-between tw-text-sm">
                <span className="tw-text-gray-600">Koin Try-out Anda:</span>
                <div className="tw-flex tw-items-center tw-gap-2">
                  <Coins className="tw-w-4 tw-h-4 tw-text-yellow-600" />
                  <span className={`tw-font-bold ${hasEnoughCoins ? 'tw-text-green-600' : 'tw-text-red-600'}`}>
                    {coinLoading ? '...' : tryoutCoinBalance}
                  </span>
                </div>
              </div>
              {!hasEnoughCoins && canBuyWithCoins && (
                <div className="tw-text-xs tw-text-red-600 tw-mt-1">
                  Butuh {(schedule.coin_price || 0) - tryoutCoinBalance} koin lagi
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
          ) : (
            <div className="tw-space-y-2">
              {/* Regular purchase button */}
              {hasValidPrice && (
                <ButtonGradient
                  action="cart"
                  customText={`Beli ${formatPrice(schedule.price!)}`}
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
              {/* Coin purchase button */}
              {canBuyWithCoins && (
                <ButtonGradient
                  action="custom"
                  customText={`Beli dengan ${schedule.coin_price} Koin`}
                  customIcon={<Coins className="tw-w-4 tw-h-4" />}
                  onClick={() => handleBuyWithCoins(schedule)}
                  size="md"
                  className="tw-w-full"
                  disabled={!hasEnoughCoins}
                  customColors={{
                    gradient1: hasEnoughCoins ? '#F59E0B' : '#9CA3AF',
                    gradient2: hasEnoughCoins ? '#D97706' : '#6B7280',
                    text: '#FFFFFF'
                  }}
                />
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  // Separate owned try-outs into completed and not completed
  const { ownedCompleted, ownedNotCompleted, displayedNotCompleted, displayedCompleted } = useMemo(() => {
    const notCompleted = userEntitlements.filter(ent => !hasCompletedExam(ent.exam_schedule_id));
    const completed = completedSchedules;
    
    return {
      ownedCompleted: completed,
      ownedNotCompleted: notCompleted,
      displayedNotCompleted: showAllOwned ? notCompleted : notCompleted.slice(0, MAX_INITIAL_OWNED),
      displayedCompleted: showAllOwned ? completed : completed.slice(0, MAX_INITIAL_OWNED)
    };
  }, [userEntitlements, userScores, completedSchedules, showAllOwned]);

  // Manual refresh function (replaces automatic interval)
  const handleRefreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use combined API call to reduce N+1 queries
      await Promise.all([
        fetchSchedules(),
        isAuthenticated && fetchTryOutUserData()
      ].filter(Boolean));
    } catch (err) {
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Removed automatic 5-minute interval refresh
  // Users can manually refresh if needed

  return (
    <>
      <Row className="justify-content-center">
        <Col lg={11} xl={10}>
          {/* Refresh Button */}
          <div className="tw-mb-4 tw-flex tw-justify-end">
            <ButtonGradient
              action="refresh"
              customText={loading ? 'Memuat...' : 'Refresh Data'}
              customIcon={<RefreshCw size={16} className={loading ? 'tw-animate-spin' : ''} />}
              onClick={handleRefreshData}
              disabled={loading}
              size="sm"
              customColors={{
                gradient1: '#667eea',
                gradient2: '#764ba2',
                text: '#FFFFFF'
              }}
            />
          </div>

          {/* Coin Balance Display */}
          {isAuthenticated ? (
            <div className="tw-mb-6">
              <Card className="tw-border-0 tw-shadow-lg tw-bg-gradient-to-r tw-from-yellow-50 tw-to-orange-100 tw-border tw-border-yellow-200">
                <Card.Body className="tw-p-4">
                  <div className="tw-flex tw-items-center tw-justify-between">
                    <div className="tw-flex tw-items-center tw-gap-3">
                      <div className="tw-w-10 tw-h-10 tw-bg-yellow-500 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                        <Coins className="tw-w-5 tw-h-5 tw-text-white" />
                      </div>
                      <div>
                        <h6 className="tw-font-bold tw-text-yellow-800 tw-mb-0">Koin Try-out Anda</h6>
                        <p className="tw-text-yellow-700 tw-text-sm tw-mb-0">Gunakan koin untuk pembelian instan</p>
                      </div>
                    </div>
                    <div className="tw-text-right">
                      {coinLoading ? (
                        <div className="tw-animate-pulse tw-bg-yellow-300 tw-h-8 tw-w-16 tw-rounded"></div>
                      ) : (
                        <div className="tw-text-2xl tw-font-bold tw-text-yellow-800">
                          {getCoinBalance('tryout')}
                        </div>
                      )}
                      <div className="tw-text-sm tw-text-yellow-700">Tersedia</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ) : null}

          {/* My Try Outs Section */}
          {isAuthenticated && (userEntitlements.length > 0 || completedSchedules.length > 0) ? (
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
          ) : null}

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
              <p className="tw-text-violet-600 tw-mb-4">Try out akan segera hadir! Nantikan terus</p>
              <ButtonGradient
                action="refresh"
                customText="Muat Ulang"
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
                            <span className="tw-text-sm tw-font-medium tw-text-green-600">{totalSchedules} Tersedia</span>
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
                      
                      {/* Paid schedules */}
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

        {/* Coin Purchase Modal */}
        {selectedCoinSchedule && (
          <CoinPurchaseModal
            show={coinModalOpen}
            onHide={() => {
              setCoinModalOpen(false);
              setSelectedCoinSchedule(null);
            }}
            productId={selectedCoinSchedule.id}
            productName={selectedCoinSchedule.name}
            coinType="tryout"
            coinPrice={selectedCoinSchedule.coin_price || 0}
            userCoinBalance={getCoinBalance('tryout')}
            onSuccess={handleCoinPurchaseSuccess}
          />
        )}
      </Row>

      {/* Cart Floater */}
      <GoToCartFloater
        show={showFloater}
        onHide={() => setShowFloater(false)}
        itemName={addedItemName}
        autoHideDelay={5000}
      />
    </>
  );
}
