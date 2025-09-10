'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Strikethrough, Subscript, Superscript, Link, Heading, ChevronDown } from 'lucide-react';
import { ButtonGradient } from '../../../button/ButtonTemplate';

// Custom execCommand functions for semantic elements
const execStrongCommand = (editorRef, handleChange) => {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  
  if (selectedText) {
    const strong = document.createElement('strong');
    strong.textContent = selectedText;
    range.deleteContents();
    range.insertNode(strong);
    
    // Clear selection
    selection.removeAllRanges();
    
    if (handleChange) handleChange();
  }
};

const execEmCommand = (editorRef, handleChange) => {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  
  if (selectedText) {
    const em = document.createElement('em');
    em.textContent = selectedText;
    range.deleteContents();
    range.insertNode(em);
    
    // Clear selection
    selection.removeAllRanges();
    
    if (handleChange) handleChange();
  }
};

// Font style buttons using ButtonGradient with tooltips (ICON-ONLY)
export const BoldButton = ({ onClick, editorRef, handleChange }) => (
  <ButtonGradient
    action="edit"
    customIcon={<Bold className="tw-w-4 tw-h-4" />}
    onClick={() => {
      if (editorRef && handleChange) {
        execStrongCommand(editorRef, handleChange);
      } else {
        onClick?.();
      }
    }}
    size="md"
    showText={false}
    tooltip="Bold (Ctrl+B)"
    className="tw-w-8 tw-h-8"
  />
);

export const ItalicButton = ({ onClick, editorRef, handleChange }) => (
  <ButtonGradient
    action="edit"
    customIcon={<Italic className="tw-w-4 tw-h-4" />}
    onClick={() => {
      if (editorRef && handleChange) {
        execEmCommand(editorRef, handleChange);
      } else {
        onClick?.();
      }
    }}
    size="md"
    showText={false}
    tooltip="Italic (Ctrl+I)"
    className="tw-w-8 tw-h-8"
  />
);

export const UnderlineButton = ({ onClick }) => (
  <ButtonGradient
    action="edit"
    customIcon={<Underline className="tw-w-4 tw-h-4" />}
    onClick={onClick}
    size="md"
    showText={false}
    tooltip="Underline (Ctrl+U)"
    className="tw-w-8 tw-h-8"
  />
);

export const StrikethroughButton = ({ onClick }) => (
  <ButtonGradient
    action="delete"
    customIcon={<Strikethrough className="tw-w-4 tw-h-4" />}
    onClick={onClick}
    size="md"
    showText={false}
    tooltip="Strikethrough (Ctrl+Shift+X)"
    className="tw-w-8 tw-h-8"
  />
);

export const SubscriptButton = ({ onClick }) => (
  <ButtonGradient
    action="edit"
    customIcon={<Subscript className="tw-w-4 tw-h-4" />}
    onClick={onClick}
    size="md"
    showText={false}
    tooltip="Subscript (Ctrl+,)"
    className="tw-w-8 tw-h-8"
  />
);

export const SuperscriptButton = ({ onClick }) => (
  <ButtonGradient
    action="edit"
    customIcon={<Superscript className="tw-w-4 tw-h-4" />}
    onClick={onClick}
    size="md"
    showText={false}
    tooltip="Superscript (Ctrl+.)"
    className="tw-w-8 tw-h-8"
  />
);

export const HyperlinkButton = ({ onClick }) => (
  <ButtonGradient
    action="link"
    customIcon={<Link className="tw-w-4 tw-h-4" />}
    onClick={onClick}
    size="md"
    showText={false}
    tooltip="Insert Link (Ctrl+K)"
    className="tw-w-8 tw-h-8"
  />
);

