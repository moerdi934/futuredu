'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container, Row, Col, Card, ProgressBar, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Target, 
  Zap, 
  Award, 
  Star, 
  Heart, 
  ShoppingCart, 
  Trophy,
  BookMarked,
  Gift,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface TopicApi {
  id: number;
  title: string;
  position: number;
}

interface SectionApi {
  id: number;
  title: string;
  description: string;
  durasi: number;
  position: number;
  section_string: string;
  progress: number;
  bonus: number;
  totalBonus: number;
  bonusProgress: number;
  topics: TopicApi[];
}

interface CourseData {
  courseId: number;
  title: string;
  description: string;
  imageurl: string | null;
  learningPoint: string[];
  sections: SectionApi[];
  isEntitled: boolean;
}

const CoursePage: React.FC = () => {
  const params = useParams();
  const courseCode = params?.courseCode as string;
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredSectionId, setHoveredSectionId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem('authToken');
        const headers: Record<string, string> = {};
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/userCourse/courses/${courseCode}`,
          { headers }
        );
        
        if (response.data.data) {
          setCourseData(response.data.data);
        } else {
          throw new Error(response.data.message);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          setCourseData({ 
            ...( (err.response.data.data as any) || {} ),
            isEntitled: false,
            sections: []
          });
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (courseCode) {
      fetchCourseData();
    }
  }, [courseCode]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const displayedSections = courseData
    ? courseData.sections.map(sec => ({
        ...sec,
        progress: courseData.isEntitled ? sec.progress : 0,
        bonusProgress: courseData.isEntitled ? sec.bonusProgress : 0,
      }))
    : [];

  const onSectionClick = (sectionString: string, e: React.MouseEvent) => {
    if (!courseData?.isEntitled) {
      e.preventDefault();
      router.push('/login');
    } else {
      router.push(`/section/${sectionString}`);
    }
  };

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

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'success';
    if (progress >= 70) return 'info';
    if (progress >= 40) return 'warning';
    return 'danger';
  };

  const getBonusProgressColor = (bonusProgress: number) => {
    if (bonusProgress === 100) return 'success';
    if (bonusProgress >= 70) return 'warning';
    if (bonusProgress >= 40) return 'info';
    return 'secondary';
  };

  const sortedSections = courseData?.sections
    ? [...courseData.sections].sort((a, b) => a.position - b.position)
    : [];

  if (loading) {
    return (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-screen tw-bg-gradient-to-br tw-from-purple-50 tw-via-pink-50 tw-to-indigo-50">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-screen tw-bg-gradient-to-br tw-from-purple-50 tw-via-pink-50 tw-to-indigo-50">
        <Alert variant="danger" className="tw-text-center">
          <h3>Error Loading Course</h3>
          <p>{error}</p>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
            className="tw-mt-3"
          >
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="tw-flex tw-justify-center tw-items-center tw-h-screen tw-bg-gradient-to-br tw-from-purple-50 tw-via-pink-50 tw-to-indigo-50">
        <Alert variant="warning" className="tw-text-center">
          <h3>Course Not Found</h3>
          <p>The requested course could not be loaded</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="tw-bg-gradient-to-br tw-from-purple-50 tw-via-pink-50 tw-to-indigo-50 tw-min-h-screen">
      <Container className="tw-py-8">
        <Row>
          <Col xs={12}>
            <div className="tw-text-center tw-border-b tw-border-purple-200 tw-pb-6 tw-mb-8 tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-mx-2 md:tw-mx-4 tw-p-4 md:tw-p-6 tw-overflow-hidden tw-relative">
              <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-2 tw-bg-gradient-to-r tw-from-purple-500 tw-via-pink-500 tw-to-indigo-500"></div>
              
              <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-4 tw-mb-4">
                <div className="tw-relative tw-group">
                  <img
                    src={courseData.imageurl || 'https://via.placeholder.com/400x250/9333EA/FFFFFF?text=📚+Course+Image'}
                    alt={courseData.title}
                    className="tw-w-full tw-max-w-sm tw-h-48 md:tw-h-64 tw-object-cover tw-rounded-xl tw-shadow-lg tw-border-4 tw-border-purple-300 tw-group-hover:tw-scale-105 tw-transition-transform tw-duration-300"
                  />
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
                      {courseData.title}
                    </h1>
                    <Heart className="tw-text-pink-500 tw-animate-bounce" size={24} />
                  </div>
                  
                  <div className="tw-flex tw-items-center tw-gap-4 tw-flex-wrap tw-justify-center">
                    <div className="tw-flex tw-items-center tw-gap-2 tw-bg-purple-100 tw-px-3 tw-py-1 tw-rounded-full">
                      <Users className="tw-text-purple-600" size={16} />
                      <span className="tw-text-purple-700 tw-text-sm tw-font-medium">Untuk Pemula - Mahir</span>
                    </div>
                    <div className="tw-flex tw-items-center tw-gap-2 tw-bg-pink-100 tw-px-3 tw-py-1 tw-rounded-full">
                      <Target className="tw-text-pink-600" size={16} />
                      <span className="tw-text-pink-700 tw-text-sm tw-font-medium">8 Minggu</span>
                    </div>
                    <div className="tw-flex tw-items-center tw-gap-2 tw-bg-indigo-100 tw-px-3 tw-py-1 tw-rounded-full">
                      <Zap className="tw-text-indigo-600" size={16} />
                      <span className="tw-text-indigo-700 tw-text-sm tw-font-medium">Interaktif</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="tw-text-gray-700 tw-text-sm md:tw-text-lg tw-px-4 tw-leading-relaxed tw-max-w-3xl tw-mx-auto">
                {courseData.description}
              </p>
              
              <div className="tw-mt-6 tw-bg-gradient-to-r tw-from-purple-50 tw-to-pink-50 tw-p-4 md:tw-p-6 tw-rounded-xl tw-border tw-border-purple-200">
                <h3 className="tw-text-lg md:tw-text-xl tw-font-bold tw-text-purple-700 tw-mb-4 tw-flex tw-items-center tw-justify-center tw-gap-2">
                  <Star className="tw-text-yellow-500" size={24} />
                  Apa yang Akan Kamu Pelajari
                  <Star className="tw-text-yellow-500" size={24} />
                </h3>
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3 tw-max-w-4xl tw-mx-auto">
                  {courseData.learningPoint.map((point, index) => (
                    <div key={index} className="tw-flex tw-items-start tw-gap-3 tw-bg-white tw-p-3 tw-rounded-lg tw-shadow-sm tw-border tw-border-purple-100 tw-hover:tw-shadow-md tw-transition-all tw-duration-200">
                      <div className="tw-bg-gradient-to-r tw-from-purple-400 tw-to-pink-400 tw-text-white tw-rounded-full tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center tw-flex-shrink-0 tw-text-sm tw-font-bold">
                        {index + 1}
                      </div>
                      <span className="tw-text-gray-700 tw-text-sm md:tw-text-base tw-leading-relaxed">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {!courseData.isEntitled && (
                <div className="tw-mt-8 tw-bg-gradient-to-r tw-from-indigo-50 tw-to-purple-50 tw-p-6 tw-rounded-xl tw-border-2 tw-border-purple-300 tw-shadow-lg tw-max-w-xl tw-mx-auto">
                  <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-between tw-gap-4">
                    <div className="tw-flex tw-items-center tw-gap-3">
                      <div className="tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-600 tw-p-3 tw-rounded-full">
                        <ShoppingCart className="tw-text-white" size={24} />
                      </div>
                      <div>
                        <div className="tw-flex tw-items-baseline tw-gap-2">
                          <span className="tw-text-2xl tw-font-bold tw-text-purple-700">Rp299.000</span>
                          <span className="tw-text-gray-500 tw-line-through">Rp499.000</span>
                          <Badge bg="danger" className="tw-animate-pulse">
                            Promo 40%
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
              )}
            </div>
          </Col>
        </Row>

        <Row className="tw-justify-center">
          <Col xs={12} xl={11}>
            <Card className="tw-border-0 tw-shadow-2xl tw-bg-white tw-rounded-2xl tw-overflow-hidden">
              <Card.Header className="tw-bg-gradient-to-r tw-from-purple-600 tw-via-purple-700 tw-to-indigo-600 tw-text-white tw-p-6 tw-relative tw-overflow-hidden">
                <div className="tw-absolute tw-top-0 tw-right-0 tw-w-32 tw-h-32 tw-bg-white tw-opacity-10 tw-rounded-full tw--mr-16 tw--mt-16"></div>
                <div className="tw-flex tw-items-center tw-justify-center tw-gap-3 tw-relative tw-z-10">
                  <div className="tw-bg-white tw-bg-opacity-20 tw-p-3 tw-rounded-full">
                    <BookMarked className="tw-text-white" size={28} />
                  </div>
                  <h2 className="tw-text-xl md:tw-text-2xl tw-font-bold tw-mb-0">Pilih Section untuk Memulai Belajar!</h2>
                  <div className="tw-bg-yellow-400 tw-p-2 tw-rounded-full tw-animate-pulse">
                    <Star className="tw-text-yellow-800" size={20} />
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="tw-p-6">
                <div className="tw-space-y-4">
                  {sortedSections.map((section, index) => (
                    <div
                      key={section.id}
                      className="tw-group tw-cursor-pointer tw-bg-gradient-to-r tw-from-white tw-to-purple-50 tw-border-2 tw-border-purple-200 tw-rounded-xl tw-p-5 tw-hover:tw-shadow-lg tw-hover:tw-border-purple-400 tw-transition-all tw-duration-300 tw-hover:tw-scale-105 tw-hover:tw-from-purple-50 tw-hover:tw-to-pink-50 tw-no-underline"
                      onMouseEnter={() => setHoveredSectionId(section.id)}
                      onMouseLeave={() => setHoveredSectionId(null)}
                      onClick={(e) => onSectionClick(section.section_string, e)}
                    >
                      <div className="tw-flex tw-justify-between tw-items-start tw-mb-4">
                        <div className="tw-flex-1">
                          <div className="tw-flex tw-items-center tw-gap-3 tw-mb-3 tw-flex-wrap">
                            <div className="tw-bg-gradient-to-r tw-from-purple-500 tw-to-pink-500 tw-text-white tw-rounded-full tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-sm">
                              {index + 1}
                            </div>
                            <Badge bg={section.progress === 100 ? 'success' : section.progress >= 50 ? 'warning' : 'secondary'} className="tw-flex tw-items-center tw-gap-1 tw-text-sm">
                              {section.progress === 100 && <Trophy size={12} />}
                              {section.progress}%
                            </Badge>
                            {section.totalBonus > 0 && (
                              <Badge bg={getBonusProgressColor(section.bonusProgress)} className="tw-flex tw-items-center tw-gap-1 tw-text-sm">
                                <Gift size={12} />
                                {section.bonus}/{section.totalBonus} Bonus
                              </Badge>
                            )}
                            <span className="tw-text-purple-800 tw-font-bold tw-text-sm md:tw-text-lg tw-break-words">
                              {section.title}
                            </span>
                          </div>
                          
                          {section.description && (
                            <p className="tw-text-gray-600 tw-text-sm tw-mb-3 tw-leading-relaxed">
                              {section.description}
                            </p>
                          )}
                          
                          <div className="tw-flex tw-items-center tw-gap-4 tw-mb-4 tw-flex-wrap">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-purple-600">
                              <Clock size={16} />
                              <span className="tw-text-sm tw-font-medium">{formatDuration(section.durasi)}</span>
                            </div>
                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-indigo-600">
                              <BookOpen size={16} />
                              <span className="tw-text-sm tw-font-medium">{section.topics.length} topik</span>
                            </div>
                            {section.totalBonus > 0 && (
                              <div className="tw-flex tw-items-center tw-gap-2 tw-text-pink-600">
                                <Sparkles size={16} />
                                <span className="tw-text-sm tw-font-medium">{section.totalBonus} materi bonus</span>
                              </div>
                            )}
                          </div>

                          <div className="tw-space-y-3">
                            <div>
                              <div className="tw-flex tw-items-center tw-justify-between tw-mb-1">
                                <span className="tw-text-sm tw-font-medium tw-text-purple-700">Materi Wajib</span>
                                <span className="tw-text-sm tw-font-bold tw-text-purple-700">{section.progress}%</span>
                              </div>
                              <ProgressBar 
                                variant={getProgressColor(section.progress)} 
                                now={section.progress} 
                                className="tw-h-3 tw-rounded-full tw-shadow-inner"
                                style={{background: '#f3f4f6'}}
                              />
                            </div>

                            {section.totalBonus > 0 && (
                              <div>
                                <div className="tw-flex tw-items-center tw-justify-between tw-mb-1">
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <Gift size={14} className="tw-text-pink-500" />
                                    <span className="tw-text-sm tw-font-medium tw-text-pink-700">Materi Bonus</span>
                                  </div>
                                  <div className="tw-flex tw-items-center tw-gap-2">
                                    <span className="tw-text-sm tw-font-bold tw-text-pink-700">
                                      {section.bonus}/{section.totalBonus}
                                    </span>
                                    <span className="tw-text-xs tw-text-pink-600">
                                      ({section.bonusProgress}%)
                                    </span>
                                  </div>
                                </div>
                                <ProgressBar 
                                  variant={getBonusProgressColor(section.bonusProgress)} 
                                  now={section.bonusProgress} 
                                  className="tw-h-2 tw-rounded-full tw-shadow-inner"
                                  style={{background: '#fdf2f8'}}
                                />
                                {section.bonusProgress === 100 && (
                                  <div className="tw-flex tw-items-center tw-gap-1 tw-mt-1">
                                    <CheckCircle2 size={14} className="tw-text-green-500" />
                                    <span className="tw-text-xs tw-text-green-600 tw-font-medium">
                                      Semua materi bonus selesai!
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="tw-ml-4 tw-flex tw-items-center tw-gap-2">
                          <div className="tw-bg-purple-100 tw-group-hover:tw-bg-purple-200 tw-p-2 tw-rounded-full tw-transition-colors">
                            <div className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 tw-bg-clip-text tw-text-transparent tw-font-bold">
                              Mulai
                            </div>
                          </div>
                        </div>
                      </div>

                      {hoveredSectionId === section.id && (
                        <div className="tw-mt-4 tw-border-t tw-border-purple-200 tw-pt-4">
                          <h4 className="tw-text-sm tw-font-bold tw-text-purple-700 tw-mb-3">Topik Pembelajaran:</h4>
                          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-2">
                            {section.topics.slice(0, 3).map((topic) => (
                              <div key={topic.id} className="tw-flex tw-items-center tw-gap-2 tw-bg-purple-50 tw-p-2 tw-rounded-lg">
                                <div className="tw-bg-purple-200 tw-text-purple-800 tw-rounded-full tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center tw-text-xs">
                                  {topic.position}
                                </div>
                                <span className="tw-text-xs tw-text-purple-700 tw-truncate">
                                  {topic.title}
                                </span>
                              </div>
                            ))}
                            {section.topics.length > 3 && (
                              <div className="tw-bg-gradient-to-r tw-from-purple-100 tw-to-pink-100 tw-p-2 tw-rounded-lg tw-text-center">
                                <span className="tw-text-xs tw-text-purple-600">
                                  +{section.topics.length - 3} topik lainnya
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CoursePage;