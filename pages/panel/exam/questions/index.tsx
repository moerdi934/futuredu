'use client';

import React from 'react';
import PageTemplate from '../../../../components/layout/ReportLayout';
import AddQuestionModal from './AddQuestionModal';
import tableConfig from './table-column-quest.json';
import filterConfig from './filter-config-quest.json';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';

const EditQuestionModal = () => {
  console.log("edit");
};

interface Question {
  id: number;
  code: string;
  question_text: string;
  question_type: string;
  level: number;
  exam_type_id: number;
  id_subtopik: number;
  options?: string[];
  correct_answer?: string[] | number[];
  statements?: string[];
  create_user_id: number;
  question_code: string;
  explanation?: string | null;
  passage_id?: number | string | null;
  passage?: string | null;
  creator: string;
  create_date: string;
  edit_user_id?: number;
  edit_date?: string;
  status: string;
}

const QuestionManagement: React.FC = () => {
  const fetchData = async (params: any) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/questions/paged`, { 
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    console.log('Raw data sample:', response.data.data);
    return response.data;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const day = days[date.getDay()];
    
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    
    return `${day}, ${dd}/${mm}/${yyyy}`;
  };

  const customFormatters = {
    question_text: (value: string) => {
      return <div dangerouslySetInnerHTML={{ __html: value }} />;
    },
    create_date: (value: string) => {
      return formatDate(value);
    },
    edit_date: (value: string) => {
      return formatDate(value);
    }
  };

  const initialFilters = {
    status: null,
    startDate: null,
    endDate: null,
  };

  return (
    <PageTemplate<Question>
      title="Manage Questions"
      fetchData={fetchData}
      tableConfig={tableConfig}
      filterConfig={filterConfig}
      initialFilters={initialFilters}
      customFormatters={customFormatters}
      AddModal={AddQuestionModal}
      EditModal={EditQuestionModal}
      onAdd={(data) => console.log('Added:', data)}
      onEdit={(data) => console.log('Edited:', data)}
      onDelete={(id) => console.log('Deleted:', id)}
      onDetail={(data) => console.log('Showing details:', data)}
    />
  );
};

export default QuestionManagement;