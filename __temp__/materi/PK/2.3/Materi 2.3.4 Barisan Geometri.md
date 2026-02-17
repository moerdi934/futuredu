# SECTION 2: Bilangan dan Aritmatika
## Topic 2.3: Barisan dan Deret

---


### **Materi 2.3.4: Barisan Geometri**

Nah, sekarang kita masuk ke **barisan geometri** - saudara kandung barisan aritmatika yang karakternya agak beda! Kalau aritmatika itu jalan dengan "tambah-tambahan" yang konsisten, geometri ini jalan dengan "kali-kalian" yang bikin pertumbuhannya bisa drastis banget!

#### **Definisi Barisan Geometri**

Barisan geometri adalah barisan di mana **setiap suku diperoleh dari suku sebelumnya dengan MENGALIKAN bilangan tetap**. Bilangan tetap ini disebut **rasio (r)**.

Bayangin lo punya bakteri yang membelah diri setiap jam:
- Jam 1: 1 bakteri
- Jam 2: 2 bakteri (dikali 2)
- Jam 3: 4 bakteri (dikali 2)
- Jam 4: 8 bakteri (dikali 2)
- Jam 5: 16 bakteri (dikali 2)

Nah, itu barisan geometri dengan r = 2!

**Bentuk Umum:**
```
a, ar, ar², ar³, ar⁴, ...
```

Di mana:
- **a** = suku pertama (U₁)
- **r** = rasio (pembanding tetap)
- **ar** = suku kedua (U₂)
- **ar²** = suku ketiga (U₃)

#### **Menentukan Rasio (r)**

**Cara Utama: Bagi Dua Suku Berurutan**

```
r = U₂/U₁ = U₃/U₂ = U₄/U₃
```

**Contoh:**

Barisan: 3, 6, 12, 24, 48, ...
- r = 6/3 = 2
- r = 12/6 = 2 ✓
- r = 24/12 = 2 ✓

Barisan: 81, 27, 9, 3, 1, ...
- r = 27/81 = 1/3
- r = 9/27 = 1/3 ✓
- r = 3/9 = 1/3 ✓

**Sifat Rasio:**

- **r > 1** → barisan naik dengan cepat (pertumbuhan eksponensial)
- **r = 1** → barisan konstan (semua suku sama)
- **0 < r < 1** → barisan turun mendekati nol
- **r < 0** → barisan berselang-seling positif-negatif
- **r = 0** → setelah suku pertama, semua jadi nol

**Tips SNBT:** Kalau lihat barisan dengan angka yang naik/turun drastis, langsung suspect geometri!

#### **Rumus Suku ke-n: The Power Formula**

Inilah rumus yang bikin barisan geometri powerful banget:

**Uₙ = arⁿ⁻¹**

Di mana:
- **Uₙ** = suku ke-n
- **a** = suku pertama
- **r** = rasio
- **n** = posisi suku

**Kenapa Pangkat (n-1)?**

Sama kayak aritmatika, dari U₁ ke Uₙ, lo cuma "melompat" (n-1) kali!

- U₁ = a = ar⁰
- U₂ = ar = ar¹
- U₃ = ar² = ar²
- U₄ = ar³ = ar³
- Uₙ = arⁿ⁻¹

**Contoh Aplikasi:**

Barisan: 5, 15, 45, 135, ...

Cari U₈!

Diketahui:
- a = 5
- r = 15/5 = 3
- n = 8

Penyelesaian:
```
U₈ = 5 × 3⁸⁻¹
U₈ = 5 × 3⁷
U₈ = 5 × 2187
U₈ = 10.935
```

Cepet banget kan pertumbuhannya? Dari 5 langsung ke 10.935!

#### **Variasi Rumus (Wajib Tau!)**

**1. Mencari a (suku pertama):**
```
a = Uₙ / rⁿ⁻¹
```

