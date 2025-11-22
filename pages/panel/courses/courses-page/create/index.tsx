// pages/panel/courses/courses-page/create/index.tsx - COMPLETE IMPLEMENTATION WITH MOVE MATERIAL TO TOPIC
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Eye, EyeOff, Upload, Link, Play, Menu, X, ChevronRight, Download, Save, Clock, ArrowUp, ArrowDown, Copy, Clipboard, MoveUp, MoveDown } from 'lucide-react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import MainLayout from '../../../../../components/layout/DashboardLayout';
import { ButtonGradient } from '../../../../../components/button/ButtonTemplate';
import { courseDB, exportCourseToJSON, importCourseFromJSON, downloadJSONFile, type CourseAutoSaveData } from '../../../../../utils/courseIndexedDB';
import { parseCustomContent, applySyntaxHighlighting, validateImportedData } from '../../../../../utils/SuperEditorImportHandler';

// Dynamic imports with loading states and no SSR
const SuperEditor = dynamic(() => import('../../../../../components/supereditor/SuperEditor'), { 
  ssr: false,
  loading: () => <div className="tw-p-4 tw-text-center tw-text-purple-600">Memuat editor...</div>
});

const PreviewComponent = dynamic(() => import('./PreviewComponent'), { 
  ssr: false,
  loading: () => <div className="tw-p-4 tw-text-center tw-text-purple-600">Memuat preview...</div>
});

const Sidebar = dynamic(() => import('./Sidebar'), { 
  ssr: false,
  loading: () => <div className="tw-p-4 tw-text-center tw-text-purple-600">Memuat sidebar...</div>
});

// Types
interface Material {
  id: number;
  title: string;
  isMandatory: boolean;
  hasVideo: boolean;
  videoType: 'upload' | 'url';
  videoFile: File | null;
  videoUrl: string;
  content: string;
}

interface Quiz {
  title?: string;
  questions: { id: number; code: string }[];
}

interface Drill {
  title?: string;
  questions: { id: number; code: string }[];
}

interface Topic {
  id: number;
  title: string;
  materials: Material[];
  quiz: Quiz;
  drill: Drill;
}

interface Section {
  id: number;
  title: string;
  description: string;
  duration: number;
  topics: Topic[];
}

interface QuestionSearchResult {
  id: number;
  code: string;
}

interface QuestionSearchResults {
  [key: string]: QuestionSearchResult[];
}

interface QuestionSearchLoading {
  [key: string]: boolean;
}

// Material JSON Import Data Interface
interface MaterialImportData {
  title?: string;
  isMandatory?: boolean;
  hasVideo?: boolean;
  videoType?: 'upload' | 'url';
  videoUrl?: string;
  content: string;
  [key: string]: any;
}

// Paste Modal Context Interface
interface PasteModalContext {
  sectionId: number;
  topicId: number;
  materialId: number;
}

// Move Material Modal Component
const MoveMaterialModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetSectionId: number, targetTopicId: number) => void;
  sections: Section[];
  currentSectionId: number;
  currentTopicId: number;
  materialTitle: string;
}> = ({ isOpen, onClose, onMove, sections, currentSectionId, currentTopicId, materialTitle }) => {
  const [selectedSectionId, setSelectedSectionId] = useState<number>(currentSectionId);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(currentTopicId);

  useEffect(() => {
    if (isOpen) {
      setSelectedSectionId(currentSectionId);
      setSelectedTopicId(currentTopicId);
    }
  }, [isOpen, currentSectionId, currentTopicId]);

  const currentSection = sections.find(s => s.id === currentSectionId);
  const currentTopic = currentSection?.topics.find(t => t.id === currentTopicId);
  const selectedSection = sections.find(s => s.id === selectedSectionId);

  const handleSectionChange = (sectionId: number) => {
    setSelectedSectionId(sectionId);
    const section = sections.find(s => s.id === sectionId);
    if (section && section.topics.length > 0) {
      setSelectedTopicId(section.topics[0].id);
    }
  };

  const handleMove = () => {
    if (selectedSectionId === currentSectionId && selectedTopicId === currentTopicId) {
      alert('Topik tujuan sama dengan topik asal. Pilih topik yang berbeda.');
      return;
    }
    onMove(selectedSectionId, selectedTopicId);
  };

  if (!isOpen) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4">
      <div className="tw-bg-white tw-rounded-lg tw-shadow-2xl tw-max-w-lg tw-w-full">
        {/* Modal Header */}
        <div className="tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-600 tw-text-white tw-p-6 tw-rounded-t-lg tw-flex tw-justify-between tw-items-center">
          <div className="tw-flex tw-items-center tw-gap-3">
            <MoveUp size={24} />
            <h2 className="tw-text-xl tw-font-bold tw-m-0">Pindahkan Material</h2>
          </div>
          <button
            onClick={onClose}
            className="tw-text-white hover:tw-bg-white hover:tw-bg-opacity-20 tw-rounded-full tw-p-2 tw-transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="tw-p-6 tw-space-y-4">
          <div className="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-4">
            <p className="tw-text-blue-800 tw-text-sm tw-mb-2">
              <strong>Material:</strong> {materialTitle || 'Material Baru'}
            </p>
            <p className="tw-text-blue-700 tw-text-sm tw-mb-1">
              <strong>Dari:</strong> {currentSection?.title || 'Section'} → {currentTopic?.title || 'Topic'}
            </p>
          </div>

          <div>
            <label className="tw-block tw-text-gray-700 tw-font-medium tw-mb-2">
              Pilih Section Tujuan
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => handleSectionChange(Number(e.target.value))}
              className="tw-w-full tw-px-4 tw-py-3 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-border-blue-500 focus:tw-ring-2 focus:tw-ring-blue-200"
            >
              {sections.map((section, index) => (
                <option key={section.id} value={section.id}>
                  Section {index + 1}: {section.title || 'Section Baru'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="tw-block tw-text-gray-700 tw-font-medium tw-mb-2">
              Pilih Topic Tujuan
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(Number(e.target.value))}
              className="tw-w-full tw-px-4 tw-py-3 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-border-blue-500 focus:tw-ring-2 focus:tw-ring-blue-200"
              disabled={!selectedSection || selectedSection.topics.length === 0}
            >
              {selectedSection && selectedSection.topics.length > 0 ? (
                selectedSection.topics.map((topic, index) => (
                  <option key={topic.id} value={topic.id}>
                    Topic {index + 1}: {topic.title || 'Topic Baru'}
                  </option>
                ))
              ) : (
                <option value="">Tidak ada topic tersedia</option>
              )}
            </select>
          </div>

          {selectedSectionId === currentSectionId && selectedTopicId === currentTopicId && (
            <div className="tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-rounded-lg tw-p-3">
              <p className="tw-text-yellow-800 tw-text-sm tw-m-0">
                ⚠️ Topik tujuan sama dengan topik asal. Pilih topik yang berbeda.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="tw-border-t tw-border-gray-200 tw-p-6 tw-flex tw-justify-end tw-gap-3">
          <button
            onClick={onClose}
            className="tw-px-6 tw-py-2 tw-bg-gray-100 hover:tw-bg-gray-200 tw-text-gray-700 tw-rounded-lg tw-transition-all tw-font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleMove}
            disabled={selectedSectionId === currentSectionId && selectedTopicId === currentTopicId}
            className="tw-px-6 tw-py-2 tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-600 hover:tw-from-blue-600 hover:tw-to-blue-700 tw-text-white tw-rounded-lg tw-transition-all tw-font-medium tw-shadow-lg hover:tw-shadow-xl disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
          >
            Pindahkan Material
          </button>
        </div>
      </div>
    </div>
  );
};

// Paste JSON Modal Component
const PasteJSONModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onPaste: (jsonData: string) => void;
}> = ({ isOpen, onClose, onPaste }) => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Auto-paste from clipboard when modal opens
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.readText()
          .then(text => {
            if (text.trim()) {
              setJsonInput(text);
            }
          })
          .catch(() => {
            // Silently fail if clipboard access denied
          });
      }
    } else {
      // Reset when closing
      setJsonInput('');
      setError('');
    }
  }, [isOpen]);

  const handleInsert = () => {
    if (!jsonInput.trim()) {
      setError('Mohon masukkan data JSON terlebih dahulu');
      return;
    }

    // Validate JSON format
    try {
      JSON.parse(jsonInput);
      onPaste(jsonInput);
      setError('');
    } catch (e) {
      setError('Format JSON tidak valid. Pastikan JSON Anda benar.');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        const text = await navigator.clipboard.readText();
        setJsonInput(text);
        setError('');
      } else {
        setError('Browser tidak mendukung clipboard API. Silakan paste manual.');
      }
    } catch (err) {
      setError('Gagal membaca clipboard. Silakan paste manual dengan Ctrl+V.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-4">
      <div className="tw-bg-white tw-rounded-lg tw-shadow-2xl tw-max-w-2xl tw-w-full tw-max-h-[90vh] tw-flex tw-flex-col">
        {/* Modal Header */}
        <div className="tw-bg-gradient-to-r tw-from-indigo-500 tw-to-indigo-600 tw-text-white tw-p-6 tw-rounded-t-lg tw-flex tw-justify-between tw-items-center">
          <div className="tw-flex tw-items-center tw-gap-3">
            <Clipboard size={24} />
            <h2 className="tw-text-xl tw-font-bold tw-m-0">Paste JSON Material</h2>
          </div>
          <button
            onClick={onClose}
            className="tw-text-white hover:tw-bg-white hover:tw-bg-opacity-20 tw-rounded-full tw-p-2 tw-transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="tw-flex-1 tw-overflow-y-auto tw-p-6">
          <div className="tw-mb-4">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
              <label className="tw-block tw-text-gray-700 tw-font-medium">
                Data JSON Material
              </label>
              <button
                onClick={handlePasteFromClipboard}
                className="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1 tw-text-sm tw-bg-gray-100 hover:tw-bg-gray-200 tw-text-gray-700 tw-rounded tw-transition-all"
              >
                <Clipboard size={16} />
                <span>Paste dari Clipboard</span>
              </button>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setError('');
              }}
              placeholder='Paste JSON data material di sini, contoh:
{
  "title": "Judul Material",
  "isMandatory": false,
  "hasVideo": true,
  "videoType": "url",
  "videoUrl": "https://...",
  "content": "<p>Konten material...</p>"
}'
              className="tw-w-full tw-h-64 tw-px-4 tw-py-3 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-border-indigo-500 focus:tw-ring-2 focus:tw-ring-indigo-200 tw-font-mono tw-text-sm tw-resize-none"
            />
            {error && (
              <div className="tw-mt-2 tw-p-3 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded tw-flex tw-items-start tw-gap-2">
                <div className="tw-text-red-600 tw-font-bold">⚠</div>
                <p className="tw-text-red-600 tw-text-sm tw-m-0">{error}</p>
              </div>
            )}
          </div>

          {/* JSON Format Info */}
          <div className="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-4">
            <h3 className="tw-text-blue-800 tw-font-semibold tw-mb-2 tw-flex tw-items-center tw-gap-2">
              <svg className="tw-w-5 tw-h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Format JSON yang Diharapkan
            </h3>
            <ul className="tw-text-blue-700 tw-text-sm tw-space-y-1 tw-mb-0 tw-ml-7">
              <li><code className="tw-bg-blue-100 tw-px-1 tw-rounded">title</code>: Judul material (string)</li>
              <li><code className="tw-bg-blue-100 tw-px-1 tw-rounded">isMandatory</code>: Materi wajib atau tidak (boolean)</li>
              <li><code className="tw-bg-blue-100 tw-px-1 tw-rounded">hasVideo</code>: Apakah ada video (boolean)</li>
              <li><code className="tw-bg-blue-100 tw-px-1 tw-rounded">videoType</code>: Tipe video "upload" atau "url" (string)</li>
              <li><code className="tw-bg-blue-100 tw-px-1 tw-rounded">videoUrl</code>: URL video jika type url (string)</li>
              <li><code className="tw-bg-blue-100 tw-px-1 tw-rounded">content</code>: Konten HTML material (string, wajib)</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="tw-border-t tw-border-gray-200 tw-p-6 tw-flex tw-justify-end tw-gap-3">
          <button
            onClick={onClose}
            className="tw-px-6 tw-py-2 tw-bg-gray-100 hover:tw-bg-gray-200 tw-text-gray-700 tw-rounded-lg tw-transition-all tw-font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleInsert}
            className="tw-px-6 tw-py-2 tw-bg-gradient-to-r tw-from-indigo-500 tw-to-indigo-600 hover:tw-from-indigo-600 hover:tw-to-indigo-700 tw-text-white tw-rounded-lg tw-transition-all tw-font-medium tw-shadow-lg hover:tw-shadow-xl"
          >
            Insert Material
          </button>
        </div>
      </div>
    </div>
  );
};

