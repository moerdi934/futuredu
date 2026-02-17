# SECTION 3: Statistika dan Probabilitas
## Topic 3.2: Ukuran Pemusatan dan Penyebaran

---


## **Materi 3.2.6: Variansi dan Standar Deviasi dalam Penalaran**

### **Kenapa IQR Saja Tidak Cukup?**

Coba lihat dua kelas ini:

**Kelas A:** 40, 50, 60, 70, 80 → IQR = 30  
**Kelas B:** 20, 50, 60, 70, 100 → IQR = 30

IQR-nya sama! Tapi apakah penyebarannya benar-benar "sama"?

**Tidak juga!**

Kelas B punya nilai lebih ekstrem (20 dan 100), sedangkan Kelas A lebih "stabil".

Inilah kenapa kita butuh ukuran yang mempertimbangkan **SEMUA DATA DAN SEBERAPA JAUH DARI MEAN** → Variansi dan Standar Deviasi!

### **Konsep Inti: Deviasi dari Mean**

**Deviasi** = Jarak suatu data dari mean

Rumus: `Deviasi = xi - x̄`

**Contoh:**

Data: 60, 70, 80 → Mean = 70

Deviasi masing-masing:
- 60 → 60 - 70 = **-10** (10 di bawah mean)
- 70 → 70 - 70 = **0** (tepat di mean)
- 80 → 80 - 70 = **+10** (10 di atas mean)

**Insight Penting:**

Jumlah semua deviasi **SELALU = 0** !

Kenapa? Karena mean itu "titik keseimbangan".

(-10) + 0 + (+10) = 0 ✅

Makanya, untuk mengukur penyebaran, kita ga bisa pakai "rata-rata deviasi" (hasilnya pasti 0).

### **Variansi: Rata-rata Deviasi Kuadrat**

Supaya deviasi negatif ga "membatalkan" deviasi positif, kita **kuadratkan** semua deviasi!

**Rumus Variansi (Populasi):**

```
σ² = Σ(xi - μ)² / N
```

**Rumus Variansi (Sampel):**

```
s² = Σ(xi - x̄)² / (n-1)
```

Keterangan:
- σ² (sigma kuadrat) = variansi populasi
- s² = variansi sampel
- μ (mu) = mean populasi
- x̄ = mean sampel
- N = jumlah data populasi
- n = jumlah data sampel

**Kenapa (n-1) untuk sampel?**

Ini namanya **Bessel's correction**. Pembagi (n-1) memberikan estimasi variansi yang lebih akurat untuk populasi. Konsep ini agak advanced, tapi yang penting tau: untuk **sampel** pakai (n-1), untuk **populasi lengkap** pakai N.

Di SNBT, kalau ga disebutkan spesifik, biasanya pakai **n** (populasi).

### **Standar Deviasi: Akar Variansi**

**Masalah Variansi:** Satuannya kuadrat (misal: cm² untuk data tinggi)

**Solusi:** Ambil akar kuadratnya → Standar Deviasi!

**Rumus Standar Deviasi:**

```
σ = √(σ²)  [populasi]
s = √(s²)  [sampel]
```

Standar deviasi punya satuan yang sama dengan data asli → Lebih mudah diinterpretasi!

### **Contoh Perhitungan Manual**

Data: 60, 70, 80

**Langkah 1: Hitung Mean**

x̄ = (60 + 70 + 80) / 3 = 70

**Langkah 2: Hitung Deviasi**

- 60 - 70 = -10
- 70 - 70 = 0
- 80 - 70 = 10

**Langkah 3: Kuadratkan Deviasi**

- (-10)² = 100
- (0)² = 0
- (10)² = 100

**Langkah 4: Hitung Variansi**

σ² = (100 + 0 + 100) / 3 = 200/3 ≈ 66.67

**Langkah 5: Hitung Standar Deviasi**

σ = √66.67 ≈ **8.16**

**Interpretasi:**

Standar deviasi ≈ 8.16 artinya rata-rata data "menyimpang" sekitar 8.16 dari mean (70).

### **Penalaran Variansi dan Standar Deviasi**

**Penalaran #1: Semakin Besar = Semakin Menyebar**

- σ = 5 → Data rapat di sekitar mean
- σ = 50 → Data tersebar jauh dari mean

**Contoh:**

Kelas A: Nilai 68, 69, 70, 71, 72 → σ kecil → Konsisten  
Kelas B: Nilai 40, 50, 70, 90, 100 → σ besar → Bervariasi

**Penalaran #2: σ = 0 ↔ Semua Data Sama**

Kalau semua data identik:

Data: 50, 50, 50, 50

Semua deviasi = 0 → Variansi = 0 → σ = 0

**Sebaliknya:** Kalau σ = 0, pasti semua data sama!

