// components/report/ExportDropdown.tsx

import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { FaFileExcel, FaFilePdf, FaFileCsv, FaDownload } from 'react-icons/fa';
import { ColumnConfig, ExportConfig } from '../../types/report';
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
  if (!config.enabled) return null;

  const filename = config.filename || 'report_data';
  const formats = config.formats || ['excel', 'pdf', 'csv'];

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
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

  return (
    <Dropdown>
      <Dropdown.Toggle 
        as={Button}
        variant="outline-success"
        disabled={loading || data.length === 0}
        className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-border-green-300 tw-text-green-600 hover:tw-bg-green-50 hover:tw-border-green-400 tw-w-full sm:tw-w-auto tw-text-sm sm:tw-text-base tw-px-3 sm:tw-px-4 tw-py-2"
      >
        <FaDownload className="tw-flex-shrink-0" size={14} />
        <span className="tw-truncate">Export Data</span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="tw-border tw-border-gray-200 tw-shadow-lg tw-rounded-lg tw-overflow-hidden tw-w-full tw-min-w-0" style={{ minWidth: '280px' }}>
        <div className="tw-px-3 tw-py-2 tw-bg-gray-50 tw-border-b tw-border-gray-200">
          <small className="tw-text-gray-600 tw-font-medium tw-text-xs">
            Export {data.length} records dalam {visibleColumns.length} kolom
          </small>
        </div>
        
        {formats.map(format => (
          <Dropdown.Item
            key={format}
            onClick={() => handleExport(format)}
            className="tw-flex tw-items-center tw-gap-3 tw-px-3 tw-py-2 hover:tw-bg-gray-50 tw-transition-colors"
          >
            <span className="tw-text-lg tw-flex-shrink-0">{formatIcons[format]}</span>
            <div className="tw-flex tw-flex-col tw-min-w-0">
              <span className="tw-font-medium tw-text-gray-800 tw-text-sm tw-truncate">
                {formatLabels[format]}
              </span>
              <small className="tw-text-gray-500 tw-text-xs tw-truncate">
                {formatDescriptions[format]}
              </small>
            </div>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ExportDropdown;