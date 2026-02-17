# SECTION 3: Geometri dan Pengukuran
## Topic 3.3: Transformasi Geometri

---


## **Materi 3.3.6: Komposisi Transformasi**

### Apa Itu Komposisi Transformasi?

Komposisi transformasi adalah **penggabungan dua atau lebih transformasi** yang dilakukan secara berturut-turut. Bayangin kamu main game: karaktermu bergerak (translasi), lalu berputar (rotasi), lalu membesar (dilatasi) — itu komposisi transformasi!

**Notasi Komposisi**: T₂ ∘ T₁
Dibaca: "T₂ komposisi T₁" atau "T₁ dilanjutkan T₂"

**PENTING**: Dikerjakan dari **KANAN KE KIRI** (seperti fungsi komposisi)!

T₂ ∘ T₁(A) artinya:
1. Lakukan T₁ pada A → hasilnya A'
2. Lakukan T₂ pada A' → hasilnya A''

### Urutan dalam Komposisi

**Urutan ITU PENTING!** (kecuali untuk kasus-kasus khusus)

Secara umum: **T₂ ∘ T₁ ≠ T₁ ∘ T₂**

**Contoh**:
Misalkan A(2, 3), T = T(1, 0), R = Refleksi sumbu x

**T ∘ R**:
- R: A(2, 3) → A'(2, -3)
- T: A'(2, -3) → A''(3, -3)

**R ∘ T**:
- T: A(2, 3) → A'(3, 3)
- R: A'(3, 3) → A''(3, -3)

**Hasilnya BEDA!** (3, -3) dari cara pertama vs (3, -3) dari cara kedua ternyata sama di contoh ini, tapi secara umum bisa beda.

**Pengecualian** (yang komutatif):
1. Translasi ∘ Translasi
2. Rotasi ∘ Rotasi (dengan pusat sama)
3. Dilatasi ∘ Dilatasi (dengan pusat sama)

### Komposisi 2 Translasi

T₂(a₂, b₂) ∘ T₁(a₁, b₁) = T(a₁ + a₂, b₁ + b₂)

**Rumus Singkat**: **Jumlahkan vektor translasi**!

**Contoh**:
T₂(3, -1) ∘ T₁(2, 5)
= T(2 + 3, 5 + (-1))
= T(5, 4)

**Sifat**: **Komutatif** (urutan tidak pengaruh)
T₂ ∘ T₁ = T₁ ∘ T₂ ✓

**Soal**:
A(1, 2) → T₁(3, 4) → T₂(-2, 1) → A''?

**Solusi Cepat**:
T_total = T(3 + (-2), 4 + 1) = T(1, 5)
A''(1 + 1, 2 + 5) = A''(2, 7) ✓

### Komposisi 2 Refleksi

**Kasus 1: Refleksi terhadap 2 garis sejajar**
→ Menghasilkan **TRANSLASI**!

Contoh: M_x ∘ M_{y=2}
Jarak antara kedua garis = 2
Translasi = 2 × jarak = 2 × 2 = 4 satuan vertikal

**Kasus 2: Refleksi terhadap 2 garis berpotongan**
→ Menghasilkan **ROTASI**!

Sudut rotasi = 2 × sudut antara kedua garis

Contoh: M_y ∘ M_x
Sudut antara sumbu x dan y = 90°
Rotasi = 2 × 90° = 180°

**Kasus 3: Refleksi terhadap garis yang sama 2x**
→ Kembali ke posisi awal (identitas)

M_x ∘ M_x = I

### Komposisi 2 Rotasi

**Dengan pusat yang sama**:
R[P, θ₂] ∘ R[P, θ₁] = R[P, θ₁ + θ₂]

**Rumus Singkat**: **Jumlahkan sudut**!

**Contoh**:
R[O, 120°] ∘ R[O, 150°]
= R[O, 150° + 120°]
= R[O, 270°]

