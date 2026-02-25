// pages/panel/exam/passages/index.tsx

import React, { useState } from 'react';
import { FaEye, FaEdit, FaTrash, FaBook } from 'react-icons/fa';
import { Plus, RefreshCw } from 'lucide-react';
import MainLayout from '../../../../components/layout/DashboardLayout';
import ReportLayout from '../../../../components/report/ReportLayout';
import { ReportConfig, ColumnConfig } from '../../../../types/report';
import AddPassageModal from './AddPassageModal';
import EditPassageModal from './EditPassageModal';
import ViewPassageModal from './ViewPassageModal';
import axios from 'axios';

const PassageManagementPage: React.FC = () => {
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPassage, setSelectedPassage] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Custom formatters
  const formatPassageContent = (value: string) => {
    if (!value) return '-';
    
    // Strip HTML tags for display in table
    const textOnly = value.replace(/<[^>]*>/g, '');
    const truncated = textOnly.length > 150 ? textOnly.substring(0, 150) + '...' : textOnly;
    
    return (
      <div className="tw-text-sm tw-leading-relaxed tw-text-gray-700" title={textOnly}>
        {truncated}
      </div>
    );
  };

  const formatUsageCount = (count: number) => {
    if (!count || count === 0) {
      return (
        <div className="tw-text-center tw-text-gray-500 tw-italic">
          Belum digunakan
        </div>
      );
    }
    
    const colorClass = count > 10 ? 'tw-bg-red-100 tw-text-red-800' : 
                       count > 5 ? 'tw-bg-orange-100 tw-text-orange-800' : 
                       'tw-bg-green-100 tw-text-green-800';
    
    return (
      <div className="tw-text-center">
        <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-bold ${colorClass}`}>
          {count} soal
        </span>
      </div>
    );
  };

  const formatCreatorEditor = (creator: string, editor: string | null, createDate: string, updateDate: string | null) => {
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
          <FaBook className="tw-w-3 tw-h-3 tw-text-blue-500" />
          <div className="tw-text-sm">
            <div className="tw-font-medium tw-text-gray-800">{creator || 'Unknown'}</div>
            <div className="tw-text-xs tw-text-gray-500">{formatDate(createDate)}</div>
          </div>
        </div>
        {editor && updateDate && (
          <div className="tw-flex tw-items-center tw-gap-2 tw-pt-1 tw-border-t tw-border-gray-100">
            <FaEdit className="tw-w-3 tw-h-3 tw-text-orange-500" />
            <div className="tw-text-sm">
              <div className="tw-font-medium tw-text-gray-800">{editor}</div>
              <div className="tw-text-xs tw-text-gray-500">{formatDate(updateDate)}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Handler functions
  const handleAddPassage = () => {
    setShowAddModal(true);
  };

  const handlePassageSave = () => {
    setShowAddModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewPassage = (row: any) => {
    setSelectedPassage(row);
    setShowViewModal(true);
  };

  const handleEditPassage = (row: any) => {
    setSelectedPassage(row);
    setShowEditModal(true);
  };

  const handlePassageUpdate = () => {
    setShowEditModal(false);
    setSelectedPassage(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeletePassage = async (row: any) => {
    if (row.usage_count > 0) {
      alert(`Tidak dapat menghapus bacaan ini karena masih digunakan oleh ${row.usage_count} soal.`);
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus bacaan "${row.title}"?`)) {
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/passage/${row.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      alert('Bacaan berhasil dihapus!');
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Error deleting passage:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Gagal menghapus bacaan';
      alert(`Error: ${errorMsg}`);
    }
  };

  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
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
      key: 'title',
      label: 'Judul Bacaan',
      type: 'string',
      width: 250,
      colGroup: 'content'
    },
    {
      key: 'passage',
      label: 'Isi Bacaan',
      type: 'string',
      width: 400,
      colGroup: 'content',
      formatter: formatPassageContent
    },
    {
      key: 'usage_count',
      label: 'Digunakan di Soal',
      type: 'number',
      width: 150,
      colGroup: 'usage',
      formatter: (value) => formatUsageCount(value as number)
    },
    {
      key: 'creator_info',
      label: 'Pembuat & Editor',
      type: 'string',
      width: 200,
      colGroup: 'metadata',
      formatter: (value, row) => formatCreatorEditor(row?.creator, row?.editor, row?.create_date, row?.update_date)
    }
  ];

  // Report configuration
  const reportConfig: ReportConfig = {
    title: 'Manajemen Bacaan (Passage Management)',
    columns,
    colGroups: [
      {
        key: 'basic',
        label: 'Informasi Dasar',
        columns: ['id']
      },
      {
        key: 'content',
        label: 'Konten Bacaan',
        columns: ['title', 'passage']
      },
      {
        key: 'usage',
        label: 'Penggunaan',
        columns: ['usage_count']
      },
      {
        key: 'metadata',
        label: 'Metadata',
        columns: ['creator_info']
      }
    ],
    filters: [
      {
        key: 'search',
        type: 'text',
        label: 'Cari Bacaan (ID atau Judul)'
      },
      {
        key: 'creator',
        type: 'text',
        label: 'Pembuat'
      },
      {
        key: 'start_date',
        type: 'date',
        label: 'Tanggal Dibuat (Dari)'
      },
      {
        key: 'end_date',
        type: 'date',
        label: 'Tanggal Dibuat (Sampai)'
      }
    ],
    defaultSort: [
      { key: 'id', direction: 'desc' }
    ],
    defaultVisibleColumns: [
      'title',
      'passage',
      'usage_count',
      'creator_info'
    ],
    defaultFreezeColumn: 'title',
    showIcon: true,
    showRowNumber: true,
    pageSize: 10,
    rowHeight: 120,
    exportConfig: {
      enabled: true,
      filename: 'passages_management',
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
          onClick: (row) => {
            handleViewPassage(row);
          }
        },
        {
          label: 'Edit',
          icon: React.createElement(FaEdit),
          variant: 'outline-warning',
          size: 'sm',
          onClick: (row) => {
            handleEditPassage(row);
          }
        },
        {
          label: 'Hapus',
          icon: React.createElement(FaTrash),
          variant: 'outline-danger',
          size: 'sm',
          onClick: (row) => {
            handleDeletePassage(row);
          }
        }
      ]
    },
    actionButtons: [
      {
        label: 'Tambah Bacaan Baru',
        icon: React.createElement(Plus),
        variant: 'primary',
        onClick: handleAddPassage
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
      <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-purple-50 tw-via-white tw-to-purple-50">
        {/* Main Report Layout */}
        <ReportLayout
          config={reportConfig}
          apiEndpoint="/questions/passage/paged"
          fetchOnMount={true}
          searchMode="server"
          key={refreshTrigger}
        />
      </div>

      {/* Modal Tambah Bacaan Baru */}
      <AddPassageModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handlePassageSave}
      />

      {/* Modal View Detail Bacaan */}
      <ViewPassageModal
        isOpen={showViewModal}
        passageData={selectedPassage}
        onClose={() => {
          setShowViewModal(false);
          setSelectedPassage(null);
        }}
      />

      {/* Modal Edit Bacaan */}
      <EditPassageModal
        isOpen={showEditModal}
        passageData={selectedPassage}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPassage(null);
        }}
        onSave={handlePassageUpdate}
      />
    </MainLayout>
  );
};

export default PassageManagementPage;
