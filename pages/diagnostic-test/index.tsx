// pages/diagnostic-test.tsx
import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import {
  Brain, Eye, BookOpen, Lightbulb, Search, Zap, Clock, Target, Puzzle, Trophy,
  Star, Play, ChevronRight, Quote
} from 'lucide-react';
import DiagnosticTestModal from './DiagnosticTestModal';

interface DiagnosticTest {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  questions: number;
  color: string;
}

interface QuoteType {
  text: string;
  author: string;
}

interface DiagnosticTestPageProps {
  initialQuote: QuoteType;
}

const DiagnosticTestPage: React.FC<DiagnosticTestPageProps> = ({ initialQuote }) => {
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [currentQuote, setCurrentQuote] = useState<QuoteType>(initialQuote);
  const [showQuantModal, setShowQuantModal] = useState(false);

  const inspirationalQuotes: QuoteType[] = [
    {
      text: "Penilaian adalah jembatan antara mengajar dan belajar, mengungkap kapasitas sejati pikiran manusia.",
      author: "Alfred Binet"
    },
    {
      text: "Kecerdasan sejati terletak pada kemampuan beradaptasi dengan perubahan.",
      author: "Stephen Hawking"
    },
    {
      text: "Tes bukan tentang mencari keterbatasan, tetapi menemukan pola unik kekuatan kognitif dalam setiap individu.",
      author: "Howard Gardner"
    },
    {
      text: "Pikiran yang teruji adalah seperti pedang yang diasah - semakin tajam dengan setiap tantangan.",
      author: "Marie Curie"
    },
    {
      text: "Setiap tes mengungkap bukan hanya kinerja, tetapi kompleksitas indah pemrosesan kognitif manusia.",
      author: "Lev Vygotsky"
    },
    {
      text: "Analisis data terbaik dimulai dengan pertanyaan yang tepat, bukan jawaban yang diharapkan.",
      author: "John Tukey"
    },
    {
      text: "Pengujian membuka jendela ke dalam arsitektur pikiran dan mengungkap potensi yang belum tergali.",
      author: "Arthur Jensen"
    },
    {
      text: "Kreativitas adalah kecerdasan yang bersenang-senang dalam proses penemuan.",
      author: "Albert Einstein"
    },
    {
      text: "Nilai sejati tes diagnostik terletak pada kemampuannya memetakan keragaman kognitif manusia.",
      author: "John Carroll"
    },
    {
      text: "Logika akan membawamu dari A ke B. Imajinasi akan membawamu ke mana saja.",
      author: "Albert Einstein"
    },
    {
      text: "Setiap tes diagnostik adalah kesempatan untuk menemukan tanda tangan kognitif unik yang mendefinisikan setiap individu.",
      author: "Douglas Hofstadter"
    },
    {
      text: "Pembelajaran tidak pernah berhenti. Bahkan di usia 90, kamu masih bisa belajar sesuatu yang baru setiap hari.",
      author: "B.F. Skinner"
    },
    {
      text: "Pengujian kognitif adalah metode ilmiah yang diterapkan untuk memahami misteri kecerdasan manusia.",
      author: "Claude Shannon"
    },
    {
      text: "Kesuksesan bukanlah kunci kebahagiaan. Kebahagiaan adalah kunci kesuksesan dalam menghadapi tes kehidupan.",
      author: "Abraham Maslow"
    },
    {
      text: "Pengujian menerangi jalur antara potensi dan kinerja, menjembatani apa yang bisa kita capai.",
      author: "Carol Dweck"
    }
  ];

  const diagnosticTests: DiagnosticTest[] = [
    {
      id: 99,
      title: "Quantitative Reasoning",
      description: "Uji kemampuan matematika dan logika numerik untuk menyelesaikan masalah kompleks",
      icon: <Target className="tw-w-6 tw-h-6" />,
      duration: "45 menit",
      questions: 30,
      color: "violet"
    },
    {
      id: 2,
      title: "Visual-Spatial Reasoning",
      description: "Evaluasi kemampuan memahami dan memanipulasi objek dalam ruang dimensional",
      icon: <Eye className="tw-w-6 tw-h-6" />,
      duration: "35 menit",
      questions: 25,
      color: "purple"
    },
    {
      id: 3,
      title: "Verbal Literacy",
      description: "Tes pemahaman bahasa, kosakata, dan kemampuan komunikasi tertulis",
      icon: <BookOpen className="tw-w-6 tw-h-6" />,
      duration: "40 menit",
      questions: 35,
      color: "indigo"
    },
    {
      id: 4,
      title: "Fluid Reasoning (Abstract)",
      description: "Ukur kemampuan berpikir abstrak dan memecahkan masalah baru tanpa pengetahuan sebelumnya",
      icon: <Lightbulb className="tw-w-6 tw-h-6" />,
      duration: "50 menit",
      questions: 28,
      color: "pink"
    },
    {
      id: 5,
      title: "Logical Deductive Reasoning",
      description: "Evaluasi kemampuan menarik kesimpulan logis dari premis yang diberikan",
      icon: <Search className="tw-w-6 tw-h-6" />,
      duration: "45 menit",
      questions: 32,
      color: "violet"
    },
    {
      id: 6,
      title: "Working Memory",
      description: "Tes kapasitas memori kerja dalam menyimpan dan memproses informasi sementara",
      icon: <Brain className="tw-w-6 tw-h-6" />,
      duration: "30 menit",
      questions: 20,
      color: "purple"
    },
    {
      id: 7,
      title: "Processing Speed",
      description: "Ukur kecepatan pemrosesan informasi dan respons terhadap tugas sederhana",
      icon: <Zap className="tw-w-6 tw-h-6" />,
      duration: "25 menit",
      questions: 40,
      color: "indigo"
    },
    {
      id: 8,
      title: "Attention & Executive Control",
      description: "Evaluasi kemampuan fokus, kontrol diri, dan manajemen tugas kognitif",
      icon: <Clock className="tw-w-6 tw-h-6" />,
      duration: "35 menit",
      questions: 24,
      color: "pink"
    },
    {
      id: 9,
      title: "Problem Solving / Creative Thinking",
      description: "Tes kemampuan berpikir kreatif dan inovatif dalam memecahkan masalah kompleks",
      icon: <Puzzle className="tw-w-6 tw-h-6" />,
      duration: "55 menit",
      questions: 22,
      color: "violet"
    },
    {
      id: 10,
      title: "Crystallized Knowledge",
      description: "Evaluasi pengetahuan yang telah dipelajari dan pengalaman akademis terkumpul",
      icon: <Trophy className="tw-w-6 tw-h-6" />,
      duration: "60 menit",
      questions: 45,
      color: "purple"
    }
  ];

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'from' | 'to') => {
    const colorMap = {
      violet: {
        bg: 'tw-bg-violet-500',
        text: 'tw-text-violet-600',
        border: 'tw-border-violet-400',
        from: 'tw-from-violet-500',
        to: 'tw-to-violet-600'
      },
      purple: {
        bg: 'tw-bg-purple-500',
        text: 'tw-text-purple-600',
        border: 'tw-border-purple-400',
        from: 'tw-from-purple-500',
        to: 'tw-to-purple-600'
      },
      indigo: {
        bg: 'tw-bg-indigo-500',
        text: 'tw-text-indigo-600',
        border: 'tw-border-indigo-400',
        from: 'tw-from-indigo-500',
        to: 'tw-to-indigo-600'
      },
      pink: {
        bg: 'tw-bg-pink-500',
        text: 'tw-text-pink-600',
        border: 'tw-border-pink-400',
        from: 'tw-from-pink-500',
        to: 'tw-to-pink-600'
      }
    };
    return colorMap[color as keyof typeof colorMap][type];
  };

  const handleStartTest = (testId: number) => {
    if (testId === 99) {
      setShowQuantModal(true);
      return;
    }
    setSelectedTest(testId);
    console.log(`Starting diagnostic test ${testId}`);
  };

  return (
    <>
      <Head>
        <title>Diagnostic Test - Platform Pembelajaran</title>
        <meta name="description" content="Temukan potensi kognitif terbaikmu melalui serangkaian tes diagnostik yang komprehensif dan terstruktur" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="tw-min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="tw-relative tw-overflow-hidden tw-pb-12">
          <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-violet-600/20 tw-to-purple-800/20"></div>
          <div className="tw-absolute tw-top-10 tw-right-10 tw-w-20 tw-h-20 tw-bg-yellow-300/30 tw-rounded-full tw-blur-xl tw-animate-pulse"></div>
          <div className="tw-absolute tw-bottom-10 tw-left-10 tw-w-32 tw-h-32 tw-bg-pink-300/20 tw-rounded-full tw-blur-2xl tw-animate-pulse tw-delay-1000"></div>
          <div className="tw-absolute tw-top-1/2 tw-left-1/2 tw-w-16 tw-h-16 tw-bg-blue-300/20 tw-rounded-full tw-blur-lg tw-animate-pulse tw-delay-500"></div>

          <div className="tw-container tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-py-12 tw-relative tw-z-10">
            <div className="tw-text-center tw-mb-12">
              <div className="tw-mb-8">
                <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-20 tw-h-20 tw-bg-white/20 tw-backdrop-blur-sm tw-rounded-full tw-mb-6 tw-shadow-lg">
                  <Brain className="tw-w-10 tw-h-10 tw-text-yellow-300" />
                </div>
                <h1 className="tw-text-4xl md:tw-text-5xl lg:tw-text-6xl tw-font-bold tw-text-white tw-mb-4 tw-drop-shadow-lg">
                  Diagnostic Test
                </h1>
                <p className="tw-text-lg md:tw-text-xl tw-text-white/90 tw-font-medium tw-drop-shadow tw-max-w-3xl tw-mx-auto">
                  Temukan potensi kognitif terbaikmu melalui serangkaian tes diagnostik yang komprehensif dan terstruktur! 🧠✨
                </p>
              </div>
            </div>

            <div className="tw-max-w-5xl tw-mx-auto tw-mb-12">
              <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20 tw-mb-8">
                <div className="tw-flex tw-items-center tw-justify-center tw-gap-3 tw-mb-4">
                  <Quote className="tw-w-8 tw-h-8 tw-text-yellow-300" />
                  <h3 className="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-white">
                    Words of Wisdom
                  </h3>
                </div>
                <div className="tw-text-center">
                  <p className="tw-text-white/95 tw-text-lg tw-font-medium tw-mb-3 tw-italic tw-leading-relaxed">
                    "{currentQuote.text}"
                  </p>
                  <p className="tw-text-white/80 tw-text-base tw-font-semibold">
                    — {currentQuote.author}
                  </p>
                </div>
                <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-4 tw-text-sm tw-text-white/80 tw-mt-6">
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <Star className="tw-w-4 tw-h-4 tw-text-yellow-300" />
                    <span>10 Jenis Tes Berbeda</span>
                  </div>
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <Clock className="tw-w-4 tw-h-4 tw-text-blue-300" />
                    <span>Durasi Fleksibel</span>
                  </div>
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <Trophy className="tw-w-4 tw-h-4 tw-text-orange-300" />
                    <span>Hasil Komprehensif</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="tw-max-w-7xl tw-mx-auto">
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-6">
                {diagnosticTests.map((test) => (
                  <div
                    key={test.id}
                    className="tw-bg-white tw-rounded-2xl tw-shadow-xl tw-transition-all tw-duration-300 tw-hover:shadow-2xl tw-hover:scale-105 tw-overflow-hidden tw-flex tw-flex-col"
                  >
                    <div className="tw-p-6 tw-relative tw-flex tw-flex-col tw-flex-grow">
                      <div className="tw-absolute tw-top-0 tw-right-0 tw-w-16 tw-h-16 tw-bg-gradient-to-br tw-from-white/20 tw-to-transparent tw-rounded-full tw--mr-8 tw--mt-8"></div>
                      <div className="tw-flex tw-items-center tw-justify-center tw-mb-4">
                        <div className={`tw-w-12 tw-h-12 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-text-white tw-shadow-lg ${getColorClasses(test.color, 'bg')}`}>
                          {test.icon}
                        </div>
                      </div>
                      <h5 className={`tw-font-bold tw-mb-3 tw-text-lg tw-leading-tight tw-text-center ${getColorClasses(test.color, 'text')}`}>
                        {test.title}
                      </h5>
                      <p className="tw-text-gray-600 tw-text-sm tw-mb-4 tw-leading-relaxed tw-text-center tw-flex-grow">
                        {test.description}
                      </p>
                      <div className="tw-space-y-2 tw-mb-6">
                        <div className="tw-flex tw-items-center tw-justify-between tw-text-sm">
                          <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-500">
                            <Clock className="tw-w-4 tw-h-4" />
                            <span>Durasi:</span>
                          </div>
                          <span className="tw-font-semibold tw-text-gray-700">{test.duration}</span>
                        </div>
                        <div className="tw-flex tw-items-center tw-justify-between tw-text-sm">
                          <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-500">
                            <Target className="tw-w-4 tw-h-4" />
                            <span>Soal:</span>
                          </div>
                          <span className="tw-font-semibold tw-text-gray-700">{test.questions} pertanyaan</span>
                        </div>
                      </div>
                      <button
                        className={`tw-w-full tw-font-bold tw-py-3 tw-px-4 tw-rounded-xl tw-border-0 tw-transition-all tw-duration-300 tw-shadow-md tw-bg-gradient-to-r ${getColorClasses(test.color, 'from')} ${getColorClasses(test.color, 'to')} tw-text-white hover:tw-shadow-lg hover:tw-scale-105 tw-mt-auto`}
                        onClick={() => handleStartTest(test.id)}
                      >
                        <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                          <Play className="tw-w-5 tw-h-5" />
                          Mulai Tes
                          <ChevronRight className="tw-w-4 tw-h-4" />
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="tw-max-w-4xl tw-mx-auto tw-mt-12">
              <div className="tw-bg-white/10 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-white/20">
                <h4 className="tw-text-xl tw-font-bold tw-text-white tw-mb-3">
                  💡 Tips Mengerjakan Tes Diagnostik
                </h4>
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-text-white/90 tw-text-sm">
                  <div className="tw-flex tw-items-start tw-gap-2">
                    <Star className="tw-w-4 tw-h-4 tw-text-yellow-300 tw-mt-1" />
                    <span>Pastikan koneksi internet stabil sebelum memulai</span>
                  </div>
                  <div className="tw-flex tw-items-start tw-gap-2">
                    <Star className="tw-w-4 tw-h-4 tw-text-yellow-300 tw-mt-1" />
                    <span>Pilih waktu yang tepat tanpa gangguan</span>
                  </div>
                  <div className="tw-flex tw-items-start tw-gap-2">
                    <Star className="tw-w-4 tw-h-4 tw-text-yellow-300 tw-mt-1" />
                    <span>Baca instruksi dengan teliti sebelum mulai</span>
                  </div>
                  <div className="tw-flex tw-items-start tw-gap-2">
                    <Star className="tw-w-4 tw-h-4 tw-text-yellow-300 tw-mt-1" />
                    <span>Jawab dengan jujur sesuai kemampuan terbaik</span>
                  </div>
                </div>
              </div>
            </div>

            <DiagnosticTestModal
              show={showQuantModal}
              onClose={() => setShowQuantModal(false)}
            />

          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  // SSR - Generate random quote on server
  const inspirationalQuotes = [
    {
      text: "Penilaian adalah jembatan antara mengajar dan belajar, mengungkap kapasitas sejati pikiran manusia.",
      author: "Alfred Binet"
    },
    {
      text: "Kecerdasan sejati terletak pada kemampuan beradaptasi dengan perubahan.",
      author: "Stephen Hawking"
    },
    {
      text: "Tes bukan tentang mencari keterbatasan, tetapi menemukan pola unik kekuatan kognitif dalam setiap individu.",
      author: "Howard Gardner"
    },
    {
      text: "Pikiran yang teruji adalah seperti pedang yang diasah - semakin tajam dengan setiap tantangan.",
      author: "Marie Curie"
    },
    {
      text: "Setiap tes mengungkap bukan hanya kinerja, tetapi kompleksitas indah pemrosesan kognitif manusia.",
      author: "Lev Vygotsky"
    },
    {
      text: "Analisis data terbaik dimulai dengan pertanyaan yang tepat, bukan jawaban yang diharapkan.",
      author: "John Tukey"
    },
    {
      text: "Pengujian membuka jendela ke dalam arsitektur pikiran dan mengungkap potensi yang belum tergali.",
      author: "Arthur Jensen"
    },
    {
      text: "Kreativitas adalah kecerdasan yang bersenang-senang dalam proses penemuan.",
      author: "Albert Einstein"
    },
    {
      text: "Nilai sejati tes diagnostik terletak pada kemampuannya memetakan keragaman kognitif manusia.",
      author: "John Carroll"
    },
    {
      text: "Logika akan membawamu dari A ke B. Imajinasi akan membawamu ke mana saja.",
      author: "Albert Einstein"
    },
    {
      text: "Setiap tes diagnostik adalah kesempatan untuk menemukan tanda tangan kognitif unik yang mendefinisikan setiap individu.",
      author: "Douglas Hofstadter"
    },
    {
      text: "Pembelajaran tidak pernah berhenti. Bahkan di usia 90, kamu masih bisa belajar sesuatu yang baru setiap hari.",
      author: "B.F. Skinner"
    },
    {
      text: "Pengujian kognitif adalah metode ilmiah yang diterapkan untuk memahami misteri kecerdasan manusia.",
      author: "Claude Shannon"
    },
    {
      text: "Kesuksesan bukanlah kunci kebahagiaan. Kebahagiaan adalah kunci kesuksesan dalam menghadapi tes kehidupan.",
      author: "Abraham Maslow"
    },
    {
      text: "Pengujian menerangi jalur antara potensi dan kinerja, menjembatani apa yang bisa kita capai.",
      author: "Carol Dweck"
    }
  ];

  const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];

  return {
    props: {
      initialQuote: randomQuote,
    },
  };
};

export default DiagnosticTestPage;