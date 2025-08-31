// components/report/ReportHeader.tsx

import React from 'react';
import { Button } from 'react-bootstrap';
import { ActionButton, ColumnConfig, ExportConfig } from '../../types/report';
import ExportDropdown from './ExportDropdown';

interface ReportHeaderProps {
  title: string;
  actionButtons?: ActionButton[];
  exportConfig?: ExportConfig;
  data?: any[];
  columns?: ColumnConfig[];
  visibleColumns?: string[];
  loading?: boolean;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ 
  title, 
  actionButtons = [], 
  exportConfig,
  data = [],
  columns = [],
  visibleColumns = [],
  loading = false 
}) => {
  const getVariantClass = (variant: ActionButton['variant'] = 'primary') => {
    const variantMap = {
      primary: 'tw-bg-purple-600 tw-border-purple-600 hover:tw-bg-purple-700',
      secondary: 'tw-bg-gray-600 tw-border-gray-600 hover:tw-bg-gray-700',
      success: 'tw-bg-green-600 tw-border-green-600 hover:tw-bg-green-700',
      warning: 'tw-bg-yellow-600 tw-border-yellow-600 hover:tw-bg-yellow-700',
      danger: 'tw-bg-red-600 tw-border-red-600 hover:tw-bg-red-700',
      info: 'tw-bg-blue-600 tw-border-blue-600 hover:tw-bg-blue-700'
    };
    return variantMap[variant];
  };

  return (
    <div className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-purple-800 tw-p-4 sm:tw-p-6 tw-rounded-xl tw-shadow-lg tw-mb-6 tw-mx-2 sm:tw-mx-0">
      <div className="tw-flex tw-flex-col lg:tw-flex-row lg:tw-justify-between lg:tw-items-center tw-gap-4">
        {/* Title Section */}
        <div className="tw-flex-1 tw-min-w-0">
          <h1 className="tw-text-xl sm:tw-text-2xl lg:tw-text-3xl tw-font-bold tw-text-white tw-mb-2 tw-drop-shadow-sm tw-truncate">
            {title}
          </h1>
          <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-gap-2 sm:tw-gap-4">
            <div className="tw-w-16 sm:tw-w-20 tw-h-1 tw-bg-gradient-to-r tw-from-purple-300 tw-to-pink-300 tw-rounded-full"></div>
            <p className="tw-text-purple-100 tw-text-xs sm:tw-text-sm">
              Total {data.length} data • {visibleColumns.length} kolom ditampilkan
            </p>
          </div>
        </div>
        
        {/* Action Buttons Section */}
        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 sm:tw-gap-3 tw-flex-shrink-0">
          {/* Export Dropdown */}
          {exportConfig?.enabled && (
            <div className="tw-w-full sm:tw-w-auto">
              <ExportDropdown
                data={data}
                columns={columns}
                visibleColumns={visibleColumns}
                config={exportConfig}
                loading={loading}
              />
            </div>
          )}
          
          {/* Action Buttons */}
          {actionButtons.map((button, index) => (
            <Button
              key={index}
              onClick={button.onClick}
              disabled={loading}
              className={`tw-text-white tw-border-0 tw-px-3 sm:tw-px-4 tw-py-2 tw-rounded-lg tw-font-medium tw-transition-all tw-duration-200 tw-shadow-md hover:tw-shadow-lg hover:tw-scale-105 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-text-sm sm:tw-text-base tw-w-full sm:tw-w-auto ${getVariantClass(button.variant)}`}
            >
              {button.icon && <span className="tw-text-base sm:tw-text-lg tw-flex-shrink-0">{button.icon}</span>}
              <span className="tw-truncate">{button.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;