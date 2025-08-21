// components/layout/FormComponentLayout.tsx - Fixed Dropdown Z-Index untuk Wilayah
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Form, InputGroup, Button, Card, Row, Col } from 'react-bootstrap';
import { Calendar } from 'lucide-react';
import DatePicker from "react-datepicker";
import Select from "react-select";
import { ChangeEvent } from 'react';
import { SingleValue, MultiValue, ActionMeta } from 'react-select';
import { Eye, EyeOff } from 'lucide-react';

// API Base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API Helper Functions
const apiClient = {
  async get(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  async put(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  async delete(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  }
};

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectCustomProps {
  label: string;
  value: SelectOption | null;
  options: SelectOption[];
  onChange: (newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  apiEndpoint?: string;
}

export interface ShortFormProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  isFixed?: boolean;
  fixedValue?: string;
  isRegex?: boolean;
  regex?: string;
  regexErrorMessage?: string;
  isPassword?: boolean;
}

export interface WideFormProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

export interface SearchSingleProps {
  label: string;
  value: SelectOption | null;
  options: SelectOption[];
  onChange: (newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => void;
  onInputChange?: (newValue: string) => void;
  isLoading?: boolean;
  error?: string;
  required?: boolean;
  apiEndpoint?: string;
  debounceMs?: number;
}

export interface SearchMultipleProps {
  label: string;
  value: SelectOption[];
  options: SelectOption[];
  onChange: (newValue: MultiValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => void;
  onInputChange?: (newValue: string) => void;
  isLoading?: boolean;
  error?: string;
  required?: boolean;
  apiEndpoint?: string;
  debounceMs?: number;
}

export interface YesNoProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface DateRangeProps {
  label: string;
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  anytime: boolean;
  onAnytimeChange: (checked: boolean) => void;
  error?: string;
  required?: boolean;
}

export interface EnhancedSearchSingleProps extends SearchSingleProps {
  preserveExistingParams?: boolean;
  customSearchParam?: string;
}

// Custom styling untuk react-select dengan z-index TINGGI untuk dropdown wilayah
const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(4px)',
    border: 'none',
    borderRadius: '12px',
    padding: '8px 12px',
    color: '#374151',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    zIndex: state.isFocused ? 10 : 1,
    '&:hover': {
      borderColor: '#667eea',
    }
  }),
  input: (provided: any) => ({
    ...provided,
    color: '#374151',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#9CA3AF',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#374151',
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: '#ffffff',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    // Z-INDEX TINGGI untuk dropdown wilayah agar tidak tertutup oleh div pendidikan
    zIndex: 1050,
    marginTop: '4px',
    position: 'absolute',
    width: '100%',
    left: 0,
    top: '100%'
  }),
  menuList: (provided: any) => ({
    ...provided,
    padding: '8px',
    maxHeight: '200px',
    overflowY: 'auto',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? '#667eea' 
      : state.isFocused 
        ? '#F3F4F6' 
        : '#ffffff',
    color: state.isSelected 
      ? '#ffffff' 
      : '#374151',
    borderRadius: '8px',
    margin: '2px 0',
    padding: '12px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: state.isSelected ? '#667eea' : '#F3F4F6',
    }
  }),
  noOptionsMessage: (provided: any) => ({
    ...provided,
    color: '#6B7280',
    padding: '12px',
  }),
  loadingMessage: (provided: any) => ({
    ...provided,
    color: '#6B7280',
    padding: '12px',
  }),
};

