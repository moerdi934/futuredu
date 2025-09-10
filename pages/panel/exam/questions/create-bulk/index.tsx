// pages/panel/exam/questions/create-bulk/index.tsx
'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Row,
  Col,
  Card,
} from 'react-bootstrap';
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
  Save,
  RotateCcw,
  Zap,
  Target,
  Award,
  Menu,
  Edit3,
  Type,
  Info,
  Layers,
  Image,
  Code,
  Hash,
  List,
  Palette
} from 'lucide-react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import SuperEditor from '../../../../../components/supereditor/SuperEditor';
import { useAuth } from '../../../../../context/AuthContext';
import {
  SearchSingleField,
  SelectCustomField,
  ShortFormField,
  WideFormField,
  YesNoField,
  SelectOption
} from '../../../../../components/form/FormComponentLayout';
import { LearningModal, ModalButton } from '../../../../../components/modal/ModalTemplate';
import { ButtonGradient } from '../../../../../components/button/ButtonTemplate';
import CreateBulkModal from './CreateBulkModal';

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
  passageSearchTerm: string;
  newPassageTitle: string;
  newPassageContent: string;
  showPassageModal: boolean;
  questionType: string;
  options: string[];
  correctAnswer: number[];
  statements: string[];
  answer: string;
  questionText: string;
  hasExplanation: boolean;
  explanationContent: string;
  bidangSearchTerm: string;
  topikSearchTerm: string;
  subTopikSearchTerm: string;
  // New fields for advanced editor
  useAdvancedQuestionEditor: boolean;
  useAdvancedOptionsEditor: boolean;
  useAdvancedPassageEditor: boolean;
  useAdvancedExplanationEditor: boolean;
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
  passageSearchTerm: '',
  newPassageTitle: '',
  newPassageContent: '',
  showPassageModal: false,
  questionType: 'single-choice',
  options: [''],
  correctAnswer: [],
  statements: [''],
  answer: '',
  questionText: '',
  hasExplanation: false,
  explanationContent: '',
  bidangSearchTerm: '',
  topikSearchTerm: '',
  subTopikSearchTerm: '',
  // New fields defaults
  useAdvancedQuestionEditor: false,
  useAdvancedOptionsEditor: false,
  useAdvancedPassageEditor: false,
  useAdvancedExplanationEditor: false,
};

