# SECTION 3: Statistika dan Probabilitas
## Topic 3.3: Peluang

---


## Materi 3.3.3: Peluang Kejadian Majemuk

### Level Up: Kombinasi Kejadian! 🎪

Welcome to the next level! Sekarang kita nggak cuma bahas satu kejadian, tapi **kombinasi dari beberapa kejadian**. Di sini kamu akan belajar apa yang terjadi kalau ada "ATAU", "DAN", "SETELAH", dan berbagai kombinasi lainnya.

Ini adalah materi yang **SERING BANGET** keluar di SNBT dan seringkali bikin bingung kalau nggak paham konsepnya dengan bener. So, let's break it down!

### Kejadian Majemuk: Apa Itu?

**Kejadian majemuk** adalah kejadian yang terbentuk dari **gabungan atau irisan** dua atau lebih kejadian.

Ada dua operasi utama:
1. **ATAU (Union, ∪)** → salah satu atau keduanya terjadi
2. **DAN (Intersection, ∩)** → kedua-duanya terjadi bersamaan

### Kejadian Saling Lepas: Nggak Bisa Barengan!

**Definisi:**
Dua kejadian **saling lepas** (mutually exclusive) kalau mereka **tidak bisa terjadi bersamaan**.

Matematisnya: A ∩ B = ∅ (irisan kosong)

**Contoh kejadian saling lepas:**
- Lempar dadu: keluar angka 2 DAN keluar angka 5 (mustahil terjadi bersamaan!)
- Hari ini: hujan DERAS DAN panas TERIK (contradictory!)
- Kartu remi: dapat ♥️ DAN dapat ♠️ (satu kartu cuma punya 1 suit!)

**Contoh yang BUKAN saling lepas:**
- Lempar dadu: keluar angka GENAP DAN keluar angka PRIMA → angka 2 memenuhi keduanya!
- Kartu remi: dapat kartu MERAH DAN dapat kartu AS → As ♥️ atau As ♦️ memenuhi!
- Dari kelas: LAKI-LAKI DAN memakai KACAMATA → bisa ada cowok berkacamata!

**Cara cek apakah saling lepas:**
Coba cari contoh yang memenuhi kedua kejadian. Kalau ada, berarti **TIDAK saling lepas**!

### Rumus Peluang "ATAU" (Union)

**Untuk kejadian SALING LEPAS:**

$$P(A \cup B) = P(A) + P(B)$$

Gampang! Tinggal jumlahkan.

*Contoh:*
Lempar dadu. Peluang keluar 2 ATAU 5?

- A = keluar 2 → P(A) = 1/6
- B = keluar 5 → P(B) = 1/6
- Keduanya saling lepas (dadu nggak bisa keluar 2 dan 5 sekaligus)
- P(2 atau 5) = 1/6 + 1/6 = **2/6 = 1/3**

**Untuk kejadian TIDAK saling lepas:**

$$P(A \cup B) = P(A) + P(B) - P(A \cap B)$$

Kenapa dikurangi P(A ∩ B)? Karena kalau cuma dijumlahkan, bagian yang overlap akan **dihitung 2 kali**!

Bayangkan diagram Venn:
```
    A          B
  ┌───┐      ┌───┐
  │   └──┬───┘   │
  │   overlap    │
  └──────┴───────┘
```

*Contoh:*
Lempar dadu. Peluang keluar angka GENAP ATAU angka PRIMA?

- Genap = {2, 4, 6} → P(Genap) = 3/6
- Prima = {2, 3, 5} → P(Prima) = 3/6
- Genap DAN Prima = {2} → P(Genap ∩ Prima) = 1/6
- P(Genap ATAU Prima) = 3/6 + 3/6 - 1/6 = **5/6**

Cek: {2, 3, 4, 5, 6} = 5 angka → 5/6 ✓

### Rumus Peluang "DAN" (Intersection)

Ini tergantung apakah kedua kejadian **saling bebas** atau tidak.

