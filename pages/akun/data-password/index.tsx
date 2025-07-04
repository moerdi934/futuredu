'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Nav, Alert } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../../components/layout/NavigationBar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const ChangePass: React.FC = () => {
  const router = useRouter();
  const { username } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger'>('success');

  useEffect(() => {
    const fetchUserId = async (): Promise<void> => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/username/${username}`, 
          { withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
          });
        setUserId(response.data.user_id);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    if (username) {
      fetchUserId();
    }
  }, [username]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setShowAlert(false);

    // Validate inputs
    if (!formData.current_password || !formData.new_password || !formData.confirm_password) {
      setAlertVariant('danger');
      setAlertMessage('Semua field harus diisi!');
      setShowAlert(true);
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setAlertVariant('danger');
      setAlertMessage('Password baru dan konfirmasi password tidak cocok!');
      setShowAlert(true);
      return;
    }

    if (formData.new_password.length < 8) {
      setAlertVariant('danger');
      setAlertMessage('Password baru harus minimal 8 karakter!');
      setShowAlert(true);
      return;
    }
    
    if (userId) {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/change-password`, 
          { 
            user_id: userId,
            current_password: formData.current_password,
            new_password: formData.new_password
          }, 
          { 
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`
            }
          });

        setAlertVariant('success');
        setAlertMessage('Password berhasil diubah!');
        setShowAlert(true);
        setFormData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        
        // Redirect after successful password change
        setTimeout(() => {
          router.push('/');
        }, 2000);

      } catch (error: any) {
        console.error('Error changing password:', error);
        setAlertVariant('danger');
        setAlertMessage(error.response?.data?.message || 'Terjadi kesalahan saat mengubah password');
        setShowAlert(true);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-white tw-min-h-screen tw-py-8">
        <Container className="tw-bg-white tw-shadow-lg tw-rounded-xl tw-p-6 tw-max-w-5xl">
          <div className="tw-text-center tw-mb-8">
            <h2 className="tw-text-3xl tw-font-bold tw-text-purple-800 tw-mb-2">Ganti Password</h2>
            <div className="tw-h-1 tw-w-24 tw-bg-purple-600 tw-mx-auto tw-rounded-full"></div>
          </div>
          
          <Nav variant="tabs" className="tw-flex tw-flex-wrap md:tw-flex-nowrap tw-border-b tw-border-indigo-200 tw-mb-6">
            <Nav.Item className="tw-mr-1 md:tw-mr-3 tw-mb-1 md:tw-mb-0 tw-flex-1 md:tw-flex-none">
              <Nav.Link 
                as={Link} 
                href="/akun/data-diri" 
                className="tw-text-indigo-800 tw-bg-gradient-to-br tw-from-blue-600/30 tw-to-indigo-700/30 hover:tw-from-indigo-700 hover:tw-to-purple-600 tw-font-medium tw-py-2 md:tw-py-2.5 tw-px-3 md:tw-px-5 tw-rounded-t-lg tw-border-0 tw-shadow-md tw-transition-all tw-duration-300 tw-transform hover:tw-scale-105 tw-text-sm md:tw-text-base tw-w-full tw-text-center"
              >
                <span className="tw-flex tw-items-center tw-justify-center">
                  Data Diri
                </span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="tw-mr-1 md:tw-mr-3 tw-mb-1 md:tw-mb-0 tw-flex-1 md:tw-flex-none">
              <Nav.Link 
                as={Link} 
                href="/akun/data-seleksi" 
                className="tw-text-indigo-800 tw-bg-gradient-to-br tw-from-blue-600/30 tw-to-indigo-700/30 hover:tw-from-indigo-700 hover:tw-to-purple-600 tw-font-medium tw-py-2 md:tw-py-2.5 tw-px-3 md:tw-px-5 tw-rounded-t-lg tw-border-0 tw-shadow-md tw-transition-all tw-duration-300 tw-transform hover:tw-scale-105 tw-text-sm md:tw-text-base tw-w-full tw-text-center"
              >
                <span className="tw-flex tw-items-center tw-justify-center">
                  Pendaftaran Seleksi
                </span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="tw-mr-1 md:tw-mr-3 tw-mb-1 md:tw-mb-0 tw-flex-1 md:tw-flex-none">
              <Nav.Link 
                as={Link} 
                href="/akun/data-password" 
                active
                className="tw-text-indigo-900 tw-font-semibold tw-py-2 md:tw-py-2.5 tw-px-3 md:tw-px-5 tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-500 tw-border-0 tw-rounded-t-lg tw-shadow-md tw-transition-all tw-w-full tw-text-center tw-text-sm md:tw-text-base"
              >
                <span className="tw-text-white tw-relative tw-z-10">
                  Ganti Password
                </span>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {showAlert && (
            <Alert 
              variant={alertVariant} 
              onClose={() => setShowAlert(false)} 
              dismissible
              className="tw-mb-4 tw-shadow-sm"
            >
              <div className="tw-flex tw-items-center">
                <i className={`bi ${alertVariant === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} tw-mr-2`}></i>
                {alertMessage}
              </div>
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className="tw-text-gray-700">
            <div className="tw-bg-purple-100 tw-rounded-lg tw-p-4 tw-mb-6">
              <h4 className="tw-text-lg tw-font-semibold tw-text-purple-700 tw-mb-3">
                <i className="bi bi-shield-lock tw-mr-2"></i>
                Ubah Password
              </h4>
              
              <Row>
                {/* Password Form - Takes 7/12 on medium and large screens */}
                <Col md={7}>
                  <Form.Group controlId="formCurrentPassword" className="mb-4">
                    <Form.Label className="tw-font-medium">Password Saat Ini</Form.Label>
                    <div className="tw-relative">
                      <Form.Control 
                        type="password" 
                        name="current_password" 
                        value={formData.current_password} 
                        onChange={handleInputChange} 
                        placeholder="Masukkan password saat ini"
                        className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm" 
                      />
                      <i className="bi bi-key tw-absolute tw-right-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-purple-600"></i>
                    </div>
                  </Form.Group>
                
                  <Form.Group controlId="formNewPassword" className="mb-4">
                    <Form.Label className="tw-font-medium">Password Baru</Form.Label>
                    <div className="tw-relative">
                      <Form.Control 
                        type="password" 
                        name="new_password" 
                        value={formData.new_password} 
                        onChange={handleInputChange} 
                        placeholder="Masukkan password baru"
                        className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm" 
                      />
                      <i className="bi bi-lock tw-absolute tw-right-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-purple-600"></i>
                    </div>
                    <small className="tw-text-purple-600 tw-block tw-mt-1">Password minimal 8 karakter</small>
                  </Form.Group>
                
                  <Form.Group controlId="formConfirmPassword" className="mb-4">
                    <Form.Label className="tw-font-medium">Konfirmasi Password Baru</Form.Label>
                    <div className="tw-relative">
                      <Form.Control 
                        type="password" 
                        name="confirm_password" 
                        value={formData.confirm_password} 
                        onChange={handleInputChange} 
                        placeholder="Konfirmasi password baru"
                        className="tw-border-purple-300 tw-rounded-lg tw-shadow-sm" 
                      />
                      <i className="bi bi-check-circle tw-absolute tw-right-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-purple-600"></i>
                    </div>
                  </Form.Group>
                </Col>

                {/* Tips Box - Takes 5/12 on medium and large screens, full width on small screens */}
                <Col md={5} className="md:tw-pl-4">
                  <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-purple-200 tw-h-full tw-flex tw-flex-col tw-justify-center">
                    <h5 className="tw-text-md tw-font-semibold tw-text-purple-700 tw-mb-3">
                      <i className="bi bi-info-circle tw-mr-2"></i>
                      Tips Keamanan Password
                    </h5>
                    <ul className="tw-text-sm tw-text-gray-600 tw-pl-6">
                      <li className="tw-mb-2">Gunakan minimal 8 karakter</li>
                      <li className="tw-mb-2">Kombinasikan huruf besar dan huruf kecil</li>
                      <li className="tw-mb-2">Sertakan angka dan simbol khusus (seperti @, #, $, %)</li>
                      <li className="tw-mb-2">Hindari penggunaan informasi pribadi (nama, tanggal lahir)</li>
                      <li className="tw-mb-2">Jangan gunakan password yang sama dengan akun lain</li>
                      <li>Ganti password Anda secara berkala</li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </div>

            <div className="tw-text-center tw-mt-6">
              <Button
                type="submit"
                className="tw-bg-purple-600 tw-border-purple-700 tw-px-6 tw-py-2 tw-rounded-lg tw-font-medium tw-shadow-md hover:tw-bg-purple-700 tw-transition-all"
                style={{ minWidth: '200px' }}
              >
                <i className="bi bi-shield-check tw-mr-2"></i>
                Ubah Password
              </Button>
            </div>
          </Form>
        </Container>
      </div>
    </>
  );
};

export default ChangePass;