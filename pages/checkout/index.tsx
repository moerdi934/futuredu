'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Table, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

  useEffect(() => {
    // Get data from sessionStorage in Next.js
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('checkoutData');
      if (storedData) {
        try {
          const data: CheckoutData = JSON.parse(storedData);
          setCheckoutData(data);
        } catch (err) {
          console.error('Error parsing checkout data:', err);
          router.push('/cart');
        }
      } else {
        router.push('/cart');
      }
    }
  }, [router]);

  if (!checkoutData) {
    return (
      <div className="tw-flex tw-justify-center tw-p-5">
        <Spinner animation="border" />
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
      const res = await axios.post<CheckoutResponse>(
        `${API_URL}/checkout/process`,
        { 
          selectedProductIds: selectedIds, 
          promoData: { amount: promo } 
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        // Clear checkout data from sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('checkoutData');
        }
        // Navigate to embedded payment page
        router.push(`/pembayaran/${res.data.data.orderNumber}`);
      } else {
        setError(res.data.message || 'Checkout gagal');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = (): void => {
    router.back();
  };

  return (
    <div className="tw-container tw-mx-auto tw-p-4">
      <Button variant="link" onClick={handleBack}>
        <ArrowLeft size={20} /> Kembali
      </Button>
      <h2 className="tw-text-2xl tw-font-semibold tw-mb-4">Checkout</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nama Produk</th>
            <th>Qty</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {summary.map(item => (
            <tr key={item.product_id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>Rp {item.subtotal.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Form.Group className="tw-mb-3" controlId="promo">
        <Form.Label>Promo (Rp)</Form.Label>
        <Form.Control
          type="number"
          value={promo}
          min={0}
          max={gross}
          onChange={e => setPromo(Number(e.target.value))}
        />
      </Form.Group>

      <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
        <div>
          <div>Subtotal: Rp {gross.toLocaleString()}</div>
          <div>Diskon: Rp {promo.toLocaleString()}</div>
          <div className="tw-font-semibold">Total Bayar: Rp {net.toLocaleString()}</div>
        </div>
        <div>
          <Button onClick={handlePay} disabled={processing}>
            {processing ? <Spinner animation="border" size="sm" /> : 'Bayar'}
          </Button>
        </div>
      </div>
    </div>
  );
}