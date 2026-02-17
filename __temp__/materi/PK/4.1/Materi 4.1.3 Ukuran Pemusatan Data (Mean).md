# SECTION 4: Statistika dan Peluang
## Topic 4.1: Statistika Deskriptif

---


## **Materi 4.1.3: Ukuran Pemusatan Data (Mean)**

### **Welcome to the World of Averages!**

Sekarang data kamu udah rapi dalam bentuk tabel dan grafik. Tapi kalau ditanya: "Jadi, berapa nilai rata-ratanya?" Nah, di sinilah **Ukuran Pemusatan Data** berperan!

Ukuran pemusatan adalah nilai yang mewakili PUSAT atau KECONDONGAN dari suatu data. Ini kayak GPS yang nunjukin "ini nih area tengah dari data kamu!"

Ada 3 jenis ukuran pemusatan yang harus kamu kuasai:
1. **Mean (Rata-rata)** ← Materi ini
2. **Median (Nilai Tengah)** ← Materi berikutnya
3. **Modus (Nilai yang Sering Muncul)** ← Materi berikutnya

---

### **Apa Itu Mean (Rata-Rata)?**

**Mean** adalah **jumlah seluruh data dibagi banyaknya data**. Ini adalah ukuran pemusatan yang PALING sering dipakai dalam kehidupan sehari-hari.

**Rumus Dasar:**

$$\bar{x} = \frac{\text{Jumlah semua data}}{\text{Banyak data}} = \frac{\sum x}{n}$$

Dimana:
- $\bar{x}$ (dibaca: x bar) = mean
- $\sum x$ = jumlah seluruh data
- $n$ = banyaknya data

**Contoh Sederhana:**
Nilai ujian 5 siswa: 70, 80, 75, 85, 90

Mean = (70 + 80 + 75 + 85 + 90) / 5 = 400 / 5 = **80**

Jadi rata-rata nilai ujian adalah 80.

---

### **Kenapa Mean Penting?**

1. **Representatif:** Melibatkan SEMUA data
2. **Mudah Dihitung:** Tinggal jumlah terus bagi
3. **Banyak Digunakan:** Dari nilai rapor sampai IPK kuliah
4. **Dasar Analisis Lanjutan:** Banyak rumus statistik lain pakai mean

**Fun Fact:** Gaji kamu nanti di pekerjaan dihitung rata-ratanya per bulan. Bonusnya dihitung dari performa rata-rata tim. Mean is everywhere!

---

### **Mean untuk Data Tunggal**

Ini adalah kasus paling simple: data belum dikelompokkan, jumlahnya sedikit.

**Rumus:**

$$\bar{x} = \frac{x_1 + x_2 + x_3 + ... + x_n}{n}$$

**Contoh 1:**
Tinggi badan 7 siswa (cm): 160, 165, 162, 170, 168, 165, 170

$$\bar{x} = \frac{160 + 165 + 162 + 170 + 168 + 165 + 170}{7} = \frac{1160}{7} = 165,71 \text{ cm}$$

---

**Contoh 2 (dengan frekuensi):**
Nilai ujian dan frekuensinya:

| Nilai (x) | Frekuensi (f) |
|-----------|---------------|
| 70 | 3 |
| 75 | 5 |
| 80 | 7 |
| 85 | 4 |
| 90 | 1 |

**Kalau ada frekuensi, rumusnya jadi:**

$$\bar{x} = \frac{\sum (x \times f)}{\sum f}$$

**Hitung:**
- 70 × 3 = 210
- 75 × 5 = 375
- 80 × 7 = 560
- 85 × 4 = 340
- 90 × 1 = 90

Total = 210 + 375 + 560 + 340 + 90 = **1575**
Jumlah siswa = 3 + 5 + 7 + 4 + 1 = **20**

$$\bar{x} = \frac{1575}{20} = 78,75$$

---

### **Mean untuk Data Berkelompok**

Ketika data sudah dikelompokkan dalam interval kelas, kita pakai **TITIK TENGAH** sebagai wakil dari setiap kelas.

**Rumus:**

$$\bar{x} = \frac{\sum (x_i \times f_i)}{\sum f_i}$$

Dimana:
- $x_i$ = titik tengah kelas ke-i
- $f_i$ = frekuensi kelas ke-i

**Langkah-langkah:**
1. Tentukan titik tengah setiap kelas: $(x_i) = \frac{\text{Batas bawah + Batas atas}}{2}$
2. Kalikan titik tengah dengan frekuensi: $x_i \times f_i$
3. Jumlahkan semua hasil: $\sum (x_i \times f_i)$
4. Bagi dengan total frekuensi: $\sum f_i$

---

**Contoh:**
Nilai ujian 50 siswa:

