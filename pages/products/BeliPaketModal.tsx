'use client';

import React from 'react';
import {
  Modal,
  Button,
} from 'react-bootstrap';
import axios from 'axios';
import { useRouter } from 'next/router';
import { ShoppingCart, Zap, Star, Gift } from 'lucide-react';
import { useStatus } from '../../context/StatusContext';

interface Props {
  show: boolean;
  onClose: () => void;
  productId: number;
  userId: number;
  productPrice: number;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

const BeliPaketModal: React.FC<Props> = ({
  show,
  onClose,
  productId,
  userId,
  productPrice,
}) => {
  const router = useRouter();
  const { refreshStatus } = useStatus();

  // helper untuk notifikasi kecil di pojok
  function showToast(html: string, bgClass = 'tw-bg-purple-800') {
    const n = document.createElement('div');
    n.className = `tw-fixed tw-bottom-4 tw-right-4 ${bgClass} tw-text-white tw-p-4 tw-rounded-lg tw-shadow-lg tw-z-50 tw-max-w-sm tw-animate-fade-in`;
    n.innerHTML = html;
    document.body.appendChild(n);
    setTimeout(() => {
      n.classList.add('tw-animate-fade-out');
      setTimeout(() => document.body.removeChild(n), 500);
    }, 3000);
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  // 1) Tambah ke keranjang saja
  const handleAddToCart = async () => {
    try {
      await axios.post(
        `${apiUrl}/cart/add`,
        { productId: productId },
        { withCredentials: true }
      );
      await refreshStatus?.();
      showToast(
        `<div class="tw-flex tw-items-center">
           <svg class="tw-w-6 tw-h-6 tw-mr-2" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path stroke-linecap="round" stroke-linejoin="round"
                   stroke-width="2" d="M5 13l4 4L19 7"></path>
           </svg>
           <span>Berhasil ditambahkan ke keranjang!</span>
         </div>`,
        'tw-bg-green-600'
      );
      onClose();
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      showToast(
        `<div class="tw-flex tw-items-center">
           <svg class="tw-w-6 tw-h-6 tw-mr-2" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path stroke-linecap="round" stroke-linejoin="round"
                   stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
           </svg>
           <span>Gagal menambahkan ke keranjang.</span>
         </div>`,
        'tw-bg-red-600'
      );
    }
  };

  // 2) Beli sekarang: add to cart lalu langsung ke checkout
  const handleBuyNow = async () => {
    try {
      await axios.post(
        `${apiUrl}/cart/add`,
        { productId: productId },
        { withCredentials: true }
      );
      await refreshStatus?.();
      onClose();
      router.push(`/checkout?ids=${productId}&price=${productPrice}`);
    } catch (err: any) {
      console.error('Error buying now:', err);
      showToast(
        `<div class="tw-flex tw-items-center">
           <svg class="tw-w-6 tw-h-6 tw-mr-2" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path stroke-linecap="round" stroke-linejoin="round"
                   stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
           </svg>
           <span>Gagal memproses pembelian.</span>
         </div>`,
        'tw-bg-red-600'
      );
    }
  };

  return (
    <>
      <Modal 
        show={show} 
        onHide={onClose} 
        centered 
        className="tw-backdrop-blur-sm"
        style={{ zIndex: 1050 }}
      >
        <div className="tw-bg-gradient-to-br tw-from-purple-900 tw-via-purple-800 tw-to-pink-800 tw-rounded-t-lg tw-relative tw-overflow-hidden">
          {/* Decorative elements */}
          <div className="tw-absolute tw-top-0 tw-right-0 tw-w-20 tw-h-20 tw-bg-white/10 tw-rounded-full tw--translate-y-10 tw-translate-x-10"></div>
          <div className="tw-absolute tw-bottom-0 tw-left-0 tw-w-16 tw-h-16 tw-bg-yellow-300/20 tw-rounded-full tw-translate-y-8 tw--translate-x-8"></div>
          
          <Modal.Header
            closeButton
            className="tw-bg-transparent tw-text-white tw-border-0 tw-relative tw-z-10"
          >
            <Modal.Title className="tw-flex tw-items-center tw-gap-3 tw-text-2xl tw-font-bold tw-drop-shadow-lg">
              <div className="tw-w-12 tw-h-12 tw-bg-white/20 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-backdrop-blur-sm">
                <Gift className="tw-w-6 tw-h-6 tw-text-yellow-300" />
              </div>
              Konfirmasi Pembelian
            </Modal.Title>
          </Modal.Header>
        </div>

        <Modal.Body className="tw-p-8 tw-bg-white tw-relative">
          <div className="tw-text-center tw-mb-8">
            <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-20 tw-h-20 tw-bg-gradient-to-br tw-from-purple-500 tw-to-pink-500 tw-rounded-full tw-mb-4 tw-shadow-xl">
              <Star className="tw-w-10 tw-h-10 tw-text-white" />
            </div>
            <h3 className="tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-2">
              Yakin ingin membeli paket ini?
            </h3>
            <p className="tw-text-gray-600 tw-text-lg">
              Pilih cara pembelian yang sesuai dengan kebutuhanmu
            </p>
          </div>

          <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-pink-50 tw-rounded-2xl tw-p-6 tw-border-2 tw-border-purple-200 tw-mb-6">
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
              <h4 className="tw-text-xl tw-font-bold tw-text-purple-800 tw-flex tw-items-center tw-gap-2">
                <Zap className="tw-w-6 tw-h-6 tw-text-yellow-500" />
                Harga Paket
              </h4>
              <div className="tw-text-right">
                <p className="tw-text-3xl tw-font-bold tw-text-purple-800 tw-mb-0">
                  {formatCurrency(productPrice)}
                </p>
                <p className="tw-text-sm tw-text-gray-600">Harga sudah termasuk promo</p>
              </div>
            </div>
            
            <div className="tw-bg-white/60 tw-rounded-xl tw-p-4 tw-border tw-border-purple-200">
              <div className="tw-flex tw-items-center tw-gap-3 tw-text-purple-700">
                <Gift className="tw-w-5 tw-h-5 tw-text-purple-600" />
                <span className="tw-font-semibold">Paket bimbel premium dengan mentor terbaik</span>
              </div>
            </div>
          </div>

          <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-4">
            <div className="tw-bg-blue-50 tw-rounded-xl tw-p-4 tw-border-2 tw-border-blue-200">
              <h5 className="tw-font-bold tw-text-blue-800 tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <ShoppingCart className="tw-w-5 tw-h-5" />
                Tambah ke Keranjang
              </h5>
              <p className="tw-text-sm tw-text-blue-700 tw-mb-0">
                Simpan dulu, bayar nanti bersama item lainnya
              </p>
            </div>
            
            <div className="tw-bg-green-50 tw-rounded-xl tw-p-4 tw-border-2 tw-border-green-200">
              <h5 className="tw-font-bold tw-text-green-800 tw-mb-2 tw-flex tw-items-center tw-gap-2">
                <Zap className="tw-w-5 tw-h-5" />
                Beli Sekarang
              </h5>
              <p className="tw-text-sm tw-text-green-700 tw-mb-0">
                Langsung checkout dan mulai belajar
              </p>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="tw-bg-gray-50 tw-border-0 tw-p-6">
          <div className="tw-flex tw-gap-3 tw-w-full tw-justify-center">
            <Button 
              variant="light" 
              onClick={onClose}
              className="tw-px-6 tw-py-3 tw-rounded-xl tw-font-semibold tw-border-2 tw-border-gray-300 tw-text-gray-700 hover:tw-bg-gray-100 tw-transition-all tw-duration-300"
            >
              Batal
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={handleAddToCart}
              className="tw-px-6 tw-py-3 tw-rounded-xl tw-font-semibold tw-bg-blue-600 hover:tw-bg-blue-700 tw-border-0 tw-text-white tw-transition-all tw-duration-300 tw-flex tw-items-center tw-gap-2 hover:tw-scale-105"
            >
              <ShoppingCart className="tw-w-5 tw-h-5" />
              Tambah ke Keranjang
            </Button>
            
            <Button 
              variant="primary" 
              onClick={handleBuyNow}
              className="tw-px-6 tw-py-3 tw-rounded-xl tw-font-semibold tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 hover:tw-from-purple-700 hover:tw-to-pink-700 tw-border-0 tw-text-white tw-transition-all tw-duration-300 tw-flex tw-items-center tw-gap-2 hover:tw-scale-105 tw-shadow-lg"
            >
              <Zap className="tw-w-5 tw-h-5" />
              Beli Sekarang
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Animasi toast */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(10px); }
        }
        .tw-animate-fade-in  { animation: fadeIn 0.3s ease-out forwards; }
        .tw-animate-fade-out { animation: fadeOut 0.3s ease-in forwards; }
      `}</style>
    </>
  );
};

export default BeliPaketModal;