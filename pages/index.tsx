// pages/index.tsx - Main Landing Page
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Container, Row, Col, Card, Button, Badge, ProgressBar } from 'react-bootstrap';
import NavigationBar from '../components/layout/NavigationBar';
import Footer from '../components/layout/Footer';
import { 
  Trophy, Star, Award, Users, BookOpen, GraduationCap, Target, 
  BarChart3, Brain, Rocket, Zap, CheckCircle, ArrowRight,
  TrendingUp, Activity, Clock, School, Video, FileQuestion,
  Smartphone, Monitor, ChevronRight, PieChart,
  Lightbulb, PlayCircle, Calendar
} from 'lucide-react';
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';

// ========== SAMPLE DASHBOARD DATA ==========
const sampleRadarData = [
  { subject: 'Matematika', score: 85, fullMark: 100 },
  { subject: 'Fisika', score: 78, fullMark: 100 },
  { subject: 'Kimia', score: 82, fullMark: 100 },
  { subject: 'Biologi', score: 90, fullMark: 100 },
  { subject: 'B. Indonesia', score: 88, fullMark: 100 }
];

const sampleWeeklyData = [
  { name: 'Minggu 1', nilai: 650, target: 600 },
  { name: 'Minggu 2', nilai: 670, target: 620 },
  { name: 'Minggu 3', nilai: 685, target: 640 },
  { name: 'Minggu 4', nilai: 710, target: 660 }
];

const sampleRecentResults = [
  { id: 1, title: 'SNBT Try Out #12', score: 685, date: '24 Des 2024' },
  { id: 2, title: 'SNBT Try Out #11', score: 670, date: '17 Des 2024' },
  { id: 3, title: 'SNBT Try Out #10', score: 650, date: '10 Des 2024' }
];

const CHART_COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'];

// ========== MINI DASHBOARD PREVIEW COMPONENT ==========
const MiniDashboardPreview: React.FC = () => {
  return (
    <div className="tw-space-y-3">
      {/* Header Stats */}
      <div className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-700 tw-rounded-lg tw-p-4 tw-text-white">
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
          <div>
            <div className="tw-text-xs tw-text-purple-200 tw-mb-1">Dashboard SNBT</div>
            <div className="tw-text-2xl tw-font-bold">#127</div>
            <div className="tw-text-xs tw-text-purple-200">Peringkat</div>
          </div>
          <div className="tw-text-right">
            <div className="tw-text-2xl tw-font-bold">685</div>
            <div className="tw-text-xs tw-text-purple-200">Rata-rata Skor</div>
          </div>
        </div>
        <div className="tw-grid tw-grid-cols-2 tw-gap-2">
          <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded tw-p-2">
            <div className="tw-text-lg tw-font-bold">92%</div>
            <div className="tw-text-xs tw-text-purple-200">Persentil</div>
          </div>
          <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded tw-p-2">
            <div className="tw-text-lg tw-font-bold">15</div>
            <div className="tw-text-xs tw-text-purple-200">Try Out</div>
          </div>
        </div>
      </div>

      {/* Mini Radar Chart */}
      <Card className="tw-border-0 tw-shadow-sm">
        <Card.Body className="tw-p-3">
          <div className="tw-text-xs tw-font-bold tw-mb-2 tw-flex tw-items-center tw-text-gray-700">
            <Activity size={14} className="tw-mr-1 tw-text-purple-600" />
            Performa Mata Pelajaran
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <RadarChart data={sampleRadarData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 8 }} />
              <Radar dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* Recent Results */}
      <Card className="tw-border-0 tw-shadow-sm">
        <Card.Body className="tw-p-3">
          <div className="tw-text-xs tw-font-bold tw-mb-2 tw-flex tw-items-center tw-text-gray-700">
            <Clock size={14} className="tw-mr-1 tw-text-purple-600" />
            Try Out Terbaru
          </div>
          <div className="tw-space-y-2">
            {sampleRecentResults.map((result, idx) => (
              <div key={result.id} className="tw-flex tw-justify-between tw-items-center tw-text-xs">
                <div className="tw-flex tw-items-center tw-gap-2">
                  <div className="tw-w-5 tw-h-5 tw-bg-purple-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold" style={{ fontSize: '8px' }}>
                    {idx + 1}
                  </div>
                  <span className="tw-text-gray-700">{result.title}</span>
                </div>
                <span className="tw-font-bold tw-text-purple-600">{result.score}</span>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Progress Chart */}
      <Card className="tw-border-0 tw-shadow-sm">
        <Card.Body className="tw-p-3">
          <div className="tw-text-xs tw-font-bold tw-mb-2 tw-flex tw-items-center tw-text-gray-700">
            <TrendingUp size={14} className="tw-mr-1 tw-text-purple-600" />
            Perkembangan Mingguan
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={sampleWeeklyData}>
              <defs>
                <linearGradient id="colorNilai" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 8, fill: '#6B7280' }} />
              <Area type="monotone" dataKey="nilai" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorNilai)" strokeWidth={2} />
              <Area type="monotone" dataKey="target" stroke="#10B981" strokeDasharray="3 3" strokeWidth={1} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      {/* Recommended Programs */}
      <Card className="tw-border-0 tw-shadow-sm">
        <Card.Body className="tw-p-3">
          <div className="tw-text-xs tw-font-bold tw-mb-2 tw-flex tw-items-center tw-text-gray-700">
            <School size={14} className="tw-mr-1 tw-text-purple-600" />
            Rekomendasi Program Studi
          </div>
          <div className="tw-space-y-2">
            <div className="tw-p-2 tw-bg-indigo-50 tw-rounded tw-border tw-border-indigo-200">
              <div className="tw-text-xs tw-font-semibold tw-text-gray-800 tw-mb-1">Teknik Informatika - ITB</div>
              <div className="tw-flex tw-justify-between tw-items-center tw-text-xs tw-text-gray-600 tw-mb-1">
                <span>Min. Skor: 650</span>
                <span className="tw-text-green-600 tw-font-semibold">✓ Memenuhi</span>
              </div>
              <ProgressBar now={100} variant="success" style={{ height: '4px' }} />
            </div>
            <div className="tw-p-2 tw-bg-indigo-50 tw-rounded tw-border tw-border-indigo-200">
              <div className="tw-text-xs tw-font-semibold tw-text-gray-800 tw-mb-1">Kedokteran - UI</div>
              <div className="tw-flex tw-justify-between tw-items-center tw-text-xs tw-text-gray-600 tw-mb-1">
                <span>Min. Skor: 720</span>
                <span className="tw-text-orange-600 tw-font-semibold">Kurang 35</span>
              </div>
              <ProgressBar now={95} variant="warning" style={{ height: '4px' }} />
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

