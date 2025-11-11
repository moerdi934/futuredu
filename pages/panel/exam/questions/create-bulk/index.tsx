// pages/panel/exam/questions/create-bulk/index.tsx
'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../../../../components/layout/DashboardLayout';
import {
  Plus,
  BookOpen,
  FileText,
  Check,
  X,
  Bookmark,
  Trash2,
  ChevronDown,
  ChevronUp,
  Download,
  RotateCcw,
  Zap,
  Target,
  Award,
  Upload,
  FileJson,
  AlertCircle,
  Calendar,
  Eye,
  EyeOff,
  Clock,
} from 'lucide-react';
import axios from 'axios';
import SuperEditor from '../../../../../components/supereditor/SuperEditor';
import { useAuth } from '../../../../../context/AuthContext';
import {
  SearchSingleField,
  SelectCustomField,
  ShortFormField,
  YesNoField,
  SelectOption
} from '../../../../../components/form/FormComponentLayout';
import { LearningModal, ModalButton } from '../../../../../components/modal/ModalTemplate';
import { ButtonGradient } from '../../../../../components/button/ButtonTemplate';
import CreateBulkModal from './CreateBulkModal';
import {
  processBulkImport,
  validateImportJSON,
  ImportResult,
  ImportedQuestion
} from '../../../../../utils/bulkQuestionImport';
import { ImportResultModal } from '../../../../../components/modal/ImportResultModal';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const questionTypeOptions = [
  { label: 'Single Choice', value: 'single-choice' },
  { label: 'Multiple Choice', value: 'multiple-choice' },
  { label: 'True/False', value: 'true-false' },
  { label: 'Number', value: 'number' },
  { label: 'Text', value: 'text' },
];

const levelOptions = [
  { label: '1 - Core', value: 1 },
  { label: '2 - Intermediate', value: 2 },
  { label: '3 - Advanced', value: 3 },
  { label: '4 - Pro', value: 4 },
  { label: '5 - Expert', value: 5 },
];

interface QuestionData {
  bidang: SelectOption | null;
  topik: SelectOption | null;
  subTopik: SelectOption | null;
  bidangOptions: SelectOption[];
  topikOptions: SelectOption[];
  subTopikOptions: SelectOption[];
  isLoadingBidang: boolean;
  isLoadingTopik: boolean;
  isLoadingSubTopik: boolean;
  level: number | null;
  hasPassage: boolean;
  createNewPassage: boolean;
  passage: any | null;
  passageSearchResults: any[];
  isLoadingPassage: boolean;
  newPassageTitle: string;
  newPassageContent: string;
  showPassageModal: boolean;
  importPassageMode: boolean;
  passageJsonInput: string;
  passageImportError: string;
  questionType: string;
  options: string[];
  correctAnswer: number[];
  statements: string[];
  answer: string;
  questionText: string;
  hasExplanation: boolean;
  explanationContent: string;
}

const initialQuestionData: QuestionData = {
  bidang: null,
  topik: null,
  subTopik: null,
  bidangOptions: [],
  topikOptions: [],
  subTopikOptions: [],
  isLoadingBidang: false,
  isLoadingTopik: false,
  isLoadingSubTopik: false,
  level: null,
  hasPassage: false,
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
  questionType: 'single-choice',
  options: [''],
  correctAnswer: [],
  statements: [''],
  answer: '',
  questionText: '',
  hasExplanation: false,
  explanationContent: '',
};

