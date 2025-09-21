// pages/panel/courses/classes-page/StartFinishClassModal.tsx - Fixed with SSR safety

import React, { useState, useEffect } from 'react';
import { Form, Alert, Card, ButtonGroup, Button, Spinner } from 'react-bootstrap';
import { Play, Square, QrCode, Video, MapPin, Link as LinkIcon, Download, Loader2, Lock, CheckCircle2, Eye, Clock } from 'lucide-react';
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
  course_id: number;
  teacher_id: number | null;
  description: string;
  teacher_name: string;
  student_list_ids: number[];
  student_list_names: string[];
  date: string;
  start_time: string;
  end_time: string;
  real_start_datetime?: string;
  real_end_datetime?: string;
  status: string;
  class_mode?: string;
  meeting_url?: string;
  approval_status?: string;
}

interface StartFinishClassModalProps {
  show: boolean;
  handleClose: () => void;
  classData?: ClassData; // Made optional to handle undefined during SSR
  onStatusChange?: () => void;
}

interface QRResponse {
  qrImage: string;
  token: string;
  expiration_time: string;
  meeting_url?: string;
  class_mode: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Default class data for SSR safety
const defaultClassData: ClassData = {
  id: 0,
  event_id: 0,
  starter_user_id: 0,
  name: '',
  course_name: '',
  course_id: 0,
  teacher_id: null,
  description: '',
  teacher_name: '',
  student_list_ids: [],
  student_list_names: [],
  date: '',
  start_time: '',
  end_time: '',
  status: '',
  class_mode: 'offline',
  meeting_url: '',
  approval_status: ''
};

const StartFinishClassModal: React.FC<StartFinishClassModalProps> = ({
  show,
  handleClose,
  classData = defaultClassData, // Provide default value
  onStatusChange,
}) => {
  const { id: currentUserId, role: userRole } = useAuth();
  const [notes, setNotes] = useState('');
  
  // Loading states
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingFinish, setLoadingFinish] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Error states
  const [errorStart, setErrorStart] = useState<string | null>(null);
  const [errorFinish, setErrorFinish] = useState<string | null>(null);

  // Class mode states - Safe access with fallback
  const [classMode, setClassMode] = useState<'online' | 'offline'>(() => {
    if (!classData || !classData.class_mode) return 'offline';
    return classData.class_mode as 'online' | 'offline';
  });
  
  const [meetingUrl, setMeetingUrl] = useState(() => classData?.meeting_url || '');

