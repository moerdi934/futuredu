# SECTION 3: Statistika dan Probabilitas
## Topic 3.1: Analisis Data

---


## 🔄 Materi 3.1.7: Perbandingan dan Analisis Multi-Data

### Level Boss: Juggling Multiple Data Sources!

Ini materi paling challenging di analisis data. Kamu nggak cuma baca satu tabel atau grafik, tapi **beberapa sekaligus**, terus diminta **sintesis** informasi dari berbagai sumber. Welcome to the real world of data analysis!

### Kenapa Multi-Data Analysis Penting?

Di dunia nyata (dan di SNBT level tinggi), keputusan nggak bisa diambil dari satu data aja. Kamu perlu:
- **Compare** data dari berbagai sumber
- **Validate** konsistensi data
- **Integrate** informasi untuk kesimpulan lengkap
- **Identify** tren jangka panjang

**Analogi:**
Kayak detektif yang kumpulin bukti dari berbagai saksi dan tempat kejadian, terus disatuin buat ngerti gambaran utuh kejadian!

### Jenis Kombinasi Data yang Sering Muncul

#### **1. Tabel + Grafik**
Tabel kasih detail angka, grafik kasih visual tren.

**Contoh soal tipikal:**
"Berdasarkan tabel penjualan dan grafik tren, pada bulan apa terjadi kenaikan terbesar?"
→ Harus baca angka exact dari tabel DAN confirm dengan "kemiringan" terbesar di grafik.

#### **2. Dua Grafik Berbeda**
Grafik batang + grafik garis, atau 2 pie chart, dll.

**Contoh:**
"Bandingkan tren penjualan produk A (grafik 1) dan produk B (grafik 2)"
→ Harus analisis kedua grafik, liat di mana mereka sama/beda.

#### **3. Grafik + Diagram**
Histogram + scatter plot, atau bar chart + pie chart.

**Contoh:**
"Dari histogram distribusi nilai dan scatter plot jam belajar vs nilai, jelaskan hubungannya"
→ Harus connect insight dari kedua visualisasi.

#### **4. Multiple Tables**
Beberapa tabel dengan perspektif berbeda.

**Contoh:**
Tabel 1: Penjualan per produk
Tabel 2: Harga per produk
Tabel 3: Biaya produksi
→ Ditanya: "Produk mana yang paling profitable?"
→ Harus hitung: Profit = (Harga × Penjualan) - Biaya

### Strategi Analisis Multi-Data

#### **Strategy 1: Identify the Question First**
Jangan langsung terjun ke data! Baca dulu apa yang ditanyakan, baru tentuin data mana yang relevan.

**Contoh:**
Pertanyaan: "Berapa total pendapatan tahun 2024?"
Data available: Tabel penjualan 2023-2025, Grafik tren harga, Diagram biaya
→ Yang dibutuhkan: Cuma tabel penjualan 2024 × harga 2024

#### **Strategy 2: Cross-Reference**
Validasi data dari berbagai sumber. Kalau ada inkonsistensi, bisa jadi:
- Ada kesalahan data
- Perbedaan definisi/metode pengukuran
- Jebakan soal!

**Contoh cross-reference:**
Grafik: "Total penjualan Q1 = 100 juta"
Tabel detail: Jan (30) + Feb (35) + Mar (40) = 105 juta
→ Ada inkonsistensi! Harus teliti mana yang benar.

#### **Strategy 3: Create Mental (or Physical) Summary**
Bikin ringkasan mental atau coret-coretan:
- "Produk A: tren naik, harga stabil"
- "Produk B: tren turun, harga naik"
- dst.

Ini bantu kamu nge-compare dengan lebih terstruktur.

#### **Strategy 4: Look for Patterns Across Data**
Cari pola yang consistent atau kontradiktif antar data.

**Pattern yang bisa dicari:**
- Tren naik di semua produk → market growth
- Satu produk beda sendiri → ada anomali
- Semua data nunjukin hal yang sama → confident conclusion

#### **Strategy 5: Time-Series Integration**
Kalau ada data historis dari berbagai sumber, integrate berdasarkan timeline.

**Contoh:**
Data 1: Penjualan 2020-2024
Data 2: Biaya produksi 2020-2024
Data 3: Ekonomi makro 2020-2024
→ Analisis: "Kenapa penjualan turun 2023? Oh, biaya naik + resesi"

### Konsistensi dan Validasi Data

