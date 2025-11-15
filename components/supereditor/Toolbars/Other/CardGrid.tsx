'use client';

import React, { RefObject, useState } from 'react';
import { LayoutGrid, Sparkles } from 'lucide-react';
import { ButtonGradient } from '../../../button/ButtonTemplate';
import { LearningModal, ModalButton } from '../../../modal/ModalTemplate';

interface CardGridButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

interface InsertCardGridParams {
  editorRef: RefObject<HTMLDivElement>;
  handleChange: () => void;
}

interface CardGridStyle {
  id: string;
  name: string;
  borderColor: string;
  bgColor: string;
  headerBg: string;
  textColor: string;
  headerTextColor: string;
  description: string;
  emoji?: string;
}

const cardGridStyles: CardGridStyle[] = [
  {
    id: 'blue',
    name: 'Biru Profesional',
    borderColor: '#2196f3',
    bgColor: '#ffffff',
    headerBg: '#2196f3',
    textColor: '#212121',
    headerTextColor: '#ffffff',
    description: 'Style profesional dengan aksen biru',
    emoji: '💼'
  },
  {
    id: 'green',
    name: 'Hijau Segar',
    borderColor: '#4caf50',
    bgColor: '#ffffff',
    headerBg: '#4caf50',
    textColor: '#212121',
    headerTextColor: '#ffffff',
    description: 'Style segar dengan aksen hijau',
    emoji: '🌿'
  },
  {
    id: 'purple',
    name: 'Ungu Modern',
    borderColor: '#9c27b0',
    bgColor: '#ffffff',
    headerBg: '#9c27b0',
    textColor: '#212121',
    headerTextColor: '#ffffff',
    description: 'Style modern dengan aksen ungu',
    emoji: '🎨'
  },
  {
    id: 'orange',
    name: 'Orange Energik',
    borderColor: '#ff9800',
    bgColor: '#ffffff',
    headerBg: '#ff9800',
    textColor: '#212121',
    headerTextColor: '#ffffff',
    description: 'Style energik dengan aksen orange',
    emoji: '⚡'
  },
  {
    id: 'teal',
    name: 'Teal Tenang',
    borderColor: '#009688',
    bgColor: '#ffffff',
    headerBg: '#009688',
    textColor: '#212121',
    headerTextColor: '#ffffff',
    description: 'Style tenang dengan aksen teal',
    emoji: '🌊'
  },
  {
    id: 'pink',
    name: 'Pink Ceria',
    borderColor: '#e91e63',
    bgColor: '#ffffff',
    headerBg: '#e91e63',
    textColor: '#212121',
    headerTextColor: '#ffffff',
    description: 'Style ceria dengan aksen pink',
    emoji: '🌸'
  },
  {
    id: 'indigo',
    name: 'Indigo Elegan',
    borderColor: '#3f51b5',
    bgColor: '#ffffff',
    headerBg: '#3f51b5',
    textColor: '#212121',
    headerTextColor: '#ffffff',
    description: 'Style elegan dengan aksen indigo',
    emoji: '👔'
  },
  {
    id: 'amber',
    name: 'Amber Hangat',
    borderColor: '#ffc107',
    bgColor: '#ffffff',
    headerBg: '#ffc107',
    textColor: '#212121',
    headerTextColor: '#212121',
    description: 'Style hangat dengan aksen amber',
    emoji: '☀️'
  }
];

const CardGridButton: React.FC<CardGridButtonProps> = ({ onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  };

  return (
    <ButtonGradient
      action="create"
      customIcon={<LayoutGrid className="tw-w-4 tw-h-4" />}
      onClick={handleClick}
      size="md"
      showText={false}
      tooltip="Insert Card Grid (Ctrl+Shift+G)"
      tooltipPosition="top"
      tooltipPortal={false}
      className="tw-w-8 tw-h-8 tw-relative"
    />
  );
};

const CardGridModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (style: CardGridStyle, cardCount: number, columns: number) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const [selectedStyle, setSelectedStyle] = useState<CardGridStyle>(cardGridStyles[0]);
  const [cardCount, setCardCount] = useState(4);
  const [columns, setColumns] = useState(2);

  const handleSelect = () => {
    onSelect(selectedStyle, cardCount, columns);
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
      text: 'Buat Grid',
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
      title="Buat Card Grid"
      subtitle="Buat grid card yang menarik untuk fitur atau informasi"
      icon={<LayoutGrid className="tw-w-5 tw-h-5" />}
      size="lg"
      width="90vw"
      height="auto"
      scrollable={true}
      bottomButtons={modalButtons}
    >
      <div className="tw-space-y-4">
        <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-blue-50 tw-rounded-lg tw-p-4 tw-border tw-border-purple-200">
          <p className="tw-text-sm tw-text-gray-700 tw-mb-0">
            Card Grid sempurna untuk menampilkan fitur, langkah-langkah, atau informasi dalam bentuk card yang terorganisir. 
            Pilih jumlah kolom dan style yang sesuai dengan kebutuhan Anda.
          </p>
        </div>

        {/* Configuration */}
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
          <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-gray-200">
            <label className="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">
              Jumlah Card:
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={cardCount}
              onChange={(e) => setCardCount(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent"
            />
            <p className="tw-text-xs tw-text-gray-500 tw-mt-1">Maksimal 12 card</p>
          </div>

          <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-gray-200">
            <label className="tw-block tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-2">
              Jumlah Kolom:
            </label>
            <select
              value={columns}
              onChange={(e) => setColumns(parseInt(e.target.value))}
              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent"
            >
              <option value="1">1 Kolom</option>
              <option value="2">2 Kolom</option>
              <option value="3">3 Kolom</option>
              <option value="4">4 Kolom</option>
            </select>
            <p className="tw-text-xs tw-text-gray-500 tw-mt-1">Layout grid responsif</p>
          </div>
        </div>

        {/* Style Selection */}
        <div>
          <h4 className="tw-font-semibold tw-text-gray-800 tw-mb-3">Pilih Style:</h4>
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-3">
            {cardGridStyles.map((style) => (
              <div
                key={style.id}
                onClick={() => setSelectedStyle(style)}
                className={`tw-cursor-pointer tw-rounded-lg tw-border-2 tw-p-4 tw-transition-all tw-duration-200 hover:tw-shadow-lg hover:tw-scale-105 ${
                  selectedStyle.id === style.id
                    ? 'tw-border-purple-600 tw-bg-purple-50 tw-shadow-md'
                    : 'tw-border-gray-200 tw-bg-white hover:tw-border-purple-300'
                }`}
              >
                <div className="tw-flex tw-flex-col tw-items-center tw-text-center tw-space-y-2">
                  <div className="tw-text-3xl">{style.emoji}</div>
                  <div>
                    <h5 className="tw-font-semibold tw-text-gray-800 tw-mb-1 tw-text-sm">{style.name}</h5>
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
        </div>

        {/* Preview */}
        <div className="tw-mt-6">
          <h4 className="tw-font-semibold tw-text-gray-800 tw-mb-3">Preview:</h4>
          <div 
            className="tw-grid tw-gap-4"
            style={{
              gridTemplateColumns: `repeat(${Math.min(columns, cardCount)}, 1fr)`
            }}
          >
            {Array.from({ length: Math.min(cardCount, 4) }, (_, i) => (
              <div
                key={i}
                style={{
                  background: selectedStyle.bgColor,
                  border: `2px solid ${selectedStyle.borderColor}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div
                  style={{
                    background: selectedStyle.headerBg,
                    color: selectedStyle.headerTextColor,
                    padding: '12px',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  Card {i + 1}
                </div>
                <div
                  style={{
                    padding: '16px',
                    color: selectedStyle.textColor,
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}
                >
                  Deskripsi atau konten card di sini. Anda bisa menambahkan teks, list, atau elemen lainnya.
                </div>
              </div>
            ))}
          </div>
          {cardCount > 4 && (
            <p className="tw-text-sm tw-text-gray-500 tw-text-center tw-italic tw-mt-3">
              ... dan {cardCount - 4} card lainnya
            </p>
          )}
        </div>
      </div>
    </LearningModal>
  );
};

const insertCardGridWithStyle = (
  editorRef: RefObject<HTMLDivElement>,
  handleChange: () => void,
  style: CardGridStyle,
  cardCount: number,
  columns: number
): void => {
  if (!editorRef.current) return;

  const editor = editorRef.current;
  const selection = window.getSelection();
  
  editor.focus();
  
  // Generate cards HTML
  const cards = Array.from({ length: cardCount }, (_, i) => `
    <div class="cte-card-grid-item" style="background: ${style.bgColor}; border: 2px solid ${style.borderColor}; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
      <div class="cte-card-header" style="background: ${style.headerBg}; color: ${style.headerTextColor}; padding: 12px; font-weight: bold; font-size: 1rem;" contenteditable="true">
        Card ${i + 1}
      </div>
      <div class="cte-card-content" style="padding: 16px; color: ${style.textColor}; font-size: 0.875rem; line-height: 1.5;" contenteditable="true">
        Deskripsi atau konten card di sini. Anda bisa menambahkan teks, list, atau elemen lainnya.
      </div>
    </div>
  `).join('\n');
  
  const cardGridHtml = `
    <div class="cte-card-grid-block tw-my-4" data-style="${style.id}" data-columns="${columns}" style="display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 16px;">
      ${cards}
    </div>
    <p><br></p>
  `;

  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = document.createElement('div');
    container.innerHTML = cardGridHtml;
    
    range.deleteContents();
    
    const fragment = document.createDocumentFragment();
    while (container.firstChild) {
      fragment.appendChild(container.firstChild);
    }
    range.insertNode(fragment);
    
    const lastInserted = editor.querySelector('.cte-card-grid-block:last-of-type .cte-card-header') as HTMLElement;
    if (lastInserted) {
      range.selectNodeContents(lastInserted);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  } else {
    editor.innerHTML += cardGridHtml;
    
    setTimeout(() => {
      const lastGrid = editor.querySelector('.cte-card-grid-block:last-of-type .cte-card-header') as HTMLElement;
      if (lastGrid) {
        const range = document.createRange();
        range.selectNodeContents(lastGrid);
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, 10);
  }
  
  handleChange();
};

const getCardGridStyles = (): string => `
  .cte-card-grid-block {
    position: relative;
    margin: 1.5rem 0;
  }
  
  .cte-card-grid-item {
    display: flex;
    flex-direction: column;
  }
  
  .cte-card-grid-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
  }
  
  .cte-card-header:focus,
  .cte-card-content:focus {
    outline: 2px solid rgba(139, 92, 246, 0.5);
    outline-offset: 2px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 1024px) {
    .cte-card-grid-block[data-columns="4"] {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
  
  @media (max-width: 768px) {
    .cte-card-grid-block[data-columns="3"],
    .cte-card-grid-block[data-columns="4"] {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    
    .cte-card-header {
      font-size: 0.9rem !important;
      padding: 10px !important;
    }
    
    .cte-card-content {
      font-size: 0.8125rem !important;
      padding: 12px !important;
    }
  }
  
  @media (max-width: 480px) {
    .cte-card-grid-block {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }
    
    .cte-card-header {
      font-size: 0.875rem !important;
      padding: 8px !important;
    }
    
    .cte-card-content {
      font-size: 0.8rem !important;
      padding: 10px !important;
    }
  }
`;

interface CardGridType {
  Button: React.FC<CardGridButtonProps>;
  Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (style: CardGridStyle, cardCount: number, columns: number) => void;
  }>;
  insertCardGridWithStyle: (
    editorRef: RefObject<HTMLDivElement>,
    handleChange: () => void,
    style: CardGridStyle,
    cardCount: number,
    columns: number
  ) => void;
  getCardGridStyles: () => string;
  styles: CardGridStyle[];
}

const CardGrid: CardGridType = {
  Button: CardGridButton,
  Modal: CardGridModal,
  insertCardGridWithStyle,
  getCardGridStyles,
  styles: cardGridStyles
};

export default CardGrid;
export { 
  CardGridButton, 
  CardGridModal,
  insertCardGridWithStyle,
  getCardGridStyles,
  cardGridStyles
};
export type { CardGridStyle };