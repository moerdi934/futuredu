'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Form, ListGroup, Spinner, Alert, Button } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { 
  ShortFormField, 
  SelectOption
} from '../../../admin-components/layout/Report/FormComponent';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  userId?: number | null;
}

interface Student {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface FormData {
  username: string;
  email: string;
  oldPassword: string;
  newPassword: string;
}

interface ApiErrorResponse {
  message?: string;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  userId 
}) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    oldPassword: '',
    newPassword: '',
  });

  // Search and selection state
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [studentSearchResults, setStudentSearchResults] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // Loading states
  const [isLoadingStudent, setIsLoadingStudent] = useState<boolean>(false);
  const [isSearchingStudents, setIsSearchingStudents] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Error and success states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset form
  const resetModal = useCallback((): void => {
    setFormData({
      username: '',
      email: '',
      oldPassword: '',
      newPassword: '',
    });
    setStudentSearchQuery('');
    setStudentSearchResults([]);
    setSelectedStudentId(null);
    setError(null);
    setSuccessMessage(null);
    setIsSaving(false);
  }, []);

  // Handle form changes
  const handleFormChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Debounced student search function
  const debouncedStudentSearch = useCallback(
    (function() {
      let timer: NodeJS.Timeout | null = null;
      return function(query: string): void {
        setStudentSearchQuery(query);
        
        if (timer) {
          clearTimeout(timer);
        }
        
        timer = setTimeout(async () => {
          if (query.trim() === '') {
            setStudentSearchResults([]);
            return;
          }
          
          setIsSearchingStudents(true);
          try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/users/search`, {
              role: 'student',
              searchTerm: query,
              limit: 5
            });
            setStudentSearchResults(response.data.users || []);
          } catch (error) {
            console.error('Error searching students:', error);
            setError('Failed to search students');
          } finally {
            setIsSearchingStudents(false);
          }
        }, 500);
      };
    })(),
    []
  );

  // Fetch student details
  const fetchStudentDetails = async (studentId: number): Promise<void> => {
    setIsLoadingStudent(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${studentId}`);
      const { username, email } = response.data;
      setFormData(prev => ({
        ...prev,
        username: username || '',
        email: email || '',
        oldPassword: '',
        newPassword: '',
      }));
    } catch (error) {
      console.error('Error fetching student details:', error);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      setError('Failed to load student data: ' + (axiosError.response?.data?.message || 'Unknown error'));
    } finally {
      setIsLoadingStudent(false);
    }
  };

  // Handle student selection
  const handleStudentSelect = (student: Student): void => {
    setSelectedStudentId(student.id);
    fetchStudentDetails(student.id);
    setStudentSearchResults([]);
    setStudentSearchQuery('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const targetId = selectedStudentId || userId;
    
    if (!targetId) {
      setError('No student selected');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/${targetId}`, formData);
      if (response.status === 200) {
        setSuccessMessage('Update User Berhasil');
        onSave();
        setTimeout(() => {
          onClose();
          resetModal();
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      setError('Update User Gagal: ' + (axiosError.response?.data?.message || 'Alasan tidak diketahui'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = (): void => {
    onClose();
    resetModal();
  };

  // Initialize modal with direct userId if provided
  useEffect(() => {
    if (isOpen && userId) {
      setSelectedStudentId(userId);
      fetchStudentDetails(userId);
    } else if (!isOpen) {
      resetModal();
    }
  }, [isOpen, userId, resetModal]);

  return (
    <Modal show={isOpen} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Student</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!userId && (
          <>
            <ShortFormField
              label="Search Student"
              value={studentSearchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => debouncedStudentSearch(e.target.value)}
              required={false}
              placeholder="Enter student name or email"
            />

            {isSearchingStudents && (
              <div className="tw-text-center tw-my-3">
                <Spinner animation="border" size="sm" />
              </div>
            )}

            {studentSearchResults.length > 0 && (
              <ListGroup className="tw-mb-3">
                {studentSearchResults.map((student) => (
                  <ListGroup.Item
                    key={student.id}
                    action
                    active={student.id === selectedStudentId}
                    onClick={() => handleStudentSelect(student)}
                    className="tw-cursor-pointer"
                  >
                    {student.username} - {student.email}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </>
        )}

        {isLoadingStudent && (
          <div className="tw-text-center tw-my-3">
            <Spinner animation="border" />
          </div>
        )}

        {error && <Alert variant="danger" className="tw-mb-3">{error}</Alert>}
        {successMessage && <Alert variant="success" className="tw-mb-3">{successMessage}</Alert>}

        {(selectedStudentId || userId) && !isLoadingStudent && (
          <Form onSubmit={handleSubmit}>
            <ShortFormField
              label="Username"
              value={formData.username}
              onChange={handleFormChange('username')}
              required
            />

            <ShortFormField
              label="Email"
              value={formData.email}
              onChange={handleFormChange('email')}
              required
            />

            <ShortFormField
              label="Old Password"
              value={formData.oldPassword}
              onChange={handleFormChange('oldPassword')}
              required
              isPassword
            />

            <ShortFormField
              label="New Password"
              value={formData.newPassword}
              onChange={handleFormChange('newPassword')}
              isPassword
            />

            <ShortFormField
              label="Role"
              value="student"
              isFixed
              fixedValue="student"
            />

            <div className="tw-flex tw-justify-end tw-gap-2 tw-mt-3">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSaving}
              >
                Close
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={(!selectedStudentId && !userId) || isLoadingStudent || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default EditStudentModal;