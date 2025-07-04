'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Strikethrough, Subscript, Superscript, Link } from 'lucide-react';
import { Heading } from 'lucide-react';

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

// Font style buttons (Bold, Italic, Underline, Strikethrough)
export const BoldButton = ({ onClick, editorRef, handleChange }) => (
  <button 
    className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors" 
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (editorRef && handleChange) {
        execStrongCommand(editorRef, handleChange);
      } else {
        onClick?.();
      }
    }}
    onMouseDown={(e) => e.preventDefault()}
    title="Bold (Ctrl+B)"
  >
    <Bold size={16} />
  </button>
);

export const ItalicButton = ({ onClick, editorRef, handleChange }) => (
  <button 
    className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors" 
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (editorRef && handleChange) {
        execEmCommand(editorRef, handleChange);
      } else {
        onClick?.();
      }
    }}
    onMouseDown={(e) => e.preventDefault()}
    title="Italic (Ctrl+I)"
  >
    <Italic size={16} />
  </button>
);

export const UnderlineButton = ({ onClick }) => (
  <button 
    className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors" 
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick?.();
    }}
    onMouseDown={(e) => e.preventDefault()}
    title="Underline (Ctrl+U)"
  >
    <Underline size={16} />
  </button>
);

export const StrikethroughButton = ({ onClick }) => (
  <button 
    className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors" 
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick?.();
    }}
    onMouseDown={(e) => e.preventDefault()}
    title="Strikethrough (Ctrl+D)"
  >
    <Strikethrough size={16} />
  </button>
);

export const SubscriptButton = ({ onClick }) => (
  <button 
    className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors" 
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick?.();
    }}
    onMouseDown={(e) => e.preventDefault()}
    title="Subscript (Ctrl+Shift+-)"
  >
    <Subscript size={16} />
  </button>
);

export const SuperscriptButton = ({ onClick }) => (
  <button 
    className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors" 
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick?.();
    }}
    onMouseDown={(e) => e.preventDefault()}
    title="Superscript (Ctrl+Shift+=)"
  >
    <Superscript size={16} />
  </button>
);

export const HyperlinkButton = ({ onClick }) => (
  <button 
    className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors" 
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick?.();
    }}
    onMouseDown={(e) => e.preventDefault()}
    title="Insert Link (Ctrl+Shift+L)"
  >
    <Link size={16} />
  </button>
);

