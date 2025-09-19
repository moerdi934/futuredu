// pages/panel/courses/courses-page/create/Sidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronDown, BookOpen, PlayCircle, FileText, HelpCircle, Target, Menu, ChevronLeft } from 'lucide-react';

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

interface SidebarProps {
  courseTitle: string;
  sections: Section[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  scrollToElement: (elementId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  courseTitle,
  sections,
  sidebarOpen,
  setSidebarOpen,
  scrollToElement
}) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Ensure component only runs on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSection = (index: number): void => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  // Safe data with fallbacks
  const safeSections = Array.isArray(sections) ? sections : [];
  const safeCourseTitle = courseTitle || '';

  const sampleData = {
    courseTitle: "Fundamental Programming with React",
    sections: [
      {
        id: 1,
        title: "Introduction to React",
        topics: [
          {
            id: 1,
            title: "What is React?",
            materials: [
              { id: 1, title: "React Overview", isMandatory: true, hasVideo: true, videoType: 'url' as const, videoFile: null, videoUrl: '', content: '' },
              { id: 2, title: "Setting up Environment", isMandatory: false, hasVideo: false, videoType: 'upload' as const, videoFile: null, videoUrl: '', content: '' }
            ],
            quiz: { title: "React Basics Quiz", questions: [{id: 1, code: 'Q1'}, {id: 2, code: 'Q2'}, {id: 3, code: 'Q3'}] },
            drill: { title: "Practice Exercises", questions: [{id: 1, code: 'D1'}, {id: 2, code: 'D2'}] }
          },
          {
            id: 2,
            title: "JSX and Components",
            materials: [
              { id: 3, title: "Understanding JSX", isMandatory: true, hasVideo: true, videoType: 'url' as const, videoFile: null, videoUrl: '', content: '' }
            ],
            quiz: { title: "JSX Quiz", questions: [{id: 4, code: 'Q4'}] },
            drill: { title: "Component Practice", questions: [{id: 3, code: 'D3'}, {id: 4, code: 'D4'}, {id: 5, code: 'D5'}] }
          }
        ]
      },
      {
        id: 2,
        title: "Advanced React Concepts",
        topics: [
          {
            id: 3,
            title: "State Management",
            materials: [
              { id: 4, title: "useState Hook", isMandatory: true, hasVideo: true, videoType: 'url' as const, videoFile: null, videoUrl: '', content: '' },
              { id: 5, title: "useEffect Hook", isMandatory: false, hasVideo: false, videoType: 'upload' as const, videoFile: null, videoUrl: '', content: '' }
            ],
            quiz: { title: "Hooks Quiz", questions: [{id: 5, code: 'Q5'}, {id: 6, code: 'Q6'}] },
            drill: { title: "State Practice", questions: [{id: 6, code: 'D6'}] }
          }
        ]
      }
    ]
  };

  const displaySections = safeSections.length > 0 ? safeSections : sampleData.sections;
  const displayCourseTitle = safeCourseTitle || sampleData.courseTitle;

  // Don't render anything until mounted on client
  if (!mounted) {
    return (
      <div className="tw-fixed tw-top-4 tw-right-4 tw-z-50 tw-bg-white tw-p-4 tw-rounded-lg tw-shadow-lg">
        <div className="tw-text-purple-600">Memuat sidebar...</div>
      </div>
    );
  }

