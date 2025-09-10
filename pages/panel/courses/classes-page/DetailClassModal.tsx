// components/modal/DetailClassModal.tsx

import React from 'react';
import { Row, Col, Badge, Card } from 'react-bootstrap';
import { FaEye, FaTimes, FaCalendar, FaClock, FaUsers, FaGraduationCap, FaBookOpen, FaUser, FaInfo, FaTrash } from 'react-icons/fa';
import { GraduationCap, Users, Calendar, Clock, Info, Book, User as UserIcon, Eye } from 'lucide-react';
import { LearningModal } from '../../../../components/modal/ModalTemplate';
import { ButtonGradient } from '../../../../components/button/ButtonTemplate';

interface DetailClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
}

const DetailClassModal: React.FC<DetailClassModalProps> = ({
  isOpen,
  onClose,
  classData
}) => {
  if (!classData) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Not Start': { variant: 'secondary', label: 'Belum Dimulai', icon: <Clock size={14} /> },
      'Started': { variant: 'success', label: 'Sedang Berlangsung', icon: <FaEye size={14} /> },
      'Finished': { variant: 'info', label: 'Selesai', icon: <FaInfo size={14} /> },
      'Deleted': { variant: 'danger', label: 'Telah Dihapus', icon: <FaTrash size={14} /> }
    };
    
    const config = statusConfig[status] || statusConfig['Not Start'];
    
    return (
      <Badge bg={config.variant} className="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

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
      subtitle={classData.name}
      icon={<Eye className="tw-w-5 tw-h-5" />}
      size="xl"
      width="95vw"
      height="90vh"
      bottomButtons={bottomButtons}
      preventCloseOnOutsideClick={false}
    >
      <div className="tw-space-y-6">
        {/* Status dan Info Utama */}
        <Row className="tw-mb-4">
          <Col md={8}>
            <div className="tw-flex tw-items-center tw-gap-4 tw-mb-3">
              <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-0">
                {classData.name}
              </h2>
              {getStatusBadge(classData.status)}
              {classData.is_deleted && (
                <Badge bg="warning" className="tw-flex tw-items-center tw-gap-1">
                  <FaTrash size={12} />
                  Dihapus
                </Badge>
              )}
            </div>
            <p className="tw-text-gray-600 tw-mb-0">
              {classData.description || 'Tidak ada deskripsi'}
            </p>
          </Col>
          <Col md={4} className="tw-text-end">
            <div className="tw-text-sm tw-text-gray-500">
              <div>ID Kelas: <span className="tw-font-mono tw-font-bold">{classData.id}</span></div>
              <div>Event ID: <span className="tw-font-mono tw-font-bold">{classData.event_id}</span></div>
            </div>
          </Col>
        </Row>

        {/* Cards Grid */}
        <Row className="tw-g-4">
          {/* Informasi Mata Pelajaran */}
          <Col lg={6}>
            <Card className="tw-h-100 tw-border-0 tw-shadow-sm">
              <Card.Header className="tw-bg-purple-50 tw-border-0">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-purple-700">
                  <Book size={20} />
                  <h6 className="tw-mb-0 tw-font-semibold">Mata Pelajaran</h6>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="tw-space-y-3">
                  <div>
                    <label className="tw-text-sm tw-font-medium tw-text-gray-600">Nama Mata Pelajaran</label>
                    <div className="tw-text-lg tw-font-semibold tw-text-gray-800">
                      {classData.course_name || 'Tidak ada mata pelajaran'}
                    </div>
                  </div>
                  <div>
                    <label className="tw-text-sm tw-font-medium tw-text-gray-600">ID Mata Pelajaran</label>
                    <div className="tw-font-mono tw-text-gray-700">
                      {classData.course_id || '-'}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Informasi Pengajar */}
          <Col lg={6}>
            <Card className="tw-h-100 tw-border-0 tw-shadow-sm">
              <Card.Header className="tw-bg-green-50 tw-border-0">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-green-700">
                  <GraduationCap size={20} />
                  <h6 className="tw-mb-0 tw-font-semibold">Pengajar</h6>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="tw-space-y-3">
                  <div>
                    <label className="tw-text-sm tw-font-medium tw-text-gray-600">Nama Pengajar</label>
                    <div className="tw-text-lg tw-font-semibold tw-text-gray-800">
                      {classData.teacher_name || 'Belum ditentukan'}
                    </div>
                  </div>
                  <div className="tw-flex tw-gap-4">
                    <div>
                      <label className="tw-text-sm tw-font-medium tw-text-gray-600">ID Pengajar</label>
                      <div className="tw-font-mono tw-text-gray-700">
                        {classData.teacher_id || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="tw-text-sm tw-font-medium tw-text-gray-600">Starter ID</label>
                      <div className="tw-font-mono tw-text-gray-700">
                        {classData.starter_user_id || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Informasi Siswa */}
          <Col lg={12}>
            <Card className="tw-border-0 tw-shadow-sm">
              <Card.Header className="tw-bg-blue-50 tw-border-0">
                <div className="tw-flex tw-items-center tw-justify-between">
                  <div className="tw-flex tw-items-center tw-gap-2 tw-text-blue-700">
                    <Users size={20} />
                    <h6 className="tw-mb-0 tw-font-semibold">Daftar Siswa</h6>
                  </div>
                  <Badge bg="primary" className="tw-px-3">
                    {classData.student_list_ids?.length || 0} siswa
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                {classData.student_list_names && classData.student_list_names.length > 0 ? (
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-3">
                    {classData.student_list_names.map((student, index) => (
                      <div key={index} className="tw-flex tw-items-center tw-gap-2 tw-p-2 tw-bg-gray-50 tw-rounded-lg">
                        <div className="tw-w-8 tw-h-8 tw-bg-blue-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold">
                          {student ? student.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <span className="tw-text-sm tw-font-medium tw-text-gray-700">{student}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="tw-text-center tw-py-8 tw-text-gray-500">
                    <Users size={48} className="tw-mx-auto tw-mb-3 tw-text-gray-300" />
                    <p className="tw-mb-0">Belum ada siswa terdaftar</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Informasi Jadwal */}
          <Col lg={6}>
            <Card className="tw-h-100 tw-border-0 tw-shadow-sm">
              <Card.Header className="tw-bg-orange-50 tw-border-0">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-orange-700">
                  <Calendar size={20} />
                  <h6 className="tw-mb-0 tw-font-semibold">Jadwal Kelas</h6>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="tw-space-y-4">
                  <div>
                    <label className="tw-text-sm tw-font-medium tw-text-gray-600">Tanggal</label>
                    <div className="tw-text-lg tw-font-semibold tw-text-gray-800">
                      {classData.date || formatDate(classData.real_start_datetime)}
                    </div>
                  </div>
                  <div className="tw-flex tw-gap-4">
                    <div className="tw-flex-1">
                      <label className="tw-text-sm tw-font-medium tw-text-gray-600">Waktu Mulai</label>
                      <div className="tw-text-lg tw-font-semibold tw-text-green-600">
                        {classData.start_time || formatTime(classData.real_start_datetime)}
                      </div>
                    </div>
                    <div className="tw-flex-1">
                      <label className="tw-text-sm tw-font-medium tw-text-gray-600">Waktu Selesai</label>
                      <div className="tw-text-lg tw-font-semibold tw-text-red-600">
                        {classData.end_time || formatTime(classData.real_end_datetime)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Informasi Pembuat */}
          <Col lg={6}>
            <Card className="tw-h-100 tw-border-0 tw-shadow-sm">
              <Card.Header className="tw-bg-gray-50 tw-border-0">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-700">
                  <UserIcon size={20} />
                  <h6 className="tw-mb-0 tw-font-semibold">Informasi Pembuat</h6>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="tw-space-y-3">
                  <div>
                    <label className="tw-text-sm tw-font-medium tw-text-gray-600">Dibuat Oleh</label>
                    <div className="tw-text-lg tw-font-semibold tw-text-gray-800">
                      {classData.creator || 'Unknown'}
                    </div>
                  </div>
                  <div className="tw-flex tw-gap-4">
                    <div>
                      <label className="tw-text-sm tw-font-medium tw-text-gray-600">ID Pembuat</label>
                      <div className="tw-font-mono tw-text-gray-700">
                        {classData.create_user_id || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="tw-text-sm tw-font-medium tw-text-gray-600">Tanggal Dibuat</label>
                      <div className="tw-text-sm tw-text-gray-700">
                        {classData.create_date ? formatDate(classData.create_date) : '-'}
                      </div>
                    </div>
                  </div>
                  {classData.edit_user_id && (
                    <div className="tw-pt-2 tw-border-t tw-border-gray-200">
                      <div className="tw-flex tw-gap-4">
                        <div>
                          <label className="tw-text-sm tw-font-medium tw-text-gray-600">ID Editor</label>
                          <div className="tw-font-mono tw-text-gray-700">
                            {classData.edit_user_id}
                          </div>
                        </div>
                        <div>
                          <label className="tw-text-sm tw-font-medium tw-text-gray-600">Tanggal Edit</label>
                          <div className="tw-text-sm tw-text-gray-700">
                            {classData.edit_date ? formatDate(classData.edit_date) : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Informasi Penghapusan (jika ada) */}
          {classData.is_deleted && (
            <Col lg={12}>
              <Card className="tw-border-0 tw-shadow-sm tw-border-l-4 tw-border-l-red-500">
                <Card.Header className="tw-bg-red-50 tw-border-0">
                  <div className="tw-flex tw-items-center tw-gap-2 tw-text-red-700">
                    <FaTrash size={20} />
                    <h6 className="tw-mb-0 tw-font-semibold">Informasi Penghapusan</h6>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="tw-space-y-3">
                    <div>
                      <label className="tw-text-sm tw-font-medium tw-text-gray-600">Alasan Penghapusan</label>
                      <div className="tw-text-gray-800">
                        {classData.delete_reason || 'Tidak ada alasan yang diberikan'}
                      </div>
                    </div>
                    {classData.delete_date && (
                      <div>
                        <label className="tw-text-sm tw-font-medium tw-text-gray-600">Tanggal Dihapus</label>
                        <div className="tw-text-gray-700">
                          {formatDate(classData.delete_date)}
                        </div>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </div>
    </LearningModal>
  );
};

export default DetailClassModal;