// utils/bulkQuestionImport.ts
import axios from 'axios';
import { SelectOption } from '../components/form/FormComponentLayout';

export interface ImportedQuestion {
  level?: number;
  questionType?: string;
  questionText?: string;
  options?: string[];
  correctAnswer?: number[];
  statements?: string[];
  answer?: string;
  explanation?: string;
  explanationContent?: string;
  hasExplanation?: boolean;
  bidang?: string;
  bidang_code?: string;
  topik?: string;
  topic_code?: string;
  subtopic?: string;
  subtopic_code?: string;
  subtopic_id?: number;
  passageTitle?: string;
  question_source_id?: number;
}

export interface ProcessedQuestion {
  data: any;
  errors: string[];
  warnings: string[];
  isComplete: boolean;
}

export interface ImportResult {
  questions: ProcessedQuestion[];
  totalQuestions: number;
  completeQuestions: number;
  incompleteQuestions: number;
  errors: string[];
}

/**
 * Process content - parse equations and normalize spacing
 */
const processContent = (content: string): string => {
  if (!content) return content;
  
  // Parse equation tags
  let processed = content.replace(/<equation>([\s\S]*?)<\/equation>/g, (match, latex) => {
    try {
      // Just wrap it for now - KaTeX rendering happens in SuperEditor
      const isMultiline = /\\begin\{(align|gather|equation|eqnarray)/.test(latex);
      const containerTag = isMultiline ? 'div' : 'span';
      return `<${containerTag} class="cte-katex-equation ${isMultiline ? 'cte-katex-block' : 'cte-katex-inline'}" data-latex="${encodeURIComponent(latex.trim())}" data-display-mode="${isMultiline}" data-editable="true">${latex}</${containerTag}>`;
    } catch (error) {
      console.error('Error parsing equation:', error);
      return match;
    }
  });
  
  // Normalize paragraph spacing
  processed = processed.replace(/\n\n+/g, '\n');
  processed = processed.replace(/<p>/g, '<p style="margin-bottom: 1em;">');
  processed = processed.replace(/<p\s+style="([^"]*)"/g, (match, existingStyle) => {
    if (existingStyle.includes('margin-bottom')) {
      return match;
    }
    return `<p style="${existingStyle}; margin-bottom: 1em;"`;
  });
  
  return processed;
};

/**
 * Search for exam type (bidang/topik/subtopik) by code and name
 */
export const searchExamType = async (
  searchTerm: string,
  kind: number,
  masterId?: string
): Promise<SelectOption[]> => {
  try {
    let url = `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=${encodeURIComponent(searchTerm)}&kind=${kind}`;
    
    if (masterId) {
      url += `&masterId=${masterId}`;
    }
    
    const response = await axios.get(url);
    
    if (response.data && Array.isArray(response.data.examTypes)) {
      return response.data.examTypes.map((exam: any) => ({
        label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
        value: exam.id,
        code: exam.code,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching exam type:', error);
    return [];
  }
};

/**
 * Search for passage by title
 */
export const searchPassageByTitle = async (title: string): Promise<any | null> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/questions/passage/search?search=${encodeURIComponent(title)}`
    );
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      // Find exact match or best match
      const exactMatch = response.data.find((p: any) => 
        p.title.toLowerCase().trim() === title.toLowerCase().trim()
      );
      
      return exactMatch || response.data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error searching passage:', error);
    return null;
  }
};

/**
 * Process single question from JSON
 */
export const processImportedQuestion = async (
  item: ImportedQuestion,
  index: number
): Promise<ProcessedQuestion> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Process content
  const processedQuestionText = processContent(item.questionText || '');
  const processedOptions = (item.options || []).map((opt: string) => processContent(opt));
  const processedExplanation = processContent(item.explanation || item.explanationContent || '');
  
  // Initialize question data
  const questionData: any = {
    bidang: null,
    topik: null,
    subTopik: null,
    bidangOptions: [],
    topikOptions: [],
    subTopikOptions: [],
    isLoadingBidang: false,
    isLoadingTopik: false,
    isLoadingSubTopik: false,
    level: item.level || null,
    hasPassage: !!item.passageTitle,
    createNewPassage: false,
    passage: null,
    passageSearchResults: [],
    isLoadingPassage: false,
    newPassageTitle: '',
    newPassageContent: '',
    showPassageModal: false,
    importPassageMode: false,
    passageJsonInput: '',
    passageImportError: '',
    questionType: item.questionType || 'single-choice',
    options: processedOptions.length > 0 ? processedOptions : [''],
    correctAnswer: item.correctAnswer || [],
    statements: item.statements || [''],
    answer: item.answer || '',
    questionText: processedQuestionText,
    hasExplanation: !!(item.explanation || item.explanationContent),
    explanationContent: processedExplanation,
    question_source_id: item.question_source_id || 1, // Default to AI
  };
  
  // Try to find and set bidang
  if (item.bidang || item.bidang_code) {
    const searchTerm = item.bidang_code || item.bidang || '';
    const bidangOptions = await searchExamType(searchTerm, 1);
    questionData.bidangOptions = bidangOptions;
    
    if (bidangOptions.length > 0) {
      // Try exact match by code first
      let match = bidangOptions.find((opt: SelectOption) => 
        opt.code?.toLowerCase() === item.bidang_code?.toLowerCase()
      );
      
      // If no exact match, use first result
      if (!match && bidangOptions.length > 0) {
        match = bidangOptions[0];
        warnings.push(`Soal #${index + 1}: Bidang "${searchTerm}" tidak ditemukan exact match, menggunakan: ${match.label}`);
      }
      
      if (match) {
        questionData.bidang = match;
      }
    } else {
      errors.push(`Soal #${index + 1}: Bidang "${searchTerm}" tidak ditemukan`);
    }
  } else {
    errors.push(`Soal #${index + 1}: Bidang tidak ada di JSON`);
  }
  
  // Try to find and set topik (only if bidang found)
  if (questionData.bidang && (item.topik || item.topic_code)) {
    const searchTerm = item.topic_code || item.topik || '';
    const topikOptions = await searchExamType(searchTerm, 2, questionData.bidang.value);
    questionData.topikOptions = topikOptions;
    
    if (topikOptions.length > 0) {
      let match = topikOptions.find((opt: SelectOption) => 
        opt.code?.toLowerCase() === item.topic_code?.toLowerCase()
      );
      
      if (!match && topikOptions.length > 0) {
        match = topikOptions[0];
        warnings.push(`Soal #${index + 1}: Topik "${searchTerm}" tidak ditemukan exact match, menggunakan: ${match.label}`);
      }
      
      if (match) {
        questionData.topik = match;
      }
    } else {
      errors.push(`Soal #${index + 1}: Topik "${searchTerm}" tidak ditemukan`);
    }
  } else if (!questionData.bidang) {
    errors.push(`Soal #${index + 1}: Tidak dapat mencari Topik karena Bidang tidak ditemukan`);
  } else {
    errors.push(`Soal #${index + 1}: Topik tidak ada di JSON`);
  }
  
  // Try to find and set subtopik (only if topik found)
  if (questionData.topik && (item.subtopic || item.subtopic_code || item.subtopic_id)) {
    const searchTerm = item.subtopic_code || item.subtopic || '';
    const subTopikOptions = await searchExamType(searchTerm, 3, questionData.topik.value);
    questionData.subTopikOptions = subTopikOptions;
    
    if (subTopikOptions.length > 0) {
      let match: SelectOption | undefined;
      
      // Try to match by subtopic_id first (most reliable)
      if (item.subtopic_id) {
        match = subTopikOptions.find((opt: SelectOption) => 
          opt.value === item.subtopic_id
        );
      }
      
      // Then try by code
      if (!match && item.subtopic_code) {
        match = subTopikOptions.find((opt: SelectOption) => 
          opt.code?.toLowerCase() === item.subtopic_code?.toLowerCase()
        );
      }
      
      // Finally use first result
      if (!match && subTopikOptions.length > 0) {
        match = subTopikOptions[0];
        warnings.push(`Soal #${index + 1}: Subtopik "${searchTerm}" tidak ditemukan exact match, menggunakan: ${match.label}`);
      }
      
      if (match) {
        questionData.subTopik = match;
      }
    } else {
      errors.push(`Soal #${index + 1}: Subtopik "${searchTerm}" tidak ditemukan`);
    }
  } else if (!questionData.topik) {
    errors.push(`Soal #${index + 1}: Tidak dapat mencari Subtopik karena Topik tidak ditemukan`);
  } else {
    errors.push(`Soal #${index + 1}: Subtopik tidak ada di JSON`);
  }
  
  // Try to find passage if needed
  if (item.passageTitle) {
    const passage = await searchPassageByTitle(item.passageTitle);
    
    if (passage) {
      questionData.passage = passage;
      questionData.passageSearchResults = [passage];
    } else {
      errors.push(`Soal #${index + 1}: Bacaan "${item.passageTitle}" tidak ditemukan`);
      warnings.push(`Soal #${index + 1}: Anda perlu membuat bacaan baru atau memilih bacaan lain`);
    }
  }
  
  // Validate completeness
  const isComplete = (
    questionData.bidang !== null &&
    questionData.topik !== null &&
    questionData.subTopik !== null &&
    questionData.level !== null &&
    questionData.questionText &&
    questionData.questionText !== '<p>Mulai mengetik soal di sini...</p>' &&
    (!questionData.hasPassage || questionData.passage !== null) &&
    (
      (questionData.questionType === 'single-choice' || questionData.questionType === 'multiple-choice') 
        ? (questionData.options.length > 0 && questionData.correctAnswer.length > 0)
        : (questionData.questionType === 'true-false')
          ? (questionData.statements.length > 0 && questionData.correctAnswer.length > 0)
          : (questionData.answer && questionData.answer.trim() !== '')
    )
  );
  
  if (!isComplete) {
    if (!questionData.bidang) errors.push(`Soal #${index + 1}: Bidang belum lengkap`);
    if (!questionData.topik) errors.push(`Soal #${index + 1}: Topik belum lengkap`);
    if (!questionData.subTopik) errors.push(`Soal #${index + 1}: Subtopik belum lengkap`);
    if (!questionData.level) errors.push(`Soal #${index + 1}: Level belum diisi`);
    if (!questionData.questionText || questionData.questionText === '<p>Mulai mengetik soal di sini...</p>') {
      errors.push(`Soal #${index + 1}: Teks soal belum diisi`);
    }
    if (questionData.hasPassage && !questionData.passage) {
      errors.push(`Soal #${index + 1}: Bacaan belum dipilih atau dibuat`);
    }
  }
  
  return {
    data: questionData,
    errors,
    warnings,
    isComplete
  };
};

