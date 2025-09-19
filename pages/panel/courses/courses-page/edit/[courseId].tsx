// pages/panel/courses/courses-page/edit/[courseId].tsx - COMPLETE IMPLEMENTATION
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp, Plus, Trash2, Eye, EyeOff, Upload, Link, Play, Menu, X, ChevronRight, Download, Save, Clock } from 'lucide-react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import MainLayout from '../../../../../components/layout/DashboardLayout';
import { ButtonGradient } from '../../../../../components/button/ButtonTemplate';
import { courseDB, exportCourseToJSON, importCourseFromJSON, downloadJSONFile, type CourseAutoSaveData } from '../../../../../utils/courseIndexedDB';

// Dynamic imports
const SuperEditor = dynamic(() => import('../../../../../components/supereditor/SuperEditor'), { 
  ssr: false,
  loading: () => <div className="tw-p-4 tw-text-center tw-text-purple-600">Memuat editor...</div>
});

const PreviewComponent = dynamic(() => import('../create/PreviewComponent'), { 
  ssr: false,
  loading: () => <div className="tw-p-4 tw-text-center tw-text-purple-600">Memuat preview...</div>
});

const Sidebar = dynamic(() => import('../create/Sidebar'), { 
  ssr: false,
  loading: () => <div className="tw-p-4 tw-text-center tw-text-purple-600">Memuat sidebar...</div>
});

// TypeScript interfaces
interface Question {
  id: number;
  code: string;
}

interface QuizDrill {
  examId: number;
  questions: Question[];
}

interface Material {
  id: number;
  title: string;
  isMandatory: boolean;
  hasVideo: boolean;
  videoType: 'upload' | 'url';
  videoFile: File | null;
  videoUrl: string;
  content: string;
  videoFileName?: string | null;
}

interface Topic {
  id: number;
  title: string;
  materials: Material[];
  quiz: QuizDrill;
  drill: QuizDrill;
}

interface Section {
  id: number;
  title: string;
  description: string;
  duration: number;
  durasi?: number; // For backward compatibility
  topics: Topic[];
}

interface CourseData {
  title: string;
  description: string;
  imageurl: string;
  learningPoint: string[];
  sections: Section[];
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

const EditCourse: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params?.courseId as string;
  const isImporting = searchParams?.get('import') === 'true';

  // State declarations with proper types
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Autosave states
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutosaving, setIsAutosaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const AUTOSAVE_KEY = courseId; // Use courseId as the key for editing
  const AUTOSAVE_INTERVAL = 30000; // 30 seconds

