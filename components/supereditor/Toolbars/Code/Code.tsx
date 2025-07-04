'use client';

import React, { useState, useEffect, useRef, RefObject } from 'react';
import { Code as CodeIcon, ChevronDown, Search } from 'lucide-react';
import CodeLanguage from './CodeLanguage';

// Type definitions
interface CodeData {
  code: string;
  language: string;
}

interface EditingCode {
  element: HTMLElement;
  code: string;
  language: string;
}

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (codeData: CodeData) => void;
  initialCode?: string;
  initialLanguage?: string;
  isEditing?: boolean;
}

interface CodeButtonProps {
  onClick: () => void;
}

interface Language {
  value: string;
  label: string;
}

interface CodeComponentProps {
  editorRef: RefObject<HTMLElement>;
  setEditingCode: (editingCode: EditingCode | null) => void;
  setShowCodeModal: (show: boolean) => void;
  handleChange: () => void;
}

// Initialize languages at the module level
const { languages, registerLanguages, getLanguageLabel, hljs } = CodeLanguage;
registerLanguages();

const CODE_WRAPPER_CLASS = 'cte-code-wrapper';
const CODE_BLOCK_CLASS = 'cte-code-block';
const LANGUAGE_SELECT_CLASS = 'cte-language-select';
const CODE_CONTENT_CLASS = 'cte-code-content';
const COLLAPSE_BUTTON_CLASS = 'cte-collapse-button';

