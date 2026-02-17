# SECTION 2: Bilangan dan Aritmatika
## Topic 2.3: Barisan dan Deret

---


### **Materi 2.3.5: Deret Geometri**

Oke, after lo master barisan geometri, sekarang waktunya naik level ke **deret geometri**! Ini adalah bagian di mana kita akan menjumlahkan suku-suku dari barisan geometri. Dan trust me, ini salah satu materi yang paling powerful dan sering muncul di SNBT dengan berbagai kemasan yang kadang bikin lo harus extra jeli!

#### **Definisi Deret Geometri**

Deret geometri adalah **jumlah suku-suku dari barisan geometri**. Kalau barisan geometri fokus ke urutannya, deret geometri fokus ke **total akumulasinya**.

Contoh barisan geometri: 2, 6, 18, 54, 162

Deret geometrinya: 2 + 6 + 18 + 54 + 162 = 242

Yang bikin deret geometri ini menarik adalah pertumbuhannya yang eksponensial bikin jumlahnya bisa membludak dengan cepat!

#### **Notasi Deret Geometri**

**Sₙ** = jumlah n suku pertama

- S₁ = U₁ = a
- S₂ = U₁ + U₂ = a + ar
- S₃ = U₁ + U₂ + U₃ = a + ar + ar²
- Sₙ = a + ar + ar² + ar³ + ... + arⁿ⁻¹

#### **Rumus Deret Geometri: Dua Versi!**

Ada dua rumus yang WAJIB lo hapal, dan kapan lo pakai tergantung dari nilai r!

**Rumus 1: Untuk r > 1 atau r < -1**

```
Sₙ = a(rⁿ - 1) / (r - 1)
```

**Rumus 2: Untuk -1 < r < 1**

```
Sₙ = a(1 - rⁿ) / (1 - r)
```

**Kenapa Ada Dua Rumus?**

Sebenernya sama aja! Cuma beda bentuk. Kalau lo perhatiin:

```
a(rⁿ - 1) / (r - 1) = a(1 - rⁿ) / (1 - r)
```

Tinggal kalikan pembilang dan penyebut dengan -1!

**Tips Memilih:**
- Kalau **r > 1** → pakai rumus 1 (lebih mudah karena rⁿ - 1 positif)
- Kalau **0 < r < 1** → pakai rumus 2 (lebih mudah karena 1 - r positif)
- Kalau **r < 0** → pilih yang bikin perhitungan lo lebih simpel

#### **Pembuktian Rumus (Perlu Tau!)**

Ini cara legendary untuk membuktikan rumus deret geometri:

Misalkan:
```
Sₙ = a + ar + ar² + ar³ + ... + arⁿ⁻¹  ... (1)
```

Kalikan kedua ruas dengan r:
```
rSₙ = ar + ar² + ar³ + ar⁴ + ... + arⁿ  ... (2)
```

Kurangi (1) dengan (2):
```
Sₙ - rSₙ = a - arⁿ
Sₙ(1 - r) = a(1 - rⁿ)
Sₙ = a(1 - rⁿ) / (1 - r)
```

Voila! Rumus jadi!

**Mind-blowing fact:** Rumus ini ditemukan ribuan tahun lalu dan masih dipakai sampai sekarang!

#### **Contoh Aplikasi Lengkap**

**Contoh 1: r > 1**

Hitung S₆ dari barisan: 3, 6, 12, 24, ...

Diketahui:
- a = 3
- r = 6/3 = 2
- n = 6

Penyelesaian (pakai rumus 1):
```
S₆ = 3(2⁶ - 1) / (2 - 1)
S₆ = 3(64 - 1) / 1
S₆ = 3 × 63
S₆ = 189
```

**Contoh 2: 0 < r < 1**

Hitung S₅ dari barisan: 16, 8, 4, 2, 1, ...

Diketahui:
- a = 16
- r = 8/16 = 1/2
- n = 5

Penyelesaian (pakai rumus 2):
```
S₅ = 16(1 - (1/2)⁵) / (1 - 1/2)
S₅ = 16(1 - 1/32) / (1/2)
S₅ = 16(31/32) / (1/2)
S₅ = 16 × 31/32 × 2
S₅ = 31
```

**Contoh 3: r < 0**

Hitung S₄ dari barisan: 5, -10, 20, -40, ...

Diketahui:
- a = 5
- r = -10/5 = -2
- n = 4

Penyelesaian:
```
S₄ = 5((-2)⁴ - 1) / (-2 - 1)
S₄ = 5(16 - 1) / (-3)
S₄ = 5 × 15 / (-3)
S₄ = -25
```

Atau cek manual: 5 + (-10) + 20 + (-40) = -25 ✓

#### **Kasus Khusus: r = 1**

Ini yang kadang bikin bingung! Kalau r = 1, berarti semua sukunya sama!

Barisan: a, a, a, a, a, ...

**Rumus Khusus:**
```
Sₙ = na
```

Contoh: Barisan 5, 5, 5, 5, 5, ...
- S₁₀ = 10 × 5 = 50

Simpel banget kan?

**Kenapa rumus biasa nggak bisa?**

Kalau lo coba substitusi r = 1:
```
Sₙ = a(1ⁿ - 1) / (1 - 1) = a(0) / 0 = ???
```

Nggak defined! Makanya perlu rumus khusus.

#### **Hubungan Sₙ dan Uₙ**

Sama kayak aritmatika, ada hubungan penting:

**Untuk n ≥ 2:**
```
Uₙ = Sₙ - Sₙ₋₁
```

**Untuk n = 1:**
```
U₁ = S₁ = a
```

**Contoh Aplikasi:**

Diketahui Sₙ = 3(2ⁿ - 1). Tentukan U₅!

