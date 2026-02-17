# SECTION 1: Aljabar - Topic 1.3: Aljabar


## Materi 1.3.7: Penalaran Eksponen dan Logaritma

### Exponential Growth: When Things Go BOOM! 📈

Pernahkah kamu dengar tentang "viral" di media sosial? Atau pandemi yang menyebar cepat? Atau bunga bank yang compound? Itu semua contoh **pertumbuhan eksponensial**—dimana perubahan bergantung pada nilai saat ini.

Dan kebalikannya? **Logaritma**—tool untuk "menjinakkan" angka raksasa dan membalikkan proses eksponensial.

Di SNBT, eksponen dan logaritma bukan cuma tentang hafalan rumus. Ini tentang **penalaran** situasi yang tumbuh/menyusut secara eksponensial dan **problem-solving** dengan tool yang tepat.

### Konsep Dasar Eksponen: Repeated Multiplication

#### **Definisi:**

a^n = a × a × a × ... × a (n kali)

- a = basis (bilangan pokok)
- n = eksponen (pangkat)

**Contoh:**
- 2³ = 2 × 2 × 2 = 8
- 5⁴ = 5 × 5 × 5 × 5 = 625
- 10² = 10 × 10 = 100

#### **Eksponen Nol dan Negatif:**

**a⁰ = 1** (untuk a ≠ 0)

Mengapa? Karena pola:
```
2³ = 8
2² = 4  (bagi 2)
2¹ = 2  (bagi 2)
2⁰ = 1  (bagi 2)
```

**a⁻ⁿ = 1/(aⁿ)**

Contoh:
- 2⁻³ = 1/(2³) = 1/8
- 5⁻² = 1/(5²) = 1/25

#### **Eksponen Pecahan:**

**a^(m/n) = ⁿ√(a^m) = (ⁿ√a)^m**

Contoh:
- 8^(2/3) = ³√(8²) = ³√64 = 4
- 16^(3/4) = ⁴√(16³) = ⁴√4096 = 8

ATAU:
- 8^(2/3) = (³√8)² = 2² = 4
- 16^(3/4) = (⁴√16)³ = 2³ = 8

### Sifat-Sifat Eksponen: Rules of the Game

**Harus hafal di luar kepala!**

#### **1. Perkalian dengan Basis Sama:**

a^m × a^n = a^(m+n)

Contoh: 2³ × 2⁵ = 2^(3+5) = 2⁸ = 256

**Mengapa?** (2×2×2) × (2×2×2×2×2) = 2 sebanyak 8 kali

#### **2. Pembagian dengan Basis Sama:**

a^m / a^n = a^(m-n)

Contoh: 5⁷ / 5³ = 5^(7-3) = 5⁴ = 625

#### **3. Pangkat dari Pangkat:**

(a^m)^n = a^(m×n)

Contoh: (3²)⁴ = 3^(2×4) = 3⁸ = 6561

**🚨 JANGAN BINGUNG:** (a^m)^n ≠ a^(m^n)

- (2³)² = 2⁶ = 64
- 2^(3²) = 2⁹ = 512

BEDA!

#### **4. Hasil Kali Berpangkat:**

(ab)^n = a^n × b^n

Contoh: (2×5)³ = 2³ × 5³ = 8 × 125 = 1000

#### **5. Hasil Bagi Berpangkat:**

(a/b)^n = a^n / b^n

Contoh: (3/2)⁴ = 3⁴/2⁴ = 81/16

### Menyelesaikan Persamaan Eksponen

#### **Tipe 1: Basis Sama**

**Strategi:** Samakan basis, lalu samakan eksponennya.

**Contoh:**

2^(x+1) = 8

```
2^(x+1) = 2³   ← ubah 8 jadi 2³
x + 1 = 3      ← eksponen sama
x = 2
```

**Contoh Lebih Kompleks:**

9^x = 27^(x-1)

```
(3²)^x = (3³)^(x-1)  ← ubah ke basis 3
3^(2x) = 3^(3x-3)
2x = 3x - 3
-x = -3
x = 3
```

#### **Tipe 2: Eksponen Sama**

**Strategi:** Kalau eksponennya sama, basisnya harus sama.

**Contoh:**

x³ = 125

```
x³ = 5³
x = 5
```

**Tapi hati-hati:**

x² = 16

```
x² = 4²
x = ±4  ← ada dua solusi!
```

#### **Tipe 3: Substitusi untuk Bentuk Kuadrat Eksponen**

**Contoh:**

4^x - 3(2^x) + 2 = 0

