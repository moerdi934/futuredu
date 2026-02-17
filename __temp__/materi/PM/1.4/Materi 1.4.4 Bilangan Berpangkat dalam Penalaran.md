# SECTION 1: Aljabar
## Topic 1.4: Urutan dan Operasi Bilangan

---


## **Materi 1.4.4: Bilangan Berpangkat dalam Penalaran**

### Pangkat: Perkalian Berulang yang Powerful!

Bilangan berpangkat itu basically perkalian yang diulang-ulang. Tapi jangan salah, dengan pangkat, bilangan bisa **meledak** nilainya dengan cepat!

**Definisi:**
a^n = a × a × a × ... × a (sebanyak n kali)

Contoh:
- 2³ = 2 × 2 × 2 = 8
- 5² = 5 × 5 = 25
- 10⁴ = 10 × 10 × 10 × 10 = 10.000

**Komponen:**
- **a** = basis (bilangan yang dipangkatkan)
- **n** = eksponen/pangkat

### Membandingkan Bilangan Berpangkat

Ini yang sering muncul di SNBT! Kamu harus bisa cepat menentukan mana yang lebih besar.

**Kasus 1: Basis Sama**
Kalau basis sama, tinggal bandingin pangkatnya!
```
2⁵ vs 2³
```
Jelas 2⁵ > 2³ (pangkat lebih besar = nilai lebih besar)

**Kasus 2: Pangkat Sama**
Kalau pangkat sama, bandingin basisnya!
```
3⁴ vs 5⁴
```
Jelas 5⁴ > 3⁴ (basis lebih besar = nilai lebih besar)

**Kasus 3: Basis dan Pangkat Beda (THE TRICKY ONE!)**
```
2⁶ vs 3⁴
```

**Cara 1: Hitung langsung**
- 2⁶ = 64
- 3⁴ = 81
- Jadi 3⁴ > 2⁶

**Cara 2: Samakan Pangkat (Kalau Bisa)**
```
2⁶ vs 3⁴
= (2³)² vs (3²)²
= 8² vs 9²
```
Jelas 9² > 8², jadi 3⁴ > 2⁶

**Cara 3: Samakan Basis (Advanced)**
Ini lebih ribet, biasanya pakai logaritma. Skip dulu untuk SNBT dasar.

### Estimasi Nilai Bilangan Berpangkat

Kadang soal SNBT nggak minta nilai eksak, cuma minta kamu "kira-kira" nilainya berapa.

**Teknik Bracket (Mengapit)**

Misal: Kira-kira 7³ nilainya berapa?

Kamu tahu:
- 5³ = 125
- 10³ = 1000

Jadi 7³ pasti di antara 125 dan 1000. 

Lebih spesifik, karena 7 lebih dekat ke 5 daripada ke 10:
- 7³ ≈ 343 (nilai sebenarnya)

**Pakai Bentuk (a±b)ⁿ**

```
9² = (10-1)² = 10² - 2(10)(1) + 1² = 100 - 20 + 1 = 81
11² = (10+1)² = 10² + 2(10)(1) + 1² = 100 + 20 + 1 = 121
```

### Pangkat yang Wajib Kamu Hapal

Biar cepet ngerjain SNBT, hapal minimal ini:

**Kuadrat (pangkat 2):**
- 1² = 1
- 2² = 4
- 3² = 9
- 4² = 16
- 5² = 25
- 6² = 36
- 7² = 49
- 8² = 64
- 9² = 81
- 10² = 100
- 11² = 121
- 12² = 144
- 15² = 225
- 20² = 400
- 25² = 625

**Kubik (pangkat 3):**
- 1³ = 1
- 2³ = 8
- 3³ = 27
- 4³ = 64
- 5³ = 125
- 10³ = 1000

**Pangkat 2 (basis 2):**
- 2¹ = 2
- 2² = 4
- 2³ = 8
- 2⁴ = 16
- 2⁵ = 32
- 2⁶ = 64
- 2⁷ = 128
- 2⁸ = 256
- 2⁹ = 512
- 2¹⁰ = 1024

### Sifat-Sifat Bilangan Berpangkat

Ini senjata utama buat nyederhanain ekspresi berpangkat!

**Sifat 1: Perkalian dengan Basis Sama**
```
aⁿ × aᵐ = aⁿ⁺ᵐ
```
Contoh: 2³ × 2⁴ = 2³⁺⁴ = 2⁷ = 128

**Sifat 2: Pembagian dengan Basis Sama**
```
aⁿ ÷ aᵐ = aⁿ⁻ᵐ
```
Contoh: 5⁶ ÷ 5² = 5⁶⁻² = 5⁴ = 625

**Sifat 3: Pangkat dari Pangkat**
```
(aⁿ)ᵐ = aⁿˣᵐ
```
Contoh: (3²)³ = 3²ˣ³ = 3⁶ = 729

**Sifat 4: Perkalian Beda Basis, Pangkat Sama**
```
aⁿ × bⁿ = (a×b)ⁿ
```
Contoh: 2³ × 5³ = (2×5)³ = 10³ = 1000

