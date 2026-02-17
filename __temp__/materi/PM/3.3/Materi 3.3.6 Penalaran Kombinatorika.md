# SECTION 3: Statistika dan Probabilitas
## Topic 3.3: Peluang

---


## Materi 3.3.6: Penalaran Kombinatorika

### The Art of Counting! 🔢

Welcome to **Kombinatorika** - seni menghitung dengan cara yang smart! Di sini kita belajar menghitung **tanpa harus list satu-satu semua kemungkinan**. Bayangkan kalau harus list semua cara mengatur 10 orang dalam antrian... bisa ribuan! Kombinatorika kasih kita shortcut.

Materi ini sangat erat dengan peluang. Kenapa? Karena P(A) = n(A)/n(S), dan kombinatorika membantu kita menghitung n(A) dan n(S) dengan efisien!

### Prinsip Dasar Pencacahan

Ada dua prinsip fundamental:

**1. Prinsip Penjumlahan (OR)**

Kalau ada **m cara** untuk kejadian A dan **n cara** untuk kejadian B, dan **keduanya tidak bisa terjadi bersamaan**, maka ada **m + n cara** untuk A ATAU B terjadi.

*Contoh:*
- Ke sekolah bisa naik motor (3 motor tersedia) atau mobil (2 mobil tersedia)
- Total cara = 3 + 2 = **5 cara**

**2. Prinsip Perkalian (AND)**

Kalau kejadian A bisa terjadi **m cara** dan untuk setiap cara A, kejadian B bisa terjadi **n cara**, maka A DAN B bisa terjadi **m × n cara**.

*Contoh:*
- Pilih baju (5 pilihan) dan celana (3 pilihan)
- Total outfit = 5 × 3 = **15 kombinasi**

**Kapan pakai yang mana?**

**TAMBAH** kalau pilihan **alternatif** (ini ATAU itu)
**KALI** kalau pilihan **berurutan** (ini LALU itu)

### Faktorial: Building Block Kombinatorika

**Faktorial (n!)** = perkalian semua bilangan bulat positif dari 1 sampai n.

$$n! = n \times (n-1) \times (n-2) \times ... \times 2 \times 1$$

**Contoh:**
- 3! = 3 × 2 × 1 = 6
- 4! = 4 × 3 × 2× 1 = 24
- 5! = 5 × 4 × 3 × 2 × 1 = 120
- 0! = 1 (by definition!)

**Sifat penting:**
$$n! = n \times (n-1)!$$

Ini berguna untuk simplifikasi:
$$\frac{10!}{8!} = \frac{10 \times 9 \times 8!}{8!} = 10 \times 9 = 90$$

**Growth rate faktorial:**
Faktorial tumbuh SANGAT cepat!
- 10! = 3.628.800
- 20! ≈ 2,4 × 10¹⁸

### Permutasi: Urutan Itu Penting!

**Permutasi** = pengaturan objek di mana **urutan itu penting**.

**Permutasi n objek:**

Berapa cara mengatur n objek berbeda?

$$P(n) = n!$$

*Contoh:*
Berapa cara mengatur 4 orang (A, B, C, D) dalam antrian?
= 4! = 24 cara

**Permutasi r dari n objek:**

Berapa cara memilih dan mengatur r objek dari n objek?

$$P(n,r) = \frac{n!}{(n-r)!}$$

*Notasi lain: nPr, P^n_r*

*Contoh:*
Dari 5 orang, pilih 3 untuk juara 1, 2, 3 (urutan penting!).

P(5,3) = 5!/(5-3)! = 5!/2! = (5×4×3×2!)/ 2! = 5×4×3 = **60 cara**

**Cara pikir intuitif:**
- Posisi 1: 5 pilihan
- Posisi 2: 4 pilihan (1 sudah dipilih)
- Posisi 3: 3 pilihan
- Total: 5×4×3 = 60

### Kombinasi: Urutan Nggak Penting!

**Kombinasi** = pemilihan objek di mana **urutan TIDAK penting**.

**Kombinasi r dari n objek:**

Berapa cara memilih r objek dari n objek (tidak peduli urutan)?

$$C(n,r) = \frac{n!}{r!(n-r)!}$$

*Notasi lain: nCr, C^n_r, ${n \choose r}$*

*Contoh:*
Dari 5 orang, pilih 3 untuk jadi tim (urutan tidak penting).

C(5,3) = 5!/(3!×2!) = (5×4×3!)/(3!×2×1) = (5×4)/2 = **10 cara**

**Hubungan Permutasi dan Kombinasi:**

$$P(n,r) = r! \times C(n,r)$$

Kenapa? Karena setiap kombinasi bisa diatur r! cara.

### Permutasi vs Kombinasi: Kapan Pakai Apa?

**Gunakan PERMUTASI kalau:**
- Urutan penting!
- Kata kunci: "mengatur", "menyusun", "posisi", "ranking", "juara 1-2-3"
- ABC ≠ BAC ≠ CAB

**Gunakan KOMBINASI kalau:**
- Urutan tidak penting!
- Kata kunci: "memilih", "mengambil", "tim", "panitia", "kelompok"
- {A,B,C} = {B,A,C} = {C,B,A}

**Contoh Perbedaan:**

**Situasi 1:** Pilih ketua, wakil, sekretaris dari 10 orang
→ **Permutasi** P(10,3) = 720 (urutan = jabatan berbeda!)

**Situasi 2:** Pilih 3 orang dari 10 untuk jadi panitia
→ **Kombinasi** C(10,3) = 120 (urutan tidak penting!)

### Kombinasi dengan Pembatas/Batasan

Soal kombinatorika sering ada batasan tertentu. Strategy: gunakan **prinsip inklusi-eksklusi** atau **pisahkan kasus**.

**Tipe 1: Harus ada/tidak boleh ada tertentu**

*Contoh:*
Dari 8 orang (3 cewek, 5 cowok), pilih 4 orang dengan **minimal 2 cewek**.

**Cara 1: Pisah kasus**
- 2 cewek, 2 cowok: C(3,2) × C(5,2) = 3 × 10 = 30
- 3 cewek, 1 cowok: C(3,3) × C(5,1) = 1 × 5 = 5
- Total: 30 + 5 = **35 cara**

**Cara 2: Komplemen**
- Total tanpa batasan: C(8,4) = 70
- Kurang dari 2 cewek (0 atau 1 cewek):
  - 0 cewek: C(3,0) × C(5,4) = 1 × 5 = 5
  - 1 cewek: C(3,1) × C(5,3) = 3 × 10 = 30
  - Subtotal: 35
- Minimal 2 cewek: 70 - 35 = **35 cara** ✓

**Tipe 2: Objek tertentu harus/tidak boleh berdampingan**

*Contoh:*
Berapa cara mengatur 5 orang (A,B,C,D,E) dalam barisan, dengan **A dan B harus berdampingan**?

**Strategi: Anggap AB sebagai 1 unit**
- Perlakukan AB sebagai satu kesatuan: {AB, C, D, E} = 4 objek
- Cara mengatur 4 objek: 4! = 24
- Tapi A dan B bisa tukar posisi (AB atau BA): × 2
- Total: 24 × 2 = **48 cara**

*Contoh kebalikan:*
A dan B **TIDAK boleh** berdampingan?

- Total tanpa batasan: 5! = 120
- A-B berdampingan: 48 (dari atas)
- A-B tidak berdampingan: 120 - 48 = **72 cara**

**Tipe 3: Objek identik (sama)**

Kalau ada objek yang sama, dibagi dengan faktorial banyaknya kembar!

*Contoh:*
Berapa anagram dari kata "MATEMATIKA"?

M: 2, A: 3, T: 2, E: 1, I: 1, K: 1
Total: 10 huruf

Kalau semua beda: 10!
Tapi ada yang sama, jadi:

$$\frac{10!}{2! \times 3! \times 2!} = \frac{3.628.800}{2 \times 6 \times 2} = \frac{3.628.800}{24} = 151.200$$

### Distribusi Objek ke Kelompok

**Tipe 1: Membagi n objek ke k kelompok berbeda**

*Contoh:*
Bagi 6 orang ke 3 tim (Tim A, B, C), masing-masing 2 orang.

= C(6,2) × C(4,2) × C(2,2)
= 15 × 6 × 1
= **90 cara**

**Tipe 2: Membagi n objek ke k kelompok identik**

Kalau kelompoknya tidak dibedakan (tidak ada label Tim A, B, C):

= [C(6,2) × C(4,2) × C(2,2)] / 3!
= 90 / 6
= **15 cara**

Dibagi 3! karena ada 3! cara mengatur 3 kelompok yang hasilnya sama.

### Aplikasi Kombinatorika dalam Peluang

Ini kenapa kombinatorika penting untuk peluang!

**Template:**
$$P(A) = \frac{\text{banyak cara kejadian A}}{\text{total semua cara}}$$

*Contoh 1:*
Dari 52 kartu, ambil 5 kartu. Peluang dapat 3 As?

- Total cara ambil 5: C(52,5)
- Cara dapat 3 As:
  - Pilih 3 dari 4 As: C(4,3)
  - Pilih 2 dari 48 non-As: C(48,2)
  - Total: C(4,3) × C(48,2)

$$P = \frac{C(4,3) \times C(48,2)}{C(52,5)} = \frac{4 \times 1128}{2.598.960} = \frac{4512}{2.598.960} \approx 0,00174$$

*Contoh 2:*
Dari 10 bola (6 merah, 4 biru), ambil 4. Peluang dapat 2 merah dan 2 biru?

$$P = \frac{C(6,2) \times C(4,2)}{C(10,4)} = \frac{15 \times 6}{210} = \frac{90}{210} = \frac{3}{7}$$

### Jebakan Kombinatorika di SNBT! ⚠️

**JEBAKAN 1: Salah pilih permutasi vs kombinasi**

Cek: apakah urutan penting?

❌ SALAH: Pilih 3 panitia dari 10 pakai P(10,3)
✅ BENAR: Pakai C(10,3) karena urutan tidak penting!

**JEBAKAN 2: Lupa faktor pembatas**

Baca soal teliti! Ada syarat "minimal", "maksimal", "harus ada"?

**JEBAKAN 3: Double counting**

Pastikan tidak menghitung kemungkinan yang sama 2 kali!

**JEBAKAN 4: Lupa objek identik**

Kalau ada objek sama, HARUS dibagi faktorialnya!

**JEBAKAN 5: Salah hitung faktorial**

0! = 1, bukan 0!
n!/n! = 1, bukan 0!

### Tips Strategis SNBT

**1. Identifikasi jenis soal:**
- Mengatur/menyusun → Permutasi
- Memilih/mengambil → Kombinasi
- Ada batasan? → Pisah kasus atau komplemen

**2. Gambar diagram kalau perlu**
Visualisasi membantu!

**3. Cek dengan contoh kecil**
Kalau ragu, coba n kecil dan hitung manual untuk cek konsep.

**4. Simplifikasi faktorial sebelum hitung**
Jangan langsung kalkulator! Coret yang bisa dicoret dulu.

$$\frac{100!}{98!} = 100 \times 99 = 9900$$

Lebih gampang dari hitung 100! terus bagi 98!

**5. Gunakan sifat C(n,r) = C(n,n-r)**
C(50,48) = C(50,2) = 1225 (jauh lebih mudah!)

### Rumus-Rumus Kombinasi Penting

**Sifat dasar:**
- C(n,0) = 1
- C(n,1) = n
- C(n,n) = 1
- C(n,r) = C(n,n-r)

**Pascal's Triangle:**
$$C(n,r) = C(n-1,r-1) + C(n-1,r)$$

```
        1
       1 1
      1 2 1
     1 3 3 1
    1 4 6 4 1
```

**Binomial Theorem (bonus!):**
$$(a+b)^n = \sum_{r=0}^{n} C(n,r) \cdot a^{n-r} \cdot b^r$$

Berguna untuk ekspansi!

### Quick Reference

**Prinsip Pencacahan:**
- Penjumlahan: OR (alternatif)
- Perkalian: AND (berurutan)

**Permutasi:**
- n objek: n!
- r dari n: P(n,r) = n!/(n-r)!

**Kombinasi:**
- r dari n: C(n,r) = n!/[r!(n-r)!]

**Hubungan:**
- P(n,r) = r! × C(n,r)

**Objek identik:**
- Bagi dengan faktorial kembar!

### Rangkuman: Must Remember!

1. **Permutasi = urutan penting, Kombinasi = urutan tidak penting**
2. **P(n,r) = n!/(n-r)!** untuk mengatur r dari n objek
3. **C(n,r) = n!/[r!(n-r)!]** untuk memilih r dari n objek
4. **Prinsip perkalian** untuk kejadian berurutan (AND)
5. **Prinsip penjumlahan** untuk kejadian alternatif (OR)
6. **Komplemen powerful** untuk batasan "minimal"/"maksimal"
7. **Objek identik? Bagi dengan faktorialnya!**
8. **Kombinatorika + Peluang: P(A) = n(A)/n(S)**, hitung n(A) dan n(S) pakai kombinatorika

---

Kombinatorika adalah senjata rahasia untuk peluang! Dengan menguasai ini, kamu bisa hitung peluang kejadian kompleks dengan cepat dan akurat. Practice makes perfect! 🎯

---
