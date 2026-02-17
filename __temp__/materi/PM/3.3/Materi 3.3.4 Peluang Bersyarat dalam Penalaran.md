# SECTION 3: Statistika dan Probabilitas
## Topic 3.3: Peluang

---


## Materi 3.3.4: Peluang Bersyarat dalam Penalaran

### When Information Changes Everything! 🔍

Selamat datang di salah satu konsep paling powerful (dan paling sering bikin bingung) dalam peluang: **Peluang Bersyarat**!

Bayangin gini: peluang hujan hari ini mungkin 30%. Tapi kalau tiba-tiba langit mendung banget, peluangnya jadi berubah jadi 80%! Informasi tambahan ("langit mendung") **mengubah** peluang kita.

Itulah esensi peluang bersyarat: **bagaimana informasi baru mempengaruhi peluang**.

### Konsep Dasar: "Given That" atau "Dengan Syarat"

**Peluang bersyarat** adalah peluang suatu kejadian terjadi **dengan syarat** kejadian lain sudah terjadi.

Notasinya: **P(A|B)**

Dibaca: "Peluang A terjadi, **given** B sudah terjadi" atau "Peluang A **dengan syarat** B"

**Contoh intuitif:**

1. **Kartu Remi**
   - P(As) = 4/52
   - P(As | kartu merah) = ?
   
   Kalau udah tahu kartu merah, cuma ada 26 kemungkinan (bukan 52 lagi!)
   - Dari 26 kartu merah, cuma 2 yang As (As ♥️ dan As ♦️)
   - Jadi P(As | merah) = 2/26 = 1/13

2. **Pelemparan Dadu**
   - P(angka 6) = 1/6
   - P(angka 6 | angka genap) = ?
   
   Kalau udah tahu genap, cuma ada 3 kemungkinan: {2, 4, 6}
   - Dari 3 itu, cuma 1 yang bernilai 6
   - Jadi P(6 | genap) = 1/3

Perhatikan: peluang berubah ketika ada informasi tambahan!

### Rumus Peluang Bersyarat

Ada dua cara menghitung peluang bersyarat:

**Cara 1: Langsung dari Definisi**

$$P(A|B) = \frac{\text{banyak hasil yang memenuhi A DAN B}}{\text{banyak hasil yang memenuhi B}}$$

Ini cara paling intuitif untuk pemula.

**Cara 2: Rumus Formal**

$$P(A|B) = \frac{P(A \cap B)}{P(B)}$$

Dengan syarat P(B) > 0 (B harus mungkin terjadi).

**Kenapa rumus ini masuk akal?**

Bayangkan ruang sampel awal (S) menyempit jadi cuma yang memenuhi B. Nah, dari ruang yang sudah menyempit itu, berapa persen yang juga memenuhi A?

### Contoh Detail: Memahami Peluang Bersyarat

**Contoh 1: Dua Dadu**

Lempar 2 dadu. Diketahui jumlah mata dadu **lebih dari 9**. Berapa peluang kedua dadu menunjukkan angka **sama**?

**Solusi:**

**Step 1: Identifikasi B (syarat/kondisi)**
B = jumlah > 9

Kemungkinan jumlah > 9:
- Jumlah 10: (4,6), (5,5), (6,4) → 3 cara
- Jumlah 11: (5,6), (6,5) → 2 cara
- Jumlah 12: (6,6) → 1 cara

Total: n(B) = 6

**Step 2: Identifikasi A∩B (memenuhi kedua syarat)**
A = kedua dadu sama
A ∩ B = kedua sama DAN jumlah > 9

Dari list B di atas, yang kedua dadu sama cuma: (5,5) dan (6,6) → 2 cara

**Step 3: Hitung**
P(sama | jumlah > 9) = 2/6 = **1/3**

**Contoh 2: Bola dalam Kotak**

