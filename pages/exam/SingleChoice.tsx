'use client';

import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import DOMPurify from 'dompurify';

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

interface SingleChoiceProps {
  question: React.ReactNode;
  options?: string[];
  onChange: (value: string) => void;
  selectedAnswers: string;
}

const SingleChoice: React.FC<SingleChoiceProps> = ({ 
  question, 
  options = [], 
  onChange, 
  selectedAnswers 
}) => {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  
  const handleOptionHover = (label: string) => {
    setHoveredLabel(label);
  };
  
  const handleOptionClick = (label: string) => {
    if (selectedAnswers === label) {
      onChange(''); // Clear selection if clicking the same option
    } else {
      onChange(label); // Select new option
    }
  };

  return (
    <div className="tw-w-full [&_p_span]:!tw-bg-transparent">
      <div className="tw-mb-4">{question}</div>
      {options.map((option, index) => {
        const sanitizedOption = DOMPurify.sanitize(option);
        const label = optionLabels[index];
        const isSelected = selectedAnswers === label;
        const isHovered = hoveredLabel === label;

        return (
          <div
            key={label}
            onClick={() => handleOptionClick(label)}
            className={`
              tw-flex tw-items-start tw-justify-between tw-mb-4 
              tw-p-4 tw-rounded-lg tw-cursor-pointer tw-transition-all tw-duration-300
              tw-border tw-border-gray-300
              tw-shadow-sm
              [&_p_span]:!tw-bg-transparent
              ${isSelected ? 'tw-bg-green-200 !tw-bg-green-200' : 
                isHovered ? 'tw-bg-violet-200' : 'tw-bg-white'}
              md:hover:tw-bg-violet-300
            `}
            onMouseEnter={() => handleOptionHover(label)}
            onMouseLeave={() => setHoveredLabel(null)}
          >
            <div className="tw-flex tw-items-start tw-gap-4 tw-w-full">
              <span className="tw-font-medium">{label}.</span>
              <div className="tw-flex-1 [&_p_span]:!tw-bg-transparent">
                <Latex>{sanitizedOption}</Latex>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SingleChoice;