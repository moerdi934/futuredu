'use client';
import React from 'react';
import 'katex/dist/katex.min.css';
import DOMPurify from 'dompurify';

interface TextInputProps {
  question: string;
  onChange: (value: string) => void;
  value?: string; 
}

const TextInput: React.FC<TextInputProps> = ({ question, onChange, value  }) => {
  const sanitizedQuestion = DOMPurify.sanitize(question);
  return (
    <div className="tw-space-y-4 [&_p]:tw-text-black [&_p]:tw-text-base [&_p]:tw-text-justify [&_p]:tw-font-sans [&_p_span]:tw-text-black [&_p_span]:tw-text-base [&_p_span]:tw-text-justify [&_p_span]:tw-font-sans">
      <div 
        className="tw-text-xl tw-font-semibold tw-mb-4"
        dangerouslySetInnerHTML={{ __html: sanitizedQuestion }}
      />
      <input 
        type="text" 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)} 
        className="tw-w-full tw-p-2 tw-border tw-border-gray-300 tw-rounded-md"
      />
    </div>
  );
};

export default TextInput;