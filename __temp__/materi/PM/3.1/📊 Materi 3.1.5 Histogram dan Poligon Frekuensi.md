# SECTION 3: Statistika dan Probabilitas
## Topic 3.1: Analisis Data

---


## 📊 Materi 3.1.5: Histogram dan Poligon Frekuensi

### Welcome to the World of Distribusi Data!

Histogram dan poligon frekuensi adalah "saudara kandung" yang dipakai buat ngeliat **distribusi** atau **sebaran** data. Beda sama grafik batang biasa, ini khusus buat data **kuantitatif berkelompok**. Think of it as "profil" dari data kamu!

### Histogram: The Distribution Master

**Apa itu Histogram?**
Grafik batang khusus di mana:
- Sumbu X = kelas/interval (misal: 0-10, 10-20, 20-30)
- Sumbu Y = frekuensi (berapa data yang masuk ke interval itu)
- **Nggak ada jarak** antar batang (berbeda dengan bar chart!)
- Lebar batang bisa sama atau beda

**Contoh konteks:**

```
Nilai Ujian Matematika Kelas XII (40 siswa)

Frekuensi
    |
12  |         ████
    |         ████
10  |         ████
    |         ████
 8  |     ████████
    |     ████████
 6  |     ████████████
    | ████████████████
 4  | ████████████████
    | ████████████████████
 2  | ████████████████████
    |_████████████████████_______
      0-20 20-40 40-60 60-80 80-100
           Interval Nilai
```

**Insight yang didapat:**
- **Paling banyak** siswa dapat nilai 60-80
- **Paling sedikit** di interval 0-20
- **Distribusi:** Cenderung ke kanan (nilai tinggi)
- **Bentuk:** Bell-curve tapi agak skewed

### Komponen Histogram

#### 1. **Kelas/Interval**
Range nilai yang dikelompokkan. Misal: 0-20, 20-40, dst.

**Perhatikan:**
- Batas bawah dan batas atas
- Lebar interval (selisih batas atas - batas bawah)
- Overlapping atau tidak (0-20 & 20-40 → angka 20 masuk mana?)

**Konvensi umum:**
- **0-20:** Include 0, exclude 20 [0, 20)
- **20-40:** Include 20, exclude 40 [20, 40)
- Atau sebaliknya, tergantung soal!

#### 2. **Frekuensi**
Jumlah data yang masuk ke interval tertentu.

**Jenis frekuensi:**
- **Frekuensi absolut:** Jumlah data (5 siswa, 12 siswa, dst.)
- **Frekuensi relatif:** Proporsi dari total (5/40 = 12,5%)
- **Frekuensi kumulatif:** Jumlah sampai kelas tertentu

#### 3. **Titik Tengah Kelas**
Nilai tengah dari interval.
Rumus: (Batas bawah + Batas atas) / 2

Contoh: Kelas 20-40 → Titik tengah = (20+40)/2 = 30

### Cara Baca Histogram

#### **Step 1: Identifikasi Struktur**
- Berapa kelas/interval yang ada?
- Berapa lebar tiap interval?
- Apakah semua interval sama lebar?

#### **Step 2: Baca Frekuensi per Kelas**
Dari tinggi batang, tentukan frekuensi. Perhatikan skala sumbu Y!

#### **Step 3: Analisis Distribusi**
- **Normal:** Bentuk lonceng (bell curve), simetris
- **Skewed right:** Ekor panjang ke kanan (banyak nilai rendah)
- **Skewed left:** Ekor panjang ke kiri (banyak nilai tinggi)
- **Bimodal:** Dua puncak (ada 2 kelompok dominan)
- **Uniform:** Semua kelas frekuensinya mirip (datar)

#### **Step 4: Hitung Total**
Total data = Jumlah semua frekuensi

### Poligon Frekuensi: The Smooth Operator

**Apa itu Poligon Frekuensi?**
Grafik garis yang dibuat dengan menghubungkan **titik tengah** tiap kelas histogram dengan frekuensinya.

**Cara membuat:**
1. Plot titik di (titik tengah kelas, frekuensi)
2. Hubungkan titik-titik dengan garis
3. Tutup di ujung dengan titik (titik tengah kelas sebelum & sesudah, frekuensi 0)

**Contoh visual:**

```
    |
12  |         •
    |        / \
10  |       /   \
    |      /     \
 8  |     •       \
    |    /         \
 6  |   /           •
    |  /           / \
 4  | •           /   •
    |/           /     \
 2  •           /       \___
    |___________/___________•___
      10   30   50   70   90  110
         Titik Tengah Kelas
```

**Keunggulan Poligon Frekuensi:**
- Lebih smooth, enak diliat
- Gampang compare 2+ distribusi (overlap beberapa poligon)
- Nunjukin tren lebih jelas

### Hubungan Histogram dengan Statistik

**1. Modus (Mo)**
Kelas dengan **frekuensi tertinggi** = kelas modus
Di histogram: batang paling tinggi!

**2. Median (Me)**
Nilai tengah data. Di histogram berkelompok:
- Cari kelas median (kelas yang berisi data ke-n/2)
- Gunakan rumus interpolasi

**3. Mean (x̄)**
Rata-rata. Di histogram berkelompok:
x̄ = Σ(titik tengah × frekuensi) / Σfrekuensi

### Frekuensi Kumulatif

**Frekuensi Kumulatif:** Penjumlahan frekuensi dari kelas pertama sampai kelas tertentu.

**Contoh:**
```
Kelas    | Frekuensi | Frek. Kumulatif
---------|-----------|----------------
0-20     |     2     |       2
20-40    |     5     |       7 (2+5)
40-60    |     8     |      15 (7+8)
60-80    |    12     |      27 (15+12)
80-100   |     6     |      33 (27+6)
```

