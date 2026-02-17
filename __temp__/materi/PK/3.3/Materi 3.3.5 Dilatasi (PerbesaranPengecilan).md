# SECTION 3: Geometri dan Pengukuran
## Topic 3.3: Transformasi Geometri

---


## **Materi 3.3.5: Dilatasi (Perbesaran/Pengecilan)**

### Apa Itu Dilatasi?

Dilatasi adalah **perbesaran atau pengecilan suatu objek dari titik pusat dengan faktor skala tertentu**. Bayangin kamu lagi pakai zoom di Google Maps — saat zoom in (memperbesar) atau zoom out (memperkecil), itu konsep dilatasi! Atau bayangkan balon yang dikembangkan atau dikempiskan dari titik pusatnya.

**Perbedaan Dilatasi dengan Transformasi Lain**:
- Translasi, refleksi, rotasi → **ukuran tetap** (isometri)
- Dilatasi → **ukuran berubah** (non-isometri)

Tapi bentuk dan orientasi tetap sama! Jadi objek setelah dilatasi **kesebangunan** dengan objek awal.

### Notasi Dilatasi

Dilatasi dilambangkan: **D[P, k]**

Di mana:
- **D** = Dilatasi
- **P** = Pusat dilatasi (biasanya O(0,0) atau titik lain)
- **k** = Faktor skala dilatasi

### Faktor Skala (k)

Faktor skala menentukan **seberapa besar perubahan ukuran**:

| Nilai k | Efek | Visualisasi |
|---------|------|-------------|
| **k > 1** | Pembesaran | Objek membesar, menjauhi pusat |
| **k = 1** | Tidak berubah | Objek tetap di tempat |
| **0 < k < 1** | Pengecilan | Objek mengecil, mendekati pusat |
| **k = 0** | Titik | Objek "hilang" jadi titik di pusat |
| **k < 0** | Pembesaran/pengecilan + refleksi | Objek melewati pusat ke sisi lain |

**Contoh Interpretasi**:
- k = 2 → Objek membesar 2 kali lipat
- k = 0.5 → Objek mengecil jadi setengahnya
- k = -3 → Objek membesar 3 kali LALU melewati pusat (seperti direfleksikan)

### Rumus Dilatasi dengan Pusat O(0,0)

Jika titik **A(x, y)** didilatasi dengan pusat **O(0,0)** dan faktor skala **k**, maka:

**A'(kx, ky)**

Artinya: **Kedua koordinat dikali dengan k**

**Contoh**:
1. A(3, 5) dengan k = 2
   → A'(2×3, 2×5) = A'(6, 10)
   *Objek membesar 2x, posisi menjauhi O*

2. B(4, -6) dengan k = 0.5
   → B'(0.5×4, 0.5×-6) = B'(2, -3)
   *Objek mengecil jadi setengah, posisi mendekati O*

3. C(2, 3) dengan k = -1
   → C'(-1×2, -1×3) = C'(-2, -3)
   *Objek ukuran tetap tapi melewati O (refleksi terhadap O!)*

### Sifat k Negatif

Dilatasi dengan **k < 0** menghasilkan **kombinasi dilatasi + refleksi terhadap pusat**!

**Contoh**:
D[O, -2] artinya:
1. Perbesar 2 kali lipat
2. Lalu refleksikan terhadap O

**Verifikasi**:
A(3, 4) dengan k = -2
→ A'(-2×3, -2×4) = A'(-6, -8)

Cek:
- Jarak OA = √(3² + 4²) = 5
- Jarak OA' = √((-6)² + (-8)²) = √(36 + 64) = √100 = 10 = 2 × 5 ✓
- A dan A' berlawanan arah dari O ✓

### Rumus Dilatasi dengan Pusat P(a, b)

Jika pusat dilatasi bukan di O(0,0), rumusnya:

**Langkah-Langkah**:
1. **Translasi** ke O: A₁ = A - P = (x - a, y - b)
2. **Dilatasi** di O: A₂ = k × A₁ = (k(x - a), k(y - b))
3. **Translasi balik**: A' = A₂ + P = (k(x - a) + a, k(y - b) + b)

**Rumus Langsung**:
**x' = k(x - a) + a**
**y' = k(y - b) + b**

Atau bisa ditulis:
**x' = kx + a(1 - k)**
**y' = ky + b(1 - k)**

**Contoh**:
Dilatasi A(7, 9) dengan pusat P(3, 5) dan k = 2

