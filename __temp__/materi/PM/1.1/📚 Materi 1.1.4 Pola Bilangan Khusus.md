# SECTION 1: Aljabar - Pola Bilangan

## Topic 1.1: Pola Bilangan

---


## 📚 Materi 1.1.4: Pola Bilangan Khusus

### Special Forces of Math! 🎖️

Kalau aritmatika dan geometri adalah "tentara reguler", maka pola khusus adalah **pasukan elite** dengan kemampuan spesial! Mereka punya bentuk unik, punya cerita masing-masing, dan **sering banget** jadi bintang tamu di soal UTBK.

Yang bikin seru, pola-pola ini nggak cuma ada di buku matematika. Mereka ada di **alam** (susunan biji bunga matahari), **arsitektur** (piramida), bahkan **kode genetik**! 🧬

---

### 🔺 Pola Bilangan Segitiga (Triangular Numbers)

#### **Konsep Dasar**

Bayangin lo susun bola billiard jadi bentuk segitiga:

```
Baris 1:  ●                    → 1 bola
Baris 2:  ● ●                  → 2 bola tambahan (total 3)
Baris 3:  ● ● ●                → 3 bola tambahan (total 6)
Baris 4:  ● ● ● ●              → 4 bola tambahan (total 10)
```

**Pola Bilangan Segitiga:**
```
1, 3, 6, 10, 15, 21, 28, 36, 45, ...
```

#### **Rumus:**

**Cara 1 - Penjumlahan Kumulatif:**
```
Tₙ = 1 + 2 + 3 + ... + n
```

**Cara 2 - Rumus Langsung:**
```
Tₙ = n(n+1) / 2
```

**Kenapa?** Karena jumlah 1 + 2 + ... + n bisa disederhanakan jadi n(n+1)/2!

#### **Contoh Soal:**

**Soal:** Tentukan bilangan segitiga ke-20!

**Penyelesaian:**
```
T₂₀ = 20(20+1) / 2
T₂₀ = 20 × 21 / 2
T₂₀ = 420 / 2
T₂₀ = 210
```

---

#### **Ciri Khas Bilangan Segitiga:**

✅ Selisihnya naik: 2, 3, 4, 5, 6, ...  
✅ Selalu hasil penjumlahan bilangan asli berurutan  
✅ Kalau dikali 8 terus ditambah 1, hasilnya **kuadrat sempurna**!

**Contoh:**
```
T₃ = 6
6 × 8 + 1 = 49 = 7² ✓
```

---

### 🟦 Pola Bilangan Persegi (Square Numbers)

#### **Konsep Dasar**

Ini yang paling gampang! Tinggal kuadratkan bilangan asli:

```
1², 2², 3², 4², 5², ...
1,  4,  9, 16, 25, 36, 49, 64, 81, 100, ...
```

Visualisasinya: Susun kotak jadi bentuk persegi!

```
1×1 = ■
2×2 = ■■
      ■■
3×3 = ■■■
      ■■■
      ■■■
```

#### **Rumus:**
```
Pₙ = n²
```

Super simpel!

#### **Selisih Antar Bilangan Persegi:**

Ini yang menarik! Selisihnya adalah **bilangan ganjil berurutan**:

```
4 - 1 = 3
9 - 4 = 5
16 - 9 = 7
25 - 16 = 9
36 - 25 = 11
```

Selisih: 3, 5, 7, 9, 11, ... (ganjil!)

#### **Trik Cepat:**

Buat ngecek apakah suatu bilangan adalah kuadrat sempurna, cek digit terakhirnya!

**Kuadrat sempurna hanya bisa berakhiran:** 0, 1, 4, 5, 6, 9

**Nggak mungkin berakhiran:** 2, 3, 7, 8

**Contoh:**
- 123 berakhiran 3 → **Bukan** kuadrat sempurna ✗
- 144 berakhiran 4 → **Bisa jadi** kuadrat sempurna (14² = 196, eh wait, 144 = 12²!) ✓

---

### 🟨 Pola Bilangan Persegi Panjang (Rectangular/Pronic Numbers)

#### **Konsep Dasar**

