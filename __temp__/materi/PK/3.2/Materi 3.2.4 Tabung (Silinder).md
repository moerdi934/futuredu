# SECTION 3: Geometri dan Pengukuran
## Topic 3.2: Geometri Ruang

---


## **Materi 3.2.4: Tabung (Silinder)**

### **Rolling into the Curved World! 🥫🌀**

Selamat datang di era bangun ruang yang "nge-curves"! Kalau sebelumnya kita main di zona sisi-sisi datar (kubus, balok, prisma, limas), sekarang kita upgrade ke bangun ruang dengan **sisi lengkung**.

Tabung adalah salah satu bangun ruang paling "friendly" di kehidupan sehari-hari. Kaleng susu, botol minum, drum, pipa, bahkan pensil—semuanya berbentuk tabung! Dan kabar baiknya, meski ada lengkungan, rumusnya tetap gampang kalau kamu paham konsepnya.

### **Apa Itu Tabung?**

**Definisi:**
Tabung (atau silinder) adalah bangun ruang yang memiliki:
- **Dua alas berbentuk lingkaran** yang kongruen (sama besar)
- **Selimut melengkung** yang menghubungkan kedua lingkaran
- **Tinggi** yang tegak lurus terhadap kedua alas

**Bayangkan begini:**
Ambil selembar kertas persegi panjang, terus gulung jadi bentuk tabung—ujung kanan ketemu ujung kiri, atas dan bawah ditutup dengan lingkaran. Boom! Jadi tabung!

### **Unsur-Unsur Tabung**

```
      ⟋‾‾‾‾‾‾‾⟍  ← Tutup atas (lingkaran r)
     |         |
     |         |  ← Selimut tabung (melengkung)
     |    t    |     tinggi = t
     |         |
     |         |
      ⟍_______⟋  ← Alas (lingkaran r)
         2r
```

**Komponen Utama:**
1. **Alas dan tutup:** Dua lingkaran identik dengan jari-jari **r**
2. **Selimut tabung:** Permukaan melengkung yang membungkus dari alas ke tutup
3. **Tinggi tabung (t):** Jarak tegak lurus antara alas dan tutup
4. **Diameter (d):** d = 2r
5. **Sumbu simetri:** Garis tegak melalui pusat alas dan tutup

**Fun Fact:**
Tabung punya **simetri putar tak hingga**—artinya kalau kamu putar berapa derajat pun, bentuknya tetap sama! Cool, right?

### **Rumus-Rumus Tabung: The Golden Formulas**

#### **1. Volume Tabung**

Ini adalah rumus TERPENTING dan paling sering dipakai!

**V = πr²t**

**Kenapa?**
- Volume = Luas alas × Tinggi
- Luas alas lingkaran = πr²
- Tinggi = t
- Jadi: V = πr² × t

**Alternatif dengan diameter:**
**V = ¼πd²t** (karena r = d/2, jadi r² = d²/4)

**Logika Mudah:**
Bayangin kamu numpuk banyak sekali keping lingkaran tipis-tipis dari alas sampai tutup. Total volume = luas satu keping × banyak keping (tinggi).

#### **2. Luas Permukaan Tabung**

Ada tiga bagian yang perlu dihitung:

**L = 2πr² + 2πrt**

atau bisa ditulis:

**L = 2πr(r + t)**

**Breakdown:**
- **2πr²:** Luas dua lingkaran (alas + tutup)
  - Satu lingkaran = πr²
  - Dua lingkaran = 2πr²

- **2πrt:** Luas selimut tabung
  - Kalau selimut "dibuka" jadi persegi panjang:
    - Panjang = keliling lingkaran = 2πr
    - Lebar = tinggi tabung = t
    - Luas = 2πr × t

**Visualisasi Selimut Terbuka:**
```
    2πr (keliling alas)
  ┌───────────────┐
  │               │ t (tinggi)
  │               │
  └───────────────┘
  = Persegi panjang!
```

#### **3. Luas Selimut Tabung Saja**

**L_selimut = 2πrt**

Ini dipakai kalau:
- Tabung tanpa tutup (seperti gelas)
- Tabung tanpa alas (jarang sih)
- Soal spesifik nanya luas selimut aja

