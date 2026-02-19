-- ================================================================
-- MIGRATION: Pemahaman Bacaan dan Menulis (id=160, code=PBM)
-- Flow:
--   STEP 1: INSERT section & topic baru
--   STEP 2: UPDATE questions.question_topic_type (lama ke baru)
--   STEP 3: DELETE topic & section lama
-- ================================================================

BEGIN;

-- ================================================================
-- STEP 1A: INSERT kind=2 (Section) BARU
-- master_id = 160
-- ================================================================

INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date) VALUES
('Kaidah Dasar Penulisan', 'Memahami dan menerapkan kaidah dasar penulisan bahasa Indonesia yang baik, mencakup kalimat efektif, kata baku, kalimat tunggal, kalimat majemuk, kalimat aktif-pasif, serta kalimat langsung dan tidak langsung.', 'KDP', 2, 160, NOW()),
('PUEBI', 'Memahami dan menerapkan Pedoman Umum Ejaan Bahasa Indonesia, mencakup huruf kapital, huruf miring, kata berimbuhan, kata ulang, akronim, dan kata ganti.', 'PU', 2, 160, NOW()),
('Tanda Baca', 'Memahami fungsi dan aturan penggunaan berbagai tanda baca sesuai PUEBI, mulai dari tanda titik, koma, titik koma, titik dua, tanda hubung, hingga tanda petik dan garis miring.', 'TB', 2, 160, NOW()),
('Struktur Wacana dan Pembentukan Istilah', 'Memahami struktur wacana meliputi paragraf, kohesi, dan koherensi, serta proses pembentukan dan pembakuan istilah dalam bahasa Indonesia melalui penerjemahan, penyerapan, dan perekaciptaan.', 'SWI', 2, 160, NOW())
ON CONFLICT (master_id, code) DO UPDATE SET
    name = EXCLUDED.name, description = EXCLUDED.description, edit_date = NOW();


-- ================================================================
-- STEP 1B: INSERT kind=3 (Topic) BARU
-- ================================================================

-- Kaidah Dasar Penulisan (KDP)
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date) VALUES
('Kalimat Efektif', 'Memahami syarat kalimat efektif (kesatuan, kehematan, keparalelan, kelogisan, kepaduan, ketepatan), menghindari kalimat ambigu, dan menerapkannya dalam konteks penulisan formal.', 'KE', 3, (SELECT id FROM public.exam_types WHERE code = 'KDP' AND master_id = 160), NOW()),
('Kata Baku', 'Memahami pengertian, ciri-ciri, dan karakteristik kata baku dan tidak baku, termasuk kata serapan yang benar, serta strategi mengenali kata baku dalam soal.', 'KB', 3, (SELECT id FROM public.exam_types WHERE code = 'KDP' AND master_id = 160), NOW()),
('Kalimat Tunggal', 'Memahami struktur dan unsur-unsur kalimat tunggal (S, P, O, Pel, K), pola-pola dasar kalimat tunggal, serta teknik menganalisis kelengkapan unsur kalimat.', 'KT', 3, (SELECT id FROM public.exam_types WHERE code = 'KDP' AND master_id = 160), NOW()),
('Kalimat Majemuk', 'Memahami jenis-jenis kalimat majemuk (setara, bertingkat, campuran), kata penghubung antarklausa, serta teknik mengidentifikasi dan menganalisis hubungan antarklausa.', 'KM', 3, (SELECT id FROM public.exam_types WHERE code = 'KDP' AND master_id = 160), NOW()),
('Kalimat Aktif dan Pasif', 'Memahami karakteristik kalimat aktif (transitif dan intransitif) dan kalimat pasif (biasa dan zero), serta teknik transformasi antara kalimat aktif dan pasif.', 'KAP', 3, (SELECT id FROM public.exam_types WHERE code = 'KDP' AND master_id = 160), NOW()),
('Kalimat Langsung dan Tidak Langsung', 'Memahami pengertian, ciri-ciri, dan pola penulisan kalimat langsung dan tidak langsung, serta teknik transformasi antara kedua jenis kalimat tersebut.', 'KLT', 3, (SELECT id FROM public.exam_types WHERE code = 'KDP' AND master_id = 160), NOW())
ON CONFLICT (master_id, code) DO UPDATE SET
    name = EXCLUDED.name, description = EXCLUDED.description, edit_date = NOW();


