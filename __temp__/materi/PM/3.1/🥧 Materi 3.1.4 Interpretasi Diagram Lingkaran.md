# SECTION 3: Statistika dan Probabilitas
## Topic 3.1: Analisis Data

---


## 🥧 Materi 3.1.4: Interpretasi Diagram Lingkaran

### Diagram Lingkaran: The Pie of Data

Diagram lingkaran (pie chart) adalah cara paling "tasty" buat ngeliat proporsi! Bayangkan pizza dipotong-potong - tiap potongan represent bagian dari keseluruhan. Perfect buat data yang jumlahnya 100% atau total tertentu.

### Kenapa Diagram Lingkaran Spesial?

**Keunggulan:**
- Visual banget buat ngeliat **proporsi**
- Langsung keliatan "siapa yang paling besar/kecil"
- Intuitive - orang awam pun bisa paham
- Cocok buat data kategorikal dengan beberapa bagian

**Limitasi:**
- Susah buat compare exact values
- Kalau kategorinya banyak (>7), jadi ribet
- Nggak cocok buat nunjukin perubahan over time

### Anatomi Diagram Lingkaran

**Elemen penting:**
1. **Judul:** Apa yang direpresentasikan
2. **Slice/Sector:** Potongan lingkaran (semakin besar slice = semakin besar nilai)
3. **Label:** Nama kategori
4. **Persentase/Nilai:** Biasanya ditulis di atau dekat slice
5. **Legenda:** Penjelasan warna/pola

### Matematika di Balik Pie Chart

Lingkaran = 360°
Kalau ada kategori 25% → slice-nya = 25% × 360° = 90°

**Rumus penting:**
- **Persentase kategori** = (Nilai kategori / Total) × 100%
- **Sudut slice** = Persentase × 360° / 100%
- **Nilai kategori** = Persentase × Total / 100%

### Contoh Diagram Lingkaran

```
Preferensi Jurusan SNBT 2025 (1000 responden)

         Kedokteran (30%)
            ___-----___
        _--'           '--_
      ,'  Teknik          \
     /    (25%)            \
    |                       |
    |         •             |  Ekonomi (20%)
     \                     /
      '.                 ,'
        '--_  Hukum  _--'
            '-(15%)-'
               |
           Lainnya (10%)
```

**Data yang bisa diekstrak:**
- **Ranking:** Kedokteran > Teknik > Ekonomi > Hukum > Lainnya
- **Nilai absolut:** 
  - Kedokteran: 30% × 1000 = 300 orang
  - Teknik: 25% × 1000 = 250 orang
  - dst.
- **Perbandingan:** Kedokteran 1,2x lebih diminati dari Teknik (30%/25% = 1,2)
- **Gabungan:** Kedokteran + Teknik = 55% = 550 orang

### Teknik Baca Diagram Lingkaran

#### **Teknik 1: Quick Visual Assessment**
Liat dulu slice mana yang paling gede/kecil. Ini instant info tanpa perlu baca angka!

**Estimasi visual:**
- **Seperempat lingkaran** ≈ 25%
- **Setengah lingkaran** ≈ 50%
- **Hampir penuh** ≈ 75%+

#### **Teknik 2: The Clock Method**
Bayangin diagram lingkaran sebagai jam:
- 12 ke 3 = 90° = 25%
- 12 ke 6 = 180° = 50%
- 12 ke 9 = 270° = 75%

Kalau slice dari "jam 12 ke jam 2" → sekitar 60° ≈ 17%

#### **Teknik 3: Persentase Residual**
Kalau ada beberapa slice dan kamu tau beberapa persentase:
Total = 100%
Sisanya = 100% - (jumlah persentase yang diketahui)

**Contoh:**
A = 30%, B = 25%, C = 20%
Maka D + E = 100% - 75% = 25%

#### **Teknik 4: Konversi Bolak-Balik**
**Punya persentase, cari nilai:**
Nilai = (Persentase / 100) × Total

**Punya nilai, cari persentase:**
Persentase = (Nilai / Total) × 100%

### Diagram Lingkaran Majemuk (Advanced)

Kadang ada diagram lingkaran **di dalam** diagram lingkaran!

**Contoh konteks:**
Lingkaran luar: Penjualan per wilayah (Jakarta 40%, Bandung 30%, Surabaya 30%)
Lingkaran dalam: Detail penjualan Jakarta per produk (Produk A 50%, B 30%, C 20%)

**Cara baca:**
1. Baca lingkaran luar dulu (total per wilayah)
2. Baca lingkaran dalam (detail dalam wilayah tertentu)
3. Hitung **proporsi ganda:**
   - Produk A di Jakarta = 40% × 50% = 20% dari total keseluruhan

