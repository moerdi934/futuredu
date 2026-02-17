# SECTION 1: Aljabar dan Persamaan
## Topic 1.4: Fungsi Eksponen dan Logaritma

---


## **Materi 1.4.7: Pertidaksamaan Logaritma dan Fungsi Logaritma**

### The Final Boss: Logarithmic Inequalities! ⚡

Welcome to materi terakhir di topik Fungsi Eksponen dan Logaritma! Di sini, kita akan combine semua yang udah kamu pelajari, plus satu twist baru: **pertidaksamaan logaritma**.

Kalau di persamaan kamu cari nilai x yang tepat, di pertidaksamaan kamu cari **range nilai x** yang memenuhi. Dan sama seperti pertidaksamaan eksponen, ada **aturan khusus tentang tanda** yang harus kamu pahami!

---

## **PART A: PERTIDAKSAMAAN LOGARITMA**

### **The Golden Rule (Again!)**

Sama seperti pertidaksamaan eksponen, basis menentukan arah tanda!

**Jika a > 1:**
- ᵃlog f(x) > ᵃlog g(x) → f(x) > g(x) (TANDA TETAP)
- ᵃlog f(x) < ᵃlog g(x) → f(x) < g(x) (TANDA TETAP)

**Jika 0 < a < 1:**
- ᵃlog f(x) > ᵃlog g(x) → f(x) < g(x) (TANDA BERBALIK! ⚠️)
- ᵃlog f(x) < ᵃlog g(x) → f(x) > g(x) (TANDA BERBALIK! ⚠️)

**PLUS syarat tambahan:** f(x) > 0 dan g(x) > 0

**Kenapa bisa berbalik?**

Ingat grafik fungsi logaritma:
- Kalau a > 1 (misalnya ²log x): grafik naik ke kanan (monoton naik)
- Kalau 0 < a < 1 (misalnya ⁰·⁵log x): grafik turun ke kanan (monoton turun)

Jadi:
- Untuk a > 1: makin besar x, makin besar ᵃlog x → tanda tetap
- Untuk 0 < a < 1: makin besar x, makin kecil ᵃlog x → tanda berbalik

---

### **Langkah-Langkah Menyelesaikan Pertidaksamaan Logaritma**

**STEP 1: Pastikan Basis Sama**
- Ubah semua logaritma ke basis yang sama

**STEP 2: Identifikasi Nilai Basis**
- a > 1? → tanda tetap
- 0 < a < 1? → tanda berbalik

**STEP 3: Tentukan Syarat Domain**
- Semua numerus harus > 0

**STEP 4: Samakan "Numerus" dengan Aturan yang Benar**
- Sesuaikan arah pertidaksamaan berdasarkan basis

**STEP 5: Selesaikan Pertidaksamaan**
- Gunakan aljabar biasa

**STEP 6: Gabungkan dengan Syarat Domain**
- Ambil irisan (∩) antara solusi dan syarat

---

### **Tipe 1: Pertidaksamaan Sederhana (Basis > 1)**

**Contoh Bacaan:**

**²log (x + 1) > ²log (2x - 3)**

Langkah 1: Basis sudah sama (2 = 2) ✓

Langkah 2: Cek basis: 2 > 1 → tanda TETAP

Langkah 3: Syarat domain:
- x + 1 > 0 → x > -1
- 2x - 3 > 0 → x > 3/2

Syarat gabungan: x > 3/2

Langkah 4: Samakan numerus (tanda tetap):
- x + 1 > 2x - 3
- 4 > x
- x < 4

Langkah 5: Gabungkan dengan syarat:
- Solusi: x < 4
- Syarat: x > 3/2
- Irisan: **3/2 < x < 4**

**Himpunan penyelesaian: x ∈ (3/2, 4) atau {x | 3/2 < x < 4}**

---

### **Tipe 2: Pertidaksamaan Sederhana (Basis < 1)**

**Contoh Bacaan:**

**(1/2)log (x - 1) ≤ (1/2)log (3x + 1)**

Langkah 1: Basis sudah sama (1/2 = 1/2) ✓

Langkah 2: Cek basis: 1/2 < 1 → tanda BERBALIK

Langkah 3: Syarat domain:
- x - 1 > 0 → x > 1
- 3x + 1 > 0 → x > -1/3

Syarat gabungan: x > 1

Langkah 4: Samakan numerus (tanda berbalik!):
- ≤ jadi ≥
- x - 1 ≥ 3x + 1
- -2 ≥ 2x
- x ≤ -1

Langkah 5: Gabungkan dengan syarat:
- Solusi: x ≤ -1
- Syarat: x > 1
- Irisan: **KOSONG** (tidak ada nilai x yang memenuhi!)

**Himpunan penyelesaian: ∅ (himpunan kosong)**

**🎯 Jebakan SNBT:** Ini contoh di mana secara aljabar ada solusi, tapi setelah digabung dengan syarat domain, ternyata tidak ada nilai yang memenuhi!

---

### **Tipe 3: Pertidaksamaan dengan Konstanta**

Bentuk: **ᵃlog f(x) > k** atau **ᵃlog f(x) < k**

**Strategi:** Ubah konstanta k jadi logaritma dengan basis yang sama!

**ᵃlog f(x) > k** → **ᵃlog f(x) > ᵃlog aᵏ**

Lalu lanjutkan seperti biasa.

**Contoh Bacaan:**

**²log (x² - 4) > 3**

Langkah 1: Ubah 3 jadi logaritma
- ²log (x² - 4) > ²log 8 (karena 2³ = 8)

Langkah 2: Basis 2 > 1 → tanda tetap

Langkah 3: Syarat domain:
- x² - 4 > 0
- (x - 2)(x + 2) > 0
- x < -2 atau x > 2

Langkah 4: Samakan numerus (tanda tetap):
- x² - 4 > 8
- x² > 12
- x > 2√3 atau x < -2√3

Langkah 5: Gabungkan dengan syarat:
- Solusi: x > 2√3 atau x < -2√3
- Syarat: x < -2 atau x > 2
- Irisan: **x > 2√3 atau x < -2√3**

(Karena 2√3 ≈ 3,46 > 2, dan -2√3 ≈ -3,46 < -2)

**Himpunan penyelesaian: x ∈ (-∞, -2√3) ∪ (2√3, ∞)**

---

### **Tipe 4: Pertidaksamaan dengan Sifat Logaritma**

**Contoh Bacaan:**

**log x + log (x - 3) < 1**

Langkah 1: Gabung pakai sifat perkalian
- log [x(x - 3)] < 1

Langkah 2: Ubah 1 jadi logaritma
- log [x(x - 3)] < log 10

Langkah 3: Basis 10 > 1 → tanda tetap

Langkah 4: Syarat domain:
- x > 0
- x - 3 > 0 → x > 3

Syarat gabungan: x > 3

Langkah 5: Samakan numerus (tanda tetap):
- x(x - 3) < 10
- x² - 3x - 10 < 0
- (x - 5)(x + 2) < 0

Dari diagram tanda:
```
    +        -        +
────●────────●────────
   -2        5
```

Solusi: -2 < x < 5

Langkah 6: Gabungkan dengan syarat:
- Solusi: -2 < x < 5
- Syarat: x > 3
- Irisan: **3 < x < 5**

**Himpunan penyelesaian: x ∈ (3, 5)**

---

### **Tipe 5: Pertidaksamaan Kuadrat dalam Logaritma**

**Contoh Bacaan:**

**(²log x)² - 5(²log x) + 6 < 0**

Langkah 1: Misalkan y = ²log x
- y² - 5y + 6 < 0

Langkah 2: Faktorkan
- (y - 3)(y - 2) < 0

Langkah 3: Diagram tanda
```
    +        -        +
────●────────●────────
    2        3
```

Solusi: 2 < y < 3

Langkah 4: Kembalikan ke x
- 2 < ²log x < 3
- ²log 4 < ²log x < ²log 8
- Basis 2 > 1 → tanda tetap
- **4 < x < 8**

Langkah 5: Syarat domain:
- x > 0 ✓ (sudah terpenuhi karena x > 4)

**Himpunan penyelesaian: x ∈ (4, 8)**

---

### **Tipe 6: Pertidaksamaan dengan Basis Berbeda**

**Contoh Bacaan:**

**²log x > ⁴log x**

Langkah 1: Ubah basis jadi sama (basis 2)
- ⁴log x = (²log x)/(²log 4) = (²log x)/2

Langkah 2: Substitusi
- ²log x > (²log x)/2

Langkah 3: Misalkan y = ²log x
- y > y/2
- 2y > y
- y > 0

Langkah 4: Kembalikan ke x
- ²log x > 0
- ²log x > ²log 1
- Basis 2 > 1 → tanda tetap
- x > 1

Langkah 5: Syarat domain:
- x > 0 ✓

**Himpunan penyelesaian: x ∈ (1, ∞)**

---

### **Strategi Menentukan Tanda pada Interval**

Saat kamu punya pertidaksamaan kuadrat setelah substitusi, gunakan **diagram tanda** atau **garis bilangan**:

Contoh: (x - 2)(x - 5) < 0

1. Pembuat nol: x = 2 dan x = 5

2. Test di tiap interval:
   - x = 0: (0-2)(0-5) = (-2)(-5) = 10 > 0
   - x = 3: (3-2)(3-5) = (1)(-2) = -2 < 0 ✓
   - x = 6: (6-2)(6-5) = (4)(1) = 4 > 0

3. Diagram:
```
    +        -        +
────●────────●────────
    2        5
```

4. Ambil yang negatif (< 0): 2 < x < 5

---

## **PART B: FUNGSI LOGARITMA**

### **Pengertian Fungsi Logaritma**

**Fungsi logaritma** adalah fungsi dengan bentuk:

**f(x) = ᵃlog x**

Di mana:
- a > 0 dan a ≠ 1 (basis)
- x > 0 (domain)

Fungsi logaritma adalah **invers dari fungsi eksponen**!

---

### **Karakteristik Grafik Fungsi Logaritma**

**1. Untuk a > 1 (misalnya f(x) = ²log x):**

Ciri-ciri:
- **Monoton naik** (semakin ke kanan, semakin naik)
- **Melewati titik (1, 0)** karena ᵃlog 1 = 0
- **Melewati titik (a, 1)** karena ᵃlog a = 1
- **Asimtot vertikal di x = 0** (mendekati sumbu y tapi tidak menyentuh)
- **Domain: x > 0**
- **Range: semua bilangan real (y ∈ ℝ)**

Grafik berbentuk seperti ini:
```
y |            ●
  |         ●
  |      ●
  |   ●
  | ●
──●───────────→ x
  1
```

**2. Untuk 0 < a < 1 (misalnya f(x) = (1/2)log x):**

Ciri-ciri:
- **Monoton turun** (semakin ke kanan, semakin turun)
- **Melewati titik (1, 0)**
- **Melewati titik (a, 1)**
- **Asimtot vertikal di x = 0**
- **Domain: x > 0**
- **Range: y ∈ ℝ**

Grafik berbentuk seperti ini:
```
y |
  | ●
  |   ●
  |      ●
  |         ●
  |            ●
──●───────────→ x
  1
```

---

### **Hubungan Grafik Eksponen dan Logaritma**

Grafik y = ᵃlog x adalah **refleksi** dari grafik y = aˣ terhadap garis y = x!

Ini karena logaritma dan eksponen adalah operasi invers:
- Jika (a, b) ada di grafik y = aˣ
- Maka (b, a) ada di grafik y = ᵃlog x

**Perbandingan:**

| Fungsi Eksponen y = aˣ | Fungsi Logaritma y = ᵃlog x |
|------------------------|---------------------------|
| Domain: x ∈ ℝ | Domain: x > 0 |
| Range: y > 0 | Range: y ∈ ℝ |
| Asimtot horizontal (y = 0) | Asimtot vertikal (x = 0) |
| Lewat (0, 1) | Lewat (1, 0) |
| Lewat (1, a) | Lewat (a, 1) |

---

### **Aplikasi Logaritma dalam Skala**

Logaritma banyak dipakai dalam berbagai skala pengukuran:

**1. Skala Richter (Gempa Bumi)**

M = log (A/A₀)

Di mana:
- M = magnitudo gempa
- A = amplitudo gelombang seismik
- A₀ = amplitudo referensi

**Contoh:** Gempa 7 SR memiliki amplitudo **10 kali** lebih besar dari gempa 6 SR!

Kenapa? Karena:
- 7 = log (A/A₀)
- 6 = log (A'/A₀)
- 7 - 6 = log (A/A') = 1
- A/A' = 10¹ = 10

**2. Desibel (Intensitas Suara)**

L = 10 log (I/I₀)

Di mana:
- L = tingkat kebisingan (desibel)
- I = intensitas suara
- I₀ = intensitas referensi

**Contoh:**
- Bisikan: 30 dB
- Percakapan normal: 60 dB (1000× lebih kuat!)
- Konser rock: 120 dB (1.000.000.000.000× lebih kuat dari bisikan!)

**3. pH (Keasaman/Kebasaan)**

pH = -log [H⁺]

Di mana [H⁺] adalah konsentrasi ion hidrogen.

**Contoh:**
- pH 7 (netral): [H⁺] = 10⁻⁷
- pH 4 (asam): [H⁺] = 10⁻⁴ (1000× lebih asam dari pH 7!)
- pH 10 (basa): [H⁺] = 10⁻¹⁰

**4. Magnitude Bintang (Astronomi)**

m = -2,5 log (B/B₀)

Digunakan untuk mengukur kecerahan bintang.

**5. Kompleksitas Algoritma**

Algoritma dengan kompleksitas O(log n) jauh lebih cepat dari O(n):
- Untuk n = 1.000.000:
  - O(n) = 1.000.000 operasi
  - O(log n) = log₂ 1.000.000 ≈ 20 operasi!

Binary search adalah contoh algoritma O(log n).

---

### **Tips & Trik Khusus SNBT**

**🔥 Trik 1: Ingat Aturan Tanda!**

Before anything else:
- Basis > 1? → tanda TETAP
- Basis < 1? → tanda BERBALIK

**🔥 Trik 2: ALWAYS Tentukan Syarat Domain Dulu**

Sebelum solve, tulis syarat:
- Semua numerus > 0
- Ini akan eliminate banyak jawaban salah!

**🔥 Trik 3: Gunakan Diagram Tanda**

Untuk pertidaksamaan kuadrat, diagram tanda adalah best friend kamu!

**🔥 Trik 4: Check Ujung Interval**

Perhatikan apakah ujung termasuk atau tidak:
- Tanda ≥ atau ≤ → pakai [ ]
- Tanda > atau < → pakai ( )

**🔥 Trik 5: Gabungkan dengan Irisan (∩)**

Solusi akhir = solusi aljabar ∩ syarat domain

**🎯 Jebakan yang Sering Muncul:**

**1. Lupa Berbalik Tanda untuk Basis < 1**
- Ini jebakan #1! Always check basis!

**2. Lupa Syarat Domain**
- Numerus harus > 0, bukan ≥ 0!

**3. Salah Menggabungkan Syarat**
- Harus pakai irisan (∩), bukan gabungan (∪)!

**4. Salah Tentukan Interval**
- Hati-hati dengan ( ) vs [ ]

**5. Ketuker Monoton Naik/Turun**
- Basis > 1: naik
- Basis < 1: turun

---

### **Ringkasan Lengkap Topik 1.4**

Congratulations! Kamu udah menyelesaikan seluruh topik Fungsi Eksponen dan Logaritma! Mari kita recap:

**Materi 1.4.1: Pengenalan Fungsi Eksponen**
- f(x) = aˣ
- Basis > 1: naik; Basis < 1: turun
- Aplikasi: pertumbuhan, peluruhan

**Materi 1.4.2: Persamaan Eksponen**
- Samakan basis → samakan pangkat
- Substitusi untuk bentuk kuadrat
- Check basis = 0, 1, -1

**Materi 1.4.3: Pertidaksamaan Eksponen**
- Basis > 1: tanda tetap
- Basis < 1: tanda BERBALIK

**Materi 1.4.4: Pengenalan Logaritma**
- ᵃlog b = x ⟺ aˣ = b
- Syarat: a > 0, a ≠ 1; b > 0
- Logaritma adalah invers eksponen

**Materi 1.4.5: Operasi dan Sifat Logaritma**
- Perkalian: ᵃlog (bc) = ᵃlog b + ᵃlog c
- Pembagian: ᵃlog (b/c) = ᵃlog b - ᵃlog c
- Perpangkatan: ᵃlog (bⁿ) = n · ᵃlog b
- Chain rule: ᵃlog b · ᵇlog c = ᵃlog c

**Materi 1.4.6: Persamaan Logaritma**
- Samakan basis → samakan numerus
- **ALWAYS check syarat numerus > 0!**
- Substitusi untuk bentuk kuadrat

**Materi 1.4.7: Pertidaksamaan Logaritma dan Fungsi Logaritma**
- Basis > 1: tanda tetap
- Basis < 1: tanda BERBALIK
- Gabungkan solusi dengan syarat domain (irisan!)
- Aplikasi: Richter, desibel, pH

---

### **Checklist Final: Siap SNBT!**

✅ Paham perbedaan eksponen dan logaritma?
✅ Bisa samakan basis?
✅ Hafalin sifat-sifat logaritma?
✅ Tau kapan tanda berbalik?
✅ **ALWAYS check syarat?** (PENTING!)
✅ Bisa buat diagram tanda?
✅ Bisa gabungkan solusi dengan syarat?
✅ Paham aplikasi dalam kehidupan nyata?

---

### **Pesan Penutup**

Topik Fungsi Eksponen dan Logaritma ini adalah salah satu topik TERPENTING dalam SNBT! Kenapa?

1. **Sering muncul** (hampir pasti ada di setiap tes!)
2. **High score potential** (kalau kamu master, poin gampang!)
3. **Applicable** (banyak aplikasi dalam sains dan ekonomi)
4. **Foundation untuk kalkulus** (kalau kamu mau lanjut STEM)

Kunci sukses di topik ini:
- **Pahami konsep**, jangan cuma hafalin rumus
- **Practice, practice, practice!**
- **ALWAYS check syarat** (ini yang paling sering bikin salah!)
- **Kenali jebakan** (basis < 1, numerus ≤ 0, dll.)

Remember: Matematika itu bukan tentang seberapa cerdas kamu, tapi tentang seberapa rajin kamu berlatih! Keep practicing, dan kamu pasti bisa ace this topic! 💪🔥

Good luck untuk SNBT-mu! You got this! 🚀

---

**END OF SECTION 1 - TOPIC 1.4: FUNGSI EKSPONEN DAN LOGARITMA**

---