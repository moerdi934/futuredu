// pages/panel/courses/courses-page/index.tsx - Updated with Material Counts
import React, { useState } from 'react';
import { FaPlus, FaEye, FaEdit, FaTrash, FaGraduationCap, FaBook, FaCheckCircle, FaUndo, FaCheck, FaTimes, FaClock, FaUser, FaRocket, FaListOl, FaLayerGroup, FaCalendarAlt, FaUserCheck, FaFileAlt } from 'react-icons/fa';
import { BookOpen, Users, Calendar, Settings, FileText, Award, Timer, File, CheckSquare, Square } from 'lucide-react';
import MainLayout from '../../../../components/layout/DashboardLayout';
import ReportLayout from '../../../../components/report/ReportLayout';
import { ReportConfig, ColumnConfig, ActionColumnButton } from '../../../../types/report';
import { useAuth } from '../../../../context/AuthContext';
import AddCourseModal from './AddCourseModal';
import EditCourseModal from './EditCourseModal';
import DetailCourseModal from './DetailCourseModal';
import ApprovalModal from './ApprovalModal';
import GoLiveModal from './GoLiveModal';

const CoursesPage: React.FC = () => {
  const { id: currentUserId, role: userRole } = useAuth();
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [refreshFunction, setRefreshFunction] = useState<(() => void) | null>(null);

  // Custom formatters
  const formatLearningPoints = (value: any[], row: any) => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      return (
        <div className="tw-text-center tw-text-gray-400 tw-italic">
          <Award size={14} className="tw-inline tw-mr-1" />
          Belum ada poin pembelajaran
        </div>
      );
    }

    return (
      <div className="tw-space-y-1">
        <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-medium tw-text-gray-700">
          <Award size={12} className="tw-text-purple-600" />
          <span>{value.length} poin pembelajaran</span>
        </div>
        <div className="tw-text-xs tw-text-gray-500 tw-line-clamp-2">
          {value.slice(0, 3).join(', ')}
          {value.length > 3 && '...'}
        </div>
      </div>
    );
  };

  const formatSectionNum = (value: number, row: any) => {
    if (!value || value === 0) {
      return (
        <div className="tw-text-center tw-text-gray-400 tw-italic tw-text-sm">
          <FaLayerGroup size={12} className="tw-inline tw-mr-1" />
          Belum ada section
        </div>
      );
    }

    return (
      <div className="tw-text-center">
        <div className="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1 tw-bg-indigo-100 tw-text-indigo-800 tw-rounded-full tw-text-sm tw-font-medium">
          <FaLayerGroup size={12} />
          <span>{value} Section{value > 1 ? 's' : ''}</span>
        </div>
      </div>
    );
  };

  const formatSectionString = (value: string, row: any) => {
    if (!value) {
      return (
        <div className="tw-text-center tw-text-gray-400 tw-italic tw-text-xs">
          Tidak ada judul section
        </div>
      );
    }

    const sections = value.split(/[,;]/).map(s => s.trim()).filter(s => s);
    
    return (
      <div className="tw-space-y-1">
        <div className="tw-text-xs tw-text-gray-600 tw-font-medium">
          {sections.length} Section{sections.length > 1 ? 's' : ''}:
        </div>
        <div className="tw-text-xs tw-text-gray-500 tw-line-clamp-3">
          {sections.slice(0, 3).map((section, idx) => (
            <div key={idx} className="tw-flex tw-items-start tw-gap-1 tw-mb-1">
              <span className="tw-text-indigo-600 tw-font-bold">{idx + 1}.</span>
              <span className="tw-line-clamp-1">{section}</span>
            </div>
          ))}
          {sections.length > 3 && (
            <div className="tw-text-gray-400 tw-italic">
              +{sections.length - 3} section lainnya...
            </div>
          )}
        </div>
      </div>
    );
  };

  const formatTopicCount = (value: number, row: any) => {
    if (!value || value === 0) {
      return (
        <div className="tw-text-center tw-text-gray-400 tw-italic tw-text-sm">
          <FaListOl size={12} className="tw-inline tw-mr-1" />
          Belum ada topik
        </div>
      );
    }

    return (
      <div className="tw-text-center">
        <div className="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1 tw-bg-teal-100 tw-text-teal-800 tw-rounded-full tw-text-sm tw-font-medium">
          <FaListOl size={12} />
          <span>{value} Topik</span>
        </div>
      </div>
    );
  };

  const formatMaterialCount = (value: number, row: any) => {
    if (!value || value === 0) {
      return (
        <div className="tw-text-center tw-text-gray-400 tw-italic tw-text-sm">
          <File size={12} className="tw-inline tw-mr-1" />
          Belum ada materi
        </div>
      );
    }

    return (
      <div className="tw-text-center">
        <div className="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1 tw-bg-blue-100 tw-text-blue-800 tw-rounded-full tw-text-sm tw-font-medium">
          <File size={12} />
          <span>{value} Materi</span>
        </div>
      </div>
    );
  };

  const formatMandatoryMaterialCount = (value: number, row: any) => {
    if (!value || value === 0) {
      return (
        <div className="tw-text-center tw-text-gray-400 tw-italic tw-text-sm">
          <CheckSquare size={12} className="tw-inline tw-mr-1" />
          0 Wajib
        </div>
      );
    }

    return (
      <div className="tw-text-center">
        <div className="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1 tw-bg-rose-100 tw-text-rose-800 tw-rounded-full tw-text-sm tw-font-medium">
          <CheckSquare size={12} />
          <span>{value} Wajib</span>
        </div>
      </div>
    );
  };

  const formatOptionalMaterialCount = (value: number, row: any) => {
    if (!value || value === 0) {
      return (
        <div className="tw-text-center tw-text-gray-400 tw-italic tw-text-sm">
          <Square size={12} className="tw-inline tw-mr-1" />
          0 Opsional
        </div>
      );
    }

    return (
      <div className="tw-text-center">
        <div className="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1 tw-bg-amber-100 tw-text-amber-800 tw-rounded-full tw-text-sm tw-font-medium">
          <Square size={12} />
          <span>{value} Opsional</span>
        </div>
      </div>
    );
  };

  const formatTotalDuration = (value: number, row: any) => {
    if (!value || value === 0) {
      return (
        <div className="tw-text-center tw-text-gray-400 tw-italic tw-text-sm">
          <Timer size={12} className="tw-inline tw-mr-1" />
          Belum ditentukan
        </div>
      );
    }

    const hours = Math.floor(value / 60);
    const minutes = value % 60;

    let durationText = '';
    if (hours > 0) {
      durationText += `${hours} jam`;
      if (minutes > 0) {
        durationText += ` ${minutes} menit`;
      }
    } else {
      durationText = `${minutes} menit`;
    }

    return (
      <div className="tw-text-center">
        <div className="tw-inline-flex tw-flex-col tw-items-center tw-gap-1 tw-px-3 tw-py-2 tw-bg-orange-100 tw-text-orange-800 tw-rounded-lg">
          <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-bold">
            <Timer size={14} />
            <span>{durationText}</span>
          </div>
          <div className="tw-text-xs tw-text-orange-600">
            Total durasi
          </div>
        </div>
      </div>
    );
  };

  // Student-specific formatters
  const formatEntitlementDate = (value: string, row: any) => {
    if (!value) return '-';
    
    return (
      <div className="tw-text-center">
        <div className="tw-text-sm tw-text-gray-700 tw-flex tw-items-center tw-justify-center tw-gap-1">
          <FaCalendarAlt size={12} />
          {new Date(value).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      </div>
    );
  };

  const formatExpiresAt = (value: string, row: any) => {
    if (!value) {
      return (
        <div className="tw-text-center">
          <span className="tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-bg-green-100 tw-text-green-800">
            Selamanya
          </span>
        </div>
      );
    }
    
    const expiryDate = new Date(value);
    const now = new Date();
    const isExpired = expiryDate < now;
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <div className="tw-text-center">
        <div className={`tw-inline-flex tw-flex-col tw-items-center tw-gap-1 tw-px-3 tw-py-2 tw-rounded-lg ${
          isExpired ? 'tw-bg-red-100 tw-text-red-800' : 
          daysUntilExpiry <= 7 ? 'tw-bg-yellow-100 tw-text-yellow-800' :
          'tw-bg-blue-100 tw-text-blue-800'
        }`}>
          <div className="tw-text-sm tw-font-bold tw-flex tw-items-center tw-gap-1">
            <FaClock size={12} />
            {expiryDate.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </div>
          {!isExpired && daysUntilExpiry <= 30 && (
            <div className="tw-text-xs">
              {daysUntilExpiry} hari lagi
            </div>
          )}
          {isExpired && (
            <div className="tw-text-xs">
              Sudah berakhir
            </div>
          )}
        </div>
      </div>
    );
  };

  const formatEntitlementStatus = (value: boolean, row: any) => {
    return (
      <div className="tw-text-center">
        <span className={`tw-px-3 tw-py-2 tw-rounded-full tw-text-xs tw-font-medium tw-flex tw-items-center tw-justify-center tw-gap-2 ${
          value 
            ? 'tw-bg-green-100 tw-text-green-800' 
            : 'tw-bg-red-100 tw-text-red-800'
        }`}>
          {value ? <FaCheckCircle size={12} /> : <FaTimes size={12} />}
          {value ? 'Aktif' : 'Tidak Aktif'}
        </span>
      </div>
    );
  };

  // Admin/Teacher specific formatters
  const formatStatus = (value: string) => {
    const statusConfig = {
      'approved': { 
        color: 'tw-bg-green-100 tw-text-green-800', 
        icon: <FaCheckCircle size={12} />,
        label: 'Disetujui'
      },
      'need_approve': { 
        color: 'tw-bg-yellow-100 tw-text-yellow-800', 
        icon: <FaClock size={12} />,
        label: 'Menunggu Persetujuan'
      },
      'rejected': { 
        color: 'tw-bg-red-100 tw-text-red-800', 
        icon: <FaTimes size={12} />,
        label: 'Ditolak'
      }
    };

    const config = statusConfig[value] || statusConfig['need_approve'];
    
    return (
      <div className="tw-text-center">
        <span className={`tw-px-3 tw-py-2 tw-rounded-full tw-text-xs tw-font-medium tw-flex tw-items-center tw-justify-center tw-gap-2 ${config.color}`}>
          {config.icon}
          {config.label}
        </span>
      </div>
    );
  };

  const formatApprovalStatus = (value: string, row: any) => {
    const statusConfig = {
      'approved': { 
        color: 'tw-bg-green-100 tw-text-green-800', 
        icon: <FaCheck size={12} />,
        label: 'Disetujui'
      },
      'need_approve': { 
        color: 'tw-bg-yellow-100 tw-text-yellow-800', 
        icon: <FaClock size={12} />,
        label: 'Menunggu Persetujuan'
      },
      'rejected': { 
        color: 'tw-bg-red-100 tw-text-red-800', 
        icon: <FaTimes size={12} />,
        label: 'Ditolak'
      }
    };

    const config = statusConfig[value] || statusConfig['approved'];
    
    return (
      <div className="tw-text-center">
        <span className={`tw-px-3 tw-py-2 tw-rounded-full tw-text-xs tw-font-medium tw-flex tw-items-center tw-justify-center tw-gap-2 ${config.color}`}>
          {config.icon}
          {config.label}
        </span>
        {row.approver_name && value !== 'need_approve' && (
          <div className="tw-text-xs tw-text-gray-500 tw-mt-1">
            oleh {row.approver_name}
          </div>
        )}
      </div>
    );
  };

  const formatGoLiveStatus = (value: any, row: any) => {
    const isLive = row.is_live || false;
    
    return (
      <div className="tw-text-center">
        <span className={`tw-px-3 tw-py-2 tw-rounded-full tw-text-xs tw-font-medium tw-flex tw-items-center tw-justify-center tw-gap-2 ${
          isLive 
            ? 'tw-bg-blue-100 tw-text-blue-800' 
            : 'tw-bg-gray-100 tw-text-gray-600'
        }`}>
          <FaRocket size={12} />
          {isLive ? 'Live' : 'Not Live'}
        </span>
        {isLive && row.live_since && (
          <div className="tw-text-xs tw-text-gray-500 tw-mt-1">
            sejak {new Date(row.live_since).toLocaleDateString('id-ID')}
          </div>
        )}
      </div>
    );
  };

  const formatCreator = (value: string) => {
    return (
      <div className="tw-flex tw-items-center tw-gap-2">
        <div className="tw-w-8 tw-h-8 tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold">
          {value ? value.charAt(0).toUpperCase() : 'U'}
        </div>
        <span className="tw-font-medium tw-text-gray-700">{value || 'Unknown'}</span>
      </div>
    );
  };

  const formatBoolean = (value: boolean) => {
    return (
      <div className="tw-text-center">
        <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium ${
          value 
            ? 'tw-bg-green-100 tw-text-green-800' 
            : 'tw-bg-red-100 tw-text-red-800'
        }`}>
          {value ? '✓ Ya' : '✗ Tidak'}
        </span>
      </div>
    );
  };

  const formatDeleteInfo = (value: string, row: any) => {
    if (!row.is_deleted) return '-';
    
    return (
      <div className="tw-text-center">
        <div className="tw-text-red-600 tw-text-xs tw-font-medium">
          {value || 'Dihapus oleh pengguna'}
        </div>
        {row.delete_date && (
          <div className="tw-text-gray-500 tw-text-xs tw-mt-1">
            {new Date(row.delete_date).toLocaleDateString('id-ID')}
          </div>
        )}
      </div>
    );
  };

  const formatEntitledCount = (value: number, row: any) => {
    return (
      <div className="tw-text-center">
        <div className="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1 tw-bg-blue-100 tw-text-blue-800 tw-rounded-full tw-text-sm tw-font-medium">
          <FaUserCheck size={12} />
          <span>{value || 0} User</span>
        </div>
      </div>
    );
  };

  const formatActiveEntitledCount = (value: number, row: any) => {
    return (
      <div className="tw-text-center">
        <div className="tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1 tw-bg-green-100 tw-text-green-800 tw-rounded-full tw-text-sm tw-font-medium">
          <FaCheckCircle size={12} />
          <span>{value || 0} Aktif</span>
        </div>
      </div>
    );
  };

  // Permission checks
  const canUserManageCourse = (row: any) => {
    return currentUserId && (
      userRole === 'admin' ||
      (row.create_user_id && (parseInt(row.create_user_id.toString()) === currentUserId || row.create_user_id.toString() === currentUserId.toString()))
    );
  };

  const canApproveCourse = (row: any) => {
    return userRole === 'admin';
  };

  const canGoLive = (row: any) => {
    return userRole === 'admin' && 
           row.approval_status === 'approved' && 
           !row.is_deleted &&
           !row.is_live;
  };

  // Handler functions
  const handleAddSave = (courseData: any) => {
    console.log('Course creation initiated:', courseData);
    refreshFunction?.();
  };

  const handleEditSave = (courseData: any) => {
    console.log('Course edit initiated:', courseData);
    setEditingCourse(null);
    refreshFunction?.();
  };

  const handleApprovalSave = () => {
    setShowApprovalModal(false);
    setSelectedCourse(null);
    refreshFunction?.();
  };

  const handleGoLiveSave = () => {
    setShowGoLiveModal(false);
    setSelectedCourse(null);
    refreshFunction?.();
  };

  const handleDetail = (row: any) => {
    setSelectedCourse(row);
    setShowDetailModal(true);
  };

  const handleEdit = (row: any) => {
    setEditingCourse(row);
    setShowEditModal(true);
  };

  const handleApprove = (row: any) => {
    setSelectedCourse(row);
    setShowApprovalModal(true);
  };

  const handleGoLive = (row: any) => {
    setSelectedCourse(row);
    setShowGoLiveModal(true);
  };

  const handleDelete = async (row: any) => {
    const reason = window.prompt(`Apakah Anda yakin ingin menghapus kursus "${row.title}"?\n\nMasukkan alasan penghapusan (opsional):`);
    
    if (reason !== null) {
      try {
        const response = await fetch(`/api/courses/${row.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            delete_reason: reason || 'Dihapus oleh pengguna'
          })
        });

        if (response.ok) {
          alert('Kursus berhasil dihapus');
          refreshFunction?.();
        } else {
          const error = await response.json();
          alert('Gagal menghapus kursus: ' + (error.message || 'Terjadi kesalahan'));
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Gagal menghapus kursus: Terjadi kesalahan jaringan');
      }
    }
  };

  const handleRestore = async (row: any) => {
    if (window.confirm(`Apakah Anda yakin ingin mengembalikan kursus "${row.title}"?`)) {
      try {
        const response = await fetch(`/api/courses/${row.id}/restore`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          alert('Kursus berhasil dikembalikan');
          refreshFunction?.();
        } else {
          const error = await response.json();
          alert('Gagal mengembalikan kursus: ' + (error.message || 'Terjadi kesalahan'));
        }
      } catch (error) {
        console.error('Restore error:', error);
        alert('Gagal mengembalikan kursus: Terjadi kesalahan jaringan');
      }
    }
  };

  // Dynamic action buttons based on user role and course status
  const getActionButtons = (row: any, index: number): ActionColumnButton[] => {
    const buttons: ActionColumnButton[] = [];

    // Detail button - always available
    buttons.push({
      label: 'Detail',
      icon: React.createElement(FaEye),
      variant: 'outline-info',
      size: 'sm',
      onClick: () => handleDetail(row)
    });

    // Student only sees detail button
    if (userRole === 'student') {
      return buttons;
    }

    // Admin/Teacher buttons
    if (canGoLive(row)) {
      buttons.push({
        label: 'Go Live',
        icon: React.createElement(FaRocket),
        variant: 'outline-success',
        size: 'sm',
        onClick: () => handleGoLive(row)
      });
    }

    if ((row.approval_status === 'need_approve') && canApproveCourse(row)) {
      buttons.push({
        label: 'Setujui',
        icon: React.createElement(FaCheck),
        variant: 'outline-primary',
        size: 'sm',
        onClick: () => handleApprove(row)
      });
    }

    if (canUserManageCourse(row) && !row.is_deleted) {
      const canEdit = userRole === 'admin' || 
                     (userRole === 'teacher' && row.create_user_id === currentUserId && row.approval_status === 'need_approve');
      
      if (canEdit) {
        buttons.push({
          label: 'Edit',
          icon: React.createElement(FaEdit),
          variant: 'outline-warning',
          size: 'sm',
          onClick: () => handleEdit(row)
        });
      }
    }

    if (canUserManageCourse(row) && !row.is_deleted) {
      buttons.push({
        label: 'Delete',
        icon: React.createElement(FaTrash),
        variant: 'outline-danger',
        size: 'sm',
        onClick: () => handleDelete(row)
      });
    }

    if (canUserManageCourse(row) && row.is_deleted) {
      buttons.push({
        label: 'Restore',
        icon: React.createElement(FaUndo),
        variant: 'outline-success',
        size: 'sm',
        onClick: () => handleRestore(row)
      });
    }

    return buttons;
  };

  // Define columns based on user role
  const getColumns = (): ColumnConfig[] => {
    const basicColumns: ColumnConfig[] = [
      {
        key: 'id',
        label: 'ID',
        type: 'number',
        width: 80,
        colGroup: 'basic'
      },
      {
        key: 'title',
        label: 'Judul Kursus',
        type: 'string',
        width: 250,
        colGroup: 'basic',
        formatter: (value, row) => (
          <div className={`tw-font-semibold tw-leading-tight ${row.is_deleted ? 'tw-text-gray-400 tw-line-through' : 'tw-text-gray-800'}`}>
            {value || '-'}
            {row.is_live && (
              <span className="tw-ml-2 tw-inline-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-bg-blue-100 tw-text-blue-800 tw-text-xs tw-rounded-full">
                <FaRocket size={10} />
                LIVE
              </span>
            )}
          </div>
        )
      },
      {
        key: 'description',
        label: 'Deskripsi',
        type: 'string',
        width: 300,
        colGroup: 'basic',
        formatter: (value, row) => (
          <div className={`tw-text-sm tw-line-clamp-3 tw-leading-relaxed ${row.is_deleted ? 'tw-text-gray-400' : 'tw-text-gray-600'}`} title={value}>
            {value || '-'}
          </div>
        )
      },
      {
        key: 'imageUrl',
        label: 'Gambar',
        type: 'string',
        width: 120,
        colGroup: 'basic',
        formatter: (value, row) => (
          <div className="tw-text-center">
            {value ? (
              <img 
                src={value} 
                alt="Course" 
                className="tw-w-16 tw-h-12 tw-object-cover tw-rounded tw-mx-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML = '<div class="tw-text-gray-400 tw-text-xs">Tidak ada gambar</div>';
                }}
              />
            ) : (
              <div className="tw-text-gray-400 tw-text-xs">Tidak ada gambar</div>
            )}
          </div>
        )
      },
      {
        key: 'learning_point',
        label: 'Poin Pembelajaran',
        type: 'array',
        width: 250,
        colGroup: 'content',
        formatter: formatLearningPoints
      },
      {
        key: 'section_count',
        label: 'Jumlah Section',
        type: 'number',
        width: 150,
        colGroup: 'content',
        formatter: formatSectionNum
      },
      {
        key: 'section_string',
        label: 'Daftar Section',
        type: 'string',
        width: 280,
        colGroup: 'content',
        formatter: formatSectionString
      },
      {
        key: 'topic_count',
        label: 'Total Topik',
        type: 'number',
        width: 130,
        colGroup: 'content',
        formatter: formatTopicCount
      },
      {
        key: 'material_count',
        label: 'Total Materi',
        type: 'number',
        width: 130,
        colGroup: 'content',
        formatter: formatMaterialCount
      },
      {
        key: 'mandatory_material_count',
        label: 'Materi Wajib',
        type: 'number',
        width: 130,
        colGroup: 'content',
        formatter: formatMandatoryMaterialCount
      },
      {
        key: 'optional_material_count',
        label: 'Materi Opsional',
        type: 'number',
        width: 140,
        colGroup: 'content',
        formatter: formatOptionalMaterialCount
      },
      {
        key: 'total_duration_minutes',
        label: 'Total Durasi',
        type: 'number',
        width: 160,
        colGroup: 'content',
        formatter: formatTotalDuration
      }
    ];

    if (userRole === 'student') {
      // Student columns - add entitlement info
      return [
        ...basicColumns,
        {
          key: 'granted_at',
          label: 'Tanggal Akses Diberikan',
          type: 'datetime',
          width: 180,
          colGroup: 'entitlement',
          formatter: formatEntitlementDate
        },
        {
          key: 'expires_at',
          label: 'Masa Berlaku',
          type: 'datetime',
          width: 180,
          colGroup: 'entitlement',
          formatter: formatExpiresAt
        },
        {
          key: 'is_entitled_active',
          label: 'Status Akses',
          type: 'boolean',
          width: 130,
          colGroup: 'entitlement',
          formatter: formatEntitlementStatus
        }
      ];
    } else {
      // Admin/Teacher columns - add management info
      return [
        ...basicColumns,
        {
          key: 'entitled_users_count',
          label: 'Total User Entitled',
          type: 'number',
          width: 160,
          colGroup: 'entitlement_stats',
          formatter: formatEntitledCount
        },
        {
          key: 'active_entitled_count',
          label: 'User Aktif',
          type: 'number',
          width: 140,
          colGroup: 'entitlement_stats',
          formatter: formatActiveEntitledCount
        },
        {
          key: 'approval_status',
          label: 'Status Persetujuan',
          type: 'string',
          width: 170,
          colGroup: 'status',
          formatter: formatApprovalStatus
        },
        {
          key: 'is_live',
          label: 'Status Go Live',
          type: 'string',
          width: 130,
          colGroup: 'status',
          formatter: formatGoLiveStatus
        },
        {
          key: 'is_deleted',
          label: 'Status Hapus',
          type: 'boolean',
          width: 130,
          colGroup: 'status',
          formatter: formatBoolean
        },
        {
          key: 'creator_name',
          label: 'Pembuat',
          type: 'string',
          width: 180,
          colGroup: 'creator',
          formatter: formatCreator
        },
        {
          key: 'create_user_id',
          label: 'ID Pembuat',
          type: 'string',
          width: 120,
          colGroup: 'creator'
        },
        {
          key: 'create_date',
          label: 'Tanggal Dibuat',
          type: 'datetime',
          width: 150,
          colGroup: 'creator',
          formatter: (value) => {
            if (!value) return '-';
            const date = new Date(value);
            return date.toLocaleDateString('id-ID');
          }
        },
        {
          key: 'edit_user_id',
          label: 'ID Editor',
          type: 'string',
          width: 120,
          colGroup: 'creator'
        },
        {
          key: 'edit_date',
          label: 'Tanggal Edit',
          type: 'datetime',
          width: 150,
          colGroup: 'creator',
          formatter: (value) => {
            if (!value) return '-';
            const date = new Date(value);
            return date.toLocaleDateString('id-ID');
          }
        },
        {
          key: 'approver_name',
          label: 'Penyetuju',
          type: 'string',
          width: 180,
          colGroup: 'approval',
          formatter: (value) => value ? formatCreator(value) : '-'
        },
        {
          key: 'approve_date',
          label: 'Tanggal Persetujuan',
          type: 'datetime',
          width: 150,
          colGroup: 'approval',
          formatter: (value) => {
            if (!value) return '-';
            const date = new Date(value);
            return date.toLocaleDateString('id-ID');
          }
        },
        {
          key: 'rejection_reason',
          label: 'Alasan Penolakan',
          type: 'string',
          width: 200,
          colGroup: 'approval',
          formatter: (value) => (
            <div className="tw-text-sm tw-text-gray-600 tw-line-clamp-2">
              {value || '-'}
            </div>
          )
        },
        {
          key: 'delete_reason',
          label: 'Alasan Dihapus',
          type: 'string',
          width: 200,
          colGroup: 'delete_info',
          formatter: formatDeleteInfo
        }
      ];
    }
  };

  // Define filters based on user role
  const getFilters = () => {
    const basicFilters = [
      {
        key: 'title',
        type: 'text',
        label: 'Judul Kursus'
      }
    ];

    if (userRole === 'student') {
      return basicFilters;
    }

    return [
      ...basicFilters,
      {
        key: 'approvalStatus',
        type: 'select',
        label: 'Status Persetujuan',
        options: [
          { value: 'all', label: 'Semua' },
          { value: 'approved', label: 'Disetujui' },
          { value: 'need_approve', label: 'Menunggu Persetujuan' },
          { value: 'rejected', label: 'Ditolak' }
        ]
      },
      {
        key: 'liveStatus',
        type: 'select',
        label: 'Status Go Live',
        options: [
          { value: 'all', label: 'Semua' },
          { value: 'live', label: 'Sudah Live' },
          { value: 'not_live', label: 'Belum Live' }
        ]
      },
      {
        key: 'includeDeleted',
        type: 'select',
        label: 'Tampilkan Data',
        options: [
          { value: 'false', label: 'Hanya Data Aktif' },
          { value: 'true', label: 'Termasuk Yang Dihapus' },
          { value: 'only_deleted', label: 'Hanya Yang Dihapus' }
        ]
      }
    ];
  };

  // Define column groups based on user role
  const getColGroups = () => {
    const basicGroups = [
      {
        key: 'basic',
        label: 'Informasi Dasar',
        columns: ['id', 'title', 'description', 'imageUrl']
      },
      {
        key: 'content',
        label: 'Konten Kursus',
        columns: ['learning_point', 'section_count', 'section_string', 'topic_count', 'material_count', 'mandatory_material_count', 'optional_material_count', 'total_duration_minutes']
      }
    ];

    if (userRole === 'student') {
      return [
        ...basicGroups,
        {
          key: 'entitlement',
          label: 'Informasi Akses',
          columns: ['granted_at', 'expires_at', 'is_entitled_active']
        }
      ];
    }

    return [
      ...basicGroups,
      {
        key: 'entitlement_stats',
        label: 'Statistik Entitlement',
        columns: ['entitled_users_count', 'active_entitled_count']
      },
      {
        key: 'status',
        label: 'Status',
        columns: ['approval_status', 'is_live', 'is_deleted']
      },
      {
        key: 'creator',
        label: 'Informasi Pembuat',
        columns: ['creator_name', 'create_user_id', 'create_date', 'edit_user_id', 'edit_date']
      },
      {
        key: 'approval',
        label: 'Informasi Persetujuan',
        columns: ['approver_name', 'approve_date', 'rejection_reason']
      },
      {
        key: 'delete_info',
        label: 'Informasi Penghapusan',
        columns: ['delete_reason']
      }
    ];
  };

  // Define default visible columns based on role
  const getDefaultVisibleColumns = () => {
    if (userRole === 'student') {
      return [
        'title',
        'description',
        'section_count',
        'topic_count',
        'material_count',
        'total_duration_minutes',
        'granted_at',
        'expires_at',
        'is_entitled_active'
      ];
    }

    return [
      'title',
      'description',
      'section_count',
      'topic_count',
      'material_count',
      'mandatory_material_count',
      'optional_material_count',
      'total_duration_minutes',
      'entitled_users_count',
      'active_entitled_count',
      'approval_status',
      'is_live',
      'creator_name',
      'create_date'
    ];
  };

  // Define action buttons based on role
  const getActionButtonsConfig = () => {
    if (userRole === 'student') {
      return [];
    }

    const buttons = [];

    if (userRole === 'teacher' || userRole === 'admin') {
      buttons.push({
        label: 'Buat Kursus Baru',
        icon: React.createElement(FaPlus),
        variant: 'primary',
        onClick: () => {
          console.log('Create new course');
          setShowAddModal(true);
        }
      });
    }

    buttons.push({
      label: 'Manajemen Kelas',
      icon: React.createElement(Users),
      variant: 'success',
      onClick: () => {
        console.log('Manage classes');
        window.location.href = '/panel/courses/classes-page';
      }
    });

    return buttons;
  };

  // Report config
  const reportConfig: ReportConfig = {
    title: userRole === 'student' ? 'Kursus Saya' : 'Manajemen Kursus (Courses)',
    columns: getColumns(),
    colGroups: getColGroups(),
    filters: getFilters(),
    defaultSort: [
      { key: 'id', direction: 'desc' }
    ],
    defaultVisibleColumns: getDefaultVisibleColumns(),
    defaultFreezeColumn: 'title',
    showIcon: true,
    showRowNumber: true,
    pageSize: 10,
    rowHeight: 80,
    exportConfig: {
      enabled: userRole !== 'student',
      filename: 'courses_data',
      formats: ['excel', 'csv', 'pdf']
    },
    actionColumn: {
      enabled: true,
      label: 'Actions',
      width: userRole === 'student' ? 100 : 320,
      sticky: false,
      buttons: getActionButtons
    },
    actionButtons: getActionButtonsConfig()
  };

  const ReportLayoutWithRefresh: React.FC = () => {
    return (
      <ReportLayout
        config={reportConfig}
        apiEndpoint="/courses"
        fetchOnMount={true}
        searchMode="server"
        onRefreshFunctionReady={setRefreshFunction}
      />
    );
  };

  return (
    <MainLayout>
      <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-purple-50 tw-via-white tw-to-purple-50">
        <ReportLayoutWithRefresh />
      </div>

      {/* Modals - only for admin/teacher */}
      {userRole !== 'student' && (
        <>
          <AddCourseModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleAddSave}
          />

          <EditCourseModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingCourse(null);
            }}
            onSave={handleEditSave}
            editingData={editingCourse}
          />

          {selectedCourse && (
            <>
              <ApprovalModal
                show={showApprovalModal}
                onClose={() => {
                  setShowApprovalModal(false);
                  setSelectedCourse(null);
                }}
                courseData={selectedCourse}
                onSave={handleApprovalSave}
              />

              <GoLiveModal
                isOpen={showGoLiveModal}
                onClose={() => {
                  setShowGoLiveModal(false);
                  setSelectedCourse(null);
                }}
                onSave={handleGoLiveSave}
                courseData={selectedCourse}
              />
            </>
          )}
        </>
      )}

      {/* Detail Modal - available for all roles */}
      <DetailCourseModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCourse(null);
        }}
        courseData={selectedCourse}
      />
    </MainLayout>
  );
};

export default CoursesPage;