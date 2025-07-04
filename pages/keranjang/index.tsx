'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { PlusCircle, MinusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    
    // Store data in sessionStorage for Next.js
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    }
    
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="tw-flex tw-justify-center tw-p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="tw-m-4">{error}</Alert>;
  }

  return (
    <div className="tw-container tw-mx-auto tw-p-4">
      <h2 className="tw-text-2xl tw-font-semibold tw-mb-4">Keranjang Belanja</h2>
      {items.length === 0 ? (
        <p>Keranjang Anda kosong.</p>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th><Form.Check disabled /></th>
                <th>Nama Produk</th>
                <th>Harga</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const checked = selectedIds.includes(item.product_id);
                return (
                  <tr key={item.product_id}>
                    <td>
                      <Form.Check
                        checked={checked}
                        onChange={() => {
                          setSelectedIds(prev =>
                            checked
                              ? prev.filter(id => id !== item.product_id)
                              : [...prev, item.product_id]
                          );
                        }}
                      />
                    </td>
                    <td>
                      <div className="tw-font-medium">{item.name}</div>
                      <div className="tw-text-sm tw-text-gray-600">{item.description}</div>
                    </td>
                    <td>Rp {item.current_price.toLocaleString()}</td>
                    <td className="tw-flex tw-items-center tw-gap-2">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => updateQty(item.product_id, 'decrease')}
                        disabled={item.quantity <= 1}
                      >
                        <MinusCircle size={16} />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => updateQty(item.product_id, 'increase')}
                        disabled={item.quantity >= item.stock}
                      >
                        <PlusCircle size={16} />
                      </Button>
                    </td>
                    <td>Rp {(item.current_price * item.quantity).toLocaleString()}</td>
                    <td>
                      <Button size="sm" variant="danger" onClick={() => removeItem(item.product_id)}>
                        <Trash2 size={16} /> Hapus
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
            <div>Total Item: <b>{totalQty}</b></div>
            <div className="tw-flex tw-gap-2">
              <Button
                variant="primary"
                disabled={selectedIds.length === 0}
                onClick={handleCheckout}
              >
                Checkout ({selectedIds.length})
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}