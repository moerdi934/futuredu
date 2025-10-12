// public/PracticeHandler.js
/**
 * Practice Question Handler
 * Handles interactive functionality for practice questions including answer checking,
 * showing explanations, and delete buttons in editor mode.
 * 
 * Usage:
 * 1. Include this script in your HTML: <script src="/PracticeHandler.js"></script>
 * 2. Call window.PracticeHandler.init() after content is loaded
 * 3. Practice questions must have class 'cte-practice-question-block'
 * 4. Call window.PracticeHandler.removeDeleteButtons() before saving to database
 */

(function() {
  'use strict';

  // Class names (must match with Practice.tsx)
  const PRACTICE_BLOCK_CLASS = 'cte-practice-question-block';
  const CHECK_ANSWER_BTN_CLASS = 'check-answer-btn';
  const SHOW_EXPLANATION_BTN_CLASS = 'show-explanation-btn';
  const RESULT_AREA_CLASS = 'result-area';
  const RESULT_CONTENT_CLASS = 'result-content';
  const EXPLANATION_AREA_CLASS = 'explanation-area';
  const EXPLANATION_CONTENT_CLASS = 'explanation-content';
  const DELETE_BTN_CLASS = 'practice-delete-btn';

  /**
   * Client-side answer comparison function
   * Compares user's answer with correct answer based on question type
   */
  function isAnswerCorrect(userAnswer, correctAnswer, questionType) {
    // Handle null or undefined userAnswer
    if (userAnswer === null || userAnswer === undefined) {
      return false;
    }

    try {
      switch (questionType) {
        case 'single-choice':
          // For single-choice, compare strings (case-insensitive)
          let correctSingleAnswer = Array.isArray(correctAnswer) 
            ? correctAnswer[0] 
            : correctAnswer;
          return String(userAnswer).trim().toLowerCase() === String(correctSingleAnswer).trim().toLowerCase();
          
        case 'multiple-choice':
          // Ensure we have arrays to compare
          const userMultipleAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
          let correctMultipleAnswers = Array.isArray(correctAnswer) 
            ? correctAnswer 
            : [correctAnswer];
          
          // If lengths differ, they can't be equal
          if (userMultipleAnswers.length !== correctMultipleAnswers.length) {
            return false;
          }
          
          // Sort both arrays to ignore order
          const sortedUserAnswers = [...userMultipleAnswers].map(val => String(val).trim().toLowerCase()).sort();
          const sortedCorrectAnswers = [...correctMultipleAnswers].map(val => String(val).trim().toLowerCase()).sort();
          
          // Compare each element
          for (let i = 0; i < sortedUserAnswers.length; i++) {
            if (sortedUserAnswers[i] !== sortedCorrectAnswers[i]) {
              return false;
            }
          }
          return true;
          
        case 'true-false':
          // For true-false, compare booleans and maintain order
          const userTrueFalse = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
          let correctTrueFalse = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
          
          // Convert correct answers to booleans (handles both "true"/"false" strings and true/false booleans)
          correctTrueFalse = correctTrueFalse.map((val) => val === true || val === 'true');
          // Convert user answers to booleans (handles both "true"/"false" strings and true/false booleans)
          const convertedUserTrueFalse = userTrueFalse.map((val) => val === true || val === 'true');
          
          // If user provided fewer answers than expected, it's incorrect
          if (convertedUserTrueFalse.length < correctTrueFalse.length) {
            return false;
          }
          
          // For true-false, order matters - verify each position matches
          for (let i = 0; i < correctTrueFalse.length; i++) {
            if (convertedUserTrueFalse[i] !== correctTrueFalse[i]) {
              return false;
            }
          }
          return true;
          
        case 'number':
          // For number, compare as numbers
          let correctNumber = Array.isArray(correctAnswer) 
            ? correctAnswer[0] 
            : correctAnswer;
            
          // Convert both to numbers, handle empty string or invalid input
          const userNum = userAnswer === '' ? NaN : Number(userAnswer);
          const correctNum = String(correctNumber).trim() === '' ? NaN : Number(correctNumber);
          
          // Handle NaN comparison (empty input or invalid number)
          if (isNaN(userNum) || isNaN(correctNum)) {
            return false;
          }
          
          return userNum === correctNum;
          
        case 'text':
          // For text, compare as trimmed, case-insensitive strings
          let correctText = Array.isArray(correctAnswer) 
            ? correctAnswer[0] 
            : correctAnswer;
            
          // Compare trimmed strings case-insensitively
          return String(userAnswer).trim().toLowerCase() === String(correctText).trim().toLowerCase();
          
        default:
          // For any other type, do string comparison
          return String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
      }
    } catch (error) {
      console.error('Error comparing answers:', error);
      return false; // Default to incorrect if there's an error
    }
  }

  /**
   * Get display string for correct answer
   */
  function getCorrectAnswerDisplay(correctAnswer, questionType) {
    if (!correctAnswer) return '';
    
    switch (questionType) {
      case 'single-choice':
        return Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
      case 'multiple-choice':
        return Array.isArray(correctAnswer) 
          ? correctAnswer.join(', ') 
          : correctAnswer;
      case 'true-false':
        if (Array.isArray(correctAnswer)) {
          return correctAnswer.map((val, idx) => 
            `${idx + 1}. ${val === 'true' || val === true ? 'Benar' : 'Salah'}`
          ).join(', ') || '';
        }
        return '';
      case 'text':
      case 'number':
        return Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
      default:
        return String(correctAnswer);
    }
  }

  /**
   * Get display string for user's answer
   */
  function getUserAnswerDisplay(userAnswer, questionType) {
    if (userAnswer === null || userAnswer === undefined || userAnswer === '') return 'No answer provided';
    
    switch (questionType) {
      case 'single-choice':
        return userAnswer;
      case 'multiple-choice':
        return Array.isArray(userAnswer) 
          ? userAnswer.join(', ') 
          : userAnswer;
      case 'true-false':
        if (Array.isArray(userAnswer)) {
          return userAnswer.map((val, idx) => 
            `${idx + 1}. ${val === true || val === 'true' ? 'Benar' : 'Salah'}`
          ).join(', ') || '';
        }
        return '';
      case 'text':
      case 'number':
        return String(userAnswer);
      default:
        return String(userAnswer);
    }
  }

  /**
   * Remove all delete buttons from practice blocks
   * Should be called before saving content to database
   */
  function removeDeleteButtons(container) {
    if (!container) {
      container = document;
    }

    const deleteBtns = container.querySelectorAll(`.${DELETE_BTN_CLASS}`);
    let removedCount = 0;

    deleteBtns.forEach(btn => {
      btn.remove();
      removedCount++;
    });

    console.log(`[PracticeHandler] Removed ${removedCount} delete button(s)`);
    return removedCount;
  }

  /**
   * Get clean HTML content without delete buttons
   * Useful for getting content before saving to database
   */
  function getCleanContent(container) {
    if (!container) {
      console.error('[PracticeHandler] Container is required for getCleanContent');
      return '';
    }

    // Clone the container to avoid modifying the original
    const clone = container.cloneNode(true);
    
    // Remove all delete buttons from the clone
    const deleteBtns = clone.querySelectorAll(`.${DELETE_BTN_CLASS}`);
    deleteBtns.forEach(btn => btn.remove());

    return clone.innerHTML;
  }

  /**
   * Delete a practice question block
   */
  function deletePracticeQuestion(block) {
    try {
      if (!confirm('Are you sure you want to delete this practice question?')) {
        return;
      }

      // Create a paragraph to replace the practice block
      const newParagraph = document.createElement('p');
      newParagraph.innerHTML = '<br>';
      
      // Replace practice block with paragraph
      if (block.parentNode) {
        block.parentNode.replaceChild(newParagraph, block);
        
        // Set cursor to the new paragraph
        setTimeout(() => {
          const range = document.createRange();
          const sel = window.getSelection();
          
          if (sel && newParagraph) {
            range.setStart(newParagraph, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }, 0);
      }
    } catch (error) {
      console.error('Error deleting practice question:', error);
    }
  }

  /**
   * Setup event listeners for a single practice block
   */
  function setupBlockHandlers(block) {
    // Option clicks for single/multiple choice
    const options = block.querySelectorAll('.practice-option');
    options.forEach((opt) => {
      // Remove existing listeners to prevent duplicates
      const newOpt = opt.cloneNode(true);
      opt.parentNode.replaceChild(newOpt, opt);
      
      newOpt.addEventListener('click', () => {
        const input = newOpt.querySelector('input');
        if (!input) return;

        const type = newOpt.getAttribute('data-type');
        if (type === 'single') {
          // Uncheck all other radios in the block
          block.querySelectorAll('input[type="radio"]').forEach((i) => {
            i.checked = false;
          });
          input.checked = true;
        } else if (type === 'multiple') {
          input.checked = !input.checked;
        }
      });
    });

    // Check answer button
    const checkBtn = block.querySelector(`.${CHECK_ANSWER_BTN_CLASS}`);
    if (checkBtn) {
      // Clone to remove existing listeners
      const newCheckBtn = checkBtn.cloneNode(true);
      checkBtn.parentNode.replaceChild(newCheckBtn, checkBtn);
      
      newCheckBtn.addEventListener('click', () => {
        const type = block.getAttribute('data-question-type');
        let userAnswer = null;
        let inputExists = false;

        switch (type) {
          case 'single-choice':
            userAnswer = block.querySelector('input[type="radio"]:checked')?.value || null;
            inputExists = !!block.querySelector('input[type="radio"]');
            break;
          case 'multiple-choice':
            userAnswer = Array.from(block.querySelectorAll('input[type="checkbox"]:checked')).map((i) => i.value);
            inputExists = !!block.querySelector('input[type="checkbox"]');
            break;
          case 'true-false':
            const answers = [];
            const rows = block.querySelectorAll('tbody tr');
            rows.forEach((row) => {
              const checked = row.querySelector('input[type="radio"]:checked');
              if (checked) {
                answers.push(checked.value === 'true');
              } else {
                answers.push(false); // Default to false if not answered
              }
            });
            userAnswer = answers;
            inputExists = !!block.querySelector('input[type="radio"]');
            break;
          case 'text':
            const textInput = block.querySelector('.practice-text-input');
            userAnswer = textInput?.value.trim();
            inputExists = !!textInput;
            break;
          case 'number':
            const numberInput = block.querySelector('.practice-number-input');
            userAnswer = numberInput?.value.trim();
            inputExists = !!numberInput;
            break;
        }

        // Validate input for text and number types
        if (!inputExists) {
          alert('No input field available. Please check the question setup.');
          return;
        }

        if ((type === 'text' || type === 'number') && (userAnswer === '' || userAnswer === null)) {
          alert('Please provide an answer first.');
          return;
        }

        if ((type === 'single-choice' || type === 'multiple-choice' || type === 'true-false') && 
            (userAnswer === null || (Array.isArray(userAnswer) && userAnswer.length === 0))) {
          alert('Please select an answer first.');
          return;
        }

        const encodedCorrect = block.getAttribute('data-correct-answer') || '';
        const correctAnswer = JSON.parse(decodeURIComponent(encodedCorrect));

        const isCorrect = isAnswerCorrect(userAnswer, correctAnswer, type || '');

        const resultContent = block.querySelector(`.${RESULT_CONTENT_CLASS}`);
        if (resultContent) {
          if (isCorrect) {
            resultContent.innerHTML = '<span class="tw-text-green-600 tw-font-bold">Benar!</span>';
          } else {
            const userDisplay = getUserAnswerDisplay(userAnswer, type || '');
            const correctDisplay = getCorrectAnswerDisplay(correctAnswer, type || '');
            resultContent.innerHTML = '<span class="tw-text-red-600 tw-font-bold">Salah.</span> Jawaban kamu = ' + userDisplay + '. Jawaban benar: ' + correctDisplay;
          }
        }

        const resultArea = block.querySelector(`.${RESULT_AREA_CLASS}`);
        if (resultArea) {
          resultArea.classList.remove('tw-hidden');
        }

        const showExpBtn = block.querySelector(`.${SHOW_EXPLANATION_BTN_CLASS}`);
        if (showExpBtn) {
          showExpBtn.classList.remove('tw-hidden');
        }
      });
    }

    // Show explanation button
    const showExpBtn = block.querySelector(`.${SHOW_EXPLANATION_BTN_CLASS}`);
    if (showExpBtn) {
      // Clone to remove existing listeners
      const newShowExpBtn = showExpBtn.cloneNode(true);
      showExpBtn.parentNode.replaceChild(newShowExpBtn, showExpBtn);
      
      newShowExpBtn.addEventListener('click', () => {
        const encodedExp = block.getAttribute('data-explanation') || '';
        const exp = decodeURIComponent(encodedExp);

        const expContent = block.querySelector(`.${EXPLANATION_CONTENT_CLASS}`);
        if (expContent) {
          // Basic sanitization (you may want to use DOMPurify if available)
          expContent.innerHTML = exp.replace(/<script.*?<\/script>/gi, '');
        }

        const expArea = block.querySelector(`.${EXPLANATION_AREA_CLASS}`);
        if (expArea) {
          expArea.classList.remove('tw-hidden');
        }

        // Optionally hide the button after showing
        newShowExpBtn.classList.add('tw-hidden');
      });
    }

    // Delete button (only in editor mode)
    const deleteBtn = block.querySelector(`.${DELETE_BTN_CLASS}`);
    if (deleteBtn) {
      // Clone to remove existing listeners
      const newDeleteBtn = deleteBtn.cloneNode(true);
      deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
      
      newDeleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        deletePracticeQuestion(block);
      });
    }
  }

  /**
   * Initialize handlers for all practice question blocks in the given container
   */
  function initializeHandlers(container) {
    if (!container) {
      container = document;
    }

    const blocks = container.querySelectorAll(`.${PRACTICE_BLOCK_CLASS}`);
    
    blocks.forEach((block) => {
      setupBlockHandlers(block);
    });

    console.log(`[PracticeHandler] Initialized handlers for ${blocks.length} practice question(s)`);
  }

  /**
   * Inject CSS styles if needed (optional, since styles are in getPracticeQuestionStyles)
   */
  function injectStyles() {
    // Check if styles already injected
    if (document.getElementById('practice-handler-styles')) {
      return;
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'practice-handler-styles';
    styleElement.textContent = `
      /* Add any additional runtime styles here if needed */
      .${PRACTICE_BLOCK_CLASS} {
        /* Ensure delete button is hidden by default */
      }

      body:not(.editor-mode) .${DELETE_BTN_CLASS},
      :not([contenteditable="true"]) .${DELETE_BTN_CLASS} {
        display: none !important;
      }
    `;

    document.head.appendChild(styleElement);
    console.log('[PracticeHandler] Styles injected');
  }

  /**
   * Initialize all practice questions
   */
  function init(container) {
    console.log('[PracticeHandler] Initializing...');
    
    // First, remove any delete buttons that might have been saved
    removeDeleteButtons(container);
    
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
    
    // Remove delete buttons first
    removeDeleteButtons(container);
    
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
    removeDeleteButtons: removeDeleteButtons,
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
    // DOM already loaded
    console.log('[PracticeHandler] DOM already loaded, initializing immediately');
    init();
  }

  console.log('[PracticeHandler] Handler loaded and ready');
})();