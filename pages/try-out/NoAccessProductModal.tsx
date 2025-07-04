import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

interface NoAccessProductModalProps {
  show: boolean;
  onClose: () => void;
  userId: number | null;
  productId: number | null;
  productPrice: number | null;
}

const NoAccessProductModal: React.FC<NoAccessProductModalProps> = ({
  show,
  onClose,
  userId,
  productId,
  productPrice
}) => {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const handlePurchase = () => {
    if (productId) {
      router.push(`/products/${productId}`);
    } else {
      router.push('/products');
    }
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <div className="tw-bg-white tw-rounded-lg tw-overflow-hidden tw-shadow-xl tw-transform tw-transition-all">
        <div className="tw-bg-violet-600 tw-p-6">
          <div className="tw-flex tw-items-center tw-justify-center">
            <div className="tw-rounded-full tw-bg-white tw-p-3">
              <svg className="tw-h-8 tw-w-8 tw-text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V8m0 0V6m0 2h2m-2 0H9" />
              </svg>
            </div>
          </div>
          <div className="tw-mt-4 tw-text-center">
            <h3 className="tw-text-lg tw-font-medium tw-text-white">Akses Terbatas</h3>
            <p className="tw-text-violet-200 tw-text-sm tw-mt-1">
              API Endpoint: {apiUrl || 'Not configured'}
            </p>
          </div>
        </div>
        <div className="tw-p-6">
          <div className="tw-text-center tw-mb-6">
            <p className="tw-text-gray-700 tw-mb-4">
              Anda belum memiliki akses untuk Try Out ini. Silakan lakukan pembelian terlebih dahulu untuk mengikuti ujian.
            </p>
            {productPrice && (
              <div className="tw-bg-violet-100 tw-p-3 tw-rounded-lg tw-inline-block">
                <p className="tw-text-violet-800 tw-font-medium tw-mb-0">
                  Harga: Rp {productPrice.toLocaleString('id-ID')}
                </p>
              </div>
            )}
          </div>
          <div className="tw-flex tw-justify-between">
            <Button
              variant="secondary"
              onClick={onClose}
              className="tw-bg-gray-100 tw-text-gray-700 tw-py-2 tw-px-4 tw-rounded-md tw-font-medium tw-shadow-sm hover:tw-bg-gray-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-violet-500 focus:tw-ring-offset-2"
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handlePurchase}
              className="tw-bg-violet-600 tw-text-white tw-py-2 tw-px-4 tw-rounded-md tw-font-medium tw-shadow-sm hover:tw-bg-violet-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-violet-500 focus:tw-ring-offset-2"
            >
              Menuju Pembelian
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NoAccessProductModal;