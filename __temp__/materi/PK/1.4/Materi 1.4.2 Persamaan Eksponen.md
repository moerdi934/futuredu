# SECTION 1: Aljabar dan Persamaan
## Topic 1.4: Fungsi Eksponen dan Logaritma

---


## **Materi 1.4.2: Persamaan Eksponen**

### Welcome to the Equation Zone! 🎯

Kalau di materi sebelumnya kita belajar tentang fungsi eksponen dan sifat-sifatnya, sekarang saatnya kita **menyelesaikan persamaan** yang melibatkan eksponen. Ini adalah skill yang super penting, karena soal SNBT itu 80% tentang menyelesaikan persamaan, bukan sekadar memahami konsep!

Persamaan eksponen itu seperti teka-teki: kamu dikasih persamaan dengan variabel di pangkat, dan tugasmu adalah mencari nilai variabel tersebut. Sounds simple? Well, ada trik-trik khusus yang perlu kamu kuasai!

---

### **Prinsip Dasar: Samakan Basisnya!**

Inget rumus emas ini:

**Jika aᶠ⁽ˣ⁾ = aᵍ⁽ˣ⁾, maka f(x) = g(x)**

Artinya: **Kalau basisnya sama, pangkatnya pasti sama!**

Ini adalah senjata utamamu dalam menyelesaikan persamaan eksponen. Sebagian besar soal akan meminta kamu untuk menyamakan basis dulu, baru kemudian menyelesaikan persamaannya.

---

### **Tipe 1: Persamaan Eksponen Bentuk aˣ = aʸ**

Ini adalah bentuk paling dasar dan paling mudah.

**Konsep:** Jika basis sudah sama, langsung samakan pangkatnya!

**Contoh Bacaan:**

Misalnya kamu punya persamaan: **2ˣ = 2⁵**

Karena basisnya sama-sama 2, maka langsung saja: **x = 5**

Easy peasy, right?

Tapi bagaimana kalau bentuknya sedikit lebih rumit?

**2^(x+3) = 2^(2x-1)**

Karena basisnya sama (2 = 2), maka:
- x + 3 = 2x - 1
- 3 + 1 = 2x - x
- 4 = x
- **x = 4**

**Trik SNBT:** Soal kayak gini sering dikasih dengan basis yang "tersembunyi". Misalnya:
- 8 = 2³
- 16 = 2⁴
- 27 = 3³
- 81 = 3⁴
- 125 = 5³

Jadi kalau kamu lihat **8ˣ = 16**, jangan bingung! Ubah jadi basis yang sama:
- (2³)ˣ = 2⁴
- 2³ˣ = 2⁴
- 3x = 4
- **x = 4/3**

---

### **Tipe 2: Persamaan Eksponen yang Perlu Difaktorkan**

Kadang basisnya belum sama, tapi bisa diubah jadi sama dengan faktorisasi.

**Contoh Bacaan:**

**4ˣ = 8**

Pertama, ubah ke basis yang sama (basis 2 adalah yang paling umum):
- (2²)ˣ = 2³
- 2²ˣ = 2³
- 2x = 3
- **x = 3/2**

Atau yang lebih challenging:

**9^(x-1) = 27ˣ**

Ubah ke basis 3:
- (3²)^(x-1) = (3³)ˣ
- 3^(2(x-1)) = 3³ˣ
- 3^(2x-2) = 3³ˣ
- 2x - 2 = 3x
- -2 = x
- **x = -2**

**🎯 Jebakan SNBT:**
Soal suka ngasih basis yang kayaknya nggak berhubungan, padahal sebenarnya bisa! Contoh:
- 25 dan 125 → basis 5
- 8 dan 64 → basis 2
- 27 dan 9 → basis 3

Hafalin perpangkatan 2, 3, 5 sampai pangkat 5 minimal!

---

### **Tipe 3: Persamaan Eksponen Bentuk a^(f(x)) = b**

Ini agak tricky karena ruas kanan bukan bentuk pangkat. Ada dua kemungkinan:

**Kemungkinan 1: b bisa diubah ke basis a**

Contoh: **3ˣ = 9**

Karena 9 = 3², maka:
- 3ˣ = 3²
- **x = 2**

