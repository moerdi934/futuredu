# SECTION 2: Bilangan dan Aritmatika
## Topic 2.2: Bilangan Prima dan Faktorisasi

---


## **Materi 2.2.6: Bilangan Bulat dalam Operasi Modulo**

### **Apa Itu Modulo?**

**Modulo** (disingkat "mod") adalah operasi matematika yang menghasilkan **sisa pembagian**.

Bayangin kamu punya 17 permen mau dibagi ke 5 teman:
- Setiap teman dapat: 17 ÷ 5 = 3 permen
- **Sisanya: 2 permen** (ini yang disebut modulo!)

Notasi: **17 mod 5 = 2**

**Definisi Formal:**
a mod n = r, dimana r adalah sisa pembagian a oleh n (0 ≤ r < n)

**Contoh:**
- 17 mod 5 = 2 (17 = 5×3 + **2**)
- 25 mod 7 = 4 (25 = 7×3 + **4**)
- 20 mod 4 = 0 (20 = 4×5 + **0**)
- 7 mod 10 = 7 (7 = 10×0 + **7**)

**Karakteristik Modulo:**
- Hasilnya **selalu** 0 sampai (n-1)
- Kalau a < n, maka a mod n = a
- Kalau a habis dibagi n, maka a mod n = 0

### **Cara Menghitung Modulo**

#### **Metode 1: Pembagian Langsung**

**Langkah:**
1. Bagi a dengan n
2. Ambil bagian bulat hasil bagi (buang koma)
3. Kalikan kembali dengan n
4. Kurangkan dari a

**Contoh: 37 mod 8**
- 37 ÷ 8 = 4,625... → ambil 4
- 4 × 8 = 32
- 37 - 32 = **5**
- Jadi 37 mod 8 = 5

#### **Metode 2: Pengurangan Berulang**

Kurangi terus dengan n sampai hasilnya < n

**Contoh: 37 mod 8**
- 37 - 8 = 29
- 29 - 8 = 21
- 21 - 8 = 13
- 13 - 8 = 5 (sudah < 8, STOP!)
- Jadi 37 mod 8 = 5

**Tips:** Metode ini bagus untuk bilangan kecil atau mental math.

#### **Metode 3: Dengan Rumus**

a mod n = a - n × ⌊a/n⌋

dimana ⌊a/n⌋ adalah pembulatan ke bawah

**Contoh: 37 mod 8**
- ⌊37/8⌋ = ⌊4.625⌋ = 4
- 37 mod 8 = 37 - 8×4 = 37 - 32 = **5**

### **Sifat-Sifat Operasi Modulo**

Ini yang PENTING banget untuk soal SNBT! Modulo punya sifat-sifat unik yang bikin perhitungan lebih gampang.

#### **Sifat 1: Modulo pada Penjumlahan**

**(a + b) mod n = [(a mod n) + (b mod n)] mod n**

**Contoh:**
(17 + 23) mod 5 = ?

Cara biasa: 40 mod 5 = 0

Dengan sifat:
- 17 mod 5 = 2
- 23 mod 5 = 3
- (2 + 3) mod 5 = 5 mod 5 = **0** ✓

**Keuntungan:** Bisa hitung bagian-bagian kecil dulu, terus gabung!

#### **Sifat 2: Modulo pada Pengurangan**

**(a - b) mod n = [(a mod n) - (b mod n)] mod n**

**HATI-HATI:** Kalau hasilnya negatif, tambah n sampai positif!

**Contoh:**
(13 - 8) mod 5 = ?

Cara biasa: 5 mod 5 = 0

Dengan sifat:
- 13 mod 5 = 3
- 8 mod 5 = 3
- (3 - 3) mod 5 = **0** ✓

**Contoh dengan hasil negatif:**
(7 - 10) mod 5 = ?

Cara biasa: -3... tapi modulo harus positif!
-3 + 5 = 2

Dengan sifat:
- 7 mod 5 = 2
- 10 mod 5 = 0
- (2 - 0) mod 5 = **2** ✓

#### **Sifat 3: Modulo pada Perkalian**

**(a × b) mod n = [(a mod n) × (b mod n)] mod n**

**Contoh:**
(13 × 17) mod 5 = ?

Cara biasa: 221 mod 5 = 1

Dengan sifat:
- 13 mod 5 = 3
- 17 mod 5 = 2
- (3 × 2) mod 5 = 6 mod 5 = **1** ✓

**Ini SANGAT berguna** untuk perkalian bilangan besar!

#### **Sifat 4: Modulo pada Perpangkatan**

**a^b mod n = [(a mod n)^b] mod n**

Tapi bisa dioptimalkan dengan pangkat per bagian:

**Contoh:**
2^10 mod 7 = ?

Cara biasa: 1024 mod 7 = 2 (ribet!)

Dengan sifat:
- 2^1 mod 7 = 2
- 2^2 mod 7 = 4
- 2^3 mod 7 = 8 mod 7 = 1
- 2^4 mod 7 = 2 × 1 = 2
- ...pola berulang setiap 3 pangkat!

10 = 3×3 + 1
Jadi 2^10 mod 7 = 2^1 mod 7 = **2**

**Tips:** Cari pola berulang untuk perpangkatan besar!

#### **Sifat 5: Modulo Distributif**

**(a + b) mod n = (a mod n + b mod n) mod n** sudah dijelaskan
Tapi ingat: **tidak berlaku untuk pembagian!**

#### **Sifat 6: Jika a ≡ b (mod n), maka:**
- a + c ≡ b + c (mod n)
- a × c ≡ b × c (mod n)
- a^k ≡ b^k (mod n)

**Notasi:** a ≡ b (mod n) artinya "a kongruen dengan b modulo n" atau "a mod n = b mod n"

### **Aplikasi Modulo dalam Pola Bilangan**

#### **Aplikasi 1: Menentukan Digit Terakhir**

Digit terakhir = bilangan mod 10

**Contoh:**
Digit terakhir dari 7^100 = ?

7^1 mod 10 = 7
7^2 mod 10 = 49 mod 10 = 9
7^3 mod 10 = 7 × 9 = 63 mod 10 = 3
7^4 mod 10 = 7 × 3 = 21 mod 10 = 1
7^5 mod 10 = 7 × 1 = 7 mod 10 = 7

**Pola berulang: 7, 9, 3, 1** (periode 4)

100 ÷ 4 = 25 (habis), jadi kembali ke awal siklus
Tapi karena habis, berarti posisi terakhir siklus: **1**

**Jawaban: Digit terakhir adalah 1**

#### **Aplikasi 2: Menentukan Sisa Pembagian Bilangan Besar**

**Contoh:**
Sisa pembagian 2024 oleh 7 = ?

2024 ÷ 7 = 289,14...
2024 - (7 × 289) = 2024 - 2023 = **1**

Atau dengan modulo: 2024 mod 7 = **1**

#### **Aplikasi 3: Hari dalam Seminggu**

**Contoh:**
Hari ini Senin. 100 hari lagi hari apa?

Seminggu = 7 hari

100 mod 7 = 2

Jadi 100 hari = 14 minggu + 2 hari
100 hari lagi = **Rabu**

#### **Aplikasi 4: Jam dalam Sehari**

**Contoh:**
Sekarang pukul 10:00. 50 jam lagi pukul berapa?

Sehari = 24 jam

50 mod 24 = 2

50 jam = 2 hari + 2 jam
Pukul 10:00 + 2 jam = **Pukul 12:00** (2 hari kemudian)

#### **Aplikasi 5: Pola Berulang**

**Contoh:**
Lampu berkedip dengan pola: Merah, Kuning, Hijau, Biru (berulang)
Kedipan ke-100 warna apa?

Ada 4 warna, jadi periode = 4

100 mod 4 = 0

Kalau sisa 0, berarti posisi terakhir periode: **Biru**

**Tips:** Kalau mod = 0, ambil warna/posisi terakhir!

### **Teorema Sisa dalam Konteks Modulo**

**Teorema Sisa** menyatakan:
Jika polinomial P(x) dibagi (x - a), maka sisanya = P(a)

Dalam konteks modulo:
**P(x) mod (x - a) = P(a)**

**Contoh:**
Sisa pembagian x^3 + 2x^2 - 5x + 3 oleh (x - 2) = ?

P(2) = 2^3 + 2(2)^2 - 5(2) + 3
     = 8 + 8 - 10 + 3
     = **9**

Ini sangat berguna untuk soal polinomial!

### **Jebakan-Jebakan SNBT tentang Modulo**

#### **Jebakan #1: Modulo Negatif**

Hasil modulo **HARUS** positif (0 sampai n-1)!

Contoh: -3 mod 5 = ?
**BUKAN** -3!
Tapi: -3 + 5 = **2**

Rumus: Kalau negatif, tambah n sampai positif.

#### **Jebakan #2: Lupa Apply Modulo di Setiap Step**

Untuk bilangan besar, **SELALU apply modulo** di setiap langkah perhitungan!

Contoh SALAH:
(123 × 456) mod 7 = 56088 mod 7 (ribet!)

Contoh BENAR:
- 123 mod 7 = 4
- 456 mod 7 = 1  
- (4 × 1) mod 7 = **4**

#### **Jebakan #3: Pola yang Tidak Dimulai dari Index 1**

Contoh: Pola Merah, Kuning, Hijau, Biru
Kalau ditanya "warna ke-1", itu **Merah**, bukan Kuning!

Selalu cek: indexnya mulai dari 0 atau 1?

#### **Jebakan #4: Modulo ≠ Pembagian**

17 mod 5 = 2 **BUKAN** berarti 17/5 = 2
17/5 = 3,4 (hasil bagi)
17 mod 5 = 2 (sisa bagi)

Beda konsep!

#### **Jebakan #5: Pola Periode yang Salah**

Harus hati-hati menentukan periode pola!

Contoh: 2^n mod 7
2^1 = 2, 2^2 = 4, 2^3 = 1, 2^4 = 2, ...
Periode = **3** (bukan 4!)

Cek sampai pola benar-benar berulang.

### **Tips Kilat SNBT untuk Modulo**

**1. Gunakan Sifat Distributif**
Pecah bilangan besar jadi bagian kecil, mod satu-satu, baru gabung.

**2. Cari Pola untuk Perpangkatan**
Untuk a^n mod m dengan n besar, cari pola berulangnya.

**3. Modulo ≥ 0**
Hasil modulo selalu non-negatif. Kalau dapet negatif, tambah pembaginya.

**4. Mental Math**
Untuk mod 2, 3, 5, 9, 10 → pakai aturan keterbagian!
- mod 2 → cek digit terakhir genap/ganjil
- mod 3 → cek jumlah digit
- mod 5 → cek digit terakhir 0/5
- mod 10 → ambil digit terakhir

**5. Hati-hati dengan Index**
Selalu perhatikan apakah soal mulai dari index 0 atau 1.

**6. Double Check Pola**
Pastikan pola benar-benar berulang sebelum aplikasikan ke n besar.

### **Strategi Mengerjakan Soal Modulo di SNBT**

**Step 1: IDENTIFIKASI**
Apakah soal tentang:
- Sisa pembagian? → langsung modulo
- Pola berulang? → cari periode dengan modulo
- Digit terakhir? → mod 10
- Hari/jam? → mod 7/24

**Step 2: SIMPLIFIKASI**
Gunakan sifat modulo untuk sederhanakan bilangan besar

**Step 3: CARI POLA**
Untuk perpangkatan atau pola berulang, tulis beberapa suku pertama

**Step 4: HITUNG**
Apply rumus atau pola yang sudah ketemu

**Step 5: CEK**
- Hasil modulo antara 0 sampai (n-1)?
- Masuk akal dengan konteks soal?

### **Koneksi dengan Materi Lain**

Modulo ini **sangat terkait** dengan:

**1. Keterbagian**
- a habis dibagi n ↔ a mod n = 0

**2. FPB dan KPK**
- Siklus berulang (KPK) sering diselesaikan dengan modulo

**3. Barisan dan Deret**
- Pola barisan bisa diprediksi dengan modulo

**4. Teorema Sisa**
- P(x) mod (x-a) = P(a)

**5. Bilangan Berpangkat**
- Digit terakhir a^n = (a^n) mod 10

---

## **BONUS: Mind Map dan Strategi Keseluruhan**

### **Rangkuman Topic 2.2: Bilangan Prima dan Faktorisasi**

```
BILANGAN PRIMA & FAKTORISASI
│
├─ BILANGAN PRIMA
│  ├─ Definisi: Hanya bisa dibagi 1 dan dirinya sendiri
│  ├─ Prima terkecil: 2 (satu-satunya genap)
│  ├─ 1 BUKAN prima!
│  └─ Cara cek: trial division sampai √n
│
├─ FAKTORISASI PRIMA
│  ├─ Pohon faktor (visual)
│  ├─ Pembagian berulang (sistematis)
│  ├─ Bentuk pangkat: n = p₁^a × p₂^b × ...
│  └─ Banyak faktor: (a+1)(b+1)...
│
├─ FPB & KPK
│  ├─ FPB: Faktor sama, pangkat KECIL
│  │   → untuk MEMBAGI, KELOMPOK
│  ├─ KPK: Semua faktor, pangkat BESAR
│  │   → untuk BERSAMAAN, BERULANG
│  └─ Rumus: FPB × KPK = a × b (2 bilangan)
│
├─ KETERBAGIAN
│  ├─ 2: digit terakhir genap
│  ├─ 3: jumlah digit ÷ 3
│  ├─ 4: 2 digit terakhir ÷ 4
│  ├─ 5: digit terakhir 0/5
│  ├─ 6: ÷2 DAN ÷3
│  ├─ 9: jumlah digit ÷ 9
│  └─ 11: selisih posisi ganjil-genap ÷ 11
│
└─ MODULO
   ├─ Sisa pembagian: a mod n = r
   ├─ Sifat: distributif pada +, -, ×
   ├─ Pola berulang → cari periode
   └─ Aplikasi: digit terakhir, hari, jam
```

### **Strategi Umum Mengerjakan Soal**

**1. BACA SOAL DENGAN TELITI**
- Tandai kata kunci
- Identifikasi konsep yang dipakai

**2. EKSTRAK INFORMASI**
- Bilangan apa saja yang ada?
- Apa yang ditanyakan?

**3. PILIH METODE**
- Prima? → cek sampai √n
- Faktorisasi? → pilih pohon atau pembagian
- FPB/KPK? → faktorisasi prima
- Keterbagian? → aturan cepat
- Modulo? → sifat dan pola

**4. KERJAKAN SISTEMATIS**
- Tulis langkah-langkah jelas
- Apply sifat/rumus dengan benar

**5. CEK JAWABAN**
- Apakah masuk akal?
- Sesuai dengan pertanyaan?
- Coba plug in ke soal asli

### **Red Flags (Tanda Bahaya) dalam Soal**

🚩 **"Maksimal"** tapi konteks BERULANG → KPK, bukan FPB!
🚩 **"Minimal"** tapi konteks MEMBAGI → FPB, bukan KPK!
🚩 **Bilangan besar dengan mod** → HARUS simplifikasi dulu!
🚩 **"Bilangan prima genap"** → cuma ada 1, yaitu 2!
🚩 **"1 adalah bilangan prima"** → SALAH TOTAL!
🚩 **Pola berulang index 0 vs 1** → hati-hati mulainya dari mana!
🚩 **FPB × KPK untuk 3 bilangan** → rumus TIDAK berlaku!

### **Checklist Sebelum Jawab**

✅ Sudah yakin konsep yang dipakai?
✅ Sudah cek semua digit/faktor?
✅ Sudah apply aturan dengan benar?
✅ Hasil masuk akal dan sesuai pertanyaan?
✅ Sudah cek pilihan jawaban yang jelas salah?
✅ Waktu masih cukup untuk double check?

---