const CodeModal: React.FC<CodeModalProps> = ({ 
  isOpen, 
  onClose, 
  onInsert, 
  initialCode = '', 
  initialLanguage = 'javascript', 
  isEditing = false 
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [language, setLanguage] = useState<string>(initialLanguage);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Set initial values when props change
  useEffect(() => {
    if (isOpen) {
      setCode(initialCode);
      setLanguage(initialLanguage || 'javascript');
    }
  }, [isOpen, initialCode, initialLanguage]);

  // Filter languages based on search query
  const filteredLanguages: Language[] = languages.filter((lang: Language) => 
    lang.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    }
  }, [dropdownOpen]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!dropdownOpen) {
      setSearchQuery('');
    }
  }, [dropdownOpen]);

  if (!isOpen) return null;

  const handleInsert = (e?: React.MouseEvent): void => {
    if (e) e.preventDefault();
    if (code.trim()) {
      onInsert({ code, language });
      if (!isEditing) {
        setCode('');
        setLanguage('javascript');
      }
    }
  };

  const handleClose = (e?: React.MouseEvent): void => {
    if (e) e.preventDefault();
    onClose();
  };

  const handleDropdownToggle = (e: React.MouseEvent): void => {
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
  };

  const handleLanguageSelect = (e: React.MouseEvent, langValue: string): void => {
    e.preventDefault();
    setLanguage(langValue);
    setDropdownOpen(false);
  };

  const handleSearchInputClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setCode(e.target.value);
  };

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
      <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-w-full tw-max-w-2xl tw-max-h-[90vh] tw-overflow-auto">
        <h2 className="tw-text-purple-700 tw-text-xl tw-font-bold tw-mb-4">
          {isEditing ? 'Edit Code' : 'Insert Code'}
        </h2>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="tw-mb-4 tw-relative" ref={dropdownRef}>
            <div className="tw-mb-2 tw-font-medium tw-text-purple-700">Language</div>
            <div 
              className="tw-border tw-border-purple-300 tw-rounded tw-p-2 tw-flex tw-justify-between tw-items-center tw-cursor-pointer tw-bg-white"
              onClick={handleDropdownToggle}
            >
              <span>{getLanguageLabel(language)}</span>
              <ChevronDown size={16} className="tw-text-purple-700" />
            </div>
            
            {dropdownOpen && (
              <div className="tw-absolute tw-z-10 tw-w-full tw-mt-1 tw-bg-white tw-border tw-border-purple-300 tw-rounded tw-shadow-lg tw-max-h-60 tw-overflow-auto">
                {/* Search input */}
                <div className="tw-sticky tw-top-0 tw-bg-white tw-p-2 tw-border-b tw-border-purple-100">
                  <div className="tw-relative">
                    <div className="tw-absolute tw-inset-y-0 tw-left-0 tw-pl-2 tw-flex tw-items-center tw-pointer-events-none">
                      <Search size={16} className="tw-text-purple-400" />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="tw-pl-8 tw-pr-2 tw-py-1 tw-w-full tw-border tw-border-purple-200 tw-rounded tw-text-sm"
                      placeholder="Search languages..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onClick={handleSearchInputClick}
                    />
                  </div>
                </div>
                
                {/* Language options */}
                <div className="tw-max-h-40 tw-overflow-y-auto">
                  {filteredLanguages.length > 0 ? (
                    filteredLanguages.map((lang) => (
                      <div 
                        key={lang.value}
                        className="tw-p-2 tw-cursor-pointer hover:tw-bg-purple-100"
                        onClick={(e) => handleLanguageSelect(e, lang.value)}
                      >
                        {lang.label}
                      </div>
                    ))
                  ) : (
                    <div className="tw-p-2 tw-text-gray-500 tw-text-center">No languages found</div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="tw-mb-4">
            <div className="tw-mb-2 tw-font-medium tw-text-purple-700">Code</div>
            <textarea
              className="tw-w-full tw-border tw-border-purple-300 tw-rounded tw-p-2 tw-font-mono tw-h-60"
              value={code}
              onChange={handleCodeChange}
              placeholder="Paste your code here..."
            />
          </div>
          
          <div className="tw-flex tw-justify-end tw-gap-2">
            <button
              type="button"
              className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-px-4 tw-py-2"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="tw-bg-purple-600 tw-text-white tw-rounded tw-px-4 tw-py-2"
              onClick={handleInsert}
            >
              {isEditing ? 'Update' : 'Insert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CodeButton: React.FC<CodeButtonProps> = ({ onClick }) => {
  const handleClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    onClick();
  };

  return (
    <button
      type="button"
      className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors"
      onClick={handleClick}
      title="Insert Code"
    >
      <CodeIcon size={16} />
    </button>
  );
};

// Function untuk menangani animasi collapse/expand dengan smooth transition
const toggleCodeBlock = (wrapper: HTMLElement, button: HTMLButtonElement): void => {
  const codeContent = wrapper.querySelector(`.${CODE_CONTENT_CLASS}`) as HTMLElement;
  const isCollapsed = wrapper.getAttribute('data-collapsed') === 'true';
  
  if (!codeContent) return;
  
  // Menghitung tinggi konten untuk animasi
  const contentHeight = codeContent.scrollHeight;
  
  if (isCollapsed) {
    // Expand animation
    wrapper.setAttribute('data-collapsed', 'false');
    
    // Set height dari 0 ke tinggi sebenarnya
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
    button.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>';
    button.title = 'Expand code';
    
    // Clean up after animation
    setTimeout(() => {
      if (wrapper.getAttribute('data-collapsed') === 'true') {
        codeContent.style.transition = '';
        codeContent.style.overflow = '';
      }
    }, 300);
  }
};

const setupCodeBlockHandlers = (
  editorRef: RefObject<HTMLElement>, 
  setEditingCode: (editingCode: EditingCode | null) => void, 
  setShowCodeModal: (show: boolean) => void
): void => {
  if (!editorRef.current) return;

  const codeBlocks = editorRef.current.querySelectorAll(`.${CODE_BLOCK_CLASS}`);
  
  codeBlocks.forEach(codeBlock => {
    if (!codeBlock.hasAttribute('data-event-attached')) {
      codeBlock.setAttribute('data-event-attached', 'true');
      
      codeBlock.addEventListener('dblclick', (e) => {
        e.preventDefault();
        const wrapper = codeBlock.closest(`.${CODE_WRAPPER_CLASS}`) as HTMLElement;
        if (wrapper) {
          const language = wrapper.getAttribute('data-language') || 'javascript';
          const code = codeBlock.textContent || '';
          
          setEditingCode({
            element: wrapper,
            code: code,
            language: language
          });
          
          setShowCodeModal(true);
        }
      });
    }
  });

  // Setup collapse button handlers dengan animasi smooth
  const collapseButtons = editorRef.current.querySelectorAll(`.${COLLAPSE_BUTTON_CLASS}`);
  
  collapseButtons.forEach(button => {
    if (!button.hasAttribute('data-collapse-attached')) {
      button.setAttribute('data-collapse-attached', 'true');
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const wrapper = button.closest(`.${CODE_WRAPPER_CLASS}`) as HTMLElement;
        if (wrapper) {
          toggleCodeBlock(wrapper, button as HTMLButtonElement);
        }
      });
    }
  });
};

// Helper function to ensure proper highlighting
const applyHighlighting = (codeElement: HTMLElement): void => {
  if (!codeElement) return;
  
  try {
    // First ensure it's the raw text before applying highlighting
    const codeContent = codeElement.textContent || '';
    const language = codeElement.className.replace(CODE_BLOCK_CLASS, '').replace('language-', '').trim();
    
    // Apply highlighting
    hljs.highlightElement(codeElement);
    
    // Check if highlighting was applied properly
    if (!codeElement.querySelector('span')) {
      // If no spans were created, manually create a pre-highlighted version and replace
      const tempDiv = document.createElement('div');
      const tempCode = document.createElement('code');
      tempCode.className = `${CODE_BLOCK_CLASS} language-${language}`;
      tempCode.textContent = codeContent;
      tempDiv.appendChild(tempCode);
      
      hljs.highlightElement(tempCode);
      
      // Only replace if highlighting was successful (contains spans)
      if (tempCode.querySelector('span')) {
        codeElement.innerHTML = tempCode.innerHTML;
      }
    }
  } catch (error) {
    console.error('Error applying code highlighting:', error);
  }
};

const handleCodeInsertion = (
  codeData: CodeData, 
  editorRef: RefObject<HTMLElement>, 
  setShowCodeModal: (show: boolean) => void, 
  handleChange: () => void
): boolean => {
  if (!editorRef.current) return false;
  
  const { code, language } = codeData;
  
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return false;
  
  const range = sel.getRangeAt(0);
  
  // Create the code wrapper
  const wrapper = document.createElement('div');
  wrapper.className = CODE_WRAPPER_CLASS;
  wrapper.setAttribute('data-language', language);
  wrapper.setAttribute('data-collapsed', 'false');
  
  // Create header with language label and collapse button
  const header = document.createElement('div');
  header.className = LANGUAGE_SELECT_CLASS;
  
  const languageLabel = document.createElement('span');
  languageLabel.textContent = getLanguageLabel(language);
  
  const collapseButton = document.createElement('button');
  collapseButton.type = 'button';
  collapseButton.className = COLLAPSE_BUTTON_CLASS;
  collapseButton.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
  collapseButton.title = 'Collapse code';
  collapseButton.setAttribute('contenteditable', 'false');
  
  header.appendChild(languageLabel);
  header.appendChild(collapseButton);
  
  // Create code content wrapper
  const codeContentWrapper = document.createElement('div');
  codeContentWrapper.className = CODE_CONTENT_CLASS;
  
  const pre = document.createElement('pre');
  const codeElement = document.createElement('code');
  codeElement.className = `${CODE_BLOCK_CLASS} language-${language}`;
  codeElement.textContent = code;
  
  pre.appendChild(codeElement);
  codeContentWrapper.appendChild(pre);
  
  wrapper.appendChild(header);
  wrapper.appendChild(codeContentWrapper);
  
  // Insert the code block
  range.deleteContents();
  range.insertNode(wrapper);
  
  // Create a new paragraph after the code block with proper content
  const newParagraph = document.createElement('p');
  // Add a zero-width space to ensure the paragraph has content and can receive cursor
  newParagraph.innerHTML = '&nbsp;';
  
  // Insert the paragraph right after the code wrapper
  const parentNode = wrapper.parentNode;
  if (parentNode) {
    if (wrapper.nextSibling) {
      parentNode.insertBefore(newParagraph, wrapper.nextSibling);
    } else {
      parentNode.appendChild(newParagraph);
    }
  }
  
  // Apply highlighting to the code
  applyHighlighting(codeElement);
  
  // If no highlighting was applied, try again after a short delay
  setTimeout(() => {
    if (!codeElement.querySelector('span')) {
      applyHighlighting(codeElement);
    }
  }, 50);
  
  setShowCodeModal(false);
  handleChange();
  
  // Set cursor position in the new paragraph after everything is rendered
  setTimeout(() => {
    try {
      const newRange = document.createRange();
      const sel = window.getSelection();
      
      if (sel) {
        // Place cursor at the beginning of the new paragraph
        newRange.setStart(newParagraph, 0);
        newRange.collapse(true);
        
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
      
      // Focus the editor
      if (editorRef.current) {
        editorRef.current.focus();
      }
    } catch (error) {
      console.error('Error setting cursor position:', error);
      // Fallback: just focus the editor
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }
  }, 100);
  
  return true;
};

const updateCodeBlock = (
  codeData: CodeData, 
  editingCode: EditingCode | null, 
  editorRef: RefObject<HTMLElement>, 
  setShowCodeModal: (show: boolean) => void, 
  setEditingCode: (editingCode: EditingCode | null) => void, 
  handleChange: () => void
): boolean => {
  if (!editingCode || !editingCode.element || !editorRef.current) return false;
  
  const { code, language } = codeData;
  const codeElement = editingCode.element;
  
  codeElement.setAttribute('data-language', language);
  
  const languageLabel = codeElement.querySelector(`.${LANGUAGE_SELECT_CLASS} span`);
  if (languageLabel) {
    languageLabel.textContent = getLanguageLabel(language);
  }
  
  const codeBlock = codeElement.querySelector(`.${CODE_BLOCK_CLASS}`) as HTMLElement;
  if (codeBlock) {
    codeBlock.className = `${CODE_BLOCK_CLASS} language-${language}`;
    codeBlock.textContent = code;
    
    // Enhanced highlighting with retry mechanism
    applyHighlighting(codeBlock);
    
    // If no highlighting was applied, try again after a short delay
    setTimeout(() => {
      if (!codeBlock.querySelector('span')) {
        applyHighlighting(codeBlock);
      }
    }, 50);
  }
  
  setShowCodeModal(false);
  setEditingCode(null);
  handleChange();
  
  // Focus back to editor after editing
  setTimeout(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, 100);
  
  return true;
};

// Add a new function to refresh all code block highlighting
const refreshAllCodeBlockHighlighting = (editorRef: RefObject<HTMLElement>): void => {
  if (!editorRef.current) return;
  
  const codeBlocks = editorRef.current.querySelectorAll(`.${CODE_BLOCK_CLASS}`);
  codeBlocks.forEach(codeBlock => {
    applyHighlighting(codeBlock as HTMLElement);
  });
};

const getCodeStyles = (): string => `
  .${CODE_WRAPPER_CLASS} {
    margin: 1rem 0;
    border-radius: 0.375rem;
    overflow: hidden;
    border: 1px solid #e9d5ff;
    display: block;
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
  }
  
  .${COLLAPSE_BUTTON_CLASS}:hover {
    background-color: rgba(126, 34, 206, 0.1);
    transform: scale(1.1);
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
  
  /* Ensure paragraphs after code blocks have proper spacing */
  .${CODE_WRAPPER_CLASS} + p {
    margin-top: 1rem;
  }
  
  /* Enhanced collapsed state dengan smooth animation */
  .${CODE_WRAPPER_CLASS}[data-collapsed="true"] .${CODE_CONTENT_CLASS} {
    height: 0;
    opacity: 0;
    overflow: hidden;
  }
  
  /* Hover effect untuk code wrapper */
  .${CODE_WRAPPER_CLASS}:hover {
    border-color: #c4b5fd;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Smooth transition untuk border dan shadow */
  .${CODE_WRAPPER_CLASS} {
    transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

export const Button = CodeButton;   // ⬅️ tambahkan
export const Modal  = CodeModal;    // ⬅️ tambahkan
// Export sebagai default object dengan semua utilities
const Code = {
  Button: CodeButton,
  Modal: CodeModal,
  setupCodeBlockHandlers,
  handleCodeInsertion,
  updateCodeBlock,
  refreshAllCodeBlockHighlighting,
  getCodeStyles
};

export default Code;
export { 
  CodeButton, 
  CodeModal, 
  setupCodeBlockHandlers, 
  handleCodeInsertion, 
  updateCodeBlock, 
  refreshAllCodeBlockHighlighting, 
  getCodeStyles 
}