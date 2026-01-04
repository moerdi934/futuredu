// pages/index.tsx - Main Landing Page
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Container, Row, Col, Card, Button, Badge, Navbar, Nav } from 'react-bootstrap';
import { 
  Trophy, Star, Award, Users, BookOpen, GraduationCap, Target, 
  BarChart3, Brain, Rocket, Zap, CheckCircle, ArrowRight,
  TrendingUp, Activity, Clock, School, Video, FileQuestion,
  Smartphone, Monitor, ChevronRight, Menu, X
} from 'lucide-react';

// ========== MAIN LANDING PAGE ==========
export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop');

  const features = [
    {
      icon: <BarChart3 size={40} className="tw-text-purple-600" />,
      title: 'Analisis Mendalam',
      description: 'Dashboard lengkap dengan grafik interaktif untuk memantau perkembangan belajarmu secara detail'
    },
    {
      icon: <Target size={40} className="tw-text-purple-600" />,
      title: 'Rekomendasi Cerdas',
      description: 'Sistem AI yang memberikan rekomendasi program studi berdasarkan skor dan minatmu'
    },
    {
      icon: <Trophy size={40} className="tw-text-purple-600" />,
      title: 'Try Out Lengkap',
      description: 'Ribuan soal try out SNBT, UTBK, dan ujian lainnya dengan pembahasan detail'
    },
    {
      icon: <Brain size={40} className="tw-text-purple-600" />,
      title: 'Pembelajaran Adaptif',
      description: 'Materi belajar yang disesuaikan dengan kelemahan dan kebutuhanmu'
    },
    {
      icon: <Users size={40} className="tw-text-purple-600" />,
      title: 'Kelas Live',
      description: 'Belajar langsung dengan pengajar berpengalaman dalam kelas interaktif'
    },
    {
      icon: <Award size={40} className="tw-text-purple-600" />,
      title: 'Sertifikat & Achievement',
      description: 'Dapatkan sertifikat dan badge untuk setiap pencapaian belajarmu'
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
      rating: 5
    },
    {
      name: 'Siti Nurhaliza',
      role: 'Mahasiswa UI',
      content: 'Try out-nya mirip banget sama soal asli. Plus ada pembahasan lengkap yang mudah dipahami. Recommended!',
      rating: 5
    },
    {
      name: 'Budi Santoso',
      role: 'Mahasiswa UGM',
      content: 'Fitur rekomendasi program studinya membantu saya menemukan jurusan yang sesuai dengan kemampuan. Mantap!',
      rating: 5
    }
  ];

  return (
    <>
      <Head>
        <title>Futuredu - Platform Belajar Cerdas untuk Masa Depanmu</title>
        <meta name="description" content="Platform belajar online terlengkap dengan dashboard analisis, try out SNBT/UTBK, dan rekomendasi program studi" />
      </Head>

      {/* Navigation */}
      <Navbar 
        expand="lg" 
        className="tw-bg-white tw-shadow-md tw-sticky tw-top-0 tw-z-50"
        style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
      >
        <Container>
          <Navbar.Brand 
            onClick={() => router.push('/')} 
            className="tw-font-bold tw-text-2xl tw-cursor-pointer"
            style={{ color: '#8B5CF6' }}
          >
            <Rocket className="tw-inline tw-mr-2 tw-mb-1" size={32} />
            Futuredu
          </Navbar.Brand>
          
          <Button
            variant="link"
            className="d-lg-none tw-text-purple-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>

          <Navbar.Collapse className={mobileMenuOpen ? 'show' : ''}>
            <Nav className="ms-auto tw-gap-4 align-items-center">
              <Nav.Link href="#features" className="tw-text-gray-700 hover:tw-text-purple-600 tw-font-medium">
                Fitur
              </Nav.Link>
              <Nav.Link href="#dashboard-preview" className="tw-text-gray-700 hover:tw-text-purple-600 tw-font-medium">
                Dashboard
              </Nav.Link>
              <Nav.Link href="#testimonials" className="tw-text-gray-700 hover:tw-text-purple-600 tw-font-medium">
                Testimoni
              </Nav.Link>
              <Button
                variant="outline-primary"
                onClick={() => router.push('/login')}
                className="tw-border-purple-600 tw-text-purple-600 hover:tw-bg-purple-600 hover:tw-text-white"
              >
                Masuk
              </Button>
              <Button
                onClick={() => router.push('/register')}
                className="tw-bg-purple-600 hover:tw-bg-purple-700 tw-border-0"
              >
                Daftar Gratis
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section className="tw-bg-gradient-to-br tw-from-purple-600 tw-via-purple-700 tw-to-indigo-800 tw-text-white tw-py-20">
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
              <div className="tw-relative">
                <div className="tw-absolute tw-inset-0 tw-bg-yellow-300 tw-rounded-3xl tw-blur-3xl tw-opacity-20"></div>
                <div className="tw-relative tw-bg-white/10 tw-backdrop-blur-lg tw-rounded-2xl tw-p-8 tw-border tw-border-white/20">
                  <div className="tw-flex tw-items-center tw-gap-4 tw-mb-6">
                    <div className="tw-w-16 tw-h-16 tw-bg-gradient-to-br tw-from-yellow-300 tw-to-orange-400 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                      <Trophy size={32} className="tw-text-white" />
                    </div>
                    <div>
                      <div className="tw-text-2xl tw-font-bold">Dashboard Analisis</div>
                      <div className="tw-text-purple-200">Pantau Progress Real-time</div>
                    </div>
                  </div>
                  <Row className="g-3">
                    <Col xs={6}>
                      <div className="tw-bg-white/10 tw-p-4 tw-rounded-xl tw-border tw-border-white/20">
                        <Activity size={24} className="tw-mb-2 tw-text-yellow-300" />
                        <div className="tw-text-2xl tw-font-bold">8.5</div>
                        <div className="tw-text-xs tw-text-purple-200">Rata-rata Skor</div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="tw-bg-white/10 tw-p-4 tw-rounded-xl tw-border tw-border-white/20">
                        <TrendingUp size={24} className="tw-mb-2 tw-text-green-300" />
                        <div className="tw-text-2xl tw-font-bold">#12</div>
                        <div className="tw-text-xs tw-text-purple-200">Peringkat</div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="tw-bg-white/10 tw-p-4 tw-rounded-xl tw-border tw-border-white/20">
                        <CheckCircle size={24} className="tw-mb-2 tw-text-blue-300" />
                        <div className="tw-text-2xl tw-font-bold">24</div>
                        <div className="tw-text-xs tw-text-purple-200">Try Out Selesai</div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="tw-bg-white/10 tw-p-4 tw-rounded-xl tw-border tw-border-white/20">
                        <Clock size={24} className="tw-mb-2 tw-text-pink-300" />
                        <div className="tw-text-2xl tw-font-bold">48h</div>
                        <div className="tw-text-xs tw-text-purple-200">Waktu Belajar</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="tw-py-20 tw-bg-gray-50">
        <Container>
          <div className="tw-text-center tw-mb-16">
            <Badge bg="purple" className="tw-mb-4 tw-px-4 tw-py-2 tw-text-sm">
              Fitur Unggulan
            </Badge>
            <h2 className="tw-text-4xl tw-font-bold tw-text-gray-800 tw-mb-4">
              Semua yang Kamu Butuhkan untuk Sukses
            </h2>
            <p className="tw-text-xl tw-text-gray-600 tw-max-w-3xl tw-mx-auto">
              Platform pembelajaran komprehensif dengan fitur-fitur canggih yang membantu kamu mencapai target akademik
            </p>
          </div>

          <Row className="g-4">
            {features.map((feature, idx) => (
              <Col key={idx} xs={12} md={6} lg={4}>
                <Card className="h-100 tw-border-0 tw-shadow-lg hover:tw-shadow-xl tw-transition-all hover:tw-scale-105 tw-cursor-pointer">
                  <Card.Body className="tw-p-6">
                    <div className="tw-mb-4">{feature.icon}</div>
                    <h5 className="tw-font-bold tw-text-gray-800 tw-mb-3">{feature.title}</h5>
                    <p className="tw-text-gray-600 tw-mb-0">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Dashboard Preview Section */}
      <section id="dashboard-preview" className="tw-py-20 tw-bg-white">
        <Container>
          <div className="tw-text-center tw-mb-12">
            <Badge bg="purple" className="tw-mb-4 tw-px-4 tw-py-2 tw-text-sm">
              Dashboard Preview
            </Badge>
            <h2 className="tw-text-4xl tw-font-bold tw-text-gray-800 tw-mb-4">
              Dashboard Analisis yang Powerful
            </h2>
            <p className="tw-text-xl tw-text-gray-600 tw-max-w-3xl tw-mx-auto tw-mb-8">
              Pantau progress belajarmu dengan dashboard interaktif yang menampilkan analisis mendalam, 
              grafik performa, dan rekomendasi personal
            </p>

            {/* View Toggle */}
            <div className="tw-flex tw-justify-center tw-gap-4 tw-mb-8">
              <Button
                variant={activeView === 'desktop' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveView('desktop')}
                className={activeView === 'desktop' ? 'tw-bg-purple-600 tw-border-0' : 'tw-border-purple-600 tw-text-purple-600'}
              >
                <Monitor size={20} className="tw-mr-2 tw-inline" />
                Desktop View
              </Button>
              <Button
                variant={activeView === 'mobile' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveView('mobile')}
                className={activeView === 'mobile' ? 'tw-bg-purple-600 tw-border-0' : 'tw-border-purple-600 tw-text-purple-600'}
              >
                <Smartphone size={20} className="tw-mr-2 tw-inline" />
                Mobile View
              </Button>
            </div>
          </div>

          {/* Dashboard Screenshot Mockup */}
          <div className="tw-max-w-6xl tw-mx-auto">
            {activeView === 'desktop' ? (
              <div className="tw-relative">
                {/* Desktop Frame */}
                <div className="tw-bg-gray-800 tw-rounded-t-2xl tw-p-2 tw-shadow-2xl">
                  <div className="tw-flex tw-gap-2 tw-mb-2">
                    <div className="tw-w-3 tw-h-3 tw-bg-red-500 tw-rounded-full"></div>
                    <div className="tw-w-3 tw-h-3 tw-bg-yellow-500 tw-rounded-full"></div>
                    <div className="tw-w-3 tw-h-3 tw-bg-green-500 tw-rounded-full"></div>
                  </div>
                  <div className="tw-bg-white tw-rounded-lg tw-overflow-hidden">
                    {/* Dashboard Content Mockup */}
                    <div className="tw-bg-gradient-to-br tw-from-purple-600 tw-to-indigo-700 tw-p-6 tw-text-white">
                      <div className="tw-flex tw-items-center tw-mb-4">
                        <Trophy size={28} className="tw-mr-3" />
                        <h3 className="tw-text-2xl tw-font-bold tw-mb-0">Dashboard SNBT</h3>
                      </div>
                      <Row className="g-3">
                        <Col xs={3}>
                          <div className="tw-bg-white/10 tw-backdrop-blur tw-p-3 tw-rounded-lg">
                            <div className="tw-text-2xl tw-font-bold">#15</div>
                            <div className="tw-text-xs">Peringkat</div>
                          </div>
                        </Col>
                        <Col xs={3}>
                          <div className="tw-bg-white/10 tw-backdrop-blur tw-p-3 tw-rounded-lg">
                            <div className="tw-text-2xl tw-font-bold">685</div>
                            <div className="tw-text-xs">Rata-rata Skor</div>
                          </div>
                        </Col>
                        <Col xs={3}>
                          <div className="tw-bg-white/10 tw-backdrop-blur tw-p-3 tw-rounded-lg">
                            <div className="tw-text-2xl tw-font-bold">85%</div>
                            <div className="tw-text-xs">Persentil</div>
                          </div>
                        </Col>
                        <Col xs={3}>
                          <div className="tw-bg-white/10 tw-backdrop-blur tw-p-3 tw-rounded-lg">
                            <div className="tw-text-2xl tw-font-bold">1,234</div>
                            <div className="tw-text-xs">Total Peserta</div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                    <div className="tw-p-6 tw-bg-gray-50">
                      <Row className="g-4">
                        <Col md={6}>
                          <div className="tw-bg-white tw-p-4 tw-rounded-lg tw-shadow">
                            <div className="tw-flex tw-items-center tw-mb-3">
                              <BarChart3 size={20} className="tw-text-purple-600 tw-mr-2" />
                              <h6 className="tw-font-bold tw-mb-0 tw-text-sm">Performa Mata Pelajaran</h6>
                            </div>
                            <div className="tw-h-48 tw-bg-purple-50 tw-rounded tw-flex tw-items-center tw-justify-center">
                              <Activity size={64} className="tw-text-purple-300" />
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="tw-bg-white tw-p-4 tw-rounded-lg tw-shadow">
                            <div className="tw-flex tw-items-center tw-mb-3">
                              <TrendingUp size={20} className="tw-text-purple-600 tw-mr-2" />
                              <h6 className="tw-font-bold tw-mb-0 tw-text-sm">Perkembangan Mingguan</h6>
                            </div>
                            <div className="tw-h-48 tw-bg-purple-50 tw-rounded tw-flex tw-items-center tw-justify-center">
                              <BarChart3 size={64} className="tw-text-purple-300" />
                            </div>
                          </div>
                        </Col>
                      </Row>
                      <div className="tw-mt-4 tw-bg-gradient-to-r tw-from-indigo-50 tw-to-blue-50 tw-p-4 tw-rounded-lg tw-border-2 tw-border-indigo-200">
                        <div className="tw-flex tw-items-center">
                          <School size={24} className="tw-text-purple-600 tw-mr-3" />
                          <div className="tw-flex-1">
                            <h6 className="tw-font-bold tw-text-gray-800 tw-mb-1 tw-text-sm">Teknik Informatika - ITB</h6>
                            <div className="tw-text-xs tw-text-gray-600">Min. Skor: 650 • ✓ Memenuhi syarat</div>
                          </div>
                          <CheckCircle size={24} className="tw-text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="tw-max-w-sm tw-mx-auto">
                {/* Mobile Frame */}
                <div className="tw-bg-gray-800 tw-rounded-3xl tw-p-3 tw-shadow-2xl">
                  <div className="tw-bg-white tw-rounded-2xl tw-overflow-hidden">
                    {/* Mobile Dashboard Mockup */}
                    <div className="tw-bg-gradient-to-br tw-from-purple-600 tw-to-indigo-700 tw-p-4 tw-text-white">
                      <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                        <div className="tw-flex tw-items-center">
                          <Trophy size={24} className="tw-mr-2" />
                          <h4 className="tw-font-bold tw-mb-0">Dashboard</h4>
                        </div>
                        <Badge bg="light" text="dark" className="tw-px-3 tw-py-1">SNBT</Badge>
                      </div>
                      <Row className="g-2">
                        <Col xs={6}>
                          <div className="tw-bg-white/10 tw-backdrop-blur tw-p-2 tw-rounded-lg tw-text-center">
                            <div className="tw-text-xl tw-font-bold">#15</div>
                            <div className="tw-text-xs">Peringkat</div>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="tw-bg-white/10 tw-backdrop-blur tw-p-2 tw-rounded-lg tw-text-center">
                            <div className="tw-text-xl tw-font-bold">685</div>
                            <div className="tw-text-xs">Skor</div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                    <div className="tw-p-4 tw-bg-gray-50" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                      <div className="tw-bg-white tw-p-3 tw-rounded-lg tw-shadow tw-mb-3">
                        <div className="tw-flex tw-items-center tw-mb-2">
                          <Activity size={16} className="tw-text-purple-600 tw-mr-2" />
                          <div className="tw-text-sm tw-font-bold">Performa Mapel</div>
                        </div>
                        <div className="tw-h-32 tw-bg-purple-50 tw-rounded tw-flex tw-items-center tw-justify-center">
                          <BarChart3 size={48} className="tw-text-purple-300" />
                        </div>
                      </div>
                      <div className="tw-bg-gradient-to-r tw-from-indigo-50 tw-to-blue-50 tw-p-3 tw-rounded-lg tw-border-2 tw-border-indigo-200">
                        <div className="tw-flex tw-items-start tw-gap-2">
                          <School size={20} className="tw-text-purple-600 tw-flex-shrink-0" />
                          <div className="tw-flex-1">
                            <div className="tw-text-sm tw-font-bold tw-text-gray-800">Teknik Informatika - ITB</div>
                            <div className="tw-text-xs tw-text-gray-600">Min: 650 • ✓ Memenuhi</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Feature Highlights */}
          <Row className="tw-mt-12 g-4">
            <Col md={4}>
              <div className="tw-text-center tw-p-4">
                <div className="tw-w-16 tw-h-16 tw-bg-purple-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-3">
                  <BarChart3 size={32} className="tw-text-purple-600" />
                </div>
                <h5 className="tw-font-bold tw-mb-2">Grafik Interaktif</h5>
                <p className="tw-text-gray-600 tw-text-sm">Visualisasi data yang mudah dipahami dengan chart yang responsive</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="tw-text-center tw-p-4">
                <div className="tw-w-16 tw-h-16 tw-bg-purple-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-3">
                  <Target size={32} className="tw-text-purple-600" />
                </div>
                <h5 className="tw-font-bold tw-mb-2">Rekomendasi Personal</h5>
                <p className="tw-text-gray-600 tw-text-sm">Saran program studi berdasarkan performa dan minatmu</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="tw-text-center tw-p-4">
                <div className="tw-w-16 tw-h-16 tw-bg-purple-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-3">
                  <TrendingUp size={32} className="tw-text-purple-600" />
                </div>
                <h5 className="tw-font-bold tw-mb-2">Tracking Progress</h5>
                <p className="tw-text-gray-600 tw-text-sm">Monitor perkembangan belajar secara real-time</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="tw-py-20 tw-bg-gray-50">
        <Container>
          <div className="tw-text-center tw-mb-12">
            <Badge bg="purple" className="tw-mb-4 tw-px-4 tw-py-2 tw-text-sm">
              Testimoni
            </Badge>
            <h2 className="tw-text-4xl tw-font-bold tw-text-gray-800 tw-mb-4">
              Apa Kata Mereka?
            </h2>
            <p className="tw-text-xl tw-text-gray-600">
              Ribuan siswa telah berhasil mencapai target mereka bersama Futuredu
            </p>
          </div>

          <Row className="g-4">
            {testimonials.map((testimonial, idx) => (
              <Col key={idx} md={4}>
                <Card className="h-100 tw-border-0 tw-shadow-lg hover:tw-shadow-xl tw-transition-all">
                  <Card.Body className="tw-p-6">
                    <div className="tw-flex tw-mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={20} className="tw-text-yellow-400 tw-fill-yellow-400" />
                      ))}
                    </div>
                    <p className="tw-text-gray-600 tw-mb-4 tw-italic">"{testimonial.content}"</p>
                    <div className="tw-flex tw-items-center">
                      <div className="tw-w-12 tw-h-12 tw-bg-purple-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-mr-3">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <div className="tw-font-bold tw-text-gray-800">{testimonial.name}</div>
                        <div className="tw-text-sm tw-text-gray-500">{testimonial.role}</div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="tw-py-20 tw-bg-gradient-to-br tw-from-purple-600 tw-to-indigo-700 tw-text-white">
        <Container>
          <div className="tw-text-center tw-max-w-3xl tw-mx-auto">
            <h2 className="tw-text-4xl tw-font-bold tw-mb-4">
              Siap Raih Masa Depan Cemerlang?
            </h2>
            <p className="tw-text-xl tw-mb-8 tw-text-purple-100">
              Bergabunglah dengan ribuan siswa yang telah mencapai impian mereka. 
              Daftar sekarang dan dapatkan akses gratis ke semua fitur!
            </p>
            <div className="tw-flex tw-gap-4 tw-justify-center tw-flex-wrap">
              <Button
                size="lg"
                onClick={() => router.push('/register')}
                className="tw-bg-white tw-text-purple-600 hover:tw-bg-purple-50 tw-border-0 tw-font-bold tw-px-8"
              >
                Daftar Gratis Sekarang
                <Rocket size={20} className="tw-inline tw-ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline-light"
                onClick={() => router.push('/panel')}
                className="tw-font-semibold tw-px-8"
              >
                Lihat Demo Dashboard
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="tw-bg-gray-800 tw-text-gray-300 tw-py-12">
        <Container>
          <Row>
            <Col md={4} className="tw-mb-4 mb-md-0">
              <h5 className="tw-font-bold tw-text-white tw-mb-4 tw-flex tw-items-center">
                <Rocket size={24} className="tw-mr-2 tw-text-purple-400" />
                Futuredu
              </h5>
              <p className="tw-text-sm">
                Platform belajar online terlengkap untuk membantu siswa mencapai impian akademik mereka.
              </p>
            </Col>
            <Col md={4} className="tw-mb-4 mb-md-0">
              <h6 className="tw-font-bold tw-text-white tw-mb-3">Quick Links</h6>
              <ul className="list-unstyled tw-space-y-2">
                <li><a href="#features" className="tw-text-gray-300 hover:tw-text-purple-400 tw-no-underline">Fitur</a></li>
                <li><a href="#dashboard-preview" className="tw-text-gray-300 hover:tw-text-purple-400 tw-no-underline">Dashboard</a></li>
                <li><a href="#testimonials" className="tw-text-gray-300 hover:tw-text-purple-400 tw-no-underline">Testimoni</a></li>
                <li><a href="/login" className="tw-text-gray-300 hover:tw-text-purple-400 tw-no-underline">Login</a></li>
              </ul>
            </Col>
            <Col md={4}>
              <h6 className="tw-font-bold tw-text-white tw-mb-3">Contact</h6>
              <p className="tw-text-sm">Email: info@futuredu.id</p>
              <p className="tw-text-sm">Phone: +62 812-3456-7890</p>
            </Col>
          </Row>
          <hr className="tw-border-gray-700 tw-my-6" />
          <div className="tw-text-center tw-text-sm">
            <p className="tw-mb-0">&copy; 2025 Futuredu. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </>
  );
}
