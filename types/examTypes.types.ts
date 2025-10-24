// types/examTypes.types.ts - Complete type definitions for Exam Types

export interface ExamType {
  id: string;
  name: string;
  code: string;
  description?: string;
  kind: number; // 0=Jenis Ujian, 1=Pelajaran, 2=Topik, 3=Subtopik
  master_id?: string;
  mix_master_id?: string[]; // Array of master IDs untuk subtopik dengan multiple topics
  grade?: number[]; // Array of grades
  create_user_id?: string;
  edit_user_id?: string;
  create_date?: Date;
  edit_date?: Date;
  // Additional fields from joins
  master_name?: string;
  creator_name?: string;
  editor_name?: string;
  question_count?: number;
}

export interface ExamTypeCreateData {
  name: string;
  code: string;
  description?: string;
  kind: number;
  master_id?: string | null;
  mix_master_id?: string[];
  grade?: number[];
  create_user_id?: string;
}

export interface ExamTypeUpdateData {
  name?: string;
  code?: string;
  description?: string;
  kind?: number;
  master_id?: string | null;
  mix_master_id?: string[];
  grade?: number[];
  edit_user_id?: string;
}

export interface ExamTypeSearchOptions {
  search?: string;
  kind?: number;
  master_id?: string;
  grade?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ExamTypeSearchResult {
  items: ExamType[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

// Grade configuration
export const GRADE_OPTIONS = [
  { value: 1, label: 'Kelas 1' },
  { value: 2, label: 'Kelas 2' },
  { value: 3, label: 'Kelas 3' },
  { value: 4, label: 'Kelas 4' },
  { value: 5, label: 'Kelas 5' },
  { value: 6, label: 'Kelas 6' },
  { value: 7, label: 'Kelas 7' },
  { value: 8, label: 'Kelas 8' },
  { value: 9, label: 'Kelas 9' },
  { value: 10, label: 'Kelas 10' },
  { value: 11, label: 'Kelas 11' },
  { value: 12, label: 'Kelas 12' },
  { value: 13, label: 'S1 (Sarjana)' },
  { value: 14, label: 'S2 (Magister)' },
  { value: 15, label: 'S3 (Doktor)' },
  { value: 16, label: 'Beyond S3' },
];

// Kind configuration
export const KIND_OPTIONS = [
  { value: 0, label: 'Jenis Ujian', color: 'purple' },
  { value: 1, label: 'Pelajaran', color: 'blue' },
  { value: 2, label: 'Topik', color: 'green' },
  { value: 3, label: 'Subtopik', color: 'orange' },
];

export const getKindLabel = (kind: number): string => {
  const option = KIND_OPTIONS.find(opt => opt.value === kind);
  return option?.label || 'Unknown';
};

export const getKindColor = (kind: number): string => {
  const option = KIND_OPTIONS.find(opt => opt.value === kind);
  return option?.color || 'gray';
};

export const getGradeLabel = (grade: number): string => {
  if (grade === 13) return 'S1';
  if (grade === 14) return 'S2';
  if (grade === 15) return 'S3';
  if (grade === 16) return 'Beyond S3';
  return `Kelas ${grade}`;
};

export const getGradeLabels = (grades: number[] | null | undefined): string => {
  if (!grades || grades.length === 0) return 'Semua Kalangan';
  return grades.map(g => getGradeLabel(g)).join(', ');
};