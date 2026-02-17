# SECTION 1: Aljabar - Topic 1.3: Aljabar


## Materi 1.3.4: Penalaran Pertidaksamaan

### Pertidaksamaan: When "Equal" Isn't the Whole Story 📊

Kalau persamaan itu tentang "this = that", pertidaksamaan adalah tentang "this is MORE/LESS than that". Dan trust me, di dunia nyata, pertidaksamaan jauh lebih common dari persamaan!

Pikirkan:
- "Budget saya maksimal Rp500.000" → x ≤ 500,000
- "Minimal 10 orang untuk diskon" → n ≥ 10
- "Suhu harus antara 20-30°C" → 20 ≤ T ≤ 30

Di SNBT, pertidaksamaan sering dikombinasikan dengan konteks real-life, dan mereka nguji kemampuan kamu untuk:
1. **Memahami** arti pertidaksamaan dalam konteks
2. **Menyelesaikan** dengan teknik yang benar
3. **Menginterpret** solusi dalam konteks masalah

### Simbol Pertidaksamaan dan Maknanya

| Simbol | Dibaca | Arti | Contoh |
|--------|--------|------|---------|
| > | Lebih besar dari | Tidak termasuk nilai itu sendiri | x > 5 (x bisa 5.1, 6, 100, tapi BUKAN 5) |
| < | Lebih kecil dari | Tidak termasuk nilai itu sendiri | x < 3 (x bisa 2.9, 2, -10, tapi BUKAN 3) |
| ≥ | Lebih besar atau sama dengan | TERMASUK nilai itu sendiri | x ≥ 5 (x bisa 5, 5.1, 6, 100) |
| ≤ | Lebih kecil atau sama dengan | TERMASUK nilai itu sendiri | x ≤ 3 (x bisa 3, 2.9, 2, -10) |

**🎯 PENTING:** Perbedaan antara > dan ≥ (atau < dan ≤) adalah apakah nilai batasnya termasuk atau tidak.

Di garis bilangan:
- **Bulatan kosong (○)** untuk > atau < (nilai batas TIDAK termasuk)
- **Bulatan penuh (●)** untuk ≥ atau ≤ (nilai batas TERMASUK)

### Membaca Pertidaksamaan dalam Konteks

**Contoh Bacaan 1:**

> "Untuk naik wahana roller coaster, tinggi minimal 120 cm."

**Translation:** h ≥ 120

**Arti:** Orang dengan tinggi 120 cm BISA naik (karena "minimal" = termasuk batasnya).

**Contoh Bacaan 2:**

> "Diskon berlaku untuk pembelian di atas Rp100.000."

**Translation:** x > 100,000

**Arti:** Pembelian tepat Rp100.000 TIDAK dapat diskon (karena "di atas" = tidak termasuk batasnya).

**🚨 JEBAKAN BAHASA:**
- "Minimal/setidaknya/tidak kurang dari" → ≥
- "Maksimal/paling banyak/tidak lebih dari" → ≤
- "Lebih dari/di atas" → >
- "Kurang dari/di bawah" → 
- "Antara A dan B" → Bisa A ≤ x ≤ B atau A < x < B (tergantung konteks!)

### Sifat-Sifat Pertidaksamaan: Rules of the Game

Pertidaksamaan punya aturan mirip persamaan, tapi ada **SATU PERBEDAAN KRUSIAL**:

#### **Aturan 1: Tambah/Kurang Boleh Bebas**

Kalau a > b, maka:
- a + c > b + c (untuk sembarang c)
- a - c > b - c (untuk sembarang c)

**Contoh:**
```
x + 3 > 7
x + 3 - 3 > 7 - 3
x > 4
```

Aturan ini sama dengan persamaan. Easy!

#### **Aturan 2: Kali/Bagi dengan Positif → Arah Tetap**

Kalau a > b dan c > 0, maka:
- ac > bc
- a/c > b/c

**Contoh:**
```
2x > 8
2x/2 > 8/2  ← bagi dengan 2 (positif)
x > 4       ← arah tetap
```

Still straightforward!

#### **Aturan 3: Kali/Bagi dengan Negatif → BALIK ARAH! ⚠️**

Kalau a > b dan c < 0, maka:
- ac < bc  ← TANDA BERUBAH!
- a/c < b/c  ← TANDA BERUBAH!

**Contoh:**
```
-3x > 12
-3x/-3 < 12/-3  ← bagi dengan -3 (negatif), BALIK TANDA!
x < -4
```

**🚨 INI ADALAH KESALAHAN #1 DI SNBT!**

Banyak siswa lupa balik tanda, atau balik tanda padahal seharusnya nggak (kalau kalinya/baginya positif).

**Mengapa ini terjadi?**

Pikirkan: 5 > 3 (benar)
Kalikan dengan -1: -5 vs -3
-5 > -3? SALAH! Seharusnya -5 < -3

Angka negatif yang lebih besar nilainya (dalam negatif) justru lebih KECIL di garis bilangan!

