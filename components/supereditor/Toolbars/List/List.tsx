'use client';

import React, { useState, useRef, useEffect, RefObject } from 'react';
import { List, ListOrdered, Network } from 'lucide-react';

interface BulletStyle {
  name: string;
  value: string;
  symbol: string;
  customClass?: string;
}

interface NumberedStyle {
  name: string;
  value: string;
  sample: string;
  customClass?: string;
}

interface MultilevelStyle {
  name: string;
  levels: Array<{
    type: string;
    symbol: string;
  }>;
}

interface DropdownStates {
  fontSize: boolean;
  fontName: boolean;
  heading: boolean;
  alignment: boolean;
  bulletList: boolean;
  numberedList: boolean;
  multilevelList: boolean;
}

interface ListButtonProps {
  editorRef: RefObject<HTMLElement>;
  handleChange: () => void;
  dropdownStates: DropdownStates;
  setDropdownStates: React.Dispatch<React.SetStateAction<DropdownStates>>;
}

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (style: any) => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

// Bullet list styles
const bulletStyles: BulletStyle[] = [
  { name: 'Bulatan', value: 'disc', symbol: '●' },
  { name: 'Lingkaran', value: 'circle', symbol: '○' },
  { name: 'Kotak', value: 'square', symbol: '■' },
  { name: 'Wajik', value: 'none', symbol: '◆', customClass: 'diamond-list' },
  { name: 'Panah', value: 'none', symbol: '➤', customClass: 'arrow-list' },
  { name: 'Centang', value: 'none', symbol: '✓', customClass: 'check-list' }
];

// Numbered list styles
const numberedStyles: NumberedStyle[] = [
  { name: '1. 2. 3.', value: 'decimal', sample: '1.' },
  { name: '1) 2) 3)', value: 'none', customClass: 'paren-decimal', sample: '1)' },
  { name: 'I. II. III.', value: 'upper-roman', sample: 'I.' },
  { name: 'A. B. C.', value: 'upper-alpha', sample: 'A.' },
  { name: 'A) B) C)', value: 'none', customClass: 'paren-upper-alpha', sample: 'A)' },
  { name: 'a. b. c.', value: 'lower-alpha', sample: 'a.' },
  { name: 'i. ii. iii.', value: 'lower-roman', sample: 'i.' }
];

// Multilevel list templates
const multilevelStyles: MultilevelStyle[] = [
  {
    name: 'Standard',
    levels: [
      { type: 'decimal', symbol: '1.' },
      { type: 'lower-alpha', symbol: 'a.' },
      { type: 'lower-roman', symbol: 'i.' },
      { type: 'decimal', symbol: '1.' }
    ]
  },
  {
    name: 'Legal',
    levels: [
      { type: 'upper-roman', symbol: 'I.' },
      { type: 'upper-alpha', symbol: 'A.' },
      { type: 'decimal', symbol: '1.' },
      { type: 'lower-alpha', symbol: 'a.' }
    ]
  },
  {
    name: 'Outline',
    levels: [
      { type: 'upper-alpha', symbol: 'A.' },
      { type: 'decimal', symbol: '1.' },
      { type: 'lower-alpha', symbol: 'a.' },
      { type: 'lower-roman', symbol: 'i.' }
    ]
  },
  {
    name: 'Business',
    levels: [
      { type: 'decimal', symbol: '1.' },
      { type: 'decimal', symbol: '1.1.' },
      { type: 'decimal', symbol: '1.1.1.' },
      { type: 'decimal', symbol: '1.1.1.1.' }
    ]
  }
];

