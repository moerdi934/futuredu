// pages/panel/exam/passages/AddPassageModal.tsx

import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FileJson, Save, X, FileText, Upload, Eye } from 'lucide-react';
import SuperEditor from '../../../../components/supereditor/SuperEditor';
import { processContent } from '../../../../components/supereditor/utils';
import { ShortFormField } from '../../../../components/form/FormComponentLayout';
import { ButtonGradient } from '../../../../components/button/ButtonTemplate';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';

interface AddPassageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const AddPassageModal: React.FC<AddPassageModalProps> = ({ isOpen, onClose, onSave }) => {
  const { id: userId } = useAuth();
  const [title, setTitle] = useState('');
  const [passage, setPassage] = useState('<p>Mulai mengetik bacaan di sini...</p>');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // JSON Import Mode
  const [importMode, setImportMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Judul bacaan tidak boleh kosong!');
      return;
    }

    if (!passage.trim() || passage === '<p>Mulai mengetik bacaan di sini...</p>') {
      alert('Isi bacaan tidak boleh kosong!');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/passage`,
        {
          title,
          passage,
          create_user_id: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      alert('Bacaan berhasil ditambahkan!');
      handleClose();
      onSave();
    } catch (error: any) {
      console.error('Error creating passage:', error);
      alert(`Gagal membuat bacaan: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportJson = () => {
    try {
      setImportError('');
      
      if (!jsonInput.trim()) {
        setImportError('JSON input tidak boleh kosong!');
        return;
      }

      const parsedData = JSON.parse(jsonInput);

      if (!parsedData.passageTitle && !parsedData.title) {
        setImportError('Format JSON harus memiliki "passageTitle" atau "title"');
        return;
      }

      if (!parsedData.passageText && !parsedData.passage) {
        setImportError('Format JSON harus memiliki "passageText" atau "passage"');
        return;
      }

      const importedTitle = parsedData.passageTitle || parsedData.title;
      const importedContent = parsedData.passageText || parsedData.passage;
      
      // Process content to handle any special tags
      const processedContent = processContent(importedContent);

      setTitle(importedTitle);
      setPassage(processedContent);
      setImportMode(false);
      setJsonInput('');
      setShowPreview(false);
      setPreviewContent('');
      
      alert('Data berhasil diimport! Silakan review dan klik "Simpan".');
    } catch (error: any) {
      setImportError(`Error: ${error.message || 'Format JSON tidak valid'}`);
    }
  };

  const handlePreview = () => {
    try {
      setImportError('');
      
      if (!jsonInput.trim()) {
        setImportError('JSON input tidak boleh kosong!');
        return;
      }

      const parsedData = JSON.parse(jsonInput);

      if (!parsedData.passageTitle && !parsedData.title) {
        setImportError('Format JSON harus memiliki "passageTitle" atau "title"');
        return;
      }

      if (!parsedData.passageText && !parsedData.passage) {
        setImportError('Format JSON harus memiliki "passageText" atau "passage"');
        return;
      }

      const importedContent = parsedData.passageText || parsedData.passage;
      
      // Process content to parse all SuperEditor tags
      const processedContent = processContent(importedContent);

      setPreviewContent(processedContent);
      setShowPreview(true);
    } catch (error: any) {
      setImportError(`Error: ${error.message || 'Format JSON tidak valid'}`);
      setShowPreview(false);
    }
  };

  const handleExportJson = () => {
    const exportData = {
      passageTitle: title,
      passageText: passage,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `passage_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('Data bacaan berhasil diexport!');
  };

  const handleClose = () => {
    setTitle('');
    setPassage('<p>Mulai mengetik bacaan di sini...</p>');
    setImportMode(false);
    setJsonInput('');
    setImportError('');
    setShowPreview(false);
    setPreviewContent('');
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={handleClose} size="xl" backdrop="static">
      <Modal.Header closeButton className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-text-white">
        <Modal.Title className="tw-flex tw-items-center tw-gap-2">
          <FileText className="tw-w-5 tw-h-5" />
          Tambah Bacaan Baru
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="tw-max-h-[70vh] tw-overflow-y-auto">
        <div className="tw-space-y-4">
          {/* Import/Manual Toggle */}
          <div className="tw-flex tw-gap-3 tw-mb-4">
            <div className="tw-flex-1">
              <ButtonGradient
                action={!importMode ? 'apply' : 'custom'}
                customText="Input Manual"
                customIcon={<FileText className="tw-w-4 tw-h-4" />}
                onClick={() => setImportMode(false)}
                size="md"
                className="tw-w-full"
              />
            </div>
            <div className="tw-flex-1">
              <ButtonGradient
                action={importMode ? 'apply' : 'custom'}
                customText="Import JSON"
                customIcon={<FileJson className="tw-w-4 tw-h-4" />}
                onClick={() => setImportMode(true)}
                size="md"
                className="tw-w-full"
              />
            </div>
          </div>

          {!importMode ? (
            <>
              {/* Manual Input Mode */}
              <ShortFormField
                label="Judul Bacaan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div>
                <label className="tw-text-purple-700 tw-font-semibold tw-mb-2 tw-block">
                  Isi Bacaan <span className="tw-text-red-500">*</span>
                </label>
                <div className="tw-border-2 tw-border-purple-200 tw-rounded-lg tw-overflow-hidden">
                  <SuperEditor
                    onChange={(html) => setPassage(html)}
                    initialValue={passage}
                    editorId="add-passage-editor"
                    height="400px"
                  />
                </div>
              </div>

              {/* Export Button */}
              <div className="tw-flex tw-justify-end">
                <ButtonGradient
                  action="custom"
                  customText="Export JSON"
                  customIcon={<FileJson className="tw-w-4 tw-h-4" />}
                  customColors={{
                    primary: '#10B981',
                    secondary: '#059669',
                    gradient1: '#10B981',
                    gradient2: '#34D399',
                    text: '#FFFFFF'
                  }}
                  onClick={handleExportJson}
                  size="md"
                  disabled={!title.trim() || !passage.trim()}
                />
              </div>
            </>
          ) : (
            <>
              {/* JSON Import Mode */}
              <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-indigo-50 tw-border-2 tw-border-purple-200 tw-rounded-lg tw-p-4 tw-mb-4">
                <h5 className="tw-text-purple-800 tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-gap-2">
                  <FileJson className="tw-w-5 tw-h-5" />
                  Format JSON
                </h5>
                <pre className="tw-bg-white tw-p-3 tw-rounded tw-text-sm tw-overflow-x-auto">
{`{
  "passageTitle": "Judul Bacaan",
  "passageText": "<p>Isi bacaan...</p>"
}`}
                </pre>
                <p className="tw-text-sm tw-text-gray-600 tw-mt-2">
                  Atau gunakan format alternatif: &quot;title&quot; dan &quot;passage&quot;
                </p>
              </div>

              <div>
                <label className="tw-text-purple-700 tw-font-semibold tw-mb-2 tw-block">
                  Paste JSON Data
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setImportError('');
                    setShowPreview(false);
                  }}
                  className="tw-w-full tw-h-64 tw-p-3 tw-border-2 tw-border-purple-300 tw-rounded-lg tw-font-mono tw-text-sm focus:tw-border-purple-500 focus:tw-outline-none"
                  placeholder='Paste JSON di sini...'
                />
              </div>

              {importError && (
                <div className="tw-bg-red-50 tw-border-2 tw-border-red-300 tw-rounded-lg tw-p-3">
                  <p className="tw-text-red-700 tw-text-sm tw-font-medium">{importError}</p>
                </div>
              )}

              {/* Preview Section */}
              {showPreview && previewContent && (
                <div className="tw-bg-white tw-border-2 tw-border-purple-300 tw-rounded-lg tw-overflow-hidden">
                  <div className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-text-white tw-px-4 tw-py-2 tw-flex tw-items-center tw-gap-2">
                    <Eye className="tw-w-5 tw-h-5" />
                    <span className="tw-font-semibold">Preview Konten</span>
                  </div>
                  <div 
                    className="tw-p-6 tw-max-h-96 tw-overflow-y-auto practice-content-area"
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                    style={{
                      fontSize: '16px',
                      lineHeight: '1.6',
                      color: '#374151'
                    }}
                  />
                </div>
              )}

              <div className="tw-flex tw-gap-3 tw-justify-end">
                <ButtonGradient
                  action="custom"
                  customText="Preview"
                  customIcon={<Eye className="tw-w-4 tw-h-4" />}
                  customColors={{
                    primary: '#8B5CF6',
                    secondary: '#7C3AED',
                    gradient1: '#8B5CF6',
                    gradient2: '#A78BFA',
                    text: '#FFFFFF'
                  }}
                  onClick={handlePreview}
                  size="md"
                  disabled={!jsonInput.trim()}
                />
                <ButtonGradient
                  action="apply"
                  customText="Import"
                  customIcon={<Upload className="tw-w-4 tw-h-4" />}
                  onClick={handleImportJson}
                  size="md"
                  disabled={!jsonInput.trim()}
                />
              </div>
            </>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="tw-bg-gray-50">
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          <X className="tw-w-4 tw-h-4 tw-inline tw-mr-2" />
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim() || !passage.trim()}
        >
          <Save className="tw-w-4 tw-h-4 tw-inline tw-mr-2" />
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
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

export default AddPassageModal;
