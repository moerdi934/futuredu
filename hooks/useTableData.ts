// hooks/useTableData.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { BaseRecord, SortConfig, FilterConfig, PaginationConfig } from '../types/table';

interface UseTableDataOptions<T> {
  endpoint: string;
  initialPageSize?: number;
  onSuccess?: (data: T[], pagination: PaginationConfig) => void;
  onError?: (error: string) => void;
  transform?: (data: any) => T[];
}

interface TableDataParams {
  page?: number;
  pageSize?: number;
  sort?: SortConfig;
  filters?: FilterConfig;
  search?: string;
}

interface TableDataResponse<T> {
  data: T[];
  pagination: PaginationConfig;
  total: number;
  totalPages: number;
  currentPage: number;
}

export function useTableData<T extends BaseRecord>({
  endpoint,
  initialPageSize = 10,
  onSuccess,
  onError,
  transform,
}: UseTableDataOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0,
  });

  const fetchData = useCallback(async (params: TableDataParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      queryParams.append('page', String(params.page || pagination.page));
      queryParams.append('limit', String(params.pageSize || pagination.pageSize));
      
      // Add sort params
      if (params.sort) {
        queryParams.append('sortKey', params.sort.column);
        queryParams.append('sortOrder', params.sort.direction);
      }
      
      // Add filter params
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '' && value !== 'All') {
            queryParams.append(key, String(value));
          }
        });
      }
      
      // Add search param
      if (params.search) {
        queryParams.append('search', params.search);
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform data if transformer provided
      const transformedData = transform ? transform(result.data || result) : (result.data || result);
      
      const newPagination: PaginationConfig = {
        page: result.currentPage || params.page || pagination.page,
        pageSize: result.pageSize || params.pageSize || pagination.pageSize,
        total: result.total || transformedData.length,
        totalPages: result.totalPages || Math.ceil((result.total || transformedData.length) / (params.pageSize || pagination.pageSize)),
      };

      setData(transformedData);
      setPagination(newPagination);
      
      onSuccess?.(transformedData, newPagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching data';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Error fetching table data:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, pagination.page, pagination.pageSize, onSuccess, onError, transform]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    fetchData({ page });
  }, [fetchData]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
    fetchData({ page: 1, pageSize });
  }, [fetchData]);

  const handleSort = useCallback((sort: SortConfig) => {
    fetchData({ sort });
  }, [fetchData]);

  const handleFilter = useCallback((filters: FilterConfig) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchData({ page: 1, filters });
  }, [fetchData]);

  const handleSearch = useCallback((search: string) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchData({ page: 1, search });
  }, [fetchData]);

  // CRUD operations
  const createRecord = useCallback(async (newRecord: Omit<T, 'id'>) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      await refresh(); // Refresh the data
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create record';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, refresh, onError]);

  const updateRecord = useCallback(async (id: T['id'], updates: Partial<T>) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      await refresh(); // Refresh the data
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update record';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, refresh, onError]);

  const deleteRecord = useCallback(async (id: T['id']) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await refresh(); // Refresh the data
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete record';
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, refresh, onError]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array for initial load only

  return {
    data,
    loading,
    error,
    pagination,
    fetchData,
    refresh,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    handleFilter,
    handleSearch,
    createRecord,
    updateRecord,
    deleteRecord,
  };
}