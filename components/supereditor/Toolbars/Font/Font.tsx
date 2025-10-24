// components/supereditor/Toolbars/Font/Font.tsx - Complete with All Active States
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Strikethrough, Subscript, Superscript, Link, Heading } from 'lucide-react';
import { ButtonGradient } from '../../../button/ButtonTemplate';

// Interface for tracking active formatting states
interface FormattingStates {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  subscript: boolean;
  superscript: boolean;
}

// Hook for tracking formatting states
const useFormattingStates = (editorRef: React.RefObject<HTMLDivElement>) => {
  const [states, setStates] = useState<FormattingStates>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    subscript: false,
    superscript: false,
  });

  const updateFormattingStates = useCallback(() => {
    if (!editorRef.current || typeof document === 'undefined') return;

    try {
      // Make sure the editor is focused to get accurate command states
      const isFocused = document.activeElement === editorRef.current || 
                       editorRef.current.contains(document.activeElement);
      
      if (!isFocused) return;

      // Check each formatting command
      const newStates = {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikethrough: document.queryCommandState('strikeThrough'),
        subscript: document.queryCommandState('subscript'),
        superscript: document.queryCommandState('superscript'),
      };

      // Only update if states have actually changed to prevent unnecessary re-renders
      setStates(prevStates => {
        const hasChanged = Object.keys(newStates).some(
          key => newStates[key as keyof FormattingStates] !== prevStates[key as keyof FormattingStates]
        );
        return hasChanged ? newStates : prevStates;
      });
    } catch (error) {
      console.warn('Error checking formatting states:', error);
    }
  }, [editorRef]);

  // Set up event listeners for selection changes
  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    
    const handleSelectionChange = () => {
      // Small delay to ensure DOM is updated
      setTimeout(updateFormattingStates, 10);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Update states after key operations
      setTimeout(updateFormattingStates, 10);
    };

    const handleMouseUp = () => {
      // Update states after mouse operations (selection changes)
      setTimeout(updateFormattingStates, 10);
    };

    const handleFocus = () => {
      // Update states when editor gains focus
      setTimeout(updateFormattingStates, 10);
    };

    const handleInput = () => {
      // Update states after content changes
      setTimeout(updateFormattingStates, 10);
    };

    // Add event listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    editor.addEventListener('keyup', handleKeyUp);
    editor.addEventListener('mouseup', handleMouseUp);
    editor.addEventListener('focus', handleFocus);
    editor.addEventListener('input', handleInput);

    // Initial check
    updateFormattingStates();

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      editor.removeEventListener('keyup', handleKeyUp);
      editor.removeEventListener('mouseup', handleMouseUp);
      editor.removeEventListener('focus', handleFocus);
      editor.removeEventListener('input', handleInput);
    };
  }, [editorRef, updateFormattingStates]);

  return { states, updateFormattingStates };
};

// Enhanced formatting button with active state
interface FormattingButtonProps {
  command: string;
  icon: React.ReactNode;
  tooltip: string;
  isActive?: boolean;
  onClick?: () => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  handleChange?: () => void;
}

const FormattingButton: React.FC<FormattingButtonProps> = ({ 
  command, 
  icon, 
  tooltip, 
  isActive = false, 
  onClick,
  editorRef,
  handleChange 
}) => {
  const handleClick = () => {
    if (editorRef?.current) {
      editorRef.current.focus();
      
      // Execute the command
      if (onClick) {
        onClick();
      } else {
        document.execCommand(command, false);
      }
      
      // Trigger change handler
      if (handleChange) {
        setTimeout(handleChange, 10);
      }
    }
  };

  return (
    <ButtonGradient
      action={isActive ? "apply" : "edit"}
      customIcon={icon}
      onClick={handleClick}
      size="md"
      showText={false}
      tooltip={tooltip}
      tooltipPosition="top"
      tooltipPortal={false}
      className={`tw-w-8 tw-h-8 tw-relative transition-all duration-200 ${
        isActive 
          ? 'tw-ring-2 tw-ring-purple-400 tw-ring-offset-1 tw-shadow-lg tw-scale-105' 
          : 'hover:tw-scale-105'
      }`}
      customColors={isActive ? {
        primary: '#7C3AED',
        secondary: '#6D28D9', 
        gradient1: '#7C3AED',
        gradient2: '#8B5CF6',
        text: '#FFFFFF'
      } : undefined}
    />
  );
};

