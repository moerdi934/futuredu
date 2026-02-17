# SECTION 2: Geometri Spasial
## Topic 2.3: Transformasi Geometri

---


## Materi 2.3.6: Penalaran Koordinat

### Sistem Koordinat Kartesius

**Apa Itu Sistem Koordinat Kartesius?**

Sistem koordinat Kartesius adalah cara untuk menunjukkan posisi titik menggunakan dua bilangan: (x, y). Dinamain dari René Descartes, matematikawan yang menggabungkan aljabar dengan geometri!

**Komponen Dasar:**

1. **Origin (Titik Asal):** O(0, 0)
   - Pertemuan sumbu x dan sumbu y
   - "Home base" dari semua koordinat

2. **X-axis (Sumbu X):** Garis horizontal
   - Positif ke kanan
   - Negatif ke kiri

3. **Y-axis (Sumbu Y):** Garis vertikal
   - Positif ke atas
   - Negatif ke bawah

4. **Quadrants (Kuadran):**
   - **Kuadran I:** x > 0, y > 0 (kanan atas)
   - **Kuadran II:** x < 0, y > 0 (kiri atas)
   - **Kuadran III:** x < 0, y < 0 (kiri bawah)
   - **Kuadran IV:** x > 0, y < 0 (kanan bawah)

**Contoh Bacaan:**

Titik A(3, 4):
- x-koordinat = 3 (bergerak 3 satuan ke kanan dari origin)
- y-koordinat = 4 (bergerak 4 satuan ke atas)
- Berada di kuadran I

Titik B(-2, 5):
- x-koordinat = -2 (2 satuan ke kiri dari origin)
- y-koordinat = 5 (5 satuan ke atas)
- Berada di kuadran II

**Membaca dan Plotting Titik:**

**Langkah Plotting:**
1. Start dari origin (0, 0)
2. Gerak horizontal sejauh x
3. Dari situ, gerak vertikal sejauh y
4. Mark the point!

**Mnemonik:** **"x adalah jalan, y adalah tangga"**
- x: jalan horizontal dulu
- y: naik/turun tangga

**Tips Cepat Identifikasi Kuadran:**

| x | y | Kuadran |
|---|---|---------|
| + | + | I |
| - | + | II |
| - | - | III |
| + | - | IV |

**Special Points:**

- **(x, 0)** → Di sumbu x
- **(0, y)** → Di sumbu y
- **(0, 0)** → Di origin

### Jarak Antara Dua Titik

**Rumus Jarak (Distance Formula):**

Untuk dua titik A(x₁, y₁) dan B(x₂, y₂):

**d = √[(x₂ - x₁)² + (y₂ - y₁)²]**

**Dari Mana Rumus Ini?**

Dari teorema Pythagoras! Bayangin segitiga siku-siku:
- Sisi horizontal = |x₂ - x₁|
- Sisi vertikal = |y₂ - y₁|
- Hipotenusa = jarak antara kedua titik

**Contoh Bacaan:**

**Example 1: Jarak A(1, 2) ke B(4, 6)**

Step by step:
1. x₂ - x₁ = 4 - 1 = 3
2. y₂ - y₁ = 6 - 2 = 4
3. d = √(3² + 4²) = √(9 + 16) = √25 = 5

Jadi jaraknya 5 satuan!

**Example 2: Jarak P(-3, -1) ke Q(2, 4)**

1. x₂ - x₁ = 2 - (-3) = 5
2. y₂ - y₁ = 4 - (-1) = 5
3. d = √(5² + 5²) = √(25 + 25) = √50 = 5√2

**Trik Cepat:**

**Kasus Khusus 1: Titik Horizontal (y sama)**
A(x₁, y) dan B(x₂, y)
- Jarak = |x₂ - x₁|
- Tinggal selisih x aja!

**Kasus Khusus 2: Titik Vertikal (x sama)**
A(x, y₁) dan B(x, y₂)
- Jarak = |y₂ - y₁|
- Tinggal selisih y aja!

**Kasus Khusus 3: Origin**
Jarak titik (x, y) ke origin (0, 0):
- d = √(x² + y²)
- Lebih simple!

