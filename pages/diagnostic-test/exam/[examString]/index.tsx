'use client'
// pages/diagnostic-test/exam/[examString].tsx
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import CryptoJS from "crypto-js";
import dynamic from "next/dynamic";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Modal,
} from "react-bootstrap";
import { Clock, Loader2, Check, Home, AlertCircle } from "lucide-react";

// Dynamic imports for CSR components
const SingleChoice = dynamic(() => import("../../../exam/SingleChoice"), { ssr: false });
const MultipleChoice = dynamic(() => import("../../../exam/MultipleChoice"), { ssr: false });
const NumberInput = dynamic(() => import("../../../exam/NumberInput"), { ssr: false });
const TextInput = dynamic(() => import("../../../exam/TextInput"), { ssr: false });
const TrueFalse = dynamic(() => import("../../../exam/TrueFalse"), { ssr: false });
const Latex = dynamic(() => import("react-latex-next"), { ssr: false });

const TOTAL_DURATION_SECONDS = 10 * 60; // 10 menit
const DB_NAME = "diagnostic-test-db-v2";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/* ───────────── Types ───────────── */
interface Question {
  id: number;
  type: string;
  question: string;
  options?: string[];
  statements?: string[];
}

interface TimerData {
  s: string;
  e: string;
  d: string;
  v: string;
}

interface WorkerMessage {
  type: 'store' | 'tick' | 'timeout' | 'restored' | 'invalid';
  remaining?: number;
  elapsed?: number;
  data?: TimerData;
}

interface ExamState {
  exam_id?: string | number;
  schedule_id?: string | number;
  session_id?: string | number;
  user_id?: string | number;
}

/* ───────────── IndexedDB helpers ───────────── */
async function getDB() {
  // Skip di server (build/SSR)
  if (typeof window === 'undefined') {
    return {
      put: async () => undefined,
      getAll: async () => [],
      clear: async () => undefined,
    } as const;
  }

  // Import `idb` hanya di browser
  const { openDB } = await import('idb');
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('answers')) {
        db.createObjectStore('answers', { keyPath: 'question_id' });
      }
    },
  });
}

/* ───────────── Encryption helpers ───────────── */
function decryptData(encryptedData: string): string {
  try {
    const [ivHex, encrypted] = encryptedData.split(":");
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encryptionKeyString = process.env.NEXT_PUBLIC_EXAM_ENCRYPTION_KEY;
    if (!encryptionKeyString) throw new Error("Encryption key not found");

    const key =
      encryptionKeyString.length >= 32
        ? CryptoJS.enc.Utf8.parse(encryptionKeyString.substring(0, 32))
        : CryptoJS.enc.Utf8.parse(encryptionKeyString.padEnd(32, "0"));

    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    throw new Error("Gagal dekripsi data soal");
  }
}

