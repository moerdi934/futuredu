# SECTION 3: Statistika dan Probabilitas
## Topic 3.2: Ukuran Pemusatan dan Penyebaran

---


## **Materi 3.2.2: Penalaran Mean (Rata-rata)**

### **Mean: Si Perfeksionis yang Mau Semua Diperhitungkan**

Mean itu seperti teman yang super adil. Dia mau dengerin semua orang (semua data) sebelum kasih keputusan. Tapi justru karena terlalu "baik hati" ini, dia gampang dimanfaatin sama yang "nakal" (outlier).

### **Konsep Dasar Mean**

**Rumus Klasik:**
```
Mean = Jumlah semua data / Banyak data
x̄ = (x₁ + x₂ + x₃ + ... + xₙ) / n
```

Tapi di SNBT, jarang yang sekedar "jumlahkan terus bagi". Ada twist-nya!

### **Penalaran Mean: Beyond Rumus**

**Penalaran #1: Mean sebagai "Titik Keseimbangan"**

Bayangin mean kayak fulcrum (titik tumpu) di timbangan. Kalau kamu taruh semua data di garis bilangan, mean itu titik di mana kiri-kanan seimbang sempurna.

Implikasi:
- Jumlah jarak data di bawah mean = Jumlah jarak data di atas mean
- Kalau ada data yang ditambah/dikurangi, mean akan "bergerak"
- Semakin ekstrem outlier, semakin jauh mean "terseret"

**Penalaran #2: Pengaruh Nilai Ekstrem pada Mean**

Ini jebakan favorit SNBT! Coba perhatikan:

**Data awal**: 60, 65, 70, 75, 80 → Mean = 70

**Skenario A**: Tambah nilai 90 → Mean naik jadi 73.3  
**Skenario B**: Tambah nilai 200 → Mean loncat jadi 91.7!

Lihat bedanya? Nilai ekstrem bisa "menyeret" mean jauh dari mayoritas data!

**Jebakan SNBT:**
> "Rata-rata nilai 5 siswa adalah 70. Jika satu siswa dengan nilai 50 keluar, rata-ratanya jadi..."

Banyak yang langsung hitung ulang dari awal. Padahal ada cara cepat!

**Trik Cepat:**
- Total nilai awal = 70 × 5 = 350
- Nilai yang keluar = 50
- Total baru = 350 - 50 = 300
- Mean baru = 300 ÷ 4 = 75

### **Mean Tertimbang (Weighted Mean)**

Ini versi "VIP" dari mean biasa. Beberapa data punya "bobot" lebih besar.

**Rumus:**
```
x̄w = (w₁x₁ + w₂x₂ + ... + wₙxₙ) / (w₁ + w₂ + ... + wₙ)
```

**Kapan Pakai Mean Tertimbang?**

**Situasi 1: Nilai Rapot dengan Bobot SKS**
- Matematika (4 SKS) nilai 80
- Bahasa Indonesia (2 SKS) nilai 90
- Olahraga (1 SKS) nilai 100

Ga bisa dirata-rata biasa dong! Matematika lebih "berat" pengaruhnya.

Mean tertimbang = (4×80 + 2×90 + 1×100) / (4+2+1) = 580/7 ≈ 82.9

**Situasi 2: Harga Rata-rata dengan Jumlah Berbeda**
- Beli 3 apel @Rp 5.000 = Rp 15.000
- Beli 7 apel @Rp 4.000 = Rp 28.000

Harga rata-rata per apel = 43.000 / 10 = Rp 4.300 (bukan Rp 4.500!)

**Jebakan SNBT dengan Mean Tertimbang:**
> "Rata-rata nilai ulangan matematika dengan bobot 60% adalah 80, dan tugas dengan bobot 40% adalah 70. Nilai akhirnya adalah..."

Banyak yang jawab: (80+70)/2 = 75 ❌

Seharusnya: 0.6(80) + 0.4(70) = 48 + 28 = 76 ✅

### **Menentukan Nilai yang Hilang dengan Mean**

Ini tipe soal yang PASTI keluar di SNBT!

**Template Soal:**
> "Rata-rata 6 bilangan adalah 15. Lima bilangan yang diketahui adalah 10, 12, 14, 18, 20. Bilangan keenam adalah..."

**Cara Konvensional:**
- Total = 15 × 6 = 90
- Total 5 bilangan = 10+12+14+18+20 = 74
- Bilangan ke-6 = 90 - 74 = 16

**Cara Cerdas (Penalaran Deviasi):**
Mean = 15, berarti semua bilangan "berdeviasi" dari 15.
- 10 → deviasi -5
- 12 → deviasi -3
- 14 → deviasi -1
- 18 → deviasi +3
- 20 → deviasi +5

Total deviasi = -5-3-1+3+5 = -1

Agar mean tetap 15, deviasi total harus 0, jadi bilangan ke-6 harus punya deviasi +1 → 15+1 = 16 ✅

