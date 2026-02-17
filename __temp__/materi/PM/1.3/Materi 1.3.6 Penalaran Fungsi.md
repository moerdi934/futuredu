# SECTION 1: Aljabar - Topic 1.3: Aljabar


## Materi 1.3.6: Penalaran Fungsi

### Welcome to Function Land! 🎢

Kalau aljabar adalah bahasa matematika, maka **fungsi** adalah cara kita mendeskripsikan **hubungan dinamis** antar objek. Fungsi itu everywhere:
- Harga total = fungsi dari jumlah barang
- Suhu Fahrenheit = fungsi dari suhu Celsius
- Skor akhir = fungsi dari nilai tugas, UTS, UAS

Di SNBT, fungsi bukan cuma tentang "cari nilai f(3)". Ini tentang **memahami bagaimana input berubah jadi output**, **mengkomposisikan transformasi**, dan **membalikkan proses**.

### Fungsi sebagai Hubungan Input-Output

#### **Definisi Intuitif**

Fungsi adalah "mesin" yang:
- Menerima input (x)
- Memproses dengan aturan tertentu
- Menghasilkan output (f(x))

**Notasi:** f: A → B dibaca "fungsi f dari himpunan A ke himpunan B"

**Key Rule:** **Setiap input punya TEPAT SATU output.**

Ini yang membedakan fungsi dari relasi biasa.

#### **Contoh Fungsi:**

f(x) = 2x + 3

- Input: x = 1 → Output: f(1) = 2(1) + 3 = 5
- Input: x = 5 → Output: f(5) = 2(5) + 3 = 13
- Input: x = -2 → Output: f(-2) = 2(-2) + 3 = -1

**Contoh Bukan Fungsi:**

"Ibukota dari negara x"

Kenapa bukan fungsi? Karena satu negara bisa punya lebih dari satu ibukota (misal: Afrika Selatan punya 3 ibukota!). Melanggar aturan "tepat satu output".

**🎯 VERTICAL LINE TEST:**

Di grafik, kalau ada garis vertikal yang memotong kurva lebih dari satu kali, itu BUKAN fungsi.

```
Fungsi: ✓               Bukan Fungsi: ✗
   y                        y
   |   /                    |    ╱╲
   |  /                     |   ╱  ╲
   | /                      |  ╱    ╲
   |/______x                | ╱______╲___x
   
(garis vertikal           (garis vertikal
cuma potong 1x)           potong 2x!)
```

### Domain dan Range: Wilayah Kekuasaan Fungsi

#### **Domain (Daerah Asal)**

Semua nilai input yang **diperbolehkan** masuk ke fungsi.

**Contoh 1:** f(x) = 2x + 3
- Domain: Semua bilangan real (ℝ)
- Karena tidak ada pembatasan

**Contoh 2:** g(x) = 1/(x - 2)
- Domain: x ≠ 2
- Karena pembagian dengan 0 tidak terdefinisi

**Contoh 3:** h(x) = √(x - 1)
- Domain: x ≥ 1
- Karena akar dari bilangan negatif tidak real

**🎯 CARA CEPAT TENTUKAN DOMAIN:**

1. **Pecahan:** Penyebut ≠ 0
2. **Akar genap:** Nilai di dalam ≥ 0
3. **Logaritma:** Argumen > 0
4. **Kombinasi:** Gabungan semua batasan

#### **Range (Daerah Hasil)**

Semua nilai output yang **mungkin dihasilkan** fungsi.

**Contoh 1:** f(x) = x²
- Range: y ≥ 0
- Karena kuadrat selalu non-negatif

**Contoh 2:** g(x) = 2x + 3
- Range: Semua bilangan real (ℝ)
- Karena linear bisa menghasilkan semua nilai y

**Contoh 3:** h(x) = 1/(x² + 1)
- Range: 0 < y ≤ 1
- Karena penyebut minimal 1 (saat x=0), jadi h maksimal 1
- Dan penyebut bisa sangat besar, jadi h mendekati 0 (tapi tidak pernah 0)

### Konteks: Domain dan Range dalam Kehidupan Nyata

**Contoh Bacaan:**

