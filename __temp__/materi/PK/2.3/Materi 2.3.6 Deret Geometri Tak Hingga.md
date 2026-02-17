# SECTION 2: Bilangan dan Aritmatika
## Topic 2.3: Barisan dan Deret

---


### **Materi 2.3.6: Deret Geometri Tak Hingga**

Nah, sekarang kita masuk ke wilayah yang **truly mind-blowing**: **Deret Geometri Tak Hingga**! Ini salah satu konsep paling filosofis dan keren dalam matematika. Bayangin lo menjumlahkan bilangan TANPA HENTI, tapi hasilnya... **BERHINGGA**! Sounds impossible? Let's dive in!

#### **Paradoks Zeno: Cerita Pembuka**

Jaman Yunani kuno, ada filsuf namanya Zeno yang bikin paradoks legendaris:

> "Untuk sampai dari titik A ke titik B, lo harus melewati setengah jarak dulu. Trus setengah dari sisa jaraknya. Trus setengah lagi. Dan terus begitu... Karena selalu ada setengah yang harus lo lewati, berarti lo NGGAK AKAN PERNAH sampai!"

Tapi kenyataannya? Lo bisa sampai dong!

**Matematika menjelaskannya:**
```
Jarak = 1/2 + 1/4 + 1/8 + 1/16 + ... (tak hingga suku)
```

Tapi hasilnya = **1** (satu satuan jarak)!

Ini adalah **deret geometri tak hingga yang konvergen**!

#### **Definisi Deret Geometri Tak Hingga**

Deret geometri tak hingga adalah deret geometri dengan **jumlah suku tidak terbatas** (n → ∞).

Bentuk umum:
```
S∞ = a + ar + ar² + ar³ + ar⁴ + ...
```

**Pertanyaan Penting:** Apakah jumlahnya punya nilai tertentu?

**Jawabannya:** TERGANTUNG NILAI r!

#### **Syarat Konvergen: The Golden Rule!**

Ini adalah syarat PALING PENTING yang lo wajib hapal:

**Deret geometri tak hingga KONVERGEN (punya jumlah tertentu) jika dan hanya jika:**

```
|r| < 1
```

atau

```
-1 < r < 1
```

**Artinya:**
- **Konvergen**: Jumlahnya mendekati nilai tertentu
- **Divergen**: Jumlahnya membesar tanpa batas (atau berosilasi)

**Kenapa?**

Kalau |r| < 1:
- rⁿ akan semakin kecil seiring n membesar
- Saat n → ∞, maka rⁿ → 0
- Jadi sukunya makin lama makin kecil mendekati nol

Kalau |r| ≥ 1:
- rⁿ tidak mendekati nol
- Sukunya tetap besar atau makin besar
- Jumlahnya tak terhingga!

#### **Rumus Deret Geometri Tak Hingga**

Untuk **|r| < 1**:

```
S∞ = a / (1 - r)
```

**Penurunan Rumus:**

Dari rumus deret geometri biasa:
```
Sₙ = a(1 - rⁿ) / (1 - r)
```

Saat n → ∞ dan |r| < 1, maka rⁿ → 0:
```
S∞ = lim(n→∞) a(1 - rⁿ) / (1 - r)
S∞ = a(1 - 0) / (1 - r)
S∞ = a / (1 - r)
```

**Simple tapi powerful!**

#### **Contoh Aplikasi Lengkap**

**Contoh 1: r Positif**

Hitung jumlah deret: 6 + 3 + 3/2 + 3/4 + ...

Analisis:
- a = 6
- r = 3/6 = 1/2
- |r| = 1/2 < 1 ✓ (konvergen!)

Penyelesaian:
```
S∞ = 6 / (1 - 1/2)
S∞ = 6 / (1/2)
S∞ = 12
```

Jadi meskipun lo jumlahin suku tak hingga, hasilnya cuma 12!

**Contoh 2: r Negatif**

Hitung jumlah deret: 8 - 4 + 2 - 1 + 1/2 - ...

Analisis:
- a = 8
- r = -4/8 = -1/2
- |r| = 1/2 < 1 ✓ (konvergen!)

Penyelesaian:
```
S∞ = 8 / (1 - (-1/2))
S∞ = 8 / (1 + 1/2)
S∞ = 8 / (3/2)
S∞ = 16/3
```

