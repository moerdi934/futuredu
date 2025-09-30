// components/floater/GoToCartFloater.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ShoppingCart, X, Sparkles, CheckCircle } from 'lucide-react';
import { ButtonGradient } from '../button/ButtonTemplate';

interface GoToCartFloaterProps {
  show: boolean;
  onHide: () => void;
  itemName?: string;
  autoHideDelay?: number; // in milliseconds
}

const GoToCartFloater: React.FC<GoToCartFloaterProps> = ({
  show,
  onHide,
  itemName = 'Try-out',
  autoHideDelay = 10000
}) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsLeaving(false);
      
      // Auto hide after delay
      const timer = setTimeout(() => {
        handleClose();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [show, autoHideDelay]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
      onHide();
    }, 300); // Match animation duration
  };

  const handleGoToCart = () => {
    router.push('/keranjang');
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop overlay dengan blur effect */}
      <div 
        className={`tw-fixed tw-inset-0 tw-z-[9998] tw-transition-all tw-duration-300 ${
          isLeaving ? 'tw-opacity-0' : 'tw-opacity-100'
        }`}
        onClick={handleClose}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(2px)'
        }}
      />

      {/* Floater Container */}
      <div
        className={`tw-fixed tw-bottom-6 tw-right-6 tw-z-[9999] tw-transition-all tw-duration-300 tw-transform ${
          isLeaving 
            ? 'tw-translate-y-full tw-opacity-0 tw-scale-75' 
            : 'tw-translate-y-0 tw-opacity-100 tw-scale-100'
        }`}
        style={{
          animation: isLeaving ? 'none' : 'slideInBounce 0.5s ease-out'
        }}
      >
        {/* Main Card */}
        <div className="tw-relative tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden tw-max-w-sm tw-border-4 tw-border-purple-200">
          {/* Animated Background Gradient */}
          <div 
            className="tw-absolute tw-inset-0 tw-opacity-20"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)',
              backgroundSize: '400% 400%',
              animation: 'gradientFlow 3s ease infinite'
            }}
          />

          {/* Sparkle Effects */}
          <div className="tw-absolute tw-top-2 tw-right-2 tw-animate-pulse">
            <Sparkles className="tw-w-6 tw-h-6 tw-text-yellow-400" />
          </div>
          <div className="tw-absolute tw-top-4 tw-left-4 tw-animate-pulse" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="tw-w-4 tw-h-4 tw-text-pink-400" />
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="tw-absolute tw-top-3 tw-right-3 tw-z-10 tw-bg-white tw-rounded-full tw-p-1.5 tw-shadow-lg tw-transition-all tw-duration-200 hover:tw-scale-110 hover:tw-rotate-90 tw-border-2 tw-border-purple-200"
            aria-label="Close"
          >
            <X className="tw-w-4 tw-h-4 tw-text-purple-600" />
          </button>

          {/* Content */}
          <div className="tw-relative tw-p-6 tw-pb-5">
            {/* Success Icon with Animation */}
            <div className="tw-flex tw-justify-center tw-mb-4">
              <div className="tw-relative">
                <div 
                  className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-green-400 tw-to-emerald-500 tw-rounded-full tw-blur-lg tw-opacity-50"
                  style={{ animation: 'pulse 2s ease-in-out infinite' }}
                />
                <div className="tw-relative tw-bg-gradient-to-br tw-from-green-400 tw-to-emerald-500 tw-rounded-full tw-p-4 tw-shadow-xl">
                  <CheckCircle className="tw-w-8 tw-h-8 tw-text-white" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="tw-text-center tw-mb-5">
              <h3 className="tw-text-xl tw-font-bold tw-mb-2 tw-bg-gradient-to-r tw-from-purple-600 tw-via-pink-500 tw-to-purple-600 tw-bg-clip-text tw-text-transparent">
                Berhasil Ditambahkan! 🎉
              </h3>
              <p className="tw-text-gray-700 tw-text-sm tw-font-medium tw-mb-1">
                {itemName}
              </p>
              <p className="tw-text-gray-500 tw-text-xs">
                sudah ada di keranjang kamu
              </p>
            </div>

            {/* Cart Icon with Badge */}
            <div className="tw-flex tw-justify-center tw-mb-5">
              <div className="tw-relative">
                <div className="tw-bg-gradient-to-br tw-from-purple-100 tw-to-pink-100 tw-rounded-full tw-p-3 tw-border-2 tw-border-purple-200">
                  <ShoppingCart className="tw-w-6 tw-h-6 tw-text-purple-600" />
                </div>
                <div className="tw-absolute -tw-top-1 -tw-right-1 tw-bg-gradient-to-br tw-from-red-500 tw-to-pink-500 tw-text-white tw-text-xs tw-font-bold tw-rounded-full tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center tw-border-2 tw-border-white tw-shadow-lg tw-animate-bounce">
                  +1
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="tw-space-y-3">
              <ButtonGradient
                action="cart"
                customText="Lihat Keranjang"
                onClick={handleGoToCart}
                size="md"
                className="tw-w-full"
                customColors={{
                  gradient1: '#8B5CF6',
                  gradient2: '#EC4899',
                  text: '#FFFFFF'
                }}
              />
              
              <button
                onClick={handleClose}
                className="tw-w-full tw-px-4 tw-py-2.5 tw-text-sm tw-font-semibold tw-text-purple-600 tw-bg-purple-50 tw-rounded-lg tw-border-2 tw-border-purple-200 tw-transition-all tw-duration-200 hover:tw-bg-purple-100 hover:tw-scale-105"
              >
                Lanjut Belanja
              </button>
            </div>

            {/* Progress Bar */}
            <div className="tw-mt-4 tw-h-1 tw-bg-gray-200 tw-rounded-full tw-overflow-hidden">
              <div 
                className="tw-h-full tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500"
                style={{
                  animation: `shrink ${autoHideDelay}ms linear forwards`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInBounce {
          0% {
            transform: translateY(100%) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateY(-10%) scale(1.05);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes gradientFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
    </>
  );
};

export default GoToCartFloater;