> "Biaya parkir mobil adalah Rp5.000 untuk jam pertama, kemudian Rp2.000 per jam berikutnya. Maksimal parkir 12 jam."

**Fungsi:** 
```
f(t) = 5000,              untuk 0 < t ≤ 1
f(t) = 5000 + 2000(t-1),  untuk 1 < t ≤ 12
```

**Domain (konteks):** 0 < t ≤ 12 (waktu parkir)
- Tidak bisa t = 0 (tidak parkir)
- Tidak bisa t > 12 (batasan tempat parkir)

**Range (konteks):** {5000, 7000, 9000, ..., 27000}
- Diskrit karena biaya dalam Rp
- Minimal Rp5.000, maksimal Rp27.000

**💡 INSIGHT:** Domain dan range dalam konteks bisa lebih terbatas dari domain/range matematis murni!

### Evaluasi Fungsi: Beyond f(x)

#### **Level 1: Evaluasi Sederhana**

f(x) = 3x - 5

Tentukan f(2):
```
f(2) = 3(2) - 5 = 6 - 5 = 1
```

Easy!

#### **Level 2: Evaluasi dengan Ekspresi**

f(x) = x² + 2x

Tentukan f(a + 1):
```
f(a + 1) = (a + 1)² + 2(a + 1)
         = a² + 2a + 1 + 2a + 2
         = a² + 4a + 3
```

**🎯 TIPS:** Ganti SETIAP x dengan (a + 1), jangan lupa kurung!

#### **Level 3: Evaluasi Fungsi dalam Fungsi**

f(x) = 2x + 1
g(x) = x²

Tentukan f(g(3)):
```
Step 1: Cari g(3) = 3² = 9
Step 2: Cari f(9) = 2(9) + 1 = 19
```

Jadi f(g(3)) = 19

**Atau dalam bentuk umum:**
```
f(g(x)) = 2(x²) + 1 = 2x² + 1
```

### Komposisi Fungsi: Rantai Transformasi

Komposisi adalah **fungsi di-apply berturut-turut**.

**Notasi:** (f ∘ g)(x) = f(g(x))

Dibaca: "f bundaran g dari x" atau "f komposisi g dari x"

#### **Cara Kerja:**

```
Input x → Masuk ke g → g(x) → Masuk ke f → f(g(x))
```

**Contoh:**

f(x) = 2x + 1
g(x) = x² - 3

Tentukan (f ∘ g)(x):

```
(f ∘ g)(x) = f(g(x))
           = f(x² - 3)
           = 2(x² - 3) + 1
           = 2x² - 6 + 1
           = 2x² - 5
```

**PERHATIKAN:** (f ∘ g)(x) ≠ (g ∘ f)(x) dalam general!

Mari cek:
```
(g ∘ f)(x) = g(f(x))
           = g(2x + 1)
           = (2x + 1)² - 3
           = 4x² + 4x + 1 - 3
           = 4x² + 4x - 2
```

Beda kan dengan 2x² - 5?

**💡 KOMPOSISI TIDAK KOMUTATIF!** Urutan matters!

#### **Komposisi dalam Konteks Real**

**Contoh Bacaan:**

> "Harga barang setelah diskon 20% adalah g(x) = 0.8x. Kemudian dikenakan pajak 10%, yaitu h(y) = 1.1y. Berapa harga akhir barang seharga Rp100.000?"

**Setup:**
- Diskon dulu: g(100000) = 0.8(100000) = 80000
- Pajak dari hasil diskon: h(80000) = 1.1(80000) = 88000

**Atau pakai komposisi:**
```
(h ∘ g)(x) = h(g(x)) = h(0.8x) = 1.1(0.8x) = 0.88x

Harga akhir = 0.88(100000) = 88000
```

**🎯 JEBAKAN:** "Diskon 20% lalu pajak 10%" ≠ "Diskon 10%"

Karena: 1.1 × 0.8 = 0.88, bukan 0.90!

Urutan dan basis perhitungan matters!

#### **Komposisi Bertingkat**

(f ∘ g ∘ h)(x) = f(g(h(x)))

**Contoh:**

