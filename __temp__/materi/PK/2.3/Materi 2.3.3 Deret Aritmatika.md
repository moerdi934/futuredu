# SECTION 2: Bilangan dan Aritmatika
## Topic 2.3: Barisan dan Deret

---


### **Materi 2.3.3: Deret Aritmatika**

Setelah lo paham barisan aritmatika, sekarang waktunya level up ke **deret aritmatika**! Kalau barisan itu fokus ke urutannya, deret itu fokus ke **jumlahnya**. Dan percaya deh, di SNBT, soal deret ini muncul dengan berbagai kemasan yang kadang bikin lo harus mikir ekstra!

#### **Definisi Deret Aritmatika**

Deret aritmatika adalah **jumlah suku-suku dari barisan aritmatika**. Sesimpel itu!

Kalau barisannya: 2, 5, 8, 11, 14

Maka deretnya: 2 + 5 + 8 + 11 + 14 = 40

Nah, yang jadi masalah adalah: gimana kalau lo diminta nyari jumlah 100 suku pertama? Nggak mungkin kan lo tambahin satu-satu? Di sinilah rumus deret jadi penyelamat!

#### **Notasi Deret**

**Sₙ** = jumlah n suku pertama

- S₁ = U₁
- S₂ = U₁ + U₂
- S₃ = U₁ + U₂ + U₃
- S₅ = U₁ + U₂ + U₃ + U₄ + U₅

#### **Rumus Deret Aritmatika: Dua Versi, Sama Powerful!**

Ada dua rumus utama untuk deret aritmatika, dan lo HARUS hapal keduanya karena kadang satu lebih efisien dari yang lain tergantung soalnya.

**Rumus 1: Pakai a dan b**

```
Sₙ = n/2 [2a + (n-1)b]
```

Pakai rumus ini kalau lo tau:
- Suku pertama (a)
- Beda (b)
- Banyak suku (n)

**Rumus 2: Pakai Suku Pertama dan Terakhir**

```
Sₙ = n/2 (a + Uₙ)
```

atau

```
Sₙ = n/2 (U₁ + Uₙ)
```

Pakai rumus ini kalau lo tau:
- Suku pertama (a atau U₁)
- Suku terakhir (Uₙ)
- Banyak suku (n)

**Kenapa Ada Dua Rumus?**

Karena Uₙ = a + (n-1)b, kalau lo substitusi ke rumus 2:

Sₙ = n/2 (a + Uₙ)
Sₙ = n/2 (a + a + (n-1)b)
Sₙ = n/2 (2a + (n-1)b) ← ini rumus 1!

Jadi sebenernya sama aja, cuma bentuknya beda.

#### **Cara Memilih Rumus yang Tepat**

**Gunakan Rumus 1** kalau:
- Soal kasih tau a, b, dan n
- Suku terakhir (Uₙ) nggak diketahui
- Lo harus cari jumlah dari awal

**Gunakan Rumus 2** kalau:
- Suku pertama dan terakhir udah diketahui
- Lo males ngitung (n-1)b
- Soalnya straightforward tentang suku awal dan akhir

**Contoh Aplikasi Rumus 1:**

Hitung S₁₀ dari barisan: 3, 7, 11, 15, ...

Diketahui:
- a = 3
- b = 4
- n = 10

Penyelesaian:
```
S₁₀ = 10/2 [2(3) + (10-1)(4)]
S₁₀ = 5 [6 + 36]
S₁₀ = 5 × 42
S₁₀ = 210
```

**Contoh Aplikasi Rumus 2:**

Hitung jumlah dari 5 sampai 25 dengan beda 5.

Diketahui:
- a = 5
- Uₙ = 25
- n = ? (cari dulu!)

Cari n:
```
25 = 5 + (n-1)5
20 = (n-1)5
4 = n-1
n = 5
```

Hitung jumlah:
```
S₅ = 5/2 (5 + 25)
S₅ = 5/2 × 30
S₅ = 75
```

#### **Hubungan Sₙ dan Uₙ: Formula Rahasia!**

Ini konsep yang JARANG diajarkan tapi SERING muncul di SNBT!

**Untuk n ≥ 2:**
```
Uₙ = Sₙ - Sₙ₋₁
```

**Artinya:** Suku ke-n adalah selisih antara jumlah n suku pertama dengan jumlah (n-1) suku pertama.

**Kenapa?**

Logikanya gini:
- Sₙ = U₁ + U₂ + U₃ + ... + Uₙ
- Sₙ₋₁ = U₁ + U₂ + U₃ + ... + Uₙ₋₁
- Sₙ - Sₙ₋₁ = Uₙ

**Contoh Aplikasi:**

Diketahui Sₙ = 2n² + 3n. Tentukan U₅!

Penyelesaian:
```
S₅ = 2(5)² + 3(5) = 50 + 15 = 65
S₄ = 2(4)² + 3(4) = 32 + 12 = 44
U₅ = S₅ - S₄ = 65 - 44 = 21
```

**Khusus untuk U₁:**
```
U₁ = S₁
```

#### **Rumus Alternatif yang Harus Lo Tau**

**1. Jumlah n Bilangan Ganjil Pertama**

1 + 3 + 5 + 7 + ... (n suku)

```
Sₙ = n²
```

Contoh: Jumlah 10 bilangan ganjil pertama = 10² = 100

**2. Jumlah n Bilangan Genap Pertama**

2 + 4 + 6 + 8 + ... (n suku)

```
Sₙ = n(n+1)
```

Contoh: Jumlah 10 bilangan genap pertama = 10(11) = 110

**3. Jumlah n Bilangan Asli Pertama**

1 + 2 + 3 + 4 + ... + n

