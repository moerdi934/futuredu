# SECTION 1: Aljabar
## Topic 1.4: Urutan dan Operasi Bilangan

---


## **Materi 1.4.5: Akar dan Estimasi**

### Akar: Kebalikan dari Pangkat

Kalau pangkat adalah "perkalian berulang", maka akar adalah "mencari bilangan yang bila dipangkatkan menghasilkan bilangan tertentu".

**Definisi:**
ⁿ√a = b jika dan hanya jika bⁿ = a

Contoh:
- √9 = 3 karena 3² = 9
- ³√8 = 2 karena 2³ = 8
- ⁴√16 = 2 karena 2⁴ = 16

**Notasi:**
- √a = akar kuadrat (pangkat 2)
- ³√a = akar kubik (pangkat 3)
- ⁿ√a = akar pangkat n

### Estimasi Nilai Akar Kuadrat

Di SNBT, kamu sering diminta estimasi akar yang nggak "pas". Misalnya √50, √20, dsb.

**Teknik 1: Mengapit dengan Kuadrat Sempurna**

√50 nilainya berapa?

Cari kuadrat sempurna terdekat:
- 7² = 49
- 8² = 64

Jadi 7 < √50 < 8

Lebih spesifik: karena 50 lebih dekat ke 49 daripada 64, maka √50 lebih dekat ke 7.
√50 ≈ 7,07 (nilai sebenarnya)

**Teknik 2: Rumus Linear (Kasar tapi Cepat)**

Untuk √(a² + b) di mana b kecil:
√(a² + b) ≈ a + b/(2a)

Contoh √50 = √(49 + 1):
≈ 7 + 1/(2×7)
≈ 7 + 1/14
≈ 7 + 0,07
≈ 7,07

Lumayan akurat!

**Teknik 3: Pakai Bentuk Perkalian**

√50 = √(25 × 2) = √25 × √2 = 5√2 ≈ 5 × 1,41 ≈ 7,05

### Nilai-Nilai Akar yang Wajib Dihapal

**Akar Kuadrat:**
- √1 = 1
- √4 = 2
- √9 = 3
- √16 = 4
- √25 = 5
- √36 = 6
- √49 = 7
- √64 = 8
- √81 = 9
- √100 = 10
- √121 = 11
- √144 = 12
- √169 = 13
- √196 = 14
- √225 = 15

**Akar Tidak Sempurna (Aproksimasi):**
- √2 ≈ 1,41
- √3 ≈ 1,73
- √5 ≈ 2,24
- √6 ≈ 2,45
- √7 ≈ 2,65
- √8 = 2√2 ≈ 2,83
- √10 ≈ 3,16

**Akar Kubik:**
- ³√1 = 1
- ³√8 = 2
- ³√27 = 3
- ³√64 = 4
- ³√125 = 5
- ³√216 = 6
- ³√1000 = 10

### Membandingkan Bilangan yang Melibatkan Akar

Ini yang sering muncul di SNBT! Strategi:

**1. Kuadratkan Keduanya (Kalau Semua Positif)**

Bandingkan: √50 vs 7

- (√50)² = 50
- 7² = 49

Karena 50 > 49, maka √50 > 7

**2. Ubah ke Bentuk yang Sama**

Bandingkan: 2√3 vs √10

Cara 1 - Kuadratkan:
- (2√3)² = 4 × 3 = 12
- (√10)² = 10

Jadi 2√3 > √10

Cara 2 - Ubah ke desimal:
- 2√3 ≈ 2 × 1,73 = 3,46
- √10 ≈ 3,16

Jadi 2√3 > √10

**3. Rasionalkan Jika Perlu**

Kadang soal kasih bentuk kayak 1/√2 vs √2/3. Rasionalkan dulu biar lebih gampang dibanding.

### Merasionalkan Penyebut

Di matematika, kita hindari punya akar di penyebut. Caranya: **rasionalkan**!

**Bentuk √a di Penyebut:**

```
1/√2 = ?
```

Kalikan pembilang dan penyebut dengan √2:
```
= (1 × √2)/(√2 × √2)
= √2/2
```

**Bentuk a√b di Penyebut:**

```
3/(2√5) = ?
```

Kalikan dengan √5:
```
= (3 × √5)/(2√5 × √5)
= 3√5/(2 × 5)
= 3√5/10
```

**Bentuk (a + √b) di Penyebut:**

Pakai **sekawan** (conjugate): ubah tanda tengahnya

```
1/(2 + √3) = ?
```

Sekawannya: (2 - √3)

Kalikan:
```
= (1 × (2 - √3))/((2 + √3)(2 - √3))
= (2 - √3)/(4 - 3)
= 2 - √3
```

Rumus (a+b)(a-b) = a² - b² sangat berguna di sini!

### Akar dalam Geometri dan Pengukuran

