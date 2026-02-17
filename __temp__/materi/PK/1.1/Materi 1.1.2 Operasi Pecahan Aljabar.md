# SECTION 1: Aljabar dan Persamaan
## Topic 1.1: Operasi Aljabar Dasar

---


## **Materi 1.1.2: Operasi Pecahan Aljabar**

### 🎯 **Pecahan Aljabar: Gabungan Dua Dunia!**

Kalau di materi sebelumnya kamu udah kenalan sama aljabar, sekarang saatnya kenalin dia ke **pecahan**! Bayangin pecahan aljabar itu kayak smoothie—campuran dua bahan (pembilang dan penyebut) yang harus kamu blend dengan benar biar hasilnya enak!

Pecahan aljabar adalah bentuk **pembagian** antara dua bentuk aljabar, di mana pembilang dan/atau penyebut mengandung variabel.

**Bentuk umum:**
```
p(x)
----
q(x)
```

Di mana:
- `p(x)` = pembilang (numerator)
- `q(x)` = penyebut (denominator)
- `q(x) ≠ 0` ← **SUPER PENTING!**

---

### 🚨 **Konsep Pecahan Aljabar dan Syarat Penyebutnya**

**Aturan Emas Pecahan:**
> **PENYEBUT TIDAK BOLEH NOL!**

Kenapa? Karena **pembagian dengan nol itu tidak terdefinisi** dalam matematika. Ini kayak kamu mau bagi kue ke 0 orang—gak masuk akal kan?

**Contoh:**
```
   x + 3
   -----
   x - 2
```

Syarat: `x - 2 ≠ 0`, jadi `x ≠ 2`

**Contoh 2:**
```
     2x
   -------
   x² - 9
```

Syarat: `x² - 9 ≠ 0`
→ `(x + 3)(x - 3) ≠ 0`
→ `x ≠ -3` dan `x ≠ 3`

**🎯 Jebakan SNBT:** Soal sering tanya "Nilai x yang memenuhi adalah..." terus kasih pilihan yang **bikin penyebut nol**. Ini jebakan! Nilai itu **TIDAK MEMENUHI** karena bikin pecahan gak terdefinisi!

---

### 🔧 **Penyederhanaan Pecahan Aljabar dengan Faktorisasi**

Seperti pecahan biasa, pecahan aljabar bisa disederhanakan dengan **membagi pembilang dan penyebut dengan faktor persekutuan**.

**Langkah-langkah:**
1. **Faktorkan** pembilang dan penyebut
2. **Coret** faktor yang sama
3. **Tulis** hasil penyederhanaan

**Contoh 1: Sederhana**
```
  6x        6·x       3
  --- = --------- = ---
  8x        8·x       4
  
(Asumsi x ≠ 0)
```

**Contoh 2: Menggunakan Faktorisasi**
```
  x² - 4        (x + 2)(x - 2)       x + 2
  ------- = ------------------- = ---------
  x² - 2x      x(x - 2)              x

(Asumsi x ≠ 0, x ≠ 2)
```

**Contoh 3: Advanced**
```
  x² + 5x + 6      (x + 2)(x + 3)       x + 3
  ----------- = ----------------- = ---------
  x² + 4x + 4      (x + 2)(x + 2)       x + 2

(Asumsi x ≠ -2)
```

**🔥 Teknik Faktorisasi yang Sering Muncul:**

1. **Faktor Persekutuan:**
   ```
   3x + 6     3(x + 2)     3
   ------ = --------- = -----
   x + 2       x + 2       1
   ```

2. **Selisih Dua Kuadrat:**
   ```
   x² - 25      (x + 5)(x - 5)      x + 5
   ------- = ----------------- = ---------
   x² - 5x      x(x - 5)            x
   ```

3. **Trinomial Kuadrat:**
   ```
   x² - 7x + 12     (x - 3)(x - 4)     x - 3
   ------------ = ----------------- = -------
   x² - 6x + 8      (x - 2)(x - 4)     x - 2
   ```

**🎯 Jebakan SNBT #1:** **JANGAN coret sembarangan!**
```
❌ SALAH:
  x + 5       5
  ----- = ----- 
  x + 3       3
  
(Kamu gak bisa coret x yang dijumlahkan!)
```

```
✅ Baru boleh coret kalau dalam bentuk PERKALIAN:
  x(x + 5)      x + 5
  -------- = ---------
  x(x + 3)      x + 3
```

