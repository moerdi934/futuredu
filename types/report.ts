// types/report.ts

export interface ColumnConfig {
  key: string;
  label: string;
  type: 'string' | 'number' | 'float' | 'date' | 'datetime' | 'boolean' | 'array' | 'object';
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  minWidth?: number;
  formatter?: (value: any, row: any) => React.ReactNode;
  colGroup?: string;
}

export interface ColGroup {
  key: string;
  label: string;
  columns: string[];
}

export interface FilterConfig {
  key: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'number' | 'boolean';
  label: string;
  options?: { value: any; label: string }[];
  multiple?: boolean;
  apiEndpoint?: string; // New: for API-based filter options
  debounceMs?: number; // New: for debounced API calls
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

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
  actionButtons?: ActionButton[];
  actionColumn?: {
    enabled: boolean;
    label?: string;
    width?: number;
    buttons: ActionColumnButton[];
    sticky?: boolean;
  };
  exportConfig?: ExportConfig;
}

export interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  onClick: () => void;
}

export interface ActionColumnButton {
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-warning' | 'outline-danger' | 'outline-info';
  onClick: (row: any, index: number) => void;
  size?: 'sm' | 'lg';
  className?: string;
}

export interface ExportConfig {
  enabled?: boolean;
  filename?: string;
  formats?: ('excel' | 'pdf' | 'csv')[];
}

export interface ReportData {
  data: any[];
  total: number;
  page: number;
  pageSize: number;
}

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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}