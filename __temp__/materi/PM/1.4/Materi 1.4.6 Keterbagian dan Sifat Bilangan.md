# SECTION 1: Aljabar
## Topic 1.4: Urutan dan Operasi Bilangan

---


## **Materi 1.4.6: Keterbagian dan Sifat Bilangan**

### Keterbagian: The Hidden Patterns

Keterbagian itu kayak "kode rahasia" bilangan. Ada pola-pola tertentu yang bikin kita bisa langsung tahu apakah suatu bilangan habis dibagi bilangan lain **tanpa harus bagi beneran**!

### Aturan Keterbagian: Cheat Codes Matematika

**Keterbagian 2:**
Bilangan genap (angka terakhir 0, 2, 4, 6, 8)

Contoh: 1234 habis dibagi 2 karena angka terakhirnya 4

**Keterbagian 3:**
Jumlah semua digitnya habis dibagi 3

Contoh: 1234
- 1 + 2 + 3 + 4 = 10 (tidak habis dibagi 3)
- Jadi 1234 TIDAK habis dibagi 3

Contoh: 12345
- 1 + 2 + 3 + 4 + 5 = 15 (habis dibagi 3)
- Jadi 12345 habis dibagi 3 ✓

**Keterbagian 4:**
Dua angka terakhir habis dibagi 4

Contoh: 1236
- 36 ÷ 4 = 9 ✓
- Jadi 1236 habis dibagi 4

**Keterbagian 5:**
Angka terakhir 0 atau 5

Contoh: 1235, 1240 habis dibagi 5

**Keterbagian 6:**
Habis dibagi 2 DAN 3 sekaligus

Contoh: 1236
- Genap? Ya ✓
- Jumlah digit (1+2+3+6=12) habis dibagi 3? Ya ✓
- Jadi habis dibagi 6 ✓

**Keterbagian 7:**
Ini agak tricky! Ada rumusnya tapi jarang dipakai di SNBT. Biasanya langsung bagi aja kalau ketemu soal.

**Keterbagian 8:**
Tiga angka terakhir habis dibagi 8

Contoh: 12416
- 416 ÷ 8 = 52 ✓
- Jadi habis dibagi 8

**Keterbagian 9:**
Jumlah semua digitnya habis dibagi 9

Contoh: 12345
- 1 + 2 + 3 + 4 + 5 = 15 (tidak habis dibagi 9)
- Jadi TIDAK habis dibagi 9

Contoh: 1134
- 1 + 1 + 3 + 4 = 9 ✓
- Jadi habis dibagi 9

**Keterbagian 10:**
Angka terakhir 0

Gampang banget kan?

**Keterbagian 11:**
Selisih jumlah digit posisi ganjil dan genap habis dibagi 11

Contoh: 1331
- Posisi ganjil (dari kanan): 1 + 3 = 4
- Posisi genap: 3 + 1 = 4
- Selisih: |4 - 4| = 0 (habis dibagi 11) ✓

**Keterbagian 12:**
Habis dibagi 3 DAN 4 sekaligus

### Bilangan Prima: The Special Ones

**Definisi:** Bilangan bulat > 1 yang hanya punya 2 faktor: 1 dan dirinya sendiri

**Bilangan Prima sampai 100:**
2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97

**Fun facts:**
- 2 adalah satu-satunya bilangan prima genap!
- 1 BUKAN bilangan prima (cuma punya 1 faktor)
- 0 BUKAN bilangan prima

**Cara Cek Apakah Bilangan Prima:**

1. Kalau genap (kecuali 2) → pasti bukan prima
2. Kalau berakhiran 5 (kecuali 5) → pasti bukan prima
3. Kalau jumlah digit habis dibagi 3 (kecuali 3) → pasti bukan prima
4. Cek apakah habis dibagi bilangan prima sampai √n

