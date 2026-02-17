// pages/cobacoba/testsample.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import { Container, Row, Col, Card, Button, Form, Alert, Accordion, Badge } from 'react-bootstrap';
import { 
  Brain, Eye, BookOpen, Lightbulb, Search, Zap, Clock, Target, 
  Puzzle, Trophy, TrendingUp, RefreshCw, CheckCircle, XCircle, Home
} from 'lucide-react';
import NavigationBar from '../../components/layout/NavigationBar';
import { useRouter } from 'next/router';

interface Question {
  id: string;
  testType: string;
  testIcon: React.ReactNode;
  question: string;
  type: 'single-choice' | 'multiple-choice' | 'true-false' | 'number' | 'text' | 'visual-pattern';
  options?: string[];
  statements?: string[];
  correctAnswer: any;
  explanation: string;
  level: 1 | 2 | 3 | 4 | 5;
  visualPattern?: {
    pattern: string[];
    choices: string[];
  };
}

const TestSamplePage: React.FC = () => {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [expandedTest, setExpandedTest] = useState<string | null>('test-1');

  const sampleQuestions: Question[] = [
    // Test 1: Penalaran Kuantitatif (Level 1-5)
    {
      id: '1-1',
      testType: 'Penalaran Kuantitatif',
      testIcon: <Target className="tw-w-5 tw-h-5" />,
      question: '5 + 3 = ?',
      type: 'number',
      correctAnswer: 8,
      explanation: '5 + 3 = 8',
      level: 1
    },
    {
      id: '1-2',
      testType: 'Penalaran Kuantitatif',
      testIcon: <Target className="tw-w-5 tw-h-5" />,
      question: '12 - 7 = ?',
      type: 'number',
      correctAnswer: 5,
      explanation: '12 - 7 = 5',
      level: 2
    },
    {
      id: '1-3',
      testType: 'Penalaran Kuantitatif',
      testIcon: <Target className="tw-w-5 tw-h-5" />,
      question: '8 × 6 = ?',
      type: 'number',
      correctAnswer: 48,
      explanation: '8 × 6 = 48',
      level: 3
    },
    {
      id: '1-4',
      testType: 'Penalaran Kuantitatif',
      testIcon: <Target className="tw-w-5 tw-h-5" />,
      question: '144 ÷ 12 = ?',
      type: 'number',
      correctAnswer: 12,
      explanation: '144 ÷ 12 = 12',
      level: 4
    },
    {
      id: '1-5',
      testType: 'Penalaran Kuantitatif',
      testIcon: <Target className="tw-w-5 tw-h-5" />,
      question: '(15 + 9) × 3 - 18 = ?',
      type: 'number',
      correctAnswer: 54,
      explanation: '(15 + 9) × 3 - 18 = 24 × 3 - 18 = 72 - 18 = 54',
      level: 5
    },

    // Test 2: Penalaran Visual-Spasial (Level 1-5) - Pattern Recognition
    {
      id: '2-1',
      testType: 'Penalaran Visual-Spasial',
      testIcon: <Eye className="tw-w-5 tw-h-5" />,
      question: 'Gambar berikut menunjukkan pola. Pilih gambar yang sesuai untuk melengkapi pola:',
      type: 'visual-pattern',
      visualPattern: {
        pattern: ['○', '○', '○'],
        choices: ['○', '□', '△', '◇']
      },
      correctAnswer: '○',
      explanation: 'Pola: semua lingkaran, jadi yang keempat juga lingkaran',
      level: 1
    },
    {
      id: '2-2',
      testType: 'Penalaran Visual-Spasial',
      testIcon: <Eye className="tw-w-5 tw-h-5" />,
      question: 'Gambar berikut menunjukkan pola. Pilih gambar yang sesuai untuk melengkapi pola:',
      type: 'visual-pattern',
      visualPattern: {
        pattern: ['○', '□', '○'],
        choices: ['○', '□', '△', '◇']
      },
      correctAnswer: '□',
      explanation: 'Pola bergantian: lingkaran, persegi, lingkaran, maka selanjutnya persegi',
      level: 2
    },
    {
      id: '2-3',
      testType: 'Penalaran Visual-Spasial',
      testIcon: <Eye className="tw-w-5 tw-h-5" />,
      question: 'Gambar berikut menunjukkan pola. Pilih gambar yang sesuai untuk melengkapi pola:',
      type: 'visual-pattern',
      visualPattern: {
        pattern: ['●', '○', '●'],
        choices: ['●', '○', '■', '□']
      },
      correctAnswer: '○',
      explanation: 'Pola: hitam, putih, hitam, maka selanjutnya putih (○)',
      level: 3
    },
    {
      id: '2-4',
      testType: 'Penalaran Visual-Spasial',
      testIcon: <Eye className="tw-w-5 tw-h-5" />,
      question: 'Gambar berikut menunjukkan pola. Pilih gambar yang sesuai untuk melengkapi pola:',
      type: 'visual-pattern',
      visualPattern: {
        pattern: ['○', '□', '△'],
        choices: ['◇', '○', '□', '★']
      },
      correctAnswer: '◇',
      explanation: 'Pola: lingkaran (0 sudut), persegi (4 sudut), segitiga (3 sudut), maka wajik (4 sudut)',
      level: 4
    },
    {
      id: '2-5',
      testType: 'Penalaran Visual-Spasial',
      testIcon: <Eye className="tw-w-5 tw-h-5" />,
      question: 'Gambar berikut menunjukkan pola. Pilih gambar yang sesuai untuk melengkapi pola:',
      type: 'visual-pattern',
      visualPattern: {
        pattern: ['●○○', '●●○', '●●●'],
        choices: ['○○○', '●●●●', '○●●', '●○●']
      },
      correctAnswer: '●●●●',
      explanation: 'Pola: jumlah bentuk hitam bertambah 1 setiap pola (1, 2, 3, maka 4)',
      level: 5
    },

    // Test 3: Literasi Verbal (Level 1-5)
    {
      id: '3-1',
      testType: 'Literasi Verbal',
      testIcon: <BookOpen className="tw-w-5 tw-h-5" />,
      question: 'Lawan kata dari "panas" adalah?',
      type: 'single-choice',
      options: ['Dingin', 'Hangat', 'Sejuk', 'Kering'],
      correctAnswer: 'Dingin',
      explanation: 'Panas >< Dingin',
      level: 1
    },
    {
      id: '3-2',
      testType: 'Literasi Verbal',
      testIcon: <BookOpen className="tw-w-5 tw-h-5" />,
      question: 'Sinonim dari "cerdas" adalah?',
      type: 'single-choice',
      options: ['Bodoh', 'Pintar', 'Rajin', 'Baik'],
      correctAnswer: 'Pintar',
      explanation: 'Cerdas = Pintar',
      level: 2
    },
    {
      id: '3-3',
      testType: 'Literasi Verbal',
      testIcon: <BookOpen className="tw-w-5 tw-h-5" />,
      question: 'Kata yang tidak termasuk kelompok: Apel, Jeruk, Kursi, Mangga',
      type: 'single-choice',
      options: ['Apel', 'Jeruk', 'Kursi', 'Mangga'],
      correctAnswer: 'Kursi',
      explanation: 'Kursi bukan buah, yang lain adalah buah',
      level: 3
    },
    {
      id: '3-4',
      testType: 'Literasi Verbal',
      testIcon: <BookOpen className="tw-w-5 tw-h-5" />,
      question: 'Rumah : Atap = Mobil : ?',
      type: 'single-choice',
      options: ['Roda', 'Mesin', 'Pintu', 'Kap'],
      correctAnswer: 'Kap',
      explanation: 'Atap adalah bagian atas rumah, Kap adalah bagian atas mobil',
      level: 4
    },
    {
      id: '3-5',
      testType: 'Literasi Verbal',
      testIcon: <BookOpen className="tw-w-5 tw-h-5" />,
      question: 'Jika "KODE" → "LQGH", maka "BUKU" → ?',
      type: 'single-choice',
      options: ['CVLV', 'CUKU', 'DWMW', 'AUJU'],
      correctAnswer: 'CVLV',
      explanation: 'Setiap huruf digeser +1: B→C, U→V, K→L, U→V',
      level: 5
    },

    // Test 4: Penalaran Cair (Abstrak) (Level 1-5)
    {
      id: '4-1',
      testType: 'Penalaran Cair (Abstrak)',
      testIcon: <Lightbulb className="tw-w-5 tw-h-5" />,
      question: 'Pola: 2, 4, 6, 8, __ ?',
      type: 'number',
      correctAnswer: 10,
      explanation: 'Pola +2: 8 + 2 = 10',
      level: 1
    },
    {
      id: '4-2',
      testType: 'Penalaran Cair (Abstrak)',
      testIcon: <Lightbulb className="tw-w-5 tw-h-5" />,
      question: 'Pola: ○ □ ○ □ ○ __ ?',
      type: 'single-choice',
      options: ['○', '□', '△', '◇'],
      correctAnswer: '□',
      explanation: 'Pola berulang: lingkaran, persegi',
      level: 2
    },
    {
      id: '4-3',
      testType: 'Penalaran Cair (Abstrak)',
      testIcon: <Lightbulb className="tw-w-5 tw-h-5" />,
      question: 'Pola: 1, 4, 9, 16, __ ?',
      type: 'number',
      correctAnswer: 25,
      explanation: 'Pola kuadrat: 1², 2², 3², 4², 5² = 25',
      level: 3
    },
    {
      id: '4-4',
      testType: 'Penalaran Cair (Abstrak)',
      testIcon: <Lightbulb className="tw-w-5 tw-h-5" />,
      question: 'Pola: 2, 3, 5, 7, 11, __ ?',
      type: 'number',
      correctAnswer: 13,
      explanation: 'Deret bilangan prima: setelah 11 adalah 13',
      level: 4
    },
    {
      id: '4-5',
      testType: 'Penalaran Cair (Abstrak)',
      testIcon: <Lightbulb className="tw-w-5 tw-h-5" />,
      question: 'Pola: 1, 1, 2, 3, 5, 8, __ ?',
      type: 'number',
      correctAnswer: 13,
      explanation: 'Fibonacci: jumlah 2 angka sebelumnya (5 + 8 = 13)',
      level: 5
    },

    // Test 5: Penalaran Deduktif Logis (Level 1-5)
    {
      id: '5-1',
      testType: 'Penalaran Deduktif Logis',
      testIcon: <Search className="tw-w-5 tw-h-5" />,
      question: 'Semua kucing adalah hewan. Mimi adalah kucing. Maka Mimi adalah?',
      type: 'single-choice',
      options: ['Hewan', 'Bukan hewan', 'Tumbuhan', 'Tidak dapat disimpulkan'],
      correctAnswer: 'Hewan',
      explanation: 'Silogisme dasar: Mimi termasuk kucing, kucing adalah hewan',
      level: 1
    },
    {
      id: '5-2',
      testType: 'Penalaran Deduktif Logis',
      testIcon: <Search className="tw-w-5 tw-h-5" />,
      question: 'Jika A > B dan B > C, maka?',
      type: 'single-choice',
      options: ['A > C', 'A < C', 'A = C', 'Tidak dapat ditentukan'],
      correctAnswer: 'A > C',
      explanation: 'Transitif: A lebih besar dari B, B lebih besar dari C, maka A > C',
      level: 2
    },
    {
      id: '5-3',
      testType: 'Penalaran Deduktif Logis',
      testIcon: <Search className="tw-w-5 tw-h-5" />,
      question: 'Semua siswa rajin. Budi adalah siswa. Kesimpulan?',
      type: 'single-choice',
      options: ['Budi rajin', 'Budi malas', 'Budi tidak rajin', 'Tidak dapat disimpulkan'],
      correctAnswer: 'Budi rajin',
      explanation: 'Silogisme kategorikal: Budi termasuk siswa yang rajin',
      level: 3
    },
    {
      id: '5-4',
      testType: 'Penalaran Deduktif Logis',
      testIcon: <Search className="tw-w-5 tw-h-5" />,
      question: 'Jika hujan, jalan basah. Jalan basah. Apakah hujan?',
      type: 'single-choice',
      options: ['Ya, pasti', 'Tidak, pasti tidak', 'Belum tentu', 'Mustahil'],
      correctAnswer: 'Belum tentu',
      explanation: 'Jalan bisa basah karena hal lain (disiram, dll)',
      level: 4
    },
    {
      id: '5-5',
      testType: 'Penalaran Deduktif Logis',
      testIcon: <Search className="tw-w-5 tw-h-5" />,
      question: 'Tidak ada A yang B. Semua C adalah B. Maka?',
      type: 'single-choice',
      options: ['Tidak ada C yang A', 'Semua C adalah A', 'Sebagian C adalah A', 'A = C'],
      correctAnswer: 'Tidak ada C yang A',
      explanation: 'Jika tidak ada A yang B, dan C adalah B, maka C bukan A',
      level: 5
    },

    // Test 6: Memori Kerja (Level 1-5)
    {
      id: '6-1',
      testType: 'Memori Kerja',
      testIcon: <Brain className="tw-w-5 tw-h-5" />,
      question: 'Ingat: 3, 7, 2. Jumlahnya?',
      type: 'number',
      correctAnswer: 12,
      explanation: '3 + 7 + 2 = 12',
      level: 1
    },
    {
      id: '6-2',
      testType: 'Memori Kerja',
      testIcon: <Brain className="tw-w-5 tw-h-5" />,
      question: 'Kata: BUKU. Huruf ke-3?',
      type: 'single-choice',
      options: ['B', 'U', 'K', 'U'],
      correctAnswer: 'K',
      explanation: 'B(1), U(2), K(3)',
      level: 2
    },
    {
      id: '6-3',
      testType: 'Memori Kerja',
      testIcon: <Brain className="tw-w-5 tw-h-5" />,
      question: 'Urutan: A, C, E, __. Huruf selanjutnya?',
      type: 'single-choice',
      options: ['F', 'G', 'H', 'I'],
      correctAnswer: 'G',
      explanation: 'Pola loncat 1: A(skip B)C(skip D)E(skip F)G',
      level: 3
    },
    {
      id: '6-4',
      testType: 'Memori Kerja',
      testIcon: <Brain className="tw-w-5 tw-h-5" />,
      question: 'Hitung mundur dari 20 kelipatan 3: 20, 17, 14, __?',
      type: 'number',
      correctAnswer: 11,
      explanation: 'Kurangi 3: 14 - 3 = 11',
      level: 4
    },
    {
      id: '6-5',
      testType: 'Memori Kerja',
      testIcon: <Brain className="tw-w-5 tw-h-5" />,
      question: 'Ingat angka: 5, 3, 8, 2, 7. Angka terbesar dikurangi terkecil?',
      type: 'number',
      correctAnswer: 6,
      explanation: 'Terbesar 8, terkecil 2: 8 - 2 = 6',
      level: 5
    },

    // Test 7: Kecepatan Pemrosesan (Level 1-5)
    {
      id: '7-1',
      testType: 'Kecepatan Pemrosesan',
      testIcon: <Zap className="tw-w-5 tw-h-5" />,
      question: '10 + 5 = ?',
      type: 'number',
      correctAnswer: 15,
      explanation: '10 + 5 = 15',
      level: 1
    },
    {
      id: '7-2',
      testType: 'Kecepatan Pemrosesan',
      testIcon: <Zap className="tw-w-5 tw-h-5" />,
      question: '7 × 8 = ?',
      type: 'number',
      correctAnswer: 56,
      explanation: '7 × 8 = 56',
      level: 2
    },
    {
      id: '7-3',
      testType: 'Kecepatan Pemrosesan',
      testIcon: <Zap className="tw-w-5 tw-h-5" />,
      question: '45 ÷ 9 = ?',
      type: 'number',
      correctAnswer: 5,
      explanation: '45 ÷ 9 = 5',
      level: 3
    },
    {
      id: '7-4',
      testType: 'Kecepatan Pemrosesan',
      testIcon: <Zap className="tw-w-5 tw-h-5" />,
      question: '(12 + 8) × 2 = ?',
      type: 'number',
      correctAnswer: 40,
      explanation: '(12 + 8) × 2 = 20 × 2 = 40',
      level: 4
    },
    {
      id: '7-5',
      testType: 'Kecepatan Pemrosesan',
      testIcon: <Zap className="tw-w-5 tw-h-5" />,
      question: '15 × 6 - 18 ÷ 3 = ?',
      type: 'number',
      correctAnswer: 84,
      explanation: '15 × 6 = 90, 18 ÷ 3 = 6, maka 90 - 6 = 84',
      level: 5
    },

    // Test 8: Perhatian & Kontrol Eksekutif (Level 1-5)
    {
      id: '8-1',
      testType: 'Perhatian & Kontrol Eksekutif',
      testIcon: <Clock className="tw-w-5 tw-h-5" />,
      question: 'Berapa angka "7" dalam: 7, 3, 7, 9, 7?',
      type: 'number',
      correctAnswer: 3,
      explanation: 'Ada 3 angka "7"',
      level: 1
    },
    {
      id: '8-2',
      testType: 'Perhatian & Kontrol Eksekutif',
      testIcon: <Clock className="tw-w-5 tw-h-5" />,
      question: 'Aturan: jawab kebalikan. Apakah 2 + 2 = 4?',
      type: 'single-choice',
      options: ['Ya', 'Tidak'],
      correctAnswer: 'Tidak',
      explanation: '2+2=4 benar, tapi aturan jawab kebalikan → Tidak',
      level: 2
    },
    {
      id: '8-3',
      testType: 'Perhatian & Kontrol Eksekutif',
      testIcon: <Clock className="tw-w-5 tw-h-5" />,
      question: 'Aturan: genap +1, ganjil -1. Hasil dari 6?',
      type: 'number',
      correctAnswer: 7,
      explanation: '6 adalah genap, maka 6 + 1 = 7',
      level: 3
    },
    {
      id: '8-4',
      testType: 'Perhatian & Kontrol Eksekutif',
      testIcon: <Clock className="tw-w-5 tw-h-5" />,
      question: 'Kata "MERAH" ditulis warna biru. Sebutkan warnanya?',
      type: 'single-choice',
      options: ['Merah', 'Biru', 'Hijau', 'Kuning'],
      correctAnswer: 'Biru',
      explanation: 'Stroop effect: fokus pada warna tinta (biru), bukan arti kata',
      level: 4
    },
    {
      id: '8-5',
      testType: 'Perhatian & Kontrol Eksekutif',
      testIcon: <Clock className="tw-w-5 tw-h-5" />,
      question: 'Berapa huruf "E" dalam: "THE QUICK BROWN FOX"?',
      type: 'number',
      correctAnswer: 1,
      explanation: 'Hanya ada 1 huruf E di kata "THE"',
      level: 5
    },

    // Test 9: Pemecahan Masalah / Berpikir Kreatif (Level 1-5)
    {
      id: '9-1',
      testType: 'Pemecahan Masalah / Berpikir Kreatif',
      testIcon: <Puzzle className="tw-w-5 tw-h-5" />,
      question: 'Anda punya 4 apel dan memberi 2 ke teman. Sisa berapa?',
      type: 'number',
      correctAnswer: 2,
      explanation: '4 - 2 = 2 apel',
      level: 1
    },
    {
      id: '9-2',
      testType: 'Pemecahan Masalah / Berpikir Kreatif',
      testIcon: <Puzzle className="tw-w-5 tw-h-5" />,
      question: '1 orang mengecat rumah 6 hari. Berapa hari untuk 2 orang?',
      type: 'number',
      correctAnswer: 3,
      explanation: '6 ÷ 2 = 3 hari',
      level: 2
    },
    {
      id: '9-3',
      testType: 'Pemecahan Masalah / Berpikir Kreatif',
      testIcon: <Puzzle className="tw-w-5 tw-h-5" />,
      question: 'Bagaimana membagi 8 kue untuk 4 orang sama rata?',
      type: 'single-choice',
      options: ['Beri 2 kue per orang', 'Beri 1 kue per orang', 'Beri 3 kue per orang', 'Tidak bisa dibagi'],
      correctAnswer: 'Beri 2 kue per orang',
      explanation: '8 ÷ 4 = 2 kue per orang',
      level: 3
    },
    {
      id: '9-4',
      testType: 'Pemecahan Masalah / Berpikir Kreatif',
      testIcon: <Puzzle className="tw-w-5 tw-h-5" />,
      question: 'Sebuah tangga 10 anak tangga. Anda di tangga 3. Naik 4 tangga, turun 2. Posisi sekarang?',
      type: 'number',
      correctAnswer: 5,
      explanation: '3 + 4 - 2 = 5',
      level: 4
    },
    {
      id: '9-5',
      testType: 'Pemecahan Masalah / Berpikir Kreatif',
      testIcon: <Puzzle className="tw-w-5 tw-h-5" />,
      question: 'Anda punya 9 bola, 1 lebih berat. Berapa kali minimum menimbang untuk menemukan yang berat?',
      type: 'number',
      correctAnswer: 2,
      explanation: 'Bagi 3 kelompok (3-3-3): timbang 2 kelompok (1x), lalu timbang 2 dari kelompok berat (2x)',
      level: 5
    },

    // Test 10: Pengetahuan Terkristalisasi (Level 1-5)
    {
      id: '10-1',
      testType: 'Pengetahuan Terkristalisasi',
      testIcon: <Trophy className="tw-w-5 tw-h-5" />,
      question: 'Berapa hari dalam 1 minggu?',
      type: 'number',
      correctAnswer: 7,
      explanation: '1 minggu = 7 hari',
      level: 1
    },
    {
      id: '10-2',
      testType: 'Pengetahuan Terkristalisasi',
      testIcon: <Trophy className="tw-w-5 tw-h-5" />,
      question: 'Ibu kota Indonesia adalah?',
      type: 'single-choice',
      options: ['Jakarta', 'Bandung', 'Surabaya', 'Medan'],
      correctAnswer: 'Jakarta',
      explanation: 'Jakarta adalah ibu kota Indonesia',
      level: 2
    },
    {
      id: '10-3',
      testType: 'Pengetahuan Terkristalisasi',
      testIcon: <Trophy className="tw-w-5 tw-h-5" />,
      question: 'Berapa hasil dari 12²?',
      type: 'number',
      correctAnswer: 144,
      explanation: '12 × 12 = 144',
      level: 3
    },
    {
      id: '10-4',
      testType: 'Pengetahuan Terkristalisasi',
      testIcon: <Trophy className="tw-w-5 tw-h-5" />,
      question: 'Rumus luas lingkaran adalah?',
      type: 'single-choice',
      options: ['πr²', '2πr', 'πd', 'r²'],
      correctAnswer: 'πr²',
      explanation: 'Luas lingkaran = π × radius²',
      level: 4
    },
    {
      id: '10-5',
      testType: 'Pengetahuan Terkristalisasi',
      testIcon: <Trophy className="tw-w-5 tw-h-5" />,
      question: 'Kecepatan cahaya dalam vakum sekitar?',
      type: 'single-choice',
      options: ['300.000 km/s', '150.000 km/s', '500.000 km/s', '200.000 km/s'],
      correctAnswer: '300.000 km/s',
      explanation: 'Kecepatan cahaya ≈ 300.000 km/detik atau 3×10⁸ m/s',
      level: 5
    },

    // Test 11: Penalaran Induktif (Level 1-5)
    {
      id: '11-1',
      testType: 'Penalaran Induktif',
      testIcon: <TrendingUp className="tw-w-5 tw-h-5" />,
      question: 'Pola: 1, 2, 3, 4, __ ?',
      type: 'number',
      correctAnswer: 5,
      explanation: 'Pola naik 1: 4 + 1 = 5',
      level: 1
    },
    {
      id: '11-2',
      testType: 'Penalaran Induktif',
      testIcon: <TrendingUp className="tw-w-5 tw-h-5" />,
      question: 'Pola: 5, 10, 15, 20, __ ?',
      type: 'number',
      correctAnswer: 25,
      explanation: 'Kelipatan 5: 20 + 5 = 25',
      level: 2
    },
    {
      id: '11-3',
      testType: 'Penalaran Induktif',
      testIcon: <TrendingUp className="tw-w-5 tw-h-5" />,
      question: 'Pola: 2, 6, 12, 20, __ ?',
      type: 'number',
      correctAnswer: 30,
      explanation: 'Pola +4, +6, +8, +10: 20 + 10 = 30',
      level: 3
    },
    {
      id: '11-4',
      testType: 'Penalaran Induktif',
      testIcon: <TrendingUp className="tw-w-5 tw-h-5" />,
      question: 'Pola: 3, 6, 12, 24, __ ?',
      type: 'number',
      correctAnswer: 48,
      explanation: 'Setiap angka dikali 2: 24 × 2 = 48',
      level: 4
    },
    {
      id: '11-5',
      testType: 'Penalaran Induktif',
      testIcon: <TrendingUp className="tw-w-5 tw-h-5" />,
      question: 'Pola: 1, 4, 9, 16, 25, __ ?',
      type: 'number',
      correctAnswer: 36,
      explanation: 'Kuadrat: 1², 2², 3², 4², 5², 6² = 36',
      level: 5
    },

    // Test 12: Fleksibilitas Kognitif & Adaptasi (Level 1-5)
    {
      id: '12-1',
      testType: 'Fleksibilitas Kognitif & Adaptasi',
      testIcon: <RefreshCw className="tw-w-5 tw-h-5" />,
      question: 'Aturan: semua angka +5. Hasil dari 3?',
      type: 'number',
      correctAnswer: 8,
      explanation: '3 + 5 = 8',
      level: 1
    },
    {
      id: '12-2',
      testType: 'Fleksibilitas Kognitif & Adaptasi',
      testIcon: <RefreshCw className="tw-w-5 tw-h-5" />,
      question: 'Aturan berubah: sekarang semua angka ×2. Hasil dari 5?',
      type: 'number',
      correctAnswer: 10,
      explanation: 'Adaptasi: gunakan aturan baru (5 × 2 = 10)',
      level: 2
    },
    {
      id: '12-3',
      testType: 'Fleksibilitas Kognitif & Adaptasi',
      testIcon: <RefreshCw className="tw-w-5 tw-h-5" />,
      question: 'Kategori: Buah. Yang termasuk: Apel, Jeruk, Pisang, Wortel. Kategori ganti: Sayur. Yang masuk?',
      type: 'single-choice',
      options: ['Apel', 'Jeruk', 'Pisang', 'Wortel'],
      correctAnswer: 'Wortel',
      explanation: 'Mental shift: hanya Wortel yang sayur',
      level: 3
    },
    {
      id: '12-4',
      testType: 'Fleksibilitas Kognitif & Adaptasi',
      testIcon: <RefreshCw className="tw-w-5 tw-h-5" />,
      question: 'Task: hitung huruf di "A3B5C2". Berapa huruf?',
      type: 'number',
      correctAnswer: 3,
      explanation: 'Switch fokus: A, B, C = 3 huruf (abaikan angka)',
      level: 4
    },
    {
      id: '12-5',
      testType: 'Fleksibilitas Kognitif & Adaptasi',
      testIcon: <RefreshCw className="tw-w-5 tw-h-5" />,
      question: 'Aturan soal 1: +2. Soal 2: ×3. Soal 3: -1. Ini soal 3, input 10. Hasil?',
      type: 'number',
      correctAnswer: 9,
      explanation: 'Adaptasi cepat: pakai aturan soal 3 (10 - 1 = 9)',
      level: 5
    }
  ];

  const testTypes = Array.from(new Set(sampleQuestions.map(q => q.testType)));

  const handleAnswerChange = (questionId: string, value: any, type: string) => {
    if (type === 'multiple-choice') {
      const currentAnswers = answers[questionId] || [];
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((a: string) => a !== value)
        : [...currentAnswers, value];
      setAnswers({ ...answers, [questionId]: newAnswers });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const checkAnswer = (questionId: string): 'correct' | 'incorrect' | 'unanswered' => {
    if (!showResults) return 'unanswered';
    const question = sampleQuestions.find(q => q.id === questionId);
    if (!question) return 'unanswered';
    
    const userAnswer = answers[questionId];
    if (userAnswer === undefined || userAnswer === '') return 'unanswered';

    if (question.type === 'multiple-choice') {
      const correctSet = new Set(question.correctAnswer);
      const userSet = new Set(userAnswer || []);
      const isCorrect = correctSet.size === userSet.size && 
        [...correctSet].every(x => userSet.has(x));
      return isCorrect ? 'correct' : 'incorrect';
    } else if (question.type === 'number') {
      return Number(userAnswer) === Number(question.correctAnswer) ? 'correct' : 'incorrect';
    } else if (question.type === 'text') {
      return String(userAnswer).toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim() 
        ? 'correct' : 'incorrect';
    } else {
      return userAnswer === question.correctAnswer ? 'correct' : 'incorrect';
    }
  };

  const getScore = () => {
    let correct = 0;
    sampleQuestions.forEach(q => {
      if (checkAnswer(q.id) === 'correct') correct++;
    });
    return { correct, total: sampleQuestions.length };
  };

  const renderQuestion = (question: Question) => {
    const answerStatus = checkAnswer(question.id);
    
    const levelColors = {
      1: 'tw-bg-green-100 tw-text-green-700',
      2: 'tw-bg-blue-100 tw-text-blue-700',
      3: 'tw-bg-yellow-100 tw-text-yellow-700',
      4: 'tw-bg-orange-100 tw-text-orange-700',
      5: 'tw-bg-red-100 tw-text-red-700'
    };
    
    const levelLabels = {
      1: 'Sangat Mudah',
      2: 'Mudah',
      3: 'Sedang',
      4: 'Sulit',
      5: 'Sangat Sulit'
    };
    
    return (
      <Card key={question.id} className="tw-mb-4 tw-border-2" style={{
        borderColor: answerStatus === 'correct' ? '#10b981' : answerStatus === 'incorrect' ? '#ef4444' : '#e5e7eb'
      }}>
        <Card.Body>
          <div className="tw-flex tw-items-start tw-gap-3 tw-mb-3">
            <div className="tw-flex-shrink-0 tw-mt-1">
              {question.testIcon}
            </div>
            <div className="tw-flex-1">
              <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                <div className="tw-text-sm tw-text-gray-600">{question.testType}</div>
                <Badge className={`tw-text-xs tw-px-2 tw-py-1 tw-rounded ${levelColors[question.level]}`}>
                  Level {question.level} - {levelLabels[question.level]}
                </Badge>
              </div>
              <h6 className="tw-font-semibold tw-mb-3">{question.question}</h6>
              
              {/* Visual Pattern Type */}
              {question.type === 'visual-pattern' && question.visualPattern && (
                <div>
                  {/* Display Pattern */}
                  <div className="tw-mb-4">
                    <div className="tw-flex tw-items-center tw-gap-3 tw-justify-center tw-mb-4 tw-flex-wrap">
                      {question.visualPattern.pattern.map((symbol, idx) => (
                        <div 
                          key={idx}
                          className="tw-w-20 tw-h-20 tw-border-2 tw-border-gray-400 tw-rounded tw-flex tw-items-center tw-justify-center tw-text-4xl tw-bg-white tw-shadow-sm"
                        >
                          {symbol}
                        </div>
                      ))}
                      <div className="tw-w-20 tw-h-20 tw-border-2 tw-border-dashed tw-border-blue-500 tw-rounded tw-flex tw-items-center tw-justify-center tw-text-3xl tw-bg-blue-50 tw-font-bold tw-text-blue-500 tw-shadow-sm">
                        ?
                      </div>
                    </div>
                  </div>

                  {/* Display Choices */}
                  <div className="tw-grid tw-grid-cols-2 tw-gap-3 tw-mb-3 sm:tw-grid-cols-4">
                    {question.visualPattern.choices.map((choice, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerChange(question.id, choice, question.type)}
                        disabled={showResults}
                        className={`tw-h-20 tw-text-4xl tw-border-2 tw-rounded tw-transition-all tw-shadow-sm ${
                          answers[question.id] === choice
                            ? 'tw-bg-blue-500 tw-text-white tw-border-blue-600'
                            : 'tw-bg-white tw-border-gray-300 hover:tw-border-blue-400 hover:tw-bg-blue-50'
                        } ${showResults ? 'tw-cursor-not-allowed' : 'tw-cursor-pointer'}`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Options for single/multiple choice */}
              {(question.type === 'single-choice' || question.type === 'multiple-choice') && question.options && (
                <div className="tw-space-y-2">
                  {question.options.map((option, idx) => (
                    <Form.Check
                      key={idx}
                      type={question.type === 'single-choice' ? 'radio' : 'checkbox'}
                      id={`${question.id}-option-${idx}`}
                      label={option}
                      name={question.id}
                      checked={
                        question.type === 'single-choice'
                          ? answers[question.id] === option
                          : (answers[question.id] || []).includes(option)
                      }
                      onChange={() => handleAnswerChange(question.id, option, question.type)}
                      disabled={showResults}
                    />
                  ))}
                </div>
              )}

              {/* Number input */}
              {question.type === 'number' && (
                <Form.Control
                  type="number"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, Number(e.target.value), question.type)}
                  disabled={showResults}
                  placeholder="Masukkan angka"
                />
              )}

              {/* Text input */}
              {question.type === 'text' && (
                <Form.Control
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
                  disabled={showResults}
                  placeholder="Masukkan jawaban"
                />
              )}

              {/* Show result */}
              {showResults && (
                <div className="tw-mt-3">
                  {answerStatus === 'correct' && (
                    <Alert variant="success" className="tw-mb-0 tw-py-2">
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <CheckCircle size={18} />
                        <strong>Benar!</strong> {question.explanation}
                      </div>
                    </Alert>
                  )}
                  {answerStatus === 'incorrect' && (
                    <Alert variant="danger" className="tw-mb-0 tw-py-2">
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <XCircle size={18} />
                        <strong>Salah.</strong> Jawaban yang benar: <strong>{String(question.correctAnswer)}</strong>
                        <br/>{question.explanation}
                      </div>
                    </Alert>
                  )}
                  {answerStatus === 'unanswered' && (
                    <Alert variant="warning" className="tw-mb-0 tw-py-2">
                      <strong>Tidak dijawab.</strong> Jawaban yang benar: <strong>{String(question.correctAnswer)}</strong>
                      <br/>{question.explanation}
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const score = showResults ? getScore() : { correct: 0, total: 0 };

  return (
    <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-violet-50 tw-to-purple-50">
      <NavigationBar />
      
      <Head>
        <title>Sample Tes Diagnostik - 60 Soal</title>
        <meta name="description" content="Coba sample soal dari 12 tes diagnostik kognitif" />
      </Head>

      <Container className="tw-py-8">
        <Row className="tw-mb-6">
          <Col>
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
              <div>
                <h1 className="tw-text-4xl tw-font-bold tw-text-violet-800 tw-mb-2">
                  Sample Tes Diagnostik
                </h1>
                <p className="tw-text-gray-600">
                  Coba 60 soal sample dari 12 kategori tes kognitif (5 soal per kategori)
                </p>
              </div>
              <Button
                variant="outline-secondary"
                onClick={() => router.push('/diagnostic-test')}
                className="tw-flex tw-items-center tw-gap-2"
              >
                <Home size={18} />
                Kembali
              </Button>
            </div>

            {showResults && (
              <Alert variant={score.correct / score.total >= 0.7 ? 'success' : 'warning'}>
                <h5 className="tw-mb-2">Hasil Tes Sample</h5>
                <p className="tw-mb-0">
                  Anda menjawab <strong>{score.correct}</strong> dari <strong>{score.total}</strong> soal dengan benar
                  ({Math.round((score.correct / score.total) * 100)}%)
                </p>
              </Alert>
            )}

            <Card className="tw-mb-4 tw-bg-violet-50 tw-border-violet-200">
              <Card.Body>
                <div className="tw-flex tw-items-center tw-justify-between">
                  <div className="tw-flex tw-items-center tw-gap-3">
                    <Brain className="tw-w-8 tw-h-8 tw-text-violet-600" />
                    <div>
                      <div className="tw-text-sm tw-text-gray-600">Total Soal</div>
                      <div className="tw-text-2xl tw-font-bold tw-text-violet-800">60 Soal</div>
                    </div>
                  </div>
                  <Button
                    variant={showResults ? 'secondary' : 'primary'}
                    size="lg"
                    onClick={() => {
                      if (showResults) {
                        setAnswers({});
                        setShowResults(false);
                        setExpandedTest('test-1');
                      } else {
                        setShowResults(true);
                        setExpandedTest(null);
                      }
                    }}
                    className="tw-px-6"
                  >
                    {showResults ? 'Reset & Ulangi' : 'Lihat Hasil'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Accordion activeKey={expandedTest} onSelect={(key) => setExpandedTest(key as string)}>
              {testTypes.map((testType, index) => {
                const testQuestions = sampleQuestions.filter(q => q.testType === testType);
                const answeredCount = testQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length;
                const correctCount = showResults ? testQuestions.filter(q => checkAnswer(q.id) === 'correct').length : 0;
                
                return (
                  <Accordion.Item eventKey={`test-${index + 1}`} key={index} className="tw-mb-3">
                    <Accordion.Header>
                      <div className="tw-flex tw-items-center tw-justify-between tw-w-full tw-pr-4">
                        <div className="tw-flex tw-items-center tw-gap-3">
                          {testQuestions[0]?.testIcon}
                          <div>
                            <div className="tw-font-bold tw-text-lg">{testType}</div>
                            <div className="tw-text-sm tw-text-gray-600">
                              {showResults 
                                ? `${correctCount}/${testQuestions.length} benar` 
                                : `${answeredCount}/${testQuestions.length} dijawab`
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      {testQuestions.map(question => renderQuestion(question))}
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TestSamplePage;
