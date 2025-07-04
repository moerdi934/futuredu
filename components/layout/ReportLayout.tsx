'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  ColumnResizeMode,
  Row,
} from '@tanstack/react-table';
import {
  Button,
  InputGroup,
  FormControl,
  Spinner,
  Card,
  Alert
} from 'react-bootstrap';
import { FaEdit, FaPlus, FaFilter, FaSearch } from 'react-icons/fa';

import MainLayout from './DashboardLayout';
import TableTemplate from './TableLayout';
import ColumnVisibilityDropdown from './ColumnVisibilityDropdown';
import FilterModalTemplate from './FilterModalLayout';
import { createColumnBuilder, CustomAction } from '../../utils/ColumnBuilder';

interface PageTemplateProps<T> {
  // Page Configuration
  title: string;
  fetchData: (params: any) => Promise<{ data: T[]; total: number; totalPages: number; currentPage?: number }>;
  
  // Table Configuration
  tableConfig: {
    desktop: {
      columns: any[];
      fixedColumnIds?: string[];
    };
    mobile: {
      columns: any[];
      fixedColumnIds?: string[];
    };
  };
  
  // Filter Configuration
  filterConfig: any;
  initialFilters: any;
  isShowFilterFirst?: boolean;
  onFilterChange?: (filters: any) => any;
  
  // Pagination Configuration
  initialPage?: number;
  
  // Custom Components
  CustomNav?: React.ComponentType<any>;
  CustomCard?: React.ComponentType<any>;
  
  // Custom Formatters
  customFormatters?: {
    [key: string]: (value: any) => string;
  };
  
  // Modal Components
  AddModal?: React.ComponentType<any>;
  EditModal?: React.ComponentType<any>;
  
  // Handlers
  onAdd?: (data: T) => void;
  onEdit?: (data: T) => void;
  onDelete?: (id: number) => void;
  onDetail?: (data: T) => void;
  customActions?: (record: T) => CustomAction[];

  customRowStyling?: (row: Row<T>) => React.CSSProperties;
}

