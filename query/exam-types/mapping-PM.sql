-- ================================================================
-- MIGRATION: Penalaran Matematika - Full Restructure
-- Mapel: id=193, code='PM1'
-- Flow:
--   STEP 1: INSERT section & topic baru
--   STEP 2: UPDATE questions.question_topic_type (lama → baru)
--   STEP 3: DELETE topic & section lama
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1A: INSERT kind=2 (Section) BARU
-- master_id = 193 (Penalaran Matematika)
-- ================================================================

INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Aljabar',
        'Memahami pola bilangan, hubungan antar variabel, penalaran aljabar, dan operasi bilangan dalam berbagai konteks matematis.',
        'AL', 2, 193, NOW()
    ),
    (
        'Geometri Spasial',
        'Memahami dan menganalisis bangun datar, bangun ruang, transformasi geometri, serta pengukuran dan perbandingan dalam konteks spasial.',
        'GS', 2, 193, NOW()
    ),
    (
        'Statistika dan Probabilitas',
        'Menganalisis dan menginterpretasi data, memahami ukuran pemusatan dan penyebaran, serta menalar peluang kejadian.',
        'SP', 2, 193, NOW()
    ),
    (
        'Matematika Sosial',
        'Menerapkan konsep matematika dalam konteks sosial, mencakup aritmatika sosial, kecepatan-jarak-waktu, serta proporsi dan rasio.',
        'MS', 2, 193, NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ================================================================
-- STEP 1B: INSERT kind=3 (Topic) BARU
-- master_id = id section via subquery
-- ================================================================

-- ── Section: Aljabar (AL) ────────────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Pola Bilangan',
        'Memahami dan menganalisis pola bilangan aritmatika, geometri, khusus, dan fibonacci, termasuk deret bilangan dan prediksi suku berikutnya.',
        'PB', 3, (SELECT id FROM public.exam_types WHERE code = 'AL' AND master_id = 193), NOW()
    ),
    (
        'Hubungan Antar Variabel',
        'Memahami hubungan linear, kuadratik, dan proporsional antar variabel, serta menganalisis grafik, tabel, dan korelasi data.',
        'HV', 3, (SELECT id FROM public.exam_types WHERE code = 'AL' AND master_id = 193), NOW()
    ),
    (
        'Aljabar',
        'Memahami penalaran aljabar, menyusun dan menyelesaikan persamaan dan pertidaksamaan, sistem persamaan, fungsi, serta eksponen dan logaritma.',
        'AJ', 3, (SELECT id FROM public.exam_types WHERE code = 'AL' AND master_id = 193), NOW()
    ),
    (
        'Operasi Bilangan',
        'Memahami urutan bilangan, operasi bilangan bulat, pecahan dan desimal, bilangan berpangkat, akar, serta keterbagian dan sifat bilangan.',
        'OB', 3, (SELECT id FROM public.exam_types WHERE code = 'AL' AND master_id = 193), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Geometri Spasial (GS) ───────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Bangun Datar',
        'Memahami dan menganalisis segitiga, segiempat, lingkaran, kesebangunan, kekongruenan, teorema Pythagoras, dan optimasi geometri datar.',
        'BD', 3, (SELECT id FROM public.exam_types WHERE code = 'GS' AND master_id = 193), NOW()
    ),
    (
        'Bangun Ruang',
        'Memahami dan menganalisis volume, luas permukaan, diagonal dan jarak, bangun ruang gabungan, serta irisan dan potongan bangun ruang.',
        'BR', 3, (SELECT id FROM public.exam_types WHERE code = 'GS' AND master_id = 193), NOW()
    ),
    (
        'Transformasi',
        'Memahami penalaran spasial, rotasi, refleksi, visualisasi bangun ruang, pola geometri, kongruensi, dan penalaran koordinat.',
        'TR', 3, (SELECT id FROM public.exam_types WHERE code = 'GS' AND master_id = 193), NOW()
    ),
    (
        'Pengukuran dan Perbandingan',
        'Memahami estimasi pengukuran, perbandingan panjang, luas, dan volume, serta skala, proporsi, dan rasio dalam geometri.',
        'PP', 3, (SELECT id FROM public.exam_types WHERE code = 'GS' AND master_id = 193), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Statistika dan Probabilitas (SP) ────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Analisis Data',
        'Membaca dan menginterpretasi berbagai penyajian data: tabel, grafik batang, grafik garis, diagram lingkaran, histogram, scatter plot, dan analisis multi-data.',
        'AD', 3, (SELECT id FROM public.exam_types WHERE code = 'SP' AND master_id = 193), NOW()
    ),
    (
        'Ukuran Pemusatan dan Penyebaran',
        'Memahami dan menalar mean, median, modus, jangkauan, kuartil, box plot, variansi, dan standar deviasi dalam konteks data.',
        'UP', 3, (SELECT id FROM public.exam_types WHERE code = 'SP' AND master_id = 193), NOW()
    ),
    (
        'Peluang',
        'Memahami penalaran peluang sederhana dan majemuk, peluang bersyarat, nilai harapan, kombinatorika, serta paradoks dan kesalahan umum probabilitas.',
        'PL', 3, (SELECT id FROM public.exam_types WHERE code = 'SP' AND master_id = 193), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Matematika Sosial (MS) ──────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Aritmatika Sosial dan Aplikasi',
        'Memahami penalaran persentase, diskon, pajak, bunga, investasi, keuntungan-rugi, dan sistem angsuran dalam konteks kehidupan sehari-hari.',
        'AS', 3, (SELECT id FROM public.exam_types WHERE code = 'MS' AND master_id = 193), NOW()
    ),
    (
        'Kecepatan, Jarak, dan Waktu',
        'Memahami penalaran kecepatan rata-rata, gerak searah dan berlawanan arah, debit dan volume, serta pekerjaan dan waktu.',
        'KJ', 3, (SELECT id FROM public.exam_types WHERE code = 'MS' AND master_id = 193), NOW()
    ),
    (
        'Penalaran Proporsi dan Rasio',
        'Memahami perbandingan senilai dan berbalik nilai, campuran dan konsentrasi, pembagian proporsional, serta penalaran skala dan model.',
        'PR', 3, (SELECT id FROM public.exam_types WHERE code = 'MS' AND master_id = 193), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ================================================================
-- STEP 2: UPDATE questions.question_topic_type
-- Mapping topic lama → topic baru (via subquery dinamis)
--
-- id=201 Fungsi Linear    → Aljabar (AJ)                        [AL]
-- id=198 Kecepatan        → Kecepatan, Jarak, dan Waktu (KJ)    [MS]
-- id=199 Kelipatan        → Operasi Bilangan (OB)               [AL]
-- id=195 Operasi Dasar    → Operasi Bilangan (OB)               [AL]
-- id=196 Perbandingan     → Penalaran Proporsi dan Rasio (PR)   [MS]
-- id=197 Persentase       → Aritmatika Sosial dan Aplikasi (AS) [MS]
-- id=205 Bangun Ruang     → Bangun Ruang (BR)                   [GS]
-- id=206 Jarak pd Bidang  → Bangun Ruang (BR)                   [GS]
-- id=204 Lingkaran        → Bangun Datar (BD)                   [GS]
-- id=203 Segitiga         → Bangun Datar (BD)                   [GS]
-- id=208 Rata-rata        → Ukuran Pemusatan dan Penyebaran (UP) [SP]
-- ================================================================

-- Fungsi Linear → Aljabar
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'AJ' AND sec.code = 'AL' AND sec.master_id = 193
    ),
    edit_date = NOW()
