// pages/panel/exam/exam-schedules/index.tsx

import React from 'react';
import { FaPlus, FaEye, FaEdit, FaTrash, FaCalendar, FaClock } from 'react-icons/fa';
import MainLayout from '../../../../components/layout/DashboardLayout';
import ReportLayout from '../../../../components/report/ReportLayout';
import { ReportConfig, ColumnConfig } from '../../../../types/report';

const ExamSchedulesPage: React.FC = () => {
  // Custom formatters untuk kolom-kolom tertentu
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

  // Definisi kolom-kolom berdasarkan skema database
  const columns: ColumnConfig[] = [
    {
      key: 'id',
      label: 'ID',
      type: 'number',
      width: 80,
      colGroup: 'basic'
    }, // ID tersembunyi dari tampilan tapi tersedia untuk API calls
    {
      key: 'schedule_name',
      label: 'Nama Jadwal',
      type: 'string',
      width: 220,
      colGroup: 'basic',
      formatter: (value) => (
        <div className="tw-font-semibold tw-text-gray-800 tw-leading-tight">
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
      formatter: (value) => (
        <div className="tw-text-gray-600 tw-text-sm tw-line-clamp-3 tw-leading-relaxed" title={value}>
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
    }
  ];

  // Konfigurasi report dengan sistem batch filtering
  const reportConfig: ReportConfig = {
    title: 'Jadwal Ujian (Exam Schedules)',
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
        key: 'status',
        label: 'Status',
        columns: ['isfree', 'is_valid']
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
    // Filters menggunakan FormComponentLayout components
    filters: [
      // Text filter menggunakan ShortFormField
      {
        key: 'schedule_name',
        type: 'text',
        label: 'Nama Jadwal'
      },
      
      // API-based select menggunakan SearchSingleField
      {
        key: 'exam_type',
        type: 'select',
        label: 'Tipe Ujian',
        apiEndpoint: '/exam-schedules/exam-types',
        debounceMs: 300
      },
      
      // Boolean filters menggunakan BooleanField
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
      
      // Creator filters menggunakan SearchSingleField dengan API
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
      
      // Date filters menggunakan DateField
      {
        key: 'start_time',
        type: 'date',
        label: 'Tanggal Mulai (Dari)'
      },
      {
        key: 'end_time',
        type: 'date',
        label: 'Tanggal Selesai (Sampai)'
      },
      
      // Number filter menggunakan NumberField
      {
        key: 'question_qty',
        type: 'number',
        label: 'Jumlah Soal (Minimal)'
      }
    ],
    defaultSort: [
      { key: 'id', direction: 'desc' }
    ],
    // ID dikecualikan dari kolom default yang terlihat
    defaultVisibleColumns: [
      'schedule_name', 
      'description', 
      'exam_name', 
      'exam_duration', 
      'exam_type', 
      'isfree', 
      'is_valid',
      'start_time',
      'end_time',
      'schedule_creator'
    ],
    // Freeze column diubah ke schedule_name karena ID disembunyikan
    defaultFreezeColumn: 'schedule_name',
    showIcon: true,
    showRowNumber: true,
    pageSize: 10,
    rowHeight: 80,
    exportConfig: {
      enabled: true,
      filename: 'exam_schedules',
      formats: ['excel', 'csv', 'pdf']
    },
    actionColumn: {
      enabled: true,
      label: 'Actions',
      width: 200,
      sticky: false,
      buttons: [
        {
          label: 'Detail',
          icon: React.createElement(FaEye),
          variant: 'outline-info',
          size: 'sm',
          onClick: (row, index) => {
            console.log('View detail exam schedule:', row);
            // Implementasi: navigasi ke halaman detail menggunakan ID yang tersembunyi
            window.open(`/panel/exam/exam-schedules/${row.id}`, '_blank');
          }
        },
        {
          label: 'Edit',
          icon: React.createElement(FaEdit),
          variant: 'outline-warning',
          size: 'sm',
          onClick: (row, index) => {
            console.log('Edit exam schedule:', row);
            // Implementasi: navigasi ke halaman edit menggunakan ID yang tersembunyi
            window.location.href = `/panel/exam/exam-schedules/edit/${row.id}`;
          }
        },
        {
          label: 'Delete',
          icon: React.createElement(FaTrash),
          variant: 'outline-danger',
          size: 'sm',
          onClick: (row, index) => {
            if (window.confirm(`Apakah Anda yakin ingin menghapus jadwal "${row.schedule_name}"?`)) {
              console.log('Delete exam schedule:', row);
              // Implementasi: panggil delete API menggunakan ID yang tersembunyi
              /*
              fetch(`/api/exam-schedules/${row.id}`, { 
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  // Tambahkan authorization header jika diperlukan
                }
              })
              .then(response => {
                if (response.ok) {
                  // Refresh tabel setelah berhasil dihapus
                  window.location.reload();
                } else {
                  alert('Gagal menghapus jadwal');
                }
              })
              .catch(error => {
                console.error('Error deleting schedule:', error);
                alert('Terjadi kesalahan saat menghapus jadwal');
              });
              */
            }
          }
        }
      ]
    },
    actionButtons: [
      {
        label: 'Buat Jadwal Baru',
        icon: React.createElement(FaPlus),
        variant: 'primary',
        onClick: () => {
          console.log('Create new exam schedule');
          // Implementasi: navigasi ke halaman create
          window.location.href = '/panel/exam/exam-schedules/create';
        }
      }
    ]
  };

  return (
    <MainLayout>
      <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-purple-50 tw-via-white tw-to-purple-50">
        <ReportLayout
          config={reportConfig}
          apiEndpoint="/exam-schedules/all"
          fetchOnMount={true}
          searchMode="server" // Menggunakan server-side search dengan batch filtering
        />
      </div>
    </MainLayout>
  );
};

export default ExamSchedulesPage;