const PageTemplate = <T extends { id: number }>({
  title,
  fetchData,
  tableConfig,
  filterConfig,
  initialFilters,
  isShowFilterFirst = false,
  onFilterChange,
  initialPage,
  CustomNav,
  CustomCard,
  customFormatters = {},
  AddModal,
  EditModal,
  onAdd,
  onEdit,
  onDelete,
  onDetail,
  customActions,
  customRowStyling
}: PageTemplateProps<T>) => {
  // State management
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage === undefined ? null : initialPage || 1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [showFilterModal, setShowFilterModal] = useState(isShowFilterFirst);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize mobile state safely
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  const customRowStylingFn = customRowStyling || ((row: Row<T>) => ({}));

  // Column builder setup
  const columnBuilder = createColumnBuilder<T>();

  const buildTableColumns = () => {
    const config = isMobile ? tableConfig.mobile : tableConfig.desktop;
    return columnBuilder.buildColumns(config.columns, {
      actionHandlers: {
        onView: onDetail,
        onEdit,
        onDelete,
        customActions
      },
      customFormatters
    });
  };

  const getFixedColumnIds = () => {
    const config = isMobile ? tableConfig.mobile : tableConfig.desktop;
    return config.fixedColumnIds || [];
  };

  // Table configuration
  const table = useReactTable({
    data,
    columns: buildTableColumns(),
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode,
    enableColumnResizing: true,
  });

  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  
  // Data fetching
  const loadData = async () => {
    setIsLoading(true);
    try {
      const sort = sorting[0] || { id: 'id', desc: false };
      const params = {
        limit: pageSize,
        search: searchQuery,
        ...filters,
        sortKey: sort.id,
        sortOrder: sort.desc ? 'desc' : 'asc',
      };
      
      // Only add page parameter if it's not null (for user-centered ranking)
      if (currentPage !== null) {
        params.page = currentPage;
      }

      const response = await fetchData(params);
      
      // Reset data state before updating with new data
      setData([]);
      setTotalRecords(0);
      setTotalPages(0);
      
      // Small delay to ensure state is cleared before setting new data
      setTimeout(() => {
        setData(response.data || []);
        setTotalRecords(response.total || 0);
        setTotalPages(response.totalPages || 0);
        
        // If we received a calculated page from backend (user-centered)
        if (response.currentPage && currentPage === null) {
          setCurrentPage(response.currentPage);
        }
      }, 0);
      
      setHasAttemptedFetch(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setTotalRecords(0);
      setTotalPages(0);
      setHasAttemptedFetch(true);
    }
    setIsLoading(false);
  };
  
  // Effects
  useEffect(() => {
    const columns = buildTableColumns();
    const initialVisibility: VisibilityState = {};
    
    // Recursive function to find all columns with hidden property
    const processColumns = (cols: any[]) => {
      cols.forEach(col => {
        // Check if it's a group column with sub-columns
        if (col.columns) {
          processColumns(col.columns);
        } else {
          // Check different places where the hidden property might be stored
          const isHidden = 
            col.columnDef?.meta?.hidden || // Try direct column meta
            col.meta?.hidden ||            // Try meta property
            col.columnDef?.hidden ||       // Try direct hidden property
            (col.id === 'exam_schedule_id'); // Force hidden for this specific column
          
          if (isHidden) {
            initialVisibility[col.id] = false;
          }
        }
      });
    };
    
    processColumns(columns);
    
    // Update the visibility state
    setColumnVisibility(prevState => {
      const newState = {
        ...prevState,
        ...initialVisibility,
        // Force hide specific columns - add as a fallback
        exam_schedule_id: false
      };
      return newState;
    });
  }, [tableConfig, isMobile]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, searchQuery, filters, sorting]);

  // Keyboard shortcuts
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isMobile) {
      if (event.altKey && event.key.toLowerCase() === 'c') {
        setShowAddModal(true);
      } else if (event.altKey && event.key.toLowerCase() === 't') {
        setShowEditModal(true);
      }
    }
  }, [isMobile]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
  
  // UI Components
  const renderSearchControls = () => (
    <Card className="tw-shadow-lg tw-rounded-lg tw-border-0 tw-mb-6">
      <Card.Body className="tw-py-3 tw-px-4">
        <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-3">
          <div className="tw-flex-grow">
            <InputGroup className="tw-border tw-border-purple-300 tw-rounded-lg tw-overflow-hidden tw-shadow-sm">
              <InputGroup.Text className="tw-bg-purple-50 tw-border-0">
                <FaSearch className="tw-text-purple-700" />
              </InputGroup.Text>
              <FormControl
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tw-border-0 tw-shadow-none tw-focus:ring-2 tw-focus:ring-purple-500"
              />
              <Button 
                variant="outline-light"
                onClick={() => setShowFilterModal(true)}
                className="tw-bg-purple-700 tw-text-white tw-border-0 tw-px-3 tw-hover:bg-purple-800 tw-transition-all"
              >
                <FaFilter className="tw-mr-2" /> Filters
              </Button>
            </InputGroup>
          </div>
          <div className="tw-flex-shrink-0">
            <ColumnVisibilityDropdown 
              table={table} 
              fixedColumnIds={getFixedColumnIds()} 
              className="tw-bg-purple-50 tw-text-purple-800 tw-border-purple-200 tw-hover:bg-purple-100"
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  const renderActionButtons = () => (
    <div className="tw-flex tw-flex-wrap tw-gap-3 tw-mb-4">
      {AddModal && (
        <div className="tw-flex tw-flex-col">
          <Button 
            variant="success" 
            onClick={() => setShowAddModal(true)}
            className="tw-bg-purple-700 tw-border-0 tw-rounded-lg tw-px-4 tw-py-2 tw-flex tw-items-center tw-gap-2 tw-shadow-md tw-hover:bg-purple-800 tw-transition-all"
          >
            <FaPlus /> <span>Add New</span>
          </Button>
          {!isMobile && (
            <div className="tw-text-gray-500 tw-text-xs tw-mt-1 tw-text-center">
              ALT+C
            </div>
          )}
        </div>
      )}
      {EditModal && (
        <div className="tw-flex tw-flex-col">
          <Button 
            variant="warning" 
            onClick={() => setShowEditModal(true)}
            className="tw-bg-purple-500 tw-text-white tw-border-0 tw-rounded-lg tw-px-4 tw-py-2 tw-flex tw-items-center tw-gap-2 tw-shadow-md tw-hover:bg-purple-600 tw-transition-all"
          >
            <FaEdit /> <span>Edit</span>
          </Button>
          {!isMobile && (
            <div className="tw-text-gray-500 tw-text-xs tw-mt-1 tw-text-center">
              ALT+T
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <div className="tw-flex tw-justify-center tw-items-center tw-py-12">
          <div className="tw-flex tw-flex-col tw-items-center tw-gap-3">
            <Spinner 
              animation="border" 
              role="status" 
              className="tw-text-purple-700"
              style={{ width: '3rem', height: '3rem' }}
            />
            <span className="tw-text-purple-700 tw-font-medium">Loading data...</span>
          </div>
        </div>
      );
    }

    if (!isLoading && hasAttemptedFetch && (!data || data.length === 0)) {
      return (
        <Alert 
          variant="info" 
          className="tw-bg-purple-50 tw-text-purple-800 tw-border-purple-200 tw-rounded-lg tw-py-4 tw-px-6 tw-flex tw-justify-center tw-items-center tw-my-8"
        >
          <div className="tw-text-center">
            <p className="tw-text-lg tw-font-medium tw-mb-1">No data found</p>
            <p className="tw-text-sm tw-text-purple-600">Try adjusting your search criteria</p>
          </div>
        </Alert>
      );
    }

    return (
      <TableTemplate
        table={table}
        isMobile={isMobile}
        handleShowDetail={onDetail}
        handleDelete={onDelete}
        fixedColumnIds={getFixedColumnIds()}
        isLoading={isLoading}
        currentPage={currentPage || 1}
        totalPages={totalPages}
        totalRecords={totalRecords}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        customRowStyling={customRowStylingFn}
      />
    );
  };

  return (
    <MainLayout>
      <div className="tw-container-fluid tw-px-4 tw-py-6">
        {/* Custom Nav Component at the very top */}
        {CustomNav && <div className="tw-mb-6"><CustomNav /></div>}
        
        <Card className="tw-shadow-lg tw-rounded-lg tw-border-0 tw-overflow-hidden tw-mb-6">
          <div className="tw-bg-gradient-to-r tw-from-purple-800 tw-to-purple-900 tw-text-white tw-py-5 tw-px-6">
            <div className="tw-flex tw-flex-wrap tw-justify-between tw-items-center tw-gap-4">
              <h1 className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-m-0">{title}</h1>
              {!isMobile && (
                <div className="tw-flex tw-gap-3">
                  {renderActionButtons()}
                </div>
              )}
            </div>
          </div>
        </Card>

        {renderSearchControls()}
        {isMobile && renderActionButtons()}

        {/* Custom Card Component */}
        {CustomCard && <div className="tw-mb-6"><CustomCard /></div>}

        <Card className="tw-shadow-lg tw-rounded-lg tw-border-0 tw-overflow-hidden">
          <Card.Body className="tw-p-0">
            <div className="tw-overflow-x-auto">
              {renderTableContent()}
            </div>
          </Card.Body>
        </Card>

        {/* Modals */}
        <FilterModalTemplate
          show={showFilterModal}
          onHide={() => setShowFilterModal(false)}
          config={filterConfig}
          initialFilters={filters}
          onApplyFilters={(newFilters) => {
            // Process filters through the optional handler if provided
            const processedFilters = onFilterChange ? onFilterChange(newFilters) : newFilters;
            setFilters(processedFilters); 
          }}
        />
        
        {AddModal && (
          <AddModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={(newData: T) => {
              onAdd?.(newData);
              setShowAddModal(false);
              loadData();
            }}
          />
        )}
        
        {EditModal && (
          <EditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={(updatedData: T) => {
              onEdit?.(updatedData);
              setShowEditModal(false);
              loadData();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default PageTemplate;