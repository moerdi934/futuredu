# SECTION 1: Aljabar dan Persamaan
## Topic 1.4: Fungsi Eksponen dan Logaritma

---


## **Materi 1.4.6: Persamaan Logaritma**

### Solving the Logarithmic Puzzle! 🎯

Kalau di materi sebelumnya kamu udah master sifat-sifat logaritma, sekarang saatnya kamu pakai semua senjata itu untuk menyelesaikan **persamaan logaritma**—persamaan yang mengandung variabel di dalam logaritma.

Persamaan logaritma itu kayak puzzle: kamu dikasih persamaan dengan log, dan tugasmu adalah mencari nilai x yang memenuhi. Tapi hati-hati, ada aturan main khusus yang WAJIB kamu ikuti!

---

### **Prinsip Dasar: Syarat Penyelesaian**

Sebelum mulai ngerjain persamaan logaritma, INGAT BAIK-BAIK syarat ini:

**SYARAT LOGARITMA:**
1. **Basis harus positif dan ≠ 1:** a > 0, a ≠ 1
2. **Numerus harus positif:** b > 0
3. **Semua ekspresi di dalam log harus > 0**

Jadi, kalau kamu dapat x = -5 tapi ternyata bikin numerus jadi negatif, maka x = -5 **BUKAN** penyelesaian yang valid!

**🎯 Jebakan SNBT:** Ini adalah jebakan PALING FAVORIT! Soal sengaja ngasih jawaban yang secara aljabar benar, tapi melanggar syarat logaritma. ALWAYS check syarat di akhir!

---

### **Tipe 1: Persamaan Logaritma Bentuk ᵃlog f(x) = ᵃlog g(x)**

Ini adalah bentuk paling dasar.

**Prinsip:** Jika basis sudah sama, maka **f(x) = g(x)**

**TAPI** jangan lupa check syarat: f(x) > 0 dan g(x) > 0

**Contoh Bacaan:**

**²log (x + 3) = ²log (2x - 1)**

Langkah 1: Basis sudah sama, samakan numerus
- x + 3 = 2x - 1

Langkah 2: Selesaikan persamaan
- 3 + 1 = 2x - x
- 4 = x
- **x = 4**

Langkah 3: CHECK SYARAT!
- x + 3 = 4 + 3 = 7 > 0 ✓
- 2x - 1 = 2(4) - 1 = 7 > 0 ✓

**Himpunan penyelesaian: {4}**

---

**Contoh Bacaan 2:**

**³log (x² - 1) = ³log (3x + 3)**

Langkah 1: Samakan numerus
- x² - 1 = 3x + 3

Langkah 2: Selesaikan
- x² - 3x - 4 = 0
- (x - 4)(x + 1) = 0
- x = 4 atau x = -1

Langkah 3: CHECK SYARAT!

Untuk x = 4:
- x² - 1 = 16 - 1 = 15 > 0 ✓
- 3x + 3 = 12 + 3 = 15 > 0 ✓
- **x = 4 VALID**

Untuk x = -1:
- x² - 1 = 1 - 1 = 0 (TIDAK > 0!) ✗
- **x = -1 TIDAK VALID**

**Himpunan penyelesaian: {4}**

**Lihat? Kalau nggak check syarat, kamu bakal salah jawab!**

---

### **Tipe 2: Persamaan Logaritma Bentuk ᵃlog f(x) = k**

Di sini, ruas kanan adalah konstanta (bukan logaritma).

**Strategi:** Ubah ke bentuk eksponen!

**ᵃlog f(x) = k** → **f(x) = aᵏ**

**Contoh Bacaan:**

**²log (x - 1) = 3**

Langkah 1: Ubah ke eksponen
- x - 1 = 2³
- x - 1 = 8

Langkah 2: Selesaikan
- x = 9

Langkah 3: Check syarat
- x - 1 = 9 - 1 = 8 > 0 ✓

**Himpunan penyelesaian: {9}**

---

**Contoh Bacaan 2:**

**⁵log (2x + 1) = 2**

Langkah 1: Ubah ke eksponen
- 2x + 1 = 5²
- 2x + 1 = 25

Langkah 2: Selesaikan
- 2x = 24
- x = 12

Langkah 3: Check syarat
- 2x + 1 = 24 + 1 = 25 > 0 ✓

**Himpunan penyelesaian: {12}**

---

### **Tipe 3: Persamaan dengan Sifat Logaritma**

Kadang persamaan perlu disederhanakan dulu pakai sifat logaritma sebelum diselesaikan.

**Contoh Bacaan:**

**²log x + ²log (x - 3) = 2**

Langkah 1: Gabung pakai sifat perkalian
- ²log [x(x - 3)] = 2

Langkah 2: Ubah ke eksponen
- x(x - 3) = 2²
- x² - 3x = 4

Langkah 3: Selesaikan
- x² - 3x - 4 = 0
- (x - 4)(x + 1) = 0
- x = 4 atau x = -1

Langkah 4: Check syarat

Untuk x = 4:
- x = 4 > 0 ✓
- x - 3 = 1 > 0 ✓
- **x = 4 VALID**

Untuk x = -1:
- x = -1 < 0 ✗
- **x = -1 TIDAK VALID**

**Himpunan penyelesaian: {4}**

---

**Contoh Bacaan 2:**

**³log x - ³log (x - 2) = 1**

Langkah 1: Gabung pakai sifat pembagian
- ³log [x/(x - 2)] = 1

Langkah 2: Ubah ke eksponen
- x/(x - 2) = 3¹
- x/(x - 2) = 3

Langkah 3: Selesaikan
- x = 3(x - 2)
- x = 3x - 6
- -2x = -6
- x = 3

Langkah 4: Check syarat
- x = 3 > 0 ✓
- x - 2 = 1 > 0 ✓

**Himpunan penyelesaian: {3}**

---

### **Tipe 4: Persamaan Logaritma Kuadrat dengan Substitusi**

Bentuk umum: **a(ᵇlog x)² + k(ᵇlog x) + c = 0**

Ini mirip persamaan kuadrat, tapi variabelnya adalah logaritma!

**Strategi:** Misalkan **y = ᵇlog x**, selesaikan persamaan kuadrat dalam y, lalu kembalikan ke x.

**Contoh Bacaan:**

**(²log x)² - 5(²log x) + 6 = 0**

Langkah 1: Misalkan y = ²log x
- y² - 5y + 6 = 0

Langkah 2: Faktorkan
- (y - 3)(y - 2) = 0
- y = 3 atau y = 2

Langkah 3: Kembalikan ke x

Untuk y = 3:
- ²log x = 3
- x = 2³ = 8

Untuk y = 2:
- ²log x = 2
- x = 2² = 4

Langkah 4: Check syarat
- x = 8 > 0 ✓
- x = 4 > 0 ✓

**Himpunan penyelesaian: {4, 8}**

---

**Contoh Bacaan 2:**

**(log x)² - log x² = 3**

Langkah 1: Sederhanakan dulu
- (log x)² - 2 log x = 3 (karena log x² = 2 log x)

Langkah 2: Misalkan y = log x
- y² - 2y = 3
- y² - 2y - 3 = 0

Langkah 3: Faktorkan
- (y - 3)(y + 1) = 0
- y = 3 atau y = -1

Langkah 4: Kembalikan ke x

Untuk y = 3:
- log x = 3
- x = 10³ = 1000

Untuk y = -1:
- log x = -1
- x = 10⁻¹ = 0,1

Langkah 5: Check syarat
- x = 1000 > 0 ✓
- x = 0,1 > 0 ✓

**Himpunan penyelesaian: {0,1; 1000}**

---

### **Tipe 5: Persamaan dengan Basis Berbeda**

Kalau basis-nya berbeda, kamu perlu **ubah ke basis yang sama** dulu!

**Contoh Bacaan:**

**²log x + ⁴log x = 3**

Langkah 1: Ubah ⁴log x ke basis 2
- ⁴log x = (²log x)/(²log 4) = (²log x)/2

Langkah 2: Substitusi
- ²log x + (²log x)/2 = 3

Langkah 3: Misalkan y = ²log x
- y + y/2 = 3
- (3y)/2 = 3
- y = 2

Langkah 4: Kembalikan ke x
- ²log x = 2
- x = 2² = 4

Langkah 5: Check syarat
- x = 4 > 0 ✓

**Himpunan penyelesaian: {4}**

---

**Contoh Bacaan 2:**

**³log x · ⁹log x = 1**

Langkah 1: Ubah ⁹log x ke basis 3
- ⁹log x = (³log x)/(³log 9) = (³log x)/2

Langkah 2: Substitusi
- ³log x · (³log x)/2 = 1

Langkah 3: Misalkan y = ³log x
- y · y/2 = 1
- y²/2 = 1
- y² = 2
- y = ±√2

Langkah 4: Kembalikan ke x

Untuk y = √2:
- ³log x = √2
- x = 3^√2 ≈ 4,73

Untuk y = -√2:
- ³log x = -√2
- x = 3^(-√2) ≈ 0,21

Langkah 5: Check syarat
- Keduanya > 0 ✓

**Himpunan penyelesaian: {3^(-√2), 3^√2}** atau **{3^(-√2); 3^√2}**

---

### **Tipe 6: Sistem Persamaan Logaritma**

Kadang SNBT ngasih dua persamaan logaritma sekaligus.

**Strategi:** Gunakan metode eliminasi atau substitusi, seperti SPLDV biasa.

**Contoh Bacaan:**

Diketahui:
- ²log x + ²log y = 5
- ²log x - ²log y = 1

Tentukan nilai xy!

Langkah 1: Jumlahkan kedua persamaan
- 2(²log x) = 6
- ²log x = 3
- x = 8

Langkah 2: Substitusi ke persamaan pertama
- ²log 8 + ²log y = 5
- 3 + ²log y = 5
- ²log y = 2
- y = 4

Langkah 3: Hitung xy
- xy = 8 × 4 = **32**

---

### **Tipe 7: Persamaan dengan Basis Variabel**

Bentuk **(f(x))^(ᵍ⁽ˣ⁾ ˡᵒᵍ ʰ⁽ˣ⁾) = k**

Ini kompleks, tapi ada trik khusus!

**Contoh Bacaan:**

**x^(²ˡᵒᵍ ˣ) = 16**

Langkah 1: Ambil ²log kedua ruas
- ²log (x^(²ˡᵒᵍ ˣ)) = ²log 16

Langkah 2: Turunkan pangkat
- (²log x) · (²log x) = 4
- (²log x)² = 4

Langkah 3: Selesaikan
- ²log x = ±2

Langkah 4: Kembalikan ke x

Untuk ²log x = 2:
- x = 2² = 4

Untuk ²log x = -2:
- x = 2⁻² = 1/4

Langkah 5: Check (substitusi balik)

Untuk x = 4:
- 4^(²ˡᵒᵍ ⁴) = 4² = 16 ✓

Untuk x = 1/4:
- (1/4)^(²ˡᵒᵍ ⁽¹/⁴⁾) = (1/4)⁻² = 16 ✓

**Himpunan penyelesaian: {1/4, 4}**

---

### **Strategi Umum Menyelesaikan Persamaan Logaritma**

**STEP 1: Identifikasi Bentuk**
- Basis sama? → Samakan numerus
- Ada konstanta? → Ubah ke eksponen
- Perlu sifat logaritma? → Simplifikasi dulu
- Bentuk kuadrat? → Substitusi

**STEP 2: Sederhanakan (jika perlu)**
- Gunakan sifat perkalian/pembagian
- Ubah basis jika berbeda
- Turunkan pangkat jadi koefisien

**STEP 3: Selesaikan Persamaan**
- Gunakan aljabar biasa
- Faktorkan jika kuadrat

**STEP 4: CHECK SYARAT! (PALING PENTING!)**
- Semua numerus > 0?
- Basis valid?
- Substitusi balik ke persamaan awal?

**STEP 5: Tulis Himpunan Penyelesaian**
- Buang solusi yang tidak valid
- Tulis dalam notasi himpunan

---

### **Tips & Trik Khusus SNBT**

**🔥 Trik 1: SELALU Check Syarat!**

Ini adalah trik #1 dan PALING PENTING! Banyak siswa yang lupa dan kehilangan poin gara-gara ini.

**Before you write your final answer, ask:**
- "Apakah semua numerus positif?"
- "Apakah ada pembagian dengan 0?"
- "Apakah basis valid?"

**🔥 Trik 2: Kenali Pola Substitusi**

Kalau kamu lihat:
- (ᵃlog x)² dan ᵃlog x → substitusi y = ᵃlog x
- (ᵃlog x)² dan ᵃlog x² → ingat ᵃlog x² = 2 ᵃlog x

**🔥 Trik 3: Ubah Basis untuk Menyederhanakan**

Kalau basis ribet (seperti 4, 8, 9, 27), ubah ke basis 2 atau 3:
- ⁴log x = (²log x)/2
- ⁸log x = (²log x)/3
- ⁹log x = (³log x)/2
- ²⁷log x = (³log x)/3

**🔥 Trik 4: Perhatikan Domain**

Sebelum mulai, tentukan dulu syarat agar semua logaritma terdefinisi. Ini akan bantu kamu eliminate jawaban yang salah lebih cepat.

**🔥 Trik 5: Gunakan Substitusi Balik untuk Check**

Kalau nggak yakin, substitusi jawaban kamu balik ke persamaan awal. Kalau hasilnya benar, maka jawabanmu valid!

---

### **🎯 Jebakan yang Sering Muncul**

**1. Lupa Check Syarat Numerus > 0**

Contoh: x = -2 secara aljabar benar, tapi bikin ²log (x + 1) = ²log (-1) → INVALID!

**2. Salah Menerapkan Sifat Logaritma**

- log (a + b) ≠ log a + log b ✗
- Yang benar: log (a × b) = log a + log b ✓

**3. Lupa Kembalikan Substitusi**

Sudah dapat y = 3, tapi lupa kalau yang dicari adalah x (dan y = ²log x)!

**4. Tidak Menyamakan Basis**

²log x + ³log x ≠ bisa langsung dijumlahkan! Harus ubah basis dulu!

**5. Salah Mengubah ke Eksponen**

²log (x - 1) = 3 → x - 1 = 2³ = 8 ✓
BUKAN x = 2³ - 1 ✗

**6. Mengabaikan Solusi Negatif pada Substitusi Kuadrat**

Kalau y² = 4, maka y = ±2 (jangan lupa yang negatif!)

---

### **Perbandingan: Persamaan Eksponen vs Logaritma**

| Aspek | Eksponen | Logaritma |
|-------|----------|-----------|
| Variabel | Di pangkat | Di numerus |
| Syarat | Basis > 0, ≠ 1 | Basis > 0, ≠ 1; Numerus > 0 |
| Cara solve | Samakan basis → samakan pangkat | Samakan basis → samakan numerus |
| Check syarat | Basis valid | Numerus > 0 (CRITICAL!) |
| Ubah bentuk | Kadang perlu logaritma | Kadang perlu eksponen |

---

### **Ringkasan Flow Chart**

```
Dapat Persamaan Logaritma
         ↓
Check syarat domain
         ↓
Identifikasi bentuk
    ↙    ↓    ↘
Basis    Konstanta  Perlu
sama     di kanan   sifat log
  ↓         ↓          ↓
Samakan   Ubah ke   Sederhanakan
numerus   eksponen   dulu
    ↓         ↓          ↓
    Selesaikan persamaan
         ↓
    CHECK SYARAT!
         ↓
    Tulis HP
         ↓
      DONE!
```

---

### **Checklist Sebelum Jawab Soal**

✅ Sudah identifikasi bentuk persamaan?
✅ Basis sudah sama?
✅ Sudah sederhanakan pakai sifat log?
✅ Kalau substitusi, sudah kembalikan ke variabel awal?
✅ **SUDAH CHECK SYARAT NUMERUS > 0?** (PENTING!)
✅ Sudah check dengan substitusi balik?
✅ Himpunan penyelesaian sudah benar?

---

Nah, sekarang kamu udah master persamaan logaritma! Key takeaway:
1. **ALWAYS check syarat numerus > 0** (ini yang paling penting!)
2. Gunakan sifat logaritma untuk simplifikasi
3. Ubah ke eksponen kalau perlu
4. Substitusi untuk bentuk kuadrat
5. Double-check jawaban dengan substitusi balik

Di materi terakhir topik ini, kita akan masuk ke **Pertidaksamaan Logaritma dan Fungsi Logaritma**—di mana kamu akan belajar cara menyelesaikan pertidaksamaan yang melibatkan logaritma, plus karakteristik grafik fungsi logaritma. Almost there! 🚀

---