const DiagnosticTest: React.FC = () => {
  const router = useRouter();
  const { examString } = router.query;
  
  // Get state from router (passed from modal)
  const state: ExamState = router.query || {};

  /* ───────────── Fetch state ───────────── */
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examName, setExamName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /* ───────────── Working-session state ───────────── */
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answer, setAnswer] = useState<any>(null);
  const [elapsedPerSoal, setElapsedPerSoal] = useState<number>(0);
  const [timer, setTimer] = useState<number>(TOTAL_DURATION_SECONDS);
  const [timerLoaded, setTimerLoaded] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  /* ───────────── Submit-score state ───────────── */
  const [savingScore, setSavingScore] = useState<boolean>(false);
  const [finishModal, setFinishModal] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* ───────────── Timer refs ───────────── */
  const workerRef = useRef<Worker | null>(null);
  const sessionKeyRef = useRef<string>('');
  const soalStartTime = useRef<number>(Date.now());
  const fallbackInterval = useRef<NodeJS.Timeout | null>(null);

  /* ───────────── Generate unique session key ───────────── */
  useEffect(() => {
    if (!sessionKeyRef.current) {
      const examId = state.exam_id?.toString() || 'unknown';
      const userId = state.user_id?.toString() || 'anonymous'; 
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2);
      
      sessionKeyRef.current = CryptoJS.MD5(examId + userId + timestamp + random).toString();
    }
  }, [state.exam_id, state.user_id]);

  /* ───────────── Initialize Secure Timer ───────────── */
  useEffect(() => {
    if (!sessionKeyRef.current) return;
    
    // Fallback timer function
    const startFallbackTimer = () => {
      const startTime = Date.now();
      fallbackInterval.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, TOTAL_DURATION_SECONDS - elapsed);
        setTimer(remaining);
        
        if (remaining <= 0) {
          if (fallbackInterval.current) {
            clearInterval(fallbackInterval.current);
          }
          handleFinish(true);
        }
      }, 1000);
      
      setTimerLoaded(true);
    };

    // Try Web Worker first
    if (typeof Worker !== 'undefined') {
      try {
        workerRef.current = new Worker('/secure-exam-timer.js');
        
        workerRef.current.onmessage = function(e: MessageEvent<WorkerMessage>) {
          const { type, remaining, data } = e.data;
          
          switch (type) {
            case 'store':
              if (data) {
                sessionStorage.setItem('_examTimer', JSON.stringify(data));
              }
              setTimerLoaded(true);
              break;
              
            case 'tick':
              if (typeof remaining === 'number') {
                setTimer(remaining);
              }
              break;
              
            case 'timeout':
              sessionStorage.removeItem('_examTimer');
              handleFinish(true);
              break;
              
            case 'restored':
              if (typeof remaining === 'number') {
                setTimer(remaining);
              }
              setTimerLoaded(true);
              console.log('Timer restored successfully');
              break;
              
            case 'invalid':
              console.log('Invalid timer data, starting fresh');
              sessionStorage.removeItem('_examTimer');
              startFreshTimer();
              break;
          }
        };

        workerRef.current.onerror = function(error) {
          console.error('Web Worker error:', error);
          startFallbackTimer();
        };
        
        // Check for existing timer
        const storedTimer = sessionStorage.getItem('_examTimer');
        if (storedTimer) {
          try {
            const parsed: TimerData = JSON.parse(storedTimer);
            workerRef.current.postMessage({
              action: 'restore',
              payload: {
                stored: parsed,
                sessionKey: sessionKeyRef.current
              }
            });
          } catch {
            startFreshTimer();
          }
        } else {
          startFreshTimer();
        }
      } catch (error) {
        console.error('Failed to create Web Worker, using fallback:', error);
        startFallbackTimer();
      }
    } else {
      console.log('Web Worker not supported, using fallback timer');
      startFallbackTimer();
    }
    
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ action: 'stop' });
        workerRef.current.terminate();
      }
      if (fallbackInterval.current) {
        clearInterval(fallbackInterval.current);
      }
    };
  }, [sessionKeyRef.current]);

  const startFreshTimer = () => {
    if (workerRef.current && sessionKeyRef.current) {
      workerRef.current.postMessage({
        action: 'start',
        payload: {
          duration: TOTAL_DURATION_SECONDS,
          sessionKey: sessionKeyRef.current
        }
      });
    }
  };

  /* ───────────── Fetch & decrypt questions ───────────── */
  useEffect(() => {
    if (!router.isReady || !examString) return;
    
    let ignore = false;
    setLoading(true);
    setFetchError(null);

    const authToken = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;

    fetch(
      `${API_URL}/questions/diagnostic/byExamString?exam_string=${examString}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil soal. Status: " + res.status);
        return res.json();
      })
      .then((data) => {
        const decrypted = decryptData(data.encryptedData);
        console.log("Decrypted payload:", decrypted);
        const parsed = JSON.parse(decrypted);
        if (!ignore) {
          setQuestions(parsed.questions || []);
          setExamName(parsed.name || "Diagnostic Reasoning");
        }
      })
      .catch((err) => setFetchError(err.message || "Terjadi error"))
      .finally(() => setLoading(false));

    return () => {
      ignore = true;
    };
  }, [router.isReady, examString]);

  /* ───────────── Per-soal setup ───────────── */
  useEffect(() => {
    if (!questions.length) return;
    setAnswer(getInitialAnswer(questions[currentIdx]));
    setElapsedPerSoal(0);
    soalStartTime.current = Date.now();
  }, [currentIdx, questions]);

  /* ───────────── Timer per-soal ───────────── */
  useEffect(() => {
    const perSoalInterval = setInterval(() => {
      setElapsedPerSoal(Math.floor((Date.now() - soalStartTime.current) / 1000));
    }, 1000);
    return () => clearInterval(perSoalInterval);
  }, [currentIdx]);

  /* ───────────── IndexedDB utils ───────────── */
  function getInitialAnswer(question: Question): any {
    if (!question) return null;
    switch (question.type) {
      case "single-choice":
        return "";
      case "multiple-choice":
        return [];
      case "number":
        return undefined;
      case "text":
        return "";
      case "true-false":
        return Array((question.statements || []).length).fill(undefined);
      default:
        return null;
    }
  }

  const saveAnswerToIDB = async (payload: any): Promise<void> => {
    try {
      const db = await getDB();
      await db.put("answers", payload);
    } catch (_) {
      // Silent fail
    }
  };

  const getAllAnswersFromIDB = async (): Promise<any[]> => {
    const db = await getDB();
    return db.getAll("answers");
  };

  const clearIDB = async (): Promise<void> => {
    const db = await getDB();
    await db.clear("answers");
  };

  /* ───────────── Answer helpers ───────────── */
  const handleChange = (value: any): void => setAnswer(value);

  const handleTrueFalseChange = (idx: number, val: any): void => {
    const updated = [...(answer || [])];
    updated[idx] = val;
    setAnswer(updated);
  };

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function isAnswerFilled(): boolean {
    const q = questions[currentIdx];
    if (!q) return false;
    switch (q.type) {
      case "single-choice":
        return answer !== "";
      case "multiple-choice":
        return Array.isArray(answer) && answer.length > 0;
      case "number":
        return typeof answer === "number" && !isNaN(answer);
      case "text":
        return answer !== "";
      case "true-false":
        return Array.isArray(answer) && answer.every((a: any) => a !== undefined);
      default:
        return false;
    }
  }

  /* ───────────── Navigation ───────────── */
  const handleNextOrFinish = async (): Promise<void> => {
    if (!questions.length) return;
    setSubmitLoading(true);

    // Save current answer
    await saveAnswerToIDB({
      question_id: questions[currentIdx].id,
      exam_id: state.exam_id,
      exam_schedule_id: state.schedule_id,
      session_id: state.session_id,
      user_answer: answer,
      answer_time: new Date().toISOString(),
      elapsed_time: elapsedPerSoal,
    });

    if (currentIdx < questions.length - 1 && timer > 0) {
      // Go to next question
      setCurrentIdx(currentIdx + 1);
    } else {
      await handleFinish(false);
    }

    setSubmitLoading(false);
  };

  /* ───────────── Submit score to server ───────────── */
  const handleFinish = async (autoFromTimer: boolean = false): Promise<void> => {
    try {
      setSavingScore(true);
      
      // Stop timer
      if (workerRef.current) {
        workerRef.current.postMessage({ action: 'stop' });
      }
      if (fallbackInterval.current) {
        clearInterval(fallbackInterval.current);
      }

      // If triggered by timer, save last answer if filled
      if (autoFromTimer && isAnswerFilled()) {
        await saveAnswerToIDB({
          question_id: questions[currentIdx].id,
          exam_id: state.exam_id,
          exam_schedule_id: state.schedule_id,
          session_id: state.session_id,
          user_answer: answer,
          answer_time: new Date().toISOString(),
          elapsed_time: elapsedPerSoal,
        });
      }

      const allAnswers = await getAllAnswersFromIDB();
      const answersPayload = allAnswers.map((a: any) => ({
        question_id: a.question_id,
        user_answer: a.user_answer,
        elapsed_time: a.elapsed_time,
      }));

      const authToken = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
      const res = await fetch(
        `${API_URL}/score/diagnostic/${state.exam_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ answers: answersPayload }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Gagal submit skor");
      }

      await clearIDB();
      sessionStorage.removeItem('_examTimer');
      setFinishModal(true);
    } catch (err: any) {
      setSubmitError(err.message || "Terjadi kesalahan saat submit skor.");
    } finally {
      setSavingScore(false);
    }
  };

  const handleBackToDashboard = (): void => {
    router.push("/dashboard");
  };

  /* ───────────── Render helpers ───────────── */
  function renderQuestion(q: Question): React.ReactNode {
    if (!q || answer === null) return null;
    switch (q.type) {
      case "single-choice":
        return (
          <SingleChoice
            question={<Latex>{q.question}</Latex>}
            options={q.options || []}
            onChange={handleChange}
            selectedAnswers={answer}
          />
        );
      case "multiple-choice":
        return (
          <MultipleChoice
            question={<Latex>{q.question}</Latex>}
            options={q.options || []}
            selectedAnswers={answer}
            onChange={handleChange}
          />
        );
      case "number":
        return (
          <NumberInput
            question={q.question}
            onChange={handleChange}
            value={answer}
          />
        );
      case "text":
        return (
          <TextInput
            question={q.question}
            onChange={handleChange}
            value={answer}
          />
        );
      case "true-false":
        return (
          <TrueFalse
            question={q.question}
            statements={q.statements || []}
            selectedAnswers={answer}
            onChange={handleTrueFalseChange}
          />
        );
      default:
        return null;
    }
  }

  /* ───────────── UI Loading/Error ───────────── */
  if (loading || !timerLoaded) {
    return (
      <>
        <Head>
          <title>Loading Diagnostic Test - Platform Pembelajaran</title>
        </Head>
        <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
          <div className="tw-text-center">
            <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto tw-mb-4" />
            <h2 className="tw-text-xl tw-font-semibold tw-text-violet-800">
              Memuat Tes Diagnostic...
            </h2>
            <p className="tw-text-violet-600 tw-mt-2">
              Tunggu sebentar, soal sedang disiapkan
            </p>
          </div>
        </div>
      </>
    );
  }

  if (fetchError) {
    return (
      <>
        <Head>
          <title>Error - Diagnostic Test</title>
        </Head>
        <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
          <Container>
            <Row className="tw-justify-center">
              <Col md={6}>
                <Card className="tw-shadow-lg tw-border-0 tw-rounded-xl">
                  <Card.Body className="tw-text-center tw-py-8">
                    <AlertCircle className="tw-h-16 tw-w-16 tw-text-red-500 tw-mx-auto tw-mb-4" />
                    <h2 className="tw-text-xl tw-font-semibold tw-text-red-800 tw-mb-3">
                      Terjadi Kesalahan
                    </h2>
                    <p className="tw-text-red-600 tw-mb-6">{fetchError}</p>
                    <Button
                      className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center tw-mx-auto"
                      onClick={handleBackToDashboard}
                    >
                      <Home className="tw-mr-2" size={16} />
                      Kembali ke Dashboard
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </>
    );
  }

  /* ───────────── Success modal after submit ───────────── */
  if (finishModal) {
    return (
      <>
        <Head>
          <title>Test Completed - Diagnostic Test</title>
        </Head>
        <div className="tw-min-h-screen tw-bg-violet-50 tw-flex tw-items-center tw-justify-center">
          <Container>
            <Row className="tw-justify-center">
              <Col md={6}>
                <Card className="tw-shadow-lg tw-border-0 tw-rounded-xl">
                  <Card.Body className="tw-text-center tw-py-8">
                    <Check className="tw-h-16 tw-w-16 tw-text-green-500 tw-mx-auto tw-mb-4" />
                    <h2 className="tw-text-2xl tw-font-bold tw-text-green-800 tw-mb-3">
                      Tes Selesai!
                    </h2>
                    <p className="tw-text-green-600 tw-mb-6">
                      Jawaban & skor berhasil disimpan.
                      <br />
                      Terima kasih telah mengerjakan diagnostic test ini.
                    </p>
                    <Button
                      className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center tw-mx-auto"
                      onClick={handleBackToDashboard}
                    >
                      <Home className="tw-mr-2" size={16} />
                      Kembali ke Dashboard
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </>
    );
  }

  /* ───────────── Main render ───────────── */
  return (
    <>
      <Head>
        <title>{examName} - Diagnostic Test</title>
        <meta name="description" content="Sedang mengerjakan tes diagnostik" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="tw-min-h-screen tw-bg-violet-50">
        {/* Modal "sedang menyimpan jawaban" */}
        <Modal
          show={savingScore}
          backdrop="static"
          keyboard={false}
          centered
          contentClassName="tw-rounded-xl"
        >
          <Modal.Body className="tw-text-center tw-py-8">
            <Loader2 className="tw-h-12 tw-w-12 tw-animate-spin tw-text-violet-600 tw-mx-auto mb-4" />
            <h4 className="tw-font-semibold tw-text-violet-800 tw-mb-2">
              Menyimpan jawaban...
            </h4>
            <p className="tw-text-violet-600">
              Jangan tutup halaman ini hingga proses selesai.
            </p>
            {submitError && (
              <p className="tw-text-red-500 tw-mt-2">{submitError}</p>
            )}
          </Modal.Body>
        </Modal>

        {/* Header */}
        <div className="tw-bg-violet-600 tw-text-white tw-py-4 tw-shadow-lg tw-mb-6">
          <Container>
            <div className="tw-flex tw-justify-between tw-items-center">
              {/* Title & progress */}
              <div className="tw-flex-1 tw-min-w-0">
                <h1 className="tw-text-2xl tw-font-bold tw-mb-1 tw-break-words tw-pr-4">
                  {examName}
                </h1>
                <p className="tw-text-sm tw-text-violet-200">
                  Soal {currentIdx + 1} dari {questions.length}
                </p>
                <div className="tw-w-full tw-bg-violet-700 tw-rounded-full tw-h-2 tw-mt-2">
                  <div
                    className="tw-bg-violet-300 tw-h-2 tw-rounded-full tw-transition-all tw-duration-300"
                    style={{
                      width: `${((currentIdx + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Timer */}
              <div className="tw-flex tw-items-center tw-gap-3 tw-bg-violet-700 tw-rounded-lg tw-px-6 tw-py-3 tw-flex-shrink-0">
                <Clock size={28} className="tw-text-violet-200" />
                <div className="tw-flex tw-flex-col tw-items-start">
                  <span className="tw-text-violet-200 tw-text-sm">Sisa Waktu</span>
                  <span
                    className={`tw-text-3xl tw-font-mono tw-font-bold ${
                      timer < 30 ? "tw-text-red-400" : ""
                    }`}
                  >
                    {formatTime(timer)}
                  </span>
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* Question card */}
        <Container className="tw-mb-8">
          <Row className="tw-justify-center">
            <Col lg={8}>
              <Card className="tw-shadow-md tw-border-0 tw-rounded-xl">
                <Card.Body className="tw-p-6">
                  {questions.length > 0 && renderQuestion(questions[currentIdx])}

                  <div className="tw-flex tw-justify-center tw-mt-8">
                    <Button
                      className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-px-8"
                      onClick={handleNextOrFinish}
                      disabled={!isAnswerFilled() || submitLoading}
                    >
                      {submitLoading ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="tw-mr-2"
                          />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          {currentIdx === questions.length - 1
                            ? "Akhiri Tes"
                            : "Next"}
                        </>
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default DiagnosticTest;