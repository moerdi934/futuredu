-- ================================================================
-- MIGRATION: Literasi Bahasa Indonesia - Full Restructure
-- Flow:
--   STEP 1: INSERT section & topic baru
--   STEP 2: UPDATE questions.question_topic_type (lama → baru)
--   STEP 3: DELETE topic & section lama
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1A: INSERT kind=2 (Section) BARU
-- master_id = 209 (Literasi Bahasa Indonesia)
-- ================================================================

INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Struktur Teks',
        'Memahami berbagai jenis dan struktur paragraf dalam teks, termasuk narasi, deskripsi, persuasi, eksposisi, dan argumentasi.',
        'ST', 2, 209, NOW()
    ),
    (
        'Analisis Bacaan',
        'Menganalisis dan memahami berbagai jenis teks bacaan secara mendalam, termasuk biografi, eksplanasi, editorial, ulasan, dan bacaan umum.',
        'AB', 2, 209, NOW()
    ),
    (
        'Sastra',
        'Memahami dan menganalisis karya sastra Indonesia, meliputi novel, cerpen, puisi, majas, diksi, dan referensi silang.',
        'SA', 2, 209, NOW()
    ),
    (
        'PUEBI',
        'Memahami dan menerapkan Pedoman Umum Ejaan Bahasa Indonesia, mencakup frasa, morfologi, sintaksis, huruf kapital, penulisan kata, dan tanda baca.',
        'PU', 2, 209, NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ================================================================
-- STEP 1B: INSERT kind=3 (Topic) BARU
-- master_id = id section via subquery
-- ================================================================

-- ── Section: Struktur Teks (ST) ──────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Struktur Paragraf',
        'Memahami pengertian, syarat, dan jenis-jenis paragraf berdasarkan letak kalimat utama, serta menentukan ide pokok, ide pendukung, dan kepanduan paragraf.',
        'SP', 3, (SELECT id FROM public.exam_types WHERE code = 'ST' AND master_id = 209), NOW()
    ),
    (
        'Narasi',
        'Memahami karakteristik paragraf narasi, membedakan narasi ekspositoris dan sugestif, serta menganalisis unsur, alur, tema, dan nilai dalam teks narasi.',
        'NA', 3, (SELECT id FROM public.exam_types WHERE code = 'ST' AND master_id = 209), NOW()
    ),
    (
        'Deskripsi',
        'Memahami paragraf deskripsi, pola pengembangan spasial dan sudut pandang, serta mengidentifikasi objek, ciri, sikap, dan tujuan penulis dalam teks deskripsi.',
        'DE', 3, (SELECT id FROM public.exam_types WHERE code = 'ST' AND master_id = 209), NOW()
    ),
    (
        'Persuasi',
        'Memahami paragraf persuasi, teknik-teknik persuasi, serta mengidentifikasi tujuan, ajakan, fakta, dan opini dalam teks persuasi.',
        'PE', 3, (SELECT id FROM public.exam_types WHERE code = 'ST' AND master_id = 209), NOW()
    ),
    (
        'Eksposisi',
        'Memahami jenis-jenis paragraf eksposisi, pola sebab-akibat dalam teks eksplanatif, serta menganalisis pola pengembangan dan informasi eksplisit dalam eksposisi.',
        'EK', 3, (SELECT id FROM public.exam_types WHERE code = 'ST' AND master_id = 209), NOW()
    ),
    (
        'Argumentasi',
        'Memahami struktur dan pola argumentasi, menganalisis kekuatan dan kelemahan argumen, serta mengenali logical fallacies dan struktur sintaksis argumentatif.',
        'AR', 3, (SELECT id FROM public.exam_types WHERE code = 'ST' AND master_id = 209), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Analisis Bacaan (AB) ────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Teks Biografi',
        'Memahami struktur dan unsur teks biografi, menganalisis informasi faktual tokoh, kronologi kehidupan, serta nilai moral, sosial, dan inspiratif dalam biografi.',
        'TB', 3, (SELECT id FROM public.exam_types WHERE code = 'AB' AND master_id = 209), NOW()
    ),
    (
        'Eksplanasi',
        'Memahami teks eksplanasi fenomena alam dan sosial, mengidentifikasi pola sebab-akibat, serta mencari informasi relevan dalam teks eksplanasi.',
        'EX', 3, (SELECT id FROM public.exam_types WHERE code = 'AB' AND master_id = 209), NOW()
    ),
    (
        'Editorial',
        'Memahami teks editorial, membedakan fakta dan opini, menganalisis sikap, tujuan, dan keberpihakan penulis, serta menentukan judul yang sesuai.',
        'ED', 3, (SELECT id FROM public.exam_types WHERE code = 'AB' AND master_id = 209), NOW()
    ),
    (
        'Ulasan',
        'Memahami teks ulasan, menganalisis kelebihan dan kelemahan karya secara objektif, serta merumuskan rekomendasi berdasarkan penilaian karya.',
        'UL', 3, (SELECT id FROM public.exam_types WHERE code = 'AB' AND master_id = 209), NOW()
    ),
    (
        'Pemahaman Bacaan Umum',
        'Memahami bacaan secara literal, inferensial, dan evaluatif; mencari informasi eksplisit dan relevan; menyimpulkan isi; menentukan makna kontekstual kata; serta menyarankan solusi.',
        'PB', 3, (SELECT id FROM public.exam_types WHERE code = 'AB' AND master_id = 209), NOW()
    ),
    (
        'Analisis Bacaan Lanjutan',
        'Menganalisis teks secara kritis, menghubungkan dan menilai informasi antarparagraf, menentukan pilihan dan kesimpulan berdasarkan bacaan, serta menganalisis struktur teks kompleks.',
        'AL', 3, (SELECT id FROM public.exam_types WHERE code = 'AB' AND master_id = 209), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: Sastra (SA) ─────────────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Novel',
        'Memahami unsur intrinsik novel (sudut pandang, alur, tema, amanat, latar, penokohan, gaya bahasa) dan unsur ekstrinsik serta nilai-nilai kehidupan dalam novel.',
        'NV', 3, (SELECT id FROM public.exam_types WHERE code = 'SA' AND master_id = 209), NOW()
    ),
    (
        'Cerpen',
        'Memahami unsur intrinsik dan ekstrinsik cerpen, menentukan tema, nilai moral, sosial, budaya, pendidikan, religi, dan estetika dalam cerita pendek.',
        'CP', 3, (SELECT id FROM public.exam_types WHERE code = 'SA' AND master_id = 209), NOW()
    ),
    (
        'Puisi',
        'Memahami jenis puisi baru dan lama, menganalisis unsur fisik dan batin puisi, serta menentukan tema, amanat, dan nilai dalam teks puisi.',
        'PS', 3, (SELECT id FROM public.exam_types WHERE code = 'SA' AND master_id = 209), NOW()
    ),
    (
        'Majas',
        'Memahami jenis-jenis majas (perbandingan, pertentangan, sindiran, penegasan) dan mengidentifikasi fungsi majas dalam konteks teks sastra.',
        'MJ', 3, (SELECT id FROM public.exam_types WHERE code = 'SA' AND master_id = 209), NOW()
    ),
    (
        'Diksi',
        'Memahami makna denotatif dan konotatif, sinonim, antonim, homonim, makna kontekstual kata, serta kata berimbuhan dan maknanya dalam teks.',
        'DK', 3, (SELECT id FROM public.exam_types WHERE code = 'SA' AND master_id = 209), NOW()
    ),
    (
        'Referensi Silang',
        'Memahami referensi anaforis dan kataforis, pronomina sebagai alat referensi, repetisi dan sinonim untuk kohesi, serta mengidentifikasi rujukan dalam teks sastra.',
        'RS', 3, (SELECT id FROM public.exam_types WHERE code = 'SA' AND master_id = 209), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ── Section: PUEBI (PU) ──────────────────────────────────────────
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date)
VALUES
    (
        'Frasa',
        'Memahami jenis-jenis frasa berdasarkan kategori dan hubungan, mengidentifikasi struktur frasa, serta membedakan frasa yang benar dan salah dalam kalimat.',
        'FR', 3, (SELECT id FROM public.exam_types WHERE code = 'PU' AND master_id = 209), NOW()
    ),
    (
        'Morfologi dan Semantik',
        'Memahami proses morfologis (afiksasi, reduplikasi), jenis-jenis makna kata, serta menganalisis dan memperbaiki kesalahan morfologis dan semantik.',
        'MS', 3, (SELECT id FROM public.exam_types WHERE code = 'PU' AND master_id = 209), NOW()
    ),
    (
        'Sintaksis',
        'Memahami fungsi dan kategori sintaksis, syarat kalimat efektif, penggunaan konjungsi yang tepat, serta menganalisis dan memperbaiki kalimat tidak efektif.',
        'SX', 3, (SELECT id FROM public.exam_types WHERE code = 'PU' AND master_id = 209), NOW()
    ),
    (
        'Huruf Kapital dan Huruf Miring',
        'Memahami dan menerapkan aturan penggunaan huruf kapital dan huruf miring sesuai PUEBI, serta mengidentifikasi dan memperbaiki kesalahan penulisan huruf.',
        'HK', 3, (SELECT id FROM public.exam_types WHERE code = 'PU' AND master_id = 209), NOW()
    ),
    (
        'Penulisan Kata',
        'Memahami aturan penulisan kata dasar, kata berimbuhan, bentuk terikat, kata ulang, gabungan kata, partikel, singkatan, dan akronim sesuai PUEBI.',
        'PW', 3, (SELECT id FROM public.exam_types WHERE code = 'PU' AND master_id = 209), NOW()
    ),
    (
        'Tanda Baca',
        'Memahami fungsi dan aturan penggunaan berbagai tanda baca (titik, koma, titik koma, petik, hubung, pisah, titik dua, elipsis), serta menganalisis dan memperbaiki kesalahan tanda baca.',
        'TDB', 3, (SELECT id FROM public.exam_types WHERE code = 'PU' AND master_id = 209), NOW()
    )
