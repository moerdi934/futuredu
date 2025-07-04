'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, Form, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Plus, BookOpen, FileText, Check, X, Zap, Bookmark, FilePlus } from 'lucide-react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import SuperEditor from '../../../../components/supereditor/SuperEditor';
import { useAuth } from '../../../../context/AuthContext';
import { SearchSingleField, SelectCustomField } from '../../../../components/layout/FormComponentLayout';

interface Question {
  exam_type_id: number | string;
  id_subtopik: number | string;
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

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ isOpen, onClose, onSave }) => {
  const router = useRouter();
  const { id } = useAuth();
  const userId = id || null;

  const [bidang, setBidang] = useState<{ label: string; value: number } | null>(null);
  const [topik, setTopik] = useState<{ label: string; value: number } | null>(null);
  const [subTopik, setSubTopik] = useState<{ label: string; value: number; NextID?: string } | null>(null);
  const [questionCode, setQuestionCode] = useState<string>('');
  const [bidangOptions, setBidangOptions] = useState<{ label: string; value: number }[]>([]);
  const [topikOptions, setTopikOptions] = useState<{ label: string; value: number }[]>([]);
  const [subTopikOptions, setSubTopikOptions] = useState<{ label: string; value: number; NextID?: string }[]>([]);
  const [questionType, setQuestionType] = useState<string>('single-choice');
  const [options, setOptions] = useState<string[]>(['']);
  const [correctAnswer, setCorrectAnswer] = useState<number[]>([]);
  const [statements, setStatements] = useState<string[]>(['']);
  const [answer, setAnswer] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingBidang, setIsLoadingBidang] = useState(false);
  const [isLoadingTopik, setIsLoadingTopik] = useState(false);
  const [isLoadingSubTopik, setIsLoadingSubTopik] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questionText, setQuestionText] = useState<string>('');
  const [hasPassage, setHasPassage] = useState(false);
  const [createNewPassage, setCreateNewPassage] = useState(false);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [passageSearchResults, setPassageSearchResults] = useState<Passage[]>([]);
  const [isLoadingPassage, setIsLoadingPassage] = useState(false);
  const [newPassageTitle, setNewPassageTitle] = useState('');
  const [newPassageContent, setNewPassageContent] = useState('');
  const [hasExplanation, setHasExplanation] = useState(false);
  const [explanationContent, setExplanationContent] = useState('');
  const [passageSearchTerm, setPassageSearchTerm] = useState('');
  const [level, setLevel] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedQuestionCode, setSavedQuestionCode] = useState<string>('');

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
  
  const selectedQuestionType = questionTypeOptions.find(opt => opt.value === questionType) || questionTypeOptions[0];

  const extractCodeFromLabel = (label: string): string => {
    if (!label) return '';
    const parts = label.split(' - ');
    return parts[0]?.trim() || '';
  };

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
    console.error('Error fetching bidang:', error); // Debug log
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

  const debouncedFetchBidang = debounce(fetchBidang, 300);
  const debouncedFetchTopik = debounce(fetchTopik, 300);
  const debouncedFetchSubTopik = debounce(fetchSubTopik, 300);
  const debouncedFetchPassages = debounce(fetchPassages, 500);

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
  
  const handleClose = () => {
    setError(null);
    setBidang(null);
    setTopik(null);
    setSubTopik(null);
    setQuestionCode('');
    setQuestionType('single-choice');
    setOptions(['']);
    setCorrectAnswer([]);
    setStatements(['']);
    setAnswer('');
    setBidangOptions([]);
    setTopikOptions([]);
    setSubTopikOptions([]);
    setQuestionText('');
    setIsSaving(false);
    setHasPassage(false);
    setCreateNewPassage(false);
    setPassage(null);
    setPassageSearchResults([]);
    setHasExplanation(false);
    setExplanationContent('');
    setNewPassageTitle('');
    setNewPassageContent('');
    setLevel(null);
    setShowSuccessModal(false);
    setSavedQuestionCode('');
    onClose();
  };

  const handleAddOption = () => {
    if (options.length >= optionLabels.length) return;
    setOptions([...options, '']);
  };

  const handleStatementChange = (value: string, index: number) => {
    const updatedStatements = [...statements];
    updatedStatements[index] = value;
    setStatements(updatedStatements);
  };

  const handleAddStatement = () => {
    setStatements([...statements, '']);
    setCorrectAnswer([...correctAnswer, 0]);
  };

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
  };

  const handleTrueFalseChange = (index: number, value: boolean) => {
    const updatedCorrectAnswers = [...correctAnswer];
    updatedCorrectAnswers[index] = value ? 1 : 0;
    setCorrectAnswer(updatedCorrectAnswers);
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

  const getTextFromHtml = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const validateForm = (): boolean => {
    if (!subTopik) {
      setError('Sub Topik is required.');
      return false;
    }
    
    if (level === null) {
      setError('Level is required.');
      return false;
    }
    
    const questionPlainText = getTextFromHtml(questionText).trim();
    if (!questionPlainText) {
      setError('Question text cannot be empty.');
      return false;
    }
    
    if (questionType === 'single-choice' || questionType === 'multiple-choice') {
      if (options.length < 2) {
        setError('At least two options are required.');
        return false;
      }
      
      for (let i = 0; i < options.length; i++) {
        const optionPlainText = getTextFromHtml(options[i]).trim();
        if (!optionPlainText) {
          setError(`Option ${optionLabels[i]} cannot be empty.`);
          return false;
        }
      }
      
      if (correctAnswer.length === 0) {
        setError('At least one correct answer must be selected.');
        return false;
      }
    }
    
    if (questionType === 'true-false') {
      for (let i = 0; i < statements.length; i++) {
        if (!statements[i].trim()) {
          setError(`Statement ${i + 1} cannot be empty.`);
          return false;
        }
      }
      if (correctAnswer.length !== statements.length) {
        setError('Each statement must have a true/false answer.');
        return false;
      }
    }
    
    if (questionType === 'number' || questionType === 'text') {
      if (!answer.trim()) {
        setError('Answer cannot be empty.');
        return false;
      }
    }
    
    if (hasPassage && createNewPassage) {
      if (!newPassageTitle.trim()) {
        setError('Passage title is required.');
        return false;
      }
      const passagePlainText = getTextFromHtml(newPassageContent).trim();
      if (!passagePlainText) {
        setError('Passage content cannot be empty.');
        return false;
      }
    }
    
    if (hasPassage && !createNewPassage && !passage) {
      setError('Please select a passage or create a new one.');
      return false;
    }
    
    if (hasExplanation) {
      const explanationPlainText = getTextFromHtml(explanationContent).trim();
      if (!explanationPlainText) {
        setError('Explanation cannot be empty when enabled.');
        return false;
      }
    }
    
    setError(null);
    return true;
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
        id_subtopik: subTopik?.value || '',
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
      setError(error.response?.data?.error || 'Failed to save the question. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    
    const newQuestion: Question = {
      exam_type_id: subTopik?.value || '',
      id_subtopik: subTopik?.value || '',
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
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal 
        show={isOpen} 
        onHide={handleClose} 
        size="xl" 
        centered 
        backdrop="static"
        className="tw-font-sans"
      >
        <div className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-indigo-50 tw-rounded-lg tw-shadow-2xl tw-border-0 tw-overflow-hidden">
          <Modal.Header className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-text-white tw-border-0 tw-py-4">
            <div className="tw-flex tw-items-center tw-space-x-3">
              <div className="tw-bg-white/20 tw-p-2 tw-rounded-lg">
                <BookOpen className="tw-w-6 tw-h-6" />
              </div>
              <Modal.Title className="tw-text-xl tw-font-bold">
                Buat Soal Baru
              </Modal.Title>
            </div>
            <Button 
              variant="light"
              className="tw-bg-white/20 tw-border-white/30 tw-text-white hover:tw-bg-white/30 tw-transition-all tw-duration-200 tw-font-medium tw-rounded-lg tw-px-4 tw-py-2 tw-flex tw-items-center tw-space-x-2"
              onClick={() => router.push('/panel/exam/questions/create-bulk')}
            >
              <Zap className="tw-w-4 tw-h-4" />
              <span>Buat Banyak</span>
            </Button>
          </Modal.Header>
          
          <Modal.Body className="tw-p-6 tw-max-h-[70vh] tw-overflow-y-auto">
            <div className="tw-sticky tw-top-0 tw-z-10 tw-mb-4">
              {error && (
                <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-p-4 tw-flex tw-items-center tw-space-x-3 tw-shadow-md">
                  <X className="tw-w-5 tw-h-5 tw-text-red-500 tw-flex-shrink-0" />
                  <div className="tw-text-red-700 tw-font-medium">{error}</div>
                </div>
              )}
            </div>
            
            <Form>
              <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-4 tw-mb-6">
                <div className="tw-space-y-2">
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
  required={true}
/>
                </div>
                
                {bidang && (
                  <div className="tw-space-y-2">
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
                      required={true}
                    />
                  </div>
                )}
                
                {topik && (
                  <div className="tw-space-y-2">
                    <SearchSingleField
                      label="Sub Topik"
                      value={subTopik}
                      options={subTopikOptions}
                      onChange={(newValue) => setSubTopik(newValue)}
                      onInputChange={debouncedFetchSubTopik}
                      isLoading={isLoadingSubTopik}
                      required={true}
                    />
                  </div>
                )}
              </div>

              <div className="tw-mb-6">
                <SelectCustomField
                  label="Level"
                  value={level !== null ? levelOptions.find(opt => opt.value === level) || null : null}
                  options={levelOptions}
                  onChange={(newValue) => {
                    setLevel(newValue ? newValue.value : null);
                  }}
                  required={true}
                />
              </div>

              <div className="tw-mb-6">
                <Form.Group>
                  <div className="tw-flex tw-items-center tw-space-x-3 tw-mb-3">
                    <Form.Check
                      type="checkbox"
                      id="has-passage"
                      label={<span className="tw-text-purple-700 tw-font-semibold">Ada Bacaan</span>}
                      checked={hasPassage}
                      onChange={(e) => setHasPassage(e.target.checked)}
                    />
                    <Bookmark className="tw-w-4 tw-h-4 tw-text-purple-600" />
                  </div>
                  
                  {hasPassage && (
                    <div className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-4 tw-shadow-sm tw-mt-2">
                      <div className="tw-flex tw-space-x-4 tw-mb-4">
                        <Button
                          variant={!createNewPassage ? 'primary' : 'outline-secondary'}
                          className="tw-flex-1"
                          onClick={() => setCreateNewPassage(false)}
                        >
                          Pilih Bacaan
                        </Button>
                        <Button
                          variant={createNewPassage ? 'primary' : 'outline-secondary'}
                          className="tw-flex-1"
                          onClick={() => setCreateNewPassage(true)}
                        >
                          Buat Baru
                        </Button>
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
                            required={true}
                          />
                          
                          {passage && (
                            <div className="tw-mt-4">
                              <div className="tw-text-purple-700 tw-font-medium tw-mb-2">Isi Bacaan:</div>
                              <div 
                                className="tw-bg-gray-50 tw-rounded-lg tw-p-3 tw-border tw-border-gray-200 tw-prose tw-max-w-none"
                                dangerouslySetInnerHTML={{ __html: passage.passage }} 
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="tw-space-y-3">
                          <Form.Group className="tw-mb-3">
                            <Form.Label className="tw-text-purple-700 tw-font-medium">Judul Bacaan <span className="tw-text-red-500">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              value={newPassageTitle}
                              onChange={(e) => setNewPassageTitle(e.target.value)}
                              placeholder="Masukkan judul bacaan"
                              className="tw-border-purple-200 tw-rounded-lg"
                            />
                          </Form.Group>
                          
                          <Form.Group>
                            <Form.Label className="tw-text-purple-700 tw-font-medium">Isi Bacaan <span className="tw-text-red-500">*</span></Form.Label>
                            <div className="tw-bg-gray-50 tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2 tw-shadow-sm">
                              <SuperEditor 
                                onChange={setNewPassageContent}
                                initialValue="<p>Mulai mengetik bacaan disini...</p>"
                              />
                            </div>
                          </Form.Group>
                        </div>
                      )}
                    </div>
                  )}
                </Form.Group>
              </div>

              <div className="tw-mb-6">
                <SelectCustomField
                  label="Tipe Soal"
                  value={selectedQuestionType}
                  options={questionTypeOptions}
                  onChange={(newValue) => {
                    setQuestionType(newValue?.value?.toString() || 'single-choice');
                  }}
                  required={true}
                />
              </div>

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
                    />
                  </div>
                </Form.Group>
              </div>

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
                              <Button
                                variant={correctAnswer.includes(index) ? 'success' : 'outline-secondary'}
                                size="sm"
                                onClick={() => handleCorrectAnswerChange(index)}
                                className={`tw-rounded-lg tw-font-medium tw-transition-all tw-duration-200 ${
                                  correctAnswer.includes(index) 
                                    ? 'tw-bg-green-500 tw-border-green-500 hover:tw-bg-green-600' 
                                    : 'tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50'
                                }`}
                              >
                                {correctAnswer.includes(index) ? (
                                  <><Check className="tw-w-4 tw-h-4 tw-me-1" />Benar</>
                                ) : (
                                  'Tandai Benar'
                                )}
                              </Button>
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
                  <Button 
                    variant="outline-primary" 
                    onClick={handleAddOption}
                    className="tw-border-2 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50 tw-font-medium tw-rounded-lg tw-px-4 tw-py-2 tw-flex tw-items-center tw-space-x-2"
                    disabled={options.length >= optionLabels.length}
                  >
                    <Plus className="tw-w-4 tw-h-4" />
                    <span>Tambah Opsi</span>
                  </Button>
                </div>
              )}

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
                              onChange={(e) => handleStatementChange(e.target.value, index)}
                              placeholder={`Pernyataan ${index + 1}`}
                              className="tw-border-purple-200 tw-rounded-lg tw-px-4 tw-py-2 tw-text-base"
                            />
                          </Col>
                          <Col xs={12} md={4}>
                            <div className="tw-flex tw-space-x-2">
                              <Button
                                variant={correctAnswer[index] === 1 ? 'success' : 'outline-secondary'}
                                size="sm"
                                onClick={() => handleTrueFalseChange(index, true)}
                                className={`tw-flex-1 tw-rounded-lg tw-font-medium ${
                                  correctAnswer[index] === 1 
                                    ? 'tw-bg-green-500 tw-border-green-500' 
                                    : 'tw-border-purple-300 tw-text-purple-600'
                                }`}
                              >
                                Benar
                              </Button>
                              <Button
                                variant={correctAnswer[index] === 0 ? 'success' : 'outline-secondary'}
                                size="sm"
                                onClick={() => handleTrueFalseChange(index, false)}
                                className={`tw-flex-1 tw-rounded-lg tw-font-medium ${
                                  correctAnswer[index] === 0 
                                    ? 'tw-bg-green-500 tw-border-green-500' 
                                    : 'tw-border-purple-300 tw-text-purple-600'
                                }`}
                              >
                                Salah
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleAddStatement}
                    className="tw-mt-4 tw-border-2 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50 tw-font-medium tw-rounded-lg tw-px-4 tw-py-2 tw-flex tw-items-center tw-space-x-2"
                  >
                    <Plus className="tw-w-4 tw-h-4" />
                    <span>Tambah Pernyataan</span>
                  </Button>
                </div>
              )}

              {(questionType === 'number' || questionType === 'text') && (
                <div className="tw-mb-6">
                  <Form.Group>
                    <Form.Label className="tw-text-purple-700 tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-space-x-2">
                      <Check className="tw-w-4 tw-h-4" />
                      <span>Jawaban Benar</span>
                    </Form.Label>
                    <Form.Control
                      type={questionType === 'number' ? 'number' : 'text'}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder={questionType === 'number' ? 'Masukkan angka' : 'Masukkan jawaban teks'}
                      className="tw-border-2 tw-border-purple-200 tw-rounded-lg tw-px-4 tw-py-3 tw-text-lg focus:tw-border-purple-500 focus:tw-ring-2 focus:tw-ring-purple-200"
                    />
                  </Form.Group>
                </div>
              )}

              <div className="tw-mb-6">
                <Form.Group>
                  <div className="tw-flex tw-items-center tw-space-x-3 tw-mb-3">
                    <Form.Check
                      type="checkbox"
                      id="has-explanation"
                      label={<span className="tw-text-purple-700 tw-font-semibold">Ada Pembahasan</span>}
                      checked={hasExplanation}
                      onChange={(e) => setHasExplanation(e.target.checked)}
                    />
                    <FileText className="tw-w-4 tw-h-4 tw-text-purple-600" />
                  </div>
                  
                  {hasExplanation && (
                    <div className="tw-bg-white tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2 tw-shadow-sm tw-mt-2">
                      <Form.Group>
                        <Form.Label className="tw-text-purple-700 tw-font-medium">Isi Pembahasan <span className="tw-text-red-500">*</span></Form.Label>
                        <div className="tw-bg-gray-50 tw-rounded-lg tw-border-2 tw-border-purple-200 tw-p-2">
                          <SuperEditor 
                            onChange={setExplanationContent}
                            initialValue="<p>Mulai mengetik pembahasan disini...</p>"
                          />
                        </div>
                      </Form.Group>
                    </div>
                  )}
                </Form.Group>
              </div>
            </Form>
          </Modal.Body>
          
          <Modal.Footer className="tw-bg-gray-50 tw-border-0 tw-p-6">
            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-space-y-2 sm:tw-space-y-0 sm:tw-space-x-3 tw-w-full">
              <Button 
                variant="outline-secondary" 
                onClick={handleClose}
                disabled={isSaving}
                className="tw-flex-1 sm:tw-flex-none tw-border-2 tw-border-gray-300 tw-text-gray-600 hover:tw-bg-gray-100 tw-font-medium tw-rounded-lg tw-px-6 tw-py-2 tw-flex tw-items-center tw-justify-center tw-space-x-2"
              >
                <X className="tw-w-4 tw-h-4" />
                <span>Batal</span>
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
                disabled={isSaving}
                className="tw-flex-1 sm:tw-flex-none tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-border-0 hover:tw-from-purple-700 hover:tw-to-indigo-700 tw-font-medium tw-rounded-lg tw-px-6 tw-py-2 tw-flex tw-items-center tw-justify-center tw-space-x-2 tw-transition-all tw-duration-200 tw-shadow-lg hover:tw-shadow-xl"
              >
                {isSaving ? (
                  <>
                    <Spinner animation="border" size="sm" className="tw-mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check className="tw-w-4 tw-h-4" />
                    <span>Simpan Soal</span>
                  </>
                )}
              </Button>
            </div>
          </Modal.Footer>
        </div>
      </Modal>

      <Modal 
        show={showSuccessModal} 
        onHide={handleCloseSuccessModal}
        size="md" 
        centered 
        backdrop="static"
        className="tw-font-sans"
      >
        <div className="tw-bg-gradient-to-br tw-from-green-50 tw-to-emerald-50 tw-rounded-lg tw-shadow-2xl tw-border-0 tw-overflow-hidden">
          <Modal.Header className="tw-bg-gradient-to-r tw-from-green-600 tw-to-emerald-600 tw-text-white tw-border-0 tw-py-4 tw-px-4 sm:tw-px-6">
            <div className="tw-flex tw-items-center tw-space-x-3 tw-w-full">
              <div className="tw-bg-white/20 tw-p-2 tw-rounded-lg tw-flex-shrink-0">
                <Check className="tw-w-5 tw-h-5 sm:tw-w-6 sm:tw-h-6" />
              </div>
              <Modal.Title className="tw-text-lg sm:tw-text-xl tw-font-bold tw-truncate">
                Berhasil Dibuat!
              </Modal.Title>
            </div>
          </Modal.Header>
          
          <Modal.Body className="tw-p-4 sm:tw-p-6 tw-text-center">
            <div className="tw-mb-4">
              <div className="tw-bg-green-100 tw-rounded-full tw-w-12 tw-h-12 sm:tw-w-16 sm:tw-h-16 tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
                <Check className="tw-w-6 tw-h-6 sm:tw-w-8 sm:tw-h-8 tw-text-green-600" />
              </div>
              <h4 className="tw-text-lg sm:tw-text-xl tw-font-bold tw-text-gray-800 tw-mb-2">
                Soal Berhasil Dibuat!
              </h4>
              <p className="tw-text-sm sm:tw-text-base tw-text-gray-600 tw-mb-4 tw-px-2">
                Soal telah berhasil dibuat dengan kode soal:
              </p>
              <div className="tw-bg-gradient-to-r tw-from-purple-100 tw-to-indigo-100 tw-rounded-lg tw-p-3 sm:tw-p-4 tw-border-2 tw-border-purple-200 tw-mx-2 sm:tw-mx-0">
                <div className="tw-text-lg sm:tw-text-2xl tw-font-bold tw-text-purple-800 tw-tracking-wider tw-break-all">
                  {savedQuestionCode}
                </div>
              </div>
            </div>
            
            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 tw-mt-6">
              <Button 
                variant="outline-primary"
                onClick={() => {
                  setError(null);
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
                }}
                className="tw-flex-1 tw-border-2 tw-border-purple-300 tw-text-purple-600 hover:tw-bg-purple-50 tw-font-medium tw-rounded-lg tw-px-4 tw-py-2 tw-flex tw-items-center tw-justify-center tw-space-x-2 tw-transition-all tw-duration-200"
              >
                <FilePlus className="tw-w-4 tw-h-4" />
                <span className="tw-text-sm sm:tw-text-base">Buat Lagi</span>
              </Button>
              
              <Button 
                variant="primary" 
                onClick={handleCloseSuccessModal}
                className="tw-flex-1 tw-bg-gradient-to-r tw-from-green-600 tw-to-emerald-600 tw-border-0 hover:tw-from-green-700 hover:tw-to-emerald-700 tw-font-medium tw-rounded-lg tw-px-4 tw-py-2 tw-flex tw-items-center tw-justify-center tw-space-x-2 tw-transition-all tw-duration-200 tw-shadow-lg hover:tw-shadow-xl"
              >
                <Check className="tw-w-4 tw-h-4" />
                <span className="tw-text-sm sm:tw-text-base">Selesai</span>
              </Button>
            </div>
          </Modal.Body>
        </div>
      </Modal>
    </>
  );
};

export default AddQuestionModal;