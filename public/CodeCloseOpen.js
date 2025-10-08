/**
 * Code Block Close/Open Handler
 * Handles styling and collapse/expand functionality for code blocks
 * 
 * Usage:
 * 1. Include this script in your HTML: <script src="/CodeCloseOpen.js"></script>
 * 2. Call window.CodeCloseOpenHandler.init() after content is loaded
 * 3. Code blocks must have class 'cte-code-wrapper'
 */

(function() {
  'use strict';

  // Class names (must match with Code.tsx)
  const CODE_WRAPPER_CLASS = 'cte-code-wrapper';
  const CODE_BLOCK_CLASS = 'cte-code-block';
  const LANGUAGE_SELECT_CLASS = 'cte-language-select';
  const CODE_CONTENT_CLASS = 'cte-code-content';
  const COLLAPSE_BUTTON_CLASS = 'cte-collapse-button';

  /**
   * Toggle collapse/expand state of code block with smooth animation
   */
  function toggleCodeBlock(wrapper, button) {
    const codeContent = wrapper.querySelector(`.${CODE_CONTENT_CLASS}`);
    const isCollapsed = wrapper.getAttribute('data-collapsed') === 'true';
    
    if (!codeContent) return;
    
    // Get content height for animation
    const contentHeight = codeContent.scrollHeight;
    
    if (isCollapsed) {
      // EXPAND animation
      wrapper.setAttribute('data-collapsed', 'false');
      
      // Set initial state
      codeContent.style.height = '0px';
      codeContent.style.opacity = '0';
      codeContent.style.overflow = 'hidden';
      
      // Force reflow
      codeContent.offsetHeight;
      
      // Animate to full height
      codeContent.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      codeContent.style.height = contentHeight + 'px';
      codeContent.style.opacity = '1';
      
      // Update button icon and title
      button.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
      button.title = 'Collapse code';
      
      // Clean up after animation
      setTimeout(() => {
        if (wrapper.getAttribute('data-collapsed') === 'false') {
          codeContent.style.height = 'auto';
          codeContent.style.overflow = '';
          codeContent.style.transition = '';
        }
      }, 300);
    } else {
      // COLLAPSE animation
      wrapper.setAttribute('data-collapsed', 'true');
      
      // Set initial state
      codeContent.style.height = contentHeight + 'px';
      codeContent.style.opacity = '1';
      codeContent.style.overflow = 'hidden';
      
      // Force reflow
      codeContent.offsetHeight;
      
      // Animate to collapsed state
      codeContent.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      codeContent.style.height = '0px';
      codeContent.style.opacity = '0';
      
      // Update button icon and title
      button.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>';
      button.title = 'Expand code';
    }
  }

  /**
   * Initialize collapse buttons for all code blocks in the given container
   */
  function initializeCollapseButtons(container) {
    if (!container) {
      container = document;
    }

    const collapseButtons = container.querySelectorAll(`.${COLLAPSE_BUTTON_CLASS}`);
    
    collapseButtons.forEach(button => {
      // Remove existing event listeners to prevent duplicates
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      // Add click event listener
      newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const wrapper = newButton.closest(`.${CODE_WRAPPER_CLASS}`);
        if (wrapper) {
          toggleCodeBlock(wrapper, newButton);
        }
      });
    });

    console.log(`[CodeCloseOpen] Initialized ${collapseButtons.length} collapse buttons`);
  }

  /**
   * Inject CSS styles for code blocks
   */
  function injectStyles() {
    // Check if styles already injected
    if (document.getElementById('code-close-open-styles')) {
      return;
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'code-close-open-styles';
    styleElement.textContent = `
      /* Code Block Styles */
      .${CODE_WRAPPER_CLASS} {
        margin: 1rem 0;
        border-radius: 0.375rem;
        overflow: hidden;
        border: 1px solid #e9d5ff;
        display: block;
        background: white;
      }
      
      .${LANGUAGE_SELECT_CLASS} {
        background-color: #f3e8ff;
        color: #7e22ce;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        border-bottom: 1px solid #e9d5ff;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .${COLLAPSE_BUTTON_CLASS} {
        background: none;
        border: none;
        color: #7e22ce;
        cursor: pointer;
        padding: 2px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        width: 24px;
        height: 24px;
      }
      
      .${COLLAPSE_BUTTON_CLASS}:hover {
        background-color: rgba(126, 34, 206, 0.1);
        transform: scale(1.1);
      }
      
      .${COLLAPSE_BUTTON_CLASS}:focus {
        outline: 2px solid rgba(126, 34, 206, 0.3);
        outline-offset: 2px;
      }
      
      .${CODE_CONTENT_CLASS} {
        overflow: hidden;
        transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: height, opacity;
      }
      
      .${CODE_WRAPPER_CLASS} pre {
        margin: 0;
        padding: 1rem;
        overflow-x: auto;
        background-color: #fafafa;
      }
      
      .${CODE_BLOCK_CLASS} {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.875rem;
        line-height: 1.5;
        white-space: pre;
        display: block;
      }
      
      /* Collapsed state */
      .${CODE_WRAPPER_CLASS}[data-collapsed="true"] .${CODE_CONTENT_CLASS} {
        height: 0;
        opacity: 0;
        overflow: hidden;
      }
      
      /* Hover effect */
      .${CODE_WRAPPER_CLASS}:hover {
        border-color: #c4b5fd;
        box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
      }
      
      /* Smooth transitions */
      .${CODE_WRAPPER_CLASS} {
        transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
                    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Ensure paragraphs after code blocks have proper spacing */
      .${CODE_WRAPPER_CLASS} + p,
      .${CODE_WRAPPER_CLASS} + div {
        margin-top: 1rem;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .${CODE_WRAPPER_CLASS} pre {
          padding: 0.75rem;
          font-size: 0.8125rem;
        }
        
        .${CODE_BLOCK_CLASS} {
          font-size: 0.8125rem;
        }
      }
    `;

    document.head.appendChild(styleElement);
    console.log('[CodeCloseOpen] Styles injected');
  }

  /**
   * Initialize all code blocks
   */
  function init(container) {
    console.log('[CodeCloseOpen] Initializing...');
    
    // Inject styles
    injectStyles();
    
    // Initialize collapse buttons
    initializeCollapseButtons(container);
    
    console.log('[CodeCloseOpen] Initialization complete');
  }

  /**
   * Reinitialize - useful when content is dynamically loaded
   */
  function reinit(container) {
    console.log('[CodeCloseOpen] Reinitializing...');
    initializeCollapseButtons(container);
  }

  /**
   * Clean up - remove event listeners and styles
   */
  function cleanup() {
    const styleElement = document.getElementById('code-close-open-styles');
    if (styleElement) {
      styleElement.remove();
    }
    console.log('[CodeCloseOpen] Cleaned up');
  }

  // Expose public API
  window.CodeCloseOpenHandler = {
    init: init,
    reinit: reinit,
    cleanup: cleanup,
    version: '1.0.0'
  };

  // Auto-initialize on DOMContentLoaded if not already initialized
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('[CodeCloseOpen] Auto-initializing on DOMContentLoaded');
      init();
    });
  } else {
    // DOM already loaded
    console.log('[CodeCloseOpen] DOM already loaded, initializing immediately');
    init();
  }

  console.log('[CodeCloseOpen] Handler loaded and ready');
})();