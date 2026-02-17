# SECTION 1: Aljabar - Pola Bilangan

## Topic 1.1: Pola Bilangan

---


## 📚 Materi 1.1.5: Pola Bilangan Fibonacci dan Pola Kompleks

### The Golden Ratio Gang! 🌻✨

Selamat datang di level **pola legendary**! Fibonacci bukan cuma pola biasa—dia ada di mana-mana: spiral cangkang siput, susunan biji bunga matahari, proporsi tubuh manusia, bahkan **trading saham**! 📈

Di materi ini kita bakal ngebahas pola-pola yang lebih "nakal"—yang nggak bisa ditebak cuma dari tambah/kali simpel. These are the **boss level patterns**! 🎮

---

### 🌀 Barisan Fibonacci (The Most Famous Sequence!)

#### **Konsep Dasar**

Barisan Fibonacci adalah barisan di mana **setiap suku = jumlah 2 suku sebelumnya**.

**Barisan:**
```
1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, ...
```

**Aturan:**
```
F₁ = 1
F₂ = 1
Fₙ = Fₙ₋₁ + Fₙ₋₂ (untuk n ≥ 3)
```

**Cara Baca:**
```
1 + 1 = 2
1 + 2 = 3
2 + 3 = 5
3 + 5 = 8
5 + 8 = 13
...dan seterusnya
```

#### **Sejarah Singkat**

Leonardo Fibonacci (matematikawan Italia, 1170-1250) menemukan pola ini dari masalah **perkembangbiakan kelinci**!

**Masalah:**  
"Berapa pasang kelinci setelah 1 tahun, jika:
- Dimulai dengan 1 pasang kelinci bayi
- Setiap pasang dewasa melahirkan 1 pasang baru tiap bulan
- Kelinci butuh 1 bulan untuk jadi dewasa
- Kelinci tidak pernah mati"

**Hasilnya:**  
Bulan 1: 1 pasang (bayi)  
Bulan 2: 1 pasang (dewasa, belum punya anak)  
Bulan 3: 2 pasang (1 dewasa + 1 bayi baru)  
Bulan 4: 3 pasang  
Bulan 5: 5 pasang  
→ Pola Fibonacci!

---

#### **Sifat-Sifat Fibonacci**

**1. Golden Ratio (φ - phi)**

Kalau lo bagi suku Fibonacci dengan suku sebelumnya, hasilnya **mendekati 1.618...** (Golden Ratio)!

```
2/1 = 2
3/2 = 1.5
5/3 = 1.666...
8/5 = 1.6
13/8 = 1.625
21/13 = 1.615...
34/21 = 1.619...
→ Mendekati φ = 1.618033988...
```

Golden Ratio ini ada **di mana-mana** di alam dan seni!

**2. Jumlah n Suku Pertama**

Jumlah n suku pertama Fibonacci = **Fₙ₊₂ - 1**

```
1 + 1 + 2 + 3 + 5 = 12 = F₇ - 1 = 13 - 1 ✓
```

**3. Kuadrat Fibonacci**

```
F²ₙ = Fₙ₋₁ × Fₙ₊₁ + (-1)^(n+1)
```

Artinya, kuadrat suku Fibonacci **hampir sama** dengan perkalian suku sebelum dan sesudahnya!

```
5² = 25
3 × 8 = 24
Selisih = 1 ✓
```

---

### 🧩 Pola dengan Operasi Campuran

Ini dia pola yang suka jadi **jebakan** di UTBK! Polanya melibatkan **lebih dari satu operasi**.

#### **Tipe 1: Tambah Bergantian dengan Kali**

**Contoh:**
```
2, 4, 6, 12, 14, 28, 30, ...

Pola:
2 → 4 (×2)
4 → 6 (+2)
6 → 12 (×2)
12 → 14 (+2)
14 → 28 (×2)
28 → 30 (+2)
```

**Aturan:** Bergantian ×2 dan +2

**Suku berikutnya:** 30 × 2 = **60**

---

#### **Tipe 2: Operasi yang Berubah**

**Contoh:**
```
1, 2, 4, 7, 11, 16, 22, ...

Selisih:
2-1 = 1
4-2 = 2
7-4 = 3
11-7 = 4
16-11 = 5
22-16 = 6

Pola selisih: +1, +2, +3, +4, +5, +6, ...
```

