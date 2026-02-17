# SECTION 4: Statistika dan Peluang
## Topic 4.3: Himpunan

---


### Materi 4.3.5: Aplikasi Himpunan

#### Soal Cerita Survei (2 Kategori)

Ini adalah tipe soal paling klasik dan paling sering keluar di SNBT!

**Template Soal:**
"Dalam sebuah kelas/kelompok ada n orang. Sebanyak a orang suka X, sebanyak b orang suka Y, dan sebanyak c orang suka keduanya. Berapa yang tidak suka keduanya?"

**Strategi Penyelesaian:**

**Step 1:** Buat diagram Venn

**Step 2:** Isi irisan dulu (yang suka keduanya)

**Step 3:** Hitung "hanya X" dan "hanya Y"
- Hanya X = a - c
- Hanya Y = b - c

**Step 4:** Jumlahkan semua yang "suka"
- Total suka = (a - c) + c + (b - c) = a + b - c

**Step 5:** Hitung yang "tidak suka keduanya"
- Tidak suka keduanya = n - (a + b - c)

**Contoh Soal SNBT Style:**

Dari 100 siswa, 60 siswa mengikuti bimbel Matematika, 55 siswa mengikuti bimbel Bahasa Inggris, dan 30 siswa mengikuti keduanya. Berapa siswa yang tidak mengikuti kedua bimbel tersebut?

**Penyelesaian:**
- n(S) = 100
- n(M) = 60
- n(I) = 55
- n(M ∩ I) = 30

n(M ∪ I) = 60 + 55 - 30 = 85

Yang tidak ikut keduanya = 100 - 85 = **15 siswa**

**Variasi Soal:**

1. **Berapa yang hanya mengikuti Matematika?**
   - n(M - I) = 60 - 30 = **30 siswa**

2. **Berapa yang paling sedikit mengikuti satu bimbel?**
   - n(M ∪ I) = **85 siswa**

3. **Berapa yang hanya mengikuti satu bimbel saja?**
   - (Hanya M) + (Hanya I) = 30 + 25 = **55 siswa**

#### Soal Cerita Survei (3 Kategori)

Ini level up! Soal dengan 3 kategori lebih kompleks tapi konsepnya sama.

**Template Soal:**
"Dari n orang, ada yang suka A, B, C, suka A dan B, suka A dan C, suka B dan C, suka ketiganya, dan tidak suka sama sekali. Tentukan salah satu yang ditanya."

**Strategi Penyelesaian:**

**Step 1:** Buat diagram Venn 3 lingkaran

**Step 2:** Isi irisan ketiga-tiganya dulu (A ∩ B ∩ C)

**Step 3:** Isi irisan dua-dua (tapi bukan ketiga-tiganya)
- (A ∩ B) saja = n(A ∩ B) - n(A ∩ B ∩ C)
- (A ∩ C) saja = n(A ∩ C) - n(A ∩ B ∩ C)
- (B ∩ C) saja = n(B ∩ C) - n(A ∩ B ∩ C)

**Step 4:** Isi "hanya A", "hanya B", "hanya C"
- Hanya A = n(A) - n(A ∩ B) - n(A ∩ C) + n(A ∩ B ∩ C)
- Hanya B = n(B) - n(A ∩ B) - n(B ∩ C) + n(A ∩ B ∩ C)
- Hanya C = n(C) - n(A ∩ C) - n(B ∩ C) + n(A ∩ B ∩ C)

**Step 5:** Jumlahkan semua, lalu kurangi dari total

**Contoh Soal SNBT Style:**

Dalam sebuah survei terhadap 150 orang tentang 3 merk smartphone (S, X, I):
- 70 orang pernah pakai S
- 65 orang pernah pakai X
- 60 orang pernah pakai I
- 30 orang pernah pakai S dan X
- 25 orang pernah pakai S dan I
- 28 orang pernah pakai X dan I
- 12 orang pernah pakai ketiganya

Berapa orang yang tidak pernah pakai satupun dari ketiga merk tersebut?

**Penyelesaian:**

Pakai rumus:
n(S ∪ X ∪ I) = n(S) + n(X) + n(I) - n(S ∩ X) - n(S ∩ I) - n(X ∩ I) + n(S ∩ X ∩ I)

n(S ∪ X ∪ I) = 70 + 65 + 60 - 30 - 25 - 28 + 12
n(S ∪ X ∪ I) = 195 - 83 + 12 = 124

Yang tidak pernah pakai satupun = 150 - 124 = **26 orang**

**Variasi Pertanyaan:**

1. **Berapa yang pernah pakai tepat 2 merk?**
   - (S ∩ X saja) + (S ∩ I saja) + (X ∩ I saja)
   - = (30-12) + (25-12) + (28-12)
   - = 18 + 13 + 16 = **47 orang**

2. **Berapa yang hanya pernah pakai S saja?**
   - 70 - 30 - 25 + 12 = **27 orang**

3. **Berapa yang pernah pakai paling sedikit 2 merk?**
   - Irisan 2-2 (termasuk yang ketiga-tiganya)
   - = 30 + 25 + 28 - 2(12) = **59 orang**
   - (Kurangi 2x karena yang ketiga-tiganya ke-hitung 3x)

#### Masalah Dua Himpunan dengan Kondisi Khusus

**Tipe 1: "Tepat Satu"**

"Berapa yang suka tepat satu dari A atau B?"

Artinya: (Hanya A) + (Hanya B), TANPA yang suka keduanya

