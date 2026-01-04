# Competitive Analysis dengan History UTBK Result

## Overview
Fitur ini mengintegrasikan data historis UTBK untuk memberikan analisis kompetitif yang lebih akurat kepada siswa terkait target prodi mereka. Sistem membandingkan achievement siswa dengan data peminat, daya tampung, dan score minimum dari tahun sebelumnya.

## Konsep Utama

### Logic Penentuan Status
```
1. **Data Tahun Berjalan (2025)**: 
   - Peminat
   - Daya Tampung

2. **Data Tahun Sebelumnya (2024)**:
   - Min Score (untuk benchmark)
   - Max Score
   - Average Score

3. **Safe Zone Calculation**:
   - Safe Zone = 25% dari daya_tampung
   - Asumsi: 25% peserta dari bimbel, 75% dari luar

4. **Status Categories**:
   - **Aman**: rank ≤ safe_zone AND score ≥ min_score_prev
   - **Perlu Ditingkatkan**: score ≥ min_score_prev BUT rank > safe_zone
   - **Tidak Aman**: score < min_score_prev (regardless of rank)
   - **No Historical Data**: Data tahun lalu belum tersedia
```

## Struktur Database

### Table: history_utbk_result
```sql
CREATE TABLE history_utbk_result (
    id SERIAL PRIMARY KEY,
    prodi_id INTEGER NOT NULL,
    ptn_dikbud_id INTEGER,
    prodi_dikbud_id INTEGER,
    nama_prodi_dikbud TEXT NOT NULL,
    nama_ptn_dikbud TEXT NOT NULL,
    peminat INTEGER DEFAULT 0,
    daya_tampung INTEGER DEFAULT 0,
    min_score NUMERIC(10, 2) DEFAULT 0,
    max_score NUMERIC(10, 2) DEFAULT 0,
    average_score NUMERIC(10, 2) DEFAULT 0,
    portfolio INTEGER DEFAULT 0,
    year INTEGER NOT NULL,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_user_id INTEGER,
    update_date TIMESTAMP,
    update_user_id INTEGER,
    CONSTRAINT uk_prodi_year UNIQUE (prodi_id, year)
);
```

### Materialized View: mv_competitive_analysis_with_history
View ini meng-combine:
- User latest scores
- User targets (prodi selections)
- Historical UTBK data (current year + previous year)
- User rankings (within bimbel participants)

## Files yang Dimodifikasi/Ditambahkan

### 1. SQL Scripts
**File**: `lib/sql/create_competitive_analysis_view.sql`
- Membuat materialized view `mv_competitive_analysis_with_history`
- Includes logic untuk safe zone calculation dan status determination
- Indexing untuk performa optimal

### 2. Models
**File**: `models/dashboard.model.ts`
- **Added**: `CompetitiveAnalysisWithHistory` interface
- **Added**: `getCompetitiveAnalysisWithHistory()` function
```typescript
export interface CompetitiveAnalysisWithHistory {
  prodi_id: number;
  nama_prodi_dikbud: string;
  nama_ptn_dikbud: string;
  user_score: number;
  user_rank: number;
  total_bimbel_participants: number;
  peminat_current: number | null;
  daya_tampung_current: number | null;
  safe_zone_rank: number | null;
  min_score_prev: number | null;
  max_score_prev: number | null;
  average_score_prev: number | null;
  has_prev_year_data: number;
  status: 'Aman' | 'Perlu Ditingkatkan' | 'Tidak Aman' | 'No Historical Data';
  score_gap_to_minimum: number | null;
  score_gap_to_average: number | null;
  competition_ratio: number | null;
}
```

### 3. Controllers
**File**: `controllers/dashboard.controller.ts`
- **Added**: `TargetProdiAnalysis` interface
- **Added**: `getCompetitiveAnalysisWithHistoryController()` function
- **Modified**: `processExamType()` untuk include target prodi analysis
- **Modified**: `ExamDashboardData` interface dengan field `targetProdiAnalysis`

### 4. API Endpoints
**New File**: `pages/api/dashboard/competitive-analysis/[examType].ts`
- GET endpoint untuk fetch competitive analysis by exam type
- Route: `/api/dashboard/competitive-analysis/SNBT`

### 5. React Components
**New File**: `pages/panel/exam/dashboard/TargetProdiAnalysis.tsx`
- Component untuk display target prodi analysis
- Features:
  - Status badge (Aman, Perlu Ditingkatkan, Tidak Aman)
  - Score comparison metrics
  - Gap analysis (to minimum dan average)
  - Competition ratio
  - Safety percentage bar
  - Detailed explanation section

