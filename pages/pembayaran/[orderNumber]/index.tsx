'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Container, Spinner, Alert, Button, Card, Badge } from 'react-bootstrap';
import { 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  Clock, 
  CheckCircle, 
  Zap, 
  Heart, 
  Star,
  Sparkles,
  Trophy,
  Lock
} from 'lucide-react';
import NavigationBar from '../../../components/layout/NavigationBar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

interface OrderResponse {
  success: boolean;
  data: {
    order_number: string;
    midtrans_token: string;
    midtrans_url: string;
    expired_at: string;
  };
  message?: string;
}

// Extend Window interface for Midtrans
declare global {
  interface Window {
    snap?: {
      embed: (
        token: string,
        options: {
          embedId: string;
          onSuccess?: () => void;
          onError?: (error: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string;

  const [loading, setLoading] = useState<boolean>(true);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<boolean>(false);

  // 1) Load Midtrans Snap.js once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!document.getElementById('midtrans-script')) {
      const script = document.createElement('script');
      script.id = 'midtrans-script';
      // For inline embed we need snap.js (v1) that supports .embed()
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setError('Gagal memuat script Midtrans');
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  // 2) Fetch Midtrans token from backend
  useEffect(() => {
    if (!orderNumber) return;

    const fetchOrderData = async (): Promise<void> => {
      try {
        const res = await axios.get<OrderResponse>(
          `${API_URL}/checkout/order/${orderNumber}`, 
          { withCredentials: true }
        );
        
        if (res.data.success) {
          setSnapToken(res.data.data.midtrans_token);
        } else {
          setError(res.data.message || 'Gagal mengambil token pembayaran');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderNumber]);

  // 3) After script & token ready, embed inline
  useEffect(() => {
    if (loading || error || !scriptLoaded || !snapToken || typeof window === 'undefined') return;

    // Clear any existing snap instance first
    const snapContainer = document.getElementById('snap-container');
    if (snapContainer) {
      snapContainer.innerHTML = '';
    }

    // Wait a bit to ensure container is ready and no conflicting states
    const timer = setTimeout(() => {
      if (window.snap && typeof window.snap.embed === 'function') {
        try {
          window.snap.embed(snapToken, {
            embedId: 'snap-container',
            onSuccess: () => {
              setShowSuccessAnimation(true);
              setTimeout(() => {
                router.push(`/`);
              }, 2000);
            },
            onError: (e: any) => setError('Error pembayaran: ' + JSON.stringify(e)),
            onClose: () => console.log('Customer closed Snap'),
          });
        } catch (err: any) {
          // If state transition error, try to reload the page
          if (err.message.includes('Invalid state transition')) {
            console.log('State transition error, reloading...');
            window.location.reload();
          } else {
            setError('Error saat embed pembayaran: ' + err.message);
          }
        }
      } else {
        setError('Tidak dapat menemukan method snap.embed(). Coba cek versi script.');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [loading, error, scriptLoaded, snapToken, router, orderNumber]);

  const handleBack = (): void => {
    router.back();
  };

  if (loading) {
    return (
      <div className="tw-h-full" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh'}}>
        <NavigationBar />
        <div className="tw-relative tw-overflow-hidden tw-pb-12" style={{minHeight: '100vh'}}>
          <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-violet-600/20 tw-to-purple-800/20"></div>
          <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
          <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
          
          <div className="tw-relative tw-z-10 tw-flex tw-justify-center tw-items-center tw-h-full tw-min-h-screen">
            <div className="tw-text-center">
              <div className="tw-mb-6">
                <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-bg-gradient-to-br tw-from-purple-500 tw-to-pink-500 tw-rounded-full tw-mb-4 tw-animate-bounce">
                  <CreditCard size={24} className="tw-text-white" />
                </div>
              </div>
              <Spinner animation="border" variant="light" className="tw-mb-4" style={{ width: '3rem', height: '3rem' }} />
              <p className="tw-text-white tw-font-medium tw-text-lg tw-mb-2">Menyiapkan pembayaran...</p>
              <p className="tw-text-white/80 tw-text-sm">Sebentar ya, lagi ngecek semuanya! ✨</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tw-h-full" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh'}}>
        <NavigationBar />
        <div className="tw-relative tw-overflow-hidden tw-pb-12" style={{minHeight: '100vh'}}>
          <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-violet-600/20 tw-to-purple-800/20"></div>
          <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
          <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
          
          <div className="tw-relative tw-z-10">
            <Container fluid className="tw-px-2 tw-px-md-3 tw-py-4 tw-py-md-5">
              <Button 
                variant="outline-light" 
                onClick={handleBack}
                className="tw-mb-4 tw-border-2 tw-border-white/50 tw-text-white hover:tw-bg-white/10 tw-backdrop-blur-sm tw-transition-all tw-duration-300 tw-px-3 tw-py-2"
                size="sm"
              >
                <ArrowLeft size={18} className="tw-me-2" />
                Kembali
              </Button>

              <div className="tw-text-center tw-mb-6">
                <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-bg-gradient-to-br tw-from-red-500 tw-to-pink-500 tw-rounded-full tw-mb-4">
                  <span className="tw-text-white tw-text-2xl">😅</span>
                </div>
                <h2 className="tw-text-2xl tw-text-white tw-font-bold tw-mb-3">Oops! Ada Masalah Nih</h2>
              </div>

              <Alert variant="danger" className="tw-bg-red-50/95 tw-backdrop-blur-sm tw-border-red-200 tw-border-2 tw-text-center tw-py-4">
                <div className="tw-flex tw-flex-col tw-items-center tw-gap-3">
                  <div className="tw-w-12 tw-h-12 tw-bg-red-500 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                    <span className="tw-text-white tw-font-bold tw-text-xl">!</span>
                  </div>
                  <div>
                    <h4 className="tw-font-bold tw-text-red-800 tw-mb-2">Waduh, Ada Error!</h4>
                    <p className="tw-text-red-700 tw-mb-3">{error}</p>
                    <Button 
                      variant="outline-danger"
                      onClick={handleBack}
                      className="tw-rounded-xl tw-px-4 tw-py-2"
                    >
                      <ArrowLeft size={16} className="tw-me-2" />
                      Coba Lagi
                    </Button>
                  </div>
                </div>
              </Alert>
            </Container>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-h-full" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh'}}>
      <NavigationBar />
      
      {/* Success Animation */}
      {showSuccessAnimation && (
        <div className="tw-fixed tw-inset-0 tw-pointer-events-none tw-z-40">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="tw-absolute tw-animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              {Math.random() > 0.5 ? (
                <Star 
                  size={Math.random() * 20 + 10} 
                  className="tw-text-yellow-300" 
                />
              ) : (
                <Heart 
                  size={Math.random() * 16 + 8} 
                  className="tw-text-pink-300" 
                />
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="tw-relative tw-overflow-hidden tw-pb-32" style={{minHeight: '100vh'}}>
        {/* Background Effects */}
        <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-violet-600/20 tw-to-purple-800/20"></div>
        <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
        <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
        <div className="tw-absolute tw-top-1/2 tw-left-1/4 tw-w-16 tw-h-16 tw-bg-blue-300/20 tw-rounded-full tw-blur-xl tw-animate-pulse tw-delay-500"></div>
        <div className="tw-absolute tw-top-1/4 tw-right-1/3 tw-w-12 tw-h-12 tw-bg-green-300/20 tw-rounded-full tw-blur-lg tw-animate-pulse tw-delay-700"></div>
        
        <div className="tw-relative tw-z-10">
          <Container fluid className="tw-px-2 tw-px-md-3 tw-py-4 tw-py-md-5">
            {/* Header */}
            <div className="tw-mb-4 tw-mb-md-5">
              <Button 
                variant="outline-light" 
                onClick={handleBack}
                className="tw-mb-3 tw-mb-md-4 tw-border-2 tw-border-white/50 tw-text-white hover:tw-bg-white/10 tw-backdrop-blur-sm tw-transition-all tw-duration-300 tw-px-3 tw-py-2"
                size="sm"
              >
                <ArrowLeft size={18} className="tw-me-2" />
                Kembali
              </Button>
              
              <div className="tw-text-center">
                <div className="tw-inline-flex tw-items-center tw-gap-2 tw-gap-md-3 tw-mb-3 tw-mb-md-4">
                  <div className="tw-p-3 tw-p-md-4 tw-bg-gradient-to-br tw-from-green-500 tw-to-teal-600 tw-rounded-full tw-text-white tw-shadow-2xl tw-animate-bounce">
                    <CreditCard size={24} className="tw-d-md-none" />
                    <CreditCard size={32} className="tw-d-none tw-d-md-block" />
                  </div>
                  <h1 className="tw-text-2xl tw-text-md-4xl tw-font-bold tw-text-white tw-mb-0 tw-drop-shadow-lg">
                    Waktunya Bayar! 💳
                  </h1>
                </div>
                <p className="tw-text-white/90 tw-text-base tw-text-md-lg tw-drop-shadow tw-flex tw-items-center tw-justify-center tw-gap-2 tw-flex-wrap">
                  <Sparkles size={18} className="tw-text-yellow-300" />
                  <span className="tw-text-center">Order #{orderNumber} - Almost done!</span>
                  <Sparkles size={18} className="tw-text-yellow-300" />
                </p>
              </div>
            </div>

            {/* Payment Container */}
            <div className="tw-max-w-6xl tw-mx-auto tw-px-1">
              <Card className="tw-border-0 tw-shadow-2xl tw-bg-white/95 tw-backdrop-blur-sm tw-overflow-hidden tw-mb-4">
                <Card.Header className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 tw-text-white tw-border-0 tw-p-3 tw-p-md-4">
                  <div className="tw-flex tw-items-center tw-justify-between tw-flex-wrap tw-gap-3">
                    <div className="tw-flex tw-items-center tw-gap-2 tw-gap-md-3">
                      <div className="tw-w-8 tw-w-md-10 tw-h-8 tw-h-md-10 tw-bg-white/20 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                        <Zap size={16} className="tw-d-md-none" />
                        <Zap size={20} className="tw-d-none tw-d-md-block" />
                      </div>
                      <div>
                        <h4 className="tw-font-bold tw-mb-0 tw-text-base tw-text-md-lg">Pilih Metode Pembayaran</h4>
                        <p className="tw-text-white/80 tw-mb-0 tw-text-xs tw-text-md-sm">
                          Pilih yang paling nyaman buat kamu!
                        </p>
                      </div>
                    </div>
                    <Badge bg="success" className="tw-px-3 tw-py-2 tw-text-sm tw-rounded-full">
                      <Lock size={12} className="tw-me-1" />
                      Secure
                    </Badge>
                  </div>
                </Card.Header>
                
                <Card.Body className="tw-p-0">
                  {/* Container for inline embed */}
                  <div
                    id="snap-container"
                    className="tw-w-full tw-rounded-lg"
                    style={{
                      minHeight: '850px',
                      padding: '8px',
                    }}
                  />
                </Card.Body>
              </Card>

              {/* Additional Info */}
              <div className="tw-text-center tw-mt-4">
                <p className="tw-text-white/80 tw-text-sm">
                  Kalau pembayaran tidak muncul otomatis, coba refresh halaman ya! 
                  <span className="tw-ml-1">🔄</span>
                </p>
                <div className="tw-flex tw-items-center tw-justify-center tw-gap-4 tw-mt-3 tw-flex-wrap">
                  <span className="tw-flex tw-items-center tw-gap-1 tw-text-white/70 tw-text-xs">
                    <CheckCircle size={14} className="tw-text-green-300" />
                    SSL Protected
                  </span>
                  <span className="tw-flex tw-items-center tw-gap-1 tw-text-white/70 tw-text-xs">
                    <Shield size={14} className="tw-text-blue-300" />
                    Bank Grade Security
                  </span>
                  <span className="tw-flex tw-items-center tw-gap-1 tw-text-white/70 tw-text-xs">
                    <Heart size={14} className="tw-text-pink-300" />
                    Trusted by 100K+ Users
                  </span>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
}