// Component
const CreateCourse: React.FC = () => {
  const searchParams = useSearchParams();
  const isImporting = searchParams?.get('import') === 'true';

  const [mounted, setMounted] = useState<boolean>(false);
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [courseDescription, setCourseDescription] = useState<string>('');
  const [courseImageUrl, setCourseImageUrl] = useState<string>('');
  const [learningPoints, setLearningPoints] = useState<string[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [expandedMaterials, setExpandedMaterials] = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [questionSearchResults, setQuestionSearchResults] = useState<QuestionSearchResults>({});
  const [questionSearchLoading, setQuestionSearchLoading] = useState<QuestionSearchLoading>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Autosave states
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutosaving, setIsAutosaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Copy notification state
  const [showCopyNotification, setShowCopyNotification] = useState<boolean>(false);
  const [copyNotificationText, setCopyNotificationText] = useState<string>('');

  // Paste Modal State
  const [isPasteModalOpen, setIsPasteModalOpen] = useState<boolean>(false);
  const [pasteModalContext, setPasteModalContext] = useState<PasteModalContext | null>(null);

  // Move Material Modal State
  const [isMoveModalOpen, setIsMoveModalOpen] = useState<boolean>(false);
  const [moveMaterialContext, setMoveMaterialContext] = useState<{
    sectionId: number;
    topicId: number;
    materialId: number;
  } | null>(null);

  const AUTOSAVE_KEY = 'create';
  const AUTOSAVE_INTERVAL = 30000; // 30 seconds

  // Get API Base URL
  const getApiBaseUrl = (): string => {
    if (typeof window === 'undefined') return '';
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  };

  // Show copy notification
  const showCopyFeedback = (message: string): void => {
    setCopyNotificationText(message);
    setShowCopyNotification(true);
    setTimeout(() => {
      setShowCopyNotification(false);
    }, 2000);
  };

  // Load highlight.js and KaTeX on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Load highlight.js
    const loadHighlightJS = async () => {
      if ((window as any).hljs) return;
      
      try {
        const hljs = await import('highlight.js/lib/core');
        
        // Import commonly used languages
        const [
          javascript, typescript, python, java, cpp, html, css, json
        ] = await Promise.all([
          import('highlight.js/lib/languages/javascript'),
          import('highlight.js/lib/languages/typescript'),
          import('highlight.js/lib/languages/python'),
          import('highlight.js/lib/languages/java'),
          import('highlight.js/lib/languages/cpp'),
          import('highlight.js/lib/languages/xml'),
          import('highlight.js/lib/languages/css'),
          import('highlight.js/lib/languages/json')
        ]);

        hljs.default.registerLanguage('javascript', javascript.default);
        hljs.default.registerLanguage('typescript', typescript.default);
        hljs.default.registerLanguage('python', python.default);
        hljs.default.registerLanguage('java', java.default);
        hljs.default.registerLanguage('cpp', cpp.default);
        hljs.default.registerLanguage('html', html.default);
        hljs.default.registerLanguage('css', css.default);
        hljs.default.registerLanguage('json', json.default);

        await import('highlight.js/styles/github-dark.min.css');

        (window as any).hljs = hljs.default;
      } catch (error) {
        console.error('Error loading highlight.js:', error);
      }
    };

    // Load KaTeX
    const loadKaTeX = async () => {
      if ((window as any).katex) return;
      
      try {
        const katex = await import('katex');
        (window as any).katex = katex.default;
      } catch (error) {
        console.error('Error loading KaTeX:', error);
      }
    };

    loadHighlightJS();
    loadKaTeX();
  }, []);

  // Parse material content using SuperEditorImportHandler
  const parseMaterialContent = (content: string): string => {
    try {
      // Parse custom tags to HTML
      const parsedContent = parseCustomContent(content);
      
      // Apply syntax highlighting after a short delay
      setTimeout(() => {
        applySyntaxHighlighting();
      }, 100);
      
      return parsedContent;
    } catch (error) {
      console.error('Error parsing material content:', error);
      return content;
    }
  };

  // Process sections with parsed content
  const processSectionsContent = (sectionsData: Section[]): Section[] => {
    return sectionsData.map(section => ({
      ...section,
      topics: section.topics.map(topic => ({
        ...topic,
        materials: topic.materials.map(material => ({
          ...material,
          content: parseMaterialContent(material.content || '<p>Mulai menulis konten materi...</p>')
        }))
      }))
    }));
  };

  // Auto save functionality
  const saveToAutosave = useCallback(async (): Promise<void> => {
    if (!mounted) return;
    
    setIsAutosaving(true);
    try {
      const data: Omit<CourseAutoSaveData, 'lastSaved'> = {
        courseTitle,
        courseDescription,
        courseImageUrl,
        learningPoints,
        sections,
        mode: 'create'
      };
      
      await courseDB.saveAutosave(AUTOSAVE_KEY, data);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      console.log('Autosave successful:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Autosave failed:', error);
    } finally {
      setIsAutosaving(false);
    }
  }, [courseTitle, courseDescription, courseImageUrl, learningPoints, sections, mounted]);

  // Load from autosave
  const loadFromAutosave = useCallback(async (): Promise<void> => {
    try {
      const saved = await courseDB.getAutosave(AUTOSAVE_KEY);
      if (saved) {
        // Process sections with parsed content
        const sectionsWithParsedContent = processSectionsContent(saved.sections);

        setCourseTitle(saved.courseTitle);
        setCourseDescription(saved.courseDescription);
        setCourseImageUrl(saved.courseImageUrl);
        setLearningPoints(saved.learningPoints);
        setSections(sectionsWithParsedContent);
        setLastSaved(new Date(saved.lastSaved));
        
        console.log('Loaded from autosave:', new Date(saved.lastSaved).toLocaleTimeString());
      }
    } catch (error) {
      console.error('Failed to load from autosave:', error);
    }
  }, []);

  // Import from JSON
  const importFromJSON = useCallback(async (): Promise<void> => {
    try {
      const importedData = sessionStorage.getItem('importedCourseData');
      if (importedData) {
        sessionStorage.removeItem('importedCourseData');
        
        const parsed = importCourseFromJSON(importedData);
        if (parsed) {
          // Process sections with parsed content using SuperEditorImportHandler
          const sectionsWithParsedContent = processSectionsContent(parsed.sections);

          setCourseTitle(parsed.courseTitle);
          setCourseDescription(parsed.courseDescription);
          setCourseImageUrl(parsed.courseImageUrl);
          setLearningPoints(parsed.learningPoints);
          setSections(sectionsWithParsedContent);
          setHasUnsavedChanges(true);
          
          // Save imported data to autosave
          await courseDB.saveAutosave(AUTOSAVE_KEY, {
            courseTitle: parsed.courseTitle,
            courseDescription: parsed.courseDescription,
            courseImageUrl: parsed.courseImageUrl,
            learningPoints: parsed.learningPoints,
            sections: sectionsWithParsedContent,
            mode: 'create'
          });
          
          // Force re-render after a short delay
          setTimeout(() => {
            setHasUnsavedChanges(true);
          }, 100);
          
          alert('Data berhasil diimport dari JSON dan content telah diparse!');
        } else {
          alert('Format JSON tidak valid atau data corrupt.');
        }
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Gagal mengimport data JSON.');
    }
  }, []);

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      setMounted(true);
      
      // Initialize IndexedDB
      await courseDB.init();
      
      if (isImporting) {
        await importFromJSON();
      } else {
        await loadFromAutosave();
      }
    };
    
    initializeComponent();
  }, [isImporting, importFromJSON, loadFromAutosave]);

  // Track changes for autosave
  useEffect(() => {
    if (mounted) {
      setHasUnsavedChanges(true);
    }
  }, [courseTitle, courseDescription, courseImageUrl, learningPoints, sections, mounted]);

  // Auto save timer
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      if (hasUnsavedChanges) {
        saveToAutosave();
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, saveToAutosave, mounted]);

  // Export to JSON
  const handleExportJSON = (): void => {
    try {
      const data: CourseAutoSaveData = {
        courseTitle,
        courseDescription,
        courseImageUrl,
        learningPoints,
        sections,
        mode: 'create',
        lastSaved: Date.now()
      };
      
      const jsonString = exportCourseToJSON(data);
      const timestamp = new Date().getTime();
      const filename = `course_create_${timestamp}.json`;
      
      downloadJSONFile(filename, jsonString);
      alert('Course berhasil diexport ke JSON!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Gagal mengexport course ke JSON.');
    }
  };

  // Import JSON from file
  const handleImportJSON = (): void => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const jsonString = event.target?.result as string;
            const parsed = importCourseFromJSON(jsonString);
            
            if (parsed) {
              if (confirm('Import akan mengganti semua data yang ada. Lanjutkan?')) {
                // Process sections with parsed content using SuperEditorImportHandler
                const sectionsWithParsedContent = processSectionsContent(parsed.sections);

                setCourseTitle(parsed.courseTitle);
                setCourseDescription(parsed.courseDescription);
                setCourseImageUrl(parsed.courseImageUrl);
                setLearningPoints(parsed.learningPoints);
                setSections(sectionsWithParsedContent);
                setHasUnsavedChanges(true);
                
                // Save imported data to autosave
                await courseDB.saveAutosave(AUTOSAVE_KEY, {
                  courseTitle: parsed.courseTitle,
                  courseDescription: parsed.courseDescription,
                  courseImageUrl: parsed.courseImageUrl,
                  learningPoints: parsed.learningPoints,
                  sections: sectionsWithParsedContent,
                  mode: 'create'
                });
                
                // Force re-render
                setTimeout(() => {
                  setHasUnsavedChanges(true);
                  applySyntaxHighlighting();
                }, 100);
                
                alert('Data berhasil diimport dari JSON dan content telah diparse!');
              }
            } else {
              alert('Format JSON tidak valid atau data corrupt.');
            }
          } catch (error) {
            console.error('Import failed:', error);
            alert('Gagal mengimport data JSON.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Export Material to JSON
  const handleExportMaterialJSON = (sectionId: number, topicId: number, materialId: number): void => {
    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section) {
        alert('Section tidak ditemukan.');
        return;
      }
      
      const topic = section.topics.find(t => t.id === topicId);
      if (!topic) {
        alert('Topic tidak ditemukan.');
        return;
      }
      
      const material = topic.materials.find(m => m.id === materialId);
      if (!material) {
        alert('Material tidak ditemukan.');
        return;
      }
      
      // Create material export data
      const materialData = {
        title: material.title,
        isMandatory: material.isMandatory,
        hasVideo: material.hasVideo,
        videoType: material.videoType,
        videoUrl: material.videoUrl,
        content: material.content,
        exportDate: new Date().toISOString(),
        exportVersion: '1.0'
      };
      
      const jsonString = JSON.stringify(materialData, null, 2);
      const timestamp = new Date().getTime();
      const filename = `material_${material.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}.json`;
      
      downloadJSONFile(filename, jsonString);
      alert('Material berhasil diexport ke JSON!');
    } catch (error) {
      console.error('Export material failed:', error);
      alert('Gagal mengexport material ke JSON.');
    }
  };

  // Copy Material JSON to Clipboard
  const handleCopyMaterialJSON = async (sectionId: number, topicId: number, materialId: number): Promise<void> => {
    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section) {
        alert('Section tidak ditemukan.');
        return;
      }
      
      const topic = section.topics.find(t => t.id === topicId);
      if (!topic) {
        alert('Topic tidak ditemukan.');
        return;
      }
      
      const material = topic.materials.find(m => m.id === materialId);
      if (!material) {
        alert('Material tidak ditemukan.');
        return;
      }
      
      // Create material export data
      const materialData = {
        title: material.title,
        isMandatory: material.isMandatory,
        hasVideo: material.hasVideo,
        videoType: material.videoType,
        videoUrl: material.videoUrl,
        content: material.content,
        exportDate: new Date().toISOString(),
        exportVersion: '1.0'
      };
      
      const jsonString = JSON.stringify(materialData, null, 2);
      
      // Copy to clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(jsonString);
        showCopyFeedback('JSON berhasil dicopy ke clipboard!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = jsonString;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          showCopyFeedback('JSON berhasil dicopy ke clipboard!');
        } catch (error) {
          alert('Gagal copy JSON. Browser Anda mungkin tidak support fitur ini.');
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Copy material JSON failed:', error);
      alert('Gagal copy material JSON ke clipboard.');
    }
  };

  // Import Material from JSON with ImportHandler
  const handleImportMaterialJSON = (sectionId: number, topicId: number, materialId: number): void => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const jsonString = event.target?.result as string;
            const parsed: MaterialImportData = JSON.parse(jsonString);
            
            // Validate JSON structure using ImportHandler
            const validation = validateImportedData(parsed);
            if (!validation.valid) {
              alert(validation.error || 'Format JSON tidak valid.');
              return;
            }
            
            if (confirm('Import akan mengganti data material ini. Lanjutkan?')) {
              // Parse content using SuperEditorImportHandler
              const parsedContent = parseMaterialContent(parsed.content || '<p>Mulai menulis konten materi...</p>');
              
              // Update material dengan data dari JSON
              setSections(prevSections => prevSections.map(section => 
                section.id === sectionId 
                  ? {
                      ...section,
                      topics: section.topics.map(topic => 
                        topic.id === topicId 
                          ? {
                              ...topic,
                              materials: topic.materials.map(material =>
                                material.id === materialId 
                                  ? {
                                      ...material,
                                      title: parsed.title || material.title,
                                      isMandatory: parsed.hasOwnProperty('isMandatory') ? parsed.isMandatory! : material.isMandatory,
                                      hasVideo: parsed.hasOwnProperty('hasVideo') ? parsed.hasVideo! : material.hasVideo,
                                      videoType: parsed.videoType || material.videoType,
                                      videoUrl: parsed.videoUrl || material.videoUrl,
                                      content: parsedContent
                                    }
                                  : material
                              )
                            }
                          : topic
                      )
                    }
                  : section
              ));
              
              setHasUnsavedChanges(true);
              
              // Force re-render and apply syntax highlighting
              setTimeout(() => {
                setHasUnsavedChanges(true);
                applySyntaxHighlighting();
              }, 100);
              
              alert('Material berhasil diimport dari JSON dan content telah diparse!');
            }
          } catch (error) {
            console.error('Import material failed:', error);
            alert('Gagal mengimport material dari JSON. Pastikan format JSON benar.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Open Paste Modal
  const handleOpenPasteModal = (sectionId: number, topicId: number, materialId: number): void => {
    setPasteModalContext({ sectionId, topicId, materialId });
    setIsPasteModalOpen(true);
  };

  // Handle Paste from Modal
  const handlePasteFromModal = async (jsonString: string): Promise<void> => {
    if (!pasteModalContext) return;

    const { sectionId, topicId, materialId } = pasteModalContext;

    try {
      const parsed: MaterialImportData = JSON.parse(jsonString);
      
      // Validate JSON structure using ImportHandler
      const validation = validateImportedData(parsed);
      if (!validation.valid) {
        alert(validation.error || 'Format JSON tidak valid.');
        return;
      }
      
      // Parse content using SuperEditorImportHandler
      const parsedContent = parseMaterialContent(parsed.content || '<p>Mulai menulis konten materi...</p>');
      
      // Update material dengan data dari JSON
      setSections(prevSections => prevSections.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              topics: section.topics.map(topic => 
                topic.id === topicId 
                  ? {
                      ...topic,
                      materials: topic.materials.map(material =>
                        material.id === materialId 
                          ? {
                              ...material,
                              title: parsed.title || material.title,
                              isMandatory: parsed.hasOwnProperty('isMandatory') ? parsed.isMandatory! : material.isMandatory,
                              hasVideo: parsed.hasOwnProperty('hasVideo') ? parsed.hasVideo! : material.hasVideo,
                              videoType: parsed.videoType || material.videoType,
                              videoUrl: parsed.videoUrl || material.videoUrl,
                              content: parsedContent
                            }
                          : material
                      )
                    }
                  : topic
              )
            }
          : section
      ));
      
      setHasUnsavedChanges(true);
      
      // Close modal
      setIsPasteModalOpen(false);
      setPasteModalContext(null);
      
      // Force re-render and apply syntax highlighting
      setTimeout(() => {
        setHasUnsavedChanges(true);
        applySyntaxHighlighting();
      }, 100);
      
      showCopyFeedback('Material berhasil diimport dari clipboard!');
    } catch (error) {
      console.error('Paste material JSON failed:', error);
      alert('Gagal paste material JSON. Pastikan format JSON benar.');
    }
  };

  // Open Move Material Modal
  const handleOpenMoveModal = (sectionId: number, topicId: number, materialId: number): void => {
    setMoveMaterialContext({ sectionId, topicId, materialId });
    setIsMoveModalOpen(true);
  };

  // Handle Move Material to Another Topic
