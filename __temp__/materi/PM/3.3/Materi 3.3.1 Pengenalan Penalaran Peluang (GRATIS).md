# SECTION 3: Statistika dan Probabilitas
## Topic 3.3: Peluang

---


## Materi 3.3.1: Pengenalan Penalaran Peluang *(GRATIS)*

### Masuk ke Dunia Ketidakpastian! 🎲

Selamat datang di salah satu topik paling seru dalam matematika—**Peluang**! Kalian pernah nggak sih bertanya-tanya: "Apa peluang hujan hari ini?" atau "Berapa kemungkinan gue lolos SNBT?" Nah, di sinilah kita belajar cara berpikir matematis tentang hal-hal yang belum pasti terjadi.

Berbeda dengan aljabar atau geometri yang biasanya punya jawaban pasti, peluang mengajak kita bermain dengan **kemungkinan**. Dan yang bikin seru, peluang ini **super aplikatif** dalam kehidupan nyata—dari prediksi cuaca, strategi game, sampai keputusan investasi!

### Kejadian: Pasti, Mustahil, atau Mungkin?

Sebelum masuk lebih dalam, kita perlu paham dulu bahwa ada tiga jenis kejadian:

**1. Kejadian Pasti**
Ini kejadian yang **100% terjadi**, tanpa keraguan sedikitpun.

*Contoh:*
- Matahari terbit dari timur besok pagi
- Kalau kamu lempar dadu, pasti keluar angka 1-6
- Air akan membeku di 0°C (pada tekanan normal)

Peluang kejadian pasti = **1** atau **100%**

**2. Kejadian Mustahil**
Kebalikannya, ini kejadian yang **0% terjadi**, alias nggak mungkin banget.

*Contoh:*
- Kamu lempar dadu, keluar angka 7
- Kamu ambil bola merah dari kotak yang isinya cuma bola biru
- Manusia terbang tanpa alat bantu (sayangnya!)

Peluang kejadian mustahil = **0** atau **0%**

**3. Kejadian Mungkin (Acak)**
Nah, ini yang paling menarik! Kejadian yang **bisa terjadi, bisa juga tidak**. Peluangnya ada di antara 0 dan 1.

*Contoh:*
- Kamu lempar koin, keluar gambar
- Besok hujan
- Kamu ketemu teman SMP di mal

Peluang kejadian mungkin = **antara 0 dan 1** (atau 0% sampai 100%)

### Dari Frekuensi ke Peluang: Belajar dari Pengalaman

Salah satu cara paling natural untuk memahami peluang adalah dengan melihat **apa yang sudah terjadi**. Ini disebut **pendekatan frekuensi relatif**.

Misalnya:
- Kamu lempar koin 100 kali, keluar gambar 47 kali → peluang gambar ≈ 47/100 = 0,47
- Dari 200 hari terakhir, 60 hari hujan → peluang hujan ≈ 60/200 = 0,3
- Dari 50 soal yang kamu kerjakan, 40 benar → peluang menjawab benar ≈ 40/50 = 0,8

**Prinsip penting:** Semakin banyak percobaan, semakin akurat estimasi peluangnya!

Kalau kamu cuma lempar koin 5 kali dan keluar 4 gambar, bukan berarti peluang gambar itu 4/5 = 0,8. Tapi kalau kamu lempar 1000 kali, hasilnya akan mendekati 0,5 (yang merupakan peluang sebenarnya).

### Membandingkan Peluang: Mana yang Lebih Mungkin?

Ini skill penting banget di SNBT! Kamu sering diminta membandingkan berbagai kejadian.

**Kata kunci yang sering muncul:**
- "Lebih mungkin terjadi"
- "Kemungkinan lebih besar"
- "Peluang terkecil"
- "Sama-sama mungkin"

*Contoh perbandingan:*

Mana yang lebih mungkin?
- A: Lempar dadu, keluar angka genap
- B: Lempar dadu, keluar angka prima
- C: Lempar dadu, keluar angka lebih dari 4

**Analisis:**
- A: angka genap = {2, 4, 6} → 3 kemungkinan
- B: angka prima = {2, 3, 5} → 3 kemungkinan
- C: lebih dari 4 = {5, 6} → 2 kemungkinan

Jadi A dan B **sama-sama mungkin**, dan keduanya **lebih mungkin** daripada C.

### Definisi Klasik Peluang: Rumus Dasar yang Wajib Hafal!

Sekarang kita masuk ke definisi formal. Untuk kejadian yang **semua kemungkinannya sama besar** (seperti lempar dadu, koin, ambil kartu), kita punya rumus:

