/**
 * Code Collapse Functionality for SuperEditor
 * 
 * This script manages the collapse/expand functionality for code blocks
 * in the SuperEditor component. It should be placed in the /public/js folder
 * to be accessible globally.
 */

(function() {
  // Constants for class names
  const CODE_WRAPPER_CLASS = 'cte-code-wrapper';
  const CODE_BLOCK_CLASS = 'cte-code-block';
  const LANGUAGE_SELECT_CLASS = 'cte-language-select';
  const CODE_CONTENT_CLASS = 'cte-code-content';
  const COLLAPSE_BUTTON_CLASS = 'cte-collapse-button';

  /**
   * Toggle collapse/expand state of code block with smooth animation
   * @param {HTMLElement} wrapper - The code wrapper element
   * @param {HTMLElement} button - The collapse/expand button element
   */
  function toggleCodeBlock(wrapper, button) {
    if (!wrapper || !button) return;

    const codeContent = wrapper.querySelector(`.${CODE_CONTENT_CLASS}`);
    if (!codeContent) return;

    const isCollapsed = wrapper.getAttribute('data-collapsed') === 'true';
    
    // Calculate content height for animation
    const contentHeight = codeContent.scrollHeight;
    
    if (isCollapsed) {
      // Expand animation
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
          codeContent.style.height = '';
          codeContent.style.opacity = '';
          codeContent.style.overflow = '';
          codeContent.style.transition = '';
        }
      }, 300);
    } else {
      // Collapse animation
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
   * Initialize collapse buttons for all code blocks in the document
   */
  function initCodeCollapseButtons() {
    // Find all code blocks
    const codeWrappers = document.querySelectorAll(`.${CODE_WRAPPER_CLASS}`);
    
    codeWrappers.forEach(wrapper => {
      const collapseButton = wrapper.querySelector(`.${COLLAPSE_BUTTON_CLASS}`);
      if (!collapseButton) return;
      
      // Remove existing event listeners to prevent duplicates
      const newButton = collapseButton.cloneNode(true);
      collapseButton.parentNode.replaceChild(newButton, collapseButton);
      
      // Add new click event listener
      newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleCodeBlock(wrapper, newButton);
      });
      
      // Set initial button state
      const isCollapsed = wrapper.getAttribute('data-collapsed') === 'true';
      if (isCollapsed) {
        newButton.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>';
        newButton.title = 'Expand code';
      } else {
        newButton.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
        newButton.title = 'Collapse code';
      }
    });
  }

  // Handle cases where code blocks are added dynamically
  function setupMutationObserver() {
    if (!window.MutationObserver) return;
    
    const observer = new MutationObserver(function(mutations) {
      let shouldInit = false;
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          for (const node of addedNodes) {
            if (node.nodeType === 1) { // Element node
              const hasCodeWrapper = node.classList && node.classList.contains(CODE_WRAPPER_CLASS);
              const containsCodeWrapper = node.querySelector && node.querySelector(`.${CODE_WRAPPER_CLASS}`);
              
              if (hasCodeWrapper || containsCodeWrapper) {
                shouldInit = true;
                break;
              }
            }
          }
        }
      });
      
      if (shouldInit) {
        initCodeCollapseButtons();
      }
    });
    
    // Observe changes to the entire document
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }

  // Run initialization when DOM is ready
  function initialize() {
    // Initialize existing code blocks
    initCodeCollapseButtons();
    
    // Set up observer for future changes
    setupMutationObserver();
    
    // Make function available globally
    window.initCodeCollapseButtons = initCodeCollapseButtons;
    window.toggleCodeBlock = toggleCodeBlock;
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();