'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Spinner, Alert, Button, Container, Row, Col, Card } from 'react-bootstrap';
import Link from 'next/link';
import { Receipt, CreditCard, Calendar, Package, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import NavigationBar from '../../components/layout/NavigationBar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Transaction {
  order_number: string;
  payment_status: string;
  expired_at: string;
  created_at: string;
}

interface TransactionResponse {
  success: boolean;
  data: Transaction[];
}

export default function AllTransactionsPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async (): Promise<void> => {
      try {
        const res = await axios.get<TransactionResponse>(
          `${API_URL}/checkout/all-transactions`,
          { withCredentials: true }
        );
        
        if (res.data.success) {
          setTxs(res.data.data);
        } else {
          setError('Gagal memuat transaksi');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="tw-text-yellow-500" />;
      case 'paid':
        return <CheckCircle size={16} className="tw-text-green-500" />;
      case 'failed':
        return <XCircle size={16} className="tw-text-red-500" />;
      default:
        return <Package size={16} className="tw-text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'tw-bg-yellow-50 tw-text-yellow-700 tw-border-yellow-200';
      case 'paid':
        return 'tw-bg-green-50 tw-text-green-700 tw-border-green-200';
      case 'failed':
        return 'tw-bg-red-50 tw-text-red-700 tw-border-red-200';
      default:
        return 'tw-bg-gray-50 tw-text-gray-700 tw-border-gray-200';
    }
  };

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
              <p className="tw-text-white tw-font-medium tw-text-lg">Memuat transaksi...</p>
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
    <div className="tw-h-full" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh'}}>
      <NavigationBar />
      
      <div className="tw-relative tw-overflow-hidden tw-pb-12" style={{minHeight: '100vh'}}>
        <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-violet-600/20 tw-to-purple-800/20"></div>
        <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
        <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
        <div className="tw-absolute tw-top-1/2 tw-left-1/4 tw-w-16 tw-h-16 tw-bg-blue-300/20 tw-rounded-full tw-blur-xl tw-animate-pulse tw-delay-500"></div>
        
        <div className="tw-relative tw-z-10">
          <Container className="tw-py-5">
            <div className="tw-text-center tw-mb-5">
              <div className="tw-inline-flex tw-items-center tw-gap-3 tw-mb-4">
                <div className="tw-p-3 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-text-white tw-border tw-border-white/30">
                  <Receipt size={32} />
                </div>
                <h1 className="tw-text-4xl tw-font-bold tw-text-white tw-mb-0 tw-drop-shadow-lg">
                  Riwayat Transaksi
                </h1>
              </div>
              <p className="tw-text-white/90 tw-text-lg tw-drop-shadow">
                Lihat semua transaksi dan pembayaran Anda
              </p>
            </div>

{txs.length === 0 ? (
              <div className="tw-flex tw-justify-center tw-items-center tw-min-h-[50vh]">
                <Card className="tw-border-0 tw-shadow-2xl tw-bg-white/95 tw-backdrop-blur-sm tw-max-w-md tw-w-full tw-mx-4">
                  <Card.Body className="tw-text-center tw-py-5">
                    <div className="tw-mb-4">
                      <Receipt size={80} className="tw-text-purple-300 tw-mx-auto" />
                    </div>
                    <h4 className="tw-text-purple-600 tw-mb-2 tw-font-bold">Belum Ada Transaksi</h4>
                    <p className="tw-text-purple-500 tw-mb-4">Anda belum melakukan transaksi apapun</p>
                    <Button 
                      variant="primary" 
                      href="/products"
                      className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-purple-700 tw-border-0 tw-px-4 tw-py-2 tw-font-semibold tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-300"
                    >
                      <Package size={16} className="tw-me-2" />
                      Mulai Belanja
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            ) : (
              <>
                {txs.some(tx => tx.payment_status === 'pending') && (
                  <div className="tw-mb-8">
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-4">
                      <div className="tw-p-2 tw-bg-yellow-100/80 tw-backdrop-blur-sm tw-rounded-full tw-border tw-border-yellow-200">
                        <Clock size={20} className="tw-text-yellow-600" />
                      </div>
                      <h3 className="tw-text-2xl tw-font-bold tw-text-white tw-mb-0 tw-drop-shadow-lg">
                        Menunggu Pembayaran
                      </h3>
                    </div>
                    <Row className="tw-g-4">
                      {txs.filter(tx => tx.payment_status === 'pending').map(tx => (
                        <Col key={tx.order_number} xs={12} md={6} lg={4} className="tw-mb-4">
                          <Card className="tw-h-full tw-border-0 tw-shadow-2xl tw-bg-white/95 tw-backdrop-blur-sm tw-transition-all tw-duration-300 hover:tw-shadow-3xl hover:tw-transform hover:tw-scale-105 tw-border-l-4 tw-border-l-yellow-400">
                            <Card.Body className="tw-p-4">
                              <div className="tw-flex tw-justify-between tw-items-start tw-mb-3">
                                <div className="tw-flex tw-items-center tw-gap-2">
                                  <Receipt size={20} className="tw-text-purple-600" />
                                  <span className="tw-text-sm tw-text-gray-600 tw-font-medium">Order</span>
                                </div>
                                <div className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-semibold tw-border tw-flex tw-items-center tw-gap-1 ${getStatusColor(tx.payment_status)}`}>
                                  {getStatusIcon(tx.payment_status)}
                                  Menunggu Bayar
                                </div>
                              </div>
                              
                              <div className="tw-mb-4">
                                <h5 className="tw-font-bold tw-text-gray-800 tw-mb-2 tw-text-lg">
                                  #{tx.order_number}
                                </h5>
                                <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-gray-600 tw-mb-2">
                                  <Calendar size={14} />
                                  <span>{new Date(tx.created_at).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}</span>
                                </div>
                                <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-gray-600">
                                  <Clock size={14} />
                                  <span>{new Date(tx.created_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}</span>
                                </div>
                              </div>
                              
                              <div className="tw-border-t tw-pt-3">
                                <Link href={`/pembayaran/${tx.order_number}`} passHref>
                                  <Button 
                                    variant="primary" 
                                    className="tw-w-full tw-bg-gradient-to-r tw-from-yellow-500 tw-to-yellow-600 tw-border-0 tw-px-4 tw-py-2 tw-font-semibold tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-300"
                                  >
                                    <CreditCard size={16} className="tw-me-2" />
                                    Bayar Sekarang
                                  </Button>
                                </Link>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {txs.some(tx => tx.payment_status !== 'pending') && (
                  <div className="tw-mb-8">
                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-4">
                      <div className="tw-p-2 tw-bg-green-100/80 tw-backdrop-blur-sm tw-rounded-full tw-border tw-border-green-200">
                        <CheckCircle size={20} className="tw-text-green-600" />
                      </div>
                      <h3 className="tw-text-2xl tw-font-bold tw-text-white tw-mb-0 tw-drop-shadow-lg">
                        Riwayat Transaksi
                      </h3>
                    </div>
                    <Row className="tw-g-4">
                      {txs.filter(tx => tx.payment_status !== 'pending').map(tx => (
                        <Col key={tx.order_number} xs={12} md={6} lg={4} className="tw-mb-4">
                          <Card className="tw-h-full tw-border-0 tw-shadow-2xl tw-bg-white/95 tw-backdrop-blur-sm tw-transition-all tw-duration-300 hover:tw-shadow-3xl hover:tw-transform hover:tw-scale-105 tw-border-l-4 tw-border-l-green-400">
                            <Card.Body className="tw-p-4">
                              <div className="tw-flex tw-justify-between tw-items-start tw-mb-3">
                                <div className="tw-flex tw-items-center tw-gap-2">
                                  <Receipt size={20} className="tw-text-purple-600" />
                                  <span className="tw-text-sm tw-text-gray-600 tw-font-medium">Order</span>
                                </div>
                                <div className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-semibold tw-border tw-flex tw-items-center tw-gap-1 ${getStatusColor(tx.payment_status)}`}>
                                  {getStatusIcon(tx.payment_status)}
                                  {tx.payment_status === 'paid' ? 'Berhasil' : tx.payment_status.charAt(0).toUpperCase() + tx.payment_status.slice(1)}
                                </div>
                              </div>
                              
                              <div className="tw-mb-4">
                                <h5 className="tw-font-bold tw-text-gray-800 tw-mb-2 tw-text-lg">
                                  #{tx.order_number}
                                </h5>
                                <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-gray-600 tw-mb-2">
                                  <Calendar size={14} />
                                  <span>{new Date(tx.created_at).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}</span>
                                </div>
                                <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-gray-600">
                                  <Clock size={14} />
                                  <span>{new Date(tx.created_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}</span>
                                </div>
                              </div>
                              
                              <div className="tw-border-t tw-pt-3">
                                <Link href={`/orders/${tx.order_number}`} passHref>
                                  <Button 
                                    variant="outline-secondary" 
                                    className="tw-w-full tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50 tw-transition-all tw-duration-300"
                                  >
                                    <Eye size={16} className="tw-me-2" />
                                    Lihat Detail
                                  </Button>
                                </Link>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                   </div>
                )}
              </>
            )}
          </Container>
        </div>
      </div>
    </div>
  );
}