Formula: n(A) + n(B) - 2×n(A ∩ B)

**Contoh:**
- n(A) = 40
- n(B) = 35
- n(A ∩ B) = 15

Yang suka tepat satu = 40 + 35 - 2(15) = 75 - 30 = **45**

**Tipe 2: "Paling Banyak Satu"**

"Berapa yang suka paling banyak satu dari A atau B?"

Artinya: (Hanya A) + (Hanya B) + (Tidak suka keduanya)

Formula: n(S) - n(A ∩ B)

**Contoh:**
- n(S) = 100
- n(A ∩ B) = 15

Yang suka paling banyak satu = 100 - 15 = **85**

**Tipe 3: "Tidak Keduanya"**

"Berapa yang tidak suka keduanya?"

Ini sama dengan komplemen irisan: (A ∩ B)'

Formula: n(S) - n(A ∩ B)

ATAU

Formula alternatif: (Hanya A) + (Hanya B) + (Tidak suka sama sekali)

#### Masalah Tiga Himpunan dengan Kondisi Khusus

**Tipe 1: "Tepat Satu"**

Yang suka tepat satu kategori saja.

Formula: Hanya A + Hanya B + Hanya C

**Tipe 2: "Tepat Dua"**

Yang suka tepat dua kategori (tapi bukan ketiga-tiganya).

Formula: (A ∩ B saja) + (A ∩ C saja) + (B ∩ C saja)

**Tipe 3: "Paling Sedikit Satu"**

Yang suka minimal satu kategori.

Formula: n(A ∪ B ∪ C)

**Tipe 4: "Paling Sedikit Dua"**

Yang suka minimal dua kategori (termasuk yang ketiga-tiganya).

Formula: n(A ∩ B) + n(A ∩ C) + n(B ∩ C) - 2×n(A ∩ B ∩ C)

#### Soal Cerita Pembagian dan Distribusi

**Contoh:**

"Sebuah toko menjual 3 jenis barang: Laptop (L), Tablet (T), dan Smartphone (S). Dari 200 pelanggan:
- 120 membeli Laptop
- 80 membeli Tablet
- 100 membeli Smartphone
- 50 membeli Laptop dan Tablet
- 40 membeli Laptop dan Smartphone
- 35 membeli Tablet dan Smartphone
- 20 membeli ketiganya
- Berapa pelanggan yang tidak membeli apapun?"

**Penyelesaian:**

n(L ∪ T ∪ S) = 120 + 80 + 100 - 50 - 40 - 35 + 20
              = 300 - 125 + 20
              = 195

Yang tidak beli apapun = 200 - 195 = **5 pelanggan**

**Variasi:**
- Berapa yang beli semua? → 20
- Berapa yang beli tepat dua jenis? → (50-20) + (40-20) + (35-20) = 30 + 20 + 15 = 65
- Berapa yang hanya beli Laptop? → 120 - 50 - 40 + 20 = 50

#### Aplikasi dalam Logika dan Set Theory

**Contoh: Menentukan Kebenaran Pernyataan**

Diketahui:
- S = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
- A = {bilangan genap}
- B = {bilangan prima}

Tentukan:
1. A ∩ B
2. A ∪ B
3. A'
4. (A ∩ B)'

**Penyelesaian:**

A = {2, 4, 6, 8, 10}
B = {2, 3, 5, 7}

1. A ∩ B = {2} (satu-satunya bilangan genap prima)
2. A ∪ B = {2, 3, 4, 5, 6, 7, 8, 10}
3. A' = {1, 3, 5, 7, 9}
4. (A ∩ B)' = {1, 3, 4, 5, 6, 7, 8, 9, 10}

#### Tips & Trik SNBT untuk Aplikasi Himpunan

**1. Buat Tabel atau Diagram SELALU**
- Jangan coba ngerjain soal survei tanpa visualisasi
- Diagram Venn = teman terbaik kamu!

**2. Mulai dari yang Paling Spesifik**
- Untuk 3 himpunan: mulai dari A ∩ B ∩ C (tengah)
- Lalu irisan 2-2
- Terakhir "hanya A", "hanya B", dst.

**3. Cek dengan Penjumlahan Total**
- Jumlahkan semua daerah
- Harus = n(S)
- Kalau beda, ada yang salah!

**4. Pahami Bahasa Soal**
- "Tepat satu" ≠ "Paling sedikit satu"
- "Tidak keduanya" ≠ "Tidak salah satunya"
- "Hanya A" ≠ "A"

**5. Manfaatkan Rumus dengan Bijak**
- Kalau data lengkap, pakai rumus langsung
- Kalau data kurang lengkap, gambar diagram baru isi satu-satu

**6. Latihan Berbagai Tipe Soal**
- Survei produk
- Survei kegiatan ekstrakurikuler
- Survei mata pelajaran favorit
- Survei pilihan makanan/minuman
- Pokoknya yang berhubungan sama "suka/tidak suka", "pernah/tidak pernah"

**7. Perhatikan Detail Angka**
- Soal SNBT suka kasih angka "jebakan"
- Kadang jumlah irisan lebih besar dari salah satu himpunan (ini nggak mungkin!)
- Kalau ketemu kayak gini, jawaban "tidak ada data yang sesuai" atau "soal salah"

**8. Time Management**
- Soal himpunan dengan 3 kategori bisa makan waktu 2-3 menit
- Kalau waktu mendesak, skip dulu, kerjain yang lain
- Balik lagi kalau masih ada waktu

---