f(x) = x + 2
g(x) = 3x
h(x) = x²

Tentukan (f ∘ g ∘ h)(2):

```
Step 1: h(2) = 2² = 4
Step 2: g(4) = 3(4) = 12
Step 3: f(12) = 12 + 2 = 14
```

Jadi (f ∘ g ∘ h)(2) = 14

### Fungsi Invers: Membalikkan Proses

Fungsi invers adalah "undo" dari fungsi asli.

**Notasi:** f⁻¹(x) dibaca "f invers dari x"

**Konsep:** Kalau f(a) = b, maka f⁻¹(b) = a

#### **Contoh Intuitif:**

- f(x) = "tambah 5" → f⁻¹(x) = "kurang 5"
- g(x) = "kali 3" → g⁻¹(x) = "bagi 3"
- h(x) = "kuadratkan" → h⁻¹(x) = "akar" (dengan catatan domain)

#### **Cara Mencari Invers: Swap and Solve**

**Contoh:**

f(x) = 2x + 3

Cari f⁻¹(x):

**Step 1:** Ganti f(x) dengan y:
```
y = 2x + 3
```

**Step 2:** Tukar x dan y:
```
x = 2y + 3
```

**Step 3:** Solve untuk y:
```
x - 3 = 2y
y = (x - 3)/2
```

**Step 4:** Ganti y dengan f⁻¹(x):
```
f⁻¹(x) = (x - 3)/2
```

**Verifikasi:**
```
f(f⁻¹(x)) = f((x-3)/2) = 2((x-3)/2) + 3 = (x-3) + 3 = x ✓
f⁻¹(f(x)) = f⁻¹(2x+3) = ((2x+3)-3)/2 = 2x/2 = x ✓
```

Perfect! Invers yang valid harus memenuhi:
- f(f⁻¹(x)) = x
- f⁻¹(f(x)) = x

#### **Syarat Fungsi Punya Invers: One-to-One (Injektif)**

Tidak semua fungsi punya invers!

**Syarat:** Fungsi harus **injektif** (satu-satu), yaitu setiap output cuma berasal dari satu input.

**Test:** Horizontal Line Test
- Kalau ada garis horizontal yang memotong grafik lebih dari 1x → TIDAK punya invers

**Contoh:**

f(x) = x² (domain ℝ)

Ini TIDAK injektif karena:
- f(2) = 4
- f(-2) = 4 juga!

Satu output (4) berasal dari dua input (2 dan -2).

**FIX:** Batasi domain!

Kalau f(x) = x² dengan domain x ≥ 0, maka:
```
f⁻¹(x) = √x (untuk x ≥ 0)
```

**🎯 PENTING:** Domain fungsi = Range inversnya, dan Range fungsi = Domain inversnya.

#### **Invers dalam Konteks**

**Contoh Bacaan:**

> "Suhu dalam Fahrenheit dihitung dengan rumus F(C) = (9/5)C + 32, dimana C adalah suhu Celsius. Berapa suhu Celsius jika suhu Fahrenheit adalah 86?"

**Cara 1: Solve langsung**
```
86 = (9/5)C + 32
54 = (9/5)C
C = 54 × (5/9) = 30°C
```

**Cara 2: Pakai invers**

Cari F⁻¹(x) dulu:
```
F(C) = (9/5)C + 32
x = (9/5)C + 32
x - 32 = (9/5)C
C = (5/9)(x - 32)
```

Jadi F⁻¹(x) = (5/9)(x - 32)

Maka:
```
F⁻¹(86) = (5/9)(86 - 32) = (5/9)(54) = 30°C
```

**💡 LESSON:** Invers sangat berguna untuk "kerja mundur" dari output ke input!

### Jenis-Jenis Fungsi Berdasarkan Sifat

#### **1. Fungsi Injektif (One-to-One)**

Setiap output berasal dari tepat satu input.

**Contoh:** f(x) = 2x + 1
- Kalau f(a) = f(b), maka 2a + 1 = 2b + 1 → a = b ✓

**Grafik:** Pass horizontal line test

#### **2. Fungsi Surjektif (Onto)**

