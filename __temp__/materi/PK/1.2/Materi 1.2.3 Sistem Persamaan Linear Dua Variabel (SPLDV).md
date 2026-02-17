# SECTION 1: Aljabar dan Persamaan
## Topic 1.2: Persamaan Linear

---


## **Materi 1.2.3: Sistem Persamaan Linear Dua Variabel (SPLDV)**

### 🎯 **Apa Itu SPLDV?**

Bayangin kamu lagi di warung:
- 2 bakso + 1 es teh = Rp25.000
- 1 bakso + 2 es teh = Rp20.000

Nah, **berapa harga 1 bakso** dan **berapa harga 1 es teh**?

Inilah esensi **Sistem Persamaan Linear Dua Variabel (SPLDV)**—kamu punya **2 persamaan** dengan **2 variabel** (x dan y), dan tugas kamu adalah cari nilai **kedua variabel** tersebut!

**Bentuk Umum SPLDV:**

ax + by = c  
dx + ey = f

Di mana:
- **x dan y** = variabel yang dicari
- **a, b, d, e** = koefisien
- **c dan f** = konstanta

**Contoh SPLDV:**

2x + 3y = 12  
x - y = 1

---

### 🎮 **Tiga Metode Penyelesaian SPLDV**

Ada **3 cara** populer untuk menyelesaikan SPLDV, dan di SNBT kamu **HARUS BISA KETIGANYA** karena beda soal, beda metode yang paling efisien!

1. **Metode Grafik** → visualisasi, tapi agak ribet
2. **Metode Substitusi** → cocok kalau salah satu koefisien udah 1
3. **Metode Eliminasi** → paling cepat kalau koefisien rapi

---

### 📈 **Metode 1: Metode Grafik**

**Konsep:**
Setiap persamaan linear punya **grafik berupa garis lurus**. Penyelesaian SPLDV adalah **titik potong** kedua garis!

**Langkah-langkah:**

1. Ubah setiap persamaan ke bentuk y = mx + c
2. Buat tabel nilai x dan y untuk setiap persamaan
3. Gambar kedua garis di koordinat Kartesius
4. Titik potong = penyelesaian (x, y)

---

**Contoh:**

**Soal:** Selesaikan dengan metode grafik!

x + y = 5  
x - y = 1

**Penyelesaian:**

**Persamaan 1:** x + y = 5 → y = 5 - x

| x | 0 | 5 |
|---|---|---|
| y | 5 | 0 |

**Persamaan 2:** x - y = 1 → y = x - 1

| x | 0 | 2 |
|---|---|---|
| y | -1 | 1 |

**Gambar grafik:**
```
      y
      |
    5 |●
      | \
      |  \
    1 |   ●--------●
      |    \   (3,2)
   -1 |     ●      \
      |____________●_____ x
      0     2      5
```

**Titik potong:** (3, 2)

Jadi **x = 3** dan **y = 2** ✅

**Cek:**
- 3 + 2 = 5 ✓
- 3 - 2 = 1 ✓

---

**Kapan Pakai Metode Grafik?**

❌ **JANGAN** pakai di SNBT kalau waktumu terbatas!  
✅ Pakai kalau:
- Soalnya **khusus minta** gambar grafik
- Nilai x dan y-nya **bilangan bulat kecil**
- Kamu butuh **visualisasi** untuk paham konsep

**Tips SNBT:** Metode grafik **paling lambat**, jadi cuma pakai kalau diminta!

---

### 🔄 **Metode 2: Metode Substitusi**

**Konsep:**
Nyatakan salah satu variabel (misalnya x) dari persamaan pertama, lalu **substitusi** (ganti) ke persamaan kedua!

**Langkah-langkah:**

1. Pilih salah satu persamaan (yang paling simpel)
2. Nyatakan salah satu variabel dalam variabel lain (misal: x = ... atau y = ...)
3. Substitusi ke persamaan lainnya
4. Selesaikan untuk mendapat 1 variabel
5. Substitusi balik untuk cari variabel satunya

---

**Contoh 1: Bentuk Sederhana**

**Soal:**

x + y = 5 ... (1)  
x - y = 1 ... (2)

**Penyelesaian:**

**Dari persamaan (1):**
x + y = 5
x = 5 - y ... (3)

**Substitusi (3) ke (2):**
(5 - y) - y = 1
5 - y - y = 1
5 - 2y = 1
-2y = 1 - 5
-2y = -4
**y = 2** ✅

**Substitusi y = 2 ke (3):**
x = 5 - 2
**x = 3** ✅

Jadi **x = 3, y = 2**

---

**Contoh 2: Ada Koefisien**

**Soal:**

2x + 3y = 12 ... (1)  
x - y = 1 ... (2)

**Penyelesaian:**

**Dari persamaan (2):** (pilih yang koefisiennya 1!)
x - y = 1
x = y + 1 ... (3)

**Substitusi (3) ke (1):**
2(y + 1) + 3y = 12
2y + 2 + 3y = 12
5y + 2 = 12
5y = 10
**y = 2** ✅

**Substitusi y = 2 ke (3):**
x = 2 + 1
**x = 3** ✅

---

**Contoh 3: Pecahan (Agak Ribet)**

**Soal:**

x/2 + y = 5 ... (1)  
x - 2y = 2 ... (2)

**Penyelesaian:**

**Dari persamaan (2):**
x - 2y = 2
x = 2y + 2 ... (3)

**Substitusi (3) ke (1):**
(2y + 2)/2 + y = 5
y + 1 + y = 5
2y = 4
**y = 2** ✅

**Substitusi y = 2 ke (3):**
x = 2(2) + 2 = 6
**x = 6** ✅

---

**Kapan Pakai Metode Substitusi?**

✅ Pakai kalau:
- Salah satu persamaan **sudah ada koefisien 1** (x = ... atau y = ...)
- Salah satu persamaan **mudah diubah** (misal: x - y = ...)
- Koefisien **gak terlalu besar**

❌ Hindari kalau:
- Semua koefisien **besar dan ribet**
- Bakal dapat pecahan yang ruwet

---

### ⚡ **Metode 3: Metode Eliminasi**

**Konsep:**
**Hilangkan** (eliminasi) salah satu variabel dengan **menjumlahkan atau mengurangkan** kedua persamaan!

**Langkah-langkah:**

1. Samakan koefisien salah satu variabel (kalau belum sama)
2. Eliminasi variabel tersebut (jumlahkan atau kurangkan)
3. Dapat nilai satu variabel
4. Eliminasi variabel lainnya
5. Dapat nilai variabel kedua

---

**Contoh 1: Koefisien Sudah Berlawanan**

**Soal:**

x + y = 5 ... (1)  
x - y = 1 ... (2)

**Penyelesaian:**

**Eliminasi y** (koefisien y sudah +1 dan -1, tinggal jumlahkan!)

```
  x + y = 5
  x - y = 1
  _________ +
  2x    = 6
```

**x = 3** ✅

**Eliminasi x** (koefisien x sama, tinggal kurangkan!)

```
  x + y = 5
  x - y = 1
  _________ -
    2y  = 4
```

**y = 2** ✅

Jadi **x = 3, y = 2**

---

**Contoh 2: Koefisien Belum Sama**

**Soal:**

2x + 3y = 12 ... (1)  
x - y = 1 ... (2)

**Penyelesaian:**

**Eliminasi x:**

Samakan koefisien x dulu! (KPK dari 2 dan 1 adalah 2)
- Persamaan (1) **dikali 1** → 2x + 3y = 12
- Persamaan (2) **dikali 2** → 2x - 2y = 2

```
  2x + 3y = 12
  2x - 2y = 2
  ___________ -
       5y = 10
```

**y = 2** ✅

**Eliminasi y:**

Samakan koefisien y! (KPK dari 3 dan 1 adalah 3)
- Persamaan (1) **dikali 1** → 2x + 3y = 12
- Persamaan (2) **dikali 3** → 3x - 3y = 3

```
  2x + 3y = 12
  3x - 3y = 3
  ___________ +
  5x      = 15
```

**x = 3** ✅

---

**Contoh 3: Koefisien Besar**

**Soal:**

