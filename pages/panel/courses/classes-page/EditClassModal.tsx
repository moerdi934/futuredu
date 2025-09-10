// components/modal/EditClassModal.tsx

import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import { FaEdit, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { Edit } from 'lucide-react';
import { LearningModal } from '../../../../components/modal/ModalTemplate';
import { ButtonGradient } from '../../../../components/button/ButtonTemplate';
import { ShortFormField, SearchSingleField, SelectCustomField } from '../../../../components/form/FormComponentLayout';

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: any) => void;
  editingData: any;
}

interface FormData {
  name: string;
  course_id: string;
  description: string;
  teacher_id: string;
  student_list_ids: number[];
  start_time: string;
  end_time: string;
}

interface SelectOption {
  value: any;
  label: string;
}

const EditClassModal: React.FC<EditClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingData
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    course_id: '',
    description: '',
    teacher_id: '',
    student_list_ids: [],
    start_time: '',
    end_time: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<SelectOption[]>([]);
  const [teachers, setTeachers] = useState<SelectOption[]>([]);
  const [students, setStudents] = useState<SelectOption[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<SelectOption[]>([]);

  // Load form data when editingData changes
  useEffect(() => {
    if (editingData && isOpen) {
      const startDateTime = editingData.real_start_datetime 
        ? new Date(editingData.real_start_datetime).toISOString().slice(0, 16)
        : '';
      const endDateTime = editingData.real_end_datetime
        ? new Date(editingData.real_end_datetime).toISOString().slice(0, 16)
        : '';

      setFormData({
        name: editingData.name || '',
        course_id: editingData.course_id?.toString() || '',
        description: editingData.description || '',
        teacher_id: editingData.teacher_id?.toString() || '',
        student_list_ids: editingData.student_list_ids || [],
        start_time: startDateTime,
        end_time: endDateTime
      });

      // Set selected students
      if (editingData.student_list_ids && editingData.student_list_names) {
        const studentOptions = editingData.student_list_ids.map((id: number, index: number) => ({
          value: id,
          label: editingData.student_list_names[index] || `Student ${id}`
        }));
        setSelectedStudents(studentOptions);
      }
    }
  }, [editingData, isOpen]);

  // Load dropdown options
  useEffect(() => {
    if (isOpen) {
      loadDropdownOptions();
    }
  }, [isOpen]);

  const loadDropdownOptions = async () => {
    try {
      // Load courses
      const coursesResponse = await fetch('/api/courses/options');
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
      }

      // Load teachers
      const teachersResponse = await fetch('/api/users/teachers');
      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json();
        setTeachers(teachersData);
      }

      // Load students
      const studentsResponse = await fetch('/api/users/students');
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error loading dropdown options:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStudentSelection = (selectedOptions: SelectOption[]) => {
    setSelectedStudents(selectedOptions);
    const studentIds = selectedOptions.map(option => option.value);
    handleInputChange('student_list_ids', studentIds);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Nama kelas harus diisi');
      }
      if (!formData.course_id) {
        throw new Error('Mata pelajaran harus dipilih');
      }
      if (!formData.teacher_id) {
        throw new Error('Guru pengajar harus dipilih');
      }
      if (!formData.start_time) {
        throw new Error('Waktu mulai harus diisi');
      }
      if (!formData.end_time) {
        throw new Error('Waktu selesai harus diisi');
      }

      // Check if end time is after start time
      if (new Date(formData.end_time) <= new Date(formData.start_time)) {
        throw new Error('Waktu selesai harus setelah waktu mulai');
      }

      const updateData = {
        ...formData,
        event_id: editingData.event_id
      };

      const response = await fetch(`/api/classes/${editingData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengupdate kelas');
      }

      const updatedClass = await response.json();
      onSave(updatedClass);
      handleClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  const selectedCourse = courses.find(course => course.value.toString() === formData.course_id);
  const selectedTeacher = teachers.find(teacher => teacher.value.toString() === formData.teacher_id);

  const bottomButtons = [
    {
      action: 'cancel' as const,
      text: 'Batal',
      onClick: handleClose,
      disabled: loading
    },
    {
      action: 'save' as const,
      text: loading ? 'Menyimpan...' : 'Simpan Perubahan',
      onClick: handleSave,
      disabled: loading,
      loading: loading
    }
  ];

  return (
    <LearningModal
      show={isOpen}
      onHide={handleClose}
      title="Edit Kelas"
      subtitle={`${editingData?.name} (ID: ${editingData?.id})`}
      icon={<Edit className="tw-w-5 tw-h-5" />}
      size="xl"
      width="95vw"
      height="90vh"
      bottomButtons={bottomButtons}
      preventCloseOnOutsideClick={false}
    >
      {error && (
        <Alert variant="danger" className="tw-mb-4">
          <div className="tw-flex tw-items-center tw-gap-2">
            <FaTimes className="tw-text-red-600" />
            <span>{error}</span>
          </div>
        </Alert>
      )}

      <Form>
        <Row className="tw-mb-4">
          <Col md={12}>
            <Form.Group>
              <Form.Label className="tw-font-semibold tw-text-gray-700">
                Nama Kelas <span className="tw-text-red-500">*</span>
              </Form.Label>
              <ShortFormField
                label=""
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Masukkan nama kelas"
                disabled={loading}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="tw-mb-4">
          <Col md={12}>
            <Form.Group>
              <Form.Label className="tw-font-semibold tw-text-gray-700">
                Deskripsi Kelas
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Masukkan deskripsi kelas (opsional)"
                disabled={loading}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="tw-mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="tw-font-semibold tw-text-gray-700">
                Mata Pelajaran <span className="tw-text-red-500">*</span>
              </Form.Label>
              <SelectCustomField
                label=""
                value={selectedCourse || null}
                options={courses}
                onChange={(newValue) => handleInputChange('course_id', newValue?.value || '')}
                placeholder="Pilih mata pelajaran"
                disabled={loading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="tw-font-semibold tw-text-gray-700">
                Guru Pengajar <span className="tw-text-red-500">*</span>
              </Form.Label>
              <SearchSingleField
                label=""
                value={selectedTeacher || null}
                options={teachers}
                onChange={(newValue) => handleInputChange('teacher_id', newValue?.value || '')}
                placeholder="Pilih guru pengajar"
                disabled={loading}
                apiEndpoint="/api/users/teachers"
                debounceMs={300}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="tw-mb-4">
          <Col md={12}>
            <Form.Group>
              <Form.Label className="tw-font-semibold tw-text-gray-700">
                Daftar Siswa
              </Form.Label>
              <SearchSingleField
                label=""
                value={null} // Always null for multi-select behavior
                options={students}
                onChange={(newValue) => {
                  if (newValue && !selectedStudents.find(s => s.value === newValue.value)) {
                    handleStudentSelection([...selectedStudents, newValue]);
                  }
                }}
                placeholder="Cari dan pilih siswa"
                disabled={loading}
                apiEndpoint="/api/users/students"
                debounceMs={300}
              />
              
              {/* Selected Students Display */}
              {selectedStudents.length > 0 && (
                <div className="tw-mt-3 tw-p-3 tw-bg-gray-50 tw-rounded-lg">
                  <div className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                    Siswa Terpilih ({selectedStudents.length}):
                  </div>
                  <div className="tw-flex tw-flex-wrap tw-gap-2">
                    {selectedStudents.map((student, index) => (
                      <div
                        key={index}
                        className="tw-flex tw-items-center tw-gap-2 tw-bg-blue-100 tw-text-blue-800 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm"
                      >
                        <span>{student.label}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newSelected = selectedStudents.filter((_, i) => i !== index);
                            handleStudentSelection(newSelected);
                          }}
                          className="tw-text-blue-600 hover:tw-text-blue-800 tw-font-bold"
                          disabled={loading}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>

        <Row className="tw-mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="tw-font-semibold tw-text-gray-700">
                Waktu Mulai <span className="tw-text-red-500">*</span>
              </Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                disabled={loading}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="tw-font-semibold tw-text-gray-700">
                Waktu Selesai <span className="tw-text-red-500">*</span>
              </Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                disabled={loading}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </LearningModal>
  );
};

export default EditClassModal;