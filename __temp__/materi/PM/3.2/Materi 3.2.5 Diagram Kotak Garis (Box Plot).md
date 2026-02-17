# SECTION 3: Statistika dan Probabilitas
## Topic 3.2: Ukuran Pemusatan dan Penyebaran

---


## **Materi 3.2.5: Diagram Kotak Garis (Box Plot)**

### **Box Plot: Visualisasi 5 Angka Ajaib**

Box Plot (diagram kotak-garis) itu kayak "foto rontgen" data. Dari satu gambar sederhana, kamu bisa tau BANYAK informasi tentang datamu!

Yang digambarkan di box plot:
1. Minimum (Min)
2. Kuartil Bawah (Q₁)
3. Median (Q₂)
4. Kuartil Atas (Q₃)
5. Maksimum (Max)

Kelima angka ini disebut **Five-Number Summary**.

### **Anatomi Box Plot**

```
        |----whisker----|----box----|----whisker----|
      Min               Q₁    Q₂    Q₃              Max
                           Median
        
        ◄────── IQR ──────►
```

**Bagian-bagian:**

1. **Kotak (Box)** = Dari Q₁ ke Q₃ (berisi 50% data tengah)
2. **Garis di tengah kotak** = Median
3. **Whisker kiri** = Dari Min ke Q₁
4. **Whisker kanan** = Dari Q₃ ke Max
5. **Titik-titik di luar whisker** = Outlier (kalau ada)

### **Membaca Box Plot: Apa yang Bisa Kita Lihat?**

**Informasi #1: Penyebaran Data**

Semakin panjang box atau whisker = semakin menyebar datanya

**Box sempit + Whisker panjang:**
```
|-----------|=|-----------|
```
→ 50% data tengah rapat, tapi ada ekstrem di ujung

**Box lebar + Whisker pendek:**
```
|-----|=====|-----|
```
→ 50% data tengah menyebar, tapi ujung ga ekstrem

**Informasi #2: Simetri vs Skewness**

**Simetris:**
```
|-----|--=--|-----|
```
Median di tengah box, whisker sama panjang → Distribusi normal

**Miring Kanan (Right Skewed):**
```
|--|===----|------|
```
Median dekat Q₁, whisker kanan panjang → Ada nilai besar ekstrem

**Miring Kiri (Left Skewed):**
```
|------|----===|--|
```
Median dekat Q₃, whisker kiri panjang → Ada nilai kecil ekstrem

**Informasi #3: Identifikasi Outlier**

Titik di luar whisker = Outlier potensial

```
    •
|-------|=====|-------|      •  •
                            ↑
                       Outlier
```

**Aturan Outlier:**
- Outlier bawah: < Q₁ - 1.5 × IQR
- Outlier atas: > Q₃ + 1.5 × IQR

### **Contoh Membaca Box Plot**

Misalkan ada box plot nilai ujian:

```
20    40    55  60   75         95
|-----|-----|=|-----|-----------|
Min   Q₁    Median Q₃          Max
```

**Yang Bisa Kita Baca:**

1. **Nilai terendah** = 20, **tertinggi** = 95
2. **25% siswa** nilai ≤ 40
3. **50% siswa** nilai ≤ 60 (median)
4. **75% siswa** nilai ≤ 75
5. **IQR** = 75 - 40 = 35 (rentang 50% siswa tengah)
6. **Distribusi miring kanan** (median dekat Q₁, whisker kanan panjang)
7. **Ada kemungkinan outlier** di atas (nilai 95 cukup jauh)

### **Membandingkan Dua Box Plot**

Ini kekuatan super box plot! Bisa bandingkan dua kelompok data dalam satu pandangan.

**Contoh: Perbandingan Kelas A vs Kelas B**

```
Kelas A:  |-----|=====|----|
                40  50  60  70

Kelas B:    |----|=|-------|
            30   50 55     90
```

**Analisis Cepat:**

**Median:**
- Kelas A: 50
- Kelas B: 55
→ Kelas B sedikit lebih baik

**IQR (Konsistensi):**
- Kelas A: IQR kecil → Lebih konsisten
- Kelas B: IQR besar → Lebih bervariasi

**Penyebaran:**
- Kelas A: Whisker pendek → Data rapat
- Kelas B: Whisker panjang (terutama kanan) → Ada siswa sangat bagus (90)

**Kesimpulan:**
Kelas A lebih konsisten, Kelas B punya rentang lebih luas dengan beberapa siswa berprestasi tinggi.

### **Penalaran Mendalam Box Plot**

**Penalaran #1: Luas Area ≠ Jumlah Data**

Ini jebakan klasik!

Box plot **TIDAK** menunjukkan jumlah data. Bisa aja:
- Box plot A: 10 data
- Box plot B: 1000 data

Tapi bentuk box plot-nya bisa sama!

Yang ditunjukkan adalah **DISTRIBUSI**, bukan JUMLAH.

**Penalaran #2: 50% Data Ada di Dalam Box**

Ini penting!

Kalau box sangat sempit → 50% data mengumpul di rentang kecil  
Kalau box sangat lebar → 50% data menyebar di rentang luas

**Penalaran #3: Whisker Ga Selalu Ke Min/Max**

Kalau ada outlier, whisker berhenti di:
- Batas bawah: Q₁ - 1.5 × IQR
- Batas atas: Q₃ + 1.5 × IQR

Outlier ditandai dengan titik terpisah.

