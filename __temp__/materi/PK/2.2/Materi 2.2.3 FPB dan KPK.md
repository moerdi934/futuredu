# SECTION 2: Bilangan dan Aritmatika
## Topic 2.2: Bilangan Prima dan Faktorisasi

---


## **Materi 2.2.3: FPB dan KPK**

### **Pengertian FPB (Faktor Persekutuan Terbesar)**

**FPB** atau Faktor Persekutuan Terbesar adalah **faktor terbesar yang sama** dari dua bilangan atau lebih.

Analoginya gini: Kamu dan temanmu punya koleksi mainan. FPB itu kayak mainan yang **kalian berdua punya, dan yang paling besar/berharga**.

**Contoh Sederhana:**
Cari FPB dari 12 dan 18

Faktor 12: {1, 2, 3, 4, 6, 12}
Faktor 18: {1, 2, 3, 6, 9, 18}

Faktor yang sama (persekutuan): {1, 2, 3, 6}
**Faktor persekutuan TERBESAR: 6**

Jadi, FPB(12, 18) = 6

### **Pengertian KPK (Kelipatan Persekutuan Terkecil)**

**KPK** atau Kelipatan Persekutuan Terkecil adalah **kelipatan terkecil yang sama** dari dua bilangan atau lebih.

Analoginya: Kamu dan temanmu jalan bareng ke sekolah. Kamu lewat setiap 4 hari, temanmu setiap 6 hari. KPK itu **hari keberapa kalian ketemu lagi** di jalan.

**Contoh Sederhana:**
Cari KPK dari 4 dan 6

Kelipatan 4: {4, 8, 12, 16, 20, 24, ...}
Kelipatan 6: {6, 12, 18, 24, 30, ...}

Kelipatan yang sama (persekutuan): {12, 24, 36, ...}
**Kelipatan persekutuan TERKECIL: 12**

Jadi, KPK(4, 6) = 12

### **Cara Mencari FPB dengan Faktorisasi Prima**

Ini cara TERCEPAT dan PALING EFISIEN untuk SNBT!

**Langkah-langkahnya:**
1. Faktorisasi prima semua bilangan
2. Ambil **faktor prima yang SAMA**
3. Ambil **pangkat yang TERKECIL**
4. Kalikan semua faktor tersebut

**Contoh 1: FPB dari 24 dan 36**

Faktorisasi:
- 24 = 2³ × 3¹
- 36 = 2² × 3²

Faktor yang sama: 2 dan 3
- Untuk 2: ambil pangkat terkecil → 2² (minimal antara 3 dan 2)
- Untuk 3: ambil pangkat terkecil → 3¹ (minimal antara 1 dan 2)

**FPB = 2² × 3¹ = 4 × 3 = 12**

**Contoh 2: FPB dari 60, 90, dan 120**

Faktorisasi:
- 60 = 2² × 3¹ × 5¹
- 90 = 2¹ × 3² × 5¹
- 120 = 2³ × 3¹ × 5¹

Faktor yang sama di semua bilangan: 2, 3, dan 5
- Untuk 2: ambil min(2,1,3) = 2¹
- Untuk 3: ambil min(1,2,1) = 3¹
- Untuk 5: ambil min(1,1,1) = 5¹

**FPB = 2¹ × 3¹ × 5¹ = 2 × 3 × 5 = 30**

**Tips Kilat FPB:**
✓ Ambil yang **ADA DI SEMUA** bilangan
✓ Ambil **PANGKAT TERKECIL**
✓ Hasil FPB **SELALU ≤ bilangan terkecil** yang dibandingkan

### **Cara Mencari KPK dengan Faktorisasi Prima**

**Langkah-langkahnya:**
1. Faktorisasi prima semua bilangan
2. Ambil **SEMUA faktor prima** yang muncul
3. Ambil **pangkat yang TERBESAR**
4. Kalikan semua faktor tersebut

**Contoh 1: KPK dari 24 dan 36**

Faktorisasi:
- 24 = 2³ × 3¹
- 36 = 2² × 3²

Semua faktor yang muncul: 2 dan 3
- Untuk 2: ambil pangkat terbesar → 2³ (maksimal antara 3 dan 2)
- Untuk 3: ambil pangkat terbesar → 3² (maksimal antara 1 dan 2)

**KPK = 2³ × 3² = 8 × 9 = 72**

**Contoh 2: KPK dari 12, 15, dan 20**

Faktorisasi:
- 12 = 2² × 3¹
- 15 = 3¹ × 5¹
- 20 = 2² × 5¹

Semua faktor yang muncul: 2, 3, dan 5
- Untuk 2: ambil max(2,0,2) = 2²
- Untuk 3: ambil max(1,1,0) = 3¹
- Untuk 5: ambil max(0,1,1) = 5¹

**KPK = 2² × 3 × 5 = 4 × 3 × 5 = 60**

**Tips Kilat KPK:**
✓ Ambil **SEMUA** faktor prima yang ada
✓ Ambil **PANGKAT TERBESAR**
✓ Hasil KPK **SELALU ≥ bilangan terbesar** yang dibandingkan

