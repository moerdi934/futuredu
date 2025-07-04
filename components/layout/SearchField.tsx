'use client';

import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import axios from 'axios';
import debounce from 'lodash/debounce';

interface SearchFieldProps {
  field: {
    key: string;
    label: string;
    endpoint: string;
    responseKey: string;
    valueKey: string;
    labelKey: string;
    dependencies?: Array<{
      field: string; // The field this depends on
      param: string; // The parameter name to use in the API call
    }>;
  };
  value: string;
  onChange: (value: string) => void;
  allFilters: Record<string, any>; // All current filter values
  className?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({ 
  field, 
  value, 
  onChange, 
  allFilters,
  className 
}) => {
  const [options, setOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOptions = async (search?: string) => {
    setIsLoading(true);
    try {
      let queryParams = search ? `search=${encodeURIComponent(search)}` : '';
      
      // Add dependency parameters
      if (field.dependencies && field.dependencies.length > 0) {
        field.dependencies.forEach(dependency => {
          const dependencyValue = allFilters[dependency.field];
          // Only add dependency if it has a valid value (not 'All')
          if (dependencyValue && dependencyValue !== 'All') {
            const paramValue = encodeURIComponent(dependencyValue);
            queryParams += queryParams ? `&${dependency.param}=${paramValue}` : `${dependency.param}=${paramValue}`;
          }
        });
      }
      
      const url = `${process.env.NEXT_PUBLIC_API_URL}${field.endpoint}${queryParams ? `?${queryParams}` : ''}`;
      const response = await axios.get(url);
      const items = response.data[field.responseKey];
      
      setOptions(
        items.map((item: any) => ({
          label: item[field.labelKey],
          value: item[field.valueKey],
        }))
      );
    } catch (error) {
      console.error(`Error fetching ${field.key}:`, error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetch = debounce(fetchOptions, 300);

  // Refetch options when any dependency changes
  useEffect(() => {
    fetchOptions();
  }, [
    // This will rerun when any dependency value changes
    ...(field.dependencies?.map(dep => allFilters[dep.field]) || [])
  ]);

  // Initial fetch
  useEffect(() => {
    fetchOptions();
  }, []);

  // Reset value if not in options (when dependencies change)
  useEffect(() => {
    if (options.length > 0 && value !== 'All') {
      const valueExists = options.some(option => option.value === value);
      if (!valueExists) {
        onChange('All');
      }
    }
  }, [options, value, onChange]);

  // Custom styles for react-select to ensure proper display
  const customStyles = {
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      position: 'absolute',
      width: '100%',
      maxHeight: '300px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9999
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#805ad5' : state.isFocused ? '#e9d8fd' : 'white',
      color: state.isSelected ? 'white' : '#4a5568',
    })
  };

  return (
    <Form.Group className={`tw-relative ${className || ''}`}>
      <Form.Label className="tw-block tw-mb-1 tw-font-medium">{field.label}</Form.Label>
      <div className="tw-relative">
        <Select
          value={options.find((option) => option.value === value) || { label: `All ${field.label}s`, value: 'All' }}
          onChange={(selectedOption) => onChange(selectedOption?.value || 'All')}
          options={[{ label: `All ${field.label}s`, value: 'All' }, ...options]}
          isClearable={false}
          placeholder={`Select ${field.label}`}
          onInputChange={debouncedFetch}
          isLoading={isLoading}
          filterOption={null}
          isDisabled={field.dependencies?.some(dep => 
            !allFilters[dep.field] || allFilters[dep.field] === 'All'
          )}
          styles={customStyles}
          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
          menuPosition="fixed"
          classNamePrefix="tw-select"
          className="tw-react-select-container"
        />
      </div>
    </Form.Group>
  );
};