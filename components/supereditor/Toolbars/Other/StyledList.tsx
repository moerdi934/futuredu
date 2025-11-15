'use client';

import React, { RefObject, useState, useEffect } from 'react';
import { List, Palette, Plus, Trash2, Edit2, Check, X, MoveUp, MoveDown } from 'lucide-react';
import { ButtonGradient } from '../../../button/ButtonTemplate';
import { LearningModal, ModalButton } from '../../../modal/ModalTemplate';

interface StyledListButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

interface InsertStyledListParams {
  editorRef: RefObject<HTMLDivElement>;
  handleChange: () => void;
}

interface StyledListStyle {
  id: string;
  name: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  description: string;
  emoji?: string;
}

interface ListItem {
  id: string;
  styleId: string;
  text: string;
}

const styledListStyles: StyledListStyle[] = [
  {
    id: 'blue',
    name: 'Biru (Fakta)',
    borderColor: '#2196f3',
    bgColor: '#e3f2fd',
    textColor: '#0d47a1',
    description: 'Untuk fakta atau informasi objektif',
    emoji: '📘'
  },
  {
    id: 'green',
    name: 'Hijau (Kesimpulan)',
    borderColor: '#4caf50',
    bgColor: '#c8e6c9',
    textColor: '#1b5e20',
    description: 'Untuk kesimpulan atau hasil',
    emoji: '✅'
  },
  {
    id: 'yellow',
    name: 'Kuning (Peringatan)',
    borderColor: '#ffc107',
    bgColor: '#fff9c4',
    textColor: '#f57f17',
    description: 'Untuk peringatan atau catatan penting',
    emoji: '⚠️'
  },
  {
    id: 'orange',
    name: 'Orange (Contoh)',
    borderColor: '#ff9800',
    bgColor: '#ffe0b2',
    textColor: '#e65100',
    description: 'Untuk contoh atau ilustrasi',
    emoji: '💡'
  },
  {
    id: 'red',
    name: 'Merah (Penting)',
    borderColor: '#f44336',
    bgColor: '#ffcdd2',
    textColor: '#b71c1c',
    description: 'Untuk informasi sangat penting',
    emoji: '❗'
  },
  {
    id: 'purple',
    name: 'Ungu (Konsep)',
    borderColor: '#9c27b0',
    bgColor: '#f3e5f5',
    textColor: '#4a148c',
    description: 'Untuk konsep atau teori',
    emoji: '🔮'
  },
  {
    id: 'teal',
    name: 'Teal (Langkah)',
    borderColor: '#009688',
    bgColor: '#b2dfdb',
    textColor: '#004d40',
    description: 'Untuk langkah-langkah atau prosedur',
    emoji: '📝'
  },
  {
    id: 'pink',
    name: 'Pink (Highlight)',
    borderColor: '#e91e63',
    bgColor: '#f8bbd0',
    textColor: '#880e4f',
    description: 'Untuk highlight atau sorotan khusus',
    emoji: '✨'
  }
];

const StyledListButton: React.FC<StyledListButtonProps> = ({ onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  };

  return (
    <ButtonGradient
      action="create"
      customIcon={<List className="tw-w-4 tw-h-4" />}
      onClick={handleClick}
      size="md"
      showText={false}
      tooltip="Insert Styled List (Ctrl+Alt+L)"
      tooltipPosition="top"
      tooltipPortal={false}
      className="tw-w-8 tw-h-8 tw-relative"
    />
  );
};

const StyledListModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (items: ListItem[]) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const [items, setItems] = useState<ListItem[]>([
    { id: '1', styleId: 'blue', text: 'Item 1' },
    { id: '2', styleId: 'blue', text: 'Item 2' },
    { id: '3', styleId: 'blue', text: 'Item 3' }
  ]);

  const [selectedStyleForNew, setSelectedStyleForNew] = useState<string>('blue');

  const addItem = () => {
    const newItem: ListItem = {
      id: Date.now().toString(),
      styleId: selectedStyleForNew,
      text: `Item ${items.length + 1}`
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItemStyle = (id: string, styleId: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, styleId } : item
    ));
  };

  const moveItemUp = (index: number) => {
    if (index > 0) {
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      setItems(newItems);
    }
  };

  const moveItemDown = (index: number) => {
    if (index < items.length - 1) {
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      setItems(newItems);
    }
  };

  const handleSelect = () => {
    onSelect(items);
    onClose();
  };

  const getStyleById = (id: string) => styledListStyles.find(s => s.id === id) || styledListStyles[0];

  // Quick templates
  const applyTemplate = (template: 'fakta-kesimpulan' | 'langkah-peringatan' | 'konsep-contoh') => {
    let newItems: ListItem[] = [];
    
    switch (template) {
      case 'fakta-kesimpulan':
        newItems = [
          { id: '1', styleId: 'blue', text: 'Fakta 1' },
          { id: '2', styleId: 'blue', text: 'Fakta 2' },
          { id: '3', styleId: 'blue', text: 'Fakta 3' },
          { id: '4', styleId: 'blue', text: 'Fakta 4' },
          { id: '5', styleId: 'green', text: 'Kesimpulan' }
        ];
        break;
      case 'langkah-peringatan':
        newItems = [
          { id: '1', styleId: 'teal', text: 'Langkah 1' },
          { id: '2', styleId: 'yellow', text: 'Peringatan 1' },
          { id: '3', styleId: 'teal', text: 'Langkah 2' },
          { id: '4', styleId: 'yellow', text: 'Peringatan 2' },
          { id: '5', styleId: 'teal', text: 'Langkah 3' }
        ];
        break;
      case 'konsep-contoh':
        newItems = [
          { id: '1', styleId: 'purple', text: 'Konsep 1' },
          { id: '2', styleId: 'orange', text: 'Contoh 1' },
          { id: '3', styleId: 'purple', text: 'Konsep 2' },
          { id: '4', styleId: 'orange', text: 'Contoh 2' }
        ];
        break;
    }
    
    setItems(newItems);
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
      text: 'Buat List',
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
      title="Buat Styled List"
      subtitle="Buat daftar dengan kombinasi style yang menarik"
      icon={<List className="tw-w-5 tw-h-5" />}
      size="lg"
      width="95vw"
      height="auto"
      scrollable={true}
      bottomButtons={modalButtons}
    >
      <div className="tw-space-y-4">
        <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-blue-50 tw-rounded-lg tw-p-4 tw-border tw-border-purple-200">
          <p className="tw-text-sm tw-text-gray-700 tw-mb-0">
            Styled List memungkinkan Anda membuat daftar dengan kombinasi warna berbeda untuk setiap item. 
            Sempurna untuk membedakan fakta, kesimpulan, peringatan, dan lainnya dalam satu list.
          </p>
        </div>

        {/* Quick Templates */}
        <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-gray-200">
          <h4 className="tw-font-semibold tw-text-gray-800 tw-mb-3 tw-text-sm">Template Cepat:</h4>
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-2">
            <button
              onClick={() => applyTemplate('fakta-kesimpulan')}
              className="tw-px-3 tw-py-2 tw-bg-blue-50 hover:tw-bg-blue-100 tw-border tw-border-blue-200 tw-rounded-lg tw-text-sm tw-transition-all"
            >
              📘 4 Fakta + 1 Kesimpulan
            </button>
            <button
              onClick={() => applyTemplate('langkah-peringatan')}
              className="tw-px-3 tw-py-2 tw-bg-teal-50 hover:tw-bg-teal-100 tw-border tw-border-teal-200 tw-rounded-lg tw-text-sm tw-transition-all"
            >
              📝 Langkah + Peringatan
            </button>
            <button
              onClick={() => applyTemplate('konsep-contoh')}
              className="tw-px-3 tw-py-2 tw-bg-purple-50 hover:tw-bg-purple-100 tw-border tw-border-purple-200 tw-rounded-lg tw-text-sm tw-transition-all"
            >
              🔮 Konsep + Contoh
            </button>
          </div>
        </div>

        {/* Items Management */}
        <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border tw-border-gray-200">
          <div className="tw-flex tw-items-center tw-justify-between tw-mb-3">
            <h4 className="tw-font-semibold tw-text-gray-800 tw-text-sm tw-mb-0">Atur Item ({items.length}):</h4>
            <div className="tw-flex tw-items-center tw-gap-2">
              <select
                value={selectedStyleForNew}
                onChange={(e) => setSelectedStyleForNew(e.target.value)}
                className="tw-text-xs tw-px-2 tw-py-1 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-ring-2 focus:tw-ring-purple-500"
              >
                {styledListStyles.map(style => (
                  <option key={style.id} value={style.id}>
                    {style.emoji} {style.name}
                  </option>
                ))}
              </select>
              <button
                onClick={addItem}
                className="tw-px-3 tw-py-1 tw-bg-purple-600 hover:tw-bg-purple-700 tw-text-white tw-rounded-lg tw-text-xs tw-font-medium tw-transition-all tw-flex tw-items-center tw-gap-1"
              >
                <Plus className="tw-w-3 tw-h-3" />
                Tambah
              </button>
            </div>
          </div>

          <div className="tw-space-y-2 tw-max-h-96 tw-overflow-y-auto">
            {items.map((item, index) => {
              const style = getStyleById(item.styleId);
              return (
                <div
                  key={item.id}
                  className="tw-flex tw-items-center tw-gap-2 tw-p-2 tw-bg-gray-50 tw-rounded-lg tw-border tw-border-gray-200"
                >
                  <div className="tw-flex tw-flex-col tw-gap-1">
                    <button
                      onClick={() => moveItemUp(index)}
                      disabled={index === 0}
                      className="tw-p-1 tw-text-gray-600 hover:tw-text-purple-600 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed"
                      title="Move Up"
                    >
                      <MoveUp className="tw-w-3 tw-h-3" />
                    </button>
                    <button
                      onClick={() => moveItemDown(index)}
                      disabled={index === items.length - 1}
                      className="tw-p-1 tw-text-gray-600 hover:tw-text-purple-600 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed"
                      title="Move Down"
                    >
                      <MoveDown className="tw-w-3 tw-h-3" />
                    </button>
                  </div>

                  <div className="tw-flex-1 tw-flex tw-items-center tw-gap-2">
                    <span className="tw-text-xs tw-font-bold tw-text-gray-500 tw-w-8">#{index + 1}</span>
                    
                    <select
                      value={item.styleId}
                      onChange={(e) => updateItemStyle(item.id, e.target.value)}
                      className="tw-text-xs tw-px-2 tw-py-1 tw-border tw-border-gray-300 tw-rounded tw-flex-1 tw-max-w-[200px]"
                      style={{
                        background: style.bgColor,
                        color: style.textColor,
                        borderLeft: `4px solid ${style.borderColor}`
                      }}
                    >
                      {styledListStyles.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.emoji} {s.name}
                        </option>
                      ))}
                    </select>

                    <div 
                      className="tw-flex-1 tw-px-3 tw-py-2 tw-rounded tw-text-xs"
                      style={{
                        background: style.bgColor,
                        color: style.textColor,
                        borderLeft: `4px solid ${style.borderColor}`
                      }}
                    >
                      {item.text}
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="tw-p-1 tw-text-red-600 hover:tw-text-red-700 disabled:tw-opacity-30 disabled:tw-cursor-not-allowed"
                    title="Remove"
                  >
                    <Trash2 className="tw-w-4 tw-h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div className="tw-mt-6">
          <h4 className="tw-font-semibold tw-text-gray-800 tw-mb-3">Preview:</h4>
          <div className="tw-bg-white tw-rounded-lg tw-p-4 tw-border-2 tw-border-purple-300 tw-space-y-2">
            {items.map((item, index) => {
              const style = getStyleById(item.styleId);
              return (
                <p
                  key={item.id}
                  style={{
                    background: style.bgColor,
                    color: style.textColor,
                    padding: '12px',
                    margin: '8px 0',
                    borderLeft: `4px solid ${style.borderColor}`,
                    borderRadius: '4px'
                  }}
                >
                  {style.emoji} {item.text}: Isi konten di sini
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </LearningModal>
  );
};

// Floater Component for updating individual items
const StyledListItemFloater: React.FC<{
  itemElement: HTMLElement;
  currentStyleId: string;
  onStyleChange: (newStyleId: string) => void;
  onClose: () => void;
}> = ({ itemElement, currentStyleId, onStyleChange, onClose }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      const rect = itemElement.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY - 50,
        left: rect.right + window.scrollX + 10
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [itemElement]);

  const handleStyleChange = (styleId: string) => {
    onStyleChange(styleId);
    setIsOpen(false);
    onClose();
  };

  return (
    <div
      className="cte-styled-list-floater"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 10000
      }}
    >
      <div className="tw-flex tw-items-center tw-gap-1 tw-bg-white tw-border-2 tw-border-purple-400 tw-rounded-lg tw-shadow-xl tw-p-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="tw-p-2 tw-bg-purple-600 hover:tw-bg-purple-700 tw-text-white tw-rounded-md tw-transition-all"
          title="Change Style"
        >
          <Palette className="tw-w-4 tw-h-4" />
        </button>
        
        <button
          onClick={onClose}
          className="tw-p-2 tw-bg-gray-600 hover:tw-bg-gray-700 tw-text-white tw-rounded-md tw-transition-all"
          title="Close"
        >
          <X className="tw-w-4 tw-h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="tw-absolute tw-top-full tw-left-0 tw-mt-2 tw-bg-white tw-border-2 tw-border-purple-300 tw-rounded-lg tw-shadow-xl tw-p-2 tw-min-w-[200px]">
          <div className="tw-text-xs tw-font-semibold tw-text-purple-700 tw-mb-2 tw-px-2">Pilih Style:</div>
          <div className="tw-space-y-1">
            {styledListStyles.map(style => (
              <button
                key={style.id}
                onClick={() => handleStyleChange(style.id)}
                className={`tw-w-full tw-px-3 tw-py-2 tw-text-left tw-rounded-lg tw-transition-all tw-text-xs tw-flex tw-items-center tw-gap-2 ${
                  currentStyleId === style.id
                    ? 'tw-bg-purple-100 tw-border-2 tw-border-purple-500'
                    : 'tw-bg-gray-50 hover:tw-bg-purple-50 tw-border tw-border-gray-200'
                }`}
                style={{
                  borderLeft: `4px solid ${style.borderColor}`
                }}
              >
                <span className="tw-text-base">{style.emoji}</span>
                <span className="tw-flex-1">{style.name}</span>
                {currentStyleId === style.id && (
                  <Check className="tw-w-4 tw-h-4 tw-text-purple-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const insertStyledListWithStyle = (
  editorRef: RefObject<HTMLDivElement>,
  handleChange: () => void,
  items: ListItem[]
): void => {
  if (!editorRef.current) return;

  const editor = editorRef.current;
  const selection = window.getSelection();
  
  editor.focus();
  
  const listId = `styled-list-${Date.now()}`;
  
  // Generate items HTML
  const itemsHtml = items.map((item, index) => {
    const style = styledListStyles.find(s => s.id === item.styleId) || styledListStyles[0];
    return `<p 
      class="cte-styled-list-item" 
      data-list-id="${listId}"
      data-item-id="${item.id}"
      data-style-id="${item.styleId}"
      style="background: ${style.bgColor}; color: ${style.textColor}; padding: 12px; margin: 8px 0; border-left: 4px solid ${style.borderColor}; border-radius: 4px; position: relative; cursor: text;" 
      contenteditable="true">${style.emoji} Item ${index + 1}: Isi konten di sini</p>`;
  }).join('\n');
  
  const styledListHtml = `
    <div class="cte-styled-list-block" data-list-id="${listId}" style="border: 2px solid #c084fc; border-radius: 8px; padding: 12px; margin: 16px 0; background: #faf5ff;">
      ${itemsHtml}
    </div>
    <p><br></p>
  `;

  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const container = document.createElement('div');
    container.innerHTML = styledListHtml;
    
    range.deleteContents();
    
    const fragment = document.createDocumentFragment();
    while (container.firstChild) {
      fragment.appendChild(container.firstChild);
    }
    range.insertNode(fragment);
    
    const lastInserted = editor.querySelector(`[data-list-id="${listId}"] .cte-styled-list-item:first-child`) as HTMLElement;
    if (lastInserted) {
      range.selectNodeContents(lastInserted);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  } else {
    editor.innerHTML += styledListHtml;
    
    setTimeout(() => {
      const lastList = editor.querySelector(`[data-list-id="${listId}"] .cte-styled-list-item:first-child`) as HTMLElement;
      if (lastList) {
        const range = document.createRange();
        range.selectNodeContents(lastList);
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, 10);
  }
  
  // Setup floater handlers after insertion
  setTimeout(() => {
    setupStyledListHandlers(editorRef);
  }, 100);
  
  handleChange();
};

// Setup handlers for styled list items
const setupStyledListHandlers = (editorRef: RefObject<HTMLDivElement>) => {
  if (!editorRef.current) return;

  const items = editorRef.current.querySelectorAll('.cte-styled-list-item');
  
  items.forEach(item => {
    const htmlItem = item as HTMLElement;
    
    // Remove existing listeners
    const clone = htmlItem.cloneNode(true) as HTMLElement;
    htmlItem.parentNode?.replaceChild(clone, htmlItem);
    
    // Add click handler to show floater
    clone.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Remove any existing floaters
      const existingFloaters = document.querySelectorAll('.cte-styled-list-floater');
      existingFloaters.forEach(f => f.remove());
      
      const currentStyleId = clone.getAttribute('data-style-id') || 'blue';
      
      // Create floater container
      const floaterContainer = document.createElement('div');
      document.body.appendChild(floaterContainer);
      
      // Render floater using React
      if (typeof window !== 'undefined' && (window as any).ReactDOM && (window as any).React) {
        const React = (window as any).React;
        const ReactDOM = (window as any).ReactDOM;
        
        const handleStyleChange = (newStyleId: string) => {
          const newStyle = styledListStyles.find(s => s.id === newStyleId) || styledListStyles[0];
          clone.setAttribute('data-style-id', newStyleId);
          clone.style.background = newStyle.bgColor;
          clone.style.color = newStyle.textColor;
          clone.style.borderLeft = `4px solid ${newStyle.borderColor}`;
          
          // Update emoji at the start of content
          const content = clone.textContent || '';
          const withoutEmoji = content.replace(/^[^\s]+\s/, '');
          clone.textContent = `${newStyle.emoji} ${withoutEmoji}`;
          
          // Trigger change
          if (editorRef.current) {
            const event = new Event('input', { bubbles: true });
            editorRef.current.dispatchEvent(event);
          }
          
          floaterContainer.remove();
        };
        
        const handleClose = () => {
          floaterContainer.remove();
        };
        
        const FloaterComponent = React.createElement(StyledListItemFloater, {
          itemElement: clone,
          currentStyleId,
          onStyleChange: handleStyleChange,
          onClose: handleClose
        });
        
        if (ReactDOM.createRoot) {
          const root = ReactDOM.createRoot(floaterContainer);
          root.render(FloaterComponent);
        } else {
          ReactDOM.render(FloaterComponent, floaterContainer);
        }
      }
    });
  });
  
  // Click outside to close floaters
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.cte-styled-list-item') && !target.closest('.cte-styled-list-floater')) {
      const floaters = document.querySelectorAll('.cte-styled-list-floater');
      floaters.forEach(f => f.remove());
    }
  };
  
  document.addEventListener('click', handleClickOutside);
};

const getStyledListStyles = (): string => `
  .cte-styled-list-block {
    position: relative;
    margin: 1rem 0;
  }
  
  .cte-styled-list-item {
    transition: all 0.2s ease;
    cursor: text;
    position: relative;
  }
  
  .cte-styled-list-item:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .cte-styled-list-item:focus {
    outline: 2px solid rgba(139, 92, 246, 0.5);
    outline-offset: 2px;
  }
  
  .cte-styled-list-floater {
    animation: floaterFadeIn 0.2s ease-out;
  }
  
  @keyframes floaterFadeIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .cte-styled-list-item {
      padding: 10px !important;
      font-size: 0.9rem;
    }
    
    .cte-styled-list-floater {
      position: fixed !important;
      top: auto !important;
      bottom: 20px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
    }
  }
  
  @media (max-width: 480px) {
    .cte-styled-list-item {
      padding: 8px !important;
      font-size: 0.85rem;
      border-left-width: 3px !important;
    }
  }
`;

interface StyledListType {
  Button: React.FC<StyledListButtonProps>;
  Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (items: ListItem[]) => void;
  }>;
  ItemFloater: React.FC<{
    itemElement: HTMLElement;
    currentStyleId: string;
    onStyleChange: (newStyleId: string) => void;
    onClose: () => void;
  }>;
  insertStyledListWithStyle: (
    editorRef: RefObject<HTMLDivElement>,
    handleChange: () => void,
    items: ListItem[]
  ) => void;
  setupStyledListHandlers: (editorRef: RefObject<HTMLDivElement>) => void;
  getStyledListStyles: () => string;
  styles: StyledListStyle[];
}

const StyledList: StyledListType = {
  Button: StyledListButton,
  Modal: StyledListModal,
  ItemFloater: StyledListItemFloater,
  insertStyledListWithStyle,
  setupStyledListHandlers,
  getStyledListStyles,
  styles: styledListStyles
};

export default StyledList;
export { 
  StyledListButton, 
  StyledListModal,
  StyledListItemFloater,
  insertStyledListWithStyle,
  setupStyledListHandlers,
  getStyledListStyles,
  styledListStyles
};
export type { StyledListStyle, ListItem };