**Substitusi:** Misal 2^x = y, maka 4^x = (2²)^x = 2^(2x) = (2^x)² = y²

```
y² - 3y + 2 = 0
(y - 1)(y - 2) = 0
y = 1 atau y = 2
```

**Substitusi balik:**

**Kasus 1:** 2^x = 1
```
2^x = 2⁰
x = 0
```

**Kasus 2:** 2^x = 2
```
2^x = 2¹
x = 1
```

Jadi x = 0 atau x = 1

**🎯 PATTERN RECOGNITION:** Kalau lihat bentuk kayak a^(2x) dan a^x, langsung think "substitusi y = a^x"!

#### **Tipe 4: Bentuk a^x = b (Basis & Eksponen Beda)**

Ini butuh logaritma! (Akan dibahas sebentar lagi)

### Pertumbuhan dan Peluruhan Eksponensial

Ini aplikasi paling powerful eksponen di kehidupan nyata.

#### **Pertumbuhan Eksponensial**

**Formula Umum:**

N(t) = N₀ × a^t

Dimana:
- N(t) = jumlah pada waktu t
- N₀ = jumlah awal (t = 0)
- a = faktor pertumbuhan (a > 1)
- t = waktu

**Bentuk Alternatif:**

N(t) = N₀(1 + r)^t

Dimana r = laju pertumbuhan (growth rate)

**Contoh Bacaan:**

> "Jumlah bakteri awalnya 100. Setiap jam, populasi menjadi 3 kali lipat. Berapa banyak bakteri setelah 5 jam?"

**Setup:**
- N₀ = 100
- a = 3 (tripling setiap jam)
- t = 5

```
N(5) = 100 × 3⁵
     = 100 × 243
     = 24,300 bakteri
```

**Grafik Pertumbuhan Eksponensial:**

```
     N
     |        ╱
     |      ╱
     |    ╱
     |  ╱
     |╱________t
```

Ciri: Starts slow, then BOOM!

#### **Peluruhan Eksponensial**

**Formula Umum:**

N(t) = N₀ × a^t

Dimana 0 < a < 1 (faktor peluruhan)

**Bentuk Alternatif:**

N(t) = N₀(1 - r)^t

Dimana r = laju peluruhan (decay rate)

**Contoh Bacaan:**

> "Massa zat radioaktif awalnya 80 gram. Setiap tahun, massa berkurang 20%. Berapa massa setelah 3 tahun?"

**Setup:**
- N₀ = 80
- r = 0.2 (peluruhan 20%)
- Faktor peluruhan = 1 - 0.2 = 0.8
- t = 3

```
N(3) = 80 × (0.8)³
     = 80 × 0.512
     = 40.96 gram
```

**Grafik Peluruhan Eksponensial:**

```
     N
     |\
     | \___
     |     ----___
     |           ----___
     |________________t
```

Ciri: Turun cepat dulu, lalu melambat (asymptotic ke 0)

### Bunga Majemuk: Money Growing Exponentially

**Formula Bunga Majemuk:**

A = P(1 + r/n)^(nt)

Dimana:
- A = Jumlah akhir
- P = Principal (modal awal)
- r = Suku bunga tahunan (dalam desimal)
- n = Frekuensi compound per tahun
- t = Waktu (tahun)

**Contoh Bacaan:**

> "Andi menabung Rp10.000.000 dengan bunga 6% per tahun, dicompoound setiap bulan. Berapa uang Andi setelah 2 tahun?"

**Setup:**
- P = 10,000,000
- r = 0.06
- n = 12 (monthly)
- t = 2

```
A = 10,000,000(1 + 0.06/12)^(12×2)
  = 10,000,000(1 + 0.005)^24
  = 10,000,000(1.005)^24
  = 10,000,000(1.127159...)
  = Rp11,271,590
```

**💡 INSIGHT:** Semakin sering compound (n besar), semakin banyak hasil akhirnya!

**Extreme Case: Compound Kontinu**

A = Pe^(rt)

Dimana e ≈ 2.71828... (bilangan Euler)

### Waktu Ganda (Doubling Time) dan Waktu Paruh (Half-Life)

#### **Doubling Time**

Waktu yang dibutuhkan untuk nilai menjadi 2 kali lipat.

**Rumus Pendekatan (Rule of 72):**

Doubling Time ≈ 72 / (r dalam persen)

**Contoh:**

Investasi dengan return 8% per tahun, kapan jadi double?

```
Doubling Time ≈ 72/8 = 9 tahun
```

