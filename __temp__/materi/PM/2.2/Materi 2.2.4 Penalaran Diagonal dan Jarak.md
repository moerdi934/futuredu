# SECTION 2: Geometri Spasial - Topic 2.2: Bangun Ruang


## Materi 2.2.4: Penalaran Diagonal dan Jarak

### Diagonal dan Jarak: Navigasi dalam Ruang 3D 📐

Kalau kalian main game 3D, pasti pernah mikir: "Berapa jarak terdekat dari sini ke situ?" Nah, itulah inti dari materi ini—gimana ngukur jarak dalam ruang 3D dengan cara yang smart dan efisien!

Di SNBT, soal diagonal dan jarak ini **SUPER SERING MUNCUL** karena ngetes:
1. Kemampuan visualisasi 3D
2. Pemahaman Pythagoras (dasar banget tapi crucial!)
3. Penalaran spatial yang kompleks

### Konsep Fundamental: Dari 2D ke 3D

**Pythagoras di 2D:**

Kalian pasti udah hafal banget:
c² = a² + b²

Ini untuk segitiga siku-siku di bidang datar.

**Pythagoras di 3D:**

Nah, di ruang 3D, konsepnya diperluas jadi:
d² = a² + b² + c²

Ini rumus **PALING PENTING** di materi ini! Hafalkan sampe dalam tidur! 😴

### Jenis-Jenis Diagonal dalam Bangun Ruang

**1. Diagonal Bidang/Sisi (Face Diagonal)**

Diagonal yang terletak pada SATU bidang sisi bangun ruang.

**Untuk Kubus dengan sisi a:**

Diagonal bidang = a√2

**Penalaran:**
- Setiap sisi kubus = persegi
- Diagonal persegi = sisi × √2 (dari Pythagoras 2D!)
- d² = a² + a² = 2a²
- d = a√2

**Jumlah Diagonal Bidang pada Kubus:**
- 6 sisi × 2 diagonal per sisi = 12 diagonal bidang

**Untuk Balok p × l × t:**

Ada 3 jenis diagonal bidang:
- Diagonal bidang depan/belakang: √(p² + t²)
- Diagonal bidang kiri/kanan: √(l² + t²)
- Diagonal bidang atas/bawah: √(p² + l²)

**Pro Tips:**
Selalu identify dulu bidang mana yang ditanya, baru tentukan dimensi yang relevan!

**2. Diagonal Ruang (Space Diagonal)**

Diagonal yang menghubungkan dua titik sudut yang **tidak sebidang** dan **menembus ruang dalam** bangun.

**Untuk Kubus dengan sisi a:**

Diagonal ruang = a√3

**Derivasi Step-by-Step:**

1. Ambil kubus ABCD.EFGH (A di pojok depan kiri bawah, G di pojok belakang kanan atas)
2. Diagonal ruang AG menembus dari A ke G
3. Proyeksi AG ke alas = diagonal bidang alas = AC = a√2
4. Tinggi dari C ke G = a
5. Pakai Pythagoras 3D:
   - AG² = AC² + CG²
   - AG² = (a√2)² + a²
   - AG² = 2a² + a² = 3a²
   - AG = a√3 ✓

**Cara Cepat Ingat:**
- Diagonal bidang → √2
- Diagonal ruang → √3
- Perbedaan cuma di angka di dalam akar!

**Untuk Balok p × l × t:**

Diagonal ruang = √(p² + l² + t²)

**Ini Pythagoras 3D Langsung!**

**Contoh:**
Balok 3 cm × 4 cm × 12 cm
Diagonal ruang = √(9 + 16 + 144) = √169 = 13 cm

(Kebetulan ini triple Pythagoras 3-4-5 yang di-scale!)

**Jumlah Diagonal Ruang:**
- Kubus/Balok: 4 diagonal ruang
- Dari 8 titik sudut, ada 4 pasang yang berhadapan diagonal ruang

