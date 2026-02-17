# SECTION 1: Aljabar dan Persamaan
## Topic 1.2: Persamaan Linear

---


## **Materi 1.2.7: Pertidaksamaan Linear Dua Variabel**

### 🎯 **Apa Itu Pertidaksamaan Linear Dua Variabel?**

Kalau **persamaan** garis itu kayak **garis tepat**, maka **pertidaksamaan** itu kayak **daerah di sekitar garis**!

Bayangin kamu lagi buka warung:
- Modal maksimal Rp100.000
- Beli ayam Rp20.000/ekor, ikan Rp15.000/ekor
- Pertanyaan: Berapa kombinasi ayam dan ikan yang bisa dibeli?

Ini adalah **Pertidaksamaan Linear Dua Variabel (PtLDV)**!

**Bentuk umum:**
**ax + by < c** (atau >, ≤, ≥)

Di mana:
- x dan y = variabel
- a, b, c = konstanta
- Tanda: <, >, ≤, ≥

---

### 📐 **Konsep Pertidaksamaan Linear Dua Variabel**

**Perbedaan dengan Persamaan:**

| **Persamaan Garis** | **Pertidaksamaan Daerah** |
|---------------------|---------------------------|
| ax + by = c | ax + by < c (atau >, ≤, ≥) |
| Solusi: **garis** | Solusi: **daerah** |
| Contoh: 2x + 3y = 6 | Contoh: 2x + 3y ≤ 6 |

**Solusi PtLDV** adalah **himpunan semua titik (x, y)** yang memenuhi pertidaksamaan!

---

### 🎨 **Menggambar Daerah Penyelesaian Pertidaksamaan**

Ini adalah **SKILL KUNCI** yang WAJIB dikuasai untuk SNBT!

**Langkah-langkah:**

**1. Ubah pertidaksamaan jadi persamaan** (ganti tanda jadi =)
**2. Gambar garisnya** (pakai titik potong sumbu)
**3. Tentukan jenis garis:**
   - **Garis PUTUS-PUTUS** (---) untuk **<** dan **>**
   - **Garis UTUH** (━━━) untuk **≤** dan **≥**
**4. Tentukan daerah penyelesaian** (uji titik (0,0) kalau bisa)
**5. Arsir daerah yang memenuhi**

---

**Contoh 1: Bentuk Sederhana**

Gambar daerah penyelesaian **2x + y ≤ 6**!

**Langkah 1:** Ubah jadi persamaan
2x + y = 6

**Langkah 2:** Gambar garis (cari titik potong sumbu)

Titik potong sumbu x (y = 0):
2x = 6 → **x = 3** → titik (3, 0)

Titik potong sumbu y (x = 0):
y = 6 → titik (0, 6)

**Langkah 3:** Jenis garis
Tanda **≤** → garis **UTUH** (━━━)

**Langkah 4:** Uji titik (0, 0)
2(0) + 0 ≤ 6
0 ≤ 6 ✓ **BENAR!**

Berarti daerah yang memuat (0, 0) adalah penyelesaian!

**Langkah 5:** Arsir

```
      y
      |
    6 ●━━━━━━━━━
      |▓▓▓▓▓▓▓╱
      |▓▓▓▓▓╱
      |▓▓▓╱
      |▓╱_________●─ x
      0           3
```

Daerah yang **diarsir** (▓) adalah penyelesaian!

---

**Contoh 2: Tanda Kebalikan**

Gambar daerah penyelesaian **x + 2y > 4**!

**Langkah 1:** Ubah jadi persamaan
x + 2y = 4

**Langkah 2:** Gambar garis

Titik potong sumbu x (y = 0):
x = 4 → (4, 0)

Titik potong sumbu y (x = 0):
2y = 4 → y = 2 → (0, 2)

**Langkah 3:** Jenis garis
Tanda **>** → garis **PUTUS-PUTUS** (---)

**Langkah 4:** Uji titik (0, 0)
0 + 2(0) > 4
0 > 4 ✗ **SALAH!**

Berarti daerah yang **TIDAK memuat** (0, 0) adalah penyelesaian!

**Langkah 5:** Arsir

```
      y
    ▓▓|
    ▓▓2 ●╱╱╱╱╱╱╱
    ▓▓|╱
    ▓▓╱
      |___________●── x
      0           4
```

Daerah di **atas garis** yang diarsir adalah penyelesaian!

---

### 🎯 **Cara Cepat Tentukan Daerah**

**Metode Uji Titik (0, 0):**

1. **Substitusi (0, 0)** ke pertidaksamaan
2. Kalau **BENAR** → daerah yang memuat (0, 0)
3. Kalau **SALAH** → daerah yang **TIDAK** memuat (0, 0)

