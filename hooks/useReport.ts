// hooks/useReport.ts - Complete Race Condition Fix

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { ReportConfig, SortConfig, ReportState } from '../types/report';
import { sortData, filterData, paginateData } from '../utils/reportUtils';

interface UseReportProps {
  config: ReportConfig;
  apiEndpoint: string;
  fetchOnMount?: boolean;
  searchMode?: 'client' | 'server';
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
  applyFilters: (filters: Record<string, any>, globalSearch: string) => void;
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
  searchMode = 'client'
}: UseReportProps): UseReportReturn => {
  debugLog('useReport initialized', {
    apiEndpoint,
    fetchOnMount,
    searchMode,
    configTitle: config.title
  });

  // Filter visible columns to exclude 'id' by default
  const getFilteredVisibleColumns = (columns: string[]) => {
    return columns.filter(col => col !== 'id');
  };

  const [state, setState] = useState<ReportState>({
    data: [],
    loading: fetchOnMount,
    error: null,
    currentPage: 1,
    pageSize: config.pageSize || 10,
    totalPages: 0,
    totalRecords: 0,
    visibleColumns: getFilteredVisibleColumns(
      config.defaultVisibleColumns || config.columns.map(col => col.key)
    ),
    freezeColumn: config.defaultFreezeColumn === 'id' ? null : config.defaultFreezeColumn || null,
    sortConfig: config.defaultSort || [],
    filterValues: {}
  });

  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [rawData, setRawData] = useState<any[]>([]);
  
  // Request tracking untuk mencegah race condition
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // State untuk menentukan apakah fetch diperlukan
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isDebounced, setIsDebounced] = useState(false);

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
      debugLog('Server-side mode: using raw data', {
        rawDataLength: rawData.length,
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        totalRecords: state.totalRecords
      });
      
      return {
        data: rawData,
        totalPages: state.totalPages,
        totalRecords: state.totalRecords
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
    filtered = filterData(filtered, state.filterValues);
    debugLog('After column filters:', { count: filtered.length });

    filtered = performClientSearch(filtered, globalSearch);
    debugLog('After global search:', { count: filtered.length });

    filtered = sortData(filtered, state.sortConfig);
    debugLog('After sorting:', { count: filtered.length });

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
  }, [rawData, state.filterValues, globalSearch, state.sortConfig, state.currentPage, state.pageSize, state.totalPages, state.totalRecords, performClientSearch, searchMode]);

  // Central fetch function - HANYA INI YANG FETCH DATA
  const fetchData = useCallback(async () => {
    if (searchMode !== 'server') return;

    // Generate unique request ID
    const currentRequestId = ++requestIdRef.current;
    debugLog(`[${currentRequestId}] Fetch data started`, { 
      globalSearch,
      filterValues: state.filterValues,
      sortConfig: state.sortConfig,
      currentPage: state.currentPage,
      pageSize: state.pageSize
    });

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('New request initiated');
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let serverParams: Record<string, any> = {};
      
      // Add global search parameter - GUNAKAN STATE SAAT INI
      if (globalSearch.trim()) {
        serverParams.search = globalSearch.trim();
      }
      
      // Add filter parameters - GUNAKAN STATE SAAT INI
      Object.entries(state.filterValues).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'boolean') {
            serverParams[key] = value;
          } else if (Array.isArray(value)) {
            serverParams[key] = value.map(v => v.value || v).join(',');
          } else if (typeof value === 'object' && value.value !== undefined) {
            serverParams[key] = value.value;
          } else {
            serverParams[key] = value;
          }
        }
      });
      
      // Add sort parameters - GUNAKAN STATE SAAT INI
      if (state.sortConfig.length > 0) {
        const sortParam = state.sortConfig.map(sort => 
          `${sort.key}:${sort.direction}`
        ).join(',');
        serverParams.sort = sortParam;
      }
      
      // Add pagination parameters - GUNAKAN STATE SAAT INI
      serverParams.page = state.currentPage;
      serverParams.limit = state.pageSize;

      const apiUrl = buildApiUrl(apiEndpoint, serverParams);
      debugLog(`[${currentRequestId}] API Request:`, { url: apiUrl, params: serverParams });

      const startTime = Date.now();
      const response = await axios.get(apiUrl, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal
      });
      
      const duration = Date.now() - startTime;

      // CRITICAL: Check if this request is still the latest
      if (currentRequestId !== requestIdRef.current) {
        debugLog(`[${currentRequestId}] Request outdated, ignoring. Latest: ${requestIdRef.current}`);
        return;
      }

      // Check if request was aborted
      if (abortController.signal.aborted) {
        debugLog(`[${currentRequestId}] Request was aborted`);
        return;
      }

      debugLog(`[${currentRequestId}] Success:`, {
        status: response.status,
        duration: `${duration}ms`
      });

      let data: any[] = [];
      let totalRecords = 0;
      let totalPages = 0;
      
      // Parse response dengan berbagai format
      if (Array.isArray(response.data)) {
        data = response.data;
        totalRecords = data.length;
        totalPages = Math.ceil(totalRecords / state.pageSize);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
        totalRecords = response.data.total || response.data.totalRecords || data.length;
        totalPages = response.data.totalPages || Math.ceil(totalRecords / state.pageSize);
      } else if (response.data.items && Array.isArray(response.data.items)) {
        data = response.data.items;
        totalRecords = response.data.total || response.data.totalRecords || data.length;
        totalPages = response.data.totalPages || Math.ceil(totalRecords / state.pageSize);
      } else if (response.data.results && Array.isArray(response.data.results)) {
        data = response.data.results;
        totalRecords = response.data.total || response.data.totalRecords || data.length;
        totalPages = response.data.totalPages || Math.ceil(totalRecords / state.pageSize);
      } else {
        debugLog(`[${currentRequestId}] Unexpected response format:`, response.data);
        data = [];
        totalRecords = 0;
        totalPages = 0;
      }

      debugLog(`[${currentRequestId}] Processed:`, {
        dataLength: data.length,
        totalRecords,
        totalPages
      });

      // HANYA UPDATE JIKA REQUEST INI MASIH YANG TERBARU
      if (currentRequestId === requestIdRef.current) {
        setRawData(data);
        setState(prev => ({ 
          ...prev, 
          data: data,
          loading: false,
          totalRecords,
          totalPages
        }));
      } else {
        debugLog(`[${currentRequestId}] Not updating state - outdated request`);
      }
      
    } catch (error) {
      // Don't process cancelled requests
      if (axios.isCancel(error) || (error as any).name === 'CanceledError' || (error as any).name === 'AbortError') {
        debugLog(`[${currentRequestId}] Request cancelled`);
        return;
      }

      // Check if this request is still the latest
      if (currentRequestId !== requestIdRef.current) {
        debugLog(`[${currentRequestId}] Error ignored - outdated request. Latest: ${requestIdRef.current}`);
        return;
      }

      debugLog(`[${currentRequestId}] API Error:`, error);
      
      let errorMessage = 'Terjadi kesalahan saat memuat data';
      
      if (axios.isAxiosError(error)) {
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
      
      // HANYA UPDATE ERROR JIKA REQUEST INI MASIH YANG TERBARU
      if (currentRequestId === requestIdRef.current) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorMessage,
          data: [],
          totalRecords: 0,
          totalPages: 0
        }));
        setRawData([]);
      }
    }
  }, [apiEndpoint, searchMode, globalSearch, state.filterValues, state.sortConfig, state.currentPage, state.pageSize]);

  // Debounced version hanya untuk global search
  const debouncedFetch = useMemo(
    () => debounce(() => {
      debugLog('Debounced fetch triggered');
      setShouldFetch(true);
      setIsDebounced(true);
    }, 500),
    []
  );

  // Trigger fetch function
  const triggerFetch = useCallback((immediate: boolean = false) => {
    if (searchMode !== 'server') return;
    
    debugLog('Trigger fetch:', { immediate, globalSearch: globalSearch.trim(), hasFilters: Object.keys(state.filterValues).length > 0 });
    
    if (immediate) {
      // Cancel any pending debounced fetch
      debouncedFetch.cancel();
      setShouldFetch(true);
      setIsDebounced(false);
    } else {
      // Check if we should use debounced fetch (global search only, no other filters)
      const hasActiveFilters = Object.keys(state.filterValues).some(key => 
        state.filterValues[key] !== null && 
        state.filterValues[key] !== undefined && 
        state.filterValues[key] !== ''
      );
      const hasSort = state.sortConfig.length > 0;
      const hasNonDefaultPagination = state.currentPage > 1 || state.pageSize !== (config.pageSize || 10);
      
      if (globalSearch.trim() && !hasActiveFilters && !hasSort && !hasNonDefaultPagination) {
        // Only global search is active, use debounced
        debugLog('Using debounced fetch for search-only');
        debouncedFetch();
      } else {
        // Has filters or other params, fetch immediately
        debugLog('Using immediate fetch for filters/sort/pagination');
        debouncedFetch.cancel();
        setShouldFetch(true);
        setIsDebounced(false);
      }
    }
  }, [searchMode, globalSearch, state.filterValues, state.sortConfig, state.currentPage, state.pageSize, config.pageSize, debouncedFetch]);

  // SINGLE EFFECT untuk melakukan fetch
  useEffect(() => {
    if (shouldFetch && searchMode === 'server') {
      debugLog('Executing fetch due to shouldFetch=true', { isDebounced });
      setShouldFetch(false);
      setIsDebounced(false);
      fetchData();
    }
  }, [shouldFetch, fetchData, searchMode]);

  // Update functions
  const updateSort = useCallback((key: string) => {
    debugLog('Sort updated', { key });
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
    triggerFetch(true); // Immediate fetch untuk sort
  }, [triggerFetch]);

  const updateFilter = useCallback((key: string, value: any) => {
    debugLog('Filter updated', { key, value });
    setState(prev => ({
      ...prev,
      filterValues: { ...prev.filterValues, [key]: value },
      currentPage: 1
    }));
    triggerFetch(true); // Immediate fetch untuk filter
  }, [triggerFetch]);

  const updateGlobalSearch = useCallback((value: string) => {
    debugLog('Global search updated', { value });
    setGlobalSearch(value);
    setState(prev => ({ ...prev, currentPage: 1 }));
    triggerFetch(false); // Bisa debounced untuk global search
  }, [triggerFetch]);

  // Batch apply filters - IMMEDIATE FETCH
  const applyFilters = useCallback((filters: Record<string, any>, globalSearchValue: string) => {
    debugLog('Batch apply filters', { filters, globalSearchValue });
    
    // Cancel any pending debounced operations
    debouncedFetch.cancel();
    
    // Update state secara atomic
    setState(prev => ({
      ...prev,
      filterValues: filters,
      currentPage: 1
    }));
    setGlobalSearch(globalSearchValue);
    
    // Immediate fetch dengan state yang baru
    triggerFetch(true);
  }, [debouncedFetch, triggerFetch]);

  const updatePage = useCallback((page: number) => {
    debugLog('Page updated', { page });
    setState(prev => ({ ...prev, currentPage: page }));
    triggerFetch(true); // Immediate fetch untuk pagination
  }, [triggerFetch]);

  const updatePageSize = useCallback((size: number) => {
    debugLog('Page size updated', { size });
    setState(prev => ({ ...prev, pageSize: size, currentPage: 1 }));
    triggerFetch(true); // Immediate fetch untuk page size
  }, [triggerFetch]);

  const updateVisibleColumns = useCallback((columns: string[]) => {
    debugLog('Visible columns updated', { columns });
    const filteredColumns = getFilteredVisibleColumns(columns);
    setState(prev => ({ ...prev, visibleColumns: filteredColumns }));
    // No fetch needed untuk column visibility
  }, []);

  const updateFreezeColumn = useCallback((column: string | null) => {
    debugLog('Freeze column updated', { column });
    const safeColumn = column === 'id' ? null : column;
    setState(prev => ({ ...prev, freezeColumn: safeColumn }));
    // No fetch needed untuk freeze column
  }, []);

  const resetFilters = useCallback(() => {
    debugLog('Filters reset');
    debouncedFetch.cancel();
    setState(prev => ({
      ...prev,
      filterValues: {},
      currentPage: 1
    }));
    setGlobalSearch('');
    triggerFetch(true); // Immediate fetch untuk reset
  }, [debouncedFetch, triggerFetch]);

  const refresh = useCallback(() => {
    debugLog('Manual refresh triggered');
    debouncedFetch.cancel();
    triggerFetch(true); // Immediate fetch untuk refresh
  }, [debouncedFetch, triggerFetch]);

  // Initial data fetch
  useEffect(() => {
    if (fetchOnMount) {
      debugLog('Initial fetch triggered');
      triggerFetch(true);
    }
  }, [fetchOnMount, triggerFetch]);

  // Update state dengan processed data (client-side only)
  useEffect(() => {
    if (searchMode === 'client') {
      debugLog('Updating state with processed data (client-side)', {
        processedDataLength: processedData.data.length,
        totalPages: processedData.totalPages,
        totalRecords: processedData.totalRecords
      });
      
      setState(prev => ({
        ...prev,
        data: processedData.data,
        totalPages: processedData.totalPages,
        totalRecords: processedData.totalRecords
      }));
    }
  }, [processedData, searchMode]);

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Component unmounted');
      }
    };
  }, [debouncedFetch]);

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
    applyFilters,
    refresh
  };
};