**Exact Formula (dengan log):**

T = log(2) / log(1 + r)

#### **Half-Life**

Waktu yang dibutuhkan untuk nilai menjadi setengah.

**Formula:**

N(t) = N₀ × (1/2)^(t/T_half)

**Contoh Bacaan:**

> "Waktu paruh Carbon-14 adalah 5730 tahun. Jika awalnya 100 gram, berapa gram setelah 11,460 tahun?"

**Setup:**
- t/T_half = 11460/5730 = 2
- Jadi sudah 2 kali waktu paruh

```
N = 100 × (1/2)²
  = 100 × 1/4
  = 25 gram
```

**🎯 SHORTCUT:** Setiap waktu paruh, nilai DIBAGI 2!
- 1 waktu paruh: ÷2
- 2 waktu paruh: ÷4
- 3 waktu paruh: ÷8
- n waktu paruh: ÷(2^n)

### Logaritma: The Inverse of Exponential

#### **Definisi:**

Kalau a^x = b, maka x = log_a(b)

Dibaca: "log basis a dari b"

**Arti:** "Berapa pangkat yang dibutuhkan basis a untuk menghasilkan b?"

**Contoh:**
- 2³ = 8 → log₂(8) = 3
- 10² = 100 → log₁₀(100) = 2
- 5⁰ = 1 → log₅(1) = 0

#### **Jenis-Jenis Logaritma:**

**1. Logaritma Umum (basis a)**

log_a(x)

**2. Logaritma Common (basis 10)**

log(x) atau log₁₀(x) ← Kalau tidak ada basis, assume 10

**3. Logaritma Natural (basis e)**

ln(x) atau log_e(x)

Dimana e ≈ 2.71828...

### Sifat-Sifat Logaritma: The Power Tools

**Wajib hafal!**

#### **1. Log dari Perkalian:**

log_a(xy) = log_a(x) + log_a(y)

**Contoh:**
```
log₂(8 × 4) = log₂(8) + log₂(4)
            = 3 + 2
            = 5
```

Cek: 2⁵ = 32 = 8 × 4 ✓

#### **2. Log dari Pembagian:**

log_a(x/y) = log_a(x) - log_a(y)

**Contoh:**
```
log₃(81/9) = log₃(81) - log₃(9)
           = 4 - 2
           = 2
```

Cek: 3² = 9 = 81/9 ✓

#### **3. Log dari Pangkat:**

log_a(x^n) = n × log_a(x)

**Contoh:**
```
log₂(16) = log₂(2⁴)
         = 4 × log₂(2)
         = 4 × 1
         = 4
```

**🎯 SUPER USEFUL untuk simplifikasi!**

#### **4. Change of Base Formula:**

log_a(x) = log_b(x) / log_b(a)

Paling sering: convert ke basis 10 atau e

```
log₂(8) = log(8) / log(2)
        = 0.903 / 0.301
        ≈ 3
```

#### **5. Inverse Property:**

a^(log_a(x)) = x

log_a(a^x) = x

**Contoh:**
- 2^(log₂(5)) = 5
- log₃(3⁷) = 7

#### **6. Log dari 1 dan Basis:**

log_a(1) = 0 (karena a⁰ = 1)

log_a(a) = 1 (karena a¹ = a)

### Menyelesaikan Persamaan Logaritma

#### **Tipe 1: Bentuk Sederhana**

log₂(x) = 5

**Strategi:** Convert ke bentuk eksponensial

```
x = 2⁵
x = 32
```

#### **Tipe 2: Basis Sama, Jumlahkan/Kurangkan**

log(x) + log(5) = log(100)

**Strategi:** Gunakan sifat logaritma

```
log(5x) = log(100)
5x = 100
x = 20
```

**Contoh Lain:**

log₃(x) - log₃(2) = 2

```
log₃(x/2) = 2
x/2 = 3²
x/2 = 9
x = 18
```

#### **Tipe 3: Log dalam Log**

log₂(log₃(x)) = 1

**Strategi:** Kerja dari luar ke dalam

```
log₃(x) = 2¹ = 2
x = 3² = 9
```

#### **Tipe 4: Bentuk Kuadrat Log**

(log x)² - 3 log x + 2 = 0

**Substitusi:** Misal y = log x

```
y² - 3y + 2 = 0
(y - 1)(y - 2) = 0
y = 1 atau y = 2
```

**Substitusi balik:**

**Kasus 1:** log x = 1 → x = 10¹ = 10

