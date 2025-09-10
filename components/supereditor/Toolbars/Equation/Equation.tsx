"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Calculator, Trash2, BookOpen } from 'lucide-react';
import { LearningModal } from '../../../modal/ModalTemplate';
import { ButtonGradient } from '../../../button/ButtonTemplate';

const EquationModal = ({ isOpen, onClose, onInsert, onDelete, initialEquation = '', initialDisplayMode = false, isEditing = false }) => {
  const [equation, setEquation] = useState(initialEquation || (initialDisplayMode ? '\\begin{align*}\n\n\\end{align*}' : ''));
  const [displayMode, setDisplayMode] = useState(initialDisplayMode);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState(null);
  const [activeSymbolCategory, setActiveSymbolCategory] = useState('basic');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  const symbolCategories = {
    basic: [
      { symbol: '+', description: 'Plus' },
      { symbol: '-', description: 'Minus' },
      { symbol: '\\times', description: 'Times' },
      { symbol: '\\div', description: 'Division' },
      { symbol: '=', description: 'Equals' },
      { symbol: '\\neq', description: 'Not equal' },
      { symbol: '\\approx', description: 'Approximately' },
      { symbol: '\\pm', description: 'Plus-minus' },
      { symbol: '\\cdot', description: 'Dot product' },
      { symbol: '\\star', description: 'Star' }
    ],
    greek: [
      { symbol: '\\alpha', description: 'Alpha' },
      { symbol: '\\beta', description: 'Beta' },
      { symbol: '\\gamma', description: 'Gamma' },
      { symbol: '\\delta', description: 'Delta' },
      { symbol: '\\epsilon', description: 'Epsilon' },
      { symbol: '\\zeta', description: 'Zeta' },
      { symbol: '\\eta', description: 'Eta' },
      { symbol: '\\theta', description: 'Theta' },
      { symbol: '\\iota', description: 'Iota' },
      { symbol: '\\kappa', description: 'Kappa' },
      { symbol: '\\lambda', description: 'Lambda' },
      { symbol: '\\mu', description: 'Mu' },
      { symbol: '\\Gamma', description: 'Gamma (uppercase)' },
      { symbol: '\\Delta', description: 'Delta (uppercase)' },
      { symbol: '\\Theta', description: 'Theta (uppercase)' },
      { symbol: '\\Lambda', description: 'Lambda (uppercase)' },
      { symbol: '\\Sigma', description: 'Sigma (uppercase)' },
      { symbol: '\\Omega', description: 'Omega (uppercase)' }
    ],
    relations: [
      { symbol: '<', description: 'Less than' },
      { symbol: '>', description: 'Greater than' },
      { symbol: '\\leq', description: 'Less or equal' },
      { symbol: '\\geq', description: 'Greater or equal' },
      { symbol: '\\equiv', description: 'Equivalent' },
      { symbol: '\\sim', description: 'Similar' },
      { symbol: '\\propto', description: 'Proportional to' },
      { symbol: '\\in', description: 'Element of' },
      { symbol: '\\notin', description: 'Not element of' },
      { symbol: '\\subset', description: 'Subset' }
    ],
    fonts: [
      { symbol: '\\mathcal{A}', description: 'Math calligraphic' },
      { symbol: '\\mathfrak{A}', description: 'Math fraktur' },
      { symbol: '\\mathbb{R}', description: 'Math blackboard' },
      { symbol: '\\mathbf{A}', description: 'Math bold' },
      { symbol: '\\mathit{A}', description: 'Math italic' },
      { symbol: '\\mathrm{A}', description: 'Math roman' },
      { symbol: '\\mathsf{A}', description: 'Math sans-serif' },
      { symbol: '\\mathtt{A}', description: 'Math typewriter' }
    ],
    braces: [
      { symbol: '\\left( \\right)', description: 'Parentheses' },
      { symbol: '\\left[ \\right]', description: 'Brackets' },
      { symbol: '\\left\\{ \\right\\}', description: 'Braces' },
      { symbol: '\\left| \\right|', description: 'Vertical bars' },
      { symbol: '\\left\\| \\right\\|', description: 'Double vertical bars' },
      { symbol: '\\left\\langle \\right\\rangle', description: 'Angle brackets' },
      { symbol: '\\left\\lfloor \\right\\rfloor', description: 'Floor' },
      { symbol: '\\left\\lceil \\right\\rceil', description: 'Ceiling' }
    ],
    superSub: [
      { symbol: 'a^{b}', description: 'Superscript' },
      { symbol: 'a_{b}', description: 'Subscript' },
      { symbol: '\\sqrt{}', description: 'Square root' },
      { symbol: '\\sqrt[n]{}', description: 'nth root' },
      { symbol: '\\frac{a}{b}', description: 'Fraction' },
      { symbol: '\\binom{}{}', description: 'Binomial' },
      { symbol: '\\overset{a}{b}', description: 'Overset' },
      { symbol: '\\underset{a}{b}', description: 'Underset' }
    ],
    advanced: [
      { symbol: '\\sum_{}^{}', description: 'Sum' },
      { symbol: '\\prod_{}^{}', description: 'Product' },
      { symbol: '\\int_{}^{}', description: 'Integral' },
      { symbol: '\\oint_{}^{}', description: 'Contour integral' },
      { symbol: '\\iint_{}^{}', description: 'Double integral' },
      { symbol: '\\lim_{}', description: 'Limit' },
      { symbol: '\\infty', description: 'Infinity' },
      { symbol: '\\nabla', description: 'Nabla' },
      { symbol: '\\partial', description: 'Partial derivative' },
      { symbol: '\\vec{}', description: 'Vector' }
    ]
  };

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialEquation) {
        setEquation(initialEquation);
      } else if (initialDisplayMode && !initialEquation) {
        setEquation('\\begin{align*}\n\n\\end{align*}');
      } else {
        setEquation('');
      }
      setDisplayMode(initialDisplayMode);
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, initialEquation, initialDisplayMode]);

  useEffect(() => {
    if (!equation) {
      setPreview('');
      setError(null);
      return;
    }

    try {
      const renderedEquation = katex.renderToString(equation, {
        displayMode: displayMode,
        throwOnError: true
      });
      setPreview(renderedEquation);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [equation, displayMode]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
    
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      if (!equation || error) return;
      handleInsert();
    }
    
    if (e.key === 'd' && (e.ctrlKey || e.metaKey) && isEditing) {
      e.preventDefault();
      e.stopPropagation();
      handleDelete();
    }
  };

  const handleEquationTypeChange = (isDisplay) => {
    setDisplayMode(isDisplay);
    if (isDisplay && !equation) {
      setEquation('\\begin{align*}\n\n\\end{align*}');
    }
  };

  const insertSymbol = (symbol) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newEquation = equation.substring(0, start) + symbol + equation.substring(end);
    setEquation(newEquation);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + symbol.length;
      textarea.selectionEnd = start + symbol.length;
    }, 10);
  };

  const handleInsert = async () => {
    if (!equation || error) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      
      onInsert({
        equation,
        displayMode
      });
      
      if (!isEditing) {
        setEquation(displayMode ? '\\begin{align*}\n\n\\end{align*}' : '');
      }
      
      onClose();
    } catch (error) {
      console.error('Error inserting equation:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (onDelete) {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 200)); // Simulate processing
        onDelete();
        onClose();
      } catch (error) {
        console.error('Error deleting equation:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClear = () => {
    setEquation(displayMode ? '\\begin{align*}\n\n\\end{align*}' : '');
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Define modal buttons
  const topButtons = [
    {
      action: 'clear' as const,
      text: 'Clear',
      onClick: handleClear,
      disabled: loading || !equation
    }
  ];

  const bottomButtons = [
    ...(isEditing ? [{
      action: 'delete' as const,
      text: 'Delete Equation',
      onClick: handleDelete,
      disabled: loading,
      loading: loading,
      customIcon: <Trash2 className="tw-w-4 tw-h-4" />
    }] : []),
    {
      action: 'cancel' as const,
      text: 'Cancel',
      onClick: onClose,
      disabled: loading
    },
    {
      action: 'save' as const,
      text: isEditing ? 'Update Equation' : 'Insert Equation',
      onClick: handleInsert,
      disabled: !equation || !!error || loading,
      loading: loading
    }
  ];

  return (
    <LearningModal
      show={isOpen}
      onHide={onClose}
      title={isEditing ? 'Edit Mathematical Equation' : 'Insert Mathematical Equation'}
      subtitle="Create beautiful mathematical expressions with LaTeX"
      icon={<BookOpen className="tw-w-5 tw-h-5" />}
      size="xl"
      width="100vw"
      height="100vh"
      topButtons={topButtons}
      bottomButtons={bottomButtons}
      showCloseButton={true}
      preventCloseOnOutsideClick={loading}
    >
      <div className="tw-space-y-6">
        {/* Equation Type Selection */}
        <div className="tw-bg-white tw-rounded-xl tw-p-6 tw-shadow-sm tw-border tw-border-purple-100">
          <h3 className="tw-text-lg tw-font-semibold tw-text-purple-700 tw-mb-4 tw-flex tw-items-center tw-gap-2">
            <Calculator className="tw-w-5 tw-h-5" />
            Equation Type
          </h3>
          
          <div className="tw-flex tw-gap-3">
            <ButtonGradient
              action="custom"
              customText="Inline ($...$)"
              onClick={() => handleEquationTypeChange(false)}
              size="md"
              disabled={loading}
              customColors={!displayMode ? {
                gradient1: '#8B5CF6',
                gradient2: '#A855F7',
                text: '#FFFFFF'
              } : {
                gradient1: '#F3F4F6',
                gradient2: '#E5E7EB',
                text: '#6B7280'
              }}
              className="tw-flex-1"
            />
            <ButtonGradient
              action="custom"
              customText="Display ($$...$$)"
              onClick={() => handleEquationTypeChange(true)}
              size="md"
              disabled={loading}
              customColors={displayMode ? {
                gradient1: '#8B5CF6',
                gradient2: '#A855F7',
                text: '#FFFFFF'
              } : {
                gradient1: '#F3F4F6',
                gradient2: '#E5E7EB',
                text: '#6B7280'
              }}
              className="tw-flex-1"
            />
          </div>
          
          <div className="tw-mt-3 tw-text-sm tw-text-purple-600">
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3">
              <div className="tw-flex tw-items-center tw-gap-2">
                <span className="tw-font-medium">Inline:</span>
                <span>For equations within text</span>
              </div>
              <div className="tw-flex tw-items-center tw-gap-2">
                <span className="tw-font-medium">Display:</span>
                <span>For standalone equations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Symbol Categories */}
        <div className="tw-bg-white tw-rounded-xl tw-p-6 tw-shadow-sm tw-border tw-border-purple-100">
          <h3 className="tw-text-lg tw-font-semibold tw-text-purple-700 tw-mb-4">Symbol Categories</h3>
          
          <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mb-4">
            {Object.keys(symbolCategories).map(category => (
              <ButtonGradient
                key={category}
                action="custom"
                customText={category.charAt(0).toUpperCase() + category.slice(1)}
                onClick={() => setActiveSymbolCategory(category)}
                size="sm"
                disabled={loading}
                customColors={activeSymbolCategory === category ? {
                  gradient1: '#8B5CF6',
                  gradient2: '#A855F7',
                  text: '#FFFFFF'
                } : {
                  gradient1: '#F9FAFB',
                  gradient2: '#F3F4F6',
                  text: '#6B7280'
                }}
              />
            ))}
          </div>
          
          <div className="tw-grid tw-grid-cols-5 sm:tw-grid-cols-8 md:tw-grid-cols-10 tw-gap-2 tw-p-4 tw-border-2 tw-border-purple-200 tw-rounded-xl tw-bg-purple-50 tw-max-h-48 tw-overflow-y-auto">
            {symbolCategories[activeSymbolCategory].map((item, index) => {
              const displaySymbol = katex.renderToString(item.symbol, {
                throwOnError: false
              });
              
              return (
                <button
                  key={index}
                  className="tw-w-12 tw-h-12 tw-flex tw-items-center tw-justify-center tw-bg-white tw-border-2 tw-border-purple-200 tw-rounded-lg hover:tw-bg-purple-100 hover:tw-border-purple-400 tw-transition-all tw-duration-200 hover:tw-scale-110 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                  onClick={() => insertSymbol(item.symbol)}
                  title={item.description}
                  dangerouslySetInnerHTML={{ __html: displaySymbol }}
                  type="button"
                  disabled={loading}
                />
              );
            })}
          </div>
        </div>
        
        {/* Equation Editor */}
        <div className="tw-bg-white tw-rounded-xl tw-p-6 tw-shadow-sm tw-border tw-border-purple-100">
          <h3 className="tw-text-lg tw-font-semibold tw-text-purple-700 tw-mb-4">LaTeX Equation Editor</h3>
          
          <Form.Control
            as="textarea"
            ref={textareaRef}
            className="tw-font-mono tw-border-2 tw-border-purple-200 tw-rounded-xl tw-p-4 focus:tw-border-purple-400 focus:tw-outline-none tw-transition-colors tw-resize-none"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            rows={6}
            disabled={loading}
            placeholder={displayMode ? 
              "Enter your LaTeX equation here...\n\nExample:\n\\begin{align*}\nf(x) &= x^2 + 2x + 1 \\\\\n&= (x + 1)^2\n\\end{align*}" :
              "Enter your LaTeX equation here...\n\nExample: E = mc^2"
            }
            style={{
              fontSize: '14px',
              lineHeight: '1.5'
            }}
          />
          
          {error && (
            <div className="tw-mt-3 tw-p-3 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg">
              <div className="tw-flex tw-items-center tw-gap-2">
                <span className="tw-text-red-600 tw-font-medium">Error:</span>
                <span className="tw-text-red-700 tw-text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Preview */}
        <div className="tw-bg-white tw-rounded-xl tw-p-6 tw-shadow-sm tw-border tw-border-purple-100">
          <h3 className="tw-text-lg tw-font-semibold tw-text-purple-700 tw-mb-4">Live Preview</h3>
          
          <div 
            className={`tw-border-2 tw-border-purple-200 tw-rounded-xl tw-p-6 tw-min-h-24 tw-flex tw-items-center tw-bg-gradient-to-br tw-from-purple-50 tw-to-blue-50 ${
              displayMode ? 'tw-justify-center' : 'tw-justify-start'
            }`}
            dangerouslySetInnerHTML={{ 
              __html: preview || '<span class="tw-text-gray-400 tw-italic">Equation preview will appear here...</span>' 
            }}
          />
          
          {equation && !error && (
            <div className="tw-mt-3 tw-text-xs tw-text-purple-600 tw-bg-purple-50 tw-rounded-lg tw-p-2">
              Type: {displayMode ? 'Display Mode (Block)' : 'Inline Mode'} • 
              Characters: {equation.length} • 
              Press Ctrl+Enter to insert
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="tw-bg-gradient-to-r tw-from-blue-50 tw-to-purple-50 tw-rounded-xl tw-p-6 tw-border tw-border-blue-200">
          <h3 className="tw-text-lg tw-font-semibold tw-text-blue-700 tw-mb-3">LaTeX Quick Tips</h3>
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-text-sm tw-text-blue-600">
            <div className="tw-space-y-2">
              <div className="tw-flex tw-items-start tw-gap-2">
                <span className="tw-text-blue-500 tw-font-bold">•</span>
                Use <code className="tw-bg-white tw-px-1 tw-rounded">^{}</code> for superscripts: <code>x^2</code>
              </div>
              <div className="tw-flex tw-items-start tw-gap-2">
                <span className="tw-text-blue-500 tw-font-bold">•</span>
                Use <code className="tw-bg-white tw-px-1 tw-rounded">_{}</code> for subscripts: <code>x_n</code>
              </div>
              <div className="tw-flex tw-items-start tw-gap-2">
                <span className="tw-text-blue-500 tw-font-bold">•</span>
                Use <code className="tw-bg-white tw-px-1 tw-rounded">\frac{}{}</code> for fractions
              </div>
            </div>
            <div className="tw-space-y-2">
              <div className="tw-flex tw-items-start tw-gap-2">
                <span className="tw-text-blue-500 tw-font-bold">•</span>
                Use <code className="tw-bg-white tw-px-1 tw-rounded">\sqrt{}</code> for square roots
              </div>
              <div className="tw-flex tw-items-start tw-gap-2">
                <span className="tw-text-blue-500 tw-font-bold">•</span>
                Click symbols above to insert them instantly
              </div>
              <div className="tw-flex tw-items-start tw-gap-2">
                <span className="tw-text-blue-500 tw-font-bold">•</span>
                Double-click any equation to edit it later
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearningModal>
  );
};

export const EquationUtils = {
  setupEquationHandlers: (editorRef, setEditingEquation, setIsEditingEquation, setShowEquationModal, handleChange) => {
    if (!editorRef.current) return;

    const equations = editorRef.current.querySelectorAll('.cte-katex-equation');
    
    equations.forEach(equation => {
      if (equation.dataset.hasHandlers === 'true') return;
      equation.dataset.hasHandlers = 'true';
      
      equation.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const allEquations = editorRef.current.querySelectorAll('.cte-katex-equation');
        allEquations.forEach(eq => eq.classList.remove('cte-equation-selected'));
        equation.classList.add('cte-equation-selected');
      });
      
      equation.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const latex = decodeURIComponent(equation.dataset.latex || '');
        const displayMode = equation.dataset.displayMode === 'true';
        
        setEditingEquation({
          element: equation,
          latex,
          displayMode
        });
        setIsEditingEquation(true);
        setShowEquationModal(true);
      });
    });
  },

  updateExistingEquation: (editingEquation, equation, displayMode, setShowEquationModal, setEditingEquation, setIsEditingEquation) => {
    const element = editingEquation.element;
    if (!element) return;

    try {
      const renderedEquation = katex.renderToString(equation, {
        displayMode: displayMode,
        throwOnError: false
      });

      const selection = window.getSelection();
      const range = document.createRange();
      
      element.innerHTML = renderedEquation;
      element.setAttribute('data-latex', encodeURIComponent(equation));
      element.setAttribute('data-display-mode', displayMode);
      
      element.className = `cte-katex-equation ${displayMode ? 'cte-katex-block' : 'cte-katex-inline'}`;
      
      range.setStartAfter(element);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      element.closest('[contenteditable]')?.focus();

      setShowEquationModal(false);
      setEditingEquation(null);
      setIsEditingEquation(false);
    } catch (error) {
      console.error('Error updating equation:', error);
    }
  },

  insertNewEquation: (equation, displayMode, savedSelection, setSavedSelection, setShowEquationModal, setEditingEquation) => {
    if (savedSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection);
    }
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    const renderedEquation = katex.renderToString(equation, {
      displayMode: displayMode,
      throwOnError: false
    });

    const containerTag = displayMode ? 'div' : 'span';
    const container = document.createElement(containerTag);
    container.className = `cte-katex-equation ${displayMode ? 'cte-katex-block' : 'cte-katex-inline'}`;
    container.setAttribute('data-latex', encodeURIComponent(equation));
    container.setAttribute('data-display-mode', displayMode);
    container.setAttribute('data-editable', 'true');
    container.innerHTML = renderedEquation;

    if (displayMode) {
      range.insertNode(document.createElement('br'));
    }
    range.insertNode(container);
    
    const spaceNode = document.createTextNode('\u00A0');
    
    range.setStartAfter(container);
    range.collapse(true);
    range.insertNode(spaceNode);
    
    range.setStartAfter(spaceNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    if (displayMode) {
      const brNode = document.createElement('br');
      range.insertNode(brNode);
      range.setStartAfter(brNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    setShowEquationModal(false);
    setEditingEquation(null);
    setSavedSelection(null);
  },

  deleteEquation: (editingEquation, setShowEquationModal, setEditingEquation, setIsEditingEquation, handleChange) => {
    if (editingEquation && editingEquation.element) {
      const element = editingEquation.element;
      
      element.closest('[contenteditable]')?.focus();
      
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNode(element);
      selection.removeAllRanges();
      selection.addRange(range);
      
      document.execCommand('delete', false);
      
      setShowEquationModal(false);
      setEditingEquation(null);
      setIsEditingEquation(false);
      
      handleChange();
    }
  },

  setupEditorKeyboardShortcuts: (editorRef) => {
    if (!editorRef.current) return;
    
    editorRef.current.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        document.execCommand('undo');
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        document.execCommand('redo');
      }
    });
  },

  handleEquationSubmit: ({ 
    equation, 
    displayMode 
  }, {
    editingEquation,
    isEditingEquation,
    savedSelection,
    setShowEquationModal,
    setEditingEquation,
    setSavedSelection,
    setIsEditingEquation,
    setupEquationHandlers,
    handleChange
  }) => {
    try {
      if (!equation) return;

      if (editingEquation && isEditingEquation) {
        EquationUtils.updateExistingEquation(
          editingEquation, 
          equation, 
          displayMode, 
          setShowEquationModal, 
          setEditingEquation, 
          setIsEditingEquation
        );
      } else if (savedSelection) {
        EquationUtils.insertNewEquation(
          equation, 
          displayMode, 
          savedSelection, 
          setSavedSelection, 
          setShowEquationModal, 
          setEditingEquation
        );
      }

      setTimeout(() => {
        setupEquationHandlers();
        handleChange();
      }, 100);

    } catch (error) {
      console.error('Error handling equation:', error);
    }
  },

  getEquationStyles: () => `
    .cte-katex-equation {
      cursor: pointer;
      padding: 2px;
      border: 1px solid transparent;
      display: inline-block;
    }

    .cte-katex-equation:hover {
      border: 1px dashed #800080;
      background-color: rgba(128, 0, 128, 0.05);
    }
    
    .cte-equation-selected {
      border: 1px solid #800080 !important;
      background-color: rgba(128, 0, 128, 0.1) !important;
    }

    .cte-katex-block {
      display: block;
      margin: 1em 0;
      text-align: center;
    }

    .cte-katex-inline {
      display: inline-block;
      vertical-align: middle;
    }

    .katex {
      font-size: 1.1em;
    }
  `
};

export default EquationModal;