```
Sₙ = n(n+1)/2
```

Ini rumus **Carl Friedrich Gauss** yang legendaris!

**Kisah di Balik Rumus:**

Konon waktu Gauss masih SD, gurunya nyuruh murid-murid menjumlahkan 1 sampai 100. Gurunya mikir ini bakal makan waktu lama. Eh, Gauss nyelesain dalam hitungan detik!

Caranya:
```
1 + 2 + 3 + ... + 98 + 99 + 100
```

Gauss pasang-pasangin dari ujung:
- 1 + 100 = 101
- 2 + 99 = 101
- 3 + 98 = 101
- ...
- 50 + 51 = 101

Ada 50 pasang, jadi: 50 × 101 = 5050

Dari sini lahirlah rumus n(n+1)/2 !

#### **Trik Menghitung Cepat**

**Trik #1: Pola Simetris**

Dalam deret aritmatika, lo bisa "lipat" deretnya:

```
2 + 5 + 8 + 11 + 14
14 + 11 + 8 + 5 + 2
-------------------
16 + 16 + 16 + 16 + 16 = 5 × 16 = 80
```

Jadi jumlahnya = 80/2 = 40

Ini sebenernya konsep di balik rumus Sₙ = n/2 (a + Uₙ) !

**Trik #2: Kalikan Rata-Rata**

Rata-rata deret aritmatika = (a + Uₙ) / 2

Jadi:
```
Sₙ = rata-rata × n = (a + Uₙ)/2 × n
```

**Trik #3: Gunakan Sifat n/2**

Kalau n genap (misal 20), hitung n/2 dulu (jadi 10), baru kalikan dengan bagian dalam kurung. Lebih cepet!

#### **Jebakan Umum di SNBT**

**Jebakan #1: Lupa Bagi 2**

Banyak yang nulis: Sₙ = n(2a + (n-1)b) ← SALAH!
Yang bener: Sₙ = n/2 [2a + (n-1)b]

**Jebakan #2: Salah Hitung Banyak Suku**

Soal: Hitung jumlah dari 5 sampai 50 dengan beda 5.

Jebakan: Langsung mikir n = 50/5 = 10 ← SALAH!

Yang bener:
- Barisan: 5, 10, 15, 20, ..., 50
- n = ((50-5)/5) + 1 = 10

Rumus umum untuk n:
```
n = ((Uₙ - a) / b) + 1
```

**Jebakan #3: Deret dengan Batasan**

Soal: Jumlahkan bilangan kelipatan 3 dari 12 sampai 99!

Jebakan: Langsung pake rumus tanpa identifikasi a dan Uₙ dulu.

Yang bener:
- Identifikasi: 12, 15, 18, ..., 99
- a = 12
- Uₙ = 99
- b = 3
- Cari n: (99-12)/3 + 1 = 30
- Baru hitung jumlahnya!

**Jebakan #4: Negatif**

Barisan: 20, 15, 10, 5, 0, -5, -10

Kalau diminta S₇:
```
S₇ = 7/2 (20 + (-10))
S₇ = 7/2 × 10
S₇ = 35
```

Jangan panik lihat angka negatif!

#### **Variasi Soal SNBT**

**Tipe 1: Cari Sₙ Langsung**

"Jumlah 15 suku pertama dari barisan 7, 11, 15, ..."

→ Straightforward, pake rumus 1.
**Tipe 2: Cari Suku Dari Sₙ**

"Diketahui Sₙ = 3n² - 2n. Tentukan U₁₀!"

→ Gunakan Uₙ = Sₙ - Sₙ₋₁

**Tipe 3: Cari n**

"Jumlah n suku pertama adalah 210. Jika a=3 dan b=4, tentukan n!"

→ Substitusi ke rumus, dapat persamaan kuadrat.

**Tipe 4: Soal Cerita**

"Andi menabung dengan pola: Januari Rp 50.000, Februari Rp 75.000, Maret Rp 100.000, ... Berapa total tabungannya setelah 1 tahun?"

→ Identifikasi pola, tentukan n=12, hitung deret.

**Tipe 5: Gabungan Barisan-Deret**

"Suku tengah barisan adalah 50, jumlah semua sukunya 500. Jika ada 10 suku, tentukan suku pertama!"

→ Kombinasi konsep barisan dan deret.

#### **Aplikasi dalam Kehidupan Nyata**

**1. Investasi Bertahap**

Bulan 1: Investasi Rp 1 juta
Bulan 2: Investasi Rp 1,2 juta
Bulan 3: Investasi Rp 1,4 juta
...

Total investasi setelah 12 bulan?
→ Deret aritmatika!

**2. Produksi Harian**

Hari 1: Produksi 100 unit
Hari 2: Produksi 120 unit
Hari 3: Produksi 140 unit
...

Total produksi seminggu?
→ Deret aritmatika!

**3. Pembagian Hadiah**

Juara 1: Rp 5 juta
Juara 2: Rp 4 juta
Juara 3: Rp 3 juta
...
Juara 10: ?

Total dana hadiah?
→ Deret aritmatika!

#### **Tips Sukses SNBT**

1. **Hapal KEDUA rumus** - kadang satu lebih cepet dari yang lain
2. **Cek apakah n diketahui** - kalau nggak, harus cari dulu!
3. **Perhatikan yang ditanya** - Sₙ atau Uₙ? Beda banget!
4. **Teliti dengan tanda** - negatif bisa bikin hasil beda jauh
5. **Practice soal variasi** - semakin banyak tipe soal, semakin siap lo

Dengan nguasain deret aritmatika, lo udah punya senjata ampuh buat tackle soal-soal SNBT. Next, kita bakal masuk ke dunia geometri yang nggak kalah seru!

---
