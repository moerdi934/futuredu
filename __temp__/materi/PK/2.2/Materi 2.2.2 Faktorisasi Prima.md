# SECTION 2: Bilangan dan Aritmatika
## Topic 2.2: Bilangan Prima dan Faktorisasi

---


## **Materi 2.2.2: Faktorisasi Prima**

### **Apa Itu Faktorisasi Prima?**

Bayangin kamu punya LEGO set yang sudah jadi. Faktorisasi prima itu kayak kamu bongkar LEGO tersebut sampai ke **balok-balok dasarnya yang paling kecil dan nggak bisa dibongkar lagi**. Nah, balok-balok dasar itu adalah bilangan prima!

**Faktorisasi prima** adalah proses menguraikan suatu bilangan menjadi **perkalian bilangan-bilangan prima**.

**Contoh:**
- 12 = 2 × 2 × 3 = 2² × 3
- 30 = 2 × 3 × 5
- 100 = 2 × 2 × 5 × 5 = 2² × 5²

Setiap bilangan (kecuali 1) punya **faktorisasi prima yang unik**! Ini kayak sidik jari—tidak ada dua bilangan yang punya faktorisasi prima yang sama persis.

### **Konsep Faktor dan Kelipatan**

Sebelum lanjut, kita harus paham dulu bedanya faktor dan kelipatan:

#### **Faktor**
Faktor dari suatu bilangan adalah **bilangan-bilangan yang bisa membagi habis bilangan tersebut**.

**Contoh:** Faktor dari 12
- 12 bisa dibagi habis oleh: 1, 2, 3, 4, 6, 12
- Jadi faktor dari 12 adalah: {1, 2, 3, 4, 6, 12}

**Cara mencari faktor:**
Cari pasangan bilangan yang kalau dikalikan hasilnya bilangan tersebut.
- 12 = 1 × 12
- 12 = 2 × 6
- 12 = 3 × 4

#### **Kelipatan**
Kelipatan dari suatu bilangan adalah **hasil perkalian bilangan tersebut dengan bilangan asli**.

**Contoh:** Kelipatan dari 3
- 3 × 1 = 3
- 3 × 2 = 6
- 3 × 3 = 9
- 3 × 4 = 12
- Jadi kelipatan 3: {3, 6, 9, 12, 15, 18, ...}

**Bedanya Faktor vs Kelipatan:**
- **Faktor** → lebih kecil atau sama dengan bilangan aslinya
- **Kelipatan** → lebih besar atau sama dengan bilangan aslinya

### **Metode Pohon Faktor (Factor Tree)**

Ini metode paling visual dan mudah dipahami untuk faktorisasi prima. Kita "cabang-cabangkan" bilangan sampai semua ujung cabangnya adalah bilangan prima.

**Contoh 1: Faktorisasi 24**

```
         24
        /  \
       2    12
           /  \
          2    6
              / \
             2   3
```

Hasil: 24 = 2 × 2 × 2 × 3 = 2³ × 3

**Contoh 2: Faktorisasi 60**

```
         60
        /  \
       2    30
           /  \
          2    15
              /  \
             3    5
```

Hasil: 60 = 2 × 2 × 3 × 5 = 2² × 3 × 5

**Tips Pohon Faktor:**
1. Mulai dari faktor terkecil (biasanya 2)
2. Terus bagi sampai dapat bilangan prima
3. Cek setiap ujung cabang—pastikan semua prima!
4. Urutan cabang nggak penting, hasilnya tetep sama

**Jebakan SNBT:** Kadang soal kasih pohon faktor yang belum lengkap, terus kamu diminta melengkapi. Hati-hati, pastikan semua ujung adalah bilangan prima!

### **Metode Pembagian Berulang (Tabular Method)**

Metode ini lebih sistematis dan cepat untuk bilangan besar. Kita bagi terus bilangan tersebut dengan bilangan prima (mulai dari 2, 3, 5, 7, ...) sampai hasilnya 1.

**Format:**
```
bilangan prima | bilangan yang dibagi
-----------------------------------
               | hasil bagi
```

**Contoh: Faktorisasi 72**

```
2 | 72
2 | 36
2 | 18
3 | 9
3 | 3
  | 1
```

Hasil: 72 = 2 × 2 × 2 × 3 × 3 = 2³ × 3²

**Langkah-langkahnya:**
1. Bagi dengan 2 selama masih bisa
2. Kalau nggak bisa lagi, coba 3
3. Kalau nggak bisa, coba 5, 7, 11, ...
4. Stop kalau udah dapat 1

**Tips Cepat:**
- Bilangan genap? Langsung bagi 2 terus sampai ganjil
- Jumlah digit habis dibagi 3? Bagi dengan 3
- Berakhiran 0 atau 5? Bagi dengan 5

**Contoh Cepat: 120**
- 120 genap → bagi 2 → 60
- 60 genap → bagi 2 → 30
- 30 genap → bagi 2 → 15
- 15 berakhiran 5 → bagi 5 → 3
- 3 adalah prima → selesai!

Hasil: 120 = 2³ × 3 × 5

### **Menuliskan Hasil Faktorisasi Prima**

