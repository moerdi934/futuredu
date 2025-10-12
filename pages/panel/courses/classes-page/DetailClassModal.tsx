// pages/panel/courses/classes-page/DetailClassModal.tsx

import React from 'react';
import { Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  Play, 
  Square, 
  Video, 
  MapPin, 
  Link2,
  UserCheck,
  AlertTriangle,
  Rocket,
  PlayCircle,
  StopCircle
} from 'lucide-react';
import { LearningModal } from '../../../../components/modal/ModalTemplate';
import { useAuth } from '../../../../context/AuthContext';

interface DetailClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
}

const DetailClassModal: React.FC<DetailClassModalProps> = ({ isOpen, onClose, classData }) => {
  const { role: userRole } = useAuth();

  if (!classData) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Tidak ditentukan';
    return new Date(dateString).toLocaleString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return 'Tidak ditentukan';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  // Get status color and icon
  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      'Not Start': { 
        color: 'tw-text-gray-600', 
        bgColor: 'tw-bg-gray-100',
        icon: <Clock size={16} />,
        label: 'Belum Dimulai'
      },
      'Started': { 
        color: 'tw-text-green-600', 
        bgColor: 'tw-bg-green-100',
        icon: <Play size={16} />,
        label: 'Sedang Berlangsung'
      },
      'Finished': { 
        color: 'tw-text-blue-600', 
        bgColor: 'tw-bg-blue-100',
        icon: <CheckCircle size={16} />,
        label: 'Selesai'
      },
      'Need Approve': { 
        color: 'tw-text-yellow-600', 
        bgColor: 'tw-bg-yellow-100',
        icon: <Clock size={16} />,
        label: 'Menunggu Persetujuan'
      },
      'Rejected': { 
        color: 'tw-text-red-600', 
        bgColor: 'tw-bg-red-100',
        icon: <XCircle size={16} />,
        label: 'Ditolak'
      },
      'Deleted': { 
        color: 'tw-text-red-600', 
        bgColor: 'tw-bg-red-100',
        icon: <XCircle size={16} />,
        label: 'Telah Dihapus'
      }
    };

    return statusConfig[status] || statusConfig['Not Start'];
  };

  const getApprovalStatusDisplay = (status: string) => {
    const statusConfig = {
      'approved': { 
        color: 'tw-text-green-600', 
        bgColor: 'tw-bg-green-100',
        icon: <CheckCircle size={16} />,
        label: 'Disetujui'
      },
      'need_approve': { 
        color: 'tw-text-yellow-600', 
        bgColor: 'tw-bg-yellow-100',
        icon: <Clock size={16} />,
        label: 'Menunggu Persetujuan'
      },
      'rejected': { 
        color: 'tw-text-red-600', 
        bgColor: 'tw-bg-red-100',
        icon: <XCircle size={16} />,
        label: 'Ditolak'
      }
    };

    return statusConfig[status] || statusConfig['approved'];
  };

  const statusDisplay = getStatusDisplay(classData.status);
  const approvalDisplay = getApprovalStatusDisplay(classData.approval_status || 'approved');

  const bottomButtons = [
    {
      action: 'close' as const,
      text: 'Tutup',
      onClick: onClose
    }
  ];
  return (
    <LearningModal
      show={isOpen}
      onHide={onClose}
      title="Detail Kelas"
      subtitle={`Informasi lengkap kelas "${classData.name}"`}
      icon={<BookOpen className="tw-w-5 tw-h-5" />}
      size="lg"
      width="110vw"
      height="120vh"
      bottomButtons={bottomButtons}
      preventCloseOnOutsideClick={false}
    >
      <div className="tw-space-y-4">
        {/* Status Overview */}
        <Card className="tw-border-0 tw-shadow-sm">
          <Card.Header className="tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-border-0">
            <h6 className="tw-font-semibold tw-text-blue-800 tw-mb-0">Status Kelas</h6>
          </Card.Header>
          <Card.Body>
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
              <div className="tw-text-center">
                <div className={`tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-full ${statusDisplay.bgColor} ${statusDisplay.color} tw-font-medium`}>
                  {statusDisplay.icon}
                  {statusDisplay.label}
                </div>
                <div className="tw-text-sm tw-text-gray-500 tw-mt-1">Status Kelas</div>
              </div>
              
              <div className="tw-text-center">
                <div className={`tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-full ${approvalDisplay.bgColor} ${approvalDisplay.color} tw-font-medium`}>
                  {approvalDisplay.icon}
                  {approvalDisplay.label}
                </div>
                <div className="tw-text-sm tw-text-gray-500 tw-mt-1">Status Persetujuan</div>
              </div>
              
              <div className="tw-text-center">
                <div className={`tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-full ${
                  classData.class_mode === 'online' 
                    ? 'tw-bg-blue-100 tw-text-blue-600' 
                    : 'tw-bg-green-100 tw-text-green-600'
                } tw-font-medium`}>
                  {classData.class_mode === 'online' ? <Video size={16} /> : <MapPin size={16} />}
                  {classData.class_mode === 'online' ? 'Online' : 'Offline'}
                </div>
                <div className="tw-text-sm tw-text-gray-500 tw-mt-1">Mode Kelas</div>
              </div>
            </div>

            {/* Warning for unapproved classes */}
            {classData.approval_status === 'need_approve' && (
              <Alert variant="warning" className="tw-mt-4 tw-mb-0">
                <AlertTriangle className="tw-inline tw-mr-2" size={16} />
                <strong>Kelas Menunggu Persetujuan:</strong> Kelas ini belum dapat dimulai sampai mendapat persetujuan dari admin atau guru.
              </Alert>
            )}

            {/* Rejection warning */}
            {classData.approval_status === 'rejected' && (
              <Alert variant="danger" className="tw-mt-4 tw-mb-0">
                <XCircle className="tw-inline tw-mr-2" size={16} />
                <strong>Kelas Ditolak:</strong> Kelas ini telah ditolak dan tidak dapat dimulai.
              </Alert>
            )}
          </Card.Body>
        </Card>

        {/* Basic Information */}
        <Card className="tw-border-0 tw-shadow-sm">
          <Card.Header className="tw-bg-gray-50 tw-border-0">
            <h6 className="tw-font-semibold tw-text-gray-800 tw-mb-0">Informasi Dasar</h6>
          </Card.Header>
          <Card.Body>
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div>
                <strong className="tw-text-gray-700 tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <BookOpen size={16} />
                  Nama Kelas
                </strong>
                <div className="tw-text-gray-600 tw-bg-gray-50 tw-p-3 tw-rounded-lg">
                  {classData.name}
                </div>
              </div>
              
              <div>
                <strong className="tw-text-gray-700 tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <BookOpen size={16} />
                  Mata Pelajaran
                </strong>
                <div className="tw-text-gray-600 tw-bg-gray-50 tw-p-3 tw-rounded-lg">
                  {classData.course_name || 'Tidak ada mata pelajaran'}
                </div>
              </div>
              
              <div className="tw-col-span-full">
                <strong className="tw-text-gray-700 tw-mb-2 tw-block">Deskripsi</strong>
                <div className="tw-text-gray-600 tw-bg-gray-50 tw-p-3 tw-rounded-lg tw-min-h-20">
                  {classData.description || 'Tidak ada deskripsi'}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Schedule Information */}
        <Card className="tw-border-0 tw-shadow-sm">
          <Card.Header className="tw-bg-blue-50 tw-border-0">
            <h6 className="tw-font-semibold tw-text-blue-800 tw-mb-0">Jadwal Kelas</h6>
          </Card.Header>
          <Card.Body>
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div>
                <strong className="tw-text-gray-700 tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <Calendar size={16} />
                  Waktu Mulai (Terjadwal)
                </strong>
                <div className="tw-text-gray-600 tw-bg-blue-50 tw-p-3 tw-rounded-lg">
                  {classData.real_start_datetime ? formatDate(classData.real_start_datetime) : `${classData.date} ${classData.start_time}`}
                </div>
              </div>
              
              <div>
                <strong className="tw-text-gray-700 tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <Clock size={16} />
                  Waktu Selesai (Terjadwal)
                </strong>
                <div className="tw-text-gray-600 tw-bg-blue-50 tw-p-3 tw-rounded-lg">
                  {classData.real_end_datetime ? formatDate(classData.real_end_datetime) : `${classData.date} ${classData.end_time}`}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Actual Time Information - Only show if class has started or finished */}
        {(classData.is_started || classData.status === 'Started' || classData.status === 'Finished') && (
          <Card className="tw-border-0 tw-shadow-sm tw-border-l-4 tw-border-l-green-500">
            <Card.Header className="tw-bg-green-50 tw-border-0">
              <h6 className="tw-font-semibold tw-text-green-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
                <PlayCircle size={18} />
                Waktu Aktual Pelaksanaan
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                {classData.real_start_datetime && (
                  <div>
                    <strong className="tw-text-gray-700 tw-flex tw-items-center tw-gap-2 tw-mb-2">
                      <Play size={16} className="tw-text-green-600" />
                      Dimulai Pada
                    </strong>
                    <div className="tw-text-gray-800 tw-bg-green-50 tw-p-3 tw-rounded-lg tw-font-medium">
                      {formatDate(classData.real_start_datetime)}
                    </div>
                  </div>
                )}
                
                {classData.status === 'Finished' && classData.real_end_datetime && (
                  <div>
                    <strong className="tw-text-gray-700 tw-flex tw-items-center tw-gap-2 tw-mb-2">
                      <StopCircle size={16} className="tw-text-blue-600" />
                      Selesai Pada
                    </strong>
                    <div className="tw-text-gray-800 tw-bg-blue-50 tw-p-3 tw-rounded-lg tw-font-medium">
                      {formatDate(classData.real_end_datetime)}
                    </div>
                  </div>
                )}

                {classData.status === 'Started' && !classData.real_end_datetime && (
                  <div>
                    <Alert variant="info" className="tw-mb-0">
                      <Clock className="tw-inline tw-mr-2" size={16} />
                      Kelas sedang berlangsung
                    </Alert>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Go Live Information - Only show if class is live */}
        {classData.is_live && (
          <Card className="tw-border-0 tw-shadow-sm tw-border-l-4 tw-border-l-orange-500">
            <Card.Header className="tw-bg-orange-50 tw-border-0">
              <h6 className="tw-font-semibold tw-text-orange-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
                <Rocket size={18} />
                Status Go Live
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="tw-flex tw-items-center tw-gap-3 tw-bg-orange-50 tw-p-4 tw-rounded-lg">
                <div className="tw-w-12 tw-h-12 tw-bg-orange-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-animate-pulse">
                  <Rocket size={24} className="tw-text-white" />
                </div>
                <div className="tw-flex-1">
                  <div className="tw-font-bold tw-text-orange-800 tw-text-lg">
                    Kelas Sedang Live! 🎉
                  </div>
                  {classData.live_since && (
                    <div className="tw-text-sm tw-text-orange-600 tw-mt-1">
                      Live sejak: {formatDate(classData.live_since)}
                    </div>
                  )}
                  <div className="tw-text-xs tw-text-gray-600 tw-mt-2">
                    Kelas ini dapat diakses oleh siswa sebelum dimulai
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Meeting URL for Online Classes */}
        {classData.class_mode === 'online' && classData.meeting_url && (
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Header className="tw-bg-blue-50 tw-border-0">
              <h6 className="tw-font-semibold tw-text-blue-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
                <Video size={16} />
                Informasi Meeting Online
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="tw-space-y-3">
                <div>
                  <strong className="tw-text-gray-700 tw-flex tw-items-center tw-gap-2 tw-mb-2">
                    <Link2 size={16} />
                    URL Meeting
                  </strong>
                  <div className="tw-bg-blue-50 tw-p-3 tw-rounded-lg tw-break-all">
                    <a 
                      href={classData.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tw-text-blue-600 hover:tw-underline"
                    >
                      {classData.meeting_url}
                    </a>
                  </div>
                </div>
                
                <Alert variant="info" className="tw-mb-0">
                  <Video className="tw-inline tw-mr-2" size={16} />
                  <strong>Catatan:</strong> Link meeting akan tersedia untuk siswa setelah melakukan presensi.
                </Alert>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* People Information */}
        <Row>
          <Col md={6}>
            <Card className="tw-border-0 tw-shadow-sm tw-h-full">
              <Card.Header className="tw-bg-green-50 tw-border-0">
                <h6 className="tw-font-semibold tw-text-green-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
                  <UserCheck size={16} />
                  Informasi Guru
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="tw-space-y-3">
                  <div>
                    <strong className="tw-text-gray-700 tw-mb-2 tw-block">Guru Pengajar</strong>
                    <div className="tw-flex tw-items-center tw-gap-3 tw-bg-green-50 tw-p-3 tw-rounded-lg">
                      <div className="tw-w-10 tw-h-10 tw-bg-green-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold">
                        {classData.teacher_name ? classData.teacher_name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <div className="tw-font-medium tw-text-green-800">
                          {classData.teacher_name || 'Belum Ditentukan'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <strong className="tw-text-gray-700 tw-mb-2 tw-block">Pembuat Kelas</strong>
                    <div className="tw-flex tw-items-center tw-gap-3 tw-bg-gray-50 tw-p-3 tw-rounded-lg">
                      <div className="tw-w-10 tw-h-10 tw-bg-blue-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold">
                        {classData.creator ? classData.creator.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="tw-font-medium tw-text-gray-800">
                          {classData.creator || 'Unknown'}
                        </div>
                        <div className="tw-text-sm tw-text-gray-600">
                          Dibuat: {formatDateOnly(classData.create_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="tw-border-0 tw-shadow-sm tw-h-full">
              <Card.Header className="tw-bg-purple-50 tw-border-0">
                <h6 className="tw-font-semibold tw-text-purple-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
                  <Users size={16} />
                  Daftar Siswa ({classData.student_list_names?.length || 0})
                </h6>
              </Card.Header>
              <Card.Body>
                {classData.student_list_names && classData.student_list_names.length > 0 ? (
                  <div className="tw-space-y-2 tw-max-h-60 tw-overflow-y-auto">
                    {classData.student_list_names.map((student: string, index: number) => (
                      <div key={index} className="tw-flex tw-items-center tw-gap-3 tw-bg-purple-50 tw-p-2 tw-rounded-lg">
                        <div className="tw-w-8 tw-h-8 tw-bg-purple-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold">
                          {student ? student.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <div className="tw-font-medium tw-text-purple-800 tw-text-sm">
                            {student}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="tw-text-center tw-text-gray-500 tw-py-8">
                    <Users size={48} className="tw-mx-auto tw-mb-2 tw-opacity-50" />
                    <div>Belum ada siswa yang terdaftar</div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Approval Information */}
        {(classData.approval_status !== 'approved' || classData.approver_name) && (
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Header className={`tw-border-0 ${
              classData.approval_status === 'approved' ? 'tw-bg-green-50' :
              classData.approval_status === 'need_approve' ? 'tw-bg-yellow-50' : 'tw-bg-red-50'
            }`}>
              <h6 className={`tw-font-semibold tw-mb-0 tw-flex tw-items-center tw-gap-2 ${
                classData.approval_status === 'approved' ? 'tw-text-green-800' :
                classData.approval_status === 'need_approve' ? 'tw-text-yellow-800' : 'tw-text-red-800'
              }`}>
                {approvalDisplay.icon}
                Informasi Persetujuan
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                <div>
                  <strong className="tw-text-gray-700 tw-mb-2 tw-block">Status Persetujuan</strong>
                  <div className={`tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-rounded-lg ${approvalDisplay.bgColor} ${approvalDisplay.color} tw-font-medium`}>
                    {approvalDisplay.icon}
                    {approvalDisplay.label}
                  </div>
                </div>
                
                {classData.approver_name && classData.approval_status !== 'need_approve' && (
                  <div>
                    <strong className="tw-text-gray-700 tw-mb-2 tw-block">Disetujui Oleh</strong>
                    <div className="tw-flex tw-items-center tw-gap-3 tw-bg-gray-50 tw-p-3 tw-rounded-lg">
                      <div className="tw-w-8 tw-h-8 tw-bg-indigo-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold">
                        {classData.approver_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="tw-font-medium tw-text-gray-800">
                          {classData.approver_name}
                        </div>
                        <div className="tw-text-sm tw-text-gray-600">
                          {formatDateOnly(classData.approve_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {classData.approval_status === 'need_approve' && (
                <Alert variant="info" className="tw-mt-4 tw-mb-0">
                  <Clock className="tw-inline tw-mr-2" size={16} />
                  Kelas ini sedang menunggu persetujuan dari admin atau guru. Setelah disetujui, kelas dapat dimulai.
                </Alert>
              )}
            </Card.Body>
          </Card>
        )}

        {/* System Information - Removed sensitive IDs */}
        <Card className="tw-border-0 tw-shadow-sm">
          <Card.Header className="tw-bg-gray-50 tw-border-0">
            <h6 className="tw-font-semibold tw-text-gray-800 tw-mb-0">Informasi Sistem</h6>
          </Card.Header>
          <Card.Body>
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4 tw-text-sm">
              <div>
                <strong className="tw-text-gray-600 tw-block">Tanggal Dibuat</strong>
                <span className="tw-text-gray-800">{formatDateOnly(classData.create_date)}</span>
              </div>
              
              {classData.edit_date && (
                <div>
                  <strong className="tw-text-gray-600 tw-block">Terakhir Diubah</strong>
                  <span className="tw-text-gray-800">{formatDateOnly(classData.edit_date)}</span>
                </div>
              )}
              
              <div>
                <strong className="tw-text-gray-600 tw-block">Status Aktif</strong>
                <Badge bg={classData.is_deleted ? 'danger' : 'success'}>
                  {classData.is_deleted ? 'Terhapus' : 'Aktif'}
                </Badge>
              </div>
              
              <div>
                <strong className="tw-text-gray-600 tw-block">Sudah Dimulai</strong>
                <Badge bg={classData.is_started ? 'success' : 'secondary'}>
                  {classData.is_started ? 'Ya' : 'Belum'}
                </Badge>
              </div>
            </div>
            
            {classData.delete_reason && (
              <Alert variant="danger" className="tw-mt-4 tw-mb-0">
                <strong>Alasan Penghapusan:</strong> {classData.delete_reason}
              </Alert>
            )}
          </Card.Body>
        </Card>
      </div>
    </LearningModal>
  );
};

export default DetailClassModal;