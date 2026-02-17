# SECTION 4: Statistika dan Peluang
## Topic 4.3: Himpunan

---


### Materi 4.3.3: Operasi Himpunan

#### Irisan Himpunan (Intersection / ∩)

Oke, sekarang kita mulai "main-main" dengan himpunan! Operasi pertama: **irisan**.

**Definisi:**
**Irisan** dua himpunan A dan B, ditulis **A ∩ B**, adalah himpunan yang anggotanya ada di A **DAN** ada di B.

Keyword-nya: **DAN** (both)

**Notasi:**
A ∩ B = {x | x ∈ A **dan** x ∈ B}

**Contoh:**
- A = {1, 2, 3, 4, 5}
- B = {3, 4, 5, 6, 7}
- A ∩ B = {3, 4, 5} ← yang ada di keduanya

**Contoh Aplikasi:**
- A = {siswa yang suka matematika}
- B = {siswa yang suka fisika}
- A ∩ B = {siswa yang suka matematika DAN fisika}

**Sifat-Sifat Irisan:**

1. **Komutatif:** A ∩ B = B ∩ A
   - Urutan nggak penting, hasilnya sama

2. **Asosiatif:** (A ∩ B) ∩ C = A ∩ (B ∩ C)
   - Boleh ngerjain yang mana duluan

3. **Identitas:** A ∩ S = A (S = himpunan semesta)
   - Iriskan sama himpunan semesta ya tetap A

4. **Dengan Himpunan Kosong:** A ∩ ∅ = ∅
   - Iriskan sama himpunan kosong ya kosong juga

5. **Idempoten:** A ∩ A = A
   - Iriskan sama diri sendiri ya tetap diri sendiri

**Jebakan SNBT:**
- Kalau A dan B nggak punya anggota yang sama, A ∩ B = ∅
- Himpunan kayak gini disebut **disjoint** (saling lepas)

#### Gabungan Himpunan (Union / ∪)

Operasi kedua: **gabungan** atau **union**.

**Definisi:**
**Gabungan** dua himpunan A dan B, ditulis **A ∪ B**, adalah himpunan yang anggotanya ada di A **ATAU** ada di B (atau keduanya).

Keyword-nya: **ATAU** (either or both)

**Notasi:**
A ∪ B = {x | x ∈ A **atau** x ∈ B}

**Contoh:**
- A = {1, 2, 3, 4, 5}
- B = {3, 4, 5, 6, 7}
- A ∪ B = {1, 2, 3, 4, 5, 6, 7} ← semua yang ada di A atau B (tanpa duplikasi!)

**Contoh Aplikasi:**
- A = {siswa yang ikut PMR}
- B = {siswa yang ikut Paskibra}
- A ∪ B = {siswa yang ikut PMR ATAU Paskibra (atau keduanya)}

**Sifat-Sifat Gabungan:**

1. **Komutatif:** A ∪ B = B ∪ A

2. **Asosiatif:** (A ∪ B) ∪ C = A ∪ (B ∪ C)

3. **Identitas:** A ∪ ∅ = A
   - Gabung sama himpunan kosong ya tetap A

4. **Dengan Himpunan Semesta:** A ∪ S = S
   - Gabung sama himpunan semesta ya jadi himpunan semesta

5. **Idempoten:** A ∪ A = A

**Tips SNBT:**
- Ingat! Dalam gabungan, anggota yang sama cuma ditulis SEKALI
- {1, 2, 3} ∪ {2, 3, 4} = {1, 2, 3, 4}, BUKAN {1, 2, 2, 3, 3, 4}

#### Selisih Himpunan (Difference / -)

Operasi ketiga: **selisih** atau **difference**.

**Definisi:**
**Selisih** A dan B, ditulis **A - B** atau **A \ B**, adalah himpunan yang anggotanya ada di A tapi **TIDAK** ada di B.

Keyword-nya: "yang di A tapi nggak di B"

**Notasi:**
A - B = {x | x ∈ A **dan** x ∉ B}

**Contoh:**
- A = {1, 2, 3, 4, 5}
- B = {3, 4, 5, 6, 7}
- A - B = {1, 2} ← yang ada di A tapi nggak ada di B
- B - A = {6, 7} ← yang ada di B tapi nggak ada di A

**Perhatikan:**
- A - B ≠ B - A (TIDAK komutatif!)
- Ini beda sama irisan dan gabungan yang komutatif

**Contoh Aplikasi:**
- A = {semua siswa kelas 12}
- B = {siswa yang sudah diterima SNBP}
- A - B = {siswa yang belum diterima SNBP}

**Sifat-Sifat Selisih:**

1. **A - ∅ = A**
   - Ngurangin himpunan kosong ya tetap A

2. **∅ - A = ∅**
   - Himpunan kosong dikurangin apa aja ya tetap kosong

3. **A - A = ∅**
   - Selisih dengan dirinya sendiri ya kosong

4. **A - B ≠ B - A** (kecuali A = B = ∅)

#### Komplemen Himpunan (Complement / A' atau Aᶜ)

Operasi keempat: **komplemen**.

**Definisi:**
**Komplemen** dari himpunan A terhadap himpunan semesta S, ditulis **A'** atau **Aᶜ**, adalah himpunan yang anggotanya ada di S tapi **TIDAK** ada di A.

Sederhananya: komplemen A = S - A

**Notasi:**
A' = {x | x ∈ S **dan** x ∉ A}

**Contoh:**
- S = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
- A = {2, 4, 6, 8, 10}
- A' = {1, 3, 5, 7, 9} ← yang di S tapi nggak di A

**Contoh Aplikasi:**
- S = {semua siswa kelas 12-A}
- A = {siswa yang suka matematika}
- A' = {siswa yang TIDAK suka matematika}

**Sifat-Sifat Komplemen:**

1. **(A')' = A**
   - Komplemen dari komplemen ya balik lagi ke A

2. **A ∪ A' = S**
   - A gabung komplemennya = himpunan semesta

3. **A ∩ A' = ∅**
   - A irisan komplemennya = himpunan kosong

4. **S' = ∅**
   - Komplemen himpunan semesta = himpunan kosong

5. **∅' = S**
   - Komplemen himpunan kosong = himpunan semesta

**Jebakan SNBT:**
- Komplemen itu relatif terhadap himpunan semesta!
- Kalau himpunan semestanya beda, komplemennya juga beda
- Contoh:
  - S₁ = {1, 2, 3, 4, 5}, A = {2, 4} → A' = {1, 3, 5}
  - S₂ = {1, 2, 3, 4, 5, 6, 7}, A = {2, 4} → A' = {1, 3, 5, 6, 7}

#### Hukum De Morgan

Ini aturan super penting yang sering banget keluar di SNBT!

**Hukum De Morgan:**

1. **(A ∪ B)' = A' ∩ B'**
   - Komplemen dari gabungan = irisan dari komplemen

2. **(A ∩ B)' = A' ∪ B'**
   - Komplemen dari irisan = gabungan dari komplemen

**Contoh Pembuktian:**
S = {1, 2, 3, 4, 5, 6, 7, 8}
A = {1, 2, 3, 4}
B = {3, 4, 5, 6}

**Cek Hukum 1:**
- A ∪ B = {1, 2, 3, 4, 5, 6}
- (A ∪ B)' = {7, 8}

- A' = {5, 6, 7, 8}
- B' = {1, 2, 7, 8}
- A' ∩ B' = {7, 8} ✓ (sama!)

**Cek Hukum 2:**
- A ∩ B = {3, 4}
- (A ∩ B)' = {1, 2, 5, 6, 7, 8}

- A' ∪ B' = {5, 6, 7, 8} ∪ {1, 2, 7, 8} = {1, 2, 5, 6, 7, 8} ✓ (sama!)

**Aplikasi dalam Bahasa:**
- "Bukan (suka matematika ATAU suka fisika)" = "(Tidak suka matematika) DAN (Tidak suka fisika)"
- "Bukan (suka matematika DAN suka fisika)" = "(Tidak suka matematika) ATAU (Tidak suka fisika)"

#### Sifat-Sifat Distributif

**Distributif Irisan terhadap Gabungan:**
A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)

**Distributif Gabungan terhadap Irisan:**
A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C)

**Tips SNBT:** Ini mirip kayak a × (b + c) = ab + ac dalam aljabar!

#### Tips & Trik SNBT untuk Operasi Himpunan

**1. Pahami Makna Kata "DAN" dan "ATAU"**
- DAN → irisan (∩)
- ATAU → gabungan (∪)
- TIDAK → komplemen (')

**2. Buat Tabel untuk Soal Kompleks**

Misal: A = {1, 2, 3, 4}, B = {3, 4, 5, 6}, C = {4, 5, 6, 7}

| Operasi | Hasil |
|---------|-------|
| A ∩ B | {3, 4} |
| B ∩ C | {4, 5, 6} |
| A ∩ B ∩ C | {4} |
| A ∪ B | {1, 2, 3, 4, 5, 6} |
| (A ∪ B) ∩ C | {4, 5, 6} |

**3. Manfaatkan Hukum De Morgan**
- Kalau ada soal "(A ∪ B)' dengan n(A) dan n(B) diketahui"
- Ubah dulu pakai De Morgan: (A ∪ B)' = A' ∩ B'
- Kadang lebih gampang ngerjainnya

**4. Komplemen itu Relatif!**
- Selalu cek: apa himpunan semestanya?
- Kalau nggak dikasih, coba tentuin dari konteks soal

**5. Latihan Visualisasi dengan Diagram Venn**
- Buat lingkaran buat tiap himpunan
- Arsir daerah yang diminta
- Ini bantu banget kalau soalnya kompleks!

**6. Ingat Urutan Operasi**
- Biasanya: kurung dulu, baru irisan, baru gabungan
- Tapi kalau ada simbol komplemen, itu prioritasnya tinggi!

**7. Cek Jawaban dengan Contoh Sederhana**
- Bikin himpunan kecil (3-4 anggota)
- Test rumus/konsep yang ditanya
- Kalau konsepnya bener, hasilnya harus konsisten!

---
