# SECTION 2: Bilangan dan Aritmatika
## Topic 2.3: Barisan dan Deret

---


### **Materi 2.3.2: Barisan Aritmatika**

Oke, sekarang kita masuk ke salah satu superstar di dunia barisan: **Barisan Aritmatika**! Kalau lo udah paham konsep dasar dari materi sebelumnya, sekarang saatnya kita deep dive ke detail-detail yang bakal bantu lo menang di SNBT.

#### **Definisi yang Lebih Dalam**

Barisan aritmatika adalah barisan bilangan yang **selisih antara dua suku berurutan selalu tetap**. Selisih ini kita sebut **beda (b)**. Gampangnya, setiap suku selalu "jalan" dengan langkah yang sama.

Bayangin lo lagi naik tangga. Kalau tinggi setiap anak tangga sama (misalnya 20 cm semua), itu barisan aritmatika! Tapi kalau tingginya nggak konsisten (kadang 20 cm, kadang 25 cm), bukan barisan aritmatika.

**Bentuk Umum:**
```
a, a+b, a+2b, a+3b, a+4b, ...
```

Di mana:
- **a** = suku pertama (U₁)
- **b** = beda (selisih tetap)
- **a+b** = suku kedua (U₂)
- **a+2b** = suku ketiga (U₃)

#### **Menentukan Beda (b)**

Ada beberapa cara untuk nemuin beda:

**Cara 1: Kurangi Dua Suku Berurutan**
```
b = U₂ - U₁ = U₃ - U₂ = U₄ - U₃
```

Contoh: 5, 9, 13, 17, 21, ...
- b = 9 - 5 = 4
- b = 13 - 9 = 4 ✓
- b = 17 - 13 = 4 ✓

**Cara 2: Dari Rumus (Kalau Uₙ Diketahui)**

Kalau lo tau rumus suku ke-n nya, beda itu adalah koefisien dari n!

Contoh: Uₙ = 3n + 2
- Koefisien n adalah 3
- Jadi b = 3

**Tips SNBT:** Kadang soal kasih tau dua suku yang nggak berurutan (misalnya U₅ dan U₈). Cara cepetnya:
```
b = (U₈ - U₅) / (8 - 5) = (U₈ - U₅) / 3
```

#### **Rumus Suku ke-n: Formula Emas**

Ini dia rumus yang WAJIB lo hapal luar kepala:

**Uₙ = a + (n-1)b**

Di mana:
- **Uₙ** = suku ke-n yang dicari
- **a** = suku pertama (U₁)
- **n** = posisi suku
- **b** = beda

**Kenapa (n-1)?**

Karena dari suku pertama ke suku ke-n, lo cuma "melangkah" sebanyak (n-1) kali!

- Dari U₁ ke U₂ = 1 langkah
- Dari U₁ ke U₃ = 2 langkah
- Dari U₁ ke U₅ = 4 langkah

**Pembuktian Intuitif:**

Mari kita lihat barisan: 7, 11, 15, 19, 23, ...
- a = 7, b = 4

Untuk U₅:
- U₅ = 7 + (5-1)×4
- U₅ = 7 + 4×4
- U₅ = 7 + 16
- U₅ = 23 ✓

**Variasi Formula (Harus Tau!):**

Kadang soal SNBT minta lo nyari hal lain:

**1. Mencari a (suku pertama):**
```
a = Uₙ - (n-1)b
```

**2. Mencari b (beda):**
```
b = (Uₙ - a) / (n-1)
```

**3. Mencari n (posisi suku):**
```
n = (Uₙ - a) / b + 1
```

#### **Suku Tengah Barisan Aritmatika**

Ini konsep yang sering muncul di SNBT dalam bentuk soal tricky!

Kalau lo punya barisan aritmatika dengan jumlah suku **ganjil**, ada satu suku yang posisinya pas di tengah-tengah. Ini namanya **suku tengah (Ut)**.

**Rumus Suku Tengah:**

Untuk barisan dengan n suku (n ganjil):
```
Ut = (U₁ + Uₙ) / 2
```

atau

```
Ut = (a + Uₙ) / 2
```

**Posisi Suku Tengah:**
```
Posisi = (n + 1) / 2
```

**Contoh Aplikasi:**

Barisan: 3, 7, 11, 15, 19, 23, 27
- Ada 7 suku (ganjil)
- Posisi tengah = (7+1)/2 = 4
- Jadi U₄ adalah suku tengah
- Ut = U₄ = 15

**Cek dengan rumus:**
Ut = (U₁ + U₇) / 2 = (3 + 27) / 2 = 30/2 = 15 ✓

