'use client';

import { createColumnHelper, ColumnHelper } from '@tanstack/react-table';
import { Button, Badge } from 'react-bootstrap';
import { FaEye, FaTrash, FaPencilAlt } from 'react-icons/fa';
import { IconType } from 'react-icons';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API Helper Functions
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// CRUD Operations
export const apiOperations = {
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),
};

// Generic types
export interface BaseRecord {
  id: number | string;
  [key: string]: any;
}

export interface ColumnConfig {
  id: string;
  header: string;
  size?: number;
  minSize?: number;
  maxSize?: number;
  type?: 'text' | 'badge' | 'date' | 'actions' | 'custom';
  ellipsis?: boolean;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  values?: {
    [key: string]: {
      text: string;
      variant: string;
    };
  };
  customCell?: (info: any) => JSX.Element;
  hidden?: boolean;
  useFormatter?: boolean;
}

export interface GroupConfig {
  header: string;
  type: 'group';
  columns: (ColumnConfig | GroupConfig)[];
}

export interface CustomAction {
  key: string;
  icon: IconType;
  variant?: string;
  onClick: (record: any) => void;
  title?: string;
  apiEndpoint?: string; // Optional API endpoint for the action
}

export interface ActionHandlers<T extends BaseRecord> {
  onView?: (record: T) => void;
  onEdit?: (record: T) => void;
  onDelete?: (id: T['id']) => void;
  customActions?: (record: T) => CustomAction[];
  // API-specific handlers
  apiEndpoints?: {
    view?: string;
    edit?: string;
    delete?: string;
  };
  onApiSuccess?: (action: string, data?: any) => void;
  onApiError?: (action: string, error: any) => void;
}

export interface ColumnBuilderOptions<T extends BaseRecord> {
  actionHandlers?: ActionHandlers<T>;
  dateFormat?: (date: string) => string;
  customFormatters?: {
    [key: string]: (value: any) => string | JSX.Element;
  };
  // API-specific options
  enableApiIntegration?: boolean;
  loadingStates?: {
    [key: string]: boolean;
  };
}

export class TableColumnBuilder<T extends BaseRecord> {
  private columnHelper: ColumnHelper<T>;

  constructor() {
    this.columnHelper = createColumnHelper<T>();
  }