ON CONFLICT (master_id, code) DO UPDATE SET
    name        = EXCLUDED.name,
    description = EXCLUDED.description,
    edit_date   = NOW();


-- ================================================================
-- STEP 2: UPDATE questions.question_topic_type
-- Mapping topic lama (kind=3) → topic baru (kind=3)
--
-- id=211 Gagasan Utama    → Struktur Paragraf      (SP, under ST)
-- id=212 Informasi Rinci  → Pemahaman Bacaan Umum  (PB, under AB)
-- id=213 Relevansi        → Analisis Bacaan Lanjutan (AL, under AB)
-- id=214 Sikap dan Dampak → Editorial              (ED, under AB)
-- id=216 Perbedaan Konsep → Analisis Bacaan Lanjutan (AL, under AB)
-- id=217 Logika           → Argumentasi            (AR, under ST)
-- id=223 Penerapan        → Pemahaman Bacaan Umum  (PB, under AB)
-- id=224 Tindakan         → Analisis Bacaan Lanjutan (AL, under AB)
-- id=225 Solusi           → Pemahaman Bacaan Umum  (PB, under AB)
-- id=220 Ejaan            → Penulisan Kata         (PW, under PU)
-- id=221 Konjungsi        → Sintaksis              (SX, under PU)
-- ================================================================

