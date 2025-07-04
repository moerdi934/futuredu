'use client';

import React, { useRef, useState, useEffect, RefObject } from 'react';

// Types
interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (data: { imageUrl?: string; uploadedImage?: File }) => void;
}

interface ImageAlignmentFloaterProps {
  wrapper: HTMLElement;
  img: HTMLImageElement;
  onClose: () => void;
  handleChange: () => void;
}

interface Position {
  top: number;
  left: number;
}

interface ImageInsertionData {
  imageUrl?: string;
  uploadedImage?: File;
}

// Main ImageModal Component
const ImageModal: React.FC<ImageModalProps> = ({ 
  isOpen, 
  onClose, 
  onInsert 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

  // Effect untuk preview URL gambar
  useEffect(() => {
    if (imageUrl.trim()) {
      setPreviewUrl(imageUrl);
      setImageLoadError(false);
    } else {
      setPreviewUrl('');
      setImageLoadError(false);
    }
  }, [imageUrl]);

  // Effect untuk preview file yang diupload
  useEffect(() => {
    if (uploadedImage) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setPreviewUrl(e.target.result as string);
          setImageLoadError(false);
        }
      };
      reader.readAsDataURL(uploadedImage);
    } else if (!imageUrl.trim()) {
      setPreviewUrl('');
      setImageLoadError(false);
    }
  }, [uploadedImage, imageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }
      
      setUploadedImage(file);
      // Clear URL input when file is selected
      setImageUrl('');
    }
  };

  const triggerFileInput = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleImageInsert = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (imageUrl || uploadedImage) {
      onInsert({ imageUrl, uploadedImage });
      // Reset the state after insertion
      setImageUrl('');
      setUploadedImage(null);
      setPreviewUrl('');
      setImageLoadError(false);
    }
  };

  const handleImageLoadError = () => {
    setImageLoadError(true);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    // Clear uploaded file when URL is entered
    if (url.trim()) {
      setUploadedImage(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageUrl('');
    setUploadedImage(null);
    setPreviewUrl('');
    setImageLoadError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModalClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
      <div className="tw-bg-white tw-rounded-lg tw-shadow-xl tw-max-w-2xl tw-w-full tw-max-h-screen tw-overflow-y-auto tw-m-4">
        <div className="tw-flex tw-justify-between tw-items-center tw-p-6 tw-border-b">
          <h3 className="tw-text-xl tw-font-semibold tw-text-purple-700">Insert Image</h3>
          <button 
            className="tw-text-gray-400 hover:tw-text-gray-600 tw-text-2xl tw-leading-none"
            onClick={handleModalClose}
            title="Close"
          >
            ✕
          </button>
        </div>
        
        <div className="tw-p-6">
          {/* URL Input Section */}
          <div className="tw-mb-6">
            <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
              Image URL
            </label>
            <input
              type="url"
              className="tw-border tw-border-gray-300 tw-rounded-lg tw-p-3 tw-w-full focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-purple-500 tw-transition-colors"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={handleUrlChange}
            />
          </div>
          
          {/* Divider */}
          <div className="tw-flex tw-items-center tw-my-6">
            <div className="tw-flex-1 tw-border-t tw-border-gray-300"></div>
            <span className="tw-px-4 tw-text-gray-500 tw-text-sm tw-font-medium">OR</span>
            <div className="tw-flex-1 tw-border-t tw-border-gray-300"></div>
          </div>
          
          {/* File Upload Section */}
          <div className="tw-mb-6">
            <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
              Upload Image
            </label>
            <div className="tw-flex tw-items-center tw-gap-3">
              <button 
                className="tw-bg-white tw-text-purple-700 tw-border-2 tw-border-purple-300 hover:tw-border-purple-500 tw-rounded-lg tw-px-4 tw-py-2 tw-transition-colors tw-font-medium"
                onClick={triggerFileInput}
              >
                Choose File
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*"
              />
              {uploadedImage && (
                <span className="tw-text-sm tw-text-gray-600 tw-flex-1">
                  Selected: {uploadedImage.name}
                </span>
              )}
            </div>
            <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
              Supported formats: JPG, PNG, GIF, WebP (max 5MB)
            </p>
          </div>

          {/* Preview Section */}
          {previewUrl && (
            <div className="tw-mb-6">
              <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                Preview
              </label>
              <div className="tw-border tw-border-gray-200 tw-rounded-lg tw-p-4 tw-bg-gray-50">
                {imageLoadError ? (
                  <div className="tw-flex tw-items-center tw-justify-center tw-h-48 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg">
                    <div className="tw-text-center">
                      <div className="tw-text-red-400 tw-text-4xl tw-mb-2">⚠️</div>
                      <p className="tw-text-red-600 tw-text-sm tw-font-medium">Failed to load image</p>
                      <p className="tw-text-red-500 tw-text-xs tw-mt-1">Please check the URL or try a different image</p>
                    </div>
                  </div>
                ) : (
                  <div className="tw-flex tw-justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="tw-max-w-full tw-max-h-64 tw-object-contain tw-rounded-lg tw-shadow-sm"
                      onError={handleImageLoadError}
                      onLoad={() => setImageLoadError(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clear Button */}
          {(imageUrl || uploadedImage) && (
            <div className="tw-mb-6">
              <button
                className="tw-text-sm tw-text-gray-500 hover:tw-text-gray-700 tw-underline"
                onClick={clearAll}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="tw-flex tw-justify-end tw-gap-3 tw-p-6 tw-border-t tw-bg-gray-50">
          <button 
            className="tw-bg-gray-200 hover:tw-bg-gray-300 tw-text-gray-800 tw-rounded-lg tw-px-6 tw-py-2 tw-font-medium tw-transition-colors"
            onClick={handleModalClose}
          >
            Cancel
          </button>
          <button 
            className="tw-bg-purple-600 hover:tw-bg-purple-700 disabled:tw-bg-gray-300 disabled:tw-text-gray-500 tw-text-white tw-rounded-lg tw-px-6 tw-py-2 tw-font-medium tw-transition-colors"
            onClick={handleImageInsert}
            disabled={(!imageUrl && !uploadedImage) || imageLoadError}
          >
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
};

// Alignment Floater Component
const ImageAlignmentFloater: React.FC<ImageAlignmentFloaterProps> = ({ 
  wrapper, 
  img, 
  onClose, 
  handleChange 
}) => {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

  useEffect(() => {
    if (wrapper && img) {
      const wrapperRect = wrapper.getBoundingClientRect();
      const editorElement = wrapper.closest('[contenteditable]') as HTMLElement;
      if (editorElement) {
        const editorRect = editorElement.getBoundingClientRect();
        
        // Position floater above the image
        setPosition({
          top: wrapperRect.top - editorRect.top - 50,
          left: wrapperRect.left - editorRect.left
        });
      }
    }
  }, [wrapper, img]);

  const handleAlignment = (e: React.MouseEvent, alignment: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!wrapper || !img) return;

    // Remove existing alignment classes
    wrapper.classList.remove('image-align-left', 'image-align-center', 'image-align-right');
    
    // Apply new alignment
    switch (alignment) {
      case 'left':
        wrapper.classList.add('image-align-left');
        wrapper.style.display = 'block';
        wrapper.style.textAlign = 'left';
        wrapper.style.marginLeft = '0';
        wrapper.style.marginRight = 'auto';
        break;
      case 'center':
        wrapper.classList.add('image-align-center');
        wrapper.style.display = 'block';
        wrapper.style.textAlign = 'center';
        wrapper.style.marginLeft = 'auto';
        wrapper.style.marginRight = 'auto';
        break;
      case 'right':
        wrapper.classList.add('image-align-right');
        wrapper.style.display = 'block';
        wrapper.style.textAlign = 'right';
        wrapper.style.marginLeft = 'auto';
        wrapper.style.marginRight = '0';
        break;
      default:
        wrapper.style.display = 'inline-block';
        wrapper.style.textAlign = '';
        wrapper.style.marginLeft = '';
        wrapper.style.marginRight = '';
    }

    // Trigger change event
    if (handleChange) {
      handleChange();
    }
  };

  const getCurrentAlignment = (): string => {
    if (!wrapper) return 'none';
    
    if (wrapper.classList.contains('image-align-left')) return 'left';
    if (wrapper.classList.contains('image-align-center')) return 'center';
    if (wrapper.classList.contains('image-align-right')) return 'right';
    return 'none';
  };

  const currentAlignment = getCurrentAlignment();

  const handleFloaterClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div 
      className="image-alignment-floater"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 1000,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '6px',
        padding: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '4px',
        alignItems: 'center'
      }}
    >
      <span style={{ fontSize: '12px', color: '#666', marginRight: '4px' }}>Align:</span>
      
      <button
        onClick={(e) => handleAlignment(e, 'left')}
        style={{
          padding: '4px 8px',
          border: '1px solid #ddd',
          borderRadius: '3px',
          backgroundColor: currentAlignment === 'left' ? '#800080' : 'white',
          color: currentAlignment === 'left' ? 'white' : '#333',
          fontSize: '12px',
          cursor: 'pointer'
        }}
        title="Align Left"
      >
        ←
      </button>
      
      <button
        onClick={(e) => handleAlignment(e, 'center')}
        style={{
          padding: '4px 8px',
          border: '1px solid #ddd',
          borderRadius: '3px',
          backgroundColor: currentAlignment === 'center' ? '#800080' : 'white',
          color: currentAlignment === 'center' ? 'white' : '#333',
          fontSize: '12px',
          cursor: 'pointer'
        }}
        title="Align Center"
      >
        ↔
      </button>
      
      <button
        onClick={(e) => handleAlignment(e, 'right')}
        style={{
          padding: '4px 8px',
          border: '1px solid #ddd',
          borderRadius: '3px',
          backgroundColor: currentAlignment === 'right' ? '#800080' : 'white',
          color: currentAlignment === 'right' ? 'white' : '#333',
          fontSize: '12px',
          cursor: 'pointer'
        }}
        title="Align Right"
      >
        →
      </button>
      
      <button
        onClick={(e) => handleAlignment(e, 'none')}
        style={{
          padding: '4px 8px',
          border: '1px solid #ddd',
          borderRadius: '3px',
          backgroundColor: currentAlignment === 'none' ? '#800080' : 'white',
          color: currentAlignment === 'none' ? 'white' : '#333',
          fontSize: '12px',
          cursor: 'pointer'
        }}
        title="No Alignment"
      >
        ×
      </button>
      
      <button
        onClick={handleFloaterClose}
        style={{
          padding: '2px 6px',
          border: '1px solid #ddd',
          borderRadius: '3px',
          backgroundColor: 'white',
          color: '#666',
          fontSize: '12px',
          cursor: 'pointer',
          marginLeft: '4px'
        }}
        title="Close"
      >
        ✕
      </button>
    </div>
  );
};

// Helper functions for image operations
export const setupImageResizeHandlers = (
  editorRef: RefObject<HTMLElement>, 
  handleChange: () => void
): void => {
  if (!editorRef.current) return;
  
  // Remove any existing alignment floaters
  const existingFloaters = editorRef.current.querySelectorAll('.image-alignment-floater');
  existingFloaters.forEach((floater) => floater.remove());
  
  // Find all images in the editor
  const images = editorRef.current.querySelectorAll('img.resizable-image') as NodeListOf<HTMLImageElement>;

  // Setup resize functionality for each image
  images.forEach((img) => {
    // Skip if this image already has resize handlers
    if (img.dataset.resizable === 'true') return;
    
    img.dataset.resizable = 'true';
    
    // Add wrapper div around the image for better positioning of handles
    const wrapper = document.createElement('div');
    wrapper.className = 'image-resize-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.maxWidth = '100%';
    
    // Replace the image with the wrapper containing the image
    if (img.parentNode) {
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
    }
    
    // Reset some image properties
    img.style.border = '1px solid transparent';
    img.style.boxSizing = 'border-box';
    img.style.maxWidth = '100%';
    
    // Add click handler to select the image
    wrapper.addEventListener('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Check if we clicked on the image or wrapper
      if (e.target === img || e.target === wrapper) {
        // Remove any existing alignment floaters
        const existingFloaters = editorRef.current!.querySelectorAll('.image-alignment-floater');
        existingFloaters.forEach((floater) => floater.remove());
        
        // Deselect any previously selected images
        const selectedWrappers = editorRef.current!.querySelectorAll('.image-wrapper-selected');
        selectedWrappers.forEach((selectedWrapper) => {
          selectedWrapper.classList.remove('image-wrapper-selected');
          const selectedImg = selectedWrapper.querySelector('img') as HTMLImageElement;
          if (selectedImg) selectedImg.style.border = '1px solid transparent';
          
          // Remove resize handles
          const handles = selectedWrapper.querySelectorAll('.resize-handle');
          handles.forEach((handle) => handle.remove());
        });
        
        // Select this image
        wrapper.classList.add('image-wrapper-selected');
        img.style.border = '2px solid #800080';
        
        // Create resize handles
        createResizeHandles(wrapper, img, handleChange);
        
        // Create alignment floater with improved positioning and event handling
        createAlignmentFloater(wrapper, img, editorRef, handleChange);
      }
    });
  });
  
  // Add click handler to the editor to deselect images when clicking elsewhere
  const deselect = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    
    // Check if we clicked on floater or its children
    const isFloaterClick = target.closest('.image-alignment-floater');
    
    // If we clicked on the editor but not on an image, handle, or floater
    if (!isFloaterClick &&
        target !== editorRef.current && 
        !target.classList.contains('resize-handle') && 
        !target.classList.contains('resizable-image') && 
        !target.classList.contains('image-resize-wrapper')) {
      
      // Remove alignment floaters
      const existingFloaters = editorRef.current!.querySelectorAll('.image-alignment-floater');
      existingFloaters.forEach((floater) => floater.remove());
      
      // Deselect all selected wrappers
      const selectedWrappers = editorRef.current!.querySelectorAll('.image-wrapper-selected');
      selectedWrappers.forEach((selectedWrapper) => {
        selectedWrapper.classList.remove('image-wrapper-selected');
        const selectedImg = selectedWrapper.querySelector('img') as HTMLImageElement;
        if (selectedImg) selectedImg.style.border = '1px solid transparent';
        
        // Remove resize handles
        const handles = selectedWrapper.querySelectorAll('.resize-handle');
        handles.forEach((handle) => handle.remove());
      });
    }
  };
  
  // Remove any existing event listener to prevent duplicates
  editorRef.current.removeEventListener('click', deselect);
  editorRef.current.addEventListener('click', deselect);
};

// Create alignment floater - FIXED VERSION
const createAlignmentFloater = (
  wrapper: HTMLElement, 
  img: HTMLImageElement, 
  editorRef: RefObject<HTMLElement>, 
  handleChange: () => void
): HTMLElement | null => {
  if (!editorRef.current) return null;
  
  // Remove any existing floaters
  const existingFloaters = editorRef.current.querySelectorAll('.image-alignment-floater');
  existingFloaters.forEach((floater) => floater.remove());
  
  // Create floater container
  const floater = document.createElement('div');
  floater.className = 'image-alignment-floater';
  
  // Calculate position for floater with better positioning logic
  const calculatePosition = () => {
    const wrapperRect = wrapper.getBoundingClientRect();
    const editorRect = editorRef.current!.getBoundingClientRect();
    
    let top = wrapperRect.top - editorRect.top - 50;
    let left = wrapperRect.left - editorRect.left;
    
    // Ensure floater doesn't go outside editor bounds
    const floaterWidth = 200; // approximate width
    if (left + floaterWidth > editorRef.current!.offsetWidth) {
      left = wrapperRect.right - editorRect.left - floaterWidth;
    }
    if (left < 0) left = 5;
    if (top < 0) top = wrapperRect.bottom - editorRect.top + 10;
    
    return { top, left };
  };
  
  const position = calculatePosition();
  
  // Style the floater with better z-index and positioning
  Object.assign(floater.style, {
    position: 'absolute',
    top: `${position.top}px`,
    left: `${position.left}px`,
    zIndex: '9999', // Higher z-index
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    userSelect: 'none',
    pointerEvents: 'auto' // Ensure pointer events work
  });
  
  // Prevent floater from being deselected when clicked
  floater.addEventListener('mousedown', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  floater.addEventListener('click', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  // Create alignment buttons
  const alignments = [
    { key: 'left', symbol: '←', title: 'Align Left' },
    { key: 'center', symbol: '↔', title: 'Align Center' },
    { key: 'right', symbol: '→', title: 'Align Right' },
    { key: 'none', symbol: '×', title: 'No Alignment' }
  ];
  
  // Add label
  const label = document.createElement('span');
  label.textContent = 'Align:';
  label.style.fontSize = '12px';
  label.style.color = '#666';
  label.style.marginRight = '4px';
  label.style.fontWeight = '500';
  floater.appendChild(label);
  
  // Get current alignment
  const getCurrentAlignment = (): string => {
    if (wrapper.classList.contains('image-align-left')) return 'left';
    if (wrapper.classList.contains('image-align-center')) return 'center';
    if (wrapper.classList.contains('image-align-right')) return 'right';
    return 'none';
  };
  
  // Handle alignment change
  const handleAlignment = (alignment: string) => {
    // Remove existing alignment classes
    wrapper.classList.remove('image-align-left', 'image-align-center', 'image-align-right');
    
    // Apply new alignment
    switch (alignment) {
      case 'left':
        wrapper.classList.add('image-align-left');
        wrapper.style.display = 'block';
        wrapper.style.textAlign = 'left';
        wrapper.style.marginLeft = '0';
        wrapper.style.marginRight = 'auto';
        wrapper.style.width = 'fit-content';
        break;
      case 'center':
        wrapper.classList.add('image-align-center');
        wrapper.style.display = 'block';
        wrapper.style.textAlign = 'center';
        wrapper.style.marginLeft = 'auto';
        wrapper.style.marginRight = 'auto';
        wrapper.style.width = 'fit-content';
        break;
      case 'right':
        wrapper.classList.add('image-align-right');
        wrapper.style.display = 'block';
        wrapper.style.textAlign = 'right';
        wrapper.style.marginLeft = 'auto';
        wrapper.style.marginRight = '0';
        wrapper.style.width = 'fit-content';
        break;
      default:
        wrapper.style.display = 'inline-block';
        wrapper.style.textAlign = '';
        wrapper.style.marginLeft = '';
        wrapper.style.marginRight = '';
        wrapper.style.width = '';
    }

    // Update button states
    updateButtonStates();
    
    // Trigger change event
    if (handleChange) {
      handleChange();
    }
  };
  
  const updateButtonStates = () => {
    const currentAlignment = getCurrentAlignment();
    alignmentButtons.forEach((button) => {
      if (button.dataset.alignment === currentAlignment) {
        button.style.backgroundColor = '#800080';
        button.style.color = 'white';
        button.style.borderColor = '#800080';
      } else {
        button.style.backgroundColor = 'white';
        button.style.color = '#333';
        button.style.borderColor = '#ddd';
      }
    });
  };
  
  // Create alignment buttons with better event handling
  const alignmentButtons: HTMLButtonElement[] = [];
  
  alignments.forEach(({ key, symbol, title }) => {
    const button = document.createElement('button');
    button.textContent = symbol;
    button.title = title;
    button.dataset.alignment = key;
    button.type = 'button'; // Prevent form submission
    
    Object.assign(button.style, {
      padding: '6px 10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer',
      backgroundColor: 'white',
      color: '#333',
      minWidth: '32px',
      transition: 'all 0.2s ease',
      userSelect: 'none'
    });
    
    // Hover effects
    button.addEventListener('mouseenter', () => {
      if (button.dataset.alignment !== getCurrentAlignment()) {
        button.style.backgroundColor = '#f5f5f5';
        button.style.borderColor = '#999';
      }
    });
    
    button.addEventListener('mouseleave', () => {
      if (button.dataset.alignment !== getCurrentAlignment()) {
        button.style.backgroundColor = 'white';
        button.style.borderColor = '#ddd';
      }
    });
    
    // Click handler with proper event handling
    button.addEventListener('mousedown', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    });
    
    button.addEventListener('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      handleAlignment(key);
    });
    
    alignmentButtons.push(button);
    floater.appendChild(button);
  });
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = '✕';
  closeButton.title = 'Close';
  closeButton.type = 'button';
  
  Object.assign(closeButton.style, {
    padding: '4px 8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    color: '#666',
    fontSize: '12px',
    cursor: 'pointer',
    marginLeft: '8px',
    minWidth: '24px',
    transition: 'all 0.2s ease'
  });
  
  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.backgroundColor = '#f5f5f5';
    closeButton.style.color = '#333';
  });
  
  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.backgroundColor = 'white';
    closeButton.style.color = '#666';
  });
  
  closeButton.addEventListener('mousedown', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  closeButton.addEventListener('click', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    floater.remove();
  });
  
  floater.appendChild(closeButton);
  
  // Update initial button states
  updateButtonStates();
  
  // Add floater to editor with proper insertion
  editorRef.current.style.position = 'relative'; // Ensure editor has relative positioning
  editorRef.current.appendChild(floater);
  
  // Return floater reference for potential cleanup
  return floater;
};

