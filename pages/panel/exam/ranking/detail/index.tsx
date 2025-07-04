'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageTemplate from '../../../../../components/layout/ReportLayout';
import snbtTableConfig from './table-column-snbt.json';
import simakTableConfig from './table-column-simak.json';
import defaultTableConfig from '../table-column.json';
import filterConfig from '../filter-config.json';
import axios from 'axios';
import { Button, Card } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../../../../context/AuthContext';

const RankingDetail: React.FC = () => {
  const { id } = useAuth();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageTemplateRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [examInfo, setExamInfo] = useState({
    exam_type: '',
    exam: '',
    exam_name: ''
  });
  const [userHasInitiallyLoaded, setUserHasInitiallyLoaded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      setCurrentUserId(parseInt(id));
    }
  }, [id]);

  const highlightCurrentUser = (row: any) => {
    const rowData = row.original;
    if (rowData.user_id === currentUserId) {
      return {
        backgroundColor: 'rgba(147, 51, 234, 0.15)', // Light purple
        fontWeight: 'bold',
        boxShadow: '0 0 8px rgba(147, 51, 234, 0.5)'
      };
    }
    return {};
  };

  // Parse URL search params using Next.js useSearchParams
  useEffect(() => {
    const exam_type = searchParams.get('exam_type') || '';
    const exam = searchParams.get('exam') || '';
    const exam_name = searchParams.get('esn') || '';
    
    setExamInfo({
      exam_type,
      exam,
      exam_name
    });
    
    setIsLoading(false);
  }, [searchParams]);

  // Select table config based on exam_type
  const getTableConfig = (examType: string) => {
    switch (examType) {
      case "SNBT":
        return snbtTableConfig;
      case "SIMAK":
        return simakTableConfig;
      default:
        return defaultTableConfig;
    }
  };

  const fetchData = async (params: any) => {
    try {
      if (!examInfo.exam) {
        return { data: [], total: 0, totalPages: 0 };
      }
      
      const apiParams = { ...params };
      
      // Only use user-centered logic on the first load
      const isFirstLoad = !userHasInitiallyLoaded && 
                           (apiParams.page === 1 || apiParams.page === undefined);
      
      // If it's the first load, remove the page parameter to trigger user-centered calculation
      if (isFirstLoad) {
        delete apiParams.page;
        setUserHasInitiallyLoaded(true);
      }
      
      // Use environment variable for API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const url = `${apiUrl}/ranking/by-user/${examInfo.exam}`;
      
      // Remove unnecessary params
      delete apiParams.examType;
      delete apiParams.exam_schedule;
      
      // Get auth token from localStorage (client-side only)
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      const response = await axios.get(url, { 
        params: apiParams,
        headers: {
          ...(authToken && { Authorization: `Bearer ${authToken}` })
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return { data: [], total: 0, totalPages: 0 };
    }
  };

  const initialFilters = {
    examType: examInfo.exam_type || "All",
    exam_schedule: examInfo.exam || "All",
    isFree: "All",
    isValid: "All",
    dateRange: "none",
    startDate: null,
    endDate: null,
    groupProduct: "All",
    series: "All"
  };

  const handleCheckResult = (record: any) => {
    // Store state in sessionStorage since Next.js doesn't support state in router.push
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('examResultState', JSON.stringify({
        examType: record.exam_type || examInfo.exam_type,
        examId: record.id
      }));
    }
    router.push(`/exam-results/${record.id}`);
  };

  const getCustomActions = (record: any) => {
    return [
      {
        icon: 'file-text',
        label: 'Check Result',
        onClick: () => handleCheckResult(record),
        color: 'green'
      }
    ];
  };

  // Define the NavigationNav component for the back button at the top
  const NavigationNav = () => {
    return (
      <Card className="tw-shadow-md tw-rounded-lg tw-border-0 tw-mb-4">
        <Card.Body className="tw-py-3 tw-px-4">
          <Button
            variant="outline-primary"
            className="tw-flex tw-items-center tw-gap-2 tw-text-purple-700 tw-border-purple-300 tw-hover:bg-purple-50"
            onClick={() => router.push('/admin/exam/ranking')}
          >
            <FaArrowLeft /> Back to Rankings
          </Button>
        </Card.Body>
      </Card>
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <PageTemplate
      ref={pageTemplateRef}
      title={`${examInfo.exam_type} - ${examInfo.exam_name} Details`}
      fetchData={fetchData}
      tableConfig={getTableConfig(examInfo.exam_type)}
      filterConfig={filterConfig}
      initialFilters={initialFilters}
      customActions={getCustomActions}
      isShowFilterFirst={false}
      initialPage={undefined} // Set initial page to undefined for user-centered ranking
      CustomNav={NavigationNav}
      customRowStyling={highlightCurrentUser}
    />
  );
};

export default RankingDetail;