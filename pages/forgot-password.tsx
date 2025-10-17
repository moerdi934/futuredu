import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Here you would add your password reset logic
    // For now, just simulating a delay
    setTimeout(() => {
      setIsLoading(false);
      // Handle form submission result
    }, 1500);
  };

  return (
    <div className="tw-h-full tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-gradient-to-br tw-from-purple-900 tw-via-purple-700 tw-to-indigo-800 tw-py-8 tw-px-4 sm:tw-px-6 lg:tw-px-8" style={{ height: '125vh' }}>
      {/* Fixed full-screen background */}
      <div className="tw-fixed tw-inset-0 tw-bg-gradient-to-br tw-from-purple-900 tw-via-purple-700 tw-to-indigo-800 -tw-z-10"></div>
      
      <div className="tw-fixed tw-inset-0 tw-overflow-hidden -tw-z-10">
        <div className="tw-w-full tw-h-full tw-opacity-10">
          {/* Abstract background pattern */}
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

      <div className="tw-max-w-lg tw-w-full tw-relative tw-z-10 tw-mx-auto tw-px-4">
        <div className="tw-bg-white/10 tw-backdrop-blur-lg tw-rounded-3xl tw-shadow-2xl tw-overflow-hidden tw-border tw-border-white/20">
          <div className="tw-bg-white tw-rounded-3xl tw-p-8 md:tw-p-10">
            <Link href="/login" className="tw-flex tw-items-center tw-text-purple-700 tw-mb-6 tw-group tw-no-underline hover:tw-no-underline">
              <FaArrowLeft className="tw-mr-2 group-hover:tw-translate-x-[-2px] tw-transition-transform" />
              <span className="tw-font-medium">Back to Login</span>
            </Link>
            
            <div className="tw-text-center tw-mb-8">
              <div className="tw-w-16 tw-h-16 tw-rounded-full tw-bg-purple-100 tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                <div className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-purple-700 tw-flex tw-items-center tw-justify-center">
                  <FaEnvelope className="tw-text-white" />
                </div>
              </div>
              <h2 className="tw-text-3xl tw-font-bold tw-text-gray-800 tw-mb-2">Forgot Password</h2>
              <p className="tw-text-gray-500">Enter your email to receive a password reset link</p>
            </div>
            
            <form onSubmit={handleSubmit} className="tw-space-y-6">
              <div className="tw-group">
                <div className="tw-relative">
                  <div className="tw-absolute tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-left-4 tw-text-purple-600">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="tw-pl-12 tw-pr-4 tw-py-4 tw-rounded-xl tw-border tw-border-purple-200 tw-bg-purple-50/50 tw-w-full focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent tw-transition-all tw-shadow-sm group-hover:tw-shadow-md focus:tw-outline-none"
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="tw-w-full tw-bg-gradient-to-r tw-from-purple-600 tw-to-purple-800 tw-text-white tw-border-0 tw-rounded-xl tw-py-4 hover:tw-from-purple-700 hover:tw-to-purple-900 tw-transition-all tw-font-medium tw-shadow-lg hover:tw-shadow-xl tw-relative tw-overflow-hidden disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="tw-flex tw-items-center tw-justify-center">
                    <div className="tw-animate-spin tw-rounded-full tw-h-5 tw-w-5 tw-border-t-2 tw-border-b-2 tw-border-white tw-mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
              
              <div className="tw-text-center tw-mt-6">
                <p className="tw-text-gray-600">
                  Remember your password?{' '}
                  <Link href="/login" className="tw-text-purple-700 tw-font-semibold hover:tw-text-purple-900 tw-transition-colors tw-no-underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
        
        <div className="tw-text-center tw-mt-8 tw-text-white/70 tw-text-sm">
          © {new Date().getFullYear()} Your Company Name. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;