Kotak berisi 3 bola merah, 4 bola biru, 2 bola kuning. Diambil 2 bola sekaligus secara acak. Diketahui **salah satu bola yang terambil berwarna merah**. Berapa peluang bola yang lain juga **merah**?

**Solusi:**

**Step 1: Ruang sampel**
Total bola = 9
Cara ambil 2 dari 9 = C(9,2) = 36

**Step 2: Kejadian B (syarat)**
B = salah satu merah

Kemungkinan:
- Merah-Merah: C(3,2) = 3
- Merah-Biru: 3 × 4 = 12
- Merah-Kuning: 3 × 2 = 6

Total: n(B) = 3 + 12 + 6 = 21

**Step 3: Kejadian A∩B**
A = kedua merah
A ∩ B = kedua merah (otomatis memenuhi "salah satu merah")

n(A ∩ B) = 3

**Step 4: Hitung**
P(kedua merah | salah satu merah) = 3/21 = **1/7**

### Diagram Pohon untuk Peluang Bersyarat

Diagram pohon sangat membantu untuk visualisasi peluang bersyarat, terutama untuk kejadian berurutan.

**Contoh:**

Kotak I: 2 merah, 3 biru
Kotak II: 4 merah, 1 biru

Pilih kotak acak (peluang sama), lalu ambil 1 bola.

```
           M (2/5) ─── Kotak I & Merah: 1/2 × 2/5 = 2/10
Kotak I ──┤
(1/2)      B (3/5) ─── Kotak I & Biru: 1/2 × 3/5 = 3/10
──────┤
           M (4/5) ─── Kotak II & Merah: 1/2 × 4/5 = 4/10
Kotak II ─┤
(1/2)      B (1/5) ─── Kotak II & Biru: 1/2 × 1/5 = 1/10
```

**Pertanyaan:** Jika bola yang terambil **merah**, berapa peluang berasal dari **Kotak I**?

Ini adalah P(Kotak I | Merah)!

**Solusi:**
- P(Kotak I ∩ Merah) = 2/10
- P(Merah) = 2/10 + 4/10 = 6/10
- P(Kotak I | Merah) = (2/10) / (6/10) = 2/6 = **1/3**

### Hukum Perkalian Peluang (Dari Peluang Bersyarat)

Dari rumus P(A|B) = P(A∩B) / P(B), kita bisa turunkan:

$$P(A \cap B) = P(B) \times P(A|B)$$

Atau equivalently:

$$P(A \cap B) = P(A) \times P(B|A)$$

Ini adalah **aturan perkalian umum** untuk peluang "DAN".

**Aplikasi:**

Kotak berisi 5 merah, 3 biru. Ambil 2 bola **tanpa pengembalian**. Peluang keduanya merah?

**Cara pakai peluang bersyarat:**
- P(merah pertama) = 5/8
- P(merah kedua | merah pertama) = 4/7 (sekarang cuma 7 bola, 4 merah)
- P(keduanya merah) = 5/8 × 4/7 = 20/56 = **5/14**

### Independensi vs Dependensi: Hubungannya dengan Bersyarat

**Kejadian A dan B independen** kalau:

$$P(A|B) = P(A)$$

Artinya: informasi tentang B **tidak mengubah** peluang A.

Kalau independen, maka:
- P(A|B) = P(A)
- P(B|A) = P(B)
- P(A ∩ B) = P(A) × P(B)

**Contoh independen:**
- Lempar koin 1 dan koin 2
- P(koin 2 Gambar | koin 1 Gambar) = P(koin 2 Gambar) = 1/2
- Hasil koin 1 tidak pengaruhi koin 2!

**Contoh dependent:**
- Ambil kartu tanpa pengembalian
- P(As kedua | As pertama) ≠ P(As kedua)
- Kartu pertama mempengaruhi kartu kedua!

### Teorema Bayes: The Power of Reverse Probability!

Kadang kita tahu P(B|A) tapi ingin cari P(A|B). Teorema Bayes membalikkannya!

$$P(A|B) = \frac{P(B|A) \times P(A)}{P(B)}$$

Atau lebih lengkap (dengan partisi ruang sampel):

$$P(A|B) = \frac{P(B|A) \times P(A)}{P(B|A) \times P(A) + P(B|A^c) \times P(A^c)}$$

**Kapan dipakai?**

Bayesian reasoning super berguna untuk:
- Medical diagnosis (gejala → penyakit)
- Spam detection (kata-kata → spam atau bukan)
- Forensics (bukti → bersalah atau tidak)

**Contoh Aplikasi:**

**Tes Penyakit**

Penyakit X terjadi pada 1% populasi. Ada tes yang:
- Jika sakit, tes positif 99% (sensitivity)
- Jika sehat, tes negatif 95% (specificity, atau tes positif 5%)

Seseorang tes **positif**. Berapa peluang dia **benar-benar sakit**?

**Solusi pakai Bayes:**

- A = sakit, B = tes positif
- P(A) = 0,01
- P(A^c) = 0,99
- P(B|A) = 0,99
- P(B|A^c) = 0,05

$$P(A|B) = \frac{0,99 \times 0,01}{0,99 \times 0,01 + 0,05 \times 0,99}$$

$$= \frac{0,0099}{0,0099 + 0,0495} = \frac{0,0099}{0,0594} \approx 0,167$$

**Hanya 16,7%!**

Surprising bukan? Meskipun tes positif, peluang benar sakit cuma 16,7%! Ini karena penyakitnya jarang (1%), jadi banyak false positive dari orang sehat.

Ini contoh klasik **base rate fallacy** - mengabaikan prevalensi awal.

### Jebakan dalam Peluang Bersyarat ⚠️

**JEBAKAN 1: Terbalik P(A|B) dengan P(B|A)**

❌ SALAH: Menganggap P(A|B) = P(B|A)
✅ BENAR: Keduanya umumnya BERBEDA!

*Contoh:*
- P(hujan | mendung) ≠ P(mendung | hujan)
- P(positif | sakit) ≠ P(sakit | positif)

**JEBAKAN 2: Lupa syarat P(B) > 0**

P(A|B) hanya terdefinisi kalau B mungkin terjadi!

**JEBAKAN 3: Mengabaikan informasi kondisional**

Kalau soal bilang "diketahui...", itu adalah syarat! Ruang sampel berubah!

**JEBAKAN 4: Salah interpretasi "salah satu"**

"Salah satu merah" ≠ "yang pertama merah"

Hati-hati! "Salah satu" bisa:
- Pertama merah, kedua bukan
- Pertama bukan, kedua merah
- Keduanya merah

**JEBAKAN 5: Anggap independen padahal dependent**

Tanpa pengembalian = DEPENDENT!
Dengan pengembalian = INDEPENDENT!

### Strategi Menyelesaikan Soal Peluang Bersyarat

**Step 1: Identifikasi dengan jelas**
- Apa yang jadi syarat (kondisi)?
- Apa yang ditanyakan?

**Step 2: Tentukan ruang sampel baru**
Setelah ada syarat, ruang sampel menyempit!

**Step 3: Hitung jumlah yang memenuhi**
- Berapa yang memenuhi syarat? → n(B)
- Berapa yang memenuhi syarat DAN yang ditanya? → n(A∩B)

**Step 4: Aplikasikan rumus**
P(A|B) = n(A∩B) / n(B)
atau
P(A|B) = P(A∩B) / P(B)

**Step 5: Sanity check**
Apakah jawaban masuk akal?

### Tabel Kontingensi: Tool Visualisasi Keren!

Untuk soal dengan dua kategori, tabel kontingensi sangat membantu!

**Contoh:**

Survei 100 orang:
- 60 suka kopi
- 30 suka teh
- 15 suka keduanya

Buat tabel:

|  | Suka Teh | Tidak Suka Teh | Total |
|---|----------|----------------|-------|
| **Suka Kopi** | 15 | 45 | 60 |
| **Tidak Suka Kopi** | 15 | 25 | 40 |
| **Total** | 30 | 70 | 100 |