**Sifat**: **Komutatif** (dengan pusat sama)
R[O, θ₁] ∘ R[O, θ₂] = R[O, θ₂] ∘ R[O, θ₁] ✓

**Catatan**: Jika pusat berbeda, hasilnya lebih kompleks (bukan rotasi sederhana).

### Komposisi 2 Dilatasi

**Dengan pusat yang sama**:
D[P, k₂] ∘ D[P, k₁] = D[P, k₁ × k₂]

**Rumus Singkat**: **Kalikan faktor skala**!

**Contoh**:
D[O, 3] ∘ D[O, 2]
= D[O, 2 × 3]
= D[O, 6]

**Sifat**: **Komutatif** (dengan pusat sama)
D[O, k₁] ∘ D[O, k₂] = D[O, k₂] ∘ D[O, k₁] ✓

### Komposisi Transformasi Berbeda

**Yang TIDAK komutatif**:
- Translasi ∘ Refleksi ≠ Refleksi ∘ Translasi
- Translasi ∘ Rotasi ≠ Rotasi ∘ Translasi
- Translasi ∘ Dilatasi ≠ Dilatasi ∘ Translasi
- Refleksi ∘ Rotasi ≠ Rotasi ∘ Refleksi
- Dan seterusnya...

**Cara Mengerjakannya**:
Harus **bertahap sesuai urutan**! Tidak ada rumus singkat.

**Contoh**:
A(2, 5) → R[O, 90°] → T(3, -1) → A''?

**Langkah 1**: Rotasi 90°
A(2, 5) → A'(-5, 2)

**Langkah 2**: Translasi T(3, -1)
A'(-5, 2) → A''(-5 + 3, 2 + (-1)) = A''(-2, 1) ✓

### Menentukan Transformasi Tunggal

Soal tipe: "Tentukan transformasi tunggal yang ekuivalen dengan M_y ∘ R[O, 180°]"

**Langkah**:
1. Ambil titik uji, misal A(1, 0)
2. Terapkan komposisi: A → A' → A''
3. Cari transformasi tunggal yang menghasilkan A → A''

**Solusi**:
- R[O, 180°]: A(1, 0) → A'(-1, 0)
- M_y: A'(-1, 0) → A''(1, 0)

A(1, 0) kembali ke (1, 0) → **Transformasi identitas** atau cek dengan titik lain.

Coba B(0, 1):
- R[O, 180°]: B(0, 1) → B'(0, -1)
- M_y: B'(0, -1) → B''(0, -1)

Ternyata B(0, 1) → B''(0, -1) = Refleksi sumbu x!

**Jadi M_y ∘ R[O, 180°] = M_x** ✓

### Matriks Transformasi

**Metode Advanced**: Setiap transformasi bisa dinyatakan dalam **matriks**!

**Matriks Refleksi**:
- Sumbu x: $\begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$
- Sumbu y: $\begin{pmatrix} -1 & 0 \\ 0 & 1 \end{pmatrix}$
- Garis y = x: $\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$

**Matriks Rotasi 90°**:
$\begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix}$

**Matriks Dilatasi k**:
$\begin{pmatrix} k & 0 \\ 0 & k \end{pmatrix}$

**Komposisi = Perkalian Matriks**!

T₂ ∘ T₁ = Matriks T₂ × Matriks T₁

**Contoh**:
M_y ∘ R[O, 90°]

Matriks M_y = $\begin{pmatrix} -1 & 0 \\ 0 & 1 \end{pmatrix}$

Matriks R[O, 90°] = $\begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix}$

Hasil = $\begin{pmatrix} -1 & 0 \\ 0 & 1 \end{pmatrix} \times \begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix} = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$

Ini adalah matriks refleksi terhadap y = x!

**Jadi M_y ∘ R[O, 90°] = M_{y=x}** ✓

**Catatan**: Translasi tidak bisa dinyatakan sebagai matriks 2×2 biasa, perlu matriks 3×3 (homogeneous coordinates).

