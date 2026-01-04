# Penjelasan Query Recommended Programs

## Overview
Query ini menggunakan **Materialized View** untuk memberikan rekomendasi program studi (prodi) kepada user berdasarkan skor ujian mereka dibandingkan dengan data historis UTBK tahun sebelumnya.

## Tujuan
1. **Memberikan rekomendasi yang realistis**: User hanya melihat prodi yang skornya memenuhi syarat (user_score ≥ min_score tahun lalu)
2. **Menampilkan 2 kategori ranking**:
   - **Top 5 by Score Gap**: Prodi dengan selisih skor terbesar (user lebih unggul)
   - **Top 5 by Competition**: Prodi dengan rasio persaingan terendah (peluang lolos lebih besar)

---

## Struktur Query

### 1. **Extension Setup**
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```
- Mengaktifkan PostgreSQL Trigram untuk fuzzy matching (pencarian mirip string)
- Berguna untuk mencari prodi dengan nama yang mirip di masa depan

---

### 2. **CTE: current_year**
```sql
current_year AS (
    SELECT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER AS year
)
```
**Tujuan**: Mendapatkan tahun sekarang (2025) untuk filter data historis.

---

### 3. **CTE: user_latest_scores**
```sql
user_latest_scores AS (
    SELECT DISTINCT ON (ra.user_id, pt.description)
        ra.user_id,
        pt.description AS exam_type,
        pt.id AS product_type_id,
        SUM(
            CASE 
                WHEN es.is_need_weighted_score = true THEN ra.weighted_score
                ELSE ra.score
            END
        ) OVER (PARTITION BY ra.user_id, ra.exam_schedule_id) AS user_score,
        ...
    FROM (
        SELECT *,
            ROW_NUMBER() OVER (
                PARTITION BY user_id, exam_schedule_id, exam_id
                ORDER BY GREATEST(COALESCE(postdate, '1900-01-01'), 
                                  COALESCE(completion_time, '1900-01-01')) DESC
            ) AS rn
        FROM user_exam_scores
    ) ra
    ...
    WHERE pt.group_product ILIKE 'TO%'
        AND ra.is_final = true
        AND ra.rn = 1
)
```

**Penjelasan Step by Step**:

1. **Subquery dengan ROW_NUMBER()**:
   - `PARTITION BY user_id, exam_schedule_id, exam_id`: Kelompokkan per user, schedule, dan exam
   - `ORDER BY ... DESC`: Ambil attempt terbaru (postdate atau completion_time terbaru)
   - `rn = 1`: Hanya ambil attempt terakhir untuk setiap exam

2. **SUM dengan WINDOW FUNCTION**:
   - `OVER (PARTITION BY ra.user_id, ra.exam_schedule_id)`: Jumlahkan semua skor dalam 1 schedule
   - **Bukan AVERAGE**, tapi **SUM** karena:
     - Exam schedule bisa punya beberapa mata ujian (misal: PU, PPU, PBM, LBI, LBE)
     - Total skor = SUM dari semua mata ujian tersebut
     - Contoh: PU=150 + PPU=200 + PBM=300 = **Total 650**

3. **Weighted Score Logic**:
   ```sql
   CASE 
       WHEN es.is_need_weighted_score = true THEN ra.weighted_score
       ELSE ra.score
   END
   ```
   - Jika exam perlu weighted score → gunakan `weighted_score`
   - Jika tidak → gunakan `score` biasa

4. **DISTINCT ON (ra.user_id, pt.description)**:
   - Ambil hanya 1 record per user per exam type
   - Diurutkan berdasarkan `postdate DESC` → ambil schedule terbaru

**Output**: Skor total terbaru user untuk setiap tipe exam (SNBT, UTBK, dll)

---

### 4. **CTE: prodi_with_history**
```sql
prodi_with_history AS (
    SELECT 
        p.id AS prodi_id,
        p.university_id,
        p.nama_prodi,
        p.jenjang_prodi,
        u.nama_pt,
        u.nama_singkat,
        -- Current year data (2025)
        MAX(CASE WHEN hur.year = 2025 
            THEN hur.peminat ELSE NULL END) AS peminat_current,
        MAX(CASE WHEN hur.year = 2025 
            THEN hur.daya_tampung ELSE NULL END) AS daya_tampung_current,
        -- Previous year data (2024) for score reference
        MAX(CASE WHEN hur.year = 2024 
            THEN hur.min_score ELSE NULL END) AS min_score_prev,
        MAX(CASE WHEN hur.year = 2024 
            THEN hur.max_score ELSE NULL END) AS max_score_prev,
        ...
    FROM prodi p
    LEFT JOIN universities u ON u.id = p.university_id
    LEFT JOIN history_utbk_result hur ON hur.prodi_id = p.id
    WHERE p.status_prodi = 'Aktif'
    GROUP BY p.id, u.nama_pt, ...
)
```

**Penjelasan**:

1. **JOIN dengan universities**:
   - `LEFT JOIN universities u ON u.id = p.university_id`
   - Mendapatkan **nama_pt** (nama universitas lengkap) dan **nama_singkat**

2. **Pivot Data by Year**:
   - Data historis ada untuk beberapa tahun (2023, 2024, 2025...)
   - Kita butuh:
     - **Tahun sekarang (2025)**: `peminat_current`, `daya_tampung_current`
     - **Tahun lalu (2024)**: `min_score_prev`, `max_score_prev`, `average_score_prev`

3. **MAX with CASE WHEN**:
   ```sql
   MAX(CASE WHEN hur.year = 2024 THEN hur.min_score ELSE NULL END)
   ```
   - Filter baris dengan year = 2024, ambil min_score
   - MAX hanya untuk agregasi (karena GROUP BY), hasilnya cuma 1 nilai per prodi

4. **Filter**:
   - `status_prodi = 'Aktif'`: Hanya prodi yang masih aktif
   - `nama_prodi IS NOT NULL`: Tidak include prodi tanpa nama

**Output**: Daftar prodi dengan data historis tahun lalu + data peminat tahun ini

---

### 5. **CTE: user_prodi_match**
```sql
user_prodi_match AS (
    SELECT 
        uls.user_id,
        uls.user_score,
        pwh.prodi_id,
        pwh.nama_prodi,
        pwh.nama_pt,  -- ✅ NAMA UNIVERSITAS
        pwh.nama_singkat,
        pwh.min_score_prev,
        -- Calculate metrics
        ROUND(uls.user_score - pwh.min_score_prev, 2) AS score_gap,
        ROUND(pwh.peminat_current::NUMERIC / pwh.daya_tampung_current::NUMERIC, 2) AS competition_ratio,
        -- Qualification status
        CASE 
            WHEN pwh.min_score_prev IS NULL OR pwh.min_score_prev = 0 THEN 'No Historical Data'
            WHEN uls.user_score >= pwh.min_score_prev THEN 'Qualified'
            ELSE 'Not Qualified'
        END AS qualification_status
    FROM user_latest_scores uls
    CROSS JOIN prodi_with_history pwh
    WHERE pwh.has_historical_data = true
        AND uls.exam_type ILIKE '%SNBT%'
        AND pwh.min_score_prev > 0
)
```

**Penjelasan**:

1. **CROSS JOIN**:
   - Kombinasi semua user scores dengan semua prodi
   - Misal: 1 user × 10,000 prodi = 10,000 rows per user

2. **Calculated Metrics**:

   a. **score_gap** (Selisih Skor):
   ```sql
   user_score - min_score_prev
   ```
   - Contoh: User skor 705, min_score 700 → **Gap = +5**
   - Semakin besar gap, semakin aman user tersebut
   - **Top 5 by Score Gap** = 5 prodi dengan gap terbesar

   b. **competition_ratio** (Rasio Persaingan):
   ```sql
   peminat_current / daya_tampung_current
   ```
   - Contoh: Peminat 1000, daya tampung 100 → **Ratio = 10:1**
   - Semakin rendah ratio, semakin mudah lolos
   - **Top 5 by Competition** = 5 prodi dengan ratio terendah

3. **qualification_status**:
   - `'Qualified'`: user_score ≥ min_score_prev
   - `'Not Qualified'`: user_score < min_score_prev
   - `'No Historical Data'`: min_score = 0 atau NULL

4. **Filter**:
   - `exam_type ILIKE '%SNBT%'`: Hanya untuk SNBT
   - `min_score_prev > 0`: Hanya prodi dengan data valid
   - `has_historical_data = true`: Pastikan ada data tahun lalu

**Output**: Semua kombinasi user-prodi yang qualified dengan metrik kalkulasi

---

### 6. **Main SELECT dengan Ranking**
```sql
SELECT 
    user_id,
    exam_type,
    user_score,
    prodi_id,
    nama_prodi,
    nama_pt,        -- ✅ NAMA UNIVERSITAS
    nama_singkat,
    min_score_prev,
    score_gap,
    competition_ratio,
    -- Ranking #1: By Score Gap (descending)
    ROW_NUMBER() OVER (
        PARTITION BY user_id, exam_type 
        ORDER BY score_gap DESC NULLS LAST
    ) AS rank_by_score_gap,
    -- Ranking #2: By Competition (ascending)
    ROW_NUMBER() OVER (
        PARTITION BY user_id, exam_type 
        ORDER BY competition_ratio ASC NULLS LAST, score_gap DESC
    ) AS rank_by_competition
FROM user_prodi_match
WHERE qualification_status = 'Qualified';
```

**Penjelasan Ranking**:

1. **rank_by_score_gap**:
   ```sql
   ORDER BY score_gap DESC NULLS LAST
   ```
   - Urutkan dari gap terbesar ke terkecil
   - Rank 1 = prodi dengan selisih skor tertinggi (paling aman)
   - Contoh: Gap +50 dapat rank 1, gap +10 dapat rank 10

2. **rank_by_competition**:
   ```sql
   ORDER BY competition_ratio ASC NULLS LAST, score_gap DESC
   ```
   - **Primary sort**: Ratio terkecil dulu (persaingan paling rendah)
   - **Secondary sort**: Jika ratio sama, pilih yang gap-nya lebih besar
   - Rank 1 = prodi dengan persaingan terendah

3. **PARTITION BY user_id, exam_type**:
   - Ranking independent untuk setiap user
   - User A rank 1 ≠ User B rank 1

**Filter Akhir**: `qualification_status = 'Qualified'` → hanya yang memenuhi syarat

---

## Cara Mengambil Data

### Top 5 by Score Gap
```sql
SELECT * FROM mv_recommended_programs 
WHERE user_id = 123 
  AND exam_type = 'SNBT Exam' 
  AND rank_by_score_gap <= 5