Penyelesaian:
```
S₅ = 3(2⁵ - 1) = 3(31) = 93
S₄ = 3(2⁴ - 1) = 3(15) = 45
U₅ = S₅ - S₄ = 93 - 45 = 48
```

Cek: Dari rumus Sₙ = 3(2ⁿ - 1), kita bisa tau:
- a = 3
- r = 2
- U₅ = 3 × 2⁴ = 48 ✓

#### **Rumus Alternatif yang Power!**

**Kalau lo tau U₁ dan Uₙ:**

```
Sₙ = a(rⁿ - 1) / (r - 1)
```

Tapi Uₙ = arⁿ⁻¹, jadi rⁿ⁻¹ = Uₙ/a, maka rⁿ = rUₙ/a

Substitusi:
```
Sₙ = a(rUₙ/a - 1) / (r - 1)
Sₙ = (rUₙ - a) / (r - 1)
```

**Rumus Baru:**
```
Sₙ = (rUₙ - a) / (r - 1)
```

atau

```
Sₙ = (Uₙ·r - U₁) / (r - 1)
```

Berguna banget kalau lo tau suku pertama dan terakhir tapi nggak tau n!

#### **Trik Menghitung Cepat**

**Trik #1: Pola Rasio 2**

Kalau r = 2:
```
Sₙ = a(2ⁿ - 1)
```

Karena 2 - 1 = 1, jadi penyebutnya hilang!

**Trik #2: Pola Rasio 1/2**

Kalau r = 1/2:
```
Sₙ = 2a(1 - (1/2)ⁿ)
```

**Trik #3: Estimasi Cepat**

Untuk r besar (misal r = 5):
- Suku terakhir >>> semua suku sebelumnya
- Jadi Sₙ ≈ Uₙ·r / (r-1)

**Trik #4: Cek dengan Suku Awal**

Jumlah beberapa suku pertama:
- S₂ = a + ar = a(1 + r)
- S₃ = a + ar + ar² = a(1 + r + r²)

Bisa dipakai buat quick check!

#### **Jebakan di SNBT**

**Jebakan #1: Lupa Kurung**

Yang salah: Sₙ = a × rⁿ - 1 / r - 1
Yang bener: Sₙ = a(rⁿ - 1) / (r - 1)

Kurung itu PENTING!

**Jebakan #2: Salah Rumus r**

Kalau r = 0,8 (kurang dari 1):
- Lebih enak pakai rumus 2: Sₙ = a(1 - rⁿ) / (1 - r)
- Kalau maksa pakai rumus 1, bisa salah tanda!

**Jebakan #3: Pangkat Salah**

rⁿ bukan r × n!

3⁵ = 243, bukan 15!

**Jebakan #4: r = -1**

Barisan: a, -a, a, -a, ...

Jumlahnya:
- S₁ = a
- S₂ = 0
- S₃ = a
- S₄ = 0

Pola berulang! Nggak bisa pakai rumus biasa.

**Formula khusus r = -1:**
- Kalau n ganjil: Sₙ = a
- Kalau n genap: Sₙ = 0

#### **Variasi Soal SNBT**

**Tipe 1: Hitung Sₙ Langsung**

"Jumlah 8 suku pertama dari barisan 5, 15, 45, ..."

→ Straightforward, a = 5, r = 3, n = 8

**Tipe 2: Cari Suku dari Jumlah**

"Diketahui Sₙ = 2(3ⁿ - 1). Tentukan U₇!"

→ Gunakan Uₙ = Sₙ - Sₙ₋₁

**Tipe 3: Cari n**

"Jumlah n suku pertama adalah 1023. Jika a = 1 dan r = 2, tentukan n!"

→ Substitusi ke rumus:
```
1023 = 1(2ⁿ - 1) / 1
2ⁿ = 1024
n = 10
```

**Tipe 4: Cari a atau r**

"Suku pertama 3, jumlah 5 suku pertama 93. Tentukan rasio!"

→ Substitusi dan solve untuk r

**Tipe 5: Soal Cerita**

"Bakteri membelah diri tiap jam. Awal ada 10 bakteri. Berapa total bakteri setelah 6 jam?"

→ Ini deret geometri!

#### **Aplikasi Real Life**

**1. Bunga Majemuk**

Modal: Rp 10 juta
Bunga: 5% per bulan
Berapa total uang setelah 12 bulan?

Ini bukan cuma suku terakhir, tapi **akumulasi** semua bulan!

**2. Viral Content**

Posting di-share 3 kali per level
Level 1: 3 share
Level 2: 9 share
Level 3: 27 share
...

Total engagement setelah 6 level?

**3. Peluruhan Radioaktif**

Setengah meluruh tiap periode
Awal: 1000 gram
Periode 1: 500 gram
Periode 2: 250 gram
...

Total yang sudah meluruh setelah 10 periode?

**4. Piramida MLM**

Level 1: Rekrut 5 orang
Level 2: Masing-masing rekrut 5 orang = 25
Level 3: Masing-masing rekrut 5 orang = 125
...

Total anggota setelah 8 level?

#### **Tips Sukses SNBT**

1. **Hapal kedua rumus** dan tau kapan pakai yang mana
2. **Cek nilai r** dulu sebelum pilih rumus
3. **Hati-hati dengan tanda** terutama kalau r negatif
4. **Practice perhitungan pangkat** biar nggak lama di kalkulator
5. **Identifikasi pola** dari soal cerita

Dengan menguasai deret geometri, lo punya tool yang powerful banget buat berbagai aplikasi matematika dan real life. Next, kita akan bahas konsep yang bahkan lebih mind-blowing: **Deret Geometri Tak Hingga**!

---
