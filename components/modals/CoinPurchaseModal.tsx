import React, { useState } from 'react';
import { Coins, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';

interface CoinPurchaseModalProps {
  show: boolean;
  onHide: () => void;
  productId: number;
  productName: string;
  coinType: 'class' | 'course' | 'tryout';
  coinPrice: number;
  userCoinBalance: number;
  onSuccess: (entitlements: string[]) => void;
}

const CoinPurchaseModal: React.FC<CoinPurchaseModalProps> = ({
  show,
  onHide,
  productId,
  productName,
  coinType,
  coinPrice,
  userCoinBalance,
  onSuccess
}) => {
  const [step, setStep] = useState<'confirm' | 'final' | 'processing'>('confirm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFirstConfirmation = () => {
    setStep('final');
    setError(null);
  };

  const handleFinalConfirmation = async () => {
    setStep('processing');
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/coins/purchase', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          coinType
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data.data.entitlements_granted || []);
        onHide();
        setStep('confirm'); // Reset for next time
      } else {
        throw new Error(data.message || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Coin purchase error:', error);
      setError(error.message || 'Purchase failed');
      setStep('final'); // Go back to final confirmation step
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStep('confirm');
    setError(null);
    onHide();
  };

  const handleBack = () => {
    setStep('confirm');
    setError(null);
  };

  const getCoinTypeLabel = (type: string) => {
    switch (type) {
      case 'class': return 'Class Coin';
      case 'course': return 'Course Coin';
      case 'tryout': return 'Try-out Coin';
      default: return 'Coin';
    }
  };

  const getCoinIcon = (type: string) => {
    return <Coins className="tw-w-5 tw-h-5" />;
  };

  const getCoinColor = (type: string) => {
    switch (type) {
      case 'class': return 'tw-text-blue-600';
      case 'course': return 'tw-text-green-600';
      case 'tryout': return 'tw-text-purple-600';
      default: return 'tw-text-gray-600';
    }
  };

  const isInsufficientBalance = userCoinBalance < coinPrice;

  if (!show) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50">
      <div className="tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-max-w-md tw-w-full tw-mx-4 tw-max-h-screen tw-overflow-auto">
        {/* Header */}
        <div className="tw-flex tw-items-center tw-justify-between tw-p-6 tw-border-b tw-border-gray-200">
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className={`tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-bg-gradient-to-r ${
              coinType === 'class' ? 'tw-from-blue-400 tw-to-blue-600' :
              coinType === 'course' ? 'tw-from-green-400 tw-to-green-600' :
              'tw-from-purple-400 tw-to-purple-600'
            }`}>
              <span className="tw-text-white tw-text-xs tw-font-bold">
                {coinType.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="tw-text-lg tw-font-bold tw-text-gray-800">
                {step === 'confirm' ? 'Confirm Purchase' : 
                 step === 'final' ? 'Final Confirmation' : 'Processing...'}
              </div>
              <div className="tw-text-sm tw-text-gray-600">
                Purchase with {getCoinTypeLabel(coinType)}
              </div>
            </div>
          </div>
          {!loading && (
            <button 
              onClick={handleCancel}
              className="tw-p-2 tw-hover:tw-bg-gray-100 tw-rounded-full tw-transition-colors"
            >
              <X className="tw-w-5 tw-h-5 tw-text-gray-400" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="tw-p-6">
          {/* First Confirmation Step */}
          {step === 'confirm' && (
            <div className="tw-space-y-6">
              <div className="tw-bg-gradient-to-r tw-from-orange-50 tw-to-yellow-50 tw-border tw-border-orange-200 tw-rounded-lg tw-p-4">
                <div className="tw-flex tw-items-start tw-gap-3">
                  <AlertTriangle className="tw-w-6 tw-h-6 tw-text-orange-600 tw-flex-shrink-0 tw-mt-1" />
                  <div className="tw-w-full">
                    <h6 className="tw-font-bold tw-text-orange-800 tw-mb-2">
                      Confirm Your Purchase
                    </h6>
                    <p className="tw-text-orange-700 tw-text-sm tw-mb-3">
                      Are you sure you want to purchase <strong>"{productName}"</strong> using your {getCoinTypeLabel(coinType).toLowerCase()}s?
                    </p>
                    <div className="tw-bg-white tw-rounded tw-p-3 tw-border tw-border-orange-300">
                      <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                        <span className="tw-text-sm tw-text-gray-600">Cost:</span>
                        <div className="tw-flex tw-items-center tw-gap-2">
                          <div className={getCoinColor(coinType)}>
                            {getCoinIcon(coinType)}
                          </div>
                          <span className="tw-font-bold tw-text-lg">{coinPrice}</span>
                          <span className="tw-text-sm tw-text-gray-500">{getCoinTypeLabel(coinType)}</span>
                        </div>
                      </div>
                      <div className="tw-flex tw-justify-between tw-items-center">
                        <span className="tw-text-sm tw-text-gray-600">Your Balance:</span>
                        <div className="tw-flex tw-items-center tw-gap-2">
                          <div className={getCoinColor(coinType)}>
                            {getCoinIcon(coinType)}
                          </div>
                          <span className={`tw-font-bold tw-text-lg ${isInsufficientBalance ? 'tw-text-red-600' : 'tw-text-green-600'}`}>
                            {userCoinBalance}
                          </span>
                          <span className="tw-text-sm tw-text-gray-500">{getCoinTypeLabel(coinType)}</span>
                        </div>
                      </div>
                      {!isInsufficientBalance && (
                        <div className="tw-flex tw-justify-between tw-items-center tw-mt-2 tw-pt-2 tw-border-t tw-border-gray-200">
                          <span className="tw-text-sm tw-text-gray-600">After Purchase:</span>
                          <div className="tw-flex tw-items-center tw-gap-2">
                            <div className={getCoinColor(coinType)}>
                              {getCoinIcon(coinType)}
                            </div>
                            <span className="tw-font-bold tw-text-lg tw-text-blue-600">
                              {userCoinBalance - coinPrice}
                            </span>
                            <span className="tw-text-sm tw-text-gray-500">{getCoinTypeLabel(coinType)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isInsufficientBalance && (
                <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-p-4">
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <XCircle className="tw-w-5 tw-h-5 tw-text-red-600" />
                    <div>
                      <strong className="tw-text-red-800">Insufficient Balance!</strong>
                      <p className="tw-text-red-700 tw-text-sm tw-mt-1">
                        You need {coinPrice - userCoinBalance} more {getCoinTypeLabel(coinType).toLowerCase()}s to make this purchase.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Final Confirmation Step */}
          {step === 'final' && (
            <div className="tw-space-y-6">
              <div className="tw-bg-gradient-to-r tw-from-red-50 tw-to-pink-50 tw-border tw-border-red-200 tw-rounded-lg tw-p-4">
                <div className="tw-flex tw-items-start tw-gap-3">
                  <AlertTriangle className="tw-w-6 tw-h-6 tw-text-red-600 tw-flex-shrink-0 tw-mt-1" />
                  <div className="tw-w-full">
                    <h6 className="tw-font-bold tw-text-red-800 tw-mb-2">
                      Final Confirmation Required
                    </h6>
                    <p className="tw-text-red-700 tw-text-sm tw-mb-3">
                      <strong>This action cannot be undone!</strong> Once you confirm this purchase, your coins will be immediately deducted and you will receive access to the content.
                    </p>
                    <div className="tw-bg-white tw-rounded tw-p-3 tw-border tw-border-red-300">
                      <div className="tw-text-center tw-mb-3">
                        <div className="tw-text-lg tw-font-bold tw-text-gray-800 tw-mb-1">
                          "{productName}"
                        </div>
                        <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                          <div className={getCoinColor(coinType)}>
                            {getCoinIcon(coinType)}
                          </div>
                          <span className="tw-text-2xl tw-font-bold tw-text-red-600">{coinPrice}</span>
                          <span className="tw-text-sm tw-text-gray-500">{getCoinTypeLabel(coinType)}</span>
                        </div>
                      </div>
                      <div className="tw-text-center tw-text-sm tw-text-gray-600">
                        Click "Confirm Purchase" to proceed
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-p-4">
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <XCircle className="tw-w-5 tw-h-5 tw-text-red-600" />
                    <div>
                      <strong className="tw-text-red-800">Purchase Failed:</strong>
                      <p className="tw-text-red-700 tw-text-sm tw-mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="tw-text-center tw-py-8">
              <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-blue-600 tw-mx-auto tw-mb-4"></div>
              <h6 className="tw-font-bold tw-text-gray-800 tw-mb-2">Processing Purchase...</h6>
              <p className="tw-text-gray-600 tw-text-sm">
                Please wait while we process your coin purchase. This may take a few moments.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="tw-flex tw-justify-between tw-p-6 tw-border-t tw-border-gray-200">
          {step === 'confirm' && (
            <>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="tw-px-6 tw-py-2 tw-bg-gray-200 tw-text-gray-800 tw-rounded-lg tw-font-medium tw-hover:tw-bg-gray-300 tw-transition-colors disabled:tw-opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFirstConfirmation}
                disabled={loading || isInsufficientBalance}
                className="tw-px-6 tw-py-2 tw-bg-yellow-500 tw-text-white tw-rounded-lg tw-font-medium tw-hover:tw-bg-yellow-600 tw-transition-colors disabled:tw-opacity-50"
              >
                Yes, I want to purchase
              </button>
            </>
          )}

          {step === 'final' && (
            <>
              <button
                onClick={handleBack}
                disabled={loading}
                className="tw-px-6 tw-py-2 tw-bg-gray-200 tw-text-gray-800 tw-rounded-lg tw-font-medium tw-hover:tw-bg-gray-300 tw-transition-colors disabled:tw-opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleFinalConfirmation}
                disabled={loading}
                className="tw-px-6 tw-py-2 tw-bg-red-500 tw-text-white tw-rounded-lg tw-font-medium tw-hover:tw-bg-red-600 tw-transition-colors disabled:tw-opacity-50 tw-flex tw-items-center tw-gap-2"
              >
                {loading ? (
                  <>
                    <div className="tw-animate-spin tw-rounded-full tw-h-4 tw-w-4 tw-border-b-2 tw-border-white"></div>
                    Processing...
                  </>
                ) : (
                  'Confirm Purchase'
                )}
              </button>
            </>
          )}

          {step === 'processing' && (
            <div className="tw-w-full tw-text-center">
              <span className="tw-text-sm tw-text-gray-500">
                Please do not close this window...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinPurchaseModal;