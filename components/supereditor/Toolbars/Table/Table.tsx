'use client';

import React, { useState, useEffect, RefObject } from 'react';
import { Table as TableIcon, Plus, Minus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trash2, Grid3X3, Edit } from 'lucide-react';
import { LearningModal } from '../../../modal/ModalTemplate';
import { ButtonGradient } from '../../../button/ButtonTemplate';
import { ShortFormField, SelectCustomField } from '../../../form/FormComponentLayout';

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

interface EditingTable {
  element: HTMLElement;
  data: string[][];
  hasHeader: boolean;
  style: string;
}

interface TableComponentProps {
  editorRef: RefObject<HTMLElement>;
  setEditingTable: (editingTable: EditingTable | null) => void;
  setShowTableModal: (show: boolean) => void;
  handleChange: () => void;
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
  const [loading, setLoading] = useState(false);

  // Initialize table data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialTable && isEditing) {
        const parsedTable = parseTableFromHtml(initialTable);
        setRows(parsedTable.rows);
        setCols(parsedTable.cols);
        setTableData(parsedTable.data);
        setHasHeader(parsedTable.hasHeader);
        setTableStyle(parsedTable.style);
      } else {
        // Reset to defaults for new table
        setRows(3);
        setCols(3);
        setHasHeader(true);
        setTableStyle('bordered');
        initializeTable(3, 3);
      }
    }
  }, [isOpen, initialTable, isEditing]);

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
    const validRows = Math.max(1, Math.min(20, newRows));
    setRows(validRows);
    const newData = [...tableData];
    
    if (validRows > tableData.length) {
      for (let i = tableData.length; i < validRows; i++) {
        const row = new Array(cols).fill('');
        newData.push(row);
      }
    } else if (validRows < tableData.length) {
      newData.splice(validRows);
    }
    
    setTableData(newData);
  };

  const handleColsChange = (newCols: number) => {
    const validCols = Math.max(1, Math.min(10, newCols));
    setCols(validCols);
    const newData = tableData.map(row => {
      const newRow = [...row];
      if (validCols > row.length) {
        for (let i = row.length; i < validCols; i++) {
          newRow.push('');
        }
      } else if (validCols < row.length) {
        newRow.splice(validCols);
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

  const addRow = () => {
    if (rows < 20) {
      const newRow = new Array(cols).fill('');
      setTableData([...tableData, newRow]);
      setRows(rows + 1);
    }
  };

  const removeRow = (index: number) => {
    if (tableData.length > 1) {
      const newData = tableData.filter((_, i) => i !== index);
      setTableData(newData);
      setRows(rows - 1);
    }
  };

  const addColumn = () => {
    if (cols < 10) {
      const newData = tableData.map(row => [...row, '']);
      setTableData(newData);
      setCols(cols + 1);
    }
  };

  const removeColumn = (index: number) => {
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
      const tableHtml = generateTableHtml();
      onInsert({ html: tableHtml, data: tableData, hasHeader, style: tableStyle });
    } catch (error) {
      console.error('Error inserting table:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRows(3);
    setCols(3);
    setHasHeader(true);
    setTableStyle('bordered');
    initializeTable(3, 3);
  };

  // Style options for select
  const styleOptions = [
    { label: 'Bordered', value: 'bordered' },
    { label: 'Striped', value: 'striped' },
    { label: 'Borderless', value: 'borderless' }
  ];

  const selectedStyleOption = styleOptions.find(option => option.value === tableStyle) || null;

  const modalButtons = [
    {
      action: 'cancel' as const,
      text: 'Cancel',
      onClick: onClose,
      disabled: loading
    },
    {
      action: 'save' as const,
      text: isEditing ? 'Update Table' : 'Insert Table',
      onClick: handleSubmit,
      disabled: loading,
      loading: loading
    }
  ];

  const topButtons = [
    {
      action: 'clear' as const,
      text: 'Clear All',
      onClick: handleClear,
      disabled: loading
    }
  ];

  return (
    <LearningModal
      show={isOpen}
      onHide={onClose}
      title={isEditing ? 'Edit Table' : 'Insert Table'}
      subtitle="Create and customize your table structure"
      icon={<Grid3X3 className="tw-w-5 tw-h-5" />}
      size="xl"
      width="90vw"
      height="85vh"
      topButtons={topButtons}
      bottomButtons={modalButtons}
      showCloseButton={true}
      preventCloseOnOutsideClick={loading}
    >
      <div className="tw-space-y-6">
        {/* Table Configuration */}
        <div className="tw-bg-white tw-rounded-xl tw-p-6 tw-shadow-sm tw-border tw-border-purple-100">
          <h3 className="tw-text-lg tw-font-semibold tw-text-purple-700 tw-mb-4 tw-flex tw-items-center tw-gap-2">
            <TableIcon className="tw-w-5 tw-h-5" />
            Table Configuration
          </h3>
          
          <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4 tw-mb-4">
            <ShortFormField
              label="Rows"
              type="number"
              value={rows.toString()}
              onChange={(value) => handleRowsChange(parseInt(value) || 1)}
              placeholder="3"
              min="1"
              max="20"
              disabled={loading}
            />
            
            <ShortFormField
              label="Columns"
              type="number"
              value={cols.toString()}
              onChange={(value) => handleColsChange(parseInt(value) || 1)}
              placeholder="3"
              min="1"
              max="10"
              disabled={loading}
            />
            
            <SelectCustomField
              label="Table Style"
              value={selectedStyleOption}
              options={styleOptions}
              onChange={(option) => setTableStyle(option?.value || 'bordered')}
              placeholder="Select style..."
              loading={loading}
            />
            
            <div className="tw-flex tw-flex-col tw-gap-2">
              <label className="tw-text-sm tw-font-medium tw-text-purple-700">Options</label>
              <label className="tw-flex tw-items-center tw-text-purple-700 tw-text-sm">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="tw-mr-2 tw-accent-purple-600"
                  disabled={loading}
                />
                Has Header Row
              </label>
            </div>
          </div>
        </div>

        {/* Table Editor */}
        <div className="tw-bg-white tw-rounded-xl tw-p-6 tw-shadow-sm tw-border tw-border-purple-100">
          <h3 className="tw-text-lg tw-font-semibold tw-text-purple-700 tw-mb-4">
            Table Content
          </h3>
          
          <div className="tw-overflow-x-auto tw-bg-gray-50 tw-rounded-xl tw-p-4">
            <div className="tw-relative tw-min-w-max">
              <table className="tw-w-full tw-border-collapse tw-border tw-border-purple-300 tw-bg-white tw-rounded-lg tw-overflow-hidden">
                <tbody>
                  {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex} className={hasHeader && rowIndex === 0 ? 'tw-bg-purple-100' : ''}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="tw-border tw-border-purple-300 tw-p-1 tw-relative tw-min-w-24">
                          {/* Row controls - only show on first column */}
                          {colIndex === 0 && (
                            <div className="tw-absolute tw--left-20 tw-top-1/2 tw--translate-y-1/2 tw-flex tw-flex-col tw-gap-1">
                              <ButtonGradient
                                action="add"
                                showText={false}
                                customIcon={<Plus size={12} />}
                                onClick={addRow}
                                size="sm"
                                disabled={loading || rows >= 20}
                                customColors={{
                                  primary: '#10B981',
                                  secondary: '#059669',
                                  gradient1: '#10B981',
                                  gradient2: '#34D399',
                                  text: '#FFFFFF'
                                }}
                              />
                              {tableData.length > 1 && (
                                <ButtonGradient
                                  action="remove"
                                  showText={false}
                                  customIcon={<Minus size={12} />}
                                  onClick={() => removeRow(rowIndex)}
                                  size="sm"
                                  disabled={loading}
                                  customColors={{
                                    primary: '#EF4444',
                                    secondary: '#DC2626',
                                    gradient1: '#EF4444',
                                    gradient2: '#DC2626',
                                    text: '#FFFFFF'
                                  }}
                                />
                              )}
                            </div>
                          )}
                          
                          {/* Column controls - only show on first row */}
                          {rowIndex === 0 && (
                            <div className="tw-absolute tw--top-20 tw-left-1/2 tw--translate-x-1/2 tw-flex tw-gap-1">
                              <ButtonGradient
                                action="add"
                                showText={false}
                                customIcon={<Plus size={12} />}
                                onClick={addColumn}
                                size="sm"
                                disabled={loading || cols >= 10}
                                customColors={{
                                  primary: '#10B981',
                                  secondary: '#059669',
                                  gradient1: '#10B981',
                                  gradient2: '#34D399',
                                  text: '#FFFFFF'
                                }}
                              />
                              {row.length > 1 && (
                                <ButtonGradient
                                  action="remove"
                                  showText={false}
                                  customIcon={<Minus size={12} />}
                                  onClick={() => removeColumn(colIndex)}
                                  size="sm"
                                  disabled={loading}
                                  customColors={{
                                    primary: '#EF4444',
                                    secondary: '#DC2626',
                                    gradient1: '#EF4444',
                                    gradient2: '#DC2626',
                                    text: '#FFFFFF'
                                  }}
                                />
                              )}
                            </div>
                          )}
                          
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                            className="tw-w-full tw-border-0 tw-p-2 tw-text-sm tw-bg-transparent focus:tw-bg-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-purple-300 tw-rounded"
                            placeholder={hasHeader && rowIndex === 0 ? 'Header' : 'Cell'}
                            disabled={loading}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Table Preview */}
        {tableData.length > 0 && (
          <div className="tw-bg-white tw-rounded-xl tw-p-6 tw-shadow-sm tw-border tw-border-purple-100">
            <h3 className="tw-text-lg tw-font-semibold tw-text-purple-700 tw-mb-4">
              Table Preview
            </h3>
            
            <div className="tw-overflow-x-auto tw-bg-gray-50 tw-rounded-xl tw-p-4">
              <div dangerouslySetInnerHTML={{ __html: generateTableHtml() }} />
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="tw-bg-gradient-to-r tw-from-blue-50 tw-to-purple-50 tw-rounded-xl tw-p-6 tw-border tw-border-blue-200">
          <h3 className="tw-text-lg tw-font-semibold tw-text-blue-700 tw-mb-3">
            Table Creation Tips
          </h3>
          <ul className="tw-space-y-2 tw-text-sm tw-text-blue-600">
            <li className="tw-flex tw-items-start tw-gap-2">
              <span className="tw-text-blue-500 tw-font-bold">•</span>
              Use the + and - buttons to add or remove rows and columns
            </li>
            <li className="tw-flex tw-items-start tw-gap-2">
              <span className="tw-text-blue-500 tw-font-bold">•</span>
              Enable "Has Header Row" for tables with column titles
            </li>
            <li className="tw-flex tw-items-start tw-gap-2">
              <span className="tw-text-blue-500 tw-font-bold">•</span>
              Choose from bordered, striped, or borderless table styles
            </li>
            <li className="tw-flex tw-items-start tw-gap-2">
              <span className="tw-text-blue-500 tw-font-bold">•</span>
              Double-click any table after insertion to edit it again
            </li>
            <li className="tw-flex tw-items-start tw-gap-2">
              <span className="tw-text-blue-500 tw-font-bold">•</span>
              Click table cells for additional row/column options
            </li>
          </ul>
        </div>
      </div>
    </LearningModal>
  );
};

const TableButton: React.FC<TableButtonProps> = ({ onClick }) => {
  return (
    <ButtonGradient
      action="custom"
      showText={false}
      customIcon={<TableIcon className="tw-w-4 tw-h-4" />}
      onClick={(e) => onClick(e!)}
      size="sm"
      customColors={{
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        gradient1: '#8B5CF6',
        gradient2: '#A855F7',
        text: '#FFFFFF'
      }}
    />
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
      action: 'add' as const,
      colors: {
        primary: '#10B981',
        secondary: '#059669',
        gradient1: '#10B981',
        gradient2: '#34D399',
        text: '#FFFFFF'
      }
    },
    { 
      key: 'addRowBelow', 
      label: 'Add Row Below', 
      icon: <ChevronDown size={12} />,
      action: 'add' as const,
      colors: {
        primary: '#10B981',
        secondary: '#059669',
        gradient1: '#10B981',
        gradient2: '#34D399',
        text: '#FFFFFF'
      }
    },
    { 
      key: 'addColumnLeft', 
      label: 'Add Column Left', 
      icon: <ChevronLeft size={12} />,
      action: 'add' as const,
      colors: {
        primary: '#10B981',
        secondary: '#059669',
        gradient1: '#10B981',
        gradient2: '#34D399',
        text: '#FFFFFF'
      }
    },
    { 
      key: 'addColumnRight', 
      label: 'Add Column Right', 
      icon: <ChevronRight size={12} />,
      action: 'add' as const,
      colors: {
        primary: '#10B981',
        secondary: '#059669',
        gradient1: '#10B981',
        gradient2: '#34D399',
        text: '#FFFFFF'
      }
    },
    { 
      key: 'deleteRow', 
      label: 'Delete Row', 
      icon: <Minus size={12} />,
      action: 'delete' as const,
      colors: {
        primary: '#EF4444',
        secondary: '#DC2626',
        gradient1: '#EF4444',
        gradient2: '#DC2626',
        text: '#FFFFFF'
      }
    },
    { 
      key: 'deleteColumn', 
      label: 'Delete Column', 
      icon: <Minus size={12} />,
      action: 'delete' as const,
      colors: {
        primary: '#EF4444',
        secondary: '#DC2626',
        gradient1: '#EF4444',
        gradient2: '#DC2626',
        text: '#FFFFFF'
      }
    },
    { 
      key: 'deleteTable', 
      label: 'Delete Table', 
      icon: <Trash2 size={12} />,
      action: 'delete' as const,
      colors: {
        primary: '#EF4444',
        secondary: '#DC2626',
        gradient1: '#EF4444',
        gradient2: '#DC2626',
        text: '#FFFFFF'
      }
    }
  ];

  return (
    <div
      className="cte-table-floater tw-fixed tw-bg-white tw-border-2 tw-border-purple-300 tw-rounded-xl tw-shadow-lg tw-p-3 tw-z-50"
      style={{
        top: position.top,
        left: position.left
      }}
    >
      <div className="tw-flex tw-flex-col tw-gap-2">
        {actions.map(actionItem => (
          <ButtonGradient
            key={actionItem.key}
            action={actionItem.action}
            customText={actionItem.label}
            customIcon={actionItem.icon}
            onClick={() => {
              onAction(actionItem.key);
              onClose();
            }}
            size="sm"
            customColors={actionItem.colors}
            className="tw-justify-start tw-min-w-36"
          />
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
      emptyParagraph.innerHTML = '&nbsp;';
      
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
      emptyParagraph.innerHTML = '&nbsp;';
      
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
  editingTable: EditingTable, 
  editorRef: RefObject<HTMLElement>, 
  setShowTableModal: (show: boolean) => void, 
  setEditingTable: (table: EditingTable | null) => void, 
  handleChange: () => void
): boolean => {
  try {
    if (!editingTable?.element || !editorRef.current) return false;

    const tableWrapper = editingTable.element.closest('.cte-table-wrapper') as HTMLElement;
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
      transition: background-color 0.2s ease;
    }
    
    .cte-table-edit-btn:hover {
      background-color: #6d28d9;
    }
    
    .cte-table-floater {
      min-width: 150px;
      max-width: 200px;
      animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .cte-table-floater button {
      border: none;
      background: transparent;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .cte-table-wrapper {
        overflow-x: scroll;
        scrollbar-width: thin;
        scrollbar-color: #c084fc #f3e8ff;
      }
      
      .cte-table-wrapper::-webkit-scrollbar {
        height: 6px;
      }
      
      .cte-table-wrapper::-webkit-scrollbar-track {
        background: #f3e8ff;
      }
      
      .cte-table-wrapper::-webkit-scrollbar-thumb {
        background: #c084fc;
        border-radius: 3px;
      }
      
      .cte-table {
        min-width: 500px;
      }
      
      .cte-table-floater {
        min-width: 120px;
        max-width: 150px;
      }
      
      .cte-table th,
      .cte-table td {
        padding: 6px;
        font-size: 14px;
      }
    }
    
    /* Mobile specific styles */
    @media (max-width: 480px) {
      .cte-table th,
      .cte-table td {
        padding: 4px;
        font-size: 13px;
      }
      
      .cte-table-edit-btn {
        top: -28px;
        font-size: 11px;
        padding: 3px 6px;
      }
    }
    
    /* Print styles */
    @media print {
      .cte-table-edit-btn {
        display: none;
      }
      
      .cte-table-floater {
        display: none;
      }
      
      .cte-table {
        break-inside: avoid;
      }
    }
    
    /* Focus styles for accessibility */
    .cte-table td:focus,
    .cte-table th:focus {
      outline: 2px solid #8b5cf6;
      outline-offset: 2px;
    }
    
    /* Table selection styles */
    .cte-table td.selected,
    .cte-table th.selected {
      background-color: #e9d5ff !important;
    }
  `;
};

// Export components and utilities
export const Button = TableButton;
export const Modal = TableModal;
export const Floater = TableFloater;

// Main Table object with all functionality
const Table = {
  Button: TableButton,
  Modal: TableModal,
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
  getTableStyles,
  type TableData,
  type TableModalProps,
  type TableButtonProps,
  type TableFloaterProps,
  type EditingTable,
  type TableComponentProps
};