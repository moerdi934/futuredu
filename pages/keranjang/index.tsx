'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Spinner, Alert, Form, Container, Row, Col, Card } from 'react-bootstrap';
import { PlusCircle, MinusCircle, Trash2, ShoppingCart, Package, Plus, Minus, CheckCircle, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NavigationBar from '../../components/layout/NavigationBar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface CartItem {
  product_id: number;
  quantity: number;
  name: string;
  description: string;
  current_price: number;
  stock: number;
}

interface CartResponse {
  success: boolean;
  data: {
    products: CartItem[];
    totalQty: number;
  };
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalQty, setTotalQty] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const router = useRouter();

  const fetchCart = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await axios.get<CartResponse>(`${API_URL}/cart`, { 
        withCredentials: true 
      });
      if (res.data.success) {
        setItems(res.data.data.products);
        setTotalQty(res.data.data.totalQty);
      } else {
        setError('Gagal memuat keranjang');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQty = async (productId: number, action: 'increase' | 'decrease'): Promise<void> => {
    try {
      await axios.put(
        `${API_URL}/cart/update`,
        { productId, action },
        { withCredentials: true }
      );
      fetchCart();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const removeItem = async (productId: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/cart/remove/${productId}`, { 
        withCredentials: true 
      });
      setSelectedIds(prev => prev.filter(id => id !== productId));
      fetchCart();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleCheckout = (): void => {
    const checkoutData = {
      selectedIds,
      items: items.filter(item => selectedIds.includes(item.product_id))
    };
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    }
    
    router.push('/checkout');
  };

  const getTotalPrice = () => {
    return items
      .filter(item => selectedIds.includes(item.product_id))
      .reduce((total, item) => total + (item.current_price * item.quantity), 0);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(item => item.product_id));
    }
  };

  const isAllSelected = selectedIds.length === items.length && items.length > 0;

  if (loading) {
    return (
      <div className="tw-h-full" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh'}}>
        <NavigationBar />
        <div className="tw-relative tw-overflow-hidden tw-pb-12" style={{minHeight: '100vh'}}>
          <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-violet-600/20 tw-to-purple-800/20"></div>
          <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
          <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
          <div className="tw-absolute tw-top-1/2 tw-left-1/4 tw-w-16 tw-h-16 tw-bg-blue-300/20 tw-rounded-full tw-blur-xl tw-animate-pulse tw-delay-500"></div>
          
          <div className="tw-relative tw-z-10 tw-flex tw-justify-center tw-items-center tw-h-full tw-min-h-screen">
            <div className="tw-text-center">
              <Spinner animation="border" variant="light" className="tw-mb-4" style={{ width: '3rem', height: '3rem' }} />
              <p className="tw-text-white tw-font-medium tw-text-lg">Memuat keranjang...</p>
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
          <div className="tw-absolute tw-top-1/2 tw-left-1/4 tw-w-16 tw-h-16 tw-bg-blue-300/20 tw-rounded-full tw-blur-xl tw-animate-pulse tw-delay-500"></div>
          
          <div className="tw-relative tw-z-10 tw-flex tw-justify-center tw-items-center tw-h-full tw-min-h-screen">
            <Alert variant="danger" className="tw-m-4 tw-max-w-md tw-bg-white/90 tw-backdrop-blur-sm tw-border-0 tw-shadow-2xl">
              <Alert.Heading>Oops! Ada kesalahan</Alert.Heading>
              <p>{error}</p>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-h-full" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '125vh'}}>
      <NavigationBar />
      
      <div className="tw-relative tw-overflow-hidden tw-pb-12" style={{minHeight: '125vh'}}>
        <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-violet-600/20 tw-to-purple-800/20"></div>
        <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
        <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
        <div className="tw-absolute tw-top-1/2 tw-left-1/4 tw-w-16 tw-h-16 tw-bg-blue-300/20 tw-rounded-full tw-blur-xl tw-animate-pulse tw-delay-500"></div>
        
        <div className="tw-relative tw-z-10">
          <Container className="tw-py-5">
            <div className="tw-text-center tw-mb-5">
              <div className="tw-inline-flex tw-items-center tw-gap-3 tw-mb-4">
                <div className="tw-p-3 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-text-white tw-border tw-border-white/30">
                  <ShoppingCart size={32} />
                </div>
                <h1 className="tw-text-4xl tw-font-bold tw-text-white tw-mb-0 tw-drop-shadow-lg">
                  Keranjang Belanja
                </h1>
              </div>
              <p className="tw-text-white/90 tw-text-lg tw-drop-shadow">
                Kelola produk yang ingin Anda beli
              </p>
            </div>

            {items.length === 0 ? (
              <div className="tw-flex tw-justify-center tw-items-center tw-min-h-[50vh]">
                <Card className="tw-border-0 tw-shadow-2xl tw-bg-white/95 tw-backdrop-blur-sm tw-max-w-md tw-w-full tw-mx-4">
                  <Card.Body className="tw-text-center tw-py-5">
                    <div className="tw-mb-4">
                      <Package size={80} className="tw-text-purple-300 tw-mx-auto" />
                    </div>
                    <h4 className="tw-text-purple-600 tw-mb-2 tw-font-bold">Keranjang Kosong</h4>
                    <p className="tw-text-purple-500 tw-mb-4">Belum ada produk di keranjang Anda</p>
                    <Button 
                      variant="primary" 
                      onClick={() => router.push('/products')}
                      className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-purple-700 tw-border-0 tw-px-4 tw-py-2 tw-font-semibold tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-300"
                    >
                      <ShoppingCart size={16} className="tw-me-2" />
                      Mulai Belanja
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            ) : (
              <>
                {/* Select All Button */}
                <div className="tw-mb-4 tw-flex tw-justify-between tw-items-center">
                  <Button
                    variant={isAllSelected ? "success" : "outline-light"}
                    onClick={toggleSelectAll}
                    className={`tw-border-2 tw-px-4 tw-py-2 tw-font-semibold tw-transition-all tw-duration-300 tw-flex tw-items-center tw-gap-2 ${
                      isAllSelected 
                        ? 'tw-bg-green-500 tw-border-green-500 tw-text-white hover:tw-bg-green-600 tw-shadow-lg' 
                        : 'tw-border-white/50 tw-text-white hover:tw-bg-white/10 tw-backdrop-blur-sm'
                    }`}
                  >
                    {isAllSelected ? <CheckCircle size={18} /> : <Circle size={18} />}
                    {isAllSelected ? 'Batalkan Semua' : 'Pilih Semua'}
                  </Button>
                  <div className="tw-text-white/90 tw-font-medium">
                    {selectedIds.length} dari {items.length} produk dipilih
                  </div>
                </div>

                <Row className="tw-g-4 tw-mb-4">
                  {items.map((item) => {
                    const checked = selectedIds.includes(item.product_id);
                    return (
                      <Col key={item.product_id} xs={12} md={6} lg={4} className="tw-mb-4">
                        <Card 
                          className={`tw-h-full tw-border-0 tw-shadow-2xl tw-bg-white/95 tw-backdrop-blur-sm tw-transition-all tw-duration-300 hover:tw-shadow-3xl hover:tw-transform hover:tw-scale-105 tw-relative tw-overflow-hidden ${
                            checked ? 'tw-ring-4 tw-ring-green-400 tw-ring-opacity-50' : ''
                          }`}
                        >
                          {/* Selection Overlay */}
                          {checked && (
                            <div className="tw-absolute tw-top-0 tw-right-0 tw-bg-green-500 tw-text-white tw-p-2 tw-rounded-bl-lg tw-z-10">
                              <CheckCircle size={20} />
                            </div>
                          )}
                          
                          <Card.Body className="tw-p-4 tw-d-flex tw-flex-column">
                            {/* Selection Button - More Prominent */}
                            <div className="tw-flex tw-justify-between tw-items-start tw-mb-3">
                              <Button
                                variant={checked ? "success" : "outline-secondary"}
                                size="sm"
                                onClick={() => {
                                  setSelectedIds(prev =>
                                    checked
                                      ? prev.filter(id => id !== item.product_id)
                                      : [...prev, item.product_id]
                                  );
                                }}
                                className={`tw-border-2 tw-px-3 tw-py-2 tw-font-semibold tw-transition-all tw-duration-300 tw-flex tw-items-center tw-gap-2 ${
                                  checked 
                                    ? 'tw-bg-green-500 tw-border-green-500 tw-text-white hover:tw-bg-green-600 tw-shadow-md' 
                                    : 'tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50 hover:tw-border-purple-400'
                                }`}
                              >
                                {checked ? (
                                  <>
                                    <CheckCircle size={16} />
                                    <span className="tw-text-xs tw-font-bold">DIPILIH</span>
                                  </>
                                ) : (
                                  <>
                                    <Circle size={16} />
                                    <span className="tw-text-xs tw-font-bold">PILIH</span>
                                  </>
                                )}
                              </Button>
                              
                              <Button 
                                size="sm" 
                                variant="outline-danger" 
                                onClick={() => removeItem(item.product_id)}
                                className="tw-border-red-300 tw-text-red-500 hover:tw-bg-red-50 tw-transition-all tw-duration-300"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                            
                            <div className="tw-flex-grow">
                              <h5 className="tw-font-bold tw-text-gray-800 tw-mb-2 tw-line-clamp-2">
                                {item.name}
                              </h5>
                              <p className="tw-text-sm tw-text-gray-600 tw-mb-3 tw-line-clamp-3">
                                {item.description}
                              </p>
                              <div className="tw-text-xs tw-text-purple-600 tw-mb-3 tw-bg-purple-50 tw-px-2 tw-py-1 tw-rounded-full tw-inline-block">
                                <Package size={12} className="tw-me-1" />
                                Stok: {item.stock}
                              </div>
                            </div>
                            
                            <div className="tw-border-t tw-pt-3">
                              <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
                                <span className="tw-text-sm tw-text-gray-600">Harga:</span>
                                <span className="tw-font-bold tw-text-purple-700 tw-text-lg">
                                  Rp {item.current_price.toLocaleString()}
                                </span>
                              </div>
                              
                              <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
                                <span className="tw-text-sm tw-text-gray-600">Jumlah:</span>
                                <div className="tw-flex tw-items-center tw-gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={() => updateQty(item.product_id, 'decrease')}
                                    disabled={item.quantity <= 1}
                                    className="tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50 tw-transition-all tw-duration-300"
                                  >
                                    <Minus size={14} />
                                  </Button>
                                  <span className="tw-font-semibold tw-text-purple-700 tw-min-w-[2rem] tw-text-center">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={() => updateQty(item.product_id, 'increase')}
                                    disabled={item.quantity >= item.stock}
                                    className="tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50 tw-transition-all tw-duration-300"
                                  >
                                    <Plus size={14} />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="tw-flex tw-justify-between tw-items-center tw-border-t tw-pt-3">
                                <span className="tw-text-sm tw-text-gray-600">Subtotal:</span>
                                <span className="tw-font-bold tw-text-purple-800 tw-text-xl">
                                  Rp {(item.current_price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>

                <div className="tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-bg-white/95 tw-backdrop-blur-sm tw-border-t tw-border-purple-200 tw-p-4 tw-z-50">
                  <Container>
                    <Row className="tw-align-items-center">
                      <Col xs={12} md={6} className="tw-mb-2 tw-mb-md-0">
                        <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-4 tw-text-sm">
                          <div className="tw-flex tw-items-center tw-gap-2">
                            <Package className="tw-text-purple-600" size={16} />
                            <span className="tw-text-gray-700">Total Item:</span>
                            <span className="tw-font-bold tw-text-purple-700">{totalQty}</span>
                          </div>
                          <div className="tw-flex tw-items-center tw-gap-2">
                            <CheckCircle className="tw-text-green-600" size={16} />
                            <span className="tw-text-gray-700">Item Dipilih:</span>
                            <span className="tw-font-bold tw-text-green-700">{selectedIds.length}</span>
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div className="tw-flex tw-justify-between tw-items-center tw-gap-4">
                          <div className="tw-text-right">
                            <div className="tw-text-sm tw-text-gray-600">Total Pembayaran</div>
                            <div className="tw-text-xl tw-font-bold tw-text-purple-700">
                              Rp {getTotalPrice().toLocaleString()}
                            </div>
                          </div>
                          <Button
                            variant="primary"
                            disabled={selectedIds.length === 0}
                            onClick={handleCheckout}
                            className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-purple-700 tw-border-0 tw-px-4 tw-py-2 tw-font-semibold tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-300"
                          >
                            <ShoppingCart size={16} className="tw-me-2" />
                            Checkout ({selectedIds.length})
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Container>
                </div>
              </>
            )}
          </Container>
        </div>
      </div>
    </div>
  );
}