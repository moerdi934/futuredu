// pages/panel/exam/question_categories/AddCategoryModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import Select from 'react-select';
import { ExamTypeCreateData, GRADE_OPTIONS, KIND_OPTIONS } from '../../../../types/examTypes.types';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface SelectOption {
  value: any;
  label: string;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<ExamTypeCreateData>({
    name: '',
    code: '',
    description: '',
    kind: 1,
    master_id: null,
    mix_master_id: [],
    grade: []
  });

  const [parentOptions, setParentOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMixMaster, setUseMixMaster] = useState(false);

  // Fetch parent options based on kind
  useEffect(() => {
    if (formData.kind > 0) {
      fetchParentOptions();
    }
  }, [formData.kind]);

  const fetchParentOptions = async () => {
    try {
      const parentKind = formData.kind - 1;
      const response = await fetch(`/api/exam-types/by-kind?kind=${parentKind}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch parent options');
      }

      const data = await response.json();
      const options = data.items.map((item: any) => ({
        value: item.id,
        label: `${item.name} (${item.code})`
      }));

      setParentOptions(options);
    } catch (error) {
      console.error('Error fetching parent options:', error);
      setParentOptions([]);
    }
  };

  const handleInputChange = (field: keyof ExamTypeCreateData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleKindChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      kind: value,
      master_id: null,
      mix_master_id: []
    }));
    setUseMixMaster(false);
    setError(null);
  };

  const handleGradeChange = (selectedOptions: any) => {
    const grades = selectedOptions ? selectedOptions.map((opt: SelectOption) => opt.value) : [];
    handleInputChange('grade', grades);
  };

  const handleParentChange = (selectedOption: any) => {
    if (useMixMaster) {
      const ids = selectedOption ? selectedOption.map((opt: SelectOption) => opt.value) : [];
      handleInputChange('mix_master_id', ids);
      handleInputChange('master_id', null);
    } else {
      handleInputChange('master_id', selectedOption ? selectedOption.value : null);
      handleInputChange('mix_master_id', []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Nama kategori harus diisi');
      return;
    }

    if (!formData.code.trim()) {
      setError('Kode kategori harus diisi');
      return;
    }

    if (formData.kind > 0 && !formData.master_id && (!formData.mix_master_id || formData.mix_master_id.length === 0)) {
      setError('Parent kategori harus dipilih');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/exam-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }

      alert('Kategori berhasil ditambahkan!');
      resetForm();
      onSave();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      kind: 1,
      master_id: null,
      mix_master_id: [],
      grade: []
    });
    setUseMixMaster(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const kindLabel = KIND_OPTIONS.find(opt => opt.value === formData.kind)?.label || 'Kategori';
  const requiresParent = formData.kind > 0;

  return (
    <Modal show={isOpen} onHide={handleClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-plus-circle tw-mr-2 tw-text-purple-600"></i>
          Tambah Kategori Soal Baru
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Row>
            {/* Kind Selection */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Jenis Kategori <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={formData.kind}
                  onChange={(e) => handleKindChange(parseInt(e.target.value))}
                  required
                >
                  {KIND_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  {formData.kind === 0 && 'Kategori untuk jenis ujian (bukan soal)'}
                  {formData.kind === 1 && 'Kategori untuk mata pelajaran/bidang studi'}
                  {formData.kind === 2 && 'Kategori untuk topik dalam mata pelajaran'}
                  {formData.kind === 3 && 'Kategori untuk subtopik dalam topik'}
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Code */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Kode Kategori <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Contoh: MAT01, FIS01"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  Kode unik untuk kategori (2-10 karakter)
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            {/* Name */}
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Nama Kategori <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder={`Contoh: Matematika, Fisika, Aljabar, dll.`}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Parent Selection (for kind > 0) */}
          {requiresParent && (
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                    <Form.Label className="tw-mb-0">
                      Parent {KIND_OPTIONS.find(opt => opt.value === formData.kind - 1)?.label || 'Kategori'}{' '}
                      <span className="text-danger">*</span>
                    </Form.Label>
                    {formData.kind === 3 && (
                      <Form.Check
                        type="checkbox"
                        label="Multiple Parents"
                        checked={useMixMaster}
                        onChange={(e) => {
                          setUseMixMaster(e.target.checked);
                          if (!e.target.checked) {
                            handleInputChange('mix_master_id', []);
                          } else {
                            handleInputChange('master_id', null);
                          }
                        }}
                      />
                    )}
                  </div>
                  <Select
                    options={parentOptions}
                    isMulti={useMixMaster}
                    isClearable
                    placeholder={`Pilih ${KIND_OPTIONS.find(opt => opt.value === formData.kind - 1)?.label || 'parent'}...`}
                    onChange={handleParentChange}
                    value={
                      useMixMaster
                        ? parentOptions.filter(opt => formData.mix_master_id?.includes(opt.value))
                        : parentOptions.find(opt => opt.value === formData.master_id)
                    }
                  />
                  <Form.Text className="text-muted">
                    {useMixMaster 
                      ? 'Pilih beberapa parent jika subtopik ini ada di multiple topik'
                      : 'Pilih parent kategori untuk hierarki'
                    }
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* Grade Selection */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Tingkat/Grade</Form.Label>
                <Select
                  options={GRADE_OPTIONS}
                  isMulti
                  isClearable
                  placeholder="Pilih tingkat/grade (kosongkan untuk semua kalangan)..."
                  onChange={handleGradeChange}
                  value={GRADE_OPTIONS.filter(opt => formData.grade?.includes(opt.value))}
                />
                <Form.Text className="text-muted">
                  Pilih satu atau lebih tingkat. Kosongkan untuk "Semua Kalangan"
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Description */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Deskripsi</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Deskripsi singkat tentang kategori ini..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Batal
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm tw-mr-2" />
                Menyimpan...
              </>
            ) : (
              <>
                <i className="fas fa-save tw-mr-2"></i>
                Simpan Kategori
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;