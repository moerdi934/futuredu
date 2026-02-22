// pages/panel/exam/passages/EditPassageModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FileJson, Save, X, FileText, Upload, Download } from 'lucide-react';
import SuperEditor from '../../../../components/supereditor/SuperEditor';
import { processContent } from '../../../../components/supereditor/utils';
import { ShortFormField } from '../../../../components/form/FormComponentLayout';
import { ButtonGradient } from '../../../../components/button/ButtonTemplate';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';

interface EditPassageModalProps {
  isOpen: boolean;
  passageData: any;
  onClose: () => void;
  onSave: () => void;
}

const EditPassageModal: React.FC<EditPassageModalProps> = ({ 
  isOpen, 
  passageData, 
  onClose, 
  onSave 
}) => {
  const { id: userId } = useAuth();
  const [title, setTitle] = useState('');
  const [passage, setPassage] = useState('<p>Mulai mengetik bacaan di sini...</p>');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // JSON Import Mode
  const [importMode, setImportMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState('');

  // Populate form when passageData changes
  useEffect(() => {
    if (passageData && isOpen) {
      setTitle(passageData.title || '');
      setPassage(passageData.passage || '<p>Mulai mengetik bacaan di sini...</p>');
      setImportMode(false);
      setJsonInput('');
      setImportError('');
    }
  }, [passageData, isOpen]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Judul bacaan tidak boleh kosong!');
      return;
    }

    if (!passage.trim() || passage === '<p>Mulai mengetik bacaan di sini...</p>') {
      alert('Isi bacaan tidak boleh kosong!');
      return;
    }

    if (!passageData?.id) {
      alert('ID bacaan tidak valid!');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/passage/${passageData.id}`,
        {
          title,
          passage,
          update_user_id: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      alert('Bacaan berhasil diupdate!');
      handleClose();
      onSave();
    } catch (error: any) {
      console.error('Error updating passage:', error);
      alert(`Gagal mengupdate bacaan: ${error.response?.data?.error || error.message}`);
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
      
      alert('Data berhasil diimport! Silakan review dan klik "Simpan".');
    } catch (error: any) {
      setImportError(`Error: ${error.message || 'Format JSON tidak valid'}`);
    }
  };

  const handleExportJson = () => {
    const exportData = {
      id: passageData?.id,
      passageTitle: title,
      passageText: passage,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `passage_${passageData?.id || Date.now()}.json`;
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
    onClose();
  };

  if (!passageData) return null;

  return (
    <Modal show={isOpen} onHide={handleClose} size="xl" backdrop="static">
      <Modal.Header closeButton className="tw-bg-gradient-to-r tw-from-orange-600 tw-to-red-600 tw-text-white">
        <Modal.Title className="tw-flex tw-items-center tw-gap-2">
          <FileText className="tw-w-5 tw-h-5" />
          Edit Bacaan (ID: {passageData.id})
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="tw-max-h-[70vh] tw-overflow-y-auto">
        <div className="tw-space-y-4">
          {/* Usage Warning */}
          {passageData.usage_count > 0 && (
            <div className="tw-bg-yellow-50 tw-border-2 tw-border-yellow-300 tw-rounded-lg tw-p-4">
              <p className="tw-text-yellow-800 tw-font-medium">
                ⚠️ Perhatian: Bacaan ini digunakan oleh {passageData.usage_count} soal. 
                Perubahan akan mempengaruhi semua soal yang menggunakan bacaan ini.
              </p>
            </div>
          )}

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
                <label className="tw-text-orange-700 tw-font-semibold tw-mb-2 tw-block">
                  Isi Bacaan <span className="tw-text-red-500">*</span>
                </label>
                <div className="tw-border-2 tw-border-orange-200 tw-rounded-lg tw-overflow-hidden">
                  <SuperEditor
                    onChange={(html) => setPassage(html)}
                    initialValue={passage}
                    editorId={`edit-passage-editor-${passageData.id}`}
                    height="400px"
                  />
                </div>
              </div>

              {/* Export Button */}
              <div className="tw-flex tw-justify-end">
                <ButtonGradient
                  action="custom"
                  customText="Export JSON"
                  customIcon={<Download className="tw-w-4 tw-h-4" />}
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
              <div className="tw-bg-gradient-to-r tw-from-orange-50 tw-to-red-50 tw-border-2 tw-border-orange-200 tw-rounded-lg tw-p-4 tw-mb-4">
                <h5 className="tw-text-orange-800 tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-gap-2">
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
                <label className="tw-text-orange-700 tw-font-semibold tw-mb-2 tw-block">
                  Paste JSON Data
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setImportError('');
                  }}
                  className="tw-w-full tw-h-64 tw-p-3 tw-border-2 tw-border-orange-300 tw-rounded-lg tw-font-mono tw-text-sm focus:tw-border-orange-500 focus:tw-outline-none"
                  placeholder='Paste JSON di sini...'
                />
              </div>

              {importError && (
                <div className="tw-bg-red-50 tw-border-2 tw-border-red-300 tw-rounded-lg tw-p-3">
                  <p className="tw-text-red-700 tw-text-sm tw-font-medium">{importError}</p>
                </div>
              )}

              <div className="tw-flex tw-justify-end">
                <ButtonGradient
                  action="apply"
                  customText="Import"
                  customIcon={<Upload className="tw-w-4 tw-h-4" />}
                  onClick={handleImportJson}
                  size="md"
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
          variant="warning"
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim() || !passage.trim()}
        >
          <Save className="tw-w-4 tw-h-4 tw-inline tw-mr-2" />
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPassageModal;
