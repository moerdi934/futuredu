'use client';

import React, { useState, useEffect, RefObject } from 'react';
import { Table as TableIcon, Plus, Minus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface TableData {
  html: string;
  data: string[][];
  hasHeader: boolean;
  style: string;
}

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (tableData: TableData) => void;
  initialTable?: string | null;
  isEditing?: boolean;
}

interface TableButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

interface TableFloaterProps {
  cellElement: HTMLElement;
  onAction: (action: string) => void;
  onClose: () => void;
}

const TableModal: React.FC<TableModalProps> = ({ 
  isOpen, 
  onClose, 
  onInsert, 
  initialTable = null, 
  isEditing = false 
}) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [tableData, setTableData] = useState<string[][]>([]);
  const [hasHeader, setHasHeader] = useState(true);
  const [tableStyle, setTableStyle] = useState('bordered');

  useEffect(() => {
    if (initialTable && isEditing) {
      const parsedTable = parseTableFromHtml(initialTable);
      setRows(parsedTable.rows);
      setCols(parsedTable.cols);
      setTableData(parsedTable.data);
      setHasHeader(parsedTable.hasHeader);
      setTableStyle(parsedTable.style);
    } else {
      initializeTable(rows, cols);
    }
  }, [isOpen, initialTable, isEditing, rows, cols]);

  // Add event listener for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Ctrl+Enter to submit table
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
      }
      
      // Escape to close modal
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const parseTableFromHtml = (htmlTable: string) => {
    if (typeof window === 'undefined') {
      return { rows: 3, cols: 3, data: [], hasHeader: true, style: 'bordered' };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlTable, 'text/html');
    const table = doc.querySelector('table');
    
    if (!table) return { rows: 3, cols: 3, data: [], hasHeader: true, style: 'bordered' };

    const tableRows = Array.from(table.querySelectorAll('tr'));
    const hasHeaderRow = table.querySelector('thead') !== null;
    const data: string[][] = [];
    let maxCols = 0;

    tableRows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      const rowData: string[] = [];
      cells.forEach(cell => {
        rowData.push(cell.innerHTML || '');
      });
      data.push(rowData);
      maxCols = Math.max(maxCols, rowData.length);
    });

    const tableClasses = table.className;
    let style = 'bordered';
    if (tableClasses.includes('cte-table-striped')) style = 'striped';
    else if (tableClasses.includes('cte-table-borderless')) style = 'borderless';

    return {
      rows: data.length,
      cols: maxCols,
      data,
      hasHeader: hasHeaderRow,
      style
    };
  };

  const initializeTable = (newRows: number, newCols: number) => {
    const newData: string[][] = [];
    for (let i = 0; i < newRows; i++) {
      const row: string[] = [];
      for (let j = 0; j < newCols; j++) {
        row.push('');
      }
      newData.push(row);
    }
    setTableData(newData);
  };

  const handleRowsChange = (newRows: number) => {
    setRows(newRows);
    const newData = [...tableData];
    
    if (newRows > tableData.length) {
      for (let i = tableData.length; i < newRows; i++) {
        const row = new Array(cols).fill('');
        newData.push(row);
      }
    } else if (newRows < tableData.length) {
      newData.splice(newRows);
    }
    
    setTableData(newData);
  };

  const handleColsChange = (newCols: number) => {
    setCols(newCols);
    const newData = tableData.map(row => {
      const newRow = [...row];
      if (newCols > row.length) {
        for (let i = row.length; i < newCols; i++) {
          newRow.push('');
        }
      } else if (newCols < row.length) {
        newRow.splice(newCols);
      }
      return newRow;
    });
    setTableData(newData);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
  };

  const addRow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newRow = new Array(cols).fill('');
    setTableData([...tableData, newRow]);
    setRows(rows + 1);
  };

  const removeRow = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (tableData.length > 1) {
      const newData = tableData.filter((_, i) => i !== index);
      setTableData(newData);
      setRows(rows - 1);
    }
  };

  const addColumn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newData = tableData.map(row => [...row, '']);
    setTableData(newData);
    setCols(cols + 1);
  };

  const removeColumn = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (cols > 1) {
      const newData = tableData.map(row => row.filter((_, i) => i !== index));
      setTableData(newData);
      setCols(cols - 1);
    }
  };

  const generateTableHtml = (): string => {
    let tableClass = 'cte-table tw-w-full tw-border-collapse';
    
    switch (tableStyle) {
      case 'striped':
        tableClass += ' cte-table-striped';
        break;
      case 'borderless':
        tableClass += ' cte-table-borderless';
        break;
      default:
        tableClass += ' cte-table-bordered';
    }

    let html = `<table class="${tableClass}">`;
    
    if (hasHeader && tableData.length > 0) {
      html += '<thead><tr>';
      tableData[0].forEach(cell => {
        const cellContent = cell || '&nbsp;';
        html += `<th class="tw-bg-purple-100 tw-font-semibold tw-p-2 tw-border tw-border-purple-300 tw-min-h-6">${cellContent}</th>`;
      });
      html += '</tr></thead>';
    }
    
    html += '<tbody>';
    const startIndex = hasHeader ? 1 : 0;
    
    for (let i = startIndex; i < tableData.length; i++) {
      html += '<tr>';
      tableData[i].forEach((cell) => {
        const cellContent = cell || '&nbsp;';
        const cellClass = tableStyle === 'striped' && i % 2 === 0 
          ? 'tw-bg-purple-50 tw-p-2 tw-border tw-border-purple-300 tw-min-h-6'
          : 'tw-p-2 tw-border tw-border-purple-300 tw-min-h-6';
        html += `<td class="${cellClass}">${cellContent}</td>`;
      });
      html += '</tr>';
    }
    
    html += '</tbody></table>';
    return html;
  };

  const handleSubmit = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const tableHtml = generateTableHtml();
    onInsert({ html: tableHtml, data: tableData, hasHeader, style: tableStyle });
  };

  if (!isOpen) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
      <div className="tw-bg-white tw-rounded-lg tw-shadow-xl tw-max-w-4xl tw-w-full tw-max-h-[90vh] tw-overflow-hidden tw-m-4">
        <div className="tw-bg-purple-100 tw-p-4 tw-border-b tw-border-purple-200">
          <div className="tw-flex tw-justify-between tw-items-center">
            <div>
              <h2 className="tw-text-purple-800 tw-text-xl tw-font-bold">
                {isEditing ? 'Edit Table' : 'Insert Table'}
              </h2>
              <p className="tw-text-sm tw-text-purple-600 tw-mt-1">(Ctrl+Enter to insert)</p>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="tw-text-purple-600 tw-hover:tw-text-purple-800 tw-text-xl tw-font-bold tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-hover:tw-bg-purple-200"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="tw-p-4 tw-max-h-[calc(90vh-120px)] tw-overflow-auto">
          <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4 tw-mb-4">
            <div>
              <label className="tw-text-purple-700 tw-font-medium tw-block tw-mb-1">Rows</label>
              <input
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => handleRowsChange(parseInt(e.target.value) || 1)}
                className="tw-w-full tw-border tw-border-purple-300 tw-rounded tw-px-2 tw-py-1"
              />
            </div>
            <div>
              <label className="tw-text-purple-700 tw-font-medium tw-block tw-mb-1">Columns</label>
              <input
                type="number"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => handleColsChange(parseInt(e.target.value) || 1)}
                className="tw-w-full tw-border tw-border-purple-300 tw-rounded tw-px-2 tw-py-1"
              />
            </div>
            <div>
              <label className="tw-text-purple-700 tw-font-medium tw-block tw-mb-1">Style</label>
              <select
                value={tableStyle}
                onChange={(e) => setTableStyle(e.target.value)}
                className="tw-w-full tw-border tw-border-purple-300 tw-rounded tw-px-2 tw-py-1"
              >
                <option value="bordered">Bordered</option>
                <option value="striped">Striped</option>
                <option value="borderless">Borderless</option>
              </select>
            </div>
            <div className="tw-flex tw-items-end">
              <label className="tw-flex tw-items-center tw-text-purple-700">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="tw-mr-2"
                />
                Has Header
              </label>
            </div>
          </div>

          <div className="tw-overflow-x-auto">
            <table className="tw-w-full tw-border-collapse tw-border tw-border-purple-300">
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={hasHeader && rowIndex === 0 ? 'tw-bg-purple-100' : ''}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="tw-border tw-border-purple-300 tw-p-1 tw-relative">
                        {colIndex === 0 && (
                          <div className="tw-absolute tw--left-8 tw-top-1/2 tw--translate-y-1/2 tw-flex tw-flex-col tw-gap-1">
                            <button
                              onClick={addRow}
                              className="tw-p-1 tw-border tw-border-green-400 tw-text-green-700 tw-bg-white tw-rounded tw-hover:tw-bg-green-50"
                            >
                              <Plus size={12} />
                            </button>
                            {tableData.length > 1 && (
                              <button
                                onClick={(e) => removeRow(e, rowIndex)}
                                className="tw-p-1 tw-border tw-border-red-400 tw-text-red-700 tw-bg-white tw-rounded tw-hover:tw-bg-red-50"
                              >
                                <Minus size={12} />
                              </button>
                            )}
                          </div>
                        )}
                        
                        {rowIndex === 0 && (
                          <div className="tw-absolute tw--top-8 tw-left-1/2 tw--translate-x-1/2 tw-flex tw-gap-1">
                            <button
                              onClick={addColumn}
                              className="tw-p-1 tw-border tw-border-green-400 tw-text-green-700 tw-bg-white tw-rounded tw-hover:tw-bg-green-50"
                            >
                              <Plus size={12} />
                            </button>
                            {row.length > 1 && (
                              <button
                                onClick={(e) => removeColumn(e, colIndex)}
                                className="tw-p-1 tw-border tw-border-red-400 tw-text-red-700 tw-bg-white tw-rounded tw-hover:tw-bg-red-50"
                              >
                                <Minus size={12} />
                              </button>
                            )}
                          </div>
                        )}
                        
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          className="tw-w-full tw-border-0 tw-p-1 tw-text-sm tw-bg-transparent"
                          placeholder={hasHeader && rowIndex === 0 ? 'Header' : 'Cell'}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="tw-bg-purple-50 tw-p-4 tw-border-t tw-border-purple-200 tw-flex tw-justify-end tw-gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-px-4 tw-py-2 tw-hover:tw-bg-purple-50"
          >
            Cancel
          </button>
          <button 
            onClick={(e) => handleSubmit(e)}
            className="tw-bg-purple-600 tw-text-white tw-rounded tw-px-4 tw-py-2 tw-hover:tw-bg-purple-700"
          >
            {isEditing ? 'Update Table' : 'Insert Table'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TableButton: React.FC<TableButtonProps> = ({ onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  };

  return (
    <button 
      className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-p-1 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors" 
      onClick={handleClick}
      title="Insert Table (Ctrl+Shift+B)"
    >
      <TableIcon size={16} />
    </button>
  );
};

// Floater component for table actions
const TableFloater: React.FC<TableFloaterProps> = ({ cellElement, onAction, onClose }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (cellElement && typeof window !== 'undefined') {
      const rect = cellElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setPosition({
        top: rect.bottom + scrollTop + 5,
        left: rect.left + scrollLeft
      });
    }
  }, [cellElement]);

  const actions = [
    { 
      key: 'addRowAbove', 
      label: 'Add Row Above', 
      icon: <ChevronUp size={12} />,
      className: 'tw-text-green-600 tw-hover:tw-bg-green-50'
    },
    { 
      key: 'addRowBelow', 
      label: 'Add Row Below', 
      icon: <ChevronDown size={12} />,
      className: 'tw-text-green-600 tw-hover:tw-bg-green-50'
    },
    { 
      key: 'addColumnLeft', 
      label: 'Add Column Left', 
      icon: <ChevronLeft size={12} />,
      className: 'tw-text-green-600 tw-hover:tw-bg-green-50'
    },
    { 
      key: 'addColumnRight', 
      label: 'Add Column Right', 
      icon: <ChevronRight size={12} />,
      className: 'tw-text-green-600 tw-hover:tw-bg-green-50'
    },
    { 
      key: 'deleteRow', 
      label: 'Delete Row', 
      icon: <Minus size={12} />,
      className: 'tw-text-red-600 tw-hover:tw-bg-red-50'
    },
    { 
      key: 'deleteColumn', 
      label: 'Delete Column', 
      icon: <Minus size={12} />,
      className: 'tw-text-red-600 tw-hover:tw-bg-red-50'
    },
    { 
      key: 'deleteTable', 
      label: 'Delete Table', 
      icon: <Trash2 size={12} />,
      className: 'tw-text-red-600 tw-hover:tw-bg-red-50'
    }
  ];

  return (
    <div
      className="cte-table-floater tw-fixed tw-bg-white tw-border tw-border-purple-300 tw-rounded tw-shadow-lg tw-p-2 tw-z-50"
      style={{
        top: position.top,
        left: position.left
      }}
    >
      <div className="tw-flex tw-flex-col tw-gap-1">
        {actions.map(action => (
          <button
            key={action.key}
            className={`tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1 tw-text-xs tw-rounded tw-transition-colors tw-w-full tw-text-left ${action.className}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAction(action.key);
              onClose();
            }}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const handleTableInsertion = (
  tableData: TableData, 
  editorRef: RefObject<HTMLElement>, 
  setShowTableModal: (show: boolean) => void, 
  handleChange: () => void
): boolean => {
  try {
    if (!editorRef.current || typeof window === 'undefined') return false;

    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    if (range) {
      range.deleteContents();
      
      const tableWrapper = document.createElement('div');
      tableWrapper.className = 'cte-table-wrapper tw-my-4 tw-overflow-x-auto';
      tableWrapper.innerHTML = tableData.html;
      
      // Insert table
      range.insertNode(tableWrapper);
      
      // Add empty paragraph after table
      const emptyParagraph = document.createElement('p');
      emptyParagraph.innerHTML = '<br>';
      
      const newRange = document.createRange();
      newRange.setStartAfter(tableWrapper);
      newRange.insertNode(emptyParagraph);
      
      // Set cursor in the empty paragraph
      newRange.setStart(emptyParagraph, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      const tableWrapper = document.createElement('div');
      tableWrapper.className = 'cte-table-wrapper tw-my-4 tw-overflow-x-auto';
      tableWrapper.innerHTML = tableData.html;
      
      // Add empty paragraph after table
      const emptyParagraph = document.createElement('p');
      emptyParagraph.innerHTML = '<br>';
      
      editorRef.current.appendChild(tableWrapper);
      editorRef.current.appendChild(emptyParagraph);
    }

    setShowTableModal(false);
    
    setTimeout(() => {
      setupTableHandlers(editorRef);
      if (handleChange) handleChange();
    }, 100);

    return true;
  } catch (error) {
    console.error('Error inserting table:', error);
    return false;
  }
};

let currentFloater: HTMLElement | null = null;

const setupTableHandlers = (editorRef: RefObject<HTMLElement>): void => {
  if (!editorRef.current || typeof window === 'undefined') return;

  const tables = editorRef.current.querySelectorAll('.cte-table');
  
  tables.forEach(table => {
    if ((table as HTMLElement).dataset.handlersSetup) return;
    
    // Handle cell clicks for floater
    const cells = table.querySelectorAll('td, th');
    cells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Close existing floater
        if (currentFloater) {
          currentFloater.remove();
          currentFloater = null;
        }

        // Create new floater
        const floaterContainer = document.createElement('div');
        document.body.appendChild(floaterContainer);
        
        const closeFloater = () => {
          if (currentFloater) {
            currentFloater.remove();
            currentFloater = null;
          }
        };

        const handleFloaterAction = (action: string) => {
          const table = (cell as HTMLElement).closest('.cte-table') as HTMLElement;
          const tableWrapper = table?.closest('.cte-table-wrapper');
          const cellIndex = Array.from((cell as HTMLElement).parentNode!.children).indexOf(cell as HTMLElement);
          const rowIndex = Array.from((cell as HTMLElement).parentNode!.parentNode!.children).indexOf((cell as HTMLElement).parentNode as HTMLElement);

          switch (action) {
            case 'addRowAbove':
              addRowToTable(table, rowIndex, 'above');
              break;
            case 'addRowBelow':
              addRowToTable(table, rowIndex, 'below');
              break;
            case 'addColumnLeft':
              addColumnToTable(table, cellIndex, 'left');
              break;
            case 'addColumnRight':
              addColumnToTable(table, cellIndex, 'right');
              break;
            case 'deleteRow':
              deleteRowFromTable(table, rowIndex);
              break;
            case 'deleteColumn':
              deleteColumnFromTable(table, cellIndex);
              break;
            case 'deleteTable':
              if (tableWrapper) {
                tableWrapper.remove();
              }
              break;
          }

          setTimeout(() => {
            setupTableHandlers(editorRef);
            if ((editorRef.current as any).onchange) (editorRef.current as any).onchange();
          }, 50);
        };

        // Create React component for floater
        const FloaterComponent = () => (
          React.createElement(TableFloater, {
            cellElement: cell as HTMLElement,
            onAction: handleFloaterAction,
            onClose: closeFloater
          })
        );

        // Render floater
        if (typeof window !== 'undefined' && (window as any).React && (window as any).ReactDOM) {
          (window as any).ReactDOM.render(React.createElement(FloaterComponent), floaterContainer);
        }
        
        currentFloater = floaterContainer;

        // Close floater when clicking outside
        setTimeout(() => {
          const handleOutsideClick = (event: Event) => {
            if (currentFloater && !currentFloater.contains(event.target as Node) && !cell.contains(event.target as Node)) {
              closeFloater();
              document.removeEventListener('click', handleOutsideClick);
            }
          };
          document.addEventListener('click', handleOutsideClick);
        }, 100);
      });
    });

    // Handle double click for editing
    table.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const tableWrapper = table.closest('.cte-table-wrapper') as HTMLElement;
      if (tableWrapper) {
        tableWrapper.classList.add('cte-table-editing');
        
        const editButton = document.createElement('button');
        editButton.className = 'cte-table-edit-btn tw-absolute tw--top-8 tw-right-0 tw-bg-purple-600 tw-text-white tw-p-1 tw-rounded tw-text-xs tw-hover:tw-bg-purple-700';
        editButton.innerHTML = '<span>Edit</span>';
        editButton.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          
          const customEvent = new CustomEvent('editTable', {
            detail: { table: table }
          });
          editorRef.current!.dispatchEvent(customEvent);
        };
        
        tableWrapper.style.position = 'relative';
        tableWrapper.appendChild(editButton);
        
        setTimeout(() => {
          if (editButton.parentNode) {
            editButton.remove();
          }
          tableWrapper.classList.remove('cte-table-editing');
        }, 3000);
      }
    });
    
    (table as HTMLElement).dataset.handlersSetup = 'true';
  });
};

// Helper functions for table manipulation
const addRowToTable = (table: HTMLElement, rowIndex: number, position: 'above' | 'below'): void => {
  const rows = table.querySelectorAll('tbody tr, thead tr');
  const targetRow = rows[rowIndex] as HTMLElement;
  const colCount = targetRow.children.length;
  
  const newRow = document.createElement('tr');
  for (let i = 0; i < colCount; i++) {
    const newCell = document.createElement('td');
    newCell.innerHTML = '&nbsp;';
    newCell.className = targetRow.children[i].className;
    newRow.appendChild(newCell);
  }
  
  if (position === 'above') {
    targetRow.parentNode!.insertBefore(newRow, targetRow);
  } else {
    targetRow.parentNode!.insertBefore(newRow, targetRow.nextSibling);
  }
};

const addColumnToTable = (table: HTMLElement, colIndex: number, position: 'left' | 'right'): void => {
  const rows = table.querySelectorAll('tbody tr, thead tr');
  
  rows.forEach((row) => {
    const targetCell = row.children[colIndex] as HTMLElement;
    const newCell = document.createElement(targetCell.tagName.toLowerCase());
    newCell.innerHTML = '&nbsp;';
    newCell.className = targetCell.className;
    
    if (position === 'left') {
      row.insertBefore(newCell, targetCell);
    } else {
      row.insertBefore(newCell, targetCell.nextSibling);
    }
  });
};

const deleteRowFromTable = (table: HTMLElement, rowIndex: number): void => {
  const rows = table.querySelectorAll('tbody tr, thead tr');
  if (rows.length > 1) {
    rows[rowIndex].remove();
  }
};

const deleteColumnFromTable = (table: HTMLElement, colIndex: number): void => {
  const rows = table.querySelectorAll('tbody tr, thead tr');
  const firstRowCells = rows[0].children;
  
  if (firstRowCells.length > 1) {
    rows.forEach(row => {
      if (row.children[colIndex]) {
        row.children[colIndex].remove();
      }
    });
  }
};

const updateTableInEditor = (
  tableData: TableData, 
  editingTable: HTMLElement, 
  editorRef: RefObject<HTMLElement>, 
  setShowTableModal: (show: boolean) => void, 
  setEditingTable: (table: HTMLElement | null) => void, 
  handleChange: () => void
): boolean => {
  try {
    if (!editingTable || !editorRef.current) return false;

    const tableWrapper = editingTable.closest('.cte-table-wrapper') as HTMLElement;
    if (tableWrapper) {
      tableWrapper.innerHTML = tableData.html;
      
      setTimeout(() => {
        setupTableHandlers(editorRef);
        if (handleChange) handleChange();
      }, 100);
    }

    setShowTableModal(false);
    setEditingTable(null);
    
    return true;
  } catch (error) {
    console.error('Error updating table:', error);
    return false;
  }
};

const getTableStyles = (): string => {
  return `
    .cte-table-wrapper {
      position: relative;
      margin: 16px 0;
      overflow-x: auto;
    }
    
    .cte-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
      font-size: inherit;
      line-height: inherit;
    }
    
    .cte-table-bordered {
      border: 1px solid #c084fc;
    }
    
    .cte-table-bordered th,
    .cte-table-bordered td {
      border: 1px solid #c084fc;
      padding: 8px;
      min-height: 1.5em;
      vertical-align: top;
      cursor: pointer;
    }
    
    .cte-table-striped tbody tr:nth-of-type(odd) {
      background-color: #faf5ff;
    }
    
    .cte-table-striped th,
    .cte-table-striped td {
      border: 1px solid #e9d5ff;
      padding: 8px;
      min-height: 1.5em;
      vertical-align: top;
      cursor: pointer;
    }
    
    .cte-table-borderless th,
    .cte-table-borderless td {
      border: none;
      padding: 8px;
      min-height: 1.5em;
      vertical-align: top;
      cursor: pointer;
    }
    
    .cte-table th {
      background-color: #f3e8ff;
      font-weight: 600;
      color: #7c3aed;
      min-height: 1.5em;
      vertical-align: top;
      cursor: pointer;
    }
    
    .cte-table td:empty::before,
    .cte-table th:empty::before {
      content: "\\00a0";
      color: transparent;
    }
    
    .cte-table td:hover,
    .cte-table th:hover {
      background-color: #f3e8ff !important;
    }
    
    .cte-table-editing {
      outline: 2px solid #8b5cf6;
      outline-offset: 2px;
    }
    
    .cte-table-edit-btn {
      position: absolute;
      top: -32px;
      right: 0;
      background-color: #7c3aed;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      border: none;
      cursor: pointer;
      z-index: 10;
    }
    
    .cte-table-edit-btn:hover {
      background-color: #6d28d9;
    }
    
    .cte-table-floater {
      min-width: 150px;
      max-width: 200px;
    }
    
    .cte-table-floater button {
      border: none;
      background: transparent;
    }
    
    @media (max-width: 768px) {
      .cte-table-wrapper {
        overflow-x: scroll;
      }
      
      .cte-table {
        min-width: 500px;
      }
      
      .cte-table-floater {
        min-width: 120px;
        max-width: 150px;
      }
    }
  `;
};

const Table = {
  Modal: TableModal,
  Button: TableButton,
  Floater: TableFloater,
  handleTableInsertion,
  setupTableHandlers,
  updateTableInEditor,
  getTableStyles
};

export default Table;
export { 
  TableModal, 
  TableButton, 
  TableFloater, 
  handleTableInsertion, 
  setupTableHandlers, 
  updateTableInEditor, 
  getTableStyles 
};