Contoh: Apakah 97 prima?
- √97 ≈ 9,8
- Cek keterbagian dengan prima ≤ 9,8: 2, 3, 5, 7
- 97 ganjil (bukan 2)
- 9+7=16 (bukan kelipatan 3)
- Tidak berakhir 0 atau 5 (bukan 5)
- 97 ÷ 7 = 13,86... (tidak habis)
- Jadi 97 adalah prima ✓

### Bilangan Komposit

**Definisi:** Bilangan bulat > 1 yang BUKAN prima (punya lebih dari 2 faktor)

Contoh: 4, 6, 8, 9, 10, 12, 14, 15, ...

**Karakteristik:**
- Bisa difaktorkan jadi perkalian bilangan selain 1 dan dirinya
- Punya minimal 3 faktor

### FPB (Faktor Persekutuan Terbesar)

**Definisi:** Faktor terbesar yang membagi habis dua bilangan atau lebih

**Cara 1: Faktorisasi Prima**

Cari FPB dari 24 dan 36:
- 24 = 2³ × 3
- 36 = 2² × 3²
- FPB = 2² × 3 = 12 (ambil pangkat terkecil dari setiap faktor prima yang sama)

**Cara 2: Metode Pembagian Berulang (Euclid)**

FPB(24, 36):
- 36 = 24 × 1 + 12
- 24 = 12 × 2 + 0
- FPB = 12 (pembagi terakhir yang nggak sisa)

**Aplikasi FPB:**
- Membagi sesuatu ke kelompok terbesar yang sama
- Menyederhanakan pecahan

Contoh: Kamu punya 24 apel dan 36 jeruk, mau dibagi ke kelompok-kelompok dengan jumlah buah yang sama di setiap kelompok. Maksimal berapa kelompok?
- FPB(24, 36) = 12
- Jadi maksimal 12 kelompok!

### KPK (Kelipatan Persekutuan Terkecil)

**Definisi:** Kelipatan terkecil yang habis dibagi oleh dua bilangan atau lebih

**Cara 1: Faktorisasi Prima**

Cari KPK dari 24 dan 36:
- 24 = 2³ × 3
- 36 = 2² × 3²
- KPK = 2³ × 3² = 72 (ambil pangkat terbesar dari setiap faktor prima)

**Cara 2: Pakai FPB**

KPK(a, b) = (a × b) ÷ FPB(a, b)

KPK(24, 36) = (24 × 36) ÷ 12 = 864 ÷ 12 = 72

**Aplikasi KPK:**
- Mencari kapan dua kejadian berulang terjadi bersamaan
- Menyamakan penyebut pecahan

Contoh: Bus A lewat tiap 24 menit, Bus B tiap 36 menit. Kalau sekarang berangkat bareng, kapan lagi mereka berangkat bareng?
- KPK(24, 36) = 72 menit = 1 jam 12 menit lagi

### Hubungan FPB dan KPK

**Rumus penting:**
FPB(a,b) × KPK(a,b) = a × b

Ini bisa jadi shortcut kalau sudah tahu salah satunya!

### Pola dalam Bilangan Prima

**1. Twin Primes (Prima Kembar)**
Dua prima yang selisihnya 2:
(3,5), (5,7), (11,13), (17,19), (29,31)...

**2. Goldbach Conjecture**
Setiap bilangan genap > 2 bisa ditulis sebagai jumlah dua prima
- 4 = 2 + 2
- 6 = 3 + 3
- 8 = 3 + 5
- 10 = 3 + 7 = 5 + 5

**3. Prime Gap**
Jarak antara prima berturutan makin lebar seiring bilangan membesar

### Teorema Dasar Aritmatika

**Setiap bilangan bulat > 1 bisa difaktorkan secara UNIK menjadi perkalian bilangan prima**

Contoh:
- 12 = 2² × 3 (ini satu-satunya cara!)
- 100 = 2² × 5²
- 1001 = 7 × 11 × 13

**Aplikasi:** Memudahkan cari FPB dan KPK

### Penalaran Keterbagian dalam Soal SNBT

**Tipe 1: Bilangan yang Habis Dibagi Banyak Angka**

> Cari bilangan terkecil yang habis dibagi 2, 3, 4, 5, dan 6

Jawab: Cari KPK(2, 3, 4, 5, 6)
- 2 = 2
- 3 = 3
- 4 = 2²
- 5 = 5
- 6 = 2 × 3
- KPK = 2² × 3 × 5 = 60

**Tipe 2: Digit Terakhir**

> Berapa angka terakhir dari 3²⁰²⁵?

Lihat pola:
- 3¹ = 3
- 3² = 9
- 3³ = 27 → angka terakhir 7
- 3⁴ = 81 → angka terakhir 1
- 3⁵ = 243 → angka terakhir 3 (pola berulang!)

Polanya: 3, 9, 7, 1, 3, 9, 7, 1, ... (periode 4)

2025 ÷ 4 = 506 sisa 1

Jadi angka terakhir = sama dengan 3¹ = 3

**Tipe 3: Banyaknya Faktor**

> Berapa banyak faktor dari 36?

36 = 2² × 3²

Rumus: Kalau n = p₁^a × p₂^b × ..., maka banyak faktor = (a+1)(b+1)...

Banyak faktor 36 = (2+1)(2+1) = 3 × 3 = 9

Faktornya: 1, 2, 3, 4, 6, 9, 12, 18, 36 ✓

### Tips Jitu Keterbagian di SNBT

**🎯 Tip #1: Hapal Aturan Keterbagian 2, 3, 4, 5, 6, 9**
Ini yang paling sering keluar!

**🎯 Tip #2: Faktorisasi Prima adalah Kunci**
Kalau ketemu soal FPB/KPK, langsung pikirkan faktorisasi prima!

**🎯 Tip #3: Cari Pola untuk Bilangan Besar**
Kalau disuruh cari digit terakhir dari 7¹⁰⁰⁰, cari polanya!

**🎯 Tip #4: Gunakan Rumus Banyak Faktor**
Jangan hitung satu-satu kalau bilangan gede!

**🎯 Tip #5: Prima < 100 Harusnya Familiar**
Minimal kenal: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47

---

## **PENUTUP SECTION 1 TOPIC 4: Urutan dan Operasi Bilangan**

Selamat! Kamu baru aja menyelesaikan salah satu topik paling fundamental dalam Penalaran Matematika SNBT. Materi ini adalah **fondasi** yang akan kamu pakai terus-terusan di topik lain.

**Rangkuman Singkat:**

✅ **Materi 1.4.1** - Urutan bilangan: bulat, pecahan, desimal, dan sistem bilangan real
✅ **Materi 1.4.2** - Operasi bilangan bulat dengan aturan tanda dan PEMDAS
✅ **Materi 1.4.3** - Operasi pecahan dan desimal dengan konversi antar bentuk
✅ **Materi 1.4.4** - Bilangan berpangkat dengan sifat-sifatnya
✅ **Materi 1.4.5** - Akar dan estimasi dengan rasionalisasi
✅ **Materi 1.4.6** - Keterbagian, bilangan prima, FPB, dan KPK

**Skill yang Sudah Kamu Kuasai:**
- Mengurutkan berbagai bentuk bilangan dengan cepat
- Mengoperasikan bilangan bulat, pecahan, dan desimal
- Menyederhanakan ekspresi berpangkat dan akar
- Mengenali pola keterbagian dan faktorisasi

**Next Step:**
Setelah menguasai operasi dasar ini, kamu siap masuk ke materi-materi yang lebih advanced seperti pola bilangan, aljabar, dan aplikasinya dalam masalah kontekstual!

**Motivasi Akhir:**
Ingat, matematika itu bukan tentang menghafal rumus, tapi tentang **memahami pola dan logika**. Semakin banyak latihan, semakin natural penalaran matematismu. Keep practicing, dan jangan takut salah—setiap kesalahan adalah pelajaran berharga!

**Good luck untuk SNBT-mu! 🚀**