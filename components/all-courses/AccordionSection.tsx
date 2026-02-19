// pages/all-courses/AccordionSection.tsx
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  gradient: string;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ 
  title, 
  icon, 
  count, 
  isOpen, 
  onToggle, 
  children, 
  gradient 
}) => {
  return (
    <div className="tw-mb-6">
      <button
        onClick={onToggle}
        className={`tw-w-full tw-p-6 tw-rounded-2xl tw-transition-all tw-duration-300 tw-shadow-lg hover:tw-shadow-xl ${gradient}`}
      >
        <div className="tw-flex tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-gap-4">
            <div className="tw-w-12 tw-h-12 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-flex tw-items-center tw-justify-center">
              {icon}
            </div>
            <div className="tw-text-left">
              <h2 className="tw-text-2xl tw-font-bold tw-text-white">{title}</h2>
              <p className="tw-text-white/80 tw-text-sm">{count} item</p>
            </div>
          </div>
          <div className="tw-text-white">
            {isOpen ? <ChevronUp className="tw-w-6 tw-h-6" /> : <ChevronDown className="tw-w-6 tw-h-6" />}
          </div>
        </div>
      </button>
      
      {isOpen && (
        <div className="tw-mt-4 tw-animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionSection;
