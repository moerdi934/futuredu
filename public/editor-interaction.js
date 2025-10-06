// public/js/editor-interactions.js

(function() {
  'use strict';

  // Store editor instances by ID
  const editors = {};

  // Initialize editor interactions for a specific editor ID
  window.initEditorInteractions = function(editorId) {
    if (!editorId) return;
    
    // Store initialization state
    if (!editors[editorId]) {
      editors[editorId] = {
        initialized: false,
        handlers: {}
      };
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setupEditor(editorId);
      });
    } else {
      setupEditor(editorId);
    }
  };

  function setupEditor(editorId) {
    const editorContainer = document.querySelector(`[data-editor-id="${editorId}"]`);
    if (!editorContainer) {
      console.warn(`Editor with ID ${editorId} not found`);
      return;
    }

    const editorElement = editorContainer.querySelector('#editor-content, [contenteditable="true"]');
    if (!editorElement) {
      console.warn(`Editor content element not found for ${editorId}`);
      return;
    }

    // Setup code block handlers
    setupCodeBlockHandlers(editorElement, editorId);
    
    // Setup image handlers
    setupImageHandlers(editorElement, editorId);
    
    // Mark as initialized
    editors[editorId].initialized = true;
  }

  // Setup code block collapse/expand handlers
  function setupCodeBlockHandlers(editorElement, editorId) {
    const codeWrappers = editorElement.querySelectorAll('.cte-code-wrapper');
    
    codeWrappers.forEach(wrapper => {
      const collapseButton = wrapper.querySelector('.cte-collapse-button');
      const codeContent = wrapper.querySelector('.cte-code-content');
      
      if (!collapseButton || !codeContent) return;
      
      // Check if handler already attached
      if (collapseButton.dataset.handlerAttached === 'true') return;
      
      // Create handler function
      const toggleHandler = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isCollapsed = wrapper.getAttribute('data-collapsed') === 'true';
        toggleCodeBlock(wrapper, collapseButton, codeContent, !isCollapsed);
      };
      
      // Remove any existing handlers
      const oldHandler = editors[editorId].handlers[`collapse-${wrapper.dataset.codeId}`];
      if (oldHandler) {
        collapseButton.removeEventListener('click', oldHandler);
      }
      
      // Add new handler
      collapseButton.addEventListener('click', toggleHandler);
      collapseButton.dataset.handlerAttached = 'true';
      
      // Store handler reference
      if (!wrapper.dataset.codeId) {
        wrapper.dataset.codeId = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      editors[editorId].handlers[`collapse-${wrapper.dataset.codeId}`] = toggleHandler;
      
      // Make button interactive
      collapseButton.style.cursor = 'pointer';
      collapseButton.setAttribute('tabindex', '0');
      collapseButton.setAttribute('role', 'button');
      collapseButton.setAttribute('aria-expanded', wrapper.getAttribute('data-collapsed') !== 'true');
      collapseButton.setAttribute('aria-label', 'Toggle code visibility');
      
      // Add keyboard support
      collapseButton.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleHandler(e);
        }
      });
    });
  }

  // Toggle code block visibility with animation
  function toggleCodeBlock(wrapper, button, codeContent, collapse) {
    const contentHeight = codeContent.scrollHeight;
    
    if (collapse) {
      // Collapse animation
      wrapper.setAttribute('data-collapsed', 'true');
      button.setAttribute('aria-expanded', 'false');
      
      // Set initial state for animation
      codeContent.style.height = contentHeight + 'px';
      codeContent.style.opacity = '1';
      codeContent.style.overflow = 'hidden';
      
      // Force browser reflow
      codeContent.offsetHeight;
      
      // Animate to collapsed state
      codeContent.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      codeContent.style.height = '0px';
      codeContent.style.opacity = '0';
      
      // Update button icon
      button.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>';
      button.title = 'Expand code';
      
      // Clean up after animation
      setTimeout(() => {
        if (wrapper.getAttribute('data-collapsed') === 'true') {
          codeContent.style.display = 'none';
        }
      }, 300);
    } else {
      // Expand animation
      wrapper.setAttribute('data-collapsed', 'false');
      button.setAttribute('aria-expanded', 'true');
      
      // Reset display
      codeContent.style.display = '';
      
      // Set initial state for animation
      codeContent.style.height = '0px';
      codeContent.style.opacity = '0';
      codeContent.style.overflow = 'hidden';
      
      // Force browser reflow
      codeContent.offsetHeight;
      
      // Animate to expanded state
      codeContent.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      codeContent.style.height = contentHeight + 'px';
      codeContent.style.opacity = '1';
      
      // Update button icon
      button.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7 7"></path></svg>';
      button.title = 'Collapse code';
      
      // Clean up after animation
      setTimeout(() => {
        if (wrapper.getAttribute('data-collapsed') === 'false') {
          codeContent.style.transition = '';
          codeContent.style.height = '';
          codeContent.style.overflow = '';
          codeContent.style.opacity = '';
        }
      }, 300);
    }
  }

  // Setup image selection handlers
  function setupImageHandlers(editorElement, editorId) {
    const images = editorElement.querySelectorAll('img.cte-resizable-image, img.resizable-image');
    
    images.forEach(img => {
      // Skip if already processed for this editor
      if (img.dataset.interactionSetup === editorId) return;
      
      const wrapper = img.closest('.cte-image-resize-wrapper, .image-resize-wrapper');
      if (!wrapper) return;
      
      // Mark as processed
      img.dataset.interactionSetup = editorId;
      
      // Ensure image is clickable
      img.style.cursor = 'pointer';
      wrapper.style.cursor = 'pointer';
      
      // Create click handler
      const imageClickHandler = function(e) {
        // Don't handle if clicking on resize handles or floater
        if (e.target.classList.contains('cte-resize-handle') || 
            e.target.closest('.image-alignment-floater')) {
          return;
        }
        
        // Trigger image selection
        triggerImageSelection(wrapper, img, editorElement, editorId);
      };
      
      // Remove old handler if exists
      const oldHandler = editors[editorId].handlers[`image-${img.dataset.imageId}`];
      if (oldHandler) {
        wrapper.removeEventListener('click', oldHandler);
        img.removeEventListener('click', oldHandler);
      }
      
      // Add new handler
      wrapper.addEventListener('click', imageClickHandler);
      img.addEventListener('click', imageClickHandler);
      
      // Store handler reference
      if (!img.dataset.imageId) {
        img.dataset.imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      editors[editorId].handlers[`image-${img.dataset.imageId}`] = imageClickHandler;
    });
    
    // Setup deselect handler
    if (!editors[editorId].deselectHandler) {
      const deselectHandler = function(e) {
        // Check if click is on editor content but not on image elements
        if (!e.target.closest('.cte-image-resize-wrapper') && 
            !e.target.closest('.image-resize-wrapper') &&
            !e.target.closest('.cte-resize-handle') &&
            !e.target.closest('.image-alignment-floater') &&
            !e.target.classList.contains('cte-resizable-image') &&
            !e.target.classList.contains('resizable-image')) {
          deselectAllImages(editorElement);
        }
      };
      
      editorElement.addEventListener('click', deselectHandler);
      editors[editorId].deselectHandler = deselectHandler;
    }
  }

  // Trigger image selection (simulate React component behavior)
  function triggerImageSelection(wrapper, img, editorElement, editorId) {
    // First deselect all other images
    deselectAllImages(editorElement);
    
    // Select this image
    wrapper.classList.add('cte-image-wrapper-selected');
    img.style.border = '2px solid #800080';
    
    // Trigger custom event for React component to handle
    const selectEvent = new CustomEvent('imageSelected', {
      detail: { wrapper, img },
      bubbles: true
    });
    wrapper.dispatchEvent(selectEvent);
  }

  // Deselect all images
  function deselectAllImages(editorElement) {
    // Remove selection classes
    const selectedWrappers = editorElement.querySelectorAll('.cte-image-wrapper-selected');
    selectedWrappers.forEach(wrapper => {
      wrapper.classList.remove('cte-image-wrapper-selected');
      const img = wrapper.querySelector('img');
      if (img) {
        img.style.border = '1px solid transparent';
      }
    });
    
    // Remove any floating elements
    const floaters = editorElement.querySelectorAll('.image-alignment-floater');
    floaters.forEach(floater => floater.remove());
    
    // Remove resize handles
    const handles = editorElement.querySelectorAll('.cte-resize-handle');
    handles.forEach(handle => handle.remove());
  }

  // Re-initialize on dynamic content changes
  window.reinitEditorInteractions = function(editorId) {
    if (!editorId || !editors[editorId]) return;
    
    // Clear existing handlers
    for (const key in editors[editorId].handlers) {
      delete editors[editorId].handlers[key];
    }
    
    // Re-setup
    setupEditor(editorId);
  };

  // Cleanup function
  window.cleanupEditorInteractions = function(editorId) {
    if (!editorId || !editors[editorId]) return;
    
    const editorContainer = document.querySelector(`[data-editor-id="${editorId}"]`);
    if (!editorContainer) return;
    
    const editorElement = editorContainer.querySelector('#editor-content, [contenteditable="true"]');
    if (!editorElement) return;
    
    // Remove all handlers
    for (const key in editors[editorId].handlers) {
      const elements = editorElement.querySelectorAll(`[data-handler-id="${key}"]`);
      elements.forEach(el => {
        el.removeEventListener('click', editors[editorId].handlers[key]);
      });
    }
    
    // Remove deselect handler
    if (editors[editorId].deselectHandler) {
      editorElement.removeEventListener('click', editors[editorId].deselectHandler);
    }
    
    // Clear editor data
    delete editors[editorId];
  };

  // Auto-initialize on DOM changes
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              // Check for code blocks
              if (node.classList && node.classList.contains('cte-code-wrapper')) {
                const editorElement = node.closest('[contenteditable="true"]');
                if (editorElement) {
                  const container = editorElement.closest('[data-editor-id]');
                  if (container) {
                    const editorId = container.dataset.editorId;
                    setTimeout(() => setupCodeBlockHandlers(editorElement, editorId), 100);
                  }
                }
              }
              
              // Check for images
              if (node.tagName === 'IMG' && (node.classList.contains('cte-resizable-image') || node.classList.contains('resizable-image'))) {
                const editorElement = node.closest('[contenteditable="true"]');
                if (editorElement) {
                  const container = editorElement.closest('[data-editor-id]');
                  if (container) {
                    const editorId = container.dataset.editorId;
                    setTimeout(() => setupImageHandlers(editorElement, editorId), 100);
                  }
                }
              }
            }
          });
        }
      });
    });

    // Start observing when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      });
    } else {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
})();