**🎯 Jebakan SNBT #2:** Hati-hati dengan tanda!
```
  x - 5        x - 5        -1
  ----- = ------------- = -----
  5 - x      -(x - 5)       1

(Karena 5 - x = -(x - 5))
```

**💡 Tips SNBT:** Kalau lihat penyebut dan pembilang yang "hampir sama" tapi kebalik, coba keluarkan tanda minus!

---

### ➕➖ **Penjumlahan dan Pengurangan Pecahan Aljabar**

Prinsipnya **SAMA PERSIS** kayak pecahan biasa:
1. Samakan penyebut (cari KPK)
2. Jumlahkan/kurangkan pembilang
3. Sederhanakan hasil

**Kasus 1: Penyebut Sudah Sama**
```
  3        5        3 + 5       8
----- + ----- = --------- = ---------
x + 2   x + 2      x + 2       x + 2
```

**Kasus 2: Penyebut Berbeda (Sederhana)**
```
  2       3
----- + ---
  x       y

KPK dari x dan y adalah xy, jadi:

  2·y     3·x      2y + 3x
= ----- + ----- = ----------
  x·y     y·x         xy
```

**Kasus 3: Penyebut Berbeda (Dengan Faktorisasi)**
```
    1         2
--------- + -------
(x + 1)     (x - 1)

KPK = (x + 1)(x - 1), jadi:

  1·(x - 1)       2·(x + 1)
= ----------- + -------------
  (x+1)(x-1)     (x-1)(x+1)

  (x - 1) + 2(x + 1)
= -------------------
    (x + 1)(x - 1)

  x - 1 + 2x + 2
= ----------------
   (x + 1)(x - 1)

     3x + 1
= ---------------
  (x + 1)(x - 1)
```

**Contoh 4: Advanced (KPK Kompleks)**
```
    3           2
--------- - ---------
x² - 4      x² - 4x + 4

Faktorkan penyebut:
= (x + 2)(x - 2)  dan  (x - 2)²

KPK = (x + 2)(x - 2)²

      3·(x - 2)              2·(x + 2)
= ----------------- - ---------------------
  (x+2)(x-2)(x-2)      (x-2)(x-2)(x+2)

  3(x - 2) - 2(x + 2)
= ---------------------
   (x+2)(x-2)²

  3x - 6 - 2x - 4
= -----------------
   (x+2)(x-2)²

      x - 10
= ---------------
  (x+2)(x-2)²
```

**🎯 Jebakan SNBT #1:** Saat mengalikan silang, JANGAN lupa tanda kurung!
```
❌ SALAH:
  1       2        1·x-1 + 2·x+1
----- + ----- = -----------------
x + 1   x - 1     (x+1)(x-1)

✅ BENAR:
  1       2        1·(x-1) + 2·(x+1)
----- + ----- = ---------------------
x + 1   x - 1       (x+1)(x-1)
```

**🎯 Jebakan SNBT #2:** Hati-hati saat **PENGURANGAN**!
```
  5       3        5·y - 3·x      5y - 3x
--- - --- = -------------- = -----------
  x     y           xy              xy

BUKAN: (5 - 3)(y + x) ← INI SALAH TOTAL!
```

**💡 Tips SNBT:** Kalau penyebutnya udah dalam bentuk faktor, **JANGAN dikalikan jadi bentuk baku**. Lebih enak tetap dalam bentuk faktor buat nyari KPK!

---

### ✖️➗ **Perkalian dan Pembagian Pecahan Aljabar**

**A. PERKALIAN**

Perkalian pecahan aljabar jauh lebih **gampang** daripada penjumlahan!

**Rumus:**
```
a     c      a·c
- × --- = -------
b     d      b·d
```

**Langkah:**
1. Faktorkan (kalau bisa)
2. Coret faktor yang sama
3. Kalikan pembilang dengan pembilang, penyebut dengan penyebut

**Contoh 1:**
```
  x        x + 2         x(x + 2)
----- × --------- = ---------------
x + 2      x + 3      (x+2)(x+3)

                       x
                  = -------
                     x + 3
```

**Contoh 2:**
```
  x² - 9       x + 1
--------- × ---------
  x + 1      x² + 3x

  (x+3)(x-3)     x + 1
= ---------- × ---------
    x + 1       x(x+3)

  (x-3)
= -----
    x
```

**Contoh 3: Multiple Fractions**
```
  x² - 4      x + 3        2
--------- × ------- × -------
x² + 5x + 6   x - 2      x + 2

  (x+2)(x-2)    x + 3          2
= ---------- × --------- × -------
  (x+2)(x+3)    x - 2       x + 2

         2
= -----------
     x + 2
```