#### **Cek Konsistensi Internal**
Data dalam satu sumber harus konsisten.

**Contoh:**
Tabel penjualan:
- Total kolom ≠ Jumlah baris → ERROR!
- Persentase nggak total 100% → ERROR!

#### **Cek Konsistensi Eksternal**
Data antar sumber harus sinkron.

**Contoh:**
Grafik: "Penjualan 2024 = 500 unit"
Tabel: "Penjualan 2024 = 480 unit"
→ Mana yang benar? Baca keterangan atau context!

**Penyebab inkonsistensi:**
- Satuan berbeda (ribu vs juta)
- Periode berbeda (Januari vs Q1)
- Definisi berbeda (penjualan bruto vs netto)

#### **Red Flag untuk Validitas**
🚩 Angka yang terlalu "perfect" (misal: persis 100,00%)
🚩 Tren yang nggak masuk akal (naik 1000% dalam sebulan)
🚩 Data yang kontradiksi tanpa penjelasan

### Analisis Tren Jangka Panjang

**Tren Jangka Pendek vs Panjang:**
- **Short-term:** Fluktuasi harian/bulanan (volatile)
- **Long-term:** Pola tahunan (lebih stabil)

**Cara identifikasi tren panjang:**
1. **Smoothing:** Abaikan fluktuasi kecil, focus ke pola besar
2. **Moving Average:** Rata-rata bergerak untuk "haluskan" data
3. **Year-over-Year:** Bandingkan tahun ini vs tahun lalu

**Contoh:**
```
Penjualan Bulanan 2023-2024

     | 2023: naik-turun-naik-turun (volatile)
     | 2024: naik-turun-naik-turun (volatile)
     |
     | Tapi kalau dilihat per tahun:
     | Total 2023: 1200 unit
     | Total 2024: 1400 unit
     | → Tren panjang: NAIK 16,7%
```

### Sintesis Informasi: The Final Boss

**Sintesis:** Menggabungkan berbagai insight jadi satu kesimpulan utuh.

**Framework SYNTHESIS:**
1. **Separate:** Identifikasi insight dari tiap sumber
2. **You compare:** Bandingkan dan cari kesamaan/perbedaan
3. **Note patterns:** Catat pola yang muncul
4. **Test consistency:** Cek validitas dan konsistensi
5. **Hypothesize:** Bikin hipotesis awal
6. **Evaluate:** Test hipotesis dengan data
7. **Synthesize:** Gabungkan jadi kesimpulan
8. **Inform:** Komunikasikan hasil analisis
9. **Suggest:** Berikan rekomendasi (kalau diminta)

### Contoh Kasus Lengkap

**Scenario:**
Kamu kasih 3 data:
1. **Tabel:** Jumlah pendaftar SNBT 2020-2025
2. **Grafik batang:** Daya tampung PTN 2020-2025
3. **Diagram lingkaran:** Proporsi pendaftar per rumpun 2025

**Pertanyaan:** "Rumpun mana yang paling kompetitif tahun 2025?"

**Analisis:**

*Step 1 - Extract info:*
- Tabel: Total pendaftar 2025 = 800.000
- Grafik: Daya tampung 2025 = 160.000
- Diagram: Saintek 55%, Soshum 45%

*Step 2 - Calculate:*
- Pendaftar Saintek: 55% × 800.000 = 440.000
- Pendaftar Soshum: 45% × 800.000 = 360.000

*Step 3 - Butuh info tambahan:*
Daya tampung per rumpun nggak dikasih! Asumsi: proporsional dengan pendaftar? Atau ada di grafik detail? **Harus teliti baca semua data!**

Misal dari grafik detail:
- Daya tampung Saintek: 90.000
- Daya tampung Soshum: 70.000

*Step 4 - Competition ratio:*
- Saintek: 440.000 / 90.000 = 4,89:1
- Soshum: 360.000 / 70.000 = 5,14:1

*Step 5 - Conclusion:*
**Soshum lebih kompetitif** (rasio lebih tinggi), meskipun jumlah pendaftarnya lebih sedikit!

**Insight tambahan:**
- Jangan cuma liat jumlah pendaftar
- Harus relate dengan daya tampung
- Rasio adalah key metric

### Jebakan dalam Multi-Data

🚩 **Jebakan #1: Cherry-Picking Data**
Soal kasih banyak data, tapi cuma sebagian yang relevan. Jangan sampai kecantol ngitung semua!