3x + 2y = 7 ... (1)  
5x - 4y = -1 ... (2)

**Penyelesaian:**

**Eliminasi y:**

Samakan koefisien y! (KPK dari 2 dan 4 adalah 4)
- Persamaan (1) **dikali 2** → 6x + 4y = 14
- Persamaan (2) **dikali 1** → 5x - 4y = -1

```
  6x + 4y = 14
  5x - 4y = -1
  ___________ +
  11x     = 13
```

**x = 13/11** (wah pecahan!)

Kalau udah dapat pecahan, biasanya ada yang salah ATAU soal emang sengaja bikin pecahan. Di SNBT, kalau ada pilihan jawaban, **cek dulu** sebelum lanjut!

---

**Kapan Pakai Metode Eliminasi?**

✅ Pakai kalau:
- Koefisien **sudah rapi** atau **mudah disamakan**
- Kamu **gak suka substitusi** yang ribet
- Mau **cepet** dan **langsung**

❌ Hindari kalau:
- Koefisien **super besar** dan susah disamakan
- Salah satu koefisien sudah 1 (mending substitusi)

---

### 🎯 **Tips Memilih Metode**

| **Kondisi Soal** | **Metode Terbaik** | **Alasan** |
|------------------|---------------------|------------|
| Ada koefisien 1 (x = ... atau y = ...) | **Substitusi** | Paling cepat! |
| Koefisien berlawanan (+y dan -y) | **Eliminasi** | Tinggal jumlah/kurang! |
| Koefisien mudah disamakan | **Eliminasi** | Efisien! |
| Diminta gambar grafik | **Grafik** | Gak ada pilihan! |
| Soal cerita yang rumit | **Substitusi/Eliminasi** | Sesuai preferensi |

---

### 🔍 **Jenis-jenis Penyelesaian SPLDV**

SPLDV bisa punya **3 jenis** penyelesaian, dan ini SERING muncul di SNBT!

**1. Penyelesaian Tunggal** ✅

Kedua garis **berpotongan** di satu titik.

**Ciri-ciri:**
- Gradien kedua garis **berbeda**
- Ada **satu pasangan (x, y)** yang memenuhi

**Contoh:**

x + y = 5  
x - y = 1

→ Penyelesaian: (3, 2) ✅

---

**2. Tak Hingga Banyak Penyelesaian** ∞

Kedua garis **SAMA** (berhimpit).

**Ciri-ciri:**
- Persamaan (2) = kelipatan dari persamaan (1)
- Rasio a₁:a₂ = b₁:b₂ = c₁:c₂
- Semua titik di garis adalah penyelesaian

**Contoh:**

2x + 4y = 6  
x + 2y = 3

Persamaan (1) = 2 × Persamaan (2) → **SAMA!**

---

**3. Tidak Ada Penyelesaian** ❌

Kedua garis **sejajar** (tidak berpotongan).

**Ciri-ciri:**
- Gradien sama, tapi beda konstanta
- Rasio a₁:a₂ = b₁:b₂ ≠ c₁:c₂

**Contoh:**

2x + 4y = 6  
x + 2y = 5

Gradien sama (keduanya y = -½x + ...), tapi konstanta beda → **SEJAJAR!**

---

### 🎪 **Aplikasi SPLDV dalam Soal Cerita**

Ini **FAVORIT SNBT**! Biasanya ada 2-3 soal tentang SPLDV yang dibungkus soal cerita.

**Strategi M.A.T.I.K.A (versi SPLDV):**

**M - Membaca** soal dengan teliti (2x!)  
**A - Anggap** variabel (x dan y untuk apa)  
**T - Tulis** dua persamaan dari informasi  
**I - Itung** (pilih metode terbaik)  
**K - Kembali** ke konteks soal  
**A - Answer** dengan satuan yang benar!  

---

**Tipe 1: Soal Harga Barang**

**Contoh Bacaan:**

"Di sebuah toko, harga 2 buku dan 3 pensil adalah Rp17.000, sedangkan harga 3 buku dan 1 pensil adalah Rp16.000. Berapa harga 1 buku dan 1 pensil?"

