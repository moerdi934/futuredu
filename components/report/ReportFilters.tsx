// components/report/ReportFilters.tsx (Fixed Version - No Internal Scrolling, No Export/Import)

import React, { useState, useEffect } from 'react';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FaFilter, FaEye, FaLock, FaTimes, FaSearch } from 'react-icons/fa';
import { Check, Filter, Eye, Lock, Search, X, RotateCcw, Settings, Bookmark } from 'lucide-react';
import { FilterConfig, ColumnConfig } from '../../types/report';
import { LearningModal, ModalButton } from '../modal/ModalTemplate';
import { ButtonGradient } from '../button/ButtonTemplate';
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
  onApplyFilters: (filters: Record<string, any>, globalSearch: string) => void;
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
  onApplyFilters,
  loading = false
}) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  
  // Local filter state for batch processing
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

  // Local filter change handler
  const handleLocalFilterChange = (key: string, value: any) => {
    setLocalFilterValues(prev => ({ ...prev, [key]: value }));
  };

  // Local global search change handler
  const handleLocalGlobalSearchChange = (value: string) => {
    setLocalGlobalSearch(value);
  };

  // Apply filters handler
  const handleApplyFilters = () => {
    onApplyFilters(localFilterValues, localGlobalSearch);
    setShowFilterModal(false);
  };

  // Reset local filters
  const handleResetLocalFilters = () => {
    setLocalFilterValues({});
    setLocalGlobalSearch('');
  };

  // Discard changes
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

  // Define modal buttons for different modals - removed export/import
  const filterModalBottomButtons: ModalButton[] = [
    {
      action: 'reset',
      text: 'Reset Filter',
      icon: <RotateCcw className="tw-w-4 tw-h-4" />,
      onClick: handleResetLocalFilters,
      disabled: getLocalActiveFiltersCount() === 0,
      customColors: {
        primary: '#F59E0B',
        secondary: '#D97706',
        gradient1: '#F59E0B',
        gradient2: '#FBBF24',
        text: '#FFFFFF'
      }
    },
    ...(hasChanges ? [{
      action: 'cancel' as const,
      text: 'Batal',
      icon: <X className="tw-w-4 tw-h-4" />,
      onClick: handleDiscardChanges,
      customColors: {
        primary: '#6B7280',
        secondary: '#4B5563',
        gradient1: '#6B7280',
        gradient2: '#9CA3AF',
        text: '#FFFFFF'
      }
    }] : []),
    {
      action: hasChanges ? 'apply' : 'close',
      text: hasChanges ? 'Terapkan Filter' : 'Tutup',
      icon: hasChanges ? <Check className="tw-w-4 tw-h-4" /> : <X className="tw-w-4 tw-h-4" />,
      onClick: handleApplyFilters,
      disabled: loading,
      customColors: hasChanges ? {
        primary: '#10B981',
        secondary: '#059669',
        gradient1: '#10B981',
        gradient2: '#34D399',
        text: '#FFFFFF'
      } : {
        primary: '#3B82F6',
        secondary: '#2563EB',
        gradient1: '#3B82F6',
        gradient2: '#60A5FA',
        text: '#FFFFFF'
      }
    }
  ];

  const columnModalTopButtons: ModalButton[] = [
    {
      action: 'bookmark',
      text: 'Simpan Layout',
      icon: <Bookmark className="tw-w-4 tw-h-4" />,
      onClick: () => {
        // Save current column layout to localStorage
        localStorage.setItem('report-column-layout', JSON.stringify(visibleColumns));
      },
      size: 'sm',
      customColors: {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        gradient1: '#8B5CF6',
        gradient2: '#A855F7',
        text: '#FFFFFF'
      }
    }
  ];

  const columnModalBottomButtons: ModalButton[] = [
    {
      action: 'add',
      text: 'Pilih Semua',
      onClick: handleSelectAll,
      customColors: {
        primary: '#10B981',
        secondary: '#059669',
        gradient1: '#10B981',
        gradient2: '#34D399',
        text: '#FFFFFF'
      }
    },
    {
      action: 'remove',
      text: 'Hapus Semua',
      onClick: handleDeselectAll,
      customColors: {
        primary: '#6B7280',
        secondary: '#4B5563',
        gradient1: '#6B7280',
        gradient2: '#9CA3AF',
        text: '#FFFFFF'
      }
    },
    {
      action: 'close',
      text: 'Tutup',
      icon: <X className="tw-w-4 tw-h-4" />,
      onClick: () => setShowColumnModal(false),
      customColors: {
        primary: '#3B82F6',
        secondary: '#2563EB',
        gradient1: '#3B82F6',
        gradient2: '#60A5FA',
        text: '#FFFFFF'
      }
    }
  ];

  const freezeModalBottomButtons: ModalButton[] = [
    {
      action: 'close',
      text: 'Tutup',
      icon: <X className="tw-w-4 tw-h-4" />,
      onClick: () => setShowFreezeModal(false),
      customColors: {
        primary: '#3B82F6',
        secondary: '#2563EB',
        gradient1: '#3B82F6',
        gradient2: '#60A5FA',
        text: '#FFFFFF'
      }
    }
  ];

  return (
    <>
      <div className="tw-bg-white tw-p-3 sm:tw-p-4 tw-rounded-lg tw-shadow-sm tw-border tw-border-gray-200 tw-mb-4 tw-mx-2 sm:tw-mx-0">
        {/* Global Search - Always immediate for UX */}
        <div className="tw-mb-4">
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-mb-2 tw-gap-2">
            <Form.Label className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-0">
              Pencarian Global
            </Form.Label>
            <div className="tw-flex tw-items-center tw-gap-2">
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
                  ? "Cari di semua kolom..." 
                  : "Cari di semua kolom..."
              }
              value={globalSearch}
              onChange={(e) => onGlobalSearchChange(e.target.value)}
              disabled={loading}
              className="tw-border-gray-300 focus:tw-border-purple-500 focus:tw-ring-purple-500"
            />
            {globalSearch && (
              <ButtonGradient
                action="clear"
                customText=""
                customIcon={<FaTimes />}
                onClick={() => onGlobalSearchChange('')}
                disabled={loading}
                size="sm"
                className="tw-border-gray-300"
              />
            )}
          </InputGroup>

        </div>

        {/* Filter Controls */}
        <div className="tw-flex tw-flex-wrap tw-gap-2 tw-justify-between tw-items-center">
          <div className="tw-flex tw-flex-wrap tw-gap-2">
            {filters.length > 0 && (
              <ButtonGradient
                action="filter"
                customText={`Filter ${getActiveFiltersCount() > 0 ? `(${getActiveFiltersCount()})` : ''}`}
                customIcon={
                  <div className="tw-relative">
                    <Filter className="tw-w-4 tw-h-4" />
                    {hasChanges && <span className="tw-absolute tw--top-1 tw--right-1 tw-w-2 tw-h-2 tw-bg-orange-400 tw-rounded-full"></span>}
                  </div>
                }
                onClick={() => setShowFilterModal(true)}
                disabled={loading}
                size="sm"
                customColors={{
                  primary: '#8B5CF6',
                  secondary: '#7C3AED',
                  gradient1: '#8B5CF6',
                  gradient2: '#A855F7',
                  text: '#FFFFFF'
                }}
              />
            )}
            
            <ButtonGradient
              action="view"
              customText={`Pilih Kolom (${visibleColumns.filter(col => col !== 'id').length})`}
              customIcon={<Eye className="tw-w-4 tw-h-4" />}
              onClick={() => setShowColumnModal(true)}
              disabled={loading}
              size="sm"
              customColors={{
                primary: '#10B981',
                secondary: '#059669',
                gradient1: '#10B981',
                gradient2: '#34D399',
                text: '#FFFFFF'
              }}
            />
            
            <ButtonGradient
              action="lock"
              customText={`Freeze Kolom ${freezeColumn && freezeColumn !== 'id' ? `(${columns.find(c => c.key === freezeColumn)?.label})` : ''}`}
              customIcon={<Lock className="tw-w-4 tw-h-4" />}
              onClick={() => setShowFreezeModal(true)}
              disabled={loading}
              size="sm"
              customColors={{
                primary: '#3B82F6',
                secondary: '#2563EB',
                gradient1: '#3B82F6',
                gradient2: '#60A5FA',
                text: '#FFFFFF'
              }}
            />
          </div>
          
          {getActiveFiltersCount() > 0 && (
            <ButtonGradient
              action="clear"
              customText="Reset Semua"
              customIcon={<X className="tw-w-4 tw-h-4" />}
              onClick={handleResetAll}
              disabled={loading}
              size="sm"
              customColors={{
                primary: '#EF4444',
                secondary: '#DC2626',
                gradient1: '#EF4444',
                gradient2: '#F87171',
                text: '#FFFFFF'
              }}
            />
          )}
        </div>
      </div>

      {/* Filter Modal - NO INTERNAL SCROLLING, NO EXPORT/IMPORT */}
      <LearningModal
        show={showFilterModal}
        onHide={hasChanges ? () => {} : () => setShowFilterModal(false)}
        title="Filter Data"
        subtitle={`${getLocalActiveFiltersCount()} filter aktif • ${filters.length} filter tersedia`}
        icon={<Filter className="tw-w-5 tw-h-5" />}
        size="xl"
        width="125vw"
        height="95vh"
        scrollable={true}
        bottomButtons={filterModalBottomButtons}
        preventCloseOnOutsideClick={hasChanges}
      >
        <div className="tw-space-y-6">
          {getLocalActiveFiltersCount() > 0 && (
            <div className="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-3">
              <div className="tw-flex tw-items-center tw-gap-2 tw-text-blue-700">
                <span className="tw-bg-blue-200 tw-text-blue-800 tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium">
                  {getLocalActiveFiltersCount()} filter aktif
                </span>
              </div>
            </div>
          )}
          
          {/* Filter Grid - Responsive layout WITHOUT scrolling */}
          <div className="tw-space-y-4">
            <Row className="tw-g-3">
              {filters.map((filter) => (
                <Col xs={12} sm={6} lg={4} xl={3} key={filter.key}>
                  <Form.Group className="tw-mb-0">
                    <Form.Label className="tw-font-semibold tw-text-gray-700 tw-mb-2 tw-text-sm">
                      {filter.label}
                      {/* {(filter as EnhancedFilterConfig).apiEndpoint && (
                        <small className="tw-text-blue-500 tw-ml-1">(API)</small>
                      )} */}
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
              <div className="tw-bg-orange-50 tw-border tw-border-orange-200 tw-rounded-lg tw-p-3">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-orange-700">
                  <span className="tw-w-2 tw-h-2 tw-bg-orange-400 tw-rounded-full tw-animate-pulse"></span>
                  <span className="tw-font-medium tw-text-sm">
                    Ada perubahan filter yang belum diterapkan
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </LearningModal>

      {/* Column Selection Modal - NO INTERNAL SCROLLING */}
      <LearningModal
        show={showColumnModal}
        onHide={() => setShowColumnModal(false)}
        title="Pilih Kolom yang Ditampilkan"
        subtitle={`${visibleColumns.filter(col => col !== 'id').length} dari ${columns.filter(col => col.key !== 'id').length} kolom dipilih`}
        icon={<Eye className="tw-w-5 tw-h-5" />}
        size="xl"
        width="90vw"
        height="80vh"
        scrollable={true}
        topButtons={columnModalTopButtons}
        bottomButtons={columnModalBottomButtons}
      >
        <div className="tw-space-y-4">
          {/* Responsive grid for column selection */}
          <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4 xl:tw-grid-cols-5 2xl:tw-grid-cols-6 tw-gap-3">
            {columns
              .filter(column => column.key !== 'id')
              .map((column) => (
                <div key={column.key} className="tw-p-3 tw-border tw-border-gray-200 tw-rounded-lg hover:tw-bg-gray-50 tw-transition-colors">
                  <Form.Check
                    type="checkbox"
                    id={`column-${column.key}`}
                    label={column.label}
                    checked={visibleColumns.includes(column.key)}
                    onChange={() => handleColumnToggle(column.key)}
                    className="tw-text-gray-700 tw-font-medium tw-text-sm"
                  />
                </div>
              ))}
          </div>
        </div>
      </LearningModal>

      {/* Freeze Column Modal - NO INTERNAL SCROLLING */}
      <LearningModal
        show={showFreezeModal}
        onHide={() => setShowFreezeModal(false)}
        title="Freeze Kolom"
        subtitle="Pilih kolom untuk di-freeze saat scroll horizontal"
        icon={<Lock className="tw-w-5 tw-h-5" />}
        size="lg"
        width="70vw"
        height="60vh"
        scrollable={true}
        bottomButtons={freezeModalBottomButtons}
      >
        <div className="tw-space-y-4">
          <Form.Group>
            <Form.Label className="tw-font-semibold tw-text-gray-700 tw-mb-3">
              Pilih kolom untuk di-freeze saat scroll horizontal:
            </Form.Label>
            <Form.Select
              value={freezeColumn || ''}
              onChange={(e) => onFreezeColumnChange(e.target.value || null)}
              className="tw-border-gray-300 focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-text-base"
              size="lg"
            >
              <option value="">Tidak ada</option>
              {columns
                .filter(col => visibleColumns.includes(col.key) && col.key !== 'id')
                .map((column) => (
                  <option key={column.key} value={column.key}>
                    {column.label}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </div>
      </LearningModal>
    </>
  );
};

export default ReportFilters;