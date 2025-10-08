// pages/section/[sectionCode].tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, ProgressBar, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { 
  BookOpen, 
  FileText, 
  CheckSquare, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Play,
  Menu,
  X,
  Clock,
  Check,
  Trophy,
  Star,
  Heart,
  BookMarked,
  ChevronsLeft,
  Target,
  Zap,
  ArrowLeftFromLine,
  Lock,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Script from 'next/script';
import ExamModal from '../try-out/ExamModal';
import DrillModal from '../drill/DrillModal';
import NavigationBar from '../../components/layout/NavigationBar';

interface Material {
  id: number;
  title: string;
  isMandatory: boolean;
  hasVideo: boolean;
  position: number;
  is_completed: boolean;
  isAccessible: boolean;
}

interface MaterialDetail {
  id: number;
  title: string;
  content: string;
  is_mandatory: boolean;
  has_video: boolean;
  video_type: 'upload' | 'url';
  video_url: string | null;
}

interface Quiz {
  title: string;
  quiz_id: number;
  quiz_completed: boolean;
  quiz_question_count: number;
}

interface Drill {
  title: string;
  drill_id: number;
  drill_completed: boolean;
  drill_question_count: number;
}

interface Topic {
  id: number;
  position: number;
  title: string;
  quizId: number;
  drillId: number;
  quizQuestionCount: number;
  drillQuestionCount: number;
  quizCompleted: boolean;
  drillCompleted: boolean;
  quizAccessible: boolean;
  drillAccessible: boolean;
  materials: Material[];
  quiz: Quiz;
  drill: Drill;
}

interface Section {
  id: number;
  code: string;
  title: string;
  description?: string;
  duration?: number;
  topics: Topic[];
  sectionPosition: number;
  courseTitle: string;
  courseString: string;
  isEntitled: boolean;
}

interface ApiResponse {
  message: string;
  data: {
    courseTitle: string;
    courseString: string;
    sectionId: number;
    sectionTitle: string;
    sectionDescription: string;
    durasi: number;
    sectionPosition: number;
    isEntitled: boolean;
    topics: {
      id: number;
      title: string;
      position: number;
      quiz_id: number;
      drill_id: number;
      quiz_question_count: number;
      drill_question_count: number;
      quiz_completed: boolean;
      drill_completed: boolean;
      quiz_accessible: boolean;
      drill_accessible: boolean;
      materials: {
        id: number;
        title: string;
        is_mandatory: boolean;
        has_video: boolean;
        position: number;
        is_completed: boolean;
        is_accessible: boolean;
      }[];
    }[];
  };
}

interface MaterialDetailResponse {
  material: {
    id: number;
    topic_id: number;
    title: string;
    content: string;
    is_mandatory: boolean;
    has_video: boolean;
    video_type: 'upload' | 'url';
    video_url: string | null;
    video_file_name: string | null;
    position: number;
    create_date: string;
    create_user_id: number;
    update_date: string | null;
    update_user_id: number | null;
    is_finish: boolean;
  };
}

// IndexedDB helper functions
const DB_NAME = 'TrackingDB';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';

function openTrackingDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

function saveSessionToIndexedDB(record: { material_id: number; topic_id: number; start_time: string; elapsed_time: number; }): Promise<void> {
  return openTrackingDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  });
}

const SectionPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const sectionCode = params?.sectionCode as string;
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<'material' | 'quiz' | 'drill' | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [completedMaterials, setCompletedMaterials] = useState<Set<number>>(new Set());
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<number>>(new Set());
  const [completedDrills, setCompletedDrills] = useState<Set<number>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [markingLoading, setMarkingLoading] = useState<boolean>(false);
  const [markingError, setMarkingError] = useState<string | null>(null);
  const [markingSuccess, setMarkingSuccess] = useState<boolean>(false);
  const [materialDetail, setMaterialDetail] = useState<MaterialDetail | null>(null);
  const [loadingMaterial, setLoadingMaterial] = useState<boolean>(false);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [codeHandlerLoaded, setCodeHandlerLoaded] = useState(false);
  
  // State untuk cart
  const [showCartModal, setShowCartModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // Tracking state via refs
  const trackingRef = useRef<{
    materialId: number | null;
    topicId: number | null;
    startTime: Date | null;
    elapsedTime: number;
    intervalId: number | null;
  }>({
    materialId: null,
    topicId: null,
    startTime: null,
    elapsedTime: 0,
    intervalId: null
  });

  // State untuk modals
  const [showExamModal, setShowExamModal] = useState(false);
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [examType, setExamType] = useState<'quiz' | 'drill' | null>(null);
  const [examId, setExamId] = useState<number | null>(null);
  const [currentTopicId, setCurrentTopicId] = useState<number | null>(null);

  // Ref untuk content area agar bisa reinitialize practice questions
  const contentRef = useRef<HTMLDivElement>(null);

  // Cek resolusi untuk sidebar
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth < 992) {
        setSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reinitialize practice questions ketika content berubah
useEffect(() => {
  if (codeHandlerLoaded && materialDetail?.content) {
    // Delay sedikit untuk memastikan DOM sudah terupdate
    setTimeout(() => {
      if (window.CodeCloseOpenHandler) {
        console.log('Reinitializing CodeCloseOpenHandler...');
        window.CodeCloseOpenHandler.reinit(contentRef.current);
      }
    }, 100);
  }
}, [materialDetail?.content, codeHandlerLoaded]);

  // Fetch detail materi saat selectedMaterialId berubah
  useEffect(() => {
    const fetchMaterialDetail = async () => {
      if (!selectedMaterialId) return;

      try {
        setLoadingMaterial(true);
        setMaterialError(null);

        const authToken = localStorage.getItem('authToken');

        const response = await axios.get<MaterialDetailResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/userCourse/materials/${selectedMaterialId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const materialData = response.data.material;
        const transformedMaterial: MaterialDetail = {
          id: materialData.id,
          title: materialData.title,
          content: materialData.content,
          is_mandatory: materialData.is_mandatory,
          has_video: materialData.has_video,
          video_type: materialData.video_type,
          video_url: materialData.video_url,
        };

        setMaterialDetail(transformedMaterial);
      } catch (err: any) {
        console.error('Error fetching material detail:', err);
        setMaterialError(
          err.response?.data?.message ||
          err.message ||
          'Gagal memuat detail materi. Silakan coba lagi.'
        );
      } finally {
        setLoadingMaterial(false);
      }
    };
    
    fetchMaterialDetail();
  }, [selectedMaterialId]);

  // Fetch data section awal
  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const headers: Record<string,string> = {};
        const token = localStorage.getItem('authToken');
        if (token) headers.Authorization = `Bearer ${token}`;
        
        const response = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/userCourse/sections/${sectionCode}`,
          { headers }
        );
        
        const data = response.data;
        const sectionData = data.data;
        const transformedSection: Section = {
          id: sectionData.sectionId,
          code: sectionCode || '',
          title: sectionData.sectionTitle,
          description: sectionData.sectionDescription,
          duration: sectionData.durasi,
          sectionPosition: sectionData.sectionPosition,
          courseTitle: sectionData.courseTitle,
          courseString: sectionData.courseString,
          isEntitled: sectionData.isEntitled,
          topics: sectionData.topics.map(topic => ({
            id: topic.id,
            title: topic.title,
            position: topic.position,
            quizId: topic.quiz_id,
            drillId: topic.drill_id,
            quizQuestionCount: topic.quiz_question_count,
            drillQuestionCount: topic.drill_question_count,
            quizCompleted: topic.quiz_completed,
            drillCompleted: topic.drill_completed,
            quizAccessible: topic.quiz_accessible,
            drillAccessible: topic.drill_accessible,
            materials: topic.materials.map(material => ({
              id: material.id,
              title: material.title,
              isMandatory: material.is_mandatory,
              hasVideo: material.has_video,
              position: material.position,
              is_completed: material.is_completed,
              isAccessible: material.is_accessible
            })),
            quiz: {
              title: `Quiz: ${topic.title}`,
              quiz_id: topic.quiz_id,
              quiz_completed: topic.quiz_completed,
              quiz_question_count: topic.quiz_question_count
            },
            drill: {
              title: `Drill: ${topic.title}`,
              drill_id: topic.drill_id,
              drill_completed: topic.drill_completed,
              drill_question_count: topic.drill_question_count
            }
          }))
        };
        
        setSelectedSection(transformedSection);
        const completedMaterialsSet = new Set<number>();
        const completedQuizzesSet = new Set<number>();
        const completedDrillsSet = new Set<number>();
        
        transformedSection.topics.forEach(topic => {
          topic.materials.forEach(material => {
            if (material.is_completed) {
              completedMaterialsSet.add(material.id);
            }
          });
          
          if (topic.quiz.quiz_completed) {
            completedQuizzesSet.add(topic.id);
          }
          
          if (topic.drill.drill_completed) {
            completedDrillsSet.add(topic.id);
          }
        });
        
        setCompletedMaterials(completedMaterialsSet);
        setCompletedQuizzes(completedQuizzesSet);
        setCompletedDrills(completedDrillsSet);
        
        if (transformedSection.topics.length > 0) {
          const firstTopic = transformedSection.topics[0];
          const newExpanded = new Set<number>();
          newExpanded.add(firstTopic.id);
          setExpandedTopics(newExpanded);
          
          if (firstTopic.materials.length > 0) {
            setSelectedTopicId(firstTopic.id);
            setSelectedContentType('material');
            setSelectedMaterialId(firstTopic.materials[0].id);
          } else if (firstTopic.quiz.quiz_question_count > 0) {
            setSelectedTopicId(firstTopic.id);
            setSelectedContentType('quiz');
            setSelectedMaterialId(null);
          } else if (firstTopic.drill.drill_question_count > 0) {
            setSelectedTopicId(firstTopic.id);
            setSelectedContentType('drill');
            setSelectedMaterialId(null);
          }
        }
      } catch (err: any) {
        console.error('Error fetching section data:', err);
        setError(
          err.response?.data?.message || 
          err.message || 
          'Gagal memuat data section. Silakan coba lagi nanti.'
        );
      } finally {
        setLoading(false);
      }
    };
    
    if (sectionCode) {
      fetchSectionData();
    }
  }, [sectionCode]);

  // Format durasi
  const formatDuration = (minutes: number | undefined): string => {
    if (!minutes) return '';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} menit`;
    } else if (mins === 0) {
      return `${hours} jam`;
    } else {
      return `${hours} jam ${mins} menit`;
    }
  };

  // Toggle expand/collapse topik
  const toggleTopic = (topicId: number) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  // Pemilihan konten
  const selectContent = (topicId: number, contentType: 'material' | 'quiz' | 'drill', materialId?: number) => {
    setSelectedTopicId(topicId);
    setSelectedContentType(contentType);
    
    if (contentType === 'material' && materialId) {
      setSelectedMaterialId(materialId);
    } else {
      setSelectedMaterialId(null);
    }
    
    const newExpanded = new Set(expandedTopics);
    newExpanded.add(topicId);
    setExpandedTopics(newExpanded);
    
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  // Menandai konten selesai
  const markContentComplete = async (
    type: 'material' | 'quiz' | 'drill',
    topicId: number,
    materialId?: number
  ) => {
    if (!selectedSection?.isEntitled) {
      setShowCartModal(true);
      return;
    }

    try {
      setMarkingLoading(true);
      setMarkingError(null);
      setMarkingSuccess(false);

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Anda harus login terlebih dahulu');
      }

      let payload: any = { topic_id: topicId };
      
      if (type === 'material' && materialId) {
        payload.material_id = materialId;
      } else if (type === 'quiz') {
        const quizId = selectedSection?.topics.find(t => t.id === topicId)?.quiz.quiz_id;
        if (quizId) payload.quiz_id = quizId;
      } else if (type === 'drill') {
        const drillId = selectedSection?.topics.find(t => t.id === topicId)?.drill.drill_id;
        if (drillId) payload.drill_id = drillId;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/userCourse/`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        setMarkingSuccess(true);
        
        if (type === 'material' && materialId) {
          setCompletedMaterials(prev => new Set(prev).add(materialId));
        } else if (type === 'quiz') {
          setCompletedQuizzes(prev => new Set(prev).add(topicId));
        } else if (type === 'drill') {
          setCompletedDrills(prev => new Set(prev).add(topicId));
        }
        
        if (type === 'material') {
          setTimeout(() => {
            setMarkingSuccess(false);
            handleNext();
          }, 1500);
        } else {
          setTimeout(() => setMarkingSuccess(false), 3000);
        }
      } else {
        throw new Error('Gagal menandai selesai');
      }
    } catch (err: any) {
      console.error('Error marking content complete:', err);
      setMarkingError(
        err.response?.data?.message || 
        err.message || 
        'Gagal menandai selesai. Silakan coba lagi.'
      );
    } finally {
      setMarkingLoading(false);
    }
  };

  const markMaterialComplete = (materialId: number, topicId: number) => {
    if (!completedMaterials.has(materialId)) {
      markContentComplete('material', topicId, materialId);
    }
  };

  // Function untuk tambah ke keranjang
  const handleAddToCart = async () => {
    if (!selectedSection) return;

    try {
      setAddingToCart(true);
      setCartError(null);
      setCartSuccess(false);

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Anda harus login terlebih dahulu');
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/add`,
        {
          course_string: selectedSection.courseString,
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        setCartSuccess(true);
        setTimeout(() => {
          setShowCartModal(false);
          setCartSuccess(false);
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      setCartError(
        err.response?.data?.message || 
        err.message || 
        'Gagal menambahkan ke keranjang. Silakan coba lagi.'
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // Hitung progress topik
  const calculateTopicProgress = (topic: Topic) => {
    const mandatoryMaterials = topic.materials.filter(m => m.isMandatory);
    const completedMandatoryMaterials = mandatoryMaterials.filter(m => completedMaterials.has(m.id));
    const isQuizCompleted = completedQuizzes.has(topic.id);
    
    const totalItems = mandatoryMaterials.length + 
                      (topic.quiz.quiz_question_count > 0 ? 1 : 0);
    
    const completedItems = completedMandatoryMaterials.length + 
                          (isQuizCompleted ? 1 : 0);
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  // Hitung progress materi tak wajib
  const calculateExtraProgress = (topic: Topic) => {
    const nonMandatoryMaterials = topic.materials.filter(m => !m.isMandatory);
    const completedNonMandatoryMaterials = nonMandatoryMaterials.filter(m => completedMaterials.has(m.id));
    
    return nonMandatoryMaterials.length > 0 
      ? Math.round((completedNonMandatoryMaterials.length / nonMandatoryMaterials.length) * 100) 
      : 0;
  };

  // Warna progress bar
  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'success';
    if (progress >= 70) return 'info';
    if (progress >= 40) return 'warning';
    return 'danger';
  };

  const getExtraProgressColor = (progress: number) => {
    if (progress === 100) return 'success';
    if (progress >= 50) return 'warning';
    return 'secondary';
  };

  const selectedTopic = selectedSection?.topics.find(topic => topic.id === selectedTopicId);
  const selectedMaterial = selectedTopic?.materials.find(material => material.id === selectedMaterialId);

  const getCurrentTopic = () => {
    return selectedSection?.topics.find(topic => topic.id === selectedTopicId);
  };

  const getCurrentMaterialIndex = () => {
    if (!selectedTopic || !selectedMaterialId) return -1;
    return selectedTopic.materials.findIndex(m => m.id === selectedMaterialId);
  };

  // Navigasi ke konten berikutnya
  const handleNext = () => {
    if (!selectedSection?.isEntitled) {
      setShowCartModal(true);
      return;
    }

    const currentTopic = getCurrentTopic();
    if (!currentTopic || !selectedSection) return;

    if (selectedContentType === 'material' && selectedMaterialId) {
      const materialIndex = getCurrentMaterialIndex();
      const nextMaterial = currentTopic.materials[materialIndex + 1];
      
      if (nextMaterial) {
        selectContent(currentTopic.id, 'material', nextMaterial.id);
      } else {
        if (currentTopic.quiz.quiz_question_count > 0) {
          selectContent(currentTopic.id, 'quiz');
        } else if (currentTopic.drill.drill_question_count > 0) {
          selectContent(currentTopic.id, 'drill');
        } else {
          const currentTopicIndex = selectedSection.topics.findIndex(t => t.id === currentTopic.id);
          const nextTopic = selectedSection.topics[currentTopicIndex + 1];
          if (nextTopic && nextTopic.materials.length > 0) {
            selectContent(nextTopic.id, 'material', nextTopic.materials[0].id);
          }
        }
      }
    } else if (selectedContentType === 'quiz') {
      if (currentTopic.drill.drill_question_count > 0) {
        selectContent(currentTopic.id, 'drill');
      } else {
        const currentTopicIndex = selectedSection.topics.findIndex(t => t.id === currentTopic.id);
        const nextTopic = selectedSection.topics[currentTopicIndex + 1];
        if (nextTopic && nextTopic.materials.length > 0) {
          selectContent(nextTopic.id, 'material', nextTopic.materials[0].id);
        }
      }
    } else if (selectedContentType === 'drill') {
      const currentTopicIndex = selectedSection.topics.findIndex(t => t.id === currentTopic.id);
      const nextTopic = selectedSection.topics[currentTopicIndex + 1];
      if (nextTopic && nextTopic.materials.length > 0) {
        selectContent(nextTopic.id, 'material', nextTopic.materials[0].id);
      }
    }
  };

  // Navigasi ke konten sebelumnya
  const handlePrev = () => {
    const currentTopic = getCurrentTopic();
    if (!currentTopic || !selectedSection) return;

    if (selectedContentType === 'material' && selectedMaterialId) {
      const materialIndex = getCurrentMaterialIndex();
      if (materialIndex > 0) {
        const prevMaterial = currentTopic.materials[materialIndex - 1];
        selectContent(currentTopic.id, 'material', prevMaterial.id);
      } else {
        const currentTopicIndex = selectedSection.topics.findIndex(t => t.id === currentTopic.id);
        if (currentTopicIndex > 0) {
          const prevTopic = selectedSection.topics[currentTopicIndex - 1];
          if (prevTopic.drill.drill_question_count > 0) {
            selectContent(prevTopic.id, 'drill');
          } else if (prevTopic.quiz.quiz_question_count > 0) {
            selectContent(prevTopic.id, 'quiz');
          } else if (prevTopic.materials.length > 0) {
            const lastMaterial = prevTopic.materials[prevTopic.materials.length - 1];
            selectContent(prevTopic.id, 'material', lastMaterial.id);
          }
        }
      }
    } else if (selectedContentType === 'quiz') {
      if (currentTopic.materials.length > 0) {
        const lastMaterial = currentTopic.materials[currentTopic.materials.length - 1];
        selectContent(currentTopic.id, 'material', lastMaterial.id);
      }
    } else if (selectedContentType === 'drill') {
      if (currentTopic.quiz.quiz_question_count > 0) {
        selectContent(currentTopic.id, 'quiz');
      } else if (currentTopic.materials.length > 0) {
        const lastMaterial = currentTopic.materials[currentTopic.materials.length - 1];
        selectContent(currentTopic.id, 'material', lastMaterial.id);
      }
    }
  };

  // Cek apakah konten pertama
  const isFirstContent = () => {
    if (!selectedTopic || !selectedSection) return true;
    
    const currentTopicIndex = selectedSection.topics.findIndex(t => t.id === selectedTopic.id);
    const isFirstTopic = currentTopicIndex === 0;
    
    if (selectedContentType === 'material') {
      const isFirstMaterial = getCurrentMaterialIndex() === 0;
      return isFirstTopic && isFirstMaterial;
    }
    
    return false;
  };

  // Cek apakah konten terakhir
  const isLastContent = () => {
    if (!selectedTopic || !selectedSection) return true;
    
    const currentTopicIndex = selectedSection.topics.findIndex(t => t.id === selectedTopic.id);
    const isLastTopic = currentTopicIndex === selectedSection.topics.length - 1;
    
    if (selectedContentType === 'material') {
      const materialIndex = getCurrentMaterialIndex();
      const isLastMaterial = materialIndex === selectedTopic.materials.length - 1;
      const hasNoQuizOrDrill = selectedTopic.quiz.quiz_question_count === 0 && 
                              selectedTopic.drill.drill_question_count === 0;
      return isLastTopic && isLastMaterial && hasNoQuizOrDrill;
    } else if (selectedContentType === 'quiz') {
      const hasNoDrill = selectedTopic.drill.drill_question_count === 0;
      return isLastTopic && hasNoDrill;
    } else if (selectedContentType === 'drill') {
      return isLastTopic;
    }
    
    return true;
  };

  // Mulai quiz atau drill
  const startQuizOrDrill = (type: 'quiz' | 'drill', id: number, topicId: number) => {
    if (!selectedSection?.isEntitled) {
      setShowCartModal(true);
      return;
    }

    setCurrentTopicId(topicId);
    if (type === 'quiz') {
      setExamType(type);
      setExamId(id);
      setShowExamModal(true);
    } else if (type === 'drill') {
      setShowDrillModal(true);
    }
  };

  // Handler menutup ExamModal
  const handleExamModalClose = () => {
    setShowExamModal(false);
    if (examType === 'quiz' && currentTopicId) {
      markContentComplete('quiz', currentTopicId);
    }
  };

  // Finalize tracking
  const finalizeTracking = () => {
    const { materialId, topicId, startTime, elapsedTime, intervalId } = trackingRef.current;
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (materialId && topicId && startTime) {
      const record = {
        material_id: materialId,
        topic_id: topicId,
        start_time: startTime.toISOString(),
        elapsed_time: elapsedTime
      };

      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/userCourse/timer`,
          record,
          {
            headers: { 'Authorization': `Bearer ${authToken}` }
          }
        ).catch(err => console.error('Error posting session:', err));
      }
      saveSessionToIndexedDB(record).catch(err => console.error('Error saving to IndexedDB:', err));
    }
    trackingRef.current = {
      materialId: null,
      topicId: null,
      startTime: null,
      elapsedTime: 0,
      intervalId: null
    };
  };

  // Effect tracking
  useEffect(() => {
    finalizeTracking();

    if (selectedContentType === 'material' && selectedMaterialId && selectedTopicId) {
      const start = new Date();
      trackingRef.current.materialId = selectedMaterialId;
      trackingRef.current.topicId = selectedTopicId;
      trackingRef.current.startTime = start;
      trackingRef.current.elapsedTime = 0;

      const tick = () => {
        trackingRef.current.elapsedTime += 1;
      };

      const id = window.setInterval(tick, 1000);
      trackingRef.current.intervalId = id;
    }

    return () => {
      if (trackingRef.current.intervalId) {
        clearInterval(trackingRef.current.intervalId);
      }
    };
  }, [selectedMaterialId, selectedContentType, selectedTopicId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (trackingRef.current.intervalId) {
          clearInterval(trackingRef.current.intervalId);
          trackingRef.current.intervalId = null;
        }
      } else if (document.visibilityState === 'visible') {
        if (trackingRef.current.materialId && trackingRef.current.topicId && !trackingRef.current.intervalId) {
          const tick = () => {
            trackingRef.current.elapsedTime += 1;
          };
          const id = window.setInterval(tick, 1000);
          trackingRef.current.intervalId = id;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      finalizeTracking();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (loading) {
    return (
      <div className="tw-bg-gradient-to-br tw-from-purple-50 tw-via-pink-50 tw-to-indigo-50 tw-min-h-screen tw-flex tw-items-center tw-justify-center">
        <Container>
          <div className="tw-text-center tw-py-12">
            <Spinner animation="border" variant="primary" className="tw-mb-4" />
            <h1 className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-purple-800 tw-mb-4">
              Memuat Data Pembelajaran...
            </h1>
            <p className="tw-text-gray-600 tw-text-lg">
              Mohon tunggu sebentar, kami sedang menyiapkan konten untuk Anda.
            </p>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tw-bg-gradient-to-br tw-from-purple-50 tw-via-pink-50 tw-to-indigo-50 tw-min-h-screen tw-flex tw-items-center tw-justify-center">
        <Container>
          <div className="tw-text-center tw-py-12">
            <div className="tw-inline-block tw-bg-gradient-to-r tw-from-red-600 tw-to-pink-600 tw-text-white tw-p-4 tw-rounded-full tw-mb-4">
              <X size={48} />
            </div>
            <h1 className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-red-800 tw-mb-4">
              Terjadi Kesalahan
            </h1>
            <p className="tw-text-gray-600 tw-text-lg tw-mb-6">
              {error}
            </p>
            <Button 
              variant="danger" 
              onClick={() => window.location.reload()}
              className="tw-bg-gradient-to-r tw-from-red-600 tw-to-pink-600 tw-border-0 tw-px-6 tw-py-3"
            >
              Coba Lagi
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  if (!selectedSection) {
    return (
      <div className="tw-bg-gradient-to-br tw-from-purple-50 tw-via-pink-50 tw-to-indigo-50 tw-min-h-screen tw-flex tw-items-center tw-justify-center">
        <Container>
          <div className="tw-text-center tw-py-12">
            <div className="tw-inline-block tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 tw-text-white tw-p-4 tw-rounded-full tw-mb-4">
              <BookMarked size={48} />
            </div>
            <h1 className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-purple-800 tw-mb-4">
              Section Tidak Ditemukan
            </h1>
            <p className="tw-text-gray-600 tw-text-lg tw-mb-6">
              Maaf, section dengan kode '{sectionCode}' tidak ditemukan.
            </p>
            <Button 
              variant="primary" 
              as={Link} 
              href={`/course/${selectedSection?.courseString || ''}`} 
              className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 tw-border-0 tw-px-6 tw-py-3"
            >
              Kembali ke Course
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <>
      {/* Load Practice Question Handler Script */}
<Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Highlight.js loaded');
        }}
      />
      
      {/* Load Highlight.js Theme - Same as SuperEditor (felipec) */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/felipec.min.css"
      />
      
      {/* Load Practice Question Handler Script */}
      <Script 
        src="/CodeCloseOpen.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Code Close/Open Handler loaded');
          setCodeHandlerLoaded(true);
          
          // Wait for highlight.js to be available
          const initializeCodeBlocks = () => {
            if (window.hljs && window.CodeCloseOpenHandler) {
              // First, highlight all code blocks
              document.querySelectorAll('pre code.cte-code-block').forEach((block) => {
                window.hljs.highlightElement(block);
              });
              
              // Then initialize collapse/expand handlers
              window.CodeCloseOpenHandler.init();
              console.log('Code blocks highlighted and handlers initialized');
            } else {
              // Retry after a short delay if hljs not ready yet
              setTimeout(initializeCodeBlocks, 100);
            }
          };
          
          initializeCodeBlocks();
        }}
        onError={(e) => {
          console.error('Failed to load Code Close/Open Handler:', e);
        }}
      />
      <div className="tw-bg-gradient-to-br tw-from-purple-100 tw-via-pink-50 tw-to-indigo-100 tw-min-h-[125vh]">
        <NavigationBar />
        <Container fluid className="tw-px-0 md:tw-px-4 md:tw-py-10 tw-min-h-screen">
          <div className="tw-relative">
            {markingSuccess && (
              <Alert variant="success" className="tw-fixed tw-top-4 tw-right-4 tw-z-50 tw-shadow-lg tw-animate-fadeIn">
                <div className="tw-flex tw-items-center tw-gap-2">
                  <Check className="tw-text-success" size={20} />
                  <span>Berhasil ditandai selesai!</span>
                </div>
              </Alert>
            )}

            {markingError && (
              <Alert variant="danger" className="tw-fixed tw-top-4 tw-right-4 tw-z-50 tw-shadow-lg tw-animate-fadeIn">
                <div className="tw-flex tw-items-center tw-gap-2">
                  <X className="tw-text-danger" size={20} />
                  <span>{markingError}</span>
                </div>
              </Alert>
            )}

            {!selectedSection.isEntitled && (
              <Alert variant="warning" className="tw-mb-6 tw-border-2 tw-border-yellow-400 tw-shadow-lg">
                <div className="tw-flex tw-items-center tw-gap-3">
                  <Lock className="tw-text-yellow-700" size={24} />
                  <div className="tw-flex-1">
                    <h5 className="tw-text-yellow-800 tw-font-bold tw-mb-1">
                      Preview Mode - Akses Terbatas
                    </h5>
                    <p className="tw-text-yellow-700 tw-mb-0">
                      Anda dapat melihat preview materi, tetapi tidak dapat menandai selesai atau melanjutkan. 
                      Beli course ini untuk akses penuh!
                    </p>
                  </div>
                </div>
              </Alert>
            )}
            
            <Row>
              <Col 
                xs={12} 
                lg={sidebarCollapsed ? 1 : 4} 
                className={`tw-mb-4 lg:tw-mb-0 tw-transition-all tw-duration-300 ${
                  isMobile ? 'tw-fixed tw-top-0 tw-left-0 tw-w-full tw-z-50' : ''
                } ${isMobile && sidebarCollapsed ? 'tw-hidden' : ''}`}
              >
                {isMobile && !sidebarCollapsed && (
                  <div 
                    className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-z-40"
                    onClick={() => setSidebarCollapsed(true)}
                  />
                )}
                <Card className={`tw-border-0 tw-shadow-2xl tw-bg-white tw-rounded-2xl tw-overflow-hidden tw-relative tw-z-50 ${
                  isMobile ? 'tw-m-4 tw-max-h-[90vh]' : 'tw-sticky'
                }`} style={!isMobile ? {top: '20px', maxHeight: 'calc(125vh - 40px)', height: 'fit-content'} : {}}>
                  <Card.Header className="tw-bg-gradient-to-r tw-from-purple-600 tw-via-purple-700 tw-to-indigo-600 tw-text-white tw-p-4 tw-relative tw-overflow-hidden">
                    <div className="tw-absolute tw-top-0 tw-left-0 tw-w-20 tw-h-20 tw-bg-white tw-opacity-10 tw-rounded-full tw--ml-10 tw--mt-10"></div>
                    <div className="tw-flex tw-justify-between tw-items-center tw-relative tw-z-10">
                      {!sidebarCollapsed && (
                        <div className="tw-flex-1 tw-mr-3">
                          <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                            <BookOpen className="tw-text-white" size={20} />
                            <h3 className="tw-text-xs sm:tw-text-sm md:tw-text-lg tw-font-bold tw-mb-0 tw-truncate">
                              {selectedSection.title}
                            </h3>
                          </div>
                          <div className="tw-flex tw-items-center tw-gap-3 tw-flex-wrap">
                            <Badge bg="light" text="dark" className="tw-text-xs tw-flex tw-items-center tw-gap-1">
                              <Clock size={10} />
                              {formatDuration(selectedSection.duration)}
                            </Badge>
                            <Badge bg="light" text="dark" className="tw-text-xs">
                              Bagian {selectedSection.sectionPosition}
                            </Badge>
                            {!selectedSection.isEntitled && (
                              <Badge bg="warning" className="tw-text-xs tw-flex tw-items-center tw-gap-1">
                                <Lock size={10} />
                                Preview
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <Button
                          variant="outline-light"
                          size="sm"
                          className="tw-border-2 tw-p-2 tw-rounded-lg tw-hover:tw-bg-white tw-hover:tw-text-purple-600 tw-transition-colors"
                          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        >
                          {sidebarCollapsed ? <Menu size={16} /> : <X size={16} />}
                        </Button>
                        {(!sidebarCollapsed || !isMobile) && (
                          <Button
                            variant="outline-light"
                            size="sm"
                            className="tw-border-2 tw-rounded-lg tw-hover:tw-bg-white tw-hover:tw-text-purple-600 tw-transition-colors tw-px-2 sm:tw-px-3"
                            as={Link}
                            href={`/course/${selectedSection.courseString}`}
                          >
                            <ChevronsLeft size={16} />
                            <span className="tw-hidden sm:tw-inline tw-ml-1">Course</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Header>
                  {!sidebarCollapsed && (
                  <Card.Body className={`tw-p-0 tw-overflow-y-auto tw-scrollbar-thin tw-scrollbar-thumb-purple-300 tw-scrollbar-track-purple-100 ${
                    isMobile ? 'tw-max-h-[60vh]' : ''
                  }`} style={!isMobile ? {maxHeight: 'calc(125vh - 280px)'} : {}}>
                    <div className="tw-p-4 tw-bg-gradient-to-r tw-from-purple-50 tw-to-pink-50">
                      <h4 className="tw-text-purple-800 tw-font-bold tw-text-sm tw-mb-3">{selectedSection.courseTitle}</h4>
                      <p className="tw-text-gray-600 tw-text-sm">{selectedSection.description}</p>
                    </div>
                    
                    {selectedSection.topics.map((topic, topicIndex) => {
                      const topicProgress = calculateTopicProgress(topic);
                      const extraProgress = calculateExtraProgress(topic);
                      return (
                        <div key={topic.id} className="tw-border-b tw-border-purple-100 last:tw-border-b-0">
                          <div
                            className="tw-p-4 tw-cursor-pointer tw-hover:tw-bg-gradient-to-r tw-hover:tw-from-purple-50 tw-hover:tw-to-pink-50 tw-transition-all tw-duration-200"
                            onClick={() => toggleTopic(topic.id)}
                          >
                            <div className="tw-flex tw-justify-between tw-items-center">
                              <div className="tw-flex-1">
                                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2 tw-flex-wrap">
                                  <div className="tw-bg-gradient-to-r tw-from-purple-400 tw-to-pink-400 tw-text-white tw-rounded-full tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-bold">
                                    {topicIndex + 1}
                                  </div>
                                  <Badge bg={topicProgress === 100 ? 'success' : 'secondary'} className="tw-text-xs tw-flex tw-items-center tw-gap-1">
                                    {topicProgress === 100 && <Check size={10} />}
                                    {topicProgress}% 
                                  </Badge>
                                  {extraProgress > 0 && (
                                    <Badge bg={getExtraProgressColor(extraProgress)} className="tw-text-xs tw-flex tw-items-center tw-gap-1">
                                      <Star size={10} />
                                      +{extraProgress}% Ekstra
                                    </Badge>
                                  )}
                                  <span className="tw-text-purple-800 tw-font-semibold tw-text-xs md:tw-text-sm tw-break-words">
                                    {topic.title}
                                  </span>
                                </div>
                                <ProgressBar 
                                  variant={getProgressColor(topicProgress)} 
                                  now={topicProgress} 
                                  className="tw-h-2 tw-rounded-full"
                                />
                              </div>
                              <div className="tw-ml-3">
                                <div className="tw-bg-purple-100 tw-p-1 tw-rounded-full">
                                  {expandedTopics.has(topic.id) ? (
                                    <ChevronUp className="tw-text-purple-600" size={18} />
                                  ) : (
                                    <ChevronDown className="tw-text-purple-600" size={18} />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          {expandedTopics.has(topic.id) && (
                            <div className="tw-bg-gradient-to-r tw-from-purple-25 tw-to-pink-25 tw-border-t tw-border-purple-100">
                              {topic.materials.map(material => (
                                <div
                                  key={material.id}
                                  className={`tw-px-6 tw-py-3 tw-cursor-pointer tw-border-b tw-border-purple-50 tw-transition-colors
                                    ${!material.isAccessible ? 'tw-bg-gray-100 tw-cursor-not-allowed' : 'tw-hover:tw-bg-purple-100'}`}
                                  onClick={() => {
                                    if (!material.isAccessible) return;
                                    selectContent(topic.id, 'material', material.id);
                                  }}
                                >
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <BookOpen className="tw-text-purple-600" size={14} />
                                    <span className="tw-flex-1 tw-truncate">{material.title}</span>
                                    {completedMaterials.has(material.id) && (
                                      <Badge bg="success" className="tw-text-xs">
                                        <Check size={10} />
                                      </Badge>
                                    )}
                                    {!material.isAccessible && (
                                      <span className="tw-ml-2 tw-text-red-500">
                                        <Lock size={12} />
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}

                              {topic.quiz.quiz_question_count > 0 && (
                                <div
                                  className={`tw-px-6 tw-py-3 tw-cursor-pointer tw-border-b tw-border-purple-50 tw-transition-colors
                                    ${!topic.quizAccessible ? 'tw-bg-gray-100 tw-cursor-not-allowed' : 'tw-hover:tw-bg-purple-100'}`}
                                  onClick={() => {
                                    if (!topic.quizAccessible) return;
                                    selectContent(topic.id, 'quiz');
                                  }}
                                >
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <FileText className="tw-text-purple-600" size={14} />
                                    <span className="tw-flex-1">Quiz ({topic.quiz.quiz_question_count} soal)</span>
                                    {completedQuizzes.has(topic.id) && (
                                      <Badge bg="success" className="tw-text-xs">
                                        <Check size={10} />
                                      </Badge>
                                    )}
                                    {!topic.quizAccessible && (
                                      <span className="tw-ml-2 tw-text-red-500">
                                        <Lock size={12} />
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {topic.drill.drill_question_count > 0 && (
                                <div
                                  className={`tw-px-6 tw-py-3 tw-cursor-pointer tw-transition-colors
                                    ${!topic.drillAccessible ? 'tw-bg-gray-100 tw-cursor-not-allowed' : 'tw-hover:tw-bg-purple-100'}`}
                                  onClick={() => {
                                    if (!topic.drillAccessible) return;
                                    selectContent(topic.id, 'drill');
                                  }}
                                >
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <CheckSquare className="tw-text-purple-600" size={14} />
                                    <span className="tw-flex-1">Drill ({topic.drill.drill_question_count} latihan)</span>
                                    {completedDrills.has(topic.id) && (
                                      <Badge bg="success" className="tw-text-xs">
                                        <Check size={10} />
                                      </Badge>
                                    )}
                                    {!topic.drillAccessible && (
                                      <span className="tw-ml-2 tw-text-red-500">
                                        <Lock size={12} />
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </Card.Body>
                )}
                </Card>
              </Col>

              <Col xs={12} lg={sidebarCollapsed ? 11 : 8} className={`${isMobile && !sidebarCollapsed ? 'tw-blur-sm tw-pointer-events-none' : ''}`}>
                <div className="tw-space-y-6 tw-mx-2">
                  {isMobile && sidebarCollapsed && (
                    <div className="tw-sticky tw-top-0 tw-z-40 tw-flex tw-justify-between tw-items-center tw-bg-white tw-p-4 tw-rounded-xl tw-shadow-lg tw-border tw-border-purple-200 tw-mb-6">
                      <div className="tw-flex tw-items-center tw-gap-3">
                        <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-p-2 tw-rounded-full">
                          <BookOpen className="tw-text-white" size={16} />
                        </div>
                        <span className="tw-text-purple-800 tw-font-bold tw-text-sm tw-truncate">
                          {selectedSection.title}
                        </span>
                        {!selectedSection.isEntitled && (
                          <Badge bg="warning" className="tw-text-xs tw-flex tw-items-center tw-gap-1">
                            <Lock size={10} />
                            Preview
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="tw-rounded-lg tw-flex-shrink-0"
                        onClick={() => setSidebarCollapsed(false)}
                      >
                        <Menu size={16} />
                      </Button>
                    </div>
                  )}

                  {!selectedTopicId ? (
                    <Card className="tw-border-0 tw-shadow-2xl tw-bg-white tw-rounded-2xl tw-overflow-hidden">
                      <Card.Header className="tw-bg-gradient-to-r tw-from-purple-500 tw-via-purple-600 tw-to-indigo-600 tw-text-white tw-p-6 tw-relative tw-overflow-hidden">
                        <div className="tw-absolute tw-top-0 tw-right-0 tw-w-32 tw-h-32 tw-bg-white tw-opacity-10 tw-rounded-full tw--mr-16 tw--mt-16"></div>
                        <div className="tw-flex tw-items-center tw-justify-center tw-gap-3 tw-relative tw-z-10">
                          <div className="tw-bg-white tw-bg-opacity-20 tw-p-3 tw-rounded-full tw-animate-pulse">
                            <Target className="tw-text-white" size={28} />
                          </div>
                          <h2 className="tw-text-xl md:tw-text-2xl tw-font-bold tw-mb-0 tw-text-center">
                            Pilih Topik yang Ingin Dipelajari!
                          </h2>
                        </div>
                      </Card.Header>
                      <Card.Body className="tw-p-6 tw-bg-gradient-to-br tw-from-purple-50 tw-to-pink-50">
                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                          {selectedSection.topics.map((topic, topicIndex) => {
                            const topicProgress = calculateTopicProgress(topic);
                            const extraProgress = calculateExtraProgress(topic);
                            return (
                              <div
                                key={topic.id}
                                className="tw-group tw-cursor-pointer tw-bg-white tw-border-2 tw-border-purple-200 tw-rounded-xl tw-p-6 tw-hover:tw-shadow-xl tw-hover:tw-border-purple-400 tw-transition-all tw-duration-300 tw-hover:tw-scale-105 tw-hover:tw-bg-gradient-to-br tw-hover:tw-from-purple-50 tw-hover:tw-to-pink-50"
                                onClick={() => {
                                  if (topic.materials.length > 0) {
                                    selectContent(topic.id, 'material', topic.materials[0].id);
                                  } else if (topic.quiz.quiz_question_count > 0) {
                                    selectContent(topic.id, 'quiz');
                                  } else if (topic.drill.drill_question_count > 0) {
                                    selectContent(topic.id, 'drill');
                                  }
                                }}
                              >
                                <div className="tw-flex tw-items-start tw-justify-between tw-mb-4">
                                  <div className="tw-flex tw-items-center tw-gap-3">
                                    <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-text-white tw-rounded-full tw-w-10 tw-h-10 tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-lg tw-shadow-lg">
                                      {topicIndex + 1}
                                    </div>
                                    <div>
                                      <h3 className="tw-text-purple-800 tw-font-bold tw-text-lg tw-mb-1">
                                        {topic.title}
                                      </h3>
                                      <div className="tw-flex tw-gap-2 tw-flex-wrap">
                                        <Badge bg={topicProgress === 100 ? 'success' : topicProgress >= 50 ? 'warning' : 'secondary'} className="tw-flex tw-items-center tw-gap-1 tw-text-sm">
                                          {topicProgress === 100 && <Trophy size={12} />}
                                          Progress: {topicProgress}%
                                        </Badge>
                                        {extraProgress > 0 && (
                                          <Badge bg={getExtraProgressColor(extraProgress)} className="tw-flex tw-items-center tw-gap-1 tw-text-sm">
                                            <Star size={12} />
                                            Ekstra: {extraProgress}%
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="tw-bg-purple-100 tw-group-hover:tw-bg-purple-200 tw-p-2 tw-rounded-full tw-transition-colors">
                                    <ChevronRight className="tw-text-purple-600 tw-group-hover:tw-text-purple-800" size={20} />
                                  </div>
                                </div>

                                <div className="tw-mb-4">
                                  <ProgressBar 
                                    variant={getProgressColor(topicProgress)} 
                                    now={topicProgress} 
                                    className="tw-h-3 tw-rounded-full tw-shadow-inner"
                                  />
                                  {extraProgress > 0 && (
                                    <ProgressBar 
                                      variant={getExtraProgressColor(extraProgress)} 
                                      now={extraProgress} 
                                      className="tw-h-2 tw-rounded-full tw-mt-1 tw-bg-opacity-50"
                                    />
                                  )}
                                </div>

                                <div className="tw-space-y-3">
                                  <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm">
                                    <BookOpen className="tw-text-purple-600" size={16} />
                                    <span className="tw-text-purple-700 tw-font-medium">
                                      {topic.materials.length} Materi Pembelajaran
                                    </span>
                                  </div>
                                  {topic.quiz.quiz_question_count > 0 && (
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm">
                                      <FileText className="tw-text-pink-600" size={16} />
                                      <span className="tw-text-pink-700 tw-font-medium">
                                        Quiz dengan {topic.quiz.quiz_question_count} Soal
                                      </span>
                                    </div>
                                  )}
                                  {topic.drill.drill_question_count > 0 && (
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm">
                                      <CheckSquare className="tw-text-indigo-600" size={16} />
                                      <span className="tw-text-indigo-700 tw-font-medium">
                                        Drill dengan {topic.drill.drill_question_count} Latihan
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {topic.materials.some(m => m.isMandatory) && (
                                  <div className="tw-mt-4 tw-pt-3 tw-border-t tw-border-purple-200">
                                    <Badge bg="danger" className="tw-text-xs tw-animate-pulse">
                                      Ada Materi Wajib
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="tw-mt-8 tw-text-center tw-bg-white tw-p-6 tw-rounded-xl tw-border-2 tw-border-purple-200 tw-shadow-lg">
                          <div className="tw-flex tw-items-center tw-justify-center tw-gap-3 tw-mb-3">
                            <Heart className="tw-text-pink-500 tw-animate-bounce" size={24} />
                            <span className="tw-text-purple-700 tw-font-bold tw-text-lg">
                              Semangat Belajar! 
                            </span>
                            <Star className="tw-text-yellow-500 tw-animate-pulse" size={24} />
                          </div>
                          <p className="tw-text-gray-600 tw-text-sm">
                            Pilih topik di atas untuk memulai perjalanan belajar yang seru dan menyenangkan!
                          </p>
                        </div>
                      </Card.Body>
                    </Card>
                  ) : (
                    <div className="tw-space-y-6" ref={contentRef}>
                      {selectedContentType === 'material' && selectedMaterial && (
                        <Card className="tw-border-0 tw-shadow-2xl tw-bg-white tw-rounded-2xl tw-overflow-hidden">
                          <Card.Header className="tw-bg-gradient-to-r tw-from-purple-500 tw-via-purple-600 tw-to-indigo-600 tw-text-white tw-p-6 tw-relative tw-overflow-hidden">
                            <div className="tw-absolute tw-top-0 tw-left-0 tw-w-20 tw-h-20 tw-bg-white tw-opacity-10 tw-rounded-full tw--ml-10 tw--mt-10"></div>
                            <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-start md:tw-items-center tw-justify-between tw-gap-4 tw-relative tw-z-10">
                              <div className="tw-flex tw-items-center tw-gap-3 tw-flex-1">
                                <div className="tw-bg-white tw-bg-opacity-20 tw-p-3 tw-rounded-full">
                                  <BookOpen className="tw-text-white" size={24} />
                                </div>
                                <div>
                                  <h3 className="tw-text-lg md:tw-text-xl tw-font-bold tw-mb-1">
                                    {selectedMaterial.title}
                                  </h3>
                                  <div className="tw-flex tw-items-center tw-gap-2 tw-flex-wrap">
                                    {selectedMaterial.isMandatory && (
                                      <Badge bg="warning" className="tw-text-xs tw-animate-pulse">
                                        Wajib Dipelajari
                                      </Badge>
                                    )}
                                    {selectedMaterial.hasVideo && (
                                      <Badge bg="info" className="tw-text-xs tw-flex tw-items-center tw-gap-1">
                                        <Play size={10} />
                                        Ada Video
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant={completedMaterials.has(selectedMaterial.id) ? "success" : "light"}
                                className="tw-px-4 tw-py-2 tw-rounded-lg tw-font-bold tw-transition-all tw-duration-300 tw-hover:tw-scale-105"
                                onClick={() => markMaterialComplete(selectedMaterial.id, selectedTopic!.id)}
                                disabled={markingLoading || completedMaterials.has(selectedMaterial.id) || !selectedSection.isEntitled}
                              >
                                {!selectedSection.isEntitled ? (
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <Lock size={16} />
                                    Terkunci
                                  </div>
                                ) : markingLoading ? (
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <Spinner animation="border" size="sm" />
                                    Menandai...
                                  </div>
                                ) : completedMaterials.has(selectedMaterial.id) ? (
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <Check size={16} />
                                    Selesai!
                                  </div>
                                ) : (
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <CheckSquare size={16} />
                                    Tandai Selesai
                                  </div>
                                )}
                              </Button>
                            </div>
                          </Card.Header>
                          <Card.Body className="tw-p-6 tw-bg-gradient-to-br tw-from-purple-25 tw-to-pink-25">
                            {loadingMaterial ? (
                              <div className="tw-text-center tw-py-12">
                                <Spinner animation="border" variant="primary" className="tw-mb-4" />
                                <h4 className="tw-text-purple-800 tw-font-bold tw-text-xl tw-mb-2">
                                  Memuat Konten Pembelajaran...
                                </h4>
                                <p className="tw-text-gray-600">
                                  Mohon tunggu sebentar, kami sedang memuat materi untuk Anda.
                                </p>
                              </div>
                            ) : materialError ? (
                              <div className="tw-text-center tw-py-12 tw-bg-white tw-rounded-xl tw-shadow-lg tw-border tw-border-red-200">
                                <div className="tw-inline-block tw-bg-gradient-to-r tw-from-red-600 tw-to-pink-600 tw-text-white tw-p-4 tw-rounded-full tw-mb-4">
                                  <X size={48} />
                                </div>
                                <h4 className="tw-text-red-800 tw-font-bold tw-text-xl tw-mb-2">
                                  Gagal Memuat Materi
                                </h4>
                                <p className="tw-text-gray-600 tw-mb-6">
                                  {materialError}
                                </p>
                                <Button 
                                  variant="danger"
                                  onClick={() => setSelectedMaterialId(selectedMaterialId)}
                                  className="tw-bg-gradient-to-r tw-from-red-600 tw-to-pink-600 tw-border-0"
                                >
                                  Coba Lagi
                                </Button>
                              </div>
                            ) : materialDetail ? (
                              <>
                                {materialDetail.has_video && (
                                  <div className="tw-mb-6 tw-bg-white tw-p-4 tw-rounded-xl tw-shadow-lg tw-border tw-border-purple-200">
                                    <div className="tw-flex tw-items-center tw-gap-3 tw-mb-4">
                                      <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-p-2 tw-rounded-full">
                                        <Play className="tw-text-white" size={20} />
                                      </div>
                                      <h4 className="tw-text-purple-800 tw-font-bold tw-text-lg tw-mb-0">
                                        Video Pembelajaran
                                      </h4>
                                    </div>
                                    {materialDetail.video_url ? (
                                      <div className="tw-aspect-video tw-bg-gray-100 tw-rounded-lg tw-overflow-hidden tw-shadow-inner">
                                        <iframe
                                          src={materialDetail.video_url}
                                          className="tw-w-full tw-h-full tw-border-0"
                                          allowFullScreen
                                          title="Video Pembelajaran"
                                        />
                                      </div>
                                    ) : (
                                      <div className="tw-aspect-video tw-bg-gradient-to-br tw-from-purple-100 tw-to-pink-100 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-border-2 tw-border-dashed tw-border-purple-300">
                                        <div className="tw-text-center">
                                          <Play className="tw-text-purple-400 tw-mx-auto tw-mb-2" size={48} />
                                          <p className="tw-text-purple-600 tw-font-medium">
                                            Video akan muncul di sini
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="tw-bg-white tw-p-6 tw-rounded-xl tw-shadow-lg tw-border tw-border-purple-200">
                                  <div className="tw-flex tw-items-center tw-gap-3 tw-mb-4">
                                    <div className="tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-500 tw-p-2 tw-rounded-full">
                                      <FileText className="tw-text-white" size={20} />
                                    </div>
                                    <h4 className="tw-text-purple-800 tw-font-bold tw-text-lg tw-mb-0">
                                      Materi Pembelajaran
                                    </h4>
                                  </div>
                                  <div className="tw-prose tw-max-w-none tw-text-gray-700 tw-leading-relaxed">
                                    {materialDetail.content ? (
                                      <div 
                                        dangerouslySetInnerHTML={{ __html: materialDetail.content }}
                                        className="practice-content-area"
                                      />
                                    ) : (
                                      <div className="tw-text-center tw-py-12 tw-bg-gradient-to-br tw-from-purple-50 tw-to-pink-50 tw-rounded-lg tw-border-2 tw-border-dashed tw-border-purple-300">
                                        <BookOpen className="tw-text-purple-400 tw-mx-auto tw-mb-4" size={64} />
                                        <h3 className="tw-text-purple-600 tw-font-bold tw-text-xl tw-mb-2">
                                          Materi Pembelajaran Menarik! 
                                        </h3>
                                        <p className="tw-text-purple-500 tw-text-lg">
                                          Konten edukatif yang seru akan ditampilkan di sini!
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="tw-text-center tw-py-12 tw-bg-white tw-rounded-xl tw-shadow-lg tw-border tw-border-purple-200">
                                <BookOpen className="tw-text-purple-400 tw-mx-auto tw-mb-4" size={64} />
                                <h4 className="tw-text-purple-600 tw-font-bold tw-text-xl tw-mb-2">
                                  Materi Belum Tersedia
                                </h4>
                                <p className="tw-text-gray-600">
                                  Maaf, materi ini sedang dalam persiapan.
                                </p>
                              </div>
                            )}
                          </Card.Body>
                          <Card.Footer className="tw-bg-white tw-border-t tw-border-purple-200 tw-p-4">
                            <div className="tw-flex tw-justify-between">
                              <Button
                                variant="outline-primary"
                                disabled={isFirstContent()}
                                onClick={handlePrev}
                                className="tw-flex tw-items-center tw-gap-2"
                              >
                                <ChevronLeft size={16} />
                                Sebelumnya
                              </Button>
                              
                              <Button
                                variant="primary"
                                onClick={handleNext}
                                disabled={!selectedSection.isEntitled}
                                className="tw-flex tw-items-center tw-gap-2 tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 tw-border-0"
                              >
                                {!selectedSection.isEntitled ? (
                                  <>
                                    <Lock size={16} />
                                    Terkunci
                                  </>
                                ) : (
                                  <>
                                    {isLastContent() ? "Selesai" : "Selanjutnya"}
                                    <ChevronRight size={16} />
                                  </>
                                )}
                              </Button>
                            </div>
                          </Card.Footer>
                        </Card>
                      )}

                      {selectedContentType === 'quiz' && selectedTopic && (
                        <Card className="tw-border-0 tw-shadow-2xl tw-bg-white tw-rounded-2xl tw-overflow-hidden">
                          <Card.Header className="tw-bg-gradient-to-r tw-from-pink-500 tw-via-purple-600 tw-to-indigo-600 tw-text-white tw-p-6 tw-relative tw-overflow-hidden">
                            <div className="tw-absolute tw-top-0 tw-right-0 tw-w-24 tw-h-24 tw-bg-white tw-opacity-10 tw-rounded-full tw--mr-12 tw--mt-12"></div>
                            <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-start md:tw-items-center tw-justify-between tw-gap-4 tw-relative tw-z-10">
                              <div className="tw-flex tw-items-center tw-gap-3 tw-flex-1">
                                <div className="tw-bg-white tw-bg-opacity-20 tw-p-3 tw-rounded-full tw-animate-pulse">
                                  <FileText className="tw-text-white" size={24} />
                                </div>
                                <div>
                                  <h3 className="tw-text-lg md:tw-text-xl tw-font-bold tw-mb-1">
                                    {selectedTopic.quiz.title}
                                  </h3>
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <Badge bg="light" text="dark" className="tw-text-xs">
                                      {selectedTopic.quiz.quiz_question_count} Soal
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant={completedQuizzes.has(selectedTopic.id) ? "success" : "warning"}
                                className="tw-px-4 tw-py-2 tw-rounded-lg tw-font-bold tw-transition-all tw-duration-300 tw-hover:tw-scale-105"
                                onClick={() => startQuizOrDrill('quiz', selectedTopic.quiz.quiz_id, selectedTopic.id)}
                                disabled={markingLoading || completedQuizzes.has(selectedTopic.id) || !selectedSection.isEntitled}
                              >
                                {!selectedSection.isEntitled ? (
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <Lock size={16} />
                                    Terkunci
                                  </div>
                                ) : markingLoading ? (
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <Spinner animation="border" size="sm" />
                                    Memproses...
                                  </div>
                                ) : completedQuizzes.has(selectedTopic.id) ? (
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <Trophy size={16} />
                                    Quiz Selesai!
                                  </div>
                                ) : (
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <Target size={16} />
                                    Mulai Quiz
                                  </div>
                                )}
                              </Button>
                            </div>
                          </Card.Header>
                          <Card.Body className="tw-p-6 tw-bg-gradient-to-br tw-from-pink-25 tw-to-purple-25">
                            {selectedTopic.quiz.quiz_question_count > 0 ? (
                              <div className="tw-space-y-4">
                                <div className="tw-bg-white tw-p-6 tw-rounded-xl tw-shadow-lg tw-border tw-border-pink-200">
                                  <div className="tw-text-center tw-mb-6">
                                    <h4 className="tw-text-purple-800 tw-font-bold tw-text-xl tw-mb-2">
                                      Siap untuk Tantangan Quiz?
                                    </h4>
                                    <p className="tw-text-gray-600">
                                      Quiz ini berisi {selectedTopic.quiz.quiz_question_count} soal yang akan menguji pemahamanmu!
                                    </p>
                                  </div>
                                  
                                  {!completedQuizzes.has(selectedTopic.id) ? (
                                    <div className="tw-text-center">
                                      <Button
                                        variant="primary"
                                        size="lg"
                                        className="tw-px-8 tw-py-3 tw-rounded-xl tw-font-bold tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 tw-border-0 tw-shadow-lg tw-hover:tw-scale-105 tw-transition-all tw-duration-300"
                                        onClick={() => startQuizOrDrill('quiz', selectedTopic.quiz.quiz_id, selectedTopic.id)}
                                        disabled={markingLoading || !selectedSection.isEntitled}
                                      >
                                        {!selectedSection.isEntitled ? (
                                          <div className="tw-flex tw-items-center tw-gap-3">
                                            <Lock size={20} />
                                            Beli Course untuk Akses
                                          </div>
                                        ) : (
                                          <div className="tw-flex tw-items-center tw-gap-3">
                                            <Play size={20} />
                                            Mulai Quiz Sekarang!
                                          </div>
                                        )}
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="tw-text-center tw-bg-gradient-to-r tw-from-green-100 tw-to-emerald-100 tw-p-6 tw-rounded-xl tw-border-2 tw-border-green-300">
                                      <Trophy className="tw-text-green-600 tw-mx-auto tw-mb-3 tw-animate-bounce" size={48} />
                                      <h4 className="tw-text-green-800 tw-font-bold tw-text-xl tw-mb-2">
                                        Selamat! Quiz Sudah Selesai!
                                      </h4>
                                      <p className="tw-text-green-700">
                                        Kamu telah menyelesaikan quiz ini dengan baik!
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="tw-text-center tw-py-12">
                                <FileText className="tw-text-pink-400 tw-mx-auto tw-mb-4" size={64} />
                                <h3 className="tw-text-pink-600 tw-font-bold tw-text-xl tw-mb-2">
                                  Quiz Sedang Disiapkan!
                                </h3>
                              </div>
                            )}
                          </Card.Body>
                          <Card.Footer className="tw-bg-white tw-border-t tw-border-pink-200 tw-p-4">
                            <div className="tw-flex tw-justify-between">
                              <Button
                                variant="outline-primary"
                                onClick={handlePrev}
                                className="tw-flex tw-items-center tw-gap-2"
                              >
                                <ChevronLeft size={16} />
                                Sebelumnya
                              </Button>
                              
                              <Button
                                variant="primary"
                                onClick={handleNext}
                                disabled={!completedQuizzes.has(selectedTopic.id) || !selectedSection.isEntitled}
                                className="tw-flex tw-items-center tw-gap-2 tw-bg-gradient-to-r tw-from-pink-600 tw-to-purple-600 tw-border-0"
                              >
                                {!selectedSection.isEntitled ? (
                                  <>
                                    <Lock size={16} />
                                    Terkunci
                                  </>
                                ) : (
                                  <>
                                    {selectedTopic.drill.drill_question_count > 0 ? "Lanjut ke Drill" : "Selesai"}
                                    <ChevronRight size={16} />
                                  </>
                                )}
                              </Button>
                            </div>
                          </Card.Footer>
                        </Card>
                      )}

                      {selectedContentType === 'drill' && selectedTopic && (
                        <Card className="tw-border-0 tw-shadow-2xl tw-bg-white tw-rounded-2xl tw-overflow-hidden">
                          <Card.Header className="tw-bg-gradient-to-r tw-from-indigo-500 tw-via-purple-600 tw-to-pink-600 tw-text-white tw-p-6 tw-relative tw-overflow-hidden">
                            <div className="tw-absolute tw-top-0 tw-left-0 tw-w-20 tw-h-20 tw-bg-white tw-opacity-10 tw-rounded-full tw--ml-10 tw--mt-10"></div>
                            <div className="tw-flex tw-items-center tw-gap-3 tw-relative tw-z-10">
                              <div className="tw-bg-white tw-bg-opacity-20 tw-p-3 tw-rounded-full tw-animate-pulse">
                                <CheckSquare className="tw-text-white" size={24} />
                              </div>
                              <div>
                                <h3 className="tw-text-lg md:tw-text-xl tw-font-bold tw-mb-1">
                                  {selectedTopic.drill.title}
                                </h3>
                                <Badge bg="light" text="dark" className="tw-text-xs">
                                  {selectedTopic.drill.drill_question_count} Latihan
                                </Badge>
                              </div>
                            </div>
                          </Card.Header>
                          <Card.Body className="tw-p-6 tw-bg-gradient-to-br tw-from-indigo-25 tw-to-purple-25">
                            {completedQuizzes.has(selectedTopic.id) ? (
                              <div className="tw-space-y-4">
                                <div className="tw-bg-white tw-p-6 tw-rounded-xl tw-shadow-lg tw-border tw-border-indigo-200">
                                  <div className="tw-text-center tw-mb-6">
                                    <h4 className="tw-text-indigo-800 tw-font-bold tw-text-xl tw-mb-2">
                                      Siap untuk Latihan Drill?
                                    </h4>
                                    <p className="tw-text-gray-600">
                                      Drill ini berisi {selectedTopic.drill.drill_question_count} latihan!
                                    </p>
                                  </div>
                                  
                                  {!completedDrills.has(selectedTopic.id) ? (
                                    <div className="tw-text-center">
                                      <Button
                                        variant="primary"
                                        size="lg"
                                        className="tw-px-8 tw-py-3 tw-rounded-xl tw-font-bold tw-bg-gradient-to-r tw-from-indigo-600 tw-to-purple-600 tw-border-0 tw-shadow-lg tw-hover:tw-scale-105 tw-transition-all tw-duration-300"
                                        onClick={() => startQuizOrDrill('drill', selectedTopic.drill.drill_id, selectedTopic.id)}
                                        disabled={markingLoading || !selectedSection.isEntitled}
                                      >
                                        {!selectedSection.isEntitled ? (
                                          <div className="tw-flex tw-items-center tw-gap-3">
                                            <Lock size={20} />
                                            Beli Course untuk Akses
                                          </div>
                                        ) : (
                                          <div className="tw-flex tw-items-center tw-gap-3">
                                            <Zap size={20} />
                                            Mulai Drill Sekarang!
                                          </div>
                                        )}
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="tw-text-center tw-bg-gradient-to-r tw-from-green-100 tw-to-emerald-100 tw-p-6 tw-rounded-xl tw-border-2 tw-border-green-300">
                                      <Trophy className="tw-text-green-600 tw-mx-auto tw-mb-3 tw-animate-bounce" size={48} />
                                      <h4 className="tw-text-green-800 tw-font-bold tw-text-xl tw-mb-2">
                                        Selamat! Drill Sudah Selesai!
                                      </h4>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="tw-text-center tw-py-12 tw-bg-white tw-rounded-xl tw-shadow-lg">
                                <AlertCircle className="tw-text-yellow-500 tw-mx-auto tw-mb-4" size={64} />
                                <h3 className="tw-text-yellow-600 tw-font-bold tw-text-xl tw-mb-2">
                                  Selesaikan Quiz Dulu!
                                </h3>
                                <Button
                                  variant="primary"
                                  onClick={() => selectContent(selectedTopic.id, 'quiz')}
                                  className="tw-mt-4"
                                >
                                  Kembali ke Quiz
                                </Button>
                              </div>
                            )}
                          </Card.Body>
                          <Card.Footer className="tw-bg-white tw-border-t tw-border-indigo-200 tw-p-4">
                            <div className="tw-flex tw-justify-between">
                              <Button
                                variant="outline-primary"
                                onClick={handlePrev}
                                className="tw-flex tw-items-center tw-gap-2"
                              >
                                <ChevronLeft size={16} />
                                Sebelumnya
                              </Button>
                              
                              <Button
                                variant="primary"
                                onClick={() => {
                                  setSelectedTopicId(null);
                                  setSelectedContentType(null);
                                }}
                                disabled={!selectedSection.isEntitled}
                                className="tw-flex tw-items-center tw-gap-2 tw-bg-gradient-to-r tw-from-indigo-600 tw-to-purple-600 tw-border-0"
                              >
                                {!selectedSection.isEntitled ? (
                                  <>
                                    <Lock size={16} />
                                    Terkunci
                                  </>
                                ) : (
                                  <>
                                    Selesai
                                    <Check size={16} />
                                  </>
                                )}
                              </Button>
                            </div>
                          </Card.Footer>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </Container>

        {/* Modal untuk Entitlement - Tambah ke Keranjang */}
        <Modal show={showCartModal} onHide={() => setShowCartModal(false)} centered>
          <Modal.Header closeButton className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-text-white tw-border-0">
            <Modal.Title className="tw-flex tw-items-center tw-gap-2">
              <Lock size={24} />
              <span>Akses Terbatas</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="tw-p-6">
            {cartSuccess ? (
              <div className="tw-text-center tw-py-4">
                <div className="tw-inline-block tw-bg-green-100 tw-p-4 tw-rounded-full tw-mb-4">
                  <Check className="tw-text-green-600" size={48} />
                </div>
                <h4 className="tw-text-green-800 tw-font-bold tw-text-xl tw-mb-2">
                  Berhasil Ditambahkan!
                </h4>
                <p className="tw-text-gray-600">
                  Course telah ditambahkan ke keranjang Anda
                </p>
              </div>
            ) : (
              <>
                <div className="tw-text-center tw-mb-6">
                  <div className="tw-inline-block tw-bg-yellow-100 tw-p-4 tw-rounded-full tw-mb-4">
                    <AlertCircle className="tw-text-yellow-600" size={48} />
                  </div>
                  <h4 className="tw-text-purple-800 tw-font-bold tw-text-xl tw-mb-3">
                    Beli Course untuk Akses Penuh
                  </h4>
                  <p className="tw-text-gray-600 tw-mb-4">
                    Anda sedang dalam mode preview. Untuk dapat menandai selesai, mengerjakan quiz/drill, dan melanjutkan pembelajaran, Anda perlu membeli course ini terlebih dahulu.
                  </p>
                </div>

                <div className="tw-bg-gradient-to-r tw-from-purple-50 tw-to-pink-50 tw-p-4 tw-rounded-xl tw-mb-4">
                  <h5 className="tw-text-purple-800 tw-font-bold tw-mb-3">
                    Dengan membeli course ini, Anda akan mendapat:
                  </h5>
                  <ul className="tw-space-y-2 tw-text-gray-700">
                    <li className="tw-flex tw-items-center tw-gap-2">
                      <Check className="tw-text-green-600 tw-flex-shrink-0" size={18} />
                      <span>Akses penuh ke semua materi pembelajaran</span>
                    </li>
                    <li className="tw-flex tw-items-center tw-gap-2">
                      <Check className="tw-text-green-600 tw-flex-shrink-0" size={18} />
                      <span>Dapat menandai materi sebagai selesai</span>
                    </li>
                    <li className="tw-flex tw-items-center tw-gap-2">
                      <Check className="tw-text-green-600 tw-flex-shrink-0" size={18} />
                      <span>Akses ke quiz dan drill untuk latihan</span>
                    </li>
                    <li className="tw-flex tw-items-center tw-gap-2">
                      <Check className="tw-text-green-600 tw-flex-shrink-0" size={18} />
                      <span>Tracking progress pembelajaran Anda</span>
                    </li>
                    <li className="tw-flex tw-items-center tw-gap-2">
                      <Check className="tw-text-green-600 tw-flex-shrink-0" size={18} />
                      <span>Sertifikat setelah menyelesaikan course</span>
                    </li>
                  </ul>
                </div>

                {cartError && (
                  <Alert variant="danger" className="tw-mb-4">
                    <div className="tw-flex tw-items-center tw-gap-2">
                      <X size={18} />
                      <span>{cartError}</span>
                    </div>
                  </Alert>
                )}
              </>
            )}
          </Modal.Body>
          {!cartSuccess && (
            <Modal.Footer className="tw-border-0 tw-flex tw-gap-3 tw-justify-end">
              <Button
                variant="outline-secondary"
                onClick={() => setShowCartModal(false)}
                disabled={addingToCart}
              >
                Nanti Saja
              </Button>
              <Button
                variant="primary"
                className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 tw-border-0 tw-flex tw-items-center tw-gap-2"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    <span>Menambahkan...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Tambah ke Keranjang</span>
                  </>
                )}
              </Button>
            </Modal.Footer>
          )}
        </Modal>

        {/* Exam Modal untuk Quiz */}
        {showExamModal && examType === 'quiz' && examId && (
          <ExamModal 
            show={showExamModal} 
            onClose={handleExamModalClose}
            examType={examType}
            scheduleId={examId}
            topicId={currentTopicId}
          />
        )}

        {/* Drill Modal */}
        {showDrillModal && selectedTopic && (
          <DrillModal
            show={showDrillModal}
            onClose={() => setShowDrillModal(false)}
            onContinue={handleNext}
            drillId={selectedTopic.drill.drill_id}
            topicId={selectedTopicId}
            title={selectedTopic.drill.title}
          />
        )}
      </div>
    </>
  );
};

export default SectionPage;