**KECUALI:** Kalau garis **melewati (0, 0)**, pakai titik lain seperti (1, 0) atau (0, 1)!

---

**Cara Alternatif: Lihat Tanda**

Untuk bentuk **y ... (angka)**:

- **y < ...** → daerah **DI BAWAH** garis
- **y > ...** → daerah **DI ATAS** garis

**Contoh:**
- **y ≤ 2x + 3** → daerah **DI BAWAH** garis y = 2x + 3
- **y > -x + 5** → daerah **DI ATAS** garis y = -x + 5

---

### 📊 **Sistem Pertidaksamaan Linear Dua Variabel**

Ini adalah **level selanjutnya**—ada **LEBIH DARI SATU** pertidaksamaan!

**Konsep:** Daerah penyelesaian adalah **IRISAN** (daerah yang memenuhi **SEMUA** pertidaksamaan)!

---

**Contoh: Sistem 2 Pertidaksamaan**

Tentukan daerah himpunan penyelesaian dari:

x + y ≤ 6  
x - y ≤ 2  
x ≥ 0  
y ≥ 0

**Langkah:**

**1. Gambar setiap pertidaksamaan:**

**Pertidaksamaan 1:** x + y ≤ 6
- Garis: x + y = 6
- Titik potong: (6, 0) dan (0, 6)
- Garis utuh
- Uji (0, 0): 0 ≤ 6 ✓ → daerah memuat (0, 0)

**Pertidaksamaan 2:** x - y ≤ 2
- Garis: x - y = 2
- Titik potong: (2, 0) dan (0, -2)
- Garis utuh
- Uji (0, 0): 0 ≤ 2 ✓ → daerah memuat (0, 0)

**Pertidaksamaan 3:** x ≥ 0
- Garis: x = 0 (sumbu y)
- Daerah: **kanan** sumbu y

**Pertidaksamaan 4:** y ≥ 0
- Garis: y = 0 (sumbu x)
- Daerah: **atas** sumbu x

**2. Cari irisan (daerah yang memenuhi SEMUA):**

```
      y
      |
    6 ●━━━━━━━━
      |▓▓╱
      |▓╱
    2 |╱━━━━●
      |╱  ╱
      ●══════●──── x
      0  2   6
```

Daerah **▓** (yang dibatasi 4 garis) adalah penyelesaiannya!

**Titik pojok:** (0, 0), (2, 0), (6, 0), (4, 2), (0, 6)

*(Titik pojok ini PENTING banget untuk program linear!)*

---

### 🎯 **Tips & Trik SNBT**

**Tip #1: Garis Utuh vs Putus-Putus**

🎵 **Mantra:**
*"Ada SAMA (≤ atau ≥) garis UTUH, gak ada SAMA (< atau >) garis PUTUS!"* 🎵

---

**Tip #2: Uji Titik (0, 0) Dulu**

Kalau garis **TIDAK** melewati (0, 0), selalu pakai (0, 0) untuk uji!

**Paling cepat!**

---

**Tip #3: Sistem Pertidaksamaan = Cari Irisan**

Kalau ada beberapa pertidaksamaan:
1. Gambar **SEMUA** garisnya
2. Arsir **SETIAP** daerah dengan arah berbeda
3. Daerah yang **PALING BANYAK ARSIRAN** = jawabannya!

Atau pakai warna berbeda kalau pakai pensil warna!

---

**Tip #4: Titik Pojok = Penting!**

Titik pojok daerah penyelesaian sering ditanya di SNBT, terutama untuk **program linear**!

**Cara cari titik pojok:**
- Titik potong **dua garis**
- Titik potong **garis dengan sumbu**

---

### 🚨 **Jebakan Umum di SNBT**

**Jebakan #1: Salah Pilih Daerah**

❌ **SALAH:**
Uji (0, 0): 0 < 4 ✓ → tapi malah arsir daerah yang TIDAK memuat (0, 0)!

✅ **BENAR:**
Kalau uji (0, 0) BENAR, daerah yang memuat (0, 0) yang diarsir!

---

**Jebakan #2: Lupa Ganti Garis Putus-Putus**

❌ **SALAH:**
x + y **<** 6 pakai garis **utuh**

✅ **BENAR:**
Tanda **<** (tanpa =) → garis **PUTUS-PUTUS**!

---

**Jebakan #3: Sistem Pertidaksamaan, Cuma Gambar Satu**

❌ **SALAH:**
Cuma gambar pertidaksamaan pertama, lupakan yang lain!

✅ **BENAR:**
Gambar **SEMUA**, lalu cari **IRISAN**!

---

**Jebakan #4: x ≥ 0 dan y ≥ 0 Dilupakan**