**Modified**: `pages/panel/exam/dashboard/StudentExamDashboard.tsx`
- Added `TargetProdiAnalysis` interface
- Import `TargetProdiAnalysisComponent`

**Modified**: `pages/panel/exam/dashboard/Overview.tsx`
- Added `TargetProdiAnalysis` interface to ExamData
- Import `TargetProdiAnalysisComponent`
- Conditional rendering (only for SNBT exam type)

## Usage

### 1. Run SQL Migration
```bash
psql -U your_user -d your_database -f lib/sql/create_competitive_analysis_view.sql
```

### 2. Populate history_utbk_result Table
```sql
-- Example insert
INSERT INTO history_utbk_result 
(prodi_id, nama_prodi_dikbud, nama_ptn_dikbud, peminat, daya_tampung, 
 min_score, max_score, average_score, year)
VALUES 
(123, 'Teknik Informatika', 'Universitas Indonesia', 5000, 100, 
 700.50, 850.25, 775.80, 2024);
```

### 3. Refresh Materialized View
```sql
-- Manual refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_competitive_analysis_with_history;

-- Or using function
SELECT refresh_competitive_analysis_view();
```

### 4. API Call from Frontend
```typescript
const response = await fetch(
  `/api/dashboard/competitive-analysis/SNBT Exam`,
  {
    method: 'GET',
    credentials: 'include',
  }
);
const data = await response.json();
// data.data contains TargetProdiAnalysis[]
```

## Response Format

```json
{
  "success": true,
  "data": [
    {
      "prodi_id": 123,
      "nama_prodi": "Teknik Informatika",
      "nama_ptn": "Universitas Indonesia",
      "user_score": 705.50,
      "user_rank": 23,
      "total_bimbel_participants": 500,
      "peminat": 5000,
      "daya_tampung": 100,
      "safe_zone_rank": 25,
      "min_score_reference": 700.50,
      "max_score_reference": 850.25,
      "average_score_reference": 775.80,
      "has_historical_data": true,
      "status": "Aman",
      "score_gap_to_minimum": 0,
      "score_gap_to_average": -70.30,
      "competition_ratio": 50,
      "status_message": "Selamat! Kamu berada di posisi aman (rank 23 dari 25 safe zone). Score kamu 705.50 sudah di atas minimum 700.50."
    }
  ]
}
```

## UI Features

### Status Cards
- **Aman** (Green): Posisi aman, kemungkinan besar lolos
- **Perlu Ditingkatkan** (Yellow): Score sudah cukup, tapi perlu naik ranking
- **Tidak Aman** (Red): Score di bawah minimum tahun lalu
- **No Data** (Grey): Belum ada data historis

### Metrics Display
- User score & rank
- Safe zone threshold
- Historical benchmarks (min, max, average)
- Competition ratio (peminat:daya_tampung)
- Gap analysis (berapa poin lagi ke target)

### Safety Progress Bar
Visual indicator tingkat keamanan berdasarkan kombinasi rank dan score.

## Maintenance

### Refresh Schedule
Recommended: Refresh materialized view setelah:
1. User menyelesaikan exam baru
2. Admin update target selections
3. Historical data updated
4. Daily/weekly cron job

### Performance Considerations
- Materialized view dengan indexes untuk fast query
- Pagination jika user punya banyak target
- Cache di frontend (5-10 menit)

## Future Enhancements

1. **Real-time Updates**: WebSocket untuk live ranking updates
2. **Historical Trends**: Chart showing position trends over time
3. **Prediction Model**: ML model untuk prediksi peluang lolos
4. **Comparison Tool**: Bandingkan antar pilihan prodi
5. **Recommendation System**: Suggest alternative prodi based on score
6. **Export Report**: PDF export untuk analisis lengkap

## Notes

- **Exam Type**: Pastikan di database `product_type.description` untuk SNBT adalah **"SNBT Exam"** bukan "SNBT"
- Safe zone 25% adalah asumsi, bisa di-adjust sesuai data aktual
- Data tahun sebelumnya digunakan sebagai benchmark karena data tahun berjalan belum complete
- Status "Tidak Aman" tidak berarti pasti tidak lolos, hanya indikator untuk lebih giat belajar
- Competition ratio tinggi (>20:1) menandakan prodi sangat kompetitif

## Contact & Support

Untuk pertanyaan atau issue terkait fitur ini:
- Check logs di console browser (F12)
- Verify materialized view sudah ter-refresh
- Ensure user sudah set target di menu Target Seleksi