  private createEllipsisCell = (maxWidth: number, align?: 'left' | 'center' | 'right') => (info: any) => (
    <div
      title={info.getValue()}
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth,
        textAlign: align || 'left',
      }}
    >
      {info.getValue()}
    </div>
  );

  private createBadgeCell = (
    values: { [key: string]: { text: string; variant: string } },
    align?: 'left' | 'center' | 'right'
  ) => (info: any) => {
    const rawValue = info.getValue();
    const value = String(rawValue);
    const badgeConfig = values[value];
    
    if (!badgeConfig) {
      return <span style={{ display: 'block', textAlign: align || 'left' }}>{value}</span>;
    }
    
    return (
      <div style={{ textAlign: align || 'left' }}>
        <Badge bg={badgeConfig.variant}>
          {badgeConfig.text}
        </Badge>
      </div>
    );
  };

  private handleApiAction = async (
    action: string,
    record: T,
    endpoint?: string,
    actionHandlers?: ActionHandlers<T>
  ) => {
    if (!endpoint || !actionHandlers?.apiEndpoints) return;

    try {
      let response;
      const recordEndpoint = endpoint.replace(':id', String(record.id));

      switch (action) {
        case 'view':
          response = await apiOperations.get(recordEndpoint);
          actionHandlers.onApiSuccess?.(action, response);
          break;
        case 'edit':
          // For edit, you might want to first get the data, then handle the edit
          response = await apiOperations.get(recordEndpoint);
          actionHandlers.onApiSuccess?.(action, response);
          break;
        case 'delete':
          response = await apiOperations.delete(recordEndpoint);
          actionHandlers.onApiSuccess?.(action, { id: record.id });
          break;
        default:
          // Handle custom actions
          response = await apiOperations.post(recordEndpoint, record);
          actionHandlers.onApiSuccess?.(action, response);
      }
    } catch (error) {
      actionHandlers?.onApiError?.(action, error);
    }
  };

  private createActionsCell = (
    actionHandlers: ActionHandlers<T>,
    align?: 'left' | 'center' | 'right',
    enableApiIntegration?: boolean
  ) => (info: any) => {
    const record = info.row.original;
    const actions: JSX.Element[] = [];

    if (actionHandlers.onView || actionHandlers.apiEndpoints?.view) {
      actions.push(
        <Button
          key="view"
          variant="info"
          size="sm"
          className="action-button"
          onClick={() => {
            if (enableApiIntegration && actionHandlers.apiEndpoints?.view) {
              this.handleApiAction('view', record, actionHandlers.apiEndpoints.view, actionHandlers);
            } else {
              actionHandlers.onView?.(record);
            }
          }}
        >
          <FaEye />
        </Button>
      );
    }

    if (actionHandlers.onEdit || actionHandlers.apiEndpoints?.edit) {
      actions.push(
        <Button
          key="edit"
          variant="primary"
          size="sm"
          className="action-button"
          onClick={() => {
            if (enableApiIntegration && actionHandlers.apiEndpoints?.edit) {
              this.handleApiAction('edit', record, actionHandlers.apiEndpoints.edit, actionHandlers);
            } else {
              actionHandlers.onEdit?.(record);
            }
          }}
        >
          <FaPencilAlt />
        </Button>
      );
    }

    if (actionHandlers.onDelete || actionHandlers.apiEndpoints?.delete) {
      actions.push(
        <Button
          key="delete"
          variant="danger"
          size="sm"
          className="action-button"
          onClick={() => {
            if (enableApiIntegration && actionHandlers.apiEndpoints?.delete) {
              this.handleApiAction('delete', record, actionHandlers.apiEndpoints.delete, actionHandlers);
            } else {
              actionHandlers.onDelete?.(record.id);
            }
          }}
        >
          <FaTrash />
        </Button>
      );
    }

    if (actionHandlers.customActions) {
      const customActionsList = actionHandlers.customActions(record);
      if (customActionsList && customActionsList.length > 0) {
        customActionsList.forEach(action => {
          const Icon = action.icon;
          actions.push(
            <Button
              key={action.key}
              variant={action.variant || "secondary"}
              size="sm"
              className="action-button"
              onClick={() => {
                if (enableApiIntegration && action.apiEndpoint) {
                  this.handleApiAction(action.key, record, action.apiEndpoint, actionHandlers);
                } else {
                  action.onClick(record);
                }
              }}
              title={action.title || action.key}
            >
              <Icon />
            </Button>
          );
        });
      }
    }
    
    return (
      <div className="d-flex gap-1" style={{ justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
        {actions}
      </div>
    );
  };

  private wrapWithAlignment = (content: any, align?: 'left' | 'center' | 'right') => {
    if (!align || align === 'left') return content;
    
    return (
      <div style={{ textAlign: align, width: '100%' }}>
        {content}
      </div>
    );
  };

  private buildColumn = (
    config: ColumnConfig,
    options: ColumnBuilderOptions<T>
  ) => {
    const column: any = {
      header: config.header,
      size: config.size,
      minSize: config.minSize,
      maxSize: config.maxSize,
      meta: {
        hidden: Boolean(config.hidden),
        align: config.align || 'left'
      }
    };

    if (config.useFormatter && options.customFormatters?.[config.id]) {
      const formatter = options.customFormatters[config.id];
      column.cell = (info: any) => this.wrapWithAlignment(formatter(info.getValue()), config.align);
      return this.columnHelper.accessor(config.id as keyof T, column);
    }
    
    if (config.ellipsis) {
      column.cell = this.createEllipsisCell(config.maxWidth || config.size || 100, config.align);
    } else {
      column.cell = (info: any) => this.wrapWithAlignment(info.getValue(), config.align);
    }

    switch (config.type) {
      case 'badge':
        if (config.values) {
          column.cell = this.createBadgeCell(config.values, config.align);
        }
        break;

      case 'date':
        column.cell = (info: any) => {
          const formattedDate = options.dateFormat ? 
            options.dateFormat(info.getValue()) : 
            new Date(info.getValue()).toLocaleString();
          return this.wrapWithAlignment(formattedDate, config.align);
        };
        break;

      case 'actions':
        if (options.actionHandlers) {
          column.cell = this.createActionsCell(
            options.actionHandlers, 
            config.align, 
            options.enableApiIntegration
          );
        }
        break;

      case 'custom':
        if (config.customCell) {
          const originalCell = config.customCell;
          column.cell = (info: any) => this.wrapWithAlignment(originalCell(info), config.align);
        }
        break;
    }

    if (options.customFormatters?.[config.id] && !config.useFormatter) {
      const formatter = options.customFormatters[config.id];
      const originalCell = column.cell;
      column.cell = (info: any) => {
        const formattedValue = formatter(info.getValue());
        return originalCell ? 
          originalCell(info) : 
          this.wrapWithAlignment(formattedValue, config.align);
      };
    }

    if (config.hidden) {
      column.hidden = true;
    }
    
    return this.columnHelper.accessor(config.id as keyof T, column);
  };

  private buildColumnGroup = (
    group: GroupConfig,
    options: ColumnBuilderOptions<T>
  ) => {
    return this.columnHelper.group({
      header: group.header,
      columns: group.columns.map(col => 
        'type' in col && col.type === 'group' 
          ? this.buildColumnGroup(col as GroupConfig, options)
          : this.buildColumn(col as ColumnConfig, options)
      )
    });
  };

  buildColumns = (
    columnConfig: (ColumnConfig | GroupConfig)[],
    options: ColumnBuilderOptions<T> = {}
  ) => {
    return columnConfig.map(config => 
      'type' in config && config.type === 'group'
        ? this.buildColumnGroup(config as GroupConfig, options)
        : this.buildColumn(config as ColumnConfig, options)
    );
  };
}

// Helper function to create a column builder instance
export const createColumnBuilder = <T extends BaseRecord>() => 
  new TableColumnBuilder<T>();

// Hook untuk data fetching dengan SWR-like pattern
export const useTableData = <T extends BaseRecord>(
  endpoint: string,
  options?: {
    refreshInterval?: number;
    onSuccess?: (data: T[]) => void;
    onError?: (error: any) => void;
  }
) => {
  const [data, setData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiOperations.get(endpoint);
        setData(response);
        options?.onSuccess?.(response);
        setError(null);
      } catch (err) {
        setError(err);
        options?.onError?.(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (options?.refreshInterval) {
      const interval = setInterval(fetchData, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [endpoint, options?.refreshInterval]);

  const refetch = () => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiOperations.get(endpoint);
        setData(response);
        options?.onSuccess?.(response);
        setError(null);
      } catch (err) {
        setError(err);
        options?.onError?.(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  return { data, loading, error, refetch };
};