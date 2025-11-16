'use client';

import React, { RefObject, useState } from 'react';
import { Lightbulb, Zap, Star, AlertCircle, BookOpen, Target, Info, Sparkles } from 'lucide-react';
import { ButtonGradient } from '../../../button/ButtonTemplate';
import { LearningModal, ModalButton } from '../../../modal/ModalTemplate';

interface KeyConceptButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

interface InsertKeyConceptBlockParams {
  editorRef: RefObject<HTMLDivElement>;
  handleChange: () => void;
}

interface KeyConceptStyle {
  id: string;
  name: string;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  iconBgColor: string;
  textColor: string;
  iconColor: string;
  description: string;
}

const keyConceptStyles: KeyConceptStyle[] = [
  {
    id: 'classic',
    name: 'Classic',
    icon: <Lightbulb className="tw-w-5 tw-h-5" />,
    borderColor: 'tw-border-purple-600',
    bgColor: 'tw-bg-purple-50',
    iconBgColor: 'tw-bg-purple-600',
    textColor: 'tw-text-purple-900',
    iconColor: 'tw-text-white',
    description: 'Konsep utama dengan warna purple klasik'
  },
  {
    id: 'important',
    name: 'Important',
    icon: <Star className="tw-w-5 tw-h-5" />,
    borderColor: 'tw-border-blue-600',
    bgColor: 'tw-bg-blue-50',
    iconBgColor: 'tw-bg-blue-600',
    textColor: 'tw-text-blue-900',
    iconColor: 'tw-text-white',
    description: 'Konsep penting dengan warna biru'
  },
  {
    id: 'highlight',
    name: 'Highlight',
    icon: <Sparkles className="tw-w-5 tw-h-5" />,
    borderColor: 'tw-border-indigo-600',
    bgColor: 'tw-bg-indigo-50',
    iconBgColor: 'tw-bg-indigo-600',
    textColor: 'tw-text-indigo-900',
    iconColor: 'tw-text-white',
    description: 'Sorotan khusus dengan warna indigo'
  },
  {
    id: 'warning',
    name: 'Warning',
    icon: <AlertCircle className="tw-w-5 tw-h-5" />,
    borderColor: 'tw-border-violet-600',
    bgColor: 'tw-bg-violet-50',
    iconBgColor: 'tw-bg-violet-600',
    textColor: 'tw-text-violet-900',
    iconColor: 'tw-text-white',
    description: 'Peringatan atau perhatian khusus'
  },
  {
    id: 'insight',
    name: 'Insight',
    icon: <Zap className="tw-w-5 tw-h-5" />,
    borderColor: 'tw-border-cyan-600',
    bgColor: 'tw-bg-cyan-50',
    iconBgColor: 'tw-bg-cyan-600',
    textColor: 'tw-text-cyan-900',
    iconColor: 'tw-text-white',
    description: 'Wawasan atau insight penting'
  },
  {
    id: 'definition',
    name: 'Definition',
    icon: <BookOpen className="tw-w-5 tw-h-5" />,
    borderColor: 'tw-border-sky-600',
    bgColor: 'tw-bg-sky-50',
    iconBgColor: 'tw-bg-sky-600',
    textColor: 'tw-text-sky-900',
    iconColor: 'tw-text-white',
    description: 'Definisi atau istilah teknis'
  },
  {
    id: 'goal',
    name: 'Goal',
    icon: <Target className="tw-w-5 tw-h-5" />,
    borderColor: 'tw-border-blue-700',
    bgColor: 'tw-bg-blue-100',
    iconBgColor: 'tw-bg-blue-700',
    textColor: 'tw-text-blue-900',
    iconColor: 'tw-text-white',
    description: 'Tujuan atau target pembelajaran'
  },
  {
    id: 'info',
    name: 'Info',
    icon: <Info className="tw-w-5 tw-h-5" />,
    borderColor: 'tw-border-purple-500',
    bgColor: 'tw-bg-purple-100',
    iconBgColor: 'tw-bg-purple-500',
    textColor: 'tw-text-purple-900',
    iconColor: 'tw-text-white',
    description: 'Informasi tambahan'
  }
];

const KeyConceptButton: React.FC<KeyConceptButtonProps> = ({ onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  };

  return (
    <ButtonGradient
      action="create"
      customIcon={<Lightbulb className="tw-w-4 tw-h-4" />}
      onClick={handleClick}
      size="md"
      showText={false}
      tooltip="Insert Key Concept (Ctrl+Shift+K)"
      tooltipPosition="top"
      tooltipPortal={false}
      className="tw-w-8 tw-h-8 tw-relative"
    />
  );
};

const KeyConceptStyleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (style: KeyConceptStyle) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const [selectedStyle, setSelectedStyle] = useState<KeyConceptStyle>(keyConceptStyles[0]);

  const handleSelect = () => {
    onSelect(selectedStyle);
    onClose();
  };

  const modalButtons: ModalButton[] = [
    {
      action: 'cancel',
      text: 'Batal',
      onClick: onClose,
      customColors: {
        primary: '#6B7280',
        secondary: '#4B5563',
        gradient1: '#6B7280',
        gradient2: '#9CA3AF',
        text: '#FFFFFF'
      }
    },
    {
      action: 'save',
      text: 'Pilih Style',
      onClick: handleSelect,
      customColors: {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        gradient1: '#8B5CF6',
        gradient2: '#A855F7',
        text: '#FFFFFF'
      }
    }
  ];

  return (
    <LearningModal
      show={isOpen}
      onHide={onClose}
      title="Pilih Style Key Concept"
      subtitle="Pilih gaya tampilan untuk Key Concept Anda"
      icon={<Lightbulb className="tw-w-5 tw-h-5" />}
      size="lg"
      width="90vw"
      height="auto"
      scrollable={true}
      bottomButtons={modalButtons}
    >
      <div className="tw-space-y-4">
        <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-blue-50 tw-rounded-lg tw-p-4 tw-border tw-border-purple-200">
          <p className="tw-text-sm tw-text-gray-700 tw-mb-0">
            Pilih style yang sesuai dengan konteks Key Concept Anda. Setiap style memiliki warna dan ikon yang berbeda untuk membantu membedakan jenis informasi.
          </p>
        </div>

        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
          {keyConceptStyles.map((style) => (
            <div
              key={style.id}
              onClick={() => setSelectedStyle(style)}
              className={`tw-cursor-pointer tw-rounded-lg tw-border-2 tw-p-4 tw-transition-all tw-duration-200 hover:tw-shadow-lg hover:tw-scale-105 ${
                selectedStyle.id === style.id
                  ? 'tw-border-purple-600 tw-bg-purple-50 tw-shadow-md'
                  : 'tw-border-gray-200 tw-bg-white hover:tw-border-purple-300'
              }`}
            >
              <div className="tw-flex tw-flex-col tw-items-center tw-text-center tw-space-y-3">
                <div className={`${style.iconBgColor} tw-rounded-lg tw-p-3 ${style.iconColor}`}>
                  {style.icon}
                </div>
                <div>
                  <h4 className="tw-font-semibold tw-text-gray-800 tw-mb-1">{style.name}</h4>
                  <p className="tw-text-xs tw-text-gray-600">{style.description}</p>
                </div>
                {selectedStyle.id === style.id && (
                  <div className="tw-w-full tw-bg-purple-600 tw-text-white tw-text-xs tw-py-1 tw-px-2 tw-rounded tw-font-medium">
                    ✓ Terpilih
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="tw-mt-6">
          <h4 className="tw-font-semibold tw-text-gray-800 tw-mb-3">Preview:</h4>
          <div className={`tw-border-l-4 ${selectedStyle.borderColor} ${selectedStyle.bgColor} tw-rounded-lg tw-shadow-sm tw-p-4`}>
            <div className="tw-flex tw-items-center tw-mb-3">
              <div className={`${selectedStyle.iconBgColor} tw-rounded-lg tw-p-2 tw-mr-2 tw-flex tw-items-center tw-justify-center`}>
                {React.cloneElement(selectedStyle.icon as React.ReactElement, {
                  className: `tw-w-5 tw-h-5 ${selectedStyle.iconColor}`
                })}
              </div>
              <h4 className={`tw-text-base tw-font-semibold ${selectedStyle.textColor} tw-m-0`}>
                {selectedStyle.name}
              </h4>
            </div>
            <div className="tw-rounded-lg tw-p-3">
              <p className={`${selectedStyle.textColor} tw-leading-relaxed tw-mb-0`}>
                Ini adalah contoh tampilan Key Concept dengan style <strong>{selectedStyle.name}</strong>. 
                Gunakan style ini untuk membedakan berbagai jenis informasi penting dalam konten Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LearningModal>
  );
};

const insertKeyConceptBlock = ({ editorRef, handleChange }: InsertKeyConceptBlockParams): void => {
  // This function will be called after style selection
  // For now, we'll use a placeholder that will be replaced by the actual implementation
};

const insertKeyConceptWithStyle = (
  editorRef: RefObject<HTMLDivElement>,
  handleChange: () => void,
  style: KeyConceptStyle
): void => {
  if (!editorRef.current) return;

  const editor = editorRef.current;
  const selection = window.getSelection();
  
  editor.focus();
  
  // Convert React icon to SVG string
  const iconSvgMap: { [key: string]: string } = {
    classic: '<path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>',
    important: '<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>',
    highlight: '<path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"/>',
    warning: '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>',
    insight: '<path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>',
    definition: '<path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>',
    goal: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>',
    info: '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>'
  };

  const iconSvg = iconSvgMap[style.id] || iconSvgMap.classic;
  
  // Convert Tailwind classes to actual color values for inline styles
  const colorMap: { [key: string]: string } = {
    'tw-border-purple-600': '#9333EA',
    'tw-bg-purple-50': '#FAF5FF',
    'tw-bg-purple-600': '#9333EA',
    'tw-text-purple-900': '#581C87',
    'tw-border-blue-600': '#2563EB',
    'tw-bg-blue-50': '#EFF6FF',
    'tw-bg-blue-600': '#2563EB',
    'tw-text-blue-900': '#1E3A8A',
    'tw-border-indigo-600': '#4F46E5',
    'tw-bg-indigo-50': '#EEF2FF',
    'tw-bg-indigo-600': '#4F46E5',
    'tw-text-indigo-900': '#312E81',
    'tw-border-violet-600': '#7C3AED',
    'tw-bg-violet-50': '#F5F3FF',
    'tw-bg-violet-600': '#7C3AED',
    'tw-text-violet-900': '#4C1D95',
    'tw-border-cyan-600': '#0891B2',
    'tw-bg-cyan-50': '#ECFEFF',
    'tw-bg-cyan-600': '#0891B2',
    'tw-text-cyan-900': '#164E63',
    'tw-border-sky-600': '#0284C7',
    'tw-bg-sky-50': '#F0F9FF',
    'tw-bg-sky-600': '#0284C7',
    'tw-text-sky-900': '#0C4A6E',
    'tw-border-blue-700': '#1D4ED8',
    'tw-bg-blue-100': '#DBEAFE',
    'tw-bg-blue-700': '#1D4ED8',
    'tw-border-purple-500': '#A855F7',
    'tw-bg-purple-100': '#F3E8FF',
    'tw-bg-purple-500': '#A855F7'
  };

  const borderColor = colorMap[style.borderColor] || '#9333EA';
  const bgColor = colorMap[style.bgColor] || '#FAF5FF';
  const iconBgColor = colorMap[style.iconBgColor] || '#9333EA';
  const textColor = colorMap[style.textColor] || '#581C87';
  
  const keyConceptHtml = `
    <div class="cte-key-concept-block tw-my-4 tw-rounded-lg tw-shadow-sm tw-transition-all" 
         style="border-left: 4px solid ${borderColor}; background-color: ${bgColor};" 
         data-style="${style.id}">
      <div class="tw-p-4">
        <div class="tw-flex tw-items-center tw-mb-3">
          <div class="tw-rounded-lg tw-p-2 tw-mr-2 tw-flex tw-items-center tw-justify-center" 
               style="background-color: ${iconBgColor};">
            <svg class="tw-w-5 tw-h-5 tw-text-white" fill="currentColor" viewBox="0 0 20 20">
              ${iconSvg}
            </svg>
          </div>
          <h4 class="tw-text-base tw-font-semibold tw-m-0" style="color: ${textColor};">
            ${style.name}
          </h4>
        </div>
        
        <div class="tw-rounded-lg tw-p-3">
          <div class="tw-leading-relaxed cte-key-concept-content" 
               contenteditable="true" 
               style="min-height: 2.5rem; max-height: none; height: auto; outline: none; overflow: visible; background: transparent; color: ${textColor};">
            Enter your key concept here
          </div>
        </div>
      </div>
    </div>
    <p><br></p>
  `;

  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = document.createElement('div');
    container.innerHTML = keyConceptHtml;
    
    range.deleteContents();
    
    const fragment = document.createDocumentFragment();
    while (container.firstChild) {
      fragment.appendChild(container.firstChild);
    }
    range.insertNode(fragment);
    
    const lastInserted = editor.querySelector('.cte-key-concept-content:last-of-type') as HTMLElement;
    if (lastInserted) {
      range.selectNodeContents(lastInserted);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  } else {
    editor.innerHTML += keyConceptHtml;
    
    setTimeout(() => {
      const lastKeyConcept = editor.querySelector('.cte-key-concept-content:last-of-type') as HTMLElement;
      if (lastKeyConcept) {
        const range = document.createRange();
        range.selectNodeContents(lastKeyConcept);
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, 10);
  }
  
  handleChange();
};

const getKeyConceptStyles = (): string => `
  .cte-key-concept-block {
    position: relative;
    margin: 1rem 0;
    transition: all 0.2s ease;
    z-index: 1
  }
  
  .cte-key-concept-block:hover {
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
    transform: translateY(-1px);
  }
  
  .cte-key-concept-content {
    font-size: 0.9375rem;
    line-height: 1.6;
    min-height: 2.5rem !important;
    max-height: none !important;
    height: auto !important;
    overflow: visible !important;
    display: block;
    background: transparent !important;
  }
  
  .cte-key-concept-content:focus {
    background-color: rgba(168, 85, 247, 0.1) !important;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    outline: 2px solid rgba(168, 85, 247, 0.3);
    outline-offset: 2px;
  }
  
  .cte-key-concept-content:empty:before {
    content: "Enter your key concept here";
    color: rgba(107, 114, 128, 0.6);
    font-style: italic;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .cte-key-concept-block {
      margin: 0.75rem 0;
    }
    
    .cte-key-concept-block .tw-p-4 {
      padding: 0.875rem;
    }
    
    .cte-key-concept-block h4 {
      font-size: 0.9375rem;
    }
    
    .cte-key-concept-content {
      font-size: 0.875rem;
      min-height: 2rem !important;
    }
  }
  
  @media (max-width: 480px) {
    .cte-key-concept-block .tw-flex {
      flex-wrap: wrap;
    }
    
    .cte-key-concept-block .tw-mr-2 {
      margin-right: 0.5rem;
    }
    
    .cte-key-concept-block .tw-p-4 {
      padding: 0.75rem;
    }
    
    .cte-key-concept-block h4 {
      font-size: 0.875rem;
    }
    
    .cte-key-concept-content {
      font-size: 0.8125rem;
      min-height: 1.75rem !important;
    }
  }
  
  @media (max-width: 360px) {
    .cte-key-concept-block[style*="border-left"] {
      border-left-width: 3px !important;
    }
    
    .cte-key-concept-block .tw-rounded-lg {
      border-radius: 0.5rem;
    }
  }
`;

interface KeyConceptType {
  Button: React.FC<KeyConceptButtonProps>;
  StyleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (style: KeyConceptStyle) => void;
  }>;
  insertKeyConceptBlock: (params: InsertKeyConceptBlockParams) => void;
  insertKeyConceptWithStyle: (
    editorRef: RefObject<HTMLDivElement>,
    handleChange: () => void,
    style: KeyConceptStyle
  ) => void;
  getKeyConceptStyles: () => string;
  styles: KeyConceptStyle[];
}

const KeyConcept: KeyConceptType = {
  Button: KeyConceptButton,
  StyleModal: KeyConceptStyleModal,
  insertKeyConceptBlock,
  insertKeyConceptWithStyle,
  getKeyConceptStyles,
  styles: keyConceptStyles
};

export default KeyConcept;
export { 
  KeyConceptButton, 
  KeyConceptStyleModal,
  insertKeyConceptBlock, 
  insertKeyConceptWithStyle,
  getKeyConceptStyles,
  keyConceptStyles
};
export type { KeyConceptStyle };