# SECTION 1: Aljabar - Topic 1.3: Aljabar


## Materi 1.3.5: Sistem Persamaan dalam Konteks

### Sistem Persamaan: When One Equation Isn't Enough 🔗

Kamu pernah nggak ngerasa: "Wah, satu persamaan kayaknya nggak cukup buat solve masalah ini"? Well, that's exactly when **sistem persamaan** masuk!

Sistem persamaan adalah kumpulan dua atau lebih persamaan yang harus dipenuhi **secara bersamaan**. Di SNBT, ini adalah salah satu tipe soal paling favorit karena:
1. Realistic (banyak situasi real-life butuh multiple constraints)
2. Test multiple skills sekaligus (setup, solve, interpret)
3. Ada banyak cara solve (jadi bisa bedain siswa yang flexible vs kaku)

### Mengidentifikasi Situasi SPLDV (Sistem Persamaan Linear Dua Variabel)

**Red flags yang menunjukkan ini SPLDV:**

🚩 Ada **dua hal/objek** yang unknown  
🚩 Ada **dua kondisi/informasi** berbeda yang diberikan  
🚩 Kata kunci: "situasi pertama... situasi kedua...", "hari ini... kemarin...", "orang A... orang B..."

**Contoh Bacaan:**

> "Di toko Bu Ani, pada hari Senin terjual 5 kg beras dan 3 kg gula seharga Rp95.000. Pada hari Selasa terjual 3 kg beras dan 4 kg gula seharga Rp83.000."

**Identifikasi:**
- ✓ Dua produk: beras dan gula (2 variabel)
- ✓ Dua hari dengan transaksi berbeda (2 persamaan)
- ✓ Harga per unit tidak disebutkan (perlu dicari)

**Conclusion:** Ini jelas SPLDV!

### Menyusun Sistem dari Soal Cerita: The Framework

#### **STEP 1: DEFINE Variables Clearly**

Jangan asal tentukan! Definisi harus:
- **Specific**: Jelas satuannya
- **Consistent**: Sama di semua persamaan
- **Relevant**: Langsung jawab pertanyaan

**Contoh BAIK:**
```
Misal:
b = harga 1 kg beras (dalam ribuan rupiah)
g = harga 1 kg gula (dalam ribuan rupiah)
```

**Contoh KURANG BAIK:**
```
x = beras
y = gula
```
(Kurang jelas: beras-nya apa? Harga? Jumlah?)

#### **STEP 2: TRANSLATE Each Situation**

**Situasi 1:** "5 kg beras dan 3 kg gula seharga Rp95.000"
→ 5b + 3g = 95

**Situasi 2:** "3 kg beras dan 4 kg gula seharga Rp83.000"
→ 3b + 4g = 83

#### **STEP 3: VERIFY System**

Cek:
- ✓ Jumlah variabel = jumlah persamaan? (2 = 2 ✓)
- ✓ Persamaan independen? (Bukan kelipatan satu sama lain ✓)
- ✓ Satuan konsisten? (Sama-sama ribuan ✓)

Good to go!

### Metode Penyelesaian: Pilih yang Paling Efisien

#### **Metode 1: ELIMINASI (Best for: Koefisien mudah disamakan)**

**Sistem:**
```
5b + 3g = 95  ... (1)
3b + 4g = 83  ... (2)
```

**Eliminasi b:**

Kalikan (1) dengan 3, (2) dengan 5:
```
  15b + 9g = 285
  15b + 20g = 415
  ─────────────────  (kurangkan)
      -11g = -130
         g = 130/11 ≈ 11.82 (Hmm, pecahan. Let's check...)
```

Kok pecahan aneh? Biasanya di soal SNBT angkanya "cantik". Coba eliminasi g dulu:

**Eliminasi g:**

Kalikan (1) dengan 4, (2) dengan 3:
```
  20b + 12g = 380
   9b + 12g = 249
  ─────────────────  (kurangkan)
      11b = 131
        b = 131/11 ≈ 11.91 (Masih pecahan...)
```

**🤔 ADA YANG SALAH?**

Actually, nggak salah! Tapi ini contoh **why method matters**. Kalau angkanya nggak "cantik", mungkin:
1. Soalnya memang begitu (rare di SNBT), ATAU
2. Ada cara lebih smart

Mari coba **substitusi**.

#### **Metode 2: SUBSTITUSI (Best for: Salah satu persamaan mudah di-express)**

Dari persamaan (2): 
```
3b + 4g = 83
4g = 83 - 3b
g = (83 - 3b)/4
```

Substitusi ke (1):
```
5b + 3[(83 - 3b)/4] = 95
```

Kalikan semua dengan 4:
```
20b + 3(83 - 3b) = 380
20b + 249 - 9b = 380
11b = 131
b = 11.909...
```

Yep, tetap pecahan.

**CONCLUSION:** Soal ini memang punya jawaban pecahan. Di SNBT real, biasanya angkanya lebih "cantik", tapi bukan berarti pecahan = salah!