// Font style buttons with active state tracking
export const BoldButton: React.FC<{
  onClick?: () => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  handleChange?: () => void;
}> = ({ onClick, editorRef, handleChange }) => {
  const { states } = useFormattingStates(editorRef || { current: null });

  return (
    <FormattingButton
      command="bold"
      icon={<Bold className="tw-w-4 tw-h-4" />}
      tooltip="Bold (Ctrl+B)"
      isActive={states.bold}
      onClick={onClick}
      editorRef={editorRef}
      handleChange={handleChange}
    />
  );
};

export const ItalicButton: React.FC<{
  onClick?: () => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  handleChange?: () => void;
}> = ({ onClick, editorRef, handleChange }) => {
  const { states } = useFormattingStates(editorRef || { current: null });

  return (
    <FormattingButton
      command="italic"
      icon={<Italic className="tw-w-4 tw-h-4" />}
      tooltip="Italic (Ctrl+I)"
      isActive={states.italic}
      onClick={onClick}
      editorRef={editorRef}
      handleChange={handleChange}
    />
  );
};

export const UnderlineButton: React.FC<{
  onClick?: () => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  handleChange?: () => void;
}> = ({ onClick, editorRef, handleChange }) => {
  const { states } = useFormattingStates(editorRef || { current: null });

  return (
    <FormattingButton
      command="underline"
      icon={<Underline className="tw-w-4 tw-h-4" />}
      tooltip="Underline (Ctrl+U)"
      isActive={states.underline}
      onClick={onClick}
      editorRef={editorRef}
      handleChange={handleChange}
    />
  );
};

export const StrikethroughButton: React.FC<{
  onClick?: () => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  handleChange?: () => void;
}> = ({ onClick, editorRef, handleChange }) => {
  const { states } = useFormattingStates(editorRef || { current: null });

  return (
    <FormattingButton
      command="strikeThrough"
      icon={<Strikethrough className="tw-w-4 tw-h-4" />}
      tooltip="Strikethrough (Ctrl+D)"
      isActive={states.strikethrough}
      onClick={onClick}
      editorRef={editorRef}
      handleChange={handleChange}
    />
  );
};

export const SubscriptButton: React.FC<{
  onClick?: () => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  handleChange?: () => void;
}> = ({ onClick, editorRef, handleChange }) => {
  const { states } = useFormattingStates(editorRef || { current: null });

  return (
    <FormattingButton
      command="subscript"
      icon={<Subscript className="tw-w-4 tw-h-4" />}
      tooltip="Subscript (Ctrl+Shift+_)"
      isActive={states.subscript}
      onClick={onClick}
      editorRef={editorRef}
      handleChange={handleChange}
    />
  );
};

export const SuperscriptButton: React.FC<{
  onClick?: () => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  handleChange?: () => void;
}> = ({ onClick, editorRef, handleChange }) => {
  const { states } = useFormattingStates(editorRef || { current: null });

  return (
    <FormattingButton
      command="superscript"
      icon={<Superscript className="tw-w-4 tw-h-4" />}
      tooltip="Superscript (Ctrl+Shift++)"
      isActive={states.superscript}
      onClick={onClick}
      editorRef={editorRef}
      handleChange={handleChange}
    />
  );
};

export const HyperlinkButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <ButtonGradient
    action="link"
    customIcon={<Link className="tw-w-4 tw-h-4" />}
    onClick={onClick}
    size="md"
    showText={false}
    tooltip="Insert Link (Ctrl+Shift+L)"
    tooltipPosition="top"
    tooltipPortal={false}
    className="tw-w-8 tw-h-8 tw-relative"
  />
);

