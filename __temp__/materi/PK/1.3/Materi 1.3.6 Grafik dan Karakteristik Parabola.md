# SECTION 1: Aljabar dan Persamaan
## Topic 1.3: Persamaan Kuadrat

---


## **Materi 1.3.6: Grafik dan Karakteristik Parabola**

### **Deep Dive into Parabola: The Beautiful Curve!**

Welcome back, parabola enthusiasts! 🎨

Di materi sebelumnya kita udah kenal dasar-dasar parabola. Sekarang kita akan menyelami lebih dalam: bagaimana menganalisis parabola dari berbagai sudut pandang, membaca informasi dari grafik, dan menyelesaikan soal-soal tricky yang sering muncul di UTBK!

Materi ini adalah "master class" parabola—setelah ini, kamu bakal bisa "membaca" grafik parabola seperti membaca komik favorit! 📊

### **Analisis Mendalam: Pengaruh Koefisien terhadap Bentuk Parabola**

Mari kita bedah satu per satu bagaimana setiap koefisien "mengukir" bentuk parabola!

### **1. Koefisien a: The Shape Master**

**a** adalah "arsitek utama" yang mendesain bentuk dasar parabola.

**Karakteristik Detail:**

**A. ARAH PARABOLA**

**a > 0 (Positif):**
- Parabola membuka ke **ATAS** (∪)
- Grafik "happy" - ujungnya naik
- Memiliki **titik MINIMUM**
- Semakin jauh dari puncak, nilai y semakin BESAR
- Fungsi akan menuju +∞ saat x → ±∞

**a < 0 (Negatif):**
- Parabola membuka ke **BAWAH** (∩)
- Grafik "sad" - ujungnya turun
- Memiliki **titik MAKSIMUM**
- Semakin jauh dari puncak, nilai y semakin KECIL
- Fungsi akan menuju -∞ saat x → ±∞

**B. KETAJAMAN PARABOLA**

Mari kita lihat perbandingan konkret:

**|a| = 0.25** (sangat kecil)
```
        _________
       /         \
      /           \
     /             \
```
Parabola sangat **TUMPUL** (lebar banget)

**|a| = 1** (standar)
```
       _____
      /     \
     /       \
    /         \
```
Parabola **NORMAL**

**|a| = 4** (besar)
```
      /\
     /  \
    /    \
   /      \
```
Parabola sangat **LANCIP** (sempit)

**|a| = 10** (sangat besar)
```
     ||
     ||
    /  \
   /    \
```
Parabola hampir seperti garis vertikal!

**Rumus Praktis:**

Jika dua parabola punya puncak yang sama:
- Yang punya |a| lebih besar akan **lebih curam**
- Yang punya |a| lebih kecil akan **lebih landai**

**Contoh Perbandingan:**

Bandingkan: f(x) = 0.5x² dan g(x) = 3x²

Kedua fungsi punya puncak di (0, 0), tapi:

| x | f(x) = 0.5x² | g(x) = 3x² |
|---|-------------|-----------|
| 1 | 0.5 | 3 |
| 2 | 2 | 12 |
| 3 | 4.5 | 27 |

Lihat! g(x) naik JAUH lebih cepat → lebih lancip! ✅

**C. LAJU PERTUMBUHAN**

Semakin besar |a|, semakin cepat fungsi "tumbuh" menjauhi puncak.

Ini penting untuk:
- Pemodelan fisika (kecepatan perubahan)
- Optimasi (sensitivitas terhadap perubahan)
- Prediksi trend

### **2. Koefisien b: The Horizontal Shifter**

**b** menggeser posisi parabola secara horizontal dan mempengaruhi letak puncak.

**Analisis Tanda a dan b:**

**KASUS 1: a > 0, b > 0**
```
Contoh: f(x) = x² + 4x + 3

         |
      ---|---
     /   |   
    /    |
   •     |  (puncak di kiri)
_________|_________
         0
```
- Puncak di **KIRI** sumbu y (x < 0)
- Parabola "condong ke kiri"
- p = -b/(2a) = negatif

**KASUS 2: a > 0, b < 0**
```
Contoh: f(x) = x² - 4x + 3

         |
         |   ---
         |       \
         |        \  (puncak di kanan)
_________|_______•_
         0
```
- Puncak di **KANAN** sumbu y (x > 0)
- Parabola "condong ke kanan"
- p = -b/(2a) = positif

**KASUS 3: a > 0, b = 0**
```
Contoh: f(x) = x² + 3

         •
        / \
       /   \
      /     \
_____|_______|_____
     0
```
- Puncak tepat di **SUMBU Y** (x = 0)
- Parabola **SIMETRIS** sempurna terhadap sumbu y
- Ini adalah parabola paling "centered"

