// hooks/useReport.ts

import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { ReportConfig, SortConfig, ReportState } from '../types/report';
import { sortData, filterData, paginateData } from '../utils/reportUtils';

interface UseReportProps {
  config: ReportConfig;
  apiEndpoint: string;
  fetchOnMount?: boolean;
  searchMode?: 'client' | 'server'; // New prop to control search behavior
}

interface UseReportReturn extends ReportState {
  globalSearch: string;
  searchMode: 'client' | 'server';
  updateSort: (key: string) => void;
  updateFilter: (key: string, value: any) => void;
  updateGlobalSearch: (value: string) => void;
  updatePage: (page: number) => void;
  updatePageSize: (size: number) => void;
  updateVisibleColumns: (columns: string[]) => void;
  updateFreezeColumn: (column: string | null) => void;
  resetFilters: () => void;
  refresh: () => void;
}

// Debug helper function
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[useReport] ${message}`, data || '');
  }
};

// Function to build complete API URL
const buildApiUrl = (endpoint: string, searchParams?: Record<string, any>): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!baseUrl) {
    debugLog('WARNING: NEXT_PUBLIC_API_URL not found in environment variables');
    const fallbackUrl = 'http://localhost:3000/api';
    debugLog('Using fallback URL:', fallbackUrl);
    
    let fullUrl = `${fallbackUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    if (searchParams && Object.keys(searchParams).length > 0) {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
      if (params.toString()) {
        fullUrl += `?${params.toString()}`;
      }
    }
    
    return fullUrl;
  }

  let cleanEndpoint = endpoint;
  if (baseUrl.endsWith('/api') && endpoint.startsWith('/')) {
    cleanEndpoint = endpoint.substring(1);
  }
  
  let fullUrl = `${baseUrl}${cleanEndpoint.startsWith('/') || baseUrl.endsWith('/') ? '' : '/'}${cleanEndpoint}`;
  
  // Add search parameters for server-side search
  if (searchParams && Object.keys(searchParams).length > 0) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    if (params.toString()) {
      fullUrl += `?${params.toString()}`;
    }
  }
  
  debugLog('Built API URL:', { baseUrl, endpoint, cleanEndpoint, searchParams, fullUrl });
  
  return fullUrl;
};

