# SECTION 4: Statistika dan Peluang
## Topic 4.3: Himpunan

---


### Materi 4.3.6: Himpunan Bilangan

#### Hierarki Himpunan Bilangan

Dalam matematika, bilangan-bilangan dikelompokkan dalam himpunan-himpunan dengan karakteristik tertentu. Ini penting banget buat SNBT karena sering jadi "himpunan semesta" dalam soal!

**Diagram Hierarki:**

```
Bilangan Kompleks (ℂ)
    │
    ├─ Bilangan Real (ℝ)
    │     │
    │     ├─ Bilangan Rasional (ℚ)
    │     │     │
    │     │     ├─ Bilangan Bulat (ℤ)
    │     │     │     │
    │     │     │     ├─ Bilangan Cacah (W)
    │     │     │     │     │
    │     │     │     │     └─ Bilangan Asli (ℕ)
    │     │     │     │
    │     │     │     └─ Bilangan Bulat Negatif
    │     │     │
    │     │     └─ Bilangan Pecahan (bukan bulat)
    │     │
    │     └─ Bilangan Irasional (ℝ - ℚ)
    │
    └─ Bilangan Imajiner

```

#### Bilangan Asli (ℕ - Natural Numbers)

**Definisi:** Bilangan untuk menghitung objek.

**Notasi:** ℕ = {1, 2, 3, 4, 5, ...}

**Karakteristik:**
- Dimulai dari 1 (BUKAN 0!)
- Tidak ada bilangan negatif
- Tidak ada pecahan
- Tidak ada desimal

**Contoh:**
- 1, 2, 3, 100, 999 → bilangan asli ✓
- 0, -5, 1.5, ½ → BUKAN bilangan asli ✗

**Jebakan SNBT:** Banyak yang ngira 0 termasuk bilangan asli. SALAH! 0 bukan bilangan asli!

**Aplikasi:**
- Menghitung jumlah objek
- Nomor urut
- Bilangan kuantitas (tidak bisa negatif atau pecahan)

#### Bilangan Cacah (W - Whole Numbers)

**Definisi:** Bilangan asli ditambah nol.

**Notasi:** W = {0, 1, 2, 3, 4, 5, ...}

**Karakteristik:**
- Semua bilangan asli + angka 0
- Tidak ada bilangan negatif
- Tidak ada pecahan

**Hubungan dengan Bilangan Asli:**
W = ℕ ∪ {0}

**Contoh:**
- 0, 1, 2, 3, 100 → bilangan cacah ✓
- -5, 1.5, ½ → BUKAN bilangan cacah ✗

**Tips SNBT:** Kalau soal bilang "bilangan cacah kurang dari 5", jawabnya {0, 1, 2, 3, 4}, BUKAN {1, 2, 3, 4}!

#### Bilangan Bulat (ℤ - Integers)

**Definisi:** Bilangan cacah dan lawan bilangannya (negatif).

**Notasi:** ℤ = {..., -3, -2, -1, 0, 1, 2, 3, ...}

**Sub-kategori:**
- **Bilangan Bulat Positif:** ℤ⁺ = {1, 2, 3, ...} = ℕ
- **Bilangan Bulat Negatif:** ℤ⁻ = {-1, -2, -3, ...}
- **Bilangan Bulat Non-Negatif:** {0, 1, 2, 3, ...} = W

**Karakteristik:**
- Bisa positif, negatif, atau nol
- Tidak ada pecahan atau desimal

**Contoh:**
- -100, -5, 0, 3, 999 → bilangan bulat ✓
- 1.5, ½, √2 → BUKAN bilangan bulat ✗

**Sifat Penting:**
- Tertutup terhadap penjumlahan, pengurangan, dan perkalian
- TIDAK tertutup terhadap pembagian (5 ÷ 2 = 2.5, bukan bilangan bulat)

#### Bilangan Rasional (ℚ - Rational Numbers)

**Definisi:** Bilangan yang dapat dinyatakan sebagai **p/q**, dengan p dan q bilangan bulat dan q ≠ 0.

**Notasi:** ℚ = {p/q | p, q ∈ ℤ, q ≠ 0}

**Karakteristik:**
- Bisa dinyatakan sebagai pecahan
- Bisa positif, negatif, atau nol
- Desimalnya bisa berakhir atau berulang

**Contoh:**
- 1/2 = 0.5 (desimal berakhir) → rasional ✓
- 1/3 = 0.333... (desimal berulang) → rasional ✓
- 5 = 5/1 (bilangan bulat juga rasional!) → rasional ✓
- -2.75 = -11/4 → rasional ✓
- 0 = 0/1 → rasional ✓

**Jebakan SNBT:**
- Semua bilangan bulat ADALAH bilangan rasional! (karena bisa ditulis n/1)
- Desimal berulang (seperti 0.333..., 0.142857142857...) adalah rasional!