Setiap anggota kodomain adalah output dari suatu input.

**Contoh:** f: ℝ → ℝ, f(x) = 2x
- Untuk setiap y ∈ ℝ, ada x = y/2 sehingga f(x) = y ✓

Range = Kodomain

#### **3. Fungsi Bijektif (One-to-One Correspondence)**

Injektif DAN Surjektif sekaligus.

**Contoh:** f: ℝ → ℝ, f(x) = 2x + 1
- Injektif: ✓ (setiap output dari satu input)
- Surjektif: ✓ (semua bilangan real bisa jadi output)

**Fungsi bijektif PASTI punya invers!**

### Fungsi Genap dan Ganjil

#### **Fungsi Genap (Even Function)**

**Definisi:** f(-x) = f(x) untuk semua x

**Arti:** Simetris terhadap sumbu y

**Contoh:** 
- f(x) = x² → f(-x) = (-x)² = x² = f(x) ✓
- g(x) = cos(x) → g(-x) = cos(-x) = cos(x) ✓
- h(x) = x⁴ + 2x² + 1 ✓

**Grafik:**

```
    y
    |
  ╱─┼─╲
 ╱  |  ╲
────┼────x
    |
```

#### **Fungsi Ganjil (Odd Function)**

**Definisi:** f(-x) = -f(x) untuk semua x

**Arti:** Simetris terhadap titik origin (0,0)

**Contoh:**
- f(x) = x³ → f(-x) = (-x)³ = -x³ = -f(x) ✓
- g(x) = sin(x) → g(-x) = sin(-x) = -sin(x) ✓
- h(x) = x⁵ + 3x ✓

**Grafik:**

```
    y  ╱
    | ╱
    |╱
────┼────x
   ╱|
  ╱ |
```

**🎯 TIPS SNBT:**

Kalau soal tanya "fungsi genap atau ganjil?", cek:
1. Substitusi -x
2. Bandingkan dengan f(x)
3. Kalau sama = genap, kalau negatif = ganjil, kalau beda = neither

### Fungsi Naik dan Turun (Monoton)

#### **Fungsi Naik (Increasing)**

Kalau x₁ < x₂, maka f(x₁) < f(x₂)

**Arti:** Semakin besar input, semakin besar output.

**Contoh:** f(x) = 2x + 3

#### **Fungsi Turun (Decreasing)**

Kalau x₁ < x₂, maka f(x₁) > f(x₂)

**Arti:** Semakin besar input, semakin kecil output.

**Contoh:** g(x) = -x + 5

#### **Dalam Interval**

Fungsi bisa naik di satu interval, turun di interval lain.

**Contoh:** f(x) = x²
- Turun di interval (-∞, 0)
- Naik di interval (0, ∞)

### Transformasi Fungsi: Shifting dan Scaling

#### **1. Translasi Vertikal**

f(x) + k → Geser ke atas k satuan
f(x) - k → Geser ke bawah k satuan

**Contoh:**
- f(x) = x²
- f(x) + 3 = x² + 3 → Parabola geser 3 ke atas

#### **2. Translasi Horizontal**

f(x - h) → Geser ke kanan h satuan
f(x + h) → Geser ke kiri h satuan

**🚨 JEBAKAN:** Tanda kebalikan dengan intuisi!

**Contoh:**
- f(x) = x²
- f(x - 2) = (x - 2)² → Parabola geser 2 ke KANAN

**Mengapa?** Karena untuk mendapat output yang sama, input harus 2 lebih besar.

#### **3. Refleksi**

-f(x) → Refleksi terhadap sumbu x (flip vertikal)
f(-x) → Refleksi terhadap sumbu y (flip horizontal)

**Contoh:**
- f(x) = x² - 4
- -f(x) = -(x² - 4) = -x² + 4 → Parabola terbalik

#### **4. Peregangan/Penyusutan Vertikal**

a·f(x), dengan a > 1 → Regangkan vertikal
a·f(x), dengan 0 < a < 1 → Susutkan vertikal

**Contoh:**
- f(x) = x²
- 2f(x) = 2x² → Parabola lebih "tinggi"
- 0.5f(x) = 0.5x² → Parabola lebih "landai"