**KASUS 4: a < 0, b > 0**
```
Contoh: f(x) = -x² + 4x - 3

_________|_______•_
         0         \
         |          \
         |   -------
         |
```
- Puncak di **KANAN** sumbu y
- p = -b/(2a) = positif (karena a negatif)

**KASUS 5: a < 0, b < 0**
```
Contoh: f(x) = -x² - 4x - 3

   •     |
    \    |
     \   |
      ---|---
         |
_________|_________
         0
```
- Puncak di **KIRI** sumbu y
- p = -b/(2a) = negatif

**KASUS 6: a < 0, b = 0**
```
Contoh: f(x) = -x² + 5

_____|_______|_____
     \   •   /
      \     /
       \   /
        \ /
         0
```
- Puncak di sumbu y
- Simetris sempurna

**Rumus Memorize:**

**Untuk menentukan posisi puncak tanpa hitung:**
- **a dan b SAMA tanda** → puncak di KIRI (x < 0)
- **a dan b BEDA tanda** → puncak di KANAN (x > 0)
- **b = 0** → puncak di TENGAH (x = 0)

### **3. Koefisien c: The Y-Interceptor**

**c** adalah koefisien paling simple tapi sering jadi kunci!

**Fungsi c:**

1. **Titik Potong Sumbu Y**
   - Koordinat: (0, c)
   - Ini PASTI selalu berlaku untuk semua fungsi kuadrat

2. **Nilai Fungsi Saat x = 0**
   - f(0) = c
   - Starting point kalau kita trace dari origin

3. **Pergeseran Vertikal**
   - c positif → parabola naik
   - c negatif → parabola turun
   - c = 0 → parabola lewat origin

**Analisis Mendalam:**

**c > 0 (Positif):**
```
  3 •  (0, c)
    |    \  /
  0 |     \/
____|______|____
    |
```
- Parabola memotong sumbu y di ATAS origin
- Untuk a > 0: kalau c besar, kemungkinan tidak memotong sumbu x
- Untuk a < 0: pasti memotong sumbu x

**c = 0:**
```
    |   /\
    |  /  \
  0 •-------
    | origin
____|______|____
```
- Parabola melewati ORIGIN (0, 0)
- Persamaan bisa difaktorkan: x(ax + b) = 0
- Salah satu akar pasti x = 0

**c < 0 (Negatif):**
```
    |     /\
  0 |____/  \____
    |
 -2 •  (0, c)
```
- Parabola memotong sumbu y di BAWAH origin
- Untuk a > 0: pasti memotong sumbu x
- Untuk a < 0: kalau |c| besar, mungkin tidak memotong sumbu x

**Hubungan c dengan Akar-akar:**

Ingat rumus Vieta: **x₁ × x₂ = c/a**

Jadi:
- Kalau **c/a > 0**: kedua akar bertanda SAMA (kedua positif atau kedua negatif)
- Kalau **c/a < 0**: akar-akar bertanda BEDA (satu positif, satu negatif)
- Kalau **c = 0**: salah satu akar adalah 0

### **Menggambar Sketsa Grafik Parabola: Teknik Pro**

Sekarang kita gabungkan semua pengetahuan di atas untuk menggambar parabola dengan cepat dan akurat!

**METODE SISTEMATIS:**

**Contoh 1: Fungsi dengan Informasi Lengkap**

Gambar sketsa f(x) = 2x² - 8x + 6!

**STEP 1: Analisis Koefisien**
- a = 2 > 0 → buka ATAS ✅
- |a| = 2 (sedang) → ketajaman normal
- b = -8, a dan b beda tanda → puncak di KANAN
- c = 6 > 0 → potong sumbu y di (0, 6)

**STEP 2: Hitung Puncak**
- p = -(-8)/(2·2) = 8/4 = 2
- q = f(2) = 2(4) - 8(2) + 6 = 8 - 16 + 6 = -2
- **Puncak: (2, -2)** → ini titik MINIMUM ✅

**STEP 3: Sumbu Simetri**
- x = 2 ✅

**STEP 4: Titik Potong Sumbu Y**
- (0, 6) ✅

**STEP 5: Titik Potong Sumbu X**
- 2x² - 8x + 6 = 0
- x² - 4x + 3 = 0
- (x - 1)(x - 3) = 0
- **Titik: (1, 0) dan (3, 0)** ✅

**STEP 6: Check Diskriminan**
- D = 64 - 48 = 16 > 0 ✅ (ada 2 titik potong)

**STEP 7: Titik Tambahan (Simetri)**
- f(0) = 6, maka f(4) = 6 (simetris thd x = 2)
- Cek: f(4) = 2(16) - 8(4) + 6 = 32 - 32 + 6 = 6 ✅

**STEP 8: GAMBAR!**