**Untuk kejadian SALING BEBAS (independent):**

$$P(A \cap B) = P(A) \times P(B)$$

**Kejadian saling bebas** artinya: terjadinya A **tidak mempengaruhi** peluang terjadinya B.

*Contoh kejadian bebas:*
- Lempar koin 1 dan koin 2 (hasil koin 1 tidak pengaruhi koin 2)
- Lempar dadu lalu lempar koin (tidak saling pengaruh)
- Ambil kartu, kembalikan, kocok, ambil lagi (karena dikembalikan!)

*Contoh:*
Lempar 2 koin. Peluang keduanya Gambar?

- Koin 1: P(G) = 1/2
- Koin 2: P(G) = 1/2
- Keduanya bebas (tidak saling pengaruh)
- P(GG) = 1/2 × 1/2 = **1/4**

**Untuk kejadian TIDAK saling bebas:**

$$P(A \cap B) = P(A) \times P(B|A)$$

Di mana P(B|A) = peluang B terjadi **dengan syarat** A sudah terjadi.

Kita akan bahas lebih detail di materi Peluang Bersyarat!

### Kejadian Berurutan: Satu Demi Satu

Kalau ada kejadian yang terjadi **berurutan** (sequentially), kita harus hati-hati apakah ada pengaruh atau tidak.

**Tipe 1: Dengan Pengembalian**
Setiap percobaan **independen** (tidak saling pengaruh).

*Contoh:*
Kotak berisi 3 merah, 2 biru. Ambil 1 bola, catat warnanya, **kembalikan**, lalu ambil lagi.

Peluang ambil merah 2 kali berturut-turut?
- P(merah pertama) = 3/5
- P(merah kedua) = 3/5 (karena dikembalikan!)
- P(merah 2 kali) = 3/5 × 3/5 = **9/25**

**Tipe 2: Tanpa Pengembalian**
Percobaan **tidak independen** (saling mempengaruhi).

*Contoh:*
Kotak berisi 3 merah, 2 biru. Ambil 1 bola, catat warnanya, **tidak dikembalikan**, lalu ambil lagi.

Peluang ambil merah 2 kali berturut-turut?
- P(merah pertama) = 3/5
- P(merah kedua | merah pertama) = 2/4 (sekarang cuma 4 bola tersisa, 2 merah)
- P(merah 2 kali) = 3/5 × 2/4 = 6/20 = **3/10**

Beda kan hasilnya?

### Diagram Pohon: Senjata Rahasia! 🌳

Untuk kejadian berurutan, **diagram pohon** adalah tool terbaik!

*Contoh:*
Lempar 2 koin berurutan.

```
         G (1/2) ─── GG: 1/2 × 1/2 = 1/4
    G ──┤
    │    A (1/2) ─── GA: 1/2 × 1/2 = 1/4
────┤
    │    G (1/2) ─── AG: 1/2 × 1/2 = 1/4
    A ──┤
         A (1/2) ─── AA: 1/2 × 1/2 = 1/4
```

**Cara baca:**
- Setiap cabang = peluang kejadian di tahap itu
- Ujung cabang = kalikan semua peluang di jalurnya
- Total peluang semua ujung = 1

**Keuntungan diagram pohon:**
✅ Visualisasi jelas
✅ Tidak ada kejadian yang terlewat
✅ Mudah cek: total semua peluang harus = 1

### Peluang "Paling Sedikit" - Gunakan Komplemen!

**"Paling sedikit 1 sukses"** = lawan dari **"tidak ada sukses sama sekali"**

Ini adalah shortcut super powerful!

$$P(\text{minimal 1}) = 1 - P(\text{tidak ada sama sekali})$$

*Contoh 1:*
Lempar 3 koin. Peluang muncul paling sedikit 1 Gambar?

**Cara panjang:**
Hitung: 1G + 2G + 3G
- 1G: 3 cara → {GAA, AGA, AAG}
- 2G: 3 cara → {GGA, GAG, AGG}
- 3G: 1 cara → {GGG}
- Total: 7 cara
- P(minimal 1G) = 7/8

