# SECTION 2: Bilangan dan Aritmatika
## Topic 2.2: Bilangan Prima dan Faktorisasi

---


## **Materi 2.2.4: Aplikasi FPB dan KPK**

Nah, ini bagian paling seru! Di SNBT, FPB dan KPK jarang ditanya secara teori doang. Biasanya dibungkus dalam **soal cerita** yang kadang bikin kita mikir, "Ini pakai FPB apa KPK sih?"

### **Kapan Pakai FPB? Kapan Pakai KPK?**

Ini **KUNCI UTAMA** yang harus dikuasai:

#### **Pakai FPB kalau:**
✓ Ada kata: **"dibagi rata", "maksimal", "terbanyak", "terbesar", "kelompok sama besar"**
✓ Konsep: **MEMBAGI** sesuatu menjadi bagian-bagian
✓ Contoh situasi: Membagi kue, membagi barang, membuat kelompok, memotong kertas

#### **Pakai KPK kalau:**
✓ Ada kata: **"bersamaan lagi", "minimal", "paling cepat", "terkecil", "bertemu lagi"**
✓ Konsep: **KEJADIAN BERULANG** yang ingin ketemu di waktu yang sama
✓ Contoh situasi: Jadwal berulang, lampu berkedip, rapat rutin, siklus

**Cara Ngafalin:**
- **F**PB = **F**actor = **F**okus **BAGI**
- **K**PK = **K**elipatan = **K**ejadian **BERULANG**

### **Tipe 1: Soal Pembagian Rata (Pakai FPB)**

**Ciri-ciri:**
- Ada beberapa barang dengan jumlah berbeda
- Mau dibagi ke dalam kelompok/kantong
- Setiap kelompok dapat **jumlah yang sama** untuk setiap jenis
- Ditanya: **maksimal berapa kelompok/kantong**

**Contoh Soal:**
Ani punya 24 permen coklat dan 36 permen strawberry. Dia ingin membagi permen-permen tersebut ke dalam beberapa kantong, dimana setiap kantong mendapat jumlah yang sama untuk setiap jenis permen. Berapa maksimal kantong yang bisa dibuat?

**Pembahasan:**
Kata kunci: "dibagi", "jumlah sama", "maksimal kantong"
→ Pakai **FPB**!

24 = 2³ × 3
36 = 2² × 3²

FPB(24, 36) = 2² × 3 = 12

**Jawab: Maksimal 12 kantong**

Cek: 
- Setiap kantong dapat 24/12 = 2 permen coklat
- Setiap kantong dapat 36/12 = 3 permen strawberry ✓

**Variasi Soal:**
"Berapa permen coklat dan strawberry di setiap kantong?"
→ Setelah dapat FPB, bagi bilangan asli dengan FPB
→ Coklat: 24/12 = 2, Strawberry: 36/12 = 3

### **Tipe 2: Soal Kejadian Bersamaan (Pakai KPK)**

**Ciri-ciri:**
- Ada beberapa kejadian yang berulang dengan periode berbeda
- Ditanya: **kapan kejadian itu terjadi bersamaan lagi**
- Keyword: "bersama-sama lagi", "bertemu lagi", "bersamaan"

**Contoh Soal:**
Lampu A berkedip setiap 4 detik, lampu B berkedip setiap 6 detik. Jika pada detik ke-0 kedua lampu berkedip bersamaan, pada detik keberapa mereka akan berkedip bersamaan lagi untuk pertama kalinya?

**Pembahasan:**
Kata kunci: "berkedip bersamaan lagi", "pertama kali"
→ Pakai **KPK**!

4 = 2²
6 = 2 × 3

KPK(4, 6) = 2² × 3 = 12

**Jawab: Detik ke-12**

Cek:
- Lampu A: berkedip di detik 0, 4, 8, **12**, 16, ...
- Lampu B: berkedip di detik 0, 6, **12**, 18, ... ✓

**Variasi Soal:**
"Sampai 1 menit (60 detik), berapa kali mereka berkedip bersamaan?"
→ Bagi waktu total dengan KPK: 60/12 = 5 kali

### **Tipe 3: Soal Campuran (Pola dan Siklus)**

**Contoh Soal:**
Bus A berangkat dari terminal setiap 15 menit. Bus B berangkat setiap 20 menit. Jika pada pukul 06.00 kedua bus berangkat bersamaan, pukul berapa mereka akan berangkat bersamaan lagi?

**Pembahasan:**
Kata kunci: "berangkat bersamaan lagi"
→ Pakai **KPK**!

15 = 3 × 5
20 = 2² × 5

KPK(15, 20) = 2² × 3 × 5 = 60

Berangkat bersamaan lagi setelah 60 menit = 1 jam

**Jawab: Pukul 07.00**

### **Tipe 4: Soal Umur dan Perbandingan**

**Contoh Soal:**
FPB dari umur Budi dan Ani adalah 4 tahun. Jika KPK dari umur mereka adalah 48 tahun, berapa jumlah umur Budi dan Ani?

**Pembahasan:**
Gunakan rumus: FPB × KPK = a × b
4 × 48 = a × b
192 = a × b

Sekarang cari dua bilangan yang:
- Hasil kalinya 192
- FPB-nya 4

Karena FPB = 4, berarti a dan b bisa ditulis:
- a = 4m
- b = 4n
dimana FPB(m,n) = 1 (relatif prima)