**💡 LESSON:** Kadang nature of the problem menentukan jawabannya. Don't force "cantik" kalau memang nggak.

#### **Metode 3: DETERMINAN (Cramer's Rule) - Advanced!**

Untuk sistem:
```
ax + by = e
cx + dy = f
```

Solusi:
```
x = (ed - bf)/(ad - bc)
y = (af - ec)/(ad - bc)
```

Dimana (ad - bc) adalah determinan sistem.

**Kapan pakai:** Kalau kamu comfortable dengan formula dan mau cepat (tapi harus hafal!)

**Contoh aplikasi:**
```
5b + 3g = 95
3b + 4g = 83
```

Determinan = 5(4) - 3(3) = 20 - 9 = 11

```
b = [95(4) - 83(3)]/11 = [380 - 249]/11 = 131/11
g = [5(83) - 3(95)]/11 = [415 - 285]/11 = 130/11
```

Same answer, tapi in one shot!

### Tipe Soal Klasik SPLDV di SNBT

#### **Tipe A: Harga Produk (Market Problem)**

**Template:**
- "m unit A dan n unit B harga total P"
- "p unit A dan q unit B harga total Q"
- Find: Harga per unit A dan/atau B

**Strategi:** Standard SPLDV, pilih metode paling efisien.

#### **Tipe B: Campuran/Mixture**

**Contoh Bacaan:**

> "Larutan A konsentrasi garam 10%, larutan B konsentrasi 25%. Berapa liter masing-masing harus dicampur untuk dapat 20 liter larutan 15%?"

**Setup:**
- Misal A = liter larutan A, B = liter larutan B

**Persamaan 1 (Total volume):**
```
A + B = 20
```

**Persamaan 2 (Total garam):**
```
0.10A + 0.25B = 0.15(20)
0.10A + 0.25B = 3
```

**Solve:**

Dari persamaan 1: A = 20 - B

Substitusi ke persamaan 2:
```
0.10(20 - B) + 0.25B = 3
2 - 0.10B + 0.25B = 3
0.15B = 1
B = 1/0.15 = 6.67 liter
A = 20 - 6.67 = 13.33 liter
```

**🎯 TIPS:** Untuk soal campuran, persamaan pertama biasanya total volume/massa, persamaan kedua total kandungan zat tertentu.

#### **Tipe C: Digit Numbers**

**Contoh Bacaan:**

> "Suatu bilangan dua digit. Jumlah digit-digitnya 11. Jika digit-digitnya dibalik, bilangan baru 27 lebih besar dari bilangan semula."

**Setup:**
- Misal puluhan = a, satuan = b
- Bilangan awal = 10a + b
- Bilangan terbalik = 10b + a

**Persamaan 1:**
```
a + b = 11
```

**Persamaan 2:**
```
(10b + a) - (10a + b) = 27
10b + a - 10a - b = 27
9b - 9a = 27
b - a = 3
```

**Solve sistem:**
```
a + b = 11
b - a = 3
────────── (jumlahkan)
2b = 14
b = 7
```

Maka a = 11 - 7 = 4

Bilangan awal: 47
Bilangan terbalik: 74 (cek: 74 - 47 = 27 ✓)

#### **Tipe D: Rate/Work Problems**

**Contoh Bacaan:**

> "Dua pipa mengisi kolam. Pipa A sendiri butuh 6 jam, pipa B sendiri butuh 8 jam. Jika dibuka bersama 2 jam, lalu A ditutup dan hanya B yang melanjutkan, berapa lama lagi sampai penuh?"

**Setup:**

Rate pipa A = 1/6 kolam per jam
Rate pipa B = 1/8 kolam per jam

**2 jam bersama:**
```
Terisi = 2(1/6 + 1/8) = 2(4/24 + 3/24) = 2(7/24) = 7/12 kolam
```

**Sisa:**
```
1 - 7/12 = 5/12 kolam
```

**Waktu B melanjutkan:**
```
Waktu = (5/12)/(1/8) = (5/12) × 8 = 40/12 = 10/3 = 3.33 jam = 3 jam 20 menit
```

**💡 KEY CONCEPT:** Dalam work problems, rate dijumlahkan, bukan waktunya!

#### **Tipe E: Distance-Speed-Time in System**

**Contoh Bacaan:**

> "Mobil A dan B berangkat bersamaan dari dua kota berjarak 300 km, saling mendekat. Mereka bertemu setelah 2 jam. Jika kecepatan A 10 km/jam lebih cepat dari B, berapa kecepatan masing-masing?"

**Setup:**
- Misal kecepatan B = v km/jam
- Kecepatan A = (v + 10) km/jam

**Pertemuan berarti total jarak = 300:**
```
Jarak A + Jarak B = 300
2(v + 10) + 2v = 300
2v + 20 + 2v = 300
4v = 280
v = 70 km/jam (B)
```

Maka kecepatan A = 80 km/jam

