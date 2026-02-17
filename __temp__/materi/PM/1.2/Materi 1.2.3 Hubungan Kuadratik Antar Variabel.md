# SECTION 1 - TOPIC 2: Hubungan Antar Variabel


## Materi 1.2.3: Hubungan Kuadratik Antar Variabel

### Welcome to the Curve Side! 🎢

Kalau linear itu jalan tol lurus, kuadratik itu roller coaster—ada naik, ada turun, ada puncak! Hubungan kuadratik bikin hidup (dan soal SNBT) jadi lebih seru karena ada **titik optimal**: maksimum atau minimum.

**Kenapa Kuadratik Penting?**
1. Banyak fenomena real yang kuadratik (lemparan bola, keuntungan bisnis, dll)
2. Di SNBT sering dikombinasi dengan optimasi
3. Grafik parabola punya karakteristik unik yang bisa di-exploit

### Mengenali Hubungan Kuadratik

#### Dari Tabel: Detective Mode LEVEL 2!

Kalau di linear kita cek selisih pertama (konstan), di kuadratik kita cek **selisih kedua**!

**Contoh:**

| x | y | Selisih 1 | Selisih 2 |
|---|---|-----------|-----------|
| 0 | 5 |           |           |
| 1 | 6 | 1         |           |
| 2 | 9 | 3         | 2         |
| 3 | 14 | 5        | 2         |
| 4 | 21 | 7        | 2         |

**Analisis:**
- Selisih 1: Nggak konstan (1, 3, 5, 7) → Bukan linear
- Selisih 2: Konstan (2, 2, 2) → **INI KUADRATIK!** ✓

**Pola:**
- Selisih 1 konstan → Linear
- Selisih 2 konstan → Kuadratik
- Selisih 3 konstan → Kubik (jarang muncul di SNBT)

#### Dari Grafik: Bentuk Parabola

**Ciri Visual:**
- Bentuk U atau ∩ (U terbalik)
- Simetris terhadap satu garis vertikal (sumbu simetri)
- Punya satu titik puncak (verteks): maksimum atau minimum
- Lengkungan halus, bukan patah-patah

**U (terbuka ke atas):**
- Punya titik **minimum** (titik terendah)
- a > 0 dalam persamaan y = ax² + bx + c
- Contoh: lemparan dari bawah ke atas lalu jatuh lagi

**∩ (terbuka ke bawah):**
- Punya titik **maksimum** (titik tertinggi)
- a < 0 dalam persamaan y = ax² + bx + c
- Contoh: lemparan dari atas, naik dulu, terus turun

### Persamaan Kuadrat: y = ax² + bx + c

Ini bentuk standar fungsi kuadratik!

**Komponen:**
- **a**: Koefisien x² (menentukan arah dan "ketajaman" parabola)
  - a > 0 → parabola membuka ke atas (U)
  - a < 0 → parabola membuka ke bawah (∩)
  - |a| makin besar → parabola makin "ramping"
  - |a| makin kecil → parabola makin "melebar"

- **b**: Koefisien x (mempengaruhi posisi sumbu simetri)

- **c**: Konstanta (titik potong dengan sumbu y, yaitu nilai y saat x = 0)

**Contoh:**
- y = 2x² + 3x + 1 → parabola U (a = 2 > 0)
- y = -x² + 4x + 5 → parabola ∩ (a = -1 < 0)
- y = x² → parabola U paling sederhana, verteks di (0,0)

### Karakteristik Penting Parabola

#### 1. Titik Puncak (Verteks)

**Koordinat verteks:**
- x = -b/(2a)
- y = substitusi nilai x ke persamaan

**Kenapa Penting?**
Verteks = titik optimal! Ini yang paling sering ditanya di SNBT.

**Contoh:**
y = -2x² + 8x + 3

Cari verteks:
- x = -8/(2×(-2)) = -8/(-4) = 2
- y = -2(2)² + 8(2) + 3 = -8 + 16 + 3 = 11

**Verteks: (2, 11)** → Ini titik maksimum (karena parabola ∩)

**Interpretasi Konteks:**
Kalau ini soal keuntungan, artinya "keuntungan maksimum Rp 11 juta tercapai saat menjual 2 ribu unit"

#### 2. Sumbu Simetri

Garis vertikal yang membagi parabola jadi dua bagian cermin.

**Persamaan sumbu simetri:**
x = -b/(2a)