-- PUEBI (PU)
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date) VALUES
('Huruf Kapital', 'Memahami aturan huruf kapital sesuai PUEBI pada awal kalimat, nama diri, gelar, jabatan, nama tempat, peristiwa, judul, dan singkatan, serta menghindari kesalahan umum.', 'HK', 3, (SELECT id FROM public.exam_types WHERE code = 'PU' AND master_id = 160), NOW()),
('Huruf Miring, Tebal, Diftong, dan Gabungan Konsonan', 'Memahami penggunaan huruf miring dan tebal, penulisan diftong (ai, au, ei, oi), dan gabungan huruf konsonan (kh, ng, ny, sy) yang benar sesuai PUEBI.', 'HM', 3, (SELECT id FROM public.exam_types WHERE code = 'PU' AND master_id = 160), NOW()),
('Kata Dasar, Berimbuhan, dan Bentuk Terikat', 'Memahami penulisan kata dasar, kata berimbuhan (prefiks, sufiks, infiks, konfiks), hukum K-T-S-P, pengecualian peluluhan, serta penulisan bentuk terikat sesuai PUEBI.', 'KDB', 3, (SELECT id FROM public.exam_types WHERE code = 'PU' AND master_id = 160), NOW()),
('Kata Ulang dan Gabungan Kata', 'Memahami jenis-jenis kata ulang (utuh, sebagian, berubah bunyi, berimbuhan) dan penulisan gabungan kata (terpisah, serangkai, tanda hubung) sesuai PUEBI.', 'KUG', 3, (SELECT id FROM public.exam_types WHERE code = 'PU' AND master_id = 160), NOW()),
('Akronim', 'Memahami perbedaan singkatan dan akronim, penulisan singkatan nama diri dan bukan nama diri, lambang, satuan, mata uang, serta penulisan bilangan dengan huruf dan angka.', 'AK', 3, (SELECT id FROM public.exam_types WHERE code = 'PU' AND master_id = 160), NOW()),
('Kata Ganti', 'Memahami penulisan kata ganti (ku-, kau-, -ku, -mu, -nya), kata sandang (si, sang), partikel (-lah, -kah, -pun, per), suku kata, dan aturan pemenggalan kata.', 'KG', 3, (SELECT id FROM public.exam_types WHERE code = 'PU' AND master_id = 160), NOW())
ON CONFLICT (master_id, code) DO UPDATE SET
    name = EXCLUDED.name, description = EXCLUDED.description, edit_date = NOW();


-- Tanda Baca (TB)
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date) VALUES
('Tanda Titik', 'Memahami penggunaan tanda titik di akhir kalimat, penomoran, pemisah waktu dan bilangan ribuan, daftar pustaka, serta konteks yang tidak memerlukan tanda titik.', 'TT', 3, (SELECT id FROM public.exam_types WHERE code = 'TB' AND master_id = 160), NOW()),
('Tanda Koma', 'Memahami penggunaan tanda koma dalam pemerincian, kalimat majemuk, sapaan, petikan langsung, alamat, tanggal, daftar pustaka, aposisi, serta menghindari kesalahan umum.', 'TK', 3, (SELECT id FROM public.exam_types WHERE code = 'TB' AND master_id = 160), NOW()),
('Tanda Titik Koma dan Titik Dua', 'Memahami penggunaan tanda titik koma sebagai pengganti kata penghubung dan pemisah perincian, serta tanda titik dua setelah pernyataan lengkap dan dalam konteks naskah/referensi.', 'TKD', 3, (SELECT id FROM public.exam_types WHERE code = 'TB' AND master_id = 160), NOW()),
('Tanda Hubung dan Tanda Pisah', 'Memahami fungsi tanda hubung untuk penggalan kata, kata ulang, dan perangkaian dengan singkatan/angka, serta tanda pisah untuk penyisipan keterangan dan penanda rentang.', 'THP', 3, (SELECT id FROM public.exam_types WHERE code = 'TB' AND master_id = 160), NOW()),
('Tanda Tanya, Seru, dan Elipsis', 'Memahami penggunaan tanda tanya di akhir kalimat tanya dan dalam kurung untuk keraguan, tanda seru untuk seruan dan perintah, serta tanda elipsis untuk bagian yang dihilangkan.', 'TSE', 3, (SELECT id FROM public.exam_types WHERE code = 'TB' AND master_id = 160), NOW()),
('Tanda Petik, Apostrof, Kurung, dan Garis Miring', 'Memahami penggunaan tanda petik ganda dan tunggal untuk kutipan dan judul, apostrof untuk penghilangan, tanda kurung biasa dan siku untuk keterangan, serta garis miring untuk alternatif.', 'PAK', 3, (SELECT id FROM public.exam_types WHERE code = 'TB' AND master_id = 160), NOW())
ON CONFLICT (master_id, code) DO UPDATE SET
    name = EXCLUDED.name, description = EXCLUDED.description, edit_date = NOW();


