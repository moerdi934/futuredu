// components/report/ReportHeader.tsx

import React from 'react';
import { ActionButton, ColumnConfig, ExportConfig } from '../../types/report';
import { ButtonGradient, ActionType } from '../button/ButtonTemplate';
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
  // Map variant ke custom colors untuk ButtonGradient
  const getCustomColors = (variant: ActionButton['variant'] = 'primary') => {
    const colorMap = {
      primary: {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        gradient1: '#8B5CF6',
        gradient2: '#A855F7',
        text: '#FFFFFF'
      },
      secondary: {
        primary: '#6B7280',
        secondary: '#4B5563',
        gradient1: '#6B7280',
        gradient2: '#9CA3AF',
        text: '#FFFFFF'
      },
      success: {
        primary: '#10B981',
        secondary: '#059669',
        gradient1: '#10B981',
        gradient2: '#34D399',
        text: '#FFFFFF'
      },
      warning: {
        primary: '#F59E0B',
        secondary: '#D97706',
        gradient1: '#F59E0B',
        gradient2: '#FBBF24',
        text: '#FFFFFF'
      },
      danger: {
        primary: '#EF4444',
        secondary: '#DC2626',
        gradient1: '#EF4444',
        gradient2: '#F87171',
        text: '#FFFFFF'
      },
      info: {
        primary: '#3B82F6',
        secondary: '#2563EB',
        gradient1: '#3B82F6',
        gradient2: '#60A5FA',
        text: '#FFFFFF'
      }
    };
    return colorMap[variant];
  };

  // Map variant ke action type yang sesuai
  const getActionType = (variant: ActionButton['variant'] = 'primary', label: string): ActionType => {
    // Coba detect dari label dulu
    const labelLower = label.toLowerCase();
    
    // Common action mappings berdasarkan label
    if (labelLower.includes('add') || labelLower.includes('tambah') || labelLower.includes('create') || labelLower.includes('buat')) return 'add';
    if (labelLower.includes('edit') || labelLower.includes('ubah') || labelLower.includes('update')) return 'edit';
    if (labelLower.includes('delete') || labelLower.includes('hapus') || labelLower.includes('remove')) return 'delete';
    if (labelLower.includes('view') || labelLower.includes('lihat') || labelLower.includes('detail')) return 'view';
    if (labelLower.includes('save') || labelLower.includes('simpan')) return 'save';
    if (labelLower.includes('export') || labelLower.includes('ekspor')) return 'export';
    if (labelLower.includes('import') || labelLower.includes('impor')) return 'import';
    if (labelLower.includes('download') || labelLower.includes('unduh')) return 'download';
    if (labelLower.includes('upload') || labelLower.includes('unggah')) return 'upload';
    if (labelLower.includes('refresh') || labelLower.includes('reload') || labelLower.includes('muat ulang')) return 'refresh';
    if (labelLower.includes('search') || labelLower.includes('cari')) return 'search';
    if (labelLower.includes('filter')) return 'filter';
    if (labelLower.includes('print') || labelLower.includes('cetak')) return 'export';
    if (labelLower.includes('settings') || labelLower.includes('pengaturan')) return 'settings';
    if (labelLower.includes('help') || labelLower.includes('bantuan')) return 'custom';
    
    // Fallback berdasarkan variant
    switch (variant) {
      case 'success': return 'save';
      case 'danger': return 'delete';
      case 'warning': return 'edit';
      case 'info': return 'view';
      case 'secondary': return 'settings';
      default: return 'custom';
    }
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
          
          {/* Action Buttons - Using ButtonGradient */}
          {actionButtons.map((button, index) => (
            <div key={index} className="tw-w-full sm:tw-w-auto">
              <ButtonGradient
                action={getActionType(button.variant, button.label)}
                customText={button.label}
                customIcon={button.icon || undefined}
                customColors={getCustomColors(button.variant)}
                onClick={() => button.onClick()}
                disabled={loading}
                size="md"
                className="tw-w-full sm:tw-w-auto tw-min-w-[120px] tw-shadow-md hover:tw-shadow-lg"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Loading Indicator */}
      {loading && (
        <div className="tw-mt-4 tw-flex tw-items-center tw-justify-center tw-gap-2">
          <div className="tw-w-4 tw-h-4 tw-bg-white tw-rounded-full tw-animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="tw-w-4 tw-h-4 tw-bg-white tw-rounded-full tw-animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="tw-w-4 tw-h-4 tw-bg-white tw-rounded-full tw-animate-bounce" style={{ animationDelay: '300ms' }}></div>
          <span className="tw-text-white tw-text-sm tw-ml-2">Memuat data...</span>
        </div>
      )}
    </div>
  );
};

export default ReportHeader;