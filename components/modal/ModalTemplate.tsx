// components/modal/ModalTemplate.tsx (Fixed Centering - Simplified Approach)
import React from 'react';
import { Modal } from 'react-bootstrap';
import { X, FileText, Sparkles, BookOpen } from 'lucide-react';
import { ButtonGradient, ActionType } from '../button/ButtonTemplate';

// Button interface for modal
export interface ModalButton {
  action: ActionType;
  text?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  customColors?: {
    primary?: string;
    secondary?: string;
    gradient1?: string;
    gradient2?: string;
    text?: string;
  };
}

// Enhanced base modal props
interface BaseModalProps {
  show: boolean;
  onHide: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'lg' | 'xl';
  width?: string;
  height?: string;
  icon?: React.ReactNode;
  scrollable?: boolean;
  topButtons?: ModalButton[];
  bottomButtons?: ModalButton[];
  showCloseButton?: boolean;
  preventCloseOnOutsideClick?: boolean;
}

/**
 * Report Suite Modal Template - PROPERLY CENTERED
 */
export const ReportSuiteModal: React.FC<BaseModalProps> = ({ 
  show, 
  onHide, 
  title = "Form", 
  subtitle,
  children, 
  size = "lg", 
  width, 
  height,
  icon = <FileText className="tw-w-5 tw-h-5" />, 
  scrollable = true,
  topButtons = [],
  bottomButtons = [],
  showCloseButton = true,
  preventCloseOnOutsideClick = false
}) => {
  // Custom dialog class untuk centering yang proper
  const customDialogClass = React.useMemo(() => {
    if (width || height) {
      return 'custom-centered-modal';
    }
    return '';
  }, [width, height]);

  // Calculate custom styles
  const customStyles = React.useMemo(() => {
    if (!width && !height) return {};
    
    const styles: React.CSSProperties = {};
    
    if (width) {
      // Parse width value
      if (width.includes('vw')) {
        const vwValue = parseInt(width);
        styles.width = `${Math.min(vwValue, 95)}vw`;
        styles.maxWidth = `${Math.min(vwValue, 95)}vw`;
      } else {
        styles.width = width;
        styles.maxWidth = width;
      }
    }
    
    if (height) {
      // Parse height value  
      if (height.includes('vh')) {
        const vhValue = parseInt(height);
        styles.height = `${Math.min(vhValue, 90)}vh`;
        styles.maxHeight = `${Math.min(vhValue, 90)}vh`;
      } else {
        styles.height = height;
        styles.maxHeight = height;
      }
    }
    
    return styles;
  }, [width, height]);

  // Smart close handling
  const discardButton = bottomButtons.find(btn => btn.action === 'cancel');
  const handleDiscardChanges = discardButton?.onClick || onHide;

  const handleCloseButtonClick = () => {
    if (preventCloseOnOutsideClick && discardButton) {
      handleDiscardChanges();
    } else {
      onHide();
    }
  };

  return (
    <>
      {/* Enhanced CSS untuk perfect centering */}
      <style jsx global>{`
        /* Custom modal centering - Overrides Bootstrap default */
        .custom-centered-modal {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: calc(100vh - 2rem) !important;
        }
        
        .custom-centered-modal .modal-content {
          margin: 0 !important;
          width: auto !important;
          height: auto !important;
        }
        
        /* Ensure modal dialog takes full available space for centering */
        .modal.show .modal-dialog.custom-centered-modal {
          transform: none !important;
          margin: 1rem !important;
          max-width: none !important;
          width: auto !important;
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 576px) {
          .custom-centered-modal {
            margin: 0.5rem !important;
            min-height: calc(100vh - 1rem) !important;
          }
        }
        
        /* Force scrollable body behavior */
        .fixed-modal-body {
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        
        /* Disable any child component scrolling that conflicts */
        .disable-child-scroll * {
          max-height: none !important;
        }
      `}</style>

      <Modal 
        show={show} 
        onHide={preventCloseOnOutsideClick ? () => {} : onHide}
        size={customDialogClass ? undefined : size}
        scrollable={scrollable} 
        centered={!customDialogClass} // Only use Bootstrap centering if no custom sizing
        dialogClassName={customDialogClass}
        backdrop={preventCloseOnOutsideClick ? 'static' : true}
        keyboard={!preventCloseOnOutsideClick}
      >
        <div 
          style={customStyles}
          className="tw-rounded-2xl tw-overflow-hidden tw-shadow-2xl tw-border-2 tw-border-purple-300 tw-flex tw-flex-col tw-bg-white tw-min-w-80 tw-w-full"
        >
          {/* Header */}
          <Modal.Header className="tw-bg-white tw-border-b tw-border-purple-200 tw-relative tw-p-4 tw-flex-shrink-0">
            <div className="tw-w-full">
              <div className="tw-flex tw-items-center tw-gap-2 sm:tw-gap-4 tw-mb-3">
                <div className="tw-bg-gradient-to-br tw-from-purple-600 tw-to-blue-600 tw-text-white tw-p-2 sm:tw-p-3 tw-rounded-xl tw-shadow-lg tw-flex-shrink-0">
                  {icon}
                </div>
                <div className="tw-flex-1 tw-min-w-0">
                  <Modal.Title className="tw-font-bold tw-text-lg sm:tw-text-xl tw-text-purple-800 tw-mb-1 tw-truncate">{title}</Modal.Title>
                  {subtitle && (
                    <p className="tw-text-xs sm:tw-text-sm tw-text-gray-600 tw-truncate">{subtitle}</p>
                  )}
                </div>
                
                {showCloseButton && (
                  <button 
                    onClick={handleCloseButtonClick} 
                    className="tw-text-gray-500 hover:tw-text-gray-700 tw-p-1 sm:tw-p-2 tw-rounded-xl hover:tw-bg-purple-100 tw-transition-all tw-flex-shrink-0"
                    type="button"
                    aria-label="Close modal"
                  >
                    <X className="tw-w-4 tw-h-4 sm:tw-w-5 sm:tw-h-5" />
                  </button>
                )}
              </div>
              
              {topButtons.length > 0 && (
                <div className="tw-flex tw-flex-wrap tw-gap-1 sm:tw-gap-2 tw-justify-end">
                  {topButtons.map((button, index) => (
                    <ButtonGradient
                      key={index}
                      action={button.action}
                      customText={button.text}
                      customIcon={button.icon}
                      onClick={button.onClick}
                      disabled={button.disabled}
                      loading={button.loading}
                      size={button.size || 'sm'}
                      customColors={button.customColors}
                    />
                  ))}
                </div>
              )}
            </div>
          </Modal.Header>

          {/* Body - Dengan proper height calculation */}
          <Modal.Body 
            className="tw-bg-gradient-to-br tw-from-purple-50 tw-via-white tw-to-blue-50 tw-p-4 sm:tw-p-6 tw-flex-1 fixed-modal-body disable-child-scroll"
            style={{
              maxHeight: bottomButtons.length > 0 ? 
                (height ? `calc(${height} - 200px)` : 'calc(85vh - 200px)') : 
                (height ? `calc(${height} - 140px)` : 'calc(85vh - 140px)'),
              minHeight: '200px'
            }}
          >
            <div className="tw-border-l-4 tw-border-purple-500 tw-pl-4 sm:tw-pl-6 tw-mb-4 sm:tw-mb-6">
              <div className="tw-flex tw-gap-2 tw-mb-4">
                <div className="tw-w-2 sm:tw-w-3 tw-h-2 sm:tw-h-3 tw-bg-purple-500 tw-rounded-full tw-animate-pulse"></div>
                <div className="tw-w-2 sm:tw-w-3 tw-h-2 sm:tw-h-3 tw-bg-blue-500 tw-rounded-full tw-animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="tw-w-2 sm:tw-w-3 tw-h-2 sm:tw-h-3 tw-bg-purple-400 tw-rounded-full tw-animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
            <div className="tw-space-y-4">
              {children}
            </div>
          </Modal.Body>

          {bottomButtons.length > 0 && (
            <Modal.Footer className="tw-bg-white tw-border-t-2 tw-border-purple-200 tw-p-4 sm:tw-p-6 tw-flex-shrink-0">
              <div className="tw-flex tw-flex-wrap tw-gap-2 sm:tw-gap-3 tw-justify-end tw-w-full">
                {bottomButtons.map((button, index) => (
                  <ButtonGradient
                    key={index}
                    action={button.action}
                    customText={button.text}
                    customIcon={button.icon}
                    onClick={button.onClick}
                    disabled={button.disabled}
                    loading={button.loading}
                    size={button.size || 'md'}
                    customColors={button.customColors}
                  />
                ))}
              </div>
            </Modal.Footer>
          )}
        </div>
      </Modal>
    </>
  );
};

