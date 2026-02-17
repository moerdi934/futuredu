# SECTION 3: Statistika dan Probabilitas
## Topic 3.1: Analisis Data

---


## 🔍 Materi 3.1.6: Scatter Plot dan Korelasi

### Scatter Plot: When Two Variables Meet

Scatter plot (diagram pencar) adalah grafik yang nunjukin **hubungan antara DUA variabel**. Think of it as "peta" yang nunjukin apakah dua hal berkaitan atau nggak. Di SNBT, ini sering dipake buat test kemampuan analisis hubungan!

### Apa Itu Scatter Plot?

**Definisi:**
Grafik dengan titik-titik yang mewakili pasangan data (x, y)
- Sumbu X = Variabel independen (variabel bebas)
- Sumbu Y = Variabel dependen (variabel terikat)
- Tiap titik = satu observasi/data point

**Contoh konteks:**

```
Hubungan Jam Belajar vs Nilai Ujian (20 siswa)

Nilai
100 |           •
    |         •   •
 90 |       •   •
    |     •   •
 80 |   •   •
    | •   •
 70 | • •
    |•
 60 |
    |____________________
      0  2  4  6  8  10
          Jam Belajar/hari
```

**Insight langsung:**
- Semakin banyak belajar → nilai cenderung lebih tinggi
- Ada **hubungan positif** antara jam belajar dan nilai
- Tapi nggak perfect - ada variasi individual

### Jenis-Jenis Korelasi

#### **1. Korelasi Positif (Positive Correlation)**
Kedua variabel **bergerak searah**
- X naik → Y juga naik
- Titik-titik membentuk pola dari kiri bawah ke kanan atas (↗)

**Contoh:**
- Jam belajar ↑ → Nilai ↑
- Tinggi badan ↑ → Berat badan ↑
- Pengalaman kerja ↑ → Gaji ↑

```
Y |         ••
  |       •••
  |     ••
  |   ••
  | ••
  |____________ X
  Pola naik ↗
```

#### **2. Korelasi Negatif (Negative Correlation)**
Kedua variabel **bergerak berlawanan**
- X naik → Y turun
- Titik-titik membentuk pola dari kiri atas ke kanan bawah (↘)

**Contoh:**
- Jarak dari kampus ↑ → Frekuensi datang ke kelas ↓
- Harga ↑ → Permintaan ↓
- Waktu main game ↑ → Nilai ↓

```
Y | ••
  |   ••
  |     ••
  |       •••
  |         ••
  |____________ X
  Pola turun ↘
```

#### **3. Tidak Ada Korelasi (No Correlation)**
Nggak ada hubungan yang jelas
- X naik → Y acak (nggak pola)
- Titik-titik tersebar random

**Contoh:**
- Ukuran sepatu vs Nilai matematika
- Warna kesukaan vs Tinggi badan
- Nomor HP vs IPK

```
Y |  • •
  | •   •  •
  |•  •   •
  |  •  •
  | •   • •
  |____________ X
  Random, no pattern
```

### Kekuatan Korelasi

Korelasi nggak cuma soal arah (positif/negatif), tapi juga **seberapa kuat** hubungannya!

#### **Korelasi Kuat (Strong)**
Titik-titik **rapat** dan membentuk pola jelas
- Hampir seperti garis lurus
- Variasi kecil dari garis tren

```
Y |       •••
  |     ••••
  |   ••••
  | ••••
  |••
  |__________ X
  Very tight pattern
```

#### **Korelasi Sedang (Moderate)**
Titik-titik membentuk pola tapi **agak menyebar**
- Masih keliatan tren-nya
- Tapi ada variasi cukup besar

```
Y |      • •
  |    • • •
  |  • • •
  | • • •
  |• •
  |__________ X
  Some scatter
```

#### **Korelasi Lemah (Weak)**
Pola **hampir nggak keliatan**
- Titik-titik sangat menyebar
- Tren samar-samar

```
Y | • •   •
  |  • •• 
  | • • •
  |•  • •
  |  • •
  |__________ X
  Barely any pattern
```

### Koefisien Korelasi (r)

**Nilai r berkisar dari -1 sampai +1:**
- **r = +1:** Korelasi positif sempurna (semua titik di garis naik)
- **r = -1:** Korelasi negatif sempurna (semua titik di garis turun)
- **r = 0:** Tidak ada korelasi linear
- **0 < r < 0,3:** Korelasi lemah
- **0,3 ≤ r < 0,7:** Korelasi sedang
- **0,7 ≤ r ≤ 1:** Korelasi kuat

**Catatan:** Angka ini jarang dihafalin di SNBT, tapi konsepnya sering ditanya secara kualitatif.

### Garis Regresi (Line of Best Fit)

**Garis regresi:** Garis lurus yang paling "pas" dengan titik-titik data.

```
Y |      • •• /
  |    • •• /
  |  • • /•
  | • • /•
  |• • /
  |___/____ X
      ← Garis regresi
```

**Fungsi:**
- **Memprediksi** nilai Y dari nilai X tertentu
- **Meringkas** hubungan dalam satu garis

**Persamaan:** y = mx + c
- m = gradien (slope) - seberapa curam garis
- c = intercept - titik potong dengan sumbu Y

### Outlier dalam Scatter Plot

**Outlier:** Titik data yang **jauh** dari pola umum.

```
Y |         •  ← Outlier!
  |
  |     •••
  |   ••••
  | ••••
  |••
  |__________ X
```

**Kenapa penting?**
- Outlier bisa **ngubah** garis regresi
- Bisa jadi **kesalahan data** atau **kasus khusus**
- Di SNBT, sering ditanya: "Titik mana yang outlier?"