$$P(\text{Kejadian}) = \frac{\text{Banyak hasil yang diinginkan}}{\text{Banyak semua hasil yang mungkin}}$$

Atau lebih singkatnya:

$$P(A) = \frac{n(A)}{n(S)}$$

Di mana:
- **P(A)** = peluang kejadian A
- **n(A)** = banyaknya hasil yang termasuk kejadian A
- **n(S)** = banyaknya semua hasil yang mungkin (ruang sampel)

**Contoh sederhana:**

Lempar sebuah dadu. Berapa peluang keluar angka ganjil?

- Angka ganjil = {1, 3, 5} → n(A) = 3
- Semua kemungkinan = {1, 2, 3, 4, 5, 6} → n(S) = 6
- P(ganjil) = 3/6 = 1/2 = 0,5

### Aksioma Peluang: Aturan Main yang Nggak Boleh Dilanggar!

Ada tiga aturan fundamental dalam peluang yang **selalu benar**:

**Aksioma 1: Peluang Selalu Non-Negatif**
$$P(A) \geq 0$$

Artinya, peluang nggak pernah negatif. Paling kecil ya 0 (mustahil).

**Aksioma 2: Peluang Kejadian Pasti = 1**
$$P(S) = 1$$

Total semua peluang dalam ruang sampel = 1 (atau 100%)

**Aksioma 3: Peluang Kejadian Saling Lepas Dijumlahkan**

Kalau dua kejadian **tidak bisa terjadi bersamaan** (saling lepas), peluang salah satunya terjadi adalah:
$$P(A \cup B) = P(A) + P(B)$$

*Contoh:*
Peluang dadu keluar angka 2 ATAU 5:
- P(2) = 1/6
- P(5) = 1/6
- P(2 atau 5) = 1/6 + 1/6 = 2/6 = 1/3

Dadu nggak bisa keluar 2 dan 5 sekaligus, jadi mereka saling lepas!

### Rentang Peluang: Always Between 0 and 1!

Ini **super penting** dan sering jadi jebakan di SNBT:

$$0 \leq P(A) \leq 1$$

Atau kalau pakai persen:
$$0\% \leq P(A) \leq 100\%$$

**JEBAKAN UMUM! ⚠️**

Kalau kamu dapet jawaban:
- P(A) = 1,2 → **SALAH!** (lebih dari 1)
- P(B) = -0,3 → **SALAH!** (negatif)
- P(C) = 150% → **SALAH!** (lebih dari 100%)

Kalau hasil perhitunganmu menghasilkan angka di luar 0-1, pasti ada yang salah! Cek lagi perhitunganmu.

### Interpretasi Peluang dalam Bahasa Sehari-hari

Biar lebih ngerti, ini cara "membaca" nilai peluang:

| Nilai Peluang | Persentase | Interpretasi |
|---------------|------------|--------------|
| 0 | 0% | Mustahil terjadi |
| 0,1 | 10% | Sangat jarang terjadi |
| 0,25 | 25% | Jarang terjadi |
| 0,5 | 50% | Fifty-fifty, sama mungkin |
| 0,75 | 75% | Sering terjadi |
| 0,9 | 90% | Hampir pasti terjadi |
| 1 | 100% | Pasti terjadi |

### Peluang vs Frekuensi: Jangan Tertukar!

**Frekuensi** = berapa kali kejadian **sudah terjadi** (data masa lalu)
**Peluang** = seberapa besar kejadian **akan terjadi** (prediksi)

*Contoh:*
Dalam 20 kali lempar koin, keluar 12 gambar.
- **Frekuensi** gambar = 12 kali
- **Frekuensi relatif** = 12/20 = 0,6
- **Peluang teoritis** gambar = 1/2 = 0,5

Frekuensi bisa berbeda dari peluang teoritis karena faktor kebetulan, tapi akan mendekati peluang sebenarnya kalau percobaannya banyak.

### Peluang Komplemen: Yang Nggak Terjadi

Kalau P(A) adalah peluang kejadian A terjadi, maka **peluang A tidak terjadi** adalah:

$$P(A^c) = 1 - P(A)$$

atau

$$P(\text{tidak } A) = 1 - P(A)$$

**Kenapa penting?**
Kadang lebih gampang menghitung "peluang TIDAK terjadi" daripada "peluang terjadi".

*Contoh:*
Peluang hujan besok = 0,3
Peluang TIDAK hujan = 1 - 0,3 = 0,7

### Tips Berpikir dalam Peluang

