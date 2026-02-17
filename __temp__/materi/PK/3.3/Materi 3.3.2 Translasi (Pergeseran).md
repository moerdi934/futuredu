# SECTION 3: Geometri dan Pengukuran
## Topic 3.3: Transformasi Geometri

---


## **Materi 3.3.2: Translasi (Pergeseran)**

### Apa Itu Translasi?

Translasi adalah **perpindahan setiap titik pada suatu bangun dengan jarak dan arah yang sama**. Bayangin kamu lagi main catur, terus kamu geser pion dari satu kotak ke kotak lain — itu translasi! Pionnya tetap sama (bentuk, ukuran, orientasi), cuma posisinya aja yang berubah.

Dalam matematika, translasi dilakukan dengan **menambahkan vektor pergeseran** ke koordinat titik awal.

### Vektor Translasi

Translasi dilambangkan dengan **T(a, b)** atau vektor **T = (a, b)** atau **T = $\begin{pmatrix} a \\ b \end{pmatrix}$**

Di mana:
- **a** = pergeseran horizontal (searah sumbu x)
  - a > 0 → geser ke KANAN
  - a < 0 → geser ke KIRI
- **b** = pergeseran vertikal (searah sumbu y)
  - b > 0 → geser ke ATAS
  - b < 0 → geser ke BAWAH

**Contoh Interpretasi**:
- T(3, 2) → geser 3 satuan ke kanan, 2 satuan ke atas
- T(-4, 5) → geser 4 satuan ke kiri, 5 satuan ke atas
- T(2, -3) → geser 2 satuan ke kanan, 3 satuan ke bawah

### Rumus Translasi

Jika titik **A(x, y)** ditranslasi oleh **T(a, b)**, maka bayangan **A'(x', y')** adalah:

**x' = x + a**
**y' = y + b**

Atau dalam bentuk matriks:
**$\begin{pmatrix} x' \\ y' \end{pmatrix} = \begin{pmatrix} x \\ y \end{pmatrix} + \begin{pmatrix} a \\ b \end{pmatrix}$**

Simpel kan? Tinggal **TAMBAH** aja!

### Langkah-Langkah Menentukan Bayangan Titik

**Contoh Soal**: Titik P(4, -2) ditranslasi oleh T(3, 5). Tentukan koordinat P'!

**Langkah 1**: Identifikasi koordinat awal dan vektor translasi
- P(4, -2) → x = 4, y = -2
- T(3, 5) → a = 3, b = 5

**Langkah 2**: Gunakan rumus translasi
- x' = x + a = 4 + 3 = 7
- y' = y + b = -2 + 5 = 3

**Langkah 3**: Tulis koordinat bayangan
- P'(7, 3) ✓

**Tips Cepat**: Kamu bisa langsung menulis:
P(4, -2) + T(3, 5) = P'(7, 3)

### Menentukan Bayangan Bangun Datar

Untuk bangun datar (segitiga, persegi, dll), **setiap titik sudut ditranslasi dengan vektor yang sama**.

**Contoh**: Segitiga ABC dengan A(1, 2), B(4, 2), C(3, 5) ditranslasi T(-2, 3). Tentukan koordinat A'B'C'!

**Solusi**:
- A(1, 2) + T(-2, 3) = A'(-1, 5)
- B(4, 2) + T(-2, 3) = B'(2, 5)
- C(3, 5) + T(-2, 3) = C'(1, 8)

Hasilnya: Segitiga A'B'C' dengan A'(-1, 5), B'(2, 5), C'(1, 8)

**Sifat Penting**: 
- Bentuk segitiga ABC dan A'B'C' **IDENTIK** (sama dan sebangun)
- Luas ABC = Luas A'B'C'
- Panjang AB = Panjang A'B'

### Translasi Balik (Mencari Titik Awal)

Soal SNBT kadang terbalik: Kamu dikasih bayangan dan vektor, diminta cari titik awal.

**Rumus Translasi Balik**:
Jika A'(x', y') adalah bayangan dari A(x, y) oleh T(a, b), maka:

**x = x' - a**
**y = y' - b**

**Contoh**: Bayangan titik Q oleh translasi T(4, -3) adalah Q'(7, 2). Tentukan koordinat Q!

**Solusi**:
- x = x' - a = 7 - 4 = 3
- y = y' - b = 2 - (-3) = 2 + 3 = 5
- Jadi Q(3, 5) ✓

### Menentukan Vektor Translasi

Kadang soalnya: "Titik A(2, 5) ditranslasi menjadi A'(6, 1). Tentukan vektor translasinya!"

**Rumus**:
**a = x' - x**
**b = y' - y**

**Solusi**:
- a = 6 - 2 = 4
- b = 1 - 5 = -4
- Vektor translasi: T(4, -4) ✓

Artinya: geser 4 ke kanan, 4 ke bawah.

### Komposisi Translasi

**Komposisi translasi** artinya melakukan translasi berturut-turut. Kabar baiknya: **translasi bersifat komutatif** (urutan tidak mempengaruhi hasil)!

Jika titik A ditranslasi oleh T₁(a₁, b₁) dilanjutkan T₂(a₂, b₂), maka:

**T₂ ∘ T₁ = T₁ ∘ T₂ = T(a₁ + a₂, b₁ + b₂)**

Tinggal **JUMLAHKAN** komponen vektor!

**Contoh**: 
Titik P(1, 2) ditranslasi T₁(3, -1) kemudian T₂(-2, 4). Tentukan P''!

**Cara 1 (Bertahap)**:
- P(1, 2) + T₁(3, -1) = P'(4, 1)
- P'(4, 1) + T₂(-2, 4) = P''(2, 5) ✓

