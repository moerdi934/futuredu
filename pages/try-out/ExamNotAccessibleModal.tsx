'use client';

import { useEffect, useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

interface Props {
  show: boolean;
  startTime: string;
  onRetry: () => void;
}

export default function ExamNotAccessibleModal({
  show,
  startTime,
  onRetry,
}: Props) {
  const [count, setCount]     = useState('');
  const [refresh, setRefresh] = useState(false);

  /* hitung mundur */
  useEffect(() => {
    if (!show) return;
    const id = setInterval(() => {
      const now   = Date.now();
      const start = new Date(startTime).getTime();
      const diff  = start - now;
      if (diff <= 0) {
        setCount('00:00:00');
        clearInterval(id);
      } else {
        const h = Math.floor(diff / 3_600_000)
          .toString()
          .padStart(2, '0');
        const m = Math.floor((diff % 3_600_000) / 60_000)
          .toString()
          .padStart(2, '0');
        const s = Math.floor((diff % 60_000) / 1_000)
          .toString()
          .padStart(2, '0');
        setCount(`${h}:${m}:${s}`);
      }
    }, 1_000);
    return () => clearInterval(id);
  }, [show, startTime]);

  return (
    <Modal show={show} backdrop="static" centered>
      <Modal.Header className="tw-bg-purple-700 tw-text-white">
        <Modal.Title>Ujian Belum Dibuka</Modal.Title>
      </Modal.Header>

      <Modal.Body className="tw-text-center tw-space-y-4">
        <p>Ujian baru bisa diakses pada:</p>
        <p className="tw-font-bold">
          {new Date(startTime).toLocaleString('id-ID')}
        </p>
        <div className="tw-text-2xl tw-font-mono">{count}</div>
      </Modal.Body>

      <Modal.Footer>
        <Button
          className="tw-w-full tw-bg-purple-700 hover:tw-bg-purple-800"
          disabled={refresh}
          onClick={() => {
            setRefresh(true);
            onRetry();
            setTimeout(() => setRefresh(false), 1_500);
          }}
        >
          {refresh && (
            <Spinner animation="border" role="status" size="sm" className="tw-mr-2" />
          )}
          Coba Lagi
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