// Get list styles CSS
export const getListStyles = (): string => `
  .diamond-list {
    list-style: none;
    padding-left: 30px;
  }
  .diamond-list li::before {
    content: '◆';
    color: #7c3aed;
    margin-right: 6px;
    margin-left: -20px;
    display: inline-block;
    width: 20px;
  }
  
  .arrow-list {
    list-style: none;
    padding-left: 30px;
  }
  .arrow-list li::before {
    content: '➤';
    color: #7c3aed;
    margin-right: 6px;
    margin-left: -20px;
    display: inline-block;
    width: 20px;
  }
  
  .check-list {
    list-style: none;
    padding-left: 30px;
  }
  .check-list li::before {
    content: '✓';
    color: #10b981;
    margin-right: 6px;
    margin-left: -20px;
    display: inline-block;
    width: 20px;
    font-weight: bold;
  }
  
  .paren-decimal {
    list-style: none;
    counter-reset: paren-counter;
    padding-left: 35px;
  }
  .paren-decimal li {
    counter-increment: paren-counter;
  }
  .paren-decimal li::before {
    content: counter(paren-counter) ')';
    margin-right: 6px;
    margin-left: -25px;
    display: inline-block;
    width: 25px;
    color: #7c3aed;
  }
  
  .paren-upper-alpha {
    list-style: none;
    counter-reset: paren-alpha-counter;
    padding-left: 35px;
  }
  .paren-upper-alpha li {
    counter-increment: paren-alpha-counter;
  }
  .paren-upper-alpha li::before {
    content: counter(paren-alpha-counter, upper-alpha) ')';
    margin-right: 6px;
    margin-left: -25px;
    display: inline-block;
    width: 25px;
    color: #7c3aed;
  }
  
  .multilevel-list {
    list-style: none;
    counter-reset: level1;
    padding-left: 40px;
  }
  
  .multilevel-list > li {
    counter-increment: level1;
    margin-bottom: 8px;
  }
  
  .multilevel-list.standard > li::before {
    content: counter(level1) '. ';
    color: #7c3aed;
    font-weight: bold;
    margin-right: 6px;
    margin-left: -30px;
    display: inline-block;
    width: 30px;
  }
  
  .multilevel-list.legal > li::before {
    content: counter(level1, upper-roman) '. ';
    color: #7c3aed;
    font-weight: bold;
    margin-right: 6px;
    margin-left: -30px;
    display: inline-block;
    width: 30px;
  }
  
  .multilevel-list.outline > li::before {
    content: counter(level1, upper-alpha) '. ';
    color: #7c3aed;
    font-weight: bold;
    margin-right: 6px;
    margin-left: -30px;
    display: inline-block;
    width: 30px;
  }
  
  .multilevel-list.business > li::before {
    content: counter(level1) '. ';
    color: #7c3aed;
    font-weight: bold;
    margin-right: 6px;
    margin-left: -30px;
    display: inline-block;
    width: 30px;
  }
  
  .multilevel-list ul {
    list-style: none;
    counter-reset: level2;
    margin-left: 25px;
    padding-left: 25px;
    margin-top: 4px;
  }
  
  .multilevel-list ul li {
    counter-increment: level2;
    margin-bottom: 4px;
  }
  
  .multilevel-list.standard ul li::before {
    content: counter(level2, lower-alpha) '. ';
    color: #6366f1;
    margin-right: 6px;
    margin-left: -20px;
    display: inline-block;
    width: 20px;
  }
  
  .multilevel-list.legal ul li::before {
    content: counter(level2, upper-alpha) '. ';
    color: #6366f1;
    margin-right: 6px;
    margin-left: -20px;
    display: inline-block;
    width: 20px;
  }
  
  .multilevel-list.outline ul li::before {
    content: counter(level2) '. ';
    color: #6366f1;
    margin-right: 6px;
    margin-left: -20px;
    display: inline-block;
    width: 20px;
  }
  
  .multilevel-list.business ul li::before {
    content: counter(level1) '.' counter(level2) '. ';
    color: #6366f1;
    margin-right: 6px;
    margin-left: -20px;
    display: inline-block;
    width: 20px;
  }
  
  .multilevel-list ul ul {
    counter-reset: level3;
    margin-left: 20px;
    padding-left: 20px;
    margin-top: 4px;
  }
  
  .multilevel-list ul ul li {
    counter-increment: level3;
    margin-bottom: 4px;
  }
  
  .multilevel-list.standard ul ul li::before {
    content: counter(level3, lower-roman) '. ';
    color: #8b5cf6;
    margin-right: 6px;
    margin-left: -15px;
    display: inline-block;
    width: 15px;
  }
  
  .multilevel-list.legal ul ul li::before {
    content: counter(level3) '. ';
    color: #8b5cf6;
    margin-right: 6px;
    margin-left: -15px;
    display: inline-block;
    width: 15px;
  }
  
  .multilevel-list.outline ul ul li::before {
    content: counter(level3, lower-alpha) '. ';
    color: #8b5cf6;
    margin-right: 6px;
    margin-left: -15px;
    display: inline-block;
    width: 15px;
  }
  
  .multilevel-list.business ul ul li::before {
    content: counter(level1) '.' counter(level2) '.' counter(level3) '. ';
    color: #8b5cf6;
    margin-right: 6px;
    margin-left: -15px;
    display: inline-block;
    width: 15px;
  }
  
  /* Standard HTML lists styling to match the indentation */
  ul, ol {
    padding-left: 30px;
  }
  
  ul ul, ol ol, ul ol, ol ul {
    padding-left: 25px;
    margin-top: 4px;
  }
  
  li {
    margin-bottom: 4px;
  }
`;

