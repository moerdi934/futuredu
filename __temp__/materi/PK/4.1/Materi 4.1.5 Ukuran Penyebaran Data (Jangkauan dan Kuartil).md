# SECTION 4: Statistika dan Peluang
## Topic 4.1: Statistika Deskriptif

---


## **Materi 4.1.5: Ukuran Penyebaran Data (Jangkauan dan Kuartil)**

### **Spread It Out: Beyond the Center!**

Kamu udah tahu cara cari nilai "tengah" data (mean, median, modus). Tapi itu belum cukup! 

Bayangkan 2 kelas dengan rata-rata nilai yang sama (75), tapi:
- **Kelas A:** Semua siswa nilainya 73-77 (nyaris sama)
- **Kelas B:** Ada yang dapat 30, ada yang 100 (bervariasi banget)

Kedua kelas punya mean yang sama, tapi "sebaran" datanya BEDA BANGET! Nah, di sinilah **Ukuran Penyebaran** berperan.

Ukuran penyebaran menunjukkan seberapa **MENYEBAR** atau **BERVARIASI** data dari pusatnya. Semakin menyebar, semakin beragam datanya. Semakin mengelompok, semakin seragam.

---

### **Kenapa Ukuran Penyebaran Penting?**

1. **Melengkapi ukuran pemusatan:** Mean/median saja tidak cukup menggambarkan data
2. **Mengukur konsistensi:** Data yang menyebar = kurang konsisten
3. **Identifikasi outlier:** Penyebaran besar bisa indikasi ada outlier
4. **Pengambilan keputusan:** Penting untuk risk assessment, quality control, dll

**Contoh Real Life:**
- **Investasi:** Dua saham dengan return rata-rata 10%/tahun. Tapi saham A fluktuasinya ±2%, saham B fluktuasinya ±20%. Mana yang lebih "aman"? Tentu saham A karena lebih stabil (penyebarannya kecil)!

---

### **Ukuran Penyebaran yang Akan Dipelajari:**

1. **Jangkauan (Range)** ← Materi ini
2. **Kuartil dan Jangkauan Interkuartil** ← Materi ini
3. **Variansi dan Simpangan Baku** ← Materi berikutnya

---

## **PART 1: JANGKAUAN (RANGE)**

### **Apa Itu Jangkauan?**

**Jangkauan (Range)** adalah selisih antara **nilai terbesar** dan **nilai terkecil** dalam data.

**Rumus:**

$$R = X_{\text{maks}} - X_{\text{min}}$$

Dimana:
- $R$ = jangkauan (range)
- $X_{\text{maks}}$ = nilai maksimum (terbesar)
- $X_{\text{min}}$ = nilai minimum (terkecil)

---

### **Cara Menghitung Jangkauan:**

1. Urutkan data (opsional, tapi membantu)
2. Cari nilai terbesar dan terkecil
3. Kurangkan: Terbesar - Terkecil

---

**Contoh 1:**
Nilai ujian: 60, 70, 75, 80, 90, 95

- Nilai terbesar = 95
- Nilai terkecil = 60

$$R = 95 - 60 = 35$$

Jadi jangkauan = **35**.

**Interpretasi:** Rentang nilai ujian adalah 35 poin.

---

**Contoh 2:**
Suhu harian dalam seminggu (°C): 28, 30, 29, 31, 27, 28, 30

- Nilai tertinggi = 31°C
- Nilai terendah = 27°C

$$R = 31 - 27 = 4°C$$

Jadi jangkauan = **4°C**.

**Interpretasi:** Fluktuasi suhu dalam seminggu hanya 4°C (relatif stabil).

---

### **Kelebihan dan Kekurangan Jangkauan**

#### **Kelebihan:**
✅ **MUDAH dihitung:** Cuma kurangin dua nilai
✅ **Cepat:** Tidak butuh perhitungan rumit
✅ **Langsung terlihat:** Sekali pandang tahu range datanya

#### **Kekurangan:**
❌ **Sangat dipengaruhi outlier:** Satu nilai ekstrem langsung bikin range jadi besar
❌ **Tidak memperhitungkan semua data:** Cuma pakai 2 nilai (min & max)
❌ **Tidak informatif untuk data besar:** Tidak tahu bagaimana distribusi data di tengah-tengah

---

**Contoh Kelemahan Jangkauan:**

**Data A:** 50, 52, 53, 54, 55, 56, 100
Range = 100 - 50 = **50**

**Data B:** 50, 51, 52, 98, 99, 100
Range = 100 - 50 = **50**

Kedua data punya range yang sama (50), tapi distribusinya SANGAT BEDA:
- Data A: mayoritas nilai di 50-56, cuma 1 outlier (100)
- Data B: nilai tersebar dari 50-100

Range tidak bisa membedakan keduanya!

---

### **JEBAKAN UTBK: Jangkauan**

**Jebakan 1: Lupa Kurangin**
Sering siswa cuma jawab nilai max atau min, bukan selisihnya.

**Jebakan 2: Salah Identifikasi Min/Max**
Di data acak, harus teliti cari nilai terbesar/terkecil.

**Jebakan 3: Range untuk Data Berkelompok**
Untuk data berkelompok, range dihitung dari:
- **Tepi atas kelas tertinggi - Tepi bawah kelas terendah**

Bukan batas kelas!

**Contoh:**

| Nilai | Frekuensi |
|-------|-----------|
| 50-59 | 5 |
| 60-69 | 10 |
| 70-79 | 8 |

- Tepi bawah kelas terendah (50-59) = 49,5
- Tepi atas kelas tertinggi (70-79) = 79,5

Range = 79,5 - 49,5 = **30** ✓

---

## **PART 2: KUARTIL**

### **Apa Itu Kuartil?**

**Kuartil** adalah nilai yang **MEMBAGI data menjadi 4 bagian sama besar** setelah data diurutkan.

Ada 3 kuartil:
- **Q₁ (Kuartil Bawah):** Nilai yang membagi 25% data terbawah
- **Q₂ (Kuartil Tengah):** Nilai yang membagi data menjadi 2 bagian sama besar = **MEDIAN**
- **Q₃ (Kuartil Atas):** Nilai yang membagi 75% data terbawah

**Visualisasi:**

```
|----25%----|----25%----|----25%----|----25%----|
Min         Q₁         Q₂(Me)       Q₃         Max
```

---

### **Kenapa Kuartil Penting?**

1. **Lebih robust daripada range:** Tidak terpengaruh nilai ekstrem
2. **Memberikan info distribusi:** Tahu bagaimana data tersebar di berbagai bagian
3. **Identifikasi outlier:** Data di luar Q₁-1,5×IQR atau Q₃+1,5×IQR dianggap outlier
4. **Dasar Box Plot:** Diagram kotak garis pakai kuartil

---

### **Kuartil untuk Data Tunggal**

#### **Langkah-langkah:**

1. **Urutkan data** dari kecil ke besar
2. **Tentukan Q₂ (Median)** terlebih dahulu
3. **Bagi data jadi 2 bagian:**
   - Bagian bawah: semua data di bawah Q₂
   - Bagian atas: semua data di atas Q₂
4. **Q₁** = Median dari bagian bawah
5. **Q₃** = Median dari bagian atas

---

**Contoh 1: Data Ganjil (n = 9)**
Data: 12, 15, 18, 20, 22, 25, 28, 30, 35

**1. Sudah urut:**
12, 15, 18, 20, **22**, 25, 28, 30, 35

**2. Q₂ (Median):**
Posisi = (9+1)/2 = 5
Q₂ = **22** ✓

**3. Bagi jadi 2 bagian:**
- Bagian bawah: 12, 15, **18**, 20
- Bagian atas: 25, **28**, 30, 35

**4. Q₁ (Median bagian bawah):**
Q₁ = (18+20)/2 = **19** ✓

**5. Q₃ (Median bagian atas):**
Q₃ = (28+30)/2 = **29** ✓

**Hasil:**
- Q₁ = 19
- Q₂ = 22
- Q₃ = 29

---

**Contoh 2: Data Genap (n = 8)**
Data: 10, 15, 18, 22, 25, 28, 32, 35

**1. Sudah urut:**
10, 15, 18, 22, 25, 28, 32, 35

**2. Q₂ (Median):**
Posisi = antara data ke-4 dan ke-5
Q₂ = (22+25)/2 = **23,5** ✓

**3. Bagi jadi 2 bagian:**
- Bagian bawah: 10, **15, 18**, 22
- Bagian atas: 25, **28, 32**, 35

**4. Q₁:**
Q₁ = (15+18)/2 = **16,5** ✓

**5. Q₃:**
Q₃ = (28+32)/2 = **30** ✓

**Hasil:**
- Q₁ = 16,5
- Q₂ = 23,5
- Q₃ = 30

---

### **Kuartil untuk Data Berkelompok**

Untuk data berkelompok, kita pakai **RUMUS INTERPOLASI** (mirip dengan median).

**Rumus Kuartil Data Berkelompok:**

$$Q_i = L + \left( \frac{\frac{i \times n}{4} - F}{f} \right) \times c$$

