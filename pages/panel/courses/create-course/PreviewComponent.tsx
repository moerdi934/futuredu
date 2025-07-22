// pages/panel/courses/create-course/PreviewComponent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Button, Card, ProgressBar, Badge } from 'react-bootstrap';
import { 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft,
  Play, 
  Link, 
  BookOpen, 
  FileText, 
  CheckSquare, 
  Check,
  Award,
  Star,
  Menu,
  X,
  Clock,
  Users,
  Target,
  Zap,
  BookMarked,
  Trophy,
  Heart,
  ShoppingCart
} from 'lucide-react';

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
  description?: string;
  duration?: number;
  topics: Topic[];
}

interface PreviewComponentProps {
  courseTitle: string;
  courseDescription: string;
  courseImageUrl: string;
  learningPoints: string[];
  sections: Section[];
}

const PreviewComponent: React.FC<PreviewComponentProps> = ({
  courseTitle,
  courseDescription,
  courseImageUrl,
  learningPoints,
  sections,
}) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<'material' | 'quiz' | 'drill' | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [completedMaterials, setCompletedMaterials] = useState<Set<number>>(new Set());
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<number>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [hoveredSectionId, setHoveredSectionId] = useState<number | null>(null);

  // Ensure component only runs on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth < 992) {
        setSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mounted]);

  // Safe data with fallbacks
  const safeSections = Array.isArray(sections) ? sections : [];
  const safeLearningPoints = Array.isArray(learningPoints) ? learningPoints : [];

  // Format duration utility function
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

  const toggleTopic = (topicId: number): void => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const selectContent = (topicId: number, contentType: 'material' | 'quiz' | 'drill', materialId?: number): void => {
    setSelectedTopicId(topicId);
    setSelectedContentType(contentType);
    setSelectedMaterialId(materialId || null);
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  const markMaterialComplete = (materialId: number): void => {
    const newCompleted = new Set(completedMaterials);
    if (newCompleted.has(materialId)) {
      newCompleted.delete(materialId);
    } else {
      newCompleted.add(materialId);
    }
    setCompletedMaterials(newCompleted);
  };

  const markQuizComplete = (topicId: number): void => {
    const newCompleted = new Set(completedQuizzes);
    if (newCompleted.has(topicId)) {
      newCompleted.delete(topicId);
    } else {
      newCompleted.add(topicId);
    }
    setCompletedQuizzes(newCompleted);
  };

  const calculateTopicProgress = (topic: Topic): number => {
    const safeMaterials = Array.isArray(topic.materials) ? topic.materials : [];
    const mandatoryMaterials = safeMaterials.filter(m => m.isMandatory);
    const completedMandatoryMaterials = mandatoryMaterials.filter(m => completedMaterials.has(m.id));
    const isQuizCompleted = completedQuizzes.has(topic.id);
    const safeQuizQuestions = Array.isArray(topic.quiz?.questions) ? topic.quiz.questions : [];
    
    const totalItems = mandatoryMaterials.length + (safeQuizQuestions.length > 0 ? 1 : 0);
    const completedItems = completedMandatoryMaterials.length + (isQuizCompleted ? 1 : 0);
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const calculateSectionProgress = (section: Section): number => {
    let totalItems = 0;
    let completedItems = 0;
    const safeTopics = Array.isArray(section.topics) ? section.topics : [];
    
    safeTopics.forEach(topic => {
      const safeMaterials = Array.isArray(topic.materials) ? topic.materials : [];
      const mandatoryMaterials = safeMaterials.filter(m => m.isMandatory);
      totalItems += mandatoryMaterials.length;
      completedItems += mandatoryMaterials.filter(m => completedMaterials.has(m.id)).length;
      
      const safeQuizQuestions = Array.isArray(topic.quiz?.questions) ? topic.quiz.questions : [];
      if (safeQuizQuestions.length > 0) {
        totalItems += 1;
        if (completedQuizzes.has(topic.id)) {
          completedItems += 1;
        }
      }
    });
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const selectedSection = safeSections.find(section => section.id === selectedSectionId);
  const selectedTopic = selectedSection?.topics?.find(topic => topic.id === selectedTopicId);
  const selectedMaterial = selectedTopic?.materials?.find(material => material.id === selectedMaterialId);

  // Navigation functions
  const getCurrentTopic = (): Topic | undefined => {
    return selectedSection?.topics?.find(topic => topic.id === selectedTopicId);
  };

  const getCurrentMaterialIndex = (): number => {
    if (!selectedTopic || !selectedMaterialId) return -1;
    const safeMaterials = Array.isArray(selectedTopic.materials) ? selectedTopic.materials : [];
    return safeMaterials.findIndex(m => m.id === selectedMaterialId);
  };

  const handleNext = (): void => {
    const currentTopic = getCurrentTopic();
    if (!currentTopic) return;

    const safeMaterials = Array.isArray(currentTopic.materials) ? currentTopic.materials : [];
    const safeQuizQuestions = Array.isArray(currentTopic.quiz?.questions) ? currentTopic.quiz.questions : [];
    const safeDrillQuestions = Array.isArray(currentTopic.drill?.questions) ? currentTopic.drill.questions : [];

    // Navigation within materials
    if (selectedContentType === 'material' && selectedMaterialId) {
      const materialIndex = getCurrentMaterialIndex();
      const nextMaterial = safeMaterials[materialIndex + 1];
      
      if (nextMaterial) {
        selectContent(currentTopic.id, 'material', nextMaterial.id);
      } else {
        // If last material, move to quiz or drill
        if (safeQuizQuestions.length > 0) {
          selectContent(currentTopic.id, 'quiz');
        } else if (safeDrillQuestions.length > 0) {
          selectContent(currentTopic.id, 'drill');
        } else {
          // Return to topic list if no quiz/drill
          setSelectedTopicId(null);
        }
      }
    }
    // Navigation from quiz to drill
    else if (selectedContentType === 'quiz') {
      // Move to drill if available
      if (safeDrillQuestions.length > 0) {
        selectContent(currentTopic.id, 'drill');
      } else {
        // If no drill, return to topic list
        setSelectedTopicId(null);
      }
    }
    // Navigation from drill back to topic list
    else if (selectedContentType === 'drill') {
      setSelectedTopicId(null);
    }
  };

  const handlePrev = (): void => {
    const currentTopic = getCurrentTopic();
    if (!currentTopic) return;

    const safeMaterials = Array.isArray(currentTopic.materials) ? currentTopic.materials : [];
    const safeQuizQuestions = Array.isArray(currentTopic.quiz?.questions) ? currentTopic.quiz.questions : [];

    // Navigation within materials
    if (selectedContentType === 'material' && selectedMaterialId) {
      const materialIndex = getCurrentMaterialIndex();
      const prevMaterial = safeMaterials[materialIndex - 1];
      
      if (prevMaterial) {
        selectContent(currentTopic.id, 'material', prevMaterial.id);
      }
    }
    // Navigation from quiz to last material
    else if (selectedContentType === 'quiz') {
      const lastMaterial = safeMaterials[safeMaterials.length - 1];
      if (lastMaterial) {
        selectContent(currentTopic.id, 'material', lastMaterial.id);
      }
    }
    // Navigation from drill to quiz or last material
    else if (selectedContentType === 'drill') {
      if (safeQuizQuestions.length > 0) {
        selectContent(currentTopic.id, 'quiz');
      } else {
        const lastMaterial = safeMaterials[safeMaterials.length - 1];
        if (lastMaterial) {
          selectContent(currentTopic.id, 'material', lastMaterial.id);
        }
      }
    }
  };

  const isFirstMaterial = (): boolean => {
    if (!selectedTopic || !selectedMaterialId) return true;
    return getCurrentMaterialIndex() === 0;
  };

  const isLastContent = (): boolean => {
    const currentTopic = getCurrentTopic();
    if (!currentTopic) return true;
    
    const safeMaterials = Array.isArray(currentTopic.materials) ? currentTopic.materials : [];
    const safeQuizQuestions = Array.isArray(currentTopic.quiz?.questions) ? currentTopic.quiz.questions : [];
    const safeDrillQuestions = Array.isArray(currentTopic.drill?.questions) ? currentTopic.drill.questions : [];
    
    if (selectedContentType === 'material') {
      const materialIndex = getCurrentMaterialIndex();
      const isLastMaterial = materialIndex === safeMaterials.length - 1;
      
      // If last material and no quiz/drill
      return isLastMaterial && 
        safeQuizQuestions.length === 0 && 
        safeDrillQuestions.length === 0;
    } else if (selectedContentType === 'quiz') {
      // If quiz is last and no drill
      return safeDrillQuestions.length === 0;
    }
    // Drill is always last content
    return true;
  };

  const getProgressColor = (progress: number): "success" | "info" | "warning" | "danger" => {
    if (progress === 100) return 'success';
    if (progress >= 70) return 'info';
    if (progress >= 40) return 'warning';
    return 'danger';
  };

  // Don't render anything until mounted on client
  if (!mounted) {
    return (
      <div className="tw-min-h-screen tw-bg-gray-50 tw-flex tw-items-center tw-justify-center">
        <div className="tw-text-center">
          <div className="tw-animate-spin tw-rounded-full tw-h-32 tw-w-32 tw-border-b-2 tw-border-purple-600 tw-mx-auto"></div>
          <p className="tw-text-purple-600 tw-mt-4 tw-text-lg">Memuat preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-bg-gradient-to-br tw-from-purple-100 tw-via-pink-50 tw-to-indigo-100">
      <Container fluid className="tw-mx-2 tw-py-4 md:tw-py-8">
        {/* Course Details (only displayed before selecting section) */}
        {!selectedSectionId && (
          <Row>
            <Col xs={12}>
              <div className="tw-text-center tw-border-b tw-border-purple-200 tw-pb-6 tw-mb-8 tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-mx-2 md:tw-mx-4 tw-p-4 md:tw-p-6 tw-overflow-hidden tw-relative">
                <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-2 tw-bg-gradient-to-r tw-from-purple-500 tw-via-pink-500 tw-to-indigo-500"></div>
                
                <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-4 tw-mb-4">
                  <div className="tw-relative tw-group">
                    {courseImageUrl ? (
                      <img
                        src={courseImageUrl}
                        alt={courseTitle || 'Course Image'}
                        className="tw-w-full tw-max-w-sm tw-h-48 md:tw-h-64 tw-object-cover tw-rounded-xl tw-shadow-lg tw-border-4 tw-border-purple-300 tw-group-hover:tw-scale-105 tw-transition-transform tw-duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x250/9333EA/FFFFFF?text=📚+Course+Image';
                        }}
                      />
                    ) : (
                      <img
                        src={'https://www.code-intelligence.com/hubfs/Embedded%20Blog%20Thumbnails%20%2823%29.png'}
                        alt={courseTitle || 'Course Image'}
                        className="tw-w-full tw-max-w-sm tw-h-48 md:tw-h-64 tw-object-cover tw-rounded-xl tw-shadow-lg tw-border-4 tw-border-purple-300 tw-group-hover:tw-scale-105 tw-transition-transform tw-duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x250/9333EA/FFFFFF?text=📚+Course+Image';
                        }}
                      />
                    )}
                    <div className="tw-absolute tw-top-2 tw-right-2 tw-bg-purple-600 tw-text-white tw-rounded-full tw-p-2 tw-shadow-lg">
                      <Trophy size={20} />
                    </div>
                  </div>
                  
                  <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-3">
                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-3 tw-flex-wrap">
                      <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-p-3 tw-rounded-full tw-shadow-lg tw-animate-pulse">
                        <Award className="tw-text-white" size={32} />
                      </div>
                      <h1 className="tw-text-2xl md:tw-text-4xl tw-font-bold tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 tw-bg-clip-text tw-text-transparent tw-mb-0 tw-text-center">
                        {courseTitle || 'Judul Course Keren'}
                      </h1>
                      <Heart className="tw-text-pink-500 tw-animate-bounce" size={24} />
                    </div>
                    
                    <div className="tw-flex tw-items-center tw-gap-4 tw-flex-wrap tw-justify-center">
                      <div className="tw-flex tw-items-center tw-gap-2 tw-bg-purple-100 tw-px-3 tw-py-1 tw-rounded-full">
                        <Users className="tw-text-purple-600" size={16} />
                        <span className="tw-text-purple-700 tw-text-sm tw-font-medium">Untuk Pelajar</span>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-2 tw-bg-pink-100 tw-px-3 tw-py-1 tw-rounded-full">
                        <Target className="tw-text-pink-600" size={16} />
                        <span className="tw-text-pink-700 tw-text-sm tw-font-medium">Mudah Dipahami</span>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-2 tw-bg-indigo-100 tw-px-3 tw-py-1 tw-rounded-full">
                        <Zap className="tw-text-indigo-600" size={16} />
                        <span className="tw-text-indigo-700 tw-text-sm tw-font-medium">Interaktif</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="tw-text-gray-700 tw-text-sm md:tw-text-lg tw-px-4 tw-leading-relaxed tw-max-w-3xl tw-mx-auto">
                  {courseDescription || 'Deskripsi course yang menarik dan menginspirasi akan muncul di sini untuk memotivasi belajar!'}
                </p>
                
                {safeLearningPoints && safeLearningPoints.length > 0 && (
                  <div className="tw-mt-6 tw-bg-gradient-to-r tw-from-purple-50 tw-to-pink-50 tw-p-4 md:tw-p-6 tw-rounded-xl tw-border tw-border-purple-200">
                    <h3 className="tw-text-lg md:tw-text-xl tw-font-bold tw-text-purple-700 tw-mb-4 tw-flex tw-items-center tw-justify-center tw-gap-2">
                      <Star className="tw-text-yellow-500" size={24} />
                      Apa yang Akan Kamu Pelajari
                      <Star className="tw-text-yellow-500" size={24} />
                    </h3>
                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3 tw-max-w-4xl tw-mx-auto">
                      {safeLearningPoints.map((point, index) => (
                        <div key={index} className="tw-flex tw-items-start tw-gap-3 tw-bg-white tw-p-3 tw-rounded-lg tw-shadow-sm tw-border tw-border-purple-100 tw-hover:tw-shadow-md tw-transition-all tw-duration-200">
                          <div className="tw-bg-gradient-to-r tw-from-purple-400 tw-to-pink-400 tw-text-white tw-rounded-full tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center tw-flex-shrink-0 tw-text-sm tw-font-bold">
                            {index + 1}
                          </div>
                          <span className="tw-text-gray-700 tw-text-sm md:tw-text-base tw-leading-relaxed">
                            {point || 'Poin pembelajaran yang menarik dan bermanfaat'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buy Button */}
                <div className="tw-mt-8 tw-bg-gradient-to-r tw-from-indigo-50 tw-to-purple-50 tw-p-6 tw-rounded-xl tw-border-2 tw-border-purple-300 tw-shadow-lg tw-max-w-xl tw-mx-auto">
                  <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-between tw-gap-4">
                    <div className="tw-flex tw-items-center tw-gap-3">
                      <div className="tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-600 tw-p-3 tw-rounded-full">
                        <ShoppingCart className="tw-text-white" size={24} />
                      </div>
                      <div>
                        <div className="tw-flex tw-items-baseline tw-gap-2">
                          <span className="tw-text-2xl tw-font-bold tw-text-purple-700">Rp50.000</span>
                          <span className="tw-text-gray-500 tw-line-through">Rp70.000</span>
                          <Badge bg="danger" className="tw-animate-pulse">
                            Promo 30%
                          </Badge>
                        </div>
                        <p className="tw-text-gray-600 tw-text-sm tw-mb-0">
                          Akses seumur hidup untuk semua materi
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="primary" 
                      size="lg"
                      className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 tw-border-0 tw-shadow-lg hover:tw-scale-105 tw-transition-transform tw-duration-300 tw-font-bold tw-px-6"
                    >
                      Beli Sekarang
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        )}

        {!selectedSectionId ? (
          <Row className="tw-justify-center">
            <Col xs={12} xl={11}>
              <Card className="tw-border-0 tw-shadow-2xl tw-bg-white tw-rounded-2xl tw-overflow-hidden">
                <Card.Header className="tw-bg-gradient-to-r tw-from-purple-600 tw-via-purple-700 tw-to-indigo-600 tw-text-white tw-p-6 tw-relative tw-overflow-hidden">
                  <div className="tw-absolute tw-top-0 tw-right-0 tw-w-32 tw-h-32 tw-bg-white tw-opacity-10 tw-rounded-full tw--mr-16 tw--mt-16"></div>
                  <div className="tw-flex tw-items-center tw-justify-center tw-gap-3 tw-relative tw-z-10">
                    <div className="tw-bg-white tw-bg-opacity-20 tw-p-3 tw-rounded-full">
                      <BookOpen className="tw-text-white" size={28} />
                    </div>
                    <h2 className="tw-text-xl md:tw-text-2xl tw-font-bold tw-mb-0">Pilih Section untuk Memulai Belajar!</h2>
                    <div className="tw-bg-yellow-400 tw-p-2 tw-rounded-full tw-animate-pulse">
                      <Star className="tw-text-yellow-800" size={20} />
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="tw-p-6">
                  <div className="tw-space-y-4">
                    {safeSections.map((section, index) => {
                      const progress = calculateSectionProgress(section);
                      const safeTopics = Array.isArray(section.topics) ? section.topics : [];
                      
                      return (
                        <div
                          key={section.id}
                          className="tw-group tw-cursor-pointer tw-bg-gradient-to-r tw-from-white tw-to-purple-50 tw-border-2 tw-border-purple-200 tw-rounded-xl tw-p-5 tw-hover:tw-shadow-lg tw-hover:tw-border-purple-400 tw-transition-all tw-duration-300 tw-hover:tw-scale-105 tw-hover:tw-from-purple-50 tw-hover:tw-to-pink-50"
                          onClick={() => setSelectedSectionId(section.id)}
                          onMouseEnter={() => setHoveredSectionId(section.id)}
                          onMouseLeave={() => setHoveredSectionId(null)}
                        >
                          <div className="tw-flex tw-justify-between tw-items-start tw-mb-4">
                            <div className="tw-flex-1">
                              <div className="tw-flex tw-items-center tw-gap-3 tw-mb-3 tw-flex-wrap">
                                <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-text-white tw-rounded-full tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-sm">
                                  {index + 1}
                                </div>
                                <Badge bg={progress === 100 ? 'success' : progress >= 50 ? 'warning' : 'secondary'} className="tw-flex tw-items-center tw-gap-1 tw-text-sm">
                                  {progress === 100 && <Trophy size={12} />}
                                  {progress}%
                                </Badge>
                                <span className="tw-text-purple-800 tw-font-bold tw-text-sm md:tw-text-lg tw-break-words">
                                  {section.title || 'Judul Section Menarik'}
                                </span>
                              </div>
                              
                              {section.description && (
                                <p className="tw-text-gray-600 tw-text-sm tw-mb-3 tw-leading-relaxed">
                                  {section.description}
                                </p>
                              )}
                              
                              <div className="tw-flex tw-items-center tw-gap-4 tw-mb-3 tw-flex-wrap">
                                {section.duration && (
                                  <div className="tw-flex tw-items-center tw-gap-2 tw-text-purple-600">
                                    <Clock size={16} />
                                    <span className="tw-text-sm tw-font-medium">{formatDuration(section.duration)}</span>
                                  </div>
                                )}
                                <div className="tw-flex tw-items-center tw-gap-2 tw-text-indigo-600">
                                  <BookOpen size={16} />
                                  <span className="tw-text-sm tw-font-medium">{safeTopics.length} topik seru</span>
                                </div>
                              </div>
                              
                              <ProgressBar 
                                variant={getProgressColor(progress)} 
                                now={progress} 
                                className="tw-h-3 tw-rounded-full tw-shadow-inner"
                                style={{background: '#f3f4f6'}}
                              />
                            </div>
                            <div className="tw-ml-4 tw-flex tw-items-center tw-gap-2">
                              <div className="tw-bg-purple-100 tw-group-hover:tw-bg-purple-200 tw-p-2 tw-rounded-full tw-transition-colors">
                                <ChevronRight className="tw-text-purple-600 tw-group-hover:tw-text-purple-800 tw-transition-colors" size={24} />
                              </div>
                            </div>
                          </div>

                          {/* Topic List on Hover */}
                          {hoveredSectionId === section.id && (
                            <div className="tw-mt-4 tw-border-t tw-border-purple-200 tw-pt-4">
                              <h4 className="tw-text-sm tw-font-bold tw-text-purple-700 tw-mb-3">Topik Pembelajaran:</h4>
                              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-2">
                                {safeTopics.slice(0, 3).map((topic, topicIndex) => (
                                  <div key={topic.id} className="tw-flex tw-items-center tw-gap-2 tw-bg-purple-50 tw-p-2 tw-rounded-lg">
                                    <div className="tw-bg-purple-200 tw-text-purple-800 tw-rounded-full tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center tw-text-xs">
                                      {topicIndex + 1}
                                    </div>
                                    <span className="tw-text-xs tw-text-purple-700 tw-truncate">
                                      {topic.title || `Topik ${topicIndex + 1}`}
                                    </span>
                                  </div>
                                ))}
                                {safeTopics.length > 3 && (
                                  <div className="tw-bg-gradient-to-r tw-from-purple-100 tw-to-pink-100 tw-p-2 tw-rounded-lg tw-text-center">
                                    <span className="tw-text-xs tw-text-purple-600">
                                      +{safeTopics.length - 3} topik lainnya
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <div className="tw-relative">
            <Row>
              <Col 
                xs={12} 
                lg={sidebarCollapsed ? 1 : 4} 
                className={`tw-mb-4 lg:tw-mb-0 tw-transition-all tw-duration-300 ${
                  isMobile && sidebarCollapsed ? 'tw-hidden' : ''
                }`}
              >
                <Card className="tw-border-0 tw-shadow-2xl tw-bg-white tw-rounded-2xl tw-overflow-hidden tw-sticky" style={{top: '20px'}}>
                  <Card.Header className="tw-bg-gradient-to-r tw-from-purple-600 tw-via-purple-700 tw-to-indigo-600 tw-text-white tw-p-4 tw-relative tw-overflow-hidden">
                    <div className="tw-absolute tw-top-0 tw-left-0 tw-w-20 tw-h-20 tw-bg-white tw-opacity-10 tw-rounded-full tw--ml-10 tw--mt-10"></div>
                    <div className="tw-flex tw-justify-between tw-items-center tw-relative tw-z-10">
                      {!sidebarCollapsed && (
                        <div className="tw-flex-1 tw-mr-3">
                          <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                            <BookOpen className="tw-text-white" size={20} />
                            <h3 className="tw-text-sm md:tw-text-lg tw-font-bold tw-mb-0 tw-truncate">
                              {selectedSection?.title || 'Judul Section'}
                            </h3>
                          </div>
                          <div className="tw-flex tw-items-center tw-gap-3 tw-flex-wrap">
                            <Badge bg="light" text="dark" className="tw-text-xs tw-flex tw-items-center tw-gap-1">
                              <Trophy size={10} />
                              {calculateSectionProgress(selectedSection!)}% selesai
                            </Badge>
                            {selectedSection?.duration && (
                              <Badge bg="warning" className="tw-text-xs tw-flex tw-items-center tw-gap-1">
                                <Clock size={10} />
                                {formatDuration(selectedSection.duration)}
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
                        {!sidebarCollapsed && (
                          <Button
                            variant="outline-light"
                            size="sm"
                            className="tw-border-2 tw-rounded-lg tw-hover:tw-bg-white tw-hover:tw-text-purple-600 tw-transition-colors"
                            onClick={() => setSelectedSectionId(null)}
                          >
                            Kembali
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Header>
                  {!sidebarCollapsed && (
                    <Card.Body className="tw-p-0 tw-max-h-96 tw-overflow-y-auto tw-scrollbar-thin tw-scrollbar-thumb-purple-300 tw-scrollbar-track-purple-100">
                      {selectedSection && Array.isArray(selectedSection.topics) && selectedSection.topics.map((topic, topicIndex) => {
                        const topicProgress = calculateTopicProgress(topic);
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
                                    <span className="tw-text-purple-800 tw-font-semibold tw-text-xs md:tw-text-sm tw-break-words">
                                      {topic.title || 'Judul Topik Menarik'}
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
                                      <ChevronDown className="tw-text-purple-600" size={18} />
                                    ) : (
                                      <ChevronRight className="tw-text-purple-600" size={18} />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {expandedTopics.has(topic.id) && (
                              <div className="tw-bg-gradient-to-r tw-from-purple-25 tw-to-pink-25 tw-border-t tw-border-purple-100">
                                {Array.isArray(topic.materials) && topic.materials.map((material, materialIndex) => (
                                  <div
                                    key={material.id}
                                    className={`tw-px-6 tw-py-3 tw-cursor-pointer tw-border-b tw-border-purple-50 tw-hover:tw-bg-purple-100 tw-transition-colors ${
                                      selectedTopicId === topic.id &&
                                      selectedContentType === 'material' &&
                                      selectedMaterialId === material.id
                                        ? 'tw-bg-purple-200 tw-border-l-4 tw-border-l-purple-500'
                                        : ''
                                    }`}
                                    onClick={() => selectContent(topic.id, 'material', material.id)}
                                  >
                                    <div className="tw-flex tw-items-center tw-gap-2">
                                      <div className="tw-flex tw-items-center tw-gap-2 tw-flex-1 tw-min-w-0">
                                        <BookOpen className="tw-text-purple-600 tw-flex-shrink-0" size={14} />
                                        <span className="tw-text-xs tw-text-purple-700 tw-truncate tw-font-medium">
                                          Materi {materialIndex + 1}: {material.title || 'Judul Materi'}
                                        </span>
                                      </div>
                                      <div className="tw-flex tw-items-center tw-gap-1 tw-flex-shrink-0">
                                        {completedMaterials.has(material.id) && (
                                          <Badge bg="success" className="tw-text-xs">
                                            <Check size={10} />
                                          </Badge>
                                        )}
                                        {material.isMandatory && (
                                          <Badge bg="danger" className="tw-text-xs">
                                            Wajib
                                          </Badge>
                                        )}
                                        {material.hasVideo && (
                                          <Badge bg="info" className="tw-text-xs tw-flex tw-items-center tw-gap-1">
                                            <Play size={8} />
                                            Video
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <div
                                  className={`tw-px-6 tw-py-3 tw-cursor-pointer tw-border-b tw-border-purple-50 tw-hover:tw-bg-purple-100 tw-transition-colors ${
                                    selectedTopicId === topic.id && selectedContentType === 'quiz'
                                      ? 'tw-bg-purple-200 tw-border-l-4 tw-border-l-purple-500'
                                      : ''
                                  }`}
                                  onClick={() => selectContent(topic.id, 'quiz')}
                                >
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <FileText className="tw-text-purple-600 tw-flex-shrink-0" size={14} />
                                    <span className="tw-text-xs tw-text-purple-700 tw-flex-1 tw-font-medium">Quiz Seru</span>
                                    {completedQuizzes.has(topic.id) && (
                                      <Badge bg="success" className="tw-text-xs">
                                        <Check size={10} />
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div
                                  className={`tw-px-6 tw-py-3 tw-cursor-pointer tw-hover:tw-bg-purple-100 tw-transition-colors ${
                                    selectedTopicId === topic.id && selectedContentType === 'drill'
                                      ? 'tw-bg-purple-200 tw-border-l-4 tw-border-l-purple-500'
                                      : ''
                                  }`}
                                  onClick={() => selectContent(topic.id, 'drill')}
                                >
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <CheckSquare className="tw-text-purple-600 tw-flex-shrink-0" size={14} />
                                    <span className="tw-text-xs tw-text-purple-700 tw-flex-1 tw-font-medium">Latihan Drill</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </Card.Body>
                  )}
                </Card>
              </Col>

              <Col xs={12} lg={sidebarCollapsed ? 11 : 8}>
                <div className="tw-space-y-6">
                  {isMobile && sidebarCollapsed && (
                    <div className="tw-flex tw-justify-between tw-items-center tw-bg-white tw-p-4 tw-rounded-xl tw-shadow-lg tw-border tw-border-purple-200">
                      <div className="tw-flex tw-items-center tw-gap-3">
                        <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-p-2 tw-rounded-full">
                          <BookOpen className="tw-text-white" size={16} />
                        </div>
                        <span className="tw-text-purple-800 tw-font-bold tw-text-sm">
                          {selectedSection?.title || 'Judul Section'}
                        </span>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="tw-rounded-lg"
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
                            Pilih Topik yang Ingin Dipelajari! 🚀
                          </h2>
                        </div>
                      </Card.Header>
                      <Card.Body className="tw-p-6 tw-bg-gradient-to-br tw-from-purple-50 tw-to-pink-50">
                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                          {selectedSection && Array.isArray(selectedSection.topics) && selectedSection.topics.map((topic, topicIndex) => {
                            const topicProgress = calculateTopicProgress(topic);
                            const safeMaterials = Array.isArray(topic.materials) ? topic.materials : [];
                            return (
                              <div
                                key={topic.id}
                                className="tw-group tw-cursor-pointer tw-bg-white tw-border-2 tw-border-purple-200 tw-rounded-xl tw-p-6 tw-hover:tw-shadow-xl tw-hover:tw-border-purple-400 tw-transition-all tw-duration-300 tw-hover:tw-scale-105 tw-hover:tw-bg-gradient-to-br tw-hover:tw-from-purple-50 tw-hover:tw-to-pink-50"
                                onClick={() => selectContent(topic.id, 'material', safeMaterials[0]?.id)}
                              >
                                <div className="tw-flex tw-items-start tw-justify-between tw-mb-4">
                                  <div className="tw-flex tw-items-center tw-gap-3">
                                    <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-text-white tw-rounded-full tw-w-10 tw-h-10 tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-lg tw-shadow-lg">
                                      {topicIndex + 1}
                                    </div>
                                    <div>
                                      <h3 className="tw-text-purple-800 tw-font-bold tw-text-lg tw-mb-1">
                                        {topic.title || 'Topik Seru Menanti!'}
                                      </h3>
                                      <Badge bg={topicProgress === 100 ? 'success' : topicProgress >= 50 ? 'warning' : 'secondary'} className="tw-flex tw-items-center tw-gap-1 tw-text-sm">
                                        {topicProgress === 100 && <Trophy size={12} />}
                                        Progress: {topicProgress}%
                                      </Badge>
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
                                </div>

                                <div className="tw-space-y-3">
                                  <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm">
                                    <BookOpen className="tw-text-purple-600" size={16} />
                                    <span className="tw-text-purple-700 tw-font-medium">
                                      {safeMaterials.length} Materi Pembelajaran
                                    </span>
                                  </div>
                                  {Array.isArray(topic.quiz?.questions) && topic.quiz.questions.length > 0 && (
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm">
                                      <FileText className="tw-text-pink-600" size={16} />
                                      <span className="tw-text-pink-700 tw-font-medium">
                                        Quiz dengan {topic.quiz.questions.length} Soal
                                      </span>
                                    </div>
                                  )}
                                  <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm">
                                    <CheckSquare className="tw-text-indigo-600" size={16} />
                                    <span className="tw-text-indigo-700 tw-font-medium">
                                      Latihan Drill Interaktif
                                    </span>
                                  </div>
                                </div>

                                {safeMaterials.some(m => m.isMandatory) && (
                                  <div className="tw-mt-4 tw-pt-3 tw-border-t tw-border-purple-200">
                                    <Badge bg="danger" className="tw-text-xs tw-animate-pulse">
                                      ⭐ Ada Materi Wajib
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
                            Pilih topik di atas untuk memulai perjalanan belajar yang seru dan menyenangkan! 🎯
                          </p>
                        </div>
                      </Card.Body>
                    </Card>
                  ) : (
                    <div className="tw-space-y-6">
                      {/* Material Content */}
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
                                    {selectedMaterial.title || 'Materi Pembelajaran Seru'}
                                  </h3>
                                  <div className="tw-flex tw-items-center tw-gap-2 tw-flex-wrap">
                                    {selectedMaterial.isMandatory && (
                                      <Badge bg="warning" className="tw-text-xs tw-animate-pulse">
                                        ⭐ Wajib Dipelajari
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
                                onClick={() => markMaterialComplete(selectedMaterial.id)}
                              >
                                {completedMaterials.has(selectedMaterial.id) ? (
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <Check size={16} />
                                    Selesai! 🎉
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
                            {selectedMaterial.hasVideo && (
                              <div className="tw-mb-6 tw-bg-white tw-p-4 tw-rounded-xl tw-shadow-lg tw-border tw-border-purple-200">
                                <div className="tw-flex tw-items-center tw-gap-3 tw-mb-4">
                                  <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-p-2 tw-rounded-full">
                                    <Play className="tw-text-white" size={20} />
                                  </div>
                                  <h4 className="tw-text-purple-800 tw-font-bold tw-text-lg tw-mb-0">
                                    Video Pembelajaran 🎬
                                  </h4>
                                </div>
                                {selectedMaterial.videoType === 'url' && selectedMaterial.videoUrl ? (
                                  <div className="tw-aspect-video tw-bg-gray-100 tw-rounded-lg tw-overflow-hidden tw-shadow-inner">
                                    <iframe
                                      src={selectedMaterial.videoUrl}
                                      className="tw-w-full tw-h-full tw-border-0"
                                      allowFullScreen
                                      title="Video Pembelajaran"
                                    />
                                  </div>
                                ) : selectedMaterial.videoType === 'upload' && selectedMaterial.videoFile ? (
                                  <div className="tw-aspect-video tw-bg-gray-100 tw-rounded-lg tw-overflow-hidden tw-shadow-inner">
                                    <video
                                      controls
                                      className="tw-w-full tw-h-full tw-object-cover"
                                      src={URL.createObjectURL(selectedMaterial.videoFile)}
                                    />
                                  </div>
                                ) : (
                                  <div className="tw-aspect-video tw-bg-gradient-to-br tw-from-purple-100 tw-to-pink-100 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-border-2 tw-border-dashed tw-border-purple-300">
                                    <div className="tw-text-center">
                                      <Play className="tw-text-purple-400 tw-mx-auto tw-mb-2" size={48} />
                                      <p className="tw-text-purple-600 tw-font-medium">
                                        Video akan muncul di sini 🎥
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
                                  Materi Pembelajaran 📚
                                </h4>
                              </div>
                              <div className="tw-prose tw-max-w-none tw-text-gray-700 tw-leading-relaxed">
                                {selectedMaterial.content ? (
                                  <div dangerouslySetInnerHTML={{ __html: selectedMaterial.content }} />
                                ) : (
                                  <div className="tw-text-center tw-py-12 tw-bg-gradient-to-br tw-from-purple-50 tw-to-pink-50 tw-rounded-lg tw-border-2 tw-border-dashed tw-border-purple-300">
                                    <BookOpen className="tw-text-purple-400 tw-mx-auto tw-mb-4" size={64} />
                                    <h3 className="tw-text-purple-600 tw-font-bold tw-text-xl tw-mb-2">
                                      Materi Pembelajaran Menarik! 
                                    </h3>
                                    <p className="tw-text-purple-500 tw-text-lg">
                                      Konten edukatif yang seru akan ditampilkan di sini untuk membantu kamu belajar dengan mudah dan menyenangkan! 🌟
                                    </p>
                                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-3 tw-mt-4">
                                      <Heart className="tw-text-pink-500 tw-animate-bounce" size={20} />
                                      <Star className="tw-text-yellow-500 tw-animate-pulse" size={20} />
                                      <Zap className="tw-text-indigo-500 tw-animate-bounce" size={20} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card.Body>
                          <Card.Footer className="tw-bg-white tw-border-t tw-border-purple-200 tw-p-4">
                            <div className="tw-flex tw-justify-between">
                              <Button
                                variant="outline-primary"
                                disabled={isFirstMaterial()}
                                onClick={handlePrev}
                                className="tw-flex tw-items-center tw-gap-2"
                              >
                                <ChevronLeft size={16} />
                                Sebelumnya
                              </Button>
                              
                              <Button
                                variant="primary"
                                onClick={handleNext}
                                className="tw-flex tw-items-center tw-gap-2 tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 tw-border-0"
                              >
                                Berikutnya
                                <ChevronRight size={16} />
                              </Button>
                            </div>
                          </Card.Footer>
                        </Card>
                      )}

                      {/* Quiz Content */}
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
                                    Quiz: {selectedTopic.quiz?.title || selectedTopic.title} 🧠
                                  </h3>
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <Badge bg="light" text="dark" className="tw-text-xs">
                                      {Array.isArray(selectedTopic.quiz?.questions) ? selectedTopic.quiz.questions.length : 0} Soal Seru
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant={completedQuizzes.has(selectedTopic.id) ? "success" : "warning"}
                                className="tw-px-4 tw-py-2 tw-rounded-lg tw-font-bold tw-transition-all tw-duration-300 tw-hover:tw-scale-105"
                                onClick={() => markQuizComplete(selectedTopic.id)}
                              >
                                {completedQuizzes.has(selectedTopic.id) ? (
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <Trophy size={16} />
                                    Quiz Selesai! 🏆
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
                            {Array.isArray(selectedTopic.quiz?.questions) && selectedTopic.quiz.questions.length > 0 ? (
                              <div className="tw-space-y-4">
                                <div className="tw-bg-white tw-p-6 tw-rounded-xl tw-shadow-lg tw-border tw-border-pink-200">
                                  <div className="tw-text-center tw-mb-6">
                                    <h4 className="tw-text-purple-800 tw-font-bold tw-text-xl tw-mb-2">
                                      Siap untuk Tantangan Quiz? 🚀
                                    </h4>
                                    <p className="tw-text-gray-600">
                                      Quiz ini berisi {selectedTopic.quiz.questions.length} soal yang akan menguji pemahamanmu!
                                    </p>
                                  </div>
                                  
                                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4 tw-mb-6">
                                    <div className="tw-bg-gradient-to-r tw-from-purple-100 tw-to-pink-100 tw-p-4 tw-rounded-lg tw-text-center">
                                      <FileText className="tw-text-purple-600 tw-mx-auto tw-mb-2" size={32} />
                                      <h5 className="tw-text-purple-800 tw-font-bold">Soal Menarik</h5>
                                      <p className="tw-text-purple-600 tw-text-sm">{selectedTopic.quiz.questions.length} pertanyaan</p>
                                    </div>
                                    <div className="tw-bg-gradient-to-r tw-from-pink-100 tw-to-purple-100 tw-p-4 tw-rounded-lg tw-text-center">
                                      <Clock className="tw-text-pink-600 tw-mx-auto tw-mb-2" size={32} />
                                      <h5 className="tw-text-pink-800 tw-font-bold">Waktu Fleksibel</h5>
                                      <p className="tw-text-pink-600 tw-text-sm">Kerjakan dengan santai</p>
                                    </div>
                                    <div className="tw-bg-gradient-to-r tw-from-indigo-100 tw-to-purple-100 tw-p-4 tw-rounded-lg tw-text-center">
                                      <Trophy className="tw-text-indigo-600 tw-mx-auto tw-mb-2" size={32} />
                                      <h5 className="tw-text-indigo-800 tw-font-bold">Hasil Instant</h5>
                                      <p className="tw-text-indigo-600 tw-text-sm">Lihat nilai langsung</p>
                                    </div>
                                  </div>

                                  {!completedQuizzes.has(selectedTopic.id) ? (
                                    <div className="tw-text-center">
                                      <Button
                                        variant="primary"
                                        size="lg"
                                        className="tw-px-8 tw-py-3 tw-rounded-xl tw-font-bold tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 tw-border-0 tw-shadow-lg tw-hover:tw-scale-105 tw-transition-all tw-duration-300"
                                        onClick={() => markQuizComplete(selectedTopic.id)}
                                      >
                                        <div className="tw-flex tw-items-center tw-gap-3">
                                          <Play size={20} />
                                          Mulai Quiz Sekarang! 🎯
                                        </div>
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="tw-text-center tw-bg-gradient-to-r tw-from-green-100 tw-to-emerald-100 tw-p-6 tw-rounded-xl tw-border-2 tw-border-green-300">
                                      <Trophy className="tw-text-green-600 tw-mx-auto tw-mb-3 tw-animate-bounce" size={48} />
                                      <h4 className="tw-text-green-800 tw-font-bold tw-text-xl tw-mb-2">
                                        Selamat! Quiz Sudah Selesai! 🎉
                                      </h4>
                                      <p className="tw-text-green-700">
                                        Kamu telah menyelesaikan quiz ini dengan baik. Lanjutkan ke materi berikutnya!
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="tw-text-center tw-py-12 tw-bg-white tw-rounded-xl tw-shadow-lg tw-border tw-border-pink-200">
                                <FileText className="tw-text-pink-400 tw-mx-auto tw-mb-4" size={64} />
                                <h3 className="tw-text-pink-600 tw-font-bold tw-text-xl tw-mb-2">
                                  Quiz Sedang Disiapkan! 
                                </h3>
                                <p className="tw-text-pink-500 tw-text-lg">
                                  Quiz yang seru dan menantang akan segera hadir untuk menguji pemahamanmu! 🧠✨
                                </p>
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
                                disabled={!completedQuizzes.has(selectedTopic.id)}
                                className="tw-flex tw-items-center tw-gap-2 tw-bg-gradient-to-r tw-from-pink-600 tw-to-purple-600 tw-border-0"
                              >
                                {Array.isArray(selectedTopic.drill?.questions) && selectedTopic.drill.questions.length > 0 ? "Lanjut ke Drill" : "Selesai"}
                                <ChevronRight size={16} />
                              </Button>
                            </div>
                          </Card.Footer>
                        </Card>
                      )}

                      {/* Drill Content */}
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
                                  Latihan Drill: {selectedTopic.drill?.title || selectedTopic.title} 💪
                                </h3>
                                <Badge bg="light" text="dark" className="tw-text-xs">
                                  Latihan Interaktif
                                </Badge>
                              </div>
                            </div>
                          </Card.Header>
                          <Card.Body className="tw-p-6 tw-bg-gradient-to-br tw-from-indigo-25 tw-to-purple-25">
                            {completedQuizzes.has(selectedTopic.id) ? (
                              <div className="tw-text-center tw-py-12 tw-bg-white tw-rounded-xl tw-shadow-lg tw-border tw-border-indigo-200">
                                <CheckSquare className="tw-text-indigo-400 tw-mx-auto tw-mb-4" size={64} />
                                <h3 className="tw-text-indigo-600 tw-font-bold tw-text-xl tw-mb-2">
                                  Latihan Drill Menanti! 
                                </h3>
                                <p className="tw-text-indigo-500 tw-text-lg tw-mb-4">
                                  Latihan soal interaktif yang akan membantu memperkuat pemahamanmu! 🎯
                                </p>
                                <Button
                                  variant="primary"
                                  size="lg"
                                  className="tw-px-6 tw-py-3 tw-rounded-xl tw-font-bold tw-bg-gradient-to-r tw-from-indigo-600 tw-to-purple-600 tw-border-0 tw-shadow-lg"
                                >
                                  Mulai Drill
                                </Button>
                              </div>
                            ) : (
                              <div className="tw-text-center tw-py-12 tw-bg-white tw-rounded-xl tw-shadow-lg tw-border tw-border-indigo-200">
                                <FileText className="tw-text-yellow-500 tw-mx-auto tw-mb-4" size={64} />
                                <h3 className="tw-text-yellow-600 tw-font-bold tw-text-xl tw-mb-2">
                                  Selesaikan Quiz Dulu!
                                </h3>
                                <p className="tw-text-yellow-600 tw-text-lg tw-mb-4">
                                  Untuk memulai drill, selesaikan quiz dulu yaa 😊
                                </p>
                                <Button
                                  variant="primary"
                                  size="lg"
                                  className="tw-px-6 tw-py-3 tw-rounded-xl tw-font-bold tw-bg-gradient-to-r tw-from-yellow-600 tw-to-orange-600 tw-border-0 tw-shadow-lg"
                                  onClick={() => selectContent(selectedTopic.id, 'quiz')}
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
                                  // Kembali ke daftar topik
                                  setSelectedTopicId(null);
                                  setSelectedContentType(null);
                                }}
                                className="tw-flex tw-items-center tw-gap-2 tw-bg-gradient-to-r tw-from-indigo-600 tw-to-purple-600 tw-border-0"
                              >
                                Selesai
                                <Check size={16} />
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
        )}
      </Container>
    </div>
  );
};

export default PreviewComponent;