/**
 * Practice Question Handler
 * Handles delete functionality, check answer, show/hide explanation, and hide trash button in read-only mode
 * 
 * Usage:
 * 1. Include this script in your HTML: <script src="/PracticeHandler.js"></script>
 * 2. Call window.PracticeHandler.init() after content is loaded
 * 3. Practice blocks must have class 'cte-practice-question-block'
 * 4. Call window.PracticeHandler.removeTrashButtons() before saving to database
 */

(function() {
  'use strict';

  // Class names (must match with Practice.tsx)
  const PRACTICE_WRAPPER_CLASS = 'cte-practice-question-block';
  const PRACTICE_DELETE_CLASS = 'practice-delete-btn';
  const CHECK_ANSWER_CLASS = 'check-answer-btn';
  const SHOW_EXPLANATION_CLASS = 'show-explanation-btn';
  const RESULT_AREA_CLASS = 'result-area';
  const EXPLANATION_AREA_CLASS = 'explanation-area';

  /**
   * Remove all trash buttons from practice blocks
   * Should be called before saving content to database
   */
  function removeTrashButtons(container) {
    if (!container) {
      container = document;
    }

    const trashButtons = container.querySelectorAll(`.${PRACTICE_DELETE_CLASS}`);
    let removedCount = 0;

    trashButtons.forEach(button => {
      button.remove();
      removedCount++;
    });

    console.log(`[PracticeHandler] Removed ${removedCount} trash button(s)`);
    return removedCount;
  }

  /**
   * Get clean HTML content without trash buttons
   * Useful for getting content before saving to database
   */
  function getCleanContent(container) {
    if (!container) {
      console.error('[PracticeHandler] Container is required for getCleanContent');
      return '';
    }

    // Clone the container to avoid modifying the original
    const clone = container.cloneNode(true);
    
    // Remove all trash buttons from the clone
    const trashButtons = clone.querySelectorAll(`.${PRACTICE_DELETE_CLASS}`);
    trashButtons.forEach(button => button.remove());

    return clone.innerHTML;
  }

  /**
   * Handle check answer for a practice block
   */
  function handleCheckAnswer(wrapper) {
    const questionType = wrapper.getAttribute('data-question-type');
    const correctAnswer = JSON.parse(decodeURIComponent(wrapper.getAttribute('data-correct-answer') || ''));
    const resultArea = wrapper.querySelector(`.${RESULT_AREA_CLASS}`);
    const resultContent = resultArea.querySelector('.result-content');
    const showExplanationBtn = wrapper.querySelector(`.${SHOW_EXPLANATION_CLASS}`);
    
    // Get user answer based on type
    let userAnswer;
    switch (questionType) {
      case 'single-choice':
        userAnswer = wrapper.querySelector('input[type="radio"]:checked')?.value;
        break;
      case 'multiple-choice':
        userAnswer = Array.from(wrapper.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);
        break;
      case 'true-false':
        userAnswer = Array.from(wrapper.querySelectorAll('input[type="radio"]')).reduce((acc, input, idx) => {
          if (input.checked) {
            const statementIdx = Math.floor(idx / 2);
            acc[statementIdx] = input.value === 'true';
          }
          return acc;
        }, []);
        break;
      case 'text-input':
        userAnswer = wrapper.querySelector('.practice-text-input')?.value;
        break;
      case 'number-input':
        userAnswer = wrapper.querySelector('.practice-number-input')?.value;
        break;
    }

    // Check if correct
    const isCorrect = checkIfCorrect(userAnswer, correctAnswer, questionType);

    // Show result
    resultContent.innerHTML = isCorrect ? 
      '<div class="tw-text-green-600 tw-flex tw-items-center"><svg class="tw-w-5 tw-h-5 tw-mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Correct</div>' :
      '<div class="tw-text-red-600 tw-flex tw-items-center"><svg class="tw-w-5 tw-h-5 tw-mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>Incorrect</div>';
    resultArea.classList.remove('tw-hidden');

    // Show explanation button
    showExplanationBtn.classList.remove('tw-hidden');

    // Disable inputs
    const inputs = wrapper.querySelectorAll('input');
    inputs.forEach(input => input.disabled = true);
  }

  /**
   * Check if answer is correct
   */
  function checkIfCorrect(userAnswer, correctAnswer, questionType) {
    switch (questionType) {
      case 'single-choice':
        return userAnswer === correctAnswer;
      case 'multiple-choice':
        return JSON.stringify([...(userAnswer || [])].sort()) === JSON.stringify([...correctAnswer].sort());
      case 'true-false':
        return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
      case 'text-input':
        return (userAnswer || '').toLowerCase().trim() === (correctAnswer || '').toLowerCase().trim();
      case 'number-input':
        return parseFloat(userAnswer) === parseFloat(correctAnswer);
      default:
        return false;
    }
  }

  /**
   * Toggle explanation
   */
  function toggleExplanation(wrapper, button) {
    const explanationArea = wrapper.querySelector(`.${EXPLANATION_AREA_CLASS}`);
    const explanationContent = explanationArea.querySelector('.explanation-content');
    const isShown = !explanationArea.classList.contains('tw-hidden');

    if (!isShown) {
      // Load explanation if not loaded
      if (!explanationContent.innerHTML.trim()) {
        const encodedExplanation = wrapper.getAttribute('data-explanation');
        explanationContent.innerHTML = decodeURIComponent(encodedExplanation || 'No explanation available.');
      }
    }

    explanationArea.classList.toggle('tw-hidden');
    button.textContent = isShown ? 'Show Explanation' : 'Hide Explanation';
  }

  /**
   * Initialize handlers for all practice blocks in the given container
   */
  function initializeHandlers(container) {
    if (!container) {
      container = document;
    }

    const wrappers = container.querySelectorAll(`.${PRACTICE_WRAPPER_CLASS}`);
    
    wrappers.forEach(wrapper => {
      // Setup delete button
      const deleteBtn = wrapper.querySelector(`.${PRACTICE_DELETE_CLASS}`);
      if (deleteBtn && !deleteBtn.hasAttribute('data-event-attached')) {
        deleteBtn.setAttribute('data-event-attached', 'true');
        deleteBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          if (confirm('Delete this practice question?')) {
            wrapper.remove();
          }
        });
      }

      // Setup check answer button
      const checkBtn = wrapper.querySelector(`.${CHECK_ANSWER_CLASS}`);
      if (checkBtn && !checkBtn.hasAttribute('data-event-attached')) {
        checkBtn.setAttribute('data-event-attached', 'true');
        checkBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          handleCheckAnswer(wrapper);
        });
      }

      // Setup show explanation button
      const showExpBtn = wrapper.querySelector(`.${SHOW_EXPLANATION_CLASS}`);
      if (showExpBtn && !showExpBtn.hasAttribute('data-event-attached')) {
        showExpBtn.setAttribute('data-event-attached', 'true');
        showExpBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          toggleExplanation(wrapper, this);
        });
      }
    });

    console.log(`[PracticeHandler] Initialized ${wrappers.length} practice blocks`);
  }

  /**
   * Inject CSS styles for practice blocks
   */
  function injectStyles() {
    // Check if styles already injected
    if (document.getElementById('practice-handler-styles')) {
      return;
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'practice-handler-styles';
    styleElement.textContent = `
      .${PRACTICE_WRAPPER_CLASS} {
        margin: 1rem 0;
        border-radius: 0.375rem;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        background: white;
        position: relative;
      }
      
      .${PRACTICE_DELETE_CLASS} {
        background: none;
        border: none;
        color: #ef4444;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        opacity: 0;
        visibility: hidden;
      }
      
      .${PRACTICE_WRAPPER_CLASS}:hover .${PRACTICE_DELETE_CLASS} {
        opacity: 1;
        visibility: visible;
      }
      
      .${PRACTICE_DELETE_CLASS}:hover {
        background: #fee2e2;
        color: #dc2626;
      }
      
      .${RESULT_AREA_CLASS}, .${EXPLANATION_AREA_CLASS} {
        transition: opacity 0.2s ease;
      }

      /* Hide editor-only elements in read-only view */
      .${PRACTICE_DELETE_CLASS} {
        display: none !important;
      }

      [contenteditable="true"] .${PRACTICE_DELETE_CLASS} {
        display: block !important;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .${PRACTICE_WRAPPER_CLASS} {
          margin: 0.75rem 0;
        }
      }
    `;

    document.head.appendChild(styleElement);
    console.log('[PracticeHandler] Styles injected');
  }

  /**
   * Initialize all practice blocks
   */
  function init(container) {
    console.log('[PracticeHandler] Initializing...');
    
    // Remove any trash buttons that might have been saved
    removeTrashButtons(container);
    
    // Inject styles
    injectStyles();
    
    // Initialize handlers
    initializeHandlers(container);
    
    console.log('[PracticeHandler] Initialization complete');
  }

  /**
   * Reinitialize - useful when content is dynamically loaded
   */
  function reinit(container) {
    console.log('[PracticeHandler] Reinitializing...');
    
    // Remove trash buttons first
    removeTrashButtons(container);
    
    // Reinitialize handlers
    initializeHandlers(container);
  }

  /**
   * Clean up - remove event listeners and styles
   */
  function cleanup() {
    const styleElement = document.getElementById('practice-handler-styles');
    if (styleElement) {
      styleElement.remove();
    }
    console.log('[PracticeHandler] Cleaned up');
  }

  // Expose public API
  window.PracticeHandler = {
    init: init,
    reinit: reinit,
    cleanup: cleanup,
    removeTrashButtons: removeTrashButtons,
    getCleanContent: getCleanContent,
    version: '1.0.0'
  };

  // Auto-initialize on DOMContentLoaded if not already initialized
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('[PracticeHandler] Auto-initializing on DOMContentLoaded');
      init();
    });
  } else {
    init();
  }

  console.log('[PracticeHandler] Handler loaded and ready');
})();