**Cara identifikasi:**
- Visual: Liat mana yang "menyendiri"
- Matematika: Pakai IQR atau Z-score (advanced)

### Korelasi ≠ Kausalitas

**SUPER IMPORTANT:** Korelasi nggak berarti sebab-akibat!

**Contoh misleading:**
"Penjualan es krim naik, angka tenggelam juga naik"
→ Ada korelasi TAPI bukan sebab-akibat!
→ Keduanya naik karena musim panas (third variable)

**Jebakan di SNBT:**
Soal: "Dari scatter plot, terlihat semakin tinggi konsumsi kopi, semakin tinggi produktivitas. Apa kesimpulan yang tepat?"

❌ Salah: "Kopi menyebabkan produktivitas tinggi"
✅ Benar: "Ada hubungan positif antara konsumsi kopi dan produktivitas"

**3 kemungkinan:**
1. X menyebabkan Y
2. Y menyebabkan X
3. Ada variabel Z yang pengaruhi X dan Y

### Cara Baca Scatter Plot

#### **Step 1: Identifikasi Variabel**

- Sumbu X: Variabel apa?
- Sumbu Y: Variabel apa?
- Satuan dan skala?

#### **Step 2: Lihat Pola Umum**
- Naik, turun, atau random?
- Rapat atau menyebar?
- Linear atau non-linear?

#### **Step 3: Estimasi Kekuatan**
- Kuat, sedang, atau lemah?
- Titik-titik seberapa deket ke garis imajiner?

#### **Step 4: Cari Outlier**
- Ada titik yang "aneh"?
- Seberapa jauh dari pola?

#### **Step 5: Prediksi dengan Garis Regresi**
- Kalau ada garis regresi, gunakan untuk prediksi
- Tapi ingat: prediksi = estimasi, bukan pasti!

### Jenis Pertanyaan SNBT

#### **Tipe 1: Identifikasi Korelasi**
"Bagaimana hubungan antara variabel X dan Y?"
→ Positif / Negatif / Tidak ada korelasi ✓

#### **Tipe 2: Kekuatan Korelasi**
"Seberapa kuat hubungan antara X dan Y?"
→ Kuat / Sedang / Lemah (berdasarkan visual) ✓

#### **Tipe 3: Prediksi**
"Jika X = 5, estimasi nilai Y?"
→ Gunakan garis regresi (kalau ada) untuk estimasi ✓

#### **Tipe 4: Outlier**
"Titik mana yang merupakan outlier?"
→ Titik yang paling jauh dari pola umum ✓

#### **Tipe 5: Interpretasi**
"Apa yang bisa disimpulkan dari scatter plot ini?"
→ Hati-hati jebakan korelasi vs kausalitas! ✓

#### **Tipe 6: Perbandingan**
"Bandingkan scatter plot A dan B, mana yang korelasinya lebih kuat?"
→ Liat mana yang titik-titiknya lebih rapat ke garis ✓

### Red Flags & Jebakan

🚩 **Jebakan #1: Non-Linear Relationship**
Kadang hubungannya nggak linear (bukan garis lurus)!
Misal: Hubungan kuadratik (parabola) atau eksponensial

```
Y |     ••
  |   ••  ••
  | ••      ••
  |•          •
  |_____________ X
  Kurva, bukan garis!
```

Kalau ditanya "ada korelasi nggak?", jawabnya "ada, tapi non-linear"!

🚩 **Jebakan #2: Range yang Terbatas**
Korelasi kuat di range tertentu, tapi kalau diperluas bisa jadi lemah atau hilang.

🚩 **Jebakan #3: Spurious Correlation**
Dua variabel kebetulan naik/turun bareng, tapi nggak ada hubungan logis.
Contoh konyol: "Penjualan margarin vs angka perceraian di Maine, USA" (real case, tapi nggak masuk akal!)

🚩 **Jebakan #4: Confounding Variable**
Ada variabel lain yang nggak keliatan tapi pengaruhi kedua variabel.

🚩 **Jebakan #5: Extrapolation Trap**
Prediksi nilai X atau Y di luar range data yang ada = bahaya!
Misal: Data X cuma 0-10, prediksi untuk X=100? Nggak reliable!

### Pro Tips

💡 **Tip #1: The Squint Test**
Kalau kamu squint (memicingkan mata), masih keliatan pola? Kalau iya, korelasinya lumayan kuat!

💡 **Tip #2: Imaginary Box**
Bayangin kotak yang bisa "bungkus" semua titik. Makin lonjong kotaknya, makin kuat korelasinya!

💡 **Tip #3: Count the Quadrants**
Bagi scatter plot jadi 4 kuadran (dengan garis imajiner di rata-rata X dan Y).
- Banyak titik di kuadran I & III → Korelasi positif
- Banyak titik di kuadran II & IV → Korelasi negatif

💡 **Tip #4: Context Matters**
Selalu tanya: "Masuk akal nggak hubungan ini secara logika?"
Kalau nggak masuk akal, mungkin spurious correlation!

💡 **Tip #5: Correlation Strength Clues**
Kalau soal ngasih info: "korelasi sangat kuat" tapi scatter plot-nya menyebar → something's off! Mungkin jebakan atau salah baca.

### Real-World Applications

Scatter plot dipake di berbagai bidang:
- **Ekonomi:** Hubungan harga vs permintaan
- **Kesehatan:** BMI vs risiko penyakit
- **Pendidikan:** Jam belajar vs nilai
- **Bisnis:** Biaya iklan vs penjualan
- **Olahraga:** Tinggi vs kemampuan lompat

Di SNBT, konteksnya biasanya seputar pendidikan, sosial, atau ekonomi sederhana.

---