-- Gagasan Utama → Struktur Paragraf
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'SP' AND sec.code = 'ST' AND sec.master_id = 209
    ),
    edit_date = NOW()
WHERE question_topic_type = 211;

-- Informasi Rinci → Pemahaman Bacaan Umum
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PB' AND sec.code = 'AB' AND sec.master_id = 209
    ),
    edit_date = NOW()
WHERE question_topic_type = 212;

-- Relevansi → Analisis Bacaan Lanjutan
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'AL' AND sec.code = 'AB' AND sec.master_id = 209
    ),
    edit_date = NOW()
WHERE question_topic_type = 213;

-- Sikap dan Dampak → Editorial
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'ED' AND sec.code = 'AB' AND sec.master_id = 209
    ),
    edit_date = NOW()
WHERE question_topic_type = 214;

-- Perbedaan Konsep → Analisis Bacaan Lanjutan
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'AL' AND sec.code = 'AB' AND sec.master_id = 209
    ),
    edit_date = NOW()
WHERE question_topic_type = 216;

-- Logika → Argumentasi
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'AR' AND sec.code = 'ST' AND sec.master_id = 209
    ),
    edit_date = NOW()
WHERE question_topic_type = 217;

-- Penerapan → Pemahaman Bacaan Umum
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PB' AND sec.code = 'AB' AND sec.master_id = 209
    ),
    edit_date = NOW()
