// components/modals/ExamModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import {
  BookOpen,
  Play,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useExam } from '../../context/ExamContext';
import NoAccessProductModal from './NoAccessProductModal';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface ExamOrder {
  exam_id: number;
  exam_string: string;
  name: string;
  duration: number;
  start_time?: string;
  end_time?: string;
  is_submitted?: boolean;
  examType: string;
}

interface ExamSchedule {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

interface ExamSession {
  id: number;
  exam_schedule_id: number;
  exam_id: number | string;
  user_id: number;
  answers: any;
  is_submitted: boolean;
  last_save: string;
  start_time: string;
  end_time: string;
  is_auto_move: boolean;
  minute_exam: number;
}

interface ExamModalProps {
  show: boolean;
  onClose: () => void;
  scheduleId: number | null;
  examType?: string;
  topicId?: number | null;
}

export default function ExamModal({
  show,
  onClose,
  scheduleId,
  examType = 'Try-Out',
  topicId = null,
}: ExamModalProps) {
  const router = useRouter();
  const { username, id: userId } = useAuth();
  
  // Context untuk passing data tanpa localStorage/URL params
  const { 
    setTopicId: setContextTopicId,
    setExamScheduleId: setContextExamScheduleId,
    setExamOrder: setContextExamOrder,
    setExamSessions: setContextExamSessions,
    setActiveSession: setContextActiveSession,
    setSelectedSchedule: setContextSelectedSchedule,
    setExamType: setContextExamType,
    setOriginPath: setContextOriginPath,
    clearExamData
  } = useExam();
  
  // Local state untuk UI
  const [loadingExam, setLoadingExam] = useState<boolean>(false);
  const [noAccessModal, setNoAccessModal] = useState<boolean>(false);
  const [loadingProduct, setLoadingProduct] = useState<boolean>(false);
  const [productId, setProductId] = useState<number | null>(null);
  const [productPrice, setProductPrice] = useState<number | null>(null);
  const [examOrder, setExamOrder] = useState<ExamOrder[]>([]);
  const [examIdList, setExamIdList] = useState<number[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);
  const [creatingSession, setCreatingSession] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);
  const [selectedTopicId] = useState<number | null>(topicId);