**2. Mencari r (rasio):**
```
r = ⁿ⁻¹√(Uₙ / a)
```

atau kalau lo tau dua suku:
```
r = (Uₙ / Uₘ)^(1/(n-m))
```

**3. Mencari n (posisi suku):**
```
n = (log Uₙ - log a) / log r + 1
```

#### **Suku Tengah Barisan Geometri**

Kayak aritmatika, geometri juga punya konsep suku tengah, tapi lebih "spesial"!

**Untuk Barisan dengan n Suku Ganjil:**

```
Ut = √(U₁ × Uₙ)
```

**Beda dengan Aritmatika:**
- Aritmatika pakai **rata-rata** (jumlah dibagi 2)
- Geometri pakai **rata-rata geometrik** (akar dari perkalian)

**Contoh:**

Barisan: 2, 6, 18, 54, 162
- Ada 5 suku (ganjil)
- Posisi tengah = suku ke-3 = 18

Cek dengan rumus:
```
Ut = √(2 × 162)
Ut = √324
Ut = 18 ✓
```

**Sifat Menarik:**

Dalam barisan geometri, suku tengah itu juga bisa dicari dengan:
```
(Ut)² = U₁ × Uₙ
```

Atau kalau ada tiga suku berurutan dalam geometri: **a, b, c**
Maka: **b² = a × c**

Contoh: 4, 12, 36
- 12² = 144
- 4 × 36 = 144 ✓

#### **Sisipan dalam Barisan Geometri**

Konsepnya mirip aritmatika, tapi formulanya beda karena kita main di dunia perkalian!

**Kalau Disisipkan k Bilangan:**

**Rasio baru (r'):**
```
r' = ᵏ⁺¹√r
```

atau

```
r' = r^(1/(k+1))
```

Di mana:
- **r** = rasio awal
- **k** = banyak bilangan yang disisipkan
- **r'** = rasio baru

**Kenapa Bentuknya Begitu?**

Antara dua suku yang awalnya rasionya r, setelah disisip k bilangan, lo harus "mengalikan" (k+1) kali untuk sampai dari satu suku ke suku berikutnya. Makanya rasio baru adalah akar (k+1) dari r.

**Contoh Aplikasi:**

Barisan: 3, 24
- Rasio awal: r = 24/3 = 8
- Mau disisipkan 2 bilangan

Rasio baru:
```
r' = ³√8 = 2
```

Barisan baru:
- 3, **6**, **12**, 24

Cek:
- 3 × 2 = 6 ✓
- 6 × 2 = 12 ✓
- 12 × 2 = 24 ✓

**Jumlah Suku Setelah Sisipan:**

Sama kayak aritmatika:
```
Jumlah suku baru = n + k(n-1)
```

#### **Barisan Geometri dengan r Negatif**

Ini yang sering bikin bingung! Kalau rasio negatif, barisan jadi **berselang-seling tanda**.

**Contoh:**

Barisan: 2, -6, 18, -54, 162, ...
- r = -6/2 = -3
- r = 18/(-6) = -3 ✓

**Karakteristik:**
- Suku ganjil (U₁, U₃, U₅, ...) → bertanda sama dengan a
- Suku genap (U₂, U₄, U₆, ...) → bertanda berlawanan dengan a

**Rumus tetap sama:**
```
Uₙ = arⁿ⁻¹
```

Karena:
- r² = positif
- r³ = negatif
- r⁴ = positif
- dst.

Tandanya otomatis berselang-seling!

#### **Trik dan Tips SNBT**

**Tip #1: Deteksi Cepat Geometri**

Kalau lo lihat angka yang:
- Naik/turun sangat cepat
- Ada pola "dobel-dobel" (2, 4, 8, 16, ...)
- Ada pola "belah dua" (64, 32, 16, 8, ...)

→ Langsung suspect geometri!

**Tip #2: Gunakan Logaritma untuk Cari n**

Kalau diminta cari posisi suku tapi angkanya gede banget, pakai log!

Contoh: Kapan barisan 3, 6, 12, ... mencapai 3072?

```
3072 = 3 × 2ⁿ⁻¹
1024 = 2ⁿ⁻¹
log 1024 = (n-1) log 2
10 = n-1
n = 11
```

**Tip #3: Perhatikan Pecahan**

Rasio bisa berbentuk pecahan! Seperti:

Barisan: 8, 4, 2, 1, 1/2, ...
- r = 1/2

Atau: 27, 9, 3, 1, 1/3, ...
- r = 1/3

**Tip #4: Cek dengan Perkalian Silang**

Untuk tiga suku berurutan a, b, c dalam geometri:
```
b² = a × c
```

Ini bisa dipake buat cari suku yang hilang!

#### **Jebakan Umum di SNBT**

**Jebakan #1: Lupa Pangkat (n-1)**

Yang salah: Uₙ = arⁿ ← SALAH!
Yang bener: Uₙ = arⁿ⁻¹

**Jebakan #2: Rasio Negatif**

Barisan: 5, -10, 20, -40, ...

Jangan cuma lihat nilai mutlaknya! Rasionya -2, bukan 2!

**Jebakan #3: Salah Identifikasi**

Barisan: 2, 4, 8, 14, 22, ...

Kelihatannya geometri? BUKAN!
- 4/2 = 2
- 8/4 = 2
- 14/8 = 1.75 ← Rasio nggak tetap!

Ini bukan geometri!

**Jebakan #4: Perhitungan Pangkat**

r⁷ itu BUKAN 7r!

2⁷ = 128, bukan 14!

Hati-hati dengan operasi pangkat!

#### **Perbedaan Aritmatika vs Geometri**

| Aspek | Aritmatika | Geometri |
|-------|------------|----------|
| Operasi | **Tambah/Kurang** | **Kali/Bagi** |
| Penanda | **Beda (b)** | **Rasio (r)** |
| Rumus Uₙ | a + (n-1)b | arⁿ⁻¹ |
| Pertumbuhan | **Linear** | **Eksponensial** |
| Suku Tengah | (a + Uₙ)/2 | √(a × Uₙ) |

#### **Aplikasi Real Life**

**1. Pertumbuhan Bakteri**

Awal: 100 bakteri
Setiap jam membelah jadi 2

Jam 1: 100
Jam 2: 200
Jam 3: 400
Jam 4: 800

→ Geometri dengan r = 2

**2. Penyusutan Nilai Mobil**

Harga awal: Rp 200 juta
Tiap tahun menyusut 20% (sisa 80%)

Tahun 1: Rp 200 juta
Tahun 2: Rp 160 juta
Tahun 3: Rp 128 juta

→ Geometri dengan r = 0,8

**3. Bunga Majemuk**

Modal: Rp 10 juta
Bunga: 10% per tahun

Tahun 1: Rp 10 juta
Tahun 2: Rp 11 juta
Tahun 3: Rp 12,1 juta

→ Geometri dengan r = 1,1

**4. Viral Marketing**

Hari 1: 1 orang share
Hari 2: 5 orang share (masing-masing ke 5 orang)
Hari 3: 25 orang share

→ Geometri dengan r = 5

#### **Challenge Level SNBT**

Soal-soal geometri di SNBT bisa sangat tricky karena:

1. **Angkanya bisa sangat besar atau sangat kecil**
2. **Rasio bisa pecahan atau negatif**
3. **Bisa dikombinasi dengan logaritma**
4. **Bisa dalam bentuk soal cerita yang nggak obvious**

Yang penting: **TETAP TENANG dan IKUTI RUMUS**!

Barisan geometri ini ibarat roller coaster - pertumbuhannya bisa cepet banget naik atau turun. Tapi dengan pemahaman yang solid tentang konsep dan rumusnya, lo bisa handle semua jenis soal SNBT!

---
