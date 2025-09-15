// pages/panel/courses/classes-page/ApprovalModal.tsx

import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Card, Badge, ButtonGroup, Button } from 'react-bootstrap';
import { CheckCircle, XCircle, User, Users, Calendar, Clock, BookOpen } from 'lucide-react';
import { LearningModal } from '../../../../components/modal/ModalTemplate';
import { SearchSingleField, SelectOption } from '../../../../components/form/FormComponentLayout';
import { useAuth } from '../../../../context/AuthContext';

interface ApprovalModalProps {
  show: boolean;
  onClose: () => void;
  classData: any;
  onSave: () => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ show, onClose, classData, onSave }) => {
  const { role: userRole, id: currentUserId, username } = useAuth();
  
  // State for approval decision - teacher can only approve, admin can approve/reject
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Teacher selection (for admin approval only)
  const [selectedTeacher, setSelectedTeacher] = useState<SelectOption | null>(null);
  const [teacherOptions, setTeacherOptions] = useState<SelectOption[]>([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Debounce hook
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedTeacherSearch = useDebounce(teacherSearchTerm, 300);

  // Fetch teacher options for admin using new unified endpoint
  const fetchTeacherOptions = async (searchTerm: string = '') => {
    if (userRole !== 'admin') return;
    
    setTeacherLoading(true);
    try {
      const url = searchTerm.trim() 
        ? `${API_URL}/users/search/teacher?search=${encodeURIComponent(searchTerm)}`
        : `${API_URL}/users/search/teacher`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to search teachers');
      
      const data: SelectOption[] = await response.json();
      setTeacherOptions(data);
    } catch (error) {
      console.error('Error searching teachers:', error);
      setTeacherOptions([]);
    } finally {
      setTeacherLoading(false);
    }
  };

  // Effect for teacher search (only for admin)
  useEffect(() => {
    if (userRole === 'admin' && show) {
      fetchTeacherOptions(debouncedTeacherSearch);
    }
  }, [debouncedTeacherSearch, userRole, show]);

  // Auto-set teacher for teacher role approval
  useEffect(() => {
    if (userRole === 'teacher' && show) {
      // Teacher can only approve and becomes the teacher automatically
      setApprovalStatus('approved');
      setSelectedTeacher({
        label: `${username || 'Saya'} (Akan menjadi guru)`,
        value: currentUserId?.toString() || ''
      });
    } else if (userRole === 'admin' && show) {
      // Reset for admin
      setSelectedTeacher(null);
      if (approvalStatus === 'approved') {
        fetchTeacherOptions();
      }
    }
  }, [userRole, currentUserId, username, show]);

  // Reset state when modal closes or opens
  useEffect(() => {
    if (show) {
      // Teachers can only approve, admins can choose
      setApprovalStatus('approved');
      setRejectionReason('');
      setError('');
      setTeacherSearchTerm('');
      if (userRole === 'admin') {
        setSelectedTeacher(null);
      }
    }
  }, [show, userRole]);

  // Handle teacher selection (only for admin)
  const handleTeacherChange = (newValue: any) => {
    if (userRole === 'admin') {
      setSelectedTeacher(newValue);
    }
  };

  // Handle approval submission
  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Validation
      if (approvalStatus === 'approved') {
        if (userRole === 'admin' && !selectedTeacher) {
          throw new Error('Mohon pilih guru pengajar untuk kelas yang disetujui');
        }
        // For teacher role, selectedTeacher is auto-set
      } else if (approvalStatus === 'rejected') {
        if (!rejectionReason.trim()) {
          throw new Error('Mohon berikan alasan penolakan');
        }
      }

      // Prepare approval data
      const approvalData = {
        approval_status: approvalStatus,
        // For teacher role: they become the teacher, for admin: selected teacher
        teacher_id: approvalStatus === 'approved' ? selectedTeacher?.value : undefined,
        rejection_reason: approvalStatus === 'rejected' ? rejectionReason.trim() : undefined
      };

      console.log('Sending approval data:', approvalData);

      const response = await fetch(`${API_URL}/classes/${classData.id}/approve`, {
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
        ? `Kelas "${classData.name}" berhasil disetujui!${userRole === 'teacher' ? ' Anda telah menjadi guru pengajar.' : ''}`
        : `Kelas "${classData.name}" telah ditolak.`;
      
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
    setSelectedTeacher(null);
    setTeacherOptions([]);
    setTeacherSearchTerm('');
    setError('');
    onClose();
  };

  if (!classData) return null;

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
        : userRole === 'teacher'
          ? 'Setujui & Jadi Guru'
          : approvalStatus === 'approved' 
            ? 'Setujui Kelas'
            : 'Tolak Kelas',
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
      title="Persetujuan Kelas"
      subtitle={`${userRole === 'teacher' ? 'Ambil' : 'Setujui atau tolak'} kelas "${classData.name}"`}
      icon={<CheckCircle className="tw-w-5 tw-h-5" />}
      size="lg"
      width="90vw"
      height="80vh"
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
        <strong>Mode Persetujuan:</strong> {userRole === 'admin' ? 'Administrator' : 'Guru'}
        {userRole === 'teacher' && (
          <div className="tw-mt-1 tw-text-sm">
            Sebagai guru, Anda dapat mengambil kelas yang belum memiliki guru pengajar. 
            Jika disetujui, Anda akan menjadi guru pengajar untuk kelas ini.
            <div className="tw-mt-1 tw-font-medium tw-text-blue-600">
              Catatan: Jika Anda tidak ingin mengambil kelas ini, cukup tutup modal ini agar guru lain dapat mengambilnya.
            </div>
          </div>
        )}
        {userRole === 'admin' && (
          <div className="tw-mt-1 tw-text-sm">
            Sebagai admin, Anda dapat menyetujui atau menolak kelas, serta menentukan guru pengajar.
          </div>
        )}
      </Alert>

      {/* Class Information */}
      <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
        <Card.Header className="tw-bg-blue-50 tw-border-0">
          <h6 className="tw-font-semibold tw-text-blue-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
            <BookOpen className="tw-w-4 tw-h-4" />
            Detail Kelas yang Memerlukan Persetujuan
          </h6>
        </Card.Header>
        <Card.Body>
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
            <div>
              <strong className="tw-text-gray-700">Nama Kelas:</strong>
              <div className="tw-text-gray-600 tw-font-medium">{classData.name}</div>
            </div>
            <div>
              <strong className="tw-text-gray-700">Mata Pelajaran:</strong>
              <div className="tw-text-gray-600">{classData.course_name}</div>
            </div>
            <div className="tw-col-span-full">
              <strong className="tw-text-gray-700">Deskripsi:</strong>
              <div className="tw-text-gray-600">{classData.description || 'Tidak ada deskripsi'}</div>
            </div>
            <div>
              <strong className="tw-text-gray-700">Pembuat Kelas:</strong>
              <div className="tw-text-gray-600 tw-flex tw-items-center tw-gap-2">
                <div className="tw-w-6 tw-h-6 tw-bg-blue-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold">
                  {classData.creator ? classData.creator.charAt(0).toUpperCase() : 'U'}
                </div>
                {classData.creator || 'Unknown'}
              </div>
            </div>
            <div>
              <strong className="tw-text-gray-700">Tanggal Dibuat:</strong>
              <div className="tw-text-gray-600">
                {classData.create_date ? new Date(classData.create_date).toLocaleString('id-ID') : '-'}
              </div>
            </div>
            <div>
              <strong className="tw-text-gray-700">Jadwal Kelas:</strong>
              <div className="tw-text-gray-600 tw-flex tw-items-center tw-gap-2">
                <Calendar className="tw-w-4 tw-h-4" />
                {classData.date || 'Tidak ditentukan'}
              </div>
              <div className="tw-text-sm tw-text-gray-500 tw-flex tw-items-center tw-gap-2 tw-mt-1">
                <Clock className="tw-w-3 tw-h-3" />
                {classData.start_time} - {classData.end_time}
              </div>
            </div>
            <div>
              <strong className="tw-text-gray-700">Jumlah Siswa:</strong>
              <div className="tw-text-gray-600 tw-flex tw-items-center tw-gap-2">
                <Users className="tw-w-4 tw-h-4" />
                {classData.student_list_ids?.length || 0} siswa
              </div>
            </div>
          </div>

          {/* Student List */}
          {classData.student_list_names && classData.student_list_names.length > 0 && (
            <div className="tw-mt-4 tw-pt-4 tw-border-t">
              <strong className="tw-text-gray-700 tw-block tw-mb-2">Daftar Siswa:</strong>
              <div className="tw-flex tw-flex-wrap tw-gap-2">
                {classData.student_list_names.map((student: string, index: number) => (
                  <Badge key={index} bg="secondary" className="tw-text-sm">
                    {student}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Current Teacher Status */}
          <div className="tw-mt-4 tw-pt-4 tw-border-t">
            <strong className="tw-text-gray-700">Status Guru Saat Ini:</strong>
            <div className="tw-mt-2">
              {classData.teacher_name && classData.teacher_name !== 'Belum Ditentukan' ? (
                <Badge bg="success">Sudah Ada: {classData.teacher_name}</Badge>
              ) : (
                <Badge bg="warning">Belum Ditentukan</Badge>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Approval Decision */}
      <Card className="tw-mb-4 tw-border-0 tw-shadow-sm">
        <Card.Header className="tw-bg-yellow-50 tw-border-0">
          <h6 className="tw-font-semibold tw-text-yellow-800 tw-mb-0">
            {userRole === 'teacher' ? 'Konfirmasi Pengambilan Kelas' : 'Keputusan Persetujuan'}
          </h6>
        </Card.Header>
        <Card.Body>
          <div className="tw-space-y-4">
            {/* Approval Status Selection - Only for Admin */}
            {userRole === 'admin' && (
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
            )}

            {/* Teacher Selection - Only for Admin approval of approved classes */}
            {approvalStatus === 'approved' && userRole === 'admin' && (
              <div>
                <SearchSingleField
                  label="Pilih Guru Pengajar"
                  value={selectedTeacher}
                  options={teacherOptions}
                  onChange={handleTeacherChange}
                  onInputChange={(searchTerm) => {
                    setTeacherSearchTerm(searchTerm);
                  }}
                  isLoading={teacherLoading}
                  required={true}
                  icon={<User className="tw-w-4 tw-h-4" />}
                  debounceMs={300}
                  placeholder="Cari dan pilih guru pengajar..."
                />
              </div>
            )}

            {/* Teacher Confirmation - For Teacher role */}
            {userRole === 'teacher' && (
              <Alert variant="success" className="tw-flex tw-items-center tw-gap-2">
                <CheckCircle className="tw-w-5 tw-h-5 tw-text-green-600" />
                <div>
                  <strong>Konfirmasi:</strong> Dengan mengklik "Setujui & Jadi Guru", Anda akan menjadi guru pengajar untuk kelas "{classData.name}".
                  <div className="tw-mt-1 tw-text-sm">
                    Guru yang ditugaskan: <strong>{username || 'Anda'}</strong>
                  </div>
                  <div className="tw-mt-2 tw-text-sm tw-text-gray-600">
                    Jika Anda tidak ingin mengambil kelas ini, cukup klik "Batal" agar guru lain dapat mengambilnya.
                  </div>
                </div>
              </Alert>
            )}

            {/* Rejection Reason - Only for Admin */}
            {approvalStatus === 'rejected' && userRole === 'admin' && (
              <div>
                <label className="tw-font-semibold tw-text-gray-700 tw-block tw-mb-2">
                  Alasan Penolakan *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Masukkan alasan mengapa kelas ini ditolak..."
                  className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-resize-none focus:tw-ring-2 focus:tw-ring-red-500 focus:tw-border-red-500"
                  rows={4}
                  required
                />
                <small className="tw-text-gray-500">
                  Alasan ini akan diberikan kepada pembuat kelas sebagai feedback.
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
              <span className="tw-font-medium">Keputusan:</span>
              <span className={`tw-ml-2 tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium ${
                approvalStatus === 'approved' 
                  ? 'tw-bg-green-100 tw-text-green-800' 
                  : 'tw-bg-red-100 tw-text-red-800'
              }`}>
                {userRole === 'teacher' ? 'MENGAMBIL KELAS' : (approvalStatus === 'approved' ? 'DISETUJUI' : 'DITOLAK')}
              </span>
            </div>
            
            {approvalStatus === 'approved' && selectedTeacher && (
              <div>
                <span className="tw-font-medium">Guru Pengajar:</span> {selectedTeacher.label}
              </div>
            )}
            
            {approvalStatus === 'rejected' && rejectionReason && userRole === 'admin' && (
              <div>
                <span className="tw-font-medium">Alasan Penolakan:</span> {rejectionReason}
              </div>
            )}
            
            <div>
              <span className="tw-font-medium">Diproses oleh:</span> 
              {userRole === 'admin' ? 'Administrator' : 'Guru'} ({username || 'Unknown'})
            </div>
          </div>
        </Card.Body>
      </Card>
    </LearningModal>
  );
};

export default ApprovalModal;