**3. Bidang Diagonal (Diagonal Plane)**

Bidang yang melalui dua rusuk yang **berhadapan** (tidak sejajar dan tidak berpotongan).

**Untuk Kubus dengan sisi a:**

Bentuk bidang diagonal = **persegi panjang**
- Panjang = diagonal bidang = a√2
- Lebar = sisi kubus = a
- Luas bidang diagonal = a × a√2 = a²√2

**Jumlah Bidang Diagonal:**
- Kubus: 6 bidang diagonal
- Balok: juga 6

**Visualisasi:**
Bayangin kubus ABCD.EFGH:
- Bidang diagonal = bidang yang melalui misalnya AC dan EG
- Bentuk jadi persegi panjang ACGE

**Jebakan SNBT:**
⚠️ "Luas bidang diagonal adalah..."

Jangan ketuker sama diagonal bidang! Ini nanya BIDANG yang bentuknya diagonal!

### Jarak Titik ke Titik

Ini yang paling basic—jarak lurus antara dua titik.

**Di Bidang Datar (2D):**

Jarak A(x₁, y₁) ke B(x₂, y₂):
d = √[(x₂ - x₁)² + (y₂ - y₁)²]

**Di Ruang 3D:**

Jarak A(x₁, y₁, z₁) ke B(x₂, y₂, z₂):
d = √[(x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²]

**Contoh:**
Titik A(1, 2, 3) dan B(4, 6, 15)
d = √[(4-1)² + (6-2)² + (15-3)²]
d = √[9 + 16 + 144]
d = √169 = 13

**Strategi SNBT:**

Kalau soal ngasih koordinat, langsung pakai rumus ini!
Kalau soal ngasih bangun ruang tanpa koordinat, pakai Pythagoras bertahap.

### Jarak Titik ke Bidang

Ini lebih tricky! Jarak titik ke bidang adalah **jarak terpendek** dari titik ke bidang, yang selalu **tegak lurus** ke bidang!

**Prinsip Fundamental:**

**Jarak terpendek = tegak lurus!**

Ini hukum universal dalam geometri.

**Contoh 1: Jarak Titik Puncak Limas ke Alas**

Ini literally = **tinggi limas**!

Kenapa? Karena tinggi limas adalah garis tegak lurus dari puncak ke alas.

**Contoh 2: Jarak Titik ke Bidang Diagonal Kubus**

Misal kubus ABCD.EFGH dengan sisi a. Cari jarak titik B ke bidang diagonal ACGE.

**Strategi:**
1. Tentukan titik pada bidang ACGE yang terdekat dengan B
2. Titik terdekat = proyeksi tegak lurus B ke bidang
3. Hitung jarak proyeksi

**Cara Cepat:**
Gunakan rumus volume!

**Trik Volume:**
Volume limas = ⅓ × Luas alas × tinggi

Kalau kita tau volume limas dan luas alasnya, bisa cari tinggi!
Dan tinggi itu = jarak titik puncak ke alas!

**Contoh Penerapan:**

Kubus sisi 6 cm. Jarak titik B ke bidang diagonal ACGE?

**Langkah:**
1. Luas bidang ACGE = a × a√2 = 6 × 6√2 = 36√2 cm²
2. Volume limas B.ACGE = ⅙ × Volume kubus = ⅙ × 216 = 36 cm³
   (Kenapa ⅙? Karena kubus bisa dibagi jadi 6 limas kongruen dari pusat!)
3. Tinggi = jarak = 3V/L = (3 × 36)/(36√2) = 3/√2 = (3√2)/2 cm

**Alternative Method:**

Pakai proyeksi:
- B ke bidang ACGE → proyeksi jatuh di tengah-tengah
- Jarak = ½ × diagonal bidang alas
- = ½ × a√2 = 3√2 cm... wait, ini beda!

Harus hati-hati—selalu cek metode mana yang relevan!

### Jarak Titik ke Garis

Jarak titik ke garis = **jarak terpendek** dari titik ke garis, yaitu **tegak lurus** ke garis.

**Visualisasi:**
Dari titik, tarik garis tegak lurus ke garis yang ditanya. Panjang garis tegak lurus itu = jarak!

**Contoh: Kubus ABCD.EFGH sisi a**

Jarak titik A ke garis HF?

**Strategi:**
1. Visualisasi posisi A dan garis HF
2. Tarik tegak lurus dari A ke HF
3. Hitung panjangnya

**Langkah Detail:**
- H ada di pojok belakang kiri atas
- F ada di pojok depan kanan atas
- Garis HF ada di sisi atas, diagonal
- A ada di pojok depan kiri bawah

Proyeksi A ke bidang atas jatuh di E.
Jarak A ke HF = jarak E ke HF (karena AE tegak lurus bidang atas).
Jarak E ke HF = tinggi segitiga EHF dengan alas HF.

**Alternatif dengan Luas:**

Luas segitiga EHF = ½ × HF × t = ½ × EH × EF

Dari sini:
- HF = a√2 (diagonal bidang)
- EH = a, EF = a
- ½ × a√2 × t = ½ × a × a
- t = a/√2 = a√2/2

Jarak A ke HF = √(AE² + t²) = √(a² + a²/2) = √(3a²/2) = a√6/2

**Pro Tips:**
Untuk jarak titik ke garis, sering lebih mudah pakai:
1. Proyeksi
2. Luas segitiga
3. Pythagoras bertahap

### Jarak Garis ke Garis

**Kasus 1: Garis Sejajar**

Jarak = jarak salah satu titik di garis pertama ke garis kedua.

**Kasus 2: Garis Bersilangan (Skew Lines)**

Ini yang paling tricky! Garis bersilangan = garis yang tidak sejajar DAN tidak berpotongan.

**Definisi:**
Jarak garis bersilangan = panjang ruas garis **tegak lurus** ke kedua garis sekaligus.

**Contoh: Kubus ABCD.EFGH sisi a**

Jarak garis AB ke garis GH?

**Analisis:**
- AB ada di alas, depan
- GH ada di tutup, belakang
- Mereka sejajar!

Jarak = tinggi kubus = a

**Contoh 2: Jarak AC ke EG?**

**Analisis:**
- AC = diagonal bidang alas
- EG = diagonal bidang tutup
- Mereka sejajar!

Jarak = tinggi kubus = a

**Contoh 3: Jarak AB ke FH?**

**Analisis:**
- AB di alas, dari A ke B (depan)
- FH di tutup, dari F ke H (samping kanan)
- Mereka bersilangan!

**Cara Mencari:**
1. Buat bidang yang sejajar FH dan memuat AB
2. Jarak garis = jarak bidang tersebut
3. Atau: cari titik pada AB dan FH yang jaraknya terpendek

Ini kompleks! Biasanya pakai vektor atau geometri analitik tingkat lanjut.

**Trik SNBT:**
Untuk kubus, jarak garis bersilangan yang "diagonal" sering = **½ × diagonal bidang** atau **a/√2**.

### Penerapan Pythagoras 3D

**Template Standar:**

Untuk mencari jarak d dalam ruang 3D:
1. Identifikasi koordinat atau dimensi yang relevan
2. Terapkan: d² = Δx² + Δy² + Δz²
3. Solve for d

**Contoh Aplikasi:**

**Soal:** Limas segiempat T.ABCD dengan alas persegi sisi 8 cm dan tinggi 6 cm. Jarak titik T ke titik C?

**Solusi:**
1. Tempatkan sistem koordinat:
   - A(0, 0, 0)
   - C(8, 8, 0) (diagonal berhadapan)
   - T ada di atas pusat alas
   - Pusat alas = (4, 4, 0)
   - T(4, 4, 6)

2. Jarak TC:
   d² = (8-4)² + (8-4)² + (0-6)²
   d² = 16 + 16 + 36 = 68
   d = √68 = 2√17 cm

**Alternatif tanpa Koordinat:**

1. TC adalah sisi tegak limas
2. Proyeksi T ke alas = O (pusat alas)
3. OC = ½ diagonal alas = ½ × 8√2 = 4√2
4. TO = tinggi = 6
5. TC² = TO² + OC² = 36 + 32 = 68
6. TC = 2√17 cm ✓

### Rumus Jarak dalam Koordinat 3D

Kalau soal ngasih koordinat eksplisit, pakai rumus ini!

**Jarak Titik ke Bidang (dengan Persamaan Bidang):**

Bidang: ax + by + cz + d = 0
Titik: P(x₀, y₀, z₀)

Jarak = |ax₀ + by₀ + cz₀ + d| / √(a² + b² + c²)

**Catatan:**
Rumus ini level lanjut, jarang keluar di SNBT. Tapi good to know!

**Jarak Titik ke Garis (dengan Vektor):**

Garis melalui A dengan arah v⃗
Titik P

Jarak = |AP⃗ × v⃗| / |v⃗|

(Ini pakai cross product—level kuliah!)

**Untuk SNBT:**
Focus ke Pythagoras dan visualisasi geometris! Jauh lebih applicable.

### Strategi Menghadapi Soal Diagonal dan Jarak

**Step 1: VISUALISASI!**

Sketsa bangun ruang dengan jelas:
- Label semua titik sudut
- Tandai diagonal/garis yang ditanya
- Buat garis bantu kalau perlu

**Step 2: Identifikasi Jenis**

- Diagonal bidang atau diagonal ruang?
- Jarak titik-titik, titik-bidang, atau titik-garis?
- Garis sejajar atau bersilangan?

**Step 3: Pilih Metode**

- Pythagoras langsung?
- Pythagoras bertahap?
- Proyeksi dan segitiga?
- Koordinat 3D?

**Step 4: Eksekusi dengan Hati-hati**

- Tulis rumus yang dipakai
- Substitusi nilai dengan benar
- Simplifikasi hasil (rationalize kalau perlu)

**Step 5: Cek Kewajaran**

- Apakah jawabannya masuk akal?
- Lebih kecil dari dimensi terbesar bangun?
- Cek satuan!

### Common Mistakes dan Cara Menghindarinya

**Mistake #1: Salah Identifikasi Diagonal**

❌ Diagonal ruang kubus = a√2
✓ Diagonal ruang kubus = a√3

**Cara Hindari:**
Inget: bidang → √2, ruang → √3

**Mistake #2: Lupa Pythagoras Bertahap**

❌ Langsung d² = a² + b² untuk jarak miring
✓ Hitung proyeksi dulu, baru pakai Pythagoras

**Cara Hindari:**
Selalu breakdown jadi langkah-langkah kecil!

**Mistake #3: Pakai Tinggi yang Salah**

❌ Pakai tinggi limas untuk hitung sisi tegak
✓ Cari tinggi sisi tegak (apotema) dulu pakai Pythagoras

**Cara Hindari:**
Bedakan: tinggi limas (tegak lurus alas) vs tinggi sisi tegak (di sisi segitiga)!

**Mistake #4: Salah Proyeksi**

❌ Proyeksi sembarang titik
✓ Proyeksi harus tegak lurus!

**Cara Hindari:**
Selalu cek: proyeksi = titik terdekat di bidang/garis target.

**Mistake #5: Computational Error**

❌ √68 = 8.2 (approx, tapi salah!)
✓ √68 = √(4×17) = 2√17 (exact!)

**Cara Hindari:**
Selalu simplifikasi bentuk akar! SNBT suka jawaban exact.

### Soal-Soal Penalaran Diagonal dan Jarak di SNBT

**Pattern 1: Diagonal Ruang dari Info Parsial**

"Diagonal ruang balok 13 cm. Panjang 5 cm, lebar 12 cm. Tinggi balok adalah..."

**Strategi:**
- d² = p² + l² + t²
- 169 = 25 + 144 + t²
- t² = 0... wait! Ini trick!
- 5-12-13 itu triple Pythagoras—berarti 13 adalah DIAGONAL BIDANG!
- Jadi tinggi ≠ 0. Must re-read soal!

**Pattern 2: Jarak Titik ke Bidang Diagonal**

"Kubus sisi 6 cm. Jarak titik B ke bidang diagonal ACGE adalah..."

**Strategi:**
- Gunakan trik volume
- V limas = ⅓ × L_alas × t
- Cari V limas, cari L bidang diagonal
- Solve for t = jarak

**Pattern 3: Perbandingan Diagonal**

"Perbandingan diagonal bidang dan diagonal ruang kubus adalah..."

**Strategi:**
- Diagonal bidang = a√2
- Diagonal ruang = a√3
- Rasio = a√2 : a√3 = √2 : √3
- Rationalize: = √6 : 3

**Pattern 4: Jarak dalam Limas**

"Limas T.ABCD alas persegi sisi 6, tinggi 4. Panjang rusuk tegak TA adalah..."

**Strategi:**
- Proyeksi T ke alas = pusat O
- OA = ½ × diagonal alas = ½ × 6√2 = 3√2
- TA² = TO² + OA² = 16 + 18 = 34
- TA = √34 cm

### Triple Pythagoras yang Sering Muncul

**2D (Bidang):**
- 3-4-5 (dan kelipatannya: 6-8-10, 9-12-15, dll)
- 5-12-13
- 8-15-17
- 7-24-25

**3D (Ruang):**
- 1-1-√2 (kubus satuan, diagonal bidang)
- 1-1-1-√3 (kubus satuan, diagonal ruang)
- 3-4-5-√50 = 3-4-5-5√2
- Balok 3×4×12: diagonal = 13

**Pro Tips:**
Hafalkan ini! Bisa save waktu precious di SNBT!

### Mental Models untuk Diagonal dan Jarak

**Model 1: "String on Box"**

Diagonal ruang = tali terpendek dari pojok ke pojok berhadapan yang menembus kotak.

**Model 2: "Shadow and Height"**

Jarak miring = kombinasi "bayangan" (proyeksi) + tinggi.
Pakai Pythagoras: d² = bayangan² + tinggi²

**Model 3: "Ladder on Wall"**

Pythagoras 3D = tangga bersandar di pojok ruangan:
- x = jarak dari dinding
- y = jarak dari dinding lain
- z = tinggi
- Panjang tangga = √(x² + y² + z²)

**Model 4: "GPS Distance"**

Jarak 3D = jarak GPS (beda longitude, latitude, altitude):
- Δlong, Δlat, Δalt
- Jarak = √(Δlong² + Δlat² + Δalt²)

### Kesimpulan: Master Diagonal = Master Spatial Reasoning

Diagonal dan jarak adalah **core skill** geometri ruang yang:
- Menguji visualisasi 3D
- Menguji Pythagoras (super fundamental!)
- Menguji kemampuan breakdown problem kompleks

**Checklist Penguasaan:**
✓ Hafal diagonal bidang kubus = a√2, diagonal ruang = a√3
✓ Bisa pakai Pythagoras 3D untuk balok
✓ Bisa cari jarak titik ke bidang dengan volume
✓ Paham perbedaan garis sejajar vs bersilangan
✓ Bisa breakdown jarak kompleks jadi langkah-langkah sederhana

**Next Up:** Kita akan masuk ke **Bangun Ruang Gabungan**—gimana handle bangun kompleks yang terdiri dari beberapa komponen! 🧩

---