  // API URL from environment
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        mode: 'edit',
        courseId
      };
      
      await courseDB.saveAutosave(AUTOSAVE_KEY, data);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      console.log('Autosave successful (Edit):', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Autosave failed:', error);
    } finally {
      setIsAutosaving(false);
    }
  }, [courseTitle, courseDescription, courseImageUrl, learningPoints, sections, courseId, AUTOSAVE_KEY, mounted]);

  // Load from autosave
  const loadFromAutosave = useCallback(async (): Promise<void> => {
    try {
      const saved = await courseDB.getAutosave(AUTOSAVE_KEY);
      if (saved) {
        setCourseTitle(saved.courseTitle);
        setCourseDescription(saved.courseDescription);
        setCourseImageUrl(saved.courseImageUrl);
        setLearningPoints(saved.learningPoints);
        setSections(saved.sections);
        setLastSaved(new Date(saved.lastSaved));
        console.log('Loaded from autosave (Edit):', new Date(saved.lastSaved).toLocaleTimeString());
      }
    } catch (error) {
      console.error('Failed to load from autosave:', error);
    }
  }, [AUTOSAVE_KEY]);

  // Import from JSON
  const importFromJSON = useCallback(async (): Promise<void> => {
    try {
      const importedData = sessionStorage.getItem('importedCourseData');
      if (importedData) {
        sessionStorage.removeItem('importedCourseData');
        
        const parsed = importCourseFromJSON(importedData);
        if (parsed) {
          setCourseTitle(parsed.courseTitle);
          setCourseDescription(parsed.courseDescription);
          setCourseImageUrl(parsed.courseImageUrl);
          setLearningPoints(parsed.learningPoints);
          setSections(parsed.sections);
          setHasUnsavedChanges(true);
          
          // Save imported data to autosave
          await courseDB.saveAutosave(AUTOSAVE_KEY, {
            courseTitle: parsed.courseTitle,
            courseDescription: parsed.courseDescription,
            courseImageUrl: parsed.courseImageUrl,
            learningPoints: parsed.learningPoints,
            sections: parsed.sections,
            mode: 'edit',
            courseId
          });
          
          alert('Data berhasil diimport dari JSON!');
        } else {
          alert('Format JSON tidak valid atau data corrupt.');
        }
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Gagal mengimport data JSON.');
    }
  }, [AUTOSAVE_KEY, courseId]);

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async (): Promise<void> => {
      try {
        setMounted(true);
        await courseDB.init();

        if (isImporting) {
          await importFromJSON();
        } else {
          // Try to load from autosave first
          const autosaveData = await courseDB.getAutosave(AUTOSAVE_KEY);
          if (autosaveData) {
            // Ask user if they want to restore from autosave
            if (confirm('Ditemukan data autosave. Apakah ingin melanjutkan dari data autosave?')) {
              await loadFromAutosave();
              setIsLoading(false);
              return;
            }
          }

          // Load from server
          const response = await axios.get(`${API_URL}/courses/detail/${courseId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          });
          
          const courseData: CourseData = response.data.data;
          setCourseTitle(courseData.title || '');
          setCourseDescription(courseData.description || '');
          setCourseImageUrl(courseData.imageurl || '');
          setLearningPoints(courseData.learningPoint || []);
          setSections(
            courseData.sections.map((section: any) => ({
              ...section,
              duration: section.durasi || section.duration || 0,
              topics: section.topics.map((topic: any) => ({
                ...topic,
                materials: topic.materials.map((material: any) => ({
                  ...material,
                  content: material.content || '<p>Mulai menulis konten materi...</p>',
                  videoFile: null,
                })),
                quiz: topic.quiz || { examId: Date.now(), questions: [] },
                drill: topic.drill || { examId: Date.now(), questions: [] },
              })),
            }))
          );
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching course data:', error);
        alert('Gagal memuat data course');
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, API_URL, isImporting, importFromJSON, loadFromAutosave, AUTOSAVE_KEY]);

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
        mode: 'edit',
        courseId,
        lastSaved: Date.now()
      };
      
      const jsonString = exportCourseToJSON(data);
      const timestamp = new Date().getTime();
      const filename = `course_edit_${courseId}_${timestamp}.json`;
      
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
                setCourseTitle(parsed.courseTitle);
                setCourseDescription(parsed.courseDescription);
                setCourseImageUrl(parsed.courseImageUrl);
                setLearningPoints(parsed.learningPoints);
                setSections(parsed.sections);
                setHasUnsavedChanges(true);
                
                // Save imported data to autosave
                await courseDB.saveAutosave(AUTOSAVE_KEY, {
                  courseTitle: parsed.courseTitle,
                  courseDescription: parsed.courseDescription,
                  courseImageUrl: parsed.courseImageUrl,
                  learningPoints: parsed.learningPoints,
                  sections: parsed.sections,
                  mode: 'edit',
                  courseId
                });
                
                alert('Data berhasil diimport dari JSON!');
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

  // Clear autosave
  const handleClearAutosave = async (): Promise<void> => {
    if (confirm('Hapus data autosave? Data yang belum disimpan akan hilang.')) {
      try {
        await courseDB.deleteAutosave(AUTOSAVE_KEY);
        setLastSaved(null);
        setHasUnsavedChanges(false);
        alert('Data autosave berhasil dihapus.');
        // Reload from server
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear autosave:', error);
        alert('Gagal menghapus data autosave.');
      }
    }
  };

  // All the course management functions (same as create page)
  const addLearningPoint = (): void => {
    setLearningPoints([...learningPoints, '']);
  };

  const updateLearningPoint = (index: number, value: string): void => {
    setLearningPoints(learningPoints.map((point, i) => (i === index ? value : point)));
  };

  const deleteLearningPoint = (index: number): void => {
    setLearningPoints(learningPoints.filter((_, i) => i !== index));
  };

  const addSection = (): void => {
    setSections([
      ...sections,
      {
        id: Date.now(),
        title: '',
        description: '',
        duration: 0,
        topics: [],
      },
    ]);
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
            topics: [
              ...section.topics,
              {
                id: Date.now(),
                title: '',
                materials: [],
                quiz: { examId: Date.now(), questions: [] },
                drill: { examId: Date.now(), questions: [] },
              },
            ],
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
            ),
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
                    materials: [
                      ...topic.materials,
                      {
                        id: Date.now(),
                        title: '',
                        isMandatory: false,
                        hasVideo: false,
                        videoType: 'upload',
                        videoFile: null,
                        videoUrl: '',
                        content: '<p>Mulai menulis konten materi...</p>',
                      },
                    ],
                  }
                : topic
            ),
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
            ),
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
                    ),
                  }
                : topic
            ),
          }
        : section
    ));
  };

  const searchQuestions = async (searchTerm: string, topicId: number, type: 'quiz' | 'drill'): Promise<void> => {
    if (!searchTerm.trim()) {
      setQuestionSearchResults(prev => ({
        ...prev,
        [`${topicId}-${type}`]: [],
      }));
      return;
    }

    const key = `${topicId}-${type}`;
    setQuestionSearchLoading(prev => ({ ...prev, [key]: true }));

    try {
      const response = await axios.get(`${API_URL}/questions/search`, {
        params: { search: searchTerm },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      setQuestionSearchResults(prev => ({
        ...prev,
        [key]: response.data.data || [],
      }));
    } catch (error) {
      console.error('Error searching questions:', error);
      setQuestionSearchResults(prev => ({
        ...prev,
        [key]: [],
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
                      questions: [...(topic[type].questions || []), { id: questionId, code: questionCode }],
                    },
                  }
                : topic
            ),
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
                      questions: (topic[type].questions || []).filter(q => q.id !== questionId),
                    },
                  }
                : topic
            ),
          }
        : section
    ));
  };

  const handleVideoFileChange = (sectionId: number, topicId: number, materialId: number, file: File | null): void => {
    updateMaterial(sectionId, topicId, materialId, 'videoFile', file);
  };

  const handleEditorChange = (sectionId: number, topicId: number, materialId: number) => (content: string): void => {
    updateMaterial(sectionId, topicId, materialId, 'content', content);
  };

  const scrollToElement = (elementId: string): void => {
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
    if (!validateCourseData()) {
      return;
    }

    setIsSaving(true);

    try {
      // Prepare data as JSON object
      const courseData = {
        title: courseTitle.trim(),
        description: courseDescription.trim(),
        imageUrl: courseImageUrl.trim(),
        learningPoint: learningPoints.filter(point => point.trim().length > 0),
        sections: sections.map(section => ({
          id: section.id,
          title: section.title.trim(),
          description: section.description.trim(),
          durasi: section.duration,
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
              videoFileName: material.videoFile ? material.videoFile.name : material.videoFileName
            })),
            quiz: {
              examId: topic.quiz.examId || null,
              questions: topic.quiz.questions || []
            },
            drill: {
              examId: topic.drill.examId || null,
              questions: topic.drill.questions || []
            }
          }))
        }))
      };
      
      console.log('=== SENDING EDIT COURSE DATA ===');
      console.log('Course ID:', courseId);
      console.log('Course Data:', JSON.stringify(courseData, null, 2));
      
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        alert('Token autentikasi tidak ditemukan. Silakan login ulang.');
        return;
      }

      const response = await axios.put(`${API_URL}/courses/detail/${courseId}`, courseData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      alert('Course berhasil diperbarui!');
      console.log('Course updated:', response.data);
      
      // Clear autosave after successful save
      await courseDB.deleteAutosave(AUTOSAVE_KEY);
      setLastSaved(null);
      setHasUnsavedChanges(false);
      
    } catch (error: any) {
      console.error('=== ERROR UPDATING COURSE ===');
      console.error('Full Error:', error);
      console.error('Response Data:', error.response?.data);
      console.error('Response Status:', error.response?.status);
      console.error('Request Config:', error.config);
      
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memperbarui course';
      alert(`Gagal memperbarui course: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Global timeout variables declaration
  declare global {
    interface Window {
      quizSearchTimeout?: NodeJS.Timeout;
      drillSearchTimeout?: NodeJS.Timeout;
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="tw-flex tw-min-h-screen tw-bg-gray-50 tw-items-center tw-justify-center">
          <div className="tw-text-center">
            <div className="tw-animate-spin tw-rounded-full tw-h-32 tw-w-32 tw-border-b-2 tw-border-purple-600 tw-mx-auto"></div>
            <p className="tw-text-purple-600 tw-mt-4 tw-text-lg">Memuat data course...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="tw-flex tw-min-h-screen tw-bg-gray-50">
        <div className="tw-flex-1 tw-mx-4 tw-py-8 tw-px-4 md:tw-px-8 tw-max-w-none">
          <div className="tw-mb-6">
            <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-mb-4 tw-gap-4">
              <div>
                <h1 className="tw-text-3xl tw-font-bold tw-text-purple-800">
                  Edit Course: {courseTitle || 'Loading...'}
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
              Edit dan atur konten course dengan topik, materi, quiz, dan drill
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

          {previewMode ? (
            <PreviewComponent
              courseTitle={courseTitle}
              courseDescription={courseDescription}
              courseImageUrl={courseImageUrl}
              learningPoints={learningPoints}
              sections={sections}
            />
          ) : (
            <div className="tw-space-y-6">
              {/* Course Information Section */}
              <div className="tw-border tw-border-purple-300 tw-rounded-lg tw-shadow-lg">
                <div className="tw-bg-purple-600 tw-text-white tw-p-4 tw-rounded-t-lg">
                  <h3 className="tw-text-xl tw-font-semibold tw-mb-0">Informasi Course</h3>
                </div>
                <div className="tw-bg-purple-50 tw-p-4">
                  <div className="tw-grid tw-grid-cols-1 tw-gap-4 tw-mb-4">
                    <div>
                      <label className="tw-block tw-text-purple-700 tw-font-medium tw-mb-2">Judul Course</label>
                      <input
                        type="text"
                        placeholder="Masukkan judul course"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-purple-300 tw-rounded-lg focus:tw-outline-none focus:tw-border-purple-500 focus:tw-ring-2 focus:tw-ring-purple-200"
                      />
                    </div>
                  </div>
                  <div className="tw-mb-4">
                    <label className="tw-block tw-text-purple-700 tw-font-medium tw-mb-2">Deskripsi Course</label>
                    <textarea
                      rows={3}
                      placeholder="Masukkan deskripsi course"
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-purple-300 tw-rounded-lg focus:tw-outline-none focus:tw-border-purple-500 focus:tw-ring-2 focus:tw-ring-purple-200"
                    />
                  </div>
                  <div className="tw-mb-4">
                    <label className="tw-block tw-text-purple-700 tw-font-medium tw-mb-2">Image URL</label>
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
                      <label className="tw-block tw-text-purple-700 tw-font-medium">Learning Points</label>
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

              {/* COMPLETE SECTIONS IMPLEMENTATION - Same as Create but for Edit */}
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
                                {section.topics.length} Topik
                              </span>
                            </div>
                            {expandedSections.has(section.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>

                          {expandedSections.has(section.id) && (
                            <div className="tw-p-4 tw-border-t tw-border-purple-200">
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
                                  {section.topics.map((topic, topicIndex) => (
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
                                            {topic.materials.length} Materi
                                          </span>
                                        </div>
                                        {expandedTopics.has(topic.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                      </div>

                                      {expandedTopics.has(topic.id) && (
                                        <div className="tw-p-4 tw-border-t tw-border-purple-200">
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

                                              {topic.materials.map((material, materialIndex) => (
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

                                                  {expandedMaterials.has(material.id) && (
                                                    <div className="tw-p-4 tw-border-t tw-border-purple-200">
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

                                                      <div className="tw-mb-3">
                                                        <label className="tw-block tw-text-sm tw-text-purple-700 tw-mb-2">
                                                          Konten Materi
                                                        </label>
                                                        <SuperEditor
                                                          key={`${topic.id}-${material.id}`}
                                                          onChange={handleEditorChange(section.id, topic.id, material.id)}
                                                          initialValue={material.content}
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
                                                  )}
                                                </div>
                                              ))}
                                            </div>

                                            {/* Quiz and Drill Sections - Same as Create */}
                                            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-border-t tw-border-purple-200 tw-pt-4">
                                              <div className="tw-border tw-border-orange-300 tw-rounded-lg">
                                                <div className="tw-bg-orange-500 tw-text-white tw-p-3 tw-rounded-t-lg">
                                                  <h6 className="tw-mb-0 tw-font-medium">Quiz ({(topic.quiz.questions || []).length} soal)</h6>
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
                                                        if (typeof window !== 'undefined') {
                                                          clearTimeout(window.quizSearchTimeout);
                                                          window.quizSearchTimeout = setTimeout(() => {
                                                            searchQuestions(value, topic.id, 'quiz');
                                                          }, 300);
                                                        }
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
                                                            if (!(topic.quiz.questions || []).find(q => q.id === question.id)) {
                                                              addQuestionToTopic(section.id, topic.id, 'quiz', question.id, question.code);
                                                            }
                                                          }}
                                                        >
                                                          <span className="tw-text-sm tw-text-orange-800">{question.id} - {question.code}</span>
                                                          {(topic.quiz.questions || []).find(q => q.id === question.id) && (
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
                                                    {(topic.quiz.questions || []).length === 0 ? (
                                                      <div className="tw-text-sm tw-text-gray-500 tw-italic">Belum ada soal dipilih</div>
                                                    ) : (
                                                      <div className="tw-space-y-1">
                                                        {(topic.quiz.questions || []).map(question => (
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

                                              <div className="tw-border tw-border-green-300 tw-rounded-lg">
                                                <div className="tw-bg-green-500 tw-text-white tw-p-3 tw-rounded-t-lg">
                                                  <h6 className="tw-mb-0 tw-font-medium">Drill ({(topic.drill.questions || []).length} soal)</h6>
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
                                                        if (typeof window !== 'undefined') {
                                                          clearTimeout(window.drillSearchTimeout);
                                                          window.drillSearchTimeout = setTimeout(() => {
                                                            searchQuestions(value, topic.id, 'drill');
                                                          }, 300);
                                                        }
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
                                                            if (!(topic.drill.questions || []).find(q => q.id === question.id)) {
                                                              addQuestionToTopic(section.id, topic.id, 'drill', question.id, question.code);
                                                            }
                                                          }}
                                                        >
                                                          <span className="tw-text-sm tw-text-green-800">{question.id} - {question.code}</span>
                                                          {(topic.drill.questions || []).find(q => q.id === question.id) && (
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
                                                    {(topic.drill.questions || []).length === 0 ? (
                                                      <div className="tw-text-sm tw-text-gray-500 tw-italic">Belum ada soal dipilih</div>
                                                    ) : (
                                                      <div className="tw-space-y-1">
                                                        {(topic.drill.questions || []).map(question => (
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
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
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
                  customText={isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
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
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EditCourse;