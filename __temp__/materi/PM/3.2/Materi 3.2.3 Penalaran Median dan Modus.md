# SECTION 3: Statistika dan Probabilitas
## Topic 3.2: Ukuran Pemusatan dan Penyebaran

---


## **Materi 3.2.3: Penalaran Median dan Modus**

### **Median: Si Demokratis yang Cuma Peduli Posisi Tengah**

Kalau mean itu perfeksionis yang mau semua data diperhitungkan, median itu pragmatis. Dia cuma peduli satu hal: **posisi tengah**.

Analoginya kayak gini: Bayangin kamu nyari rumah di Jakarta. Mean harga rumah bisa Rp 5 miliar (karena ada rumah mewah di Menteng). Tapi median harga rumah cuma Rp 1.5 miliar. Mana yang lebih "represent" kondisi nyata buat orang biasa? Ya median!

### **Konsep Dasar Median**

Median = Nilai yang ada di posisi tengah ketika data sudah diurutkan

**Aturan Main:**
1. **Urutkan data** dari terkecil ke terbesar (WAJIB!)
2. **Hitung posisi tengah:**
   - Kalau n ganjil → Posisi = (n+1)/2
   - Kalau n genap → Median = rata-rata dua nilai tengah

### **Penalaran Median: Lebih dari Sekedar Posisi**

**Penalaran #1: Median Membagi Data 50-50**

Ini definisi paling fundamental:
- 50% data ≤ Median
- 50% data ≥ Median

**TAPI HATI-HATI!** Ini bukan berarti:
- 50% nilai ≤ Median ❌
- 50% JUMLAH DATA ≤ Median ✅

**Contoh Jebakan:**

Data nilai ujian: 40, 50, 60, 60, 60, 70, 80

Median = 60

Apakah 50% nilai ≤ 60? 
Kalau dihitung: ada 4 nilai (40,50,60,60) yang ≤ 60
4/7 = 57%, bukan 50%! 

Tapi tetap ada 50% BANYAK DATA (3.5 data) di bawah dan di atas median.

**Penalaran #2: Median Tahan Terhadap Outlier**

Ini kekuatan super median!

**Contoh Dramatis:**

**Data A**: 50, 55, 60, 65, 70 → Median = 60
**Data B**: 50, 55, 60, 65, 10000 → Median = 60 (MASIH SAMA!)

Lihat? Meskipun ada nilai gila-gilaan (10000), median tetap stabil. Ini kenapa median dipake untuk:
- Gaji (ada CEO dengan gaji selangit)
- Harga rumah (ada rumah miliaran)
- Data dengan outlier ekstrem

**Penalaran #3: Posisi Median dalam Data Genap**

Ini sering bikin bingung!

**Data**: 10, 20, 30, 40 (n=4, genap)

Posisi tengah ada di antara data ke-2 dan ke-3.

Median = (20 + 30) / 2 = 25

**PENTING:** Median = 25 **TIDAK ADA** dalam data asli!

Ini bedanya sama mean yang juga bisa ga ada dalam data, tapi median lebih sering kasusnya.

### **Kapan Median Lebih Baik dari Mean?**

**Skenario #1: Data Miring (Skewed)**

**Distribusi Gaji Karyawan:**
- 10 staff: Rp 5 juta
- 5 supervisor: Rp 15 juta
- 1 CEO: Rp 100 juta

Mean = (10×5 + 5×15 + 1×100) / 16 = 15.6 juta

Median = sekitar 5 juta (posisi tengah ke-8 dan ke-9)

Mana yang lebih "jujur"? Median! Karena mayoritas karyawan gajinya sekitar 5 juta, bukan 15.6 juta.

**Skenario #2: Data Ordinal**

Data ordinal = data yang bisa diurutkan tapi selisihnya ga berarti.

Contoh: Rating kepuasan (1=Sangat Tidak Puas, 5=Sangat Puas)

Data: 1, 2, 3, 4, 5, 5, 5

Mean = 3.6 (artinya apa? "Cukup Puas Plus"? 😅)
Median = 4 (lebih masuk akal)

**Skenario #3: Ada Data Ekstrem/Outlier**

Sudah dijelaskan di atas. Median kebal terhadap outlier!

### **Median untuk Data Berkelompok**