**Penyelesaian:**

Misalkan:
- Harga 1 buku = x
- Harga 1 pensil = y

**Persamaan:**
2x + 3y = 17.000 ... (1)  
3x + y = 16.000 ... (2)

**Pakai Eliminasi** (eliminasi y karena koefisiennya mudah):

Persamaan (2) dikali 3:
9x + 3y = 48.000

```
  9x + 3y = 48.000
  2x + 3y = 17.000
  _______________ -
  7x      = 31.000
```

**x = Rp4.428,57...** ← **EH TUNGGU!**

Harusnya harga buku angka **bulat**. Cek lagi soalnya!

*(Kalau di SNBT real, biasanya angkanya pas. Ini contoh biar kamu WASPADA!)*

---

**Tipe 2: Soal Umur**

**Contoh Bacaan:**

"Jumlah umur Ayah dan Ibu adalah 80 tahun. Selisih umur mereka adalah 6 tahun. Berapa umur Ayah dan Ibu?"

**Penyelesaian:**

Misalkan:
- Umur Ayah = x
- Umur Ibu = y

**Persamaan:**
x + y = 80 ... (1)  
x - y = 6 ... (2) (anggap Ayah lebih tua)

**Pakai Eliminasi** (koefisien sudah berlawanan!):

```
  x + y = 80
  x - y = 6
  _________ +
  2x    = 86
```

**x = 43 tahun** ✅

Substitusi ke (1):
43 + y = 80
**y = 37 tahun** ✅

Jadi **Ayah 43 tahun, Ibu 37 tahun**.

---

**Tipe 3: Soal Campuran**

**Contoh Bacaan:**

"Sebuah larutan dibuat dengan mencampurkan larutan A (konsentrasi 20%) dan larutan B (konsentrasi 50%). Jika ingin membuat 100 liter larutan dengan konsentrasi 35%, berapa liter masing-masing larutan A dan B yang dibutuhkan?"

**Penyelesaian:**

Misalkan:
- Volume larutan A = x liter
- Volume larutan B = y liter

**Persamaan:**
x + y = 100 ... (1) (total volume)  
0,2x + 0,5y = 0,35(100) ... (2) (total konsentrasi)

**Sederhanakan (2):**
0,2x + 0,5y = 35
2x + 5y = 350 (kalikan 10)

**Pakai Substitusi** (dari persamaan 1):
x = 100 - y ... (3)

Substitusi ke (2):
2(100 - y) + 5y = 350
200 - 2y + 5y = 350
3y = 150
**y = 50 liter** ✅

**x = 100 - 50 = 50 liter** ✅

Jadi butuh **50 liter larutan A dan 50 liter larutan B**.

---

**Tipe 4: Soal Kecepatan dan Jarak**

**Contoh Bacaan:**

"Jarak antara kota A dan B adalah 120 km. Sebuah mobil berangkat dari A ke B dengan kecepatan v km/jam dan kembali dengan kecepatan (v+20) km/jam. Jika total waktu perjalanan adalah 5 jam, berapa kecepatan mobil saat berangkat?"

**Penyelesaian:**

**Rumus:** Waktu = Jarak / Kecepatan

Waktu A → B: 120/v  
Waktu B → A: 120/(v+20)

**Persamaan:**
120/v + 120/(v+20) = 5

**Sederhanakan** (kalikan v(v+20)):
120(v+20) + 120v = 5v(v+20)
120v + 2400 + 120v = 5v² + 100v
240v + 2400 = 5v² + 100v
5v² - 140v - 2400 = 0
v² - 28v - 480 = 0

**Pakai rumus ABC:**
v = (28 ± √(784 + 1920)) / 2
v = (28 ± √2704) / 2
v = (28 ± 52) / 2

**v = 40** atau **v = -12** ❌ (kecepatan gak mungkin negatif!)

Jadi kecepatan saat berangkat adalah **40 km/jam** ✅

---

### 🚨 **Jebakan Umum di SNBT**

**Jebakan #1: Salah Eliminasi (Tanda ± Kacau)**