/**
 * Learning Modal Template - PROPERLY CENTERED (Updated to Purple Theme)
 */
export const LearningModal: React.FC<BaseModalProps> = ({ 
  show, 
  onHide, 
  title = "Informasi", 
  subtitle,
  children, 
  size = "lg", 
  width, 
  height,
  icon = <BookOpen className="tw-w-5 tw-h-5" />, 
  scrollable = true,
  topButtons = [],
  bottomButtons = [],
  showCloseButton = true,
  preventCloseOnOutsideClick = false
}) => {
  const customDialogClass = React.useMemo(() => {
    if (width || height) {
      return 'custom-centered-modal';
    }
    return '';
  }, [width, height]);

  const customStyles = React.useMemo(() => {
    if (!width && !height) return {};
    
    const styles: React.CSSProperties = {};
    
    if (width) {
      if (width.includes('vw')) {
        const vwValue = parseInt(width);
        styles.width = `${Math.min(vwValue, 120)}vw`;
        styles.maxWidth = `${Math.min(vwValue, 150)}vw`;
      } else {
        styles.width = width;
        styles.maxWidth = width;
      }
    }
    
    if (height) {
      if (height.includes('vh')) {
        const vhValue = parseInt(height);
        styles.height = `${Math.min(vhValue, 120)}vh`;
        styles.maxHeight = `${Math.min(vhValue, 150)}vh`;
      } else {
        styles.height = height;
        styles.maxHeight = height;
      }
    }
    
    return styles;
  }, [width, height]);

  const discardButton = bottomButtons.find(btn => btn.action === 'cancel');
  const handleDiscardChanges = discardButton?.onClick || onHide;

  const handleCloseButtonClick = () => {
    if (preventCloseOnOutsideClick && discardButton) {
      handleDiscardChanges();
    } else {
      onHide();
    }
  };

  return (
    <>
      <style jsx global>{`
        .custom-centered-modal {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: calc(100vh - 2rem) !important;
        }
        
        .custom-centered-modal .modal-content {
          margin: 0 !important;
          width: 110vw !important;
          height: 120vh !important;
        }
        
        .modal.show .modal-dialog.custom-centered-modal {
          transform: none !important;
          margin: 1rem !important;
          max-width: none !important;
          width: auto !important;
        }
        
        @media (max-width: 576px) {
          .custom-centered-modal {
            margin: 0.5rem !important;
            min-height: calc(100vh - 1rem) !important;
          }
        }
        
        .fixed-modal-body {
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        
        .disable-child-scroll * {
          max-height: none !important;
        }
      `}</style>

      <Modal 
        show={show} 
        onHide={preventCloseOnOutsideClick ? () => {} : onHide}
        size={customDialogClass ? undefined : size}
        scrollable={scrollable} 
        centered={!customDialogClass}
        dialogClassName={customDialogClass}
        backdrop={preventCloseOnOutsideClick ? 'static' : true}
        keyboard={!preventCloseOnOutsideClick}
      >
        <div 
          style={customStyles}
          className="tw-rounded-xl tw-overflow-hidden tw-border-2 tw-border-purple-300 tw-flex tw-flex-col tw-bg-white tw-min-w-80 tw-w-full"
        >
          <Modal.Header className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-violet-600 tw-text-white tw-border-0 tw-relative tw-flex-shrink-0 tw-p-3 sm:tw-p-4">
            <div className="tw-w-full">
              <div className="tw-flex tw-items-center tw-gap-2 sm:tw-gap-3 tw-mb-3">
                <div className="tw-bg-white tw-p-1.5 sm:tw-p-2 tw-rounded-lg tw-shadow-md tw-flex-shrink-0">
                  {React.cloneElement(icon as React.ReactElement, { className: "tw-w-4 tw-h-4 sm:tw-w-5 sm:tw-h-5 tw-text-purple-600" })}
                </div>
                <div className="tw-flex-1 tw-min-w-0">
                  <Modal.Title className="tw-font-bold tw-text-lg sm:tw-text-xl tw-mb-1 tw-truncate">{title}</Modal.Title>
                  {subtitle && (
                    <p className="tw-text-xs sm:tw-text-sm tw-text-white/80 tw-truncate">{subtitle}</p>
                  )}
                </div>
                
                {showCloseButton && (
                  <button 
                    onClick={handleCloseButtonClick} 
                    className="tw-bg-white/20 hover:tw-bg-white/30 tw-p-1.5 sm:tw-p-2 tw-rounded-lg tw-transition-colors tw-flex-shrink-0"
                    type="button"
                    aria-label="Close modal"
                  >
                    <X className="tw-w-3 tw-h-3 sm:tw-w-4 sm:tw-h-4" />
                  </button>
                )}
              </div>
              
              {topButtons.length > 0 && (
                <div className="tw-flex tw-flex-wrap tw-gap-1 sm:tw-gap-2 tw-justify-end">
                  {topButtons.map((button, index) => (
                    <ButtonGradient
                      key={index}
                      action={button.action}
                      customText={button.text}
                      customIcon={button.icon}
                      onClick={button.onClick}
                      disabled={button.disabled}
                      loading={button.loading}
                      size={button.size || 'sm'}
                      customColors={button.customColors}
                    />
                  ))}
                </div>
              )}
            </div>
          </Modal.Header>

          <Modal.Body 
            className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-violet-100 tw-p-4 sm:tw-p-6 tw-relative tw-flex-1 fixed-modal-body disable-child-scroll"
            style={{
              maxHeight: bottomButtons.length > 0 ? 
                (height ? `calc(${height} - 160px)` : 'calc(85vh - 160px)') : 
                (height ? `calc(${height} - 100px)` : 'calc(85vh - 100px)'),
              minHeight: '200px'
            }}
          >
            <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-2 tw-bg-gradient-to-r tw-from-purple-400 tw-to-violet-500"></div>
            <div className="tw-space-y-4">
              {children}
            </div>
          </Modal.Body>

          {bottomButtons.length > 0 && (
            <Modal.Footer className="tw-bg-gradient-to-r tw-from-purple-100 tw-to-violet-200 tw-flex-shrink-0 tw-p-3 sm:tw-p-4">
              <div className="tw-flex tw-flex-wrap tw-gap-1 sm:tw-gap-2 tw-justify-end tw-w-full">
                {bottomButtons.map((button, index) => (
                  <ButtonGradient
                    key={index}
                    action={button.action}
                    customText={button.text}
                    customIcon={button.icon}
                    onClick={button.onClick}
                    disabled={button.disabled}
                    loading={button.loading}
                    size={button.size || 'md'}
                    customColors={button.customColors}
                  />
                ))}
              </div>
            </Modal.Footer>
          )}
        </div>
      </Modal>
    </>
  );
};