  // QR Data states
  const [qrData, setQrData] = useState<QRResponse | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);

  // Class status states
  const [classStartedInSession, setClassStartedInSession] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Safe destructuring with fallbacks
  const {
    id = 0,
    event_id = 0,
    name = '',
    course_name = '',
    course_id = 0,
    teacher_id = null,
    teacher_name = '',
    student_list_ids = [],
    student_list_names = [],
    description = '',
    date = '',
    start_time = '',
    end_time = '',
    real_start_datetime,
    real_end_datetime,
    status = '',
    approval_status = '',
  } = classData || defaultClassData;

  // Class status determination - Safe access
  const isStarted = status === 'Started';
  const isFinished = status === 'Finished';
  const isNotApproved = approval_status === 'need_approve' || approval_status === 'rejected';
  const isActuallyFinished = isFinished || (real_end_datetime && new Date(real_end_datetime) < new Date());
  const isFormLocked = isStarted || classStartedInSession || isActuallyFinished;

  // Check if user can start class - Safe access
  const canStartClass = () => {
    if (!currentUserId || !classData) return false;
    
    return (
      (classData.starter_user_id && (parseInt(classData.starter_user_id.toString()) === currentUserId || classData.starter_user_id.toString() === currentUserId.toString())) ||
      userRole === 'admin' ||
      (classData.teacher_id && (parseInt(classData.teacher_id.toString()) === currentUserId || classData.teacher_id.toString() === currentUserId.toString()))
    );
  };

  // Initial data loading on modal open
  useEffect(() => {
    if (show && classData && (isStarted || isActuallyFinished)) {
      fetchExistingQRCode();
    } else {
      setInitialLoading(false);
    }
  }, [show, isStarted, isActuallyFinished, classData]);

  // Update class mode when classData changes
  useEffect(() => {
    if (classData) {
      setClassMode(classData.class_mode as 'online' | 'offline' || 'offline');
      setMeetingUrl(classData.meeting_url || '');
    }
  }, [classData]);

  // Early return if no valid classData during SSR
  if (!classData && typeof window === 'undefined') {
    return null;
  }

  // UPDATED: Fetch existing QR Code using new endpoint
  const fetchExistingQRCode = async () => {
    if (!id) return;
    
    setLoadingFetch(true);
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get<ApiResponse<QRResponse>>(
        `${apiUrl}/classes/${id}/qr-code`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.data) {
        const qrResponseData = response.data.data;
        
        setQrData({
          qrImage: qrResponseData.qrImage,
          token: qrResponseData.token,
          expiration_time: convertToLocalTime(qrResponseData.expiration_time),
          meeting_url: qrResponseData.meeting_url,
          class_mode: qrResponseData.class_mode
        });
      }
      
    } catch (err: any) {
      console.error('Error fetching existing QR Code:', err);
      if (err.response?.status !== 404) {
        setErrorStart(err.response?.data?.message || 'Gagal mengambil data QR Code');
      }
    } finally {
      setLoadingFetch(false);
      setInitialLoading(false);
    }
  };

  // UPDATED: Handler for start class - single atomic operation
  const handleStartClass = async () => {
    setErrorStart(null);
    
    if (isNotApproved) {
      setErrorStart('Kelas belum disetujui dan tidak dapat dimulai');
      return;
    }

    if (classMode === 'online' && !meetingUrl.trim()) {
      setErrorStart('URL meeting diperlukan untuk kelas online');
      return;
    }

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

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const token = localStorage.getItem('authToken');

          // UPDATED: Single API call for atomic start operation
          const payload = {
            class_mode: classMode,
            meeting_url: classMode === 'online' ? meetingUrl.trim() : undefined,
            notes: notes || `Memulai kelas ${name}`,
            latitude,
            longitude,
          };

          const response = await axios.post<ApiResponse<QRResponse>>(
            `${apiUrl}/classes/${id}/start`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.success && response.data.data) {
            const qrResponseData = response.data.data;

            setClassStartedInSession(true);
            setQrData({
              qrImage: qrResponseData.qrImage,
              token: qrResponseData.token,
              expiration_time: convertToLocalTime(qrResponseData.expiration_time),
              meeting_url: qrResponseData.meeting_url,
              class_mode: qrResponseData.class_mode
            });

            alert(response.data.message);
            onStatusChange?.();
          } else {
            throw new Error(response.data.message || 'Gagal memulai kelas');
          }

        } catch (err: any) {
          console.error('Start class error:', err);
          setErrorStart(
            err.response?.data?.message ||
              'Terjadi kesalahan saat memulai sesi kelas.'
          );
        } finally {
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

  // UPDATED: Handler for finish class - single atomic operation
  const handleFinishClass = async () => {
    setErrorFinish(null);

    const confirmed = window.confirm('Apakah Anda yakin ingin menyelesaikan kelas ini?');
    if (!confirmed) return;

    const notesFinish = prompt('Masukkan catatan penyelesaian kelas (opsional):', '');
    if (notesFinish !== null) {
      setNotes(notesFinish);
    }

    setLoadingFinish(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const token = localStorage.getItem('authToken');
          
          // UPDATED: Single API call for atomic finish operation
          const payload = {
            notes: notesFinish || notes || `Menyelesaikan kelas ${name}`,
            latitude,
            longitude,
          };

          const response = await axios.post<ApiResponse<QRResponse>>(
            `${apiUrl}/classes/${id}/finish`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.success) {
            // UPDATED: Handle QR code data from finish operation
            if (response.data.data) {
              const qrResponseData = response.data.data;
              
              setQrData({
                qrImage: qrResponseData.qrImage,
                token: qrResponseData.token,
                expiration_time: convertToLocalTime(qrResponseData.expiration_time),
                meeting_url: qrResponseData.meeting_url,
                class_mode: qrResponseData.class_mode
              });
            }

            alert(`${response.data.message} QR Code presensi keluar tersedia untuk siswa.`);
            onStatusChange?.();
          } else {
            throw new Error(response.data.message || 'Gagal menyelesaikan kelas');
          }

        } catch (err: any) {
          console.error('Error finishing class:', err);
          setErrorFinish(
            err.response?.data?.message || 'Terjadi kesalahan saat menyelesaikan sesi kelas.'
          );
        } finally {
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

  const convertToLocalTime = (utcTime: string) => {
    const localTime = new Date(utcTime);
    return localTime.toLocaleString();
  };

  const downloadQRCode = (qrImage: string) => {
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `qr_code_${classMode}_${Date.now()}.png`;
    link.click();
  };

  const copyMeetingUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('URL meeting berhasil disalin!');
    }).catch(() => {
      alert('Gagal menyalin URL meeting');
    });
  };

  const handleModalClose = () => {
    setNotes('');
    setErrorStart(null);
    setErrorFinish(null);
    setShowQrCode(false);
    setClassStartedInSession(false);
    if (classData) {
      setClassMode(classData.class_mode as 'online' | 'offline' || 'offline');
      setMeetingUrl(classData.meeting_url || '');
    }
    setInitialLoading(true);
    setQrData(null);
    handleClose();
  };

  const isAnyLoading = loadingStart || loadingFinish || loadingFetch || initialLoading;

  // Button configuration based on class status
  const topButtons = [];

  if (qrData && !isAnyLoading) {
    topButtons.push({
      action: 'view' as const,
      text: showQrCode ? 'Sembunyikan QR' : 'Tampilkan QR',
      onClick: () => setShowQrCode(!showQrCode),
      disabled: isAnyLoading,
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
      onClick: handleModalClose,
      disabled: isAnyLoading
    }
  ];

  if (canStartClass()) {
    if (!isStarted && !isNotApproved && !classStartedInSession && !isActuallyFinished) {
      // Show start button
      bottomButtons.push({
        action: 'start' as const,
        text: loadingStart ? 'Memulai Kelas...' : 'Mulai Kelas',
        onClick: handleStartClass,
        disabled: isAnyLoading,
        loading: loadingStart
      });
    } else if ((isStarted || classStartedInSession) && !isActuallyFinished) {
      // Show finish button for started but not finished classes
      bottomButtons.push({
        action: 'stop' as const,
        text: loadingFinish ? 'Menyelesaikan...' : 'Selesaikan Kelas',
        customIcon: <Square className="tw-w-4 tw-h-4" />,
        onClick: handleFinishClass,
        disabled: isAnyLoading,
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
      title={isActuallyFinished ? "Review Kelas" : "Mulai/Selesaikan Kelas"}
      subtitle={`${name} - ${course_name}`}
      icon={isActuallyFinished ? <Eye className="tw-w-5 tw-h-5" /> : <Play className="tw-w-5 tw-h-5" />}
      size="lg"
      width="110vw"
      height="120vh"
      topButtons={topButtons}
      bottomButtons={bottomButtons}
      preventCloseOnOutsideClick={isAnyLoading}
    >
      {/* Initial loading screen */}
      {initialLoading && (
        <div className="tw-flex tw-items-center tw-justify-center tw-py-12">
          <div className="tw-text-center">
            <Spinner animation="border" size="lg" />
            <div className="tw-mt-3 tw-text-lg tw-font-medium">Memuat data kelas...</div>
          </div>
        </div>
      )}

      {!initialLoading && (
        <>
          {/* Loading indicator for actions */}
          {isAnyLoading && !initialLoading && (
            <Alert variant="info" className="tw-mb-4 tw-flex tw-items-center tw-gap-3">
              <Spinner animation="border" size="sm" />
              <div>
                <strong>
                  {loadingStart && 'Memulai kelas...'}
                  {loadingFinish && 'Menyelesaikan kelas...'}
                  {loadingFetch && 'Memuat data QR...'}
                </strong>
                <div className="tw-text-sm tw-mt-1">
                  {loadingStart && 'Sistem sedang memproses permintaan start kelas secara atomic.'}
                  {loadingFinish && 'Sistem sedang memproses permintaan finish kelas secara atomic.'}
                  {loadingFetch && 'Mohon tunggu, jangan tutup jendela ini.'}
                </div>
              </div>
            </Alert>
          )}

          {/* Success message for atomic operations */}
          {(loadingStart || loadingFinish) && (
            <Alert variant="success" className="tw-mb-4">
              <strong>Operasi Atomic:</strong> Semua perubahan akan dilakukan dalam satu transaksi. 
              Jika ada error, semua perubahan akan di-rollback secara otomatis.
            </Alert>
          )}

          {/* Approval Status Warning */}
          {isNotApproved && (
            <Alert variant="warning" className="tw-mb-4">
              <strong>Kelas Belum Disetujui!</strong> 
              <div>Status: {approval_status === 'need_approve' ? 'Menunggu Persetujuan' : 'Ditolak'}</div>
              {approval_status === 'need_approve' && <div>Kelas tidak dapat dimulai sampai mendapat persetujuan dari admin atau guru.</div>}
            </Alert>
          )}

          {/* Class status alerts */}
          {(isStarted || classStartedInSession) && !isActuallyFinished && (
            <Alert variant="success" className="tw-mb-4 tw-flex tw-items-center tw-gap-3">
              <CheckCircle2 className="tw-w-5 tw-h-5" />
              <div>
                <strong>Kelas Sedang Berlangsung!</strong>
                <div className="tw-text-sm tw-mt-1">
                  Pengaturan kelas telah dikunci dan tidak dapat diubah.
                </div>
              </div>
            </Alert>
          )}

          {isActuallyFinished && (
            <Alert variant="info" className="tw-mb-4 tw-flex tw-items-center tw-gap-3">
              <Clock className="tw-w-5 tw-h-5" />
              <div>
                <strong>Kelas Telah Selesai!</strong>
                <div className="tw-text-sm tw-mt-1">
                  Kelas ini sudah berakhir pada {real_end_datetime ? new Date(real_end_datetime).toLocaleString() : 'waktu tidak diketahui'}.
                </div>
              </div>
            </Alert>
          )}

          {/* Class Information */}
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
                  <div className={`tw-flex tw-items-center tw-gap-2 tw-font-medium ${(classData?.class_mode || 'offline') === 'online' ? 'tw-text-blue-600' : 'tw-text-green-600'}`}>
                    {(classData?.class_mode || 'offline') === 'online' ? <Video size={16} /> : <MapPin size={16} />}
                    {(classData?.class_mode || 'offline') === 'online' ? 'Online' : 'Offline'}
                    {isFormLocked && <Lock size={14} className="tw-text-gray-400" />}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Class Mode Selection - Locked when started or finished */}
          {canStartClass() && !isNotApproved && (
            <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
              <Card.Header className={`tw-border-0 ${isFormLocked ? 'tw-bg-gray-100' : 'tw-bg-blue-50'}`}>
                <h6 className={`tw-font-semibold tw-mb-0 tw-flex tw-items-center tw-gap-2 ${isFormLocked ? 'tw-text-gray-600' : 'tw-text-blue-800'}`}>
                  Pengaturan Kelas
                  {isFormLocked && <Lock size={16} className="tw-text-gray-400" />}
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="tw-space-y-4">
                  <div>
                    <label className={`tw-font-semibold tw-mb-3 tw-block tw-flex tw-items-center tw-gap-2 ${isFormLocked ? 'tw-text-gray-500' : 'tw-text-gray-700'}`}>
                      Mode Kelas:
                      {isFormLocked && <span className="tw-text-xs tw-bg-gray-200 tw-px-2 tw-py-1 tw-rounded">(Terkunci)</span>}
                    </label>
                    <ButtonGroup className="tw-w-full">
                      <Button
                        variant={classMode === 'offline' ? 'primary' : 'outline-primary'}
                        onClick={() => !isFormLocked && setClassMode('offline')}
                        disabled={isFormLocked || isAnyLoading}
                        className={`tw-flex tw-items-center tw-justify-center tw-gap-2 ${isFormLocked ? 'tw-opacity-60' : ''}`}
                      >
                        <MapPin size={16} />
                        Offline
                      </Button>
                      <Button
                        variant={classMode === 'online' ? 'primary' : 'outline-primary'}
                        onClick={() => !isFormLocked && setClassMode('online')}
                        disabled={isFormLocked || isAnyLoading}
                        className={`tw-flex tw-items-center tw-justify-center tw-gap-2 ${isFormLocked ? 'tw-opacity-60' : ''}`}
                      >
                        <Video size={16} />
                        Online
                      </Button>
                    </ButtonGroup>
                  </div>

                  {classMode === 'online' && (
                    <div>
                      <label className={`tw-font-semibold tw-flex tw-items-center tw-gap-2 ${isFormLocked ? 'tw-text-gray-500' : 'tw-text-gray-700'}`}>
                        <LinkIcon className="tw-w-4 tw-h-4" />
                        URL Meeting *
                        {isFormLocked && <span className="tw-text-xs tw-bg-gray-200 tw-px-2 tw-py-1 tw-rounded">(Terkunci)</span>}
                      </label>
                      <Form.Control
                        type="url"
                        value={meetingUrl}
                        onChange={(e) => !isFormLocked && setMeetingUrl(e.target.value)}
                        placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
                        disabled={isFormLocked || isAnyLoading}
                        readOnly={isFormLocked}
                        required
                        className={`tw-mt-2 ${isFormLocked ? 'tw-bg-gray-100 tw-text-gray-600' : ''}`}
                      />
                      <small className={`tw-mt-1 ${isFormLocked ? 'tw-text-gray-400' : 'tw-text-gray-500'}`}>
                        {isFormLocked ? 'URL meeting telah dikunci' : 'Masukkan URL meeting (Zoom, Google Meet, Microsoft Teams, dll.)'}
                      </small>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Student List */}
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

          {/* Notes Input */}
          {canStartClass() && !isNotApproved && (
            <Form.Group controlId="notesInput" className="tw-mb-4">
              <Form.Label className={`tw-font-semibold tw-flex tw-items-center tw-gap-2 ${isFormLocked ? 'tw-text-gray-500' : 'tw-text-gray-700'}`}>
                Catatan (opsional)
                {isFormLocked && <span className="tw-text-xs tw-bg-gray-200 tw-px-2 tw-py-1 tw-rounded">(Terkunci)</span>}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={notes}
                onChange={(e) => !isFormLocked && setNotes(e.target.value)}
                placeholder={isFormLocked ? "Catatan telah dikunci" : "Catatan sebelum memulai kelas..."}
                disabled={isFormLocked || isAnyLoading}
                readOnly={isFormLocked}
                className={`tw-border-gray-300 tw-rounded-lg ${isFormLocked ? 'tw-bg-gray-100 tw-text-gray-600' : ''}`}
              />
            </Form.Group>
          )}

          {/* Error Messages */}
          {errorStart && <Alert variant="danger" className="tw-mb-3">{errorStart}</Alert>}
          {errorFinish && <Alert variant="danger" className="tw-mb-3">{errorFinish}</Alert>}

          {/* QR Code Display */}
          {qrData && (
            <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
              <Card.Header className={`tw-border-0 ${isActuallyFinished ? 'tw-bg-blue-50' : 'tw-bg-green-50'}`}>
                <Alert variant={isActuallyFinished ? "info" : "success"} className="tw-mb-0">
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <strong>
                      {isActuallyFinished ? 'Kelas telah selesai!' : 'Kelas sedang berlangsung!'}
                    </strong>
                    {qrData.class_mode === 'online' ? <Video size={16} /> : <MapPin size={16} />}
                    <span>Mode: {qrData.class_mode === 'online' ? 'Online' : 'Offline'}</span>
                  </div>
                  <div>
                    {isActuallyFinished ? 'Data QR Code tersimpan untuk review.' : 'QR Code presensi tersedia.'}
                  </div>
                </Alert>
              </Card.Header>
              {showQrCode && (
                <Card.Body className="tw-text-center">
                  <div className="tw-mb-3">
                    <strong className="tw-text-gray-700">Token:</strong>
                    <div className="tw-bg-gray-100 tw-px-3 tw-py-2 tw-rounded tw-font-mono tw-text-lg tw-mt-1">
                      {qrData.token}
                    </div>
                  </div>
                  <div className="tw-mb-3">
                    <strong className="tw-text-gray-700">
                      {isActuallyFinished ? 'Berlaku hingga (sudah expired):' : 'Berlaku hingga:'}
                    </strong>
                    <div className={`tw-font-medium ${isActuallyFinished ? 'tw-text-gray-500' : 'tw-text-red-600'}`}>
                      {qrData.expiration_time}
                    </div>
                  </div>
                  
                  {qrData.meeting_url && (
                    <div className="tw-mb-3 tw-p-3 tw-bg-blue-50 tw-rounded-lg">
                      <strong className="tw-text-blue-800 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-mb-2">
                        <LinkIcon className="tw-w-4 tw-h-4" />
                        URL Meeting {isActuallyFinished && '(Kelas telah selesai)'}
                      </strong>
                      <div className="tw-bg-white tw-p-2 tw-rounded tw-border tw-mb-2">
                        {isActuallyFinished ? (
                          <span className="tw-text-gray-600 tw-break-all">
                            {qrData.meeting_url}
                          </span>
                        ) : (
                          <a 
                            href={qrData.meeting_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="tw-text-blue-600 tw-break-all hover:tw-underline"
                          >
                            {qrData.meeting_url}
                          </a>
                        )}
                      </div>
                      {!isActuallyFinished && (
                        <div className="tw-flex tw-gap-2 tw-justify-center">
                          <ButtonGradient
                            action="custom"
                            customText="Salin URL"
                            size="sm"
                            onClick={() => copyMeetingUrl(qrData.meeting_url!)}
                            disabled={isAnyLoading}
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
                            onClick={() => window.open(qrData.meeting_url!, '_blank')}
                            disabled={isAnyLoading}
                            customColors={{
                              primary: '#059669',
                              secondary: '#047857',
                              gradient1: '#059669',
                              gradient2: '#10B981',
                              text: '#FFFFFF'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="tw-mb-3">
                    <img
                      src={qrData.qrImage}
                      alt="QR Code"
                      className={`tw-max-w-xs tw-mx-auto tw-border tw-rounded-lg tw-shadow-md ${isActuallyFinished ? 'tw-opacity-75' : ''}`}
                    />
                  </div>
                  <ButtonGradient
                    action="download"
                    customText="Download QR Code"
                    onClick={() => downloadQRCode(qrData.qrImage)}
                    disabled={isAnyLoading}
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

          {/* Permission Warning */}
          {!canStartClass() && !isStarted && !isActuallyFinished && (
            <Alert variant="info" className="tw-mb-4">
              <strong>Informasi:</strong> Anda tidak memiliki hak untuk memulai kelas ini. 
              Hanya guru pengajar atau admin yang dapat memulai kelas.
            </Alert>
          )}
        </>
      )}
    </LearningModal>
  );
};

export default StartFinishClassModal;