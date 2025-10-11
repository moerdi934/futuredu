'use client';

import React, { useState, useEffect, RefObject } from 'react';
import { BookOpen, X, Search, Loader2 } from 'lucide-react';
import { Modal } from 'react-bootstrap';
import { ButtonGradient } from '../../../button/ButtonTemplate';
import { SearchSingleField, SelectOption } from '../../../form/FormComponentLayout';
import axios from 'axios';
import DOMPurify from 'dompurify';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

interface PracticeButtonProps {
  onClick: (e: React.MouseEvent) => void;
  tabIndex?: number;
}

interface PracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (questionData: any) => void;
}

interface Question {
  id: number;
  code: string;
  type: string;
  question: string;
  options?: string[];
  statements?: string[];
  correct_answer: any;
  pembahasan: string;
  level?: string | number;
  passage?: {
    id: number;
    title: string;
    content: string;
  } | null;
}

export const PracticeButton: React.FC<PracticeButtonProps> = ({ onClick, tabIndex = -1 }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  };

  return (
    <ButtonGradient
      action="custom"
      showText={false}
      customIcon={<BookOpen className="tw-w-4 tw-h-4" />}
      onClick={handleClick}
      size="sm"
      customColors={{
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        gradient1: '#8B5CF6',
        gradient2: '#A78BFA',
        text: '#FFFFFF'
      }}
      className="tw-flex tw-items-center tw-gap-2"
      tabIndex={tabIndex}
      title="Insert Practice Question (Ctrl+Shift+P)"
      type="button"
    />
  );
};

