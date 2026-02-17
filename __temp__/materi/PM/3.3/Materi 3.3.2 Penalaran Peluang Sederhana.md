# SECTION 3: Statistika dan Probabilitas
## Topic 3.3: Peluang

---


## Materi 3.3.2: Penalaran Peluang Sederhana

### Saatnya Action: Menghitung Peluang Nyata! 🎯

Setelah paham konsep dasar, sekarang kita praktik langsung! Di materi ini, kamu akan belajar menentukan **ruang sampel** dengan penalaran logis dan menghitung peluang untuk berbagai situasi. Ini adalah skill fundamental yang WAJIB dikuasai sebelum lanjut ke topik yang lebih kompleks.

### Ruang Sampel: Peta Semua Kemungkinan

**Ruang sampel (S)** adalah **himpunan semua hasil yang mungkin terjadi** dalam suatu percobaan acak.

Think of it as: "Apa aja sih yang bisa terjadi?"

**Cara menentukan ruang sampel:**

**1. Listing (Daftar Lengkap)**
List semua kemungkinan satu per satu.

*Contoh:*
Lempar satu dadu → S = {1, 2, 3, 4, 5, 6}
Lempar satu koin → S = {Gambar, Angka} atau {G, A}

**2. Diagram Pohon (Tree Diagram)**
Cocok untuk kejadian bertahap.

*Contoh:*
Lempar 2 koin:
```
       G ─── GG
   G ─┤
   │   A ─── GA
───┤
   │   G ─── AG
   A ─┤
       A ─── AA
```
S = {GG, GA, AG, AA} → n(S) = 4

**3. Tabel (untuk 2 percobaan)**
Berguna untuk dua dadu, dua koin, dll.

*Contoh:*
Lempar 2 dadu:

| Dadu 1 \ Dadu 2 | 1 | 2 | 3 | 4 | 5 | 6 |
|-----------------|---|---|---|---|---|---|
| **1** | (1,1) | (1,2) | (1,3) | (1,4) | (1,5) | (1,6) |
| **2** | (2,1) | (2,2) | (2,3) | (2,4) | (2,5) | (2,6) |
| **3** | (3,1) | (3,2) | (3,3) | (3,4) | (3,5) | (3,6) |
| **4** | (4,1) | (4,2) | (4,3) | (4,4) | (4,5) | (4,6) |
| **5** | (5,1) | (5,2) | (5,3) | (5,4) | (5,5) | (5,6) |
| **6** | (6,1) | (6,2) | (6,3) | (6,4) | (6,5) | (6,6) |

n(S) = 6 × 6 = 36

**4. Prinsip Perkalian**
Untuk percobaan bertahap: kalikan banyaknya kemungkinan tiap tahap.

*Contoh:*
- Lempar 3 koin → 2 × 2 × 2 = 8 kemungkinan
- Lempar 2 dadu → 6 × 6 = 36 kemungkinan
- Pilih 1 dari 5 baju dan 1 dari 3 celana → 5 × 3 = 15 kombinasi

### Menghitung Peluang Kejadian Sederhana

Setelah punya ruang sampel, tinggal hitung n(A) dan aplikasikan rumus:

$$P(A) = \frac{n(A)}{n(S)}$$

**Langkah-langkahnya:**
1. Tentukan ruang sampel (S) dan hitung n(S)
2. Identifikasi kejadian A yang ditanyakan
3. Hitung n(A) = banyaknya hasil yang memenuhi A
4. Hitung P(A) = n(A)/n(S)
5. Sederhanakan pecahan (kalau perlu)

**Contoh 1: Satu Dadu**

Sebuah dadu dilempar satu kali. Berapa peluang muncul angka prima?

**Solusi:**
- S = {1, 2, 3, 4, 5, 6} → n(S) = 6
- Angka prima = {2, 3, 5} → n(A) = 3
- P(prima) = 3/6 = **1/2**

**Contoh 2: Dua Dadu**

Dua dadu dilempar bersamaan. Berapa peluang jumlah mata dadu = 7?

**Solusi:**
- n(S) = 36 (lihat tabel di atas)
- Jumlah = 7: {(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)} → n(A) = 6
- P(jumlah 7) = 6/36 = **1/6**

**Contoh 3: Tiga Koin**

Tiga koin dilempar bersamaan. Berapa peluang muncul tepat 2 gambar?

**Solusi:**
- n(S) = 2³ = 8
- S = {GGG, GGA, GAG, GAA, AGG, AGA, AAG, AAA}
- Tepat 2 G: {GGA, GAG, AGG} → n(A) = 3
- P(tepat 2 G) = 3/8

### Membandingkan Peluang: Mana yang Lebih Besar?

Skill penting di SNBT! Kamu sering diminta bandingkan beberapa peluang.

**Strategi perbandingan:**

**1. Samakan penyebut**
Ubah pecahan ke penyebut sama, baru bandingkan pembilang.

*Contoh:*
Mana lebih besar: 2/5 atau 3/8?
- 2/5 = 16/40
- 3/8 = 15/40
- Jadi 2/5 > 3/8

**2. Ubah ke desimal**
Kalau penyebut ribet, langsung bagi aja.

*Contoh:*
- 5/12 = 0,4167
- 7/15 = 0,4667
- Jadi 7/15 > 5/12

**3. Reasoning logis**
Kadang bisa langsung kelihatan tanpa hitung.

*Contoh:*
- 1/2 pasti lebih besar dari 1/3 (setengah vs sepertiga)
- 7/10 pasti lebih besar dari 6/10 (sama penyebut, lihat pembilang)

### Peluang Komplemen: Shortcut yang Powerful!

Ingat: P(tidak A) = 1 - P(A)

**Kapan pakai komplemen?**
Ketika menghitung "TIDAK terjadi" lebih mudah daripada "TERJADI".

**Contoh 1:**

Lempar 3 koin. Berapa peluang muncul paling sedikit 1 gambar?

**Cara panjang (hitung langsung):**
- Minimal 1 G = 1G atau 2G atau 3G
- Hitung satu-satu: {GGA, GAG, AGG, GGG, GAA, AGA, AAG} = 7
- P(minimal 1 G) = 7/8

**Cara shortcut (pakai komplemen):**
- Lawan dari "minimal 1 G" adalah "tidak ada G sama sekali" = AAA
- P(tidak ada G) = 1/8
- P(minimal 1 G) = 1 - 1/8 = **7/8**

Jauh lebih cepat kan?

**Contoh 2:**

Lempar 2 dadu. Berapa peluang jumlah mata dadu BUKAN 12?

**Cara shortcut:**
- Jumlah = 12 hanya dari (6,6) → n(A) = 1
- P(jumlah 12) = 1/36
- P(bukan 12) = 1 - 1/36 = **35/36**

### Kata Kunci dalam Soal dan Artinya

Penting banget nih! Satu kata bisa ubah total maknanya.

**"Tepat"** → harus persis sesuai, tidak lebih tidak kurang
- "Tepat 2 gambar" ≠ "minimal 2 gambar"

**"Paling sedikit" / "Minimal"** → bisa sama dengan atau lebih dari
- "Minimal 3" = 3, 4, 5, 6, ...

**"Paling banyak" / "Maksimal"** → bisa sama dengan atau kurang dari
- "Maksimal 2" = 0, 1, 2

**"Lebih dari"** → harus lebih, tidak termasuk angka itu sendiri
- "Lebih dari 3" = 4, 5, 6, ... (bukan 3)

**"Kurang dari"** → harus kurang, tidak termasuk angka itu sendiri
- "Kurang dari 4" = 1, 2, 3 (bukan 4)

**"Genap" vs "Ganjil"**
- Genap = {2, 4, 6}
- Ganjil = {1, 3, 5}

**"Prima"** → hanya punya 2 faktor (1 dan dirinya)
- Prima = {2, 3, 5} pada dadu

### Jebakan Umum di Soal SNBT! ⚠️

**JEBAKAN 1: Urutan Matters atau Tidak?**

❌ **SALAH anggap (1,2) = (2,1)**
Pada 2 dadu, (1,2) dan (2,1) adalah hasil BERBEDA!

**JEBAKAN 2: "Paling sedikit 1" vs "Tepat 1"**

Beda banget!
- Minimal 1 = 1, 2, 3, ... (banyak kemungkinan)
- Tepat 1 = cuma 1 (satu kemungkinan)

**JEBAKAN 3: Lupa hitung semua kemungkinan**

*Contoh:*
"Jumlah mata dadu genap" → jangan cuma hitung yang genap-genap!
- (1,1) = 2 ✓
- (1,3) = 4 ✓
- (2,2) = 4 ✓
- (1,5) = 6 ✓
- dll.

Genap bisa dari ganjil+ganjil atau genap+genap!

**JEBAKAN 4: Ruang sampel salah**

Pastikan:
- Sudah lengkap semua kemungkinan?
- Tidak ada yang double count?
- Setiap kemungkinan sama besar peluangnya?

**JEBAKAN 5: Tidak menyederhanakan**

Kalau jawaban pilihan ganda dalam bentuk sederhana (misal 1/2), tapi kamu tulis 18/36, bisa kelewat! Selalu sederhanakan.

### Peluang dari Berbagai Objek

**1. Kartu Remi**

