// pages/all-courses/CourseSection.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { BookOpen, Star, Eye, Coins } from 'lucide-react';
import { ButtonGradient } from '../../components/button/ButtonTemplate';

// Types
export interface LiveCourse {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  learning_point?: string[];
  course_string?: string;
  product_id: number;
  product_name: string;
  price: number;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
  stock: number;
  features?: string[];
  classtype: string;
  creator_name?: string;
  create_date: string;
  coin_price?: number;
  coin_type?: 'course';
}

export interface UserCourseProgress {
  id: number;
  title: string;
  description: string;
  imageurl: string | null;
  type: number;
  learning_point: string[] | null;
  course_string: string;
  user_id: string;
  finished_quiz_topics: number;
  finished_materials: number;
  quiz: number;
  material: number;
  quiz_progress_percentage: number;
  material_progress_percentage: number;
  overall_progress_percentage: number;
}

interface CourseSectionProps {
  // User courses
  userProgress: UserCourseProgress[];
  progressLoading: boolean;
  
  // Available courses
  availableCourses: LiveCourse[];
  loading: boolean;
  
  // UI state
  viewMode: 'grid' | 'list';
  isAuthenticated: boolean;
  
  // Coin state
  coinLoading: boolean;
  getCoinBalance: (type: 'course') => number;
  
  // Handlers
  handleStartLearning: (courseString: string) => void;
  handleViewCourse: (courseString: string) => void;
  handleLogin: () => void;
  handleBuyCourse: (courseId: number, courseName: string) => void;
  handleBuyWithCoins: (course: LiveCourse, type: 'course') => void;
  
  // Utils
  formatPrice: (price: number) => string;
  getDefaultImage: () => string;
}

