# SECTION 3: Geometri dan Pengukuran
## Topic 3.3: Transformasi Geometri

---


## **Materi 3.3.4: Rotasi (Perputaran)**

### Apa Itu Rotasi?

Rotasi adalah **perputaran suatu objek mengelilingi titik pusat dengan sudut tertentu**. Bayangin kamu main game racing, terus mobilnya berputar di tempat (drift) — itu rotasi! Atau bayangin jarum jam yang berputar mengelilingi pusat jam.

Dalam rotasi, ada **3 elemen penting**:
1. **Pusat rotasi** - titik yang menjadi poros putaran
2. **Besar sudut rotasi** - seberapa jauh objek berputar
3. **Arah rotasi** - searah jarum jam atau berlawanan

### Notasi Rotasi

Rotasi dilambangkan: **R[P, θ]**

Di mana:
- **R** = Rotasi
- **P** = Pusat rotasi (biasanya O(0,0) atau titik lain)
- **θ** (theta) = Besar sudut rotasi

**Arah Rotasi**:
- **θ positif** → Berlawanan arah jarum jam (counterclockwise)
- **θ negatif** → Searah jarum jam (clockwise)

**Contoh**:
- R[O, 90°] → Rotasi 90° berlawanan arah jarum jam dengan pusat O(0,0)
- R[P, -45°] → Rotasi 45° searah jarum jam dengan pusat P
- R[O, 180°] → Rotasi setengah putaran (sama dengan refleksi terhadap O!)

### Sudut Rotasi Istimewa

Ada **5 sudut istimewa** yang paling sering muncul di SNBT:

| Sudut | Putaran | Visualisasi |
|-------|---------|-------------|
| **90°** | ¼ putaran | Seperti jarum jam dari 12 ke 3 |
| **180°** | ½ putaran | Seperti jarum jam dari 12 ke 6 |
| **270°** | ¾ putaran | Seperti jarum jam dari 12 ke 9 |
| **360°** | 1 putaran penuh | Kembali ke posisi awal |
| **-90°** | ¼ putaran searah jarum jam | Sama dengan 270° berlawanan |

**Fun Fact**: Rotasi 360° = tidak mengubah posisi = transformasi identitas!

### Rotasi dengan Pusat O(0,0) - Sudut 90°

**Rumus**: Jika A(x, y) dirotasi 90° berlawanan arah jarum jam dengan pusat O, maka:
**A'(-y, x)**

Artinya: **x menjadi y, y menjadi -x**

**Cara Mengingat**: Koordinat "berputar":
(x, y) → (-y, x) → (-x, -y) → (y, -x) → (x, y)

**Contoh**:
- A(3, 5) → A'(-5, 3)
- B(-2, 4) → B'(-4, -2)
- C(6, -3) → C'(3, 6)

**Visualisasi**:
Titik di kuadran I (x+, y+) berputar 90° → pindah ke kuadran II (x-, y+)

### Rotasi dengan Pusat O(0,0) - Sudut 180°

**Rumus**: Jika A(x, y) dirotasi 180° dengan pusat O, maka:
**A'(-x, -y)**

Artinya: **Kedua koordinat berubah tanda**

**Ini sama dengan refleksi terhadap titik O(0,0)!**

**Contoh**:
- A(3, 5) → A'(-3, -5)
- B(-2, 4) → B'(2, -4)
- C(1, -3) → C'(-1, 3)

**Tips**: Rotasi 180° paling gampang karena tinggal ubah tanda semua!

### Rotasi dengan Pusat O(0,0) - Sudut 270°

**Rumus**: Jika A(x, y) dirotasi 270° berlawanan arah jarum jam dengan pusat O, maka:
**A'(y, -x)**

Artinya: **x menjadi -y, y menjadi x** (kebalikan dari rotasi 90°)

**Atau bisa ditulis**: Rotasi 270° berlawanan = Rotasi 90° searah jarum jam

**Contoh**:
- A(3, 5) → A'(5, -3)
- B(-2, 4) → B'(4, 2)
- C(6, -3) → C'(-3, -6)

**Pola**:
- 90°: (x, y) → (-y, x)
- 180°: (x, y) → (-x, -y)
- 270°: (x, y) → (y, -x)
- 360°: (x, y) → (x, y)

### Rotasi Searah Jarum Jam

Rotasi **searah jarum jam** = rotasi dengan sudut **negatif**

**Konversi**:
- Rotasi -90° = Rotasi 270° berlawanan jarum jam
- Rotasi -180° = Rotasi 180° (arah tidak pengaruh)
- Rotasi -270° = Rotasi 90° berlawanan jarum jam

**Rumus Rotasi -90° (searah jarum jam)**:
**A(x, y) → A'(y, -x)**