Ini agak tricky! Kalau data udah dalam bentuk tabel frekuensi:

**Rumus Median Data Berkelompok:**

```
Median = Tb + ((n/2 - Fk) / f) × p
```

Keterangan:
- Tb = Tepi bawah kelas median
- n = Jumlah data
- Fk = Frekuensi kumulatif sebelum kelas median
- f = Frekuensi kelas median
- p = Panjang kelas

**Langkah-langkah:**

1. **Hitung n/2** untuk tau posisi median
2. **Buat frekuensi kumulatif**
3. **Cari kelas median** (kelas yang frekuensi kumulatifnya pertama kali ≥ n/2)
4. **Masukkan ke rumus**

**Contoh:**

| Interval | f | Fk |
|----------|---|-----|
| 50-59 | 5 | 5 |
| 60-69 | 8 | 13 |
| 70-79 | 12 | 25 |
| 80-89 | 10 | 35 |
| 90-99 | 5 | 40 |

Total n = 40, jadi n/2 = 20

Kelas median = 70-79 (karena Fk pertama kali ≥ 20 adalah 25)

- Tb = 69.5 (tepi bawah kelas 70-79)
- Fk = 13 (frekuensi kumulatif sebelum kelas median)
- f = 12 (frekuensi kelas median)
- p = 10 (panjang interval)

Median = 69.5 + ((20-13)/12) × 10 = 69.5 + 5.83 = 75.33

**Jebakan SNBT:**
- Sering lupa pakai **tepi bawah** (bukan batas bawah)
- Tepi bawah = batas bawah - 0.5
- Salah hitung frekuensi kumulatif

### **Modus: Si Populer yang Paling Banyak Teman**

Modus = Nilai yang paling sering muncul (frekuensi tertinggi)

Modus itu kayak artis paling hits. Yang paling banyak penggemar (frekuensi tertinggi).

### **Karakteristik Unik Modus**

**Keunikan #1: Bisa Lebih dari Satu atau Bahkan Tidak Ada**

**Data Unimodal** (satu modus):
5, 5, 5, 6, 7, 8 → Modus = 5

**Data Bimodal** (dua modus):
1, 1, 1, 3, 5, 5, 5 → Modus = 1 dan 5

**Data Trimodal** (tiga modus):
2, 2, 4, 4, 6, 6 → Modus = 2, 4, dan 6

**Data Tanpa Modus**:
1, 2, 3, 4, 5 → Tidak ada modus (semua frekuensinya sama)

**Keunikan #2: Bisa untuk Data Non-Numerik**

Ini kelebihan modus yang ga dimiliki mean dan median!

Contoh:
- Warna favorit: Merah, Biru, Merah, Hijau, Merah → Modus = Merah
- Brand HP: Samsung, iPhone, Samsung, Oppo, Samsung → Modus = Samsung

**Keunikan #3: Nilai Modus PASTI Ada dalam Data Asli**

Beda sama mean dan median yang bisa aja ga ada dalam data.

### **Kapan Pakai Modus?**

**Skenario #1: Data Kategorikal**

Ini wilayah eksklusif modus!

Contoh:
- Hobi favorit siswa
- Jenis makanan yang paling laku
- Ukuran baju yang paling banyak terjual

**Skenario #2: Cari yang "Paling Sering"**

Pertanyaan tipe:
- "Nilai yang paling banyak muncul?"
- "Skor yang paling sering didapat?"
- "Pilihan yang paling populer?"

Langsung pakai modus!

**Skenario #3: Data Diskrit dengan Frekuensi Jelas**

Kalau ada histogram/diagram batang yang keliatan jelas puncaknya, itu modus!

### **Modus untuk Data Berkelompok**

**Rumus Modus Data Berkelompok:**

```
Modus = Tb + (d₁ / (d₁ + d₂)) × p
```

Keterangan:
- Tb = Tepi bawah kelas modus
- d₁ = Selisih frekuensi kelas modus dengan kelas sebelumnya
- d₂ = Selisih frekuensi kelas modus dengan kelas sesudahnya
- p = Panjang kelas

**Langkah-langkah:**

1. **Cari kelas modus** (kelas dengan frekuensi tertinggi)
2. **Hitung d₁ dan d₂**
3. **Masukkan ke rumus**