### Jenis Pertanyaan Umum

#### **Tipe 1: Baca Langsung**
"Berapa persentase preferensi Kedokteran?"
→ Tinggal baca: 30% ✓

#### **Tipe 2: Konversi Persentase ke Nilai**
"Jika total responden 1000, berapa yang memilih Teknik?"
→ 25% × 1000 = 250 orang ✓

#### **Tipe 3: Gabungan Kategori**
"Berapa persentase yang memilih Kedokteran atau Teknik?"
→ 30% + 25% = 55% ✓

#### **Tipe 4: Perbandingan**
"Berapa kali lipat preferensi Kedokteran dibanding Hukum?"
→ 30% / 15% = 2 kali lipat ✓

#### **Tipe 5: Kategori yang Nggak Disebutkan**
"Berapa persentase kategori Lainnya jika total harus 100%?"
→ 100% - (30% + 25% + 20% + 15%) = 10% ✓

#### **Tipe 6: Nilai Absolut dari Selisih**
"Berapa selisih jumlah yang memilih Kedokteran dan Ekonomi?"
→ (30% - 20%) × 1000 = 10% × 1000 = 100 orang ✓

### Red Flags & Jebakan

🚩 **Jebakan #1: Persentase yang Nggak 100%**
Kadang di soal, total persentase yang disebutkan < 100%. Sisa-nya biasanya "Lainnya" atau "Tidak menjawab". Harus dihitung sendiri!

🚩 **Jebakan #2: Basis Total yang Berbeda**
Diagram 1: "30% dari 1000 orang"
Diagram 2: "30% dari 500 orang"
→ Nilai absolutnya beda! 300 vs 150

🚩 **Jebakan #3: Label yang Membingungkan**
"30% memilih A" vs "30% bukan B"
Hati-hati dengan negasi - "bukan B" bisa jadi A, C, D, dst.

🚩 **Jebakan #4: Visual yang Menyesatkan**
3D pie chart atau exploded slice bisa bikin proporsi kelihatan nggak akurat. Selalu andalkan angka, bukan cuma visual!

🚩 **Jebakan #5: Overlapping Categories**
"Preferensi olahraga: Sepakbola 40%, Basket 30%, Lari 35%"
Total > 100%? Berarti ada yang milih lebih dari 1! Nggak bisa dijadiin pie chart standard.

### Tips Menghitung Cepat

💡 **Tip #1: Hafalin Persentase Umum**
- 25% = 1/4
- 33,33% ≈ 1/3
- 50% = 1/2
- 66,67% ≈ 2/3
- 75% = 3/4

Kalau total = 1200:
25% = 1200/4 = 300 (lebih cepat dari 0,25 × 1200!)

💡 **Tip #2: Gunakan Benchmark**
Kalau ditanya "30% dari 950", tapi ribet:
30% dari 1000 = 300
Jadi 30% dari 950 ≈ sedikit kurang dari 300 (sekitar 285)

💡 **Tip #3: Persentase Kecil**
10% = pindahin koma 1 digit
1% = pindahin koma 2 digit

Contoh: 7% dari 850
10% = 85
1% = 8,5
7% = 7 × 8,5 = 59,5 ≈ 60

💡 **Tip #4: Selisih Persentase**
Kalau A = 35% dan B = 28%, selisihnya 7%
Kalau total = 800 → selisih = 7% × 800 = 56

### Diagram Lingkaran vs Diagram Batang

**Kapan pake Pie Chart:**
- Total ada 100% atau nilai pasti
- Kategori 3-6 (nggak terlalu banyak)
- Fokus ke proporsi, bukan nilai absolut
- One point in time (bukan tren)

**Kapan pake Bar Chart:**
- Nilai absolut lebih penting
- Banyak kategori (>6)
- Perlu compare exact values
- Ada tren over time

### Strategi SNBT untuk Pie Chart

⚡ **Step 1: Scan dulu informasi kunci**
- Total (100% = berapa?)
- Berapa kategori yang ada
- Kategori mana yang ditanya

⚡ **Step 2: Cek apakah perlu konversi**
Persentase → Nilai atau sebaliknya?

⚡ **Step 3: Hitung dengan metode tercepat**
Gunakan pecahan kalau lebih gampang!

⚡ **Step 4: Sanity check**
"Masuk akal nggak hasilnya?"
Jangan sampai dapet hasil 110% atau nilai negatif!

⚡ **Step 5: Cek satuan jawaban**
Diminta dalam persen (%), nilai absolut, atau rasio?

---