// Apply bullet list
const applyBulletList = (style: BulletStyle, editorRef: RefObject<HTMLElement>, handleChange: () => void) => {
  if (!editorRef.current) return;
  
  editorRef.current.focus();
  
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    // No selection, create a new list at cursor position
    const range = document.createRange();
    const sel = window.getSelection();
    if (sel) {
      range.setStart(editorRef.current, editorRef.current.childNodes.length);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
  
  // Insert unordered list
  document.execCommand('insertUnorderedList', false, null);
  
  setTimeout(() => {
    if (!editorRef.current) return;
    
    // Find the most recently created list
    const lists = editorRef.current.querySelectorAll('ul');
    let targetList: HTMLElement | null = null;
    
    // Try to find the list that contains the current selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let node = selection.getRangeAt(0).commonAncestorContainer;
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'UL') {
          targetList = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }
    }
    
    // If no list found in selection, use the last list
    if (!targetList && lists.length > 0) {
      targetList = lists[lists.length - 1] as HTMLElement;
    }
    
    if (targetList) {
      if (style.customClass) {
        targetList.className = style.customClass;
        targetList.style.listStyleType = 'none';
      } else {
        targetList.style.listStyleType = style.value;
        targetList.className = '';
      }
    }
    
    if (handleChange) handleChange();
  }, 10);
};

// Apply numbered list
const applyNumberedList = (style: NumberedStyle, editorRef: RefObject<HTMLElement>, handleChange: () => void) => {
  if (!editorRef.current) return;
  
  editorRef.current.focus();
  
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    // No selection, create a new list at cursor position
    const range = document.createRange();
    const sel = window.getSelection();
    if (sel) {
      range.setStart(editorRef.current, editorRef.current.childNodes.length);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
  
  // Insert ordered list
  document.execCommand('insertOrderedList', false, null);
  
  setTimeout(() => {
    if (!editorRef.current) return;
    
    // Find the most recently created list
    const lists = editorRef.current.querySelectorAll('ol');
    let targetList: HTMLElement | null = null;
    
    // Try to find the list that contains the current selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let node = selection.getRangeAt(0).commonAncestorContainer;
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'OL') {
          targetList = node as HTMLElement;
          break;
        }
        node = node.parentNode;
      }
    }
    
    // If no list found in selection, use the last list
    if (!targetList && lists.length > 0) {
      targetList = lists[lists.length - 1] as HTMLElement;
    }
    
    if (targetList) {
      if (style.customClass) {
        targetList.className = style.customClass;
        targetList.style.listStyleType = 'none';
      } else {
        targetList.style.listStyleType = style.value;
        targetList.className = '';
      }
    }
    
    if (handleChange) handleChange();
  }, 10);
};

