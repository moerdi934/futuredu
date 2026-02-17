# SECTION 4: Statistika dan Peluang
## Topic 4.1: Statistika Deskriptif

---


## **Materi 4.1.4: Ukuran Pemusatan Data (Median dan Modus)**

### **When Mean is Not Enough: Enter Median & Modus!**

Di materi sebelumnya, kamu udah belajar tentang Mean. Sekarang saatnya kenalan sama dua sahabatnya: **Median** dan **Modus**.

Kenapa butuh 3 ukuran pemusatan? Karena setiap data punya "karakter" yang beda-beda. Kadang Mean cocok, kadang Median lebih pas, kadang malah Modus yang paling make sense.

Bayangkan kamu lagi nyari apartemen. Ada 3 cara lihat harga:
- **Mean** = Harga rata-rata semua apartemen
- **Median** = Harga apartemen yang di tengah-tengah kalau diurutkan
- **Modus** = Harga apartemen yang paling sering muncul

Setiap cara kasih insight yang beda!

---

## **PART 1: MEDIAN (Nilai Tengah)**

### **Apa Itu Median?**

**Median** adalah nilai yang berada di **TENGAH-TENGAH** data setelah data diurutkan dari terkecil ke terbesar (atau sebaliknya).

**Analogi:**
Bayangkan 7 orang berdiri berjajar dari yang paling pendek ke paling tinggi. Orang yang berdiri di tengah-tengah (orang ke-4) adalah MEDIAN tinggi badan mereka.

---

### **Kenapa Median Penting?**

1. **Tidak terpengaruh outlier:** Berbeda dengan mean, median STABIL meskipun ada nilai ekstrem
2. **Representatif untuk data skewed:** Data yang tidak simetris lebih baik pakai median
3. **Mudah dipahami:** "Nilai tengah" is a simple concept

**Contoh Kekuatan Median:**
Ingat contoh gaji tadi?
- Karyawan 1-4: Rp 5-6 juta
- CEO: Rp 100 juta

**Mean** = Rp 24,4 juta (menyesatkan karena CEO)
**Median** = Rp 5,5 juta (lebih representatif untuk mayoritas karyawan)

Nah, dalam kasus ini, MEDIAN jauh lebih meaningful daripada mean!

---

### **Median untuk Data Tunggal (Jumlah Sedikit)**

#### **Langkah-langkah:**

1. **Urutkan data** dari terkecil ke terbesar
2. **Tentukan posisi median:**
   - Jika $n$ (banyak data) **GANJIL** → Median = data ke-$\frac{n+1}{2}$
   - Jika $n$ (banyak data) **GENAP** → Median = rata-rata dari data ke-$\frac{n}{2}$ dan ke-$\frac{n}{2}+1$

---

**Contoh 1: Data Ganjil (n = 7)**
Nilai ujian: 70, 85, 60, 90, 75, 80, 65

**1. Urutkan:**
60, 65, 70, **75**, 80, 85, 90

**2. Tentukan posisi:**
$n = 7$ (ganjil)
Posisi median = $(7+1)/2 = 4$

**3. Ambil data ke-4:**
Median = **75** ✓

---

**Contoh 2: Data Genap (n = 8)**
Nilai ujian: 70, 85, 60, 90, 75, 80, 65, 88

**1. Urutkan:**
60, 65, 70, **75, 80**, 85, 88, 90

**2. Tentukan posisi:**
$n = 8$ (genap)
Posisi median = antara data ke-4 dan ke-5

**3. Rata-ratakan data ke-4 dan ke-5:**
Median = $(75 + 80)/2 = 77,5$ ✓

---

### **Median untuk Data dengan Frekuensi**

Kalau data disajikan dalam tabel frekuensi, tambahkan kolom **frekuensi kumulatif**.

**Langkah:**
1. Buat kolom frekuensi kumulatif
2. Tentukan posisi median: $\frac{n+1}{2}$ atau $\frac{n}{2}$
3. Cari di frekuensi kumulatif yang MENCAKUP posisi median

---

**Contoh:**

| Nilai (x) | Frekuensi (f) | Frek. Kumulatif |
|-----------|---------------|-----------------|
| 60 | 3 | 3 |
| 65 | 5 | 8 |
| 70 | 7 | 15 |
| 75 | 4 | 19 |
| 80 | 1 | 20 |

Total data = 20 (genap)

Posisi median = data ke-10 dan ke-11

**Cari di frek. kumulatif:**
- Data ke-1 sampai ke-8 → nilai 60-65
- Data ke-9 sampai ke-15 → nilai **70** ← Data ke-10 dan 11 ada di sini!

Jadi Median = **70** ✓

---

### **Median untuk Data Berkelompok**

Untuk data yang sudah dikelompokkan dalam interval, kita pakai **RUMUS INTERPOLASI**.

**Rumus Median Data Berkelompok:**

