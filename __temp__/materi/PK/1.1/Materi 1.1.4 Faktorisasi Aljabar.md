# SECTION 1: Aljabar dan Persamaan
## Topic 1.1: Operasi Aljabar Dasar

---


## **Materi 1.1.4: Faktorisasi Aljabar**

### 🎯 **Faktorisasi: Seni Memecah Bentuk Aljabar!**

Bayangin kamu punya coklat batangan yang mau kamu bagi-bagi ke temen-temen. Daripada dalam bentuk utuh, kamu pecah jadi kotak-kotak kecil. Nah, **faktorisasi** itu kayak gitu—kita pecah bentuk aljabar jadi **perkalian faktor-faktor yang lebih sederhana**!

Kenapa penting? Karena:
- Mempermudah penyederhanaan pecahan aljabar
- Membantu menyelesaikan persamaan kuadrat
- Membuat operasi aljabar jadi lebih efisien
- **SERING BANGET KELUAR DI SNBT!**

---

### 🔢 **Faktor Persekutuan Terbesar (FPB) dalam Aljabar**

FPB adalah **faktor terbesar** yang bisa membagi semua suku dalam bentuk aljabar.

**Langkah mencari FPB:**
1. Cari FPB dari **koefisien** (angka)
2. Cari **variabel dengan pangkat terkecil**
3. Gabungkan keduanya

**Contoh 1:**
```
FPB dari 6x³ dan 9x²

Koefisien: FPB(6, 9) = 3
Variabel: x³ dan x² → pangkat terkecil = x²

FPB = 3x²
```

**Contoh 2:**
```
FPB dari 12x²y³ dan 18xy⁴

Koefisien: FPB(12, 18) = 6
Variabel x: x² dan x → x
Variabel y: y³ dan y⁴ → y³

FPB = 6xy³
```

---

### 🎨 **Faktorisasi Bentuk ax + ay**

Ini adalah bentuk faktorisasi **PALING DASAR**. Caranya: keluarkan **FPB**!

**Pola:**
```
ax + ay = a(x + y)
```

**Contoh 1:**
```
3x + 6 = 3(x + 2)
```

**Contoh 2:**
```
4x² + 8x = 4x(x + 2)
```

**Contoh 3:**
```
12x³y - 18x²y² = 6x²y(2x - 3y)
```

**Contoh 4: Lebih Kompleks**
```
5a²b + 10ab² - 15ab
= 5ab(a + 2b - 3)
```

**🎯 Jebakan SNBT:** Jangan lupa **semua suku** harus dibagi FPB!
```
❌ SALAH: 6x + 12 = 6(x + 2)  ← Kurang lengkap
✅ BENAR: 6x + 12 = 6(x + 2)  ← Ini udah bener

❌ SALAH: 4x² + 8x = 4(x² + 2x)  ← Masih bisa difaktorkan!
✅ BENAR: 4x² + 8x = 4x(x + 2)
```

**💡 Tips SNBT:** Setelah faktorisasi, **cek ulang** dengan cara mengalikan kembali. Hasilnya harus sama dengan bentuk awal!

---

### ⚡ **Faktorisasi Selisih Dua Kuadrat (a² - b²)**

Ini adalah **pola emas** faktorisasi! Harus hafal di luar kepala!

**Rumus:**
```
a² - b² = (a + b)(a - b)
```

**Kenapa?**
```
(a + b)(a - b) = a² - ab + ab - b² = a² - b²
```

**Contoh 1:**
```
x² - 9 = x² - 3² = (x + 3)(x - 3)
```

**Contoh 2:**
```
4x² - 25 = (2x)² - 5² = (2x + 5)(2x - 5)
```

**Contoh 3:**
```
9a² - 16b² = (3a)² - (4b)² = (3a + 4b)(3a - 4b)
```

**Contoh 4: Ada Koefisien**
```
2x² - 50 = 2(x² - 25) = 2(x + 5)(x - 5)
```

**Contoh 5: Pangkat Lebih Tinggi**
```
x⁴ - 16 = (x²)² - 4²
        = (x² + 4)(x² - 4)
        = (x² + 4)(x + 2)(x - 2)
```

**🎯 Jebakan SNBT #1:** **Hanya berlaku untuk SELISIH**, bukan jumlah!
```
❌: x² + 9 = (x + 3)(x + 3)  ← INI SALAH!
✅: x² + 9  (tidak bisa difaktorkan dengan bilangan real)

✅: x² - 9 = (x + 3)(x - 3)  ← Ini baru bener!
```

**🎯 Jebakan SNBT #2:** Cek apakah bisa difaktorkan lagi!
```
x⁴ - 1 = (x²)² - 1²
       = (x² + 1)(x² - 1)
       = (x² + 1)(x + 1)(x - 1)  ← Jangan lupa x² - 1 masih bisa!
```

---

### 💎 **Faktorisasi Trinomial Kuadrat Sempurna**

**Pola Kuadrat Sempurna:**
```
a² + 2ab + b² = (a + b)²
a² - 2ab + b² = (a - b)²
```

**Ciri-ciri kuadrat sempurna:**
1. Suku pertama dan ketiga adalah **kuadrat sempurna**
2. Suku tengah = **2 × √suku pertama × √suku ketiga**

**Contoh 1:**
```
x² + 6x + 9

Cek: √x² = x, √9 = 3
Suku tengah: 6x = 2·x·3 ✓

Jadi: (x + 3)²
```