Kalau ada syarat **x ≥ 0** dan **y ≥ 0**, berarti daerah penyelesaian **HANYA di kuadran I** (kanan atas)!

Jangan sampai daerah penyelesaianmu masuk kuadran lain!

---

### 🎪 **Aplikasi dalam Program Linear Sederhana**

Pertidaksamaan linear dua variabel adalah **fondasi** untuk **Program Linear**—materi yang sering banget keluar di SNBT!

**Contoh Aplikasi:**

"Seorang pedagang memiliki modal Rp200.000. Ia ingin membeli jeruk (Rp10.000/kg) dan apel (Rp15.000/kg). Tokonya hanya bisa menampung maksimal 15 kg buah. Buatlah model matematikanya!"

**Penyelesaian:**

Misalkan:
- x = kg jeruk
- y = kg apel

**Batasan:**

1. **Modal:** 10.000x + 15.000y ≤ 200.000
   Sederhanakan: **2x + 3y ≤ 40**

2. **Kapasitas:** x + y ≤ 15

3. **Non-negatif:** x ≥ 0, y ≥ 0

**Gambar daerah penyelesaiannya:**

```
      y
      |
   15 ●━━━━━━━
      |▓▓▓╱
      |▓▓╱
      |▓╱━━●
      |╱ ╱
      ●════●──── x
      0   15  20
```

Daerah **▓** adalah kombinasi jeruk dan apel yang memungkinkan!

---

### 💡 **Insight Khusus SNBT**

**1. Pertidaksamaan = Visual Thinking**

Beda dari materi aljabar lain, pertidaksamaan dua variabel **butuh visualisasi**!

Kalau kamu **gak bisa gambar**, kamu **gak bisa** jawab soalnya!

Jadi **LATIHAN GAMBAR** sampai lancar!

---

**2. Titik di Dalam Daerah = Solusi**

**SEMUA** titik di dalam daerah penyelesaian adalah **solusi** dari pertidaksamaan!

Jadi kalau ada **pilihan jawaban** berupa titik, **cek** apakah titik itu ada di dalam daerah!

---

**3. Program Linear Lanjutan**

Materi ini adalah **step 1** menuju program linear. Selanjutnya kamu akan belajar:
- Fungsi objektif (yang mau dimaksimalkan/diminimalkan)
- Metode titik pojok
- Metode garis selidik

Tapi **SEMUA dimulai** dari bisa gambar daerah penyelesaian!

---

### 🎓 **Kesimpulan: Mindset Juara SNBT**

Pertidaksamaan Linear Dua Variabel adalah **skill visual** yang harus dikuasai! Kamu harus:

1. ✅ Bisa **gambar garis** dengan cepat (titik potong sumbu)
2. ✅ Tahu **jenis garis** (utuh vs putus-putus)
3. ✅ Bisa **tentukan daerah** dengan uji titik
4. ✅ Bisa cari **irisan** dari beberapa pertidaksamaan
5. ✅ Bisa tentukan **titik pojok** daerah penyelesaian

**Checklist Mahir PtLDV:**
- ✅ **Garis utuh** untuk ≤ dan ≥
- ✅ **Garis putus-putus** untuk < dan >
- ✅ **Uji (0, 0)** untuk tentukan daerah
- ✅ **Irisan** untuk sistem pertidaksamaan
- ✅ **x ≥ 0, y ≥ 0** → kuadran I

---

## 🎉 **SELAMAT!** 🎉

Kamu sudah **MENGUASAI** seluruh **Topic 1.2: Persamaan Linear**! 

**Rekapitulasi Materi:**
✅ **1.2.1** - Persamaan Linear Satu Variabel (PLSV)
✅ **1.2.2** - Pertidaksamaan Linear Satu Variabel (PtLSV)  
✅ **1.2.3** - Sistem Persamaan Linear Dua Variabel (SPLDV)  
✅ **1.2.4** - Aplikasi SPLDV (5 tipe soal!)  
✅ **1.2.5** - Fungsi Linear dan Grafiknya  
✅ **1.2.6** - Persamaan Garis Lurus  
✅ **1.2.7** - Pertidaksamaan Linear Dua Variabel  

**Kamu sekarang punya:**
- 💪 **Skill aljabar** yang solid
- 📊 **Kemampuan visual** dengan grafik
- 🧠 **Analisis** soal cerita
- ⚡ **Kecepatan** menyelesaikan masalah

**Next Step:**
Lanjut ke **Topic 1.3: Persamaan Kuadrat**—di mana kamu akan ketemu parabola, diskriminan, dan rumus ABC! 🚀

**Keep fighting, SNBT warrior!** 💪🔥