WHERE question_topic_type = 201;

-- Kecepatan → Kecepatan, Jarak, dan Waktu
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'KJ' AND sec.code = 'MS' AND sec.master_id = 193
    ),
    edit_date = NOW()
WHERE question_topic_type = 198;

-- Kelipatan → Operasi Bilangan
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'OB' AND sec.code = 'AL' AND sec.master_id = 193
    ),
    edit_date = NOW()
WHERE question_topic_type = 199;

-- Operasi Dasar → Operasi Bilangan
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'OB' AND sec.code = 'AL' AND sec.master_id = 193
    ),
    edit_date = NOW()
WHERE question_topic_type = 195;

-- Perbandingan → Penalaran Proporsi dan Rasio
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PR' AND sec.code = 'MS' AND sec.master_id = 193
    ),
    edit_date = NOW()
WHERE question_topic_type = 196;

-- Persentase → Aritmatika Sosial dan Aplikasi
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'AS' AND sec.code = 'MS' AND sec.master_id = 193
    ),
    edit_date = NOW()
WHERE question_topic_type = 197;

-- Bangun Ruang → Bangun Ruang
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'BR' AND sec.code = 'GS' AND sec.master_id = 193
    ),
    edit_date = NOW()
WHERE question_topic_type = 205;

-- Jarak pada Bidang → Bangun Ruang
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'BR' AND sec.code = 'GS' AND sec.master_id = 193
    ),
    edit_date = NOW()