const createResizeHandles = (
  wrapper: HTMLElement, 
  img: HTMLImageElement, 
  handleChange: () => void
): void => {
  // Remove any existing handles
  const existingHandles = wrapper.querySelectorAll('.resize-handle');
  existingHandles.forEach((handle) => handle.remove());
  
  // Create handle positions: corners and centers of each side
  const positions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
  
  // Define cursor styles for each handle position
  const cursors: Record<string, string> = {
    'nw': 'nwse-resize',
    'n': 'ns-resize',
    'ne': 'nesw-resize',
    'e': 'ew-resize',
    'se': 'nwse-resize',
    's': 'ns-resize',
    'sw': 'nesw-resize',
    'w': 'ew-resize'
  };
  
  positions.forEach((pos) => {
    const handle = document.createElement('div');
    handle.className = `resize-handle resize-handle-${pos}`;
    handle.style.position = 'absolute';
    handle.style.width = '8px';
    handle.style.height = '8px';
    handle.style.backgroundColor = '#800080';
    handle.style.borderRadius = '50%';
    handle.style.zIndex = '100';
    handle.style.cursor = cursors[pos];
    
    // Position the handle
    // All coordinates need to be calculated based on the image dimensions
    const imgWidth = img.offsetWidth;
    const imgHeight = img.offsetHeight;
    
    positionHandle(handle, pos, imgWidth, imgHeight);
    
    // Add resize functionality
    handle.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get initial positions and sizes
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = img.offsetWidth;
      const startHeight = img.offsetHeight;
      const startTop = img.offsetTop;
      const startLeft = img.offsetLeft;
      const imgRatio = startWidth / startHeight;
      
      // Create mousemove and mouseup handlers
      const onMouseMove = (moveEvent: MouseEvent) => {
        moveEvent.preventDefault();
        
        // Calculate movement deltas
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        
        // Calculate new width and height based on drag direction
        let newWidth = startWidth;
        let newHeight = startHeight;
        
        // Apply different resize logic based on handle position
        switch (pos) {
          case 'e': // East (right middle)
            newWidth = startWidth + deltaX;
            newHeight = startHeight; // Keep height unchanged
            break;
          case 'w': // West (left middle)
            newWidth = startWidth - deltaX;
            newHeight = startHeight; // Keep height unchanged
            break;
          case 'n': // North (top middle)
            newHeight = startHeight - deltaY;
            newWidth = startWidth; // Keep width unchanged
            break;
          case 's': // South (bottom middle)
            newHeight = startHeight + deltaY;
            newWidth = startWidth; // Keep width unchanged
            break;
          case 'nw': // Northwest (top left)
            newWidth = startWidth - deltaX;
            newHeight = startHeight - deltaY;
            break;
          case 'ne': // Northeast (top right)
            newWidth = startWidth + deltaX;
            newHeight = startHeight - deltaY;
            break;
          case 'se': // Southeast (bottom right)
            newWidth = startWidth + deltaX;
            newHeight = startHeight + deltaY;
            break;
          case 'sw': // Southwest (bottom left)
            newWidth = startWidth - deltaX;
            newHeight = startHeight + deltaY;
            break;
        }
        
        // Apply minimum constraints
        if (newWidth >= 30) {
          img.style.width = `${newWidth}px`;
        }
        
        if (newHeight >= 30) {
          img.style.height = `${newHeight}px`;
        }
        
        // Update handle positions after resize
        updateHandlePositions(wrapper, img);
      };
      
      const onMouseUp = () => {
        // Remove event listeners
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        
        // Update editor content
        handleChange();
      };
      
      // Add event listeners
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    
    // Add handle to wrapper
    wrapper.appendChild(handle);
  });
};