**Contoh 3: Divergen!**

Hitung jumlah deret: 2 + 6 + 18 + 54 + ...

Analisis:
- a = 2
- r = 6/2 = 3
- |r| = 3 > 1 ✗ (DIVERGEN!)

Penyelesaian:
**TIDAK BISA DIJUMLAHKAN!** Jumlahnya tak hingga!

#### **Mengubah Desimal Berulang ke Pecahan**

Ini salah satu aplikasi PALING KEREN dari deret geometri tak hingga!

**Contoh 1: 0,333...**

```
0,333... = 3/10 + 3/100 + 3/1000 + ...
```

Ini deret geometri dengan:
- a = 3/10
- r = 1/10

```
S∞ = (3/10) / (1 - 1/10)
S∞ = (3/10) / (9/10)
S∞ = 3/9
S∞ = 1/3
```

Jadi 0,333... = 1/3 ✓

**Contoh 2: 0,454545...**

```
0,454545... = 45/100 + 45/10000 + 45/1000000 + ...
```

Ini deret geometri dengan:
- a = 45/100
- r = 1/100

```
S∞ = (45/100) / (1 - 1/100)
S∞ = (45/100) / (99/100)
S∞ = 45/99
S∞ = 5/11
```

Jadi 0,454545... = 5/11 ✓

**Contoh 3: 2,727272...**

Pisahkan bagian bulat dan desimal:
```
2,727272... = 2 + 0,727272...
```

Untuk 0,727272...:
- a = 72/100
- r = 1/100

```
0,727272... = (72/100) / (99/100) = 72/99 = 8/11
```

Jadi:
```
2,727272... = 2 + 8/11 = 30/11
```

**Tips SNBT:** Kalau lihat desimal berulang, langsung suspect deret geometri tak hingga!

#### **Kasus-Kasus Khusus**

**Kasus 1: r = 0**

Barisan: a, 0, 0, 0, ...
```
S∞ = a + 0 + 0 + ... = a
```

Atau pakai rumus:
```
S∞ = a / (1 - 0) = a
```

**Kasus 2: r = 1/2**

Ini yang paling sering muncul!
```
S∞ = a / (1 - 1/2) = 2a
```

**Kasus 3: r = -1/2**

```
S∞ = a / (1 + 1/2) = 2a/3
```

**Kasus 4: r mendekati 1**

Misal r = 0,99:
```
S∞ = a / (1 - 0,99) = a / 0,01 = 100a
```

Jumlahnya jadi sangat besar!

#### **Aplikasi Suku-Suku Tengah**

Kadang soal SNBT nggak kasih tau a langsung, tapi kasih suku tengah!

**Rumus Penting:**

Kalau ada tiga suku berurutan dalam geometri: x, y, z
Maka: **y² = xz**

Jadi kalau lo tau suku ke-2 dan ke-4, lo bisa cari suku ke-3:
```
U₃ = √(U₂ × U₄)
```

**Contoh:**

Deret geometri tak hingga dengan U₂ = 12 dan U₄ = 3. Tentukan S∞!

Cari U₃:
```
U₃² = U₂ × U₄
U₃² = 12 × 3 = 36
U₃ = 6
```

Cari r:
```
r = U₃ / U₂ = 6/12 = 1/2
```

Cari a:
```
U₂ = ar
12 = a × 1/2
a = 24
```

Hitung S∞:
```
S∞ = 24 / (1 - 1/2) = 48
```

#### **Hubungan dengan Jumlah n Suku Pertama**

Ada hubungan menarik:

Untuk deret yang konvergen:
```
S∞ - Sₙ = sisa yang belum dijumlahkan
```

Dan:
```
S∞ - Sₙ = arⁿ / (1 - r)
```

**Aplikasi:**

Kalau lo diminta cari "jumlah suku-suku setelah suku ke-5":

```
Jumlah = S∞ - S₅
```

#### **Trik dan Tips SNBT**

**Tip #1: Cek Konvergen Dulu!**

Sebelum pakai rumus, SELALU cek |r| < 1!

Kalau nggak, lo akan dapat jawaban yang nggak masuk akal.