Ada beberapa cara menuliskan hasil faktorisasi prima:

**1. Bentuk Perkalian Biasa**
60 = 2 × 2 × 3 × 5

**2. Bentuk Pangkat (Paling Sering Dipakai)**
60 = 2² × 3 × 5

**3. Bentuk Eksponensial Lengkap** (jarang, tapi kadang muncul di soal)
60 = 2² × 3¹ × 5¹

**Tips SNBT:** Biasanya jawaban diminta dalam **bentuk pangkat**. Lebih ringkas dan gampang dibaca!

### **Cara Mencari Semua Faktor dari Faktorisasi Prima**

Nah ini yang seru! Setelah dapat faktorisasi prima, kita bisa dengan mudah cari **semua faktor** bilangan tersebut.

**Rumus Banyak Faktor:**
Kalau n = p₁^a × p₂^b × p₃^c, maka:
**Banyak faktor = (a+1)(b+1)(c+1)**

**Contoh: 36 = 2² × 3²**
Banyak faktor = (2+1)(2+1) = 3 × 3 = **9 faktor**

Faktor-faktornya: 1, 2, 3, 4, 6, 9, 12, 18, 36 ✓ (memang 9!)

**Cara Mencari Semua Faktor:**
Dari 36 = 2² × 3²

Ambil semua kombinasi:
- 2⁰ × 3⁰ = 1
- 2¹ × 3⁰ = 2
- 2² × 3⁰ = 4
- 2⁰ × 3¹ = 3
- 2¹ × 3¹ = 6
- 2² × 3¹ = 12
- 2⁰ × 3² = 9
- 2¹ × 3² = 18
- 2² × 3² = 36

**Tips Kilat:** Untuk cari faktor cepat, urutkan dari kombinasi pangkat terendah dulu!

### **Jebakan-Jebakan SNBT tentang Faktorisasi Prima**

#### **Jebakan #1: Lupa Menulis dalam Bentuk Pangkat**
Misal 72 = 2 × 2 × 2 × 3 × 3
Kalau soal minta "bentuk faktorisasi prima", jawabnya harus: **2³ × 3²**
Jangan cuma ditulis 2 × 2 × 2 × 3 × 3 (ini belum bentuk akhir yang rapi!)

#### **Jebakan #2: Bilangan 1 dalam Faktorisasi**
1 **BUKAN** bilangan prima, jadi **TIDAK BOLEH** muncul dalam faktorisasi prima!
Contoh SALAH: 12 = 1 × 2² × 3 ✗
Contoh BENAR: 12 = 2² × 3 ✓

#### **Jebakan #3: Lupa Mengecek Apakah Sudah Prima**
Misal faktorisasi 36:
36 = 4 × 9 → ini **BELUM SELESAI**!
Harus dilanjutkan: 36 = (2 × 2) × (3 × 3) = 2² × 3²

#### **Jebakan #4: Salah Hitung Banyak Faktor**
20 = 2² × 5¹
Banyak faktor = (2+1)(1+1) = 3 × 2 = **6**
Jangan lupa **+1** di setiap pangkat!

#### **Jebakan #5: Pohon Faktor Tidak Lengkap**
Kadang soal kasih pohon faktor yang salah atau belum lengkap. Selalu cek: **semua ujung cabang HARUS bilangan prima**!

### **Aplikasi Faktorisasi Prima**

Faktorisasi prima bukan cuma teori tok! Ini dasar untuk banyak hal:

**1. Menyederhanakan Pecahan**
Untuk sederhanakan 24/36:
- 24 = 2³ × 3
- 36 = 2² × 3²
- Coret faktor yang sama: 2²/2² dan 3/3
- Hasil: 2/3

**2. Mencari FPB dan KPK** (akan dibahas di materi selanjutnya)
Faktorisasi prima adalah cara TERCEPAT cari FPB dan KPK!

**3. Mengecek Bilangan Kuadrat Sempurna**
Bilangan kuadrat sempurna → semua pangkat dalam faktorisasi prima GENAP
- 36 = 2² × 3² → kuadrat sempurna ✓
- 72 = 2³ × 3² → bukan kuadrat sempurna ✗ (pangkat 3 ganjil)

**4. Kriptografi**
Faktorisasi bilangan yang sangat besar (ratusan digit) itu SUSAH BANGET dan butuh waktu lama. Ini yang bikin enkripsi internet aman!

### **Strategi Mengerjakan Soal SNBT**

**1. Pakai Metode Tercepat**
- Bilangan kecil (<100)? Pakai pohon faktor atau langsung hafal
- Bilangan besar? Pakai pembagian berulang

**2. Cek Keterbagian Dulu**
Sebelum coba-coba bagi:
- Genap? Bagi 2
- Jumlah digit kelipatan 3? Bagi 3  
- Akhiran 0 atau 5? Bagi 5

**3. Hati-hati dengan Pilihan Jawaban**
Kadang pilihan jawaban ada yang:
- Belum dipangkatkan
- Ada bilangan 1 di dalamnya
- Belum selesai difaktorkan

**4. Double Check!**
Kalikan kembali hasil faktorisasi—harus sama dengan bilangan awal!

---