#### **4. Luas Permukaan Tabung Tanpa Tutup**

**L = πr² + 2πrt**

atau

**L = πr(r + 2t)**

Ini untuk tabung terbuka di atas (seperti ember, gelas, panci).

### **Hubungan Tabung dengan Prisma**

**Mind-blowing fact:**
Tabung itu **prisma lingkaran**!

**Buktinya:**
- Prisma = punya 2 alas kongruen + sisi tegak → ✓ Tabung juga!
- Volume prisma = L_alas × t → ✓ V_tabung = πr²t
- Bedanya: Alas tabung lingkaran, alas prisma segi-n

Jadi rumus tabung itu **sama persis** dengan prisma, cuma alasnya aja yang beda bentuk!

### **Tips dan Trik Jitu untuk SNBT:**

#### **Trik #1: π = 22/7 atau 3,14?**

**Kapan pakai 22/7:**
- Kalau angka jari-jari atau diameter adalah **kelipatan 7** (7, 14, 21, 28, 35, ...)
- Kalau soal kasih petunjuk "gunakan π = 22/7"

**Kapan pakai 3,14:**
- Kalau angka jari-jari/diameter bukan kelipatan 7
- Kalau soal minta jawaban desimal

**Contoh:**
- r = 7 cm → pakai π = 22/7 (hasil lebih rapi)
- r = 5 cm → pakai π = 3,14

**Pro tips:** Kalau nggak ada petunjuk dan keduanya bisa, pakai 22/7 karena biasanya hasilnya lebih rapi (nggak ada koma-koma)!

#### **Trik #2: Dari Volume ke Jari-Jari (atau Sebaliknya)**

**Diketahui V dan t, cari r:**

V = πr²t
r² = V/(πt)
r = √(V/(πt))

**Diketahui V dan r, cari t:**

V = πr²t
t = V/(πr²)

**Trik Mental:**
Kalau π = 22/7:
- πr²t → (22/7) × r² × t
- Cari faktor 7 dulu buat nyederhanain!

#### **Trik #3: Tabung dalam Air/Kolam**

**Soal favorit SNBT:**
"Sebuah tabung dengan r = 7 cm dan t = 10 cm dimasukkan ke dalam balok berisi air. Tinggi air naik..."

**Rumus Sakti:**
Volume tabung = Volume kenaikan air
πr²t_tabung = p × l × Δh

**Δh = πr²t_tabung / (p × l)**

**Contoh:**
- Tabung: r = 7 cm, t = 10 cm
- Balok: 30 × 20 cm
- Δh = (22/7 × 49 × 10) / (30 × 20)
- Δh = 1540 / 600 ≈ 2,57 cm

#### **Trik #4: Perbandingan Dua Tabung**

**Jika jari-jari diperbesar k kali (tinggi tetap):**
- Volume → k² kali
- Luas permukaan → sekitar k² kali (tergantung proporsi r dan t)

**Jika tinggi diperbesar k kali (jari-jari tetap):**
- Volume → k kali
- Luas permukaan → bertambah (tapi bukan k kali!)

**Jika jari-jari DAN tinggi diperbesar k kali:**
- Volume → k³ kali (sama seperti kubus!)
- Luas permukaan → k² kali

**Contoh Soal Jebakan:**
"Jari-jari tabung diperbesar 2 kali, volumenya menjadi..."
- Volume jadi 2² = 4 kali ✓(bukan 2 kali!)

#### **Trik #5: Tabung Terisi Sebagian**

"Tabung dengan r = 10 cm dan t = 30 cm diisi air sampai ¾ tingginya. Volume air adalah..."

**Cara Kilat:**
V_air = V_total × ¾
V_air = πr²t × ¾
V_air = π × 100 × 30 × 0,75
V_air = 2250π cm³ ≈ 7065 cm³

### **Jebakan-Jebakan Maut di SNBT:**

#### **Jebakan #1: Diameter vs Jari-Jari**

**Soal:** "Tabung dengan diameter 14 cm dan tinggi 10 cm. Volumenya..."

**Jebakan:** Langsung pakai d = 14 di rumus V = πr²t → SALAH TOTAL!

**Yang benar:**
- r = d/2 = 14/2 = 7 cm
- V = π × 7² × 10 = 490π cm³