$$Me = L + \left( \frac{\frac{n}{2} - F}{f} \right) \times c$$

Dimana:
- $Me$ = median
- $L$ = tepi bawah kelas median
- $n$ = jumlah total data
- $F$ = frekuensi kumulatif sebelum kelas median
- $f$ = frekuensi kelas median
- $c$ = panjang interval kelas

---

**Langkah-langkah:**

1. Hitung $\frac{n}{2}$ (setengah dari total data)
2. Cari kelas median: kelas di mana frekuensi kumulatif PERTAMA KALI ≥ $\frac{n}{2}$
3. Tentukan nilai $L, F, f, c$
4. Masukkan ke rumus

---

**Contoh:**

| Nilai | Frekuensi (f) | Tepi Bawah | Tepi Atas | Frek. Kumulatif |
|-------|---------------|------------|-----------|-----------------|
| 50-59 | 5 | 49,5 | 59,5 | 5 |
| 60-69 | 10 | 59,5 | 69,5 | 15 |
| 70-79 | 12 | 69,5 | 79,5 | 27 |
| 80-89 | 8 | 79,5 | 89,5 | 35 |
| 90-99 | 5 | 89,5 | 99,5 | 40 |

Total data ($n$) = 40

**1. Hitung $\frac{n}{2}$:**
$\frac{40}{2} = 20$

**2. Cari kelas median:**
Frek. kumulatif yang pertama kali ≥ 20 adalah **27** (kelas 70-79)

**3. Tentukan komponen:**
- $L = 69,5$ (tepi bawah kelas median)
- $F = 15$ (frek. kumulatif sebelum kelas median)
- $f = 12$ (frekuensi kelas median)
- $c = 10$ (panjang interval)

**4. Masukkan rumus:**

$$Me = 69,5 + \left( \frac{20 - 15}{12} \right) \times 10$$

$$= 69,5 + \left( \frac{5}{12} \right) \times 10$$

$$= 69,5 + 4,17 = 73,67$$

Jadi Median = **73,67** ✓

---

### **JEBAKAN UTBK: Median**

**Jebakan 1: Lupa Mengurutkan Data**
Ini kesalahan paling sering! Median HARUS dari data yang SUDAH DIURUTKAN.

**Salah:**
Data: 80, 60, 90, 70, 85
Median = 90? ❌

**Benar:**
Urutkan dulu: 60, 70, **80**, 85, 90
Median = 80 ✓

---

**Jebakan 2: Salah Pakai Rumus (Ganjil vs Genap)**
Kalau $n$ ganjil → ambil data tengah langsung
Kalau $n$ genap → rata-ratakan 2 data tengah

---

**Jebakan 3: Salah Identifikasi Kelas Median**
Di data berkelompok, kelas median adalah kelas di mana frek. kumulatif **PERTAMA KALI** ≥ $\frac{n}{2}$, bukan yang paling mendekati!

---

## **PART 2: MODUS (Nilai yang Sering Muncul)**

### **Apa Itu Modus?**

**Modus** adalah nilai yang **PALING SERING MUNCUL** dalam suatu data.

**Analogi:**
Di sebuah kelas, warna seragam yang paling banyak dipakai siswa adalah putih. Jadi MODUS warna seragam adalah putih.

---

### **Kenapa Modus Penting?**

1. **Cocok untuk data kategori:** Bisa dipakai untuk data kualitatif (contoh: warna favorit, merek HP)
2. **Menunjukkan tren:** Nilai yang paling populer atau umum
3. **Tidak terpengaruh nilai ekstrem**

**Contoh Penggunaan Modus:**
- Toko baju ingin tahu ukuran baju yang paling laku → pakai MODUS
- Survey warna favorit → pakai MODUS (tidak bisa pakai mean atau median!)
- Pabrik sepatu ingin tahu ukuran sepatu yang paling banyak diproduksi → pakai MODUS

---

### **Modus untuk Data Tunggal**

Tinggal lihat nilai yang paling sering muncul!

**Contoh 1:**
Data: 5, 7, 8, 7, 9, 7, 10

Nilai 7 muncul 3 kali (paling banyak)
Modus = **7** ✓

---

**Contoh 2: Bimodal (Dua Modus)**
Data: 5, 7, 8, 7, 9, 9, 10

Nilai 7 dan 9 sama-sama muncul 2 kali
Modus = **7 dan 9** (bimodal)

---

**Contoh 3: Tanpa Modus**
Data: 5, 7, 8, 9, 10

Semua nilai muncul sekali
**Tidak ada modus**

---

### **Modus untuk Data dengan Frekuensi**

Tinggal cari nilai dengan frekuensi tertinggi!

**Contoh:**

| Nilai (x) | Frekuensi (f) |
|-----------|---------------|
| 60 | 3 |
| 65 | 5 |
| 70 | 10 | ← Terbesar
| 75 | 4 |
| 80 | 2 |