// Custom styling untuk react-select dengan z-index RENDAH untuk dropdown pendidikan
const customSelectStylesEducation = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(4px)',
    border: 'none',
    borderRadius: '12px',
    padding: '8px 12px',
    color: '#374151',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    zIndex: state.isFocused ? 10 : 1,
    '&:hover': {
      borderColor: '#667eea',
    }
  }),
  input: (provided: any) => ({
    ...provided,
    color: '#374151',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#9CA3AF',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#374151',
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: '#ffffff',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    // Z-INDEX RENDAH untuk dropdown pendidikan
    zIndex: 50,
    marginTop: '4px',
    position: 'absolute',
    width: '100%',
    left: 0,
    top: '100%'
  }),
  menuList: (provided: any) => ({
    ...provided,
    padding: '8px',
    maxHeight: '200px',
    overflowY: 'auto',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? '#667eea' 
      : state.isFocused 
        ? '#F3F4F6' 
        : '#ffffff',
    color: state.isSelected 
      ? '#ffffff' 
      : '#374151',
    borderRadius: '8px',
    margin: '2px 0',
    padding: '12px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: state.isSelected ? '#667eea' : '#F3F4F6',
    }
  }),
  noOptionsMessage: (provided: any) => ({
    ...provided,
    color: '#6B7280',
    padding: '12px',
  }),
  loadingMessage: (provided: any) => ({
    ...provided,
    color: '#6B7280',
    padding: '12px',
  }),
};

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const SearchSingleField: React.FC<EnhancedSearchSingleProps> = ({ 
  label, 
  value, 
  options: initialOptions, 
  onChange, 
  onInputChange, 
  isLoading: externalLoading = false, 
  error,
  required = false,
  apiEndpoint,
  debounceMs = 300,
  preserveExistingParams = false,
  customSearchParam = 'search'
}) => {
  const [options, setOptions] = useState<SelectOption[]>(initialOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);
  const selectRef = useRef<any>(null);

  const handleInputChange = (newValue: string) => {
    setSearchTerm(newValue);
    if (onInputChange) {
      onInputChange(newValue);
    }
  };

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions, label]);

  const buildApiEndpoint = (baseEndpoint: string, searchValue: string): string => {
    if (!searchValue.trim()) {
      return baseEndpoint;
    }

    if (preserveExistingParams) {
      try {
        const url = new URL(baseEndpoint, 'http://localhost');
        url.searchParams.set(customSearchParam, searchValue.trim());
        return url.pathname + url.search;
      } catch (error) {
        console.error('Error building URL with existing params:', error);
        const hasExistingParams = baseEndpoint.includes('?');
        const separator = hasExistingParams ? '&' : '?';
        return `${baseEndpoint}${separator}${customSearchParam}=${encodeURIComponent(searchValue.trim())}`;
      }
    } else {
      return `${baseEndpoint}?${customSearchParam}=${encodeURIComponent(searchValue.trim())}`;
    }
  };

  useEffect(() => {
    const searchOptions = async () => {
      if (!apiEndpoint) return;
      
      setIsLoading(true);
      try {
        const endpoint = buildApiEndpoint(apiEndpoint, debouncedSearchTerm);
        const data = await apiClient.get(endpoint);
        setOptions(data);
      } catch (error) {
        console.error('Failed to search options:', error);
        setOptions(initialOptions);
      } finally {
        setIsLoading(false);
      }
    };

    if (debouncedSearchTerm !== '' || !apiEndpoint) {
      searchOptions();
    }
  }, [debouncedSearchTerm, apiEndpoint, initialOptions, preserveExistingParams, customSearchParam]);

  const validatedOptions = options.map(option => ({
    ...option,
    label: String(option.label || ''),
    value: option.value
  }));

  // Determine which styles to use based on label (untuk dropdown wilayah vs pendidikan)
  const isLocationField = label && (
    label.toLowerCase().includes('provinsi') || 
    label.toLowerCase().includes('kota') || 
    label.toLowerCase().includes('kecamatan') || 
    label.toLowerCase().includes('kelurahan')
  );

  const selectStyles = isLocationField ? customSelectStyles : customSelectStylesEducation;

  return (
    <Form.Group className="mb-3" ref={selectRef}>
      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      <div style={{ position: 'relative' }}>
        <Select
          value={value}
          options={validatedOptions}
          onChange={onChange}
          onInputChange={handleInputChange}
          isLoading={isLoading || externalLoading}
          isClearable
          isSearchable
          className={error ? 'is-invalid' : ''}
          styles={selectStyles}
          placeholder="Type to search..."
          noOptionsMessage={() => "No options found"}
          loadingMessage={() => "Loading..."}
          menuPlacement="bottom"
          menuPosition="absolute"
          menuShouldScrollIntoView={false}
          menuShouldBlockScroll={false}
          filterOption={(option, inputValue) => {
            if (!inputValue) return true;
            const searchValue = String(inputValue || '').toLowerCase();
            const label = String(option.label || '').toLowerCase();
            return label.includes(searchValue);
          }}
        />
      </div>
      {error && (
        <div className="invalid-feedback" style={{ display: 'block' }}>
          {error}
        </div>
      )}
    </Form.Group>
  );
};