**Sifat 5: Pembagian Beda Basis, Pangkat Sama**
```
aⁿ ÷ bⁿ = (a÷b)ⁿ
```
Contoh: 8⁴ ÷ 2⁴ = (8÷2)⁴ = 4⁴ = 256

**Sifat 6: Pangkat Nol**
```
a⁰ = 1 (untuk a ≠ 0)
```
Contoh: 5⁰ = 1, 1000⁰ = 1, (-3)⁰ = 1

**Kenapa a⁰ = 1?** Lihat pola:
```
2³ = 8
2² = 4 (dibagi 2)
2¹ = 2 (dibagi 2)
2⁰ = ? (dibagi 2 lagi = 1!)
```

**Sifat 7: Pangkat Negatif**
```
a⁻ⁿ = 1/aⁿ
```
Contoh: 2⁻³ = 1/2³ = 1/8

**Sifat 8: Pangkat Pecahan (Akar)**
```
a^(1/n) = ⁿ√a
a^(m/n) = ⁿ√(aᵐ) = (ⁿ√a)ᵐ
```
Contoh: 
- 9^(1/2) = √9 = 3
- 8^(2/3) = ³√(8²) = ³√64 = 4

### Urutan Bilangan dengan Pangkat Berbeda

Ini yang sering bikin bingung di SNBT!

**Contoh: Urutkan dari terkecil: 2⁵, 3³, 4², 5¹**

Hitung dulu:
- 2⁵ = 32
- 3³ = 27
- 4² = 16
- 5¹ = 5

Urutan: 5¹ < 4² < 3³ < 2⁵

**Strategi cepat:**
- Kalau basisnya kecil tapi pangkatnya gede → bisa jadi gede
- Kalau basisnya gede tapi pangkat kecil → bisa jadi kecil
- Kalau ragu, estimasi atau hitung kasar!

**Jebakan:** Jangan langsung assume "basis gede pasti menang" atau "pangkat gede pasti menang"!

### Aplikasi Bilangan Berpangkat dalam Penalaran

**1. Pertumbuhan Eksponensial**
Populasi bakteri yang berkembang biak tiap jam:
- Jam 0: 100 bakteri
- Jam 1: 200 bakteri (2¹ × 100)
- Jam 2: 400 bakteri (2² × 100)
- Jam 3: 800 bakteri (2³ × 100)
- Jam n: 2ⁿ × 100 bakteri

**2. Luas dan Volume dengan Perubahan Skala**
Kalau sisi diperbesar k kali:
- Luas membesar k² kali
- Volume membesar k³ kali

Contoh: Kubus sisi 2 cm diperbesar jadi 6 cm (3 kali lipat)
- Volume awal: 2³ = 8 cm³
- Volume akhir: 6³ = 216 cm³
- Atau: 3³ × 8 = 27 × 8 = 216 cm³

**3. Komputer dan Byte**
- 1 KB = 2¹⁰ bytes = 1024 bytes
- 1 MB = 2²⁰ bytes
- 1 GB = 2³⁰ bytes

**4. Bunga Majemuk**
Modal M dengan bunga r% per tahun, setelah n tahun:
M × (1 + r/100)ⁿ

### Operasi Bilangan Berpangkat

**Penjumlahan/Pengurangan:**
**TIDAK ada rumus khusus!** Harus dihitung dulu kalau mau dijumlah/kurang.

```
SALAH: 2³ + 2⁴ = 2⁷ ❌
BENAR: 2³ + 2⁴ = 8 + 16 = 24 ✓
```

Kecuali ada faktorisasi:
```
2³ + 2⁴ = 2³(1 + 2) = 2³ × 3 = 8 × 3 = 24
```

**Perkalian/Pembagian:**
Pakai sifat-sifat yang udah kita bahas!

```
3⁴ × 3² = 3⁶
5⁷ ÷ 5³ = 5⁴
(2³)² = 2⁶
```

### Tips Mengerjakan Soal Pangkat di SNBT

**🎯 Tip #1: Hapal Nilai-Nilai Dasar**
Jangan buang waktu hitung 2⁵ atau 3³ di ujian. Harus reflex!

**🎯 Tip #2: Cari Basis yang Sama**
Kalau ada 8 dan 4 dalam soal, ingat bahwa 8 = 2³ dan 4 = 2². Bisa disederhanakan!

**🎯 Tip #3: Pakai Sifat Pangkat**
Jangan langsung hitung kalau bisa pakai sifat. Misal (2⁵)³ jangan dihitung 2⁵ dulu lalu dipangkatkan 3. Langsung 2¹⁵!

**🎯 Tip #4: Estimasi untuk Eliminasi**
Kalau ada pilihan ganda, estimasi kasar bisa langsung eliminasi beberapa pilihan yang clearly salah.

**🎯 Tip #5: Hati-Hati Pangkat Negatif dan Nol**
Ini sumber kesalahan paling sering! Ingat: a⁻ⁿ = 1/aⁿ dan a⁰ = 1.

---