**Tips:** Selalu cek: soal kasih diameter atau jari-jari? Underline atau highlight biar nggak keliru!

#### **Jebakan #2: Luas Permukaan Tabung Terbuka**

**Soal:** "Sebuah gelas berbentuk tabung tanpa tutup dengan r = 7 cm dan t = 12 cm. Luas permukaannya..."

**Jebakan:** Pakai rumus L = 2πr(r + t) → SALAH! (Ada tutupnya padahal nggak)

**Yang benar:**
- Gelas = tabung tanpa tutup
- L = πr² + 2πrt (hanya 1 lingkaran untuk alas)
- L = π × 49 + 2π × 7 × 12
- L = 49π + 168π = 217π cm²

#### **Jebakan #3: Satuan Volume yang Berbeda**

**Soal:** "Tabung dengan r = 20 cm dan t = 50 cm. Volumenya... liter"

**Jebakan:** Hitung V = π × 400 × 50 = 20.000π cm³, terus berhenti → SALAH!

**Yang benar:**
- V = 20.000π ≈ 62.800 cm³
- 1 liter = 1000 cm³
- V = 62.800 / 1000 = **62,8 liter**

**Konversi Penting:**
- 1 liter = 1000 cm³ = 1 dm³
- 1 m³ = 1000 liter

#### **Jebakan #4: Tabung Horizontal (Tidur)**

Kadang tabung dibaringkan (horizontal). **Volume tetap sama**, tapi cara berpikir beda:

```
  ____________
 /            \  ← Alas jadi lingkaran tegak
|              |
|______________|
```

**Volume tetap:** V = πr²t
**Yang berubah:** Interpretasi r dan t (tapi rumus sama!)

#### **Jebakan #5: Selimut yang Dicat/Dilabel**

**Soal:** "Tabung dengan r = 7 cm dan t = 20 cm akan diberi label yang menutup selimutnya. Luas label minimum..."

**Jebakan:** Hitung luas permukaan total → SALAH!

**Yang benar:**
- Yang perlu label = selimut saja
- L = 2πrt = 2 × 22/7 × 7 × 20 = **880 cm²**

### **Aplikasi Real-World di SNBT:**

#### **1. Kaleng Minuman**

"Sebuah kaleng minuman berbentuk tabung dengan diameter 6 cm dan tinggi 12 cm. Volume minuman yang dapat ditampung..."

**Solusi:**
- r = 3 cm
- V = π × 9 × 12 = 108π ≈ 339,12 cm³ ≈ **339 mL**

(Fakta: Kaleng soda standar memang sekitar 330-355 mL!)

#### **2. Drum Minyak**

"Drum minyak berbentuk tabung dengan r = 28 cm dan t = 90 cm. Berapa liter minyak yang dapat ditampung?"

**Solusi:**
- V = 22/7 × 784 × 90
- V = 22 × 112 × 90 = 221.760 cm³
- V = **221,76 liter** ≈ 222 liter

#### **3. Kolam Renang Bundar**

"Kolam renang bundar dengan diameter 10 m dan kedalaman 1,5 m diisi air. Volume air... m³"

**Solusi:**
- r = 5 m, t = 1,5 m
- V = π × 25 × 1,5 = 37,5π ≈ **117,75 m³**

**Fun fact:** 1 m³ air = 1000 liter, jadi kolam ini bisa nampung 117.750 liter air!

#### **4. Pipa Air**

"Pipa air dengan diameter dalam 2 cm dan panjang 5 m. Volume air yang mengalir saat pipa penuh..."

**Solusi:**
- r = 1 cm = 0,01 m, t = 5 m
- Samakan satuan: r = 1 cm, t = 500 cm
- V = π × 1 × 500 = 500π ≈ 1570 cm³ ≈ **1,57 liter**

#### **5. Kue Lapis Berbentuk Tabung**

"Kue lapis berbentuk tabung dengan r = 14 cm dipotong menjadi 8 bagian sama besar. Luas permukaan satu potongan... (anggap tinggi kue 6 cm)"

**Ini tricky!** Luas permukaan satu potongan:
- ⅛ selimut luar: ⅛ × 2πrt = ¼πrt
- ⅛ alas + tutup: ¼πr²
- 2 sisi potong (segitiga juring): kompleks...