(Sama kayak koordinat x dari verteks!)

**Kegunaan:**
Kalau kamu tahu satu titik di satu sisi parabola, kamu bisa tahu ada titik "kembarannya" di sisi lain!

#### 3. Titik Potong Sumbu Y (y-intercept)

**Cara cari:**
Substitusi x = 0

y = a(0)² + b(0) + c = **c**

Jadi, **y-intercept selalu = c**!

#### 4. Titik Potong Sumbu X (x-intercept / akar-akar)

Ini nilai x saat y = 0. Cara carinya: **solve persamaan kuadrat!**

**Metode Penyelesaian:**

**a) Faktorisasi** (kalau bisa difaktor)
x² + 5x + 6 = 0
(x + 2)(x + 3) = 0
x = -2 atau x = -3

**b) Rumus ABC** (selalu work!)
Untuk ax² + bx + c = 0:

x = [-b ± √(b² - 4ac)] / (2a)

**c) Melengkapkan Kuadrat** (kalau mau pamer 😎)

### Diskriminan: The Secret Weapon!

**D = b² - 4ac**

Diskriminan kasih tahu kita tentang akar-akar persamaan **TANPA perlu solve**!

**Interpretasi:**
- **D > 0** → Dua akar real berbeda → Parabola memotong sumbu x di 2 titik
- **D = 0** → Dua akar real sama (kembar) → Parabola menyentuh sumbu x di 1 titik (verteks ada di sumbu x)
- **D < 0** → Tidak ada akar real → Parabola tidak memotong sumbu x sama sekali

**Contoh:**
y = x² - 4x + 5
D = (-4)² - 4(1)(5) = 16 - 20 = -4 < 0

**Artinya:** Parabola ini nggak pernah nyentuh sumbu x!

**Aplikasi SNBT:**
"Tentukan nilai k agar persamaan punya dua akar real berbeda"
→ Syaratnya: **D > 0**!

### Titik Maksimum dan Minimum dalam Konteks Real

Ini yang PALING SERING keluar di SNBT! Soalnya suka banget ngasih konteks real, terus nanya titik optimal.

#### Contoh 1: Keuntungan Bisnis

"Keuntungan toko per hari (dalam jutaan) dinyatakan dengan K = -2x² + 16x - 10, di mana x adalah harga jual (dalam puluh ribu). Berapa harga optimal untuk keuntungan maksimum?"

**Solve:**
a = -2 < 0 → parabola ∩ → ada titik maksimum

x = -b/(2a) = -16/(2×(-2)) = -16/(-4) = 4

K_max = -2(4)² + 16(4) - 10 = -32 + 64 - 10 = 22

**Jawaban:**
Harga optimal = 4 (puluh ribu) = Rp 40.000
Keuntungan maksimum = 22 juta

#### Contoh 2: Lemparan Bola

"Tinggi bola (dalam meter) dinyatakan h = -5t² + 20t + 2, di mana t adalah waktu (detik). Kapan bola mencapai titik tertinggi dan berapa tingginya?"

**Solve:**
a = -5 < 0 → parabola ∩ → ada titik maksimum

t = -b/(2a) = -20/(2×(-5)) = -20 /(-10) = 2

h_max = -5(2)² + 20(2) + 2 = -20 + 40 + 2 = 22

**Jawaban:**
Bola mencapai titik tertinggi setelah 2 detik dengan tinggi 22 meter

#### Contoh 3: Luas Maksimum

"Seorang petani punya 100 m pagar untuk membuat kandang berbentuk persegi panjang. Salah satu sisi menggunakan tembok (tidak perlu pagar). Berapa luas maksimum kandang?"

**Setup:**
- Misalkan lebar = x meter
- Panjang = (100 - 2x) meter (karena cuma perlu 2 sisi lebar + 1 sisi panjang)
- Luas = x(100 - 2x) = 100x - 2x² = -2x² + 100x

**Solve:**
a = -2 < 0 → ada maksimum

x = -100/(2×(-2)) = -100/(-4) = 25

Luas_max = -2(25)² + 100(25) = -1250 + 2500 = 1250

**Jawaban:**
Luas maksimum = 1250 m² (dengan lebar 25 m, panjang 50 m)

### Menentukan Persamaan Kuadrat dari Informasi

#### Metode 1: Diketahui 3 Titik

Substitusi ketiga titik ke y = ax² + bx + c, dapat 3 persamaan, solve sistem persamaan!