// Custom Accordion Component
const CustomAccordionItem: React.FC<{
  eventKey: string;
  activeKey: string | null;
  onToggle: (key: string | null) => void;
  children: React.ReactNode;
  header: React.ReactNode;
}> = ({ eventKey, activeKey, onToggle, children, header }) => {
  const isOpen = activeKey === eventKey;

  const handleToggle = () => {
    onToggle(isOpen ? null : eventKey);
  };

  return (
    <div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-purple-200" style={{ overflow: 'visible' }}>
      <div 
        className="tw-cursor-pointer tw-select-none"
        onClick={handleToggle}
      >
        {header}
      </div>
      
      <div 
        className={`tw-transition-all tw-duration-300 tw-ease-in-out ${
          isOpen 
            ? 'tw-max-h-none tw-opacity-100' 
            : 'tw-max-h-0 tw-opacity-0 tw-overflow-hidden'
        }`}
        style={{
          overflow: isOpen ? 'visible' : 'hidden',
          position: 'relative',
          zIndex: isOpen ? 10 : 1
        }}
      >
        <div 
          className="tw-bg-gray-50 tw-p-2 sm:tw-p-4 tw-rounded-b-lg"
          style={{
            display: isOpen ? 'block' : 'none',
            overflow: 'visible',
            position: 'relative',
            zIndex: 10
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

// Helper functions
const parseEquationTags = (content: string): string => {
  if (!content) return content;
  
  return content.replace(/<equation>([\s\S]*?)<\/equation>/g, (match, latex) => {
    try {
      const isMultiline = /\\begin\{(align|gather|equation|eqnarray)/.test(latex);
      
      const rendered = katex.renderToString(latex.trim(), {
        displayMode: isMultiline,
        throwOnError: false
      });

      const containerTag = isMultiline ? 'div' : 'span';
      return `<${containerTag} class="cte-katex-equation ${isMultiline ? 'cte-katex-block' : 'cte-katex-inline'}" data-latex="${encodeURIComponent(latex.trim())}" data-display-mode="${isMultiline}" data-editable="true">${rendered}</${containerTag}>`;
    } catch (error) {
      console.error('Error parsing equation:', error);
      return match;
    }
  });
};

const parseTableMarkup = (content: string): string => {
  if (!content) return content;
  return content;
};

const normalizeParagraphSpacing = (content: string): string => {
  if (!content) return content;
  
  let normalized = content.replace(/\n\n+/g, '\n');
  normalized = normalized.replace(/<p>/g, '<p style="margin-bottom: 1em;">');
  normalized = normalized.replace(/<p\s+style="([^"]*)"/g, (match, existingStyle) => {
    if (existingStyle.includes('margin-bottom')) {
      return match;
    }
    return `<p style="${existingStyle}; margin-bottom: 1em;"`;
  });
  
  return normalized;
};

const processContent = (content: string): string => {
  if (!content) return content;
  
  let processed = parseEquationTags(content);
  processed = parseTableMarkup(processed);
  processed = normalizeParagraphSpacing(processed);
  
  return processed;
};

// Bulk Question Item Component
const BulkQuestionItem: React.FC<{
  index: number;
  data: QuestionData;
  onChange: (index: number, data: QuestionData) => void;
  onRemove: (index: number) => void;
  onInsertAfter: (index: number, questions: QuestionData[]) => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ index, data, onChange, onRemove, onInsertAfter, isOpen, onToggle }) => {
  const { id } = useAuth();
  const userId = id || null;
  
  const [showIndividualImport, setShowIndividualImport] = useState(false);
  const [individualJsonInput, setIndividualJsonInput] = useState('');
  const [individualImportError, setIndividualImportError] = useState('');
  
  const latestDataRef = useRef(data);
  
  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);
  
  const bidangSearchTimeout = useRef<NodeJS.Timeout>();
  const topikSearchTimeout = useRef<NodeJS.Timeout>();
  const subTopikSearchTimeout = useRef<NodeJS.Timeout>();
  const passageSearchTimeout = useRef<NodeJS.Timeout>();
  
  const hasInitiallyFetchedBidang = useRef(false);
  const hasInitiallyFetchedTopik = useRef(false);
  const hasInitiallyFetchedSubTopik = useRef(false);
  const hasInitiallyFetchedPassage = useRef(false);
  
  const isFetchingBidang = useRef(false);
  const isFetchingTopik = useRef(false);
  const isFetchingSubTopik = useRef(false);
  const isFetchingPassage = useRef(false);
  
  const lastTopikValue = useRef<any>(null);
  
  const lastBidangSearch = useRef<string>('');
  const lastTopikSearch = useRef<string>('');
  const lastSubTopikSearch = useRef<string>('');

  // Fetch Bidang on mount
  useEffect(() => {
    if (hasInitiallyFetchedBidang.current) return;
    hasInitiallyFetchedBidang.current = true;

    const controller = new AbortController();
    
    const fetchBidang = async () => {
      if (isFetchingBidang.current) return;
      isFetchingBidang.current = true;
      
      onChange(index, { ...latestDataRef.current, isLoadingBidang: true });
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=&kind=1`,
          { signal: controller.signal }
        );
        
        if (response.data && Array.isArray(response.data.examTypes)) {
          const formattedOptions = response.data.examTypes.map((exam: any) => ({
            label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
            value: exam.id,
            code: exam.code,
          }));
          
          onChange(index, {
            ...latestDataRef.current,
            bidangOptions: formattedOptions,
            isLoadingBidang: false,
          });
        } else {
          onChange(index, { ...latestDataRef.current, bidangOptions: [], isLoadingBidang: false });
        }
      } catch (error: any) {
        if (!axios.isCancel(error)) {
          onChange(index, { ...latestDataRef.current, bidangOptions: [], isLoadingBidang: false });
        }
      } finally {
        isFetchingBidang.current = false;
      }
    };

    fetchBidang();
    
    return () => {
      controller.abort();
      isFetchingBidang.current = false;
    };
  }, []);

  const handleBidangSearch = (searchTerm: string) => {
    if (searchTerm === lastBidangSearch.current) return;
    if (!searchTerm.trim() && data.bidangOptions.length > 0) return;
    
    lastBidangSearch.current = searchTerm;
    
    if (bidangSearchTimeout.current) {
      clearTimeout(bidangSearchTimeout.current);
    }
    
    onChange(index, { ...latestDataRef.current, isLoadingBidang: true });
    
    bidangSearchTimeout.current = setTimeout(async () => {
      const controller = new AbortController();
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=${searchTerm}&kind=1`,
          { signal: controller.signal }
        );
        
        if (response.data && Array.isArray(response.data.examTypes)) {
          const formattedOptions = response.data.examTypes.map((exam: any) => ({
            label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
            value: exam.id,
            code: exam.code,
          }));
          
          onChange(index, {
            ...latestDataRef.current,
            bidangOptions: formattedOptions,
            isLoadingBidang: false,
          });
        } else {
          onChange(index, { ...latestDataRef.current, bidangOptions: [], isLoadingBidang: false });
        }
      } catch (error: any) {
        if (!axios.isCancel(error)) {
          onChange(index, { ...latestDataRef.current, bidangOptions: [], isLoadingBidang: false });
        }
      }
    }, 300);
  };

  // Fetch Topik when Bidang changes
  useEffect(() => {
    if (!data.bidang) {
      hasInitiallyFetchedTopik.current = false;
      isFetchingTopik.current = false;
      lastTopikSearch.current = '';
      return;
    }

    if (isFetchingTopik.current) return;

    const controller = new AbortController();

    const fetchTopik = async () => {
      isFetchingTopik.current = true;
      onChange(index, { ...latestDataRef.current, isLoadingTopik: true });
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=&kind=2&masterId=${data.bidang.value}`,
          { signal: controller.signal }
        );
        
        if (response.data && Array.isArray(response.data.examTypes)) {
          const formattedOptions = response.data.examTypes.map((exam: any) => ({
            label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
            value: exam.id,
            code: exam.code,
          }));
          
          onChange(index, {
            ...latestDataRef.current,
            topikOptions: formattedOptions,
            isLoadingTopik: false,
          });
        } else {
          onChange(index, { ...latestDataRef.current, topikOptions: [], isLoadingTopik: false });
        }
      } catch (error: any) {
        if (!axios.isCancel(error)) {
          onChange(index, { ...latestDataRef.current, topikOptions: [], isLoadingTopik: false });
        }
      } finally {
        isFetchingTopik.current = false;
      }
    };

    if (!hasInitiallyFetchedTopik.current) {
      hasInitiallyFetchedTopik.current = true;
      fetchTopik();
    }
    
    return () => {
      controller.abort();
      isFetchingTopik.current = false;
    };
  }, [data.bidang?.value]);

  const handleTopikSearch = (searchTerm: string) => {
    if (!data.bidang) return;
    if (searchTerm === lastTopikSearch.current) return;
    if (!searchTerm.trim() && data.topikOptions.length > 0) return;
    
    lastTopikSearch.current = searchTerm;
    
    if (topikSearchTimeout.current) {
      clearTimeout(topikSearchTimeout.current);
    }
    
    onChange(index, { ...latestDataRef.current, isLoadingTopik: true });
    
    topikSearchTimeout.current = setTimeout(async () => {
      const controller = new AbortController();
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=${searchTerm}&kind=2&masterId=${latestDataRef.current.bidang.value}`,
          { signal: controller.signal }
        );
        
        if (response.data && Array.isArray(response.data.examTypes)) {
          const formattedOptions = response.data.examTypes.map((exam: any) => ({
            label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
            value: exam.id,
            code: exam.code,
          }));
          
          onChange(index, {
            ...latestDataRef.current,
            topikOptions: formattedOptions,
            isLoadingTopik: false,
          });
        } else {
          onChange(index, { ...latestDataRef.current, topikOptions: [], isLoadingTopik: false });
        }
      } catch (error: any) {
        if (!axios.isCancel(error)) {
          onChange(index, { ...latestDataRef.current, topikOptions: [], isLoadingTopik: false });
        }
      }
    }, 300);
  };

  // Fetch SubTopik when Topik changes
  useEffect(() => {
    if (!data.topik) {
      hasInitiallyFetchedSubTopik.current = false;
      isFetchingSubTopik.current = false;
      lastTopikValue.current = null;
      lastSubTopikSearch.current = '';
      return;
    }

    const topikChanged = lastTopikValue.current !== data.topik.value;
    lastTopikValue.current = data.topik.value;

    if (!topikChanged && hasInitiallyFetchedSubTopik.current) return;
    if (isFetchingSubTopik.current) return;

    const controller = new AbortController();

    const fetchSubTopik = async () => {
      isFetchingSubTopik.current = true;
      onChange(index, { ...latestDataRef.current, isLoadingSubTopik: true });
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=&kind=3&masterId=${data.topik.value}`,
          { signal: controller.signal }
        );
        
        if (response.data && Array.isArray(response.data.examTypes)) {
          const formattedOptions = response.data.examTypes.map((exam: any) => ({
            label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
            value: exam.id,
            NextID: exam.NextID,
            code: exam.code,
          }));
          
          onChange(index, {
            ...latestDataRef.current,
            subTopikOptions: formattedOptions,
            isLoadingSubTopik: false,
            subTopik: topikChanged ? null : latestDataRef.current.subTopik,
          });
        } else {
          onChange(index, { 
            ...latestDataRef.current, 
            subTopikOptions: [], 
            isLoadingSubTopik: false,
            subTopik: topikChanged ? null : latestDataRef.current.subTopik,
          });
        }
      } catch (error: any) {
        if (!axios.isCancel(error)) {
          onChange(index, { 
            ...latestDataRef.current, 
            subTopikOptions: [], 
            isLoadingSubTopik: false,
            subTopik: topikChanged ? null : latestDataRef.current.subTopik,
          });
        }
      } finally {
        isFetchingSubTopik.current = false;
      }
    };

    if (!hasInitiallyFetchedSubTopik.current || topikChanged) {
      hasInitiallyFetchedSubTopik.current = true;
      fetchSubTopik();
    }
    
    return () => {
      controller.abort();
      isFetchingSubTopik.current = false;
    };
  }, [data.topik?.value]);

  const handleSubTopikSearch = (searchTerm: string) => {
    if (!data.topik) return;
    if (searchTerm === lastSubTopikSearch.current) return;
    if (!searchTerm.trim() && data.subTopikOptions.length > 0) return;
    
    lastSubTopikSearch.current = searchTerm;
    
    if (subTopikSearchTimeout.current) {
      clearTimeout(subTopikSearchTimeout.current);
    }
    
    onChange(index, { ...latestDataRef.current, isLoadingSubTopik: true });
    
    subTopikSearchTimeout.current = setTimeout(async () => {
      const controller = new AbortController();
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=${searchTerm}&kind=3&masterId=${latestDataRef.current.topik.value}`,
          { signal: controller.signal }
        );
        
        if (response.data && Array.isArray(response.data.examTypes)) {
          const formattedOptions = response.data.examTypes.map((exam: any) => ({
            label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
            value: exam.id,
            NextID: exam.NextID,
            code: exam.code,
          }));
          
          onChange(index, {
            ...latestDataRef.current,
            subTopikOptions: formattedOptions,
            isLoadingSubTopik: false,
          });
        } else {
          onChange(index, { 
            ...latestDataRef.current, 
            subTopikOptions: [], 
            isLoadingSubTopik: false,
          });
        }
      } catch (error: any) {
        if (!axios.isCancel(error)) {
          onChange(index, { 
            ...latestDataRef.current, 
            subTopikOptions: [], 
            isLoadingSubTopik: false,
          });
        }
      }
    }, 300);
  };

  // Fetch Passages when hasPassage changes
  useEffect(() => {
    if (!data.hasPassage) {
      hasInitiallyFetchedPassage.current = false;
      isFetchingPassage.current = false;
      return;
    }

    if (isFetchingPassage.current) return;

    const controller = new AbortController();

    const fetchPassages = async () => {
      isFetchingPassage.current = true;
      onChange(index, { ...latestDataRef.current, isLoadingPassage: true });
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/questions/passage/search?search=`,
          { signal: controller.signal }
        );
        
        if (response.data && Array.isArray(response.data)) {
          onChange(index, {
            ...latestDataRef.current,
            passageSearchResults: response.data,
            isLoadingPassage: false,
          });
        } else {
          onChange(index, { ...latestDataRef.current, passageSearchResults: [], isLoadingPassage: false });
        }
      } catch (error: any) {
        if (!axios.isCancel(error)) {
          onChange(index, { ...latestDataRef.current, passageSearchResults: [], isLoadingPassage: false });
        }
      } finally {
        isFetchingPassage.current = false;
      }
    };

    if (!hasInitiallyFetchedPassage.current) {
      hasInitiallyFetchedPassage.current = true;
      fetchPassages();
    }
    
    return () => {
      controller.abort();
      isFetchingPassage.current = false;
    };
  }, [data.hasPassage]);

  const handlePassageSearch = (searchTerm: string) => {
    if (!data.hasPassage) return;
    
    if (passageSearchTimeout.current) {
      clearTimeout(passageSearchTimeout.current);
    }
    
    onChange(index, { ...latestDataRef.current, isLoadingPassage: true });
    
    passageSearchTimeout.current = setTimeout(async () => {
      const controller = new AbortController();
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/questions/passage/search?search=${searchTerm}`,
          { signal: controller.signal }
        );
        
        if (response.data && Array.isArray(response.data)) {
          onChange(index, {
            ...latestDataRef.current,
            passageSearchResults: response.data,
            isLoadingPassage: false,
          });
        } else {
          onChange(index, { ...latestDataRef.current, passageSearchResults: [], isLoadingPassage: false });
        }
      } catch (error: any) {
        if (!axios.isCancel(error)) {
          onChange(index, { ...latestDataRef.current, passageSearchResults: [], isLoadingPassage: false });
        }
      }
    }, 500);
  };

  const handleImportPassage = () => {
    try {
      onChange(index, {
        ...latestDataRef.current,
        passageImportError: '',
      });
      
      const parsedData = JSON.parse(data.passageJsonInput);
      
      if (!parsedData.passageTitle || !parsedData.passageText) {
        throw new Error('Format JSON harus memiliki "passageTitle" dan "passageText"');
      }
      
      const processedPassageText = processContent(parsedData.passageText);
      
      onChange(index, {
        ...latestDataRef.current,
        newPassageTitle: parsedData.passageTitle,
        newPassageContent: processedPassageText,
        importPassageMode: false,
        passageJsonInput: '',
        passageImportError: '',
      });
      
      alert('Berhasil mengimport data bacaan! Silakan review dan simpan.');
    } catch (error: any) {
      onChange(index, {
        ...latestDataRef.current,
        passageImportError: `Error: ${error.message || 'Format JSON tidak valid'}`,
      });
    }
  };

  const createPassage = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/passage`,
        {
          title: data.newPassageTitle,
          passage: data.newPassageContent,
          create_user_id: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      
      onChange(index, {
        ...latestDataRef.current,
        passage: {
          id: response.data.id,
          title: data.newPassageTitle,
          passage: data.newPassageContent,
        },
        newPassageTitle: '',
        newPassageContent: '',
        showPassageModal: false,
        createNewPassage: false,
      });
    } catch (error) {
      console.error('Error creating passage:', error);
      alert('Gagal membuat bacaan baru. Silakan coba lagi.');
    }
  };

  const passageModalButtons: ModalButton[] = [
    {
      action: 'cancel',
      text: 'Batal',
      onClick: () => {
        onChange(index, {
          ...latestDataRef.current,
          showPassageModal: false,
          createNewPassage: false,
          importPassageMode: false,
          passageJsonInput: '',
          passageImportError: '',
        });
      },
    },
    {
      action: 'save',
      text: 'Simpan Bacaan',
      onClick: createPassage,
    },
  ];

  const handleIndividualImport = () => {
    try {
      setIndividualImportError('');
      
      const parsedData = JSON.parse(individualJsonInput);
      
      if (Array.isArray(parsedData)) {
        const importedQuestions: QuestionData[] = parsedData.map((item: any) => {
          const processedQuestionText = processContent(item.questionText || item.question || '');
          const processedOptions = (item.options || ['']).map((opt: string) => processContent(opt));
          const processedExplanation = processContent(item.explanation || item.explanationContent || '');
          
          return {
            ...initialQuestionData,
            bidang: null,
            topik: null,
            subTopik: null,
            level: item.level || null,
            hasPassage: false,
            questionType: item.questionType || item.type || 'single-choice',
            questionText: processedQuestionText,
            options: processedOptions,
            correctAnswer: item.correctAnswer || item.correct || [],
            statements: item.statements || [''],
            answer: item.answer || '',
            hasExplanation: !!(item.explanation || item.explanationContent),
            explanationContent: processedExplanation,
          };
        });
        
        onInsertAfter(index, importedQuestions);
        setShowIndividualImport(false);
        setIndividualJsonInput('');
        alert(`Berhasil menambahkan ${importedQuestions.length} soal setelah soal #${index + 1}!`);
      } else {
        const processedQuestionText = processContent(parsedData.questionText || parsedData.question || '');
        const processedOptions = (parsedData.options || ['']).map((opt: string) => processContent(opt));
        const processedExplanation = processContent(parsedData.explanation || parsedData.explanationContent || '');
        
        const importedQuestion: QuestionData = {
          ...latestDataRef.current,
          level: parsedData.level || data.level,
          questionType: parsedData.questionType || parsedData.type || data.questionType,
          questionText: processedQuestionText,
          options: processedOptions,
          correctAnswer: parsedData.correctAnswer || parsedData.correct || [],
          statements: parsedData.statements || [''],
          answer: parsedData.answer || '',
          hasExplanation: !!(parsedData.explanation || parsedData.explanationContent),
          explanationContent: processedExplanation,
        };
        
        onChange(index, importedQuestion);
        setShowIndividualImport(false);
        setIndividualJsonInput('');
        alert(`Berhasil mengimport data ke soal #${index + 1}!`);
      }
    } catch (error: any) {
      setIndividualImportError(`Error: ${error.message || 'Format JSON tidak valid'}`);
    }
  };

  const individualImportButtons: ModalButton[] = [
    {
      action: 'cancel',
      text: 'Batal',
      onClick: () => {
        setShowIndividualImport(false);
        setIndividualJsonInput('');
        setIndividualImportError('');
      },
    },
    {
      action: 'save',
      text: 'Import',
      onClick: handleIndividualImport,
    },
  ];

  useEffect(() => {
    return () => {
      if (bidangSearchTimeout.current) clearTimeout(bidangSearchTimeout.current);
      if (topikSearchTimeout.current) clearTimeout(topikSearchTimeout.current);
      if (subTopikSearchTimeout.current) clearTimeout(subTopikSearchTimeout.current);
      if (passageSearchTimeout.current) clearTimeout(passageSearchTimeout.current);
    };
  }, []);

  return (
    <>
      <CustomAccordionItem
        eventKey={String(index)}
        activeKey={isOpen ? String(index) : null}
        onToggle={() => onToggle()}
        header={
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-p-3 sm:tw-p-6 tw-gap-3 sm:tw-gap-0">
            <div className="tw-flex tw-items-center tw-gap-3 tw-min-w-0 tw-flex-1">
              <div className="tw-bg-purple-100 tw-p-2 sm:tw-p-3 tw-rounded-lg sm:tw-rounded-xl tw-flex-shrink-0">
                <Target className="tw-w-4 tw-h-4 sm:tw-w-5 sm:tw-h-5 tw-text-purple-600" />
              </div>
              <div className="tw-min-w-0 tw-flex-1">
                <h3 className="tw-text-base sm:tw-text-lg tw-font-bold tw-text-purple-800 tw-break-words">
                  Soal #{index + 1}
                </h3>
                <p className="tw-text-xs sm:tw-text-sm tw-text-gray-600 tw-break-words">
                  {data.questionType
                    ? questionTypeOptions.find((opt) => opt.value === data.questionType)?.label
                    : 'Belum diatur'}
                  {data.level && ` • Level ${data.level}`}
                </p>
              </div>
            </div>

            <div className="tw-flex tw-gap-2 sm:tw-gap-3 tw-w-full sm:tw-w-auto tw-flex-shrink-0">
              <ButtonGradient
                action="custom"
                customText="Import"
                customIcon={<Upload className="tw-w-4 tw-h-4" />}
                customColors={{
                  primary: '#8B5CF6',
                  secondary: '#7C3AED',
                  gradient1: '#8B5CF6',
                  gradient2: '#A78BFA',
                  text: '#FFFFFF'
                }}
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowIndividualImport(true);
                }}
                className="tw-flex-1 sm:tw-flex-none"
              />

              <ButtonGradient
                action="custom"
                customText={isOpen ? 'Tutup' : 'Buka'}
                customIcon={
                  isOpen ? (
                    <ChevronUp className="tw-w-4 tw-h-4" />
                  ) : (
                    <ChevronDown className="tw-w-4 tw-h-4" />
                  )
                }
                customColors={{
                  primary: '#7C3AED',
                  secondary: '#6D28D9',
                  gradient1: '#7C3AED',
                  gradient2: '#A78BFA',
                  text: '#FFFFFF'
                }}
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="tw-flex-1 sm:tw-flex-none"
              />

              <ButtonGradient
                action="delete"
                customText="Hapus"
                customIcon={<Trash2 className="tw-w-4 tw-h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Yakin ingin menghapus soal ini?')) {
                    onRemove(index);
                  }
                }}
                size="md"
                className="tw-flex-1 sm:tw-flex-none"
              />
            </div>
          </div>
        }
      >
        <div className="tw-space-y-3 sm:tw-space-y-6 tw-w-full">
          <div 
            className="tw-mb-4 sm:tw-mb-6 tw-w-full"
            style={{ position: 'relative', zIndex: 300, overflow: 'visible' }}
          >
            <SearchSingleField
              label="Bidang"
              value={data.bidang}
              options={data.bidangOptions}
              onChange={(newValue) => {
                onChange(index, {
                  ...latestDataRef.current,
                  bidang: newValue,
                  topik: null,
                  subTopik: null,
                  topikOptions: [],
                  subTopikOptions: [],
                });
                lastTopikSearch.current = '';
                lastSubTopikSearch.current = '';
              }}
              onInputChange={handleBidangSearch}
              isLoading={data.isLoadingBidang}
              required
            />
          </div>

          <div 
            className="tw-mb-4 sm:tw-mb-6 tw-w-full"
            style={{ position: 'relative', zIndex: 200, overflow: 'visible' }}
          >
            <SearchSingleField
              label="Topik"
              value={data.topik}
              options={data.topikOptions}
              onChange={(newValue) => {
                onChange(index, {
                  ...latestDataRef.current,
                  topik: newValue,
                  subTopik: null,
                  subTopikOptions: [],
                });
                lastSubTopikSearch.current = '';
              }}
              onInputChange={handleTopikSearch}
              isLoading={data.isLoadingTopik}
              required
            />
          </div>

          <div 
            className="tw-mb-4 sm:tw-mb-6 tw-w-full"
            style={{ position: 'relative', zIndex: 150, overflow: 'visible' }}
          >
            <SearchSingleField
              label="Sub Topik"
              value={data.subTopik}
              options={data.subTopikOptions}
              onChange={(newValue) => {
                onChange(index, { ...latestDataRef.current, subTopik: newValue });
              }}
              onInputChange={handleSubTopikSearch}
              isLoading={data.isLoadingSubTopik}
              required
            />
          </div>

          <div className="tw-mb-4 sm:tw-mb-6 tw-w-full tw-min-w-0">
            <SelectCustomField
              label="Level"
              value={levelOptions.find((opt) => opt.value === data.level) || null}
              options={levelOptions}
              onChange={(newValue) => {
                onChange(index, { ...latestDataRef.current, level: newValue ? newValue.value : null });
              }}
              required
            />
          </div>

          <div 
            className="tw-mb-4 sm:tw-mb-6 tw-w-full"
            style={{ position: 'relative', zIndex: 100, overflow: 'visible' }}
          >
            <div className="tw-w-full tw-min-w-0">
              <YesNoField
                label="Ada Bacaan"
                checked={data.hasPassage}
                onChange={(checked) => {
                  onChange(index, {
                    ...latestDataRef.current,
                    hasPassage: checked,
                    passage: checked ? data.passage : null,
                    passageSearchResults: checked ? data.passageSearchResults : [],
                  });
                }}
                icon={<Bookmark size={16} />}
                color="tw-text-purple-700"
                selectedColor="tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-500 tw-text-white"
                yesText="Ya"
                noText="Tidak"
                variant="card"
                description="Apakah soal ini memerlukan bacaan?"
              />
            </div>
            
            {data.hasPassage && (
              <div 
                className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-3 sm:tw-p-4 tw-shadow-sm tw-mt-2 tw-w-full"
                style={{
                  position: 'relative',
                  zIndex: 1000,
                  overflow: 'visible'
                }}
              >
                <div className="tw-flex tw-flex-col sm:tw-flex-row tw-space-y-2 sm:tw-space-y-0 sm:tw-space-x-4 tw-mb-4">
                  <div className="tw-flex-1 tw-min-w-0">
                    <ButtonGradient
                      action={!data.createNewPassage ? 'apply' : 'custom'}
                      customText="Pilih Bacaan"
                      onClick={() => {
                        onChange(index, { ...latestDataRef.current, createNewPassage: false });
                      }}
                      size="md"
                      className="tw-w-full"
                    />
                  </div>
                  <div className="tw-flex-1 tw-min-w-0">
                    <ButtonGradient
                      action={data.createNewPassage ? 'apply' : 'custom'}
                      customText="Buat Baru"
                      onClick={() => {
                        onChange(index, {
                          ...latestDataRef.current,
                          createNewPassage: true,
                          showPassageModal: true,
                        });
                      }}
                      size="md"
                      className="tw-w-full"
                    />
                  </div>
                </div>
                
                {!data.createNewPassage ? (
                  <div 
                    className="tw-space-y-3 tw-w-full tw-min-w-0"
                    style={{
                      position: 'relative',
                      zIndex: 9999,
                      overflow: 'visible'
                    }}
                  >
                    <SearchSingleField
                      label="Cari Bacaan"
                      value={
                        data.passage
                          ? { label: data.passage.title, value: data.passage.id }
                          : null
                      }
                      options={data.passageSearchResults.map((p: any) => ({
                        label: p.title,
                        value: p.id,
                      }))}
                      onChange={(newValue) => {
                        const selected = data.passageSearchResults.find(
                          (p: any) => p.id === newValue?.value
                        );
                        onChange(index, { ...latestDataRef.current, passage: selected || null });
                      }}
                      onInputChange={handlePassageSearch}
                      isLoading={data.isLoadingPassage}
                      required
                    />
                    {data.passage && (
                      <div className="tw-mt-4 tw-w-full">
                        <div className="tw-text-purple-700 tw-font-medium tw-mb-2 tw-text-sm sm:tw-text-base">
                          Isi Bacaan:
                        </div>
                        <div
                          className="tw-bg-gray-50 tw-rounded-lg tw-p-3 tw-border tw-border-gray-200 tw-prose tw-max-w-none tw-max-h-32 tw-overflow-y-auto tw-text-sm tw-break-words"
                          dangerouslySetInnerHTML={{ __html: data.passage.passage }}
                        />
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="tw-mb-4 sm:tw-mb-6 tw-w-full tw-min-w-0">
            <SelectCustomField
              label="Tipe Soal"
              value={
                questionTypeOptions.find((opt) => opt.value === data.questionType) ||
                questionTypeOptions[0]
              }
              options={questionTypeOptions}
              onChange={(newValue) => {
                onChange(index, {
                  ...latestDataRef.current,
                  questionType: newValue?.value.toString() || 'single-choice',
                  options: [''],
                  correctAnswer: [],
                  statements: [''],
                  answer: '',
                });
              }}
              required
            />
          </div>

          <div className="tw-mb-4 sm:tw-mb-6 tw-w-full tw-min-w-0">
            <label className="tw-text-purple-700 tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-space-x-2 tw-text-sm sm:tw-text-base">
              <BookOpen className="tw-w-4 tw-h-4" />
              <span>
                Teks Soal <span className="tw-text-red-500">*</span>
              </span>
            </label>
            <div className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2 tw-shadow-sm tw-w-full">
              <SuperEditor
                onChange={(html) => {
                  onChange(index, { ...latestDataRef.current, questionText: html });
                }}
                initialValue={data.questionText || "<p>Mulai mengetik soal di sini...</p>"}
                editorId={`question-text-${index}`}
                height="120px"
              />
            </div>
          </div>

          {(data.questionType === 'single-choice' ||
            data.questionType === 'multiple-choice') && (
            <div className="tw-mb-4 sm:tw-mb-6 tw-w-full">
              <label className="tw-text-purple-700 tw-font-semibold tw-mb-4 tw-flex tw-items-center tw-space-x-2 tw-text-sm sm:tw-text-base">
                <div className="tw-bg-purple-100 tw-p-1 tw-rounded">
                  <Check className="tw-w-4 tw-h-4 tw-text-purple-600" />
                </div>
                <span>Opsi Jawaban</span>
              </label>
              <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-2 sm:tw-gap-4">
                {data.options.map((option: string, idx: number) => (
                  <div key={idx} className="tw-mb-3 sm:tw-mb-4">
                    <div className="tw-border-2 tw-border-purple-200 tw-rounded-lg tw-shadow-sm hover:tw-shadow-md tw-transition-all tw-duration-200 tw-p-3 sm:tw-p-4">
                      <div className="tw-flex tw-items-center tw-justify-between tw-mb-3 tw-flex-wrap tw-gap-2">
                        <div className="tw-flex tw-items-center tw-space-x-2">
                          <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-indigo-500 tw-text-white tw-w-6 tw-h-6 sm:tw-w-8 sm:tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-xs sm:tw-text-sm">
                            {optionLabels[idx]}
                          </div>
                          <span className="tw-text-purple-700 tw-font-medium tw-text-xs sm:tw-text-sm">
                            Opsi {optionLabels[idx]}
                          </span>
                        </div>
                        <div className="tw-flex-shrink-0">
                          <ButtonGradient
                            action="custom"
                            customText={
                              Array.isArray(data.correctAnswer) &&
                              data.correctAnswer.includes(idx)
                                ? 'Benar'
                                : 'Tandai'
                            }
                            customIcon={
                              Array.isArray(data.correctAnswer) &&
                              data.correctAnswer.includes(idx) ? <Check className="tw-w-3 tw-h-3 sm:tw-w-4 sm:tw-h-4" /> : undefined
                            }
                            customColors={
                              Array.isArray(data.correctAnswer) &&
                              data.correctAnswer.includes(idx) ? {
                                primary: '#10B981',
                                secondary: '#059669',
                                gradient1: '#10B981',
                                gradient2: '#34D399',
                                text: '#FFFFFF'
                              } : {
                                primary: '#6B7280',
                                secondary: '#4B5563',
                                gradient1: '#6B7280',
                                gradient2: '#9CA3AF',
                                text: '#FFFFFF'
                              }
                            }
                            size="sm"
                            onClick={() => {
                              let updatedCorrect;
                              if (data.questionType === 'single-choice') {
                                updatedCorrect = [idx];
                              } else {
                                if (
                                  Array.isArray(data.correctAnswer) &&
                                  data.correctAnswer.includes(idx)
                                ) {
                                  updatedCorrect = (data.correctAnswer as number[]).filter(
                                    (ans) => ans !== idx
                                  );
                                } else {
                                  updatedCorrect = [...(data.correctAnswer as number[]), idx];
                                }
                              }
                              onChange(index, { ...latestDataRef.current, correctAnswer: updatedCorrect });
                            }}
                          />
                        </div>
                      </div>
                      <div className="tw-bg-gray-50 tw-rounded-lg tw-border tw-border-gray-200 tw-w-full">
                        <SuperEditor
                          onChange={(html) => {
                            const newOptions = [...data.options];
                            newOptions[idx] = html;
                            onChange(index, { ...latestDataRef.current, options: newOptions });
                          }}
                          initialValue={option || "<p>Masukkan teks opsi...</p>"}
                          editorId={`option-${index}-${idx}`}
                          height="80px"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="tw-w-full tw-mt-4">
                <ButtonGradient
                  action="add"
                  customText="Tambah Opsi"
                  onClick={() => {
                    onChange(index, { ...latestDataRef.current, options: [...data.options, ''] });
                  }}
                  disabled={data.options.length >= optionLabels.length}
                  size="md"
                />
              </div>
            </div>
          )}

          {data.questionType === 'true-false' && (
            <div className="tw-mb-4 sm:tw-mb-6 tw-w-full">
              <label className="tw-text-purple-700 tw-font-semibold tw-mb-4 tw-flex tw-items-center tw-space-x-2 tw-text-sm sm:tw-text-base">
                <BookOpen className="tw-w-4 tw-h-4" />
                <span>Pernyataan</span>
              </label>
              <div className="tw-space-y-3 sm:tw-space-y-4">
                {data.statements.map((statement: string, idx: number) => (
                  <div
                    key={idx}
                    className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-3 sm:tw-p-4 tw-shadow-sm tw-w-full"
                  >
                    <div className="tw-flex tw-flex-col lg:tw-flex-row tw-gap-3 lg:tw-items-center">
                      <div className="tw-flex-1 tw-min-w-0">
                        <ShortFormField
                          label={`Pernyataan ${idx + 1}`}
                          value={statement}
                          onChange={(e) => {
                            const newStatements = [...data.statements];
                            newStatements[idx] = e.target.value;
                            onChange(index, { ...latestDataRef.current, statements: newStatements });
                          }}
                        />
                      </div>
                      <div className="tw-flex tw-space-x-2 tw-w-full lg:tw-w-auto tw-flex-shrink-0">
                        <div className="tw-flex-1 lg:tw-flex-none">
                          <ButtonGradient
                            action="custom"
                            customText="Benar"
                            size="sm"
                            customColors={
                              Array.isArray(data.correctAnswer) &&
                              (data.correctAnswer as boolean[])[idx] === true ? {
                                primary: '#10B981',
                                secondary: '#059669',
                                gradient1: '#10B981',
                                gradient2: '#34D399',
                                text: '#FFFFFF'
                              } : {
                                primary: '#6B7280',
                                secondary: '#4B5563',
                                gradient1: '#6B7280',
                                gradient2: '#9CA3AF',
                                text: '#FFFFFF'
                              }
                            }
                            onClick={() => {
                              const newCorrect = [...(data.correctAnswer as boolean[])];
                              newCorrect[idx] = true;
                              onChange(index, { ...latestDataRef.current, correctAnswer: newCorrect });
                            }}
                            className="tw-w-full"
                          />
                        </div>
                        <div className="tw-flex-1 lg:tw-flex-none">
                          <ButtonGradient
                            action="custom"
                            customText="Salah"
                            size="sm"
                            customColors={
                              Array.isArray(data.correctAnswer) &&
                              (data.correctAnswer as boolean[])[idx] === false ? {
                                primary: '#EF4444',
                                secondary: '#DC2626',
                                gradient1: '#EF4444',
                                gradient2: '#F87171',
                                text: '#FFFFFF'
                              } : {
                                primary: '#6B7280',
                                secondary: '#4B5563',
                                gradient1: '#6B7280',
                                gradient2: '#9CA3AF',
                                text: '#FFFFFF'
                              }
                            }
                            onClick={() => {
                              const newCorrect = [...(data.correctAnswer as boolean[])];
                              newCorrect[idx] = false;
                              onChange(index, { ...latestDataRef.current, correctAnswer: newCorrect });
                            }}
                            className="tw-w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="tw-mt-4 sm:tw-mt-6 tw-w-full">
                <ButtonGradient
                  action="add"
                  customText="Tambah Pernyataan"
                  onClick={() => {
                    onChange(index, {
                      ...latestDataRef.current,
                      statements: [...data.statements, ''],
                      correctAnswer: [...(data.correctAnswer as boolean[]), false],
                    });
                  }}
                  size="md"
                />
              </div>
            </div>
          )}

          {(data.questionType === 'number' || data.questionType === 'text') && (
            <div className="tw-mb-4 sm:tw-mb-6 tw-w-full tw-min-w-0">
              <ShortFormField
                label="Jawaban Benar"
                value={data.answer}
                onChange={(e) => {
                  onChange(index, { ...latestDataRef.current, answer: e.target.value });
                }}
                required
              />
            </div>
          )}

          <div className="tw-mb-4 sm:tw-mb-6 tw-w-full">
            <div className="tw-w-full tw-min-w-0">
              <YesNoField
                label="Ada Pembahasan"
                checked={data.hasExplanation}
                onChange={(checked) => {
                  onChange(index, { ...latestDataRef.current, hasExplanation: checked });
                }}
                icon={<FileText size={16} />}
                color="tw-text-purple-700"
                selectedColor="tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-500 tw-text-white"
                yesText="Ya"
                noText="Tidak"
                variant="card"
                description="Apakah soal ini memerlukan pembahasan?"
              />
            </div>
            
            {data.hasExplanation && (
              <div className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-3 sm:tw-p-4 tw-shadow-sm tw-mt-2 tw-w-full">
                <label className="tw-text-purple-700 tw-font-medium tw-text-sm sm:tw-text-base tw-mb-2 tw-block">
                  Isi Pembahasan <span className="tw-text-red-500">*</span>
                </label>
                <div className="tw-bg-gray-50 tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2 tw-w-full">
                  <SuperEditor
                    onChange={(html) => {
                      onChange(index, { ...latestDataRef.current, explanationContent: html });
                    }}
                    initialValue={data.explanationContent || "<p>Mulai mengetik pembahasan di sini...</p>"}
                    editorId={`explanation-${index}`}
                    height="100px"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="tw-h-64" aria-hidden="true" />
        </div>
      </CustomAccordionItem>

      {/* Passage Modal */}
      <LearningModal
        show={data.showPassageModal}
        onHide={() => {
          onChange(index, {
            ...latestDataRef.current,
            showPassageModal: false,
            createNewPassage: false,
            importPassageMode: false,
            passageJsonInput: '',
            passageImportError: '',
          });
        }}
        title="Buat Bacaan Baru"
        subtitle="Buat bacaan baru untuk soal atau import dari JSON"
        icon={<BookOpen className="tw-w-5 tw-h-5" />}
        size="lg"
        width="95vw"
        height="90vh"
        scrollable={true}
        bottomButtons={passageModalButtons}
        preventCloseOnOutsideClick={false}
      >
        <div className="tw-space-y-4 tw-w-full">
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 tw-mb-4">
            <div className="tw-flex-1">
              <ButtonGradient
                action={!data.importPassageMode ? 'apply' : 'custom'}
                customText="Input Manual"
                customIcon={<FileText className="tw-w-4 tw-h-4" />}
                onClick={() => {
                  onChange(index, {
                    ...latestDataRef.current,
                    importPassageMode: false,
                    passageJsonInput: '',
                    passageImportError: '',
                  });
                }}
                size="md"
                className="tw-w-full"
              />
            </div>
            <div className="tw-flex-1">
              <ButtonGradient
                action={data.importPassageMode ? 'apply' : 'custom'}
                customText="Import JSON"
                customIcon={<FileJson className="tw-w-4 tw-h-4" />}
                onClick={() => {
                  onChange(index, {
                    ...latestDataRef.current,
                    importPassageMode: true,
                  });
                }}
                size="md"
                className="tw-w-full"
              />
            </div>
          </div>

          {!data.importPassageMode ? (
            <>
              <div className="tw-w-full tw-min-w-0">
                <ShortFormField
                  label="Judul Bacaan"
                  value={data.newPassageTitle}
                  onChange={(e) => {
                    onChange(index, {
                      ...latestDataRef.current,
                      newPassageTitle: e.target.value,
                    });
                  }}
                  required
                />
              </div>
              
              <div className="tw-w-full tw-min-w-0">
                <label className="tw-text-purple-700 tw-font-medium tw-text-sm sm:tw-text-base tw-mb-2 tw-block">
                  Isi Bacaan <span className="tw-text-red-500">*</span>
                </label>
                <div className="tw-bg-gray-50 tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2 tw-shadow-sm tw-w-full">
                  <SuperEditor
                    onChange={(html) => {
                      onChange(index, { ...latestDataRef.current, newPassageContent: html });
                    }}
                    initialValue={data.newPassageContent || "<p>Mulai mengetik bacaan di sini...</p>"}
                    editorId={`passage-editor-${index}`}
                    height="300px"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-border-2 tw-border-blue-200 tw-rounded-lg tw-p-4">
                <h4 className="tw-text-blue-800 tw-font-semibold tw-mb-2 tw-flex tw-items-center tw-gap-2">
                  <FileJson className="tw-w-5 tw-h-5" />
                  Format JSON untuk Passage
                </h4>
                <p className="tw-text-blue-700 tw-text-sm tw-mb-3">
                  Paste JSON dengan format berikut:
                </p>
                <pre className="tw-bg-white tw-border tw-border-blue-300 tw-rounded tw-p-3 tw-text-xs tw-overflow-x-auto">
{`{
  "passageTitle": "Judul Bacaan",
  "passageText": "<p>Paragraf 1 dengan <equation>\\\\frac{1}{2}</equation></p>\\n\\n<p>Paragraf 2</p>"
}`}
                </pre>
              </div>

              <div className="tw-w-full">
                <label className="tw-text-purple-700 tw-font-medium tw-mb-2 tw-block tw-flex tw-items-center tw-gap-2">
                  <FileJson className="tw-w-4 tw-h-4" />
                  JSON Data <span className="tw-text-red-500">*</span>
                </label>
                <textarea
                  value={data.passageJsonInput}
                  onChange={(e) => {
                    onChange(index, {
                      ...latestDataRef.current,
                      passageJsonInput: e.target.value,
                    });
                  }}
                  className="tw-w-full tw-h-64 tw-p-3 tw-border-2 tw-border-purple-300 tw-rounded-lg tw-font-mono tw-text-sm focus:tw-border-purple-500 focus:tw-outline-none"
                  placeholder='Paste JSON object di sini...'
                />
              </div>

              {data.passageImportError && (
                <div className="tw-bg-red-50 tw-border-2 tw-border-red-300 tw-rounded-lg tw-p-4">
                  <p className="tw-text-red-700 tw-text-sm tw-font-medium">
                    {data.passageImportError}
                  </p>
                </div>
              )}

              <div className="tw-w-full">
                <ButtonGradient
                  action="save"
                  customText="Import ke Form"
                  customIcon={<Upload className="tw-w-4 tw-h-4" />}
                  onClick={handleImportPassage}
                  size="md"
                  className="tw-w-full"
                />
              </div>
            </>
          )}
        </div>
      </LearningModal>

      {/* Individual Import Modal */}
      <LearningModal
        show={showIndividualImport}
        onHide={() => {
          setShowIndividualImport(false);
          setIndividualJsonInput('');
          setIndividualImportError('');
        }}
        title={`Import JSON - Soal #${index + 1}`}
        subtitle="Import data untuk soal ini atau tambahkan beberapa soal setelahnya"
        icon={<FileJson className="tw-w-5 tw-h-5" />}
        size="lg"
        width="90vw"
        height="85vh"
        scrollable={true}
        bottomButtons={individualImportButtons}
        preventCloseOnOutsideClick={false}
      >
        <div className="tw-space-y-4 tw-w-full">
          <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-indigo-50 tw-border-2 tw-border-purple-200 tw-rounded-lg tw-p-4">
            <h4 className="tw-text-purple-800 tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-gap-2">
              <FileJson className="tw-w-5 tw-h-5" />
              2 Mode Import
            </h4>
            
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
              <div className="tw-bg-white tw-border-2 tw-border-purple-300 tw-rounded-lg tw-p-3">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <div className="tw-bg-purple-500 tw-text-white tw-rounded-full tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-bold">1</div>
                  <h5 className="tw-font-semibold tw-text-purple-800">Replace Mode</h5>
                </div>
                <p className="tw-text-sm tw-text-gray-700 tw-mb-2">
                  Paste <strong>1 object JSON</strong> untuk mengganti data soal ini
                </p>
                <pre className="tw-bg-gray-100 tw-border tw-border-gray-300 tw-rounded tw-p-2 tw-text-xs tw-overflow-x-auto">
{`{
  "level": 2,
  "questionType": "single-choice",
  "questionText": "Soal...",
  "options": ["A", "B"],
  "correctAnswer": [0]
}`}
                </pre>
              </div>

              <div className="tw-bg-white tw-border-2 tw-border-indigo-300 tw-rounded-lg tw-p-3">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <div className="tw-bg-indigo-500 tw-text-white tw-rounded-full tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-bold">2</div>
                  <h5 className="tw-font-semibold tw-text-indigo-800">Insert Mode</h5>
                </div>
                <p className="tw-text-sm tw-text-gray-700 tw-mb-2">
                  Paste <strong>array JSON</strong> untuk menambah soal setelah soal ini
                </p>
                <pre className="tw-bg-gray-100 tw-border tw-border-gray-300 tw-rounded tw-p-2 tw-text-xs tw-overflow-x-auto">
{`[
  { "level": 2, ... },
  { "level": 3, ... }
]`}
                </pre>
              </div>
            </div>
          </div>

          <div className="tw-w-full">
            <label className="tw-text-purple-700 tw-font-medium tw-mb-2 tw-block tw-flex tw-items-center tw-gap-2">
              <FileJson className="tw-w-4 tw-h-4" />
              JSON Data <span className="tw-text-red-500">*</span>
            </label>
            <textarea
              value={individualJsonInput}
              onChange={(e) => setIndividualJsonInput(e.target.value)}
              className="tw-w-full tw-h-48 tw-p-3 tw-border-2 tw-border-purple-300 tw-rounded-lg tw-font-mono tw-text-sm focus:tw-border-purple-500 focus:tw-outline-none"
              placeholder='Paste JSON object atau array di sini...'
            />
          </div>

          {individualImportError && (
            <div className="tw-bg-red-50 tw-border-2 tw-border-red-300 tw-rounded-lg tw-p-4">
              <p className="tw-text-red-700 tw-text-sm tw-font-medium">
                {individualImportError}
              </p>
            </div>
          )}
        </div>
      </LearningModal>
    </>
  );
};

// Main Component
const CreateQuestionBulk: React.FC = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionData[]>([{ ...initialQuestionData }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [autoExport, setAutoExport] = useState(false);
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState('');
  
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportResultModal, setShowImportResultModal] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<ImportedQuestion[] | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { ...initialQuestionData }]);
    setOpenIndex(questions.length);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    if (openIndex === index) {
      setOpenIndex(updated.length > 0 ? 0 : null);
    }
  };

  const updateQuestion = (index: number, data: QuestionData) => {
    const updated = [...questions];
    updated[index] = data;
    setQuestions(updated);
  };

  const insertQuestionsAfter = (index: number, newQuestions: QuestionData[]) => {
    const updated = [...questions];
    updated.splice(index + 1, 0, ...newQuestions);
    setQuestions(updated);
    setOpenIndex(index + 1);
  };

  const handleReset = () => {
    setQuestions([{ ...initialQuestionData }]);
    setOpenIndex(0);
    setSuccessData([]);
    setShowSuccessModal(false);
  };

  const handleImportJSON = async () => {
    try {
      setImportError('');
      setIsProcessingImport(true);
      
      const parsedData = JSON.parse(jsonInput);
      
      const validation = validateImportJSON(parsedData);
      if (!validation.valid) {
        setImportError(validation.error || 'Format JSON tidak valid');
        setIsProcessingImport(false);
        return;
      }
      
      setPendingImportData(parsedData);
      
      const result = await processBulkImport(parsedData);
      setImportResult(result);
      
      setShowImportModal(false);
      setJsonInput('');
      setShowImportResultModal(true);
      
    } catch (error: any) {
      setImportError(`Error: ${error.message || 'Format JSON tidak valid'}`);
    } finally {
      setIsProcessingImport(false);
    }
  };

  const handleProceedWithImport = () => {
    if (!importResult) return;
    
    const completeQuestions = importResult.questions
      .filter(q => q.isComplete)
      .map(q => q.data);
    
    if (completeQuestions.length === 0) {
      alert('Tidak ada soal yang lengkap untuk ditambahkan');
      return;
    }
    
    setQuestions(completeQuestions);
    setOpenIndex(0);
    setShowImportResultModal(false);
    setImportResult(null);
    setPendingImportData(null);
    
    alert(`Berhasil menambahkan ${completeQuestions.length} soal lengkap!`);
  };

  const handleRetryImport = async () => {
    if (!pendingImportData) return;
    
    setIsProcessingImport(true);
    setShowImportResultModal(false);
    
    try {
      const result = await processBulkImport(pendingImportData);
      setImportResult(result);
      setShowImportResultModal(true);
    } catch (error: any) {
      alert(`Error saat retry: ${error.message}`);
    } finally {
      setIsProcessingImport(false);
    }
  };

  const handleCancelImport = () => {
    setShowImportResultModal(false);
    setImportResult(null);
    setPendingImportData(null);
  };

  const validateQuestion = (q: QuestionData): boolean => {
    if (!q.bidang || !q.topik || !q.subTopik) return false;
    if (q.level === null) return false;
    if (!q.questionText || q.questionText.trim() === '' || q.questionText === '<p>Mulai mengetik soal di sini...</p>') return false;

    if (q.questionType === 'single-choice' || q.questionType === 'multiple-choice') {
      if (q.options.length === 0) return false;
      if (q.correctAnswer.length === 0) return false;
    } else if (q.questionType === 'true-false') {
      if (q.statements.length === 0) return false;
      if (q.correctAnswer.length === 0) return false;
    } else if (q.questionType === 'number' || q.questionType === 'text') {
      if (!q.answer || q.answer.trim() === '') return false;
    }

    if (q.hasExplanation) {
      if (!q.explanationContent || q.explanationContent.trim() === '' || q.explanationContent === '<p>Mulai mengetik pembahasan di sini...</p>') {
        return false;
      }
    }

    if (q.hasPassage) {
      if (!q.passage && !q.createNewPassage) return false;
      if (q.createNewPassage && (!q.newPassageTitle || !q.newPassageContent)) return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const invalidQuestions = questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => !validateQuestion(q));

    if (invalidQuestions.length > 0) {
      const invalidIndexes = invalidQuestions.map(({ idx }) => idx + 1).join(', ');
      alert(`Soal nomor ${invalidIndexes} belum lengkap. Mohon lengkapi semua field yang diperlukan.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const results = [];
      const questionsPayload = [];

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        let passageId = q.passage?.id || null;
        if (q.hasPassage && q.createNewPassage && q.newPassageTitle && q.newPassageContent) {
          try {
            const passageResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/questions/passage`,
              {
                title: q.newPassageTitle,
                passage: q.newPassageContent,
                create_user_id: localStorage.getItem('userId'),
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
              }
            );
            passageId = passageResponse.data.id;
          } catch (error) {
            console.error('Error creating passage for question', i + 1, error);
            throw new Error(`Gagal membuat bacaan untuk soal ${i + 1}`);
          }
        }

        const questionPayload: any = {
          question_topic_type: q.subTopik?.value,
          question_text: q.questionText,
          question_type: q.questionType,
          level: q.level,
          passage_id: passageId,
          explanation: (q.hasExplanation && q.explanationContent) ? q.explanationContent : null,
        };

        if (q.questionType === 'single-choice' || q.questionType === 'multiple-choice') {
          questionPayload.options = q.options;
          questionPayload.correct_answer = q.correctAnswer.map((idx: number) => optionLabels[idx]);
        } else if (q.questionType === 'true-false') {
          questionPayload.statements = q.statements;
          questionPayload.correct_answer = q.correctAnswer;
        } else if (q.questionType === 'number' || q.questionType === 'text') {
          questionPayload.correct_answer = [q.answer];
        }

        questionsPayload.push(questionPayload);
      }

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/questions/bulk`,
          { questions: questionsPayload },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          }
        );

        const createdQuestions = response.data.questions || response.data || [];
        
        createdQuestions.forEach((created: any, i: number) => {
          const q = questions[i];
          results.push({
            index: i + 1,
            id: created.id,
            success: true,
            code: created.code || created.id,
            question_type: created.question_type || q.questionType,
            level: created.level || q.level,
            data: {
              ...questionsPayload[i],
              id: created.id,
              code: created.code || created.id,
              question_type: created.question_type || q.questionType,
              level: created.level || q.level,
              bidang: q.bidang?.label || '',
              topik: q.topik?.label || '',
              subTopik: q.subTopik?.label || '',
            },
          });
        });

        setSuccessData(results);
        setShowSuccessModal(true);

        if (autoExport) {
          setTimeout(() => {
            downloadCSV(results);
          }, 500);
        }
      } catch (error: any) {
        console.error('Error during bulk creation:', error);
        
        const details = error.response?.data?.details || [];
        const message = error.response?.data?.error || 'Gagal membuat soal';
        
        setErrorMessage(message);
        setErrorDetails(details);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error during bulk creation:', error);
      alert('Terjadi kesalahan saat membuat soal. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadCSV = (data: any[]) => {
    const successfulQuestions = data.filter((d) => d.success);

    if (successfulQuestions.length === 0) {
      alert('Tidak ada soal yang berhasil dibuat untuk di-export.');
      return;
    }

    const headers = [
      'No',
      'ID Soal',
      'Kode Soal',
      'Bidang',
      'Topik',
      'Sub Topik',
      'Level',
      'Tipe Soal',
      'Teks Soal',
      'Status',
    ];

    const rows = successfulQuestions.map((q) => {
      const questionTextPlain = q.data.question_text.replace(/<[^>]*>/g, '').substring(0, 100);
      return [
        q.index,
        q.data.id,
        q.code,
        q.data.bidang,
        q.data.topik,
        q.data.subTopik,
        q.data.level,
        q.data.question_type,
        questionTextPlain,
        'Berhasil',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bulk-questions-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importModalButtons: ModalButton[] = [
    {
      action: 'cancel',
      text: 'Batal',
      onClick: () => {
        setShowImportModal(false);
        setJsonInput('');
        setImportError('');
        setPendingImportData(null);
      },
    },
    {
      action: 'save',
      text: isProcessingImport ? 'Memproses...' : 'Import Soal',
      onClick: handleImportJSON,
    },
  ];

  const errorModalButtons: ModalButton[] = [
    {
      action: 'cancel',
      text: 'Tutup',
      onClick: () => {
        setShowErrorModal(false);
        setErrorMessage('');
        setErrorDetails([]);
      },
    },
  ];

  return (
    <MainLayout>
      <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-purple-50 tw-to-indigo-50 tw-p-3 sm:tw-p-6">
        <div className="tw-max-w-7xl tw-mx-auto tw-w-full">
          <div className="tw-mb-4 sm:tw-mb-6 tw-w-full">
            <div className="tw-bg-white tw-rounded-lg sm:tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-purple-200 tw-p-4 sm:tw-p-6 tw-w-full">
              <div className="tw-flex tw-flex-col lg:tw-flex-row tw-justify-between tw-items-start lg:tw-items-center tw-gap-4">
                <div className="tw-flex tw-items-center tw-gap-3 sm:tw-gap-4 tw-min-w-0 tw-flex-1">
                  <div className="tw-bg-gradient-to-br tw-from-purple-500 tw-to-indigo-500 tw-p-2 sm:tw-p-3 tw-rounded-lg sm:tw-rounded-xl tw-flex-shrink-0">
                    <Award className="tw-w-6 tw-h-6 sm:tw-w-8 sm:tw-h-8 tw-text-white" />
                  </div>
                  <div className="tw-min-w-0 tw-flex-1">
                    <h1 className="tw-text-xl sm:tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-purple-800 tw-break-words">
                      Buat Soal (Bulk)
                    </h1>
                    <p className="tw-text-sm sm:tw-text-base tw-text-gray-600 tw-mt-1 tw-break-words">
                      Buat beberapa soal sekaligus dengan mudah dan cepat
                    </p>
                  </div>
                </div>

                <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 sm:tw-gap-3 tw-w-full lg:tw-w-auto tw-flex-shrink-0">
                  <ButtonGradient
                    action="custom"
                    customText="Import JSON"
                    onClick={() => setShowImportModal(true)}
                    size="md"
                    customIcon={<Upload className="tw-w-4 tw-h-4" />}
                    customColors={{
                      primary: '#8B5CF6',
                      secondary: '#7C3AED',
                      gradient1: '#8B5CF6',
                      gradient2: '#A78BFA',
                      text: '#FFFFFF'
                    }}
                    className="tw-flex-1 sm:tw-flex-none"
                  />
                  
                  <ButtonGradient
                    action="back"
                    customText="Kembali"
                    onClick={() => router.back()}
                    size="md"
                    customColors={{
                      primary: '#ffffff',
                      secondary: '#f3f4f6',
                      gradient1: '#ffffff',
                      gradient2: '#f3f4f6',
                      text: '#6B7280'
                    }}
                    className="tw-flex-1 sm:tw-flex-none"
                  />
                </div>
              </div>
            </div>

            <div className="tw-bg-white tw-rounded-lg sm:tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-purple-200 tw-mb-4 sm:tw-mb-6 tw-w-full">
              <div className="tw-p-4 sm:tw-p-6">
                <div className="tw-flex tw-flex-col lg:tw-flex-row tw-justify-between tw-items-start lg:tw-items-center tw-gap-4">
                  <div className="tw-flex tw-items-center tw-gap-4 sm:tw-gap-6">
                    <div className="tw-bg-purple-100 tw-rounded-lg tw-p-3 sm:tw-p-4 tw-flex-shrink-0">
                      <div className="tw-text-purple-600 tw-text-xs sm:tw-text-sm tw-font-medium">Total Soal</div>
                      <div className="tw-text-xl sm:tw-text-2xl tw-font-bold tw-text-purple-800">{questions.length}</div>
                    </div>
                  </div>

                  <div className="tw-w-full lg:tw-w-auto lg:tw-flex-1 lg:tw-justify-end lg:tw-flex">
                    <div className="tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-border-2 tw-border-blue-200 tw-rounded-lg sm:tw-rounded-xl tw-p-3 sm:tw-p-4 tw-w-full lg:tw-min-w-[300px] lg:tw-max-w-[350px]">
                      <div className="tw-w-full tw-min-w-0">
                        <YesNoField
                          label="Auto-export data soal"
                          checked={autoExport}
                          onChange={setAutoExport}
                          icon={<Download size={16} />}
                          color="tw-text-blue-700"
                          selectedColor="tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-500 tw-text-white"
                          yesText="Ya"
                          noText="Tidak"
                          variant="card"
                          description="File CSV akan otomatis diunduh setelah berhasil membuat soal"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="tw-bg-white tw-rounded-lg sm:tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-purple-200 tw-w-full" style={{ overflow: 'visible' }}>
              <div className="tw-p-3 sm:tw-p-6" style={{ overflow: 'visible' }}>
                <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-mb-4 sm:tw-mb-6 tw-gap-3 sm:tw-gap-0">
                  <div className="tw-flex tw-items-center tw-gap-2 sm:tw-gap-3 tw-min-w-0 tw-flex-1">
                    <div className="tw-bg-purple-100 tw-p-2 tw-rounded-lg tw-flex-shrink-0">
                      <FileText className="tw-w-4 tw-h-4 sm:tw-w-5 sm:tw-h-5 tw-text-purple-600" />
                    </div>
                    <h3 className="tw-text-lg sm:tw-text-xl tw-font-bold tw-text-purple-700 tw-break-words">
                      Daftar Pertanyaan
                    </h3>
                  </div>

                  <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 sm:tw-gap-3 tw-w-full sm:tw-w-auto tw-flex-shrink-0">
                    <ButtonGradient
                      action="add"
                      customText="Tambah"
                      onClick={addQuestion}
                      size="md"
                      customIcon={<Plus className="tw-w-4 tw-h-4" />}
                      className="tw-flex-1 sm:tw-flex-none"
                    />
                    
                    <ButtonGradient
                      action="reset"
                      customText="Reset"
                      onClick={() => {
                        if (window.confirm('Yakin ingin mereset semua pertanyaan?')) {
                          handleReset();
                        }
                      }}
                      size="md"
                      customIcon={<RotateCcw className="tw-w-4 tw-h-4" />}
                      disabled={isSubmitting}
                      className="tw-flex-1 sm:tw-flex-none"
                    />
                  </div>
                </div>
                
                <div 
                  className="tw-space-y-3 sm:tw-space-y-4 tw-w-full"
                  style={{
                    overflow: 'visible',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  {questions.map((q, idx) => (
                    <BulkQuestionItem
                      key={idx}
                      index={idx}
                      data={q}
                      onChange={(i, d) => updateQuestion(i, d)}
                      onRemove={(i) => removeQuestion(i)}
                      onInsertAfter={(i, qs) => insertQuestionsAfter(i, qs)}
                      isOpen={openIndex === idx}
                      onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
                    />
                  ))}
                </div>
                
                {questions.length === 0 && (
                  <div className="tw-text-center tw-py-8 sm:tw-py-12 tw-w-full">
                    <div className="tw-bg-gray-100 tw-rounded-full tw-w-12 tw-h-12 sm:tw-w-16 sm:tw-h-16 tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-3 sm:tw-mb-4">
                      <FileText className="tw-w-6 tw-h-6 sm:tw-w-8 sm:tw-h-8 tw-text-gray-400" />
                    </div>
                    <h4 className="tw-text-base sm:tw-text-lg tw-font-semibold tw-text-gray-600 tw-mb-2">
                      Belum ada pertanyaan
                    </h4>
                    <p className="tw-text-sm sm:tw-text-base tw-text-gray-500 tw-mb-4 tw-px-4">
                      Klik tombol "Tambah Pertanyaan" untuk mulai membuat soal
                    </p>
                    <ButtonGradient
                      action="add"
                      customText="Tambah Pertanyaan Pertama"
                      onClick={addQuestion}
                      size="lg"
                      customIcon={<Plus className="tw-w-5 tw-h-5" />}
                    />
                  </div>
                )}
              </div>
            </div>

            {questions.length > 0 && (
              <div className="tw-bg-gradient-to-r tw-from-green-50 tw-to-emerald-50 tw-border-2 tw-border-green-200 tw-rounded-lg sm:tw-rounded-xl tw-shadow-lg tw-mt-4 sm:tw-mt-6 tw-w-full">
                <div className="tw-p-4 sm:tw-p-6">
                  <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-4">
                    <div className="tw-flex tw-items-center tw-gap-3 sm:tw-gap-4 tw-min-w-0 tw-flex-1">
                      <div className="tw-bg-green-100 tw-p-2 sm:tw-p-3 tw-rounded-lg sm:tw-rounded-xl tw-flex-shrink-0">
                        <Zap className="tw-w-5 tw-h-5 sm:tw-w-6 sm:tw-h-6 tw-text-green-600" />
                      </div>
                      <div className="tw-min-w-0 tw-flex-1">
                        <h4 className="tw-text-base sm:tw-text-lg tw-font-bold tw-text-green-800 tw-mb-1 tw-break-words">
                          Siap untuk submit?
                        </h4>
                        <p className="tw-text-xs sm:tw-text-sm tw-text-green-600 tw-break-words">
                          {questions.length} soal akan dibuat secara bersamaan
                        </p>
                      </div>
                    </div>

                    <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 sm:tw-gap-3 tw-w-full sm:tw-w-auto tw-flex-shrink-0">
                      <ButtonGradient
                        action="add"
                        customText="Tambah Pertanyaan"
                        onClick={addQuestion}
                        size="lg"
                        customIcon={<Plus className="tw-w-4 tw-h-4 sm:tw-w-5 sm:tw-h-5" />}
                        customColors={{
                          primary: '#3B82F6',
                          secondary: '#2563EB',
                          gradient1: '#3B82F6',
                          gradient2: '#60A5FA',
                          text: '#FFFFFF'
                        }}
                        className="tw-flex-1 sm:tw-flex-none"
                      />
                      
                      <ButtonGradient
                        action="save"
                        customText={isSubmitting ? 'Menyimpan...' : `Buat ${questions.length} Soal`}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        loading={isSubmitting}
                        size="lg"
                        customIcon={isSubmitting ? undefined : <Check className="tw-w-4 tw-h-4 sm:tw-w-5 sm:tw-h-5" />}
                        customColors={{
                          primary: '#10B981',
                          secondary: '#059669',
                          gradient1: '#10B981',
                          gradient2: '#34D399',
                          text: '#FFFFFF'
                        }}
                        className="tw-flex-1 sm:tw-flex-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Import JSON Modal */}
      <LearningModal
        show={showImportModal}
        onHide={() => {
          setShowImportModal(false);
          setJsonInput('');
          setImportError('');
          setPendingImportData(null);
        }}
        title="Import Soal dari JSON"
        subtitle="Paste JSON data untuk mengimport soal secara bulk"
        icon={<FileJson className="tw-w-5 tw-h-5" />}
        size="lg"
        width="95vw"
        height="90vh"
        scrollable={true}
        bottomButtons={importModalButtons}
        preventCloseOnOutsideClick={false}
      >
        <div className="tw-space-y-4 tw-w-full">
          <div className="tw-bg-blue-50 tw-border-2 tw-border-blue-200 tw-rounded-lg tw-p-4">
            <h4 className="tw-text-blue-800 tw-font-semibold tw-mb-2 tw-flex tw-items-center tw-gap-2">
              <FileJson className="tw-w-5 tw-h-5" />
              Format JSON
            </h4>
            <p className="tw-text-blue-700 tw-text-sm tw-mb-3">
              Paste JSON array dengan format berikut:
            </p>
            <pre className="tw-bg-white tw-border tw-border-blue-300 tw-rounded tw-p-3 tw-text-xs tw-overflow-x-auto">
{`[
  {
    "bidang": "Penalaran Matematika",
    "bidang_code": "PM1",
    "topik": "Aritmetika",
    "topic_code": "AR",
    "subtopic": "Operasi Dasar",
    "subtopic_code": "OD",
    "subtopic_id": 195,
    "level": 2,
    "passageTitle": "Teks Bacaan: ...",
    "questionType": "single-choice",
    "questionText": "<p>Soal...</p>",
    "options": ["<p>A</p>", "<p>B</p>"],
    "correctAnswer": [0],
    "explanation": "<p>Pembahasan...</p>"
  }
]`}
            </pre>
          </div>

          <div className="tw-w-full">
            <label className="tw-text-purple-700 tw-font-medium tw-mb-2 tw-block">
              JSON Data <span className="tw-text-red-500">*</span>
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="tw-w-full tw-h-64 tw-p-3 tw-border-2 tw-border-purple-300 tw-rounded-lg tw-font-mono tw-text-sm focus:tw-border-purple-500 focus:tw-outline-none"
              placeholder='Paste JSON array di sini...'
            />
          </div>

          {importError && (
            <div className="tw-bg-red-50 tw-border-2 tw-border-red-300 tw-rounded-lg tw-p-4">
              <p className="tw-text-red-700 tw-text-sm tw-font-medium">
                {importError}
              </p>
            </div>
          )}

          <div className="tw-bg-yellow-50 tw-border-2 tw-border-yellow-200 tw-rounded-lg tw-p-4">
            <h4 className="tw-text-yellow-800 tw-font-semibold tw-mb-2">
              ⚠️ Perhatian
            </h4>
            <ul className="tw-text-yellow-700 tw-text-sm tw-space-y-1 tw-list-disc tw-list-inside">
              <li>System akan mencari Bidang, Topik, Subtopik berdasarkan code/name</li>
              <li>Bacaan akan dicari berdasarkan passageTitle</li>
              <li>Jika ada yang tidak ditemukan, akan muncul di laporan hasil</li>
              <li>Equation akan otomatis dirender dengan KaTeX</li>
            </ul>
          </div>
        </div>
      </LearningModal>

      {/* Import Result Modal */}
      <ImportResultModal
        show={showImportResultModal}
        result={importResult}
        onClose={handleCancelImport}
        onProceed={handleProceedWithImport}
        onRetry={handleRetryImport}
      />

      {/* Error Modal */}
      <LearningModal
        show={showErrorModal}
        onHide={() => {
          setShowErrorModal(false);
          setErrorMessage('');
          setErrorDetails([]);
        }}
        title="Gagal Membuat Soal"
        subtitle="Terjadi kesalahan saat membuat soal"
        icon={<AlertCircle className="tw-w-5 tw-h-5 tw-text-red-500" />}
        size="lg"
        width="90vw"
        height="auto"
        scrollable={true}
        bottomButtons={errorModalButtons}
        preventCloseOnOutsideClick={false}
      >
        <div className="tw-space-y-4 tw-w-full">
          <div className="tw-bg-red-50 tw-border-2 tw-border-red-300 tw-rounded-lg tw-p-4">
            <h4 className="tw-text-red-800 tw-font-semibold tw-mb-2 tw-flex tw-items-center tw-gap-2">
              <AlertCircle className="tw-w-5 tw-h-5" />
              Error Message
            </h4>
            <p className="tw-text-red-700 tw-text-sm">
              {errorMessage}
            </p>
          </div>

          {errorDetails.length > 0 && (
            <div className="tw-bg-white tw-border-2 tw-border-red-200 tw-rounded-lg tw-p-4">
              <h4 className="tw-text-red-800 tw-font-semibold tw-mb-3">
                Detail Kesalahan:
              </h4>
              <ul className="tw-space-y-2">
                {errorDetails.map((detail, idx) => (
                  <li key={idx} className="tw-flex tw-items-start tw-gap-2 tw-text-red-700 tw-text-sm">
                    <span className="tw-text-red-500 tw-font-bold tw-mt-0.5">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </LearningModal>

      {/* Success Modal */}
      <CreateBulkModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        data={successData}
        autoExported={autoExport}
        onReset={handleReset}
        onExport={() => downloadCSV(successData)}
        onNavigate={() => router.push('/panel/exam/questions')}
      />

      {/* Loading Overlay */}
      {isProcessingImport && (
        <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-[10000]">
          <div className="tw-bg-white tw-rounded-xl tw-p-8 tw-shadow-2xl tw-max-w-md tw-w-full tw-mx-4">
            <div className="tw-flex tw-flex-col tw-items-center tw-gap-4">
              <div className="tw-w-16 tw-h-16 tw-border-4 tw-border-purple-200 tw-border-t-purple-600 tw-rounded-full tw-animate-spin"></div>
              <h3 className="tw-text-xl tw-font-bold tw-text-purple-800">
                Memproses Import...
              </h3>
              <p className="tw-text-gray-600 tw-text-center">
                Sedang mencari dan mencocokkan data dari database.<br />
                Mohon tunggu sebentar.
              </p>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default CreateQuestionBulk;