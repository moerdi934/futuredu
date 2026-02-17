# SECTION 1: Aljabar dan Persamaan
## Topic 1.2: Persamaan Linear

---


## **Materi 1.2.2: Pertidaksamaan Linear Satu Variabel**

### 🎯 **Apa Itu Pertidaksamaan?**

Kalau persamaan itu kayak "tepat segini", **pertidaksamaan** itu kayak "minimal segini" atau "maksimal segini". Contohnya:

- Kamu butuh **minimal Rp50.000** buat nonton → uangmu ≥ 50.000
- Kapasitas lift **maksimal 8 orang** → jumlah orang ≤ 8
- Suhu AC **di bawah 25°C** → suhu < 25

Jadi, pertidaksamaan linear satu variabel (PtLSV) adalah **kalimat matematika** yang menyatakan hubungan "tidak sama" antara dua ekspresi aljabar dengan menggunakan tanda **<, >, ≤, atau ≥**.

---

### 🔤 **Notasi dan Artinya**

| **Simbol** | **Dibaca** | **Arti** | **Contoh** |
|------------|------------|----------|------------|
| < | Kurang dari | Nilai di sebelah kiri lebih kecil | x < 5 (x kurang dari 5) |
| > | Lebih dari | Nilai di sebelah kiri lebih besar | x > 3 (x lebih dari 3) |
| ≤ | Kurang dari atau sama dengan | Nilai di sebelah kiri tidak lebih besar | x ≤ 10 (x maksimal 10) |
| ≥ | Lebih dari atau sama dengan | Nilai di sebelah kiri tidak lebih kecil | x ≥ 7 (x minimal 7) |

**Catatan Penting:**
- **<** dan **>** → **tidak termasuk** nilai batasnya (open interval)
- **≤** dan **≥** → **termasuk** nilai batasnya (closed interval)

---

### ⚖️ **Sifat-sifat Pertidaksamaan**

Hampir mirip dengan persamaan, tapi ada **1 SIFAT SPECIAL** yang sering jadi jebakan SNBT!

**Sifat 1: Menambah/Mengurangi Bilangan yang Sama**

Jika a < b, maka:
- a + c < b + c
- a - c < b - c

**Contoh:**
- x - 3 < 5
- x - 3 + 3 < 5 + 3
- x < 8 ✅

---

**Sifat 2: Mengalikan/Membagi dengan Bilangan Positif**

Jika a < b dan c > 0, maka:
- a × c < b × c
- a ÷ c < b ÷ c

**Contoh:**
- x/2 > 4
- 2 × (x/2) > 2 × 4
- x > 8 ✅

---

**Sifat 3: Mengalikan/Membagi dengan Bilangan Negatif** 🚨

**INI DIA JEBAKAN TERBESAR SNBT!**

Jika a < b dan c < 0 (negatif), maka:
- a × c **>** b × c ← **TANDA BALIK!**
- a ÷ c **>** b ÷ c ← **TANDA BALIK!**

**Contoh:**
- -2x < 6
- -2x ÷ (-2) **>** 6 ÷ (-2) ← **TANDA < JADI >**
- x > -3 ✅

**INGAT MANTRA INI:**
🎵 *"Kali bagi negatif, tanda harus dibalik!"* 🎵

---

### 📝 **Menyelesaikan Pertidaksamaan Linear Satu Variabel**

Caranya hampir sama dengan PLSV, tapi **HATI-HATI** dengan bilangan negatif!

**Level 1: Bentuk Sederhana**

**Contoh: x + 4 < 9**

Penyelesaian:
- x + 4 < 9
- x + 4 - 4 < 9 - 4
- **x < 5** ✅

Artinya: semua bilangan yang **kurang dari 5** (4, 3, 2, 1, 0, -1, -2, ...)

---

**Level 2: Ada Koefisien Positif**

**Contoh: 3x - 7 ≥ 11**

Penyelesaian:
- 3x - 7 ≥ 11
- 3x ≥ 11 + 7
- 3x ≥ 18
- x ≥ 18/3
- **x ≥ 6** ✅

Artinya: x **minimal 6** (6, 7, 8, 9, ...)

---

**Level 3: Ada Koefisien Negatif** 🚨

**Contoh: -2x + 5 < 13**

Penyelesaian:
- -2x + 5 < 13
- -2x < 13 - 5
- -2x < 8
- x **>** 8/(-2) ← **TANDA BALIK!**
- **x > -4** ✅

---

**Level 4: Variabel di Dua Ruas**

**Contoh: 5x - 3 ≤ 2x + 9**

Penyelesaian:
- 5x - 3 ≤ 2x + 9
- 5x - 2x ≤ 9 + 3
- 3x ≤ 12
- **x ≤ 4** ✅

---

**Level 5: Bentuk Pecahan**

**Contoh: (x - 2)/3 > 4**

Penyelesaian:
- (x - 2)/3 > 4
- 3 × (x - 2)/3 > 3 × 4
- x - 2 > 12
- **x > 14** ✅

---

**Level 6: Pecahan dengan Koefisien Negatif** 🚨

**Contoh: -x/4 ≤ 2**