Dimana:
- $Q_i$ = kuartil ke-i (i = 1, 2, atau 3)
- $L$ = tepi bawah kelas kuartil ke-i
- $n$ = jumlah total data
- $F$ = frekuensi kumulatif sebelum kelas kuartil ke-i
- $f$ = frekuensi kelas kuartil ke-i
- $c$ = panjang interval kelas

---

**Langkah-langkah:**

**Untuk Q₁:**
1. Hitung $\frac{n}{4}$ (seperempat dari total data)
2. Cari kelas Q₁: frek. kumulatif pertama kali ≥ $\frac{n}{4}$
3. Masukkan ke rumus dengan $i=1$

**Untuk Q₂:**
1. Hitung $\frac{2n}{4} = \frac{n}{2}$ (ini sama dengan median!)
2. Cari kelas Q₂: frek. kumulatif pertama kali ≥ $\frac{n}{2}$
3. Masukkan ke rumus dengan $i=2$

**Untuk Q₃:**
1. Hitung $\frac{3n}{4}$ (tiga perempat dari total data)
2. Cari kelas Q₃: frek. kumulatif pertama kali ≥ $\frac{3n}{4}$
3. Masukkan ke rumus dengan $i=3$

---

**Contoh:**

| Nilai | f | Tepi Bawah | Frek. Kumulatif |
|-------|---|------------|-----------------|
| 50-59 | 5 | 49,5 | 5 |
| 60-69 | 10 | 59,5 | 15 |
| 70-79 | 12 | 69,5 | 27 |
| 80-89 | 8 | 79,5 | 35 |
| 90-99 | 5 | 89,5 | 40 |

Total data ($n$) = 40

---

**Hitung Q₁:**

1. $\frac{n}{4} = \frac{40}{4} = 10$

2. Kelas Q₁: frek. kumulatif pertama kali ≥ 10 adalah **15** (kelas 60-69)

3. Komponen:
   - $L = 59,5$
   - $F = 5$
   - $f = 10$
   - $c = 10$

4. Rumus:

$$Q_1 = 59,5 + \left( \frac{10 - 5}{10} \right) \times 10$$

$$= 59,5 + 5 = 64,5$$

**Q₁ = 64,5** ✓

---

**Hitung Q₂ (sama dengan Median):**

1. $\frac{2n}{4} = \frac{40}{2} = 20$

2. Kelas Q₂: frek. kumulatif pertama kali ≥ 20 adalah **27** (kelas 70-79)

3. Komponen:
   - $L = 69,5$
   - $F = 15$
   - $f = 12$
   - $c = 10$

4. Rumus:

$$Q_2 = 69,5 + \left( \frac{20 - 15}{12} \right) \times 10$$

$$= 69,5 + 4,17 = 73,67$$

**Q₂ = 73,67** ✓

---

**Hitung Q₃:**

1. $\frac{3n}{4} = \frac{3 \times 40}{4} = 30$

2. Kelas Q₃: frek. kumulatif pertama kali ≥ 30 adalah **35** (kelas 80-89)

3. Komponen:
   - $L = 79,5$
   - $F = 27$
   - $f = 8$
   - $c = 10$

4. Rumus:

$$Q_3 = 79,5 + \left( \frac{30 - 27}{8} \right) \times 10$$

$$= 79,5 + 3,75 = 83,25$$

**Q₃ = 83,25** ✓

---

## **PART 3: JANGKAUAN INTERKUARTIL (IQR)**

### **Apa Itu Jangkauan Interkuartil?**

**Jangkauan Interkuartil (Interquartile Range / IQR)** adalah selisih antara **kuartil atas (Q₃)** dan **kuartil bawah (Q₁)**.

**Rumus:**

$$IQR = Q_3 - Q_1$$

IQR menunjukkan rentang di mana **50% data tengah** berada.

---

### **Kenapa IQR Penting?**

1. **Lebih robust daripada range:** Tidak terpengaruh outlier (karena cuma pakai 50% data tengah)
2. **Mengukur variabilitas:** IQR kecil = data mengelompok; IQR besar = data menyebar
3. **Identifikasi outlier:** Data dianggap outlier jika:
   - Di bawah $Q_1 - 1,5 \times IQR$
   - Di atas $Q_3 + 1,5 \times IQR$

---

**Contoh dari Kuartil Sebelumnya:**
- Q₁ = 64,5
- Q₃ = 83,25

$$IQR = 83,25 - 64,5 = 18,75$$

**Interpretasi:** 50% data tengah tersebar dalam rentang 18,75 poin.

---

### **Identifikasi Outlier dengan IQR**

**Batas Bawah Outlier:**

$$\text{Batas Bawah} = Q_1 - 1,5 \times IQR$$

**Batas Atas Outlier:**

$$\text{Batas Atas} = Q_3 + 1,5 \times IQR$$