**Cara shortcut (komplemen):**
- P(tidak ada G) = P(AAA) = 1/8
- P(minimal 1G) = 1 - 1/8 = **7/8**

Jauh lebih cepat!

*Contoh 2:*
Lempar 4 koin. Peluang muncul paling sedikit 1 Angka?

- P(tidak ada Angka) = P(GGGG) = (1/2)⁴ = 1/16
- P(minimal 1 Angka) = 1 - 1/16 = **15/16**

### Peluang "Tepat k Sukses"

Untuk kasus "tepat k kali sukses dari n percobaan", kita perlu hitung:
1. Berapa cara memilih k posisi dari n
2. Peluang sukses k kali dan gagal (n-k) kali

*Contoh:*
Lempar 3 koin. Peluang muncul tepat 2 Gambar?

- Cara pilih 2 posisi dari 3: GGA, GAG, AGG → 3 cara
- Setiap cara: P = (1/2)² × (1/2)¹ = 1/8
- Total: 3 × 1/8 = **3/8**

Atau pakai rumus kombinasi (akan dibahas di materi Kombinatorika!):

$$P(\text{tepat k sukses}) = C(n,k) \times p^k \times (1-p)^{n-k}$$

### Jebakan Umum - Harus Dihindari! ⚠️

**JEBAKAN 1: Lupa cek saling lepas atau tidak**

❌ SALAH: Langsung P(A atau B) = P(A) + P(B) tanpa cek overlap
✅ BENAR: Cek dulu ada overlap atau tidak!

**JEBAKAN 2: Kali padahal harusnya tambah**

Kata "ATAU" → biasanya **tambah** (untuk saling lepas)
Kata "DAN" → biasanya **kali** (untuk bebas)

Tapi HATI-HATI! Ini cuma rule of thumb, bukan aturan mutlak!

**JEBAKAN 3: Anggap bebas padahal tidak**

*Contoh salah:*
Ambil 2 kartu tanpa pengembalian, anggap independen → SALAH!
Kartu pertama mempengaruhi kartu kedua.

**JEBAKAN 4: Lupa dengan/tanpa pengembalian**

Ini CRUCIAL! Baca soal teliti:
- "Dikembalikan" / "Dengan pengembalian" → independen
- "Tanpa pengembalian" / tidak disebutkan dikembalikan → dependent

**JEBAKAN 5: Minimal 1 dihitung manual**

Kalau ada "minimal 1", hampir selalu lebih cepat pakai komplemen:
P(minimal 1) = 1 - P(tidak ada)

### Kombinasi Strategi: Mix & Match!

Kadang soal complex butuh kombinasi berbagai rumus:

*Contoh:*
Lempar 2 dadu. Peluang jumlahnya genap ATAU salah satu dadu keluar 6?

**Step 1: Definisikan kejadian**
- A = jumlah genap
- B = salah satu dadu 6

**Step 2: Cek saling lepas?**
- Jumlah genap DAN ada 6: (6,2), (6,4), (6,6), (2,6), (4,6) → ada overlap!
- Jadi TIDAK saling lepas

**Step 3: Pakai rumus union umum**
P(A ∪ B) = P(A) + P(B) - P(A ∩ B)

**Step 4: Hitung satu-satu**
- P(A): jumlah genap = 18/36 = 1/2
- P(B): ada 6 = 11/36 (dadu 1 = 6: 6 cara, dadu 2 = 6: 6 cara, minus (6,6) yang overlap: 11)
- P(A ∩ B): genap DAN ada 6 = {(6,2), (6,4), (6,6), (2,6), (4,6)} = 5/36

**Step 5: Hitung**
P(A ∪ B) = 1/2 + 11/36 - 5/36
= 18/36 + 11/36 - 5/36
= 24/36 = **2/3**

### Pattern Recognition: Kenali Pola!

