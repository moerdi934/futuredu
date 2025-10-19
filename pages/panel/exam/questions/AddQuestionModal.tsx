'use client';

/**
 * ./AddQuestionModal.tsx
 * --------------------------------------------------------------------------
 * Modal "Tambah Soal Baru" – Updated untuk menggunakan LearningModal dan FormComponentLayout
 * Menggunakan LearningModal dan form components yang konsisten dengan AddExamModal
 * Termasuk button untuk buat banyak sekaligus ke /panel/exam/questions/create-bulk
 * --------------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Row,
  Col,
  Card,
  Button,
  Alert
} from 'react-bootstrap';
import axios from 'axios';
import debounce from 'lodash/debounce';

import {
  SearchSingleField,
  SelectCustomField,
  ShortFormField,
  YesNoField
} from '../../../../components/form/FormComponentLayout';

import {
  BookOpen,
  FileText,
  Check,
  X,
  Bookmark,
  FilePlus,
  Plus,
  RotateCcw,
  XCircle,
  CheckCircle,
  Award,
  Target,
  User,
  Zap
} from 'lucide-react';

import { LearningModal, ModalButton } from '../../../../components/modal/ModalTemplate';
import SuperEditor from '../../../../components/supereditor/SuperEditor';
import { useAuth } from '../../../../context/AuthContext';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
interface Question {
  exam_type_id: number | string;
  question_topic_type: number | string;
  question_text: string;
  question_type: string;
  options?: string[];
  correct_answer?: string[] | number[];
  statements?: string[];
  create_user_id?: number | string;
  question_code: string;
  explanation?: string | null;
  passage_id?: number | string | null;
  passage?: string | null;
  level: number | null;
}

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
}

interface ExamType {
  id: number;
  name: string;
  code: string;
  total: string;
  NextID?: string;
}

interface Passage {
  id: number;
  title: string;
  passage: string;
}

interface SelectOption {
  label: string;
  value: number;
  code?: string;
  NextID?: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const router = useRouter();
  const { id } = useAuth();
  const userId = id || null;

  /* -------------------------- State ---------------------------------- */
  const [bidang, setBidang] = useState<SelectOption | null>(null);
  const [topik, setTopik] = useState<SelectOption | null>(null);
  const [subTopik, setSubTopik] = useState<SelectOption | null>(null);
  const [questionCode, setQuestionCode] = useState<string>('');
  
  const [bidangOptions, setBidangOptions] = useState<SelectOption[]>([]);
  const [topikOptions, setTopikOptions] = useState<SelectOption[]>([]);
  const [subTopikOptions, setSubTopikOptions] = useState<SelectOption[]>([]);
  
  const [questionType, setQuestionType] = useState<string>('single-choice');
  const [questionText, setQuestionText] = useState<string>('');
  const [level, setLevel] = useState<number | null>(null);
  
  // Options for single/multiple choice
  const [options, setOptions] = useState<string[]>(['']);
  const [correctAnswer, setCorrectAnswer] = useState<number[]>([]);
  
  // Statements for true/false
  const [statements, setStatements] = useState<string[]>(['']);
  
  // Answer for number/text
  const [answer, setAnswer] = useState<string>('');
  
  // Passage related
  const [hasPassage, setHasPassage] = useState(false);
  const [createNewPassage, setCreateNewPassage] = useState(false);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [passageSearchResults, setPassageSearchResults] = useState<Passage[]>([]);
  const [newPassageTitle, setNewPassageTitle] = useState('');
  const [newPassageContent, setNewPassageContent] = useState('');
  const [passageSearchTerm, setPassageSearchTerm] = useState('');
  
  // Explanation
  const [hasExplanation, setHasExplanation] = useState(false);
  const [explanationContent, setExplanationContent] = useState('');
  
  // Loading states
  const [isLoadingBidang, setIsLoadingBidang] = useState(false);
  const [isLoadingTopik, setIsLoadingTopik] = useState(false);
  const [isLoadingSubTopik, setIsLoadingSubTopik] = useState(false);
  const [isLoadingPassage, setIsLoadingPassage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Error handling
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedQuestionCode, setSavedQuestionCode] = useState<string>('');
  
  // Track changes for modal
  const [hasChanges, setHasChanges] = useState(false);

  /* ---------------------- Constants ------------------------------- */
  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  
  const questionTypeOptions = [
    { label: 'Single Choice', value: 'single-choice' },
    { label: 'Multiple Choice', value: 'multiple-choice' },
    { label: 'True/False', value: 'true-false' },
    { label: 'Number', value: 'number' },
    { label: 'Text', value: 'text' }
  ];
  
  const levelOptions = [
    { label: '1 - Core', value: 1 },
    { label: '2 - Intermediate', value: 2 },
    { label: '3 - Advanced', value: 3 },
    { label: '4 - Pro', value: 4 },
    { label: '5 - Expert', value: 5 }
  ];

  /* ---------------------- Check for changes --------------------------- */
  useEffect(() => {
    const hasData = bidang !== null || 
                   topik !== null || 
                   subTopik !== null ||
                   questionText.trim() !== '' ||
                   level !== null ||
                   hasPassage ||
                   hasExplanation ||
                   (questionType === 'single-choice' || questionType === 'multiple-choice') && options.some(opt => opt.trim() !== '') ||
                   questionType === 'true-false' && statements.some(stmt => stmt.trim() !== '') ||
                   (questionType === 'number' || questionType === 'text') && answer.trim() !== '';
    setHasChanges(hasData);
  }, [bidang, topik, subTopik, questionText, level, hasPassage, hasExplanation, 
      options, statements, answer, questionType]);

  /* ---------------------- Helper Functions ---------------------------- */
  const extractCodeFromLabel = (label: string): string => {
    if (!label) return '';
    const parts = label.split(' - ');
    return parts[0]?.trim() || '';
  };

  const getTextFromHtml = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  /* ---------------------- Fetch Functions ----------------------------- */
  const fetchBidang = async (searchTerm: string = ''): Promise<void> => {
    setIsLoadingBidang(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=${searchTerm}&kind=1`);
      
      if (response.data && Array.isArray(response.data.examTypes)) {
        const formattedOptions = response.data.examTypes.map((exam: ExamType) => ({
          label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
          value: exam.id,
          code: exam.code
        }));
        setBidangOptions(formattedOptions);
      } else {
        setBidangOptions([]);
      }
    } catch (error) {
      setBidangOptions([]);
    } finally {
      setIsLoadingBidang(false);
    }
  };

  const fetchTopik = async (searchTerm: string = ''): Promise<void> => {
    if (!bidang) return;
    setIsLoadingTopik(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=${searchTerm}&kind=2&masterId=${bidang.value}`);
      
      if (response.data && Array.isArray(response.data.examTypes)) {
        const formattedOptions = response.data.examTypes.map((exam: ExamType) => ({
          label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
          value: exam.id,
          code: exam.code
        }));
        setTopikOptions(formattedOptions);
      } else {
        setTopikOptions([]);
      }
    } catch (error) {
      setTopikOptions([]);
    } finally {
      setIsLoadingTopik(false);
    }
  };

  const fetchSubTopik = async (searchTerm: string = ''): Promise<void> => {
    if (!topik) return;
    setIsLoadingSubTopik(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/exam-types/search?search=${searchTerm}&kind=3&masterId=${topik.value}`);
      
      if (response.data && Array.isArray(response.data.examTypes)) {
        const formattedOptions = response.data.examTypes.map((exam: ExamType) => ({
          label: `${String(exam.code || '')} - ${String(exam.name || '')}`.trim(),
          value: exam.id,
          NextID: exam.NextID,
          code: exam.code
        }));
        setSubTopikOptions(formattedOptions);
      } else {
        setSubTopikOptions([]);
      }
    } catch (error) {
      setSubTopikOptions([]);
    } finally {
      setIsLoadingSubTopik(false);
    }
  };

  const fetchPassages = async (searchTerm: string = ''): Promise<void> => {
    if (!hasPassage) return;
    setIsLoadingPassage(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/questions/passage/search?search=${searchTerm}`);
      if (response.data && Array.isArray(response.data)) {
        setPassageSearchResults(response.data);
      } else {
        setPassageSearchResults([]);
      }
    } catch (error) {
      setPassageSearchResults([]);
    } finally {
      setIsLoadingPassage(false);
    }
  };

  /* ---------------------- Debounced Functions ------------------------- */
  const debouncedFetchBidang = debounce(fetchBidang, 300);
  const debouncedFetchTopik = debounce(fetchTopik, 300);
  const debouncedFetchSubTopik = debounce(fetchSubTopik, 300);
  const debouncedFetchPassages = debounce(fetchPassages, 500);

  /* ---------------------- Effects ------------------------------------- */
  useEffect(() => {
    if (isOpen) {
      fetchBidang('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (hasPassage) {
      fetchPassages('');
    }
  }, [hasPassage]);

  useEffect(() => {
    if (passageSearchTerm !== undefined) {
      debouncedFetchPassages(passageSearchTerm);
    }
  }, [passageSearchTerm]);

  // Generate question code
  useEffect(() => {
    if (bidang && topik && subTopik && subTopik.NextID) {
      try {
        const bidangCode = extractCodeFromLabel(
          bidangOptions.find(opt => opt.value === bidang.value)?.label || ''
        );
        const topikCode = extractCodeFromLabel(
          topikOptions.find(opt => opt.value === topik.value)?.label || ''
        );
        const subTopikCode = extractCodeFromLabel(
          subTopikOptions.find(opt => opt.value === subTopik.value)?.label || ''
        );
        
        const NextID = parseInt(String(subTopik.NextID)) || 0;
        const formattedNextID = NextID.toString().padStart(4, '0');
        const generatedCode = `${bidangCode}${topikCode}${subTopikCode}${formattedNextID}`;
        
        setQuestionCode(generatedCode);
      } catch (error) {
        setQuestionCode('');
      }
    } else {
      setQuestionCode('');
    }
  }, [bidang, topik, subTopik, bidangOptions, topikOptions, subTopikOptions]);

  // Cascade dropdowns
  useEffect(() => {
    if (bidang) {
      fetchTopik('');
    } else {
      setTopikOptions([]);
      setTopik(null);
      setSubTopik(null);
      setSubTopikOptions([]);
    }
  }, [bidang]);

  useEffect(() => {
    if (topik) {
      fetchSubTopik('');
    } else {
      setSubTopikOptions([]);
      setSubTopik(null);
    }
  }, [topik]);

  /* ---------------------- Reset Functions ----------------------------- */
  const resetForm = () => {
    setBidang(null);
    setTopik(null);
    setSubTopik(null);
    setQuestionCode('');
    setQuestionType('single-choice');
    setQuestionText('');
    setLevel(null);
    setOptions(['']);
    setCorrectAnswer([]);
    setStatements(['']);
    setAnswer('');
    setHasPassage(false);
    setCreateNewPassage(false);
    setPassage(null);
    setPassageSearchResults([]);
    setNewPassageTitle('');
    setNewPassageContent('');
    setPassageSearchTerm('');
    setHasExplanation(false);
    setExplanationContent('');
    setErrors({});
    setIsSaving(false);
    setShowSuccessModal(false);
    setSavedQuestionCode('');
    setHasChanges(false);
    
    // Reset options
    setBidangOptions([]);
    setTopikOptions([]);
    setSubTopikOptions([]);
  };

  /* ---------------------- Validation ---------------------------------- */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!subTopik) {
      newErrors.subTopik = 'Sub Topik wajib dipilih';
    }
    
    if (level === null) {
      newErrors.level = 'Level wajib dipilih';
    }
    
    const questionPlainText = getTextFromHtml(questionText).trim();
    if (!questionPlainText) {
      newErrors.questionText = 'Teks soal tidak boleh kosong';
    }
    
    if (questionType === 'single-choice' || questionType === 'multiple-choice') {
      if (options.length < 2) {
        newErrors.options = 'Minimal dua opsi diperlukan';
      }
      
      for (let i = 0; i < options.length; i++) {
        const optionPlainText = getTextFromHtml(options[i]).trim();
        if (!optionPlainText) {
          newErrors.options = `Opsi ${optionLabels[i]} tidak boleh kosong`;
          break;
        }
      }
      
      if (correctAnswer.length === 0) {
        newErrors.correctAnswer = 'Minimal satu jawaban benar harus dipilih';
      }
    }
    
    if (questionType === 'true-false') {
      for (let i = 0; i < statements.length; i++) {
        if (!statements[i].trim()) {
          newErrors.statements = `Pernyataan ${i + 1} tidak boleh kosong`;
          break;
        }
      }
      if (correctAnswer.length !== statements.length) {
        newErrors.statements = 'Setiap pernyataan harus memiliki jawaban benar/salah';
      }
    }
    
    if (questionType === 'number' || questionType === 'text') {
      if (!answer.trim()) {
        newErrors.answer = 'Jawaban tidak boleh kosong';
      }
    }
    
    if (hasPassage && createNewPassage) {
      if (!newPassageTitle.trim()) {
        newErrors.passageTitle = 'Judul bacaan diperlukan';
      }
      const passagePlainText = getTextFromHtml(newPassageContent).trim();
      if (!passagePlainText) {
        newErrors.passageContent = 'Konten bacaan tidak boleh kosong';
      }
    }
    
    if (hasPassage && !createNewPassage && !passage) {
      newErrors.passage = 'Pilih bacaan atau buat bacaan baru';
    }
    
    if (hasExplanation) {
      const explanationPlainText = getTextFromHtml(explanationContent).trim();
      if (!explanationPlainText) {
        newErrors.explanation = 'Pembahasan tidak boleh kosong';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------------- Handlers ------------------------------------ */
  const createNewPassageHandler = async (): Promise<number> => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/questions/passage`, {
        title: newPassageTitle,
        passage: newPassageContent,
        create_user_id: userId
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data.id;
    } catch (error) {
      throw new Error('Failed to create passage');
    }
  };

  const handleBulkCreate = () => {
    if (hasChanges) {
      if (window.confirm('Ada perubahan yang belum disimpan. Yakin ingin ke halaman buat banyak?')) {
        resetForm();
        onClose();
        router.push('/panel/exam/questions/create-bulk');
      }
    } else {
      onClose();
      router.push('/panel/exam/questions/create-bulk');
    }
  };

  const handleAddOption = () => {
    if (options.length >= optionLabels.length) return;
    setOptions([...options, '']);
  };

  const handleAddStatement = () => {
    setStatements([...statements, '']);
    setCorrectAnswer([...correctAnswer, 0]);
  };

  const handleCorrectAnswerChange = (index: number) => {
    if (questionType === 'single-choice') {
      setCorrectAnswer([index]);
    } else if (questionType === 'multiple-choice') {
      if (correctAnswer.includes(index)) {
        setCorrectAnswer(correctAnswer.filter((ans) => ans !== index));
      } else {
        setCorrectAnswer([...correctAnswer, index]);
      }
    }
  };

  const handleTrueFalseChange = (index: number, value: boolean) => {
    const updatedCorrectAnswers = [...correctAnswer];
    updatedCorrectAnswers[index] = value ? 1 : 0;
    setCorrectAnswer(updatedCorrectAnswers);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);

    let passageId: number | string | null = null;
    let passageContent: string | null = null;

    try {
      if (hasPassage) {
        if (createNewPassage) {
          passageId = await createNewPassageHandler();
          passageContent = newPassageContent;
        } else if (passage) {
          passageId = passage.id;
          passageContent = passage.passage;
        }
      }

      let updatedCorrectAnswer: string[] | number[] | undefined;

      if (questionType === 'true-false') {
        updatedCorrectAnswer = correctAnswer.map((ans) => (ans === 1 ? 'true' : 'false'));
      } else if (questionType === 'number' || questionType === 'text') {
        updatedCorrectAnswer = [answer];
      } else if (questionType === 'single-choice' || questionType === 'multiple-choice') {
        updatedCorrectAnswer = correctAnswer.map((index) => optionLabels[index]).sort();
      }

      const newQuestion: Question = {
        exam_type_id: subTopik?.value || '',
        question_topic_type: subTopik?.value || '',
        question_text: questionText,
        question_type: questionType,
        options: questionType === 'single-choice' || questionType === 'multiple-choice' ? options : undefined,
        correct_answer: updatedCorrectAnswer,
        statements: questionType === 'true-false' ? statements : undefined,
        create_user_id: userId,
        question_code: questionCode,
        explanation: hasExplanation ? explanationContent : null,
        passage_id: passageId || null,
        passage: passageContent || null,
        level: level
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/questions`, newQuestion, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      setSavedQuestionCode(response.data.code);
      setShowSuccessModal(true);
      
    } catch (error: any) {
      setErrors({ api: error.response?.data?.error || 'Gagal menyimpan soal. Silakan coba lagi.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    
    const newQuestion: Question = {
      exam_type_id: subTopik?.value || '',
      question_topic_type: subTopik?.value || '',
      question_text: questionText,
      question_type: questionType,
      options: questionType === 'single-choice' || questionType === 'multiple-choice' ? options : undefined,
      correct_answer: questionType === 'true-false' ? correctAnswer.map((ans) => (ans === 1 ? 'true' : 'false')) :
                     questionType === 'number' || questionType === 'text' ? [answer] :
                     correctAnswer.map((index) => optionLabels[index]).sort(),
      statements: questionType === 'true-false' ? statements : undefined,
      create_user_id: userId,
      question_code: savedQuestionCode,
      explanation: hasExplanation ? explanationContent : null,
      passage_id: hasPassage ? (createNewPassage ? null : passage?.id || null) : null,
      passage: hasPassage ? (createNewPassage ? newPassageContent : passage?.passage || null) : null,
      level: level
    };
    
    onSave(newQuestion);
    resetForm();
    onClose();
  };

  /* ---------------------- Modal Buttons ------------------------------- */
  const topButtons: ModalButton[] = [
    {
      action: 'custom',
      text: 'Buat Banyak',
      icon: <Zap className="tw-w-4 tw-h-4" />,
      onClick: handleBulkCreate,
      disabled: isSaving,
      size: 'sm',
      customColors: {
        primary: '#3B82F6',
        secondary: '#2563EB',
        gradient1: '#3B82F6',
        gradient2: '#60A5FA',
        text: '#FFFFFF'
      }
    },
    {
      action: 'reset',
      text: 'Reset Form',
      icon: <RotateCcw className="tw-w-4 tw-h-4" />,
      onClick: resetForm,
      disabled: !hasChanges || isSaving,
      size: 'sm',
      customColors: {
        primary: '#F59E0B',
        secondary: '#D97706',
        gradient1: '#F59E0B',
        gradient2: '#FBBF24',
        text: '#FFFFFF'
      }
    }
  ];

  const bottomButtons: ModalButton[] = [
    ...(hasChanges ? [{
      action: 'cancel' as const,
      text: 'Batal',
      icon: <X className="tw-w-4 tw-h-4" />,
      onClick: () => {
        if (window.confirm('Ada perubahan yang belum disimpan. Yakin ingin menutup?')) {
          resetForm();
          onClose();
        }
      },
      disabled: isSaving,
      customColors: {
        primary: '#6B7280',
        secondary: '#4B5563',
        gradient1: '#6B7280',
        gradient2: '#9CA3AF',
        text: '#FFFFFF'
      }
    }] : [{
      action: 'cancel' as const,
      text: 'Tutup',
      icon: <X className="tw-w-4 tw-h-4" />,
      onClick: () => {
        resetForm();
        onClose();
      },
      disabled: isSaving,
      customColors: {
        primary: '#6B7280',
        secondary: '#4B5563',
        gradient1: '#6B7280',
        gradient2: '#9CA3AF',
        text: '#FFFFFF'
      }
    }]),
    {
      action: 'save',
      text: isSaving ? 'Menyimpan...' : 'Simpan Soal',
      icon: <Check className="tw-w-4 tw-h-4" />,
      onClick: handleSave,
      disabled: isSaving,
      loading: isSaving,
      customColors: {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        gradient1: '#8B5CF6',
        gradient2: '#A855F7',
        text: '#FFFFFF'
      }
    }
  ];

  const selectedQuestionType = questionTypeOptions.find(opt => opt.value === questionType) || questionTypeOptions[0];

  /* ----------------------- Render ----------------------------------- */
  return (
    <>
      <LearningModal
        show={isOpen}
        onHide={hasChanges ? () => {} : () => { resetForm(); onClose(); }}
        title="Buat Soal Baru"
        subtitle={`${questionCode || 'Kode belum dibuat'} • Level ${level || '-'} • ${hasChanges ? 'Ada perubahan' : 'Belum ada perubahan'}`}
        icon={<BookOpen className="tw-w-5 tw-h-5" />}
        size="xl"
        width="110vw"
        height="120vh"
        scrollable={true}
        topButtons={topButtons}
        bottomButtons={bottomButtons}
        preventCloseOnOutsideClick={hasChanges}
      >
        <div className="tw-space-y-6">
          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-p-4">
              <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                <XCircle className="tw-w-4 tw-h-4 tw-text-red-500" />
                <span className="tw-font-semibold tw-text-red-700">Error</span>
              </div>
              {Object.values(errors).map((error, i) => (
                <div key={i} className="tw-text-red-700 tw-text-sm">{error}</div>
              ))}
            </div>
          )}

          <Form>
            {/* -------- Bidang, Topik, Sub Topik -------- */}
            <Row className="tw-mb-6">
              <Col md={4}>
                <SearchSingleField
                  label="Bidang"
                  value={bidang}
                  options={bidangOptions}
                  onChange={(newValue) => {
                    setBidang(newValue);
                    setTopik(null);
                    setSubTopik(null);
                    setTopikOptions([]);
                    setSubTopikOptions([]);
                    setQuestionCode('');
                  }}
                  onInputChange={debouncedFetchBidang}
                  isLoading={isLoadingBidang}
                  icon={<Award size={16} />}
                  required
                  error={errors.bidang}
                />
              </Col>

              <Col md={4}>
                <SearchSingleField
                  label="Topik"
                  value={topik}
                  options={topikOptions}
                  onChange={(newValue) => {
                    setTopik(newValue);
                    setSubTopik(null);
                    setSubTopikOptions([]);
                    setQuestionCode('');
                  }}
                  onInputChange={debouncedFetchTopik}
                  isLoading={isLoadingTopik}
                  icon={<BookOpen size={16} />}
                  required
                  error={errors.topik}
                />
              </Col>

              <Col md={4}>
                <SearchSingleField
                  label="Sub Topik"
                  value={subTopik}
                  options={subTopikOptions}
                  onChange={(newValue) => setSubTopik(newValue)}
                  onInputChange={debouncedFetchSubTopik}
                  isLoading={isLoadingSubTopik}
                  icon={<Target size={16} />}
                  required
                  error={errors.subTopik}
                />
              </Col>
            </Row>

            {/* -------- Kode Soal & Level -------- */}
            <Row className="tw-mb-6">
              <Col md={8}>
                <ShortFormField
                  label="Kode Soal"
                  value={questionCode}
                  onChange={() => {}} // Read only
                  isFixed={true}
                  fixedValue={questionCode}
                  required
                />
              </Col>

              <Col md={4}>
                <SelectCustomField
                  label="Level"
                  value={level !== null ? levelOptions.find(opt => opt.value === level) || null : null}
                  options={levelOptions}
                  onChange={(newValue) => {
                    setLevel(newValue ? newValue.value : null);
                  }}
                  required
                  error={errors.level}
                />
              </Col>
            </Row>

            {/* -------- Tipe Soal -------- */}
            <SelectCustomField
              label="Tipe Soal"
              value={selectedQuestionType}
              options={questionTypeOptions}
              onChange={(newValue) => {
                setQuestionType(newValue?.value?.toString() || 'single-choice');
                // Reset related fields when question type changes
                setOptions(['']);
                setCorrectAnswer([]);
                setStatements(['']);
                setAnswer('');
              }}
              required
            />

            {/* -------- Bacaan (Optional) -------- */}
            <div className="tw-mb-6">
              <YesNoField
                label="Ada Bacaan"
                checked={hasPassage}
                onChange={setHasPassage}
                icon={<Bookmark size={16} />}
                color="tw-text-purple-700"
                selectedColor="tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-500 tw-text-white"
                yesText="Ya"
                noText="Tidak"
                variant="card"
                description="Apakah soal ini memerlukan bacaan?"
              />
              
              {hasPassage && (
                <div className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-4 tw-shadow-sm tw-mt-4">
                  <div className="tw-flex tw-space-x-4 tw-mb-4">
                    <button
                      type="button"
                      onClick={() => setCreateNewPassage(false)}
                      className={`tw-flex-1 tw-px-4 tw-py-2 tw-rounded-lg tw-font-medium tw-transition-colors ${
                        !createNewPassage
                          ? 'tw-bg-purple-600 tw-text-white'
                          : 'tw-border-2 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50'
                      }`}
                    >
                      Pilih Bacaan
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateNewPassage(true)}
                      className={`tw-flex-1 tw-px-4 tw-py-2 tw-rounded-lg tw-font-medium tw-transition-colors ${
                        createNewPassage
                          ? 'tw-bg-purple-600 tw-text-white'
                          : 'tw-border-2 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50'
                      }`}
                    >
                      Buat Baru
                    </button>
                  </div>
                  
                  {!createNewPassage ? (
                    <div className="tw-space-y-3">
                      <SearchSingleField
                        label="Cari Bacaan"
                        value={passage ? { label: passage.title, value: passage.id } : null}
                        options={passageSearchResults.map(p => ({
                          label: p.title,
                          value: p.id
                        }))}
                        onChange={(newValue) => {
                          if (newValue) {
                            const selected = passageSearchResults.find(p => p.id === newValue.value);
                            setPassage(selected || null);
                          } else {
                            setPassage(null);
                          }
                        }}
                        onInputChange={(value) => setPassageSearchTerm(value)}
                        isLoading={isLoadingPassage}
                        required={hasPassage}
                        error={errors.passage}
                      />
                      
                      {passage && (
                        <div className="tw-mt-4">
                          <div className="tw-text-purple-700 tw-font-medium tw-mb-2">Isi Bacaan:</div>
                          <div 
                            className="tw-bg-gray-50 tw-rounded-lg tw-p-3 tw-border tw-border-gray-200 tw-prose tw-max-w-none tw-max-h-32 tw-overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: passage.passage }} 
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="tw-space-y-3">
                      <ShortFormField
                        label="Judul Bacaan"
                        value={newPassageTitle}
                        onChange={(e) => setNewPassageTitle(e.target.value)}
                        required
                        error={errors.passageTitle}
                      />
                      
                      <Form.Group>
                        <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-space-x-2">
                          <span>Isi Bacaan <span className="tw-text-red-500">*</span></span>
                        </Form.Label>
                        <div className="tw-bg-gray-50 tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2 tw-shadow-sm">
                          <SuperEditor 
                            onChange={setNewPassageContent}
                            initialValue="<p>Mulai mengetik bacaan disini...</p>"
                            height="150px"
                          />
                        </div>
                        {errors.passageContent && (
                          <div className="tw-text-red-600 tw-text-sm tw-mt-1">{errors.passageContent}</div>
                        )}
                      </Form.Group>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* -------- Teks Soal -------- */}
            <div className="tw-mb-6">
              <Form.Group>
                <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-space-x-2">
                  <BookOpen className="tw-w-4 tw-h-4" />
                  <span>Teks Soal <span className="tw-text-red-500">*</span></span>
                </Form.Label>
                <div className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2 tw-shadow-sm">
                  <SuperEditor 
                    onChange={setQuestionText}
                    initialValue="<p>Mulai mengetik soal disini...</p>"
                    height="120px"
                  />
                </div>
                {errors.questionText && (
                  <div className="tw-text-red-600 tw-text-sm tw-mt-1">{errors.questionText}</div>
                )}
              </Form.Group>
            </div>

            {/* -------- Single/Multiple Choice Options -------- */}
            {(questionType === 'single-choice' || questionType === 'multiple-choice') && (
              <div className="tw-mb-6">
                <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-4 tw-flex tw-items-center tw-space-x-2">
                  <div className="tw-bg-purple-100 tw-p-1 tw-rounded">
                    <Check className="tw-w-4 tw-h-4 tw-text-purple-600" />
                  </div>
                  <span>Opsi Jawaban</span>
                </Form.Label>
                <Row className="tw-g-4">
                  {options.map((option, index) => (
                    <Col xs={12} md={6} key={index} className="tw-mb-4">
                      <Card className="tw-border-2 tw-border-purple-200 tw-rounded-lg tw-shadow-sm hover:tw-shadow-md tw-transition-all tw-duration-200">
                        <Card.Body className="tw-p-4">
                          <div className="tw-flex tw-items-center tw-justify-between tw-mb-3">
                            <div className="tw-flex tw-items-center tw-space-x-2">
                              <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-indigo-500 tw-text-white tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-sm">
                                {optionLabels[index]}
                              </div>
                              <span className="tw-text-purple-700 tw-font-medium">Opsi {optionLabels[index]}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCorrectAnswerChange(index)}
                              className={`tw-px-3 tw-py-1 tw-rounded-lg tw-font-medium tw-text-sm tw-transition-all tw-duration-200 tw-flex tw-items-center tw-gap-1 ${
                                correctAnswer.includes(index) 
                                  ? 'tw-bg-green-500 tw-border-green-500 tw-text-white hover:tw-bg-green-600' 
                                  : 'tw-border-2 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50'
                              }`}
                            >
                              {correctAnswer.includes(index) ? (
                                <><Check className="tw-w-4 tw-h-4" />Benar</>
                              ) : (
                                'Tandai Benar'
                              )}
                            </button>
                          </div>
                          <div className="tw-bg-gray-50 tw-rounded-lg tw-border tw-border-gray-200">
                            <SuperEditor
                              onChange={(html) => {
                                const newOptions = [...options];
                                newOptions[index] = html;
                                setOptions(newOptions);
                              }}
                              initialValue="<p>Masukkan teks opsi...</p>"
                              height="80px"
                            />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <div className="tw-flex tw-justify-between tw-items-center">
                  <Button 
                    variant="outline-primary" 
                    onClick={handleAddOption}
                    className="tw-border-2 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50 tw-font-medium tw-rounded-lg tw-px-4 tw-py-2 tw-flex tw-items-center tw-space-x-2"
                    disabled={options.length >= optionLabels.length}
                  >
                    <Plus className="tw-w-4 tw-h-4" />
                    <span>Tambah Opsi</span>
                  </Button>
                  
                  {errors.options && (
                    <div className="tw-text-red-600 tw-text-sm">{errors.options}</div>
                  )}
                  {errors.correctAnswer && (
                    <div className="tw-text-red-600 tw-text-sm">{errors.correctAnswer}</div>
                  )}
                </div>
              </div>
            )}

            {/* -------- True/False Statements -------- */}
            {questionType === 'true-false' && (
              <div className="tw-mb-6">
                <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-4 tw-flex tw-items-center tw-space-x-2">
                  <BookOpen className="tw-w-4 tw-h-4" />
                  <span>Pernyataan</span>
                </Form.Label>
                <div className="tw-space-y-4">
                  {statements.map((statement, index) => (
                    <div key={index} className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-4 tw-shadow-sm">
                      <Row className="tw-items-center">
                        <Col xs={12} md={8} className="tw-mb-3 md:tw-mb-0">
                          <Form.Control
                            type="text"
                            value={statement}
                            onChange={(e) => {
                              const updatedStatements = [...statements];
                              updatedStatements[index] = e.target.value;
                              setStatements(updatedStatements);
                            }}
                            placeholder={`Pernyataan ${index + 1}`}
                            className="tw-border-purple-200 tw-rounded-lg tw-px-4 tw-py-2 tw-text-base"
                          />
                        </Col>
                        <Col xs={12} md={4}>
                          <div className="tw-flex tw-space-x-2">
                            <button
                              type="button"
                              onClick={() => handleTrueFalseChange(index, true)}
                              className={`tw-flex-1 tw-px-3 tw-py-2 tw-rounded-lg tw-font-medium tw-text-sm tw-transition-colors ${
                                correctAnswer[index] === 1 
                                  ? 'tw-bg-green-500 tw-border-green-500 tw-text-white' 
                                  : 'tw-border-2 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50'
                              }`}
                            >
                              Benar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTrueFalseChange(index, false)}
                              className={`tw-flex-1 tw-px-3 tw-py-2 tw-rounded-lg tw-font-medium tw-text-sm tw-transition-colors ${
                                correctAnswer[index] === 0 
                                  ? 'tw-bg-green-500 tw-border-green-500 tw-text-white' 
                                  : 'tw-border-2 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50'
                              }`}
                            >
                              Salah
                            </button>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
                <div className="tw-flex tw-justify-between tw-items-center tw-mt-4">
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleAddStatement}
                    className="tw-border-2 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50 tw-font-medium tw-rounded-lg tw-px-4 tw-py-2 tw-flex tw-items-center tw-space-x-2"
                  >
                    <Plus className="tw-w-4 tw-h-4" />
                    <span>Tambah Pernyataan</span>
                  </Button>
                  
                  {errors.statements && (
                    <div className="tw-text-red-600 tw-text-sm">{errors.statements}</div>
                  )}
                </div>
              </div>
            )}

            {/* -------- Number/Text Answer -------- */}
            {(questionType === 'number' || questionType === 'text') && (
              <div className="tw-mb-6">
                <ShortFormField
                  label="Jawaban Benar"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  error={errors.answer}
                />
              </div>
            )}

            {/* -------- Pembahasan (Optional) -------- */}
            <div className="tw-mb-6">
              <YesNoField
                label="Ada Pembahasan"
                checked={hasExplanation}
                onChange={setHasExplanation}
                icon={<FileText size={16} />}
                color="tw-text-purple-700"
                selectedColor="tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-500 tw-text-white"
                yesText="Ya"
                noText="Tidak"
                variant="card"
                description="Apakah soal ini memerlukan pembahasan?"
              />
              
              {hasExplanation && (
                <div className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-4 tw-shadow-sm tw-mt-4">
                  <Form.Group>
                    <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-space-x-2">
                      <span>Isi Pembahasan <span className="tw-text-red-500">*</span></span>
                    </Form.Label>
                    <div className="tw-bg-gray-50 tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2">
                      <SuperEditor 
                        onChange={setExplanationContent}
                        initialValue="<p>Mulai mengetik pembahasan disini...</p>"
                        height="120px"
                      />
                    </div>
                    {errors.explanation && (
                      <div className="tw-text-red-600 tw-text-sm tw-mt-1">{errors.explanation}</div>
                    )}
                  </Form.Group>
                </div>
              )}
            </div>

            {/* Summary Section */}
            {(questionCode || level !== null) && (
              <div className="tw-bg-purple-50 tw-border tw-border-purple-200 tw-rounded-lg tw-p-4 tw-mb-6">
                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                  <CheckCircle className="tw-w-5 tw-h-5 tw-text-purple-600" />
                  <span className="tw-font-semibold tw-text-purple-700">
                    Ringkasan Soal
                  </span>
                </div>
                <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4 tw-text-sm">
                  <div>
                    <span className="tw-text-purple-600">Kode:</span>
                    <div className="tw-font-semibold tw-text-purple-800 tw-truncate">
                      {questionCode || 'Belum dibuat'}
                    </div>
                  </div>
                  <div>
                    <span className="tw-text-purple-600">Level:</span>
                    <div className="tw-font-semibold tw-text-purple-800">
                      {level !== null ? `Level ${level}` : 'Belum dipilih'}
                    </div>
                  </div>
                  <div>
                    <span className="tw-text-purple-600">Tipe:</span>
                    <div className="tw-font-semibold tw-text-purple-800">
                      {selectedQuestionType.label}
                    </div>
                  </div>
                  <div>
                    <span className="tw-text-purple-600">Fitur:</span>
                    <div className="tw-font-semibold tw-text-purple-800">
                      {hasPassage && hasExplanation ? 'Bacaan + Pembahasan' :
                       hasPassage ? 'Bacaan' :
                       hasExplanation ? 'Pembahasan' : 'Standar'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Changes indicator */}
            {hasChanges && (
              <div className="tw-bg-orange-50 tw-border tw-border-orange-200 tw-rounded-lg tw-p-3">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-orange-700">
                  <span className="tw-w-2 tw-h-2 tw-bg-orange-400 tw-rounded-full tw-animate-pulse"></span>
                  <span className="tw-font-medium tw-text-sm">
                    Ada perubahan yang belum disimpan
                  </span>
                </div>
              </div>
            )}
          </Form>
        </div>
      </LearningModal>

      {/* Success Modal */}
      <LearningModal
        show={showSuccessModal}
        onHide={() => {}}
        title="Berhasil Dibuat!"
        subtitle={`Soal dengan kode ${savedQuestionCode} telah berhasil dibuat`}
        icon={<CheckCircle className="tw-w-5 tw-h-5" />}
        size="md"
        width="110vw"
        height="120vh"
        scrollable={false}
        bottomButtons={[
          {
            action: 'create',
            text: 'Buat Lagi',
            icon: <FilePlus className="tw-w-4 tw-h-4" />,
            onClick: () => {
              setErrors({});
              setBidang(null);
              setTopik(null);
              setSubTopik(null);
              setQuestionCode('');
              setQuestionType('single-choice');
              setOptions(['']);
              setCorrectAnswer([]);
              setStatements(['']);
              setAnswer('');
              setQuestionText('');
              setHasPassage(false);
              setCreateNewPassage(false);
              setPassage(null);
              setHasExplanation(false);
              setExplanationContent('');
              setNewPassageTitle('');
              setNewPassageContent('');
              setLevel(null);
              setShowSuccessModal(false);
              setSavedQuestionCode('');
              setHasChanges(false);
            },
            customColors: {
              primary: '#F59E0B',
              secondary: '#D97706',
              gradient1: '#F59E0B',
              gradient2: '#FBBF24',
              text: '#FFFFFF'
            }
          },
          {
            action: 'done',
            text: 'Selesai',
            icon: <Check className="tw-w-4 tw-h-4" />,
            onClick: handleCloseSuccessModal,
            customColors: {
              primary: '#10B981',
              secondary: '#059669',
              gradient1: '#10B981',
              gradient2: '#34D399',
              text: '#FFFFFF'
            }
          }
        ]}
        preventCloseOnOutsideClick={true}
      >
        <div className="tw-text-center tw-py-6">
          <div className="tw-bg-green-100 tw-rounded-full tw-w-16 tw-h-16 tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
            <CheckCircle className="tw-w-8 tw-h-8 tw-text-green-600" />
          </div>
          <h4 className="tw-text-xl tw-font-bold tw-text-gray-800 tw-mb-2">
            Soal Berhasil Dibuat!
          </h4>
          <p className="tw-text-gray-600 tw-mb-4">
            Soal telah berhasil dibuat dengan kode soal:
          </p>
          <div className="tw-bg-gradient-to-r tw-from-purple-100 tw-to-indigo-100 tw-rounded-lg tw-p-4 tw-border-2 tw-border-purple-200">
            <div className="tw-text-2xl tw-font-bold tw-text-purple-800 tw-tracking-wider tw-break-all">
              {savedQuestionCode}
            </div>
          </div>
        </div>
      </LearningModal>
    </>
  );
};

export default AddQuestionModal;