WHERE question_topic_type = 223;

-- Tindakan → Analisis Bacaan Lanjutan
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'AL' AND sec.code = 'AB' AND sec.master_id = 209
    ),
    edit_date = NOW()
WHERE question_topic_type = 224;

-- Solusi → Pemahaman Bacaan Umum
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PB' AND sec.code = 'AB' AND sec.master_id = 209
    ),
    edit_date = NOW()
WHERE question_topic_type = 225;

-- Ejaan → Penulisan Kata
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PW' AND sec.code = 'PU' AND sec.master_id = 209
    ),
    edit_date = NOW()
WHERE question_topic_type = 220;

-- Konjungsi → Sintaksis
UPDATE public.questions
SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'SX' AND sec.code = 'PU' AND sec.master_id = 209
    ),
    edit_date = NOW()
WHERE question_topic_type = 221;


-- ================================================================
-- STEP 3: DELETE topic & section lama
-- Urutan: hapus kind=3 (topic) dulu, baru kind=2 (section)
-- karena topic punya foreign key ke section via master_id
-- ================================================================

-- Hapus semua topic lama (kind=3)
DELETE FROM public.exam_types
WHERE id IN (211, 212, 213, 214, 216, 217, 220, 221, 223, 224, 225);

-- Hapus semua section lama (kind=2)
DELETE FROM public.exam_types
WHERE id IN (210, 215, 218, 222);


-- ================================================================
-- VERIFICATION (uncomment untuk cek hasil setelah COMMIT)
-- ================================================================

-- Cek struktur baru Literasi Bahasa Indonesia:
-- SELECT
--     et3.name AS mapel,
--     et2.id   AS section_id, et2.name AS section, et2.code AS section_code,
--     et.id    AS topic_id,   et.name  AS topic,   et.code  AS topic_code
-- FROM public.exam_types et
-- JOIN public.exam_types et2 ON et2.id = et.master_id
-- JOIN public.exam_types et3 ON et3.id = et2.master_id
-- WHERE et.kind = 3 AND et3.name = 'Literasi Bahasa Indonesia'
-- ORDER BY et2.name, et.name;

-- Cek tidak ada questions yang masih pakai topic lama:
-- SELECT COUNT(*) FROM public.questions
-- WHERE question_topic_type IN (211,212,213,214,216,217,220,221,223,224,225);
-- (harusnya = 0)

-- Cek distribusi questions per topic baru:
-- SELECT et.name AS topic, et2.name AS section, COUNT(q.id) AS total_questions
-- FROM public.questions q
-- JOIN public.exam_types et  ON et.id  = q.question_topic_type
-- JOIN public.exam_types et2 ON et2.id = et.master_id
-- JOIN public.exam_types et3 ON et3.id = et2.master_id
-- WHERE et3.name = 'Literasi Bahasa Indonesia'
-- GROUP BY et.name, et2.name
-- ORDER BY et2.name, et.name;

COMMIT;