**Pattern 1: Peluang "semua sukses"**
n percobaan independen, semua sukses:
P = pⁿ

*Contoh: 3 koin semua Gambar = (1/2)³ = 1/8*

**Pattern 2: Peluang "tidak ada yang sukses"**
n percobaan independen, semua gagal:
P = (1-p)ⁿ

*Contoh: 4 koin tidak ada Gambar = (1/2)⁴ = 1/16*

**Pattern 3: Peluang "minimal 1 sukses"**
P = 1 - (1-p)ⁿ

*Contoh: Minimal 1 Gambar dari 3 koin = 1 - (1/2)³ = 7/8*

**Pattern 4: Exactly k dari n (untuk p = 1/2)**
P = C(n,k) / 2ⁿ

*Contoh: Tepat 2 Gambar dari 3 koin = C(3,2) / 8 = 3/8*

### Tips Strategis untuk SNBT

**1. Baca soal PELAN-PELAN**
Peluang majemuk banyak detail! Satu kata terlewat = jawaban salah.

**2. Identifikasi kata kunci**
- "ATAU" → union
- "DAN" → intersection
- "MINIMAL" → pakai komplemen!
- "TEPAT" → hitung spesifik

**3. Cek independen atau tidak**
Ini menentukan rumus mana yang dipakai!

**4. Gambar diagram kalau perlu**
Pohon untuk berurutan, Venn untuk irisan/gabungan.

**5. Verifikasi jawaban**
- Apakah 0 ≤ P ≤ 1?
- Apakah masuk akal?
- Cek dengan cara lain kalau ada waktu

### Intuisi: Logika di Balik Rumus

**Kenapa P(A atau B) = P(A) + P(B) - P(A∩B)?**

Bayangkan kamu punya 2 lingkaran yang overlap:
- P(A) hitung semua yang di A, termasuk overlap
- P(B) hitung semua yang di B, termasuk overlap
- Kalau dijumlahkan, overlap dihitung 2 kali!
- Makanya dikurangi P(A∩B) biar overlap cuma dihitung sekali

**Kenapa P(A dan B) = P(A) × P(B)?**

Kalau independen, kejadian B nggak peduli A terjadi atau tidak. Jadi:
- Dari semua kemungkinan (100%), A terjadi sebagian (P(A))
- Dari bagian A itu, B terjadi lagi sebagian (P(B))
- Jadi total yang A dan B = P(A) × P(B)

### Quick Reference: Kapan Pakai Rumus Apa?

| Kondisi | Rumus | Contoh |
|---------|-------|--------|
| A atau B, saling lepas | P(A) + P(B) | Dadu 2 atau 5 |
| A atau B, ada overlap | P(A) + P(B) - P(A∩B) | Genap atau prima |
| A dan B, independen | P(A) × P(B) | 2 koin berbeda |
| A dan B, dependent | P(A) × P(B\|A) | Ambil tanpa kembali |
| Minimal 1 | 1 - P(tidak ada) | Min 1 G dari 3 koin |
| Tepat k dari n | Hitung kombinasi | Tepat 2 G dari 4 koin |

### Rangkuman: Must Remember!

**Kejadian Majemuk:**
- Union (∪) = "ATAU"
- Intersection (∩) = "DAN"

**Saling Lepas:**
- P(A ∪ B) = P(A) + P(B)

**Tidak Saling Lepas:**
- P(A ∪ B) = P(A) + P(B) - P(A ∩ B)

**Saling Bebas:**
- P(A ∩ B) = P(A) × P(B)

**Komplemen:**
- P(minimal 1) = 1 - P(tidak ada)

**Berurutan:**
- Dengan pengembalian → independen
- Tanpa pengembalian → dependent

---

Peluang majemuk emang tricky, tapi kalau udah paham konsepnya, justru ini yang paling seru! Practice makes perfect—semakin banyak latihan, semakin tajam intuisi kalian. Next: Peluang Bersyarat yang lebih mind-blowing lagi! 🚀

---