**Tip #2: Desimal Berulang = Geometri Tak Hingga**

Setiap desimal berulang pasti bisa diubah ke pecahan pakai konsep ini!

**Tip #3: Perhatikan Tanda**

- r = -1/3 → |r| = 1/3 < 1 ✓
- r = -2 → |r| = 2 > 1 ✗

Yang penting nilai mutlaknya!

**Tip #4: Shortcut r = 1/2**

Kalau r = 1/2:
```
S∞ = 2a
```

Inget aja: **"setengah jadi dua kali"!**

**Tip #5: Estimasi Cepat**

Kalau r kecil (misal 0,1):
```
S∞ ≈ a × 1,11...
```

Karena 1/(1-0,1) = 1,11...

#### **Jebakan SNBT**

**Jebakan #1: Lupa Cek Konvergen**

Soal kasih r = 2, trus minta S∞.

Jangan langsung pakai rumus! r = 2 > 1, jadi DIVERGEN!

Jawaban yang benar: "Tidak bisa dihitung" atau "Tak hingga"

**Jebakan #2: Salah Identifikasi r**

Deret: 1 - 1/2 + 1/4 - 1/8 + ...

Rasionya BUKAN 1/2, tapi **-1/2**!

**Jebakan #3: Desimal Kompleks**

0,123123123...

Jangan mikir ini:
- a = 0,123
- r = 0,001

Tapi:
- a = 123/1000
- r = 1/1000

**Jebakan #4: Lupa 1 - r**

Yang salah: S∞ = a / r
Yang bener: S∞ = a / (1 - r)

#### **Aplikasi Real Life**

**1. Obat dalam Tubuh**

Minum obat 100mg setiap hari. 50% termetabolisme per hari.

Hari 1: 100mg
Hari 2: 50mg (sisa) + 100mg (baru) = 150mg
Hari 3: 75mg + 100mg = 175mg
...

Konsentrasi maksimum dalam tubuh (saat equilibrium)?

→ Deret geometri tak hingga!
- a = 100
- r = 0,5

```
S∞ = 100 / (1 - 0,5) = 200mg
```

**2. Pantulan Bola**

Bola dijatuhkan dari 10m, memantul 80% tinggi sebelumnya.

Total jarak yang ditempuh bola:
- Turun: 10m
- Naik-turun pertama: 2 × 8m
- Naik-turun kedua: 2 × 6,4m
- ...

```
Total = 10 + 2(8 + 6,4 + 5,12 + ...)
Total = 10 + 2 × S∞
```

Di mana S∞ dari deret 8, 6,4, 5,12, ... dengan a = 8, r = 0,8

```
S∞ = 8 / (1 - 0,8) = 40
Total = 10 + 2(40) = 90m
```

**3. Fractal dan Self-Similarity**

Koch Snowflake, Sierpinski Triangle, dll menggunakan konsep deret geometri tak hingga!

**4. Investasi dengan Penarikan Berkala**

Modal Rp 10 juta, bunga 10% per tahun, tarik Rp 500rb per tahun.

Berapa lama modalnya habis?

→ Melibatkan deret geometri!

#### **Mind-Blowing Facts**

1. **0,999... = 1**

```
0,999... = 9/10 + 9/100 + 9/1000 + ...
= (9/10) / (1 - 1/10)
= (9/10) / (9/10)
= 1
```

Ini bukan "hampir 1" tapi **EXACTLY 1**!

2. **Zeno's Paradox Solved**

```
1/2 + 1/4 + 1/8 + ... = (1/2) / (1 - 1/2) = 1
```

Lo memang bisa sampai tujuan!

3. **Infinite Series dalam Pi**

Beberapa rumus π melibatkan deret tak hingga:
```
π/4 = 1 - 1/3 + 1/5 - 1/7 + ...
```

#### **Challenge untuk Lo**

Coba buktikan bahwa jumlah deret berikut adalah 3:
```
1 + 1/2 + 1/4 + 1/8 + 1/16 + ...
```

**Hint:** a = 1, r = 1/2

Deret geometri tak hingga ini adalah salah satu konsep paling elegan dalam matematika. It shows how infinity can be tamed and calculated! Di SNBT, pemahaman solid tentang ini bisa jadi game-changer!

---