```
    y
    |
  6 •-------------•
    |    \     /
  4 |     \   /
    |      \ /
  2 |       |
    |       |
  0 |---•---•---•--- x
    | 0 1   2   3 4
 -2 |       •
    |   (minimum)
```

**Contoh 2: Parabola Buka Bawah**

Gambar sketsa g(x) = -x² + 4x - 3!

**ANALISIS:**
- a = -1 < 0 → buka BAWAH ✅
- b = 4, a dan b beda tanda → puncak di KANAN
- c = -3 < 0 → potong sumbu y di (0, -3)

**PERHITUNGAN:**
- Puncak: p = -4/(2·(-1)) = 2
- q = g(2) = -4 + 8 - 3 = 1
- **Puncak: (2, 1)** → titik MAKSIMUM ✅

**TITIK POTONG X:**
- -x² + 4x - 3 = 0
- x² - 4x + 3 = 0
- (x - 1)(x - 3) = 0
- **(1, 0) dan (3, 0)** ✅

**GRAFIK:**

```
    y
    |
  1 |       •  (maksimum)
    |      / \
  0 |---•-|---•--- x
    | 0 1 2   3
 -3 •     |
    |     |
```

**Contoh 3: Parabola Tanpa Akar Real**

Gambar sketsa h(x) = x² - 2x + 5!

**ANALISIS:**
- a = 1 > 0 → buka ATAS
- c = 5 > 0 → tinggi!

**CHECK DISKRIMINAN:**
- D = 4 - 20 = -16 < 0
- **TIDAK ada titik potong sumbu x!** ✅

**PUNCAK:**
- p = 1, q = 1 - 2 + 5 = 4
- **(1, 4)** ✅

**GRAFIK:**

```
    y
    |
  5 •     ___
    |    /   \
  4 |   |  •  |  (puncak di atas sumbu x)
    |    \___/
  1 |____________ x
    0     1
```

**Insight:** Karena D < 0 dan a > 0, parabola "melayang" di atas sumbu x!

### **Aplikasi Parabola dalam Masalah Nyata**

Nah, ini bagian seru! Parabola bukan cuma teori—dia ada di MANA-MANA di dunia nyata!

**APLIKASI 1: Gerak Peluru (Fisika)**

Peluru ditembakkan dengan persamaan tinggi:

h(t) = -5t² + 20t + 5 (meter)

di mana t = waktu (detik)

**Pertanyaan:**
a) Tinggi maksimum?
b) Kapan mencapai tinggi maksimum?
c) Kapan peluru menyentuh tanah?

**Penyelesaian:**

a = -5 < 0 → ada maksimum

**a) Tinggi maksimum:**
- t = -20/(2·(-5)) = 2 detik
- h(2) = -5(4) + 20(2) + 5 = -20 + 40 + 5 = **25 meter** ✅

**b) Waktu maksimum: t = 2 detik** ✅

**c) Menyentuh tanah saat h(t) = 0:**
- -5t² + 20t + 5 = 0
- t² - 4t - 1 = 0
- t = [4 ± √(16 + 4)]/2 = [4 ± √20]/2 = 2 ± √5

Ambil yang positif: t = 2 + √5 ≈ **4.24 detik** ✅

**APLIKASI 2: Maksimisasi Luas (Optimasi)**

Seorang petani punya 60 meter pagar untuk membuat kandang berbentuk persegi panjang. Salah satu sisi menggunakan sungai (tidak perlu pagar). Berapa dimensi agar luasnya maksimal?

**Penyelesaian:**

Misalkan:
- Lebar = x meter
- Panjang = (60 - 2x) meter

Luas:
L(x) = x(60 - 2x) = 60x - 2x²

Ini fungsi kuadrat dengan a = -2 < 0 → ada maksimum

**Luas maksimum:**
- x = -60/(2·(-2)) = 15 meter
- L(15) = 15(60 - 30) = 15(30) = **450 m²** ✅

**Dimensi optimal:**
- Lebar = 15 m
- Panjang = 30 m ✅

**APLIKASI 3: Profit Maksimum (Ekonomi)**

Sebuah perusahaan menjual produk dengan fungsi profit:

P(x) = -2x² + 80x - 300 (juta rupiah)

di mana x = jumlah produk (ratusan unit)

**Berapa unit harus diproduksi untuk profit maksimal?**

**Penyelesaian:**

a = -2 < 0 → ada maksimum

- x = -80/(2·(-2)) = 20
- P(20) = -2(400) + 80(20) - 300
- P(20) = -800 + 1600 - 300 = **500 juta** ✅

**Produksi optimal: 2000 unit (20 × 100)** ✅

**APLIKASI 4: Jembatan Parabola (Teknik Sipil)**

Sebuah jembatan berbentuk parabola dengan persamaan:

y = -0.02x² + 2x

di mana x dan y dalam meter.

**Pertanyaan:**
a) Tinggi maksimum jembatan?
b) Lebar jembatan di dasar?

**Penyelesaian:**

**a) Tinggi maksimum:**
- x = -2/(2·(-0.02)) = 2/0.04 = 50 m
- y = -0.02(2500) + 2(50) = -50 + 100 = **50 m** ✅

**b) Lebar di dasar (y = 0):**
- -0.02x² + 2x = 0
- x(-0.02x + 2) = 0
- x = 0 atau x = 100
- **Lebar = 100 m** ✅

### **🎯 TIPS JITU UTBK:**

**1. Baca Grafik dengan Urutan:**
- Arah (atas/bawah) → tahu a
- Puncak → tahu p dan q
- Potong sumbu y → tahu c
- Potong sumbu x → tahu akar-akar

**2. Gunakan Simetri!**

Kalau tahu satu titik, kamu bisa cari pasangannya:
- Jika (p - d, y) ada di grafik
- Maka (p + d, y) juga ada! ✅

**3. Check Diskriminan untuk Validasi**

Sebelum gambar, cek D untuk tahu hubungan dengan sumbu x!

**4. Untuk Soal Aplikasi:**
- Identifikasi variabel dengan jelas
- Susun fungsi kuadrat
- Cari puncak untuk optimasi
- Interpret hasil dalam konteks soal

**5. Jangan Terkecoh Skala!**

Di pilihan ganda, perhatikan skala sumbu—grafik bisa terlihat beda tapi sama secara matematis!

### **⚠️ JEBAKAN UMUM di UTBK:**

**Jebakan 1: Salah Identifikasi Arah**

Soal kasih grafik buka bawah, tapi pilihan jawaban tulis a > 0!
- Lihat grafik dengan teliti!

**Jebakan 2: Koordinat Puncak vs Nilai Ekstrem**

Ditanya: "Nilai maksimum"
- Jawab: **q** (nilai y) ✅
- BUKAN: (p, q) atau p ❌

**Jebakan 3: Lupa Konversi Satuan**

Soal fisika sering pakai satuan berbeda. Konversi dulu!

**Jebakan 4: Akar Negatif Diabaikan**

Dalam konteks waktu, akar negatif tidak valid!
- Ambil hanya yang positif ✅

**Jebakan 5: Grafik Mirror**

Dua grafik bisa kelihatan sama tapi satu buka atas, satu buka bawah!
- Cek tanda a dengan teliti!

### **💡 INSIGHT PENTING:**

**Pattern Recognition di UTBK:**

Soal UTBK sering kasih grafik dengan pola tertentu:
1. **Puncak di origin** (p = 0, q = 0) → b dan c bernilai khusus
2. **Simetris terhadap sumbu y** (b = 0) → bentuk paling simple
3. **Lewat origin** (c = 0) → salah satu akar adalah 0
4. **Tidak potong sumbu x** (D < 0) → semua nilai y bertanda sama dengan a

**Trik Cepat Analisis Grafik:**

Dari GRAFIK ke PERSAMAAN:
1. Lihat arah → tahu tanda a
2. Baca puncak → dapat p dan q
3. Baca potong y → dapat c
4. Dari puncak, gunakan bentuk vertex:
   **f(x) = a(x - p)² + q**
5. Ekspansi kalau perlu!

**Dari PERSAMAAN ke GRAFIK:**
1. Hitung diskriminan → tahu hubungan dengan sumbu x
2. Hitung puncak → lokasi ekstrem
3. Plot titik-titik kunci
4. Gambar kurva halus

### **🔥 BONUS: Shortcuts untuk Soal Cepat**

**Shortcut 1: Cek Simetri**

Kalau ditanya f(a) dan tahu f(b), dengan puncak di x = p:
- Jika a dan b sama jaraknya dari p → f(a) = f(b)!

**Shortcut 2: Akar dari Grafik**

Kalau grafik jelas potong x di bilangan bulat → jangan pakai ABC, langsung faktorkan!

**Shortcut 3: Vertex dari Faktor**

Kalau f(x) = a(x - r)(x - s), puncak ada di **x = (r + s)/2**

**Shortcut 4: Tinggi Puncak dari Akar**

Kalau akar x₁ dan x₂ diketahui:
- Koordinat x puncak = (x₁ + x₂)/2
- Tinggi puncak = f((x₁ + x₂)/2)

---

*Wah, kita udah jadi expert parabola nih! Siap lanjut ke materi terakhir Topic 1.3? Di **Materi 1.3.7**, kita akan taklukkan **Pertidaksamaan Kuadrat**—kakaknya persamaan kuadrat yang lebih challenging! 💪🚀*