  return (
    <>
      {/* Overlay - dims content when sidebar is shown */}
      {sidebarOpen && (
        <div 
          className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-z-40 tw-transition-opacity tw-duration-300 lg:tw-hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Collapse Toggle Button - Fixed Position */}
      <button
        onClick={toggleCollapse}
        className={`tw-fixed tw-top-4 tw-z-[60] tw-bg-purple-600 hover:tw-bg-purple-700 tw-text-white tw-p-3 tw-rounded-l-lg tw-shadow-lg tw-transition-all tw-duration-300 tw-ease-in-out tw-border-none tw-hidden lg:tw-block ${
          isCollapsed ? 'tw-right-0' : 'tw-right-80'
        }`}
        title={isCollapsed ? 'Tampilkan Sidebar' : 'Sembunyikan Sidebar'}
      >
        {isCollapsed ? (
          <ChevronLeft className="tw-w-5 tw-h-5" />
        ) : (
          <ChevronRight className="tw-w-5 tw-h-5" />
        )}
      </button>

      {/* Sidebar Container */}
      <div className={`tw-fixed tw-top-0 tw-right-0 tw-w-80 tw-z-50 tw-transform tw-transition-all tw-duration-300 tw-ease-in-out lg:tw-block ${
        sidebarOpen ? 'tw-translate-x-0' : 'tw-translate-x-full'
      } ${
        isCollapsed ? 'lg:tw-translate-x-full' : 'lg:tw-translate-x-0'
      }`} style={{ height: '125vh' }}>
        
        <div className="tw-h-full tw-bg-gradient-to-br tw-from-purple-50 tw-to-purple-100 tw-backdrop-blur-sm tw-border-l tw-border-purple-200 tw-shadow-2xl">
          
          {/* Header */}
          <div className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-purple-700 tw-text-white tw-p-6 tw-relative tw-overflow-hidden">
            <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-purple-400 tw-opacity-20 tw-pointer-events-none" />
            <div className="tw-flex tw-items-center tw-justify-between tw-relative tw-z-10">
              <div className="tw-flex tw-items-center tw-space-x-3">
                <BookOpen className="tw-w-6 tw-h-6 tw-text-purple-200" />
                <h3 className="tw-text-xl tw-font-bold tw-mb-0 tw-tracking-wide">Daftar Isi</h3>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="tw-lg:tw-hidden tw-p-2 tw-rounded-lg tw-hover:tw-bg-white tw-hover:tw-bg-opacity-20 tw-transition-colors"
              >
                <X className="tw-w-5 tw-h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="tw-p-6 tw-h-full tw-overflow-y-auto tw-pb-32" style={{ maxHeight: 'calc(125vh - 88px)' }}>
            {displayCourseTitle && (
              <div className="tw-mb-6 tw-p-4 tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-purple-200">
                <div className="tw-flex tw-items-center tw-space-x-2 tw-mb-2">
                  <div className="tw-w-2 tw-h-2 tw-bg-purple-500 tw-rounded-full tw-animate-pulse" />
                  <span className="tw-text-xs tw-font-medium tw-text-purple-600 tw-uppercase tw-tracking-wider">Kursus</span>
                </div>
                <h4 className="tw-text-purple-800 tw-font-bold tw-text-lg tw-leading-tight tw-mb-0">
                  {displayCourseTitle}
                </h4>
              </div>
            )}

            {displaySections.length === 0 ? (
              <div className="tw-text-center tw-py-12">
                <FileText className="tw-w-12 tw-h-12 tw-text-purple-300 tw-mx-auto tw-mb-4" />
                <p className="tw-text-purple-500 tw-font-medium">Belum ada section</p>
                <p className="tw-text-purple-400 tw-text-sm tw-mt-1">Mulai buat konten pembelajaran Anda</p>
              </div>
            ) : (
              <div className="tw-space-y-4">
                {displaySections.map((section, sectionIndex) => {
                  const isExpanded = expandedSections.has(sectionIndex);
                  const safeTopics = Array.isArray(section.topics) ? section.topics : [];
                  
                  return (
                    <div key={section.id} className="tw-bg-white tw-rounded-xl tw-shadow-sm tw-border tw-border-purple-200 tw-overflow-hidden tw-transition-all tw-duration-200 hover:tw-shadow-md">
                      
                      {/* Section Header */}
                      <div 
                        className="tw-p-4 tw-bg-gradient-to-r tw-from-purple-600 tw-to-purple-700 tw-text-white tw-cursor-pointer tw-transition-all tw-duration-200 hover:tw-from-purple-700 hover:tw-to-purple-800"
                        onClick={() => {
                          toggleSection(sectionIndex);
                          scrollToElement(`section-${section.id}`);
                        }}
                      >
                        <div className="tw-flex tw-items-center tw-justify-between">
                          <div className="tw-flex-1">
                            <div className="tw-flex tw-items-center tw-space-x-3">
                              <div className="tw-w-8 tw-h-8 tw-bg-white tw-bg-opacity-20 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-sm">
                                {sectionIndex + 1}
                              </div>
                              <div>
                                <h5 className="tw-font-bold tw-text-base tw-mb-1 tw-leading-tight">
                                  {section.title || 'Section Baru'}
                                </h5>
                                <div className="tw-flex tw-items-center tw-space-x-4 tw-text-xs tw-text-purple-200">
                                  <span className="tw-flex tw-items-center tw-space-x-1">
                                    <BookOpen className="tw-w-3 tw-h-3" />
                                    <span>{safeTopics.length} topik</span>
                                  </span>
                                  <span className="tw-flex tw-items-center tw-space-x-1">
                                    <FileText className="tw-w-3 tw-h-3" />
                                    <span>{safeTopics.reduce((acc, topic) => acc + (Array.isArray(topic.materials) ? topic.materials.length : 0), 0)} materi</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="tw-ml-3">
                            {isExpanded ? (
                              <ChevronDown className="tw-w-5 tw-h-5 tw-transition-transform tw-duration-200" />
                            ) : (
                              <ChevronRight className="tw-w-5 tw-h-5 tw-transition-transform tw-duration-200" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section Content */}
                      {isExpanded && safeTopics.length > 0 && (
                        <div className="tw-p-2">
                          {safeTopics.map((topic, topicIndex) => {
                            const safeMaterials = Array.isArray(topic.materials) ? topic.materials : [];
                            const safeQuizQuestions = Array.isArray(topic.quiz?.questions) ? topic.quiz.questions : [];
                            const safeDrillQuestions = Array.isArray(topic.drill?.questions) ? topic.drill.questions : [];
                            
                            return (
                              <div key={topic.id} className="tw-mb-3 last:tw-mb-0">
                                
                                {/* Topic Header */}
                                <div 
                                  className="tw-p-3 tw-rounded-lg tw-bg-purple-50 hover:tw-bg-purple-100 tw-cursor-pointer tw-transition-all tw-duration-200 tw-border tw-border-purple-100 hover:tw-border-purple-200"
                                  onClick={() => scrollToElement(`topic-${topic.id}`)}
                                >
                                  <div className="tw-flex tw-items-start tw-space-x-3">
                                    <div className="tw-w-6 tw-h-6 tw-bg-purple-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-xs tw-font-bold tw-flex-shrink-0 tw-mt-0.5">
                                      {topicIndex + 1}
                                    </div>
                                    <div className="tw-flex-1 tw-min-w-0">
                                      <h6 className="tw-font-semibold tw-text-purple-800 tw-text-sm tw-mb-2 tw-leading-tight">
                                        {topic.title || 'Topik Baru'}
                                      </h6>
                                      <div className="tw-flex tw-flex-wrap tw-gap-2 tw-text-xs">
                                        <div className="tw-flex tw-items-center tw-space-x-1 tw-bg-white tw-px-2 tw-py-1 tw-rounded-full tw-text-purple-600">
                                          <FileText className="tw-w-3 tw-h-3" />
                                          <span>{safeMaterials.length}</span>
                                        </div>
                                        <div className="tw-flex tw-items-center tw-space-x-1 tw-bg-white tw-px-2 tw-py-1 tw-rounded-full tw-text-green-600">
                                          <HelpCircle className="tw-w-3 tw-h-3" />
                                          <span>{safeQuizQuestions.length}</span>
                                        </div>
                                        <div className="tw-flex tw-items-center tw-space-x-1 tw-bg-white tw-px-2 tw-py-1 tw-rounded-full tw-text-orange-600">
                                          <Target className="tw-w-3 tw-h-3" />
                                          <span>{safeDrillQuestions.length}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Materials List */}
                                {safeMaterials.length > 0 && (
                                  <div className="tw-ml-6 tw-mt-2 tw-space-y-1">
                                    {safeMaterials.map((material, materialIndex) => (
                                      <div
                                        key={material.id}
                                        className="tw-p-2 tw-rounded-md tw-bg-white tw-cursor-pointer tw-transition-all tw-duration-150 hover:tw-bg-purple-50 tw-border tw-border-transparent hover:tw-border-purple-200 tw-group"
                                        onClick={() => scrollToElement(`material-${material.id}`)}
                                      >
                                        <div className="tw-flex tw-items-center tw-space-x-2">
                                          <ChevronRight className="tw-w-3 tw-h-3 tw-text-purple-400 tw-transition-transform tw-duration-150 group-hover:tw-translate-x-0.5" />
                                          {material.hasVideo && (
                                            <PlayCircle className="tw-w-3 tw-h-3 tw-text-red-500" />
                                          )}
                                          <span className="tw-text-xs tw-font-medium tw-text-purple-700 tw-flex-1 tw-truncate">
                                            {materialIndex + 1}. {material.title || 'Materi Baru'}
                                          </span>
                                          {material.isMandatory && (
                                            <div className="tw-w-2 tw-h-2 tw-bg-red-500 tw-rounded-full tw-flex-shrink-0" />
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;