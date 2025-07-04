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
      icon: <BookOpen size={36} className="tw-text-purple-800" />,
      description:
        'Sistem yang menyesuaikan dengan kemampuan dan kecepatan belajar kamu. Futuredu memahami setiap orang punya cara belajar unik!',
    },
    {
      title: 'Simulasi Ujian',
      icon: <ClipboardList size={36} className="tw-text-purple-800" />,
      description:
        'Persiapkan diri dengan simulasi ujian seperti kondisi sebenarnya. Tingkatkan kesiapan mentalmu!',
    },
    {
      title: 'Latihan Soal',
      icon: <FileCheck size={36} className="tw-text-purple-800" />,
      description:
        'Luangkan 10 menit setiap hari untuk latihan soal terarah berbasis micro-learning.',
    },
    {
      title: 'Materi Interaktif',
      icon: <PlayCircle size={36} className="tw-text-purple-800" />,
      description:
        'Belajar seru dengan video interaktif—tidak ada lagi kantuk saat belajar!',
    },
    {
      title: 'Grup Diskusi',
      icon: <MessageSquare size={36} className="tw-text-purple-800" />,
      description:
        'Komunitas pembelajar saling mendukung, diskusi materi & tips belajar.',
    },
    {
      title: 'Papan Peringkat',
      icon: <Trophy size={36} className="tw-text-purple-800" />,
      description:
        'Pantau posisimu & rasakan sensasi kompetisi yang sehat di leaderboard.',
    },
    {
      title: 'Analisis Kemampuan',
      icon: <BarChart2 size={36} className="tw-text-purple-800" />,
      description:
        'Ketahui kekuatan & kelemahanmu lewat analisis data komprehensif.',
    },
    {
      title: 'Rekomendasi Belajar',
      icon: <Lightbulb size={36} className="tw-text-purple-800" />,
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

      <NavigationBar />

      {/* ---------- HERO / CAROUSEL ---------- */}
      <div className="tw-bg-gradient-to-r tw-from-purple-900 tw-to-purple-800 tw-overflow-hidden">
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
                    'inset 0 0 0 2000px rgba(69,39,160,0.5)',
                }}
              >
                <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center">
                  <div className="tw-bg-purple-900/80 tw-p-6 tw-rounded-lg tw-backdrop-blur-sm tw-shadow-lg tw-max-w-2xl tw-mx-auto tw-text-center">
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
                      <Button className="tw-bg-purple-600 hover:tw-bg-purple-500 tw-border-0 tw-rounded-full tw-font-bold tw-shadow-lg hover:tw-shadow-xl">
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
      <Container className="tw-my-10 tw-py-4">
        <h2 className="tw-text-center tw-text-3xl tw-font-bold tw-text-purple-900 tw-mb-8">
          Apa Kata Mereka?
        </h2>
        <Row className="tw-g-4">
          {testimonials.map((t, idx) => (
            <Col lg={4} md={6} sm={12} key={idx}>
              <Card className="tw-border-0 tw-rounded-xl tw-shadow-lg hover:tw-shadow-xl hover:tw-scale-105 tw-transition-all tw-duration-300 tw-h-full">
                <Card.Body className="tw-bg-gradient-to-br tw-from-purple-50 tw-to-white tw-p-5">
                  <div className="tw-flex tw-flex-col tw-items-center tw-mb-4">
                    <div className="tw-w-24 tw-h-24 tw-rounded-full tw-overflow-hidden tw-border-4 tw-border-purple-700 tw-shadow-md">
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
                    <Card.Subtitle className="tw-text-sm tw-text-purple-700">
                      {t.university}
                    </Card.Subtitle>
                  </div>

                  <div className="tw-bg-white tw-p-4 tw-rounded-lg tw-shadow-inner tw-relative">
                    <span className="tw-absolute tw-text-purple-400 tw-text-5xl tw-opacity-20 tw-top-0 tw-left-2">
                      "
                    </span>
                    <p className="tw-text-gray-700 tw-relative tw-z-10 tw-pt-3">
                      {showMore[idx]
                        ? t.text
                        : `${t.text.substring(0, 80)}...`}
                    </p>
                    <span className="tw-absolute tw-text-purple-400 tw-text-5xl tw-opacity-20 tw-bottom-0 tw-right-2">
                      "
                    </span>
                  </div>

                  <Button
                    variant="link"
                    className="tw-text-purple-700 hover:tw-text-purple-900 tw-pt-2"
                    onClick={() => toggleShowMore(idx)}
                  >
                    {showMore[idx] ? 'Show Less' : 'Show More'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="tw-text-center tw-mt-6">
          <Button className="tw-bg-purple-800 tw-border-0 tw-rounded-full tw-shadow-md hover:tw-bg-purple-900 hover:tw-shadow-lg">
            Cek Kata Siswa Lain Yuk
          </Button>
        </div>
      </Container>

      {/* ---------- BENEFITS ---------- */}
      <Container
        fluid
        className="tw-bg-gradient-to-b tw-from-white tw-to-purple-50 tw-py-14"
      >
        <Container>
          <h2 className="tw-text-center tw-text-3xl md:tw-text-4xl tw-font-bold tw-mb-2 tw-text-purple-900">
            Keunggulan Futuredu
          </h2>
          <p className="tw-text-center tw-text-lg tw-text-purple-700 tw-mb-8">
            Platform bimbingan belajar online terbaik untuk meraih
            kesuksesan akademismu
          </p>

          <Row className="tw-g-4">
            {benefits.map((b, idx) => (
              <Col xs={6} md={6} lg={3} key={idx}>
                <Card className="tw-border-0 tw-rounded-xl tw-shadow-lg hover:tw-shadow-xl hover:tw-translate-y-[-5px] tw-transition-all tw-duration-300 tw-h-full">
                  <Card.Body className="tw-p-6">
                    <div className="tw-flex tw-justify-center tw-mb-4">
                      <div className="tw-bg-purple-100 tw-rounded-full tw-p-4">
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

          <div className="tw-text-center tw-mt-10">
            <Button className="tw-bg-purple-900 tw-rounded-full tw-shadow-lg hover:tw-bg-purple-800 hover:tw-shadow-xl tw-font-bold tw-px-8 tw-py-3">
              Daftar Sekarang
            </Button>
          </div>
        </Container>
      </Container>

      {/* ---------- VIDEOS ---------- */}
      <Container className="tw-my-10">
        <h2 className="tw-text-center tw-text-3xl tw-font-bold tw-text-purple-900 tw-mb-6">
          Contoh Video Pembelajaran Bimbel AZ
        </h2>
        <Row>
          {['Biologi SMA – Sistem Peredaran Darah', 'Ekonomi SMA – Pasar Modal', 'Matematika SMA – Integral'].map(
            (title, idx) => (
              <Col md={4} key={idx} className="tw-mb-4">
                <div className="tw-rounded-lg tw-shadow-lg tw-overflow-hidden">
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
                  <div className="tw-bg-white tw-p-3">
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
      <Container className="tw-my-10 tw-bg-gray-50 tw-py-10 tw-rounded-xl">
        <h2 className="tw-text-center tw-text-3xl tw-font-bold tw-text-purple-900 tw-mb-6">
          AZ Blog
        </h2>
        <Row className="tw-g-4">
          {blogs.map((blog, idx) => (
            <Col md={4} key={idx}>
              <Card className="tw-border-0 tw-rounded-xl tw-shadow-lg hover:tw-shadow-xl hover:tw-translate-y-[-5px] tw-transition-all tw-duration-300 tw-h-full">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  width={400}
                  height={200}
                  className="tw-w-full tw-h-48 tw-object-cover"
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
                    className="tw-text-purple-700 hover:tw-text-purple-900"
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
      <Container className="tw-my-10">
        <Row className="tw-items-center tw-justify-center">
          <Col md={6} className="tw-text-center md:tw-text-left tw-mb-6 md:tw-mb-0">
            <h2 className="tw-text-3xl tw-font-bold tw-text-purple-900 tw-mb-3">
              Yuk, Pilih Paket Belajarmu Sekarang!
            </h2>
            <p className="tw-text-lg tw-text-gray-700 tw-mb-4">
              Daftar & rasakan pengalaman belajar seru bersama Super Teacher
              Privat Al Faiz.
            </p>
            <Link
              href="/products"
              className="tw-inline-block tw-bg-purple-700 tw-rounded-full tw-shadow-md tw-text-white tw-font-bold tw-px-6 tw-py-2 hover:tw-bg-purple-800"
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
              className="tw-rounded-lg tw-shadow-lg tw-w-full"
            />
          </Col>
        </Row>
      </Container>

      {/* ---------- HELP ---------- */}
      <div className="tw-bg-gray-50 tw-py-16" id="bantuan">
        <Container fluid className="tw-max-w-7xl tw-mx-auto">
          <Row className="tw-text-center tw-mb-12">
            <Col>
              <h2 className="tw-text-3xl tw-font-bold tw-text-purple-900">
                Ada yang Perlu Dibantu?
              </h2>
              <p className="tw-text-lg tw-text-gray-600 tw-mt-3">
                Jangan ragu menghubungi kami kapan pun kamu butuh bantuan
              </p>
            </Col>
          </Row>

          <Row className="tw-flex tw-flex-wrap tw-justify-center tw-g-6">
            {[
              {
                title: 'Bantuan Teknis',
                icon: <Headphones className="tw-h-10 tw-w-10 tw-text-purple-800" />,
                desc: 'Kendala teknis? Tim kami siap membantu.',
                btn: 'Chat Support',
                link: 'https://wa.me/6281234567890?text=Halo,%20saya%20butuh%20bantuan%20teknis',
              },
              {
                title: 'Konsultasi Belajar',
                icon: <BarChart className="tw-h-10 tw-w-10 tw-text-purple-800" />,
                desc: 'Strategi belajar efektif? Konsultasi gratis.',
                btn: 'Konsultasi Sekarang',
                link: 'https://wa.me/6281234567891?text=Halo,%20saya%20ingin%20konsultasi%20belajar',
              },
              {
                title: 'Info Program',
                icon: <Users className="tw-h-10 tw-w-10 tw-text-purple-800" />,
                desc: 'Penasaran dengan program kami? Tanya sekarang.',
                btn: 'Tanya Info',
                link: 'https://wa.me/6281234567892?text=Halo,%20saya%20ingin%20informasi%20program',
              },
            ].map((item, idx) => (
              <Col xs={12} lg={4} key={idx} className="tw-px-3 tw-mb-6 tw-flex">
                <div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-p-6 tw-flex tw-flex-col tw-w-full hover:tw-scale-105 tw-transition-transform tw-duration-300">
                  <div className="tw-flex tw-justify-center tw-mb-4">
                    <div className="tw-bg-purple-100 tw-rounded-full tw-p-3">
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
                      className="tw-bg-purple-700 tw-rounded-full tw-shadow-md tw-text-white tw-font-medium tw-px-5 tw-py-2 hover:tw-bg-purple-800"
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
              <p className="tw-text-gray-500">
                Kontak email:{' '}
                <span className="tw-text-purple-700 tw-font-medium">
                  bantuan@bimbelprep.com
                </span>
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      <Footer />
    </>
  );
};

export default Home;