// Handle Move Material to Another Topic
const handleMoveMaterial = (targetSectionId: number, targetTopicId: number): void => {
  if (!moveMaterialContext) return;

  const { sectionId: sourceSectionId, topicId: sourceTopicId, materialId } = moveMaterialContext;

  // Find the material to move
  const sourceSection = sections.find(s => s.id === sourceSectionId);
  if (!sourceSection) return;

  const sourceTopic = sourceSection.topics.find(t => t.id === sourceTopicId);
  if (!sourceTopic) return;

  const materialToMove = sourceTopic.materials.find(m => m.id === materialId);
  if (!materialToMove) return;

  // Update sections in one pass
  setSections(prevSections => {
    return prevSections.map(section => {
      // If this is the source section
      if (section.id === sourceSectionId) {
        return {
          ...section,
          topics: section.topics.map(topic => {
            // Remove from source topic
            if (topic.id === sourceTopicId) {
              return {
                ...topic,
                materials: topic.materials.filter(m => m.id !== materialId)
              };
            }
            // Add to target topic if in same section
            if (section.id === targetSectionId && topic.id === targetTopicId) {
              return {
                ...topic,
                materials: [...topic.materials, materialToMove]
              };
            }
            return topic;
          })
        };
      }
      
      // If this is the target section (and different from source)
      if (section.id === targetSectionId && section.id !== sourceSectionId) {
        return {
          ...section,
          topics: section.topics.map(topic => {
            // Add to target topic
            if (topic.id === targetTopicId) {
              return {
                ...topic,
                materials: [...topic.materials, materialToMove]
              };
            }
            return topic;
          })
        };
      }
      
      return section;
    });
  });

  setHasUnsavedChanges(true);
  setIsMoveModalOpen(false);
  setMoveMaterialContext(null);
  showCopyFeedback('Material berhasil dipindahkan!');
};
  // Clear autosave
  const handleClearAutosave = async (): Promise<void> => {
    if (confirm('Hapus data autosave? Data yang belum disimpan akan hilang.')) {
      try {
        await courseDB.deleteAutosave(AUTOSAVE_KEY);
        setCourseTitle('');
        setCourseDescription('');
        setCourseImageUrl('');
        setLearningPoints([]);
        setSections([]);
        setLastSaved(null);
        setHasUnsavedChanges(false);
        alert('Data autosave berhasil dihapus.');
      } catch (error) {
        console.error('Failed to clear autosave:', error);
        alert('Gagal menghapus data autosave.');
      }
    }
  };

  const addLearningPoint = (): void => {
    setLearningPoints([...learningPoints, '']);
  };

  const updateLearningPoint = (index: number, value: string): void => {
    setLearningPoints(learningPoints.map((point, i) => i === index ? value : point));
  };

  const deleteLearningPoint = (index: number): void => {
    setLearningPoints(learningPoints.filter((_, i) => i !== index));
  };

  const addSection = (): void => {
    setSections([...sections, {
      id: Date.now(),
      title: '',
      description: '',
      duration: 0,
      topics: []
    }]);
  };

  const deleteSection = (sectionId: number): void => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const updateSection = (sectionId: number, field: keyof Section, value: string | number): void => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, [field]: value } : section
    ));
  };

  const toggleSection = (sectionId: number): void => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const addTopic = (sectionId: number): void => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            topics: [...section.topics, {
              id: Date.now(),
              title: '',
              materials: [],
              quiz: { questions: [] },
              drill: { questions: [] }
            }]
          }
        : section
    ));
  };

  const deleteTopic = (sectionId: number, topicId: number): void => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, topics: section.topics.filter(topic => topic.id !== topicId) }
        : section
    ));
  };

  const updateTopic = (sectionId: number, topicId: number, field: keyof Topic, value: string): void => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            topics: section.topics.map(topic =>
              topic.id === topicId ? { ...topic, [field]: value } : topic
            )
          }
        : section
    ));
  };

  const toggleTopic = (topicId: number): void => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const toggleMaterial = (materialId: number): void => {
    const newExpanded = new Set(expandedMaterials);
    if (newExpanded.has(materialId)) {
      newExpanded.delete(materialId);
    } else {
      newExpanded.add(materialId);
    }
    setExpandedMaterials(newExpanded);
  };

  const addMaterial = (sectionId: number, topicId: number): void => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            topics: section.topics.map(topic => 
              topic.id === topicId 
                ? { 
                    ...topic, 
                    materials: [...topic.materials, {
                      id: Date.now(),
                      title: '',
                      isMandatory: false,
                      hasVideo: false,
                      videoType: 'upload',
                      videoFile: null,
                      videoUrl: '',
                      content: '<p>Mulai menulis konten materi...</p>'
                    }]
                  }
                : topic
            )
          }
        : section
    ));
  };

  const deleteMaterial = (sectionId: number, topicId: number, materialId: number): void => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            topics: section.topics.map(topic => 
              topic.id === topicId 
                ? { ...topic, materials: topic.materials.filter(material => material.id !== materialId) }
                : topic
            )
          }
        : section
    ));
  };

  const updateMaterial = (sectionId: number, topicId: number, materialId: number, field: keyof Material, value: any): void => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            topics: section.topics.map(topic => 
              topic.id === topicId 
                ? {
                    ...topic,
                    materials: topic.materials.map(material =>
                      material.id === materialId ? { ...material, [field]: value } : material
                    )
                  }
                : topic
            )
          }
        : section
    ));
  };

  // Move material up in order
  const moveMaterialUp = (sectionId: number, topicId: number, materialIndex: number): void => {
    if (materialIndex === 0) return; // Already at top

    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            topics: section.topics.map(topic => 
              topic.id === topicId 
                ? {
                    ...topic,
                    materials: topic.materials.map((material, idx) => {
                      if (idx === materialIndex - 1) return topic.materials[materialIndex];
                      if (idx === materialIndex) return topic.materials[materialIndex - 1];
                      return material;
                    })
                  }
                : topic
            )
          }
        : section
    ));
    
    setHasUnsavedChanges(true);
  };

  // Move material down in order
  const moveMaterialDown = (sectionId: number, topicId: number, materialIndex: number, totalMaterials: number): void => {
    if (materialIndex === totalMaterials - 1) return; // Already at bottom

    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            topics: section.topics.map(topic => 
              topic.id === topicId 
                ? {
                    ...topic,
                    materials: topic.materials.map((material, idx) => {
                      if (idx === materialIndex) return topic.materials[materialIndex + 1];
                      if (idx === materialIndex + 1) return topic.materials[materialIndex];
                      return material;
                    })
                  }
                : topic
            )
          }
        : section
    ));
    
    setHasUnsavedChanges(true);
  };
  const searchQuestions = async (searchTerm: string, topicId: number, type: 'quiz' | 'drill'): Promise<void> => {
    if (!mounted || !searchTerm.trim()) {
      setQuestionSearchResults(prev => ({
        ...prev,
        [`${topicId}-${type}`]: []
      }));
      return;
    }

    const key = `${topicId}-${type}`;
    setQuestionSearchLoading(prev => ({ ...prev, [key]: true }));

    try {
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const API_BASE_URL = getApiBaseUrl();
      
      const response = await axios.get(`${API_BASE_URL}/questions/search`, {
        params: { search: searchTerm },
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      setQuestionSearchResults(prev => ({
        ...prev,
        [key]: response.data.data || []
      }));
    } catch (error) {
      console.error('Error searching questions:', error);
      setQuestionSearchResults(prev => ({
        ...prev,
        [key]: []
      }));
    } finally {
      setQuestionSearchLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const addQuestionToTopic = (sectionId: number, topicId: number, type: 'quiz' | 'drill', questionId: number, questionCode: string): void => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            topics: section.topics.map(topic => 
              topic.id === topicId 
                ? {
                    ...topic,
                    [type]: {
                      ...topic[type],
                      questions: [...(topic[type].questions || []), { id: questionId, code: questionCode }]
                    }
                  }
                : topic
            )
          }
        : section
    ));
  };

  const removeQuestionFromTopic = (sectionId: number, topicId: number, type: 'quiz' | 'drill', questionId: number): void => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            topics: section.topics.map(topic => 
              topic.id === topicId 
                ? {
                    ...topic,
                    [type]: {
                      ...topic[type],
                      questions: (topic[type].questions || []).filter(q => q.id !== questionId)
                    }
                  }
                : topic
            )
          }
        : section
    ));
  };

  const handleVideoFileChange = (sectionId: number, topicId: number, materialId: number, file: File | null): void => {
    updateMaterial(sectionId, topicId, materialId, 'videoFile', file);
  };

  const handleEditorChange = (sectionId: number, topicId: number, materialId: number) => (content: string): void => {
    setSections(prevSections => prevSections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            topics: section.topics.map(topic => 
              topic.id === topicId 
                ? {
                    ...topic,
                    materials: topic.materials.map(material =>
                      material.id === materialId 
                        ? { ...material, content } 
                        : material
                    )
                  }
                : topic
            )
          }
        : section
    ));
  };

  const scrollToElement = (elementId: string): void => {
    if (typeof window === 'undefined') return;
    
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const validateCourseData = (): boolean => {
    if (!courseTitle.trim()) {
      alert('Judul course harus diisi');
      return false;
    }
    if (!courseDescription.trim()) {
      alert('Deskripsi course harus diisi');
      return false;
    }
    if (learningPoints.length === 0 || learningPoints.every(point => !point.trim())) {
      alert('Minimal harus ada satu learning point');
      return false;
    }
    if (sections.length === 0) {
      alert('Minimal harus ada satu section');
      return false;
    }
    
    for (let section of sections) {
      if (!section.title.trim()) {
        alert('Semua section harus memiliki judul');
        return false;
      }
      if (!section.description.trim()) {
        alert(`Section "${section.title}" harus memiliki deskripsi`);
        return false;
      }
      if (!section.duration || section.duration <= 0) {
        alert(`Section "${section.title}" harus memiliki durasi lebih dari 0 menit`);
        return false;
      }
      if (section.topics.length === 0) {
        alert(`Section "${section.title}" harus memiliki minimal satu topik`);
        return false;
      }
      
      for (let topic of section.topics) {
        if (!topic.title.trim()) {
          alert(`Semua topik di section "${section.title}" harus memiliki judul`);
          return false;
        }
      }
    }
    
    return true;
  };

  const saveCourse = async (): Promise<void> => {
    if (!mounted || !validateCourseData()) {
      return;
    }

    setIsSaving(true);
    
    try {
      const courseData = {
        title: courseTitle.trim(),
        description: courseDescription.trim(),
        imageUrl: courseImageUrl.trim(),
        learningPoints: learningPoints.filter(point => point.trim().length > 0),
        sections: sections.map(section => ({
          id: section.id,
          title: section.title.trim(),
          description: section.description.trim(),
          duration: section.duration,
          topics: section.topics.map(topic => ({
            id: topic.id,
            title: topic.title.trim(),
            materials: topic.materials.map(material => ({
              id: material.id,
              title: material.title.trim(),
              isMandatory: material.isMandatory,
              hasVideo: material.hasVideo,
              videoType: material.videoType,
              videoUrl: material.videoUrl.trim(),
              content: material.content,
              videoFileName: material.videoFile ? material.videoFile.name : null
            })),
            quiz: topic.quiz || { questions: [] },
            drill: topic.drill || { questions: [] }
          }))
        }))
      };
      
      console.log('=== SENDING JSON DATA ===');
      console.log('Course Data:', JSON.stringify(courseData, null, 2));
      
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const API_BASE_URL = getApiBaseUrl();
      
      const response = await axios.post(`${API_BASE_URL}/courses/detail`, courseData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      alert('Course berhasil disimpan!');
      console.log('Course saved:', response.data);
      
      // Clear autosave after successful save
      await courseDB.deleteAutosave(AUTOSAVE_KEY);
      
      resetForm();
    } catch (error: any) {
      console.error('=== ERROR SAVING COURSE ===');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || 'Gagal menyimpan course';
      alert(`Gagal menyimpan course: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = (): void => {
    setCourseTitle('');
    setCourseDescription('');
    setCourseImageUrl('');
    setLearningPoints([]);
    setSections([]);
    setExpandedSections(new Set());
    setExpandedTopics(new Set());
    setExpandedMaterials(new Set());
    setQuestionSearchResults({});
    setQuestionSearchLoading({});
    setLastSaved(null);
    setHasUnsavedChanges(false);
  };

  // Don't render anything until mounted on client
  if (!mounted) {
    return (
      <MainLayout>
        <div className="tw-flex tw-min-h-screen tw-bg-gray-50 tw-items-center tw-justify-center">
          <div className="tw-text-center">
            <div className="tw-animate-spin tw-rounded-full tw-h-32 tw-w-32 tw-border-b-2 tw-border-purple-600 tw-mx-auto"></div>
            <p className="tw-text-purple-600 tw-mt-4 tw-text-lg">Memuat halaman...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="tw-flex tw-min-h-screen tw-bg-gray-50">
        {/* Move Material Modal */}
        <MoveMaterialModal
          isOpen={isMoveModalOpen}
          onClose={() => {
            setIsMoveModalOpen(false);
            setMoveMaterialContext(null);
          }}
          onMove={handleMoveMaterial}
          sections={sections}
          currentSectionId={moveMaterialContext?.sectionId || 0}
          currentTopicId={moveMaterialContext?.topicId || 0}
          materialTitle={
            moveMaterialContext
              ? sections
                  .find(s => s.id === moveMaterialContext.sectionId)
                  ?.topics.find(t => t.id === moveMaterialContext.topicId)
                  ?.materials.find(m => m.id === moveMaterialContext.materialId)
                  ?.title || 'Material Baru'
              : 'Material Baru'
          }
        />

        {/* Paste JSON Modal */}
        <PasteJSONModal
          isOpen={isPasteModalOpen}
          onClose={() => {
            setIsPasteModalOpen(false);
            setPasteModalContext(null);
          }}
          onPaste={handlePasteFromModal}
        />

        {/* Copy Notification */}
        {showCopyNotification && (
          <div className="tw-fixed tw-top-4 tw-right-4 tw-z-50 tw-bg-green-500 tw-text-white tw-px-6 tw-py-3 tw-rounded-lg tw-shadow-lg tw-flex tw-items-center tw-gap-2 tw-animate-bounce">
            <Copy size={20} />
            <span>{copyNotificationText}</span>
          </div>
        )}

        <div className="tw-flex-1 tw-mx-4 tw-py-8 tw-px-4 md:tw-px-8 tw-max-w-none">
          <div className="tw-mb-6">
            <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-mb-4 tw-gap-4">
              <div>
                <h1 className="tw-text-3xl tw-font-bold tw-text-purple-800">
                  Buat Course Baru
                </h1>
                {/* Autosave Status */}
                <div className="tw-flex tw-items-center tw-gap-2 tw-mt-2 tw-text-sm">
                  {isAutosaving ? (
                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-blue-600">
                      <Clock size={14} className="tw-animate-spin" />
                      <span>Menyimpan otomatis...</span>
                    </div>
                  ) : lastSaved ? (
                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-green-600">
                      <Save size={14} />
                      <span>Tersimpan otomatis: {lastSaved.toLocaleTimeString()}</span>
                    </div>
                  ) : hasUnsavedChanges ? (
                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-orange-600">
                      <Clock size={14} />
                      <span>Ada perubahan belum tersimpan</span>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="tw-flex tw-flex-wrap tw-gap-2">
                <ButtonGradient
                  action="menu"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  customText="Daftar Isi"
                  showText={true}
                  className="lg:tw-hidden"
                  customColors={{
                    primary: '#FFFFFF',
                    secondary: '#F3F4F6',
                    gradient1: '#FFFFFF',
                    gradient2: '#F3F4F6',
                    text: '#8B5CF6',
                    border: '#8B5CF6'
                  }}
                />
                <ButtonGradient
                  action="upload"
                  size="sm"
                  onClick={handleImportJSON}
                  customText="Import JSON"
                  showText={true}
                  customColors={{
                    primary: '#06B6D4',
                    secondary: '#0891B2',
                    gradient1: '#06B6D4',
                    gradient2: '#0891B2',
                    text: '#FFFFFF'
                  }}
                />
                <ButtonGradient
                  action="download"
                  size="sm"
                  onClick={handleExportJSON}
                  customText="Export JSON"
                  showText={true}
                  customColors={{
                    primary: '#10B981',
                    secondary: '#059669',
                    gradient1: '#10B981',
                    gradient2: '#059669',
                    text: '#FFFFFF'
                  }}
                />
                <ButtonGradient
                  action="clear"
                  size="sm"
                  onClick={handleClearAutosave}
                  customText="Reset Data"
                  showText={true}
                  customColors={{
                    primary: '#EF4444',
                    secondary: '#DC2626',
                    gradient1: '#EF4444',
                    gradient2: '#DC2626',
                    text: '#FFFFFF'
                  }}
                />
                <ButtonGradient
                  action={previewMode ? "edit" : "view"}
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                  customText={previewMode ? 'Edit Mode' : 'Preview'}
                  showText={true}
                  customColors={{
                    primary: '#FFFFFF',
                    secondary: '#F3F4F6',
                    gradient1: '#FFFFFF',
                    gradient2: '#F3F4F6',
                    text: '#8B5CF6',
                    border: '#8B5CF6'
                  }}
                />
              </div>
            </div>
            <p className="tw-text-gray-600">
              Buat dan atur konten course dengan topik, materi, quiz, dan drill. Copy/Paste JSON untuk transfer antar materi!
            </p>
          </div>

          <Sidebar 
            courseTitle={courseTitle}
            sections={sections}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            scrollToElement={scrollToElement}
          />

          {sidebarOpen && (
            <div 
              className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-z-40 lg:tw-hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div style={{ display: previewMode ? 'block' : 'none' }}>
            <PreviewComponent
              courseTitle={courseTitle}
              courseDescription={courseDescription}
              courseImageUrl={courseImageUrl}
              learningPoints={learningPoints}
              sections={sections}
            />
          </div>
          
          <div style={{ display: previewMode ? 'none' : 'block' }}>
            <div className="tw-space-y-6">
              {/* Course Information Section */}
              <div className="tw-border tw-border-purple-300 tw-rounded-lg tw-shadow-lg">
                <div className="tw-bg-purple-600 tw-text-white tw-p-4 tw-rounded-t-lg">
                  <h3 className="tw-text-xl tw-font-semibold tw-mb-0">Informasi Course</h3>
                </div>
                <div className="tw-bg-purple-50 tw-p-4">
                  <div className="tw-mb-4">
                    <label className="tw-block tw-text-purple-700 tw-font-medium tw-mb-2">
                      Judul Course
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan judul course"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-purple-300 tw-rounded-lg focus:tw-outline-none focus:tw-border-purple-500 focus:tw-ring-2 focus:tw-ring-purple-200"
                    />
                  </div>
                  <div className="tw-mb-4">
                    <label className="tw-block tw-text-purple-700 tw-font-medium tw-mb-2">
                      Deskripsi Course
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Masukkan deskripsi course"
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-purple-300 tw-rounded-lg focus:tw-outline-none focus:tw-border-purple-500 focus:tw-ring-2 focus:tw-ring-purple-200"
                    />
                  </div>
                  <div className="tw-mb-4">
                    <label className="tw-block tw-text-purple-700 tw-font-medium tw-mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="Masukkan URL gambar course"
                      value={courseImageUrl}
                      onChange={(e) => setCourseImageUrl(e.target.value)}
                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-purple-300 tw-rounded-lg focus:tw-outline-none focus:tw-border-purple-500 focus:tw-ring-2 focus:tw-ring-purple-200"
                    />
                  </div>
                  <div>
                    <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                      <label className="tw-block tw-text-purple-700 tw-font-medium">
                        Learning Points
                      </label>
                      <ButtonGradient
                        action="add"
                        size="sm"
                        onClick={addLearningPoint}
                        customText="Tambah Learning Point"
                        showText={true}
                      />
                    </div>
                    {learningPoints.map((point, index) => (
                      <div key={index} className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                        <input
                          type="text"
                          placeholder={`Learning Point ${index + 1}`}
                          value={point}
                          onChange={(e) => updateLearningPoint(index, e.target.value)}
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-purple-300 tw-rounded-lg focus:tw-outline-none focus:tw-border-purple-500 focus:tw-ring-2 focus:tw-ring-purple-200"
                        />
                        <ButtonGradient
                          action="delete"
                          size="sm"
                          onClick={() => deleteLearningPoint(index)}
                          showText={false}
                        />
                      </div>
                    ))}
                    {learningPoints.length === 0 && (
                      <p className="tw-text-gray-500 tw-italic">Belum ada learning points. Tambahkan dengan tombol di atas.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="tw-border tw-border-purple-300 tw-rounded-lg tw-shadow-lg">
                <div className="tw-bg-purple-600 tw-text-white tw-p-4 tw-rounded-t-lg tw-flex tw-justify-between tw-items-center">
                  <h3 className="tw-text-xl tw-font-semibold tw-mb-0">Section Course</h3>
                  <ButtonGradient
                    action="add"
                    size="sm"
                    onClick={addSection}
                    customText="Tambah Section"
                    showText={true}
                    customColors={{
                      primary: '#FFFFFF',
                      secondary: '#F3F4F6',
                      gradient1: '#FFFFFF',
                      gradient2: '#F3F4F6',
                      text: '#8B5CF6'
                    }}
                  />
                </div>
                <div className="tw-bg-purple-50 tw-p-4">
                  {sections.length === 0 ? (
                    <div className="tw-text-center tw-py-8">
                      <p className="tw-text-gray-500">Belum ada section. Klik "Tambah Section" untuk memulai.</p>
                    </div>
                  ) : (
                    <div className="tw-space-y-4">
                      {sections.map((section, sectionIndex) => (
                        <div key={section.id} id={`section-${section.id}`} className="tw-border tw-border-purple-300 tw-rounded-lg tw-bg-white tw-shadow-md">
                          <div 
                            className="tw-p-4 tw-cursor-pointer tw-flex tw-justify-between tw-items-center hover:tw-bg-purple-50 tw-transition-colors tw-bg-purple-100"
                            onClick={() => toggleSection(section.id)}
                          >
                            <div className="tw-flex tw-items-center tw-gap-3">
                              <span className="tw-font-semibold tw-text-purple-800 tw-text-lg">
                                Section {sectionIndex + 1}: {section.title || 'Section Baru'}
                              </span>
                              <span className="tw-bg-purple-600 tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs">
                                {(section.topics || []).length} Topik
                              </span>
                            </div>
                            {expandedSections.has(section.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                          
                          <div className="tw-p-4 tw-border-t tw-border-purple-200"
                            style={{ display: expandedSections.has(section.id) ? 'block' : 'none' }}>
                            <div className="tw-space-y-4">
                              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-12 tw-gap-4 tw-items-end">
                                <div className="md:tw-col-span-8">
                                  <label className="tw-block tw-text-purple-700 tw-font-medium tw-mb-2">
                                    Judul Section
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Masukkan judul section"
                                    value={section.title}
                                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                                    className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-purple-300 tw-rounded-lg focus:tw-outline-none focus:tw-border-purple-500 focus:tw-ring-2 focus:tw-ring-purple-200"
                                  />
                                </div>
                                <div className="md:tw-col-span-3">
                                  <label className="tw-block tw-text-purple-700 tw-font-medium tw-mb-2">
                                    Durasi (menit)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={section.duration}
                                    onChange={(e) => updateSection(section.id, 'duration', parseInt(e.target.value) || 0)}
                                    className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-purple-300 tw-rounded-lg focus:tw-outline-none focus:tw-border-purple-500 focus:tw-ring-2 focus:tw-ring-purple-200"
                                  />
                                </div>
                                <div className="md:tw-col-span-1">
                                  <ButtonGradient
                                    action="delete"
                                    size="sm"
                                    onClick={() => deleteSection(section.id)}
                                    showText={false}
                                    className="tw-w-full"
                                  />
                                </div>
                              </div>
                              <div className="tw-mt-4">
                                <label className="tw-block tw-text-purple-700 tw-font-medium tw-mb-2">
                                  Deskripsi Section
                                </label>
                                <textarea
                                  rows={2}
                                  placeholder="Masukkan deskripsi section"
                                  value={section.description}
                                  onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-purple-300 tw-rounded-lg focus:tw-outline-none focus:tw-border-purple-500 focus:tw-ring-2 focus:tw-ring-purple-200"
                                />
                              </div>

                              <div className="tw-border-t tw-border-purple-200 tw-pt-4">
                                <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
                                  <h5 className="tw-text-purple-700 tw-font-medium tw-mb-0">Topik</h5>
                                  <ButtonGradient
                                    action="add"
                                    size="sm"
                                    onClick={() => addTopic(section.id)}
                                    customText="Tambah Topik"
                                    showText={true}
                                  />
                                </div>
                                {(section.topics || []).map((topic, topicIndex) => (
                                  <div key={topic.id} id={`topic-${topic.id}`} className="tw-border tw-border-purple-200 tw-rounded-lg tw-bg-white tw-mb-3">
                                    <div 
                                      className="tw-p-4 tw-cursor-pointer tw-flex tw-justify-between tw-items-center hover:tw-bg-purple-50 tw-transition-colors"
                                      onClick={() => toggleTopic(topic.id)}
                                    >
                                      <div className="tw-flex tw-items-center tw-gap-3">
                                        <span className="tw-font-medium tw-text-purple-800">
                                          Topik {topicIndex + 1}: {topic.title || 'Topik Baru'}
                                        </span>
                                        <span className="tw-bg-gray-500 tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs">
                                          {(topic.materials || []).length} Materi
                                        </span>
                                      </div>
                                      {expandedTopics.has(topic.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                    
                                    <div className="tw-p-4 tw-border-t tw-border-purple-200"
                                      style={{ display: expandedTopics.has(topic.id) ? 'block' : 'none' }}>
                                      <div className="tw-space-y-4">
                                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-12 tw-gap-4 tw-items-end">
                                          <div className="md:tw-col-span-10">
                                            <label className="tw-block tw-text-purple-700 tw-font-medium tw-mb-2">
                                              Judul Topik
                                            </label>
                                            <input
                                              type="text"
                                              placeholder="Masukkan judul topik"
                                              value={topic.title}
                                              onChange={(e) => updateTopic(section.id, topic.id, 'title', e.target.value)}
                                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-purple-300 tw-rounded-lg focus:tw-outline-none focus:tw-border-purple-500 focus:tw-ring-2 focus:tw-ring-purple-200"
                                            />
                                          </div>
                                          <div className="md:tw-col-span-2">
                                            <ButtonGradient
                                              action="delete"
                                              size="sm"
                                              onClick={() => deleteTopic(section.id, topic.id)}
                                              showText={false}
                                              className="tw-w-full"
                                            />
                                          </div>
                                        </div>

                                        <div className="tw-border-t tw-border-purple-200 tw-pt-4">
                                          <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
                                            <h5 className="tw-text-purple-700 tw-font-medium tw-mb-0">Materi</h5>
                                            <ButtonGradient
                                              action="add"
                                              size="sm"
                                              onClick={() => addMaterial(section.id, topic.id)}
                                              customText="Tambah Materi"
                                              showText={true}
                                            />
                                          </div>

                                          {(topic.materials || []).map((material, materialIndex) => (
                                            <div key={material.id} id={`material-${material.id}`} className="tw-mb-3 tw-border tw-border-purple-200 tw-rounded-lg">
                                              <div 
                                                className="tw-bg-white tw-p-3 tw-flex tw-justify-between tw-items-center tw-rounded-t-lg tw-cursor-pointer hover:tw-bg-purple-50 tw-transition-colors"
                                                onClick={() => toggleMaterial(material.id)}
                                              >
                                                <div className="tw-flex tw-items-center tw-gap-2">
                                                  <span className="tw-font-medium tw-text-purple-700">
                                                    Materi {materialIndex + 1}: {material.title || 'Materi Baru'}
                                                  </span>
                                                  <div className="tw-flex tw-gap-1">
                                                    {material.isMandatory && (
                                                      <span className="tw-bg-red-500 tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs">Wajib</span>
                                                    )}
                                                    {material.hasVideo && (
                                                      <span className="tw-bg-blue-500 tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs">Video</span>
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="tw-flex tw-items-center tw-gap-2">
                                                  {/* Move Up/Down Buttons */}
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      moveMaterialUp(section.id, topic.id, materialIndex);
                                                    }}
                                                    disabled={materialIndex === 0}
                                                    className={`tw-p-1 tw-rounded tw-transition-colors ${
                                                      materialIndex === 0
                                                        ? 'tw-bg-gray-200 tw-text-gray-400 tw-cursor-not-allowed'
                                                        : 'tw-bg-blue-100 tw-text-blue-600 hover:tw-bg-blue-200'
                                                    }`}
                                                    title="Naikkan urutan"
                                                  >
                                                    <ArrowUp size={16} />
                                                  </button>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      moveMaterialDown(section.id, topic.id, materialIndex, topic.materials.length);
                                                    }}
                                                    disabled={materialIndex === topic.materials.length - 1}
                                                    className={`tw-p-1 tw-rounded tw-transition-colors ${
                                                      materialIndex === topic.materials.length - 1
                                                        ? 'tw-bg-gray-200 tw-text-gray-400 tw-cursor-not-allowed'
                                                        : 'tw-bg-blue-100 tw-text-blue-600 hover:tw-bg-blue-200'
                                                    }`}
                                                    title="Turunkan urutan"
                                                  >
                                                    <ArrowDown size={16} />
                                                  </button>
                                                  {/* Move to Another Topic Button */}
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleOpenMoveModal(section.id, topic.id, material.id);
                                                    }}
                                                    className="tw-p-1 tw-rounded tw-bg-indigo-100 tw-text-indigo-600 hover:tw-bg-indigo-200 tw-transition-colors"
                                                    title="Pindahkan ke topik lain"
                                                  >
                                                    <MoveUp size={16} />
                                                  </button>
                                                  <ButtonGradient
                                                    action="delete"
                                                    size="sm"
                                                    onClick={(e) => {
                                                      e?.stopPropagation();
                                                      deleteMaterial(section.id, topic.id, material.id);
                                                    }}
                                                    showText={false}
                                                  />
                                                  {expandedMaterials.has(material.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </div>
                                              </div>
                                              
                                              <div className="tw-p-4 tw-border-t tw-border-purple-200"
                                                style={{ display: expandedMaterials.has(material.id) ? 'block' : 'none' }}>
                                                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-8 tw-gap-4 tw-mb-3">
                                                  <div className="md:tw-col-span-5">
                                                    <label className="tw-block tw-text-sm tw-text-purple-700 tw-mb-1">
                                                      Judul Materi
                                                    </label>
                                                    <input
                                                      type="text"
                                                      placeholder="Masukkan judul materi"
                                                      value={material.title}
                                                      onChange={(e) => updateMaterial(section.id, topic.id, material.id, 'title', e.target.value)}
                                                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-purple-300 tw-rounded focus:tw-outline-none focus:tw-border-purple-500 focus:tw-ring-1 focus:tw-ring-purple-200"
                                                    />
                                                  </div>
                                                  <div className="md:tw-col-span-3">
                                                    <div className="tw-space-y-2">
                                                      <label className="tw-flex tw-items-center tw-gap-2">
                                                        <input
                                                          type="checkbox"
                                                          checked={material.isMandatory}
                                                          onChange={(e) => updateMaterial(section.id, topic.id, material.id, 'isMandatory', e.target.checked)}
                                                          className="tw-text-purple-600"
                                                        />
                                                        <span className="tw-text-sm">Materi Wajib</span>
                                                      </label>
                                                      <label className="tw-flex tw-items-center tw-gap-2">
                                                        <input
                                                          type="checkbox"
                                                          checked={material.hasVideo}
                                                          onChange={(e) => updateMaterial(section.id, topic.id, material.id, 'hasVideo', e.target.checked)}
                                                          className="tw-text-purple-600"
                                                        />
                                                        <span className="tw-text-sm">Sertakan Video</span>
                                                      </label>
                                                    </div>
                                                  </div>
                                                </div>

                                                {material.hasVideo && (
                                                  <div className="tw-mb-3 tw-p-3 tw-bg-blue-50 tw-rounded tw-border tw-border-blue-200">
                                                    <div className="tw-mb-2">
                                                      <label className="tw-block tw-text-sm tw-text-blue-700 tw-mb-1">
                                                        Jenis Video
                                                      </label>
                                                      <select
                                                        value={material.videoType}
                                                        onChange={(e) => updateMaterial(section.id, topic.id, material.id, 'videoType', e.target.value as 'upload' | 'url')}
                                                        className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-blue-300 tw-rounded focus:tw-outline-none focus:tw-border-blue-500"
                                                      >
                                                        <option value="upload">Upload File</option>
                                                        <option value="url">Link URL</option>
                                                      </select>
                                                    </div>

                                                    {material.videoType === 'upload' ? (
                                                      <div>
                                                        <label className="tw-block tw-text-sm tw-text-blue-700 tw-mb-1">
                                                          Upload Video
                                                        </label>
                                                        <input
                                                          type="file"
                                                          accept="video/*"
                                                          onChange={(e) => handleVideoFileChange(section.id, topic.id, material.id, e.target.files?.[0] || null)}
                                                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-blue-300 tw-rounded focus:tw-outline-none focus:tw-border-blue-500"
                                                        />
                                                      </div>
                                                    ) : (
                                                      <div>
                                                        <label className="tw-block tw-text-sm tw-text-blue-700 tw-mb-1">
                                                          URL Video
                                                        </label>
                                                        <input
                                                          type="url"
                                                          placeholder="https://..."
                                                          value={material.videoUrl}
                                                          onChange={(e) => updateMaterial(section.id, topic.id, material.id, 'videoUrl', e.target.value)}
                                                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-blue-300 tw-rounded focus:tw-outline-none focus:tw-border-blue-500"
                                                        />
                                                      </div>
                                                    )}
                                                  </div>
                                                )}

                                                {/* Material JSON Actions with Modal */}
                                                <div className="tw-mb-3 tw-flex tw-gap-2 tw-justify-end tw-flex-wrap">
                                                  <button
                                                    onClick={() => handleCopyMaterialJSON(section.id, topic.id, material.id)}
                                                    className="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-bg-gradient-to-r tw-from-purple-500 tw-to-purple-600 tw-text-white tw-rounded-lg hover:tw-from-purple-600 hover:tw-to-purple-700 tw-transition-all tw-shadow-md hover:tw-shadow-lg tw-text-sm"
                                                    title="Copy JSON ke clipboard"
                                                  >
                                                    <Copy size={16} />
                                                    <span>Copy JSON</span>
                                                  </button>
                                                  <button
                                                    onClick={() => handleOpenPasteModal(section.id, topic.id, material.id)}
                                                    className="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-bg-gradient-to-r tw-from-indigo-500 tw-to-indigo-600 tw-text-white tw-rounded-lg hover:tw-from-indigo-600 hover:tw-to-indigo-700 tw-transition-all tw-shadow-md hover:tw-shadow-lg tw-text-sm"
                                                    title="Paste JSON dari clipboard"
                                                  >
                                                    <Clipboard size={16} />
                                                    <span>Paste JSON</span>
                                                  </button>
                                                  <ButtonGradient
                                                    action="upload"
                                                    size="sm"
                                                    onClick={() => handleImportMaterialJSON(section.id, topic.id, material.id)}
                                                    customText="Import File"
                                                    showText={true}
                                                    customColors={{
                                                      primary: '#06B6D4',
                                                      secondary: '#0891B2',
                                                      gradient1: '#06B6D4',
                                                      gradient2: '#0891B2',
                                                      text: '#FFFFFF'
                                                    }}
                                                  />
                                                  <ButtonGradient
                                                    action="download"
                                                    size="sm"
                                                    onClick={() => handleExportMaterialJSON(section.id, topic.id, material.id)}
                                                    customText="Export File"
                                                    showText={true}
                                                    customColors={{
                                                      primary: '#10B981',
                                                      secondary: '#059669',
                                                      gradient1: '#10B981',
                                                      gradient2: '#059669',
                                                      text: '#FFFFFF'
                                                    }}
                                                  />
                                                </div>

                                                <div className="tw-mb-3">
                                                  <label className="tw-block tw-text-sm tw-text-purple-700 tw-mb-2">
                                                    Konten Materi
                                                  </label>
                                                  <SuperEditor
                                                    key={`editor-${section.id}-${topic.id}-${material.id}-${material.content.substring(0, 20)}`}
                                                    onChange={handleEditorChange(section.id, topic.id, material.id)}
                                                    initialValue={material.content || '<p>Mulai mengetik pembahasan disini...</p>'}
                                                    editorId={`material-${material.id}`}
                                                  />
                                                </div>

                                                <div className="tw-mt-3">
                                                  <h6 className="tw-text-sm tw-text-purple-700 tw-mb-2">Preview Konten</h6>
                                                  <div 
                                                    className="tw-border tw-border-purple-300 tw-bg-white tw-p-3 tw-rounded tw-min-h-[100px] tw-max-h-[200px] tw-overflow-auto"
                                                    dangerouslySetInnerHTML={{ __html: material.content }}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>

                                        {/* Quiz and Drill Section */}
                                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-border-t tw-border-purple-200 tw-pt-4">
                                          {/* Quiz Section */}
                                          <div className="tw-border tw-border-orange-300 tw-rounded-lg">
                                            <div className="tw-bg-orange-500 tw-text-white tw-p-3 tw-rounded-t-lg">
                                              <h6 className="tw-mb-0 tw-font-medium">Quiz ({((topic.quiz && topic.quiz.questions) || []).length} soal)</h6>
                                            </div>
                                            <div className="tw-bg-orange-50 tw-p-3 tw-space-y-3">
                                              <div>
                                                <label className="tw-block tw-text-sm tw-text-orange-700 tw-mb-1">
                                                  Cari Soal Quiz
                                                </label>
                                                <input
                                                  type="text"
                                                  placeholder="Ketik untuk mencari soal..."
                                                  onChange={(e) => {
                                                    const value = e.target.value;
                                                    clearTimeout((window as any).quizSearchTimeout);
                                                    (window as any).quizSearchTimeout = setTimeout(() => {
                                                      searchQuestions(value, topic.id, 'quiz');
                                                    }, 300);
                                                  }}
                                                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-orange-300 tw-rounded focus:tw-outline-none focus:tw-border-orange-500 tw-text-sm"
                                                />
                                              </div>

                                              {questionSearchResults[`${topic.id}-quiz`] && questionSearchResults[`${topic.id}-quiz`].length > 0 && (
                                                <div className="tw-max-h-32 tw-overflow-y-auto tw-border tw-border-orange-200 tw-rounded">
                                                  {questionSearchResults[`${topic.id}-quiz`].map(question => (
                                                    <div 
                                                      key={question.id} 
                                                      className="tw-p-2 tw-border-b tw-border-orange-100 tw-flex tw-justify-between tw-items-center tw-bg-white hover:tw-bg-orange-50 tw-cursor-pointer"
                                                      onClick={() => {
                                                        if (!((topic.quiz && topic.quiz.questions) || []).find(q => q.id === question.id)) {
                                                          addQuestionToTopic(section.id, topic.id, 'quiz', question.id, question.code);
                                                        }
                                                      }}
                                                    >
                                                      <span className="tw-text-sm tw-text-orange-800">{question.id} - {question.code}</span>
                                                      {((topic.quiz && topic.quiz.questions) || []).find(q => q.id === question.id) && (
                                                        <span className="tw-text-xs tw-bg-orange-200 tw-text-orange-800 tw-px-2 tw-py-1 tw-rounded">Sudah dipilih</span>
                                                      )}
                                                    </div>
                                                  ))}
                                                </div>
                                              )}

                                              {questionSearchLoading[`${topic.id}-quiz`] && (
                                                <div className="tw-text-center tw-text-sm tw-text-orange-600">Mencari soal...</div>
                                              )}

                                              <div>
                                                <label className="tw-block tw-text-sm tw-text-orange-700 tw-mb-2">
                                                  Soal yang Dipilih
                                                </label>
                                                {((topic.quiz && topic.quiz.questions) || []).length === 0 ? (
                                                  <div className="tw-text-sm tw-text-gray-500 tw-italic">Belum ada soal dipilih</div>
                                                ) : (
                                                  <div className="tw-space-y-1">
                                                    {((topic.quiz && topic.quiz.questions) || []).map(question => (
                                                      <div key={question.id} className="tw-flex tw-justify-between tw-items-center tw-bg-white tw-p-2 tw-rounded tw-border tw-border-orange-200">
                                                        <span className="tw-text-sm tw-text-orange-800">{question.id} - {question.code}</span>
                                                        <ButtonGradient
                                                          action="delete"
                                                          size="sm"
                                                          onClick={() => removeQuestionFromTopic(section.id, topic.id, 'quiz', question.id)}
                                                          showText={false}
                                                          customColors={{
                                                            primary: '#EF4444',
                                                            secondary: '#DC2626',
                                                            gradient1: '#EF4444',
                                                            gradient2: '#DC2626',
                                                            text: '#FFFFFF'
                                                          }}
                                                        />
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Drill Section */}
                                          <div className="tw-border tw-border-green-300 tw-rounded-lg">
                                            <div className="tw-bg-green-500 tw-text-white tw-p-3 tw-rounded-t-lg">
                                              <h6 className="tw-mb-0 tw-font-medium">Drill ({((topic.drill && topic.drill.questions) || []).length} soal)</h6>
                                            </div>
                                            <div className="tw-bg-green-50 tw-p-3 tw-space-y-3">
                                              <div>
                                                <label className="tw-block tw-text-sm tw-text-green-700 tw-mb-1">
                                                  Cari Soal Drill
                                                </label>
                                                <input
                                                  type="text"
                                                  placeholder="Ketik untuk mencari soal..."
                                                  onChange={(e) => {
                                                    const value = e.target.value;
                                                    clearTimeout((window as any).drillSearchTimeout);
                                                    (window as any).drillSearchTimeout = setTimeout(() => {
                                                      searchQuestions(value, topic.id, 'drill');
                                                    }, 300);
                                                  }}
                                                  className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-green-300 tw-rounded focus:tw-outline-none focus:tw-border-green-500 tw-text-sm"
                                                />
                                              </div>

                                              {questionSearchResults[`${topic.id}-drill`] && questionSearchResults[`${topic.id}-drill`].length > 0 && (
                                                <div className="tw-max-h-32 tw-overflow-y-auto tw-border tw-border-green-200 tw-rounded">
                                                  {questionSearchResults[`${topic.id}-drill`].map(question => (
                                                    <div 
                                                      key={question.id} 
                                                      className="tw-p-2 tw-border-b tw-border-green-100 tw-flex tw-justify-between tw-items-center tw-bg-white hover:tw-bg-green-50 tw-cursor-pointer"
                                                      onClick={() => {
                                                        if (!((topic.drill && topic.drill.questions) || []).find(q => q.id === question.id)) {
                                                          addQuestionToTopic(section.id, topic.id, 'drill', question.id, question.code);
                                                        }
                                                      }}
                                                    >
                                                      <span className="tw-text-sm tw-text-green-800">{question.id} - {question.code}</span>
                                                      {((topic.drill && topic.drill.questions) || []).find(q => q.id === question.id) && (
                                                        <span className="tw-text-xs tw-bg-green-200 tw-text-green-800 tw-px-2 tw-py-1 tw-rounded">Sudah dipilih</span>
                                                      )}
                                                    </div>
                                                  ))}
                                                </div>
                                              )}

                                              {questionSearchLoading[`${topic.id}-drill`] && (
                                                <div className="tw-text-center tw-text-sm tw-text-green-600">Mencari soal...</div>
                                              )}

                                              <div>
                                                <label className="tw-block tw-text-sm tw-text-green-700 tw-mb-2">
                                                  Soal yang Dipilih
                                                </label>
                                                {((topic.drill && topic.drill.questions) || []).length === 0 ? (
                                                  <div className="tw-text-sm tw-text-gray-500 tw-italic">Belum ada soal dipilih</div>
                                                ) : (
                                                  <div className="tw-space-y-1">
                                                    {((topic.drill && topic.drill.questions) || []).map(question => (
                                                      <div key={question.id} className="tw-flex tw-justify-between tw-items-center tw-bg-white tw-p-2 tw-rounded tw-border tw-border-green-200">
                                                        <span className="tw-text-sm tw-text-green-800">{question.id} - {question.code}</span>
                                                        <ButtonGradient
                                                          action="delete"
                                                          size="sm"
                                                          onClick={() => removeQuestionFromTopic(section.id, topic.id, 'drill', question.id)}
                                                          showText={false}
                                                          customColors={{
                                                            primary: '#EF4444',
                                                            secondary: '#DC2626',
                                                            gradient1: '#EF4444',
                                                            gradient2: '#DC2626',
                                                            text: '#FFFFFF'
                                                          }}
                                                        />
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="tw-text-center tw-pt-6">
                <ButtonGradient
                  action="save"
                  size="lg"
                  onClick={saveCourse}
                  disabled={isSaving}
                  loading={isSaving}
                  customText={isSaving ? 'Menyimpan...' : 'Simpan Course'}
                  showText={true}
                  customColors={{
                    primary: '#8B5CF6',
                    secondary: '#7C3AED',
                    gradient1: '#8B5CF6',
                    gradient2: '#7C3AED',
                    text: '#FFFFFF'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateCourse;