-- ================================================================
-- MIGRATION: Pengetahuan Kuantitatif - Full Restructure
-- Flow:
--   STEP 1: INSERT section & topic baru
--   STEP 2: UPDATE questions.question_topic_type (lama → baru)
--   STEP 3: DELETE topic & section lama
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1A: INSERT kind=2 (Section) BARU
-- master_id = 120 (Pengetahuan Kuantitatif)
-- ================================================================

INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Aljabar dan Persamaan',
        'Memahami operasi aljabar dasar, persamaan linear dan kuadrat, serta fungsi eksponen dan logaritma.',
        'ALP', 2, 120, NOW()
    ),
    (
        'Aritmatika',
        'Memahami sistem bilangan, bilangan prima, barisan dan deret, serta aritmatika sosial.',
        'AR', 2, 120, NOW()
    ),
    (
        'Geometri',
        'Memahami geometri datar, geometri ruang, transformasi, dan trigonometri.',
        'GE', 2, 120, NOW()
    ),
    (
        'Statistika dan Peluang',
        'Memahami statistika, peluang, dan himpunan serta aplikasinya.',
        'STP', 2, 120, NOW()
    ),
    (
        'Matriks dan Aplikasi Matematika',
        'Memahami matriks, pengukuran dan konversi satuan, perbandingan, dan logika matematika.',
        'MAM', 2, 120, NOW()
    ),
    (
        'Kalkulus',
        'Memahami limit fungsi, turunan, integral, dan aplikasinya dalam optimasi dan pengukuran.',
        'KL', 2, 120, NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ================================================================
-- STEP 1B: INSERT kind=3 (Topic) BARU
-- master_id = id section via subquery
-- ================================================================

-- ── Section: Aljabar dan Persamaan (ALP) ──────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Operasi Aljabar Dasar',
        'Memahami variabel, operasi pada bentuk aljabar, pecahan aljabar, eksponen, akar, dan faktorisasi.',
        'OAD', 3, (SELECT id FROM public.exam_types WHERE code = 'ALP' AND master_id = 120), NOW()
    ),
    (
        'Persamaan Linear',
        'Memahami persamaan dan pertidaksamaan linear, SPLDV, fungsi linear, dan persamaan garis lurus.',
        'PL', 3, (SELECT id FROM public.exam_types WHERE code = 'ALP' AND master_id = 120), NOW()
    ),
    (
        'Persamaan Kuadrat',
        'Memahami persamaan kuadrat, fungsi kuadrat, grafik parabola, dan pertidaksamaan kuadrat.',
        'PK', 3, (SELECT id FROM public.exam_types WHERE code = 'ALP' AND master_id = 120), NOW()
    ),
    (
        'Fungsi Eksponen dan Logaritma',
        'Memahami fungsi eksponen, persamaan dan pertidaksamaan eksponen, logaritma, dan aplikasinya.',
        'FEL', 3, (SELECT id FROM public.exam_types WHERE code = 'ALP' AND master_id = 120), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Aritmatika (AR) ──────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Sistem Bilangan',
        'Memahami jenis-jenis bilangan, sifat bilangan bulat, rasional, irasional, berpangkat, dan akar.',
        'SB', 3, (SELECT id FROM public.exam_types WHERE code = 'AR' AND master_id = 120), NOW()
    ),
    (
        'Bilangan Prima dan Faktorisasi',
        'Memahami bilangan prima, faktorisasi prima, FPB, KPK, keterbagian, dan operasi modulo.',
        'BPF', 3, (SELECT id FROM public.exam_types WHERE code = 'AR' AND master_id = 120), NOW()
    ),
    (
        'Barisan dan Deret',
        'Memahami barisan dan deret aritmatika dan geometri, deret tak hingga, dan pola bilangan.',
        'BD', 3, (SELECT id FROM public.exam_types WHERE code = 'AR' AND master_id = 120), NOW()
    ),
    (
        'Aritmatika Sosial',
        'Memahami untung-rugi, diskon, pajak, bunga tunggal dan majemuk, persentase, dan aplikasinya.',
        'AS', 3, (SELECT id FROM public.exam_types WHERE code = 'AR' AND master_id = 120), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Geometri (GE) ────────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Geometri Datar',
        'Memahami bangun datar (segitiga, segiempat, lingkaran), keliling, luas, dan aplikasinya.',
        'GD', 3, (SELECT id FROM public.exam_types WHERE code = 'GE' AND master_id = 120), NOW()
    ),
    (
        'Geometri Ruang',
        'Memahami bangun ruang (kubus, balok, prisma, limas, tabung, kerucut, bola), luas permukaan, dan volume.',
        'GR', 3, (SELECT id FROM public.exam_types WHERE code = 'GE' AND master_id = 120), NOW()
    ),
    (
        'Transformasi',
        'Memahami translasi, refleksi, rotasi, dilatasi, dan komposisi transformasi geometri.',
        'TR', 3, (SELECT id FROM public.exam_types WHERE code = 'GE' AND master_id = 120), NOW()
    ),
    (
        'Trigonometri',
        'Memahami perbandingan trigonometri, identitas, aturan sinus dan cosinus, sudut elevasi/depresi, dan grafik fungsi trigonometri.',
        'TG', 3, (SELECT id FROM public.exam_types WHERE code = 'GE' AND master_id = 120), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Statistika dan Peluang (STP) ────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Statistika',
        'Memahami pengumpulan dan penyajian data, ukuran pemusatan (mean, median, modus), ukuran penyebaran (jangkauan, kuartil, simpangan baku).',
        'ST', 3, (SELECT id FROM public.exam_types WHERE code = 'STP' AND master_id = 120), NOW()
    ),
    (
        'Peluang',
        'Memahami peluang kejadian, kejadian majemuk, peluang bersyarat, frekuensi harapan, permutasi, kombinasi, dan aplikasinya.',
        'PL2', 3, (SELECT id FROM public.exam_types WHERE code = 'STP' AND master_id = 120), NOW()
    ),
    (
        'Himpunan',
        'Memahami konsep himpunan, himpunan bagian, operasi himpunan, diagram Venn, dan aplikasinya.',
        'HM', 3, (SELECT id FROM public.exam_types WHERE code = 'STP' AND master_id = 120), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Matriks dan Aplikasi Matematika (MAM) ───────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Matriks',
        'Memahami konsep matriks, operasi matriks, transpose, determinan, invers, dan aplikasinya.',
        'MT', 3, (SELECT id FROM public.exam_types WHERE code = 'MAM' AND master_id = 120), NOW()
    ),
    (
        'Pengukuran dan Konversi Satuan',
        'Memahami satuan panjang, massa, waktu, luas, volume, dan konversi antar satuan.',
        'PKS', 3, (SELECT id FROM public.exam_types WHERE code = 'MAM' AND master_id = 120), NOW()
    ),
    (
        'Perbandingan',
        'Memahami perbandingan senilai, berbalik nilai, skala, perbandingan bertingkat, dan aplikasinya.',
        'PB', 3, (SELECT id FROM public.exam_types WHERE code = 'MAM' AND master_id = 120), NOW()
    ),
    (
        'Logika Matematika',
        'Memahami pernyataan, konjungsi, disjungsi, implikasi, biimplikasi, dan penarikan kesimpulan.',
        'LM', 3, (SELECT id FROM public.exam_types WHERE code = 'MAM' AND master_id = 120), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Kalkulus (KL) ────────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Limit Fungsi',
        'Memahami konsep limit, menghitung limit aljabar, bentuk tak tentu, dan limit di tak hingga.',
        'LF', 3, (SELECT id FROM public.exam_types WHERE code = 'KL' AND master_id = 120), NOW()
    ),
    (
        'Turunan',
        'Memahami konsep turunan, aturan turunan, aturan rantai, turunan fungsi khusus, dan turunan tingkat tinggi.',
        'TR2', 3, (SELECT id FROM public.exam_types WHERE code = 'KL' AND master_id = 120), NOW()
    ),
    (
        'Integral',
        'Memahami integral tak tentu, aturan integral, teknik substitusi, dan integral tentu.',
        'IN', 3, (SELECT id FROM public.exam_types WHERE code = 'KL' AND master_id = 120), NOW()
    ),
    (
        'Optimasi dan Pengukuran',
        'Memahami analisis fungsi dengan turunan, nilai ekstrem, optimasi, pengukuran luas dan volume dengan integral.',
        'OP', 3, (SELECT id FROM public.exam_types WHERE code = 'KL' AND master_id = 120), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ================================================================
-- STEP 2: UPDATE questions.question_topic_type
-- Mapping topic lama (kind=3) → topic baru (kind=3)
-- ================================================================

-- Barisan Bilangan → Barisan dan Deret
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'BD' AND sec.code = 'AR' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 131;

-- Fungsi Kuadrat → Persamaan Kuadrat
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PK' AND sec.code = 'ALP' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 126;

-- Persamaan Garis Lurus → Persamaan Linear
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PL' AND sec.code = 'ALP' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 130;

-- Identitas Aljabar → Operasi Aljabar Dasar
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'OAD' AND sec.code = 'ALP' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 127;

-- Kombinatorika → Peluang
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PL2' AND sec.code = 'STP' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 129;

-- Matriks dan Invers → Matriks
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'MT' AND sec.code = 'MAM' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 132;

-- Relasi dan Fungsi → Persamaan Linear
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PL' AND sec.code = 'ALP' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 125;

-- Teori Bilangan → Bilangan Prima dan Faktorisasi
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'BPF' AND sec.code = 'AR' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 128;

-- Kecepatan, Jarak, dan Waktu → Perbandingan
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PB' AND sec.code = 'MAM' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 134;

-- Perbandingan dan Proporsionalitas → Perbandingan
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PB' AND sec.code = 'MAM' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 133;

-- Perbandingan dan Estimasi Rentang → Perbandingan
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PB' AND sec.code = 'MAM' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 135;

-- Persentase → Aritmatika Sosial
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'AS' AND sec.code = 'AR' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 136;

-- Luas Bangun Datar → Geometri Datar
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'GD' AND sec.code = 'GE' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 137;

-- Luas dan Dimensi Relatif → Geometri Datar
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'GD' AND sec.code = 'GE' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 140;

-- Simetri → Transformasi
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'TR' AND sec.code = 'GE' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 138;

-- Peluang Gabungan dan Komplemen → Peluang
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PL2' AND sec.code = 'STP' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 141;

-- Rata-rata → Statistika
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'ST' AND sec.code = 'STP' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 142;

-- Aturan Rantai Turunan → Turunan
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'TR2' AND sec.code = 'KL' AND sec.master_id = 120
    ),
    edit_date = NOW()
