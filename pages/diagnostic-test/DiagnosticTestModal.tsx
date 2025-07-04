// components/DiagnosticTestModal.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import { AlertCircle, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface DiagnosticTestModalProps {
  show: boolean;
  onClose: () => void;
}

const DiagnosticTestModal: React.FC<DiagnosticTestModalProps> = ({
  show,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verified, setVerified] = useState<any>(null);
  const [examId, setExamId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    setFetchError(null);
    setData(null);
    setVerified(null);
    setVerifyError(null);
    setExamId(null);

    const authToken = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;

    fetch(`${API_URL}/exam-schedules/99`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        if (json.exam_id_list && json.exam_id_list.length > 0) {
          setExamId(json.exam_id_list[0]);
          setVerifying(true);
          return fetch(`${API_URL}/examSession/verifikasi`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              schedule_id: 99,
              exam_id: json.exam_id_list[0],
              question_left: 999999,
              session_id: null,
            }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Verifikasi gagal: ${res.status}`);
            return res.json();
          });
        } else {
          throw new Error("Exam tidak ditemukan pada jadwal ini.");
        }
      })
      .then((verifyRes) => {
        if (verifyRes) setVerified(verifyRes);
      })
      .catch((err) => {
        if (!data) setFetchError(err.message || "Terjadi error");
        else setVerifyError(err.message || "Verifikasi gagal");
      })
      .finally(() => {
        setLoading(false);
        setVerifying(false);
      });
    // eslint-disable-next-line
  }, [show]);

  const handleStart = () => {
    if (!verified) return;
    const exam_string = verified.data.exam_string;
    const session_id = verified.data.id;
    
    // Navigate with query parameters instead of state
    router.push({
      pathname: `/diagnostic-test/exam/${exam_string}`,
      query: {
        exam_id: examId,
        schedule_id: 99,
        session_id: session_id,
      },
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <div className="tw-bg-gradient-to-br tw-from-violet-100 tw-to-white tw-p-2 tw-rounded-2xl">
        <Modal.Header closeButton className="tw-border-0 tw-bg-transparent">
          <Modal.Title className="tw-font-bold tw-text-violet-700">
            Quantitative Reasoning - Info Tes
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="tw-px-4 tw-pb-4">
          {(loading || verifying) && (
            <div className="tw-flex tw-justify-center tw-items-center tw-gap-2 tw-mt-2 tw-mb-3">
              <Spinner animation="border" size="sm" className="tw-text-violet-600" />
              <span className="tw-text-violet-700 tw-font-semibold">
                {loading
                  ? "Memuat data tes..."
                  : "Memverifikasi sesi..."}
              </span>
            </div>
          )}
          {fetchError && (
            <Alert variant="danger" className="tw-flex tw-items-center tw-gap-2 tw-mt-2">
              <AlertCircle className="tw-w-5 tw-h-5" /> {fetchError}
            </Alert>
          )}
          {data && !loading && (
            <div className="tw-bg-violet-50 tw-rounded-xl tw-p-4 tw-shadow tw-text-violet-800 tw-mb-2 tw-text-sm">
              <div className="tw-font-bold tw-mb-1">
                {data.name || "Tes Diagnostic"}
              </div>
              <div className="tw-mb-1">
                <span className="tw-font-semibold">Exam ID:</span>{" "}
                {Array.isArray(data.exam_id_list) ? data.exam_id_list[0] : "-"}
              </div>
              <div className="tw-mb-1">
                <span className="tw-font-semibold">Keterangan:</span>{" "}
                {data.description || <span className="tw-text-gray-400">-</span>}
              </div>
              <div className="tw-text-xs tw-mt-2 tw-text-gray-400">(Lihat console untuk output penuh)</div>
            </div>
          )}
          {verifyError && (
            <Alert variant="danger" className="tw-flex tw-items-center tw-gap-2 tw-mt-2">
              <AlertCircle className="tw-w-5 tw-h-5" /> {verifyError}
            </Alert>
          )}
          {verified && !verifying && (
            <Alert variant="success" className="tw-flex tw-items-center tw-gap-2 tw-mt-2">
              <Loader2 className="tw-w-5 tw-h-5 tw-animate-spin" />
              Sesi terverifikasi, siap mulai!
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="tw-bg-transparent tw-border-0 tw-flex tw-justify-end">
          <Button
            className="tw-bg-violet-600 tw-border-0 tw-font-bold tw-rounded-xl hover:tw-bg-violet-700 tw-mr-2"
            onClick={onClose}
            disabled={loading || verifying}
          >
            Tutup
          </Button>
          <Button
            className="tw-bg-violet-700 tw-border-0 tw-font-bold tw-rounded-xl hover:tw-bg-violet-800"
            onClick={handleStart}
            disabled={!verified || loading || verifying}
          >
            Mulai Tes
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default DiagnosticTestModal;