**Cara Mengubah Desimal Berulang ke Pecahan:**

Contoh: 0.333... (3 berulang)

Misalkan x = 0.333...
10x = 3.333...
10x - x = 3.333... - 0.333...
9x = 3
x = 3/9 = 1/3 ✓

#### Bilangan Irasional (ℝ - ℚ)

**Definisi:** Bilangan real yang TIDAK bisa dinyatakan sebagai p/q.

**Karakteristik:**
- Desimalnya tidak berakhir dan tidak berulang
- Tidak bisa ditulis sebagai pecahan biasa

**Contoh:**
- √2 = 1.41421356... → irasional ✓
- √3 = 1.73205080... → irasional ✓
- π = 3.14159265... → irasional ✓
- e = 2.71828182... → irasional ✓
- √5, √7, ∛2 → irasional ✓

**TAPI HATI-HATI:**
- √4 = 2 → BUKAN irasional (karena hasilnya bulat)
- √9 = 3 → BUKAN irasional
- √(1/4) = 1/2 → BUKAN irasional

**Tips SNBT:** Kalau akar dari bilangan kuadrat sempurna, itu RASIONAL!

**Sifat Penting:**
- Irasional + Irasional bisa = Rasional atau Irasional
  - √2 + (-√2) = 0 (rasional)
  - √2 + √3 (irasional)
- Rasional × Irasional (≠0) = Irasional
  - 2 × √3 = 2√3 (irasional)

#### Bilangan Real (ℝ - Real Numbers)

**Definisi:** Gabungan bilangan rasional dan irasional.

**Notasi:** ℝ = ℚ ∪ (ℝ - ℚ)

**Karakteristik:**
- Semua bilangan yang bisa dipetakan pada garis bilangan
- Mencakup semua bilangan rasional dan irasional

**Diagram Venn Bilangan Real:**

```
┌───────────────────────────────────┐
│         Bilangan Real (ℝ)         │
│                                   │
│  ┌──────────────┐  ┌────────────┐│
│  │Rasional (ℚ)  │  │ Irasional  ││
│  │              │  │            ││
│  │ ┌─────────┐  │  │  √2, √3    ││
│  │ │Bulat (ℤ)│  │  │  π, e      ││
│  │ │         │  │  │            ││
│  │ │ ┌─────┐ │  │  └────────────┘│
│  │ │ │Cacah│ │  │                │
│  │ │ │     │ │  │                │
│  │ │ │┌──┐ │ │  │                │
│  │ │ ││ℕ │ │ │  │                │
│  │ │ │└──┘ │ │  │                │
│  │ │ └─────┘ │  │                │
│  │ └─────────┘  │                │
│  └──────────────┘                │
│                                   │
└───────────────────────────────────┘
```

**Sifat-Sifat Bilangan Real:**
- Tertutup terhadap operasi +, -, ×, ÷ (kecuali ÷ 0)
- Memenuhi sifat urutan (bisa diurutkan)
- Memenuhi sifat kelengkapan (tidak ada "lubang" di garis bilangan)

#### Operasi pada Himpunan Bilangan

**1. Irisan Himpunan Bilangan:**

- ℕ ∩ ℤ = ℕ (bilangan asli juga bilangan bulat)
- ℚ ∩ (ℝ - ℚ) = ∅ (rasional dan irasional tidak berpotongan)
- ℤ ∩ ℚ = ℤ (bilangan bulat juga rasional)

**2. Gabungan Himpunan Bilangan:**

- ℕ ∪ {0} = W
- ℤ⁺ ∪ {0} ∪ ℤ⁻ = ℤ
- ℚ ∪ (ℝ - ℚ) = ℝ

**3. Selisih Himpunan Bilangan:**

- ℤ - ℕ = {..., -3, -2, -1, 0}
- ℚ - ℤ = {bilangan pecahan bukan bulat}
- ℝ - ℚ = {bilangan irasional}

#### Soal Tipe SNBT: Himpunan Bilangan

**Tipe 1: Menentukan Anggota Himpunan**

Soal: Tentukan himpunan A = {x | x bilangan asli, x² < 30}

Penyelesaian:
- x² < 30
- x < √30 ≈ 5.48
- Karena x bilangan asli: x ∈ {1, 2, 3, 4, 5}
- Cek: 5² = 25 < 30 ✓, 6² = 36 > 30 ✗
- Jawab: A = {1, 2, 3, 4, 5}

**Tipe 2: Menentukan Kardinalitas**

Soal: Berapa banyak bilangan bulat yang memenuhi -5 ≤ x < 3?