**Suku berikutnya:** 22 + 7 = **29**

---

#### **Tipe 3: Kali Terus Tambah/Kurang**

**Contoh:**
```
1, 3, 9, 25, 69, ...

Pola:
1 × 3 = 3
3 × 3 = 9
9 × 3 - 2 = 25
25 × 3 - 6 = 69

Hmm... nggak konsisten!
```

Coba pendekatan lain:
```
1 → 3 (×3+0)
3 → 9 (×3+0)
9 → 25 (×3-2)
25 → 69 (×3-6)

Pola pengurangan: 0, 0, -2, -6, ...
Selisih: 0, -2, -4, ... (turun 2!)
```

Ini contoh pola yang **butuh trial-error**!

---

### 🔄 Pola Bilangan Bertingkat

#### **Konsep Dasar**

Pola bertingkat adalah pola di mana **selisih tingkat ke-n baru konsisten**.

**Contoh 1: Pola Kuadratik (Selisih Tingkat 2 Konsisten)**

```
Barisan: 1, 4, 9, 16, 25, ...

Selisih 1: 3, 5, 7, 9, ...
Selisih 2: 2, 2, 2, 2, ... (konsisten!)
```

Kalau selisih tingkat 2 konsisten, **rumusnya kuadratik**: Uₙ = an² + bn + c

---

**Contoh 2: Pola Kubik (Selisih Tingkat 3 Konsisten)**

```
Barisan: 1, 8, 27, 64, 125, ...

Selisih 1: 7, 19, 37, 61, ...
Selisih 2: 12, 18, 24, ...
Selisih 3: 6, 6, 6, ... (konsisten!)
```

Kalau selisih tingkat 3 konsisten, **rumusnya kubik**: Uₙ = an³ + bn² + cn + d

---

#### **Cara Mencari Rumus Umum**

Ini agak advanced, tapi berguna banget!

**Langkah-langkah:**

1. **Identifikasi tingkat selisih yang konsisten**
   - Tingkat 1 → Linear (Uₙ = an + b)
   - Tingkat 2 → Kuadratik (Uₙ = an² + bn + c)
   - Tingkat 3 → Kubik (Uₙ = an³ + bn² + cn + d)

2. **Substitusi nilai n**
   Gunakan suku pertama, kedua, ketiga, dst untuk cari a, b, c, d

**Contoh:**
```
Barisan: 2, 5, 10, 17, 26, ...

Selisih 1: 3, 5, 7, 9, ...
Selisih 2: 2, 2, 2, ... (konsisten!)

→ Pola kuadratik: Uₙ = an² + bn + c

Substitusi:
U₁ = 2: a(1)² + b(1) + c = 2 → a + b + c = 2
U₂ = 5: a(2)² + b(2) + c = 5 → 4a + 2b + c = 5
U₃ = 10: a(3)² + b(3) + c = 10 → 9a + 3b + c = 10

Selesaikan sistem persamaan:
a = 1, b = 0, c = 1

Jadi: Uₙ = n² + 1 ✓
```

---

### 🎭 Pola dengan Aturan Berubah-Ubah

#### **Tipe 1: Bergantian Dua Aturan**

**Contoh:**
```
1, 3, 4, 12, 13, 39, 40, ...

Pola:
1 → 3 (×3)
3 → 4 (+1)
4 → 12 (×3)
12 → 13 (+1)
13 → 39 (×3)
39 → 40 (+1)
```

**Aturan:** Bergantian ×3 dan +1

---

#### **Tipe 2: Pola Posisi Ganjil-Genap Berbeda**

**Contoh:**
```
2, 5, 6, 11, 10, 17, 14, ...

Posisi ganjil (1,3,5,7): 2, 6, 10, 14, ... (aritmatika, b=4)
Posisi genap (2,4,6): 5, 11, 17, ... (aritmatika, b=6)
```

Ini **dua pola terpisah** yang digabung!

---

### 🔁 Rekursi dalam Barisan Bilangan

**Rekursi** = Suku ke-n ditentukan oleh suku-suku sebelumnya.

**Contoh:**

**1. Fibonacci (Rekursi Order 2)**
```
Fₙ = Fₙ₋₁ + Fₙ₋₂
```

