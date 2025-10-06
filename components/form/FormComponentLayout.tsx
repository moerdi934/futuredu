// components/form/FormComponentLayout.tsx 
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Form, InputGroup, Card, Row, Col } from 'react-bootstrap';
import { Calendar } from 'lucide-react';
import Select from "react-select";
import { ChangeEvent } from 'react';
import { SingleValue, MultiValue, ActionMeta } from 'react-select';
import { Eye, EyeOff, Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { ButtonGradient, ActionType } from '../button/ButtonTemplate';

// Import the safe API client
import { apiClient } from '../../lib/api/client';

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
  onClear?: () => void;
  onApply?: () => void;
  loading?: boolean;
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
  onSave?: () => void;
  onClear?: () => void;
  loading?: boolean;
}

export interface WideFormProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSave?: () => void;
  onClear?: () => void;
  loading?: boolean;
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
  onRefresh?: () => void;
  onClear?: () => void;
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
  onRefresh?: () => void;
  onClear?: () => void;
  onApply?: () => void;
}

export interface YesNoProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ReactNode;
  color?: string;
  selectedColor?: string;
  yesText?: string;
  noText?: string;
  variant?: 'card' | 'checkbox';
  description?: string;
  onApply?: () => void;
  onReset?: () => void;
  loading?: boolean;
}

export interface OptionCardProps {
  label: string;
  selectedValue: string | number;
  options: Array<{
    value: string | number;
    label: string;
    description?: string;
  }>;
  onChange: (value: string | number) => void;
  icon?: React.ReactNode;
  color?: string;
  selectedColor?: string;
  variant?: 'horizontal' | 'vertical';
  description?: string;
  error?: string;
  required?: boolean;
  onApply?: () => void;
  onReset?: () => void;
  loading?: boolean;
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
  onApply?: () => void;
  onReset?: () => void;
  loading?: boolean;
}

export interface DateFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  onSave?: () => void;
  onClear?: () => void;
  loading?: boolean;
}

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
  onSave?: () => void;
  onClear?: () => void;
  loading?: boolean;
}

export interface BooleanFieldProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  error?: string;
  required?: boolean;
  type?: 'radio' | 'select';
  trueLabel?: string;
  falseLabel?: string;
  onApply?: () => void;
  onReset?: () => void;
  loading?: boolean;
}