Penyelesaian:
- Bilangan bulat: {..., -5, -4, -3, -2, -1, 0, 1, 2}
- -5 ≤ x < 3 (ingat: < 3 berarti 3 tidak termasuk!)
- x ∈ {-5, -4, -3, -2, -1, 0, 1, 2}
- Jawab: 8 bilangan

**Jebakan:** Banyak yang lupa kalau 3 TIDAK termasuk karena simbolnya <, bukan ≤

**Tipe 3: Operasi Himpunan Bilangan**

Soal:
A = {x | x bilangan prima, x < 15}
B = {x | x bilangan genap, x < 15}
Tentukan A ∩ B

Penyelesaian:
- A = {2, 3, 5, 7, 11, 13}
- B = {2, 4, 6, 8, 10, 12, 14}
- A ∩ B = {2} (satu-satunya bilangan prima genap!)

**Tipe 4: Rasional vs Irasional**

Soal: Manakah yang bilangan rasional?
a) √16
b) √15
c) π
d) 0.121212... (12 berulang)

Penyelesaian:
- a) √16 = 4 → rasional ✓
- b) √15 = 3.872... → irasional ✗
- c) π = 3.14159... → irasional ✗
- d) 0.121212... → rasional ✓ (desimal berulang)

Jawab: a dan d

#### Tips & Trik SNBT untuk Himpunan Bilangan

**1. Hafalkan Hierarki**
- ℕ ⊂ W ⊂ ℤ ⊂ ℚ ⊂ ℝ
- Ini wajib hapal di luar kepala!

**2. Ingat Status Angka 0**
- 0 BUKAN bilangan asli
- 0 ADALAH bilangan cacah
- 0 ADALAH bilangan bulat
- 0 ADALAH bilangan rasional (0 = 0/1)

**3. Bilangan Bulat = Rasional**
- Semua bilangan bulat bisa ditulis sebagai n/1
- Jadi bilangan bulat ⊂ bilangan rasional

**4. Cek Akar dengan Teliti**
- √n rasional hanya jika n bilangan kuadrat sempurna
- √4, √9, √16, √25 → rasional
- √2, √3, √5, √6 → irasional

**5. Desimal Berulang = Rasional**
- 0.333..., 0.142857142857..., 0.999... → semua rasional!
- Kalau ada pola berulang, pasti rasional

**6. Perhatikan Simbol ≤ vs <**
- x < 5 → {1, 2, 3, 4}
- x ≤ 5 → {1, 2, 3, 4, 5}
- Bedanya di "sama dengan"!

**7. Latihan Konversi**
- Dari notasi pembentuk himpunan → tabulasi
- Harus cepat dan akurat!

**8. Hati-hati dengan "Bilangan Genap" dan "Bilangan Ganjil"**
- Bilangan genap: {..., -4, -2, 0, 2, 4, ...} (termasuk negatif dan 0!)
- Bilangan ganjil: {..., -3, -1, 1, 3, 5, ...}

---

**🎯 RINGKASAN SECTION 4.3: HIMPUNAN**

**Konsep Dasar:**
- Himpunan = kumpulan objek terdefinisi jelas
- 3 cara menyatakan: deskripsi, tabulasi, notasi pembentuk
- Kardinalitas: n(A) = jumlah anggota

**Himpunan Bagian:**
- A ⊆ B: A subset B
- Banyak himpunan bagian: 2ⁿ
- Banyak himpunan bagian sejati: 2ⁿ - 1

**Operasi Himpunan:**
- Irisan (∩): yang ada di kedua himpunan
- Gabungan (∪): yang ada di salah satu atau keduanya
- Selisih (-): yang di A tapi tidak di B
- Komplemen ('): yang tidak di A

**Rumus Kardinalitas:**
- 2 himpunan: n(A ∪ B) = n(A) + n(B) - n(A ∩ B)
- 3 himpunan: n(A ∪ B ∪ C) = n(A) + n(B) + n(C) - n(A ∩ B) - n(A ∩ C) - n(B ∩ C) + n(A ∩ B ∩ C)

**Diagram Venn:**
- 2 himpunan: 4 daerah
- 3 himpunan: 8 daerah
- Selalu mulai dari irisan terkecil!

**Himpunan Bilangan:**
- ℕ ⊂ W ⊂ ℤ ⊂ ℚ ⊂ ℝ
- Rasional: bisa jadi p/q
- Irasional: tidak bisa jadi p/q

**Hukum Penting:**
- De Morgan: (A ∪ B)' = A' ∩ B' dan (A ∩ B)' = A' ∪ B'
- Distributif: A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)

---

Oke, materi Topic 4.3 tentang Himpunan udah selesai! Ini adalah salah satu topik yang paling "aplikatif" dan sering banget keluar di SNBT dalam berbagai bentuk. Kuncinya: latihan soal sebanyak-banyaknya, terutama soal cerita survei! Good luck! 🚀