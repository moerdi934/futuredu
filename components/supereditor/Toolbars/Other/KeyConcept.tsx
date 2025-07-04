'use client';

import React, { RefObject } from 'react';
import { Lightbulb } from 'lucide-react';

interface KeyConceptButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

interface InsertKeyConceptBlockParams {
  editorRef: RefObject<HTMLDivElement>;
  handleChange: () => void;
}

const KeyConceptButton: React.FC<KeyConceptButtonProps> = ({ onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  };

  return (
    <button 
      className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-px-2 tw-py-2 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors tw-flex tw-items-center tw-justify-center tw-h-8 tw-min-w-[32px]"
      onClick={handleClick}
      title="Insert Key Concept (Ctrl+Shift+K)"
    >
      <Lightbulb size={16} />
    </button>
  );
};

const insertKeyConceptBlock = ({ editorRef, handleChange }: InsertKeyConceptBlockParams): void => {
  if (!editorRef.current) return;

  const editor = editorRef.current;
  const selection = window.getSelection();
  
  editor.focus();
  
  const keyConceptHtml = `
    <div class="cte-key-concept-block tw-my-4 tw-relative tw-overflow-hidden">
      <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-purple-500 tw-via-purple-600 tw-to-indigo-700 tw-rounded-2xl tw-shadow-2xl"></div>
      <div class="tw-absolute tw-top-2 tw-right-2 tw-opacity-20">
        <svg class="tw-w-8 tw-h-8 tw-text-yellow-300 tw-animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      </div>
      <div class="tw-absolute tw-top-4 tw-left-4 tw-opacity-10">
        <svg class="tw-w-6 tw-h-6 tw-text-pink-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456A1 1 0 0112 18H8a1 1 0 01-.967-1.256L8.854 12.8 5.5 10.866a1 1 0 010-1.732L8.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd"/>
        </svg>
      </div>
      <div class="tw-absolute tw-bottom-2 tw-left-2 tw-opacity-15">
        <svg class="tw-w-5 tw-h-5 tw-text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
      </div>
      
      <div class="tw-relative tw-p-3 tw-z-10">
        <div class="tw-flex tw-items-center tw-justify-center tw-mb-2">
          <div class="tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-p-2 tw-mr-2 tw-shadow-lg tw-border tw-border-white/30">
            <svg class="tw-w-5 tw-h-5 tw-text-yellow-300 tw-drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h4 class="tw-text-lg tw-font-bold tw-text-white tw-m-0 tw-drop-shadow-lg tw-tracking-wide">
            ✨ Key Concept ✨
          </h4>
        </div>
        
        <div class="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-xl tw-p-3 tw-border tw-border-white/20 tw-shadow-inner">
          <div class="tw-text-white tw-leading-relaxed tw-text-center tw-font-medium cte-key-concept-content" contenteditable="true" style="min-height: 2.5rem; outline: none;">
            🌟 Enter your amazing key concept here! 🌟
          </div>
        </div>
        
        <div class="tw-flex tw-justify-center tw-mt-2 tw-space-x-2">
          <div class="tw-w-2 tw-h-2 tw-bg-yellow-300 tw-rounded-full tw-animate-bounce"></div>
          <div class="tw-w-2 tw-h-2 tw-bg-pink-300 tw-rounded-full tw-animate-bounce" style="animation-delay: 0.1s;"></div>
          <div class="tw-w-2 tw-h-2 tw-bg-blue-300 tw-rounded-full tw-animate-bounce" style="animation-delay: 0.2s;"></div>
        </div>
      </div>
    </div>
    <p><br></p>
  `;

  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = document.createElement('div');
    container.innerHTML = keyConceptHtml;
    
    range.deleteContents();
    
    const fragment = document.createDocumentFragment();
    while (container.firstChild) {
      fragment.appendChild(container.firstChild);
    }
    range.insertNode(fragment);
    
    const lastInserted = editor.querySelector('.cte-key-concept-content:last-of-type') as HTMLElement;
    if (lastInserted) {
      range.selectNodeContents(lastInserted);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  } else {
    editor.innerHTML += keyConceptHtml;
    
    setTimeout(() => {
      const lastKeyConcept = editor.querySelector('.cte-key-concept-content:last-of-type') as HTMLElement;
      if (lastKeyConcept) {
        const range = document.createRange();
        range.selectNodeContents(lastKeyConcept);
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, 10);
  }
  
  handleChange();
};

const getKeyConceptStyles = (): string => `
  .cte-key-concept-block {
    position: relative;
    margin: 1rem 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .cte-key-concept-block:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 20px 40px rgba(139, 92, 246, 0.4);
  }
  
  .cte-key-concept-content:focus {
    background-color: rgba(255, 255, 255, 0.15) !important;
    border-radius: 0.75rem;
    padding: 1rem !important;
    transform: scale(1.02);
    transition: all 0.3s ease;
  }
  
  .cte-key-concept-content:empty:before {
    content: "🌟 Enter your amazing key concept here! 🌟";
    color: rgba(255, 255, 255, 0.8);
    font-style: italic;
    font-weight: 500;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .cte-key-concept-block .tw-animate-bounce {
    animation: bounce 2s infinite;
  }
  
  @media (max-width: 768px) {
    .cte-key-concept-block {
      margin: 1rem 0;
    }
    
    .cte-key-concept-block .tw-p-6 {
      padding: 1rem;
    }
    
    .cte-key-concept-block h4 {
      font-size: 1.125rem;
    }
    
    .cte-key-concept-block .tw-text-3xl {
      font-size: 1.5rem;
    }
    
    .cte-key-concept-block .tw-text-2xl {
      font-size: 1.25rem;
    }
    
    .cte-key-concept-block .tw-text-xl {
      font-size: 1rem;
    }
  }
  
  @media (max-width: 480px) {
    .cte-key-concept-block .tw-flex {
      flex-direction: column;
      align-items: center;
    }
    
    .cte-key-concept-block .tw-mr-2 {
      margin-right: 0;
      margin-bottom: 0.5rem;
    }
    
    .cte-key-concept-block .tw-p-3 {
      padding: 0.5rem;
    }
    
    .cte-key-concept-block h4 {
      font-size: 1rem;
      text-align: center;
    }
    
    .cte-key-concept-content {
      font-size: 0.875rem;
    }
  }
  
  @media (max-width: 360px) {
    .cte-key-concept-block .tw-space-x-2 > * + * {
      margin-left: 0.25rem;
    }
    
    .cte-key-concept-block .tw-w-2 {
      width: 0.375rem;
      height: 0.375rem;
    }
  }
`;

interface KeyConceptType {
  Button: React.FC<KeyConceptButtonProps>;
  insertKeyConceptBlock: (params: InsertKeyConceptBlockParams) => void;
  getKeyConceptStyles: () => string;
}

const KeyConcept: KeyConceptType = {
  Button: KeyConceptButton,
  insertKeyConceptBlock,
  getKeyConceptStyles
};

export default KeyConcept;
export { KeyConceptButton, insertKeyConceptBlock, getKeyConceptStyles };