**Biasanya** yang ditanya lebih simple: "Luas permukaan yang terbuka saat dipotong"

### **Variasi Soal Tabung di SNBT:**

#### **Variasi #1: Tabung Tanpa Alas dan Tutup**

Ini kayak pipa atau ring.

**L = 2πrt** (hanya selimut)

#### **Variasi #2: Tabung Berlubang (Hollow Cylinder)**

Tabung besar dengan tabung kecil di tengahnya.

**V = π(R² - r²)t**

Di mana R = jari-jari luar, r = jari-jari dalam

#### **Variasi #3: Setengah Tabung**

**V = ½πr²t**
**L = πrt + 2rt + πr²** (selimut setengah + 2 sisi tegak + 2 setengah lingkaran)

#### **Variasi #4: Tabung Miring (Oblique Cylinder)**

Volume tetap sama: **V = πr²t**
(t = tinggi tegak lurus, bukan panjang sisi miring!)

### **Hubungan dengan Bangun Ruang Lain:**

**Tabung → Prisma:**
- Tabung = Prisma dengan alas lingkaran
- V = L_alas × t (sama!)

**Tabung → Kerucut:**
- Volume tabung = 3 × volume kerucut (dengan r dan t sama)
- V_tabung = πr²t; V_kerucut = ⅓πr²t

**Tabung → Bola:**
- Ada hubungan menarik: Volume tabung yang tingginya = diameter bola (t = 2r):
  - V_tabung = πr² × 2r = 2πr³
  - V_bola = 4/3πr³
  - Rasio = 3:2

### **Mental Formula Sheet Tabung:**

```
TABUNG (r = jari-jari, t = tinggi)
│
├── Volume
│   ├── V = πr²t
│   └── V = ¼πd²t (dengan diameter)
│
├── Luas Permukaan
│   ├── L_total = 2πr² + 2πrt = 2πr(r + t)
│   ├── L_selimut = 2πrt
│   ├── L_tanpa tutup = πr² + 2πrt = πr(r + 2t)
│   └── L_tanpa alas & tutup = 2πrt
│
└── Hubungan
    ├── d = 2r
    ├── Keliling alas = 2πr
    └── V_tabung = 3 × V_kerucut (r, t sama)
```

### **Practice Your Visualization:**

Coba bayangkan (tanpa lihat gambar):

1. **Kalau tabung dipotong vertikal** (dari atas ke bawah), bentuk potongannya apa?
   → **Persegi panjang** (atau 2 persegi panjang)

2. **Kalau selimut tabung "dibuka" dan diratakan**, jadi bangun apa?
   → **Persegi panjang** dengan p = 2πr, l = t

3. **Kalau tabung dipotong horizontal** (melintang), bentuk potongannya apa?
   → **Lingkaran**

### **Kesalahan Umum yang Harus Dihindari:**

❌ Lupa ubah diameter jadi jari-jari
❌ Pakai r² padahal soal kasih diameter (harusnya d²/4)
❌ Lupa konversi satuan (cm ke m, cm³ ke liter)
❌ Pakai luas permukaan lengkap untuk tabung terbuka
❌ Lupa faktor π di jawaban akhir

✅ Selalu cek: diameter atau jari-jari?
✅ Perhatikan: tabung tutup penuh, tanpa tutup, atau tanpa alas-tutup?
✅ Jangan lupa konversi satuan!
✅ Cek ulang: hasil sudah dikali π belum?

### **Penutup: Tabung = Your Friend!**

Tabung adalah salah satu bangun ruang **paling aplikatif** dan sering banget muncul di SNBT. Kabar baiknya, rumusnya relatif simpel dan konsepnya mirip dengan prisma.

**Key Takeaways:**
✅ V = πr²t (rumus emas!)
✅ L = 2πr(r + t) untuk tabung lengkap
✅ Diameter ≠ Jari-jari (jangan tertukar!)
✅ Tabung = Prisma lingkaran
✅ Perhatikan: tutup ada atau tidak?

Next up: **Kerucut** - tabung yang meruncing jadi satu titik! 🍦🎉

---

Mau lanjut ke Materi 3.2.5 (Kerucut) dan seterusnya? 🚀
