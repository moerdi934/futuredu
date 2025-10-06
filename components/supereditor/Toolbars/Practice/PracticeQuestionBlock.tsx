
// components/supereditor/Toolbars/Practice/PracticeQuestionBlock.tsx
'use client';

import React, { useState } from 'react';
import { BookOpen, X, Check, XCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// Single Choice Component for Practice
const PracticeSingleChoice = ({ question, options, onAnswerChange, userAnswer, correctAnswer, showResult }) => {
  const [hoveredLabel, setHoveredLabel] = useState(null);

  const handleOptionClick = (label) => {
    if (showResult) return;
    onAnswerChange(userAnswer === label ? '' : label);
  };

  const getOptionStyle = (label) => {
    if (showResult) {
      if (label === correctAnswer) {
        return 'tw-bg-green-200 tw-border-green-500';
      }
      if (label === userAnswer && userAnswer !== correctAnswer) {
        return 'tw-bg-red-200 tw-border-red-500';
      }
    } else if (userAnswer === label) {
      return 'tw-bg-purple-100 tw-border-purple-400';
    } else if (hoveredLabel === label) {
      return 'tw-bg-violet-200';
    }
    return 'tw-bg-white';
  };

  return (
    <div className="tw-space-y-4">
      <div 
        className="tw-text-xl tw-font-semibold tw-mb-4 tw-text-black"
        dangerouslySetInnerHTML={{ __html: question }}
      />
      {options?.map((option, index) => {
        const label = optionLabels[index];
        return (
          <div
            key={index}
            onClick={() => handleOptionClick(label)}
            className={`
              tw-flex tw-items-start tw-justify-between tw-mb-3 tw-p-4 tw-rounded-lg 
              tw-border tw-border-gray-300 tw-shadow-sm tw-transition-all tw-duration-300
              ${!showResult ? 'tw-cursor-pointer' : 'tw-cursor-default'}
              ${getOptionStyle(label)}
              ${!showResult && 'md:hover:tw-bg-violet-300'}
            `}
            onMouseEnter={() => !showResult && setHoveredLabel(label)}
            onMouseLeave={() => setHoveredLabel(null)}
          >
            <div className="tw-flex tw-items-start tw-gap-4 tw-w-full">
              <span className="tw-font-medium tw-text-black">{label}.</span>
              <div 
                className="tw-flex-1 tw-text-black"
                dangerouslySetInnerHTML={{ __html: option }}
              />
            </div>
            {showResult && label === correctAnswer && (
              <Check className="tw-text-green-600 tw-ml-2 tw-flex-shrink-0" size={20} />
            )}
            {showResult && label === userAnswer && userAnswer !== correctAnswer && (
              <XCircle className="tw-text-red-600 tw-ml-2 tw-flex-shrink-0" size={20} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Multiple Choice Component for Practice
const PracticeMultipleChoice = ({ question, options, onAnswerChange, userAnswer = [], correctAnswer = [], showResult }) => {
  const [hoveredLabel, setHoveredLabel] = useState(null);

  const handleOptionClick = (label) => {
    if (showResult) return;
    const newAnswer = userAnswer.includes(label)
      ? userAnswer.filter(val => val !== label)
      : [...userAnswer, label];
    onAnswerChange(newAnswer);
  };

  const getOptionStyle = (label) => {
    if (showResult) {
      const isCorrectOption = correctAnswer.includes(label);
      const isUserSelected = userAnswer.includes(label);
      
      if (isCorrectOption && isUserSelected) {
        return 'tw-bg-green-200 tw-border-green-500';
      }
      if (isCorrectOption && !isUserSelected) {
        return 'tw-bg-yellow-100 tw-border-yellow-400';
      }
      if (!isCorrectOption && isUserSelected) {
        return 'tw-bg-red-200 tw-border-red-500';
      }
    } else if (userAnswer.includes(label)) {
      return 'tw-bg-purple-100 tw-border-purple-400';
    } else if (hoveredLabel === label) {
      return 'tw-bg-violet-200';
    }
    return 'tw-bg-white';
  };

  return (
    <div className="tw-space-y-4">
      <p 
        className="tw-text-xl tw-font-semibold tw-mb-4 tw-text-black"
        dangerouslySetInnerHTML={{ __html: question }}
      />
      {options?.map((option, index) => {
        const label = optionLabels[index];
        const isCorrectOption = correctAnswer.includes(label);
        const isUserSelected = userAnswer.includes(label);

        return (
          <div
            key={index}
            onClick={() => handleOptionClick(label)}
            className={`
              tw-flex tw-items-start tw-justify-between tw-mb-4 tw-p-4 tw-rounded-lg 
              tw-border tw-border-gray-300 tw-shadow-sm tw-transition-colors tw-duration-300
              ${!showResult ? 'tw-cursor-pointer' : 'tw-cursor-default'}
              ${getOptionStyle(label)}
              ${!showResult && 'md:hover:tw-bg-violet-300'}
            `}
            onMouseEnter={() => !showResult && setHoveredLabel(label)}
            onMouseLeave={() => setHoveredLabel(null)}
          >
            <div className="tw-flex tw-items-center">
              <span className="tw-font-bold tw-text-lg tw-mr-2 tw-text-black">{label}.</span>
            </div>
            <div 
              className="tw-flex-grow tw-text-black"
              dangerouslySetInnerHTML={{ __html: option }}
            />
            {showResult && (
              <>
                {isCorrectOption && isUserSelected && (
                  <Check className="tw-text-green-600 tw-ml-2 tw-flex-shrink-0" size={20} />
                )}
                {isCorrectOption && !isUserSelected && (
                  <div className="tw-text-yellow-600 tw-ml-2 tw-text-xs tw-flex-shrink-0">Terlewat</div>
                )}
                {!isCorrectOption && isUserSelected && (
                  <XCircle className="tw-text-red-600 tw-ml-2 tw-flex-shrink-0" size={20} />
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Number Input Component for Practice
const PracticeNumberInput = ({ question, onAnswerChange, userAnswer, correctAnswer, showResult }) => {
  const getInputStyle = () => {
    if (showResult) {
      if (parseFloat(userAnswer) === parseFloat(correctAnswer)) {
        return 'tw-border-green-500 tw-bg-green-50';
      }
      return 'tw-border-red-500 tw-bg-red-50';
    }
    return 'tw-border-gray-300';
  };

  return (
    <div className="tw-space-y-4">
      <div 
        className="tw-text-xl tw-font-semibold tw-mb-4 tw-text-black"
        dangerouslySetInnerHTML={{ __html: question }}
      />
      <div className="tw-relative">
        <input
          type="number"
          value={userAnswer || ''}
          onChange={(e) => !showResult && onAnswerChange(parseFloat(e.target.value))}
          className={`tw-w-full tw-p-2 tw-border tw-rounded-md ${getInputStyle()}`}
          disabled={showResult}
        />
        {showResult && (
          <div className="tw-mt-2">
            {parseFloat(userAnswer) === parseFloat(correctAnswer) ? (
              <div className="tw-text-green-600 tw-flex tw-items-center">
                <Check size={16} className="tw-mr-1" /> Benar!
              </div>
            ) : (
              <div className="tw-text-red-600">
                <div className="tw-flex tw-items-center tw-mb-1">
                  <XCircle size={16} className="tw-mr-1" /> Salah
                </div>
                <div className="tw-text-sm">Jawaban benar: {correctAnswer}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Text Input Component for Practice
const PracticeTextInput = ({ question, onAnswerChange, userAnswer, correctAnswer, showResult }) => {
  const isCorrect = userAnswer?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
  
  const getInputStyle = () => {
    if (showResult) {
      if (isCorrect) {
        return 'tw-border-green-500 tw-bg-green-50';
      }
      return 'tw-border-red-500 tw-bg-red-50';
    }
    return 'tw-border-gray-300';
  };

  return (
    <div className="tw-space-y-4">
      <div 
        className="tw-text-xl tw-font-semibold tw-mb-4 tw-text-black"
        dangerouslySetInnerHTML={{ __html: question }}
      />
      <div className="tw-relative">
        <input
          type="text"
          value={userAnswer || ''}
          onChange={(e) => !showResult && onAnswerChange(e.target.value)}
          className={`tw-w-full tw-p-2 tw-border tw-rounded-md ${getInputStyle()}`}
          disabled={showResult}
        />
        {showResult && (
          <div className="tw-mt-2">
            {isCorrect ? (
              <div className="tw-text-green-600 tw-flex tw-items-center">
                <Check size={16} className="tw-mr-1" /> Benar!
              </div>
            ) : (
              <div className="tw-text-red-600">
                <div className="tw-flex tw-items-center tw-mb-1">
                  <XCircle size={16} className="tw-mr-1" /> Salah
                </div>
                <div className="tw-text-sm">Jawaban benar: {correctAnswer}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// True/False Component for Practice
const PracticeTrueFalse = ({ question, statements, onAnswerChange, userAnswer = [], correctAnswer = [], showResult }) => {
  const handleChange = (index, value) => {
    if (showResult) return;
    const newAnswer = [...userAnswer];
    newAnswer[index] = value;
    onAnswerChange(newAnswer);
  };

  const getRowStyle = (index) => {
    if (showResult) {
      if (userAnswer[index] === correctAnswer[index]) {
        return 'tw-bg-green-50';
      }
      return 'tw-bg-red-50';
    }
    return '';
  };

  return (
    <div className="tw-space-y-4">
      <div 
        className="tw-text-xl tw-font-semibold tw-mb-4 tw-text-black"
        dangerouslySetInnerHTML={{ __html: question }}
      />
      <div className="tw-w-full tw-overflow-x-auto">
        <table className="tw-w-full tw-border-collapse tw-bg-white">
          <thead>
            <tr>
              <th className="tw-border-2 tw-border-gray-400 tw-bg-gray-200 tw-p-4 tw-text-left tw-font-bold tw-text-black">Pernyataan</th>
              <th className="tw-border-2 tw-border-gray-400 tw-bg-gray-200 tw-p-4 tw-text-center tw-w-24 tw-font-bold tw-text-black">Benar</th>
              <th className="tw-border-2 tw-border-gray-400 tw-bg-gray-200 tw-p-4 tw-text-center tw-w-24 tw-font-bold tw-text-black">Salah</th>
            </tr>
          </thead>
          <tbody>
            {statements?.map((statement, index) => (
              <tr key={index} className={`hover:tw-bg-gray-50 ${getRowStyle(index)}`}>
                <td className="tw-border-2 tw-border-gray-400 tw-p-4 tw-font-medium tw-text-black">
                  {statement}
                  {showResult && userAnswer[index] !== correctAnswer[index] && (
                    <div className="tw-text-sm tw-text-red-600 tw-mt-1">
                      Seharusnya: {correctAnswer[index] ? 'Benar' : 'Salah'}
                    </div>
                  )}
                </td>
                <td className="tw-border-2 tw-border-gray-400 tw-p-4 tw-text-center">
                  <input
                    type="radio"
                    name={`statement-${index}`}
                    checked={userAnswer[index] === true}
                    onChange={() => handleChange(index, true)}
                    className="tw-cursor-pointer tw-w-4 tw-h-4"
                    disabled={showResult}
                  />
                </td>
                <td className="tw-border-2 tw-border-gray-400 tw-p-4 tw-text-center">
                  <input
                    type="radio"
                    name={`statement-${index}`}
                    checked={userAnswer[index] === false}
                    onChange={() => handleChange(index, false)}
                    className="tw-cursor-pointer tw-w-4 tw-h-4"
                    disabled={showResult}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Practice Question Component
const PracticeQuestionBlock = ({ questionData, onDelete }) => {
  const [userAnswer, setUserAnswer] = useState(
    questionData.type === 'true-false' ? [] : 
    questionData.type === 'multiple-choice' ? [] : ''
  );
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleCheckAnswer = () => {
    setShowResult(true);
  };

  const isAnswerCorrect = () => {
    switch (questionData.type) {
      case 'single-choice':
        return userAnswer === questionData.correct_answer;
      case 'multiple-choice':
        return JSON.stringify([...userAnswer].sort()) === JSON.stringify([...questionData.correct_answer].sort());
      case 'true-false':
        return JSON.stringify(userAnswer) === JSON.stringify(questionData.correct_answer);
      case 'text-input':
        return userAnswer?.toLowerCase().trim() === questionData.correct_answer?.toLowerCase().trim();
      case 'number-input':
        return parseFloat(userAnswer) === parseFloat(questionData.correct_answer);
      default:
        return false;
    }
  };

  const renderQuestionComponent = () => {
    const props = {
      question: questionData.question,
      onAnswerChange: setUserAnswer,
      userAnswer,
      correctAnswer: questionData.correct_answer,
      showResult
    };

    switch (questionData.type) {
      case 'single-choice':
        return <PracticeSingleChoice {...props} options={questionData.options} />;
      case 'multiple-choice':
        return <PracticeMultipleChoice {...props} options={questionData.options} />;
      case 'number-input':
        return <PracticeNumberInput {...props} />;
      case 'text-input':
        return <PracticeTextInput {...props} />;
      case 'true-false':
        return <PracticeTrueFalse {...props} statements={questionData.statements} />;
      default:
        return <div>Tipe soal tidak dikenali</div>;
    }
  };

  return (
    <div className="tw-my-6 tw-border-2 tw-border-purple-300 tw-rounded-xl tw-overflow-hidden tw-bg-white tw-shadow-lg">
      {/* Header */}
      <div className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-text-white tw-p-4 tw-flex tw-justify-between tw-items-center">
        <div className="tw-flex tw-items-center tw-gap-2">
          <BookOpen className="tw-w-5 tw-h-5" />
          <h4 className="tw-text-lg tw-font-bold tw-m-0">
            📚 Latihan Soal - {questionData.code || `ID: ${questionData.id}`}
          </h4>
        </div>
        <button
          onClick={onDelete}
          className="tw-bg-red-500 hover:tw-bg-red-600 tw-text-white tw-p-2 tw-rounded-full tw-transition-all"
          title="Hapus Latihan"
        >
          <X className="tw-w-4 tw-h-4" />
        </button>
      </div>

      {/* Passage if exists */}
      {questionData.passage && (
        <div className="tw-bg-blue-50 tw-border-b tw-border-blue-200 tw-p-4">
          <h5 className="tw-font-bold tw-text-blue-800 tw-mb-2">📖 Bacaan: {questionData.passage.title}</h5>
          <div 
            className="tw-text-blue-900 tw-text-sm" 
            dangerouslySetInnerHTML={{ __html: questionData.passage.content }} 
          />
        </div>
      )}

      {/* Question Content */}
      <div className="tw-p-6">
        {renderQuestionComponent()}

        {/* Action Buttons */}
        <div className="tw-flex tw-gap-2 tw-mt-6">
          {!showResult && (
            <button
              onClick={handleCheckAnswer}
              className="tw-bg-green-500 hover:tw-bg-green-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-lg tw-font-medium tw-transition-colors tw-flex tw-items-center tw-gap-2"
            >
              <Check size={18} /> Cek Jawaban
            </button>
          )}
          {showResult && (
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="tw-bg-yellow-500 hover:tw-bg-yellow-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-lg tw-font-medium tw-transition-colors tw-flex tw-items-center tw-gap-2"
            >
              <Lightbulb size={18} />
              {showExplanation ? 'Sembunyikan Pembahasan' : 'Lihat Pembahasan'}
              {showExplanation ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>

        {/* Result Display */}
        {showResult && (
          <div className={`tw-mt-4 tw-p-4 tw-rounded-lg ${isAnswerCorrect() ? 'tw-bg-green-100 tw-border tw-border-green-300' : 'tw-bg-red-100 tw-border tw-border-red-300'}`}>
            <div className="tw-flex tw-items-center tw-gap-2 tw-font-bold tw-text-lg">
              {isAnswerCorrect() ? (
                <>
                  <Check className="tw-text-green-600" size={24} />
                  <span className="tw-text-green-700">Benar! 🎉</span>
                </>
              ) : (
                <>
                  <XCircle className="tw-text-red-600" size={24} />
                  <span className="tw-text-red-700">Belum Tepat</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Explanation */}
        {showResult && showExplanation && (
          <div className="tw-mt-4 tw-bg-yellow-50 tw-border tw-border-yellow-300 tw-rounded-lg tw-p-4">
            <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <Lightbulb className="tw-text-yellow-600" size={20} />
              <h5 className="tw-font-bold tw-text-yellow-800 tw-m-0">Pembahasan:</h5>
            </div>
            <div 
              className="tw-text-yellow-900" 
              dangerouslySetInnerHTML={{ __html: questionData.pembahasan || 'Tidak ada pembahasan.' }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeQuestionBlock;