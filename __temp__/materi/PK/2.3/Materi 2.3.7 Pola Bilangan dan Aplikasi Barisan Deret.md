# SECTION 2: Bilangan dan Aritmatika
## Topic 2.3: Barisan dan Deret

---


### **Materi 2.3.7: Pola Bilangan dan Aplikasi Barisan Deret**

Oke, sekarang kita sampai di materi terakhir untuk topik Barisan dan Deret! Di sini kita bakal explore berbagai **pola bilangan unik** yang sering muncul di SNBT, plus aplikasi real-world dari barisan dan deret. This is where everything comes together!

#### **Pola Bilangan Segitiga**

Bayangin lo susun bola-bola berbentuk segitiga:

```
Level 1:    •             → 1 bola
Level 2:    • •           → 3 bola (1+2)
Level 3:    • • •         → 6 bola (1+2+3)
Level 4:    • • • •       → 10 bola (1+2+3+4)
```

Pola: 1, 3, 6, 10, 15, 21, ...

**Rumus Bilangan Segitiga ke-n:**
```
Tₙ = n(n+1)/2
```

Ini sebenarnya adalah **jumlah n bilangan asli pertama**!

**Sifat Menarik:**
- Setiap bilangan segitiga adalah jumlah bilangan-bilangan sebelumnya
- T₁ + T₂ + T₃ + ... + Tₙ bisa dihitung dengan rumus khusus
- Dua bilangan segitiga berurutan jumlahnya adalah bilangan kuadrat!
  - T₃ + T₄ = 6 + 10 = 16 = 4²
  - T₄ + T₅ = 10 + 15 = 25 = 5²

**Contoh Soal:**

Berapa bilangan segitiga ke-20?
```
T₂₀ = 20(21)/2 = 210
```

#### **Pola Bilangan Persegi**

Ini yang paling straightforward - kuadrat dari bilangan asli!

Pola: 1, 4, 9, 16, 25, 36, 49, ...

**Rumus:**
```
Sₙ = n²
```

**Selisih Bilangan Persegi:**

Selisih dua bilangan persegi berurutan adalah bilangan ganjil!
- 4 - 1 = 3
- 9 - 4 = 5
- 16 - 9 = 7
- 25 - 16 = 9

Jadi: n² - (n-1)² = 2n - 1

**Aplikasi:**

Kadang soal SNBT kasih pola persegi tapi "disembunyikan":

Pola: 5, 9, 13, 17, 21, ...

Apa rumusnya?
```
Uₙ = 4n + 1
```

Tapi perhatiin: 5 = 4(1) + 1, 9 = 4(2) + 1 = 2² + 1

Ada hubungannya dengan persegi!

#### **Pola Bilangan Persegi Panjang (Pronic Numbers)**

Ini hasil perkalian dua bilangan asli berurutan!

Pola: 2, 6, 12, 20, 30, 42, ...

**Rumus:**
```
Pₙ = n(n+1)
```

**Penjelasan:**
- P₁ = 1 × 2 = 2
- P₂ = 2 × 3 = 6
- P₃ = 3 × 4 = 12
- P₄ = 4 × 5 = 20

**Sifat Menarik:**

Bilangan persegi panjang selalu GENAP (karena salah satu faktornya pasti genap)!

**Hubungan dengan Segitiga:**
```
Pₙ = 2 × Tₙ
```

Karena n(n+1) = 2 × n(n+1)/2

#### **Barisan Fibonacci: The Golden Ratio**

Ini salah satu barisan PALING TERKENAL dalam matematika!

Pola: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, ...

**Aturan:**

Setiap suku adalah **jumlah dua suku sebelumnya**:
```
Fₙ = Fₙ₋₁ + Fₙ₋₂
```

Dengan F₁ = 1, F₂ = 1

**Rumus Binet (Advanced!):**

Ada rumus eksplisit untuk Fibonacci:
```
Fₙ = (φⁿ - ψⁿ) / √5
```

Di mana:
- φ = (1 + √5)/2 ≈ 1,618 (golden ratio)
- ψ = (1 - √5)/2 ≈ -0,618

**Aplikasi Real Life:**

1. **Alam:** Pola bunga matahari, kerang nautilus, daun pohon
2. **Seni:** Proporsi lukisan, arsitektur (Parthenon)
3. **Keuangan:** Fibonacci retracement dalam trading
4. **Komputer:** Algoritma pencarian dan sorting

**Sifat Keren:**