Satu set kartu remi standar:
- Total = 52 kartu
- 4 suit (♠️ Sekop, ♥️ Hati, ♦️ Wajik, ♣️ Keriting)
- Setiap suit: A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K (13 kartu)
- Kartu merah: ♥️ dan ♦️ (26 kartu)
- Kartu hitam: ♠️ dan ♣️ (26 kartu)
- Kartu bergambar (face card): J, Q, K (12 kartu)
- As: 4 kartu

*Contoh:*
Ambil 1 kartu acak. Peluang dapat kartu ♥️?
- n(♥️) = 13
- n(S) = 52
- P(♥️) = 13/52 = **1/4**

**2. Bola Warna dalam Kotak**

*Misal:*
Kotak berisi 5 merah, 3 biru, 2 kuning.

Ambil 1 bola acak. Peluang dapat biru?
- n(biru) = 3
- n(S) = 5 + 3 + 2 = 10
- P(biru) = 3/10

**3. Angka Acak**

*Contoh:*
Pilih bilangan acak dari 1 sampai 20. Peluang dapat kelipatan 3?

- Kelipatan 3: {3, 6, 9, 12, 15, 18} → n(A) = 6
- n(S) = 20
- P(kelipatan 3) = 6/20 = **3/10**

### Strategi Menghitung Cepat

**1. Pake simetri**

Dadu 1 dan Dadu 2 simetris → peluang (1,6) = peluang (6,1)

**2. Kelompokkan**

Bagi jadi kasus-kasus yang lebih simple.

*Contoh:*
Jumlah dadu genap = (ganjil + ganjil) ATAU (genap + genap)

**3. Eliminasi**

Kalau tahu P(A) + P(B) + P(C) = 1, dan sudah tahu 2 dari mereka, bisa langsung cari yang ketiga.

**4. Pattern recognition**

Lempar n koin → n(S) = 2ⁿ
Lempar n dadu → n(S) = 6ⁿ

### Latihan Mental: Quick Check!

Tanpa hitung detail, kamu bisa prediksi:

**Q: Lempar 1 dadu, peluang keluar angka < 7?**
A: 1 (pasti! semua angka di dadu < 7)

**Q: Lempar 1 dadu, peluang keluar 7?**
A: 0 (mustahil!)

**Q: Lempar 1 koin,peluang Gambar?**
A: 1/2 (fifty-fifty)

**Q: Dari 10 bola (semua merah), ambil 1. Peluang merah?**
A: 1 (pasti merah semua!)

### Tips Pro: Visualisasi itu Penting!

Kadang gambar diagram pohon atau tabel bikin masalah jadi super clear. Jangan males gambar! 5 detik gambar bisa hemat 2 menit mikir.

**Tree diagram cocok untuk:**
- Kejadian bertahap (lempar 2-3 koin)
- Pilihan berurutan
- Percobaan dengan tahapan

**Tabel cocok untuk:**
- 2 dadu
- Kombinasi 2 hal
- Perlu lihat semua kemungkinan sekaligus

**List cocok untuk:**
- 1 percobaan simple
- Butuh cek satu-satu
- Ruang sampel kecil

### Cek Jawaban: Sanity Check!

Sebelum finalisasi jawaban, tanya diri sendiri:

1. ✅ Apakah 0 ≤ P(A) ≤ 1?
2. ✅ Apakah jawaban masuk akal secara logika?
3. ✅ Sudah disederhanakan?
4. ✅ Satuan/format sudah sesuai soal?

Kalau ada yang janggal, **cek ulang!**

### Common Sense Check

Peluang itu intuisi matematika. Gunakan akal sehat:

- Kalau dapat P(hujan) = 0,95 di musim kemarau → mencurigakan!
- Kalau P(merah) = 0,8 padahal cuma 2 dari 10 bola merah → pasti salah hitung!

### Rangkuman Rumus Penting

**Ruang sampel:**
- n koin: 2ⁿ
- n dadu: 6ⁿ
- Tahapan: kalikan

**Peluang dasar:**
$$P(A) = \frac{n(A)}{n(S)}$$

**Komplemen:**
$$P(\text{tidak } A) = 1 - P(A)$$

**Total peluang:**
$$\sum P = 1$$

### Practice Makes Perfect!

Peluang sederhana ini adalah **fondasi dari semua materi peluang**. Kalau ini belum mantap, topik selanjutnya (peluang majemuk, bersyarat, kombinatorika) akan susah.

**Cara latihan efektif:**
1. Mulai dari soal yang mudah dulu
2. Biasakan gambar diagram/tabel
3. Check jawaban dengan komplemen
4. Latih speed - peluang sederhana harus bisa cepat!

---

Oke, sekarang kamu udah bisa handle peluang sederhana dengan percaya diri! Next up: peluang kejadian majemuk yang lebih menantang! 🔥

---