// Font size dropdown with keyboard navigation
export const FontSizeButton = React.forwardRef(({ execCommand, onToggle, isOpen }, ref) => {
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState('3'); // Default font size
  const fontSizes = ['1', '2', '3', '4', '5', '6', '7'];
  const dropdownRef = useRef(null);
  const savedSelectionRef = useRef(null);
  
  // Sync with external state
  useEffect(() => {
    setShowFontSizeDropdown(isOpen || false);
  }, [isOpen]);
  
  // Handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFontSizeDropdown(false);
        if (onToggle) onToggle(false);
      }
    }
    
    if (showFontSizeDropdown) {
      // Save the current selection when dropdown opens
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
        
        // Get current font size
        try {
          const parentElement = selection.anchorNode.parentElement;
          // Find the closest element with a font size
          let currentElement = parentElement;
          while (currentElement && !currentElement.getAttribute('size') && 
                !currentElement.style.fontSize && 
                currentElement !== document.body) {
            currentElement = currentElement.parentElement;
          }
          
          // Check if we found an element with font size
          if (currentElement && currentElement.getAttribute('size')) {
            setCurrentFontSize(currentElement.getAttribute('size'));
          } else if (currentElement && currentElement.style.fontSize) {
            // Convert px to approximate font size
            const pxSize = parseInt(currentElement.style.fontSize);
            if (!isNaN(pxSize)) {
              // Rough mapping from px to font size (1-7)
              const sizeMap = {
                10: '1', 13: '2', 16: '3', 18: '4', 24: '5', 32: '6', 48: '7'
              };
              const closest = Object.keys(sizeMap).reduce((prev, curr) => {
                return (Math.abs(curr - pxSize) < Math.abs(prev - pxSize) ? curr : prev);
              }, 16);
              setCurrentFontSize(sizeMap[closest]);
            }
          } else {
            setCurrentFontSize('3'); // Default size if nothing is found
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
    // Restore the saved selection before applying the command
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

  // Expose methods through ref
  React.useImperativeHandle(ref, () => ({
    increaseFontSize,
    decreaseFontSize
  }));
  
  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !showFontSizeDropdown;
    setShowFontSizeDropdown(newState);
    if (onToggle) onToggle(newState);
  };
  
  return (
    <div className="tw-relative" ref={dropdownRef}>
      <button 
        className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-flex tw-items-center tw-hover:tw-bg-purple-50 tw-transition-colors" 
        onClick={handleToggle}
        onMouseDown={(e) => e.preventDefault()}
        title="Font Size (Ctrl+Shift+S)"
      >
        <Type size={16} />
        <span className="tw-ml-1">Size</span>
      </button>
      
      {showFontSizeDropdown && (
        <div className="tw-absolute tw-z-10 tw-mt-1 tw-bg-white tw-border tw-border-purple-300 tw-rounded tw-shadow-lg">
          {fontSizes.map(size => (
            <div 
              key={size} 
              className={`tw-px-4 tw-py-2 tw-cursor-pointer ${currentFontSize === size ? 'tw-bg-purple-200' : 'hover:tw-bg-purple-100'}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFontSizeSelect(size);
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <span style={{ fontSize: `${parseInt(size) * 0.25 + 0.5}rem` }}>
                {size}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

FontSizeButton.displayName = 'FontSizeButton';

// Font name dropdown
export const FontNameButton = ({ execCommand, onToggle, isOpen }) => {
  const [showFontNameDropdown, setShowFontNameDropdown] = useState(false);
  const [currentFontName, setCurrentFontName] = useState('Arial'); // Default font
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
  
  // Sync with external state
  useEffect(() => {
    setShowFontNameDropdown(isOpen || false);
  }, [isOpen]);
  
  // Handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFontNameDropdown(false);
        if (onToggle) onToggle(false);
      }
    }
    
    if (showFontNameDropdown) {
      // Save the current selection when dropdown opens
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
        
        // Get current font family
        try {
          const parentElement = selection.anchorNode.parentElement;
          // Find the closest element with a font family
          let currentElement = parentElement;
          while (currentElement && !currentElement.getAttribute('face') && 
                !getComputedStyle(currentElement).fontFamily && 
                currentElement !== document.body) {
            currentElement = currentElement.parentElement;
          }
          
          // Check if we found an element with font family
          if (currentElement && currentElement.getAttribute('face')) {
            setCurrentFontName(currentElement.getAttribute('face'));
          } else if (currentElement) {
            // Get computed font family
            const fontFamily = getComputedStyle(currentElement).fontFamily;
            if (fontFamily) {
              // Extract the first font name from the font-family string
              const firstFont = fontFamily.split(',')[0].replace(/['"]/g, '').trim();
              // Find the closest match in our fontNames array
              const matchedFont = fontNames.find(font => 
                firstFont.toLowerCase().includes(font.toLowerCase())
              );
              setCurrentFontName(matchedFont || 'Arial');
            }
          } else {
            setCurrentFontName('Arial'); // Default font if nothing is found
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
    // Restore the saved selection before applying the command
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
  
  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !showFontNameDropdown;
    setShowFontNameDropdown(newState);
    if (onToggle) onToggle(newState);
  };
  
  return (
    <div className="tw-relative" ref={dropdownRef}>
      <button 
        className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-flex tw-items-center tw-hover:tw-bg-purple-50 tw-transition-colors" 
        onClick={handleToggle}
        onMouseDown={(e) => e.preventDefault()}
        title="Font Family (Ctrl+Shift+Z)"
      >
        <Type size={16} />
        <span className="tw-ml-1">Font</span>
      </button>
      
      {showFontNameDropdown && (
        <div className="tw-absolute tw-z-10 tw-mt-1 tw-bg-white tw-border tw-border-purple-300 tw-rounded tw-shadow-lg tw-w-48">
          {fontNames.map(fontName => (
            <div 
              key={fontName} 
              className={`tw-px-4 tw-py-2 tw-cursor-pointer ${currentFontName === fontName ? 'tw-bg-purple-200' : 'hover:tw-bg-purple-100'}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFontNameSelect(fontName);
              }}
              onMouseDown={(e) => e.preventDefault()}
              style={{ fontFamily: fontName }}
            >
              {fontName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Text alignment dropdown with keyboard navigation
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
  
  // Sync with external state
  useEffect(() => {
    setShowAlignmentDropdown(isOpen || false);
  }, [isOpen]);
  
  // Handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAlignmentDropdown(false);
        if (onToggle) onToggle(false);
      }
    }

    if (showAlignmentDropdown) {
      // Save current selection when dropdown is opened
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
    // Restore the saved selection before applying the command
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
    
    // Update index
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

  // Expose methods through ref
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
  
  const CurrentIcon = getCurrentIcon();
  
  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !showAlignmentDropdown;
    setShowAlignmentDropdown(newState);
    if (onToggle) onToggle(newState);
  };
  
  return (
    <div className="tw-relative" ref={dropdownRef}>
      <button 
        className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-flex tw-items-center tw-hover:tw-bg-purple-50 tw-transition-colors" 
        onClick={handleToggle}
        onMouseDown={(e) => e.preventDefault()}
        title="Text Alignment (Ctrl+Shift+A)"
      >
        <CurrentIcon size={16} />
        <span className="tw-ml-1">Align</span>
      </button>
      
      {showAlignmentDropdown && (
        <div className="tw-absolute tw-z-10 tw-mt-1 tw-bg-white tw-border tw-border-purple-300 tw-rounded tw-shadow-lg tw-w-32">
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
              <div 
                key={option.value} 
                className={`tw-px-4 tw-py-2 tw-cursor-pointer tw-flex tw-items-center ${isSelected ? 'tw-bg-purple-200' : 'hover:tw-bg-purple-100'}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAlignmentSelect(option.value);
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Icon size={16} className="tw-mr-2" />
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

AlignmentButton.displayName = 'AlignmentButton';

export const HeadingButton = React.forwardRef(({ execCommand, onToggle, isOpen }, ref) => {
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [currentHeading, setCurrentHeading] = useState('normal');
  const savedSelectionRef = useRef(null);
  
  const headingOptions = [
    { value: 'normal', label: 'Normal Text', tag: 'p' },
    { value: 'h1', label: 'Heading 1', tag: 'h1' },
    { value: 'h2', label: 'Heading 2', tag: 'h2' },
    { value: 'h3', label: 'Heading 3', tag: 'h3' },
    { value: 'h4', label: 'Heading 4', tag: 'h4' }
  ];
  const dropdownRef = useRef(null);
  
  // Methods for direct heading application (for keyboard shortcuts)
  const applyHeading = (level) => {
    if (level === 'normal') {
      execCommand('formatBlock', '<p>');
    } else {
      execCommand('formatBlock', `<h${level}>`);
    }
    setCurrentHeading(level === 'normal' ? 'normal' : `h${level}`);
  };

  // Expose methods through ref
  React.useImperativeHandle(ref, () => ({
    applyH1: () => applyHeading(1),
    applyH2: () => applyHeading(2),
    applyH3: () => applyHeading(3),
    applyH4: () => applyHeading(4),
    applyNormal: () => applyHeading('normal')
  }));
  
  // Sync with external state
  useEffect(() => {
    setShowHeadingDropdown(isOpen || false);
  }, [isOpen]);
  
  // Handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowHeadingDropdown(false);
        if (onToggle) onToggle(false);
      }
    }
    
    if (showHeadingDropdown) {
      // Save the current selection when dropdown opens
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
        
        // Get current heading level
        try {
          const parentElement = selection.anchorNode.parentElement || selection.anchorNode;
          // Find the closest heading element
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
    // Restore the saved selection before applying the command
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
  
  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !showHeadingDropdown;
    setShowHeadingDropdown(newState);
    if (onToggle) onToggle(newState);
  };
  
  return (
    <div className="tw-relative" ref={dropdownRef}>
      <button 
        className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-flex tw-items-center tw-hover:tw-bg-purple-50 tw-transition-colors" 
        onClick={handleToggle}
        onMouseDown={(e) => e.preventDefault()}
        title="Heading (Ctrl+Shift+G)"
      >
        <Heading size={16} />
        <span className="tw-ml-1">{getCurrentLabel()}</span>
      </button>
      
      {showHeadingDropdown && (
        <div className="tw-absolute tw-z-10 tw-mt-1 tw-bg-white tw-border tw-border-purple-300 tw-rounded tw-shadow-lg tw-w-40">
          {headingOptions.map(option => {
            const isSelected = option.value === currentHeading;
            
            return (
              <div 
                key={option.value} 
                className={`tw-px-4 tw-py-2 tw-cursor-pointer tw-flex tw-items-center ${isSelected ? 'tw-bg-purple-200' : 'hover:tw-bg-purple-100'}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleHeadingSelect(option.value);
                }}
                onMouseDown={(e) => e.preventDefault()}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

HeadingButton.displayName = 'HeadingButton';

// Common buttons group
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
    <>
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
      <SubscriptButton onClick={() => execCommand('subscript')} />
      <SuperscriptButton onClick={() => execCommand('superscript')} />
      <HyperlinkButton onClick={handleHyperlink} />
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
    </>
  );
};