WHERE question_topic_type = 144;


-- ================================================================
-- STEP 3: DELETE topic & section lama
-- ================================================================

-- Hapus semua topic lama (kind=3)
DELETE FROM public.exam_types
WHERE id IN (125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 140, 141, 142, 144);

-- Hapus semua section lama (kind=2)
DELETE FROM public.exam_types
WHERE id IN (121, 122, 123, 124, 143);


-- ================================================================
-- VERIFICATION (uncomment untuk cek hasil setelah COMMIT)
-- ================================================================

-- Cek struktur baru Pengetahuan Kuantitatif:
-- SELECT
--     et3.name AS mapel,
--     et2.id   AS section_id, et2.name AS section, et2.code AS section_code,
--     et.id    AS topic_id,   et.name  AS topic,   et.code  AS topic_code
-- FROM public.exam_types et
-- JOIN public.exam_types et2 ON et2.id = et.master_id
-- JOIN public.exam_types et3 ON et3.id = et2.master_id
-- WHERE et.kind = 3 AND et3.name = 'Pengetahuan Kuantitatif'
-- ORDER BY et2.name, et.name;

-- Cek tidak ada questions yang masih pakai topic lama:
-- SELECT COUNT(*) FROM public.questions
-- WHERE question_topic_type IN (125,126,127,128,129,130,131,132,133,134,135,136,137,138,140,141,142,144);
-- (harusnya = 0)

