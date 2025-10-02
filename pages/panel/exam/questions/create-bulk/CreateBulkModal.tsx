// pages/panel/exam/questions/create-bulk/CreateBulkModal.tsx
'use client';

import React from 'react';
import { Table } from 'react-bootstrap';
import { List, Plus, Download, ArrowRight } from 'lucide-react';
import { ReportSuiteModal, ModalButton } from '../../../../../components/modal/ModalTemplate';
import NavigationBar from '@/ components/layout/NavigationBar';

interface CreateBulkModalProps {
  show: boolean;
  onHide: () => void;
  data: any[];
  autoExported?: boolean;
  onReset: () => void;
  onExport: () => void;
  onNavigate: () => void;
}

const CreateBulkModal: React.FC<CreateBulkModalProps> = ({
  show,
  onHide,
  data = [],
  autoExported,
  onReset,
  onExport,
  onNavigate,
}) => {
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'single-choice': return 'Pilihan Ganda';
      case 'multiple-choice': return 'Pilihan Ganda Kompleks';
      case 'true-false': return 'Benar/Salah';
      case 'number': return 'Isian Angka';
      case 'text': return 'Isian Teks';
      default: return type;
    }
  };

  // Early return if no data to prevent rendering issues
  if (!data || data.length === 0) {
    return null;
  }

  // Define bottom buttons using the template
  const bottomButtons: ModalButton[] = [
    {
      action: 'add',
      text: 'Buat Ulang',
      icon: <Plus className="tw-w-4 tw-h-4" />,
      onClick: onReset,
      variant: 'secondary',
      size: 'md'
    },
    {
      action: 'export',
      text: 'Export CSV',
      icon: <Download className="tw-w-4 tw-h-4" />,
      onClick: onExport,
      variant: 'info',
      size: 'md'
    },
    {
      action: 'navigate',
      text: 'Ke Daftar Soal',
      icon: <ArrowRight className="tw-w-4 tw-h-4" />,
      onClick: onNavigate,
      variant: 'primary',
      size: 'md',
      customColors: {
        gradient1: '#8B5CF6',
        gradient2: '#6366F1',
        text: '#FFFFFF'
      }
    }
  ];

  return (
    <>
        <NavigationBar>

    </NavigationBar>
    <ReportSuiteModal
      show={show}
      onHide={onHide}
      title="Soal Berhasil Dibuat!"
      subtitle={`Berhasil membuat ${data.length} soal. Detail soal yang dibuat:`}
      size="lg"
      icon={<List className="tw-w-5 tw-h-5" />}
      scrollable={true}
      bottomButtons={bottomButtons}
      showCloseButton={true}
      preventCloseOnOutsideClick={true}
    >
      {/* Success Message */}
      <div className="tw-bg-emerald-50 tw-rounded-lg tw-p-4 tw-mb-5 tw-border-l-4 tw-border-emerald-500">
        <p className="tw-text-emerald-700 tw-font-medium tw-flex tw-items-center tw-gap-2">
          <span className="tw-flex tw-w-2 tw-h-2 tw-bg-emerald-500 tw-rounded-full tw-animate-pulse"></span>
          Berhasil membuat <span className="tw-font-bold tw-text-emerald-800">{data.length} soal</span>
        </p>
      </div>
      
      {/* Questions Table */}
      <div className="tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-purple-200 tw-overflow-hidden">
        <Table className="tw-mb-0" hover>
          <thead>
            <tr className="tw-bg-gradient-to-r tw-from-purple-100 tw-to-violet-100">
              <th className="tw-font-semibold tw-text-purple-800 tw-py-3 tw-px-4 tw-border-b tw-border-purple-200">
                Kode Soal
              </th>
              <th className="tw-font-semibold tw-text-purple-800 tw-py-3 tw-px-4 tw-border-b tw-border-purple-200">
                Tipe Soal
              </th>
              <th className="tw-font-semibold tw-text-purple-800 tw-py-3 tw-px-4 tw-border-b tw-border-purple-200 tw-text-center">
                Level
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="hover:tw-bg-purple-50 tw-transition-colors tw-duration-200">
                <td className="tw-font-mono tw-py-3 tw-px-4 tw-border-b tw-border-gray-100 tw-text-gray-700">
                  {item?.code || 'N/A'}
                </td>
                <td className="tw-py-3 tw-px-4 tw-border-b tw-border-gray-100 tw-text-gray-700">
                  <span className="tw-inline-flex tw-items-center tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-bg-blue-100 tw-text-blue-800">
                    {getQuestionTypeLabel(item?.question_type || '')}
                  </span>
                </td>
                <td className="tw-py-3 tw-px-4 tw-border-b tw-border-gray-100 tw-text-center">
                  <span className="tw-inline-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-bg-purple-100 tw-text-purple-800 tw-font-semibold tw-text-sm">
                    {item?.level || 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Additional Info */}
      {autoExported && (
        <div className="tw-mt-4 tw-bg-blue-50 tw-rounded-lg tw-p-3 tw-border-l-4 tw-border-blue-400">
          <p className="tw-text-blue-700 tw-text-sm tw-flex tw-items-center tw-gap-2">
            <Download className="tw-w-4 tw-h-4" />
            File CSV telah otomatis diunduh ke komputer Anda.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="tw-mt-4 tw-grid tw-grid-cols-2 sm:tw-grid-cols-3 tw-gap-3">
        <div className="tw-bg-gradient-to-br tw-from-green-100 tw-to-emerald-100 tw-rounded-lg tw-p-3 tw-text-center">
          <div className="tw-text-green-600 tw-font-bold tw-text-lg">{data.length}</div>
          <div className="tw-text-green-700 tw-text-xs tw-font-medium">Total Soal</div>
        </div>
        <div className="tw-bg-gradient-to-br tw-from-blue-100 tw-to-sky-100 tw-rounded-lg tw-p-3 tw-text-center">
          <div className="tw-text-blue-600 tw-font-bold tw-text-lg">
            {new Set(data.map(item => item?.question_type)).size}
          </div>
          <div className="tw-text-blue-700 tw-text-xs tw-font-medium">Jenis Soal</div>
        </div>
        <div className="tw-bg-gradient-to-br tw-from-purple-100 tw-to-violet-100 tw-rounded-lg tw-p-3 tw-text-center sm:tw-col-span-1 tw-col-span-2">
          <div className="tw-text-purple-600 tw-font-bold tw-text-lg">
            {new Set(data.map(item => item?.level)).size}
          </div>
          <div className="tw-text-purple-700 tw-text-xs tw-font-medium">Level Berbeda</div>
        </div>
      </div>
    </ReportSuiteModal>
    </>

  );
};

export default CreateBulkModal;