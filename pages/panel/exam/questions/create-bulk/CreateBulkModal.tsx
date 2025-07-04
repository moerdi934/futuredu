'use client';

import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import { Download, X, Plus, List } from 'lucide-react';

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
  data,
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

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg"
      centered
      backdrop="static"
      className="tw-font-sans"
    >
      <div className="tw-bg-white tw-rounded-lg tw-shadow-2xl tw-border-0 tw-overflow-hidden">
        <Modal.Header className="tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-600 tw-text-white tw-border-0 tw-py-4">
          <div className="tw-flex tw-items-center tw-space-x-3">
            <List className="tw-w-6 tw-h-6" />
            <Modal.Title className="tw-text-xl tw-font-bold">
              Soal Berhasil Dibuat!
            </Modal.Title>
          </div>
          <Button
            variant="light"
            className="tw-bg-white/20 tw-border-white/30 tw-text-white hover:tw-bg-white/30"
            onClick={onHide}
          >
            <X className="tw-w-4 tw-h-4" />
          </Button>
        </Modal.Header>
        
        <Modal.Body className="tw-p-6 tw-max-h-[60vh] tw-overflow-y-auto">
          <div className="tw-bg-emerald-50 tw-rounded-lg tw-p-4 tw-mb-5">
            <p className="tw-text-emerald-700 tw-font-medium">
              Berhasil membuat <span className="tw-font-bold">{data.length} soal</span>. 
              Detail soal yang dibuat:
            </p>
          </div>
          
          <Table striped bordered hover className="tw-rounded-lg tw-overflow-hidden">
            <thead className="tw-bg-purple-100">
              <tr>
                <th className="tw-font-semibold tw-text-purple-800">Kode Soal</th>
                <th className="tw-font-semibold tw-text-purple-800">Tipe Soal</th>
                <th className="tw-font-semibold tw-text-purple-800">Level</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="tw-font-mono">{item.code}</td>
                  <td>{getQuestionTypeLabel(item.question_type)}</td>
                  <td className="tw-text-center">{item.level}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        
        <Modal.Footer className="tw-bg-gray-50 tw-border-0 tw-p-6">
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 tw-w-full">
            <Button
              variant="outline-secondary"
              onClick={onReset}
              className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-space-x-2 tw-border-2 tw-border-gray-300 tw-text-gray-600 hover:tw-bg-gray-100"
            >
              <Plus className="tw-w-4 tw-h-4" />
              <span>Buat Ulang</span>
            </Button>
            
            <Button
              variant="outline-primary"
              onClick={onExport}
              className="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-space-x-2 tw-border-2 tw-border-blue-300 tw-text-blue-600 hover:tw-bg-blue-50"
            >
              <Download className="tw-w-4 tw-h-4" />
              <span>Export CSV</span>
            </Button>
            
            <Button
              onClick={onNavigate}
              className="tw-flex-1 tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-border-0 tw-text-white hover:tw-from-purple-700 hover:tw-to-indigo-700"
            >
              Ke Daftar Soal
            </Button>
          </div>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default CreateBulkModal;