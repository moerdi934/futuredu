'use client';

import React from 'react';
import PageTemplate from '../../../../components/layout/ReportLayout';
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';
import tableConfig from './table-column-student.json';
import filterConfig from './filter-config-student.json';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext';

interface Student {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string | number | null;
  lastlogin?: string | null;
  status: string;
  create_date: string;
  edit_date: string;
}

interface StudentManagementProps {}

const StudentManagement: React.FC<StudentManagementProps> = () => {
  const fetchData = async (params: Record<string, any>) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/role/student`, { params });
      console.log('Raw data sample:', response.data.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching student data:', error);
      throw error;
    }
  };

  const customFormatters = {
    phone: (value: string | number | null): string => {
      if (!value || value === 0 || value === "0") {
        return "";
      }
      return value.toString();
    },
    lastlogin: (value: string | null): string => {
      if (!value) return "";
      
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return "";
        }
        
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const day = days[date.getDay()];
        
        // Format: Hari, DD/MM/YYYY HH:MM
        const formatted = `${day}, ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        return formatted;
      } catch (error) {
        return "";
      }
    }
  };

  const initialFilters = {
    status: null,
    startDate: null,
    endDate: null,
  };

  const handleAdd = (data: Student) => {
    console.log('Added:', data);
  };

  const handleEdit = (data: Student) => {
    console.log('Edited:', data);
  };

  const handleDelete = (id: number) => {
    console.log('Deleted:', id);
  };

  const handleDetail = (data: Student) => {
    console.log('Showing details:', data);
  };

  return (
    <PageTemplate<Student>
      title="Manage Students"
      fetchData={fetchData}
      tableConfig={tableConfig}
      filterConfig={filterConfig}
      initialFilters={initialFilters}
      customFormatters={customFormatters}
      AddModal={AddStudentModal}
      EditModal={EditStudentModal}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onDetail={handleDetail}
    />
  );
}; 

export default StudentManagement;