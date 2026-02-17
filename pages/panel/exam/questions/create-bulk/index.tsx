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
  FilterableSelectField,
  SelectCustomField,
  ShortFormField,
  YesNoField,
  SelectOption
} from '../../../../../components/form/FormComponentLayout';
import { LearningModal, ModalButton } from '../../../../../components/modal/ModalTemplate';
import { ButtonGradient } from '../../../../../components/button/ButtonTemplate';
import CreateBulkModal from './CreateBulkModal';
import {
  validateImportJSON,
} from '../../../../../utils/bulkQuestionImport';
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
  onExport: (index: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  allExamTypes: any[];
  isLoadingExamTypes: boolean;
}> = ({ index, data, onChange, onRemove, onInsertAfter, onExport, isOpen, onToggle, allExamTypes, isLoadingExamTypes }) => {
  const { id } = useAuth();
  const userId = id || null;
  
  const [showIndividualImport, setShowIndividualImport] = useState(false);
  const [individualJsonInput, setIndividualJsonInput] = useState('');
  const [individualImportError, setIndividualImportError] = useState('');
  
  const latestDataRef = useRef(data);
  
  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);
  
  const passageSearchTimeout = useRef<NodeJS.Timeout>();

  // Filter exam types locally from allExamTypes
  const bidangOptions = React.useMemo(() => {
    return allExamTypes
      .filter((et: any) => et.kind === 1)
      .map((et: any) => ({
        label: `${et.code} - ${et.name}`,
        value: et.id,
      }));
  }, [allExamTypes]);

  const topikOptions = React.useMemo(() => {
    if (!data.bidang) return [];
    return allExamTypes
      .filter((et: any) => et.kind === 2 && et.master_id === data.bidang.value)
      .map((et: any) => ({
        label: `${et.code} - ${et.name}`,
        value: et.id,
      }));
  }, [allExamTypes, data.bidang]);

  const subTopikOptions = React.useMemo(() => {
    if (!data.topik) return [];
    return allExamTypes
      .filter((et: any) => et.kind === 3 && et.master_id === data.topik.value)
      .map((et: any) => ({
        label: `${et.code} - ${et.name}`,
        value: et.id,
      }));
  }, [allExamTypes, data.topik]);

  // No auto-fetch for passages - lazy load only when user searches
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

  const handleIndividualImport = async () => {
    try {
      setIndividualImportError('');
      
      const parsedData = JSON.parse(individualJsonInput);
      
      // Check if allExamTypes is loaded
      if (!allExamTypes || allExamTypes.length === 0) {
        setIndividualImportError('Exam types belum dimuat. Silakan tunggu sebentar dan coba lagi.');
        return;
      }
      
      // Helper function to convert JSON item to QuestionData with bidang/topik/subtopik search
      const convertItemToQuestionData = async (item: any, baseData?: QuestionData): Promise<QuestionData> => {
        const processedQuestionText = processContent(item.questionText || item.question || '');
        const processedOptions = (item.options || ['']).map((opt: string) => processContent(opt));
        const processedExplanation = processContent(item.explanation || item.explanationContent || '');
        
        let questionData: QuestionData = {
          ...(baseData || initialQuestionData),
          level: item.level || (baseData?.level || null),
          questionType: item.questionType || item.type || (baseData?.questionType || 'single-choice'),
          questionText: processedQuestionText,
          options: processedOptions,
          correctAnswer: item.correctAnswer || item.correct || [],
          statements: item.statements || [''],
          answer: item.answer || '',
          hasExplanation: !!(item.explanation || item.explanationContent),
          explanationContent: processedExplanation,
        };
        
        // Search for bidang
        if (item.bidang_code || item.bidang) {
          const bidangList = allExamTypes.filter((et: any) => et.kind === 1);
          let foundBidang = null;
          
          if (item.bidang_code) {
            foundBidang = bidangList.find((b: any) => 
              b.code?.toLowerCase() === item.bidang_code.toLowerCase()
            );
          }
          
          if (!foundBidang && item.bidang) {
            foundBidang = bidangList.find((b: any) => 
              b.name?.toLowerCase() === item.bidang.toLowerCase()
            );
          }
          
          if (foundBidang) {
            questionData.bidang = {
              label: `${foundBidang.code} - ${foundBidang.name}`,
              value: foundBidang.id,
            };
            questionData.bidangOptions = [{
              label: `${foundBidang.code} - ${foundBidang.name}`,
              value: foundBidang.id,
            }];
            
            // Search for topik under this bidang
            if (item.topic_code || item.topik) {
              const topikList = allExamTypes.filter((et: any) => 
                et.kind === 2 && et.master_id === foundBidang.id
              );
              let foundTopik = null;
              
              if (item.topic_code) {
                foundTopik = topikList.find((t: any) => 
                  t.code?.toLowerCase() === item.topic_code.toLowerCase()
                );
              }
              
              if (!foundTopik && item.topik) {
                foundTopik = topikList.find((t: any) => 
                  t.name?.toLowerCase() === item.topik.toLowerCase()
                );
              }
              
              if (foundTopik) {
                questionData.topik = {
                  label: `${foundTopik.code} - ${foundTopik.name}`,
                  value: foundTopik.id,
                };
                questionData.topikOptions = [{
                  label: `${foundTopik.code} - ${foundTopik.name}`,
                  value: foundTopik.id,
                }];
                
                // Search for subtopik under this topik
                if (item.subtopic_id || item.subtopic_code || item.subtopic) {
                  const subtopikList = allExamTypes.filter((et: any) => 
                    et.kind === 3 && et.master_id === foundTopik.id
                  );
                  let foundSubtopik = null;
                  
                  if (item.subtopic_id) {
                    foundSubtopik = subtopikList.find((st: any) => 
                      st.id === item.subtopic_id
                    );
                  }
                  
                  if (!foundSubtopik && item.subtopic_code) {
                    foundSubtopik = subtopikList.find((st: any) => 
                      st.code?.toLowerCase() === item.subtopic_code.toLowerCase()
                    );
                  }
                  
                  if (!foundSubtopik && item.subtopic) {
                    foundSubtopik = subtopikList.find((st: any) => 
                      st.name?.toLowerCase() === item.subtopic.toLowerCase()
                    );
                  }
                  
                  if (foundSubtopik) {
                    questionData.subTopik = {
                      label: `${foundSubtopik.code} - ${foundSubtopik.name}`,
                      value: foundSubtopik.id,
                    };
                    questionData.subTopikOptions = [{
                      label: `${foundSubtopik.code} - ${foundSubtopik.name}`,
                      value: foundSubtopik.id,
                    }];
                  }
                }
              }
            }
          }
        }
        
        // Search for passage
        if (item.passageTitle) {
          try {
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/passage/search?query=${encodeURIComponent(item.passageTitle)}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
              }
            );
            
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              const foundPassage = response.data.find((p: any) => 
                p.title?.toLowerCase() === item.passageTitle.toLowerCase()
              );
              
              if (foundPassage) {
                questionData.hasPassage = true;
                questionData.passage = {
                  id: foundPassage.id,
                  title: foundPassage.title,
                  passage: foundPassage.content,
                };
                questionData.passageSearchResults = [foundPassage];
              }
            }
          } catch (error) {
            console.warn('Failed to search passage:', error);
          }
        }
        
        return questionData;
      };
      
      if (Array.isArray(parsedData)) {
        // Array mode: insert multiple questions after this one
        const importedQuestions: QuestionData[] = [];
        
        for (const item of parsedData) {
          const converted = await convertItemToQuestionData(item);
          importedQuestions.push(converted);
        }
        
        onInsertAfter(index, importedQuestions);
        setShowIndividualImport(false);
        setIndividualJsonInput('');
        alert(`Berhasil menambahkan ${importedQuestions.length} soal setelah soal #${index + 1}!`);
      } else {
        // Object mode: replace this question
        const importedQuestion = await convertItemToQuestionData(parsedData, latestDataRef.current);
        
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
                customText="Export"
                customIcon={<Download className="tw-w-4 tw-h-4" />}
                customColors={{
                  primary: '#10B981',
                  secondary: '#059669',
                  gradient1: '#10B981',
                  gradient2: '#34D399',
                  text: '#FFFFFF'
                }}
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                  onExport(index);
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
            <FilterableSelectField
              label="Bidang"
              value={data.bidang}
              options={bidangOptions}
              onChange={(newValue) => {
                onChange(index, {
                  ...latestDataRef.current,
                  bidang: newValue,
                  topik: null,
                  subTopik: null,
                });
              }}
              isLoading={isLoadingExamTypes}
              required
            />
          </div>

          <div 
            className="tw-mb-4 sm:tw-mb-6 tw-w-full"
            style={{ position: 'relative', zIndex: 200, overflow: 'visible' }}
          >
            <FilterableSelectField
              label="Topik"
              value={data.topik}
              options={topikOptions}
              onChange={(newValue) => {
                onChange(index, {
                  ...latestDataRef.current,
                  topik: newValue,
                  subTopik: null,
                });
              }}
              isLoading={isLoadingExamTypes}
              required
            />
          </div>

          <div 
            className="tw-mb-4 sm:tw-mb-6 tw-w-full"
            style={{ position: 'relative', zIndex: 150, overflow: 'visible' }}
          >
            <FilterableSelectField
              label="Sub Topik"
              value={data.subTopik}
              options={subTopikOptions}
              onChange={(newValue) => {
                onChange(index, { ...latestDataRef.current, subTopik: newValue });
              }}
              isLoading={isLoadingExamTypes}
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
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  
  // Import by Exam states
  const [importMode, setImportMode] = useState<'json' | 'exam'>('json');
  const [selectedExam, setSelectedExam] = useState<SelectOption | null>(null);
  const [examOptions, setExamOptions] = useState<SelectOption[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Global exam types state (fetch once, filter locally)
  const [allExamTypes, setAllExamTypes] = useState<any[]>([]);
  const [isLoadingExamTypes, setIsLoadingExamTypes] = useState(false);

  // Fetch all exam types once on mount
  useEffect(() => {
    const fetchAllExamTypes = async () => {
      setIsLoadingExamTypes(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/exam-types?limit=10000`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          }
        );
        
        const examTypes = response.data.examTypes || [];
        setAllExamTypes(examTypes);
      } catch (error) {
        console.error('Error fetching all exam types:', error);
        setAllExamTypes([]);
      } finally {
        setIsLoadingExamTypes(false);
      }
    };

    fetchAllExamTypes();
  }, []);

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

  // Search exams function
  const handleExamSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setExamOptions([]);
      return;
    }
    
    setIsLoadingExams(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/exam/search?query=${encodeURIComponent(searchTerm)}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      
      if (response.data && Array.isArray(response.data.data)) {
        const formattedOptions = response.data.data.map((exam: any) => ({
          label: `${exam.name} (ID: ${exam.id})`,
          value: exam.id,
        }));
        setExamOptions(formattedOptions);
      } else {
        setExamOptions([]);
      }
    } catch (error) {
      console.error('Error searching exams:', error);
      setExamOptions([]);
    } finally {
      setIsLoadingExams(false);
    }
  };

  // Convert fetched question to QuestionData format
  const convertQuestionToQuestionData = (question: any, examTypesMap: Map<number, any>): QuestionData | null => {
    try {
      // Get exam type info from question
      const subtopicId = question.question_topic_type;
      if (!subtopicId) {
        console.warn('Question missing subtopic:', question.id);
        return null;
      }

      // Lookup subtopic from map
      const subtopic = examTypesMap.get(subtopicId);
      if (!subtopic) {
        console.warn('Subtopic not found in map:', subtopicId);
        return null;
      }

      // Lookup topik and bidang from map
      const topik = subtopic.master_id ? examTypesMap.get(subtopic.master_id) : null;
      const bidang = topik?.master_id ? examTypesMap.get(topik.master_id) : null;

      if (!bidang || !topik || !subtopic) {
        console.warn('Could not find complete exam type hierarchy for question:', question.id);
        return null;
      }

      // Process correct answer
      let correctAnswer: number[] = [];
      if (question.question_type === 'single-choice' || question.question_type === 'multiple-choice') {
        if (Array.isArray(question.correct_answer)) {
          correctAnswer = question.correct_answer.map((ans: string) => 
            optionLabels.indexOf(ans)
          ).filter((idx: number) => idx !== -1);
        }
      } else if (question.question_type === 'true-false') {
        correctAnswer = Array.isArray(question.correct_answer) ? question.correct_answer : [];
      }

      const questionData: QuestionData = {
        bidang: {
          label: `${bidang.code} - ${bidang.name}`,
          value: bidang.id,
        },
        topik: {
          label: `${topik.code} - ${topik.name}`,
          value: topik.id,
        },
        subTopik: {
          label: `${subtopic.code} - ${subtopic.name}`,
          value: subtopic.id,
        },
        bidangOptions: [{
          label: `${bidang.code} - ${bidang.name}`,
          value: bidang.id,
        }],
        topikOptions: [{
          label: `${topik.code} - ${topik.name}`,
          value: topik.id,
        }],
        subTopikOptions: [{
          label: `${subtopic.code} - ${subtopic.name}`,
          value: subtopic.id,
        }],
        isLoadingBidang: false,
        isLoadingTopik: false,
        isLoadingSubTopik: false,
        level: question.level || null,
        hasPassage: !!question.passage_id,
        createNewPassage: false,
        passage: question.passage_id ? {
          id: question.passage_id,
          title: question.passage?.title || '',
          passage: question.passage?.content || '',
        } : null,
        passageSearchResults: [],
        isLoadingPassage: false,
        newPassageTitle: '',
        newPassageContent: '',
        showPassageModal: false,
        importPassageMode: false,
        passageJsonInput: '',
        passageImportError: '',
        questionType: question.question_type || 'single-choice',
        options: question.options || [''],
        correctAnswer: correctAnswer,
        statements: question.statements || [''],
        answer: (question.question_type === 'number' || question.question_type === 'text') 
          ? (Array.isArray(question.correct_answer) ? question.correct_answer[0] : '') 
          : '',
        questionText: question.question_text || '',
        hasExplanation: !!question.pembahasan,
        explanationContent: question.pembahasan || '',
      };

      return questionData;
    } catch (error) {
      console.error('Error converting question:', question.id, error);
      return null;
    }
  };

  // Import questions from exam
  const handleImportByExam = async () => {
    if (!selectedExam) {
      setImportError('Silakan pilih exam terlebih dahulu');
      return;
    }

    setIsLoadingQuestions(true);
    setImportError('');

    try {
      // Build a map from already loaded allExamTypes for quick lookup: id -> exam type object
      const examTypesMap = new Map<number, any>();
      allExamTypes.forEach((et: any) => {
        examTypesMap.set(et.id, et);
      });

      // Fetch questions from the selected exam
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/byExamId?examid=${selectedExam.value}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      const fetchedQuestions = response.data.questions || [];
      
      if (fetchedQuestions.length === 0) {
        setImportError('Tidak ada soal ditemukan di exam ini');
        setIsLoadingQuestions(false);
        return;
      }

      // Convert all questions to QuestionData format
      const convertedQuestions: QuestionData[] = [];
      const failedQuestions: number[] = [];

      for (let i = 0; i < fetchedQuestions.length; i++) {
        const question = fetchedQuestions[i];
        const converted = convertQuestionToQuestionData(question, examTypesMap);
        
        if (converted) {
          convertedQuestions.push(converted);
        } else {
          failedQuestions.push(question.id);
        }
      }

      if (convertedQuestions.length === 0) {
        setImportError('Gagal mengkonversi soal. Pastikan soal memiliki data yang lengkap.');
        setIsLoadingQuestions(false);
        return;
      }

      // Set the converted questions
      setQuestions(convertedQuestions);
      setOpenIndex(0);
      setShowImportModal(false);
      
      // Reset import states
      setSelectedExam(null);
      setExamOptions([]);
      setImportError('');
      
      let message = `Berhasil mengimport ${convertedQuestions.length} soal dari exam!`;
      if (failedQuestions.length > 0) {
        message += ` ${failedQuestions.length} soal gagal dikonversi (ID: ${failedQuestions.join(', ')}).`;
      }
      alert(message);
      
    } catch (error: any) {
      console.error('Error importing questions from exam:', error);
      setImportError(`Error: ${error.response?.data?.error || error.message || 'Gagal mengimport soal dari exam'}`);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  /**
   * Convert imported JSON item to QuestionData using global allExamTypes
   */
  const convertJSONItemToQuestionData = async (
    item: any, 
    examTypesMap: Map<number, any>,
    index: number
  ): Promise<{ data: QuestionData | null; errors: string[]; warnings: string[] }> => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Helper to process content (from bulkQuestionImport)
      const processContent = (content: string): string => {
        if (!content) return content;
        let processed = content.replace(/<equation>([\s\S]*?)<\/equation>/g, (match, latex) => {
          try {
            const isMultiline = /\\begin\{(align|gather|equation|eqnarray)/.test(latex);
            const containerTag = isMultiline ? 'div' : 'span';
            return `<${containerTag} class="cte-katex-equation ${isMultiline ? 'cte-katex-block' : 'cte-katex-inline'}" data-latex="${encodeURIComponent(latex.trim())}" data-display-mode="${isMultiline}" data-editable="true">${latex}</${containerTag}>`;
          } catch (error) {
            return match;
          }
        });
        return processed;
      };

      // Process question text and explanation
      const processedQuestionText = processContent(item.questionText || '');
      const processedExplanation = processContent(item.explanation || item.explanationContent || '');

      // Process options
      let processedOptions: string[] = [];
      if (item.options && Array.isArray(item.options)) {
        processedOptions = item.options.map((opt: string) => processContent(opt));
      }

      // Initialize question data
      const questionData: QuestionData = {
        ...initialQuestionData,
        level: item.level || null,
        hasPassage: !!item.passageTitle,
        questionType: item.questionType || 'single-choice',
        options: processedOptions.length > 0 ? processedOptions : [''],
        correctAnswer: item.correctAnswer || [],
        statements: item.statements || [''],
        answer: item.answer || '',
        questionText: processedQuestionText,
        hasExplanation: !!(item.explanation || item.explanationContent),
        explanationContent: processedExplanation,
      };

      // Find bidang by code or name
      let bidang = null;
      if (item.bidang_code || item.bidang) {
        console.log(`DEBUG: Searching for bidang with code="${item.bidang_code}" or name="${item.bidang}"`);
        console.log(`DEBUG: Total allExamTypes count: ${allExamTypes.length}`);
        console.log(`DEBUG: Bidang count (kind=1): ${allExamTypes.filter((et: any) => et.kind === 1).length}`);
        
        // Try to find by code first
        if (item.bidang_code) {
          bidang = allExamTypes.find((et: any) => 
            et.kind === 1 && et.code?.toLowerCase() === item.bidang_code.toLowerCase()
          );
          console.log(`DEBUG: Search by code "${item.bidang_code}" result:`, bidang ? `Found: ${bidang.code} - ${bidang.name}` : 'Not found');
        }
        // If not found by code, try by name
        if (!bidang && item.bidang) {
          bidang = allExamTypes.find((et: any) => 
            et.kind === 1 && et.name?.toLowerCase().includes(item.bidang.toLowerCase())
          );
          console.log(`DEBUG: Search by name "${item.bidang}" result:`, bidang ? `Found: ${bidang.code} - ${bidang.name}` : 'Not found');
        }
        
        if (bidang) {
          questionData.bidang = {
            label: `${bidang.code} - ${bidang.name}`,
            value: bidang.id,
          };
          console.log(`DEBUG: Bidang set successfully:`, questionData.bidang);
        } else {
          const errorMsg = `Soal #${index + 1}: Bidang "${item.bidang_code || item.bidang}" tidak ditemukan`;
          errors.push(errorMsg);
          console.log(`DEBUG: ${errorMsg}`);
        }
      } else {
        errors.push(`Soal #${index + 1}: Bidang tidak ada di JSON`);
      }

      // Find topik (only if bidang found)
      if (bidang) {
        let topik = null;
        if (item.topic_code || item.topik) {
          console.log(`DEBUG: Searching for topik with code="${item.topic_code}" or name="${item.topik}" under bidang_id=${bidang.id}`);
          
          // Try to find by code first
          if (item.topic_code) {
            topik = allExamTypes.find((et: any) => 
              et.kind === 2 && 
              et.master_id === bidang.id && 
              et.code?.toLowerCase() === item.topic_code.toLowerCase()
            );
            console.log(`DEBUG: Search topik by code "${item.topic_code}" result:`, topik ? `Found: ${topik.code} - ${topik.name}` : 'Not found');
          }
          // If not found by code, try by name
          if (!topik && item.topik) {
            topik = allExamTypes.find((et: any) => 
              et.kind === 2 && 
              et.master_id === bidang.id && 
              et.name?.toLowerCase().includes(item.topik.toLowerCase())
            );
            console.log(`DEBUG: Search topik by name "${item.topik}" result:`, topik ? `Found: ${topik.code} - ${topik.name}` : 'Not found');
          }
          
          if (topik) {
            questionData.topik = {
              label: `${topik.code} - ${topik.name}`,
              value: topik.id,
            };
          } else {
            errors.push(`Soal #${index + 1}: Topik "${item.topic_code || item.topik}" tidak ditemukan`);
          }
        } else {
          errors.push(`Soal #${index + 1}: Topik tidak ada di JSON`);
        }

        // Find subtopik (only if topik found)
        if (topik) {
          let subtopic = null;
          console.log(`DEBUG: Searching for subtopic with id=${item.subtopic_id}, code="${item.subtopic_code}" or name="${item.subtopic}" under topik_id=${topik.id}`);
          
          // Try to find by subtopic_id first (most reliable)
          if (item.subtopic_id) {
            subtopic = allExamTypes.find((et: any) => 
              et.kind === 3 && 
              et.master_id === topik.id && 
              et.id === item.subtopic_id
            );
            console.log(`DEBUG: Search subtopic by id ${item.subtopic_id} result:`, subtopic ? `Found: ${subtopic.code} - ${subtopic.name}` : 'Not found');
          }
          
          // If not found by ID, try by code
          if (!subtopic && item.subtopic_code) {
            subtopic = allExamTypes.find((et: any) => 
              et.kind === 3 && 
              et.master_id === topik.id && 
              et.code?.toLowerCase() === item.subtopic_code.toLowerCase()
            );
            console.log(`DEBUG: Search subtopic by code "${item.subtopic_code}" result:`, subtopic ? `Found: ${subtopic.code} - ${subtopic.name}` : 'Not found');
          }
          
          // If not found by code, try by name
          if (!subtopic && item.subtopic) {
            subtopic = allExamTypes.find((et: any) => 
              et.kind === 3 && 
              et.master_id === topik.id && 
              et.name?.toLowerCase().includes(item.subtopic.toLowerCase())
            );
            console.log(`DEBUG: Search subtopic by name \"${item.subtopic}\" result:`, subtopic ? `Found: ${subtopic.code} - ${subtopic.name}` : 'Not found');
          }
          
          if (subtopic) {
            questionData.subTopik = {
              label: `${subtopic.code} - ${subtopic.name}`,
              value: subtopic.id,
            };
            console.log(`DEBUG: Subtopic set successfully:`, questionData.subTopik);
          } else {
            const errorMsg = `Soal #${index + 1}: Subtopik "${item.subtopic_code || item.subtopic}" tidak ditemukan`;
            errors.push(errorMsg);
            console.log(`DEBUG: ${errorMsg}`);
          }
        }
      }

      // Search for passage if needed
      if (item.passageTitle) {
        console.log(`DEBUG: Searching for passage with title="${item.passageTitle}"`);
        try {
          const passageResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/questions/passage/search?search=${encodeURIComponent(item.passageTitle)}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
              },
            }
          );
          
          if (passageResponse.data && Array.isArray(passageResponse.data) && passageResponse.data.length > 0) {
            // Try to find exact match by title
            let matchedPassage = passageResponse.data.find((p: any) => 
              p.title?.toLowerCase() === item.passageTitle.toLowerCase()
            );
            
            if (!matchedPassage) {
              matchedPassage = passageResponse.data[0];
              warnings.push(`Soal #${index + 1}: Bacaan "${item.passageTitle}" tidak ditemukan exact match, menggunakan: ${matchedPassage.title}`);
            }
            
            questionData.passage = {
              id: matchedPassage.id,
              title: matchedPassage.title,
              passage: matchedPassage.passage,
            };
          } else {
            warnings.push(`Soal #${index + 1}: Bacaan "${item.passageTitle}" tidak ditemukan`);
          }
        } catch (error) {
          console.error('Error searching passage:', error);
          warnings.push(`Soal #${index + 1}: Gagal mencari bacaan "${item.passageTitle}"`);
        }
      }

      return { data: questionData, errors, warnings };
    } catch (error: any) {
      console.error('Error converting JSON item:', error);
      errors.push(`Soal #${index + 1}: Error - ${error.message}`);
      return { data: null, errors, warnings };
    }
  };

  const handleImportJSON = async () => {
    try {
      setImportError('');
      setIsProcessingImport(true);
      
      console.log('Parsing JSON...');
      const parsedData = JSON.parse(jsonInput);
      console.log('Parsed data:', parsedData);
      
      const validation = validateImportJSON(parsedData);
      console.log('Validation result:', validation);
      
      if (!validation.valid) {
        setImportError(validation.error || 'Format JSON tidak valid');
        setIsProcessingImport(false);
        return;
      }
      
      // Check if allExamTypes is loaded
      if (!allExamTypes || allExamTypes.length === 0) {
        console.error('ERROR: allExamTypes not loaded!', allExamTypes);
        setImportError('Exam types belum dimuat. Silakan tunggu sebentar dan coba lagi.');
        setIsProcessingImport(false);
        return;
      }
      
      console.log('All Exam Types loaded:', allExamTypes.length);
      console.log('Sample bidang:', allExamTypes.filter((et: any) => et.kind === 1).slice(0, 3));
      
      // Build exam types map for quick lookup
      const examTypesMap = new Map<number, any>();
      allExamTypes.forEach((et: any) => {
        examTypesMap.set(et.id, et);
      });
      
      // Convert all items to QuestionData
      const allErrors: string[] = [];
      const allWarnings: string[] = [];
      const convertedQuestions: QuestionData[] = [];
      
      for (let i = 0; i < parsedData.length; i++) {
        const item = parsedData[i];
        console.log(`Processing item ${i + 1}:`, {
          bidang: item.bidang,
          bidang_code: item.bidang_code,
          topik: item.topik,
          topic_code: item.topic_code,
          subtopic: item.subtopic,
          subtopic_code: item.subtopic_code,
          subtopic_id: item.subtopic_id
        });
        
        const result = await convertJSONItemToQuestionData(item, examTypesMap, i);
        
        if (result.data) {
          console.log(`Item ${i + 1} converted successfully:`, {
            bidang: result.data.bidang,
            topik: result.data.topik,
            subTopik: result.data.subTopik
          });
          convertedQuestions.push(result.data);
        } else {
          console.log(`Item ${i + 1} failed to convert`);
        }
        
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      }
      
      if (convertedQuestions.length === 0) {
        console.error('All errors:', allErrors);
        setImportError('Tidak ada soal yang berhasil diimport. Periksa format JSON dan data.');
        setIsProcessingImport(false);
        return;
      }
      
      // Set questions directly
      setQuestions(convertedQuestions);
      setOpenIndex(0);
      setShowImportModal(false);
      setJsonInput('');
      
      // Show summary
      let message = `Berhasil mengimport ${convertedQuestions.length} dari ${parsedData.length} soal!`;
      if (allErrors.length > 0) {
        message += `\\n\\nErrors (${allErrors.length}):\\n` + allErrors.slice(0, 5).join('\\n');
        if (allErrors.length > 5) {
          message += `\\n... dan ${allErrors.length - 5} error lainnya`;
        }
      }
      if (allWarnings.length > 0) {
        message += `\\n\\nWarnings (${allWarnings.length}):\\n` + allWarnings.slice(0, 5).join('\\n');
        if (allWarnings.length > 5) {
          message += `\\n... dan ${allWarnings.length - 5} warning lainnya`;
        }
      }
      
      alert(message);
      
    } catch (error: any) {
      console.error('Error in handleImportJSON:', error);
      setImportError(`Error: ${error.message || 'Format JSON tidak valid'}`);
    } finally {
      setIsProcessingImport(false);
    }
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

  // ===== EXPORT FUNCTIONS =====
  
  /**
   * Convert QuestionData to export JSON format
   */
  const convertQuestionDataToExportJSON = (questionData: QuestionData) => {
    const exportData: any = {
      level: questionData.level,
      questionType: questionData.questionType,
      questionText: questionData.questionText,
    };

    // Add bidang/topik/subtopik info
    if (questionData.bidang) {
      const bidangParts = questionData.bidang.label.split(' - ');
      exportData.bidang = bidangParts[1] || bidangParts[0] || '';
      exportData.bidang_code = bidangParts[0] || '';
    }

    if (questionData.topik) {
      const topikParts = questionData.topik.label.split(' - ');
      exportData.topik = topikParts[1] || topikParts[0] || '';
      exportData.topic_code = topikParts[0] || '';
    }

    if (questionData.subTopik) {
      const subtopikParts = questionData.subTopik.label.split(' - ');
      exportData.subtopic = subtopikParts[1] || subtopikParts[0] || '';
      exportData.subtopic_code = subtopikParts[0] || '';
      exportData.subtopic_id = questionData.subTopik.value;
    }

    // Add passage info
    if (questionData.hasPassage) {
      if (questionData.passage) {
        exportData.passageTitle = questionData.passage.title;
      } else if (questionData.createNewPassage && questionData.newPassageTitle) {
        exportData.passageTitle = questionData.newPassageTitle;
      }
    }

    // Add question-type-specific fields
    if (questionData.questionType === 'single-choice' || questionData.questionType === 'multiple-choice') {
      exportData.options = questionData.options;
      exportData.correctAnswer = questionData.correctAnswer;
    } else if (questionData.questionType === 'true-false') {
      exportData.statements = questionData.statements;
      exportData.correctAnswer = questionData.correctAnswer;
    } else if (questionData.questionType === 'number' || questionData.questionType === 'text') {
      exportData.answer = questionData.answer;
    }

    // Add explanation
    if (questionData.hasExplanation && questionData.explanationContent) {
      exportData.explanation = questionData.explanationContent;
    }

    return exportData;
  };

  /**
   * Export all questions to JSON
   */
  const handleExportAllToJSON = () => {
    if (questions.length === 0) {
      alert('Tidak ada soal untuk di-export');
      return;
    }

    try {
      const exportData = questions.map(q => convertQuestionDataToExportJSON(q));
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Download as JSON file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bulk-questions-export-${Date.now()}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`Berhasil export ${questions.length} soal ke JSON!`);
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      alert('Gagal export soal. Silakan coba lagi.');
    }
  };

  /**
   * Export single question to JSON
   */
  const handleExportSingleToJSON = (questionIndex: number) => {
    if (questionIndex < 0 || questionIndex >= questions.length) {
      alert('Soal tidak valid');
      return;
    }

    try {
      const questionData = questions[questionIndex];
      const exportData = convertQuestionDataToExportJSON(questionData);
      const jsonString = JSON.stringify([exportData], null, 2);
      
      // Download as JSON file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `question-${questionIndex + 1}-export-${Date.now()}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`Berhasil export soal #${questionIndex + 1} ke JSON!`);
    } catch (error) {
      console.error('Error exporting question to JSON:', error);
      alert('Gagal export soal. Silakan coba lagi.');
    }
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

  // MODIFIED downloadCSV function - Only 5 columns now
  const downloadCSV = (data: any[]) => {
    const successfulQuestions = data.filter((d) => d.success);

    if (successfulQuestions.length === 0) {
      alert('Tidak ada soal yang berhasil dibuat untuk di-export.');
      return;
    }

    // Header kolom - HANYA yang digunakan untuk import
    const headers = [
      'No',
      'ID Soal',
      'Kode Soal',
      'Level',
      'Tipe Soal',
    ];

    // Mapping data ke rows
    const rows = successfulQuestions.map((q) => {
      return [
        q.index,                    // No urut
        q.data.id,                  // ID dari database
        q.code,                     // Kode soal (misal: PM1-AR-OD-001)
        q.data.level,               // Level 1-5
        q.data.question_type,       // single-choice, dll
      ];
    });

    // Gabungkan header + rows menjadi CSV
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Download file
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
        setImportMode('json');
        setSelectedExam(null);
        setExamOptions([]);
      },
    },
    {
      action: 'save',
      text: importMode === 'json' 
        ? (isProcessingImport ? 'Memproses...' : 'Import Soal')
        : (isLoadingQuestions ? 'Memuat...' : 'Import dari Exam'),
      onClick: importMode === 'json' ? handleImportJSON : handleImportByExam,
      disabled: importMode === 'json' ? isProcessingImport : isLoadingQuestions,
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
                    customText="Import Soal"
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
                    action="custom"
                    customText="Export JSON"
                    onClick={handleExportAllToJSON}
                    size="md"
                    customIcon={<Download className="tw-w-4 tw-h-4" />}
                    customColors={{
                      primary: '#10B981',
                      secondary: '#059669',
                      gradient1: '#10B981',
                      gradient2: '#34D399',
                      text: '#FFFFFF'
                    }}
                    className="tw-flex-1 sm:tw-flex-none"
                    disabled={questions.length === 0}
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
                      onExport={(i) => handleExportSingleToJSON(i)}
                      isOpen={openIndex === idx}
                      onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
                      allExamTypes={allExamTypes}
                      isLoadingExamTypes={isLoadingExamTypes}
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
      
      {/* Import Modal with mode selection */}
      <LearningModal
        show={showImportModal}
        onHide={() => {
          setShowImportModal(false);
          setJsonInput('');
          setImportError('');
          setImportMode('json');
          setSelectedExam(null);
          setExamOptions([]);
        }}
        title="Import Soal"
        subtitle={importMode === 'json' ? 'Import dari JSON data' : 'Import dari Exam yang sudah ada'}
        icon={importMode === 'json' ? <FileJson className="tw-w-5 tw-h-5" /> : <BookOpen className="tw-w-5 tw-h-5" />}
        size="lg"
        width="95vw"
        height="90vh"
        scrollable={true}
        bottomButtons={importModalButtons}
        preventCloseOnOutsideClick={false}
      >
        <div className="tw-space-y-4 tw-w-full">
          {/* Import Mode Selection */}
          <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-indigo-50 tw-border-2 tw-border-purple-200 tw-rounded-lg tw-p-4">
            <h4 className="tw-text-purple-800 tw-font-semibold tw-mb-3">Pilih Mode Import</h4>
            <div className="tw-flex tw-gap-3">
              <button
                onClick={() => {
                  setImportMode('json');
                  setImportError('');
                }}
                className={`tw-flex-1 tw-p-4 tw-rounded-lg tw-border-2 tw-transition-all tw-duration-200 ${
                  importMode === 'json'
                    ? 'tw-border-purple-500 tw-bg-purple-100 tw-shadow-md'
                    : 'tw-border-gray-300 tw-bg-white hover:tw-border-purple-300'
                }`}
              >
                <div className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-mb-2">
                  <FileJson className={`tw-w-5 tw-h-5 ${importMode === 'json' ? 'tw-text-purple-600' : 'tw-text-gray-500'}`} />
                  <span className={`tw-font-semibold ${importMode === 'json' ? 'tw-text-purple-700' : 'tw-text-gray-700'}`}>
                    Import JSON
                  </span>
                </div>
                <p className="tw-text-xs tw-text-gray-600">
                  Paste JSON data soal
                </p>
              </button>
              
              <button
                onClick={() => {
                  setImportMode('exam');
                  setImportError('');
                  setJsonInput('');
                }}
                className={`tw-flex-1 tw-p-4 tw-rounded-lg tw-border-2 tw-transition-all tw-duration-200 ${
                  importMode === 'exam'
                    ? 'tw-border-indigo-500 tw-bg-indigo-100 tw-shadow-md'
                    : 'tw-border-gray-300 tw-bg-white hover:tw-border-indigo-300'
                }`}
              >
                <div className="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-mb-2">
                  <BookOpen className={`tw-w-5 tw-h-5 ${importMode === 'exam' ? 'tw-text-indigo-600' : 'tw-text-gray-500'}`} />
                  <span className={`tw-font-semibold ${importMode === 'exam' ? 'tw-text-indigo-700' : 'tw-text-gray-700'}`}>
                    Import by Exam
                  </span>
                </div>
                <p className="tw-text-xs tw-text-gray-600">
                  Import dari exam yang ada
                </p>
              </button>
            </div>
          </div>

          {/* JSON Import Mode */}
          {importMode === 'json' && (
            <>
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
            </>
          )}

          {/* Exam Import Mode */}
          {importMode === 'exam' && (
            <>
              <div className="tw-bg-indigo-50 tw-border-2 tw-border-indigo-200 tw-rounded-lg tw-p-4">
                <h4 className="tw-text-indigo-800 tw-font-semibold tw-mb-2 tw-flex tw-items-center tw-gap-2">
                  <BookOpen className="tw-w-5 tw-h-5" />
                  Import dari Exam
                </h4>
                <p className="tw-text-indigo-700 tw-text-sm">
                  Pilih exam yang ingin diimport soal-soalnya. Semua soal dalam exam akan diimport secara bulk.
                </p>
              </div>

              <div className="tw-w-full" style={{ position: 'relative', zIndex: 9999 }}>
                <SearchSingleField
                  label="Pilih Exam"
                  value={selectedExam}
                  options={examOptions}
                  onChange={(newValue) => {
                    setSelectedExam(newValue);
                    setImportError('');
                  }}
                  onInputChange={handleExamSearch}
                  isLoading={isLoadingExams}
                  required={true}
                  error={importError}
                  icon={<BookOpen size={16} />}
                />
              </div>

              <div className="tw-bg-yellow-50 tw-border-2 tw-border-yellow-200 tw-rounded-lg tw-p-4">
                <h4 className="tw-text-yellow-800 tw-font-semibold tw-mb-2">
                  ℹ️ Informasi
                </h4>
                <ul className="tw-text-yellow-700 tw-text-sm tw-space-y-1 tw-list-disc tw-list-inside">
                  <li>Semua soal dalam exam akan diimport</li>
                  <li>System akan otomatis fetch data Bidang, Topik, dan Subtopik</li>
                  <li>Bacaan (passage) akan disertakan jika ada</li>
                  <li>Pembahasan akan disertakan jika ada</li>
                  <li>Proses import mungkin membutuhkan waktu beberapa detik</li>
                </ul>
              </div>
            </> 
          )}

          {importError && (
            <div className="tw-bg-red-50 tw-border-2 tw-border-red-300 tw-rounded-lg tw-p-4">
              <p className="tw-text-red-700 tw-text-sm tw-font-medium">
                {importError}
              </p>
            </div>
          )}
        </div>
      </LearningModal>

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