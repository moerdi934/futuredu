// pages/all-courses/ClassSection.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { GraduationCap, User, Calendar, Clock, QrCode, Coins } from 'lucide-react';
import { ButtonGradient } from '../../components/button/ButtonTemplate';

// Types
export interface LiveClass {
  id: number;
  name: string;
  description: string;
  teacher_name: string;
  teacher_id: number;
  student_list_ids: number[];
  student_list_names: string[];
  start_date: string;
  end_date: string;
  class_mode: string;
  meeting_url?: string;
  course_name: string;
  course_id: number;
  product_id: number;
  product_name: string;
  price: number;
  is_promo: boolean;
  no_promo_price?: number;
  promo_description?: string;
  stock: number;
  max_students: number;
  current_students: number;
  features?: string[];
  classtype: string;
  effective_start: string;
  effective_end?: string;
  creator_name?: string;
  create_date: string;
  coin_price?: number;
  coin_type?: 'class';
}

export interface EnrolledClass {
  id: number;
  name: string;
  description: string;
  teacher_name: string;
  teacher_id: string | number;
  course_name: string;
  course_id: string | number;
  start_date: string;
  end_date: string;
  real_start_datetime?: string;
  real_end_datetime?: string;
  class_mode: string;
  meeting_url?: string;
  status: 'Not Start' | 'Started' | 'Finished' | 'Need Approve' | 'Rejected' | 'Deleted';
  create_date: string;
}

interface ClassSectionProps {
  // Enrolled classes
  enrolledClasses: EnrolledClass[];
  enrolledClassesLoading: boolean;
  
  // Available classes
  availableClasses: LiveClass[];
  classesLoading: boolean;
  
  // UI state
  viewMode: 'grid' | 'list';
  isAuthenticated: boolean;
  
  // Coin state
  coinLoading: boolean;
  getCoinBalance: (type: 'class') => number;
  
  // Handlers
  handleLogin: () => void;
  handleBuyClass: (classId: number, className: string) => void;
  handleAttendance: (cls: EnrolledClass) => void;
  handleBuyWithCoins: (cls: LiveClass, type: 'class') => void;
  
  // Utils
  formatPrice: (price: number) => string;
  formatDateTime: (dateString: string) => string;
  formatClassStatus: (status: string) => React.ReactNode;
}

