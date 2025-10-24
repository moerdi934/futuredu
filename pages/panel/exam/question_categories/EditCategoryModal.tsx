// pages/panel/exam/question_categories/EditCategoryModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import Select from 'react-select';
import { ExamType, ExamTypeUpdateData, GRADE_OPTIONS, KIND_OPTIONS } from '../../../../types/examTypes.types';

interface EditCategoryModalProps {
  isOpen: boolean;
  category: ExamType;
  onClose: () => void;
  onSave: () => void;
}

interface SelectOption {
  value: any;
  label: string;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ 
  isOpen, 
  category, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<ExamTypeUpdateData>({
    name: category.name,
    code: category.code,
    description: category.description,
    kind: category.kind,
    master_id: category.master_id,
    mix_master_id: category.mix_master_id || [],
    grade: category.grade || []
  });

  const [parentOptions, setParentOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMixMaster, setUseMixMaster] = useState(
    category.mix_master_id && category.mix_master_id.length > 0
  );

  // Initialize form data when category changes
  useEffect(() => {
    setFormData({
      name: category.name,
      code: category.code,
      description: category.description,
      kind: category.kind,
      master_id: category.master_id,
      mix_master_id: category.mix_master_id || [],
      grade: category.grade || []
    });
    setUseMixMaster(category.mix_master_id && category.mix_master_id.length > 0);
  }, [category]);

  // Fetch parent options based on kind
  useEffect(() => {
    if (formData.kind && formData.kind > 0) {
      fetchParentOptions();
    }
  }, [formData.kind]);

  const fetchParentOptions = async () => {
    try {
      const parentKind = (formData.kind || 1) - 1;
      const response = await fetch(`/api/exam-types/by-kind?kind=${parentKind}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch parent options');
      }

      const data = await response.json();
      const options = data.items
        .filter((item: any) => item.id !== category.id) // Exclude self
        .map((item: any) => ({
          value: item.id,
          label: `${item.name} (${item.code})`
        }));

      setParentOptions(options);
    } catch (error) {
      console.error('Error fetching parent options:', error);
      setParentOptions([]);
    }
  };

  const handleInputChange = (field: keyof ExamTypeUpdateData, value: any) => {
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
    if (!formData.name?.trim()) {
      setError('Nama kategori harus diisi');
      return;
    }

    if (!formData.code?.trim()) {
      setError('Kode kategori harus diisi');
      return;
    }

    if (formData.kind && formData.kind > 0 && !formData.master_id && (!formData.mix_master_id || formData.mix_master_id.length === 0)) {
      setError('Parent kategori harus dipilih');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/exam-types/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }

      alert('Kategori berhasil diperbarui!');
      onSave();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const requiresParent = formData.kind && formData.kind > 0;

  return (
    <Modal show={isOpen} onHide={handleClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-edit tw-mr-2 tw-text-orange-600"></i>
          Edit Kategori Soal
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
                  placeholder="Contoh: Matematika, Fisika, Aljabar, dll."
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
                      Parent {KIND_OPTIONS.find(opt => opt.value === (formData.kind || 1) - 1)?.label || 'Kategori'}{' '}
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
                    placeholder={`Pilih ${KIND_OPTIONS.find(opt => opt.value === (formData.kind || 1) - 1)?.label || 'parent'}...`}
                    onChange={handleParentChange}
                    value={
                      useMixMaster
                        ? parentOptions.filter(opt => formData.mix_master_id?.includes(opt.value))
                        : parentOptions.find(opt => opt.value === formData.master_id) || null
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

          {/* Info Box */}
          <Alert variant="info" className="tw-text-sm">
            <i className="fas fa-info-circle tw-mr-2"></i>
            <strong>Info:</strong> ID Kategori: {category.id} • Dibuat: {new Date(category.create_date || '').toLocaleDateString('id-ID')}
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Batal
          </Button>
          <Button variant="warning" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm tw-mr-2" />
                Menyimpan...
              </>
            ) : (
              <>
                <i className="fas fa-save tw-mr-2"></i>
                Update Kategori
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditCategoryModal;