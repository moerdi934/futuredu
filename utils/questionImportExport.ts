// utils/questionImportExport.ts

import { QuestionJSON, BulkQuestionImportJSON } from '../types/questionImportExport';
import { transformKatexToEquationTags, transformEquationsToKatex } from './questionTransform';

/**
 * Export single question to JSON
 */
export const exportQuestionToJSON = (questionData: any): QuestionJSON => {
  // Transform content - convert KaTeX to equation tags
  const transformedQuestionText = transformKatexToEquationTags(questionData.questionText || '');
  const transformedExplanation = questionData.hasExplanation 
    ? transformKatexToEquationTags(questionData.explanationContent || '') 
    : '';
  
  // Transform options
  const transformedOptions = questionData.options?.map((opt: string) => 
    transformKatexToEquationTags(opt)
  ) || [];
  
  // Transform statements
  const transformedStatements = questionData.statements?.map((stmt: string) => 
    transformKatexToEquationTags(stmt)
  ) || [];
  
  const json: QuestionJSON = {
    version: '1.0',
    questionType: questionData.questionType,
    level: questionData.level,
    questionText: transformedQuestionText,
    hasExplanation: questionData.hasExplanation,
    explanationContent: transformedExplanation,
    hasPassage: questionData.hasPassage,
    
    // Metadata - akan null di export, harus diisi manual saat import
    bidang: questionData.bidang ? {
      label: questionData.bidang.label,
      value: questionData.bidang.value
    } : null,
    topik: questionData.topik ? {
      label: questionData.topik.label,
      value: questionData.topik.value
    } : null,
    subTopik: questionData.subTopik ? {
      label: questionData.subTopik.label,
      value: questionData.subTopik.value
    } : null,
    passage: questionData.passage ? {
      id: questionData.passage.id,
      title: questionData.passage.title,
      content: transformKatexToEquationTags(questionData.passage.content || '')
    } : null
  };
  
  // Add type-specific fields
  if (questionData.questionType === 'single-choice' || questionData.questionType === 'multiple-choice') {
    json.options = transformedOptions;
    json.correctAnswer = questionData.correctAnswer;
  } else if (questionData.questionType === 'true-false') {
    json.statements = transformedStatements;
    json.correctAnswer = questionData.correctAnswer;
  } else {
    json.answer = questionData.answer;
  }
  
  return json;
};

/**
 * Import question from JSON and transform to QuestionData
 */
export const importQuestionFromJSON = (json: QuestionJSON): any => {
  // Transform equation tags to KaTeX HTML
  const questionText = transformEquationsToKatex(json.questionText || '');
  const explanationContent = json.hasExplanation 
    ? transformEquationsToKatex(json.explanationContent || '') 
    : '';
  
  // Transform options
  const options = json.options?.map((opt: string) => 
    transformEquationsToKatex(opt)
  ) || [''];
  
  // Transform statements
  const statements = json.statements?.map((stmt: string) => 
    transformEquationsToKatex(stmt)
  ) || [''];
  
  const questionData = {
    bidang: json.bidang || null,
    topik: json.topik || null,
    subTopik: json.subTopik || null,
    bidangOptions: [],
    topikOptions: [],
    subTopikOptions: [],
    isLoadingBidang: false,
    isLoadingTopik: false,
    isLoadingSubTopik: false,
    level: json.level,
    hasPassage: json.hasPassage,
    createNewPassage: false,
    passage: json.passage || null,
    passageSearchResults: [],
    isLoadingPassage: false,
    passageSearchTerm: '',
    newPassageTitle: '',
    newPassageContent: '',
    showPassageModal: false,
    questionType: json.questionType,
    options: options,
    correctAnswer: json.correctAnswer || [],
    statements: statements,
    answer: json.answer || '',
    questionText: questionText,
    hasExplanation: json.hasExplanation,
    explanationContent: explanationContent,
    bidangSearchTerm: '',
    topikSearchTerm: '',
    subTopikSearchTerm: ''
  };
  
  return questionData;
};

/**
 * Download JSON file
 */
export const downloadJSON = (data: any, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export bulk questions to JSON
 */
export const exportBulkQuestionsToJSON = (questions: any[]): BulkQuestionImportJSON => {
  return {
    version: '1.0',
    questions: questions.map(q => exportQuestionToJSON(q)),
    metadata: {
      createdAt: new Date().toISOString(),
      totalQuestions: questions.length
    }
  };
};