**Penalaran #3: Perubahan Data → Perubahan σ**

**Transformasi: y = ax + b**

- **Ditambah/dikurangi konstanta b** → σ **TIDAK BERUBAH**
- **Dikalikan/dibagi konstanta a** → σ baru = |a| × σ lama

**Contoh:**

Data: 10, 20, 30 → σ = 8.16 (misal)

**Semua + 5:** 15, 25, 35  
→ σ tetap = 8.16 (penambahan ga ubah penyebaran!)

**Semua × 2:** 20, 40, 60  
→ σ baru = 2 × 8.16 = 16.32 (perkalian ubah penyebaran!)

**Ini Jebakan Favorit SNBT!**

> "Mean tinggi siswa 160 cm dengan standar deviasi 10 cm. Jika semua siswa memakai sepatu hak 5 cm, standar deviasi tinggi mereka jadi..."

Jawaban: **Tetap 10 cm** (penambahan konstan ga ubah penyebaran!) ✅

Banyak yang jawab 15 cm ❌

**Penalaran #4: σ untuk Identifikasi Outlier (Aturan Empiris)**

Untuk distribusi normal (bentuk lonceng):

- **68%** data dalam 1 standar deviasi dari mean (μ ± σ)
- **95%** data dalam 2 standar deviasi (μ ± 2σ)
- **99.7%** data dalam 3 standar deviasi (μ ± 3σ)

Ini disebut **Aturan 68-95-99.7** atau **Empirical Rule**.

**Aplikasi:**

Mean = 70, σ = 10

- 68% siswa nilainya 60-80
- 95% siswa nilainya 50-90
- 99.7% siswa nilainya 40-100

Nilai di luar 40-100 sangat langka (< 0.3%) → Potensial outlier!

### **Variansi vs Standar Deviasi: Mana yang Dipakai?**

**Gunakan Variansi (σ²):**
- Perhitungan matematis lanjutan
- Aditif (bisa dijumlahkan untuk independen variables)
- Teori statistik

**Gunakan Standar Deviasi (σ):**
- Interpretasi praktis
- Satuan sama dengan data asli
- Komunikasi hasil ke orang awam

**Di SNBT:** Lebih sering diminta **standar deviasi** karena lebih intuitif!

### **Koefisien Variasi: Membandingkan Penyebaran Relatif**

Kalau mau bandingkan variabilitas dua data dengan **satuan atau skala berbeda**, pakai **Koefisien Variasi (CV)**.

**Rumus:**

```
CV = (σ / x̄) × 100%
```

CV menyatakan standar deviasi sebagai **persentase dari mean**.

**Contoh:**

**Tinggi Siswa:**
- Mean = 160 cm, σ = 10 cm
- CV = (10/160) × 100% = **6.25%**

**Berat Siswa:**
- Mean = 50 kg, σ = 5 kg
- CV = (5/50) × 100% = **10%**

**Kesimpulan:**

Meskipun σ tinggi (10) > σ berat (5), tapi **relatif terhadap mean**, berat lebih bervariasi (CV lebih besar)!

**Kapan Pakai CV?**
- Bandingkan variabilitas data dengan satuan berbeda
- Bandingkan variabilitas data dengan skala berbeda
- Tentukan mana yang "lebih konsisten" secara relatif

**Interpretasi CV:**

- CV < 10% → Variabilitas rendah (konsisten)
- CV 10-20% → Variabilitas sedang
- CV > 20% → Variabilitas tinggi (tidak konsisten)

### **Jebakan SNBT tentang Variansi dan Standar Deviasi**

**Jebakan #1: "Variansi ga bisa negatif, jadi standar deviasi juga ga bisa"**

✅ **BENAR!**

Karena variansi = jumlah kuadrat (selalu positif atau 0), maka σ ≥ 0.

**Jebakan #2: "Standar deviasi selalu lebih kecil dari variansi"**

❌ TIDAK SELALU!

- Kalau σ < 1, maka σ² < σ (misal: σ = 0.5, σ² = 0.25)
- Kalau σ = 1, maka σ² = σ
- Kalau σ > 1, maka σ² > σ (misal: σ = 3, σ² = 9)

**Jebakan #3: "Data dengan range besar pasti σ besar"**

Tidak selalu!

Data A: 10, 50, 90 (range = 80, tapi cuma 3 data)  
Data B: 10, 11, 12, ..., 90 (range = 80, tapi 81 data merata)

σ bisa lebih kecil di Data B karena lebih banyak data di tengah!

**Jebakan #4: "Menambah data sama dengan mean ga ubah σ"**

Hati-hati! Bisa ubah bisa tidak, tergantung frekuensi.

Lihat contoh di Materi 3.2.2 (Mean).

