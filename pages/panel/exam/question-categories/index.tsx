// pages/panel/exam/question-categories/index.tsx

import React, { useState } from 'react';
import { FaEye, FaEdit, FaTrash, FaPlus, FaLayerGroup } from 'react-icons/fa';
import { Plus, RefreshCw } from 'lucide-react';
import MainLayout from '../../../../components/layout/DashboardLayout';
import ReportLayout from '../../../../components/report/ReportLayout';
import { ReportConfig, ColumnConfig } from '../../../../types/report';
import QuestionCategoryModal from './QuestionCategoryModal';

const QuestionCategoriesPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [refreshFunction, setRefreshFunction] = useState<(() => void) | null>(null);

  // Grade mapping
  const gradeLabels: Record<number, string> = {
    1: 'Grade 1', 2: 'Grade 2', 3: 'Grade 3', 4: 'Grade 4', 5: 'Grade 5', 6: 'Grade 6',
    7: 'Grade 7', 8: 'Grade 8', 9: 'Grade 9', 10: 'Grade 10', 11: 'Grade 11', 12: 'Grade 12',
    13: 'S1', 14: 'S2', 15: 'S3', 16: 'Beyond S3'
  };

  // Kind mapping
  const kindLabels: Record<number, string> = {
    1: 'Bidang Studi',
    2: 'Topik',
    3: 'Subtopik'
  };

  const kindColors: Record<number, string> = {
    1: 'tw-bg-blue-100 tw-text-blue-800',
    2: 'tw-bg-green-100 tw-text-green-800',
    3: 'tw-bg-purple-100 tw-text-purple-800'
  };

  // Formatters
  const formatKind = (kind: number) => {
    const colorClass = kindColors[kind] || 'tw-bg-gray-100 tw-text-gray-700';
    return (
      <div className="tw-text-center">
        <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium ${colorClass}`}>
          {kindLabels[kind] || `Kind ${kind}`}
        </span>
      </div>
    );
  };

  const formatHierarchy = (masterName: string | null, mixMasterIds: string[] | null, kind: number) => {
    if (kind === 1) {
      return (
        <div className="tw-text-center tw-text-gray-500 tw-italic">
          Root Level
        </div>
      );
    }

    if (!masterName && (!mixMasterIds || mixMasterIds.length === 0)) {
      return (
        <div className="tw-text-center tw-text-gray-400 tw-italic">
          Tidak ada parent
        </div>
      );
    }

    return (
      <div className="tw-space-y-1">
        {masterName && (
          <div className="tw-bg-indigo-50 tw-text-indigo-700 tw-px-3 tw-py-1 tw-rounded tw-text-sm tw-font-medium">
            {masterName}
          </div>
        )}
        {mixMasterIds && mixMasterIds.length > 0 && (
          <div className="tw-text-xs tw-text-gray-600">
            + {mixMasterIds.length} parent lainnya
          </div>
        )}
      </div>
    );
  };

  const formatGrade = (grades: number[]) => {
    if (!grades || grades.length === 0) {
      return (
        <div className="tw-text-center">
          <span className="tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-bg-gray-100 tw-text-gray-600">
            Semua Kalangan
          </span>
        </div>
      );
    }

    // If all grades selected, show "Semua Grade"
    if (grades.length >= 16) {
      return (
        <div className="tw-text-center">
          <span className="tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-bg-blue-100 tw-text-blue-800">
            Semua Grade (1-16)
          </span>
        </div>
      );
    }

    // Show first 3 grades
    const sortedGrades = [...grades].sort((a, b) => a - b);
    const displayGrades = sortedGrades.slice(0, 3);
    const remaining = sortedGrades.length - 3;

    return (
      <div className="tw-space-y-1">
        <div className="tw-flex tw-gap-1 tw-justify-center tw-flex-wrap">
          {displayGrades.map((grade, index) => (
            <span key={index} className="tw-bg-blue-100 tw-text-blue-800 tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium">
              {gradeLabels[grade] || `Grade ${grade}`}
            </span>
          ))}
        </div>
        {remaining > 0 && (
          <div className="tw-text-xs tw-text-center tw-text-gray-500">
            +{remaining} lainnya
          </div>
        )}
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
          <div className="tw-text-sm">
            <div className="tw-font-medium tw-text-gray-800">{creator || 'Unknown'}</div>
            <div className="tw-text-xs tw-text-gray-500">{formatDate(createDate)}</div>
          </div>
        </div>
        {editor && (
          <div className="tw-flex tw-items-center tw-gap-2 tw-pt-1 tw-border-t tw-border-gray-100">
            <div className="tw-text-sm">
              <div className="tw-font-medium tw-text-gray-800">{editor}</div>
              <div className="tw-text-xs tw-text-gray-500">{formatDate(editDate || '')}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Handlers
  const handleAdd = () => {
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleEdit = (row: any) => {
    setSelectedCategory(row);
    setShowModal(true);
  };

  const handleDelete = async (row: any) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus "${row.name}"? Ini akan menghapus semua sub-kategori di bawahnya.`)) {
      try {
        const response = await fetch(`/api/exam-types/${row.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          alert('Kategori soal berhasil dihapus');
          if (refreshFunction) refreshFunction();
        } else {
          const error = await response.json();
          alert(`Gagal menghapus: ${error.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting question category:', error);
        alert('Terjadi kesalahan saat menghapus kategori soal');
      }
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setSelectedCategory(null);
    if (refreshFunction) refreshFunction();
  };

  const handleRefresh = () => {
    if (refreshFunction) refreshFunction();
  };

  // Column definitions
  const columns: ColumnConfig[] = [
    {
      key: 'id',
      label: 'ID',
      type: 'number',
      width: 80,
      colGroup: 'basic'
    },
    {
      key: 'kind',
      label: 'Level',
      type: 'number',
      width: 120,
      colGroup: 'basic',
      formatter: formatKind
    },
    {
      key: 'code',
      label: 'Kode',
      type: 'string',
      width: 120,
      colGroup: 'basic'
    },
    {
      key: 'name',
      label: 'Nama Kategori',
      type: 'string',
      width: 250,
      colGroup: 'content'
    },
    {
      key: 'description',
      label: 'Deskripsi',
      type: 'string',
      width: 300,
      colGroup: 'content',
      formatter: (value) => value || '-'
    },
    {
      key: 'hierarchy',
      label: 'Parent/Hierarki',
      type: 'string',
      width: 200,
      colGroup: 'classification',
      formatter: (value, row) => formatHierarchy(row?.master_name, row?.mix_master_id, row?.kind)
    },
    {
      key: 'grade',
      label: 'Target Grade',
      type: 'array',
      width: 200,
      colGroup: 'properties',
      formatter: formatGrade
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

  // Report configuration
  const reportConfig: ReportConfig = {
    title: 'Manajemen Kategori Soal (Question Categories)',
    columns,
    colGroups: [
      {
        key: 'basic',
        label: 'Informasi Dasar',
        columns: ['id', 'kind', 'code']
      },
      {
        key: 'content',
        label: 'Konten',
        columns: ['name', 'description']
      },
      {
        key: 'classification',
        label: 'Klasifikasi',
        columns: ['hierarchy']
      },
      {
        key: 'properties',
        label: 'Properti',
        columns: ['grade']
      },
      {
        key: 'metadata',
        label: 'Metadata',
        columns: ['creator_info']
      }
    ],
    filters: [
      {
        key: 'name',
        type: 'text',
        label: 'Cari Nama/Kode/Deskripsi'
      },
      {
        key: 'kind',
        type: 'select',
        label: 'Level',
        options: [
          { value: 1, label: 'Bidang Studi' },
          { value: 2, label: 'Topik' },
          { value: 3, label: 'Subtopik' }
        ]
      },
      {
        key: 'grade',
        type: 'select',
        label: 'Filter Grade',
        options: [
          { value: 1, label: 'Grade 1' },
          { value: 2, label: 'Grade 2' },
          { value: 3, label: 'Grade 3' },
          { value: 4, label: 'Grade 4' },
          { value: 5, label: 'Grade 5' },
          { value: 6, label: 'Grade 6' },
          { value: 7, label: 'Grade 7' },
          { value: 8, label: 'Grade 8' },
          { value: 9, label: 'Grade 9' },
          { value: 10, label: 'Grade 10' },
          { value: 11, label: 'Grade 11' },
          { value: 12, label: 'Grade 12' },
          { value: 13, label: 'S1' },
          { value: 14, label: 'S2' },
          { value: 15, label: 'S3' },
          { value: 16, label: 'Beyond S3' }
        ]
      }
    ],
    defaultSort: [
      { key: 'kind', direction: 'asc' },
      { key: 'name', direction: 'asc' }
    ],
    defaultVisibleColumns: [
      'kind',
      'code',
      'name',
      'description',
      'hierarchy',
      'grade',
      'creator_info'
    ],
    defaultFreezeColumn: 'name',
    showIcon: true,
    showRowNumber: true,
    pageSize: 15,
    rowHeight: 80,
    exportConfig: {
      enabled: true,
      filename: 'question_categories',
      formats: ['excel', 'csv', 'pdf']
    },
    actionColumn: {
      enabled: true,
      label: 'Aksi',
      width: 180,
      sticky: false,
      buttons: [
        {
          label: 'Edit',
          icon: React.createElement(FaEdit),
          variant: 'outline-warning',
          size: 'sm',
          onClick: (row) => handleEdit(row)
        },
        {
          label: 'Hapus',
          icon: React.createElement(FaTrash),
          variant: 'outline-danger',
          size: 'sm',
          onClick: (row) => handleDelete(row)
        }
      ]
    },
    actionButtons: [
      {
        label: 'Tambah Kategori',
        icon: React.createElement(Plus),
        variant: 'primary',
        onClick: handleAdd
      },
      {
        label: 'Refresh Data',
        icon: React.createElement(RefreshCw),
        variant: 'secondary',
        onClick: handleRefresh
      }
    ]
  };

  return (
    <MainLayout>
      <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-green-50 tw-via-white tw-to-green-50">
        <ReportLayout
          config={reportConfig}
          apiEndpoint="/exam-types/paged?kind=1,2,3"
          fetchOnMount={true}
          searchMode="server"
          onRefreshFunctionReady={(refresh) => setRefreshFunction(() => refresh)}
        />
      </div>

      {/* Modal */}
      <QuestionCategoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCategory(null);
        }}
        onSave={handleSave}
        category={selectedCategory}
      />
    </MainLayout>
  );
};

export default QuestionCategoriesPage;