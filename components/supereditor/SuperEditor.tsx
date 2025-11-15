'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { List, Image, Sigma, BookOpen } from 'lucide-react';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';

// Import KaTeX CSS
import 'katex/dist/katex.min.css';

// Import ButtonGradient for consistent styling
import { ButtonGradient } from '../button/ButtonTemplate';

// Dynamic imports for Font components
const BoldButton = dynamic(() => import('./Toolbars/Font/Font').then(mod => ({ default: mod.BoldButton })), { ssr: false });
const ItalicButton = dynamic(() => import('./Toolbars/Font/Font').then(mod => ({ default: mod.ItalicButton })), { ssr: false });
const UnderlineButton = dynamic(() => import('./Toolbars/Font/Font').then(mod => ({ default: mod.UnderlineButton })), { ssr: false });
const StrikethroughButton = dynamic(() => import('./Toolbars/Font/Font').then(mod => ({ default: mod.StrikethroughButton })), { ssr: false });
const SubscriptButton = dynamic(() => import('./Toolbars/Font/Font').then(mod => ({ default: mod.SubscriptButton })), { ssr: false });
const SuperscriptButton = dynamic(() => import('./Toolbars/Font/Font').then(mod => ({ default: mod.SuperscriptButton })), { ssr: false });
const HyperlinkButton = dynamic(() => import('./Toolbars/Font/Font').then(mod => ({ default: mod.HyperlinkButton })), { ssr: false });
const FontSizeButton = dynamic(() => import('./Toolbars/Font/Font').then(mod => ({ default: mod.FontSizeButton })), { ssr: false });
const FontNameButton = dynamic(() => import('./Toolbars/Font/Font').then(mod => ({ default: mod.FontNameButton })), { ssr: false });
const AlignmentButton = dynamic(() => import('./Toolbars/Font/Font').then(mod => ({ default: mod.AlignmentButton })), { ssr: false });
const HeadingButton = dynamic(() => import('./Toolbars/Font/Font').then(mod => ({ default: mod.HeadingButton })), { ssr: false });

// Dynamic imports for Color components
const ColorPicker = dynamic(() => import('./Toolbars/Color/Color').then(mod => ({ default: mod.default })), { ssr: false });
const TextColorButton = dynamic(() => import('./Toolbars/Color/Color').then(mod => ({ default: mod.TextColorButton })), { ssr: false });
const BackgroundColorButton = dynamic(() => import('./Toolbars/Color/Color').then(mod => ({ default: mod.BackgroundColorButton })), { ssr: false });

// Dynamic imports for other components
const EquationModal = dynamic(() => import('./Toolbars/Equation/Equation').catch(() => ({ default: () => null })), { 
  ssr: false,
  loading: () => null
});

const ImageModal = dynamic(() => import('./Toolbars/Images/Images').catch(() => ({ default: () => null })), { 
  ssr: false,
  loading: () => null
});

const CodeButton = dynamic(() => import('./Toolbars/Code/Code').then(mod => ({ default: mod.Button })), { ssr: false });
const CodeModal = dynamic(() => import('./Toolbars/Code/Code').then(mod => ({ default: mod.Modal })), { ssr: false });

const TableButton = dynamic(() => import('./Toolbars/Table/Table').then(mod => ({ default: mod.TableButton })), { ssr: false });
const TableModal = dynamic(() => import('./Toolbars/Table/Table').then(mod => ({ default: mod.TableModal })), { ssr: false });

const KeyConceptButton = dynamic(() => import('./Toolbars/Other/KeyConcept').then(mod => ({ default: mod.KeyConceptButton })), { ssr: false });
const KeyConceptStyleModal = dynamic(() => import('./Toolbars/Other/KeyConcept').then(mod => ({ default: mod.KeyConceptStyleModal })), { ssr: false });

const BulletListButton = dynamic(() => import('./Toolbars/List/List').then(mod => ({ default: mod.BulletListButton })), { ssr: false });
const NumberedListButton = dynamic(() => import('./Toolbars/List/List').then(mod => ({ default: mod.NumberedListButton })), { ssr: false });
const MultilevelListButton = dynamic(() => import('./Toolbars/List/List').then(mod => ({ default: mod.MultilevelListButton })), { ssr: false });

const HelpButton = dynamic(() => import('./Toolbars/Help/Help').then(mod => ({ default: mod.HelpButton })), { ssr: false });
const HelpModal = dynamic(() => import('./Toolbars/Help/Help').then(mod => ({ default: mod.HelpModal })), { ssr: false });

const PracticeButton = dynamic(() => import('./Toolbars/Practice/Practice').then(mod => ({ default: mod.PracticeButton })), { ssr: false });
const PracticeModal = dynamic(() => import('./Toolbars/Practice/Practice').then(mod => ({ default: mod.PracticeModal })), { ssr: false });

// Import Key Concept utilities
import { insertKeyConceptWithStyle } from './Toolbars/Other/KeyConcept';
import type { KeyConceptStyle } from './Toolbars/Other/KeyConcept';

// Portal component for high z-index elements
const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(children, document.body);
};

// Create gradient button components for Image and Equation
const ImageGradientButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <ButtonGradient
      action="custom"
      showText={false}
      customIcon={<Image className="tw-w-4 tw-h-4" />}
      onClick={onClick}
      size="sm"
      customColors={{
        primary: '#10B981',
        secondary: '#059669',
        gradient1: '#10B981',
        gradient2: '#34D399',
        text: '#FFFFFF'
      }}
      tooltip="Insert Image"
      tooltipPosition="top"
      tooltipPortal={true}
      className="tw-w-8 tw-h-8 tw-relative"
      tabIndex={-1}
    />
  );
};

const EquationGradientButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <ButtonGradient
      action="custom"
      showText={false}
      customIcon={<Sigma className="tw-w-4 tw-h-4" />}
      onClick={onClick}
      size="sm"
      customColors={{
        primary: '#F59E0B',
        secondary: '#D97706',
        gradient1: '#F59E0B',
        gradient2: '#FBBF24',
        text: '#FFFFFF'
      }}
      tooltip="Insert Equation (Ctrl+Shift+E)"
      tooltipPosition="top"
      tooltipPortal={true}
      className="tw-w-8 tw-h-8 tw-relative"
      tabIndex={-1}
    />
  );
};

interface SuperEditorProps {
  onChange?: (content: string) => void;
  initialValue?: string;
  editorId?: string | null;
  height?: string;
}

