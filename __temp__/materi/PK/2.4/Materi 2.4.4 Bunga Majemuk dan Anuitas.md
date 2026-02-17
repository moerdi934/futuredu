# SECTION 2: Bilangan dan Aritmatika
## Topic 2.4: Aritmatika Sosial

---


### **Materi 2.4.4: Bunga Majemuk dan Anuitas**

**The Power of Compound Interest - Einstein's 8th Wonder 🚀**

Albert Einstein pernah bilang, "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it." Nah, sekarang saatnya lo understand it! This is where your money doesn't just work—it MULTIPLIES! 🤑

---

**PART 1: BUNGA MAJEMUK - Money Making Babies 💰👶**

**Bedanya Sama Bunga Tunggal?**

Remember bunga tunggal? Bunga dihitung HANYA dari modal awal. Bunga majemuk? Game changer! Bunga dihitung dari modal + bunga sebelumnya. It's like... bunga beranak-pinak!

**Visual Understanding:**

**Bunga Tunggal:**
```
Tahun 0: Rp 1.000.000
Tahun 1: Rp 1.000.000 + (10% × 1.000.000) = Rp 1.100.000
Tahun 2: Rp 1.000.000 + (10% × 1.000.000) = Rp 1.200.000
Tahun 3: Rp 1.000.000 + (10% × 1.000.000) = Rp 1.300.000
```
Bunga selalu dari 1 juta!

**Bunga Majemuk:**
```
Tahun 0: Rp 1.000.000
Tahun 1: Rp 1.000.000 + (10% × 1.000.000) = Rp 1.100.000
Tahun 2: Rp 1.100.000 + (10% × 1.100.000) = Rp 1.210.000
Tahun 3: Rp 1.210.000 + (10% × 1.210.000) = Rp 1.331.000
```
Bunga dari jumlah tahun sebelumnya! That's 31 ribu extra!

---

**The Ultimate Formula:**

```
M = M₀ × (1 + i)ⁿ
```

**Keterangan:**
- M = Modal akhir (uang di masa depan)
- M₀ = Modal awal (uang sekarang)
- i = suku bunga per periode (dalam desimal, bukan persen!)
- n = jumlah periode

**Cara Bacanya:** "Modal awal dikali SESUATU yang dipangkatkan sejumlah periode"

**CRITICAL:** i harus dalam DESIMAL!
- 10% → 0,1 atau 0,10
- 5% → 0,05
- 12,5% → 0,125

---

**Contoh Aplikasi Step-by-Step:**

**Contoh 1: Basic Compound Interest**

Lo nabung Rp 5.000.000 dengan bunga majemuk 8% per tahun. Berapa uang lo setelah 3 tahun?

**Solusi:**
- M₀ = 5.000.000
- i = 8% = 0,08
- n = 3 tahun

M = 5.000.000 × (1 + 0,08)³  
M = 5.000.000 × (1,08)³  
M = 5.000.000 × 1,259712  
M = Rp 6.298.560

**Bandingkan dengan Bunga Tunggal:**
B = (5.000.000 × 8 × 3) / 100 = 1.200.000  
Total = 5.000.000 + 1.200.000 = Rp 6.200.000

**Selisih:** 6.298.560 - 6.200.000 = Rp 98.560

Dari bunga majemuk, lo dapet extra 98 ribu! That's the power of compounding! 💪

---

**The Reverse Problem - Finding Initial Capital:**

**Contoh 2: Berapa Modal Awal?**

Lo pengen punya Rp 10.000.000 dalam 4 tahun. Bunga majemuk 6% per tahun. Berapa harus nabung sekarang?

**Solusi:**
```
M = M₀ × (1 + i)ⁿ
10.000.000 = M₀ × (1,06)⁴
10.000.000 = M₀ × 1,262477
M₀ = 10.000.000 / 1,262477
M₀ = Rp 7.920.937
```

Lo harus nabung sekitar Rp 7,92 juta sekarang!

---

**Compound Interest with Different Compounding Periods:**