/**
 * Magic Modal Template - PROPERLY CENTERED  
 */
export const MagicModal: React.FC<BaseModalProps> = ({ 
  show, 
  onHide, 
  title = "Dashboard", 
  subtitle,
  children, 
  size = "xl", 
  width, 
  height, 
  icon = <Sparkles className="tw-w-5 tw-h-5" />, 
  scrollable = true,
  topButtons = [],
  bottomButtons = [],
  showCloseButton = true,
  preventCloseOnOutsideClick = false
}) => {
  const customDialogClass = React.useMemo(() => {
    if (width || height) {
      return 'custom-centered-modal';
    }
    return '';
  }, [width, height]);

  const customStyles = React.useMemo(() => {
    if (!width && !height) return {};
    
    const styles: React.CSSProperties = {};
    
      if (width) {
        if (width.includes('vw')) {
          const vwValue = parseInt(width);
          styles.width = `${Math.min(vwValue, 95)}vw`;
          styles.maxWidth = `${Math.min(vwValue, 95)}vw`;
        } else {
          styles.width = width;
          styles.maxWidth = width;
        }
      }
      
      if (height) {
        if (height.includes('vh')) {
          const vhValue = parseInt(height);
          styles.height = `${Math.min(vhValue, 90)}vh`;
          styles.maxHeight = `${Math.min(vhValue, 90)}vh`;
        } else {
          styles.height = height;
          styles.maxHeight = height;
        }
      }
    
    return styles;
  }, [width, height]);

  const discardButton = bottomButtons.find(btn => btn.action === 'cancel');
  const handleDiscardChanges = discardButton?.onClick || onHide;

  const handleCloseButtonClick = () => {
    if (preventCloseOnOutsideClick && discardButton) {
      handleDiscardChanges();
    } else {
      onHide();
    }
  };

  return (
    <>
      <style jsx global>{`
        .custom-centered-modal {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: calc(100vh - 2rem) !important;
        }
        
        .custom-centered-modal .modal-content {
          margin: 0 !important;
          width: auto !important;
          height: auto !important;
        }
        
        .modal.show .modal-dialog.custom-centered-modal {
          transform: none !important;
          margin: 1rem !important;
          max-width: none !important;
          width: auto !important;
        }
        
        @media (max-width: 576px) {
          .custom-centered-modal {
            margin: 0.5rem !important;
            min-height: calc(100vh - 1rem) !important;
          }
        }
        
        .fixed-modal-body {
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        
        .disable-child-scroll * {
          max-height: none !important;
        }
      `}</style>

      <Modal 
        show={show} 
        onHide={preventCloseOnOutsideClick ? () => {} : onHide}
        size={customDialogClass ? undefined : size}
        scrollable={scrollable} 
        centered={!customDialogClass}
        dialogClassName={customDialogClass}
        backdrop={preventCloseOnOutsideClick ? 'static' : true}
        keyboard={!preventCloseOnOutsideClick}
      >
        <div 
          style={customStyles}
          className="tw-rounded-lg tw-overflow-hidden tw-flex tw-flex-col tw-bg-white tw-min-w-80 tw-w-full"
        >
          <Modal.Header className="tw-bg-gradient-to-r tw-from-purple-400 tw-to-blue-400 tw-text-white tw-border-0 tw-relative tw-overflow-hidden tw-p-3 sm:tw-p-4 tw-flex-shrink-0">
            <div className="tw-w-full">
              <div className="tw-flex tw-items-center tw-gap-2 sm:tw-gap-3 tw-relative tw-z-10 tw-mb-3">
                <div className="tw-bg-white/20 tw-p-1.5 sm:tw-p-2 tw-rounded-full tw-animate-pulse tw-flex-shrink-0">
                  {icon}
                </div>
                <div className="tw-flex-1 tw-min-w-0">
                  <Modal.Title className="tw-font-bold tw-text-lg sm:tw-text-xl tw-mb-1 tw-truncate">{title}</Modal.Title>
                  {subtitle && (
                    <p className="tw-text-xs sm:tw-text-sm tw-text-white/80 tw-truncate">{subtitle}</p>
                  )}
                </div>
                
                {showCloseButton && (
                  <button 
                    onClick={handleCloseButtonClick} 
                    className="tw-bg-white/20 hover:tw-bg-white/30 tw-p-1 tw-rounded-full tw-transition-colors tw-flex-shrink-0"
                    type="button"
                    aria-label="Close modal"
                  >
                    <X className="tw-w-4 tw-h-4 sm:tw-w-5 sm:tw-h-5" />
                  </button>
                )}
              </div>
              
              {topButtons.length > 0 && (
                <div className="tw-flex tw-flex-wrap tw-gap-1 sm:tw-gap-2 tw-justify-end tw-relative tw-z-10">
                  {topButtons.map((button, index) => (
                    <ButtonGradient
                      key={index}
                      action={button.action}
                      customText={button.text}
                      customIcon={button.icon}
                      onClick={button.onClick}
                      disabled={button.disabled}
                      loading={button.loading}
                      size={button.size || 'sm'}
                      customColors={button.customColors}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-pointer-events-none">
              <div className="tw-absolute tw-top-2 tw-left-4 tw-w-2 tw-h-2 tw-bg-white/40 tw-rounded-full tw-animate-ping"></div>
              <div className="tw-absolute tw-top-4 tw-right-8 tw-w-1 tw-h-1 tw-bg-white/60 tw-rounded-full tw-animate-pulse"></div>
              <div className="tw-absolute tw-bottom-2 tw-left-1/3 tw-w-1 tw-h-1 tw-bg-white/50 tw-rounded-full tw-animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>
          </Modal.Header>

          <Modal.Body 
            className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-blue-50 tw-p-4 sm:tw-p-6 tw-flex-1 fixed-modal-body disable-child-scroll"
            style={{
              maxHeight: bottomButtons.length > 0 ? 
                (height ? `calc(${height} - 180px)` : 'calc(85vh - 180px)') : 
                (height ? `calc(${height} - 120px)` : 'calc(85vh - 120px)'),
              minHeight: '200px'
            }}
          >
            <div className="tw-space-y-4">
              {children}
            </div>
          </Modal.Body>

          {bottomButtons.length > 0 && (
            <Modal.Footer className="tw-bg-white tw-border-t-2 tw-border-purple-200 tw-p-3 sm:tw-p-4 tw-flex-shrink-0">
              <div className="tw-flex tw-flex-wrap tw-gap-1 sm:tw-gap-2 tw-justify-end tw-w-full">
                {bottomButtons.map((button, index) => (
                  <ButtonGradient
                    key={index}
                    action={button.action}
                    customText={button.text}
                    customIcon={button.icon}
                    onClick={button.onClick}
                    disabled={button.disabled}
                    loading={button.loading}
                    size={button.size || 'md'}
                    customColors={button.customColors}
                  />
                ))}
              </div>
            </Modal.Footer>
          )}
        </div>
      </Modal>
    </>
  );
};

// Default export
export default {
  ReportSuiteModal,
  MagicModal,
  LearningModal
};

export type { ModalButton, BaseModalProps };