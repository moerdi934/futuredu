// pages/panel/courses/courses-page/DetailCourseModal.tsx - Updated with Material Counts

import React from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import { BookOpen, User, Calendar, FileText, Award, CheckCircle, XCircle, Clock, AlertCircle, Timer, Layers, List, File, CheckSquare, Square } from 'lucide-react';
import { LearningModal } from '../../../../components/modal/ModalTemplate';
import { useAuth } from '../../../../context/AuthContext';

interface DetailCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseData: any;
}

const DetailCourseModal: React.FC<DetailCourseModalProps> = ({ isOpen, onClose, courseData }) => {
  const { role: userRole } = useAuth();
  
  if (!courseData) return null;

  const bottomButtons = [
    {
      action: 'close' as const,
      text: 'Tutup',
      onClick: onClose
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="tw-w-4 tw-h-4 tw-text-green-600" />;
      case 'rejected':
        return <XCircle className="tw-w-4 tw-h-4 tw-text-red-600" />;
      case 'need_approve':
        return <Clock className="tw-w-4 tw-h-4 tw-text-yellow-600" />;
      default:
        return <AlertCircle className="tw-w-4 tw-h-4 tw-text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      case 'need_approve':
        return 'Menunggu Persetujuan';
      default:
        return 'Status Tidak Dikenal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'tw-bg-green-100 tw-text-green-800 tw-border-green-200';
      case 'rejected':
        return 'tw-bg-red-100 tw-text-red-800 tw-border-red-200';
      case 'need_approve':
        return 'tw-bg-yellow-100 tw-text-yellow-800 tw-border-yellow-200';
      default:
        return 'tw-bg-gray-100 tw-text-gray-800 tw-border-gray-200';
    }
  };

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes === 0) return 'Belum ditentukan';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
    }
    return `${mins} menit`;
  };

  const parseSections = (sectionString: string) => {
    if (!sectionString) return [];
    return sectionString.split(/[,;]/).map(s => s.trim()).filter(s => s);
  };

  const sections = parseSections(courseData.section_string);

  return (
    <LearningModal
      show={isOpen}
      onHide={onClose}
      title="Detail Kursus"
      subtitle={courseData.title}
      icon={<BookOpen className="tw-w-5 tw-h-5" />}
      size="xl"
      width="110vw"
      height="125vh"
      bottomButtons={bottomButtons}
    >
      <div className="tw-space-y-6">
        {/* Course Image and Basic Info */}
        <Card className="tw-border-0 tw-shadow-sm">
          <Card.Body>
            <Row className="tw-items-center">
              <Col md={3} className="tw-text-center tw-mb-3 md:tw-mb-0">
                {courseData.imageUrl ? (
                  <img 
                    src={courseData.imageUrl} 
                    alt={courseData.title}
                    className="tw-w-full tw-h-32 tw-object-cover tw-rounded-lg tw-shadow-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.innerHTML = '<div class="tw-w-full tw-h-32 tw-bg-gray-200 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-gray-500"><BookOpen class="tw-w-8 tw-h-8" /><span class="tw-ml-2">Tidak ada gambar</span></div>';
                    }}
                  />
                ) : (
                  <div className="tw-w-full tw-h-32 tw-bg-gray-200 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-gray-500">
                    <BookOpen className="tw-w-8 tw-h-8" />
                    <span className="tw-ml-2">Tidak ada gambar</span>
                  </div>
                )}
              </Col>
              <Col md={9}>
                <div className="tw-space-y-3">
                  <div>
                    <h4 className="tw-font-bold tw-text-gray-800 tw-mb-2">{courseData.title}</h4>
                    <p className="tw-text-gray-600 tw-text-sm tw-leading-relaxed">
                      {courseData.description || 'Tidak ada deskripsi'}
                    </p>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="tw-flex tw-items-center tw-gap-2 tw-flex-wrap">
                    {userRole !== 'student' && courseData.approval_status && (
                      <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-medium tw-border tw-flex tw-items-center tw-gap-2 ${getStatusColor(courseData.approval_status)}`}>
                        {getStatusIcon(courseData.approval_status)}
                        {getStatusLabel(courseData.approval_status)}
                      </span>
                    )}
                    
                    {userRole !== 'student' && courseData.is_live && (
                      <Badge bg="primary" className="tw-flex tw-items-center tw-gap-1">
                        <CheckCircle className="tw-w-3 tw-h-3" />
                        Live
                      </Badge>
                    )}

                    {userRole === 'student' && courseData.is_entitled_active !== undefined && (
                      <Badge bg={courseData.is_entitled_active ? "success" : "danger"} className="tw-flex tw-items-center tw-gap-1">
                        {courseData.is_entitled_active ? <CheckCircle className="tw-w-3 tw-h-3" /> : <XCircle className="tw-w-3 tw-h-3" />}
                        {courseData.is_entitled_active ? 'Akses Aktif' : 'Akses Tidak Aktif'}
                      </Badge>
                    )}
                    
                    {userRole !== 'student' && courseData.is_deleted && (
                      <Badge bg="danger" className="tw-flex tw-items-center tw-gap-1">
                        <XCircle className="tw-w-3 tw-h-3" />
                        Terhapus
                      </Badge>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Student Entitlement Information */}
        {userRole === 'student' && (
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Header className="tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-border-0">
              <h6 className="tw-font-semibold tw-text-blue-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
                <User className="tw-w-4 tw-h-4" />
                Informasi Akses
              </h6>
            </Card.Header>
            <Card.Body>
              <Row className="tw-gap-4">
                <Col md={6}>
                  <div className="tw-space-y-3">
                    <div>
                      <strong className="tw-text-gray-700 tw-text-sm">Akses Diberikan:</strong>
                      <div className="tw-text-gray-600 tw-text-sm tw-mt-1 tw-flex tw-items-center tw-gap-1">
                        <Calendar className="tw-w-4 tw-h-4" />
                        {courseData.granted_at ? 
                          new Date(courseData.granted_at).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) : '-'
                        }
                      </div>
                    </div>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="tw-space-y-3">
                    <div>
                      <strong className="tw-text-gray-700 tw-text-sm">Masa Berlaku:</strong>
                      <div className="tw-text-gray-600 tw-text-sm tw-mt-1 tw-flex tw-items-center tw-gap-1">
                        <Clock className="tw-w-4 tw-h-4" />
                        {courseData.expires_at ? (
                          <>
                            {new Date(courseData.expires_at).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                            {new Date(courseData.expires_at) < new Date() && (
                              <span className="tw-text-red-600 tw-font-bold tw-ml-2">(Sudah Berakhir)</span>
                            )}
                          </>
                        ) : (
                          <span className="tw-text-green-600 tw-font-bold">Selamanya</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Course Statistics */}
        <Card className="tw-border-0 tw-shadow-sm">
          <Card.Header className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-indigo-50 tw-border-0">
            <h6 className="tw-font-semibold tw-text-purple-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
              <Layers className="tw-w-4 tw-h-4" />
              Statistik Kursus
            </h6>
          </Card.Header>
          <Card.Body>
            <Row className="tw-gap-3">
              <Col md={userRole === 'student' ? 2 : 2} className="tw-text-center">
                <div className="tw-p-4 tw-bg-indigo-50 tw-rounded-lg tw-border tw-border-indigo-100">
                  <div className="tw-flex tw-flex-col tw-items-center tw-gap-2">
                    <Layers className="tw-w-8 tw-h-8 tw-text-indigo-600" />
                    <div className="tw-text-2xl tw-font-bold tw-text-indigo-800">
                      {courseData.section_count || 0}
                    </div>
                    <div className="tw-text-sm tw-text-gray-600">Section{(courseData.section_count || 0) > 1 ? 's' : ''}</div>
                  </div>
                </div>
              </Col>
              
              <Col md={userRole === 'student' ? 2 : 2} className="tw-text-center">
                <div className="tw-p-4 tw-bg-teal-50 tw-rounded-lg tw-border tw-border-teal-100">
                  <div className="tw-flex tw-flex-col tw-items-center tw-gap-2">
                    <List className="tw-w-8 tw-h-8 tw-text-teal-600" />
                    <div className="tw-text-2xl tw-font-bold tw-text-teal-800">
                      {courseData.topic_count || 0}
                    </div>
                    <div className="tw-text-sm tw-text-gray-600">Total Topik</div>
                  </div>
                </div>
              </Col>

              <Col md={userRole === 'student' ? 2 : 2} className="tw-text-center">
                <div className="tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-100">
                  <div className="tw-flex tw-flex-col tw-items-center tw-gap-2">
                    <File className="tw-w-8 tw-h-8 tw-text-blue-600" />
                    <div className="tw-text-2xl tw-font-bold tw-text-blue-800">
                      {courseData.material_count || 0}
                    </div>
                    <div className="tw-text-sm tw-text-gray-600">Total Materi</div>
                  </div>
                </div>
              </Col>

              <Col md={userRole === 'student' ? 2 : 2} className="tw-text-center">
                <div className="tw-p-4 tw-bg-rose-50 tw-rounded-lg tw-border tw-border-rose-100">
                  <div className="tw-flex tw-flex-col tw-items-center tw-gap-2">
                    <CheckSquare className="tw-w-8 tw-h-8 tw-text-rose-600" />
                    <div className="tw-text-2xl tw-font-bold tw-text-rose-800">
                      {courseData.mandatory_material_count || 0}
                    </div>
                    <div className="tw-text-sm tw-text-gray-600">Materi Wajib</div>
                  </div>
                </div>
              </Col>

              <Col md={userRole === 'student' ? 2 : 2} className="tw-text-center">
                <div className="tw-p-4 tw-bg-amber-50 tw-rounded-lg tw-border tw-border-amber-100">
                  <div className="tw-flex tw-flex-col tw-items-center tw-gap-2">
                    <Square className="tw-w-8 tw-h-8 tw-text-amber-600" />
                    <div className="tw-text-2xl tw-font-bold tw-text-amber-800">
                      {courseData.optional_material_count || 0}
                    </div>
                    <div className="tw-text-sm tw-text-gray-600">Materi Opsional</div>
                  </div>
                </div>
              </Col>
              
              <Col md={userRole === 'student' ? 2 : 2} className="tw-text-center">
                <div className="tw-p-4 tw-bg-orange-50 tw-rounded-lg tw-border tw-border-orange-100">
                  <div className="tw-flex tw-flex-col tw-items-center tw-gap-2">
                    <Timer className="tw-w-8 tw-h-8 tw-text-orange-600" />
                    <div className="tw-text-lg tw-font-bold tw-text-orange-800">
                      {formatDuration(courseData.total_duration_minutes)}
                    </div>
                    <div className="tw-text-sm tw-text-gray-600">Estimasi Durasi</div>
                  </div>
                </div>
              </Col>
              
              {/* Entitlement Stats for Admin/Teacher */}
              {userRole !== 'student' && (
                <>
                  <Col md={2} className="tw-text-center">
                    <div className="tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-100">
                      <div className="tw-flex tw-flex-col tw-items-center tw-gap-2">
                        <User className="tw-w-8 tw-h-8 tw-text-blue-600" />
                        <div className="tw-text-2xl tw-font-bold tw-text-blue-800">
                          {courseData.entitled_users_count || 0}
                        </div>
                        <div className="tw-text-sm tw-text-gray-600">Total Entitled</div>
                      </div>
                    </div>
                  </Col>

                  <Col md={2} className="tw-text-center">
                    <div className="tw-p-4 tw-bg-green-50 tw-rounded-lg tw-border tw-border-green-100">
                      <div className="tw-flex tw-flex-col tw-items-center tw-gap-2">
                        <CheckCircle className="tw-w-8 tw-h-8 tw-text-green-600" />
                        <div className="tw-text-2xl tw-font-bold tw-text-green-800">
                          {courseData.active_entitled_count || 0}
                        </div>
                        <div className="tw-text-sm tw-text-gray-600">User Aktif</div>
                      </div>
                    </div>
                  </Col>
                </>
              )}
            </Row>

            {/* Additional Material Breakdown */}
            <div className="tw-mt-4 tw-p-4 tw-bg-gray-50 tw-rounded-lg tw-border tw-border-gray-200">
              <h6 className="tw-text-sm tw-font-bold tw-text-gray-700 tw-mb-3 tw-flex tw-items-center tw-gap-2">
                <File className="tw-w-4 tw-h-4" />
                Rincian Materi
              </h6>
              <div className="tw-grid tw-grid-cols-3 tw-gap-4">
                <div className="tw-text-center">
                  <div className="tw-text-2xl tw-font-bold tw-text-blue-600">
                    {courseData.material_count || 0}
                  </div>
                  <div className="tw-text-xs tw-text-gray-600 tw-mt-1">Total Semua Materi</div>
                </div>
                <div className="tw-text-center">
                  <div className="tw-text-2xl tw-font-bold tw-text-rose-600">
                    {courseData.mandatory_material_count || 0}
                  </div>
                  <div className="tw-text-xs tw-text-gray-600 tw-mt-1">
                    Wajib ({courseData.material_count > 0 ? Math.round((courseData.mandatory_material_count || 0) / courseData.material_count * 100) : 0}%)
                  </div>
                </div>
                <div className="tw-text-center">
                  <div className="tw-text-2xl tw-font-bold tw-text-amber-600">
                    {courseData.optional_material_count || 0}
                  </div>
                  <div className="tw-text-xs tw-text-gray-600 tw-mt-1">
                    Opsional ({courseData.material_count > 0 ? Math.round((courseData.optional_material_count || 0) / courseData.material_count * 100) : 0}%)
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Learning Points Statistics */}
        <Card className="tw-border-0 tw-shadow-sm">
          <Card.Header className="tw-bg-purple-50 tw-border-0">
            <h6 className="tw-font-semibold tw-text-purple-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
              <Award className="tw-w-4 tw-h-4" />
              Poin Pembelajaran ({(courseData.learning_point || []).length} poin)
            </h6>
          </Card.Header>
          <Card.Body>
            <div className="tw-p-4 tw-bg-purple-50 tw-rounded-lg tw-border tw-border-purple-100">
              <div className="tw-text-center tw-mb-3">
                <div className="tw-text-3xl tw-font-bold tw-text-purple-600">
                  {(courseData.learning_point || []).length}
                </div>
                <div className="tw-text-sm tw-text-gray-600 tw-mt-1">Total Poin Pembelajaran</div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Sections List */}
        {sections.length > 0 && (
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Header className="tw-bg-indigo-50 tw-border-0">
              <h6 className="tw-font-semibold tw-text-indigo-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
                <Layers className="tw-w-4 tw-h-4" />
                Daftar Section ({sections.length} section)
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="tw-space-y-2">
                {sections.map((section: string, index: number) => (
                  <div 
                    key={index}
                    className="tw-flex tw-items-start tw-gap-3 tw-p-3 tw-bg-indigo-50 tw-rounded-lg tw-border tw-border-indigo-100 hover:tw-bg-indigo-100 tw-transition-colors"
                  >
                    <div className="tw-flex-shrink-0 tw-w-8 tw-h-8 tw-bg-indigo-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-sm tw-font-bold">
                      {index + 1}
                    </div>
                    <div className="tw-flex-1">
                      <span className="tw-text-sm tw-text-gray-800 tw-font-medium tw-leading-relaxed">
                        {section}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Learning Points */}
        {courseData.learning_point && courseData.learning_point.length > 0 && (
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Header className="tw-bg-purple-50 tw-border-0">
              <h6 className="tw-font-semibold tw-text-purple-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
                <Award className="tw-w-4 tw-h-4" />
                Poin Pembelajaran ({courseData.learning_point.length} poin)
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3">
                {courseData.learning_point.map((point: string, index: number) => (
                  <div 
                    key={index}
                    className="tw-flex tw-items-start tw-gap-2 tw-p-3 tw-bg-purple-50 tw-rounded-lg tw-border tw-border-purple-100"
                  >
                    <div className="tw-w-6 tw-h-6 tw-bg-purple-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold tw-flex-shrink-0 tw-mt-0.5">
                      {index + 1}
                    </div>
                    <span className="tw-text-sm tw-text-gray-700 tw-leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Creator Information - Only for Admin/Teacher */}
        {userRole !== 'student' && (
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Header className="tw-bg-blue-50 tw-border-0">
              <h6 className="tw-font-semibold tw-text-blue-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
                <User className="tw-w-4 tw-h-4" />
                Informasi Pembuat
              </h6>
            </Card.Header>
            <Card.Body>
              <Row className="tw-gap-4">
                <Col md={6}>
                  <div className="tw-space-y-3">
                    <div>
                      <strong className="tw-text-gray-700 tw-text-sm">Dibuat oleh:</strong>
                      <div className="tw-flex tw-items-center tw-gap-2 tw-mt-1">
                        <div className="tw-w-8 tw-h-8 tw-bg-blue-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold">
                          {courseData.creator_name ? courseData.creator_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="tw-text-gray-600">{courseData.creator_name || 'Unknown'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <strong className="tw-text-gray-700 tw-text-sm">Tanggal Dibuat:</strong>
                      <div className="tw-text-gray-600 tw-text-sm tw-mt-1 tw-flex tw-items-center tw-gap-1">
                        <Calendar className="tw-w-4 tw-h-4" />
                        {courseData.create_date ? 
                          new Date(courseData.create_date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) : '-'
                        }
                      </div>
                    </div>
                  </div>
                </Col>
                
                {courseData.edit_date && (
                  <Col md={6}>
                    <div className="tw-space-y-3">
                      <div>
                        <strong className="tw-text-gray-700 tw-text-sm">Terakhir Diubah:</strong>
                        <div className="tw-text-gray-600 tw-text-sm tw-mt-1 tw-flex tw-items-center tw-gap-1">
                          <Calendar className="tw-w-4 tw-h-4" />
                          {new Date(courseData.edit_date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Approval Information - Only for Admin/Teacher */}
        {userRole !== 'student' && (
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Header className="tw-bg-green-50 tw-border-0">
              <h6 className="tw-font-semibold tw-text-green-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
                {getStatusIcon(courseData.approval_status)}
                Informasi Persetujuan
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="tw-space-y-4">
                <div>
                  <strong className="tw-text-gray-700 tw-text-sm">Status Persetujuan:</strong>
                  <div className="tw-mt-2">
                    <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-medium tw-border tw-flex tw-items-center tw-gap-2 tw-w-fit ${getStatusColor(courseData.approval_status)}`}>
                      {getStatusIcon(courseData.approval_status)}
                      {getStatusLabel(courseData.approval_status)}
                    </span>
                  </div>
                </div>

                {courseData.approval_status === 'approved' && courseData.approver_name && (
                  <div>
                    <strong className="tw-text-gray-700 tw-text-sm">Disetujui oleh:</strong>
                    <div className="tw-flex tw-items-center tw-gap-2 tw-mt-1">
                      <div className="tw-w-6 tw-h-6 tw-bg-green-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold">
                        {courseData.approver_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="tw-text-gray-600 tw-text-sm">{courseData.approver_name}</span>
                    </div>
                    {courseData.approve_date && (
                      <div className="tw-text-gray-500 tw-text-xs tw-mt-1 tw-flex tw-items-center tw-gap-1">
                        <Calendar className="tw-w-3 tw-h-3" />
                        {new Date(courseData.approve_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                )}

                {courseData.approval_status === 'rejected' && (
                  <div className="tw-space-y-3">
                    {courseData.approver_name && (
                      <div>
                        <strong className="tw-text-gray-700 tw-text-sm">Ditolak oleh:</strong>
                        <div className="tw-flex tw-items-center tw-gap-2 tw-mt-1">
                          <div className="tw-w-6 tw-h-6 tw-bg-red-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold">
                            {courseData.approver_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="tw-text-gray-600 tw-text-sm">{courseData.approver_name}</span>
                        </div>
                        {courseData.approve_date && (
                          <div className="tw-text-gray-500 tw-text-xs tw-mt-1 tw-flex tw-items-center tw-gap-1">
                            <Calendar className="tw-w-3 tw-h-3" />
                            {new Date(courseData.approve_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {courseData.rejection_reason && (
                      <div>
                        <strong className="tw-text-gray-700 tw-text-sm">Alasan Penolakan:</strong>
                        <div className="tw-mt-1 tw-p-3 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg">
                          <p className="tw-text-red-700 tw-text-sm tw-leading-relaxed">
                            {courseData.rejection_reason}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {courseData.approval_status === 'need_approve' && (
                  <div className="tw-p-3 tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-rounded-lg">
                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-yellow-700">
                      <Clock className="tw-w-4 tw-h-4" />
                      <span className="tw-text-sm tw-font-medium">Menunggu persetujuan dari admin</span>
                    </div>
                    <p className="tw-text-yellow-600 tw-text-xs tw-mt-1">
                      Kursus ini akan dapat digunakan setelah mendapat persetujuan dari administrator.
                    </p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Delete Information - Only for Admin/Teacher if deleted */}
        {userRole !== 'student' && courseData.is_deleted && (
          <Card className="tw-border-0 tw-shadow-sm tw-border-red-200">
            <Card.Header className="tw-bg-red-50 tw-border-0">
              <h6 className="tw-font-semibold tw-text-red-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
                <XCircle className="tw-w-4 tw-h-4" />
                Informasi Penghapusan
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="tw-space-y-3">
                {courseData.delete_reason && (
                  <div>
                    <strong className="tw-text-gray-700 tw-text-sm">Alasan Penghapusan:</strong>
                    <div className="tw-text-red-600 tw-text-sm tw-mt-1 tw-p-2 tw-bg-red-50 tw-rounded">
                      {courseData.delete_reason}
                    </div>
                  </div>
                )}
                
                {courseData.delete_date && (
                  <div>
                    <strong className="tw-text-gray-700 tw-text-sm">Tanggal Dihapus:</strong>
                    <div className="tw-text-gray-600 tw-text-sm tw-mt-1 tw-flex tw-items-center tw-gap-1">
                      <Calendar className="tw-w-4 tw-h-4" />
                      {new Date(courseData.delete_date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Course URL */}
        {courseData.courseUrl && (
          <Card className="tw-border-0 tw-shadow-sm">
            <Card.Header className="tw-bg-gray-50 tw-border-0">
              <h6 className="tw-font-semibold tw-text-gray-800 tw-mb-0 tw-flex tw-items-center tw-gap-2">
                <FileText className="tw-w-4 tw-h-4" />
                Link Kursus
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="tw-flex tw-items-center tw-gap-3">
                <code className="tw-bg-gray-100 tw-p-2 tw-rounded tw-text-sm tw-flex-1 tw-break-all">
                  {courseData.courseUrl}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(courseData.courseUrl);
                    alert('Link berhasil disalin!');
                  }}
                  className="tw-px-3 tw-py-1 tw-bg-blue-500 tw-text-white tw-rounded tw-text-sm hover:tw-bg-blue-600 tw-transition-colors"
                >
                  Salin
                </button>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </LearningModal>
  );
};

export default DetailCourseModal;