// Apply multilevel list
const applyMultilevelList = (style: MultilevelStyle, editorRef: RefObject<HTMLElement>, handleChange: () => void) => {
  if (!editorRef.current) return;
  
  editorRef.current.focus();
  
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  
  // Create multilevel list structure
  const listHTML = `
    <ul class="multilevel-list ${style.name.toLowerCase()}">
      <li>Item level 1
        <ul>
          <li>Item level 2
            <ul>
              <li>Item level 3</li>
            </ul>
          </li>
        </ul>
      </li>
      <li>Item level 1</li>
    </ul>
  `;
  
  // Insert the multilevel list
  const div = document.createElement('div');
  div.innerHTML = listHTML.trim();
  const listElement = div.firstElementChild as HTMLElement;
  
  if (listElement) {
    range.deleteContents();
    range.insertNode(listElement);
    
    // Position cursor at the end
    const newRange = document.createRange();
    newRange.setStartAfter(listElement);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
  
  if (handleChange) handleChange();
};

// Dropdown components
const BulletListDropdown: React.FC<DropdownProps> = ({ isOpen, onClose, onSelect, buttonRef }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, buttonRef]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={dropdownRef}
      className="tw-absolute tw-top-full tw-left-0 tw-mt-1 tw-bg-white tw-border tw-border-purple-300 tw-rounded tw-shadow-lg tw-z-50 tw-min-w-[200px]"
    >
      <div className="tw-p-2">
        <div className="tw-text-xs tw-font-semibold tw-text-purple-700 tw-mb-2">Bullet Styles</div>
        {bulletStyles.map((style, index) => (
          <button
            key={index}
            className="tw-w-full tw-text-left tw-px-3 tw-py-2 tw-text-sm tw-hover:tw-bg-purple-50 tw-rounded tw-flex tw-items-center tw-gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(style);
              onClose();
            }}
          >
            <span className="tw-text-purple-600 tw-font-mono">{style.symbol}</span>
            <span>{style.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const NumberedListDropdown: React.FC<DropdownProps> = ({ isOpen, onClose, onSelect, buttonRef }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, buttonRef]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={dropdownRef}
      className="tw-absolute tw-top-full tw-left-0 tw-mt-1 tw-bg-white tw-border tw-border-purple-300 tw-rounded tw-shadow-lg tw-z-50 tw-min-w-[200px]"
    >
      <div className="tw-p-2">
        <div className="tw-text-xs tw-font-semibold tw-text-purple-700 tw-mb-2">Number Styles</div>
        {numberedStyles.map((style, index) => (
          <button
            key={index}
            className="tw-w-full tw-text-left tw-px-3 tw-py-2 tw-text-sm tw-hover:tw-bg-purple-50 tw-rounded tw-flex tw-items-center tw-gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(style);
              onClose();
            }}
          >
            <span className="tw-text-purple-600 tw-font-mono tw-min-w-[30px]">{style.sample}</span>
            <span>{style.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const MultilevelListDropdown: React.FC<DropdownProps> = ({ isOpen, onClose, onSelect, buttonRef }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, buttonRef]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={dropdownRef}
      className="tw-absolute tw-top-full tw-left-0 tw-mt-1 tw-bg-white tw-border tw-border-purple-300 tw-rounded tw-shadow-lg tw-z-50 tw-min-w-[250px]"
    >
      <div className="tw-p-2">
        <div className="tw-text-xs tw-font-semibold tw-text-purple-700 tw-mb-2">Multilevel Styles</div>
        {multilevelStyles.map((style, index) => (
          <button
            key={index}
            className="tw-w-full tw-text-left tw-px-3 tw-py-3 tw-text-sm tw-hover:tw-bg-purple-50 tw-rounded tw-border-b tw-border-purple-100 last:tw-border-b-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(style);
              onClose();
            }}
          >
            <div className="tw-font-medium tw-text-purple-700 tw-mb-1">{style.name}</div>
            <div className="tw-text-xs tw-text-gray-600">
              {style.levels.map((level, i) => (
                <span key={i} className="tw-mr-2">{level.symbol}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Main button components
export const BulletListButton: React.FC<ListButtonProps> = ({ editorRef, handleChange, dropdownStates, setDropdownStates }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownStates(prev => ({
      ...prev,
      bulletList: !prev.bulletList,
      numberedList: false,
      multilevelList: false
    }));
  };
  
  return (
    <div className="tw-relative">
      <button 
        ref={buttonRef}
        className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors tw-flex tw-items-center tw-gap-1"
        onClick={handleClick}
        title="Bullet List (Ctrl+Shift+Q)"
      >
        <List size={16} />
        <svg className="tw-w-3 tw-h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      <BulletListDropdown
        isOpen={dropdownStates.bulletList}
        onClose={() => setDropdownStates(prev => ({ ...prev, bulletList: false }))}
        onSelect={(style) => applyBulletList(style, editorRef, handleChange)}
        buttonRef={buttonRef}
      />
    </div>
  );
};

export const NumberedListButton: React.FC<ListButtonProps> = ({ editorRef, handleChange, dropdownStates, setDropdownStates }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownStates(prev => ({
      ...prev,
      numberedList: !prev.numberedList,
      bulletList: false,
      multilevelList: false
    }));
  };
  
  return (
    <div className="tw-relative">
      <button 
        ref={buttonRef}
        className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors tw-flex tw-items-center tw-gap-1"
        onClick={handleClick}
        title="Numbered List (Ctrl+Shift+E)"
      >
        <ListOrdered size={16} />
        <svg className="tw-w-3 tw-h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      <NumberedListDropdown
        isOpen={dropdownStates.numberedList}
        onClose={() => setDropdownStates(prev => ({ ...prev, numberedList: false }))}
        onSelect={(style) => applyNumberedList(style, editorRef, handleChange)}
        buttonRef={buttonRef}
      />
    </div>
  );
};

export const MultilevelListButton: React.FC<ListButtonProps> = ({ editorRef, handleChange, dropdownStates, setDropdownStates }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownStates(prev => ({
      ...prev,
      multilevelList: !prev.multilevelList,
      bulletList: false,
      numberedList: false
    }));
  };
  
  return (
    <div className="tw-relative">
      <button 
        ref={buttonRef}
        className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors tw-flex tw-items-center tw-gap-1"
        onClick={handleClick}
        title="Multilevel List (Ctrl+Shift+M)"
      >
        <Network size={16} />
        <svg className="tw-w-3 tw-h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      <MultilevelListDropdown
        isOpen={dropdownStates.multilevelList}
        onClose={() => setDropdownStates(prev => ({ ...prev, multilevelList: false }))}
        onSelect={(style) => applyMultilevelList(style, editorRef, handleChange)}
        buttonRef={buttonRef}
      />
    </div>
  );
};

// Default export for the entire component
const ListComponent = {
  BulletListButton,
  NumberedListButton,
  MultilevelListButton,
  getListStyles
};

export default ListComponent;