**Kemungkinan 2: b nggak bisa diubah ke basis a**

Contoh: **2ˣ = 5**

Nah ini... harus pakai logaritma! (Tenang, kita akan bahas di materi logaritma nanti)

Untuk sekarang, kamu cukup tau bahwa:
- Kalau b bisa diubah ke basis a → samakan basis
- Kalau b nggak bisa → pakai logaritma (nanti kita bahas)

**Trik:** Di SNBT, kalau bentuknya kayak gini, biasanya b PASTI bisa diubah ke basis a. Jarang banget dikasih yang bener-bener nggak bisa.

---

### **Tipe 4: Persamaan Eksponen dengan Substitusi**

Ini adalah level next! Kamu perlu mengenali pola dan melakukan substitusi variabel.

**Bentuk Umum:** a²ˣ + ka^x + c = 0

Ini mirip persamaan kuadrat, tapi dengan eksponen!

**Strategi:** Misalkan **y = aˣ**, maka **a²ˣ = (aˣ)² = y²**

**Contoh Bacaan:**

**4ˣ - 5(2ˣ) + 4 = 0**

Langkah 1: Ubah 4ˣ jadi (2²)ˣ = 2²ˣ = (2ˣ)²

Jadi persamaannya jadi: **(2ˣ)² - 5(2ˣ) + 4 = 0**

Langkah 2: Misalkan **y = 2ˣ**

Persamaan jadi: **y² - 5y + 4 = 0**

Langkah 3: Faktorkan
- (y - 4)(y - 1) = 0
- y = 4 atau y = 1

Langkah 4: Kembalikan ke 2ˣ
- 2ˣ = 4 → 2ˣ = 2² → **x = 2**
- 2ˣ = 1 → 2ˣ = 2⁰ → **x = 0**

Jadi penyelesaiannya: **x = 2 atau x = 0**

**🔥 Pro Tip:**
- Persamaan kayak gini biasanya punya 2 solusi
- Jangan lupa kembalikan variabel substitusi ke bentuk aslinya!
- Check jawaban dengan substitusi balik ke persamaan awal

---

### **Tipe 5: Persamaan dengan Basis Berbeda yang Nggak Bisa Disamakan**

Kadang kamu ketemu persamaan seperti: **3ˣ = 2^(x+1)**

Basis 3 dan 2 nggak bisa disamakan dengan mudah. Gimana dong?

**Strategi:** Pakai logaritma! (Ini akan kita dalami di materi logaritma)

Tapi untuk SNBT, biasanya soal kayak gini jarang muncul secara langsung. Kalau muncul, biasanya ada "hint" atau bisa disederhanakan dengan cara lain.

**Trik SNBT:** Kalau kamu nemu soal kayak gini dan bingung, coba:
1. Cek apakah ada cara lain untuk menyederhanakan
2. Lihat pilihan jawaban (kalau multiple choice), sering bisa dikerjakan dengan substitusi jawaban
3. Kalau tetap nggak bisa, skip dulu dan kerjakan yang lain (time management!)

---

### **Tipe 6: Persamaan Eksponen Bentuk (f(x))^(g(x)) = (f(x))^(h(x))**

Ini bentuk yang agak berbeda. Basis-nya adalah fungsi f(x), bukan konstanta.

**Hati-hati!** Nggak bisa langsung menyamakan pangkat begitu saja!

**Aturan:**
- Jika f(x) = 1, maka g(x) dan h(x) boleh beda (karena 1 pangkat berapapun = 1)
- Jika f(x) = -1, maka g(x) dan h(x) harus keduanya genap atau keduanya ganjil
- Jika f(x) = 0, maka g(x) dan h(x) harus positif
- **Jika f(x) ≠ 0, 1, -1**, baru boleh menyamakan: g(x) = h(x)

**Contoh Bacaan:**

**(x-2)^(x+1) = (x-2)^(2x-3)**

Kasus 1: x - 2 = 1 → x = 3
- Check: 1^(4) = 1^(3) ✓ Valid!

Kasus 2: x - 2 = -1 → x = 1
- Check: (-1)^(2) = (-1)^(-1) → 1 = -1 ✗ Nggak valid!

