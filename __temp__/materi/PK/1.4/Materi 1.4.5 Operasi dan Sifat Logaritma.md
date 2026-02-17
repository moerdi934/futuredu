# SECTION 1: Aljabar dan Persamaan
## Topic 1.4: Fungsi Eksponen dan Logaritma

---


## **Materi 1.4.5: Operasi dan Sifat Logaritma**

### The Power of Logarithm Properties! ⚡

Kalau di materi sebelumnya kamu udah kenal dengan dasar-dasar logaritma, sekarang saatnya kamu belajar sifat-sifat logaritma yang akan jadi **senjata utama** kamu dalam menyelesaikan soal-soal SNBT!

Sifat-sifat logaritma ini bukan sekadar rumus yang perlu dihafalin. Mereka adalah tool yang akan bikin soal rumit jadi simple, soal panjang jadi pendek, dan soal yang awalnya mustahil jadi "oh gitu doang!" 

---

### **Mengapa Sifat Logaritma Penting?**

Bayangin kamu disuruh hitung **log 2 + log 50** tanpa kalkulator. Susah kan?

Tapi kalau kamu tau sifat logaritma:
- log 2 + log 50 = log (2 × 50) = log 100 = **2**

BOOM! Instan! Tanpa kalkulator!

Ini yang bikin sifat logaritma super powerful. Mereka mengubah operasi yang kompleks jadi sederhana.

---

### **Sifat 1: Logaritma Perkalian**

**ᵃlog (b · c) = ᵃlog b + ᵃlog c**

"Logaritma dari perkalian = jumlah logaritma"

**Intuisi:** Kenapa ini masuk akal?

Ingat definisi logaritma: ᵃlog b = x artinya aˣ = b

Misalkan:
- ᵃlog b = m → aᵐ = b
- ᵃlog c = n → aⁿ = c

Maka:
- b · c = aᵐ · aⁿ = aᵐ⁺ⁿ
- ᵃlog (b · c) = m + n = ᵃlog b + ᵃlog c ✓

**Contoh Aplikasi:**

1. **log (2 × 5) = log 2 + log 5**

2. **²log 24 = ²log (3 × 8) = ²log 3 + ²log 8 = ²log 3 + 3**

3. **³log 54 = ³log (2 × 27) = ³log 2 + ³log 27 = ³log 2 + 3**

**Generalisasi untuk banyak faktor:**

ᵃlog (b · c · d · ...) = ᵃlog b + ᵃlog c + ᵃlog d + ...

**Contoh:**

log (2 × 3 × 5) = log 2 + log 3 + log 5

---

### **Sifat 2: Logaritma Pembagian**

**ᵃlog (b / c) = ᵃlog b - ᵃlog c**

"Logaritma dari pembagian = selisih logaritma"

**Intuisi:** Ini kebalikan dari sifat perkalian.

Kalau b/c = aᵐ/aⁿ = aᵐ⁻ⁿ, maka ᵃlog (b/c) = m - n ✓

**Contoh Aplikasi:**

1. **log (100/10) = log 100 - log 10 = 2 - 1 = 1**

2. **²log (16/4) = ²log 16 - ²log 4 = 4 - 2 = 2**

3. **⁵log (125/5) = ⁵log 125 - ⁵log 5 = 3 - 1 = 2**

**Kasus Khusus: Logaritma Pecahan**

ᵃlog (1/b) = ᵃlog 1 - ᵃlog b = 0 - ᵃlog b = **-ᵃlog b**

Jadi, logaritma dari 1/b adalah negatif dari logaritma b!

**Contoh:**

- ²log (1/8) = -²log 8 = -3
- ³log (1/9) = -³log 9 = -2
- ⁵log (1/25) = -⁵log 25 = -2

---

### **Sifat 3: Logaritma Perpangkatan**

**ᵃlog (bⁿ) = n · ᵃlog b**

"Pangkat bisa diturunkan jadi koefisien"

Ini adalah sifat yang SUPER sering dipakai!

**Intuisi:** Kalau bⁿ = (aᵐ)ⁿ = aᵐⁿ, maka ᵃlog (bⁿ) = mn = n · m = n · ᵃlog b ✓

**Contoh Aplikasi:**

1. **²log (8²) = 2 · ²log 8 = 2 · 3 = 6**

2. **log (10³) = 3 · log 10 = 3 · 1 = 3**

3. **³log (9²) = 2 · ³log 9 = 2 · 2 = 4**

**Kasus Pangkat Pecahan (Akar):**

ᵃlog (√b) = ᵃlog (b^(1/2)) = (1/2) · ᵃlog b

ᵃlog (³√b) = ᵃlog (b^(1/3)) = (1/3) · ᵃlog b

**Contoh:**

- ²log (√16) = (1/2) · ²log 16 = (1/2) · 4 = 2
- ³log (³√27) = (1/3) · ³log 27 = (1/3) · 3 = 1

**Kasus Pangkat Negatif:**

ᵃlog (b⁻ⁿ) = -n · ᵃlog b