#### **Aturan 4: Hati-Hati dengan Kuadrat**

```
Jika a > b, BELUM TENTU a² > b²!
```

**Contoh:**
- Ambil a = 1, b = -2
- a > b (1 > -2) ✓
- Tapi a² vs b²: 1 vs 4 → 1 < 4!

**TAPI**, kalau a dan b SAMA-SAMA POSITIF, baru a > b → a² > b²

**🎯 TIPS:** Hati-hati kuadratkan pertidaksamaan kecuali kamu tahu tanda variabelnya!

### Menyelesaikan Pertidaksamaan Linear

Prosesnya mirip persamaan: isolasi variabel. Tapi ingat aturan tanda!

**Contoh 1 (Standar):**

```
3x - 7 < 11
3x < 11 + 7
3x < 18
x < 6
```

Solusi: x bisa sembarang nilai kurang dari 6.
Dalam notasi interval: (-∞, 6)

**Contoh 2 (Ada Negatif):**

```
5 - 2x ≥ 9
-2x ≥ 9 - 5
-2x ≥ 4
x ≤ -2  ← TANDA BALIK karena bagi dengan -2!
```

Solusi: (-∞, -2]

Perhatikan kurung siku [  ] untuk ≤/≥ dan kurung biasa (  ) untuk </>.

**Contoh 3 (Bentuk Kompleks):**

```
2(x + 3) - 5 < 3(x - 1) + 4
```

**Expand dulu:**
```
2x + 6 - 5 < 3x - 3 + 4
2x + 1 < 3x + 1
```

**Isolasi variabel:**
```
2x - 3x < 1 - 1
-x < 0
x > 0  ← TANDA BALIK!
```

Solusi: (0, ∞)

### Pertidaksamaan Ganda: Interval Values

Kadang ada dua batasan sekaligus:

**Contoh:**

```
-3 < 2x + 1 ≤ 7
```

**Strategi:** Solve each part simultaneously:

```
-3 < 2x + 1  DAN  2x + 1 ≤ 7
```

**Bagian 1:**
```
-3 < 2x + 1
-3 - 1 < 2x
-4 < 2x
-2 < x  atau x > -2
```

**Bagian 2:**
```
2x + 1 ≤ 7
2x ≤ 6
x ≤ 3
```

**Gabungan:** -2 < x ≤ 3

Notasi interval: (-2, 3]

**💡 ALTERNATIVE METHOD:** Treat semuanya sebagai "chain":

```
-3 < 2x + 1 ≤ 7
-3 - 1 < 2x ≤ 7 - 1
-4 < 2x ≤ 6
-2 < x ≤ 3
```

Lebih cepat kan?

### Pertidaksamaan Kuadrat: Parabola Territory

Format: ax² + bx + c > 0 (atau <, ≥, ≤)

**Strategy Umum:**
1. Ubah jadi bentuk = 0
2. Faktorkan atau cari akar (pembuat nol)
3. Uji interval antara akar-akar

**Contoh:**

Tentukan x yang memenuhi: x² - 5x + 6 < 0

**Step 1:** Cari pembuat nol:
```
x² - 5x + 6 = 0
(x - 2)(x - 3) = 0
x = 2 atau x = 3
```

**Step 2:** Buat garis bilangan dengan titik 2 dan 3

```
─────●─────●─────
     2     3
```

Ini membagi garis jadi 3 interval:
- x < 2
- 2 < x < 3
- x > 3

**Step 3:** Uji setiap interval (ambil sampel nilai):

**Interval 1:** x < 2 (misal x = 0)
```
(0)² - 5(0) + 6 = 6 > 0  ← POSITIF
```

**Interval 2:** 2 < x < 3 (misal x = 2.5)
```
(2.5)² - 5(2.5) + 6 = 6.25 - 12.5 + 6 = -0.25 < 0  ← NEGATIF ✓
```

**Interval 3:** x > 3 (misal x = 4)
```
(4)² - 5(4) + 6 = 16 - 20 + 6 = 2 > 0  ← POSITIF
```

Karena kita cari yang < 0 (negatif), jawabannya: **2 < x < 3**

**🎯 SHORTCUT:** Untuk parabola terbuka ke atas (a > 0):
- Di ANTARA akar → negatif
- Di LUAR akar → positif

Untuk parabola terbuka ke bawah (a < 0):
- Di ANTARA akar → positif
- Di LUAR akar → negatif

### Pertidaksamaan Rasional: Fraction Territory

Format: (ax + b)/(cx + d) > 0 (atau <, ≥, ≤)

**Key Insight:** Pecahan positif kalau pembilang dan penyebut SAMA-SAMA positif atau SAMA-SAMA negatif!

**Contoh:**

Tentukan x yang memenuhi: (x + 1)/(x - 3) > 0

**Step 1:** Cari pembuat nol (pembilang) dan pembuat tak terdefinisi (penyebut):
- Pembilang = 0: x + 1 = 0 → x = -1
- Penyebut = 0: x - 3 = 0 → x = 3 ← DOMAIN RESTRICTION!

