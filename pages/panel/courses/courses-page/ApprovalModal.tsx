// pages/panel/courses/courses-page/ApprovalModal.tsx

import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Card, Badge, ButtonGroup, Button } from 'react-bootstrap';
import { CheckCircle, XCircle, User, Calendar, Clock, BookOpen, Award } from 'lucide-react';
import { LearningModal } from '../../../../components/modal/ModalTemplate';
import { useAuth } from '../../../../context/AuthContext';

interface ApprovalModalProps {
  show: boolean;
  onClose: () => void;
  courseData: any;
  onSave: () => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ show, onClose, courseData, onSave }) => {
  const { role: userRole, id: currentUserId, username } = useAuth();
  
  // State for approval decision
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Reset state when modal closes or opens
  useEffect(() => {
    if (show) {
      setApprovalStatus('approved');
      setRejectionReason('');
      setError('');
    }
  }, [show]);

  // Handle approval submission
  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Validation for rejection
      if (approvalStatus === 'rejected' && !rejectionReason.trim()) {
        throw new Error('Mohon berikan alasan penolakan');
      }

      // Prepare approval data
      const approvalData = {
        approval_status: approvalStatus,
        rejection_reason: approvalStatus === 'rejected' ? rejectionReason.trim() : undefined
      };

      console.log('Sending approval data:', approvalData);

      const response = await fetch(`${API_URL}/courses/${courseData.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(approvalData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memproses persetujuan');
      }

      const result = await response.json();
      
      const successMessage = approvalStatus === 'approved' 
        ? `Kursus "${courseData.title}" berhasil disetujui!`
        : `Kursus "${courseData.title}" telah ditolak.`;
      
      alert(successMessage);
      onSave();
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setApprovalStatus('approved');
    setRejectionReason('');
    setError('');
    onClose();
  };

  if (!courseData) return null;

  const bottomButtons = [
    {
      action: 'cancel' as const,
      text: 'Batal',
      onClick: handleClose,
      disabled: isLoading
    },
    {
      action: 'save' as const,
      text: isLoading 
        ? 'Memproses...' 
        : approvalStatus === 'approved' 
          ? 'Setujui Kursus'
          : 'Tolak Kursus',
      onClick: handleSubmit,
      disabled: isLoading,
      loading: isLoading,
      customColors: approvalStatus === 'rejected' ? {
        primary: '#EF4444',
        secondary: '#DC2626',
        gradient1: '#EF4444',
        gradient2: '#F87171',
        text: '#FFFFFF'
      } : undefined
    }
  ];

  return (
    <LearningModal
      show={show}
      onHide={handleClose}
      title="Persetujuan Kursus"
      subtitle={`Setujui atau tolak kursus "${courseData.title}"`}
      icon={<CheckCircle className="tw-w-5 tw-h-5" />}
      size="lg"
      width="110vw"
      height="120vh"
      bottomButtons={bottomButtons}
      preventCloseOnOutsideClick={false}
    >
      {error && (
        <Alert variant="danger" className="tw-mb-4">
          {error}
        </Alert>
      )}

      {/* User Role Info */}
      <Alert variant="info" className="tw-mb-4">
        <strong>Mode Persetujuan:</strong> Administrator
        <div className="tw-mt-1 tw-text-sm">
          Sebagai admin, Anda dapat menyetujui atau menolak kursus yang dibuat oleh guru.
          Kursus yang disetujui akan dapat digunakan oleh seluruh pengguna sistem.
        </div>
      </Alert>

      {/* Course Information */}
      <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
        <Card.Header className="tw-bg-blue-50 tw-border-0">
          <h6 className="tw-font-semibold tw-text-blue-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
            <BookOpen className="tw-w-4 tw-h-4" />
            Detail Kursus yang Memerlukan Persetujuan
          </h6>
        </Card.Header>
        <Card.Body>
          <div className="tw-space-y-4">
            {/* Course Image and Basic Info */}
            <Row className="tw-items-center">
              <Col md={3} className="tw-text-center tw-mb-3 md:tw-mb-0">
                {courseData.imageUrl ? (
                  <img 
                    src={courseData.imageUrl} 
                    alt={courseData.title}
                    className="tw-w-full tw-h-24 tw-object-cover tw-rounded-lg tw-shadow-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.innerHTML = '<div class="tw-w-full tw-h-24 tw-bg-gray-200 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-gray-500"><BookOpen class="tw-w-6 tw-h-6" /></div>';
                    }}
                  />
                ) : (
                  <div className="tw-w-full tw-h-24 tw-bg-gray-200 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-gray-500">
                    <BookOpen className="tw-w-6 tw-h-6" />
                  </div>
                )}
              </Col>
              <Col md={9}>
                <div className="tw-space-y-2">
                  <h5 className="tw-font-bold tw-text-gray-800 tw-mb-1">{courseData.title}</h5>
                  <p className="tw-text-gray-600 tw-text-sm tw-leading-relaxed tw-line-clamp-3">
                    {courseData.description || 'Tidak ada deskripsi'}
                  </p>
                </div>
              </Col>
            </Row>

            {/* Learning Points */}
            {courseData.learning_point && courseData.learning_point.length > 0 && (
              <div>
                <strong className="tw-text-gray-700 tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <Award className="tw-w-4 tw-h-4 tw-text-purple-600" />
                  Poin Pembelajaran ({courseData.learning_point.length} poin):
                </strong>
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-2">
                  {courseData.learning_point.slice(0, 6).map((point: string, index: number) => (
                    <div 
                      key={index}
                      className="tw-flex tw-items-start tw-gap-2 tw-p-2 tw-bg-purple-50 tw-rounded tw-border tw-border-purple-100"
                    >
                      <div className="tw-w-5 tw-h-5 tw-bg-purple-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold tw-flex-shrink-0 tw-mt-0.5">
                        {index + 1}
                      </div>
                      <span className="tw-text-sm tw-text-gray-700">{point}</span>
                    </div>
                  ))}
                  {courseData.learning_point.length > 6 && (
                    <div className="tw-text-center tw-text-gray-500 tw-text-sm tw-italic tw-col-span-full">
                      ... dan {courseData.learning_point.length - 6} poin lainnya
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Creator and Date Info */}
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div>
                <strong className="tw-text-gray-700">Pembuat Kursus:</strong>
                <div className="tw-text-gray-600 tw-flex tw-items-center tw-gap-2 tw-mt-1">
                  <div className="tw-w-6 tw-h-6 tw-bg-blue-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold">
                    {courseData.creator_name ? courseData.creator_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  {courseData.creator_name || 'Unknown'}
                </div>
              </div>
              <div>
                <strong className="tw-text-gray-700">Tanggal Dibuat:</strong>
                <div className="tw-text-gray-600 tw-flex tw-items-center tw-gap-1 tw-mt-1">
                  <Calendar className="tw-w-4 tw-h-4" />
                  {courseData.create_date ? new Date(courseData.create_date).toLocaleString('id-ID') : '-'}
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Approval Decision */}
      <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
        <Card.Header className="tw-bg-yellow-50 tw-border-0">
          <h6 className="tw-font-semibold tw-text-yellow-800 tw-mb-0">
            Keputusan Persetujuan
          </h6>
        </Card.Header>
        <Card.Body>
          <div className="tw-space-y-4">
            {/* Approval Status Selection */}
            <div>
              <label className="tw-font-semibold tw-text-gray-700 tw-mb-3 tw-block">
                Keputusan Persetujuan:
              </label>
              <ButtonGroup className="tw-w-full">
                <Button
                  variant={approvalStatus === 'approved' ? 'success' : 'outline-success'}
                  onClick={() => setApprovalStatus('approved')}
                  className="tw-flex tw-items-center tw-justify-center tw-gap-2"
                >
                  <CheckCircle size={16} />
                  Setujui
                </Button>
                <Button
                  variant={approvalStatus === 'rejected' ? 'danger' : 'outline-danger'}
                  onClick={() => setApprovalStatus('rejected')}
                  className="tw-flex tw-items-center tw-justify-center tw-gap-2"
                >
                  <XCircle size={16} />
                  Tolak
                </Button>
              </ButtonGroup>
            </div>

            {/* Approval Information */}
            {approvalStatus === 'approved' && (
              <Alert variant="success" className="tw-flex tw-items-center tw-gap-2">
                <CheckCircle className="tw-w-5 tw-h-5 tw-text-green-600" />
                <div>
                  <strong>Persetujuan:</strong> Dengan mengklik "Setujui Kursus", kursus ini akan dapat digunakan oleh seluruh pengguna sistem.
                  <div className="tw-mt-1 tw-text-sm">
                    Kursus akan muncul dalam daftar kursus yang tersedia dan dapat digunakan untuk membuat kelas.
                  </div>
                </div>
              </Alert>
            )}

            {/* Rejection Reason */}
            {approvalStatus === 'rejected' && (
              <div>
                <label className="tw-font-semibold tw-text-gray-700 tw-block tw-mb-2">
                  Alasan Penolakan *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Masukkan alasan mengapa kursus ini ditolak..."
                  className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-resize-none focus:tw-ring-2 focus:tw-ring-red-500 focus:tw-border-red-500"
                  rows={4}
                  required
                />
                <small className="tw-text-gray-500">
                  Alasan ini akan diberikan kepada pembuat kursus sebagai feedback untuk perbaikan.
                </small>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Summary */}
      <Card className="tw-border-0 tw-shadow-sm">
        <Card.Header className={`tw-border-0 ${
          approvalStatus === 'approved' ? 'tw-bg-green-50' : 'tw-bg-red-50'
        }`}>
          <h6 className={`tw-font-semibold tw-mb-0 ${
            approvalStatus === 'approved' ? 'tw-text-green-800' : 'tw-text-red-800'
          }`}>
            Ringkasan Keputusan
          </h6>
        </Card.Header>
        <Card.Body>
          <div className="tw-space-y-2 tw-text-sm">
            <div>
              <span className="tw-font-medium">Kursus:</span> {courseData.title}
            </div>
            <div>
              <span className="tw-font-medium">Keputusan:</span>
              <span className={`tw-ml-2 tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium ${
                approvalStatus === 'approved' 
                  ? 'tw-bg-green-100 tw-text-green-800' 
                  : 'tw-bg-red-100 tw-text-red-800'
              }`}>
                {approvalStatus === 'approved' ? 'DISETUJUI' : 'DITOLAK'}
              </span>
            </div>
            
            {approvalStatus === 'rejected' && rejectionReason && (
              <div>
                <span className="tw-font-medium">Alasan Penolakan:</span> {rejectionReason}
              </div>
            )}
            
            <div>
              <span className="tw-font-medium">Diproses oleh:</span> 
              Administrator ({username || 'Unknown'})
            </div>
            
            {approvalStatus === 'approved' && (
              <div className="tw-mt-3 tw-p-2 tw-bg-green-50 tw-rounded tw-border tw-border-green-200">
                <div className="tw-text-green-700 tw-text-xs">
                  <strong>Dampak:</strong> Kursus akan tersedia untuk semua pengguna dan dapat digunakan untuk membuat kelas pembelajaran.
                </div>
              </div>
            )}
            
            {approvalStatus === 'rejected' && (
              <div className="tw-mt-3 tw-p-2 tw-bg-red-50 tw-rounded tw-border tw-border-red-200">
                <div className="tw-text-red-700 tw-text-xs">
                  <strong>Dampak:</strong> Kursus tidak akan tersedia untuk pengguna lain. Pembuat kursus dapat memperbaiki dan mengajukan kembali.
                </div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </LearningModal>
  );
};

export default ApprovalModal;