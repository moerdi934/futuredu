// pages/panel/courses/classes-page/index.tsx - Fixed Version Without Page Reload

import React, { useState } from 'react';
import { FaPlus, FaEye, FaEdit, FaTrash, FaCalendar, FaClock, FaUsers, FaPlay, FaStop, FaCheckCircle, FaUndo, FaInfo, FaCheck, FaTimes, FaVideo, FaMapMarkerAlt, FaQrcode } from 'react-icons/fa';
import { BookOpen, GraduationCap, Video, MapPin, UserCheck, Clock } from 'lucide-react';
import MainLayout from '../../../../components/layout/DashboardLayout';
import ReportLayout from '../../../../components/report/ReportLayout';
import { ReportConfig, ColumnConfig, ActionColumnButton } from '../../../../types/report';
import { useAuth } from '../../../../context/AuthContext';
import AddClassModal from './AddClassModal';
import EditClassModal from './EditClassModal';
import DetailClassModal from './DetailClassModal';
import StartFinishClassModal from './StartFinishClassModal';
import ApprovalModal from './ApprovalModal';
import StudentAttendanceModal from './StudentAttendanceModal';

const ClassesPage: React.FC = () => {
  const { id: currentUserId, role: userRole } = useAuth();
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStartFinishModal, setShowStartFinishModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  
  // IMPORTANT: State untuk menyimpan refresh function dari useReport
  const [refreshFunction, setRefreshFunction] = useState<(() => void) | null>(null);

  // Custom formatters untuk kolom-kolom tertentu
  const formatStudentsDisplay = (value: string, row: any) => {
    if (!value || value === '-') {
      return (
        <div className="tw-text-center tw-text-gray-400 tw-italic">
          <FaUsers size={14} className="tw-inline tw-mr-1" />
          Belum ada siswa
        </div>
      );
    }

    const studentCount = row.student_list_ids?.length || 0;
    return (
      <div className="tw-space-y-1">
        <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-medium tw-text-gray-700">
          <FaUsers size={12} className="tw-text-blue-600" />
          <span>{studentCount} siswa</span>
        </div>
        <div className="tw-text-xs tw-text-gray-500 tw-line-clamp-2" title={value}>
          {value}
        </div>
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

  const formatStatus = (value: string) => {
    const statusConfig = {
      'Not Start': { 
        color: 'tw-bg-gray-100 tw-text-gray-800', 
        icon: <FaClock size={12} />,
        label: 'Belum Dimulai'
      },
      'Started': { 
        color: 'tw-bg-green-100 tw-text-green-800', 
        icon: <FaPlay size={12} />,
        label: 'Sedang Berlangsung'
      },
      'Finished': { 
        color: 'tw-bg-blue-100 tw-text-blue-800', 
        icon: <FaCheckCircle size={12} />,
        label: 'Selesai'
      },
      'Deleted': { 
        color: 'tw-bg-red-100 tw-text-red-800', 
        icon: <FaTrash size={12} />,
        label: 'Telah Dihapus'
      },
      'Need Approve': { 
        color: 'tw-bg-yellow-100 tw-text-yellow-800', 
        icon: <Clock size={12} />,
        label: 'Menunggu Persetujuan'
      },
      'Rejected': { 
        color: 'tw-bg-red-100 tw-text-red-800', 
        icon: <FaTimes size={12} />,
        label: 'Ditolak'
      }
    };

    const config = statusConfig[value] || statusConfig['Not Start'];
    
    return (
      <div className="tw-text-center">
        <span className={`tw-px-3 tw-py-2 tw-rounded-full tw-text-xs tw-font-medium tw-flex tw-items-center tw-justify-center tw-gap-2 ${config.color}`}>
          {config.icon}
          {config.label}
        </span>
      </div>
    );
  };

  const formatClassMode = (value: string) => {
    const modeConfig = {
      'online': { 
        color: 'tw-bg-blue-100 tw-text-blue-800', 
        icon: <Video size={12} />,
        label: 'Online'
      },
      'offline': { 
        color: 'tw-bg-green-100 tw-text-green-800', 
        icon: <MapPin size={12} />,
        label: 'Offline'
      }
    };

    const config = modeConfig[value] || modeConfig['offline'];
    
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
        icon: <Clock size={12} />,
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

  // Check if current user can start/manage the class
  const canUserManageClass = (row: any) => {
    return currentUserId && (
      userRole === 'admin' ||
      (row.teacher_id && (parseInt(row.teacher_id.toString()) === currentUserId || row.teacher_id.toString() === currentUserId.toString())) ||
      (row.starter_user_id && (parseInt(row.starter_user_id.toString()) === currentUserId || row.starter_user_id.toString() === currentUserId.toString())) ||
      (row.create_user_id && (parseInt(row.create_user_id.toString()) === currentUserId || row.create_user_id.toString() === currentUserId.toString()))
    );
  };

  // Check if current user can approve class
  const canApproveClass = (row: any) => {
    if (userRole === 'admin') return true;
    if (userRole === 'teacher' && (!row.teacher_id || row.teacher_id === '' || row.teacher_id === null)) return true;
    return false;
  };

  // Check if user is student in this class
  const isStudentInClass = (row: any) => {
    return row.student_list_ids?.includes(currentUserId) || false;
  };

  // FIXED: Handler functions - removed window.location.reload(), use refresh function instead
  const handleAddSave = (classData: any) => {
    console.log('Class saved:', classData);
    // Call refresh function to update table data only
    refreshFunction?.();
  };

  const handleEditSave = (classData: any) => {
    console.log('Class updated:', classData);
    setEditingClass(null);
    // Call refresh function to update table data only
    refreshFunction?.();
  };

  const handleApprovalSave = () => {
    setShowApprovalModal(false);
    setSelectedClass(null);
    // Call refresh function to update table data only
    refreshFunction?.();
  };

  const handleDetail = (row: any) => {
    setSelectedClass(row);
    setShowDetailModal(true);
  };

  const handleEdit = (row: any) => {
    setEditingClass(row);
    setShowEditModal(true);
  };

  const handleApprove = (row: any) => {
    setSelectedClass(row);
    setShowApprovalModal(true);
  };

  // Updated handleStartFinish with correct data transformation
  const handleStartFinish = (row: any) => {
    // Transform data to match StartFinishClassModal interface with correct types
    const transformedData = {
      id: row.id,
      event_id: row.event_id,
      starter_user_id: row.starter_user_id,
      name: row.name,
      course_name: row.course_name,
      course_id: row.course_id,
      teacher_id: row.teacher_id,
      description: row.description,
      teacher_name: row.teacher_name,
      student_list_ids: row.student_list_ids || [],
      student_list_names: row.student_list_names || [],
      date: row.date,
      start_time: row.start_time,
      end_time: row.end_time,
      real_start_datetime: row.real_start_datetime,
      real_end_datetime: row.real_end_datetime,
      status: row.status,
      approval_status: row.approval_status,
      class_mode: row.class_mode,
      meeting_url: row.meeting_url
    };
    
    console.log('Transformed data for StartFinishClassModal:', transformedData);
    
    setSelectedClass(transformedData);
    setShowStartFinishModal(true);
  };

  const handleAttendance = (row: any) => {
    setSelectedClass(row);
    setShowAttendanceModal(true);
  };

  // FIXED: handleDelete - use refresh function instead of window.location.reload()
  const handleDelete = async (row: any) => {
    const reason = window.prompt(`Apakah Anda yakin ingin menghapus kelas "${row.name}"?\n\nMasukkan alasan penghapusan (opsional):`);
    
    if (reason !== null) { // User didn't cancel
      try {
        const response = await fetch(`/classes/${row.id}`, {
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
          alert('Kelas berhasil dihapus');
          // Call refresh function to update table data only
          refreshFunction?.();
        } else {
          const error = await response.json();
          alert('Gagal menghapus kelas: ' + (error.message || 'Terjadi kesalahan'));
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Gagal menghapus kelas: Terjadi kesalahan jaringan');
      }
    }
  };

  // FIXED: handleRestore - use refresh function instead of window.location.reload()
  const handleRestore = async (row: any) => {
    if (window.confirm(`Apakah Anda yakin ingin mengembalikan kelas "${row.name}"?`)) {
      try {
        const response = await fetch(`/classes/${row.id}/restore`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          alert('Kelas berhasil dikembalikan');
          // Call refresh function to update table data only
          refreshFunction?.();
        } else {
          const error = await response.json();
          alert('Gagal mengembalikan kelas: ' + (error.message || 'Terjadi kesalahan'));
        }
      } catch (error) {
        console.error('Restore error:', error);
        alert('Gagal mengembalikan kelas: Terjadi kesalahan jaringan');
      }
    }
  };

  // FIXED: handleStatusChange - use refresh function instead of window.location.reload()
  const handleStatusChange = () => {
    // Refresh data after status change - only refresh table data
    refreshFunction?.();
  };

  // Dynamic action buttons based on user role and class status
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

  // Student attendance button - show for Started and Finished classes
  if (userRole === 'student' && isStudentInClass(row) && (row.status === 'Started' || row.status === 'Finished')) {
    buttons.push({
      label: row.status === 'Started' ? 'Presensi' : 'Riwayat Presensi',
      icon: React.createElement(FaQrcode),
      variant: row.status === 'Started' ? 'outline-primary' : 'outline-info',
      size: 'sm',
      onClick: () => handleAttendance(row)
    });
  }

  // Approval button
  if ((row.approval_status === 'need_approve') && canApproveClass(row)) {
    buttons.push({
      label: 'Setujui',
      icon: React.createElement(FaCheck),
      variant: 'outline-success',
      size: 'sm',
      onClick: () => handleApprove(row)
    });
  }

  // Correct logic for start/manage/finish buttons based on real datetime
  if (canUserManageClass(row) && !row.is_deleted && row.approval_status === 'approved') {
    // Use the corrected status from database (based on real datetime fields)
    const currentStatus = row.status;
    
    if (currentStatus === 'Finished') {
      // Class is finished - only show review button
      buttons.push({
        label: 'Review',
        icon: React.createElement(FaEye),
        variant: 'outline-info',
        size: 'sm',
        onClick: () => handleStartFinish(row)
      });
    } else if (currentStatus === 'Started') {
      // Class is started but not finished - show finish button
      buttons.push({
        label: 'Selesaikan',
        icon: React.createElement(FaStop),
        variant: 'outline-warning',
        size: 'sm',
        onClick: () => handleStartFinish(row)
      });
    } else if (currentStatus === 'Not Start') {
      // Class not started - show start button
      buttons.push({
        label: 'Mulai',
        icon: React.createElement(FaPlay),
        variant: 'outline-success',
        size: 'sm',
        onClick: () => handleStartFinish(row)
      });
    }
  }

  // Edit button
  if (canUserManageClass(row) && !row.is_deleted) {
    const canEdit = userRole === 'admin' || 
                   userRole === 'teacher' || 
                   (userRole === 'student' && row.create_user_id === currentUserId && row.approval_status === 'need_approve');
    
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
  if (canUserManageClass(row) && !row.is_deleted) {
    buttons.push({
      label: 'Delete',
      icon: React.createElement(FaTrash),
      variant: 'outline-danger',
      size: 'sm',
      onClick: () => handleDelete(row)
    });
  }

  // Restore button
  if (canUserManageClass(row) && row.is_deleted) {
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

  // Definisi kolom-kolom lengkap berdasarkan response API
  const columns: ColumnConfig[] = [
    {
      key: 'id',
      label: 'ID',
      type: 'number',
      width: 80,
      colGroup: 'basic'
    },
    {
      key: 'name',
      label: 'Nama Kelas',
      type: 'string',
      width: 220,
      colGroup: 'basic',
      formatter: (value, row) => (
        <div className={`tw-font-semibold tw-leading-tight ${row.is_deleted ? 'tw-text-gray-400 tw-line-through' : 'tw-text-gray-800'}`}>
          {value || '-'}
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
        <div className={`tw-text-sm tw-line-clamp-3 tw-leading-relaxed ${row.is_deleted ? 'tw-text-gray-400' : 'tw-text-gray-600'}`} title={value}>
          {value || '-'}
        </div>
      )
    },
    {
      key: 'course_name',
      label: 'Mata Pelajaran',
      type: 'string',
      width: 200,
      colGroup: 'course_info',
      formatter: (value, row) => (
        <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-medium tw-shadow-sm ${
          row.is_deleted 
            ? 'tw-bg-gray-100 tw-text-gray-500' 
            : 'tw-bg-gradient-to-r tw-from-purple-100 tw-to-indigo-100 tw-text-purple-800'
        }`}>
          {value || 'Unknown'}
        </span>
      )
    },
    {
      key: 'course_id',
      label: 'ID Mata Pelajaran',
      type: 'number',
      width: 120,
      colGroup: 'course_info'
    },
    {
      key: 'teacher_name',
      label: 'Guru/Pengajar',
      type: 'string',
      width: 200,
      colGroup: 'course_info',
      formatter: (value, row) => (
        <div className="tw-flex tw-items-center tw-gap-2">
          <div className={`tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold ${
            row.is_deleted 
              ? 'tw-bg-gray-400' 
              : 'tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-500'
          }`}>
            <GraduationCap size={14} />
          </div>
          <span className={`tw-font-medium ${row.is_deleted ? 'tw-text-gray-400' : 'tw-text-gray-700'}`}>
            {value || 'Belum ditentukan'}
          </span>
        </div>
      )
    },
    {
      key: 'teacher_id',
      label: 'ID Guru',
      type: 'number',
      width: 100,
      colGroup: 'course_info'
    },
    {
      key: 'students_display',
      label: 'Daftar Siswa',
      type: 'string',
      width: 300,
      colGroup: 'course_info',
      formatter: formatStudentsDisplay
    },
    {
      key: 'student_list_ids',
      label: 'ID Daftar Siswa',
      type: 'array',
      width: 150,
      colGroup: 'course_info',
      formatter: (value) => (
        <div className="tw-text-xs tw-text-gray-600">
          {Array.isArray(value) ? `[${value.join(', ')}]` : '-'}
        </div>
      )
    },
    {
      key: 'student_list_names',
      label: 'Nama Daftar Siswa',
      type: 'array',
      width: 250,
      colGroup: 'course_info',
      formatter: (value) => (
        <div className="tw-text-xs tw-text-gray-600 tw-max-h-16 tw-overflow-y-auto">
          {Array.isArray(value) ? value.join(', ') : '-'}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status Kelas',
      type: 'string',
      width: 150,
      colGroup: 'status',
      formatter: formatStatus
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
      key: 'class_mode',
      label: 'Mode Kelas',
      type: 'string',
      width: 120,
      colGroup: 'status',
      formatter: formatClassMode
    },
    {
      key: 'meeting_url',
      label: 'URL Meeting',
      type: 'string',
      width: 200,
      colGroup: 'status',
      formatter: (value, row) => {
        if (!value || row.class_mode !== 'online') return '-';
        return (
          <div className="tw-text-center">
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              className="tw-text-blue-600 tw-text-xs hover:tw-underline"
              title={value}
            >
              <Video className="tw-inline tw-mr-1" size={12} />
              Link Meeting
            </a>
          </div>
        );
      }
    },
    {
      key: 'is_started',
      label: 'Sudah Dimulai',
      type: 'boolean',
      width: 130,
      colGroup: 'status',
      formatter: formatBoolean
    },
    {
      key: 'is_deleted',
      label: 'Sudah Dihapus',
      type: 'boolean',
      width: 130,
      colGroup: 'status',
      formatter: formatBoolean
    },
    {
      key: 'date',
      label: 'Tanggal',
      type: 'string',
      width: 150,
      colGroup: 'schedule',
      formatter: (value, row) => (
        <div className={`tw-text-center tw-font-medium ${row.is_deleted ? 'tw-text-gray-400' : 'tw-text-gray-700'}`}>
          {value || '-'}
        </div>
      )
    },
    {
      key: 'start_time',
      label: 'Waktu Mulai',
      type: 'string',
      width: 100,
      colGroup: 'schedule',
      formatter: (value, row) => (
        <div className={`tw-text-center tw-font-medium ${row.is_deleted ? 'tw-text-gray-400' : 'tw-text-blue-600'}`}>
          {value || '-'}
        </div>
      )
    },
    {
      key: 'end_time',
      label: 'Waktu Selesai',
      type: 'string',
      width: 100,
      colGroup: 'schedule',
      formatter: (value, row) => (
        <div className={`tw-text-center tw-font-medium ${row.is_deleted ? 'tw-text-gray-400' : 'tw-text-blue-600'}`}>
          {value || '-'}
        </div>
      )
    },
    {
      key: 'real_start_datetime',
      label: 'Waktu Mulai Lengkap',
      type: 'datetime',
      width: 180,
      colGroup: 'schedule',
      formatter: formatDateTime
    },
    {
      key: 'real_end_datetime',
      label: 'Waktu Selesai Lengkap',
      type: 'datetime',
      width: 180,
      colGroup: 'schedule',
      formatter: formatDateTime
    },
    {
      key: 'event_id',
      label: 'Event ID',
      type: 'number',
      width: 100,
      colGroup: 'event_info'
    },
    {
      key: 'starter_user_id',
      label: 'Starter User ID',
      type: 'number',
      width: 130,
      colGroup: 'event_info'
    },
    {
      key: 'creator',
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
      key: 'delete_reason',
      label: 'Alasan Dihapus',
      type: 'string',
      width: 200,
      colGroup: 'delete_info',
      formatter: formatDeleteInfo
    }
  ];

  // Updated filters with new options
  const filters = [
    {
      key: 'name',
      type: 'text',
      label: 'Nama Kelas'
    },
    {
      key: 'courseId',
      type: 'select',
      label: 'Mata Pelajaran',
      apiEndpoint: '/courses/options',
      debounceMs: 300
    },
    {
      key: 'teacherId',
      type: 'select',
      label: 'Guru/Pengajar',
      apiEndpoint: '/users/teachers',
      debounceMs: 300
    },
    {
      key: 'studentId',
      type: 'select',
      label: 'Siswa',
      apiEndpoint: '/users/students',
      debounceMs: 300
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status Kelas',
      options: [
        { value: 'All', label: 'Semua Status' },
        { value: 'Not Start', label: 'Belum Dimulai' },
        { value: 'Started', label: 'Sedang Berlangsung' },
        { value: 'Finished', label: 'Selesai' },
        { value: 'Need Approve', label: 'Menunggu Persetujuan' },
        { value: 'Rejected', label: 'Ditolak' },
        { value: 'Deleted', label: 'Telah Dihapus' }
      ]
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
      key: 'startDate',
      type: 'date',
      label: 'Tanggal Mulai (Dari)'
    },
    {
      key: 'endDate',
      type: 'date',
      label: 'Tanggal Selesai (Sampai)'
    },
    {
      key: 'searchDate',
      type: 'date',
      label: 'Tanggal Spesifik'
    }
  ];

  // Konfigurasi report dengan sistem batch filtering
  const reportConfig: ReportConfig = {
    title: 'Manajemen Kelas (Classes)',
    columns,
    colGroups: [
      {
        key: 'basic',
        label: 'Informasi Dasar',
        columns: ['id', 'name', 'description']
      },
      {
        key: 'course_info',
        label: 'Informasi Kelas',
        columns: ['course_name', 'course_id', 'teacher_name', 'teacher_id', 'students_display', 'student_list_ids', 'student_list_names']
      },
      {
        key: 'status',
        label: 'Status',
        columns: ['status', 'approval_status', 'class_mode', 'meeting_url', 'is_started', 'is_deleted']
      },
      {
        key: 'schedule',
        label: 'Jadwal',
        columns: ['date', 'start_time', 'end_time', 'real_start_datetime', 'real_end_datetime']
      },
      {
        key: 'event_info',
        label: 'Informasi Event',
        columns: ['event_id', 'starter_user_id']
      },
      {
        key: 'creator',
        label: 'Informasi Pembuat',
        columns: ['creator', 'create_user_id', 'create_date', 'edit_user_id', 'edit_date']
      },
      {
        key: 'approval',
        label: 'Informasi Persetujuan',
        columns: ['approver_name', 'approve_date']
      },
      {
        key: 'delete_info',
        label: 'Informasi Penghapusan',
        columns: ['delete_reason']
      }
    ],
    filters: filters,
    defaultSort: [
      { key: 'id', direction: 'desc' }
    ],
    defaultVisibleColumns: [
      'name', 
      'description', 
      'course_name', 
      'teacher_name', 
      'students_display',
      'status',
      'approval_status',
      'class_mode',
      'date',
      'start_time',
      'end_time',
      'creator'
    ],
    defaultFreezeColumn: 'name',
    showIcon: true,
    showRowNumber: true,
    pageSize: 10,
    rowHeight: 80,
    exportConfig: {
      enabled: true,
      filename: 'classes_data',
      formats: ['excel', 'csv', 'pdf']
    },
    actionColumn: {
      enabled: true,
      label: 'Actions',
      width: 400,
      sticky: false,
      buttons: getActionButtons // Dynamic buttons function
    },
    actionButtons: [
      {
        label: 'Buat Kelas Baru',
        icon: React.createElement(FaPlus),
        variant: 'primary',
        onClick: () => {
          console.log('Create new class');
          setShowAddModal(true);
        }
      },
      {
        label: 'Manajemen Kursus',
        icon: React.createElement(BookOpen),
        variant: 'success',
        onClick: () => {
          console.log('Manage courses');
          window.location.href = '/panel/courses';
        }
      }
    ]
  };

  // NEW: Custom ReportLayout with refresh function extraction
  const ReportLayoutWithRefresh: React.FC = () => {
    return (
      <ReportLayout
        config={reportConfig}
        apiEndpoint="/classes"
        fetchOnMount={true}
        searchMode="server"
        onRefreshFunctionReady={setRefreshFunction} // Pass callback to get refresh function
      />
    );
  };

  return (
    <MainLayout>
      <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-blue-50 tw-via-white tw-to-blue-50">
        <ReportLayoutWithRefresh />
      </div>

      {/* Modal Buat Kelas */}
      <AddClassModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSave}
      />

      {/* Modal Edit Kelas */}
      <EditClassModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingClass(null);
        }}
        onSave={handleEditSave}
        editingData={editingClass}
      />

      {/* Modal Detail Kelas */}
      <DetailClassModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedClass(null);
        }}
        classData={selectedClass}
      />

      {/* Modal Start/Finish Kelas */}
      {selectedClass && (
        <StartFinishClassModal
          show={showStartFinishModal}
          handleClose={() => {
            setShowStartFinishModal(false);
            setSelectedClass(null);
          }}
          classData={selectedClass}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Modal Approval Kelas */}
      {selectedClass && (
        <ApprovalModal
          show={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedClass(null);
          }}
          classData={selectedClass}
          onSave={handleApprovalSave}
        />
      )}

      {/* Modal Student Attendance */}
      {selectedClass && (
        <StudentAttendanceModal
          show={showAttendanceModal}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedClass(null);
          }}
          classData={selectedClass}
        />
      )}
    </MainLayout>
  );
};

export default ClassesPage;