🚩 **Jebakan #2: Hidden Assumptions**
"Berdasarkan tren ini, prediksi 5 tahun ke depan?"
Asumsi: Tren akan continue (padahal bisa berubah!)

🚩 **Jebakan #3: Mismatched Time Periods**
Data A: Januari-Maret
Data B: Q1 (Jan-Mar)
Data C: Semester 1 (Jan-Jun)
→ Jangan compare apple-to-apple!

🚩 **Jebakan #4: Different Metrics**
Grafik 1: Nilai absolut (jutaan rupiah)
Grafik 2: Growth rate (persen)
→ Nggak bisa dibandingkan langsung!

🚩 **Jebakan #5: Confounding Factors**
"Penjualan naik setelah iklan" → Apa bener karena iklan?
Atau karena seasonal (misal: menjelang lebaran)?

### Pro Tips untuk Multi-Data

💡 **Tip #1: Buat Checklist Mental**
- ✅ Data A: done
- ✅ Data B: done
- ✅ Cross-check A & B: done
- ✅ Calculate: done
- ✅ Validate: done

💡 **Tip #2: Use Anchor Points**
Cari angka "anchor" yang muncul di beberapa data. Ini bantu validasi.

Contoh: Total penjualan 1000 unit di Tabel 1. Kalau di Grafik 2 nggak nyambung, ada yang salah!

💡 **Tip #3: Sketch if Needed**
Kalau data kompleks, gambar quick sketch/diagram sendiri buat visualisasi hubungan.

💡 **Tip #4: Prioritize by Impact**
Data mana yang paling impact ke jawaban? Start from there!

💡 **Tip #5: Sanity Check at Every Step**
"Hasil sementara masuk akal nggak?" Kalau nggak, cek ulang!

💡 **Tip #6: Watch for Units**
Jutaan, ribuan, persen, rasio - always double check!

💡 **Tip #7: Time is Precious**
Di SNBT, waktu terbatas. Kalau analisis terlalu kompleks, mungkin ada cara lebih simpel!

### Master Framework: COMPARE

**C - Collect** all relevant data
**O - Organize** by category/timeline
**M - Match** common points
**P - Pattern** recognition
**A - Analyze** consistency
**R - Relate** to question
**E - Evaluate** & conclude

### Practice Makes Perfect!

Multi-data analysis butuh latihan. Semakin sering ketemu kasus kompleks, semakin cepat otak kamu process informasi dari berbagai sumber.

**Latihan mandiri:**
- Baca berita dengan grafik → cek konsistensi dengan teks
- Liat infografik di medsos → validate angka-angkanya
- Compare data dari 2-3 sumber tentang topik yang sama

---

## 🎯 Penutup: Mastering Analisis Data untuk SNBT

### Key Takeaways

Dari semua materi Topic 3.1, ini yang perlu kamu inget:

1. **Data adalah sumber insight** - tapi harus dibaca dengan benar
2. **Setiap visualisasi punya bahasa sendiri** - tabel, grafik, diagram
3. **Teliti adalah kunci** - satuan, skala, label, konvensi
4. **Korelasi ≠ Kausalitas** - jangan jump to conclusion
5. **Multi-data = sintesis** - gabungkan berbagai sumber dengan cerdas

### Mindset yang Benar

💭 **Think like a data scientist:**
- Skeptis tapi objektif
- Cari pola dan anomali
- Validasi sebelum conclude
- Context matters!

💭 **Think like a test-taker:**
- Baca pertanyaan dulu
- Cari data yang relevan
- Hitung efisien
- Double check!

### Your Data Analysis Toolbox

Setelah menguasai Topic 3.1, kamu punya:
- ✅ Kemampuan baca berbagai format data
- ✅ Skill interpretasi grafik dan tabel
- ✅ Understanding tentang distribusi dan korelasi
- ✅ Kemampuan sintesis multi-data
- ✅ Critical thinking untuk validasi data

### Next Steps

Topik selanjutnya (3.2: Ukuran Pemusatan dan Penyebaran) akan deep dive ke **statistika deskriptif** - mean, median, modus, standar deviasi, dll. Itu akan bantu kamu nggak cuma baca data, tapi juga **meringkas dan menganalisis** data secara kuantitatif!

Stay curious, stay critical, and happy data analyzing! 📊✨

---

**Selamat Belajar! Kamu Pasti Bisa! 💪🔥**