### Komposisi 3 Transformasi atau Lebih

Prinsipnya sama: **Kerjakan dari kanan ke kiri, satu per satu**.

**Contoh**:
A(1, 2) → T(2, 3) → M_x → R[O, 90°] → A'''?

**Langkah 1**: T(2, 3)
A(1, 2) → A'(3, 5)

**Langkah 2**: M_x
A'(3, 5) → A''(3, -5)

**Langkah 3**: R[O, 90°]
A''(3, -5) → A'''(5, 3) ✓

**Tips**: Tulis hasil setiap langkah dengan rapi. Jangan langsung lompat!

### Pola-Pola Khusus

**Pola 1**: Transformasi dilakukan 2x
- T ∘ T = T + T (translasi)
- R[O, θ] ∘ R[O, θ] = R[O, 2θ] (rotasi)
- D[O, k] ∘ D[O, k] = D[O, k²] (dilatasi)
- M_cermin ∘ M_cermin = I (refleksi)

**Pola 2**: Invers transformasi
- T(a, b) diinvers oleh T(-a, -b)
- R[O, θ] diinvers oleh R[O, -θ]
- D[O, k] diinvers oleh D[O, 1/k]
- M_cermin diinvers oleh dirinya sendiri

**Pola 3**: Simetri
Jika F₂ ∘ F₁(A) = A untuk semua A, maka F₂ = F₁⁻¹

### Jebakan di Soal SNBT

⚠️ **Jebakan #1: Urutan Baca**
Komposisi T₂ ∘ T₁ dikerjakan: **T₁ dulu, baru T₂**!
Siswa sering terbalik karena terbiasa baca kiri ke kanan.

⚠️ **Jebakan #2: Asumsi Komutatif**
Siswa mengira semua komposisi bisa ditukar urutannya. **SALAH!**
Hanya komposisi sejenis (dengan syarat khusus) yang komutatif.

⚠️ **Jebakan #3: Lupa Hasil Antara**
Dalam komposisi 3+ transformasi, siswa sering lupa menuliskan hasil tiap langkah.
Akibatnya: salah di tengah, hasil akhir salah semua.

⚠️ **Jebakan #4: Transformasi Tunggal**
Soal minta "transformasi tunggal ekuivalen" tapi siswa masih jawab dalam bentuk komposisi.
Harus disederhanakan jadi SATU transformasi!

### Strategi Menyelesaikan Soal Komposisi

**Algoritma Sistematis**:
1. **Identifikasi** semua transformasi dalam komposisi
2. **Cek** apakah ada pola khusus (sejenis, komutatif)
3. **Kerjakan dari kanan ke kiri** (atau sesuai konvensi soal)
4. **Tulis hasil tiap langkah** (jangan langsung ke akhir!)
5. **Verifikasi** dengan logika transformasi

**Tips Praktis**:
- Buat tabel: Titik | T₁ | T₂ | T₃ | Hasil
- Untuk 3+ transformasi: cari dulu kombinasi 2 transformasi yang bisa disederhanakan
- Jika ada refleksi 2x atau rotasi 360°, langsung coret (= identitas)
- Jangan terburu-buru, teliti lebih penting daripada cepat

### Aplikasi Komposisi Transformasi

Komposisi transformasi banyak dipakai di:

1. **Animasi Komputer** - Karakter bergerak + berputar + membesar
2. **Robotika** - Lengan robot melakukan beberapa gerakan berurutan
3. **Grafis 3D** - Objek 3D mengalami rotasi, translasi, scaling bersamaan
4. **Game** - Semua gerakan karakter adalah komposisi transformasi
5. **AR/VR** - Objek virtual ditransformasi mengikuti gerakan user

### Tabel Rangkuman Komposisi

