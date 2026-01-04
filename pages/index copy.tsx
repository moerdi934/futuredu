/* pages/index.tsx */
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Carousel,
} from 'react-bootstrap';
import {
  BookOpen,
  ClipboardList,
  FileCheck,
  PlayCircle,
  MessageSquare,
  Trophy,
  BarChart2,
  Lightbulb,
  Headphones,
  BarChart,
  Users,
} from 'lucide-react';
import NavigationBar from '../components/layout/NavigationBar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  /* ---------- auth (pakai kalau dibutuhkan) ---------- */
  const { isAuthenticated } = useAuth();

  /* ---------- data dummy ---------- */
  const testimonials = [
    {
      name: 'Carissa Vania',
      university: 'Kedokteran – Universitas Padjajaran',
      image:
        'https://photoheads.co.uk/wp-content/uploads/2020/05/headshot-with-client-testimonial.jpg',
      text: 'Belajar sama zenius bikin gue sadar kalo belajar itu ngga susah dan ngga bosenin. Kuncinya ada di cara penyampaian yang asik dan mudah dimengerti.',
    },
    {
      name: 'Nathania Vivian',
      university: 'Hubungan Internasional – Universitas Gadjah Mada',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIJzJUCo-RpJB0V8hJcNhjHSbddEkvk5hZJw&s',
      text: 'Berbagai materi di zenius disampaikan dengan sangat baik dan menyenangkan. Aku jadi lebih paham dan siap menghadapi ujian.',
    },
    {
      name: 'M. Syahman Sahman',
      university:
        'Fakultas Matematika dan IPA – Institut Teknologi Bandung',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiITnt1U2ZN6txckfnjmJxkBws2t7C8mx8fg&s',
      text: 'Dengan zenius, aku bisa belajar di mana saja dan kapan saja. Materinya lengkap dan sangat membantu untuk persiapan ujian.',
    },
  ];

  const benefits = [
    {
      title: 'Pembelajaran Adaptif',
      icon: <BookOpen size={36} className="tw-text-violet-600" />,
      description:
        'Sistem yang menyesuaikan dengan kemampuan dan kecepatan belajar kamu. Futuredu memahami setiap orang punya cara belajar unik!',
    },
    {
      title: 'Simulasi Ujian',
      icon: <ClipboardList size={36} className="tw-text-violet-600" />,
      description:
        'Persiapkan diri dengan simulasi ujian seperti kondisi sebenarnya. Tingkatkan kesiapan mentalmu!',
    },
    {
      title: 'Latihan Soal',
      icon: <FileCheck size={36} className="tw-text-violet-600" />,
      description:
        'Luangkan 10 menit setiap hari untuk latihan soal terarah berbasis micro-learning.',
    },
    {
      title: 'Materi Interaktif',
      icon: <PlayCircle size={36} className="tw-text-violet-600" />,
      description:
        'Belajar seru dengan video interaktif—tidak ada lagi kantuk saat belajar!',
    },
    {
      title: 'Grup Diskusi',
      icon: <MessageSquare size={36} className="tw-text-violet-600" />,
      description:
        'Komunitas pembelajar saling mendukung, diskusi materi & tips belajar.',
    },
    {
      title: 'Papan Peringkat',
      icon: <Trophy size={36} className="tw-text-violet-600" />,
      description:
        'Pantau posisimu & rasakan sensasi kompetisi yang sehat di leaderboard.',
    },
    {
      title: 'Analisis Kemampuan',
      icon: <BarChart2 size={36} className="tw-text-violet-600" />,
      description:
        'Ketahui kekuatan & kelemahanmu lewat analisis data komprehensif.',
    },
    {
      title: 'Rekomendasi Belajar',
      icon: <Lightbulb size={36} className="tw-text-violet-600" />,
      description:
        'Saran materi dipersonalisasi seperti punya mentor pribadi!',
    },
  ];

  const blogs = [
    {
      title: 'Bimbel AZ Guide',
      image: '/images/placeholder.jpg',
      text: 'Kumpulan artikel panduan dan tips belajar...',
      url: '#',
    },
    {
      title: 'Bimbel AZ Insights',
      image: '/images/placeholder.jpg',
      text: 'Artikel Bimbel AZ paling keren...',
      url: '#',
    },
    {
      title: 'Bimbel AZ Info',
      image: '/images/placeholder.jpg',
      text: 'Update program-program Bimbel AZ...',
      url: '#',
    },
  ];

  const slides = [
    {
      title: 'What We Have Done So Far',
      description: '46 000+ video & ratusan artikel mind-blowing.',
      image:
        'https://i0.wp.com/calmatters.org/wp-content/uploads/2020/12/online-learning.jpg?fit=2216%2C1276&ssl=1',
    },
    {
      title:
        'Les Privat & Bimbel untuk Siswa Nasional dan Internasional',
      description:
        'Guru Sinotif membantu tiap siswa secara personal sesuai target belajar.',
      image:
        'https://static.vecteezy.com/system/resources/thumbnails/009/435/567/small_2x/asian-young-woman-school-college-student-wear-headphones-learn-watching-online-webinar-webcast-class-looking-at-laptop-elearning-distance-course-or-calling-teacher-by-webcam-at-home-free-video.jpg',
    },
    {
      title: 'Welcome back to Bimbel AZ!',
      features: [
        'Video & latihan soal lengkap',
        'Belajar pakai konsep sampai paham',
        'Try-out serupa ujian asli',
        'Bisa di-PC & mobile',
      ],
      image:
        'https://burst.shopifycdn.com/photos/grad-students-throwing-hats-in-the-air.jpg?width=1000&format=pjpg&exif=0&iptc=0',
    },
    {
      title:
        'Persiapan Khusus Ujian PTN, Kedinasan & Olimpiade',
      features: [
        'Materi terstruktur & latihan intensif',
        'Tutor berpengalaman',
        'Simulasi ujian mendalam',
      ],
      image:
        'https://www.dicsinnovatives.com/blog/wp-content/uploads/2024/05/computer-training-institute-delhi.jpg',
    },
  ];

  /* ---------- local state ---------- */
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMore, setShowMore] = useState<boolean[]>(
    testimonials.map(() => false)
  );

  const toggleShowMore = (idx: number) =>
    setShowMore((prev) =>
      prev.map((v, i) => (i === idx ? !v : v))
    );

  /* ---------- render ---------- */
  return (
    <>
      <Head>
        <title>Futuredu – Bimbingan Belajar Online</title>
        <meta
          name="description"
          content="Platform bimbingan belajar online terbaik"
        />
      </Head>

      <div className="tw-min-h-screen" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <NavigationBar />

        {/* Animated Background Effects */}
        <div className="tw-fixed tw-inset-0 tw-pointer-events-none tw-z-0">
          <div className="tw-absolute tw-top-20 tw-right-20 tw-w-32 tw-h-32 tw-bg-yellow-300/20 tw-rounded-full tw-blur-3xl tw-animate-pulse"></div>
          <div className="tw-absolute tw-bottom-32 tw-left-20 tw-w-40 tw-h-40 tw-bg-pink-300/20 tw-rounded-full tw-blur-3xl tw-animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="tw-absolute tw-top-1/2 tw-left-1/3 tw-w-24 tw-h-24 tw-bg-blue-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>

        <div className="tw-relative tw-z-10">
          {/* ---------- HERO / CAROUSEL ---------- */}
          <div className="tw-overflow-hidden">
            <Carousel
              activeIndex={currentSlide}
              onSelect={(idx) => setCurrentSlide(idx)}
              interval={5000}
              fade
              indicators
              controls
              className="tw-shadow-2xl"
            >
              {slides.map((slide, idx) => (
                <Carousel.Item key={idx}>
                  <div
                    className="tw-h-[60vh] md:tw-h-[70vh] tw-bg-cover tw-bg-center tw-relative"
                    style={{
                      backgroundImage: `url(${slide.image})`,
                      boxShadow:
                        'inset 0 0 0 2000px rgba(69,39,160,0.6)',
                    }}
                  >
                    <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center">
                      <div className="tw-bg-purple-900/90 tw-p-8 tw-rounded-2xl tw-backdrop-blur-md tw-shadow-2xl tw-max-w-2xl tw-mx-4 tw-text-center tw-border tw-border-purple-400/30">
                        <h3 className="tw-text-2xl md:tw-text-4xl tw-font-bold tw-text-white tw-mb-4">
                          {slide.title}
                        </h3>

                        {slide.description && (
                          <p className="tw-text-lg md:tw-text-xl tw-text-purple-100">
                            {slide.description}
                          </p>
                        )}

                        {slide.features && (
                          <ul className="tw-text-left tw-text-purple-100 tw-text-md md:tw-text-lg tw-my-4 tw-space-y-2">
                            {slide.features.map((f, i) => (
                              <li
                                key={i}
                                className="tw-flex tw-items-center"
                              >
                                <span className="tw-mr-2 tw-text-purple-300">
                                  ✓
                                </span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        )}

                        {idx === 1 && (
                          <Button className="tw-bg-gradient-to-r tw-from-violet-600 tw-to-purple-600 hover:tw-from-violet-500 hover:tw-to-purple-500 tw-border-0 tw-rounded-full tw-font-bold tw-shadow-lg hover:tw-shadow-xl tw-px-8 tw-py-3 tw-transition-all">
                            DAPATKAN 1 x Belajar GRATIS!
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>

          {/* ---------- TESTIMONIALS ---------- */}
          <Container className="tw-my-16 tw-py-8">
            <h2 className="tw-text-center tw-text-3xl md:tw-text-4xl tw-font-bold tw-text-white tw-mb-12 tw-drop-shadow-lg">
              Apa Kata Mereka?
            </h2>
            <Row className="tw-g-4">
              {testimonials.map((t, idx) => (
                <Col lg={4} md={6} sm={12} key={idx}>
                  <Card className="tw-border-0 tw-rounded-2xl tw-shadow-2xl hover:tw-shadow-3xl hover:tw-scale-105 tw-transition-all tw-duration-300 tw-h-full tw-bg-white/95 tw-backdrop-blur-sm">
                    <Card.Body className="tw-bg-gradient-to-br tw-from-purple-50/80 tw-to-white/80 tw-p-6 tw-rounded-2xl">
                      <div className="tw-flex tw-flex-col tw-items-center tw-mb-4">
                        <div className="tw-w-24 tw-h-24 tw-rounded-full tw-overflow-hidden tw-border-4 tw-border-violet-600 tw-shadow-lg">
                          <Image
                            src={t.image}
                            alt={t.name}
                            width={96}
                            height={96}
                            className="tw-object-cover"
                          />
                        </div>
                        <Card.Title className="tw-text-xl tw-font-bold tw-text-purple-900 tw-mt-3">
                          {t.name}
                        </Card.Title>
                        <Card.Subtitle className="tw-text-sm tw-text-purple-700 tw-text-center">
                          {t.university}
                        </Card.Subtitle>
                      </div>

                      <div className="tw-bg-white tw-p-4 tw-rounded-xl tw-shadow-inner tw-relative">
                        <span className="tw-absolute tw-text-violet-400 tw-text-5xl tw-opacity-20 tw-top-0 tw-left-2">
                          "
                        </span>
                        <p className="tw-text-gray-700 tw-relative tw-z-10 tw-pt-3">
                          {showMore[idx]
                            ? t.text
                            : `${t.text.substring(0, 80)}...`}
                        </p>
                        <span className="tw-absolute tw-text-violet-400 tw-text-5xl tw-opacity-20 tw-bottom-0 tw-right-2">
                          "
                        </span>
                      </div>

                      <Button
                        variant="link"
                        className="tw-text-violet-600 hover:tw-text-purple-700 tw-pt-2 tw-font-semibold"
                        onClick={() => toggleShowMore(idx)}
                      >
                        {showMore[idx] ? 'Show Less' : 'Show More'}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <div className="tw-text-center tw-mt-8">
              <Button className="tw-bg-gradient-to-r tw-from-violet-600 tw-to-purple-600 tw-border-0 tw-rounded-full tw-shadow-xl hover:tw-shadow-2xl hover:tw-scale-105 tw-transition-all tw-px-8 tw-py-3 tw-font-bold tw-text-white">
                Cek Kata Siswa Lain Yuk
              </Button>
            </div>
          </Container>

          {/* ---------- BENEFITS ---------- */}
          <Container fluid className="tw-py-16 tw-bg-white/5 tw-backdrop-blur-sm">
            <Container>
              <h2 className="tw-text-center tw-text-3xl md:tw-text-4xl tw-font-bold tw-mb-3 tw-text-white tw-drop-shadow-lg">
                Keunggulan Futuredu
              </h2>
              <p className="tw-text-center tw-text-lg tw-text-purple-100 tw-mb-12 tw-drop-shadow">
                Platform bimbingan belajar online terbaik untuk meraih
                kesuksesan akademismu
              </p>

              <Row className="tw-g-4">
                {benefits.map((b, idx) => (
                  <Col xs={6} md={6} lg={3} key={idx}>
                    <Card className="tw-border-0 tw-rounded-2xl tw-shadow-2xl hover:tw-shadow-3xl hover:tw-translate-y-[-8px] tw-transition-all tw-duration-300 tw-h-full tw-bg-white/95 tw-backdrop-blur-sm">
                      <Card.Body className="tw-p-6">
                        <div className="tw-flex tw-justify-center tw-mb-4">
                          <div className="tw-bg-gradient-to-br tw-from-violet-100 tw-to-purple-100 tw-rounded-full tw-p-4 tw-shadow-lg">
                            {b.icon}
                          </div>
                        </div>
                        <Card.Title className="tw-text-center tw-text-xl tw-font-bold tw-text-purple-900">
                          {b.title}
                        </Card.Title>
                        <Card.Text className="tw-text-center tw-text-gray-600 tw-mt-3">
                          {b.description}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <div className="tw-text-center tw-mt-12">
                <Button className="tw-bg-gradient-to-r tw-from-purple-700 tw-to-violet-700 tw-rounded-full tw-shadow-xl hover:tw-shadow-2xl hover:tw-scale-105 tw-transition-all tw-font-bold tw-px-10 tw-py-3 tw-text-white tw-border-0">
                  Daftar Sekarang
                </Button>
              </div>
            </Container>
          </Container>

          {/* ---------- VIDEOS ---------- */}
          <Container className="tw-my-16 tw-py-8">
            <h2 className="tw-text-center tw-text-3xl md:tw-text-4xl tw-font-bold tw-text-white tw-mb-10 tw-drop-shadow-lg">
              Contoh Video Pembelajaran Bimbel AZ
            </h2>
            <Row>
              {['Biologi SMA – Sistem Peredaran Darah', 'Ekonomi SMA – Pasar Modal', 'Matematika SMA – Integral'].map(
                (title, idx) => (
                  <Col md={4} key={idx} className="tw-mb-4">
                    <div className="tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden tw-bg-white/95 tw-backdrop-blur-sm hover:tw-scale-105 tw-transition-all tw-duration-300">
                      <iframe
                        width="100%"
                        height="200"
                        src={`https://www.youtube.com/embed/samplevideo${
                          idx + 1
                        }`}
                        title={title}
                        className="tw-border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                      <div className="tw-bg-white tw-p-4">
                        <h5 className="tw-font-semibold tw-text-purple-800">
                          {title}
                        </h5>
                      </div>
                    </div>
                  </Col>
                )
              )}
            </Row>
          </Container>

          {/* ---------- BLOG ---------- */}
          <Container className="tw-my-16 tw-bg-white/5 tw-backdrop-blur-sm tw-py-12 tw-rounded-3xl tw-shadow-2xl">
            <h2 className="tw-text-center tw-text-3xl md:tw-text-4xl tw-font-bold tw-text-white tw-mb-10 tw-drop-shadow-lg">
              AZ Blog
            </h2>
            <Row className="tw-g-4">
              {blogs.map((blog, idx) => (
                <Col md={4} key={idx}>
                  <Card className="tw-border-0 tw-rounded-2xl tw-shadow-2xl hover:tw-shadow-3xl hover:tw-translate-y-[-8px] tw-transition-all tw-duration-300 tw-h-full tw-bg-white/95 tw-backdrop-blur-sm">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      width={400}
                      height={200}
                      className="tw-w-full tw-h-48 tw-object-cover tw-rounded-t-2xl"
                    />
                    <Card.Body className="tw-p-5">
                      <Card.Title className="tw-font-bold tw-text-xl tw-text-purple-900">
                        {blog.title}
                      </Card.Title>
                      <Card.Text className="tw-text-gray-700 tw-my-3">
                        {blog.text.length > 100
                          ? `${blog.text.substring(0, 100)}...`
                          : blog.text}
                      </Card.Text>
                      <Link
                        href={blog.url}
                        className="tw-text-violet-600 hover:tw-text-purple-700 tw-font-semibold"
                      >
                        Show More
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>

          {/* ---------- DAFTAR ---------- */}
          <Container className="tw-my-16">
            <Row className="tw-items-center tw-justify-center tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-3xl tw-shadow-2xl tw-p-8">
              <Col md={6} className="tw-text-center md:tw-text-left tw-mb-6 md:tw-mb-0">
                <h2 className="tw-text-3xl md:tw-text-4xl tw-font-bold tw-text-white tw-mb-4 tw-drop-shadow-lg">
                  Yuk, Pilih Paket Belajarmu Sekarang!
                </h2>
                <p className="tw-text-lg tw-text-purple-100 tw-mb-6 tw-drop-shadow">
                  Daftar & rasakan pengalaman belajar seru bersama Super Teacher
                  Privat Al Faiz.
                </p>
                <Link
                  href="/products"
                  className="tw-inline-block tw-bg-gradient-to-r tw-from-violet-600 tw-to-purple-600 tw-rounded-full tw-shadow-xl tw-text-white tw-font-bold tw-px-8 tw-py-3 hover:tw-from-violet-500 hover:tw-to-purple-500 hover:tw-scale-105 tw-transition-all"
                >
                  Pilih Paket Belajar
                </Link>
              </Col>
              <Col md={6}>
                <Image
                  src="https://img.freepik.com/free-vector/online-tutorials-concept_52683-37480.jpg"
                  alt="Super Teacher"
                  width={500}
                  height={300}
                  className="tw-rounded-2xl tw-shadow-2xl tw-w-full"
                />
              </Col>
            </Row>
          </Container>

          {/* ---------- HELP ---------- */}
          <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-py-16 tw-mb-0" id="bantuan">
            <Container fluid className="tw-max-w-7xl tw-mx-auto">
              <Row className="tw-text-center tw-mb-12">
                <Col>
                  <h2 className="tw-text-3xl md:tw-text-4xl tw-font-bold tw-text-white tw-drop-shadow-lg">
                    Ada yang Perlu Dibantu?
                  </h2>
                  <p className="tw-text-lg tw-text-purple-100 tw-mt-3 tw-drop-shadow">
                    Jangan ragu menghubungi kami kapan pun kamu butuh bantuan
                  </p>
                </Col>
              </Row>

              <Row className="tw-flex tw-flex-wrap tw-justify-center tw-g-6">
                {[
                  {
                    title: 'Bantuan Teknis',
                    icon: <Headphones className="tw-h-10 tw-w-10 tw-text-violet-600" />,
                    desc: 'Kendala teknis? Tim kami siap membantu.',
                    btn: 'Chat Support',
                    link: 'https://wa.me/6281234567890?text=Halo,%20saya%20butuh%20bantuan%20teknis',
                  },
                  {
                    title: 'Konsultasi Belajar',
                    icon: <BarChart className="tw-h-10 tw-w-10 tw-text-violet-600" />,
                    desc: 'Strategi belajar efektif? Konsultasi gratis.',
                    btn: 'Konsultasi Sekarang',
                    link: 'https://wa.me/6281234567891?text=Halo,%20saya%20ingin%20konsultasi%20belajar',
                  },
                  {
                    title: 'Info Program',
                    icon: <Users className="tw-h-10 tw-w-10 tw-text-violet-600" />,
                    desc: 'Penasaran dengan program kami? Tanya sekarang.',
                    btn: 'Tanya Info',
                    link: 'https://wa.me/6281234567892?text=Halo,%20saya%20ingin%20informasi%20program',
                  },
                ].map((item, idx) => (
                  <Col xs={12} lg={4} key={idx} className="tw-px-3 tw-mb-6 tw-flex">
                    <div className="tw-bg-white/95 tw-backdrop-blur-sm tw-rounded-2xl tw-shadow-2xl tw-p-6 tw-flex tw-flex-col tw-w-full hover:tw-scale-105 tw-transition-transform tw-duration-300">
                      <div className="tw-flex tw-justify-center tw-mb-4">
                        <div className="tw-bg-gradient-to-br tw-from-violet-100 tw-to-purple-100 tw-rounded-full tw-p-3 tw-shadow-lg">
                          {item.icon}
                        </div>
                      </div>
                      <h3 className="tw-text-xl tw-font-semibold tw-text-center tw-text-purple-900 tw-mb-3">
                        {item.title}
                      </h3>
                      <p className="tw-text-gray-600 tw-text-center tw-mb-5">
                        {item.desc}
                      </p>
                      <div className="tw-mt-auto tw-text-center">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tw-bg-gradient-to-r tw-from-violet-600 tw-to-purple-600 tw-rounded-full tw-shadow-lg tw-text-white tw-font-medium tw-px-5 tw-py-2 hover:tw-from-violet-500 hover:tw-to-purple-500 hover:tw-scale-105 tw-transition-all"
                        >
                          {item.btn}
                        </a>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              <Row className="tw-mt-8">
                <Col className="tw-text-center">
                  <p className="tw-text-purple-100 tw-drop-shadow">
                    Kontak email:{' '}
                    <span className="tw-text-white tw-font-semibold">
                      bantuan@bimbelprep.com
                    </span>
                  </p>
                </Col>
              </Row>
            </Container>
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default Home;