**1. Identifikasi dulu semua kemungkinan yang ada**
Buat list lengkap! Jangan sampai ada yang kelewat.

**2. Pastikan setiap kemungkinan sama besar**
Kalau tidak sama besar, rumus klasik P(A) = n(A)/n(S) TIDAK BERLAKU!

**3. Cek jawaban dengan logika**
Hasil peluang harus masuk akal. Kalau dapat 0,01 untuk kejadian yang harusnya sering terjadi, something's wrong!

**4. Gunakan komplemen untuk shortcut**
Kadang lebih mudah hitung P(tidak A) lalu kurangi dari 1.

### Bahasa Soal yang Sering Muncul di SNBT

Kenali kata-kata ini, karena mereka semua berarti hal yang sama:

**"Peluang", "Kemungkinan", "Probabilitas", "Kesempatan"** → Semua merujuk ke hal yang sama!

**"Atau"** → biasanya dijumlahkan (untuk kejadian saling lepas)
**"Dan"** → biasanya dikalikan (untuk kejadian bebas - akan dibahas nanti)

### Mental Model: Peluang itu Rasio!

Cara paling gampang mikir peluang:

> **Peluang = Seberapa sering kejadian itu terjadi dibanding semua kemungkinan**

Kayak kamu punya 100 kelereng dalam kotak:
- 30 merah
- 70 biru

Peluang ambil merah = 30/100 = 0,3

Simple, kan?

### Peluang dalam Kehidupan Nyata

Peluang bukan cuma teori! Ini dipake di mana-mana:

**1. Cuaca**
"Peluang hujan 70%" → dari 10 hari dengan kondisi serupa, biasanya 7 hari hujan

**2. Medis**
"Tingkat keberhasilan operasi 95%" → dari 100 operasi serupa, biasanya 95 berhasil

**3. Bisnis**
"Peluang proyek sukses 0,6" → ekspektasi keberhasilan untuk keputusan investasi

**4. Game**
"Drop rate item legendary 0,01" → dari 100 kali loot, rata-rata dapat 1 item legendary

**5. Asuransi**
Perusahaan asuransi menghitung peluang kecelakaan untuk tentukan premi

### Kesalahan Umum yang Harus Dihindari

**❌ SALAH: "Kalau peluang 50%, pasti terjadi 1 dari 2 kali"**
✅ BENAR: Peluang 50% artinya dalam jangka panjang, frekuensi relatifnya mendekati 50%

**❌ SALAH: "Kalau udah 5 kali gambar berturut-turut, berikutnya pasti angka"**
✅ BENAR: Setiap lemparan independen, tetap 50-50 (ini namanya gambler's fallacy)

**❌ SALAH: "Peluang bisa lebih dari 1 kalau sangat mungkin"**
✅ BENAR: Peluang maksimal adalah 1 (100%), tidak lebih!

**❌ SALAH: Mengabaikan kemungkinan yang sangat kecil**
✅ BENAR: Sekecil apapun peluangnya, kalau bisa terjadi, harus dihitung

### Strategi Menghadapi Soal Peluang di SNBT

**Step 1: Baca soal dengan SANGAT teliti**
Peluang itu detail! Satu kata bisa mengubah jawaban.

**Step 2: Identifikasi ruang sampel (S)**
Apa aja sih yang mungkin terjadi?

**Step 3: Identifikasi kejadian yang ditanya (A)**
Dari semua kemungkinan, mana yang masuk kriteria?

**Step 4: Hitung n(A) dan n(S)**
Jangan lupa satupun kemungkinan!

**Step 5: Terapkan rumus P(A) = n(A)/n(S)**

**Step 6: Cek logika jawaban**
Apakah masuk akal? Apakah antara 0 dan 1?

### Rangkuman: Yang Wajib Kamu Ingat!

1. **Peluang selalu antara 0 dan 1** (atau 0% sampai 100%)
2. **Peluang kejadian pasti = 1**, mustahil = 0
3. **P(A) = n(A)/n(S)** untuk kejadian dengan kemungkinan sama besar
4. **P(tidak A) = 1 - P(A)**
5. Peluang ≠ jaminan! Ini tentang kecenderungan jangka panjang
6. Total semua peluang dalam ruang sampel = 1
7. Semakin banyak percobaan, frekuensi relatif mendekati peluang teoritis

---

Nah, sekarang kamu udah punya fondasi kuat tentang peluang! Di materi selanjutnya, kita akan masuk ke perhitungan yang lebih seru dan menantang. Get ready! 🚀

---
