'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { List, Image, Sigma } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import KaTeX CSS
import 'katex/dist/katex.min.css';

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

const BulletListButton = dynamic(() => import('./Toolbars/List/List').then(mod => ({ default: mod.BulletListButton })), { ssr: false });
const NumberedListButton = dynamic(() => import('./Toolbars/List/List').then(mod => ({ default: mod.NumberedListButton })), { ssr: false });
const MultilevelListButton = dynamic(() => import('./Toolbars/List/List').then(mod => ({ default: mod.MultilevelListButton })), { ssr: false });

const HelpButton = dynamic(() => import('./Toolbars/Help/Help').then(mod => ({ default: mod.HelpButton })), { ssr: false });
const HelpModal = dynamic(() => import('./Toolbars/Help/Help').then(mod => ({ default: mod.HelpModal })), { ssr: false });

interface SuperEditorProps {
  onChange?: (content: string) => void;
  initialValue?: string;
  editorId?: string | null;
}

const SuperEditor: React.FC<SuperEditorProps> = ({ 
  onChange, 
  initialValue = '', 
  editorId = null 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const backgroundColorPickerRef = useRef<HTMLDivElement>(null);
  const fontSizeButtonRef = useRef<any>(null);
  const alignmentButtonRef = useRef<any>(null);
  const headingButtonRef = useRef<any>(null);
  
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
  }>({
    equation: false,
    imageModal: false,
    color: false,
    font: false,
    code: false,
    table: false,
    keyConcept: false,
    listComponent: false,
    help: false
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
    insertKeyConceptBlock?: any;
    getKeyConceptStyles?: any;
    getListStyles?: any;
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
  const [currentTextColor, setCurrentTextColor] = useState<string>('#000000');
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState<string>('#ffffff');
  const [editingEquation, setEditingEquation] = useState<any>(null);
  const [isEditingEquation, setIsEditingEquation] = useState<boolean>(false);
  const [editingCode, setEditingCode] = useState<any>(null);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const [isEditorFocused, setIsEditorFocused] = useState<boolean>(false);
  const [toolbarStyle, setToolbarStyle] = useState<React.CSSProperties>({});
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

  // Memoize default toolbar style to prevent unnecessary re-renders
  const defaultToolbarStyle = useMemo((): React.CSSProperties => ({
    position: 'relative',
    top: 'auto',
    zIndex: 1,
    transform: 'none',
    backgroundColor: '#f3e8ff',
    borderBottom: '1px solid #c084fc',
    boxShadow: 'none'
  }), []);

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
        helpersRef.current.insertKeyConceptBlock = module.insertKeyConceptBlock;
        helpersRef.current.getKeyConceptStyles = module.getKeyConceptStyles;
        setComponentsLoaded(prev => ({ ...prev, keyConcept: true }));
      }).catch(console.error);

      // Load list helpers
      import('./Toolbars/List/List').then(module => {
        helpersRef.current.getListStyles = module.getListStyles;
        setComponentsLoaded(prev => ({ ...prev, listComponent: true }));
      }).catch(console.error);

      // Mark font and help as loaded (they're always available)
      setComponentsLoaded(prev => ({ ...prev, font: true, help: true }));
    }
  }, []);

  // Debounced change handler
  const debouncedHandleChange = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (editorRef.current) {
          const newContent = editorRef.current.innerHTML;
          setContent(newContent);
          if (onChange) onChange(newContent);
          
          // Refresh code highlighting and table handlers if available
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
        }
      }, 50);
    };
  }, [onChange, componentsLoaded.code, componentsLoaded.table]);

  const handleChange = useCallback(() => {
    debouncedHandleChange();
  }, [debouncedHandleChange]);

  const execCommand = useCallback((command: string, value: string | null = null) => {
    if (editorRef.current && typeof document !== 'undefined') {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleChange();
    }
  }, [handleChange]);

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

  // KeyConcept shortcut handler
  const handleKeyConceptShortcut = useCallback(() => {
    if (componentsLoaded.keyConcept && helpersRef.current.insertKeyConceptBlock) {
      try {
        helpersRef.current.insertKeyConceptBlock({ editorRef, handleChange });
      } catch (error) {
        console.warn('Error inserting key concept:', error);
      }
    }
  }, [handleChange, componentsLoaded.keyConcept]);

  const handleEscapeKey = useCallback(() => {
    setShowColorPicker(false);
    setShowBackgroundColorPicker(false);
    setShowTableModal(false);
    setShowHelpModal(false);
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
    'escape': () => handleEscapeKey()
  }), [showHelpModal, dropdownStates, showColorPicker, showBackgroundColorPicker, showTableModal, saveSelection, execCommand, handleHyperlinkShortcut, handleKeyConceptShortcut, handleEscapeKey]);

  const updateToolbarPosition = useCallback(() => {
    if (!containerRef.current || !toolbarRef.current || !editorRef.current || typeof window === 'undefined') return;
    
    const container = containerRef.current;
    const toolbar = toolbarRef.current;
    const editor = editorRef.current;
    
    const containerRect = container.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();
    const toolbarHeight = toolbar.offsetHeight;
    
    const isEditorVisible = editorRect.top < window.innerHeight && editorRect.bottom > 0;
    
    if (isEditorVisible && containerRect.top < 0 && containerRect.bottom > toolbarHeight) {
      const stickyTop = Math.max(0, Math.min(-containerRect.top, containerRect.height - toolbarHeight));
      setToolbarStyle({
        position: 'sticky',
        top: '0px',
        zIndex: 1000,
        transform: `translateY(${stickyTop}px)`,
        backgroundColor: '#f3e8ff',
        borderBottom: '1px solid #c084fc',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      });
    } else {
      setToolbarStyle(defaultToolbarStyle);
    }
  }, [defaultToolbarStyle]);

  // Throttle scroll handler to improve performance
  const throttledUpdateToolbarPosition = useMemo(() => {
    let ticking = false;
    return () => {
      if (!ticking && typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          if (isEditorFocused) {
            updateToolbarPosition();
          }
          ticking = false;
        });
        ticking = true;
      }
    };
  }, [isEditorFocused, updateToolbarPosition]);

  // Consolidated scroll and resize handler
  useEffect(() => {
    if (!isEditorFocused || typeof window === 'undefined') return;

    window.addEventListener('scroll', throttledUpdateToolbarPosition, { passive: true });
    window.addEventListener('resize', throttledUpdateToolbarPosition, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledUpdateToolbarPosition);
      window.removeEventListener('resize', throttledUpdateToolbarPosition);
    };
  }, [isEditorFocused, throttledUpdateToolbarPosition]);

  // Update toolbar position when focus changes
  useEffect(() => {
    if (isEditorFocused) {
      updateToolbarPosition();
    } else {
      setToolbarStyle(defaultToolbarStyle);
    }
  }, [isEditorFocused, updateToolbarPosition, defaultToolbarStyle]);

  // Initialize editor content
  useEffect(() => {
    if (initialValue && editorRef.current && Object.values(componentsLoaded).some(Boolean)) {
      editorRef.current.innerHTML = initialValue;
      
      const timer = setTimeout(() => {
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
      
      return () => clearTimeout(timer);
    }
  }, [initialValue, componentsLoaded]);

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
    if (!isEditorFocused) return;
    
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
  }, [showColorPicker, showBackgroundColorPicker, isEditorFocused]);

  useEffect(() => {
    if ((showColorPicker || showBackgroundColorPicker) && typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
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
    if (componentsLoaded.keyConcept && helpersRef.current.insertKeyConceptBlock) {
      try {
        helpersRef.current.insertKeyConceptBlock({ editorRef, handleChange });
      } catch (error) {
        console.warn('Error inserting key concept:', error);
      }
    }
  }, [handleChange, componentsLoaded.keyConcept]);

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
      document.execCommand('styleWithCSS', false, true);
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

    return baseStyles + additionalStyles;
  }, [uniqueEditorId, componentsLoaded]);

  // Check if main components are loaded
  const allComponentsLoaded = Object.values(componentsLoaded).every(Boolean);

  if (!allComponentsLoaded) {
    return (
      <div className="tw-w-full tw-border tw-border-purple-300 tw-rounded tw-shadow-sm tw-mb-4 tw-p-4">
        <div className="tw-text-center tw-text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="tw-w-full tw-border tw-border-purple-300 tw-rounded tw-shadow-sm tw-mb-4"
      data-editor-id={uniqueEditorId}
    >
      <div 
        ref={toolbarRef}
        className="tw-p-2 tw-border-b tw-border-purple-300 tw-flex tw-flex-wrap tw-gap-1 tw-transition-all tw-duration-200"
        style={toolbarStyle}
      >
        {/* Font Controls */}
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
        <HyperlinkButton onClick={() => {
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
        }} />
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
        
        {/* Text Color */}
        <div className="tw-relative">
          <TextColorButton 
            onClick={() => {
              saveSelection();
              setShowColorPicker(!showColorPicker);
              setShowBackgroundColorPicker(false);
            }}
            currentColor={currentTextColor}
            className="text-color-picker-button"
          />
          
          {showColorPicker && (
            <div ref={colorPickerRef} className="tw-relative">
              <ColorPicker 
                onColorSelect={handleTextColor}
                onClose={() => setShowColorPicker(false)}
                initialColor={currentTextColor}
                title="Text Color"
              />
            </div>
          )}
        </div>
        
        {/* Background Color */}
        <div className="tw-relative">
          <BackgroundColorButton 
            onClick={() => {
              saveSelection();
              setShowBackgroundColorPicker(!showBackgroundColorPicker);
              setShowColorPicker(false);
            }}
            currentColor={currentBackgroundColor}
            className="background-color-picker-button"
          />
          
          {showBackgroundColorPicker && (
            <div ref={backgroundColorPickerRef} className="tw-relative">
              <ColorPicker 
                onColorSelect={handleBackgroundColor}
                onClose={() => setShowBackgroundColorPicker(false)}
                initialColor={currentBackgroundColor}
                title="Background Color"
              />
            </div>
          )}
        </div>
        
        {/* List Controls */}
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
        
        {/* Image Button */}
        <button 
          type="button" 
          className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors" 
          onClick={(e) => {
            e.preventDefault();         // opsional jika sudah ada type="button"
            e.stopPropagation();
            setShowImageModal(true)
          }}
        >
          <Image size={16} />
        </button>
        
        {/* Equation Button */}
        <button 
          type="button" 
          className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors" 
          onClick={(e) => {
            e.preventDefault();         // opsional jika sudah ada type="button"
            e.stopPropagation();
            saveSelection();
            setShowEquationModal(true);
          }}
        >
          <Sigma size={16} />
        </button>
        
        {/* Code Button */}
        <CodeButton 
          onClick={() => {
            saveSelection();
            setShowCodeModal(true);
          }}
        />
        
        {/* Table Button */}
        <TableButton 
          onClick={() => {
            saveSelection();
            setShowTableModal(true);
          }}
        />
        
        {/* Key Concept Button */}
        <KeyConceptButton 
          onClick={handleKeyConceptInsert}
        />
        
        {/* Help Button */}
        <HelpButton 
          onClick={() => setShowHelpModal(true)}
        />
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="tw-p-3 tw-min-h-[200px] tw-bg-white tw-outline-none tw-overflow-auto tw-focus:tw-ring-2 tw-focus:tw-ring-purple-300 tw-focus:tw-ring-inset"
        onInput={handleChange}
        onBlur={handleEditorBlur}
        onPaste={handlePaste}
        onFocus={handleEditorFocus}
      />
      
      {/* Dynamic Styles */}
      <style jsx>{dynamicStyles}</style>
      
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