// components/modals/ExamModal.tsx - Updated with Templates
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Spinner, Table, Badge } from 'react-bootstrap';
import {
  BookOpen, Play, Clock, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useExam } from '../../context/ExamContext';
import NoAccessProductModal from './NoAccessProductModal';
import { LearningModal } from '../../components/modal/ModalTemplate';
import { ButtonGradient } from '../../components/button/ButtonTemplate';

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
  is_need_weighted_score?: boolean;
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

interface ExamScore {
  exam_name: string;
  score: number;
  total_correct: number;
  total_questions: number;
  completion_time: string;
}

interface ScoreResult {
  total_score: number;
  average_score: number;
  total_correct: number;
  total_questions: number;
  exam_scores: ExamScore[];
  is_need_weighted_score: boolean;
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
  
  const { 
    setTopicId: setContextTopicId,
    setExamScheduleId: setContextExamScheduleId,
    setExamOrder: setContextExamOrder,
    setExamSessions: setContextExamSessions,
    setActiveSession: setContextActiveSession,
    setSelectedSchedule: setContextSelectedSchedule,
    setExamType: setContextExamType,
    setOriginPath: setContextOriginPath,
  } = useExam();
  
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
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [loadingScore, setLoadingScore] = useState<boolean>(false);

  useEffect(() => {
    if (!scheduleId || !username || !show) return;
    
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;

    const checkAccessAndFetchData = async () => {
      setLoadingExam(true);
      
      try {
        const scheduleResponse = await axios.get(
          `${apiUrl}/exam-schedules/${scheduleId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
        setSelectedSchedule(scheduleResponse.data);

        const accessResponse = await axios.post(
          `${apiUrl}/exam-schedules/checkAccess`,
          { username, examId: scheduleId },
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );

        if (accessResponse.status === 200 && 
            accessResponse.data.message === 'Access granted to the exam') {
          
          const sessionResponse = await axios.get(
            `${apiUrl}/examSession/examSchedule`,
            {
              params: { exam_schedule_id: scheduleId },
              headers: { Authorization: `Bearer ${authToken}` }
            }
          );

          const sessionData = sessionResponse.data?.data || [];
          
          const hasActiveSession = sessionData.some((s: ExamSession) => !s.is_submitted);

          if (!hasActiveSession && sessionData.length > 0) {
            setIsCompleted(true);
            setLoadingExam(false);
            
            fetchExamScores(scheduleId, authToken);
            return;
          }

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

          if (sessionData.length > 0) {
            const sortedSessions = [...sessionData].sort(
              (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
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

  const fetchExamScores = async (scheduleId: number, authToken: string) => {
    setLoadingScore(true);
    try {
      const response = await axios.get(
        `${apiUrl}/exam-schedules/${scheduleId}/scores`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      setScoreResult(response.data);
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoadingScore(false);
    }
  };

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
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
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
        (a, b) => new Date(a.start_time || "").getTime() - new Date(b.start_time || "").getTime()
      );
      const activeExamIndex = sortedExamOrder.findIndex(e => e.exam_id === activeExamId);
      const currentExamIndex = sortedExamOrder.findIndex(e => e.exam_id === exam.exam_id);
      
      return currentExamIndex < activeExamIndex;
    }
    
    return false;
  };

  const areAllExamsCompleted = (): boolean => {
    if (examSessions.length === 0) return false;
    return examSessions.length > 0 && examSessions.every(session => session.is_submitted);
  };

  const handleStart = async () => {
    if (!scheduleId || !userId) return;
    setCreatingSession(true);

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No auth token');
      
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
            (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          );
          setExamSessions(sortedSessions);
          setActiveSession(sortedSessions[0]);
          const updatedExamOrder = mergeSessionDataIntoExamOrder(examOrder, sortedSessions);
          setExamOrder(updatedExamOrder);
          
          setContextExamSessions(sortedSessions);
          setContextActiveSession(sortedSessions[0]);
          setContextExamOrder(updatedExamOrder);
        }
      }

      setContextTopicId(selectedTopicId);
      setContextExamScheduleId(scheduleId);
      setContextExamOrder(examOrder);
      setContextExamSessions(examSessions);
      setContextActiveSession(activeSession);
      setContextSelectedSchedule(selectedSchedule);
      setContextExamType(examType);
      localStorage.setItem('userName', username || '');

      if (examSessions.length > 0) {
        const sortedSessions = [...examSessions].sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        
        const incompleteSession = sortedSessions.find(session => !session.is_submitted);

        if (incompleteSession) {
          const examData = examOrder.find(
            exam => exam.exam_id === parseInt(incompleteSession.exam_id.toString())
          );
          if (examData) {
            router.push(`/exam/${examData.exam_string}`);
            onClose();
            setCreatingSession(false);
            return;
          }
        }
      }

      const sortedExamOrder = [...examOrder].sort(
        (a, b) => new Date(a.start_time || "").getTime() - new Date(b.start_time || "").getTime()
      );
      
      const activeExamId = activeSession ? parseInt(activeSession.exam_id.toString()) : null;
      const firstIncompleteExam = sortedExamOrder.find(
        exam => !isExamEffectivelySubmitted(exam, activeExamId)
      );
      
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
    
    const startTime = exam.start_time ? new Date(exam.start_time) : null;
    const endTime = exam.end_time ? new Date(exam.end_time) : null;
    
    if (!startTime || !endTime || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return { isPast: false, isCurrent: false };
    }
    
    if (startTime.getFullYear() < 2000 || exam.is_submitted) {
      return { isPast: false, isCurrent: false };
    }
    
    return { 
      isPast: now > endTime, 
      isCurrent: now >= startTime && now <= endTime
    };
  };

  const formatTimeDisplay = (timeString: string | undefined): JSX.Element => {
    if (!timeString || timeString === 'null') {
      return <span>Anytime</span>;
    }
    
    const timeDate = new Date(timeString);
    
    if (isNaN(timeDate.getTime()) || timeDate.getFullYear() < 2000) {
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
    
    return <span className={className}>{timeDate.toLocaleString('id-ID')}</span>;
  };

  // Prepare modal buttons
  const completedBottomButtons = [
    {
      action: 'close' as const,
      text: 'Tutup',
      onClick: onClose
    }
  ];

  const activeExamBottomButtons = [
    {
      action: 'cancel' as const,
      text: 'Tutup',
      onClick: onClose
    },
    {
      action: activeSession ? 'continue' as const : 'start' as const,
      text: creatingSession ? 'Memuat...' : (activeSession ? 'Lanjutkan' : 'Mulai Ujian'),
      onClick: handleStart,
      disabled: creatingSession || areAllExamsCompleted(),
      loading: creatingSession
    }
  ];

  return (
    <>
      {/* Loading Modal */}
      <LearningModal
        show={loadingExam || loadingScore}
        onHide={() => {}}
        title={loadingScore ? 'Memuat hasil ujian...' : 'Memuat data ujian...'}
        showCloseButton={false}
        preventCloseOnOutsideClick={true}
      >
        <div className="tw-text-center tw-py-8">
          <Spinner animation="border" className="tw-text-purple-600 tw-w-16 tw-h-16" />
        </div>
      </LearningModal>

      {/* Completed Exam Modal with Scores */}
      {isCompleted && scoreResult && (
        <LearningModal
          show={show && !loadingExam && !loadingScore}
          onHide={onClose}
          title="Hasil Try Out Anda"
          subtitle={selectedSchedule?.name}
          size="xl"
          icon={<BookOpen className="tw-w-5 tw-h-5" />}
          bottomButtons={completedBottomButtons}
        >
          {/* Summary Cards */}
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4 tw-mb-6">
            <div className="tw-bg-gradient-to-br tw-from-purple-100 tw-to-purple-200 tw-p-6 tw-rounded-2xl tw-border-2 tw-border-purple-300">
              <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                <CheckCircle className="tw-w-8 tw-h-8 tw-text-purple-600" />
                <div>
                  <p className="tw-text-sm tw-text-purple-700 tw-mb-0">Skor Total</p>
                  <p className="tw-text-3xl tw-font-bold tw-text-purple-900 tw-mb-0">
                    {scoreResult.total_score}
                  </p>
                </div>
              </div>
              <p className="tw-text-xs tw-text-purple-600 tw-mb-0">
                {scoreResult.is_need_weighted_score ? 'Skor Tertimbang' : 'Skor Standar'}
              </p>
            </div>

            <div className="tw-bg-gradient-to-br tw-from-blue-100 tw-to-blue-200 tw-p-6 tw-rounded-2xl tw-border-2 tw-border-blue-300">
              <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                <Clock className="tw-w-8 tw-h-8 tw-text-blue-600" />
                <div>
                  <p className="tw-text-sm tw-text-blue-700 tw-mb-0">Rata-rata</p>
                  <p className="tw-text-3xl tw-font-bold tw-text-blue-900 tw-mb-0">
                    {scoreResult.average_score.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="tw-text-xs tw-text-blue-600 tw-mb-0">Per Ujian</p>
            </div>

            <div className="tw-bg-gradient-to-br tw-from-green-100 tw-to-green-200 tw-p-6 tw-rounded-2xl tw-border-2 tw-border-green-300">
              <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                <CheckCircle className="tw-w-8 tw-h-8 tw-text-green-600" />
                <div>
                  <p className="tw-text-sm tw-text-green-700 tw-mb-0">Benar</p>
                  <p className="tw-text-3xl tw-font-bold tw-text-green-900 tw-mb-0">
                    {scoreResult.total_correct}/{scoreResult.total_questions}
                  </p>
                </div>
              </div>
              <p className="tw-text-xs tw-text-green-600 tw-mb-0">
                {((scoreResult.total_correct / scoreResult.total_questions) * 100).toFixed(1)}% Akurasi
              </p>
            </div>
          </div>

          {/* Detail Scores Table */}
          <div className="tw-bg-white tw-rounded-2xl tw-shadow-lg tw-overflow-hidden">
            <div className="tw-bg-gradient-to-r tw-from-violet-600 tw-to-purple-600 tw-px-6 tw-py-4">
              <h5 className="tw-text-white tw-font-bold tw-mb-0 tw-flex tw-items-center tw-gap-2">
                <BookOpen className="tw-w-5 tw-h-5" />
                Detail Skor Per Ujian
              </h5>
            </div>
            <div className="tw-overflow-x-auto">
              <Table className="tw-mb-0" striped bordered hover>
                <thead className="tw-bg-gray-100">
                  <tr>
                    <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-700">No</th>
                    <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-700">Nama Ujian</th>
                    <th className="tw-px-4 tw-py-3 tw-text-center tw-text-sm tw-font-semibold tw-text-gray-700">Skor</th>
                    <th className="tw-px-4 tw-py-3 tw-text-center tw-text-sm tw-font-semibold tw-text-gray-700">Benar</th>
                    <th className="tw-px-4 tw-py-3 tw-text-center tw-text-sm tw-font-semibold tw-text-gray-700">Total Soal</th>
                    <th className="tw-px-4 tw-py-3 tw-text-center tw-text-sm tw-font-semibold tw-text-gray-700">Akurasi</th>
                    <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-semibold tw-text-gray-700">Waktu Selesai</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreResult.exam_scores.map((exam, index) => {
                    const accuracy = (exam.total_correct / exam.total_questions) * 100;
                    return (
                      <tr key={index} className="tw-hover:bg-violet-50 tw-transition-colors">
                        <td className="tw-px-4 tw-py-3 tw-text-sm">{index + 1}</td>
                        <td className="tw-px-4 tw-py-3 tw-text-sm tw-font-medium tw-text-gray-900">{exam.exam_name}</td>
                        <td className="tw-px-4 tw-py-3 tw-text-center">
                          <span className="tw-inline-block tw-px-3 tw-py-1 tw-bg-purple-100 tw-text-purple-800 tw-rounded-full tw-font-bold tw-text-sm">
                            {exam.score}
                          </span>
                        </td>
                        <td className="tw-px-4 tw-py-3 tw-text-center tw-text-sm tw-text-green-600 tw-font-semibold">
                          {exam.total_correct}
                        </td>
                        <td className="tw-px-4 tw-py-3 tw-text-center tw-text-sm tw-text-gray-700">
                          {exam.total_questions}
                        </td>
                        <td className="tw-px-4 tw-py-3 tw-text-center">
                          <span className={`tw-inline-block tw-px-3 tw-py-1 tw-rounded-full tw-font-semibold tw-text-xs ${
                            accuracy >= 80 ? 'tw-bg-green-100 tw-text-green-800' :
                            accuracy >= 60 ? 'tw-bg-yellow-100 tw-text-yellow-800' :
                            'tw-bg-red-100 tw-text-red-800'
                          }`}>
                            {accuracy.toFixed(1)}%
                          </span>
                        </td>
                        <td className="tw-px-4 tw-py-3 tw-text-sm tw-text-gray-600">
                          {new Date(exam.completion_time).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </div>
        </LearningModal>
      )}

      {/* Main Exam Modal - for active exams */}
      {!isCompleted && (
        <LearningModal
          show={show && !noAccessModal && !loadingExam}
          onHide={onClose}
          title="Urutan Ujian Anda"
          subtitle="Siap untuk menghadapi tantangan?"
          size="lg"
          icon={<BookOpen className="tw-w-5 tw-h-5" />}
          bottomButtons={activeExamBottomButtons}
        >
          <div className="tw-space-y-4">
            {examOrder
              .sort((a, b) => new Date(a.start_time || "").getTime() - new Date(b.start_time || "").getTime())
              .map((exam, index) => {
                const activeExamId = activeSession ? parseInt(activeSession.exam_id.toString()) : null;
                const isSubmitted = isExamEffectivelySubmitted(exam, activeExamId);
                const { isPast, isCurrent } = getExamTimeStatus(exam);
                
                let cardClasses = "tw-bg-white tw-rounded-2xl tw-shadow-lg tw-border tw-transition-all tw-duration-300 tw-hover:shadow-xl tw-relative";
                let iconComponent = <Clock className="tw-w-5 tw-h-5" />;
                let badgeClasses = "tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-bold tw-flex tw-items-center tw-gap-2";
                
                if (isSubmitted) {
                  cardClasses += " tw-border-gray-300 tw-bg-gray-50";
                  iconComponent = <CheckCircle className="tw-w-5 tw-h-5 tw-text-green-600" />;
                  badgeClasses += " tw-bg-green-500 tw-text-white";
                } else if (isPast) {
                  cardClasses += " tw-border-red-300";
                  iconComponent = <XCircle className="tw-w-5 tw-h-5 tw-text-red-600" />;
                  badgeClasses += " tw-bg-red-500 tw-text-white";
                } else if (isCurrent) {
                  cardClasses += " tw-border-green-400 tw-ring-2 tw-ring-green-400/50";
                  iconComponent = <Play className="tw-w-5 tw-h-5 tw-text-green-600" />;
                  badgeClasses += " tw-bg-green-500 tw-text-white";
                } else {
                  cardClasses += " tw-border-amber-300";
                  iconComponent = <AlertCircle className="tw-w-5 tw-h-5 tw-text-amber-600" />;
                  badgeClasses += " tw-bg-amber-500 tw-text-white";
                }
                
                return (
                  <div key={index} className={cardClasses}>
                    <div className="tw-p-4">
                      <div className="tw-flex tw-items-center tw-gap-3 tw-mb-2">
                        <div className="tw-bg-violet-600 tw-text-white tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-sm tw-font-bold">
                          {index + 1}
                        </div>
                        <h6 className="tw-font-bold tw-text-violet-900 tw-mb-0 tw-flex-1">{exam.name}</h6>
                        <div className={badgeClasses}>
                          {iconComponent}
                          {isSubmitted ? 'Selesai' : isPast ? 'Lewat' : isCurrent ? 'Aktif' : 'Menunggu'}
                        </div>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-4 tw-text-sm tw-text-gray-600">
                        <span className="tw-flex tw-items-center tw-gap-1">
                          <Clock className="tw-w-4 tw-h-4" />
                          {exam.duration} menit
                        </span>
                        <span>{formatTimeDisplay(exam.start_time)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {activeSession && selectedSchedule && isScheduleEnded() && 
            !examSessions.every(session => session.is_submitted) && (
            <div className="tw-mt-6 tw-bg-amber-50 tw-border-2 tw-border-amber-300 tw-rounded-2xl tw-p-4">
              <div className="tw-flex tw-items-start tw-gap-3">
                <AlertCircle className="tw-w-6 tw-h-6 tw-text-amber-600 tw-flex-shrink-0" />
                <p className="tw-text-amber-800 tw-text-sm tw-mb-0">
                  Waktu ujian telah berakhir. Jika melanjutkan, sistem akan menyimpan jawaban yang telah dikerjakan.
                </p>
              </div>
            </div>
          )}
        </LearningModal>
      )}

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