**PENTING BANGET:** Bunga bisa dihitung per tahun, per semester, per kuartal, per bulan!

**Rumus General:**
```
M = M₀ × (1 + i/m)^(m×n)
```

**Keterangan:**
- m = frekuensi penggabungan per tahun
  - Per tahun: m = 1
  - Per semester: m = 2
  - Per kuartal: m = 4
  - Per bulan: m = 12
- n = jumlah tahun

**Contoh 3: Monthly Compounding**

Nabung Rp 10 juta, bunga 12% per tahun dibunga-majemukkan per bulan selama 2 tahun.

**Solusi:**
- M₀ = 10.000.000
- i = 12% = 0,12 per tahun
- m = 12 (per bulan)
- n = 2 tahun

M = 10.000.000 × (1 + 0,12/12)^(12×2)  
M = 10.000.000 × (1 + 0,01)^24  
M = 10.000.000 × (1,01)^24  
M = 10.000.000 × 1,269735  
M = Rp 12.697.350

**INSIGHT:** Semakin sering bunga dihitung (monthly vs yearly), semakin besar uang lo! 📈

---

**JEBAKAN-JEBAKAN BUNGA MAJEMUK! ⚠️**

**Jebakan #1: Lupa Ubah Persen ke Desimal**

❌ M = 10.000.000 × (1 + 10)³ → Salah besar!  
✅ M = 10.000.000 × (1 + 0,1)³ → Benar!

**Jebakan #2: Salah Pangkat**

Bunga per semester, 3 tahun:
❌ n = 3 (salah, karena bunga per semester!)  
✅ n = 3 × 2 = 6 (benar!)

**Jebakan #3: Compound Frequency**

Bunga 12% per tahun, dibunga-majemukkan per bulan:
❌ i = 12% = 0,12 → (1,12)^n  
✅ i per bulan = 0,12/12 = 0,01 → (1,01)^(12n)

**Jebakan #4: Comparing Different Compounds**

Soal: "Which is better: 10% compounded yearly atau 9,5% compounded monthly?"  
→ Harus hitung keduanya! Nggak bisa langsung lihat!

---

**PART 2: ANUITAS - The Installment Game 🏠💳**

**Apa Itu Anuitas?**

Anuitas adalah sistem pembayaran cicilan di mana JUMLAH CICILAN TETAP setiap periode, tapi komposisi bunga dan angsuran pokok berubah-ubah.

**Real-World Example:** KPR rumah, kredit motor, kredit smartphone—semua pakai sistem anuitas!

**Karakteristik Anuitas:**
- Cicilan per bulan SAMA
- Bunga makin KECIL tiap bulan
- Angsuran pokok makin BESAR tiap bulan

**Visual Anuitas:**
```
Bulan 1: Cicilan = Bunga (besar) + Angsuran Pokok (kecil)
Bulan 2: Cicilan = Bunga (sedang) + Angsuran Pokok (sedang)
...
Bulan n: Cicilan = Bunga (kecil) + Angsuran Pokok (besar)
```

---

**Rumus Anuitas:**

```
A = M₀ × [i × (1+i)ⁿ] / [(1+i)ⁿ - 1]
```

**Keterangan:**
- A = Anuitas (cicilan per periode)
- M₀ = Pinjaman awal
- i = suku bunga per periode (desimal)
- n = jumlah periode

**ALTERNATIVELY:**
```
A = M₀ × i / [1 - (1+i)^(-n)]
```

Sama aja, cuma beda bentuk! Pilih yang lebih gampang buat lo!

---

**Breakdown Anuitas Per Periode:**

**Bulan ke-1:**
- Bunga₁ = i × M₀ (bunga dari sisa pinjaman)
- Angsuran Pokok₁ = A - Bunga₁
- Sisa Pinjaman₁ = M₀ - Angsuran Pokok₁

**Bulan ke-2:**
- Bunga₂ = i × Sisa Pinjaman₁
- Angsuran Pokok₂ = A - Bunga₂
- Sisa Pinjaman₂ = Sisa Pinjaman₁ - Angsuran Pokok₂

**Dan seterusnya...**