| Nilai | Frekuensi (f) | Titik Tengah (xᵢ) | xᵢ × f |
|-------|---------------|-------------------|--------|
| 50 - 59 | 5 | 54,5 | 272,5 |
| 60 - 69 | 12 | 64,5 | 774 |
| 70 - 79 | 18 | 74,5 | 1341 |
| 80 - 89 | 10 | 84,5 | 845 |
| 90 - 99 | 5 | 94,5 | 472,5 |
| **Total** | **50** | | **3705** |

$$\bar{x} = \frac{3705}{50} = 74,1$$

Jadi rata-rata nilai ujian adalah **74,1**.

---

### **Rata-Rata Tertimbang (Weighted Mean)**

Kadang, setiap data punya **bobot (weight)** yang berbeda. Misalnya:
- Nilai Tugas (bobot 30%)
- Nilai UTS (bobot 30%)
- Nilai UAS (bobot 40%)

**Rumus:**

$$\bar{x}_w = \frac{\sum (x_i \times w_i)}{\sum w_i}$$

Dimana:
- $x_i$ = nilai data ke-i
- $w_i$ = bobot data ke-i

---

**Contoh:**
Seorang mahasiswa punya nilai:
- Tugas: 80 (bobot 30%)
- UTS: 75 (bobot 30%)
- UAS: 85 (bobot 40%)

**Hitung:**

$$\bar{x}_w = \frac{(80 \times 30) + (75 \times 30) + (85 \times 40)}{30 + 30 + 40}$$

$$= \frac{2400 + 2250 + 3400}{100} = \frac{8050}{100} = 80,5$$

Jadi nilai akhir mahasiswa adalah **80,5**.

---

### **JEBAKAN UTBK: Mean yang Menyesatkan**

Mean itu powerful, tapi BISA MENYESATKAN kalau datanya ada **outlier** (nilai ekstrem).

**Contoh:**
Gaji 5 karyawan di sebuah startup:
- Karyawan 1: Rp 5.000.000
- Karyawan 2: Rp 5.500.000
- Karyawan 3: Rp 6.000.000
- Karyawan 4: Rp 5.500.000
- CEO: Rp 100.000.000

**Mean:**

$$\bar{x} = \frac{5.000.000 + 5.500.000 + 6.000.000 + 5.500.000 + 100.000.000}{5}$$

$$= \frac{122.000.000}{5} = 24.400.000$$

Jadi rata-rata gaji adalah **Rp 24,4 juta**.

**TAPI tunggu dulu!** Apakah ini representatif? ENGGAK!
- 4 dari 5 orang gajinya di bawah Rp 6 juta
- Mean jadi tinggi karena gaji CEO yang SUPER BESAR (outlier)

**Kesimpulan:** Mean SENSITIF terhadap outlier. Kalau ada data ekstrem, mean bisa jadi tidak representatif.

**Tips UTBK:** Kalau soal kasih data dengan nilai yang jauh berbeda dari yang lain, hati-hati! Pertimbangkan apakah mean adalah ukuran yang tepat atau butuh ukuran lain (median/modus).

---

### **Sifat-Sifat Mean**

#### **1. Jumlah Simpangan dari Mean = 0**

Kalau kamu hitung selisih setiap data dengan mean, lalu dijumlahkan, hasilnya SELALU 0.

**Contoh:**
Data: 2, 4, 6, 8, 10
Mean = (2+4+6+8+10)/5 = 30/5 = 6

Simpangan:
- (2-6) = -4
- (4-6) = -2
- (6-6) = 0
- (8-6) = 2
- (10-6) = 4

Total simpangan = -4 + (-2) + 0 + 2 + 4 = **0** ✓

---

#### **2. Mean Dipengaruhi Semua Data**

Kalau satu data berubah, mean juga berubah.

**Contoh:**
Data awal: 10, 20, 30, 40, 50
Mean = (10+20+30+40+50)/5 = 150/5 = **30**

Ubah satu data: 10, 20, 30, 40, **60**
Mean baru = (10+20+30+40+60)/5 = 160/5 = **32**

Mean berubah dari 30 → 32 karena satu data berubah.

---

#### **3. Mean Unik**

Setiap dataset hanya punya SATU nilai mean. Tidak seperti modus yang bisa lebih dari satu.

---

### **Operasi pada Mean**

#### **Kalau Semua Data Ditambah/Dikurangi Konstanta**

Jika semua data ditambah/dikurangi dengan bilangan $k$, maka mean baru:

$$\bar{x}_{\text{baru}} = \bar{x}_{\text{lama}} + k$$ (untuk penjumlahan)
$$\bar{x}_{\text{baru}} = \bar{x}_{\text{lama}} - k$$ (untuk pengurangan)

**Contoh:**
Data: 10, 20, 30, 40, 50
Mean lama = 30

Semua data ditambah 5 → Data baru: 15, 25, 35, 45, 55
Mean baru = 30 + 5 = **35** ✓

---

#### **Kalau Semua Data Dikali/Dibagi Konstanta**