// Custom Accordion Item Component
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
    <div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-purple-200 tw-overflow-visible">
      {/* Header */}
      <div 
        className="tw-cursor-pointer tw-select-none"
        onClick={handleToggle}
      >
        {header}
      </div>
      
      {/* Body */}
      <div 
        className={`tw-transition-all tw-duration-300 tw-ease-in-out ${
          isOpen 
            ? 'tw-max-h-none tw-opacity-100' 
            : 'tw-max-h-0 tw-opacity-0 tw-overflow-hidden'
        }`}
        style={{
          position: 'relative',
          zIndex: isOpen ? 10 : 1,
          overflow: isOpen ? 'visible' : 'hidden'
        }}
      >
        {isOpen && (
          <div 
            className="tw-bg-gray-50 tw-p-2 sm:tw-p-4 tw-rounded-b-lg"
            style={{
              position: 'relative',
              zIndex: 10,
              overflow: 'visible'
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

// Advanced Editor Toggle Component
const AdvancedEditorToggle: React.FC<{
  label: string;
  isAdvanced: boolean;
  onToggle: (advanced: boolean) => void;
  icon?: React.ReactNode;
}> = ({ label, isAdvanced, onToggle, icon }) => {
  return (
    <div className="tw-mb-4 tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-border-2 tw-border-blue-200 tw-rounded-xl tw-p-4">
      <div className="tw-flex tw-flex-col lg:tw-flex-row tw-justify-between tw-items-start lg:tw-items-center tw-gap-3">
        <div className="tw-flex tw-items-center tw-gap-3">
          {icon && (
            <div className="tw-bg-blue-100 tw-p-2 tw-rounded-lg">
              {React.cloneElement(icon as React.ReactElement, { 
                size: 18, 
                className: "tw-text-blue-600" 
              })}
            </div>
          )}
          <div>
            <h4 className="tw-text-blue-800 tw-font-semibold tw-text-sm sm:tw-text-base tw-mb-1">
              Editor Mode - {label}
            </h4>
            <p className="tw-text-blue-600 tw-text-xs sm:tw-text-sm tw-mb-2">
              {isAdvanced ? 'Advanced Editor' : 'Simple Text Editor'}
            </p>
          </div>
        </div>
        
        <div className="tw-flex tw-gap-2 tw-w-full lg:tw-w-auto">
          <ButtonGradient
            action={!isAdvanced ? 'apply' : 'custom'}
            customText="Simple"
            customIcon={<Type className="tw-w-4 tw-h-4" />}
            size="sm"
            onClick={() => onToggle(false)}
            customColors={!isAdvanced ? {
              primary: '#10B981',
              secondary: '#059669',
              gradient1: '#10B981',
              gradient2: '#34D399',
              text: '#FFFFFF'
            } : {
              primary: '#9CA3AF',
              secondary: '#6B7280',
              gradient1: '#9CA3AF',
              gradient2: '#D1D5DB',
              text: '#374151'
            }}
            className="tw-flex-1 lg:tw-flex-none"
          />
          <ButtonGradient
            action={isAdvanced ? 'apply' : 'custom'}
            customText="Advanced"
            customIcon={<Edit3 className="tw-w-4 tw-h-4" />}
            size="sm"
            onClick={() => onToggle(true)}
            customColors={isAdvanced ? {
              primary: '#8B5CF6',
              secondary: '#7C3AED',
              gradient1: '#8B5CF6',
              gradient2: '#A855F7',
              text: '#FFFFFF'
            } : {
              primary: '#9CA3AF',
              secondary: '#6B7280',
              gradient1: '#9CA3AF',
              gradient2: '#D1D5DB',
              text: '#374151'
            }}
            className="tw-flex-1 lg:tw-flex-none"
          />
        </div>
      </div>
      
      {/* Advanced Editor Info */}
      <div className="tw-mt-3 tw-bg-white tw-rounded-lg tw-p-3 tw-border tw-border-blue-200">
        <div className="tw-flex tw-items-start tw-gap-2">
          <Info className="tw-w-4 tw-h-4 tw-text-blue-500 tw-mt-0.5 tw-flex-shrink-0" />
          <div>
            <p className="tw-text-blue-700 tw-font-medium tw-text-xs sm:tw-text-sm tw-mb-2">
              Advanced Editor diperlukan untuk:
            </p>
            <div className="tw-grid tw-grid-cols-2 sm:tw-grid-cols-3 tw-gap-2 tw-text-xs tw-text-blue-600">
              <div className="tw-flex tw-items-center tw-gap-1">
                <List className="tw-w-3 tw-h-3" />
                <span>Lists</span>
              </div>
              <div className="tw-flex tw-items-center tw-gap-1">
                <Palette className="tw-w-3 tw-h-3" />
                <span>Coloring</span>
              </div>
              <div className="tw-flex tw-items-center tw-gap-1">
                <Hash className="tw-w-3 tw-h-3" />
                <span>Equations</span>
              </div>
              <div className="tw-flex tw-items-center tw-gap-1">
                <Layers className="tw-w-3 tw-h-3" />
                <span>Tables</span>
              </div>
              <div className="tw-flex tw-items-center tw-gap-1">
                <Image className="tw-w-3 tw-h-3" />
                <span>Images</span>
              </div>
              <div className="tw-flex tw-items-center tw-gap-1">
                <Code className="tw-w-3 tw-h-3" />
                <span>Code</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BulkQuestionItem: React.FC<{
  index: number;
  data: QuestionData;
  onChange: (index: number, data: QuestionData) => void;
  onRemove: (index: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ index, data, onChange, onRemove, isOpen, onToggle }) => {
  const { id } = useAuth();
  const userId = id || null;
  const dataRef = useRef(data);
  
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const debouncedSetBidangSearch = useCallback(
    debounce((val: string) => {
      const current = dataRef.current;
      onChange(index, { ...current, bidangSearchTerm: val });
    }, 300),
    [index, onChange]
  );
  
  const debouncedSetTopikSearch = useCallback(
    debounce((val: string) => {
      const current = dataRef.current;
      onChange(index, { ...current, topikSearchTerm: val });
    }, 300),
    [index, onChange]
  );
  
  const debouncedSetSubTopikSearch = useCallback(
    debounce((val: string) => {
      const current = dataRef.current;
      onChange(index, { ...current, subTopikSearchTerm: val });
    }, 300),
    [index, onChange]
  );
  
  const debouncedSetPassageSearch = useCallback(
    debounce((val: string) => {
      const current = dataRef.current;
      onChange(index, { ...current, passageSearchTerm: val });
    }, 500),
    [index, onChange]
  );

  // API calls (same as before)
  useEffect(() => {
    const fetchBidang = async (searchTerm: string = '') => {
      const curr = dataRef.current;
      onChange(index, { ...curr, isLoadingBidang: true });
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=${searchTerm}&kind=1`
        );
        if (response.data && Array.isArray(response.data.examTypes)) {
          const formattedOptions = response.data.examTypes.map((exam: any) => ({
            label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
            value: exam.id,
            code: exam.code,
          }));
          const curr2 = dataRef.current;
          onChange(index, {
            ...curr2,
            bidangOptions: formattedOptions,
            isLoadingBidang: false,
          });
        } else {
          const curr2 = dataRef.current;
          onChange(index, { ...curr2, bidangOptions: [], isLoadingBidang: false });
        }
      } catch {
        const curr2 = dataRef.current;
        onChange(index, { ...curr2, bidangOptions: [], isLoadingBidang: false });
      }
    };

    fetchBidang(dataRef.current.bidangSearchTerm);
  }, [dataRef.current.bidangSearchTerm]);

  useEffect(() => {
    if (!dataRef.current.bidang) {
      const curr = dataRef.current;
      onChange(index, {
        ...curr,
        topikOptions: [],
        topik: null,
        subTopikOptions: [],
        subTopik: null,
      });
      return;
    }

    const fetchTopik = async (searchTerm: string = '') => {
      const curr = dataRef.current;
      onChange(index, { ...curr, isLoadingTopik: true });
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=${searchTerm}&kind=2&masterId=${dataRef.current.bidang?.value}`
        );
        if (response.data && Array.isArray(response.data.examTypes)) {
          const formattedOptions = response.data.examTypes.map((exam: any) => ({
            label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
            value: exam.id,
            code: exam.code,
          }));
          const curr2 = dataRef.current;
          onChange(index, {
            ...curr2,
            topikOptions: formattedOptions,
            isLoadingTopik: false,
          });
        } else {
          const curr2 = dataRef.current;
          onChange(index, { ...curr2, topikOptions: [], isLoadingTopik: false });
        }
      } catch {
        const curr2 = dataRef.current;
        onChange(index, { ...curr2, topikOptions: [], isLoadingTopik: false });
      }
    };

    fetchTopik(dataRef.current.topikSearchTerm);
  }, [dataRef.current.bidang, dataRef.current.topikSearchTerm]);

  useEffect(() => {
    if (!dataRef.current.topik) {
      const curr = dataRef.current;
      onChange(index, {
        ...curr,
        subTopikOptions: [],
        subTopik: null,
      });
      return;
    }

    const fetchSubTopik = async (searchTerm: string = '') => {
      const curr = dataRef.current;
      onChange(index, { ...curr, isLoadingSubTopik: true });
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=${searchTerm}&kind=3&masterId=${dataRef.current.topik?.value}`
        );
        if (response.data && Array.isArray(response.data.examTypes)) {
          const formattedOptions = response.data.examTypes.map((exam: any) => ({
            label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
            value: exam.id,
            NextID: exam.NextID,
            code: exam.code,
          }));
          const curr2 = dataRef.current;
          onChange(index, {
            ...curr2,
            subTopikOptions: formattedOptions,
            isLoadingSubTopik: false,
          });
        } else {
          const curr2 = dataRef.current;
          onChange(index, { ...curr2, subTopikOptions: [], isLoadingSubTopik: false });
        }
      } catch {
        const curr2 = dataRef.current;
        onChange(index, { ...curr2, subTopikOptions: [], isLoadingSubTopik: false });
      }
    };

    fetchSubTopik(dataRef.current.subTopikSearchTerm);
  }, [dataRef.current.topik, dataRef.current.subTopikSearchTerm]);

  useEffect(() => {
    if (!dataRef.current.hasPassage) {
      const curr = dataRef.current;
      onChange(index, {
        ...curr,
        passageSearchResults: [],
        passage: null,
      });
      return;
    }

    const fetchPassages = async (searchTerm: string = '') => {
      const curr = dataRef.current;
      onChange(index, { ...curr, isLoadingPassage: true });
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/questions/passage/search?search=${searchTerm}`
        );
        if (response.data && Array.isArray(response.data)) {
          const curr2 = dataRef.current;
          onChange(index, {
            ...curr2,
            passageSearchResults: response.data,
            isLoadingPassage: false,
          });
        } else {
          const curr2 = dataRef.current;
          onChange(index, { ...curr2, passageSearchResults: [], isLoadingPassage: false });
        }
      } catch {
        const curr2 = dataRef.current;
        onChange(index, { ...curr2, passageSearchResults: [], isLoadingPassage: false });
      }
    };

    fetchPassages(dataRef.current.passageSearchTerm);
  }, [dataRef.current.hasPassage, dataRef.current.passageSearchTerm]);

  const createPassage = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/passage`,
        {
          title: dataRef.current.newPassageTitle,
          passage: dataRef.current.newPassageContent,
          create_user_id: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      const curr = dataRef.current;
      onChange(index, {
        ...curr,
        passage: {
          id: response.data.id,
          title: curr.newPassageTitle,
          passage: curr.newPassageContent,
        },
        showPassageModal: false,
        createNewPassage: false,
      });
    } catch {
      // Handle error if needed
    }
  };

  // Modal buttons for passage creation
  const passageModalButtons: ModalButton[] = [
    {
      action: 'cancel',
      text: 'Batal',
      icon: <X className="tw-w-4 tw-h-4" />,
      onClick: () => {
        const updated = {
          ...data,
          showPassageModal: false,
          createNewPassage: false,
        };
        onChange(index, updated);
      }
    },
    {
      action: 'save',
      text: 'Simpan Bacaan',
      icon: <Check className="tw-w-4 tw-h-4" />,
      onClick: createPassage,
      disabled: !data.newPassageTitle.trim() || !data.newPassageContent.trim()
    }
  ];

  // Header Component
  const headerContent = (
    <div className="tw-relative">
      <div className="tw-pr-12 sm:tw-pr-20 md:tw-pr-24 tw-p-4 tw-bg-gradient-to-r tw-from-purple-50 tw-to-indigo-50 tw-border-b tw-border-purple-200">
        <div className="tw-flex tw-items-center tw-space-x-2 tw-w-full tw-min-w-0">
          {isOpen ? (
            <ChevronUp className="tw-w-4 tw-h-4 tw-text-purple-600 tw-shrink-0" />
          ) : (
            <ChevronDown className="tw-w-4 tw-h-4 tw-text-purple-600 tw-shrink-0" />
          )}
          <span className="tw-font-semibold tw-text-sm sm:tw-text-lg tw-text-purple-700 tw-truncate">
            Pertanyaan {index + 1}
          </span>
        </div>
      </div>
      
      {/* Responsive delete button */}
      <div className="tw-absolute tw-right-2 sm:tw-right-4 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-z-20">
        {/* Mobile version - icon only */}
        <div className="sm:tw-hidden">
          <ButtonGradient
            action="delete"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            customIcon={<Trash2 className="tw-w-3 tw-h-3" />}
            customText=""
            className="tw-px-2 tw-py-2 tw-min-w-0"
          />
        </div>
        
        {/* Desktop version - with text */}
        <div className="tw-hidden sm:tw-block">
          <ButtonGradient
            action="delete"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            customIcon={<Trash2 className="tw-w-4 tw-h-4" />}
            customText="Hapus"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CustomAccordionItem
        eventKey={String(index)}
        activeKey={isOpen ? String(index) : null}
        onToggle={() => onToggle()}
        header={headerContent}
      >
        {/* Content with proper z-index and overflow handling */}
        <div 
          className="tw-space-y-4"
          style={{
            position: 'relative',
            zIndex: 100,
            overflow: 'visible'
          }}
        >
          {/* Basic Question Info Grid */}
          <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-3 sm:tw-gap-4 tw-mb-4 sm:tw-mb-6">
            <div 
              className="tw-w-full tw-min-w-0"
              style={{ position: 'relative', zIndex: 103 }}
            >
              <SearchSingleField
                label="Bidang"
                value={data.bidang}
                options={data.bidangOptions}
                onChange={(newValue) => {
                  const updated = {
                    ...data,
                    bidang: newValue,
                    topik: null,
                    subTopik: null,
                    topikOptions: [],
                    subTopikOptions: [],
                    topikSearchTerm: '',
                    subTopikSearchTerm: '',
                  };
                  onChange(index, updated);
                }}
                onInputChange={(val: string) => debouncedSetBidangSearch(val)}
                isLoading={data.isLoadingBidang}
                icon={<Award size={16} />}
                required
              />
            </div>
            {data.bidang && (
              <div 
                className="tw-w-full tw-min-w-0"
                style={{ position: 'relative', zIndex: 102 }}
              >
                <SearchSingleField
                  label="Topik"
                  value={data.topik}
                  options={data.topikOptions}
                  onChange={(newValue) => {
                    const updated = {
                      ...data,
                      topik: newValue,
                      subTopik: null,
                      subTopikOptions: [],
                      subTopikSearchTerm: '',
                    };
                    onChange(index, updated);
                  }}
                  onInputChange={(val: string) => debouncedSetTopikSearch(val)}
                  isLoading={data.isLoadingTopik}
                  icon={<BookOpen size={16} />}
                  required
                />
              </div>
            )}
            {data.topik && (
              <div 
                className="tw-w-full tw-min-w-0 sm:tw-col-span-2 lg:tw-col-span-1"
                style={{ position: 'relative', zIndex: 101 }}
              >
                <SearchSingleField
                  label="Sub Topik"
                  value={
                    data.subTopik
                      ? { label: data.subTopik.label, value: data.subTopik.value }
                      : null
                  }
                  options={data.subTopikOptions.map((opt: any) => ({
                    label: opt.label,
                    value: opt.value,
                  }))}
                  onChange={(newValue) => {
                    const selected = data.subTopikOptions.find(
                      (p: any) => p.value === newValue?.value
                    );
                    const updated = {
                      ...data,
                      subTopik: selected || null,
                    };
                    onChange(index, updated);
                  }}
                  onInputChange={(val: string) => debouncedSetSubTopikSearch(val)}
                  isLoading={data.isLoadingSubTopik}
                  icon={<Target size={16} />}
                  required
                />
              </div>
            )}
          </div>

          <div className="tw-mb-4 sm:tw-mb-6 tw-w-full tw-min-w-0">
            <SelectCustomField
              label="Level"
              value={
                data.level !== null
                  ? levelOptions.find((opt) => opt.value === data.level) || null
                  : null
              }
              options={levelOptions}
              onChange={(newValue) => {
                const updated = { ...data, level: newValue ? newValue.value : null };
                onChange(index, updated);
              }}
              required
            />
          </div>

          {/* Passage Section */}
          <div 
            className="tw-mb-4 sm:tw-mb-6 tw-w-full tw-overflow-visible"
            style={{ position: 'relative', zIndex: 100 }}
          >
            <div className="tw-w-full tw-min-w-0">
              <YesNoField
                label="Ada Bacaan"
                checked={data.hasPassage}
                onChange={(checked) => {
                  const updated = {
                    ...data,
                    hasPassage: checked,
                    passage: checked ? data.passage : null,
                    passageSearchResults: checked ? data.passageSearchResults : [],
                    passageSearchTerm: '',
                  };
                  onChange(index, updated);
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
                        const updated = { ...data, createNewPassage: false };
                        onChange(index, updated);
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
                        const updated = {
                          ...data,
                          createNewPassage: true,
                          showPassageModal: true,
                        };
                        onChange(index, updated);
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
                        const updated = { ...data, passage: selected || null };
                        onChange(index, updated);
                      }}
                      onInputChange={(val: string) => debouncedSetPassageSearch(val)}
                      isLoading={data.isLoadingPassage}
                      required
                    />
                    {data.passage && (
                      <div className="tw-mt-4 tw-w-full tw-overflow-hidden">
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

          {/* Question Type Selection */}
          <div className="tw-mb-4 sm:tw-mb-6 tw-w-full tw-min-w-0">
            <SelectCustomField
              label="Tipe Soal"
              value={
                questionTypeOptions.find((opt) => opt.value === data.questionType) ||
                questionTypeOptions[0]
              }
              options={questionTypeOptions}
              onChange={(newValue) => {
                const updated = {
                  ...data,
                  questionType: newValue?.value.toString() || 'single-choice',
                  options: [''],
                  correctAnswer: [],
                  statements: [''],
                  answer: '',
                };
                onChange(index, updated);
              }}
              required
            />
          </div>

          {/* Question Text Section with Advanced Editor Toggle */}
          <div className="tw-mb-4 sm:tw-mb-6 tw-w-full tw-min-w-0">
            <AdvancedEditorToggle
              label="Teks Soal"
              isAdvanced={data.useAdvancedQuestionEditor}
              onToggle={(advanced) => {
                const updated = { ...data, useAdvancedQuestionEditor: advanced };
                onChange(index, updated);
              }}
              icon={<BookOpen className="tw-w-4 tw-h-4" />}
            />

            <Form.Group>
              <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-space-x-2 tw-text-sm sm:tw-text-base">
                <BookOpen className="tw-w-4 tw-h-4" />
                <span>
                  Teks Soal <span className="tw-text-red-500">*</span>
                </span>
              </Form.Label>
              <div className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2 tw-shadow-sm tw-w-full tw-overflow-hidden">
                {data.useAdvancedQuestionEditor ? (
                  <SuperEditor
                    onChange={(html) => {
                      const updated = { ...data, questionText: html };
                      onChange(index, updated);
                    }}
                    initialValue="<p>Mulai mengetik soal di sini...</p>"
                  />
                ) : (
                  <WideFormField
                    label=""
                    value={data.questionText}
                    onChange={(e) => {
                      const updated = { ...data, questionText: e.target.value };
                      onChange(index, updated);
                    }}
                  />
                )}
              </div>
            </Form.Group>
          </div>

          {/* Question Options/Statements/Answer based on type */}
          {(data.questionType === 'single-choice' || data.questionType === 'multiple-choice') && (
            <div className="tw-mb-4 sm:tw-mb-6 tw-w-full tw-overflow-hidden">
              <AdvancedEditorToggle
                label="Opsi Jawaban"
                isAdvanced={data.useAdvancedOptionsEditor}
                onToggle={(advanced) => {
                  const updated = { ...data, useAdvancedOptionsEditor: advanced };
                  onChange(index, updated);
                }}
                icon={<Check className="tw-w-4 tw-h-4" />}
              />

              <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-4 tw-flex tw-items-center tw-space-x-2 tw-text-sm sm:tw-text-base">
                <div className="tw-bg-purple-100 tw-p-1 tw-rounded">
                  <Check className="tw-w-4 tw-h-4 tw-text-purple-600" />
                </div>
                <span>Opsi Jawaban</span>
              </Form.Label>
              <Row className="tw-g-2 sm:tw-g-4">
                {data.options.map((option: string, idx: number) => (
                  <Col xs={12} lg={6} key={idx} className="tw-mb-3 sm:tw-mb-4">
                    <Card className="tw-border-2 tw-border-purple-200 tw-rounded-lg tw-shadow-sm hover:tw-shadow-md tw-transition-all tw-duration-200">
                      <Card.Body className="tw-p-3 sm:tw-p-4">
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
                                const updated = { ...data, correctAnswer: updatedCorrect };
                                onChange(index, updated);
                              }}
                            />
                          </div>
                        </div>
                        <div className="tw-bg-gray-50 tw-rounded-lg tw-border tw-border-gray-200 tw-w-full tw-overflow-hidden">
                          {data.useAdvancedOptionsEditor ? (
                            <SuperEditor
                              onChange={(html) => {
                                const newOptions = [...data.options];
                                newOptions[idx] = html;
                                const updated = { ...data, options: newOptions };
                                onChange(index, updated);
                              }}
                              initialValue="<p>Masukkan teks opsi...</p>"
                              height="80px"
                            />
                          ) : (
                            <div className="tw-p-2">
                              <WideFormField
                                label=""
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...data.options];
                                  newOptions[idx] = e.target.value;
                                  const updated = { ...data, options: newOptions };
                                  onChange(index, updated);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
              <div className="tw-w-full tw-overflow-hidden">
                <ButtonGradient
                  action="add"
                  customText="Tambah Opsi"
                  onClick={() => {
                    const updated = { ...data, options: [...data.options, ''] };
                    onChange(index, updated);
                  }}
                  disabled={data.options.length >= optionLabels.length}
                  size="md"
                />
              </div>
            </div>
          )}

          {/* True/False Statements */}
          {data.questionType === 'true-false' && (
            <div className="tw-mb-4 sm:tw-mb-6 tw-w-full tw-overflow-hidden">
              <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-4 tw-flex tw-items-center tw-space-x-2 tw-text-sm sm:tw-text-base">
                <BookOpen className="tw-w-4 tw-h-4" />
                <span>Pernyataan</span>
              </Form.Label>
              <div className="tw-space-y-3 sm:tw-space-y-4">
                {data.statements.map((statement: string, idx: number) => (
                  <div
                    key={idx}
                    className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-3 sm:tw-p-4 tw-shadow-sm tw-w-full tw-overflow-hidden"
                  >
                    <div className="tw-flex tw-flex-col lg:tw-flex-row tw-gap-3 lg:tw-items-center">
                      <div className="tw-flex-1 tw-min-w-0">
                        <ShortFormField
                          label={`Pernyataan ${idx + 1}`}
                          value={statement}
                          onChange={(e) => {
                            const newStatements = [...data.statements];
                            newStatements[idx] = e.target.value;
                            const updated = { ...data, statements: newStatements };
                            onChange(index, updated);
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
                              const updated = { ...data, correctAnswer: newCorrect };
                              onChange(index, updated);
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
                              const updated = { ...data, correctAnswer: newCorrect };
                              onChange(index, updated);
                            }}
                            className="tw-w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="tw-mt-4 sm:tw-mt-6 tw-w-full tw-overflow-hidden">
                <ButtonGradient
                  action="add"
                  customText="Tambah Pernyataan"
                  onClick={() => {
                    const updated = {
                      ...data,
                      statements: [...data.statements, ''],
                      correctAnswer: [...(data.correctAnswer as boolean[]), false],
                    };
                    onChange(index, updated);
                  }}
                  size="md"
                />
              </div>
            </div>
          )}

          {/* Number/Text Answer */}
          {(data.questionType === 'number' || data.questionType === 'text') && (
            <div className="tw-mb-4 sm:tw-mb-6 tw-w-full tw-min-w-0">
              <ShortFormField
                label="Jawaban Benar"
                value={data.answer}
                onChange={(e) => {
                  const updated = { ...data, answer: e.target.value };
                  onChange(index, updated);
                }}
                required
              />
            </div>
          )}

          {/* Explanation Section */}
          <div className="tw-mb-4 sm:tw-mb-6 tw-w-full tw-overflow-hidden">
            <div className="tw-w-full tw-min-w-0">
              <YesNoField
                label="Ada Pembahasan"
                checked={data.hasExplanation}
                onChange={(checked) => {
                  const updated = { ...data, hasExplanation: checked };
                  onChange(index, updated);
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
              <div className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-3 sm:tw-p-4 tw-shadow-sm tw-mt-2 tw-w-full tw-overflow-hidden">
                <AdvancedEditorToggle
                  label="Pembahasan"
                  isAdvanced={data.useAdvancedExplanationEditor}
                  onToggle={(advanced) => {
                    const updated = { ...data, useAdvancedExplanationEditor: advanced };
                    onChange(index, updated);
                  }}
                  icon={<FileText className="tw-w-4 tw-h-4" />}
                />

                <Form.Group>
                  <Form.Label className="tw-text-purple-700 tw-font-medium tw-text-sm sm:tw-text-base">
                    Isi Pembahasan <span className="tw-text-red-500">*</span>
                  </Form.Label>
                  <div className="tw-bg-gray-50 tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2 tw-w-full tw-overflow-hidden">
                    {data.useAdvancedExplanationEditor ? (
                      <SuperEditor
                        onChange={(html) => {
                          const updated = { ...data, explanationContent: html };
                          onChange(index, updated);
                        }}
                        initialValue="<p>Mulai mengetik pembahasan di sini...</p>"
                      />
                    ) : (
                      <WideFormField
                        label=""
                        value={data.explanationContent}
                        onChange={(e) => {
                          const updated = { ...data, explanationContent: e.target.value };
                          onChange(index, updated);
                        }}
                      />
                    )}
                  </div>
                </Form.Group>
              </div>
            )}
          </div>
        </div>
      </CustomAccordionItem>

      {/* Passage Creation Modal */}
      <LearningModal
        show={data.showPassageModal}
        onHide={() => {
          const updated = {
            ...data,
            showPassageModal: false,
            createNewPassage: false,
          };
          onChange(index, updated);
        }}
        title="Buat Bacaan Baru"
        subtitle="Buat bacaan baru untuk soal"
        icon={<BookOpen className="tw-w-5 tw-h-5" />}
        size="lg"
        width="95vw"
        height="90vh"
        scrollable={true}
        bottomButtons={passageModalButtons}
        preventCloseOnOutsideClick={false}
      >
        <div className="tw-space-y-3 sm:tw-space-y-4 tw-w-full tw-overflow-hidden">
          <div className="tw-w-full tw-min-w-0">
            <ShortFormField
              label="Judul Bacaan"
              value={data.newPassageTitle}
              onChange={(e) => {
                const updated = {
                  ...data,
                  newPassageTitle: e.target.value,
                };
                onChange(index, updated);
              }}
              required
            />
          </div>
          
          {/* Advanced Editor Toggle for Passage */}
          <AdvancedEditorToggle
            label="Isi Bacaan"
            isAdvanced={data.useAdvancedPassageEditor}
            onToggle={(advanced) => {
              const updated = { ...data, useAdvancedPassageEditor: advanced };
              onChange(index, updated);
            }}
            icon={<BookOpen className="tw-w-4 tw-h-4" />}
          />
          
          <Form.Group className="tw-w-full tw-min-w-0">
            <Form.Label className="tw-text-purple-700 tw-font-medium tw-text-sm sm:tw-text-base">
              Isi Bacaan <span className="tw-text-red-500">*</span>
            </Form.Label>
            <div className="tw-bg-gray-50 tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2 tw-shadow-sm tw-w-full tw-overflow-hidden">
              {data.useAdvancedPassageEditor ? (
                <SuperEditor
                  onChange={(html) => {
                    const updated = { ...data, newPassageContent: html };
                    onChange(index, updated);
                  }}
                  initialValue="<p>Mulai mengetik bacaan di sini...</p>"
                  height="300px"
                />
              ) : (
                <WideFormField
                  label=""
                  value={data.newPassageContent}
                  onChange={(e) => {
                    const updated = { ...data, newPassageContent: e.target.value };
                    onChange(index, updated);
                  }}
                />
              )}
            </div>
          </Form.Group>
        </div>
      </LearningModal>
    </>
  );
};

const CreateQuestionBulk: React.FC = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionData[]>([{ ...initialQuestionData }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [autoExport, setAutoExport] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const addQuestion = () => {
    const newIndex = questions.length;
    setQuestions((prev) => [...prev, { ...initialQuestionData }]);
    setOpenIndex(newIndex);
  };

  const updateQuestion = (idx: number, data: QuestionData) => {
    const updated = [...questions];
    updated[idx] = data;
    setQuestions(updated);
  };

  const removeQuestion = (idx: number) => {
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    if (openIndex === idx) {
      setOpenIndex(updated.length > 0 ? 0 : null);
    } else if (openIndex !== null && openIndex > idx) {
      setOpenIndex(openIndex - 1);
    }
  };

  const downloadCSV = (data: any[]) => {
    if (data.length === 0) return;
    
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `${today}_${data.length}_questions.csv`;
    
    const headers = ['id', 'code', 'question_type', 'level'];
    const rows = data.map(q => [q.id, q.code, q.question_type, q.level]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n' 
      + rows.map(row => row.join(',')).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    // Validate questions before submitting
    const invalidQuestions = questions.filter((q, idx) => {
      if (!q.subTopik?.value) {
        alert(`Pertanyaan ${idx + 1}: Sub Topik harus dipilih`);
        return true;
      }
      if (!q.level) {
        alert(`Pertanyaan ${idx + 1}: Level harus dipilih`);
        return true;
      }
      if (!q.questionText?.trim()) {
        alert(`Pertanyaan ${idx + 1}: Teks soal harus diisi`);
        return true;
      }
      return false;
    });

    if (invalidQuestions.length > 0) {
      return;
    }

    setIsSubmitting(true);
    
    const prepared = questions.map((q) => {
      let updatedCorrectAnswer: string[] | number[] | undefined;
      
      if (q.questionType === 'true-false') {
        updatedCorrectAnswer = (q.correctAnswer as boolean[]).map((ans) => 
          ans ? 'true' : 'false'
        );
      } else if (q.questionType === 'number' || q.questionType === 'text') {
        updatedCorrectAnswer = [q.answer];
      } else if (q.questionType === 'single-choice' || q.questionType === 'multiple-choice') {
        updatedCorrectAnswer = (q.correctAnswer as number[])
          .map((index) => optionLabels[index])
          .sort();
      }

      return {
        question_topic_type: q.subTopik?.value || null,
        question_text: q.questionText,
        question_type: q.questionType,
        options: 
          q.questionType === 'single-choice' || q.questionType === 'multiple-choice'
            ? q.options 
            : undefined,
        correct_answer: updatedCorrectAnswer,
        statements: q.questionType === 'true-false' ? q.statements : undefined,
        explanation: q.hasExplanation ? q.explanationContent : null,
        passage_id: q.hasPassage ? q.passage?.id || null : null,
        level: q.level,
      };
    });

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/questions/bulk`,
        { questions: prepared },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      
      setSuccessData(response.data);
      setShowSuccessModal(true);
      
      if (autoExport) {
        downloadCSV(response.data);
      }
    } catch (error) {
      console.error('Error creating questions:', error);
      alert('Terjadi kesalahan saat membuat soal. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setQuestions([{ ...initialQuestionData }]);
    setOpenIndex(0);
    setShowSuccessModal(false);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <MainLayout>
      <div className="tw-min-h-screen tw-w-full tw-overflow-x-hidden">
        <div className="tw-p-3 sm:tw-p-6 tw-bg-gradient-to-br tw-from-purple-50 tw-via-white tw-to-indigo-50">
          <div className="tw-max-w-full tw-mx-auto tw-overflow-hidden">
            {/* Header Card */}
            <Card className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-text-white tw-rounded-xl sm:tw-rounded-2xl tw-shadow-xl sm:tw-shadow-2xl tw-border-0 tw-mb-4 sm:tw-mb-6 tw-w-full tw-overflow-hidden">
              <Card.Body className="tw-p-4 sm:tw-p-6">
                <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-3 sm:tw-gap-4">
                  <div className="tw-flex tw-items-center tw-space-x-3 sm:tw-space-x-4 tw-min-w-0 tw-flex-1">
                    <div className="tw-bg-white/20 tw-p-2 sm:tw-p-3 tw-rounded-lg sm:tw-rounded-xl tw-flex-shrink-0">
                      <BookOpen className="tw-w-6 tw-h-6 sm:tw-w-8 sm:tw-h-8" />
                    </div>
                    <div className="tw-min-w-0 tw-flex-1">
                      <h1 className="tw-text-xl sm:tw-text-2xl tw-font-bold tw-mb-1 tw-break-words">Buat Banyak Soal</h1>
                      <p className="tw-text-purple-100 tw-text-xs sm:tw-text-sm tw-break-words">
                        Buat beberapa soal sekaligus dengan Advanced Editor yang mendukung formatting lengkap
                      </p>
                    </div>
                  </div>
                  <div className="tw-flex tw-gap-2 sm:tw-gap-3 tw-w-full sm:tw-w-auto tw-flex-shrink-0">
                    <ButtonGradient
                      action="back"
                      customText="Kembali"
                      onClick={handleBack}
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
              </Card.Body>
            </Card>

            {/* Stats & Controls Card */}
            <Card className="tw-bg-white tw-rounded-lg sm:tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-purple-200 tw-mb-4 sm:tw-mb-6 tw-w-full tw-overflow-hidden">
              <Card.Body className="tw-p-4 sm:tw-p-6">
                <div className="tw-flex tw-flex-col lg:tw-flex-row tw-justify-between tw-items-start lg:tw-items-center tw-gap-4">
                  <div className="tw-flex tw-items-center tw-gap-4 sm:tw-gap-6">
                    <div className="tw-bg-purple-100 tw-rounded-lg tw-p-3 sm:tw-p-4 tw-flex-shrink-0">
                      <div className="tw-text-purple-600 tw-text-xs sm:tw-text-sm tw-font-medium">Total Soal</div>
                      <div className="tw-text-xl sm:tw-text-2xl tw-font-bold tw-text-purple-800">{questions.length}</div>
                    </div>
                  </div>

                  <div className="tw-w-full lg:tw-w-auto lg:tw-flex-1 lg:tw-justify-end lg:tw-flex">
                    <div className="tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50 tw-border-2 tw-border-blue-200 tw-rounded-lg sm:tw-rounded-xl tw-p-3 sm:tw-p-4 tw-w-full lg:tw-min-w-[300px] lg:tw-max-w-[350px] tw-overflow-hidden">
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
              </Card.Body>
            </Card>

            {/* Questions Container */}
            <Card className="tw-bg-white tw-rounded-lg sm:tw-rounded-xl tw-shadow-lg tw-border-2 tw-border-purple-200 tw-w-full tw-overflow-visible">
              <Card.Body className="tw-p-3 sm:tw-p-6">
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
              </Card.Body>
            </Card>

            {/* Submit Section */}
            {questions.length > 0 && (
              <Card className="tw-bg-gradient-to-r tw-from-green-50 tw-to-emerald-50 tw-border-2 tw-border-green-200 tw-rounded-lg sm:tw-rounded-xl tw-shadow-lg tw-mt-4 sm:tw-mt-6 tw-w-full tw-overflow-hidden">
                <Card.Body className="tw-p-4 sm:tw-p-6">
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
                </Card.Body>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <CreateBulkModal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        data={successData}
        autoExported={autoExport}
        onReset={handleReset}
        onExport={() => downloadCSV(successData)}
        onNavigate={() => router.push('/panel/exam/questions')}
      />
    </MainLayout>
  );
};

export default CreateQuestionBulk;