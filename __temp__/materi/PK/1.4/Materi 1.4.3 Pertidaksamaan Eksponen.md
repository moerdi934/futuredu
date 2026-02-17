# SECTION 1: Aljabar dan Persamaan
## Topic 1.4: Fungsi Eksponen dan Logaritma

---


## **Materi 1.4.3: Pertidaksamaan Eksponen**

### Level Up: From Equation to Inequality! ⚡

Kalau di persamaan eksponen kamu mencari nilai x yang **tepat**, di pertidaksamaan eksponen kamu mencari **rentang nilai** x yang memenuhi. Ini seperti beda antara "umurmu harus tepat 17 tahun" vs "umurmu minimal 17 tahun"—yang kedua punya lebih banyak kemungkinan, kan?

Pertidaksamaan eksponen ini actually lebih tricky daripada persamaan, karena ada **satu aturan emas yang sering bikin orang keliru**. Tapi tenang, setelah baca materi ini, kamu bakal paham banget!

---

### **The Golden Rule: Basis Menentukan Arah!**

Ini dia aturan yang PALING PENTING dan WAJIB kamu hafalin:

**Jika a > 1:**
- aᶠ⁽ˣ⁾ > aᵍ⁽ˣ⁾ → f(x) > g(x) (TANDA TETAP)
- aᶠ⁽ˣ⁾ < aᵍ⁽ˣ⁾ → f(x) < g(x) (TANDA TETAP)

**Jika 0 < a < 1:**
- aᶠ⁽ˣ⁾ > aᵍ⁽ˣ⁾ → f(x) < g(x) (TANDA BERBALIK! ⚠️)
- aᶠ⁽ˣ⁾ < aᵍ⁽ˣ⁾ → f(x) > g(x) (TANDA BERBALIK! ⚠️)

**Kenapa bisa berbalik?** Mari kita visualisasikan!

Bayangin kamu punya fungsi f(x) = 2ˣ (basis > 1):
- Saat x naik, nilai fungsi juga naik (monoton naik)
- Jadi kalau 2ᵃ > 2ᵇ, pasti a > b ✓

Sekarang bayangin f(x) = (½)ˣ (basis < 1):
- Saat x naik, nilai fungsi malah turun (monoton turun)
- Jadi kalau (½)ᵃ > (½)ᵇ, pasti a < b (BERBALIK!) ⚠️

Think about it:
- (½)¹ = 0,5
- (½)² = 0,25
- (½)³ = 0,125

Lihat? Makin besar pangkatnya, makin kecil nilainya! Makanya tanda berbalik.

---

### **Visualisasi Konsep**

**Untuk a > 1 (misalnya 2):**
```
Grafik y = 2ˣ naik ke kanan
    ↗
   ↗
  ↗
 ↗
───────→ x

Jika 2³ > 2¹, maka 3 > 1 ✓ (logis!)
```

**Untuk 0 < a < 1 (misalnya ½):**
```
Grafik y = (½)ˣ turun ke kanan
 ↘
  ↘
   ↘
    ↘
───────→ x

Jika (½)¹ > (½)³, maka 0.5 > 0.125 ✓
Tapi 1 < 3, bukan 1 > 3! (BERBALIK!)
```

---

### **Langkah-Langkah Menyelesaikan Pertidaksamaan Eksponen**

**STEP 1: Samakan Basis**
- Ubah semua ke basis yang sama
- Pilih basis terkecil untuk mempermudah

**STEP 2: Identifikasi Nilai Basis**
- Apakah a > 1? → tanda tetap
- Apakah 0 < a < 1? → tanda berbalik

**STEP 3: Samakan "Pangkat" dengan Aturan yang Benar**
- Sesuaikan arah pertidaksamaan berdasarkan basis

**STEP 4: Selesaikan Pertidaksamaan**
- Gunakan aljabar biasa

**STEP 5: Tulis Himpunan Penyelesaian**
- Bentuk interval atau notasi himpunan

---

### **Tipe 1: Pertidaksamaan Sederhana (Basis Sudah Sama)**

**Contoh Bacaan:**

**2^(x+1) > 2³**

Langkah 1: Basis sudah sama (2 = 2) ✓

Langkah 2: Cek basis: 2 > 1 → tanda TETAP

Langkah 3: Samakan pangkat (tanda tetap):
- x + 1 > 3

Langkah 4: Selesaikan:
- x > 2

**Himpunan penyelesaian: {x | x > 2} atau x ∈ (2, ∞)**

---

**Contoh Bacaan (Basis < 1):**

**(½)^(2x-1) ≤ (½)⁴**

Langkah 1: Basis sudah sama (½ = ½) ✓

Langkah 2: Cek basis: ½ < 1 (dan > 0) → tanda BERBALIK

Langkah 3: Samakan pangkat (tanda berbalik!):
- 2x - 1 ≥ 4 (tanda ≤ jadi ≥)

Langkah 4: Selesaikan:
- 2x ≥ 5
- x ≥ 2,5

**Himpunan penyelesaian: {x | x ≥ 2,5} atau x ∈ [2,5, ∞)**

**🎯 Jebakan SNBT:** Ini adalah jebakan PALING FAVORIT! Soal kayak gini bikin banyak siswa lupa berbalik tanda, terus salah deh.

---

### **Tipe 2: Basis Perlu Diubah Dulu**

**Contoh Bacaan:**

**4^(x-1) < 8^(x+2)**

Langkah 1: Ubah ke basis yang sama (basis 2):
- (2²)^(x-1) < (2³)^(x+2)
- 2^(2(x-1)) < 2^(3(x+2))
- 2^(2x-2) < 2^(3x+6)

Langkah 2: Cek basis: 2 > 1 → tanda TETAP

Langkah 3: Samakan pangkat:
- 2x - 2 < 3x + 6

Langkah 4: Selesaikan:
- 2x - 3x < 6 + 2
- -x < 8
- x > -8 (kalau kedua ruas dibagi negatif, tanda berbalik!)

**Himpunan penyelesaian: {x | x > -8} atau x ∈ (-8, ∞)**

---

**Contoh Bacaan (Basis Jadi < 1):**

**9^(x+1) ≥ 27^(2-x)**

Langkah 1: Ubah ke basis 3:
- (3²)^(x+1) ≥ (3³)^(2-x)
- 3^(2(x+1)) ≥ 3^(3(2-x))
- 3^(2x+2) ≥ 3^(6-3x)

Langkah 2: Cek basis: 3 > 1 → tanda TETAP

Langkah 3: Samakan pangkat:
- 2x + 2 ≥ 6 - 3x

Langkah 4: Selesaikan:
- 2x + 3x ≥ 6 - 2
- 5x ≥ 4
- x ≥ 4/5

**Himpunan penyelesaian: {x | x ≥ 4/5} atau x ∈ [4/5, ∞)**

---

### **Tipe 3: Pertidaksamaan dengan Substitusi**

Mirip seperti persamaan eksponen, kadang kamu perlu substitusi untuk bentuk yang lebih kompleks.

**Contoh Bacaan:**

**4ˣ - 3(2ˣ) + 2 > 0**

Langkah 1: Ubah 4ˣ = (2²)ˣ = (2ˣ)²

Langkah 2: Misalkan y = 2ˣ (ingat: y > 0 karena 2ˣ selalu positif!)

Pertidaksamaan jadi: **y² - 3y + 2 > 0**

Langkah 3: Faktorkan:
- (y - 2)(y - 1) > 0

Langkah 4: Tentukan tanda:
```
    -      +      -      +
────●──────●──────
    1      2
```

Dari diagram, (y-2)(y-1) > 0 saat:
- y < 1 atau y > 2

Langkah 5: Kembalikan ke 2ˣ:

**Kasus 1: y < 1**
- 2ˣ < 1
- 2ˣ < 2⁰
- x < 0 (tanda tetap karena basis 2 > 1)

**Kasus 2: y > 2**
- 2ˣ > 2
- 2ˣ > 2¹
- x > 1

**Himpunan penyelesaian: {x | x < 0 atau x > 1}**
**Atau: x ∈ (-∞, 0) ∪ (1, ∞)**

**🔥 Pro Tip:** Jangan lupa bahwa y = 2ˣ > 0! Jadi kalau hasil substitusi ngasih y ≤ 0, itu harus diabaikan!

---

### **Tipe 4: Pertidaksamaan Pecahan Eksponen**

Bentuknya: **aᶠ⁽ˣ⁾ / aᵍ⁽ˣ⁾ > k** atau sejenisnya

**Strategi:** Gunakan sifat aᵐ / aⁿ = aᵐ⁻ⁿ untuk menyederhanakan.

**Contoh Bacaan:**

**2^(x+1) / 2^(x-1) ≤ 8**

Langkah 1: Sederhanakan ruas kiri:
- 2^((x+1)-(x-1)) ≤ 8
- 2^(x+1-x+1) ≤ 8
- 2² ≤ 8
- 4 ≤ 8 ✓

Eh wait, ini ternyata pernyataan yang selalu benar!

**Himpunan penyelesaian: semua bilangan real, x ∈ ℝ**

Ini contoh di mana pertidaksamaan terpenuhi untuk semua nilai x.

---

**Contoh Lain:**

**3^(2x) / 3^x < 27**

Langkah 1: Sederhanakan:
- 3^(2x-x) < 27
- 3^x < 3³

Langkah 2: Basis 3 > 1 → tanda tetap

Langkah 3:
- x < 3

**Himpunan penyelesaian: x ∈ (-∞, 3)**

---

### **Tipe 5: Pertidaksamaan Bentuk (f(x))^g(x) > (f(x))^h(x)**

Ini adalah bentuk yang PALING TRICKY dan sering banget jadi jebakan!

Sama seperti persamaan, kamu harus **hati-hati dengan kasus-kasus khusus**.

**Aturan:**

1. **Jika f(x) > 1:** samakan pangkat, tanda tetap
2. **Jika 0 < f(x) < 1:** samakan pangkat, tanda BERBALIK
3. **Jika f(x) = 1:** pertidaksamaan selalu benar atau salah (check manual)
4. **Jika f(x) = 0:** check apakah pangkat positif

**Contoh Bacaan:**

**(x-1)^(x+2) > (x-1)^(2x-1)**

Ini kompleks karena basis-nya bukan konstanta, tapi (x-1).

**Kasus 1: x - 1 > 1** → x > 2
- Tanda tetap: x + 2 > 2x - 1
- 3 > x
- Gabung dengan syarat: 2 < x < 3

**Kasus 2: 0 < x - 1 < 1** → 1 < x < 2
- Tanda berbalik: x + 2 < 2x - 1
- 3 < x
- Gabung dengan syarat: mustahil! (3 < x bertentangan dengan x < 2)

**Kasus 3: x - 1 = 1** → x = 2
- Check: 1^(4) > 1^(3) → 1 > 1? Salah!
- x = 2 tidak memenuhi

**Kasus 4: x - 1 = 0** → x = 1
- Check: 0^(3) > 0^(1) → 0 > 0? Salah!
- x = 1 tidak memenuhi

**Himpunan penyelesaian: 2 < x < 3 atau x ∈ (2, 3)**

**🎯 Jebakan SNBT:** Banyak siswa langsung samakan pangkat tanpa check kasus-kasus ini, dan kehilangan poin!

---

### **Tips Menentukan Tanda pada Interval**

Saat kamu punya pertidaksamaan kuadrat atau pecahan setelah substitusi, kamu perlu menentukan tanda di tiap interval.

**Metode Garis Bilangan:**

Misalkan (y - 1)(y - 3) > 0

1. Cari pembuat nol: y = 1 dan y = 3
2. Gambar garis bilangan dan tandai titik-titik tersebut:
```
──────●────────●───────
      1        3
```

3. Test satu nilai di tiap interval:
   - y = 0 (kiri 1): (0-1)(0-3) = (-1)(-3) = 3 > 0 ✓
   - y = 2 (antara 1 dan 3): (2-1)(2-3) = (1)(-1) = -1 < 0 ✗
   - y = 4 (kanan 3): (4-1)(4-3) = (3)(1) = 3 > 0 ✓

4. Tandai interval yang memenuhi:
```
  +         -        +
──────●────────●───────
      1        3
```

5. Ambil yang positif: y < 1 atau y > 3

---

### **Strategi Khusus untuk SNBT**

**🔥 Trik 1: Identifikasi Basis Dengan Cepat**

Sebelum mulai ngerjain, tanya diri sendiri:
- "Berapa nilai basis-nya?"
- "Lebih dari 1 atau kurang dari 1?"
- "Tandanya bakal tetap atau berbalik?"

Ini akan save kamu dari kesalahan fatal!

**🔥 Trik 2: Hafalkan Pola Umum**

Beberapa bentuk sering muncul:
- 2ˣ → basis > 1, tanda tetap
- (½)ˣ → basis < 1, tanda berbalik
- 3ˣ → basis > 1, tanda tetap
- (⅓)ˣ → basis < 1, tanda berbalik

**🔥 Trik 3: Check Ujung-Ujung Interval**

Kalau dapat interval, check apakah ujung interval termasuk atau tidak:
- Tanda ≥ atau ≤ → ujung termasuk (pakai [ ])
- Tanda > atau < → ujung tidak termasuk (pakai ( ))

**🔥 Trik 4: Hati-Hati dengan Basis Variabel**

Kalau basis-nya mengandung x (seperti (x-2)ˣ), WAJIB check semua kasus:
- Basis > 1
- 0 < basis < 1
- Basis = 1
- Basis = 0
- Basis negatif (biasanya tidak diperbolehkan)

**🎯 Jebakan yang Sering Muncul:**

1. **Lupa Berbalik Tanda untuk Basis < 1**
   - Ini kesalahan #1 yang bikin siswa kehilangan poin!
   - ALWAYS check basis dulu!

2. **Salah Menentukan Interval**
   - Hati-hati dengan tanda ( ) vs [ ]
   - Kadang soal minta interval, kadang minta himpunan

3. **Lupa Syarat y > 0 Setelah Substitusi**
   - 2ˣ selalu positif, jadi y harus > 0
   - Kalau dapat y ≤ 0 dari substitusi, itu TIDAK VALID

4. **Keliru Menggabungkan Interval**
   - "dan" (∩) vs "atau" (∪)
   - Perhatikan kata kunci di soal!

5. **Terburu-buru Tanpa Check Kasus Khusus**
   - Basis = 0, 1, -1 sering dilupakan
   - Padahal ini bisa jadi solusi tambahan atau malah membatalkan solusi!

---

### **Perbandingan: Persamaan vs Pertidaksamaan**

| Aspek | Persamaan | Pertidaksamaan |
|-------|-----------|----------------|
| Solusi | Nilai spesifik (x = 2) | Interval (x > 2) |
| Basis > 1 | Samakan pangkat | Tanda tetap |
| Basis < 1 | Samakan pangkat | Tanda BERBALIK |
| Notasi jawaban | x = ... | x ∈ (...) |
| Kompleksitas | Lebih straightforward | Perlu hati-hati dengan tanda |

---

### **Aplikasi dalam Kehidupan Nyata**

Pertidaksamaan eksponen sering muncul dalam:

**1. Investasi dan Pertumbuhan Modal**
"Modal minimal berapa agar dalam 5 tahun mencapai target?"

Jika M₀(1 + r)⁵ ≥ Target, maka M₀ ≥ Target/(1+r)⁵

**2. Peluruhan Radioaktif**
"Kapan bahan radioaktif tinggal kurang dari 10%?"

Jika N₀(½)^(t/T) < 0,1N₀, maka cari t minimal

**3. Pertumbuhan Populasi**
"Dalam berapa tahun populasi melebihi batas maksimal?"

Jika P₀(1,05)ᵗ > P_max, maka cari t minimal

**4. Penurunan Nilai Aset**
"Kapan nilai mobil turun di bawah harga tertentu?"

Jika V₀(0,8)ᵗ < V_target, maka cari t minimal

---

### **Ringkasan Flow Chart**

```
Dapat Pertidaksamaan Eksponen
         ↓
Samakan Basis
         ↓
Identifikasi Nilai Basis
    ↙           ↘
a > 1         0 < a < 1
Tanda         Tanda
TETAP         BERBALIK
    ↓              ↓
Samakan      Samakan pangkat
pangkat      (balik tanda!)
    ↓              ↓
Selesaikan   Selesaikan
pertidaksamaan  pertidaksamaan
    ↓              ↓
Tulis interval  Tulis interval
    ↓              ↓
 DONE!          DONE!
```

---

### **Checklist Sebelum Jawab Soal**

✅ Basis sudah sama?
✅ Basis > 1 atau < 1?
✅ Tanda perlu berbalik atau tidak?
✅ Sudah check kasus basis = 0, 1, -1?
✅ Interval jawaban sudah benar (pakai ( ) atau [ ])?
✅ Kalau ada substitusi, sudah kembalikan ke bentuk awal?
✅ Sudah check syarat y > 0?

---

Nah, sekarang kamu udah master pertidaksamaan eksponen! Key takeaway:
1. **Basis > 1 → tanda TETAP**
2. **Basis < 1 → tanda BERBALIK** ⚠️
3. **ALWAYS check kasus khusus**

Di materi selanjutnya, kita akan masuk ke dunia **Logaritma**—yang merupakan "lawan" dari eksponen. Kalau eksponen itu pertanyaannya "berapa hasil dari 2³?", logaritma pertanyaannya "berapa pangkat yang bikin 2 jadi 8?". Excited? Let's go! 🚀

---
