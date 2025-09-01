import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { X, FileText, Sparkles, BookOpen } from 'lucide-react';

// Types
interface BaseModalProps {
  show: boolean;
  onHide: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'lg' | 'xl';
  width?: string;
  height?: string;
  primaryButton?: {
    text: string;
    variant?: string;
    onClick: () => void;
  };
  secondaryButton?: {
    text: string;
    variant?: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  scrollable?: boolean;
}

/**
 * Report Suite Modal Template
 * 
 * Template modal dengan desain professional untuk FORM
 * 
 * Penggunaan:
 * - Form pendaftaran siswa
 * - Form input data
 * - Form edit profil
 * - Form tambah kelas/mata pelajaran
 * - Form kontak/feedback
 * - Form upload dokumen
 * 
 * Fitur:
 * - Desain clean dan professional
 * - Header dengan gradient purple-blue
 * - Body dengan background gradient
 * - Button close (X) di pojok kanan atas
 * - Responsive dan scrollable
 */
export const ReportSuiteModal: React.FC<BaseModalProps> = ({ 
  show, 
  onHide, 
  title = "Form", 
  children, 
  size = "lg", 
  width, 
  height,
  primaryButton, 
  secondaryButton, 
  icon = <FileText className="tw-w-5 tw-h-5" />, 
  scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-2xl tw-overflow-hidden tw-shadow-2xl tw-border-2 tw-border-purple-300">
        {/* Header dengan gradient purple-blue */}
        <Modal.Header className="tw-bg-white tw-border-b tw-border-purple-200 tw-relative">
          <div className="tw-flex tw-items-center tw-gap-4">
            {/* Icon container dengan gradient */}
            <div className="tw-bg-gradient-to-br tw-from-purple-600 tw-to-blue-600 tw-text-white tw-p-3 tw-rounded-xl tw-shadow-lg">
              {icon}
            </div>
            <div>
              {/* Title dengan gradient text */}
              <Modal.Title className="tw-font-bold tw-text-2xl tw-text-purple-800">{title}</Modal.Title>
              <p className="tw-text-sm tw-text-gray-600 tw-mt-1">Silakan isi formulir di bawah ini</p>
            </div>
          </div>
          {/* Button close (X) di pojok kanan atas */}
          <button 
            onClick={onHide} 
            className="tw-absolute tw-top-4 tw-right-4 tw-text-gray-500 hover:tw-text-gray-700 tw-p-2 tw-rounded-xl hover:tw-bg-purple-100 tw-transition-all tw-z-10"
            type="button"
            aria-label="Close modal"
          >
            <X className="tw-w-6 tw-h-6" />
          </button>
        </Modal.Header>

        {/* Body dengan gradient background */}
        <Modal.Body className="tw-bg-gradient-to-br tw-from-purple-50 tw-via-white tw-to-blue-50 tw-p-8">
          {/* Decorative border */}
          <div className="tw-border-l-4 tw-border-purple-500 tw-pl-6 tw-mb-6">
            <div className="tw-flex tw-gap-2 tw-mb-4">
              <div className="tw-w-3 tw-h-3 tw-bg-purple-500 tw-rounded-full tw-animate-pulse"></div>
              <div className="tw-w-3 tw-h-3 tw-bg-blue-500 tw-rounded-full tw-animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="tw-w-3 tw-h-3 tw-bg-purple-400 tw-rounded-full tw-animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
          {children}
        </Modal.Body>

        {/* Footer dengan styling professional */}
        <Modal.Footer className="tw-bg-white tw-border-t-2 tw-border-purple-200">
          {secondaryButton && (
            <Button 
              variant={secondaryButton.variant || "outline-secondary"} 
              onClick={secondaryButton.onClick} 
              className="tw-me-3 tw-border-2 tw-rounded-lg tw-px-6 tw-py-2"
            >
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button 
              variant={primaryButton.variant || "primary"} 
              onClick={primaryButton.onClick} 
              className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-blue-600 tw-border-0 tw-rounded-lg tw-px-6 tw-py-2 tw-shadow-lg hover:tw-from-purple-700 hover:tw-to-blue-700 tw-transition-all"
            >
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

/**
 * Magic Modal Template
 * 
 * Template modal dengan desain colorful untuk ANALYTICS dan DASHBOARD
 * 
 * Penggunaan:
 * - Dashboard overview siswa
 * - Analytics performance belajar
 * - Grafik perkembangan nilai
 * - Statistik kehadiran
 * - Report bulanan/tahunan
 * - Data visualization
 * 
 * Fitur:
 * - Desain playful dengan animasi
 * - Header dengan gradient purple-blue
 * - Animasi sparkles dan efek visual
 * - Button close (X) di pojok kanan atas
 * - Background gradient yang menarik
 */
export const MagicModal: React.FC<BaseModalProps> = ({ 
  show, 
  onHide, 
  title = "Dashboard", 
  children, 
  size = "xl", 
  width, 
  height, 
  primaryButton, 
  secondaryButton, 
  icon = <Sparkles className="tw-w-5 tw-h-5" />, 
  scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-lg tw-overflow-hidden">
        {/* Header dengan animasi dan efek visual */}
        <Modal.Header className="tw-bg-gradient-to-r tw-from-purple-400 tw-to-blue-400 tw-text-white tw-border-0 tw-relative tw-overflow-hidden">
          <div className="tw-flex tw-items-center tw-gap-3 tw-relative tw-z-10">
            {/* Icon dengan animasi pulse */}
            <div className="tw-bg-white/20 tw-p-2 tw-rounded-full tw-animate-pulse">
              {icon}
            </div>
            <Modal.Title className="tw-font-bold tw-text-xl">{title}</Modal.Title>
          </div>
          
          {/* Button close (X) di pojok kanan atas */}
          <button 
            onClick={onHide} 
            className="tw-absolute tw-top-4 tw-right-4 tw-bg-white/20 hover:tw-bg-white/30 tw-p-1 tw-rounded-full tw-transition-colors tw-z-10"
            type="button"
            aria-label="Close modal"
          >
            <X className="tw-w-5 tw-h-5" />
          </button>

          {/* Animasi sparkles background */}
          <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-pointer-events-none">
            <div className="tw-absolute tw-top-2 tw-left-4 tw-w-2 tw-h-2 tw-bg-white/40 tw-rounded-full tw-animate-ping"></div>
            <div className="tw-absolute tw-top-4 tw-right-8 tw-w-1 tw-h-1 tw-bg-white/60 tw-rounded-full tw-animate-pulse"></div>
            <div className="tw-absolute tw-bottom-2 tw-left-1/3 tw-w-1 tw-h-1 tw-bg-white/50 tw-rounded-full tw-animate-ping" style={{ animationDelay: '1s' }}></div>
          </div>
        </Modal.Header>

        {/* Body dengan gradient background untuk dashboard/analytics */}
        <Modal.Body className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-blue-50 tw-p-6">
          {children}
        </Modal.Body>

        {/* Footer dengan styling colorful */}
        <Modal.Footer className="tw-bg-white tw-border-t-2 tw-border-purple-200">
          {secondaryButton && (
            <Button 
              variant={secondaryButton.variant || "outline-secondary"} 
              onClick={secondaryButton.onClick} 
              className="tw-me-2"
            >
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button 
              variant={primaryButton.variant || "primary"} 
              onClick={primaryButton.onClick} 
              className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 tw-border-0 hover:tw-from-purple-600 hover:tw-to-blue-600"
            >
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

/**
 * Learning Modal Template
 * 
 * Template modal dengan desain clean untuk INFORMATION, NOTIFICATION, dan SETTINGS
 * 
 * Penggunaan:
 * - Pengumuman sekolah/bimbel
 * - Notifikasi sistem
 * - Informasi jadwal kelas
 * - Settings aplikasi
 * - Help & FAQ
 * - Panduan penggunaan
 * 
 * Fitur:
 * - Desain clean dan mudah dibaca
 * - Header dengan gradient blue-indigo
 * - Border accent di top
 * - Button close (X) di pojok kanan atas
 * - Cocok untuk konten informatif
 */
export const LearningModal: React.FC<BaseModalProps> = ({ 
  show, 
  onHide, 
  title = "Informasi", 
  children, 
  size = "lg", 
  width, 
  height,
  primaryButton, 
  secondaryButton, 
  icon = <BookOpen className="tw-w-5 tw-h-5" />, 
  scrollable = true 
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} scrollable={scrollable} centered>
      <div style={{ width, height }} className="tw-rounded-xl tw-overflow-hidden tw-border-2 tw-border-blue-300">
        {/* Header dengan desain clean */}
        <Modal.Header className="tw-bg-gradient-to-r tw-from-blue-400 tw-to-indigo-400 tw-text-white tw-border-0 tw-relative">
          <div className="tw-flex tw-items-center tw-gap-3">
            {/* Icon container dengan background putih */}
            <div className="tw-bg-white tw-p-2 tw-rounded-lg tw-shadow-md">
              {React.cloneElement(icon as React.ReactElement, { className: "tw-w-5 tw-h-5 tw-text-blue-600" })}
            </div>
            <Modal.Title className="tw-font-bold tw-text-xl">{title}</Modal.Title>
          </div>
          
          {/* Button close (X) di pojok kanan atas */}
          <button 
            onClick={onHide} 
            className="tw-absolute tw-top-4 tw-right-4 tw-bg-white/20 hover:tw-bg-white/30 tw-p-2 tw-rounded-lg tw-transition-colors tw-z-10"
            type="button"
            aria-label="Close modal"
          >
            <X className="tw-w-4 tw-h-4" />
          </button>
        </Modal.Header>

        {/* Body dengan background gradient subtle */}
        <Modal.Body className="tw-bg-gradient-to-br tw-from-blue-50 tw-to-indigo-50 tw-p-6 tw-relative">
          {/* Border accent di top */}
          <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-2 tw-bg-gradient-to-r tw-from-blue-300 tw-to-indigo-300"></div>
          {children}
        </Modal.Body>

        {/* Footer dengan styling clean */}
        <Modal.Footer className="tw-bg-gradient-to-r tw-from-blue-100 tw-to-indigo-100">
          {secondaryButton && (
            <Button 
              variant={secondaryButton.variant || "outline-primary"} 
              onClick={secondaryButton.onClick} 
              className="tw-me-2"
            >
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button 
              variant={primaryButton.variant || "primary"} 
              onClick={primaryButton.onClick}
              className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-indigo-500 tw-border-0"
            >
              {primaryButton.text}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

// Default export untuk kemudahan import
export default {
  ReportSuiteModal,
  MagicModal,
  LearningModal
};