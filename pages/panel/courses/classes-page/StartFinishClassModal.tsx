// pages/panel/courses/classes-page/StartFinishClassModal.tsx

import React, { useState, useEffect } from 'react';
import { Form, Alert, Card, ButtonGroup, Button } from 'react-bootstrap';
import { FaPlay, FaStop, FaDownload, FaVideo, FaMapMarkerAlt, FaLink } from 'react-icons/fa';
import { Play, Square, QrCode, Video, MapPin, Link as LinkIcon } from 'lucide-react';
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
  class_mode?: string;
  meeting_url?: string;
  approval_status?: string;
}

interface StartFinishClassModalProps {
  show: boolean;
  handleClose: () => void;
  classData: ClassData;
  onStatusChange?: () => void;
}

interface QRResponse {
  qrImage: string;
  token: string;
  expiration_time: string;
  meeting_url?: string;
  class_mode: string;
}

const StartFinishClassModal: React.FC<StartFinishClassModalProps> = ({
  show,
  handleClose,
  classData,
  onStatusChange,
}) => {
  const { id: currentUserId, role: userRole } = useAuth();
  const [notes, setNotes] = useState('');
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingFinish, setLoadingFinish] = useState(false);
  const [errorStart, setErrorStart] = useState<string | null>(null);
  const [errorFinish, setErrorFinish] = useState<string | null>(null);

  // Class mode states
  const [classMode, setClassMode] = useState<'online' | 'offline'>(classData.class_mode as 'online' | 'offline' || 'offline');
  const [meetingUrl, setMeetingUrl] = useState(classData.meeting_url || '');

  // Data QR yang didapat dari response
  const [qrDataStart, setQrDataStart] = useState<QRResponse | null>(null);
  const [qrDataFinish, setQrDataFinish] = useState<QRResponse | null>(null);

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
    approval_status,
  } = classData;

  const [isStarted, setIsStarted] = useState(status === 'Started');
  const [isFinished, setIsFinished] = useState(status === 'Finished');
  const [isNotApproved, setIsNotApproved] = useState(approval_status === 'need_approve' || approval_status === 'rejected');

  // Cek apakah kelas sudah dimulai atau selesai
  useEffect(() => {
    if (status === 'Started') {
      fetchQRCodeStart();
    } else if (status === 'Finished') {
      fetchQRCodeFinish();
    }
  }, [status]);

  // Update class mode when classData changes
  useEffect(() => {
    setClassMode(classData.class_mode as 'online' | 'offline' || 'offline');
    setMeetingUrl(classData.meeting_url || '');
  }, [classData]);

  // Check if user can start class (same logic as before)
  const canStartClass = () => {
    return currentUserId && (
      (classData.starter_user_id && (parseInt(classData.starter_user_id.toString()) === currentUserId || classData.starter_user_id.toString() === currentUserId.toString())) ||
      userRole === 'admin' ||
      (teacher_name && teacher_name.includes(currentUserId.toString()))
    );
  };

  // Handler untuk klik Start
  const handleStartClass = async () => {
    setErrorStart(null);
    
    // Check if class is approved
    if (isNotApproved) {
      setErrorStart('Kelas belum disetujui dan tidak dapat dimulai');
      return;
    }

    // Validate meeting URL for online classes
    if (classMode === 'online' && !meetingUrl.trim()) {
      setErrorStart('URL meeting diperlukan untuk kelas online');
      return;
    }

    // Validate meeting URL format
    if (classMode === 'online' && meetingUrl.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(meetingUrl.trim())) {
        setErrorStart('Format URL meeting tidak valid. Harus dimulai dengan http:// atau https://');
        return;
      }
    }

    const confirmed = window.confirm(
      `Anda yakin ingin memulai kelas ini sebagai kelas ${classMode === 'online' ? 'ONLINE' : 'OFFLINE'}?`
    );
    if (!confirmed) return;

    setLoadingStart(true);

    // Ambil geolocation
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          // Buat payload untuk session
          const sessionPayload = {
            eventid: event_id,
            latitude,
            longitude,
            notes,
          };

          // Ambil token dari localStorage
          const token = localStorage.getItem('authToken');

          // Start session first
          const sessionResponse = await axios.post(
            `${apiUrl}/sessions`,
            sessionPayload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Then generate QR code with class mode and meeting URL
          const qrPayload = {
            class_mode: classMode,
            meeting_url: classMode === 'online' ? meetingUrl.trim() : undefined
          };

          const qrResponse = await axios.post(
            `${apiUrl}/code-attendance/check-and-generate-from-event/${event_id}`,
            qrPayload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const qrData: QRResponse = qrResponse.data;

          // Update status kelas
          setIsStarted(true);
          setLoadingStart(false);

          // Set QR data
          setQrDataStart({
            qrImage: qrData.qrImage,
            token: qrData.token,
            expiration_time: convertToLocalTime(qrData.expiration_time),
            meeting_url: qrData.meeting_url,
            class_mode: qrData.class_mode
          });

          alert(`Kelas berhasil dimulai sebagai kelas ${classMode.toUpperCase()}!`);
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

  // Fetch QR Code Data setelah kelas dimulai (updated)
  const fetchQRCodeStart = async () => {
    setLoadingStart(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Try to get existing QR code first
      const response = await axios.post(
        `${apiUrl}/code-attendance/check-and-generate-from-event/${event_id}`,
        {
          class_mode: classMode,
          meeting_url: classMode === 'online' ? meetingUrl : undefined
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const qrData: QRResponse = response.data;
      
      setQrDataStart({
        qrImage: qrData.qrImage,
        token: qrData.token,
        expiration_time: convertToLocalTime(qrData.expiration_time),
        meeting_url: qrData.meeting_url,
        class_mode: qrData.class_mode
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

  // Fetch QR Code Data setelah kelas selesai (updated)
  const fetchQRCodeFinish = async () => {
    setLoadingFinish(true);
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(
        `${apiUrl}/code-attendance/check-and-generate-from-event/${event_id}`,
        {
          class_mode: classMode,
          meeting_url: classMode === 'online' ? meetingUrl : undefined
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const qrData: QRResponse = response.data;
      
      setQrDataFinish({
        qrImage: qrData.qrImage,
        token: qrData.token,
        expiration_time: convertToLocalTime(qrData.expiration_time),
        meeting_url: qrData.meeting_url,
        class_mode: qrData.class_mode
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

  // Handler untuk klik Finish (remains mostly the same)
  const handleFinishClass = async () => {
    setErrorFinish(null);

    const confirmed = window.confirm('Apakah Anda yakin ingin menyelesaikan kelas ini?');
    if (!confirmed) return;

    const notesFinish = prompt('Masukkan catatan penyelesaian kelas (opsional):', '');
    if (notesFinish !== null) {
      setNotes(notesFinish);
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

          setIsFinished(true);
          setLoadingFinish(false);
          alert('Kelas berhasil diselesaikan!');
          fetchQRCodeFinish();
          onStatusChange?.();
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

  // Konversi waktu UTC ke waktu lokal
  const convertToLocalTime = (utcTime: string) => {
    const localTime = new Date(utcTime);
    return localTime.toLocaleString();
  };

  // Fungsi untuk mendownload QR code sebagai file gambar
  const downloadQRCode = (qrImage: string) => {
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `qr_code_${classMode}_${Date.now()}.png`;
    link.click();
  };

  // Fungsi untuk copy meeting URL
  const copyMeetingUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('URL meeting berhasil disalin!');
    }).catch(() => {
      alert('Gagal menyalin URL meeting');
    });
  };

  // Reset state when modal closes
  const handleModalClose = () => {
    setNotes('');
    setErrorStart(null);
    setErrorFinish(null);
    setShowQrCode(false);
    setClassMode(classData.class_mode as 'online' | 'offline' || 'offline');
    setMeetingUrl(classData.meeting_url || '');
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

  // Add start/finish buttons if user has permission
  if (canStartClass()) {
    if (!isStarted && !loadingStart && !loadingFinish && !isNotApproved) {
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
      {/* Approval Status Warning */}
      {isNotApproved && (
        <Alert variant="warning" className="tw-mb-4">
          <strong>Kelas Belum Disetujui!</strong> 
          <div>Status: {approval_status === 'need_approve' ? 'Menunggu Persetujuan' : 'Ditolak'}</div>
          {approval_status === 'need_approve' && <div>Kelas tidak dapat dimulai sampai mendapat persetujuan dari admin atau guru.</div>}
        </Alert>
      )}

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
              <div className="tw-text-gray-600">{teacher_name || 'Belum Ditentukan'}</div>
            </div>
            <div>
              <strong className="tw-text-gray-700">Jadwal:</strong>
              <div className="tw-text-gray-600">{date} ({start_time} - {end_time})</div>
            </div>
            <div>
              <strong className="tw-text-gray-700">Mode Kelas:</strong>
              <div className={`tw-flex tw-items-center tw-gap-2 tw-font-medium ${classData.class_mode === 'online' ? 'tw-text-blue-600' : 'tw-text-green-600'}`}>
                {classData.class_mode === 'online' ? <Video size={16} /> : <MapPin size={16} />}
                {classData.class_mode === 'online' ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Class Mode Selection - Only for users who can start class and class not started */}
      {canStartClass() && !isStarted && !isNotApproved && (
        <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
          <Card.Header className="tw-bg-blue-50 tw-border-0">
            <h6 className="tw-font-semibold tw-text-blue-800 tw-mb-0">Pengaturan Kelas</h6>
          </Card.Header>
          <Card.Body>
            <div className="tw-space-y-4">
              <div>
                <label className="tw-font-semibold tw-text-gray-700 tw-mb-3 tw-block">Mode Kelas:</label>
                <ButtonGroup className="tw-w-full">
                  <Button
                    variant={classMode === 'offline' ? 'primary' : 'outline-primary'}
                    onClick={() => setClassMode('offline')}
                    className="tw-flex tw-items-center tw-justify-center tw-gap-2"
                  >
                    <MapPin size={16} />
                    Offline
                  </Button>
                  <Button
                    variant={classMode === 'online' ? 'primary' : 'outline-primary'}
                    onClick={() => setClassMode('online')}
                    className="tw-flex tw-items-center tw-justify-center tw-gap-2"
                  >
                    <Video size={16} />
                    Online
                  </Button>
                </ButtonGroup>
              </div>

              {/* Meeting URL Input - Only show for online classes */}
              {classMode === 'online' && (
                <div>
                  <label className="tw-font-semibold tw-text-gray-700 tw-flex tw-items-center tw-gap-2">
                    <LinkIcon className="tw-w-4 tw-h-4" />
                    URL Meeting *
                  </label>
                  <Form.Control
                    type="url"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
                    disabled={loadingStart}
                    required
                    className="tw-mt-2"
                  />
                  <small className="tw-text-gray-500 tw-mt-1">
                    Masukkan URL meeting (Zoom, Google Meet, Microsoft Teams, dll.)
                  </small>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Daftar Siswa */}
      <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
        <Card.Header className="tw-bg-green-50 tw-border-0">
          <strong className="tw-text-green-800 tw-mb-0">Daftar Siswa</strong>
        </Card.Header>
        <Card.Body>
          {student_list_names && student_list_names.length > 0 ? (
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-1">
              {student_list_names.map((student, i) => (
                <div key={i} className="tw-text-green-700 tw-text-sm">• {student}</div>
              ))}
            </div>
          ) : (
            <p className="tw-text-green-600 tw-italic tw-mb-0">Belum ada siswa yang terdaftar.</p>
          )}
        </Card.Body>
      </Card>

      {/* Notes Input - Hanya tampil jika kelas belum dimulai dan user bisa start */}
      {canStartClass() && !isStarted && !isNotApproved && (
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
              <div className="tw-flex tw-items-center tw-gap-2">
                <strong>Kelas telah dimulai!</strong>
                {qrDataStart.class_mode === 'online' ? <Video size={16} /> : <MapPin size={16} />}
                <span>Mode: {qrDataStart.class_mode === 'online' ? 'Online' : 'Offline'}</span>
              </div>
              <div>QR Code presensi tersedia.</div>
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
              
              {/* Meeting URL Display untuk Online Class */}
              {qrDataStart.meeting_url && (
                <div className="tw-mb-3 tw-p-3 tw-bg-blue-50 tw-rounded-lg">
                  <strong className="tw-text-blue-800 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-mb-2">
                    <LinkIcon className="tw-w-4 tw-h-4" />
                    URL Meeting
                  </strong>
                  <div className="tw-bg-white tw-p-2 tw-rounded tw-border tw-mb-2">
                    <a 
                      href={qrDataStart.meeting_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="tw-text-blue-600 tw-break-all hover:tw-underline"
                    >
                      {qrDataStart.meeting_url}
                    </a>
                  </div>
                  <div className="tw-flex tw-gap-2 tw-justify-center">
                    <ButtonGradient
                      action="custom"
                      customText="Salin URL"
                      size="sm"
                      onClick={() => copyMeetingUrl(qrDataStart.meeting_url!)}
                      customColors={{
                        primary: '#3B82F6',
                        secondary: '#2563EB',
                        gradient1: '#3B82F6',
                        gradient2: '#60A5FA',
                        text: '#FFFFFF'
                      }}
                    />
                    <ButtonGradient
                      action="custom"
                      customText="Buka Meeting"
                      size="sm"
                      onClick={() => window.open(qrDataStart.meeting_url!, '_blank')}
                      customColors={{
                        primary: '#059669',
                        secondary: '#047857',
                        gradient1: '#059669',
                        gradient2: '#10B981',
                        text: '#FFFFFF'
                      }}
                    />
                  </div>
                </div>
              )}

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
              <div className="tw-flex tw-items-center tw-gap-2">
                <strong>Kelas telah selesai!</strong>
                {qrDataFinish.class_mode === 'online' ? <Video size={16} /> : <MapPin size={16} />}
                <span>Mode: {qrDataFinish.class_mode === 'online' ? 'Online' : 'Offline'}</span>
              </div>
              <div>QR Code presensi akhir tersedia.</div>
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
              {/* Meeting URL Display untuk Online Class */}
              {qrDataFinish.meeting_url && (
                <div className="tw-mb-3 tw-p-3 tw-bg-blue-50 tw-rounded-lg">
                  <strong className="tw-text-blue-800 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-mb-2">
                    <LinkIcon className="tw-w-4 tw-h-4" />
                    URL Meeting (Kelas telah selesai)
                  </strong>
                  <div className="tw-bg-white tw-p-2 tw-rounded tw-border">
                    <span className="tw-text-gray-600 tw-break-all">
                      {qrDataFinish.meeting_url}
                    </span>
                  </div>
                </div>
              )}
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

      {/* Permission Warning for students/teachers who can't start */}
      {!canStartClass() && !isStarted && !isFinished && (
        <Alert variant="info" className="tw-mb-4">
          <strong>Informasi:</strong> Anda tidak memiliki hak untuk memulai kelas ini. 
          Hanya guru pengajar atau admin yang dapat memulai kelas.
        </Alert>
      )}
    </LearningModal>
  );
};

export default StartFinishClassModal;