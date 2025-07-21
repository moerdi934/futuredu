'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ProgressBar, Button, Badge, Row, Col, Spinner, Alert } from 'react-bootstrap';
import {
  BarChart, CheckCircle, XCircle, Award, BookOpen, Zap, Star, ChevronRight,
  Clock, Target, TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface DrillModalProps {
  show: boolean;
  onClose: () => void;
  onContinue?: () => void;
  drillId: number;
  topicId: number | null;
  title?: string;
}

interface DifficultyDistribution {
  level: number;
  name: string;
  total: number;
  correct: number;
  avg_time: number;
}

interface DrillResult {
  total_questions: number;
  total_answered: number;
  total_correct: number;
  accuracy: number;
  avg_elapsed_time: number;
  difficulty_distribution: DifficultyDistribution[];
}

interface QuestionLeft {
  exam_id: number;
  remaining_questions: number[];
}

interface SessionData {
  question_orders: {
    exam_id: number;
    exam_string: string;
    question_id_list: number[];
  }[];
}

interface VerifikasiSession {
  id: number;
}

const difficultyNames: Record<number, string> = {
  1: 'Core',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert',
  5: 'Master'
};

const DrillModal: React.FC<DrillModalProps> = ({
  show,
  onClose,
  onContinue,
  drillId,
  topicId,
  title = "Drill Soal Soal"
}) => {
  const [drillResult, setDrillResult] = useState<DrillResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [hasNotStarted, setHasNotStarted] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState<QuestionLeft[]>([]);
  const [verifikasiSession, setVerifikasiSession] = useState<VerifikasiSession | null>(null);
  const [verifikasiError, setVerifikasiError] = useState<string | null>(null);

  const router = useRouter();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    if (minutes === 0) return `${remainingSeconds} detik`;
    return `${minutes} menit ${remainingSeconds} detik`;
  };

  const getDifficultyColor = (level: number): string => {
    const colors = ["success", "primary", "info", "warning", "danger"];
    return colors[level - 1] || "secondary";
  };

  const getAccuracyVariant = (accuracy: number): string => {
    if (accuracy >= 0.8) return "success";
    if (accuracy >= 0.6) return "info";
    if (accuracy >= 0.4) return "warning";
    return "danger";
  };

  const getTotalQuestionsFromSession = (): number => {
    if (!sessionData?.question_orders) return 0;
    return sessionData.question_orders.reduce(
      (total, order) => total + order.question_id_list.length,
      0
    );
  };

  const getTotalQuestionLeft = (): number =>
    questionsLeft.reduce((sum, q) => sum + q.remaining_questions.length, 0);

  // Reset all state each time modal opened
  useEffect(() => {
    if (show) {
      setLoading(true);
      setError(null);
      setHasNotStarted(false);
      setQuestionsLeft([]);
      setDrillResult(null);
      setVerifikasiSession(null);
      setVerifikasiError(null);
      setSessionData(null);
    }
  }, [show]);

  // Fetch session, score, dan verifikasi session - all in one
  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      if (!show || !drillId) return;
      try {
        // 1. Ambil session/order soal
        const sessionRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/examOrder/getQuestionOrder/${drillId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
        );
        if (!isMounted) return;
        const session = sessionRes.data;
        setSessionData(session);

        // 2. Ambil score/stats
        let hasResult = false;
        let drillResultData: DrillResult | null = null;
        let questionsPerExam: any[] = [];
        try {
          const resultRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/score/drill/${drillId}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
          );
          if (!isMounted) return;
          const apiData = resultRes.data;
          if (apiData.stats && apiData.stats.length > 0) {
            const firstStat = apiData.stats[0];
            const totalAnswered = parseInt(firstStat.total_questions_answered);
            const totalCorrect = parseInt(firstStat.total_correct_answers);
            const avgElapsedTime = parseFloat(firstStat.avg_elapsed_time);
            const totalQuestions = apiData.stats.reduce(
              (sum: number, item: any) => sum + parseInt(item.questions_per_level),
              0
            );
            drillResultData = {
              total_questions: totalQuestions,
              total_answered: totalAnswered,
              total_correct: totalCorrect,
              accuracy: totalAnswered > 0 ? totalCorrect / totalAnswered : 0,
              avg_elapsed_time: avgElapsedTime,
              difficulty_distribution: apiData.stats.map((item: any) => ({
                level: parseInt(item.level),
                name: difficultyNames[parseInt(item.level)] || `Level ${item.level}`,
                total: parseInt(item.questions_per_level),
                correct: parseInt(item.correct_per_level),
                avg_time: parseFloat(item.avg_time_per_level)
              }))
            };
            setDrillResult(drillResultData);
            questionsPerExam = apiData.questions_per_exam || [];
            hasResult = true;
          } else {
            setHasNotStarted(true);
            hasResult = false;
          }
        } catch (scoreErr) {
          setHasNotStarted(true);
          hasResult = false;
        }

        // 3. Hitung soal tersisa
        let initialQuestionsLeft: QuestionLeft[] = [];
        if (session.question_orders && hasResult && questionsPerExam.length) {
          session.question_orders.forEach((order: any) => {
            const examStats = questionsPerExam.find(
              (e: any) => e.exam_id === order.exam_id
            );
            if (examStats) {
              const answeredQuestions = new Set(examStats.question_ids || []);
              const remaining = order.question_id_list.filter(
                (id: number) => !answeredQuestions.has(id)
              );
              initialQuestionsLeft.push({
                exam_id: order.exam_id,
                remaining_questions: remaining
              });
            } else {
              initialQuestionsLeft.push({
                exam_id: order.exam_id,
                remaining_questions: [...order.question_id_list]
              });
            }
          });
        } else if (session.question_orders) {
          initialQuestionsLeft = session.question_orders.map((order: any) => ({
            exam_id: order.exam_id,
            remaining_questions: [...order.question_id_list]
          }));
        }
        setQuestionsLeft(initialQuestionsLeft);

        // 4. Verifikasi session (kalau masih ada soal)
        const totalQuestionLeft = initialQuestionsLeft.reduce((sum, q) => sum + q.remaining_questions.length, 0);
        if (totalQuestionLeft > 0) {
          const unfinishedOrder = session.question_orders.find((q: any) => {
            const qleft = initialQuestionsLeft.find(ql => ql.exam_id === q.exam_id);
            return qleft && qleft.remaining_questions.length > 0;
          });
          if (!unfinishedOrder) throw new Error('Exam belum ditemukan');
          const payload = {
            schedule_id: drillId,
            exam_id: unfinishedOrder.exam_id,
            question_left: totalQuestionLeft,
            session_id: null
          };
          try {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/examSession/verifikasi`,
              payload,
              { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
            );
            if (!isMounted) return;
            setVerifikasiSession(response.data.data);
          } catch (err) {
            setVerifikasiError('Gagal verifikasi sesi drill.');
          }
        }
      } catch (err) {
        setError('Gagal memuat data drill. Silakan coba lagi.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (show && drillId) {
      setLoading(true);
      fetchAll();
    }

    return () => { isMounted = false; };
  }, [show, drillId]);

  const handleStartOrContinue = () => {
    if (!sessionData || !verifikasiSession || getTotalQuestionLeft() === 0) return;
    const unfinishedOrder = sessionData.question_orders.find((q: any) => {
      const qleft = questionsLeft.find(ql => ql.exam_id === q.exam_id);
      return qleft && qleft.remaining_questions.length > 0;
    });
    if (!unfinishedOrder) return;

    // Store state in sessionStorage before navigation
    const navigationState = {
      exam_schedule_id: drillId,
      topic_id: topicId,
      session_id: verifikasiSession.id,
      questions_left: questionsLeft,
      exam_id: unfinishedOrder.exam_id
    };
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('drillState', JSON.stringify(navigationState));
    }
    
    router.push(`/drill/${unfinishedOrder.exam_string}`);
    if (onContinue) onContinue();
  };

  const allDone = sessionData && getTotalQuestionLeft() === 0;

  // --- UI START ---
  if (loading) {
    return (
      <Modal show={show} centered className="tw-rounded-2xl">
        <Modal.Body className="tw-text-center tw-py-8">
          <Spinner animation="border" variant="primary" />
          <p className="tw-mt-3 tw-text-purple-800">Memuat data drill dan verifikasi sesi...</p>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      className="tw-rounded-2xl tw-overflow-hidden"
    >
      <Modal.Header
        closeButton
        className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-700 tw-text-white tw-border-0"
      >
        <Modal.Title className="tw-flex tw-items-center tw-gap-3">
          <Award size={28} className="tw-text-yellow-300" />
          <div>
            <h3 className="tw-text-xl tw-font-bold tw-mb-0">
              {title}
            </h3>
            {sessionData && (
              <p className="tw-text-purple-100 tw-text-sm tw-mb-0">
                {getTotalQuestionsFromSession()} soal tersedia
              </p>
            )}
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="tw-py-4 tw-px-5">
        {error && (
          <Alert variant="danger" className="tw-text-center">
            {error}
          </Alert>
        )}

        {allDone && drillResult && (
          <>
            <Alert variant="success" className="tw-text-center tw-mb-4">
              <CheckCircle className="tw-text-green-600 tw-mb-2" size={32} />
              <div className="tw-font-bold tw-text-lg">Anda telah menyelesaikan semua soal drill ini! 🎉</div>
              <div className="tw-text-gray-700 tw-mt-2">
                Kamu sudah mengerjakan seluruh soal. Silakan tinjau skor, atau kembali ke materi untuk memperdalam pemahamanmu.
              </div>
            </Alert>
            <div className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-indigo-50 tw-p-5 tw-rounded-2xl tw-mb-5 tw-border tw-border-purple-200">
              <Row className="tw-items-center tw-mb-4">
                <Col md={3} className="tw-text-center tw-border-r tw-border-purple-200">
                  <div className="tw-text-3xl tw-font-bold tw-text-purple-800">
                    {drillResult.total_answered}
                  </div>
                  <p className="tw-text-gray-600 tw-mb-0 tw-text-sm">Soal Dikerjakan</p>
                </Col>
                <Col md={3} className="tw-text-center tw-border-r tw-border-purple-200">
                  <div className="tw-text-3xl tw-font-bold tw-text-green-600">
                    {drillResult.total_correct}
                  </div>
                  <p className="tw-text-gray-600 tw-mb-0 tw-text-sm">Jawaban Benar</p>
                </Col>
                <Col md={3} className="tw-text-center tw-border-r tw-border-purple-200">
                  <div className="tw-text-3xl tw-font-bold tw-text-blue-600">
                    {Math.round(drillResult.accuracy * 100)}%
                  </div>
                  <p className="tw-text-gray-600 tw-mb-0 tw-text-sm">Akurasi</p>
                </Col>
                <Col md={3} className="tw-text-center">
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-1 tw-text-orange-600">
                    <Clock size={20} />
                    <div className="tw-text-lg tw-font-bold">
                      {formatTime(drillResult.avg_elapsed_time)}
                    </div>
                  </div>
                  <p className="tw-text-gray-600 tw-mb-0 tw-text-sm">Rata-rata/Soal</p>
                </Col>
              </Row>
              <div className="tw-mt-4">
                <div className="tw-flex tw-justify-between tw-mb-1">
                  <span className="tw-text-sm tw-font-medium tw-text-purple-800">Tingkat Akurasi</span>
                  <span className="tw-text-sm tw-font-medium tw-text-purple-800">
                    {Math.round(drillResult.accuracy * 100)}%
                  </span>
                </div>
                <ProgressBar
                  variant={getAccuracyVariant(drillResult.accuracy)}
                  now={drillResult.accuracy * 100}
                  className="tw-h-3 tw-rounded-full"
                />
              </div>
            </div>
            <div className="tw-mb-5">
              <h4 className="tw-flex tw-items-center tw-gap-2 tw-text-purple-800 tw-font-bold tw-mb-4">
                <BarChart size={20} className="tw-text-indigo-600" />
                Distribusi Tingkat Kesulitan
              </h4>
              {drillResult.difficulty_distribution.map((difficulty, index) => {
                const percentage = difficulty.total > 0
                  ? Math.round((difficulty.correct / difficulty.total) * 100)
                  : 0;
                return (
                  <div key={index} className="tw-mb-4 tw-bg-white tw-p-3 tw-rounded-lg tw-border">
                    <div className="tw-flex tw-justify-between tw-mb-2">
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <Badge
                          pill
                          bg={getDifficultyColor(difficulty.level)}
                          className="tw-flex tw-items-center tw-gap-1"
                        >
                          <span>{difficulty.name}</span>
                          <Star size={12} />
                        </Badge>
                        <span className="tw-text-sm tw-font-medium tw-text-gray-700">
                          {difficulty.correct}/{difficulty.total} benar
                        </span>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-3">
                        <div className="tw-flex tw-items-center tw-gap-1 tw-text-orange-600">
                          <Clock size={14} />
                          <span className="tw-text-xs">
                            {formatTime(difficulty.avg_time)}
                          </span>
                        </div>
                        <span className="tw-text-sm tw-font-medium tw-text-gray-700">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <ProgressBar
                      variant={getDifficultyColor(difficulty.level)}
                      now={percentage}
                      className="tw-h-2.5 tw-rounded-full"
                    />
                  </div>
                );
              })}
            </div>
            <div className="tw-bg-yellow-50 tw-p-4 tw-rounded-xl tw-border tw-border-yellow-200">
              <div className="tw-flex tw-gap-3">
                {drillResult.accuracy >= 0.8 ? (
                  <>
                    <CheckCircle size={24} className="tw-text-green-500 tw-flex-shrink-0" />
                    <div>
                      <h5 className="tw-font-bold tw-text-green-800">Kerja Bagus! 🎉</h5>
                      <p className="tw-text-yellow-800 tw-mb-0">
                        Kamu menguasai sebagian besar materi. Pertahankan dan coba tantangan yang lebih sulit!
                      </p>
                    </div>
                  </>
                ) : drillResult.accuracy >= 0.6 ? (
                  <>
                    <TrendingUp size={24} className="tw-text-blue-500 tw-flex-shrink-0" />
                    <div>
                      <h5 className="tw-font-bold tw-text-blue-800">Cukup Baik! 👍</h5>
                      <p className="tw-text-yellow-800 tw-mb-0">
                        Pemahaman kamu sudah cukup bagus. Tingkatkan lagi dengan latihan yang lebih fokus.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle size={24} className="tw-text-red-500 tw-flex-shrink-0" />
                    <div>
                      <h5 className="tw-font-bold tw-text-red-800">Perlu Peningkatan! 💪</h5>
                      <p className="tw-text-yellow-800 tw-mb-0">
                        Beberapa materi perlu dipelajari lebih dalam. Tinjau kembali materi terkait dan coba lagi.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {!error && hasNotStarted && sessionData && !allDone && (
          <div className="tw-text-center tw-py-8">
            <div className="tw-bg-gradient-to-br tw-from-blue-50 tw-to-purple-50 tw-p-6 tw-rounded-2xl tw-mb-6">
              <Zap size={64} className="tw-text-blue-500 tw-mx-auto tw-mb-4" />
              <h4 className="tw-text-2xl tw-font-bold tw-text-blue-800 tw-mb-2">
                Siap Memulai Drill?
              </h4>
              <p className="tw-text-gray-600 tw-text-lg tw-mb-3">
                Kamu belum memulai drill latihan ini. Ayo mulai sekarang dan tingkatkan kemampuanmu!
              </p>
            </div>
            <div className="tw-bg-yellow-50 tw-p-4 tw-rounded-xl tw-border tw-border-yellow-200">
              <div className="tw-flex tw-gap-3">
                <Target size={24} className="tw-text-yellow-600 tw-flex-shrink-0" />
                <div className="tw-text-left">
                  <h5 className="tw-font-bold tw-text-yellow-800">Tips Sukses:</h5>
                  <ul className="tw-text-yellow-800 tw-text-sm tw-mb-0">
                    <li>Baca setiap soal dengan teliti</li>
                    <li>Kelola waktu dengan baik</li>
                    <li>Jangan ragu untuk mencoba jawaban terbaik</li>
                    <li>Evaluasi hasil untuk perbaikan selanjutnya</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {!error && drillResult && !hasNotStarted && !allDone && (
          <>
            <div className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-indigo-50 tw-p-5 tw-rounded-2xl tw-mb-5 tw-border tw-border-purple-200">
              <Row className="tw-items-center tw-mb-4">
                <Col md={3} className="tw-text-center tw-border-r tw-border-purple-200">
                  <div className="tw-text-3xl tw-font-bold tw-text-purple-800">
                    {drillResult.total_answered}
                  </div>
                  <p className="tw-text-gray-600 tw-mb-0 tw-text-sm">Soal Dikerjakan</p>
                </Col>
                <Col md={3} className="tw-text-center tw-border-r tw-border-purple-200">
                  <div className="tw-text-3xl tw-font-bold tw-text-green-600">
                    {drillResult.total_correct}
                  </div>
                  <p className="tw-text-gray-600 tw-mb-0 tw-text-sm">Jawaban Benar</p>
                </Col>
                <Col md={3} className="tw-text-center tw-border-r tw-border-purple-200">
                  <div className="tw-text-3xl tw-font-bold tw-text-blue-600">
                    {Math.round(drillResult.accuracy * 100)}%
                  </div>
                  <p className="tw-text-gray-600 tw-mb-0 tw-text-sm">Akurasi</p>
                </Col>
                <Col md={3} className="tw-text-center">
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-1 tw-text-orange-600">
                    <Clock size={20} />
                    <div className="tw-text-lg tw-font-bold">
                      {formatTime(drillResult.avg_elapsed_time)}
                    </div>
                  </div>
                  <p className="tw-text-gray-600 tw-mb-0 tw-text-sm">Rata-rata/Soal</p>
                </Col>
              </Row>
              <div className="tw-mt-4">
                <div className="tw-flex tw-justify-between tw-mb-1">
                  <span className="tw-text-sm tw-font-medium tw-text-purple-800">Tingkat Akurasi</span>
                  <span className="tw-text-sm tw-font-medium tw-text-purple-800">
                    {Math.round(drillResult.accuracy * 100)}%
                  </span>
                </div>
                <ProgressBar
                  variant={getAccuracyVariant(drillResult.accuracy)}
                  now={drillResult.accuracy * 100}
                  className="tw-h-3 tw-rounded-full"
                />
              </div>
            </div>
            <div className="tw-mb-5">
              <h4 className="tw-flex tw-items-center tw-gap-2 tw-text-purple-800 tw-font-bold tw-mb-4">
                <BarChart size={20} className="tw-text-indigo-600" />
                Distribusi Tingkat Kesulitan
              </h4>
              {drillResult.difficulty_distribution.map((difficulty, index) => {
                const percentage = difficulty.total > 0
                  ? Math.round((difficulty.correct / difficulty.total) * 100)
                  : 0;
                return (
                  <div key={index} className="tw-mb-4 tw-bg-white tw-p-3 tw-rounded-lg tw-border">
                    <div className="tw-flex tw-justify-between tw-mb-2">
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <Badge
                          pill
                          bg={getDifficultyColor(difficulty.level)}
                          className="tw-flex tw-items-center tw-gap-1"
                        >
                          <span>{difficulty.name}</span>
                          <Star size={12} />
                        </Badge>
                        <span className="tw-text-sm tw-font-medium tw-text-gray-700">
                          {difficulty.correct}/{difficulty.total} benar
                        </span>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-3">
                        <div className="tw-flex tw-items-center tw-gap-1 tw-text-orange-600">
                          <Clock size={14} />
                          <span className="tw-text-xs">
                            {formatTime(difficulty.avg_time)}
                          </span>
                        </div>
                        <span className="tw-text-sm tw-font-medium tw-text-gray-700">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <ProgressBar
                      variant={getDifficultyColor(difficulty.level)}
                      now={percentage}
                      className="tw-h-2.5 tw-rounded-full"
                    />
                  </div>
                );
              })}
            </div>
            {questionsLeft.length > 0 && (
              <div className="tw-bg-blue-50 tw-p-4 tw-rounded-xl tw-border tw-border-blue-200 tw-mb-4">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <Target size={20} className="tw-text-blue-600" />
                  <h5 className="tw-font-bold tw-text-blue-800 tw-mb-0">Progres Drill</h5>
                </div>
                <p className="tw-text-blue-700 tw-text-sm tw-mb-2">
                  {getTotalQuestionLeft()} soal tersisa dari {getTotalQuestionsFromSession()} total soal
                </p>
                <ProgressBar
                  variant="info"
                  now={((getTotalQuestionsFromSession() - getTotalQuestionLeft()) / getTotalQuestionsFromSession()) * 100}
                  className="tw-h-2.5 tw-rounded-full"
                />
              </div>
            )}
            <div className="tw-bg-yellow-50 tw-p-4 tw-rounded-xl tw-border tw-border-yellow-200">
              <div className="tw-flex tw-gap-3">
                {drillResult.accuracy >= 0.8 ? (
                  <>
                    <CheckCircle size={24} className="tw-text-green-500 tw-flex-shrink-0" />
                    <div>
                      <h5 className="tw-font-bold tw-text-green-800">Kerja Bagus! 🎉</h5>
                      <p className="tw-text-yellow-800 tw-mb-0">
                        Kamu menguasai sebagian besar materi. Pertahankan dan coba tantangan yang lebih sulit!
                      </p>
                    </div>
                  </>
                ) : drillResult.accuracy >= 0.6 ? (
                  <>
                    <TrendingUp size={24} className="tw-text-blue-500 tw-flex-shrink-0" />
                    <div>
                      <h5 className="tw-font-bold tw-text-blue-800">Cukup Baik! 👍</h5>
                      <p className="tw-text-yellow-800 tw-mb-0">
                        Pemahaman kamu sudah cukup bagus. Tingkatkan lagi dengan latihan yang lebih fokus.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle size={24} className="tw-text-red-500 tw-flex-shrink-0" />
                    <div>
                      <h5 className="tw-font-bold tw-text-red-800">Perlu Peningkatan! 💪</h5>
                      <p className="tw-text-yellow-800 tw-mb-0">
                        Beberapa materi perlu dipelajari lebih dalam. Tinjau kembali materi terkait dan coba lagi.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {verifikasiError && (
          <Alert variant="danger" className="tw-text-center tw-mt-3">
            {verifikasiError}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer className="tw-bg-gray-50 tw-justify-between">
        <Button
          variant="outline-secondary"
          onClick={onClose}
          className="tw-px-4 tw-py-2 tw-rounded-lg"
        >
          Tutup
        </Button>
        {/* Tombol "Tinjau Materi" tetap ada, tombol lanjutkan/mulai drill hanya muncul jika belum allDone */}
        {(!allDone && hasNotStarted && sessionData) && (
          <Button
            variant="primary"
            disabled={loading || !verifikasiSession}
            onClick={handleStartOrContinue}
            className="tw-flex tw-items-center tw-gap-2 tw-px-6 tw-py-2 tw-rounded-lg tw-bg-gradient-to-r tw-from-blue-600 tw-to-purple-600"
          >
            <Zap size={18} />
            Mulai Drill ({getTotalQuestionsFromSession()} soal)
          </Button>
        )}
        {(!allDone && drillResult && sessionData && !hasNotStarted) && (
          <div className="tw-flex tw-gap-2">
            <Button
              variant="outline-primary"
              className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg"
            >
              <BookOpen size={18} />
              Tinjau Materi
            </Button>
            <Button
              variant="primary"
              onClick={handleStartOrContinue}
              disabled={loading || !verifikasiSession}
              className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600"
            >
              Lanjutkan
              <ChevronRight size={18} />
            </Button>
          </div>
        )}
        {/* allDone: hanya "Tinjau Materi" */}
        {allDone && (
          <Button
            variant="outline-primary"
            className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg"
          >
            <BookOpen size={18} />
            Tinjau Materi
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default DrillModal;