Rasio dua suku Fibonacci berurutan mendekati φ (golden ratio):
```
F₁₀/F₉ = 55/34 ≈ 1,618
F₁₅/F₁₄ = 610/377 ≈ 1,618
```

#### **Pola Bilangan Kubik**

Pangkat tiga dari bilangan asli!

Pola: 1, 8, 27, 64, 125, 216, ...

**Rumus:**
```
Cₙ = n³
```

**Sifat Unik:**

Jumlah n bilangan kubik pertama = kuadrat dari bilangan segitiga!

```
1³ + 2³ + 3³ + ... + n³ = [n(n+1)/2]²
```

Contoh:
```
1³ + 2³ + 3³ = 1 + 8 + 27 = 36 = 6² = [3(4)/2]²
```

**Mind-blowing kan?**

#### **Pola Bilangan Prima**

Pola: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, ...

**Catatan Penting:**

Bilangan prima TIDAK punya rumus sederhana! Ini yang bikin prima menarik dan misterius.

**Yang Perlu Diingat:**

- Satu-satunya prima genap: **2**
- Prima terkecil: **2**
- Selain 2, semua prima adalah **ganjil**
- Tidak semua ganjil adalah prima (contoh: 9, 15, 21)

**Twin Primes:**

Dua prima yang selisihnya 2:
- 3 dan 5
- 5 dan 7
- 11 dan 13
- 17 dan 19

#### **Pola Tingkat Dua (Quadratic Sequence)**

Ini pola yang selisih kedua-nya konstan!

**Contoh:**

Pola: 2, 5, 10, 17, 26, ...

Selisih pertama: 3, 5, 7, 9, ...
Selisih kedua: 2, 2, 2, ... (konstan!)

**Cara Identifikasi:**

1. Hitung selisih antar suku (selisih pertama)
2. Hitung selisih dari selisih pertama (selisih kedua)
3. Kalau selisih kedua konstan → Pola tingkat dua!

**Bentuk Umum:**
```
Uₙ = an² + bn + c
```

**Cara Cari Rumus:**

Kalau selisih kedua = 2a, maka:
```
a = (selisih kedua) / 2
```

**Contoh Lengkap:**

Pola: 3, 7, 13, 21, 31, ...

Selisih pertama: 4, 6, 8, 10, ...
Selisih kedua: 2, 2, 2, ...

Jadi:
```
a = 2/2 = 1
```

Rumusnya berbentuk: Uₙ = n² + bn + c

Substitusi U₁ = 3:
```
1 + b + c = 3
b + c = 2
```

Substitusi U₂ = 7:
```
4 + 2b + c = 7
2b + c = 3
```

Dari dua persamaan:
```
b = 1, c = 1
```

**Rumus Final:**
```
Uₙ = n² + n + 1
```

Cek: U₃ = 9 + 3 + 1 = 13 ✓

#### **Pola Berselang-seling**

Pola yang suka-sukanya berubah tanda!

**Tipe 1: Berselang-seling Sederhana**

Pola: 1, -2, 3, -4, 5, -6, ...

**Rumus:**
```
Uₙ = (-1)ⁿ⁺¹ × n
```

Atau:
```
Uₙ = (-1)ⁿ⁻¹ × n
```

**Tipe 2: Kombinasi Pola**

Pola: 2, -4, 8, -16, 32, ...

Ini kombinasi geometri (r = 2) dengan berselang-seling!

**Rumus:**
```
Uₙ = (-1)ⁿ⁺¹ × 2ⁿ
```

#### **Aplikasi dalam Soal Cerita SNBT**

**Aplikasi 1: Tabungan Progresif**

Januari: Rp 100.000
Februari: Rp 150.000
Maret: Rp 200.000
...

Berapa total tabungan setelah 2 tahun?

**Analisis:**
- Barisan aritmatika: a = 100.000, b = 50.000
- n = 24 bulan

```
S₂₄ = 24/2 [2(100.000) + 23(50.000)]
S₂₄ = 12 [200.000 + 1.150.000]
S₂₄ = 12 × 1.350.000
S₂₄ = Rp 16.200.000
```

**Aplikasi 2: Pertumbuhan Bakteri**

Awal: 1000 bakteri
Setiap jam membelah jadi 3

Berapa bakteri setelah 8 jam?

**Analisis:**
- Barisan geometri: a = 1000, r = 3
- n = 9 (termasuk awal)

```
U₉ = 1000 × 3⁸
U₉ = 1000 × 6561
U₉ = 6.561.000 bakteri
```

