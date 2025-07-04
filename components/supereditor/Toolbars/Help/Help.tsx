'use client';

import React from 'react';
import { HelpCircle, X, Keyboard, Zap, Type, Palette, AlignLeft, List, Link, RotateCcw } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelpButtonProps {
  onClick: () => void;
}

interface ShortcutItem {
  keys: string;
  description: string;
}

interface ShortcutCategory {
  category: string;
  icon: React.ReactNode;
  items: ShortcutItem[];
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClose();
  };

  const shortcuts: ShortcutCategory[] = [
    {
      category: "Text Formatting",
      icon: <Type className="tw-w-5 tw-h-5" />,
      items: [
        { keys: "Ctrl + B", description: "Bold text" },
        { keys: "Ctrl + I", description: "Italic text" },
        { keys: "Ctrl + U", description: "Underline text" },
        { keys: "Ctrl + D", description: "Strikethrough text" },
        { keys: "Ctrl + Shift + _", description: "Subscript" },
        { keys: "Ctrl + Shift + +", description: "Superscript" }
      ]
    },
    {
      category: "Font & Size",
      icon: <Zap className="tw-w-5 tw-h-5" />,
      items: [
        { keys: "Ctrl + Shift + S", description: "Open font size dropdown" },
        { keys: "Ctrl + +", description: "Increase font size" },
        { keys: "Ctrl + -", description: "Decrease font size" },
        { keys: "Ctrl + Shift + Z", description: "Open font name dropdown" }
      ]
    },
    {
      category: "Colors",
      icon: <Palette className="tw-w-5 tw-h-5" />,
      items: [
        { keys: "Ctrl + Shift + F", description: "Open text color picker" },
        { keys: "Ctrl + Shift + H", description: "Open background color picker" }
      ]
    },
    {
      category: "Alignment",
      icon: <AlignLeft className="tw-w-5 tw-h-5" />,
      items: [
        { keys: "Ctrl + Shift + A", description: "Open alignment dropdown" },
        { keys: "Ctrl + Shift + ↑", description: "Cycle alignment up" },
        { keys: "Ctrl + Shift + ↓", description: "Cycle alignment down" }
      ]
    },
    {
      category: "Lists",
      icon: <List className="tw-w-5 tw-h-5" />,
      items: [
        { keys: "Ctrl + Shift + Q", description: "Open bullet list dropdown" },
        { keys: "Ctrl + Shift + E", description: "Open numbered list dropdown" },
        { keys: "Ctrl + Shift + M", description: "Open multilevel list dropdown" }
      ]
    },
    {
      category: "Insert Elements",
      icon: <Link className="tw-w-5 tw-h-5" />,
      items: [
        { keys: "Ctrl + Shift + L", description: "Create hyperlink (select text first)" },
        { keys: "Ctrl + Shift + B", description: "Insert/edit table" },
        { keys: "Ctrl + Shift + K", description: "Insert key concept block" }
      ]
    },
    {
      category: "General",
      icon: <RotateCcw className="tw-w-5 tw-h-5" />,
      items: [
        { keys: "Ctrl + Shift + P", description: "Open this help dialog" },
        { keys: "Escape", description: "Close any open dropdown/modal" },
        { keys: "Ctrl + Z", description: "Undo" },
        { keys: "Ctrl + Y", description: "Redo" }
      ]
    }
  ];

  return (
    <>
      <style>{`
        .cte-backdrop {
          backdrop-filter: blur(8px);
        }
        .cte-modal-enter {
          animation: cte-modal-enter 0.3s ease-out;
        }
        .cte-card-hover:hover {
          transform: translateY(-2px);
        }
        .cte-kbd-shine {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6);
        }
        .cte-gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .cte-glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        @keyframes cte-modal-enter {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .cte-category-gradient {
          background: linear-gradient(90deg, #8b5cf6, #a855f7, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
      
      <div className="tw-fixed tw-inset-0 tw-bg-gradient-to-br tw-from-purple-900/20 tw-via-indigo-900/20 tw-to-pink-900/20 cte-backdrop tw-flex tw-items-center tw-justify-center tw-z-50 tw-p-4">
        <div className="cte-glass-effect tw-rounded-2xl tw-shadow-2xl tw-max-w-6xl tw-w-full tw-max-h-[90vh] tw-overflow-hidden cte-modal-enter">
          <div className="cte-gradient-bg tw-p-6">
            <div className="tw-flex tw-justify-between tw-items-center">
              <div className="tw-flex tw-items-center tw-space-x-3">
                <div className="tw-bg-white/20 tw-rounded-full tw-p-2">
                  <Keyboard className="tw-w-6 tw-h-6 tw-text-white" />
                </div>
                <div>
                  <h2 className="tw-text-2xl tw-font-bold tw-text-white">Keyboard Shortcuts</h2>
                  <p className="tw-text-purple-100 tw-text-sm">Master your workflow with these shortcuts</p>
                </div>
              </div>
              <button 
                onClick={handleCloseClick}
                className="tw-text-white/80 hover:tw-text-white tw-transition-all tw-duration-200 tw-bg-white/10 hover:tw-bg-white/20 tw-rounded-full tw-p-2"
                type="button"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          <div className="tw-p-6 tw-overflow-auto tw-max-h-[calc(90vh-120px)]">
            <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 xl:tw-grid-cols-3 tw-gap-6">
              {shortcuts.map((category: ShortcutCategory, categoryIndex: number) => (
                <div key={categoryIndex} className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-border tw-border-purple-100 cte-card-hover tw-transition-all tw-duration-300">
                  <div className="tw-p-4 tw-border-b tw-border-purple-50">
                    <div className="tw-flex tw-items-center tw-space-x-3">
                      <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-indigo-500 tw-rounded-lg tw-p-2 tw-text-white">
                        {category.icon}
                      </div>
                      <h3 className="tw-font-bold tw-text-lg cte-category-gradient">
                        {category.category}
                      </h3>
                    </div>
                  </div>
                  <div className="tw-p-4 tw-space-y-3">
                    {category.items.map((shortcut: ShortcutItem, index: number) => (
                      <div key={index} className="tw-flex tw-justify-between tw-items-center tw-py-2 tw-border-b tw-border-gray-50 last:tw-border-b-0">
                        <span className="tw-text-sm tw-text-gray-700 tw-flex-1 tw-pr-3">
                          {shortcut.description}
                        </span>
                        <kbd className="cte-kbd-shine tw-text-purple-800 tw-px-3 tw-py-1.5 tw-rounded-lg tw-text-xs tw-font-bold tw-border-2 tw-border-purple-200 tw-whitespace-nowrap tw-min-w-max">
                          {shortcut.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="tw-mt-8 tw-bg-gradient-to-r tw-from-purple-50 tw-to-indigo-50 tw-rounded-xl tw-p-6 tw-border tw-border-purple-100">
              <div className="tw-flex tw-items-start tw-space-x-3">
                <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-indigo-500 tw-rounded-full tw-p-2 tw-text-white tw-flex-shrink-0">
                  <HelpCircle className="tw-w-5 tw-h-5" />
                </div>
                <div className="tw-space-y-3">
                  <h4 className="tw-font-bold tw-text-purple-800 tw-text-lg">Pro Tips</h4>
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                    <div className="tw-flex tw-items-start tw-space-x-2">
                      <div className="tw-w-2 tw-h-2 tw-bg-purple-500 tw-rounded-full tw-mt-2 tw-flex-shrink-0"></div>
                      <p className="tw-text-sm tw-text-gray-700">Most shortcuts work when the editor is focused</p>
                    </div>
                    <div className="tw-flex tw-items-start tw-space-x-2">
                      <div className="tw-w-2 tw-h-2 tw-bg-purple-500 tw-rounded-full tw-mt-2 tw-flex-shrink-0"></div>
                      <p className="tw-text-sm tw-text-gray-700">Some shortcuts require text selection first</p>
                    </div>
                    <div className="tw-flex tw-items-start tw-space-x-2">
                      <div className="tw-w-2 tw-h-2 tw-bg-purple-500 tw-rounded-full tw-mt-2 tw-flex-shrink-0"></div>
                      <p className="tw-text-sm tw-text-gray-700">Use Escape key to quickly close dropdowns</p>
                    </div>
                    <div className="tw-flex tw-items-start tw-space-x-2">
                      <div className="tw-w-2 tw-h-2 tw-bg-purple-500 tw-rounded-full tw-mt-2 tw-flex-shrink-0"></div>
                      <p className="tw-text-sm tw-text-gray-700">Combine shortcuts for faster editing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const HelpButton: React.FC<HelpButtonProps> = ({ onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClick();
  };

  return (
    <button 
      className="tw-bg-white tw-text-purple-700 tw-border tw-border-purple-300 tw-rounded tw-px-2 tw-py-2 tw-text-sm tw-hover:tw-bg-purple-50 tw-transition-colors tw-flex tw-items-center tw-justify-center tw-h-8 tw-min-w-[32px]"
      onClick={handleClick}
      title="Keyboard Shortcuts Help (Ctrl+Shift+P)"
      type="button"
    >
      <HelpCircle size={16} />
    </button>
  );
};

const Help = {
  Button: HelpButton,
  Modal: HelpModal
};

export default Help;
export { HelpButton, HelpModal };