export interface EnhancedSearchSingleProps extends SearchSingleProps {
  preserveExistingParams?: boolean;
  customSearchParam?: string;
  transformResponse?: (response: any) => SelectOption[];s
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

// SSR Safe function to check if we're in browser
const isBrowser = () => typeof window !== 'undefined';

// Custom styling untuk react-select dengan z-index yang dapat dikonfigurasi
const getCustomSelectStyles = (zIndexLevel: 'high' | 'medium' | 'low' = 'medium') => {
  const zIndexMap = {
    high: 99999,
    medium: 9999,
    low: 999
  };

  const zIndex = zIndexMap[zIndexLevel];

  return {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(4px)',
      border: state.isFocused ? '2px solid #667eea' : '2px solid transparent',
      borderRadius: '12px',
      padding: '8px 12px',
      color: '#374151',
      boxShadow: state.isFocused 
        ? '0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      zIndex: state.isFocused ? 10 : 1,
      transition: 'all 0.15s ease',
      minHeight: '48px',
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
      fontWeight: '400',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#374151',
      fontWeight: '500',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#EDE9FE',
      borderRadius: '8px',
      border: '1px solid #C4B5FD',
      margin: '2px',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#5B21B6',
      fontWeight: '500',
      fontSize: '14px',
      padding: '4px 8px',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#7C3AED',
      borderRadius: '0 6px 6px 0',
      '&:hover': {
        backgroundColor: '#C4B5FD',
        color: '#5B21B6',
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#ffffff',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      borderRadius: '12px',
      border: '2px solid #E5E7EB',
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: '4px',
      zIndex: zIndex,
      width: '100%',
      transform: 'none',
      isolation: 'isolate'
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: zIndex
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: '8px',
      maxHeight: '220px',
      overflowY: 'auto',
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#c1c1c1',
        borderRadius: '3px',
        '&:hover': {
          background: '#a8a8a8',
        },
      },
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
      padding: '12px 16px',
      cursor: 'pointer',
      fontWeight: state.isSelected ? '600' : '400',
      transition: 'all 0.15s ease',
      '&:hover': {
        backgroundColor: state.isSelected ? '#5a67d8' : '#F3F4F6',
        transform: 'translateX(2px)',
      },
      '&:active': {
        transform: 'translateX(1px)',
      }
    }),
    noOptionsMessage: (provided: any) => ({
      ...provided,
      color: '#6B7280',
      padding: '12px 16px',
      fontStyle: 'italic',
    }),
    loadingMessage: (provided: any) => ({
      ...provided,
      color: '#6B7280',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: '#D1D5DB',
      width: '2px',
    }),
    dropdownIndicator: (provided: any, state: any) => ({
      ...provided,
      color: state.isFocused ? '#667eea' : '#9CA3AF',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.15s ease, color 0.15s ease',
      padding: '8px',
      '&:hover': {
        color: '#667eea',
      }
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      color: '#9CA3AF',
      padding: '8px',
      '&:hover': {
        color: '#EF4444',
      }
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: '0 8px',
    }),
  };
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
  transformResponse,
  icon,
  onRefresh,
  onClear
}) => {
  const [options, setOptions] = useState<SelectOption[]>(initialOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);
  const selectRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInputChange = (newValue: string) => {
    setSearchTerm(newValue);
    if (onInputChange) {
      onInputChange(newValue);
    }
  };

  const handleMenuOpen = () => setIsMenuOpen(true);
  const handleMenuClose = () => setIsMenuOpen(false);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      setSearchTerm('');
      if (apiEndpoint) {
        fetchOptions('');
      }
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange(null, { action: 'clear', removedValue: value, option: null });
      setSearchTerm('');
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

 const fetchOptions = async (searchValue: string) => {
    if (!apiEndpoint) return;
    
    setIsLoading(true);
    try {
      const endpoint = buildApiEndpoint(apiEndpoint, searchValue);
      const response = await apiClient.get(endpoint);
      
      // Gunakan transformResponse jika ada, otherwise handle nested data
      let optionsData;
      if (transformResponse) {
        optionsData = transformResponse(response);
      } else {
        // Default transformation untuk nested response
        optionsData = response?.data || response?.items || response?.results || response;
      }
      
      setOptions(Array.isArray(optionsData) ? optionsData : []);
    } catch (error) {
      console.error('Failed to search options:', error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (debouncedSearchTerm !== '' || !apiEndpoint) {
      fetchOptions(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, apiEndpoint, initialOptions, preserveExistingParams, customSearchParam]);

  const validatedOptions = options.map(option => ({
    ...option,
    label: String(option.label || ''),
    value: option.value
  }));

  // Determine z-index level based on label content
  const isLocationField = label && (
    label.toLowerCase().includes('provinsi') || 
    label.toLowerCase().includes('kota') || 
    label.toLowerCase().includes('kecamatan') || 
    label.toLowerCase().includes('kelurahan')
  );

  const zIndexLevel = isLocationField ? 'high' : 'medium';

  if (!isMounted) {
    return null;
  }

  return (
    <Form.Group className="mb-3" ref={selectRef}>
      <Form.Label className="tw-flex tw-items-center tw-gap-2 tw-text-purple-700 tw-font-semibold tw-mb-2">
        {icon} {label} {required && <span className="tw-text-red-500">*</span>}
      </Form.Label>
      
      <div className="tw-flex tw-gap-2 tw-mb-2">
        {onRefresh && (
          <ButtonGradient
            action="refresh"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || externalLoading}
          />
        )}
        {onClear && (
          <ButtonGradient
            action="clear"
            size="sm"
            onClick={handleClear}
            disabled={isLoading || externalLoading}
          />
        )}
      </div>
      
      <div style={{ position: 'relative', zIndex: isMenuOpen ? 9999 : 1, isolation: 'isolate' }}>
        <Select
          value={value}
          options={validatedOptions}
          onChange={onChange}
          onInputChange={handleInputChange}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
          isLoading={isLoading || externalLoading}
          isClearable
          isSearchable
          className={error ? 'is-invalid' : ''}
          styles={getCustomSelectStyles(zIndexLevel)}
          placeholder="Type to search..."
          noOptionsMessage={() => "No options found"}
          loadingMessage={() => "Loading..."}
          menuPortalTarget={null}
          menuShouldScrollIntoView={false}
          menuShouldBlockScroll={false}
          menuPlacement="bottom"
          menuPosition="absolute"
          closeMenuOnScroll={true}
          filterOption={(option, inputValue) => {
            if (!inputValue) return true;
            const searchValue = String(inputValue || '').toLowerCase();
            const label = String(option.label || '').toLowerCase();
            return label.includes(searchValue);
          }}
          components={{
            LoadingMessage: ({ children, ...props }) => (
              <div {...props.innerProps} style={props.getStyles('loadingMessage', props)}>
                <div className="tw-inline-block tw-w-4 tw-h-4 tw-border-2 tw-border-purple-200 tw-border-t-purple-600 tw-rounded-full tw-animate-spin"></div>
                {children}
              </div>
            ),
            NoOptionsMessage: ({ children, ...props }) => (
              <div {...props.innerProps} style={props.getStyles('noOptionsMessage', props)}>
                <span className="tw-text-gray-500">{children}</span>
              </div>
            ),
          }}
        />
        {isMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
              backgroundColor: 'transparent',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
      {error && (
        <div className="invalid-feedback" style={{ display: 'block', marginTop: '4px' }}>
          <span className="tw-text-red-600 tw-text-sm tw-font-medium">{error}</span>
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
  isPassword = false,
  onSave,
  onClear,
  loading = false
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

  const handleSave = () => {
    if (onSave) onSave();
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      const fakeEvent = {
        target: { value: '' }
      } as ChangeEvent<HTMLInputElement>;
      onChange(fakeEvent);
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label className="tw-font-semibold tw-text-purple-700 tw-mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      
      <div className="tw-flex tw-gap-2 tw-mb-2">
        {onSave && (
          <ButtonGradient
            action="save"
            size="sm"
            onClick={handleSave}
            disabled={loading || isFixed}
            loading={loading}
          />
        )}
        {onClear && (
          <ButtonGradient
            action="clear"
            size="sm"
            onClick={handleClear}
            disabled={loading || isFixed}
          />
        )}
      </div>

      {isPassword ? (
        <InputGroup>
          <Form.Control
            type={showPassword ? "text" : "password"}
            value={isFixed ? fixedValue : value}
            onChange={handleChange}
            isInvalid={!!error || (isRegex && !validateRegex(value))}
            disabled={isFixed || loading}
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
          disabled={isFixed || loading}
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
  apiEndpoint,
  onClear,
  onApply,
  loading = false
}) => {
  const [options, setOptions] = useState<SelectOption[]>(initialOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const selectRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMenuOpen = () => setIsMenuOpen(true);
  const handleMenuClose = () => setIsMenuOpen(false);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange(null, { action: 'clear', removedValue: value, option: null });
    }
  };

  const handleApply = () => {
    if (onApply) onApply();
  };

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

    if (isMounted) {
      fetchOptions();
    }
  }, [apiEndpoint, initialOptions, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <Form.Group className="mb-3" ref={selectRef}>
      <Form.Label className="tw-font-semibold tw-text-purple-700 tw-mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      
      <div className="tw-flex tw-gap-2 tw-mb-2">
        {onApply && (
          <ButtonGradient
            action="apply"
            size="sm"
            onClick={handleApply}
            disabled={isLoading || loading}
            loading={loading}
          />
        )}
        {onClear && (
          <ButtonGradient
            action="clear"
            size="sm"
            onClick={handleClear}
            disabled={isLoading || loading}
          />
        )}
      </div>

      <div style={{ position: 'relative', zIndex: isMenuOpen ? 9999 : 1, isolation: 'isolate' }}>
        <Select
          value={value}
          options={options}
          onChange={onChange}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
          isSearchable={false}
          isClearable={true}
          isLoading={isLoading || loading}
          placeholder={placeholder}
          className={error ? 'is-invalid' : ''}
          classNamePrefix="select"
          styles={getCustomSelectStyles('medium')}
          menuPortalTarget={null}
          menuShouldScrollIntoView={false}
          menuShouldBlockScroll={false}
          menuPlacement="bottom"
          menuPosition="absolute"
          closeMenuOnScroll={true}
          components={{
            LoadingMessage: ({ children, ...props }) => (
              <div {...props.innerProps} style={props.getStyles('loadingMessage', props)}>
                <div className="tw-inline-block tw-w-4 tw-h-4 tw-border-2 tw-border-purple-200 tw-border-t-purple-600 tw-rounded-full tw-animate-spin"></div>
                <span>{children}</span>
              </div>
            ),
            NoOptionsMessage: ({ children, ...props }) => (
              <div {...props.innerProps} style={props.getStyles('noOptionsMessage', props)}>
                <span className="tw-text-gray-500">{children}</span>
              </div>
            ),
            Option: ({ children, ...props }) => (
              <div {...props.innerProps} style={props.getStyles('option', props)}>
                {props.isSelected && (
                  <div className="tw-w-4 tw-h-4 tw-bg-white tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-3 tw-flex-shrink-0">
                    <div className="tw-w-2 tw-h-2 tw-bg-purple-600 tw-rounded-full"></div>
                  </div>
                )}
                <span className="tw-flex-1 tw-truncate">{children}</span>
              </div>
            ),
            DropdownIndicator: ({ ...props }) => (
              <div {...props.innerProps} style={props.getStyles('dropdownIndicator', props)}>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  className="tw-transition-transform tw-duration-200"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            ),
          }}
        />
        
        {isMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
              backgroundColor: 'transparent',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
      
      {error && (
        <div className="invalid-feedback" style={{ display: 'block', marginTop: '4px' }}>
          <span className="tw-text-red-600 tw-text-sm tw-font-medium">{error}</span>
        </div>
      )}
    </Form.Group>
  );
};

export const WideFormField: React.FC<WideFormProps> = ({ 
  label, 
  value, 
  onChange,
  onSave,
  onClear,
  loading = false
}) => {
  const handleSave = () => {
    if (onSave) onSave();
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      const fakeEvent = {
        target: { value: '' }
      } as ChangeEvent<HTMLTextAreaElement>;
      onChange(fakeEvent);
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label className="tw-font-semibold tw-text-purple-700 tw-mb-2">{label}</Form.Label>
      
      <div className="tw-flex tw-gap-2 tw-mb-2">
        {onSave && (
          <ButtonGradient
            action="save"
            size="sm"
            onClick={handleSave}
            disabled={loading}
            loading={loading}
          />
        )}
        {onClear && (
          <ButtonGradient
            action="clear"
            size="sm"
            onClick={handleClear}
            disabled={loading}
          />
        )}
      </div>

      <Form.Control
        as="textarea"
        rows={3}
        value={value}
        onChange={onChange}
        disabled={loading}
        className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
      />
    </Form.Group>
  );
};

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
  placeholder = "Type to search...",
  onRefresh,
  onClear,
  onApply
}) => {
  const [options, setOptions] = useState<SelectOption[]>(initialOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);
  const selectRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInputChange = (newValue: string) => {
    setSearchTerm(newValue);
    if (onInputChange) {
      onInputChange(newValue);
    }
  };

  const handleMenuOpen = () => setIsMenuOpen(true);
  const handleMenuClose = () => setIsMenuOpen(false);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      setSearchTerm('');
      if (apiEndpoint) {
        fetchOptions('');
      }
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange([], { action: 'clear', removedValues: value, option: null });
      setSearchTerm('');
    }
  };

  const handleApply = () => {
    if (onApply) onApply();
  };

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const buildApiEndpoint = (baseEndpoint: string, searchValue: string): string => {
    if (!baseEndpoint) return '';
    
    try {
      const url = new URL(baseEndpoint, 'http://localhost');
      
      if (searchValue.trim()) {
        url.searchParams.set('search', searchValue.trim());
      }
      
      const selectedIds = value.map(item => String(item.value)).filter(Boolean);
      if (selectedIds.length > 0) {
        url.searchParams.set('selected_ids', selectedIds.join(','));
      }
      
      return url.pathname + url.search;
    } catch (error) {
      console.error('Error building API endpoint:', error);
      const hasParams = baseEndpoint.includes('?');
      const separator = hasParams ? '&' : '?';
      let endpoint = baseEndpoint;
      
      if (searchValue.trim()) {
        endpoint += `${separator}search=${encodeURIComponent(searchValue.trim())}`;
      }
      
      const selectedIds = value.map(item => String(item.value)).filter(Boolean);
      if (selectedIds.length > 0) {
        const nextSeparator = endpoint.includes('?') ? '&' : '?';
        endpoint += `${nextSeparator}selected_ids=${selectedIds.join(',')}`;
      }
      
      return endpoint;
    }
  };

  const fetchOptions = async (searchValue: string) => {
    if (!apiEndpoint) return;
    
    setIsLoading(true);
    try {
      const endpoint = buildApiEndpoint(apiEndpoint, searchValue);
      const data = await apiClient.get(endpoint);
      setOptions(data);
    } catch (error) {
      console.error('Failed to search options:', error);
      setOptions(initialOptions);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) {
      fetchOptions(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, apiEndpoint, initialOptions, value, isMounted]);

  useEffect(() => {
    if (isMounted && apiEndpoint && options.length === 0 && !isLoading && !searchTerm) {
      const initialFetch = async () => {
        setIsLoading(true);
        try {
          const endpoint = buildApiEndpoint(apiEndpoint, '');
          const data = await apiClient.get(endpoint);
          setOptions(data);
        } catch (error) {
          console.error('Failed to fetch initial options:', error);
          setOptions(initialOptions);
        } finally {
          setIsLoading(false);
        }
      };
      
      initialFetch();
    }
  }, [apiEndpoint, options.length, isLoading, searchTerm, initialOptions, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <Form.Group className="mb-3" ref={selectRef}>
      <Form.Label className="tw-flex tw-items-center tw-gap-2 tw-text-purple-700 tw-font-semibold tw-mb-2">
        {icon} {label} {required && <span className="tw-text-red-500">*</span>}
      </Form.Label>
      
      <div className="tw-flex tw-gap-2 tw-mb-2">
        {onRefresh && (
          <ButtonGradient
            action="refresh"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || externalLoading}
          />
        )}
        {onClear && (
          <ButtonGradient
            action="clear"
            size="sm"
            onClick={handleClear}
            disabled={isLoading || externalLoading}
          />
        )}
        {onApply && (
          <ButtonGradient
            action="apply"
            size="sm"
            onClick={handleApply}
            disabled={isLoading || externalLoading}
            customText={`Apply (${value.length})`}
          />
        )}
      </div>

      <div style={{ position: 'relative', zIndex: isMenuOpen ? 9999 : 1, isolation: 'isolate' }}>
        <Select
          isMulti
          value={value}
          options={options}
          onChange={onChange}
          onInputChange={handleInputChange}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
          isLoading={isLoading || externalLoading}
          className={error ? 'is-invalid' : ''}
          placeholder={placeholder}
          noOptionsMessage={() => "No options found"}
          loadingMessage={() => "Loading..."}
          styles={getCustomSelectStyles('medium')}
          menuPortalTarget={null}
          menuShouldScrollIntoView={false}
          menuShouldBlockScroll={false}
          menuPlacement="bottom"
          menuPosition="absolute"
          closeMenuOnScroll={true}
          filterOption={(option, inputValue) => {
            if (!inputValue) return true;
            const searchValue = String(inputValue || '').toLowerCase();
            const label = String(option.label || '').toLowerCase();
            return label.includes(searchValue);
          }}
          components={{
            LoadingMessage: ({ children, ...props }) => (
              <div {...props.innerProps} style={props.getStyles('loadingMessage', props)}>
                <div className="tw-inline-block tw-w-4 tw-h-4 tw-border-2 tw-border-purple-200 tw-border-t-purple-600 tw-rounded-full tw-animate-spin"></div>
                {children}
              </div>
            ),
            NoOptionsMessage: ({ children, ...props }) => (
              <div {...props.innerProps} style={props.getStyles('noOptionsMessage', props)}>
                <span className="tw-text-gray-500">{children}</span>
              </div>
            ),
            Option: ({ children, ...props }) => (
              <div {...props.innerProps} style={props.getStyles('option', props)}>
                {props.isSelected && (
                  <div className="tw-w-4 tw-h-4 tw-bg-white tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-2">
                    <div className="tw-w-2 tw-h-2 tw-bg-purple-600 tw-rounded-full"></div>
                  </div>
                )}
                <span className="tw-flex-1">{children}</span>
              </div>
            ),
            MultiValue: ({ children, ...props }) => (
              <div style={props.getStyles('multiValue', props)} className="tw-group">
                <div style={props.getStyles('multiValueLabel', props)}>
                  {children}
                </div>
                <div 
                  {...props.removeProps}
                  style={props.getStyles('multiValueRemove', props)}
                  className="tw-flex tw-items-center tw-justify-center tw-w-6 tw-h-6 tw-cursor-pointer hover:tw-scale-110 tw-transition-transform"
                >
                  ×
                </div>
              </div>
            ),
          }}
        />
        {isMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
              backgroundColor: 'transparent',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
      {error && (
        <div className="invalid-feedback" style={{ display: 'block', marginTop: '4px' }}>
          <span className="tw-text-red-600 tw-text-sm tw-font-medium">{error}</span>
        </div>
      )}
      
      {value.length > 0 && (
        <div className="tw-mt-2 tw-text-sm tw-text-purple-600">
          <span className="tw-font-medium">{value.length}</span> item{value.length > 1 ? 's' : ''} selected
        </div>
      )}
    </Form.Group>
  );
};

export const YesNoField: React.FC<YesNoProps> = ({ 
  label, 
  checked, 
  onChange,
  icon,
  color = 'tw-text-purple-700',
  selectedColor = 'tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-500 tw-text-white',
  yesText = 'Ya',
  noText = 'Tidak',
  variant = 'card',
  description,
  onApply,
  onReset,
  loading = false
}) => {
  const handleApply = () => {
    if (onApply) onApply();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onChange(false);
    }
  };

  if (variant === 'checkbox') {
    return (
      <Form.Group className="mb-3">
        <div className="tw-flex tw-gap-2 tw-mb-2">
          {onApply && (
            <ButtonGradient
              action="apply"
              size="sm"
              onClick={handleApply}
              disabled={loading}
              loading={loading}
            />
          )}
          {onReset && (
            <ButtonGradient
              action="reset"
              size="sm"
              onClick={handleReset}
              disabled={loading}
            />
          )}
        </div>
        <Form.Check
          type="checkbox"
          label={label}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={loading}
          className="tw-text-white"
        />
        {description && (
          <Form.Text className="tw-text-gray-400 tw-text-sm tw-mt-1">
            {description}
          </Form.Text>
        )}
      </Form.Group>
    );
  }

  return (
    <Form.Group className="mb-3">
      <Form.Label className={`tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-gap-2 ${color} tw-text-sm sm:tw-text-base`}>
        {icon} {label}
      </Form.Label>
      {description && (
        <p className="tw-text-gray-600 tw-text-xs sm:tw-text-sm tw-mb-3 tw-break-words">{description}</p>
      )}
      
      <div className="tw-flex tw-gap-2 tw-mb-3">
        {onApply && (
          <ButtonGradient
            action="apply"
            size="sm"
            onClick={handleApply}
            disabled={loading}
            loading={loading}
          />
        )}
        {onReset && (
          <ButtonGradient
            action="reset"
            size="sm"
            onClick={handleReset}
            disabled={loading}
          />
        )}
      </div>

      <Card className="tw-border-2 tw-border-purple-200 tw-rounded-lg tw-shadow-sm hover:tw-shadow-md tw-transition-shadow tw-w-full tw-overflow-hidden">
        <Card.Body className="tw-p-3 sm:tw-p-4">
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-items-start sm:tw-items-center tw-justify-between tw-gap-3 sm:tw-gap-4">
            <div className="tw-flex tw-items-center tw-gap-2 sm:tw-gap-3 tw-min-w-0 tw-flex-1">
              {icon && (
                <div className="tw-bg-purple-100 tw-p-1.5 sm:tw-p-2 tw-rounded-lg tw-flex-shrink-0">
                  {React.cloneElement(icon as React.ReactElement, { 
                    size: 16, 
                    className: "tw-text-purple-600" 
                  })}
                </div>
              )}
              <span className={`tw-font-semibold ${color} tw-text-sm sm:tw-text-base tw-break-words tw-leading-tight`}>
                {label}
              </span>
            </div>
            
            <div className="tw-flex tw-gap-2 tw-w-full sm:tw-w-auto tw-flex-shrink-0">
              <button
                type="button"
                onClick={() => onChange(true)}
                disabled={loading}
                className={`tw-px-3 sm:tw-px-4 tw-py-2 tw-rounded-lg tw-font-medium tw-text-xs sm:tw-text-sm tw-transition-all tw-duration-200 tw-border-2 tw-flex-1 sm:tw-flex-none tw-min-w-0 ${
                  checked
                    ? `${selectedColor} tw-border-green-500 tw-shadow-md tw-scale-105`
                    : `tw-border-purple-300 ${color} hover:tw-bg-purple-50 tw-bg-white`
                } ${loading ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
              >
                <span className="tw-truncate">{yesText}</span>
              </button>
              <button
                type="button"
                onClick={() => onChange(false)}
                disabled={loading}
                className={`tw-px-3 sm:tw-px-4 tw-py-2 tw-rounded-lg tw-font-medium tw-text-xs sm:tw-text-sm tw-transition-all tw-duration-200 tw-border-2 tw-flex-1 sm:tw-flex-none tw-min-w-0 ${
                  !checked
                    ? `${selectedColor} tw-border-green-500 tw-shadow-md tw-scale-105`
                    : `tw-border-purple-300 ${color} hover:tw-bg-purple-50 tw-bg-white`
                } ${loading ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
              >
                <span className="tw-truncate">{noText}</span>
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Form.Group>
  );
};

export const OptionCard: React.FC<OptionCardProps> = ({
  label,
  selectedValue,
  options,
  onChange,
  icon,
  color = 'tw-text-purple-700',
  selectedColor = 'tw-bg-gradient-to-r tw-from-purple-500 tw-to-indigo-500 tw-text-white',
  variant = 'horizontal',
  description,
  error,
  required = false,
  onApply,
  onReset,
  loading = false
}) => {
  const handleApply = () => {
    if (onApply) onApply();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      if (options.length > 0) {
        onChange(options[0].value);
      }
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label className={`tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-gap-2 ${color}`}>
        {icon} {label} {required && <span className="tw-text-red-500">*</span>}
      </Form.Label>
      {description && (
        <p className="tw-text-gray-600 tw-text-sm tw-mb-3">{description}</p>
      )}
      
      <div className="tw-flex tw-gap-2 tw-mb-3">
        {onApply && (
          <ButtonGradient
            action="apply"
            size="sm"
            onClick={handleApply}
            disabled={loading}
            loading={loading}
          />
        )}
        {onReset && (
          <ButtonGradient
            action="reset"
            size="sm"
            onClick={handleReset}
            disabled={loading}
          />
        )}
      </div>
      
      <Card className={`tw-border-2 tw-rounded-lg tw-shadow-sm hover:tw-shadow-md tw-transition-shadow ${
        error ? 'tw-border-red-300' : 'tw-border-purple-200'
      }`}>
        <Card.Body className="tw-p-4">
          <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
            <div className="tw-flex tw-items-center tw-gap-3">
              {icon && (
                <div className={`tw-p-2 tw-rounded-lg ${
                  error ? 'tw-bg-red-100' : 'tw-bg-purple-100'
                }`}>
                  {React.cloneElement(icon as React.ReactElement, { 
                    size: 18, 
                    className: error ? "tw-text-red-600" : "tw-text-purple-600"
                  })}
                </div>
              )}
              <span className={`tw-font-semibold ${error ? 'tw-text-red-700' : color}`}>
                {label}
              </span>
            </div>
          </div>
          
          <div className={`tw-flex tw-gap-3 ${
            variant === 'vertical' ? 'tw-flex-col' : 'tw-flex-row tw-flex-wrap'
          }`}>
            {options.map((option) => {
              const isSelected = selectedValue === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange(option.value)}
                  disabled={loading}
                  className={`tw-px-4 tw-py-3 tw-rounded-lg tw-font-medium tw-text-sm tw-transition-all tw-duration-200 tw-border-2 tw-flex-1 tw-min-w-0 ${
                    isSelected
                      ? `${selectedColor} tw-border-purple-500 tw-shadow-md tw-scale-105`
                      : `tw-border-purple-300 ${color} hover:tw-bg-purple-50 tw-bg-white hover:tw-scale-102`
                  } ${loading ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}`}
                >
                  <div className="tw-text-center">
                    <div className="tw-font-semibold">{option.label}</div>
                    {option.description && (
                      <div className={`tw-text-xs tw-mt-1 tw-opacity-75 ${
                        isSelected ? 'tw-text-white' : 'tw-text-gray-500'
                      }`}>
                        {option.description}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card.Body>
      </Card>
      
      {error && (
        <div className="tw-text-red-600 tw-text-sm tw-mt-2 tw-font-medium">
          {error}
        </div>
      )}
    </Form.Group>
  );
};

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
  labelColor = "tw-text-purple-700",
  onApply,
  onReset,
  loading = false
}) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedTime, setSelectedTime] = useState({ hour: 12, minute: 0 });
  const [isSelectingStart, setIsSelectingStart] = useState(true);
  
  const startPickerRef = useRef<HTMLDivElement>(null);
  const endPickerRef = useRef<HTMLDivElement>(null);

  const handleApply = () => {
    if (onApply) onApply();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onStartDateChange(null);
      onEndDateChange(null);
      onAnytimeChange(true);
    }
  };

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
    
    return testDate < startDateOnly;
  };

  const isTimeDisabled = (hour: number, minute: number): boolean => {
    if (!isSelectingStart && startDate && endDate) {
      const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      if (startDay.getTime() === endDay.getTime()) {
        const startHour = startDate.getHours();
        const startMinute = startDate.getMinutes();
        
        if (hour < startHour) return true;
        if (hour === startHour && minute <= startMinute) return true;
      }
    }
    return false;
  };

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
    } else {
      if (!isDateDisabled(day, true)) {
        onEndDateChange(selectedDate);
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

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="tw-w-10 tw-h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isDisabled = isDateDisabled(day, isEndDate);
      const isSelected = (isEndDate ? endDate : startDate)?.getDate() === day &&
                        (isEndDate ? endDate : startDate)?.getMonth() === currentMonth &&
                        (isEndDate ? endDate : startDate)?.getFullYear() === currentYear;
      const isStartDay = isEndDate && isStartDateTime(day);

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
            disabled={isDisabled || loading}
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
    const allMinutes = Array.from({ length: 12 }, (_, i) => i * 5);

    const getVisibleHours = (selectedHour: number) => {
      const hours = [];
      for (let i = -2; i <= 1; i++) {
        let hour = (selectedHour + i + 24) % 24;
        hours.push(hour);
      }
      return hours;
    };

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

    const handleHourWheelScroll = (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        scrollHourUp();
      } else if (e.deltaY > 0) {
        scrollHourDown();
      }
    };

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
          
          <div className="tw-flex tw-flex-col tw-items-center tw-gap-1">
            <ButtonGradient
              action="custom"
              size="sm"
              customText="▲"
              onClick={scrollHourUp}
              disabled={loading}
              className="tw-min-w-[40px] tw-px-2 tw-py-1"
            />
            
            <div 
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
                      disabled={isDisabled || loading}
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
            
            <ButtonGradient
              action="custom"
              size="sm"
              customText="▼"
              onClick={scrollHourDown}
              disabled={loading}
              className="tw-min-w-[40px] tw-px-2 tw-py-1"
            />
          </div>
        </div>
        
        <div className="tw-flex-1">
          <div className="tw-text-xs tw-font-semibold tw-text-purple-600 tw-mb-2 tw-text-center">MENIT</div>
          
          <div className="tw-flex tw-flex-col tw-items-center tw-gap-1">
            <ButtonGradient
              action="custom"
              size="sm"
              customText="▲"
              onClick={scrollMinuteUp}
              disabled={loading}
              className="tw-min-w-[40px] tw-px-2 tw-py-1"
            />
            
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
                      disabled={isDisabled || loading}
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
            
            <ButtonGradient
              action="custom"
              size="sm"
              customText="▼"
              onClick={scrollMinuteDown}
              disabled={loading}
              className="tw-min-w-[40px] tw-px-2 tw-py-1"
            />
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
        <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-p-4 tw-text-white">
          <div className="tw-flex tw-items-center tw-justify-between">
            <ButtonGradient
              action="back"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                setCurrentMonth(currentMonth === 0 ? 11 : currentMonth - 1);
                if (currentMonth === 0) setCurrentYear(currentYear - 1);
              }}
              disabled={loading}
              className="tw-bg-white/20 hover:tw-bg-white/30"
            />
            
            <div className="tw-flex tw-gap-2">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                disabled={loading}
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
                disabled={loading}
                className="tw-bg-white/20 tw-text-white tw-rounded-lg tw-px-3 tw-py-1 tw-text-sm tw-font-semibold"
              >
                {Array.from({ length: 20 }, (_, i) => currentYear - 10 + i).map(year => (
                  <option key={year} value={year} className="tw-text-gray-800">
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <ButtonGradient
              action="forward"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                setCurrentMonth(currentMonth === 11 ? 0 : currentMonth + 1);
                if (currentMonth === 11) setCurrentYear(currentYear + 1);
              }}
              disabled={loading}
              className="tw-bg-white/20 hover:tw-bg-white/30"
            />
          </div>
          
          <div className="tw-flex tw-justify-end tw-mt-2">
            <ButtonGradient
              action="done"
              size="sm"
              onClick={() => {
                if (isSelectingStart) {
                  setShowStartPicker(false);
                } else {
                  setShowEndPicker(false);
                }
              }}
              disabled={loading}
              className="tw-bg-white/20 hover:tw-bg-white/30"
            />
          </div>
        </div>

        {renderCalendar(isEndDate)}
        {renderTimePicker()}
      </div>
    );
  };

  return (
    <div className="tw-space-y-4">
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
                disabled={loading}
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

      <div className="tw-flex tw-gap-2 tw-mb-4">
        {onApply && (
          <ButtonGradient
            action="apply"
            size="sm"
            onClick={handleApply}
            disabled={loading}
            loading={loading}
          />
        )}
        {onReset && (
          <ButtonGradient
            action="reset"
            size="sm"
            onClick={handleReset}
            disabled={loading}
          />
        )}
      </div>

      {!anytime && (
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
          <div className="tw-relative" ref={startPickerRef}>
            <label className="tw-block tw-text-purple-700 tw-font-semibold tw-mb-2 tw-text-sm tw-uppercase tw-tracking-wide">
              Waktu Mulai
            </label>
            <button
              type="button"
              onClick={openStartPicker}
              disabled={loading}
              className="tw-w-full tw-p-4 tw-bg-white tw-rounded-xl tw-border-2 tw-border-purple-200 hover:tw-border-purple-400 tw-transition-all tw-duration-200 tw-text-left tw-group hover:tw-shadow-lg disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
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

          <div className="tw-relative" ref={endPickerRef}>
            <label className="tw-block tw-text-purple-700 tw-font-semibold tw-mb-2 tw-text-sm tw-uppercase tw-tracking-wide">
              Waktu Selesai
            </label>
            <button
              type="button"
              onClick={openEndPicker}
              disabled={loading}
              className="tw-w-full tw-p-4 tw-bg-white tw-rounded-xl tw-border-2 tw-border-purple-200 hover:tw-border-purple-400 tw-transition-all tw-duration-200 tw-text-left tw-group hover:tw-shadow-lg disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
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
              <ButtonGradient
                key={preset.label}
                action="custom"
                size="sm"
                customText={preset.label}
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault();
                  
                  if (startDate) {
                    const end = new Date(startDate.getTime() + preset.minutes * 60000);
                    onEndDateChange(end);
                  } else {
                    const now = new Date();
                    const end = new Date(now.getTime() + preset.minutes * 60000);
                    onStartDateChange(now);
                    onEndDateChange(end);
                  }
                }}
                className="tw-flex tw-flex-col tw-items-center tw-gap-2"
                customColors={{
                  gradient1: '#F3E8FF',
                  gradient2: '#E9D5FF',
                  text: '#7C3AED',
                  primary: '#A855F7'
                }}
              />
            ))}
          </div>
        </div>
      )}

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