**Jebakan #5: "σ besar = data jelek"**

Context matters!

- Untuk nilai ujian: σ besar bisa berarti ketimpangan kemampuan
- Untuk portofolio investasi: σ besar = risiko tinggi
- Untuk kreativitas: σ besar bisa berarti diversity ide (bagus!)

### **Perhitungan Cepat dengan Rumus Alternatif**

Untuk hemat waktu, ada rumus variansi yang ga perlu hitung deviasi satu-satu:

**Rumus Praktis Variansi:**

```
σ² = (Σxi²/n) - (x̄)²
```

Atau:

```
σ² = [Σxi² - (Σxi)²/n] / n
```

**Contoh:**

Data: 2, 4, 6

**Cara Biasa:**
- Mean = 4
- Deviasi: -2, 0, 2
- Kuadrat: 4, 0, 4
- Variansi = 8/3 ≈ 2.67

**Cara Cepat:**
- Σxi = 12
- Σxi² = 4 + 16 + 36 = 56
- σ² = (56/3) - 4² = 18.67 - 16 = 2.67 ✅

Sama, tapi lebih cepat!

### **Variansi untuk Data Berkelompok**

Kalau data dalam tabel frekuensi:

**Rumus:**

```
σ² = [Σfi(xi - x̄)²] / Σfi
```

Atau versi cepat:

```
σ² = [Σfi·xi²/Σfi] - (x̄)²
```

**Langkah:**
1. Hitung mean dulu (Σfixi / Σfi)
2. Hitung Σfi(xi - x̄)² atau Σfixi²
3. Masukkan ke rumus

### **Interpretasi Standar Deviasi dalam Konteks**

**Konteks Nilai Ujian:**

Mean = 75, σ = 5 → Kelas homogen (nilai mengumpul 70-80)  
Mean = 75, σ = 20 → Kelas heterogen (ada yang 40, ada yang 100)

**Konteks Produksi:**

Produk A: Diameter mean = 10 cm, σ = 0.1 cm → Konsisten, kualitas stabil  
Produk B: Diameter mean = 10 cm, σ = 2 cm → Tidak konsisten, perlu perbaikan proses

**Konteks Investasi:**

Saham A: Return mean = 10%, σ = 5% → Risiko rendah  
Saham B: Return mean = 10%, σ = 30% → Risiko tinggi (volatile)

### **Tips Mahir Variansi dan Standar Deviasi**

1. **Pahami makna deviasi** sebagai "jarak dari mean"
2. **Ingat transformasi:** + ga ubah σ, × ubah σ
3. **Pakai rumus cepat** untuk hemat waktu
4. **CV untuk perbandingan relatif** antar data beda satuan
5. **Interpretasi sesuai konteks** (σ besar bukan selalu jelek!)
6. **Aturan 68-95-99.7** untuk distribusi normal

### **Perbandingan Lengkap Ukuran Penyebaran**

| Ukuran | Kelebihan | Kelemahan | Kapan Pakai |
|--------|-----------|-----------|-------------|
| **Range** | Cepat, mudah | Sensitif outlier, cuma 2 data | Gambaran kasar |
| **IQR** | Tahan outlier | Ga pakai semua data | Deteksi outlier, robust |
| **Variansi** | Matematis, aditif | Satuan kuadrat, sulit diinterpretasi | Perhitungan lanjutan |
| **Std Dev** | Satuan sama data, intuitif | Sensitif outlier | Interpretasi umum |
| **CV** | Perbandingan relatif | Perlu mean > 0 | Beda satuan/skala |

### **Penutup Materi 3.2.6**

Variansi dan Standar Deviasi adalah ukuran penyebaran paling presisi karena mempertimbangkan **SEMUA data** dan seberapa jauh dari mean.

**Key Takeaways:**

✅ Variansi = rata-rata deviasi kuadrat  
✅ Standar deviasi = akar variansi (satuan sama dengan data)  
✅ σ = 0 ↔ Semua data sama  
✅ Transformasi +/- ga ubah σ, tapi ×/÷ ubah σ  
✅ CV untuk bandingkan variabilitas relatif  
✅ Aturan 68-95-99.7 untuk distribusi normal

**Selamat!** Kamu sudah menyelesaikan **Topic 3.2: Ukuran Pemusatan dan Penyebaran** secara lengkap! 🎉

Sekarang kamu punya toolkit lengkap untuk menganalisis data:
- **Pemusatan:** Mean, Median, Modus
- **Penyebaran:** Range, IQR, Variansi, Standar Deviasi
- **Visualisasi:** Box Plot

Dengan pemahaman mendalam ini, kamu siap tackle soal-soal SNBT yang melibatkan analisis statistik deskriptif! 💪📊