const SuperEditor: React.FC<SuperEditorProps> = ({ 
  onChange, 
  initialValue = '', 
  editorId = null,
  height = '200px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const backgroundColorPickerRef = useRef<HTMLDivElement>(null);
  const fontSizeButtonRef = useRef<any>(null);
  const alignmentButtonRef = useRef<any>(null);
  const headingButtonRef = useRef<any>(null);
  
  // Refs for color buttons
  const textColorButtonRef = useRef<HTMLButtonElement>(null);
  const backgroundColorButtonRef = useRef<HTMLButtonElement>(null);
  
  // CRITICAL: Content preservation refs
  const contentRef = useRef<string>(initialValue);
  const preventContentLoss = useRef<boolean>(false);
  const savedCursorPosition = useRef<{startOffset: number, endOffset: number, startContainer?: Node, endContainer?: Node} | null>(null);
  
  // Component loading states
  const [componentsLoaded, setComponentsLoaded] = useState<{
    equation: boolean;
    imageModal: boolean;
    color: boolean;
    font: boolean;
    code: boolean;
    table: boolean;
    keyConcept: boolean;
    listComponent: boolean;
    help: boolean;
    practice: boolean;
  }>({
    equation: false,
    imageModal: false,
    color: false,
    font: false,
    code: false,
    table: false,
    keyConcept: false,
    listComponent: false,
    help: false,
    practice: false
  });

  // Helper functions refs
  const helpersRef = useRef<{
    setupImageResizeHandlers?: any;
    handleImageInsertion?: any;
    EquationUtils?: any;
    applyTextColor?: any;
    applyBackgroundColor?: any;
    setupCodeBlockHandlers?: any;
    refreshAllCodeBlockHighlighting?: any;
    handleCodeInsertion?: any;
    updateCodeBlock?: any;
    getCodeStyles?: any;
    setupTableHandlers?: any;
    handleTableInsertion?: any;
    updateTableInEditor?: any;
    getTableStyles?: any;
    getKeyConceptStyles?: any;
    getListStyles?: any;
    insertPracticeQuestion?: any;
    getPracticeQuestionStyles?: any;
    setupPracticeQuestionHandlers?: any;
  }>({});
  
  // Memoize unique editor ID
  const uniqueEditorId = useMemo(() => 
    editorId || `editor-${Math.random().toString(36).substr(2, 9)}`, 
    [editorId]
  );
  
  const [content, setContent] = useState<string>(initialValue);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [showEquationModal, setShowEquationModal] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [showPracticeModal, setShowPracticeModal] = useState<boolean>(false);
  const [showKeyConceptModal, setShowKeyConceptModal] = useState<boolean>(false);
  const [currentTextColor, setCurrentTextColor] = useState<string>('#000000');
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState<string>('#ffffff');
  const [editingEquation, setEditingEquation] = useState<any>(null);
  const [isEditingEquation, setIsEditingEquation] = useState<boolean>(false);
  const [editingCode, setEditingCode] = useState<any>(null);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const [isEditorFocused, setIsEditorFocused] = useState<boolean>(false);
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState<boolean>(false);
  const [dropdownStates, setDropdownStates] = useState({
    fontSize: false,
    fontName: false,
    heading: false,
    alignment: false,
    bulletList: false,
    numberedList: false,
    multilevelList: false
  });
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ top: 0, left: 0 });
  const [backgroundColorPickerPosition, setBackgroundColorPickerPosition] = useState({ top: 0, left: 0 });

  // CRITICAL: Layout state - determine if toolbar should be at bottom
  const [isToolbarBottom, setIsToolbarBottom] = useState<boolean>(false);
  const layoutCheckRef = useRef<number>(0);

  // Load helper functions and track component loading
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load image helpers
      import('./Toolbars/Images/Images').then(module => {
        helpersRef.current.setupImageResizeHandlers = module.setupImageResizeHandlers;
        helpersRef.current.handleImageInsertion = module.handleImageInsertion;
        setComponentsLoaded(prev => ({ ...prev, imageModal: true }));
      }).catch(console.error);
      
      // Load equation helpers
      import('./Toolbars/Equation/Equation').then(module => {
        helpersRef.current.EquationUtils = module.EquationUtils;
        setComponentsLoaded(prev => ({ ...prev, equation: true }));
      }).catch(console.error);

      // Load color helpers
      import('./Toolbars/Color/Color').then(module => {
        helpersRef.current.applyTextColor = module.applyTextColor;
        helpersRef.current.applyBackgroundColor = module.applyBackgroundColor;
        setComponentsLoaded(prev => ({ ...prev, color: true }));
      }).catch(console.error);

      // Load code helpers
      import('./Toolbars/Code/Code').then(module => {
        helpersRef.current.setupCodeBlockHandlers = module.setupCodeBlockHandlers;
        helpersRef.current.refreshAllCodeBlockHighlighting = module.refreshAllCodeBlockHighlighting;
        helpersRef.current.handleCodeInsertion = module.handleCodeInsertion;
        helpersRef.current.updateCodeBlock = module.updateCodeBlock;
        helpersRef.current.getCodeStyles = module.getCodeStyles;
        setComponentsLoaded(prev => ({ ...prev, code: true }));
      }).catch(console.error);

      // Load table helpers
      import('./Toolbars/Table/Table').then(module => {
        helpersRef.current.setupTableHandlers = module.setupTableHandlers;
        helpersRef.current.handleTableInsertion = module.handleTableInsertion;
        helpersRef.current.updateTableInEditor = module.updateTableInEditor;
        helpersRef.current.getTableStyles = module.getTableStyles;
        setComponentsLoaded(prev => ({ ...prev, table: true }));
      }).catch(console.error);

      // Load key concept helpers
      import('./Toolbars/Other/KeyConcept').then(module => {
        helpersRef.current.getKeyConceptStyles = module.getKeyConceptStyles;
        setComponentsLoaded(prev => ({ ...prev, keyConcept: true }));
      }).catch(console.error);

      // Load list helpers
      import('./Toolbars/List/List').then(module => {
        helpersRef.current.getListStyles = module.getListStyles;
        setComponentsLoaded(prev => ({ ...prev, listComponent: true }));
      }).catch(console.error);

      // Load practice helpers
      import('./Toolbars/Practice/Practice').then(module => {
        helpersRef.current.insertPracticeQuestion = module.insertPracticeQuestion;
        helpersRef.current.getPracticeQuestionStyles = module.getPracticeQuestionStyles;
        helpersRef.current.setupPracticeQuestionHandlers = module.setupPracticeQuestionHandlers;
        setComponentsLoaded(prev => ({ ...prev, practice: true }));
      }).catch(console.error);

      // Mark font and help as loaded (they're always available)
      setComponentsLoaded(prev => ({ ...prev, font: true, help: true }));
    }
  }, []);

  // Responsive toolbar handler
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsToolbarCollapsed(true);
      } else {
        setIsToolbarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // CRITICAL: Content preservation during layout changes
  const preserveContent = useCallback(() => {
    if (editorRef.current) {
      contentRef.current = editorRef.current.innerHTML;
      
      // Save cursor position
      if (typeof window !== 'undefined') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          // Convert to text-based offsets for reliable restoration
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(editorRef.current);
          preCaretRange.setEnd(range.startContainer, range.startOffset);
          const startOffset = preCaretRange.toString().length;
          
          const preCaretRangeEnd = range.cloneRange();
          preCaretRangeEnd.selectNodeContents(editorRef.current);
          preCaretRangeEnd.setEnd(range.endContainer, range.endOffset);
          const endOffset = preCaretRangeEnd.toString().length;
          
          savedCursorPosition.current = {
            startOffset,
            endOffset,
            startContainer: range.startContainer,
            endContainer: range.endContainer
          };
        } else {
          savedCursorPosition.current = null;
        }
      }
    }
  }, []);

  const restoreContent = useCallback(() => {
    if (editorRef.current && contentRef.current) {
      preventContentLoss.current = true;
      editorRef.current.innerHTML = contentRef.current;
      
      // Restore cursor position after content is restored
      if (savedCursorPosition.current && typeof window !== 'undefined') {
        setTimeout(() => {
          const { startOffset, endOffset } = savedCursorPosition.current!;
          
          try {
            // Create a range to restore cursor position
            const range = document.createRange();
            const selection = window.getSelection();
            
            if (selection) {
              // Walk through text nodes to find the correct position
              const walker = document.createTreeWalker(
                editorRef.current!,
                NodeFilter.SHOW_TEXT,
                null
              );
              
              let currentOffset = 0;
              let startNode: Node | null = null;
              let endNode: Node | null = null;
              let startPos = 0;
              let endPos = 0;
              
              let node;
              while (node = walker.nextNode()) {
                const nodeLength = node.textContent?.length || 0;
                
                if (!startNode && currentOffset + nodeLength >= startOffset) {
                  startNode = node;
                  startPos = startOffset - currentOffset;
                }
                
                if (!endNode && currentOffset + nodeLength >= endOffset) {
                  endNode = node;
                  endPos = endOffset - currentOffset;
                  break;
                }
                
                currentOffset += nodeLength;
              }
              
              if (startNode && endNode) {
                range.setStart(startNode, Math.min(startPos, startNode.textContent?.length || 0));
                range.setEnd(endNode, Math.min(endPos, endNode.textContent?.length || 0));
                
                selection.removeAllRanges();
                selection.addRange(range);
              } else if (startNode) {
                // Fallback: place cursor at start position
                range.setStart(startNode, Math.min(startPos, startNode.textContent?.length || 0));
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
              } else {
                // Fallback: place cursor at end of editor
                range.selectNodeContents(editorRef.current!);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
          } catch (error) {
            console.warn('Error restoring cursor position:', error);
            // Fallback: focus editor and place cursor at end
            if (editorRef.current) {
              editorRef.current.focus();
              const range = document.createRange();
              const selection = window.getSelection();
              if (selection) {
                range.selectNodeContents(editorRef.current);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
          }
        }, 50); // Small delay to ensure DOM is ready
      }
      
      // Re-setup handlers after content restoration
      setTimeout(() => {
        if (componentsLoaded.code && helpersRef.current.refreshAllCodeBlockHighlighting) {
          try {
            helpersRef.current.refreshAllCodeBlockHighlighting(editorRef);
          } catch (error) {
            console.warn('Error refreshing code highlighting:', error);
          }
        }
        if (componentsLoaded.table && helpersRef.current.setupTableHandlers) {
          try {
            helpersRef.current.setupTableHandlers(editorRef);
          } catch (error) {
            console.warn('Error setting up table handlers:', error);
          }
        }
        preventContentLoss.current = false;
      }, 100);
    }
  }, [componentsLoaded]);

  // Debounced change handler with content preservation
  const debouncedHandleChange = useMemo(() => {
    let timeout: NodeJS.Timeout;
    return (onChangeCallback?: (content: string) => void) => {
      // Skip if we're in content preservation mode
      if (preventContentLoss.current) return;
      
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (editorRef.current) {
          const newContent = editorRef.current.innerHTML;
          contentRef.current = newContent; // Always keep ref updated
          setContent(newContent);
          if (onChangeCallback) onChangeCallback(newContent);

          // Re-setup handlers
          if (componentsLoaded.imageModal && helpersRef.current.setupImageResizeHandlers) {
            try {
              helpersRef.current.setupImageResizeHandlers(editorRef, () => debouncedHandleChange(onChangeCallback));
            } catch (error) {
              console.warn('Error re-setting up image handlers:', error);
            }
          }

          if (componentsLoaded.code && helpersRef.current.refreshAllCodeBlockHighlighting) {
            try {
              helpersRef.current.refreshAllCodeBlockHighlighting(editorRef);
            } catch (error) {
              console.warn('Error refreshing code highlighting:', error);
            }
          }
          if (componentsLoaded.table && helpersRef.current.setupTableHandlers) {
            try {
              helpersRef.current.setupTableHandlers(editorRef);
            } catch (error) {
              console.warn('Error setting up table handlers:', error);
            }
          }
          if (componentsLoaded.practice && helpersRef.current.setupPracticeQuestionHandlers) {
            try {
              helpersRef.current.setupPracticeQuestionHandlers(editorRef);
            } catch (error) {
              console.warn('Error setting up practice question handlers:', error);
            }
          }
        }
      }, 50);
    };
  }, [componentsLoaded]);

  const handleChange = useCallback(() => {
    debouncedHandleChange(onChange);
  }, [debouncedHandleChange, onChange]);

  const execCommand = useCallback((command: string, value: string | null = null) => {
    if (editorRef.current && typeof document !== 'undefined') {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleChange();
    }
  }, [handleChange]);

  // CRITICAL: Layout detection logic with content preservation
  const checkToolbarLayout = useCallback(() => {
    if (!containerRef.current || typeof window === 'undefined') return;
    
    const now = Date.now();
    // Throttle layout checks to prevent excessive calculations
    if (now - layoutCheckRef.current < 200) return;
    layoutCheckRef.current = now;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Determine if container is tall enough to warrant bottom toolbar
    // Use a more conservative threshold to prevent constant switching
    const shouldBeBottom = containerRect.height > viewportHeight * 0.8;
    
    if (shouldBeBottom !== isToolbarBottom) {
      // Preserve content before layout change
      preserveContent();
      setIsToolbarBottom(shouldBeBottom);
      
      // Schedule content restoration after layout change
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          restoreContent();
        });
      });
    }
  }, [isToolbarBottom, preserveContent, restoreContent]);

  // Throttled layout check
  const throttledLayoutCheck = useMemo(() => {
    let rafId: number | null = null;
    
    return () => {
      if (rafId || typeof window === 'undefined') return;
      
      rafId = requestAnimationFrame(() => {
        checkToolbarLayout();
        rafId = null;
      });
    };
  }, [checkToolbarLayout]);

  // Layout check on scroll and resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let scrollTimeout: NodeJS.Timeout;
    let resizeTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        throttledLayoutCheck();
      }, 100);
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        throttledLayoutCheck();
      }, 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Initial check
    throttledLayoutCheck();
    
    return () => {
      clearTimeout(scrollTimeout);
      clearTimeout(resizeTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [throttledLayoutCheck]);

  const saveSelectionRange = useCallback((): Range | null => {
    if (typeof window === 'undefined') return null;
    const sel = window.getSelection();
    return sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
  }, []);

  const restoreSelectionRange = useCallback((range: Range) => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, []);

  const saveSelection = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedSelection(sel.getRangeAt(0));
    }
  }, []);

  // Skip to editor functionality
  const skipToEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, []);

  const handleToolbarKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.altKey && event.key.toLowerCase() === 'e') {
      event.preventDefault();
      skipToEditor();
    } else if (event.key === 'Tab' && !event.shiftKey) {
      const target = event.target as HTMLElement;
      if (target.closest('.toolbar-group:last-child')) {
        event.preventDefault();
        skipToEditor();
      }
    }
  }, [skipToEditor]);

  // Element detection functions
  const findTextColorButton = useCallback((): HTMLElement | null => {
    if (textColorButtonRef.current && typeof textColorButtonRef.current === 'object' && 'getBoundingClientRect' in textColorButtonRef.current) {
      return textColorButtonRef.current as HTMLElement;
    }
    
    if (containerRef.current) {
      const buttonElement = containerRef.current.querySelector('.text-color-picker-button button') as HTMLElement;
      if (buttonElement) {
        return buttonElement;
      }
    }
    
    return null;
  }, []);

  const findBackgroundColorButton = useCallback((): HTMLElement | null => {
    if (backgroundColorButtonRef.current && typeof backgroundColorButtonRef.current === 'object' && 'getBoundingClientRect' in backgroundColorButtonRef.current) {
      return backgroundColorButtonRef.current as HTMLElement;
    }
    
    if (containerRef.current) {
      const buttonElement = containerRef.current.querySelector('.background-color-picker-button button') as HTMLElement;
      if (buttonElement) {
        return buttonElement;
      }
    }
    
    return null;
  }, []);

  // Color picker positioning
  const updateColorPickerPosition = useCallback((triggerElement: HTMLElement) => {
    if (!triggerElement || typeof window === 'undefined') {
      setColorPickerPosition({ top: 100, left: 100 });
      return;
    }

    try {
      const buttonRect = triggerElement.getBoundingClientRect();
      const pickerWidth = 350;
      const pickerHeight = 450;
      const gap = 8;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let top = buttonRect.bottom + gap;
      let left = buttonRect.left;
      
      if (left + pickerWidth > viewportWidth) {
        left = Math.max(16, buttonRect.right - pickerWidth);
      }
      
      if (top + pickerHeight > viewportHeight && top - pickerHeight - gap > 0) {
        top = buttonRect.top - pickerHeight - gap;
      }
      
      top = Math.max(16, Math.min(top, viewportHeight - pickerHeight - 16));
      left = Math.max(16, Math.min(left, viewportWidth - pickerWidth - 16));

      setColorPickerPosition({ top, left });
    } catch (error) {
      console.error('Error calculating color picker position:', error);
      setColorPickerPosition({ top: 100, left: 100 });
    }
  }, []);

  const updateBackgroundColorPickerPosition = useCallback((triggerElement: HTMLElement) => {
    if (!triggerElement || typeof window === 'undefined') {
      setBackgroundColorPickerPosition({ top: 100, left: 100 });
      return;
    }

    try {
      const buttonRect = triggerElement.getBoundingClientRect();
      const pickerWidth = 350;
      const pickerHeight = 450;
      const gap = 8;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let top = buttonRect.bottom + gap;
      let left = buttonRect.left;
      
      if (left + pickerWidth > viewportWidth) {
        left = Math.max(16, buttonRect.right - pickerWidth);
      }
      
      if (top + pickerHeight > viewportHeight && top - pickerHeight - gap > 0) {
        top = buttonRect.top - pickerHeight - gap;
      }
      
      top = Math.max(16, Math.min(top, viewportHeight - pickerHeight - 16));
      left = Math.max(16, Math.min(left, viewportWidth - pickerWidth - 16));

      setBackgroundColorPickerPosition({ top, left });
    } catch (error) {
      console.error('Error calculating background color picker position:', error);
      setBackgroundColorPickerPosition({ top: 100, left: 100 });
    }
  }, []);

  const handleHyperlinkShortcut = useCallback(() => {
    if (typeof window === 'undefined') return;
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
  }, [execCommand]);

  const handleKeyConceptShortcut = useCallback(() => {
    saveSelection();
    setShowKeyConceptModal(true);
  }, [saveSelection]);

  const handleEscapeKey = useCallback(() => {
    setShowColorPicker(false);
    setShowBackgroundColorPicker(false);
    setShowTableModal(false);
    setShowHelpModal(false);
    setShowKeyConceptModal(false);
    setDropdownStates({
      fontSize: false,
      fontName: false,
      heading: false,
      alignment: false,
      bulletList: false,
      numberedList: false,
      multilevelList: false
    });
  }, []);

  // Keyboard shortcuts
  const keyboardShortcuts = useMemo(() => ({
    'ctrl+shift+p': () => !showHelpModal && setShowHelpModal(true),
    'ctrl+shift+s': () => !dropdownStates.fontSize && (saveSelection(), setDropdownStates(prev => ({ ...prev, fontSize: true }))),
    'ctrl++': () => fontSizeButtonRef.current?.increaseFontSize?.(),
    'ctrl+=': () => fontSizeButtonRef.current?.increaseFontSize?.(),
    'ctrl+-': () => fontSizeButtonRef.current?.decreaseFontSize?.(),
    'ctrl+shift+z': () => !dropdownStates.fontName && (saveSelection(), setDropdownStates(prev => ({ ...prev, fontName: true }))),
    'ctrl+shift+g': () => !dropdownStates.heading && (saveSelection(), setDropdownStates(prev => ({ ...prev, heading: true }))),
    'ctrl+shift+1': () => headingButtonRef.current?.applyH1?.(),
    'ctrl+shift+2': () => headingButtonRef.current?.applyH2?.(),
    'ctrl+shift+3': () => headingButtonRef.current?.applyH3?.(),
    'ctrl+shift+4': () => headingButtonRef.current?.applyH4?.(),
    'ctrl+d': () => execCommand('strikeThrough'),
    'ctrl+shift+_': () => execCommand('subscript'),
    'ctrl+shift++': () => execCommand('superscript'),
    'ctrl+shift+l': () => handleHyperlinkShortcut(),
    'ctrl+shift+a': () => !dropdownStates.alignment && (saveSelection(), setDropdownStates(prev => ({ ...prev, alignment: true }))),
    'ctrl+shift+arrowup': () => alignmentButtonRef.current?.cyclePrev?.(),
    'ctrl+shift+arrowdown': () => alignmentButtonRef.current?.cycleNext?.(),
    'ctrl+shift+b': () => !showTableModal && (saveSelection(), setShowTableModal(true)),
    'ctrl+shift+f': () => !showColorPicker && (saveSelection(), setShowColorPicker(true), setShowBackgroundColorPicker(false)),
    'ctrl+shift+h': () => !showBackgroundColorPicker && (saveSelection(), setShowBackgroundColorPicker(true), setShowColorPicker(false)),
    'ctrl+shift+q': () => !dropdownStates.bulletList && (saveSelection(), setDropdownStates(prev => ({ ...prev, bulletList: true, numberedList: false, multilevelList: false }))),
    'ctrl+shift+e': () => !dropdownStates.numberedList && (saveSelection(), setDropdownStates(prev => ({ ...prev, numberedList: true, bulletList: false, multilevelList: false }))),
    'ctrl+shift+m': () => !dropdownStates.multilevelList && (saveSelection(), setDropdownStates(prev => ({ ...prev, multilevelList: true, bulletList: false, numberedList: false }))),
    'ctrl+shift+k': () => handleKeyConceptShortcut(),
    'alt+e': () => skipToEditor(),
    'escape': () => handleEscapeKey()
  }), [showHelpModal, dropdownStates, showColorPicker, showBackgroundColorPicker, showTableModal, saveSelection, execCommand, handleHyperlinkShortcut, handleKeyConceptShortcut, handleEscapeKey, skipToEditor]);

  // Create key combination string
  const getKeyCombo = useCallback((event: KeyboardEvent): string => {
    const parts: string[] = [];
    if (event.ctrlKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    
    let key = event.key.toLowerCase();
    if (event.key >= '1' && event.key <= '4') {
      key = event.key;
    }
    
    parts.push(key);
    return parts.join('+');
  }, []);

  // Global keyboard shortcut handler
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const isEditorActive = isEditorFocused || 
                            (containerRef.current && containerRef.current.contains(document.activeElement));
      
      if (!isEditorActive) return;
      
      const keyCombo = getKeyCombo(event);
      const handler = keyboardShortcuts[keyCombo];
      
      if (handler) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        handler();
        return false;
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
    };
  }, [isEditorFocused, keyboardShortcuts, getKeyCombo]);

  // Click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    
    if (showColorPicker && colorPickerRef.current && !colorPickerRef.current.contains(target)) {
      const colorButton = target.closest('.text-color-picker-button');
      if (!colorButton || !containerRef.current?.contains(colorButton)) {
        setShowColorPicker(false);
      }
    }
    
    if (showBackgroundColorPicker && backgroundColorPickerRef.current && !backgroundColorPickerRef.current.contains(target)) {
      const backgroundColorButton = target.closest('.background-color-picker-button');
      if (!backgroundColorButton || !containerRef.current?.contains(backgroundColorButton)) {
        setShowBackgroundColorPicker(false);
      }
    }
  }, [showColorPicker, showBackgroundColorPicker]);

  useEffect(() => {
    if ((showColorPicker || showBackgroundColorPicker) && typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }
  }, [showColorPicker, showBackgroundColorPicker, handleClickOutside]);

  // Setup effect for handlers
  useEffect(() => {
    if (!editorRef.current || typeof window === 'undefined') return;

    // Make React and ReactDOM available globally for table floater
    if (typeof window !== 'undefined') {
      (window as any).React = React;
      if (typeof (window as any).ReactDOM !== 'undefined' && (window as any).ReactDOM.createRoot) {
        (window as any).ReactDOM = {
          render: (element: React.ReactElement, container: HTMLElement) => {
            if (!(container as any)._reactRoot) {
              (container as any)._reactRoot = (window as any).ReactDOM.createRoot(container);
            }
            (container as any)._reactRoot.render(element);
          }
        };
      } else if (typeof (window as any).ReactDOM !== 'undefined') {
        (window as any).ReactDOM = (window as any).ReactDOM;
      }
    }

    // Setup handlers when available
    if (helpersRef.current.setupImageResizeHandlers) {
      try {
        helpersRef.current.setupImageResizeHandlers(editorRef, handleChange);
      } catch (error) {
        console.warn('Error setting up image resize handlers:', error);
      }
    }
    
    if (helpersRef.current.EquationUtils) {
      try {
        helpersRef.current.EquationUtils.setupEquationHandlers(
          editorRef,
          setEditingEquation,
          setIsEditingEquation,
          setShowEquationModal,
          handleChange
        );
      } catch (error) {
        console.warn('Error setting up equation handlers:', error);
      }
    }
    
    if (componentsLoaded.code && helpersRef.current.setupCodeBlockHandlers) {
      try {
        helpersRef.current.setupCodeBlockHandlers(
          editorRef,
          setEditingCode,
          setShowCodeModal
        );
      } catch (error) {
        console.warn('Error setting up code handlers:', error);
      }
    }
    
    if (componentsLoaded.table && helpersRef.current.setupTableHandlers) {
      try {
        helpersRef.current.setupTableHandlers(editorRef);
      } catch (error) {
        console.warn('Error setting up table handlers:', error);
      }
    }
    
    const handleEditTable = (event: CustomEvent) => {
      const table = event.detail.table;
      setEditingTable(table);
      setShowTableModal(true);
    };

    editorRef.current.addEventListener('editTable', handleEditTable as EventListener);
    
    return () => {
      if (editorRef.current && (editorRef.current as any)._imageObserver) {
        (editorRef.current as any)._imageObserver.disconnect();
      }
      
      if (editorRef.current) {
        editorRef.current.removeEventListener('editTable', handleEditTable as EventListener);
      }
      
      // Cleanup any existing floaters
      const existingFloaters = document.querySelectorAll('.cte-table-floater');
      existingFloaters.forEach(floater => {
        const container = floater.parentElement;
        if (container && (container as any)._reactRoot) {
          (container as any)._reactRoot.unmount();
        }
        container?.remove();
      });
    };
  }, [content, handleChange, componentsLoaded]);

  // Initialize editor content with preservation
  useEffect(() => {
    if (!editorRef.current || typeof document === 'undefined') return;

    // Only set content if:
    // 1. It's the first load (contentRef is empty), OR
    // 2. Editor is NOT focused (user is not typing)
    const isEditorFocused = document.activeElement === editorRef.current;
    
    if (
      (contentRef.current === '' && initialValue !== '') ||
      (!isEditorFocused && editorRef.current.innerHTML !== initialValue)
    ) {
      contentRef.current = initialValue;
      editorRef.current.innerHTML = initialValue;

      // Re-apply all handlers
      const timer = setTimeout(() => {
        if (componentsLoaded.code && helpersRef.current.refreshAllCodeBlockHighlighting) {
          helpersRef.current.refreshAllCodeBlockHighlighting(editorRef);
        }
        if (componentsLoaded.table && helpersRef.current.setupTableHandlers) {
          helpersRef.current.setupTableHandlers(editorRef);
        }
        if (componentsLoaded.practice && helpersRef.current.setupPracticeQuestionHandlers) {
          helpersRef.current.setupPracticeQuestionHandlers(editorRef);
        }
        if (componentsLoaded.imageModal && helpersRef.current.setupImageResizeHandlers) {
          helpersRef.current.setupImageResizeHandlers(editorRef, handleChange);
        }
        if (helpersRef.current.EquationUtils) {
          helpersRef.current.EquationUtils.setupEquationHandlers(
            editorRef,
            setEditingEquation,
            setIsEditingEquation,
            setShowEquationModal,
            handleChange
          );
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [initialValue, componentsLoaded, handleChange]);

  // Event handlers
  const handleTextColor = useCallback((color: string) => {
    const currentRange = savedSelection || saveSelectionRange();
    setCurrentTextColor(color);

    if (currentRange) {
      restoreSelectionRange(currentRange);
    }

    if (componentsLoaded.color && helpersRef.current.applyTextColor) {
      try {
        helpersRef.current.applyTextColor(color, editorRef, handleChange);
      } catch (error) {
        console.warn('Error applying text color:', error);
      }
    }
    setShowColorPicker(false);
    setSavedSelection(saveSelectionRange());
  }, [savedSelection, saveSelectionRange, restoreSelectionRange, handleChange, componentsLoaded.color]);

  const handleBackgroundColor = useCallback((color: string) => {
    const currentRange = savedSelection || saveSelectionRange();
    setCurrentBackgroundColor(color);

    if (currentRange) {
      restoreSelectionRange(currentRange);
    }

    if (componentsLoaded.color && helpersRef.current.applyBackgroundColor) {
      try {
        helpersRef.current.applyBackgroundColor(color, editorRef, handleChange);
      } catch (error) {
        console.warn('Error applying background color:', error);
      }
    }
    setShowBackgroundColorPicker(false);
    setSavedSelection(saveSelectionRange());
  }, [savedSelection, saveSelectionRange, restoreSelectionRange, handleChange, componentsLoaded.color]);

  const handleImageInsert = useCallback((imageData: any) => {
    if (helpersRef.current.handleImageInsertion && helpersRef.current.handleImageInsertion(imageData, execCommand)) {
      setShowImageModal(false);
      setTimeout(() => {
        if (helpersRef.current.setupImageResizeHandlers) {
          helpersRef.current.setupImageResizeHandlers(editorRef, handleChange);
        }
      }, 100);
    }
  }, [execCommand, handleChange]);

  const handleEquationSubmit = useCallback((equationData: any) => {
    try {
      if (helpersRef.current.EquationUtils) {
        helpersRef.current.EquationUtils.handleEquationSubmit(
          equationData,
          {
            editingEquation,
            isEditingEquation,
            savedSelection,
            setShowEquationModal,
            setEditingEquation,
            setSavedSelection,
            setIsEditingEquation,
            setupEquationHandlers: () => helpersRef.current.EquationUtils && helpersRef.current.EquationUtils.setupEquationHandlers(
              editorRef,
              setEditingEquation,
              setIsEditingEquation,
              setShowEquationModal,
              handleChange
            ),
            handleChange
          }
        );
      }
      if (editorRef.current) {
        setTimeout(() => {
          editorRef.current?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Error handling equation submission:', error);
    }
  }, [editingEquation, isEditingEquation, savedSelection, handleChange]);

  const handleEquationDelete = useCallback(() => {
    if (helpersRef.current.EquationUtils) {
      try {
        helpersRef.current.EquationUtils.deleteEquation(
          editingEquation, 
          setShowEquationModal, 
          setEditingEquation, 
          setIsEditingEquation, 
          handleChange
        );
      } catch (error) {
        console.warn('Error deleting equation:', error);
      }
    }
  }, [editingEquation, handleChange]);

  const handleCodeSubmit = useCallback((codeData: any) => {
    try {
      if (!componentsLoaded.code) return;
      
      if (editingCode) {
        if (helpersRef.current.updateCodeBlock) {
          helpersRef.current.updateCodeBlock(
            codeData,
            editingCode,
            editorRef,
            setShowCodeModal,
            setEditingCode,
            handleChange
          );
        }
      } else {
        if (savedSelection && typeof window !== 'undefined') {
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(savedSelection);
          }
        }
        
        if (helpersRef.current.handleCodeInsertion) {
          helpersRef.current.handleCodeInsertion(
            codeData,
            editorRef,
            setShowCodeModal,
            handleChange
          );
        }
        
        setTimeout(() => {
          if (helpersRef.current.refreshAllCodeBlockHighlighting) {
            helpersRef.current.refreshAllCodeBlockHighlighting(editorRef);
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error handling code submission:', error);
    }
  }, [editingCode, savedSelection, handleChange, componentsLoaded.code]);

  const handleTableSubmit = useCallback((tableData: any) => {
    try {
      if (!componentsLoaded.table) return;
      
      if (editingTable) {
        if (helpersRef.current.updateTableInEditor) {
          helpersRef.current.updateTableInEditor(
            tableData,
            editingTable,
            editorRef,
            setShowTableModal,
            setEditingTable,
            handleChange
          );
        }
      } else {
        if (savedSelection && typeof window !== 'undefined') {
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(savedSelection);
          }
        }
        
        if (helpersRef.current.handleTableInsertion) {
          helpersRef.current.handleTableInsertion(
            tableData,
            editorRef,
            setShowTableModal,
            handleChange
          );
        }
      }
    } catch (error) {
      console.error('Error handling table submission:', error);
    }
  }, [editingTable, savedSelection, handleChange, componentsLoaded.table]);

  const handleKeyConceptInsert = useCallback(() => {
    saveSelection();
    setShowKeyConceptModal(true);
  }, [saveSelection]);

  const handleKeyConceptStyleSelect = useCallback((style: KeyConceptStyle) => {
    // Restore selection if saved
    if (savedSelection) {
      restoreSelectionRange(savedSelection);
    }
    
    // Insert with selected style
    if (componentsLoaded.keyConcept) {
      try {
        insertKeyConceptWithStyle(editorRef, handleChange, style);
      } catch (error) {
        console.warn('Error inserting key concept:', error);
      }
    }
    
    // Close modal
    setShowKeyConceptModal(false);
    setSavedSelection(null);
  }, [savedSelection, restoreSelectionRange, handleChange, componentsLoaded.keyConcept]);

  const handlePracticeInsert = useCallback((questionData: any) => {
    if (savedSelection) {
      restoreSelectionRange(savedSelection);
    }
    if (componentsLoaded.practice && helpersRef.current.insertPracticeQuestion) {
      try {
        helpersRef.current.insertPracticeQuestion({ editorRef, handleChange, questionData });
      } catch (error) {
        console.warn('Error inserting practice question:', error);
      }
    }
    setSavedSelection(null);
  }, [savedSelection, restoreSelectionRange, handleChange, componentsLoaded.practice]);

  const handlePaste = useCallback(() => {
    setTimeout(() => {
      if (componentsLoaded.code && helpersRef.current.refreshAllCodeBlockHighlighting) {
        try {
          helpersRef.current.refreshAllCodeBlockHighlighting(editorRef);
        } catch (error) {
          console.warn('Error refreshing code highlighting:', error);
        }
      }
      if (componentsLoaded.table && helpersRef.current.setupTableHandlers) {
        try {
          helpersRef.current.setupTableHandlers(editorRef);
        } catch (error) {
          console.warn('Error setting up table handlers:', error);
        }
      }
    }, 100);
  }, [componentsLoaded]);

  const handleEditorFocus = useCallback(() => {
    setIsEditorFocused(true);
    if (typeof document !== 'undefined') {
      document.execCommand('styleWithCSS', false, 'true');
    }
    setSavedSelection(saveSelectionRange());
  }, [saveSelectionRange]);

  const handleEditorBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    const relatedTarget = event.relatedTarget as Element;
    if (relatedTarget && containerRef.current?.contains(relatedTarget)) {
      return;
    }
    
    setTimeout(() => {
      if (typeof document !== 'undefined' && !containerRef.current?.contains(document.activeElement)) {
        setIsEditorFocused(false);
        handleChange();
      }
    }, 100);
  }, [handleChange]);

  // Color button click handlers
  const handleTextColorClick = useCallback(() => {
    saveSelection();
    
    setTimeout(() => {
      const buttonElement = findTextColorButton();
      
      if (buttonElement) {
        updateColorPickerPosition(buttonElement);
        setShowColorPicker(!showColorPicker);
        setShowBackgroundColorPicker(false);
      } else {
        setShowColorPicker(!showColorPicker);
        setShowBackgroundColorPicker(false);
      }
    }, 10);
  }, [saveSelection, findTextColorButton, updateColorPickerPosition, showColorPicker]);

  const handleBackgroundColorClick = useCallback(() => {
    saveSelection();
    
    setTimeout(() => {
      const buttonElement = findBackgroundColorButton();
      
      if (buttonElement) {
        updateBackgroundColorPickerPosition(buttonElement);
        setShowBackgroundColorPicker(!showBackgroundColorPicker);
        setShowColorPicker(false);
      } else {
        setShowBackgroundColorPicker(!showBackgroundColorPicker);
        setShowColorPicker(false);
      }
    }, 10);
  }, [saveSelection, findBackgroundColorButton, updateBackgroundColorPickerPosition, showBackgroundColorPicker]);

  // CRITICAL: Memoized toolbar component to prevent re-renders
  const ToolbarComponent = useMemo(() => (
    <div 
      ref={toolbarRef}
      className="toolbar-container tw-transition-all tw-duration-200"
      onKeyDown={handleToolbarKeyDown}
    >
      {/* Text Formatting Group */}
      <div className="toolbar-group">
        <div className="toolbar-group-label">Format</div>
        <BoldButton 
          onClick={() => execCommand('bold')} 
          editorRef={editorRef}
          handleChange={handleChange}
          tabIndex={-1}
        />
        <ItalicButton 
          onClick={() => execCommand('italic')} 
          editorRef={editorRef}
          handleChange={handleChange}
          tabIndex={-1}
        />
        <UnderlineButton 
          onClick={() => execCommand('underline')} 
          tabIndex={-1}
        />
        <StrikethroughButton 
          onClick={() => execCommand('strikeThrough')} 
          tabIndex={-1}
        />
        <SubscriptButton 
          onClick={() => execCommand('subscript')} 
          tabIndex={-1}
        />
        <SuperscriptButton 
          onClick={() => execCommand('superscript')} 
          tabIndex={-1}
        />
        <HyperlinkButton 
          onClick={() => {
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
          }} 
          tabIndex={-1}
        />
      </div>

      {/* Font & Typography Group */}
      <div className="toolbar-group">
        <div className="toolbar-group-label">Font</div>
        <FontSizeButton 
          ref={fontSizeButtonRef}
          execCommand={execCommand}
          isOpen={dropdownStates?.fontSize || false}
          onToggle={(isOpen) => setDropdownStates && setDropdownStates(prev => ({ ...prev, fontSize: isOpen }))}
          tabIndex={-1}
        />
        <FontNameButton 
          execCommand={execCommand}
          isOpen={dropdownStates?.fontName || false}
          onToggle={(isOpen) => setDropdownStates && setDropdownStates(prev => ({ ...prev, fontName: isOpen }))}
          tabIndex={-1}
        />
        <HeadingButton 
          ref={headingButtonRef}
          execCommand={execCommand}
          isOpen={dropdownStates?.heading || false}
          onToggle={(isOpen) => setDropdownStates && setDropdownStates(prev => ({ ...prev, heading: isOpen }))}
          tabIndex={-1}
        />
      </div>

      {/* Text Color Group with proper ref setup */}
      <div className="toolbar-group">
        <div className="toolbar-group-label">Color</div>
        <div className="tw-relative text-color-picker-button">
          <TextColorButton 
            ref={textColorButtonRef}
            onClick={handleTextColorClick}
            currentColor={currentTextColor}
            tabIndex={-1}
          />
        </div>
        
        <div className="tw-relative background-color-picker-button">
          <BackgroundColorButton 
            ref={backgroundColorButtonRef}
            onClick={handleBackgroundColorClick}
            currentColor={currentBackgroundColor}
            tabIndex={-1}
          />
        </div>
      </div>

      {/* Alignment Group */}
      <div className="toolbar-group">
        <div className="toolbar-group-label">Align</div>
        <AlignmentButton 
          ref={alignmentButtonRef}
          execCommand={execCommand}
          isOpen={dropdownStates?.alignment || false}
          onToggle={(isOpen) => setDropdownStates && setDropdownStates(prev => ({ ...prev, alignment: isOpen }))}
          tabIndex={-1}
        />
      </div>

      {/* Lists Group */}
      <div className="toolbar-group">
        <div className="toolbar-group-label">Lists</div>
        <BulletListButton 
          editorRef={editorRef}
          handleChange={handleChange}
          dropdownStates={dropdownStates}
          setDropdownStates={setDropdownStates}
          tabIndex={-1}
        />
        <NumberedListButton 
          editorRef={editorRef}
          handleChange={handleChange}
          dropdownStates={dropdownStates}
          setDropdownStates={setDropdownStates}
          tabIndex={-1}
        />
        <MultilevelListButton 
          editorRef={editorRef}
          handleChange={handleChange}
          dropdownStates={dropdownStates}
          setDropdownStates={setDropdownStates}
          tabIndex={-1}
        />
      </div>

      {/* Insert Group */}
      <div className="toolbar-group">
        <div className="toolbar-group-label">Insert</div>
        
        <ImageGradientButton 
          onClick={() => {
            setShowImageModal(true);
          }}
        />
        
        <EquationGradientButton 
          onClick={() => {
            saveSelection();
            setShowEquationModal(true);
          }}
        />
        
        <CodeButton 
          onClick={() => {
            saveSelection();
            setShowCodeModal(true);
          }}
          tabIndex={-1}
        />
        
        <TableButton 
          onClick={() => {
            saveSelection();
            setShowTableModal(true);
          }}
          tabIndex={-1}
        />
        
        <KeyConceptButton 
          onClick={handleKeyConceptInsert}
          tabIndex={-1}
        />
        
        <PracticeButton 
          onClick={() => {
            saveSelection();
            setShowPracticeModal(true);
          }}
          tabIndex={-1}
        />
      </div>

      {/* Tools Group */}
      <div className="toolbar-group">
        <div className="toolbar-group-label">Tools</div>
        <HelpButton 
          onClick={() => setShowHelpModal(true)}
          tabIndex={-1}
        />
      </div>
    </div>
  ), [
    handleToolbarKeyDown,
    execCommand,
    handleChange,
    dropdownStates,
    handleTextColorClick,
    currentTextColor,
    handleBackgroundColorClick,
    currentBackgroundColor,
    saveSelection,
    handleKeyConceptInsert
  ]);

  // Dynamic styles
  const dynamicStyles = useMemo(() => {
    const baseStyles = `
      .cte-resizable-image {
        cursor: pointer;
        max-width: 100%;
      }
      
      .cte-image-wrapper-selected img {
        border: 2px solid #800080 !important;
      }
      
      .cte-resize-handle {
        position: absolute;
        width: 8px;
        height: 8px;
        background: #800080;
        border-radius: 50%;
        z-index: 100;
      }
      
      .cte-image-resize-wrapper {
        display: inline-block;
        position: relative;
        max-width: 100%;
        margin: 2px;
      }

      [data-editor-id="${uniqueEditorId}"] .cte-resizable-image {
        cursor: pointer;
        max-width: 100%;
      }
      
      [data-editor-id="${uniqueEditorId}"] .cte-image-wrapper-selected img {
        border: 2px solid #800080 !important;
      }

      /* Color picker portal with fixed positioning */
      .color-picker-portal {
        position: fixed !important;
        z-index: 999999 !important;
        background: white;
        border: 2px solid #c084fc;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        pointer-events: auto;
        will-change: transform;
      }

      /* Layout-based toolbar positioning */
      .toolbar-container {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        padding: 8px;
        background: #f3e8ff;
        border-bottom: 1px solid #c084fc;
        max-width: 100%;
        overflow: visible;
        position: relative;
        will-change: transform;
        transform: translateZ(0);
        transition: all 0.3s ease;
      }

      /* Bottom toolbar variation */
      .editor-container[data-toolbar-bottom="true"] .toolbar-container {
        border-bottom: none;
        border-top: 1px solid #c084fc;
        background: linear-gradient(180deg, #f3e8ff 0%, #ede9fe 100%);
        border-radius: 0 0 8px 8px;
      }

      .toolbar-group {
        display: flex;
        align-items: center;
        gap: 2px;
        background: white;
        border: 1px solid #c084fc;
        border-radius: 6px;
        padding: 2px 4px;
        margin: 1px;
        flex-shrink: 0;
        min-width: 0;
        position: relative;
        transition: all 0.15s ease;
      }
      
      .toolbar-group:hover {
        background: #faf5ff;
        border-color: #a855f7;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .toolbar-group-label {
        font-size: 10px;
        color: #7c3aed;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 0 2px;
        opacity: 0.8;
        white-space: nowrap;
        display: none;
      }

      /* Show labels on larger screens */
      @media (min-width: 768px) {
        .toolbar-group-label {
          display: block;
        }
        
        .toolbar-container {
          gap: 6px;
          padding: 10px;
        }
        
        .toolbar-group {
          padding: 3px 6px;
          margin: 2px;
        }
      }

      /* Compact mode for mobile */
      @media (max-width: 767px) {
        .toolbar-container {
          gap: 2px;
          padding: 6px;
        }
        
        .toolbar-group {
          padding: 2px 3px;
          margin: 1px;
          border-radius: 4px;
        }
        
        .toolbar-group button {
          padding: 4px !important;
        }
        
        .toolbar-group button svg {
          width: 14px !important;
          height: 14px !important;
        }
      }

      /* Very small screens - single row scrollable */
      @media (max-width: 480px) {
        .toolbar-container {
          flex-wrap: nowrap;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: #c084fc #f3e8ff;
          padding: 4px 6px;
        }
        
        .toolbar-container::-webkit-scrollbar {
          height: 4px;
        }
        
        .toolbar-container::-webkit-scrollbar-track {
          background: #f3e8ff;
        }
        
        .toolbar-container::-webkit-scrollbar-thumb {
          background: #c084fc;
          border-radius: 2px;
        }
        
        .toolbar-group {
          flex-shrink: 0;
          white-space: nowrap;
        }
      }

      .toolbar-separator {
        width: 1px;
        height: 16px;
        background: #e9d5ff;
        margin: 0 2px;
        flex-shrink: 0;
      }

      @media (min-width: 768px) {
        .toolbar-separator {
          height: 20px;
          margin: 0 4px;
        }
      }

      /* Skip to Editor Link */
      .skip-to-editor {
        position: absolute;
        top: -40px;
        left: 8px;
        background: #7c3aed;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        text-decoration: none;
        font-size: 12px;
        font-weight: 500;
        z-index: 1001;
        transition: top 0.3s ease;
      }

      .skip-to-editor:focus {
        top: 8px;
      }

      .skip-to-editor:hover {
        background: #6d28d9;
        color: white;
        text-decoration: none;
      }

      /* Editor container responsive styles */
      .editor-container {
        width: 100%;
        border: 1px solid #c084fc;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        margin-bottom: 16px;
        overflow: visible;
        position: relative;
      }

      .editor-content {
        padding: 12px;
        min-height: ${height};
        background: white;
        outline: none;
        overflow-wrap: break-word;
        word-wrap: break-word;
        word-break: break-word;
      }

      @media (max-width: 767px) {
        .editor-content {
          padding: 8px;
          font-size: 16px;
        }
      }

      /* Ensure proper text wrapping in editor */
      .editor-content * {
        max-width: 100%;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      .editor-content img {
        max-width: 100%;
        height: auto;
      }

      .editor-content table {
        max-width: 100%;
        table-layout: auto;
        word-wrap: break-word;
      }

      .editor-content pre,
      .editor-content code {
        white-space: pre-wrap;
        overflow-wrap: break-word;
        word-wrap: break-word;
      }

      /* Dropdown and tooltip styles with proper z-indexing */
      .dropdown-portal {
        z-index: 99999 !important;
        position: absolute;
        background: white;
        border: 2px solid #c084fc;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        animation: dropdownFadeIn 0.15s ease-out;
        will-change: transform, opacity;
      }

      @keyframes dropdownFadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Enhanced Tooltip styles */
      .tooltip-portal {
        z-index: 999999 !important;
        position: fixed !important;
        background: rgba(31, 41, 55, 0.95);
        backdrop-filter: blur(4px);
        color: white;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        pointer-events: none;
        animation: tooltipFadeIn 0.15s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        will-change: transform, opacity;
      }

      @keyframes tooltipFadeIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Prevent layout shifts during tooltip display */
      .toolbar-group button {
        position: relative;
        will-change: transform;
      }

      .toolbar-group button:hover {
        transform: none !important;
      }

      .toolbar-group button:focus {
        outline: 2px solid #a855f7;
        outline-offset: 2px;
      }
    `;

    // Add component-specific styles if components are loaded
    let additionalStyles = '';
    
    try {
      if (componentsLoaded.listComponent && helpersRef.current.getListStyles) {
        additionalStyles += helpersRef.current.getListStyles() || '';
      }
    } catch (error) {
      console.warn('Error getting list styles:', error);
    }

    try {
      if (helpersRef.current.EquationUtils && helpersRef.current.EquationUtils.getEquationStyles) {
        additionalStyles += helpersRef.current.EquationUtils.getEquationStyles() || '';
      }
    } catch (error) {
      console.warn('Error getting equation styles:', error);
    }

    try {
      if (componentsLoaded.code && helpersRef.current.getCodeStyles) {
        additionalStyles += helpersRef.current.getCodeStyles() || '';
      }
    } catch (error) {
      console.warn('Error getting code styles:', error);
    }

    try {
      if (componentsLoaded.table && helpersRef.current.getTableStyles) {
        additionalStyles += helpersRef.current.getTableStyles() || '';
      }
    } catch (error) {
      console.warn('Error getting table styles:', error);
    }

    try {
      if (componentsLoaded.keyConcept && helpersRef.current.getKeyConceptStyles) {
        additionalStyles += helpersRef.current.getKeyConceptStyles() || '';
      }
    } catch (error) {
      console.warn('Error getting key concept styles:', error);
    }

    try {
      if (componentsLoaded.practice && helpersRef.current.getPracticeQuestionStyles) {
        additionalStyles += helpersRef.current.getPracticeQuestionStyles() || '';
      }
    } catch (error) {
      console.warn('Error getting practice styles:', error);
    }

    return baseStyles + additionalStyles;
  }, [uniqueEditorId, componentsLoaded, height]);

  // Check if main components are loaded
  const allComponentsLoaded = Object.values(componentsLoaded).every(Boolean);

  if (!allComponentsLoaded) {
    return (
      <div className="editor-container">
        <div className="tw-text-center tw-text-gray-500 tw-p-8">Loading editor...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="editor-container"
      data-editor-id={uniqueEditorId}
      data-toolbar-bottom={isToolbarBottom.toString()}
    >
      {/* Skip to Editor Link */}
      <a 
        href="#editor-content" 
        className="skip-to-editor"
        onClick={(e) => {
          e.preventDefault();
          skipToEditor();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            skipToEditor();
          }
        }}
      >
        Skip to Editor (Alt+E)
      </a>

      {/* CONDITIONAL LAYOUT: Toolbar first when normal, Editor first when bottom */}
      {!isToolbarBottom && ToolbarComponent}
      
      {/* Editor */}
      <div
        id="editor-content"
        ref={editorRef}
        contentEditable
        className="editor-content tw-outline-none tw-overflow-auto tw-focus:tw-ring-2 tw-focus:tw-ring-purple-300 tw-focus:tw-ring-inset"
        onInput={handleChange}
        onBlur={handleEditorBlur}
        onPaste={handlePaste}
        onFocus={handleEditorFocus}
        tabIndex={0}
        role="textbox"
        aria-label="Text editor"
        aria-describedby="editor-help"
      />
      
      {/* CONDITIONAL LAYOUT: Toolbar after editor when bottom */}
      {isToolbarBottom && ToolbarComponent}
      
      {/* Hidden helper text for screen readers */}
      <div id="editor-help" className="tw-sr-only">
        Rich text editor. Use toolbar above for formatting options. Press Alt+E to focus editor directly.
      </div>
      
      {/* Dynamic Styles */}
      <style jsx>{dynamicStyles}</style>
      
      {/* Color Pickers with Portal - Fixed positioning */}
      {showColorPicker && (
        <Portal>
          <div 
            ref={colorPickerRef} 
            className="color-picker-portal"
            style={{
              position: 'fixed',
              top: `${colorPickerPosition.top}px`,
              left: `${colorPickerPosition.left}px`,
              zIndex: 999999,
            }}
          >
            <ColorPicker 
              onColorSelect={handleTextColor}
              onClose={() => setShowColorPicker(false)}
              initialColor={currentTextColor}
              title="Text Color"
            />
          </div>
        </Portal>
      )}

      {showBackgroundColorPicker && (
        <Portal>
          <div 
            ref={backgroundColorPickerRef} 
            className="color-picker-portal"
            style={{
              position: 'fixed',
              top: `${backgroundColorPickerPosition.top}px`,
              left: `${backgroundColorPickerPosition.left}px`,
              zIndex: 999999,
            }}
          >
            <ColorPicker 
              onColorSelect={handleBackgroundColor}
              onClose={() => setShowBackgroundColorPicker(false)}
              initialColor={currentBackgroundColor}
              title="Background Color"
            />
          </div>
        </Portal>
      )}
      
      {/* Modals */}
      {showImageModal && (
        <ImageModal 
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          onInsert={handleImageInsert}
        />
      )}

      {showEquationModal && (
        <EquationModal 
          isOpen={showEquationModal}
          onClose={() => {
            setShowEquationModal(false);
            setEditingEquation(null);
            setIsEditingEquation(false);
          }}
          onInsert={handleEquationSubmit}
          onDelete={handleEquationDelete}
          initialEquation={editingEquation ? editingEquation.latex : ''}
          initialDisplayMode={editingEquation ? editingEquation.displayMode : false}
          isEditing={isEditingEquation}
        />
      )}

      {showCodeModal && (
        <CodeModal
          isOpen={showCodeModal}
          onClose={() => {
            setShowCodeModal(false);
            setEditingCode(null);
          }}
          onInsert={handleCodeSubmit}
          initialCode={editingCode ? editingCode.code : ''}
          initialLanguage={editingCode ? editingCode.language : 'javascript'}
          isEditing={!!editingCode}
        />
      )}

      {showTableModal && (
        <TableModal
          isOpen={showTableModal}
          onClose={() => {
            setShowTableModal(false);
            setEditingTable(null);
          }}
          onInsert={handleTableSubmit}
          initialTable={editingTable ? editingTable.outerHTML : null}
          isEditing={!!editingTable}
        />
      )}
      
      {/* Key Concept Style Modal */}
      {showKeyConceptModal && (
        <KeyConceptStyleModal
          isOpen={showKeyConceptModal}
          onClose={() => {
            setShowKeyConceptModal(false);
            setSavedSelection(null);
          }}
          onSelect={handleKeyConceptStyleSelect}
        />
      )}
      
      {showPracticeModal && (
        <PracticeModal 
          isOpen={showPracticeModal}
          onClose={() => setShowPracticeModal(false)}
          onInsert={handlePracticeInsert}
        />
      )}
      
      {showHelpModal && (
        <HelpModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
        />
      )}
    </div>
  );
};

export default SuperEditor;