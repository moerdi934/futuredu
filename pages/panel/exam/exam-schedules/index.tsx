// pages/panel/exam/exam-schedules/index.tsx - Optimized Student Loading
import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEye, FaEdit, FaTrash, FaCalendar, FaClock, FaCheck, FaTimes, FaRocket, FaUndo, FaGift, FaPlay } from 'react-icons/fa';
import { BookOpen } from 'lucide-react';
import MainLayout from '../../../../components/layout/DashboardLayout';
import ReportLayout from '../../../../components/report/ReportLayout';
import { ReportConfig, ColumnConfig, ActionColumnButton } from '../../../../types/report';
import { useAuth } from '../../../../context/AuthContext';
import AddExamScheduleModal from './AddExamScheduleModal';
import CreateExamModal from './AddExamModal';
import ExamScheduleApprovalModal from './ApprovalModal';
import ExamScheduleGoLiveModal from './GoLiveModal';
import ExamModal from '../../../try-out/ExamModal';
import ExamScoreModal from '../../../try-out/ExamScoreModal';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

// Types for exam schedule data
interface ExamSchedule {
  id: number;
  schedule_name: string;
  name: string;
  start_time: string;
  end_time: string;
  exam_type: string;
  isfree: boolean;
  is_valid: boolean;
  approval_status: string;
  create_date: string;
  description?: string;
  exam_name?: string;
  exam_duration?: string;
  question_qty?: string;
  schedule_creator?: string;
  exam_creator?: string;
  is_live?: boolean;
  is_deleted?: boolean;
}

// Student-specific interface (from new API)
interface StudentExamSchedule {
  id: number;
  schedule_name: string;
  description?: string;
  exam_type: string;
  isfree: boolean;
  start_time: string;
  end_time: string;
  create_date: string;
  exam_name?: string;
  exam_duration?: number;
  question_qty?: number;
  has_completed: boolean;
  total_score?: number;
  average_score?: number;
  total_correct?: number;
  total_questions?: number;
  completion_time?: string;
  access_type: 'free' | 'entitled' | 'no_access';
}

