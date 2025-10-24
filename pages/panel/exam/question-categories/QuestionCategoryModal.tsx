// pages/panel/exam/question-categories/QuestionCategoryModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Badge, Alert } from 'react-bootstrap';
import { FaSave, FaTimes, FaInfoCircle } from 'react-icons/fa';
import Select from 'react-select';

interface QuestionCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  category?: any;
}

const QuestionCategoryModal: React.FC<QuestionCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    kind: 1,
    master_id: null as string | null,
    mix_master_id: [] as string[],
    grade: [] as number[]
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Options state
  const [bidangStudiOptions, setBidangStudiOptions] = useState<any[]>([]);
  const [topikOptions, setTopikOptions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Grade options
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
    { value: 16, label: 'Beyond S3' }
  ];

  // Load parent options based on kind
  useEffect(() => {
    if (isOpen) {
      if (formData.kind === 2) {
        loadBidangStudi();
      } else if (formData.kind === 3) {
        loadTopik();
      }
    }
  }, [isOpen, formData.kind]);

  const loadBidangStudi = async () => {
    setLoadingOptions(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/exam-types/kind-options?kind=1', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBidangStudiOptions(data.map((item: any) => ({
          value: item.id,
          label: `${item.code} - ${item.name}`
        })));
      }
    } catch (error) {
      console.error('Error loading bidang studi:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadTopik = async () => {
    setLoadingOptions(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/exam-types/kind-options?kind=2', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTopikOptions(data.map((item: any) => ({
          value: item.id,
          label: `${item.code} - ${item.name}`
        })));
      }
    } catch (error) {
      console.error('Error loading topik:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        code: category.code || '',
        description: category.description || '',
        kind: category.kind || 1,
        master_id: category.master_id || null,
        mix_master_id: category.mix_master_id || [],
        grade: category.grade || []
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        kind: 1,
        master_id: null,
        mix_master_id: [],
        grade: []
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Reset parent selections when kind changes
      if (field === 'kind') {
        updated.master_id = null;
        updated.mix_master_id = [];
      }
      
      return updated;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleGrade = (gradeValue: number) => {
    setFormData(prev => {
      const currentGrades = prev.grade || [];
      if (currentGrades.includes(gradeValue)) {
        return { ...prev, grade: currentGrades.filter(g => g !== gradeValue) };
      } else {
        return { ...prev, grade: [...currentGrades, gradeValue].sort((a, b) => a - b) };
      }
    });
  };

  const selectAllGrades = () => {
    setFormData(prev => ({
      ...prev,
      grade: gradeOptions.map(g => g.value)
    }));
  };

  const clearAllGrades = () => {
    setFormData(prev => ({ ...prev, grade: [] }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama kategori wajib diisi';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Kode wajib diisi';
    } else if (formData.code.length > 10) {
      newErrors.code = 'Kode maksimal 10 karakter';
    }

    // Validate master_id for kind 2 and 3
    if (formData.kind === 2 && !formData.master_id) {
      newErrors.master_id = 'Topik harus memiliki Bidang Studi';
    }

    if (formData.kind === 3 && !formData.master_id && formData.mix_master_id.length === 0) {
      newErrors.master_id = 'Subtopik harus memiliki minimal satu Topik';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = category 
        ? `/api/exam-types/${category.id}`
        : '/api/exam-types';
      
      const method = category ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        grade: formData.grade.length > 0 ? formData.grade : null,
        mix_master_id: formData.mix_master_id.length > 0 ? formData.mix_master_id : null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(category ? 'Kategori soal berhasil diupdate' : 'Kategori soal berhasil ditambahkan');
        onSave();
      } else {
        const error = await response.json();
        alert(`Gagal menyimpan: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving question category:', error);
      alert('Terjadi kesalahan saat menyimpan kategori soal');
    } finally {
      setLoading(false);
    }
  };

  const getKindLabel = (kind: number) => {
    const labels: Record<number, string> = {
      1: 'Bidang Studi',
      2: 'Topik',
      3: 'Subtopik'
    };
    return labels[kind];
  };

  const renderParentSelection = () => {
    if (formData.kind === 1) {
      return (
        <Alert variant="info">
          <FaInfoCircle className="me-2" />
          Bidang Studi adalah level tertinggi dan tidak memiliki parent.
        </Alert>
      );
    }

    if (formData.kind === 2) {
      return (
        <Form.Group className="mb-3">
          <Form.Label>
            Bidang Studi <span className="text-danger">*</span>
          </Form.Label>
          <Select
            value={bidangStudiOptions.find(opt => opt.value === formData.master_id)}
            onChange={(option) => handleChange('master_id', option?.value || null)}
            options={bidangStudiOptions}
            isClearable
            isLoading={loadingOptions}
            placeholder="Pilih Bidang Studi"
            noOptionsMessage={() => "Tidak ada bidang studi"}
          />
          {errors.master_id && (
            <div className="text-danger small mt-1">{errors.master_id}</div>
          )}
        </Form.Group>
      );
    }

    if (formData.kind === 3) {
      return (
        <>
          <Form.Group className="mb-3">
            <Form.Label>
              Topik Utama <span className="text-danger">*</span>
            </Form.Label>
            <Select
              value={topikOptions.find(opt => opt.value === formData.master_id)}
              onChange={(option) => handleChange('master_id', option?.value || null)}
              options={topikOptions}
              isClearable
              isLoading={loadingOptions}
              placeholder="Pilih Topik Utama"
              noOptionsMessage={() => "Tidak ada topik"}
            />
            {errors.master_id && (
              <div className="text-danger small mt-1">{errors.master_id}</div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Topik Tambahan (Opsional)
              <small className="text-muted ms-2">
                Untuk subtopik yang ada di beberapa topik
              </small>
            </Form.Label>
            <Select
              isMulti
              value={topikOptions.filter(opt => formData.mix_master_id.includes(opt.value))}
              onChange={(options) => {
                const values = options ? options.map(opt => opt.value) : [];
                handleChange('mix_master_id', values);
              }}
              options={topikOptions.filter(opt => opt.value !== formData.master_id)}
              isLoading={loadingOptions}
              placeholder="Pilih topik tambahan"
              noOptionsMessage={() => "Tidak ada topik"}
            />
          </Form.Group>
        </>
      );
    }

    return null;
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {category ? 'Edit Kategori Soal' : 'Tambah Kategori Soal Baru'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Level Kategori <span className="text-danger">*</span>
            </Form.Label>
            <div className="d-flex gap-2">
              {[1, 2, 3].map(kind => (
                <Form.Check
                  key={kind}
                  type="radio"
                  id={`kind-${kind}`}
                  label={getKindLabel(kind)}
                  checked={formData.kind === kind}
                  onChange={() => handleChange('kind', kind)}
                  disabled={!!category} // Disable changing kind when editing
                />
              ))}
            </div>
            {category && (
              <small className="text-muted">
                Level tidak dapat diubah saat edit
              </small>
            )}
          </Form.Group>

          {renderParentSelection()}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Nama Kategori <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  isInvalid={!!errors.name}
                  placeholder={`Nama ${getKindLabel(formData.kind)}`}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Kode <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  isInvalid={!!errors.code}
                  placeholder="Kode unik"
                  maxLength={10}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.code}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Deskripsi</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Deskripsi singkat"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="mb-0">
                Target Grade <small className="text-muted">(Kosongkan untuk semua kalangan)</small>
              </Form.Label>
              <div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={selectAllGrades}
                  className="me-2"
                >
                  Pilih Semua
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={clearAllGrades}
                >
                  Hapus Semua
                </Button>
              </div>
            </div>
            
            <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <Row>
                {gradeOptions.map(option => (
                  <Col md={3} key={option.value} className="mb-2">
                    <Form.Check
                      type="checkbox"
                      id={`grade-${option.value}`}
                      label={option.label}
                      checked={formData.grade.includes(option.value)}
                      onChange={() => toggleGrade(option.value)}
                    />
                  </Col>
                ))}
              </Row>
            </div>
            
            {formData.grade.length > 0 && (
              <div className="mt-2">
                <small className="text-muted">Dipilih: </small>
                {formData.grade.sort((a, b) => a - b).map(g => (
                  <Badge key={g} bg="primary" className="me-1">
                    {gradeOptions.find(opt => opt.value === g)?.label}
                  </Badge>
                ))}
              </div>
            )}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            <FaTimes className="me-2" />
            Batal
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            <FaSave className="me-2" />
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default QuestionCategoryModal;