**Cara 2 (Langsung)**:
- T_total = T₁ + T₂ = (3 + (-2), -1 + 4) = (1, 3)
- P(1, 2) + T(1, 3) = P''(2, 5) ✓

**Lebih cepat pakai Cara 2 kan?**

### Translasi Sumbu Koordinat

Soal level advanced: Translasi seluruh sumbu koordinat!

Jika sumbu koordinat ditranslasi T(a, b), maka:
- Titik asal O(0, 0) → O'(a, b)
- Titik A(x, y) dalam sistem lama → A(x - a, y - b) dalam sistem baru

**Jebakan SNBT**: Ini kebalikan dari translasi biasa! Koordinatnya **DIKURANGI**, bukan ditambah.

### Sifat-Sifat Translasi

1. **Isometri**: Jarak dan ukuran dipertahankan
2. **Komutatif**: T₁ ∘ T₂ = T₂ ∘ T₁
3. **Asosiatif**: (T₁ ∘ T₂) ∘ T₃ = T₁ ∘ (T₂ ∘ T₃)
4. **Ada elemen identitas**: T(0, 0) tidak mengubah posisi
5. **Ada invers**: T(a, b) diinvers oleh T(-a, -b)

### Grafik dan Visualisasi

Untuk memahami translasi dengan baik, kamu harus bisa **menggambarnya**!

**Tips Menggambar**:
1. Gambar sumbu x dan y
2. Plot titik awal A(x, y)
3. Dari A, tarik panah sejauh a ke kanan/kiri (tergantung tanda)
4. Dari ujung panah pertama, tarik panah sejauh b ke atas/bawah
5. Ujung panah kedua adalah A'(x', y')

**Karakteristik Visual**:
- Bangun awal dan bayangan **sejajar** (tidak berputar)
- Semua titik bergerak ke arah yang **sama**
- Tidak ada perubahan bentuk, ukuran, atau orientasi

### Jebakan di Soal SNBT

⚠️ **Jebakan #1: Tanda Negatif**
Translasi T(3, -5) artinya ke kanan 3, **ke bawah** 5 (bukan atas!)
Sering siswa salah karena lihat angka 5 langsung dikira naik.

⚠️ **Jebakan #2: Translasi Balik**
Soal: "Bayangan A' adalah (5, 7) setelah translasi T(2, 3). Cari A!"
Siswa sering masih tambah, padahal harus **KURANG**!
A = A' - T = (5-2, 7-3) = (3, 4)

⚠️ **Jebakan #3: Komposisi Banyak Translasi**
Soal kasih T₁, T₂, T₃ yang ribet. Padahal tinggal **jumlahkan semua vektor**!

⚠️ **Jebakan #4: Translasi Bangun**
Ditanya bayangan segitiga ABC, tapi siswa cuma hitung satu titik. **Harus semua titik sudut**!

### Aplikasi Translasi dalam Soal Cerita

Translasi sering muncul dalam konteks:

1. **Pergerakan Robot/Kendaraan**
"Robot bergerak 3 meter ke timur, 4 meter ke utara" → T(3, 4)

2. **Peta dan Navigasi**
"Kota B berada 50 km di utara dan 30 km di barat dari kota A" → T(-30, 50)

3. **Grafik Fungsi**
"Grafik y = x² digeser 2 satuan ke kanan, 3 satuan ke atas" → T(2, 3)

4. **Animasi**
"Karakter bergerak dari (10, 15) ke (25, 30)" → T(15, 15)

### Translasi pada Kurva dan Fungsi

Translasi juga bisa diterapkan pada **kurva** atau **fungsi**!

Jika kurva y = f(x) ditranslasi T(a, b), maka:
**y - b = f(x - a)** atau **y = f(x - a) + b**

**Contoh**:
- y = x² ditranslasi T(2, 3) menjadi y = (x - 2)² + 3
- y = sin x ditranslasi T(π/2, 1) menjadi y = sin(x - π/2) + 1

**Pola**: 
- Translasi horizontal: pengganti x dengan (x - a)
- Translasi vertikal: tambahkan b pada fungsi

### Strategi Menyelesaikan Soal Translasi

**Langkah Sistematis**:
1. Identifikasi: Titik awal atau bayangan?
2. Tentukan: Vektor translasi T(a, b)
3. Pilih rumus: Maju (tambah) atau balik (kurang)?
4. Hitung: Gunakan rumus dengan teliti
5. Cek: Apakah hasilnya masuk akal?

**Tips Supaya Nggak Salah**:
- Tulis ulang koordinat dan vektor dengan rapi
- Gunakan tanda kurung untuk bilangan negatif: (-3) bukan -3
- Cek ulang operasi penjumlahan/pengurangan
- Gambar jika masih ragu

### Latihan Mental

Coba kerjakan dalam hati (tanpa tulis):

1. P(5, 3) + T(2, -1) = ?
   → P'(7, 2) ✓

2. Q'(6, 4) - T(3, 5) = ?
   → Q(3, -1) ✓

3. T₁(2, 3) + T₂(-1, 4) = ?
   → T(1, 7) ✓

Kalau kamu bisa jawab dengan cepat, berarti kamu sudah paham konsep translasi!

### Kesimpulan Translasi

Translasi adalah transformasi paling **simpel** tapi paling **sering muncul** di SNBT, terutama sebagai bagian dari soal komposisi transformasi. Kunci sukses:

✓ **Hafal rumus**: x' = x + a, y' = y + b
✓ **Pahami arah**: a (horizontal), b (vertikal)
✓ **Jangan terjebak tanda**: Hati-hati dengan negatif!
✓ **Komposisi = Jumlahkan**: T₁ + T₂ + T₃ + ...

**Ingat**: Translasi tidak mengubah apapun kecuali **POSISI**!

---
