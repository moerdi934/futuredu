// components/report/ReportLayout.tsx - Updated with Refresh Function Callback

import React, { useEffect } from 'react';
import { ReportConfig } from '../../types/report';
import { useReport } from '../../hooks/useReport';
import ReportHeader from './ReportHeader';
import ReportFilters from './ReportFilters';
import ReportTable from './ReportTable';
import ReportPagination from './ReportPagination';

interface ReportLayoutProps {
  config: ReportConfig;
  apiEndpoint: string;
  fetchOnMount?: boolean;
  searchMode?: 'client' | 'server';
  onRefreshFunctionReady?: (refreshFunction: () => void) => void; // NEW: Callback to pass refresh function
}

const ReportLayout: React.FC<ReportLayoutProps> = ({
  config,
  apiEndpoint,
  fetchOnMount = true,
  searchMode = 'client',
  onRefreshFunctionReady // NEW: Callback prop
}) => {
  const {
    data,
    loading,
    error,
    currentPage,
    pageSize,
    totalPages,
    totalRecords,
    visibleColumns,
    freezeColumn,
    sortConfig,
    filterValues,
    globalSearch,
    updateSort,
    updateFilter,
    updateGlobalSearch,
    updatePage,
    updatePageSize,
    updateVisibleColumns,
    updateFreezeColumn,
    resetFilters,
    applyFilters,
    refresh // GET: refresh function from useReport
  } = useReport({ config, apiEndpoint, fetchOnMount, searchMode });

  // NEW: Pass refresh function to parent component when available
  useEffect(() => {
    if (onRefreshFunctionReady && refresh) {
      onRefreshFunctionReady(refresh);
    }
  }, [onRefreshFunctionReady, refresh]);

  if (error) {
    return (
      <div className="tw-py-4">
        <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-p-6 tw-text-center tw-mx-2 sm:tw-mx-0">
          <div className="tw-text-red-600 tw-text-lg tw-font-semibold tw-mb-2">
            <i className="fas fa-exclamation-triangle tw-mr-2"></i>
            Terjadi Kesalahan
          </div>
          <p className="tw-text-red-700 tw-mb-4">{error}</p>
          <div className="tw-flex tw-gap-2 tw-justify-center tw-flex-wrap">
            <button
              onClick={refresh}
              className="tw-bg-red-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-lg hover:tw-bg-red-700 tw-transition-colors"
              disabled={loading}
            >
              {loading ? 'Memuat...' : 'Coba Lagi'}
            </button>
            <div className="tw-text-xs tw-text-gray-500 tw-self-center">
              Mode: {searchMode === 'server' ? 'Server-side Search' : 'Client-side Search'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-py-4">
      {/* Header with Title and Action Buttons */}
      <ReportHeader
        title={config.title}
        actionButtons={config.actionButtons}
        exportConfig={config.exportConfig}
        data={data}
        columns={config.columns}
        visibleColumns={visibleColumns}
        loading={loading}
      />

      {/* Filter, Column Selection, Global Search, and Freeze Column Controls */}
      <ReportFilters
        filters={config.filters}
        columns={config.columns}
        filterValues={filterValues}
        globalSearch={globalSearch}
        visibleColumns={visibleColumns}
        freezeColumn={freezeColumn}
        searchMode={searchMode}
        onFilterChange={updateFilter}
        onGlobalSearchChange={updateGlobalSearch}
        onVisibleColumnsChange={updateVisibleColumns}
        onFreezeColumnChange={updateFreezeColumn}
        onResetFilters={resetFilters}
        onApplyFilters={applyFilters}
        loading={loading}
      />

      {/* Table with Data */}
      <ReportTable
        data={data}
        columns={config.columns}
        colGroups={config.colGroups}
        visibleColumns={visibleColumns}
        freezeColumn={freezeColumn}
        sortConfig={sortConfig}
        onSort={updateSort}
        loading={loading}
        showIcon={config.showIcon}
        showRowNumber={config.showRowNumber}
        rowHeight={config.rowHeight}
        actionColumn={config.actionColumn}
      />

      {/* Pagination Controls */}
      <ReportPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={updatePage}
        onPageSizeChange={updatePageSize}
        loading={loading}
        searchMode={searchMode}
      />
    </div>
  );
};

export default ReportLayout;