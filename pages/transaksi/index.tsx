'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import Link from 'next/link';

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

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!txs.length) {
    return <p className="p-4">Belum ada transaksi.</p>;
  }

  return (
    <div className="container my-4">
      <h2 className="mb-4">Daftar Transaksi</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>No. Order</th>
            <th>Tanggal</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {txs.map(tx => (
            <tr key={tx.order_number}>
              <td>{tx.order_number}</td>
              <td>{new Date(tx.created_at).toLocaleString()}</td>
              <td>{tx.payment_status}</td>
              <td>
                {tx.payment_status === 'pending' ? (
                  <Link href={`/pembayaran/${tx.order_number}`} passHref>
                    <Button variant="primary" size="sm">
                      Bayar
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/orders/${tx.order_number}`} passHref>
                    <Button variant="outline-secondary" size="sm">
                      Detail
                    </Button>
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}