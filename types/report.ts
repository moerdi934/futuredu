// types/report.ts - Updated with Dynamic Action Buttons Support

import React from 'react';

// Basic filter option interface
export interface SelectOption {
  value: any;
  label: string;
}

// Action button configuration
export interface ActionColumnButton {
  label: string;
  icon?: React.ReactNode;
  variant?: 
    | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
    | 'outline-primary' | 'outline-secondary' | 'outline-success' 
    | 'outline-warning' | 'outline-danger' | 'outline-info';
  size?: 'sm' | 'md' | 'lg';
  onClick: (row: any, index: number) => void;
  className?: string;
  disabled?: boolean | ((row: any) => boolean);
}

// Action column configuration - supports both static and dynamic buttons
export interface ActionColumnConfig {
  enabled: boolean;
  label?: string;
  width?: number;
  // Buttons can be static array or dynamic function
  buttons: ActionColumnButton[] | ((row: any, index: number) => ActionColumnButton[]);
  sticky?: boolean;
}

// Header action button configuration
export interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  onClick: () => void;
  disabled?: boolean;
}

// Column configuration
export interface ColumnConfig {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'array' | 'object';
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  colGroup?: string;
  formatter?: (value: any, row?: any) => React.ReactNode;
}

// Column group configuration
export interface ColGroup {
  key: string;
  label?: string;
  columns: string[];
}

// Sort configuration
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Filter configuration
export interface FilterConfig {
  key: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  label: string;
  options?: SelectOption[];
  apiEndpoint?: string;
  debounceMs?: number;
  placeholder?: string;
}

// Export configuration
export interface ExportConfig {
  enabled: boolean;
  filename?: string;
  formats?: ('excel' | 'pdf' | 'csv')[];
}

// Report state interface
export interface ReportState {
  data: any[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  visibleColumns: string[];
  freezeColumn: string | null;
  sortConfig: SortConfig[];
  filterValues: Record<string, any>;
}

// Main report configuration
export interface ReportConfig {
  title: string;
  columns: ColumnConfig[];
  colGroups?: ColGroup[];
  filters?: FilterConfig[];
  defaultSort?: SortConfig[];
  defaultVisibleColumns?: string[];
  defaultFreezeColumn?: string;
  showIcon?: boolean;
  showRowNumber?: boolean;
  pageSize?: number;
  rowHeight?: number;
  exportConfig?: ExportConfig;
  actionColumn?: ActionColumnConfig;
  actionButtons?: ActionButton[];
}

// Utility types for components
export interface FilterValues {
  [key: string]: any;
}

export interface TableRow {
  [key: string]: any;
}

// API Response format
export interface ApiResponse<T = any> {
  data?: T[];
  items?: T[];
  results?: T[];
  total?: number;
  totalRecords?: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
  message?: string;
  error?: string;
}

// Pagination info
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  startRecord: number;
  endRecord: number;
}

// Export format type
export type ExportFormat = 'excel' | 'pdf' | 'csv';

// Search mode type
export type SearchMode = 'client' | 'server';

// Component prop interfaces
export interface ReportLayoutProps {
  config: ReportConfig;
  apiEndpoint: string;
  fetchOnMount?: boolean;
  searchMode?: SearchMode;
}

export interface ReportHeaderProps {
  title: string;
  actionButtons?: ActionButton[];
  exportConfig?: ExportConfig;
  data?: any[];
  columns?: ColumnConfig[];
  visibleColumns?: string[];
  loading?: boolean;
}

export interface ReportFiltersProps {
  filters?: FilterConfig[];
  columns: ColumnConfig[];
  filterValues: Record<string, any>;
  globalSearch: string;
  visibleColumns: string[];
  freezeColumn: string | null;
  searchMode?: SearchMode;
  onFilterChange: (key: string, value: any) => void;
  onGlobalSearchChange: (value: string) => void;
  onVisibleColumnsChange: (columns: string[]) => void;
  onFreezeColumnChange: (column: string | null) => void;
  onResetFilters: () => void;
  onApplyFilters: (filters: Record<string, any>, globalSearch: string) => void;
  loading?: boolean;
}

export interface ReportTableProps {
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
  maxHeight?: string;
  actionColumn?: ActionColumnConfig;
}

export interface ReportPaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  searchMode?: SearchMode;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
}

export interface ExportDropdownProps {
  data: any[];
  columns: ColumnConfig[];
  visibleColumns: string[];
  config?: ExportConfig;
  loading?: boolean;
}

// Hook return type
export interface UseReportReturn extends ReportState {
  globalSearch: string;
  searchMode: SearchMode;
  updateSort: (key: string) => void;
  updateFilter: (key: string, value: any) => void;
  updateGlobalSearch: (value: string) => void;
  updatePage: (page: number) => void;
  updatePageSize: (size: number) => void;
  updateVisibleColumns: (columns: string[]) => void;
  updateFreezeColumn: (column: string | null) => void;
  resetFilters: () => void;
  applyFilters: (filters: Record<string, any>, globalSearch: string) => void;
  refresh: () => void;
}