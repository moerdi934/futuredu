'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import DOMPurify from 'dompurify';

interface NumberInputProps {
  question: string;
  onChange: (value: number) => void;
  value?: number; 
}

const NumberInput: React.FC<NumberInputProps> = ({ question, onChange, value  }) => {
  // Sanitize the HTML content
  const sanitizedQuestion = DOMPurify.sanitize(question);

  return (
  <div className="tw-space-y-4 [&_p]:tw-text-black [&_p]:tw-text-base [&_p]:tw-text-justify [&_p]:tw-font-sans [&_p_span]:tw-text-black [&_p_span]:tw-text-base [&_p_span]:tw-text-justify [&_p_span]:tw-font-sans">
      <div 
        className="tw-text-xl tw-font-semibold tw-mb-4"
        dangerouslySetInnerHTML={{ __html: sanitizedQuestion }}
      />
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="tw-w-full tw-p-2 tw-border tw-border-gray-300 tw-rounded-md"
      />
    </div>
  );
};

export default NumberInput;