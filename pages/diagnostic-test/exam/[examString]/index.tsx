'use client'
// pages/diagnostic-test/exam/[examString].tsx
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
// import { openDB } from "idb";
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

/* ───────────── IndexedDB helpers ───────────── */
/* ───────────── Ganti helper … ───────────── */
async function getDB() {
  // 1) Skip di server (build/SSR)
  if (typeof window === 'undefined') {
    // kembalikan _stub_ agar pemanggil tidak error
    return {
      put:    async () => undefined,
      getAll: async () => [],
      clear:  async () => undefined,
    } as const;
  }

  // 2) Import `idb` hanya di browser
  const { openDB } = await import('idb');   // <─ dynamic import
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('answers')) {
        db.createObjectStore('answers', { keyPath: 'question_id' });
      }
    },
  });
}

/* ───────────── Encryption helpers ───────────── */
function decryptData(encryptedData: string) {
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

interface Question {
  id: number;
  type: string;
  question: string;
  options?: string[];
  statements?: string[];
}

const DiagnosticTest = () => {
  const router = useRouter();
  const { examString } = router.query;
  
  // Get state from router (passed from modal)
  const state = router.query || {};

  /* ───────────── Fetch state ───────────── */
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examName, setExamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /* ───────────── Working-session state ───────────── */
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState<any>(null);
  const [elapsedPerSoal, setElapsedPerSoal] = useState(0);
  const [timer, setTimer] = useState(TOTAL_DURATION_SECONDS);
  const [submitLoading, setSubmitLoading] = useState(false);

  /* ───────────── Submit-score state ───────────── */
  const [savingScore, setSavingScore] = useState(false);
  const [finishModal, setFinishModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* ───────────── Refs ───────────── */
  const intervalRef = useRef<NodeJS.Timeout>();
  const soalStartTime = useRef(Date.now());

  /* ───────────── Fetch & decrypt ───────────── */
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

  /* ───────────── Timer global ───────────── */
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          handleFinish(true); // true ⇒ dipicu timer
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []); // sekali saja

  /* ───────────── Timer per-soal ───────────── */
  useEffect(() => {
    const perSoalInterval = setInterval(() => {
      setElapsedPerSoal(Math.floor((Date.now() - soalStartTime.current) / 1000));
    }, 1000);
    return () => clearInterval(perSoalInterval);
  }, [currentIdx]);

  /* ───────────── IndexedDB utils ───────────── */
  function getInitialAnswer(question: Question) {
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

  const saveAnswerToIDB = async (payload: any) => {
    try {
      const db = await getDB();
      await db.put("answers", payload);
    } catch (_) {}
  };

  const getAllAnswersFromIDB = async () => {
    const db = await getDB();
    return db.getAll("answers");
  };

  const clearIDB = async () => {
    const db = await getDB();
    await db.clear("answers");
  };

  /* ───────────── Answer helpers ───────────── */
  const handleChange = (value: any) => setAnswer(value);

  const handleTrueFalseChange = (idx: number, val: any) => {
    const updated = [...(answer || [])];
    updated[idx] = val;
    setAnswer(updated);
  };

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function isAnswerFilled() {
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
  const handleNextOrFinish = async () => {
    if (!questions.length) return;
    setSubmitLoading(true);
    clearInterval(intervalRef.current);

    // simpan current answer
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
      // lanjut soal berikut
      setCurrentIdx(currentIdx + 1);
      // restart timer
      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleFinish(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      await handleFinish(false);
    }

    setSubmitLoading(false);
  };

  /* ───────────── Submit skor ke server ───────────── */
  const handleFinish = async (autoFromTimer = false) => {
    try {
      setSavingScore(true);
      clearInterval(intervalRef.current);

      // jika dipicu timer, simpan jawaban terakhir (bila terisi)
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
      setFinishModal(true);
    } catch (err: any) {
      setSubmitError(err.message || "Terjadi kesalahan saat submit skor.");
    } finally {
      setSavingScore(false);
    }
  };

  const handleBackToDashboard = () => router.push("/dashboard");

  /* ───────────── Render helpers ───────────── */
  function renderQuestion(q: Question) {
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
  if (loading) {
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

  /* ───────────── Success modal setelah submit ───────────── */
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