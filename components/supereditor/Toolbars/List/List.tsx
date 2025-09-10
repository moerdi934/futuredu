'use client';

import React, { useState, useRef, useEffect, RefObject } from 'react';
import { List, ListOrdered, Network, ChevronDown } from 'lucide-react';
import { ButtonGradient } from '../../../button/ButtonTemplate';

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

// Bullet List Button with Template
export const BulletListButton = React.forwardRef<any, ListButtonProps>(({ editorRef, handleChange, dropdownStates, setDropdownStates }, ref) => {
  const [currentBulletStyle, setCurrentBulletStyle] = useState('disc');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Selection | null>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownStates(prev => ({ ...prev, bulletList: false }));
      }
    }
    
    if (dropdownStates.bulletList) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedSelectionRef.current = selection;
      }
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownStates.bulletList, setDropdownStates]);
  
  const handleBulletSelect = (style: BulletStyle) => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        savedSelectionRef.current = null;
      }
    }
    
    applyBulletList(style, editorRef, handleChange);
    setCurrentBulletStyle(style.value);
    setDropdownStates(prev => ({ ...prev, bulletList: false }));
  };
  
  const handleToggle = () => {
    setDropdownStates(prev => ({
      ...prev,
      bulletList: !prev.bulletList,
      numberedList: false,
      multilevelList: false
    }));
  };
  
  return (
    <div className="tw-relative" ref={dropdownRef}>
      <ButtonGradient
        action="settings"
        onClick={handleToggle}
        size="md"
        showText={false}
        tooltip={`Bullet List: ${currentBulletStyle} (Ctrl+Shift+Q)`}
        className="tw-w-8 tw-h-8"
      >
        <div className="tw-flex tw-items-center tw-gap-1">
          <List className="tw-w-4 tw-h-4" />
          {/* <ChevronDown className="tw-w-3 tw-h-3" /> */}
        </div>
      </ButtonGradient>
      
      {dropdownStates.bulletList && (
        <div className="tw-absolute tw-z-50 tw-mt-1 tw-bg-white tw-border-2 tw-border-purple-300 tw-rounded-xl tw-shadow-2xl tw-min-w-[200px]">
          <div className="tw-p-2">
            <div className="tw-text-xs tw-font-semibold tw-text-purple-700 tw-mb-2 tw-px-2">Bullet Styles</div>
            <div className="tw-space-y-1">
              {bulletStyles.map((style, index) => (
                <button
                  key={index}
                  className={`tw-w-full tw-px-3 tw-py-2 tw-text-left tw-rounded-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-justify-between ${
                    currentBulletStyle === style.value 
                      ? 'tw-bg-purple-100 tw-text-purple-700 tw-font-semibold' 
                      : 'hover:tw-bg-purple-50 tw-text-gray-700'
                  }`}
                  onClick={() => handleBulletSelect(style)}
                >
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <span className="tw-text-purple-600 tw-font-mono">{style.symbol}</span>
                    <span>{style.name}</span>
                  </div>
                  {currentBulletStyle === style.value && (
                    <div className="tw-w-2 tw-h-2 tw-bg-purple-600 tw-rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

BulletListButton.displayName = 'BulletListButton';

// Numbered List Button with Template
export const NumberedListButton = React.forwardRef<any, ListButtonProps>(({ editorRef, handleChange, dropdownStates, setDropdownStates }, ref) => {
  const [currentNumberedStyle, setCurrentNumberedStyle] = useState('decimal');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Selection | null>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownStates(prev => ({ ...prev, numberedList: false }));
      }
    }
    
    if (dropdownStates.numberedList) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedSelectionRef.current = selection;
      }
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownStates.numberedList, setDropdownStates]);
  
  const handleNumberedSelect = (style: NumberedStyle) => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        savedSelectionRef.current = null;
      }
    }
    
    applyNumberedList(style, editorRef, handleChange);
    setCurrentNumberedStyle(style.value);
    setDropdownStates(prev => ({ ...prev, numberedList: false }));
  };
  
  const handleToggle = () => {
    setDropdownStates(prev => ({
      ...prev,
      numberedList: !prev.numberedList,
      bulletList: false,
      multilevelList: false
    }));
  };
  
  const getCurrentSample = () => {
    const style = numberedStyles.find(s => s.value === currentNumberedStyle);
    return style ? style.sample : '1.';
  };
  
  return (
    <div className="tw-relative" ref={dropdownRef}>
      <ButtonGradient
        action="settings"
        onClick={handleToggle}
        size="md"
        showText={false}
        tooltip={`Numbered List: ${getCurrentSample()} (Ctrl+Shift+E)`}
        className="tw-w-8 tw-h-8"
      >
        <div className="tw-flex tw-items-center tw-gap-1">
          <ListOrdered className="tw-w-4 tw-h-4" />
          {/* <ChevronDown className="tw-w-3 tw-h-3" /> */}
        </div>
      </ButtonGradient>
      
      {dropdownStates.numberedList && (
        <div className="tw-absolute tw-z-50 tw-mt-1 tw-bg-white tw-border-2 tw-border-purple-300 tw-rounded-xl tw-shadow-2xl tw-min-w-[200px]">
          <div className="tw-p-2">
            <div className="tw-text-xs tw-font-semibold tw-text-purple-700 tw-mb-2 tw-px-2">Number Styles</div>
            <div className="tw-space-y-1">
              {numberedStyles.map((style, index) => (
                <button
                  key={index}
                  className={`tw-w-full tw-px-3 tw-py-2 tw-text-left tw-rounded-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-justify-between ${
                    currentNumberedStyle === style.value 
                      ? 'tw-bg-purple-100 tw-text-purple-700 tw-font-semibold' 
                      : 'hover:tw-bg-purple-50 tw-text-gray-700'
                  }`}
                  onClick={() => handleNumberedSelect(style)}
                >
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <span className="tw-text-purple-600 tw-font-mono tw-min-w-[30px]">{style.sample}</span>
                    <span>{style.name}</span>
                  </div>
                  {currentNumberedStyle === style.value && (
                    <div className="tw-w-2 tw-h-2 tw-bg-purple-600 tw-rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

NumberedListButton.displayName = 'NumberedListButton';

// Multilevel List Button with Template
export const MultilevelListButton = React.forwardRef<any, ListButtonProps>(({ editorRef, handleChange, dropdownStates, setDropdownStates }, ref) => {
  const [currentMultilevelStyle, setCurrentMultilevelStyle] = useState('Standard');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Selection | null>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownStates(prev => ({ ...prev, multilevelList: false }));
      }
    }
    
    if (dropdownStates.multilevelList) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedSelectionRef.current = selection;
      }
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownStates.multilevelList, setDropdownStates]);
  
  const handleMultilevelSelect = (style: MultilevelStyle) => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        savedSelectionRef.current = null;
      }
    }
    
    applyMultilevelList(style, editorRef, handleChange);
    setCurrentMultilevelStyle(style.name);
    setDropdownStates(prev => ({ ...prev, multilevelList: false }));
  };
  
  const handleToggle = () => {
    setDropdownStates(prev => ({
      ...prev,
      multilevelList: !prev.multilevelList,
      bulletList: false,
      numberedList: false
    }));
  };
  
  return (
    <div className="tw-relative" ref={dropdownRef}>
      <ButtonGradient
        action="settings"
        onClick={handleToggle}
        size="md"
        showText={false}
        tooltip={`Multilevel List: ${currentMultilevelStyle} (Ctrl+Shift+M)`}
        className="tw-w-8 tw-h-8"
      >
        <div className="tw-flex tw-items-center tw-gap-1">
          <Network className="tw-w-4 tw-h-4" />
          {/* <ChevronDown className="tw-w-3 tw-h-3" /> */}
        </div>
      </ButtonGradient>
      
      {dropdownStates.multilevelList && (
        <div className="tw-absolute tw-z-50 tw-mt-1 tw-bg-white tw-border-2 tw-border-purple-300 tw-rounded-xl tw-shadow-2xl tw-min-w-[250px]">
          <div className="tw-p-2">
            <div className="tw-text-xs tw-font-semibold tw-text-purple-700 tw-mb-2 tw-px-2">Multilevel Styles</div>
            <div className="tw-space-y-1">
              {multilevelStyles.map((style, index) => (
                <button
                  key={index}
                  className={`tw-w-full tw-px-3 tw-py-3 tw-text-left tw-rounded-lg tw-transition-all tw-duration-200 tw-border-b tw-border-purple-100 last:tw-border-b-0 ${
                    currentMultilevelStyle === style.name 
                      ? 'tw-bg-purple-100 tw-text-purple-700 tw-font-semibold' 
                      : 'hover:tw-bg-purple-50 tw-text-gray-700'
                  }`}
                  onClick={() => handleMultilevelSelect(style)}
                >
                  <div className="tw-flex tw-items-center tw-justify-between">
                    <div>
                      <div className="tw-font-medium tw-text-purple-700 tw-mb-1">{style.name}</div>
                      <div className="tw-text-xs tw-text-gray-600">
                        {style.levels.map((level, i) => (
                          <span key={i} className="tw-mr-2">{level.symbol}</span>
                        ))}
                      </div>
                    </div>
                    {currentMultilevelStyle === style.name && (
                      <div className="tw-w-2 tw-h-2 tw-bg-purple-600 tw-rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MultilevelListButton.displayName = 'MultilevelListButton';

// Main List Buttons component using ButtonGradient template
export const ListButtons = ({ 
  editorRef, 
  handleChange, 
  dropdownStates, 
  setDropdownStates 
}: {
  editorRef: RefObject<HTMLElement>;
  handleChange: () => void;
  dropdownStates: any;
  setDropdownStates: React.Dispatch<React.SetStateAction<any>>;
}) => {
  return (
    <div className="tw-flex tw-gap-1 tw-items-center tw-bg-yellow-50 tw-rounded-lg tw-p-1">
      <BulletListButton 
        editorRef={editorRef}
        handleChange={handleChange}
        dropdownStates={dropdownStates}
        setDropdownStates={setDropdownStates}
      />
      <NumberedListButton 
        editorRef={editorRef}
        handleChange={handleChange}
        dropdownStates={dropdownStates}
        setDropdownStates={setDropdownStates}
      />
      <MultilevelListButton 
        editorRef={editorRef}
        handleChange={handleChange}
        dropdownStates={dropdownStates}
        setDropdownStates={setDropdownStates}
      />
    </div>
  );
};

// Default export for the entire component
const ListComponent = {
  BulletListButton,
  NumberedListButton,
  MultilevelListButton,
  ListButtons,
  getListStyles
};

export default ListComponent;