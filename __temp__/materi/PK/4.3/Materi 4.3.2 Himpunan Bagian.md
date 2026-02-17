# SECTION 4: Statistika dan Peluang
## Topic 4.3: Himpunan

---


### Materi 4.3.2: Himpunan Bagian

#### Konsep Himpunan Bagian (Subset)

Oke, sekarang kita naikin level! Bayangin kamu punya himpunan A = {semua buah}. Terus ada himpunan B = {semua buah jeruk}. Nah, jelas kan kalau semua anggota B pasti ada di A? Ini yang disebut **himpunan bagian**.

**Definisi:**
Himpunan A dikatakan **himpunan bagian** (subset) dari himpunan B, ditulis **A ⊆ B**, jika setiap anggota A juga merupakan anggota B.

**Notasi:**
- **⊆** artinya "himpunan bagian dari" atau "subset dari"
- **⊈** artinya "bukan himpunan bagian dari"

**Contoh:**
- A = {1, 2, 3}
- B = {1, 2, 3, 4, 5}
- Maka A ⊆ B (dibaca: "A himpunan bagian B" atau "A subset B")

**Ciri-cirinya gampang:**
Kalau A ⊆ B, artinya:
- Semua elemen A pasti ada di B
- Tapi B boleh punya elemen tambahan yang nggak ada di A

#### Sifat-Sifat Himpunan Bagian

Ada beberapa aturan main yang WAJIB kamu hapal:

**1. Himpunan Kosong adalah Subset dari Semua Himpunan**
- ∅ ⊆ A (untuk himpunan A apapun)
- Kenapa? Karena nggak ada satupun anggota ∅ yang TIDAK ada di A (logikanya agak tricky tapi percaya aja dulu! 😄)

**2. Setiap Himpunan adalah Subset dari Dirinya Sendiri**
- A ⊆ A
- Ya iyalah, semua anggota A pasti ada di A kan?

**3. Jika A ⊆ B dan B ⊆ A, maka A = B**
- Ini definisi kesamaan himpunan yang lebih formal

**4. Transitif**
- Jika A ⊆ B dan B ⊆ C, maka A ⊆ C
- Kayak rantai makanan: kalau A subset B, B subset C, ya otomatis A subset C juga

#### Himpunan Bagian Sejati (Proper Subset)

Ini versi "lebih ketat" dari himpunan bagian biasa.

**Definisi:**
A adalah **himpunan bagian sejati** dari B, ditulis **A ⊂ B**, jika:
1. A ⊆ B (A adalah himpunan bagian B)
2. A ≠ B (A tidak sama dengan B)

Sederhananya: A subset B, TAPI B punya anggota tambahan yang nggak ada di A.

**Notasi:**
- **⊂** (proper subset) → A subset B tapi A ≠ B
- **⊆** (subset) → A subset B atau A = B

**Contoh:**
- A = {1, 2}
- B = {1, 2, 3}
- Maka A ⊂ B (A himpunan bagian sejati B)

**Tapi:**
- A = {1, 2, 3}
- B = {1, 2, 3}
- Maka A ⊆ B (A himpunan bagian B), tetapi A ⊄ B (A BUKAN himpunan bagian sejati B)

**Jebakan SNBT:** Perhatikan simbol ⊂ vs ⊆! Bedanya tipis tapi penting!
- ⊂ → pasti beda (proper subset)
- ⊆ → bisa sama, bisa beda (subset)

#### Banyaknya Himpunan Bagian

Nah, ini yang sering keluar di SNBT! Pertanyaannya: "Berapa banyak himpunan bagian dari himpunan A?"

**Rumus Ajaib:** Jika n(A) = n, maka banyak himpunan bagian A adalah **2ⁿ**

**Kenapa 2ⁿ?**

Bayangin setiap elemen punya 2 pilihan: "masuk" atau "nggak masuk" ke himpunan bagian. Kalau ada n elemen, total kombinasinya = 2 × 2 × 2 × ... (sebanyak n kali) = 2ⁿ

**Contoh:**
A = {1, 2, 3}, n(A) = 3

Banyak himpunan bagian = 2³ = 8

Apa aja?
1. ∅ (kosong)
2. {1}
3. {2}
4. {3}
5. {1, 2}
6. {1, 3}
7. {2, 3}
8. {1, 2, 3}

