// components/report/ReportPagination.tsx

import React from 'react';
import { Pagination, Form, Row, Col } from 'react-bootstrap';
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from 'react-icons/fa';

interface ReportPaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  searchMode?: 'client' | 'server';
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
}

const ReportPagination: React.FC<ReportPaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  searchMode = 'client',
  onPageChange,
  onPageSizeChange,
  loading = false
}) => {
  const generatePageItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page
    if (startPage > 1) {
      items.push(
        <Pagination.Item
          key={1}
          active={1 === currentPage}
          onClick={() => onPageChange(1)}
          disabled={loading}
        >
          1
        </Pagination.Item>
      );
      
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
      }
    }
    
    // Visible pages
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => onPageChange(page)}
          disabled={loading}
        >
          {page}
        </Pagination.Item>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
      }
      
      items.push(
        <Pagination.Item
          key={totalPages}
          active={totalPages === currentPage}
          onClick={() => onPageChange(totalPages)}
          disabled={loading}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    return items;
  };

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="tw-bg-white tw-p-3 sm:tw-p-4 tw-rounded-lg tw-shadow-sm tw-border tw-border-gray-200 tw-mt-4 tw-relative tw-z-0 tw-mx-2 sm:tw-mx-0">
      <div className="tw-flex tw-flex-col lg:tw-flex-row lg:tw-items-center tw-gap-4">
        {/* Page Size and Info Section */}
        <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-gap-3 tw-flex-1">
          <Form.Group className="tw-mb-0 tw-flex tw-items-center tw-gap-2 tw-flex-shrink-0">
            <Form.Label className="tw-mb-0 tw-text-xs sm:tw-text-sm tw-text-gray-600 tw-whitespace-nowrap">
              Tampilkan:
            </Form.Label>
            <Form.Select
              size="sm"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={loading}
              className="tw-w-auto tw-text-xs sm:tw-text-sm"
              style={{ width: '70px' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
            <span className="tw-text-xs sm:tw-text-sm tw-text-gray-600 tw-whitespace-nowrap">
              per halaman
            </span>
          </Form.Group>
          
          <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-gap-2">
            <div className="tw-text-xs sm:tw-text-sm tw-text-gray-600 tw-text-center sm:tw-text-left">
              Menampilkan {startRecord} - {endRecord} dari {totalRecords} data
            </div>
            
            {/* Search Mode Indicator */}
            <div className="tw-flex tw-items-center tw-gap-2">
              <span className={`tw-text-xs tw-px-2 tw-py-1 tw-rounded tw-font-medium tw-whitespace-nowrap ${
                searchMode === 'server' 
                  ? 'tw-bg-blue-100 tw-text-blue-700' 
                  : 'tw-bg-gray-100 tw-text-gray-600'
              }`}>
                {searchMode === 'server' ? 'Server Pagination' : 'Client Pagination'}
              </span>
              
              {searchMode === 'server' && loading && (
                <div className="tw-flex tw-items-center tw-gap-1">
                  <div className="tw-animate-spin tw-w-3 tw-h-3 tw-border-2 tw-border-blue-600 tw-border-t-transparent tw-rounded-full"></div>
                  <span className="tw-text-xs tw-text-blue-600">Loading...</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="tw-flex tw-justify-center tw-flex-shrink-0">
            <div className="tw-overflow-x-auto tw-max-w-full">
              <Pagination className="tw-mb-0 tw-flex-nowrap tw-justify-center" style={{ minWidth: 'max-content' }}>
                <Pagination.First
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1 || loading}
                  className="tw-flex-shrink-0"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  <FaAngleDoubleLeft size={12} />
                </Pagination.First>
                
                <Pagination.Prev
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="tw-flex-shrink-0"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  <FaAngleLeft size={12} />
                </Pagination.Prev>
                
                {generatePageItems().map((item, index) => (
                  <div 
                    key={index}
                    className="tw-flex-shrink-0"
                    style={{ fontSize: '0.75rem' }}
                  >
                    {React.cloneElement(item as React.ReactElement, {
                      style: { fontSize: '0.75rem', padding: '0.25rem 0.5rem', minWidth: '32px' }
                    })}
                  </div>
                ))}
                
                <Pagination.Next
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="tw-flex-shrink-0"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  <FaAngleRight size={12} />
                </Pagination.Next>
                
                <Pagination.Last
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages || loading}
                  className="tw-flex-shrink-0"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  <FaAngleDoubleRight size={12} />
                </Pagination.Last>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPagination;