# SECTION 1: Aljabar - Pola Bilangan

## Topic 1.1: Pola Bilangan

---


## 📚 Materi 1.1.3: Pola Bilangan Geometri

### Naik Roket, Turun Batu! 🚀🪨

Kalau pola aritmatika itu ibarat **naik tangga** (naik/turun satu step tetep), pola geometri itu kayak **naik eskalator yang kecepatannya gandaㅡkali 2, kali 3, dst**!

Di pola geometri, yang konsisten bukan **selisih** (kayak aritmatika), tapi **rasio** (perbandingan). Dan ini bikin pola geometri bisa **naik drastis** atau **turun drastis** dalam waktu singkat!

**Fun Fact**: Pola geometri ini yang nge-govern pertumbuhan virus, bunga bank, likes Instagram yang viral, bahkan... zombie apocalypse! 🧟‍♂️ (serius, ada modelnya!)

---

### 🎯 Apa Itu Pola Bilangan Geometri?

**Pola Geometri** (atau **Barisan Geometri**) adalah barisan bilangan di mana **rasio** (perbandingan) antara dua suku berurutan **selalu sama**.

Rasio tetap ini dilambangkan dengan **r** (dari kata "ratio").

**Contoh Mudah:**
```
2, 6, 18, 54, 162, ...

6 ÷ 2 = 3
18 ÷ 6 = 3
54 ÷ 18 = 3
162 ÷ 54 = 3

Rasio (r) = 3 (konsisten!)
```

Karena rasionya tetap 3, ini adalah **barisan geometri dengan rasio 3**.

---

### 🔍 Ciri-Ciri Pola Geometri

Gimana cara ngenalin pola geometri kilat? Cek ciri-ciri ini:

#### ✅ **Ciri #1: Rasio Konsisten**
Bagi suku ke-n dengan suku ke-(n-1), hasilnya **selalu sama**.

#### ✅ **Ciri #2: Grafik Eksponensial**
Kalau di-plot, grafiknya berbentuk **kurva eksponensial** (melengkung naik/turun), bukan garis lurus seperti aritmatika.

#### ✅ **Ciri #3: Bisa Naik/Turun Ekstrem**
- Kalau r > 1 → **naik cepat** (eksplosi!)
- Kalau 0 < r < 1 → **turun cepat** (peluruhan)
- Kalau r < 0 → **bergantian +/- ** (oscillating)

**Contoh Rasio > 1:**
```
1, 3, 9, 27, 81, 243, ...
Rasio (r) = 3 → Naik pesat!
```

**Contoh Rasio antara 0 dan 1:**
```
64, 32, 16, 8, 4, 2, 1, ...
Rasio (r) = 1/2 → Turun drastis!
```

**Contoh Rasio Negatif:**
```
2, -6, 18, -54, 162, -486, ...
Rasio (r) = -3 → Bergantian tanda!
```

---

### 🧮 Rumus Suku ke-n: The Power Formula!

Ini dia rumus kunci pola geometri:

```
Uₙ = a × r^(n-1)
```

**Keterangan:**
- **Uₙ** = suku ke-n
- **a** = suku pertama (U₁)
- **r** = rasio (perbandingan antar suku)
- **n** = nomor urut suku

#### **Kenapa Ada Pangkat?**

Mari kita breakdown:

```
Barisan: a, ar, ar², ar³, ar⁴, ...

U₁ = a = a × r⁰
U₂ = ar = a × r¹ = a × r^(2-1)
U₃ = ar² = a × r²  = a × r^(3-1)
U₄ = ar³ = a × r³ = a × r^(4-1)
...
Uₙ = a × r^(n-1)
```

Jadi, untuk sampai ke suku ke-n, kita mulai dari **a**, terus **kalikan r sebanyak (n-1) kali**!

**Bandingkan dengan Aritmatika:**
- Aritmatika: **TAMBAH** b sebanyak (n-1) kali → Uₙ = a + (n-1)b
- Geometri: **KALI** r sebanyak (n-1) kali → Uₙ = a × r^(n-1)

---

### 📝 Contoh Penerapan Rumus

#### **Contoh 1: Mencari Suku Tertentu**

**Soal:**  
Diketahui barisan geometri: 2, 6, 18, 54, ...  
Tentukan suku ke-10!

**Penyelesaian:**
```
Diketahui:
a = 2 (suku pertama)
r = 6 ÷ 2 = 3
n = 10

Ditanya: U₁₀ = ?

Jawab:
U₁₀ = a × r^(n-1)
U₁₀ = 2 × 3^(10-1)
U₁₀ = 2 × 3⁹
U₁₀ = 2 × 19.683
U₁₀ = 39.366
```

**Jadi, suku ke-10 adalah 39.366.** (Lihat? Naik drastis!)

---

#### **Contoh 2: Mencari Rasio (r)**

**Soal:**  
Suku ke-2 adalah 12 dan suku ke-5 adalah 96.  
Tentukan rasio barisan tersebut!

**Penyelesaian:**
```
Diketahui:
U₂ = 12
U₅ = 96

Dari rumus:
U₂ = a × r¹ = ar = 12  ...(1)
U₅ = a × r⁴ = 96        ...(2)

Bagi (2) dengan (1):
(a × r⁴) / (a × r) = 96 / 12
r³ = 8
r = ∛8
r = 2
```

**Jadi, rasionya adalah 2.**

---

#### **Contoh 3: Mencari Suku Pertama (a)**

**Soal:**  
Diketahui U₄ = 54 dan rasio = 3.  
Tentukan suku pertama!

**Penyelesaian:**
```
Diketahui:
U₄ = 54
r = 3
n = 4

U₄ = a × r³
54 = a × 3³
54 = a × 27
a = 54 ÷ 27
a = 2
```

**Jadi, suku pertamanya adalah 2.**

---

### 🎯 Membedakan Aritmatika vs Geometri

Ini skill **super penting** di UTBK! Kadang soal nggak kasih tau jenis polanya, lo harus deteksi sendiri.

**Quick Check:**

| **Cek** | **Aritmatika** | **Geometri** |
|---------|----------------|--------------|
| Selisih antar suku | Sama semua | Beda-beda |
| Rasio antar suku | Beda-beda | Sama semua |
| Naik/turunnya | Linear (konstan) | Eksponensial (cepat) |
| Grafik | Garis lurus | Kurva lengkung |

**Contoh Soal Jebakan:**

```
2, 4, 8, 16, 32, ...
```

**Aritmatika atau Geometri?**

Cek selisih:
- 4 - 2 = 2
- 8 - 4 = 4
- 16 - 8 = 8
→ Beda! Bukan aritmatika ✗

Cek rasio:
- 4 ÷ 2 = 2
- 8 ÷ 4 = 2
- 16 ÷ 8 = 2
→ Sama! Ini geometri ✓

**Jawaban: Geometri dengan r = 2**

---

### 🚨 Tips & Trik UTBK untuk Geometri

#### **Tip #1: Jangan Lupa Kurung untuk Pangkat!**

Kalau r negatif atau pecahan, WAJIB pake kurung!

**SALAH:**  
Uₙ = 2 × -3^(n-1) ← Ini bakal ngitung 2 × -(3^(n-1))

**BENAR:**  
Uₙ = 2 × (-3)^(n-1) ✓

---

#### **Tip #2: Perhatikan Tanda Ganjil-Genap**

Kalau r negatif, suku ganjil dan genap punya tanda beda!

**Contoh:**  
a = 1, r = -2

```
U₁ = 1 × (-2)⁰ = 1 (positif)
U₂ = 1 × (-2)¹ = -2 (negatif)
U₃ = 1 × (-2)² = 4 (positif)
U₄ = 1 × (-2)³ = -8 (negatif)
```

**Pola:** Suku ganjil (+), suku genap (-)

---

#### **Tip #3: Shortcut Mencari r dari 3 Suku**

Kalau dikasih 3 suku berurutan x, y, z:

```
y² = x × z
```

Ini work karena geometri **simetris terhadap perkalian**!

**Contoh:**  
4, 8, 16

Cek: 8² = 4 × 16 → 64 = 64 ✓ → Geometri!

---

#### **Tip #4: Konversi ke Bentuk Pangkat**

Kadang soal ngasih barisan tapi nggak jelas. Coba konversi ke bentuk pangkat!

**Contoh:**  
1, 2, 4, 8, 16, 32, ...

Bisa ditulis:  
2⁰, 2¹, 2², 2³, 2⁴, 2⁵, ...

Berarti: Uₙ = 2^(n-1)

---

### 🎯 Jebakan UTBK pada Pola Geometri

#### **Jebakan #1: Pecahan Rumit**

**Soal:**  
1, 2/3, 4/9, 8/27, ...  
Tentukan suku ke-6!

**Penyelesaian:**
```
Rasio: (2/3) ÷ 1 = 2/3

U₆ = 1 × (2/3)^5
U₆ = (2/3)^5
U₆ = 32/243
```

**Trik:** Jangan dikalkulator dulu! Sederhanain dalam bentuk pecahan.

---

#### **Jebakan #2: Geometri Tersamar dalam Cerita**

**Soal:**  
Sebuah bakteri membelah diri menjadi 2 setiap jam. Awalnya ada 1 bakteri. Berapa bakteri setelah 10 jam?

**Penyelesaian:**  
Ini geometri!
```
a = 1
r = 2 (tiap jam jadi 2x)
n = 10 + 1 = 11 (karena hitung dari jam ke-0)

U₁₁ = 1 × 2¹⁰ = 1024 bakteri
```

**Catatan:** Hati-hati "setelah 10 jam" artinya jam ke-10, bukan suku ke-10!

---

#### **Jebakan #3: Campuran + dan ×**

**Soal:**  
2, 6, 18, 54, ...

**Salah:** "Kan 2 → 6 tambah 4, 6 → 18 tambah 12... bedanya naik!"  
**Benar:** "Rasionya 3 terus! Ini geometri, bukan aritmatika!"

Jangan sampai ketipu sama pola selisih yang juga punya pola. **Cek rasio dulu!**

---

#### **Jebakan #4: r = 1**

**Soal:**  
5, 5, 5, 5, 5, ...

Aritmatika atau Geometri?

**Jawaban: KEDUANYA!**
- Aritmatika dengan b = 0
- Geometri dengan r = 1

Di soal ujian, biasanya konteksnya akan nentuin lo harus jawab yang mana.

---

### 💡 Variasi Soal Geometri di UTBK

#### **Variasi #1: Mencari Posisi Suku (n)**

**Soal:**  
Barisan geometri 3, 9, 27, ...  
Bilangan 2187 adalah suku ke berapa?

**Penyelesaian:**
```
a = 3, r = 3
Uₙ = 2187

2187 = 3 × 3^(n-1)
2187 = 3^n
3⁷ = 3^n
n = 7
```

**Trik:** Konversi ke bentuk pangkat yang sama!

---

#### **Variasi #2: Sisipan Geometri**

**Soal:**  
Disisipkan 2 bilangan di antara 2 dan 54 sehingga membentuk barisan geometri. Tentukan rasio!

**Penyelesaian:**  
Barisan: 2, _, _, 54 (4 suku total)

```
a = 2
U₄ = 54

54 = 2 × r³
27 = r³
r = 3
```

Barisan lengkap: 2, 6, 18, 54

---

#### **Variasi #3: Suku Tengah Geometri**

**Soal:**  
Tiga bilangan membentuk barisan geometri.  
Suku pertama 4, suku ketiga 36.  
Tentukan suku tengah!

**Penyelesaian:**  
Gunakan rumus: **Utengah² = U₁ × U₃**

```
Utengah² = 4 × 36
Utengah² = 144
Utengah = ±12
```

Karena biasanya konteks bilangan positif, **Utengah = 12**.

---

### 🌟 Kesimpulan Materi 1.1.3

Pola Geometri adalah barisan dengan **rasio tetap**. Konsep kunci:

✅ **Rumus Suku ke-n**: Uₙ = a × r^(n-1)  
✅ **Rasio (r)** bisa > 1, antara 0-1, atau negatif  
✅ **Ciri khas**: Rasio antar suku **selalu sama**  
✅ **Naik/turun eksponensial** (bukan linear)  
✅ **Cek tanda** kalau r negatif (ganjil-genap berbeda)  

Next up: **Pola Bilangan Khusus** yang lebih seru lagi—mulai dari segitiga Pascal sampai bilangan persegi! 🔺🟦

---