Dari sini, gampang hitung berbagai peluang bersyarat:

P(suka teh | suka kopi) = 15/60 = 1/4
P(suka kopi | suka teh) = 15/30 = 1/2

### Aplikasi Praktis: Di Mana Ini Dipakai?

**1. Medical Testing**
P(sakit | tes positif) - interpretasi hasil tes

**2. Machine Learning**
Naive Bayes classifier untuk spam detection, sentiment analysis

**3. Criminal Justice**
P(bersalah | bukti) - forensic evidence

**4. Insurance**
P(claim | profile) - pricing premium

**5. Quality Control**
P(defective | dari pabrik tertentu)

**6. Weather Forecasting**
P(hujan | kondisi atmosfer)

### Tips Menghadapi Soal Bersyarat di SNBT

**1. Highlight kata "diketahui", "jika", "given"**
Ini signal bahwa ada syarat!

**2. Gambar diagram atau tabel**
Visualisasi membantu banget!

**3. Clearly define events**
Tulis jelas: A = apa, B = apa

**4. Double-check mana yang kondisi, mana yang ditanya**
P(A|B) ≠ P(B|A)!

**5. Cek independensi**
Kalau independen, P(A|B) = P(A), lebih gampang!

**6. Gunakan pohon untuk sequential**
Diagram pohon sangat powerful untuk kejadian berurutan

### Common Patterns di SNBT

**Pattern 1: Tanpa Pengembalian**
"Ambil 2 bola berturut tanpa dikembalikan"
→ Pasti pakai peluang bersyarat!

**Pattern 2: "Diketahui salah satu..."**
→ Ruang sampel berubah, hitung ulang!

**Pattern 3: "Tes menunjukkan..."**
→ Biasanya pakai Bayes untuk cari P(kondisi | hasil tes)

**Pattern 4: Tabel data given**
→ Buat tabel kontingensi, hitung dari situ

### Intuisi: Why Conditional Probability Makes Sense

Bayangin kamu punya 100 bola:
- 50 merah (30 besar, 20 kecil)
- 50 biru (10 besar, 40 kecil)

P(merah) = 50/100 = 1/2

Tapi kalau dikasih tahu "bolanya BESAR", ruang sampel jadi cuma 40 bola besar!

P(merah | besar) = 30/40 = 3/4

Informasi "besar" mengubah peluang dari 1/2 jadi 3/4!

### Quick Reference: Rumus Penting

**Peluang Bersyarat:**
$$P(A|B) = \frac{P(A \cap B)}{P(B)}$$

**Aturan Perkalian:**
$$P(A \cap B) = P(B) \times P(A|B) = P(A) \times P(B|A)$$

**Independensi:**
$$P(A|B) = P(A) \Leftrightarrow \text{A dan B independen}$$

**Teorema Bayes:**
$$P(A|B) = \frac{P(B|A) \times P(A)}{P(B)}$$

**Hukum Total Probability:**
$$P(B) = P(B|A) \times P(A) + P(B|A^c) \times P(A^c)$$

### Rangkuman: Yang Wajib Diingat!

1. **P(A|B) = peluang A terjadi GIVEN B sudah terjadi**
2. **Informasi mengubah peluang** - ruang sampel menyempit!
3. **P(A|B) ≠ P(B|A)** - jangan terbalik!
4. **Independen → P(A|B) = P(A)**
5. **Tanpa pengembalian → dependent → pakai bersyarat!**
6. **Diagram pohon = best friend untuk sequential events**
7. **Bayes = reverse probability** - dari P(B|A) ke P(A|B)

---

Peluang bersyarat adalah game-changer! Ini mengajarkan kita bahwa **informasi itu powerful** - satu informasi tambahan bisa total mengubah peluang. Master materi ini, dan kamu akan punya keunggulan besar di SNBT! 💪

---
