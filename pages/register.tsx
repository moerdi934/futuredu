import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaGoogle, FaUserAlt, FaEnvelope, FaLock, FaRegEye, FaRegEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import SuccessModal from '../components/modals/auth/SuccessModal';
import FailureModal from '../components/modals/auth/FailureModal';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const Register: React.FC = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [termsHighlighted, setTermsHighlighted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const router = useRouter();

  // Password validation states
  const [passwordLength, setPasswordLength] = useState(false);
  const [passwordHasLetter, setPasswordHasLetter] = useState(false);
  const [passwordHasNumber, setPasswordHasNumber] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  useEffect(() => {
    // Check password requirements
    setPasswordLength(form.password.length >= 8);
    setPasswordHasLetter(/[A-Za-z]/.test(form.password));
    setPasswordHasNumber(/\d/.test(form.password));
    setPasswordsMatch(form.password === form.confirmPassword && form.password !== '');
  }, [form.password, form.confirmPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password: string) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(password);
  };

  const toggleTermsChecked = () => {
    setTermsChecked(!termsChecked);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateEmail(form.email)) {
      setModalMessage('Please enter a valid email.');
      setShowFailureModal(true);
      setIsLoading(false);
      return;
    }
    if (!validatePassword(form.password)) {
      setModalMessage('Password must be at least 8 characters long and include both letters and numbers.');
      setShowFailureModal(true);
      setIsLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setModalMessage('Passwords do not match.');
      setShowFailureModal(true);
      setIsLoading(false);
      return;
    }
    if (!termsChecked) {
      setModalMessage('You must agree to the terms and conditions.');
      setShowFailureModal(true);
      setTermsHighlighted(true);
      setTimeout(() => setTermsHighlighted(false), 3000);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/users/register`, {
        username: form.username,
        email: form.email,
        password: form.password,
        captchaToken
      });
      setModalMessage('Registration successful!');
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('There was an error registering!', error);
      let errorMessage = 'Registration failed: Username or email may be in use.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      setModalMessage(errorMessage);
      setShowFailureModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push('/login');
  };

  const handleFailureClose = () => {
    setShowFailureModal(false);
  };

  return (
    <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-gradient-to-br tw-from-purple-900 tw-via-purple-700 tw-to-indigo-800 tw-py-8 tw-px-4 sm:tw-px-6 lg:tw-px-8">
      <div className="tw-absolute tw-inset-0 tw-overflow-hidden">
        <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path d="M0,200 Q300,150 600,300 T1200,200 V800 H0 Z" fill="url(#grad1)" />
            <circle cx="200" cy="200" r="80" fill="#fff" fillOpacity="0.2" />
            <circle cx="950" cy="350" r="120" fill="#fff" fillOpacity="0.1" />
            <circle cx="500" cy="600" r="160" fill="#fff" fillOpacity="0.05" />
          </svg>
        </div>
      </div>

      <div className="tw-max-w-5xl tw-w-full tw-relative tw-z-10 tw-mx-auto">
        <div className="tw-bg-white/10 tw-backdrop-blur-lg tw-rounded-3xl tw-shadow-2xl tw-overflow-hidden tw-border tw-border-white/20">
          <div className="tw-grid md:tw-grid-cols-2 tw-h-full">
            {/* Welcome Section */}
            <div className="tw-hidden md:tw-flex tw-flex-col tw-justify-between tw-bg-gradient-to-br tw-from-purple-500/70 tw-to-purple-900/70 tw-backdrop-blur-sm tw-text-white tw-p-10 tw-relative">
              <div className="tw-absolute tw-inset-0 tw-z-0">
                <div className="tw-h-full tw-w-full tw-overflow-hidden">
                  <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-rounded-full tw-bg-purple-400/30 tw-blur-md"></div>
                  <div className="tw-absolute tw-bottom-40 tw-left-0 tw-w-32 tw-h-32 tw-rounded-full tw-bg-indigo-400/20 tw-blur-md"></div>
                  <div className="tw-absolute tw-top-1/2 tw-right-5 tw-w-16 tw-h-64 tw-rounded-full tw-bg-purple-300/20 tw-blur-sm"></div>
                </div>
              </div>
              
              <div className="tw-relative tw-z-10">
                <h1 className="tw-text-4xl tw-font-bold tw-mb-2">Join Us</h1>
                <p className="tw-text-lg tw-text-purple-100 tw-mb-6">Start your journey with us today</p>
                <div className="tw-w-12 tw-h-1 tw-bg-purple-300 tw-mb-8"></div>
                <p className="tw-text-purple-100">Create an account to access all features and services our platform has to offer.</p>
              </div>
              
              <div className="tw-relative tw-z-10">
                <div className="tw-space-y-6">
                  <p className="tw-text-purple-100">Already have an account?</p>
                  <Link href="/login">
                    <button className="tw-border-2 tw-border-white tw-bg-transparent tw-backdrop-blur-sm tw-rounded-xl tw-px-8 tw-py-3 tw-font-semibold tw-transition-all hover:tw-bg-white/20 tw-text-white">
                      Sign In
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Register Form */}
            <div className="tw-p-8 md:tw-p-10 tw-bg-white tw-rounded-3xl">
              <div className="tw-text-center tw-mb-8">
                <div className="tw-w-16 tw-h-16 tw-rounded-full tw-bg-purple-100 tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                  <div className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-purple-700 tw-flex tw-items-center tw-justify-center">
                    <FaUserAlt className="tw-text-white" />
                  </div>
                </div>
                <h2 className="tw-text-3xl tw-font-bold tw-text-gray-800 tw-mb-2">Create Account</h2>
                <p className="tw-text-gray-500">Enter your details to register</p>
              </div>
              
              <form onSubmit={handleSubmit} className="tw-space-y-5">
                <div className="tw-space-y-4">
                  <div className="tw-group">
                    <div className="tw-relative">
                      <div className="tw-absolute tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-left-4 tw-text-purple-600">
                        <FaUserAlt />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleInputChange}
                        placeholder="Username"
                        required
                        className="tw-pl-12 tw-pr-4 tw-py-4 tw-rounded-xl tw-border tw-border-purple-200 tw-bg-purple-50/50 tw-w-full focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent tw-transition-all tw-shadow-sm group-hover:tw-shadow-md focus:tw-outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="tw-group">
                    <div className="tw-relative">
                      <div className="tw-absolute tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-left-4 tw-text-purple-600">
                        <FaEnvelope />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        required
                        className="tw-pl-12 tw-pr-4 tw-py-4 tw-rounded-xl tw-border tw-border-purple-200 tw-bg-purple-50/50 tw-w-full focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent tw-transition-all tw-shadow-sm group-hover:tw-shadow-md focus:tw-outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="tw-group">
                    <div className="tw-relative">
                      <div className="tw-absolute tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-left-4 tw-text-purple-600">
                        <FaLock />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                        required
                        className="tw-pl-12 tw-pr-12 tw-py-4 tw-rounded-xl tw-border tw-border-purple-200 tw-bg-purple-50/50 tw-w-full focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent tw-transition-all tw-shadow-sm group-hover:tw-shadow-md focus:tw-outline-none"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="tw-absolute tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-right-4 tw-text-purple-600 hover:tw-text-purple-800 tw-transition-colors"
                      >
                        {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>
                  </div>

                  <div className="tw-group">
                    <div className="tw-relative">
                      <div className="tw-absolute tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-left-4 tw-text-purple-600">
                        <FaLock />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm Password"
                        required
                        className="tw-pl-12 tw-pr-12 tw-py-4 tw-rounded-xl tw-border tw-border-purple-200 tw-bg-purple-50/50 tw-w-full focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent tw-transition-all tw-shadow-sm group-hover:tw-shadow-md focus:tw-outline-none"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="tw-absolute tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-right-4 tw-text-purple-600 hover:tw-text-purple-800 tw-transition-colors"
                      >
                        {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Password validation indicators */}
                <div className="tw-bg-gray-50 tw-p-3 tw-rounded-lg tw-border tw-border-gray-200">
                  <p className="tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">Password requirements:</p>
                  <ul className="tw-space-y-1">
                    <li className="tw-flex tw-items-center tw-text-sm">
                      {passwordLength ? 
                        <FaCheck className="tw-text-green-500 tw-mr-2" /> : 
                        <FaTimes className="tw-text-red-500 tw-mr-2" />}
                      <span className={passwordLength ? "tw-text-green-700" : "tw-text-gray-600"}>
                        At least 8 characters
                      </span>
                    </li>
                    <li className="tw-flex tw-items-center tw-text-sm">
                      {passwordHasLetter ? 
                        <FaCheck className="tw-text-green-500 tw-mr-2" /> : 
                        <FaTimes className="tw-text-red-500 tw-mr-2" />}
                      <span className={passwordHasLetter ? "tw-text-green-700" : "tw-text-gray-600"}>
                        Contains letters
                      </span>
                    </li>
                    <li className="tw-flex tw-items-center tw-text-sm">
                      {passwordHasNumber ? 
                        <FaCheck className="tw-text-green-500 tw-mr-2" /> : 
                        <FaTimes className="tw-text-red-500 tw-mr-2" />}
                      <span className={passwordHasNumber ? "tw-text-green-700" : "tw-text-gray-600"}>
                        Contains numbers
                      </span>
                    </li>
                    <li className="tw-flex tw-items-center tw-text-sm">
                      {passwordsMatch ? 
                        <FaCheck className="tw-text-green-500 tw-mr-2" /> : 
                        <FaTimes className="tw-text-red-500 tw-mr-2" />}
                      <span className={passwordsMatch ? "tw-text-green-700" : "tw-text-gray-600"}>
                        Passwords match
                      </span>
                    </li>
                  </ul>
                </div>
                
                {/* Terms checkbox */}
                <div className="tw-mt-4">
                  <div 
                    className={`tw-flex tw-items-center tw-p-3 tw-rounded-lg tw-transition-all tw-cursor-pointer ${
                      termsHighlighted 
                        ? 'tw-bg-red-50 tw-border tw-border-red-300 tw-animate-pulse' 
                        : 'hover:tw-bg-purple-50'
                    }`}
                    onClick={toggleTermsChecked}
                  >
                    <div className="tw-relative tw-flex tw-items-center">
                      <input
                        type="checkbox"
                        id="terms-checkbox"
                        checked={termsChecked}
                        onChange={toggleTermsChecked}
                        required
                        className="tw-flex-shrink-0 tw-w-4 tw-h-4 tw-text-purple-600 tw-rounded focus:tw-ring-purple-500"
                      />
                      <label 
                        htmlFor="terms-checkbox" 
                        className="tw-ml-2 tw-text-gray-600 tw-text-sm tw-cursor-pointer"
                      >
                        I agree to the{' '}
                        <Link href="/terms" className="tw-text-purple-700 hover:tw-text-purple-900 tw-font-medium tw-no-underline" onClick={(e) => e.stopPropagation()}>
                          Terms of Service
                        </Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="tw-text-purple-700 hover:tw-text-purple-900 tw-font-medium tw-no-underline" onClick={(e) => e.stopPropagation()}>
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="tw-mt-2" id="recaptcha"></div>
                
                <button 
                  type="submit" 
                  className="tw-w-full tw-bg-gradient-to-r tw-from-purple-600 tw-to-purple-800 tw-text-white tw-border-0 tw-rounded-xl tw-py-4 hover:tw-from-purple-700 hover:tw-to-purple-900 tw-transition-all tw-font-medium tw-shadow-lg hover:tw-shadow-xl tw-relative tw-overflow-hidden tw-mt-6 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="tw-flex tw-items-center tw-justify-center">
                      <div className="tw-animate-spin tw-rounded-full tw-h-5 tw-w-5 tw-border-t-2 tw-border-b-2 tw-border-white tw-mr-2"></div>
                      Registering...
                    </div>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
                
                <div className="tw-relative tw-my-6">
                  <div className="tw-absolute tw-inset-0 tw-flex tw-items-center">
                    <div className="tw-w-full tw-border-t tw-border-gray-200"></div>
                  </div>
                  <div className="tw-relative tw-flex tw-justify-center tw-text-sm">
                    <span className="tw-px-3 tw-bg-white tw-text-gray-500">Or register with</span>
                  </div>
                </div>
                
                <button 
                  type="button" 
                  className="tw-w-full tw-flex tw-items-center tw-justify-center tw-gap-3 tw-rounded-xl tw-py-3 tw-border tw-border-gray-200 tw-bg-white hover:tw-bg-gray-50 tw-shadow-sm hover:tw-shadow-md tw-transition-all"
                >
                  <FaGoogle className="tw-text-red-500" /> 
                  <span className="tw-font-medium tw-text-gray-700">Register with Google</span>
                </button>
                
                <div className="tw-text-center tw-mt-8 tw-text-gray-600 md:tw-hidden">
                  <p>Already have an account?{' '}
                    <Link href="/login" className="tw-text-purple-700 tw-font-semibold tw-no-underline">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="tw-text-center tw-mt-8 tw-text-white/70 tw-text-sm">
          © {new Date().getFullYear()} Your Company Name. All rights reserved.
        </div>
      </div>

      <SuccessModal
        show={showSuccessModal}
        message={modalMessage}
        onClose={handleSuccessClose}
      />

      <FailureModal
        show={showFailureModal}
        message={modalMessage}
        onClose={handleFailureClose}
      />
    </div>
  );
};

export default Register;