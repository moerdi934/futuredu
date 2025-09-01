// components/report/ReportFilters.tsx (Enhanced)

import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FaFilter, FaEye, FaLock, FaTimes, FaSearch, FaCheck, FaUndo } from 'react-icons/fa';
import { FilterConfig, ColumnConfig } from '../../types/report';
import { 
  ShortFormField,
  SearchSingleField, 
  SelectCustomField,
  NumberField,
  DateField,
  BooleanField
} from '../form/FormComponentLayout';

// API Helper
const apiClient = {
  async get(endpoint: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }
};

interface SelectOption {
  value: any;
  label: string;
}

interface ReportFiltersProps {
  filters?: FilterConfig[];
  columns: ColumnConfig[];
  filterValues: Record<string, any>;
  globalSearch: string;
  visibleColumns: string[];
  freezeColumn: string | null;
  searchMode?: 'client' | 'server';
  onFilterChange: (key: string, value: any) => void;
  onGlobalSearchChange: (value: string) => void;
  onVisibleColumnsChange: (columns: string[]) => void;
  onFreezeColumnChange: (column: string | null) => void;
  onResetFilters: () => void;
  onApplyFilters: (filters: Record<string, any>, globalSearch: string) => void; // NEW: Batch apply
  loading?: boolean;
}