**Contoh**:
Rotasi A(4, 2) sebesar -90° (searah jarum jam):
A(4, 2) → A'(2, -4) ✓

### Tabel Rangkuman Rotasi dengan Pusat O

| Sudut | Rumus | Contoh (3, 5) |
|-------|-------|---------------|
| **0°** | (x, y) | (3, 5) |
| **90°** | (-y, x) | (-5, 3) |
| **180°** | (-x, -y) | (-3, -5) |
| **270°** | (y, -x) | (5, -3) |
| **360°** | (x, y) | (3, 5) |
| **-90°** | (y, -x) | (5, -3) |
| **-180°** | (-x, -y) | (-3, -5) |
| **-270°** | (-y, x) | (-5, 3) |

**Tips Menghafalkan**:
1. Rotasi 180° paling gampang: tinggal negatifkan semua
2. Rotasi 90°: x dan y "tukar", salah satu dikasih minus
3. Rotasi 270° = kebalikan dari 90°

### Rotasi dengan Pusat Sembarang P(a, b)

Jika pusat rotasi bukan di O(0,0), rumusnya lebih kompleks!

**Langkah-Langkah**:
1. **Translasi** titik A dan pusat P ke asal: A₁ = A - P
2. **Rotasi** A₁ dengan sudut θ di pusat O: A₂ = R[O, θ](A₁)
3. **Translasi balik**: A' = A₂ + P

**Atau menggunakan rumus langsung** (untuk rotasi 90°, 180°, 270°):

**Rotasi 90° dengan pusat P(a, b)**:
- x₁ = x - a, y₁ = y - b (translasi ke O)
- x₂ = -y₁, y₂ = x₁ (rotasi di O)
- x' = x₂ + a, y' = y₂ + b (translasi balik)

**Rumus gabungan**:
- x' = -(y - b) + a = -y + b + a
- y' = (x - a) + b = x - a + b

**Contoh**:
Rotasi A(5, 7) sebesar 90° dengan pusat P(2, 3)

**Langkah 1**: Translasi ke O
- A₁ = (5 - 2, 7 - 3) = (3, 4)

**Langkah 2**: Rotasi 90° di O
- A₂ = (-4, 3)

**Langkah 3**: Translasi balik
- A' = (-4 + 2, 3 + 3) = (-2, 6) ✓

### Rumus Umum Rotasi (Menggunakan Trigonometri)

Untuk rotasi dengan sudut sembarang θ dan pusat O(0,0):

**x' = x cos θ - y sin θ**
**y' = x sin θ + y cos θ**

Ini rumus **universal** yang berlaku untuk semua sudut! Tapi untuk SNBT, biasanya cukup hafal rotasi 90°, 180°, 270°.

**Verifikasi untuk θ = 90°**:
- cos 90° = 0, sin 90° = 1
- x' = x(0) - y(1) = -y ✓
- y' = x(1) + y(0) = x ✓

Sama dengan rumus yang sudah kita pelajari!

### Komposisi Rotasi

**Rotasi berturut-turut** dengan pusat yang sama:

R[O, θ₂] ∘ R[O, θ₁] = R[O, θ₁ + θ₂]

Artinya: **Sudut rotasi dijumlahkan**!

**Contoh**:
Titik A(3, 4) dirotasi 90° dilanjutkan rotasi 180° dengan pusat O.

**Cara 1 (Bertahap)**:
- Rotasi 90°: A(3, 4) → A'(-4, 3)
- Rotasi 180°: A'(-4, 3) → A''(4, -3) ✓

**Cara 2 (Langsung)**:
- Total rotasi = 90° + 180° = 270°
- A(3, 4) → A''(4, -3) ✓

Sama kan? Lebih cepat pakai cara 2!

**Catatan Penting**: Ini hanya berlaku jika **pusat rotasi SAMA**! Jika pusat berbeda, tidak bisa dijumlahkan begitu saja.

### Sifat-Sifat Rotasi

1. **Isometri**: Jarak dan ukuran dipertahankan
2. **Komutatif** (jika pusat sama): R[O, θ₁] ∘ R[O, θ₂] = R[O, θ₂] ∘ R[O, θ₁]
3. **Ada elemen identitas**: R[O, 0°] atau R[O, 360°] tidak mengubah posisi
4. **Ada invers**: R[O, θ] diinvers oleh R[O, -θ]
5. **Jarak ke pusat rotasi tetap**: |OA| = |OA'|

### Menentukan Sudut Rotasi

Soal tipe: "Titik A(3, 0) dirotasi dengan pusat O menjadi A'(0, 3). Tentukan sudut rotasinya!"

**Cara Analisis**:
1. Gambar titik A dan A' pada koordinat
2. A(3, 0) berada di sumbu x positif
3. A'(0, 3) berada di sumbu y positif
4. Dari sumbu x ke sumbu y = rotasi 90° berlawanan jarum jam