Data yang berada di **luar** kedua batas ini dianggap outlier.

---

**Contoh:**
- Q₁ = 64,5
- Q₃ = 83,25
- IQR = 18,75

**Batas Bawah:**

$$64,5 - 1,5 \times 18,75 = 64,5 - 28,125 = 36,375$$

**Batas Atas:**

$$83,25 + 1,5 \times 18,75 = 83,25 + 28,125 = 111,375$$

**Interpretasi:**
- Nilai di bawah **36,375** adalah outlier bawah
- Nilai di atas **111,375** adalah outlier atas

Dari data awal (50-99), tidak ada outlier karena semua data berada dalam rentang 36,375 - 111,375.

---

## **PART 4: DIAGRAM KOTAK GARIS (BOX PLOT)**

### **Apa Itu Box Plot?**

**Box Plot (Diagram Kotak Garis)** adalah representasi visual dari kuartil data, menunjukkan:
- Nilai minimum dan maksimum
- Q₁, Q₂ (median), Q₃
- IQR
- Outlier (jika ada)

**Struktur Box Plot:**

```
      Min       Q₁      Q₂      Q₃       Max
       |--------[========|========]--------|
              Box (IQR)
       
Whisker       Box        Whisker
```

---

### **Cara Membaca Box Plot:**

1. **Box (Kotak):** Menunjukkan IQR (Q₁ hingga Q₃)
2. **Garis Tengah dalam Box:** Median (Q₂)
3. **Whisker (Kumis):** Garis dari box ke min/max (tanpa outlier)
4. **Titik di Luar Whisker:** Outlier

---

### **Keuntungan Box Plot:**

✅ **Visual yang jelas** tentang distribusi data
✅ **Mudah identifikasi outlier**
✅ **Bisa membandingkan** beberapa dataset sekaligus
✅ **Menunjukkan skewness:** Jika median lebih dekat Q₁ → skewed right; lebih dekat Q₃ → skewed left

---

### **Tips UTBK: Jangkauan dan Kuartil**

**Tip 1: Urutan adalah Kunci**
Untuk kuartil, data HARUS diurutkan dulu!

**Tip 2: Frekuensi Kumulatif**
Untuk data berkelompok, selalu buat kolom frek. kumulatif sebelum hitung kuartil.

**Tip 3: Ingat Rumus IQR**
$$IQR = Q_3 - Q_1$$ (bukan Q₃ + Q₁!)

**Tip 4: Outlier**
Outlier bukan nilai "aneh", tapi nilai yang secara statistik terlalu jauh dari mayoritas data. Hitung pakai rumus $Q_1 - 1,5 \times IQR$ dan $Q_3 + 1,5 \times IQR$.

**Tip 5: Perhatikan Kata Kunci**
- "Rentang" / "Jangkauan" → **Range**
- "Kuartil" → **Q₁, Q₂, Q₃**
- "Jangkauan Interkuartil" → **IQR**

---

### **JEBAKAN UTBK: Kuartil**

**Jebakan 1: Salah Identifikasi Kelas Kuartil**
Kelas kuartil adalah kelas di mana frek. kumulatif **PERTAMA KALI** ≥ $\frac{in}{4}$, bukan yang paling mendekati!

**Jebakan 2: Lupa Pakai Tepi Kelas**
Di data berkelompok, pakai **TEPI BAWAH** kelas kuartil, bukan batas bawah!

**Jebakan 3: Salah Hitung $\frac{in}{4}$**
- Q₁: $i=1$ → $\frac{n}{4}$
- Q₂: $i=2$ → $\frac{2n}{4} = \frac{n}{2}$
- Q₃: $i=3$ → $\frac{3n}{4}$

---

### **Kesimpulan: Spread Matters!**

Ukuran penyebaran melengkapi ukuran pemusatan untuk memberikan gambaran data yang lebih lengkap:

✅ **Jangkauan (Range):** Mudah, tapi sangat dipengaruhi outlier
✅ **Kuartil (Q₁, Q₂, Q₃):** Membagi data jadi 4 bagian, lebih robust
✅ **Jangkauan Interkuartil (IQR):** Ukuran penyebaran yang stabil, basis identifikasi outlier
✅ **Box Plot:** Visualisasi powerful untuk melihat distribusi dan outlier

Di materi selanjutnya, kita akan belajar ukuran penyebaran yang lebih "sophisticated": **VARIANSI** dan **SIMPANGAN BAKU**—yang memperhitungkan SEMUA data, bukan cuma kuartil atau min/max!

---

*Wah panjang banget ya! Tapi tenang, kalau kamu paham konsep dasarnya, rumus-rumus ini akan jadi mudah. Practice makes perfect! 🚀*