**2. Tribonacci (Rekursi Order 3)**
```
Tₙ = Tₙ₋₁ + Tₙ₋₂ + Tₙ₋₃

Barisan: 1, 1, 1, 3, 5, 9, 17, 31, ...
(1+1+1=3, 1+1+3=5, 1+3+5=9, ...)
```

**3. Pell Numbers**
```
Pₙ = 2Pₙ₋₁ + Pₙ₋₂
P₁ = 1, P₂ = 2

Barisan: 1, 2, 5, 12, 29, 70, ...
```

---

### 🚨 Tips & Trik untuk Pola Kompleks

#### **Tip #1: Jangan Panik!**

Kalau ketemu pola yang bingung, ikuti **SOP** ini:

1. Cek aritmatika ✓
2. Cek geometri ✓
3. Cek pola khusus (kuadrat, segitiga, dll) ✓
4. Cek selisih bertingkat ✓
5. Cek pola bergantian/ganjil-genap ✓
6. Cek rekursi (Fibonacci-like) ✓

---

#### **Tip #2: Pisahkan Jadi Sub-Barisan**

Kadang ada **dua pola terpisah** yang digabung:

```
1, 10, 2, 20, 3, 30, 4, 40, ...

Posisi ganjil: 1, 2, 3, 4, ... (+1)
Posisi genap: 10, 20, 30, 40, ... (+10)
```

---

#### **Tip #3: Cari Pola dalam Operasi**

```
2, 3, 5, 9, 17, 33, ...

Selisih: 1, 2, 4, 8, 16, ... (geometri r=2!)

Jadi: Uₙ = Uₙ₋₁ + 2^(n-2)
```

---

#### **Tip #4: Jangan Lupa Cek 5-6 Suku!**

Pola kompleks kadang baru keliatan setelah 5-6 suku. Jangan langsung nyerah di suku ke-3!

---

### 🎯 Jebakan UTBK pada Pola Kompleks

#### **Jebakan #1: Fibonacci Modifikasi**

**Soal:**
```
2, 3, 5, 8, 13, 21, ...
```

**Jebakan:** "Ini Fibonacci!"  
**Benar:** Ini **Fibonacci dimulai dari 2 dan 3**, bukan 1 dan 1!

Tetep rumusnya: Fₙ = Fₙ₋₁ + Fₙ₋₂, tapi F₁=2, F₂=3

---

#### **Jebakan #2: Pola yang Kelihatan Acak**

**Soal:**
```
1, 1, 2, 3, 5, 8, 13, 21, ...
```

Di suku pertama ada **dua 1** berturut-turut. Jangan sampai salah hitung posisi!

F₁ = 1  
F₂ = 1  
F₃ = 2 (bukan F₂!)

---

#### **Jebakan #3: Operasi Tersembunyi**

**Soal:**
```
1, 4, 5, 9, 14, 23, ...
```

**Analisis:**
```
4 - 1 = 3
5 - 4 = 1
9 - 5 = 4
14 - 9 = 5
23 - 14 = 9

Selisih: 3, 1, 4, 5, 9, ...
→ Ini Fibonacci (1,1,2,3,5,8,...)? Nggak pas...
→ Ini 3,1,4,5,9,... → 1+3=4, 3+1=4... Hah?

Coba lagi:
Suku ganjil: 1, 5, 14, ... (selisih 4, 9, ... nggak konsisten)
Suku genap: 4, 9, 23, ... (selisih 5, 14, ... juga nggak)

Coba Fibonacci:
1, 4, 1+4=5, 4+5=9, 5+9=14, 9+14=23 ✓
```

**Ini Fibonacci dengan F₁=1, F₂=4!**

---

### 🌟 Kesimpulan Materi 1.1.5

Pola kompleks butuh **ketelitian** dan **kreativitas**:

✅ **Fibonacci**: Fₙ = Fₙ₋₁ + Fₙ₋₂  
✅ **Pola Campuran**: Cek operasi bergantian  
✅ **Pola Bertingkat**: Gunakan selisih multiple  
✅ **Rekursi**: Suku baru dari suku-suku sebelumnya  
✅ **Strategi**: Systematic, jangan skip langkah!  

Next: **Deret Bilangan** - saatnya kita JUMLAHIN semua suku ini! 📊

---