// ========== MAIN LANDING PAGE ==========
export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <BookOpen size={48} className="tw-text-purple-600" />,
      title: 'Pembelajaran Adaptif',
      description: 'Sistem yang menyesuaikan dengan kemampuan dan kecepatan belajar kamu. Futuredu memahami setiap orang punya cara belajar unik!'
    },
    {
      icon: <FileQuestion size={48} className="tw-text-purple-600" />,
      title: 'Simulasi Ujian',
      description: 'Persiapkan diri dengan simulasi ujian seperti kondisi sebenarnya. Tingkatkan kesiapan mentalmu!'
    },
    {
      icon: <CheckCircle size={48} className="tw-text-purple-600" />,
      title: 'Latihan Soal',
      description: 'Luangkan 10 menit setiap hari untuk latihan soal terarah berbasis micro-learning.'
    },
    {
      icon: <PlayCircle size={48} className="tw-text-purple-600" />,
      title: 'Materi Interaktif',
      description: 'Belajar seru dengan video interaktif—tidak ada lagi kantuk saat belajar!'
    },
    {
      icon: <Users size={48} className="tw-text-purple-600" />,
      title: 'Grup Diskusi',
      description: 'Komunitas pembelajar saling mendukung, diskusi materi & tips belajar.'
    },
    {
      icon: <Trophy size={48} className="tw-text-purple-600" />,
      title: 'Papan Peringkat',
      description: 'Pantau posisimu & rasakan sensasi kompetisi yang sehat di leaderboard.'
    },
    {
      icon: <BarChart3 size={48} className="tw-text-purple-600" />,
      title: 'Analisis Kemampuan',
      description: 'Ketahui kekuatan & kelemahanmu lewat analisis data komprehensif.'
    },
    {
      icon: <Lightbulb size={48} className="tw-text-purple-600" />,
      title: 'Rekomendasi Belajar',
      description: 'Saran materi dipersonalisasi seperti punya mentor pribadi!'
    }
  ];

  const uniqueFeatures = [
    {
      icon: <Brain size={48} className="tw-text-yellow-400" />,
      title: 'Penilaian Sistem IRT 3PL',
      description: 'Sistem penilaian paling canggih dengan Item Response Theory—seperti UTBK asli. Skormu lebih akurat!',
      badge: 'ADVANCED'
    },
    {
      icon: <FileQuestion size={48} className="tw-text-yellow-400" />,
      title: 'Ujian SNBT, Mandiri & Kedinasan',
      description: 'Simulasi lengkap untuk SNBT, Ujian Mandiri PTN, dan Kedinasan dengan soal berkualitas standar nasional.',
      badge: 'COMPLETE'
    },
    {
      icon: <BookOpen size={48} className="tw-text-yellow-400" />,
      title: 'Materi, Quiz & Drill Latihan',
      description: 'Materi pembelajaran terstruktur dengan quiz dan drill latihan soal untuk mengasah kemampuanmu.',
      badge: 'STRUCTURED'
    },
    {
      icon: <TrendingUp size={48} className="tw-text-yellow-400" />,
      title: 'Percentile Ranking Real-Time',
      description: 'Tahu posisi real-time kamu di antara ribuan peserta se-Indonesia. Top 10%? Top 1%? Cek sekarang!',
      badge: 'REAL-TIME'
    },
    {
      icon: <Target size={48} className="tw-text-yellow-400" />,
      title: 'Passing Probability Calculator',
      description: 'Prediksi peluang lolos ke kampus impian berdasarkan data historis ribuan siswa sebelumnya.',
      badge: 'DATA DRIVEN'
    },
    {
      icon: <Zap size={48} className="tw-text-yellow-400" />,
      title: 'AI Rekomendasi Prodi',
      description: 'AI pintar yang merekomendasikan program studi mana yang cocok & peluang diterima paling tinggi.',
      badge: 'AI POWERED'
    },
    {
      icon: <Activity size={48} className="tw-text-yellow-400" />,
      title: 'Analisis Kompetitif',
      description: 'Bandingkan performamu dengan rata-rata nasional. Ketahui gap skormu dan cara meningkatkannya!',
      badge: 'COMPETITIVE'
    },
    {
      icon: <Award size={48} className="tw-text-yellow-400" />,
      title: 'Safe Zone Calculator',
      description: 'Ketahui berapa score aman untuk diterima di kampus targetmu. No more guessing, data-driven!',
      badge: 'EXCLUSIVE'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Siswa Aktif' },
    { value: '1000+', label: 'Video Pembelajaran' },
    { value: '10K+', label: 'Soal Latihan' },
    { value: '95%', label: 'Tingkat Kepuasan' }
  ];

  const testimonials = [
    {
      name: 'Andi Pratama',
      role: 'Mahasiswa ITB',
      content: 'Futuredu sangat membantu saya lolos SNBT! Dashboard analisisnya detail banget dan rekomendasi belajarnya tepat sasaran.',
      rating: 5,
      avatar: '👨‍🎓'
    },
    {
      name: 'Siti Nurhaliza',
      role: 'Mahasiswa UI',
      content: 'Try out-nya mirip banget sama soal asli. Plus ada pembahasan lengkap yang mudah dipahami. Recommended!',
      rating: 5,
      avatar: '👩‍🎓'
    },
    {
      name: 'Budi Santoso',
      role: 'Mahasiswa UGM',
      content: 'Fitur rekomendasi program studinya membantu saya menemukan jurusan yang sesuai dengan kemampuan. Mantap!',
      rating: 5,
      avatar: '👨‍💼'
    }
  ];

  return (
    <>
      <Head>
        <title>Futuredu - Platform Belajar Cerdas untuk Masa Depanmu</title>
        <meta name="description" content="Platform belajar online terlengkap dengan dashboard analisis, try out SNBT/UTBK, dan rekomendasi program studi berbasis AI" />
        <style jsx global>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fadeInUp {
            opacity: 0;
            animation: fadeInUp 0.8s ease-out forwards;
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-scaleIn {
            opacity: 0;
            animation: scaleIn 0.6s ease-out forwards;
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          .delay-400 { animation-delay: 0.4s; }
          .delay-500 { animation-delay: 0.5s; }
          .delay-600 { animation-delay: 0.6s; }
          .delay-700 { animation-delay: 0.7s; }
          .delay-800 { animation-delay: 0.8s; }
        `}</style>
      </Head>

      <div className="tw-min-h-screen" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <NavigationBar />

        {/* Animated Background Effects */}
        <div className="tw-fixed tw-inset-0 tw-pointer-events-none tw-z-0">
          <div className="tw-absolute tw-top-20 tw-right-20 tw-w-32 tw-h-32 tw-bg-yellow-300/20 tw-rounded-full tw-blur-3xl tw-animate-pulse"></div>
          <div className="tw-absolute tw-bottom-32 tw-left-20 tw-w-40 tw-h-40 tw-bg-pink-300/20 tw-rounded-full tw-blur-3xl tw-animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="tw-absolute tw-top-1/2 tw-left-1/2 tw-w-64 tw-h-64 tw-bg-purple-300/10 tw-rounded-full tw-blur-3xl tw-animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Hero Section */}
        <section className="tw-relative tw-text-white tw-py-20 tw-z-10">
          <Container>
            <Row className="align-items-center">
              <Col lg={6} className="tw-mb-5 mb-lg-0">
                <div>
                  <Badge bg="light" text="dark" className="tw-mb-4 tw-px-4 tw-py-2 tw-text-sm">
                    <Zap size={16} className="tw-inline tw-mr-2" />
                    Platform Belajar #1 di Indonesia
                  </Badge>
                  <h1 className="tw-text-5xl tw-font-bold tw-mb-4 tw-leading-tight">
                    Raih Masa Depan Cerah dengan{' '}
                    <span className="tw-text-yellow-300">Futuredu</span>
                  </h1>
                  <p className="tw-text-xl tw-mb-6 tw-text-purple-100">
                    Platform belajar online terlengkap dengan dashboard analisis cerdas, ribuan soal try out, 
                    dan rekomendasi program studi berbasis AI untuk membantu kamu lolos ujian impian!
                  </p>
                  <div className="tw-flex tw-gap-4 tw-flex-wrap">
                    <Button
                      size="lg"
                      onClick={() => router.push('/register')}
                      className="tw-bg-white tw-text-purple-600 hover:tw-bg-purple-50 tw-border-0 tw-font-bold tw-px-6"
                    >
                      Mulai Belajar Gratis
                      <ArrowRight size={20} className="tw-inline tw-ml-2" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline-light"
                      onClick={() => {
                        document.getElementById('dashboard-preview')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="tw-font-semibold tw-px-6"
                    >
                      Lihat Dashboard
                      <ChevronRight size={20} className="tw-inline tw-ml-2" />
                    </Button>
                  </div>

                  {/* Stats */}
                  <Row className="tw-mt-8 g-4">
                    {stats.map((stat, idx) => (
                      <Col xs={6} md={3} key={idx}>
                        <div className="tw-text-center">
                          <div className="tw-text-3xl tw-font-bold tw-text-yellow-300">{stat.value}</div>
                          <div className="tw-text-sm tw-text-purple-200">{stat.label}</div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Col>
              <Col lg={6}>
                {/* Hero image placeholder */}
                <div className="tw-relative tw-h-full tw-min-h-[400px] tw-flex tw-items-center tw-justify-center animate-fadeInUp delay-400">
                  <div className="tw-relative animate-float">
                    <div className="tw-relative tw-bg-white/15 tw-backdrop-blur-md tw-rounded-2xl tw-p-12 tw-border-2 tw-border-white/40 tw-shadow-2xl">
                      <GraduationCap size={100} className="tw-text-yellow-300 tw-mx-auto tw-mb-6 tw-drop-shadow-lg" />
                      <div className="tw-text-center tw-text-white">
                        <h3 className="tw-text-3xl tw-font-bold tw-mb-3 tw-drop-shadow-md">Belajar Lebih Cerdas</h3>
                        <p className="tw-text-lg tw-text-white/95 tw-drop-shadow">Platform belajar terlengkap untuk masa depanmu</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Features Section */}
        <section id="features" className="tw-relative tw-py-20 tw-z-10">
          <Container>
            <div className="tw-text-center tw-mb-12">
              <Badge bg="light" text="dark" className="tw-px-4 tw-py-2 tw-mb-3">
                Fitur Unggulan
              </Badge>
              <h2 className="tw-text-4xl tw-font-bold tw-mb-4 tw-text-white">
                Semua yang Kamu Butuhkan untuk Sukses
              </h2>
              <p className="tw-text-xl tw-text-white/90 tw-max-w-3xl tw-mx-auto">
                Futuredu menyediakan tools lengkap untuk membantu kamu mencapai target masuk PTN impian
              </p>
            </div>

            <Row className="g-4">
              {features.map((feature, idx) => (
                <Col key={idx} xs={12} md={6} lg={4} className="animate-fadeInUp" style={{animationDelay: `${idx * 0.1}s`}}>
                  <Card className="tw-h-full tw-border-0 tw-shadow-lg hover:tw-shadow-xl tw-transition-all hover:tw-translate-y-[-4px]">
                    <Card.Body className="tw-p-6 tw-text-center">
                      <div className="tw-mb-4 animate-float" style={{animationDelay: `${idx * 0.2}s`}}>
                        {feature.icon}
                      </div>
                      <h5 className="tw-font-bold tw-mb-3 tw-text-gray-800">{feature.title}</h5>
                      <p className="tw-text-gray-600 tw-mb-0">{feature.description}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Unique Features Section */}
        <section className="tw-relative tw-py-20 tw-z-10">
          <Container>
            <div className="tw-text-center tw-mb-12">
              <Badge bg="warning" text="dark" className="tw-px-4 tw-py-2 tw-mb-3 tw-animate-pulse">
                ✨ Kenapa Futuredu Spesial?
              </Badge>
              <h2 className="tw-text-4xl tw-font-bold tw-mb-4 tw-text-white">
                Membantu Performa Kamu Mencapai Mimpi
              </h2>
              <p className="tw-text-xl tw-text-white/90 tw-max-w-3xl tw-mx-auto">
                Teknologi canggih & sistem analisis berbasis data untuk mengakselerasi kesuksesanmu
              </p>
            </div>

            <Row className="g-4">
              {uniqueFeatures.map((feature, idx) => (
                <Col key={idx} xs={12} md={6} lg={3} className="animate-scaleIn" style={{animationDelay: `${idx * 0.1}s`}}>
                  <Card className="tw-h-full tw-border-0 tw-shadow-xl hover:tw-shadow-2xl tw-transition-all hover:tw-translate-y-[-8px] tw-bg-gradient-to-br tw-from-purple-900 tw-to-indigo-900 tw-text-white">
                    <Card.Body className="tw-p-6 tw-text-center tw-relative">
                      <Badge 
                        bg="warning" 
                        className="tw-absolute tw-top-3 tw-right-3 tw-text-xs tw-px-2 tw-py-1"
                      >
                        {feature.badge}
                      </Badge>
                      <div className="tw-mb-4 tw-mt-2 animate-float" style={{animationDelay: `${idx * 0.3}s`}}>
                        {feature.icon}
                      </div>
                      <h5 className="tw-font-bold tw-mb-3 tw-text-white">{feature.title}</h5>
                      <p className="tw-text-white/80 tw-text-sm tw-mb-0">{feature.description}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Dashboard Preview Section */}
        <section id="dashboard-preview" className="tw-relative tw-py-20 tw-z-10">
          <Container>
            <div className="tw-text-center tw-mb-12">
              <Badge bg="light" text="dark" className="tw-px-4 tw-py-2 tw-mb-3">
                Dashboard Analisis
              </Badge>
              <h2 className="tw-text-4xl tw-font-bold tw-mb-4 tw-text-white">
                Dashboard Analisis yang Powerful
              </h2>
              <p className="tw-text-xl tw-text-white/90 tw-max-w-3xl tw-mx-auto">
                Pantau perkembangan belajarmu dengan dashboard yang lengkap dan mudah dipahami. 
                Tersedia untuk desktop dan mobile.
              </p>
            </div>

            <Row className="g-5">
              {/* Desktop Preview */}
              <Col lg={8}>
                <div className="tw-mb-4 tw-flex tw-items-center tw-gap-2">
                  <Monitor size={24} className="tw-text-white" />
                  <h5 className="tw-font-bold tw-mb-0 tw-text-white">Tampilan Desktop</h5>
                </div>
                <Card className="tw-border-0 tw-shadow-2xl tw-overflow-hidden">
                  <div className="tw-bg-gray-800 tw-p-2 tw-flex tw-items-center tw-gap-2">
                    <div className="tw-w-3 tw-h-3 tw-rounded-full tw-bg-red-500"></div>
                    <div className="tw-w-3 tw-h-3 tw-rounded-full tw-bg-yellow-500"></div>
                    <div className="tw-w-3 tw-h-3 tw-rounded-full tw-bg-green-500"></div>
                    <div className="tw-flex-1 tw-text-center tw-text-xs tw-text-gray-400">futuredu.com/panel</div>
                  </div>
                  <div className="tw-bg-white tw-p-6" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {/* Desktop Dashboard Content */}
                    <div className="tw-space-y-4">
                      {/* Header */}
                      <div className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-700 tw-rounded-lg tw-p-6 tw-text-white">
                        <div className="tw-flex tw-justify-between tw-items-start tw-mb-4">
                          <div>
                            <h3 className="tw-text-2xl tw-font-bold tw-mb-2 tw-flex tw-items-center">
                              <Trophy className="tw-mr-2" size={28} />
                              Dashboard SNBT
                            </h3>
                            <p className="tw-text-purple-100 tw-text-sm tw-mb-0">
                              Pantau perkembangan dan performa ujianmu
                            </p>
                          </div>
                          <Badge bg="light" text="dark" className="tw-px-3 tw-py-2">
                            SNBT 2024
                          </Badge>
                        </div>
                        <Row className="g-3">
                          <Col xs={3}>
                            <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-lg tw-p-3">
                              <Trophy className="tw-text-yellow-300 tw-mb-2" size={20} />
                              <div className="tw-text-2xl tw-font-bold">#127</div>
                              <div className="tw-text-xs tw-text-purple-100">Peringkat</div>
                            </div>
                          </Col>
                          <Col xs={3}>
                            <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-lg tw-p-3">
                              <Star className="tw-text-yellow-300 tw-mb-2" size={20} />
                              <div className="tw-text-2xl tw-font-bold">685</div>
                              <div className="tw-text-xs tw-text-purple-100">Rata-rata Skor</div>
                            </div>
                          </Col>
                          <Col xs={3}>
                            <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-lg tw-p-3">
                              <Award className="tw-text-yellow-300 tw-mb-2" size={20} />
                              <div className="tw-text-2xl tw-font-bold">92%</div>
                              <div className="tw-text-xs tw-text-purple-100">Persentil</div>
                            </div>
                          </Col>
                          <Col xs={3}>
                            <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-lg tw-p-3">
                              <Users className="tw-text-yellow-300 tw-mb-2" size={20} />
                              <div className="tw-text-2xl tw-font-bold">10K+</div>
                              <div className="tw-text-xs tw-text-purple-100">Peserta</div>
                            </div>
                          </Col>
                        </Row>
                      </div>

                      {/* Charts */}
                      <Row className="g-3">
                        <Col md={6}>
                          <Card className="tw-border-0 tw-shadow-sm">
                            <Card.Body className="tw-p-4">
                              <h6 className="tw-font-bold tw-mb-3 tw-flex tw-items-center tw-text-gray-800">
                                <Activity className="tw-mr-2 tw-text-purple-600" size={18} />
                                Performa Mata Pelajaran
                              </h6>
                              <ResponsiveContainer width="100%" height={200}>
                                <RadarChart data={sampleRadarData}>
                                  <PolarGrid stroke="#E5E7EB" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 10 }} />
                                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 9 }} />
                                  <Radar dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} strokeWidth={2} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card className="tw-border-0 tw-shadow-sm">
                            <Card.Body className="tw-p-4">
                              <h6 className="tw-font-bold tw-mb-3 tw-flex tw-items-center tw-text-gray-800">
                                <TrendingUp className="tw-mr-2 tw-text-purple-600" size={18} />
                                Perkembangan Mingguan
                              </h6>
                              <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={sampleWeeklyData}>
                                  <defs>
                                    <linearGradient id="desktopColorNilai" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} />
                                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                                  <Area type="monotone" dataKey="nilai" stroke="#8B5CF6" fillOpacity={1} fill="url(#desktopColorNilai)" strokeWidth={2} />
                                  <Area type="monotone" dataKey="target" stroke="#10B981" strokeDasharray="5 5" strokeWidth={2} fill="none" />
                                </AreaChart>
                              </ResponsiveContainer>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>

                      {/* Recent Results & Recommendations */}
                      <Row className="g-3">
                        <Col md={6}>
                          <Card className="tw-border-0 tw-shadow-sm">
                            <Card.Body className="tw-p-4">
                              <h6 className="tw-font-bold tw-mb-3 tw-flex tw-items-center tw-text-gray-800">
                                <Clock className="tw-mr-2 tw-text-purple-600" size={18} />
                                Try Out Terbaru
                              </h6>
                              <div className="tw-space-y-2">
                                {sampleRecentResults.map((result, idx) => (
                                  <div key={result.id} className="tw-p-3 tw-bg-gradient-to-r tw-from-purple-50 tw-to-pink-50 tw-rounded-lg tw-border tw-border-purple-200">
                                    <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                                      <div className="tw-flex tw-items-center tw-gap-2">
                                        <div className="tw-w-6 tw-h-6 tw-bg-purple-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-text-xs">
                                          {idx + 1}
                                        </div>
                                        <span className="tw-font-semibold tw-text-sm tw-text-gray-800">{result.title}</span>
                                      </div>
                                      <span className="tw-text-xs tw-text-gray-500 tw-bg-white tw-px-2 tw-py-1 tw-rounded">
                                        {result.date}
                                      </span>
                                    </div>
                                    <div className="tw-flex tw-items-center tw-gap-2">
                                      <ProgressBar now={85} variant="success" className="tw-flex-1" style={{ height: '6px' }} />
                                      <span className="tw-font-bold tw-text-purple-600">{result.score}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card className="tw-border-0 tw-shadow-sm">
                            <Card.Body className="tw-p-4">
                              <h6 className="tw-font-bold tw-mb-3 tw-flex tw-items-center tw-text-gray-800">
                                <School className="tw-mr-2 tw-text-purple-600" size={18} />
                                Rekomendasi Program Studi
                              </h6>
                              <div className="tw-space-y-2">
                                <div className="tw-p-3 tw-bg-gradient-to-r tw-from-indigo-50 tw-to-blue-50 tw-rounded-lg tw-border-2 tw-border-indigo-200">
                                  <div className="tw-flex tw-justify-between tw-items-start tw-mb-2">
                                    <div className="tw-flex-1">
                                      <h6 className="tw-font-bold tw-text-sm tw-text-gray-800 tw-mb-1">Teknik Informatika - ITB</h6>
                                      <div className="tw-text-xs tw-text-gray-600 tw-mb-1">
                                        <span className="tw-font-medium">Min. Skor:</span> 650 • Saintek
                                      </div>
                                    </div>
                                    <div className="tw-text-right">
                                      <div className="tw-text-xs tw-font-semibold tw-text-green-600">✓ Memenuhi</div>
                                      <div className="tw-text-xs tw-text-gray-500">685 / 650</div>
                                    </div>
                                  </div>
                                  <ProgressBar now={100} variant="success" style={{ height: '6px' }} />
                                </div>
                                <div className="tw-p-3 tw-bg-gradient-to-r tw-from-indigo-50 tw-to-blue-50 tw-rounded-lg tw-border-2 tw-border-indigo-200">
                                  <div className="tw-flex tw-justify-between tw-items-start tw-mb-2">
                                    <div className="tw-flex-1">
                                      <h6 className="tw-font-bold tw-text-sm tw-text-gray-800 tw-mb-1">Kedokteran - UI</h6>
                                      <div className="tw-text-xs tw-text-gray-600 tw-mb-1">
                                        <span className="tw-font-medium">Min. Skor:</span> 720 • Saintek
                                      </div>
                                    </div>
                                    <div className="tw-text-right">
                                      <div className="tw-text-xs tw-font-semibold tw-text-orange-600">Kurang 35</div>
                                      <div className="tw-text-xs tw-text-gray-500">685 / 720</div>
                                    </div>
                                  </div>
                                  <ProgressBar now={95} variant="warning" style={{ height: '6px' }} />
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Mobile Preview */}
              <Col lg={4}>
                <div className="tw-mb-4 tw-flex tw-items-center tw-gap-2">
                  <Smartphone size={24} className="tw-text-white" />
                  <h5 className="tw-font-bold tw-mb-0 tw-text-white">Tampilan Mobile</h5>
                </div>
                <div className="tw-max-w-sm tw-mx-auto">
                  <Card className="tw-border-0 tw-shadow-2xl tw-overflow-hidden" style={{ borderRadius: '2rem' }}>
                    <div className="tw-bg-gray-800 tw-p-3 tw-rounded-t-2xl">
                      <div className="tw-w-24 tw-h-1 tw-bg-gray-600 tw-rounded-full tw-mx-auto"></div>
                    </div>
                    <div className="tw-bg-white tw-p-4" style={{ maxHeight: '700px', overflowY: 'auto' }}>
                      <MiniDashboardPreview />
                    </div>
                    <div className="tw-bg-gray-800 tw-p-3 tw-rounded-b-2xl">
                      <div className="tw-w-12 tw-h-1 tw-bg-gray-600 tw-rounded-full tw-mx-auto"></div>
                    </div>
                  </Card>
                </div>
              </Col>
            </Row>

            {/* CTA */}
            <div className="tw-text-center tw-mt-12">
              <Button
                size="lg"
                onClick={() => router.push('/register')}
                className="tw-bg-purple-600 hover:tw-bg-purple-700 tw-border-0 tw-font-bold tw-px-8"
              >
                Coba Dashboard Sekarang
                <ArrowRight size={20} className="tw-inline tw-ml-2" />
              </Button>
            </div>
          </Container>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="tw-relative tw-py-20 tw-z-10">
          <Container>
            <div className="tw-text-center tw-mb-12">
              <Badge bg="light" text="dark" className="tw-px-4 tw-py-2 tw-mb-3">
                Testimoni
              </Badge>
              <h2 className="tw-text-4xl tw-font-bold tw-mb-4 tw-text-white">
                Apa Kata Mereka yang Sudah Lolos?
              </h2>
              <p className="tw-text-xl tw-text-white/90 tw-max-w-3xl tw-mx-auto">
                Ribuan siswa telah berhasil masuk PTN impian mereka dengan bantuan Futuredu
              </p>
            </div>

            <Row className="g-4">
              {testimonials.map((testimonial, idx) => (
                <Col key={idx} xs={12} md={4} className="animate-fadeInUp" style={{animationDelay: `${idx * 0.15}s`}}>
                  <Card className="tw-h-full tw-border-0 tw-shadow-lg hover:tw-shadow-xl tw-transition-all">
                    <Card.Body className="tw-p-6">
                      <div className="tw-flex tw-items-center tw-gap-3 tw-mb-4">
                        <div className="tw-text-4xl">{testimonial.avatar}</div>
                        <div>
                          <h6 className="tw-font-bold tw-mb-0 tw-text-gray-800">{testimonial.name}</h6>
                          <p className="tw-text-sm tw-text-gray-600 tw-mb-0">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="tw-flex tw-gap-1 tw-mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} size={16} className="tw-text-yellow-400 tw-fill-yellow-400" />
                        ))}
                      </div>
                      <p className="tw-text-gray-700 tw-italic">"{testimonial.content}"</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Choose Package Section */}
        <section className="tw-relative tw-py-20 tw-z-10">
          <Container>
            <Row className="tw-items-center tw-bg-white/10 tw-backdrop-blur-md tw-rounded-3xl tw-shadow-2xl tw-p-8">
              <Col md={6} className="tw-mb-6 md:tw-mb-0">
                <h2 className="tw-text-3xl md:tw-text-4xl tw-font-bold tw-text-white tw-mb-4 tw-drop-shadow-lg">
                  Yuk, Mulai Perjalananmu Sekarang!
                </h2>
                <p className="tw-text-lg tw-text-purple-100 tw-mb-6 tw-drop-shadow">
                  Pilih paket yang sesuai dengan kebutuhanmu dan mulai belajar dengan sistem paling canggih.
                </p>
                <Button
                  size="lg"
                  onClick={() => router.push('/try-out')}
                  className="tw-bg-gradient-to-r tw-from-yellow-400 tw-to-orange-400 tw-text-purple-900 hover:tw-from-yellow-300 hover:tw-to-orange-300 tw-border-0 tw-font-bold tw-px-8 tw-shadow-xl hover:tw-scale-105 tw-transition-all"
                >
                  <Rocket size={20} className="tw-inline tw-mr-2" />
                  Lihat Paket Belajar
                </Button>
              </Col>
              <Col md={6} className="tw-text-center">
                <div className="tw-relative">
                  <div className="tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-2xl tw-p-8 tw-border-2 tw-border-white/40">
                    <GraduationCap size={120} className="tw-text-yellow-300 tw-mx-auto tw-mb-4 tw-drop-shadow-lg" />
                    <div className="tw-flex tw-gap-4 tw-justify-center tw-flex-wrap">
                      <Badge bg="warning" className="tw-px-3 tw-py-2 tw-text-sm">Try-Out SNBT</Badge>
                      <Badge bg="warning" className="tw-px-3 tw-py-2 tw-text-sm">Ujian Mandiri</Badge>
                      <Badge bg="warning" className="tw-px-3 tw-py-2 tw-text-sm">Kedinasan</Badge>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Help Section */}
        <section className="tw-relative tw-py-20 tw-bg-white/5 tw-backdrop-blur-sm tw-z-10">
          <Container>
            <div className="tw-text-center tw-mb-12">
              <h2 className="tw-text-3xl md:tw-text-4xl tw-font-bold tw-text-white tw-mb-4 tw-drop-shadow-lg">
                Ada yang Perlu Dibantu?
              </h2>
              <p className="tw-text-lg tw-text-purple-100 tw-drop-shadow">
                Jangan ragu menghubungi kami kapan pun kamu butuh bantuan
              </p>
            </div>

            <Row className="g-6 tw-justify-center">
              {[
                {
                  title: 'Bantuan Teknis',
                  icon: <Activity className="tw-h-10 tw-w-10 tw-text-purple-600" />,
                  desc: 'Kendala teknis saat menggunakan platform? Tim kami siap membantu.',
                  btn: 'Chat Support',
                  link: '#'
                },
                {
                  title: 'Konsultasi Belajar',
                  icon: <Lightbulb className="tw-h-10 tw-w-10 tw-text-purple-600" />,
                  desc: 'Butuh strategi belajar efektif? Konsultasi gratis dengan mentor kami.',
                  btn: 'Konsultasi Sekarang',
                  link: '#'
                },
                {
                  title: 'Info Program',
                  icon: <Users className="tw-h-10 tw-w-10 tw-text-purple-600" />,
                  desc: 'Penasaran dengan program dan paket belajar? Tanya langsung di sini.',
                  btn: 'Tanya Info',
                  link: '#'
                }
              ].map((item, idx) => (
                <Col xs={12} lg={4} key={idx}>
                  <Card className="tw-h-full tw-border-0 tw-shadow-2xl hover:tw-shadow-3xl hover:tw-scale-105 tw-transition-all tw-duration-300">
                    <Card.Body className="tw-p-6 tw-text-center">
                      <div className="tw-flex tw-justify-center tw-mb-4">
                        <div className="tw-bg-gradient-to-br tw-from-purple-100 tw-to-indigo-100 tw-rounded-full tw-p-4 tw-shadow-lg">
                          {item.icon}
                        </div>
                      </div>
                      <h3 className="tw-text-xl tw-font-bold tw-text-gray-800 tw-mb-3">
                        {item.title}
                      </h3>
                      <p className="tw-text-gray-600 tw-mb-5">
                        {item.desc}
                      </p>
                      <Button
                        variant="outline-primary"
                        onClick={() => router.push(item.link)}
                        className="tw-font-semibold tw-w-full"
                      >
                        {item.btn}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="tw-relative tw-py-20 tw-z-10">
          <Container>
            <Card className="tw-border-0 tw-shadow-2xl tw-bg-white/10 tw-backdrop-blur-lg">
              <Card.Body className="tw-p-8 tw-text-center">
                <h2 className="tw-text-4xl tw-font-bold tw-mb-4 tw-text-white">
                  Siap Raih Masa Depan Cerahmu?
                </h2>
                <p className="tw-text-xl tw-mb-8 tw-text-white/90">
                  Bergabunglah dengan 50,000+ siswa yang sudah belajar di Futuredu. 
                  Daftar gratis sekarang dan dapatkan akses ke semua fitur premium!
                </p>
              <div className="tw-flex tw-gap-4 tw-justify-center tw-flex-wrap">
                <Button
                  size="lg"
                  onClick={() => router.push('/register')}
                  className="tw-bg-yellow-400 tw-text-purple-900 hover:tw-bg-yellow-300 tw-border-0 tw-font-bold tw-px-8"
                >
                  Daftar Gratis Sekarang
                  <ArrowRight size={20} className="tw-inline tw-ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline-light"
                  onClick={() => router.push('/login')}
                  className="tw-font-semibold tw-px-8 tw-border-white tw-text-white hover:tw-bg-white/10"
                >
                  Sudah Punya Akun? Masuk
                </Button>
              </div>
            </Card.Body>
          </Card>
          </Container>
        </section>

        <Footer />
      </div>
    </>
  );
}