/**
 * Main function to process bulk import
 */
export const processBulkImport = async (
  jsonData: ImportedQuestion[]
): Promise<ImportResult> => {
  const results: ProcessedQuestion[] = [];
  const allErrors: string[] = [];
  
  for (let i = 0; i < jsonData.length; i++) {
    const result = await processImportedQuestion(jsonData[i], i);
    results.push(result);
    
    // Collect all errors
    allErrors.push(...result.errors);
  }
  
  const completeQuestions = results.filter(r => r.isComplete).length;
  const incompleteQuestions = results.filter(r => !r.isComplete).length;
  
  return {
    questions: results,
    totalQuestions: jsonData.length,
    completeQuestions,
    incompleteQuestions,
    errors: allErrors
  };
};

/**
 * Validate JSON structure
 */
export const validateImportJSON = (data: any): { valid: boolean; error?: string } => {
  if (!Array.isArray(data)) {
    return { valid: false, error: 'JSON harus berupa array' };
  }
  
  if (data.length === 0) {
    return { valid: false, error: 'Array tidak boleh kosong' };
  }
  
  // Validate each item has required fields
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    
    // Check if it's a passage object
    const isPassage = item.passageTitle && item.passageText;
    
    // If not a passage, it must be a question
    if (!isPassage) {
      if (!item.questionText && !item.question) {
        return { valid: false, error: `Item #${i + 1}: questionText atau question harus ada (atau passageTitle + passageText untuk bacaan)` };
      }
      
      if (!item.questionType && !item.type) {
        return { valid: false, error: `Item #${i + 1}: questionType atau type harus ada` };
      }
    }
  }
  
  return { valid: true };
};