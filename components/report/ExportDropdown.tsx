// components/report/ExportDropdown.tsx

import React, { useState, useRef, useEffect } from 'react';
import { FaFileExcel, FaFilePdf, FaFileCsv, FaDownload, FaChevronDown } from 'react-icons/fa';
import { ColumnConfig, ExportConfig } from '../../types/report';
import { ButtonGradient } from '../button/ButtonTemplate';
import { exportToExcel, exportToPDF, exportToCSV } from '../../utils/exportUtils';

interface ExportDropdownProps {
  data: any[];
  columns: ColumnConfig[];
  visibleColumns: string[];
  config?: ExportConfig;
  loading?: boolean;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({
  data,
  columns,
  visibleColumns,
  config = { enabled: true, formats: ['excel', 'pdf', 'csv'] },
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!config.enabled) return null;

  const filename = config.filename || 'report_data';
  const formats = config.formats || ['excel', 'pdf', 'csv'];

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    setIsOpen(false);
    switch (format) {
      case 'excel':
        exportToExcel(data, columns, visibleColumns, filename);
        break;
      case 'pdf':
        exportToPDF(data, columns, visibleColumns, filename);
        break;
      case 'csv':
        exportToCSV(data, columns, visibleColumns, filename);
        break;
    }
  };

  const formatIcons = {
    excel: <FaFileExcel className="tw-text-green-600" />,
    pdf: <FaFilePdf className="tw-text-red-600" />,
    csv: <FaFileCsv className="tw-text-blue-600" />
  };

  const formatLabels = {
    excel: 'Excel (.xlsx)',
    pdf: 'PDF (.pdf)',
    csv: 'CSV (.csv)'
  };

  const formatDescriptions = {
    excel: 'Format spreadsheet untuk analisis data',
    pdf: 'Format dokumen untuk cetak dan berbagi', 
    csv: 'Format data mentah untuk import'
  };

  // Custom colors untuk export button (success/green theme)
  const exportButtonColors = {
    primary: '#10B981',
    secondary: '#059669',
    gradient1: '#10B981',
    gradient2: '#34D399',
    text: '#FFFFFF'
  };

  return (
    <div className="tw-relative tw-w-full sm:tw-w-auto" ref={dropdownRef}>
      {/* Export Button menggunakan ButtonGradient */}
      <ButtonGradient
        action="export"
        customText="Export Data"
        customIcon={
          <div className="tw-flex tw-items-center tw-gap-1">
            <FaDownload className="tw-w-4 tw-h-4" />
            <FaChevronDown className={`tw-w-3 tw-h-3 tw-transition-transform tw-duration-200 ${
              isOpen ? 'tw-rotate-180' : ''
            }`} />
          </div>
        }
        customColors={exportButtonColors}
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || data.length === 0}
        size="md"
        className="tw-w-full sm:tw-w-auto tw-min-w-[140px] tw-justify-between tw-shadow-md hover:tw-shadow-lg"
      />

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className="tw-absolute tw-top-full tw-left-0 tw-right-0 sm:tw-right-auto sm:tw-w-80 tw-mt-2 tw-bg-white tw-border tw-border-gray-200 tw-shadow-xl tw-rounded-lg tw-overflow-hidden tw-z-50">
          {/* Header */}
          <div className="tw-px-4 tw-py-3 tw-bg-gradient-to-r tw-from-gray-50 tw-to-gray-100 tw-border-b tw-border-gray-200">
            <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-medium tw-text-gray-700">
              <FaDownload className="tw-text-green-600" />
              <span>Export {data.length} records</span>
            </div>
            <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
              {visibleColumns.length} kolom akan diexport
            </p>
          </div>
          
          {/* Export Format Options */}
          <div className="tw-py-2">
            {formats.map((format, index) => {
              // Colors untuk setiap format
              const formatColors = {
                excel: {
                  primary: '#10B981',
                  secondary: '#059669',
                  gradient1: '#F0FDF4',
                  gradient2: '#DCFCE7',
                  text: '#059669'
                },
                pdf: {
                  primary: '#EF4444',
                  secondary: '#DC2626',
                  gradient1: '#FEF2F2',
                  gradient2: '#FEE2E2',
                  text: '#DC2626'
                },
                csv: {
                  primary: '#3B82F6',
                  secondary: '#2563EB',
                  gradient1: '#EFF6FF',
                  gradient2: '#DBEAFE',
                  text: '#2563EB'
                }
              };

              return (
                <div key={format} className="tw-px-2">
                  <ButtonGradient
                    action="download"
                    customText={
                      <div className="tw-flex tw-items-center tw-justify-between tw-w-full">
                        <div className="tw-flex tw-items-center tw-gap-3">
                          <span className="tw-text-lg tw-flex-shrink-0">
                            {formatIcons[format]}
                          </span>
                          <div className="tw-flex tw-flex-col tw-items-start tw-text-left">
                            <span className="tw-font-medium tw-text-sm">
                              {formatLabels[format]}
                            </span>
                            <span className="tw-text-xs tw-opacity-75">
                              {formatDescriptions[format]}
                            </span>
                          </div>
                        </div>
                      </div>
                    }
                    customColors={formatColors[format]}
                    onClick={() => handleExport(format)}
                    size="md"
                    className="tw-w-full tw-justify-start tw-mb-1 tw-py-3 tw-text-left"
                  />
                </div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="tw-px-4 tw-py-2 tw-bg-gray-50 tw-border-t tw-border-gray-100">
            <p className="tw-text-xs tw-text-gray-500 tw-text-center">
              Klik salah satu format untuk mulai download
            </p>
          </div>
        </div>
      )}

      {/* Backdrop untuk mobile */}
      {isOpen && (
        <div 
          className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-25 tw-z-40 sm:tw-hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ExportDropdown;