// Font size dropdown with tooltip (WIDER for better text display)
export const FontSizeButton = React.forwardRef(({ execCommand, onToggle, isOpen }, ref) => {
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState('3');
  const fontSizes = ['1', '2', '3', '4', '5', '6', '7'];
  const dropdownRef = useRef(null);
  const savedSelectionRef = useRef(null);
  
  useEffect(() => {
    setShowFontSizeDropdown(isOpen || false);
  }, [isOpen]);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFontSizeDropdown(false);
        if (onToggle) onToggle(false);
      }
    }
    
    if (showFontSizeDropdown) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
        
        try {
          const parentElement = selection.anchorNode.parentElement;
          let currentElement = parentElement;
          while (currentElement && !currentElement.getAttribute('size') && 
                !currentElement.style.fontSize && 
                currentElement !== document.body) {
            currentElement = currentElement.parentElement;
          }
          
          if (currentElement && currentElement.getAttribute('size')) {
            setCurrentFontSize(currentElement.getAttribute('size'));
          } else if (currentElement && currentElement.style.fontSize) {
            const pxSize = parseInt(currentElement.style.fontSize);
            if (!isNaN(pxSize)) {
              const sizeMap = {
                10: '1', 13: '2', 16: '3', 18: '4', 24: '5', 32: '6', 48: '7'
              };
              const closest = Object.keys(sizeMap).reduce((prev, curr) => {
                return (Math.abs(curr - pxSize) < Math.abs(prev - pxSize) ? curr : prev);
              }, 16);
              setCurrentFontSize(sizeMap[closest]);
            }
          } else {
            setCurrentFontSize('3');
          }
        } catch (e) {
          console.error('Error getting font size:', e);
          setCurrentFontSize('3');
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFontSizeDropdown, onToggle]);
  
  const handleFontSizeSelect = (size) => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
      
      execCommand('fontSize', size);
      savedSelectionRef.current = null;
    } else {
      execCommand('fontSize', size);
    }
    
    setCurrentFontSize(size);
    setShowFontSizeDropdown(false);
    if (onToggle) onToggle(false);
  };

  const increaseFontSize = () => {
    const currentIndex = fontSizes.indexOf(currentFontSize);
    if (currentIndex < fontSizes.length - 1) {
      const newSize = fontSizes[currentIndex + 1];
      handleFontSizeSelect(newSize);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = fontSizes.indexOf(currentFontSize);
    if (currentIndex > 0) {
      const newSize = fontSizes[currentIndex - 1];
      handleFontSizeSelect(newSize);
    }
  };

  React.useImperativeHandle(ref, () => ({
    increaseFontSize,
    decreaseFontSize
  }));
  
  const handleToggle = () => {
    const newState = !showFontSizeDropdown;
    setShowFontSizeDropdown(newState);
    if (onToggle) onToggle(newState);
  };
  
  return (
    <div className="tw-relative" ref={dropdownRef}>
      <ButtonGradient
        action="settings"
        onClick={handleToggle}
        size="md"
        showText={false}
        tooltip={`Font Size: ${currentFontSize} (Ctrl+Shift+>/<)`}
        className="tw-w-16 tw-h-8"
      >
        <div className="tw-flex tw-items-center tw-gap-1">
          <Type className="tw-w-3 tw-h-3" />
          <span className="tw-text-xs tw-font-bold">{currentFontSize}</span>
        </div>
      </ButtonGradient>
      
      {showFontSizeDropdown && (
        <div className="tw-absolute tw-z-50 tw-mt-1 tw-bg-white tw-border-2 tw-border-purple-300 tw-rounded-xl tw-shadow-2xl tw-min-w-[120px]">
          <div className="tw-p-2">
            <div className="tw-text-xs tw-font-semibold tw-text-purple-700 tw-mb-2 tw-px-2">Font Size</div>
            <div className="tw-space-y-1">
              {fontSizes.map(size => (
                <button
                  key={size} 
                  className={`tw-w-full tw-px-3 tw-py-2 tw-text-left tw-rounded-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-justify-between ${
                    currentFontSize === size 
                      ? 'tw-bg-purple-100 tw-text-purple-700 tw-font-semibold' 
                      : 'hover:tw-bg-purple-50 tw-text-gray-700'
                  }`}
                  onClick={() => handleFontSizeSelect(size)}
                >
                  <span style={{ fontSize: `${parseInt(size) * 0.25 + 0.5}rem` }}>
                    Size {size}
                  </span>
                  {currentFontSize === size && (
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

FontSizeButton.displayName = 'FontSizeButton';

// Font name dropdown with tooltip (WIDER for font names)
export const FontNameButton = ({ execCommand, onToggle, isOpen }) => {
  const [showFontNameDropdown, setShowFontNameDropdown] = useState(false);
  const [currentFontName, setCurrentFontName] = useState('Arial');
  const fontNames = [
    'Arial', 
    'Courier New', 
    'Georgia', 
    'Times New Roman', 
    'Verdana',
    'Tahoma',
    'Trebuchet MS'
  ];
  const dropdownRef = useRef(null);
  const savedSelectionRef = useRef(null);
  
  useEffect(() => {
    setShowFontNameDropdown(isOpen || false);
  }, [isOpen]);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFontNameDropdown(false);
        if (onToggle) onToggle(false);
      }
    }
    
    if (showFontNameDropdown) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
        
        try {
          const parentElement = selection.anchorNode.parentElement;
          let currentElement = parentElement;
          while (currentElement && !currentElement.getAttribute('face') && 
                !getComputedStyle(currentElement).fontFamily && 
                currentElement !== document.body) {
            currentElement = currentElement.parentElement;
          }
          
          if (currentElement && currentElement.getAttribute('face')) {
            setCurrentFontName(currentElement.getAttribute('face'));
          } else if (currentElement) {
            const fontFamily = getComputedStyle(currentElement).fontFamily;
            if (fontFamily) {
              const firstFont = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
              const matchedFont = fontNames.find(font => 
                firstFont.toLowerCase().includes(font.toLowerCase())
              );
              setCurrentFontName(matchedFont || 'Arial');
            }
          } else {
            setCurrentFontName('Arial');
          }
        } catch (e) {
          console.error('Error getting font family:', e);
          setCurrentFontName('Arial');
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFontNameDropdown, fontNames, onToggle]);
  
  const handleFontNameSelect = (fontName) => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
      
      execCommand('fontName', fontName);
      savedSelectionRef.current = null;
    } else {
      execCommand('fontName', fontName);
    }
    
    setCurrentFontName(fontName);
    setShowFontNameDropdown(false);
    if (onToggle) onToggle(false);
  };
  
  const handleToggle = () => {
    const newState = !showFontNameDropdown;
    setShowFontNameDropdown(newState);
    if (onToggle) onToggle(newState);
  };
  
  const getShortFontName = (name) => {
    if (name === 'Times New Roman') return 'Times';
    if (name === 'Courier New') return 'Courier';
    if (name === 'Trebuchet MS') return 'Trebuchet';
    return name.length > 8 ? name.substring(0, 8) : name;
  };
  
  return (
    <div className="tw-relative" ref={dropdownRef}>
      <ButtonGradient
        action="settings"
        onClick={handleToggle}
        size="md"
        showText={false}
        tooltip={`Font: ${currentFontName}`}
        className="tw-w-20 tw-h-8"
      >
        <div className="tw-flex tw-items-center tw-gap-1">
          <Type className="tw-w-3 tw-h-3" />
          <span className="tw-text-xs tw-font-medium tw-max-w-[40px] tw-truncate">
            {getShortFontName(currentFontName)}
          </span>
        </div>
      </ButtonGradient>
      
      {showFontNameDropdown && (
        <div className="tw-absolute tw-z-50 tw-mt-1 tw-bg-white tw-border-2 tw-border-purple-300 tw-rounded-xl tw-shadow-2xl tw-min-w-[200px]">
          <div className="tw-p-2">
            <div className="tw-text-xs tw-font-semibold tw-text-purple-700 tw-mb-2 tw-px-2">Font Family</div>
            <div className="tw-space-y-1 tw-max-h-60 tw-overflow-y-auto">
              {fontNames.map(fontName => (
                <button
                  key={fontName} 
                  className={`tw-w-full tw-px-3 tw-py-2 tw-text-left tw-rounded-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-justify-between ${
                    currentFontName === fontName 
                      ? 'tw-bg-purple-100 tw-text-purple-700 tw-font-semibold' 
                      : 'hover:tw-bg-purple-50 tw-text-gray-700'
                  }`}
                  onClick={() => handleFontNameSelect(fontName)}
                  style={{ fontFamily: fontName }}
                >
                  <span>{fontName}</span>
                  {currentFontName === fontName && (
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
};

// Text alignment dropdown with tooltip (ICON-ONLY)
export const AlignmentButton = React.forwardRef(({ execCommand, onToggle, isOpen }, ref) => {
  const [showAlignmentDropdown, setShowAlignmentDropdown] = useState(false);
  const [currentAlignment, setCurrentAlignment] = useState('left');
  const [currentAlignmentIndex, setCurrentAlignmentIndex] = useState(0);
  const savedSelectionRef = useRef(null);

  const alignmentOptions = [
    { value: 'justifyLeft', label: 'Left', icon: AlignLeft },
    { value: 'justifyCenter', label: 'Center', icon: AlignCenter },
    { value: 'justifyRight', label: 'Right', icon: AlignRight },
    { value: 'justifyFull', label: 'Justify', icon: AlignJustify }
  ];
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    setShowAlignmentDropdown(isOpen || false);
  }, [isOpen]);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAlignmentDropdown(false);
        if (onToggle) onToggle(false);
      }
    }

    if (showAlignmentDropdown) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
      }

      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAlignmentDropdown, onToggle]);

  const handleAlignmentSelect = (alignmentValue) => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
      savedSelectionRef.current = null;
    }

    execCommand(alignmentValue);

    const alignmentMap = {
      'justifyLeft': 'left',
      'justifyCenter': 'center', 
      'justifyRight': 'right',
      'justifyFull': 'justify'
    };
    setCurrentAlignment(alignmentMap[alignmentValue]);
    
    const index = alignmentOptions.findIndex(opt => opt.value === alignmentValue);
    setCurrentAlignmentIndex(index);
    
    setShowAlignmentDropdown(false);
    if (onToggle) onToggle(false);
  };

  const cycleAlignment = (direction) => {
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentAlignmentIndex + 1) % alignmentOptions.length;
    } else {
      newIndex = currentAlignmentIndex === 0 ? alignmentOptions.length - 1 : currentAlignmentIndex - 1;
    }
    
    const newAlignment = alignmentOptions[newIndex];
    handleAlignmentSelect(newAlignment.value);
  };

  React.useImperativeHandle(ref, () => ({
    cycleNext: () => cycleAlignment('next'),
    cyclePrev: () => cycleAlignment('prev')
  }));
  
  const getCurrentIcon = () => {
    const option = alignmentOptions.find(opt => {
      const alignmentMap = {
        'justifyLeft': 'left',
        'justifyCenter': 'center', 
        'justifyRight': 'right',
        'justifyFull': 'justify'
      };
      return alignmentMap[opt.value] === currentAlignment;
    });
    return option ? option.icon : AlignLeft;
  };
  
  const getCurrentLabel = () => {
    const option = alignmentOptions.find(opt => {
      const alignmentMap = {
        'justifyLeft': 'left',
        'justifyCenter': 'center', 
        'justifyRight': 'right',
        'justifyFull': 'justify'
      };
      return alignmentMap[opt.value] === currentAlignment;
    });
    return option ? option.label : 'Left';
  };
  
  const CurrentIcon = getCurrentIcon();
  
  const handleToggle = () => {
    const newState = !showAlignmentDropdown;
    setShowAlignmentDropdown(newState);
    if (onToggle) onToggle(newState);
  };
  
  return (
    <div className="tw-relative" ref={dropdownRef}>
      <ButtonGradient
        action="settings"
        customIcon={<CurrentIcon className="tw-w-4 tw-h-4" />}
        onClick={handleToggle}
        size="md"
        showText={false}
        tooltip={`Align ${getCurrentLabel()} (Ctrl+Shift+L/E/R/J)`}
        className="tw-w-8 tw-h-8"
      />
      
      {showAlignmentDropdown && (
        <div className="tw-absolute tw-z-50 tw-mt-1 tw-bg-white tw-border-2 tw-border-purple-300 tw-rounded-xl tw-shadow-2xl tw-min-w-[150px]">
          <div className="tw-p-2">
            <div className="tw-text-xs tw-font-semibold tw-text-purple-700 tw-mb-2 tw-px-2">Text Alignment</div>
            <div className="tw-space-y-1">
              {alignmentOptions.map(option => {
                const Icon = option.icon;
                const alignmentMap = {
                  'justifyLeft': 'left',
                  'justifyCenter': 'center', 
                  'justifyRight': 'right',
                  'justifyFull': 'justify'
                };
                const isSelected = alignmentMap[option.value] === currentAlignment;
                
                return (
                  <button
                    key={option.value} 
                    className={`tw-w-full tw-px-3 tw-py-2 tw-text-left tw-rounded-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-gap-3 ${
                      isSelected 
                        ? 'tw-bg-purple-100 tw-text-purple-700 tw-font-semibold' 
                        : 'hover:tw-bg-purple-50 tw-text-gray-700'
                    }`}
                    onClick={() => handleAlignmentSelect(option.value)}
                  >
                    <Icon className="tw-w-4 tw-h-4" />
                    <span className="tw-flex-1">{option.label}</span>
                    {isSelected && (
                      <div className="tw-w-2 tw-h-2 tw-bg-purple-600 tw-rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AlignmentButton.displayName = 'AlignmentButton';

// Heading dropdown with tooltip (WIDER for heading text)
export const HeadingButton = React.forwardRef(({ execCommand, onToggle, isOpen }, ref) => {
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [currentHeading, setCurrentHeading] = useState('normal');
  const savedSelectionRef = useRef(null);
  
  const headingOptions = [
    { value: 'normal', label: 'Normal Text', tag: 'p', shortLabel: 'P' },
    { value: 'h1', label: 'Heading 1', tag: 'h1', shortLabel: 'H1' },
    { value: 'h2', label: 'Heading 2', tag: 'h2', shortLabel: 'H2' },
    { value: 'h3', label: 'Heading 3', tag: 'h3', shortLabel: 'H3' },
    { value: 'h4', label: 'Heading 4', tag: 'h4', shortLabel: 'H4' }
  ];
  const dropdownRef = useRef(null);
  
  const applyHeading = (level) => {
    if (level === 'normal') {
      execCommand('formatBlock', '<p>');
    } else {
      execCommand('formatBlock', `<h${level}>`);
    }
    setCurrentHeading(level === 'normal' ? 'normal' : `h${level}`);
  };

  React.useImperativeHandle(ref, () => ({
    applyH1: () => applyHeading(1),
    applyH2: () => applyHeading(2),
    applyH3: () => applyHeading(3),
    applyH4: () => applyHeading(4),
    applyNormal: () => applyHeading('normal')
  }));
  
  useEffect(() => {
    setShowHeadingDropdown(isOpen || false);
  }, [isOpen]);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowHeadingDropdown(false);
        if (onToggle) onToggle(false);
      }
    }
    
    if (showHeadingDropdown) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
        
        try {
          const parentElement = selection.anchorNode.parentElement || selection.anchorNode;
          let currentElement = parentElement;
          while (currentElement && !['H1', 'H2', 'H3', 'H4'].includes(currentElement.tagName) && 
                currentElement !== document.body) {
            currentElement = currentElement.parentElement;
          }
          
          if (currentElement && ['H1', 'H2', 'H3', 'H4'].includes(currentElement.tagName)) {
            setCurrentHeading(currentElement.tagName.toLowerCase());
          } else {
            setCurrentHeading('normal');
          }
        } catch (e) {
          console.error('Error getting heading level:', e);
          setCurrentHeading('normal');
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHeadingDropdown, onToggle]);
  
  const handleHeadingSelect = (headingValue) => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
      
      if (headingValue === 'normal') {
        execCommand('formatBlock', '<p>');
      } else {
        execCommand('formatBlock', `<${headingValue}>`);
      }
      savedSelectionRef.current = null;
    } else {
      if (headingValue === 'normal') {
        execCommand('formatBlock', '<p>');
      } else {
        execCommand('formatBlock', `<${headingValue}>`);
      }
    }
    
    setCurrentHeading(headingValue);
    setShowHeadingDropdown(false);
    if (onToggle) onToggle(false);
  };
  
  const getCurrentLabel = () => {
    const option = headingOptions.find(opt => opt.value === currentHeading);
    return option ? option.label : 'Normal Text';
  };

  const getCurrentShortLabel = () => {
    const option = headingOptions.find(opt => opt.value === currentHeading);
    return option ? option.shortLabel : 'P';
  };
  
  const handleToggle = () => {
    const newState = !showHeadingDropdown;
    setShowHeadingDropdown(newState);
    if (onToggle) onToggle(newState);
  };
  
  return (
    <div className="tw-relative" ref={dropdownRef}>
      <ButtonGradient
        action="settings"
        onClick={handleToggle}
        size="md"
        showText={false}
        tooltip={`${getCurrentLabel()} (Ctrl+1-4)`}
        className="tw-w-14 tw-h-8"
      >
        <div className="tw-flex tw-items-center tw-gap-1">
          <Heading className="tw-w-3 tw-h-3" />
          <span className="tw-text-xs tw-font-bold">{getCurrentShortLabel()}</span>
        </div>
      </ButtonGradient>
      
      {showHeadingDropdown && (
        <div className="tw-absolute tw-z-50 tw-mt-1 tw-bg-white tw-border-2 tw-border-purple-300 tw-rounded-xl tw-shadow-2xl tw-min-w-[180px]">
          <div className="tw-p-2">
            <div className="tw-text-xs tw-font-semibold tw-text-purple-700 tw-mb-2 tw-px-2">Text Style</div>
            <div className="tw-space-y-1">
              {headingOptions.map(option => {
                const isSelected = option.value === currentHeading;
                
                return (
                  <button
                    key={option.value} 
                    className={`tw-w-full tw-px-3 tw-py-2 tw-text-left tw-rounded-lg tw-transition-all tw-duration-200 tw-flex tw-items-center tw-justify-between ${
                      isSelected 
                        ? 'tw-bg-purple-100 tw-text-purple-700 tw-font-semibold' 
                        : 'hover:tw-bg-purple-50 tw-text-gray-700'
                    }`}
                    onClick={() => handleHeadingSelect(option.value)}
                  >
                    <span 
                      style={{ 
                        fontSize: option.value === 'h1' ? '1.5em' : 
                                option.value === 'h2' ? '1.3em' : 
                                option.value === 'h3' ? '1.1em' :
                                option.value === 'h4' ? '1em' : '0.9em',
                        fontWeight: option.value !== 'normal' ? 'bold' : 'normal'
                      }}
                    >
                      {option.label}
                    </span>
                    {isSelected && (
                      <div className="tw-w-2 tw-h-2 tw-bg-purple-600 tw-rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

HeadingButton.displayName = 'HeadingButton';

// Common buttons group using ButtonGradient with icon-only design
export const FontButtons = ({ 
  execCommand, 
  editorRef, 
  handleChange, 
  dropdownStates, 
  setDropdownStates, 
  fontSizeButtonRef,
  alignmentButtonRef,
  headingButtonRef 
}) => {
  const handleHyperlink = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (selectedText) {
      const url = prompt('Enter URL:', 'https://');
      if (url) {
        execCommand('createLink', url);
      }
    } else {
      alert('Please select text first to create a hyperlink.');
    }
  };

  return (
    <div className="tw-flex tw-flex-wrap tw-gap-2 tw-items-center">
      {/* Text Formatting Buttons */}
      <div className="tw-flex tw-gap-1 tw-items-center tw-bg-purple-50 tw-rounded-lg tw-p-1">
        <BoldButton 
          onClick={() => execCommand('bold')} 
          editorRef={editorRef}
          handleChange={handleChange}
        />
        <ItalicButton 
          onClick={() => execCommand('italic')} 
          editorRef={editorRef}
          handleChange={handleChange}
        />
        <UnderlineButton onClick={() => execCommand('underline')} />
        <StrikethroughButton onClick={() => execCommand('strikeThrough')} />
      </div>

      {/* Script Buttons */}
      <div className="tw-flex tw-gap-1 tw-items-center tw-bg-blue-50 tw-rounded-lg tw-p-1">
        <SubscriptButton onClick={() => execCommand('subscript')} />
        <SuperscriptButton onClick={() => execCommand('superscript')} />
      </div>

      {/* Link Button */}
      <div className="tw-flex tw-gap-1 tw-items-center tw-bg-blue-50 tw-rounded-lg tw-p-1">
        <HyperlinkButton onClick={handleHyperlink} />
      </div>

      {/* Font Controls */}
      <div className="tw-flex tw-gap-1 tw-items-center tw-bg-gray-50 tw-rounded-lg tw-p-1">
        <FontSizeButton 
          ref={fontSizeButtonRef}
          execCommand={execCommand}
          isOpen={dropdownStates?.fontSize || false}
          onToggle={(isOpen) => setDropdownStates && setDropdownStates(prev => ({ ...prev, fontSize: isOpen }))}
        />
        <FontNameButton 
          execCommand={execCommand}
          isOpen={dropdownStates?.fontName || false}
          onToggle={(isOpen) => setDropdownStates && setDropdownStates(prev => ({ ...prev, fontName: isOpen }))}
        />
      </div>

      {/* Text Structure */}
      <div className="tw-flex tw-gap-1 tw-items-center tw-bg-green-50 tw-rounded-lg tw-p-1">
        <HeadingButton 
          ref={headingButtonRef}
          execCommand={execCommand}
          isOpen={dropdownStates?.heading || false}
          onToggle={(isOpen) => setDropdownStates && setDropdownStates(prev => ({ ...prev, heading: isOpen }))}
        />
        <AlignmentButton 
          ref={alignmentButtonRef}
          execCommand={execCommand}
          isOpen={dropdownStates?.alignment || false}
          onToggle={(isOpen) => setDropdownStates && setDropdownStates(prev => ({ ...prev, alignment: isOpen }))}
        />
      </div>
    </div>
  );
};