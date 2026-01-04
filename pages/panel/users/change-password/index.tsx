// Updated pages/panel/users/account/change-password.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Nav, Alert } from 'react-bootstrap';
import { 
  User, 
  Lock, 
  Shield, 
  Key,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Settings,
  CheckCircle,
  AlertTriangle,
  Zap,
  Info,
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import Navbar from '../../../../components/layout/NavigationBar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
  label: string;
}

const ChangePass: React.FC = () => {
  const router = useRouter();
  const { username } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger' | 'warning' | 'info'>('success');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'text-gray-400',
    label: 'Tidak ada'
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Password strength checker
  const checkPasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return {
        score: 0,
        feedback: [],
        color: 'tw-text-gray-400',
        label: 'Tidak ada'
      };
    }

    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Minimal 8 karakter');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Sertakan huruf besar');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Sertakan huruf kecil');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Sertakan angka');
    }

    // Special character check
    if (/[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?!]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Sertakan simbol (@, #, $, dll)');
    }

    // Determine strength level
    let color = 'tw-text-red-400';
    let label = 'Sangat Lemah';

    if (score >= 4) {
      color = 'tw-text-green-400';
      label = 'Kuat';
    } else if (score >= 3) {
      color = 'tw-text-yellow-400';
      label = 'Sedang';
    } else if (score >= 2) {
      color = 'tw-text-orange-400';
      label = 'Lemah';
    }

    return { score, feedback, color, label };
  };

  // Real-time validation
  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.current_password) {
      errors.push('Password saat ini harus diisi');
    }

    if (!formData.new_password) {
      errors.push('Password baru harus diisi');
    } else {
      if (formData.new_password.length < 8) {
        errors.push('Password baru minimal 8 karakter');
      }
      if (formData.current_password && formData.current_password === formData.new_password) {
        errors.push('Password baru harus berbeda dengan password saat ini');
      }
    }

    if (!formData.confirm_password) {
      errors.push('Konfirmasi password harus diisi');
    } else if (formData.new_password && formData.new_password !== formData.confirm_password) {
      errors.push('Konfirmasi password tidak cocok');
    }

    return errors;
  };

  useEffect(() => {
    const strength = checkPasswordStrength(formData.new_password);
    setPasswordStrength(strength);
    
    const errors = validateForm();
    setValidationErrors(errors);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear alert when user starts typing
    if (showAlert) {
      setShowAlert(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const showNotification = (message: string, variant: 'success' | 'danger' | 'warning' | 'info') => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);
    
    // Auto hide after 5 seconds for non-error messages
    if (variant !== 'danger') {
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setShowAlert(false);
    setIsLoading(true);

    // Final validation
    const errors = validateForm();
    if (errors.length > 0) {
      showNotification(errors[0], 'danger');
      setIsLoading(false);
      return;
    }

    // Check password strength
    if (passwordStrength.score < 3) {
      showNotification('Password baru kurang kuat. Gunakan kombinasi huruf besar, kecil, angka, dan simbol.', 'warning');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Sending change password request...');
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/change-password`, 
        { 
          current_password: formData.current_password,
          new_password: formData.new_password
        }, 
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Change password response:', response.data);

      showNotification('🎉 Password berhasil diubah! Anda akan diarahkan ke halaman utama...', 'success');
      
      // Clear form
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      // Redirect after successful password change
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (error: any) {
      console.error('Error changing password:', error);
      
      // Handle different error responses
      if (error.response?.status === 400) {
        showNotification(error.response.data.message || 'Data yang dimasukkan tidak valid', 'danger');
      } else if (error.response?.status === 401) {
        showNotification('Sesi Anda telah berakhir. Silakan login kembali.', 'warning');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else if (error.response?.status === 404) {
        showNotification('User tidak ditemukan', 'danger');
      } else if (error.response?.status === 500) {
        showNotification('Terjadi kesalahan server. Silakan coba lagi nanti.', 'danger');
      } else {
        showNotification(error.response?.data?.message || 'Terjadi kesalahan saat mengubah password', 'danger');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = validationErrors.length === 0 && 
                     formData.current_password && 
                     formData.new_password && 
                     formData.confirm_password &&
                     passwordStrength.score >= 3;

  return (
    <div className="tw-min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navbar />
      
      {/* Animated Background Elements */}
      <div className="tw-absolute tw-inset-0 tw-overflow-hidden">
        <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
        <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
        <div className="tw-absolute tw-top-1/2 tw-left-1/2 tw-w-16 tw-h-16 tw-bg-blue-300/20 tw-rounded-full tw-blur-lg tw-animate-pulse tw-delay-500"></div>
        <div className="tw-absolute tw-top-1/4 tw-right-1/4 tw-w-24 tw-h-24 tw-bg-purple-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-700"></div>
        <div className="tw-absolute tw-bottom-1/4 tw-left-1/4 tw-w-28 tw-h-28 tw-bg-indigo-300/15 tw-rounded-full tw-blur-xl tw-animate-pulse tw-delay-300"></div>
      </div>

      <div className="tw-relative tw-z-10 tw-py-8">
        <Container className="tw-max-w-6xl">
          {/* Header */}
          <div className="tw-text-center tw-mb-8">
            <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-20 tw-h-20 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-mb-6 tw-shadow-lg tw-border tw-border-white/30">
              <Shield className="tw-w-10 tw-h-10 tw-text-white tw-drop-shadow-lg" />
            </div>
            <h1 className="tw-text-4xl md:tw-text-5xl tw-font-bold tw-text-white tw-mb-4 tw-drop-shadow-lg">
              🔐 Ganti Password
            </h1>
            <p className="tw-text-lg md:tw-text-xl tw-text-white/90 tw-font-medium tw-drop-shadow tw-max-w-3xl tw-mx-auto">
              Jaga keamanan akun dengan password yang kuat! 🛡️
            </p>
            <div className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-mt-4">
              <span className="tw-text-white/80 tw-text-sm">User:</span>
              <span className="tw-text-white tw-font-semibold tw-bg-white/20 tw-backdrop-blur-sm tw-px-3 tw-py-1 tw-rounded-full tw-border tw-border-white/30">
                {username}
              </span>
            </div>
          </div>

          {/* Back Button */}
          <div className="tw-mb-6">
            <Button
              variant="outline-light"
              onClick={() => router.back()}
              className="tw-bg-white/10 tw-backdrop-blur-sm tw-border-white/30 tw-text-white tw-font-semibold tw-py-2 tw-px-4 tw-rounded-xl tw-transition-all tw-duration-300 hover:tw-bg-white/20 hover:tw-scale-105"
            >
              <div className="tw-flex tw-items-center tw-gap-2">
                <ArrowLeft className="tw-w-4 tw-h-4" />
                <span>Kembali</span>
              </div>
            </Button>
          </div>

          {/* Main Form Container */}
          <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-3xl tw-p-6 tw-border tw-border-white/20 tw-shadow-2xl">
            
            {/* Navigation Tabs */}
            <Nav variant="tabs" className="tw-flex tw-flex-wrap md:tw-flex-nowrap tw-border-0 tw-mb-8 tw-bg-white/5 tw-backdrop-blur-sm tw-rounded-2xl tw-p-2">
              <Nav.Item className="tw-flex-1">
                <Nav.Link 
                  as={Link}
                  href="/akun/data-diri"
                  className="tw-text-white/90 tw-bg-white/10 tw-backdrop-blur-sm tw-font-semibold tw-py-3 tw-px-4 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-hover:bg-white/20 tw-hover:scale-105 tw-hover:text-white tw-text-center tw-w-full"
                >
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                    <User className="tw-w-5 tw-h-5" />
                    <span className="tw-text-sm md:tw-text-base">Data Diri</span>
                  </div>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="tw-flex-1 tw-ml-2">
                <Nav.Link 
                  as={Link}
                  href="/akun/data-seleksi"
                  className="tw-text-white/90 tw-bg-white/10 tw-backdrop-blur-sm tw-font-semibold tw-py-3 tw-px-4 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-hover:bg-white/20 tw-hover:scale-105 tw-hover:text-white tw-text-center tw-w-full"
                >
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                    <Settings className="tw-w-5 tw-h-5" />
                    <span className="tw-text-sm md:tw-text-base">Pendaftaran Seleksi</span>
                  </div>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="tw-flex-1 tw-ml-2">
                <Nav.Link 
                  active
                  className="tw-text-white tw-font-bold tw-py-3 tw-px-4 tw-bg-gradient-to-r tw-from-white tw-to-gray-100 tw-text-purple-700 tw-border-0 tw-rounded-xl tw-shadow-lg tw-transition-all tw-duration-300 tw-w-full tw-text-center tw-hover:scale-105 tw-hover:shadow-xl"
                  style={{ color: '#5B21B6 !important' }}
                >
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-text-purple-700">
                    <Lock className="tw-w-5 tw-h-5" />
                    <span className="tw-text-sm md:tw-text-base tw-font-bold">Ganti Password</span>
                    <Sparkles className="tw-w-4 tw-h-4" />
                  </div>
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {/* Alert Message */}
            {showAlert && (
              <div className={`tw-rounded-2xl tw-p-4 tw-mb-6 tw-shadow-lg tw-border tw-transition-all tw-duration-500 tw-transform ${
                alertVariant === 'success' 
                  ? 'tw-bg-gradient-to-r tw-from-green-500/20 tw-to-emerald-500/20 tw-border-green-300/30 tw-backdrop-blur-sm tw-scale-100' 
                  : alertVariant === 'warning'
                  ? 'tw-bg-gradient-to-r tw-from-yellow-500/20 tw-to-orange-500/20 tw-border-yellow-300/30 tw-backdrop-blur-sm tw-scale-100'
                  : alertVariant === 'info'
                  ? 'tw-bg-gradient-to-r tw-from-blue-500/20 tw-to-cyan-500/20 tw-border-blue-300/30 tw-backdrop-blur-sm tw-scale-100'
                  : 'tw-bg-gradient-to-r tw-from-red-500/20 tw-to-pink-500/20 tw-border-red-300/30 tw-backdrop-blur-sm tw-scale-100'
              }`}>
                <div className="tw-flex tw-items-center tw-justify-between">
                  <div className="tw-flex tw-items-center tw-gap-3">
                    {alertVariant === 'success' ? (
                      <CheckCircle className="tw-w-6 tw-h-6 tw-text-green-300" />
                    ) : alertVariant === 'warning' ? (
                      <AlertTriangle className="tw-w-6 tw-h-6 tw-text-yellow-300" />
                    ) : alertVariant === 'info' ? (
                      <Info className="tw-w-6 tw-h-6 tw-text-blue-300" />
                    ) : (
                      <AlertTriangle className="tw-w-6 tw-h-6 tw-text-red-300" />
                    )}
                    <span className="tw-text-white tw-font-medium">{alertMessage}</span>
                  </div>
                  <button 
                    onClick={() => setShowAlert(false)}
                    className="tw-text-white/70 hover:tw-text-white tw-transition-colors tw-p-1 tw-rounded hover:tw-bg-white/10"
                  >
                    <X className="tw-w-5 tw-h-5" />
                  </button>
                </div>
              </div>
            )}

            <Form onSubmit={handleSubmit} className="tw-text-white">
              {/* Password Change Section */}
              <div className="tw-bg-gradient-to-br tw-from-purple-500/20 tw-to-pink-500/20 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-mb-6 tw-border tw-border-white/20 tw-shadow-lg">
                <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6">
                  <div className="tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-purple-400 tw-to-pink-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                    <Lock className="tw-w-6 tw-h-6 tw-text-white" />
                  </div>
                  <div>
                    <h4 className="tw-text-xl tw-font-bold tw-text-white tw-mb-1">
                      🔐 Ubah Password
                    </h4>
                    <p className="tw-text-white/80 tw-text-sm">Pastikan password baru lebih kuat dan aman</p>
                  </div>
                </div>
                
                <Row>
                  {/* Password Form - Takes 7/12 on medium and large screens */}
                  <Col md={7}>
                    {/* Current Password */}
                    <Form.Group controlId="formCurrentPassword" className="mb-4">
                      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                        <Key className="tw-w-4 tw-h-4" />
                        Password Saat Ini
                      </Form.Label>
                      <div className="tw-relative">
                        <Form.Control 
                          type={showPasswords.current ? "text" : "password"}
                          name="current_password" 
                          value={formData.current_password} 
                          onChange={handleInputChange} 
                          placeholder="Masukkan password saat ini"
                          className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3 tw-pr-12 tw-transition-all tw-duration-300 focus:tw-bg-white focus:tw-shadow-lg"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="tw-absolute tw-right-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-purple-600 tw-bg-transparent tw-border-0 tw-p-1 tw-rounded tw-transition-colors hover:tw-text-purple-800 hover:tw-bg-purple-100/20"
                        >
                          {showPasswords.current ? <EyeOff className="tw-w-5 tw-h-5" /> : <Eye className="tw-w-5 tw-h-5" />}
                        </button>
                      </div>
                    </Form.Group>
                  
                    {/* New Password */}
                    <Form.Group controlId="formNewPassword" className="mb-4">
                      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                        <Lock className="tw-w-4 tw-h-4" />
                        Password Baru
                      </Form.Label>
                      <div className="tw-relative">
                        <Form.Control 
                          type={showPasswords.new ? "text" : "password"}
                          name="new_password" 
                          value={formData.new_password} 
                          onChange={handleInputChange} 
                          placeholder="Masukkan password baru"
                          className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3 tw-pr-12 tw-transition-all tw-duration-300 focus:tw-bg-white focus:tw-shadow-lg"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="tw-absolute tw-right-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-purple-600 tw-bg-transparent tw-border-0 tw-p-1 tw-rounded tw-transition-colors hover:tw-text-purple-800 hover:tw-bg-purple-100/20"
                        >
                          {showPasswords.new ? <EyeOff className="tw-w-5 tw-h-5" /> : <Eye className="tw-w-5 tw-h-5" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {formData.new_password && (
                        <div className="tw-mt-3 tw-bg-white/10 tw-backdrop-blur-sm tw-p-3 tw-rounded-lg tw-border tw-border-white/20">
                          <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                            <span className="tw-text-white/90 tw-text-sm tw-font-medium">Kekuatan Password:</span>
                            <span className={`tw-text-sm tw-font-bold ${passwordStrength.color}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="tw-w-full tw-bg-white/20 tw-rounded-full tw-h-2 tw-mb-3">
                            <div 
                              className={`tw-h-2 tw-rounded-full tw-transition-all tw-duration-500 ${
                                passwordStrength.score >= 4 ? 'tw-bg-green-400' :
                                passwordStrength.score >= 3 ? 'tw-bg-yellow-400' :
                                passwordStrength.score >= 2 ? 'tw-bg-orange-400' : 'tw-bg-red-400'
                              }`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            ></div>
                          </div>
                          
                          {/* Feedback */}
                          {passwordStrength.feedback.length > 0 && (
                            <div className="tw-space-y-1">
                              {passwordStrength.feedback.map((feedback, index) => (
                                <div key={index} className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-white/80">
                                  <div className="tw-w-1 tw-h-1 tw-bg-white/60 tw-rounded-full"></div>
                                  <span>{feedback}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </Form.Group>
                  
                    {/* Confirm Password */}
                    <Form.Group controlId="formConfirmPassword" className="mb-4">
                      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                        <CheckCircle className="tw-w-4 tw-h-4" />
                        Konfirmasi Password Baru
                      </Form.Label>
                      <div className="tw-relative">
                        <Form.Control 
                          type={showPasswords.confirm ? "text" : "password"}
                          name="confirm_password" 
                          value={formData.confirm_password} 
                          onChange={handleInputChange} 
                          placeholder="Konfirmasi password baru"
                          className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3 tw-pr-12 tw-transition-all tw-duration-300 focus:tw-bg-white focus:tw-shadow-lg"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="tw-absolute tw-right-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-purple-600 tw-bg-transparent tw-border-0 tw-p-1 tw-rounded tw-transition-colors hover:tw-text-purple-800 hover:tw-bg-purple-100/20"
                        >
                          {showPasswords.confirm ? <EyeOff className="tw-w-5 tw-h-5" /> : <Eye className="tw-w-5 tw-h-5" />}
                        </button>
                      </div>
                      
                      {/* Password Match Indicator */}
                      {formData.confirm_password && (
                        <div className="tw-mt-2 tw-flex tw-items-center tw-gap-2">
                          {formData.new_password === formData.confirm_password ? (
                            <>
                              <Check className="tw-w-4 tw-h-4 tw-text-green-400" />
                              <span className="tw-text-green-400 tw-text-sm">Password cocok</span>
                            </>
                          ) : (
                            <>
                              <X className="tw-w-4 tw-h-4 tw-text-red-400" />
                              <span className="tw-text-red-400 tw-text-sm">Password tidak cocok</span>
                            </>
                          )}
                        </div>
                      )}
                    </Form.Group>

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                      <div className="tw-bg-red-500/20 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-border tw-border-red-300/30 tw-mb-4">
                        <div className="tw-flex tw-items-start tw-gap-3">
                          <AlertTriangle className="tw-w-5 tw-h-5 tw-text-red-300 tw-mt-0.5 tw-flex-shrink-0" />
                          <div>
                            <h6 className="tw-text-red-300 tw-font-semibold tw-mb-2">Perlu diperbaiki:</h6>
                            <ul className="tw-space-y-1">
                              {validationErrors.map((error, index) => (
                                <li key={index} className="tw-text-red-200 tw-text-sm tw-flex tw-items-center tw-gap-2">
                                  <div className="tw-w-1 tw-h-1 tw-bg-red-300 tw-rounded-full"></div>
                                  {error}
                                </li>
                              ))}
                            </ul>
                          </div>
                          </div>
                      </div>
                    )}
                  </Col>

                  {/* Tips Box - Takes 5/12 on medium and large screens, full width on small screens */}
                  <Col md={5} className="md:tw-pl-4">
                    <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20 tw-h-full tw-flex tw-flex-col tw-justify-center">
                      <div className="tw-text-center tw-mb-4">
                        <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-yellow-400 tw-to-orange-500 tw-rounded-full tw-mb-3 tw-shadow-lg">
                          <Shield className="tw-w-6 tw-h-6 tw-text-white" />
                        </div>
                        <h5 className="tw-text-lg tw-font-bold tw-text-white tw-mb-3">
                          🛡️ Tips Keamanan Password
                        </h5>
                      </div>
                      
                      <div className="tw-space-y-3">
                        <div className="tw-flex tw-items-start tw-gap-3 tw-bg-white/5 tw-backdrop-blur-sm tw-rounded-lg tw-p-3 tw-transition-all tw-duration-300 hover:tw-bg-white/10">
                          <div className="tw-text-green-300 tw-text-lg tw-flex-shrink-0">✅</div>
                          <span className="tw-text-sm tw-text-white/90">Gunakan minimal 8 karakter</span>
                        </div>
                        
                        <div className="tw-flex tw-items-start tw-gap-3 tw-bg-white/5 tw-backdrop-blur-sm tw-rounded-lg tw-p-3 tw-transition-all tw-duration-300 hover:tw-bg-white/10">
                          <div className="tw-text-green-300 tw-text-lg tw-flex-shrink-0">✅</div>
                          <span className="tw-text-sm tw-text-white/90">Kombinasikan huruf besar dan kecil</span>
                        </div>
                        
                        <div className="tw-flex tw-items-start tw-gap-3 tw-bg-white/5 tw-backdrop-blur-sm tw-rounded-lg tw-p-3 tw-transition-all tw-duration-300 hover:tw-bg-white/10">
                          <div className="tw-text-green-300 tw-text-lg tw-flex-shrink-0">✅</div>
                          <span className="tw-text-sm tw-text-white/90">Sertakan angka dan simbol (@, #, $, %)</span>
                        </div>
                        
                        <div className="tw-flex tw-items-start tw-gap-3 tw-bg-white/5 tw-backdrop-blur-sm tw-rounded-lg tw-p-3 tw-transition-all tw-duration-300 hover:tw-bg-white/10">
                          <div className="tw-text-yellow-300 tw-text-lg tw-flex-shrink-0">⚠️</div>
                          <span className="tw-text-sm tw-text-white/90">Hindari informasi pribadi</span>
                        </div>
                        
                        <div className="tw-flex tw-items-start tw-gap-3 tw-bg-white/5 tw-backdrop-blur-sm tw-rounded-lg tw-p-3 tw-transition-all tw-duration-300 hover:tw-bg-white/10">
                          <div className="tw-text-blue-300 tw-text-lg tw-flex-shrink-0">🔄</div>
                          <span className="tw-text-sm tw-text-white/90">Ganti password secara berkala</span>
                        </div>

                        <div className="tw-flex tw-items-start tw-gap-3 tw-bg-white/5 tw-backdrop-blur-sm tw-rounded-lg tw-p-3 tw-transition-all tw-duration-300 hover:tw-bg-white/10">
                          <div className="tw-text-purple-300 tw-text-lg tw-flex-shrink-0">🚫</div>
                          <span className="tw-text-sm tw-text-white/90">Jangan gunakan password yang sama</span>
                        </div>
                      </div>

                      {/* Password Strength Indicator in Tips */}
                      <div className="tw-mt-6 tw-pt-4 tw-border-t tw-border-white/20">
                        <div className="tw-text-center tw-mb-3">
                          <h6 className="tw-text-white tw-font-semibold tw-text-sm">Status Password Baru</h6>
                        </div>
                        <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                          <div className={`tw-w-3 tw-h-3 tw-rounded-full tw-transition-all tw-duration-500 ${
                            passwordStrength.score >= 4 ? 'tw-bg-green-400 tw-shadow-lg tw-shadow-green-400/50' :
                            passwordStrength.score >= 3 ? 'tw-bg-yellow-400 tw-shadow-lg tw-shadow-yellow-400/50' :
                            passwordStrength.score >= 2 ? 'tw-bg-orange-400 tw-shadow-lg tw-shadow-orange-400/50' :
                            passwordStrength.score >= 1 ? 'tw-bg-red-400 tw-shadow-lg tw-shadow-red-400/50' : 'tw-bg-gray-400'
                          }`}></div>
                          <span className={`tw-text-sm tw-font-medium ${passwordStrength.color}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Submit Button */}
              <div className="tw-text-center tw-mt-8">
                <Button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className={`tw-border-0 tw-px-8 tw-py-4 tw-rounded-xl tw-font-bold tw-text-lg tw-shadow-lg tw-transition-all tw-duration-300 tw-text-white ${
                    isFormValid && !isLoading
                      ? 'tw-bg-gradient-to-r tw-from-purple-500 tw-to-violet-600 hover:tw-shadow-xl hover:tw-scale-105 hover:tw-from-purple-600 hover:tw-to-violet-700'
                      : 'tw-bg-gray-500/50 tw-cursor-not-allowed tw-opacity-70'
                  }`}
                  style={{ minWidth: '250px' }}
                >
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                    {isLoading ? (
                      <>
                        <div className="tw-animate-spin tw-rounded-full tw-h-5 tw-w-5 tw-border-b-2 tw-border-white"></div>
                        <span>Mengubah Password...</span>
                      </>
                    ) : !isFormValid ? (
                      <>
                        <Lock className="tw-w-5 tw-h-5 tw-opacity-60" />
                        <span>Lengkapi Form</span>
                      </>
                    ) : (
                      <>
                        <Shield className="tw-w-5 tw-h-5" />
                        <span>🔐 Ubah Password</span>
                        <Sparkles className="tw-w-5 tw-h-5" />
                      </>
                    )}
                  </div>
                </Button>
                
                {/* Form Status Info */}
                <div className="tw-mt-4">
                  {!isFormValid && (
                    <p className="tw-text-white/70 tw-text-sm tw-flex tw-items-center tw-justify-center tw-gap-2">
                      <Info className="tw-w-4 tw-h-4" />
                      Pastikan semua field terisi dengan benar dan password cukup kuat
                    </p>
                  )}
                  {isFormValid && (
                    <p className="tw-text-green-300 tw-text-sm tw-flex tw-items-center tw-justify-center tw-gap-2">
                      <CheckCircle className="tw-w-4 tw-h-4" />
                      Form siap untuk disubmit
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Security Tips */}
              <div className="tw-bg-gradient-to-br tw-from-blue-500/20 tw-to-cyan-500/20 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-mt-8 tw-border tw-border-white/20 tw-shadow-lg">
                <div className="tw-text-center tw-mb-4">
                  <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-12 tw-h-12 tw-bg-gradient-to-br tw-from-blue-400 tw-to-cyan-500 tw-rounded-full tw-mb-3 tw-shadow-lg">
                    <Zap className="tw-w-6 tw-h-6 tw-text-white" />
                  </div>
                  <h5 className="tw-text-lg tw-font-bold tw-text-white tw-mb-2">
                    🔒 Keamanan Akun
                  </h5>
                  <p className="tw-text-white/80 tw-text-sm">Tips tambahan untuk menjaga keamanan akun Anda</p>
                </div>
                
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-text-center tw-border tw-border-white/20 tw-transition-all tw-duration-300 hover:tw-bg-white/15 hover:tw-scale-105">
                    <div className="tw-text-2xl tw-mb-3">🔐</div>
                    <h6 className="tw-font-bold tw-text-white tw-mb-2">Password Kuat</h6>
                    <p className="tw-text-white/80 tw-text-sm tw-leading-relaxed">Kombinasi karakter yang kompleks dan sulit ditebak</p>
                  </div>
                  
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-text-center tw-border tw-border-white/20 tw-transition-all tw-duration-300 hover:tw-bg-white/15 hover:tw-scale-105">
                    <div className="tw-text-2xl tw-mb-3">🚫</div>
                    <h6 className="tw-font-bold tw-text-white tw-mb-2">Jangan Bagikan</h6>
                    <p className="tw-text-white/80 tw-text-sm tw-leading-relaxed">Password adalah rahasia pribadi yang tidak boleh dibagikan</p>
                  </div>
                  
                  <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-text-center tw-border tw-border-white/20 tw-transition-all tw-duration-300 hover:tw-bg-white/15 hover:tw-scale-105">
                    <div className="tw-text-2xl tw-mb-3">🔄</div>
                    <h6 className="tw-font-bold tw-text-white tw-mb-2">Update Rutin</h6>
                    <p className="tw-text-white/80 tw-text-sm tw-leading-relaxed">Ganti password secara berkala untuk keamanan maksimal</p>
                  </div>
                </div>

                {/* Additional Security Features */}
                <div className="tw-mt-6 tw-pt-6 tw-border-t tw-border-white/20">
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                    <div className="tw-bg-white/5 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-border tw-border-white/10">
                      <div className="tw-flex tw-items-center tw-gap-3 tw-mb-3">
                        <div className="tw-w-8 tw-h-8 tw-bg-green-500/20 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                          <CheckCircle className="tw-w-5 tw-h-5 tw-text-green-400" />
                        </div>
                        <h6 className="tw-font-semibold tw-text-white">Aktivitas Login</h6>
                      </div>
                      <p className="tw-text-white/70 tw-text-sm">
                        Monitor aktivitas login Anda dan laporkan jika ada yang mencurigakan
                      </p>
                    </div>
                    
                    <div className="tw-bg-white/5 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-border tw-border-white/10">
                      <div className="tw-flex tw-items-center tw-gap-3 tw-mb-3">
                        <div className="tw-w-8 tw-h-8 tw-bg-blue-500/20 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                          <Shield className="tw-w-5 tw-h-5 tw-text-blue-400" />
                        </div>
                        <h6 className="tw-font-semibold tw-text-white">Perangkat Terpercaya</h6>
                      </div>
                      <p className="tw-text-white/70 tw-text-sm">
                        Pastikan logout dari perangkat yang tidak Anda kenali atau gunakan
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="tw-bg-gradient-to-r tw-from-amber-500/20 tw-to-orange-500/20 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-mt-6 tw-border tw-border-amber-300/30 tw-shadow-lg">
                <div className="tw-flex tw-items-start tw-gap-4">
                  <div className="tw-w-10 tw-h-10 tw-bg-amber-500/30 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-flex-shrink-0">
                    <AlertTriangle className="tw-w-6 tw-h-6 tw-text-amber-300" />
                  </div>
                  <div>
                    <h6 className="tw-font-bold tw-text-white tw-mb-2">⚠️ Penting untuk Diperhatikan</h6>
                    <div className="tw-space-y-2 tw-text-white/90 tw-text-sm">
                      <p>• Setelah mengubah password, Anda akan logout otomatis dari semua perangkat</p>
                      <p>• Pastikan Anda mengingat password baru yang telah dibuat</p>
                      <p>• Jika lupa password, gunakan fitur reset password melalui email</p>
                      <p>• Hubungi support jika mengalami kesulitan dalam mengubah password</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="tw-text-center tw-mt-8 tw-pt-6 tw-border-t tw-border-white/20">
                <p className="tw-text-white/70 tw-text-sm tw-mb-4">
                  Butuh bantuan? Hubungi tim support kami
                </p>
                <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-4">
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="tw-bg-white/10 tw-backdrop-blur-sm tw-border-white/30 tw-text-white tw-font-medium tw-px-4 tw-py-2 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-white/20"
                  >
                    📧 Email Support
                  </Button>
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="tw-bg-white/10 tw-backdrop-blur-sm tw-border-white/30 tw-text-white tw-font-medium tw-px-4 tw-py-2 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-white/20"
                  >
                    💬 Live Chat
                  </Button>
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="tw-bg-white/10 tw-backdrop-blur-sm tw-border-white/30 tw-text-white tw-font-medium tw-px-4 tw-py-2 tw-rounded-lg tw-transition-all tw-duration-300 hover:tw-bg-white/20"
                  >
                    📚 FAQ
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default ChangePass;