**Kasus 2:** log x = 2 → x = 10² = 100

Jadi x = 10 atau x = 100

#### **Tipe 5: Eksponen = Logaritma**

2^x = log₂(16)

**Solve log dulu:**
```
log₂(16) = log₂(2⁴) = 4
```

Jadi:
```
2^x = 4
2^x = 2²
x = 2
```

### Menyelesaikan Persamaan Eksponensial dengan Log

**Contoh:**

3^x = 50

**Strategi:** Ambil log kedua ruas

```
log(3^x) = log(50)
x log(3) = log(50)
x = log(50) / log(3)
x = 1.699 / 0.477
x ≈ 3.56
```

**Atau pakai log natural:**
```
ln(3^x) = ln(50)
x ln(3) = ln(50)
x = ln(50) / ln(3)
x ≈ 3.56
```

**💡 KAPAN PAKAI LOG:**

Kalau basis dan eksponen tidak bisa disamakan, take log!

### Pertidaksamaan Eksponensial dan Logaritma

#### **Pertidaksamaan Eksponensial**

**Aturan Penting:**

Kalau basis a > 1:
- a^x > a^y → x > y (arah tetap)

Kalau basis 0 < a < 1:
- a^x > a^y → x < y (arah BALIK!)

**Contoh 1:**

2^x > 8

```
2^x > 2³
x > 3  ← basis > 1, arah tetap
```

**Contoh 2:**

(1/2)^x < 4

```
2^(-x) < 2²
-x < 2
x > -2  ← tanda balik karena × (-1)
```

**Atau:**
```
(1/2)^x < (1/2)^(-2)  ← karena 4 = (1/2)^(-2)
x > -2  ← basis < 1, arah balik!
```

#### **Pertidaksamaan Logaritma**

**Aturan Penting:**

log_a(x) hanya terdefinisi untuk x > 0!

Dan kalau a > 1:
- log_a(x) > log_a(y) → x > y (arah tetap)

**Contoh:**

log₂(x - 1) > 3

```
x - 1 > 2³  ← take exponential
x - 1 > 8
x > 9
```

**Tapi JANGAN LUPA syarat:** x - 1 > 0 → x > 1

Kombinasi: x > 9 (yang otomatis ≥ 1)

**🚨 JEBAKAN:** Selalu cek domain logaritma!

### Aplikasi Real-World: Problem Solving

#### **Problem 1: Investasi**

**Bacaan:**

> "Berapa lama waktu yang dibutuhkan agar investasi Rp5.000.000 dengan bunga 8% per tahun (compound tahunan) menjadi Rp10.000.000?"

**Setup:**

A = P(1 + r)^t
10,000,000 = 5,000,000(1.08)^t

```
2 = (1.08)^t
log(2) = t × log(1.08)
t = log(2) / log(1.08)
t = 0.301 / 0.033
t ≈ 9.01 tahun
```

#### **Problem 2: Peluruhan Radioaktif**

**Bacaan:**

> "Waktu paruh suatu zat adalah 10 tahun. Berapa persen yang tersisa setelah 25 tahun?"

**Setup:**

N = N₀(1/2)^(t/T_half)
N = N₀(1/2)^(25/10)
N = N₀(1/2)^2.5

```
(1/2)^2.5 = 2^(-2.5)
         = 1/(2^2.5)
         = 1/(√(2⁵))
         = 1/√32
         ≈ 0.177

= 17.7%
```

#### **Problem 3: Pertumbuhan Populasi**

**Bacaan:**

> "Populasi kota 100,000 jiwa. Tumbuh 3% per tahun. Kapan mencapai 150,000?"

**Setup:**

150,000 = 100,000(1.03)^t

```
1.5 = (1.03)^t
log(1.5) = t × log(1.03)
t = log(1.5) / log(1.03)
t = 0.176 / 0.0128
t ≈ 13.7 tahun
```

#### **Problem 4: pH dan Konsentrasi**

**Bacaan:**

> "pH suatu larutan adalah 4.5. Berapa konsentrasi ion H⁺? (pH = -log[H⁺])"

**Setup:**

4.5 = -log[H⁺]

```
log[H⁺] = -4.5
[H⁺] = 10^(-4.5)
     = 10^(-4) × 10^(-0.5)
     = 0.0001 × 1/√10
     ≈ 3.16 × 10^(-5) M
```

### Grafik Fungsi Eksponensial dan Logaritma

#### **Grafik y = a^x (a > 1)**

```
      y
      |        ╱
      |      ╱
      |    ╱
    1 |__╱________x
      |
```

