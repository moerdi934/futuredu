'use client';

import React, { useState } from 'react';
import { Modal, Button, Form, Container } from 'react-bootstrap';
import axios, { AxiosError } from 'axios';
import { ShortFormField } from '../../../../components/layout/FormComponentLayout';

interface FormData {
  username: string;
  fullName: string;
  email: string;
  role: string;
  password: string;
}

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

interface ApiErrorResponse {
  message?: string;
}

const generateSecurePassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    fullName: '',
    email: '',
    role: 'student',
    password: '',
  });

  const [validated, setValidated] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFieldChange = (fieldName: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [fieldName]: value }));

    if (fieldName === 'password') {
      if (value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value)) {
        setPasswordError('');
      } else {
        setPasswordError('Password must be at least 8 characters long and include letters and numbers.');
      }
    }
  };

  const handleGeneratePassword = (): void => {
    const newPassword = generateSecurePassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
    setPasswordError('');
  };

  const resetForm = (): void => {
    setFormData({ username: '', fullName: '', email: '', role: 'student', password: '' });
    setValidated(false);
    setPasswordError('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity() || passwordError) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/register-no-captcha`, formData);

      if (response.status === 201) {
        setSuccessMessage('Student added successfully!');
        onSave(response.data);
        resetForm();
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error during student addition:', error);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      setErrorMessage(axiosError.response?.data?.message || 'An error occurred while adding the student.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  return (
    <Modal 
      show={isOpen} 
      onHide={handleClose} 
      centered 
      className="tw-futuristic-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Add New Student</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          {successMessage && (
            <div className="alert alert-success tw-mb-4">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="alert alert-danger tw-mb-4">{errorMessage}</div>
          )}

          <Form noValidate validated={validated} onSubmit={handleAdd}>
            <ShortFormField
              label="Username"
              value={formData.username}
              onChange={handleFieldChange('username')}
              error={validated && !formData.username ? 'Username is required.' : ''}
              required={true}
            />

            <ShortFormField
              label="Nama Lengkap"
              value={formData.fullName}
              onChange={handleFieldChange('fullName')}
              error={validated && !formData.fullName ? 'Nama Lengkap is required.' : ''}
              required={true}
            />

            <ShortFormField
              label="Email"
              value={formData.email}
              onChange={handleFieldChange('email')}
              error={validated && !formData.email ? 'Valid email is required.' : ''}
              required={true}
              isRegex={true}
              regex="^[^\s@]+@[^\s@]+\.[^\s@]+$"
              regexErrorMessage="Please enter a valid email address"
            />

            <ShortFormField
              label="Role"
              value={formData.role}
              onChange={() => {}}
              isFixed={true}
              fixedValue="student"
            />

            <ShortFormField
              label="Password"
              value={formData.password}
              onChange={handleFieldChange('password')}
              error={passwordError || (validated && !formData.password ? 'Password is required.' : '')}
              required={true}
              isPassword={true}
            />

            <Button 
              variant="outline-primary" 
              onClick={handleGeneratePassword} 
              className="tw-mb-3 tw-w-full button-dashboard"
              disabled={isLoading}
            >
              Generate Password
            </Button>

            <div className="tw-flex tw-justify-end tw-gap-2">
              <Button 
                variant="secondary" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Student'}
              </Button>
            </div>
          </Form>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default AddStudentModal;