// pages/try-out/TryOutPurchaseModal.tsx - Updated with Floater Integration
'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Spinner, Alert } from 'react-bootstrap';
import { ShoppingCart, Star, Gift, Check, X, Tag, Zap } from 'lucide-react';
import axios from 'axios';
import { LearningModal } from '../../components/modal/ModalTemplate';
import { ButtonGradient } from '../../components/button/ButtonTemplate';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

// Types
interface TryOutProduct {
  product_id: number;
  name: string;
  description: string;
  stock: number;
  type: number;
  features: string[];
  classtype: string;
  is_stackable: boolean;
  price: number;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
  exam_schedule_id: number;
  exam_schedule_name: string;
}

interface TryOutPurchaseModalProps {
  show: boolean;
  onHide: () => void;
  examScheduleId: number;
  examScheduleName: string;
  onAddToCart: (productId: number) => Promise<void>;
  onSuccess?: (itemName: string) => void; // NEW: Callback untuk success
}

const TryOutPurchaseModal: React.FC<TryOutPurchaseModalProps> = ({
  show,
  onHide,
  examScheduleId,
  examScheduleName,
  onAddToCart,
  onSuccess // NEW
}) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<TryOutProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<{ [key: number]: boolean }>({});

  // Fetch products when modal opens
  useEffect(() => {
    if (show && examScheduleId) {
      fetchProducts();
    }
  }, [show, examScheduleId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching products for exam schedule:', examScheduleId);
      
      const response = await axios.get(`${apiUrl}/products/try-out/${examScheduleId}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
        params: { _t: Date.now() }
      });
      
      console.log('Products response:', response.data);
      
      if (response.data.success) {
        setProducts(response.data.data || []);
      } else {
        setError(response.data.message || 'Gagal memuat produk');
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || 'Terjadi kesalahan saat memuat produk');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: TryOutProduct) => {
    try {
      setAddingToCart(prev => ({ ...prev, [product.product_id]: true }));
      await onAddToCart(product.product_id);
      
      // NEW: Close modal and trigger success callback
      onHide();
      if (onSuccess) {
        onSuccess(product.name || examScheduleName);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Jika error, tetap tampilkan error di modal (tidak close)
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.product_id]: false }));
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (originalPrice: number, promoPrice: number): number => {
    return Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
  };

  const renderProductCard = (product: TryOutProduct) => {
    const isAddingThisProduct = addingToCart[product.product_id];
    const discountPercentage = product.is_promo && product.no_promo_price 
      ? calculateDiscount(product.no_promo_price, product.price)
      : 0;

    return (
      <div key={product.product_id} className="tw-border-2 tw-border-purple-200 tw-rounded-xl tw-p-6 tw-mb-4 tw-bg-white tw-shadow-md tw-hover:shadow-xl tw-transition-all tw-duration-300 tw-hover:scale-[1.02]">
        {/* Product Header */}
        <div className="tw-flex tw-items-start tw-justify-between tw-mb-4">
          <div className="tw-flex-1">
            <h4 className="tw-font-bold tw-text-lg tw-text-purple-800 tw-mb-2">
              {product.name}
            </h4>
            {product.description && (
              <p className="tw-text-gray-600 tw-text-sm tw-leading-relaxed tw-mb-2">
                {product.description}
              </p>
            )}
          </div>
        </div>

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="tw-mb-4">
            <h6 className="tw-font-semibold tw-text-purple-700 tw-mb-2 tw-text-sm tw-flex tw-items-center tw-gap-2">
              <Star className="tw-w-4 tw-h-4" />
              Fitur yang didapat:
            </h6>
            <div className="tw-flex tw-flex-wrap tw-gap-2">
              {product.features.map((feature, index) => (
                <span 
                  key={index}
                  className="tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-bg-gradient-to-r tw-from-purple-100 tw-to-blue-100 tw-text-purple-700 tw-text-xs tw-font-medium tw-border tw-border-purple-200"
                >
                  <Check className="tw-w-3 tw-h-3 tw-mr-1" />
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price Section */}
        <div className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-pink-50 tw-rounded-xl tw-p-4 tw-mb-4 tw-border-2 tw-border-purple-200">
          {product.is_promo && product.no_promo_price ? (
            <div className="tw-space-y-2">
              {/* Promo Badge */}
              <div className="tw-flex tw-items-center tw-gap-2 tw-flex-wrap">
                <Badge className="tw-bg-red-500 tw-text-white tw-px-3 tw-py-1 tw-text-xs tw-font-bold tw-animate-pulse tw-flex tw-items-center tw-gap-1">
                  <Tag className="tw-w-3 tw-h-3" />
                  PROMO {discountPercentage}%
                </Badge>
                {product.promo_description && (
                  <span className="tw-text-xs tw-text-red-600 tw-font-semibold tw-bg-red-50 tw-px-2 tw-py-1 tw-rounded">
                    {product.promo_description}
                  </span>
                )}
              </div>
              
              {/* Prices */}
              <div className="tw-flex tw-items-center tw-gap-3 tw-flex-wrap">
                <span className="tw-text-3xl tw-font-bold tw-text-green-600">
                  {formatPrice(product.price)}
                </span>
                <span className="tw-text-lg tw-text-gray-500 tw-line-through">
                  {formatPrice(product.no_promo_price)}
                </span>
              </div>
              
              <div className="tw-text-sm tw-text-green-700 tw-font-semibold tw-flex tw-items-center tw-gap-1 tw-bg-green-50 tw-px-3 tw-py-1 tw-rounded-full tw-w-fit">
                <Zap className="tw-w-4 tw-h-4" />
                Hemat {formatPrice(product.no_promo_price - product.price)}!
              </div>
            </div>
          ) : (
            <div className="tw-text-3xl tw-font-bold tw-text-purple-600">
              {product.price === 0 ? (
                <span className="tw-flex tw-items-center tw-text-green-600">
                  <Gift className="tw-w-7 tw-h-7 tw-mr-2" />
                  GRATIS
                </span>
              ) : (
                formatPrice(product.price)
              )}
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <ButtonGradient
          action={product.stock === 0 ? "lock" : "cart"}
          customText={
            isAddingThisProduct ? "Menambahkan..." :
            product.stock === 0 ? "Stok Habis" :
            "Tambah ke Keranjang"
          }
          onClick={() => handleAddToCart(product)}
          disabled={product.stock === 0 || isAddingThisProduct}
          loading={isAddingThisProduct}
          size="md"
          className="tw-w-full"
          customColors={{
            gradient1: '#8B5CF6',
            gradient2: '#7C3AED',
            text: '#FFFFFF'
          }}
        />
      </div>
    );
  };

  // Modal buttons
  const bottomButtons = [
    {
      action: 'close' as const,
      text: 'Tutup',
      onClick: onHide
    }
  ];

  // Modal content
  const renderContent = () => {
    if (loading) {
      return (
        <div className="tw-text-center tw-py-12">
          <Spinner animation="border" className="tw-text-purple-600 tw-mb-3 tw-w-16 tw-h-16" />
          <p className="tw-text-gray-600 tw-font-medium">Memuat produk try-out...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" className="tw-border-2 tw-border-red-300 tw-bg-red-50 tw-text-red-800 tw-rounded-xl">
          <div className="tw-flex tw-items-start tw-gap-3">
            <X className="tw-w-6 tw-h-6 tw-flex-shrink-0 tw-text-red-600" />
            <div className="tw-flex-1">
              <strong className="tw-text-lg tw-block tw-mb-2">Gagal memuat produk</strong>
              <div className="tw-text-sm tw-mb-3">{error}</div>
              <ButtonGradient
                action="refresh"
                customText="Coba Lagi"
                onClick={fetchProducts}
                size="sm"
                customColors={{
                  gradient1: '#EF4444',
                  gradient2: '#DC2626',
                  text: '#FFFFFF'
                }}
              />
            </div>
          </div>
        </Alert>
      );
    }

    if (products.length === 0) {
      return (
        <div className="tw-text-center tw-py-12">
          <div className="tw-w-20 tw-h-20 tw-bg-purple-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
            <ShoppingCart className="tw-w-10 tw-h-10 tw-text-purple-400" />
          </div>
          <h5 className="tw-font-bold tw-text-purple-800 tw-mb-2 tw-text-xl">Belum Ada Produk</h5>
          <p className="tw-text-gray-600 tw-text-sm tw-mb-4 tw-max-w-md tw-mx-auto">
            Produk untuk try-out ini belum tersedia. Silakan hubungi admin untuk informasi lebih lanjut.
          </p>
          <ButtonGradient
            action="refresh"
            customText="Refresh"
            onClick={fetchProducts}
            size="sm"
            customColors={{
              gradient1: '#8B5CF6',
              gradient2: '#7C3AED',
              text: '#FFFFFF'
            }}
          />
        </div>
      );
    }

    return (
      <div>
        {/* Info Banner */}
        <div className="tw-mb-6 tw-bg-gradient-to-r tw-from-blue-50 tw-to-purple-50 tw-border-2 tw-border-blue-300 tw-rounded-xl tw-p-4">
          <div className="tw-flex tw-items-start tw-gap-3">
            <div className="tw-bg-blue-500 tw-rounded-full tw-p-2 tw-flex-shrink-0">
              <Star className="tw-w-5 tw-h-5 tw-text-white" />
            </div>
            <div className="tw-flex-1">
              <strong className="tw-text-blue-900 tw-text-base tw-block tw-mb-1">
                Pilih paket yang sesuai dengan kebutuhan kamu
              </strong>     
              <div className="tw-text-sm tw-text-blue-800">
                Setelah membeli, kamu akan mendapat akses penuh untuk mengerjakan try-out ini.
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="tw-space-y-4">
          {products.map(renderProductCard)}
        </div>
      </div>
    );
  };

  return (
    <LearningModal
      show={show}
      onHide={onHide}
      title="Beli Try Out"
      subtitle={examScheduleName}
      size="lg"
      icon={<ShoppingCart className="tw-w-5 tw-h-5" />}
      bottomButtons={bottomButtons}
      scrollable={true}
    >
      {renderContent()}
    </LearningModal>
  );
};

export default TryOutPurchaseModal;