---

**Contoh Anuitas Lengkap:**

**Contoh 4: Kredit Motor**

Lo beli motor Rp 20.000.000 dengan DP Rp 5.000.000. Sisa dicicil 12 bulan, bunga 1% per bulan.

**Step 1: Hitung Pinjaman Awal**
M₀ = 20.000.000 - 5.000.000 = Rp 15.000.000

**Step 2: Hitung Anuitas**
- M₀ = 15.000.000
- i = 1% = 0,01
- n = 12

A = 15.000.000 × [0,01 × (1,01)¹²] / [(1,01)¹² - 1]

Hitung (1,01)¹²:  
(1,01)¹² ≈ 1,126825

A = 15.000.000 × [0,01 × 1,126825] / [1,126825 - 1]  
A = 15.000.000 × 0,01126825 / 0,126825  
A = 15.000.000 × 0,08885  
A ≈ Rp 1.332.750

**Jadi cicilan per bulan: Rp 1.332.750**

**Step 3: Breakdown Bulan Pertama**
- Bunga₁ = 1% × 15.000.000 = Rp 150.000
- Angsuran Pokok₁ = 1.332.750 - 150.000 = Rp 1.182.750
- Sisa Pinjaman₁ = 15.000.000 - 1.182.750 = Rp 13.817.250

**Bulan Kedua:**
- Bunga₂ = 1% × 13.817.250 = Rp 138.172,5
- Angsuran Pokok₂ = 1.332.750 - 138.172,5 = Rp 1.194.577,5
- Sisa Pinjaman₂ = 13.817.250 - 1.194.577,5 = Rp 12.622.672,5

**See the pattern?**
- Bunga turun: 150.000 → 138.172
- Angsuran pokok naik: 1.182.750 → 1.194.577

---

**Total Bayar vs Pinjaman Awal:**

Total yang lo bayar = A × n = 1.332.750 × 12 = Rp 15.993.000

Pinjaman awal = Rp 15.000.000

**Bunga total yang lo bayar = 15.993.000 - 15.000.000 = Rp 993.000**

That's the cost of borrowing money! 💸

---

**JEBAKAN ANUITAS! ⚠️**

**Jebakan #1: Mengira Anuitas = Angsuran Pokok**

NOPE! Anuitas = Bunga + Angsuran Pokok

Jadi kalau ditanya "Berapa angsuran pokok bulan ke-3?", lo harus kurangin bunga dulu!

**Jebakan #2: Bunga dari Pinjaman Awal**

Bunga tiap bulan dihitung dari SISA PINJAMAN, bukan pinjaman awal!

❌ Bunga bulan ke-5 = 1% × pinjaman awal  
✅ Bunga bulan ke-5 = 1% × sisa pinjaman bulan ke-4

**Jebakan #3: Lupa DP**

Soal: "Harga motor 20 juta, DP 5 juta, cicilan 12× dengan bunga 1%."  
Yang dicicil BUKAN 20 juta, tapi 15 juta!

**Jebakan #4: Periode Bunga**

Bunga 12% per tahun, cicilan per bulan:  
❌ i = 12% = 0,12  
✅ i = 12%/12 = 1% = 0,01

---

**Variasi Soal yang Sering Keluar:**

**Tipe 1: Cari Anuitas** (paling common)
Diberikan: pinjaman, bunga, periode → Hitung cicilan

**Tipe 2: Cari Bunga Periode Tertentu**
"Berapa bunga yang dibayar pada bulan ke-6?"
→ Harus breakdown dari bulan 1 sampai 5 dulu untuk tau sisa pinjaman bulan 5!

**Tipe 3: Cari Sisa Pinjaman**
"Setelah bayar 8× cicilan, berapa sisa pinjaman?"
→ Breakdown tiap bulan atau pakai rumus sisa pinjaman

**Tipe 4: Total Bunga**
"Berapa total bunga yang dibayar selama periode cicilan?"
→ Total Bayar - Pinjaman Awal

---

**Rumus Sisa Pinjaman Periode ke-k:**

```
Sisa Pinjamanₖ = M₀ × [(1+i)ⁿ - (1+i)ᵏ] / [(1+i)ⁿ - 1]
```

This is advanced! But super useful kalau nggak mau breakdown satu-satu!

---

**TIPS & TRIK MASTER LEVEL 🎯**

**Untuk Bunga Majemuk:**

1. **Calculator Hack:**
   - (1,08)³ di kalkulator: 1.08 × = = (press equal 2×)
   - Atau: 1.08 ^ 3

2. **Approximation:**
   - (1,1)³ ≈ 1,33
   - (1,05)⁴ ≈ 1,22
   - Useful untuk quick check!

3. **Doubling Time (Rule of 72):**
   - Berapa lama uang double? → 72 / (suku bunga %)
   - Bunga 6% → 72/6 = 12 tahun untuk double!

4. **Quick Comparison:**
   - 10% yearly vs 9% monthly?
   - Hitung equivalent annual rate dulu!

**Untuk Anuitas:**

1. **Shortcut Anuitas:**
   - Kalau (1+i)ⁿ udah dihitung, save! Bakal dipake 2x di rumus

2. **Check Logic:**
   - Anuitas > Pinjaman/n (karena ada bunga!)
   - Kalau lebih kecil, lo salah hitung!

3. **Bunga Turun, Angsuran Naik:**
   - Ini ALWAYS true!
   - Kalau nggak, lo salah breakdown

4. **Total Bayar:**
   - Total = Anuitas × periode
   - Harus lebih besar dari pinjaman awal!

---

**Real-World Applications & Wisdom 💡**

**Why Anuitas Over Regular Installment?**

**Regular (Non-Anuitas):**
- Angsuran pokok tetap: 1 juta/bulan
- Bunga dari sisa: menurun tiap bulan
- Total bayar per bulan: menurun (1,1 juta → 1 juta)

**Anuitas:**
- Total bayar tetap: 1,05 juta/bulan
- Bunga menurun, angsuran pokok naik
- Easier budgeting! You know exactly berapa bayar tiap bulan

**That's why banks LOVE anuitas** → lo bayar bunga lebih banyak di awal!

**Pro Tip for Life:**
- Kalau bisa, bayar cicilan lebih besar di awal → ngurangin bunga!
- Atau pilih tenor lebih pendek → total bunga lebih kecil!

---

**Mind-Blowing Facts:**

1. **Compound Interest Terkuat:** Benjamin Franklin nabung $1000 di tahun 1791 (200 tahun lalu) dengan compound interest. Sekarang jadi $6,5 JUTA! 🤯

2. **Credit Card Trap:** Interest CC bisa 3% per BULAN = 36% per tahun (compound)! That's why people say "CC is a trap!"

3. **KPR 20 Tahun:** Lo bayar hampir 2× lipat dari harga rumah! Bunga makan separuh!

4. **Inflation vs Interest:** Kalau bunga < inflasi, uang lo actually berkurang nilainya!

---

**Practice Mental Math:**

Quick! Berapa hasil ini?
1. (1,1)² = ?  → 1,21
2. (1,05)² = ?  → 1,1025
3. Modal 1 juta, bunga 10% per tahun, 2 tahun majemuk = ?  → 1,21 juta

---

**Key Takeaways:**

✅ Bunga Majemuk: M = M₀ × (1+i)ⁿ  
✅ i MUST be dalam desimal (10% = 0,1)  
✅ Compound frequency matters! (yearly vs monthly)  
✅ Anuitas = pembayaran tetap per periode  
✅ Anuitas = Bunga + Angsuran Pokok  
✅ Bunga menurun, angsuran pokok meningkat  
✅ Bunga dari SISA pinjaman, bukan pinjaman awal  
✅ Total bayar = Anuitas × periode  
✅ Rule of 72: doubling time ≈ 72/interest rate  
✅ Always check: hasil lo masuk akal?  

**ULTIMATE WISDOM:**

> "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it."  
> — Albert Einstein

Lo udah understand it now! Sekarang EARN IT! 💰🚀

---