### **Perubahan Data dan Pengaruhnya pada Mean**

Ini konsep PENTING yang wajib dikuasai!

**Transformasi Linear: y = ax + b**

Kalau semua data ditransformasi dengan rumus yang sama:

- **Dikalikan konstanta a** → Mean baru = a × Mean lama
- **Ditambah konstanta b** → Mean baru = Mean lama + b
- **Kombinasi** → Mean baru = a × Mean lama + b

**Contoh Kasus:**

Data suhu dalam Celsius: 20°, 25°, 30° → Mean = 25°C

Dikonversi ke Fahrenheit: F = (9/5)C + 32

Mean Fahrenheit = (9/5)(25) + 32 = 45 + 32 = 77°F ✅

Ga perlu hitung satu-satu!

**Jebakan SNBT:**
> "Rata-rata tinggi 10 siswa adalah 160 cm. Jika semua siswa memakai sepatu hak 5 cm, rata-rata tinggi mereka jadi..."

Jawaban: 165 cm (tinggal tambah 5!)

Tapi hati-hati dengan jebakan ini:
> "Jika semua tinggi siswa dikalikan 1.5, rata-ratanya jadi..."

Banyak yang jawab 160 + 1.5 = 161.5 ❌

Seharusnya: 160 × 1.5 = 240 cm ✅

### **Mean untuk Data Berkelompok**

Kalau datanya udah dalam bentuk tabel frekuensi:

```
Mean = (f₁x₁ + f₂x₂ + ... + fₙxₙ) / (f₁ + f₂ + ... + fₙ)
Mean = Σ(fi × xi) / Σfi
```

Di mana:
- fi = frekuensi kelas ke-i
- xi = nilai tengah kelas ke-i (titik tengah interval)

**Cara Cari Nilai Tengah:**
xi = (Batas bawah + Batas atas) / 2

**Contoh:**

| Interval Nilai | Frekuensi | Nilai Tengah | f×x |
|----------------|-----------|--------------|-----|
| 60-69 | 5 | 64.5 | 322.5 |
| 70-79 | 10 | 74.5 | 745 |
| 80-89 | 8 | 84.5 | 676 |
| 90-99 | 2 | 94.5 | 189 |

Mean = (322.5 + 745 + 676 + 189) / 25 = 1932.5 / 25 = 77.3

**Tips SNBT:**
Biasanya soal ga bakal minta kamu hitung full. Mereka akan kasih beberapa nilai Σ(f×x) atau Σf sudah dihitung. Fokus ke penalaran!

### **Kesalahan Umum dalam Penalaran Mean**

**Kesalahan #1: "Mean Gabungan = Mean dari Mean"**

Ada dua kelas:
- Kelas A: 30 siswa, mean 70
- Kelas B: 20 siswa, mean 80

Mean gabungan bukan (70+80)/2 = 75!

Tapi: [(30×70) + (20×80)] / 50 = 74 ✅

**Kesalahan #2: "Menambah Data Sama dengan Mean Ga Ubah Mean"**

❌ SALAH!

Data: 60, 70, 80 → Mean = 70

Tambah satu data 70: 60, 70, 70, 80 → Mean masih 70 ✅ (ini benar)

Tapi perhatikan:
Tambah DUA data 70: 60, 70, 70, 70, 80 → Mean = 70 ✅

Tambah TIGA data 70: 60, 70, 70, 70, 70, 80 → Mean naik jadi 70.7!

Kenapa? Karena "bobot" nilai 70 semakin dominan!

**Kesalahan #3: "Outlier Ga Terlalu Berpengaruh"**

Ini bahaya banget. Satu outlier bisa menggeser mean drastis!

Data: 50, 55, 60, 65, 70 → Mean = 60

Tambah outlier 1000: Mean langsung jadi 216.7!

### **Strategi SNBT: Kapan Pakai Mean?**

**Sinyal PAKAI Mean:**
- Soal bilang "rata-rata" atau "mean"
- Data numerik continuous (berat, tinggi, nilai)
- Ga ada outlier ekstrem yang disebutkan
- Diminta perhitungan matematis lanjutan

**Sinyal JANGAN Pakai Mean:**
- Ada kata "median lebih cocok karena..."
- Data sangat miring (skewed)
- Ada outlier yang jelas disebutkan
- Data ordinal/kategorikal

### **Tips Akhir untuk Mean**

1. **Pahami Mean sebagai Titik Keseimbangan** → Konsep ini membantu penalaran cepat
2. **Ingat Sifat Transformasi Linear** → Hemat waktu hitung
3. **Hati-hati dengan Mean Tertimbang** → Jebakan favorit SNBT
4. **Cek Outlier Dulu** → Tentukan apakah mean cocok dipakai
5. **Gunakan Trik Total** → Lebih cepat dari hitung ulang

Mean itu powerful, tapi harus bijak menggunakannya. Di materi berikutnya, kita akan kenalan sama "saudara" mean yang lebih tahan banting: **Median**! 🎯

---