**Kegunaan:**
- Menentukan berapa siswa yang nilainya **di bawah** 60 → 15 siswa
- Menentukan berapa siswa yang nilainya **di atas** 60 → 33-15 = 18 siswa
- Cari median, kuartil, persentil

### Ogive (Grafik Frekuensi Kumulatif)

Ogive adalah grafik garis dari frekuensi kumulatif.

**2 jenis:**
1. **Ogive positif:** Frekuensi kumulatif "kurang dari"
2. **Ogive negatif:** Frekuensi kumulatif "lebih dari"

**Contoh Ogive Positif:**
```
Frek.
Kum.
40  |               •
    |             /
30  |           •
    |         /
20  |       •
    |     /
10  |   •
    | /
 0  •________________
    0  20  40  60  80  100
         Batas Atas Kelas
```

**Kegunaan:**
Dari ogive, bisa cari:
- **Median:** Titik di mana frek. kumulatif = n/2
- **Kuartil:** Q1 (n/4), Q3 (3n/4)
- **Persentil:** P10, P90, dst.

### Jenis Pertanyaan Histogram & Poligon

#### **Tipe 1: Baca Frekuensi**
"Berapa siswa yang mendapat nilai 60-80?"
→ Baca tinggi batang: 12 siswa ✓

#### **Tipe 2: Total Data**
"Berapa total siswa?"
→ Jumlah semua frekuensi: 2+5+8+12+6 = 33 siswa ✓

#### **Tipe 3: Persentase**
"Berapa persen siswa yang mendapat nilai 60-80?"
→ (12/33) × 100% ≈ 36,4% ✓

#### **Tipe 4: Frekuensi Kumulatif**
"Berapa siswa yang nilainya kurang dari 60?"
→ Frek. kum. di kelas 40-60: 2+5+8 = 15 siswa ✓

#### **Tipe 5: Analisis Distribusi**
"Bagaimana bentuk distribusi data?"
→ Skewed right / Normal / Bimodal / etc. (deskriptif)

#### **Tipe 6: Perbandingan**
"Berapa selisih frekuensi kelas tertinggi dan terendah?"
→ 12 - 2 = 10 ✓

### Red Flags & Jebakan

🚩 **Jebakan #1: Lebar Interval Tidak Sama**
Kalau interval nggak sama lebar, **frekuensi density** harus dihitung!
Frek. density = Frekuensi / Lebar interval

Batang dengan frekuensi tinggi tapi interval lebar bisa misleading!

🚩 **Jebakan #2: Overlap Batas Kelas**
"Berapa siswa yang nilainya 40?"
Kalau kelasnya 20-40 dan 40-60, angka 40 masuk yang mana? Baca konvensi soal!

🚩 **Jebakan #3: Frekuensi vs Frekuensi Kumulatif**
Ditanya "berapa yang nilainya antara 40-60" (frekuensi biasa)
Jangan jawab pake frekuensi kumulatif!

🚩 **Jebakan #4: Titik Tengah vs Batas Kelas**
Di poligon, plot di **titik tengah**, bukan batas!
Kelas 20-40 → plot di 30, bukan 20 atau 40

🚩 **Jebakan #5: Skala Sumbu Y**
Lompat per 2? Per 5? Per 10? Teliti baca skala!

### Pro Tips untuk Histogram

💡 **Tip #1: Quick Estimation**
Kalau sumbu Y nggak jelas angkanya, estimasi dari tinggi relatif.
Batang A 2x tinggi batang B → frekuensi A = 2 × frekuensi B

💡 **Tip #2: Tabel Bantu**
Kalau soal kompleks, bikin tabel:
```
Kelas | Frek | Titik Tengah | f × x
------|------|--------------|------
```
Ini membantu ngitung mean atau analisis lain.

💡 **Tip #3: Visual Pattern Recognition**
- Puncak di tengah + simetris → Normal distribution
- Puncak di kiri → Right-skewed (banyak nilai rendah)
- Puncak di kanan → Left-skewed (banyak nilai tinggi)

💡 **Tip #4: Frekuensi Relatif untuk Perbandingan**
Kalau compare 2 histogram dengan total berbeda, pake frekuensi relatif (%)!
Total 100 siswa vs 50 siswa → konversi ke persen biar apple-to-apple.

💡 **Tip #5: Cek Total**
Setelah ngitung, cek: "Total frekuensi sama dengan yang disebutkan di soal?"
Kalau beda, ada yang salah!

### Histogram dalam Konteks SNBT

Di SNBT, histogram sering dipake buat:
- Data nilai ujian siswa
- Data tinggi/berat badan
- Data penghasilan
- Data umur/usia
- Data waktu (durasi)

**Pertanyaan tipikal:**
- "Berapa siswa yang nilainya di atas rata-rata kelas?"
- "Pada interval mana median terletak?"
- "Berapa persen siswa yang lulus (nilai ≥ 60)?"
- "Bandingkan distribusi kelas A dan B!"

### Master Strategy

⚡ **Untuk Histogram:**
1. Identifikasi jumlah kelas dan lebar interval
2. Baca frekuensi per kelas dari tinggi batang
3. Hitung total (Σfrekuensi) kalau dibutuhkan
4. Analisis bentuk distribusi
5. Jawab pertanyaan spesifik

⚡ **Untuk Poligon Frekuensi:**
1. Tentukan titik tengah tiap kelas
2. Plot di (titik tengah, frekuensi)
3. Hubungkan dengan garis
4. Analisis tren dan puncak
5. Compare dengan distribusi lain kalau ada

⚡ **Untuk Ogive:**
1. Hitung frekuensi kumulatif
2. Plot di (batas atas kelas, frek. kum.)
3. Cari nilai median/kuartil dari grafik
4. Interpolasi kalau perlu nilai exact

---