// Helper function to position handle based on position code
const positionHandle = (handle: HTMLElement, pos: string, imgWidth: number, imgHeight: number): void => {
  switch (pos) {
    case 'nw': // Northwest (top left)
      handle.style.top = '-4px';
      handle.style.left = '-4px';
      break;
    case 'n': // North (top center)
      handle.style.top = '-4px';
      handle.style.left = `calc(50% - 4px)`;
      break;
    case 'ne': // Northeast (top right)
      handle.style.top = '-4px';
      handle.style.right = '-4px';
      break;
    case 'e': // East (right center)
      handle.style.top = `calc(50% - 4px)`;
      handle.style.right = '-4px';
      break;
    case 'se': // Southeast (bottom right)
      handle.style.bottom = '-4px';
      handle.style.right = '-4px';
      break;
    case 's': // South (bottom center)
      handle.style.bottom = '-4px';
      handle.style.left = `calc(50% - 4px)`;
      break;
    case 'sw': // Southwest (bottom left)
      handle.style.bottom = '-4px';
      handle.style.left = '-4px';
      break;
    case 'w': // West (left center)
      handle.style.top = `calc(50% - 4px)`;
      handle.style.left = '-4px';
      break;
  }
};

// Helper function to update all handle positions after resize
const updateHandlePositions = (wrapper: HTMLElement, img: HTMLImageElement): void => {
  const handles = wrapper.querySelectorAll('.resize-handle') as NodeListOf<HTMLElement>;
  const imgWidth = img.offsetWidth;
  const imgHeight = img.offsetHeight;
  
  handles.forEach((handle) => {
    const pos = handle.className.split('resize-handle-')[1];
    positionHandle(handle, pos, imgWidth, imgHeight);
  });
};

// Function to handle image insertion in the editor
export const handleImageInsertion = (
  { imageUrl, uploadedImage }: ImageInsertionData, 
  execCommand: (command: string, value: string) => void
): boolean => {
  if (imageUrl) {
    const imgHtml = `<img src="${imageUrl}" alt="Inserted Image" style="max-width: 100%;" class="resizable-image" />`;
    execCommand('insertHTML', imgHtml);
    return true;
  } else if (uploadedImage) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        const imgHtml = `<img src="${e.target.result}" alt="Uploaded Image" style="max-width: 100%;" class="resizable-image" />`;
        execCommand('insertHTML', imgHtml);
      }
    };
    reader.readAsDataURL(uploadedImage);
    return true;
  }
  return false;
};

export default ImageModal;
export { ImageAlignmentFloater };