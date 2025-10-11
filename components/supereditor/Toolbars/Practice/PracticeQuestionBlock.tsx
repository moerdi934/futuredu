// components/supereditor/Toolbars/Practice/Practice.tsx
'use client';

import React, { useState, useEffect, RefObject } from 'react';
import { BookOpen, X, Search, Loader2 } from 'lucide-react';
import { Modal } from 'react-bootstrap';
import { ButtonGradient } from '../../../button/ButtonTemplate';
import { SearchSingleField, SelectOption } from '../../../form/FormComponentLayout';
import axios from 'axios';
import DOMPurify from 'dompurify';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
  level?: string;
  passage?: {
    id: number;
    title: string;
    content: string;
  };
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
        return question.correct_answer;
      case 'multiple-choice':
        return Array.isArray(question.correct_answer) 
          ? question.correct_answer.join(', ') 
          : question.correct_answer;
      case 'true-false':
        if (Array.isArray(question.correct_answer)) {
          return question.statements?.map((stmt: string, idx: number) => 
            `${idx + 1}. ${question.correct_answer[idx] ? 'True' : 'False'}`
          ).join(', ') || '';
        }
        return '';
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
      <Modal.Header className="tw-bg-gray-50 tw-border-b tw-border-gray-200">
        <Modal.Title className="tw-flex tw-items-center tw-gap-2 tw-text-gray-800">
          <BookOpen className="tw-w-5 tw-h-5 tw-text-blue-600" />
          Insert Practice Question
        </Modal.Title>
        <button
          onClick={onClose}
          className="tw-text-gray-500 hover:tw-text-gray-700 tw-transition-colors"
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
            icon={<Search className="tw-w-4 tw-h-4 tw-text-gray-500" />}
            onClear={() => setSelectedQuestion(null)}
            transformResponse={(response) => response.data || response}
          />
        </div>

        {loading && (
          <div className="tw-text-center tw-py-8">
            <Loader2 className="tw-w-8 tw-h-8 tw-animate-spin tw-text-blue-600 tw-mx-auto tw-mb-2" />
            <p className="tw-text-gray-600">Loading question details...</p>
          </div>
        )}

        {questionData && !loading && (
          <div className="tw-border tw-border-gray-200 tw-rounded-md tw-p-4 tw-bg-gray-50">
            <h4 className="tw-font-medium tw-text-gray-800 tw-mb-3">Preview:</h4>
            
            {questionData.passage && (
              <div className="tw-mb-4 tw-p-3 tw-bg-white tw-rounded-md tw-border tw-border-gray-200">
                <h5 className="tw-font-medium tw-text-gray-700 tw-mb-2">
                  Passage: {questionData.passage.title}
                </h5>
                <div 
                  className="tw-text-sm tw-text-gray-600"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(questionData.passage.content.substring(0, 200) + '...') 
                  }}
                />
              </div>
            )}
            
            <div className="tw-mb-3">
              <span className="tw-font-medium tw-text-gray-700">Question:</span>
              <div 
                className="tw-mt-1 tw-text-gray-800"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(questionData.question) 
                }}
              />
            </div>

            {questionData.options && (
              <div className="tw-mb-3">
                <span className="tw-font-medium tw-text-gray-700">Options:</span>
                <ul className="tw-list-none tw-pl-0 tw-mt-1 tw-text-gray-800">
                  {questionData.options.map((option, idx) => (
                    <li key={idx} className="tw-mb-1">
                      <span className="tw-font-medium">{optionLabels[idx]}.</span>{' '}
                      <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(option) }} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {questionData.statements && (
              <div className="tw-mb-3">
                <span className="tw-font-medium tw-text-gray-700">Statements:</span>
                <ul className="tw-list-decimal tw-pl-5 tw-mt-1 tw-text-gray-800">
                  {questionData.statements.map((statement, idx) => (
                    <li key={idx} className="tw-mb-1">{statement}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="tw-mb-3 tw-p-2 tw-bg-green-50 tw-rounded-md tw-border tw-border-green-200 tw-text-gray-800">
              <span className="tw-font-medium tw-text-green-700">Correct Answer:</span>{' '}
              <span className="tw-text-green-800">{getCorrectAnswerDisplay(questionData)}</span>
            </div>

            {questionData.pembahasan && (
              <div className="tw-p-2 tw-bg-yellow-50 tw-rounded-md tw-border tw-border-yellow-200 tw-text-gray-800">
                <span className="tw-font-medium tw-text-yellow-700">Explanation:</span>
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

      <Modal.Footer className="tw-border-t tw-border-gray-200">
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
  const encodedExplanation = encodeURIComponent(questionData.pembahasan || 'No explanation.');

  // Generate input fields based on question type
  const getInputHTML = () => {
    switch (questionData.type) {
      case 'single-choice':
        return questionData.options?.map((option, idx) => {
          const label = optionLabels[idx];
          return `
            <div class="practice-option tw-flex tw-items-center tw-mb-2 tw-p-2 tw-rounded-md tw-border tw-border-gray-200 tw-bg-white tw-cursor-pointer hover:tw-bg-gray-50" 
                 data-label="${label}"
                 data-type="single">
              <input type="radio" name="practice-${uniqueId}" value="${label}" class="tw-mr-2">
              <span class="tw-font-medium">${label}.</span> ${option}
            </div>
          `;
        }).join('') || '';

      case 'multiple-choice':
        return questionData.options?.map((option, idx) => {
          const label = optionLabels[idx];
          return `
            <div class="practice-option tw-flex tw-items-center tw-mb-2 tw-p-2 tw-rounded-md tw-border tw-border-gray-200 tw-bg-white tw-cursor-pointer hover:tw-bg-gray-50" 
                 data-label="${label}"
                 data-type="multiple">
              <input type="checkbox" value="${label}" class="tw-mr-2">
              <span class="tw-font-medium">${label}.</span> ${option}
            </div>
          `;
        }).join('') || '';

      case 'true-false':
        return `
          <table class="tw-w-full tw-border-collapse tw-mt-2">
            <thead>
              <tr class="tw-bg-gray-50">
                <th class="tw-border tw-border-gray-200 tw-p-2 tw-text-left">Statement</th>
                <th class="tw-border tw-border-gray-200 tw-p-2 tw-text-center tw-w-20">True</th>
                <th class="tw-border tw-border-gray-200 tw-p-2 tw-text-center tw-w-20">False</th>
              </tr>
            </thead>
            <tbody>
              ${questionData.statements?.map((stmt, idx) => `
                <tr>
                  <td class="tw-border tw-border-gray-200 tw-p-2">${stmt}</td>
                  <td class="tw-border tw-border-gray-200 tw-p-2 tw-text-center">
                    <input type="radio" name="practice-${uniqueId}-${idx}" value="true">
                  </td>
                  <td class="tw-border tw-border-gray-200 tw-p-2 tw-text-center">
                    <input type="radio" name="practice-${uniqueId}-${idx}" value="false">
                  </td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
        `;

      case 'text-input':
        return `
          <input type="text" 
                 class="practice-text-input tw-w-full tw-p-2 tw-border tw-border-gray-200 tw-rounded-md" 
                 placeholder="Enter your answer...">
        `;

      case 'number-input':
        return `
          <input type="number" 
                 class="practice-number-input tw-w-full tw-p-2 tw-border tw-border-gray-200 tw-rounded-md" 
                 placeholder="Enter number...">
        `;

      default:
        return '';
    }
  };

  // Practice question HTML with professional design
  const practiceQuestionHtml = `
    <div class="cte-practice-question-block tw-my-4 tw-border tw-border-gray-200 tw-rounded-md tw-overflow-hidden tw-bg-white tw-shadow-sm tw-relative" 
         data-practice-id="${uniqueId}"
         data-question-type="${questionData.type}"
         data-correct-answer="${encodedCorrectAnswer}"
         data-explanation="${encodedExplanation}">
      
      <!-- Delete Button - Only visible in editor -->
      <button class="practice-delete-btn practice-editor-only tw-absolute tw-top-2 tw-right-2 tw-bg-red-500 hover:tw-bg-red-600 tw-text-white tw-p-1 tw-rounded-full tw-transition-all tw-opacity-0 hover:tw-opacity-100" 
              title="Delete question">
        <svg class="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
      
      <div class="tw-p-4">
        <!-- Header -->
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-3 tw-border-b tw-border-gray-200 tw-pb-2">
          <h4 class="tw-text-md tw-font-medium tw-text-gray-800 tw-m-0">
            Practice Question - ${questionData.code || `ID: ${questionData.id}`}
          </h4>
          ${questionData.level ? `<span class="tw-text-sm tw-text-gray-500">Level: ${questionData.level}</span>` : ''}
        </div>

        <!-- Passage if exists -->
        ${questionData.passage ? `
          <div class="tw-mb-4 tw-p-3 tw-bg-gray-50 tw-rounded-md tw-border tw-border-gray-200">
            <h5 class="tw-font-medium tw-text-gray-700 tw-mb-2">Passage: ${questionData.passage.title}</h5>
            <div class="tw-text-sm tw-text-gray-600">
              ${questionData.passage.content}
            </div>
          </div>
        ` : ''}
        
        <!-- Question -->
        <div class="tw-mb-4">
          ${questionData.question}
        </div>

        <!-- Answer Input Area -->
        <div class="tw-mb-4">
          ${getInputHTML()}
        </div>

        <!-- Action Buttons -->
        <div class="tw-flex tw-gap-2 tw-mb-3">
          <button class="check-answer-btn tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-px-4 tw-py-2 tw-rounded-md tw-font-medium tw-transition-colors">
            Check Answer
          </button>
          <button class="show-explanation-btn tw-bg-gray-600 hover:tw-bg-gray-700 tw-text-white tw-px-4 tw-py-2 tw-rounded-md tw-font-medium tw-transition-colors tw-hidden">
            Show Explanation
          </button>
        </div>

        <!-- Result Area (hidden initially) -->
        <div class="result-area tw-hidden tw-p-3 tw-rounded-md tw-bg-gray-50 tw-border tw-border-gray-200 tw-mb-3">
          <div class="result-content"></div>
        </div>

        <!-- Explanation Area (hidden initially) -->
        <div class="explanation-area tw-hidden tw-p-3 tw-rounded-md tw-bg-gray-50 tw-border tw-border-gray-200">
          <h5 class="tw-font-medium tw-text-gray-700 tw-mb-2">Explanation:</h5>
          <div class="explanation-content tw-text-sm tw-text-gray-600">
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
    transition: all 0.2s ease;
  }
  
  .cte-practice-question-block:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  /* Hide delete button in production/when not contenteditable */
  .cte-practice-question-block .practice-delete-btn {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  /* Show on hover in editor */
  [contenteditable="true"] .cte-practice-question-block:hover .practice-delete-btn {
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
    border: 1px solid #e5e7eb;
  }
  
  .cte-practice-question-block th {
    background-color: #f9fafb;
    font-weight: medium;
    color: #374151;
  }

  .practice-option {
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .practice-option:hover {
    background-color: #f9fafb;
  }

  .practice-option input {
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    .cte-practice-question-block {
      margin: 0.5rem 0;
    }
    
    .cte-practice-question-block .tw-p-4 {
      padding: 1rem;
    }
  }
`;

export default {
  PracticeButton,
  PracticeModal,
  insertPracticeQuestion,
  getPracticeQuestionStyles
};