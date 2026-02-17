# SECTION 3: Statistika dan Probabilitas
## Topic 3.2: Ukuran Pemusatan dan Penyebaran

---


## **Materi 3.2.4: Penalaran Jangkauan dan Kuartil**

### **Kenapa Ukuran Pemusatan Saja Tidak Cukup?**

Coba perhatikan dua kelas ini:

**Kelas A:** 70, 71, 69, 70, 70 → Mean = 70  
**Kelas B:** 40, 60, 70, 80, 100 → Mean = 70

Rata-ratanya sama, tapi apakah kedua kelas ini "sama"?

**Jelas TIDAK!**

- Kelas A: Semua siswa stabil di sekitar nilai 70
- Kelas B: Ada yang hampir gagal (40), ada yang sempurna (100)

Inilah kenapa kita butuh **ukuran penyebaran** (dispersion)!

### **Jangkauan (Range): Ukuran Penyebaran Paling Sederhana**

**Definisi:**
```
Jangkauan (Range) = Nilai maksimum - Nilai minimum
```

Analoginya: Jangkauan itu kayak ngukur jarak antara rumah orang terkaya dan termiskin di suatu kampung.

**Contoh:**

Data nilai: 50, 60, 70, 80, 90

Range = 90 - 50 = 40

Artinya: "Rentang" nilai dari terendah ke tertinggi adalah 40 poin.

### **Kelebihan dan Kelemahan Range**

**Kelebihan:**
✅ Super gampang dihitung
✅ Kasih gambaran cepat seberapa "lebar" data
✅ Langsung keliatan dari data mentah

**Kelemahan:**
❌ Cuma pake 2 data (min dan max), sisanya diabaikan
❌ Sangat sensitif terhadap outlier
❌ Ga kasih info tentang penyebaran di "tengah" data

**Contoh Kelemahan:**

**Data A:** 10, 50, 50, 50, 50, 50, 90 → Range = 80  
**Data B:** 10, 20, 30, 40, 50, 60, 90 → Range = 80

Range-nya sama, tapi pola penyebarannya BEDA BANGET!

- Data A: Mayoritas mengumpul di 50
- Data B: Tersebar merata

Range ga bisa bedain ini!

### **Jebakan SNBT tentang Range**

**Jebakan #1: "Range besar = Data jelek"**

Tidak selalu! Range besar bisa berarti:
- Variasi tinggi (positif untuk kreativitas)
- Ada outlier (perlu investigasi)
- Skala pengukurannya memang lebar

**Jebakan #2: "Range = Jarak terjauh antar dua data"**

❌ SALAH!

Range = Max - Min, bukan jarak antar sembarang dua data!

Data: 10, 20, 100

Range = 100 - 10 = 90 (bukan 100 - 20 = 80)

**Jebakan #3: "Kalau ada dua data sama, range = 0"**

Hanya benar kalau SEMUA data sama!

Data: 5, 5, 5, 5 → Range = 0 ✅
Data: 5, 5, 10 → Range = 5 ❌ (bukan 0!)

### **Kuartil: Pembagi Data Jadi 4 Bagian**

Kalau median membagi data jadi 2 bagian (50%-50%), kuartil membagi data jadi **4 bagian** (25%-25%-25%-25%).

**Visualisasi:**

```
|----25%----|----25%----|----25%----|----25%----|
Min         Q₁         Q₂(Median)    Q₃         Max
```

**Definisi:**
- **Q₁ (Kuartil Bawah)** = Nilai yang membatasi 25% data terbawah
- **Q₂ (Kuartil Tengah)** = Median (50%)
- **Q₃ (Kuartil Atas)** = Nilai yang membatasi 25% data teratas

### **Cara Menentukan Kuartil**

**Langkah 1: Urutkan Data**

Ini WAJIB! Kuartil ga bisa dihitung dari data acak.

**Langkah 2: Tentukan Posisi Q₁, Q₂, Q₃**

Ada beberapa metode. Yang paling umum di SNBT:

**Metode Posisi:**

Untuk data n angka:

```
Posisi Q₁ = (n+1)/4
Posisi Q₂ = (n+1)/2  [ini median]
Posisi Q₃ = 3(n+1)/4
```

**PENTING:**
- Kalau posisi bilangan bulat → langsung ambil nilai di posisi itu
- Kalau posisi desimal → interpolasi (rata-rata) antara dua nilai terdekat

### **Contoh Perhitungan Kuartil**

**Contoh 1: Data Ganjil**

Data: 10, 20, 30, 40, 50, 60, 70 (n=7)

Posisi Q₁ = (7+1)/4 = 2 → Q₁ = **20** (data ke-2)  
Posisi Q₂ = (7+1)/2 = 4 → Q₂ = **40** (data ke-4)  
Posisi Q₃ = 3(7+1)/4 = 6 → Q₃ = **60** (data ke-6)

**Contoh 2: Data Genap**

Data: 10, 20, 30, 40, 50, 60 (n=6)

Posisi Q₁ = (6+1)/4 = 1.75  
→ Q₁ berada di antara data ke-1 (10) dan ke-2 (20)  
→ Q₁ = 10 + 0.75(20-10) = 10 + 7.5 = **17.5**

Posisi Q₂ = (6+1)/2 = 3.5  
→ Q₂ = (30+40)/2 = **35**

Posisi Q₃ = 3(6+1)/4 = 5.25  
→ Q₃ berada di antara data ke-5 (50) dan ke-6 (60)  
→ Q₃ = 50 + 0.25(60-50) = **52.5**

**Metode Alternatif (Lebih Mudah):**

Bagi data jadi dua di median, lalu cari median masing-masing bagian.

Data: 10, 20, 30, | 40, 50, 60

Bagian bawah: 10, 20, 30 → Median = Q₁ = **20**  
Bagian atas: 40, 50, 60 → Median = Q₃ = **50**

(Hasil bisa sedikit beda tergantung metode, yang penting konsisten!)

### **Jangkauan Interkuartil (IQR): Ukuran Penyebaran yang Robust**

**Definisi:**
```
IQR = Q₃ - Q₁
```

IQR mengukur "lebar" 50% data di tengah (dari Q₁ ke Q₃).

**Kenapa IQR Lebih Baik dari Range?**

IQR "kebal" terhadap outlier karena hanya fokus ke 50% data di tengah!

**Contoh:**

Data: 10, 20, 30, 40, 50, 60, 1000 (ada outlier!)

Range = 1000 - 10 = 990 (kacau karena outlier!)  
IQR = Q₃ - Q₁ ≈ 55 - 25 = 30 (masih wajar!)

### **Penalaran IQR**

**Penalaran #1: IQR Kecil = Data Mengumpul**

IQR = 5 untuk data nilai → 50% siswa nilainya cuma beda 5 poin  
IQR = 30 untuk data nilai → 50% siswa nilainya spread 30 poin

**Penalaran #2: IQR untuk Deteksi Outlier**

Ada aturan standar:

```
Outlier Bawah < Q₁ - 1.5 × IQR
Outlier Atas > Q₃ + 1.5 × IQR
```

Ini aturan "pagar" untuk menentukan nilai yang "terlalu jauh" dari pusat data.

**Contoh:**

Q₁ = 30, Q₃ = 70, IQR = 40

Batas outlier bawah = 30 - 1.5(40) = 30 - 60 = **-30**  
Batas outlier atas = 70 + 1.5(40) = 70 + 60 = **130**

Jadi, nilai < -30 atau > 130 dianggap outlier.

**Penalaran #3: Membandingkan Variabilitas Dua Kelompok**

Mau tau kelas mana yang lebih "seragam"?

Kelas A: IQR = 15  
Kelas B: IQR = 30

Kelas A lebih seragam (50% data lebih rapat).

### **Kuartil untuk Data Berkelompok**

Mirip seperti median, ada rumusnya:

**Rumus Q₁:**
```
Q₁ = Tb + ((n/4 - Fk) / f) × p
```

**Rumus Q₃:**
```
Q₃ = Tb + ((3n/4 - Fk) / f) × p
```

Keterangan sama seperti rumus median:
- Tb = Tepi bawah kelas kuartil
- n = Jumlah data
- Fk = Frekuensi kumulatif sebelum kelas kuartil
- f = Frekuensi kelas kuartil
- p = Panjang kelas

**Langkah-langkah:**

1. Hitung n/4 untuk Q₁ dan 3n/4 untuk Q₃
2. Cari kelas kuartil (kelas yang Fk pertama ≥ n/4 atau 3n/4)
3. Masukkan ke rumus

**Tips SNBT:**
- Biasanya ga diminta hitung manual full
- Fokus ke interpretasi: "Apa arti Q₁ = 65?"
- Jawab: "25% siswa dapat nilai ≤ 65"

### **Jangkauan Semi-Interkuartil (JSIQ)**

Kadang disebut juga **Simpangan Kuartil**.

**Rumus:**
```
JSIQ = (Q₃ - Q₁) / 2 = IQR / 2
```

Ini setengah dari IQR, kadang dipakai untuk ukuran penyebaran "rata-rata" dari pusat (median).

Jarang keluar di SNBT, tapi tau aja konsepnya.

### **Persentil: Generalisasi Kuartil**

Kalau kuartil bagi 4, persentil bagi **100**!

**Definisi:**
- P₂₅ = Q₁ (persentil ke-25)
- P₅₀ = Q₂ = Median
- P₇₅ = Q₃

**Interpretasi:**

P₉₀ = 85 artinya "90% data bernilai ≤ 85"

**Contoh Aplikasi:**

Skor UTBK kamu = persentil 95  
Artinya: Kamu lebih baik dari 95% peserta! 🎉

### **Jebakan SNBT tentang Kuartil**

**Jebakan #1: "Q₁ = 25, artinya 25% data bernilai 25"**

❌ SALAH TOTAL!

Q₁ = 25 artinya "25% data bernilai ≤ 25"

**Jebakan #2: "IQR besar = data jelek"**

Tidak selalu! IQR besar bisa berarti:
- Variasi tinggi (diversity)
- Rentang kemampuan luas

Context matters!

**Jebakan #3: "Q₂ selalu = (Q₁ + Q₃)/2"**

❌ SALAH!

Q₂ itu median, bukan rata-rata Q₁ dan Q₃.

Contoh:
Data: 1, 2, 3, 4, 100

Q₁ = 2, Q₂ = 3, Q₃ = 4

(Q₁+Q₃)/2 = (2+4)/2 = 3 → Kebetulan sama dengan Q₂  
Tapi ini BUKAN aturan umum!

Data: 1, 2, 3, 4, 5

Q₁ = 2, Q₂ = 3, Q₃ = 4

(Q₁+Q₃)/2 = 3 = Q₂ → Kebetulan lagi

Tapi:
Data: 1, 2, 3, 100, 200

Q₁ = 2, Q₂ = 3, Q₃ = 100

(Q₁+Q₃)/2 = 51 ≠ Q₂! ✅

### **Strategi Membaca Soal Kuartil di SNBT**

**Kata Kunci Q₁:**
- "25% data terendah"
- "Kuartil bawah"
- "Persentil 25"

**Kata Kunci Q₃:**
- "25% data tertinggi"
- "Kuartil atas"
- "Persentil 75"

**Kata Kunci IQR:**
- "Jangkauan interkuartil"
- "Rentang 50% data tengah"
- "Penyebaran di sekitar median"

### **Tips Akhir Range dan Kuartil**

1. **Range** = Ukuran kasar, cepat tapi ga robust
2. **IQR** = Ukuran yang lebih stabil, tahan outlier
3. **Kuartil** butuh data **terurut** dulu!
4. **Interpretasi** lebih penting dari rumus
5. Pahami **25%-50%-75%** sebagai konsep pembagian

Range dan kuartil adalah fondasi untuk memahami **penyebaran** data. Di materi selanjutnya, kita akan kenalan dengan visualisasi powerful: **Box Plot**! 📦

---
