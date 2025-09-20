// pages/checkout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { 
  ArrowLeft, 
  ShoppingBag, 
  CreditCard, 
  Gift, 
  Star, 
  Zap, 
  Package, 
  Sparkles,
  CheckCircle,
  Trophy
} from 'lucide-react';
import NavigationBar from '../../components/layout/NavigationBar';

// Import the safe API client
import { apiClient } from '../../lib/api/client';

interface CartItem {
  product_id: number;
  quantity: number;
  name: string;
  current_price: number;
}

interface CheckoutData {
  selectedIds: number[];
  items: CartItem[];
}

interface CheckoutSummaryItem extends CartItem {
  subtotal: number;
}

interface CheckoutResponse {
  success: boolean;
  data: {
    orderNumber: string;
  };
  message?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [promo, setPromo] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Set mounted state after component mounts (SSR fix)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only access sessionStorage after component is mounted
    if (!mounted) return;

    try {
      const storedData = sessionStorage.getItem('checkoutData');
      if (storedData) {
        const data: CheckoutData = JSON.parse(storedData);
        setCheckoutData(data);
        // Show confetti animation when page loads
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        router.push('/keranjang');
      }
    } catch (err) {
      console.error('Error parsing checkout data:', err);
      router.push('/keranjang');
    }
  }, [mounted, router]);

  // Don't render until mounted and data is loaded
  if (!mounted || !checkoutData) {
    return (
      <div className="tw-h-full" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh'}}>
        <NavigationBar />
        <div className="tw-relative tw-overflow-hidden tw-pb-12" style={{minHeight: '100vh'}}>
          <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-violet-600/20 tw-to-purple-800/20"></div>
          <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
          <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
          
          <div className="tw-relative tw-z-10 tw-flex tw-justify-center tw-items-center tw-h-full tw-min-h-screen">
            <div className="tw-text-center">
              <Spinner animation="border" variant="light" className="tw-mb-4" style={{ width: '3rem', height: '3rem' }} />
              <p className="tw-text-white tw-font-medium tw-text-lg">Memuat checkout...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { items, selectedIds } = checkoutData;
  const summary: CheckoutSummaryItem[] = items
    .filter(i => selectedIds.includes(i.product_id))
    .map(i => ({
      ...i,
      subtotal: i.current_price * i.quantity
    }));
  
  const gross = summary.reduce((sum, i) => sum + i.subtotal, 0);
  const net = gross - promo;

  const handlePay = async (): Promise<void> => {
    setProcessing(true);
    setError(null);
    try {
      // Use the safe API client
      const res = await apiClient.post('/checkout/process', { 
        selectedProductIds: selectedIds, 
        promoData: { amount: promo } 
      });

      if (res.success) {
        // Clear checkout data from sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('checkoutData');
        }
        // Navigate to embedded payment page
        router.push(`/pembayaran/${res.data.orderNumber}`);
      } else {
        setError(res.message || 'Checkout gagal');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Terjadi kesalahan saat memproses checkout');
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = (): void => {
    router.back();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  return (
    <div className="tw-h-full" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh'}}>
      <NavigationBar />
      
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="tw-fixed tw-inset-0 tw-pointer-events-none tw-z-40">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="tw-absolute tw-w-2 tw-h-2 tw-animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'][Math.floor(Math.random() * 7)],
                animationDelay: `${Math.random() * 2}s`,
                borderRadius: '50%'
              }}
            />
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
          <Container fluid className="tw-px-3 tw-px-md-4 tw-py-4 tw-py-md-5">
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
                  <div className="tw-p-3 tw-p-md-4 tw-bg-gradient-to-br tw-from-pink-500 tw-to-purple-600 tw-rounded-full tw-text-white tw-shadow-2xl tw-animate-bounce">
                    <CreditCard size={24} className="tw-d-md-none" />
                    <CreditCard size={32} className="tw-d-none tw-d-md-block" />
                  </div>
                  <h1 className="tw-text-2xl tw-text-md-4xl tw-font-bold tw-text-white tw-mb-0 tw-drop-shadow-lg">
                    Checkout Yuk! 🎉
                  </h1>
                </div>
                <p className="tw-text-white/90 tw-text-base tw-text-md-lg tw-drop-shadow tw-flex tw-items-center tw-justify-center tw-gap-2 tw-flex-wrap">
                  <Sparkles size={18} className="tw-text-yellow-300" />
                  <span className="tw-text-center">Tinggal selangkah lagi menuju kesuksesan!</span>
                  <Sparkles size={18} className="tw-text-yellow-300" />
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="danger" className="tw-mb-3 tw-mb-md-4 tw-bg-red-50/95 tw-backdrop-blur-sm tw-border-red-200 tw-border-2 tw-mx-2 tw-mx-md-0">
                <div className="tw-flex tw-items-center tw-gap-2">
                  <div className="tw-w-6 tw-w-md-8 tw-h-6 tw-h-md-8 tw-bg-red-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-flex-shrink-0">
                    <span className="tw-text-white tw-font-bold tw-text-sm">!</span>
                  </div>
                  <span className="tw-text-sm tw-text-md-base">{error}</span>
                </div>
              </Alert>
            )}

            <Row className="tw-g-3 tw-g-lg-4">
              {/* Left Column - Items */}
              <Col lg={8} className="tw-mb-3 tw-mb-lg-4">
                <Card className="tw-border-0 tw-shadow-2xl tw-bg-white/95 tw-backdrop-blur-sm tw-overflow-hidden">
                  <Card.Header className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 tw-text-white tw-border-0 tw-p-3 tw-p-md-4">
                    <div className="tw-flex tw-items-center tw-gap-2 tw-gap-md-3">
                      <div className="tw-w-8 tw-w-md-10 tw-h-8 tw-h-md-10 tw-bg-white/20 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                        <ShoppingBag size={16} className="tw-d-md-none" />
                        <ShoppingBag size={20} className="tw-d-none tw-d-md-block" />
                      </div>
                      <div>
                        <h4 className="tw-font-bold tw-mb-0 tw-text-base tw-text-md-lg">Paket yang Dipilih</h4>
                        <p className="tw-text-white/80 tw-mb-0 tw-text-xs tw-text-md-sm">
                          {summary.length} item siap dibeli
                        </p>
                      </div>
                    </div>
                  </Card.Header>
                  
                  <Card.Body className="tw-p-0">
                    {summary.map((item, index) => (
                      <div 
                        key={item.product_id} 
                        className={`tw-p-3 tw-p-md-4 tw-transition-all tw-duration-300 hover:tw-bg-purple-50 ${
                          index !== summary.length - 1 ? 'tw-border-b tw-border-purple-100' : ''
                        }`}
                      >
                        <Row className="tw-align-items-center">
                          <Col xs={7} sm={8}>
                            <div className="tw-flex tw-items-start tw-gap-2 tw-gap-md-3">
                              <div className="tw-w-10 tw-w-md-12 tw-h-10 tw-h-md-12 tw-bg-gradient-to-br tw-from-purple-500 tw-to-pink-500 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-flex-shrink-0">
                                <Trophy className="tw-w-5 tw-w-md-6 tw-h-5 tw-h-md-6 tw-text-white" />
                              </div>
                              <div className="tw-min-w-0">
                                <h5 className="tw-font-bold tw-text-gray-800 tw-mb-1 tw-text-sm tw-text-md-base tw-line-clamp-2">
                                  {item.name}
                                </h5>
                                <div className="tw-flex tw-flex-col tw-gap-1 tw-text-xs tw-text-md-sm sm:tw-flex-row sm:tw-items-center sm:tw-gap-3">
                                  <span className="tw-flex tw-items-center tw-gap-1 tw-text-purple-600">
                                    <Package size={12} className="tw-flex-shrink-0" />
                                    Qty: {item.quantity}
                                  </span>
                                  <span className="tw-flex tw-items-center tw-gap-1 tw-text-gray-600">
                                    <Star size={12} className="tw-text-yellow-500 tw-flex-shrink-0" />
                                    Premium Package
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Col>
                          <Col xs={5} sm={4} className="tw-text-right">
                            <div className="tw-text-sm tw-text-md-lg tw-font-bold tw-text-purple-700">
                              {formatCurrency(item.subtotal)}
                            </div>
                            <div className="tw-text-xs tw-text-md-sm tw-text-gray-500">
                              @{formatCurrency(item.current_price)}
                            </div>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>

              {/* Right Column - Summary */}
              <Col lg={4}>
                <Card className="tw-border-0 tw-shadow-2xl tw-bg-white/95 tw-backdrop-blur-sm tw-sticky tw-top-4">
                  <Card.Header className="tw-bg-gradient-to-r tw-from-green-500 tw-to-teal-500 tw-text-white tw-border-0 tw-p-3 tw-p-md-4">
                    <div className="tw-flex tw-items-center tw-gap-2 tw-gap-md-3">
                      <div className="tw-w-8 tw-w-md-10 tw-h-8 tw-h-md-10 tw-bg-white/20 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                        <Gift size={16} className="tw-d-md-none" />
                        <Gift size={20} className="tw-d-none tw-d-md-block" />
                      </div>
                      <div>
                        <h4 className="tw-font-bold tw-mb-0 tw-text-base tw-text-md-lg">Ringkasan Pesanan</h4>
                        <p className="tw-text-white/80 tw-mb-0 tw-text-xs tw-text-md-sm">
                          Cek sekali lagi ya!
                        </p>
                      </div>
                    </div>
                  </Card.Header>
                  
                  <Card.Body className="tw-p-3 tw-p-md-4">
                    {/* Promo Input */}
                    <div className="tw-mb-4">
                      <Form.Label className="tw-font-semibold tw-text-gray-700 tw-flex tw-items-center tw-gap-2">
                        <Zap size={16} className="tw-text-yellow-500" />
                        Kode Promo (Opsional)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        value={promo}
                        min={0}
                        max={gross}
                        onChange={e => setPromo(Number(e.target.value))}
                        placeholder="Masukkan nominal diskon"
                        disabled={processing}
                        className="tw-border-purple-200 tw-rounded-xl tw-py-3 tw-px-4 tw-bg-purple-50/50 focus:tw-border-purple-400 focus:tw-shadow-lg tw-transition-all tw-duration-300"
                      />
                      <div className="tw-text-xs tw-text-gray-500 tw-mt-1">
                        Maksimal: {formatCurrency(gross)}
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="tw-space-y-3 tw-mb-4">
                      <div className="tw-flex tw-justify-between tw-items-center">
                        <span className="tw-text-gray-600">Subtotal ({summary.length} item)</span>
                        <span className="tw-font-semibold tw-text-gray-800">
                          {formatCurrency(gross)}
                        </span>
                      </div>
                      
                      {promo > 0 && (
                        <div className="tw-flex tw-justify-between tw-items-center tw-text-green-600">
                          <span className="tw-flex tw-items-center tw-gap-1">
                            <Gift size={14} />
                            Diskon Promo
                          </span>
                          <span className="tw-font-semibold">
                            -{formatCurrency(promo)}
                          </span>
                        </div>
                      )}
                      
                      <div className="tw-border-t tw-border-purple-200 tw-pt-3">
                        <div className="tw-flex tw-justify-between tw-items-center">
                          <span className="tw-text-lg tw-font-bold tw-text-gray-800">
                            Total Pembayaran
                          </span>
                          <span className="tw-text-2xl tw-font-bold tw-text-purple-700">
                            {formatCurrency(net)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Button */}
                    <Button
                      onClick={handlePay}
                      disabled={processing}
                      className="tw-w-full tw-py-3 tw-rounded-xl tw-font-bold tw-text-lg tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 hover:tw-from-purple-700 hover:tw-to-pink-700 tw-border-0 tw-shadow-xl hover:tw-shadow-2xl tw-transition-all tw-duration-300 hover:tw-scale-105"
                    >
                      {processing ? (
                        <div className="tw-flex tw-items-center tw-justify-center tw-gap-3">
                          <Spinner animation="border" size="sm" />
                          <span>Memproses...</span>
                        </div>
                      ) : (
                        <div className="tw-flex tw-items-center tw-justify-center tw-gap-3">
                          <Zap size={20} />
                          <span>Bayar Sekarang!</span>
                          <CheckCircle size={20} />
                        </div>
                      )}
                    </Button>

                    {/* Security Note */}
                    <div className="tw-mt-4 tw-text-center tw-text-sm tw-text-gray-500">
                      <div className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-mb-2">
                        <div className="tw-w-4 tw-h-4 tw-bg-green-500 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                          <CheckCircle size={12} className="tw-text-white" />
                        </div>
                        <span>Pembayaran 100% Aman</span>
                      </div>
                      <p className="tw-text-xs tw-text-gray-400">
                        Dipayungi sistem keamanan terdepan
                      </p>
                    </div>
                  </Card.Body>
                </Card>

                {/* Motivational Quote */}
                <Card className="tw-border-0 tw-bg-gradient-to-br tw-from-yellow-400 tw-to-orange-500 tw-text-white tw-mt-3 tw-text-center tw-d-none tw-d-lg-block">
                  <Card.Body className="tw-p-4">
                    <Star size={24} className="tw-mb-2 tw-text-yellow-200" />
                    <p className="tw-font-semibold tw-mb-2">
                      "Investasi terbaik adalah investasi pada diri sendiri!"
                    </p>
                    <p className="tw-text-sm tw-opacity-90">
                      🚀 Siap jadi yang terdepan? Let's go!
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
}