const ClassSection: React.FC<ClassSectionProps> = ({
  enrolledClasses,
  enrolledClassesLoading,
  availableClasses,
  classesLoading,
  viewMode,
  isAuthenticated,
  coinLoading,
  getCoinBalance,
  handleLogin,
  handleBuyClass,
  handleAttendance,
  handleBuyWithCoins,
  formatPrice,
  formatDateTime,
  formatClassStatus
}) => {
  return (
    <>
      {/* 1. Your Classes Section */}
      {isAuthenticated && enrolledClasses.length > 0 && (
        enrolledClassesLoading ? (
          <div className="tw-flex tw-justify-center tw-items-center tw-py-12">
            <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-white"></div>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6' 
            : 'tw-space-y-6'
          }>
            {enrolledClasses.map((cls) => (
              <div key={cls.id} className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-overflow-hidden tw-transition-all tw-duration-300 hover:tw-scale-105">
                <div className="tw-relative tw-h-48 tw-bg-gradient-to-br tw-from-green-400 tw-to-emerald-500 tw-flex tw-items-center tw-justify-center">
                  <GraduationCap className="tw-w-16 tw-h-16 tw-text-white" />
                  <div className="tw-absolute tw-top-4 tw-right-4">
                    {formatClassStatus(cls.status)}
                  </div>
                </div>
                <div className="tw-p-6">
                  <h5 className="tw-font-bold tw-text-lg tw-text-orange-600 tw-mb-2">{cls.name}</h5>
                  <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3 tw-text-sm tw-text-gray-600">
                    <User className="tw-w-4 tw-h-4" />
                    <span>{cls.teacher_name}</span>
                  </div>
                  <p className="tw-text-gray-600 tw-text-sm tw-mb-4 tw-line-clamp-2">{cls.description}</p>
                  
                  <div className="tw-bg-gray-50 tw-rounded-lg tw-p-3 tw-mb-4">
                    <div className="tw-text-xs tw-text-gray-600 tw-space-y-1">
                      <div className="tw-flex tw-items-center tw-gap-1">
                        <Calendar className="tw-w-3 tw-h-3" />
                        <span>Mulai: {formatDateTime(cls.start_date)}</span>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-1">
                        <Calendar className="tw-w-3 tw-h-3" />
                        <span>Selesai: {formatDateTime(cls.end_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Show attendance button for ongoing classes */}
                  {cls.status === 'Started' && (
                    <div className="tw-mb-4">
                      <ButtonGradient
                        action="custom"
                        onClick={() => handleAttendance(cls)}
                        customText={
                          <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                            <QrCode className="tw-w-4 tw-h-4" />
                            <span>Presensi</span>
                          </div>
                        }
                        size="sm"
                        className="tw-w-full"
                        customColors={{
                          gradient1: '#EF4444',
                          gradient2: '#DC2626',
                          text: '#FFFFFF'
                        }}
                      />
                    </div>
                  )}

                  {/* Show meeting link for online classes */}
                  {cls.class_mode === 'online' && cls.meeting_url && cls.status === 'Started' && (
                    <div className="tw-mb-4">
                      <a
                        href={cls.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tw-w-full tw-py-2 tw-px-4 tw-bg-blue-500 tw-text-white tw-rounded-lg tw-text-center tw-block tw-text-sm tw-font-medium hover:tw-bg-blue-600 tw-transition-colors"
                      >
                        Gabung Meeting
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* 2. Available Classes Section */}
      {classesLoading ? (
        <div className="tw-flex tw-justify-center tw-items-center tw-py-12">
          <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-white"></div>
        </div>
      ) : availableClasses.length === 0 ? (
        <div className="tw-text-center tw-py-12 tw-bg-white/10 tw-rounded-2xl">
          <p className="tw-text-white tw-text-lg">Tidak ada kelas yang tersedia saat ini</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6' 
          : 'tw-space-y-6'
        }>
          {availableClasses.map((cls) => {
            const availableSlots = cls.stock;
            const enrollmentProgress = ((cls.current_students / cls.max_students) * 100);
            const canBuyWithCoins = cls.coin_price !== undefined && cls.coin_type === 'class';
            const classCoinBalance = getCoinBalance('class');
            const hasEnoughCoins = canBuyWithCoins && classCoinBalance >= (cls.coin_price || 0);
            
            return (
              <div key={cls.id} className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-overflow-hidden tw-transition-all tw-duration-300 hover:tw-scale-105">
                <div className="tw-relative tw-h-48 tw-bg-gradient-to-br tw-from-orange-400 tw-to-pink-500 tw-flex tw-items-center tw-justify-center">
                  <GraduationCap className="tw-w-16 tw-h-16 tw-text-white" />
                  {canBuyWithCoins && (
                    <div className="tw-absolute tw-top-4 tw-right-4">
                      <div className="tw-bg-blue-500 tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold tw-flex tw-items-center tw-gap-1">
                        <Coins className="tw-w-3 tw-h-3" />
                        {cls.coin_price} Koin
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="tw-p-6">
                  <h5 className="tw-font-bold tw-text-lg tw-text-orange-600 tw-mb-2">{cls.name}</h5>
                  <div className="tw-flex tw-items-center tw-gap-2 tw-mb-3 tw-text-sm tw-text-gray-600">
                    <User className="tw-w-4 tw-h-4" />
                    <span>{cls.teacher_name}</span>
                  </div>
                  <p className="tw-text-gray-600 tw-text-sm tw-mb-4 tw-line-clamp-2">{cls.description}</p>
                  
                  <div className="tw-bg-gray-50 tw-rounded-lg tw-p-3 tw-mb-4">
                    <div className="tw-text-xs tw-text-gray-600 tw-space-y-1">
                      <div>Mulai: {formatDateTime(cls.start_date)}</div>
                      <div>Selesai: {formatDateTime(cls.end_date)}</div>
                    </div>
                  </div>

                  <div className="tw-mb-4">
                    <div className="tw-flex tw-justify-between tw-text-sm tw-mb-2">
                      <span className="tw-text-gray-700">Pendaftar</span>
                      <span className="tw-font-bold tw-text-orange-600">
                        {cls.current_students}/{cls.max_students}
                      </span>
                    </div>
                    <div className="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2">
                      <div 
                        className="tw-bg-gradient-to-r tw-from-orange-400 tw-to-red-500 tw-h-2 tw-rounded-full"
                        style={{ width: `${Math.min(enrollmentProgress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="tw-text-xs tw-text-gray-500 tw-mt-1">
                      {availableSlots > 0 ? `${availableSlots} slot tersisa` : 'Kelas penuh'}
                    </div>
                  </div>

                  <div className="tw-mb-4">
                    {cls.is_promo && cls.no_promo_price ? (
                      <div>
                        <span className="tw-text-gray-500 tw-text-sm tw-line-through">
                          {formatPrice(cls.no_promo_price)}
                        </span>
                        <div className="tw-text-2xl tw-font-bold tw-text-green-600">
                          {formatPrice(cls.price)}
                        </div>
                      </div>
                    ) : (
                      <div className="tw-text-2xl tw-font-bold tw-text-orange-600">
                        {formatPrice(cls.price)}
                      </div>
                    )}
                    
                    {canBuyWithCoins && (
                      <div className="tw-flex tw-items-center tw-justify-between tw-mt-2 tw-pt-2 tw-border-t tw-border-gray-200">
                        <span className="tw-text-sm tw-text-gray-600">Atau dengan Koin:</span>
                        <div className="tw-flex tw-items-center tw-gap-2">
                          <Coins className="tw-w-4 tw-h-4 tw-text-blue-600" />
                          <span className="tw-text-lg tw-font-bold tw-text-blue-600">{cls.coin_price}</span>
                          <span className="tw-text-sm tw-text-gray-500">Koin Kelas</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isAuthenticated && canBuyWithCoins && (
                    <div className="tw-mb-4 tw-bg-blue-50 tw-p-3 tw-rounded-lg tw-border tw-border-blue-200">
                      <div className="tw-flex tw-items-center tw-justify-between tw-text-sm">
                        <span className="tw-text-gray-600">Koin Kelas Anda:</span>
                        <div className="tw-flex tw-items-center tw-gap-2">
                          <Coins className="tw-w-4 tw-h-4 tw-text-blue-600" />
                          <span className={`tw-font-bold ${hasEnoughCoins ? 'tw-text-green-600' : 'tw-text-red-600'}`}>
                            {coinLoading ? '...' : classCoinBalance}
                          </span>
                        </div>
                      </div>
                      {!hasEnoughCoins && canBuyWithCoins && (
                        <div className="tw-text-xs tw-text-red-600 tw-mt-1">
                          Butuh {(cls.coin_price || 0) - classCoinBalance} koin lagi
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!isAuthenticated ? (
                    <ButtonGradient
                      action="login"
                      onClick={handleLogin}
                      customText="Masuk untuk Daftar"
                      size="sm"
                      className="tw-w-full"
                    />
                  ) : availableSlots <= 0 ? (
                    <div className="tw-w-full tw-py-3 tw-px-4 tw-rounded-xl tw-bg-gray-200 tw-text-gray-500 tw-text-center tw-font-bold">
                      Kelas Penuh
                    </div>
                  ) : (
                    <div className="tw-space-y-2">
                      <ButtonGradient
                        action="cart"
                        onClick={() => handleBuyClass(cls.id, cls.name)}
                        customText="Daftar Kelas"
                        size="sm"
                        className="tw-w-full"
                        customColors={{
                          gradient1: '#F97316',
                          gradient2: '#DC2626',
                          text: '#FFFFFF'
                        }}
                      />
                      {canBuyWithCoins && (
                        <ButtonGradient
                          action="custom"
                          customText={
                            <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                              <Coins className="tw-w-4 tw-h-4" />
                              <span>Daftar dengan {cls.coin_price} Koin</span>
                            </div>
                          }
                          onClick={() => handleBuyWithCoins(cls, 'class')}
                          size="sm"
                          className="tw-w-full"
                          disabled={!hasEnoughCoins}
                          customColors={{
                            gradient1: hasEnoughCoins ? '#3B82F6' : '#9CA3AF',
                            gradient2: hasEnoughCoins ? '#1D4ED8' : '#6B7280',
                            text: '#FFFFFF'
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default ClassSection;