**Aplikasi 3: Produksi Meningkat**

Bulan 1: 100 unit
Bulan 2: 150 unit
Bulan 3: 225 unit

Pola: Setiap bulan naik 50%

Total produksi 6 bulan pertama?

**Analisis:**
- Barisan geometri: a = 100, r = 1,5
- n = 6

```
S₆ = 100(1,5⁶ - 1) / (1,5 - 1)
S₆ = 100(11,39 - 1) / 0,5
S₆ = 100 × 10,39 / 0,5
S₆ ≈ 2078 unit
```

**Aplikasi 4: Pembagian Hadiah**

10 pemenang, juara 1 dapat Rp 10 juta, selisih Rp 500 ribu.

Total dana hadiah?

**Analisis:**
- Barisan aritmatika: a = 10.000.000, b = -500.000
- n = 10

```
S₁₀ = 10/2 [2(10.000.000) + 9(-500.000)]
S₁₀ = 5 [20.000.000 - 4.500.000]
S₁₀ = 5 × 15.500.000
S₁₀ = Rp 77.500.000
```

#### **Strategi Menghadapi Pola di SNBT**

**Step 1: Identifikasi Jenis Pola**

- Cek selisih → Aritmatika?
- Cek rasio → Geometri?
- Cek selisih kedua → Tingkat dua?
- Cek bentuk khusus → Segitiga, persegi, dll?

**Step 2: Cari Rumus atau Pola**

- Untuk aritmatika/geometri → langsung pakai rumus
- Untuk pola khusus → recognize patternnya

**Step 3: Verifikasi**

- Cek dengan beberapa suku untuk memastikan rumus benar

**Step 4: Solve**

- Gunakan rumus yang tepat
- Hati-hati dengan perhitungan

#### **Trik SNBT untuk Pola**

**Trik #1: Pola Berulang**

Kadang pola nggak naik terus, tapi berulang:

Pola: 1, 2, 3, 1, 2, 3, 1, 2, 3, ...

U₁₀₀ = ?

Karena periode 3, maka:
```
100 = 33 × 3 + 1
```

Jadi U₁₀₀ sama dengan suku pertama dalam siklus = 1

**Trik #2: Pola dalam Pola**

Kadang ada pola besar yang mengandung pola kecil!

Pola: 2, 3, 5, 8, 12, 17, 23, ...

Selisih: 1, 2, 3, 4, 5, 6, ... (aritmatika!)

**Trik #3: Gunakan Substitusi**

Kalau pola kompleks, coba substitusi untuk simplifikasi.

**Trik #4: Cari Pembeda**

Apa yang bikin suku satu beda dari suku lain?
- Tanda?
- Pangkat?
- Faktor pengali?

#### **Jebakan Umum**

**Jebakan #1: Pola Tidak Jelas**

Pola: 1, 4, 9, 1, 6, 2, 5, ...

Kelihatannya random? Ternyata kuadrat dipisah digit!
- 1² = 1
- 2² = 4
- 3² = 9
- 4² = **1** **6**
- 5² = **2** **5**

**Jebakan #2: Pola Ganda**

Pola genap dan ganjil beda!

Pola: 2, 5, 4, 9, 8, 17, 16, 33, ...

Posisi ganjil: 2, 4, 8, 16, ... (geometri, r = 2)
Posisi genap: 5, 9, 17, 33, ... (rumus lain)

**Jebakan #3: Selisih Menipu**

Pola: 1, 2, 4, 7, 11, 16, ...

Selisih: 1, 2, 3, 4, 5, ... (aritmatika!)

Tapi pola aslinya bukan aritmatika!

#### **Final Tips**

1. **Practice berbagai jenis pola** - semakin banyak lo lihat, semakin cepat lo recognize
2. **Jangan langsung nyerah** - kadang pola butuh waktu untuk ketemu
3. **Cek beberapa cara** - kadang ada lebih dari satu cara lihat pola
4. **Verifikasi selalu** - pastikan rumus lo bener dengan cek beberapa suku
5. **Time management** - kalau stuck 2 menit, skip dan balik lagi

Dengan menguasai barisan dan deret plus pola-pola bilangan ini, lo udah punya arsenal lengkap untuk tackle soal-soal SNBT! Remember, practice makes perfect. Semakin sering lo ketemu berbagai variasi soal, semakin otomatis otak lo dalam identifikasi dan solve pola!

**Good luck dan semoga sukses SNBT-nya!** 🚀