// Font size dropdown with tooltip
export const FontSizeButton = React.forwardRef<any, {
  execCommand: (command: string, value?: string) => void;
  onToggle?: (isOpen: boolean) => void;
  isOpen?: boolean;
}>(({ execCommand, onToggle, isOpen }, ref) => {
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState('3');
  const fontSizes = ['1', '2', '3', '4', '5', '6', '7'];
  const dropdownRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  
  useEffect(() => {
    setShowFontSizeDropdown(isOpen || false);
  }, [isOpen]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFontSizeDropdown(false);
        if (onToggle) onToggle(false);
      }
    }
    
    if (showFontSizeDropdown) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
        
        try {
          const parentElement = selection.anchorNode?.parentElement;
          let currentElement = parentElement;
          while (currentElement && !currentElement.getAttribute('size') && 
                !currentElement.style.fontSize && 
                currentElement !== document.body) {
            currentElement = currentElement.parentElement;
          }
          
          if (currentElement && currentElement.getAttribute('size')) {
            setCurrentFontSize(currentElement.getAttribute('size') || '3');
          } else if (currentElement && currentElement.style.fontSize) {
            const pxSize = parseInt(currentElement.style.fontSize);
            if (!isNaN(pxSize)) {
              const sizeMap: { [key: number]: string } = {
                10: '1', 13: '2', 16: '3', 18: '4', 24: '5', 32: '6', 48: '7'
              };
              const closest = Object.keys(sizeMap).reduce((prev, curr) => {
                return (Math.abs(Number(curr) - pxSize) < Math.abs(Number(prev) - pxSize) ? curr : prev);
              }, '16');
              setCurrentFontSize(sizeMap[Number(closest)]);
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
  
  const handleFontSizeSelect = (size: string) => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
        
        execCommand('fontSize', size);
        savedSelectionRef.current = null;
      }
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
        tooltip={`Font Size: ${currentFontSize} (Ctrl+Shift+S or Ctrl++/-)`}
        tooltipPosition="top"
        tooltipPortal={false}
        className="tw-w-16 tw-h-8 tw-relative"
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

// Font name dropdown with tooltip
export const FontNameButton: React.FC<{
  execCommand: (command: string, value?: string) => void;
  onToggle?: (isOpen: boolean) => void;
  isOpen?: boolean;
}> = ({ execCommand, onToggle, isOpen }) => {
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  
  useEffect(() => {
    setShowFontNameDropdown(isOpen || false);
  }, [isOpen]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFontNameDropdown(false);
        if (onToggle) onToggle(false);
      }
    }
    
    if (showFontNameDropdown) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
        
        try {
          const parentElement = selection.anchorNode?.parentElement;
          let currentElement = parentElement;
          while (currentElement && !currentElement.getAttribute('face') && 
                !getComputedStyle(currentElement).fontFamily && 
                currentElement !== document.body) {
            currentElement = currentElement.parentElement;
          }
          
          if (currentElement && currentElement.getAttribute('face')) {
            setCurrentFontName(currentElement.getAttribute('face') || 'Arial');
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
  
  const handleFontNameSelect = (fontName: string) => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
        
        execCommand('fontName', fontName);
        savedSelectionRef.current = null;
      }
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
  
  const getShortFontName = (name: string) => {
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
        tooltip={`Font: ${currentFontName} (Ctrl+Shift+Z)`}
        tooltipPosition="top"
        tooltipPortal={false}
        className="tw-w-16 tw-h-8 tw-relative"
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

// Text alignment dropdown with tooltip
export const AlignmentButton = React.forwardRef<any, {
  execCommand: (command: string, value?: string) => void;
  onToggle?: (isOpen: boolean) => void;
  isOpen?: boolean;
}>(({ execCommand, onToggle, isOpen }, ref) => {
  const [showAlignmentDropdown, setShowAlignmentDropdown] = useState(false);
  const [currentAlignment, setCurrentAlignment] = useState('left');
  const [currentAlignmentIndex, setCurrentAlignmentIndex] = useState(0);
  const savedSelectionRef = useRef<Range | null>(null);

  const alignmentOptions = [
    { value: 'justifyLeft', label: 'Left', icon: AlignLeft },
    { value: 'justifyCenter', label: 'Center', icon: AlignCenter },
    { value: 'justifyRight', label: 'Right', icon: AlignRight },
    { value: 'justifyFull', label: 'Justify', icon: AlignJustify }
  ];
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setShowAlignmentDropdown(isOpen || false);
  }, [isOpen]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAlignmentDropdown(false);
        if (onToggle) onToggle(false);
      }
    }

    if (showAlignmentDropdown) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
      }

      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAlignmentDropdown, onToggle]);

  const handleAlignmentSelect = (alignmentValue: string) => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
        savedSelectionRef.current = null;
      }
    }

    execCommand(alignmentValue);

    const alignmentMap: { [key: string]: string } = {
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

  const cycleAlignment = (direction: 'next' | 'prev') => {
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
      const alignmentMap: { [key: string]: string } = {
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
      const alignmentMap: { [key: string]: string } = {
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
        tooltip={`Align ${getCurrentLabel()} (Ctrl+Shift+A or ↑/↓)`}
        tooltipPosition="top"
        tooltipPortal={false}
        className="tw-w-8 tw-h-8 tw-relative"
      />
      
      {showAlignmentDropdown && (
        <div className="tw-absolute tw-z-50 tw-mt-1 tw-bg-white tw-border-2 tw-border-purple-300 tw-rounded-xl tw-shadow-2xl tw-min-w-[150px]">
          <div className="tw-p-2">
            <div className="tw-text-xs tw-font-semibold tw-text-purple-700 tw-mb-2 tw-px-2">Text Alignment</div>
            <div className="tw-space-y-1">
              {alignmentOptions.map(option => {
                const Icon = option.icon;
                const alignmentMap: { [key: string]: string } = {
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

// Heading dropdown with tooltip
export const HeadingButton = React.forwardRef<any, {
  execCommand: (command: string, value?: string) => void;
  onToggle?: (isOpen: boolean) => void;
  isOpen?: boolean;
}>(({ execCommand, onToggle, isOpen }, ref) => {
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [currentHeading, setCurrentHeading] = useState('normal');
  const savedSelectionRef = useRef<Range | null>(null);
  
  const headingOptions = [
    { value: 'normal', label: 'Normal Text', tag: 'p', shortLabel: 'P' },
    { value: 'h1', label: 'Heading 1', tag: 'h1', shortLabel: 'H1' },
    { value: 'h2', label: 'Heading 2', tag: 'h2', shortLabel: 'H2' },
    { value: 'h3', label: 'Heading 3', tag: 'h3', shortLabel: 'H3' },
    { value: 'h4', label: 'Heading 4', tag: 'h4', shortLabel: 'H4' }
  ];
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const applyHeading = (level: number | 'normal') => {
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
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowHeadingDropdown(false);
        if (onToggle) onToggle(false);
      }
    }
    
    if (showHeadingDropdown) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
        
        try {
          const parentElement = selection.anchorNode?.parentElement || selection.anchorNode;
          let currentElement = parentElement as Element | null;
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
  
  const handleHeadingSelect = (headingValue: string) => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
        
        if (headingValue === 'normal') {
          execCommand('formatBlock', '<p>');
        } else {
          execCommand('formatBlock', `<${headingValue}>`);
        }
        savedSelectionRef.current = null;
      }
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
        tooltip={`${getCurrentLabel()} (Ctrl+Shift+G or Ctrl+Shift+1-4)`}
        tooltipPosition="top"
        tooltipPortal={false}
        className="tw-w-8 tw-h-8 tw-relative"
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

// Common buttons group using ButtonGradient with icon-only design and tooltips
export const FontButtons: React.FC<{
  execCommand: (command: string, value?: string) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  handleChange?: () => void;
  dropdownStates?: any;
  setDropdownStates?: any;
  fontSizeButtonRef?: any;
  alignmentButtonRef?: any;
  headingButtonRef?: any;
}> = ({ 
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
    const selectedText = selection?.toString();
    
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
        <UnderlineButton 
          onClick={() => execCommand('underline')}
          editorRef={editorRef}
          handleChange={handleChange}
        />
        <StrikethroughButton 
          onClick={() => execCommand('strikeThrough')}
          editorRef={editorRef}
          handleChange={handleChange}
        />
      </div>

      {/* Script Buttons */}
      <div className="tw-flex tw-gap-1 tw-items-center tw-bg-blue-50 tw-rounded-lg tw-p-1">
        <SubscriptButton 
          onClick={() => execCommand('subscript')}
          editorRef={editorRef}
          handleChange={handleChange}
        />
        <SuperscriptButton 
          onClick={() => execCommand('superscript')}
          editorRef={editorRef}
          handleChange={handleChange}
        />
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
          onToggle={(isOpen) => setDropdownStates && setDropdownStates((prev: any) => ({ ...prev, fontSize: isOpen }))}
        />
        <FontNameButton 
          execCommand={execCommand}
          isOpen={dropdownStates?.fontName || false}
          onToggle={(isOpen) => setDropdownStates && setDropdownStates((prev: any) => ({ ...prev, fontName: isOpen }))}
        />
      </div>

      {/* Text Structure */}
      <div className="tw-flex tw-gap-1 tw-items-center tw-bg-green-50 tw-rounded-lg tw-p-1">
        <HeadingButton 
          ref={headingButtonRef}
          execCommand={execCommand}
          isOpen={dropdownStates?.heading || false}
          onToggle={(isOpen) => setDropdownStates && setDropdownStates((prev: any) => ({ ...prev, heading: isOpen }))}
        />
        <AlignmentButton 
          ref={alignmentButtonRef}
          execCommand={execCommand}
          isOpen={dropdownStates?.alignment || false}
          onToggle={(isOpen) => setDropdownStates && setDropdownStates((prev: any) => ({ ...prev, alignment: isOpen }))}
        />
      </div>
    </div>
  );
};