export const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder = "Select date",
  onSave,
  onClear,
  loading = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value ? new Date(e.target.value) : null;
    onChange(dateValue);
  };

  const handleSave = () => {
    if (onSave) onSave();
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange(null);
    }
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label className="tw-font-semibold tw-text-purple-700 tw-mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      
      <div className="tw-flex tw-gap-2 tw-mb-2">
        {onSave && (
          <ButtonGradient
            action="save"
            size="sm"
            onClick={handleSave}
            disabled={loading}
            loading={loading}
          />
        )}
        {onClear && (
          <ButtonGradient
            action="clear"
            size="sm"
            onClick={handleClear}
            disabled={loading}
          />
        )}
      </div>

      <InputGroup>
        <InputGroup.Text className="tw-bg-white/95 tw-border-0 tw-rounded-l-xl">
          <Calendar size={16} />
        </InputGroup.Text>
        <Form.Control
          type="date"
          value={formatDateForInput(value)}
          onChange={handleChange}
          isInvalid={!!error}
          disabled={loading}
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

export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  min,
  max,
  step = 1,
  onSave,
  onClear,
  loading = false
}) => {
  const handleSave = () => {
    if (onSave) onSave();
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      const fakeEvent = {
        target: { value: '' }
      } as ChangeEvent<HTMLInputElement>;
      onChange(fakeEvent);
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label className="tw-font-semibold tw-text-purple-700 tw-mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      
      <div className="tw-flex tw-gap-2 tw-mb-2">
        {onSave && (
          <ButtonGradient
            action="save"
            size="sm"
            onClick={handleSave}
            disabled={loading}
            loading={loading}
          />
        )}
        {onClear && (
          <ButtonGradient
            action="clear"
            size="sm"
            onClick={handleClear}
            disabled={loading}
          />
        )}
      </div>

      <Form.Control
        type="number"
        value={value}
        onChange={onChange}
        isInvalid={!!error}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={loading}
        className="tw-border-0 tw-rounded-xl tw-shadow-sm tw-bg-white/95 tw-backdrop-blur-sm tw-text-gray-800 tw-py-3"
      />
      {error && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export const BooleanField: React.FC<BooleanFieldProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  type = 'select',
  trueLabel = 'Ya',
  falseLabel = 'Tidak',
  onApply,
  onReset,
  loading = false
}) => {
  const handleApply = () => {
    if (onApply) onApply();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onChange(null);
    }
  };

  if (type === 'radio') {
    return (
      <Form.Group className="mb-3">
        <Form.Label className="tw-font-semibold tw-text-purple-700 tw-mb-2">
          {label} {required && <span className="text-danger">*</span>}
        </Form.Label>
        
        <div className="tw-flex tw-gap-2 tw-mb-2">
          {onApply && (
            <ButtonGradient
              action="apply"
              size="sm"
              onClick={handleApply}
              disabled={loading}
              loading={loading}
            />
          )}
          {onReset && (
            <ButtonGradient
              action="reset"
              size="sm"
              onClick={handleReset}
              disabled={loading}
            />
          )}
        </div>

        <div className="tw-flex tw-gap-4">
          <Form.Check
            type="radio"
            id={`${label}-true`}
            name={label}
            label={trueLabel}
            checked={value === true}
            onChange={() => onChange(true)}
            disabled={loading}
            className="tw-text-purple-700"
          />
          <Form.Check
            type="radio"
            id={`${label}-false`}
            name={label}
            label={falseLabel}
            checked={value === false}
            onChange={() => onChange(false)}
            disabled={loading}
            className="tw-text-purple-700"
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

  return (
    <Form.Group className="mb-3">
      <Form.Label className="tw-font-semibold tw-text-purple-700 tw-mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </Form.Label>
      
      <div className="tw-flex tw-gap-2 tw-mb-2">
        {onApply && (
          <ButtonGradient
            action="apply"
            size="sm"
            onClick={handleApply}
            disabled={loading}
            loading={loading}
          />
        )}
        {onReset && (
          <ButtonGradient
            action="reset"
            size="sm"
            onClick={handleReset}
            disabled={loading}
          />
        )}
      </div>

      <Form.Select
        value={value === null ? '' : value.toString()}
        onChange={(e) => {
          const val = e.target.value;
          if (val === '') onChange(null);
          else onChange(val === 'true');
        }}
        isInvalid={!!error}
        disabled={loading}
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

// Utility function for building API endpoints
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

// Export the safe API client
export { apiClient };

// Default export with all components
export default { 
  ShortFormField,
  WideFormField,
  SearchSingleField,
  SearchMultipleField,
  YesNoField,
  OptionCard,
  DateRangeField,
  DateField,
  NumberField,
  BooleanField,
  SelectCustomField,
  buildApiEndpointWithParams,
  apiClient
};