Ini hasil perkalian **dua bilangan berurutan**:

```
1×2, 2×3, 3×4, 4×5, 5×6, ...
2,   6,  12,  20,  30,  42, 56, 72, 90, ...
```

#### **Rumus:**
```
Rₙ = n(n+1)
```

**Hubungan dengan Segitiga:**  
Rₙ = 2 × Tₙ

Artinya, bilangan persegi panjang adalah **2 kali bilangan segitiga**!

```
R₃ = 3 × 4 = 12
T₃ = 3 × 4 / 2 = 6
R₃ = 2 × T₃ ✓
```

#### **Selisih Bilangan Persegi Panjang:**

Selisihnya naik dengan pola: 4, 6, 8, 10, 12, ... (bilangan genap!)

```
6 - 2 = 4
12 - 6 = 6
20 - 12 = 8
30 - 20 = 10
```

---

### 🔼 Pola Segitiga Pascal (Pascal's Triangle)

#### **Konsep Dasar**

Ini pola **2 dimensi** yang legendaris! Dibuat oleh Blaise Pascal (matematikawan Prancis).

```
Baris 0:                1
Baris 1:              1   1
Baris 2:            1   2   1
Baris 3:          1   3   3   1
Baris 4:        1   4   6   4   1
Baris 5:      1   5  10  10   5   1
Baris 6:    1   6  15  20  15   6   1
```

#### **Aturan Pembentukan:**

1. Setiap baris dimulai dan diakhiri dengan **1**
2. Angka di tengah = **jumlah 2 angka di atasnya**

**Contoh:**
```
Baris 4:   1   4   6   4   1
              ↓   ↓   ↓
Baris 5: 1   5  10  10   5   1
        (1) (1+4) (4+6) (6+4) (4+1) (1)
```

#### **Aplikasi Segitiga Pascal:**

1. **Kombinasi**: Angka di baris ke-n adalah nilai C(n,r)
   - Baris 4: 1, 4, 6, 4, 1 = C(4,0), C(4,1), C(4,2), C(4,3), C(4,4)

2. **Ekspansi Binomial**: (a+b)ⁿ
   ```
   (a+b)² = 1a² + 2ab + 1b² → koefisien dari baris 2!
   (a+b)³ = 1a³ + 3a²b + 3ab² + 1b³ → baris 3!
   ```

3. **Fibonacci Tersembunyi**: Jumlah diagonal = Fibonacci!
   ```
   1
   1   1           → 1
   1   2   1       → 1+1 = 2
   1   3   3   1   → 1+2 = 3
   ```

#### **Sifat Menarik:**

✅ **Jumlah setiap baris = 2ⁿ**
```
Baris 0: 1 = 2⁰
Baris 1: 1+1 = 2 = 2¹
Baris 2: 1+2+1 = 4 = 2²
Baris 3: 1+3+3+1 = 8 = 2³
```

✅ **Simetris**: Angka dari kiri = angka dari kanan

✅ **Hockey Stick Pattern**: Jumlah diagonal = angka di ujung bawah diagonal berikutnya

---

### 💡 Mengenali dan Melanjutkan Pola Khusus

#### **Strategi Deteksi:**

**1. Cek dulu apakah Aritmatika/Geometri**
   - Kalau bukan, lanjut ke pola khusus

**2. Cek Selisih Tingkat 1 dan 2**
   ```
   Bilangan: 1, 3, 6, 10, 15, ...
   
   Selisih 1: 2, 3, 4, 5, ...
   Selisih 2: 1, 1, 1, ... (konsisten!)
   
   → Ini pola kuadratik (bilangan segitiga!)
   ```

**3. Cek apakah Kuadrat/Kubik**
   ```
   1, 4, 9, 16, 25, ...
   √1=1, √4=2, √9=3, √16=4, √25=5
   → Pola kuadrat!
   ```

**4. Cari Pola dalam Pola**
   Kadang ada sub-pola tersembunyi:
   ```
   1, 1, 2, 3, 5, 8, 13, ...
   → Pola Fibonacci (nanti di materi 1.1.5!)
   ```

---

