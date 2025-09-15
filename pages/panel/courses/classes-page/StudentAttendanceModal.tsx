// pages/panel/courses/classes-page/StudentAttendanceModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Alert, Card, ButtonGroup, Button, InputGroup, Form } from 'react-bootstrap';
import { QrCode, KeyboardIcon, Video, MapPin, ExternalLink } from 'lucide-react';
import { FaQrcode, FaKeyboard, FaVideo, FaMapMarkerAlt } from 'react-icons/fa';
import { LearningModal } from '../../../../components/modal/ModalTemplate';
import { ButtonGradient } from '../../../../components/button/ButtonTemplate';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';

interface StudentAttendanceModalProps {
  show: boolean;
  onClose: () => void;
  classData: any;
}

interface AttendanceResponse {
  message: string;
  meeting_url?: string;
}

const StudentAttendanceModal: React.FC<StudentAttendanceModalProps> = ({ show, onClose, classData }) => {
  const { id: currentUserId } = useAuth();
  
  // Attendance method selection
  const [attendanceMethod, setAttendanceMethod] = useState<'qr' | 'token'>('qr');
  
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
    
    if (!location) {
      setError('Lokasi diperlukan untuk presensi');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/code-attendance/validate-qrcode`,
        {
          qrCode: qrData,
          latitude: location.latitude,
          longitude: location.longitude
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      const result: AttendanceResponse = response.data;
      setSuccess(result.message);
      
      if (result.meeting_url) {
        setMeetingUrl(result.meeting_url);
      }
    } catch (err: any) {
      console.error('QR validation error:', err);
      setError(err.response?.data?.message || 'Gagal memvalidasi QR Code');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle token submission
  const handleTokenSubmit = async () => {
    if (!tokenInput.trim()) {
      setError('Masukkan kode token presensi');
      return;
    }

    if (!location) {
      setError('Lokasi diperlukan untuk presensi. Pastikan GPS aktif.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${API_URL}/code-attendance/validate-token`,
        {
          token: tokenInput.trim(),
          latitude: location.latitude,
          longitude: location.longitude
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      const result: AttendanceResponse = response.data;
      setSuccess(result.message);
      setTokenInput('');
      
      if (result.meeting_url) {
        setMeetingUrl(result.meeting_url);
      }
    } catch (err: any) {
      console.error('Token validation error:', err);
      setError(err.response?.data?.message || 'Token tidak valid atau sudah kedaluwarsa');
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
    onClose();
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
      {/* Class Information */}
      <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
        <Card.Header className="tw-bg-blue-50 tw-border-0">
          <h6 className="tw-font-semibold tw-text-blue-800 tw-mb-0">Informasi Kelas</h6>
        </Card.Header>
        <Card.Body>
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3">
            <div>
              <strong className="tw-text-gray-700">Nama Kelas:</strong>
              <div className="tw-text-gray-600">{classData.name}</div>
            </div>
            <div>
              <strong className="tw-text-gray-700">Mata Pelajaran:</strong>
              <div className="tw-text-gray-600">{classData.course_name}</div>
            </div>
            <div>
              <strong className="tw-text-gray-700">Guru:</strong>
              <div className="tw-text-gray-600">{classData.teacher_name}</div>
            </div>
            <div>
              <strong className="tw-text-gray-700">Mode Kelas:</strong>
              <div className={`tw-flex tw-items-center tw-gap-2 tw-font-medium ${
                classData.class_mode === 'online' ? 'tw-text-blue-600' : 'tw-text-green-600'
              }`}>
                {classData.class_mode === 'online' ? <Video size={16} /> : <MapPin size={16} />}
                {classData.class_mode === 'online' ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

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

      {/* Attendance Method Selection */}
      <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
        <Card.Header className="tw-bg-green-50 tw-border-0">
          <h6 className="tw-font-semibold tw-text-green-800 tw-mb-0">Metode Presensi</h6>
        </Card.Header>
        <Card.Body>
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
              {meetingUrl && (
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
            {classData.class_mode === 'online' && (
              <div className="tw-mt-3 tw-p-3 tw-bg-blue-50 tw-rounded">
                <strong className="tw-text-blue-800">Kelas Online:</strong> 
                <span className="tw-text-blue-700"> Setelah presensi berhasil, Anda akan mendapat link meeting untuk bergabung ke kelas</span>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </LearningModal>
  );
};

export default StudentAttendanceModal;