ORDER BY rank_by_score_gap;
```

**Output Contoh**:
| rank | prodi_id | nama_prodi | nama_pt | score_gap | competition_ratio |
|------|----------|------------|---------|-----------|-------------------|
| 1 | 456 | Teknik Informatika | Universitas Indonesia | 85.5 | 12.5 |
| 2 | 789 | Sistem Informasi | Institut Teknologi Bandung | 72.3 | 15.2 |
| 3 | 234 | Ilmu Komputer | Universitas Gadjah Mada | 68.1 | 18.7 |
| ... | ... | ... | ... | ... | ... |

**Interpretasi**: User ini sangat unggul (+85.5 poin) untuk Teknik Informatika UI

---

### Top 5 by Competition
```sql
SELECT * FROM mv_recommended_programs 
WHERE user_id = 123 
  AND exam_type = 'SNBT Exam' 
  AND rank_by_competition <= 5
ORDER BY rank_by_competition;
```

**Output Contoh**:
| rank | prodi_id | nama_prodi | nama_pt | score_gap | competition_ratio |
|------|----------|------------|---------|-----------|-------------------|
| 1 | 567 | Pendidikan Matematika | Universitas Negeri Jakarta | 25.5 | 3.2 |
| 2 | 890 | Statistika | Universitas Padjadjaran | 30.2 | 4.5 |
| 3 | 345 | Aktuaria | Universitas Brawijaya | 22.8 | 5.1 |
| ... | ... | ... | ... | ... | ... |

**Interpretasi**: Prodi ini punya persaingan rendah (3.2:1), peluang lolos besar

---

## Kelebihan Materialized View

1. **Performance**:
   - Query kompleks dieksekusi 1x, hasil di-cache
   - Read cepat (seperti table biasa)
   - Tidak perlu kalkulasi ulang setiap request

2. **Index**:
   ```sql
   CREATE INDEX idx_recommended_programs_user_exam 
       ON mv_recommended_programs(user_id, exam_type);
   ```
   - Query dengan `WHERE user_id = X` jadi sangat cepat

3. **Refresh Strategy**:
   ```sql
   REFRESH MATERIALIZED VIEW CONCURRENTLY mv_recommended_programs;
   ```
   - Bisa di-refresh tanpa lock (CONCURRENTLY)
   - Dijadwalkan via cron job (misal: setiap hari jam 2 pagi)

---

## Data Flow Diagram

```
┌─────────────────────┐
│ user_exam_scores    │ ──┐
│ (latest attempts)   │   │
└─────────────────────┘   │
                          │  JOIN + CROSS JOIN