**Contoh:**

| Interval | Frekuensi |
|----------|-----------|
| 60-69 | 5 |
| 70-79 | 12 | ← Kelas modus (frekuensi tertinggi)
| 80-89 | 8 |

- Tb = 69.5
- d₁ = 12 - 5 = 7 (selisih dengan kelas sebelumnya)
- d₂ = 12 - 8 = 4 (selisih dengan kelas sesudahnya)
- p = 10

Modus = 69.5 + (7/(7+4)) × 10 = 69.5 + 6.36 = 75.86

### **Perbandingan Mean, Median, dan Modus**

**Dalam Distribusi Simetris (Normal):**
Mean = Median = Modus

Ini bentuknya kayak lonceng sempurna. ️

**Dalam Distribusi Miring Kanan (Right Skewed):**
Modus < Median < Mean

Analogi: Ada beberapa nilai besar yang "nyeret" mean ke kanan.
Contoh: Gaji (mayoritas kecil, beberapa CEO gaji gede)

**Dalam Distribusi Miring Kiri (Left Skewed):**
Mean < Median < Modus

Analogi: Ada beberapa nilai kecil yang "tarik" mean ke kiri.
Contoh: Usia pensiun (mayoritas pensiun 60-65, beberapa pensiun dini)

**Jebakan SNBT:**

Soal: "Jika mean > median, maka bentuk distribusinya..."

Jawaban: Miring kanan (ada outlier besar)

Banyak yang jawab "miring kiri" karena mean "lebih besar" jadi dikira di kiri. Padahal kebalik!

### **Tips Memilih: Mean, Median, atau Modus?**

**Gunakan Mean jika:**
✅ Data simetris tanpa outlier
✅ Semua data sama penting
✅ Butuh perhitungan statistik lanjutan

**Gunakan Median jika:**
✅ Ada outlier ekstrem
✅ Data miring (skewed)
✅ Data ordinal (bisa diurutkan)

**Gunakan Modus jika:**
✅ Data kategorikal
✅ Cari yang "paling populer"
✅ Data diskrit dengan frekuensi jelas

### **Jebakan SNBT Kombinasi Median-Modus**

**Jebakan #1: "Median selalu di tengah-tengah nilai"**

❌ SALAH!

Data: 1, 2, 3, 100, 1000

Median = 3 (posisi tengah), tapi 3 ga ada di "tengah-tengah" nilai 1 dan 1000!

**Jebakan #2: "Modus paling sering = Modus paling besar frekuensinya"**

Ini benar secara definisi, tapi jebakan muncul kalau ada dua nilai dengan frekuensi sama besar!

Data: 1,1,1, 2,2,2, 3

Banyak yang jawab modus = 3 (karena paling terakhir)
Padahal modus = 1 dan 2 (keduanya muncul 3 kali) ✅

**Jebakan #3: "Data genap pasti mediannya bukan bilangan asli"**

❌ TIDAK SELALU!

Data: 10, 20, 30, 40

Median = (20+30)/2 = 25 (bukan bilangan dalam data)

Tapi:
Data: 10, 20, 20, 30

Median = (20+20)/2 = 20 (ada dalam data!) ✅

### **Strategi Cepat SNBT**

**Untuk Median:**
1. Lihat apakah data sudah terurut → kalau belum, urutkan dulu!
2. Hitung n → ganjil atau genap?
3. Kalau ganjil → ambil tengah
4. Kalau genap → rata-rata dua tengah

**Untuk Modus:**
1. Scan cepat angka yang muncul > 1 kali
2. Kalau semua cuma muncul 1 kali → tidak ada modus
3. Kalau ada beberapa dengan frekuensi sama tertinggi → bimodal/multimodal

### **Penutup Materi 3.2.3**

Median dan modus adalah "saudara" mean yang punya kelebihan spesifik:

- **Median** = Pahlawan kalau ada outlier
- **Modus** = Satu-satunya yang bisa handle data kategorikal

Ingat: **Ga ada ukuran yang "paling baik" mutlak. Yang ada adalah ukuran yang paling COCOK untuk situasi tertentu.**

Di materi selanjutnya, kita akan masuk ke dunia ukuran penyebaran, dimulai dari **jangkauan dan kuartil**! 📊

---