**Pattern Recognition:**

Beberapa jarak yang worth dihapal:
- 3-4-5 triangle → jarak 5
- 5-12-13 triangle → jarak 13
- 8-15-17 triangle → jarak 17
- a-a√3-2a triangle (segitiga 30-60-90)

**Contoh Bacaan:**

Kalau kamu dapat selisih x = 6 dan selisih y = 8:
- Recognize 6-8 = 3×2 dan 4×2
- Jadi triple Pythagoras 3-4-5 dikali 2
- Jarak = 5 × 2 = 10
- Nggak perlu hitung √(36 + 64)!

### Titik Tengah Ruas Garis

**Rumus Titik Tengah (Midpoint Formula):**

Untuk dua titik A(x₁, y₁) dan B(x₂, y₂):

**M = ((x₁ + x₂)/2, (y₁ + y₂)/2)**

**Konsep Intuitif:**

Titik tengah itu "rata-rata" posisi kedua titik:
- x-koordinat: rata-rata dari x₁ dan x₂
- y-koordinat: rata-rata dari y₁ dan y₂

**Contoh Bacaan:**

**Example 1: Titik tengah A(2, 3) dan B(6, 7)**

1. Mx = (2 + 6)/2 = 8/2 = 4
2. My = (3 + 7)/2 = 10/2 = 5
3. M = (4, 5)

**Visualisasi:**
```
A(2,3) ----M(4,5)---- B(6,7)
```

M berada pas di tengah-tengah!

**Example 2: Titik tengah P(-4, -2) dan Q(6, 10)**

1. Mx = (-4 + 6)/2 = 2/2 = 1
2. My = (-2 + 10)/2 = 8/2 = 4
3. M = (1, 4)

**Aplikasi Praktis:**

**1. Finding Midpoint of Diagonal**
Dalam persegi panjang atau jajargenjang, diagonal ketemu di titik tengah.

**2. Dividing Line Segment**
Titik tengah membagi ruas garis jadi dua bagian sama panjang.

**3. Centroid of Triangle**
Centroid bisa dihitung dari rata-rata koordinat tiga vertex.

**Reverse Problem: Finding Endpoint**

Kalau kamu tahu titik tengah M dan salah satu endpoint A, bisa cari endpoint B!

**Given:** A(x₁, y₁) dan M(mx, my)  
**Find:** B(x₂, y₂)

**Formula:**
- x₂ = 2mx - x₁
- y₂ = 2my - y₁

**Contoh Bacaan:**

A(2, 3) dan titik tengah M(5, 7). Cari B!

1. x₂ = 2(5) - 2 = 10 - 2 = 8
2. y₂ = 2(7) - 3 = 14 - 3 = 11
3. B = (8, 11)

**Check:** Midpoint (2, 3) dan (8, 11) = ((2+8)/2, (3+11)/2) = (5, 7) ✓

**Trik SNBT:**

Soal sering kasih:
- Dua vertex segitiga dan centroid → cari vertex ketiga
- Diagonal jajargenjang ketemu di satu titik → cari koordinat
- Midpoint dan satu endpoint → cari endpoint lain

### Gradien dan Persamaan Garis

**Apa Itu Gradien?**

Gradien (slope) mengukur "kecuraman" garis. Seberapa cepat y berubah relatif terhadap x.

**Rumus Gradien:**

Untuk dua titik A(x₁, y₁) dan B(x₂, y₂):

**m = (y₂ - y₁)/(x₂ - x₁) = Δy/Δx**

**Interpretasi:**
- m > 0: garis naik (dari kiri bawah ke kanan atas)
- m < 0: garis turun (dari kiri atas ke kanan bawah)
- m = 0: garis horizontal (flat)
- m = ∞ (undefined): garis vertikal

**Contoh Bacaan:**

**Example 1: Gradien A(1, 2) ke B(3, 6)**

m = (6 - 2)/(3 - 1) = 4/2 = 2

Artinya: setiap x naik 1, y naik 2.

**Example 2: Gradien P(0, 5) ke Q(4, 1)**

m = (1 - 5)/(4 - 0) = -4/4 = -1

Artinya: setiap x naik 1, y turun 1 (gradien negatif).