Jika semua data dikali/dibagi dengan bilangan $k$, maka mean baru:

$$\bar{x}_{\text{baru}} = \bar{x}_{\text{lama}} \times k$$ (untuk perkalian)
$$\bar{x}_{\text{baru}} = \bar{x}_{\text{lama}} / k$$ (untuk pembagian)

**Contoh:**
Data: 10, 20, 30, 40, 50
Mean lama = 30

Semua data dikali 2 → Data baru: 20, 40, 60, 80, 100
Mean baru = 30 × 2 = **60** ✓

---

### **Mean Gabungan (Combined Mean)**

Kalau ada DUA KELOMPOK data dengan mean berbeda, lalu digabung, berapa mean gabungannya?

**Rumus:**

$$\bar{x}_{\text{gabungan}} = \frac{(n_1 \times \bar{x}_1) + (n_2 \times \bar{x}_2)}{n_1 + n_2}$$

Dimana:
- $n_1$ = banyak data kelompok 1
- $\bar{x}_1$ = mean kelompok 1
- $n_2$ = banyak data kelompok 2
- $\bar{x}_2$ = mean kelompok 2

---

**Contoh:**
- Kelas A (30 siswa): Rata-rata nilai = 75
- Kelas B (20 siswa): Rata-rata nilai = 80

Berapa rata-rata gabungan kedua kelas?

$$\bar{x}_{\text{gabungan}} = \frac{(30 \times 75) + (20 \times 80)}{30 + 20}$$

$$= \frac{2250 + 1600}{50} = \frac{3850}{50} = 77$$

Jadi rata-rata gabungan adalah **77**.

**Catatan:** Mean gabungan BUKAN rata-rata dari dua mean! $\frac{75 + 80}{2} = 77,5$ itu SALAH karena tidak mempertimbangkan jumlah siswa di masing-masing kelas.

---

### **Tips dan Trik UTBK tentang Mean**

#### **Trik 1: Pakai Nilai Tengah Sementara (Coding)**

Kalau angkanya gede-gede, kamu bisa pakai **coding** untuk mempermudah perhitungan.

**Langkah:**
1. Pilih nilai tengah sementara (biasanya nilai tengah dari data)
2. Hitung simpangan dari nilai tengah
3. Cari rata-rata simpangan
4. Tambahkan ke nilai tengah

**Contoh:**
Data: 1005, 1010, 1015, 1020, 1025

Pakai nilai tengah = 1015

Simpangan:
- 1005 - 1015 = -10
- 1010 - 1015 = -5
- 1015 - 1015 = 0
- 1020 - 1015 = 5
- 1025 - 1015 = 10

Rata-rata simpangan = (-10 - 5 + 0 + 5 + 10) / 5 = 0/5 = 0

Mean = 1015 + 0 = **1015** ✓

Jadi tanpa hitung 1005+1010+...., kamu langsung dapat jawabannya!

---

#### **Trik 2: Cek Kelogisan Jawaban**

Mean SELALU berada di antara nilai terkecil dan terbesar.

**Contoh:**
Data: 10, 20, 30, 40, 50

Mean PASTI di antara 10-50. Kalau kamu hitung dan dapat mean = 70, pasti salah!

---

#### **Trik 3: Mean untuk Data dengan Pola**

Kalau datanya membentuk BARISAN ARITMATIKA (selisih tetap), mean-nya adalah:

$$\bar{x} = \frac{\text{Nilai pertama + Nilai terakhir}}{2}$$

**Contoh:**
Data: 5, 10, 15, 20, 25

Mean = (5 + 25) / 2 = 30/2 = **15** ✓

Ini jauh lebih cepat daripada (5+10+15+20+25)/5!

---

### **Kapan Pakai Mean?**

✅ **Gunakan Mean ketika:**
- Data tidak ada outlier (nilai ekstrem)
- Data terdistribusi relatif normal (simetris)
- Butuh ukuran yang melibatkan SEMUA data
- Untuk perhitungan statistik lanjutan

❌ **JANGAN gunakan Mean ketika:**
- Ada outlier yang signifikan
- Data sangat tidak simetris (skewed)
- Data kategori/ordinal (pakai modus saja)

---

### **Kesimpulan: Mean is Powerful, But Not Always Perfect**

Mean adalah ukuran pemusatan yang paling populer dan sering dipakai. Tapi ingat:

✅ Mean melibatkan **SEMUA** data dalam perhitungan
✅ Mean **SENSITIF** terhadap outlier
✅ Mean cocok untuk data yang **TERDISTRIBUSI NORMAL**
✅ Ada berbagai trik untuk menghitung mean dengan lebih efisien

Di materi selanjutnya, kita akan belajar tentang **MEDIAN**—ukuran pemusatan yang lebih "stabil" dan tidak terpengaruh outlier. Median ini jadi penyelamat kalau datamu ada yang "nakal"!

---