### **Menggambar Box Plot dari Data**

**Langkah-langkah:**

1. **Urutkan data** dari terkecil ke terbesar
2. **Hitung five-number summary:**
   - Min, Q₁, Median, Q₃, Max
3. **Tentukan skala** sumbu horizontal
4. **Gambar box** dari Q₁ ke Q₃
5. **Buat garis median** di tengah box
6. **Tarik whisker** ke Min dan Max (atau batas outlier)
7. **Tandai outlier** dengan titik (jika ada)

**Contoh:**

Data: 10, 15, 18, 20, 22, 25, 30, 35, 100

Five-number summary:
- Min = 10
- Q₁ = 18 (posisi 2.5 → rata-rata 18 dan 20 = 19, atau ambil 18)
- Median = 22
- Q₃ = 30 (posisi 7.5 → rata-rata 30 dan 35 = 32.5, atau ambil 30)
- Max = 100

IQR = 30 - 18 = 12

Cek outlier:
- Batas atas = 30 + 1.5(12) = 48

100 > 48 → **100 adalah outlier!**

Jadi whisker kanan cuma sampai 35, dan 100 ditandai dengan titik terpisah.

```
10    18  22  30  35              100•
|-----|=|==|--|-----|              
Min   Q₁ M  Q₃ Whisker          Outlier
```

### **Jebakan SNBT tentang Box Plot**

**Jebakan #1: "Box lebih besar = Data lebih banyak"**

❌ SALAH TOTAL!

Box lebih besar = Data lebih **MENYEBAR**, bukan lebih banyak.

**Jebakan #2: "Median selalu di tengah box"**

❌ TIDAK SELALU!

Kalau data miring:
- Median bisa dekat Q₁ (miring kanan)
- Median bisa dekat Q₃ (miring kiri)

**Jebakan #3: "Whisker selalu sama panjang"**

Hanya benar kalau distribusi simetris!

Kalau miring, whisker bisa panjang sebelah.

**Jebakan #4: "Nilai dalam box lebih banyak dari nilai di whisker"**

❌ SALAH!

- Box = 50% data (Q₁ ke Q₃)
- Whisker kiri = 25% data (Min ke Q₁)
- Whisker kanan = 25% data (Q₃ ke Max)

Jadi jumlah data di box = jumlah data di kedua whisker!

**Jebakan #5: "Ga ada box plot = Ga ada outlier"**

Box plot bisa tidak menunjukkan outlier kalau memang tidak ada yang memenuhi kriteria outlier.

### **Aplikasi Box Plot dalam Soal SNBT**

**Tipe Soal #1: Interpretasi**

Diberikan box plot, ditanya:
- "Berapa persen siswa yang nilainya di atas 70?"
- "Rentang nilai 50% siswa tengah adalah..."
- "Apakah distribusi simetris?"

**Trik:** Ingat makna Q₁, median, Q₃!

**Tipe Soal #2: Perbandingan**

Diberikan 2-3 box plot, ditanya:
- "Kelas mana yang lebih konsisten?"
- "Kelas mana yang mediannya lebih tinggi?"
- "Kelas mana yang punya outlier?"

**Trik:** Bandingkan IQR (konsistensi), median (pusat), whisker (ekstrem)

**Tipe Soal #3: Identifikasi Outlier**

Diberikan data atau box plot, ditanya:
- "Nilai berapa yang dianggap outlier?"
- "Apakah nilai 95 termasuk outlier?"

**Trik:** Hitung batas outlier = Q₁ - 1.5×IQR dan Q₃ + 1.5×IQR

### **Box Plot vs Histogram**

**Box Plot:**
✅ Ringkas, cepat lihat five-number summary  
✅ Mudah bandingkan banyak kelompok  
✅ Jelas keliatan outlier  
❌ Ga keliatan distribusi detail (bimodal, dll)  
❌ Ga tau jumlah data

**Histogram:**
✅ Keliatan bentuk distribusi lengkap  
✅ Keliatan frekuensi (jumlah data)  
✅ Bisa deteksi pola spesifik  
❌ Sulit bandingkan banyak kelompok  
❌ Lebih ribet dibuat

**Kapan Pakai Box Plot?**
- Mau cepat lihat median, IQR, range
- Mau bandingkan beberapa kelompok
- Fokus ke penyebaran, bukan detail distribusi

**Kapan Pakai Histogram?**
- Mau tau bentuk distribusi lengkap
- Mau tau frekuensi spesifik
- Deteksi pola khusus (bimodal, dll)

### **Tips Mahir Box Plot**

1. **Fokus ke posisi median dalam box** → Tanda simetri/skewness
2. **Bandingkan panjang whisker** → Deteksi ekstrem
3. **Liat lebar IQR** → Ukur konsistensi
4. **Cari titik di luar whisker** → Identifikasi outlier
5. **Jangan lupa konteks** → Interpretasi harus sesuai situasi

### **Penutup Materi 3.2.5**

Box Plot adalah visualisasi powerful yang merangkum banyak info dalam satu gambar sederhana. Dengan memahami anatomi dan cara bacanya, kamu bisa:

- Cepat identifikasi pusat dan penyebaran data
- Deteksi outlier dengan mudah
- Bandingkan beberapa kelompok sekaligus
- Lihat bentuk distribusi (simetris/miring)

Di materi selanjutnya, kita akan deep dive ke ukuran penyebaran yang paling presisi: **Variansi dan Standar Deviasi**! 📈

---
