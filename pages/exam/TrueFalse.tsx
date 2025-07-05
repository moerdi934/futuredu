'use client';
export async function getServerSideProps() {
  return { props: {} };      // lewati SSG, hanya SSR/CSR
}
import React from 'react';
import 'katex/dist/katex.min.css';
import DOMPurify from 'dompurify';

interface TrueFalseProps {
  question: string;
  statements: string[];
  selectedAnswers: boolean[];
  onChange: (index: number, value: boolean) => void;
}

const TrueFalse: React.FC<TrueFalseProps> = ({ question, statements, selectedAnswers, onChange }) => {
  const sanitizedQuestion = DOMPurify.sanitize(question);
  
  return (
<div className="tw-space-y-4 [&_p]:tw-text-black [&_p]:tw-text-base [&_p]:tw-text-justify [&_p]:tw-font-sans [&_p_span]:tw-text-black [&_p_span]:tw-text-base [&_p_span]:tw-text-justify [&_p_span]:tw-font-sans">
      <div
        className="tw-text-xl tw-font-semibold tw-mb-4"
        dangerouslySetInnerHTML={{ __html: sanitizedQuestion }}
      />
      <div className="tw-w-full tw-overflow-x-auto">
        <table className="tw-w-full tw-border-collapse tw-bg-white">
          <thead>
            <tr>
              <th className="tw-border-2 tw-border-gray-400 tw-bg-gray-200 tw-p-4 tw-text-left tw-font-bold">Pernyataan</th>
              <th className="tw-border-2 tw-border-gray-400 tw-bg-gray-200 tw-p-4 tw-text-center tw-w-24 tw-font-bold">True</th>
              <th className="tw-border-2 tw-border-gray-400 tw-bg-gray-200 tw-p-4 tw-text-center tw-w-24 tw-font-bold">False</th>
            </tr>
          </thead>
          <tbody>
            {statements.map((statement, index) => (
              <tr key={index} className="hover:tw-bg-gray-50">
                <td className="tw-border-2 tw-border-gray-400 tw-p-4 tw-font-medium">{statement}</td>
                <td className="tw-border-2 tw-border-gray-400 tw-p-4 tw-text-center">
                  <input
                    type="radio"
                    name={`statement-${index}`}
                    value="true"
                    checked={selectedAnswers[index] === true}
                    onChange={() => onChange(index, true)}
                    className="tw-cursor-pointer tw-w-4 tw-h-4"
                  />
                </td>
                <td className="tw-border-2 tw-border-gray-400 tw-p-4 tw-text-center">
                  <input
                    type="radio"
                    name={`statement-${index}`}
                    value="false"
                    checked={selectedAnswers[index] === false}
                    onChange={() => onChange(index, false)}
                    className="tw-cursor-pointer tw-w-4 tw-h-4"
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

export default TrueFalse;