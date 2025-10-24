// pages/panel/exam/question_categories/AddEditExamTypeModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { FaSave, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { ButtonGradient } from '../../../../components/button/ButtonTemplate';
import Select from 'react-select';
import axios from 'axios';

interface ExamType {
  id?: string;
  name: string;
  code: string;
  description?: string;
  kind: number;
  master_id?: string;
  mix_master_id?: string[];
  grade?: number[];
}

interface AddEditExamTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExamType) => void;
  editData?: ExamType | null;
}

const gradeOptions = [
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
  { value: 16, label: 'Beyond S3' },
];

const kindOptions = [
  { value: 0, label: 'Jenis Ujian', description: 'Kategori jenis ujian (bukan jenis soal)' },
  { value: 1, label: 'Pelajaran/Bidang', description: 'Mata pelajaran atau bidang studi' },
  { value: 2, label: 'Topik', description: 'Topik dalam suatu pelajaran' },
  { value: 3, label: 'Subtopik', description: 'Subtopik dalam suatu topik' },
];

const AddEditExamTypeModal: React.FC<AddEditExamTypeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData
}) => {
  const [formData, setFormData] = useState<ExamType>({
    name: '',
    code: '',
    description: '',
    kind: 0,
    master_id: undefined,
    mix_master_id: [],
    grade: []
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [masterOptions, setMasterOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [useMixMaster, setUseMixMaster] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData(editData);
      setUseMixMaster(!!editData.mix_master_id && editData.mix_master_id.length > 0);
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        kind: 0,
        master_id: undefined,
        mix_master_id: [],
        grade: []
      });
      setUseMixMaster(false);
    }
    setErrors({});
  }, [editData, isOpen]);

  // Load master options when kind changes
  useEffect(() => {
    if (formData.kind === 2) {
      // Load Pelajaran (kind=1) for Topik
      loadMasterOptions(1);
    } else if (formData.kind === 3) {
      // Load Topik (kind=2) for Subtopik
      loadMasterOptions(2);
    } else {
      setMasterOptions([]);
    }
  }, [formData.kind]);

  const loadMasterOptions = async (kind: number) => {
    setLoadingMasters(true);
    try {
      const response = await axios.get('/api/exam-types/by-kind', {
        params: { kind }
      });
      const options = response.data.examTypes.map((et: any) => ({
        value: et.id,
        label: `${et.name} (${et.code})`
      }));
      setMasterOptions(options);
    } catch (error) {
      console.error('Error loading master options:', error);
    } finally {
      setLoadingMasters(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'kind' ? parseInt(value) : value
    }));
    
    // Clear master_id when kind changes
    if (name === 'kind') {
      setFormData(prev => ({
        ...prev,
        master_id: undefined,
        mix_master_id: []
      }));
      setUseMixMaster(false);
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGradeChange = (selectedOptions: any) => {
    const grades = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [];
    setFormData(prev => ({ ...prev, grade: grades }));
  };

  const handleMasterChange = (selectedOption: any) => {
    setFormData(prev => ({
      ...prev,
      master_id: selectedOption ? selectedOption.value : undefined
    }));
  };

  const handleMixMasterChange = (selectedOptions: any) => {
    const mixMasterIds = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [];
    setFormData(prev => ({ ...prev, mix_master_id: mixMasterIds }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Kode harus diisi';
    }

    // Validate master requirements
    if (formData.kind === 2 && !formData.master_id) {
      newErrors.master_id = 'Pelajaran/Bidang harus dipilih untuk Topik';
    }

    if (formData.kind === 3) {
      if (!useMixMaster && !formData.master_id) {
        newErrors.master_id = 'Topik harus dipilih untuk Subtopik';
      }
      if (useMixMaster && (!formData.mix_master_id || formData.mix_master_id.length === 0)) {
        newErrors.mix_master_id = 'Minimal satu Topik harus dipilih';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const dataToSave = { ...formData };
      
      // If using mix_master, clear single master_id
      if (useMixMaster && formData.kind === 3) {
        dataToSave.master_id = undefined;
      } else {
        // If not using mix_master, clear mix_master_id
        dataToSave.mix_master_id = [];
      }

      // If grade is empty array, set to null
      if (dataToSave.grade && dataToSave.grade.length === 0) {
        dataToSave.grade = undefined;
      }

      onSave(dataToSave);
    } catch (error: any) {
      console.error('Error saving exam type:', error);
    } finally {
      setLoading(false);
    }
  };

  const getKindLabel = (kind: number) => {
    const option = kindOptions.find(opt => opt.value === kind);
    return option ? option.label : 'Unknown';
  };

  const needsMaster = formData.kind === 2 || formData.kind === 3;
  const canUseMixMaster = formData.kind === 3;

  return (
    <Modal 
      show={isOpen} 
      onHide={onClose} 
      size="lg"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-purple-800 tw-text-white">
        <Modal.Title className="tw-flex tw-items-center tw-gap-2">
          <FaInfoCircle />
          <span>{editData ? 'Edit Kategori Soal' : 'Tambah Kategori Soal'}</span>
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="tw-bg-gray-50">
          {/* Kind Selection */}
          <Form.Group className="tw-mb-4">
            <Form.Label className="tw-font-semibold tw-text-gray-700">
              Jenis Kategori <span className="tw-text-red-500">*</span>
            </Form.Label>
            <Form.Select
              name="kind"
              value={formData.kind}
              onChange={handleChange}
              disabled={!!editData}
              className="tw-border-gray-300 focus:tw-border-purple-500 focus:tw-ring-purple-500"
            >
              {kindOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </Form.Select>
            {editData && (
              <Form.Text className="tw-text-blue-600">
                <FaInfoCircle className="tw-inline tw-mr-1" />
                Jenis kategori tidak dapat diubah saat edit
              </Form.Text>
            )}
          </Form.Group>

          <Row>
            <Col md={6}>
              {/* Name */}
              <Form.Group className="tw-mb-4">
                <Form.Label className="tw-font-semibold tw-text-gray-700">
                  Nama {getKindLabel(formData.kind)} <span className="tw-text-red-500">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  isInvalid={!!errors.name}
                  placeholder={`Masukkan nama ${getKindLabel(formData.kind).toLowerCase()}`}
                  className="tw-border-gray-300 focus:tw-border-purple-500 focus:tw-ring-purple-500"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              {/* Code */}
              <Form.Group className="tw-mb-4">
                <Form.Label className="tw-font-semibold tw-text-gray-700">
                  Kode <span className="tw-text-red-500">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  isInvalid={!!errors.code}
                  placeholder="Contoh: MAT, FIS, BIO"
                  className="tw-border-gray-300 focus:tw-border-purple-500 focus:tw-ring-purple-500"
                  maxLength={10}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.code}
                </Form.Control.Feedback>
                <Form.Text className="tw-text-gray-600">
                  Kode unik untuk identifikasi {getKindLabel(formData.kind).toLowerCase()}
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Master Selection for Hierarchical Types */}
          {needsMaster && (
            <div className="tw-mb-4 tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200">
              {canUseMixMaster && (
                <Form.Check
                  type="checkbox"
                  id="useMixMaster"
                  label="Subtopik ini ada di beberapa topik (gunakan Multiple Master)"
                  checked={useMixMaster}
                  onChange={(e) => {
                    setUseMixMaster(e.target.checked);
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, master_id: undefined }));
                    } else {
                      setFormData(prev => ({ ...prev, mix_master_id: [] }));
                    }
                  }}
                  className="tw-mb-3"
                />
              )}

              {!useMixMaster ? (
                <Form.Group>
                  <Form.Label className="tw-font-semibold tw-text-gray-700">
                    {formData.kind === 2 ? 'Pelajaran/Bidang' : 'Topik'} <span className="tw-text-red-500">*</span>
                  </Form.Label>
                  <Select
                    options={masterOptions}
                    value={masterOptions.find(opt => opt.value === formData.master_id) || null}
                    onChange={handleMasterChange}
                    isLoading={loadingMasters}
                    isDisabled={loadingMasters}
                    placeholder={`Pilih ${formData.kind === 2 ? 'Pelajaran/Bidang' : 'Topik'}...`}
                    noOptionsMessage={() => `Tidak ada ${formData.kind === 2 ? 'pelajaran' : 'topik'} tersedia`}
                    className={errors.master_id ? 'tw-border tw-border-red-500 tw-rounded' : ''}
                  />
                  {errors.master_id && (
                    <div className="tw-text-red-500 tw-text-sm tw-mt-1">{errors.master_id}</div>
                  )}
                </Form.Group>
              ) : (
                <Form.Group>
                  <Form.Label className="tw-font-semibold tw-text-gray-700">
                    Topik <span className="tw-text-red-500">*</span>
                  </Form.Label>
                  <Select
                    options={masterOptions}
                    value={masterOptions.filter(opt => formData.mix_master_id?.includes(opt.value))}
                    onChange={handleMixMasterChange}
                    isLoading={loadingMasters}
                    isDisabled={loadingMasters}
                    isMulti
                    placeholder="Pilih satu atau lebih topik..."
                    noOptionsMessage={() => 'Tidak ada topik tersedia'}
                    className={errors.mix_master_id ? 'tw-border tw-border-red-500 tw-rounded' : ''}
                  />
                  {errors.mix_master_id && (
                    <div className="tw-text-red-500 tw-text-sm tw-mt-1">{errors.mix_master_id}</div>
                  )}
                  <Form.Text className="tw-text-blue-600">
                    <FaInfoCircle className="tw-inline tw-mr-1" />
                    Subtopik ini akan muncul di semua topik yang dipilih
                  </Form.Text>
                </Form.Group>
              )}
            </div>
          )}

          {/* Grade Selection */}
          <Form.Group className="tw-mb-4">
            <Form.Label className="tw-font-semibold tw-text-gray-700">
              Target Grade/Tingkat
            </Form.Label>
            <Select
              options={gradeOptions}
              value={gradeOptions.filter(opt => formData.grade?.includes(opt.value))}
              onChange={handleGradeChange}
              isMulti
              placeholder="Pilih grade (kosongkan untuk semua kalangan)..."
              noOptionsMessage={() => 'Tidak ada grade tersedia'}
            />
            <Form.Text className="tw-text-gray-600">
              Pilih satu atau lebih grade. Kosongkan untuk semua kalangan.
            </Form.Text>
            {formData.grade && formData.grade.length > 0 && (
              <div className="tw-mt-2 tw-flex tw-gap-2 tw-flex-wrap">
                {formData.grade.map(g => (
                  <Badge key={g} bg="info">
                    {gradeOptions.find(opt => opt.value === g)?.label}
                  </Badge>
                ))}
              </div>
            )}
          </Form.Group>

          {/* Description */}
          <Form.Group className="tw-mb-4">
            <Form.Label className="tw-font-semibold tw-text-gray-700">
              Deskripsi
            </Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              placeholder={`Deskripsi ${getKindLabel(formData.kind).toLowerCase()} (opsional)`}
              className="tw-border-gray-300 focus:tw-border-purple-500 focus:tw-ring-purple-500"
            />
          </Form.Group>

          {Object.keys(errors).length > 0 && (
            <Alert variant="danger" className="tw-mb-0">
              <FaInfoCircle className="tw-mr-2" />
              Mohon perbaiki error di atas sebelum menyimpan.
            </Alert>
          )}
        </Modal.Body>

        <Modal.Footer className="tw-bg-gray-100">
          <ButtonGradient
            action="delete"
            customText="Batal"
            customIcon={<FaTimes />}
            onClick={onClose}
            disabled={loading}
            size="md"
            className="tw-min-w-[100px]"
          />
          <ButtonGradient
            action="save"
            customText={editData ? 'Simpan Perubahan' : 'Tambah Kategori'}
            customIcon={<FaSave />}
            type="submit"
            disabled={loading}
            size="md"
            className="tw-min-w-[150px]"
          />
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddEditExamTypeModal;