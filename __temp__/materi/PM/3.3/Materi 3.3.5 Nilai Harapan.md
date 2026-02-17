# SECTION 3: Statistika dan Probabilitas
## Topic 3.3: Peluang

---


## Materi 3.3.5: Nilai Harapan

### Ketika Peluang Bertemu Angka! 💰

Selamat datang di konsep yang sangat aplikatif: **Nilai Harapan** (Expected Value)!

Pernahkah kamu bertanya:
- "Kalau main game ini berulang kali, rata-rata dapet berapa poin?"
- "Investasi ini worth it nggak ya?"
- "Ikut undian ini untung atau rugi?"

Semua pertanyaan di atas bisa dijawab dengan konsep nilai harapan. Ini adalah jembatan antara **peluang** dan **nilai kuantitatif**.

### Konsep Dasar: Average in the Long Run

**Nilai harapan (Expected Value, E(X))** adalah rata-rata nilai yang kita **harapkan** kalau percobaan diulang **sangat banyak kali**.

Bukan berarti ini pasti yang akan kita dapat sekali percobaan, tapi ini adalah **rata-rata jangka panjang**.

**Analogi sederhana:**

Kamu lempar dadu fair. Berapa rata-rata nilai yang keluar kalau dilempar berkali-kali?

Intuisi: (1+2+3+4+5+6)/6 = 3,5

Itu adalah nilai harapannya!

### Rumus Nilai Harapan

Untuk variabel acak diskrit X yang bisa bernilai x₁, x₂, ..., xₙ dengan peluang P(x₁), P(x₂), ..., P(xₙ):

$$E(X) = \sum_{i=1}^{n} x_i \times P(x_i)$$

Atau lebih sederhana:

$$E(X) = x_1 \cdot P(x_1) + x_2 \cdot P(x_2) + ... + x_n \cdot P(x_n)$$

**Cara bacanya:**
Nilai Harapan = (nilai₁ × peluang₁) + (nilai₂ × peluang₂) + ...

### Contoh Dasar: Memahami Konsep

**Contoh 1: Lempar Dadu**

X = nilai yang keluar saat lempar dadu

| x | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| P(x) | 1/6 | 1/6 | 1/6 | 1/6 | 1/6 | 1/6 |

E(X) = 1×(1/6) + 2×(1/6) + 3×(1/6) + 4×(1/6) + 5×(1/6) + 6×(1/6)
= (1+2+3+4+5+6)/6
= 21/6
= **3,5**

Interpretasi: Kalau kamu lempar dadu 1000 kali, rata-rata nilainya akan mendekati 3,5.

**Contoh 2: Lempar Koin dengan Hadiah**

Game: Lempar koin
- Kalau Gambar (G): dapat Rp 10.000
- Kalau Angka (A): dapat Rp 0

Berapa nilai harapan hadiah?

E(X) = 10.000×(1/2) + 0×(1/2)
= 5.000 + 0
= **Rp 5.000**

Artinya: Kalau main berulang kali, rata-rata dapat Rp 5.000 per permainan.

**Contoh 3: Undian Sederhana**

Undian dengan 100 tiket, harga tiket Rp 5.000:
- 1 hadiah utama: Rp 200.000
- 4 hadiah kedua: Rp 50.000 each
- 95 tidak dapat apa-apa

Berapa nilai harapan hadiah?

E(X) = 200.000×(1/100) + 50.000×(4/100) + 0×(95/100)
= 2.000 + 2.000 + 0
= **Rp 4.000**

Nilai harapan (Rp 4.000) < Harga tiket (Rp 5.000)
→ Dalam jangka panjang, **RUGI** Rp 1.000 per tiket!

Ini kenapa undian/lottery biasanya untung buat penyelenggara, bukan pembeli tiket.

### Keuntungan yang Diharapkan (Expected Gain/Loss)

Untuk game atau investasi:

$$\text{Expected Gain} = E(X) - \text{Cost}$$

**Fair game** kalau Expected Gain = 0 (impas dalam jangka panjang)
**Favorable** kalau Expected Gain > 0 (untung dalam jangka panjang)
**Unfavorable** kalau Expected Gain < 0 (rugi dalam jangka panjang)

**Contoh:**

Game: Bayar Rp 20.000. Lempar 2 koin.
- Kedua Gambar: dapat Rp 100.000
- Satu Gambar: dapat Rp 20.000
- Tidak ada Gambar: dapat Rp 0

Worthit atau tidak?

**Solusi:**

Peluang:
- GG: P = 1/4
- 1G (GA atau AG): P = 2/4
- AA: P = 1/4

E(hadiah) = 100.000×(1/4) + 20.000×(2/4) + 0×(1/4)
= 25.000 + 10.000 + 0
= Rp 35.000

Expected Gain = 35.000 - 20.000 = **Rp 15.000**

Karena positif, **FAVORABLE!** Dalam jangka panjang untung Rp 15.000 per permainan.

### Strategi dalam Keputusan

Nilai harapan membantu kita membuat keputusan rasional:

**Pilih opsi dengan E(X) terbesar!**

**Contoh Keputusan:**

Kamu bisa pilih salah satu dari 2 game:

**Game A:**
- Bayar Rp 10.000
- Lempar 1 dadu
  - Keluar 6: dapat Rp 50.000
  - Selain 6: dapat Rp 0

**Game B:**
- Bayar Rp 10.000
- Lempar 1 koin
  - Gambar: dapat Rp 25.000
  - Angka: dapat Rp 0

Mana yang lebih baik?

**Analisis Game A:**
E(hadiah) = 50.000×(1/6) + 0×(5/6) = 8.333,33
Expected Gain A = 8.333,33 - 10.000 = **-Rp 1.666,67**

**Analisis Game B:**
E(hadiah) = 25.000×(1/2) + 0×(1/2) = 12.500
Expected Gain B = 12.500 - 10.000 = **+Rp 2.500**

**Pilih Game B!** Expected gain lebih besar (bahkan positif!).

### Sifat-Sifat Nilai Harapan

**1. Linearitas (sangat berguna!):**

$$E(aX + b) = aE(X) + b$$

Di mana a dan b adalah konstanta.

*Contoh:*
Kalau E(X) = 10, maka:
- E(2X) = 2×10 = 20
- E(X + 5) = 10 + 5 = 15
- E(3X - 7) = 3×10 - 7 = 23

**2. Penjumlahan untuk variabel independen:**

$$E(X + Y) = E(X) + E(Y)$$

Bahkan kalau X dan Y tidak independen!

*Contoh:*
Lempar 2 dadu, X₁ dan X₂.
E(X₁) = E(X₂) = 3,5
E(total) = E(X₁ + X₂) = 3,5 + 3,5 = 7

**3. Nilai harapan konstanta:**

$$E(c) = c$$

Kalau X selalu = 5, maka E(X) = 5.

### Variansi: Seberapa "Spread" Datanya?

Selain nilai harapan, kita juga tertarik: **seberapa bervariasi hasilnya?**

**Variansi (Var(X) atau σ²)** mengukur seberapa jauh nilai-nilai menyebar dari nilai harapannya.

$$\text{Var}(X) = E[(X - E(X))^2]$$

Atau rumus komputasi yang lebih mudah:

$$\text{Var}(X) = E(X^2) - [E(X)]^2$$

**Standar Deviasi (σ):**

$$\sigma = \sqrt{\text{Var}(X)}$$

**Interpretasi:**
- Variansi/SD kecil → hasil cenderung konsisten, dekat dengan E(X)
- Variansi/SD besar → hasil sangat bervariasi, unpredictable

**Contoh:**

**Game A:** Pasti dapat Rp 10.000
**Game B:** 50% dapat Rp 0, 50% dapat Rp 20.000

Keduanya punya E(X) = Rp 10.000, tapi:
- Var(A) = 0 (pasti, tidak ada variasi)
- Var(B) > 0 (ada risiko!)

Mana yang dipilih tergantung preferensi risiko!

### Distribusi Peluang Diskrit

Nilai harapan dan variansi adalah parameter dari **distribusi peluang**.

**Distribusi peluang** adalah tabel/fungsi yang menunjukkan:
- Semua nilai yang mungkin (x)
- Peluang setiap nilai (P(x))

**Syarat distribusi peluang valid:**
1. 0 ≤ P(x) ≤ 1 untuk setiap x
2. ΣP(x) = 1 (total peluang = 1)

**Contoh Distribusi:**

| X (jumlah Gambar dari 2 koin) | 0 | 1 | 2 |
|-------------------------------|---|---|---|
| P(X) | 1/4 | 2/4 | 1/4 |

Cek: 1/4 + 2/4 + 1/4 = 1 ✓

E(X) = 0×(1/4) + 1×(2/4) + 2×(1/4) = 0 + 0,5 + 0,5 = **1**

### Aplikasi dalam Keputusan Bisnis/Investasi

**Contoh Realistic:**

Kamu invest Rp 100 juta di startup. Ada 3 skenario:

| Scenario | Probability | Return |
|----------|-------------|---------|
| Sukses Besar | 0,1 | Rp 1 Miliar |
| Sukses Kecil | 0,3 | Rp 200 Juta |
| Gagal | 0,6 | Rp 0 |

Apakah investasi ini worthit?

E(return) = 1.000.000.000×0,1 + 200.000.000×0,3 + 0×0,6
= 100.000.000 + 60.000.000 + 0
= Rp 160 juta

Expected Gain = 160 juta - 100 juta = **+Rp 60 juta**

Dari expected value, **worthit!** Tapi perlu pertimbangkan juga:
- Risiko (60% peluang total loss!)
- Toleransi risiko pribadi
- Opportunity cost (bisa invest di tempat lain?)

### Jebakan dalam Nilai Harapan! ⚠️

**JEBAKAN 1: Expected Value ≠ Most Likely Outcome**

Lempar dadu, E(X) = 3,5. Tapi 3,5 **TIDAK PERNAH** keluar!

❌ SALAH: "Nilai harapan 3,5, jadi pasti keluar 3 atau 4"
✅ BENAR: "Rata-rata jangka panjang adalah 3,5"

**JEBAKAN 2: Mengabaikan Variansi/Risiko**

Dua investasi dengan E(return) sama bisa punya risiko sangat beda!

**JEBAKAN 3: Lupa kurangi cost**

E(hadiah) ≠ E(gain)!
Expected Gain = E(hadiah) - Cost

**JEBAKAN 4: Salah hitung P(x)**

Pastikan semua peluang dijumlahkan = 1!

**JEBAKAN 5: Menggunakan E(X) untuk single trial**

E(X) berguna untuk **banyak trial**, bukan prediksi sekali percobaan!

### Tips Mengerjakan Soal Nilai Harapan

**Step 1: Identifikasi semua kemungkinan nilai X**
List lengkap: x₁, x₂, x₃, ...

**Step 2: Hitung peluang masing-masing**
P(x₁), P(x₂), P(x₃), ...

**Step 3: Buat tabel distribusi (kalau perlu)**

| X | x₁ | x₂ | x₃ | ... |
|---|----|----|----|----|
| P(X) | P₁ | P₂ | P₃ | ... |

**Step 4: Cek total peluang = 1**
Σ P(x) = 1?

**Step 5: Hitung E(X)**
E(X) = Σ x×P(x)

**Step 6: Kalau ada cost, hitung expected gain**
Expected Gain = E(X) - Cost

**Step 7: Interpretasi**
Positive gain → favorable
Negative gain → unfavorable
Zero gain → fair

### Kata Kunci dalam Soal

**"Rata-rata hasil jangka panjang"** → E(X)
**"Dalam jangka panjang, untung atau rugi?"** → Expected Gain
**"Berapa seharusnya harga tiket agar fair?"** → Set Expected Gain = 0
**"Game mana yang lebih menguntungkan?"** → Bandingkan E(X)

### Pattern Soal SNBT

**Pattern 1: Game dengan pembayaran**
Hitung E(hadiah), kurangi cost → apakah favorable?

**Pattern 2: Membandingkan opsi**
Hitung E(X) untuk tiap opsi, pilih yang terbesar

**Pattern 3: Menentukan harga fair**
Set E(gain) = 0, cari harga tiket/biaya

**Pattern 4: Investasi/bisnis**
Weighted average berdasarkan skenario dan peluangnya

### Contoh Soal Tipe SNBT

**Soal:**

Sebuah perusahaan asuransi menawarkan polis mobil seharga Rp 5 juta per tahun. Dari data historis:
- 2% nasabah klaim Rp 100 juta (kecelakaan parah)
- 5% nasabah klaim Rp 30 juta (kecelakaan ringan)
- 93% nasabah tidak klaim

Berapa expected profit perusahaan per polis?

**Solusi:**

E(klaim) = 100.000.000×0,02 + 30.000.000×0,05 + 0×0,93
= 2.000.000 + 1.500.000 + 0
= Rp 3.500.000

Expected Profit = Premi - E(klaim)
= 5.000.000 - 3.500.000
= **Rp 1.500.000**

Jadi perusahaan expect profit Rp 1,5 juta per polis dalam jangka panjang.

### Quick Reference: Rumus Penting

**Nilai Harapan:**
$$E(X) = \sum x_i \cdot P(x_i)$$

**Expected Gain:**
$$E(\text{Gain}) = E(X) - \text{Cost}$$

**Variansi:**
$$\text{Var}(X) = E(X^2) - [E(X)]^2$$

**Linearitas:**
$$E(aX + b) = aE(X) + b$$

**Penjumlahan:**
$$E(X + Y) = E(X) + E(Y)$$

### Rangkuman: Must Remember!

1. **E(X) = rata-rata nilai jangka panjang**, bukan hasil sekali percobaan
2. **E(X) = Σ x×P(x)** - weighted average berdasarkan peluang
3. **Expected Gain = E(X) - Cost** - untuk keputusan untung/rugi
4. **Positive gain = favorable, negative = unfavorable, zero = fair**
5. **E(X) bisa bukan nilai yang mungkin keluar** (seperti 3,5 pada dadu)
6. **Variansi mengukur risiko/variabilitas** - sama pentingnya dengan E(X)
7. **Linearitas powerful** untuk simplifikasi perhitungan

---

Nilai harapan adalah konsep super praktis yang berguna banget di kehidupan nyata - dari investasi, asuransi, game, sampai keputusan sehari-hari. Master konsep ini dan kamu bisa bikin keputusan lebih rasional! 🎯

---