WHERE question_topic_type = 206;

-- Lingkaran → Bangun Datar
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'BD' AND sec.code = 'GS' AND sec.master_id = 193
    ),
    edit_date = NOW()
WHERE question_topic_type = 204;

-- Segitiga → Bangun Datar
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'BD' AND sec.code = 'GS' AND sec.master_id = 193
    ),
    edit_date = NOW()
WHERE question_topic_type = 203;

-- Rata-rata → Ukuran Pemusatan dan Penyebaran
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'UP' AND sec.code = 'SP' AND sec.master_id = 193
    ),
    edit_date = NOW()
WHERE question_topic_type = 208;


-- ================================================================
-- STEP 3: DELETE topic & section lama
-- Hapus kind=3 (topic) dulu, baru kind=2 (section)
-- ================================================================

-- Hapus semua topic lama (kind=3)
DELETE FROM public.exam_types
WHERE id IN (201, 198, 199, 195, 196, 197, 205, 206, 204, 203, 208);

-- Hapus semua section lama (kind=2)
DELETE FROM public.exam_types
WHERE id IN (200, 194, 202, 207);


-- ================================================================
-- VERIFICATION (uncomment untuk cek hasil setelah COMMIT)
-- ================================================================

-- Cek struktur baru Penalaran Matematika:
-- SELECT
--     et3.name AS mapel,
--     et2.id   AS section_id, et2.name AS section, et2.code AS section_code,
--     et.id    AS topic_id,   et.name  AS topic,   et.code  AS topic_code
-- FROM public.exam_types et
-- JOIN public.exam_types et2 ON et2.id = et.master_id
-- JOIN public.exam_types et3 ON et3.id = et2.master_id
-- WHERE et.kind = 3 AND et3.name = 'Penalaran Matematika'
-- ORDER BY et2.name, et.name;

-- Cek tidak ada questions yang masih pakai topic lama:
-- SELECT COUNT(*) FROM public.questions
-- WHERE question_topic_type IN (201,198,199,195,196,197,205,206,204,203,208);
-- (harusnya = 0)

-- Cek distribusi questions per topic baru:
-- SELECT et.name AS topic, et2.name AS section, COUNT(q.id) AS total_questions
-- FROM public.questions q
-- JOIN public.exam_types et  ON et.id  = q.question_topic_type
-- JOIN public.exam_types et2 ON et2.id = et.master_id
-- JOIN public.exam_types et3 ON et3.id = et2.master_id
-- WHERE et3.name = 'Penalaran Matematika'
-- GROUP BY et.name, et2.name
-- ORDER BY et2.name, et.name;

COMMIT;