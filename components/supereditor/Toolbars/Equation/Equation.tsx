"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { X, Check, Trash } from 'lucide-react';

const EquationModal = ({ isOpen, onClose, onInsert, onDelete, initialEquation = '', initialDisplayMode = false, isEditing = false }) => {
  const [equation, setEquation] = useState(initialEquation || (initialDisplayMode ? '\\begin{align*}\n\n\\end{align*}' : ''));
  const [displayMode, setDisplayMode] = useState(initialDisplayMode);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState(null);
  const [activeSymbolCategory, setActiveSymbolCategory] = useState('basic');
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

  const handleInsert = () => {
    if (!equation || error) return;
    
    onInsert({
      equation,
      displayMode
    });
    
    if (!isEditing) {
      setEquation(displayMode ? '\\begin{align*}\n\n\\end{align*}' : '');
    }
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleCategoryClick = (e, category) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSymbolCategory(category);
  };

  const handleSymbolClick = (e, symbol) => {
    e.preventDefault();
    e.stopPropagation();
    insertSymbol(symbol);
  };

  const handleRadioChange = (e, isDisplay) => {
    e.preventDefault();
    e.stopPropagation();
    handleEquationTypeChange(isDisplay);
  };

  const handleCancelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleInsertClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleInsert();
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleDelete();
  };

  return (
    <Modal 
      show={isOpen} 
      onHide={onClose} 
      size="lg" 
      centered 
      className="tw-font-sans"
      backdrop="static"
    >
      <Modal.Header className="tw-bg-purple-700 tw-text-white">
        <Modal.Title>{isEditing ? 'Edit Equation' : 'Insert Equation'}</Modal.Title>
        <div className="tw-ms-auto tw-flex tw-items-center">
          <Button 
            variant="link" 
            className="tw-ms-auto tw-p-0 tw-text-white" 
            onClick={handleCloseClick}
          >
            <X size={20} />
          </Button>
        </div>
      </Modal.Header>
      <Modal.Body className="tw-p-4">
        <Form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <Form.Group className="tw-mb-3">
            <div className="tw-flex tw-items-center tw-flex-wrap">
              <Form.Label className="tw-mb-0 tw-me-3 tw-font-medium">Equation Type:</Form.Label>
              <div className="tw-flex tw-items-center">
                <Form.Check 
                  type="radio"
                  id="inline-equation"
                  name="equation-type"
                  label="Inline ($...$)"
                  checked={!displayMode}
                  onChange={(e) => handleRadioChange(e, false)}
                  className="tw-me-3"
                  inline
                />
                <Form.Check 
                  type="radio"
                  id="display-equation"
                  name="equation-type"
                  label="Display ($$...$$)"
                  checked={displayMode}
                  onChange={(e) => handleRadioChange(e, true)}
                  inline
                />
              </div>
            </div>
          </Form.Group>
          
          <div className="tw-mb-3">
            <div className="tw-flex tw-flex-wrap tw-gap-1 tw-mb-2">
              {Object.keys(symbolCategories).map(category => (
                <Badge 
                  key={category}
                  as="button"
                  onClick={(e) => handleCategoryClick(e, category)}
                  className={`tw-px-2 tw-py-1 tw-text-xs tw-rounded tw-border-0 tw-cursor-pointer ${
                    activeSymbolCategory === category 
                      ? 'tw-bg-purple-600 tw-text-white' 
                      : 'tw-bg-gray-200 tw-text-gray-800'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
              ))}
            </div>
            <div className="tw-flex tw-flex-wrap tw-gap-1 tw-p-2 tw-border tw-border-gray-300 tw-rounded tw-mb-3 tw-overflow-x-auto">
              {symbolCategories[activeSymbolCategory].map((item, index) => {
                const displaySymbol = katex.renderToString(item.symbol, {
                  throwOnError: false
                });
                
                return (
                  <button
                    key={index}
                    className="tw-w-10 tw-h-10 tw-flex tw-items-center tw-justify-center tw-bg-gray-50 tw-border tw-border-gray-300 tw-rounded hover:tw-bg-purple-50"
                    onClick={(e) => handleSymbolClick(e, item.symbol)}
                    title={item.description}
                    dangerouslySetInnerHTML={{ __html: displaySymbol }}
                    type="button"
                  />
                );
              })}
            </div>
          </div>
          
          <Form.Group className="tw-mb-3">
            <Form.Control
              as="textarea"
              ref={textareaRef}
              id="equation-editor"
              className="tw-font-mono"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              rows={5}
            />
            {error && (
              <Form.Text className="tw-text-red-500">
                {error}
              </Form.Text>
            )}
          </Form.Group>
          
          <Form.Group className="tw-mb-3">
            <Form.Label className="tw-font-medium">Preview:</Form.Label>
            <div 
              className={`tw-border tw-border-gray-300 tw-rounded tw-p-4 tw-min-h-20 tw-flex tw-items-center ${displayMode ? 'tw-justify-center' : ''}`}
              dangerouslySetInnerHTML={{ __html: preview || '<span class="tw-text-gray-400">Equation preview will appear here</span>' }}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="tw-flex tw-justify-between">
        {isEditing && (
          <Button 
            variant="danger"
            onClick={handleDeleteClick}
            title="Ctrl+D"
            className="tw-me-auto"
            type="button"
          >
            <Trash size={16} className="tw-inline tw-me-1" /> Delete
          </Button>
        )}
        <div>
          <Button 
            variant="secondary"
            onClick={handleCancelClick}
            title="Esc"
            className="tw-me-2"
            type="button"
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleInsertClick}
            disabled={!equation || error}
            title="Ctrl+Enter"
            className="tw-bg-purple-600 tw-border-purple-600 hover:tw-bg-purple-700"
            type="button"
          >
            <Check size={16} className="tw-inline tw-me-1" /> {isEditing ? 'Update' : 'Insert'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
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