**Contoh:**

- ²log (2⁻³) = -3 · ²log 2 = -3 · 1 = -3

---

### **Sifat 4: Rumus Perubahan Basis**

**ᵃlog b = (ᶜlog b) / (ᶜlog a)**

Di mana c adalah basis baru yang kamu pilih (biasanya 10 atau e).

**Ini sangat berguna kalau:**
- Kalkulator kamu cuma punya log basis 10
- Kamu perlu menyamakan basis
- Kamu perlu simplifikasi

**Contoh Aplikasi:**

1. **²log 5 = (log 5) / (log 2)**

   Dengan kalkulator:
   - log 5 ≈ 0,699
   - log 2 ≈ 0,301
   - ²log 5 ≈ 0,699 / 0,301 ≈ 2,32

2. **⁵log 30 = (log 30) / (log 5)**

**Kasus Khusus: Reciprocal**

**ᵃlog b · ᵇlog a = 1**

Atau bisa ditulis: **ᵃlog b = 1 / (ᵇlog a)**

**Bukti:**

ᵃlog b = (ᶜlog b) / (ᶜlog a)

ᵇlog a = (ᶜlog a) / (ᶜlog b)

ᵃlog b · ᵇlog a = [(ᶜlog b) / (ᶜlog a)] · [(ᶜlog a) / (ᶜlog b)] = 1 ✓

**Contoh:**

- ²log 3 · ³log 2 = 1
- ⁵log 7 · ⁷log 5 = 1
- log 2 · ²log 10 = 1

---

### **Sifat 5: Logaritma Berantai (Chain Rule)**

**ᵃlog b · ᵇlog c = ᵃlog c**

"Basis kedua sama dengan numerus pertama → bisa digabung!"

**Bukti:**

Misalkan:
- ᵃlog b = m → b = aᵐ
- ᵇlog c = n → c = bⁿ

Maka:
- c = bⁿ = (aᵐ)ⁿ = aᵐⁿ
- ᵃlog c = mn = ᵃlog b · ᵇlog c ✓

**Contoh Aplikasi:**

1. **²log 3 · ³log 8 = ²log 8 = 3**

2. **⁵log 2 · ²log 32 = ⁵log 32**
   - ²log 32 = 5 (karena 2⁵ = 32)
   - ⁵log 2 · 5 = 5 · ⁵log 2

**Generalisasi:**

ᵃlog b · ᵇlog c · ᶜlog d = ᵃlog d

**Contoh:**

²log 3 · ³log 5 · ⁵log 16 = ²log 16 = 4

---

### **Sifat 6: Basis dan Numerus Dipangkatkan**

**ᵃⁿlog (bᵐ) = (m/n) · ᵃlog b**

"Kalau basis dan numerus sama-sama dipangkatkan, pangkatnya jadi pecahan!"

**Bukti:**

ᵃⁿlog (bᵐ) = (log bᵐ) / (log aⁿ) = (m · log b) / (n · log a) = (m/n) · (log b / log a) = (m/n) · ᵃlog b ✓

**Contoh Aplikasi:**

1. **²³log (5²) = (2/3) · ²log 5**

2. **⁴²log (8³) = (3/2) · ⁴log 8**
   - ⁴log 8 = ⁴log 2³ = 3 · ⁴log 2 = 3 · (1/2) = 3/2
   - Jadi: (3/2) · (3/2) = 9/4

---

### **Sifat 7: Logaritma dari 1 dan Basis**

Ini udah kita bahas sebelumnya, tapi worth mentioning lagi:

1. **ᵃlog 1 = 0** untuk semua a > 0, a ≠ 1

2. **ᵃlog a = 1** untuk semua a > 0, a ≠ 1

3. **ᵃlog aⁿ = n** untuk semua a > 0, a ≠ 1

4. **aᵃˡᵒᵍ ᵇ = b** (ini adalah "undo" antara eksponen dan log!)

---

### **Kombinasi Sifat-Sifat Logaritma**

Ini adalah bagian di mana magic happens! Soal SNBT biasanya ngasih ekspresi yang kompleks dan butuh kombinasi beberapa sifat.

**Contoh 1:**

Sederhanakan: **²log 12 - ²log 3**

Jawab:
- ²log 12 - ²log 3 = ²log (12/3) [Sifat pembagian]
- = ²log 4
- = 2

**Contoh 2:**

Sederhanakan: **log 2 + log 5 + log 10**

Jawab:
- log 2 + log 5 + log 10 = log (2 × 5 × 10) [Sifat perkalian]
- = log 100
- = 2

**Contoh 3:**

Sederhanakan: **²log 48 - ²log 6 + ²log 4**

Jawab:
- ²log 48 - ²log 6 + ²log 4 = ²log (48/6) + ²log 4 [Sifat pembagian]
- = ²log 8 + ²log 4
- = ²log (8 × 4) [Sifat perkalian]
- = ²log 32
- = 5

**Contoh 4:**

Sederhanakan: **³log 2 · ²log 81**

