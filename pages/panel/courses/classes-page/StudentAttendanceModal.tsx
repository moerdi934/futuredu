
// pages/panel/courses/classes-page/StudentAttendanceModal.tsx - Updated dengan status handling
import React, { useState, useEffect, useRef } from 'react';
import { Alert, Card, ButtonGroup, Button, InputGroup, Form, Badge } from 'react-bootstrap';
import { QrCode, KeyboardIcon, Video, MapPin, ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react';
import { FaQrcode, FaKeyboard, FaVideo, FaMapMarkerAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { LearningModal } from '../../../../components/modal/ModalTemplate';
import { ButtonGradient } from '../../../../components/button/ButtonTemplate';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';

interface StudentAttendanceModalProps {
  show: boolean;
  onClose: () => void;
  classData: any;
}

interface AttendanceStatusData {
  classStatus: 'not_started' | 'ongoing' | 'finished';
  studentStatus: 'not_attended' | 'checked_in' | 'checked_out';
  canCheckIn: boolean;
  canCheckOut: boolean;
  classInfo: {
    name: string;
    course_name: string;
    teacher_name: string;
    class_mode: string;
    meeting_url?: string;
    real_start_datetime?: string;
    real_end_datetime?: string;
  };
  attendanceHistory: {
    check_in?: {
      timestamp: string;
      notes?: string;
    };
    check_out?: {
      timestamp: string;
      notes?: string;
    };
  };
}

interface AttendanceResponse {
  message: string;
  meeting_url?: string;
}

const StudentAttendanceModal: React.FC<StudentAttendanceModalProps> = ({ show, onClose, classData }) => {
  const { id: currentUserId } = useAuth();
  
  // Attendance status
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatusData | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  
  // Attendance method selection
  const [attendanceMethod, setAttendanceMethod] = useState<'qr' | 'token'>('qr');
  const [attendanceType, setAttendanceType] = useState<'check_in' | 'check_out'>('check_in');
  
  // Token input state
  const [tokenInput, setTokenInput] = useState('');
  
  // QR Scanner states
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Geolocation states
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationError, setLocationError] = useState('');
  
  // Loading and response states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Load attendance status when modal opens
  useEffect(() => {
    if (show && classData?.id) {
      loadAttendanceStatus();
    }
  }, [show, classData?.id]);

  // Get current location
  useEffect(() => {
    if (show) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationError('');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Gagal mendapatkan lokasi. Pastikan GPS aktif dan berikan izin akses lokasi.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  }, [show]);

  // Clean up camera stream when modal closes
  useEffect(() => {
    if (!show) {
      stopCamera();
    }
  }, [show]);

  // Load attendance status
  const loadAttendanceStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await axios.get<{success: boolean; data: AttendanceStatusData}>(
        `${API_URL}/classes/${classData.id}/attendance-status`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (response.data.success) {
        setAttendanceStatus(response.data.data);
        
        // Set initial attendance type based on what student can do
        if (response.data.data.canCheckIn) {
          setAttendanceType('check_in');
        } else if (response.data.data.canCheckOut) {
          setAttendanceType('check_out');
        }

        // Set meeting URL if available
        if (response.data.data.classInfo.meeting_url) {
          setMeetingUrl(response.data.data.classInfo.meeting_url);
        }
      }
    } catch (err: any) {
      console.error('Load attendance status error:', err);
      setError(err.response?.data?.message || 'Gagal memuat status presensi');
    } finally {
      setStatusLoading(false);
    }
  };

  // Stop camera function
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // Start QR scanning
  const startQRScanning = async () => {
    if (!location) {
      setError('Lokasi diperlukan untuk presensi. Pastikan GPS aktif.');
      return;
    }

    try {
      setScanError('');
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsScanning(true);
      scanForQR();
    } catch (err) {
      console.error('Camera error:', err);
      setScanError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  };

  // Scan for QR code
  const scanForQR = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Here you would integrate with a QR code library like qr-scanner or jsQR
      // For this example, we'll simulate QR detection
      try {
        // In a real implementation, you would use:
        // const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
        // if (qrCode) {
        //   handleQRDetected(qrCode.data);
        //   return;
        // }
      } catch (err) {
        console.error('QR scanning error:', err);
      }
    }

    // Continue scanning
    setTimeout(() => scanForQR(), 100);
  };

  // Handle QR code detection
  const handleQRDetected = async (qrData: string) => {
    stopCamera();
    await handleAttendanceSubmission('qr', qrData);
  };

  // Handle token submission
  const handleTokenSubmit = async () => {
    if (!tokenInput.trim()) {
      setError('Masukkan kode token presensi');
      return;
    }

    await handleAttendanceSubmission('token', tokenInput.trim());
  };

  // Unified attendance submission handler
  const handleAttendanceSubmission = async (method: 'qr' | 'token', data: string) => {
    if (!location) {
      setError('Lokasi diperlukan untuk presensi. Pastikan GPS aktif.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let endpoint = '';
      let payload: any = {
        latitude: location.latitude,
        longitude: location.longitude
      };

      if (method === 'qr') {
        endpoint = `${API_URL}/code-attendance/validate-qrcode`;
        payload.qrCode = data;
      } else {
        endpoint = `${API_URL}/code-attendance/validate-token`;
        payload.token = data;
      }

      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const result: AttendanceResponse = response.data;
      setSuccess(result.message);
      
      if (method === 'token') {
        setTokenInput('');
      }
      
      if (result.meeting_url) {
        setMeetingUrl(result.meeting_url);
      }

      // Reload attendance status after successful submission
      setTimeout(() => {
        loadAttendanceStatus();
      }, 1000);

    } catch (err: any) {
      console.error('Attendance submission error:', err);
      setError(err.response?.data?.message || `Gagal memvalidasi ${method === 'qr' ? 'QR Code' : 'token'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    stopCamera();
    setTokenInput('');
    setError('');
    setSuccess('');
    setScanError('');
    setMeetingUrl(null);
    setLocation(null);
    setLocationError('');
    setAttendanceStatus(null);
    setStatusLoading(true);
    onClose();
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status display components
  const getStatusDisplay = () => {
    if (!attendanceStatus) return null;

    const { classStatus, studentStatus, classInfo, attendanceHistory } = attendanceStatus;

    // Status badges
    const getClassStatusBadge = () => {
      switch (classStatus) {
        case 'not_started':
          return <Badge bg="secondary" className="tw-text-sm">Belum Dimulai</Badge>;
        case 'ongoing':
          return <Badge bg="success" className="tw-text-sm">Sedang Berlangsung</Badge>;
        case 'finished':
          return <Badge bg="primary" className="tw-text-sm">Telah Selesai</Badge>;
      }
    };

    const getStudentStatusBadge = () => {
      switch (studentStatus) {
        case 'not_attended':
          return <Badge bg="warning" className="tw-text-sm tw-flex tw-items-center tw-gap-1"><FaTimesCircle size={12} /> Belum Presensi</Badge>;
        case 'checked_in':
          return <Badge bg="info" className="tw-text-sm tw-flex tw-items-center tw-gap-1"><FaClock size={12} /> Sudah Masuk</Badge>;
        case 'checked_out':
          return <Badge bg="success" className="tw-text-sm tw-flex tw-items-center tw-gap-1"><FaCheckCircle size={12} /> Lengkap</Badge>;
      }
    };

    return (
      <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
        <Card.Header className="tw-bg-blue-50 tw-border-0">
          <div className="tw-flex tw-items-center tw-justify-between">
            <h6 className="tw-font-semibold tw-text-blue-800 tw-mb-0">Status Presensi</h6>
            <div className="tw-flex tw-gap-2">
              {getClassStatusBadge()}
              {getStudentStatusBadge()}
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="tw-space-y-3">
            {/* Attendance History */}
            {(attendanceHistory.check_in || attendanceHistory.check_out) && (
              <div className="tw-bg-gray-50 tw-p-3 tw-rounded">
                <div className="tw-font-semibold tw-text-gray-700 tw-mb-2">Riwayat Presensi:</div>
                {attendanceHistory.check_in && (
                  <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-green-600">
                    <CheckCircle size={16} />
                    <span>Masuk: {formatTimestamp(attendanceHistory.check_in.timestamp)}</span>
                  </div>
                )}
                {attendanceHistory.check_out && (
                  <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-blue-600 tw-mt-1">
                    <Clock size={16} />
                    <span>Keluar: {formatTimestamp(attendanceHistory.check_out.timestamp)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Status Messages */}
            {classStatus === 'not_started' && (
              <Alert variant="info">
                <strong>Kelas Belum Dimulai</strong><br />
                Presensi akan tersedia setelah guru memulai kelas.
              </Alert>
            )}

            {classStatus === 'ongoing' && studentStatus === 'not_attended' && (
              <Alert variant="warning">
                <strong>Silakan Presensi Masuk</strong><br />
                Kelas sedang berlangsung. Lakukan presensi masuk untuk bergabung.
              </Alert>
            )}

            {classStatus === 'ongoing' && studentStatus === 'checked_in' && (
              <Alert variant="info">
                <strong>Anda Sudah Presensi Masuk</strong><br />
                Anda dapat melakukan presensi keluar sebelum kelas berakhir.
              </Alert>
            )}

            {classStatus === 'finished' && studentStatus === 'not_attended' && (
              <Alert variant="danger">
                <strong>Kelas Telah Berakhir</strong><br />
                Anda tidak dapat lagi melakukan presensi karena kelas sudah selesai dan Anda belum pernah presensi masuk.
              </Alert>
            )}

            {classStatus === 'finished' && studentStatus === 'checked_in' && (
              <Alert variant="warning">
                <strong>Presensi Keluar Masih Tersedia</strong><br />
                Kelas telah berakhir, tetapi Anda masih dapat melakukan presensi keluar.
              </Alert>
            )}

            {studentStatus === 'checked_out' && (
              <Alert variant="success">
                <strong>Presensi Lengkap</strong><br />
                Anda telah menyelesaikan presensi masuk dan keluar untuk kelas ini.
              </Alert>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };

  const bottomButtons = [
    {
      action: 'close' as const,
      text: 'Tutup',
      onClick: handleClose
    }
  ];

  if (!classData) return null;

  return (
    <LearningModal
      show={show}
      onHide={handleClose}
      title="Presensi Kelas"
      subtitle={`${classData.name} - ${classData.course_name}`}
      icon={<QrCode className="tw-w-5 tw-h-5" />}
      size="lg"
      width="90vw"
      height="85vh"
      bottomButtons={bottomButtons}
      preventCloseOnOutsideClick={false}
    >
      {/* Loading Status */}
      {statusLoading && (
        <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
          <Card.Body className="tw-text-center tw-py-4">
            <div>Memuat status presensi...</div>
          </Card.Body>
        </Card>
      )}

      {/* Status Display */}
      {!statusLoading && getStatusDisplay()}

      {/* Class Information */}
      {!statusLoading && attendanceStatus && (
        <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
          <Card.Header className="tw-bg-gray-50 tw-border-0">
            <h6 className="tw-font-semibold tw-text-gray-800 tw-mb-0">Informasi Kelas</h6>
          </Card.Header>
          <Card.Body>
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3">
              <div>
                <strong className="tw-text-gray-700">Nama Kelas:</strong>
                <div className="tw-text-gray-600">{attendanceStatus.classInfo.name}</div>
              </div>
              <div>
                <strong className="tw-text-gray-700">Mata Pelajaran:</strong>
                <div className="tw-text-gray-600">{attendanceStatus.classInfo.course_name}</div>
              </div>
              <div>
                <strong className="tw-text-gray-700">Guru:</strong>
                <div className="tw-text-gray-600">{attendanceStatus.classInfo.teacher_name}</div>
              </div>
              <div>
                <strong className="tw-text-gray-700">Mode Kelas:</strong>
                <div className={`tw-flex tw-items-center tw-gap-2 tw-font-medium ${
                  attendanceStatus.classInfo.class_mode === 'online' ? 'tw-text-blue-600' : 'tw-text-green-600'
                }`}>
                  {attendanceStatus.classInfo.class_mode === 'online' ? <Video size={16} /> : <MapPin size={16} />}
                  {attendanceStatus.classInfo.class_mode === 'online' ? 'Online' : 'Offline'}
                </div>
                {
                  attendanceStatus.classInfo.class_mode === 'online' ?
                  <div>
                    <strong className="tw-text-gray-700">URL Kelas:</strong>
                    <div className="tw-text-blue-600"><a href={attendanceStatus.classInfo.meeting_url}>Klik disini</a></div>
                  </div>:
                  ''
                }
              </div>
              {attendanceStatus.classInfo.real_start_datetime && (
                <div>
                  <strong className="tw-text-gray-700">Dimulai:</strong>
                  <div className="tw-text-gray-600">{formatTimestamp(attendanceStatus.classInfo.real_start_datetime)}</div>
                </div>
              )}
              {attendanceStatus.classInfo.real_end_datetime && (
                <div>
                  <strong className="tw-text-gray-700">Berakhir:</strong>
                  <div className="tw-text-gray-600">{formatTimestamp(attendanceStatus.classInfo.real_end_datetime)}</div>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Location Status */}
      {locationError ? (
        <Alert variant="warning" className="tw-mb-4">
          <strong>Peringatan GPS:</strong> {locationError}
        </Alert>
      ) : location ? (
        <Alert variant="success" className="tw-mb-4">
          <strong>GPS Aktif:</strong> Lokasi berhasil diperoleh untuk presensi
        </Alert>
      ) : (
        <Alert variant="info" className="tw-mb-4">
          <strong>Mengambil Lokasi GPS...</strong> Pastikan izin lokasi telah diberikan
        </Alert>
      )}

      {/* Attendance Actions */}
      {!statusLoading && attendanceStatus && (attendanceStatus.canCheckIn || attendanceStatus.canCheckOut) && (
        <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
          <Card.Header className="tw-bg-green-50 tw-border-0">
            <h6 className="tw-font-semibold tw-text-green-800 tw-mb-0">
              {attendanceStatus.canCheckIn ? 'Presensi Masuk' : 'Presensi Keluar'}
            </h6>
          </Card.Header>
          <Card.Body>
            {/* Attendance Type Selection (if both are available) */}
            {attendanceStatus.canCheckIn && attendanceStatus.canCheckOut && (
              <div className="tw-mb-4">
                <label className="tw-font-semibold tw-text-gray-700 tw-block tw-mb-2">
                  Jenis Presensi:
                </label>
                <ButtonGroup className="tw-w-full">
                  <Button
                    variant={attendanceType === 'check_in' ? 'primary' : 'outline-primary'}
                    onClick={() => setAttendanceType('check_in')}
                    className="tw-flex tw-items-center tw-justify-center tw-gap-2"
                  >
                    <CheckCircle size={16} />
                    Presensi Masuk
                  </Button>
                  <Button
                    variant={attendanceType === 'check_out' ? 'primary' : 'outline-primary'}
                    onClick={() => setAttendanceType('check_out')}
                    className="tw-flex tw-items-center tw-justify-center tw-gap-2"
                  >
                    <Clock size={16} />
                    Presensi Keluar
                  </Button>
                </ButtonGroup>
              </div>
            )}

            {/* Method Selection */}
            <ButtonGroup className="tw-w-full tw-mb-4">
              <Button
                variant={attendanceMethod === 'qr' ? 'primary' : 'outline-primary'}
                onClick={() => {
                  setAttendanceMethod('qr');
                  stopCamera();
                  setError('');
                  setSuccess('');
                }}
                className="tw-flex tw-items-center tw-justify-center tw-gap-2"
              >
                <FaQrcode />
                Scan QR Code
              </Button>
              <Button
                variant={attendanceMethod === 'token' ? 'primary' : 'outline-primary'}
                onClick={() => {
                  setAttendanceMethod('token');
                  stopCamera();
                  setError('');
                  setSuccess('');
                }}
                className="tw-flex tw-items-center tw-justify-center tw-gap-2"
              >
                <FaKeyboard />
                Input Token
              </Button>
            </ButtonGroup>

            {/* QR Scanner */}
            {attendanceMethod === 'qr' && (
              <div className="tw-space-y-4">
                {!isScanning ? (
                  <div className="tw-text-center">
                    <ButtonGradient
                      action="custom"
                      customText="Mulai Scan QR Code"
                      onClick={startQRScanning}
                      disabled={!location || isLoading}
                      customColors={{
                        primary: '#059669',
                        secondary: '#047857',
                        gradient1: '#059669',
                        gradient2: '#10B981',
                        text: '#FFFFFF'
                      }}
                    />
                    <div className="tw-text-sm tw-text-gray-500 tw-mt-2">
                      Arahkan kamera ke QR Code yang ditampilkan guru
                    </div>
                  </div>
                ) : (
                  <div className="tw-space-y-3">
                    <div className="tw-relative tw-bg-black tw-rounded-lg tw-overflow-hidden">
                      <video
                        ref={videoRef}
                        className="tw-w-full tw-h-80 tw-object-cover"
                        autoPlay
                        muted
                        playsInline
                      />
                      <canvas
                        ref={canvasRef}
                        className="tw-hidden"
                      />
                      <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-pointer-events-none">
                        <div className="tw-w-48 tw-h-48 tw-border-2 tw-border-white tw-border-dashed tw-rounded-lg"></div>
                      </div>
                    </div>
                    
                    <div className="tw-text-center">
                      <ButtonGradient
                        action="custom"
                        customText="Hentikan Scan"
                        onClick={stopCamera}
                        customColors={{
                          primary: '#EF4444',
                          secondary: '#DC2626',
                          gradient1: '#EF4444',
                          gradient2: '#F87171',
                          text: '#FFFFFF'
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {scanError && (
                  <Alert variant="danger">
                    {scanError}
                  </Alert>
                )}
              </div>
            )}

            {/* Token Input */}
            {attendanceMethod === 'token' && (
              <div className="tw-space-y-4">
                <div>
                  <label className="tw-font-semibold tw-text-gray-700 tw-block tw-mb-2">
                    Masukkan Kode Token Presensi:
                  </label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                      placeholder="Contoh: ABC12345"
                      maxLength={8}
                      className="tw-text-center tw-text-lg tw-font-mono tw-tracking-widest"
                      disabled={isLoading || !location}
                    />
                    <Button
                      variant="primary"
                      onClick={handleTokenSubmit}
                      disabled={isLoading || !location || !tokenInput.trim()}
                    >
                      {isLoading ? 'Validasi...' : 'Submit'}
                    </Button>
                  </InputGroup>
                  <small className="tw-text-gray-500">
                    Masukkan kode 8 digit yang ditampilkan oleh guru
                  </small>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="tw-mb-4">
          {error}
        </Alert>
      )}

      {/* Success Display */}
      {success && (
        <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
          <Card.Header className="tw-bg-green-50 tw-border-0">
            <Alert variant="success" className="tw-mb-0">
              <strong>Presensi Berhasil!</strong>
            </Alert>
          </Card.Header>
          <Card.Body>
            <div className="tw-text-center">
              <div className="tw-text-green-600 tw-font-medium tw-mb-3">
                {success}
              </div>
              
              {/* Meeting URL Display for Online Classes */}
              {meetingUrl && attendanceStatus?.classInfo.class_mode === 'online' && (
                <div className="tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-space-y-3">
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-text-blue-800 tw-font-semibold">
                    <Video size={20} />
                    <span>Link Meeting Kelas Online</span>
                  </div>
                  
                  <div className="tw-bg-white tw-p-3 tw-rounded tw-border">
                    <a 
                      href={meetingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="tw-text-blue-600 tw-break-all hover:tw-underline tw-text-sm"
                    >
                      {meetingUrl}
                    </a>
                  </div>
                  
                  <div className="tw-flex tw-gap-2 tw-justify-center">
                    <ButtonGradient
                      action="custom"
                      customText="Salin Link"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(meetingUrl).then(() => {
                          alert('Link meeting berhasil disalin!');
                        }).catch(() => {
                          alert('Gagal menyalin link meeting');
                        });
                      }}
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
                      onClick={() => window.open(meetingUrl, '_blank')}
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
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Instructions */}
      <Card className="tw-border-0 tw-shadow-sm">
        <Card.Header className="tw-bg-gray-50 tw-border-0">
          <h6 className="tw-font-semibold tw-text-gray-800 tw-mb-0">Petunjuk Presensi</h6>
        </Card.Header>
        <Card.Body>
          <div className="tw-space-y-2 tw-text-sm tw-text-gray-600">
            <div><strong>Scan QR Code:</strong> Arahkan kamera ke QR Code yang ditampilkan guru</div>
            <div><strong>Input Token:</strong> Masukkan kode 8 digit yang diberikan guru</div>
            <div><strong>GPS:</strong> Pastikan GPS aktif untuk verifikasi lokasi presensi</div>
            <div><strong>Presensi Masuk:</strong> Lakukan saat kelas dimulai untuk bergabung</div>
            <div><strong>Presensi Keluar:</strong> Lakukan sebelum meninggalkan kelas</div>
            {attendanceStatus?.classInfo.class_mode === 'online' && (
              <div className="tw-mt-3 tw-p-3 tw-bg-blue-50 tw-rounded">
                <strong className="tw-text-blue-800">Kelas Online:</strong> 
                <span className="tw-text-blue-700"> Setelah presensi masuk berhasil, Anda akan mendapat link meeting untuk bergabung ke kelas</span>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </LearningModal>
  );
};

export default StudentAttendanceModal;