Penyelesaian:
- -x/4 ≤ 2
- -x ≤ 2 × 4
- -x ≤ 8
- x **≥** -8 ← **TANDA BALIK!** (bagi -1)

---

### 📏 **Representasi Himpunan Penyelesaian pada Garis Bilangan**

Ini adalah **MUST-KNOW** untuk SNBT! Soal sering minta kamu "gambar" atau "tentukan interval" penyelesaian.

**Aturan Menggambar:**

1. **Bulatan KOSONG (○)** untuk **<** dan **>** (tidak termasuk nilai batas)
2. **Bulatan PENUH (●)** untuk **≤** dan **≥** (termasuk nilai batas)
3. **Arsir ke KANAN** untuk **>** dan **≥**
4. **Arsir ke KIRI** untuk **<** dan **≤**

---

**Contoh 1: x < 3**

```
←●================○
           -1  0  1  2  3  4  5
```

Penjelasan:
- Bulatan **kosong** di 3 (karena < bukan ≤)
- Arsir ke **kiri** (semua nilai kurang dari 3)

---

**Contoh 2: x ≥ -2**

```
        ●===============→
  -4  -3  -2  -1  0  1  2  3
```

Penjelasan:
- Bulatan **penuh** di -2 (karena ≥)
- Arsir ke **kanan** (semua nilai dari -2 ke atas)

---

**Contoh 3: -1 < x ≤ 4**

```
        ○=============●
  -2  -1  0  1  2  3  4  5
```

Penjelasan:
- Bulatan **kosong** di -1 (karena <)
- Bulatan **penuh** di 4 (karena ≤)
- Arsir **di antara** -1 dan 4

---

**Notasi Interval:**

| **Pertidaksamaan** | **Notasi Interval** | **Notasi Himpunan** |
|--------------------|---------------------|---------------------|
| x < 3 | (-∞, 3) | {x \| x < 3} |
| x ≥ -2 | [-2, ∞) | {x \| x ≥ -2} |
| -1 < x ≤ 4 | (-1, 4] | {x \| -1 < x ≤ 4} |

**Catatan:**
- **Kurung biasa ( )** → tidak termasuk
- **Kurung siku [ ]** → termasuk
- **∞** selalu pakai kurung biasa

---

### 🎯 **Tips & Trik SNBT**

**Tip #1: Checklist Bilangan Negatif**

Sebelum selesai, SELALU tanya diri sendiri:
- ✅ Apakah aku mengalikan/membagi dengan bilangan **negatif**?
- ✅ Kalau iya, apakah tanda **sudah dibalik**?

**Cara Cepat:** Kalau ada koefisien negatif di depan variabel, **tanda PASTI balik**!

---

**Tip #2: Cek dengan Substitusi**

Ambil **1 nilai** dari daerah penyelesaianmu, lalu cek ke pertidaksamaan awal.

**Contoh:** x > 3
- Ambil x = 5 (ada di daerah x > 3)
- Cek ke soal awal: apakah 5 memenuhi syarat? ✓

Kalau gak memenuhi, ada yang salah!

---

**Tip #3: Hati-hati dengan "Atau" vs "Dan"**

**Pertidaksamaan Gabungan:**

- **"Atau"** (∪) → salah satu terpenuhi sudah OK
  - Contoh: x < 2 **atau** x > 5

- **"Dan"** (∩) → semua harus terpenuhi
  - Contoh: x > 1 **dan** x < 7 → sama dengan 1 < x < 7

---

**Tip #4: Soal Cerita = Translate Dulu**

Kata kunci dalam soal cerita:
- "Minimal" → ≥
- "Maksimal" → ≤
- "Kurang dari" → 
- "Lebih dari" → >
- "Tidak boleh melebihi" → ≤
- "Setidaknya" → ≥

---

### 🚨 **Jebakan Umum di SNBT**

**Jebakan #1: Lupa Balik Tanda saat Bagi/Kali Negatif**

❌ **SALAH:**
- -3x < 9
- x < 9/(-3)
- x < -3 ← **SALAH!**

✅ **BENAR:**
- -3x < 9
- x **>** -3 ← **TANDA BALIK!**

---

**Jebakan #2: Salah Gambar di Garis Bilangan**

❌ **SALAH:**
Untuk x ≤ 5, pakai bulatan **kosong** ← **SALAH!**

✅ **BENAR:**
Untuk x ≤ 5, pakai bulatan **penuh** (karena ada tanda =)

---

**Jebakan #3: Salah Notasi Interval**

❌ **SALAH:**
x < 3 ditulis [3, ∞) ← **SALAH!** (harusnya pakai kurung biasa)

✅ **BENAR:**
x < 3 ditulis (-∞, 3)

---

**Jebakan #4: Pertidaksamaan Ganda**

**Contoh:** 2 < 3x - 1 ≤ 8

**JANGAN** pecah jadi dua pertidaksamaan yang terpisah!

✅ **BENAR:**
Selesaikan **sekaligus**:
- 2 < 3x - 1 ≤ 8
- 2 + 1 < 3x ≤ 8 + 1
- 3 < 3x ≤ 9
- 1 < x ≤ 3

