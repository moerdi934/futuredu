'use client';
export async function getServerSideProps() {
  return { props: {} };      // lewati SSG, hanya SSR/CSR
}

import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import DOMPurify from 'dompurify';

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

interface MultipleChoiceProps {
  question: string;
  options: string[];
  onChange: (selectedAnswers: string[]) => void;
  selectedAnswers: string[];
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  question,
  options,
  onChange,
  selectedAnswers
}) => {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const handleOptionClick = (label: string) => {
    if (selectedAnswers.includes(label)) {
      onChange(selectedAnswers.filter(val => val !== label));
    } else {
      onChange([...selectedAnswers, label]);
    }
  };

  return (
    <div className="tw-space-y-4 [&_p]:tw-text-black [&_p]:tw-text-base [&_p]:tw-text-justify [&_p]:tw-font-sans [&_p_span]:tw-text-black [&_p_span]:tw-text-base [&_p_span]:tw-text-justify [&_p_span]:tw-font-sans [&_p_span]:!tw-bg-transparent">
      <p className="tw-text-xl tw-font-semibold tw-mb-4">{question}</p>
      {options.map((option, index) => {
        const sanitizedOption = DOMPurify.sanitize(option);
        const label = optionLabels[index];
        const isSelected = selectedAnswers.includes(label);
        const isHovered = hoveredLabel === label;

        return (
          <div
            key={index}
            onClick={() => handleOptionClick(label)}
            className={`
              tw-flex tw-items-start tw-justify-between tw-mb-4
              tw-p-4 tw-rounded-lg tw-cursor-pointer
              tw-border tw-border-gray-300
              tw-shadow-sm tw-transition-colors tw-duration-300
              [&_p_span]:!tw-bg-transparent
              ${isSelected ? 'tw-bg-green-200 !tw-bg-green-200' : 'tw-bg-white'}
              ${!isSelected && isHovered ? 'tw-bg-violet-200' : ''}
              md:hover:tw-bg-violet-300
            `}
            onMouseEnter={() => setHoveredLabel(label)}
            onMouseLeave={() => setHoveredLabel(null)}
          >
            <div className="tw-flex tw-items-center">
              <span className="tw-font-bold tw-text-lg tw-mr-2">{label}.</span>
            </div>
            <div className="tw-flex-grow [&_p_span]:!tw-bg-transparent">
              <Latex>{sanitizedOption}</Latex>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MultipleChoice;