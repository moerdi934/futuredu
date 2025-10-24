// pages/panel/exam/exam-categories/ExamCategoryModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaSave, FaTimes } from 'react-icons/fa';

interface ExamCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  category?: any;
}

const ExamCategoryModal: React.FC<ExamCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    grade: [] as number[]
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        code: category.code || '',
        description: category.description || '',
        grade: category.grade || []
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        grade: []
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        kind: 0, // Exam category kind
        grade: formData.grade.length > 0 ? formData.grade : null
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
        alert(category ? 'Kategori ujian berhasil diupdate' : 'Kategori ujian berhasil ditambahkan');
        onSave();
      } else {
        const error = await response.json();
        alert(`Gagal menyimpan: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving exam category:', error);
      alert('Terjadi kesalahan saat menyimpan kategori ujian');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {category ? 'Edit Kategori Ujian' : 'Tambah Kategori Ujian Baru'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
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
                  placeholder="Contoh: UTBK, CPNS, dll"
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
                  placeholder="Contoh: UTBK"
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
              placeholder="Deskripsi singkat tentang kategori ujian ini"
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

export default ExamCategoryModal;