-- Struktur Wacana dan Pembentukan Istilah (SWI)
INSERT INTO public.exam_types (name, description, code, kind, master_id, create_date) VALUES
('Paragraf', 'Memahami struktur paragraf, jenis paragraf berdasarkan letak kalimat utama dan isi, pola pengembangan, transisi antarparagraf, serta teknik menemukan ide pokok dan menganalisis kualitas paragraf.', 'PG', 3, (SELECT id FROM public.exam_types WHERE code = 'SWI' AND master_id = 160), NOW()),
('Kohesi dan Koherensi', 'Memahami alat kohesi (referensi, substitusi, elipsis, konjungsi), membangun koherensi wacana, penanda wacana, serta menganalisis dan memperbaiki teks yang tidak kohesif atau koheren.', 'KK', 3, (SELECT id FROM public.exam_types WHERE code = 'SWI' AND master_id = 160), NOW()),
('Istilah', 'Memahami pengertian dan persyaratan istilah yang baik, konsep peristilahan, serta bahan baku istilah Indonesia dari bahasa Nusantara, Indonesia/Melayu, dan bahasa asing.', 'IS', 3, (SELECT id FROM public.exam_types WHERE code = 'SWI' AND master_id = 160), NOW()),
('Proses Pembentukan Istilah - Penerjemahan', 'Memahami pemadanan istilah melalui penerjemahan langsung berdasarkan makna dan bentuk, pedoman penerjemahan, serta penerjemahan dengan perekaan istilah baru.', 'PPI', 3, (SELECT id FROM public.exam_types WHERE code = 'SWI' AND master_id = 160), NOW()),
('Proses Pembentukan Istilah - Penyerapan', 'Memahami cara penyerapan istilah melalui penyesuaian ejaan dan lafal, penyerapan afiks dan sufiks asing, serta prinsip fonotaktik bahasa Indonesia dalam penyerapan.', 'PPY', 3, (SELECT id FROM public.exam_types WHERE code = 'SWI' AND master_id = 160), NOW()),
('Gabungan, Perekaciptaan, dan Pembakuan Istilah', 'Memahami metode gabungan penerjemahan dan penyerapan, perekaciptaan istilah baru, proses pembakuan dan kodifikasi istilah, serta perkembangan istilah dalam bahasa Indonesia.', 'GPI', 3, (SELECT id FROM public.exam_types WHERE code = 'SWI' AND master_id = 160), NOW())
ON CONFLICT (master_id, code) DO UPDATE SET
    name = EXCLUDED.name, description = EXCLUDED.description, edit_date = NOW();


-- ================================================================
-- STEP 2: UPDATE questions.question_topic_type
-- Mapping topic lama ke topic baru:
--
-- id=162 Judul Teks           -> Paragraf (PG, under SWI)
-- id=163 Pesan Penulis        -> Kohesi dan Koherensi (KK, under SWI)
-- id=164 Makna Kontekstual    -> Kata Baku (KB, under KDP)
-- id=166 Ketepatan Kata       -> Kalimat Efektif (KE, under KDP)
-- id=167 Ketepatan Penghubung -> Kalimat Majemuk (KM, under KDP)
-- id=168 Kelengkapan Kalimat  -> Kalimat Tunggal (KT, under KDP)
-- id=170 Jenis Teks           -> Paragraf (PG, under SWI)
-- id=171 Kohesi Teks          -> Kohesi dan Koherensi (KK, under SWI)
-- ================================================================