Frekuensi tertinggi = 10 (nilai 70)
Modus = **70** ✓

---

### **Modus untuk Data Berkelompok**

Untuk data berkelompok, kita pakai **RUMUS INTERPOLASI**.

**Rumus Modus Data Berkelompok:**

$$Mo = L + \left( \frac{d_1}{d_1 + d_2} \right) \times c$$

Dimana:
- $Mo$ = modus
- $L$ = tepi bawah kelas modus
- $d_1$ = selisih frekuensi kelas modus dengan kelas sebelumnya
- $d_2$ = selisih frekuensi kelas modus dengan kelas sesudahnya
- $c$ = panjang interval kelas

---

**Langkah-langkah:**

1. Cari kelas modus: kelas dengan frekuensi TERTINGGI
2. Tentukan nilai $L, d_1, d_2, c$
3. Masukkan ke rumus

---

**Contoh:**

| Nilai | Frekuensi (f) | Tepi Bawah |
|-------|---------------|------------|
| 50-59 | 5 | 49,5 |
| 60-69 | 10 | 59,5 |
| 70-79 | 15 | 69,5 | ← Tertinggi
| 80-89 | 8 | 79,5 |
| 90-99 | 2 | 89,5 |

**1. Kelas modus:**
Frekuensi tertinggi = 15 (kelas 70-79)

**2. Tentukan komponen:**
- $L = 69,5$ (tepi bawah kelas modus)
- $d_1 = 15 - 10 = 5$ (selisih dengan kelas sebelumnya)
- $d_2 = 15 - 8 = 7$ (selisih dengan kelas sesudahnya)
- $c = 10$ (panjang interval)

**3. Masukkan rumus:**

$$Mo = 69,5 + \left( \frac{5}{5 + 7} \right) \times 10$$

$$= 69,5 + \left( \frac{5}{12} \right) \times 10$$

$$= 69,5 + 4,17 = 73,67$$

Jadi Modus = **73,67** ✓

---

### **Hubungan Mean, Median, dan Modus**

Untuk data yang **SIMETRIS** (distribusi normal):

$$\text{Mean} = \text{Median} = \text{Modus}$$

Untuk data **CONDONG KE KANAN** (skewed right):

$$\text{Modus} < \text{Median} < \text{Mean}$$

Untuk data **CONDONG KE KIRI** (skewed left):

$$\text{Mean} < \text{Median} < \text{Modus}$$

**Rumus Empiris (tidak selalu tepat, tapi berguna):**

$$\text{Mean} - \text{Modus} \approx 3(\text{Mean} - \text{Median})$$

---

### **Kapan Pakai Mean, Median, atau Modus?**

| Situasi | Ukuran Terbaik | Alasan |
|---------|----------------|--------|
| Data simetris, tanpa outlier | **Mean** | Paling representatif |
| Ada outlier signifikan | **Median** | Tidak terpengaruh outlier |
| Data kategori (kualitatif) | **Modus** | Satu-satunya yang bisa dipakai |
| Data sangat skewed | **Median** | Lebih stabil |
| Ingin tahu nilai paling umum | **Modus** | Menunjukkan tren |

---

### **Tips UTBK: Median dan Modus**

**Tip 1: Cek Soal Dengan Teliti**
Soal sering kasih data acak, terus nanya median. Jangan lupa URUTKAN dulu!

**Tip 2: Perhatikan Kata Kunci**
- "Nilai tengah" = **MEDIAN**
- "Nilai yang sering muncul" = **MODUS**
- "Rata-rata" = **MEAN**

**Tip 3: Data Berkelompok**
Untuk median dan modus data berkelompok, INGAT rumusnya karena ini sering banget keluar di UTBK!

**Tip 4: Frekuensi Kumulatif is Your Friend**
Untuk median data berkelompok atau berfrekuensi, SELALU bikin kolom frekuensi kumulatif. Ini memudahkan mencari kelas median.

---

### **Kesimpulan: Three Amigos of Central Tendency**

Sekarang kamu udah kenal lengkap TRIO ukuran pemusatan data:

✅ **MEAN** = Jumlah semua data dibagi banyak data (sensitif outlier)
✅ **MEDIAN** = Nilai tengah data yang sudah diurutkan (stabil terhadap outlier)
✅ **MODUS** = Nilai yang paling sering muncul (cocok untuk data kategori)

Masing-masing punya kelebihan dan kondisi terbaik penggunaannya. Di UTBK, kamu harus bisa memilih yang mana yang paling tepat untuk situasi tertentu!

Di materi selanjutnya, kita akan belajar tentang **UKURAN PENYEBARAN DATA**—karena mean/median/modus saja tidak cukup untuk menggambarkan data secara lengkap. Kita perlu tahu seberapa "menyebar" datanya!

---
