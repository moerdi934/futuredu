'use client';

import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaFilter } from 'react-icons/fa';
import { YesNoField } from './YesNoField';
import { SearchField } from './SearchField';
import { DateRangeField } from './DateRangeField';
import { CustomField } from './CustomField';

interface FilterModalTemplateProps {
  show: boolean;
  onHide: () => void;
  config: {
    defaultFilters: any;
    formConfig: Array<any>;
  };
  initialFilters: any;
  onApplyFilters: (filters: any) => void;
}

const FilterModalTemplate: React.FC<FilterModalTemplateProps> = ({
  show,
  onHide,
  config,
  initialFilters,
  onApplyFilters,
}) => {
  const [localFilters, setLocalFilters] = useState({ ...config.defaultFilters, ...initialFilters });

  const handleApply = () => {
    onApplyFilters(localFilters);
    onHide();
  };

  const handleReset = () => {
    setLocalFilters(config.defaultFilters);
    onApplyFilters(config.defaultFilters);
    onHide();
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    
    // Reset dependent fields when parent field changes
    config.formConfig.forEach(field => {
      if (field.type === 'search' && field.dependencies) {
        const shouldReset = field.dependencies.some((dep: any) => dep.field === key);
        if (shouldReset) {
          newFilters[field.key] = 'All';
        }
      }
    });
    
    setLocalFilters(newFilters);
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'yes-no':
        return (
          <YesNoField
            field={field}
            value={localFilters[field.key]}
            onChange={(value) => handleFilterChange(field.key, value)}
          />
        );
      case 'custom':
        return (
          <CustomField
            field={field}
            value={localFilters[field.key]}
            onChange={(value) => handleFilterChange(field.key, value)}
          />
        );
      case 'search':
        return (
          <SearchField
            field={field}
            value={localFilters[field.key]}
            onChange={(value) => handleFilterChange(field.key, value)}
            allFilters={localFilters}
            className="tw-dropdown-container"
          />
        );
      case 'date-range':
        return (
          <DateRangeField
            value={{
              dateRange: localFilters.dateRange,
              startDate: localFilters.startDate,
              endDate: localFilters.endDate,
            }}
            onChange={(value) => setLocalFilters({ ...localFilters, ...value })}
            className="tw-dropdown-container"
          />
        );
      default:
        return null;
    }
  };

  // Sort fields to ensure dependencies are rendered first
  const sortedFields = [...config.formConfig].sort((a, b) => {
    // Fields that are dependencies for others should come first
    const aIsDependency = config.formConfig.some(field => 
      field.dependencies?.some((dep: any) => dep.field === a.key)
    );
    const bIsDependency = config.formConfig.some(field => 
      field.dependencies?.some((dep: any) => dep.field === b.key)
    );
    
    if (aIsDependency && !bIsDependency) return -1;
    if (!aIsDependency && bIsDependency) return 1;
    return 0;
  });

  return (
    <>
      {/* Add global styles for dropdowns */}
      <style jsx>{`
        .tw-dropdown-container .dropdown-menu {
          z-index: 9999 !important;
        }
        .modal-dialog {
          margin: 0.5rem auto;
        }
        .modal-content {
          max-height: 95vh;
          display: flex;
          flex-direction: column;
        }
        .modal-body {
          overflow-y: auto;
          position: relative;
        }
        .dropdown-menu.show {
          position: fixed !important;
          z-index: 9999 !important;
          max-height: 300px;
          overflow-y: auto;
        }
      `}</style>

      <Modal 
        show={show} 
        onHide={onHide} 
        size="lg"
        className="tw-max-h-screen"
        dialogClassName="tw-h-full md:tw-h-auto tw-max-h-[95vh] tw-m-2 md:tw-mx-auto"
      >
        <Modal.Header 
          closeButton
          className="tw-bg-purple-100 tw-border-b tw-border-purple-300"
        >
          <Modal.Title className="tw-flex tw-items-center tw-text-purple-800">
            <FaFilter className="tw-mr-2" />
            Filter Options
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="tw-overflow-y-auto tw-flex-grow">
          <Form className="tw-p-1">
            <Row>
              {sortedFields.map((field) => (
                <Col 
                  key={field.key} 
                  xs={12} 
                  md={field.type === 'date-range' ? 12 : 6} 
                  className="tw-mb-3 tw-dropdown-parent"
                >
                  {renderField(field)}
                </Col>
              ))}
            </Row>
          </Form>
        </Modal.Body>
        
        <Modal.Footer className="tw-border-t tw-border-purple-300 tw-bg-purple-50 tw-sticky tw-bottom-0">
          <Button 
            variant="outline-secondary" 
            onClick={handleReset}
            className="tw-bg-white tw-text-purple-700 tw-border-purple-300 hover:tw-bg-purple-100"
          >
            Reset Filters
          </Button>
          <Button 
            variant="primary" 
            onClick={handleApply}
            className="tw-bg-purple-600 tw-border-purple-700 hover:tw-bg-purple-700"
          >
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FilterModalTemplate;