| Komposisi | Hasil | Komutatif? |
|-----------|-------|------------|
| T₂ ∘ T₁ | T(a₁+a₂, b₁+b₂) | ✓ Ya |
| R[O,θ₂] ∘ R[O,θ₁] | R[O, θ₁+θ₂] | ✓ Ya (pusat sama) |
| D[O,k₂] ∘ D[O,k₁] | D[O, k₁×k₂] | ✓ Ya (pusat sama) |
| M ∘ M (cermin sama) | I (identitas) | ✓ Ya |
| M₂ ∘ M₁ (sejajar) | Translasi | ✗ Tidak |
| M₂ ∘ M₁ (berpotongan) | Rotasi 2θ | ✗ Tidak |
| T ∘ R | Tidak ada rumus singkat | ✗ Tidak |
| T ∘ D | Tidak ada rumus singkat | ✗ Tidak |
| R ∘ D | Tidak ada rumus singkat | ✗ Tidak (kecuali pusat sama dan khusus) |

### Latihan Mental

Coba tentukan hasil komposisi:

1. T(2, 3) ∘ T(1, -2) = ?
   → T(3, 1) ✓

2. R[O, 90°] ∘ R[O, 90°] = ?
   → R[O, 180°] ✓

3. D[O, 2] ∘ D[O, 3] = ?
   → D[O, 6] ✓

4. M_x ∘ M_x = ?
   → I (identitas) ✓

Jika bisa jawab cepat, kamu paham komposisi!

### Kesimpulan Komposisi Transformasi

Komposisi transformasi adalah **gabungan beberapa transformasi** yang:
✓ Dikerjakan **berurutan** (kanan ke kiri)
✓Kadang bisa **disederhanakan** (sejenis)
✓ **Tidak selalu komutatif** (urutan penting!)
✓ Sering muncul di soal **SNBT tingkat tinggi**

**Kunci Sukses**:
- **Hafal pola** komposisi sejenis
- **Kerjakan bertahap**, jangan lompat
- **Tulis hasil tiap langkah** dengan rapi
- **Cek komutatif** atau tidak sebelum mulai

**Ingat**: Dalam komposisi, **URUTAN ITU SEGALANYA**! 

---

## **Penutup: Menguasai Transformasi Geometri untuk SNBT**

### Rangkuman Super Lengkap

**4 Transformasi Utama**:
1. **Translasi**: Geser, rumus x' = x + a, y' = y + b
2. **Refleksi**: Cermin, 8 jenis cermin dengan rumus berbeda
3. **Rotasi**: Putar, 90°/180°/270° paling sering
4. **Dilatasi**: Ubah ukuran, luas jadi k², volume jadi k³

**Komposisi**:
- Sejenis + pusat sama = bisa disederhanakan
- Beda jenis = kerjakan bertahap
- Urutan PENTING (tidak komutatif!)

### Checklist Penguasaan Materi

Kamu sudah siap SNBT jika bisa:
✓ Menentukan bayangan titik untuk semua transformasi (< 30 detik)
✓ Menghafalkan rumus refleksi 8 cermin
✓ Menghitung rotasi 90°/180°/270° tanpa ragu
✓ Menerapkan dilatasi dan menghitung perubahan luas (k²!)
✓ Menyelesaikan komposisi 2-3 transformasi
✓ Menentukan transformasi tunggal dari komposisi
✓ Tidak terjebak dengan urutan dan tanda negatif!

### Tips Terakhir Menghadapi SNBT

1. **Buat Cheat Sheet Mental**: Hafal tabel transformasi di kepala
2. **Latihan Soal Bervariasi**: Mix & match semua jenis
3. **Gambar Kalau Ragu**: Visualisasi menyelamatkan dari kesalahan
4. **Cek Dengan Logika**: Apakah hasil masuk akal?
5. **Manajemen Waktu**: Jangan застрять di satu soal transformasi

**Semoga sukses SNBT! Transformasi geometri bukan lagi momok, tapi senjata untuk raih PTN impian!** 🚀s