**Contoh:**
Titik (0, 3), (1, 6), (2, 11)

Dari (0, 3): 3 = c → **c = 3**
Dari (1, 6): 6 = a + b + 3 → a + b = 3 ... (1)
Dari (2, 11): 11 = 4a + 2b + 3 → 4a + 2b = 8 → 2a + b = 4 ... (2)

Dari (2) - (1): a = 1
Substitusi ke (1): b = 2

**Persamaan: y = x² + 2x + 3**

#### Metode 2: Diketahui Verteks dan Satu Titik

Pakai bentuk verteks: y = a(x - h)² + k
Di mana (h, k) adalah verteks

**Contoh:**
Verteks (3, 5), melalui titik (1, 1)

y = a(x - 3)² + 5

Substitusi (1, 1):
1 = a(1 - 3)² + 5
1 = 4a + 5
a = -1

**Persamaan: y = -(x - 3)² + 5**

Atau dalam bentuk standar:
y = -(x² - 6x + 9) + 5 = -x² + 6x - 9 + 5 = **-x² + 6x - 4**

#### Metode 3: Dari Akar-akar

Kalau diketahui akar-akarnya x₁ dan x₂:
y = a(x - x₁)(x - x₂)

**Contoh:**
Akar-akar -2 dan 5, melalui (0, -10)

y = a(x + 2)(x - 5)

Substitusi (0, -10):
-10 = a(2)(-5) = -10a
a = 1

**Persamaan: y = (x + 2)(x - 5) = x² - 3x - 10**

### Transformasi Parabola

Dari bentuk dasar y = x², kita bisa transformasi!

#### Translasi Vertikal
y = x² + k
- k > 0 → naik k satuan
- k < 0 → turun |k| satuan

#### Translasi Horizontal
y = (x - h)²
- h > 0 → geser ke kanan h satuan
- h < 0 → geser ke kiri |h| satuan

#### Refleksi
y = -x² → parabola terbalik (∩)

#### Dilatasi Vertikal
y = ax²
- |a| > 1 → lebih ramping
- 0 < |a| < 1 → lebih melebar

### Tips Anti-Jebakan SNBT untuk Kuadratik!

**Jebakan 1: Maksimum vs Minimum**
❌ "Tentukan nilai maksimum dari y = x² - 6x + 5"
❗ Hati-hati! a = 1 > 0, jadi parabola U → nggak punya maksimum (bisa sampai tak hingga)! Yang ada cuma minimum.

**Jebakan 2: Lupa Tanda Negatif**
❌ y = -x² + 4x + 5, x = -4/(2(-1))
❗ Jangan lupa tanda! x = -4/(-2) = 2 (POSITIF!)

**Jebakan 3: Diskriminan untuk Syarat**
❌ "Agar persamaan punya akar real, tentukan k"
❗ Syaratnya D ≥ 0, bukan D > 0! (karena "punya akar real" termasuk akar kembar)

**Jebakan 4: Sumbu Simetri ≠ Maksimum/Minimum**
❌ "Sumbu simetri di x = 3, berarti maksimumnya 3?"
❗ BUKAN! Sumbu simetri itu koordinat X dari verteks. Nilai maksimum/minimum adalah koordinat Y!

**Jebakan 5: Konteks yang Membatasi Domain**
❌ "Luas = -x² + 10x. Berapa luas maksimum?"
❗ Tunggu! x = lebar, jadi x > 0 DAN (10 - 2x) > 0 → 0 < x < 5. Pastikan solusinya dalam domain yang valid!

### Strategi Kilat Soal Kuadratik

**Step 1: IDENTIFIKASI**
- Cek tabel (selisih kedua konstan?) atau grafik (parabola?)
- Tentukan a, b, c

**Step 2: TENTUKAN BENTUK PARABOLA**
- a > 0 → U → minimum
- a < 0 → ∩ → maksimum

**Step 3: CARI VERTEKS (kalau perlu)**
- x = -b/(2a)
- y = substitusi x

**Step 4: INFO TAMBAHAN (kalau ditanya)**
- Diskriminan: D = b² - 4ac
- Akar-akar: pakai rumus ABC atau faktor
- Sumbu simetri: x = -b/(2a)

**Step 5: INTERPRET DALAM KONTEKS**
- Pastikan satuan benar
- Cek domain (apakah solusi masuk akal?)

---