**Bentuk Persamaan Garis:**

**1. Slope-Intercept Form (Bentuk Umum):**

**y = mx + c**

- m = gradien
- c = y-intercept (titik potong dengan sumbu y)

**Contoh:** y = 2x + 3
- Gradien = 2
- Garis memotong y-axis di (0, 3)

**2. Point-Slope Form:**

**y - y₁ = m(x - x₁)**

Kalau kamu tahu:
- Satu titik (x₁, y₁) yang dilalui
- Gradien m

**Contoh:** Garis melalui (2, 5) dengan gradien 3:
- y - 5 = 3(x - 2)
- y - 5 = 3x - 6
- y = 3x - 1

**3. Two-Point Form:**

Kalau kamu tahu dua titik (x₁, y₁) dan (x₂, y₂):

**(y - y₁)/(y₂ - y₁) = (x - x₁)/(x₂ - x₁)**

Atau lebih simple: cari gradien dulu, terus pakai point-slope!

**4. General Form:**

**Ax + By + C = 0**

Gradien = -A/B (kalau B ≠ 0)

**Hubungan Antar Garis:**

**1. Garis Sejajar (Parallel)**
- Gradien sama
- m₁ = m₂
- Tidak akan berpotongan

**Example:** y = 2x + 3 dan y = 2x - 1 adalah sejajar.

**2. Garis Tegak Lurus (Perpendicular)**
- Perkalian gradien = -1
- m₁ × m₂ = -1
- m₂ = -1/m₁

**Example:** y = 2x + 1 dan y = -½x + 3 adalah tegak lurus.
- m₁ = 2, m₂ = -½
- 2 × (-½) = -1 ✓

**Contoh Bacaan:**

Garis L₁ melalui (1, 3) dan (4, 9).  
Cari persamaan garis L₂ yang tegak lurus L₁ dan melalui (2, 5).

**Step 1:** Cari gradien L₁
- m₁ = (9 - 3)/(4 - 1) = 6/3 = 2

**Step 2:** Cari gradien L₂ (tegak lurus)
- m₂ = -1/m₁ = -1/2

**Step 3:** Gunakan point-slope untuk L₂
- y - 5 = -½(x - 2)
- y - 5 = -½x + 1
- y = -½x + 6

**Jebakan Soal:**

❌ **Jebakan 1:** Lupa tanda negatif saat hitung gradien  
✅ **Fix:** Hati-hati dengan (y₂ - y₁) dan (x₂ - x₁)

❌ **Jebakan 2:** Salah interpret gradien negatif  
✅ **Fix:** Negatif = turun dari kiri ke kanan

❌ **Jebakan 3:** Assume garis tegak lurus kalau gradien kebalikan  
✅ **Fix:** Bukan cuma kebalikan, tapi kebalikan negatif! (m₂ = -1/m₁)

### Vektor Posisi dan Operasinya

**Apa Itu Vektor?**

Vektor adalah "anak panah" yang punya:
- **Magnitude (besar):** panjang panah
- **Direction (arah):** kemana panah nunjuk

**Vektor Posisi:**

Vektor dari origin O(0, 0) ke titik P(x, y):

**OP = (x, y)** atau **OP = xi + yj**

- x = komponen horizontal
- y = komponen vertikal

**Notasi:**
- Bold: **v**
- Arrow: v⃗
- Column: [x]
              [y]

**Contoh Bacaan:**

Titik A(3, 4):
- Vektor posisi OA = (3, 4)
- Magnitude |OA| = √(3² + 4²) = 5
- Arah: dari origin ke titik (3, 4)

**Vektor Antar Dua Titik:**
Vektor dari A(x₁, y₁) ke B(x₂, y₂):

**AB = (x₂ - x₁, y₂ - y₁)**

**Contoh:**
A(1, 2) ke B(4, 6):
- AB = (4-1, 6-2) = (3, 4)

**Operasi Vektor:**

**1. Penjumlahan Vektor**

**u + v = (u₁ + v₁, u₂ + v₂)**

Secara geometris: "tip-to-tail method"

**Example:**
u = (2, 3) dan v = (1, 4)
- u + v = (2+1, 3+4) = (3, 7)