**Verifikasi dengan rumus**:
A(3, 0) rotasi 90° → A'(-0, 3) = (0, 3) ✓

**Jadi sudut rotasi = 90°**

### Rotasi Bangun Datar

Seperti transformasi lainnya, untuk bangun datar **setiap titik sudut dirotasi**.

**Contoh**:
Segitiga ABC: A(2, 1), B(5, 1), C(3, 4) dirotasi 90° dengan pusat O.

**Solusi**:
- A(2, 1) → A'(-1, 2)
- B(5, 1) → B'(-1, 5)
- C(3, 4) → C'(-4, 3)

**Sifat**:
- Luas ABC = Luas A'B'C' (isometri!)
- Bentuk tetap sama
- Hanya orientasi yang berubah (berputar 90°)

### Rotasi dan Refleksi

**Hubungan Menarik**:
- Rotasi 180° = Refleksi terhadap pusat rotasi
- Refleksi 2x terhadap garis yang berpotongan = Rotasi (sudut = 2 × sudut antara garis)

**Contoh**:
Refleksi terhadap sumbu x dilanjutkan refleksi terhadap sumbu y = Rotasi 180° dengan pusat O

**Verifikasi**:
A(3, 5) → M_x → A'(3, -5) → M_y → A''(-3, -5)
Sama dengan rotasi 180°: A(3, 5) → A''(-3, -5) ✓

### Jebakan di Soal SNBT

⚠️ **Jebakan #1: Arah Rotasi**
Soal tidak menyebutkan arah → **default berlawanan jarum jam**!
Tapi kalau ada tanda negatif (-90°), itu searah jarum jam.

⚠️ **Jebakan #2: Pusat Rotasi**
Soal tidak menyebutkan pusat → **default pusat O(0,0)**!
Kalau pusat bukan O, harus dikerjakan dengan translasi dulu.

⚠️ **Jebakan #3: Sudut Lebih dari 360°**
Rotasi 450° = 360° + 90° = Rotasi 90° saja
Rotasi 540° = 360° + 180° = Rotasi 180° saja
**Selalu kurangi dengan kelipatan 360°!**

⚠️ **Jebakan #4: Rotasi -90° vs 270°**
Ini SAMA! Tapi rumusnya beda cara penulisan. Pastikan pakai yang tepat.

### Strategi Menyelesaikan Soal Rotasi

**Algoritma Sistematis**:
1. **Identifikasi** sudut rotasi dan pusat rotasi
2. **Cek** apakah pusat di O atau bukan
3. Jika di O: **gunakan rumus langsung**
4. Jika bukan O: **translasi → rotasi di O → translasi balik**
5. **Verifikasi** dengan menghitung jarak ke pusat (harus tetap!)

**Tips Praktis**:
- Untuk 90°, 180°, 270° → hafal rumusnya
- Untuk sudut lain → pakai rumus trigonometri
- Selalu **gambar** untuk visualisasi
- Cek apakah jarak ke pusat tetap (|OA| = |OA'|)

### Aplikasi Rotasi dalam Kehidupan

Rotasi ada di mana-mana:

1. **Jarum Jam** - Rotasi paling klasik!
2. **Roda Kendaraan** - Berputar mengelilingi pusat roda
3. **Kipas Angin** - Bilah berputar mengelilingi pusat motor
4. **Tata Surya** - Planet berotasi dan berevolusi (rotasi!)
5. **Game dan Animasi** - Karakter berputar, objek berputar
6. **Pintu Putar** - Rotasi dengan pusat di engsel

### Latihan Mental Cepat

Rotasi dengan pusat O:

1. A(4, 0) rotasi 90° → ?
   → A'(0, 4) ✓

2. B(5, 3) rotasi 180° → ?
   → B'(-5, -3) ✓

3. C(2, 6) rotasi 270° → ?
   → C'(6, -2) ✓

4. D(-3, 4) rotasi -90° → ?
   → D'(4, 3) ✓

Jika bisa jawab dalam 3 detik per soal, kamu sudah jago!

### Kesimpulan Rotasi

Rotasi adalah transformasi **perputaran** yang:
✓ Mempertahankan ukuran dan bentuk (isometri)
✓ Mengubah posisi dan orientasi
✓ Bergantung pada sudut dan pusat rotasi
✓ Bisa dikombinasikan dengan transformasi lain

**Kunci Sukses**:
- **Hafal rumus** untuk 90°, 180°, 270°
- **Pahami arah**: positif = berlawanan jarum jam
- **Jangan lupa pusat**: kalau bukan O, harus translasi dulu
- **Latih sampai otomatis**: rotasi harus jadi refleks!

**Ingat**: Dalam rotasi, jarak titik ke pusat **SELALU TETAP**!

---