const CourseSection: React.FC<CourseSectionProps> = ({
  userProgress,
  progressLoading,
  availableCourses,
  loading,
  viewMode,
  isAuthenticated,
  coinLoading,
  getCoinBalance,
  handleStartLearning,
  handleViewCourse,
  handleLogin,
  handleBuyCourse,
  handleBuyWithCoins,
  formatPrice,
  getDefaultImage
}) => {
  return (
    <>
      {/* 1. Your Courses Section */}
      {isAuthenticated && userProgress.length > 0 && (
        <div className={viewMode === 'grid' 
          ? 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6' 
          : 'tw-space-y-6'
        }>
          {userProgress.map((course) => (
            <div key={course.id} className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-overflow-hidden tw-transition-all tw-duration-300 hover:tw-scale-105">
              <div className="tw-relative tw-h-48">
                <img
                  src={course.imageurl || getDefaultImage()}
                  alt={course.title}
                  className="tw-w-full tw-h-full tw-object-cover"
                />
                <div className="tw-absolute tw-top-4 tw-left-4">
                  <div className={`tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-bold ${
                    course.overall_progress_percentage >= 100 ? 'tw-bg-green-500' : 'tw-bg-blue-500'
                  }`}>
                    {Math.round(course.overall_progress_percentage)}%
                  </div>
                </div>
              </div>
              <div className="tw-p-6">
                <h5 className="tw-font-bold tw-text-lg tw-text-purple-600 tw-mb-2">{course.title}</h5>
                <p className="tw-text-gray-600 tw-text-sm tw-mb-4 tw-line-clamp-2">{course.description}</p>
                <div className="tw-text-sm tw-text-gray-500 tw-mb-4">
                  {course.finished_quiz_topics}/{course.quiz} Kuis • {course.finished_materials}/{course.material} Materi
                </div>
                <ButtonGradient
                  action={course.overall_progress_percentage >= 100 ? 'view' : 'play'}
                  onClick={() => handleStartLearning(course.course_string)}
                  customText={course.overall_progress_percentage >= 100 ? 'Ulasan' : 'Lanjutkan'}
                  size="sm"
                  className="tw-w-full"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Available Courses Section */}
      {loading ? (
        <div className="tw-flex tw-justify-center tw-items-center tw-py-12">
          <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-white"></div>
        </div>
      ) : availableCourses.length === 0 ? (
        <div className="tw-text-center tw-py-12 tw-bg-white/10 tw-rounded-2xl">
          <p className="tw-text-white tw-text-lg">Tidak ada kursus yang tersedia saat ini</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6' 
          : 'tw-space-y-6'
        }>
          {availableCourses.map((course) => {
            const canBuyWithCoins = course.coin_price !== undefined && course.coin_type === 'course';
            const courseCoinBalance = getCoinBalance('course');
            const hasEnoughCoins = canBuyWithCoins && courseCoinBalance >= (course.coin_price || 0);
            
            return (
              <div key={course.id} className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-overflow-hidden tw-transition-all tw-duration-300 hover:tw-scale-105">
                <div className="tw-relative tw-h-48 tw-group tw-cursor-pointer" onClick={() => handleViewCourse(course.course_string || '')}>
                  <img
                    src={course.imageUrl || getDefaultImage()}
                    alt={course.title}
                    className="tw-w-full tw-h-full tw-object-cover"
                  />
                  <div className="tw-absolute tw-inset-0 tw-bg-black tw-bg-opacity-0 group-hover:tw-bg-opacity-40 tw-transition-all tw-duration-300 tw-flex tw-items-center tw-justify-center">
                    <div className="tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity tw-duration-300 tw-bg-white tw-rounded-full tw-p-3">
                      <Eye className="tw-w-6 tw-h-6 tw-text-purple-600" />
                    </div>
                  </div>
                  {canBuyWithCoins && (
                    <div className="tw-absolute tw-top-4 tw-right-4">
                      <div className="tw-bg-green-500 tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold tw-flex tw-items-center tw-gap-1">
                        <Coins className="tw-w-3 tw-h-3" />
                        {course.coin_price} Koin
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="tw-p-6">
                  <h5 
                    className="tw-font-bold tw-text-lg tw-text-purple-600 tw-mb-2 tw-cursor-pointer hover:tw-text-purple-800"
                    onClick={() => handleViewCourse(course.course_string || '')}
                  >
                    {course.title}
                  </h5>
                  <p className="tw-text-gray-600 tw-text-sm tw-mb-4 tw-line-clamp-3">{course.description}</p>
                  
                  {course.learning_point && course.learning_point.length > 0 && (
                    <div className="tw-mb-4">
                      <div className="tw-space-y-1">
                        {course.learning_point.slice(0, 2).map((point, index) => (
                          <div key={index} className="tw-flex tw-items-start tw-gap-2 tw-text-sm tw-text-gray-600">
                            <Star className="tw-w-3 tw-h-3 tw-text-yellow-500 tw-mt-1 tw-flex-shrink-0" />
                            <span className="tw-line-clamp-1">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="tw-mb-4">
                    {course.is_promo && course.no_promo_price ? (
                      <div>
                        <span className="tw-text-gray-500 tw-text-sm tw-line-through">
                          {formatPrice(course.no_promo_price)}
                        </span>
                        <div className="tw-text-2xl tw-font-bold tw-text-green-600">
                          {formatPrice(course.price)}
                        </div>
                      </div>
                    ) : (
                      <div className="tw-text-2xl tw-font-bold tw-text-purple-600">
                        {formatPrice(course.price)}
                      </div>
                    )}
                    
                    {canBuyWithCoins && (
                      <div className="tw-flex tw-items-center tw-justify-between tw-mt-2 tw-pt-2 tw-border-t tw-border-gray-200">
                        <span className="tw-text-sm tw-text-gray-600">Atau dengan Koin:</span>
                        <div className="tw-flex tw-items-center tw-gap-2">
                          <Coins className="tw-w-4 tw-h-4 tw-text-green-600" />
                          <span className="tw-text-lg tw-font-bold tw-text-green-600">{course.coin_price}</span>
                          <span className="tw-text-sm tw-text-gray-500">Koin Kursus</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isAuthenticated && canBuyWithCoins && (
                    <div className="tw-mb-4 tw-bg-green-50 tw-p-3 tw-rounded-lg tw-border tw-border-green-200">
                      <div className="tw-flex tw-items-center tw-justify-between tw-text-sm">
                        <span className="tw-text-gray-600">Koin Kursus Anda:</span>
                        <div className="tw-flex tw-items-center tw-gap-2">
                          <Coins className="tw-w-4 tw-h-4 tw-text-green-600" />
                          <span className={`tw-font-bold ${hasEnoughCoins ? 'tw-text-green-600' : 'tw-text-red-600'}`}>
                            {coinLoading ? '...' : courseCoinBalance}
                          </span>
                        </div>
                      </div>
                      {!hasEnoughCoins && canBuyWithCoins && (
                        <div className="tw-text-xs tw-text-red-600 tw-mt-1">
                          Butuh {(course.coin_price || 0) - courseCoinBalance} koin lagi
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="tw-flex tw-gap-2">
                    <ButtonGradient
                      action="view"
                      onClick={() => handleViewCourse(course.course_string || '')}
                      customText="Lihat Detail"
                      size="sm"
                      className="tw-flex-1"
                      customColors={{
                        gradient1: '#6366F1',
                        gradient2: '#8B5CF6',
                        text: '#FFFFFF'
                      }}
                    />
                    {!isAuthenticated ? (
                      <ButtonGradient
                        action="login"
                        onClick={handleLogin}
                        customText="Masuk"
                        size="sm"
                        className="tw-flex-1"
                      />
                    ) : (
                      <div className="tw-flex tw-flex-col tw-gap-2 tw-flex-1">
                        <ButtonGradient
                          action="cart"
                          onClick={() => handleBuyCourse(course.id, course.title)}
                          customText="Beli"
                          size="sm"
                          className="tw-w-full"
                        />
                        {canBuyWithCoins && (
                          <ButtonGradient
                            action="custom"
                            customText={
                              <div className="tw-flex tw-items-center tw-justify-center tw-gap-1">
                                <Coins className="tw-w-3 tw-h-3" />
                                <span>{course.coin_price} Koin</span>
                              </div>
                            }
                            onClick={() => handleBuyWithCoins(course, 'course')}
                            size="sm"
                            className="tw-w-full"
                            disabled={!hasEnoughCoins}
                            customColors={{
                              gradient1: hasEnoughCoins ? '#10B981' : '#9CA3AF',
                              gradient2: hasEnoughCoins ? '#059669' : '#6B7280',
                              text: '#FFFFFF'
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default CourseSection;
