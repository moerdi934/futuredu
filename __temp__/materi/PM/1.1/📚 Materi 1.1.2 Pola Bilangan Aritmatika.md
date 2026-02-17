# SECTION 1: Aljabar - Pola Bilangan

## Topic 1.1: Pola Bilangan

---


## 📚 Materi 1.1.2: Pola Bilangan Aritmatika

### Welcome to the Pattern Paradise! 🎢

Kalau di materi sebelumnya kita udah kenalan sama pola secara umum, sekarang saatnya kita "dating serius" sama salah satu pola paling populer di UTBK: **Pola Aritmatika**!

Pola ini kayak sahabat lo yang konsisten—kalau dia bilang mau dateng jam 7, ya pasti jam 7. Nggak ada drama "telat 10 menit" atau "sorry mendadak ada acara". Konsisten, reliable, dan **predictable**. That's aritmatika!

---

### 🎯 Apa Itu Pola Bilangan Aritmatika?

**Pola Aritmatika** (atau **Barisan Aritmatika**) adalah barisan bilangan di mana **selisih** antara dua suku berurutan **selalu sama**.

Selisih tetap ini punya nama khusus: **beda (b)** atau sering juga disebut **difference (d)**.

**Contoh Gampang:**
```
2, 5, 8, 11, 14, 17, ...

5 - 2 = 3
8 - 5 = 3
11 - 8 = 3
14 - 11 = 3
17 - 14 = 3

Bedanya (b) = 3 (konsisten!)
```

Nah, karena bedanya tetap 3, ini adalah **barisan aritmatika dengan beda 3**.

---

### 🔍 Ciri-Ciri Pola Aritmatika

Gimana cara ngenalin pola aritmatika dengan cepat? Cek ciri-ciri ini:

#### ✅ **Ciri #1: Selisih Konsisten**
Kurangin suku ke-n dengan suku ke-(n-1), hasilnya **selalu sama**.

#### ✅ **Ciri #2: Grafiknya Lurus**
Kalau lo plot di grafik, titik-titiknya bakal membentuk **garis lurus**. Makanya kadang disebut juga "linear sequence".

#### ✅ **Ciri #3: Pola Tambah/Kurang Terus**
Bisa nambah terus (b positif) atau kurang terus (b negatif), yang penting **konsisten**!

**Contoh Beda Positif (+):**
```
3, 7, 11, 15, 19, ...
Beda (b) = +4
```

**Contoh Beda Negatif (-):**
```
20, 15, 10, 5, 0, -5, ...
Beda (b) = -5
```

**Contoh Beda Nol (0):**
```
7, 7, 7, 7, 7, ...
Beda (b) = 0 (barisan konstan)
```

---

### 🧮 Rumus Suku ke-n: The Magic Formula!

Ini dia rumus yang bakal jadi **senjata utama** lo:

```
Uₙ = a + (n - 1)b
```

**Keterangan:**
- **Uₙ** = suku ke-n (yang mau dicari)
- **a** = suku pertama (U₁)
- **n** = nomor urut suku
- **b** = beda (selisih antar suku)

#### **Kenapa Rumusnya Gitu?**

Mari kita bedah pake logika:

```
Barisan: a, a+b, a+2b, a+3b, a+4b, ...

U₁ = a
U₂ = a + b = a + (2-1)b
U₃ = a + 2b = a + (3-1)b
U₄ = a + 3b = a + (4-1)b
U₅ = a + 4b = a + (5-1)b
...
Uₙ = a + (n-1)b
```

Jadi, untuk **sampai ke suku ke-n**, kita mulai dari **a** (suku pertama), terus **nambah b sebanyak (n-1) kali**!

---

### 📝 Contoh Penerapan Rumus

#### **Contoh 1: Mencari Suku Tertentu**

**Soal:**  
Diketahui barisan aritmatika: 5, 9, 13, 17, ...  
Tentukan suku ke-20!

**Penyelesaian:**
```
Diketahui:
a = 5 (suku pertama)
b = 9 - 5 = 4
n = 20

Ditanya: U₂₀ = ?

Jawab:
U₂₀ = a + (n-1)b
U₂₀ = 5 + (20-1) × 4
U₂₀ = 5 + 19 × 4
U₂₀ = 5 + 76
U₂₀ = 81
```

**Jadi, suku ke-20 adalah 81.**

---

#### **Contoh 2: Mencari Beda (b)**

**Soal:**  
Suku ke-3 adalah 11 dan suku ke-7 adalah 23.  
Tentukan beda barisan tersebut!

**Penyelesaian:**
```
Diketahui:
U₃ = 11
U₇ = 23

Dari rumus:
U₃ = a + 2b = 11  ...(1)
U₇ = a + 6b = 23  ...(2)

Eliminasi (2) - (1):
(a + 6b) - (a + 2b) = 23 - 11
4b = 12
b = 3
```

**Jadi, bedanya adalah 3.**

---

#### **Contoh 3: Mencari Suku Pertama (a)**

**Soal:**  
Diketahui U₅ = 17 dan beda = 3.  
Tentukan suku pertama!

**Penyelesaian:**
```
Diketahui:
U₅ = 17
b = 3
n = 5

U₅ = a + (5-1) × 3
17 = a + 12
a = 17 - 12
a = 5
```

**Jadi, suku pertamanya adalah 5.**

---

### 🎯 Menentukan Pola dari Barisan yang Diberikan

Kadang soal UTBK nggak ngasih tau langsung "ini barisan aritmatika lho!". Lo harus **detective** sendiri!

**Step-by-step:**

1. **Cek selisih** antar suku berurutan
2. Kalau selisihnya **sama semua** → ARITMATIKA! ✓
3. Catat nilai **a** (suku pertama) dan **b** (beda)
4. Tulis rumus umumnya: Uₙ = a + (n-1)b

**Contoh:**

Dari barisan 7, 11, 15, 19, 23, ...

```
Step 1: Cek selisih
11 - 7 = 4
15 - 11 = 4
19 - 15 = 4
23 - 19 = 4
→ Selisih konsisten = 4 ✓

Step 2: Identifikasi
a = 7
b = 4

Step 3: Rumus umum
Uₙ = 7 + (n-1) × 4
Uₙ = 7 + 4n - 4
Uₙ = 4n + 3
```

Sekarang lo bisa cari suku ke berapapun dengan gampang! Mau U₁₀₀? Tinggal masukin n = 100:

```
U₁₀₀ = 4(100) + 3 = 403
```

Easy peasy! 🍋

---

### 🚨 Tips & Trik UTBK untuk Aritmatika

#### **Tip #1: Shortcut Mencari Suku Tengah**

Kalau lo tau suku pertama (a) dan suku terakhir (Un), suku tengahnya adalah:

```
Utengah = (a + Un) / 2
```

**Contoh:**  
Barisan 3, 7, 11, 15, 19  
Suku tengah = (3 + 19) / 2 = 11 ✓

Ini work karena aritmatika **simetris**!

---

#### **Tip #2: Cara Cepat Cek Aritmatika atau Bukan**

Ambil 3 suku berurutan: x, y, z

Kalau **y - x = z - y**, maka itu aritmatika!

Atau lebih simple: **2y = x + z**

**Contoh:**  
5, 8, 11  
2(8) = 5 + 11  
16 = 16 ✓ → Aritmatika!

---

#### **Tip #3: Beda Negatif = Barisan Turun**

Jangan kaget kalau ketemu beda negatif. Ini cuma berarti barisannya **turun** aja!

**Contoh:**  
50, 42, 34, 26, 18, ...  
b = 42 - 50 = **-8**

Rumus tetep sama:  
Uₙ = 50 + (n-1)(-8)  
Uₙ = 50 - 8n + 8  
Uₙ = 58 - 8n

---

#### **Tip #4: Simplikasi Rumus Umum**

Setelah dapet Uₙ = a + (n-1)b, **selalu sederhanain** jadi bentuk **Uₙ = bn + (a-b)**

Kenapa? Biar lebih gampang ngitung!

**Contoh:**  
Uₙ = 3 + (n-1) × 5  
Uₙ = 3 + 5n - 5  
Uₙ = 5n - 2 ← **Lebih simpel!**

---

### 🎯 Jebakan UTBK pada Pola Aritmatika

#### **Jebakan #1: Barisan Dimulai dari n = 0**

Hati-hati! Kadang soal mulai dari **U₀** bukan U₁.

**Contoh:**  
U₀ = 2, U₁ = 5, U₂ = 8, ...  
Tentukan U₁₀!

**Penyelesaian:**  
Kalau dihitung dari U₀:
- a = 2
- b = 3
- Untuk U₁₀, berarti "suku ke-10" dari U₀
- n = 10 (bukan 11!)

