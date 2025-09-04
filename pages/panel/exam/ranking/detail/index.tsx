// pages/panel/exam/ranking/detail/index.tsx

import React, { useState, useEffect } from 'react';
import { FaEye, FaTrophy, FaUser, FaSchool, FaMapMarkerAlt, FaArrowLeft, FaChartBar } from 'react-icons/fa';
import { Award, ArrowLeft, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '../../../../../components/layout/DashboardLayout';
import ReportLayout from '../../../../../components/report/ReportLayout';
import { ReportConfig, ColumnConfig } from '../../../../../types/report';
import { useAuth } from '../../../../../context/AuthContext';

const RankingDetailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [examInfo, setExamInfo] = useState({
    exam_type: '',
    exam: '',
    exam_name: ''
  });

  // Set current user ID
  useEffect(() => {
    if (id) {
      setCurrentUserId(parseInt(id));
    }
  }, [id]);

  // Parse URL search params
  useEffect(() => {
    const exam_type = searchParams.get('exam_type') || '';
    const exam = searchParams.get('exam') || '';
    const exam_name = searchParams.get('esn') || '';
    
    setExamInfo({
      exam_type,
      exam,
      exam_name: decodeURIComponent(exam_name)
    });
  }, [searchParams]);

  // Custom formatters untuk kolom-kolom tertentu
  const formatRankPosition = (value: string, row?: any) => {
    if (!value) return '-';
    const rank = parseInt(value);
    
    // Highlight current user
    const isCurrentUser = row?.user_id === currentUserId;
    
    // Badge colors berdasarkan ranking
    let badgeColor = 'tw-bg-gray-100 tw-text-gray-800';
    let icon = <FaTrophy className="tw-w-3 tw-h-3" />;
    
    if (rank === 1) {
      badgeColor = 'tw-bg-gradient-to-r tw-from-yellow-400 tw-to-yellow-600 tw-text-white';
      icon = <FaTrophy className="tw-w-3 tw-h-3 tw-text-yellow-200" />;
    } else if (rank <= 3) {
      badgeColor = 'tw-bg-gradient-to-r tw-from-orange-400 tw-to-orange-600 tw-text-white';
      icon = <FaTrophy className="tw-w-3 tw-h-3 tw-text-orange-200" />;
    } else if (rank <= 10) {
      badgeColor = 'tw-bg-gradient-to-r tw-from-blue-400 tw-to-blue-600 tw-text-white';
    } else {
      badgeColor = 'tw-bg-gray-100 tw-text-gray-700';
    }

    // Add highlight for current user
    if (isCurrentUser) {
      badgeColor = 'tw-bg-gradient-to-r tw-from-purple-500 tw-to-indigo-600 tw-text-white tw-ring-4 tw-ring-purple-300';
    }
    
    return (
      <div className="tw-text-center">
        <div className={`tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-rounded-full tw-font-bold tw-text-sm tw-shadow-sm ${badgeColor}`}>
          {icon}
          <span>#{rank}</span>
        </div>
        {isCurrentUser && (
          <div className="tw-text-xs tw-text-purple-600 tw-font-semibold tw-mt-1">
            Anda
          </div>
        )}
      </div>
    );
  };

  const formatStudentName = (value: string, row?: any) => {
    if (!value) return '-';
    const isCurrentUser = row?.user_id === currentUserId;
    
    return (
      <div className={`tw-font-semibold tw-leading-tight ${isCurrentUser ? 'tw-text-purple-700 tw-bg-purple-50 tw-px-2 tw-py-1 tw-rounded-lg' : 'tw-text-gray-800'}`}>
        <div className="tw-flex tw-items-center tw-gap-2">
          <FaUser className="tw-w-3 tw-h-3 tw-text-gray-500" />
          <span className="tw-text-base">{value}</span>
        </div>
        {isCurrentUser && (
          <div className="tw-text-xs tw-text-purple-600 tw-font-medium tw-mt-1">
            Profil Anda
          </div>
        )}
      </div>
    );
  };

  const formatScore = (value: string | number, label: string, row?: any) => {
    if (!value) return '-';
    const score = typeof value === 'string' ? parseFloat(value) : value;
    const isCurrentUser = row?.user_id === currentUserId;
    
    // Color berdasarkan score
    let scoreColor = 'tw-text-red-600';
    if (score >= 80) scoreColor = 'tw-text-green-600';
    else if (score >= 60) scoreColor = 'tw-text-blue-600';
    else if (score >= 40) scoreColor = 'tw-text-orange-600';

    // Highlight current user
    if (isCurrentUser) {
      scoreColor = 'tw-text-purple-700';
    }
    
    return (
      <div className={`tw-text-center ${isCurrentUser ? 'tw-bg-purple-50 tw-px-2 tw-py-1 tw-rounded-lg' : ''}`}>
        <div className={`tw-text-xl tw-font-bold ${scoreColor}`}>
          {typeof score === 'number' && !Number.isInteger(score) ? score.toFixed(1) : score}
        </div>
        <div className="tw-text-xs tw-text-gray-500">{label}</div>
      </div>
    );
  };

  const formatSchool = (value: string, row?: any) => {
    if (!value) return '-';
    const isCurrentUser = row?.user_id === currentUserId;
    
    // Color mapping untuk jenis sekolah
    const schoolColors = {
      'SMA': 'tw-bg-blue-100 tw-text-blue-700',
      'SMK': 'tw-bg-green-100 tw-text-green-700',
      'MA': 'tw-bg-purple-100 tw-text-purple-700',
      'Kuliah': 'tw-bg-indigo-100 tw-text-indigo-700'
    };
    
    const colorClass = schoolColors[value as keyof typeof schoolColors] || 'tw-bg-gray-100 tw-text-gray-700';
    
    return (
      <div className="tw-text-center">
        <div className="tw-flex tw-items-center tw-justify-center tw-gap-1 tw-mb-1">
          <FaSchool className="tw-w-3 tw-h-3 tw-text-gray-500" />
        </div>
        <span className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-sm tw-font-medium tw-shadow-sm ${
          isCurrentUser ? 'tw-bg-purple-100 tw-text-purple-700 tw-ring-2 tw-ring-purple-300' : colorClass
        }`}>
          {value}
        </span>
      </div>
    );
  };

  const formatLocation = (kota: string, provinsi: string, rankKota: string, rankProvinsi: string, row?: any) => {
    const isCurrentUser = row?.user_id === currentUserId;
    
    return (
      <div className={`tw-text-center tw-space-y-2 ${isCurrentUser ? 'tw-bg-purple-50 tw-px-2 tw-py-2 tw-rounded-lg' : ''}`}>
        <div className="tw-flex tw-items-center tw-justify-center tw-gap-1 tw-text-sm tw-font-medium tw-text-gray-800">
          <FaMapMarkerAlt className="tw-w-3 tw-h-3 tw-text-red-500" />
          <span>{kota || 'Unknown'}</span>
        </div>
        <div className="tw-text-xs tw-text-gray-600">{provinsi || 'Unknown'}</div>
        <div className="tw-flex tw-gap-1 tw-justify-center tw-flex-wrap">
          <span className={`tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium ${
            isCurrentUser ? 'tw-bg-purple-200 tw-text-purple-800' : 'tw-bg-blue-100 tw-text-blue-700'
          }`}>
            Kota: #{rankKota || 'N/A'}
          </span>
          <span className={`tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium ${
            isCurrentUser ? 'tw-bg-purple-200 tw-text-purple-800' : 'tw-bg-green-100 tw-text-green-700'
          }`}>
            Prov: #{rankProvinsi || 'N/A'}
          </span>
        </div>
      </div>
    );
  };

  // Handler functions
  const handleBackToRankings = () => {
    router.push('/panel/exam/ranking');
  };

  const handleCheckResult = (row: any) => {
    console.log('Check result for user:', row);
    // Store state in sessionStorage since Next.js doesn't support state in router.push
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('examResultState', JSON.stringify({
        examType: examInfo.exam_type,
        examId: row.user_id
      }));
    }
    router.push(`/exam-results/${row.user_id}`);
  };

  // Definisi kolom-kolom berdasarkan data response
  const columns: ColumnConfig[] = [
    {
      key: 'rank',
      label: 'Peringkat',
      type: 'string',
      width: 120,
      colGroup: 'ranking',
      formatter: formatRankPosition
    },
    {
      key: 'name',
      label: 'Nama Peserta',
      type: 'string',
      width: 250,
      colGroup: 'student',
      formatter: formatStudentName
    },
    {
      key: 'total_score',
      label: 'Skor Total',
      type: 'string',
      width: 120,
      colGroup: 'scores',
      formatter: (value, row) => formatScore(value, 'total', row)
    },
    {
      key: 'average_score',
      label: 'Skor Rata-rata',
      type: 'number',
      width: 130,
      colGroup: 'scores',
      formatter: (value, row) => formatScore(value, 'rata-rata', row)
    },
    {
      key: 'sekolah',
      label: 'Jenis Sekolah',
      type: 'string',
      width: 120,
      colGroup: 'student',
      formatter: formatSchool
    },
    {
      key: 'location',
      label: 'Lokasi & Ranking Daerah',
      type: 'string',
      width: 220,
      colGroup: 'location',
      formatter: (value, row) => formatLocation(row.kota, row.provinsi, row.rank_kota, row.rank_provinsi, row)
    }
  ];

  // Konfigurasi report
  const reportConfig: ReportConfig = {
    title: `Detail Ranking: ${examInfo.exam_type} - ${examInfo.exam_name}`,
    columns,
    colGroups: [
      {
        key: 'ranking',
        label: 'Peringkat',
        columns: ['rank']
      },
      {
        key: 'student',
        label: 'Informasi Peserta',
        columns: ['name', 'sekolah']
      },
      {
        key: 'scores',
        label: 'Nilai',
        columns: ['total_score', 'average_score']
      },
      {
        key: 'location',
        label: 'Lokasi',
        columns: ['location']
      }
    ],
    filters: [
      {
        key: 'name',
        type: 'text',
        label: 'Nama Peserta'
      },
      {
        key: 'sekolah',
        type: 'select',
        label: 'Jenis Sekolah',
        options: [
          { value: 'SMA', label: 'SMA' },
          { value: 'SMK', label: 'SMK' },
          { value: 'MA', label: 'MA' },
          { value: 'Kuliah', label: 'Kuliah' }
        ]
      },
      {
        key: 'kota',
        type: 'select',
        label: 'Kota',
        apiEndpoint: '/ranking/cities',
        debounceMs: 300
      },
      {
        key: 'provinsi',
        type: 'select',
        label: 'Provinsi',
        apiEndpoint: '/ranking/provinces',
        debounceMs: 300
      },
      {
        key: 'total_score',
        type: 'number',
        label: 'Skor Total (Minimal)'
      },
      {
        key: 'average_score',
        type: 'number',
        label: 'Skor Rata-rata (Minimal)'
      },
      {
        key: 'rank',
        type: 'number',
        label: 'Peringkat (Maksimal)'
      }
    ],
    defaultSort: [
      { key: 'rank', direction: 'asc' }
    ],
    defaultVisibleColumns: [
      'rank', 
      'name', 
      'total_score',
      'average_score',
      'sekolah',
      'location'
    ],
    defaultFreezeColumn: 'rank',
    showIcon: false,
    showRowNumber: false,
    pageSize: 25,
    rowHeight: 80,
    exportConfig: {
      enabled: true,
      filename: `ranking_detail_${examInfo.exam_type}_${examInfo.exam}`,
      formats: ['excel', 'csv', 'pdf']
    },
    actionColumn: {
      enabled: true,
      label: 'Aksi',
      width: 120,
      sticky: false,
      buttons: [
        {
          label: 'Hasil',
          icon: React.createElement(FaChartBar),
          variant: 'outline-success',
          size: 'sm',
          onClick: handleCheckResult
        }
      ]
    },
    actionButtons: [
      {
        label: 'Kembali ke Ranking',
        icon: React.createElement(ArrowLeft),
        variant: 'secondary',
        onClick: handleBackToRankings
      }
    ]
  };

  return (
    <MainLayout>
      <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-purple-50 tw-via-white tw-to-purple-50">
        {/* Back Navigation */}
        <div className="tw-mb-4 tw-mx-2 sm:tw-mx-0">
          <button
            onClick={handleBackToRankings}
            className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-white tw-border tw-border-gray-300 tw-rounded-lg tw-text-gray-700 hover:tw-bg-gray-50 tw-transition-colors tw-shadow-sm"
          >
            <FaArrowLeft className="tw-w-4 tw-h-4" />
            <span>Kembali ke Ranking</span>
          </button>
        </div>

        {/* User Info Card (if userRanking available) */}
        {currentUserId && (
          <div className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 tw-text-white tw-p-4 tw-rounded-xl tw-shadow-lg tw-mb-6 tw-mx-2 sm:tw-mx-0">
            <div className="tw-flex tw-items-center tw-gap-4">
              <div className="tw-bg-white/20 tw-p-3 tw-rounded-full">
                <User className="tw-w-8 tw-h-8" />
              </div>
              <div>
                <h2 className="tw-text-xl tw-font-bold tw-mb-1">Informasi Ranking Anda</h2>
                <p className="tw-text-purple-100 tw-text-sm">
                  Data ranking Anda akan di-highlight dalam tabel di bawah ini
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Report Layout */}
        <ReportLayout
          config={reportConfig}
          apiEndpoint={`/ranking/by-user/${examInfo.exam}`}
          fetchOnMount={true}
          searchMode="server"
        />
      </div>
    </MainLayout>
  );
};

export default RankingDetailPage;