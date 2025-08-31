// utils/reportUtils.ts

import { ColumnConfig, SortConfig, ColGroup } from '../types/report';

export const formatDate = (date: string | Date, format: 'date' | 'datetime' = 'date'): string => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  if (format === 'datetime') {
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatNumber = (value: number | string, decimals: number = 0): string => {
  if (value === null || value === undefined || value === '') return '-';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  
  return num.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatBoolean = (value: boolean): string => {
  if (value === null || value === undefined) return '-';
  return value ? 'Ya' : 'Tidak';
};

export const formatArray = (value: any[], separator: string = ', '): string => {
  if (!Array.isArray(value) || value.length === 0) return '-';
  return value.join(separator);
};

export const sortData = (data: any[], sortConfig: SortConfig[]): any[] => {
  if (!sortConfig.length) return data;
  
  return [...data].sort((a, b) => {
    for (const sort of sortConfig) {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      
      // Handle null/undefined values
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      let comparison = 0;
      
      // Number comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      }
      // Date comparison
      else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      }
      // String comparison
      else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      if (comparison !== 0) {
        return sort.direction === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });
};

export const filterData = (data: any[], filterValues: Record<string, any>): any[] => {
  return data.filter(row => {
    return Object.entries(filterValues).every(([key, value]) => {
      if (value === '' || value === null || value === undefined) return true;
      
      const rowValue = row[key];
      
      if (typeof value === 'string') {
        return String(rowValue || '').toLowerCase().includes(value.toLowerCase());
      }
      
      if (typeof value === 'boolean') {
        return Boolean(rowValue) === value;
      }
      
      if (Array.isArray(value)) {
        return value.some(v => String(rowValue || '').toLowerCase().includes(String(v).toLowerCase()));
      }
      
      return String(rowValue || '').includes(String(value));
    });
  });
};

export const paginateData = (data: any[], page: number, pageSize: number) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: data.slice(startIndex, endIndex),
    totalPages: Math.ceil(data.length / pageSize),
    totalRecords: data.length
  };
};

export const buildColGroups = (columns: ColumnConfig[]): ColGroup[] => {
  const groups = new Map<string, string[]>();
  
  columns.forEach(col => {
    const groupKey = col.colGroup || '';
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(col.key);
  });
  
  return Array.from(groups.entries()).map(([key, columns]) => ({
    key,
    label: key || '',
    columns
  }));
};

export const getDefaultFormatter = (type: ColumnConfig['type']) => {
  return (value: any, row: any) => {
    switch (type) {
      case 'date':
        return formatDate(value, 'date');
      case 'datetime':
        return formatDate(value, 'datetime');
      case 'number':
        return formatNumber(value, 0);
      case 'float':
        return formatNumber(value, 2);
      case 'boolean':
        return formatBoolean(value);
      case 'array':
        return formatArray(value);
      case 'object':
        return value ? JSON.stringify(value) : '-';
      default:
        return value || '-';
    }
  };
};