**1. Diagonal Persegi**

Persegi sisi s, diagonalnya = s√2

Contoh: Persegi sisi 5 cm → diagonal = 5√2 ≈ 7,07 cm

**2. Tinggi Segitiga Sama Sisi**

Segitiga sama sisi sisi s, tingginya = (s√3)/2

**3. Teorema Pythagoras**

c = √(a² + b²)

Ini aplikasi akar yang paling sering muncul!

Contoh: Segitiga siku-siku dengan sisi 3 dan 4
- c = √(9 + 16) = √25 = 5

Atau yang nggak "pas":
Sisi 5 dan 7
- c = √(25 + 49) = √74 ≈ 8,6

**4. Jarak antara Dua Titik**

Di koordinat (x₁,y₁) dan (x₂,y₂):
d = √((x₂-x₁)² + (y₂-y₁)²)

### Operasi Akar

**Penjumlahan/Pengurangan:**
Hanya bisa dijumlahkan kalau **bentuk akarnya sama**!

```
3√2 + 5√2 = 8√2 ✓
3√2 + 5√3 = tetap 3√2 + 5√3 (nggak bisa disederhanakan)
```

Tapi kadang bisa disederhanakan dulu:
```
√8 + √18 = ?
= 2√2 + 3√2
= 5√2
```

**Perkalian:**

```
√a × √b = √(a×b)
```

Contoh:
```
√3 × √12 = √36 = 6
```

Atau:
```
2√3 × 3√5 = (2×3) × (√3×√5) = 6√15
```

**Pembagian:**

```
√a ÷ √b = √(a÷b)
```

Contoh:
```
√50 ÷ √2 = √(50÷2) = √25 = 5
```

### Sifat-Sifat Akar

**Sifat 1: Akar dari Perkalian**
```
√(a×b) = √a × √b
```

**Sifat 2: Akar dari Pembagian**
```
√(a÷b) = √a ÷ √b
```

**Sifat 3: Akar dari Pangkat**
```
√(a²) = |a| (nilai mutlak!)
ⁿ√(aⁿ) = |a| (untuk n genap)
ⁿ√(aⁿ) = a (untuk n ganjil)
```

**Hati-hati:**
```
√((-3)²) = √9 = 3 (bukan -3!)
```

**Sifat 4: Akar Bertingkat**
```
ᵐ√(ⁿ√a) = ᵐⁿ√a
```

Contoh:
```
³√(√64) = ⁶√64 = 2
```

### Menyederhanakan Bentuk Akar

**Langkah:**
1. Faktorkan bilangan di dalam akar
2. Cari faktor yang merupakan kuadrat sempurna
3. Keluarkan dari akar

**Contoh 1:**
```
√72 = ?
= √(36 × 2)
= √36 × √2
= 6√2
```

**Contoh 2:**
```
√200 = ?
= √(100 × 2)
= 10√2
```

**Contoh 3:**
```
√48 = ?
= √(16 × 3)
= 4√3
```

**Trik:** Cari faktor kuadrat terbesar!

**Faktor kuadrat yang sering muncul:**
- 4, 9, 16, 25, 36, 49, 64, 81, 100

### Jebakan-Jebakan Akar di SNBT

**Jebakan #1: √(a²+b²) ≠ a+b**
```
SALAH: √(9+16) = √9 + √16 = 3 + 4 = 7 ❌
BENAR: √(9+16) = √25 = 5 ✓
```

**Jebakan #2: (√a)² vs √(a²)**
```
(√5)² = 5 ✓
√(5²) = √25 = 5 ✓
```
Sama sih, tapi:
```
(√(-5))² = undefined (di bilangan real)
√((-5)²) = √25 = 5 ✓
```

**Jebakan #3: √a√b vs √(ab)**
```
Ini SAMA! √a × √b = √(ab)
```
Tapi:
```
√a + √b ≠ √(a+b)
```

**Jebakan #4: Lupa Sederhanakan**
Jawaban √50 kurang bagus dibanding 5√2 (bentuk sederhana)

### Tips Jitu Akar di SNBT

**🎯 Tip #1: Hapal Kuadrat Sempurna**
Sampai minimal 15² = 225

**🎯 Tip #2: Hapal √2, √3, √5**
Ini trio emas! Banyak muncul di soal.

**🎯 Tip #3: Kalau Bingung, Kuadratkan**
Mau bandingin dua bilangan dengan akar? Kuadratkan aja!

**🎯 Tip #4: Rasionalkan di Akhir**
Jangan buru-buru rasionalkan kalau belum perlu. Kadang malah bikin ribet.

**🎯 Tip #5: Cek Apakah Bisa Disederhanakan**
Sebelum jawab, cek apakah akarnya bisa disederhanakan (cari faktor kuadrat!)

---
