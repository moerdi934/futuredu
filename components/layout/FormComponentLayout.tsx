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
  apiEndpoint?: string; // Optional API endpoint for fetching options
}

export interface FormComponentsProps {
  ShortFormProps: {
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
  WideFormProps: {
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  };

  SearchSingleProps: {
    label: string;
    value: SelectOption | null;
    options: SelectOption[];
    onChange: (newValue: SingleValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => void;
    onInputChange?: (newValue: string) => void;
    isLoading?: boolean;
    error?: string;
    required?: boolean;
    apiEndpoint?: string; // API endpoint for searching
    debounceMs?: number; // Debounce delay for API calls
  };

  SearchMultipleProps: {
    label: string;
    value: SelectOption[];
    options: SelectOption[];
    onChange: (newValue: MultiValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => void;
    onInputChange?: (newValue: string) => void;
    isLoading?: boolean;
    error?: string;
    required?: boolean;
    apiEndpoint?: string; // API endpoint for searching
    debounceMs?: number; // Debounce delay for API calls
  };

  YesNoProps: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  };

  DateRangeProps: {
    label: string;
    startDate: Date | null;
    endDate: Date | null;
    onStartDateChange: (date: Date | null) => void;
    onEndDateChange: (date: Date | null) => void;
    anytime: boolean;
    onAnytimeChange: (checked: boolean) => void;
    error?: string;
    required?: boolean;
  };
}

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

export const ShortFormField: React.FC<FormComponentsProps['ShortFormProps']> = ({ 
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

  // Function to validate regex
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

  // Handle input change with regex validation
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isFixed) return; // No changes allowed if fixed
    
    const newValue = e.target.value;
    onChange(e);
    
    // Validate regex if enabled
    if (isRegex && !validateRegex(newValue)) {
      e.target.setCustomValidity(regexErrorMessage);
    } else {
      e.target.setCustomValidity('');
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>
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
          />
          <InputGroup.Text 
            onClick={togglePasswordVisibility}
            style={{ cursor: 'pointer' }}
            className="bg-white"
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

  // Fetch options from API if endpoint is provided
  useEffect(() => {
    const fetchOptions = async () => {
      if (!apiEndpoint) return;
      
      setIsLoading(true);
      try {
        const data = await apiClient.get(apiEndpoint);
        setOptions(data);
      } catch (error) {
        console.error('Failed to fetch options:', error);
        setOptions(initialOptions); // Fallback to initial options
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [apiEndpoint, initialOptions]);

  return (
    <Form.Group className="mb-3">
      <Form.Label>
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
        menuPlacement="auto"
        menuPosition="fixed"
      />
      {error && (
        <div className="invalid-feedback" style={{ display: 'block' }}>
          {error}
        </div>
      )}
    </Form.Group>
  );
};

export const WideFormField: React.FC<FormComponentsProps['WideFormProps']> = ({ 
  label, 
  value, 
  onChange 
}) => (
  <Form.Group className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control
      as="textarea"
      rows={3}
      value={value}
      onChange={onChange}
    />
  </Form.Group>
);

// Improved SearchSingleField with better debugging
export const SearchSingleField: React.FC<FormComponentsProps['SearchSingleProps']> = ({ 
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

  // Debug log whenever options change
  useEffect(() => {
  }, [options, initialOptions, label]);

  // Handle input change
  const handleInputChange = (newValue: string) => {
    setSearchTerm(newValue);
    if (onInputChange) {
      onInputChange(newValue);
    }
  };

  // Update options when initialOptions change (important for your case)
  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions, label]);

  // Fetch options from API when search term changes
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
        setOptions(initialOptions); // Fallback to initial options
      } finally {
        setIsLoading(false);
      }
    };

    if (debouncedSearchTerm !== '' || !apiEndpoint) {
      searchOptions();
    }
  }, [debouncedSearchTerm, apiEndpoint, initialOptions]);

  // Validasi options untuk memastikan semua label adalah string
  const validatedOptions = options.map(option => ({
    ...option,
    label: String(option.label || ''),
    value: option.value
  }));

  return (
    <Form.Group className="mb-3">
      <Form.Label>
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      <Select
        value={value}
        options={validatedOptions}
        onChange={onChange}
        onInputChange={handleInputChange}
        isLoading={isLoading || externalLoading}
        isClearable
        isSearchable
        className={error ? 'is-invalid' : ''}
        placeholder="Type to search..."
        noOptionsMessage={() => "No options found"}
        loadingMessage={() => "Loading..."}
        // Tambahkan filterOption custom untuk menangani kasus edge
        filterOption={(option, inputValue) => {
          if (!inputValue) return true;
          const searchValue = String(inputValue || '').toLowerCase();
          const label = String(option.label || '').toLowerCase();
          
          return label.includes(searchValue);
        }}
      />
      {error && (
        <div className="invalid-feedback" style={{ display: 'block' }}>
          {error}
        </div>
      )}
    </Form.Group>
  );
};

export const SearchMultipleField: React.FC<FormComponentsProps['SearchMultipleProps']> = ({ 
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

  // Handle input change
  const handleInputChange = (newValue: string) => {
    setSearchTerm(newValue);
    if (onInputChange) {
      onInputChange(newValue);
    }
  };

  // Fetch options from API when search term changes
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
        setOptions(initialOptions); // Fallback to initial options
      } finally {
        setIsLoading(false);
      }
    };

    if (debouncedSearchTerm !== '' || !apiEndpoint) {
      searchOptions();
    }
  }, [debouncedSearchTerm, apiEndpoint, initialOptions]);

  return (
    <Form.Group className="mb-3">
      <Form.Label>
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
      />
      {error && (
        <div className="invalid-feedback" style={{ display: 'block' }}>
          {error}
        </div>
      )}
    </Form.Group>
  );
};

export const YesNoField: React.FC<FormComponentsProps['YesNoProps']> = ({ 
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
    />
  </Form.Group>
);

export const DateRangeField: React.FC<FormComponentsProps['DateRangeProps']> = ({ 
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
        <Form.Label className="mb-0 me-3">
          {label} {required && <span className="text-danger">*</span>}
        </Form.Label>
        <Form.Check
          type="checkbox"
          label="Anytime"
          checked={anytime}
          onChange={(e) => onAnytimeChange(e.target.checked)}
        />
      </div>
      
      {!anytime && (
        <div className="d-flex flex-column gap-3 w-100">
          <div>
            <Form.Label className="mb-2">Start Time</Form.Label>
            <InputGroup className="w-100">
              <InputGroup.Text>
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
                className={`form-control ${error ? 'is-invalid' : ''}`}
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
            <Form.Label className="mb-2">End Time</Form.Label>
            <InputGroup className="w-100">
              <InputGroup.Text>
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
                className={`form-control ${error ? 'is-invalid' : ''}`}
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

// Export API client for use in other components
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