const ExamSchedulesPage: React.FC = () => {
  const { id: currentUserId, role: userRole, isAuthenticated } = useAuth();
  
  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [selectedExamSchedule, setSelectedExamSchedule] = useState(null);
  
  // Student-specific modals
  const [showExamStartModal, setShowExamStartModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [selectedScheduleName, setSelectedScheduleName] = useState<string>('');
  
  // State untuk refresh function (only for admin/teacher)
  const [refreshFunction, setRefreshFunction] = useState<(() => void) | null>(null);

  // Determine if user is student
  const isStudent = userRole === 'student';

  // Custom formatters
  const formatExamNames = (value: string) => {
    if (!value) return '-';
    const names = value.split('.');
    return (
      <div className="tw-space-y-1">
        {names.map((name, index) => (
          <div key={index} className="tw-text-xs tw-bg-blue-100 tw-text-blue-800 tw-px-2 tw-py-1 tw-rounded tw-inline-block tw-mr-1 tw-mb-1">
            {name.trim()}
          </div>
        ))}
      </div>
    );
  };

  const formatDuration = (value: string | number) => {
    if (!value) return '-';
    const minutes = typeof value === 'string' ? parseInt(value) : value;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return (
      <div className="tw-text-center">
        <div className="tw-font-semibold tw-text-purple-700 tw-flex tw-items-center tw-justify-center tw-gap-1">
          <FaClock size={12} />
          {hours > 0 ? `${hours}j ${remainingMinutes}m` : `${remainingMinutes}m`}
        </div>
        <div className="tw-text-xs tw-text-gray-500">({minutes} menit)</div>
      </div>
    );
  };

  const formatBoolean = (value: boolean, label: string, positiveColor = 'green', negativeColor = 'red') => {
    return (
      <div className="tw-text-center">
        <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium ${
          value 
            ? `tw-bg-${positiveColor}-100 tw-text-${positiveColor}-800` 
            : `tw-bg-${negativeColor}-100 tw-text-${negativeColor}-800`
        }`}>
          {value ? `✓ ${label}` : `✗ Tidak ${label}`}
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

    const config = statusConfig[value] || statusConfig['need_approve'];
    
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
        <div className="tw-w-8 tw-h-8 tw-bg-gradient-to-r tw-from-purple-500 tw-to-indigo-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold">
          {value ? value.charAt(0).toUpperCase() : 'U'}
        </div>
        <span className="tw-font-medium tw-text-gray-700">{value || 'Unknown'}</span>
      </div>
    );
  };

  const formatQuestionQty = (value: string | number) => {
    return (
      <div className="tw-text-center">
        <div className="tw-text-lg tw-font-bold tw-text-indigo-600">
          {value || '0'}
        </div>
        <div className="tw-text-xs tw-text-gray-500">soal</div>
      </div>
    );
  };

  const formatDateTime = (value: string) => {
    if (!value) {
      return (
        <div className="tw-text-center">
          <span className="tw-text-gray-400 tw-italic tw-flex tw-items-center tw-justify-center tw-gap-1">
            <FaCalendar size={12} />
            Belum ditentukan
          </span>
        </div>
      );
    }
    
    const date = new Date(value);
    return (
      <div className="tw-text-center">
        <div className="tw-font-semibold tw-text-gray-800 tw-flex tw-items-center tw-justify-center tw-gap-1">
          <FaCalendar size={12} />
          {date.toLocaleDateString('id-ID')}
        </div>
        <div className="tw-text-xs tw-text-gray-500 tw-flex tw-items-center tw-justify-center tw-gap-1">
          <FaClock size={10} />
          {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  };

  // Student-specific formatters
  const formatStudentStatus = (value: any, row: StudentExamSchedule) => {
    const hasCompleted = row.has_completed || false;
    const accessType = row.access_type;
    
    if (hasCompleted) {
      return (
        <div className="tw-text-center">
          <span className="tw-px-3 tw-py-2 tw-rounded-full tw-text-xs tw-font-medium tw-bg-green-100 tw-text-green-800 tw-flex tw-items-center tw-justify-center tw-gap-2">
            <FaCheck size={12} />
            Selesai
          </span>
        </div>
      );
    } else if (accessType === 'free' || accessType === 'entitled') {
      return (
        <div className="tw-text-center">
          <span className="tw-px-3 tw-py-2 tw-rounded-full tw-text-xs tw-font-medium tw-bg-blue-100 tw-text-blue-800 tw-flex tw-items-center tw-justify-center tw-gap-2">
            <FaPlay size={12} />
            Tersedia
          </span>
        </div>
      );
    } else {
      return (
        <div className="tw-text-center">
          <span className="tw-px-3 tw-py-2 tw-rounded-full tw-text-xs tw-font-medium tw-bg-gray-100 tw-text-gray-600">
            Tidak Tersedia
          </span>
        </div>
      );
    }
  };

  const formatStudentScore = (value: any, row: StudentExamSchedule) => {
    if (!row.has_completed || !row.total_score) {
      return '-';
    }
    
    return (
      <div className="tw-text-center">
        <div className="tw-text-lg tw-font-bold tw-text-purple-600">
          {row.total_score}
        </div>
        <div className="tw-text-xs tw-text-gray-500">
          {row.total_correct || 0}/{row.total_questions || 0} benar
        </div>
      </div>
    );
  };

  const formatAccessType = (value: string) => {
    const typeConfig = {
      'free': { 
        color: 'tw-bg-green-100 tw-text-green-800', 
        icon: <FaGift size={12} />,
        label: 'Gratis'
      },
      'entitled': { 
        color: 'tw-bg-blue-100 tw-text-blue-800', 
        icon: <FaCheck size={12} />,
        label: 'Berlangganan'
      },
      'no_access': { 
        color: 'tw-bg-gray-100 tw-text-gray-600', 
        icon: <FaTimes size={12} />,
        label: 'Tidak Akses'
      }
    };

    const config = typeConfig[value] || typeConfig['no_access'];
    
    return (
      <div className="tw-text-center">
        <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-flex tw-items-center tw-justify-center tw-gap-2 ${config.color}`}>
          {config.icon}
          {config.label}
        </span>
      </div>
    );
  };

  // Permission checks for admin/teacher
  const canUserManageExamSchedule = (row: any) => {
    return currentUserId && (
      userRole === 'admin' ||
      (row.created_by && (parseInt(row.created_by.toString()) === currentUserId || row.created_by.toString() === currentUserId.toString()))
    );
  };

  const canApproveExamSchedule = (row: any) => {
    return userRole === 'admin';
  };

  const canGoLive = (row: any) => {
    return userRole === 'admin' && 
           row.approval_status === 'approved' && 
           !row.is_deleted &&
           !row.is_live;
  };

  // Handler functions for admin/teacher
  const handleScheduleSave = (scheduleData: any) => {
    console.log('Schedule saved:', scheduleData);
    refreshFunction?.();
  };

  const handleExamSave = (examData: any) => {
    console.log('Exam saved:', examData);
  };

  const handleApprovalSave = () => {
    setShowApprovalModal(false);
    setSelectedExamSchedule(null);
    refreshFunction?.();
  };

  const handleGoLiveSave = () => {
    setShowGoLiveModal(false);
    setSelectedExamSchedule(null);
    refreshFunction?.();
  };

  const handleDetail = (row: any) => {
    console.log('View detail exam schedule:', row);
    window.open(`/panel/exam/exam-schedules/${row.id}`, '_blank');
  };

  const handleEdit = (row: any) => {
    console.log('Edit exam schedule:', row);
    window.location.href = `/panel/exam/exam-schedules/edit/${row.id}`;
  };

  const handleApprove = (row: any) => {
    setSelectedExamSchedule(row);
    setShowApprovalModal(true);
  };

  const handleGoLive = (row: any) => {
    setSelectedExamSchedule({
      ...row,
      isfree: row.isfree
    });
    setShowGoLiveModal(true);
  };

  const handleDelete = async (row: any) => {
    const reason = window.prompt(`Apakah Anda yakin ingin menghapus jadwal ujian "${row.schedule_name}"?\n\nMasukkan alasan penghapusan (opsional):`);
    
    if (reason !== null) {
      try {
        const response = await fetch(`/api/exam-schedules/${row.id}`, {
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
          alert('Jadwal ujian berhasil dihapus');
          refreshFunction?.();
        } else {
          const error = await response.json();
          alert('Gagal menghapus jadwal ujian: ' + (error.message || 'Terjadi kesalahan'));
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Gagal menghapus jadwal ujian: Terjadi kesalahan jaringan');
      }
    }
  };

  const handleRestore = async (row: any) => {
    if (window.confirm(`Apakah Anda yakin ingin mengembalikan jadwal ujian "${row.schedule_name}"?`)) {
      try {
        const response = await fetch(`/api/exam-schedules/restore/${row.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          alert('Jadwal ujian berhasil dikembalikan');
          refreshFunction?.();
        } else {
          const error = await response.json();
          alert('Gagal mengembalikan jadwal ujian: ' + (error.message || 'Terjadi kesalahan'));
        }
      } catch (error) {
        console.error('Restore error:', error);
        alert('Gagal mengembalikan jadwal ujian: Terjadi kesalahan jaringan');
      }
    }
  };

  // Student-specific handlers
  const handleStartExam = (row: StudentExamSchedule) => {
    setSelectedScheduleId(row.id);
    setSelectedScheduleName(row.schedule_name);
    setShowExamStartModal(true);
  };

  const handleViewScore = (row: StudentExamSchedule) => {
    setSelectedScheduleId(row.id);
    setSelectedScheduleName(row.schedule_name);
    setShowScoreModal(true);
  };

  // Dynamic action buttons based on user role and schedule status
  const getActionButtons = (row: any, index: number): ActionColumnButton[] => {
    const buttons: ActionColumnButton[] = [];

    if (isStudent) {
      // Student actions - using StudentExamSchedule interface
      const studentRow = row as StudentExamSchedule;
      const hasCompleted = studentRow.has_completed || false;
      const canAccess = studentRow.access_type === 'free' || studentRow.access_type === 'entitled';

      if (hasCompleted) {
        // Show score button
        buttons.push({
          label: 'Lihat Hasil',
          icon: React.createElement(FaEye),
          variant: 'outline-success',
          size: 'sm',
          onClick: () => handleViewScore(studentRow)
        });
      } else if (canAccess) {
        // Start exam button
        buttons.push({
          label: 'Mulai Ujian',
          icon: React.createElement(FaPlay),
          variant: 'outline-primary',
          size: 'sm',
          onClick: () => handleStartExam(studentRow)
        });
      }
    } else {
      // Admin/Teacher actions - using original ExamSchedule interface
      buttons.push({
        label: 'Detail',
        icon: React.createElement(FaEye),
        variant: 'outline-info',
        size: 'sm',
        onClick: () => handleDetail(row)
      });

      if (canGoLive(row)) {
        const isFreeExam = row.isfree === true;
        buttons.push({
          label: isFreeExam ? 'Go Live (Free)' : 'Go Live',
          icon: React.createElement(isFreeExam ? FaGift : FaRocket),
          variant: isFreeExam ? 'outline-success' : 'outline-success',
          size: 'sm',
          onClick: () => handleGoLive(row)
        });
      }

      if ((row.approval_status === 'need_approve') && canApproveExamSchedule(row)) {
        buttons.push({
          label: 'Setujui',
          icon: React.createElement(FaCheck),
          variant: 'outline-primary',
          size: 'sm',
          onClick: () => handleApprove(row)
        });
      }

      if (canUserManageExamSchedule(row) && !row.is_deleted) {
        const canEdit = userRole === 'admin' || 
                       (userRole === 'teacher' && row.created_by === currentUserId?.toString() && row.approval_status === 'need_approve');
        
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

      if (canUserManageExamSchedule(row) && !row.is_deleted) {
        buttons.push({
          label: 'Delete',
          icon: React.createElement(FaTrash),
          variant: 'outline-danger',
          size: 'sm',
          onClick: () => handleDelete(row)
        });
      }

      if (canUserManageExamSchedule(row) && row.is_deleted) {
        buttons.push({
          label: 'Restore',
          icon: React.createElement(FaUndo),
          variant: 'outline-success',
          size: 'sm',
          onClick: () => handleRestore(row)
        });
      }
    }

    return buttons;
  };

  // Base columns for both roles
  const baseColumns: ColumnConfig[] = [
    {
      key: 'id',
      label: 'ID',
      type: 'number',
      width: 80,
      colGroup: 'basic'
    },
    {
      key: 'schedule_name',
      label: 'Nama Jadwal',
      type: 'string',
      width: 220,
      colGroup: 'basic',
      formatter: (value, row) => (
        <div className={`tw-font-semibold tw-leading-tight ${
          isStudent ? 'tw-text-gray-800' : (row.is_deleted ? 'tw-text-gray-400 tw-line-through' : 'tw-text-gray-800')
        }`}>
          {value || row.name || '-'}
          {!isStudent && row.is_live && (
            <span className="tw-ml-2 tw-inline-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-bg-blue-100 tw-text-blue-800 tw-text-xs tw-rounded-full">
              <FaRocket size={10} />
              LIVE
            </span>
          )}
          {row.isfree && (
            <span className="tw-ml-2 tw-inline-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-bg-emerald-100 tw-text-emerald-800 tw-text-xs tw-rounded-full">
              <FaGift size={10} />
              GRATIS
            </span>
          )}
        </div>
      )
    },
    {
      key: 'description',
      label: 'Deskripsi',
      type: 'string',
      width: 280,
      colGroup: 'basic',
      formatter: (value, row) => (
        <div className={`tw-text-gray-600 tw-text-sm tw-line-clamp-3 tw-leading-relaxed ${
          !isStudent && row.is_deleted ? 'tw-text-gray-400' : ''
        }`} title={value}>
          {value || '-'}
        </div>
      )
    },
    {
      key: 'exam_name',
      label: 'Nama Ujian',
      type: 'string',
      width: 320,
      colGroup: 'exam_info',
      formatter: formatExamNames
    },
    {
      key: 'exam_duration',
      label: 'Durasi',
      type: 'string',
      width: 120,
      colGroup: 'exam_info',
      formatter: formatDuration
    },
    {
      key: 'exam_type',
      label: 'Tipe Ujian',
      type: 'string',
      width: 160,
      colGroup: 'exam_info',
      formatter: (value) => (
        <span className="tw-bg-gradient-to-r tw-from-purple-100 tw-to-indigo-100 tw-text-purple-800 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-medium tw-shadow-sm">
          {value || 'Unknown'}
        </span>
      )
    },
    {
      key: 'question_qty',
      label: 'Jumlah Soal',
      type: 'string',
      width: 120,
      colGroup: 'exam_info',
      formatter: formatQuestionQty
    },
    {
      key: 'start_time',
      label: 'Waktu Mulai',
      type: 'datetime',
      width: 180,
      colGroup: 'schedule',
      formatter: formatDateTime
    },
    {
      key: 'end_time',
      label: 'Waktu Selesai',
      type: 'datetime',
      width: 180,
      colGroup: 'schedule',
      formatter: formatDateTime
    }
  ];

  // Additional columns for admin/teacher
  const adminTeacherColumns: ColumnConfig[] = [
    {
      key: 'approval_status',
      label: 'Status Persetujuan',
      type: 'string',
      width: 170,
      colGroup: 'approval',
      formatter: formatApprovalStatus
    },
    {
      key: 'is_live',
      label: 'Status Go Live',
      type: 'string',
      width: 130,
      colGroup: 'approval',
      formatter: formatGoLiveStatus
    },
    {
      key: 'isfree',
      label: 'Status Free',
      type: 'boolean',
      width: 130,
      colGroup: 'status',
      formatter: (value) => formatBoolean(value, 'Free', 'emerald', 'rose')
    },
    {
      key: 'is_valid',
      label: 'Status Valid',
      type: 'boolean',
      width: 130,
      colGroup: 'status',
      formatter: (value) => formatBoolean(value, 'Valid', 'blue', 'gray')
    },
    {
      key: 'is_deleted',
      label: 'Status Hapus',
      type: 'boolean',
      width: 130,
      colGroup: 'status',
      formatter: (value) => formatBoolean(value, 'Dihapus', 'red', 'green')
    },
    {
      key: 'schedule_creator',
      label: 'Pembuat Jadwal',
      type: 'string',
      width: 180,
      colGroup: 'creator',
      formatter: formatCreator
    },
    {
      key: 'exam_creator',
      label: 'Pembuat Ujian',
      type: 'string',
      width: 180,
      colGroup: 'creator',
      formatter: formatCreator
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
    }
  ];

  // Additional columns for student
  const studentColumns: ColumnConfig[] = [
    {
      key: 'has_completed',
      label: 'Status',
      type: 'string',
      width: 150,
      colGroup: 'student',
      formatter: formatStudentStatus
    },
    {
      key: 'total_score',
      label: 'Skor',
      type: 'string',
      width: 120,
      colGroup: 'student',
      formatter: formatStudentScore
    },
    {
      key: 'access_type',
      label: 'Akses',
      type: 'string',
      width: 130,
      colGroup: 'student',
      formatter: formatAccessType
    }
  ];

  // Combine columns based on role
  const columns = isStudent 
    ? [...baseColumns, ...studentColumns]
    : [...baseColumns, ...adminTeacherColumns];

  // Different column groups based on role
  const colGroups = isStudent ? [
    {
      key: 'basic',
      label: 'Informasi Dasar',
      columns: ['id', 'schedule_name', 'description']
    },
    {
      key: 'exam_info',
      label: 'Informasi Ujian',
      columns: ['exam_name', 'exam_duration', 'exam_type', 'question_qty']
    },
    {
      key: 'schedule',
      label: 'Jadwal Waktu',
      columns: ['start_time', 'end_time']
    },
    {
      key: 'student',
      label: 'Status Student',
      columns: ['has_completed', 'total_score', 'access_type']
    }
  ] : [
    {
      key: 'basic',
      label: 'Informasi Dasar',
      columns: ['id', 'schedule_name', 'description']
    },
    {
      key: 'exam_info',
      label: 'Informasi Ujian',
      columns: ['exam_name', 'exam_duration', 'exam_type', 'question_qty']
    },
    {
      key: 'approval',
      label: 'Sistem Persetujuan',
      columns: ['approval_status', 'is_live', 'approver_name', 'approve_date', 'rejection_reason']
    },
    {
      key: 'status',
      label: 'Status',
      columns: ['isfree', 'is_valid', 'is_deleted']
    },
    {
      key: 'schedule',
      label: 'Jadwal Waktu',
      columns: ['start_time', 'end_time']
    },
    {
      key: 'creator',
      label: 'Pembuat',
      columns: ['schedule_creator', 'exam_creator']
    }
  ];

  // Different default visible columns based on role
  const defaultVisibleColumns = isStudent ? [
    'schedule_name', 
    'description', 
    'exam_name', 
    'exam_duration', 
    'exam_type',
    'start_time',
    'end_time',
    'has_completed',
    'total_score',
    'access_type'
  ] : [
    'schedule_name', 
    'description', 
    'exam_name', 
    'exam_duration', 
    'exam_type', 
    'approval_status',
    'is_live',
    'isfree', 
    'is_valid',
    'start_time',
    'schedule_creator'
  ];

  // Different action buttons based on role
  const actionButtons = isStudent ? [] : [
    {
      label: 'Buat Jadwal Baru',
      icon: React.createElement(FaPlus),
      variant: 'primary',
      onClick: () => {
        if (userRole !== 'teacher' && userRole !== 'admin') {
          alert('Hanya guru dan admin yang dapat membuat jadwal ujian');
          return;
        }
        console.log('Create new exam schedule');
        setShowScheduleModal(true);
      }
    },
    {
      label: 'Buat Ujian',
      icon: React.createElement(BookOpen),
      variant: 'success',
      onClick: () => {
        console.log('Create new exam');
        setShowExamModal(true);
      }
    }
  ];

  // Different filters based on role
  const filters = isStudent ? [
    {
      key: 'search',
      type: 'text',
      label: 'Pencarian Global'
    },
    {
      key: 'schedule_name',
      type: 'text',
      label: 'Nama Jadwal'
    },
    {
      key: 'exam_type',
      type: 'text',
      label: 'Tipe Ujian'
    },
    {
      key: 'start_time',
      type: 'date',
      label: 'Tanggal Mulai (Dari)'
    },
    {
      key: 'end_time',
      type: 'date',
      label: 'Tanggal Selesai (Sampai)'
    }
  ] : [
    {
      key: 'schedule_name',
      type: 'text',
      label: 'Nama Jadwal'
    },
    {
      key: 'exam_type',
      type: 'select',
      label: 'Tipe Ujian',
      apiEndpoint: '/exam-schedules/exam-types',
      debounceMs: 300
    },
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
      key: 'isfree',
      type: 'boolean',
      label: 'Status Free'
    },
    {
      key: 'is_valid',
      type: 'boolean',
      label: 'Status Valid'
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
    },
    {
      key: 'schedule_creator',
      type: 'select',
      label: 'Pembuat Jadwal',
      apiEndpoint: '/exam-schedules/schedule-creators',
      debounceMs: 300
    },
    {
      key: 'exam_creator',
      type: 'select',
      label: 'Pembuat Ujian',
      apiEndpoint: '/exam-schedules/exam-creators',
      debounceMs: 300
    },
    {
      key: 'start_time',
      type: 'date',
      label: 'Tanggal Mulai (Dari)'
    },
    {
      key: 'end_time',
      type: 'date',
      label: 'Tanggal Selesai (Sampai)'
    }
  ];

  // Report config based on role
  const reportConfig: ReportConfig = {
    title: isStudent ? 'Jadwal Ujian Anda' : 'Jadwal Ujian dengan Sistem Persetujuan',
    columns,
    colGroups,
    filters,
    defaultSort: [
      { key: 'id', direction: 'desc' }
    ],
    defaultVisibleColumns,
    defaultFreezeColumn: 'schedule_name',
    showIcon: true,
    showRowNumber: true,
    pageSize: 10,
    rowHeight: 80,
    exportConfig: {
      enabled: true,
      filename: isStudent ? 'my_exam_schedules' : 'exam_schedules_with_approval',
      formats: ['excel', 'csv', 'pdf']
    },
    actionColumn: {
      enabled: true,
      label: 'Actions',
      width: isStudent ? 200 : 350,
      sticky: false,
      buttons: getActionButtons
    },
    actionButtons
  };

  // Choose API endpoint based on role
  const apiEndpoint = isStudent ? '/exam-schedules/student' : '/exam-schedules/all';

  return (
    <MainLayout>
      <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-purple-50 tw-via-white tw-to-purple-50">
        <ReportLayout
          config={reportConfig}
          apiEndpoint={apiEndpoint}
          fetchOnMount={true}
          searchMode="server"
          onRefreshFunctionReady={setRefreshFunction}
        />
      </div>

      {/* Modals for admin/teacher */}
      {!isStudent && (
        <>
          <AddExamScheduleModal
            isOpen={showScheduleModal}
            onClose={() => setShowScheduleModal(false)}
            onSave={handleScheduleSave}
          />

          <CreateExamModal
            show={showExamModal}
            onClose={() => setShowExamModal(false)}
            onAddExam={handleExamSave}
          />

          {selectedExamSchedule && (
            <ExamScheduleApprovalModal
              show={showApprovalModal}
              onClose={() => {
                setShowApprovalModal(false);
                setSelectedExamSchedule(null);
              }}
              examScheduleData={selectedExamSchedule}
              onSave={handleApprovalSave}
            />
          )}

          <ExamScheduleGoLiveModal
            isOpen={showGoLiveModal}
            onClose={() => {
              setShowGoLiveModal(false);
              setSelectedExamSchedule(null);
            }}
            onSave={handleGoLiveSave}
            examScheduleData={selectedExamSchedule}
          />
        </>
      )}

      {/* Modals for students */}
      {isStudent && selectedScheduleId && (
        <>
          <ExamModal
            show={showExamStartModal}
            onClose={() => {
              setShowExamStartModal(false);
              setSelectedScheduleId(null);
              setSelectedScheduleName('');
            }}
            scheduleId={selectedScheduleId}
          />

          <ExamScoreModal
            show={showScoreModal}
            onClose={() => {
              setShowScoreModal(false);
              setSelectedScheduleId(null);
              setSelectedScheduleName('');
            }}
            scheduleId={selectedScheduleId}
            scheduleName={selectedScheduleName}
          />
        </>
      )}
    </MainLayout>
  );
};

export default ExamSchedulesPage;