export const useReport = ({ 
  config, 
  apiEndpoint, 
  fetchOnMount = true,
  searchMode = 'client' // Default to client-side search for backward compatibility
}: UseReportProps): UseReportReturn => {
  debugLog('useReport initialized', {
    apiEndpoint,
    fetchOnMount,
    searchMode,
    configTitle: config.title
  });

  const [state, setState] = useState<ReportState>({
    data: [],
    loading: fetchOnMount,
    error: null,
    currentPage: 1,
    pageSize: config.pageSize || 10,
    totalPages: 0,
    totalRecords: 0,
    visibleColumns: config.defaultVisibleColumns || config.columns.map(col => col.key),
    freezeColumn: config.defaultFreezeColumn || null,
    sortConfig: config.defaultSort || [],
    filterValues: {}
  });

  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [rawData, setRawData] = useState<any[]>([]);
  
  // Debounce search for server-side mode
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  
  useEffect(() => {
    if (searchMode === 'server') {
      const timer = setTimeout(() => {
        setDebouncedSearch(globalSearch);
      }, 500); // 500ms delay for server-side search
      
      return () => clearTimeout(timer);
    }
  }, [globalSearch, searchMode]);

  // Client-side global search function
  const performClientSearch = useCallback((data: any[], searchTerm: string): any[] => {
    if (!searchTerm.trim()) return data;

    const searchLower = searchTerm.toLowerCase();
    const filteredData = data.filter(row => {
      return Object.values(row).some(value => {
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchLower);
      });
    });

    debugLog('Client-side global search applied:', {
      searchTerm,
      originalCount: data.length,
      filteredCount: filteredData.length
    });

    return filteredData;
  }, []);

  // Process data (filter, search, sort, paginate) - only for client-side mode
  const processedData = useMemo(() => {
    if (searchMode === 'server') {
      // For server-side mode, return data as-is since processing is done on server
      return {
        data: rawData,
        totalPages: Math.ceil(rawData.length / state.pageSize),
        totalRecords: rawData.length
      };
    }

    debugLog('Processing data started (client-side)', {
      rawDataLength: rawData.length,
      filterValues: state.filterValues,
      globalSearch,
      sortConfig: state.sortConfig,
      currentPage: state.currentPage,
      pageSize: state.pageSize
    });

    let filtered = rawData;

    // Apply column filters
    filtered = filterData(filtered, state.filterValues);
    debugLog('After column filters:', { count: filtered.length });

    // Apply global search
    filtered = performClientSearch(filtered, globalSearch);
    debugLog('After global search:', { count: filtered.length });

    // Apply sorting
    filtered = sortData(filtered, state.sortConfig);
    debugLog('After sorting:', { count: filtered.length });

    // Apply pagination
    const paginated = paginateData(filtered, state.currentPage, state.pageSize);
    debugLog('After pagination:', {
      currentPageData: paginated.data.length,
      totalPages: paginated.totalPages,
      totalRecords: paginated.totalRecords
    });

    return {
      data: paginated.data,
      totalPages: paginated.totalPages,
      totalRecords: paginated.totalRecords
    };
  }, [rawData, state.filterValues, globalSearch, state.sortConfig, state.currentPage, state.pageSize, performClientSearch, searchMode]);

  // Fetch data function with support for both search modes
  const fetchData = useCallback(async (searchParams?: Record<string, any>) => {
    debugLog('Fetch data started', { searchMode, searchParams });
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Build search parameters for server-side mode
      let serverParams: Record<string, any> = {};
      
      if (searchMode === 'server') {
        // Add search parameters
        if (debouncedSearch) {
          serverParams.search = debouncedSearch;
        }
        
        // Add filter parameters
        Object.entries(state.filterValues).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            serverParams[key] = value;
          }
        });
        
        // Add sort parameters
        if (state.sortConfig.length > 0) {
          const sortParam = state.sortConfig.map(sort => 
            `${sort.key}:${sort.direction}`
          ).join(',');
          serverParams.sort = sortParam;
        }
        
        // Add pagination parameters
        serverParams.page = state.currentPage;
        serverParams.limit = state.pageSize;
        
        // Merge with any additional search params
        if (searchParams) {
          serverParams = { ...serverParams, ...searchParams };
        }
      }

      const apiUrl = buildApiUrl(apiEndpoint, searchMode === 'server' ? serverParams : undefined);
      debugLog('Making API request to:', apiUrl);

      const startTime = Date.now();
      const response = await axios.get(apiUrl, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const duration = Date.now() - startTime;
      debugLog('API request completed', {
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        dataType: typeof response.data,
        searchMode
      });

      // Handle different API response formats
      let data: any[] = [];
      let totalRecords = 0;
      
      if (Array.isArray(response.data)) {
        data = response.data;
        totalRecords = data.length;
        debugLog('Response is direct array');
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
        totalRecords = response.data.total || response.data.totalRecords || data.length;
        debugLog('Response has data property', { total: totalRecords });
      } else if (response.data.items && Array.isArray(response.data.items)) {
        data = response.data.items;
        totalRecords = response.data.total || response.data.totalRecords || data.length;
        debugLog('Response has items property', { total: totalRecords });
      } else if (response.data.results && Array.isArray(response.data.results)) {
        data = response.data.results;
        totalRecords = response.data.total || response.data.totalRecords || data.length;
        debugLog('Response has results property', { total: totalRecords });
      } else {
        debugLog('WARNING: Unexpected response format', response.data);
        data = [];
      }

      debugLog('Final processed data:', {
        length: data.length,
        totalRecords,
        sampleRecord: data.length > 0 ? Object.keys(data[0]) : 'No data'
      });

      setRawData(data);
      
      // For server-side mode, update total records from server response
      if (searchMode === 'server') {
        setState(prev => ({ 
          ...prev, 
          loading: false,
          totalRecords,
          totalPages: Math.ceil(totalRecords / prev.pageSize)
        }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
      
    } catch (error) {
      debugLog('API request failed', { error, searchMode });
      
      let errorMessage = 'Terjadi kesalahan saat memuat data';
      
      if (axios.isAxiosError(error)) {
        debugLog('Axios error details:', {
          code: error.code,
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });

        if (error.response) {
          errorMessage = `Server Error: ${error.response.status} - ${error.response.statusText}`;
          if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data?.error) {
            errorMessage = error.response.data.error;
          }
        } else if (error.request) {
          errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
          if (error.code === 'ECONNABORTED') {
            errorMessage = 'Request timeout. Server tidak merespons dalam waktu yang ditentukan.';
          }
        } else {
          errorMessage = `Request Error: ${error.message}`;
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage
      }));
    }
  }, [apiEndpoint, searchMode, debouncedSearch, state.filterValues, state.sortConfig, state.currentPage, state.pageSize]);

  // Update functions with search mode awareness
  const updateSort = useCallback((key: string) => {
    debugLog('Sort updated', { key, searchMode });
    setState(prev => {
      const existing = prev.sortConfig.find(sort => sort.key === key);
      let newSortConfig;

      if (!existing) {
        newSortConfig = [{ key, direction: 'asc' as const }, ...prev.sortConfig.slice(0, 2)];
      } else if (existing.direction === 'asc') {
        newSortConfig = prev.sortConfig.map(sort => 
          sort.key === key ? { ...sort, direction: 'desc' as const } : sort
        );
      } else {
        newSortConfig = prev.sortConfig.filter(sort => sort.key !== key);
      }

      return { 
        ...prev, 
        sortConfig: newSortConfig,
        currentPage: 1
      };
    });
  }, []);

  const updateFilter = useCallback((key: string, value: any) => {
    debugLog('Filter updated', { key, value, searchMode });
    setState(prev => ({
      ...prev,
      filterValues: { ...prev.filterValues, [key]: value },
      currentPage: 1
    }));
  }, []);

  const updateGlobalSearch = useCallback((value: string) => {
    debugLog('Global search updated', { value, searchMode });
    setGlobalSearch(value);
    setState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const updatePage = useCallback((page: number) => {
    debugLog('Page updated', { page, searchMode });
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const updatePageSize = useCallback((size: number) => {
    debugLog('Page size updated', { size, searchMode });
    setState(prev => ({ ...prev, pageSize: size, currentPage: 1 }));
  }, []);

  const updateVisibleColumns = useCallback((columns: string[]) => {
    debugLog('Visible columns updated', { columns });
    setState(prev => ({ ...prev, visibleColumns: columns }));
  }, []);

  const updateFreezeColumn = useCallback((column: string | null) => {
    debugLog('Freeze column updated', { column });
    setState(prev => ({ ...prev, freezeColumn: column }));
  }, []);

  const resetFilters = useCallback(() => {
    debugLog('Filters reset', { searchMode });
    setState(prev => ({
      ...prev,
      filterValues: {},
      currentPage: 1
    }));
  }, []);

  const refresh = useCallback(() => {
    debugLog('Manual refresh triggered', { searchMode });
    fetchData();
  }, [fetchData]);

  // Effect for server-side search - refetch when debounced search changes
  useEffect(() => {
    if (searchMode === 'server' && debouncedSearch !== globalSearch) {
      debugLog('Server-side search triggered', { debouncedSearch });
      fetchData();
    }
  }, [debouncedSearch, fetchData, searchMode, globalSearch]);

  // Effect for server-side filters and sorting - refetch when they change
  useEffect(() => {
    if (searchMode === 'server') {
      fetchData();
    }
  }, [state.filterValues, state.sortConfig, state.currentPage, state.pageSize]);

  // Initial data fetch
  useEffect(() => {
    if (fetchOnMount) {
      debugLog('Initial fetch triggered', { searchMode });
      fetchData();
    }
  }, [fetchData, fetchOnMount]);

  // Update state with processed data (only for client-side mode)
  useEffect(() => {
    if (searchMode === 'client') {
      setState(prev => ({
        ...prev,
        data: processedData.data,
        totalPages: processedData.totalPages,
        totalRecords: processedData.totalRecords
      }));
    }
  }, [processedData, searchMode]);

  return {
    ...state,
    globalSearch,
    searchMode,
    updateSort,
    updateFilter,
    updateGlobalSearch,
    updatePage,
    updatePageSize,
    updateVisibleColumns,
    updateFreezeColumn,
    resetFilters,
    refresh
  };
};