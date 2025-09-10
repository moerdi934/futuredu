// pages/panel/courses/classes-page/AddClassModal.tsx

import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import { FaSave, FaTimes, FaSpinner, FaPlus } from 'react-icons/fa';
import { BookOpen } from 'lucide-react';
import { LearningModal } from '../../../../components/modal/ModalTemplate';
import { ButtonGradient } from '../../../../components/button/ButtonTemplate';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: any) => void;
}

interface Course {
  id: string;
  title: string;
}

interface User {
  id: string;
  name: string;
}

const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    course_id: '',
    description: '',
    teacher_id: '',
    student_list: [] as string[],
    start_date: '',
    end_date: ''
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load dropdown options
  useEffect(() => {
    if (isOpen) {
      loadCourses();
      loadTeachers();
      loadStudents();
    }
  }, [isOpen]);

  const loadCourses = async () => {
    try {
      const response = await fetch('/courses/options');
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error('Error loading courses:', err);
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await fetch('/users/teachers');
      const data = await response.json();
      setTeachers(data);
    } catch (err) {
      console.error('Error loading teachers:', err);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await fetch('/users/students');
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error('Error loading students:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      student_list: selectedOptions
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.name || !formData.course_id || !formData.teacher_id || !formData.start_date || !formData.end_date) {
        throw new Error('Mohon lengkapi semua field yang wajib diisi');
      }

      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        throw new Error('Waktu selesai harus lebih besar dari waktu mulai');
      }

      // Convert student_list to numbers
      const classData = {
        ...formData,
        student_list: formData.student_list.map(id => parseInt(id))
      };

      const response = await fetch('/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal membuat kelas');
      }

      const result = await response.json();
      onSave(result);
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      course_id: '',
      description: '',
      teacher_id: '',
      student_list: [],
      start_date: '',
      end_date: ''
    });
    setError('');
    onClose();
  };

  const bottomButtons = [
    {
      action: 'cancel' as const,
      text: 'Batal',
      onClick: handleClose,
      disabled: isLoading
    },
    {
      action: 'save' as const,
      text: isLoading ? 'Menyimpan...' : 'Simpan Kelas',
      onClick: handleSubmit,
      disabled: isLoading,
      loading: isLoading
    }
  ];

  return (
    <LearningModal
      show={isOpen}
      onHide={handleClose}
      title="Buat Kelas Baru"
      subtitle="Isi formulir di bawah untuk membuat kelas baru"
      icon={<BookOpen className="tw-w-5 tw-h-5" />}
      size="lg"
      width="95vw"
      height="90vh"
      bottomButtons={bottomButtons}
      preventCloseOnOutsideClick={false}
    >
      {error && (
        <Alert variant="danger" className="tw-mb-4">
          {error}
        </Alert>
      )}

      <Form>
        <Row>
          <Col md={6}>
            <Form.Group className="tw-mb-4">
              <Form.Label className="tw-font-semibold tw-text-gray-700">
                Nama Kelas <span className="tw-text-red-500">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama kelas..."
                className="tw-border-gray-300 tw-rounded-lg"
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="tw-mb-4">
              <Form.Label className="tw-font-semibold tw-text-gray-700">
                Mata Pelajaran <span className="tw-text-red-500">*</span>
              </Form.Label>
              <Form.Select
                name="course_id"
                value={formData.course_id}
                onChange={handleInputChange}
                className="tw-border-gray-300 tw-rounded-lg"
                required
              >
                <option value="">Pilih mata pelajaran...</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="tw-mb-4">
          <Form.Label className="tw-font-semibold tw-text-gray-700">Deskripsi</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Masukkan deskripsi kelas..."
            className="tw-border-gray-300 tw-rounded-lg"
          />
        </Form.Group>

        <Form.Group className="tw-mb-4">
          <Form.Label className="tw-font-semibold tw-text-gray-700">
            Guru/Pengajar <span className="tw-text-red-500">*</span>
          </Form.Label>
          <Form.Select
            name="teacher_id"
            value={formData.teacher_id}
            onChange={handleInputChange}
            className="tw-border-gray-300 tw-rounded-lg"
            required
          >
            <option value="">Pilih guru/pengajar...</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="tw-mb-4">
          <Form.Label className="tw-font-semibold tw-text-gray-700">Daftar Siswa</Form.Label>
          <Form.Select
            name="student_list"
            multiple
            size={5}
            value={formData.student_list}
            onChange={handleStudentSelection}
            className="tw-border-gray-300 tw-rounded-lg"
          >
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </Form.Select>
          <Form.Text className="text-muted">
            Tahan Ctrl (Windows) atau Cmd (Mac) untuk memilih beberapa siswa
          </Form.Text>
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="tw-mb-4">
              <Form.Label className="tw-font-semibold tw-text-gray-700">
                Waktu Mulai <span className="tw-text-red-500">*</span>
              </Form.Label>
              <Form.Control
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="tw-border-gray-300 tw-rounded-lg"
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="tw-mb-4">
              <Form.Label className="tw-font-semibold tw-text-gray-700">
                Waktu Selesai <span className="tw-text-red-500">*</span>
              </Form.Label>
              <Form.Control
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="tw-border-gray-300 tw-rounded-lg"
                required
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </LearningModal>
  );
};

export default AddClassModal;