Kasus 3: x - 2 = 0 → x = 2
- Check: 0^(3) = 0^(1) → 0 = 0 ✓ Valid! (asalkan pangkatnya positif)

Kasus 4: x - 2 ≠ 0, 1, -1 (x ≠ 0, 1, 3)
- Maka: x + 1 = 2x - 3
- 4 = x
- **x = 4** ✓ Valid!

Jadi penyelesaiannya: **x = 2, 3, atau 4**

**🎯 Jebakan SNBT:**
Soal kayak gini adalah FAVORIT pengecoh! Banyak siswa yang langsung menyamakan pangkat tanpa check kasus-kasus khusus, dan akhirnya kehilangan beberapa solusi atau malah dapat solusi yang salah.

**ALWAYS check:**
- Basis = 1?
- Basis = -1?
- Basis = 0?
- Baru deh samakan pangkat!

---

### **Tipe 7: Sistem Persamaan Eksponen**

Kadang SNBT ngasih dua persamaan eksponen sekaligus, dan kamu harus mencari nilai x dan y.

**Strategi Umum:**
1. Eliminasi atau substitusi (seperti SPLDV biasa)
2. Sering kali perlu ubah ke bentuk yang lebih sederhana dulu
3. Gunakan sifat eksponen untuk menyederhanakan

**Contoh Bacaan:**

Misalkan:
- 2ˣ · 3ʸ = 12
- 2^(x+1) · 3^(y-1) = 8

Dari persamaan pertama: 2ˣ · 3ʸ = 12 = 2² · 3¹

Maka kemungkinan: x = 2 dan y = 1

Check di persamaan kedua:
- 2^(2+1) · 3^(1-1) = 2³ · 3⁰ = 8 · 1 = 8 ✓ Cocok!

Jadi: **x = 2, y = 1**

---

### **Strategi Umum Menyelesaikan Persamaan Eksponen**

Ini adalah algoritma yang bisa kamu ikuti untuk hampir semua soal persamaan eksponen:

**STEP 1: Identifikasi Bentuk**
- Apakah basisnya sudah sama?
- Apakah bisa diubah jadi sama?
- Apakah perlu substitusi?

**STEP 2: Samakan Basis**
- Ubah semua ke basis yang sama (preferably basis terkecil)
- Ingat: 4 = 2², 8 = 2³, 9 = 3², 27 = 3³, dst.

**STEP 3: Sederhanakan**
- Gunakan sifat aᵐ · aⁿ = aᵐ⁺ⁿ
- Gunakan sifat (aᵐ)ⁿ = aᵐⁿ
- Gunakan sifat aᵐ / aⁿ = aᵐ⁻ⁿ

**STEP 4: Samakan Pangkat (jika basis sudah sama)**
- f(x) = g(x)

**STEP 5: Selesaikan Persamaan**
- Gunakan aljabar biasa

**STEP 6: Check Jawaban**
- Substitusi balik ke persamaan awal
- Pastikan tidak ada pembagian dengan 0 atau basis negatif dengan pangkat pecahan

---

### **Sifat-Sifat Eksponen yang Wajib Dikuasai**

Ini adalah tool-kit yang HARUS kamu hafalin:

1. **aᵐ · aⁿ = aᵐ⁺ⁿ**
   - Perkalian dengan basis sama = jumlahkan pangkat

2. **aᵐ / aⁿ = aᵐ⁻ⁿ**
   - Pembagian dengan basis sama = kurangkan pangkat

3. **(aᵐ)ⁿ = aᵐⁿ**
   - Pangkat dari pangkat = kalikan pangkat

4. **(ab)ⁿ = aⁿbⁿ**
   - Pangkat dari perkalian = masing-masing dipangkatkan

5. **(a/b)ⁿ = aⁿ/bⁿ**
   - Pangkat dari pembagian = masing-masing dipangkatkan

6. **a⁰ = 1** (asalkan a ≠ 0)
   - Apapun pangkat 0 = 1

7. **a⁻ⁿ = 1/aⁿ**
   - Pangkat negatif = 1 dibagi pangkat positif

8. **a^(m/n) = ⁿ√(aᵐ)**
   - Pangkat pecahan = akar