**Cara Bertahap**:
1. A₁ = (7 - 3, 9 - 5) = (4, 4)
2. A₂ = (2×4, 2×4) = (8, 8)
3. A' = (8 + 3, 8 + 5) = (11, 13) ✓

**Cara Langsung**:
- x' = 2(7 - 3) + 3 = 2(4) + 3 = 8 + 3 = 11
- y' = 2(9 - 5) + 5 = 2(4) + 5 = 8 + 5 = 13
- A'(11, 13) ✓

### Sifat-Sifat Dilatasi

1. **Bukan isometri**: Ukuran berubah (kecuali k = ±1)
2. **Kesebangunan**: Bangun awal dan bayangan sebangun
3. **Orientasi tetap** (kecuali k < 0)
4. **Perbandingan jarak**: |PA'| = |k| × |PA|
5. **Perbandingan luas**: Luas A' = k² × Luas A
6. **Perbandingan volume**: Volume A' = k³ × Volume A

**Sifat #5 dan #6 SERING MUNCUL DI SNBT!**

**Contoh**:
Segitiga ABC dengan luas 12 cm² didilatasi dengan k = 3.
Luas A'B'C' = 3² × 12 = 9 × 12 = 108 cm²

### Menentukan Bayangan Bangun Datar

Untuk bangun datar, **setiap titik sudut didilatasi**.

**Contoh**:
Segitiga PQR: P(2, 3), Q(6, 3), R(4, 7) didilatasi dengan D[O, 2].

**Solusi**:
- P(2, 3) → P'(4, 6)
- Q(6, 3) → Q'(12, 6)
- R(4, 7) → R'(8, 14)

**Pengamatan**:
- Segitiga P'Q'R' **sebangun** dengan PQR
- Panjang sisi P'Q'R' = 2 × panjang sisi PQR
- Luas P'Q'R' = 4 × luas PQR (ingat: k² = 2² = 4!)

### Menentukan Pusat Dilatasi

Soal tipe: "Titik A(2, 4) didilatasi menjadi A'(4, 8) dengan k = 2. Tentukan pusat dilatasinya!"

**Rumus**:
Dari x' = kx + a(1 - k) dan y' = ky + b(1 - k)

**a = (x' - kx)/(1 - k)**
**b = (y' - ky)/(1 - k)**

**Solusi**:
- a = (4 - 2×2)/(1 - 2) = (4 - 4)/(-1) = 0/-1 = 0
- b = (8 - 2×4)/(1 - 2) = (8 - 8)/(-1) = 0/-1 = 0

**Jadi pusat dilatasi: P(0, 0) = O** ✓

**Verifikasi**:
A(2, 4) dengan D[O, 2] → A'(4, 8) ✓

### Menentukan Faktor Skala

Soal tipe: "Titik A(3, 6) didilatasi dengan pusat O menjadi A'(9, 18). Tentukan faktor skalanya!"

**Rumus**:
**k = x'/x** atau **k = y'/y**

(Hasilnya harus sama untuk x dan y!)

**Solusi**:
- k = 9/3 = 3
- k = 18/6 = 3 ✓

**Jadi k = 3** (pembesaran 3 kali lipat)

### Komposisi Dilatasi

**Dilatasi berturut-turut** dengan pusat yang sama:

D[P, k₂] ∘ D[P, k₁] = D[P, k₁ × k₂]

Artinya: **Faktor skala dikalikan**!

**Contoh**:
Titik A(2, 3) didilatasi k₁ = 2 dilanjutkan k₂ = 3 dengan pusat O.

**Cara 1 (Bertahap)**:
- D[O, 2]: A(2, 3) → A'(4, 6)
- D[O, 3]: A'(4, 6) → A''(12, 18) ✓

**Cara 2 (Langsung)**:
- k_total = 2 × 3 = 6
- A(2, 3) → A''(12, 18) ✓

Lebih cepat pakai cara 2!

**Catatan**: Jika pusat berbeda, tidak bisa langsung dikalikan!

### Dilatasi dan Transformasi Lain

**Kombinasi Seru**:

1. **Dilatasi + Translasi**
   Objek membesar/mengecil LALU bergeser
   Contoh: Zoom in di peta lalu geser ke lokasi lain

2. **Dilatasi + Refleksi**
   k < 0 sudah otomatis kombinasi ini!

3. **Dilatasi + Rotasi**
   Objek membesar/mengecil LALU berputar
   Urutan penting! Hasil bisa beda.

**Jebakan SNBT**: Komposisi transformasi yang melibatkan dilatasi **TIDAK komutatif** dengan transformasi lain!

D[O, 2] ∘ T(3, 4) ≠ T(3, 4) ∘ D[O, 2]

### Dilatasi pada Garis dan Kurva

**Dilatasi garis** menghasilkan garis **sejajar** dengan garis awal (kecuali garis melalui pusat dilatasi).

**Contoh**:
Garis y = 2x + 3 didilatasi D[O, 2]

Titik pada garis: (0, 3) dan (1, 5)
Setelah dilatasi: (0, 6) dan (2, 10)

Garis baru melalui (0, 6) dan (2, 10):
Gradien = (10 - 6)/(2 - 0) = 4/2 = 2 (sama!)
Persamaan: y = 2x + 6

**Pola**: y = mx + c → y = mx + kc (gradien tetap, intercept dikali k)

### Jebakan di Soal SNBT

⚠️ **Jebakan #1: Luas dan Volume**
Soal: "Bangun didilatasi k = 3. Berapa kali luas bangun baru?"
Jawaban SALAH: 3 kali
Jawaban BENAR: 3² = **9 kali** ✓

Untuk volume: k³!

⚠️ **Jebakan #2: k Negatif**
k = -2 bukan cuma perkecil 2x, tapi juga refleksi terhadap pusat!
Siswa sering lupa bagian refleksi.

⚠️ **Jebakan #3: Pusat Bukan O**
Soal tidak menyebutkan pusat → **JANGAN asumsikan O!**
Baca soal dengan teliti. Kalau tidak disebutkan, biasanya dikasih pilihan untuk dicari.

⚠️ **Jebakan #4: Komposisi**
Dilatasi tidak komutatif dengan transformasi lain!
D ∘ T ≠ T ∘ D
Selalu kerjakan sesuai urutan!

### Strategi Menyelesaikan Soal Dilatasi

**Algoritma 5 Langkah**:
1. **Identifikasi** pusat dilatasi (O atau titik lain) dan faktor skala k
2. **Cek** apakah k positif, negatif, atau pecahan
3. Jika pusat O: **kalikan langsung** koordinat dengan k
4. Jika pusat P: **translasi → dilatasi → translasi balik**
5. **Verifikasi** dengan menghitung perbandingan jarak/luas

**Tips Praktis**:
- k > 1 → objek **menjauh** dari pusat
- 0 < k < 1 → objek **mendekati** pusat
- k < 0 → objek **melewati** pusat
- Untuk luas: kalikan k²
- Untuk volume: kalikan k³

### Aplikasi Dilatasi dalam Kehidupan

Dilatasi ada di mana-mana:

1. **Zoom di Peta/Kamera** - Perbesar/perkecil gambar
2. **Desain Grafis** - Scaling objek
3. **Arsitektur** - Miniatur dan maket (dilatasi dengan k < 1)
4. **Fotokopi** - Zoom in/out saat fotokopi
5. **Balon** - Mengembang dan mengempis dari pusat
6. **Pupil Mata** - Membesar/mengecil sesuai cahaya

### Latihan Mental Cepat

Dilatasi dengan pusat O:

1. A(2, 5) dengan k = 3 → ?
   → A'(6, 15) ✓

2. B(8, 4) dengan k = 0.5 → ?
   → B'(4, 2) ✓

3. C(3, -6) dengan k = -2 → ?
   → C'(-6, 12) ✓

4. Luas segitiga 10 cm², k = 4, luas baru?
   → 4² × 10 = 160 cm² ✓

Jika bisa jawab cepat, kamu sudah menguasai dilatasi!

### Kesimpulan Dilatasi

Dilatasi adalah transformasi **perubahan ukuran** yang:
✓ Mengubah ukuran (non-isometri)
✓ Mempertahankan bentuk (kesebangunan)
✓ Bergantung pada pusat dan faktor skala
✓ Luas berubah k², volume berubah k³

**Kunci Sukses**:
- **Hafal rumus**: x' = kx, y' = ky (pusat O)
- **Ingat k²** untuk luas, **k³** untuk volume
- **Pahami k negatif**: ada refleksi juga!
- **Hati-hati pusat**: kalau bukan O, pakai translasi

**Ingat**: Dilatasi satu-satunya transformasi yang **MENGUBAH UKURAN**!

---