❌ **SALAH:**
```
  2x + 3y = 12
  x - y = 1
```
Eliminasi x, harusnya persamaan (2) dikali 2:
```
  2x + 3y = 12
  2x - 2y = 2
  ___________ - (SALAH! harusnya +)
```

✅ **BENAR:**
Karena **tanda sama** (2x dan 2x), operasinya **KURANG**!

---

**Jebakan #2: Lupa Kalikan Semua Suku**

❌ **SALAH:**
Persamaan x - y = 1 dikali 3:
3x - y = 3 ← **LUPA kalikan -y!**

✅ **BENAR:**
3x - 3y = 3

---

**Jebakan #3: Substitusi ke Persamaan yang Salah**

❌ **SALAH:**
Dapat x = 3, lalu substitusi ke hasil eliminasi (bukan ke persamaan awal!)

✅ **BENAR:**
Substitusi ke **salah satu persamaan AWAL** (1) atau (2)

---

**Jebakan #4: Salah Interpretasi Soal Cerita**

**Contoh:**
"Selisih umur mereka 6 tahun" → **bisa** x - y = 6 **ATAU** y - x = 6!

**Tips:** Anggap yang lebih tua itu **x**, jadi x - y = 6 (positif).

---

**Jebakan #5: Garis Sejajar/Berhimpit (Tidak Tunggal)**

Kalau soal SPLDV berujung:
- **0 = 0** → Tak hingga penyelesaian (garis berhimpit)
- **0 = 5** (atau angka lain) → Tidak ada penyelesaian (garis sejajar)

Di SNBT, biasanya ada **pilihan "tidak ada penyelesaian"** atau "tak hingga penyelesaian".

---

### 💡 **Insight Khusus SNBT**

**1. Metode Hybrid (Mix & Match)**

Kadang SNBT suka soal yang lebih cepat kalau pakai **eliminasi dulu, baru substitusi**:
- Eliminasi untuk dapat **1 variabel**
- Substitusi untuk **cek** atau dapat variabel satunya

Fleksibel aja!

---

**2. Cek dengan Pilihan Jawaban**

Kalau ada pilihan jawaban, **substitusi** pilihan ke kedua persamaan. Yang memenuhi **kedua persamaan** = jawaban benar!

**Contoh:**
Pilihan: (3, 2), (2, 3), (4, 1)

Cek ke persamaan x + y = 5 dan x - y = 1:
- (3, 2): 3+2=5 ✓ dan 3-2=1 ✓ → **BINGO!**
- (2, 3): 2+3=5 ✓ tapi 2-3=-1 ✗
- (4, 1): 4+1=5 ✓ tapi 4-1=3 ✗

---

**3. Soal Cerita = Fokus ke Informasi Numerik**

Buang kata-kata yang gak penting! Fokus ke:
- **Angka** (berapa harga, berapa umur, dll)
- **Hubungan** (jumlah, selisih, perbandingan)
- **Yang ditanya** (cari apa?)

---

**4. Satuan Harus Konsisten**

Kalau soal pakai **satuan berbeda**, UBAH dulu jadi sama!
- Jam vs menit → ubah semua ke menit
- Kg vs gram → ubah semua ke gram
- Km vs m → ubah semua ke m

---

### 🎓 **Kesimpulan: Mindset Juara SNBT**

SPLDV itu **core skill** SNBT! Kamu **HARUS MAHIR** karena:

1. ✅ Muncul **minimal 2-3 soal** per test
2. ✅ Sering dibungkus **soal cerita** yang tricky
3. ✅ Butuh **kecepatan** (pilih metode yang tepat!)
4. ✅ Bisa jadi **jebakan** kalau gak teliti

**Checklist Mahir SPLDV:**
- ✅ Bisa 3 metode (grafik, substitusi, eliminasi)
- ✅ Tahu **kapan** pakai metode mana
- ✅ Lancar **translate** soal cerita jadi persamaan
- ✅ Bisa **cek** jawaban dengan substitusi
- ✅ Paham **jenis penyelesaian** (tunggal, tak hingga, tidak ada)

---

Oke, udah mantap SPLDV-nya! Sekarang kita masuk ke level aplikasi yang lebih seru lagi! 🎉

---
