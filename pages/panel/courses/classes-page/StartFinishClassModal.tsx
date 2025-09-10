// pages/panel/courses/classes-page/StartFinishClassModal.tsx

import React, { useState, useEffect } from 'react';
import { Form, Alert, Card } from 'react-bootstrap';
import { FaPlay, FaStop, FaDownload } from 'react-icons/fa';
import { Play, Square, QrCode } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';
import { LearningModal } from '../../../../components/modal/ModalTemplate';
import { ButtonGradient } from '../../../../components/button/ButtonTemplate';

interface ClassData {
  id: number;
  event_id: number;
  starter_user_id: number;
  name: string;
  course_name: string;
  description: string;
  teacher_name: string;
  student_list_names: string[];
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface StartFinishClassModalProps {
  show: boolean;
  handleClose: () => void;
  classData: ClassData;
  onStatusChange?: () => void;
}

const StartFinishClassModal: React.FC<StartFinishClassModalProps> = ({
  show,
  handleClose,
  classData,
  onStatusChange,
}) => {
  const { id: currentUserId } = useAuth();
  const [notes, setNotes] = useState('');
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingFinish, setLoadingFinish] = useState(false);
  const [errorStart, setErrorStart] = useState<string | null>(null);
  const [errorFinish, setErrorFinish] = useState<string | null>(null);

  // Data QR yang didapat dari response
  const [qrDataStart, setQrDataStart] = useState<{
    qrImage: string;
    token: string;
    expiration_time: string;
  } | null>(null);

  const [qrDataFinish, setQrDataFinish] = useState<{
    qrImage: string;
    token: string;
    expiration_time: string;
  } | null>(null);

  // Apakah hendak menampilkan QR di UI?
  const [showQrCode, setShowQrCode] = useState(false);

  // API URL dari environment variable
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const {
    id,
    event_id,
    name,
    course_name,
    description,
    teacher_name,
    student_list_names,
    date,
    start_time,
    end_time,
    status,
  } = classData;

  const [isStarted, setIsStarted] = useState(status === 'Started');
  const [isFinished, setIsFinished] = useState(status === 'Finished');

  // Cek apakah kelas sudah dimulai atau selesai
  useEffect(() => {
    if (status === 'Started') {
      fetchQRCodeStart();
    } else if (status === 'Finished') {
      fetchQRCodeFinish();
    }
  }, [status]);

  // Handler untuk klik Start
  const handleStartClass = async () => {
    setErrorStart(null);
    const confirmed = window.confirm('Anda yakin ingin memulai kelas ini?');
    if (!confirmed) return;

    setLoadingStart(true);

    // Ambil geolocation
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          // Buat payload
          const payload = {
            eventid: event_id,
            latitude,
            longitude,
            notes,
          };

          // Ambil token dari localStorage
          const token = localStorage.getItem('authToken');

          const response = await axios.post(
            `${apiUrl}/sessions`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Update status kelas
          setIsStarted(true);
          setLoadingStart(false);

          alert('Kelas berhasil dimulai!');
          fetchQRCodeStart(); // Fetch QR Code untuk kelas yang telah dimulai
          onStatusChange?.(); // Notify parent component
        } catch (err: any) {
          console.error(err);
          setErrorStart(
            err.response?.data?.message ||
              'Terjadi kesalahan saat memulai sesi kelas.'
          );
          setLoadingStart(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setErrorStart('Gagal mendapatkan lokasi GPS. Ijinkan akses lokasi!');
        setLoadingStart(false);
      }
    );
  };