### 🎯 Tabel Ringkas Pola Khusus

| **Nama** | **Barisan** | **Rumus Uₙ** | **Selisih Ke-1** |
|----------|-------------|--------------|------------------|
| Segitiga | 1,3,6,10,15,... | n(n+1)/2 | 2,3,4,5,... |
| Persegi | 1,4,9,16,25,... | n² | 3,5,7,9,... (ganjil) |
| Persegi Panjang | 2,6,12,20,30,... | n(n+1) | 4,6,8,10,... (genap) |
| Kubik | 1,8,27,64,125,... | n³ | 7,19,37,61,... |

---

### 🚨 Tips UTBK untuk Pola Khusus

#### **Tip #1: Hafalkan 10 Bilangan Pertama**

Minimal hafal:
- **Kuadrat**: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100
- **Segitiga**: 1, 3, 6, 10, 15, 21, 28, 36, 45, 55
- **Kubik**: 1, 8, 27, 64, 125

Ini akan **ngeboost** kecepatan lo drastis!

---

#### **Tip #2: Gunakan Selisih Bertingkat**

Kalau selisih tingkat 1 nggak konsisten, cek tingkat 2!

```
Pola: 1, 4, 9, 16, 25, ...

Selisih 1: 3, 5, 7, 9, ...
Selisih 2: 2, 2, 2, ... (konsisten!)

→ Ini pola kuadratik!
```

---

#### **Tip #3: Jangan Abaikan Pola Negatif**

Kadang pola khusus bisa negatif atau bergantian:

```
1, -4, 9, -16, 25, -36, ...
→ Kuadrat dengan tanda bergantian!

Rumus: Uₙ = (-1)^(n+1) × n²
```

---

#### **Tip #4: Kombinasi Pola**

UTBK suka bikin pola gabungan:

**Contoh:**
```
2, 5, 10, 17, 26, ...

Ini = 1²+1, 2²+1, 3²+1, 4²+1, 5²+1, ...
Rumus: Uₙ = n² + 1
```

---

### 🎯 Jebakan UTBK pada Pola Khusus

#### **Jebakan #1: Pola yang "Hampir" Kuadrat**

**Soal:**
```
2, 5, 10, 17, 26, 37, ...
```

**Jebakan:** "Ini kuadrat kan? 1, 4, 9, 16, 25, 36..."  
**Benar:** Ini n² + 1, bukan n²!

```
U₁ = 1² + 1 = 2
U₂ = 2² + 1 = 5
U₃ = 3² + 1 = 10
```

---

#### **Jebakan #2: Dimulai dari n = 0 atau n = 1**

Hati-hati soal yang mulai dari 0!

**Contoh:**
```
"Suku pertama pola segitiga dimulai dari n=0"
T₀ = 0, T₁ = 1, T₂ = 3, T₃ = 6, ...
```

Rumusnya tetap sama, tapi **indeksnya geser**!

---

#### **Jebakan #3: Pola dalam Konteks Cerita**

**Soal:**  
"Susunan kursi di gedung teater: Baris 1 ada 10 kursi, Baris 2 ada 12 kursi, Baris 3 ada 14 kursi, ... Berapa kursi di baris 20?"

**Jebakan:** "Ini pola khusus kan?"  
**Benar:** Ini **aritmatika biasa** (b=2)!

```
U₂₀ = 10 + (20-1) × 2 = 10 + 38 = 48 kursi
```

Jangan sampai **overthinking**! Cek aritmatika/geometri dulu sebelum asumsi pola khusus.

---

### 🌟 Kesimpulan Materi 1.1.4

Pola Bilangan Khusus punya bentuk unik dan rumus spesifik:

✅ **Segitiga**: Tₙ = n(n+1)/2  
✅ **Persegi**: Pₙ = n²  
✅ **Persegi Panjang**: Rₙ = n(n+1)  
✅ **Pascal**: Pola 2D dengan kombinasi  
✅ **Deteksi**: Gunakan selisih bertingkat  

Selanjutnya kita akan bahas **Fibonacci** dan pola kompleks lainnya yang lebih menantang! 🧩

---