```
U₁₀ = 2 + 10 × 3 = 32
```

**Tapi** kalau soalnya nanya "suku ke-10" tanpa jelaskan U₀, biasanya mulai dari U₁!

---

#### **Jebakan #2: Mencampur Rumus Deret dan Barisan**

Hati-hati ngebaca soal! Kalau ditanya **"suku ke-n"**, pake rumus **barisan**.  
Kalau ditanya **"jumlah n suku pertama"**, itu soal **deret** (nanti di materi 1.1.6).

---

#### **Jebakan #3: Lupa Tanda Kurung**

Kalau b negatif, WAJIB pake kurung!

**SALAH:**  
Uₙ = 10 + (n-1) × -3  
Uₙ = 10 + n - 1 × -3 ← Ini salah karena -1 × -3 = 3!

**BENAR:**  
Uₙ = 10 + (n-1) × (-3)  
Uₙ = 10 - 3n + 3  
Uₙ = 13 - 3n ✓

---

#### **Jebakan #4: Soal Kontekstual yang Nyamar**

UTBK suka banget kasih soal cerita yang **sebenernya aritmatika** tapi disamarkan!

**Contoh:**  
"Pak Budi menabung Rp 50.000 di minggu pertama. Setiap minggu berikutnya, tabungannya bertambah Rp 5.000. Berapa tabungan Pak Budi di minggu ke-20?"

**Penyelesaian:**  
Ini aritmatika!  
a = 50.000  
b = 5.000  
n = 20

```
U₂₀ = 50.000 + (20-1) × 5.000
U₂₀ = 50.000 + 95.000
U₂₀ = 145.000
```

Kuncinya: **Identifikasi** dulu pola dari cerita!

---

### 💡 Variasi Soal Aritmatika di UTBK

#### **Variasi #1: Mencari Posisi Suku (n)**

**Soal:**  
Barisan 3, 7, 11, 15, ...  
Bilangan 127 adalah suku ke berapa?

**Penyelesaian:**
```
a = 3, b = 4
Uₙ = 127

127 = 3 + (n-1) × 4
127 = 3 + 4n - 4
127 = 4n - 1
128 = 4n
n = 32
```

**Jadi, 127 adalah suku ke-32.**

---

#### **Variasi #2: Sisipan (Insertion)**

**Soal:**  
Disisipkan 4 bilangan di antara 3 dan 23 sehingga membentuk barisan aritmatika. Tentukan beda barisan baru!

**Penyelesaian:**  
Awalnya: 3, ..., ..., ..., ..., 23 (ada 6 suku total)

```
a = 3
U₆ = 23
n = 6

23 = 3 + (6-1) × b
23 = 3 + 5b
20 = 5b
b = 4
```

Barisan lengkapnya: 3, 7, 11, 15, 19, 23

**Bedanya adalah 4.**

---

#### **Variasi #3: Suku Ganjil dan Genap**

**Soal:**  
Jumlah suku ke-3 dan ke-7 adalah 40.  
Jumlah suku ke-2 dan ke-5 adalah 26.  
Tentukan suku pertama!

**Penyelesaian:**
```
U₃ + U₇ = 40
(a+2b) + (a+6b) = 40
2a + 8b = 40
a + 4b = 20  ...(1)

U₂ + U₅ = 26
(a+b) + (a+4b) = 26
2a + 5b = 26  ...(2)

Dari (1): a = 20 - 4b
Substitusi ke (2):
2(20-4b) + 5b = 26
40 - 8b + 5b = 26
-3b = -14
b = 14/3

a = 20 - 4(14/3)
a = 20 - 56/3
a = 4/3
```

---

### 🌟 Kesimpulan Materi 1.1.2

Pola Aritmatika adalah barisan dengan **beda tetap**. Konsep kunci:

✅ **Rumus Suku ke-n**: Uₙ = a + (n-1)b  
✅ **Beda (b)** bisa positif, negatif, atau nol  
✅ **Ciri khas**: Selisih antar suku **selalu sama**
✅ **Simplikasi**: Uₙ = bn + (a-b) lebih praktis  
✅ **Hati-hati** tanda kurung kalau b negatif!  

Selanjutnya kita bakal bahas **Pola Geometri** yang lebih "naik-turunnya" ekstrem! 🎢

---
