// pages/panel/exam/exam-schedules/index.tsx

import React from 'react';
import { FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
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
        <div className="tw-font-semibold tw-text-purple-700">
          {hours > 0 ? `${hours}j ${remainingMinutes}m` : `${remainingMinutes}m`}
        </div>
        <div className="tw-text-xs tw-text-gray-500">({value} menit)</div>
      </div>
    );
  };

  const formatBoolean = (value: boolean, label: string) => {
    return (
      <div className="tw-text-center">
        <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium ${
          value 
            ? 'tw-bg-green-100 tw-text-green-800' 
            : 'tw-bg-red-100 tw-text-red-800'
        }`}>
          {value ? `✓ ${label}` : `✗ Tidak ${label}`}
        </span>
      </div>
    );
  };

  const formatCreator = (value: string) => {
    return (
      <div className="tw-flex tw-items-center tw-gap-2">
        <div className="tw-w-8 tw-h-8 tw-bg-purple-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold">
          {value ? value.charAt(0).toUpperCase() : 'U'}
        </div>
        <span className="tw-font-medium">{value || 'Unknown'}</span>
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

  // Definisi kolom-kolom
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
      width: 200,
      colGroup: 'basic',
      formatter: (value) => (
        <div className="tw-font-semibold tw-text-gray-800">
          {value || '-'}
        </div>
      )
    },
    {
      key: 'description',
      label: 'Deskripsi',
      type: 'string',
      width: 250,
      colGroup: 'basic',
      formatter: (value) => (
        <div className="tw-text-gray-600 tw-text-sm tw-line-clamp-2" title={value}>
          {value || '-'}
        </div>
      )
    },
    {
      key: 'exam_name',
      label: 'Nama Ujian',
      type: 'string',
      width: 300,
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
      width: 150,
      colGroup: 'exam_info',
      formatter: (value) => (
        <span className="tw-bg-purple-100 tw-text-purple-800 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-medium">
          {value || '-'}
        </span>
      )
    },
    {
      key: 'series',
      label: 'Series',
      type: 'string',
      width: 120,
      colGroup: 'exam_info',
      formatter: (value) => (
        <span className="tw-bg-blue-100 tw-text-blue-800 tw-px-2 tw-py-1 tw-rounded tw-text-sm tw-font-medium">
          {value || '-'}
        </span>
      )
    },
    {
      key: 'group_product',
      label: 'Group Product',
      type: 'string',
      width: 150,
      colGroup: 'exam_info',
      formatter: (value) => (
        <span className="tw-bg-orange-100 tw-text-orange-800 tw-px-2 tw-py-1 tw-rounded tw-text-sm tw-font-medium">
          {value || '-'}
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
      width: 120,
      colGroup: 'status',
      formatter: (value) => formatBoolean(value, 'Free')
    },
    {
      key: 'is_valid',
      label: 'Status Valid',
      type: 'boolean',
      width: 120,
      colGroup: 'status',
      formatter: (value) => formatBoolean(value, 'Valid')
    },
    {
      key: 'start_time',
      label: 'Waktu Mulai',
      type: 'datetime',
      width: 180,
      colGroup: 'schedule',
      formatter: (value) => {
        if (!value) {
          return (
            <span className="tw-text-gray-400 tw-italic">
              Belum ditentukan
            </span>
          );
        }
        return new Date(value).toLocaleString('id-ID');
      }
    },
    {
      key: 'end_time',
      label: 'Waktu Selesai',
      type: 'datetime',
      width: 180,
      colGroup: 'schedule',
      formatter: (value) => {
        if (!value) {
          return (
            <span className="tw-text-gray-400 tw-italic">
              Belum ditentukan
            </span>
          );
        }
        return new Date(value).toLocaleString('id-ID');
      }
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

  // Konfigurasi report
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
        columns: ['exam_name', 'exam_duration', 'exam_type', 'series', 'group_product', 'question_qty']
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
        options: [
          { value: 'SNBT Exam', label: 'SNBT Exam' },
          { value: 'UTBK Exam', label: 'UTBK Exam' },
          { value: 'Tryout', label: 'Tryout' },
          { value: 'Custom', label: 'Custom' }
        ]
      },
      {
        key: 'series',
        type: 'select',
        label: 'Series',
        options: [
          { value: 'SBMPTN', label: 'SBMPTN' },
          { value: 'UTBK', label: 'UTBK' },
          { value: 'SIMAK', label: 'SIMAK' },
          { value: 'CUSTOM', label: 'CUSTOM' }
        ]
      },
      {
        key: 'group_product',
        type: 'text',
        label: 'Group Product'
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
        key: 'schedule_creator',
        type: 'text',
        label: 'Pembuat Jadwal'
      },
      {
        key: 'exam_creator',
        type: 'text',
        label: 'Pembuat Ujian'
      },
      {
        key: 'start_time',
        type: 'date',
        label: 'Tanggal Mulai'
      },
      {
        key: 'end_time',
        type: 'date',
        label: 'Tanggal Selesai'
      }
    ],
    defaultSort: [
      { key: 'id', direction: 'desc' }
    ],
    defaultVisibleColumns: [
      'id', 
      'schedule_name', 
      'description', 
      'exam_name', 
      'exam_duration', 
      'exam_type', 
      'isfree', 
      'is_valid',
      'schedule_creator'
    ],
    defaultFreezeColumn: 'schedule_name',
    showIcon: true,
    showRowNumber: true,
    pageSize: 10,
    rowHeight: 70,
    exportConfig: {
      enabled: true,
      filename: 'exam_schedules',
      formats: ['excel', 'csv', 'pdf']
    },
    actionColumn: {
      enabled: true,
      label: 'Pengaturan',
      width: 200,
      sticky: false, // Changed from true to false
      buttons: [
        {
          label: 'Detail',
          icon: React.createElement(FaEye),
          variant: 'outline-info',
          size: 'sm',
          onClick: (row, index) => {
            console.log('View detail exam schedule:', row);
            // Implementasi navigasi ke halaman detail
            // router.push(`/panel/exams/exam-schedules/${row.id}`);
          }
        },
        {
          label: 'Edit',
          icon: React.createElement(FaEdit),
          variant: 'outline-warning',
          size: 'sm',
          onClick: (row, index) => {
            console.log('Edit exam schedule:', row);
            // Implementasi navigasi ke halaman edit
            // router.push(`/panel/exams/exam-schedules/edit/${row.id}`);
          }
        },
        {
          label: 'Delete',
          icon: React.createElement(FaTrash),
          variant: 'outline-danger',
          size: 'sm',
          onClick: (row, index) => {
            if (window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
              console.log('Delete exam schedule:', row);
              // Implementasi delete
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
          // Implementasi navigasi ke halaman create
          // router.push('/panel/exams/exam-schedules/create');
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
          searchMode="client"
        />
      </div>
    </MainLayout>
  );
};

export default ExamSchedulesPage;