**🔥 Shortcut:** Coret **SEBELUM** mengalikan! Ini bakal menghemat waktu dan mengurangi kemungkinan error.

---

**B. PEMBAGIAN**

Pembagian = Perkalian dengan **kebalikan** (reciprocal)!

**Rumus:**
```
a     c      a     d      a·d
- ÷ --- = - × --- = -------
b     d      b     c      b·c
```

**Caranya:**
1. **Balik** pecahan yang kedua
2. **Ubah** pembagian jadi perkalian
3. Lanjutkan seperti perkalian biasa

**Contoh 1:**
```
  x        x + 2        x         x + 3
----- ÷ --------- = ------- × ---------
x + 3      x + 3      x + 3       x + 2

                        x
                  = ---------
                      x + 2
```

**Contoh 2:**
```
  x² - 1       x - 1
--------- ÷ ---------
  x + 2        x + 2

  (x+1)(x-1)     x + 2
= ---------- × ---------
     x + 2       x - 1

           x + 1
= -------------------
          1

= x + 1
```

**Contoh 3: Advanced**
```
  x² + 4x + 4      x + 2
------------- ÷ ---------
   x² - 9         x² - 3x

  (x+2)²        x(x-3)
= -------- × -----------
  (x+3)(x-3)    x + 2

   (x+2)·x
= ----------
    x + 3

   x² + 2x
= ---------
    x + 3
```

**🎯 Jebakan SNBT:** Jangan lupa **BALIK yang KEDUA**, bukan yang pertama!
```
❌ SALAH: a/b ÷ c/d = b/a × c/d
✅ BENAR: a/b ÷ c/d = a/b × d/c
```

---

### 📝 **Penyelesaian Soal Aplikasi Pecahan Aljabar**

Di SNBT, pecahan aljabar sering muncul dalam **soal cerita** atau **soal gabungan**. Berikut tipe-tipe soal yang sering keluar:

**Tipe 1: Penyederhanaan Kompleks**
```
Sederhanakan:
    1           1
--------- - ---------
x(x + 1)    (x+1)(x+2)

Jawab:
KPK = x(x+1)(x+2)

  (x+2) - x
= -----------
  x(x+1)(x+2)

     2
= -----------
  x(x+1)(x+2)
```

**Tipe 2: Operasi Campuran**
```
   x + 1      x - 1         2
  ------- + ------- × ---------
   x - 1      x + 2       x + 1

Kerjakan perkalian dulu:

       (x-1)·2
= ... + --------
       (x+2)(x+1)

(Lanjutkan dengan samakan penyebut...)
```

**Tipe 3: Soal "Nilai yang Memenuhi"**
```
Pecahan  2x + 1
         ------  terdefinisi untuk x = ...
         x² - 4

Jawab:
Syarat: x² - 4 ≠ 0
→ (x+2)(x-2) ≠ 0
→ x ≠ -2 dan x ≠ 2

Jadi nilai yang TIDAK memenuhi: x = -2 atau x = 2
```

**Tipe 4: Mencari Nilai Variabel**
```
Jika  x + 3     5
      ----- = -----, maka x = ...
      x - 1     2

Cross multiply:
2(x + 3) = 5(x - 1)
2x + 6 = 5x - 5
6 + 5 = 5x - 2x
11 = 3x
x = 11/3
```

**🎯 Jebakan SNBT #1:** Soal suka kasih "nilai x yang memenuhi" padahal yang ditanya "nilai x yang TIDAK memenuhi". Baca teliti!

**🎯 Jebakan SNBT #2:** Setelah dapat nilai x, **CEK KEMBALI** apakah nilai itu bikin penyebut nol. Kalau iya, nilai itu **bukan solusi**!

---

### 🎓 **Ringkasan Materi 1.1.2**

**Checklist yang Harus Kamu Kuasai:**
- ✅ Syarat penyebut ≠ 0
- ✅ Faktorisasi untuk penyederhanaan
- ✅ Penjumlahan/pengurangan → samakan penyebut (KPK)
- ✅ Perkalian → langsung kalikan, coret yang sama
- ✅ Pembagian → balik yang kedua, ubah jadi perkalian
- ✅ Hati-hati dengan tanda (terutama saat pengurangan!)

**Time Management SNBT:**
- Soal pecahan aljabar sederhana: **2-3 menit**
- Soal pecahan aljabar kompleks: **3-5 menit**
- Kalau lebih dari 5 menit stuck, **skip** dan balik lagi!

---