-- Cek distribusi questions per topic baru:
-- SELECT et.name AS topic, et2.name AS section, COUNT(q.id) AS total_questions
-- FROM public.questions q
-- JOIN public.exam_types et  ON et.id  = q.question_topic_type
-- JOIN public.exam_types et2 ON et2.id = et.master_id
-- JOIN public.exam_types et3 ON et3.id = et2.master_id
-- WHERE et3.name = 'Pengetahuan Kuantitatif'
-- GROUP BY et.name, et2.name
-- ORDER BY et2.name, et.name;

COMMIT;-- ================================================================
-- MIGRATION: Pengetahuan Kuantitatif - Full Restructure
-- Flow:
--   STEP 1: INSERT section & topic baru
--   STEP 2: UPDATE questions.question_topic_type (lama → baru)
--   STEP 3: DELETE topic & section lama
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1A: INSERT kind=2 (Section) BARU
-- master_id = 120 (Pengetahuan Kuantitatif)
-- ================================================================

INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Aljabar dan Persamaan',
        'Memahami operasi aljabar dasar, persamaan linear dan kuadrat, serta fungsi eksponen dan logaritma.',
        'ALP', 2, 120, NOW()
    ),
    (
        'Aritmatika',
        'Memahami sistem bilangan, bilangan prima, barisan dan deret, serta aritmatika sosial.',
        'AR', 2, 120, NOW()
    ),
    (
        'Geometri',
        'Memahami geometri datar, geometri ruang, transformasi, dan trigonometri.',
        'GE', 2, 120, NOW()
    ),
    (
        'Statistika dan Peluang',
        'Memahami statistika, peluang, dan himpunan serta aplikasinya.',
        'STP', 2, 120, NOW()
    ),
    (
        'Matriks dan Aplikasi Matematika',
        'Memahami matriks, pengukuran dan konversi satuan, perbandingan, dan logika matematika.',
        'MAM', 2, 120, NOW()
    ),
    (
        'Kalkulus',
        'Memahami limit fungsi, turunan, integral, dan aplikasinya dalam optimasi dan pengukuran.',
        'KL', 2, 120, NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ================================================================
-- STEP 1B: INSERT kind=3 (Topic) BARU
-- master_id = id section via subquery
-- CODE TOPIC: 2 HURUF SAJA
-- ================================================================

-- ── Section: Aljabar dan Persamaan (ALP) ──────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Operasi Aljabar Dasar',
        'Memahami variabel, operasi pada bentuk aljabar, pecahan aljabar, eksponen, akar, dan faktorisasi.',
        'OA', 3, (SELECT id FROM public.exam_types WHERE code = 'ALP' AND master_id = 120), NOW()
    ),
    (
        'Persamaan Linear',
        'Memahami persamaan dan pertidaksamaan linear, SPLDV, fungsi linear, dan persamaan garis lurus.',
        'PL', 3, (SELECT id FROM public.exam_types WHERE code = 'ALP' AND master_id = 120), NOW()
    ),
    (
        'Persamaan Kuadrat',
        'Memahami persamaan kuadrat, fungsi kuadrat, grafik parabola, dan pertidaksamaan kuadrat.',
        'PK', 3, (SELECT id FROM public.exam_types WHERE code = 'ALP' AND master_id = 120), NOW()
    ),
    (
        'Fungsi Eksponen dan Logaritma',
        'Memahami fungsi eksponen, persamaan dan pertidaksamaan eksponen, logaritma, dan aplikasinya.',
        'FE', 3, (SELECT id FROM public.exam_types WHERE code = 'ALP' AND master_id = 120), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Aritmatika (AR) ──────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Sistem Bilangan',
        'Memahami jenis-jenis bilangan, sifat bilangan bulat, rasional, irasional, berpangkat, dan akar.',
        'SB', 3, (SELECT id FROM public.exam_types WHERE code = 'AR' AND master_id = 120), NOW()
    ),
    (
        'Bilangan Prima dan Faktorisasi',
        'Memahami bilangan prima, faktorisasi prima, FPB, KPK, keterbagian, dan operasi modulo.',
        'BP', 3, (SELECT id FROM public.exam_types WHERE code = 'AR' AND master_id = 120), NOW()
    ),
    (
        'Barisan dan Deret',
        'Memahami barisan dan deret aritmatika dan geometri, deret tak hingga, dan pola bilangan.',
        'BD', 3, (SELECT id FROM public.exam_types WHERE code = 'AR' AND master_id = 120), NOW()
    ),
    (
        'Aritmatika Sosial',
        'Memahami untung-rugi, diskon, pajak, bunga tunggal dan majemuk, persentase, dan aplikasinya.',
        'AS', 3, (SELECT id FROM public.exam_types WHERE code = 'AR' AND master_id = 120), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Geometri (GE) ────────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Geometri Datar',
        'Memahami bangun datar (segitiga, segiempat, lingkaran), keliling, luas, dan aplikasinya.',
        'GD', 3, (SELECT id FROM public.exam_types WHERE code = 'GE' AND master_id = 120), NOW()
    ),
    (
        'Geometri Ruang',
        'Memahami bangun ruang (kubus, balok, prisma, limas, tabung, kerucut, bola), luas permukaan, dan volume.',
        'GR', 3, (SELECT id FROM public.exam_types WHERE code = 'GE' AND master_id = 120), NOW()
    ),
    (
        'Transformasi',
        'Memahami translasi, refleksi, rotasi, dilatasi, dan komposisi transformasi geometri.',
        'TR', 3, (SELECT id FROM public.exam_types WHERE code = 'GE' AND master_id = 120), NOW()
    ),
    (
        'Trigonometri',
        'Memahami perbandingan trigonometri, identitas, aturan sinus dan cosinus, sudut elevasi/depresi, dan grafik fungsi trigonometri.',
        'TG', 3, (SELECT id FROM public.exam_types WHERE code = 'GE' AND master_id = 120), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Statistika dan Peluang (STP) ────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Statistika',
        'Memahami pengumpulan dan penyajian data, ukuran pemusatan (mean, median, modus), ukuran penyebaran (jangkauan, kuartil, simpangan baku).',
        'ST', 3, (SELECT id FROM public.exam_types WHERE code = 'STP' AND master_id = 120), NOW()
    ),
    (
        'Peluang',
        'Memahami peluang kejadian, kejadian majemuk, peluang bersyarat, frekuensi harapan, permutasi, kombinasi, dan aplikasinya.',
        'PG', 3, (SELECT id FROM public.exam_types WHERE code = 'STP' AND master_id = 120), NOW()
    ),
    (
        'Himpunan',
        'Memahami konsep himpunan, himpunan bagian, operasi himpunan, diagram Venn, dan aplikasinya.',
        'HM', 3, (SELECT id FROM public.exam_types WHERE code = 'STP' AND master_id = 120), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Matriks dan Aplikasi Matematika (MAM) ───────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Matriks',
        'Memahami konsep matriks, operasi matriks, transpose, determinan, invers, dan aplikasinya.',
        'MT', 3, (SELECT id FROM public.exam_types WHERE code = 'MAM' AND master_id = 120), NOW()
    ),
    (
        'Pengukuran dan Konversi Satuan',
        'Memahami satuan panjang, massa, waktu, luas, volume, dan konversi antar satuan.',
        'PS', 3, (SELECT id FROM public.exam_types WHERE code = 'MAM' AND master_id = 120), NOW()
    ),
    (
        'Perbandingan',
        'Memahami perbandingan senilai, berbalik nilai, skala, perbandingan bertingkat, dan aplikasinya.',
        'PB', 3, (SELECT id FROM public.exam_types WHERE code = 'MAM' AND master_id = 120), NOW()
    ),
    (
        'Logika Matematika',
        'Memahami pernyataan, konjungsi, disjungsi, implikasi, biimplikasi, dan penarikan kesimpulan.',
        'LM', 3, (SELECT id FROM public.exam_types WHERE code = 'MAM' AND master_id = 120), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Kalkulus (KL) ────────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Limit Fungsi',
        'Memahami konsep limit, menghitung limit aljabar, bentuk tak tentu, dan limit di tak hingga.',
        'LF', 3, (SELECT id FROM public.exam_types WHERE code = 'KL' AND master_id = 120), NOW()
    ),
    (
        'Turunan',
        'Memahami konsep turunan, aturan turunan, aturan rantai, turunan fungsi khusus, dan turunan tingkat tinggi.',
        'TU', 3, (SELECT id FROM public.exam_types WHERE code = 'KL' AND master_id = 120), NOW()
    ),
    (
        'Integral',
        'Memahami integral tak tentu, aturan integral, teknik substitusi, dan integral tentu.',
        'IN', 3, (SELECT id FROM public.exam_types WHERE code = 'KL' AND master_id = 120), NOW()
    ),
    (
        'Optimasi dan Pengukuran',
        'Memahami analisis fungsi dengan turunan, nilai ekstrem, optimasi, pengukuran luas dan volume dengan integral.',
        'OP', 3, (SELECT id FROM public.exam_types WHERE code = 'KL' AND master_id = 120), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ================================================================
-- STEP 2: UPDATE questions.question_topic_type
-- Mapping topic lama (kind=3) → topic baru (kind=3)
-- ================================================================

-- Barisan Bilangan → Barisan dan Deret
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'BD' AND sec.code = 'AR' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 131;

-- Fungsi Kuadrat → Persamaan Kuadrat
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'PK' AND sec.code = 'ALP' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 126;

-- Persamaan Garis Lurus → Persamaan Linear
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'PL' AND sec.code = 'ALP' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 130;

-- Identitas Aljabar → Operasi Aljabar Dasar
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'OA' AND sec.code = 'ALP' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 127;

-- Kombinatorika → Peluang
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'PG' AND sec.code = 'STP' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 129;

-- Matriks dan Invers → Matriks
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'MT' AND sec.code = 'MAM' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 132;

-- Relasi dan Fungsi → Persamaan Linear
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'PL' AND sec.code = 'ALP' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 125;

-- Teori Bilangan → Bilangan Prima dan Faktorisasi
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'BP' AND sec.code = 'AR' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 128;

-- Kecepatan, Jarak, dan Waktu → Perbandingan
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'PB' AND sec.code = 'MAM' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 134;

-- Perbandingan dan Proporsionalitas → Perbandingan
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'PB' AND sec.code = 'MAM' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 133;

-- Perbandingan dan Estimasi Rentang → Perbandingan
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'PB' AND sec.code = 'MAM' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 135;

-- Persentase → Aritmatika Sosial
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'AS' AND sec.code = 'AR' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 136;

-- Luas Bangun Datar → Geometri Datar
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'GD' AND sec.code = 'GE' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 137;

-- Luas dan Dimensi Relatif → Geometri Datar
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'GD' AND sec.code = 'GE' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 140;

-- Simetri → Transformasi
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'TR' AND sec.code = 'GE' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 138;

-- Peluang Gabungan dan Komplemen → Peluang
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'PG' AND sec.code = 'STP' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 141;

-- Rata-rata → Statistika
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'ST' AND sec.code = 'STP' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 142;

-- Aturan Rantai Turunan → Turunan
UPDATE public.questions
SET question_topic_type = (SELECT et.id FROM public.exam_types et JOIN public.exam_types sec ON sec.id = et.master_id WHERE et.code = 'TU' AND sec.code = 'KL' AND sec.master_id = 120), edit_date = NOW()
WHERE question_topic_type = 144;


-- ================================================================
-- STEP 3: DELETE topic & section lama
-- ================================================================

-- Hapus semua topic lama (kind=3)
DELETE FROM public.exam_types WHERE id IN (125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 140, 141, 142, 144);

-- Hapus semua section lama (kind=2)
DELETE FROM public.exam_types WHERE id IN (121, 122, 123, 124, 143);


-- ================================================================
-- VERIFICATION (uncomment untuk cek hasil setelah COMMIT)
-- ================================================================

-- Cek struktur baru Pengetahuan Kuantitatif:
-- SELECT et3.name AS mapel, et2.id AS section_id, et2.name AS section, et2.code AS section_code, et.id AS topic_id, et.name AS topic, et.code AS topic_code
-- FROM public.exam_types et JOIN public.exam_types et2 ON et2.id = et.master_id JOIN public.exam_types et3 ON et3.id = et2.master_id
-- WHERE et.kind = 3 AND et3.name = 'Pengetahuan Kuantitatif' ORDER BY et2.name, et.name;

-- Cek tidak ada questions yang masih pakai topic lama:
-- SELECT COUNT(*) FROM public.questions WHERE question_topic_type IN (125,126,127,128,129,130,131,132,133,134,135,136,137,138,140,141,142,144);

-- Cek distribusi questions per topic baru:
-- SELECT et.name AS topic, et2.name AS section, COUNT(q.id) AS total_questions FROM public.questions q
-- JOIN public.exam_types et ON et.id = q.question_topic_type JOIN public.exam_types et2 ON et2.id = et.master_id JOIN public.exam_types et3 ON et3.id = et2.master_id
-- WHERE et3.name = 'Pengetahuan Kuantitatif' GROUP BY et.name, et2.name ORDER BY et2.name, et.name;

COMMIT;