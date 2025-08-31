// components/report/ReportFilters.tsx

import React, { useState } from 'react';
import { Button, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FaFilter, FaEye, FaLock, FaTimes, FaSearch } from 'react-icons/fa';
import { FilterConfig, ColumnConfig } from '../../types/report';

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
  loading?: boolean;
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
  loading = false
}) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);

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

  const handleResetAll = () => {
    onResetFilters();
    onGlobalSearchChange('');
  };

  const renderFilterInput = (filter: FilterConfig) => {
    const value = filterValues[filter.key] || '';
    
    switch (filter.type) {
      case 'select':
        return (
          <Form.Select
            value={value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            disabled={loading}
          >
            <option value="">Pilih {filter.label}</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        );
      
      case 'date':
        return (
          <Form.Control
            type="date"
            value={value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            disabled={loading}
          />
        );
      
      case 'number':
        return (
          <Form.Control
            type="number"
            value={value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            placeholder={`Masukkan ${filter.label}`}
            disabled={loading}
          />
        );
      
      case 'boolean':
        return (
          <Form.Select
            value={value}
            onChange={(e) => onFilterChange(filter.key, e.target.value === 'true' ? true : e.target.value === 'false' ? false : '')}
            disabled={loading}
          >
            <option value="">Pilih {filter.label}</option>
            <option value="true">Ya</option>
            <option value="false">Tidak</option>
          </Form.Select>
        );
      
      default:
        return (
          <Form.Control
            type="text"
            value={value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            placeholder={`Cari ${filter.label}`}
            disabled={loading}
          />
        );
    }
  };

  return (
    <>
      <div className="tw-bg-white tw-p-4 tw-rounded-lg tw-shadow-sm tw-border tw-border-gray-200 tw-mb-4 tw-mx-2 sm:tw-mx-0">
        {/* Global Search */}
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
                  ? "Cari di server (auto-complete)..." 
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
              Pencarian akan dilakukan di server dengan delay 500ms
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
              </Button>
            )}
            
            <Button
              variant="outline-success"
              onClick={() => setShowColumnModal(true)}
              disabled={loading}
              className="tw-flex tw-items-center tw-gap-2 tw-border-green-300 tw-text-green-600 hover:tw-bg-green-50 hover:tw-border-green-400"
            >
              <FaEye />
              Pilih Kolom ({visibleColumns.length})
            </Button>
            
            <Button
              variant="outline-info"
              onClick={() => setShowFreezeModal(true)}
              disabled={loading}
              className="tw-flex tw-items-center tw-gap-2 tw-border-blue-300 tw-text-blue-600 hover:tw-bg-blue-50 hover:tw-border-blue-400"
            >
              <FaLock />
              Freeze Kolom {freezeColumn && `(${columns.find(c => c.key === freezeColumn)?.label})`}
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

      {/* Filter Modal */}
      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} size="lg">
        <Modal.Header closeButton className="tw-bg-purple-50 tw-border-b tw-border-purple-200">
          <Modal.Title className="tw-text-purple-800 tw-flex tw-items-center tw-gap-2">
            <FaFilter />
            Filter Data
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {filters.map((filter, index) => (
              <Col md={6} key={filter.key} className="tw-mb-3">
                <Form.Group>
                  <Form.Label className="tw-font-semibold tw-text-gray-700">
                    {filter.label}
                  </Form.Label>
                  {renderFilterInput(filter)}
                </Form.Group>
              </Col>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer className="tw-bg-gray-50">
          <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Column Selection Modal */}
      <Modal show={showColumnModal} onHide={() => setShowColumnModal(false)} size="lg">
        <Modal.Header closeButton className="tw-bg-green-50 tw-border-b tw-border-green-200">
          <Modal.Title className="tw-text-green-800 tw-flex tw-items-center tw-gap-2">
            <FaEye />
            Pilih Kolom yang Ditampilkan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="tw-flex tw-gap-2 tw-mb-3">
            <Button size="sm" variant="outline-primary" onClick={handleSelectAll}>
              Pilih Semua
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={handleDeselectAll}>
              Hapus Semua
            </Button>
          </div>
          <div className="tw-grid tw-grid-cols-2 tw-gap-2">
            {columns.map((column) => (
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

      {/* Freeze Column Modal */}
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
              {columns.filter(col => visibleColumns.includes(col.key)).map((column) => (
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