Notasi interval: (1, 3]

---

### 🎪 **Aplikasi Pertidaksamaan dalam Masalah Sehari-hari**

**Tipe 1: Soal Keuangan**

**Contoh Bacaan:**

"Andi memiliki uang Rp100.000. Ia ingin membeli buku seharga Rp15.000 per buah. Jika ia harus menyisakan minimal Rp25.000, berapa maksimal buku yang bisa dibeli Andi?"

**Penyelesaian:**
- Misalkan banyak buku = x
- Uang awal = 100.000
- Sisa minimal = 25.000
- Uang terpakai = 15.000x

Pertidaksamaan:
100.000 - 15.000x ≥ 25.000
-15.000x ≥ 25.000 - 100.000
-15.000x ≥ -75.000
x ≤ 5 ← **TANDA BALIK!**

Jadi Andi maksimal bisa beli **5 buku**.

---

**Tipe 2: Soal Kapasitas**

**Contoh Bacaan:**

"Sebuah lift memiliki kapasitas maksimal 800 kg. Jika sudah ada 5 orang dengan total berat 350 kg, berapa berat maksimal orang keenam yang boleh masuk?"

**Penyelesaian:**
- Misalkan berat orang keenam = x kg
- Total berat = 350 + x
- Kapasitas maksimal = 800

Pertidaksamaan:
350 + x ≤ 800
x ≤ 800 - 350
**x ≤ 450 kg**

Jadi orang keenam maksimal **450 kg**.

---

**Tipe 3: Soal Nilai/Skor**

**Contoh Bacaan:**

"Untuk lulus SNBT, seorang siswa harus mendapat nilai minimal 600. Jika pada 3 subtes pertama ia mendapat nilai 180, 210, dan 150, berapa minimal nilai subtes keempat agar ia lulus?"

**Penyelesaian:**
- Misalkan nilai subtes keempat = x
- Total = 180 + 210 + 150 + x = 540 + x
- Minimal lulus = 600

Pertidaksamaan:
540 + x ≥ 600
x ≥ 600 - 540
**x ≥ 60**

Jadi nilai minimal subtes keempat adalah **60**.

---

**Tipe 4: Soal Geometri**

**Contoh Bacaan:**

"Keliling sebuah segitiga tidak lebih dari 30 cm. Jika dua sisinya masing-masing 8 cm dan 10 cm, berapa panjang maksimal sisi ketiga?"

**Penyelesaian:**
- Misalkan sisi ketiga = x
- Keliling = 8 + 10 + x = 18 + x
- Maksimal = 30

Pertidaksamaan:
18 + x ≤ 30
x ≤ 30 - 18
**x ≤ 12 cm**

Tapi **HATI-HATI!** Ada syarat tambahan untuk segitiga:
- Sisi ketiga harus **lebih besar** dari selisih dua sisi lain
- x > 10 - 8 = 2 cm

Jadi: **2 < x ≤ 12 cm**

---

### 💡 **Insight Khusus SNBT**

**1. Pertidaksamaan di Soal Cerita Selalu Ada "Batas"**

Cari kata kunci:
- "Minimal" → pakai ≥
- "Maksimal" → pakai ≤
- "Tidak boleh lebih dari" → ≤
- "Setidaknya" → ≥
- "Tidak kurang dari" → ≥

**2. Jawaban Harus Realistis**

Kalau soal tentang "berapa orang", jawaban **harus bilangan bulat** positif!
- Kalau dapat x ≤ 4,7 → maksimal **4 orang** (bukan 4,7!)
- Kalau dapat x ≥ 2,3 → minimal **3 orang** (bukan 2,3!)

**3. Hati-hati dengan Konteks**

Kadang SNBT kasih jebakan dengan **dua batasan sekaligus**:
- "Uang tidak kurang dari Rp50.000 tapi tidak lebih dari Rp100.000"
- → 50.000 ≤ x ≤ 100.000

**4. Garis Bilangan = Visual Check**

Kalau bingung, **gambar** garis bilangan! Mata kita lebih gampang lihat mana yang salah daripada hitung-hitungan.

---

### 🎓 **Kesimpulan: Mindset Juara SNBT**

Pertidaksamaan Linear itu **gampang** asalkan kamu:

1. ✅ **NEVER FORGET:** Kali/bagi negatif = **tanda balik**!
2. ✅ Pahami **notasi** (<, >, ≤, ≥) dengan benar
3. ✅ Bisa **menggambar** di garis bilangan
4. ✅ Teliti saat **translate** soal cerita
5. ✅ Cek jawaban dengan **substitusi** kalau ragu

**Pro Tip SNBT:**
Kalau ada pilihan jawaban, **coba substitusi** satu nilai dari setiap pilihan ke pertidaksamaan awal. Yang memenuhi = jawaban yang benar!

---

Mantap! Kamu udah nge-boost skill pertidaksamaan! 🚀

Selanjutnya kita masuk ke **Sistem Persamaan Linear Dua Variabel (SPLDV)**—di mana ada **dua** variabel (biasanya x dan y) dan **dua** persamaan. Seru banget karena ada banyak cara nyelesainnya! 🔥

---