### Sistem dengan 3 Variabel (SPLTV)

Jarang sih di SNBT, tapi kadang muncul.

**Contoh:**

```
x + y + z = 6    ... (1)
2x - y + 3z = 14  ... (2)
3x + 2y - z = 2   ... (3)
```

**Strategi:** Eliminasi bertahap sampai jadi SPLDV, terus solve.

**Eliminasi z dari (1) dan (3):**

Kalikan (1) dengan 1: x + y + z = 6
```
  3x + 2y - z = 2
  ────────────────── (jumlahkan)
  4x + 3y = 8  ... (4)
```

**Eliminasi z dari (2) dan (3):**

Kalikan (2) dengan 1, (3) dengan 3:
```
  2x - y + 3z = 14
  9x + 6y - 3z = 6
  ────────────────── (jumlahkan)
  11x + 5y = 20  ... (5)
```

**Sekarang solve SPLDV (4) dan (5):**

```
4x + 3y = 8
11x + 5y = 20
```

Eliminasi y (kalikan (4) dengan 5, (5) dengan 3):
```
  20x + 15y = 40
  33x + 15y = 60
  ────────────────── (kurangkan)
 -13x = -20
    x = 20/13  ← Hmm, ini example soal yang purposely buat pecahan.
```

You get the idea. Process-nya sama, cuma lebih panjang.

### Interpretation: Dari Angka ke Makna

Setelah dapat solusi numerical, kamu harus bisa interpret dalam konteks.

**Contoh:**

Solusi: b = 12, g = 11 (dalam ribuan rupiah)

**Interpretation:** "Harga 1 kg beras adalah Rp12.000 dan harga 1 kg gula adalah Rp11.000."

**🚨 JANGAN LUPA SATUAN!**

Kalau kamu define dalam ribuan, jangan lupa convert balik ke rupiah kalau pertanyaannya minta dalam rupiah!

### Special Cases: Ketika Sistem "Aneh"

#### **Case 1: No Solution (Inconsistent)**

**Contoh:**
```
x + y = 5
2x + 2y = 12
```

Kalikan persamaan pertama dengan 2:
```
2x + 2y = 10
2x + 2y = 12
```

Contradiction! Garis paralel, tidak berpotongan.

**Arti:** Tidak ada pasangan (x, y) yang memenuhi kedua persamaan. Sistem inkonsisten.

#### **Case 2: Infinite Solutions (Dependent)**

**Contoh:**
```
x + y = 5
2x + 2y = 10
```

Persamaan kedua = 2 × persamaan pertama. Ini sebenarnya satu persamaan yang sama!

**Arti:** Ada tak hingga banyak solusi. Semua titik di garis x + y = 5 adalah solusi.

#### **Case 3: Unique Solution (Most Common)**

Sistem punya tepat satu solusi. Ini yang paling sering di SNBT.

### Choosing the Right Method: Decision Tree

```
START: Lihat sistem
    ↓
Apakah salah satu persamaan sudah "expressed"? (misal y = ...)
    ├─ YES → SUBSTITUSI
    └─ NO → Lanjut
             ↓
         Apakah koefisien salah satu variabel mudah disamakan?
             ├─ YES → ELIMINASI
             └─ NO → Lanjut
                      ↓
                  Comfortable dengan Cramer's Rule?
                      ├─ YES → DETERMINAN
                      └─ NO → ELIMINASI (fallback)
```

### Rangkuman Power Points

✓ SPLDV muncul saat ada 2 unknown, 2 kondisi berbeda
✓ DEFINE variabel dengan specific dan consistent
✓ Pilih metode: substitusi (jika ada yang simple), eliminasi (jika koefisien mudah), atau determinan (jika hafal dan suka formula)
✓ Untuk mixture problems: persamaan 1 = total volume, persamaan 2 = total kandungan
✓ Untuk work problems: rate dijumlahkan
✓ Selalu interpret solusi dalam konteks dengan satuan yang benar
✓ Check for special cases: no solution, infinite solutions
✓ Verify jawaban dengan substitusi balik

---

**🎊 CONGRATULATIONS!**

Kamu baru saja menyelesaikan **Section 1, Topic 1.3: Aljabar** yang mencakup:
- ✓ Pengenalan Penalaran Aljabar
- ✓ Menyusun Persamaan dari Masalah
- ✓ Strategi Penyelesaian Persamaan
- ✓ Penalaran Pertidaksamaan
- ✓ Sistem Persamaan dalam Konteks

Ini adalah foundation yang SUPER PENTING untuk PM SNBT. Master materi ini, dan kamu akan jauh lebih confident menghadapi soal-soal aljabar!

**Next up:** Materi 1.3.6 (Penalaran Fungsi) dan 1.3.7 (Penalaran Eksponen dan Logaritma) - but that's for another session! 

Keep practicing, stay curious, dan ingat: **Aljabar bukan musuh, tapi alat powerful untuk solve masalah! 🚀**
