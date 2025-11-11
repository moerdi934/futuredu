// components/modal/ImportResultModal.tsx
import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, FileJson } from 'lucide-react';
import { LearningModal, ModalButton } from './ModalTemplate';
import { ButtonGradient } from '../button/ButtonTemplate';
import { ImportResult } from '../../lib/utils/bulkQuestionImport';

interface ImportResultModalProps {
  show: boolean;
  result: ImportResult | null;
  onClose: () => void;
  onProceed: () => void;
  onRetry: () => void;
}

export const ImportResultModal: React.FC<ImportResultModalProps> = ({
  show,
  result,
  onClose,
  onProceed,
  onRetry
}) => {
  if (!result) return null;
  
  const hasErrors = result.incompleteQuestions > 0;
  const allWarnings = result.questions.flatMap(q => q.warnings);
  
  const buttons: ModalButton[] = [
    {
      action: 'cancel',
      text: 'Batal',
      onClick: onClose
    }
  ];
  
  if (hasErrors) {
    buttons.push({
      action: 'custom',
      text: 'Retry Import',
      onClick: onRetry
    });
  }
  
  buttons.push({
    action: 'save',
    text: hasErrors ? 'Lanjutkan dengan Soal Lengkap' : 'Lanjutkan',
    onClick: onProceed
  });
  
  return (
    <LearningModal
      show={show}
      onHide={onClose}
      title="Hasil Import JSON"
      subtitle={`${result.totalQuestions} soal berhasil diproses`}
      icon={<FileJson className="tw-w-5 tw-h-5" />}
      size="lg"
      width="90vw"
      height="85vh"
      scrollable={true}
      bottomButtons={buttons}
      preventCloseOnOutsideClick={true}
    >
      <div className="tw-space-y-4 tw-w-full">
        {/* Summary Cards */}
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
          <div className="tw-bg-gradient-to-br tw-from-blue-50 tw-to-blue-100 tw-border-2 tw-border-blue-300 tw-rounded-lg tw-p-4">
            <div className="tw-flex tw-items-center tw-gap-3">
              <FileJson className="tw-w-8 tw-h-8 tw-text-blue-600" />
              <div>
                <div className="tw-text-2xl tw-font-bold tw-text-blue-800">
                  {result.totalQuestions}
                </div>
                <div className="tw-text-sm tw-text-blue-600">Total Soal</div>
              </div>
            </div>
          </div>
          
          <div className="tw-bg-gradient-to-br tw-from-green-50 tw-to-green-100 tw-border-2 tw-border-green-300 tw-rounded-lg tw-p-4">
            <div className="tw-flex tw-items-center tw-gap-3">
              <CheckCircle className="tw-w-8 tw-h-8 tw-text-green-600" />
              <div>
                <div className="tw-text-2xl tw-font-bold tw-text-green-800">
                  {result.completeQuestions}
                </div>
                <div className="tw-text-sm tw-text-green-600">Soal Lengkap</div>
              </div>
            </div>
          </div>
          
          <div className="tw-bg-gradient-to-br tw-from-red-50 tw-to-red-100 tw-border-2 tw-border-red-300 tw-rounded-lg tw-p-4">
            <div className="tw-flex tw-items-center tw-gap-3">
              <AlertCircle className="tw-w-8 tw-h-8 tw-text-red-600" />
              <div>
                <div className="tw-text-2xl tw-font-bold tw-text-red-800">
                  {result.incompleteQuestions}
                </div>
                <div className="tw-text-sm tw-text-red-600">Belum Lengkap</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Warnings Section */}
        {allWarnings.length > 0 && (
          <div className="tw-bg-yellow-50 tw-border-2 tw-border-yellow-200 tw-rounded-lg tw-p-4">
            <h4 className="tw-text-yellow-800 tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-gap-2">
              <AlertTriangle className="tw-w-5 tw-h-5" />
              Peringatan ({allWarnings.length})
            </h4>
            <div className="tw-space-y-2 tw-max-h-64 tw-overflow-y-auto">
              {allWarnings.map((warning, idx) => (
                <div key={idx} className="tw-flex tw-items-start tw-gap-2 tw-text-yellow-700 tw-text-sm">
                  <AlertTriangle className="tw-w-4 tw-h-4 tw-mt-0.5 tw-flex-shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Errors Section */}
        {result.errors.length > 0 && (
          <div className="tw-bg-red-50 tw-border-2 tw-border-red-300 tw-rounded-lg tw-p-4">
            <h4 className="tw-text-red-800 tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-gap-2">
              <AlertCircle className="tw-w-5 tw-h-5" />
              Error ({result.errors.length})
            </h4>
            <div className="tw-space-y-2 tw-max-h-64 tw-overflow-y-auto">
              {result.errors.map((error, idx) => (
                <div key={idx} className="tw-flex tw-items-start tw-gap-2 tw-text-red-700 tw-text-sm">
                  <AlertCircle className="tw-w-4 tw-h-4 tw-mt-0.5 tw-flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Question Status List */}
        <div className="tw-bg-white tw-border-2 tw-border-purple-200 tw-rounded-lg tw-p-4">
          <h4 className="tw-text-purple-800 tw-font-semibold tw-mb-3">
            Status Per Soal
          </h4>
          <div className="tw-space-y-2 tw-max-h-96 tw-overflow-y-auto">
            {result.questions.map((q, idx) => (
              <div
                key={idx}
                className={`tw-flex tw-items-center tw-justify-between tw-p-3 tw-rounded-lg tw-border-2 ${
                  q.isComplete
                    ? 'tw-bg-green-50 tw-border-green-200'
                    : 'tw-bg-red-50 tw-border-red-200'
                }`}
              >
                <div className="tw-flex tw-items-center tw-gap-3">
                  {q.isComplete ? (
                    <CheckCircle className="tw-w-5 tw-h-5 tw-text-green-600" />
                  ) : (
                    <AlertCircle className="tw-w-5 tw-h-5 tw-text-red-600" />
                  )}
                  <div>
                    <div className="tw-font-semibold tw-text-sm">
                      Soal #{idx + 1}
                    </div>
                    <div className="tw-text-xs tw-text-gray-600">
                      {q.data.bidang?.label || 'Bidang tidak ditemukan'} →{' '}
                      {q.data.topik?.label || 'Topik tidak ditemukan'} →{' '}
                      {q.data.subTopik?.label || 'Subtopik tidak ditemukan'}
                    </div>
                  </div>
                </div>
                <div className="tw-text-xs">
                  {q.isComplete ? (
                    <span className="tw-text-green-600 tw-font-medium">Lengkap</span>
                  ) : (
                    <span className="tw-text-red-600 tw-font-medium">
                      {q.errors.length} error
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="tw-bg-blue-50 tw-border-2 tw-border-blue-200 tw-rounded-lg tw-p-4">
          <h4 className="tw-text-blue-800 tw-font-semibold tw-mb-2">
            💡 Langkah Selanjutnya
          </h4>
          <ul className="tw-text-blue-700 tw-text-sm tw-space-y-1 tw-list-disc tw-list-inside">
            {hasErrors ? (
              <>
                <li>Anda dapat <strong>retry import</strong> untuk mencoba lagi dengan JSON yang sama</li>
                <li>Atau <strong>lanjutkan dengan soal lengkap</strong> saja (soal tidak lengkap akan diabaikan)</li>
                <li>Soal yang tidak lengkap dapat Anda tambahkan manual atau perbaiki JSON lalu import ulang</li>
              </>
            ) : (
              <>
                <li>Semua soal sudah lengkap dan siap untuk ditambahkan</li>
                <li>Klik <strong>Lanjutkan</strong> untuk menambahkan soal ke form</li>
                <li>Anda masih dapat mengedit setiap soal sebelum submit</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </LearningModal>
  );
};