┌─────────────────────┐   │
│ history_utbk_result │   ├──► Calculate:
│ (year 2024 data)    │   │    • score_gap
└─────────────────────┘   │    • competition_ratio
                          │    • qualification_status
┌─────────────────────┐   │
│ prodi + universities│ ──┘
│ (nama_pt included)  │
└─────────────────────┘
         │
         │ Filter: qualification_status = 'Qualified'
         │
         ▼
┌──────────────────────────────┐
│ mv_recommended_programs      │
│ • rank_by_score_gap          │ ──► Top 5 by Score Gap
│ • rank_by_competition        │ ──► Top 5 by Competition
│ • nama_pt (✅ included)      │
└──────────────────────────────┘
```

---

## Score Calculation: SUM vs AVG

### ❌ **SALAH** (Menggunakan AVG):
```sql
AVG(ra.score) OVER (PARTITION BY ra.user_id, ra.exam_schedule_id)
```
**Masalah**: Jika ada 3 mapel (PU=150, PPU=200, PBM=300), hasilnya:
- AVG = (150 + 200 + 300) / 3 = **216.67** ❌ (Salah!)

### ✅ **BENAR** (Menggunakan SUM):
```sql
SUM(ra.score) OVER (PARTITION BY ra.user_id, ra.exam_schedule_id)
```
**Hasil**: 150 + 200 + 300 = **650** ✅ (Total skor yang benar!)

**Alasan**: Exam schedule adalah 1 sesi ujian lengkap yang terdiri dari beberapa mapel. Total skor adalah **penjumlahan** semua mapel, bukan rata-rata.

---

## Summary

**Query ini**:
1. ✅ Mengambil skor terbaru user (SUM dari semua mapel dalam schedule)
2. ✅ Membandingkan dengan min_score tahun lalu
3. ✅ Filter hanya yang qualified (user_score ≥ min_score)
4. ✅ Hitung 2 metrik: score_gap & competition_ratio
5. ✅ Ranking 2 kategori: Top by Score Gap & Top by Competition
6. ✅ Include nama universitas (nama_pt + nama_singkat)
7. ✅ Optimized dengan materialized view + indexes

**Benefit untuk User**:
- **Score Gap tinggi** → Pilihan aman, kemungkinan lolos besar
- **Competition rendah** → Peluang lolos lebih besar (less competitive)
- **Nama universitas** ditampilkan untuk memudahkan keputusan
