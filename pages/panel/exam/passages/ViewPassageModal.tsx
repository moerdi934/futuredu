// pages/panel/exam/passages/ViewPassageModal.tsx

import React, { useEffect, useState } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { X, Eye, Calendar, User, FileText, Hash, AlertCircle } from 'lucide-react';
import { processContent } from '../../../../components/supereditor/utils';

interface ViewPassageModalProps {
  isOpen: boolean;
  passageData: any;
  onClose: () => void;
}

const ViewPassageModal: React.FC<ViewPassageModalProps> = ({ 
  isOpen, 
  passageData, 
  onClose 
}) => {
  const [processedContent, setProcessedContent] = useState('');

  useEffect(() => {
    if (passageData?.passage) {
      // Process content to render all SuperEditor tags
      const processed = processContent(passageData.passage);
      setProcessedContent(processed);
    }
  }, [passageData]);

  if (!passageData) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="xl" backdrop="static">
      <Modal.Header closeButton className="tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600 tw-text-white">
        <Modal.Title className="tw-flex tw-items-center tw-gap-2">
          <Eye className="tw-w-5 tw-h-5" />
          Detail Bacaan
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="tw-max-h-[75vh] tw-overflow-y-auto">
        <div className="tw-space-y-6">
          {/* Basic Information Card */}
          <div className="tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-border-2 tw-border-blue-200 tw-rounded-xl tw-p-6">
            <h5 className="tw-text-blue-800 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <FileText className="tw-w-5 tw-h-5" />
              Informasi Bacaan
            </h5>
            
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              {/* ID */}
              <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-blue-100">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-600 tw-text-sm tw-mb-1">
                  <Hash className="tw-w-4 tw-h-4" />
                  <span className="tw-font-medium">ID Bacaan</span>
                </div>
                <div className="tw-text-xl tw-font-bold tw-text-blue-700">
                  #{passageData.id}
                </div>
              </div>

              {/* Usage Count */}
              <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-blue-100">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-600 tw-text-sm tw-mb-1">
                  <AlertCircle className="tw-w-4 tw-h-4" />
                  <span className="tw-font-medium">Digunakan di</span>
                </div>
                <div className="tw-text-xl tw-font-bold tw-text-blue-700">
                  {passageData.usage_count || 0} Soal
                </div>
              </div>

              {/* Title */}
              <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-blue-100 md:tw-col-span-2">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-600 tw-text-sm tw-mb-2">
                  <FileText className="tw-w-4 tw-h-4" />
                  <span className="tw-font-medium">Judul Bacaan</span>
                </div>
                <div className="tw-text-lg tw-font-bold tw-text-gray-800">
                  {passageData.title}
                </div>
              </div>
            </div>
          </div>

          {/* Creator & Editor Information */}
          <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-pink-50 tw-border-2 tw-border-purple-200 tw-rounded-xl tw-p-6">
            <h5 className="tw-text-purple-800 tw-font-bold tw-mb-4 tw-flex tw-items-center tw-gap-2">
              <User className="tw-w-5 tw-h-5" />
              Riwayat Perubahan
            </h5>
            
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              {/* Creator */}
              <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-purple-100">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3">
                  <Badge bg="success" className="tw-flex tw-items-center tw-gap-1">
                    <User className="tw-w-3 tw-h-3" />
                    Pembuat
                  </Badge>
                </div>
                <div className="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-2">
                  {passageData.creator || 'Unknown'}
                </div>
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-gray-600">
                  <Calendar className="tw-w-4 tw-h-4" />
                  <span>{formatDate(passageData.create_date)}</span>
                </div>
              </div>

              {/* Editor */}
              {passageData.editor && passageData.update_date && (
                <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-purple-100">
                  <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3">
                    <Badge bg="warning" className="tw-flex tw-items-center tw-gap-1">
                      <User className="tw-w-3 tw-h-3" />
                      Editor Terakhir
                    </Badge>
                  </div>
                  <div className="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-2">
                    {passageData.editor}
                  </div>
                  <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-gray-600">
                    <Calendar className="tw-w-4 tw-h-4" />
                    <span>{formatDate(passageData.update_date)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Content */}
          <div className="tw-bg-white tw-border-2 tw-border-blue-300 tw-rounded-xl tw-overflow-hidden tw-shadow-lg">
            <div className="tw-bg-gradient-to-r tw-from-blue-600 tw-to-indigo-600 tw-text-white tw-px-6 tw-py-4 tw-flex tw-items-center tw-gap-3">
              <Eye className="tw-w-6 tw-h-6" />
              <div>
                <h5 className="tw-font-bold tw-text-lg tw-m-0">Preview Konten Bacaan</h5>
                <p className="tw-text-sm tw-text-blue-100 tw-m-0">Tampilan final dengan semua formatting</p>
              </div>
            </div>
            <div 
              className="tw-p-8 tw-bg-gray-50 tw-max-h-[500px] tw-overflow-y-auto practice-content-area"
              dangerouslySetInnerHTML={{ __html: processedContent }}
              style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#1F2937'
              }}
            />
          </div>

          {/* Usage Warning if applicable */}
          {passageData.usage_count > 0 && (
            <div className="tw-bg-yellow-50 tw-border-2 tw-border-yellow-300 tw-rounded-lg tw-p-4">
              <div className="tw-flex tw-items-start tw-gap-3">
                <AlertCircle className="tw-w-5 tw-h-5 tw-text-yellow-600 tw-flex-shrink-0 tw-mt-0.5" />
                <div>
                  <p className="tw-text-yellow-800 tw-font-medium tw-mb-1">
                    ⚠️ Bacaan Sedang Digunakan
                  </p>
                  <p className="tw-text-yellow-700 tw-text-sm">
                    Bacaan ini saat ini digunakan oleh <strong>{passageData.usage_count} soal</strong>. 
                    Perubahan atau penghapusan akan mempengaruhi soal-soal tersebut.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="tw-bg-gray-50">
        <Button variant="secondary" onClick={onClose}>
          <X className="tw-w-4 tw-h-4 tw-inline tw-mr-2" />
          Tutup
        </Button>
      </Modal.Footer>

      {/* SuperEditor Styles for Preview */}
      <style jsx global>{`
        /* Practice Content Area Styles */
        .practice-content-area {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
        }

        /* Headings */
        .practice-content-area .cte-heading {
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .practice-content-area .cte-heading-1 { font-size: 2rem; color: #7C3AED; }
        .practice-content-area .cte-heading-2 { font-size: 1.75rem; color: #8B5CF6; }
        .practice-content-area .cte-heading-3 { font-size: 1.5rem; color: #9333EA; }
        .practice-content-area .cte-heading-4 { font-size: 1.25rem; color: #A855F7; }
        .practice-content-area .cte-heading-5 { font-size: 1.125rem; color: #C084FC; }
        .practice-content-area .cte-heading-6 { font-size: 1rem; color: #D8B4FE; }

        /* Key Concepts */
        .practice-content-area .cte-key-concept {
          padding: 1.25rem;
          margin: 1.5rem 0;
          border-radius: 12px;
          border-left: 4px solid;
        }

        /* Styled Lists */
        .practice-content-area .cte-styled-list-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.75rem;
          padding-left: 0.5rem;
        }

        .practice-content-area .cte-styled-list-icon {
          margin-right: 0.75rem;
          margin-top: 0.25rem;
          flex-shrink: 0;
        }

        /* Tables */
        .practice-content-area .cte-table-container {
          margin: 1.5rem 0;
          overflow-x: auto;
        }

        .practice-content-area .cte-table {
          width: 100%;
          border-collapse: collapse;
        }

        .practice-content-area .cte-table td,
        .practice-content-area .cte-table th {
          padding: 0.75rem;
          border: 1px solid #E5E7EB;
        }

        .practice-content-area .cte-table th {
          background-color: #F3F4F6;
          font-weight: 600;
        }

        .practice-content-area .cte-table-striped tbody tr:nth-child(odd) {
          background-color: #F9FAFB;
        }

        /* Code Blocks */
        .practice-content-area .cte-code-block-container {
          margin: 1.5rem 0;
          border-radius: 8px;
          overflow: hidden;
        }

        .practice-content-area .cte-code-block-header {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .practice-content-area .cte-code-block {
          padding: 1rem;
          overflow-x: auto;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        /* Equations */
        .practice-content-area .cte-katex-equation {
          display: inline-block;
          margin: 0.25rem 0;
        }

        .practice-content-area .cte-katex-block {
          display: block;
          text-align: center;
          margin: 1.5rem 0;
          padding: 1rem;
          background-color: #F9FAFB;
          border-radius: 8px;
        }

        /* Card Grids */
        .practice-content-area .cte-card-grid-container {
          margin: 1.5rem 0;
        }

        .practice-content-area .cte-card-grid {
          display: grid;
          gap: 1rem;
        }

        .practice-content-area .cte-card-grid-item {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .practice-content-area .cte-card-header {
          padding: 1rem;
          font-weight: 600;
        }

        .practice-content-area .cte-card-content {
          padding: 1rem;
        }

        /* Images */
        .practice-content-area img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }

        /* Links */
        .practice-content-area a {
          color: #8B5CF6;
          text-decoration: underline;
        }

        .practice-content-area a:hover {
          color: #7C3AED;
        }

        /* General spacing */
        .practice-content-area p {
          margin-bottom: 1rem;
        }

        .practice-content-area ul,
        .practice-content-area ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .practice-content-area li {
          margin-bottom: 0.5rem;
        }

        /* KaTeX fonts */
        .katex { font-size: 1.1em; }
        .katex-display { margin: 1em 0; }
      `}</style>
    </Modal>
  );
};

export default ViewPassageModal;