  useEffect(() => {
    if (!scheduleId || !username || !show) return;
    
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;

    const checkAccessAndFetchData = async () => {
      setLoadingExam(true);
      
      try {
        // Fetch exam schedule details
        const scheduleResponse = await axios.get(
          `${apiUrl}/exam-schedules/${scheduleId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        setSelectedSchedule(scheduleResponse.data);

        // Check exam access
        const accessResponse = await axios.post(
          `${apiUrl}/exam-schedules/checkAccess`,
          { username, examId: scheduleId },
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (accessResponse.status === 200 && 
            accessResponse.data.message === 'Access granted to the exam') {
          
          // Fetch exam order
          const examResponse = await axios.post(
            `${apiUrl}/examOrder/getExamOrder`,
            { userName: username, scheduleId },
            {
              headers: { Authorization: `Bearer ${authToken}` }
            }
          );

          let examOrderData: ExamOrder[] = examResponse.data.examOrder.map(
            (exam: any) => ({ ...exam, examType })
          );
          setExamOrder(examOrderData);
          setExamIdList(examOrderData.map(exam => exam.exam_id));

          // Check existing sessions
          const sessionResponse = await axios.get(
            `${apiUrl}/examSession/examSchedule`,
            {
              params: { exam_schedule_id: scheduleId },
              headers: { Authorization: `Bearer ${authToken}` }
            }
          );

          if (sessionResponse.data?.data?.length > 0) {
            const sessionData = sessionResponse.data.data;
            const sortedSessions = [...sessionData].sort(
              (a, b) => {
                const aTime = new Date(a.start_time);
                const bTime = new Date(b.start_time);
                
                // Handle invalid dates
                if (isNaN(aTime.getTime()) && isNaN(bTime.getTime())) return 0;
                if (isNaN(aTime.getTime())) return 1;
                if (isNaN(bTime.getTime())) return -1;
                
                return aTime.getTime() - bTime.getTime();
              }
            );
            setExamSessions(sortedSessions);
            setActiveSession(sortedSessions.find(s => !s.is_submitted) || sortedSessions[0]);
            examOrderData = mergeSessionDataIntoExamOrder(examOrderData, sortedSessions);
            setExamOrder(examOrderData);
          } else {
            examOrderData = mergeSessionDataIntoExamOrder(examOrderData, []);
            setExamOrder(examOrderData);
          }
        } else {
          setNoAccessModal(true);
          onClose();
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          setLoadingProduct(true);
          try {
            const productlist = await axios.get(
              `${apiUrl}/products/tryout/${scheduleId}`,
              { headers: { Authorization: `Bearer ${authToken}` } }
            );
            if (productlist.status === 200 && productlist.data.length > 0) {
              setProductId(productlist.data[0].product_id);
              setProductPrice(productlist.data[0].price);
            }
          } catch (productError) {
            console.error('Error fetching product:', productError);
          } finally {
            setLoadingProduct(false);
            setNoAccessModal(true);
            onClose();
          }
        } else {
          console.error('Error checking access:', error);
        }
      } finally {
        setLoadingExam(false);
      }
    };

    checkAccessAndFetchData();
  }, [scheduleId, username, show, examType]);

  const mergeSessionDataIntoExamOrder = (
    examOrderData: ExamOrder[],
    sessionData: ExamSession[]
  ): ExamOrder[] => {
    if (!sessionData || sessionData.length === 0) {
      return examOrderData.map(exam => ({
        ...exam,
        start_time: new Date(0).toISOString(),
        end_time: new Date(0).toISOString(),
        is_submitted: false
      }));
    }

    const sortedSessions = [...sessionData].sort(
      (a, b) => {
        const aTime = new Date(a.start_time);
        const bTime = new Date(b.start_time);
        
        // Handle invalid dates
        if (isNaN(aTime.getTime()) && isNaN(bTime.getTime())) return 0;
        if (isNaN(aTime.getTime())) return 1;
        if (isNaN(bTime.getTime())) return -1;
        
        return aTime.getTime() - bTime.getTime();
      }
    );

    return examOrderData.map(exam => {
      const matchingSession = sortedSessions.find(
        session => parseInt(session.exam_id.toString()) === exam.exam_id
      );
      
      return matchingSession
        ? { 
            ...exam, 
            start_time: matchingSession.start_time, 
            end_time: matchingSession.end_time, 
            is_submitted: matchingSession.is_submitted 
          }
        : { 
            ...exam, 
            start_time: new Date(0).toISOString(), 
            end_time: new Date(0).toISOString(), 
            is_submitted: false 
          };
    });
  };

  const isExamEffectivelySubmitted = (
    exam: ExamOrder, 
    activeExamId: number | null
  ): boolean => {
    if (exam.is_submitted) return true;
    
    if (activeExamId !== null) {
      const sortedExamOrder = [...examOrder].sort(
        (a, b) => {
          const aTime = new Date(a.start_time || "");
          const bTime = new Date(b.start_time || "");
          
          // Handle invalid dates - put them at the end
          if (isNaN(aTime.getTime()) && isNaN(bTime.getTime())) return 0;
          if (isNaN(aTime.getTime())) return 1;
          if (isNaN(bTime.getTime())) return -1;
          
          return aTime.getTime() - bTime.getTime();
        }
      );
      const activeExamIndex = sortedExamOrder.findIndex(e => e.exam_id === activeExamId);
      const currentExamIndex = sortedExamOrder.findIndex(e => e.exam_id === exam.exam_id);
      
      return currentExamIndex < activeExamIndex;
    }
    
    return false;
  };

  // Function untuk check apakah semua ujian sudah selesai
  const areAllExamsCompleted = (): boolean => {
    // Jika tidak ada session sama sekali, berarti belum ada yang dikerjakan
    if (examSessions.length === 0) return false;
    
    // Jika ada session, cek apakah semua sudah di-submit
    return examSessions.length > 0 && examSessions.every(session => session.is_submitted);
  };

  const handleStartExam = async () => {
    if (!scheduleId || !userId) return;
    setCreatingSession(true);

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No auth token');
      
      // Set origin path ke context instead of localStorage
      setContextOriginPath(window.location.pathname);
      
      if (!activeSession) {
        const response = await axios.post(
          `${apiUrl}/examSession/create`,
          { examScheduleId: scheduleId, examIdList },
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (response.data?.sessions) {
          const newSessions = response.data.sessions;
          const sortedSessions = [...newSessions].sort(
            (a, b) => {
              const aTime = new Date(a.start_time);
              const bTime = new Date(b.start_time);
              
              // Handle invalid dates
              if (isNaN(aTime.getTime()) && isNaN(bTime.getTime())) return 0;
              if (isNaN(aTime.getTime())) return 1;
              if (isNaN(bTime.getTime())) return -1;
              
              return aTime.getTime() - bTime.getTime();
            }
          );
          setExamSessions(sortedSessions);
          setActiveSession(sortedSessions[0]);
          const updatedExamOrder = mergeSessionDataIntoExamOrder(examOrder, sortedSessions);
          setExamOrder(updatedExamOrder);
          
          // Set context dengan data yang baru dibuat
          setContextExamSessions(sortedSessions);
          setContextActiveSession(sortedSessions[0]);
          setContextExamOrder(updatedExamOrder);
        }
      }

      // Set semua data ke context instead of localStorage
      setContextTopicId(selectedTopicId);
      setContextExamScheduleId(scheduleId);
      setContextExamOrder(examOrder);
      setContextExamSessions(examSessions);
      setContextActiveSession(activeSession);
      setContextSelectedSchedule(selectedSchedule);
      setContextExamType(examType);

      // Hanya set username ke localStorage jika masih diperlukan di halaman exam
      localStorage.setItem('userName', username || '');

      if (examSessions.length > 0) {
        const sortedSessions = [...examSessions].sort(
          (a, b) => {
            const aTime = new Date(a.start_time);
            const bTime = new Date(b.start_time);
            
            // Handle invalid dates
            if (isNaN(aTime.getTime()) && isNaN(bTime.getTime())) return 0;
            if (isNaN(aTime.getTime())) return 1;
            if (isNaN(bTime.getTime())) return -1;
            
            return aTime.getTime() - bTime.getTime();
          }
        );
        
        const incompleteSession = sortedSessions.find(session => !session.is_submitted);

        if (incompleteSession) {
          const examData = examOrder.find(
            exam => exam.exam_id === parseInt(incompleteSession.exam_id.toString())
          );
          if (examData) {
            // Navigate tanpa query parameters
            router.push(`/exam/${examData.exam_string}`);
            onClose();
            setCreatingSession(false);
            return;
          }
        }
      }

      // Find first incomplete exam
      const sortedExamOrder = [...examOrder].sort(
        (a, b) => {
          const aTime = new Date(a.start_time || "");
          const bTime = new Date(b.start_time || "");
          
          // Handle invalid dates - put them at the end
          if (isNaN(aTime.getTime()) && isNaN(bTime.getTime())) return 0;
          if (isNaN(aTime.getTime())) return 1;
          if (isNaN(bTime.getTime())) return -1;
          
          return aTime.getTime() - bTime.getTime();
        }
      );
      
      const activeExamId = activeSession ? parseInt(activeSession.exam_id.toString()) : null;
      const firstIncompleteExam = sortedExamOrder.find(
        exam => !isExamEffectivelySubmitted(exam, activeExamId)
      );
      
      // Navigate tanpa query parameters
      router.push(
        `/exam/${firstIncompleteExam 
          ? firstIncompleteExam.exam_string 
          : sortedExamOrder[0].exam_string}`
      );
      onClose();
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Failed to start exam. Please try again.');
    } finally {
      setCreatingSession(false);
    }
  };

  const isScheduleEnded = (): boolean => {
    if (!selectedSchedule) return false;
    if (examSessions.length > 0) {
      const now = new Date();
      return !examSessions.some(session => 
        new Date(session.end_time) >= now && !session.is_submitted
      );
    }
    return new Date() > new Date(selectedSchedule.end_time);
  };

  const getExamTimeStatus = (exam: ExamOrder): { isPast: boolean; isCurrent: boolean } => {
    const now = new Date();
    
    // Handle null/undefined times safely
    let startTime: Date | null = null;
    let endTime: Date | null = null;
    let hasValidTimes = false;
    
    if (exam.start_time && exam.start_time !== 'null') {
      startTime = new Date(exam.start_time);
      if (!isNaN(startTime.getTime())) {
        hasValidTimes = startTime.getTime() > 0;
      }
    }
    
    if (exam.end_time && exam.end_time !== 'null') {
      endTime = new Date(exam.end_time);
      if (hasValidTimes && !isNaN(endTime.getTime())) {
        hasValidTimes = hasValidTimes && endTime.getTime() > 0;
      } else {
        hasValidTimes = false;
      }
    } else if (hasValidTimes) {
      // If we have start time but no end time, not valid
      hasValidTimes = false;
    }
    
    if (!hasValidTimes || exam.is_submitted) {
      return { isPast: false, isCurrent: false };
    }
    
    return { 
      isPast: endTime ? now > endTime : false, 
      isCurrent: startTime && endTime ? (now >= startTime && now <= endTime) : false
    };
  };

  const formatTimeDisplay = (timeString: string | undefined): JSX.Element => {
    if (!timeString || timeString === 'null' || timeString === 'undefined') {
      return <span>Anytime</span>;
    }
    
    const timeDate = new Date(timeString);
    
    // Check if date is invalid
    if (isNaN(timeDate.getTime())) {
      return <span>Anytime</span>;
    }
    
    // Check if date is epoch (year 1970) or very old (before 2000)
    if (timeDate.getFullYear() < 2000) {
      return (
        <span className="tw-flex tw-items-center">
          <span className="tw-text-violet-600 tw-font-semibold">Anytime</span>
          <span className="tw-inline-block tw-ml-2 tw-w-4 tw-h-4 tw-bg-violet-500 tw-rounded-full tw-animate-pulse"></span>
        </span>
      );
    }
    
    const now = new Date();
    const isPast = timeDate < now;
    const isFuture = timeDate > now;
    let className = "tw-font-medium";
    
    if (isPast) className += " tw-text-red-600 tw-line-through";
    if (isFuture) className += " tw-text-yellow-600";
    
    return <span className={className}>{timeDate.toLocaleString()}</span>;
  };

  return (
    <>
      {/* Loading Modal */}
      <Modal show={loadingExam} backdrop="static" centered>
        <Modal.Body className="tw-text-center tw-py-8">
          <Spinner animation="border" className="tw-text-purple-600" />
          <p className="tw-mt-3">Memuat data ujian...</p>
        </Modal.Body>
      </Modal>

      {/* Main Exam Modal */}
      <Modal
        show={show && !noAccessModal && !loadingExam}
        onHide={onClose}
        size="lg"
        centered
        className="tw-border-0"
        dialogClassName="modal-90w"
      >
        <div className="tw-bg-gradient-to-br tw-from-violet-500 tw-via-purple-600 tw-to-indigo-600 tw-rounded-3xl tw-shadow-2xl tw-overflow-hidden tw-border-4 tw-border-white/20">
          <Modal.Header
            closeButton
            className="tw-bg-transparent tw-border-0 tw-text-white tw-py-6 tw-px-8 tw-relative"
          >
            <div className="tw-flex tw-items-center tw-gap-4">
              <div className="tw-bg-white/20 tw-p-3 tw-rounded-2xl tw-backdrop-blur-sm">
                <BookOpen className="tw-w-8 tw-h-8 tw-text-white" />
              </div>
              <div>
                <Modal.Title className="tw-text-2xl tw-font-bold tw-text-white tw-mb-1 tw-flex tw-items-center tw-gap-2">
                  Urutan Ujian Anda
                  <Sparkles className="tw-w-6 tw-h-6 tw-text-yellow-300 tw-animate-pulse" />
                </Modal.Title>
                <p className="tw-text-violet-100 tw-text-sm tw-mb-0">Siap untuk menghadapi tantangan? 🚀</p>
              </div>
            </div>
          </Modal.Header>

          <Modal.Body className="tw-p-0 tw-bg-gradient-to-b tw-from-violet-50 tw-to-white tw-relative">
            <div className="tw-p-8 tw-relative tw-z-10">
              <div className="tw-mb-6">
                <p className="tw-text-lg tw-text-violet-800 tw-font-medium tw-mb-2">
                  📚 Berikut adalah daftar ujian yang menanti:
                </p>
                <div className="tw-w-full tw-h-1 tw-bg-gradient-to-r tw-from-violet-400 tw-via-purple-500 tw-to-indigo-500 tw-rounded-full tw-mb-6"></div>
              </div>
              
              <div className="tw-space-y-4">
                {examOrder
                  .sort((a, b) => {
                    const aTime = new Date(a.start_time || "");
                    const bTime = new Date(b.start_time || "");
                    
                    // Handle invalid dates - put them at the end
                    if (isNaN(aTime.getTime()) && isNaN(bTime.getTime())) return 0;
                    if (isNaN(aTime.getTime())) return 1;
                    if (isNaN(bTime.getTime())) return -1;
                    
                    return aTime.getTime() - bTime.getTime();
                  })
                  .map((exam, index) => {
                    const activeExamId = activeSession 
                      ? parseInt(activeSession.exam_id.toString()) 
                      : null;
                      
                    const isSubmitted = isExamEffectivelySubmitted(exam, activeExamId);
                    const { isPast, isCurrent } = getExamTimeStatus(exam);
                    
                    let cardClasses = "tw-bg-white tw-rounded-2xl tw-shadow-lg tw-border tw-transition-all tw-duration-500 tw-hover:shadow-xl tw-hover:scale-[1.02] tw-relative tw-overflow-hidden";
                    let iconComponent = <Clock className="tw-w-5 tw-h-5" />;
                    let badgeClasses = "tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-bold tw-flex tw-items-center tw-gap-2 tw-shadow-sm";
                    
                    if (isSubmitted) {
                      cardClasses += " tw-border-gray-300 tw-bg-gradient-to-r tw-from-gray-50 tw-to-gray-100";
                      iconComponent = <CheckCircle className="tw-w-5 tw-h-5 tw-text-green-600" />;
                      badgeClasses += " tw-bg-green-500 tw-text-white";
                    } else if (isPast) {
                      cardClasses += " tw-border-red-300 tw-bg-gradient-to-r tw-from-red-50 tw-to-orange-50";
                      iconComponent = <XCircle className="tw-w-5 tw-h-5 tw-text-red-600" />;
                      badgeClasses += " tw-bg-red-500 tw-text-white";
                    } else if (isCurrent) {
                      cardClasses += " tw-border-green-400 tw-bg-gradient-to-r tw-from-green-50 tw-to-emerald-50 tw-ring-2 tw-ring-green-400/50 tw-animate-pulse";
                      iconComponent = <Play className="tw-w-5 tw-h-5 tw-text-green-600" />;
                      badgeClasses += " tw-bg-green-500 tw-text-white tw-animate-bounce";
                    } else {
                      cardClasses += " tw-border-amber-300 tw-bg-gradient-to-r tw-from-amber-50 tw-to-yellow-50";
                      iconComponent = <AlertCircle className="tw-w-5 tw-h-5 tw-text-amber-600" />;
                      badgeClasses += " tw-bg-amber-500 tw-text-white";
                    }
                    
                    return (
                      <div key={index} className={cardClasses}>
                        <div className="tw-absolute tw-top-4 tw-left-4 tw-bg-violet-600 tw-text-white tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-sm tw-font-bold tw-shadow-lg">
                          {index + 1}
                        </div>
                        
                        {isSubmitted && (
                          <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-pointer-events-none">
                            <div className="tw-w-full tw-h-1 tw-bg-gray-400 tw-transform tw-rotate-12"></div>
                          </div>
                        )}
                        
                        <div className="tw-p-6 tw-pl-16">
                          <div className="tw-flex tw-flex-col lg:tw-flex-row lg:tw-items-start tw-gap-4">
                            <div className="tw-flex-1">
                              <h3 className={`tw-text-xl tw-font-bold tw-mb-3 tw-flex tw-items-center tw-gap-3 ${isSubmitted ? 'tw-text-gray-500' : 'tw-text-violet-900'}`}>
                                {iconComponent}
                                {exam.name}
                              </h3>
                              
                              <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3 tw-text-violet-700">
                                <Clock className="tw-w-4 tw-h-4" />
                                <span className="tw-font-medium">Durasi: {exam.duration} menit</span>
                              </div>
                              
                              <div className="tw-mb-4">
                                <div className={badgeClasses}>
                                  {isSubmitted && (
                                    <>
                                      <CheckCircle className="tw-w-4 tw-h-4" />
                                      ✅ Sudah Dikumpulkan
                                    </>
                                  )}
                                  {!isSubmitted && isPast && (
                                    <>
                                      <XCircle className="tw-w-4 tw-h-4" />
                                      ⏰ Waktu Habis
                                    </>
                                  )}
                                  {!isSubmitted && isCurrent && (
                                    <>
                                      <Play className="tw-w-4 tw-h-4" />
                                      🎯 Sedang Berlangsung
                                    </>
                                  )}
                                  {!isSubmitted && !isPast && !isCurrent && (
                                    <>
                                      <AlertCircle className="tw-w-4 tw-h-4" />
                                      ⏳ Belum Dimulai
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <div className="tw-bg-white/70 tw-rounded-xl tw-p-4 tw-space-y-2 tw-backdrop-blur-sm">
                                <div className="tw-flex tw-items-center tw-gap-2 tw-text-violet-700">
                                  <div className="tw-w-2 tw-h-2 tw-bg-violet-500 tw-rounded-full"></div>
                                  <span className="tw-font-medium">Mulai:</span>
                                  <span className="tw-font-semibold">
                                    {formatTimeDisplay(exam.start_time)}
                                  </span>
                                </div>
                                
                                <div className="tw-flex tw-items-center tw-gap-2 tw-text-violet-700">
                                  <div className="tw-w-2 tw-h-2 tw-bg-violet-500 tw-rounded-full"></div>
                                  <span className="tw-font-medium">Selesai:</span>
                                  <span className="tw-font-semibold">
                                    {formatTimeDisplay(exam.end_time)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Important notices */}
              {activeSession && selectedSchedule && isScheduleEnded() && 
                !examSessions.every(session => session.is_submitted) && (
                <div className="tw-mt-6 tw-bg-gradient-to-r tw-from-amber-50 tw-to-orange-50 tw-border-2 tw-border-amber-300 tw-rounded-2xl tw-p-6 tw-shadow-lg">
                  <div className="tw-flex tw-items-start tw-gap-4">
                    <div className="tw-bg-amber-500 tw-p-3 tw-rounded-full">
                      <AlertCircle className="tw-w-6 tw-h-6 tw-text-white" />
                    </div>
                    <div>
                      <h4 className="tw-text-xl tw-font-bold tw-text-amber-900 tw-mb-2">
                        ⚠️ Perhatian Penting!
                      </h4>
                      <p className="tw-text-amber-800 tw-text-lg">
                        Waktu ujian telah berakhir. Jika Anda melanjutkan, sistem akan langsung menyimpan jawaban yang telah Anda kerjakan.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Modal.Body>
          
          <Modal.Footer className="tw-bg-gradient-to-r tw-from-violet-100 tw-to-purple-100 tw-py-4 tw-px-8 tw-border-0">
            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 tw-w-full tw-justify-end">
              <Button
                variant="secondary"
                onClick={onClose}
                className="tw-bg-white tw-text-violet-700 tw-border-2 tw-border-violet-300 tw-font-bold tw-py-3 tw-px-6 tw-rounded-2xl tw-transition-all tw-duration-300 tw-hover:bg-violet-50 tw-hover:border-violet-400 tw-hover:scale-105 tw-shadow-md"
              >
                ❌ Tutup
              </Button>
              
              <Button
                variant="primary"
                onClick={handleStartExam}
                disabled={creatingSession || areAllExamsCompleted()}
                className="tw-bg-gradient-to-r tw-from-violet-600 tw-to-purple-600 tw-text-white tw-border-0 tw-font-bold tw-py-3 tw-px-8 tw-rounded-2xl tw-transition-all tw-duration-300 tw-hover:from-violet-700 tw-hover:to-purple-700 tw-hover:scale-105 tw-shadow-lg tw-flex tw-items-center tw-justify-center tw-gap-2"
              >
                {creatingSession ? (
                  <>
                    <Spinner animation="border" size="sm" className="tw-text-white" />
                    ⏳ Memuat...
                  </>
                ) : activeSession ? (
                  <>
                    <Play className="tw-w-5 tw-h-5" />
                    🚀 Lanjutkan Ujian
                  </>
                ) : (
                  <>
                    <BookOpen className="tw-w-5 tw-h-5" />
                    ✨ Mulai Ujian
                  </>
                )}
              </Button>
            </div>
          </Modal.Footer>
        </div>
      </Modal>

      {/* No Access Modal */}
      <NoAccessProductModal
        show={noAccessModal && !loadingProduct}
        onClose={() => setNoAccessModal(false)}
        userId={userId}
        productId={productId}
        productPrice={productPrice}
      />
    </>
  );
}