// pages/panel/exam/questions/index.tsx

import React, { useState } from 'react';
import { FaEye, FaEdit, FaTrash, FaPlus, FaQuestion, FaBook, FaClock, FaUser } from 'react-icons/fa';
import { BookOpen, Plus, RefreshCw } from 'lucide-react';
import MainLayout from '../../../../components/layout/DashboardLayout';
import ReportLayout from '../../../../components/report/ReportLayout';
import { ReportConfig, ColumnConfig } from '../../../../types/report';
import AddQuestionModal from './AddQuestionModal';

const QuestionManagementPage: React.FC = () => {
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Custom formatters untuk kolom-kolom tertentu
  const formatQuestionText = (value: string) => {
    if (!value) return '-';
    
    // Strip HTML tags for display in table (show clean text)
    const textOnly = value.replace(/<[^>]*>/g, '');
    const truncated = textOnly.length > 100 ? textOnly.substring(0, 100) + '...' : textOnly;
    
    return (
      <div className="tw-text-sm tw-leading-relaxed tw-text-gray-700" title={textOnly}>
        {truncated}
      </div>
    );
  };

  const formatQuestionType = (value: string) => {
    if (!value) return '-';
    
    const typeColors = {
      'single-choice': 'tw-bg-blue-100 tw-text-blue-800',
      'multiple-choice': 'tw-bg-green-100 tw-text-green-800',
      'true-false': 'tw-bg-purple-100 tw-text-purple-800',
      'number': 'tw-bg-orange-100 tw-text-orange-800',
      'text': 'tw-bg-gray-100 tw-text-gray-800'
    };
    
    const colorClass = typeColors[value as keyof typeof typeColors] || 'tw-bg-gray-100 tw-text-gray-700';
    
    return (
      <div className="tw-text-center">
        <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium ${colorClass}`}>
          {value.replace('-', ' ').toUpperCase()}
        </span>
      </div>
    );
  };

  const formatExamUsage = (examIds: number[], examNames: string[]) => {
    if (!examIds || examIds.length === 0) {
      return (
        <div className="tw-text-center tw-text-gray-500 tw-italic">
          Belum digunakan
        </div>
      );
    }
    
    const count = examIds.length;
    const displayNames = examNames ? examNames.slice(0, 2) : [];
    
    return (
      <div className="tw-space-y-1">
        <div className="tw-text-center tw-font-semibold tw-text-indigo-600">
          {count} ujian
        </div>
        {displayNames.map((name, index) => (
          <div key={index} className="tw-text-xs tw-bg-indigo-50 tw-text-indigo-700 tw-px-2 tw-py-1 tw-rounded tw-truncate" title={name}>
            {name}
          </div>
        ))}
        {count > 2 && (
          <div className="tw-text-xs tw-text-gray-500 tw-text-center">
            +{count - 2} lainnya
          </div>
        )}
      </div>
    );
  };

  const formatTopicSubtopic = (topic: string, subtopic: string) => {
    return (
      <div className="tw-space-y-1">
        <div className="tw-text-sm tw-font-medium tw-text-gray-800">
          {topic || 'Tanpa Topik'}
        </div>
        <div className="tw-text-xs tw-bg-gray-100 tw-text-gray-600 tw-px-2 tw-py-1 tw-rounded">
          {subtopic || 'Tanpa Subtopik'}
        </div>
      </div>
    );
  };

  const formatCorrectAnswer = (answers: string[], type: string) => {
    if (!answers || answers.length === 0) return '-';
    
    if (type === 'single-choice' || type === 'multiple-choice') {
      return (
        <div className="tw-flex tw-gap-1 tw-justify-center tw-flex-wrap">
          {answers.map((answer, index) => (
            <span key={index} className="tw-bg-green-100 tw-text-green-800 tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-bold">
              {answer}
            </span>
          ))}
        </div>
      );
    }
    
    return (
      <div className="tw-text-center tw-text-sm tw-font-medium tw-text-green-700">
        {answers.join(', ')}
      </div>
    );
  };

  const formatCreatorEditor = (creator: string, editor: string | null, createDate: string, editDate: string | null) => {
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    };

    return (
      <div className="tw-space-y-2">
        <div className="tw-flex tw-items-center tw-gap-2">
          <FaUser className="tw-w-3 tw-h-3 tw-text-blue-500" />
          <div className="tw-text-sm">
            <div className="tw-font-medium tw-text-gray-800">{creator || 'Unknown'}</div>
            <div className="tw-text-xs tw-text-gray-500">{formatDate(createDate)}</div>
          </div>
        </div>
        {editor && (
          <div className="tw-flex tw-items-center tw-gap-2 tw-pt-1 tw-border-t tw-border-gray-100">
            <FaEdit className="tw-w-3 tw-h-3 tw-text-orange-500" />
            <div className="tw-text-sm">
              <div className="tw-font-medium tw-text-gray-800">{editor}</div>
              <div className="tw-text-xs tw-text-gray-500">{formatDate(editDate || '')}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Handler functions
  const handleAddQuestion = () => {
    console.log('Add new question');
    setShowAddModal(true);
  };

  const handleQuestionSave = (questionData: any) => {
    console.log('Question saved:', questionData);
    // Close the modal
    setShowAddModal(false);
    // Refresh table data
    window.location.reload();
  };

  const handleRefreshData = () => {
    console.log('Refresh questions data');
    window.location.reload();
  };

  // Definisi kolom-kolom berdasarkan data response
  const columns: ColumnConfig[] = [
    {
      key: 'id',
      label: 'ID',
      type: 'number',
      width: 80,
      colGroup: 'basic'
    },
    {
      key: 'question_text',
      label: 'Teks Soal',
      type: 'string',
      width: 350,
      colGroup: 'content',
      formatter: formatQuestionText
    },
    {
      key: 'question_type',
      label: 'Tipe Soal',
      type: 'string',
      width: 120,
      colGroup: 'properties',
      formatter: formatQuestionType
    },
    {
      key: 'topic_subtopic',
      label: 'Topik & Subtopik',
      type: 'string',
      width: 180,
      colGroup: 'classification',
      formatter: (value, row) => formatTopicSubtopic(row?.topic, row?.subtopic)
    },
    {
      key: 'exam_usage',
      label: 'Digunakan di Ujian',
      type: 'string',
      width: 200,
      colGroup: 'usage',
      formatter: (value, row) => formatExamUsage(row?.exam_id, row?.exam_name)
    },
    {
      key: 'correct_answer',
      label: 'Jawaban Benar',
      type: 'string',
      width: 150,
      colGroup: 'content',
      formatter: (value, row) => formatCorrectAnswer(row?.correct_answer, row?.question_type)
    },
    {
      key: 'creator_info',
      label: 'Pembuat & Editor',
      type: 'string',
      width: 200,
      colGroup: 'metadata',
      formatter: (value, row) => formatCreatorEditor(row?.creator, row?.editor, row?.create_date, row?.edit_date)
    }
  ];

  // Konfigurasi report
  const reportConfig: ReportConfig = {
    title: 'Manajemen Soal (Question Management)',
    columns,
    colGroups: [
      {
        key: 'basic',
        label: 'Informasi Dasar',
        columns: ['id']
      },
      {
        key: 'content',
        label: 'Konten Soal',
        columns: ['question_text', 'correct_answer']
      },
      {
        key: 'properties',
        label: 'Properti',
        columns: ['question_type']
      },
      {
        key: 'classification',
        label: 'Klasifikasi',
        columns: ['topic_subtopic']
      },
      {
        key: 'usage',
        label: 'Penggunaan',
        columns: ['exam_usage']
      },
      {
        key: 'metadata',
        label: 'Metadata',
        columns: ['creator_info']
      }
    ],
    filters: [
      {
        key: 'question_text',
        type: 'text',
        label: 'Cari dalam Teks Soal'
      },
      {
        key: 'question_type',
        type: 'select',
        label: 'Tipe Soal',
        options: [
          { value: 'single-choice', label: 'Single Choice' },
          { value: 'multiple-choice', label: 'Multiple Choice' },
          { value: 'true-false', label: 'True/False' },
          { value: 'number', label: 'Number' },
          { value: 'text', label: 'Text' }
        ]
      },
      {
        key: 'topic',
        type: 'select',
        label: 'Topik',
        apiEndpoint: '/questions/topics',
        debounceMs: 300
      },
      {
        key: 'subtopic',
        type: 'select',
        label: 'Subtopik',
        apiEndpoint: '/questions/subtopics',
        debounceMs: 300
      },
      {
        key: 'creator',
        type: 'select',
        label: 'Pembuat',
        apiEndpoint: '/questions/creators',
        debounceMs: 300
      },
      {
        key: 'exam_name',
        type: 'select',
        label: 'Digunakan di Ujian',
        apiEndpoint: '/questions/exam-usage',
        debounceMs: 300
      },
      {
        key: 'create_date',
        type: 'date',
        label: 'Tanggal Dibuat (Dari)'
      },
      {
        key: 'create_date_to',
        type: 'date',
        label: 'Tanggal Dibuat (Sampai)'
      }
    ],
    defaultSort: [
      { key: 'id', direction: 'desc' }
    ],
    defaultVisibleColumns: [
      'question_text',
      'question_type', 
      'topic_subtopic',
      'exam_usage',
      'correct_answer',
      'creator_info'
    ],
    defaultFreezeColumn: 'question_text',
    showIcon: true,
    showRowNumber: true,
    pageSize: 10,
    rowHeight: 100, // Increased height untuk accommodating question content
    exportConfig: {
      enabled: true,
      filename: 'questions_management',
      formats: ['excel', 'csv', 'pdf']
    },
    actionColumn: {
      enabled: true,
      label: 'Aksi',
      width: 180,
      sticky: false,
      buttons: [
        {
          label: 'Detail',
          icon: React.createElement(FaEye),
          variant: 'outline-info',
          size: 'sm',
          onClick: (row, index) => {
            console.log('View question detail:', row);
            // TODO: Open detail modal or navigate to detail page
            window.open(`/panel/exam/questions/${row.id}`, '_blank');
          }
        },
        {
          label: 'Edit',
          icon: React.createElement(FaEdit),
          variant: 'outline-warning',
          size: 'sm',
          onClick: (row, index) => {
            console.log('Edit question:', row);
            // TODO: Open edit modal
            setShowEditModal(true);
          }
        },
        {
          label: 'Hapus',
          icon: React.createElement(FaTrash),
          variant: 'outline-danger',
          size: 'sm',
          onClick: (row, index) => {
            if (window.confirm(`Apakah Anda yakin ingin menghapus soal ID ${row.id}?`)) {
              console.log('Delete question:', row);
              // TODO: Implement delete API call
            }
          }
        }
      ]
    },
    actionButtons: [
      {
        label: 'Tambah Soal Baru',
        icon: React.createElement(Plus),
        variant: 'primary',
        onClick: handleAddQuestion
      },
      {
        label: 'Refresh Data',
        icon: React.createElement(RefreshCw),
        variant: 'secondary',
        onClick: handleRefreshData
      }
    ]
  };

  return (
    <MainLayout>
      <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-blue-50 tw-via-white tw-to-blue-50">
        {/* Main Report Layout */}
        <ReportLayout
          config={reportConfig}
          apiEndpoint="/questions/paged"
          fetchOnMount={true}
          searchMode="server"
        />
      </div>

      {/* Modal Tambah Soal Baru */}
      <AddQuestionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleQuestionSave}
      />

      {/* Modal Edit Soal */}
      {/* TODO: Implement EditQuestionModal */}
    </MainLayout>
  );
};

export default QuestionManagementPage;