'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Spinner, Alert, Button } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';

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

    // Make sure div with id 'snap-container' exists
    if (window.snap && typeof window.snap.embed === 'function') {
      try {
        window.snap.embed(snapToken, {
          embedId: 'snap-container',
          onSuccess: () => router.push(`/orders/${orderNumber}`),
          onError: (e: any) => setError('Error pembayaran: ' + JSON.stringify(e)),
          onClose: () => console.log('Customer closed Snap'),
        });
      } catch (err: any) {
        setError('Error saat embed pembayaran: ' + err.message);
      }
    } else {
      setError('Tidak dapat menemukan method snap.embed(). Coba cek versi script.');
    }
  }, [loading, error, scriptLoaded, snapToken, router, orderNumber]);

  const handleBack = (): void => {
    router.back();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tw-container tw-mx-auto tw-p-4">
        <Button variant="link" onClick={handleBack}>
          <ArrowLeft size={20} /> Kembali
        </Button>
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="tw-container tw-mx-auto tw-p-4">
      <Button variant="link" onClick={handleBack}>
        <ArrowLeft size={20} /> Kembali
      </Button>
      <h2 className="tw-text-2xl tw-font-semibold tw-mb-4">
        Pembayaran Order #{orderNumber}
      </h2>

      {/* Container for inline embed */}
      <div
        id="snap-container"
        style={{
          width: '100%',
          minHeight: '600px',
          border: '1px solid #e2e2e2',
          borderRadius: 4,
          padding: 16,
        }}
      />

      <p className="tw-text-sm tw-text-gray-500 tw-mt-4">
        Jika pembayaran tidak muncul otomatis, coba refresh halaman.
      </p>
    </div>
  );
}