### **Hubungan Ajaib FPB dan KPK**

Ada rumus super penting yang SERING BANGET keluar di SNBT:

**Untuk dua bilangan a dan b:**
**FPB(a,b) × KPK(a,b) = a × b**

**Contoh:**
a = 12, b = 18
- FPB(12, 18) = 6
- KPK(12, 18) = 36
- Cek: 6 × 36 = 216, dan 12 × 18 = 216 ✓

**Aplikasi Rumus:**
Kalau udah tahu FPB, bisa langsung cari KPK:
**KPK = (a × b) / FPB**

Atau sebaliknya:
**FPB = (a × b) / KPK**

**PENTING:** Rumus ini **HANYA BERLAKU untuk DUA bilangan**! Kalau ada 3 bilangan atau lebih, rumus ini TIDAK berlaku!

**Jebakan SNBT:** Sering ada soal yang kasih 3 bilangan, terus kamu pakai rumus ini. WRONG! Harus tetap pakai faktorisasi prima atau metode lain.

### **Metode Alternatif: Tabel FPB-KPK**

Untuk dua bilangan yang relatif kecil, bisa pakai tabel pembagian prima sekaligus:

**Contoh: FPB dan KPK dari 24 dan 36**

```
   | 24  36
---|--------
2  | 12  18   ← bisa bagi keduanya (masuk FPB)
2  |  6   9   ← bisa bagi keduanya (masuk FPB)
3  |  3   9   ← bisa bagi keduanya (masuk FPB)
3  |  1   3   ← hanya bisa bagi salah satu
   |  1   1
```

**FPB** = kalikan yang bisa bagi keduanya = 2 × 2 × 3 = **12**
**KPK** = kalikan SEMUA pembagi = 2 × 2 × 3 × 3 = **72**

** Kapan pakai metode ini?**
- Kalau bilangannya kecil (<100)
- Kalau perlu cari FPB DAN KPK sekaligus
- Kalau lebih suka cara visual

### **Jebakan-Jebakan SNBT tentang FPB dan KPK**

#### **Jebakan #1: Tertukar Konsep FPB dan KPK**
- **FPB** → ambil yang **SAMA** dan **KECIL** → hasilnya **≤** bilangan terkecil
- **KPK** → ambil **SEMUA** dan **BESAR** → hasilnya **≥** bilangan terbesar

Ingat: **F**PB = **F**aktor = **F**okus yang sama dan **F**oundation (kecil)
**K**PK = **K**elipatan = **K**umpulkan semua dan **K**ombinasi (besar)

#### **Jebakan #2: Pakai Rumus FPB × KPK untuk 3 Bilangan**
Rumus FPB × KPK = a × b **HANYA untuk 2 bilangan**!

Contoh SALAH:
FPB(12,18,24) × KPK(12,18,24) ≠ 12 × 18 × 24

#### **Jebakan #3: Lupa Faktor yang Tidak Ada di Semua Bilangan**
Untuk FPB: hanya ambil yang **ada di SEMUA bilangan**
Untuk KPK: ambil **SEMUA yang ada, meski cuma di satu bilangan**

Contoh: FPB dari 12 dan 25
- 12 = 2² × 3
- 25 = 5²
- Tidak ada faktor yang sama!
- **FPB = 1** (ini disebut **relatif prima**)

#### **Jebakan #4: FPB dari Bilangan Prima**
FPB dari dua bilangan prima **SELALU 1**!

Contoh: FPB(7, 11) = 1
Kenapa? Karena bilangan prima cuma punya faktor 1 dan dirinya sendiri.

#### **Jebakan #5: KPK dari Bilangan yang Satu Kelipatan Lainnya**
Kalau bilangan a habis dibagi bilangan b, maka KPK(a,b) = a (yang lebih besar)

Contoh: KPK(12, 24) = 24
Karena 24 sudah kelipatan dari 12.

### **Tips dan Trik Kilat SNBT**

**1. Cek Hubungan Bilangan Dulu**
- Kalau salah satu kelipatan yang lain → KPK = yang lebih besar
- Kalau keduanya prima → FPB = 1, KPK = a × b
- Kalau salah satu faktor yang lain → FPB = yang lebih kecil

**2. Pakai Faktorisasi Prima untuk Akurasi**
Ini cara paling aman dan cepat untuk SNBT. Apalagi kalau bilangannya besar atau ada 3+ bilangan.

**3. Ingat Rumus Ajaib (Untuk 2 Bilangan)**
FPB × KPK = a × b
Kalau udah tahu salah satu, langsung bisa hitung yang lain!

**4. FPB Selalu Pembagi, KPK Selalu Kelipatan**
- FPB **PASTI bisa membagi** semua bilangan yang dibandingkan
- KPK **PASTI bisa dibagi** oleh semua bilangan yang dibandingkan

**5. Cek Jawaban dengan Logika**
- FPB nggak mungkin lebih besar dari bilangan terkecil
- KPK nggak mungkin lebih kecil dari bilangan terbesar
- Kalau dapat hasil aneh, kemungkinan salah hitung!

---
