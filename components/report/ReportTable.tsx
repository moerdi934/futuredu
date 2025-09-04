// components/report/ReportTable.tsx

import React, { useMemo } from 'react';
import { Table, Spinner } from 'react-bootstrap';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { ColumnConfig, SortConfig, ColGroup, ActionColumnButton } from '../../types/report';
import { ButtonGradient, ActionType } from '../button/ButtonTemplate';
import { buildColGroups, getDefaultFormatter } from '../../utils/reportUtils';

interface ReportTableProps {
  data: any[];
  columns: ColumnConfig[];
  colGroups?: ColGroup[];
  visibleColumns: string[];
  freezeColumn: string | null;
  sortConfig: SortConfig[];
  onSort: (key: string) => void;
  loading?: boolean;
  showIcon?: boolean;
  showRowNumber?: boolean;
  rowHeight?: number;
  maxHeight?: string; // New prop for custom max height
  actionColumn?: {
    enabled: boolean;
    label?: string;
    width?: number;
    buttons: ActionColumnButton[];
    sticky?: boolean;
  };
}

const ReportTable: React.FC<ReportTableProps> = ({
  data,
  columns,
  colGroups,
  visibleColumns,
  freezeColumn,
  sortConfig,
  onSort,
  loading = false,
  showIcon = false,
  showRowNumber = true,
  maxHeight = 'calc(100vh - 200px)', // Default to viewport minus header/footer space
  actionColumn
}) => {
  const effectiveColGroups = useMemo(() => {
    return colGroups || buildColGroups(columns);
  }, [columns, colGroups]);

  const visibleColumnsData = useMemo(() => {
    return columns.filter(col => visibleColumns.includes(col.key));
  }, [columns, visibleColumns]);

  const freezeIndex = useMemo(() => {
    if (!freezeColumn) return -1;
    let index = 0;
    if (showIcon) index++;
    if (showRowNumber) index++;
    
    const columnIndex = visibleColumnsData.findIndex(col => col.key === freezeColumn);
    return columnIndex >= 0 ? index + columnIndex : -1;
  }, [freezeColumn, visibleColumnsData, showIcon, showRowNumber]);

  const getSortIcon = (columnKey: string) => {
    const sort = sortConfig.find(s => s.key === columnKey);
    if (!sort) return <FaSort className="tw-opacity-50" />;
    return sort.direction === 'asc' 
      ? <FaSortUp className="tw-text-purple-600" />
      : <FaSortDown className="tw-text-purple-600" />;
  };

  const renderCell = (column: ColumnConfig, value: any, row: any, index: number) => {
    const formatter = column.formatter || getDefaultFormatter(column.type);
    return (
      <div className="tw-px-3 tw-py-2 tw-text-sm tw-truncate" style={{ maxWidth: column.width || 150 }}>
        {formatter(value, row)}
      </div>
    );
  };

  // Map variant ke action type dan custom colors untuk ButtonGradient
  const getActionTypeAndColors = (variant: ActionColumnButton['variant'], label: string) => {
    const labelLower = label.toLowerCase();
    
    // Smart detection berdasarkan label
    let actionType: ActionType = 'custom';
    if (labelLower.includes('detail') || labelLower.includes('view') || labelLower.includes('lihat')) actionType = 'view';
    else if (labelLower.includes('edit') || labelLower.includes('ubah')) actionType = 'edit';
    else if (labelLower.includes('delete') || labelLower.includes('hapus') || labelLower.includes('remove')) actionType = 'delete';
    else if (labelLower.includes('copy') || labelLower.includes('salin')) actionType = 'copy';
    else if (labelLower.includes('download') || labelLower.includes('unduh')) actionType = 'download';
    else if (labelLower.includes('print') || labelLower.includes('cetak')) actionType = 'export';

    // Custom colors berdasarkan variant
    const colorMap = {
      'primary': { primary: '#3B82F6', secondary: '#2563EB', gradient1: '#3B82F6', gradient2: '#60A5FA', text: '#FFFFFF' },
      'secondary': { primary: '#6B7280', secondary: '#4B5563', gradient1: '#6B7280', gradient2: '#9CA3AF', text: '#FFFFFF' },
      'success': { primary: '#10B981', secondary: '#059669', gradient1: '#10B981', gradient2: '#34D399', text: '#FFFFFF' },
      'warning': { primary: '#F59E0B', secondary: '#D97706', gradient1: '#F59E0B', gradient2: '#FBBF24', text: '#FFFFFF' },
      'danger': { primary: '#EF4444', secondary: '#DC2626', gradient1: '#EF4444', gradient2: '#F87171', text: '#FFFFFF' },
      'info': { primary: '#06B6D4', secondary: '#0891B2', gradient1: '#06B6D4', gradient2: '#22D3EE', text: '#FFFFFF' },
      'outline-primary': { primary: '#3B82F6', secondary: '#2563EB', gradient1: '#EFF6FF', gradient2: '#DBEAFE', text: '#3B82F6' },
      'outline-secondary': { primary: '#6B7280', secondary: '#4B5563', gradient1: '#F9FAFB', gradient2: '#F3F4F6', text: '#6B7280' },
      'outline-success': { primary: '#10B981', secondary: '#059669', gradient1: '#F0FDF4', gradient2: '#DCFCE7', text: '#10B981' },
      'outline-warning': { primary: '#F59E0B', secondary: '#D97706', gradient1: '#FFFBEB', gradient2: '#FEF3C7', text: '#F59E0B' },
      'outline-danger': { primary: '#EF4444', secondary: '#DC2626', gradient1: '#FEF2F2', gradient2: '#FEE2E2', text: '#EF4444' },
      'outline-info': { primary: '#06B6D4', secondary: '#0891B2', gradient1: '#F0F9FF', gradient2: '#E0F2FE', text: '#06B6D4' }
    };

    return {
      actionType,
      customColors: colorMap[variant || 'primary'] || colorMap.primary
    };
  };

  const renderActionButtons = (row: any, rowIndex: number) => {
    if (!actionColumn?.enabled || !actionColumn.buttons?.length) return null;

    return (
      <div className="tw-flex tw-gap-1 tw-justify-center tw-items-center tw-px-2 tw-flex-wrap">
        {actionColumn.buttons.map((button, buttonIndex) => {
          const { actionType, customColors } = getActionTypeAndColors(button.variant, button.label);
          
          return (
            <div key={buttonIndex} className="tw-flex-shrink-0">
              <ButtonGradient
                action={actionType}
                customText={button.label}
                customIcon={button.icon || undefined}
                customColors={customColors}
                onClick={() => button.onClick(row, rowIndex)}
                disabled={loading}
                size="sm"
                className={`tw-min-w-[80px] tw-text-xs ${button.className || ''}`}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const renderColGroupHeaders = () => {
    return (
      <tr className="tw-bg-gradient-to-r tw-from-purple-100 tw-to-purple-50">
        {showIcon && (
          <th 
            className={`tw-p-0 tw-sticky tw-top-0 tw-z-30 tw-bg-purple-100 ${
              freezeIndex >= 0 ? 'tw-sticky tw-left-0 tw-z-40' : ''
            }`}
          ></th>
        )}
        {showRowNumber && (
          <th 
            className={`tw-p-0 tw-sticky tw-top-0 tw-z-30 tw-bg-purple-100 ${
              freezeIndex >= 1 || (freezeIndex >= 0 && !showIcon) ? 'tw-sticky tw-left-0 tw-z-40' : ''
            }`}
            style={{ left: showIcon ? '50px' : '0' }}
          ></th>
        )}
        {effectiveColGroups.map(group => {
          const groupColumns = group.columns.filter(colKey => visibleColumns.includes(colKey));
          if (groupColumns.length === 0) return null;
          
          if (group.label) {
            return (
              <th
                key={group.key}
                colSpan={groupColumns.length}
                className="tw-text-center tw-py-2 tw-px-3 tw-font-semibold tw-text-purple-800 tw-border-b tw-border-purple-200 tw-sticky tw-top-0 tw-z-30 tw-bg-purple-100"
              >
                {group.label}
              </th>
            );
          } else {
            return groupColumns.map(colKey => (
              <th key={colKey} className="tw-p-0 tw-sticky tw-top-0 tw-z-30 tw-bg-purple-100"></th>
            ));
          }
        })}
        {actionColumn?.enabled && (
          <th 
            className={`tw-p-0 tw-sticky tw-top-0 tw-z-30 tw-bg-purple-100 ${
              actionColumn.sticky ? 'tw-sticky tw-right-0 tw-z-40' : ''
            }`}
          ></th>
        )}
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="tw-flex tw-justify-center tw-items-center tw-py-12">
        <Spinner animation="border" variant="primary" />
        <span className="tw-ml-3 tw-text-gray-600">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-border tw-border-gray-200 tw-overflow-hidden tw-relative tw-z-0 tw-mx-2 sm:tw-mx-0 tw-h-full">
      <div 
        className="tw-overflow-x-auto tw-overflow-y-auto" 
        style={{ 
          maxHeight: maxHeight,
          minHeight: '500px' // Minimum height to ensure table is tall enough
        }}
      >
        <Table className="tw-mb-0 tw-h-full" style={{ minWidth: '100%' }}>
          <thead className="tw-sticky tw-top-0 tw-z-20">
            {renderColGroupHeaders()}
            <tr className="tw-bg-gradient-to-r tw-from-gray-50 tw-to-gray-100">
              {showIcon && (
                <th 
                  className={`tw-p-3 tw-text-center tw-font-semibold tw-text-gray-700 tw-border-b tw-border-gray-200 tw-sticky tw-top-0 tw-z-30 tw-bg-gray-50 ${
                    freezeIndex >= 0 ? 'tw-sticky tw-left-0 tw-z-40' : ''
                  }`}
                  style={{ width: '50px', minWidth: '50px' }}
                >
                  <i className="fas fa-image tw-text-gray-400"></i>
                </th>
              )}
              
              {showRowNumber && (
                <th 
                  className={`tw-p-3 tw-text-center tw-font-semibold tw-text-gray-700 tw-border-b tw-border-gray-200 tw-sticky tw-top-0 tw-z-30 tw-bg-gray-50 ${
                    freezeIndex >= 1 || (freezeIndex >= 0 && !showIcon) ? 'tw-sticky tw-left-0 tw-z-40' : ''
                  }`}
                  style={{ 
                    width: '70px', 
                    minWidth: '70px',
                    left: showIcon ? '50px' : '0'
                  }}
                >
                  No
                </th>
              )}

              {visibleColumnsData.map((column, index) => {
                const isFreezed = freezeIndex >= 0 && index <= (freezeIndex - (showIcon ? 1 : 0) - (showRowNumber ? 1 : 0));
                let leftPosition = 0;
                if (isFreezed) {
                  if (showIcon) leftPosition += 50;
                  if (showRowNumber) leftPosition += 70;
                  for (let i = 0; i < index; i++) {
                    leftPosition += visibleColumnsData[i].width || 150;
                  }
                }

                return (
                  <th
                    key={column.key}
                    className={`tw-p-3 tw-font-semibold tw-text-gray-700 tw-border-b tw-border-gray-200 tw-cursor-pointer tw-select-none tw-transition-colors hover:tw-bg-gray-100 tw-sticky tw-top-0 tw-z-30 tw-bg-gray-50 ${
                      isFreezed ? 'tw-sticky tw-left-0 tw-z-40' : ''
                    }`}
                    style={{
                      width: column.width || 150,
                      minWidth: column.minWidth || column.width || 150,
                      left: isFreezed ? `${leftPosition}px` : undefined
                    }}
                    onClick={() => column.sortable !== false && onSort(column.key)}
                  >
                    <div className="tw-flex tw-items-center tw-justify-between tw-gap-2">
                      <span className="tw-truncate">{column.label}</span>
                      {column.sortable !== false && getSortIcon(column.key)}
                    </div>
                  </th>
                );
              })}

              {actionColumn?.enabled && (
                <th
                  className={`tw-p-3 tw-text-center tw-font-semibold tw-text-gray-700 tw-border-b tw-border-gray-200 tw-sticky tw-top-0 tw-z-30 tw-bg-gray-50 ${
                    actionColumn.sticky ? 'tw-sticky tw-right-0 tw-z-40' : ''
                  }`}
                  style={{ 
                    width: actionColumn.width || 200, 
                    minWidth: actionColumn.width || 200,
                    right: actionColumn.sticky ? '0' : undefined
                  }}
                >
                  {actionColumn.label || 'Pengaturan'}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    (showIcon ? 1 : 0) + 
                    (showRowNumber ? 1 : 0) + 
                    visibleColumnsData.length + 
                    (actionColumn?.enabled ? 1 : 0)
                  }
                  className="tw-text-center tw-py-12 tw-text-gray-500"
                >
                  <div className="tw-flex tw-flex-col tw-items-center tw-gap-3">
                    <i className="fas fa-inbox tw-text-4xl tw-text-gray-300"></i>
                    <span>Tidak ada data yang ditampilkan</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="tw-border-b tw-border-gray-100 hover:tw-bg-gray-50 tw-transition-colors"
                  style={{ height: '70px' }} // Increased height to accommodate ButtonGradient
                >
                  {showIcon && (
                    <td
                      className={`tw-text-center tw-align-middle ${
                        freezeIndex >= 0 ? 'tw-sticky tw-left-0 tw-bg-white tw-z-10 hover:tw-bg-gray-50' : ''
                      }`}
                      style={{ width: '50px', minWidth: '50px' }}
                    >
                      <i className="fas fa-file-alt tw-text-gray-400"></i>
                    </td>
                  )}
                  
                  {showRowNumber && (
                    <td
                      className={`tw-text-center tw-align-middle tw-font-medium tw-text-gray-600 ${
                        freezeIndex >= 1 || (freezeIndex >= 0 && !showIcon) ? 'tw-sticky tw-bg-white tw-z-10 hover:tw-bg-gray-50' : ''
                      }`}
                      style={{ 
                        width: '70px', 
                        minWidth: '70px',
                        left: showIcon ? '50px' : '0'
                      }}
                    >
                      {rowIndex + 1}
                    </td>
                  )}

                  {visibleColumnsData.map((column, colIndex) => {
                    const isFreezed = freezeIndex >= 0 && colIndex <= (freezeIndex - (showIcon ? 1 : 0) - (showRowNumber ? 1 : 0));
                    let leftPosition = 0;
                    if (isFreezed) {
                      if (showIcon) leftPosition += 50;
                      if (showRowNumber) leftPosition += 70;
                      for (let i = 0; i < colIndex; i++) {
                        leftPosition += visibleColumnsData[i].width || 150;
                      }
                    }

                    return (
                      <td
                        key={column.key}
                        className={`tw-align-middle ${
                          isFreezed ? 'tw-sticky tw-bg-white tw-z-10 hover:tw-bg-gray-50' : ''
                        }`}
                        style={{
                          width: column.width || 150,
                          minWidth: column.minWidth || column.width || 150,
                          left: isFreezed ? `${leftPosition}px` : undefined
                        }}
                      >
                        {renderCell(column, row[column.key], row, rowIndex)}
                      </td>
                    );
                  })}

                  {actionColumn?.enabled && (
                    <td
                      className={`tw-text-center tw-align-middle tw-px-2 tw-py-2 ${
                        actionColumn.sticky ? 'tw-sticky tw-right-0 tw-bg-white tw-z-10 hover:tw-bg-gray-50 tw-shadow-lg' : ''
                      }`}
                      style={{
                        width: actionColumn.width || 200,
                        minWidth: actionColumn.width || 200,
                        right: actionColumn.sticky ? '0' : undefined
                      }}
                    >
                      {renderActionButtons(row, rowIndex)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ReportTable;