#### **5. Peregangan/Penyusutan Horizontal**

f(bx), dengan b > 1 → Susutkan horizontal
f(bx), dengan 0 < b < 1 → Regangkan horizontal

**Contoh:**
- f(x) = x²
- f(2x) = (2x)² = 4x² → Parabola lebih "sempit"
- f(0.5x) = (0.5x)² = 0.25x² → Parabola lebih "lebar"

**🎯 KOMBINASI TRANSFORMASI:**

f(x) = x²
g(x) = 2(x - 3)² + 1

Transformasi dari f ke g:
1. Geser 3 ke kanan: (x - 3)²
2. Regangkan vertikal 2×: 2(x - 3)²
3. Geser 1 ke atas: 2(x - 3)² + 1

### Fungsi Piecewise: Fungsi Berkeping

Fungsi yang didefinisikan berbeda untuk interval berbeda.

**Contoh:**

```
f(x) = { x + 2,    jika x < 0
       { x²,       jika 0 ≤ x < 3
       { 2x - 1,   jika x ≥ 3
```

**Evaluasi:**

f(-2) = -2 + 2 = 0 (pakai aturan pertama)
f(1) = 1² = 1 (pakai aturan kedua)
f(5) = 2(5) - 1 = 9 (pakai aturan ketiga)

**Aplikasi Real:**

Biaya parkir, tarif listrik progresif, pajak bertingkat—semuanya fungsi piecewise!

**Contoh Bacaan:**

> "Tarif listrik: Rp1.000/kWh untuk 100 kWh pertama, Rp1.500/kWh untuk selebihnya."

```
f(x) = { 1000x,                  jika 0 ≤ x ≤ 100
       { 100000 + 1500(x-100),  jika x > 100
```

### Fungsi Komposit vs Fungsi Aljabar Biasa

**Perbedaan:**

**Fungsi Aljabar:**
(f + g)(x) = f(x) + g(x)
(f - g)(x) = f(x) - g(x)
(f · g)(x) = f(x) · g(x)
(f / g)(x) = f(x) / g(x), g(x) ≠ 0

**Fungsi Komposisi:**
(f ∘ g)(x) = f(g(x)) ← Ini BUKAN perkalian!

**Contoh:**

f(x) = 2x
g(x) = x + 3

**(f · g)(x)** = f(x) · g(x) = 2x(x + 3) = 2x² + 6x

**(f ∘ g)(x)** = f(g(x)) = f(x + 3) = 2(x + 3) = 2x + 6

Totally different!

### Problem-Solving Strategies untuk Fungsi di SNBT

#### **Strategy 1: Kerja Mundur dari Output**

Kalau ditanya "untuk nilai x berapa f(x) = k?", solve persamaan f(x) = k.

**Contoh:**

f(x) = 3x - 5
Untuk x berapa f(x) = 10?

```
3x - 5 = 10
3x = 15
x = 5
```

#### **Strategy 2: Substitusi Bertahap untuk Komposisi**

Jangan langsung expand semua! Work step by step.

#### **Strategy 3: Sketch Mental (atau Gambar Cepat)**

Untuk transformasi, visualisasi grafik helps banget understand efeknya.

#### **Strategy 4: Check dengan Nilai Spesifik**

Kalau ragu, test dengan x = 0, x = 1, x = -1.

### Rangkuman Power Points

✓ Fungsi = relasi dengan tepat satu output per input
✓ Domain = nilai input yang dibolehkan, Range = nilai output yang mungkin
✓ Komposisi (f ∘ g)(x) = f(g(x)) → urutan matters!
✓ Invers f⁻¹ "undo" fungsi f → syarat: fungsi harus injektif
✓ Cara cari invers: y = f(x) → tukar x, y → solve untuk y
✓ Transformasi: geser (±), refleksi (-), regangan (×)
✓ f(x - h) → geser ke KANAN (counterintuitive!)
✓ Fungsi genap: f(-x) = f(x), Ganjil: f(-x) = -f(x)
✓ Piecewise function: beda aturan di interval beda

---
