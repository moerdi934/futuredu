// pages/panel/exam/ranking/index.tsx

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { FaEye, FaTrophy, FaUsers, FaStar, FaMapMarkerAlt, FaClock, FaChartBar } from 'react-icons/fa';
import { Award, BarChart3, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MainLayout from '../../../../components/layout/DashboardLayout';
import ReportLayout from '../../../../components/report/ReportLayout';
import { ReportConfig, ColumnConfig } from '../../../../types/report';

const UserRankingPage: React.FC = () => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean | null>(null); // null = belum initialized

  // Detect screen size untuk mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // 768px adalah breakpoint untuk tablet/mobile
      console.log('🔍 Screen width:', window.innerWidth, 'isMobile:', mobile);
      setIsMobile(mobile);
    };

    // Check on mount
    checkMobile();

    // Add event listener untuk resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Log setiap kali isMobile berubah
  useEffect(() => {
    console.log('📱 isMobile state changed:', isMobile);
  }, [isMobile]);

  // Custom formatters untuk kolom-kolom tertentu
  const formatRankPosition = (value: string) => {
    if (!value) return '-';
    const rank = parseInt(value);
    
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
    
    return (
      <div className="tw-text-center">
        <div className={`tw-inline-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-rounded-full tw-font-bold tw-text-sm tw-shadow-sm ${badgeColor}`}>
          {icon}
          <span>#{rank}</span>
        </div>
      </div>
    );
  };

  const formatExamScheduleName = (value: string) => {
    if (!value) return '-';
    return (
      <div className="tw-font-semibold tw-text-gray-800 tw-leading-tight">
        <div className="tw-text-base tw-mb-1">{value}</div>
        <div className="tw-text-xs tw-text-purple-600 tw-font-medium">Klik Detail untuk melihat lebih lanjut</div>
      </div>
    );
  };

  const formatExamType = (value: string) => {
    if (!value) {
      return (
        <div className="tw-text-center">
          <span className="tw-bg-gray-100 tw-text-gray-500 tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-italic">
            Tidak diketahui
          </span>
        </div>
      );
    }
    
    // Color mapping untuk exam type
    const typeColors = {
      'SNBT': 'tw-bg-gradient-to-r tw-from-purple-500 tw-to-indigo-500 tw-text-white',
      'UTBK': 'tw-bg-gradient-to-r tw-from-blue-500 tw-to-cyan-500 tw-text-white',
      'TPS': 'tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-500 tw-text-white',
      'TKA': 'tw-bg-gradient-to-r tw-from-orange-500 tw-to-red-500 tw-text-white'
    };
    
    const colorClass = typeColors[value as keyof typeof typeColors] || 'tw-bg-gray-500 tw-text-white';
    
    return (
      <div className="tw-text-center">
        <span className={`tw-px-4 tw-py-2 tw-rounded-full tw-text-sm tw-font-bold tw-shadow-md ${colorClass}`}>
          {value}
        </span>
      </div>
    );
  };

  const formatParticipants = (value: string) => {
    if (!value) return '-';
    const count = parseInt(value);
    
    return (
      <div className="tw-text-center">
        <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
          <FaUsers className="tw-text-blue-600 tw-w-4 tw-h-4" />
          <span className="tw-text-lg tw-font-bold tw-text-blue-700">{count}</span>
        </div>
        <div className="tw-text-xs tw-text-gray-500">
          {count === 1 ? 'peserta' : 'peserta'}
        </div>
      </div>
    );
  };

  const formatScore = (value: string, label: string) => {
    if (!value) return '-';
    const score = parseInt(value);
    
    // Color berdasarkan score
    let scoreColor = 'tw-text-red-600';
    if (score >= 80) scoreColor = 'tw-text-green-600';
    else if (score >= 60) scoreColor = 'tw-text-blue-600';
    else if (score >= 40) scoreColor = 'tw-text-orange-600';
    
    return (
      <div className="tw-text-center">
        <div className={`tw-text-xl tw-font-bold ${scoreColor}`}>
          {score}
        </div>
        <div className="tw-text-xs tw-text-gray-500">{label}</div>
      </div>
    );
  };

  const formatDateTime = (value: string) => {
    if (!value) {
      return (
        <div className="tw-text-center">
          <span className="tw-text-gray-400 tw-italic tw-flex tw-items-center tw-justify-center tw-gap-1">
            <FaClock className="tw-w-3 tw-h-3" />
            Belum ada waktu
          </span>
        </div>
      );
    }
    
    const date = new Date(value);
    
    // Indonesian days of week
    const daysIndonesian = [
      'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    ];
    
    // Get day name in Indonesian
    const dayName = daysIndonesian[date.getDay()];
    
    return (
      <div className="tw-text-center">
        <div className="tw-font-medium tw-text-gray-800 tw-flex tw-items-center tw-justify-center tw-gap-1 tw-text-sm">
          <FaClock className="tw-w-3 tw-h-3 tw-text-purple-600" />
          {dayName}
        </div>
        <div className="tw-text-xs tw-text-gray-600">
          {date.toLocaleDateString('id-ID')}
        </div>
        <div className="tw-text-xs tw-text-gray-500">
          {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  };

  const formatLocation = (kota: string, provinsi: string, rankKota: string, rankProvinsi: string) => {
    return (
      <div className="tw-text-center tw-space-y-2">
        <div className="tw-flex tw-items-center tw-justify-center tw-gap-1 tw-text-sm tw-font-medium tw-text-gray-800">
          <FaMapMarkerAlt className="tw-w-3 tw-h-3 tw-text-red-500" />
          <span>{kota || 'Unknown'}</span>
        </div>
        <div className="tw-text-xs tw-text-gray-600">{provinsi || 'Unknown'}</div>
        <div className="tw-flex tw-gap-1 tw-justify-center tw-flex-wrap">
          <span className="tw-bg-blue-100 tw-text-blue-700 tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium">
            Kota: #{rankKota || 'N/A'}
          </span>
          <span className="tw-bg-green-100 tw-text-green-700 tw-px-2 tw-py-1 tw-rounded tw-text-xs tw-font-medium">
            Prov: #{rankProvinsi || 'N/A'}
          </span>
        </div>
      </div>
    );
  };

  // Handler functions
  const handleViewDetail = (row: any) => {
    console.log('👁️ View ranking detail:', row);
    const examType = encodeURIComponent(row.exam_type || '');
    const examScheduleId = encodeURIComponent(row.exam_schedule_id || '');
    const examScheduleName = encodeURIComponent(row.exam_schedule_name || '');
    
    // Navigate to detail page with query parameters using Next.js router
    router.push(`/panel/exam/ranking/detail?exam_type=${examType}&exam=${examScheduleId}&esn=${examScheduleName}`);
  };

  const handleRefreshData = () => {
    console.log('🔄 Refresh ranking data');
    // The ReportLayout will handle refresh through its refresh function
    window.location.reload();
  };

  const handleAnalysisRanking = () => {
    console.log('📊 Open ranking analysis');
    // TODO: Implement ranking analysis modal or navigate to analysis page
    router.push('/panel/exam/ranking/analysis');
  };

  // Definisi kolom-kolom berdasarkan data
  const columns: ColumnConfig[] = [
    {
      key: 'no',
      label: 'No',
      type: 'number',
      width: 70,
      colGroup: 'basic'
    },
    {
      key: 'rank',
      label: 'Peringkat',
      type: 'string',
      width: 120,
      colGroup: 'ranking',
      formatter: formatRankPosition
    },
    {
      key: 'exam_schedule_name',
      label: 'Nama Ujian',
      type: 'string',
      width: 280,
      colGroup: 'exam_info',
      formatter: formatExamScheduleName
    },
    {
      key: 'exam_type',
      label: 'Tipe Ujian',
      type: 'string',
      width: 140,
      colGroup: 'exam_info',
      formatter: formatExamType
    },
    {
      key: 'peserta',
      label: 'Total Peserta',
      type: 'string',
      width: 120,
      colGroup: 'participants',
      formatter: formatParticipants
    },
    {
      key: 'skor_total',
      label: 'Skor Total',
      type: 'string',
      width: 120,
      colGroup: 'scores',
      formatter: (value) => formatScore(value, 'total')
    },
    {
      key: 'avg_skor',
      label: 'Skor Rata-rata',
      type: 'string',
      width: 130,
      colGroup: 'scores',
      formatter: (value) => formatScore(value, 'rata-rata')
    },
    {
      key: 'waktu',
      label: 'Waktu Ujian',
      type: 'datetime',
      width: 160,
      colGroup: 'time',
      formatter: formatDateTime
    },
    {
      key: 'location',
      label: 'Lokasi & Ranking Daerah',
      type: 'string',
      width: 220,
      colGroup: 'location',
      formatter: (value, row) => formatLocation(row.kota, row.provinsi, row.rank_kota, row.rank_provinsi)
    }
  ];

  // Menggunakan useMemo untuk menghitung reportConfig agar hanya berubah saat isMobile berubah
  const reportConfig: ReportConfig = useMemo(() => {
    // Tentukan freeze column berdasarkan isMobile
    const freezeColumn = isMobile === true ? undefined : 'rank';
    
    console.log('⚙️ Creating reportConfig with freezeColumn:', freezeColumn, '(isMobile:', isMobile, ')');
    
    return {
      title: 'Ranking Pengguna Ujian (User Ranking)',
      showDebugInfo: false, // Hide debug info
      columns,
      colGroups: [
        {
          key: 'basic',
          label: 'Informasi Dasar',
          columns: ['no']
        },
        {
          key: 'ranking',
          label: 'Peringkat',
          columns: ['rank']
        },
        {
          key: 'exam_info',
          label: 'Informasi Ujian',
          columns: ['exam_schedule_name', 'exam_type']
        },
        {
          key: 'participants',
          label: 'Peserta',
          columns: ['peserta']
        },
        {
          key: 'scores',
          label: 'Nilai',
          columns: ['skor_total', 'avg_skor']
        },
        {
          key: 'time',
          label: 'Waktu',
          columns: ['waktu']
        },
        {
          key: 'location',
          label: 'Lokasi',
          columns: ['location']
        }
      ],
      filters: [
        {
          key: 'exam_schedule_name',
          type: 'text',
          label: 'Nama Ujian'
        },
        {
          key: 'exam_type',
          type: 'select',
          label: 'Tipe Ujian',
          apiEndpoint: '/ranking/exam-types',
          debounceMs: 300
        },
        {
          key: 'rank',
          type: 'number',
          label: 'Ranking (Maksimal)'
        },
        {
          key: 'peserta',
          type: 'number',
          label: 'Minimal Peserta'
        },
        {
          key: 'skor_total',
          type: 'number',
          label: 'Skor Total (Minimal)'
        },
        {
          key: 'avg_skor',
          type: 'number',
          label: 'Skor Rata-rata (Minimal)'
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
          key: 'waktu',
          type: 'date',
          label: 'Tanggal Ujian (Dari)'
        },
        {
          key: 'waktu_sampai',
          type: 'date',
          label: 'Tanggal Ujian (Sampai)'
        }
      ],
      defaultSort: [
        { key: 'rank', direction: 'asc' }
      ],
      defaultVisibleColumns: [
        'rank', 
        'exam_schedule_name', 
        'exam_type', 
        'peserta',
        'skor_total',
        'avg_skor',
        'waktu',
        'location'
      ],
      // PENTING: Tidak ada freeze column untuk layar mobile (< 768px)
      // Hanya freeze untuk layar yang lebih besar
      defaultFreezeColumn: freezeColumn,
      showIcon: true,
      showRowNumber: true,
      pageSize: 10,
      rowHeight: 90, // Increased height untuk accommodating location info
      exportConfig: {
        enabled: true,
        filename: 'user_ranking',
        formats: ['excel', 'csv', 'pdf']
      },
      actionColumn: {
        enabled: true,
        label: 'Aksi',
        width: 150,
        sticky: false,
        buttons: [
          {
            label: 'Detail',
            icon: React.createElement(FaEye),
            variant: 'outline-info',
            size: 'sm',
            onClick: handleViewDetail
          }
        ]
      },
      actionButtons: [
        {
          label: 'Analisis Ranking',
          icon: React.createElement(BarChart3),
          variant: 'info',
          onClick: handleAnalysisRanking
        },
        {
          label: 'Refresh Data',
          icon: React.createElement(RefreshCw),
          variant: 'secondary',
          onClick: handleRefreshData
        }
      ]
    };
  }, [isMobile]); // Dependency hanya pada isMobile

  // Jangan render component sampai isMobile sudah terdeteksi
  if (isMobile === null) {
    console.log('⏳ Waiting for mobile detection...');
    return (
      <>
        <Head>
          <title>Ranking Ujian</title>
        </Head>
        <MainLayout>
          <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-blue-50 tw-via-white tw-to-blue-50 tw-flex tw-items-center tw-justify-center">
            <div className="tw-text-center">
              <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-blue-600 tw-mx-auto"></div>
              <p className="tw-mt-4 tw-text-gray-600">Loading...</p>
            </div>
          </div>
        </MainLayout>
      </>
    );
  }

  console.log('✅ Rendering UserRankingPage with isMobile:', isMobile);

  return (
    <>
      <Head>
        <title>Ranking Ujian | Futuredu</title>
      </Head>
      <MainLayout>
        <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-blue-50 tw-via-white tw-to-blue-50">
          {/* Main Report Layout */}
          <ReportLayout
            config={reportConfig}
            apiEndpoint="/ranking/user-exam-rankings"
            fetchOnMount={true}
            searchMode="server"
          />
        </div>
      </MainLayout>
    </>
  );
};

export default UserRankingPage;