Itung sendiri, 8 kan? 😎

**Tips SNBT:** Jangan lupa himpunan kosong dan himpunan itu sendiri juga termasuk himpunan bagian!

#### Banyaknya Himpunan Bagian Sejati

Kalau yang tadi termasuk himpunan itu sendiri, sekarang kita exclude himpunan itu sendiri.

**Rumus:** Jika n(A) = n, maka banyak himpunan bagian sejati A adalah **2ⁿ - 1**

Kurangi 1 karena kita ngeluarin himpunan A itu sendiri.

**Contoh:**
A = {a, b, c, d}, n(A) = 4

Banyak himpunan bagian = 2⁴ = 16
Banyak himpunan bagian sejati = 2⁴ - 1 = 15

**Yang 15 itu:**
- 1 himpunan kosong: ∅
- 4 himpunan dengan 1 anggota: {a}, {b}, {c}, {d}
- 6 himpunan dengan 2 anggota: {a,b}, {a,c}, {a,d}, {b,c}, {b,d}, {c,d}
- 4 himpunan dengan 3 anggota: {a,b,c}, {a,b,d}, {a,c,d}, {b,c,d}

Total = 1 + 4 + 6 + 4 = 15 ✓

(Yang nggak masuk: {a, b, c, d} itu sendiri)

#### Variasi Soal yang Sering Muncul

**1. Berapa himpunan bagian yang memiliki tepat k anggota?**

Ini pakai kombinasi (nanti kita bahas di peluang):

Banyak himpunan bagian dengan k anggota = C(n, k) = nCk

**Contoh:**
A = {1, 2, 3, 4, 5}, n = 5
Berapa himpunan bagian dengan tepat 3 anggota?

Jawab: C(5, 3) = 10

**2. Berapa himpunan bagian yang paling sedikit memiliki 2 anggota?**

Ini kebalikannya. Kita hitung total himpunan bagian, lalu kurangi yang punya 0 anggota dan 1 anggota.

Jawab: 2ⁿ - C(n,0) - C(n,1) = 2ⁿ - 1 - n

**3. A ⊆ B dan B ⊆ C, apakah A ⊆ C?**

Jawabannya: YA! (sifat transitif)

#### Hubungan Antar Himpunan: Visualisasi

Kadang soal SNBT kasih gambaran kayak gini:

**1. A dan B Saling Lepas (Disjoint)**
- Nggak ada anggota yang sama
- A ∩ B = ∅

**2. A dan B Berpotongan**
- Ada anggota yang sama
- A ∩ B ≠ ∅

**3. A ⊆ B**
- A di dalam B
- Semua anggota A ada di B

**4. A = B**
- Punya anggota yang sama persis

#### Tips & Trik SNBT untuk Himpunan Bagian

**1. Hafalkan Rumus 2ⁿ dan 2ⁿ - 1**
- Ini WAJIB hapal dan paham kapan pakai yang mana
- Kalau soal bilang "termasuk dirinya sendiri" → pakai 2ⁿ
- Kalau soal bilang "himpunan bagian sejati" → pakai 2ⁿ - 1

**2. Jangan Lupa Himpunan Kosong**
- ∅ selalu subset dari himpunan manapun
- Ini sering jadi jebakan! Kadang siswa lupa ngitung ∅

**3. Perhatikan Kata Kunci**
- "Paling sedikit" vs "tepat" vs "paling banyak"
- "Himpunan bagian" vs "himpunan bagian sejati"

**4. Kalau Bingung, Tulis Semua Himpunan Bagiannya**
- Untuk n kecil (≤ 4), lebih cepat tulis manual daripada mikir rumus
- Tapi kalau n ≥ 5, udah males banget, mending pakai rumus

**5. Cek Logika Soal**
- Kadang soal kasih pernyataan kayak "A ⊆ B, B ⊆ C, apakah C ⊆ A?"
- Jangan langsung jawab tanpa cek! (Yang ini jawabannya: BELUM TENTU)

**6. Latihan Soal dengan Himpunan Kompleks**
- Misalnya: A = {x | x bilangan prima kurang dari 20}
- Kamu harus bisa cepet bikin tabulasinya: A = {2, 3, 5, 7, 11, 13, 17, 19}
- Baru bisa ngitung himpunan bagiannya: 2⁸ = 256

---