---

### **Tips & Trik Khusus SNBT**

**🔥 Trik 1: Hafalkan Perpangkatan Umum**

Ini akan save waktu kamu BANGET:

**Basis 2:**
- 2¹ = 2
- 2² = 4
- 2³ = 8
- 2⁴ = 16
- 2⁵ = 32
- 2⁶ = 64
- 2⁷ = 128
- 2⁸ = 256
- 2⁹ = 512
- 2¹⁰ = 1024

**Basis 3:**
- 3¹ = 3
- 3² = 9
- 3³ = 27
- 3⁴ = 81
- 3⁵ = 243

**Basis 5:**
- 5¹ = 5
- 5² = 25
- 5³ = 125
- 5⁴ = 625

**🔥 Trik 2: Kenali Pola Substitusi**

Kalau kamu lihat:
- a²ˣ dan aˣ → substitusi y = aˣ
- a³ˣ dan aˣ → bisa juga, tapi lebih jarang
- Bentuk a^(2x) + a^(x+1) → faktorkan dulu!

**🔥 Trik 3: Check Jawaban dengan Logika**

Misalnya soal: 2ˣ = 1000
Kamu tau:
- 2¹⁰ = 1024 (mendekati 1000)
- Jadi x harus sekitar 10, nggak mungkin 3 atau 50!

Ini bisa bantu kamu eliminasi jawaban yang obviously salah.

**🔥 Trik 4: Perhatikan Domain**

Ingat:
- Basis harus positif
- Basis nggak boleh 0 atau 1
- Kalau ada akar, isi akar harus ≥ 0

**🎯 Jebakan yang Sering Muncul:**

1. **Lupa Check Basis = 0, 1, atau -1**
   - Bentuk (f(x))^g(x) = (f(x))^h(x) paling sering jebak di sini!

2. **Salah Menggunakan Sifat Eksponen**
   - Sering ketuker: (ab)ⁿ vs a^(bn)
   - Atau: aᵐ + aⁿ ≠ aᵐ⁺ⁿ (ini SALAH!)

3. **Lupa Kembalikan Substitusi**
   - Udah susah payah cari y, tapi lupa kalau yang dicari itu x!

4. **Nggak Check Syarat**
   - Dapat x = -2, tapi ternyata bikin basis jadi negatif atau 0

5. **Terburu-buru Menyamakan Pangkat**
   - Langsung samakan tanpa check apakah basis udah sama

---

### **Perbedaan dengan Pertidaksamaan Eksponen**

Quick preview untuk materi selanjutnya:

| Persamaan (=) | Pertidaksamaan (>, <, ≥, ≤) |
|--------------|----------------------------|
| Cari nilai x yang tepat | Cari range nilai x |
| Basis sama → pangkat sama | Basis sama → arah tanda tergantung basis |
| Solusi biasanya spesifik | Solusi biasanya interval |

Di materi selanjutnya (Pertidaksamaan Eksponen), kamu akan belajar bahwa:
- Jika a > 1: arah pertidaksamaan tetap
- Jika 0 < a < 1: arah pertidaksamaan **BERBALIK**

Tapi itu nanti ya! Sekarang fokus dulu ke persamaan.

---

### **Ringkasan Flow Chart Penyelesaian**

```
Dapat Persamaan Eksponen
         ↓
Apakah basis sudah sama?
    ↙ Ya          Tidak ↘
Samakan         Ubah ke basis
pangkat          yang sama
    ↓                ↓
Selesaikan    Samakan pangkat
persamaan          ↓
    ↓          Selesaikan
Check          persamaan
jawaban             ↓
    ↓          Check jawaban
 DONE!              ↓
                 DONE!
```

---

Nah, sekarang kamu sudah punya senjata lengkap untuk menghadapi persamaan eksponen! Kuncinya adalah:
1. **Samakan basis**
2. **Samakan pangkat**
3. **Selesaikan**
4. **Check!**

Di materi selanjutnya, kita akan naik level lagi ke **Pertidaksamaan Eksponen**, di mana tanda = berubah jadi >, <, ≥, atau ≤. Dan di sana, ada twist menarik yang perlu kamu ketahui! 🚀

---