export const ShortFormField: React.FC<ShortFormProps> = ({ 
  label, 
  value, 
  onChange, 
  error, 
  required = false,
  isFixed = false,
  fixedValue = '',
  isRegex = false,
  regex = '',
  regexErrorMessage = 'Input does not match the required pattern',
  isPassword = false
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const validateRegex = (input: string): boolean => {
    if (!isRegex || !regex) return true;
    try {
      const regexPattern = new RegExp(regex);
      return regexPattern.test(input);
    } catch (e) {
      console.error('Invalid regex pattern:', e);
      return false;
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isFixed) return;
    
    const newValue = e.target.value;
    onChange(e);
    
    if (isRegex && !validateRegex(newValue)) {
      e.target.setCustomValidity(regexErrorMessage);
    } else {
      e.target.setCustomValidity('');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      {isPassword ? (
        <InputGroup>
          <Form.Control
            type={showPassword ? "text" : "password"}
            value={isFixed ? fixedValue : value}
            onChange={handleChange}
            isInvalid={!!error || (isRegex && !validateRegex(value))}
            disabled={isFixed}
            className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
          />
          <InputGroup.Text 
            onClick={togglePasswordVisibility}
            style={{ cursor: 'pointer' }}
            className="tw-bg-white/95 tw-border-0 tw-rounded-r-xl"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </InputGroup.Text>
          <Form.Control.Feedback type="invalid">
            {error || (isRegex && !validateRegex(value) ? regexErrorMessage : '')}
          </Form.Control.Feedback>
        </InputGroup>
      ) : (
        <Form.Control
          type="text"
          value={isFixed ? fixedValue : value}
          onChange={handleChange}
          isInvalid={!!error || (isRegex && !validateRegex(value))}
          disabled={isFixed}
          className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
        />
      )}
      {!isPassword && (
        <Form.Control.Feedback type="invalid">
          {error || (isRegex && !validateRegex(value) ? regexErrorMessage : '')}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export const SelectCustomField: React.FC<SelectCustomProps> = ({
  label,
  value,
  options: initialOptions,
  onChange,
  error,
  required = false,
  placeholder = 'Select an option...',
  apiEndpoint
}) => {
  const [options, setOptions] = useState<SelectOption[]>(initialOptions);
  const [isLoading, setIsLoading] = useState(false);
  const selectRef = useRef<any>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      if (!apiEndpoint) return;
      
      setIsLoading(true);
      try {
        const data = await apiClient.get(apiEndpoint);
        setOptions(data);
      } catch (error) {
        console.error('Failed to fetch options:', error);
        setOptions(initialOptions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [apiEndpoint, initialOptions]);

  return (
    <Form.Group className="mb-3" ref={selectRef}>
      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      <Select
        value={value}
        options={options}
        onChange={onChange}
        isSearchable={false}
        isClearable={true}
        isLoading={isLoading}
        placeholder={placeholder}
        className={error ? 'is-invalid' : ''}
        classNamePrefix="select"
        menuPlacement="bottom"
        menuPosition="absolute"
        styles={customSelectStylesEducation}
        menuShouldScrollIntoView={false}
        menuShouldBlockScroll={false}
      />
      {error && (
        <div className="invalid-feedback" style={{ display: 'block' }}>
          {error}
        </div>
      )}
    </Form.Group>
  );
};

export const WideFormField: React.FC<WideFormProps> = ({ 
  label, 
  value, 
  onChange 
}) => (
  <Form.Group className="mb-3">
    <Form.Label className="tw-font-semibold tw-text-white tw-mb-2">{label}</Form.Label>
    <Form.Control
      as="textarea"
      rows={3}
      value={value}
      onChange={onChange}
      className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
    />
  </Form.Group>
);

export const SearchMultipleField: React.FC<SearchMultipleProps> = ({ 
  label, 
  value, 
  options: initialOptions, 
  onChange, 
  onInputChange, 
  isLoading: externalLoading = false,
  error,
  required = false,
  apiEndpoint,
  debounceMs = 300
}) => {
  const [options, setOptions] = useState<SelectOption[]>(initialOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);
  const selectRef = useRef<any>(null);

  const handleInputChange = (newValue: string) => {
    setSearchTerm(newValue);
    if (onInputChange) {
      onInputChange(newValue);
    }
  };

  useEffect(() => {
    const searchOptions = async () => {
      if (!apiEndpoint) return;
      
      setIsLoading(true);
      try {
        const endpoint = debouncedSearchTerm 
          ? `${apiEndpoint}?search=${encodeURIComponent(debouncedSearchTerm)}`
          : apiEndpoint;
        
        const data = await apiClient.get(endpoint);
        setOptions(data);
      } catch (error) {
        console.error('Failed to search options:', error);
        setOptions(initialOptions);
      } finally {
        setIsLoading(false);
      }
    };

    if (debouncedSearchTerm !== '' || !apiEndpoint) {
      searchOptions();
    }
  }, [debouncedSearchTerm, apiEndpoint, initialOptions]);

  return (
    <Form.Group className="mb-3" ref={selectRef}>
      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      <Select
        isMulti
        value={value}
        options={options}
        onChange={onChange}
        onInputChange={handleInputChange}
        isLoading={isLoading || externalLoading}
        className={error ? 'is-invalid' : ''}
        placeholder="Type to search..."
        noOptionsMessage={() => "No options found"}
        loadingMessage={() => "Loading..."}
        styles={customSelectStylesEducation}
        menuPlacement="bottom"
        menuPosition="absolute"
        menuShouldScrollIntoView={false}
        menuShouldBlockScroll={false}
      />
      {error && (
        <div className="invalid-feedback" style={{ display: 'block' }}>
          {error}
        </div>
      )}
    </Form.Group>
  );
};

export const YesNoField: React.FC<YesNoProps> = ({ 
  label, 
  checked, 
  onChange 
}) => (
  <Form.Group className="mb-3">
    <Form.Check
      type="checkbox"
      label={label}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="tw-text-white"
    />
  </Form.Group>
);

export const DateRangeField: React.FC<DateRangeProps> = ({ 
    label,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    anytime,
    onAnytimeChange,
    error,
    required = false
  }) => (
    <Form.Group className="mb-3">
      <div className="d-flex align-items-center mb-2">
        <Form.Label className="mb-0 me-3 tw-font-semibold tw-text-white">
          {label} {required && <span className="text-danger">*</span>}
        </Form.Label>
        <Form.Check
          type="checkbox"
          label="Anytime"
          checked={anytime}
          onChange={(e) => onAnytimeChange(e.target.checked)}
          className="tw-text-white"
        />
      </div>
      
      {!anytime && (
        <div className="d-flex flex-column gap-3 w-100">
          <div>
            <Form.Label className="mb-2 tw-text-white">Start Time</Form.Label>
            <InputGroup className="w-100">
              <InputGroup.Text className="tw-bg-white/95 tw-border-0">
                <Calendar size={16} />
              </InputGroup.Text>
              <DatePicker
                selected={startDate}
                onChange={onStartDateChange}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate}
                showTimeSelect
                dateFormat="yyyy-MM-dd HH:mm"
                className={`form-control tw-border-0 tw-bg-white/95 tw-text-gray-800 ${error ? 'is-invalid' : ''}`}
                placeholderText="Start Time"
                popperPlacement="bottom-start"
                popperModifiers={[
                  {
                    name: "preventOverflow",
                    options: {
                      rootBoundary: "viewport",
                      tether: false,
                      altAxis: true
                    }
                  }
                ]}
                popperProps={{
                  positionFixed: true
                }}
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Time"
                style={{ width: '100%' }}
              />
            </InputGroup>
          </div>
          <div>
            <Form.Label className="mb-2 tw-text-white">End Time</Form.Label>
            <InputGroup className="w-100">
              <InputGroup.Text className="tw-bg-white/95 tw-border-0">
                <Calendar size={16} />
              </InputGroup.Text>
              <DatePicker
                selected={endDate}
                onChange={onEndDateChange}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                showTimeSelect
                dateFormat="yyyy-MM-dd HH:mm"
                className={`form-control tw-border-0 tw-bg-white/95 tw-text-gray-800 ${error ? 'is-invalid' : ''}`}
                placeholderText="End Time"
                popperPlacement="bottom-start"
                popperModifiers={[
                  {
                    name: "preventOverflow",
                    options: {
                      rootBoundary: "viewport",
                      tether: false,
                      altAxis: true
                    }
                  }
                ]}
                popperProps={{
                  positionFixed: true
                }}
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Time"
                style={{ width: '100%' }}
              />
            </InputGroup>
          </div>
        </div>
      )}
      {error && (
        <div className="invalid-feedback" style={{ display: 'block' }}>
          {error}
        </div>
      )}
    </Form.Group>
  );

export const buildApiEndpointWithParams = (
  baseEndpoint: string, 
  additionalParams: Record<string, string | number> = {},
  searchParam: string = 'search',
  searchValue: string = ''
): string => {
  try {
    const url = new URL(baseEndpoint, 'http://localhost');
    
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
    
    if (searchValue && searchValue.trim()) {
      url.searchParams.set(searchParam, searchValue.trim());
    }
    
    return url.pathname + url.search;
  } catch (error) {
    console.error('Error building API endpoint:', error);
    return baseEndpoint;
  }
};

export { apiClient };

export default { 
  ShortFormField,
  WideFormField,
  SearchSingleField,
  SearchMultipleField, 
  YesNoField,
  DateRangeField,
  SelectCustomField,
  apiClient
};