Ciri-ciri:
- Melalui (0, 1) karena a⁰ = 1
- Selalu positif (y > 0)
- Naik (increasing)
- Asymptote horizontal di y = 0

#### **Grafik y = log_a(x) (a > 1)**

```
      y
      |
      |___
      |   ---___
      |         --__
      |____________x
            1
```

Ciri-ciri:
- Melalui (1, 0) karena log_a(1) = 0
- Hanya terdefinisi untuk x > 0
- Naik (increasing)
- Asymptote vertikal di x = 0

**💡 HUBUNGAN:** Grafik y = a^x dan y = log_a(x) adalah **refleksi satu sama lain** terhadap garis y = x!

### Common Mistakes dan Cara Menghindarinya

#### **Mistake 1: Salah Operasi Eksponen**

❌ a^m + a^n = a^(m+n)
✓ a^m × a^n = a^(m+n)

#### **Mistake 2: Salah Distribusi Log**

❌ log(x + y) = log(x) + log(y)
✓ log(xy) = log(x) + log(y)

#### **Mistake 3: Lupa Domain Log**

❌ Solve log(x) = 2 → x = 100 (selesai)
✓ Solve log(x) = 2 → x = 100, dengan syarat x > 0 ✓

#### **Mistake 4: Balik Tanda Tanpa Alasan**

Pada pertidaksamaan, tanda HANYA balik kalau:
- Kali/bagi dengan negatif
- Basis eksponen/log antara 0 dan 1

Bukan karena "ada pangkat/log"!

### Quick Reference: Kapan Pakai Apa?

| Situasi | Tool |
|---------|------|
| Pertumbuhan/peluruhan dengan laju konstan | Eksponen: N = N₀a^t |
| Bunga majemuk | A = P(1 + r/n)^(nt) |
| Cari waktu dari pertumbuhan/peluruhan | Logaritma: t = log(...) |
| Solve a^x = b (basis & eksponen beda) | Take log kedua ruas |
| Simplifikasi ekspresi besar | Sifat logaritma |
| Skala besar (Richter, pH, decibel) | Logaritma |

### Rangkuman Power Points

✓ Eksponen: pertumbuhan/peluruhan yang rate-nya proporsional dengan nilai saat ini
✓ Sifat eksponen: a^m × a^n = a^(m+n), (a^m)^n = a^(mn)
✓ Logaritma = invers eksponen: a^x = b ↔ log_a(b) = x
✓ Sifat log: log(xy) = log x + log y, log(x^n) = n log x
✓ Untuk solve a^x = b (beda basis): take log kedua ruas
✓ Pertidaksamaan: basis 0 < a < 1 → arah balik!
✓ Domain log: HARUS x > 0
✓ Waktu ganda/paruh: rule of 72, atau exact dengan log
✓ Bunga majemuk: semakin sering compound, semakin banyak hasil

---

**🎉 SELAMAT! SECTION 1 TOPIC 1.3 COMPLETE! 🎉**

Kamu baru saja menguasai **7 materi aljabar super penting** untuk PM SNBT:

1. ✅ Pengenalan Penalaran Aljabar
2. ✅ Menyusun Persamaan dari Masalah
3. ✅ Strategi Penyelesaian Persamaan
4. ✅ Penalaran Pertidaksamaan
5. ✅ Sistem Persamaan dalam Konteks
6. ✅ Penalaran Fungsi
7. ✅ Penalaran Eksponen dan Logaritma

**Total Coverage:** Lebih dari 15,000 kata materi komprehensif dengan puluhan contoh, tips, jebakan, dan strategi!

### What's Next?

Sekarang kamu punya fondasi aljabar yang solid. Tapi ingat:

📚 **Knowledge ≠ Skill**

Kamu perlu **LATIHAN SOAL** untuk:
- Mengenali pola soal dengan cepat
- Membangun intuisi kapan pakai metode apa
- Meningkatkan kecepatan (time management crucial di SNBT!)
- Mengasah kemampuan avoid jebakan

**Recommendation:**
1. Review materi ini 2-3 kali sampai konsep benar-benar nyangkut
2. Kerjakan soal latihan bertahap: mudah → sedang → sulit
3. Analisis kesalahan: kenapa salah? Konsep atau kecerobohan?
4. Time yourself: latihan dengan batasan waktu realistis
5. Mock test: simulasi kondisi SNBT sesungguhnya

**You got this! Keep grinding, stay focused, and remember: every problem you solve makes you stronger! 💪🔥**