4m × 4n = 192
16mn = 192
mn = 12

Pasangan (m,n) yang relatif prima dengan hasil kali 12:
- (3, 4) → a = 12, b = 16

Cek: FPB(12,16) = 4 ✓, KPK(12,16) = 48 ✓

**Jawab: Jumlah umur = 12 + 16 = 28 tahun**

### **Tipe 5: Soal Pemotongan dan Ukuran**

**Contoh Soal:**
Sebuah papan kayu berukuran 120 cm × 180 cm akan dipotong menjadi persegi-persegi kecil yang sama besar tanpa ada sisa. Berapa ukuran maksimal sisi persegi yang bisa dibuat?

**Pembahasan:**
Kata kunci: "dipotong", "sama besar", "tanpa sisa", "maksimal"
→ Pakai **FPB**!

120 = 2³ × 3 × 5
180 = 2² × 3² × 5

FPB(120, 180) = 2² × 3 × 5 = 60

**Jawab: Sisi persegi 60 cm**

Cek:
- 120 cm / 60 cm = 2 kotak (horizontal)
- 180 cm / 60 cm = 3 kotak (vertikal)
- Total: 2 × 3 = 6 persegi ✓

### **Tipe 6: Soal Pengaturan dan Formasi**

**Contoh Soal:**
Dalam sebuah upacara, ada 48 siswa laki-laki dan 64 siswa perempuan. Mereka akan diatur dalam beberapa barisan dengan jumlah siswa laki-laki dan perempuan yang sama di setiap barisan. Berapa maksimal jumlah barisan yang dapat dibentuk?

**Pembahasan:**
Kata kunci: "diatur", "jumlah sama", "maksimal barisan"
→ Pakai **FPB**!

48 = 2⁴ × 3
64 = 2⁶

FPB(48, 64) = 2⁴ = 16

**Jawab: Maksimal 16 barisan**

Setiap barisan:
- Siswa laki-laki: 48/16 = 3 orang
- Siswa perempuan: 64/16 = 4 orang

### **Strategi Mengerjakan Soal Cerita FPB-KPK**

**Step 1: IDENTIFIKASI**
Baca soal dengan teliti, cari kata kunci:
- BAGI/KELOMPOK/MAKSIMAL → FPB
- BERSAMAAN/BERULANG/MINIMAL → KPK

**Step 2: EKSTRAK ANGKA**
Catat semua bilangan yang relevan dalam soal

**Step 3: HITUNG**
- Faktorisasi prima semua bilangan
- Hitung FPB atau KPK sesuai kebutuhan

**Step 4: INTERPRETASI**
Jangan berhenti di angka! Pastikan jawaban sesuai dengan pertanyaan:
- Kalau ditanya "berapa kali", mungkin perlu bagi dengan KPK
- Kalau ditanya "isi tiap kelompok", mungkin perlu bagi dengan FPB

**Step 5: CEK LOGIKA**
Apakah jawaban masuk akal? Misalnya:
- FPB tidak mungkin lebih besar dari bilangan terkecil
- Waktu tidak bisa negatif
- Jumlah kelompok tidak bisa pecahan

### **Jebakan-Jebakan dalam Soal Cerita**

#### **Jebakan #1: Tertukar FPB dan KPK**
Soal bisa dibuat agak membingungkan dengan menggunakan kata-kata yang mirip.

"Berapa MINIMAL kelompok..." → ini KPK? **SALAH!** 
Kalau konteksnya MEMBAGI, tetap pakai FPB!

**Tip:** Fokus ke **KONSEP**, bukan cuma kata "maksimal/minimal"!

#### **Jebakan #2: Lupa Menambah/Mengurangi**
Kadang soal bilang "sudah berjalan 10 menit, kapan ketemu lagi?"
→ Jangan lupa tambahkan 10 menit ke hasil KPK!

#### **Jebakan #3: Satuan Tidak Sama**
"Bus A tiap 2 jam, Bus B tiap 30 menit"
→ **HARUS** samakan satuan dulu! Ubah semua ke menit atau jam.

#### **Jebakan #4: Pertanyaan Berlanjut**
Kadang setelah dapat FPB/KPK, ada pertanyaan lanjutan:
- "Berapa banyak..." → bagi dengan hasil
- "Kapan yang ke-5 kali..." → kalikan hasil dengan 5

#### **Jebakan #5: Info Berlebih**
Tidak semua angka dalam soal perlu dipakai! Pilih yang relevan.

### **Latihan Mental: Quick Check**

Tanpa hitung detail, tebak pakai FPB atau KPK:

1. "Membagi 30 apel dan 45 jeruk ke beberapa anak dengan jumlah sama"
   → **FPB** (membagi, sama, maksimal anak)

2. "Lampu A tiap 5 menit, B tiap 7 menit, kapan bersamaan?"
   → **KPK** (bersamaan, berulang)

3. "Memotong tali 24 m dan 36 m jadi bagian sama panjang maksimal"
   → **FPB** (potong, sama, maksimal panjang)

4. "Pak Ali ke pasar tiap 3 hari, Bu Ani tiap 4 hari, kapan bertemu?"
   → **KPK** (bertemu, berulang)

5. "Menyusun 18 buku dan 24 majalah di rak, setiap rak sama banyak"
   → **FPB** (menyusun, sama, maksimal rak)

Semakin sering latihan, semakin cepat kamu bisa identifikasi!

---
