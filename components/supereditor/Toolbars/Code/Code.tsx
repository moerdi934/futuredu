// components/supereditor/Toolbars/Code/Code.tsx
'use client';

import React, { useState, useEffect, useRef, RefObject } from 'react';
import { Code as CodeIcon, ChevronDown, Search, BookOpen, Trash2 } from 'lucide-react';
import { LearningModal } from '../../../modal/ModalTemplate';
import { ButtonGradient } from '../../../button/ButtonTemplate';
import { ShortFormField, SelectCustomField, WideFormField } from '../../../form/FormComponentLayout';
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
const CODE_FLOATER_CLASS = 'cte-code-floater';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Set initial values when props change
  useEffect(() => {
    if (isOpen) {
      setCode(initialCode);
      setLanguage(initialLanguage || 'javascript');
      setSearchQuery('');
    }
  }, [isOpen, initialCode, initialLanguage]);

  // Convert languages to SelectOption format
  const languageOptions = languages.map(lang => ({
    label: lang.label,
    value: lang.value
  }));

  // Filter languages based on search query
  const filteredLanguageOptions = languageOptions.filter(lang => 
    lang.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInsert = async (): Promise<void> => {
    if (code.trim()) {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
        onInsert({ code, language });
        if (!isEditing) {
          setCode('');
          setLanguage('javascript');
        }
        onClose();
      } catch (error) {
        console.error('Error inserting code:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClear = (): void => {
    setCode('');
    setLanguage('javascript');
    setSearchQuery('');
  };

  const handleLanguageChange = (selectedOption: any): void => {
    if (selectedOption) {
      setLanguage(selectedOption.value);
    }
  };

  const selectedLanguageOption = languageOptions.find(lang => lang.value === language) || null;

  const modalButtons = [
    {
      action: 'cancel' as const,
      text: 'Cancel',
      onClick: onClose,
      disabled: loading
    },
    {
      action: 'save' as const,
      text: isEditing ? 'Update Code' : 'Insert Code',
      onClick: handleInsert,
      disabled: !code.trim() || loading,
      loading: loading
    }
  ];

  const topButtons = [
    {
      action: 'clear' as const,
      text: 'Clear All',
      onClick: handleClear,
      disabled: loading
    }
  ];

  return (
    <LearningModal
      show={isOpen}
      onHide={onClose}
      title={isEditing ? 'Edit Code Block' : 'Insert Code Block'}
      subtitle="Add syntax-highlighted code to your content"
      icon={<BookOpen className="tw-w-5 tw-h-5" />}
      size="xl"
      width="90vw"
      height="85vh"
      topButtons={topButtons}
      bottomButtons={modalButtons}
      showCloseButton={true}
      preventCloseOnOutsideClick={loading}
    >
      <div className="tw-space-y-6">
        {/* Language Selection */}
        <div className="tw-bg-white tw-rounded-xl tw-p-6 tw-shadow-sm tw-border tw-border-purple-100">
          <h3 className="tw-text-lg tw-font-semibold tw-text-purple-700 tw-mb-4 tw-flex tw-items-center tw-gap-2">
            <CodeIcon className="tw-w-5 tw-h-5" />
            Programming Language
          </h3>
          
          <SelectCustomField
            label="Select Language"
            value={selectedLanguageOption}
            options={filteredLanguageOptions}
            onChange={handleLanguageChange}
            placeholder="Choose a programming language..."
            loading={loading}
          />
          
          <div className="tw-mt-3 tw-text-sm tw-text-purple-600">
            <span className="tw-font-medium">Selected:</span> {getLanguageLabel(language)}
          </div>
        </div>

        {/* Code Input */}
        <div className="tw-bg-white tw-rounded-xl tw-p-6 tw-shadow-sm tw-border tw-border-purple-100">
          <h3 className="tw-text-lg tw-font-semibold tw-text-purple-700 tw-mb-4">
            Code Content
          </h3>
          
          <div className="tw-space-y-4">
            <div className="tw-relative">
              <textarea
                className="tw-w-full tw-h-80 tw-border-2 tw-border-purple-200 tw-rounded-xl tw-p-4 tw-font-mono tw-text-sm tw-bg-gray-50 focus:tw-bg-white focus:tw-border-purple-400 tw-transition-all tw-duration-200 tw-resize-none"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`Enter your ${getLanguageLabel(language)} code here...

Example:
function hello() {
    console.log("Hello, World!");
}

hello();`}
                disabled={loading}
                style={{
                  fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                  fontSize: '14px',
                  lineHeight: '1.5',
                  tabSize: 2
                }}
              />
              
              {/* Character count */}
              <div className="tw-absolute tw-bottom-2 tw-right-2 tw-bg-white tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-text-gray-500 tw-border">
                {code.length} characters
              </div>
            </div>

            {/* Code preview */}
            {code.trim() && (
              <div className="tw-border-2 tw-border-purple-200 tw-rounded-xl tw-overflow-hidden">
                <div className="tw-bg-purple-100 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-purple-700 tw-border-b tw-border-purple-200">
                  Preview - {getLanguageLabel(language)}
                </div>
                <div className="tw-bg-gray-50 tw-p-4 tw-max-h-40 tw-overflow-auto">
                  <pre className="tw-text-sm tw-font-mono tw-text-gray-800 tw-whitespace-pre-wrap tw-break-words">
                    {code}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="tw-bg-gradient-to-r tw-from-blue-50 tw-to-purple-50 tw-rounded-xl tw-p-6 tw-border tw-border-blue-200">
          <h3 className="tw-text-lg tw-font-semibold tw-text-blue-700 tw-mb-3">
            💡 Tips for Better Code Blocks
          </h3>
          <ul className="tw-space-y-2 tw-text-sm tw-text-blue-600">
            <li className="tw-flex tw-items-start tw-gap-2">
              <span className="tw-text-blue-500 tw-font-bold">•</span>
              Choose the correct language for proper syntax highlighting
            </li>
            <li className="tw-flex tw-items-start tw-gap-2">
              <span className="tw-text-blue-500 tw-font-bold">•</span>
              Include comments to explain complex logic
            </li>
            <li className="tw-flex tw-items-start tw-gap-2">
              <span className="tw-text-blue-500 tw-font-bold">•</span>
              Double-click any code block to edit it later
            </li>
            <li className="tw-flex tw-items-start tw-gap-2">
              <span className="tw-text-blue-500 tw-font-bold">•</span>
              Use meaningful variable names for better readability
            </li>
          </ul>
        </div>
      </div>
    </LearningModal>
  );
};

const CodeButton: React.FC<CodeButtonProps> = ({ onClick }) => {
  return (
    <ButtonGradient
      action="custom"
      showText={false}
      customIcon={<CodeIcon className="tw-w-4 tw-h-4" />}
      onClick={() => onClick()}
      size="sm"
      customColors={{
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        gradient1: '#8B5CF6',
        gradient2: '#A855F7',
        text: '#FFFFFF'
      }}
      tooltip="Insert Code Block (Ctrl+Shift+C)"
      tooltipPosition="top"
      tooltipPortal={false}
      className="tw-w-8 tw-h-8 tw-relative"
    />
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
    button.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
    button.title = 'Collapse code';
  }
};

// Function to create code floater with delete button
const createCodeFloater = (wrapper: HTMLElement, handleChange: () => void): HTMLElement => {
  // Check if floater already exists
  let existingFloater = wrapper.querySelector(`.${CODE_FLOATER_CLASS}`) as HTMLElement;
  if (existingFloater) {
    return existingFloater;
  }

  const floater = document.createElement('div');
  floater.className = CODE_FLOATER_CLASS;
  floater.contentEditable = 'false';
  floater.setAttribute('contenteditable', 'false');

  // Create delete button
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'cte-code-delete-btn';
  deleteButton.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
    </svg>
  `;
  deleteButton.title = 'Delete code block';
  deleteButton.setAttribute('aria-label', 'Delete code block');

  deleteButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this code block?')) {
      deleteCodeBlock(wrapper, handleChange);
    }
  });

  floater.appendChild(deleteButton);
  wrapper.appendChild(floater);

  return floater;
};

// Function to delete code block
const deleteCodeBlock = (wrapper: HTMLElement, handleChange: () => void): void => {
  try {
    // Create a paragraph to replace the code block
    const newParagraph = document.createElement('p');
    newParagraph.innerHTML = '<br>';
    
    // Replace code wrapper with paragraph
    if (wrapper.parentNode) {
      wrapper.parentNode.replaceChild(newParagraph, wrapper);
      
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
      
      // Trigger change
      handleChange();
    }
  } catch (error) {
    console.error('Error deleting code block:', error);
  }
};

// Function to show/hide floater based on hover
const showCodeFloater = (wrapper: HTMLElement): void => {
  const floater = wrapper.querySelector(`.${CODE_FLOATER_CLASS}`) as HTMLElement;
  if (floater) {
    floater.style.opacity = '1';
    floater.style.visibility = 'visible';
  }
};

const hideCodeFloater = (wrapper: HTMLElement): void => {
  const floater = wrapper.querySelector(`.${CODE_FLOATER_CLASS}`) as HTMLElement;
  if (floater) {
    floater.style.opacity = '0';
    floater.style.visibility = 'hidden';
  }
};

const setupCodeBlockHandlers = (
  editorRef: RefObject<HTMLElement>, 
  setEditingCode: (editingCode: EditingCode | null) => void, 
  setShowCodeModal: (show: boolean) => void,
  handleChange?: () => void
): void => {
  if (!editorRef.current) return;

  const codeWrappers = editorRef.current.querySelectorAll(`.${CODE_WRAPPER_CLASS}`);
  
  codeWrappers.forEach(wrapper => {
    const codeWrapper = wrapper as HTMLElement;
    
    // Create floater if handleChange is provided
    if (handleChange) {
      createCodeFloater(codeWrapper, handleChange);
    }

    // Setup hover handlers for floater
    if (!codeWrapper.hasAttribute('data-hover-attached')) {
      codeWrapper.setAttribute('data-hover-attached', 'true');
      
      codeWrapper.addEventListener('mouseenter', () => {
        showCodeFloater(codeWrapper);
      });
      
      codeWrapper.addEventListener('mouseleave', () => {
        hideCodeFloater(codeWrapper);
      });
    }

    // Setup double-click to edit
    const codeBlock = codeWrapper.querySelector(`.${CODE_BLOCK_CLASS}`) as HTMLElement;
    if (codeBlock && !codeBlock.hasAttribute('data-event-attached')) {
      codeBlock.setAttribute('data-event-attached', 'true');
      
      codeBlock.addEventListener('dblclick', (e) => {
        e.preventDefault();
        const language = codeWrapper.getAttribute('data-language') || 'javascript';
        const code = codeBlock.textContent || '';
        
        setEditingCode({
          element: codeWrapper,
          code: code,
          language: language
        });
        
        setShowCodeModal(true);
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
  
  // Create floater
  createCodeFloater(wrapper, handleChange);
  
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
    position: relative;
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

  /* Code Floater Styles */
  .${CODE_FLOATER_CLASS} {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
    z-index: 10;
    pointer-events: auto;
  }

  .${CODE_WRAPPER_CLASS}:hover .${CODE_FLOATER_CLASS} {
    opacity: 1;
    visibility: visible;
  }

  .cte-code-delete-btn {
    background: #ef4444;
    border: none;
    border-radius: 4px;
    padding: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .cte-code-delete-btn:hover {
    background: #dc2626;
    transform: scale(1.05);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }

  .cte-code-delete-btn:active {
    transform: scale(0.95);
  }

  .cte-code-delete-btn svg {
    color: white;
    width: 16px;
    height: 16px;
  }
`;

export const Button = CodeButton;
export const Modal = CodeModal;

// Export sebagai default object dengan semua utilities
const Code = {
  Button: CodeButton,
  Modal: CodeModal,
  setupCodeBlockHandlers,
  handleCodeInsertion,
  updateCodeBlock,
  refreshAllCodeBlockHighlighting,
  getCodeStyles,
  deleteCodeBlock,
  createCodeFloater
};

export default Code;
export { 
  CodeButton, 
  CodeModal, 
  setupCodeBlockHandlers, 
  handleCodeInsertion, 
  updateCodeBlock, 
  refreshAllCodeBlockHighlighting, 
  getCodeStyles,
  deleteCodeBlock,
  createCodeFloater
};