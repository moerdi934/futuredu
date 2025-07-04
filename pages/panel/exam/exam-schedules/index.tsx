'use client';

import React, { useState } from 'react';
import PageTemplate from '../../../../components/layout/ReportLayout';
import AddExamScheduleModal from './AddExamScheduleModal';
import EditExamScheduleModal from './EditExamScheduleModal';
import EditExamScheduleModalProps from './EditExamScheduleModalProps';
import tableConfig from './table-column-es.json';
import filterConfig from './filter-config-es.json';
import axios from 'axios';

interface ExamSchedule {
  id: number;
  schedule_name: string;
  description: string;
  exam_id: number;
  exam_name: string;
  exam_duration: number;
  exam_type: string;
  series: string;
  group_product: string;
  isfree: boolean;
  is_valid: boolean;
  start_time: string | null;
  end_time: string | null;
  question_qty: number;
  schedule_creator: string;
  exam_creator: string;
}

const ExamSchedulePage: React.FC = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);

  const fetchData = async (params: any) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/exam-schedules/all`, { params });
    return response.data;
  };

  const handleEdit = async (schedule: ExamSchedule) => {
    console.log(schedule);
    setSelectedSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (updatedSchedule: any) => {
    try {
      // Refresh the table data after successful edit
      await fetchData({});
      setIsEditModalOpen(false);
      setSelectedSchedule(null);
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Failed to update schedule');
    }
  };

  const customFormatters = {
    start_time: (value: string | null) => {
      if (value === null || value === undefined) return 'Anytime';
      
      try {
        const date = new Date(value);
        if (isNaN(date.getTime()) || date.getFullYear() === 1970) {
          return 'Anytime';
        }
        
        return date.toLocaleString();
      } catch (error) {
        return 'Anytime';
      }
    },
    end_time: (value: string | null) => {
      if (value === null || value === undefined) return 'Anytime';
      try {
        const date = new Date(value);
        if (isNaN(date.getTime()) || date.getFullYear() === 1970) {
          return 'Anytime';
        }
        return date.toLocaleString();
      } catch (error) {
        return 'Anytime';
      }
    },
    exam_duration: (value: number) => `${value} mins`
  };

  const initialFilters = {
    examType: 'All',
    isFree: 'All',
    isValid: 'All',
    startDate: null,
    endDate: null,
    groupProduct: 'All',
    series: 'All'
  };

  return (
    <>
      <PageTemplate<ExamSchedule>
        title="Manage Exam Schedules"
        fetchData={fetchData}
        tableConfig={tableConfig}
        filterConfig={filterConfig}
        initialFilters={initialFilters}
        customFormatters={customFormatters}
        AddModal={AddExamScheduleModal}
        EditModal={EditExamScheduleModal}
        onEdit={handleEdit}
        onDelete={(id) => console.log('Deleted:', id)}
        onDetail={(data) => console.log('Showing details:', data)}
      />
      <EditExamScheduleModalProps
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        data={selectedSchedule}
      />
    </>
  );
};

export default ExamSchedulePage;