**Contoh 2:**
```
4x² - 12x + 9

√4x² = 2x, √9 = 3
-12x = 2·2x·3·(-1) ✓

Jadi: (2x - 3)²
```

**Contoh 3:**
```
9a² + 30a + 25

√9a² = 3a, √25 = 5
30a = 2·3a·5 ✓

Jadi: (3a + 5)²
```

**🎯 Jebakan SNBT:** Kalau suku tengah **tidak sesuai**, bukan kuadrat sempurna!
```
x² + 5x + 4

Cek: √x² = x, √4 = 2
Seharusnya suku tengah = 2·x·2 = 4x
Tapi yang ada: 5x ✗

Jadi BUKAN kuadrat sempurna! (Pakai cara lain)
```

---

### 🚀 **Faktorisasi Bentuk ax² + bx + c**

Ini adalah **boss level** faktorisasi! Ada beberapa kasus:

---

**KASUS 1: a = 1 (bentuk x² + bx + c)**

**Pola:**
```
x² + bx + c = (x + p)(x + q)

Di mana:
- p + q = b
- p × q = c
```

**Langkah:**
1. Cari dua bilangan yang **dikalikan = c**
2. Dan **dijumlahkan = b**

**Contoh 1:**
```
x² + 5x + 6

Cari p dan q:
p × q = 6
p + q = 5

Pasangan faktor 6: (1,6), (2,3)
Yang jumlahnya 5: 2 dan 3 ✓

Jadi: (x + 2)(x + 3)
```

**Contoh 2:**
```
x² - 7x + 12

p × q = 12
p + q = -7

Cari yang negatif: (-3)×(-4) = 12, (-3)+(-4) = -7 ✓

Jadi: (x - 3)(x - 4)
```

**Contoh 3:**
```
x² + 2x - 15

p × q = -15
p + q = 2

Pasangan: (5)×(-3) = -15, 5+(-3) = 2 ✓

Jadi: (x + 5)(x - 3)
```

**💡 Tips:** Buat tabel faktor untuk mempermudah:
```
Faktor dari 12:
1×12, 2×6, 3×4
(-1)×(-12), (-2)×(-6), (-3)×(-4)
```

---

**KASUS 2: a ≠ 1 (bentuk ax² + bx + c)**

Ada dua metode: **AC Method** dan **Trial-Error**

**Metode AC (Recommended!):**

**Langkah:**
1. Kalikan a × c
2. Cari dua bilangan yang **dikalikan = ac** dan **dijumlahkan = b**
3. Pecah suku tengah
4. Faktorkan per kelompok

**Contoh 1:**
```
2x² + 7x + 3

a = 2, b = 7, c = 3
ac = 2 × 3 = 6

Cari p dan q:
p × q = 6
p + q = 7

Pasangan: 1 dan 6 ✓

Pecah suku tengah:
2x² + 7x + 3 = 2x² + x + 6x + 3

Faktorkan per kelompok:
= x(2x + 1) + 3(2x + 1)
= (2x + 1)(x + 3)
```

**Contoh 2:**
```
3x² - 10x + 8

ac = 3 × 8 = 24
Cari: p × q = 24, p + q = -10
Pasangan: -4 dan -6 ✓

3x² - 10x + 8 = 3x² - 4x - 6x + 8
              = x(3x - 4) - 2(3x - 4)
              = (3x - 4)(x - 2)
```

**Contoh 3:**
```
6x² + 11x - 10

ac = 6 × (-10) = -60
Cari: p × q = -60, p + q = 11
Pasangan: 15 dan -4 ✓

6x² + 11x - 10 = 6x² + 15x - 4x - 10
               = 3x(2x + 5) - 2(2x + 5)
               = (2x + 5)(3x - 2)
```

**🎯 Jebakan SNBT #1:** Saat memfaktorkan per kelompok, **faktor dalam kurung harus sama**!
```
❌ SALAH:
6x² + 15x - 4x - 10 = 3x(2x + 5) - 2(2x + 5)
                    = (2x + 5)(3x - 2) ✓

Kalau gak sama:
6x² + 15x - 4x - 10 = 3x(2x + 5) - 2(2x - 5)
                    ← Gak bisa dilanjutkan!
```

**🎯 Jebakan SNBT #2:** Selalu **cek ulang** dengan mengalikan!
```
Cek: (2x + 1)(x + 3)
= 2x² + 6x + x + 3
= 2x² + 7x + 3 ✓
```

---

### 🎓 **Ringkasan Materi 1.1.4**

**Jenis-jenis Faktorisasi:**
1. ✅ **FPB:** ax + ay = a(x + y)
2. ✅ **Selisih kuadrat:** a² - b² = (a + b)(a - b)
3. ✅ **Kuadrat sempurna:** a² ± 2ab + b² = (a ± b)²
4. ✅ **Trinomial (a=1):** x² + bx + c = (x + p)(x + q)
5. ✅ **Trinomial (a≠1):** Gunakan AC Method!

**Strategi SNBT:**
1. 👀 **Identifikasi** jenis faktorisasi
2. 🔍 **Cek** apakah bisa keluarkan FPB dulu
3. 🎯 **Pilih** metode yang tepat
4. ✅ **Verifikasi** dengan mengalikan kembali

**Time Management:**
- Faktorisasi sederhana (FPB, selisih kuadrat): **1-2 menit**
- Trinomial: **2-3 menit**
- Soal kombinasi: **3-4 menit**

---