  // Fetch QR Code Data setelah kelas dimulai
  const fetchQRCodeStart = async () => {
    setLoadingStart(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${apiUrl}/code-attendance/check-and-generate-from-event/${event_id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { qrImage, token: qrToken, expiration_time } = response.data;
      
      setQrDataStart({
        qrImage,
        token: qrToken,
        expiration_time: convertToLocalTime(expiration_time),
      });
      setLoadingStart(false);
    } catch (err: any) {
      console.error('Error fetching QR Code:', err);
      setErrorStart(
        err.response?.data?.message || 'Gagal mengambil QR Code'
      );
      setLoadingStart(false);
    }
  };

  // Fetch QR Code Data setelah kelas selesai
  const fetchQRCodeFinish = async () => {
    setLoadingFinish(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${apiUrl}/code-attendance/check-and-generate-from-event/${event_id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { qrImage, token: qrToken, expiration_time } = response.data;
      
      setQrDataFinish({
        qrImage,
        token: qrToken,
        expiration_time: convertToLocalTime(expiration_time),
      });
      setQrDataStart(null);
      setLoadingFinish(false);
    } catch (err: any) {
      console.error('Error fetching QR Code:', err);
      setErrorFinish(
        err.response?.data?.message || 'Gagal mengambil QR Code'
      );
      setLoadingFinish(false);
    }
  };

  // Konversi waktu UTC ke waktu lokal
  const convertToLocalTime = (utcTime: string) => {
    const localTime = new Date(utcTime);
    return localTime.toLocaleString(); // Mengubah ke format waktu lokal
  };

  // Fungsi untuk mendownload QR code sebagai file gambar
  const downloadQRCode = (qrImage: string) => {
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = 'qr_code.png'; // Nama file yang diunduh
    link.click();
  };

  // Handler untuk klik Finish
  const handleFinishClass = async () => {
    setErrorFinish(null);

    const confirmed = window.confirm('Apakah Anda yakin ingin menyelesaikan kelas ini?');
    if (!confirmed) return;

    const notesFinish = prompt('Masukkan catatan penyelesaian kelas (opsional):', '');
    if (notesFinish !== null) {
      setNotes(notesFinish); // Mengupdate notes dengan input dari user
    }

    setLoadingFinish(true);

    // Ambil geolocation untuk latitude dan longitude
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.put(
            `${apiUrl}/sessions/event/${event_id}`,
            {
              notes: notesFinish || notes,
              latitude,
              longitude,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setIsFinished(true); // Set status kelas menjadi selesai
          setLoadingFinish(false);
          alert('Kelas berhasil diselesaikan!');
          fetchQRCodeFinish(); // Fetch QR Code untuk kelas yang telah selesai
          onStatusChange?.(); // Notify parent component
        } catch (err: any) {
          console.error('Error finishing class:', err);
          setErrorFinish(
            err.response?.data?.message || 'Terjadi kesalahan saat menyelesaikan sesi kelas.'
          );
          setLoadingFinish(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setErrorFinish('Gagal mendapatkan lokasi GPS. Ijinkan akses lokasi!');
        setLoadingFinish(false);
      }
    );
  };

  // Reset state when modal closes
  const handleModalClose = () => {
    setNotes('');
    setErrorStart(null);
    setErrorFinish(null);
    setShowQrCode(false);
    handleClose();
  };

  const topButtons = [];

  // QR code toggle button
  if (isStarted && qrDataStart || isFinished && qrDataFinish) {
    topButtons.push({
      action: 'view' as const,
      text: showQrCode ? 'Sembunyikan QR' : 'Tampilkan QR',
      onClick: () => setShowQrCode(!showQrCode),
      customColors: {
        primary: '#3B82F6',
        secondary: '#2563EB',
        gradient1: '#3B82F6',
        gradient2: '#60A5FA',
        text: '#FFFFFF'
      }
    });
  }

  const bottomButtons = [
    {
      action: 'close' as const,
      text: 'Tutup',
      onClick: handleModalClose
    }
  ];

  // Add start/finish buttons
  if (!isStarted && !loadingStart && !loadingFinish) {
    bottomButtons.push({
      action: 'start' as const,
      text: loadingStart ? 'Memulai...' : 'Mulai Kelas',
      onClick: handleStartClass,
      disabled: loadingStart || loadingFinish,
      loading: loadingStart
    });
  }

  if (isStarted && !isFinished && !loadingStart && !loadingFinish) {
    bottomButtons.push({
      action: 'stop' as const,
      text: loadingFinish ? 'Menyelesaikan...' : 'Selesaikan Kelas',
      onClick: handleFinishClass,
      disabled: loadingFinish || loadingStart,
      loading: loadingFinish,
      customColors: {
        primary: '#F59E0B',
        secondary: '#D97706',
        gradient1: '#F59E0B',
        gradient2: '#FBBF24',
        text: '#FFFFFF'
      }
    });
  }

  return (
    <LearningModal
      show={show}
      onHide={handleModalClose}
      title="Mulai/Selesaikan Kelas"
      subtitle={`${name} - ${course_name}`}
      icon={<Play className="tw-w-5 tw-h-5" />}
      size="lg"
      width="110vw"
      height="110vh"
      topButtons={topButtons}
      bottomButtons={bottomButtons}
      preventCloseOnOutsideClick={false}
    >
      {/* Info Kelas */}
      <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
        <Card.Header className="tw-bg-gray-50 tw-border-0">
          <h6 className="tw-font-semibold tw-text-gray-800 tw-mb-0">Informasi Kelas</h6>
        </Card.Header>
        <Card.Body>
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3">
            <div>
              <strong className="tw-text-gray-700">Nama Kelas:</strong>
              <div className="tw-text-gray-600">{name}</div>
            </div>
            <div>
              <strong className="tw-text-gray-700">Mata Pelajaran:</strong>
              <div className="tw-text-gray-600">{course_name}</div>
            </div>
            <div className="tw-col-span-full">
              <strong className="tw-text-gray-700">Deskripsi:</strong>
              <div className="tw-text-gray-600">{description}</div>
            </div>
            <div>
              <strong className="tw-text-gray-700">Pengajar:</strong>
              <div className="tw-text-gray-600">{teacher_name}</div>
            </div>
            <div>
              <strong className="tw-text-gray-700">Jadwal:</strong>
              <div className="tw-text-gray-600">{date} ({start_time} - {end_time})</div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Daftar Siswa */}
      <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
        <Card.Header className="tw-bg-blue-50 tw-border-0">
          <strong className="tw-text-blue-800 tw-mb-0">Daftar Siswa</strong>
        </Card.Header>
        <Card.Body>
          {student_list_names && student_list_names.length > 0 ? (
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-1">
              {student_list_names.map((student, i) => (
                <div key={i} className="tw-text-blue-700 tw-text-sm">• {student}</div>
              ))}
            </div>
          ) : (
            <p className="tw-text-blue-600 tw-italic tw-mb-0">Belum ada siswa yang terdaftar.</p>
          )}
        </Card.Body>
      </Card>

      {/* Notes Input - Hanya tampil jika kelas belum dimulai */}
      {!isStarted && (
        <Form.Group controlId="notesInput" className="tw-mb-4">
          <Form.Label className="tw-font-semibold tw-text-gray-700">Catatan (opsional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan sebelum memulai kelas..."
            className="tw-border-gray-300 tw-rounded-lg"
          />
        </Form.Group>
      )}

      {/* Error & Loading */}
      {errorStart && <Alert variant="danger" className="tw-mb-3">{errorStart}</Alert>}
      {errorFinish && <Alert variant="danger" className="tw-mb-3">{errorFinish}</Alert>}

      {/* Tampilkan Info QR Code Setelah Started */}
      {isStarted && qrDataStart && (
        <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
          <Card.Header className="tw-bg-green-50 tw-border-0">
            <Alert variant="success" className="tw-mb-0">
              <strong>Kelas telah dimulai!</strong> QR Code presensi tersedia.
            </Alert>
          </Card.Header>
          {showQrCode && (
            <Card.Body className="tw-text-center">
              <div className="tw-mb-3">
                <strong className="tw-text-gray-700">Token:</strong>
                <div className="tw-bg-gray-100 tw-px-3 tw-py-2 tw-rounded tw-font-mono tw-text-lg tw-mt-1">
                  {qrDataStart.token}
                </div>
              </div>
              <div className="tw-mb-3">
                <strong className="tw-text-gray-700">Berlaku hingga:</strong>
                <div className="tw-text-red-600 tw-font-medium">{qrDataStart.expiration_time}</div>
              </div>
              {/* Tampilkan Gambar QR */}
              <div className="tw-mb-3">
                <img
                  src={qrDataStart.qrImage}
                  alt="QR Code"
                  className="tw-max-w-xs tw-mx-auto tw-border tw-rounded-lg tw-shadow-md"
                />
              </div>
              <ButtonGradient
                action="download"
                customText="Download QR Code"
                onClick={() => downloadQRCode(qrDataStart.qrImage)}
                customColors={{
                  primary: '#10B981',
                  secondary: '#059669',
                  gradient1: '#10B981',
                  gradient2: '#34D399',
                  text: '#FFFFFF'
                }}
              />
            </Card.Body>
          )}
        </Card>
      )}

      {/* Tampilkan Info QR Code Setelah Finished */}
      {isFinished && qrDataFinish && (
        <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
          <Card.Header className="tw-bg-blue-50 tw-border-0">
            <Alert variant="info" className="tw-mb-0">
              <strong>Kelas telah selesai!</strong> QR Code presensi akhir tersedia.
            </Alert>
          </Card.Header>
          {showQrCode && (
            <Card.Body className="tw-text-center">
              <div className="tw-mb-3">
                <strong className="tw-text-gray-700">Token:</strong>
                <div className="tw-bg-gray-100 tw-px-3 tw-py-2 tw-rounded tw-font-mono tw-text-lg tw-mt-1">
                  {qrDataFinish.token}
                </div>
              </div>
              <div className="tw-mb-3">
                <strong className="tw-text-gray-700">Berlaku hingga:</strong>
                <div className="tw-text-red-600 tw-font-medium">{qrDataFinish.expiration_time}</div>
              </div>
              {/* Tampilkan Gambar QR */}
              <div className="tw-mb-3">
                <img
                  src={qrDataFinish.qrImage}
                  alt="QR Code"
                  className="tw-max-w-xs tw-mx-auto tw-border tw-rounded-lg tw-shadow-md"
                />
              </div>
              <ButtonGradient
                action="download"
                customText="Download QR Code"
                onClick={() => downloadQRCode(qrDataFinish.qrImage)}
                customColors={{
                  primary: '#10B981',
                  secondary: '#059669',
                  gradient1: '#10B981',
                  gradient2: '#34D399',
                  text: '#FFFFFF'
                }}
              />
            </Card.Body>
          )}
        </Card>
      )}
    </LearningModal>
  );
};

export default StartFinishClassModal;