-- Judul Teks -> Paragraf
UPDATE public.questions SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PG' AND sec.code = 'SWI' AND sec.master_id = 160
    ),
    edit_date = NOW()
WHERE question_topic_type = 162;

-- Pesan Penulis -> Kohesi dan Koherensi
UPDATE public.questions SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'KK' AND sec.code = 'SWI' AND sec.master_id = 160
    ),
    edit_date = NOW()
WHERE question_topic_type = 163;

-- Makna Kontekstual -> Kata Baku
UPDATE public.questions SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'KB' AND sec.code = 'KDP' AND sec.master_id = 160
    ),
    edit_date = NOW()
WHERE question_topic_type = 164;

-- Ketepatan Kata -> Kalimat Efektif
UPDATE public.questions SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'KE' AND sec.code = 'KDP' AND sec.master_id = 160
    ),
    edit_date = NOW()
WHERE question_topic_type = 166;

-- Ketepatan Penghubung -> Kalimat Majemuk
UPDATE public.questions SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'KM' AND sec.code = 'KDP' AND sec.master_id = 160
    ),
    edit_date = NOW()
WHERE question_topic_type = 167;

-- Kelengkapan Kalimat -> Kalimat Tunggal
UPDATE public.questions SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'KT' AND sec.code = 'KDP' AND sec.master_id = 160
    ),
    edit_date = NOW()
WHERE question_topic_type = 168;

-- Jenis Teks -> Paragraf
UPDATE public.questions SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'PG' AND sec.code = 'SWI' AND sec.master_id = 160
    ),
    edit_date = NOW()
WHERE question_topic_type = 170;

-- Kohesi Teks -> Kohesi dan Koherensi
UPDATE public.questions SET
    question_topic_type = (
        SELECT et.id FROM public.exam_types et
        JOIN public.exam_types sec ON sec.id = et.master_id
        WHERE et.code = 'KK' AND sec.code = 'SWI' AND sec.master_id = 160
    ),
    edit_date = NOW()
WHERE question_topic_type = 171;


-- ================================================================
-- STEP 3: DELETE topic & section lama
-- Hapus kind=3 dulu, baru kind=2
-- ================================================================

-- Hapus topic lama (kind=3)
DELETE FROM public.exam_types
WHERE id IN (162, 163, 164, 166, 167, 168, 170, 171);

-- Hapus section lama (kind=2)
DELETE FROM public.exam_types
WHERE id IN (161, 165, 169);


-- ================================================================
-- VERIFICATION (uncomment setelah COMMIT)
-- ================================================================

-- Cek struktur baru:
-- SELECT
--     et3.name AS mapel,
--     et2.id AS section_id, et2.name AS section, et2.code AS section_code,
--     et.id  AS topic_id,  et.name  AS topic,   et.code  AS topic_code
-- FROM public.exam_types et
-- JOIN public.exam_types et2 ON et2.id = et.master_id
-- JOIN public.exam_types et3 ON et3.id = et2.master_id
-- WHERE et.kind = 3 AND et3.name = 'Pemahaman Bacaan dan Menulis'
-- ORDER BY et2.name, et.name;

-- Cek tidak ada questions yang masih pakai topic lama:
-- SELECT COUNT(*) FROM public.questions
-- WHERE question_topic_type IN (162,163,164,166,167,168,170,171);
-- (harusnya = 0)

-- Cek distribusi questions per topic baru:
-- SELECT et.name AS topic, et2.name AS section, COUNT(q.id) AS total_questions
-- FROM public.questions q
-- JOIN public.exam_types et  ON et.id  = q.question_topic_type
-- JOIN public.exam_types et2 ON et2.id = et.master_id
-- JOIN public.exam_types et3 ON et3.id = et2.master_id
-- WHERE et3.name = 'Pemahaman Bacaan dan Menulis'
-- GROUP BY et.name, et2.name
-- ORDER BY et2.name, et.name;

COMMIT;