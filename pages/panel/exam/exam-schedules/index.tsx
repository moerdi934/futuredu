// pages/panel/exam/exam-schedules/index.tsx - Updated to pass isfree to GoLiveModal
import React, { useState } from 'react';
import { FaPlus, FaEye, FaEdit, FaTrash, FaCalendar, FaClock, FaCheck, FaTimes, FaRocket, FaUndo, FaGift } from 'react-icons/fa';
import { BookOpen } from 'lucide-react';
import MainLayout from '../../../../components/layout/DashboardLayout';
import ReportLayout from '../../../../components/report/ReportLayout';
import { ReportConfig, ColumnConfig, ActionColumnButton } from '../../../../types/report';
import { useAuth } from '../../../../context/AuthContext';
import AddExamScheduleModal from './AddExamScheduleModal';
import CreateExamModal from './AddExamModal';
import ExamScheduleApprovalModal from './ApprovalModal';
import ExamScheduleGoLiveModal from './GoLiveModal';

const ExamSchedulesPage: React.FC = () => {
  const { id: currentUserId, role: userRole } = useAuth();
  
  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [selectedExamSchedule, setSelectedExamSchedule] = useState(null);
  
  // State untuk refresh function
  const [refreshFunction, setRefreshFunction] = useState<(() => void) | null>(null);

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

  const formatDuration = (value: string) => {
    if (!value) return '-';
    const minutes = parseInt(value);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return (
      <div className="tw-text-center">
        <div className="tw-font-semibold tw-text-purple-700 tw-flex tw-items-center tw-justify-center tw-gap-1">
          <FaClock size={12} />
          {hours > 0 ? `${hours}j ${remainingMinutes}m` : `${remainingMinutes}m`}
        </div>
        <div className="tw-text-xs tw-text-gray-500">({value} menit)</div>
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

  const formatQuestionQty = (value: string) => {
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

  // Permission checks
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

  // Handler functions
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
    // Pass the complete row data including isfree status
    setSelectedExamSchedule({
      ...row,
      isfree: row.isfree // Ensure isfree is passed
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

  // Dynamic action buttons based on user role and schedule status
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

    // Go Live button - only for admin on approved schedules that are not live yet
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

    // Approval button - only for admin on pending schedules
    if ((row.approval_status === 'need_approve') && canApproveExamSchedule(row)) {
      buttons.push({
        label: 'Setujui',
        icon: React.createElement(FaCheck),
        variant: 'outline-primary',
        size: 'sm',
        onClick: () => handleApprove(row)
      });
    }

    // Edit button - for creators on pending schedules or admin
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

    // Delete button
    if (canUserManageExamSchedule(row) && !row.is_deleted) {
      buttons.push({
        label: 'Delete',
        icon: React.createElement(FaTrash),
        variant: 'outline-danger',
        size: 'sm',
        onClick: () => handleDelete(row)
      });
    }

    // Restore button
    if (canUserManageExamSchedule(row) && row.is_deleted) {
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

  // Updated columns with isfree column
  const columns: ColumnConfig[] = [
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
        <div className={`tw-font-semibold tw-leading-tight ${row.is_deleted ? 'tw-text-gray-400 tw-line-through' : 'tw-text-gray-800'}`}>
          {value || '-'}
          {row.is_live && (
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
        <div className={`tw-text-gray-600 tw-text-sm tw-line-clamp-3 tw-leading-relaxed ${row.is_deleted ? 'tw-text-gray-400' : ''}`} title={value}>
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

  // Updated report config
  const reportConfig: ReportConfig = {
    title: 'Jadwal Ujian dengan Sistem Persetujuan',
    columns,
    colGroups: [
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
    ],
    filters: [
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
    ],
    defaultSort: [
      { key: 'id', direction: 'desc' }
    ],
    defaultVisibleColumns: [
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
    ],
    defaultFreezeColumn: 'schedule_name',
    showIcon: true,
    showRowNumber: true,
    pageSize: 10,
    rowHeight: 80,
    exportConfig: {
      enabled: true,
      filename: 'exam_schedules_with_approval',
      formats: ['excel', 'csv', 'pdf']
    },
    actionColumn: {
      enabled: true,
      label: 'Actions',
      width: 350,
      sticky: false,
      buttons: getActionButtons
    },
    actionButtons: [
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
    ]
  };

  // Custom ReportLayout with refresh function extraction
  const ReportLayoutWithRefresh: React.FC = () => {
    return (
      <ReportLayout
        config={reportConfig}
        apiEndpoint="/exam-schedules/all"
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

      {/* Modal Buat Jadwal Ujian */}
      <AddExamScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSave={handleScheduleSave}
      />

      {/* Modal Buat Ujian */}
      <CreateExamModal
        show={showExamModal}
        onClose={() => setShowExamModal(false)}
        onAddExam={handleExamSave}
      />

      {/* Modal Approval Jadwal Ujian */}
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

      {/* Modal Go Live Jadwal Ujian - Updated to pass isfree */}
      <ExamScheduleGoLiveModal
        isOpen={showGoLiveModal}
        onClose={() => {
          setShowGoLiveModal(false);
          setSelectedExamSchedule(null);
        }}
        onSave={handleGoLiveSave}
        examScheduleData={selectedExamSchedule}
      />
    </MainLayout>
  );
};

export default ExamSchedulesPage;