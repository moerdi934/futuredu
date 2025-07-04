'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PageTemplate from '../../../../components/layout/ReportLayout';
import defaultTableConfig from './table-column.json';
import filterConfig from './filter-config.json';
import axios from 'axios';

const RankingPage: React.FC = () => {
  const router = useRouter();
  const [currentFilters, setCurrentFilters] = useState({
    examType: "All",
    exam_schedule: "All"
  });
  const pageTemplateRef = useRef<any>(null);
  const initialDataFetchedRef = useRef<boolean>(false);

  const fetchData = async (params: any) => {
    console.log("Fetch data called with params:", params);
    
    if (!initialDataFetchedRef.current && pageTemplateRef.current?.isFilterModalOpen) {
      console.log("Preventing initial fetch while filter modal is open");
      return { data: [], total: 0, totalPages: 0 };
    }
    
    try {
      // Merge incoming params with currentFilters to ensure all filters are included
      const mergedParams = { ...currentFilters, ...params };
      const apiParams = { ...mergedParams };
      
      console.log("Current filters state:", {
        examType: apiParams.examType,
        examSchedule: apiParams.exam_schedule
      });
      
      // Use environment variable for API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const url = `${apiUrl}/ranking/user-exam-rankings`;
      
      if (apiParams.examType && apiParams.examType !== 'All') {
        apiParams.exam_type = apiParams.examType;
      }
      
      delete apiParams.examType;
      delete apiParams.exam_schedule;
      
      console.log("Fetching from URL:", url, "with params:", apiParams);
      
      // Get auth token from localStorage (client-side only)
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      const response = await axios.get(url, { 
        params: apiParams,
        headers: {
          ...(authToken && { Authorization: `Bearer ${authToken}` })
        }
      });
      
      console.log("API response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return { data: [], total: 0, totalPages: 0 };
    }
  };

  useEffect(() => {
    console.log("Effect triggered: filters changed", currentFilters);
    
    if (initialDataFetchedRef.current && pageTemplateRef.current) {
      // A small delay to ensure state is fully updated before refetching
      setTimeout(() => {
        if (pageTemplateRef.current.refetchData) {
          console.log("Triggering refetch with updated filters", currentFilters);
          pageTemplateRef.current.refetchData();
        }
      }, 100);
    }
  }, [currentFilters]);

  const initialFilters = {
    examType: "All",
    exam_schedule: "All",
    isFree: "All",
    isValid: "All",
    dateRange: "none",
    startDate: null,
    endDate: null,
    groupProduct: "All",
    series: "All"
  };

  const customFormatters = {
    waktu: (value: string | Date) => {
      if (!value) return '-';
      
      // Convert string to Date object if needed
      const date = value instanceof Date ? value : new Date(value);
      
      // Indonesian days of week
      const daysIndonesian = [
        'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
      ];
      
      // Get day name in Indonesian
      const dayName = daysIndonesian[date.getDay()];
      
      // Format date as dd/mm/yyyy
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-indexed
      const year = date.getFullYear();
      
      // Combine day name and formatted date
      return `${dayName}, ${day}/${month}/${year}`;
    }
  };

  const handleFilterChange = (newFilters: any) => {
    console.log("Filter change handler called with:", newFilters);
    initialDataFetchedRef.current = true;
    
    // Update filters in a single state update to avoid race conditions
    setCurrentFilters({
      examType: newFilters.examType,
      exam_schedule: newFilters.exam_schedule
    });
    
    // Handle resetting dependent fields
    if (newFilters.examType !== currentFilters.examType && newFilters.examType !== 'All') {
      const updatedFilters = { ...newFilters, exam_schedule: 'All' };
      console.log("Resetting exam_schedule to 'All' due to exam type change. Updated filters:", updatedFilters);
      return updatedFilters;
    }

    return newFilters;
  };

  const handleFilterModalClose = () => {
    console.log("Filter modal closed");
    initialDataFetchedRef.current = true;
  };

  const handleViewDetail = (record: any) => {
    console.log("View Detail clicked with record:", record);
    
    // Extract all needed information
    const examType = encodeURIComponent(record.exam_type || '');
    const examScheduleId = encodeURIComponent(record.exam_schedule_id || '');
    const examScheduleName = encodeURIComponent(record.exam_schedule_name || '');
    
    // Navigate with all three parameters using Next.js router
    router.push(`/panel/exam/ranking/detail?exam_type=${examType}&exam=${examScheduleId}&esn=${examScheduleName}`);
  };

  const getCustomActions = (record: any) => {
    return [
      {
        icon: 'file-text',
        label: 'View Detail',
        onClick: () => {
          console.log("View Detail action clicked with record:", record);
          handleViewDetail(record);
        },
        color: 'green'
      },
      {
        icon: 'bar-chart-2',
        label: 'Check Result',
        onClick: () => {
          // Navigate to exam results using Next.js router with state
          // Note: Next.js doesn't support state in router.push, so we'll use query params or sessionStorage
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('examResultState', JSON.stringify({
              examType: record.exam_type || currentFilters.examType,
              examId: record.id
            }));
          }
          router.push(`/exam-results/${record.id}`);
        },
        color: 'blue'
      }
    ];
  };

  return (
    <PageTemplate
      ref={pageTemplateRef}
      title="Exam Rank Database"
      fetchData={fetchData}
      tableConfig={defaultTableConfig}
      filterConfig={filterConfig}
      initialFilters={initialFilters}
      onDetail={handleViewDetail}
      onFilterChange={handleFilterChange}
      onFilterModalClose={handleFilterModalClose}
      customActions={getCustomActions}
      customFormatters={customFormatters}
    />
  );
};

export default RankingPage;