**2. Pengurangan Vektor**

**u - v = (u₁ - v₁, u₂ - v₂)**

**Example:**
u = (5, 7) dan v = (2, 3)
- u - v = (5-2, 7-3) = (3, 4)

**3. Perkalian Skalar**

**ku = (ku₁, ku₂)**

**Example:**
u = (2, 3) dan k = 3
- 3u = (3×2, 3×3) = (6, 9)

**Interpretasi:**
- k > 1: vektor diperpanjang
- 0 < k < 1: vektor diperpendek
- k < 0: vektor dibalik arah

**4. Magnitude (Besar) Vektor**

**|v| = √(v₁² + v₂²)**

**Example:**
v = (3, 4)
- |v| = √(9 + 16) = 5

**5. Unit Vector (Vektor Satuan)**

Vektor dengan magnitude = 1:

**v̂ = v/|v|**

**Example:**
v = (3, 4), |v| = 5
- v̂ = (3/5, 4/5)
- Check: |(3/5, 4/5)| = √((3/5)² + (4/5)²) = √(9/25 + 16/25) = √(25/25) = 1 ✓

**Aplikasi Vektor dalam Geometri:**

**1. Titik Bagi Ruas Garis**

Titik P membagi ruas AB dengan perbandingan m:n:

**OP = (n·OA + m·OB)/(m + n)**

**Example:**
A(1, 2), B(7, 8), P membagi AB dengan 1:2

OP = (2·(1,2) + 1·(7,8))/(1+2)
   = ((2,4) + (7,8))/3
   = (9, 12)/3
   = (3, 4)

**2. Centroid Segitiga**

Untuk segitiga ABC:

**G = (OA + OB + OC)/3**

Centroid adalah rata-rata posisi ketiga vertex!

**3. Vektor Parallel**

Dua vektor parallel jika:
**u = kv** untuk suatu skalar k

**Example:**
u = (2, 3) dan v = (4, 6)
- v = 2u, jadi parallel ✓

**4. Vektor Tegak Lurus**

Dua vektor tegak lurus jika:
**u · v = 0**

Dot product = 0!

**Example:**
u = (3, 4) dan v = (-4, 3)
- u · v = 3×(-4) + 4×3 = -12 + 12 = 0 ✓
- Tegak lurus!

**Tips SNBT:**

✅ **Visualize vectors** - gambar panah mental  
✅ **Check special cases** - horizontal, vertikal, diagonal  
✅ **Use magnitude untuk distance** - |AB| = jarak A ke B  
✅ **Remember vector addition is commutative** - u + v = v + u  
✅ **Practice dengan soal geometri** - vektor powerful untuk proof!  

**Common Applications:**

1. **Finding coordinates** - pakai vektor posisi
2. **Dividing line segments** - pakai ratio dengan vektor
3. **Checking parallelism** - compare arah vektor
4. **Checking perpendicularity** - dot product = 0
5. **Finding centroids** - average vektor posisi

Remember: **Vektor = magnitude + direction!** Dua informasi ini yang bikin vektor powerful! 📐⃗

---

Selamat! Kamu sudah menyelesaikan **Topic 2.3: Transformasi Geometri**! 🎉

**Recap Cepat:**
✅ **Penalaran Spasial** - visualisasi 3D, rotasi mental, perspektif  
✅ **Rotasi & Refleksi** - transformasi dasar dan kombinasinya  
✅ **Visualisasi Bangun Ruang** - orthogonal views, isometrik, jaring-jaring  
✅ **Pola Geometri** - tessellation, simetri, wallpaper groups  
✅ **Kongruensi & Transformasi** - isometri vs non-isometri  
✅ **Koordinat Kartesius** - jarak, titik tengah, gradien, vektor  

**Next Steps:**
- Practice soal-soal tiap subtopik
- Latih visualisasi mental 10-15 menit/hari
- Main game spatial (Rubik, puzzle, etc.)
- Review jebakan-jebakan yang sering muncul

**You've got this!** Transformasi geometri emang tricky, tapi dengan practice konsisten, pasti bisa dikuasai! 💪🔄✨