export const PracticeModal: React.FC<PracticeModalProps> = ({ isOpen, onClose, onInsert }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<SelectOption | null>(null);
  const [questionData, setQuestionData] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SelectOption[]>([]);
  
  const fetchQuestionDetails = async (questionId: number) => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get(
        `${apiUrl}/questions/practice/${questionId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      setQuestionData(response.data);
    } catch (error) {
      console.error('Error fetching question details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedQuestion) {
      fetchQuestionDetails(Number(selectedQuestion.value));
    } else {
      setQuestionData(null);
    }
  }, [selectedQuestion]);

  const handleInsert = () => {
    if (questionData) {
      onInsert(questionData);
      onClose();
      setSelectedQuestion(null);
      setQuestionData(null);
    }
  };

  const getCorrectAnswerDisplay = (question: Question) => {
    if (!question.correct_answer) return '';
    
    switch (question.type) {
      case 'single-choice':
        return Array.isArray(question.correct_answer) 
          ? question.correct_answer[0] 
          : question.correct_answer;
      case 'multiple-choice':
        return Array.isArray(question.correct_answer) 
          ? question.correct_answer.join(', ') 
          : question.correct_answer;
      case 'true-false':
        if (Array.isArray(question.correct_answer)) {
          return question.statements?.map((stmt: string, idx: number) => 
            `${idx + 1}. ${question.correct_answer[idx] === 'true' || question.correct_answer[idx] === true ? 'Benar' : 'Salah'}`
          ).join(', ') || '';
        }
        return '';
      case 'text':
        return Array.isArray(question.correct_answer) 
          ? question.correct_answer[0] 
          : question.correct_answer;
      case 'number':
        return Array.isArray(question.correct_answer) 
          ? question.correct_answer[0] 
          : question.correct_answer;
      default:
        return String(question.correct_answer);
    }
  };

  return (
    <Modal 
      show={isOpen} 
      onHide={onClose} 
      size="lg"
      centered
      className="tw-z-[99999]"
      backdrop="static"
    >
      <Modal.Header className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-text-white">
        <Modal.Title className="tw-flex tw-items-center tw-gap-2">
          <BookOpen className="tw-w-5 tw-h-5" />
          Insert Practice Question
        </Modal.Title>
        <button
          onClick={onClose}
          className="tw-text-white hover:tw-text-gray-200 tw-transition-colors tw-ml-auto"
        >
          <X className="tw-w-5 tw-h-5" />
        </button>
      </Modal.Header>

      <Modal.Body className="tw-p-4">
        <div className="tw-mb-4">
          <SearchSingleField
            label="Search Question by Code"
            value={selectedQuestion}
            options={searchOptions}
            onChange={(newValue) => setSelectedQuestion(newValue)}
            apiEndpoint={`/questions/practice/search`}
            placeholder="Search by question code..."
            icon={<Search className="tw-w-4 tw-h-4" />}
            onClear={() => setSelectedQuestion(null)}
            transformResponse={(response) => response.data || response}
          />
        </div>

        {loading && (
          <div className="tw-text-center tw-py-8">
            <Loader2 className="tw-w-8 tw-h-8 tw-animate-spin tw-text-purple-600 tw-mx-auto tw-mb-2" />
            <p className="tw-text-gray-600">Loading question details...</p>
          </div>
        )}

        {questionData && !loading && (
          <div className="tw-border tw-border-purple-200 tw-rounded-lg tw-p-4 tw-bg-purple-50">
            <h4 className="tw-font-bold tw-text-purple-700 tw-mb-3">Preview:</h4>
            
            {questionData.passage && (
              <div className="tw-mb-4 tw-p-3 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200">
                <h5 className="tw-font-semibold tw-text-blue-700 tw-mb-2">
                  Bacaan: {questionData.passage.title}
                </h5>
                <div 
                  className="tw-text-sm tw-text-gray-700"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(questionData.passage.content.substring(0, 200) + '...') 
                  }}
                />
              </div>
            )}
            
            <div className="tw-mb-3">
              <span className="tw-font-semibold tw-text-gray-700">Question:</span>
              <div 
                className="tw-mt-1"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(questionData.question) 
                }}
              />
            </div>

            {questionData.options && questionData.options.length > 0 && (
              <div className="tw-mb-3">
                <span className="tw-font-semibold tw-text-gray-700">Options:</span>
                <ul className="tw-list-none tw-pl-0 tw-mt-1">
                  {questionData.options.map((option, idx) => (
                    <li key={idx} className="tw-mb-1">
                      <span className="tw-font-bold tw-text-purple-600">{optionLabels[idx]}.</span>{' '}
                      <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(option) }} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {questionData.statements && questionData.statements.length > 0 && (
              <div className="tw-mb-3">
                <span className="tw-font-semibold tw-text-gray-700">Statements:</span>
                <ul className="tw-list-decimal tw-pl-5 tw-mt-1">
                  {questionData.statements.map((statement, idx) => (
                    <li key={idx} className="tw-mb-1">{statement}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="tw-mb-3 tw-p-2 tw-bg-green-100 tw-rounded tw-border tw-border-green-300">
              <span className="tw-font-semibold tw-text-green-700">Correct Answer:</span>{' '}
              <span className="tw-text-green-800">{getCorrectAnswerDisplay(questionData)}</span>
            </div>

            {questionData.pembahasan && (
              <div className="tw-p-2 tw-bg-yellow-50 tw-rounded tw-border tw-border-yellow-300">
                <span className="tw-font-semibold tw-text-yellow-700">Explanation:</span>
                <div 
                  className="tw-mt-1 tw-text-sm tw-text-gray-700"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(questionData.pembahasan.substring(0, 200) + '...') 
                  }}
                />
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <ButtonGradient
          action="cancel"
          size="sm"
          onClick={onClose}
        />
        <ButtonGradient
          action="add"
          size="sm"
          onClick={handleInsert}
          disabled={!questionData || loading}
        />
      </Modal.Footer>
    </Modal>
  );
};

interface InsertPracticeQuestionParams {
  editorRef: RefObject<HTMLDivElement>;
  handleChange: () => void;
  questionData: Question;
}

export const insertPracticeQuestion = ({ editorRef, handleChange, questionData }: InsertPracticeQuestionParams): void => {
  if (!editorRef.current) return;

  const editor = editorRef.current;
  const uniqueId = `practice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  editor.focus();

  // Encode correct answer and explanation for storage
  const encodedCorrectAnswer = encodeURIComponent(JSON.stringify(questionData.correct_answer));
  const encodedExplanation = encodeURIComponent(questionData.pembahasan || 'Tidak ada pembahasan.');

  // Generate input fields based on question type
  const getInputHTML = () => {
    switch (questionData.type) {
      case 'single-choice':
        return questionData.options?.map((option, idx) => {
          const label = optionLabels[idx];
          return `
            <div class="practice-option tw-flex tw-items-start tw-mb-3 tw-p-3 tw-rounded-lg tw-border tw-border-purple-200 tw-bg-white tw-cursor-pointer hover:tw-bg-purple-50 tw-transition-colors" 
                 data-label="${label}"
                 data-type="single">
              <input type="radio" name="practice-${uniqueId}" value="${label}" class="tw-mt-1 tw-mr-3">
              <div class="tw-flex-1">
                <span class="tw-font-bold tw-text-purple-600">${label}.</span> ${option}
              </div>
            </div>
          `;
        }).join('') || '';

      case 'multiple-choice':
        return questionData.options?.map((option, idx) => {
          const label = optionLabels[idx];
          return `
            <div class="practice-option tw-flex tw-items-start tw-mb-3 tw-p-3 tw-rounded-lg tw-border tw-border-purple-200 tw-bg-white tw-cursor-pointer hover:tw-bg-purple-50 tw-transition-colors" 
                 data-label="${label}"
                 data-type="multiple">
              <input type="checkbox" value="${label}" class="tw-mt-1 tw-mr-3">
              <div class="tw-flex-1">
                <span class="tw-font-bold tw-text-purple-600">${label}.</span> ${option}
              </div>
            </div>
          `;
        }).join('') || '';

      case 'true-false':
        return `
          <table class="tw-w-full tw-border-collapse">
            <thead>
              <tr class="tw-bg-purple-100">
                <th class="tw-border tw-border-purple-300 tw-p-2 tw-text-left">Pernyataan</th>
                <th class="tw-border tw-border-purple-300 tw-p-2 tw-text-center tw-w-24">Benar</th>
                <th class="tw-border tw-border-purple-300 tw-p-2 tw-text-center tw-w-24">Salah</th>
              </tr>
            </thead>
            <tbody>
              ${questionData.statements?.map((stmt, idx) => `
                <tr>
                  <td class="tw-border tw-border-purple-300 tw-p-2">${stmt}</td>
                  <td class="tw-border tw-border-purple-300 tw-p-2 tw-text-center">
                    <input type="radio" name="practice-${uniqueId}-${idx}" value="true">
                  </td>
                  <td class="tw-border tw-border-purple-300 tw-p-2 tw-text-center">
                    <input type="radio" name="practice-${uniqueId}-${idx}" value="false">
                  </td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
        `;

      case 'text':
        return `
          <input type="text" 
                 class="practice-text-input tw-w-full tw-p-3 tw-border tw-border-purple-300 tw-rounded-lg" 
                 placeholder="Type your answer here...">
        `;

      case 'number':
        return `
          <input type="number" 
                 class="practice-number-input tw-w-full tw-p-3 tw-border tw-border-purple-300 tw-rounded-lg" 
                 placeholder="Enter number...">
        `;

      default:
        return '';
    }
  };

  // Practice question HTML
  const practiceQuestionHtml = `
    <div class="cte-practice-question-block tw-my-4 tw-relative tw-overflow-hidden" 
         data-practice-id="${uniqueId}"
         data-question-type="${questionData.type}"
         data-correct-answer="${encodedCorrectAnswer}"
         data-explanation="${encodedExplanation}">
      <div class="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-purple-500 tw-via-indigo-600 tw-to-blue-700 tw-rounded-2xl tw-shadow-2xl"></div>
      
      <!-- Delete Button - Only visible in editor -->
      <button class="practice-delete-btn practice-editor-only tw-absolute tw-top-2 tw-right-2 tw-z-20 tw-bg-red-500 hover:tw-bg-red-600 tw-text-white tw-p-2 tw-rounded-full tw-shadow-lg tw-transition-all" 
              title="Delete Practice Question">
        <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
      
      <div class="tw-relative tw-p-4 tw-z-10">
        <!-- Header -->
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-3">
          <div class="tw-flex tw-items-center tw-gap-2">
            <div class="tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-p-2 tw-shadow-lg tw-border tw-border-white/30">
              <svg class="tw-w-5 tw-h-5 tw-text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            </div>
            <h4 class="tw-text-lg tw-font-bold tw-text-white tw-m-0">
              📚 Latihan Soal - ${questionData.code || `ID: ${questionData.id}`}
            </h4>
          </div>
          ${questionData.level ? `<span class="tw-bg-white/20 tw-backdrop-blur-sm tw-px-3 tw-py-1 tw-rounded-full tw-text-white tw-text-sm tw-font-medium">Level: ${questionData.level}</span>` : ''}
        </div>

        <!-- Passage if exists -->
        ${questionData.passage ? `
          <div class="tw-bg-blue-100/90 tw-backdrop-blur-sm tw-rounded-xl tw-p-3 tw-mb-3 tw-border tw-border-blue-300/50">
            <h5 class="tw-font-bold tw-text-blue-800 tw-mb-2">📖 Bacaan: ${questionData.passage.title}</h5>
            <div class="tw-text-blue-900 tw-text-sm">
              ${questionData.passage.content}
            </div>
          </div>
        ` : ''}
        
        <!-- Question -->
        <div class="tw-bg-white/95 tw-backdrop-blur-sm tw-rounded-xl tw-p-3 tw-mb-3">
          <div class="tw-flex tw-items-start tw-gap-2">
            <span class="tw-bg-purple-600 tw-text-white tw-px-2 tw-py-1 tw-rounded-lg tw-text-sm tw-font-bold">Q</span>
            <div class="tw-flex-1">
              ${questionData.question}
            </div>
          </div>
        </div>

        <!-- Answer Input Area -->
        <div class="tw-bg-white/95 tw-backdrop-blur-sm tw-rounded-xl tw-p-4 tw-mb-3">
          ${getInputHTML()}
        </div>

        <!-- Action Buttons -->
        <div class="tw-flex tw-gap-2 tw-mb-3">
          <button class="check-answer-btn tw-bg-green-500 hover:tw-bg-green-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-lg tw-font-medium tw-transition-colors">
            ✓ Cek Jawaban
          </button>
          <button class="show-explanation-btn tw-bg-yellow-500 hover:tw-bg-yellow-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-lg tw-font-medium tw-transition-colors tw-hidden">
            💡 Lihat Pembahasan
          </button>
        </div>

        <!-- Result Area (hidden initially) -->
        <div class="result-area tw-hidden tw-bg-white/95 tw-backdrop-blur-sm tw-rounded-xl tw-p-3 tw-mb-3">
          <div class="result-content"></div>
        </div>

        <!-- Explanation Area (hidden initially) -->
        <div class="explanation-area tw-hidden tw-bg-yellow-100/90 tw-backdrop-blur-sm tw-rounded-xl tw-p-3">
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
            <span class="tw-bg-yellow-600 tw-text-white tw-px-2 tw-py-1 tw-rounded-lg tw-text-sm tw-font-bold">💡</span>
            <h5 class="tw-font-bold tw-text-yellow-800 tw-m-0">Pembahasan:</h5>
          </div>
          <div class="explanation-content tw-text-yellow-900 tw-text-sm">
            <!-- Explanation will be loaded from data attribute -->
          </div>
        </div>
      </div>
    </div>
    <p><br></p>
  `;

  // Insert HTML into editor
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = document.createElement('div');
    container.innerHTML = practiceQuestionHtml;
    
    range.deleteContents();
    
    const fragment = document.createDocumentFragment();
    while (container.firstChild) {
      fragment.appendChild(container.firstChild);
    }
    range.insertNode(fragment);
  } else {
    editor.innerHTML += practiceQuestionHtml;
  }
  
  // Trigger change handler
  handleChange();
};

// Export styles for practice questions
export const getPracticeQuestionStyles = (): string => `
  .cte-practice-question-block {
    position: relative;
    margin: 1rem 0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .cte-practice-question-block:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3);
  }

  /* Hide delete button in production/when not contenteditable */
  .cte-practice-question-block .practice-delete-btn {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  /* Show delete button on hover only in editor */
  [contenteditable="true"] .cte-practice-question-block:hover .practice-delete-btn,
  .editor-content .cte-practice-question-block:hover .practice-delete-btn {
    opacity: 1;
  }

  body:not(.editor-mode) .practice-editor-only,
  :not([contenteditable="true"]) .practice-editor-only {
    display: none !important;
  }
  
  .cte-practice-question-block table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .cte-practice-question-block th,
  .cte-practice-question-block td {
    padding: 8px;
    text-align: left;
    border: 1px solid #c4b5fd;
  }
  
  .cte-practice-question-block th {
    background-color: #ede9fe;
    font-weight: bold;
    color: #5b21b6;
  }

  .practice-option {
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .practice-option:hover {
    transform: translateX(4px);
  }

  .practice-option input {
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    .cte-practice-question-block {
      margin: 1rem 0;
    }
    
    .cte-practice-question-block .tw-p-4 {
      padding: 1rem;
    }
    
    .cte-practice-question-block h4 {
      font-size: 1rem;
    }
  }
`;

/**
 * Client-side version of isAnswerCorrect
 */
export const isAnswerCorrect = (userAnswer: any, correctAnswer: any, questionType: string): boolean => {
  // Handle null or undefined userAnswer
  if (userAnswer === null || userAnswer === undefined) {
    return false;
  }

  try {
    switch (questionType) {
      case 'single-choice':
        // For single-choice, compare strings (case-insensitive)
        let correctSingleAnswer = Array.isArray(correctAnswer) 
          ? correctAnswer[0] 
          : correctAnswer;
        return String(userAnswer).trim().toLowerCase() === String(correctSingleAnswer).trim().toLowerCase();
        
      case 'multiple-choice':
        // Ensure we have arrays to compare
        const userMultipleAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        let correctMultipleAnswers = Array.isArray(correctAnswer) 
          ? correctAnswer 
          : [correctAnswer];
        
        // If lengths differ, they can't be equal
        if (userMultipleAnswers.length !== correctMultipleAnswers.length) {
          return false;
        }
        
        // Sort both arrays to ignore order
        const sortedUserAnswers = [...userMultipleAnswers].map(val => String(val).trim().toLowerCase()).sort();
        const sortedCorrectAnswers = [...correctMultipleAnswers].map(val => String(val).trim().toLowerCase()).sort();
        
        // Compare each element
        for (let i = 0; i < sortedUserAnswers.length; i++) {
          if (sortedUserAnswers[i] !== sortedCorrectAnswers[i]) {
            return false;
          }
        }
        return true;
        
      case 'true-false':
        // For true-false, compare booleans and maintain order
        const userTrueFalse = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        let correctTrueFalse = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
        
        // Convert correct answers to booleans (handles both "true"/"false" strings and true/false booleans)
        correctTrueFalse = correctTrueFalse.map((val: any) => val === true || val === 'true');
        // Convert user answers to booleans (handles both "true"/"false" strings and true/false booleans)
        const convertedUserTrueFalse = userTrueFalse.map((val: any) => val === true || val === 'true');
        
        // If user provided fewer answers than expected, it's incorrect
        if (convertedUserTrueFalse.length < correctTrueFalse.length) {
          return false;
        }
        
        // For true-false, order matters - verify each position matches
        for (let i = 0; i < correctTrueFalse.length; i++) {
          if (convertedUserTrueFalse[i] !== correctTrueFalse[i]) {
            return false;
          }
        }
        return true;
        
      case 'number':
        // For number, compare as numbers
        let correctNumber = Array.isArray(correctAnswer) 
          ? correctAnswer[0] 
          : correctAnswer;
          
        // Convert both to numbers, handle empty string or invalid input
        const userNum = userAnswer === '' ? NaN : Number(userAnswer);
        const correctNum = String(correctNumber).trim() === '' ? NaN : Number(correctNumber);
        
        // Handle NaN comparison (empty input or invalid number)
        if (isNaN(userNum) || isNaN(correctNum)) {
          return false;
        }
        
        return userNum === correctNum;
        
      case 'text':
        // For text, compare as trimmed, case-insensitive strings
        let correctText = Array.isArray(correctAnswer) 
          ? correctAnswer[0] 
          : correctAnswer;
          
        // Compare trimmed strings case-insensitively
        return String(userAnswer).trim().toLowerCase() === String(correctText).trim().toLowerCase();
        
      default:
        // For any other type, do string comparison
        return String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
    }
  } catch (error) {
    console.error('Error comparing answers:', error);
    return false; // Default to incorrect if there's an error
  }
};

/**
 * Client-side version of getCorrectAnswerDisplay
 */
export const getClientCorrectAnswerDisplay = (correctAnswer: any, questionType: string): string => {
  if (!correctAnswer) return '';
  
  switch (questionType) {
    case 'single-choice':
      return Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
    case 'multiple-choice':
      return Array.isArray(correctAnswer) 
        ? correctAnswer.join(', ') 
        : correctAnswer;
    case 'true-false':
      if (Array.isArray(correctAnswer)) {
        return correctAnswer.map((val: any, idx: number) => 
          `${idx + 1}. ${val === 'true' || val === true ? 'Benar' : 'Salah'}`
        ).join(', ') || '';
      }
      return '';
    case 'text':
    case 'number':
      return Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
    default:
      return String(correctAnswer);
  }
};

/**
 * Function to display user's answer in a human-readable format
 */
export const getUserAnswerDisplay = (userAnswer: any, questionType: string): string => {
  if (userAnswer === null || userAnswer === undefined || userAnswer === '') return 'No answer provided';
  
  switch (questionType) {
    case 'single-choice':
      return userAnswer;
    case 'multiple-choice':
      return Array.isArray(userAnswer) 
        ? userAnswer.join(', ') 
        : userAnswer;
    case 'true-false':
      if (Array.isArray(userAnswer)) {
        return userAnswer.map((val: any, idx: number) => 
          `${idx + 1}. ${val === true || val === 'true' ? 'Benar' : 'Salah'}`
        ).join(', ') || '';
      }
      return '';
    case 'text':
    case 'number':
      return String(userAnswer);
    default:
      return String(userAnswer);
  }
};

/**
 * Setup interactive handlers for all practice question blocks
 */
export const setupPracticeQuestionHandlers = (editorRef: RefObject<HTMLDivElement>): void => {
  if (!editorRef.current) return;

  const blocks = editorRef.current.querySelectorAll('.cte-practice-question-block');

  blocks.forEach((block) => {
    // Setup option clicks for single/multiple choice
    const options = block.querySelectorAll('.practice-option');
    options.forEach((opt) => {
      opt.addEventListener('click', () => {
        const input = opt.querySelector('input') as HTMLInputElement;
        if (!input) return;

        const type = opt.getAttribute('data-type');
        if (type === 'single') {
          // Uncheck all other radios in the block
          block.querySelectorAll('input[type="radio"]').forEach((i: Element) => {
            (i as HTMLInputElement).checked = false;
          });
          input.checked = true;
        } else if (type === 'multiple') {
          input.checked = !input.checked;
        }
      });
    });

    // Setup check answer button
    const checkBtn = block.querySelector('.check-answer-btn') as HTMLButtonElement;
    if (checkBtn) {
      checkBtn.addEventListener('click', () => {
        const type = block.getAttribute('data-question-type');
        let userAnswer: any = null;
        let inputExists = false;

        switch (type) {
          case 'single-choice':
            userAnswer = (block.querySelector('input[type="radio"]:checked') as HTMLInputElement)?.value || null;
            inputExists = !!block.querySelector('input[type="radio"]');
            break;
          case 'multiple-choice':
            userAnswer = Array.from(block.querySelectorAll('input[type="checkbox"]:checked')).map((i) => (i as HTMLInputElement).value);
            inputExists = !!block.querySelector('input[type="checkbox"]');
            break;
          case 'true-false':
            const answers: boolean[] = [];
            const rows = block.querySelectorAll('tbody tr');
            rows.forEach((row) => {
              const checked = row.querySelector('input[type="radio"]:checked') as HTMLInputElement;
              if (checked) {
                answers.push(checked.value === 'true');
              } else {
                answers.push(false); // Default to false if not answered
              }
            });
            userAnswer = answers;
            inputExists = !!block.querySelector('input[type="radio"]');
            break;
          case 'text':
            const textInput = block.querySelector('.practice-text-input') as HTMLInputElement;
            userAnswer = textInput?.value.trim();
            inputExists = !!textInput;
            break;
          case 'number':
            const numberInput = block.querySelector('.practice-number-input') as HTMLInputElement;
            userAnswer = numberInput?.value.trim();
            inputExists = !!numberInput;
            break;
        }

        // Validate input for text and number types
        if (!inputExists) {
          alert('No input field available. Please check the question setup.');
          return;
        }

        if ((type === 'text' || type === 'number') && (userAnswer === '' || userAnswer === null)) {
          alert('Please provide an answer first.');
          return;
        }

        if ((type === 'single-choice' || type === 'multiple-choice' || type === 'true-false') && 
            (userAnswer === null || (Array.isArray(userAnswer) && userAnswer.length === 0))) {
          alert('Please select an answer first.');
          return;
        }

        const encodedCorrect = block.getAttribute('data-correct-answer') || '';
        const correctAnswer = JSON.parse(decodeURIComponent(encodedCorrect));

        const isCorrect = isAnswerCorrect(userAnswer, correctAnswer, type || '');

        const resultContent = block.querySelector('.result-content') as HTMLElement;
        if (resultContent) {
          if (isCorrect) {
            resultContent.innerHTML = '<span class="tw-text-green-600 tw-font-bold">Benar!</span>';
          } else {
            const userDisplay = getUserAnswerDisplay(userAnswer, type || '');
            const correctDisplay = getClientCorrectAnswerDisplay(correctAnswer, type || '');
            resultContent.innerHTML = '<span class="tw-text-red-600 tw-font-bold">Salah.</span> Jawaban kamu = ' + userDisplay + '. Jawaban benar: ' + correctDisplay;
          }
        }

        const resultArea = block.querySelector('.result-area') as HTMLElement;
        if (resultArea) {
          resultArea.classList.remove('tw-hidden');
        }

        const showExpBtn = block.querySelector('.show-explanation-btn') as HTMLElement;
        if (showExpBtn) {
          showExpBtn.classList.remove('tw-hidden');
        }
      });
    }

    // Setup show explanation button
    const showExpBtn = block.querySelector('.show-explanation-btn') as HTMLButtonElement;
    if (showExpBtn) {
      showExpBtn.addEventListener('click', () => {
        const encodedExp = block.getAttribute('data-explanation') || '';
        const exp = decodeURIComponent(encodedExp);

        const expContent = block.querySelector('.explanation-content') as HTMLElement;
        if (expContent) {
          expContent.innerHTML = DOMPurify.sanitize(exp);
        }

        const expArea = block.querySelector('.explanation-area') as HTMLElement;
        if (expArea) {
          expArea.classList.remove('tw-hidden');
        }

        // Optionally hide the button after showing
        showExpBtn.classList.add('tw-hidden');
      });
    }
  });
};

export default {
  PracticeButton,
  PracticeModal,
  insertPracticeQuestion,
  getPracticeQuestionStyles
};