// Enhanced FilterConfig interface
interface EnhancedFilterConfig extends FilterConfig {
  apiEndpoint?: string;
  debounceMs?: number;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters = [],
  columns,
  filterValues,
  globalSearch,
  visibleColumns,
  freezeColumn,
  searchMode = 'client',
  onFilterChange,
  onGlobalSearchChange,
  onVisibleColumnsChange,
  onFreezeColumnChange,
  onResetFilters,
  onApplyFilters, // NEW
  loading = false
}) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  
  // NEW: Local filter state for batch processing
  const [localFilterValues, setLocalFilterValues] = useState<Record<string, any>>(filterValues);
  const [localGlobalSearch, setLocalGlobalSearch] = useState<string>(globalSearch);
  const [hasChanges, setHasChanges] = useState(false);
  
  // State for dynamic filter options
  const [filterOptions, setFilterOptions] = useState<Record<string, SelectOption[]>>({});
  const [filterLoading, setFilterLoading] = useState<Record<string, boolean>>({});

  // Update local state when props change
  useEffect(() => {
    setLocalFilterValues(filterValues);
    setLocalGlobalSearch(globalSearch);
    setHasChanges(false);
  }, [filterValues, globalSearch]);

  // Check for changes
  useEffect(() => {
    const filtersChanged = JSON.stringify(localFilterValues) !== JSON.stringify(filterValues);
    const searchChanged = localGlobalSearch !== globalSearch;
    setHasChanges(filtersChanged || searchChanged);
  }, [localFilterValues, localGlobalSearch, filterValues, globalSearch]);

  // Load initial filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      const apiFilters = filters.filter(filter => (filter as EnhancedFilterConfig).apiEndpoint);
      
      for (const filter of apiFilters) {
        const enhancedFilter = filter as EnhancedFilterConfig;
        if (enhancedFilter.apiEndpoint) {
          try {
            setFilterLoading(prev => ({ ...prev, [filter.key]: true }));
            const data = await apiClient.get(enhancedFilter.apiEndpoint);
            setFilterOptions(prev => ({ ...prev, [filter.key]: data }));
          } catch (error) {
            console.error(`Error loading options for ${filter.key}:`, error);
            setFilterOptions(prev => ({ ...prev, [filter.key]: [] }));
          } finally {
            setFilterLoading(prev => ({ ...prev, [filter.key]: false }));
          }
        }
      }
    };

    loadFilterOptions();
  }, [filters]);

  // NEW: Local filter change handler
  const handleLocalFilterChange = (key: string, value: any) => {
    setLocalFilterValues(prev => ({ ...prev, [key]: value }));
  };

  // NEW: Local global search change handler
  const handleLocalGlobalSearchChange = (value: string) => {
    setLocalGlobalSearch(value);
  };

  // NEW: Apply filters handler
  const handleApplyFilters = () => {
    onApplyFilters(localFilterValues, localGlobalSearch);
    setShowFilterModal(false);
  };

  // NEW: Reset local filters
  const handleResetLocalFilters = () => {
    setLocalFilterValues({});
    setLocalGlobalSearch('');
  };

  // NEW: Discard changes
  const handleDiscardChanges = () => {
    setLocalFilterValues(filterValues);
    setLocalGlobalSearch(globalSearch);
    setHasChanges(false);
    setShowFilterModal(false);
  };

  const handleColumnToggle = (columnKey: string) => {
    if (visibleColumns.includes(columnKey)) {
      onVisibleColumnsChange(visibleColumns.filter(key => key !== columnKey));
    } else {
      onVisibleColumnsChange([...visibleColumns, columnKey]);
    }
  };

  const handleSelectAll = () => {
    onVisibleColumnsChange(columns.map(col => col.key));
  };

  const handleDeselectAll = () => {
    onVisibleColumnsChange([]);
  };

  const getActiveFiltersCount = () => {
    const filterCount = Object.values(filterValues).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
    const globalSearchCount = globalSearch ? 1 : 0;
    return filterCount + globalSearchCount;
  };

  const getLocalActiveFiltersCount = () => {
    const filterCount = Object.values(localFilterValues).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
    const globalSearchCount = localGlobalSearch ? 1 : 0;
    return filterCount + globalSearchCount;
  };

  const handleResetAll = () => {
    onResetFilters();
    onGlobalSearchChange('');
  };

  const renderFilterInput = (filter: EnhancedFilterConfig) => {
    const value = localFilterValues[filter.key] || '';
    
    switch (filter.type) {
      case 'select':
        let options = filter.options || [];
        
        // Use API options if available
        if (filter.apiEndpoint && filterOptions[filter.key]) {
          options = filterOptions[filter.key];
        }

        const isLoading = filterLoading[filter.key] || false;
        
        if (filter.apiEndpoint) {
          // Use SearchSingleField for API-based selects
          return (
            <SearchSingleField
              label=""
              value={value ? { value: value, label: options.find(opt => opt.value === value)?.label || value } : null}
              options={options}
              onChange={(newValue) => handleLocalFilterChange(filter.key, newValue?.value || '')}
              isLoading={isLoading}
              apiEndpoint={filter.apiEndpoint}
              debounceMs={filter.debounceMs || 300}
            />
          );
        } else {
          // Use SelectCustomField for static selects
          return (
            <SelectCustomField
              label=""
              value={value ? { value: value, label: options.find(opt => opt.value === value)?.label || value } : null}
              options={options}
              onChange={(newValue) => handleLocalFilterChange(filter.key, newValue?.value || '')}
              placeholder={`Pilih ${filter.label}`}
            />
          );
        }
      
      case 'date':
        return (
          <DateField
            label=""
            value={value ? new Date(value) : null}
            onChange={(date) => handleLocalFilterChange(filter.key, date ? date.toISOString().split('T')[0] : '')}
            placeholder={`Pilih ${filter.label}`}
          />
        );
      
      case 'number':
        return (
          <NumberField
            label=""
            value={value}
            onChange={(e) => handleLocalFilterChange(filter.key, e.target.value)}
            placeholder={`Masukkan ${filter.label}`}
          />
        );
      
      case 'boolean':
        return (
          <BooleanField
            label=""
            value={value === '' ? null : value}
            onChange={(val) => handleLocalFilterChange(filter.key, val === null ? '' : val)}
            type="select"
            trueLabel="Ya"
            falseLabel="Tidak"
          />
        );
      
      default:
        return (
          <ShortFormField
            label=""
            value={value}
            onChange={(e) => handleLocalFilterChange(filter.key, e.target.value)}
          />
        );
    }
  };

  return (
    <>
      <div className="tw-bg-white tw-p-4 tw-rounded-lg tw-shadow-sm tw-border tw-border-gray-200 tw-mb-4 tw-mx-2 sm:tw-mx-0">
        {/* Global Search - Always immediate for UX */}
        <div className="tw-mb-4">
          <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
            <Form.Label className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-0">
              Pencarian Global
            </Form.Label>
            <div className="tw-flex tw-items-center tw-gap-2">
              <span className={`tw-text-xs tw-px-2 tw-py-1 tw-rounded tw-font-medium ${
                searchMode === 'server' 
                  ? 'tw-bg-blue-100 tw-text-blue-800' 
                  : 'tw-bg-gray-100 tw-text-gray-600'
              }`}>
                {searchMode === 'server' ? 'Server Search' : 'Client Search'}
              </span>
              {searchMode === 'server' && loading && globalSearch && (
                <span className="tw-text-xs tw-text-blue-600">Mencari...</span>
              )}
            </div>
          </div>
          <InputGroup>
            <InputGroup.Text className="tw-bg-gray-50 tw-border-gray-300">
              <FaSearch className="tw-text-gray-400" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={
                searchMode === 'server' 
                  ? "Cari di server (auto-complete dengan debounce)..." 
                  : "Cari di semua kolom..."
              }
              value={globalSearch}
              onChange={(e) => onGlobalSearchChange(e.target.value)}
              disabled={loading}
              className="tw-border-gray-300 focus:tw-border-purple-500 focus:tw-ring-purple-500"
            />
            {globalSearch && (
              <Button
                variant="outline-secondary"
                onClick={() => onGlobalSearchChange('')}
                disabled={loading}
                className="tw-border-gray-300"
              >
                <FaTimes />
              </Button>
            )}
          </InputGroup>
          {searchMode === 'server' && (
            <div className="tw-text-xs tw-text-gray-500 tw-mt-1">
              Pencarian global dilakukan langsung di server dengan debounce 500ms
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="tw-flex tw-flex-wrap tw-gap-2 tw-justify-between tw-items-center">
          <div className="tw-flex tw-flex-wrap tw-gap-2">
            {filters.length > 0 && (
              <Button
                variant="outline-primary"
                onClick={() => setShowFilterModal(true)}
                disabled={loading}
                className="tw-flex tw-items-center tw-gap-2 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50 hover:tw-border-purple-400"
              >
                <FaFilter />
                Filter {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
                {hasChanges && <span className="tw-w-2 tw-h-2 tw-bg-orange-400 tw-rounded-full"></span>}
              </Button>
            )}
            
            <Button
              variant="outline-success"
              onClick={() => setShowColumnModal(true)}
              disabled={loading}
              className="tw-flex tw-items-center tw-gap-2 tw-border-green-300 tw-text-green-600 hover:tw-bg-green-50 hover:tw-border-green-400"
            >
              <FaEye />
              Pilih Kolom ({visibleColumns.filter(col => col !== 'id').length}) {/* Hide ID from count */}
            </Button>
            
            <Button
              variant="outline-info"
              onClick={() => setShowFreezeModal(true)}
              disabled={loading}
              className="tw-flex tw-items-center tw-gap-2 tw-border-blue-300 tw-text-blue-600 hover:tw-bg-blue-50 hover:tw-border-blue-400"
            >
              <FaLock />
              Freeze Kolom {freezeColumn && freezeColumn !== 'id' && `(${columns.find(c => c.key === freezeColumn)?.label})`}
            </Button>
          </div>
          
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="outline-danger"
              onClick={handleResetAll}
              disabled={loading}
              className="tw-flex tw-items-center tw-gap-2"
              size="sm"
            >
              <FaTimes />
              Reset Semua
            </Button>
          )}
        </div>
      </div>

      {/* Filter Modal with Batch System */}
      <Modal show={showFilterModal} onHide={hasChanges ? undefined : () => setShowFilterModal(false)} size="lg" backdrop={hasChanges ? 'static' : true}>
        <Modal.Header className="tw-bg-purple-50 tw-border-b tw-border-purple-200">
          <Modal.Title className="tw-text-purple-800 tw-flex tw-items-center tw-gap-2">
            <FaFilter />
            Filter Data
            {getLocalActiveFiltersCount() > 0 && (
              <span className="tw-bg-purple-200 tw-text-purple-800 tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium">
                {getLocalActiveFiltersCount()} aktif
              </span>
            )}
          </Modal.Title>
          {!hasChanges && (
            <Button 
              variant="link" 
              className="tw-text-gray-400 hover:tw-text-gray-600 tw-p-0 tw-border-0 tw-ml-auto" 
              onClick={() => setShowFilterModal(false)}
              aria-label="Close"
            >
              <FaTimes size={16} />
            </Button>
          )}
        </Modal.Header>
        <Modal.Body className="tw-bg-gradient-to-br tw-from-purple-50 tw-via-white tw-to-purple-50">
          <Row>
            {filters.map((filter, index) => (
              <Col md={6} key={filter.key} className="tw-mb-3">
                <Form.Group>
                  <Form.Label className="tw-font-semibold tw-text-gray-700">
                    {filter.label}
                    {(filter as EnhancedFilterConfig).apiEndpoint && (
                      <small className="tw-text-blue-500 tw-ml-1">(API)</small>
                    )}
                  </Form.Label>
                  <div className="tw-text-gray-800">
                    {renderFilterInput(filter as EnhancedFilterConfig)}
                  </div>
                </Form.Group>
              </Col>
            ))}
          </Row>
          
          {/* Changes Indicator */}
          {hasChanges && (
            <div className="tw-bg-orange-50 tw-border tw-border-orange-200 tw-rounded-lg tw-p-3 tw-mt-4">
              <div className="tw-flex tw-items-center tw-gap-2 tw-text-orange-700">
                <span className="tw-w-2 tw-h-2 tw-bg-orange-400 tw-rounded-full tw-animate-pulse"></span>
                <span className="tw-font-medium tw-text-sm">
                  Ada perubahan filter yang belum diterapkan
                </span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="tw-bg-gray-50 tw-flex tw-justify-between">
          <div className="tw-flex tw-gap-2">
            <Button 
              variant="outline-secondary" 
              onClick={handleResetLocalFilters}
              disabled={getLocalActiveFiltersCount() === 0}
              className="tw-flex tw-items-center tw-gap-2"
            >
              <FaUndo />
              Reset Filter
            </Button>
          </div>
          <div className="tw-flex tw-gap-2">
            {hasChanges && (
              <Button 
                variant="outline-warning" 
                onClick={handleDiscardChanges}
                className="tw-flex tw-items-center tw-gap-2"
              >
                <FaTimes />
                Batal
              </Button>
            )}
            <Button 
              variant="primary" 
              onClick={handleApplyFilters}
              disabled={loading}
              className="tw-flex tw-items-center tw-gap-2 tw-bg-purple-600 hover:tw-bg-purple-700"
            >
              <FaCheck />
              {hasChanges ? 'Terapkan Filter' : 'Tutup'}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Column Selection Modal - Hide ID column */}
      <Modal show={showColumnModal} onHide={() => setShowColumnModal(false)} size="lg">
        <Modal.Header closeButton className="tw-bg-green-50 tw-border-b tw-border-green-200">
          <Modal.Title className="tw-text-green-800 tw-flex tw-items-center tw-gap-2">
            <FaEye />
            Pilih Kolom yang Ditampilkan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="tw-flex tw-gap-2 tw-mb-3">
            <Button 
              size="sm" 
              variant="outline-primary" 
              onClick={handleSelectAll}
            >
              Pilih Semua
            </Button>
            <Button 
              size="sm" 
              variant="outline-secondary" 
              onClick={handleDeselectAll}
            >
              Hapus Semua
            </Button>
          </div>
          <div className="tw-grid tw-grid-cols-2 tw-gap-2">
            {columns
              .filter(column => column.key !== 'id') // Hide ID column from selection
              .map((column) => (
                <Form.Check
                  key={column.key}
                  type="checkbox"
                  id={`column-${column.key}`}
                  label={column.label}
                  checked={visibleColumns.includes(column.key)}
                  onChange={() => handleColumnToggle(column.key)}
                  className="tw-text-gray-700"
                />
              ))}
          </div>
        </Modal.Body>
        <Modal.Footer className="tw-bg-gray-50">
          <Button variant="secondary" onClick={() => setShowColumnModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Freeze Column Modal - Hide ID column */}
      <Modal show={showFreezeModal} onHide={() => setShowFreezeModal(false)}>
        <Modal.Header closeButton className="tw-bg-blue-50 tw-border-b tw-border-blue-200">
          <Modal.Title className="tw-text-blue-800 tw-flex tw-items-center tw-gap-2">
            <FaLock />
            Freeze Kolom
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="tw-font-semibold tw-text-gray-700">
              Pilih kolom untuk di-freeze saat scroll horizontal:
            </Form.Label>
            <Form.Select
              value={freezeColumn || ''}
              onChange={(e) => onFreezeColumnChange(e.target.value || null)}
            >
              <option value="">Tidak ada</option>
              {columns
                .filter(col => visibleColumns.includes(col.key) && col.key !== 'id') // Hide ID from freeze options
                .map((column) => (
                  <option key={column.key} value={column.key}>
                    {column.label}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="tw-bg-gray-50">
          <Button variant="secondary" onClick={() => setShowFreezeModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReportFilters;