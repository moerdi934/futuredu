# SECTION 1: Aljabar - Pola Bilangan

## Topic 1.1: Pola Bilangan

---


## 📚 Materi 1.1.6: Deret Bilangan

### Time to Sum It Up! ➕📊

Kalau selama ini kita fokus ke **barisan** (urutan bilangan), sekarang saatnya kita bahas **deret** (penjumlahan bilangan)!

Bayangin lo lagi ngitung total uang tabungan dari Januari sampai Desember. Atau total jarak yang lo tempuh dalam 10 hari latihan lari. Nah, itu semua pakai konsep **deret**!

Di UTBK, soal deret sering muncul dalam bentuk **cerita kontekstual** yang bikin lo harus jeli. Let's master this! 💪

---

### 🎯 Bedanya Barisan dan Deret (Revisit)

Mari kita pertegas lagi perbedaannya:

**BARISAN (Sequence):**
```
3, 7, 11, 15, 19, ...
→ Fokus ke URUTAN dan NILAI tiap suku
```

**DERET (Series):**
```
3 + 7 + 11 + 15 + 19 + ...
→ Fokus ke JUMLAH suku-sukunya
```

**Notasi Deret:**
```
Sₙ = U₁ + U₂ + U₃ + ... + Uₙ
```

atau pakai notasi sigma:
```
Sₙ = Σ (k=1 hingga n) Uₖ
```

---

### ➕ Deret Aritmatika

#### **Konsep Dasar**

Deret aritmatika adalah **penjumlahan** suku-suku barisan aritmatika.

**Contoh:**
```
Barisan: 2, 5, 8, 11, 14
Deret: 2 + 5 + 8 + 11 + 14 = 40
```

---

#### **Rumus Jumlah n Suku Pertama**

Ada **3 versi** rumus, pilih yang paling cocok untuk soal!

**Rumus 1 - Pakai Suku Pertama & Terakhir:**
```
Sₙ = n/2 × (a + Uₙ)
```

**Keterangan:**
- Sₙ = jumlah n suku pertama
- n = banyak suku
- a = suku pertama
- Uₙ = suku terakhir/ke-n

**Contoh:**
```
Hitung jumlah: 3 + 7 + 11 + 15 + 19

n = 5
a = 3
U₅ = 19

S₅ = 5/2 × (3 + 19)
S₅ = 5/2 × 22
S₅ = 55
```

---

**Rumus 2 - Pakai Beda:**
```
Sₙ = n/2 × [2a + (n-1)b]
```

**Keterangan:**
- b = beda

**Kapan pakai rumus ini?** Kalau suku terakhir **nggak dikasih**, tapi lo tau bedanya!

**Contoh:**
```
Barisan aritmatika dengan a=5, b=3
Hitung jumlah 10 suku pertama!

S₁₀ = 10/2 × [2(5) + (10-1)(3)]
S₁₀ = 5 × [10 + 27]
S₁₀ = 5 × 37
S₁₀ = 185
```

---

**Rumus 3 - Bentuk Alternatif:**
```
Sₙ = n/2 × (U₁ + Uₙ)
```

Ini sama dengan Rumus 1, cuma notasinya beda. Pilih yang lo paling nyaman!

---

#### **Kenapa Rumusnya Gitu?**

Mari kita buktikan dengan **trik Gauss** (matematikawan genius yang nemuin ini waktu masih SD!):

```
S = 1 + 2 + 3 + ... + 98 + 99 + 100

Tulis mundur:
S = 100 + 99 + 98 + ... + 3 + 2 + 1

Jumlahkan kedua baris:
2S = (1+100) + (2+99) + (3+98) + ... + (100+1)
2S = 101 + 101 + 101 + ... + 101 (100 kali)
2S = 100 × 101
S = (100 × 101) / 2
S = 5050
```

Dari sini lahir rumus: **Sₙ = n/2 × (a + Uₙ)**

---

### ✖️ Deret Geometri

#### **Konsep Dasar**

Deret geometri adalah **penjumlahan** suku-suku barisan geometri.

**Contoh:**
```
Barisan: 2, 6, 18, 54, 162
Deret: 2 + 6 + 18 + 54 + 162 = 242
```

---

#### **Rumus Jumlah n Suku Pertama**

Ada **2 kasus** di deret geometri:

**Kasus 1: r ≠ 1**
```
Sₙ = a(rⁿ - 1) / (r - 1)   [kalau r > 1]

atau

Sₙ = a(1 - rⁿ) / (1 - r)   [kalau 0 < r < 1]
```

**Kedua rumus ini sebenarnya SAMA**, cuma bentuknya dibalik biar nggak ribet kalau r < 1!

**Contoh r > 1:**
```
Barisan: 3, 6, 12, 24, 48
a = 3, r = 2, n = 5

S₅ = 3(2⁵ - 1) / (2 - 1)
S₅ = 3(32 - 1) / 1
S₅ = 3 × 31
S₅ = 93
```

**Contoh r < 1:**
```
Barisan: 8, 4, 2, 1, 0.5
a = 8, r = 0.5, n = 5

S₅ = 8(1 - 0.5⁵) / (1 - 0.5)
S₅ = 8(1 - 0.03125) / 0.5
S₅ = 8(0.96875) / 0.5
S₅ = 15.5
```

---

**Kasus 2: r = 1**

Kalau r = 1, semua suku nilainya **sama** (barisan konstan)!

```
Sₙ = n × a
```

**Contoh:**
```
Barisan: 7, 7, 7, 7, 7
a = 7, r = 1, n = 5

S₅ = 5 × 7 = 35
```

---

#### **Deret Geometri Tak Hingga (r antara -1 dan 1)**

Ini konsep **advanced** tapi sering keluar!

Kalau **-1 < r < 1**, dan kita jumlahkan **sampai tak hingga**, hasilnya **konvergen** (mendekati nilai tertentu)!

```
S∞ = a / (1 - r)    [untuk |r| < 1]
```

**Contoh:**
```
Deret: 1 + 0.5 + 0.25 + 0.125 + ...

a = 1, r = 0.5

S∞ = 1 / (1 - 0.5)
S∞ = 1 / 0.5
S∞ = 2
```

Artinya, kalau lo terus jumlahin sampai suku ke-sejuta-juta, hasilnya **mendekati 2**!

**Aplikasi Real:**  
Ini dipake di kalkulus, fisika (jarak tempuh benda yang melambat), bahkan **ekonomi** (present value)!

---

### 🔢 Deret dengan Pola Khusus

#### **1. Deret Bilangan Asli**

```
1 + 2 + 3 + 4 + ... + n = n(n+1)/2
```

Ini sama dengan **bilangan segitiga**!

**Contoh:**
```
1 + 2 + ... + 50 = 50(51)/2 = 1275
```

---

#### **2. Deret Bilangan Ganjil**

```
1 + 3 + 5 + 7 + ... + (2n-1) = n²
```

**Contoh:**
```
1 + 3 + 5 + 7 + 9 = 5² = 25
```

---

#### **3. Deret Bilangan Genap**

```
2 + 4 + 6 + 8 + ... + 2n = n(n+1)
```

**Contoh:**
```
2 + 4 + 6 + 8 + 10 = 5(6) = 30
```

---

#### **4. Deret Kuadrat**

```
1² + 2² + 3² + ... + n² = n(n+1)(2n+1)/6
```

**Contoh:**
```
1² + 2² + 3² + 4² + 5² = 5(6)(11)/6 = 55
```

---

#### **5. Deret Kubik**

```
1³ + 2³ + 3³ + ... + n³ = [n(n+1)/2]²
```

Menariknya, ini sama dengan **kuadrat dari deret bilangan asli**!

**Contoh:**
```
1³ + 2³ + 3³ + 4³ = [4(5)/2]² = 10² = 100
```

---

### 🚨 Tips & Trik untuk Deret

#### **Tip #1: Identifikasi Tipe Deret Dulu!**

Sebelum ngitung, pastiin dulu:
- **Aritmatika** (selisih tetap) → Gunakan rumus deret aritmatika
- **Geometri** (rasio tetap) → Gunakan rumus deret geometri
- **Pola khusus** (kuadrat, ganjil, dll) → Gunakan rumus khusus

---

#### **Tip #2: Hati-Hati dengan n!**

**n** adalah **banyak suku**, bukan **nilai suku terakhir**!

**Contoh Salah:**
```
Hitung: 5 + 10 + 15 + 20

Salah: n = 20 ✗
Benar: n = 4 ✓ (ada 4 suku!)
```

---

#### **Tip #3: Gunakan Shortcut untuk Bilangan Bulat**

Kalau ditanya jumlah bilangan **dari p sampai q**:

```
Jumlah = (q - p + 1)/2 × (p + q)
```

**Contoh:**
```
20 + 21 + 22 + ... + 50

n = 50 - 20 + 1 = 31 suku
Jumlah = 31/2 × (20 + 50)
Jumlah = 31/2 × 70
Jumlah = 1085
```

---

#### **Tip #4: Cek Jawaban dengan Estimasi**

Kalau hasil lo **terlalu kecil** atau **terlalu besar**, kemungkinan ada yang salah!

**Contoh:**
```
Jumlah 10 suku pertama: 5 + 10 + 15 + ...

Suku terakhir ≈ 50
Rata-rata ≈ (5+50)/2 = 27.5
Estimasi: 10 × 27.5 = 275

Kalau hasil lo 50 atau 1000, kemungkinan ada yang salah!
```

---

### 🎯 Jebakan UTBK pada Deret

#### **Jebakan #1: Mulai dari Suku Ke-Berapa?**

**Soal:**  
"Jumlah suku ke-5 sampai ke-10 dari barisan 2, 5, 8, 11, ..."

**Jebakan:** Langsung pake S₁₀!  
**Benar:** S₅→₁₀ = S₁₀ - S₄

```
S₁₀ = 10/2 × [2(2) + 9(3)] = 5 × 31 = 155
S₄ = 4/2 × [2(2) + 3(3)] = 2 × 13 = 26
S₅→₁₀ = 155 - 26 = 129
```

---

#### **Jebakan #2: Geometri dengan r Negatif**

Hati-hati tanda!

**Contoh:**
```
a = 2, r = -3,n = 4

S₄ = 2((-3)⁴ - 1) / (-3 - 1)
S₄ = 2(81 - 1) / (-4)
S₄ = 2(80) / (-4)
S₄ = 160 / (-4)
S₄ = -40
```

**JANGAN lupa kurung** untuk (-3)⁴!

---

#### **Jebakan #3: Soal Cerita yang Nyamar**

**Soal:**  
"Pak Budi menabung Rp100.000 di bulan pertama, Rp120.000 di bulan kedua, Rp140.000 di bulan ketiga, dan seterusnya. Berapa total tabungan setelah 12 bulan?"

**Analisis:**
```
Ini deret aritmatika!
a = 100.000
b = 20.000
n = 12

S₁₂ = 12/2 × [2(100.000) + 11(20.000)]
S₁₂ = 6 × [200.000 + 220.000]
S₁₂ = 6 × 420.000
S₁₂ = 2.520.000
```

**Jadi, total tabungan = Rp2.520.000**

---

#### **Jebakan #4: Mencampur Rumus Aritmatika dan Geometri**

**SALAH:**
```
Deret geometri tapi pakai rumus aritmatika:
2 + 6 + 18 + 54
S = 4/2 × (2 + 54) = 112 ✗
```

**BENAR:**
```
a = 2, r = 3, n = 4
S₄ = 2(3⁴ - 1) / (3 - 1)
S₄ = 2(81 - 1) / 2
S₄ = 80 ✓
```

---

### 💡 Aplikasi Deret dalam Kehidupan

#### **1. Tabungan & Investasi**

**Soal:**  
"Lo nabung Rp50.000 setiap bulan selama 2 tahun. Berapa total tabungan?"

```
n = 24 bulan
a = 50.000
Barisan konstan (r = 1 atau b = 0)

S₂₄ = 24 × 50.000 = 1.200.000
```

---

#### **2. Bunga Majemuk**

**Soal:**  
"Modal Rp1.000.000 dengan bunga 10% per tahun. Berapa total setelah 5 tahun?"

```
Ini geometri!
a = 1.000.000
r = 1.1 (naik 10% = dikali 1.1)
n = 5

Tapi ini bukan deret, ini barisan!
U₅ = 1.000.000 × (1.1)⁵
U₅ = 1.000.000 × 1.61051
U₅ = 1.610.510
```

---

#### **3. Jarak Tempuh Benda**

**Soal:**  
"Bola dijatuhkan dari ketinggian 10m. Setiap pantulan mencapai 3/4 tinggi sebelumnya. Berapa total jarak yang ditempuh sampai bola berhenti?"

```
Turun pertama: 10m
Naik-turun: 10(3/4) × 2, 10(3/4)²(2), ...

Jarak total = 10 + 2 × [10(3/4) + 10(3/4)² + ...]
           = 10 + 2 × 10(3/4) / (1 - 3/4)
           = 10 + 2 × 7.5 / 0.25
           = 10 + 60
           = 70m
```

---

### 🎓 Rumus-Rumus Penting (Cheat Sheet!)

**DERET ARITMATIKA:**
```
Sₙ = n/2 × (a + Uₙ)
Sₙ = n/2 × [2a + (n-1)b]
```

**DERET GEOMETRI:**
```
Sₙ = a(rⁿ - 1)/(r - 1)   [r ≠ 1]
Sₙ = na                   [r = 1]
S∞ = a/(1 - r)            [|r| < 1]
```

**DERET KHUSUS:**
```
1 + 2 + ... + n = n(n+1)/2
1 + 3 + 5 + ... + (2n-1) = n²
2 + 4 + 6 + ... + 2n = n(n+1)
1² + 2² + ... + n² = n(n+1)(2n+1)/6
1³ + 2³ + ... + n³ = [n(n+1)/2]²
```

---

### 🌟 Kesimpulan Materi 1.1.6

Deret adalah **penjumlahan** barisan bilangan:

✅ **Aritmatika**: Sₙ = n/2 × (a + Uₙ) atau n/2 × [2a + (n-1)b]  
✅ **Geometri**: Sₙ = a(rⁿ-1)/(r-1), S∞ = a/(1-r) untuk |r|<1  
✅ **Khusus**: Hafal rumus bilangan asli, ganjil, genap, kuadrat, kubik  
✅ **Identifikasi** tipe deret sebelum ngitung!  
✅ **Hati-hati** dengan n (banyak suku) vs nilai suku  

Selanjutnya: **Analisis dan Prediksi Pola** - level terakhir! 🎯

---