Jawab:
- ³log 2 · ²log 81 = ³log 81 [Sifat berantai, karena basis kedua = numerus pertama]
- = ³log 3⁴
- = 4 · ³log 3
- = 4

**Contoh 5:**

Sederhanakan: **⁵log 2 · ²log 125**

Jawab:
- ⁵log 2 · ²log 125 = ⁵log 125 [Sifat berantai]
- = ⁵log 5³
- = 3

---

### **Strategi Menyederhanakan Ekspresi Logaritma**

**STEP 1: Identifikasi Sifat yang Bisa Dipakai**
- Apakah ada penjumlahan? → Coba gabung jadi perkalian
- Apakah ada pengurangan? → Coba gabung jadi pembagian
- Apakah ada perkalian log? → Cek apakah bisa pakai chain rule
- Apakah ada pangkat? → Turunkan jadi koefisien

**STEP 2: Faktorkan Numerus Kalau Perlu**
- 12 = 3 × 4 = 3 × 2²
- 48 = 16 × 3 = 2⁴ × 3
- 18 = 2 × 9 = 2 × 3²

**STEP 3: Cari Basis yang Sesuai**
- Kalau ada ²log, coba ubah numerus jadi perpangkatan 2
- Kalau ada ³log, coba ubah numerus jadi perpangkatan 3

**STEP 4: Simplifikasi Secara Bertahap**
- Jangan langsung loncat ke jawaban
- Lakukan satu langkah pada satu waktu
- Check setelah tiap langkah

---

### **Tips & Trik Khusus SNBT**

**🔥 Trik 1: Hafalkan Faktorisasi Bilangan Umum**

Ini akan save waktu kamu:

- 12 = 2² × 3
- 18 = 2 × 3²
- 24 = 2³ × 3
- 36 = 2² × 3²
- 48 = 2⁴ × 3
- 54 = 2 × 3³
- 72 = 2³ × 3²

**🔥 Trik 2: Kenali Pola Chain Rule**

Kalau kamu lihat **ᵃlog b · ᵇlog c**, langsung tau itu bisa jadi **ᵃlog c**!

**🔥 Trik 3: Ubah Basis Kalau Perlu**

Kalau soal ngasih berbagai basis yang berbeda, consider ubah semua ke basis yang sama (biasanya 10 atau 2).

**🔥 Trik 4: Cek dengan Substitusi Nilai**

Kalau nggak yakin, pilih nilai spesifik untuk check:

Misalnya, apakah log (a + b) = log a + log b?

Test dengan a = 10, b = 10:
- log (10 + 10) = log 20 ≈ 1,3
- log 10 + log 10 = 1 + 1 = 2
- 1,3 ≠ 2, jadi SALAH! ✗

**🎯 Jebakan yang Sering Muncul:**

1. **log (a + b) ≠ log a + log b** (INI SALAH BESAR!)
   - Yang benar: log (a × b) = log a + log b

2. **log (a - b) ≠ log a - log b** (INI JUGA SALAH!)
   - Yang benar: log (a / b) = log a - log b

3. **(log a)ⁿ ≠ log (aⁿ)** (BEDA!)
   - (log a)ⁿ = log dikuadratkan/dipangkatkan
   - log (aⁿ) = n · log a

4. **ᵃlog b + ᶜlog d ≠ bisa langsung digabung** (basis berbeda!)
   - Harus ubah basis dulu!

5. **Lupa tanda saat ada pengurangan**
   - log 100 - log 10 = log (100/10) = log 10 = 1 ✓
   - BUKAN log 90! ✗

---

### **Tabel Rangkuman Sifat Logaritma**

| Sifat | Rumus | Contoh |
|-------|-------|--------|
| Perkalian | ᵃlog (bc) = ᵃlog b + ᵃlog c | ²log 8 = ²log (2×4) = 1 + 2 |
| Pembagian | ᵃlog (b/c) = ᵃlog b - ᵃlog c | ²log 2 = ²log (8/4) = 3 - 2 |
| Perpangkatan | ᵃlog (bⁿ) = n · ᵃlog b | ²log 16 = ²log 2⁴ = 4 |
| Perubahan basis | ᵃlog b = (ᶜlog b)/(ᶜlog a) | ²log 5 = (log 5)/(log 2) |
| Reciprocal | ᵃlog b = 1/(ᵇlog a) | ²log 3 = 1/(³log 2) |
| Chain rule | ᵃlog b · ᵇlog c = ᵃlog c | ²log 3 · ³log 8 = ²log 8 |
| Basis & numerus pangkat | ᵃⁿlog (bᵐ) = (m/n) · ᵃlog b | ⁴²log 8³ = (3/2) · ⁴log 8 |

---

Sekarang kamu udah punya arsenal lengkap sifat-sifat logaritma! Di materi selanjutnya, kita akan aplikasikan semua ini untuk menyelesaikan **Persamaan Logaritma**—di mana kamu akan ketemu dengan variabel di dalam logaritma. Get ready untuk level up lagi! 🔥

---