**Jebakan SNBT:** Kalau jumlah sukunya **genap**, TIDAK ADA suku tengah tunggal! Yang ada adalah dua suku tengah.

#### **Sisipan dalam Barisan Aritmatika**

Nah, ini materi yang bikin banyak siswa pusing! Tapi tenang, kita bahas pelan-pelan.

**Apa Itu Sisipan?**

Sisipan adalah bilangan-bilangan yang kita "selipkan" di antara dua suku dalam barisan, sehingga membentuk barisan aritmatika baru dengan beda yang lebih kecil.

**Contoh Sederhana:**

Barisan awal: 5, 15, 25
- Beda awal (b) = 10

Kita sisipkan **2 bilangan** di antara setiap dua suku:
- 5, **8**, **11**, 15, **18**, **21**, 25
- Beda baru (b') = 3

**Rumus Sisipan:**

Kalau kita menyisipkan **k bilangan** di antara dua suku:

**Beda baru (b'):**
```
b' = b / (k + 1)
```

Di mana:
- **b** = beda awal
- **k** = banyak bilangan yang disisipkan
- **b'** = beda baru setelah sisipan

**Penjelasan Rumus:**

Antara dua suku awalnya ada 1 "ruang" dengan beda b. Setelah disisipkan k bilangan, ruangnya jadi (k+1) bagian, jadi setiap bagian punya beda b/(k+1).

**Contoh Aplikasi:**

Barisan: 7, 19
- Beda awal = 19 - 7 = 12
- Mau disisipkan 3 bilangan

Beda baru:
- b' = 12 / (3+1) = 12/4 = 3

Barisan baru:
- 7, **10**, **13**, **16**, 19

**Jumlah Suku Setelah Sisipan:**

Kalau barisan awal punya n suku, setelah disisipkan k bilangan di antara setiap dua suku:

```
Jumlah suku baru = n + k(n-1)
```

**Contoh:**
- Barisan awal: 5 suku
- Sisipan: 2 bilangan di antara tiap dua suku
- Jumlah suku baru = 5 + 2(5-1) = 5 + 8 = 13 suku

#### **Trik dan Tips Khusus SNBT**

**Tip #1: Deteksi Pola Cepat**

Kalau lihat barisan kayak gini: 3, x, y, 15
Dan lo tau ini aritmatika, langsung aja:
- Jarak dari 3 ke 15 = 12
- Ada 3 "langkah" (3→x, x→y, y→15)
- Jadi b = 12/3 = 4
- x = 3+4 = 7
- y = 7+4 = 11

**Tip #2: Gunakan Sifat Simetris**

Dalam barisan aritmatika, kalau lo tau suku pertama dan terakhir:
```
U₁ + Uₙ = U₂ + Uₙ₋₁ = U₃ + Uₙ₋₂ = ...
```

Ini bisa banget dipake buat cari suku yang hilang!

**Tip #3: Perhatikan Tanda**

- Kalau b **positif** → barisan naik
- Kalau b **negatif** → barisan turun
- Kalau b = 0 → barisan konstan (semua sukunya sama)

**Jebakan Umum:**

1. **Lupa (n-1)**: Banyak yang salah nulis Uₙ = a + nb. SALAH! Yang bener Uₙ = a + (n-1)b

2. **Sisipan Bingung**: Inget, kalau nyisip k bilangan, beda baru dibagi (k+**1**), bukan k!

3. **Suku Tengah Genap**: Kalau n genap, jangan cari satu suku tengah. Nggak ada!

4. **Negatif Minus Negatif**: Misal b = -3, lalu U₁ = 10, maka U₂ = 10 + (-3) = 7, bukan 10 - (-3) = 13

#### **Aplikasi Real Life**

**1. Tabungan Rutin**
Januari: Rp 100.000
Februari: Rp 150.000
Maret: Rp 200.000
→ Barisan aritmatika, beda Rp 50.000

**2. Harga Tiket Bertingkat**
Baris 1: Rp 200.000
Baris 2: Rp 180.000
Baris 3: Rp 160.000
→ Barisan aritmatika, beda -Rp 20.000

**3. Jarak Kilometer**
Pos 1: km 5
Pos 2: km 12
Pos 3: km 19
→ Barisan aritmatika, beda 7 km

Nah, dengan pemahaman solid tentang barisan aritmatika ini, lo udah siap tackle berbagai jenis soal SNBT. Kuncinya: **practice, practice, practice!** Semakin sering lo latihan, semakin cepet lo bisa identifikasi pola dan apply rumus yang tepat.

---
