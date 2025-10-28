// types/questionImportExport.ts

export interface QuestionJSON {
  version: string; // Format version untuk compatibility
  questionType: string; // 'single-choice', 'multiple-choice', etc.
  level: number | null;
  
  // Question content dengan equation tags
  questionText: string;
  
  // Options untuk multiple choice
  options?: string[];
  correctAnswer?: number | number[]; // index atau array of indices
  
  // Statements untuk true/false
  statements?: string[];
  
  // Answer untuk number/text
  answer?: string;
  
  // Explanation
  hasExplanation: boolean;
  explanationContent?: string;
  
  // Metadata - harus diisi manual saat import
  bidang?: {
    label: string;
    value: any;
  } | null;
  topik?: {
    label: string;
    value: any;
  } | null;
  subTopik?: {
    label: string;
    value: any;
  } | null;
  
  // Passage - harus diisi manual saat import
  hasPassage: boolean;
  passage?: {
    id: any;
    title: string;
    content: string;
  } | null;
}

export interface BulkQuestionImportJSON {
  version: string;
  questions: QuestionJSON[];
  metadata?: {
    createdAt: string;
    totalQuestions: number;
  };
}