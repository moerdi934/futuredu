// components/form/FormComponentLayout.tsx 
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Form, InputGroup, Button, Card, Row, Col } from 'react-bootstrap';
import { Calendar } from 'lucide-react';
import Select from "react-select";
import { ChangeEvent } from 'react';
import { SingleValue, MultiValue, ActionMeta } from 'react-select';
import { Eye, EyeOff, Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

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
  icon?: React.ReactNode;
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
  icon?: React.ReactNode;
  placeholder?: string;
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
  icon?: React.ReactNode;
  labelColor?: string;
}

// NEW: Date Field Props
export interface DateFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

// NEW: Number Field Props
export interface NumberFieldProps {
  label: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

// NEW: Boolean Field Props (Radio/Checkbox style)
export interface BooleanFieldProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  error?: string;
  required?: boolean;
  type?: 'radio' | 'select';
  trueLabel?: string;
  falseLabel?: string;
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
    zIndex: 1050,
    marginTop: '4px',
    position: 'absolute',
    width: '100%',
    left: 0,
    top: '100%'
  }),
  menuPortal: (provided: any) => ({
    ...provided,
    zIndex: 9999
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
    zIndex: 50,
    marginTop: '4px',
    position: 'absolute',
    width: '100%',
    left: 0,
    top: '100%'
  }),
  menuPortal: (provided: any) => ({
    ...provided,
    zIndex: 9999
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
  customSearchParam = 'search',
  icon
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

  // Determine which styles to use based on label
  const isLocationField = label && (
    label.toLowerCase().includes('provinsi') || 
    label.toLowerCase().includes('kota') || 
    label.toLowerCase().includes('kecamatan') || 
    label.toLowerCase().includes('kelurahan')
  );

  const selectStyles = isLocationField ? customSelectStyles : customSelectStylesEducation;

  return (
    <Form.Group className="mb-3" ref={selectRef}>
      <Form.Label className="tw-flex tw-items-center tw-gap-2 tw-text-purple-700 tw-font-semibold">
        {icon} {label} {required && <span className="tw-text-red-500">*</span>}
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
          menuPortalTarget={document.body}
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
        menuPortalTarget={document.body}
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
  debounceMs = 300,
  icon,
  placeholder = "Type to search..."
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
      <Form.Label className="tw-flex tw-items-center tw-gap-2 tw-text-purple-700 tw-font-semibold">
        {icon} {label} {required && <span className="tw-text-red-500">*</span>}
      </Form.Label>
      <Select
        isMulti
        value={value}
        options={options}
        onChange={onChange}
        onInputChange={handleInputChange}
        isLoading={isLoading || externalLoading}
        className={error ? 'is-invalid' : ''}
        placeholder={placeholder}
        noOptionsMessage={() => "No options found"}
        loadingMessage={() => "Loading..."}
        styles={customSelectStylesEducation}
        menuPortalTarget={document.body}
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
  required = false,
  icon = <Calendar className="tw-w-5 tw-h-5" />,
  labelColor = "tw-text-purple-700"
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedTime, setSelectedTime] = useState({ hour: 12, minute: 0 });
  const [isSelectingStart, setIsSelectingStart] = useState(true);
  
  const startPickerRef = useRef<HTMLDivElement>(null);
  const endPickerRef = useRef<HTMLDivElement>(null);
  const hourContainerRef = useRef<HTMLDivElement>(null);

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startPickerRef.current && !startPickerRef.current.contains(event.target as Node)) {
        setShowStartPicker(false);
      }
      if (endPickerRef.current && !endPickerRef.current.contains(event.target as Node)) {
        setShowEndPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Pilih tanggal';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDateDisabled = (day: number, isEndDate: boolean): boolean => {
    if (!isEndDate || !startDate) return false;
    
    const testDate = new Date(currentYear, currentMonth, day);
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
    // Allow same date or later dates
    return testDate < startDateOnly;
  };

  const isTimeDisabled = (hour: number, minute: number): boolean => {
    if (!isSelectingStart && startDate && endDate) {
      const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      // If it's the same day
      if (startDay.getTime() === endDay.getTime()) {
        const startHour = startDate.getHours();
        const startMinute = startDate.getMinutes();
        
        // Disable hours before start hour
        if (hour < startHour) return true;
        
        // For the same hour, disable minutes that are equal or before start minute
        if (hour === startHour && minute <= startMinute) return true;
      }
    }
    return false;
  };

  // Check if a date/time is the start date/time (for highlighting)
  const isStartDateTime = (day: number, hour?: number, minute?: number): boolean => {
    if (!startDate) return false;
    
    const dayMatch = startDate.getDate() === day &&
                    startDate.getMonth() === currentMonth &&
                    startDate.getFullYear() === currentYear;
    
    if (hour !== undefined && minute !== undefined) {
      return dayMatch && 
             startDate.getHours() === hour && 
             startDate.getMinutes() === minute;
    }
    
    return dayMatch;
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day, selectedTime.hour, selectedTime.minute);
    
    if (isSelectingStart) {
      onStartDateChange(selectedDate);
      // Don't close the picker, let user select time
    } else {
      if (!isDateDisabled(day, true)) {
        onEndDateChange(selectedDate);
        // Don't close the picker, let user select time
      }
    }
  };

  const handleTimeSelect = (hour: number, minute: number) => {
    if (!isTimeDisabled(hour, minute)) {
      setSelectedTime({ hour, minute });
      
      if (isSelectingStart && startDate) {
        const newDate = new Date(startDate);
        newDate.setHours(hour, minute);
        onStartDateChange(newDate);
      } else if (!isSelectingStart && endDate) {
        const newDate = new Date(endDate);
        newDate.setHours(hour, minute);
        onEndDateChange(newDate);
      }
    }
  };

  const openStartPicker = (e: React.MouseEvent) => {
    e.preventDefault(); 
    setIsSelectingStart(true);
    if (startDate) {
      setCurrentMonth(startDate.getMonth());
      setCurrentYear(startDate.getFullYear());
      setSelectedTime({ hour: startDate.getHours(), minute: startDate.getMinutes() });
    }
    setShowStartPicker(true);
    setShowEndPicker(false);
  };

  const openEndPicker = (e: React.MouseEvent) => {
    e.preventDefault(); 
    setIsSelectingStart(false);
    if (endDate) {
      setCurrentMonth(endDate.getMonth());
      setCurrentYear(endDate.getFullYear());
      setSelectedTime({ hour: endDate.getHours(), minute: endDate.getMinutes() });
    } else if (startDate) {
      setCurrentMonth(startDate.getMonth());
      setCurrentYear(startDate.getFullYear());
      setSelectedTime({ hour: startDate.getHours() + 1, minute: startDate.getMinutes() });
    }
    setShowEndPicker(true);
    setShowStartPicker(false);
  };

  const renderCalendar = (isEndDate: boolean = false) => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="tw-w-10 tw-h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isDisabled = isDateDisabled(day, isEndDate);
      const isSelected = (isEndDate ? endDate : startDate)?.getDate() === day &&
                        (isEndDate ? endDate : startDate)?.getMonth() === currentMonth &&
                        (isEndDate ? endDate : startDate)?.getFullYear() === currentYear;
      const isStartDay = isEndDate && isStartDateTime(day); // Highlight start day in end picker

      let buttonClass = `tw-w-10 tw-h-10 tw-rounded-xl tw-text-sm tw-font-medium tw-transition-all tw-duration-200 tw-relative`;

      if (isSelected) {
        buttonClass += ` tw-bg-gradient-to-br tw-from-purple-500 tw-to-pink-500 tw-text-white tw-shadow-lg tw-scale-110 tw-z-10`;
      } else if (isStartDay) {
        buttonClass += ` tw-bg-gradient-to-br tw-from-blue-300/40 tw-to-cyan-300/40 tw-text-blue-700 tw-border-2 tw-border-blue-400/50 hover:tw-bg-gradient-to-br hover:tw-from-purple-100 hover:tw-to-pink-100 hover:tw-scale-105`;
      } else if (isDisabled) {
        buttonClass += ` tw-text-gray-300 tw-cursor-not-allowed`;
      } else {
        buttonClass += ` tw-text-gray-700 hover:tw-bg-gradient-to-br hover:tw-from-purple-100 hover:tw-to-pink-100 hover:tw-scale-105`;
      }

      days.push(
        <div key={day} className="tw-relative">
          <button
            type="button"
            onClick={() => !isDisabled && handleDateSelect(day)}
            disabled={isDisabled}
            className={buttonClass}
          >
            {day}
            {isStartDay && (
              <div className="tw-absolute -tw-top-1 -tw-right-1 tw-w-3 tw-h-3 tw-bg-blue-500 tw-rounded-full tw-text-xs tw-flex tw-items-center tw-justify-center">
                <div className="tw-w-1 tw-h-1 tw-bg-white tw-rounded-full"></div>
              </div>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="tw-grid tw-grid-cols-7 tw-gap-1 tw-p-2">
        {weekDays.map(day => (
          <div key={day} className="tw-text-center tw-text-xs tw-font-semibold tw-text-purple-600 tw-p-2">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderTimePicker = () => {
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    const allMinutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, ..., 55

    // Get visible hours (4 hours with circular rotation)
    const getVisibleHours = (selectedHour: number) => {
      const hours = [];
      for (let i = -2; i <= 1; i++) {
        let hour = (selectedHour + i + 24) % 24;
        hours.push(hour);
      }
      return hours;
    };

    // Get visible minutes (4 minutes with circular rotation)  
    const getVisibleMinutes = (selectedMinute: number) => {
      const selectedIndex = allMinutes.indexOf(selectedMinute);
      const minutes = [];
      for (let i = -2; i <= 1; i++) {
        let index = (selectedIndex + i + allMinutes.length) % allMinutes.length;
        minutes.push(allMinutes[index]);
      }
      return minutes;
    };

    const visibleHours = getVisibleHours(selectedTime.hour);
    const visibleMinutes = getVisibleMinutes(selectedTime.minute);

    const scrollHourUp = () => {
      const newHour = (selectedTime.hour - 1 + 24) % 24;
      setSelectedTime(prev => ({ ...prev, hour: newHour }));
    };

    const scrollHourDown = () => {
      const newHour = (selectedTime.hour + 1) % 24;
      setSelectedTime(prev => ({ ...prev, hour: newHour }));
    };

    const scrollMinuteUp = () => {
      const currentIndex = allMinutes.indexOf(selectedTime.minute);
      const newIndex = (currentIndex - 1 + allMinutes.length) % allMinutes.length;
      setSelectedTime(prev => ({ ...prev, minute: allMinutes[newIndex] }));
    };

    const scrollMinuteDown = () => {
      const currentIndex = allMinutes.indexOf(selectedTime.minute);
      const newIndex = (currentIndex + 1) % allMinutes.length;
      setSelectedTime(prev => ({ ...prev, minute: allMinutes[newIndex] }));
    };

    // Handle mouse wheel scrolling for hours
    const handleHourWheelScroll = (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        scrollHourUp();
      } else if (e.deltaY > 0) {
        scrollHourDown();
      }
    };

    // Handle mouse wheel scrolling for minutes
    const handleMinuteWheelScroll = (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        scrollMinuteUp();
      } else if (e.deltaY > 0) {
        scrollMinuteDown();
      }
    };

    return (
      <div className="tw-flex tw-gap-4 tw-p-4 tw-border-t tw-border-purple-100">
        <div className="tw-flex-1">
          <div className="tw-text-xs tw-font-semibold tw-text-purple-600 tw-mb-2 tw-text-center">JAM</div>
          
          {/* Hour scroll controls with mouse wheel support */}
          <div className="tw-flex tw-flex-col tw-items-center tw-gap-1">
            <button
              type="button"
              onClick={scrollHourUp}
              className="tw-p-1 tw-text-purple-600 hover:tw-bg-purple-50 tw-rounded"
            >
              ▲
            </button>
            
            <div 
              ref={hourContainerRef}
              className="tw-space-y-1 tw-w-full tw-cursor-pointer"
              onWheel={handleHourWheelScroll}
            >
              {visibleHours.map((hour, index) => {
                const isDisabled = isTimeDisabled(hour, selectedTime.minute);
                const isSelected = selectedTime.hour === hour;
                const isStartTime = !isSelectingStart && endDate && isStartDateTime(
                  endDate.getDate(), 
                  hour, 
                  selectedTime.minute
                );
                
                let buttonClass = `tw-w-full tw-py-2 tw-px-3 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-all tw-relative`;
                
                if (isSelected) {
                  buttonClass += ` tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-text-white tw-shadow-md`;
                } else if (isStartTime) {
                  buttonClass += ` tw-bg-gradient-to-r tw-from-blue-300/40 tw-to-cyan-300/40 tw-text-blue-700 tw-border tw-border-blue-400/50`;
                } else if (isDisabled) {
                  buttonClass += ` tw-text-gray-300 tw-cursor-not-allowed`;
                } else {
                  buttonClass += ` tw-text-gray-700 hover:tw-bg-purple-50`;
                }
                
                return (
                  <div key={`${hour}-${index}`} className="tw-relative">
                    <button
                      type="button"
                      onClick={() => !isDisabled && handleTimeSelect(hour, selectedTime.minute)}
                      disabled={isDisabled}
                      className={buttonClass}
                    >
                      {hour.toString().padStart(2, '0')}
                      {isStartTime && (
                        <div className="tw-absolute -tw-top-1 -tw-right-1 tw-w-2 tw-h-2 tw-bg-blue-500 tw-rounded-full"></div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
            
            <button
              type="button"
              onClick={scrollHourDown}
              className="tw-p-1 tw-text-purple-600 hover:tw-bg-purple-50 tw-rounded"
            >
              ▼
            </button>
          </div>
        </div>
        
        <div className="tw-flex-1">
          <div className="tw-text-xs tw-font-semibold tw-text-purple-600 tw-mb-2 tw-text-center">MENIT</div>
          
          {/* Minute scroll controls with mouse wheel support */}
          <div className="tw-flex tw-flex-col tw-items-center tw-gap-1">
            <button
              type="button"
              onClick={scrollMinuteUp}
              className="tw-p-1 tw-text-purple-600 hover:tw-bg-purple-50 tw-rounded"
            >
              ▲
            </button>
            
            <div 
              className="tw-space-y-1 tw-w-full tw-cursor-pointer"
              onWheel={handleMinuteWheelScroll}
            >
              {visibleMinutes.map((minute, index) => {
                const isDisabled = isTimeDisabled(selectedTime.hour, minute);
                const isSelected = selectedTime.minute === minute;
                const isStartTime = !isSelectingStart && endDate && isStartDateTime(
                  endDate.getDate(), 
                  selectedTime.hour, 
                  minute
                );
                
                let buttonClass = `tw-w-full tw-py-2 tw-px-3 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-all tw-relative`;
                
                if (isSelected) {
                  buttonClass += ` tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-text-white tw-shadow-md`;
                } else if (isStartTime) {
                  buttonClass += ` tw-bg-gradient-to-r tw-from-blue-300/40 tw-to-cyan-300/40 tw-text-blue-700 tw-border tw-border-blue-400/50`;
                } else if (isDisabled) {
                  buttonClass += ` tw-text-gray-300 tw-cursor-not-allowed`;
                } else {
                  buttonClass += ` tw-text-gray-700 hover:tw-bg-purple-50`;
                }
                
                return (
                  <div key={`${minute}-${index}`} className="tw-relative">
                    <button
                      type="button"
                      onClick={() => !isDisabled && handleTimeSelect(selectedTime.hour, minute)}
                      disabled={isDisabled}
                      className={buttonClass}
                    >
                      {minute.toString().padStart(2, '0')}
                      {isStartTime && (
                        <div className="tw-absolute -tw-top-1 -tw-right-1 tw-w-2 tw-h-2 tw-bg-blue-500 tw-rounded-full"></div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
            
            <button
              type="button"
              onClick={scrollMinuteDown}
              className="tw-p-1 tw-text-purple-600 hover:tw-bg-purple-50 tw-rounded"
            >
              ▼
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Picker = ({ show, pickerRef, isEndDate = false }: { 
    show: boolean; 
    pickerRef: React.RefObject<HTMLDivElement>; 
    isEndDate?: boolean; 
  }) => {
    if (!show) return null;

    return (
      <div 
        ref={pickerRef}
        className="tw-absolute tw-top-full tw-left-0 tw-right-0 tw-mt-2 tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-border-2 tw-border-purple-200 tw-z-50 tw-overflow-hidden"
      >
        {/* Header */}
        <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-p-4 tw-text-white">
          <div className="tw-flex tw-items-center tw-justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setCurrentMonth(currentMonth === 0 ? 11 : currentMonth - 1);
                if (currentMonth === 0) setCurrentYear(currentYear - 1);
              }}
              className="tw-p-2 tw-rounded-xl hover:tw-bg-white/20 tw-transition-colors"
            >
              <ChevronLeft className="tw-w-5 tw-h-5" />
            </button>
            
            <div className="tw-flex tw-gap-2">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                className="tw-bg-white/20 tw-text-white tw-rounded-lg tw-px-3 tw-py-1 tw-text-sm tw-font-semibold"
              >
                {months.map((month, index) => (
                  <option key={month} value={index} className="tw-text-gray-800">
                    {month}
                  </option>
                ))}
              </select>
              
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="tw-bg-white/20 tw-text-white tw-rounded-lg tw-px-3 tw-py-1 tw-text-sm tw-font-semibold"
              >
                {Array.from({ length: 20 }, (_, i) => currentYear - 10 + i).map(year => (
                  <option key={year} value={year} className="tw-text-gray-800">
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setCurrentMonth(currentMonth === 11 ? 0 : currentMonth + 1);
                if (currentMonth === 11) setCurrentYear(currentYear + 1);
              }}
              className="tw-p-2 tw-rounded-xl hover:tw-bg-white/20 tw-transition-colors"
            >
              <ChevronRight className="tw-w-5 tw-h-5" />
            </button>
          </div>
          
          {/* Close button */}
          <div className="tw-flex tw-justify-end tw-mt-2">
            <button
              type="button"
              onClick={() => {
                if (isSelectingStart) {
                  setShowStartPicker(false);
                } else {
                  setShowEndPicker(false);
                }
              }}
              className="tw-px-4 tw-py-2 tw-bg-white/20 tw-text-white tw-rounded-lg tw-text-sm tw-font-medium hover:tw-bg-white/30 tw-transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>

        {renderCalendar(isEndDate)}
        {renderTimePicker()}
      </div>
    );
  };

  return (
    <div className="tw-space-y-4">
      {/* Header */}
      <div className="tw-bg-gradient-to-r tw-from-purple-100 tw-via-pink-50 tw-to-indigo-100 tw-rounded-2xl tw-p-6 tw-border-2 tw-border-purple-200">
        <div className="tw-flex tw-items-center tw-justify-between tw-flex-wrap tw-gap-4">
          <div className="tw-flex tw-items-center tw-gap-4">
            <div className="tw-bg-gradient-to-br tw-from-purple-500 tw-to-pink-500 tw-p-3 tw-rounded-xl tw-shadow-lg">
              {icon}
            </div>
            <div>
              <h3 className={`tw-font-bold tw-text-xl tw-mb-1 ${labelColor}`}>
                {label} {required && <span className="tw-text-red-500">*</span>}
              </h3>
              <p className="tw-text-sm tw-text-purple-600">
                {startDate && endDate ? 
                  `${formatDate(startDate)} - ${formatDate(endDate)}` : 
                  'Belum ada waktu dipilih'
                }
              </p>
            </div>
          </div>
          
          {/* Toggle Switch */}
          <label className="tw-flex tw-items-center tw-gap-3 tw-cursor-pointer tw-group">
            <span className="tw-font-semibold tw-text-purple-700 tw-group-hover:tw-text-purple-800 tw-transition-colors">
              Kapan Saja
            </span>
            <div className={`
              tw-relative tw-w-14 tw-h-7 tw-rounded-full tw-transition-all tw-duration-300
              ${anytime 
                ? 'tw-bg-gradient-to-r tw-from-green-400 tw-to-emerald-500 tw-shadow-lg' 
                : 'tw-bg-gray-300'
              }
            `}>
              <input
                type="checkbox"
                checked={anytime}
                onChange={(e) => onAnytimeChange(e.target.checked)}
                className="tw-sr-only"
              />
              <div className={`
                tw-absolute tw-w-5 tw-h-5 tw-bg-white tw-rounded-full tw-shadow-md tw-transform tw-transition-transform tw-duration-300 tw-top-1
                ${anytime ? 'tw-translate-x-7' : 'tw-translate-x-1'}
              `}>
                {anytime && (
                  <CheckCircle className="tw-w-3 tw-h-3 tw-text-green-500 tw-absolute tw-top-1 tw-left-1" />
                )}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Date Inputs */}
      {!anytime && (
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
          {/* Start Date */}
          <div className="tw-relative" ref={startPickerRef}>
            <label className="tw-block tw-text-purple-700 tw-font-semibold tw-mb-2 tw-text-sm tw-uppercase tw-tracking-wide">
              Waktu Mulai
            </label>
            <button
              type="button"
              onClick={openStartPicker}
              className="tw-w-full tw-p-4 tw-bg-white tw-rounded-xl tw-border-2 tw-border-purple-200 hover:tw-border-purple-400 tw-transition-all tw-duration-200 tw-text-left tw-group hover:tw-shadow-lg"
            >
              <div className="tw-flex tw-items-center tw-gap-3">
                <Calendar className="tw-w-5 tw-h-5 tw-text-purple-500 tw-group-hover:tw-text-purple-700 tw-transition-colors" />
                <span className={startDate ? 'tw-text-gray-800 tw-font-medium' : 'tw-text-gray-400'}>
                  {formatDate(startDate)}
                </span>
              </div>
            </button>
            
            <Picker show={showStartPicker} pickerRef={startPickerRef} />
          </div>

          {/* End Date */}
          <div className="tw-relative" ref={endPickerRef}>
            <label className="tw-block tw-text-purple-700 tw-font-semibold tw-mb-2 tw-text-sm tw-uppercase tw-tracking-wide">
              Waktu Selesai
            </label>
            <button
              type="button"
              onClick={openEndPicker}
              className="tw-w-full tw-p-4 tw-bg-white tw-rounded-xl tw-border-2 tw-border-purple-200 hover:tw-border-purple-400 tw-transition-all tw-duration-200 tw-text-left tw-group hover:tw-shadow-lg"
            >
              <div className="tw-flex tw-items-center tw-gap-3">
                <Clock className="tw-w-5 tw-h-5 tw-text-purple-500 tw-group-hover:tw-text-purple-700 tw-transition-colors" />
                <span className={endDate ? 'tw-text-gray-800 tw-font-medium' : 'tw-text-gray-400'}>
                  {formatDate(endDate)}
                </span>
              </div>
            </button>
            
            <Picker show={showEndPicker} pickerRef={endPickerRef} isEndDate />
          </div>
        </div>
      )}

      {/* Quick Presets */}
      {!anytime && (
        <div className="tw-bg-white tw-rounded-xl tw-border-2 tw-border-purple-100 tw-p-4">
          <h4 className="tw-text-sm tw-font-bold tw-text-purple-700 tw-mb-3 tw-uppercase tw-tracking-wide">
            Quick Presets
          </h4>
          <div className="tw-grid tw-grid-cols-2 sm:tw-grid-cols-4 tw-gap-3">
            {[
              { label: '1 Jam', minutes: 60 },
              { label: '2 Jam', minutes: 120 },
              { label: '1 Hari', minutes: 1440 },
              { label: '1 Minggu', minutes: 10080 }
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  
                  if (startDate) {
                    // Set end time relative to start time
                    const end = new Date(startDate.getTime() + preset.minutes * 60000);
                    onEndDateChange(end);
                  } else {
                    // If no start date, use current time as start
                    const now = new Date();
                    const end = new Date(now.getTime() + preset.minutes * 60000);
                    onStartDateChange(now);
                    onEndDateChange(end);
                  }
                }}
                className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-p-3 tw-bg-gradient-to-br tw-from-purple-50 tw-to-pink-50 tw-rounded-xl tw-border tw-border-purple-200 hover:tw-from-purple-100 hover:tw-to-pink-100 tw-transition-all tw-duration-200 hover:tw-scale-105 hover:tw-shadow-md tw-group"
              >
                <span className="tw-text-sm tw-font-semibold tw-text-purple-700">
                  {preset.label}
                </span>
                {startDate && (
                  <span className="tw-text-xs tw-text-purple-500">
                    dari start time
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="tw-bg-red-50 tw-border-2 tw-border-red-200 tw-rounded-xl tw-p-4">
          <div className="tw-flex tw-items-center tw-gap-3">
            <div className="tw-w-6 tw-h-6 tw-bg-red-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-flex-shrink-0">
              <span className="tw-text-white tw-text-sm tw-font-bold">!</span>
            </div>
            <span className="tw-text-red-700 tw-font-medium">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// NEW: Date Field Component
export const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder = "Select date"
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value ? new Date(e.target.value) : null;
    onChange(dateValue);
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      <InputGroup>
        <InputGroup.Text className="tw-bg-white/95 tw-border-0 tw-rounded-l-xl">
          <Calendar size={16} />
        </InputGroup.Text>
        <Form.Control
          type="date"
          value={formatDateForInput(value)}
          onChange={handleChange}
          isInvalid={!!error}
          className="tw-border-0 tw-rounded-r-xl tw-bg-white/95 tw-text-gray-800"
          placeholder={placeholder}
        />
      </InputGroup>
      {error && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

// NEW: Number Field Component
export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  min,
  max,
  step = 1
}) => (
  <Form.Group className="mb-3">
    <Form.Label className="tw-font-semibold tw-text-white tw-mb-2">
      {label} {required && <span className="text-danger">*</span>}
    </Form.Label>
    <Form.Control
      type="number"
      value={value}
      onChange={onChange}
      isInvalid={!!error}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
    />
    {error && (
      <Form.Control.Feedback type="invalid">
        {error}
      </Form.Control.Feedback>
    )}
  </Form.Group>
);

// NEW: Boolean Field Component (Radio/Select style)
export const BooleanField: React.FC<BooleanFieldProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  type = 'select',
  trueLabel = 'Ya',
  falseLabel = 'Tidak'
}) => {
  if (type === 'radio') {
    return (
      <Form.Group className="mb-3">
        <Form.Label className="tw-font-semibold tw-text-white tw-mb-2">
          {label} {required && <span className="text-danger">*</span>}
        </Form.Label>
        <div className="tw-flex tw-gap-4">
          <Form.Check
            type="radio"
            id={`${label}-true`}
            name={label}
            label={trueLabel}
            checked={value === true}
            onChange={() => onChange(true)}
            className="tw-text-white"
          />
          <Form.Check
            type="radio"
            id={`${label}-false`}
            name={label}
            label={falseLabel}
            checked={value === false}
            onChange={() => onChange(false)}
            className="tw-text-white"
          />
        </div>
        {error && (
          <div className="invalid-feedback" style={{ display: 'block' }}>
            {error}
          </div>
        )}
      </Form.Group>
    );
  }

  // Select style
  return (
    <Form.Group className="mb-3">
      <Form.Label className="tw-font-semibold tw-text-white tw-mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      <Form.Select
        value={value === null ? '' : value.toString()}
        onChange={(e) => {
          const val = e.target.value;
          if (val === '') onChange(null);
          else onChange(val === 'true');
        }}
        isInvalid={!!error}
        className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
      >
        <option value="">Pilih {label}</option>
        <option value="true">{trueLabel}</option>
        <option value="false">{falseLabel}</option>
      </Form.Select>
      {error && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

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
  DateField,
  NumberField,
  BooleanField,
  SelectCustomField,
  apiClient
};