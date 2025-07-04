'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Table } from '@tanstack/react-table';
import { Dropdown } from 'react-bootstrap';
import { FaColumns } from 'react-icons/fa';

interface ColumnVisibilityDropdownProps<T> {
  table: Table<T>;
  fixedColumnIds?: string[];
  className?: string;
}

const ColumnVisibilityDropdown = <T,>({ 
  table, 
  fixedColumnIds = [],
  className = ''
}: ColumnVisibilityDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get all leaf columns and filter out fixed columns and already hidden columns
  const leafColumns = table.getAllLeafColumns().filter(
    column => !fixedColumnIds.includes(column.id) && 
             !(column.columnDef.meta?.hidden === true)
  );
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Custom dropdown item that prevents closing
  const CustomItem = ({ column }: { column: any }) => {
    // Get a display name from the header or fall back to column ID
    const headerContent = column.columnDef.header;
    const displayName = typeof headerContent === 'string' ? headerContent : column.id;
    
    return (
      <div 
        className={`tw-px-3 tw-py-2 tw-cursor-pointer tw-transition-colors ${
          column.getIsVisible() ? 'tw-bg-purple-50' : ''
        } tw-hover:bg-purple-100`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); 
          column.toggleVisibility(!column.getIsVisible());
        }}
      >
        <div className="tw-flex tw-items-center">
          <input
            type="checkbox"
            checked={column.getIsVisible()}
            onChange={() => {}}  // Controlled component needs onChange handler
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              column.toggleVisibility(!column.getIsVisible());
            }}
            className="tw-mr-2 tw-cursor-pointer tw-form-checkbox tw-h-4 tw-w-4 tw-text-purple-600 tw-rounded tw-border-gray-300 focus:tw-ring-purple-500"
          />
          <span className="tw-select-none">{displayName}</span>
        </div>
      </div>
    );
  };

  return (
    <div ref={dropdownRef} className={`column-visibility-dropdown-container ${className}`}>
      <Dropdown 
        show={isOpen}
        onToggle={(nextShow) => setIsOpen(nextShow)}
        className="column-visibility-dropdown"
        autoClose={false}
      >
        <Dropdown.Toggle 
          variant="light"
          id="column-visibility-dropdown"
          className="tw-bg-purple-50 tw-text-purple-800 tw-border-purple-200 tw-hover:bg-purple-100 tw-shadow-sm"
        >
          <FaColumns className="tw-mr-2" /> <span className="tw-hidden md:tw-inline">Columns</span>
        </Dropdown.Toggle>

        <Dropdown.Menu className="tw-border-purple-100 tw-shadow-lg tw-p-0 tw-min-w-56">
          <div className="tw-p-2 tw-text-purple-800 tw-font-medium tw-border-b tw-border-purple-100 tw-bg-purple-50">
            Toggle Columns
          </div>
          
          <div className="tw-max-h-64 tw-overflow-y-auto">
            {leafColumns.map(column => (
              <CustomItem key={column.id} column={column} />
            ))}
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default ColumnVisibilityDropdown;