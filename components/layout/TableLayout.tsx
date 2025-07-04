'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import {
  Table,
  flexRender,
  Row,
} from '@tanstack/react-table';
import { Button, Form, Spinner } from 'react-bootstrap';
import { FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface GenericTableProps<T> {
  table: Table<T>;
  isMobile: boolean;
  fixedColumnIds: string[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  customRowStyling?: (row: Row<T>) => React.CSSProperties;
}

function GenericTable<T>({
  table,
  isMobile,
  fixedColumnIds,
  isLoading,
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
  customRowStyling
}: GenericTableProps<T>) {
  const fixedTableRef = useRef<HTMLDivElement>(null);
  const scrollableTableRef = useRef<HTMLDivElement>(null);

  const calculateMarginLeft = useMemo(() => {
    const fixedColumns = table.getAllColumns()
      .filter(column => fixedColumnIds.includes(column.id) && column.getIsVisible());

    const totalMinSize = fixedColumns.reduce((sum, column) => {
      const columnDef = column.columnDef as any;
      return sum + (columnDef.minSize || columnDef.size || 0);
    }, 0);

    return `${totalMinSize + 3}px`;
  }, [table, fixedColumnIds]);

  useEffect(() => {
    const syncRowHeights = () => {
      if (!fixedTableRef.current || !scrollableTableRef.current) return;

      const fixedRows = fixedTableRef.current.querySelectorAll('tr');
      const scrollableRows = scrollableTableRef.current.querySelectorAll('tr');

      fixedRows.forEach(row => (row as HTMLElement).style.height = 'auto');
      scrollableRows.forEach(row => (row as HTMLElement).style.height = 'auto');

      fixedRows.forEach((row, index) => {
        if (scrollableRows[index]) {
          const fixedRowHeight = row.getBoundingClientRect().height;
          const scrollableRowHeight = scrollableRows[index].getBoundingClientRect().height;
          const maxHeight = 1.25 * Math.max(fixedRowHeight, scrollableRowHeight);
          
          (row as HTMLElement).style.height = `${maxHeight}px`;
          (scrollableRows[index] as HTMLElement).style.height = `${maxHeight}px`;
        }
      });
    };

    syncRowHeights();

    const resizeObserver = new ResizeObserver(syncRowHeights);
    if (fixedTableRef.current) resizeObserver.observe(fixedTableRef.current);
    if (scrollableTableRef.current) resizeObserver.observe(scrollableTableRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [table.getRowModel().rows]);

  const getCellAlignment = (columnId: string) => {
    const column = table.getColumn(columnId);
    if (!column) return 'center';
    
    const align = column.columnDef.meta?.align;
    return align || 'center';
  };
  
  const getHeaderAlignStyle = (columnId: string) => {
    return { textAlign: getCellAlignment(columnId) };
  };

  const getTableSection = (isFixed: boolean) => {
    return (
      <table className="table table-striped table-bordered">
        <thead
          style={{
            top: 0,
            zIndex: 1000,
            background: 'white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          className="tw-bg-purple-50"
        >
          {table.getHeaderGroups().map(headerGroup => {
            const visibleHeaders = headerGroup.headers.filter(header => {
              if (header.column.id && !header.column.getIsVisible()) {
                return false;
              }
              
              if (header.subHeaders && header.subHeaders.length > 0) {
                return header.subHeaders.some(subHeader => {
                  if (!subHeader.column.getIsVisible()) {
                    return false;
                  }
                  
                  const isColumnFixed = fixedColumnIds.includes(subHeader.column.id);
                  return isFixed === isColumnFixed;
                });
              }
              
              const isColumnFixed = fixedColumnIds.includes(header.column.id);
              return isFixed === isColumnFixed && header.column.getIsVisible();
            });
  
            if (visibleHeaders.length === 0) return null;
  
            return (
              <tr key={headerGroup.id} className="tw-border-purple-200">
                {visibleHeaders.map(header => {
                  const isLeafHeader = !header.subHeaders || header.subHeaders.length === 0;
                  
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      onClick={isLeafHeader ? header.column.getToggleSortingHandler() : undefined}
                      style={{
                        width: header.getSize(),
                        cursor: isLeafHeader ? 'pointer' : 'default',
                        top: 0,
                        zIndex: 3,
                        textAlign: 'center'
                      }}
                      className="tw-bg-purple-700 tw-text-white tw-font-medium"
                    >
                      <div className="tw-flex tw-justify-center tw-items-center">
                        {header.isPlaceholder
                          ? null 
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {isLeafHeader && (
                          header.column.getIsSorted() ? (
                            header.column.getIsSorted() === 'asc' ? (
                              <FaSortUp className="tw-ml-1" />
                            ) : (
                              <FaSortDown className="tw-ml-1" />
                            )
                          ) : (
                            <FaSort className="tw-ml-1 tw-opacity-50" />
                          )
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody>
        {table.getRowModel().rows.map(row => {
          const rowStyle = customRowStyling ? customRowStyling(row) : {};
          
          return (
            <tr 
              key={row.id} 
              style={rowStyle}
              className="tw-border-purple-100 tw-transition-colors hover:tw-bg-purple-50"
            >
              {row.getVisibleCells()
                .filter(cell => {
                  return isFixed === fixedColumnIds.includes(cell.column.id) && 
                         cell.column.getIsVisible();
                })
                .map(cell => (
                  <td
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      textAlign: getCellAlignment(cell.column.id) as any
                    }}
                    className="tw-py-2 tw-px-3"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
            </tr>
          );
        })}
      </tbody>
      </table>
    );
  };

  return (
    <div className="tw-font-sans">
      {isLoading ? (
        <div className="tw-text-center tw-my-4">
          <Spinner animation="border" role="status" className="tw-text-purple-600">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <div className="tw-relative tw-w-full tw-min-h-fit tw-overflow-hidden tw-border tw-border-purple-200 tw-rounded-lg tw-shadow-sm">
            <div 
              className="tw-absolute tw-left-0 tw-top-0 tw-bottom-0 tw-z-10 tw-border-r-2 tw-border-purple-400" 
              ref={fixedTableRef}
              style={{
                backgroundColor: 'white',
                boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)'
              }}
            >
              {getTableSection(true)}
            </div>
            <div 
              className="tw-overflow-x-auto" 
              style={{ marginLeft: calculateMarginLeft }}
            >
              <div className="tw-w-full" ref={scrollableTableRef}>
                {getTableSection(false)}
              </div>
            </div>
          </div>

          <div className="tw-flex tw-flex-wrap tw-justify-center tw-items-center tw-gap-3 tw-mt-4 tw-px-2">
            <div className="tw-flex tw-items-center tw-gap-2">
              <Button
                variant="outline-primary"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="tw-bg-white tw-text-purple-700 tw-border-purple-400 hover:tw-bg-purple-50"
                size={isMobile ? "sm" : undefined}
              >
                <FaChevronLeft />
              </Button>
              
              <span className="tw-mx-2 tw-text-purple-800 tw-font-medium tw-text-sm md:tw-text-base">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline-primary"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="tw-bg-white tw-text-purple-700 tw-border-purple-400 hover:tw-bg-purple-50"
                size={isMobile ? "sm" : undefined}
              >
                <FaChevronRight />
              </Button>
            </div>

            <Form.Select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="tw-w-auto tw-border-purple-300 tw-text-purple-800 tw-text-sm md:tw-text-base"
              size={isMobile ? "sm" : undefined}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </Form.Select>
            
            <span className="tw-text-purple-800 tw-text-sm md:tw-text-base">
              Total: {totalRecords} records
            </span>
          </div>
        </>
      )}

      <style jsx>{`
        .table-container {
          position: relative;
          overflow-x: auto;
          margin-left: ${calculateMarginLeft};
        }

        @media (max-width: 768px) {
          td, th {
            padding: 4px 6px !important;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          td, th {
            padding: 3px 4px !important;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}

export default GenericTable;