**Step 2:** Buat garis bilangan:

```
─────●─────○─────
    -1     3
```

(Bulatan kosong di 3 karena x ≠ 3)

**Step 3:** Uji interval:

**x < -1** (misal x = -2):
```
(-2 + 1)/(-2 - 3) = (-1)/(-5) = 1/5 > 0 ✓
```

**-1 < x < 3** (misal x = 0):
```
(0 + 1)/(0 - 3) = 1/(-3) = -1/3 < 0
```

**x > 3** (misal x = 4):
```
(4 + 1)/(4 - 3) = 5/1 = 5 > 0 ✓
```

Solusi: x < -1 atau x > 3

**Notasi interval:** (-∞, -1] ∪ (3, ∞)

**🚨 PERHATIAN:** 
- Untuk > atau <, pembuat nol pembilang BISA termasuk (tergantung tanda)
- Tapi pembuat nol penyebut TIDAK PERNAH termasuk (karena undefined!)

### Pertidaksamaan dengan Nilai Mutlak

|x| < a berarti: -a < x < a
|x| > a berarti: x < -a atau x > a

**Contoh 1:**

|x - 3| < 5

**Strategi:** Ubah jadi pertidaksamaan ganda:
```
-5 < x - 3 < 5
-5 + 3 < x < 5 + 3
-2 < x < 8
```

**Contoh 2:**

|2x + 1| ≥ 7

**Strategi:** Split jadi dua kasus:
```
2x + 1 ≥ 7  ATAU  2x + 1 ≤ -7
```

**Kasus 1:**
```
2x ≥ 6
x ≥ 3
```

**Kasus 2:**
```
2x ≤ -8
x ≤ -4
```

Solusi: x ≤ -4 atau x ≥ 3

**Notasi:** (-∞, -4] ∪ [3, ∞)

### Aplikasi: Optimasi dengan Constraint

Di SNBT, pertidaksamaan sering muncul dalam konteks optimasi dengan batasan.

**Contoh Bacaan:**

> "Seorang pedagang ingin membeli apel (A) dan jeruk (J). Harga apel Rp5.000/kg dan jeruk Rp3.000/kg. Modal maksimal Rp60.000. Ia ingin membeli minimal total 10 kg buah."

**Setup Pertidaksamaan:**
- Budget constraint: 5A + 3J ≤ 60
- Minimal total: A + J ≥ 10
- Realistic constraints: A ≥ 0, J ≥ 0

**Pertanyaan tipikal:** "Berapa maksimal kg apel yang bisa dibeli jika ingin beli minimal 5 kg jeruk?"

**Solve:**
Jika J ≥ 5, maka dari A + J ≥ 10:
```
A ≥ 10 - J ≥ 10 - 5 = 5
```

Dari budget:
```
5A + 3J ≤ 60
5A ≤ 60 - 3J
```

Jika J = 5 (minimal):
```
5A ≤ 60 - 15 = 45
A ≤ 9
```

Jadi dengan J = 5, maksimal A = 9 kg.

### Grafik Pertidaksamaan: Visual Thinking

Kalau ada sistem pertidaksamaan 2 variabel, sometimes grafik adalah cara tercepat.

**Contoh:**

```
x + y ≤ 10
x - y ≥ 2
x ≥ 0, y ≥ 0
```

**Visualisasi:**
1. Gambar garis x + y = 10 (batas atas)
2. Gambar garis x - y = 2 (batas bawah)
3. Shade area yang memenuhi semua kondisi

Titik pojok region ini (feasible region) adalah kandidat untuk nilai optimal dalam linear programming.

**🎯 Di SNBT:** Kamu nggak akan disuruh gambar, tapi kemampuan visualisasi ini helps you eliminate wrong answer choices cepat!

### Interpreting Solutions: Konteks adalah Raja

Setelah solve, SELALU interpret jawaban dalam konteks soal.

**Contoh:**

Soal: "Berapa banyak tiket yang harus dijual agar untung?"

Jawaban matematis: n > 47.3

**Interpretasi:** Karena tiket adalah bilangan bulat, maka minimal 48 tiket.

**🚨 JEBAKAN:** Jangan langsung tulis 47.3 sebagai jawaban final kalau konteksnya discrete (bilangan bulat)!

### Rangkuman Power Points

✓ < dan > → nilai batas TIDAK termasuk (bulatan kosong)
✓ ≤ dan ≥ → nilai batas TERMASUK (bulatan penuh)
✓ Kali/bagi dengan negatif → BALIK TANDA!
✓ Pertidaksamaan kuadrat: uji interval antara akar
✓ Pertidaksamaan rasional: watch out for domain restrictions!
✓ |x| < a → -a < x < a
✓ |x| > a → x < -a atau x > a
✓ Selalu interpret solusi dalam konteks (bulat vs real, make sense vs tidak)
✓ Kombinasikan pertidaksamaan dengan AND (irisan) atau OR (gabungan) sesuai konteks

---
