# Debug Scripts

## Live Courses Debug

Script untuk menganalisis dan debug kenapa `/api/courses/live` cuma return 1 hasil.

### Cara Menjalankan

#### Windows (PowerShell):
```powershell
.\scripts\debug\run-debug.ps1
```

#### Linux/Mac (Bash):
```bash
chmod +x scripts/debug/run-debug.sh
./scripts/debug/run-debug.sh
```

#### Atau langsung dengan ts-node:
```bash
npx ts-node scripts/debug/debug-live-courses.ts
```

### Apa yang Dilakukan Script Ini?

Script ini akan menjalankan query step-by-step untuk melihat di mana data "hilang":

1. **Step 1**: Total courses di database
2. **Step 2**: Courses yang linked ke products
3. **Step 3**: Filtering by product type = 12
4. **Step 4**: Filtering by stock > 0
5. **Step 5**: **CRITICAL** - Check price history (kemungkinan besar masalah ada di sini)
6. **Step 6**: Test LATERAL join
7. **Step 7**: Final filter dengan active price
8. **Step 8**: Lihat data actual yang lolos semua filter
9. **Step 9**: Investigasi kenapa courses lain gagal

### Output

Script akan menampilkan:
- Count di setiap step
- Sample data
- Tabel dengan detail
- Analisis kehilangan data
- Rekomendasi solusi

### Masalah yang Kemungkinan Ditemukan

Berdasarkan query di `live.ts`, kemungkinan masalah:

1. **Price History Filter Terlalu Ketat**
   - LATERAL join ambil price yang `active OR future`
   - Tapi WHERE clause akhir cuma mau yang `currently active`
   - Ini bisa bikin banyak data ke-drop

2. **Stock Habis**
   - Banyak produk dengan stock = 0

3. **Effective Dates Tidak Proper**
   - `effective_start` atau `effective_end` tidak ter-set dengan benar

### Solusi yang Mungkin

1. **Relax Price Filter**: Consider showing "upcoming" courses
2. **Update Price History**: Pastikan semua produk punya active price
3. **Review Business Logic**: Apakah memang cuma mau show active prices?
